#!/usr/bin/env node
/*
 * WHY: Vercel Hobby's Fast Origin Transfer allowance is 10 GB, and exceeding a
 *      cap PAUSES THE PROJECT. It has already happened here: Root Cause #104,
 *      52.52 GB measured, every route 402, caused by a render-time image
 *      transform that had been persisted into the database. The tempting edit
 *      in this feature — "just stream the preview through the route, it's only
 *      1 MB" — is invisible in review, passes every other audit, and bills per
 *      request forever.
 * WHAT: No route under src/app/api/admin/sticker-sheets/** may return a binary
 *       body. Routes return JSON; binaries are 5-minute signed GCS URLs.
 *
 * 🛑 STRICT ZERO, NO SUPPRESSION MARKER. A per-line waiver is exactly the shape
 * this rule exists to refuse — the whole feature's budget argument collapses the
 * moment one route is allowed to proxy bytes, because Cloud Storage's own egress
 * allowance is ten times larger and is not a cliff. If a route genuinely must
 * stream, that is a design change to argue for in CLAUDE.md, not a comment.
 *
 * 🛑 It is NOT a general rule. `/api/orders/{id}/code/asset` streams bytes on
 * purpose and correctly: a delivered digital good must not sit behind a 5-minute
 * bearer URL. The difference is that an admin's own scan is not a paid good, so
 * this feature can take the trade that one refused — which is why the rule is
 * scoped to one tree rather than applied globally.
 *
 * Rules:
 *   R1 BINARY_RESPONSE_BODY — `new Response(<buffer-ish>)` in a scoped route
 *   R2 STORAGE_DOWNLOAD_IN_ROUTE — `.download()` / `.createReadStream()` /
 *      `readScanBytes` reached from a scoped route
 *   R3 NO_SCOPED_FILES — the rule found nothing to check, i.e. it is vacuous
 *
 * R3 is the one that earns its place. An audit written before the files it
 * guards passes at zero and reads as enforcement — Root Cause #105's lesson is
 * to name the two things a check compares and confirm that pair can disagree.
 * This rule has no pair until the routes exist, so it says so.
 */

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const SCOPE = join(ROOT, "src", "app", "api", "admin", "sticker-sheets");

/** Buffer-ish expressions that must never be a Response body. */
const BINARY_BODY = [
  /new\s+Response\s*\(\s*new\s+Uint8Array/,
  /new\s+Response\s*\(\s*Buffer\./,
  /new\s+Response\s*\(\s*(?:await\s+)?[a-zA-Z_$][\w$]*\s*(?:\.buffer|\.bytes)\b/,
  /new\s+Response\s*\(\s*(?:await\s+)?(?:buffer|bytes|body|blob|arrayBuffer)\b/i,
  /new\s+Response\s*\(\s*await\s+\w+\.arrayBuffer\s*\(/,
];

/** Ways a route could pull the object into its own process. */
const DOWNLOAD_CALLS = [
  /\.download\s*\(/,
  /\.createReadStream\s*\(/,
  /\breadScanBytes\s*\(/,
  /\breadRunGeometry\s*\(/,
];

function walk(dir) {
  let out = [];
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return out;
  }
  for (const name of entries) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out = out.concat(walk(p));
    else if (/\.(ts|tsx)$/.test(name)) out.push(p);
  }
  return out;
}

/*
 * Comments are stripped before matching. The routes DOCUMENT this rule at
 * length — several of them quote `new Response(` in a header explaining why
 * they do not do it — so a comment-blind audit would fail on its own
 * documentation, which is how an audit gets disabled.
 */
function stripComments(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "))
    .replace(/(^|[^:])\/\/[^\n]*/g, (m, p1) => p1 + " ".repeat(Math.max(0, m.length - p1.length)));
}

const findings = [];
const files = walk(SCOPE);

for (const file of files) {
  const rel = relative(ROOT, file).replace(/\\/g, "/");
  const code = stripComments(readFileSync(file, "utf8"));
  const lines = code.split(/\r?\n/);

  lines.forEach((line, i) => {
    for (const re of BINARY_BODY) {
      if (re.test(line)) {
        findings.push({
          rule: "BINARY_RESPONSE_BODY",
          where: `${rel}:${i + 1}`,
          detail: line.trim().slice(0, 120),
        });
        break;
      }
    }
    for (const re of DOWNLOAD_CALLS) {
      if (re.test(line)) {
        findings.push({
          rule: "STORAGE_DOWNLOAD_IN_ROUTE",
          where: `${rel}:${i + 1}`,
          detail: line.trim().slice(0, 120),
        });
        break;
      }
    }
  });
}

if (files.length === 0) {
  findings.push({
    rule: "NO_SCOPED_FILES",
    where: relative(ROOT, SCOPE).replace(/\\/g, "/"),
    detail:
      "no route files under this tree — the rule has nothing to compare, so a " +
      "zero here means 'not measured', not 'enforced'",
  });
}

if (findings.length > 0) {
  console.error(`audit-sticker-trace-egress: ${findings.length} violation(s)\n`);
  for (const f of findings) {
    console.error(`  [${f.rule}] ${f.where}`);
    console.error(`      ${f.detail}`);
  }
  console.error(
    "\n  Routes under src/app/api/admin/sticker-sheets/** return JSON. Every binary\n" +
      "  is fetched by the browser from a signed GCS URL — see the `asset` route.\n" +
      "  There is no suppression marker: allowing one proxied byte is the design\n" +
      "  change, not the exception. Root Cause #104 paused this project once.",
  );
  process.exit(1);
}

console.log(`audit-sticker-trace-egress: clean ✓ (${files.length} route file(s) checked)`);
