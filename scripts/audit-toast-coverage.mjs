#!/usr/bin/env node
/**
 * Phase 10 audit: finds async callback handlers in "use client" files
 * that call `await` but have no try/catch, no dispatch, and no showToast.
 * These are silent-error handlers that need toast coverage.
 */

import { readFileSync, readdirSync, statSync } from "fs";
import { join } from "path";

function scan(dir) {
  const results = [];
  try {
    for (const entry of readdirSync(dir)) {
      if (entry === "node_modules" || entry === ".next" || entry === "dist") continue;
      const full = join(dir, entry);
      const st = statSync(full);
      if (st.isDirectory()) {
        results.push(...scan(full));
      } else if (full.endsWith(".tsx") || full.endsWith(".ts")) {
        const content = readFileSync(full, "utf-8");
        if (!content.startsWith('"use client"') && !content.startsWith("'use client'")) continue;

        // Find useCallback(async ... => { BODY }) blocks
        // Simple heuristic: find "useCallback(async" then track braces
        const lines = content.split("\n");
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          if (!line.includes("useCallback(async")) continue;

          // Collect the full body of this callback
          let braceDepth = 0;
          let started = false;
          let bodyLines = [];
          for (let j = i; j < lines.length && j < i + 80; j++) {
            for (const ch of lines[j]) {
              if (ch === "{") { braceDepth++; started = true; }
              if (ch === "}") braceDepth--;
            }
            bodyLines.push(lines[j]);
            if (started && braceDepth <= 0) break;
          }

          const body = bodyLines.join("\n");
          const hasAwait = body.includes("await ");
          const hasTryCatch = body.includes("try {") || body.includes("try{");
          const hasDispatch = body.includes("dispatch(");
          const hasShowToast = body.includes("showToast(") || body.includes("showToast (");
          const hasCatch = body.includes(".catch(");

          // Flag: has await but no error handling at all
          if (hasAwait && !hasTryCatch && !hasDispatch && !hasShowToast && !hasCatch) {
            const funcMatch = line.match(/const (\w+)/);
            const funcName = funcMatch ? funcMatch[1] : "anonymous";
            results.push({
              file: full.replace(/\\/g, "/"),
              line: i + 1,
              func: funcName,
              severity: "error", // no error handling at all
            });
          }
          // Flag: has try/catch but missing success toast (less critical)
          else if (hasAwait && hasTryCatch && !hasShowToast && !hasDispatch) {
            const funcMatch = line.match(/const (\w+)/);
            const funcName = funcMatch ? funcMatch[1] : "anonymous";
            results.push({
              file: full.replace(/\\/g, "/"),
              line: i + 1,
              func: funcName,
              severity: "warn", // has catch but no toast
            });
          }
        }
      }
    }
  } catch { /* skip */ }
  return results;
}

// Baseline: data loaders, background ops, and complex UI flows with custom error states.
// These are intentionally silent or have non-toast error handling.
const KNOWN_WARNINGS = new Set([
  "loadItems", "loadOffers", "fetchReviews", "refetch", "load", "fetchStatus",
  "mutate", "connectAndSubscribe", "markRead", "handleMarkAllRead",
  "handleSpin", "handleRevealClick", "toggle",
]);

const appkitResults = scan("appkit/src/features");
const srcResults = scan("src");
const all = [...appkitResults, ...srcResults];

const errors = all.filter((r) => r.severity === "error");
const warnings = all.filter((r) => r.severity === "warn");
const newWarnings = warnings.filter((r) => !KNOWN_WARNINGS.has(r.func));
const baselineWarnings = warnings.filter((r) => KNOWN_WARNINGS.has(r.func));

console.log(`\n=== PHASE 10 TOAST AUDIT ===\n`);

if (errors.length > 0) {
  console.log(`❌ ${errors.length} async handler(s) with NO error handling:\n`);
  for (const r of errors) {
    console.log(`  ${r.file}:${r.line} — ${r.func}()`);
  }
}

if (newWarnings.length > 0) {
  console.log(`\n⚠️  ${newWarnings.length} NEW async handler(s) with try/catch but no toast:\n`);
  for (const r of newWarnings) {
    console.log(`  ${r.file}:${r.line} — ${r.func}()`);
  }
}

if (baselineWarnings.length > 0) {
  console.log(`\nℹ️  ${baselineWarnings.length} known baseline warning(s) (data loaders / background ops):`);
  for (const r of baselineWarnings) {
    console.log(`  ${r.file}:${r.line} — ${r.func}()`);
  }
}

if (errors.length === 0 && newWarnings.length === 0) {
  console.log("✅ No regressions — all user-facing handlers have toast feedback.");
}

console.log(`\nTotal: ${errors.length} errors, ${newWarnings.length} new warnings, ${baselineWarnings.length} baseline`);
process.exit(errors.length > 0 || newWarnings.length > 0 ? 1 : 0);
