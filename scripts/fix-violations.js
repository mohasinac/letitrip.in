#!/usr/bin/env node
/**
 * fix-violations.js
 *
 * Reads violations.json (produced by check-violations.js) and auto-fixes all
 * violations that have autoFixable: true.
 *
 * Usage:
 *   node scripts/fix-violations.js                          # dry run (safe)
 *   node scripts/fix-violations.js --apply                  # write fixes to disk
 *   node scripts/fix-violations.js --apply --code I18N-001  # specific code(s) only
 *   node scripts/fix-violations.js --apply --code ARCH-001,I18N-001,I18N-002
 *
 * Auto-fixable rule codes (add a new entry to FIXERS to extend):
 *   ARCH-001  — collapse deep barrel sub-path imports to top-level barrel
 *   I18N-001  — rewrite 'next/navigation' import to '@/i18n/navigation'
 *   I18N-002  — rewrite 'next/link' import to '@/i18n/navigation' (merging if needed)
 *
 * ─── HOW TO ADD A NEW FIXER ─────────────────────────────────────────────────
 * 1. In check-violations.js set `autoFixable: true` for the rule in RULE_META.
 * 2. Append an entry to the FIXERS array below with:
 *      code        — must match the rule code in check-violations.js
 *      description — one-line human description
 *      apply(content, filePath) → string | null
 *                  Return the updated file content, or null if nothing changed.
 * ─────────────────────────────────────────────────────────────────────────────
 */

"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const VIOLATIONS_FILE = path.join(ROOT, "violations.json");

// ─── Fixers ──────────────────────────────────────────────────────────────────

