#!/usr/bin/env node
/**
 * audit-whatsapp-secret-leak — strict zero.
 *
 * WHY: the WhatsApp integration holds the two things this codebase most needs
 *      to keep server-side — a Meta Cloud API access token, and the routing
 *      rules that say which notifications go out over which channel. Both live
 *      in `siteSettings`, which has a PUBLIC, edge-cached, unauthenticated
 *      projection sitting in front of it.
 *
 *      This rule exists because the leak was real rather than hypothetical:
 *      `notificationChannels` was emitted WHOLE into the public payload, so
 *      every anonymous caller received `whatsapp.minPriority` and the
 *      `types[]` allow-list naming exactly which notification types the
 *      channel carries. Nothing in a browser read either.
 *
 * R1 — No Meta/WhatsApp credential name may appear in the public projection.
 * R2 — `notificationChannels` must be NARROWED in the projection, never
 *      emitted by reference.
 * R3 — No client component may read a WhatsApp credential off site settings.
 * R4 — The per-store access token must not come back: `whatsappConfig`
 *      accepting an `accessToken` is the design that made LetItRip custodian
 *      of a live Meta credential per seller.
 *
 * 🛑 R2 is a SHAPE check, not a name check. A rule that merely required the
 * string "notificationChannels" to be absent would pass the moment someone
 * re-added it by reference, which is precisely the regression to block.
 *
 * No suppression marker. A leak of this class is never the right call, and an
 * escape hatch here would be the thing future-me reaches for at 2am.
 */

import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const APPKIT = join(ROOT, "appkit", "src");

/** Credential names that must never reach a public payload or a client file. */
const CREDENTIAL_NAMES = [
  "whatsappCloudApiToken",
  "whatsappPhoneNumberId",
  "whatsappAccessToken",
  "whatsappBusinessAccountId",
  "whatsappAppSecret",
  "whatsappVerifyToken",
];

const violations = [];
const read = (p) => (existsSync(p) ? readFileSync(p, "utf8") : null);

/** Strip comments so a cautionary note naming a field is not read as the field. */
function stripComments(src) {
  return src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/[^\n]*/g, "$1");
}

// ── R1 + R2: the public projection ──────────────────────────────────────────
const ADAPTER = join(APPKIT, "_internal/server/features/site-settings/adapters.ts");
const adapterSrc = read(ADAPTER);

if (!adapterSrc) {
  violations.push({
    rule: "R1",
    file: "appkit/src/_internal/server/features/site-settings/adapters.ts",
    msg: "the public site-settings projection is missing — this audit cannot verify anything without it",
  });
} else {
  const code = stripComments(adapterSrc);

  for (const name of CREDENTIAL_NAMES) {
    if (code.includes(name)) {
      violations.push({
        rule: "R1",
        file: "appkit/src/.../site-settings/adapters.ts",
        msg: `credential "${name}" appears in the PUBLIC projection. It must live only in PRIVATE_SITE_SETTINGS_FIELDS and be read server-side.`,
      });
    }
  }

  // R2 — emitted by reference is the regression; narrowed is the fix.
  if (/notificationChannels\s*:\s*doc\.notificationChannels\s*,/.test(code)) {
    violations.push({
      rule: "R2",
      file: "appkit/src/.../site-settings/adapters.ts",
      msg:
        "notificationChannels is emitted BY REFERENCE into the public payload. " +
        "That publishes minPriority and the per-channel types[] allow-list to anonymous callers. " +
        "Narrow it to the booleans a browser actually reads.",
    });
  }
}

// ── R3: no client file reads a WhatsApp credential off settings ─────────────
const CLIENT_GLOBS = [join(APPKIT, "features"), join(ROOT, "src", "components"), join(ROOT, "src", "app")];

function walk(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (/\.(ts|tsx)$/.test(e.name)) out.push(p);
  }
  return out;
}

for (const dir of CLIENT_GLOBS) {
  for (const file of walk(dir)) {
    const raw = read(file);
    if (!raw || !raw.startsWith('"use client"') && !raw.includes('"use client"')) continue;
    const code = stripComments(raw);

    /*
     * 🛑 A credential NAME in a client file is not itself a leak — the admin
     * Site Settings editor must name these fields to offer an input for them.
     * What distinguishes it is WHAT IT READS: that view reads
     * `credentialsMasked`, the masked projection `GET /api/admin/site` returns
     * behind an RBAC gate, and never a raw value.
     *
     * So the rule tests that property rather than exempting a filename. A
     * path-based allow-list would have gone stale the moment the editor was
     * split or renamed, and would have said nothing about a NEW client file
     * doing the genuinely dangerous thing.
     */
    const readsOnlyMasked = /credentialsMasked/.test(code);
    if (readsOnlyMasked) continue;

    for (const name of CREDENTIAL_NAMES) {
      if (code.includes(name)) {
        violations.push({
          rule: "R3",
          file: file.replace(ROOT + "\\", "").replace(ROOT + "/", ""),
          msg: `client component references "${name}" without reading it through credentialsMasked. A raw Meta credential must never be reachable from a browser bundle.`,
        });
      }
    }
  }
}

// ── R4: the per-store access token must not return ──────────────────────────
const STORE_SCHEMA = join(APPKIT, "features/stores/schemas/firestore.ts");
const storeSrc = read(STORE_SCHEMA);
if (storeSrc) {
  const code = stripComments(storeSrc);
  if (/whatsappConfig\s*\?*\s*:\s*{[^}]*accessToken/s.test(code)) {
    violations.push({
      rule: "R4",
      file: "appkit/src/features/stores/schemas/firestore.ts",
      msg:
        "StoreDocument.whatsappConfig declares an accessToken again. " +
        "The platform owns one WhatsApp number; a per-seller Meta credential made mapDoc decrypt a live token on every read.",
    });
  }
}

// ── report ──────────────────────────────────────────────────────────────────
if (violations.length === 0) {
  console.log(
    "[audit-whatsapp-secret-leak] OK — 0 violations (public projection narrowed, no credential in a client bundle, no per-store token).",
  );
  process.exit(0);
}

console.error(`audit-whatsapp-secret-leak: ${violations.length} violation(s).\n`);
for (const v of violations) {
  console.error(`  [${v.rule}] ${v.file}`);
  console.error(`        ${v.msg}\n`);
}
process.exit(1);
