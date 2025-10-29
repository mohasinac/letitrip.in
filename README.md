# 🎮 JustForView - Multiplayer Beyblade Game

A real-time multiplayer Beyblade battle game built with Next.js, Socket.IO, and PixiJS.

---

## 🚀 Quick Start

### Local Development

```powershell
# Install dependencies
npm install

# Option 1: Run everything together (recommended for quick start)
npm run dev

# Option 2: Run separately (for testing split deployment locally)
# Terminal 1: Socket Server
npm run dev:socket

# Terminal 2: Next.js App
npm run dev:next
```

Visit `http://localhost:3000` to play!

---

## 🌐 Deployment

This project uses a **split deployment architecture**:

- **Vercel**: Hosts the Next.js frontend (fast global CDN)
- **Render**: Hosts the Socket.IO game server (WebSocket support)

### Quick Deploy

```powershell
# 1. Commit your changes
git add .
git commit -m "Ready for deployment"
git push origin breadcrumbs

# 2. Deploy Socket Server to Render
# - Go to https://render.com
# - Create Web Service
# - Build: npm install
# - Start: node socket-server.js

# 3. Deploy Next.js to Vercel
npm install -g vercel
vercel --prod

# 4. Set environment variable in Vercel
# NEXT_PUBLIC_SOCKET_URL=https://your-socket-server.onrender.com
```

📚 **Full deployment guide**: See [`SPLIT_DEPLOYMENT_GUIDE.md`](./SPLIT_DEPLOYMENT_GUIDE.md)

🎯 **Quick reference**: See [`DEPLOYMENT_QUICK_REFERENCE.md`](./DEPLOYMENT_QUICK_REFERENCE.md)

---

## 📁 Project Structure

```
justforview.in/
├── socket-server.js          # Standalone Socket.IO server (for Render)
├── server.js                 # Combined Next.js + Socket.IO (for local/full deploy)
├── src/
│   ├── app/                  # Next.js pages
│   ├── components/           # React components
│   ├── lib/socket.ts         # Socket.IO client
│   └── ...
├── public/                   # Static assets
├── render.yaml               # Render configuration
├── vercel.json               # Vercel configuration
└── SPLIT_DEPLOYMENT_GUIDE.md # Deployment instructions
```

---

## 🎮 Features

### Game Mechanics

- ✅ Real-time multiplayer battles
- ✅ Room-based matchmaking (max 10 rooms, 20 players)
- ✅ Beyblade selection system
- ✅ Physics-based combat
- ✅ Special attacks & dodge mechanics
- ✅ Distance-based damage (50/100/150 units)
- ✅ Cooldown systems (2s dodge, 5s attack)
- ✅ Control loss during attacks

### Technical Features

- ⚡ Next.js 16 with App Router
- 🎨 Modern UI with Tailwind CSS
- 🔥 Firebase Authentication
- 🎯 PixiJS for high-performance rendering
- 🔌 Socket.IO for real-time multiplayer
- 📱 Responsive design
- 🎭 Dark/Light theme support

---

## 🛠️ Environment Variables

### Development

Create `.env.local`:

```bash
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Firebase (optional)
NEXT_PUBLIC_FIREBASE_API_KEY=your-key
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project
# ... other Firebase config
```

### Production

**Vercel:**

- `NEXT_PUBLIC_SOCKET_URL` - Your Render socket server URL

**Render:**

- `NODE_ENV=production`
- `ALLOWED_ORIGINS` - Your Vercel domain(s)

See [`.env.example`](./.env.example) for all variables.

---

## 📦 Scripts

| Script                 | Description                         |
| ---------------------- | ----------------------------------- |
| `npm run dev`          | Run combined app (Next.js + Socket) |
| `npm run dev:next`     | Run Next.js only                    |
| `npm run dev:socket`   | Run Socket.IO server only           |
| `npm run build`        | Build Next.js for production        |
| `npm start`            | Start combined production server    |
| `npm run start:socket` | Start Socket.IO server only         |
| `npm run lint`         | Run ESLint                          |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│                 User Browser                     │
└───────────────────┬─────────────────────────────┘
                    │
        ┌───────────┴────────────┐
        │                        │
