# 🚀 Vercel Deployment Guide

## ⚠️ Important: WebSocket Limitations on Vercel

Vercel's serverless architecture **does not support persistent WebSocket connections** needed for Socket.IO. 

### Two Deployment Options:

1. **Option A (RECOMMENDED)**: Deploy entire app to Render/Railway (supports WebSockets)
2. **Option B**: Split deployment - Next.js on Vercel + Socket.IO server elsewhere

---

## Option A: Deploy to Render.com (RECOMMENDED - Full Support)

**Why Render?**
- ✅ Free tier available
- ✅ Native WebSocket/Socket.IO support
- ✅ Automatic SSL
- ✅ GitHub integration
- ✅ One platform for everything

### Steps:

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
   Region: Singapore (or closest to users)
   Branch: breadcrumbs

   Build Command: npm install && npm run build
   Start Command: npm start
   ```

4. **Environment Variables**
   ```bash
   NODE_ENV=production
   NEXT_PUBLIC_SITE_URL=https://your-app.onrender.com
   ```

5. **Deploy**
   - Render auto-deploys on git push
   - First build takes ~5 minutes
   - URL: https://your-app.onrender.com

**Cost:** FREE (spins down after 15min inactivity on free tier)

---

## Option B: Vercel + External Socket Server (Split Deployment)

⚠️ **More Complex Setup** - Only use if you specifically need Vercel for Next.js

### Part 1: Deploy Next.js to Vercel

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel --prod
   ```

3. **Configure Environment Variables** (in Vercel Dashboard)
   ```bash
   NODE_ENV=production
   NEXT_PUBLIC_SOCKET_URL=https://your-socket-server.onrender.com
   ```

### Part 2: Deploy Socket.IO Server to Render

1. **Create separate repository for Socket server** (or use subdirectory)

2. **Create `socket-server/package.json`**
   ```json
   {
     "name": "socket-server",
     "version": "1.0.0",
     "scripts": {
       "start": "node server.js"
     },
     "dependencies": {
       "socket.io": "^4.8.1"
     }
   }
   ```

3. **Move `server.js` to socket-server directory** (or create standalone)

4. **Deploy to Render**
   - New Web Service
   - Connect repository
   - Start Command: `npm start`
   - Environment: `PORT=10000`

5. **Update Socket.IO Client**
   ```typescript
   // src/hooks/useMultiplayer.ts or wherever socket is initialized
   const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000');
   ```

**Cost:**
- Vercel: FREE (Hobby plan)
- Socket server (Render): FREE or $7/month for always-on

---

## 🎯 RECOMMENDED: Single Platform Deployment

For simplicity and reliability, deploy everything to **Render.com**:

### Quick Start Commands

```bash
# 1. Commit all changes
git add .
git commit -m "Ready for Render deployment"
git push origin breadcrumbs

# 2. Go to Render Dashboard
# https://dashboard.render.com

# 3. Click "New +" → "Web Service"

# 4. Connect your GitHub repo

# 5. Configure:
Build Command: npm install && npm run build
Start Command: npm start

# 6. Add environment variables:
NODE_ENV=production

# 7. Click "Create Web Service"
```

Your app will be live at: `https://justforview-xxxx.onrender.com`

---

## Server Configuration

### Capacity Limits (Current Settings)

```javascript
MAX_ROOMS = 10; // Maximum concurrent games
MAX_PLAYERS = 20; // Maximum players (2 per room)
```

**When server is full:**
- New players see: "Server is at capacity. Please try again later."
- Existing games continue normally
- Players can retry when someone leaves

---

## Testing After Deployment

### Test Checklist

1. **Single Player Mode**
   ```
   ✓ Click "Single Player"
   ✓ Game loads and works
   ✓ AI responds correctly
   ```

2. **Multiplayer Mode**
   ```
   ✓ Click "Multiplayer"
   ✓ Enter name
   ✓ Matchmaking works
   ✓ Two players can connect
   ✓ Game syncs properly
   ✓ Cooldowns work (2s dodge, 5s attack)
   ✓ Winner screen appears
   ✓ "Find New Opponent" works
   ```

3. **Cross-Network Test**
   ```
   ✓ Test from different WiFi networks
   ✓ Test from mobile data
   ✓ Test from different locations
   ```

---

## Environment Variables Reference

### Required for All Deployments

```bash
NODE_ENV=production
```

### Optional (if using split deployment)

```bash
NEXT_PUBLIC_SOCKET_URL=https://socket-server.onrender.com
```

### Auto-provided by Render

```bash
PORT=10000  # Automatically set by Render
```

---

## 💰 Cost Comparison

### Render (Recommended)

```
Free Tier: $0/month
- 750 hours/month
- Spins down after 15min inactivity
- Good for low-traffic testing

Starter: $7/month
- Always online
- 512MB RAM
- Good for 20-50 concurrent players
```

### Vercel + Render (Split)

```
Vercel: FREE (Hobby tier)
Render Socket Server: $7/month (Starter)

Total: $7/month
More complex to maintain
```

### Railway.app (Alternative)

```
Free: $5 credit/month
- ~500 hours uptime
- Good for testing

Pro: $5/month
- Always online
- Scales automatically
```

---

## 🚨 Troubleshooting

### Issue: "Cannot connect to server"

**If using Render:**
1. Check if service is running (may be spun down on free tier)
2. Check Render logs for errors
3. Verify CORS settings in `server.js`

**If using Vercel + separate socket server:**
1. Verify `NEXT_PUBLIC_SOCKET_URL` is set correctly
2. Test socket server URL directly
3. Check CORS configuration

### Issue: "WebSocket connection failed"

**Check:**
```javascript
// server.js - Ensure CORS is configured
const io = new Server(httpServer, {
  cors: {
    origin: process.env.NEXT_PUBLIC_SITE_URL || '*',
    methods: ['GET', 'POST']
  }
});
```

### Issue: Players can't find opponents

**Debug in Render logs:**
```bash
# Check active rooms and players
console.log('Rooms:', rooms.size);
console.log('Players:', players.size);
```

---

## 🎯 Quick Deploy to Render (5 Minutes)

```bash
# Step 1: Commit changes
git add .
git commit -m "Production ready"
git push

# Step 2: Render Dashboard
1. Go to https://render.com
2. New Web Service
3. Connect GitHub: justforview.in
4. Branch: breadcrumbs
5. Build: npm install && npm run build
6. Start: npm start
7. Add env: NODE_ENV=production
8. Create Service

# Done! Your app is live.
```

---

## 📞 Support Resources

- Render Docs: https://render.com/docs
- Socket.IO Docs: https://socket.io/docs/v4/
- Next.js Deployment: https://nextjs.org/docs/deployment

**Need help? Check Render logs:**
```
Dashboard → Your Service → Logs
```

<function_calls>
<invoke name="read_file">
<parameter name="filePath">d:\proj\justforview.in\src\lib\socket.ts
