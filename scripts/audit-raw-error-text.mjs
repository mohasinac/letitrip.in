#!/usr/bin/env node
/**
 * audit-raw-error-text.mjs — an error's own text is never user copy.
 *
 * WHY
 *   A thrown value's `.message` is written for a developer. Showing it to a user
 *   is at best noise and at worst a leak: this codebase rendered a Node
 *   `MODULE_NOT_FOUND`, complete with `/var/task/.next/server/chunks/...` and a
 *   full require stack, inside the "Place your bid" modal (Root Cause #86).
 *
 *   The dominant shape is subtler than a bare `err.message`:
 *
 *     showToast(err instanceof Error ? err.message : "Could not save.", "error")
 *
 *   That ternary is INVERTED relative to intent — the authored sentence shows
 *   only when the value is *not* an Error, i.e. almost never, and the raw
 *   message shows in the normal case. Five sites are worse still
 *   (`err.message ?? "…"`), where the fallback is unreachable because `.message`
 *   on an `Error` is always a string.
 *
 * THE FIX — one existing helper, `toUserMessage(code, t?, { fallback })`
 *   (appkit/src/errors/error-display-map.ts). It resolves a stable error code
 *   through `errors.codes.*` and terminates in a CONSTANT, never in server text.
 *   Keep your curated sentence — pass it as `fallback`, where it is actually
 *   reached.
 *
 *     showToast(toUserMessage(code, t, { fallback: "Could not save." }), "error")
 *
 * SCOPE — display sinks only. Reporting must keep the raw text:
 *   `reportClientError`, `serverLogger`, `console.*`, `trackError`, and
 *   `surfaceError`'s internal `report` are all ignored. That split — report the
 *   internal, show the generic — is the model, not the violation.
 *
 * No suppression marker: the codebase is driving markers to zero (see
 * audit-no-suppression-comments), and a genuine exception belongs in EXEMPT
 * below with a written reason, where it is reviewable.
 *
 * ## Staging
 *
 * REPORT-ONLY by default; `MIGRATE=strict` fails the run. 73 sites exist at
 * introduction, spread across ~40 files at 1–3 each. Landing strict on day one
 * would force either a rushed sweep of every auth, payout and checkout error
 * path in one go, or a marker spray — and marker spray is the anti-pattern, not
 * the fix (Root Cause #22). Burn the count down, then flip it, exactly as
 * audit-silent-degrade is staged and as audit-listing-detail-affordance was
 * before it reached zero and became strict.
 *
 * Burn-down order is risk-first: auth, then money (payout/payment/checkout/cart),
 * then bid, then admin, then the rest.
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const SCAN_DIRS = [join(ROOT, "src"), join(ROOT, "appkit", "src")];

const SKIP_DIRS = new Set([
  "node_modules", ".next", "dist", "build", "coverage",
  "__tests__", "__mocks__", ".claude", ".git",
]);

/**
 * Server route handlers are out of scope.
 *
 * Their `errorResponse(result.error ?? "…", 400)` is not a display sink: a 4xx
 * message is deliberate, user-actionable copy authored by our own validation
 * ("Order not found", "Coupon expired"), and `mapToHttpError` already scrubs
 * every 5xx in production while keeping the real text for recorders. Flagging
 * them would push callers toward replacing good specific copy with a generic
 * string — the opposite of the goal.
 */
const SERVER_ROUTE_RE = /src[\\/]app[\\/]api[\\/]/;

/**
 * Files allowed to render a raw message, each with a reason.
 * A crash boundary has no error code to resolve and no i18n context to resolve
 * it in — but note CLAUDE.md requires PRODUCTION to show the digest, not the
 * message, so these must keep their dev-only guard.
 */
const EXEMPT = new Map([
  ["appkit/src/react/ErrorBoundary.tsx", "crash boundary — no code, no i18n context; digest is what ships in prod"],
  ["appkit/src/next/ErrorBoundary.tsx", "crash boundary — same"],
  ["appkit/src/next/components/GlobalError.tsx", "crash boundary — same"],
  ["appkit/src/client/api/surface-error.ts", "the helper that DOES the resolution; its internalMessage is reported, never shown"],
  ["appkit/src/errors/error-display-map.ts", "defines toUserMessage itself"],
]);

/** Display sinks. A raw message reaching one of these is the defect. */
const SINKS = ["showToast", "setFieldError", "setError", "setBuyNowError"];

function stripNoise(src) {
  let out = ""; let i = 0; const n = src.length;
  while (i < n) {
    const c = src[i], next = src[i + 1];
    if (c === "/" && next === "/") { while (i < n && src[i] !== "\n") { out += src[i] === "\n" ? "\n" : " "; i++; } continue; }
    if (c === "/" && next === "*") { i += 2; while (i < n && !(src[i] === "*" && src[i + 1] === "/")) { out += src[i] === "\n" ? "\n" : " "; i++; } i += 2; continue; }
    out += c; i++;
  }
  return out;
}

