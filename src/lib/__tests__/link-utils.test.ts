import {
  getBaseUrl,
  getLinkRel,
  getLinkTarget,
  getLinkType,
  isExternalLink,
  isInternalLink,
  resolveUrl,
  validateLink,
} from "../link-utils";

describe("Link Utils", () => {
  describe("getBaseUrl", () => {
    it("should return a base URL", () => {
      const baseUrl = getBaseUrl();
      expect(baseUrl).toBeTruthy();
      expect(baseUrl).toMatch(/^https?:\/\//);
    });
  });

  describe("isInternalLink", () => {
    it("should recognize relative paths as internal", () => {
      expect(isInternalLink("/products")).toBe(true);
      expect(isInternalLink("/products/123")).toBe(true);
      expect(isInternalLink("/")).toBe(true);
      expect(isInternalLink("/about?tab=team")).toBe(true);
    });

    it("should recognize anchor links as internal", () => {
      expect(isInternalLink("#section")).toBe(true);
      expect(isInternalLink("#")).toBe(true);
    });

    it("should recognize external URLs", () => {
      expect(isInternalLink("https://google.com")).toBe(false);
      expect(isInternalLink("http://external.com/page")).toBe(false);
      expect(isInternalLink("https://sub.external.com")).toBe(false);
    });

    it("should handle empty string", () => {
      expect(isInternalLink("")).toBe(false);
    });
  });

  describe("isExternalLink", () => {
    it("should recognize external URLs", () => {
      expect(isExternalLink("https://google.com")).toBe(true);
      expect(isExternalLink("http://external.com")).toBe(true);
    });

    it("should not consider internal paths as external", () => {
      expect(isExternalLink("/products")).toBe(false);
      expect(isExternalLink("#section")).toBe(false);
    });

    it("should handle protocol-relative URLs", () => {
      expect(isExternalLink("//example.com")).toBe(true);
    });
  });

  describe("getLinkType", () => {
    it("should identify internal links", () => {
      expect(getLinkType("/products")).toBe("internal");
      expect(getLinkType("/")).toBe("internal");
    });

    it("should identify external links", () => {
      expect(getLinkType("https://google.com")).toBe("external");
      expect(getLinkType("http://example.com")).toBe("external");
    });

    it("should identify email links", () => {
      expect(getLinkType("mailto:test@example.com")).toBe("email");
    });

    it("should identify phone links", () => {
      expect(getLinkType("tel:+1234567890")).toBe("phone");
    });

    it("should identify anchor links", () => {
      expect(getLinkType("#section")).toBe("anchor");
    });

    it("should identify invalid links", () => {
      expect(getLinkType("")).toBe("invalid");
    });
  });

  describe("resolveUrl", () => {
    it("should resolve relative paths", () => {
      const resolved = resolveUrl("/products");
      expect(resolved).toContain("/products");
      expect(resolved).toMatch(/^https?:\/\//);
    });

    it("should preserve absolute URLs", () => {
      const url = "https://external.com/page";
      expect(resolveUrl(url)).toBe(url);
    });

    it("should handle empty strings", () => {
      expect(resolveUrl("")).toBe("");
    });
  });

  describe("validateLink", () => {
    it("should validate internal links", () => {
      const result = validateLink("/products");
      expect(result.isValid).toBe(true);
      expect(result.type).toBe("internal");
      expect(result.isInternal).toBe(true);
    });

    it("should validate external links", () => {
      const result = validateLink("https://google.com");
      expect(result.isValid).toBe(true);
      expect(result.type).toBe("external");
      expect(result.isInternal).toBe(false);
    });

    it("should validate email links", () => {
      const result = validateLink("mailto:test@example.com");
      expect(result.isValid).toBe(true);
      expect(result.type).toBe("email");
    });

    it("should validate phone links", () => {
      const result = validateLink("tel:+1234567890");
      expect(result.isValid).toBe(true);
      expect(result.type).toBe("phone");
    });

    it("should validate anchor links", () => {
      const result = validateLink("#section");
      expect(result.isValid).toBe(true);
      expect(result.type).toBe("anchor");
    });

    it("should respect allowExternal option", () => {
      const result = validateLink("https://google.com", {
        allowExternal: false,
      });
      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("should respect allowEmail option", () => {
      const result = validateLink("mailto:test@example.com", {
        allowEmail: false,
      });
      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("should respect requireHttps option", () => {
      const result = validateLink("http://insecure.com", {
        requireHttps: true,
      });
      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe("getLinkRel", () => {
    it("should return noopener noreferrer for external links", () => {
      const rel = getLinkRel("https://google.com");
      expect(rel).toBe("noopener noreferrer");
    });

    it("should return undefined for internal links", () => {
      const rel = getLinkRel("/products");
      expect(rel).toBe("");
    });
  });

  describe("getLinkTarget", () => {
    it("should return _blank for external links", () => {
      const target = getLinkTarget("https://google.com");
      expect(target).toBe("_blank");
    });

    it("should return _self for internal links by default", () => {
      const target = getLinkTarget("/products");
      expect(target).toBe("_self");
    });

    it("should respect explicit target parameter", () => {
      const target = getLinkTarget("/products", "_blank");
      expect(target).toBe("_blank");
    });
  });
});
