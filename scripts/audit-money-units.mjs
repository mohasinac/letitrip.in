#!/usr/bin/env node
/**
 * audit-money-units — every monetary field in this codebase stores decimal
 * rupees directly (e.g. `price: 3499.00`). Integer-paise conversion happens
 * ONLY at the two Razorpay boundaries (order/refund creation via the
 * `razorpay` npm package, and the RazorpayX payout REST call) — see
 * CLAUDE.md's "Recurrent Root Cause Patterns" for the migration writeup.
 *
 * Detects regressions of the pre-migration paise convention:
 *
 * 1. Any identifier ending in `Paise` or containing `InPaise` (field names,
 *    variables, string literals such as Sieve `sortBy("xPaise")` calls).
 *    Firestore silently returns zero results for a filter/sort on a field
 *    that doesn't exist — this class of bug is otherwise invisible to tsc.
 *
 * 2. `* 100` / `/ 100` arithmetic adjacent to a money-sounding identifier
 *    (price, amount, fee, cost, revenue, profit, discount, deposit, total,
 *    bid, budget, payout, refund, threshold) — the paise-conversion pattern
 *    this migration eliminated everywhere except the Razorpay boundary.
 *
 * Allowlist (the only legitimate paise-conversion sites):
 *   - appkit/src/providers/payment-razorpay/index.ts (rupeesToPaise/paiseToRupees)
 *   - appkit/src/_internal/server/jobs/core/payoutBatch.ts (RazorpayX payout REST call)
 *
 * Suppress a specific line with `// audit-money-units-ok: <reason>` on the
 * same line or the line above (e.g. a percentage divisor the heuristic
 * can't distinguish from a paise conversion).
 *
 * Exits 0 — clean
 * Exits 1 — violations found (lists every offending file:line)
 */

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const SCAN_DIRS = [join(ROOT, "src"), join(ROOT, "appkit", "src")];
const SKIP_DIRS = new Set(["node_modules", ".next", "dist", ".git", "__tests__"]);
const SCAN_EXTS = new Set([".ts", ".tsx"]);

const ALLOWLIST_FILES = [
  join("appkit", "src", "providers", "payment-razorpay", "index.ts"),
  join("appkit", "src", "_internal", "server", "jobs", "core", "payoutBatch.ts"),
];

const MONEY_WORD = /(price|amount|fee|cost|revenue|profit|discount|deposit|total|bid|budget|payout|refund|threshold)/i;
// rupeesToPaise/paiseToRupees are the permanent, intentional Razorpay boundary
// conversion functions — legitimate to import/call anywhere, not just the
// two allowlisted files. Only flag OTHER *Paise/InPaise identifiers.
const PAISE_IDENTIFIER = /\b(?!rupeesToPaise\b|paiseToRupees\b)\w*(?:Paise|InPaise)\b/;
const DIVIDE_100 = /\/\s*100\b/;
const MULTIPLY_100 = /\*\s*100\b/;
const PERCENT_CONTEXT = /percent|Percent|rate\b|Rate\b/;
// The canonical 2dp rupee-rounding idiom (Math.round(x*100)/100) — both
// operators cancel out net-neutral, this is NOT a unit conversion.
const ROUND_RUPEES_IDIOM = /\*\s*100\s*\)?\s*\/\s*100\b/;
// Ratio-based percentage math, e.g. (a / b) * 100 — division is between two
// identifiers, not a literal 100, so it's a percentage, not paise scaling.
const RATIO_PERCENT_IDIOM = /\(\s*[\w.?]+\s*\/\s*[\w.?]+\s*\)\s*\*\s*100\b/;
const SUPPRESSION = /audit-money-units-ok/;

function walk(dir, files = []) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return files;
  }
  for (const entry of entries) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, files);
    } else if (SCAN_EXTS.has(extname(entry.name))) {
      files.push(full);
    }
  }
  return files;
}

function isAllowlisted(relPath) {
  return ALLOWLIST_FILES.some((f) => relPath === f);
}

const violations = [];

for (const dir of SCAN_DIRS) {
  for (const file of walk(dir)) {
    const relPath = relative(ROOT, file);
    if (isAllowlisted(relPath)) continue;
    if (relPath.endsWith(".test.ts") || relPath.endsWith(".test.tsx")) continue;

    let content;
    try {
      content = readFileSync(file, "utf8");
    } catch {
      continue;
    }
    const lines = content.split("\n");
    // A file that calls the boundary conversion function is, by definition,
    // Razorpay-boundary-adjacent code — local variables named e.g.
    // `amountInPaise` holding that call's result are the intended,
    // correct "this value is now paise for the external API" convention.
    const fileTouchesBoundary = /\b(?:rupeesToPaise|paiseToRupees)\s*\(/.test(content);

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const prevLine = i > 0 ? lines[i - 1] : "";
      if (SUPPRESSION.test(line) || SUPPRESSION.test(prevLine)) continue;

      if (!fileTouchesBoundary && PAISE_IDENTIFIER.test(line)) {
        violations.push({
          file: relPath,
          line: i + 1,
          text: line.trim().slice(0, 120),
          reason: "Paise/InPaise identifier — money is stored as decimal rupees now",
        });
        continue;
      }

      if (ROUND_RUPEES_IDIOM.test(line) || RATIO_PERCENT_IDIOM.test(line)) continue;

      const hasDivide = DIVIDE_100.test(line);
      const hasMultiply = MULTIPLY_100.test(line);
      if ((hasDivide || hasMultiply) && MONEY_WORD.test(line) && !PERCENT_CONTEXT.test(line)) {
        violations.push({
          file: relPath,
          line: i + 1,
          text: line.trim().slice(0, 120),
          reason: "Paise-scale *100/÷100 arithmetic near a money-sounding identifier",
        });
      }
    }
  }
}

if (violations.length === 0) {
  console.log("audit-money-units: clean");
  process.exit(0);
}

console.error(`audit-money-units: ${violations.length} violation(s) found.\n`);
console.error("Money is stored as decimal rupees everywhere except the two Razorpay");
console.error("boundary files. See CLAUDE.md's paise->rupees migration writeup.\n");
console.error("Suppress a genuinely irreducible line with:");
console.error("  // audit-money-units-ok: <reason>\n");
for (const v of violations) {
  console.error(`  ${v.file}:${v.line} — ${v.reason}`);
  console.error(`    ${v.text}`);
}
process.exit(1);
