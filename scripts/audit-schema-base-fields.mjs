#!/usr/bin/env node
/**
 * audit-schema-base-fields — BaseDocument extension enforcement.
 *
 * Rule (scans appkit/src/features/[feature]/schemas/firestore.ts):
 *
 *   MISSING_BASE_DOCUMENT — An interface declares `id: string` as a direct
 *     member but does not extend BaseDocument. Every Firestore collection root
 *     interface must extend BaseDocument from
 *     `_internal/shared/types/base-document.ts` to prevent field-list drift
 *     across the 23 schema files.
 *
 * Strict-zero. Suppression: `// audit-schema-base-ok: <reason>` on the
 * `id:` line OR the line immediately above it. Use only for embedded
 * sub-documents (not collection roots) that legitimately carry their own
 * id without being a direct Firestore collection root.
 *
 * Exit 0 — clean
 * Exit 1 — violations found
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const FEATURES_DIR = join(ROOT, "appkit", "src", "features");

// ── Collect schema files ──────────────────────────────────────────────────────
function collectSchemaFiles() {
  const files = [];
  let entries;
  try {
    entries = readdirSync(FEATURES_DIR, { withFileTypes: true });
  } catch {
    return files;
  }
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const candidate = join(FEATURES_DIR, entry.name, "schemas", "firestore.ts");
    try {
      statSync(candidate);
      files.push(candidate);
    } catch {
      // Schema file does not exist for this feature — skip.
    }
  }
  return files;
}

// ── Rules ─────────────────────────────────────────────────────────────────────

// Matches id member at the start of a trimmed line:
//   id: string;      id?: string;     readonly id: string;
const RE_ID_MEMBER = /^(readonly\s+)?id\s*\??\s*:\s*string\b/;

// Matches an interface declaration (possibly exported, possibly multi-word name)
const RE_INTERFACE = /^(?:export\s+)?interface\s+\w/;

// True when the interface header (up to and including the opening brace) contains
// "extends ... BaseDocument".
function headerExtendsBase(headerLines) {
  const header = headerLines.join(" ");
  return /\bextends\b[^{]*\bBaseDocument\b/.test(header);
}

// ── Scan ──────────────────────────────────────────────────────────────────────
const violations = [];

for (const file of collectSchemaFiles()) {
  let src;
  try {
    src = readFileSync(file, "utf8");
  } catch {
    continue;
  }
  const lines = src.split("\n");
  const rel = relative(ROOT, file).replace(/\\/g, "/");

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const t = raw.trimStart();

    // Skip comment lines
    if (t.startsWith("//") || t.startsWith("*")) continue;

    // Only interested in id: string members (interface member shape)
    if (!RE_ID_MEMBER.test(t)) continue;

    // Suppression on current line or the line above
    const suppressHere = raw.includes("// audit-schema-base-ok:");
    const suppressPrev = i > 0 && lines[i - 1].includes("// audit-schema-base-ok:");
    if (suppressHere || suppressPrev) continue;

    // Scan backward for the nearest `interface` keyword to get enclosing interface
    let headerStart = -1;
    for (let j = i - 1; j >= 0; j--) {
      if (RE_INTERFACE.test(lines[j].trimStart())) {
        headerStart = j;
        break;
      }
    }
    if (headerStart === -1) continue; // Not inside an interface

    // Collect the interface header — from headerStart until the first `{`
    const headerLines = [];
    for (let j = headerStart; j < i; j++) {
      headerLines.push(lines[j]);
      if (lines[j].includes("{")) break;
    }

    if (headerExtendsBase(headerLines)) continue;

    violations.push({ file: rel, line: i + 1, text: t });
  }
}

// ── Report ────────────────────────────────────────────────────────────────────
if (violations.length === 0) {
  console.log("audit-schema-base-fields: clean");
  process.exit(0);
}

console.error(`audit-schema-base-fields: ${violations.length} violation(s).\n`);
console.error("Every Firestore collection root interface must extend BaseDocument:");
console.error("  import { BaseDocument } from '../../_internal/shared/types/base-document';");
console.error("  interface FooDocument extends BaseDocument { /* no id: string here */ }\n");
console.error("For embedded sub-documents (not collection roots), suppress with:");
console.error("  // audit-schema-base-ok: embedded sub-document, not a collection root\n");
for (const v of violations) {
  console.error(`  [MISSING_BASE_DOCUMENT] ${v.file}:${v.line}`);
  console.error(`    ${v.text}`);
}
process.exit(1);
