/**
 * The `enc:v1:` BINARY envelope, for Node scripts.
 *
 * 🛑 This is a second implementation of
 * `appkit/src/security/settings-encryption.ts`'s `encryptBuffer` /
 * `decryptBuffer`, and that is a deliberate exception to "import from the
 * defining module" (Root Cause #18). Importing the real one was tried and does
 * not work from a plain `.mjs`:
 *
 *   - `appkit/dist` is `"type": "module"` with EXTENSIONLESS relative imports
 *     (`from "./pii-mask"`), which pure-ESM Node refuses to resolve —
 *     measured: `Cannot find module .../dist/security/pii-mask`.
 *   - `require()` is no escape either, for the same `"type": "module"` reason.
 *   - Shimming far enough to load the barrel means providing BOTH
 *     `globalThis.require` AND `globalThis.module`, because
 *     `providers/db-firebase/admin.ts` calls `module.require(...)`. Get that
 *     shim half-right and the failure is not an import error but a job that
 *     reports success having written nothing (Root Cause #24).
 *
 * Fifteen lines of stdlib crypto is the smaller risk. What makes it safe is
 * that the risk is MEASURED rather than asserted:
 * `scripts/audit-business-doc-envelope.mjs` cross-checks every constant below
 * against the appkit source and fails the build on any drift.
 *
 * Layout: "enc:v1:" (7 ASCII) || iv (12) || authTag (16) || ciphertext
 */

import crypto from "node:crypto";

export const ALGORITHM = "aes-256-gcm";
export const PREFIX = "enc:v1:";
export const IV_BYTES = 12;
export const TAG_BYTES = 16;

const PREFIX_BUF = Buffer.from(PREFIX, "ascii");

/**
 * Normalise a hex key read from an env file.
 *
 * Mirrors `normalizeSecretEnvValue` in the appkit module: a BOM or a trailing
 * CR makes `length !== 64` true, and without the length check `Buffer.from`
 * would truncate at the first non-hex byte and produce a silently WRONG key.
 */
export function normalizeKeyHex(raw) {
  return (raw ?? "").replace(/(?:\\r|\\n|\r|\n)+$/g, "").trim();
}

function keyBuffer() {
  const hex = normalizeKeyHex(process.env.SETTINGS_ENCRYPTION_KEY);
  if (hex.length !== 64) {
    throw new Error("SETTINGS_ENCRYPTION_KEY must be a 64-character hex string (32 bytes).");
  }
  return Buffer.from(hex, "hex");
}

export function encryptBuffer(plaintext) {
  const iv = crypto.randomBytes(IV_BYTES);
  const cipher = crypto.createCipheriv(ALGORITHM, keyBuffer(), iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  return Buffer.concat([PREFIX_BUF, iv, cipher.getAuthTag(), ciphertext]);
}

export function isBufferEncrypted(buf) {
  return (
    buf.length > PREFIX_BUF.length + IV_BYTES + TAG_BYTES &&
    buf.subarray(0, PREFIX_BUF.length).equals(PREFIX_BUF)
  );
}

export function decryptBuffer(encrypted) {
  if (!isBufferEncrypted(encrypted)) {
    throw new Error("Buffer is not settings-encrypted — expected an 'enc:v1:' binary envelope");
  }
  const ivStart = PREFIX_BUF.length;
  const tagStart = ivStart + IV_BYTES;
  const dataStart = tagStart + TAG_BYTES;

  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    keyBuffer(),
    encrypted.subarray(ivStart, tagStart),
  );
  decipher.setAuthTag(encrypted.subarray(tagStart, dataStart));
  return Buffer.concat([decipher.update(encrypted.subarray(dataStart)), decipher.final()]);
}
