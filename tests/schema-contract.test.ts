import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SCHEMA CONTRACT
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * The single most valuable test in this repo right now, because Supabase does
 * not exist yet. Every `.select(...)` in the app is a promise about a column
 * that only gets checked on migration day — and PostgREST does not fail loudly
 * on a bad column in every code path, it can just return nulls. A typo here
 * surfaces as a blank price on a live listing, not as an error.
 *
 * So: parse `supabase/schema.sql` for the real tables and columns, parse every
 * select string in `src/`, and assert the two agree. Run before migrating and
 * the database cannot disagree with the code.
 */

const ROOT = process.cwd();
const SCHEMA = readFileSync(path.join(ROOT, "supabase/schema.sql"), "utf8");

/* ── Parse the schema ──────────────────────────────────────────────────── */

function parseSchema(sql: string): Map<string, Set<string>> {
  const tables = new Map<string, Set<string>>();

  // `create table if not exists <name> ( ... );` — capture the body by
  // bracket depth rather than a lazy regex, because column definitions
  // contain their own parentheses (numeric(12,2), check (...), and so on).
  const re = /create\s+table\s+(?:if\s+not\s+exists\s+)?([a-z_][a-z0-9_]*)\s*\(/gi;
  let m: RegExpExecArray | null;

  while ((m = re.exec(sql))) {
    const name = m[1]!;
    let depth = 1;
    let i = re.lastIndex;
    while (i < sql.length && depth > 0) {
      const ch = sql[i];
      if (ch === "(") depth++;
      else if (ch === ")") depth--;
      i++;
    }
    const body = sql.slice(re.lastIndex, i - 1);
    tables.set(name, parseColumns(body));
  }

  // Generated columns added later with ALTER TABLE still count.
  const alter = /alter\s+table\s+([a-z_][a-z0-9_]*)\s+add\s+column\s+(?:if\s+not\s+exists\s+)?([a-z_][a-z0-9_]*)/gi;
  while ((m = alter.exec(sql))) {
    tables.get(m[1]!)?.add(m[2]!);
  }

  return tables;
}

function parseColumns(body: string): Set<string> {
  const cols = new Set<string>();
  let depth = 0;
  let current = "";
  const parts: string[] = [];

  // Strip comments BEFORE splitting. A comment such as
  // `-- Location. City, locality and geo.` contains a comma, which otherwise
  // splits the column list in the wrong place and loses whatever column the
  // comment was introducing.
  body = body.replace(/--.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "");

  for (const ch of body) {
    if (ch === "(") depth++;
    if (ch === ")") depth--;
    if (ch === "," && depth === 0) {
      parts.push(current);
      current = "";
      continue;
    }
    current += ch;
  }
  parts.push(current);

  for (const raw of parts) {
    const line = raw.trim();
    if (!line) continue;
    // Table-level constraints are not columns.
    if (/^(primary\s+key|foreign\s+key|unique|check|constraint|exclude)\b/i.test(line)) {
      continue;
    }
    const name = /^"?([a-z_][a-z0-9_]*)"?\s/i.exec(line)?.[1];
    if (name) cols.add(name);
  }
  return cols;
}

const TABLES = parseSchema(SCHEMA);

/* ── Collect every select in the app ───────────────────────────────────── */

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (/\.(ts|tsx)$/.test(full)) out.push(full);
  }
  return out;
}

interface SelectSite {
  file: string;
  table: string;
  columns: string;
}

function collectSelects(): SelectSite[] {
  const sites: SelectSite[] = [];

  for (const file of walk(path.join(ROOT, "src"))) {
    const src = readFileSync(file, "utf8");

    // Every `.from("x")` with its offset, so a select can be matched to the
    // nearest one above it.
    const froms: { table: string; at: number }[] = [];
    const fromRe = /\.from\(\s*["'`]([a-z_][a-z0-9_]*)["'`]\s*\)/g;
    let f: RegExpExecArray | null;
    while ((f = fromRe.exec(src))) froms.push({ table: f[1]!, at: f.index });
    if (!froms.length) continue;

    const selRe = /\.select\(\s*(`[^`]*`|"[^"]*"|'[^']*')/g;
    let s: RegExpExecArray | null;
    while ((s = selRe.exec(src))) {
      const prior = froms.filter((x) => x.at < s!.index).pop();
      if (!prior) continue;
      sites.push({
        file: path.relative(ROOT, file),
        table: prior.table,
        columns: s[1]!.slice(1, -1),
      });
    }
  }
  return sites;
}

/**
 * Split a PostgREST select list on top-level commas, so an embedded relation
 * like `builder:builders(id, name)` stays in one piece.
 */
function splitTop(list: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let cur = "";
  for (const ch of list) {
    if (ch === "(") depth++;
    if (ch === ")") depth--;
    if (ch === "," && depth === 0) {
      out.push(cur);
      cur = "";
      continue;
    }
    cur += ch;
  }
  out.push(cur);
  return out.map((x) => x.replace(/\s+/g, " ").trim()).filter(Boolean);
}

/** Checks one select list against one table, recursing into relations. */
function checkList(table: string, list: string, file: string, problems: string[]) {
  const cols = TABLES.get(table);
  if (!cols) {
    problems.push(`${file}: selects from unknown table "${table}"`);
    return;
  }

  for (const token of splitTop(list)) {
    if (token === "*" || token.startsWith("...")) continue;

    const rel = /^(?:([a-z_][a-z0-9_]*)\s*:\s*)?([a-z_][a-z0-9_]*)(?:!\w+)?\s*\((.*)\)$/i.exec(token);
    if (rel) {
      // `alias:table(cols)` — the embedded table owns those columns.
      const target = rel[2]!;
      if (!TABLES.has(target)) {
        problems.push(`${file}: embedded relation "${target}" is not a table in schema.sql`);
        continue;
      }
      checkList(target, rel[3]!, file, problems);
      continue;
    }

    // `alias:column` or a bare column, possibly with a ::cast.
    const name = token.split(":").pop()!.split("::")[0]!.trim();
    if (!name) continue;
    if (!cols.has(name)) {
      problems.push(`${file}: "${table}" has no column "${name}"`);
    }
  }
}

/* ── The tests ─────────────────────────────────────────────────────────── */

describe("supabase/schema.sql", () => {
  test("parses the tables the app depends on", () => {
    for (const expected of [
      "properties", "leads", "projects", "builders", "profiles",
      "site_visits", "testimonials", "property_images", "audit_log",
    ]) {
      assert.ok(TABLES.has(expected), `schema.sql is missing table "${expected}"`);
    }
  });

  test("properties carries the columns the admin table reads", () => {
    const cols = TABLES.get("properties")!;
    for (const c of ["enquiry_count", "view_count", "rera_id", "updated_at", "status", "price"]) {
      assert.ok(cols.has(c), `properties.${c} missing — the studio listings table reads it`);
    }
  });
});

describe("every .select() in src/ matches the schema", () => {
  const sites = collectSelects();

  test("found select sites to check", () => {
    assert.ok(sites.length > 5, `expected several selects, found ${sites.length}`);
  });

  for (const site of sites) {
    test(`${site.file} → ${site.table}`, () => {
      const problems: string[] = [];
      checkList(site.table, site.columns, site.file, problems);
      assert.deepEqual(problems, [], problems.join("\n"));
    });
  }
});
