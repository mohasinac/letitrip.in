#!/usr/bin/env node
/**
 * migrate-to-appkit.mjs
 *
 * Phase 40: Replaces all @mohasinac/* v1.x imports in src/ with
 * @mohasinac/appkit/* sub-path imports (v2.0.0).
 *
 * Run: node scripts/migrate-to-appkit.mjs
 *      node scripts/migrate-to-appkit.mjs --dry-run
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SRC = path.join(ROOT, "src");
const DRY_RUN = process.argv.includes("--dry-run");

// ─── Import path mapping (@mohasinac/X → @mohasinac/appkit/Y) ────────────────

const IMPORT_MAP = {
  // Primitives
  "@mohasinac/contracts": "@mohasinac/appkit/contracts",
  "@mohasinac/core": "@mohasinac/appkit/core",
  "@mohasinac/http": "@mohasinac/appkit/http",
  "@mohasinac/errors": "@mohasinac/appkit/errors",
  "@mohasinac/utils": "@mohasinac/appkit/utils",
  "@mohasinac/validation": "@mohasinac/appkit/validation",
  "@mohasinac/tokens": "@mohasinac/appkit/tokens",
  "@mohasinac/next": "@mohasinac/appkit/next",
  "@mohasinac/react": "@mohasinac/appkit/react",
  "@mohasinac/ui": "@mohasinac/appkit/ui",
  "@mohasinac/security": "@mohasinac/appkit/security",
  "@mohasinac/seo": "@mohasinac/appkit/seo",
  "@mohasinac/monitoring": "@mohasinac/appkit/monitoring",
  "@mohasinac/instrumentation": "@mohasinac/appkit/instrumentation",
  "@mohasinac/css-tailwind": "@mohasinac/appkit/style/tailwind",
  "@mohasinac/css-vanilla": "@mohasinac/appkit/style/vanilla",
  // Providers
  "@mohasinac/db-firebase": "@mohasinac/appkit/providers/db-firebase",
  "@mohasinac/auth-firebase": "@mohasinac/appkit/providers/auth-firebase",
  "@mohasinac/email-resend": "@mohasinac/appkit/providers/email-resend",
  "@mohasinac/storage-firebase": "@mohasinac/appkit/providers/storage-firebase",
  "@mohasinac/payment-razorpay": "@mohasinac/appkit/providers/payment-razorpay",
  "@mohasinac/search-algolia": "@mohasinac/appkit/providers/search-algolia",
  "@mohasinac/shipping-shiprocket":
    "@mohasinac/appkit/providers/shipping-shiprocket",
  // Features
  "@mohasinac/feat-layout": "@mohasinac/appkit/features/layout",
  "@mohasinac/feat-forms": "@mohasinac/appkit/features/forms",
  "@mohasinac/feat-filters": "@mohasinac/appkit/features/filters",
  "@mohasinac/feat-media": "@mohasinac/appkit/features/media",
  "@mohasinac/feat-auth": "@mohasinac/appkit/features/auth",
  "@mohasinac/feat-account": "@mohasinac/appkit/features/account",
  "@mohasinac/feat-admin": "@mohasinac/appkit/features/admin",
  "@mohasinac/feat-blog": "@mohasinac/appkit/features/blog",
  "@mohasinac/feat-cart": "@mohasinac/appkit/features/cart",
  "@mohasinac/feat-categories": "@mohasinac/appkit/features/categories",
  "@mohasinac/feat-checkout": "@mohasinac/appkit/features/checkout",
  "@mohasinac/feat-collections": "@mohasinac/appkit/features/collections",
  "@mohasinac/feat-consultation": "@mohasinac/appkit/features/consultation",
  "@mohasinac/feat-corporate": "@mohasinac/appkit/features/corporate",
  "@mohasinac/feat-events": "@mohasinac/appkit/features/events",
  "@mohasinac/feat-faq": "@mohasinac/appkit/features/faq",
  "@mohasinac/feat-homepage": "@mohasinac/appkit/features/homepage",
  "@mohasinac/feat-loyalty": "@mohasinac/appkit/features/loyalty",
  "@mohasinac/feat-orders": "@mohasinac/appkit/features/orders",
  "@mohasinac/feat-payments": "@mohasinac/appkit/features/payments",
  "@mohasinac/feat-products": "@mohasinac/appkit/features/products",
  "@mohasinac/feat-promotions": "@mohasinac/appkit/features/promotions",
  "@mohasinac/feat-reviews": "@mohasinac/appkit/features/reviews",
  "@mohasinac/feat-search": "@mohasinac/appkit/features/search",
  "@mohasinac/feat-seller": "@mohasinac/appkit/features/seller",
  "@mohasinac/feat-stores": "@mohasinac/appkit/features/stores",
  "@mohasinac/feat-wishlist": "@mohasinac/appkit/features/wishlist",
  "@mohasinac/feat-auctions": "@mohasinac/appkit/features/auctions",
  "@mohasinac/feat-pre-orders": "@mohasinac/appkit/features/pre-orders",
  "@mohasinac/feat-preorders": "@mohasinac/appkit/features/pre-orders",
  "@mohasinac/feat-before-after": "@mohasinac/appkit/features/before-after",
  "@mohasinac/feat-whatsapp-bot":
    "@mohasinac/appkit/features/whatsapp-bot",
  // CLI / seed
  "@mohasinac/cli": "@mohasinac/appkit/cli",
  "@mohasinac/seed": "@mohasinac/appkit/seed",
  // NOTE: @mohasinac/sievejs is third-party — NOT migrated
};

// ─── Escape string for use in regex ──────────────────────────────────────────

function escapeForRegex(str) {
  return str.replace(/[/\\^$*+?.()|[\]{}]/g, "\\$&");
}

// ─── Build combined regex for all keys sorted by length desc (longest match first) ─────

const sortedKeys = Object.keys(IMPORT_MAP).sort((a, b) => b.length - a.length);
const importRegex = new RegExp(
  `(['"])(${sortedKeys.map(escapeForRegex).join("|")})([/]?)(['"])`,
  "g",
);

// ─── Walk src/ recursively ────────────────────────────────────────────────────

function walkDir(dir, exts, cb) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === ".next") continue;
      walkDir(fullPath, exts, cb);
    } else if (exts.some((e) => entry.name.endsWith(e))) {
      cb(fullPath);
    }
  }
}

// ─── Transform a single file ──────────────────────────────────────────────────

let totalFiles = 0;
let changedFiles = 0;
const changes = [];

// Root-level TS files that also need to be migrated
const ROOT_FILES = ["instrumentation.ts", "proxy.ts"].map((f) =>
  path.join(ROOT, f),
);

function processFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  totalFiles++;
  const original = fs.readFileSync(filePath, "utf8");
  const updated = original.replace(importRegex, (_, q1, pkg, trailingSlash, q2) => {
    const mapped = IMPORT_MAP[pkg];
    return `${q1}${mapped}${trailingSlash}${q2}`;
  });

  if (updated !== original) {
    changedFiles++;
    const rel = path.relative(ROOT, filePath);
    const diff = (original.match(importRegex) || []).length;
    changes.push({ file: rel, count: diff });
    if (!DRY_RUN) {
      fs.writeFileSync(filePath, updated, "utf8");
    }
  }
}

for (const f of ROOT_FILES) processFile(f);

walkDir(SRC, [".ts", ".tsx", ".mjs", ".js"], processFile);

// ─── Update package.json ──────────────────────────────────────────────────────

const pkgPath = path.join(ROOT, "package.json");
const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));

const depsToRemove = new Set(sortedKeys);
// Keep @mohasinac/sievejs
depsToRemove.delete("@mohasinac/sievejs");

let pkgChanged = false;
for (const section of ["dependencies", "devDependencies"]) {
  if (!pkg[section]) continue;
  for (const dep of Object.keys(pkg[section])) {
    if (depsToRemove.has(dep)) {
      if (!DRY_RUN) delete pkg[section][dep];
      pkgChanged = true;
    }
  }
}
if (pkgChanged) {
  if (!pkg.dependencies) pkg.dependencies = {};
  if (!DRY_RUN) {
    pkg.dependencies["@mohasinac/appkit"] = "^2.0.0";
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n", "utf8");
  }
}

// ─── Report ──────────────────────────────────────────────────────────────────

console.log(
  `\n@mohasinac/appkit migration${DRY_RUN ? " [DRY RUN]" : ""}\n${"─".repeat(50)}`,
);
console.log(`Scanned : ${totalFiles} files`);
console.log(`Modified: ${changedFiles} files\n`);
for (const { file, count } of changes) {
  console.log(`  ✓ ${file}  (${count} import${count === 1 ? "" : "s"})`);
}
if (pkgChanged) {
  console.log(
    `\n  ✓ package.json — added @mohasinac/appkit@^2.0.0, removed ${[...depsToRemove].filter((k) => pkg.dependencies?.[k] !== undefined || true).length} old deps`,
  );
}
console.log("\nDone.");
