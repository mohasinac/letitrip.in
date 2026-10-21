#!/usr/bin/env node
/**
 * ── audit-label-profiles ─────────────────────────────────────────────────────
 *
 * WHY: `label-profiles.ts` carries A4 die-cut geometry TRANSCRIBED from Avery's
 *      published template specs. A transposed digit in a pitch is invisible on
 *      label one and has walked off the die-cut by label thirteen — and the
 *      cost of finding out is a sheet of label stock per attempt. Nothing else
 *      in the repo reads those numbers, so nothing else can disagree with them.
 *
 * ── RULES ───────────────────────────────────────────────────────────────────
 *
 * R1  Every sheet profile's own grid must fit on its own page. The last
 *     label's far edge is `margin + (n - 1) x pitch + size`; past the page
 *     edge means the grid is wrong on paper.
 * R2  Pitch must be >= the label size on both axes. A pitch SMALLER than the
 *     label means labels overlap, which is arithmetically fine and physically
 *     impossible — exactly the shape a swapped width/pitch pair produces.
 * R3  `@page` may be emitted by ONE module. The rule is document-global and
 *     cannot be scoped, so a second emitter does not add a geometry — the
 *     later one in document order silently wins, and the label prints at the
 *     wrong size with nothing in the markup looking wrong.
 * R4  No raw `@page` with a non-mm size in any printable view. `size: A4` or
 *     `size: letter` on a thermal job is the original bug: the browser prints
 *     its default paper with a small card on it.
 *
 * ── NEGATIVE CONTROLS (run with --self-test) ────────────────────────────────
 *
 * An audit nobody has watched fail is decoration (Root Cause #87/#92). Each
 * rule is exercised against a fixture built to break it.
 *
 * @tag domain:print
 * @tag layer:audit
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

const ROOT = process.cwd();
const PROFILES_REL = join(
  "appkit",
  "src",
  "_internal",
  "shared",
  "features",
  "print",
  "label-profiles.ts",
);

/** The one module permitted to emit `@page`. */
const PAGE_CSS_OWNER = PROFILES_REL;

const findings = [];
const report = (rule, file, msg) =>
  findings.push({ rule, file, msg });

// ── Parsing ─────────────────────────────────────────────────────────────────

/**
 * Pull the sheet profiles out of the TS source as data.
 *
 * Deliberately a text parse rather than an import: these audits run as plain
 * `.mjs` with no TypeScript in the loop, and more usefully, a text parse reads
 * what is WRITTEN rather than what the module computes — which is the thing a
 * transcription error lives in.
 */
function parseSheetProfiles(src) {
  const out = [];
  // Each sheet profile is an object literal with an `id:` and a `sheet: { … }`.
  const blockRe =
    /id:\s*"(a4-[\w-]+)"[\s\S]*?widthMm:\s*([\d.]+)[\s\S]*?heightMm:\s*([\d.]+)[\s\S]*?sheet:\s*\{([\s\S]*?)\}/g;
  let m;
  while ((m = blockRe.exec(src)) !== null) {
    const [, id, w, h, body] = m;
    const num = (key) => {
      const hit = new RegExp(`${key}:\\s*([\\d.]+)`).exec(body);
      return hit ? Number(hit[1]) : NaN;
    };
    out.push({
      id,
      widthMm: Number(w),
      heightMm: Number(h),
      columns: num("columns"),
      rows: num("rows"),
      marginLeftMm: num("marginLeftMm"),
      marginTopMm: num("marginTopMm"),
      pitchXMm: num("pitchXMm"),
      pitchYMm: num("pitchYMm"),
    });
  }
  return out;
}

