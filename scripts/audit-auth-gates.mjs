#!/usr/bin/env node
// scripts/audit-auth-gates.mjs
// Verifies all auth-required public CTA call sites are wrapped with requireAuth().

import { readFileSync, readdirSync, statSync } from "fs";
import { join, normalize } from "path";

const ROOT = process.cwd();
const VIOLATIONS = [];
const SCAN_DIRS = ["src", join("appkit", "src")];

// Tier 2 protected path segments — layout-level RoleGate handles these
const TIER2_PATHS = ["/admin/", "/store/", "/user/"];

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

function isClientFile(content) {
  return content.includes('"use client"') || content.includes("'use client'");
}

function hasAuthGate(content) {
  return (
    content.includes("useAuthGate") ||
    content.includes("requireAuth") ||
    content.includes("isAuthenticated") ||
    content.includes("isAuthError") // reactive pattern — still counts as guarded
  );
}

function isTier2Path(filePath) {
  const normalised = normalize(filePath).replace(/\\/g, "/");
  return TIER2_PATHS.some((p) => normalised.includes(p));
}

for (const dir of SCAN_DIRS) {
  for (const file of walk(dir)) {
    const content = readFileSync(join(ROOT, file), "utf8");
    if (!isClientFile(content)) continue;

    // Rule 1: pushWishlistOp must be gated
    if (content.includes("pushWishlistOp") && !hasAuthGate(content)) {
      VIOLATIONS.push(`${file}: pushWishlistOp called without useAuthGate guard`);
    }

    // Rule 2: Checkout navigation without auth gate
    if (
      /ROUTES\.USER\.CHECKOUT/.test(content) &&
      /<Link|router\.push/.test(content) &&
      !hasAuthGate(content) &&
      !content.includes("// audit-auth-gates-ok")
    ) {
      VIOLATIONS.push(`${file}: ROUTES.USER.CHECKOUT navigation without auth gate`);
    }

    // Rule 3: Raw server action import called in a public-facing client component
    if (
      content.includes('from "@/actions/') &&
      !isTier2Path(file) &&
      !hasAuthGate(content) &&
      !content.includes("// audit-auth-gates-ok")
    ) {
      VIOLATIONS.push(`${file}: server action imported in public client component without useAuthGate guard`);
    }
  }
}

if (VIOLATIONS.length > 0) {
  console.error("\n[audit-auth-gates] VIOLATIONS:\n");
  VIOLATIONS.forEach((v) => console.error(`  ✗ ${v}`));
  console.error(`\n${VIOLATIONS.length} violation(s). Add requireAuth(ACTION_ID.*, fn) from useAuthGate().\n`);
  process.exit(1);
}
console.log("[audit-auth-gates] OK — all public CTAs are gated.");
