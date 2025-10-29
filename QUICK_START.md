# 🚀 Quick Start Guide

## Local Development

### Prerequisites

- Node.js 20+
- npm

### Setup

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Create environment file:**

   Create `.env.local` in the root:

   ```env
   NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
   ```

3. **Run the app:**
   ```bash
   npm run dev
   ```

That's it! 🎉

### Access Points

- **Frontend:** http://localhost:3000
- **Socket Server:** http://localhost:3001/health
- **Game:** http://localhost:3000/game/beyblade-battle

---

## Available Commands

| Command              | Description                                  |
| -------------------- | -------------------------------------------- |
| `npm run dev`        | **Start both servers** (Next.js + Socket.IO) |
| `npm run dev:next`   | Start Next.js only                           |
| `npm run dev:socket` | Start Socket.IO server only                  |
| `npm run build`      | Build for production                         |
| `npm start`          | Run Socket.IO server (production)            |
| `npm run lint`       | Run ESLint                                   |

---

## Testing Multiplayer

1. Start the servers: `npm run dev`
2. Open http://localhost:3000/game/beyblade-battle
3. Click "Multiplayer"
4. Enter your name and join
5. Open a new incognito/private window
6. Repeat steps 2-4 with a different name
7. Both players should connect and select beyblades
8. Game starts automatically when both are ready!

---

## Troubleshooting

### Port Already in Use

```bash
# Find process using port 3000 or 3001
netstat -ano | findstr :3000
netstat -ano | findstr :3001

# Kill the process
taskkill /PID <PID> /F
```

### Connection Issues

- Make sure both servers are running (check terminal output)
- Verify `.env.local` exists with `NEXT_PUBLIC_SOCKET_URL=http://localhost:3001`
- Clear browser cache and reload

### Socket Not Connecting

- Check browser console for errors
- Verify Socket.IO server is running on port 3001
- Check http://localhost:3001/health (should return JSON)

---

## Project Structure

```
justforview.in/
├── server.js                      # Socket.IO server (multiplayer)
├── src/
│   ├── app/                      # Next.js app router
│   │   ├── game/                # Game pages
│   │   │   ├── beyblade-battle/ # Main game
│   │   │   └── components/      # Game components
│   └── lib/
│       └── socket.ts            # Socket.IO client
├── .env.local                    # Environment variables (create this)
└── package.json                  # Scripts and dependencies
```

---

## Production Deployment

### Render (Socket Server)

1. Push to GitHub
2. Render auto-deploys `server.js`
3. Set `NODE_ENV=production`

### Vercel (Frontend)

1. Deploy Next.js app
2. Set environment variable:
   ```
   NEXT_PUBLIC_SOCKET_URL=https://your-socket-server.onrender.com
   ```

---

## Need Help?

- Check the logs in the terminal
- Review `docs/` folder for detailed documentation
- Check browser console for client-side errors
