# Vercel Cron Jobs Setup Guide

## Overview

This project uses **Vercel Cron Jobs** to run scheduled tasks on the serverless platform. Traditional `node-cron` doesn't work on Vercel because serverless functions are stateless and ephemeral.

## Why Not node-cron?

❌ **node-cron on Vercel:**

- Requires a persistent Node.js process
- Serverless functions spin up and down on-demand
- Cron jobs would start and immediately stop
- Not suitable for production on Vercel

✅ **Vercel Cron Jobs:**

- Native Vercel feature
- Reliable scheduled execution
- Integrated with your deployment
- Automatic authentication via `x-vercel-cron` header

## Configuration

### 1. vercel.json Configuration

```json
{
  "crons": [
    {
      "path": "/api/cron/process-auctions",
      "schedule": "* * * * *"
    }
  ]
}
```

**Schedule Format:** Standard cron syntax

- `* * * * *` - Every minute
- `*/5 * * * *` - Every 5 minutes
- `0 * * * *` - Every hour
- `0 0 * * *` - Every day at midnight

### 2. Cron Endpoint

**Location:** `src/app/api/cron/process-auctions/route.ts`

**Features:**

- ✅ Authenticated by Vercel automatically
- ✅ Manual trigger support with secret
- ✅ Error handling and logging
- ✅ 60-second timeout for long operations

## Security

### Vercel Automatic Authentication

Vercel automatically adds the `x-vercel-cron` header to cron requests:

```typescript
const cronHeader = request.headers.get("x-vercel-cron");
if (!cronHeader) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
```

### Optional: CRON_SECRET for Manual Triggers

Add to Vercel environment variables:

```bash
CRON_SECRET=your-super-secret-key-here
```

**Manual Trigger:**

```bash
curl -X POST https://your-domain.com/api/cron/process-auctions \
  -H "Authorization: Bearer your-super-secret-key-here"
```

## Local Development vs Production

### Local Development (node-cron)

- ✅ Uses `node-cron` for persistent background jobs
- ✅ Starts automatically via `instrumentation.ts`
- ✅ Runs every minute in the background
- ✅ No manual triggers needed

**How it works:**

1. Next.js starts with `instrumentationHook: true`
2. `instrumentation.ts` calls `server-init.ts`
3. `server-init.ts` starts auction scheduler
4. Scheduler runs in background

### Vercel Production (Vercel Cron)

- ✅ Uses Vercel Cron Jobs for scheduled execution
- ✅ Configured in `vercel.json`
- ✅ Hits `/api/cron/process-auctions` every minute
- ✅ Serverless-friendly approach

**How it works:**

1. Vercel's infrastructure triggers cron job
2. Calls `/api/cron/process-auctions` endpoint
3. Endpoint processes auctions
4. Function shuts down after completion

## Setup Instructions

### Step 1: Deploy to Vercel

```bash
vercel --prod
```

### Step 2: Verify Cron Configuration

1. Go to Vercel Dashboard
2. Select your project
3. Navigate to **Settings → Cron Jobs**
4. Verify cron job appears:
   - Path: `/api/cron/process-auctions`
   - Schedule: `* * * * *`

### Step 3: Monitor Execution

**View Logs:**

```bash
vercel logs --follow
```

**Or in Vercel Dashboard:**

1. Go to your project
2. Click **Deployments**
3. Select latest deployment
4. View **Runtime Logs**
5. Filter by `/api/cron/process-auctions`

### Step 4: Test Manual Trigger (Optional)

```bash
# Set CRON_SECRET in Vercel environment variables first
curl -X POST https://your-domain.com/api/cron/process-auctions \
  -H "Authorization: Bearer ${CRON_SECRET}"
```

## Current Cron Jobs

### Process Ended Auctions

- **Endpoint:** `/api/cron/process-auctions`
- **Schedule:** Every minute (`* * * * *`)
- **Purpose:**
  - Find auctions that have ended
  - Determine winners from highest bid
  - Create orders for winners
  - Send notifications
  - Update inventory
- **Timeout:** 60 seconds max

## Monitoring

### Success Response

```json
{
  "success": true,
  "message": "Auction processing complete",
  "duration": 1234,
  "timestamp": "2025-11-12T10:30:00.000Z"
}
```

### Error Response

```json
{
  "success": false,
  "error": "Error message here",
  "timestamp": "2025-11-12T10:30:00.000Z"
}
```

### Key Metrics to Monitor

- ✅ Execution frequency (should be every minute)
- ✅ Response time (should be under 60s)
- ✅ Success rate (should be near 100%)
- ✅ Number of auctions processed per run

## Troubleshooting

### Cron Not Running

**Check 1:** Verify `vercel.json` is deployed

```bash
vercel --prod
```

**Check 2:** Verify in Vercel Dashboard

- Settings → Cron Jobs should show the job

**Check 3:** Check logs for errors

```bash
vercel logs --follow
```

### Unauthorized Errors

**Issue:** Missing `x-vercel-cron` header or wrong secret

**Solution:**

- Vercel Cron automatically adds the header
- For manual triggers, use correct `CRON_SECRET`

### Timeout Errors

**Issue:** Processing takes longer than 60 seconds

**Solution:**

- Optimize auction processing logic
- Process in smaller batches
- Consider increasing `maxDuration` in `vercel.json`

```json
{
  "functions": {
    "src/app/api/cron/**": {
      "maxDuration": 300
    }
  }
}
```

### Missing Auctions

**Issue:** Some auctions not being processed

**Solution:**

- Check Firestore indexes are deployed
- Verify query filters are correct
- Check auction `status` and `end_time` fields

## Environment Variables

Add these to Vercel:

```bash
# Required
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Optional - for manual triggers
CRON_SECRET=your-super-secret-key-here

# Firebase Config (already set)
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
# ... etc
```

## Best Practices

1. **Keep cron jobs fast** - Under 60 seconds
2. **Handle errors gracefully** - Use try-catch
3. **Log everything** - For debugging
4. **Monitor regularly** - Check logs weekly
5. **Test locally first** - Before deploying
6. **Use idempotent operations** - Safe to retry

## Cost Considerations

### Vercel Cron Pricing

- **Hobby Plan:** Limited cron job executions
- **Pro Plan:** Generous limits (check Vercel pricing)
- **Enterprise:** Unlimited

**Our Usage:**

- 1 cron job × 60 executions/hour × 24 hours = **1,440 executions/day**
- Ensure this fits within your Vercel plan limits

**Optimization:**

- If hitting limits, reduce frequency (e.g., every 5 minutes instead of 1)
- Only process auctions that actually ended recently

## Alternative Solutions

If Vercel Cron doesn't fit your needs:

1. **External Cron Services:**

   - Cron-job.org
   - EasyCron
   - GitHub Actions scheduled workflows

2. **Upstash QStash:**

   - Vercel-recommended solution
   - HTTP-based scheduling
   - Built-in retries

3. **Self-hosted:**
   - Deploy to VPS with persistent Node.js
   - Use original `node-cron` approach

## Summary

| Feature        | Local Dev          | Vercel Prod      |
| -------------- | ------------------ | ---------------- |
| Method         | node-cron          | Vercel Cron      |
| Persistent     | Yes                | No (serverless)  |
| Configuration  | instrumentation.ts | vercel.json      |
| Auto-start     | Yes                | Yes              |
| Manual trigger | N/A                | POST with secret |
| Cost           | Free               | Depends on plan  |

**Bottom Line:** Use `node-cron` locally, Vercel Cron in production. Both work seamlessly with no code changes needed.
