#!/usr/bin/env node
/**
 * audit-error-display-i18n.mjs
 *
 * Strict-zero parity check between three sources of truth:
 *   1. `appkit/src/errors/error-codes.ts`     — enum value list (AUTH_001, BID_*, …)
 *   2. `appkit/src/errors/error-mapping.ts`   — HTTP_ERROR_CODES enum value list
 *   3. `messages/en.json` → `errors.codes.*`  — translation keys
 *
 * Rule: every enum *value* must have a matching JSON key (so any thrown error
 * can resolve to a localised string). The reverse is permitted only for the
 * `UNKNOWN` sentinel — the fallback messageKey used by `error-display-map.ts`
 * when no code matches.
 *
 * Exits 0 when both sides align; 1 on any drift.
 */

import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const ALLOWED_JSON_ONLY = new Set(["UNKNOWN"]);

const enJson = JSON.parse(readFileSync(join(ROOT, "messages/en.json"), "utf8"));
const enKeys = new Set(Object.keys(enJson?.errors?.codes ?? {}));

const enumValueRe = /^\s+[A-Z][A-Z0-9_]+:\s+['"]([A-Z][A-Z_0-9]+)['"]/gm;

const enumValues = new Set();
for (const file of [
  "appkit/src/errors/error-codes.ts",
  "appkit/src/errors/error-mapping.ts",
]) {
  const src = readFileSync(join(ROOT, file), "utf8");
  for (const m of src.matchAll(enumValueRe)) {
    enumValues.add(m[1]);
  }
}

const missingJson = [];
for (const v of enumValues) {
  if (!enKeys.has(v)) missingJson.push(v);
}

const orphanJson = [];
for (const k of enKeys) {
  if (!enumValues.has(k) && !ALLOWED_JSON_ONLY.has(k)) orphanJson.push(k);
}

const drift = missingJson.length + orphanJson.length;

if (drift === 0) {
  console.log(
    `audit-error-display-i18n: clean ✓ (en.json keys=${enKeys.size}, enum values=${enumValues.size})`,
  );
  process.exit(0);
}

console.error(
  `audit-error-display-i18n: DRIFT — ${drift} mismatch(es) between enum values and messages/en.json errors.codes.*`,
);
if (missingJson.length) {
  console.error(
    `\n  ${missingJson.length} enum value(s) WITHOUT a messages/en.json key (would render untranslated):`,
  );
  for (const v of missingJson) console.error(`    ${v}`);
}
if (orphanJson.length) {
  console.error(
    `\n  ${orphanJson.length} messages/en.json key(s) WITHOUT a matching enum value (dead translation):`,
  );
  for (const k of orphanJson) console.error(`    ${k}`);
  console.error(
    `\n  Fix: either add the enum value to appkit/src/errors/{error-codes,error-mapping}.ts or remove the orphan key from messages/en.json.`,
  );
}
process.exit(1);
