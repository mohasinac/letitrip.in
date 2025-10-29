# 🚀 Split Deployment Guide: Render + Vercel

Deploy your Socket.IO game server on **Render** and your Next.js app on **Vercel** for the best of both worlds!

---

## 📋 Overview

- **Render**: Hosts the Socket.IO game server (WebSocket support)
- **Vercel**: Hosts the Next.js frontend (fast global CDN)
- **Communication**: Frontend connects to Render's WebSocket server

---

## Part 1: Deploy Socket Server to Render (15 minutes)

### Step 1: Prepare Your Repository

```powershell
# Make sure all changes are committed
git add .
git commit -m "Add split deployment configuration"
git push origin breadcrumbs
```

### Step 2: Create Render Account

1. Go to https://render.com
2. Click **"Get Started for Free"**
3. Sign up with GitHub (recommended)
4. Authorize Render to access your repositories

### Step 3: Create Web Service

1. Click **"New +"** → **"Web Service"**
2. Connect your repository: `mohasinac/justforview.in`
3. Select branch: `breadcrumbs`
4. Configure service:

   ```
   Name: beyblade-socket-server (or your preferred name)
   Region: Choose closest to your users
   Branch: breadcrumbs
   Root Directory: (leave empty)
   Runtime: Node
   Build Command: npm install
   Start Command: node socket-server.js
   ```

5. Select **Plan**:
   - **Free**: Server spins down after 15min inactivity (good for testing)
   - **Starter ($7/month)**: Always on (recommended for production)

### Step 4: Set Environment Variables

Click **"Advanced"** → **"Add Environment Variable"**:

| Key               | Value                                                       |
| ----------------- | ----------------------------------------------------------- |
| `NODE_ENV`        | `production`                                                |
| `ALLOWED_ORIGINS` | `https://justforview.vercel.app,https://www.justforview.in` |

> **Note**: Update `ALLOWED_ORIGINS` with your actual Vercel domain once deployed

### Step 5: Deploy

1. Click **"Create Web Service"**
2. Wait 3-5 minutes for build and deployment
3. Once deployed, you'll get a URL like: `https://beyblade-socket-server.onrender.com`

### Step 6: Test Socket Server

Visit your Render URL to see the health check:

```
https://your-service.onrender.com/health
```

You should see:

```json
{
  "status": "ok",
  "service": "Beyblade Game Socket Server",
  "players": 0,
  "rooms": 0,
  "capacity": {
    "players": "0/20",
    "rooms": "0/10"
  }
}
```

✅ **Socket server is ready!** Copy your Render URL.

---

## Part 2: Deploy Next.js App to Vercel (10 minutes)

### Step 1: Update Socket URL Locally

