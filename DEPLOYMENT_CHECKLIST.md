# 🚀 Split Deployment Checklist

Use this checklist to ensure a smooth deployment to Render + Vercel.

---

## Pre-Deployment

- [ ] All code changes committed
- [ ] Tested locally with `npm run dev`
- [ ] No errors in browser console
- [ ] Multiplayer works in two browser windows
- [ ] `.env.local` created (not committed)
- [ ] Firebase configuration updated (if using)

---

## Part 1: Deploy Socket Server to Render

### Setup

- [ ] Created Render account at https://render.com
- [ ] Connected GitHub account to Render
- [ ] Authorized Render to access repository

### Create Web Service

- [ ] Clicked "New +" → "Web Service"
- [ ] Selected repository: `mohasinac/justforview.in`
- [ ] Selected branch: `breadcrumbs`
- [ ] Configured service:
  - [ ] Name: `beyblade-socket-server` (or custom name)
  - [ ] Runtime: Node
  - [ ] Build Command: `npm install`
  - [ ] Start Command: `node socket-server.js`
- [ ] Selected plan (Free or Starter $7/month)

### Environment Variables

- [ ] Added `NODE_ENV=production`
- [ ] Added `ALLOWED_ORIGINS=http://localhost:3000` (temporary, will update later)

### Deploy

- [ ] Clicked "Create Web Service"
- [ ] Waited for deployment (3-5 minutes)
- [ ] Got deployment URL: `https://______.onrender.com`
- [ ] Saved URL for later use

### Test Socket Server

- [ ] Visited health endpoint: `https://your-service.onrender.com/health`
- [ ] Confirmed response shows:
  ```json
  {
    "status": "ok",
    "service": "Beyblade Game Socket Server"
  }
  ```
- [ ] Checked Render logs for any errors

**Socket Server URL**: `_________________________________`

---

## Part 2: Deploy Next.js to Vercel

### Setup

- [ ] Installed Vercel CLI: `npm install -g vercel`
- [ ] Logged in: `vercel login`

### First Deployment

- [ ] Ran `vercel` in project directory
- [ ] Answered setup questions:
  - [ ] Set up and deploy? **Yes**
  - [ ] Which scope? **Your account**
  - [ ] Link to existing project? **No**
  - [ ] Project name? **justforview** (or custom)
  - [ ] Directory? **./`**
  - [ ] Override settings? **No**

### Production Deployment

- [ ] Ran `vercel --prod`
- [ ] Waited for deployment (2-3 minutes)
- [ ] Got deployment URL: `https://______.vercel.app`
- [ ] Saved URL for later use

**Vercel URL**: `_________________________________`

### Set Environment Variable

Choose **Option A** or **Option B**:

**Option A: Via Dashboard**

- [ ] Went to https://vercel.com/dashboard
- [ ] Selected project
- [ ] Went to Settings → Environment Variables
- [ ] Added variable:
  - [ ] Name: `NEXT_PUBLIC_SOCKET_URL`
  - [ ] Value: Your Render URL (from Part 1)
  - [ ] Environments: Production, Preview, Development
- [ ] Clicked Save
- [ ] Redeployed: Deployments → ⋯ → Redeploy

**Option B: Via CLI**

- [ ] Ran `vercel env add NEXT_PUBLIC_SOCKET_URL production`
- [ ] Pasted Render URL when prompted
- [ ] Repeated for preview: `vercel env add NEXT_PUBLIC_SOCKET_URL preview`
- [ ] Repeated for development: `vercel env add NEXT_PUBLIC_SOCKET_URL development`
- [ ] Redeployed: `vercel --prod`

### Verify Environment Variable

- [ ] Ran `vercel env ls` to confirm variable is set
- [ ] Variable appears in all environments

---

## Part 3: Update CORS Settings

### Back to Render

- [ ] Went to Render dashboard
- [ ] Selected socket server service
- [ ] Went to Environment tab
- [ ] Edited `ALLOWED_ORIGINS` variable
- [ ] Updated value to include Vercel URL:
  ```
  https://your-app.vercel.app,https://www.your-domain.com
  ```
- [ ] Clicked "Save Changes"
- [ ] Waited for auto-redeploy (1-2 minutes)

---

## Part 4: Test Production Deployment

### Basic Tests

- [ ] Visited Vercel URL
- [ ] Page loads without errors
- [ ] No console errors (F12 → Console)
- [ ] Homepage displays correctly
- [ ] Navigation works

### Socket Connection Test

- [ ] Opened DevTools (F12) → Console
- [ ] Looked for Socket.IO connection messages
- [ ] No CORS errors
- [ ] Connection status shows "connected"

### Multiplayer Test

