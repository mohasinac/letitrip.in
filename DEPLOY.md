# Deployment Guide - Production Only

This project is configured for **production-only deployments** on Vercel. No preview builds.

## Quick Start

### Method 1: Git Push (Recommended)

```bash
npm run deploy
```

This will:

1. Build the project locally to verify
2. Push to GitHub main branch
3. Trigger automatic Vercel production deployment

### Method 2: Direct Vercel Deploy

```bash
npm run deploy:prod
```

This will build and deploy directly to Vercel production.

### Method 3: Force Deploy

```bash
npm run deploy:force
```

Force deployment even if there are no changes.

## Prerequisites

### 1. Install Vercel CLI

```bash
npm install -g vercel
```

### 2. Link Project to Vercel

```bash
npm run vercel:link
```

Or manually:

```bash
vercel link
```

### 3. Set Environment Variables

```bash
npm run deploy:env
```

This syncs all production environment variables from `.env.production` to Vercel.

## Deployment Scripts

| Script                 | Description                                      |
| ---------------------- | ------------------------------------------------ |
| `npm run deploy`       | Build locally + push to GitHub (triggers Vercel) |
| `npm run deploy:prod`  | Build + deploy directly to Vercel production     |
| `npm run deploy:force` | Force deploy to Vercel production                |
| `npm run deploy:env`   | Sync environment variables to Vercel             |
| `npm run vercel:link`  | Link local project to Vercel                     |

## Environment Variables

Required environment variables for production:

### Firebase Admin (Server-side)

- `FIREBASE_ADMIN_PROJECT_ID`
- `FIREBASE_ADMIN_CLIENT_EMAIL`
- `FIREBASE_ADMIN_PRIVATE_KEY`

### Firebase Client (Browser)

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

### Authentication

- `SESSION_SECRET`
- `JWT_SECRET`

### Optional Services

- `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` (Payments)
- `SHIPROCKET_EMAIL` / `SHIPROCKET_PASSWORD` (Shipping)
- SMTP settings (Email)

## Vercel Configuration

The project is configured with:

- **Framework**: Next.js 16.0.1
- **Build Command**: `npm run build` (uses Webpack, not Turbopack)
- **Region**: Mumbai (bom1)
- **Memory**: 1024 MB for API routes
- **Max Duration**: 10 seconds per API request

## Build Details

- **Next.js Version**: 16.0.1 (latest stable)
- **React Version**: 19.2.0 (latest)
- **Build System**: Webpack (Turbopack disabled for stability)
- **TypeScript**: Strict mode enabled
- **Static Pages**: 182 pages pre-rendered
- **Build Time**: ~40 seconds

## Deployment Checklist

Before deploying:

- [ ] `npm run build` succeeds locally
- [ ] All tests pass
- [ ] Environment variables synced to Vercel
- [ ] Git repository is up to date
- [ ] No uncommitted changes

## Troubleshooting

### Build Fails on Vercel

1. Check build logs in Vercel dashboard
2. Verify all environment variables are set
3. Ensure Firebase credentials are valid
4. Check for missing dependencies

### Environment Variables Not Working

```bash
# Dry run to see what will be synced
npm run vercel:env:dry-run

# Actually sync them
npm run deploy:env
```

### Build Succeeds but Deployment Fails

- Check Vercel dashboard for actual status
- The CLI may show errors that don't affect deployment
- Always verify in dashboard: https://vercel.com/dashboard

### "Module not found" Errors

- Clear `.next` folder: `rm -rf .next`
- Reinstall dependencies: `npm install`
- Rebuild: `npm run build`

## Manual Deployment via Dashboard

1. Go to https://vercel.com/dashboard
2. Select your project
3. Click "Deployments" tab
4. Click "Redeploy" on latest deployment
5. Or push to GitHub main branch

## Post-Deployment

After successful deployment:

1. Visit your production URL
2. Test critical paths:
   - Homepage loads
   - User authentication works
   - API routes respond
   - Static assets load
3. Monitor errors in Vercel dashboard
4. Check Firestore logs for backend issues

## Support

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Next.js 16 Docs**: https://nextjs.org/docs
- **Project Issues**: Check GitHub repository

## Notes

- **No Preview Builds**: This project only deploys to production
- **Turbopack Disabled**: Using Webpack for stability in production builds
- **Git Integration**: Pushing to `main` branch automatically deploys
- **Build Time**: Approximately 40 seconds for full build
