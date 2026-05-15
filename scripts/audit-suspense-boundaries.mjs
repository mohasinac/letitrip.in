#!/usr/bin/env node
/**
 * audit-suspense-boundaries.mjs — missing <Suspense> on RSC listing page shims.
 *
 * In Next.js 15 App Router, any Client Component that calls useSearchParams()
 * MUST be wrapped in <Suspense> inside the RSC page. Without it, when
 * router.replace() fires (e.g. filter apply, sort change), React cannot
 * suspend correctly and the nearest Error Boundary catches the failure →
 * "Something went wrong" in production.
 *
 * All appkit listing view components call useUrlTable() → useSearchParams().
 * Every RSC page that renders one of these components MUST wrap it in <Suspense>.
 *
 * Root cause this prevents:
 *   Missing <Suspense> causes an unhandled React error on any URL change
 *   triggered by the listing toolbar (filter/sort/pagination), which hits the
 *   Error Boundary and displays "Something went wrong" to the user.
 *
 * Correct:
 *   export default function Page() {
 *     return <Suspense><ProductsIndexPageView /></Suspense>;
 *   }
 *
 * Wrong:
 *   export default function Page() {
 *     return <ProductsIndexPageView />;  // ← no Suspense → crash on filter
 *   }
 *
 * Exits 0 on clean, 1 on violations.
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const PAGES_DIR = join(ROOT, "src", "app");

// Appkit components that call useUrlTable() → useSearchParams() internally.
// Any RSC page.tsx rendering one of these MUST wrap it in <Suspense>.
// Add new listing views here as they are created.
const SUSPENSE_REQUIRED = new Set([
  // Public listing pages
  "ProductsIndexPageView",
  "AuctionsListView",
  "PreOrdersListView",
  "PrizeDrawsListingView",
  "StoresIndexPageView",
  "EventsListPageView",
  "BlogIndexPageView",
  "ReviewsIndexPageView",
  "SellersListView",
  "CategoriesIndexPageView",
  "ScamRegistryView",
  "BundlesListView",
  "CouponsIndexListing",
  // Store sub-listing pages
  "StoreProductsPageView",
  "StoreAuctionsPageView",
  "StorePreOrdersPageView",
  "StorePrizeDrawsPageView",
  "StoreReviewsPageView",
  "StoreBundlesPageView",
  // Category/brand detail pages (have toolbar + filters)
  "CategoryDetailPageView",
  "BrandDetailPageView",
]);

// ─── Walk only page.tsx files ─────────────────────────────────────────────────

function walkPages(dir, files = []) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return files;
  }
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      walkPages(full, files);
    } else if (entry.name === "page.tsx") {
      files.push(full);
    }
  }
  return files;
}

// ─── Collect violations ───────────────────────────────────────────────────────

const violations = [];

for (const file of walkPages(PAGES_DIR)) {
  const content = readFileSync(file, "utf8");

  // Skip pages that already have <Suspense anywhere (wrapping is correct)
  if (content.includes("<Suspense")) continue;

  // Check if the file uses any of the known suspense-required components.
  // Only match JSX open tags (<ComponentName) — this avoids false positives from
  // component names appearing in import statements, comments, or string literals.
  const used = [];
  for (const name of SUSPENSE_REQUIRED) {
    if (new RegExp(`<${name}[\\s/>]`).test(content)) {
      used.push(name);
    }
  }

  if (used.length > 0) {
    violations.push({
      file: relative(ROOT, file),
      components: used,
    });
  }
}

// ─── Report ───────────────────────────────────────────────────────────────────

if (violations.length === 0) {
  console.log("audit-suspense-boundaries: all listing page shims have <Suspense> ✓");
  process.exit(0);
}

const out = [
  `audit-suspense-boundaries: ${violations.length} violation(s) found.\n`,
  "[MISSING_SUSPENSE] RSC page renders a useSearchParams() component without <Suspense>",
  "  Fix: wrap the listing view in <Suspense> — see src/app/[locale]/products/page.tsx for the pattern.",
  "  Without <Suspense>, router.replace() on filter/sort/pagination → React error boundary →",
  '  "Something went wrong" in production.',
  "",
  ...violations.map(
    (v) => `  ${v.file}\n    → needs <Suspense> around: ${v.components.join(", ")}`,
  ),
  "",
  "Pattern:",
  "  import { Suspense } from 'react';",
  "  export default function Page() {",
  "    return <Suspense><YourListingView /></Suspense>;",
  "  }",
];

process.stderr.write(out.join("\n") + "\n");
process.exit(1);
