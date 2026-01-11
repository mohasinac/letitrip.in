# Performance Audit Documentation

This document describes how to run performance audits using Lighthouse and interpret the results.

## Overview

We use [Lighthouse](https://developers.google.com/web/tools/lighthouse) to audit the performance, accessibility, best practices, and SEO of our application. Lighthouse is an automated tool built into Chrome DevTools that provides actionable recommendations.

## Quick Start

### Prerequisites

1. **Dev server running**: `npm run dev` on `http://localhost:3000`
2. **Lighthouse installed**: `npm install --save-dev lighthouse` (already installed)

### Running Audits

```bash
# Run Lighthouse audit script
node scripts/development/run-lighthouse.js
```

This will:

- Audit 6 key pages (Home, Products, Search, Product Details, Cart, Login)
- Run desktop audits with realistic network throttling
- Generate JSON reports for each page
- Create a comprehensive markdown summary report
- Save all reports to `lighthouse-reports/` directory

### Output

After running, check:

- `lighthouse-reports/lighthouse-report.md` - Summary report with all pages
- `lighthouse-reports/[page]-desktop.json` - Full Lighthouse report for each page

## Core Web Vitals

Lighthouse measures [Core Web Vitals](https://web.dev/vitals/), Google's key metrics for user experience:

### 1. Largest Contentful Paint (LCP)

**What it measures**: Loading performance - when the largest content element becomes visible.

**Thresholds**:

- 🟢 Good: ≤ 2.5s
- 🟡 Needs Improvement: 2.5s - 4.0s
- 🔴 Poor: > 4.0s

**How to improve**:

- Optimize server response times
- Use CDN for static assets
- Preload critical resources (images, fonts)
- Remove render-blocking resources
- Optimize and compress images (WebP format)
- Implement lazy loading for below-the-fold content

### 2. First Input Delay (FID) / Total Blocking Time (TBT)

**What it measures**: Interactivity - how quickly the page responds to user interaction.

**Thresholds (TBT)**:

- 🟢 Good: ≤ 200ms
- 🟡 Needs Improvement: 200ms - 600ms
- 🔴 Poor: > 600ms

**How to improve**:

- Reduce JavaScript execution time
- Code split to avoid loading unused code
- Break up long tasks (>50ms)
- Use web workers for heavy computations
- Defer non-critical JavaScript
- Remove unused code and dependencies

### 3. Cumulative Layout Shift (CLS)

**What it measures**: Visual stability - how much the page layout shifts unexpectedly.

**Thresholds**:

- 🟢 Good: ≤ 0.1
- 🟡 Needs Improvement: 0.1 - 0.25
- 🔴 Poor: > 0.25

**How to improve**:

- Add width/height attributes to images and videos
- Reserve space for ads and embeds
- Avoid inserting content above existing content
- Use CSS transforms for animations (not layout properties)
- Preload fonts to avoid font swap layout shift

## Other Key Metrics

### First Contentful Paint (FCP)

**What it measures**: When the first content renders on screen.

**Thresholds**:

- 🟢 Good: ≤ 1.8s
- 🟡 Needs Improvement: 1.8s - 3.0s
- 🔴 Poor: > 3.0s

### Speed Index (SI)

**What it measures**: How quickly content is visually displayed.

**Thresholds**:

- 🟢 Good: ≤ 3.4s
- 🟡 Needs Improvement: 3.4s - 5.8s
- 🔴 Poor: > 5.8s

### Time to Interactive (TTI)

**What it measures**: When the page becomes fully interactive.

**Thresholds**:

- 🟢 Good: ≤ 3.8s
- 🟡 Needs Improvement: 3.8s - 7.3s
- 🔴 Poor: > 7.3s

## Lighthouse Scores

Lighthouse provides scores in 4 categories (0-100):

### Performance (0-100)

Measures loading performance and runtime performance.

**Weighted Metrics**:

- First Contentful Paint: 10%
- Speed Index: 10%
- Largest Contentful Paint: 25%
- Total Blocking Time: 30%
- Cumulative Layout Shift: 25%

**Score Ranges**:

- 🟢 90-100: Good
- 🟡 50-89: Needs Improvement
- 🔴 0-49: Poor

### Accessibility (0-100)

Checks for common accessibility issues.

**Key Audits**:

- ARIA attributes
- Color contrast
- Form labels
- Alt text for images
- Keyboard navigation
- Screen reader compatibility

### Best Practices (0-100)

Checks for modern web development best practices.

**Key Audits**:

- HTTPS usage
- Console errors
- Deprecated APIs
- Image aspect ratios
- Browser compatibility
- Security headers

### SEO (0-100)

Checks for search engine optimization basics.

**Key Audits**:

- Meta descriptions
- Valid robots.txt
- Crawlable links
- Mobile-friendly viewport
- Descriptive link text
- Structured data

## Common Performance Issues & Fixes

### 1. Large Bundle Size

**Issue**: JavaScript bundle too large (> 300KB)

**Fixes**:

- ✅ Code splitting with dynamic imports
- ✅ Tree shaking to remove unused code
- ✅ Lazy load routes and heavy components
- ✅ Remove unused dependencies
- ✅ Use lighter alternatives (e.g., date-fns instead of moment)

### 2. Unoptimized Images

**Issue**: Images not optimized or too large

**Fixes**:

- ✅ Use Next.js Image component (automatic optimization)
- ✅ Convert to WebP format
- ✅ Implement responsive images (srcset)
- ✅ Lazy load images below the fold
- ✅ Use appropriate image dimensions

### 3. Render-Blocking Resources

**Issue**: CSS/JS blocks initial render

**Fixes**:

- ✅ Inline critical CSS
- ✅ Defer non-critical CSS
- ✅ Async/defer non-critical JavaScript
- ✅ Preload critical resources

### 4. Slow Server Response

**Issue**: TTFB (Time to First Byte) > 600ms

**Fixes**:

- ✅ Implement caching (Redis, CDN)
- ✅ Optimize database queries
- ✅ Use static generation (SSG) where possible
- ✅ Implement incremental static regeneration (ISR)
- ✅ Optimize API endpoints

### 5. Third-Party Scripts

**Issue**: External scripts slow down page load

**Fixes**:

- ✅ Load third-party scripts asynchronously
- ✅ Use facade patterns for heavy embeds (YouTube, maps)
- ✅ Self-host critical third-party resources
- ✅ Remove unused analytics/tracking scripts

## Monitoring in Production

### Real User Monitoring (RUM)

Use tools to monitor real user experience:

- Google Analytics 4 (Web Vitals)
- Vercel Analytics
- Sentry Performance Monitoring
- New Relic Browser

### Performance Budgets

Set performance budgets and fail builds if exceeded:

```json
{
  "budgets": [
    {
      "path": "/_next/**",
      "maxSize": "300kb"
    },
    {
      "path": "/static/**",
      "maxSize": "500kb"
    }
  ]
}
```

### CI/CD Integration

Run Lighthouse in CI/CD pipeline:

```yaml
# .github/workflows/performance.yml
name: Performance Audit
on: [pull_request]
jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build
      - run: npm start & npx wait-on http://localhost:3000
      - run: node scripts/development/run-lighthouse.js
      - uses: actions/upload-artifact@v3
        with:
          name: lighthouse-reports
          path: lighthouse-reports/
```

## Best Practices

### 1. Run Audits Regularly

- Before every deployment
- Weekly for main pages
- After major feature additions
- When dependencies are updated

### 2. Test on Real Devices

- Lighthouse uses simulated throttling
- Test on actual mobile devices
- Use Chrome DevTools device emulation
- Test on slow networks (3G, Slow 4G)

### 3. Prioritize Fixes

Focus on:

1. Core Web Vitals (LCP, FID, CLS)
2. Critical user paths (checkout, product pages)
3. High-impact, low-effort improvements
4. Mobile performance (majority of traffic)

### 4. Compare Over Time

- Track trends, not absolute scores
- Compare before/after changes
- Set targets and measure progress
- Document performance improvements

## Resources

- [Web.dev Performance](https://web.dev/performance/)
- [Core Web Vitals](https://web.dev/vitals/)
- [Lighthouse Documentation](https://developers.google.com/web/tools/lighthouse)
- [Next.js Performance](https://nextjs.org/docs/advanced-features/measuring-performance)
- [Chrome DevTools](https://developer.chrome.com/docs/devtools/)

## Troubleshooting

### Lighthouse fails to run

**Error**: Chrome launcher fails

**Fix**:

```bash
# Install Chrome dependencies (Linux)
sudo apt-get install -y libgconf-2-4 libatk1.0-0 libatk-bridge2.0-0 libgdk-pixbuf2.0-0 libgtk-3-0 libgbm-dev libnss3-dev

# Or use system Chrome
export CHROME_PATH=/path/to/chrome
```

### Inconsistent scores

**Issue**: Scores vary between runs

**Explanation**: Normal variation due to:

- Network conditions
- CPU load
- Background processes
- Browser extensions

**Fix**: Run multiple audits and average the results

### Score doesn't match Chrome DevTools

**Issue**: CLI score different from DevTools

**Explanation**: Different Lighthouse versions or configurations

**Fix**: Ensure same Lighthouse version and configuration

## Next Steps

1. Review current performance reports in `lighthouse-reports/`
2. Prioritize fixes based on Core Web Vitals
3. Implement performance budgets
4. Set up automated audits in CI/CD
5. Monitor production with RUM tools
6. Document performance improvements
