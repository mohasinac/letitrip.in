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
 * 3. `.int()` chained onto a `z.number()` field declaration whose name is
 *    money-sounding — decimal rupees need fractional precision (₹1,499.50),
 *    so a whole-integer Zod constraint on a money field rejects legitimate
 *    amounts. Leftover from when the same field held whole-paise integers.
 *
 * 4. The literal word "paise" anywhere outside an identifier (JSDoc
 *    comments, UI labels/placeholders, help copy) — these don't match check
 *    #1's identifier-shaped pattern but are exactly as stale, and have
 *    caused a live 100x data-entry bug in an admin form (a label reading
 *    "(paise, optional)" on a field that actually stores decimal rupees).
 *
 * 5. `SCREAMING_SNAKE_CASE` constants ending in `_PAISE` (e.g.
 *    `AUCTION_MIN_BID_INCREMENT_PAISE`) — underscore is a `\w` character, so
 *    no regex `\b` exists between "_" and "PAISE". This constant-naming
 *    convention slips past both check #1 (camelCase-shaped, case-sensitive)
 *    and a plain case-insensitive `\bpaise\b` word check.
 *
 * Allowlist (the only legitimate paise-conversion sites):
 *   - appkit/src/providers/payment-razorpay/index.ts (rupeesToPaise/paiseToRupees)
 *   - appkit/src/_internal/server/jobs/core/payoutBatch.ts (RazorpayX payout REST call)
 *   - appkit/src/schemas/webhooks/razorpay.ts (Razorpay's own webhook wire format — natively paise)
 *
 * Suppress a specific line with `// audit-money-units-ok: <reason>` on the
 * same line or the line above (e.g. a percentage divisor the heuristic
 * can't distinguish from a paise conversion, or a non-money `.int()` field
 * whose name happens to contain a money word).
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
  // Razorpay's own webhook wire format — their entities are natively paise,
  // not our internal storage convention. Mirroring their shape verbatim.
  join("appkit", "src", "schemas", "webhooks", "razorpay.ts"),
];

const MONEY_WORD = /(price|amount|fee|cost|revenue|profit|discount|deposit|total|bid|budget|payout|refund|threshold)/i;
// rupeesToPaise/paiseToRupees are the permanent, intentional Razorpay boundary
// conversion functions — legitimate to import/call anywhere, not just the
// two allowlisted files. Only flag OTHER *Paise/InPaise identifiers.
const PAISE_IDENTIFIER = /\b(?!rupeesToPaise\b|paiseToRupees\b)\w*(?:Paise|InPaise)\b/;
// SCREAMING_SNAKE_CASE constants ending in `_PAISE` (e.g.
// AUCTION_MIN_BID_INCREMENT_PAISE) — underscore is a \w character, so no
// regex \b exists between "_" and "PAISE", meaning neither PAISE_IDENTIFIER
// (case-sensitive, camelCase-shaped) nor a plain \bpaise\b (word-boundary)
// check catches this constant-naming convention. Separate, explicit check.
const SCREAMING_PAISE_SUFFIX = /\b[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)*_PAISE\b/;
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

// Check #3 — `.int()` on a money-named `z.number()` field declaration.
const FIELD_DECL = /^\s*['"]?(\w+)['"]?\s*:\s*z\.number\(\)/;
const INT_CHAIN = /\.int\(/;
// Non-money int fields that would otherwise false-positive against
// MONEY_WORD (e.g. "totalCount", "feeTier", "budgetDay") — suffix-based,
// checked against the extracted field name only.
const NON_MONEY_INT_SUFFIX = /(count|qty|quantity|percent|index|tier|limit|rating|day|hour|minute|month|year|version|priority|order|rank|step|level|code|id|page|slots|uses|products|reviews|views|entries|items|orders)$/i;

// Check #4 — the plain word "paise" outside an identifier (comments, UI
// labels, placeholders). Word-boundary on both sides means this does NOT
// match inside `rupeesToPaise`/`paiseToRupees` (camelCase — no boundary
// between "To"/"Paise" or "paise"/"ToRupees").
const STALE_PAISE_WORD = /\bpaise\b/i;

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

      if (!fileTouchesBoundary && SCREAMING_PAISE_SUFFIX.test(line)) {
        violations.push({
          file: relPath,
          line: i + 1,
          text: line.trim().slice(0, 120),
          reason: "SCREAMING_SNAKE_CASE _PAISE constant — money is stored as decimal rupees now",
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

      const fieldMatch = FIELD_DECL.exec(line);
      if (fieldMatch && INT_CHAIN.test(line)) {
        const fieldName = fieldMatch[1];
        if (MONEY_WORD.test(fieldName) && !NON_MONEY_INT_SUFFIX.test(fieldName)) {
          violations.push({
            file: relPath,
            line: i + 1,
            text: line.trim().slice(0, 120),
            reason: `.int() on money-named field "${fieldName}" — decimal rupees need fractional precision`,
          });
        }
      }

      if (STALE_PAISE_WORD.test(line) && !PAISE_IDENTIFIER.test(line)) {
        violations.push({
          file: relPath,
          line: i + 1,
          text: line.trim().slice(0, 120),
          reason: 'Stale "paise" reference — money is stored as decimal rupees now',
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
