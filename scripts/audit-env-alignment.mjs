#!/usr/bin/env node
/**
 * audit-env-alignment.mjs
 *
 * Validates .env.local against a canonical required-var list.
 * Run via: node scripts/audit-env-alignment.mjs
 *
 * Checks:
 *  1. EMAIL_FROM_NAME must be exactly "LetItRip"
 *  2. Required vars must all be present and non-empty
 *  3. FIREBASE_INTERNAL_SECRET must not be present (superseded by LETITRIP_INTERNAL_SECRET)
 */

import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

const ROOT = resolve(import.meta.dirname ?? ".", "..");
const ENV_PATH = resolve(ROOT, ".env.local");

const REQUIRED_VARS = [
  "FIREBASE_ADMIN_CLIENT_EMAIL",
  "FIREBASE_ADMIN_PRIVATE_KEY",
  "FIREBASE_ADMIN_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "FIREBASE_FUNCTION_GATEWAY_URL",
  "LETITRIP_INTERNAL_SECRET",
  "PII_ENCRYPTION_KEY",
  "PII_SECRET",
  "RAZORPAY_KEY_ID",
  "RAZORPAY_KEY_SECRET",
  "RAZORPAY_WEBHOOK_SECRET",
  "EMAIL_FROM",
  "EMAIL_FROM_NAME",
];

function parseEnvFile(path) {
  if (!existsSync(path)) return {};
  const content = readFileSync(path, "utf8");
  const vars = {};
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const raw = trimmed.slice(eqIdx + 1).trim();
    // Strip surrounding quotes (single or double)
    const value = raw.replace(/^["']|["']$/g, "");
    vars[key] = value;
  }
  return vars;
}

const env = parseEnvFile(ENV_PATH);
const errors = [];

// 1. EMAIL_FROM_NAME check
if (env.EMAIL_FROM_NAME && env.EMAIL_FROM_NAME !== "LetItRip") {
  errors.push(`EMAIL_FROM_NAME="${env.EMAIL_FROM_NAME}" — must be exactly "LetItRip"`);
}

// 2. Required vars check
for (const key of REQUIRED_VARS) {
  if (!env[key] || env[key].trim() === "") {
    errors.push(`${key} is missing or empty`);
  }
}

// 3. Superseded secret check
if (env.FIREBASE_INTERNAL_SECRET) {
  errors.push(`FIREBASE_INTERNAL_SECRET is present — remove it; use LETITRIP_INTERNAL_SECRET instead`);
}

// ── Report ─────────────────────────────────────────────────────────────────────

if (errors.length) {
  for (const e of errors) console.error(`[audit-env-alignment] ERROR: ${e}`);
  process.exit(1);
} else {
  console.log("[audit-env-alignment] OK — .env.local passes all checks.");
}
