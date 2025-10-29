# 🚀 Production Deployment Guide

## Server Configuration

### Capacity Limits (Current Settings)

```javascript
MAX_ROOMS = 10; // Maximum concurrent games
MAX_PLAYERS = 20; // Maximum players (2 per room)
```

**When server is full:**

- New players see: "Server is full! 20/20 players online"
- Existing games continue normally
- Players can retry when someone leaves

---

## Deployment Options

### Option 1: Railway.app (⭐ RECOMMENDED - Easiest)

**Why Railway?**

- ✅ Native WebSocket/Socket.IO support
- ✅ Free tier: $5 credit/month
- ✅ Automatic HTTPS
- ✅ One-click deploy from GitHub
- ✅ Environment variables
- ✅ Free custom domain

#### Steps:

1. **Create Railway Account**

   ```
   Go to: https://railway.app
   Sign up with GitHub
   ```

2. **Prepare Repository**

   ```bash
   # Commit all changes
   git add .
   git commit -m "Ready for deployment"
   git push origin breadcrumbs
   ```

3. **Deploy to Railway**

   ```
   1. Click "New Project"
   2. Select "Deploy from GitHub repo"
   3. Choose: mohasinac/justforview.in
   4. Railway auto-detects Next.js
   ```

4. **Configure Build Settings**

   ```
   Build Command: npm install && npm run build
   Start Command: npm start
   ```

5. **Set Environment Variables**

   ```bash
   NODE_ENV=production
   NEXT_PUBLIC_SITE_URL=https://your-app.railway.app
   PORT=3000
   ```

6. **Deploy!**
   ```
   Railway automatically:
   - Installs dependencies
   - Builds Next.js
   - Starts custom server (server.js)
   - Provides public URL
   ```

**Cost:** FREE for first $5/month (~500 hours)

---

### Option 2: Render.com (Free Tier Available)

**Why Render?**

- ✅ Free tier available
- ✅ WebSocket support
- ✅ Automatic SSL
- ✅ GitHub integration

#### Steps:

1. **Create Render Account**

   ```
   https://render.com
   Sign up with GitHub
   ```

2. **Create Web Service**

   ```
   1. New → Web Service
   2. Connect GitHub repo: justforview.in
   3. Select branch: breadcrumbs
   ```

3. **Configure Service**

   ```yaml
   Name: beyblade-battle
   Environment: Node
   Region: Choose closest to your users
   Branch: breadcrumbs

   Build Command: npm install && npm run build
   Start Command: npm start
   ```

4. **Environment Variables**

   ```bash
   NODE_ENV=production
   NEXT_PUBLIC_SITE_URL=https://your-app.onrender.com
   PORT=10000
   ```

5. **Deploy**
   - Render auto-deploys on git push
   - First build takes ~5 minutes
   - URL: https://your-app.onrender.com

**Cost:** FREE (spins down after 15min inactivity)

---

### Option 3: DigitalOcean App Platform

**Why DigitalOcean?**

- ✅ Reliable infrastructure
- ✅ Full WebSocket support
- ✅ Predictable pricing
- ✅ Easy scaling

#### Steps:

1. **Create DigitalOcean Account**

   ```
   https://www.digitalocean.com
   $200 free credit for 60 days
   ```

2. **Create App**

   ```
   1. Apps → Create App
   2. GitHub → justforview.in
   3. Branch: breadcrumbs
   ```

3. **Configure**

   ```yaml
   Name: beyblade-battle
   Type: Web Service

   Build Command: npm install && npm run build
   Run Command: npm start

   HTTP Port: 3000
   HTTP Request Routes: /
   ```

4. **Environment Variables**

   ```bash
   NODE_ENV=production
   NEXT_PUBLIC_SITE_URL=${APP_URL}
   ```

5. **Choose Plan**
   - Basic: $5/month (512MB RAM)
   - Recommended for 20 players

**Cost:** $5/month minimum

---

### Option 4: Vercel + External WebSocket Service

**Problem:** Vercel doesn't support persistent WebSocket connections in serverless

**Solution:** Use external WebSocket service

#### A. Deploy Next.js to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

#### B. Deploy Socket.IO to Railway/Render

1. Create separate repository for `server.js`
2. Deploy to Railway/Render
3. Update Socket.IO URL in code

```typescript
// src/lib/socket.ts
export function initSocket() {
  const socket = io(
    process.env.NEXT_PUBLIC_SOCKET_URL ||
      "https://your-socket-server.railway.app"
  );
  return socket;
}
```

**Cost:**

- Vercel: FREE
- Socket server: $5/month (Railway)

---

## Required File Changes for Production

