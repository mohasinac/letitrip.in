# 🚀 Quick Deployment Reference Card

## Split Deployment Setup (Render + Vercel)

### File Overview

| File                        | Purpose                                              |
| --------------------------- | ---------------------------------------------------- |
| `socket-server.js`          | Standalone Socket.IO server for Render               |
| `server.js`                 | Combined Next.js + Socket.IO (for single deployment) |
| `render.yaml`               | Render configuration (optional)                      |
| `vercel.json`               | Vercel configuration                                 |
| `SPLIT_DEPLOYMENT_GUIDE.md` | Complete step-by-step guide                          |

---

## Environment Variables

### For Local Development

Create `.env.local`:

```bash
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

Run separately:

```powershell
# Terminal 1: Socket Server
npm run dev:socket

# Terminal 2: Next.js App
npm run dev:next
```

### For Production

**Render (Socket Server):**

- `NODE_ENV=production`
- `ALLOWED_ORIGINS=https://your-app.vercel.app`

**Vercel (Next.js):**

- `NEXT_PUBLIC_SOCKET_URL=https://your-socket.onrender.com`

---

## Deployment Commands

### Deploy Socket Server to Render

```powershell
# 1. Commit and push
git add .
git commit -m "Deploy socket server"
git push origin breadcrumbs

# 2. On Render Dashboard
# - Create Web Service
# - Build: npm install
# - Start: node socket-server.js
```

### Deploy Next.js to Vercel

```powershell
# 1. Install Vercel CLI
npm install -g vercel

# 2. Deploy
vercel --prod

# 3. Set environment variable
vercel env add NEXT_PUBLIC_SOCKET_URL production
# Paste your Render URL
```

---

## Testing

### Test Socket Server

```
https://your-service.onrender.com/health
```

Should return:

```json
{
  "status": "ok",
  "service": "Beyblade Game Socket Server",
  "players": 0,
  "rooms": 0
}
```

### Test Frontend

1. Open Vercel URL
2. Open DevTools (F12) → Console
3. Look for Socket.IO connection messages
4. Test multiplayer in 2 browser windows

---

## Troubleshooting

| Issue                   | Solution                                 |
| ----------------------- | ---------------------------------------- |
| Socket connection fails | Check `NEXT_PUBLIC_SOCKET_URL` in Vercel |
| CORS error              | Update `ALLOWED_ORIGINS` in Render       |
| Server sleeping         | Upgrade to Render Starter ($7/month)     |
| Env vars not working    | Redeploy after adding: `vercel --prod`   |

---

## Package.json Scripts

```json
{
  "dev": "node server.js", // Combined (local dev)
  "dev:next": "next dev", // Next.js only
  "dev:socket": "node socket-server.js", // Socket server only
  "build": "next build", // Build Next.js
  "start": "node server.js", // Combined (production)
  "start:next": "next start", // Next.js only
  "start:socket": "node socket-server.js" // Socket server only
}
```

---

## Architecture

```
User Browser
    │
    ├──── VERCEL ────────┐
    │    (Next.js)       │
    │    - Pages         │
    │    - API Routes    │
    │    - Static Files  │
    │                    │
    └──── RENDER ────────┘
         (Socket.IO)
         - WebSockets
         - Game Logic
         - Matchmaking
```

---

## Monthly Cost

- **Vercel**: Free (Hobby)
- **Render**: $7 (Starter - always on)
- **Total**: $7/month

Free option available (Render Free tier) but socket server will sleep after 15min inactivity.

---

## 📚 Full Documentation

See `SPLIT_DEPLOYMENT_GUIDE.md` for complete instructions!
