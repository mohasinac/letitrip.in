# Sentry Configuration Guide

## Setup Steps

### 1. Create Sentry Project

1. Go to https://sentry.io and create account
2. Create new project (select Next.js)
3. Get your DSN from project settings

### 2. Environment Variables

Add to `.env.production`:

```bash
# Sentry Configuration
NEXT_PUBLIC_SENTRY_DSN=https://xxxxxxxxxxxxx@sentry.io/xxxxxxx
SENTRY_AUTH_TOKEN=your_auth_token_here
SENTRY_ORG=your-organization
SENTRY_PROJECT=justforview-in

# App Version (for release tracking)
NEXT_PUBLIC_APP_VERSION=1.0.0
```

### 3. Alert Configuration

#### Critical Alerts (Immediate Response)

**Payment Failures:**
- Condition: Error contains "payment" or "checkout"
- Threshold: > 5 errors in 5 minutes
- Notification: Email + SMS
- Priority: Critical

**Authentication Errors:**
- Condition: Error in `/api/auth/*` routes
- Threshold: > 10 errors in 5 minutes
- Notification: Email
- Priority: High

**Database Errors:**
- Condition: Error contains "firestore" or "firebase"
- Threshold: > 20 errors in 10 minutes
- Notification: Email
- Priority: High

#### Warning Alerts (Monitor)

**Rate Limit Exceeded:**
- Condition: 429 status code
- Threshold: > 100 in 10 minutes
- Notification: Email (digest)
- Priority: Medium

**Slow API Responses:**
- Condition: Response time > 3000ms
- Threshold: > 50 requests in 5 minutes
- Notification: Email (digest)
- Priority: Medium

### 4. Sentry Configuration in Dashboard

#### Performance Monitoring

```
Traces Sample Rate: 10%
Profiles Sample Rate: 10%
Session Replay Sample Rate: 10%
Session Replay on Error: 100%
```

#### Error Filtering

**Ignore These Errors:**
- ResizeObserver loop limit exceeded
- Non-Error promise rejection captured
- Network request failed (client-side)
- Extension errors (browser extensions)
- AbortError (user cancelled)

#### Breadcrumbs

Enable:
- Navigation
- Console logs (error/warning only)
- Network requests (API calls only)
- User interactions (clicks on buttons)

Disable:
- Mouse movements
- Scroll events
- All console.log in production

### 5. Release Tracking

**Automatic via CI/CD:**

```bash
# In your deploy script
export SENTRY_AUTH_TOKEN=xxxxx
export SENTRY_ORG=your-org
export SENTRY_PROJECT=justforview-in

# Create release
npx @sentry/cli releases new "$VERSION"

# Upload source maps
npx @sentry/cli releases files "$VERSION" upload-sourcemaps .next

# Finalize release
npx @sentry/cli releases finalize "$VERSION"

# Set commits
npx @sentry/cli releases set-commits "$VERSION" --auto
```

### 6. Team Alerts

**Setup in Sentry Dashboard:**

1. **Settings → Alerts → New Alert Rule**

2. **Payment Errors Alert:**
   - Name: "Critical Payment Errors"
   - When: Error event
   - Filter: `transaction:/api/checkout/* OR transaction:/api/payments/*`
   - Frequency: 5+ events in 5 minutes
   - Actions: Email team@justforview.in, Slack #alerts

3. **Authentication Errors Alert:**
   - Name: "High Auth Failure Rate"
   - When: Error event
   - Filter: `transaction:/api/auth/*`
   - Frequency: 10+ events in 5 minutes
   - Actions: Email devops@justforview.in

4. **Performance Degradation:**
   - Name: "Slow API Responses"
   - When: Transaction event
   - Filter: `duration:>3000ms`
   - Frequency: 50+ events in 5 minutes
   - Actions: Email devops@justforview.in

### 7. Integration with Monitoring Dashboard

Add to your monitoring dashboard:

```typescript
// Fetch Sentry stats
async function getSentryStats() {
  const response = await fetch(
    'https://sentry.io/api/0/projects/YOUR_ORG/YOUR_PROJECT/stats/',
    {
      headers: {
        Authorization: `Bearer ${SENTRY_AUTH_TOKEN}`,
      },
    }
  );
  return response.json();
}
```

### 8. Custom Context

Add custom context to errors:

```typescript
import { captureException } from '@/lib/sentry';

try {
  // Your code
} catch (error) {
  captureException(error as Error, {
    level: 'error',
    tags: {
      feature: 'checkout',
      payment_method: 'razorpay',
    },
    extra: {
      order_id: orderId,
      amount: totalAmount,
      user_id: userId,
    },
    user: {
      id: userId,
      email: userEmail,
    },
  });
}
```

### 9. Performance Monitoring

Track custom transactions:

```typescript
import { startSpan } from '@/lib/sentry';

export async function processOrder(orderId: string) {
  return startSpan('process-order', 'task', { order_id: orderId }, async () => {
    // Your order processing logic
    return result;
  });
}
```

### 10. Testing Sentry Integration

```typescript
// Create test endpoint: /api/test/sentry
import { NextResponse } from 'next/server';
import { captureException, captureMessage } from '@/lib/sentry';

export async function GET() {
  // Test error capture
  try {
    throw new Error('Test Sentry error capture');
  } catch (error) {
    captureException(error as Error, {
      level: 'error',
      tags: { test: 'true' },
    });
  }

  // Test message capture
  captureMessage('Test Sentry message', 'info', {
    tags: { test: 'true' },
  });

  return NextResponse.json({ message: 'Check Sentry dashboard' });
}
```

Visit `/api/test/sentry` and check Sentry dashboard.

## Monitoring Checklist

- [ ] Sentry project created
- [ ] DSN configured in environment
- [ ] Alert rules configured
- [ ] Team notifications set up
- [ ] Performance monitoring enabled
- [ ] Release tracking configured
- [ ] Error filtering configured
- [ ] Test alert sent and received
- [ ] Dashboard integration complete

## Support

For issues, contact: devops@justforview.in
