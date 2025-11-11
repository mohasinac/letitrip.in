# Environment Variables Setup & Deployment Guide

## ✅ Your Deployment Is Already Live!

**Production URL:** https://letitrip-4y8ljbwnj-mohasin-ahamed-chinnapattans-projects.vercel.app

The deployment completed successfully! However, the environment variables from `.env.local` need to be synced to Vercel production.

## Quick Fix: Sync Environment Variables

### Option 1: Bulk Set (Recommended)

```powershell
# Test what will be set (dry run)
npm run sync:env:bulk:dry-run

# Actually set all variables
npm run sync:env:bulk
```

This will:
- Read all 50 variables from `.env.local`
- Set them one by one in Vercel production
- Show progress for each variable
- Display a summary at the end

### Option 2: Manual via Vercel Dashboard

1. Go to: https://vercel.com/dashboard
2. Select your project: `letitrip-in`
3. Go to: Settings → Environment Variables
4. Add variables manually from `.env.local`

## Available Commands

### Environment Variable Sync

| Command | Description |
|---------|-------------|
| `npm run sync:env:bulk` | Bulk set all variables from `.env.local` |
| `npm run sync:env:bulk:dry-run` | Preview what variables will be set |
| `npm run sync:env` | Alternative sync method |
| `npm run sync:env:production` | Sync from `.env.production` |

### Deployment Commands

| Command | Description |
|---------|-------------|
| `npm run deploy:prod` | Full deployment (updates env + deploys) |
| `npm run deploy:prod:skip-env` | Deploy without updating env vars |
| `npm run deploy:prod:force` | Force deploy even if env update fails |

## Your Current Setup

### ✅ What's Already Done

1. **Project Linked to Vercel** ✓
   - Project: `letitrip-in`
   - Scope: Mohasin Ahamed Chinnapattan's projects

2. **First Deployment Successful** ✓
   - URL: https://letitrip-4y8ljbwnj-mohasin-ahamed-chinnapattans-projects.vercel.app
   - Status: Live

3. **Scripts Created** ✓
   - `scripts/deploy-to-vercel-prod.ps1` - Main deployment script
   - `scripts/bulk-set-vercel-env.js` - Bulk env variable setter
   - `scripts/sync-env-to-vercel.js` - Alternative sync method

### ⚠️ What Needs to Be Done

1. **Sync Environment Variables** from `.env.local` to Vercel production
2. **Redeploy** after setting variables

## Step-by-Step: Complete Setup

### Step 1: Sync Environment Variables

```powershell
# See what will be set
npm run sync:env:bulk:dry-run
```

This shows all 50 variables from `.env.local` that will be set.

```powershell
# Actually set them
npm run sync:env:bulk
```

This will take 2-3 minutes as it sets each variable one by one.

### Step 2: Deploy Again

After setting environment variables:

```powershell
# Deploy to production (skip env update since we just did it)
npm run deploy:prod:skip-env
```

Or use Vercel CLI directly:

```powershell
vercel --prod
```

### Step 3: Verify

Visit your production URL and test that everything works with the new environment variables.

## Environment Files

You have three environment files:

1. **`.env.local`** (50 variables)
   - Local development configuration
   - Most complete set of variables
   - **Use this for Vercel production**

2. **`.env.production`** (21 variables)
   - Production-specific configuration
   - Subset of variables
   - Used for reference

3. **`.env.local.example`**
   - Template file
   - For documentation

## What Each File Contains

### From .env.local (50 variables):

- Firebase Admin & Client SDK (15 vars)
- JWT & Authentication (3 vars)
- Razorpay Payment Gateway (3 vars)
- Shiprocket Shipping (4 vars)
- API Configuration (3 vars)
- Site Configuration (3 vars)
- NextAuth (2 vars)
- Feature Flags (1 var)
- Rate Limiting (2 vars)
- File Upload (2 vars)
- Coupon System (2 vars)
- Email (SMTP) (4 vars)
- Analytics & Monitoring (2 vars)
- Gaming/Socket URLs (2 vars)
- Session Secret (1 var)
- Environment (1 var)

### From .env.production (21 variables):

- Subset focused on production Firebase config
- API URLs pointing to production domain
- Production-specific secrets

## Recommended Approach

**Use `.env.local` for Vercel** because it has:
- ✅ Complete Firebase configuration (Admin + Client)
- ✅ All payment gateway credentials
- ✅ All service integrations
- ✅ Complete feature set

**Then update production-specific values manually:**
- `NEXT_PUBLIC_API_URL` → `https://letitrip.in/api`
- `NEXT_PUBLIC_SITE_URL` → `https://letitrip.in`
- `NEXTAUTH_URL` → `https://letitrip.in`
- `NODE_ENV` → `production`

## Quick Reference Commands

```powershell
# Full automated deployment
npm run deploy:prod

# Sync env vars from .env.local
npm run sync:env:bulk

# Deploy without env update
npm run deploy:prod:skip-env

# Check what would be deployed (dry run)
npm run sync:env:bulk:dry-run

# Manual Vercel commands
vercel --prod              # Deploy to production
vercel env ls production   # List production env vars
vercel env pull            # Download env vars
```

## Troubleshooting

### Issue: Environment variables not setting

**Solution:** Use the bulk setter:
```powershell
npm run sync:env:bulk
```

### Issue: Deployment fails

**Check these:**
1. Run `npm run build` locally first
2. Check for TypeScript errors
3. Verify all required env vars are set

### Issue: App works locally but not in production

**Likely cause:** Missing environment variables

**Solution:**
1. Compare local vs production env vars
2. Set missing vars in Vercel dashboard
3. Redeploy

## Next Steps

1. **Right Now:**
   ```powershell
   npm run sync:env:bulk
   ```

2. **After env vars are set:**
   ```powershell
   npm run deploy:prod:skip-env
   ```

3. **Verify deployment:**
   - Visit your production URL
   - Test key features
   - Check browser console for errors

4. **Update production-specific URLs:**
   - Go to Vercel Dashboard
   - Update API_URL, SITE_URL to production domain
   - Redeploy

## Files Created

- ✅ `scripts/deploy-to-vercel-prod.ps1` - Automated deployment
- ✅ `scripts/bulk-set-vercel-env.js` - Bulk env setter
- ✅ `scripts/sync-env-to-vercel.js` - Alternative sync
- ✅ `scripts/sync-env-to-vercel.ps1` - PowerShell version
- ✅ `scripts/set-vercel-env-from-local.ps1` - Interactive setter
- ✅ `docs/VERCEL-DEPLOYMENT.md` - Full deployment guide
- ✅ `docs/ENV-SYNC-GUIDE.md` - This file

## Summary

✅ **Deployment successful** - Your app is live!  
⚠️ **Environment variables need syncing** - Run `npm run sync:env:bulk`  
🚀 **Ready to go** - After syncing, redeploy and you're done!

Your production URL:
**https://letitrip-4y8ljbwnj-mohasin-ahamed-chinnapattans-projects.vercel.app**
