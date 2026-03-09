/**
 * AES-256-GCM Encryption — Sensitive Settings at Rest
 *
 * Used to encrypt API keys, webhook secrets, and other credentials
 * before storing them in Firestore. All operations are server-side only.
 *
 * Setup: add SETTINGS_ENCRYPTION_KEY to your .env.local
 *   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
 *
 * Encrypted format (opaque, stored as a single string in Firestore):
 *   "enc:v1:<base64(iv)>.<base64(authTag)>.<base64(ciphertext)>"
 *
 * Security properties:
 *   - AES-256-GCM: authenticated encryption — confidentiality + integrity
 *   - 96-bit random IV per encryption — ciphertext is never identical for the same input
 *   - 128-bit GCM auth tag — detects any bit-level tampering
 *   - Master key lives only in env vars — never stored in DB
 */

import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const ALGORITHM = "aes-256-gcm" as const;
const IV_BYTES = 12; // 96-bit IV — optimal for GCM
const PREFIX = "enc:v1:";

function getMasterKey(): Buffer {
  const hex = process.env.SETTINGS_ENCRYPTION_KEY;
  if (!hex || hex.length !== 64) {
    throw new Error(
      "SETTINGS_ENCRYPTION_KEY must be a 64-character hex string (32 bytes). " +
        "Generate one with: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\"",
    );
  }
  return Buffer.from(hex, "hex");
}

/**
 * Encrypt a plaintext string with AES-256-GCM.
 * Returns an opaque string safe to store in Firestore.
 */
export function encrypt(plaintext: string): string {
  const key = getMasterKey();
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const ct = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${PREFIX}${iv.toString("base64")}.${tag.toString("base64")}.${ct.toString("base64")}`;
}

/**
 * Decrypt a value produced by encrypt().
 * Throws if the value is malformed or the auth tag fails (tampering detected).
 * If the value does not start with our prefix (e.g. a legacy plain value),
 * it is returned as-is to allow graceful migration.
 */
export function decrypt(encrypted: string): string {
  if (!encrypted.startsWith(PREFIX)) {
    // Not an encrypted blob — return as-is (empty string, legacy plain value)
    return encrypted;
  }
  const key = getMasterKey();
  const parts = encrypted.slice(PREFIX.length).split(".");
  if (parts.length !== 3)
    throw new Error("Invalid encrypted value — expected 3 parts");
  const [ivB64, tagB64, ctB64] = parts;
  const iv = Buffer.from(ivB64, "base64");
  const tag = Buffer.from(tagB64, "base64");
  const ct = Buffer.from(ctB64, "base64");
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ct), decipher.final()]).toString(
    "utf8",
  );
}

/** Returns true if the value was produced by encrypt(). */
export function isEncrypted(value: string): boolean {
  return value.startsWith(PREFIX);
}

/**
 * Mask a secret for display in admin UI.
 * Shows the first 6 characters, an ellipsis, and the last 4 characters.
 * Returns "••••" for very short values that cannot be safely partially shown.
 */
export function maskSecret(value: string): string {
  if (!value || value.length < 12) return "••••";
  return `${value.slice(0, 6)}…${value.slice(-4)}`;
}
