#!/usr/bin/env node
/**
 * Adds useBottomActions({ bulk }) calls to all views that already use BulkActionBar.
 * This mirrors the desktop BulkActionBar actions for mobile bottom bar support.
 *
 * Strategy:
 * 1. Find all .tsx files in appkit/src/features/ that import BulkActionBar
 * 2. For each file:
 *    a. Add useBottomActions import from the layout barrel
 *    b. Extract the BulkActionBar's actions array
 *    c. Add a useBottomActions({ bulk: ... }) call before the return statement
 *
 * Run: node scripts/add-bottom-actions.mjs [--dry-run]
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from "fs";
import { relative, dirname, join } from "path";

const DRY_RUN = process.argv.includes("--dry-run");

function findFiles(dir, pattern) {
  const results = [];
  try {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      const st = statSync(full);
      if (st.isDirectory()) {
        results.push(...findFiles(full, pattern));
      } else if (full.endsWith(".tsx") && !full.includes("__tests__") && !full.includes("BulkActionBar.tsx")) {
        const content = readFileSync(full, "utf-8");
        if (content.includes("BulkActionBar") && content.includes("<BulkActionBar")) {
          results.push(full.replace(/\\/g, "/"));
        }
      }
    }
  } catch { /* skip */ }
  return results;
}

const files = findFiles("appkit/src/features", "BulkActionBar");

console.log(`Found ${files.length} files with BulkActionBar imports\n`);

let modified = 0;
let skipped = 0;

