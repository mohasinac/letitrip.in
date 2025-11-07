# SEO Quick Reference Guide

Quick guide for using SEO utilities in the Let It Rip project.

---

## 📍 Files to Know

| File                       | Purpose                       |
| -------------------------- | ----------------------------- |
| `/src/app/sitemap.ts`      | Auto-generates sitemap.xml    |
| `/src/app/robots.ts`       | Auto-generates robots.txt     |
| `/src/lib/seo/metadata.ts` | Metadata utilities & defaults |
| `/src/lib/seo/schema.ts`   | Schema.org JSON-LD generators |
| `/public/manifest.json`    | PWA manifest                  |

---

## 🎯 Common Tasks

### Add Metadata to a New Page

```tsx
import { generateMetadata } from "@/lib/seo/metadata";

export const metadata = generateMetadata({
  title: "Page Title",
  description: "Page description for search results",
  keywords: ["keyword1", "keyword2"],
  path: "/your-page-path",
});

export default function YourPage() {
  return <div>Content</div>;
}
```

### Add Product Schema

```tsx
import { generateProductSchema, generateJSONLD } from "@/lib/seo/schema";

export default function ProductPage({ product }) {
  const productSchema = generateProductSchema({
    name: product.name,
    description: product.description,
    image: product.image,
    sku: product.sku,
    brand: product.brand,
    price: product.price,
    availability: product.stock > 0 ? "InStock" : "OutOfStock",
    url: `https://justforview.in/products/${product.slug}`,
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={generateJSONLD(productSchema)}
      />
      {/* Your product page content */}
    </>
  );
}
```

### Add FAQ Schema

```tsx
import { generateFAQSchema, generateJSONLD } from "@/lib/seo/schema";

const faqs = [
  { question: "What is...?", answer: "It is..." },
  { question: "How do I...?", answer: "You can..." },
];

export default function FAQPage() {
  const faqSchema = generateFAQSchema(faqs);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={generateJSONLD(faqSchema)}
      />
      {/* FAQ content */}
    </>
  );
}
```

### Add ItemList Schema (Category/Shop Pages)

```tsx
import { generateItemListSchema, generateJSONLD } from "@/lib/seo/schema";

export default function CategoryPage({ products }) {
  const itemListSchema = generateItemListSchema(
    products.map((p) => ({
      name: p.name,
      url: `https://justforview.in/products/${p.slug}`,
      image: p.image,
      price: p.price,
    }))
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={generateJSONLD(itemListSchema)}
      />
      {/* Product grid */}
    </>
  );
}
```

### Add Review Schema

```tsx
import { generateReviewSchema, generateJSONLD } from '@/lib/seo/schema'

const review = {
  productName: 'Product Name',
  reviewBody: 'This product is amazing!',
  rating: 5,
  authorName: 'John Doe',
  datePublished: '2025-01-15',
}

const reviewSchema = generateReviewSchema(review)

<script
  type="application/ld+json"
  dangerouslySetInnerHTML={generateJSONLD(reviewSchema)}
