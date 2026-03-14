/**
 * PII (Personally Identifiable Information) Encryption at Rest
 *
 * Encrypts user PII before Firestore writes and decrypts on reads.
 * Uses AES-256-GCM (authenticated encryption) with per-field random IVs.
 * Provides HMAC-SHA256 blind indices for queryable fields (email, phone).
 *
 * Setup: add PII_SECRET to .env.local
 *   node -e "require('crypto').randomBytes(32).toString('hex')"
 *
 * Encrypted format: "pii:v1:<base64(iv)>.<base64(authTag)>.<base64(ciphertext)>"
 *
 * Security properties:
 *   - AES-256-GCM: confidentiality + integrity + tamper detection
 *   - 96-bit random IV per encryption — no two ciphertexts are the same
 *   - HMAC-SHA256 blind indices — allows equality lookups without exposing plaintext
 *   - PII_SECRET is separate from SETTINGS_ENCRYPTION_KEY (defence-in-depth)
 */

import {
  createCipheriv,
  createDecipheriv,
  createHmac,
  randomBytes,
} from "crypto";

const ALGORITHM = "aes-256-gcm" as const;
const IV_BYTES = 12; // 96-bit IV — optimal for GCM
const PII_PREFIX = "pii:v1:";

let _cachedKey: Buffer | null = null;

function getPiiKey(): Buffer {
  if (_cachedKey) return _cachedKey;
  const hex = process.env.PII_SECRET;
  if (!hex || hex.length !== 64) {
    throw new Error(
      "PII_SECRET must be a 64-character hex string (32 bytes). " +
        "Generate with: node -e \"require('crypto').randomBytes(32).toString('hex')\"",
    );
  }
  _cachedKey = Buffer.from(hex, "hex");
  return _cachedKey;
}

// ─── Core Encrypt / Decrypt ─────────────────────────────────────────────────

/**
 * Encrypt a single PII plaintext string with AES-256-GCM.
 * Returns null/empty unchanged. Non-string values pass through.
 */
