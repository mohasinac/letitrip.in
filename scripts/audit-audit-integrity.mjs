/*
 * audit-audit-integrity.mjs — strict-zero.
 *
 * The audits audit the codebase. Nothing audited the audits, and this session
 * found three that could not fail:
 *
 *   audit-case-corpus              moved one directory deeper without its ROOT
 *                                  moving, so it probed for `tester/tester`,
 *                                  printed "not checked out — skipping" and
 *                                  exited 0. For every corpus. Every run.
 *   audit-tester-checklist-hrefs   had FOUR hardcoded paths into
 *                                  `appkit/src/features/tester/seed-data`,
 *                                  which the corpus move deleted. One printed a
 *                                  plausible "seed file not found, skipping";
 *                                  the other three were swallowed by
 *                                  `catch { /* valid *\/ }`. 2,670 values
 *                                  dropped to 1,170, then to 0 overlays, and it
 *                                  still printed `clean ✓`.
 *   audit-listing-detail-affordance gated every file on the literal string
 *                                  "ListingViewConfig", so hand-rolled lists
 *                                  were invisible: `clean ✓ (66)` while 12 of
 *                                  95 views were dead ends. This is the one the
 *                                  owner reported, from the other end — as a
 *                                  product bug.
 *
 * All three share one shape: **the audit kept reporting in the same voice after
 * it stopped looking.** A skip message reads like a pass, an empty directory
 * reads like no findings, and a narrow entry condition reads like a clean
 * sweep. Root Cause #84, pointed at the tooling instead of the product.
 *
 * ## Rules
 *
 * R1 EVERY HARDCODED PATH AN AUDIT DEPENDS ON MUST RESOLVE.
 *    Objective, needs no judgment, and would have caught both path failures
 *    above on the commit that moved the corpus. A path assembled from literals
 *    is a claim about the tree; if it is false the audit is measuring nothing.
 *
 * R2 A STRICT `audit-*` MUST BE REACHABLE BY SOME GATE.
 *    A script that calls `process.exit(1)` was written to block. If no gate
 *    runs it, it is a file that reads as a guarantee and is not one — strictly
 *    worse than its absence, because its presence stops anyone writing the
 *    check again.
 *
 * 🛑 Both rules were verified by breaking them on purpose. An audit nobody has
 * seen fail is decoration (Root Cause #87), and that applies to this one most
 * of all.
 *
 * EXPORTS: none (CLI)
 *
 * @tag domain:tooling
 * @tag layer:script
 * @tag pattern:audit
 * @tag access:build
 * @tag consumers:run-audits
 * @tag sideEffects:none
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SCRIPT_DIRS = ["scripts", join("appkit", "scripts")];

/**
 * Paths that are legitimately absent in a clean checkout, because they are
 * BUILD OUTPUT. An audit over one of these must stand down when it is missing
 * — that is a real environment check, not a stale path.
 *
 * 🛑 Keep this list short and specific. A directory added here stops R1
 * protecting every path beneath it, which is how the next moved corpus goes
 * unnoticed. Match on a path PREFIX, never a substring.
 */
const BUILD_OUTPUT_PREFIXES = [
  "functions/lib", // tsup snapshot, built by `npm --prefix functions run build`
  "appkit/dist", // built by `npm --prefix appkit run build`
  "node_modules",
  ".next",
  ".media-cache",
  ".build-memory",
  ".tester-runs",
];

/**
 * Paths whose ABSENCE is the point, so R1 must not read it as a stale pointer.
 * Distinct from BUILD_OUTPUT_PREFIXES: those are absent because nobody built
 * them yet; these are absent because an audit succeeded in keeping them gone.
 */
const EXPECTED_ABSENT = new Map([
  [
    "src/app/api/dev",
    "audit-orphan-dev-routes BLOCKS any route here, so an empty tree is the rule working. The mock payment provider and the webhook simulator were deleted 2026-08-17.",
  ],
  [
    "src/app/api/demo/seed/route.ts",
    "Deleted long ago; seeding is the appkit-seed CLI. CLAUDE.md § Seed API Reference already records audit-mock-gating's carve-out for it as unreachable.",
  ],
]);