┌───────▼────────┐     ┌────────▼──────────────┐
│     VERCEL     │     │       RENDER          │
│                │     │                       │
│   Next.js App  │     │  Socket.IO Server     │
│   ┌─────────┐  │     │  ┌─────────────────┐  │
│   │ Pages   │  │     │  │  WebSocket      │  │
│   │ API     │  │     │  │  Game Logic     │  │
│   │ Static  │  │     │  │  Matchmaking    │  │
│   └─────────┘  │     │  │  Room Manager   │  │
│                │     │  └─────────────────┘  │
└────────────────┘     └───────────────────────┘
```

### Why Split Deployment?

1. **Vercel Limitation**: Serverless functions don't support persistent WebSocket connections
2. **Best of Both**: Vercel's CDN for frontend + Render's dedicated server for WebSockets
3. **Cost Effective**: Vercel free tier + Render $7/month
4. **Scalability**: Each component can scale independently

---

## 🧪 Testing

### Test Locally

```powershell
# Start the app
npm run dev

# Open two browser windows/tabs
# Window 1: http://localhost:3000/game
# Window 2: http://localhost:3000/game (incognito)

# Both should connect and match for multiplayer
```

### Test Production

1. Visit your Vercel URL
2. Check socket connection in DevTools console
3. Test multiplayer in two browsers/devices
4. Verify with socket health check: `https://your-socket.onrender.com/health`

---

## 🐛 Troubleshooting

### Socket Connection Issues

**Problem**: "Connection failed" or CORS errors

**Solutions**:

1. Check `NEXT_PUBLIC_SOCKET_URL` in Vercel env vars
2. Verify `ALLOWED_ORIGINS` in Render includes your Vercel domain
3. Test socket server directly: `https://your-socket.onrender.com/health`

### Server at Capacity

**Problem**: "Server is at capacity"

**Solution**:

- Default limit: 20 players / 10 rooms
- Increase limits in `socket-server.js` (lines 11-12)
- Deploy multiple instances on Render

### Render Service Sleeping

**Problem**: First connection takes 30-50 seconds

**Solution**:

- Free tier spins down after 15min inactivity
- Upgrade to Starter plan ($7/month) for always-on
- Or implement a keep-alive ping

---

## 📚 Documentation

- [`SPLIT_DEPLOYMENT_GUIDE.md`](./SPLIT_DEPLOYMENT_GUIDE.md) - Complete deployment walkthrough
- [`DEPLOYMENT_QUICK_REFERENCE.md`](./DEPLOYMENT_QUICK_REFERENCE.md) - Quick reference card
- [`DEPLOYMENT_SUMMARY.md`](./DEPLOYMENT_SUMMARY.md) - Deployment options overview
- [`MULTIPLAYER_IMPLEMENTATION.md`](./MULTIPLAYER_IMPLEMENTATION.md) - Multiplayer system docs

---

## 💰 Costs

### Free Tier

- **Vercel**: Free (Hobby plan)
- **Render**: Free with cold starts
- **Total**: $0/month

### Production (Recommended)

- **Vercel**: Free (Hobby plan)
- **Render**: $7/month (Starter - always on)
- **Total**: $7/month

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit changes: `git commit -m 'Add my feature'`
4. Push to branch: `git push origin feature/my-feature`
5. Open a Pull Request

---

## 📄 License

This project is private and proprietary.

---

## 🔗 Links

- **Live App**: https://justforview.vercel.app (update with your URL)
- **Socket Server**: https://your-socket.onrender.com (update with your URL)
- **Repository**: https://github.com/mohasinac/justforview.in

---

## 📞 Support

For deployment help:

- 📖 Read [`SPLIT_DEPLOYMENT_GUIDE.md`](./SPLIT_DEPLOYMENT_GUIDE.md)
- 🐛 Check [Troubleshooting](#-troubleshooting) section
- 💬 Open an issue on GitHub

---

Made with ❤️ by Mohasin