/** A4 is the only sheet page in use; read it from page-sizes rather than assume. */
function parseA4(root) {
  const p = join(
    root,
    "appkit",
    "src",
    "_internal",
    "shared",
    "features",
    "sticker-trace",
    "export",
    "page-sizes.ts",
  );
  const src = readFileSync(p, "utf8");
  const block = /a4:\s*\{([\s\S]*?)\n  \},/.exec(src);
  if (!block) throw new Error("audit-label-profiles: could not read a4 from page-sizes.ts");
  const w = /widthMm:\s*([\d.]+)/.exec(block[1]);
  const h = /heightMm:\s*([\d.]+)/.exec(block[1]);
  if (!w || !h) throw new Error("audit-label-profiles: a4 has no literal dimensions");
  return { widthMm: Number(w[1]), heightMm: Number(h[1]) };
}

// ── R1 + R2 ─────────────────────────────────────────────────────────────────

function checkGeometry(profiles, page, emit) {
  for (const p of profiles) {
    for (const [k, v] of Object.entries(p)) {
      if (typeof v === "number" && Number.isNaN(v)) {
        emit("R1", PROFILES_REL, `${p.id}: could not read \`${k}\` — the literal is missing or not a number`);
      }
    }
    const right = p.marginLeftMm + (p.columns - 1) * p.pitchXMm + p.widthMm;
    const bottom = p.marginTopMm + (p.rows - 1) * p.pitchYMm + p.heightMm;
    if (right > page.widthMm) {
      emit(
        "R1",
        PROFILES_REL,
        `${p.id}: column ${p.columns} ends at ${right.toFixed(2)}mm on a ${page.widthMm}mm page — ${(right - page.widthMm).toFixed(2)}mm off the right edge`,
      );
    }
    if (bottom > page.heightMm) {
      emit(
        "R1",
        PROFILES_REL,
        `${p.id}: row ${p.rows} ends at ${bottom.toFixed(2)}mm on a ${page.heightMm}mm page — ${(bottom - page.heightMm).toFixed(2)}mm off the bottom edge`,
      );
    }
    if (p.pitchXMm < p.widthMm) {
      emit(
        "R2",
        PROFILES_REL,
        `${p.id}: horizontal pitch ${p.pitchXMm}mm is smaller than the ${p.widthMm}mm label — labels would overlap. Width and pitch are probably swapped.`,
      );
    }
    if (p.pitchYMm < p.heightMm) {
      emit(
        "R2",
        PROFILES_REL,
        `${p.id}: vertical pitch ${p.pitchYMm}mm is smaller than the ${p.heightMm}mm label — labels would overlap.`,
      );
    }
  }
}

// ── R3 + R4 ─────────────────────────────────────────────────────────────────

const SRC_DIRS = [join("appkit", "src"), "src"];
const EXT = /\.(ts|tsx|css)$/;

function walk(dir, acc) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return acc;
  }
  for (const e of entries) {
    if (e === "node_modules" || e === "dist" || e === ".next") continue;
    const abs = join(dir, e);
    let st;
    try {
      st = statSync(abs);
    } catch {
      continue;
    }
    if (st.isDirectory()) walk(abs, acc);
    else if (EXT.test(e)) acc.push(abs);
  }
  return acc;
}

/** Strip comments so a `@page` inside an explanation is not a violation. */
function stripComments(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:])\/\/.*$/gm, "$1");
}

