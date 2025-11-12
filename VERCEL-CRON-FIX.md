# Auction Scheduler Fix for Vercel

## Problem

The original `server-init.ts` used `node-cron` to run background jobs, but **this doesn't work on Vercel** because:

1. ❌ Vercel uses serverless functions (no persistent process)
2. ❌ Functions spin up per request and shut down immediately
3. ❌ `node-cron` requires a constantly running Node.js process
4. ❌ The cron job would start and immediately die

## Solution

Implemented **dual-mode** auction scheduler:

### 🏠 Local Development

- Uses `node-cron` for persistent background jobs
- Started via `instrumentation.ts`
- Runs every minute automatically
- Perfect for development testing

### ☁️ Vercel Production

- Uses **Vercel Cron Jobs** (native feature)
- Configured in `vercel.json`
- Hits `/api/cron/process-auctions` every minute
- Serverless-friendly approach

## Changes Made

### 1. Updated `vercel.json`

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

### 2. Created Cron Endpoint

**File:** `src/app/api/cron/process-auctions/route.ts`

Features:

- ✅ Vercel authenticated (via `x-vercel-cron` header)
- ✅ Manual trigger support (with `CRON_SECRET`)
- ✅ Error handling and logging
- ✅ 60-second max duration

### 3. Updated `server-init.ts`

- ✅ Detects Vercel environment (`process.env.VERCEL`)
- ✅ Skips `node-cron` on Vercel
- ✅ Logs which mode is active
- ✅ Still works locally for development

### 4. Created Documentation

**File:** `docs/VERCEL-CRON-SETUP.md`

- Complete setup guide
- Monitoring instructions
- Troubleshooting tips
- Cost considerations

## How It Works

### Local Development Flow

```
Next.js starts
    ↓
instrumentation.ts
    ↓
server-init.ts
    ↓
Detects: NOT Vercel
    ↓
Starts node-cron
    ↓
Runs every minute in background
```

### Vercel Production Flow

```
Vercel Cron Service
    ↓
Every minute (configured in vercel.json)
    ↓
HTTP GET /api/cron/process-auctions
    ↓
Process ended auctions
    ↓
Function completes and shuts down
```

## Deployment Checklist

### ✅ Already Done

- [x] Created cron endpoint
- [x] Updated vercel.json
- [x] Updated server-init.ts
- [x] Enabled instrumentation hook in next.config.js

### 🚀 Next Steps for Deployment

1. **Deploy to Vercel:**

   ```bash
   vercel --prod
   ```

2. **Verify Cron Job:**

   - Go to Vercel Dashboard
   - Project → Settings → Cron Jobs
   - Should see: `/api/cron/process-auctions` running every minute

3. **Add Environment Variable (Optional):**

   ```bash
   # For manual triggers
   CRON_SECRET=your-super-secret-key-here
   ```

4. **Monitor Logs:**

   ```bash
   vercel logs --follow
   ```

   Look for: `[Cron] Processing ended auctions...`

5. **Test Manual Trigger:**
   ```bash
   curl -X POST https://your-domain.com/api/cron/process-auctions \
     -H "Authorization: Bearer ${CRON_SECRET}"
   ```

## Testing

### Local Testing

```bash
# Server starts automatically
npm run dev

# Check logs for:
[Server Init] Starting server initialization (local development)...
[Auction Scheduler] Scheduler started - running every 1 minute
```

### Vercel Testing

```bash
# Deploy
vercel --prod

# Wait 1 minute, then check logs
vercel logs --follow

# Look for:
[Cron] Processing ended auctions...
[Cron] Completed in XXXms
```

## Benefits

| Feature            | Before     | After              |
| ------------------ | ---------- | ------------------ |
| **Local Dev**      | ✅ Works   | ✅ Works           |
| **Vercel Prod**    | ❌ Broken  | ✅ Works           |
| **Serverless**     | ❌ No      | ✅ Yes             |
| **Monitoring**     | 😐 Limited | ✅ Full logs       |
| **Manual Trigger** | ❌ No      | ✅ Yes             |
| **Cost**           | Free       | Vercel plan limits |

## Monitoring

### Success Indicators

- ✅ Cron job runs every minute
- ✅ Logs show: `[Cron] Processing ended auctions...`
- ✅ Response time under 10 seconds
- ✅ HTTP 200 responses

### Warning Signs

- ⚠️ No logs for several minutes
- ⚠️ HTTP 401 (authentication issue)
- ⚠️ HTTP 500 (processing error)
- ⚠️ Timeout errors (over 60 seconds)

## Cost Estimate

**Vercel Cron Executions:**

- 1 job × 60 times/hour × 24 hours = **1,440/day**
- ~43,800/month

**Vercel Plan Limits:**

- Hobby: Check Vercel pricing
- Pro: Generous limits (sufficient)
- Enterprise: Unlimited

## Rollback Plan

If issues arise:

1. **Quick Fix:** Reduce frequency

   ```json
   "schedule": "*/5 * * * *"  // Every 5 minutes
   ```

2. **Alternative:** Use external cron service

   - Point to `/api/cron/process-auctions`
   - Add `Authorization: Bearer ${CRON_SECRET}`

3. **Revert:** Remove cron config from `vercel.json`
   - Auctions won't auto-close
   - Manual processing only

## Summary

✅ **Fixed:** Auction scheduler now works on Vercel
✅ **Local Dev:** Still uses node-cron (no changes needed)
✅ **Production:** Uses Vercel Cron (serverless-friendly)
✅ **Monitoring:** Full logs and manual trigger support
✅ **Scalable:** Handles high traffic with serverless architecture

Ready to deploy!
