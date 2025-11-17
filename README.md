# JustForView.in - Auction & E-commerce Platform

> **Modern, scalable auction and e-commerce platform built for the Indian market**  
> Zero-cost infrastructure | Production-ready | 100% Type-safe

[![Next.js](https://img.shields.io/badge/Next.js-16.0-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-FREE%20Tier-orange)](https://firebase.google.com/)
[![License](https://img.shields.io/badge/License-Proprietary-red)](LICENSE)

**Repository**: https://github.com/mohasinac/justforview.in  
**Branch**: `fix-ui`  
**Last Updated**: November 17, 2025  
**Build Status**: ✅ Passing (164/164 pages)

---

## 📋 Table of Contents

- [Features](#-features)
- [Quick Start](#-quick-start)
- [Documentation](#-documentation)
- [Architecture](#-architecture)
- [Technology Stack](#-technology-stack)
- [Project Structure](#-project-structure)
- [Development](#-development)
- [Deployment](#-deployment)
- [Testing](#-testing)
- [Contributing](#-contributing)

---

## 🚀 Features

### Core Platform

✅ **Multi-vendor E-commerce**

- Product catalog with hierarchical categories
- Advanced filtering and search
- Shopping cart with real-time updates
- Complete order lifecycle management
- Razorpay, PayPal, Cash on Delivery

✅ **Real-time Auction System**

- Live bidding with Firebase Realtime Database
- Multiple auction types (Regular, Reverse, Silent)
- Auto-bidding functionality
- Bid history and tracking
- Automated scheduling via Cloud Functions

✅ **Seller Dashboard**

- Product/auction management
- Order fulfillment
- Revenue analytics
- Inline editing & bulk operations
- Media upload with progress tracking

✅ **Admin Panel**

- User management with RBAC
- Content moderation
- Analytics dashboard
- Category hierarchy management
- System configuration

### Technical Highlights

✅ **Zero-Cost Infrastructure** - 100% FREE tier services ($0/month)  
✅ **Service Layer Architecture** - 25+ type-safe service classes  
✅ **100% TypeScript** - Zero compilation errors  
✅ **Real-time Features** - Firebase Realtime Database (no Socket.IO server needed)  
✅ **Production-Ready** - Comprehensive testing & documentation  
✅ **Media Management** - Firebase Storage integration with progress tracking

---

## 🎯 Quick Start

### Prerequisites

- Node.js 20+ (LTS)
- Firebase account (FREE tier)
- Vercel account (optional, FREE tier)

### Installation

```bash
# Clone repository
git clone https://github.com/mohasinac/justforview.in.git
cd justforview.in

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Configure Firebase credentials in .env.local
# See docs/project/00-QUICK-START.md for details

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

**Next Steps**: Read the [Quick Start Guide](docs/project/00-QUICK-START.md) for detailed setup instructions.

---

## 📚 Documentation

### Getting Started

| Document                                                          | Description               |
| ----------------------------------------------------------------- | ------------------------- |
| [Quick Start](docs/project/00-QUICK-START.md)                     | 5-minute onboarding guide |
| [Architecture Overview](docs/project/01-ARCHITECTURE-OVERVIEW.md) | System design & patterns  |
| [Service Layer Guide](docs/project/02-SERVICE-LAYER-GUIDE.md)     | API abstraction layer     |
| [Component Patterns](docs/project/03-COMPONENT-PATTERNS.md)       | React best practices      |

### For AI Agents & Developers

| Document                                                    | Description                  |
| ----------------------------------------------------------- | ---------------------------- |
| [AI Agent Guide](docs/ai/AI-AGENT-GUIDE.md)                 | Development patterns & tools |
| [Common Issues](docs/guides/COMMON-ISSUES-AND-SOLUTIONS.md) | Troubleshooting guide        |
| [Context Sharing](docs/CONTEXT-SHARING-GUIDE.md)            | How to share context with AI |

### Technical Documentation

| Category          | Location                                             |
| ----------------- | ---------------------------------------------------- |
| API Documentation | `docs/api-consolidation/`                            |
| Resource Guides   | `docs/resources/` (Products, Auctions, Orders, etc.) |
| Fix History       | `docs/fixes/` (All bug fixes & improvements)         |
| Deployment        | `docs/deployment/` (Vercel, Firebase)                |
| Testing           | `docs/testing/` (Test workflows)                     |

---

## 🏗️ Architecture

### System Design

```
┌─────────────────────────────────────────────────────────┐
│                     Next.js App Router                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Pages      │  │ API Routes   │  │  Components  │  │
│  │ (SSR + CSR)  │  │ (Backend)    │  │  (UI Layer)  │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                            │
                ┌───────────┴───────────┐
                │                       │
        ┌───────▼────────┐      ┌──────▼──────┐
        │ Service Layer  │      │  Firebase   │
        │  (25+ Services)│◄─────┤  Admin SDK  │
        └───────┬────────┘      └─────────────┘
                │
        ┌───────┴───────────────────────────────┐
        │                                       │
┌───────▼──────┐  ┌──────────────┐  ┌────────▼────────┐
│  Firestore   │  │   Storage    │  │  Realtime DB    │
│  (Database)  │  │  (Files)     │  │  (Auctions)     │
└──────────────┘  └──────────────┘  └─────────────────┘
```

### Key Principles

1. **Service Layer Pattern** - All API calls through dedicated services
2. **Server/Client Separation** - Server Components for data, Client for interactivity
3. **Type Safety** - 100% TypeScript with strict mode
4. **Zero Cost** - FREE tier infrastructure ($0/month)
5. **Real-time** - Firebase Realtime Database for auctions

**Learn More**: [Architecture Overview](docs/project/01-ARCHITECTURE-OVERVIEW.md)

---

## 💻 Technology Stack

### Frontend

- **Framework**: Next.js 16+ (App Router)
- **UI Library**: React 19
- **Language**: TypeScript 5.3
- **Styling**: Tailwind CSS 3.4
- **Forms**: React Hook Form + Zod
- **Icons**: Lucide React
- **Editor**: React Quill

### Backend

- **API**: Next.js API Routes
- **Database**: Firestore (NoSQL)
- **Storage**: Firebase Storage
- **Real-time**: Firebase Realtime Database
- **Auth**: Firebase Authentication
- **Functions**: Firebase Cloud Functions

### DevOps & Infrastructure

- **Hosting**: Vercel (FREE tier)
- **CDN**: Vercel Edge Network
- **Analytics**: Firebase Analytics
- **Monitoring**: Discord Webhooks
- **Caching**: In-memory (`src/lib/memory-cache.ts`)
- **Rate Limiting**: Custom (`src/lib/rate-limiter.ts`)

### Cost Savings

Replaced paid services with FREE alternatives:

| Service   | Before  | After                | Savings/Year |
| --------- | ------- | -------------------- | ------------ |
| Sentry    | $26/mo  | Firebase Analytics   | $312         |
| Redis     | $10/mo  | In-memory cache      | $120         |
| Socket.IO | Hosting | Firebase Realtime DB | FREE         |
| Slack     | $8/mo   | Discord Webhooks     | $96          |
| **Total** |         |                      | **$528+**    |

---

## 📁 Project Structure

```
justforview.in/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API Routes (Backend)
│   │   ├── (routes)/          # Page Routes (Frontend)
│   │   └── layout.tsx         # Root Layout
│   ├── components/            # React Components
│   │   ├── admin/            # Admin Panel
│   │   ├── seller/           # Seller Dashboard
│   │   ├── common/           # Shared Components
│   │   └── layout/           # Layout Components
│   ├── services/              # Service Layer (25+ services)
│   │   ├── auth.service.ts
│   │   ├── products.service.ts
│   │   ├── auctions.service.ts
│   │   └── ...
│   ├── lib/                   # Utility Libraries
│   │   ├── memory-cache.ts   # Redis replacement
│   │   ├── rate-limiter.ts   # API rate limiting
│   │   ├── firebase-*.ts     # Firebase utilities
│   │   └── date-utils.ts     # Safe date handling
│   ├── hooks/                 # Custom React Hooks
│   ├── contexts/              # React Context
│   ├── types/                 # TypeScript Types
│   └── constants/             # App Constants
├── docs/                      # Documentation
│   ├── project/              # Project guides
│   ├── ai/                   # AI development guides
│   ├── fixes/                # Bug fix history
│   ├── guides/               # How-to guides
│   └── deployment/           # Deployment docs
├── scripts/                   # Utility Scripts
├── functions/                 # Firebase Cloud Functions
├── public/                    # Static Assets
└── tests/                     # Test Workflows
```

**See Full Structure**: [Architecture Overview](docs/project/01-ARCHITECTURE-OVERVIEW.md#project-structure)

---

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev              # Start dev server (with Turbopack)
npm run type-check       # TypeScript validation
npm run lint             # ESLint checking

# Building
npm run build            # Production build
npm start                # Run production server

# Firebase
npm run functions:build  # Build Cloud Functions
npm run functions:serve  # Test functions locally
npm run functions:deploy # Deploy functions

# Deployment
npm run deploy:prod      # Deploy to Vercel
npm run deploy:firebase  # Deploy to Firebase
```

### Development Guidelines

**CRITICAL RULES:**

1. ❌ **NEVER call APIs directly** - Always use service layer
2. ❌ **NEVER use `any` type** - Strict TypeScript only
3. ❌ **NEVER mock data** - Use real APIs
4. ✅ **ALWAYS read existing code** before making changes
5. ✅ **ALWAYS use `safeToISOString()`** for dates
6. ✅ **ALWAYS wrap `useSearchParams()` in Suspense**
7. ✅ **ALWAYS use `mediaService.upload()`** for files

### Service Layer Usage

```typescript
// ❌ WRONG - Direct API call
const response = await fetch("/api/products");

// ❌ WRONG - Direct apiService
const response = await apiService.get("/api/products");

// ✅ CORRECT - Use service layer
import { productsService } from "@/services/products.service";
const products = await productsService.list({ status: "published" });
```

### Media Upload Pattern

```typescript
// ✅ CORRECT - Upload to Firebase Storage
import { mediaService } from "@/services/media.service";

const handleUpload = async (file: File) => {
  const result = await mediaService.upload({
    file,
    context: "product", // or 'auction', 'shop', etc.
  });

  // result.url is what gets saved to database
  setFormData((prev) => ({
    ...prev,
    images: [...prev.images, result.url],
  }));
};
```

**Learn More**: [Component Patterns](docs/project/03-COMPONENT-PATTERNS.md)

---

## 🚢 Deployment

### Vercel (Recommended)

```bash
# First time setup
vercel login
vercel link

# Deploy to production
npm run deploy:prod
```

### Firebase Functions

```bash
# Deploy Cloud Functions
npm run functions:build
npm run functions:deploy

# Deploy Firestore rules & indexes
firebase deploy --only firestore:rules,firestore:indexes,storage,database
```

### Environment Variables

Required variables (see `.env.example`):

- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`
- `NEXT_PUBLIC_FIREBASE_*` (8 variables)
- `JWT_SECRET`
- `DISCORD_WEBHOOK_URL` (optional)

**Sync to Vercel**:

```bash
npm run setup:vercel
```

**Full Guide**: [Deployment Documentation](docs/deployment/)

---

## � Key Features

### Service Layer (25+ Services)

Complete API abstraction layer:

- `authService` - Authentication
- `productsService` - Products CRUD
- `auctionsService` - Auctions & bidding
- `cartService` - Shopping cart
- `ordersService` - Order management
- `shopsService` - Vendor management
- `categoriesService` - Category hierarchy
- `reviewsService` - Reviews & ratings
- `mediaService` - File uploads
- `+ 16 more services`

**Complete List**: [Service Layer Guide](docs/project/02-SERVICE-LAYER-GUIDE.md)

### Real-time Auction System

- Live bidding with Firebase Realtime Database
- Auto-bid functionality
- Bid history tracking
- Auction timers with auto-close
- Winner determination
- No Socket.IO server needed (FREE Firebase tier)

### Multi-vendor Platform

- Individual seller shops
- Shop management dashboard
- Product/auction listings per shop
- Revenue analytics
- Order fulfillment
- Payout tracking

### Admin Panel

- User management (RBAC)
- Content moderation
- Category management
- Analytics dashboard
- Inline editing
- Bulk operations

---

## 🧪 Testing

### Test Workflows

11 comprehensive E2E test workflows with 140+ steps:

**User Workflows** (7):

1. Product Purchase (11 steps)
2. Auction Bidding (12 steps)
3. Support Tickets (12 steps)
4. Reviews & Ratings (12 steps)
5. Advanced Browsing (15 steps)
6. Advanced Auction (14 steps)
7. Order Fulfillment (11 steps)

**Seller Workflows** (2): 8. Product Creation (10 steps) 9. Inline Operations (15 steps)

**Admin Workflows** (2): 10. Category Management (12 steps) 11. Bulk Operations (14 steps)

### Running Tests

```bash
# Type checking
npm run type-check

# Build verification
npm run build
```

**Test Architecture**: [Testing Documentation](docs/testing/)

---

## 🔒 Security & Performance

### Security Features

✅ JWT Authentication  
✅ Role-Based Access Control (admin, seller, user)  
✅ Rate Limiting (sliding window)  
✅ Input Validation (Zod schemas)  
✅ Firestore Security Rules  
✅ Storage Security Rules  
✅ XSS Protection (React sanitization)  
✅ HTTPS Enforced (production)

### Performance Optimization

✅ Server Components (reduced JS)  
✅ In-memory Caching (5min TTL)  
✅ Image Optimization (Next.js Image)  
✅ Code Splitting (automatic)  
✅ Turbopack (faster builds)  
✅ Firebase Query Optimization

---

## 🤝 Contributing

### Development Workflow

1. Read [documentation](docs/)
2. Check existing code patterns
3. Use TypeScript (strict mode)
4. Use service layer (no direct API calls)
5. Test changes locally
6. Write clear commit messages

### Code Standards

- **TypeScript**: Strict mode, all types defined
- **ESLint**: Follow Next.js config
- **Service Layer**: All API calls through services
- **Components**: Server vs Client separation
- **Documentation**: Update docs when adding features

**Contributing Guide**: [CONTRIBUTING.md](docs/guides/CONTRIBUTING.md) (coming soon)

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/mohasinac/justforview.in/issues)
- **Documentation**: [docs/](docs/)
- **Discord**: Team notifications channel

---

## 📄 License

This project is private and proprietary. All rights reserved.

---

## 🎯 Project Status

**Current Version**: 1.0.0  
**Build Status**: ✅ Passing  
**Pages Generated**: 164/164  
**TypeScript Errors**: 0  
**Test Workflows**: 11 (140+ steps)  
**Production Ready**: ✅ Yes

---

**Built with ❤️ for zero-cost scalability**

Ready to start? Check out the [Quick Start Guide](docs/project/00-QUICK-START.md)!