/>
```

---

## 🔧 Available Schemas

| Schema        | Function                          | Use Case                             |
| ------------- | --------------------------------- | ------------------------------------ |
| Organization  | `generateOrganizationSchema()`    | Root layout (already added)          |
| WebSite       | `generateWebSiteSchema()`         | Root layout (already added)          |
| Product       | `generateProductSchema({...})`    | Product detail pages                 |
| FAQ           | `generateFAQSchema([...])`        | FAQ pages                            |
| Breadcrumb    | `generateBreadcrumbSchema([...])` | Breadcrumb component (already added) |
| LocalBusiness | `generateLocalBusinessSchema()`   | About/Contact pages                  |
| ItemList      | `generateItemListSchema([...])`   | Category/Shop pages                  |
| Review        | `generateReviewSchema({...})`     | Review sections                      |
| Offer         | `generateOfferSchema({...})`      | Coupon/Sale pages                    |

---

## 🎨 Metadata Options

### Basic Page Metadata

```tsx
generateMetadata({
  title: "Page Title", // Required
  description: "Page description", // Required
  keywords: ["key1", "key2"], // Optional
  path: "/page-path", // For canonical URL
  image: "/custom-og-image.jpg", // Optional custom OG image
  noIndex: false, // Set true to prevent indexing
});
```

### Product Page Metadata

```tsx
generateProductMetadata({
  title: "Product Name",
  description: "Product description",
  price: 1999,
  currency: "INR",
  availability: "InStock", // 'InStock' | 'OutOfStock' | 'PreOrder'
  condition: "NewCondition", // 'NewCondition' | 'UsedCondition'
  image: "/product-image.jpg",
  path: "/products/product-slug",
});
```

---

## 📝 Sitemap Management

### Current Pages (Auto-included)

- Homepage
- FAQ
- Categories
- Shops
- Legal pages (5 pages)
- Auth pages (Login, Register)
- About Us

### Add Dynamic Pages

Edit `/src/app/sitemap.ts`:

```typescript
import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Fetch dynamic data
  const products = await fetchProducts()
  const categories = await fetchCategories()

  // Static pages (already there)
  const staticPages = [...]

  // Dynamic product pages
  const productPages = products.map(product => ({
    url: `https://justforview.in/products/${product.slug}`,
    lastModified: product.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // Dynamic category pages
  const categoryPages = categories.map(category => ({
    url: `https://justforview.in/categories/${category.slug}`,
    lastModified: category.updatedAt,
    changeFrequency: 'daily' as const,
    priority: 0.9,
  }))

  return [...staticPages, ...productPages, ...categoryPages]
}
```

---

## 🤖 Robots.txt

Located at `/src/app/robots.ts`. Already configured with:

✅ Allow public pages  
✅ Disallow private areas (/api, /user, /seller, /admin)  
✅ Block UTM and ref parameters  
✅ Crawl delays set  
✅ Sitemap reference

**To update:** Edit `/src/app/robots.ts`

---

## 📱 PWA Manifest

Located at `/public/manifest.json`. Already configured with:

✅ App name and description  
✅ Theme colors  
✅ Icons (need to create actual files)  
✅ Shortcuts to key pages  
✅ Screenshots (need to create actual files)

**Required Files to Create:**

- `/public/icon-192.png` (192x192)
- `/public/icon-512.png` (512x512)
- `/public/apple-touch-icon.png` (180x180)
- `/public/og-image.jpg` (1200x630)

---

## ✅ SEO Checklist for New Pages

When creating a new page:

- [ ] Add metadata using `generateMetadata()`
- [ ] Include canonical URL (automatic with generateMetadata)
- [ ] Add appropriate Schema.org markup
- [ ] Add to sitemap if it's a main page
- [ ] Test with [Rich Results Test](https://search.google.com/test/rich-results)
- [ ] Check mobile responsiveness
- [ ] Verify OpenGraph preview

---

## 🔍 Testing Tools

### Validation

- [Google Rich Results Test](https://search.google.com/test/rich-results) - Test Schema.org markup
- [Schema.org Validator](https://validator.schema.org/) - Validate JSON-LD
- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) - Test OG tags
- [Twitter Card Validator](https://cards-dev.twitter.com/validator) - Test Twitter cards

### Performance

- [Google PageSpeed Insights](https://pagespeed.web.dev/)
- [Lighthouse](https://developer.chrome.com/docs/lighthouse/) - Chrome DevTools
- [GTmetrix](https://gtmetrix.com/)

### SEO

- [Google Search Console](https://search.google.com/search-console)
- [Bing Webmaster Tools](https://www.bing.com/webmasters)

---

## 🎯 India-Focused Keywords

Use these in your metadata:

**Primary:**

- imported products India
- no customs charges India
- free customs clearance
- COD imported products
- fast delivery India

**Product-Specific:**

- Japan products India
- authentic Japanese products
- USA products India
- China products India
- UK products India

**Long-Tail:**

- buy imported products in India without customs
- COD on imported products India
- authentic Japan products fast delivery India

---

## 📊 Priority Guidelines

Use these priorities in sitemap:

| Page Type       | Priority | Change Frequency |
| --------------- | -------- | ---------------- |
| Homepage        | 1.0      | daily            |
| Main Categories | 0.9      | daily            |
| Product Pages   | 0.8      | weekly           |
| About/Contact   | 0.8      | monthly          |
| Legal Pages     | 0.5-0.7  | monthly          |
| Auth Pages      | 0.3      | yearly           |

---

## 🚀 Quick Commands

### Test Locally

```bash
# Build and start production server
npm run build
npm start

# Visit sitemap
http://localhost:3000/sitemap.xml

# Visit robots.txt
http://localhost:3000/robots.txt
```

### Validate Schemas

```bash
# View page source and look for:
<script type="application/ld+json">
```

Copy the JSON and test at:

- https://search.google.com/test/rich-results
- https://validator.schema.org/

---

## 💡 Pro Tips

1. **Always use canonical URLs** - Prevents duplicate content issues
2. **Update sitemap after major content changes** - Helps Google find new pages
3. **Use specific Schema.org types** - Product, FAQ, Review get rich snippets
4. **Include breadcrumbs** - Already implemented in Breadcrumb component
5. **Optimize images** - Use WebP, add alt text, lazy loading
6. **Mobile-first** - Google uses mobile version for indexing
7. **Page speed matters** - Core Web Vitals affect rankings
8. **Internal linking** - Link to related products/categories
9. **Update lastModified dates** - Shows freshness to search engines
10. **Monitor Search Console** - Fix indexing issues promptly

---

## 📚 Documentation

For detailed information, see:

- `/docs/SEO_IMPLEMENTATION.md` - Comprehensive SEO guide
- `/docs/IMPLEMENTATION_PROGRESS.md` - Overall progress tracking
- `/docs/BUSINESS_MODEL_UPDATE.md` - Business model changes

---

## 🆘 Common Issues

### Schema Not Showing in Search

- **Issue:** Schema added but not showing in rich results
- **Fix:** Use [Rich Results Test](https://search.google.com/test/rich-results) to validate. It can take weeks for Google to show rich results.

### Duplicate Canonical URLs

- **Issue:** Multiple pages with same canonical URL
- **Fix:** Ensure each page has unique `path` in `generateMetadata()`

### Sitemap Not Updating

- **Issue:** Changes not reflected in sitemap.xml
- **Fix:** Rebuild the app (`npm run build`). Dynamic content updates automatically.

### PWA Not Installing

- **Issue:** Install prompt not showing
- **Fix:** Check manifest.json is linked, create icon files, serve over HTTPS

---

**Last Updated:** November 7, 2025  
**Version:** 1.0
