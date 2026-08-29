/**
 * pii-seed — the ONE PII encryption path for seeding scripts.
 *
 * ## Why this module exists
 *
 * Three scripts had their own copy of this logic and they did not agree:
 *
 * - `seed-admin.mjs` had **no encryption at all**. It writes `/users/{uid}` into
 *   PRODUCTION Firestore, so the platform admin's `email` and `phoneNumber` sat
 *   in cleartext with no index fields — meaning `findByEmail()` could not
 *   resolve the admin account either.
 * - `seed-test-users.mjs` encrypted correctly but derived its index name
 *   mechanically as `` `${field}Index` ``, producing **`phoneNumberIndex`** —
 *   a field name nothing in the codebase reads. Every reader queries
 *   `phoneIndex`, so `findByPhone()` missed all three test users.
 * - `seed-admin-only.mjs` was correct, but only by luck of ordering: it copied
 *   `addPiiIndices`, a helper appkit DELETED for restoring plaintext, and is
 *   safe solely because it indexes before encrypting.
 *
 * ## The index name is a MAP, never a derivation
 *
 * `encryptPiiFields` in appkit derives `` `${field}Index` `` and the base
 * repository then *additionally* spreads `piiIndicesFor(data, piiIndexMap)` to
 * patch the result — so every real user write stores a dead `phoneNumberIndex`
 * beside the correct `phoneIndex`. This module does not reproduce that: it
 * writes only the names readers actually query.
 *
 * ## Order is load-bearing
 *
 * Blind indices are computed from PLAINTEXT. Encrypt first and you HMAC the
 * ciphertext, producing an index that can never match a lookup.
 */

import { createCipheriv, createHmac, randomBytes } from "node:crypto";

/*
 * Must match `appkit/src/security/pii-mask.ts` exactly — these strings are the
 * stored format, and an index written under a different prefix can never match
 * a lookup no matter how correct the hash is.
 *
 * `hmac-sha256:`, NOT `hmac:v1:`. I wrote the latter drafting this module and
 * caught it before it shipped; `enc:v1:` and `hmac-sha256:` do not follow the
 * same convention, which is exactly why guessing is unsafe.
 */
const ENC_PREFIX = "enc:v1:";
const HMAC_PREFIX = "hmac-sha256:";

function keyFromEnv(name) {
  const raw = (process.env[name] ?? "").trim();
  if (raw.length !== 64) {
    throw new Error(`${name} must be a 64-character hex string (32 bytes)`);
  }
  return Buffer.from(raw, "hex");
}

/**
 * The HMAC key, falling back to the encryption key — matching
 * `appkit/src/security/pii-encrypt.ts`, whose header documents
 * "PII_HMAC_KEY … (defaults to PII_ENCRYPTION_KEY if absent)".
 *
 * A script that demanded PII_HMAC_KEY outright would refuse to run in an
 * environment the app itself is perfectly happy in.
 */
function hmacKey() {
  const raw = (process.env.PII_HMAC_KEY ?? "").trim();
  return raw.length === 64 ? Buffer.from(raw, "hex") : keyFromEnv("PII_ENCRYPTION_KEY");
}

function encryptValue(plaintext) {
  const key = keyFromEnv("PII_ENCRYPTION_KEY");
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const enc = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${ENC_PREFIX}${iv.toString("base64")}:${enc.toString("base64")}:${tag.toString("base64")}`;
}

function blindIndex(value) {
  const key = hmacKey();
  return `${HMAC_PREFIX}${createHmac("sha256", key).update(value).digest("hex")}`;
}

/**
 * Field → the index field name READERS query. Mirrors
 * `USER_PII_INDEX_MAP` in `appkit/src/security/pii-schemas.ts`.
 */
export const USER_PII_INDEX_MAP = {
  email: "emailIndex",
  phoneNumber: "phoneIndex",
};

/** Mirrors `USER_PII_FIELDS`. `googleLinkedEmail` is included — one script omitted it. */
export const USER_PII_FIELDS = ["email", "phoneNumber", "googleLinkedEmail"];

/**
 * Encrypt `piiFields` in place and add the blind indices named by `indexMap`.
 *
 * Already-encrypted values are left alone, so re-running a seed is idempotent.
 * A field with no `indexMap` entry is encrypted and simply not indexed — which
 * is correct for anything nobody looks up by.
 */
export function encryptForSeed(doc, piiFields, indexMap = {}) {
  const out = { ...doc };

  // Indices FIRST, from plaintext. See the ordering note in the header.
  for (const [field, indexField] of Object.entries(indexMap)) {
    const value = doc[field];
    if (typeof value === "string" && value && !value.startsWith(ENC_PREFIX)) {
      out[indexField] = blindIndex(value);
    }
  }

  for (const field of piiFields) {
    const value = doc[field];
    if (typeof value !== "string" || !value) continue;
    if (value.startsWith(ENC_PREFIX)) continue;
    out[field] = encryptValue(value);
  }

  return out;
}

/** `encryptForSeed` with the user defaults — the common case. */
export function encryptUserForSeed(doc) {
  return encryptForSeed(doc, USER_PII_FIELDS, USER_PII_INDEX_MAP);
}
