/**
 * Tests for SEO Metadata Utilities
 */

import {
  defaultMetadata,
  generateBreadcrumbList,
  generateMetadata,
  generateProductMetadata,
  siteConfig,
} from "../metadata";

describe("SEO Metadata", () => {
  describe("siteConfig", () => {
    it("should have all required site configuration", () => {
      expect(siteConfig).toHaveProperty("name");
      expect(siteConfig).toHaveProperty("description");
      expect(siteConfig).toHaveProperty("url");
      expect(siteConfig).toHaveProperty("ogImage");
      expect(siteConfig).toHaveProperty("links");
    });

    it("should have valid URLs", () => {
      expect(siteConfig.url).toMatch(/^https?:\/\//);
      expect(siteConfig.ogImage).toMatch(/^https?:\/\//);
      expect(siteConfig.links.twitter).toMatch(/^https?:\/\//);
      expect(siteConfig.links.facebook).toMatch(/^https?:\/\//);
      expect(siteConfig.links.instagram).toMatch(/^https?:\/\//);
    });

    it("should have non-empty description", () => {
      expect(siteConfig.description.length).toBeGreaterThan(50);
      expect(siteConfig.description).toContain("India");
    });
  });

  describe("defaultMetadata", () => {
    it("should have title configuration", () => {
      expect(defaultMetadata.title).toBeDefined();
      expect(defaultMetadata.title).toHaveProperty("default");
      expect(defaultMetadata.title).toHaveProperty("template");
    });

    it("should have description", () => {
      expect(defaultMetadata.description).toBe(siteConfig.description);
    });

    it("should have keywords array", () => {
      expect(Array.isArray(defaultMetadata.keywords)).toBe(true);
      expect(defaultMetadata.keywords!.length).toBeGreaterThan(10);
    });

    it("should have SEO-optimized keywords", () => {
      const keywords = defaultMetadata.keywords as string[];
      expect(keywords).toContain("beyblades India");
      expect(keywords).toContain("Pokemon TCG India");
      expect(keywords).toContain("no customs charges India");
    });

    it("should have OpenGraph metadata", () => {
      expect(defaultMetadata.openGraph).toBeDefined();
      expect(defaultMetadata.openGraph?.type).toBe("website");
      expect(defaultMetadata.openGraph?.locale).toBe("en_IN");
      expect(defaultMetadata.openGraph?.images).toBeDefined();
    });

    it("should have Twitter card metadata", () => {
      expect(defaultMetadata.twitter).toBeDefined();
      expect(defaultMetadata.twitter?.card).toBe("summary_large_image");
      expect(defaultMetadata.twitter?.creator).toBe("@letitrip");
    });

    it("should have robots configuration", () => {
      expect(defaultMetadata.robots).toBeDefined();
      expect(defaultMetadata.robots?.index).toBe(true);
      expect(defaultMetadata.robots?.follow).toBe(true);
    });

    it("should have icons configuration", () => {
      expect(defaultMetadata.icons).toBeDefined();
      expect(defaultMetadata.icons).toHaveProperty("icon");
      expect(defaultMetadata.icons).toHaveProperty("apple");
    });

    it("should have manifest link", () => {
      expect(defaultMetadata.manifest).toBe("/manifest.json");
    });
  });

  describe("generateMetadata", () => {
    it("should generate basic page metadata", () => {
      const metadata = generateMetadata({
        title: "Test Page",
        description: "Test description",
      });

      expect(metadata.title).toContain("Test Page");
      expect(metadata.title).toContain(siteConfig.name);
      expect(metadata.description).toBe("Test description");
    });

    it("should include custom keywords", () => {
      const customKeywords = ["test1", "test2", "test3"];
      const metadata = generateMetadata({
        title: "Test",
        description: "Test",
        keywords: customKeywords,
      });

      expect(metadata.keywords).toEqual(customKeywords);
    });

    it("should use default keywords if none provided", () => {
      const metadata = generateMetadata({
        title: "Test",
        description: "Test",
      });

      expect(metadata.keywords).toEqual(defaultMetadata.keywords);
    });

    it("should generate canonical URL", () => {
      const metadata = generateMetadata({
        title: "Test",
        description: "Test",
        path: "/products/test",
      });

      expect(metadata.alternates?.canonical).toBe(
        `${siteConfig.url}/products/test`
      );
    });

    it("should generate OpenGraph metadata", () => {
      const metadata = generateMetadata({
        title: "Test Page",
        description: "Test description",
      });

      expect(metadata.openGraph).toBeDefined();
      expect(metadata.openGraph?.title).toContain("Test Page");
      expect(metadata.openGraph?.description).toBe("Test description");
      expect(metadata.openGraph?.siteName).toBe(siteConfig.name);
      expect(metadata.openGraph?.locale).toBe("en_IN");
    });

    it("should use custom image if provided", () => {
      const customImage = "https://example.com/custom.jpg";
      const metadata = generateMetadata({
        title: "Test",
        description: "Test",
        image: customImage,
      });

      expect(metadata.openGraph?.images).toEqual([
        {
          url: customImage,
          width: 1200,
          height: 630,
          alt: "Test",
        },
      ]);
    });

    it("should generate Twitter card metadata", () => {
      const metadata = generateMetadata({
        title: "Test Page",
        description: "Test description",
      });

      expect(metadata.twitter).toBeDefined();
      expect(metadata.twitter?.card).toBe("summary_large_image");
      expect(metadata.twitter?.title).toContain("Test Page");
    });

    it("should handle noIndex flag", () => {
      const indexedMetadata = generateMetadata({
        title: "Test",
        description: "Test",
        noIndex: false,
      });

      expect(indexedMetadata.robots?.index).toBe(true);
      expect(indexedMetadata.robots?.follow).toBe(true);

      const noIndexMetadata = generateMetadata({
        title: "Test",
        description: "Test",
        noIndex: true,
      });

      expect(noIndexMetadata.robots?.index).toBe(false);
      expect(noIndexMetadata.robots?.follow).toBe(false);
    });
  });

  describe("generateProductMetadata", () => {
    const productData = {
      title: "Beyblade X Starter",
      description: "Authentic Japanese Beyblade",
      image: "https://example.com/beyblade.jpg",
      price: 1500,
    };

    it("should generate product metadata", () => {
      const metadata = generateProductMetadata(productData);

      expect(metadata.title).toBe(productData.title);
      expect(metadata.description).toBe(productData.description);
    });

    it("should include product-specific OpenGraph", () => {
      const metadata = generateProductMetadata(productData);

      expect(metadata.openGraph).toBeDefined();
      expect(metadata.openGraph?.type).toBe("website");
      expect(metadata.openGraph?.images).toEqual([productData.image]);
    });

    it("should include product price metadata", () => {
      const metadata = generateProductMetadata(productData);

      expect(metadata.other).toBeDefined();
      expect(metadata.other?.["product:price:amount"]).toBe("1500");
      expect(metadata.other?.["product:price:currency"]).toBe("INR");
    });

    it("should support custom currency", () => {
      const metadata = generateProductMetadata({
        ...productData,
        currency: "USD",
      });

      expect(metadata.other?.["product:price:currency"]).toBe("USD");
    });

    it("should include availability metadata", () => {
      const metadata = generateProductMetadata({
        ...productData,
        availability: "in stock",
      });

      expect(metadata.other?.["product:availability"]).toBe("in stock");
    });

    it("should include condition metadata", () => {
      const metadata = generateProductMetadata({
        ...productData,
        condition: "new",
      });

      expect(metadata.other?.["product:condition"]).toBe("new");
    });

    it("should support custom condition values", () => {
      const metadata = generateProductMetadata({
        ...productData,
        condition: "used",
      });

      expect(metadata.other?.["product:condition"]).toBe("used");
    });

    it("should include canonical URL if provided", () => {
      const canonical = "https://letitrip.in/products/beyblade-x";
      const metadata = generateProductMetadata({
        ...productData,
        canonical,
      });

      expect(metadata.alternates?.canonical).toBe(canonical);
      expect(metadata.openGraph?.url).toBe(canonical);
    });

    it("should handle missing canonical URL", () => {
      const metadata = generateProductMetadata(productData);

      expect(metadata.alternates).toBeUndefined();
    });
  });

  describe("generateBreadcrumbList", () => {
    it("should generate breadcrumb list schema", () => {
      const items = [
        { name: "Home", url: "/" },
        { name: "Products", url: "/products" },
        { name: "Beyblades", url: "/products/beyblades" },
      ];

      const breadcrumb = generateBreadcrumbList(items);

      expect(breadcrumb["@context"]).toBe("https://schema.org");
      expect(breadcrumb["@type"]).toBe("BreadcrumbList");
      expect(breadcrumb.itemListElement).toHaveLength(3);
    });

    it("should set correct positions", () => {
      const items = [
        { name: "Home", url: "/" },
        { name: "Products", url: "/products" },
      ];

      const breadcrumb = generateBreadcrumbList(items);

      expect(breadcrumb.itemListElement[0].position).toBe(1);
      expect(breadcrumb.itemListElement[1].position).toBe(2);
    });

    it("should include item names", () => {
      const items = [
        { name: "Home", url: "/" },
        { name: "Products", url: "/products" },
      ];

      const breadcrumb = generateBreadcrumbList(items);

      expect(breadcrumb.itemListElement[0].name).toBe("Home");
      expect(breadcrumb.itemListElement[1].name).toBe("Products");
    });

    it("should generate full URLs", () => {
      const items = [
        { name: "Home", url: "/" },
        { name: "Products", url: "/products" },
      ];

      const breadcrumb = generateBreadcrumbList(items);

      expect(breadcrumb.itemListElement[0].item).toBe(`${siteConfig.url}/`);
      expect(breadcrumb.itemListElement[1].item).toBe(
        `${siteConfig.url}/products`
      );
    });

    it("should handle empty array", () => {
      const breadcrumb = generateBreadcrumbList([]);

      expect(breadcrumb.itemListElement).toHaveLength(0);
    });

    it("should handle single item", () => {
      const items = [{ name: "Home", url: "/" }];

      const breadcrumb = generateBreadcrumbList(items);

      expect(breadcrumb.itemListElement).toHaveLength(1);
      expect(breadcrumb.itemListElement[0].position).toBe(1);
    });
  });

  describe("Edge Cases", () => {
    it("should handle very long titles", () => {
      const longTitle = "A".repeat(200);
      const metadata = generateMetadata({
        title: longTitle,
        description: "Test",
      });

      expect(metadata.title).toContain(longTitle);
    });

    it("should handle special characters in title", () => {
      const specialTitle = "Test & Test | Test < Test > Test";
      const metadata = generateMetadata({
        title: specialTitle,
        description: "Test",
      });

      expect(metadata.title).toContain(specialTitle);
    });

    it("should handle empty path", () => {
      const metadata = generateMetadata({
        title: "Test",
        description: "Test",
        path: "",
      });

      expect(metadata.alternates?.canonical).toBe(siteConfig.url);
    });

    it("should handle path without leading slash", () => {
      const metadata = generateMetadata({
        title: "Test",
        description: "Test",
        path: "products/test",
      });

      expect(metadata.alternates?.canonical).toBe(
        `${siteConfig.url}products/test`
      );
    });

    it("should handle zero price in product metadata", () => {
      const metadata = generateProductMetadata({
        title: "Free Product",
        description: "Test",
        image: "https://example.com/test.jpg",
        price: 0,
      });

      expect(metadata.other?.["product:price:amount"]).toBe("0");
    });

    it("should handle negative price (discount scenario)", () => {
      const metadata = generateProductMetadata({
        title: "Discounted Product",
        description: "Test",
        image: "https://example.com/test.jpg",
        price: -100,
      });

      expect(metadata.other?.["product:price:amount"]).toBe("-100");
    });
  });
});
