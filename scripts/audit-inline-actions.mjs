#!/usr/bin/env node
// scripts/audit-inline-actions.mjs
// Enforces that action IDs, labels, and requiresAuth flags come from action-defs.ts.

import { readFileSync, readdirSync, statSync } from "fs";
import { join } from "path";

const ROOT = process.cwd();
const ACTION_DEFS = join(ROOT, "appkit", "src", "features", "products", "constants", "action-defs.ts");
const VIOLATIONS = [];

// Parse ACTION_ID string values from action-defs.ts (only from ACTION_ID = { ... } block)
const actionDefsContent = readFileSync(ACTION_DEFS, "utf8");
const actionIdBlockMatch = actionDefsContent.match(/ACTION_ID\s*=\s*\{([^}]+)\}/s);
const ACTION_ID_VALUES = new Set(
  actionIdBlockMatch
    ? [...actionIdBlockMatch[1].matchAll(/:\s+"([a-z][a-z0-9-]+)"/g)].map((m) => m[1])
    : [],
);

// Parse ACTION_META labels
const ACTION_META_LABELS = new Set(
  [...actionDefsContent.matchAll(/label:\s+"([^"]+)"/g)].map((m) => m[1]),
);

function walk(dir, files = []) {
  let entries;
  try { entries = readdirSync(join(ROOT, dir)); } catch { return files; }
  for (const entry of entries) {
    const rel = join(dir, entry);
    let stat;
    try { stat = statSync(join(ROOT, rel)); } catch { continue; }
    if (stat.isDirectory() && !entry.startsWith(".") && entry !== "node_modules") walk(rel, files);
    else if (/\.(tsx|ts)$/.test(entry)) files.push(rel);
  }
  return files;
}

function hasAuthGate(content) {
  return (
    content.includes("useAuthGate") ||
    content.includes("requireAuth") ||
    content.includes("isAuthenticated") ||
    content.includes("isAuthError")
  );
}

// Tier 2 protected paths — layout-level RoleGate covers these, skip Rules 2+4 there
const TIER2_SEGS = ["/admin/", "/store/", "/user/", "\\admin\\", "\\store\\", "\\user\\"];
function isTier2(filePath) {
  return TIER2_SEGS.some((s) => filePath.includes(s));
}

// Only flag multi-word or clearly action-specific labels (avoids "Edit"/"Delete"/"View" etc.)
function isSpecificLabel(lbl) {
  return lbl.includes(" ") || lbl.length > 8;
}

const SCAN_DIRS = ["src", join("appkit", "src")];

for (const dir of SCAN_DIRS) {
  for (const file of walk(dir)) {
    const content = readFileSync(join(ROOT, file), "utf8");
    const isClient = content.includes('"use client"') || content.includes("'use client'");
    if (!isClient) continue;

    const importsRegistry =
      content.includes("ACTION_ID") &&
      (content.includes("action-defs") || content.includes("appkit/client") || content.includes("appkit\""));

    // Rule 1: Inline ACTION_ID value (id: "some-action-id" without importing ACTION_ID)
    if (!isTier2(file)) {
      for (const val of ACTION_ID_VALUES) {
        const pattern = new RegExp(`id:\\s*["']${val}["']`);
        if (pattern.test(content) && !importsRegistry) {
          VIOLATIONS.push(`${file}: inline id "${val}" — use ACTION_ID.* from registry`);
        }
      }
    }

    // Rule 2: Inline label matching registry (only in action array/BulkActionBar context,
    // only for specific multi-word labels, not generic "Edit"/"Delete"/"View")
    if (!isTier2(file) && (content.includes("BulkActionBar") || content.includes("actions={["))) {
      for (const lbl of ACTION_META_LABELS) {
        if (isSpecificLabel(lbl) && content.includes(`label: "${lbl}"`) && !importsRegistry) {
          VIOLATIONS.push(`${file}: inline label "${lbl}" — use ACTION_META[ACTION_ID.*].label`);
        }
      }
    }

    // Rule 3: Inline requiresAuth: true on action objects without importing the registry
    if (!isTier2(file) && /\{\s*id:\s*["'][^"']+["'][^}]*requiresAuth:\s*true/.test(content) && !importsRegistry) {
      VIOLATIONS.push(`${file}: inline requiresAuth: true — use useAuthGate(ACTION_ID.*) from registry`);
    }

    // Rule 4: <Button onClick={handle*}> with mutation but no auth gate (public paths only)
    if (
      !isTier2(file) &&
      /<(?:Button|button)[^>]*onClick=\{handle[A-Z]/.test(content) &&
      !hasAuthGate(content) &&
      !content.includes("// audit-auth-gates-ok")
    ) {
      // "Action(" only counts if it's a server action import (not dispatchAction, handleAction, etc.)
      const hasServerActionImport = content.includes('from "@/actions/') || content.includes("from \"@/actions/");
      const hasMutation =
        content.includes("pushWishlistOp") ||
        content.includes("pushCartOp") ||
        (hasServerActionImport && /\b\w+Action\s*\(/.test(content));
      if (hasMutation) {
        VIOLATIONS.push(
          `${file}: <Button onClick={handle*}> with mutation but no auth gate — add requireAuth() or // audit-auth-gates-ok`,
        );
      }
    }
  }
}

if (VIOLATIONS.length > 0) {
  console.error("\n[audit-inline-actions] VIOLATIONS:\n");
  VIOLATIONS.forEach((v) => console.error(`  ✗ ${v}`));
  console.error(`\n${VIOLATIONS.length} violation(s).\n`);
  process.exit(1);
}
console.log("[audit-inline-actions] OK — no duplicate inline action definitions.");
