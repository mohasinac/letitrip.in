#!/usr/bin/env node
/**
 * audit-page-rbac — strict-zero.
 *
 * Every page.tsx under src/app/[locale]/admin/, store/, user/ MUST have an
 * ancestor layout (any layout.tsx walked back to [locale]/) that either:
 *
 *   - Calls makeAdminSectionLayout(permission), OR
 *   - Renders <RoleGuard role={...}>.
 *
 * Exit 0 — clean.
 * Exit 1 — at least one dashboard page lacks an RBAC ancestor.
 */

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const APP_LOCALE = join(ROOT, "src", "app", "[locale]");
const GATED = ["admin", "store", "user"];

const SKIP = new Set(["node_modules", "dist", ".next", ".git"]);

function walkPages(dir, out = []) {
  let entries;
  try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return out; }
  for (const e of entries) {
    if (SKIP.has(e.name)) continue;
    const full = join(dir, e.name);
    if (e.isDirectory()) walkPages(full, out);
    else if (e.name === "page.tsx" || e.name === "page.ts") out.push(full);
  }
  return out;
}

function hasGuard(layoutPath) {
  if (!existsSync(layoutPath)) return false;
  const src = readFileSync(layoutPath, "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/(^|\s)\/\/[^\n]*/g, "$1 ");
  // Accepted guard patterns:
  //   - makeAdminSectionLayout(permission)
  //   - <RoleGuard role={...}>
  //   - role predicate + redirect (isAdminUser / isSellerUser / isModeratorUser
  //     / isEmployeeUser etc. paired with a redirect call) — this is the
  //     canonical RSC pattern in admin/layout.tsx and store/layout.tsx.
  if (/\bmakeAdminSectionLayout\s*\(/.test(src)) return true;
  if (/<\s*RoleGuard\b/.test(src)) return true;
  const hasPredicate = /\bis(?:Admin|Seller|Moderator|Employee|Buyer)User\s*\(/.test(src);
  const hasRedirect = /\bredirect\s*\(/.test(src);
  if (hasPredicate && hasRedirect) return true;
  return false;
}

const violations = [];

for (const section of GATED) {
  const root = join(APP_LOCALE, section);
  if (!existsSync(root)) continue;
  for (const page of walkPages(root)) {
    // Walk ancestors collecting layout.tsx files.
    let cursor = dirname(page);
    let guarded = false;
    while (cursor.length >= root.length) {
      const layoutTsx = join(cursor, "layout.tsx");
      const layoutTs = join(cursor, "layout.ts");
      if (hasGuard(layoutTsx) || hasGuard(layoutTs)) {
        guarded = true;
        break;
      }
      if (cursor === root) break;
      cursor = dirname(cursor);
    }
    if (!guarded) {
      violations.push(`${relative(ROOT, page)} :: no RBAC guard in any ancestor layout up to ${section}/`);
    }
  }
}

if (violations.length === 0) process.exit(0);
console.error("\n[audit-page-rbac] STRICT-ZERO violation(s):\n");
for (const v of violations) console.error(`  - ${v}`);
console.error(`\nTotal: ${violations.length}\n`);
process.exit(1);
