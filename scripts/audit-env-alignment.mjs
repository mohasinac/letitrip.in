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

import { readFileSync, existsSync, readdirSync, statSync } from "fs";
import { resolve, join } from "path";

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
  // PII_SECRET removed 2026-08-27. No runtime code has ever read it, yet this
  // list required it and seed-cli accepted it as a substitute for the real
  // key — while holding a DIFFERENT value. A seeder could pass the presence
  // check and then throw at the first encrypt. See DEAD_REQUIRED_VAR below.
  "PHONEPE_CLIENT_ID",
  "PHONEPE_CLIENT_SECRET",
  "PHONEPE_CLIENT_VERSION",
  "PHONEPE_ENVIRONMENT",
  "PHONEPE_WEBHOOK_USERNAME",
  "PHONEPE_WEBHOOK_PASSWORD",
  "EMAIL_FROM",
  "EMAIL_FROM_NAME",
  /*
   * Added 2026-10-09, and it is load-bearing for CORRECTNESS, not just a
   * feature flag.
   *
   * `POST /api/cache/revalidate` tests `if (!secret)` before anything else and
   * returns 503 "Endpoint not configured" when unset. That route is the only
   * thing that drops stale ISR entries, so without this var every invalidation
   * silently fails — and the detail-route TTLs raised from 30–120s to 3600s
   * become the sole freshness mechanism, which is strictly worse than before
   * they were raised. A page would show a sold-out listing as in stock for an
   * hour, with nothing erroring anywhere.
   *
   * 🛑 `APP_ORIGIN` is deliberately NOT listed here. It is read only by Cloud
   * Functions (`ctx.env` → `process.env`) from `functions/.env.<projectId>`;
   * this audit validates `.env.local`, and its DEAD_REQUIRED_VAR check would
   * correctly fire on a name no Next-side code reads.
   */
  "CACHE_REVALIDATION_SECRET",
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

// 2b. DEAD_REQUIRED_VAR — a name this list demands that no code reads.
//
// `PII_SECRET` sat here for a long time while no runtime code read it, and
// `seed-cli` accepted it as a substitute for `PII_ENCRYPTION_KEY` — holding a
// DIFFERENT value. A machine with only that one set passed every presence
// check and then threw at the first encrypt. Requiring a variable nobody reads
// does not make anything safer; it makes the list untrustworthy.
{
  const SEARCH_ROOTS = ["src", "appkit/src", "functions/src", "scripts", "appkit/scripts"];
  const sources = [];
  const collect = (dir) => {
    if (!existsSync(dir)) return;
    for (const entry of readdirSync(dir)) {
      const p = join(dir, entry);
      if (p.includes("node_modules") || p.includes(".next") || p.includes("dist")) continue;
      const st = statSync(p);
      if (st.isDirectory()) collect(p);
      else if (/\.(ts|tsx|js|mjs|cjs)$/.test(p)) sources.push(readFileSync(p, "utf8"));
    }
  };
  for (const r of SEARCH_ROOTS) collect(join(ROOT, r));
  const haystack = sources.join("\n");
  for (const key of REQUIRED_VARS) {
    const read =
      haystack.includes(`process.env.${key}`) || haystack.includes(`process.env["${key}"]`);
    if (!read) {
      errors.push(
        `${key} is in REQUIRED_VARS but no source file reads process.env.${key} — ` +
          `either wire it up or drop it from the list (a required-but-unread var is how PII_SECRET diverged from PII_ENCRYPTION_KEY)`,
      );
    }
  }
}

