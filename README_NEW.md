# JustForView.in 🎮

**Modern Next.js Platform with Real-time Beyblade Battle Game**

A full-stack web application featuring e-commerce functionality and an advanced multiplayer game with physics-based combat.

[![Deploy](https://img.shields.io/badge/Deploy-Vercel-black)](https://vercel.com)
[![License](https://img.shields.io/badge/License-MIT-blue)](LICENSE)
[![Node](https://img.shields.io/badge/Node-20.x-green)](https://nodejs.org)

---

## ✨ Features

### E-commerce Platform

- 🛍️ Product categories with stock management
- 🔐 Firebase authentication (Google, email/password)
- 📱 Responsive design with Material-UI
- 🎨 Dark/Light theme support
- 📊 Admin dashboard for content management

### Beyblade Battle Game

- ⚡ **Real-time multiplayer** via Socket.IO
- 🎮 **Physics-based combat** using Newton's laws
- 💪 **Power system** (0-25) for special moves
- 📱 **Mobile controls** with virtual joystick
- 🤖 **Smart AI opponent** for single-player
- 🌐 **WebGL rendering** via PixiJS

---

## 🚀 Quick Start

### Prerequisites

- Node.js 20.x or higher
- npm or yarn

### Installation

```bash
# Clone repository
git clone https://github.com/mohasinac/justforview.in.git
cd justforview.in

# Install dependencies
npm install
```

### Development

```bash
# Run everything (frontend + socket server)
npm run dev

# Access:
# Frontend: http://localhost:3000
# Socket Server: http://localhost:3001
```

### Build for Production

```bash
# Build Next.js app
npm run build

# Start production server
npm start

# Start socket server separately
npm run start:socket
```

---

## 📁 Project Structure

```
justforview.in/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── game/              # Beyblade game
│   │   ├── products/          # Product pages
│   │   ├── admin/             # Admin dashboard
│   │   └── api/               # API routes
│   ├── components/            # Reusable components
│   ├── contexts/              # React contexts
│   └── lib/                   # Utilities & config
├── server.js                  # Socket.IO server
├── docs/                      # Documentation
│   └── GAME_SYSTEM_COMPLETE.md  # Game documentation
└── public/                    # Static assets
```

---

## 🎮 Game Controls

### Desktop

- **Movement**: Mouse movement
- **Dodge Left**: Q or Left Click
- **Dodge Right**: E or Right Click
- **Heavy Attack**: R or Middle Click
- **Ultimate**: F or Double Click

### Mobile/Touch

- **Movement**: Virtual joystick (drag)
- **Special Moves**: On-screen buttons

---

## 🔧 Configuration

### Environment Variables

Create `.env.local`:

```bash
# Socket.IO Server (production)
NEXT_PUBLIC_SOCKET_URL=https://your-server.render.com

# Firebase (optional, for auth)
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project
```

---

## 🚢 Deployment

### Option 1: Split Deployment (Recommended)

**Frontend** → Vercel

```bash
# Auto-deploy via Git
git push origin main
```

**Backend** → Render

```bash
# Deploy socket server
# See DEPLOYMENT_COMPLETE.md for details
```

### Option 2: Single Server

Deploy everything to a single Node.js server:

```bash
npm run build
npm start
```

---

## 📚 Documentation

- **[Game System Complete](docs/GAME_SYSTEM_COMPLETE.md)** - Full game documentation
- **[Deployment Guide](DEPLOYMENT_COMPLETE.md)** - Production deployment
- **[Power System](docs/POWER_SYSTEM_IMPLEMENTATION.md)** - Power mechanics
- **[Collision System](COLLISION_SYSTEM_VERIFICATION.md)** - Physics implementation

---

## 🎯 Tech Stack

### Frontend

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **UI Library**: Material-UI (MUI) v6
- **Rendering**: PixiJS v8 (WebGL)
- **Authentication**: Firebase Auth

### Backend

- **Runtime**: Node.js 20.x
- **WebSocket**: Socket.IO v4
- **Database**: Firebase Firestore
- **Storage**: Firebase Storage

### DevOps

- **Hosting**: Vercel (frontend) + Render (backend)
- **CI/CD**: Git-based auto-deployment
- **Monitoring**: Vercel Analytics

---

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🐛 Known Issues

- Multiplayer reconnection not supported (must restart match)
- Mobile Safari may have touch delay issues
- Server capacity limited to 10 concurrent games (20 players)

See [Issues](https://github.com/mohasinac/justforview.in/issues) for full list.

---

## 🗺️ Roadmap

- [ ] Multiple beyblade types with unique stats
- [ ] Tournament mode (4+ players)
- [ ] Replay system
- [ ] Mobile app (React Native)
- [ ] Power-up pickups

---

## 📞 Support

- **Email**: support@justforview.in
- **Issues**: [GitHub Issues](https://github.com/mohasinac/justforview.in/issues)
- **Discussions**: [GitHub Discussions](https://github.com/mohasinac/justforview.in/discussions)

---

## 🙏 Acknowledgments

- Beyblade franchise for inspiration
- PixiJS team for the rendering engine
- Socket.IO team for real-time capabilities
- Material-UI team for the component library

---

**Made with ❤️ by [Your Team]**
