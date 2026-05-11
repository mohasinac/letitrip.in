/**
 * PII Encryption/Decryption for Firebase Functions
 *
 * Mirror of src/lib/pii.ts — runs in Firebase Functions runtime.
 * Requires PII_SECRET environment variable (set via Firebase Secret Manager).
 */

import { createCipheriv, createDecipheriv, createHmac, randomBytes } from "crypto";

const ALGORITHM = "aes-256-gcm" as const;
const IV_BYTES = 12;
const PII_PREFIX = "pii:v1:";

let _cachedKey: Buffer | null = null;

function getPiiKey(): Buffer {
  if (_cachedKey) return _cachedKey;
  const hex = process.env.PII_SECRET;
  if (!hex || hex.length !== 64) {
    throw new Error(
      "PII_SECRET must be a 64-character hex string (32 bytes). " +
        'Set via Firebase Secret Manager or functions environment config.',
    );
  }
  _cachedKey = Buffer.from(hex, "hex");
  return _cachedKey;
}

/** Encrypt a PII plaintext string with AES-256-GCM. */
export function encryptPii(plaintext: string | null | undefined): string | null | undefined {
  if (!plaintext || typeof plaintext !== "string") return plaintext;
  if (isPiiEncrypted(plaintext)) return plaintext;
  const key = getPiiKey();
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const ct = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${PII_PREFIX}${iv.toString("base64")}.${tag.toString("base64")}.${ct.toString("base64")}`;
}

/** Decrypt a PII ciphertext produced by encryptPii(). Legacy plaintext passes through. */
export function decryptPii(encrypted: string | null | undefined): string | null | undefined {
  if (!encrypted || typeof encrypted !== "string") return encrypted;
  if (!encrypted.startsWith(PII_PREFIX)) return encrypted;
  const key = getPiiKey();
  const parts = encrypted.slice(PII_PREFIX.length).split(".");
  if (parts.length !== 3) throw new Error("Invalid PII encrypted value");
  const [ivB64, tagB64, ctB64] = parts;
  const iv = Buffer.from(ivB64, "base64");
  const tag = Buffer.from(tagB64, "base64");
  const ct = Buffer.from(ctB64, "base64");
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ct), decipher.final()]).toString("utf8");
}

/** Returns true if the value was produced by encryptPii(). */
export function isPiiEncrypted(value: string): boolean {
  return typeof value === "string" && value.startsWith(PII_PREFIX);
}

/** HMAC-SHA256 blind index for a PII value (normalised: lowercase + trim). */
export function piiBlindIndex(plaintext: string): string {
  const key = getPiiKey();
  return createHmac("sha256", key)
    .update(plaintext.toLowerCase().trim())
    .digest("hex");
}

/** Decrypt specified string fields on an object. Non-encrypted values pass through. */
export function decryptPiiFields<T extends Record<string, unknown>>(
  obj: T,
  fields: readonly string[],
): T {
  const result = { ...obj };
  for (const field of fields) {
    const val = result[field];
    if (typeof val === "string" && val) {
      (result as Record<string, unknown>)[field] = decryptPii(val);
    }
  }
  return result;
}

/** Encrypt specified string fields on an object. */
export function encryptPiiFields<T extends Record<string, unknown>>(
  obj: T,
  fields: readonly string[],
): T {
  const result = { ...obj };
  for (const field of fields) {
    const val = result[field];
    if (typeof val === "string" && val) {
      (result as Record<string, unknown>)[field] = encryptPii(val);
    }
  }
  return result;
}
