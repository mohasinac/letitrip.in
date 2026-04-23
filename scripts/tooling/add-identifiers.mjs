#!/usr/bin/env node
/**
 * Bulk-add data-section identifiers to <div> and <section> tags that lack any identifier.
 * Scans src/ and appkit/src/ tsx/jsx files.
 * Skips tags that already have: id=, data-testid=, data-qa=, data-section=
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..", "..");

const SCAN_ROOTS = [
  path.join(ROOT, "src"),
  path.join(ROOT, "appkit", "src"),
];

const HAS_IDENTIFIER = /\bid\s*=|\bdata-testid\s*=|\bdata-qa\s*=|\bdata-section\s*=/;

function walk(dir, cb) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, cb);
    } else if (entry.isFile() && (full.endsWith(".tsx") || full.endsWith(".jsx"))) {
      cb(full);
    }
  }
}

let totalChanged = 0;
let totalTagged = 0;
let globalCounter = 0;

for (const root of SCAN_ROOTS) {
  walk(root, (file) => {
    const src = fs.readFileSync(file, "utf8");
    const base = path
      .basename(file, path.extname(file))
      .replace(/[^a-zA-Z0-9]/g, "-")
      .toLowerCase()
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    let localCount = 0;
    // Match <div ...> and <section ...> but not self-closing, not closing tags
    // We do a line-by-line replacement to handle multiline attributes safely
    const updated = src.replace(/<(div|section)\b([^>]*?)>/gs, (match, tag, attrs) => {
      // Skip if already has an identifier
      if (HAS_IDENTIFIER.test(attrs)) return match;
      // Skip if self-closing (shouldn't happen for div/section but be safe)
      if (attrs.trimEnd().endsWith("/")) return match;
      globalCounter++;
      localCount++;
      totalTagged++;
      return `<${tag}${attrs} data-section="${base}-${tag}-${globalCounter}">`;
    });

    if (localCount > 0) {
      fs.writeFileSync(file, updated, "utf8");
      totalChanged++;
      console.log(`  patched ${path.relative(ROOT, file)} (+${localCount})`);
    }
  });
}

console.log(`\nDone. Files changed: ${totalChanged}, Tags added: ${totalTagged}`);
