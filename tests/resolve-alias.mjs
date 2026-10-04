import { existsSync } from "node:fs";
import { pathToFileURL } from "node:url";
import path from "node:path";

const SRC = path.resolve(process.cwd(), "src");
// A bare `@/lib/format` has no extension; try each in turn, then /index.
const CANDIDATES = ["", ".ts", ".tsx", ".mts", ".js", "/index.ts", "/index.tsx"];

export function resolve(specifier, context, next) {
  if (specifier.startsWith("@/")) {
    const base = path.join(SRC, specifier.slice(2));
    for (const ext of CANDIDATES) {
      const full = base + ext;
      if (existsSync(full) && !full.endsWith("/")) {
        return next(pathToFileURL(full).href, context);
      }
    }
  }
  return next(specifier, context);
}