// 2c. SECRET_HEX_SHAPE — key material must be 64 hex chars in the RAW bytes.
//
// Checked before `parseEnvFile`'s `.trim()` can hide a BOM or CR. `audit-bom`
// scans source files only, never `.env.local`, so nothing else covers this —
// and `Buffer.from(x, "hex")` truncates silently rather than throwing, so a
// stray byte yields a WRONG key rather than an error.
{
  const HEX_KEYS = ["PII_ENCRYPTION_KEY", "PII_HMAC_KEY", "SETTINGS_ENCRYPTION_KEY"];
  if (existsSync(ENV_PATH)) {
    const raw = readFileSync(ENV_PATH, "utf8");
    for (const key of HEX_KEYS) {
      const line = raw.split(/\r?\n/).find((l) => l.replace(/^﻿/, "").startsWith(`${key}=`));
      if (!line) continue; // absent is fine — PII_HMAC_KEY legitimately falls back
      let value = line.slice(line.indexOf("=") + 1);
      const quoted = /^\s*(["'])([\s\S]*)\1\s*$/.exec(value);
      value = quoted ? quoted[2] : value;
      if (!/^[0-9a-fA-F]{64}$/.test(value)) {
        const why = /^﻿/.test(value)
          ? "leading BOM"
          : /[\r\n]/.test(value)
            ? "trailing CR/LF"
            : /^\s|\s$/.test(value)
              ? "surrounding whitespace"
              : `${value.length} chars, expected 64 hex`;
        errors.push(
          `${key} is not 64 clean hex characters (${why}). Buffer.from(…,"hex") truncates silently, ` +
            `so this yields a wrong key rather than an error — and every blind index written with it becomes unmatchable`,
        );
      }
    }
  }
}

// 3. Superseded secret check
if (env.FIREBASE_INTERNAL_SECRET) {
  errors.push(`FIREBASE_INTERNAL_SECRET is present — remove it; use LETITRIP_INTERNAL_SECRET instead`);
}

/*
 * 4. Business identity — WARN-ONLY, and deliberately not in REQUIRED_VARS.
 *
 * These override the defaults in `appkit.config.js` → `business`. A blank one
 * is a legitimate state: the config falls back to `null`, which renders as a
 * visible `[to be confirmed]` marker rather than an empty gap, so the site is
 * honest about what has not been decided.
 *
 * 🛑 Putting them in REQUIRED_VARS would be wrong twice over. That list
 * asserts present-AND-non-empty, so an intentionally-blank field would fail
 * the build; and its DEAD_REQUIRED_VAR rule additionally demands a
 * `process.env.X` read somewhere, which these do not have — they are read by
 * `appkit.config.js`, a CommonJS config outside every scanned root. That is
 * exactly how adding `COMPANY_ADDRESS` to the required list would fail today.
 *
 * So this reports rather than blocks, and becomes the standing checklist:
 * every one of these must be filled before submitting to PhonePe, because a
 * reviewer who sees `[to be confirmed]` on the Contact or Grievance page will
 * reject the application.
 */
/*
 * 🛑 Two of these have a COMMITTED default in appkit.config.js — the GSTIN
 * (`27BILPC5850Q1ZN`) and the bank name (`Slice`) — so being unset in env
 * does NOT make them render as `[to be confirmed]`. Listing them with the
 * rest would make this warning say something false about two of its own
 * entries, which is how a checklist stops being read.
 */
const BUSINESS_VARS_WITH_DEFAULTS = ["BUSINESS_GSTIN", "BUSINESS_BANK_NAME"];

const BUSINESS_VARS = [
  "BUSINESS_UDYAM_NUMBER",
  "BUSINESS_SUPPORT_EMAIL",
  "BUSINESS_SUPPORT_PHONE",
  "BUSINESS_WHATSAPP_NUMBER",
  "BUSINESS_SUPPORT_HOURS",
  "BUSINESS_GRIEVANCE_NAME",
  "BUSINESS_GRIEVANCE_DESIGNATION",
  "BUSINESS_GRIEVANCE_EMAIL",
  "BUSINESS_GRIEVANCE_PHONE",
  "BUSINESS_PROCESSING_TIME",
  "BUSINESS_DELIVERY_ESTIMATE",
  "BUSINESS_SHIPPING_CHARGES",
  "BUSINESS_CANCELLATION_WINDOW",
  "BUSINESS_RETURN_WINDOW",
  "BUSINESS_REFUND_TIMELINE",
  "BUSINESS_BANK_ACCOUNT_NAME",
  "BUSINESS_BANK_ACCOUNT_NUMBER",
  "BUSINESS_BANK_IFSC",
  "BUSINESS_UPI_VPA",
];

const pendingBusiness = BUSINESS_VARS.filter((k) => !env[k]);
if (pendingBusiness.length > 0) {
  console.warn(
    `[audit-env-alignment] ${pendingBusiness.length}/${BUSINESS_VARS.length} business ` +
      `identity vars are unset — each renders as [to be confirmed] on a statutory page:`,
  );
  for (const k of pendingBusiness) console.warn(`  · ${k}`);
  const overridable = BUSINESS_VARS_WITH_DEFAULTS.filter((k) => !env[k]);
  if (overridable.length > 0) {
    console.warn(
      `  (${overridable.join(", ")} also unset, but fall back to a committed ` +
        `default in appkit.config.js — these do NOT render as pending.)`,
    );
  }
  console.warn("  Fill them with: npm run env:business");
}

// ── Report ─────────────────────────────────────────────────────────────────────

if (errors.length) {
  for (const e of errors) console.error(`[audit-env-alignment] ERROR: ${e}`);
  process.exit(1);
} else {
  console.log("[audit-env-alignment] OK — .env.local passes all checks.");
}
