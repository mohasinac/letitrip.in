#!/usr/bin/env node
/**
 * audit-silent-degrade — a failure that produces a plausible answer.
 *
 * ## Why this exists
 *
 * Every bug the 2026-08 search/PII migration surfaced returned HTTP 200 with
 * rows that looked fine. Not one of them threw, logged, or rendered an error
 * state. The recurring shape is a data fetch whose failure is converted into an
 * empty value that is indistinguishable from a legitimately empty result:
 *
 *     const rows = await productRepository.list(model).catch(() => null);
 *     //                                              ^^^^^^^^^^^^^^^^^^
 *     // FAILED_PRECONDITION (missing composite index) -> null -> "no results"
 *
 * That is Root Cause #59: four SSR listing views pushed an `inStock` inequality
 * into a query that needed an index nobody had declared, and the resulting
 * `FAILED_PRECONDITION` was swallowed into a bare empty grid. The page was
 * *wrong*, not broken, so nobody could point at it.
 *
 * ## What this does NOT cover — deliberately, to avoid four overlapping audits
 *
 *   bare `catch {}`               -> audit-empty-catch          (strict, 0 today)
 *   `.catch(console.error)`       -> audit-console-catch        (strict)
 *   `.catch(() => {})` on fetch   -> audit-silent-fetch-catch   (strict)
 *   catch not calling normalizeError -> audit-catch-normalize   (strict)
 *
 * This one owns the gap those four leave: a fetch failure turned into a VALUE.
 *
 * ## R1 SWALLOWED_FETCH
 *
 * `.catch(() => null | [] | undefined | ({}))` on a call that reads data.
 *
 * The discrimination that makes this rule usable rather than noise: an empty
 * body IS a real outcome for a parse, so `res.json().catch(() => null)` is
 * correct and exempt. A repository read has no such reading — `null` there can
 * only mean "the query failed and I decided not to say".
 *
 * Satisfied by logging the failure with the collection named, so an operator
 * can find it:
 *
 *     .catch((err) => { serverLogger.warn("products.list failed", { err }); return null; })
 *
 * ## R2 NORMALIZE_THEATRE
 *
 * `void normalizeError(err)` as the ONLY statement in a catch block.
 *
 * `normalizeError` types the value; it does not report it. A catch whose entire
 * body is that call satisfies `audit-catch-normalize` while discarding the
 * error just as completely as `catch {}` would — with the added cost of looking
 * handled. Either log it, or say in a comment why the failure cannot matter.
 *
 * ## R3 UNDECLARED_RETRY
 *
 * A catch that deletes a request parameter and re-issues the call, without
 * marking the response `degraded`.
 *
 * `/api/blog` did exactly this: on a missing-index error it deleted `q` and
 * returned the UNFILTERED list as search results with a 200. Someone searching
 * "dranzer" got all 18 posts and had no way to tell. Serving something is a
 * defensible choice; serving it silently is not — see `withDegraded`
 * (appkit/src/errors/degraded.ts).
 *
 * ## Staging
 *
 * REPORT-ONLY AGAIN as of 2026-08-29, and this is not a regression in the
 * codebase — it is a regression in what the audit could SEE.
 *
 * `receiverBefore` used to stop at a newline, so a chained call formatted
 * across lines produced an EMPTY receiver and was counted "unclassified"
 * rather than reported. 33 sites were invisible that way, including
 * bid-actions.ts:164 — the exact site this header calls out. Fixing the walk
 * surfaced 17 genuine swallows that had never been triaged.
 *
 * So the honest state is: every swallow the audit could previously prove is
 * fixed, and 17 newly-visible ones are not. Flip back to strict when they are.
 * `MIGRATE=strict` fails today and is what the burn-down should run against.
 *
 * ORIGINALLY: 292 R1 sites existed at introduction, so this shipped
 * report-only: strict-zero on day one would have forced either a mass rewrite
 * or a marker spray, and marker spray is the anti-pattern rather than the fix
 * (Root Cause #22). The count reached 0 on 2026-08-29, which is exactly the
 * condition this staging was waiting for, so any violation now FAILS the run.
 * `MIGRATE=report` downgrades it to a warning for a local sweep.
 *
 * Note for the next swallow you are tempted to justify with prose: R2's
 * exemption reads the line immediately ABOVE the `catch`, not the body. That is
 * deliberate — the reason belongs where you decide to swallow, not buried after
 * it — and it must be one substantive line, not a wrapped block whose last line
 * is a short tail.
 *
 * Suppression: `// audit-silent-degrade-ok: <reason>` on the line or the one
 * above. A real reason, not "intentional".
 */

import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";

