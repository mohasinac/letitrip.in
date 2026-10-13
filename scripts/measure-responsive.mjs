/**
 * H1 — measure horizontal overflow at four real viewport widths.
 *
 * ## 🛑 Why this is a SCRIPT and not a reading
 *
 * "Does this page work on a phone" is not answerable by looking at the source:
 * the failures are emergent (a 120-char table cell, an 8-crumb breadcrumb row,
 * a `min-w-` on a flex child) and they only appear at a width. And they are
 * invisible on a desktop browser at any zoom, because the body simply gets a
 * horizontal scrollbar that nobody scrolls.
 *
 * So this drives a real Chromium through `@playwright/test`'s bundled browser
 * if present, and otherwise reports that it could not measure — it never
 * reports "clean" without having looked. That distinction is the whole reason
 * the a11y audit's silent skips were worth fixing this week.
 *
 * ## What it measures, and why that metric
 *
 * `documentElement.scrollWidth > innerWidth + 1` is the one objective symptom:
 * the page is wider than the viewport, so the user can scroll sideways. The
 * 1px tolerance is for sub-pixel rounding at fractional device ratios, not a
 * fudge — 2px of overflow is still reported.
 *
 * When it overflows, it names the WIDEST offending element (tag, classes,
 * right edge), because "this page overflows" is not actionable and
 * "`<table>` inside `.appkit-card` reaches 1,204px in a 390px viewport" is.
 *
 * Usage:
 *   node scripts/measure-responsive.mjs                  # default page set
 *   node scripts/measure-responsive.mjs /products /cart  # specific paths
 *
 * @tag domain:quality
 * @tag layer:script
 * @tag access:node-only
 */

const BASE = process.env.RESPONSIVE_BASE_URL ?? "http://localhost:3000";

/** The four widths the plan names: phone, tablet, laptop, desktop. */
const WIDTHS = [
  { label: "390 (iPhone 14)", width: 390, height: 844 },
  { label: "768 (tablet)", width: 768, height: 1024 },
  { label: "1280 (laptop)", width: 1280, height: 800 },
  { label: "1920 (desktop)", width: 1920, height: 1080 },
];

/*
 * One page per SHAPE, not one per route — 774 routes share about a dozen
 * layouts, and measuring all of them would be a report nobody reads. These are
 * the shapes: marketing, a grid, a detail page with a gallery, a deep
 * breadcrumb, a table-heavy dashboard-ish page, a long form, and the two new
 * content pages.
 */
const DEFAULT_PATHS = [
  "/",
  "/products",
  "/categories",
  "/categories/category-dragoon-g/products/sort/relevance/page/1",
  "/parts",
  "/guides",
  "/gst",
  "/collectibles/mumbai",
  "/fees",
  "/cart",
];

const paths = process.argv.slice(2).filter((a) => a.startsWith("/"));
const targets = paths.length > 0 ? paths : DEFAULT_PATHS;

let chromium;
try {
  ({ chromium } = await import("playwright"));
} catch {
  try {
    ({ chromium } = await import("@playwright/test"));
  } catch {
    /*
     * 🛑 Reports that it could NOT measure, and exits non-zero. An
     * unmeasurable run must never read as a clean one — that is the exact
     * failure `audit-a11y`'s silent skips were (it printed `files × PAIRS` for
     * pairs it had never evaluated).
     */
    console.error(
      "✗ measure-responsive: no Playwright browser available, so NOTHING was measured.\n" +
        "  This is not a clean result. Install one (`npx playwright install chromium`)\n" +
        "  or run the tester plugin's browser, then re-run.",
    );
    process.exit(2);
  }
}

const browser = await chromium.launch();
const findings = [];

for (const { label, width, height } of WIDTHS) {
  const ctx = await browser.newContext({ viewport: { width, height } });
  const page = await ctx.newPage();
  for (const path of targets) {
    let status = 0;
    try {
      const res = await page.goto(`${BASE}${path}`, { waitUntil: "load", timeout: 45_000 });
      status = res?.status() ?? 0;
      // The streamed remainder of an RSC page arrives after `load`.
      await page.waitForTimeout(1200);
    } catch (err) {
      findings.push({ label, path, kind: "navigation", detail: String(err).slice(0, 160) });
      continue;
    }

    const result = await page.evaluate(() => {
      const docW = document.documentElement.scrollWidth;
      const winW = window.innerWidth;
      if (docW <= winW + 1) return { overflow: 0, offenders: [] };
      const offenders = [];
      for (const el of Array.from(document.querySelectorAll("body *"))) {
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) continue;
        const right = r.right + window.scrollX;
        if (right > winW + 1) {
          offenders.push({
            tag: el.tagName.toLowerCase(),
            cls: String(el.className ?? "").slice(0, 90),
            right: Math.round(right),
            width: Math.round(r.width),
          });
        }
      }
      offenders.sort((a, b) => b.right - a.right);
      return { overflow: docW - winW, offenders: offenders.slice(0, 4) };
    });

    if (result.overflow > 0) {
      findings.push({ label, path, status, kind: "overflow", ...result });
    }
  }
  await ctx.close();
}

await browser.close();

console.log(`\nmeasure-responsive — ${targets.length} page(s) × ${WIDTHS.length} widths against ${BASE}\n`);
if (findings.length === 0) {
  console.log(`✓ no horizontal overflow at any width (${targets.length * WIDTHS.length} measurements)`);
  process.exit(0);
}

for (const f of findings) {
  if (f.kind === "navigation") {
    console.log(`✗ ${f.label}  ${f.path}\n    could not load: ${f.detail}`);
    continue;
  }
  console.log(`✗ ${f.label}  ${f.path}  — body is ${f.overflow}px wider than the viewport`);
  for (const o of f.offenders) {
    console.log(`    <${o.tag}> w=${o.width} right=${o.right}  ${o.cls}`);
  }
}
console.log(`\n${findings.length} finding(s). Each names the widest element at that width.`);
process.exit(1);