const FIXERS = [
  // ── ARCH-001: Collapse deep barrel sub-path imports ───────────────────────
  // @/components/ui/Button  →  @/components
  // @/utils/validators/email  →  @/utils
  {
    code: "ARCH-001",
    description: "Collapse deep sub-path barrel imports to top-level barrel",
    apply(content) {
      const pat =
        /from\s+(['"])(@\/(components|hooks|utils|helpers|classes|services|constants|repositories))\/[^'"]+\1/g;
      if (!pat.test(content)) return null;
      pat.lastIndex = 0;
      return content.replace(pat, (_, q, barrel) => `from ${q}${barrel}${q}`);
    },
  },

  // ── I18N-001: Rewrite 'next/navigation' → '@/i18n/navigation' ────────────
  {
    code: "I18N-001",
    description:
      "Replace 'next/navigation' import source with '@/i18n/navigation'",
    apply(content) {
      if (!/from\s+['"]next\/navigation['"]/.test(content)) return null;
      return content.replace(
        /(from\s+['"])next\/navigation(['"])/g,
        "$1@/i18n/navigation$2",
      );
    },
  },

  // ── I18N-002: Rewrite 'next/link' → '@/i18n/navigation' ─────────────────
  // If @/i18n/navigation is already imported, Link is merged into that import
  // and the next/link line is removed to avoid the duplicate.
  {
    code: "I18N-002",
    description:
      "Replace 'next/link' import source with '@/i18n/navigation' (merges if already present)",
    apply(content) {
      if (!/from\s+['"]next\/link['"]/.test(content)) return null;

      const alreadyHasI18nNav = /from\s+['"]@\/i18n\/navigation['"]/.test(
        content,
      );

      if (!alreadyHasI18nNav) {
        // Simple replacement — no existing @/i18n/navigation import
        return content.replace(
          /(from\s+['"])next\/link(['"])/g,
          "$1@/i18n/navigation$2",
        );
      }

      // Merge: extract what's imported from next/link, remove that line, add to
      // the existing @/i18n/navigation named-import block.

      // Named import:  import { Link, ... } from 'next/link'
      const namedMatch = content.match(
        /import\s+\{([^}]+)\}\s+from\s+['"]next\/link['"]/,
      );
      // Default import: import Link from 'next/link'
      const defaultMatch = content.match(
        /import\s+(\w+)\s+from\s+['"]next\/link['"]/,
      );

      const importsToMerge = namedMatch
        ? namedMatch[1]
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : defaultMatch
          ? [defaultMatch[1]]
          : [];

      if (importsToMerge.length === 0) return null;

      // Remove the next/link import line (named or default form)
      let updated = content
        .replace(
          /^[ \t]*import\s+\{[^}]+\}\s+from\s+['"]next\/link['"][;\s]*\r?\n/m,
          "",
        )
        .replace(
          /^[ \t]*import\s+\w+\s+from\s+['"]next\/link['"][;\s]*\r?\n/m,
          "",
        );

      // Merge into the existing @/i18n/navigation named import
      // Handle both single-line and potentially multi-line named imports
      updated = updated.replace(
        /import\s+\{([^}]+)\}\s+from\s+(['"])@\/i18n\/navigation\2/,
        (_, existing, q) => {
          const existingExports = existing
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
          const merged = [...new Set([...existingExports, ...importsToMerge])];
          return `import { ${merged.join(", ")} } from ${q}@/i18n/navigation${q}`;
        },
      );

      return updated === content ? null : updated;
    },
  },
];

// Build lookup: code → fixer
const FIXER_MAP = Object.fromEntries(FIXERS.map((f) => [f.code, f]));

// ─── Helpers ─────────────────────────────────────────────────────────────────

function norm(p) {
  return p.replace(/\\/g, "/");
}

function parseCodeList(str) {
  return (str || "")
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);
}

// Simple unified-diff style summary — shows changed lines only
function diffSummary(before, after) {
  const bLines = before.split("\n");
  const aLines = after.split("\n");
  const changes = [];
  const maxLen = Math.max(bLines.length, aLines.length);
  for (let i = 0; i < maxLen; i++) {
    const b = bLines[i];
    const a = aLines[i];
    if (b !== a) {
      if (b !== undefined) changes.push(`  - [L${i + 1}] ${b.trim()}`);
      if (a !== undefined) changes.push(`  + [L${i + 1}] ${a.trim()}`);
    }
  }
  return changes.slice(0, 20); // cap at 20 diff lines per file
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function main() {
  const args = process.argv.slice(2);
  const apply = args.includes("--apply");

  // --code X,Y,Z  or  --code=X,Y,Z
  const codeArgRaw = args.find((a) => a.startsWith("--code"));
  let filterCodes = [];
  if (codeArgRaw) {
    const val = codeArgRaw.includes("=")
      ? codeArgRaw.split("=")[1]
      : args[args.indexOf(codeArgRaw) + 1];
    filterCodes = parseCodeList(val);
  }

  // ── Load violations.json ──────────────────────────────────────────────────
  if (!fs.existsSync(VIOLATIONS_FILE)) {
    console.error("\n❌  violations.json not found.");
    console.error("   Run first:  node scripts/check-violations.js\n");
    process.exit(1);
  }

  let report;
  try {
    report = JSON.parse(fs.readFileSync(VIOLATIONS_FILE, "utf8"));
  } catch (e) {
    console.error(`\n❌  Could not parse violations.json: ${e.message}\n`);
    process.exit(1);
  }

  // ── Filter to fixable violations ─────────────────────────────────────────
  const fixable = report.violations.filter((v) => {
    if (!v.autoFixable) return false;
    if (!FIXER_MAP[v.code]) return false;
    if (filterCodes.length > 0 && !filterCodes.includes(v.code)) return false;
    return true;
  });

  const mode = apply ? "APPLY" : "DRY RUN";
  console.log(`\n${apply ? "🔧" : "🔍"}  fix-violations  [${mode}]`);
  console.log(`   violations.json generated: ${report.generatedAt}`);

  if (fixable.length === 0) {
    const why =
      filterCodes.length > 0
        ? `for code(s): ${filterCodes.join(", ")}`
        : "(all are manual-fix only)";
    console.log(`\n✅  No auto-fixable violations found ${why}.`);
    console.log(
      "   Run  node scripts/check-violations.js  to refresh the report.\n",
    );
    return;
  }

  const codesPresent = [...new Set(fixable.map((v) => v.code))];
  console.log(`\n   Violations to fix : ${fixable.length}`);
  console.log(`   Codes             : ${codesPresent.join(", ")}`);
  if (!apply) {
    console.log("\n   (Dry run — use --apply to write changes)\n");
  }

  // ── Group by file ─────────────────────────────────────────────────────────
  const byFile = /** @type {Record<string, { codes: Set<string> }>} */ ({});
  for (const v of fixable) {
    if (!byFile[v.file]) byFile[v.file] = { codes: new Set() };
    byFile[v.file].codes.add(v.code);
  }

  // ── Apply fixers file by file ─────────────────────────────────────────────
  let filesChanged = 0;
  let filesSkipped = 0;
  let fixesApplied = 0;

  const results = [];

  for (const [relFilePath, { codes }] of Object.entries(byFile)) {
    const absPath = path.join(ROOT, relFilePath.replace(/\//g, path.sep));

    let original;
    try {
      original = fs.readFileSync(absPath, "utf8");
    } catch {
      console.warn(`  ⚠  Cannot read ${relFilePath} — skipped`);
      filesSkipped++;
      continue;
    }

    let updated = original;
    const appliedCodes = [];

    for (const code of codes) {
      const fixer = FIXER_MAP[code];
      if (!fixer) continue;
      const result = fixer.apply(updated, absPath);
      if (result !== null && result !== updated) {
        updated = result;
        appliedCodes.push(code);
      }
    }

    if (updated === original) {
      results.push({
        file: relFilePath,
        status: "unchanged",
        codes: [...codes],
      });
      continue;
    }

    filesChanged++;
    fixesApplied += appliedCodes.length;

    if (apply) {
      fs.writeFileSync(absPath, updated, "utf8");
      results.push({ file: relFilePath, status: "fixed", codes: appliedCodes });
    } else {
      // Show a compact diff in dry-run mode
      const diff = diffSummary(original, updated);
      results.push({
        file: relFilePath,
        status: "would-fix",
        codes: appliedCodes,
        diff,
      });
    }
  }

  // ── Print results ─────────────────────────────────────────────────────────
  console.log("");
  for (const r of results) {
    if (r.status === "unchanged") {
      console.log(`  ⏭  ${r.file}  (no textual change after fixers ran)`);
    } else if (r.status === "fixed") {
      console.log(`  ✅  ${r.file}  [${r.codes.join(", ")}]`);
    } else {
      console.log(`  📝  ${r.file}  [${r.codes.join(", ")}]`);
      for (const line of r.diff || []) console.log(`      ${line}`);
    }
  }

  console.log("");
  if (apply) {
    console.log(
      `✅  Fixed ${fixesApplied} rule(s) across ${filesChanged} file(s).`,
    );
    if (filesSkipped > 0)
      console.log(
        `⚠️  ${filesSkipped} file(s) could not be read and were skipped.`,
      );
    console.log("\n   Re-run check to update the report:");
    console.log("   node scripts/check-violations.js\n");
  } else {
    console.log(
      `📝  Would fix ${fixesApplied} rule(s) across ${filesChanged} file(s).`,
    );
    console.log("\n   Apply with:");
    const codeFlag =
      filterCodes.length > 0 ? ` --code ${filterCodes.join(",")}` : "";
    console.log(`   node scripts/fix-violations.js --apply${codeFlag}\n`);
  }
}

main();
