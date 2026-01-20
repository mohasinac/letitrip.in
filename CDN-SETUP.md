# CDN Setup Guide

## Overview

This document provides instructions for setting up a Content Delivery Network (CDN) for static assets to improve performance and reduce server load.

## Recommended CDN Providers

### 1. **Vercel Edge Network** (Automatic)

If deploying to Vercel, CDN is automatically configured:

- **Static Assets**: Automatically cached at edge locations
- **Images**: Optimized and served via Vercel Image Optimization
- **Cache Headers**: Automatically set for optimal performance

**No configuration needed!**

### 2. **Cloudflare CDN** (Recommended for Self-Hosting)

#### Setup Steps:

1. **Sign up for Cloudflare** (free plan available)
2. **Add your domain** to Cloudflare
3. **Update DNS** records to point to Cloudflare nameservers
4. **Configure Cache Rules**:
   - Cache images: `*.jpg`, `*.png`, `*.webp`, `*.svg` - 30 days
   - Cache fonts: `*.woff`, `*.woff2`, `*.ttf` - 1 year
   - Cache CSS/JS: `*.css`, `*.js` - 7 days (with version hashing)
   - Cache static: `/public/*` - 30 days

#### Cloudflare Page Rules:

```
Pattern: *letitrip.in/public/*
Settings:
- Browser Cache TTL: 1 month
- Edge Cache TTL: 1 month
- Cache Level: Cache Everything
```

```
Pattern: *letitrip.in/_next/static/*
Settings:
- Browser Cache TTL: 1 year
- Edge Cache TTL: 1 year
- Cache Level: Cache Everything
```

### 3. **AWS CloudFront** (For AWS Deployments)

#### Setup Steps:

1. **Create S3 Bucket** for static assets
2. **Create CloudFront Distribution**
3. **Configure Origins**:
   - S3 bucket for static files
   - Next.js server for dynamic content
4. **Set Cache Behaviors**:

```json
{
  "PathPattern": "/public/*",
  "DefaultTTL": 2592000,
  "MaxTTL": 31536000,
  "MinTTL": 0,
  "Compress": true
}
```

```json
{
  "PathPattern": "/_next/static/*",
  "DefaultTTL": 31536000,
  "MaxTTL": 31536000,
  "MinTTL": 31536000,
  "Compress": true
}
```

### 4. **BunnyCDN** (Cost-Effective Alternative)

#### Setup Steps:

1. **Sign up for BunnyCDN**
2. **Create Pull Zone** pointing to your Next.js server
3. **Add hostname** (e.g., `cdn.letitrip.in`)
4. **Configure Cache Rules**:

```javascript
// next.config.js - Add CDN domain
module.exports = {
  images: {
    domains: ["cdn.letitrip.in"],
  },
  assetPrefix:
    process.env.NODE_ENV === "production" ? "https://cdn.letitrip.in" : "",
};
```

5. **Update `.env.production`**:

```bash
NEXT_PUBLIC_CDN_URL=https://cdn.letitrip.in
```

## Cache Headers Configuration

### In `next.config.js`:

```javascript
module.exports = {
  async headers() {
    return [
      // Cache static assets for 1 year
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      // Cache images for 30 days
      {
        source: "/public/:path*.{jpg,jpeg,png,webp,svg,ico}",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=2592000, must-revalidate",
          },
        ],
      },
      // Cache fonts for 1 year
      {
        source: "/public/fonts/:path*.{woff,woff2,ttf}",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};
```

## Environment-Specific CDN URLs

### In `.env.production`:

```bash
NEXT_PUBLIC_CDN_URL=https://cdn.letitrip.in
```

### In `.env.local` (development):

```bash
NEXT_PUBLIC_CDN_URL=http://localhost:3000
```

## Using CDN URLs in Code

### Utility Function:

```typescript
// src/lib/cdn.ts
export function getCDNUrl(path: string): string {
  const cdnUrl = process.env.NEXT_PUBLIC_CDN_URL || "";
  return `${cdnUrl}${path}`;
}
```

### Usage:

```tsx
import Image from "next/image";
import { getCDNUrl } from "@/lib/cdn";

export function ProductImage({ src }: { src: string }) {
  return <Image src={getCDNUrl(src)} alt="Product" width={500} height={500} />;
}
```

## Static Asset Organization

### Recommended Structure:

```
public/
├── images/
│   ├── products/          # Product images
│   ├── categories/        # Category images
│   ├── banners/           # Banner images
│   └── placeholder.png    # Fallback image
├── fonts/
│   ├── inter.woff2        # Font files
│   └── roboto.woff2
├── icons/
│   ├── favicon.ico
│   └── logo.svg
└── manifest.json
```

