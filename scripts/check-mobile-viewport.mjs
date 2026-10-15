/**
 * ═══════════════════════════════════════════════════════════════════════════
 * MOBILE VIEWPORT CHECK
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Catches the one responsive bug that every other check on this site missed.
 *
 * On a phone, content wider than the screen makes the browser widen the
 * LAYOUT VIEWPORT (window.innerWidth) to fit it — even with
 * `body { overflow-x: hidden }`, which only clips. Nothing scrolls sideways,
 * so a scroll test passes and `body.scrollWidth` looks fine, but every
 * `position: fixed` element now sizes to the wider viewport. The header's
 * menu button ended up at x=569 on a 390px phone: on screen for nobody.
 *
 * Cause, when it happened: `<caption class="sr-only">` inside a horizontally
 * scrolling table. `.sr-only` is position:absolute, the scroll wrapper was
 * position:static, so the caption escaped the scroller. Fix: make scroll
 * wrappers `relative`.
 *
 * The only reliable signal is `window.innerWidth` under real mobile
 * emulation, so that is what this measures.
 *
 * ── Usage ───────────────────────────────────────────────────────────────
 *   1. Start the site:   npm run build && npm start
 *   2. Start Chrome with remote debugging, e.g. on Windows:
 *        "C:\Program Files\Google\Chrome\Application\chrome.exe" ^
 *          --headless=new --remote-debugging-port=9222 about:blank
 *   3. node scripts/check-mobile-viewport.mjs http://localhost:3000
 *
 * Zero dependencies — Node 22+ ships a global WebSocket. Exits 1 on failure.
 */

const BASE = (process.argv[2] ?? "http://localhost:3000").replace(/\/$/, "");
const WIDTHS = [320, 360, 390, 430, 768];

const STATIC_PAGES = [
  "/", "/properties", "/localities", "/ahmedabad", "/ahmedabad/shela",
  "/ahmedabad/shela/3-bhk-flats", "/ahmedabad/under-50-lakh", "/projects",
  "/guides", "/for-builders", "/contact", "/sell", "/about", "/compare",
  "/wishlist", "/map", "/calculators/stamp-duty", "/calculators/affordability",
  "/calculators/rental-yield", "/calculators/home-loan-emi", "/studio/login",
];

let list;
try {
  list = await (await fetch("http://127.0.0.1:9222/json/list")).json();
} catch {
  console.error("No Chrome on :9222. Start it with --remote-debugging-port=9222 (see header).");
  process.exit(2);
}
const target = list.find((t) => t.type === "page");
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));

let seq = 0;
const pending = new Map();
ws.onmessage = (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) {
    const { resolve } = pending.get(m.id);
    pending.delete(m.id);
    resolve(m.result);
  }
};
const send = (method, params = {}) =>
  new Promise((resolve) => {
    const n = ++seq;
    pending.set(n, { resolve });
    ws.send(JSON.stringify({ id: n, method, params }));
  });
const evaluate = async (expr) =>
  (await send("Runtime.evaluate", { returnByValue: true, expression: expr }))?.result?.value;

await send("Page.enable");
await send("Network.enable");
// Start signed out. A leftover studio session turns /studio/login into a
// redirect to the dashboard, so the same URL would test a different page
// depending on what the browser happened to be holding.
await send("Network.clearBrowserCookies");

// Add one real detail page of each dynamic type, found from the site itself.
async function firstLink(from, prefix) {
  await send("Page.navigate", { url: BASE + from });
  await new Promise((r) => setTimeout(r, 3000));
  return evaluate(`document.querySelector('a[href^="${prefix}"]')?.getAttribute("href") ?? null`);
}
await send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
const dynamic = (
  await Promise.resolve([
    await firstLink("/properties", "/property/"),
    await firstLink("/projects", "/projects/"),
    await firstLink("/guides", "/guides/"),
  ])
).filter((h) => h && !STATIC_PAGES.includes(h));

// /compare and /wishlist are empty states until a visitor saves something —
// and the populated compare table is what overflowed (by 2px) once. Seed
// both with two real listings so the pages are checked as they are used.
await send("Page.navigate", { url: BASE + "/properties" });
await new Promise((r) => setTimeout(r, 3000));
await evaluate(`(() => {
  const slugs = [...new Set([...document.querySelectorAll('a[href^="/property/"]')]
    .map((a) => a.getAttribute("href").replace("/property/", "")))].slice(0, 2);
  localStorage.setItem("sbp:shortlist:v1", JSON.stringify(slugs));
  localStorage.setItem("sbp:compare:v1", JSON.stringify(slugs));
  return slugs.length;
})()`);

const PAGES = [...STATIC_PAGES, ...dynamic];
const failures = [];

for (const width of WIDTHS) {
  await send("Emulation.setDeviceMetricsOverride", {
    width, height: 844, deviceScaleFactor: 1, mobile: true, screenWidth: width, screenHeight: 844,
  });
  for (const path of PAGES) {
    await send("Page.navigate", { url: BASE + path });
    await new Promise((r) => setTimeout(r, 1400));
    const v = await evaluate(`(() => {
      const menu = document.querySelector('button[aria-label="Open menu"]');
      const r = menu ? menu.getBoundingClientRect() : null;
      return {
        innerWidth: window.innerWidth,
        menuRight: r ? Math.round(r.right) : null,
      };
    })()`);
    if (!v) continue;
    const viewportWide = v.innerWidth > width + 1;
    // The menu only exists below lg; when present it must be on screen.
    const menuOff = v.menuRight !== null && v.menuRight > width + 1;
    if (viewportWide || menuOff) {
      failures.push({ width, path, ...v });
      console.log(
        `FAIL ${String(width).padStart(4)}px ${path}  layout viewport ${v.innerWidth}px` +
          (menuOff ? `, menu button off-screen at x=${v.menuRight}` : ""),
      );
    }
  }
  console.log(`checked ${width}px`);
}

ws.close();
if (failures.length) {
  console.log(`\n${failures.length} failure(s) across ${PAGES.length} pages x ${WIDTHS.length} widths.`);
  process.exit(1);
}
console.log(`\nAll ${PAGES.length} pages x ${WIDTHS.length} widths: layout viewport equals screen width, menu on screen.`);
process.exit(0);
