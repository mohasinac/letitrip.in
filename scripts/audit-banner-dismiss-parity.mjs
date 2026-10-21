#!/usr/bin/env node
/**
 * ── audit-banner-dismiss-parity ──────────────────────────────────────────────
 *
 * WHY: The announcement bar's dismissal is decided in THREE places that cannot
 *      import each other, and a disagreement between any two of them fails
 *      SILENTLY in the direction that restores the bug.
 *
 *        1. `src/app/layout.tsx` — an inline browser script, as a STRING, that
 *           reads `localStorage` before the first paint and sets
 *           `data-banner-dismissed="1"` on `<html>`.
 *        2. `AnnouncementBar.style.css` — the rule that hides the bar when that
 *           attribute is present.
 *        3. `AnnouncementBar.tsx` — the component's own `STORAGE_KEY` and
 *           one-week window, in TypeScript.
 *
 * 🛑 WHY A DRIFT IS INVISIBLE. Rename the storage key in the component and the
 * inline script keeps reading the old one: it finds nothing, never sets the
 * attribute, the bar paints at full height, and the `useEffect` removes it
 * after paint — the top-of-page layout shift returns. Mobile homepage CLS was
 * measured at 0.822 against a 0.1 "good" threshold, and a shift at the top of
 * the document moves everything below it.
 *
 * Nothing errors. The component is correct, the CSS is correct, the script
 * runs without throwing, and the only symptom is a number in a Lighthouse run
 * nobody is looking at. That is the whole case for checking it mechanically.
 *
 * ── RULES ───────────────────────────────────────────────────────────────────
 *
 * R1  The storage key string must be identical in the component and the script.
 * R2  The one-week window must be the same number of milliseconds in both.
 *     The component writes it as an expression (`7 * 24 * 60 * 60 * 1000`);
 *     the script, being a minified string, writes the literal — so this
 *     EVALUATES the component's expression rather than comparing text.
 * R3  The attribute name must match between the script and the stylesheet.
 * R4  The class name must match between the component and the stylesheet.
 * R5  The stylesheet must be reachable from `appkit/src/styles.css`'s @import
 *     chain. `bundle-css.mjs` flattens only that chain, so a JS-only import
 *     ships NOTHING — the exact silent failure `FormShell.style.css` already
 *     records (`.appkit-formshell` appeared zero times in the built dist).
 *
 * ── NEGATIVE CONTROLS (--self-test) ─────────────────────────────────────────
 *
 * @tag domain:homepage
 * @tag layer:audit
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();

const P = {
  script: join("src", "app", "layout.tsx"),
  component: join(
    "appkit", "src", "features", "homepage", "components", "AnnouncementBar.tsx",
  ),
  css: join(
    "appkit", "src", "features", "homepage", "components", "AnnouncementBar.style.css",
  ),
  chain: join("appkit", "src", "styles.css"),
};

function read(rel) {
  try {
    return readFileSync(join(ROOT, rel), "utf8");
  } catch {
    return null;
  }
}

/** Blank comments so a key quoted in an explanation is not mistaken for code. */
function strip(src) {
  const blank = (m) => m.replace(/[^\n]/g, " ");
  return src
    .replace(/\/\*[\s\S]*?\*\//g, blank)
    .replace(/\{\s*\/\*[\s\S]*?\*\/\s*\}/g, blank)
    .replace(/(^|[^:])\/\/[^\n]*/g, (m, p) => p + blank(m.slice(p.length)));
}

export function check(sources, emit) {
  const { script, component, css, chain } = sources;

  if (!script || !component || !css || chain == null) {
    emit("R0", "one of the four files could not be read — a rename or a move");
    return;
  }

  const sc = strip(script);
  const cm = strip(component);

  // R1 — the storage key.
  const keyInComponent = /STORAGE_KEY\s*=\s*"([^"]+)"/.exec(cm)?.[1];
  const keyInScript = /localStorage\.getItem\('([^']+)'\)/.exec(
    // Only the banner script; the file has three other getItem calls.
    sc.slice(sc.indexOf("data-banner-dismissed") - 600, sc.indexOf("data-banner-dismissed") + 600),
  )?.[1];
  if (!keyInComponent) emit("R1", "no `STORAGE_KEY = \"…\"` in AnnouncementBar.tsx");
  else if (!keyInScript) emit("R1", "the inline script near `data-banner-dismissed` reads no localStorage key");
  else if (keyInComponent !== keyInScript) {
    emit(
      "R1",
      `storage key drift — component "${keyInComponent}" vs inline script "${keyInScript}". The script would find nothing, never set the attribute, and the top-of-page layout shift returns.`,
    );
  }

  // R2 — the window, EVALUATED rather than string-compared.
  const expr = /ONE_WEEK_MS\s*=\s*([0-9*\s]+);/.exec(cm)?.[1];
  const literal = /Date\.now\(\)-d\.at<(\d+)/.exec(sc)?.[1];
  if (!expr) emit("R2", "no `ONE_WEEK_MS = …` in AnnouncementBar.tsx");
  else if (!literal) emit("R2", "the inline script has no `Date.now()-d.at<<ms>` window");
  else {
    // Arithmetic only — the regex above admits digits, `*` and whitespace.
    const want = Function(`"use strict";return (${expr})`)();
    if (Number(literal) !== want) {
      emit(
        "R2",
        `dismissal window drift — component ${want}ms vs inline script ${literal}ms. The two disagree about when a dismissal expires, so the bar reappears (or stays hidden) for a stretch nobody chose.`,
      );
    }
  }

  // R3 — the attribute, script vs stylesheet.
  const attrInScript = /setAttribute\('([a-z-]+)','1'\)/.exec(sc)?.[1];
  const attrInCss = /\[\s*([a-z-]+)\s*=\s*"1"\s*\]/.exec(css)?.[1];
  if (!attrInScript) emit("R3", "the inline script sets no `data-…` attribute");
  else if (!attrInCss) emit("R3", "the stylesheet selects on no `[data-…=\"1\"]`");
  else if (attrInScript !== attrInCss) {
    emit("R3", `attribute drift — script sets "${attrInScript}", CSS selects "${attrInCss}". The rule never matches and the bar paints.`);
  }

  // R4 — the class, component vs stylesheet.
  const classInCss = /\.([a-z-]*announcement[a-z-]*)\s*\{/.exec(css)?.[1];
  if (!classInCss) emit("R4", "the stylesheet defines no `.…announcement…` class");
  else if (!cm.includes(classInCss)) {
    emit("R4", `class drift — CSS defines ".${classInCss}", which AnnouncementBar.tsx does not render.`);
  }

  // R5 — reachable from the bundled @import chain.
  if (!chain.includes("AnnouncementBar.style.css")) {
    emit(
      "R5",
      "AnnouncementBar.style.css is not in appkit/src/styles.css's @import chain. `bundle-css.mjs` flattens only that chain, so the rule would ship as NOTHING and CLS would quietly stay where it was — the same silent failure `FormShell.style.css`'s own note records.",
    );
  }
}

