# 🎯 SEO Quick Reference

**One-page cheat sheet for SEO implementation**

---

## 📦 Import Everything You Need

```typescript
// Main SEO component
import { generateSEOMetadata, StructuredData } from "@/components/seo/SEOHead";

// Structured data generators
import {
  generateProductStructuredData,
  generateBreadcrumbStructuredData,
  generateFAQSchema,
  generateWebsiteSchema,
  generateOrgSchema,
} from "@/components/seo";
```

---

## 🚀 Basic Page Setup (3 Steps)

### Step 1: Add Metadata Export

```typescript
export const metadata = generateSEOMetadata({
  title: "Your Page Title",
  description: "Your page description (150-160 chars)",
  keywords: ["keyword1", "keyword2", "keyword3"],
  canonical: "/your-page-path",
  ogImage: "/images/og-image.jpg",
});
```

### Step 2: (Optional) Add Structured Data

```typescript
const schema = generateProductStructuredData({
  name: "Product Name",
  price: 999,
  currency: "INR",
  // ... more fields
});
```

### Step 3: Render Structured Data

```typescript
return (
  <>
    <StructuredData data={schema} />
    {/* Your page content */}
  </>
);
```

---

## 📋 Common Page Types

### Homepage

```typescript
export const metadata = generateSEOMetadata({
  title: "HobbiesSpot - Premium Beyblade Store",
  description: "Shop authentic Beyblades, accessories, and collectibles",
  keywords: ["beyblade", "beyblade shop", "india"],
  canonical: "/",
  ogType: "website",
});
```

### Product Page

```typescript
export async function generateMetadata({ params }) {
  const product = await fetchProduct(params.slug);
  return generateSEOMetadata({
    title: `${product.name} - Buy Now`,
    description: product.description.substring(0, 160),
    canonical: `/products/${params.slug}`,
    ogImage: product.images[0],
  });
}
```

### Category Page

```typescript
export const metadata = generateSEOMetadata({
  title: `${category.name} Collection`,
  description: `Browse ${category.name} products`,
  canonical: `/categories/${category.slug}`,
});
```

---

## 🏗️ Structured Data Patterns

### Product

```typescript
generateProductStructuredData({
  name: product.name,
  description: product.description,
  image: product.images,
  price: product.price,
  currency: "INR",
  availability: product.stock > 0 ? "InStock" : "OutOfStock",
  rating: product.rating,
  reviewCount: product.reviewCount,
  url: `/products/${product.slug}`,
});
```

### Breadcrumb

```typescript
generateBreadcrumbStructuredData([
  { name: "Home", url: "/" },
  { name: "Category", url: "/category" },
  { name: "Product", url: "/product" },
]);
```

### FAQ

```typescript
generateFAQSchema([
  { question: "Question 1?", answer: "Answer 1" },
  { question: "Question 2?", answer: "Answer 2" },
]);
```

---

## ✅ SEO Checklist

- [ ] Title: 50-60 characters
- [ ] Description: 150-160 characters
- [ ] Keywords: 3-5 relevant keywords
- [ ] Canonical URL set
- [ ] OG Image: 1200x630px
- [ ] Structured data added
- [ ] No duplicate content
- [ ] Mobile-friendly
- [ ] Fast loading (<3s)
- [ ] HTTPS enabled

---

## 🧪 Testing URLs

- **Rich Results**: https://search.google.com/test/rich-results
- **Facebook**: https://developers.facebook.com/tools/debug/
- **Twitter**: https://cards-dev.twitter.com/validator
- **Schema**: https://validator.schema.org/

---

## 📊 Priority by Page Type

| Page Type  | Priority | Change Freq |
| ---------- | -------- | ----------- |
| Homepage   | 1.0      | daily       |
| Products   | 0.9      | daily       |
| Categories | 0.8      | weekly      |
| About      | 0.7      | monthly     |
| Help/FAQ   | 0.7      | monthly     |
| Legal      | 0.3      | yearly      |

---

## 🚨 Common Mistakes

❌ Missing metadata  
❌ Duplicate titles  
❌ Too long descriptions  
❌ Keyword stuffing  
❌ Wrong image sizes  
❌ Missing canonical  
❌ Broken structured data  
❌ Not testing

---

## 📞 Quick Help

See full documentation: `src/components/seo/README.md`  
See examples: `src/components/seo/examples.tsx`

---

**Last Updated**: October 31, 2025

