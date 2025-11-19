/**
 * TypeScript Warning Cleanup Script
 *
 * This script identifies and helps fix unused variable/import warnings
 * Run with: npx ts-node scripts/cleanup-warnings.ts
 */

interface Warning {
  file: string;
  line: number;
  variable: string;
  type: "unused-variable" | "unused-import";
}

const warnings: Warning[] = [
  // Admin Auctions
  {
    file: "src/app/admin/auctions/moderation/page.tsx",
    line: 8,
    variable: "TableCheckbox",
    type: "unused-import",
  },
  {
    file: "src/app/admin/auctions/moderation/page.tsx",
    line: 19,
    variable: "AlertTriangle",
    type: "unused-import",
  },
  {
    file: "src/app/admin/auctions/page.tsx",
    line: 6,
    variable: "Plus",
    type: "unused-import",
  },
  {
    file: "src/app/admin/auctions/page.tsx",
    line: 23,
    variable: "StatusBadge",
    type: "unused-variable",
  },
  {
    file: "src/app/admin/auctions/page.tsx",
    line: 28,
    variable: "InlineEditRow",
    type: "unused-import",
  },
  {
    file: "src/app/admin/auctions/page.tsx",
    line: 29,
    variable: "QuickCreateRow",
    type: "unused-import",
  },
  {
    file: "src/app/admin/auctions/page.tsx",
    line: 37,
    variable: "AuctionFE",
    type: "unused-import",
  },
  {
    file: "src/app/admin/auctions/page.tsx",
    line: 72,
    variable: "editingId",
    type: "unused-variable",
  },
  {
    file: "src/app/admin/auctions/page.tsx",
    line: 72,
    variable: "setEditingId",
    type: "unused-variable",
  },
  {
    file: "src/app/admin/auctions/page.tsx",
    line: 142,
    variable: "fields",
    type: "unused-variable",
  },

  // Admin Blog
  {
    file: "src/app/admin/blog/[id]/edit/page.tsx",
    line: 15,
    variable: "user",
    type: "unused-variable",
  },
  {
    file: "src/app/admin/blog/create/page.tsx",
    line: 14,
    variable: "user",
    type: "unused-variable",
  },
  {
    file: "src/app/admin/blog/page.tsx",
    line: 16,
    variable: "Home",
    type: "unused-import",
  },

  // Admin Categories
  {
    file: "src/app/admin/categories/[slug]/edit/page.tsx",
    line: 33,
    variable: "setError",
    type: "unused-variable",
  },
  {
    file: "src/app/admin/categories/create/page.tsx",
    line: 42,
    variable: "user",
    type: "unused-variable",
  },
  {
    file: "src/app/admin/categories/page.tsx",
    line: 24,
    variable: "InlineImageUpload",
    type: "unused-import",
  },
  {
    file: "src/app/admin/categories/page.tsx",
    line: 27,
    variable: "BulkAction",
    type: "unused-import",
  },
  {
    file: "src/app/admin/categories/page.tsx",
    line: 67,
    variable: "validationErrors",
    type: "unused-variable",
  },

  // Admin Coupons
  {
    file: "src/app/admin/coupons/page.tsx",
    line: 21,
    variable: "validateForm",
    type: "unused-variable",
  },

  // Admin Dashboard
  {
    file: "src/app/admin/dashboard/page.tsx",
    line: 18,
    variable: "CheckCircle",
    type: "unused-import",
  },

  // Admin Hero Slides
  {
    file: "src/app/admin/hero-slides/page.tsx",
    line: 6,
    variable: "Plus",
    type: "unused-import",
  },
  {
    file: "src/app/admin/hero-slides/page.tsx",
    line: 8,
    variable: "Trash2",
    type: "unused-import",
  },
  {
    file: "src/app/admin/hero-slides/page.tsx",
    line: 31,
    variable: "BulkAction",
    type: "unused-variable",
  },
  {
    file: "src/app/admin/hero-slides/page.tsx",
    line: 41,
    variable: "validationErrors",
    type: "unused-variable",
  },

  // Admin Homepage
  {
    file: "src/app/admin/homepage/page.tsx",
    line: 7,
    variable: "Settings",
    type: "unused-import",
  },

  // Admin Orders
  {
    file: "src/app/admin/orders/[id]/page.tsx",
    line: 19,
    variable: "setError",
    type: "unused-variable",
  },
  {
    file: "src/app/admin/orders/page.tsx",
    line: 28,
    variable: "StatusBadge",
    type: "unused-variable",
  },
  {
    file: "src/app/admin/orders/page.tsx",
    line: 34,
    variable: "router",
    type: "unused-variable",
  },
  {
    file: "src/app/admin/orders/page.tsx",
    line: 42,
    variable: "shops",
    type: "unused-variable",
  },
  {
    file: "src/app/admin/orders/page.tsx",
    line: 67,
    variable: "selectedIds",
    type: "unused-variable",
  },
  {
    file: "src/app/admin/orders/page.tsx",
    line: 67,
    variable: "setSelectedIds",
    type: "unused-variable",
  },

  // Admin Payouts
  {
    file: "src/app/admin/payouts/page.tsx",
    line: 12,
    variable: "PAYOUT_FILTERS",
    type: "unused-variable",
  },
  {
    file: "src/app/admin/payouts/page.tsx",
    line: 14,
    variable: "Download",
    type: "unused-import",
  },

  // Admin Products
  {
    file: "src/app/admin/products/[id]/edit/page.tsx",
    line: 13,
    variable: "ImageIcon",
    type: "unused-import",
  },
  {
    file: "src/app/admin/products/[id]/edit/page.tsx",
    line: 14,
    variable: "VideoIcon",
    type: "unused-import",
  },
  {
    file: "src/app/admin/products/[id]/edit/page.tsx",
    line: 16,
    variable: "Link",
    type: "unused-variable",
  },
  {
    file: "src/app/admin/products/[id]/edit/page.tsx",
    line: 25,
    variable: "ProductFormFE",
    type: "unused-import",
  },
  {
    file: "src/app/admin/products/[id]/edit/page.tsx",
    line: 89,
    variable: "uploadedMedia",
    type: "unused-variable",
  },
  {
    file: "src/app/admin/products/page.tsx",
    line: 7,
    variable: "Plus",
    type: "unused-import",
  },
  {
    file: "src/app/admin/products/page.tsx",
    line: 16,
    variable: "CheckCircle",
    type: "unused-import",
  },
  {
    file: "src/app/admin/products/page.tsx",
    line: 17,
    variable: "XCircle",
    type: "unused-import",
  },
  {
    file: "src/app/admin/products/page.tsx",
    line: 26,
    variable: "QuickCreateRow",
    type: "unused-import",
  },
  {
    file: "src/app/admin/products/page.tsx",
    line: 28,
    variable: "InlineImageUpload",
    type: "unused-import",
  },
  {
    file: "src/app/admin/products/page.tsx",
    line: 31,
    variable: "BulkAction",
    type: "unused-import",
  },
  {
    file: "src/app/admin/products/page.tsx",
    line: 37,
    variable: "ProductFiltersBE",
    type: "unused-variable",
  },
  {
    file: "src/app/admin/products/page.tsx",
    line: 77,
    variable: "validationErrors",
    type: "unused-variable",
  },

  // Admin Returns
  {
    file: "src/app/admin/returns/page.tsx",
    line: 8,
    variable: "BulkActionBar",
    type: "unused-import",
  },
  {
    file: "src/app/admin/returns/page.tsx",
    line: 9,
    variable: "TableCheckbox",
    type: "unused-import",
  },
  {
    file: "src/app/admin/returns/page.tsx",
    line: 21,
    variable: "selectedReturns",
    type: "unused-variable",
  },
  {
    file: "src/app/admin/returns/page.tsx",
    line: 21,
    variable: "setSelectedReturns",
    type: "unused-variable",
  },
];

console.log("TypeScript Warning Cleanup Report");
console.log("==================================\n");

console.log(`Total warnings: ${warnings.length}\n`);

// Group by file
const byFile = warnings.reduce((acc, warning) => {
  if (!acc[warning.file]) {
    acc[warning.file] = [];
  }
  acc[warning.file].push(warning);
  return acc;
}, {} as Record<string, Warning[]>);

console.log("Warnings by file:\n");
Object.entries(byFile).forEach(([file, fileWarnings]) => {
  console.log(`${file} (${fileWarnings.length} warnings)`);
  fileWarnings.forEach((w) => {
    console.log(`  Line ${w.line}: ${w.variable} (${w.type})`);
  });
  console.log("");
});

console.log("\nRecommended Actions:");
console.log("1. Remove unused imports from import statements");
console.log("2. Remove unused variable declarations");
console.log(
  "3. Add // eslint-disable-next-line @typescript-eslint/no-unused-vars if variable is needed for future use"
);
console.log(
  "\nNote: These are all pre-existing warnings in admin pages, not related to Phase 3 or Quick Wins."
);