// ── Self-test ───────────────────────────────────────────────────────────────

function selfTest() {
  const live = {
    script: read(P.script),
    component: read(P.component),
    css: read(P.css),
    chain: read(P.chain),
  };
  let failures = 0;

  const fire = (name, mutate, rule) => {
    const s = { ...live, ...mutate(live) };
    const got = [];
    check(s, (r, m) => got.push({ r, m }));
    if (got.some((g) => g.r === rule)) console.log(`  pass  ${name} — ${rule} fired`);
    else {
      console.log(`  FAIL  ${name} — ${rule} did NOT fire (got ${got.map((g) => g.r).join(",") || "nothing"})`);
      failures += 1;
    }
  };

  fire("R1 renamed storage key", (l) => ({
    component: l.component.replace(
      /STORAGE_KEY = "[^"]+"/,
      'STORAGE_KEY = "letitrip:banner-v2"',
    ),
  }), "R1");

  fire("R2 window halved", (l) => ({
    component: l.component.replace(/ONE_WEEK_MS = [0-9*\s]+;/, "ONE_WEEK_MS = 3 * 24 * 60 * 60 * 1000;"),
  }), "R2");

  fire("R3 renamed attribute", (l) => ({
    css: l.css.replace('[data-banner-dismissed="1"]', '[data-banner-hidden="1"]'),
  }), "R3");

  fire("R4 renamed class", (l) => ({
    css: l.css.replace(".appkit-announcement-bar", ".appkit-announcement-strip"),
  }), "R4");

  fire("R5 dropped from the @import chain", (l) => ({
    chain: l.chain.replace(/@import "\.\/features\/homepage\/components\/AnnouncementBar\.style\.css";/, ""),
  }), "R5");

  // The real tree must be silent.
  const got = [];
  check(live, (r, m) => got.push({ r, m }));
  if (got.length === 0) console.log("  pass  the real tree is clean (negative control)");
  else {
    console.log(`  FAIL  the real tree reports ${got.length}: [${got[0].r}] ${got[0].m}`);
    failures += 1;
  }

  console.log(
    failures === 0
      ? "\naudit-banner-dismiss-parity self-test: all controls behaved"
      : `\naudit-banner-dismiss-parity self-test: ${failures} control(s) misbehaved`,
  );
  process.exit(failures === 0 ? 0 : 1);
}

if (process.argv.includes("--self-test")) selfTest();

// ── Main ────────────────────────────────────────────────────────────────────

const findings = [];
check(
  {
    script: read(P.script),
    component: read(P.component),
    css: read(P.css),
    chain: read(P.chain),
  },
  (rule, msg) => findings.push({ rule, msg }),
);

if (findings.length === 0) {
  console.log("audit-banner-dismiss-parity: clean ✓ (key, window, attribute, class and @import all agree)");
  process.exit(0);
}

console.error(`audit-banner-dismiss-parity: ${findings.length} violation(s)\n`);
for (const f of findings) console.error(`  [${f.rule}] ${f.msg}`);
process.exit(1);
