# 🚀 Quick Deployment Reference

## One-Command Deployment

```powershell
npm run deploy:prod
```

This single command will:

- ✅ Update all 50 environment variables from `.env.local`
- ✅ Deploy to Vercel production
- ✅ Show progress and results

---

## Common Commands

### Deploy to Production

```powershell
# Full deployment with env update
npm run deploy:prod

# Deploy without updating env
npm run deploy:prod:skip-env

# Direct Vercel CLI
vercel --prod
```

### Sync Environment Variables

```powershell
# Sync all variables from .env.local
npm run sync:env:bulk

# Preview what will be synced
npm run sync:env:bulk:dry-run

# Sync from .env.production instead
npm run sync:env:production
```

### Check Status

```powershell
# List production environment variables
vercel env ls production

# View deployments
vercel ls

# Open Vercel dashboard
start https://vercel.com/dashboard
```

---

## Your Production URLs

**Latest Deployment:** https://letitrip-qy770hsxi-mohasin-ahamed-chinnapattans-projects.vercel.app

**Inspect URL:** https://vercel.com/mohasin-ahamed-chinnapattans-projects/letitrip-in/7YLWNNpoanBNskx7rk9fmChewQ4A

---

## Environment Variables Status

✅ **All 50 variables synced successfully!**

From: `.env.local`  
To: Vercel Production Environment

---

## Next Actions

### 1. Wait for Build to Complete

The deployment is currently building. Check status at the Inspect URL above.

### 2. Update Production URLs

After deployment completes, update these environment variables in Vercel Dashboard:

```bash
NEXT_PUBLIC_API_URL → https://letitrip.in/api
NEXT_PUBLIC_SITE_URL → https://letitrip.in
NEXTAUTH_URL → https://letitrip.in
NODE_ENV → production
```

Then redeploy:

```powershell
npm run deploy:prod:skip-env
```

### 3. Test Your Application

Visit your production URL and verify:

- ✅ Home page loads
- ✅ Authentication works
- ✅ Products display correctly
- ✅ Firebase connection works
- ✅ No console errors

---

## Documentation

- **Full Guide:** `docs/VERCEL-DEPLOYMENT.md`
- **Environment Sync:** `docs/ENV-SYNC-GUIDE.md`
- **Success Summary:** `docs/DEPLOYMENT-SUCCESS.md`
- **This Reference:** `docs/QUICK-DEPLOY-REFERENCE.md`

---

## Troubleshooting

### Build Fails

```powershell
# Test locally first
npm run build

# Check for errors
npm run type-check
```

### Environment Variable Issues

```powershell
# Verify variables are set
vercel env ls production

# Re-sync if needed
npm run sync:env:bulk
```

### Deployment Stuck

- Check Vercel Dashboard for logs
- Visit the Inspect URL
- Try redeploying: `vercel --prod`

---

## Scripts Created

All deployment automation scripts are in `scripts/` directory:

- `deploy-to-vercel-prod.ps1` - Main deployment automation
- `bulk-set-vercel-env.js` - Bulk environment variable setter
- `sync-env-to-vercel.js` - Alternative sync method
- `sync-env-to-vercel.ps1` - PowerShell sync version

---

## Success! 🎉

You now have a fully automated deployment system for your Next.js auction platform.

**Deploy anytime with one command:**

```powershell
npm run deploy:prod
```
