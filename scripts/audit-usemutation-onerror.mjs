#!/usr/bin/env node
/**
 * audit-usemutation-onerror.mjs — the mutation owns its failure surface.
 *
 * RULE 1 — RAW_USEMUTATION
 * Bans `useMutation(` outside the centralized `useApiMutation` wrapper, so
 * every mutation failure auto-surfaces via `surfaceError` (inline field errors
 * when the server sent issues, toast otherwise, plus the error reporter).
 * Per-line marker: `// audit-usemutation-onerror-ok: <reason>`.
 *
 * RULE 2 — DOUBLE_TOAST
 * The other end of the same invariant. `useApiMutation`'s built-in `onError`
 * ALWAYS calls `surfaceError`, which toasts. So a caller that ALSO toasts in
 * its own `onError` — or in a `catch` around `await mutateAsync(...)` — makes
 * the user read the same sentence two or three times.
 *
 * Found 2026-08-27: one failed avatar save produced THREE identical
 * "Validation failed" banners — `useApiMutation`'s built-in surfaceError, the
 * caller's own `onError`, and `AvatarUpload`'s catch around `onUploadSuccess`.
 * `Toast.tsx` appends without dedupe, and deliberately still does: dedupe would
 * hide this bug class rather than fix it, and would make this rule
 * unfalsifiable.
 *
 * A caller's `onError` may still do rollback, analytics, navigation, closing a
 * drawer, or `setFieldError`. It may not toast. If the caller's message is
 * genuinely better than `err.message`, pass `errorMessage` to the mutation so
 * the ONE surface says the right thing.
 *
 * NO suppression marker for Rule 2 — `// toast-handled-by-hook` was tried
 * before and is now banned outright by audit-no-suppression-comments.
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const PROJECT_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function exists(p) {
  try { statSync(p); return true; } catch { return false; }
}
function walk(dir, out = []) {
  if (!exists(dir)) return out;
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (p.endsWith(".ts") || p.endsWith(".tsx")) out.push(p);
  }
  return out;
}

const ALLOW_RAW = ["useApiMutation.ts", "useApiMutation.tsx"];
const files = [
  ...walk(join(PROJECT_ROOT, "src")),
  ...walk(join(PROJECT_ROOT, "appkit", "src")),
].filter(
  (f) =>
    !f.includes("node_modules") && !f.includes(".next") && !f.includes("__tests__"),
);

// ---------------------------------------------------------------------------
// Shared: a brace/paren walker that ignores strings, template literals and
// comments. A `<Tag[^>]*>`-style regex cannot do this — the `>` inside
// `onClick={() => f()}` ends the match early (Root Cause #29's false
// negative), and the same applies to `}` inside a string.
// ---------------------------------------------------------------------------
function spanFrom(src, openIdx) {
  const open = src[openIdx];
  const close = open === "(" ? ")" : open === "{" ? "}" : null;
  if (!close) return null;
  let depth = 0;
  let i = openIdx;
  let str = null;      // active quote char
  let inLine = false, inBlock = false;
  for (; i < src.length; i++) {
    const c = src[i], n = src[i + 1];
    if (inLine) { if (c === "\n") inLine = false; continue; }
    if (inBlock) { if (c === "*" && n === "/") { inBlock = false; i++; } continue; }
    if (str) {
      if (c === "\\") { i++; continue; }
      if (c === str) str = null;
      continue;
    }
    if (c === "/" && n === "/") { inLine = true; i++; continue; }
    if (c === "/" && n === "*") { inBlock = true; i++; continue; }
    if (c === '"' || c === "'" || c === "`") { str = c; continue; }
    if (c === open) depth++;
    else if (c === close) { depth--; if (depth === 0) return { start: openIdx, end: i }; }
  }
  return null;
}

const TOAST_RE = /\b(?:showToast|updateToast|addToast|toast\.(?:error|warning))\s*\(/;

/**
 * Text of one object-literal property's VALUE: from `start` up to the comma
 * that ends it at depth 0 (or `hardEnd`). Bracket-, string- and comment-aware,
 * so a comma inside `showToast("a, b", "error")` does not end it early.
 */