function stripComments(s) {
  return s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1");
}

const scripts = [];
for (const d of SCRIPT_DIRS) {
  const abs = join(ROOT, d);
  if (!existsSync(abs)) continue;
  for (const f of readdirSync(abs)) {
    if (/^(audit|verify)-.*\.mjs$/.test(f)) scripts.push({ rel: join(d, f), abs: join(abs, f) });
  }
}

const violations = [];

/* ──────────────────────────────── R1 ──────────────────────────────── */

/**
 * Pull out path expressions built ENTIRELY from string literals. Anything with
 * a variable segment is skipped rather than guessed at — an audit reports what
 * it can prove.
 */
/**
 * 🛑 `ROOT` IS PER SCRIPT, AND GETTING THIS WRONG IS THIS AUDIT'S OWN VERSION
 * OF THE BUG IT EXISTS TO CATCH.
 *
 * `scripts/x.mjs` resolves `ROOT` to the repo root; `appkit/scripts/x.mjs`
 * resolves it to `appkit/`. The first draft assumed the repo root for both and
 * reported six appkit scripts as holding dead paths — `"dist/styles.css"`,
 * `"../src"`, `"src/_internal"` — every one of which resolves correctly from
 * `appkit/`. Half the findings were fiction, which is exactly how the two real
 * ones beside them would have been dismissed.
 *
 * So the base directory is read from the SCRIPT, and a script whose `ROOT` is
 * defined in some other shape is SKIPPED and counted rather than guessed at.
 * An audit reports what it can prove.
 */
function rootFor(scriptRel, code) {
  const dir = join(ROOT, dirname(scriptRel));
  const m = /const ROOT\s*=\s*([^;]+);/.exec(code);
  if (!m) return null;
  const init = m[1];

  // Every gate runs from the repo root, so `process.cwd()` is that.
  if (/^process\.cwd\(\)$/.test(init.trim())) return ROOT;

  /*
   * 🛑 EIGHT spellings, one meaning: the script's own directory, then `..`.
   *
   *   join(__dirname, "..")                                       × 28
   *   resolve(dirname(fileURLToPath(import.meta.url)), "..")       × 6
   *   join(dirname(fileURLToPath(import.meta.url)), "..")          × 6
   *   path.resolve(import.meta.dirname, "..")                      × 3
   *   resolve(import.meta.dirname, "..")                           × 1
   *   resolve(import.meta.dirname ?? ".", "..")                    × 1
   *   path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
   *   fileURLToPath(new URL("..", import.meta.url))
   *
   * Enumerating two of them left 65 of 261 scripts unexamined — R1 covering
   * 75% of the audits while printing an unqualified `clean ✓` is the same
   * narrow-measurement-in-a-confident-voice this file exists to stop. So the
   * test is semantic: does the initialiser name the script's own location,
   * and does it step up exactly one level?
   */
  const namesScriptLocation = /__dirname|import\.meta\.dirname|import\.meta\.url/.test(init);
  const stepsUpOne = /"\.\."/.test(init) && !/"\.\.".*"\.\."/.test(init);
  if (namesScriptLocation && stepsUpOne) return join(dir, "..");

  return null; // genuinely unrecognised — count it, never guess it
}

/**
 * 🛑 A PATH IN AN EXCLUSION LIST IS NOT A DEPENDENCY, AND R1 MUST NOT FAIL ON IT.
 *
 * This distinction is the whole difference between a useful rule and a noisy
 * one, and the first draft got it wrong twice:
 *
 *   audit-feature-flags           asserts `src/lib/features.ts` is ABSENT —
 *                                 the env flag module was deleted and must not
 *                                 return. Absence IS the pass, and "repointing"
 *                                 it at the real `src/features.config.ts` made
 *                                 it report "the env feature-flag module is
 *                                 back" about a file that is a different thing.
 *   audit-form-error-summary      lists `features/shell/StepForm.tsx` in its
 *                                 ALLOW array — the primitives exempt from
 *                                 needing a `<FormErrorSummary>`. StepForm was
 *                                 deleted, so the entry is dead and harmless:
 *                                 a stale name in an exclusion list fails OPEN.
 *
 * So a path is only a dependency if the constant holding it is not named like
 * an exclusion. Inferring this from the NAME is weaker than reading the audit,
 * but it is checkable, and the alternative — a hand-curated allowlist — grows
 * forever and is itself the thing that goes stale.
 */