## Performance Optimization

### 1. Image Optimization

- **Next.js Image Component**: Automatic WebP conversion
- **Responsive Sizes**: Use `sizes` prop for responsive images
- **Priority Loading**: Add `priority` for above-the-fold images

```tsx
<Image
  src="/images/hero.jpg"
  alt="Hero"
  width={1920}
  height={1080}
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  priority
/>
```

### 2. Font Loading

- **Preload Critical Fonts**: Add `<link rel="preload">` in `_document.tsx`
- **Font Display Swap**: Use `font-display: swap` in CSS

```css
@font-face {
  font-family: "Inter";
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url("/fonts/inter.woff2") format("woff2");
}
```

### 3. Lazy Loading

- **LazyImage Component**: Use for below-the-fold images
- **LazyComponent**: Use for heavy components

```tsx
import { LazyImage } from "@/components/performance";

<LazyImage
  src="/images/product.jpg"
  alt="Product"
  width={500}
  height={500}
  blurDataURL="data:image/jpeg;base64,..."
/>;
```

## Monitoring & Analytics

### CDN Performance Metrics

- **Cache Hit Rate**: Target 95%+
- **Time to First Byte (TTFB)**: <100ms
- **Total Transfer Size**: <500KB initial load
- **Number of Requests**: <50 for initial page load

### Tools

- **Lighthouse**: Run `npm run lighthouse`
- **WebPageTest**: https://www.webpagetest.org/
- **Cloudflare Analytics**: Built-in CDN analytics
- **Vercel Analytics**: https://vercel.com/analytics

## Testing CDN Setup

### 1. Check Cache Headers:

```bash
curl -I https://letitrip.in/_next/static/chunks/main.js
```

Look for `Cache-Control` and `X-Cache-Status` headers.

### 2. Test Geographic Distribution:

```bash
# Test from different locations
curl -I https://letitrip.in/ -H "CF-IPCountry: US"
curl -I https://letitrip.in/ -H "CF-IPCountry: IN"
curl -I https://letitrip.in/ -H "CF-IPCountry: EU"
```

### 3. Measure Performance:

```bash
# Lighthouse CLI
npx lighthouse https://letitrip.in --view

# WebPageTest CLI
npx webpagetest https://letitrip.in --key YOUR_API_KEY
```

## Troubleshooting

### Issue: Images not loading from CDN

**Solution**: Check CORS headers in `next.config.js`:

```javascript
async headers() {
  return [
    {
      source: '/public/:path*',
      headers: [
        { key: 'Access-Control-Allow-Origin', value: '*' },
      ],
    },
  ];
}
```

### Issue: Stale content being served

**Solution**: Purge CDN cache:

```bash
# Cloudflare
curl -X POST "https://api.cloudflare.com/client/v4/zones/ZONE_ID/purge_cache" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{"purge_everything":true}'

# Vercel
vercel env pull
```

### Issue: High CDN costs

**Solution**: Optimize cache rules:

- Increase TTL for static assets (1 year for versioned files)
- Enable compression (Brotli/Gzip)
- Use WebP format for images
- Implement lazy loading for below-the-fold content

## Best Practices

1. **Version Static Assets**: Use content hashing (`main.abc123.js`)
2. **Set Long TTLs**: 1 year for immutable assets
3. **Enable Compression**: Gzip/Brotli for text files
4. **Use HTTP/2**: Enable HTTP/2 on your server/CDN
5. **Minimize Redirects**: Avoid unnecessary 301/302 redirects
6. **Implement Service Worker**: For offline support
7. **Monitor Cache Hit Rates**: Target 95%+ cache hit rate
8. **Optimize Images**: Use WebP, responsive sizes, lazy loading

## Next Steps

1. **Choose CDN Provider**: Vercel (automatic) or Cloudflare (recommended for self-hosting)
2. **Configure Cache Rules**: Set appropriate TTLs for different asset types
3. **Update Environment Variables**: Add `NEXT_PUBLIC_CDN_URL`
4. **Test Performance**: Run Lighthouse and WebPageTest
5. **Monitor Metrics**: Track cache hit rate, TTFB, and bundle size
6. **Iterate**: Continuously optimize based on real-world data

## Resources

- [Next.js CDN Caching](https://nextjs.org/docs/going-to-production#caching)
- [Cloudflare CDN Setup](https://developers.cloudflare.com/cache/)
- [Vercel Edge Network](https://vercel.com/docs/concepts/edge-network/overview)
- [Image Optimization Best Practices](https://web.dev/fast/#optimize-your-images)
- [Font Loading Best Practices](https://web.dev/font-best-practices/)