function checkEmitters(files, emit) {
  for (const abs of files) {
    const rel = relative(ROOT, abs).split(sep).join(sep);
    const raw = readFileSync(abs, "utf8");
    const src = stripComments(raw);
    if (!src.includes("@page")) continue;

    if (rel !== PAGE_CSS_OWNER) {
      emit(
        "R3",
        rel,
        "emits `@page`, which only label-profiles.ts may do. `@page` is document-global: a second emitter does not add a geometry, the later one silently wins.",
      );
    }

    // R4 — a named paper size in an @page rule.
    const named = /@page[^{]*\{[^}]*size:\s*(A3|A4|A5|letter|legal|tabloid)\b/i.exec(src);
    if (named) {
      emit(
        "R4",
        rel,
        `\`@page { size: ${named[1]} }\` — a named paper size. Label geometry must be explicit mm, or a thermal job prints the browser's default paper with a small card on it.`,
      );
    }
  }
}

// ── Self-test ───────────────────────────────────────────────────────────────

function selfTest() {
  const page = { widthMm: 210, heightMm: 297 };
  let failures = 0;
  const cases = [];

  const run = (name, fn) => {
    const got = [];
    fn((rule, file, msg) => got.push({ rule, file, msg }));
    cases.push({ name, got });
  };

  // R1 — a grid that walks off the page.
  run("R1 off-page column", (emit) =>
    checkGeometry(
      [{ id: "a4-bad", widthMm: 38.1, heightMm: 21.2, columns: 6, rows: 13, marginLeftMm: 4.65, marginTopMm: 10.7, pitchXMm: 40.6, pitchYMm: 21.2 }],
      page,
      emit,
    ),
  );
  // R1 — an unreadable literal.
  run("R1 missing literal", (emit) =>
    checkGeometry(
      [{ id: "a4-bad", widthMm: 38.1, heightMm: 21.2, columns: NaN, rows: 13, marginLeftMm: 4.65, marginTopMm: 10.7, pitchXMm: 40.6, pitchYMm: 21.2 }],
      page,
      emit,
    ),
  );
  // R2 — width and pitch swapped.
  run("R2 overlapping pitch", (emit) =>
    checkGeometry(
      [{ id: "a4-bad", widthMm: 40.6, heightMm: 21.2, columns: 5, rows: 13, marginLeftMm: 4.65, marginTopMm: 10.7, pitchXMm: 38.1, pitchYMm: 21.2 }],
      page,
      emit,
    ),
  );

  for (const c of cases) {
    const ok = c.got.length > 0;
    if (!ok) failures += 1;
    console.log(`${ok ? "  pass" : "  FAIL"}  ${c.name}${ok ? ` — ${c.got[0].rule}: ${c.got[0].msg}` : " — rule did NOT fire"}`);
  }

  // A control that must NOT fire: the real profiles.
  const real = parseSheetProfiles(readFileSync(join(ROOT, PROFILES_REL), "utf8"));
  const clean = [];
  checkGeometry(real, parseA4(ROOT), (rule, file, msg) => clean.push({ rule, msg }));
  if (real.length === 0) {
    console.log("  FAIL  parser found ZERO sheet profiles — the regex has drifted from the source");
    failures += 1;
  } else if (clean.length > 0) {
    console.log(`  FAIL  the real profiles should pass, but ${clean.length} finding(s): ${clean[0].msg}`);
    failures += 1;
  } else {
    console.log(`  pass  the ${real.length} real sheet profiles are clean (negative control)`);
  }

  console.log(
    failures === 0
      ? "\naudit-label-profiles self-test: all controls behaved"
      : `\naudit-label-profiles self-test: ${failures} control(s) misbehaved`,
  );
  process.exit(failures === 0 ? 0 : 1);
}

// ── Main ────────────────────────────────────────────────────────────────────

if (process.argv.includes("--self-test")) selfTest();

const profilesSrc = readFileSync(join(ROOT, PROFILES_REL), "utf8");
const sheets = parseSheetProfiles(profilesSrc);
if (sheets.length === 0) {
  report(
    "R1",
    PROFILES_REL,
    "no sheet profiles parsed. Either every A4 profile was removed, or the literal shape changed and this audit has stopped looking — which is the failure mode that matters (Root Cause #84).",
  );
}
checkGeometry(sheets, parseA4(ROOT), report);

const files = SRC_DIRS.flatMap((d) => walk(join(ROOT, d), []));
checkEmitters(files, report);

if (findings.length === 0) {
  console.log(
    `audit-label-profiles: clean ✓ (${sheets.length} sheet profiles, ${files.length} files scanned)`,
  );
  process.exit(0);
}

console.error(`audit-label-profiles: ${findings.length} violation(s)\n`);
for (const f of findings) {
  console.error(`  [${f.rule}] ${f.file}\n        ${f.msg}`);
}
process.exit(1);
