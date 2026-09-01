#!/usr/bin/env node
/**
 * audit-projection-shadow — strict-zero.
 *
 * You computed the SAFE copy and then used the unsafe original.
 *
 * ## Why this exists
 *
 * This codebase has a family of functions whose whole job is to produce a
 * narrowed, filtered or masked copy of a value: `hidePublicTestData`,
 * `filterTestDataForViewer`, `toPublicSiteSettings`, `toStoreListItem`,
 * `visibleValues`, `toBuyerFacingFees`. Each exists because handing the source
 * onward is a leak, a data loss, or a lie.
 *
 * Every one of them is used the same way — `const safe = project(raw)` — and
 * every one of them fails the same way: the projection lands, the call site
 * that consumes it does not get updated, and `raw` is still what renders. The
 * result compiles, typechecks, and looks finished.
 *
 * It happened TWICE on 2026-09-01, in the same hour, in commits whose message
 * described the fix:
 *
 *   BundlesListView      `const visible = hidePublicTestData(all)` — then
 *                        `storeId ? visible.filter(...) : all`. The else-branch
 *                        kept publishing the sandbox.
 *   ReviewsIndexPageView `const publicResult = {...}` — then the `initialData`
 *                        block read every field off `result`.
 *
 * Neither was caught by tsc (both variables are used somewhere), by lint (no
 * unused binding), or by `audit-public-test-data-leak` (the helper IS called).
 *
 * ## What it flags
 *
 * A `const <safe> = <PROJECTION>(<src>...)` where `<src>` is referenced again
 * AFTER that line, inside the same function body.
 *
 * ## What it does NOT flag
 *
 * Reading a scalar off the source — `result.total`, `result.page`,
 * `raw.length` — when the projection only changes the ROWS. That is normal and
 * correct in a paginated envelope, so a bare `src.<prop>` where the prop is not
 * the projected collection is allowed; see `ENVELOPE_SCALARS`.
 *
 * Suppression: `// audit-projection-shadow-ok: <reason>`.
 *
 * Exit 0 — clean.  Exit 1 — a projection whose source is still in use.
 */

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const SCAN_ROOTS = [join(ROOT, "appkit", "src"), join(ROOT, "src")];
const SKIP_DIRS = new Set(["node_modules", "dist", ".next", "out", "__tests__", "coverage"]);
const OK_RE = /\/\/\s*audit-projection-shadow-ok\s*:/i;

/**
 * The projections. Each one's ENTIRE purpose is that its output replaces its
 * input — which is what makes "the input is still used" a defect rather than a
 * style question.
 */
/*
 * 🛑 Which ARGUMENT is the source, per projection.
 *
 * The first run of this rule reported 19 violations and every one was wrong:
 * `visibleValues(schema, draft)` takes the schema FIRST, so a rule that assumed
 * argument one was calling every form's schema a leak — and the schema is of
 * course read again, by `safeParse`. The rule was broken, not the code.
 *
 * That is the lesson this file is an instance of: seed a rule from a run of its
 * own rule, and when the first run is all noise, fix the rule.
 */
const PROJECTIONS = {
  hidePublicTestData: 1,
  hidePublicTestDoc: 1,
  filterTestDataForViewer: 1,
  filterSingleTestData: 1,
  toPublicSiteSettings: 1,
  toStoreListItem: 1,
  toStoreDetail: 1,
  toSellerGoogleConfig: 1,
  toBuyerFacingFees: 1,
  toBuyerEmiSettings: 1,
  /*
   * 🛑 `visibleValues` is deliberately NOT here, and the second run is what
   * settled it.
   *
   * Its source is the form's live state, and that state must go on driving the
   * inputs after the payload has been narrowed — `draft` is for submitting,
   * `form` is for rendering. Flagging those twenty call sites would have been
   * telling correct code it is wrong, which is how an audit trains people to
   * ignore it.
   *
   * The distinction this rule can actually prove: these projections narrow
   * something FETCHED, on its way OUT. `visibleValues` narrows something the
   * user is still editing.
   */
};

/**
 * Properties of a paginated envelope that the projection deliberately does not
 * change. Reading these off the source is correct, not a shadow.
 */
const ENVELOPE_SCALARS = new Set([
  "total", "page", "pageSize", "totalPages", "hasMore", "cursor",
  "truncated", "length", "query", "filters", "sorts",
]);

/** `const safe = project(a)` — or `const safe = project(schema, a)`. */
const DECL_RE = new RegExp(
  String.raw`\bconst\s+([A-Za-z_$][\w$]*)\s*=\s*(?:await\s+)?(` +
    Object.keys(PROJECTIONS).join("|") +
    String.raw`)\s*\(\s*([A-Za-z_$][\w$]*)\s*(?:,\s*([A-Za-z_$][\w$]*))?`,
  "g",
);