function propertyValueSlice(src, start, hardEnd) {
  let depth = 0, str = null, inLine = false, inBlock = false;
  for (let i = start; i < hardEnd && i < src.length; i++) {
    const c = src[i], n = src[i + 1];
    if (inLine) { if (c === "\n") inLine = false; continue; }
    if (inBlock) { if (c === "*" && n === "/") { inBlock = false; i++; } continue; }
    if (str) {
      if (c === "\\") { i++; continue; }
      if (c === str) str = null;
      continue;
    }
    if (c === "/" && n === "/") { inLine = true; i++; continue; }
    if (c === "/" && n === "*") { inBlock = true; i++; continue; }
    if (c === '"' || c === "'" || c === "`") { str = c; continue; }
    if (c === "(" || c === "{" || c === "[") depth++;
    else if (c === ")" || c === "}" || c === "]") {
      if (depth === 0) return src.slice(start, i);
      depth--;
    } else if (c === "," && depth === 0) return src.slice(start, i);
  }
  return src.slice(start, hardEnd);
}

// ---------------------------------------------------------------------------
// Wrapper resolution — which hook names ultimately ARE useApiMutation?
// Without this, `useUpdateProfile` (an alias re-export of
// `useUpdateCurrentProfile`, which wraps useApiMutation) is invisible, and
// that is exactly the hook the avatar bug went through.
// ---------------------------------------------------------------------------
function resolveMutationHookNames() {
  const names = new Set(["useApiMutation"]);
  // Pass 1: `export function useX(...)` whose body mentions useApiMutation(.
  for (const f of files) {
    const src = readFileSync(f, "utf8");
    if (!src.includes("useApiMutation")) continue;
    for (const m of src.matchAll(/export\s+(?:async\s+)?function\s+(use[A-Z]\w*)\s*\(/g)) {
      // Skip the PARAMETER LIST first. `useUpdateCurrentProfile(options?: {…})`
      // has an object type literal in its params, so a naive
      // `indexOf("{", …)` lands there and walks the wrong braces — which is
      // why this resolver originally found none of the wrappers.
      const params = spanFrom(src, m.index + m[0].length - 1);
      if (!params) continue;
      const bodyOpen = src.indexOf("{", params.end);
      if (bodyOpen < 0) continue;
      const body = spanFrom(src, bodyOpen);
      const slice = body ? src.slice(body.start, body.end) : "";
      if (/\buseApiMutation\s*\(/.test(slice)) names.add(m[1]);
    }
    // `export const useX = (...) => { ... useApiMutation( ... ) }`
    for (const m of src.matchAll(/export\s+const\s+(use[A-Z]\w*)\s*=\s*(?:function\s*)?\(/g)) {
      const params = spanFrom(src, m.index + m[0].length - 1);
      if (!params) continue;
      const bodyOpen = src.indexOf("{", params.end);
      if (bodyOpen < 0) continue;
      const body = spanFrom(src, bodyOpen);
      const slice = body ? src.slice(body.start, body.end) : "";
      if (/\buseApiMutation\s*\(/.test(slice)) names.add(m[1]);
    }
  }
  // Pass 2: alias re-exports — `export { useX as useY }`.
  let changed = true;
  while (changed) {
    changed = false;
    for (const f of files) {
      const src = readFileSync(f, "utf8");
      for (const m of src.matchAll(/\b(use[A-Z]\w*)\s+as\s+(use[A-Z]\w*)/g)) {
        if (names.has(m[1]) && !names.has(m[2])) { names.add(m[2]); changed = true; }
      }
    }
  }
  return names;
}

const MUTATION_HOOKS = resolveMutationHookNames();

// Query hooks own their own surface (no built-in surfaceError), so an
// `onError` toast there is correct, not a double.
const QUERY_HOOKS = /^use(?:Query|InfiniteQuery|SuspenseQuery|Queries)$/;

const rawViolations = [];
const doubleToast = [];

for (const file of files) {
  const src = readFileSync(file, "utf8");
  const lines = src.split("\n");
  const rel = file.slice(PROJECT_ROOT.length + 1).replace(/\\/g, "/");
  const lineOf = (idx) => src.slice(0, idx).split("\n").length;

  // ---- Rule 1 --------------------------------------------------------------
  if (!ALLOW_RAW.some((a) => file.endsWith(a))) {
    lines.forEach((line, i) => {
      if (!/\buseMutation\s*\(/.test(line)) return;
      const prev = i > 0 ? lines[i - 1] : "";
      if (/audit-usemutation-onerror-ok/.test(line) || /audit-usemutation-onerror-ok/.test(prev)) return;
      rawViolations.push(`${rel}:${i + 1}  ${line.trim()}`);
    });
  }

  // ---- Rule 2 --------------------------------------------------------------
  if (file.endsWith("useApiMutation.ts") || file.endsWith("useApiMutation.tsx")) continue;

  // 2a. A toasting `onError` inside a mutation-hook call.
  for (const m of src.matchAll(/\bonError\s*:/g)) {
    // Find the innermost `useXxx(` whose paren span contains this onError.
    let owner = null, ownerSpan = null;
    for (const h of src.matchAll(/\b(use[A-Z]\w*)\s*\(/g)) {
      const openIdx = h.index + h[0].length - 1;
      const sp = spanFrom(src, openIdx);
      if (!sp || m.index < sp.start || m.index > sp.end) continue;
      if (!ownerSpan || sp.start > ownerSpan.start) { owner = h[1]; ownerSpan = sp; }
    }
    if (!owner || QUERY_HOOKS.test(owner) || !MUTATION_HOOKS.has(owner)) continue;

    // The WHOLE property value, not "the first bracket after onError:".
    // For `onError: (err) => showToast(...)` that first bracket is the arrow's
    // PARAMETER list, so walking it yielded "(err" and the toast inside the
    // body was never seen — which is how the very bug this rule was written
    // for went undetected on the first run.
    const bodySrc = propertyValueSlice(src, m.index + m[0].length, ownerSpan.end);
    if (!TOAST_RE.test(bodySrc)) continue;
    doubleToast.push(
      `${rel}:${lineOf(m.index)}  onError in ${owner}() toasts — ${owner} already surfaces the error`,
    );
  }

  // 2b. A `catch` that toasts around an `await mutateAsync(...)`.
  for (const c of src.matchAll(/\bcatch\s*\([^)]*\)\s*\{/g)) {
    const openIdx = c.index + c[0].length - 1;
    const body = spanFrom(src, openIdx);
    if (!body) continue;
    const bodySrc = src.slice(body.start, body.end);
    if (!TOAST_RE.test(bodySrc)) continue;
    // The matching try block is the text immediately before `catch`.
    const before = src.slice(0, c.index);
    const tryClose = before.lastIndexOf("}");
    if (tryClose < 0) continue;
    const tryOpen = matchBackwards(src, tryClose);
    if (tryOpen < 0) continue;
    const trySrc = src.slice(tryOpen, tryClose);
    if (!/\bmutateAsync\s*\(/.test(trySrc)) continue;
    doubleToast.push(
      `${rel}:${lineOf(c.index)}  catch around mutateAsync() toasts — the mutation already surfaced it`,
    );
  }
}

/** Given the index of a `}`, find its matching `{`. */
function matchBackwards(src, closeIdx) {
  let depth = 0;
  for (let i = closeIdx; i >= 0; i--) {
    const c = src[i];
    if (c === "}") depth++;
    else if (c === "{") { depth--; if (depth === 0) return i; }
  }
  return -1;
}

let failed = false;

if (rawViolations.length) {
  failed = true;
  console.error("[audit-usemutation-onerror] RAW_USEMUTATION — raw useMutation outside the wrapper:");
  for (const v of rawViolations.slice(0, 100)) console.error("  " + v);
  if (rawViolations.length > 100) console.error(`  ... and ${rawViolations.length - 100} more`);
  console.error(`\n  ${rawViolations.length} violation(s). Use useApiMutation from @mohasinac/appkit/client.\n`);
}

if (doubleToast.length) {
  failed = true;
  console.error("[audit-usemutation-onerror] DOUBLE_TOAST — the same failure is surfaced more than once:");
  for (const v of doubleToast.slice(0, 100)) console.error("  " + v);
  if (doubleToast.length > 100) console.error(`  ... and ${doubleToast.length - 100} more`);
  console.error(
    "\n  The mutation owns the failure surface. Delete the toast from the caller's\n" +
      "  onError / catch — it may still do rollback, analytics, navigation or\n" +
      "  setFieldError. If the caller's wording is better than err.message, pass\n" +
      "  `errorMessage` to the mutation so the ONE surface says the right thing.\n" +
      "  There is no suppression marker for this rule.\n",
  );
}

if (failed) process.exit(1);
console.log(
  `[audit-usemutation-onerror] OK — every mutation goes through useApiMutation, ` +
    `and each failure has exactly one surface (${MUTATION_HOOKS.size} wrapper hook(s) resolved).`,
);
