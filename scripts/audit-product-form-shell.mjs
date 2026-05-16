#!/usr/bin/env node
/**
 * audit-product-form-shell.mjs
 *
 * Ensures that no consumer page or component renders SellerCreateProductView or
 * SellerEditProductView as a bare JSX element.
 *
 * WHY THIS MATTERS
 * ─────────────────
 * Both views accept optional render props (`renderCategorySelector`,
 * `renderBrandSelector`) that, when absent, fall back to plain <input type="text">
 * fields for Category and Brand.  Every product-creation / edit page in this
 * project must wire in the paginated inline selectors so sellers can search and
 * pick (not free-type) categories and brands.
 *
 * The correct pattern is to use the wrapper components that inject the pickers:
 *
 *   import { StoreCreateProductShell } from "@/components/store/SellerProductFormShell";
 *   // or
 *   import { StoreEditProductShell } from "@/components/store/SellerProductFormShell";
 *
 * The wrappers automatically pass:
 *   renderCategorySelector → <CategoryInlineSelect> (paginated search)
 *   renderBrandSelector    → <BrandInlineSelect>    (paginated search + inline create)
 *
 * EXCEPTIONS
 * ──────────
 * Appkit-internal files (appkit/src/**) are excluded — they *define* the views.
 * The SellerProductFormShell wrapper itself is excluded (it imports the views
 * legitimately to wrap them).
 * Add `// audit-product-form-shell-ok` on the same line to suppress a specific hit
 * if a future page genuinely needs a custom render-prop override instead.
 *
 * Exits 0 on clean, 1 on violations.
 */

import { readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

// Components that must NOT be used as bare JSX in consumer files.
// Key = bare view name, value = recommended replacement.
const BARE_VIEWS = {
  SellerCreateProductView: "StoreCreateProductShell",
  SellerEditProductView: "StoreEditProductShell",
};

// Files that are allowed to import/render these views directly.
const ALLOWLISTED_PATHS = new Set([
  // The wrapper that legitimately wraps these views
  join("src", "components", "store", "SellerProductFormShell.tsx"),
]);

// Directories that should never be scanned (source definitions live here)
const SKIP_DIRS = new Set(["node_modules", ".next", "dist", "appkit"]);

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
    } else if (/\.(tsx|ts)$/.test(entry.name)) {
      files.push(full);
    }
  }
  return files;
}

const violations = [];

for (const absPath of walk(join(ROOT, "src"))) {
  const rel = relative(ROOT, absPath);

  if (ALLOWLISTED_PATHS.has(rel)) continue;

  const content = readFileSync(absPath, "utf8");

  for (const [viewName, replacement] of Object.entries(BARE_VIEWS)) {
    // Match JSX open tag: <ViewName followed by whitespace, / or >
    // This avoids matching import statements, type annotations, and comments.
    const jsxPattern = new RegExp(`<${viewName}[\\s/>]`);
    if (!jsxPattern.test(content)) continue;

    // Allow explicit suppression on the same line
    const lines = content.split("\n");
    const hitLines = lines
      .map((line, i) => ({ line, no: i + 1 }))
      .filter(
        ({ line }) =>
          new RegExp(`<${viewName}[\\s/>]`).test(line) &&
          !line.includes("// audit-product-form-shell-ok"),
      );

    if (hitLines.length > 0) {
      violations.push({
        file: rel,
        view: viewName,
        replacement,
        lines: hitLines.map(({ no }) => no),
      });
    }
  }
}

if (violations.length === 0) {
  console.log("audit-product-form-shell: all product form pages use the shell wrappers ✓");
  process.exit(0);
}

const lines = [
  `audit-product-form-shell: ${violations.length} violation(s) found.\n`,
  "[BARE_PRODUCT_VIEW] Bare SellerCreateProductView / SellerEditProductView used without render props.",
  "  Category and Brand fields fall back to plain <input type=text> when render props are absent.",
  "  Fix: replace with the wrapper from src/components/store/SellerProductFormShell.tsx",
  "  which automatically injects CategoryInlineSelect + BrandInlineSelect.",
  "",
  ...violations.map(
    (v) =>
      `  ${v.file}:${v.lines.join(",")}  <${v.view}>\n` +
      `    → replace with: <${v.replacement}> from "@/components/store/SellerProductFormShell"`,
  ),
  "",
  "Pattern:",
  '  import { StoreCreateProductShell } from "@/components/store/SellerProductFormShell";',
  "  return (",
  "    <StoreCreateProductShell",
  '      listingType="auction"',
  "      onSave={handleSave}",
  "      onPublish={handlePublish}",
  "    />",
  "  );",
  "",
  "To suppress a specific hit that intentionally passes its own render props:",
  '  <SellerCreateProductView // audit-product-form-shell-ok',
];

process.stderr.write(lines.join("\n") + "\n");
process.exit(1);
