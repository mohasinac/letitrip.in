# 🎯 Deployment Workflow - Visual Guide

## Files and Their Purpose

```
📁 justforview.in/
│
├── 🎮 GAME SERVER FILES
│   ├── socket-server.js         ⭐ Deploy to Render
│   ├── server.js                   (Combined - backup option)
│   └── render.yaml                 (Optional Render config)
│
├── 🌐 FRONTEND FILES
│   ├── src/                     ⭐ Deploy to Vercel
│   ├── public/
│   ├── next.config.js
│   └── vercel.json
│
├── 📚 DEPLOYMENT DOCS
│   ├── SETUP_SUMMARY.md         ⭐ START HERE (Overview of setup)
│   ├── SPLIT_DEPLOYMENT_GUIDE.md ⭐ STEP-BY-STEP (Complete guide)
│   ├── DEPLOYMENT_CHECKLIST.md   ⭐ TRACK PROGRESS (Interactive)
│   ├── DEPLOYMENT_QUICK_REFERENCE.md  (Quick lookup)
│   ├── DEPLOYMENT_SUMMARY.md     (Options overview)
│   ├── DEPLOYMENT_GUIDE.md       (Original Render guide)
│   └── VERCEL_DEPLOYMENT.md      (Vercel info)
│
├── 📝 PROJECT DOCS
│   ├── README.md                ⭐ Project overview
│   ├── package.json             (Scripts & dependencies)
│   └── .env.example             (Environment template)
│
└── 📋 CONFIGURATION
    ├── .gitignore
    ├── tsconfig.json
    └── tailwind.config.js
```

---

## Quick Start Guide

### 🚀 For First-Time Deployment

```
1. Read SETUP_SUMMARY.md
   └─> Understand what was created and why

2. Read SPLIT_DEPLOYMENT_GUIDE.md
   └─> Learn the deployment process

3. Use DEPLOYMENT_CHECKLIST.md
   └─> Follow step-by-step and check off tasks

4. Refer to DEPLOYMENT_QUICK_REFERENCE.md
   └─> Look up commands as needed
```

### 🔄 For Updates/Redeployment

```
1. DEPLOYMENT_QUICK_REFERENCE.md
   └─> Get commands quickly

2. Git commit and push
   └─> Auto-deploys to both platforms
```

---

## Deployment Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    YOUR LOCAL MACHINE                        │
│                                                              │
│  📝 Make changes                                             │
│  ├─> Edit code                                               │
│  ├─> Test locally: npm run dev                               │
│  └─> Commit: git commit -m "Update"                          │
│                                                              │
│  📤 Push to GitHub                                           │
│  └─> git push origin breadcrumbs                             │
└──────────────┬───────────────────────┬────────────────────────┘
               │                       │
               │                       │
      ┌────────▼────────┐     ┌────────▼─────────┐
      │   RENDER.COM    │     │   VERCEL.COM     │
      │                 │     │                  │
      │  Auto-deploys   │     │  Auto-deploys    │
      │  socket-server  │     │  Next.js app     │
      └────────┬────────┘     └────────┬─────────┘
               │                       │
               │                       │
               │    ┌──────────────────┘
               │    │
        ┌──────▼────▼───────┐
        │   PRODUCTION       │
        │                    │
        │  🌐 Vercel serves  │
        │     frontend       │
        │                    │
        │  🎮 Render handles │
        │     WebSockets     │
        │                    │
        │  👥 Users play     │
        │     multiplayer    │
        └────────────────────┘
```

---

## Step-by-Step Workflow

### Phase 1: Initial Setup (One Time)

```
Step 1: Prepare Repository
┌─────────────────────────────────────┐
│ git add .                           │
│ git commit -m "Split deployment"    │
│ git push origin breadcrumbs         │
└─────────────────────────────────────┘
         ↓
Step 2: Deploy Socket Server (Render)
┌─────────────────────────────────────┐
│ 1. Go to render.com                 │
│ 2. New Web Service                  │
│ 3. Connect GitHub repo              │
│ 4. Build: npm install               │
│ 5. Start: node socket-server.js     │
│ 6. Add env vars:                    │
│    - NODE_ENV=production            │
│    - ALLOWED_ORIGINS=localhost      │
│ 7. Deploy and wait                  │
│ 8. Copy URL                         │
└─────────────────────────────────────┘
         ↓