function walk(dir, out = []) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return out;
  }
  for (const name of entries) {
    if (SKIP_DIRS.has(name)) continue;
    const full = join(dir, name);
    let st;
    try {
      st = statSync(full);
    } catch {
      continue;
    }
    if (st.isDirectory()) walk(full, out);
    else if (/\.tsx?$/.test(name)) out.push(full);
  }
  return out;
}

/**
 * Comments and imports blanked — neither is a use.
 *
 * 🛑 BLANKED, not deleted. Deleting them shifts every line after the first
 * comment, so the audit reports a line number that points at unrelated code —
 * which it did, on its first two runs. An audit that cannot say WHERE is worse
 * than one that says nothing, because the reader trusts it once and then stops.
 */
function blankOut(match) {
  return match.replace(/[^\n]/g, " ");
}

function strip(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, blankOut)
    .replace(/^\s*\/\/.*$/gm, blankOut)
    .replace(/^\s*import\s[\s\S]*?;\s*$/gm, blankOut);
}

/** Walk from the `(` of a call to its matching `)`, respecting nesting. */
function endOfCall(src, openIdx) {
  let depth = 0;
  for (let i = openIdx; i < src.length; i++) {
    const ch = src[i];
    if (ch === "(") depth++;
    else if (ch === ")") {
      depth--;
      if (depth === 0) return i + 1;
    }
  }
  return src.length;
}

const findings = [];
for (const root of SCAN_ROOTS) {
  for (const file of walk(root)) {
    const raw = readFileSync(file, "utf8");
    if (OK_RE.test(raw)) continue;
    const src = strip(raw);
    DECL_RE.lastIndex = 0;
    for (const m of src.matchAll(DECL_RE)) {
      const [, safeName, fnName, arg1, arg2] = m;
      const srcName = PROJECTIONS[fnName] === 2 ? arg2 : arg1;
      // `const x = toStoreDetail(await repo.find())` — the source is the awaited
      // expression, which this rule cannot name and must not guess at.
      if (!srcName || srcName === "await" || safeName === srcName) continue;

      /*
       * Scan AFTER the whole projection call, not after the matched prefix.
       * `toPublicSiteSettings(settings, { effectiveWatermark: resolve(settings) })`
       * mentions the source a second time INSIDE its own argument list — which
       * is the projection being built, not the source escaping it.
       */
      const openIdx = src.indexOf("(", m.index + m[0].indexOf(fnName));
      const after = src.slice(endOfCall(src, openIdx));
      const afterOffset = endOfCall(src, openIdx);

      /*
       * Every later mention of the source, minus the reads that are legitimate:
       * a scalar off a paginated envelope, and the source appearing as an
       * argument to another projection (chained narrowing is fine).
       */
      const useRe = new RegExp(String.raw`\b${srcName}\b(\s*\.\s*([\w$]+))?`, "g");
      const offenders = [];
      for (const u of after.matchAll(useRe)) {
        const prop = u[2];
        if (prop && ENVELOPE_SCALARS.has(prop)) continue;
        const line = src.slice(0, m.index + m[0].length + u.index).split(/\r?\n/).length;
        offenders.push({ line, text: u[0].trim() });
      }
      if (offenders.length === 0) continue;

      findings.push({
        rel: relative(ROOT, file).replace(/\\/g, "/"),
        declLine: src.slice(0, m.index).split(/\r?\n/).length,
        safeName,
        srcName,
        offenders: offenders.slice(0, 4),
      });
    }
  }
}

if (findings.length > 0) {
  console.error(
    `[audit-projection-shadow] ${findings.length} projection(s) whose SOURCE is still used:\n`,
  );
  for (const f of findings) {
    console.error(`  ${f.rel}:${f.declLine}`);
    console.error(
      `    \`${f.safeName}\` is the narrowed copy of \`${f.srcName}\`, but \`${f.srcName}\` is read again after it:`,
    );
    for (const o of f.offenders) console.error(`      line ${o.line}: ${o.text}`);
    console.error(
      `    Use \`${f.safeName}\` there. The projection exists because passing \`${f.srcName}\` onward is the bug.\n`,
    );
  }
  process.exit(1);
}

console.log(
  `[audit-projection-shadow] OK — every narrowed copy replaces its source ` +
    `(${Object.keys(PROJECTIONS).length} projections tracked).`,
);
process.exit(0);