### 1. Update `server.js` for Production

**Already done!** ✅ Your server.js has:

- `process.env.NODE_ENV` check
- `process.env.PORT` support
- CORS with environment variable
- Capacity limits (10 rooms / 20 players)

### 2. Update Socket.IO Client URL

**Already configured!** ✅

```typescript
// src/lib/socket.ts
export const initSocket = (): Socket => {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000", {
      autoConnect: false,
    });
  }
  return socket;
};
```

**For single-server deployment (Railway/Render/DO):**

- Set `NEXT_PUBLIC_SOCKET_URL` to your deployed URL
- Or leave empty (will use same domain)

**For split deployment (Vercel + separate Socket server):**

- Set `NEXT_PUBLIC_SOCKET_URL=https://socket-server.railway.app`

### 3. Environment Variables Required

Create `.env.production` file:

```bash
# Required for all deployments
NODE_ENV=production

# Your deployed domain (auto-filled by most platforms)
NEXT_PUBLIC_SITE_URL=https://your-app.railway.app

# Optional: Only if Socket.IO on different server
# NEXT_PUBLIC_SOCKET_URL=https://socket-server.railway.app
```

### 4. Build Configuration

**package.json** (Already configured! ✅)

```json
{
  "scripts": {
    "dev": "node server.js",
    "build": "next build",
    "start": "NODE_ENV=production node server.js",
    "lint": "next lint"
  }
}
```

---

## 🎯 Step-by-Step: Railway Deployment (RECOMMENDED)

### Prerequisites

```bash
# Ensure all changes committed
git status
git add .
git commit -m "Production ready with 10 server limit"
git push origin breadcrumbs
```

### Deployment Steps

#### 1. Create Railway Account

- Go to https://railway.app
- Click "Login with GitHub"
- Authorize Railway

#### 2. New Project

```
Dashboard → New Project → Deploy from GitHub repo
```

#### 3. Select Repository

```
Repository: mohasinac/justforview.in
Branch: breadcrumbs
```

#### 4. Railway Auto-Detects Settings

```
✓ Detected: Node.js + Next.js
✓ Install Command: npm install
✓ Build Command: npm run build
✓ Start Command: npm start
```

#### 5. Add Environment Variables

```
Settings → Variables → Add Variable

NODE_ENV = production
PORT = 3000
```

Railway automatically provides `RAILWAY_PUBLIC_DOMAIN` which becomes your URL.

#### 6. Deploy

```
Click "Deploy"
Wait 3-5 minutes for first build
```

#### 7. Get Your URL

```
Your app will be live at:
https://justforview-production-xxxx.up.railway.app
```

#### 8. Test

```
1. Open: https://your-app.railway.app/game/beyblade-battle
2. Click "Multiplayer"
3. Test from different devices/networks
```

### Railway Features

- ✅ Automatic HTTPS
- ✅ Custom domain support
- ✅ Automatic deployments on git push
- ✅ View logs in real-time
- ✅ WebSocket support (no config needed)
- ✅ $5 free credit/month

---

## 🔒 Security Checklist

### Before Going Live

- [x] **Capacity Limits**: 10 rooms / 20 players ✅
- [x] **CORS configured**: Uses env variable ✅
- [x] **Environment variables**: NODE_ENV check ✅
- [ ] **Rate limiting**: Add if needed (see below)
- [ ] **Error logging**: Add Sentry/LogRocket
- [ ] **Analytics**: Add PostHog/Mixpanel
- [ ] **Monitoring**: Add uptime monitoring

### Optional: Add Rate Limiting

Prevent abuse by limiting socket connections per IP:

```javascript
// server.js - Add this at the top
const rateLimit = new Map(); // IP -> { count, resetTime }
const MAX_CONNECTIONS_PER_IP = 3; // Max 3 connections per IP
const RATE_LIMIT_WINDOW = 60000; // 1 minute

io.use((socket, next) => {
  const ip = socket.handshake.address;
  const now = Date.now();

  if (!rateLimit.has(ip)) {
    rateLimit.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return next();
  }

  const limit = rateLimit.get(ip);
  if (now > limit.resetTime) {
    // Reset counter
    rateLimit.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return next();
  }

  if (limit.count >= MAX_CONNECTIONS_PER_IP) {
    return next(new Error("Too many connections from this IP"));
  }

  limit.count++;
  next();
});
```

---

## 📊 Monitoring Your Deployment

### Railway Dashboard

```
Deployments → Your App → Observability

View:
- CPU usage
- Memory usage
- Network traffic
- Active connections
- Error logs
```

### Server Logs

