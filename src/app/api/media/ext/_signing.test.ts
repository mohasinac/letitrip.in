import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  computeExtSignature,
  isExtHmacEnabled,
  signExtMediaUrl,
  verifyExtSignature,
} from "./_signing";

const SECRET = "test-secret-do-not-use-in-prod";
const RAW_URL = "https://example.com/path/image.jpg?cb=42";

describe("/api/media/ext HMAC signing", () => {
  let originalSecret: string | undefined;

  beforeEach(() => {
    originalSecret = process.env.MEDIA_EXT_HMAC_SECRET;
  });

  afterEach(() => {
    if (originalSecret === undefined) delete process.env.MEDIA_EXT_HMAC_SECRET;
    else process.env.MEDIA_EXT_HMAC_SECRET = originalSecret;
  });

  describe("disabled mode (no secret configured)", () => {
    beforeEach(() => {
      delete process.env.MEDIA_EXT_HMAC_SECRET;
    });

    it("isExtHmacEnabled() returns false", () => {
      expect(isExtHmacEnabled()).toBe(false);
    });

    it("signExtMediaUrl() returns the unsigned proxy URL (back-compat)", () => {
      const url = signExtMediaUrl(RAW_URL);
      expect(url).toBe(`/api/media/ext?url=${encodeURIComponent(RAW_URL)}`);
      expect(url).not.toContain("sig=");
      expect(url).not.toContain("ts=");
    });

    it("verifyExtSignature() accepts any request when disabled", () => {
      const encoded = encodeURIComponent(RAW_URL);
      expect(verifyExtSignature(encoded, null, null)).toEqual({ ok: true, reason: "DISABLED" });
      expect(verifyExtSignature(encoded, "1234", "garbage")).toEqual({ ok: true, reason: "DISABLED" });
    });
  });

  describe("enabled mode (secret configured)", () => {
    beforeEach(() => {
      process.env.MEDIA_EXT_HMAC_SECRET = SECRET;
    });

    it("isExtHmacEnabled() returns true", () => {
      expect(isExtHmacEnabled()).toBe(true);
    });

    it("signExtMediaUrl() emits sig + ts query params", () => {
      const url = signExtMediaUrl(RAW_URL);
      expect(url).toContain(`url=${encodeURIComponent(RAW_URL)}`);
      expect(url).toMatch(/&ts=\d+/);
      expect(url).toMatch(/&sig=[a-f0-9]{64}/);
    });

    it("verifyExtSignature() round-trips its own signature", () => {
      const encoded = encodeURIComponent(RAW_URL);
      const ts = Date.now();
      const sig = computeExtSignature(encoded, ts);
      expect(verifyExtSignature(encoded, String(ts), sig, ts + 1000)).toEqual({ ok: true });
    });

    it("rejects MISSING when ts or sig is absent", () => {
      const encoded = encodeURIComponent(RAW_URL);
      expect(verifyExtSignature(encoded, null, "abc").ok).toBe(false);
      expect(verifyExtSignature(encoded, "1234", null).ok).toBe(false);
      expect(verifyExtSignature(encoded, null, null).ok).toBe(false);
    });

    it("rejects EXPIRED when ts is outside the 60 s window", () => {
      const encoded = encodeURIComponent(RAW_URL);
      const ts = Date.now();
      const sig = computeExtSignature(encoded, ts);
      const result = verifyExtSignature(encoded, String(ts), sig, ts + 61_000);
      expect(result).toEqual({ ok: false, reason: "EXPIRED" });
    });

    it("rejects MISMATCH when the digest doesn't match the URL it claims to sign", () => {
      const ts = Date.now();
      const otherUrl = encodeURIComponent("https://example.com/other.jpg");
      const validSigForOther = computeExtSignature(otherUrl, ts);
      // Try to use that signature against a different URL — verification must fail.
      const result = verifyExtSignature(
        encodeURIComponent(RAW_URL),
        String(ts),
        validSigForOther,
        ts + 1000,
      );
      expect(result.ok).toBe(false);
      expect(result.reason).toBe("MISMATCH");
    });

    it("rejects MISMATCH when ts is non-numeric", () => {
      const encoded = encodeURIComponent(RAW_URL);
      const result = verifyExtSignature(encoded, "not-a-number", "deadbeef");
      expect(result.ok).toBe(false);
    });

    it("uses timing-safe comparison (different-length digests don't crash)", () => {
      const encoded = encodeURIComponent(RAW_URL);
      const ts = Date.now();
      const result = verifyExtSignature(encoded, String(ts), "short", ts + 100);
      expect(result.ok).toBe(false);
      expect(result.reason).toBe("MISMATCH");
    });
  });
});
