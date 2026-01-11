# Performance Audit - Quick Reference

## Running Lighthouse Audits

### Prerequisites

```bash
# Ensure dev server is running
npm run dev
```

### Run Audit

```bash
# Run comprehensive audit on all pages
node scripts/development/run-lighthouse.js

# View report
code lighthouse-reports/lighthouse-report.md
```

## Pages Audited

1. **Home** (`/`) - Landing page
2. **Products** (`/products`) - Product listing
3. **Search** (`/search?q=laptop`) - Search results
4. **Product Details** (`/products/sample-product-id`) - Individual product
5. **Cart** (`/cart`) - Shopping cart
6. **Login** (`/auth/login`) - Authentication

## Metrics Reference

### Core Web Vitals

| Metric        | Good    | Needs Work    | Poor    | What It Measures    |
| ------------- | ------- | ------------- | ------- | ------------------- |
| **LCP**       | ≤ 2.5s  | 2.5s - 4.0s   | > 4.0s  | Loading performance |
| **FID (TBT)** | ≤ 200ms | 200ms - 600ms | > 600ms | Interactivity       |
| **CLS**       | ≤ 0.1   | 0.1 - 0.25    | > 0.25  | Visual stability    |

### Other Metrics

| Metric  | Good   | Needs Work  | Poor   |
| ------- | ------ | ----------- | ------ |
| **FCP** | ≤ 1.8s | 1.8s - 3.0s | > 3.0s |
| **SI**  | ≤ 3.4s | 3.4s - 5.8s | > 5.8s |
| **TTI** | ≤ 3.8s | 3.8s - 7.3s | > 7.3s |

## Lighthouse Scores

| Category       | Good   | Needs Work | Poor |
| -------------- | ------ | ---------- | ---- |
| Performance    | 90-100 | 50-89      | 0-49 |
| Accessibility  | 90-100 | 50-89      | 0-49 |
| Best Practices | 90-100 | 50-89      | 0-49 |
| SEO            | 90-100 | 50-89      | 0-49 |

## Quick Fixes

### Performance Issues

```typescript
// ❌ BAD: Import entire library
import _ from 'lodash';

// ✅ GOOD: Import only what you need
import debounce from 'lodash/debounce';

// ❌ BAD: No lazy loading
import HeavyComponent from './HeavyComponent';

// ✅ GOOD: Lazy load heavy components
const HeavyComponent = dynamic(() => import('./HeavyComponent'));

// ❌ BAD: Large image without optimization
<img src="/large-image.jpg" />

// ✅ GOOD: Next.js Image with optimization
<Image src="/large-image.jpg" width={800} height={600} alt="..." />
```

### Accessibility Issues

```tsx
// ❌ BAD: No alt text
<img src="/product.jpg" />

// ✅ GOOD: Descriptive alt text
<img src="/product.jpg" alt="Blue cotton t-shirt" />

// ❌ BAD: Missing label
<input type="text" placeholder="Email" />

// ✅ GOOD: Proper label association
<label htmlFor="email">Email</label>
<input id="email" type="text" placeholder="Enter your email" />

// ❌ BAD: No ARIA attributes
<div onClick={handleClick}>Click me</div>

// ✅ GOOD: Proper button with ARIA
<button type="button" aria-label="Submit form" onClick={handleClick}>
  Click me
</button>
```

### SEO Issues

```tsx
// ❌ BAD: Missing meta tags
export default function Page() {
  return <div>Content</div>;
}

// ✅ GOOD: Proper meta tags
import Head from "next/head";

export default function Page() {
  return (
    <>
      <Head>
        <title>Product Listing | Letitrip</title>
        <meta
          name="description"
          content="Browse our wide selection of products"
        />
        <meta property="og:title" content="Product Listing" />
        <meta property="og:description" content="Browse our wide selection" />
      </Head>
      <div>Content</div>
    </>
  );
}
```

## Output Files

### Markdown Report

```
lighthouse-reports/
  └── lighthouse-report.md          # Summary report with all pages
```

### JSON Reports

```
lighthouse-reports/
  ├── home-desktop.json             # Full Home page report
  ├── products-desktop.json         # Full Products page report
  ├── search-desktop.json           # Full Search page report
  ├── product-details-desktop.json  # Full Product Details report
  ├── cart-desktop.json             # Full Cart page report
  └── login-desktop.json            # Full Login page report
```

## Interpreting Results

### Performance Score Breakdown

- **FCP (10%)**: First paint on screen
- **SI (10%)**: Visual progression
- **LCP (25%)**: Largest content rendered
- **TBT (30%)**: Main thread blocking
- **CLS (25%)**: Layout stability

### Priority Actions

1. **Red scores (0-49)**: Critical - fix immediately
2. **Yellow scores (50-89)**: Important - plan fixes
3. **Green scores (90-100)**: Good - maintain

## Common Patterns

### Lazy Loading

```typescript
// For components
const Modal = dynamic(() => import("./Modal"), { ssr: false });

// For images
<Image src="..." loading="lazy" />;
```

### Code Splitting

```typescript
// Route-based
// pages/dashboard.tsx is automatically code-split

// Component-based
const Chart = dynamic(() => import("./Chart"));
```

### Preloading

```typescript
// In _document.tsx or component
<link
  rel="preload"
  href="/fonts/inter.woff2"
  as="font"
  type="font/woff2"
  crossOrigin
/>
```

## Next Steps

1. **Run audit**: `node scripts/development/run-lighthouse.js`
2. **Review report**: Check `lighthouse-reports/lighthouse-report.md`
3. **Fix critical issues**: Start with red scores
4. **Re-audit**: Verify improvements
5. **Document changes**: Update IMPLEMENTATION-TRACKER.md

## Resources

- Full guide: `NDocs/performance/LIGHTHOUSE-GUIDE.md`
- Web.dev: https://web.dev/vitals/
- Lighthouse docs: https://developers.google.com/web/tools/lighthouse
