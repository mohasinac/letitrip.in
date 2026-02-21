/**
 * SEO Constants Tests — Phase 1
 *
 * Verifies that generateMetadata() produces correct Next.js Metadata
 * objects for all supported options.
 */

import {
  generateMetadata,
  generateProductMetadata,
  generateCategoryMetadata,
  generateBlogMetadata,
  generateAuctionMetadata,
  generateSearchMetadata,
} from "../seo";

describe("generateMetadata()", () => {
  it("sets title, description, openGraph, twitter, and canonical", () => {
    const meta = generateMetadata({
      title: "Test Page",
      description: "Test description",
      path: "/test",
    });

    expect(meta.title).toContain("Test Page");
    expect(meta.description).toBe("Test description");
    expect((meta.openGraph as { title: string }).title).toContain("Test Page");
    expect((meta.openGraph as { description: string }).description).toBe(
      "Test description",
    );
    expect((meta.twitter as { title: string }).title).toContain("Test Page");
    expect((meta.twitter as { description: string }).description).toBe(
      "Test description",
    );
    expect((meta.alternates as { canonical: string }).canonical).toContain(
      "/test",
    );
  });

  it("appends site name to title when not already included", () => {
    const meta = generateMetadata({ title: "Products" });
    expect(meta.title as string).toContain("LetItRip");
  });

  it("does not duplicate site name when title already contains it", () => {
    const meta = generateMetadata({ title: "LetItRip - Home" });
    expect((meta.title as string).split("LetItRip").length - 1).toBe(1);
  });

  it("sets robots to noIndex when noIndex: true", () => {
    const meta = generateMetadata({ noIndex: true });
    expect(meta.robots).toEqual({ index: false, follow: false });
  });

  it("does not set robots when noIndex: false (default)", () => {
    const meta = generateMetadata({});
    expect(meta.robots).toBeUndefined();
  });

  it("uses default description when none provided", () => {
    const meta = generateMetadata({});
    expect(typeof meta.description).toBe("string");
    expect((meta.description as string).length).toBeGreaterThan(0);
  });

  it("sets openGraph type to article when specified", () => {
    const meta = generateMetadata({ type: "article" });
    expect((meta.openGraph as { type: string }).type).toBe("article");
  });

  it("includes canonical URL with base siteUrl + path", () => {
    const meta = generateMetadata({ path: "/products/test" });
    expect((meta.alternates as { canonical: string }).canonical).toMatch(
      /\/products\/test$/,
    );
  });

  it("resolves relative image to absolute URL", () => {
    const meta = generateMetadata({ image: "/og-image.jpg" });
    const images = (meta.openGraph as { images: { url: string }[] }).images;
    expect(images[0].url).toMatch(/^https?:\/\//);
  });

  it("keeps absolute image URL as-is", () => {
    const absUrl = "https://cdn.example.com/img.jpg";
    const meta = generateMetadata({ image: absUrl });
    const images = (meta.openGraph as { images: { url: string }[] }).images;
    expect(images[0].url).toBe(absUrl);
  });

  it("includes twitter card type summary_large_image", () => {
    const meta = generateMetadata({});
    expect((meta.twitter as { card: string }).card).toBe("summary_large_image");
  });
});

describe("generateProductMetadata()", () => {
  const base = {
    title: "Running Shoes",
    description: "Lightweight running shoes for all terrains.",
    keywords: ["shoes", "running"],
    slug: "running-shoes-123",
    price: 1999,
    currency: "INR",
    inStock: true,
  };

  it("includes product title in metadata title", () => {
    const meta = generateProductMetadata(base);
    expect(meta.title as string).toContain("Running Shoes");
  });

  it("sets canonical URL to /products/<slug>", () => {
    const meta = generateProductMetadata(base);
    expect((meta.alternates as { canonical: string }).canonical).toMatch(
      /\/products\/running-shoes-123$/,
    );
  });

  it("sets openGraph type to product", () => {
    const meta = generateProductMetadata(base);
    expect((meta.openGraph as Record<string, unknown>).type).toBe("website");
  });

  it("sets description from input", () => {
    const meta = generateProductMetadata(base);
    expect(meta.description).toBe(base.description);
  });
});

describe("generateCategoryMetadata()", () => {
  const cat = {
    name: "Electronics",
    slug: "electronics",
    description: "All electronic products",
    seoTitle: "Electronics - LetItRip",
    seoDescription: "Shop electronics online",
    seoKeywords: ["electronics", "gadgets"],
  };

  it("uses seoTitle when provided", () => {
    const meta = generateCategoryMetadata(cat);
    expect(meta.title as string).toContain("Electronics - LetItRip");
  });

  it("falls back to name when seoTitle not provided", () => {
    const meta = generateCategoryMetadata({
      name: "Books",
      slug: "books",
      description: "Books",
    });
    expect(meta.title as string).toContain("Books");
  });

  it("sets canonical to /categories/<slug>", () => {
    const meta = generateCategoryMetadata(cat);
    expect((meta.alternates as { canonical: string }).canonical).toMatch(
      /\/categories\/electronics$/,
    );
  });
});

describe("generateBlogMetadata()", () => {
  const post = {
    title: "Top 10 Tips",
    slug: "top-10-tips",
    excerpt: "Ten essential tips for online shoppers.",
    publishedAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-02-01"),
    authorName: "Jane Doe",
  };

  it("includes post title", () => {
    const meta = generateBlogMetadata(post);
    expect(meta.title as string).toContain("Top 10 Tips");
  });

  it("sets canonical to /blog/<slug>", () => {
    const meta = generateBlogMetadata(post);
    expect((meta.alternates as { canonical: string }).canonical).toMatch(
      /\/blog\/top-10-tips$/,
    );
  });

  it("sets openGraph type to article", () => {
    const meta = generateBlogMetadata(post);
    expect((meta.openGraph as { type: string }).type).toBe("article");
  });
});

describe("generateAuctionMetadata()", () => {
  const auction = {
    title: "Vintage Watch",
    slug: "vintage-watch-abc",
    description: "Rare vintage watch from 1950.",
    mainImage: "https://cdn.example.com/watch.jpg",
  };

  it("prefixes title with Auction:", () => {
    const meta = generateAuctionMetadata(auction);
    expect(meta.title as string).toMatch(/Auction:/);
  });

  it("sets canonical to /auctions/<slug>", () => {
    const meta = generateAuctionMetadata(auction);
    expect((meta.alternates as { canonical: string }).canonical).toMatch(
      /\/auctions\/vintage-watch-abc$/,
    );
  });
});

describe("generateSearchMetadata()", () => {
  it("includes query in title", () => {
    const meta = generateSearchMetadata("shoes");
    expect(meta.title as string).toContain("shoes");
  });

  it("sets noIndex", () => {
    const meta = generateSearchMetadata("anything");
    expect(meta.robots).toEqual({ index: false, follow: false });
  });

  it("handles empty query gracefully", () => {
    const meta = generateSearchMetadata("");
    expect(meta.title).toBeTruthy();
  });
});
