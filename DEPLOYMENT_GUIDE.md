# 🚀 Production Deployment Guide

## Server Configuration

### Capacity Limits (Current Settings)
```javascript
MAX_ROOMS = 10        // Maximum concurrent games
MAX_PLAYERS = 20      // Maximum players (2 per room)
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
  const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'https://your-socket-server.railway.app');
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

<function_calls>
<invoke name="read_file">
<parameter name="filePath">d:\proj\justforview.in\src\lib\socket.ts