Create/update `.env.local` (don't commit this file):

```bash
NEXT_PUBLIC_SOCKET_URL=https://your-service.onrender.com
```

Replace `your-service.onrender.com` with your actual Render URL.

### Step 2: Test Locally

```powershell
# Start Next.js only (without socket server)
npm run build
npx next start

# In browser, go to http://localhost:3000
# Try multiplayer - it should connect to Render
```

### Step 3: Install Vercel CLI

```powershell
npm install -g vercel
```

### Step 4: Deploy to Vercel

```powershell
# Login to Vercel
vercel login

# Deploy (first time - will ask questions)
vercel

# When prompted:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? justforview
# - Directory? ./
# - Override settings? No

# For production deployment
vercel --prod
```

### Step 5: Set Environment Variables in Vercel

**Option A: Via Dashboard**

1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add:
   ```
   Name: NEXT_PUBLIC_SOCKET_URL
   Value: https://your-service.onrender.com
   Environment: Production, Preview, Development
   ```
5. Click **Save**
6. Redeploy: **Deployments** → **⋯** → **Redeploy**

**Option B: Via CLI**

```powershell
# Set environment variable
vercel env add NEXT_PUBLIC_SOCKET_URL production

# Paste your Render URL when prompted
# Example: https://beyblade-socket-server.onrender.com

# Also set for preview and development
vercel env add NEXT_PUBLIC_SOCKET_URL preview
vercel env add NEXT_PUBLIC_SOCKET_URL development

# Redeploy
vercel --prod
```

### Step 6: Update CORS in Render

Go back to Render:

1. Select your socket server
2. Go to **Environment**
3. Edit `ALLOWED_ORIGINS`
4. Add your Vercel URL:
   ```
   https://justforview.vercel.app,https://your-custom-domain.com
   ```
5. Click **Save Changes** (will auto-redeploy)

---

## Part 3: Test Your Deployment

### Test Checklist

1. **Visit your Vercel URL**: `https://justforview.vercel.app`
2. **Check Socket Connection**:
   - Open browser DevTools (F12)
   - Go to Console
   - Look for Socket.IO connection messages
3. **Test Multiplayer**:
   - Click "Play Multiplayer"
   - Enter player name
   - Open in another browser/incognito window
   - Both should connect and match

### Troubleshooting

**Socket connection fails?**

1. Check environment variable in Vercel:
   ```powershell
   vercel env ls
   ```
2. Verify CORS in Render dashboard
3. Check Render logs:
   - Go to Render dashboard → Your service → Logs
4. Test socket server health endpoint

**"Server is at capacity"?**

- Your socket server is full (20 players max on free tier)
- Upgrade to Starter plan or wait for players to disconnect

**Render server sleeping (Free plan)?**

- First connection takes 30-50 seconds to wake up
- Upgrade to Starter ($7/month) for always-on

---

## 📊 Deployment Architecture

```
┌─────────────────┐
│   User Browser  │
└────────┬────────┘
         │
         ├──────────────┐
         │              │
    ┌────▼─────┐   ┌────▼─────────────┐
    │  Vercel  │   │  Render          │
    │          │   │                  │
    │ Next.js  │   │  Socket.IO       │
    │ Frontend │   │  Game Server     │
    │          │   │                  │
    │ Static   │   │  WebSocket       │
    │ Pages    │   │  Connections     │
    │ API      │   │  Game Logic      │
    │ Routes   │   │  Matchmaking     │
    └──────────┘   └──────────────────┘
```

---

## 💰 Cost Breakdown

### Option 1: Free Tier

- **Vercel**: Free (Hobby plan)
- **Render**: Free (spins down after 15min)
- **Total**: $0/month
- **Limitations**: Socket server cold starts

### Option 2: Production Ready

- **Vercel**: Free (Hobby plan)
- **Render**: $7/month (Starter plan)
- **Total**: $7/month
- **Benefits**: Always-on, no cold starts

### Option 3: Custom Domain

- **Vercel**: Free (Hobby) or $20/month (Pro)
- **Render**: $7/month
- **Domain**: ~$12/year
- **Total**: ~$8/month

---

## 🔧 Managing Your Deployment

### Update Socket Server

```powershell
# Make changes to socket-server.js
git add socket-server.js
git commit -m "Update socket server"
git push origin breadcrumbs

# Render will auto-deploy in 2-3 minutes
```

### Update Next.js App

```powershell
# Make changes to your app
git add .
git commit -m "Update frontend"
git push origin breadcrumbs

# Then deploy to Vercel
vercel --prod
```

### View Logs

**Render Logs:**

1. Go to Render dashboard
2. Click your service
3. Click **Logs** tab

**Vercel Logs:**

1. Go to Vercel dashboard
2. Click your project
3. Click **Deployments** → Select deployment → **View Function Logs**

### Monitor Performance

**Render Metrics:**

- Dashboard shows CPU, memory, and request metrics
- Set up alerts for downtime

**Vercel Analytics:**

```powershell
# Add Vercel Analytics (optional)
npm install @vercel/analytics
```

---

## 🎯 Environment Variables Reference

### Render (Socket Server)

| Variable          | Value              | Required |
| ----------------- | ------------------ | -------- |
| `NODE_ENV`        | `production`       | Yes      |
| `ALLOWED_ORIGINS` | Your Vercel domain | Yes      |
| `PORT`            | Auto-set by Render | No       |

### Vercel (Next.js App)

| Variable                 | Value           | Required |
| ------------------------ | --------------- | -------- |
| `NEXT_PUBLIC_SOCKET_URL` | Your Render URL | Yes      |
| `NODE_ENV`               | `production`    | Auto-set |

---

## 🔄 Continuous Deployment

Both platforms support automatic deployments:

### Render

- Auto-deploys on every push to `breadcrumbs` branch
- Configure in **Settings** → **Build & Deploy**

### Vercel

- Auto-deploys via GitHub integration
- Link repository in Vercel dashboard
- **Settings** → **Git** → Connect Repository

To enable auto-deployment on Vercel:

```powershell
vercel git connect
```

---

## 🚨 Common Issues

### 1. Socket Connection CORS Error

**Error**: "Access to XMLHttpRequest blocked by CORS"

**Fix**: Update `ALLOWED_ORIGINS` in Render to include your Vercel domain

### 2. Environment Variable Not Working

**Error**: Socket connects to localhost

**Fix**:

1. Verify env var in Vercel: `vercel env ls`
2. Redeploy after adding: `vercel --prod`
3. Clear browser cache

### 3. Render Service Sleeping

**Error**: "ERR_CONNECTION_REFUSED"

**Fix**:

- Free tier spins down after 15min
- First request takes 30-50 seconds
- Upgrade to Starter plan for always-on

### 4. Build Fails on Render

**Error**: "Command failed: npm install"

**Fix**:

1. Check `socket-server.js` exists
2. Verify `package.json` has socket.io
3. Check Render logs for details

---

## 📝 Next Steps

1. ✅ Socket server deployed to Render
2. ✅ Next.js app deployed to Vercel
3. ✅ Environment variables configured
4. ⬜ Add custom domain (optional)
5. ⬜ Set up monitoring/alerts
6. ⬜ Enable auto-deployment
7. ⬜ Test from different networks

---

## 🎉 Success!

Your game is now live:

- **Frontend**: https://justforview.vercel.app
- **Socket Server**: https://your-service.onrender.com
- **Health Check**: https://your-service.onrender.com/health

Share your game and enjoy multiplayer Beyblade battles! 🎮⚡

---

## 📞 Support

**Issues with Render?**

- Check logs in dashboard
- Visit: https://render.com/docs
- Community: https://community.render.com

**Issues with Vercel?**

- Check deployment logs
- Visit: https://vercel.com/docs
- Support: https://vercel.com/support

**Game-specific issues?**

- Check browser console
- Test with `/health` endpoint
- Verify environment variables
