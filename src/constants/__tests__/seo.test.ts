/**
 * SEO Constants Tests — Phase 1
 *
 * Verifies that generateMetadata() produces correct Next.js Metadata
 * objects for all supported options.
 */

import { generateMetadata } from "../seo";

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