function walk(dir, files) {
  let entries;
  try { entries = readdirSync(dir); } catch { return files; }
  for (const entry of entries) {
    if (SKIP_DIRS.has(entry)) continue;
    const full = join(dir, entry);
    let st;
    try { st = statSync(full); } catch { continue; }
    if (st.isDirectory()) walk(full, files);
    else if (/\.(ts|tsx)$/.test(entry) && !/\.(test|spec)\.tsx?$/.test(entry)) files.push(full);
  }
  return files;
}

// `<something>.message` where something looks like a caught error.
const ERRVAR = String.raw`(?:err|error|e|_err|ex)\d*`;
const RULES = [
  {
    id: "RAW_IN_DISPLAY_SINK",
    // showToast(... err.message ...) — the sink and the message on one call
    re: new RegExp(String.raw`\b(?:${SINKS.join("|")})\s*\([^;]{0,240}?\b${ERRVAR}\s*\.\s*message`, "g"),
    hint: "pass toUserMessage(code, t, { fallback: \"<authored copy>\" }) instead",
  },
  {
    id: "RAW_FALLBACK_TAIL",
    // `?? err.message` / `|| err.message` / `?? result.error`
    //
    // The negative lookahead matters: `|| result.error?.includes("NOT_FOUND")`
    // is a CONDITION and `?? err.message.slice(0, 80)` is a transform. Neither
    // shows the raw value; only a terminal use of it is the defect.
    re: new RegExp(
      String.raw`(?:\?\?|\|\|)\s*(?:${ERRVAR}\s*\.\s*message|result\s*\.\s*error)\b(?!\s*[?.(])`,
      "g",
    ),
    hint: "the chain must terminate in authored copy, never in the error's own text",
  },
  {
    id: "RAW_RESULT_ERROR_IN_SINK",
    re: new RegExp(String.raw`\b(?:${SINKS.join("|")})\s*\([^;]{0,240}?\bresult\s*\.\s*error\b`, "g"),
    hint: "result.error is the server's message; resolve result.code through toUserMessage",
  },
  {
    id: "RAW_MESSAGE_IN_JSX",
    re: new RegExp(String.raw`\{\s*(?:${ERRVAR}|error)\s*\.\s*message\s*\}`, "g"),
    hint: "render authored copy; report the raw text instead",
  },
];

const violations = [];

for (const dir of SCAN_DIRS) {
  for (const file of walk(dir, [])) {
    const rel = relative(ROOT, file).replace(/\\/g, "/");
    if (EXEMPT.has(rel)) continue;

    let src;
    try { src = readFileSync(file, "utf8"); } catch { continue; }
    if (!src.includes(".message") && !src.includes("result.error")) continue;

    const clean = stripNoise(src);
    for (const rule of RULES) {
      rule.re.lastIndex = 0;
      let m;
      while ((m = rule.re.exec(clean)) !== null) {
        violations.push({
          file: rel,
          line: clean.slice(0, m.index).split("\n").length,
          id: rule.id,
          hint: rule.hint,
        });
      }
    }
  }
}

const STRICT = process.env.MIGRATE === "strict";

if (violations.length > 0 && !STRICT) {
  const byRule = new Map();
  for (const v of violations) byRule.set(v.id, (byRule.get(v.id) ?? 0) + 1);
  console.warn(
    `[audit-raw-error-text] REPORT MODE — ${violations.length} site(s) show an error's own text to a user.`,
  );
  console.warn(`  ${[...byRule].map(([k, n]) => `${k}=${n}`).join(" · ")}`);
  console.warn(
    `  Fix with toUserMessage(code, t, { fallback: "<authored copy>" }).\n` +
      `  Run with MIGRATE=strict to fail, and to see the full list. Flip this audit to\n` +
      `  strict once the count reaches 0 — see the Staging note in this file's header.`,
  );
  process.exit(0);
}

if (violations.length > 0) {
  const byRule = new Map();
  for (const v of violations) byRule.set(v.id, (byRule.get(v.id) ?? 0) + 1);
  console.error(
    `\n[audit-raw-error-text] ${violations.length} site(s) show an error's own text to a user:\n`,
  );
  console.error(`  ${[...byRule].map(([k, n]) => `${k}=${n}`).join(" · ")}\n`);
  for (const v of violations.slice(0, 60)) {
    console.error(`  ${v.file}:${v.line}  [${v.id}]`);
    console.error(`      ${v.hint}`);
  }
  if (violations.length > 60) console.error(`  … and ${violations.length - 60} more.`);
  console.error(
    `\n  A thrown value's .message is written for a developer. Showing it to a user is\n` +
      `  at best noise and at worst a leak — this codebase rendered a Node require stack\n` +
      `  inside the bid modal that way (Root Cause #86).\n\n` +
      `  Fix: toUserMessage(code, t, { fallback: "<authored copy>" }) — it terminates in a\n` +
      `  constant, never in server text. Keep your sentence; pass it as the fallback, where\n` +
      `  it is actually reached (in the common ternary it never is).\n\n` +
      `  Reporting is NOT affected — reportClientError / serverLogger / trackError must keep\n` +
      `  the raw text. Report the internal, show the generic.\n`,
  );
  process.exit(1);
}

console.log("[audit-raw-error-text] OK — 0 raw error strings reach a user");
process.exit(0);