for (const file of files) {
  const content = readFileSync(file, "utf-8");

  // Skip if already has useBottomActions
  if (content.includes("useBottomActions")) {
    console.log(`  SKIP (already has useBottomActions): ${file}`);
    skipped++;
    continue;
  }

  // Skip if no BulkActionBar JSX usage (just imports type or re-exports)
  if (!content.includes("<BulkActionBar")) {
    console.log(`  SKIP (no <BulkActionBar usage): ${file}`);
    skipped++;
    continue;
  }

  // Compute relative import path to layout barrel
  const fileDir = dirname(file);
  const layoutDir = "appkit/src/features/layout";
  let relPath = relative(fileDir, layoutDir).replace(/\\/g, "/");
  if (!relPath.startsWith(".")) relPath = "./" + relPath;

  let newContent = content;

  // 1. Add useBottomActions import
  // Find where BulkActionBar is imported and add useBottomActions import nearby
  const importPattern = /^(import\s+.*from\s+["'][^"']*["'];?\s*\n)/m;
  const firstImport = newContent.match(importPattern);
  if (!firstImport) {
    console.log(`  SKIP (no imports found): ${file}`);
    skipped++;
    continue;
  }

  // Add import after the first import block
  const layoutImportLine = `import { useBottomActions } from "${relPath}";\n`;

  // Find a good spot - after existing relative imports
  const lastImportIdx = newContent.lastIndexOf("\nimport ");
  if (lastImportIdx === -1) {
    console.log(`  SKIP (can't find import insertion point): ${file}`);
    skipped++;
    continue;
  }
  const nextNewline = newContent.indexOf("\n", lastImportIdx + 1);
  const lineEnd = newContent.indexOf("\n", nextNewline + 1);

  // Insert after the last import's semicolon line
  // Find the end of all imports (first non-import, non-empty, non-type line)
  const lines = newContent.split("\n");
  let lastImportLine = -1;
  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (trimmed.startsWith("import ") || trimmed.startsWith("import{") ||
        trimmed.startsWith("} from") || trimmed === "" ||
        trimmed.startsWith("//") || trimmed.startsWith("export type") ||
        trimmed.startsWith("export {")) {
      if (trimmed.startsWith("import")) lastImportLine = i;
    }
    // Handle multi-line imports
    if (trimmed.endsWith("from") || (trimmed.includes("import") && !trimmed.includes("from"))) {
      // Multi-line import, keep scanning
      continue;
    }
  }

  // Simpler approach: find the line with BulkActionBar import and add after it
  let insertAfterLine = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes("import") && lines[i].includes("from")) {
      insertAfterLine = i;
    }
  }

  if (insertAfterLine === -1) {
    console.log(`  SKIP (no import line found): ${file}`);
    skipped++;
    continue;
  }

  // Check if layout import already exists
  if (!newContent.includes(`from "${relPath}"`)) {
    lines.splice(insertAfterLine + 1, 0, layoutImportLine.trimEnd());
    newContent = lines.join("\n");
  }

  // 2. Find the BulkActionBar JSX and extract its props to build the useBottomActions call
  // Match the <BulkActionBar ... /> block
  const bulkBarMatch = newContent.match(
    /<BulkActionBar\s*\n?\s*selectedCount=\{([^}]+)\}\s*\n?\s*onClearSelection=\{([^}]+)\}\s*\n?\s*actions=\{([^]*?)\}\s*\n?\s*\/>/
  );

  if (!bulkBarMatch) {
    // Try single-line pattern
    const singleLine = newContent.match(
      /<BulkActionBar\s+selectedCount=\{([^}]+)\}\s+onClearSelection=\{([^}]+)\}\s+actions=\{([^]*?)\}\s*\/>/
    );
    if (!singleLine) {
      console.log(`  SKIP (can't parse BulkActionBar props): ${file}`);
      skipped++;
      continue;
    }
  }

  // Instead of parsing JSX, just add a hook call that references the same selection object
  // Find the component function and add the hook before the return

  // Look for the main return ( statement that renders BulkActionBar
  const returnIdx = newContent.lastIndexOf("  return (");
  if (returnIdx === -1) {
    console.log(`  SKIP (can't find return statement): ${file}`);
    skipped++;
    continue;
  }

  // Detect the selection variable name
  let selectionVar = "selection";
  if (newContent.includes("selection.selectedCount")) {
    selectionVar = "selection";
  } else if (newContent.includes("selectedCount={selectedIds.size}")) {
    selectionVar = null; // Custom pattern
  }

  if (!selectionVar) {
    console.log(`  SKIP (custom selection pattern): ${file}`);
    skipped++;
    continue;
  }

  // Extract the actions array from the BulkActionBar JSX
  // Find the actions prop content between actions={( and )} or actions={[...]}
  const actionsStart = newContent.indexOf("actions={", newContent.indexOf("<BulkActionBar"));
  if (actionsStart === -1) {
    console.log(`  SKIP (can't find actions prop): ${file}`);
    skipped++;
    continue;
  }

  // Find matching closing brace
  let braceDepth = 0;
  let actionsContentStart = actionsStart + "actions={".length;
  let actionsContentEnd = actionsContentStart;
  for (let i = actionsContentStart; i < newContent.length; i++) {
    if (newContent[i] === "{" || newContent[i] === "(" || newContent[i] === "[") braceDepth++;
    if (newContent[i] === "}" || newContent[i] === ")" || newContent[i] === "]") {
      braceDepth--;
      if (braceDepth <= 0) {
        actionsContentEnd = i + 1;
        break;
      }
    }
  }

  const actionsContent = newContent.slice(actionsContentStart, actionsContentEnd).trim();

  // Build the useBottomActions call
  const hookCall = `  useBottomActions(${selectionVar}.selectedCount > 0 ? { bulk: { selectedCount: ${selectionVar}.selectedCount, onClearSelection: ${selectionVar}.clearSelection, actions: ${actionsContent} } } : {});\n\n`;

  // Insert before the return
  newContent = newContent.slice(0, returnIdx) + hookCall + newContent.slice(returnIdx);

  if (DRY_RUN) {
    console.log(`  WOULD modify: ${file}`);
  } else {
    writeFileSync(file, newContent, "utf-8");
    console.log(`  MODIFIED: ${file}`);
  }
  modified++;
}

console.log(`\nDone. Modified: ${modified}, Skipped: ${skipped}, Total: ${files.length}`);
