# ⚠️ Vercel Deployment - Important WebSocket Limitation

## Critical Information

**Vercel does NOT support persistent WebSocket connections** required for Socket.IO in their serverless infrastructure.

### Your Options:

1. **✅ RECOMMENDED: Deploy to Render.com** (see DEPLOYMENT_GUIDE.md)

   - Full WebSocket support
   - Free tier available
   - Everything in one place

2. **Split Deployment**: Vercel (Next.js) + Render (Socket.IO)
   - More complex setup
   - Higher maintenance
   - Instructions below

---

## Option 1: Full Deployment to Render (RECOMMENDED)

See `DEPLOYMENT_GUIDE.md` for complete instructions.

**Quick Start:**

```bash
# 1. Push to GitHub
git push origin breadcrumbs

# 2. Go to Render.com
https://render.com → New Web Service

# 3. Configure:
Build: npm install && npm run build
Start: npm start

# Done! Everything works including multiplayer.
```

---

## Option 2: Split Deployment (Vercel + Render)

⚠️ **Only use if you specifically need Vercel for Next.js**

### Part A: Deploy Socket.IO Server to Render

1. **Create Web Service on Render**

   ```
   https://render.com → New Web Service
   ```

2. **Configure:**

   ```yaml
   Name: beyblade-socket-server
   Root Directory: .
   Build Command: npm install
   Start Command: node server.js
   ```

3. **Environment Variables:**

   ```bash
   NODE_ENV=production
   PORT=10000
   NEXT_PUBLIC_SITE_URL=https://your-vercel-app.vercel.app
   ```

4. **Get Socket Server URL:**
   ```
   Your server: https://beyblade-socket-server.onrender.com
   ```

### Part B: Deploy Next.js to Vercel

1. **Install Vercel CLI**

   ```bash
   npm i -g vercel
   ```

2. **Set Environment Variable (CRITICAL)**

   ```bash
   # In Vercel Dashboard → Settings → Environment Variables
   NEXT_PUBLIC_SOCKET_URL=https://beyblade-socket-server.onrender.com
   ```

3. **Deploy**

   ```bash
   vercel --prod
   ```

4. **Update CORS in server.js**

   ```javascript
   // server.js
   const io = new Server(httpServer, {
     cors: {
       origin: "https://your-app.vercel.app", // Your Vercel URL
       methods: ["GET", "POST"],
     },
   });
   ```

5. **Re-deploy Socket Server** with updated CORS

### Part C: Verify Setup

1. **Check Socket Server Health**

   ```
   Visit: https://beyblade-socket-server.onrender.com
   Should show "Cannot GET /" (normal for Socket.IO)
   ```

2. **Test Multiplayer**

   ```
   Visit: https://your-app.vercel.app/game/beyblade-battle
   Click "Multiplayer"
   Should connect to socket server
   ```

3. **Check Browser Console**
   ```javascript
   // Should see:
   Connected to socket server
   Socket ID: xxx
   ```

---

## Environment Variables Reference

### Vercel (Next.js App)

```bash
NODE_ENV=production
NEXT_PUBLIC_SOCKET_URL=https://your-socket-server.onrender.com
```

### Render (Socket.IO Server)

```bash
NODE_ENV=production
PORT=10000
NEXT_PUBLIC_SITE_URL=https://your-app.vercel.app
```

---

## Cost Comparison

### Full Render Deployment

```
Free Tier: $0/month (spins down after 15min)
Starter: $7/month (always on)
```

### Split Deployment

```
Vercel: FREE (Hobby plan)
Render (Socket): $7/month (Starter, always on)
Total: $7/month + more complexity
```

### Why Split Deployment Costs More

- Two platforms to maintain
- CORS configuration needed
- More environment variables
- Harder to debug issues
- Socket server still needs always-on plan

---

## Troubleshooting Split Deployment

### Issue: "Cannot connect to socket server"

1. **Check Socket Server is Running**

   ```bash
   curl https://beyblade-socket-server.onrender.com
   # Should return HTTP 400 or connection response
   ```

2. **Verify Environment Variable**

   ```javascript
   // In browser console on Vercel site:
   console.log(process.env.NEXT_PUBLIC_SOCKET_URL);
   // Should show: https://beyblade-socket-server.onrender.com
   ```

3. **Check CORS Settings**
   ```javascript
   // server.js must allow Vercel domain
   cors: {
     origin: 'https://your-app.vercel.app',
     methods: ['GET', 'POST']
   }
   ```

### Issue: "Multiplayer not working"

1. **Open Browser DevTools → Network → WS**

   - Should see WebSocket connection
   - Should be connected (green dot)

2. **Check Socket.IO Client Code**

   ```typescript
   // Should use environment variable
   const socket = io(
     process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000"
   );
   ```

3. **Verify in Render Logs**
   ```
   Render Dashboard → Your Service → Logs
   Should see: "Player connected: [socket-id]"
   ```

---

## Why We DON'T Recommend Vercel for This Project

### Technical Limitations

1. **No Persistent Connections**

   - Vercel functions timeout after 10 seconds
   - WebSockets need persistent connections
   - Socket.IO requires long-lived connections

2. **Serverless Architecture**

   - Each request = new instance
   - No shared memory between functions
   - Cannot maintain game room state
   - Player matchmaking breaks

3. **Cold Starts**
   - Socket server needs to be always on
   - Vercel functions wake up on request
   - Causes connection delays

### Better Alternatives

**Render.com:**

- ✅ Traditional server (not serverless)
- ✅ Persistent WebSocket support
- ✅ Shared memory for game rooms
- ✅ Free tier available
- ✅ Everything in one place

**Railway.app:**

- ✅ Great for Node.js + WebSockets
- ✅ $5 credit/month free
- ✅ Automatic deployments
- ✅ Easy to use

---

## Summary: Choose Your Path

### Path 1: Render Only (RECOMMENDED) ⭐

```
✅ Simplest setup
✅ Everything works out of box
✅ Free tier or $7/month
✅ One platform to learn
✅ See DEPLOYMENT_GUIDE.md
```

### Path 2: Vercel + Render (Advanced)

```
⚠️ More complex
⚠️ Two platforms to manage
⚠️ CORS configuration needed
⚠️ Same cost as Render only
⚠️ Only if you specifically need Vercel
```

### Path 3: Railway (Good Alternative)

```
✅ Similar to Render
✅ $5 credit/month
✅ Great WebSocket support
✅ See DEPLOYMENT_GUIDE.md
```

---

## Quick Decision Guide

**Choose Render if:**

- You want simplest setup
- First time deploying
- Want free tier
- Need WebSockets (YOU DO!)

**Choose Vercel + Render if:**

- Already using Vercel for other features
- Need Vercel-specific features
- Okay with split deployment complexity

**Choose Railway if:**

- Want similar to Render
- Prefer Railway interface
- Have $5/month budget

---

## Next Steps

1. **Read DEPLOYMENT_GUIDE.md** for full Render instructions
2. **Commit your code**: `git push origin breadcrumbs`
3. **Deploy to Render**: https://render.com
4. **Test multiplayer** from different networks

**Need help?** Check the DEPLOYMENT_GUIDE.md or Render docs.

---

## Contact & Support

- Render Docs: https://render.com/docs
- Socket.IO Docs: https://socket.io/docs
- Vercel Limitations: https://vercel.com/docs/concepts/limits/overview

**Remember:** For multiplayer games with WebSockets, traditional hosting (Render/Railway) is better than serverless (Vercel).