Step 3: Deploy Next.js (Vercel)
┌─────────────────────────────────────┐
│ 1. npm install -g vercel            │
│ 2. vercel login                     │
│ 3. vercel --prod                    │
│ 4. Add env var:                     │
│    NEXT_PUBLIC_SOCKET_URL=          │
│    https://your-socket.onrender.com │
│ 5. Redeploy: vercel --prod          │
└─────────────────────────────────────┘
         ↓
Step 4: Connect Services
┌─────────────────────────────────────┐
│ 1. Update ALLOWED_ORIGINS in Render│
│    Add: https://your-app.vercel.app │
│ 2. Wait for redeploy                │
│ 3. Test health endpoint             │
│ 4. Test multiplayer                 │
└─────────────────────────────────────┘
         ↓
Step 5: Verify
┌─────────────────────────────────────┐
│ ✓ Socket health check OK            │
│ ✓ Frontend loads                    │
│ ✓ Socket connects                   │
│ ✓ Multiplayer works                 │
└─────────────────────────────────────┘
```

### Phase 2: Updates (Ongoing)

```
Make Changes
     ↓
git commit && git push
     ↓
Both platforms auto-deploy
     ↓
Test production
```

---

## Environment Variables Flow

```
DEVELOPMENT (Local)
┌──────────────────────────────────────┐
│ .env.local (create this)             │
│ ┌──────────────────────────────────┐ │
│ │ NEXT_PUBLIC_SOCKET_URL=          │ │
│ │ http://localhost:3000            │ │
│ └──────────────────────────────────┘ │
└──────────────────────────────────────┘
            ↓
     Used by: npm run dev
            ↓
   http://localhost:3000


PRODUCTION (Split)
┌────────────────────────┐  ┌──────────────────────────┐
│ RENDER                 │  │ VERCEL                   │
│ ┌────────────────────┐ │  │ ┌──────────────────────┐ │
│ │ NODE_ENV=          │ │  │ │ NEXT_PUBLIC_SOCKET_  │ │
│ │ production         │ │  │ │ URL=https://your-    │ │
│ │                    │ │  │ │ socket.onrender.com  │ │
│ │ ALLOWED_ORIGINS=   │ │  │ └──────────────────────┘ │
│ │ https://your-app   │ │  └──────────────────────────┘
│ │ .vercel.app        │ │              ↓
│ └────────────────────┘ │      Used by: Frontend
└────────────────────────┘       Connects to Render
            ↓
   Used by: Socket Server
    Allows Vercel CORS
```

---

## Testing Strategy

```
1. LOCAL TESTING
┌────────────────────────────────────┐
│ npm run dev                        │
│ Open: http://localhost:3000        │
│ Test: All features work            │
└────────────────────────────────────┘

2. SOCKET SERVER TESTING (Render)
┌────────────────────────────────────┐
│ Visit: /health endpoint            │
│ Check: Status = "ok"               │
│ Verify: Logs show no errors        │
└────────────────────────────────────┘

3. FRONTEND TESTING (Vercel)
┌────────────────────────────────────┐
│ Visit: Vercel URL                  │
│ Check: Page loads                  │
│ Console: No errors                 │
└────────────────────────────────────┘

4. INTEGRATION TESTING
┌────────────────────────────────────┐
│ Browser 1: Open game               │
│ Browser 2: Open incognito          │
│ Test: Both can join                │
│ Test: Multiplayer works            │
└────────────────────────────────────┘

5. CROSS-DEVICE TESTING
┌────────────────────────────────────┐
│ Different networks                 │
│ Mobile devices                     │
│ Different browsers                 │
└────────────────────────────────────┘
```

---

## Troubleshooting Decision Tree

```
Problem: Socket won't connect
         ↓
    Check Vercel env vars
    NEXT_PUBLIC_SOCKET_URL set?
         ↓
    Yes  │  No → Set it in Vercel dashboard
         ↓
    Check Render ALLOWED_ORIGINS
    Includes Vercel URL?
         ↓
    Yes  │  No → Add Vercel URL to ALLOWED_ORIGINS
         ↓
    Test /health endpoint
    Returns "ok"?
         ↓
    Yes  │  No → Check Render logs, redeploy
         ↓
    Clear browser cache
    Try incognito
         ↓
    Still broken? → Check full guide


