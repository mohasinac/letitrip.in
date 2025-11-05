# Vercel Deployment Guide

## Overview

This application is configured for serverless deployment on Vercel with Firestore-backed session management.

## Architecture

### Session Storage

- **Primary Storage**: Firestore (persistent across serverless invocations)
- **Cache Layer**: In-memory cache (5-minute TTL per function instance)
- **Cleanup**: Automated via Vercel Cron (every 6 hours)

### Key Features

- ✅ Serverless-compatible session management
- ✅ Automatic session cleanup
- ✅ HTTP-only cookies for security
- ✅ Edge Runtime compatible middleware
- ✅ Firebase Admin SDK for database operations

## Environment Variables

Add these to your Vercel project:

```bash
# Firebase Admin (Required)
FIREBASE_ADMIN_PROJECT_ID=your_project_id
FIREBASE_ADMIN_CLIENT_EMAIL=your_service_account_email
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Firebase Client (Required)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# JWT (Required)
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

# Cron Job Secret (Optional - for session cleanup)
CRON_SECRET=your_random_secret_key

# Payment Gateways
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
NEXT_PUBLIC_API_URL=https://your-domain.vercel.app/api

# Node Environment
NODE_ENV=production
```

## Deployment Steps

### 1. Initial Setup

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login
```

### 2. Link Project

```bash
# From project root
vercel link
```

### 3. Set Environment Variables

Option A: Using PowerShell script (recommended)

```powershell
.\sync-env-to-vercel.ps1
```

Option B: Manual setup via Vercel CLI

```bash
vercel env add FIREBASE_ADMIN_PROJECT_ID
vercel env add FIREBASE_ADMIN_CLIENT_EMAIL
# ... add all variables
```

Option C: Via Vercel Dashboard

1. Go to Project Settings → Environment Variables
2. Add all required variables
3. Select environments (Production, Preview, Development)

### 4. Deploy

```bash
# Deploy to production
vercel --prod

# Or use npm script
npm run deploy:vercel
```

## Firestore Setup

### 1. Enable Firestore

- Go to Firebase Console → Firestore Database
- Create database (production mode)
- Select region (closest to your users)

### 2. Deploy Security Rules

```bash
firebase deploy --only firestore:rules
```

### 3. Deploy Indexes

```bash
firebase deploy --only firestore:indexes
```

Or let Firebase auto-create indexes as needed (recommended for development).

## Session Management

### How It Works

1. **Login**: Creates session in Firestore + sets HTTP-only cookie
2. **API Request**:
   - Checks in-memory cache first (fast)
   - Falls back to Firestore if cache miss
   - Updates cache for subsequent requests
3. **Middleware**: Uses cache-only for speed (middleware must be fast)
4. **Cleanup**: Vercel Cron runs every 6 hours to delete expired sessions

### Session Lifecycle

```
User Login
    ↓
Create Session (Firestore + Cookie)
    ↓
API Requests (Cache → Firestore)
    ↓
Session Expires (7 days default)
    ↓
Cron Cleanup (Removes from Firestore)
```

### Monitoring Sessions

```bash
# Get session stats (requires admin auth)
curl https://your-domain.vercel.app/api/admin/sessions/stats \
  -H "Authorization: Bearer your_admin_token"

# Manual cleanup (requires cron secret)
curl -X POST https://your-domain.vercel.app/api/admin/sessions/cleanup \
  -H "Authorization: Bearer your_cron_secret"
```

## Vercel Cron Configuration

The app uses Vercel Cron for automatic session cleanup:

```json
{
  "crons": [
    {
      "path": "/api/admin/sessions/cleanup",
      "schedule": "0 */6 * * *"
    }
  ]
}
```

Schedule: Every 6 hours (00:00, 06:00, 12:00, 18:00 UTC)

### Cron Limitations

- **Free Plan**: 1 cron job
- **Pro Plan**: Up to 2 cron jobs
- **Enterprise**: Unlimited

## Performance Optimization

### Cache Strategy

- Cache TTL: 5 minutes (balances freshness vs. Firestore reads)
- Cache per function instance (isolated per serverless invocation)
- Automatically invalidated on session update/delete

### Firestore Optimization

- Indexed queries for fast lookups
- Batch operations for cleanup (500 sessions per batch)
- Limited query results (max 1000 sessions for stats)

### Edge Middleware

- Fast cookie parsing (no Firestore calls)
- Cache-only session checks
- Minimal latency impact

## Troubleshooting

### Sessions Not Persisting

**Symptom**: Users logged out after page refresh

**Solution**:

1. Check Firestore rules allow backend access to `sessions` collection
2. Verify Firebase Admin credentials are correct
3. Check browser cookies (should have `session` cookie)

### Middleware Not Working

**Symptom**: Auth redirects fail

**Solution**:

1. Middleware uses cache-only (sessions may not be visible immediately)
2. Ensure session is created before accessing protected routes
3. Check middleware matcher configuration

### Cron Not Running

**Symptom**: Expired sessions accumulating

**Solution**:

1. Verify Vercel plan supports cron jobs
2. Check deployment logs for cron executions
3. Manually trigger cleanup: `POST /api/admin/sessions/cleanup`

### Firestore Permission Denied

**Symptom**: "Permission denied" errors

**Solution**:

1. Check Firestore rules: `sessions` collection should allow Admin SDK only
2. Verify Firebase Admin credentials
3. Ensure service account has proper IAM permissions

## Cost Optimization

### Firestore Costs

- **Reads**: ~1 read per API request (with 5-min cache)
- **Writes**: ~1 write per login, ~1 per cleanup batch
- **Storage**: ~1KB per session

### Estimated Costs (Monthly)

- 100K API requests: ~$0.50 (with caching)
- 10K logins: ~$0.05
- Storage (10K active sessions): ~$0.20

**Total**: ~$0.75/month for moderate traffic

## Security Best Practices

### Environment Variables

- ✅ Never commit `.env.local` to git
- ✅ Use different Firebase projects for dev/prod
- ✅ Rotate `CRON_SECRET` periodically
- ✅ Use strong `JWT_SECRET` (minimum 32 characters)

### Session Security

- ✅ HTTP-only cookies (XSS protection)
- ✅ HTTPS-only in production (MITM protection)
- ✅ SameSite=Lax (CSRF protection)
- ✅ 7-day expiration (security vs. UX balance)

### Firestore Security

- ✅ Client SDK cannot access `sessions` collection
- ✅ Only Admin SDK (backend) has access
- ✅ Regular cleanup removes expired sessions
- ✅ No sensitive data in session document

## Monitoring & Logging

### Vercel Dashboard

- Monitor function execution times
- Check cron job logs
- View deployment logs

### Firebase Console

- Firestore usage metrics
- Query performance
- Storage costs

### Custom Logging

```typescript
// Check session stats
import { getSessionStats } from "@/app/(backend)/api/_lib/auth/session-store";

const stats = await getSessionStats();
console.log("Active sessions:", stats.active);
console.log("By role:", stats.byRole);
```

## Support & Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Firebase Firestore](https://firebase.google.com/docs/firestore)
- [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs)

## Version History

- **v1.0.0** (2025-11-05): Initial Vercel deployment with Firestore sessions
  - Serverless-compatible session management
  - Automatic cleanup via cron
  - In-memory caching for performance
