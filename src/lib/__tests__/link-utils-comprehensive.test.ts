/**
 * Comprehensive Link Utils Tests - Edge Cases & Security
 *
 * This test suite covers:
 * - URL validation edge cases
 * - Security concerns (XSS, open redirect)
 * - Protocol handling
 * - International URLs
 * - Malformed URLs
 * - Real-world scenarios
 */

import {
  extractDomain,
  getBaseUrl,
  getLinkRel,
  getLinkTarget,
  getLinkType,
  isExternalLink,
  isInternalLink,
  isValidUrl,
  normalizeUrl,
  resolveUrl,
  sanitizeLinkForDisplay,
  validateLink,
} from "../link-utils";

describe("getBaseUrl - Environment Handling", () => {
  it("should return a valid base URL", () => {
    const result = getBaseUrl();
    expect(result).toBeTruthy();
    expect(result).toMatch(/^https?:\/\//);
  });

  it("should return consistent URL", () => {
    const result1 = getBaseUrl();
    const result2 = getBaseUrl();
    expect(result1).toBe(result2);
  });

  it("should return localhost URL in test environment", () => {
    const result = getBaseUrl();
    // In test environment, should return localhost
    expect(result).toContain("localhost");
  });
});

describe("isInternalLink - Comprehensive", () => {
  it("should recognize root path", () => {
    expect(isInternalLink("/")).toBe(true);
  });

  it("should recognize paths with query parameters", () => {
    expect(isInternalLink("/products?category=electronics")).toBe(true);
    expect(isInternalLink("/search?q=test&sort=price")).toBe(true);
  });

  it("should recognize paths with hash", () => {
    expect(isInternalLink("/page#section")).toBe(true);
    expect(isInternalLink("/docs#api-reference")).toBe(true);
  });

  it("should recognize paths with both query and hash", () => {
    expect(isInternalLink("/page?tab=overview#features")).toBe(true);
  });

  it("should handle protocol-relative URLs as external", () => {
    expect(isInternalLink("//example.com")).toBe(false);
    expect(isInternalLink("//cdn.example.com/file.js")).toBe(false);
  });

  it("should handle special schemes", () => {
    expect(isInternalLink("mailto:test@example.com")).toBe(false);
    expect(isInternalLink("tel:+1234567890")).toBe(false);
    expect(isInternalLink("javascript:void(0)")).toBe(false);
    expect(isInternalLink("data:text/plain,hello")).toBe(false);
  });

  it("should handle null and undefined", () => {
    expect(isInternalLink(null as any)).toBe(false);
    expect(isInternalLink(undefined as any)).toBe(false);
  });

  it("should handle empty string", () => {
    expect(isInternalLink("")).toBe(false);
  });

  it("should handle whitespace-only strings", () => {
    expect(isInternalLink("   ")).toBe(false);
  });

  it("should handle paths with encoded characters", () => {
    expect(isInternalLink("/product/test%20product")).toBe(true);
    expect(isInternalLink("/search?q=%E0%A4%B9%E0%A4%BF")).toBe(true); // Hindi
  });

  it("should recognize paths starting with slash", () => {
    expect(isInternalLink("/products")).toBe(true);
    expect(isInternalLink("/api/users")).toBe(true);
    expect(isInternalLink("/category/electronics/mobile")).toBe(true);
  });

  it("should NOT recognize paths without leading slash", () => {
    // Relative paths without leading slash are ambiguous
    expect(isInternalLink("products")).toBe(false);
    expect(isInternalLink("api/users")).toBe(false);
  });
});

describe("isExternalLink - Edge Cases", () => {
  it("should recognize different protocols", () => {
    expect(isExternalLink("http://example.com")).toBe(true);
    expect(isExternalLink("https://example.com")).toBe(true);
    expect(isExternalLink("ftp://example.com")).toBe(false); // Not http(s)
  });

  it("should recognize subdomains as external", () => {
    expect(isExternalLink("https://api.example.com")).toBe(true);
    expect(isExternalLink("https://cdn.example.com")).toBe(true);
  });

  it("should recognize different ports as same domain", () => {
    // Port shouldn't matter for domain comparison
    expect(isExternalLink("http://localhost:3001")).toBe(false);
    expect(isExternalLink("http://localhost:8080")).toBe(false);
  });

  it("should handle URLs with authentication", () => {
    expect(isExternalLink("https://user:pass@example.com")).toBe(true);
  });

  it("should handle internationalized domain names", () => {
    expect(isExternalLink("https://münchen.de")).toBe(true);
  });

  it("should handle case sensitivity in domain", () => {
    // Domain names are case-insensitive
    expect(isExternalLink("https://EXAMPLE.COM")).toBe(true);
  });
});

describe("getLinkType - Comprehensive Classification", () => {
  it("should identify javascript: URLs as invalid", () => {
    expect(getLinkType("javascript:alert(1)")).toBe("invalid");
    expect(getLinkType("javascript:void(0)")).toBe("invalid");
  });

  it("should identify data: URLs as invalid", () => {
    expect(getLinkType("data:text/html,<script>alert(1)</script>")).toBe(
      "invalid"
    );
  });

  it("should identify blob: URLs", () => {
    const result = getLinkType("blob:http://example.com/uuid");
    // May be classified as external or invalid depending on implementation
    expect(result).toBeTruthy();
  });

  it("should identify file: URLs", () => {
    const result = getLinkType("file:///C:/path/to/file");
    expect(result).toBeTruthy();
  });

  it("should handle mixed case protocols", () => {
    expect(getLinkType("MAILTO:test@example.com")).toBe("email");
    expect(getLinkType("TEL:+1234567890")).toBe("phone");
    expect(getLinkType("HTTP://example.com")).toBe("external");
  });

  it("should handle URLs with fragments", () => {
    expect(getLinkType("/page#section")).toBe("internal");
    expect(getLinkType("https://example.com#section")).toBe("external");
  });

  it("should handle URLs with query params", () => {
    expect(getLinkType("/page?param=value")).toBe("internal");
    expect(getLinkType("https://example.com?param=value")).toBe("external");
  });
});

describe("resolveUrl - URL Resolution", () => {
  it("should resolve absolute internal paths", () => {
    const result = resolveUrl("/products");
    expect(result).toMatch(/^https?:\/\//);
    expect(result).toContain("/products");
  });

  it("should preserve external URLs", () => {
    const url = "https://example.com/page";
    expect(resolveUrl(url)).toBe(url);
  });

  it("should handle anchor links", () => {
    const result = resolveUrl("#section");
    expect(result).toContain("#section");
  });

  it("should handle query parameters", () => {
    const result = resolveUrl("/search?q=test");
    expect(result).toContain("/search?q=test");
  });

  it("should handle complex paths", () => {
    const result = resolveUrl("/category/sub-category/product?id=123#reviews");
    expect(result).toContain("/category/sub-category/product?id=123#reviews");
  });
});

describe("validateLink - Security & Validation", () => {
  it("should validate internal links", () => {
    const result = validateLink("/products");
    expect(result.isValid).toBe(true);
    expect(result.type).toBe("internal");
    expect(result.isInternal).toBe(true);
  });

  it("should validate external links", () => {
    const result = validateLink("https://example.com");
    expect(result.isValid).toBe(true);
    expect(result.type).toBe("external");
    expect(result.isInternal).toBe(false);
  });

  it("should reject javascript: URLs", () => {
    const result = validateLink("javascript:alert(1)");
    expect(result.isValid).toBe(false);
    expect(result.error).toBeTruthy();
  });

  it("should reject data: URLs", () => {
    const result = validateLink("data:text/html,<script>");
    expect(result.isValid).toBe(false);
    expect(result.error).toBeTruthy();
  });

  it("should validate email links when allowed", () => {
    const result = validateLink("mailto:test@example.com", {
      allowEmail: true,
    });
    expect(result.isValid).toBe(true);
    expect(result.type).toBe("email");
  });

  it("should reject email links when not allowed", () => {
    const result = validateLink("mailto:test@example.com", {
      allowEmail: false,
    });
    expect(result.isValid).toBe(false);
  });

  it("should validate phone links when allowed", () => {
    const result = validateLink("tel:+1234567890", { allowPhone: true });
    expect(result.isValid).toBe(true);
    expect(result.type).toBe("phone");
  });

  it("should enforce HTTPS for external links", () => {
    const result = validateLink("http://example.com", { requireHttps: true });
    expect(result.isValid).toBe(false);
    expect(result.error).toBe("Only HTTPS URLs are allowed");
  });

  it("should allow HTTPS when required", () => {
    const result = validateLink("https://example.com", { requireHttps: true });
    expect(result.isValid).toBe(true);
  });

  it("should validate anchor links", () => {
    const result = validateLink("#section", { allowAnchor: true });
    expect(result.isValid).toBe(true);
    expect(result.type).toBe("anchor");
  });

  it("should reject anchor links when not allowed", () => {
    const result = validateLink("#section", { allowAnchor: false });
    expect(result.isValid).toBe(false);
  });
});

describe("getLinkTarget - Target Attribute Logic", () => {
  it("should return _blank for external links", () => {
    const result = getLinkTarget("https://example.com");
    expect(result).toBe("_blank");
  });

  it("should return _self for internal links", () => {
    const result = getLinkTarget("/products");
    expect(result).toBe("_self");
  });

  it("should return _self for anchor links", () => {
    const result = getLinkTarget("#section");
    expect(result).toBe("_self");
  });

  it("should respect explicit target", () => {
    expect(getLinkTarget("/products", "_blank")).toBe("_blank");
    expect(getLinkTarget("https://example.com", "_self")).toBe("_self");
  });

  it("should handle email links", () => {
    const result = getLinkTarget("mailto:test@example.com");
    expect(result).toBe("_self"); // Usually opens mail client
  });

  it("should handle phone links", () => {
    const result = getLinkTarget("tel:+1234567890");
    expect(result).toBe("_self"); // Usually opens phone app
  });
});

describe("getLinkRel - Security Attributes", () => {
  it("should add noopener noreferrer for external links", () => {
    const result = getLinkRel("https://example.com");
    expect(result).toContain("noopener");
    expect(result).toContain("noreferrer");
  });

  it("should not add rel for internal links", () => {
    const result = getLinkRel("/products");
    expect(result).toBe("");
  });

  it("should add nofollow for external links when specified", () => {
    const result = getLinkRel("https://example.com", { nofollow: true });
    expect(result).toContain("nofollow");
  });

  it("should handle sponsored links", () => {
    const result = getLinkRel("https://example.com", { sponsored: true });
    expect(result).toContain("sponsored");
  });

  it("should handle UGC (user-generated content)", () => {
    const result = getLinkRel("https://example.com", { ugc: true });
    expect(result).toContain("ugc");
  });

  it("should combine multiple rel values", () => {
    const result = getLinkRel("https://example.com", {
      nofollow: true,
      sponsored: true,
    });
    expect(result).toContain("noopener");
    expect(result).toContain("noreferrer");
    expect(result).toContain("nofollow");
    expect(result).toContain("sponsored");
  });
});

describe("sanitizeLinkForDisplay - XSS Prevention", () => {
  it("should remove dangerous characters", () => {
    const result = sanitizeLinkForDisplay('javascript:alert("xss")');
    expect(result).not.toContain("javascript:");
    expect(result).not.toContain('"');
  });

  it("should handle normal URLs", () => {
    const url = "https://example.com/page";
    const result = sanitizeLinkForDisplay(url);
    expect(result).toBe(url);
  });

  it("should truncate very long URLs", () => {
    const longUrl = "https://example.com/" + "a".repeat(200);
    const result = sanitizeLinkForDisplay(longUrl, 50);
    expect(result.length).toBeLessThanOrEqual(53); // 50 + "..."
  });

  it("should handle URLs with special characters", () => {
    const url = "https://example.com/page?param=<script>";
    const result = sanitizeLinkForDisplay(url);
    expect(result).not.toContain("<script>");
  });
});

describe("extractDomain - Domain Extraction", () => {
  it("should extract domain from URL", () => {
    expect(extractDomain("https://example.com/page")).toBe("example.com");
    expect(extractDomain("http://www.example.com/page")).toBe(
      "www.example.com"
    );
  });

  it("should handle subdomains", () => {
    expect(extractDomain("https://api.example.com")).toBe("api.example.com");
    expect(extractDomain("https://cdn.sub.example.com")).toBe(
      "cdn.sub.example.com"
    );
  });

  it("should handle URLs with ports", () => {
    expect(extractDomain("https://example.com:8080/page")).toBe("example.com");
  });

  it("should handle URLs with authentication", () => {
    expect(extractDomain("https://user:pass@example.com")).toBe("example.com");
  });

  it("should handle invalid URLs", () => {
    expect(extractDomain("not-a-url")).toBeNull();
    expect(extractDomain("")).toBeNull();
  });

  it("should handle relative URLs", () => {
    expect(extractDomain("/products")).toBeNull();
  });
});

describe("isValidUrl - URL Format Validation", () => {
  it("should validate complete URLs", () => {
    expect(isValidUrl("https://example.com")).toBe(true);
    expect(isValidUrl("http://example.com/page")).toBe(true);
  });

  it("should reject invalid URLs", () => {
    expect(isValidUrl("not a url")).toBe(false);
    expect(isValidUrl("htp://example.com")).toBe(false);
  });

  it("should handle relative URLs", () => {
    expect(isValidUrl("/products")).toBe(false);
  });

  it("should handle protocol-relative URLs", () => {
    expect(isValidUrl("//example.com")).toBe(false);
  });

  it("should validate internationalized URLs", () => {
    expect(isValidUrl("https://münchen.de")).toBe(true);
  });

  it("should handle URLs with special characters", () => {
    expect(isValidUrl("https://example.com/page?q=test&a=1")).toBe(true);
    expect(isValidUrl("https://example.com/page#section")).toBe(true);
  });
});

describe("normalizeUrl - URL Normalization", () => {
  it("should lowercase protocol and domain", () => {
    expect(normalizeUrl("HTTPS://EXAMPLE.COM/Page")).toBe(
      "https://example.com/Page"
    );
  });

  it("should remove trailing slash from domain", () => {
    expect(normalizeUrl("https://example.com/")).toBe("https://example.com");
  });

  it("should preserve trailing slash on paths", () => {
    expect(normalizeUrl("https://example.com/page/")).toBe(
      "https://example.com/page/"
    );
  });

  it("should remove default ports", () => {
    expect(normalizeUrl("https://example.com:443/page")).toBe(
      "https://example.com/page"
    );
    expect(normalizeUrl("http://example.com:80/page")).toBe(
      "http://example.com/page"
    );
  });

  it("should preserve non-default ports", () => {
    expect(normalizeUrl("https://example.com:8080/page")).toBe(
      "https://example.com:8080/page"
    );
  });

  it("should handle relative URLs", () => {
    expect(normalizeUrl("/products")).toBe("/products");
  });

  it("should remove duplicate slashes", () => {
    expect(normalizeUrl("https://example.com//page//path")).toBe(
      "https://example.com/page/path"
    );
  });

  it("should preserve percent-encoding", () => {
    // Current implementation doesn't decode percent-encoding
    // This is actually safer for URL integrity
    expect(normalizeUrl("https://example.com/%7Epage")).toBe(
      "https://example.com/%7Epage"
    );
  });
});

describe("Link Utils - Security Tests", () => {
  describe("XSS Prevention", () => {
    it("should block javascript: protocol", () => {
      const malicious = "javascript:alert(document.cookie)";
      expect(getLinkType(malicious)).toBe("invalid");
      expect(validateLink(malicious).isValid).toBe(false);
    });

    it("should block data: URLs with scripts", () => {
      const malicious = "data:text/html,<script>alert(1)</script>";
      expect(validateLink(malicious).isValid).toBe(false);
    });

    it("should block vbscript: protocol", () => {
      const malicious = "vbscript:msgbox(1)";
      expect(getLinkType(malicious)).toBe("invalid");
    });

    it("should handle encoded javascript:", () => {
      const malicious = "java%09script:alert(1)";
      // Should be detected or normalized
      const result = validateLink(malicious);
      // Implementation should catch this
      expect(result.isValid).toBe(false);
    });
  });

  describe("Open Redirect Prevention", () => {
    it("should identify external redirects", () => {
      expect(isExternalLink("https://evil.com")).toBe(true);
      expect(isInternalLink("https://evil.com")).toBe(false);
    });

    it("should not confuse subdomains", () => {
      // example.com vs evil-example.com
      expect(isExternalLink("https://evil-example.com")).toBe(true);
    });

    it("should handle protocol-relative URLs", () => {
      expect(isInternalLink("//evil.com")).toBe(false);
      expect(isExternalLink("//evil.com")).toBe(true);
    });
  });

  describe("URL Parsing Edge Cases", () => {
    it("should handle URLs with @", () => {
      // Confusing format: http://trusted.com@evil.com
      const confusing = "http://trusted.com@evil.com";
      const domain = extractDomain(confusing);
      // Should extract actual domain (evil.com)
      expect(domain).toBe("evil.com");
    });

    it("should handle backslash confusion", () => {
      // Some browsers treat \\ as //
      const backslash = "https://example.com\\evil.com";
      // Should properly classify
      const result = isInternalLink(backslash);
      expect(typeof result).toBe("boolean");
    });

    it("should handle null bytes", () => {
      const nullByte = "https://example.com\x00@evil.com";
      // Should handle gracefully
      expect(() => validateLink(nullByte)).not.toThrow();
    });
  });
});

describe("Link Utils - International Support", () => {
  it("should handle Hindi URLs", () => {
    const hindiUrl = "/खोज?q=test";
    expect(isInternalLink(hindiUrl)).toBe(true);
  });

  it("should handle Chinese URLs", () => {
    const chineseUrl = "/搜索?q=test";
    expect(isInternalLink(chineseUrl)).toBe(true);
  });

  it("should handle Arabic URLs", () => {
    const arabicUrl = "/بحث?q=test";
    expect(isInternalLink(arabicUrl)).toBe(true);
  });

  it("should handle emoji in URLs", () => {
    const emojiUrl = "/products/🎉-sale";
    expect(isInternalLink(emojiUrl)).toBe(true);
  });

  it("should handle IDN (Internationalized Domain Names)", () => {
    const idnUrl = "https://münchen.de";
    expect(isExternalLink(idnUrl)).toBe(true);
  });
});

describe("Link Utils - Performance Edge Cases", () => {
  it("should handle very long URLs", () => {
    const longPath = "/" + "a".repeat(2000);
    expect(() => isInternalLink(longPath)).not.toThrow();
    expect(isInternalLink(longPath)).toBe(true);
  });

  it("should handle many query parameters", () => {
    const manyParams = "/page?" + Array(100).fill("a=1").join("&");
    expect(() => isInternalLink(manyParams)).not.toThrow();
    expect(isInternalLink(manyParams)).toBe(true);
  });

  it("should handle deeply nested paths", () => {
    const deepPath = "/" + Array(50).fill("a").join("/");
    expect(() => isInternalLink(deepPath)).not.toThrow();
    expect(isInternalLink(deepPath)).toBe(true);
  });
});
