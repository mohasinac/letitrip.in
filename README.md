# JustForView E-commerce Platform

## 📖 Overview

**JustForView** is a modern e-commerce platform with an **independent API architecture** that can be used by web, mobile, or any external client.

### 🎯 Key Features

- ✅ **Independent RESTful API** - Multi-platform ready
- ✅ **Server-Side Authentication** - Secure JWT with HTTP-only cookies
- ✅ **Full TypeScript** - Type-safe throughout
- ✅ **Product Management** - Full CRUD with inventory
- ✅ **Auction System** - Live bidding with auto-bid
- ✅ **Payment Integration** - Razorpay
- ✅ **Shipping Integration** - Shiprocket API
- ✅ **SEO Optimized** - Next.js App Router

## 🚦 Quick Start

```bash
# Install dependencies
npm install

# Setup environment (copy .env.example to .env and fill values)
cp .env.example .env

# Run development server
npm run dev

# Visit http://localhost:3000
```

## 📚 Documentation

- **[Complete Setup Guide](./SETUP_GUIDE.md)** - Full setup instructions
- **[API Documentation](./API_DOCUMENTATION.md)** - API reference with examples

## 🏗️ Architecture

```
Client (Web/Mobile/External) → API Routes → Middleware → Services → Firebase/External APIs
```

### Project Structure

```
src/
├── app/api/              # API Routes (Backend)
├── lib/api/services/     # Business Logic
├── lib/auth/             # Authentication (Server-only)
├── lib/firebase/         # Firebase Admin SDK
└── types/                # Shared TypeScript Types
```

## 🔐 Security

- Server-side JWT generation and verification
- bcrypt password hashing (12 rounds)
- HTTP-only cookies for web
- Bearer tokens for mobile
- Rate limiting
- Input validation with Zod

## 📱 Using the API

### Web Client

```typescript
import { authApi } from "@/lib/api";
const { user, token } = await authApi.login({ email, password });
```

### Mobile/External

```bash
curl -X POST https://yoursite.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'
```

## 🌟 Tech Stack

- Next.js 14, React 18, TypeScript
- Firebase (Firestore, Auth, Storage)
- Tailwind CSS
- Razorpay, Shiprocket
- JWT, bcrypt, Zod, Axios

## 📄 License

MIT License
