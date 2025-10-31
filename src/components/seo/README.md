# 🎯 SEO Setup Guide for hobbiesspot.com

**Complete guide to implementing SEO across your Next.js application**

---

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [File Structure](#file-structure)
3. [Basic Usage](#basic-usage)
4. [Advanced Examples](#advanced-examples)
5. [Best Practices](#best-practices)
6. [Testing & Validation](#testing--validation)

---

## 🚀 Quick Start

### 1. Import SEO Components

```typescript
import { generateSEOMetadata, StructuredData } from "@/components/seo/SEOHead";
import { generateProductStructuredData } from "@/components/seo";
```

### 2. Add Metadata to Any Page

```typescript
// app/page.tsx
export const metadata = generateSEOMetadata({
  title: "Homepage Title",
  description: "Homepage description for search results",
  keywords: ["beyblade", "shop", "india"],
  canonical: "/",
  ogImage: "/og-image.jpg",
});
```

### 3. Add Structured Data

```typescript
// In your component
export default function ProductPage({ product }) {
  const productSchema = generateProductStructuredData({
    name: product.name,
    price: product.price,
    // ... more fields
  });

  return (
    <>
      <StructuredData data={productSchema} />
      {/* Your page content */}
    </>
  );
}
```

---

## 📁 File Structure

```
src/
├── components/
│   └── seo/
│       ├── SEOHead.tsx          # Main SEO component
│       ├── index.ts             # Export all SEO utilities
│       ├── examples.tsx         # Usage examples
│       └── README.md            # This file
├── lib/
│   └── seo/
│       ├── metadata.ts          # Metadata utilities
│       ├── structured-data.ts   # Schema.org generators
│       └── index.ts             # SEO lib exports
└── app/
    ├── sitemap.ts               # Dynamic sitemap
    └── robots.ts                # Robots.txt
```

---

## 💡 Basic Usage

### Homepage

```typescript
// app/page.tsx
import { generateSEOMetadata } from "@/components/seo/SEOHead";
import { GlobalSEOSchema } from "@/components/seo/examples";

export const metadata = generateSEOMetadata({
  title: "HobbiesSpot - Premium Beyblade Store",
  description:
    "Your premium destination for authentic Beyblades, collectibles, and accessories",
  keywords: ["beyblade", "beyblade shop", "buy beyblade india"],
  canonical: "/",
  ogImage: "/assets/og-image.jpg",
  ogType: "website",
});

export default function HomePage() {
  return (
    <>
      <GlobalSEOSchema />
      {/* Your homepage content */}
    </>
  );
}
```

### Product Page

```typescript
// app/products/[slug]/page.tsx
import { generateSEOMetadata, StructuredData } from "@/components/seo/SEOHead";
import {
  generateProductStructuredData,
  generateBreadcrumbStructuredData,
} from "@/components/seo";

export async function generateMetadata({ params }) {
  const product = await fetchProduct(params.slug);

  return generateSEOMetadata({
    title: `${product.name} - Buy Now`,
    description: product.description.substring(0, 160),
    keywords: [product.name, product.category, "beyblade"],
    canonical: `/products/${params.slug}`,
    ogImage: product.images[0],
  });
}

export default async function ProductPage({ params }) {
  const product = await fetchProduct(params.slug);

  const schemas = [
    generateProductStructuredData({
      name: product.name,
      description: product.description,
      image: product.images,
      price: product.price,
      currency: "INR",
      availability: product.stock > 0 ? "InStock" : "OutOfStock",
      rating: product.rating,
      reviewCount: product.reviewCount,
      url: `/products/${params.slug}`,
    }),
    generateBreadcrumbStructuredData([
      { name: "Home", url: "/" },
      { name: product.category, url: `/categories/${product.categorySlug}` },
      { name: product.name, url: `/products/${params.slug}` },
    ]),
  ];

  return (
    <>
      <StructuredData data={schemas} />
      {/* Your product page content */}
    </>
  );
}
```

### Category Page

```typescript
// app/categories/[slug]/page.tsx
export async function generateMetadata({ params }) {
  const category = await fetchCategory(params.slug);

  return generateSEOMetadata({
    title: `${category.name} - Shop Collection`,
    description: category.description,
    keywords: [category.name, "beyblade", "shop"],
    canonical: `/categories/${params.slug}`,
    ogImage: category.image,
  });
}
```

### FAQ Page

```typescript
// app/faq/page.tsx
import { generateFAQSchema } from "@/components/seo";

export const metadata = generateSEOMetadata({
  title: "Frequently Asked Questions",
  description:
    "Find answers to common questions about Beyblades, shipping, and returns",
  canonical: "/faq",
});

export default function FAQPage({ faqs }) {
  const faqSchema = generateFAQSchema(
    faqs.map((faq) => ({
      question: faq.question,
      answer: faq.answer,
    }))
  );

  return (
    <>
      <StructuredData data={faqSchema} />
      {/* Your FAQ content */}
    </>
  );
}
```

---

## 🎨 Advanced Examples

### Dynamic OG Images

```typescript
// app/products/[slug]/opengraph-image.tsx
import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};

export default async function Image({ params }: { params: { slug: string } }) {
  const product = await fetchProduct(params.slug);

  return new ImageResponse(
    (
      <div
        style={
          {
            /* your OG image design */
          }
        }
      >
        <h1>{product.name}</h1>
        <p>₹{product.price}</p>
      </div>
    ),
    { ...size }
  );
}
```

### Multiple Structured Data

```typescript
const schemas = [
  generateProductStructuredData({...}),
  generateBreadcrumbStructuredData([...]),
  generateReviewSchema({...}),
  generateOfferSchema({...}),
];

<StructuredData data={schemas} />
```

### Conditional SEO

```typescript
export const metadata = generateSEOMetadata({
  title: product.name,
  description: product.description,
  noindex: !product.isPublished, // Don't index drafts
});
```

---

## ✅ Best Practices

### 1. **Title Optimization**

- Keep titles under 60 characters
- Include primary keyword
- Make it compelling
- Don't keyword stuff

```typescript
// ✅ Good
title: "Storm Pegasus Beyblade - Buy Online | HobbiesSpot";

// ❌ Bad
title: "beyblade storm pegasus beyblade burst beyblade buy beyblade shop";
```

### 2. **Description Optimization**

- Keep between 150-160 characters
- Include call-to-action
- Be unique for each page
- Include keywords naturally

```typescript
// ✅ Good
description: "Buy authentic Storm Pegasus Beyblade with free shipping. In stock now. Order today for guaranteed next-day delivery.";

// ❌ Bad
description: "beyblade beyblade beyblade storm pegasus beyblade";
```

### 3. **Keywords**

- 3-5 relevant keywords
- Include long-tail keywords
- Natural language

```typescript
keywords: [
  "storm pegasus beyblade",
  "buy beyblade online",
  "beyblade burst india",
];
```

### 4. **Images**

- OG images: 1200x630px
- Twitter images: 1200x675px
- Use absolute URLs
- Add alt text

```typescript
ogImage: "https://hobbiesspot.com/images/products/storm-pegasus-og.jpg";
```

### 5. **Canonical URLs**

- Always use canonical tags
- Use absolute URLs
- Point to primary version

```typescript
canonical: "https://hobbiesspot.com/products/storm-pegasus";
```

---

## 🧪 Testing & Validation

### 1. **Google Rich Results Test**

- URL: https://search.google.com/test/rich-results
- Test structured data
- Fix any errors

### 2. **Facebook Sharing Debugger**

- URL: https://developers.facebook.com/tools/debug/
- Test OpenGraph tags
- Clear cache if needed

### 3. **Twitter Card Validator**

- URL: https://cards-dev.twitter.com/validator
- Test Twitter cards
- Preview how it looks

### 4. **Schema Markup Validator**

- URL: https://validator.schema.org/
- Validate JSON-LD
- Check for warnings

### 5. **Lighthouse SEO Audit**

```bash
npm run perf:lighthouse
```

---

## 📊 Available Schema Types

| Schema Type    | Function                             | Use Case       |
| -------------- | ------------------------------------ | -------------- |
| Website        | `generateWebsiteSchema()`            | Homepage       |
| Organization   | `generateOrgSchema()`                | About/Contact  |
| Product        | `generateProductStructuredData()`    | Product pages  |
| Breadcrumb     | `generateBreadcrumbStructuredData()` | All pages      |
| FAQ            | `generateFAQSchema()`                | FAQ page       |
| Review         | `generateReviewSchema()`             | Review pages   |
| Collection     | `generateCollectionPageSchema()`     | Category pages |
| Local Business | `generateLocalBusinessSchema()`      | Store locator  |
| Video          | `generateVideoSchema()`              | Video content  |
| Offer          | `generateOfferSchema()`              | Special offers |

---

## 🚨 Common Mistakes to Avoid

1. ❌ Missing metadata on pages
2. ❌ Duplicate titles/descriptions
3. ❌ Keywords stuffing
4. ❌ Missing canonical tags
5. ❌ Broken structured data
6. ❌ Wrong image dimensions
7. ❌ Not testing before deploy
8. ❌ Indexing development pages

---

## 🔄 Migration Checklist

- [ ] Add metadata to all pages
- [ ] Add structured data where applicable
- [ ] Test with Google Rich Results
- [ ] Submit sitemap to Google Search Console
- [ ] Monitor for errors in Search Console
- [ ] Set up Google Analytics
- [ ] Add robots.txt rules
- [ ] Create 404 page with SEO
- [ ] Add canonical tags site-wide
- [ ] Test social media sharing

---

## 📚 Resources

- [Next.js Metadata Docs](https://nextjs.org/docs/app/building-your-application/optimizing/metadata)
- [Schema.org Documentation](https://schema.org/)
- [Google Search Central](https://developers.google.com/search)
- [OpenGraph Protocol](https://ogp.me/)
- [Twitter Cards Guide](https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards)

---

## 🆘 Need Help?

Check `src/components/seo/examples.tsx` for complete implementation examples.

---

**Last Updated**: October 31, 2025
**Maintained By**: HobbiesSpot Development Team