const EXCLUSION_CONST = /\b(?:ALLOW|ALLOWED|ALLOWLIST|EXCLUDE|EXCLUDED|SKIP|EXEMPT|IGNORE|IGNORED|EXPECTED_ABSENT|ABSENT|FORBIDDEN|BANNED|MUST_NOT|GRANDFATHER\w*|STAGED|KNOWN_\w+|LEGACY)\b/;

/** Name of the `const X = …` whose initialiser spans `index`, if any. */
function enclosingConstName(code, index) {
  const before = code.slice(0, index);
  const m = [...before.matchAll(/\bconst\s+([A-Za-z_$][\w$]*)\s*=/g)].pop();
  return m ? m[1] : null;
}

/**
 * Is this constant one whose EXISTENCE is the violation?
 *
 * `if (existsSync(X))` — positive, no `!` — means the audit fails when X is
 * present, so X being absent is the rule working and R1 must stay quiet.
 * `audit-feature-flags` is the case: `const FEATURES_MODULE`, commented *"the
 * module itself must stay gone"*, because all 15 env flags were `true` in
 * every environment while guarding 68 routes.
 *
 * This is checked from the USAGE rather than the name, which is why it needs
 * no curation — a hand-maintained "expected absent" list is itself a thing
 * that goes stale, and this audit exists because of stale lists.
 */
function absenceIsThePass(code, constName) {
  if (!constName) return false;
  const positive = new RegExp(`if\\s*\\(\\s*existsSync\\(\\s*${constName}\\s*\\)`);
  const negative = new RegExp(`if\\s*\\(\\s*!\\s*existsSync\\(\\s*${constName}\\s*\\)`);
  return positive.test(code) && !negative.test(code);
}

