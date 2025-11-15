# Firebase Functions for JustForView.in

This directory contains Firebase Cloud Functions for background tasks and scheduled jobs.

## Setup

1. Install dependencies:

```bash
npm run setup:firebase-functions
```

2. Build the functions:

```bash
npm run functions:build
```

## Available Functions

### Scheduled Functions

#### `processAuctions`

- **Schedule**: Every 1 minute
- **Description**: Processes ended auctions, determines winners, creates orders
- **Region**: asia-south1 (Mumbai)
- **Memory**: 1GB
- **Timeout**: 9 minutes

### Callable Functions

#### `triggerAuctionProcessing`

- **Type**: HTTP Callable
- **Auth**: Required (Admin only)
- **Description**: Manually trigger auction processing for testing

## Development

### Run locally with emulator:

```bash
npm run functions:serve
```

### Watch mode (auto-rebuild):

```bash
cd functions
npm run build:watch
```

### Test locally:

```bash
firebase emulators:start --only functions
```

## Deployment

### Deploy all functions:

```bash
npm run functions:deploy
```

### Deploy specific function:

```bash
firebase deploy --only functions:processAuctions
```

### Deploy from root:

```bash
npm run deploy:firebase
```

## Monitoring

### View logs in real-time:

```bash
npm run functions:logs
```

### View specific function logs:

```bash
firebase functions:log --only processAuctions
```

### View logs in Firebase Console:

https://console.firebase.google.com/project/YOUR_PROJECT_ID/functions/logs

## Environment Variables

Firebase Functions automatically have access to:

- Firebase Admin SDK (initialized in index.ts)
- Firestore database
- All Firebase services

## Cron Schedule

The `processAuctions` function runs every minute:

- Checks for auctions with `status: "live"` and `end_time <= now`
- Determines winner (highest bid)
- Checks reserve price
- Creates order for winner
- Updates inventory
- Sends notifications (TODO)

## Cost Optimization

Current configuration:

- **Region**: asia-south1 (lowest latency for India)
- **Memory**: 1GB (balance between performance and cost)
- **Timeout**: 9 minutes (max for scheduled functions)
- **Frequency**: Every 1 minute

Estimated cost (India pricing):

- ~43,800 invocations/month
- ~$0.40/month for invocations
- Compute time depends on auction volume

## Migration from Vercel Cron

### Before (Vercel):

- Cron job configured in `vercel.json`
- HTTP endpoint: `/api/cron/process-auctions`
- Called by Vercel's cron service
- Limited to Vercel's regions

### After (Firebase):

- Scheduled function using Cloud Scheduler
- No HTTP endpoint needed
- Runs in asia-south1 (Mumbai)
- Better latency for Indian users
- More flexible configuration

### API Endpoints Removed:

- ❌ `/api/cron/process-auctions` - Replaced by Firebase Function
- ✅ `/api/auctions/cron` - Keep for manual admin triggers (calls Firebase callable)

## Security

Firebase Functions automatically:

- ✅ Authenticate with Firebase Admin SDK
- ✅ Have access to service account credentials
- ✅ Run in isolated environment
- ✅ Support auth context for callable functions

## Troubleshooting

### Function not deploying:

```bash
# Check logs
firebase functions:log

# Verify Firebase project
firebase use --add

# Re-deploy
npm run functions:deploy
```

### Function timing out:

- Increase `timeoutSeconds` in function configuration
- Optimize batch processing
- Add pagination for large result sets

### High costs:

- Review function invocations in Firebase Console
- Optimize function memory allocation
- Consider batching operations
- Add request throttling

## Next Steps

1. ✅ Functions created and deployed
2. ⏳ Remove Vercel cron endpoint (optional - keep for fallback)
3. ⏳ Update admin dashboard to call Firebase callable function
4. ⏳ Add email/SMS notifications in auction processing
5. ⏳ Monitor costs and optimize as needed