const REPO_ROOT = process.cwd();
const SCAN_ROOTS = [join(REPO_ROOT, "appkit", "src"), join(REPO_ROOT, "src")];
const EXCLUDED_DIRS = new Set([
  "node_modules", "dist", ".next", "out", "coverage", "seed",
]);
const OK_RE = /\/\/\s*audit-silent-degrade-ok\s*:/i;
const STRICT = process.env.MIGRATE === "strict";

/**
 * Parsing a body: an absent/!JSON body is a REAL outcome, so collapsing it to
 * null is correct rather than a swallow. These are the only receivers where
 * that is true.
 */
const BODY_PARSE = /\.(json|text|arrayBuffer|formData|blob)\(\s*\)\s*$/;

/**
 * A read whose failure cannot be distinguished from emptiness by the caller.
 * Deliberately conservative — an unmatched receiver is reported as UNCLASSIFIED
 * rather than failed, so the rule never guesses.
 */
const DATA_FETCH = [
  /[Rr]epository\.\w+\(/,
  /\b(get|list|find|fetch|load|query|count)[A-Z]\w*\(/,
  /\.(get|where|orderBy|limit)\(\s*\)?$/,
  /\bfetch\(/,
  /\b(apiClient|adminDb|db)\.\w+\(/,
];

function* walk(root) {
  let entries;
  try { entries = readdirSync(root, { withFileTypes: true }); } catch { return; }
  for (const e of entries) {
    if (EXCLUDED_DIRS.has(e.name)) continue;
    const full = join(root, e.name);
    if (e.isDirectory()) yield* walk(full);
    else if (/\.(ts|tsx)$/.test(e.name) && !e.name.endsWith(".d.ts")) yield full;
  }
}

/** Blank comments so prose describing a bug never trips its own rule. */
function stripComments(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "))
    .replace(/(^|[^:])\/\/[^\n]*/g, (m, p1) => p1 + " ".repeat(m.length - p1.length));
}

/**
 * Walk back from a `.catch(` to the start of the expression it terminates, so
 * the RECEIVER can be classified. Bracket-aware: a regex would stop at the
 * first `(` and misread every chained call (the false-negative that hid the
 * cart violation in Root Cause #29).
 */
function receiverBefore(code, catchIdx) {
  let i = catchIdx - 1;
  let depth = 0;
  // Bounded so a region without semicolons cannot walk to byte 0.
  const floor = Math.max(0, catchIdx - 600);
  while (i >= floor) {
    const c = code[i];
    if (c === ")" || c === "]" || c === "}") depth++;
    else if (c === "(" || c === "[" || c === "{") {
      if (depth === 0) break;
      depth--;
    } else if (depth === 0 && c === ";") break;
    // NOTE: `\n` is deliberately NOT a stop. It used to be, and that is why 33
    // sites reported an EMPTY receiver and were silently skipped — a chained
    // call formatted across lines is one expression:
    //
    //     const previousWinner = await bidRepository
    //       .getWinningBid(productId)
    //       .catch(() => null);
    //
    // Stopping at the newline meant the walk found nothing to classify, so the
    // audit counted it "unclassified" rather than reporting it. That hid
    // bid-actions.ts:164 — the exact site this audit's own header calls out,
    // where a Firestore outage is indistinguishable from "this auction has no
    // bids" and the code then writes a bid against stale state.
    i--;
  }
  return code.slice(i + 1, catchIdx).trim();
}

const findings = [];
function report(file, line, rule, message) {
  findings.push({ file, line, rule, message });
}

let unclassified = 0;

for (const root of SCAN_ROOTS) {
  for (const file of walk(root)) {
    const rel = relative(REPO_ROOT, file).replace(/\\/g, "/");
    const raw = readFileSync(file, "utf8");
    const code = stripComments(raw);
    const rawLines = raw.split(/\r?\n/);
    const lineAt = (idx) => code.slice(0, idx).split(/\r?\n/).length;
    const suppressed = (line) =>
      OK_RE.test(`${rawLines[line - 2] ?? ""}\n${rawLines[line - 1] ?? ""}`);

    // ---- R1 ---------------------------------------------------------------
    const r1 = /\.catch\(\s*\(\s*\)\s*=>\s*(null|undefined|\[\]|\(\{\}\))\s*\)/g;
    let m;
    while ((m = r1.exec(code)) !== null) {
      const line = lineAt(m.index);
      if (suppressed(line)) continue;
      const recv = receiverBefore(code, m.index);
      if (BODY_PARSE.test(recv)) continue;
      if (!DATA_FETCH.some((re) => re.test(recv))) {
        unclassified++;
        // `LIST_UNCLASSIFIED=1` dumps what was skipped. The count alone invites
        // "strict-zero means zero swallows", which it does not — it means zero
        // PROVABLE ones. Being able to read the skipped receivers is what makes
        // that claim checkable instead of a footnote.
        if (process.env.LIST_UNCLASSIFIED) {
          console.error(`  [unclassified] ${rel}:${lineAt(m.index)}  recv=${recv.slice(-70)}`);
        }
        continue;
      }

      // A logged failure is not a silent one.
      const window = code.slice(Math.max(0, m.index - 400), m.index + 400);
      if (/\b(serverLogger|logger|console)\.(warn|error)\(/.test(window)) continue;

      report(rel, line, "SWALLOWED_FETCH",
        `\`${m[0]}\` on a data read (\`${recv.slice(-60)}\`). The failure becomes a ` +
        `value the caller cannot tell from a legitimately empty result — this is ` +
        `Root Cause #59's exact shape. Log it with the collection named, or return ` +
        `a degraded response.`);
    }

    // ---- R2 ---------------------------------------------------------------
    //
    // R2 accepts a substantive comment; R1 does not. That asymmetry is the
    // point, not an inconsistency.
    //
    // R2 asks "log it, OR say why the failure cannot matter", so prose IS a
    // valid answer — and sometimes the only one. A logger that catches its own
    // `localStorage.setItem` failure cannot log it without recursing, and
    // `reportClientError` must never throw from inside the caller's error
    // handler. Both already explain themselves on the same line; flagging the
    // two places where swallowing is MANDATORY is how an audit teaches people
    // to ignore it.
    //
    // R1 is a different question — whether the CALLER can distinguish failure
    // from emptiness. A comment does not help the caller, so only a log or the
    // formal marker satisfies it.
    //
    // "Substantive" is >= 25 chars so `/* swallow */` does not qualify while
    // "logger must not crash the app" does.
    const r2 = /catch\s*\([^)]*\)\s*\{\s*void\s+normalizeError\([^)]*\)\s*;?\s*\}/g;
    while ((m = r2.exec(code)) !== null) {
      const line = lineAt(m.index);
      if (suppressed(line)) continue;
      const nearby = `${rawLines[line - 2] ?? ""}\n${rawLines[line - 1] ?? ""}\n${rawLines[line] ?? ""}`;
      const prose = (nearby.match(/(?:\/\/|\/\*)\s*([^*/\n][^\n]*)/g) ?? [])
        .map((c) => c.replace(/^\s*(\/\/|\/\*)\s*/, "").replace(/\*\/\s*$/, "").trim())
        .find((c) => c.length >= 25 && !/^audit-/i.test(c));
      if (prose) continue;
      report(rel, line, "NORMALIZE_THEATRE",
        `\`void normalizeError(err)\` is this catch's ONLY statement. That types ` +
        `the error without reporting it — as silent as \`catch {}\`, but it looks ` +
        `handled and it satisfies audit-catch-normalize. Log it, or state in a ` +
        `comment why the failure cannot matter.`);
    }

    // ---- R3 ---------------------------------------------------------------
    const r3 = /catch\s*\([^)]*\)\s*\{[\s\S]{0,600}?\}/g;
    while ((m = r3.exec(code)) !== null) {
      const body = m[0];
      if (!/searchParams\.delete\(|\.delete\(["'][^"']+["']\)/.test(body)) continue;
      if (/degraded/i.test(body)) continue;
      const line = lineAt(m.index);
      if (suppressed(line)) continue;
      report(rel, line, "UNDECLARED_RETRY",
        `This catch removes a request parameter and retries without marking the ` +
        `response degraded. /api/blog did this — deleted \`q\` on a missing-index ` +
        `error and returned the UNFILTERED list as search results with a 200. Use ` +
        `withDegraded() so the caller can tell.`);
    }
  }
}

const byRule = findings.reduce((a, f) => ((a[f.rule] = (a[f.rule] ?? 0) + 1), a), {});
const summary = Object.entries(byRule).map(([r, n]) => `${r}=${n}`).join(" · ") || "none";

if (findings.length > 0) {
  const out = STRICT ? console.error : console.log;
  out(`[audit-silent-degrade] ${findings.length} finding(s) — ${summary}\n`);
  for (const f of findings.slice(0, STRICT ? findings.length : 25)) {
    out(`  ${f.file}:${f.line}  [${f.rule}]`);
    out(`    ${f.message}\n`);
  }
  if (!STRICT && findings.length > 25) {
    out(`  … ${findings.length - 25} more. Full list: MIGRATE=strict node scripts/audit-silent-degrade.mjs`);
  }
  out(`Suppression: // audit-silent-degrade-ok: <reason>`);
  if (STRICT) process.exit(1);
  console.log(
    `\n  REPORT-ONLY. ${unclassified} more \`.catch(() => …)\` site(s) had a receiver ` +
    `this audit could not classify and were NOT counted — it reports what it can ` +
    `prove, never what it guesses.\n  Run with MIGRATE=strict to fail.`,
  );
  process.exit(0);
}

console.log(`[audit-silent-degrade] OK — 0 findings (${unclassified} unclassified receiver(s) skipped)`);
