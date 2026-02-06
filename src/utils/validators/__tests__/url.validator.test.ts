/**
 * @jest-environment jsdom
 */

import {
  isValidUrl,
  isValidUrlWithProtocol,
  isExternalUrl,
  sanitizeUrl,
} from "../url.validator";

describe("URL Validator", () => {
  describe("isValidUrl", () => {
    it("should validate correct URLs", () => {
      expect(isValidUrl("https://example.com")).toBe(true);
      expect(isValidUrl("http://example.com")).toBe(true);
      expect(isValidUrl("https://subdomain.example.com")).toBe(true);
      expect(isValidUrl("https://example.com/path/to/page")).toBe(true);
      expect(isValidUrl("https://example.com?query=value")).toBe(true);
      expect(isValidUrl("https://example.com#anchor")).toBe(true);
    });

    it("should reject invalid URLs", () => {
      expect(isValidUrl("not-a-url")).toBe(false);
      expect(isValidUrl("example.com")).toBe(false); // Missing protocol
      expect(isValidUrl("//example.com")).toBe(false); // Relative protocol
      expect(isValidUrl("")).toBe(false);
    });

    it("should handle edge cases", () => {
      expect(isValidUrl("ftp://example.com")).toBe(true);
      expect(isValidUrl("mailto:user@example.com")).toBe(true);
      expect(isValidUrl("file:///path/to/file")).toBe(true);
    });
  });

  describe("isValidUrlWithProtocol", () => {
    it("should validate URLs with allowed protocols", () => {
      expect(isValidUrlWithProtocol("https://example.com")).toBe(true);
      expect(isValidUrlWithProtocol("http://example.com")).toBe(true);
    });

    it("should reject URLs with disallowed protocols", () => {
      expect(isValidUrlWithProtocol("ftp://example.com")).toBe(false);
      expect(isValidUrlWithProtocol("mailto:user@example.com")).toBe(false);
      expect(isValidUrlWithProtocol("file:///path/to/file")).toBe(false);
    });

    it("should respect custom protocol list", () => {
      expect(isValidUrlWithProtocol("ftp://example.com", ["ftp"])).toBe(true);
      expect(isValidUrlWithProtocol("https://example.com", ["ftp"])).toBe(
        false,
      );
    });

    it("should reject invalid URLs", () => {
      expect(isValidUrlWithProtocol("not-a-url")).toBe(false);
      expect(isValidUrlWithProtocol("")).toBe(false);
    });
  });

  describe("isExternalUrl", () => {
    it("should detect external URLs", () => {
      expect(isExternalUrl("https://external.com", "example.com")).toBe(true);
      expect(isExternalUrl("https://another-domain.org", "example.com")).toBe(
        true,
      );
    });

    it("should detect internal URLs", () => {
      expect(isExternalUrl("https://example.com", "example.com")).toBe(false);
      expect(isExternalUrl("https://example.com/page", "example.com")).toBe(
        false,
      );
    });

    it("should handle subdomains", () => {
      expect(
        isExternalUrl("https://subdomain.example.com", "example.com"),
      ).toBe(true);
    });

    it("should reject invalid URLs", () => {
      expect(isExternalUrl("not-a-url", "example.com")).toBe(false);
      expect(isExternalUrl("", "example.com")).toBe(false);
    });

    it("should handle missing currentDomain", () => {
      // In test environment, window.location.hostname doesn't exist
      expect(isExternalUrl("https://example.com")).toBe(true);
    });
  });

  describe("sanitizeUrl", () => {
    it("should block dangerous javascript: protocol", () => {
      expect(sanitizeUrl("javascript:alert(1)")).toBe("about:blank");
      expect(sanitizeUrl("JAVASCRIPT:alert(1)")).toBe("about:blank"); // Case insensitive
    });

    it("should block dangerous data: protocol", () => {
      expect(sanitizeUrl("data:text/html,<script>alert(1)</script>")).toBe(
        "about:blank",
      );
    });

    it("should block dangerous vbscript: protocol", () => {
      expect(sanitizeUrl("vbscript:msgbox(1)")).toBe("about:blank");
    });

    it("should allow safe URLs", () => {
      expect(sanitizeUrl("https://example.com")).toBe("https://example.com");
      expect(sanitizeUrl("http://example.com")).toBe("http://example.com");
      expect(sanitizeUrl("/relative/path")).toBe("/relative/path");
      expect(sanitizeUrl("mailto:user@example.com")).toBe(
        "mailto:user@example.com",
      );
    });

    it("should handle edge cases", () => {
      expect(sanitizeUrl("")).toBe("");
      expect(sanitizeUrl("javascript:")).toBe("about:blank");
    });
  });
});