Problem: CORS errors
         ↓
    Verify exact URLs
    No trailing slashes?
         ↓
    Yes  │  No → Remove trailing slashes
         ↓
    Includes https://?
         ↓
    Yes  │  No → Add https:// prefix
         ↓
    Wait 2-3 minutes
    (env vars need to propagate)
         ↓
    Force redeploy both services
         ↓
    Still broken? → Check Render logs


Problem: Render sleeping
         ↓
    Free tier?
         ↓
    Yes  │  No → Check other issues
         ↓
    Expected behavior
    First request takes 30-50s
         ↓
    Want always-on?
         ↓
    Upgrade to Starter ($7/month)
```

---

## Command Quick Reference

### Development

```powershell
# Combined server (original)
npm run dev

# Split servers (test deployment setup)
npm run dev:socket    # Terminal 1
npm run dev:next      # Terminal 2
```

### Deployment

```powershell
# Commit and push
git add .
git commit -m "Update"
git push origin breadcrumbs

# Deploy to Vercel
vercel --prod

# Check Vercel env vars
vercel env ls

# Add env var to Vercel
vercel env add NEXT_PUBLIC_SOCKET_URL production
```

### Testing

```powershell
# Test socket health
curl https://your-socket.onrender.com/health

# Or in browser
https://your-socket.onrender.com/health
```

---

## Success Checklist

```
PRE-DEPLOYMENT
□ Code tested locally
□ No console errors
□ Multiplayer works locally
□ All changes committed

RENDER DEPLOYMENT
□ Service created
□ Build successful
□ /health returns OK
□ Logs show no errors
□ URL saved

VERCEL DEPLOYMENT
□ Build successful
□ All pages load
□ Env var set correctly
□ URL saved

INTEGRATION
□ Socket connects
□ No CORS errors
□ Multiplayer matchmaking works
□ Game plays smoothly

POST-DEPLOYMENT
□ Tested from different networks
□ Tested on mobile
□ Monitoring set up
□ Documentation updated
```

---

## Document Usage by Role

### 🎯 For You (Developer)

**First time:**

1. SETUP_SUMMARY.md
2. SPLIT_DEPLOYMENT_GUIDE.md
3. DEPLOYMENT_CHECKLIST.md

**Daily work:**

- DEPLOYMENT_QUICK_REFERENCE.md
- README.md

### 👥 For Team Members

**Onboarding:**

1. README.md
2. SETUP_SUMMARY.md

**Contributing:**

- README.md (development setup)
- .env.example (environment variables)

### 📊 For DevOps/Deployment

- DEPLOYMENT_CHECKLIST.md
- DEPLOYMENT_QUICK_REFERENCE.md
- Monitor Render and Vercel dashboards

---

## URLs to Bookmark

After deployment, save these:

```
📌 PRODUCTION URLS
Socket Server:  https://____________.onrender.com
Frontend:       https://____________.vercel.app
Health Check:   https://____________.onrender.com/health

📌 DASHBOARDS
Render:         https://dashboard.render.com
Vercel:         https://vercel.com/dashboard
GitHub:         https://github.com/mohasinac/justforview.in

📌 DOCUMENTATION
This Repo:      /WORKFLOW_GUIDE.md
Deployment:     /SPLIT_DEPLOYMENT_GUIDE.md
Checklist:      /DEPLOYMENT_CHECKLIST.md
Quick Ref:      /DEPLOYMENT_QUICK_REFERENCE.md
```

---

## Monthly Maintenance

```
WEEK 1
□ Check Render logs for errors
□ Check Vercel analytics
□ Monitor performance

WEEK 2
□ Review player capacity
□ Check for updates (dependencies)
□ Test multiplayer

WEEK 3
□ Backup configuration
□ Review costs
□ Update documentation

WEEK 4
□ Plan improvements
□ Security updates
□ Performance optimization
```

---

## Need Help?

### Quick Issues

→ DEPLOYMENT_QUICK_REFERENCE.md

### Step-by-Step Help

→ SPLIT_DEPLOYMENT_GUIDE.md

### Track Progress

→ DEPLOYMENT_CHECKLIST.md

### Understand Setup

→ SETUP_SUMMARY.md

### General Info

→ README.md

---

**You're all set! 🚀**

Follow the workflow, use the checklists, and refer to the guides as needed.

Good luck with your deployment!