```javascript
// Already logging in server.js
console.log(`Server status: ${totalPlayers}/${MAX_PLAYERS} players`);
console.log("Player connected:", socket.id);
console.log("Room created:", roomId);
```

### Monitor in Real-Time

```bash
# Railway CLI
railway logs --follow

# Or in Dashboard:
Deployments → View Logs
```

---

## 🎮 Testing After Deployment

### Test Checklist

1. **Single Player Mode**

   ```
   ✓ Click "Single Player"
   ✓ Game loads
   ✓ AI works
   ✓ Can restart
   ```

2. **Multiplayer Mode**

   ```
   ✓ Click "Multiplayer"
   ✓ Enter name
   ✓ Matchmaking works
   ✓ Two players can connect
   ✓ Beyblade selection syncs
   ✓ Game plays smoothly
   ✓ Winner/loser screen appears
   ✓ "Find New Opponent" works
   ```

3. **Server Capacity**

   ```
   ✓ 21st player sees "Server Full" message
   ✓ After someone leaves, new player can join
   ✓ Server logs show correct player count
   ```

4. **Different Networks**
   ```
   ✓ Test from different WiFi networks
   ✓ Test from mobile data
   ✓ Test from different countries (VPN)
   ```

### Test Script

```bash
# Open multiple browser tabs
Tab 1: Your laptop
Tab 2: Incognito mode
Tab 3: Your phone
Tab 4: Friend's phone (different network)

All connect to: https://your-app.railway.app/game/beyblade-battle
```

---

## 🚨 Troubleshooting

### Issue: "Server Full" Too Quickly

**Solution: Increase capacity**

```javascript
// server.js
const MAX_ROOMS = 20; // Change from 10 to 20
const MAX_PLAYERS = MAX_ROOMS * 2; // Now 40 players
```

### Issue: WebSocket Connection Failed

**Check:**

1. CORS settings in server.js
2. `NEXT_PUBLIC_SITE_URL` environment variable
3. Railway/Render logs for errors

**Fix:**

```javascript
// server.js - Update CORS
const io = new Server(httpServer, {
  cors: {
    origin: "*", // Allow all origins (or specify your domain)
    methods: ["GET", "POST"],
  },
});
```

### Issue: Players Can't Find Each Other

**Debug:**

```javascript
// Check server logs
console.log("Current rooms:", Array.from(rooms.keys()));
console.log("Current players:", players.size);
```

### Issue: High Latency

**Solutions:**

1. Deploy to region closer to users
2. Reduce input sync rate (currently 20Hz)
3. Use CDN for static assets

---

## 💰 Cost Breakdown

### Railway (Recommended)

```
Free Tier: $5 credit/month
- ~500 hours of uptime
- Perfect for 20 concurrent players
- Auto-scales as needed

Paid: $5/month
- Unlimited uptime
- 512MB RAM (good for 50+ players)
- 1GB RAM ($10/month) for 100+ players
```

### Render

```
Free Tier: $0
- Spins down after 15min inactivity
- 750 hours/month free
- Good for testing

Starter: $7/month
- Always online
- Better performance
```

### DigitalOcean

```
Basic: $5/month
- 512MB RAM
- Always online
- Good for 20-50 players

Professional: $12/month
- 1GB RAM
- Good for 100+ players
```

---

## 🎯 Final Checklist

Before going live:

- [ ] All code committed and pushed
- [ ] Environment variables set
- [ ] Deployed to Railway/Render/DO
- [ ] Tested multiplayer from 2 devices
- [ ] Tested "Server Full" message
- [ ] Checked logs for errors
- [ ] Tested from different networks
- [ ] Custom domain configured (optional)
- [ ] Analytics added (optional)
- [ ] Monitoring setup (optional)

---

## 🚀 Quick Deploy Commands

```bash
# 1. Commit changes
git add .
git commit -m "Production ready - 10 server limit"
git push origin breadcrumbs

# 2. Deploy to Railway (if using CLI)
npm i -g @railway/cli
railway login
railway init
railway up

# 3. Or use Railway Dashboard
# Go to railway.app → Deploy from GitHub
```

**Your multiplayer game will be live in 5 minutes!** 🎉

---

## 📞 Support Resources

- Railway Docs: https://docs.railway.app
- Render Docs: https://render.com/docs
- Socket.IO Docs: https://socket.io/docs/v4/
- Next.js Deployment: https://nextjs.org/docs/deployment

**Need help? Check server logs first!**

```bash
railway logs --follow
# or
render logs your-app-name
```

<function_calls>
<invoke name="read_file">
<parameter name="filePath">d:\proj\justforview.in\src\lib\socket.ts