function literalPaths(code, scriptRel, scriptRoot) {
  const found = [];
  const scriptDir = join(ROOT, dirname(scriptRel));

  // join(ROOT, "a", "b")  ·  resolve(ROOT, "a/b")  ·  join(__dirname, "..", "x")
  for (const m of code.matchAll(/\b(?:join|resolve)\(\s*([A-Za-z_$][\w$]*)\s*,\s*((?:"[^"]*"\s*,\s*)*"[^"]*")\s*\)/g)) {
    const [, base, argsRaw] = m;
    const segs = [...argsRaw.matchAll(/"([^"]*)"/g)].map((x) => x[1]);
    if (!segs.length) continue;
    let baseDir;
    if (base === "ROOT") baseDir = scriptRoot;
    else if (base === "__dirname") baseDir = scriptDir;
    else continue;
    if (!baseDir) continue;
    const owner = enclosingConstName(code, m.index ?? 0);
    if (owner && EXCLUSION_CONST.test(owner)) continue;
    if (absenceIsThePass(code, owner)) continue;
    found.push({ expr: `${base}, ${segs.map((s) => `"${s}"`).join(", ")}`, abs: resolve(baseDir, ...segs) });
  }

  // resolve(process.cwd(), "appkit/dist") — cwd is the repo root for every gate.
  for (const m of code.matchAll(/\bresolve\(\s*process\.cwd\(\)\s*,\s*"([^"]*)"\s*\)/g)) {
    found.push({ expr: `process.cwd(), "${m[1]}"`, abs: resolve(ROOT, m[1]) });
  }

  return found;
}

function isBuildOutput(abs) {
  const rel = relative(ROOT, abs).split("\\").join("/");
  return BUILD_OUTPUT_PREFIXES.some((p) => rel === p || rel.startsWith(`${p}/`));
}

let unresolvableRoots = 0;
for (const s of scripts) {
  const code = stripComments(readFileSync(s.abs, "utf8"));
  const scriptRoot = rootFor(s.rel, code);
  if (/\bROOT\b/.test(code) && !scriptRoot) {
    unresolvableRoots += 1;
    continue;
  }
  for (const p of literalPaths(code, s.rel, scriptRoot)) {
    if (isBuildOutput(p.abs)) continue;
    if (existsSync(p.abs)) continue;
    const rel = relative(ROOT, p.abs).split("\\").join("/");
    if (EXPECTED_ABSENT.has(rel)) continue;
    violations.push({ rule: "R1", script: s.rel, detail: `path does not exist: ${rel}  [${p.expr}]` });
  }
}

/* ──────────────────────────────── R2 ──────────────────────────────── */

/*
 * The four ways an audit runs. The first draft of this check matched basenames
 * in run-audits.mjs alone and reported 51 unreachable — every appkit script
 * invoked by PATH through appkit's own chain looked orphaned. Resolve all four
 * or the rule is noise, and 49 false positives is how a real finding gets
 * dismissed with the rest.
 */
const gateTexts = [join(ROOT, "scripts", "run-audits.mjs"), join(ROOT, "package.json"), join(ROOT, "appkit", "package.json"), join(ROOT, "scripts", "claude-hooks", "check-on-stop.mjs")]
  .filter((p) => existsSync(p))
  .map((p) => readFileSync(p, "utf8"))
  .join("\n");

/**
 * Audits deliberately not wired, each with the reason it is allowed to sit
 * unreachable. 🛑 This list may only SHRINK — an entry is a known gap, not a
 * licence. Both current entries are strict and currently RED; registering one
 * means draining its findings first.
 */
const UNWIRED_ALLOWED = new Map([
  [
    "audit-pii-read-sites.mjs",
    "Strict and red: RAW_DOC_ESCAPES=63 · BRAND_DEFEATING_CAST=3. Belongs to the ciphertext-by-default migration (CLAUDE.md § 'Ciphertext-by-default'), which is blocked on branding one repository at a time so tsc can enumerate the readers. Registering it before that drains blocks every commit.",
  ],
  [
    "audit-raw-money-math.mjs",
    "Strict and red on live sites incl. shipping/quote.ts and the sticker-trace vectoriser. Needs each site triaged as money vs. non-money percentage arithmetic; its own header offers a per-line marker for the latter.",
  ],
]);

for (const s of scripts) {
  const base = s.rel.split(/[\\/]/).pop();
  if (!base.startsWith("audit-")) continue; // verify-* are hand-run provers by convention
  const code = stripComments(readFileSync(s.abs, "utf8"));
  if (!/process\.exit\(1\)/.test(code)) continue; // report-only: nothing claimed
  if (gateTexts.includes(base)) continue;
  if (UNWIRED_ALLOWED.has(base)) continue;
  violations.push({
    rule: "R2",
    script: s.rel,
    detail: "strict (calls process.exit(1)) but no gate names it — register it in scripts/run-audits.mjs, or delete it",
  });
}

/* ──────────────────────────────── report ──────────────────────────── */

if (violations.length) {
  console.error(`audit-audit-integrity: ${violations.length} violation(s).\n`);
  for (const v of violations) console.error(`  [${v.rule}] ${v.script}\n          ${v.detail}`);
  console.error(`
R1 — an audit's hardcoded path is a claim about the tree. When it is false the
     audit measures nothing, and says so in a voice indistinguishable from a
     pass. Repoint it; do not wrap it in a catch.
R2 — a strict audit nothing runs reads as a guarantee and is not one.`);
  process.exit(1);
}

const strict = scripts.filter((s) => {
  const b = s.rel.split(/[\\/]/).pop();
  return b.startsWith("audit-") && /process\.exit\(1\)/.test(stripComments(readFileSync(s.abs, "utf8")));
}).length;
console.log(
  `audit-audit-integrity: clean ✓ (${scripts.length} script(s); ${strict} strict; ` +
    `${UNWIRED_ALLOWED.size} known-unwired; ${unresolvableRoots} ROOT shape(s) unresolved)`,
);
