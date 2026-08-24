#!/usr/bin/env node
/**
 * audit-no-step-wizard — strict-zero, with a shrinking grandfather list.
 *
 * The step wizard (`features/shell/StepForm.tsx`) is being replaced by
 * `SectionForm`: collapsible sections, the mandatory one first and always
 * open, one shared submit at the bottom, and no `goNext` gate that can block
 * access to a later section.
 *
 * This audit ships BEFORE the migration finishes, with the six known wizard
 * call sites grandfathered. Delete an entry from GRANDFATHERED as each one
 * migrates. That way the audit is green from day one and re-introducing a
 * wizard ANYWHERE ELSE fails immediately, instead of the rule only arriving
 * once the last file is converted (by which point someone has usually added
 * a new one).
 *
 * When GRANDFATHERED is empty, `StepForm.tsx` itself is deleted and this
 * audit becomes a pure regression guard.
 *
 * Suppression: `// audit-no-step-wizard-ok: <reason>` on the offending line
 * or the line above. Reserve it for a genuinely sequential flow where a later
 * stage is meaningless until an earlier one completes (a payment
 * authorisation, say) — not for "this form is long".
 *
 * Exit 0 — clean.
 * Exit 1 — a step-wizard construct outside the grandfather list.
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const SCAN = [join(ROOT, "src"), join(ROOT, "appkit", "src")];
const SKIP = new Set(["node_modules", "dist", ".next", ".git", "__tests__"]);
const EXTS = [".ts", ".tsx"];

/** The primitive itself, plus its barrel — deleted together at the end. */
const PRIMITIVE_FILES = [
  "appkit/src/features/shell/StepForm.tsx",
  "appkit/src/features/shell/index.ts",
  "appkit/src/index.ts",
];

/**
 * The six known wizards, in planned migration order. Remove an entry the
 * moment its file stops rendering a wizard — never add one.
 */
const GRANDFATHERED = [
  "appkit/src/features/seller/components/SellerPayoutSettingsView.tsx",
  "appkit/src/features/seller/components/SellerShippingView.tsx",
  "appkit/src/features/seller/components/SellerStorefrontView.tsx",
  "appkit/src/features/admin/components/AdminBlogEditorView.tsx",
  "appkit/src/features/events/components/AdminEventEditorView.tsx",
  "appkit/src/features/seller/components/SellerProductShell.tsx",
];

const PATTERNS = [
  { re: /<\s*StepForm\b/, what: "<StepForm> — use <SectionForm>" },
  { re: /<\s*StepFormActions\b/, what: "<StepFormActions> — SectionForm owns one shared submit" },
  { re: /<\s*StepIndicator\b/, what: "<StepIndicator> — sections are not numbered stages" },
  { re: /\bStepDef\b/, what: "StepDef type — use SectionDef" },
  { re: /\bcurrentStep\s*=/, what: "currentStep prop — sections have no cursor" },
  { re: /\bonStepChange\s*=/, what: "onStepChange prop — use onOpenChange" },
  { re: /["'`]stepform:/, what: "stepform: localStorage key — section state lives in the URL" },
];

const SUPPRESS = /audit-no-step-wizard-ok:/;

function walk(dir, out = []) {
  let entries;
  try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return out; }
  for (const e of entries) {
    if (SKIP.has(e.name)) continue;
    const full = join(dir, e.name);
    if (e.isDirectory()) walk(full, out);
    else if (EXTS.some((x) => e.name.endsWith(x))) out.push(full);
  }
  return out;
}

const violations = [];
const staleGrandfather = new Set(GRANDFATHERED);

for (const root of SCAN) {
  try { statSync(root); } catch { continue; }
  for (const file of walk(root)) {
    const rel = relative(ROOT, file).split("\\").join("/");
    if (PRIMITIVE_FILES.includes(rel)) continue;

    const lines = readFileSync(file, "utf8").split(/\r?\n/);
    const hits = [];
    lines.forEach((line, i) => {
      // Skip comment-only lines so a doc reference isn't a violation.
      if (/^\s*(\/\/|\*|\/\*)/.test(line)) return;
      if (SUPPRESS.test(line) || (i > 0 && SUPPRESS.test(lines[i - 1]))) return;
      for (const p of PATTERNS) {
        if (p.re.test(line)) hits.push({ line: i + 1, what: p.what });
      }
    });

    if (hits.length === 0) continue;
    if (GRANDFATHERED.includes(rel)) { staleGrandfather.delete(rel); continue; }
    for (const h of hits) violations.push(`${rel}:${h.line} :: ${h.what}`);
  }
}

if (staleGrandfather.size > 0) {
  console.log("[audit-no-step-wizard] migrated — remove from GRANDFATHERED:");
  for (const f of staleGrandfather) console.log(`  ✓ ${f}`);
  console.log("");
}

if (violations.length === 0) {
  const left = GRANDFATHERED.length - staleGrandfather.size;
  console.log(
    `audit-no-step-wizard: clean ✓ (${left} wizard(s) awaiting migration)`,
  );
  process.exit(0);
}

console.error("\n[audit-no-step-wizard] STRICT-ZERO violation(s):\n");
for (const v of violations) console.error(`  - ${v}`);
console.error(
  "\nThe step wizard is being removed. Use <SectionForm> from" +
  " @mohasinac/appkit:\n" +
  "  • sections instead of steps — every one reachable at any time\n" +
  "  • the mandatory section first, open, non-collapsible\n" +
  "  • ONE submit at the bottom, never per-step\n" +
  "  • ?section= in the URL, so a reload keeps its place\n\n" +
  "If a stage genuinely cannot be reached before an earlier one completes," +
  " annotate it:\n  // audit-no-step-wizard-ok: <reason>\n",
);
console.error(`Total: ${violations.length}\n`);
process.exit(1);