export function encryptPii(
  plaintext: string | null | undefined,
): string | null | undefined {
  if (!plaintext || typeof plaintext !== "string") return plaintext;
  if (isPiiEncrypted(plaintext)) return plaintext; // already encrypted — idempotent
  const key = getPiiKey();
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const ct = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${PII_PREFIX}${iv.toString("base64")}.${tag.toString("base64")}.${ct.toString("base64")}`;
}

/**
 * Decrypt a PII ciphertext produced by encryptPii().
 * Returns non-encrypted values as-is (graceful legacy/migration fallback).
 */
export function decryptPii(
  encrypted: string | null | undefined,
): string | null | undefined {
  if (!encrypted || typeof encrypted !== "string") return encrypted;
  if (!encrypted.startsWith(PII_PREFIX)) return encrypted; // legacy plaintext — pass through
  const key = getPiiKey();
  const parts = encrypted.slice(PII_PREFIX.length).split(".");
  if (parts.length !== 3)
    throw new Error("Invalid PII encrypted value — expected 3 parts");
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

/** Returns true if the value was produced by encryptPii(). */
export function isPiiEncrypted(value: string): boolean {
  return typeof value === "string" && value.startsWith(PII_PREFIX);
}

// ─── Blind Index ────────────────────────────────────────────────────────────

/**
 * Compute a deterministic HMAC-SHA256 blind index for a PII value.
 * Used for Firestore equality queries (e.g. find user by email).
 * Input is normalised (lowercase + trim) before hashing.
 */
export function piiBlindIndex(plaintext: string): string {
  const key = getPiiKey();
  return createHmac("sha256", key)
    .update(plaintext.toLowerCase().trim())
    .digest("hex");
}

// ─── Object-level helpers ───────────────────────────────────────────────────

/**
 * Encrypt specified top-level string fields on an object.
 * Non-string / null / undefined fields are left untouched.
 */
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

/**
 * Decrypt specified top-level string fields on an object.
 * Non-encrypted / null / undefined fields are left untouched (migration-safe).
 */
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

/**
 * Add blind-index fields to an object.
 * For each mapping entry (e.g. { email: "emailIndex" }), if the source field
 * is a non-empty string, computes the HMAC and stores it as the index field.
 */
export function addPiiIndices<T extends Record<string, unknown>>(
  obj: T,
  mapping: Record<string, string>,
): T {
  const result = { ...obj };
  for (const [sourceField, indexField] of Object.entries(mapping)) {
    const val = result[sourceField];
    if (typeof val === "string" && val) {
      (result as Record<string, unknown>)[indexField] = piiBlindIndex(val);
    }
  }
  return result;
}

// ─── Collection-specific PII field definitions ──────────────────────────────

/** PII fields in the users collection (top-level string fields) */
export const USER_PII_FIELDS = ["email", "phoneNumber", "displayName"] as const;

/** Blind-index mapping for queryable user PII: source → index field name */
export const USER_PII_INDEX_MAP: Record<string, string> = {
  email: "emailIndex",
  phoneNumber: "phoneIndex",
};

/** PII fields in the addresses subcollection */
export const ADDRESS_PII_FIELDS = [
  "fullName",
  "phone",
  "addressLine1",
  "addressLine2",
] as const;

/** PII fields in orders (denormalized buyer/seller data) */
export const ORDER_PII_FIELDS = [
  "userName",
  "userEmail",
  "sellerName",
  "sellerEmail",
] as const;

/** PII fields in payouts */
export const PAYOUT_PII_FIELDS = [
  "sellerName",
  "sellerEmail",
  "upiId",
] as const;

/** PII fields in bids */
export const BID_PII_FIELDS = ["userName", "userEmail"] as const;

/** PII fields in newsletter subscribers */
export const NEWSLETTER_PII_FIELDS = ["email", "ipAddress"] as const;

/** Blind-index mapping for newsletter subscribers */
export const NEWSLETTER_PII_INDEX_MAP: Record<string, string> = {
  email: "emailIndex",
};

/** PII fields in tokens (email verification / password reset) */
export const TOKEN_PII_FIELDS = ["email"] as const;

/** Blind-index mapping for token email queries */
export const TOKEN_PII_INDEX_MAP: Record<string, string> = {
  email: "emailIndex",
};

/** PII fields in reviews */
export const REVIEW_PII_FIELDS = ["userName"] as const;

/** PII fields in offers (buyer + seller data) */
export const OFFER_PII_FIELDS = [
  "buyerName",
  "buyerEmail",
  "sellerName",
] as const;

/** PII fields in chat rooms */
export const CHAT_PII_FIELDS = ["buyerName", "sellerName"] as const;

/** PII fields in event entries */
export const EVENT_ENTRY_PII_FIELDS = [
  "userDisplayName",
  "userEmail",
  "ipAddress",
] as const;

// ─── Nested-object PII helpers ──────────────────────────────────────────────

/**
 * Encrypt PII inside a shipping address object stored in an order.
 */
export function encryptShippingAddress<T extends Record<string, unknown>>(
  addr: T | undefined | null,
): T | undefined | null {
  if (!addr) return addr;
  return encryptPiiFields(addr, [
    "fullName",
    "phone",
    "addressLine1",
    "addressLine2",
  ]);
}

/**
 * Decrypt PII inside a shipping address object read from an order.
 */
export function decryptShippingAddress<T extends Record<string, unknown>>(
  addr: T | undefined | null,
): T | undefined | null {
  if (!addr) return addr;
  return decryptPiiFields(addr, [
    "fullName",
    "phone",
    "addressLine1",
    "addressLine2",
  ]);
}

/**
 * Encrypt PII inside seller payoutDetails before writing to Firestore.
 */
export function encryptPayoutDetails<T extends Record<string, unknown>>(
  details: T | undefined | null,
): T | undefined | null {
  if (!details) return details;
  const result = { ...details };
  // Encrypt top-level upiId
  if (typeof result.upiId === "string" && result.upiId) {
    (result as Record<string, unknown>).upiId = encryptPii(
      result.upiId as string,
    );
  }
  // Encrypt nested bankAccount fields
  const bank = result.bankAccount as Record<string, unknown> | undefined;
  if (bank) {
    (result as Record<string, unknown>).bankAccount = encryptPiiFields(
      { ...bank },
      ["accountHolderName", "accountNumber"],
    );
  }
  return result as T;
}

/**
 * Decrypt PII inside seller payoutDetails after reading from Firestore.
 */
export function decryptPayoutDetails<T extends Record<string, unknown>>(
  details: T | undefined | null,
): T | undefined | null {
  if (!details) return details;
  const result = { ...details };
  if (typeof result.upiId === "string" && result.upiId) {
    (result as Record<string, unknown>).upiId = decryptPii(
      result.upiId as string,
    );
  }
  const bank = result.bankAccount as Record<string, unknown> | undefined;
  if (bank) {
    (result as Record<string, unknown>).bankAccount = decryptPiiFields(
      { ...bank },
      ["accountHolderName", "accountNumber"],
    );
  }
  return result as T;
}

/**
 * Encrypt PII inside seller shippingConfig.pickupAddress before writing.
 */
export function encryptShippingConfig<T extends Record<string, unknown>>(
  config: T | undefined | null,
): T | undefined | null {
  if (!config) return config;
  const result = { ...config };
  // shiprocketEmail is PII
  if (typeof result.shiprocketEmail === "string" && result.shiprocketEmail) {
    (result as Record<string, unknown>).shiprocketEmail = encryptPii(
      result.shiprocketEmail as string,
    );
  }
  const addr = result.pickupAddress as Record<string, unknown> | undefined;
  if (addr) {
    (result as Record<string, unknown>).pickupAddress = encryptPiiFields(
      { ...addr },
      ["name", "phone", "email", "address", "address2"],
    );
  }
  return result as T;
}

/**
 * Decrypt PII inside seller shippingConfig.pickupAddress after reading.
 */
export function decryptShippingConfig<T extends Record<string, unknown>>(
  config: T | undefined | null,
): T | undefined | null {
  if (!config) return config;
  const result = { ...config };
  if (typeof result.shiprocketEmail === "string" && result.shiprocketEmail) {
    (result as Record<string, unknown>).shiprocketEmail = decryptPii(
      result.shiprocketEmail as string,
    );
  }
  const addr = result.pickupAddress as Record<string, unknown> | undefined;
  if (addr) {
    (result as Record<string, unknown>).pickupAddress = decryptPiiFields(
      { ...addr },
      ["name", "phone", "email", "address", "address2"],
    );
  }
  return result as T;
}

/**
 * Encrypt PII on a payout bankAccount sub-object for the payouts collection.
 */
export function encryptPayoutBankAccount<T extends Record<string, unknown>>(
  bank: T | undefined | null,
): T | undefined | null {
  if (!bank) return bank;
  return encryptPiiFields({ ...bank }, ["accountHolderName"]);
}

/**
 * Decrypt PII on a payout bankAccount sub-object from the payouts collection.
 */
export function decryptPayoutBankAccount<T extends Record<string, unknown>>(
  bank: T | undefined | null,
): T | undefined | null {
  if (!bank) return bank;
  return decryptPiiFields({ ...bank }, ["accountHolderName"]);
}