- [ ] Clicked "Play Multiplayer" or navigated to `/game`
- [ ] Entered player name
- [ ] Opened incognito/private window
- [ ] Navigated to same URL
- [ ] Entered different player name
- [ ] Both players matched successfully
- [ ] Can select Beyblades
- [ ] Game starts without errors
- [ ] Both players can control their Beyblades
- [ ] Attacks and dodges work
- [ ] Connection is stable

### Cross-Device Test (Optional but Recommended)

- [ ] Tested on different device/network
- [ ] Tested on mobile browser
- [ ] Multiplayer works across devices

---

## Part 5: Final Configuration

### Custom Domain (Optional)

- [ ] Added custom domain in Vercel
- [ ] Updated DNS records
- [ ] Updated `ALLOWED_ORIGINS` in Render with new domain
- [ ] Tested with custom domain

### Monitoring Setup

- [ ] Bookmarked Render dashboard
- [ ] Bookmarked Vercel dashboard
- [ ] Set up uptime monitoring (optional)
- [ ] Configured error alerts (optional)

### Performance Optimization

- [ ] Reviewed Render logs for any issues
- [ ] Reviewed Vercel deployment logs
- [ ] Checked Vercel Analytics (if enabled)
- [ ] Confirmed acceptable cold start time (if using Render free tier)

---

## Part 6: Enable Auto-Deployment (Optional)

### Render Auto-Deploy

- [ ] Render dashboard → Service Settings
- [ ] Verified "Auto-Deploy" is enabled for `breadcrumbs` branch
- [ ] Test: Made small commit, pushed, verified auto-deploy

### Vercel Auto-Deploy

- [ ] Vercel dashboard → Project Settings → Git
- [ ] Connected GitHub repository
- [ ] Enabled automatic deployments for `breadcrumbs` branch
- [ ] Test: Made small commit, pushed, verified auto-deploy

---

## Documentation

### Update README

- [ ] Updated `README.md` with actual URLs
- [ ] Updated socket server URL
- [ ] Updated Vercel app URL

### Save Credentials

- [ ] Documented Render service name
- [ ] Documented Vercel project name
- [ ] Saved environment variables securely
- [ ] Updated team documentation (if applicable)

---

## Troubleshooting

### If Socket Connection Fails:

- [ ] Check `NEXT_PUBLIC_SOCKET_URL` in Vercel env vars
- [ ] Verify Render service is running (not sleeping)
- [ ] Check `ALLOWED_ORIGINS` in Render includes Vercel URL
- [ ] Test health endpoint directly
- [ ] Review Render logs for errors
- [ ] Clear browser cache and retry

### If Build Fails:

- [ ] Review error logs in dashboard
- [ ] Verify `socket-server.js` exists
- [ ] Check `package.json` has correct dependencies
- [ ] Try rebuilding: "Manual Deploy" → "Clear cache and deploy"

### If CORS Errors Persist:

- [ ] Verify exact URL format (no trailing slash)
- [ ] Check both `http` and `https` in ALLOWED_ORIGINS
- [ ] Wait 2-3 minutes after saving env vars for propagation
- [ ] Force redeploy both services

---

## Success Criteria

✅ **Socket Server**

- Health endpoint returns OK
- Logs show "Socket.IO Game Server running"
- No error messages in logs

✅ **Next.js App**

- Deploys without errors
- All pages load correctly
- No console errors

✅ **Integration**

- Socket connects automatically
- Multiplayer matchmaking works
- Game plays smoothly
- Both players can interact
- No disconnections

✅ **Performance**

- Vercel app loads quickly (< 2s)
- Socket connection establishes quickly (< 5s on Render Free, < 1s on Starter)
- Game runs at 60 FPS
- No lag during gameplay

---

## Post-Deployment

- [ ] Shared game URL with testers
- [ ] Collected feedback
- [ ] Monitored for errors in first 24 hours
- [ ] Documented any issues and solutions
- [ ] Celebrated successful deployment! 🎉

---

## Cost Tracking

**Current Plan:**

- Vercel: Free / Pro ($20/month)
- Render: Free / Starter ($7/month)

**Monthly Cost**: $**\_** /month

**Next Billing Date**: ******\_\_\_******

---

## Notes

Add any deployment-specific notes, issues encountered, or customizations made:

```
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
```

---

## Useful Links

- Render Dashboard: https://dashboard.render.com
- Vercel Dashboard: https://vercel.com/dashboard
- Socket Server URL: `_________________________________`
- Vercel App URL: `_________________________________`
- GitHub Repo: https://github.com/mohasinac/justforview.in

---

**Last Updated**: ******\_\_\_******
**Deployed By**: ******\_\_\_******
**Status**: ⬜ Not Started | ⬜ In Progress | ⬜ Completed
