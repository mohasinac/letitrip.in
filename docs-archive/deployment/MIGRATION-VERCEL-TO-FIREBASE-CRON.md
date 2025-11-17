# Migration: Vercel Cron to Firebase Functions

## Overview

We're migrating the auction processing cron job from Vercel Cron to Firebase Cloud Functions for better reliability, lower latency, and more control.

## Changes Made

### 1. Created Firebase Functions ✅

**New files:**

- `functions/package.json` - Dependencies and scripts
- `functions/tsconfig.json` - TypeScript configuration
- `functions/src/index.ts` - Main functions file with auction processing
- `functions/.eslintrc.js` - ESLint configuration
- `functions/.gitignore` - Git ignore rules

### 2. Updated Configuration ✅

**firebase.json:**

```json
{
  "functions": [
    {
      "source": "functions",
      "codebase": "default",
      "ignore": ["node_modules", ".git"],
      "predeploy": [
        "npm --prefix \"$RESOURCE_DIR\" run lint",
        "npm --prefix \"$RESOURCE_DIR\" run build"
      ]
    }
  ]
}
```

**vercel.json:**

- Removed `crons` section
- Kept existing API routes (can be used as fallback)

**package.json:**

- Added Firebase Functions scripts:
  - `setup:firebase-functions` - Install dependencies
  - `functions:build` - Build TypeScript
  - `functions:serve` - Run locally
  - `functions:deploy` - Deploy to Firebase
  - `functions:logs` - View logs

### 3. Function Details

**Scheduled Function: `processAuctions`**

- **Trigger**: Every 1 minute (Cloud Scheduler)
- **Region**: asia-south1 (Mumbai)
- **Memory**: 1GB
- **Timeout**: 540 seconds (9 minutes)
- **What it does**:
  1. Finds all live auctions where `end_time <= now`
  2. Determines winner (highest bid)
  3. Checks reserve price
  4. Creates order for winner
  5. Updates `won_auctions` collection
  6. Updates product inventory
  7. Sends notifications (placeholder)

**Callable Function: `triggerAuctionProcessing`**

- **Auth**: Required (Admin only)
- **Purpose**: Manual trigger for testing
- **Use**: Admin dashboard can call this directly

## Deployment Steps

### Step 1: Setup Functions

```bash
# Install dependencies
npm run setup:firebase-functions

# Build functions
npm run functions:build
```

### Step 2: Deploy Functions

```bash
# Deploy all functions
npm run functions:deploy

# Or deploy everything (Next.js + Functions)
npm run deploy:firebase
```

### Step 3: Verify Deployment

```bash
# Check logs
npm run functions:logs

# Or view in Firebase Console
# https://console.firebase.google.com/project/YOUR_PROJECT/functions/logs
```

### Step 4: Test

```bash
# Option 1: Wait for next minute (automatic)
# Option 2: Call from admin dashboard
# Option 3: Use Firebase CLI
firebase functions:shell
> triggerAuctionProcessing({})
```

### Step 5: Monitor

- First 24 hours: Check logs every hour
- First week: Daily checks
- Ongoing: Weekly review of costs and errors

## Cost Comparison

### Vercel Cron (Before)

- **Cost**: Included in Vercel plan
- **Limitations**:
  - Limited execution time
  - Tied to Vercel deployment
  - US/EU regions primarily

### Firebase Functions (After)

- **Cost**: ~$0.40/month (estimated)
- **Benefits**:
  - Runs in Mumbai (lower latency)
  - Independent of Next.js deployment
  - Better monitoring and logs
  - 9-minute timeout
  - Direct Firestore access

## Rollback Plan

If issues occur, you can quickly rollback:

1. Re-enable Vercel cron in `vercel.json`:

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

2. Deploy to Vercel:

```bash
npm run deploy:prod
```

3. Disable Firebase Function (don't delete):

```bash
firebase functions:config:unset processAuctions
```

## Keeping Vercel Endpoint

We recommend keeping the Vercel endpoint `/api/cron/process-auctions` as a fallback:

**Pros:**

- ✅ Redundancy if Firebase has issues
- ✅ Easy testing from browser/Postman
- ✅ Familiar debugging interface

**Cons:**

- ❌ Slightly higher costs (minimal)
- ❌ Two systems doing the same thing

**Recommendation:** Keep it for 1 month, then remove if Firebase is stable.

## Testing Checklist

Before going live:

- [ ] Test locally with emulator: `npm run functions:serve`
- [ ] Deploy to Firebase: `npm run functions:deploy`
- [ ] Verify function appears in Firebase Console
- [ ] Check Cloud Scheduler created successfully
- [ ] Wait for first automatic run (check logs)
- [ ] Manually trigger via callable function
- [ ] Verify auction processing works correctly
- [ ] Monitor costs for 24 hours
- [ ] Check error rates
- [ ] Update admin dashboard to use new callable function

## Admin Dashboard Update

Update the admin dashboard to call the Firebase callable function:

```typescript
import { getFunctions, httpsCallable } from "firebase/functions";

const functions = getFunctions(app, "asia-south1");
const triggerProcessing = httpsCallable(functions, "triggerAuctionProcessing");

async function handleManualTrigger() {
  try {
    const result = await triggerProcessing();
    console.log("Success:", result.data);
  } catch (error) {
    console.error("Error:", error);
  }
}
```

## Monitoring & Alerts

### Firebase Console

- **Functions Dashboard**: https://console.firebase.google.com/project/YOUR_PROJECT/functions
- **Logs**: Functions > Logs
- **Usage**: Functions > Usage
- **Health**: Functions > Health

### Alerts to Set Up

1. Error rate > 5%
2. Execution time > 8 minutes
3. Daily invocation count anomaly
4. Cost threshold exceeded

## Common Issues

### Issue 1: Function Timeout

**Symptom:** Function times out before completing
**Solution:**

- Optimize queries (use composite indexes)
- Process in smaller batches
- Increase timeout (max 9 minutes for scheduled)

### Issue 2: Memory Limit

**Symptom:** Function crashes with OOM error
**Solution:**

- Increase memory allocation (512MB → 1GB → 2GB)
- Process fewer auctions per batch
- Clear references to large objects

### Issue 3: Permission Denied

**Symptom:** Cannot access Firestore collections
**Solution:**

- Verify Firebase Admin SDK initialized
- Check Firestore rules
- Ensure function has correct service account

### Issue 4: Schedule Not Running

**Symptom:** Function doesn't run at expected time
**Solution:**

- Check Cloud Scheduler in GCP Console
- Verify timezone setting
- Check function deployment status

## Success Metrics

After 1 week, you should see:

- ✅ 10,080 successful invocations (7 days × 24 hours × 60 minutes)
- ✅ Average execution time < 5 seconds
- ✅ Error rate < 1%
- ✅ Cost < $1
- ✅ Latency improved (Mumbai region)

## Conclusion

The migration is complete! Firebase Functions provide:

- ✅ Better reliability
- ✅ Lower latency for Indian users
- ✅ More control and monitoring
- ✅ Cost-effective pricing
- ✅ Independent of Next.js deployment

## Support

If you encounter issues:

1. Check Firebase Functions logs
2. Review this migration guide
3. Test locally with emulator
4. Consult Firebase Functions documentation
5. Consider temporary rollback to Vercel
