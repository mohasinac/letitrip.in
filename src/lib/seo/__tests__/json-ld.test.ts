/**
 * JSON-LD Helper Tests — Phase 15 SEO
 *
 * Verifies structured data output from lib/seo/json-ld.ts helpers.
 */

import {
  productJsonLd,
  reviewJsonLd,
  aggregateRatingJsonLd,
  breadcrumbJsonLd,
  faqJsonLd,
  blogPostJsonLd,
  organizationJsonLd,
} from "../json-ld";

describe("productJsonLd()", () => {
  const product = {
    id: "prod-1",
    title: "Leather Wallet",
    description: "Genuine leather bifold wallet.",
    price: 499,
    currency: "INR",
    images: ["https://cdn.example.com/wallet.jpg"],
    slug: "leather-wallet",
    status: "published",
  };

  it("outputs @type Product", () => {
    const ld = productJsonLd(product);
    expect(ld["@type"]).toBe("Product");
  });

  it("sets name from title", () => {
    const ld = productJsonLd(product);
    expect(ld.name).toBe("Leather Wallet");
  });

  it("sets offers price", () => {
    const ld = productJsonLd(product);
    const offers = ld.offers as Record<string, unknown>;
    expect(offers.price).toBe(499);
    expect(offers.priceCurrency).toBe("INR");
  });

  it("includes InStock availability for published status", () => {
    const ld = productJsonLd(product);
    const offers = ld.offers as Record<string, unknown>;
    expect(offers.availability).toContain("InStock");
  });

  it("includes OutOfStock availability when status is out_of_stock", () => {
    const ld = productJsonLd({ ...product, status: "out_of_stock" });
    const offers = ld.offers as Record<string, unknown>;
    expect(offers.availability).toContain("OutOfStock");
  });
});

describe("breadcrumbJsonLd()", () => {
  const items = [
    { name: "Home", url: "https://letitrip.in" },
    { name: "Products", url: "https://letitrip.in/products" },
    { name: "Wallet", url: "https://letitrip.in/products/leather-wallet" },
  ];

  it("outputs @type BreadcrumbList", () => {
    const ld = breadcrumbJsonLd(items);
    expect(ld["@type"]).toBe("BreadcrumbList");
  });

  it("creates one ListItem per entry", () => {
    const ld = breadcrumbJsonLd(items);
    const list = ld.itemListElement as unknown[];
    expect(list).toHaveLength(3);
  });

  it("assigns position starting at 1", () => {
    const ld = breadcrumbJsonLd(items);
    const first = (ld.itemListElement as Record<string, unknown>[])[0];
    expect(first.position).toBe(1);
  });
});

describe("faqJsonLd()", () => {
  const faqs = [
    { question: "How do I return an item?", answer: "Use the returns portal." },
    { question: "How long is shipping?", answer: "3-5 business days." },
  ];

  it("outputs @type FAQPage", () => {
    const ld = faqJsonLd(faqs);
    expect(ld["@type"]).toBe("FAQPage");
  });

  it("creates mainEntity with one entry per FAQ", () => {
    const ld = faqJsonLd(faqs);
    const entities = ld.mainEntity as unknown[];
    expect(entities).toHaveLength(2);
  });
});

describe("reviewJsonLd()", () => {
  const review = {
    id: "rev-1",
    authorName: "Alice",
    rating: 5,
    comment: "Great product!",
    createdAt: new Date("2024-03-01"),
  };

  it("outputs @type Review", () => {
    const ld = reviewJsonLd(review);
    expect(ld["@type"]).toBe("Review");
  });

  it("sets ratingValue", () => {
    const ld = reviewJsonLd(review);
    const rv = ld.reviewRating as Record<string, unknown>;
    expect(rv.ratingValue).toBe(5);
  });
});

describe("aggregateRatingJsonLd()", () => {
  it("outputs @type Product with aggregateRating", () => {
    const ld = aggregateRatingJsonLd(
      { title: "Shoes", slug: "shoes-123" },
      { average: 4.5, count: 120 },
    );
    expect(ld["@type"]).toBe("Product");
    expect((ld.aggregateRating as Record<string, unknown>)["@type"]).toBe(
      "AggregateRating",
    );
  });

  it("sets ratingValue and reviewCount", () => {
    const ld = aggregateRatingJsonLd(
      { title: "Shoes", slug: "shoes-123" },
      { average: 4.5, count: 120 },
    );
    const ar = ld.aggregateRating as Record<string, unknown>;
    expect(ar.ratingValue).toBe(4.5);
    expect(ar.reviewCount).toBe(120);
  });
});

describe("blogPostJsonLd()", () => {
  const post = {
    title: "Shopping Tips 2024",
    slug: "shopping-tips-2024",
    excerpt: "Best shopping tips.",
    publishedAt: new Date("2024-05-01"),
    updatedAt: new Date("2024-06-01"),
    authorName: "Bob",
  };

  it("outputs @type BlogPosting", () => {
    const ld = blogPostJsonLd(post);
    expect(ld["@type"]).toBe("BlogPosting");
  });

  it("includes author name", () => {
    const ld = blogPostJsonLd(post);
    const author = ld.author as Record<string, unknown>;
    expect(author.name).toBe("Bob");
  });
});

describe("organizationJsonLd()", () => {
  it("outputs @type Organization", () => {
    const ld = organizationJsonLd();
    expect(ld["@type"]).toBe("Organization");
  });

  it("includes sameAs array", () => {
    const ld = organizationJsonLd();
    expect(Array.isArray(ld.sameAs)).toBe(true);
  });
});
