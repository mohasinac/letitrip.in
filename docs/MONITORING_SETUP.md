# Monitoring & Analytics Setup Guide

**Last Updated**: February 8, 2026  
**Status**: Infrastructure Complete - Awaiting Firebase SDK Installation

---

## Overview

This document guides you through setting up comprehensive monitoring and analytics for the LetItRip.in platform. All infrastructure code is complete and ready to use once Firebase SDKs are installed.

---

## 1. Prerequisites

### Required Firebase Services

Before enabling monitoring, ensure these Firebase services are enabled in the [Firebase Console](https://console.firebase.google.com):

1. **Firebase Performance Monitoring**
   - Navigate to: Firebase Console → Performance
   - Click "Get Started"
   - Enable Performance Monitoring API

2. **Firebase Analytics (Google Analytics 4)**
   - Navigate to: Firebase Console → Analytics
   - Link Google Analytics 4 property
   - Configure data streams

3. **Firebase Crashlytics** (Optional - for future)
   - Currently not implemented
   - Will be added in Phase 10

---

## 2. Installation

### Install Firebase Performance & Analytics SDKs

```bash
npm install firebase@latest
```

The Firebase SDKs for Performance Monitoring and Analytics are already included in the Firebase package. No additional packages are needed.

### Verify Installation

```bash
npm list firebase
```

Should show: `firebase@[version]`

---

## 3. Firebase Console Configuration

### 3.1 Enable Performance Monitoring

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select project: `letitrip-in-app`
3. Navigate to **Performance** (left sidebar)
4. Click **Get Started**
5. Wait for data collection to initialize (takes ~24 hours for first data)

### 3.2 Configure Google Analytics 4

1. In Firebase Console, navigate to **Analytics** → **Dashboard**
2. Click **Configure Google Analytics**
3. Create or link GA4 property:
   - Property Name: "LetItRip.in"
   - Reporting Time Zone: Your timezone
   - Currency: USD
4. Enable Google Signals (for cross-device reporting)
5. Configure data retention: 14 months
6. Enable BigQuery Export (optional - for advanced analytics)

### 3.3 Create Custom Dashboards

#### Performance Dashboard

1. Navigate to **Performance** → **Dashboard**
2. Add custom traces:
   - `page_load_*` - Page load times
   - `api_*` - API response times
   - `user_login` - Login flow performance
   - `component_render_*` - Component rendering times

#### Analytics Dashboard

1. Navigate to **Analytics** → **Dashboard**
2. Add cards for key metrics:
   - Active Users (realtime)
   - User Engagement
   - Conversions (purchases, sign-ups)
   - E-commerce Overview
   - User Retention

---

## 4. Monitoring Features

### 4.1 Performance Monitoring

**Location**: `src/lib/monitoring/performance.ts`

#### Automatic Tracking

Performance monitoring is automatically initialized when the app loads. It tracks:

- **Page Load Times**: Automatically tracked by Firebase
- **Network Requests**: HTTP/HTTPS requests are auto-instrumented
- **Custom Traces**: Use the API for specific operations

#### Manual Tracking

**Track Page Loads**:

```typescript
import { trackPageLoad } from "@/lib/monitoring";

// In page component
useEffect(() => {
  trackPageLoad("products_page");
}, []);
```

**Track API Requests**:

```typescript
import { trackApiRequest } from "@/lib/monitoring";

const fetchProducts = async () => {
  return await trackApiRequest("/api/products", "GET", async () => {
    return await fetch("/api/products");
  });
};
```

**Custom Traces**:

```typescript
import { startTrace, stopTrace, addTraceAttribute } from "@/lib/monitoring";

const trace = startTrace("checkout_process");
addTraceAttribute(trace, "payment_method", "credit_card");

// Perform operation
await processCheckout();

stopTrace(trace);
```

**Measure Async Operations**:

```typescript
import { measureAsync } from "@/lib/monitoring";

const result = await measureAsync(
  "fetch_user_orders",
  async () => {
    return await fetch(`/api/orders?userId=${userId}`);
  },
  { userId, orderCount: "5" },
);
```

#### Pre-defined Traces

All common operations have predefined trace names in `PERFORMANCE_TRACES`:

```typescript
import { PERFORMANCE_TRACES, startTrace, stopTrace } from "@/lib/monitoring";

const trace = startTrace(PERFORMANCE_TRACES.USER_LOGIN);
// ... login logic
stopTrace(trace);
```

---

### 4.2 Google Analytics (GA4)

**Location**: `src/lib/monitoring/analytics.ts`

#### User Identification

```typescript
import {
  setAnalyticsUserId,
  setAnalyticsUserProperties,
} from "@/lib/monitoring";

// After user logs in
setAnalyticsUserId(user.uid);
setAnalyticsUserProperties({
  role: user.role,
  email_verified: user.emailVerified,
  signup_date: user.createdAt,
});

// On logout
setAnalyticsUserId(null);
```

#### Event Tracking

**Authentication Events**:

```typescript
import { trackAuth } from "@/lib/monitoring";

// User login
trackAuth.login("email"); // or 'google', 'apple'

// User registration
trackAuth.register("google");

// User logout
trackAuth.logout();
```

**E-commerce Events**:

```typescript
import { trackEcommerce } from "@/lib/monitoring";

// Product view
trackEcommerce.viewProduct({
  id: product.id,
  name: product.title,
  category: product.category,
  price: product.price,
});

// Add to cart
trackEcommerce.addToCart({
  id: product.id,
  name: product.title,
  category: product.category,
  price: product.price,
  quantity: 1,
});

// Purchase
trackEcommerce.purchase({
  id: order.id,
  total: order.totalAmount,
  tax: order.tax,
  shipping: order.shippingCost,
  items: order.items.map((item) => ({
    id: item.productId,
    name: item.productName,
    category: item.category,
    price: item.price,
    quantity: item.quantity,
  })),
});
```

**Custom Events**:

```typescript
import { trackEvent } from "@/lib/monitoring";

trackEvent("newsletter_signup", {
  email: userEmail,
  source: "homepage_footer",
});
```

#### Conversion Tracking

Set up these conversion events in GA4:

1. **User Registration**: `sign_up` event
2. **Product Purchase**: `purchase` event
3. **Auction Bid**: `place_bid` event
4. **Review Submit**: `submit_review` event

**Setup in GA4**:

1. Analytics → Configure → Events
2. Mark events as conversions
3. Set conversion values

---

### 4.3 Error Tracking

**Location**: `src/lib/monitoring/error-tracking.ts`

#### Automatic Error Tracking

Global error handlers are automatically set up:

```typescript
// Initialized in MonitoringProvider
setupGlobalErrorHandler();
```

This catches:

- Unhandled promise rejections
- Uncaught errors
- React component errors (via ErrorBoundary)

#### Manual Error Tracking

**Track General Errors**:

```typescript
import { trackError, ErrorCategory, ErrorSeverity } from "@/lib/monitoring";

try {
  await riskyOperation();
} catch (error) {
  trackError(error, {
    category: ErrorCategory.API,
    severity: ErrorSeverity.HIGH,
    context: {
      page: "/products",
      action: "fetch_products",
    },
  });
}
```

**Track API Errors**:

```typescript
import { trackApiError } from "@/lib/monitoring";

try {
  const response = await fetch("/api/products");
  if (!response.ok) {
    throw new Error("API request failed");
  }
} catch (error) {
  trackApiError(error, {
    endpoint: "/api/products",
    method: "GET",
    statusCode: 500,
  });
}
```

**Track Authentication Errors**:

```typescript
import { trackAuthError } from "@/lib/monitoring";

try {
  await loginWithEmail(email, password);
} catch (error) {
  trackAuthError(error, {
    action: "login",
    provider: "email",
  });
}
```

#### User Context

Set user context for better error debugging:

```typescript
import { setErrorTrackingUser, clearErrorTrackingUser } from "@/lib/monitoring";

// On login
setErrorTrackingUser({
  userId: user.uid,
  userRole: user.role,
  email: user.email,
});

// On logout
clearErrorTrackingUser();
```

---

### 4.4 Cache Performance Metrics

**Location**: `src/lib/monitoring/cache-metrics.ts`

#### Automatic Tracking

Cache metrics are automatically tracked when using the `withCache` middleware:

```typescript
// In API routes
import { withCache, CachePresets } from "@/lib/api/cache-middleware";

export const GET = withCache(async (request) => {
  // ... handler logic
}, CachePresets.LONG);
```

#### Manual Tracking

```typescript
import { recordCacheHit, recordCacheMiss } from "@/lib/monitoring";

const cachedData = cache.get(key);

if (cachedData) {
  recordCacheHit(key);
  return cachedData;
} else {
  recordCacheMiss(key);
  const data = await fetchData();
  cache.set(key, data);
  return data;
}
```

#### Cache Dashboard

Get cache performance metrics:

```typescript
import { getCacheDashboardData } from "@/lib/monitoring";

const dashboard = getCacheDashboardData();

console.log(`Cache Hit Rate: ${dashboard.hitRate}`);
console.log(`Status: ${dashboard.status}`); // 'healthy' or 'warning'
console.log(`Recommendation: ${dashboard.recommendation}`);
```

Output:

```
{
  hitRate: "78.50%",
  hits: 157,
  misses: 43,
  totalRequests: 200,
  cacheSize: 12,
  lastReset: "2/8/2026, 10:30:00 AM",
  status: "healthy",
  recommendation: "Cache performance is optimal"
}
```

#### Monitoring & Alerts

Cache monitoring runs automatically every 5 minutes:

- **Hit Rate < 50%**: Critical alert (tracked in analytics)
- **Hit Rate < 70%**: Warning alert (tracked in analytics)
- **Hit Rate >= 70%**: Healthy (no alert)

---

## 5. Monitoring Dashboard

### Create Admin Monitoring Page

Create `src/app/admin/monitoring/page.tsx`:

```typescript
'use client';

import { useState, useEffect } from 'react';
import { getCacheDashboardData } from '@/lib/monitoring';

export default function MonitoringPage() {
  const [cacheData, setCacheData] = useState(getCacheDashboardData());

  useEffect(() => {
    const interval = setInterval(() => {
      setCacheData(getCacheDashboardData());
    }, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Monitoring Dashboard</h1>

      {/* Cache Metrics */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Cache Performance</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Hit Rate</p>
            <p className="text-2xl font-bold">{cacheData.hitRate}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Hits</p>
            <p className="text-2xl font-bold">{cacheData.hits}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Misses</p>
            <p className="text-2xl font-bold">{cacheData.misses}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Cache Size</p>
            <p className="text-2xl font-bold">{cacheData.cacheSize}</p>
          </div>
        </div>
        <div className="mt-4">
          <p className={`text-sm ${
            cacheData.status === 'healthy'
              ? 'text-green-600 dark:text-green-400'
              : 'text-yellow-600 dark:text-yellow-400'
          }`}>
            {cacheData.recommendation}
          </p>
        </div>
      </div>

      {/* External Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <a
          href="https://console.firebase.google.com/project/letitrip-in-app/performance"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700"
        >
          Firebase Performance →
        </a>
        <a
          href="https://console.firebase.google.com/project/letitrip-in-app/analytics"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-green-600 text-white p-4 rounded-lg hover:bg-green-700"
        >
          Google Analytics →
        </a>
        <a
          href="https://analytics.google.com"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-purple-600 text-white p-4 rounded-lg hover:bg-purple-700"
        >
          GA4 Dashboard →
        </a>
      </div>
    </div>
  );
}
```

---

## 6. Testing Monitoring

### Test Performance Tracking

```bash
# Start dev server
npm run dev

# Visit pages and check console
# You should see traces being logged in development mode
```

### Test Analytics

```bash
# Check Firebase Console after 24 hours
# Events should appear in Analytics → Events
```

### Test Error Tracking

```typescript
// Trigger a test error
import { trackError, ErrorCategory, ErrorSeverity } from "@/lib/monitoring";

trackError(new Error("Test error"), {
  category: ErrorCategory.UNKNOWN,
  severity: ErrorSeverity.LOW,
});
```

Check `logs/error-[date].log` for the logged error.

---

## 7. Production Deployment

### Checklist

- [ ] Firebase Performance Monitoring enabled
- [ ] Google Analytics 4 configured
- [ ] Custom dashboards created
- [ ] Conversion events set up
- [ ] Monitoring dashboard deployed
- [ ] Cache metrics working
- [ ] Error tracking verified
- [ ] User context tracking tested

### Environment Variables

Ensure these are set in production:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=letitrip-in-app
NODE_ENV=production
```

### Verify Deployment

1. Visit production site
2. Perform key actions (login, view products, make purchase)
3. Wait 24 hours
4. Check Firebase Console for data

---

## 8. Monitoring Best Practices

### Performance

✅ **DO**:

- Track critical user flows (login, checkout, search)
- Add custom traces for slow operations
- Monitor API response times
- Set performance budgets (page load < 3s)

❌ **DON'T**:

- Track every single operation (creates noise)
- Add traces to fast operations (< 100ms)
- Track sensitive user data in traces

### Analytics

✅ **DO**:

- Track user journey (funnel analysis)
- Monitor conversion rates
- Segment users by role/behavior
- Create custom events for key actions

❌ **DON'T**:

- Track personally identifiable information (PII)
- Create too many custom events (GA4 limit: 500)
- Track every click (focus on meaningful actions)

### Error Tracking

✅ **DO**:

- Add context to all errors
- Set user context on login
- Clear user context on logout
- Track error severity appropriately

❌ **DON'T**:

- Log sensitive data in error messages
- Track expected errors (validation failures)
- Ignore error categorization

---

## 9. Troubleshooting

### No Data in Firebase Console

**Wait 24 hours**: Firebase Performance and Analytics data takes time to populate.

**Check browser console**: Look for initialization errors.

**Verify Firebase config**: Ensure all environment variables are correct.

### Cache Metrics Not Updating

**Check localStorage**: Metrics are stored in `cache_metrics` key.

**Clear cache**: `localStorage.removeItem('cache_metrics')` and refresh.

**Check console**: Look for errors in MonitoringProvider initialization.

### Errors Not Being Logged

**Check file logging**: Verify `logs/` directory exists and is writable.

**Check Logger setup**: Ensure `enableFileLogging: true` in ErrorBoundary.

**Check permissions**: Ensure Node.js has write access to project directory.

---

## 10. Future Enhancements

### Firebase Crashlytics

When ready to add:

```bash
npm install @firebase/crashlytics
```

Update `error-tracking.ts` to send errors to Crashlytics.

### Custom Performance Metrics

Add custom metrics for:

- Time to first product load
- Checkout completion time
- Image upload speed
- Search result relevance

### Advanced Analytics

- User cohort analysis
- A/B testing framework
- Predictive analytics
- Revenue forecasting

---

## Resources

- [Firebase Performance Docs](https://firebase.google.com/docs/perf-mon)
- [Google Analytics 4 Docs](https://support.google.com/analytics/answer/10089681)
- [Firebase Console](https://console.firebase.google.com/project/letitrip-in-app)
- [Google Analytics Dashboard](https://analytics.google.com)

---

**Next Steps**: Enable Firebase Performance Monitoring and Google Analytics in Firebase Console, then start collecting data!
