# JustForView.in - Auction & E-commerce Platform

Modern, scalable auction and e-commerce platform built for the Indian market with Next.js 16+, TypeScript, Firebase, and real-time bidding.

**Repository**: https://github.com/mohasinac/justforview.in  
**Current Branch**: component  
**Last Updated**: November 17, 2025

## 🚀 Features

### Auction System

- ✅ **Real-time Bidding**: Live auction updates using Firebase Realtime Database
- ✅ **Multiple Auction Types**: Regular, Reverse, and Silent auctions
- ✅ **Auto-bidding**: Automated bidding up to user-defined maximum
- ✅ **Auction Scheduling**: Automated start/end times with Firebase Cloud Functions
- ✅ **Bid History**: Complete audit trail of all bids
- ✅ **Zero Cost**: FREE tier Firebase for real-time features

### E-commerce

- ✅ **Multi-vendor Platform**: Support for multiple shops and sellers
- ✅ **Product Catalog**: Hierarchical categories with advanced filtering
- ✅ **Shopping Cart**: Session-based cart with real-time updates
- ✅ **Order Management**: Complete order lifecycle tracking
- ✅ **Coupon System**: Discount codes and promotional offers
- ✅ **Payment Integration**: Razorpay, PayPal, Cash on Delivery

### Development Guidelines

- **NEVER call APIs directly** - Always use the service layer
- **Read existing code** before making changes
- **TypeScript strict mode** - No `any` types allowed
- **Service layer pattern** - All API calls go through services
- **Component organization** - Server vs Client components
- **Follow patterns** in `docs/ai/AI-AGENT-GUIDE.md` and `docs/project/`
- **Test your changes** - Run test workflows before commits
- **No mocks** - We have real APIs ready

## 📐 Architecture & Stack

**Status**: ✅ **Production-Ready** (Last Updated: Nov 17, 2025)

### Technology Stack

- **Frontend**: Next.js 16+ (App Router), React 19, TypeScript 5.3
- **Backend**: Next.js API Routes, Firebase Admin SDK
- **Database**: Firestore (NoSQL), Firebase Realtime Database
- **Storage**: Firebase Storage (images/videos)
- **Authentication**: Firebase Auth
- **Styling**: Tailwind CSS 3.4
- **Forms**: React Hook Form + Zod validation
- **Deployment**: Vercel (FREE tier)

### Architecture Principles

1. **Service Layer Pattern** - All API calls through services (NO direct fetch)
2. **Server/Client Split** - Server Components for data, Client for interactivity
3. **Firebase Admin on Server** - Never use Client SDK for Storage operations
4. **TypeScript Strict** - No `any` types, comprehensive interfaces
5. **Zero Cost Infrastructure** - 100% FREE tier ($0/month)

### Cost Optimization (FREE Tier)

Replaced paid services with FREE alternatives, saving **$432+/year**:

- ✅ **Sentry** ($26/mo) → Firebase Analytics + Discord webhooks
- ✅ **Redis** ($10/mo) → In-memory cache (`src/lib/memory-cache.ts`)
- ✅ **Socket.IO** (hosting) → Firebase Realtime Database
- ✅ **Slack** → Discord webhooks

**Custom FREE Libraries**:
- `memory-cache.ts` - TTL-based caching
- `rate-limiter.ts` - Sliding window rate limiting
- `firebase-realtime.ts` - Real-time auction bidding
- `firebase-error-logger.ts` - Error tracking via Firebase Analytics
- `discord-notifier.ts` - Team notifications

### Key Features

- ✅ **25+ Service Classes**: Complete API abstraction layer
- ✅ **Service Layer Transformation**: Automatic data transformations
- ✅ **Zero TypeScript Errors**: 100% type-safe codebase
- ✅ **11 Test Workflows**: 140+ steps of comprehensive E2E testing
- ✅ **Real-time Auctions**: Firebase Realtime Database (FREE tier)
- ✅ **Multi-vendor Platform**: Individual seller shops
- ✅ **Complete Order Lifecycle**: From cart to delivery

### Documentation

- **[Quick Start](docs/project/00-QUICK-START.md)** - 5-minute onboarding
- **[Architecture Overview](docs/project/01-ARCHITECTURE-OVERVIEW.md)** - System design
- **[Service Layer Guide](docs/project/02-SERVICE-LAYER-GUIDE.md)** - API patterns
- **[Component Patterns](docs/project/03-COMPONENT-PATTERNS.md)** - React best practices
- **[AI Agent Guide](docs/ai/AI-AGENT-GUIDE.md)** - Development patterns

## 🧪 Testing & Quality

### Test Workflows (Complete Suite)

**11 comprehensive end-to-end test workflows** with 140+ steps covering all major platform operations:

#### User Workflows (7)

1. **Product Purchase** (11 steps) - Complete customer purchase journey
2. **Auction Bidding** (12 steps) - Bid placement and auction participation
3. **Support Tickets** (12 steps) - Customer service interaction
4. **Reviews & Ratings** (12 steps) - Post-purchase review submission
5. **Advanced Browsing** (15 steps) - Product discovery with filters
6. **Advanced Auction** (14 steps) - Complete auction experience
7. **Order Fulfillment** (11 steps) - Order processing flow

#### Seller Workflows (2)

8. **Seller Product Creation** (10 steps) - Product creation lifecycle ✨
9. **Seller Inline Operations** (15 steps) - Complex seller journey ✨

#### Admin Workflows (2)

10. **Admin Category Creation** (12 steps) - Category hierarchy management ✨
11. **Admin Inline Edits** (14 steps) - Bulk admin operations ✨

**Total**: 140+ test steps | **Status**: 100% Complete ✅

### Running Commands

```bash
# Development server
npm run dev              # Start dev server (with --turbopack)

# Type checking
npm run type-check       # TypeScript validation

# Building
npm run build            # Production build
npm start                # Run production server

# Firebase Functions (optional)
npm run functions:build  # Build Cloud Functions
npm run functions:serve  # Test locally
npm run functions:deploy # Deploy to Firebase

# Deployment
npm run deploy:prod      # Deploy to Vercel production
npm run deploy:firebase  # Deploy to Firebase
```

### Test Architecture

- **Type-Safe Helpers**: 8 helper classes with 60+ methods
- **BaseWorkflow Pattern**: Reusable workflow abstraction
- **0 TypeScript Errors**: Full type safety across 2,000+ lines
- **Comprehensive Logging**: Step-by-step execution tracking
- **Real APIs**: No mocks, all real service layer calls

### Code Quality

- **Zero TypeScript Errors**: Strict mode enabled
- **Comprehensive Types**: All entities have full type definitions
- **Service Layer**: 25+ services, all type-safe
- **Linting**: ESLint with Next.js config
- **Best Practices**: Documented in `docs/project/`

## 🔒 Security & Performance

### Authentication Flow

1. User submits credentials via `/login` or `/register` page
2. Request goes through rate limiting middleware
3. Backend verifies credentials with Firebase Authentication
4. JWT token generated and returned with user data
5. Token and user profile stored in localStorage
6. `AuthContext` provides global auth state
7. `AuthGuard` component protects authenticated routes
8. `apiService` automatically adds token to all API requests

### Role-Based Access Control (RBAC)

- **admin**: Full system access, manage users, products, auctions, categories
- **seller**: Create/manage products, shops, auctions, view analytics
- **user**: Browse, bid, purchase, manage orders, write reviews
- **guest**: Browse public content only (products, shops, auctions)

### Security Features

- ✅ **Rate Limiting**: Sliding window algorithm (`src/lib/rate-limiter.ts`)
- ✅ **Input Validation**: Zod schemas for all forms
- ✅ **Firestore Security Rules**: Row-level security
- ✅ **Storage Security Rules**: File type and size validation
- ✅ **JWT Authentication**: Secure token-based auth
- ✅ **HTTPS Only**: Enforced in production
- ✅ **XSS Protection**: React's built-in sanitization
- ✅ **CSRF Protection**: Token-based requests

### Performance Optimization

- ✅ **In-memory caching**: 5-minute TTL for frequently accessed data
- ✅ **Server Components**: Reduced client-side JavaScript
- ✅ **Image optimization**: Next.js Image component
- ✅ **Code splitting**: Automatic per-page bundling
- ✅ **Turbopack**: Faster builds in development
- ✅ **Firebase FREE tier**: Optimized queries to stay within limits

### Protected Routes

Use `AuthGuard` component to protect pages:

```tsx
<AuthGuard requireAuth={true} allowedRoles={["seller", "admin"]}>
  <SellerDashboard />
</AuthGuard>
```

## 📁 Project Structure

```
justforview.in/
├── src/
│   ├── app/                           # Next.js App Router (Pages & Routes)
│   │   ├── api/                       # API Routes
│   │   │   ├── lib/firebase/         # Firebase Admin & Client SDK
│   │   │   ├── middleware/           # Rate limiting, caching, logging
│   │   │   ├── auth/                 # Authentication endpoints
│   │   │   ├── auctions/             # Auction management endpoints
│   │   │   ├── products/             # Product CRUD endpoints
│   │   │   ├── cart/                 # Shopping cart endpoints
│   │   │   ├── orders/               # Order processing endpoints
│   │   │   └── health/               # Health check endpoint
│   │   ├── auctions/                 # Auction pages & details
│   │   ├── products/                 # Product listing & details
│   │   ├── seller/                   # Seller dashboard
│   │   ├── admin/                    # Admin panel
│   │   ├── cart/                     # Shopping cart page
│   │   ├── checkout/                 # Checkout flow
│   │   ├── user/                     # User profile & settings
│   │   ├── login/                    # Login page
│   │   ├── register/                 # Registration page
│   │   ├── unauthorized/             # 401 error page
│   │   ├── not-found.tsx             # 404 error page
│   │   ├── error.tsx                 # Error boundary
│   │   ├── global-error.tsx          # Global error boundary
│   │   └── layout.tsx                # Root layout with header/footer
│   ├── components/                   # React Components
│   │   ├── admin/                    # Admin-specific components
│   │   ├── auction/                  # Auction components (bidding, timer)
│   │   ├── auth/                     # Auth components (AuthGuard, login forms)
│   │   ├── cart/                     # Shopping cart components
│   │   ├── checkout/                 # Checkout flow components
│   │   ├── product/                  # Product display components
│   │   ├── seller/                   # Seller dashboard components
│   │   ├── shop/                     # Shop/vendor components
│   │   ├── layout/                   # Layout components (Header, Footer, Nav)
│   │   └── common/                   # Shared UI components
│   ├── services/                     # API Service Layer (NO MOCKS)
│   │   ├── api.service.ts            # Base HTTP client (DON'T USE DIRECTLY)
│   │   ├── auth.service.ts           # Authentication service
│   │   ├── auctions.service.ts       # Auction operations
│   │   ├── products.service.ts       # Product operations
│   │   ├── cart.service.ts           # Cart operations
│   │   ├── orders.service.ts         # Order operations
│   │   └── (25+ other services)      # See docs for complete list
│   ├── hooks/                        # Custom React Hooks
│   │   ├── useAuctionSocket.ts       # Real-time auction updates
│   │   ├── useCart.ts                # Shopping cart state
│   │   ├── useMediaUpload.ts         # File upload handling
│   │   └── useViewingHistory.ts      # Product view tracking
│   ├── contexts/                     # React Context Providers
│   │   ├── AuthContext.tsx           # Global auth state
│   │   └── UploadContext.tsx         # Upload queue state
│   ├── lib/                          # Utility Libraries
│   │   ├── memory-cache.ts           # In-memory cache (Redis replacement)
│   │   ├── rate-limiter.ts           # API rate limiting
│   │   ├── firebase-realtime.ts      # Real-time auction system
│   │   ├── firebase-error-logger.ts  # Error tracking
│   │   ├── discord-notifier.ts       # Team notifications
│   │   └── utils.ts                  # General utilities
│   ├── types/                        # TypeScript Type Definitions
│   └── constants/                    # App Constants & Config
│       ├── api-routes.ts             # Centralized API routes
│       ├── database.ts               # Firestore collection names
│       ├── inline-fields.ts          # Form field configurations
│       └── bulk-actions.ts           # Bulk action definitions
├── scripts/                          # Utility Scripts
│   ├── bulk-set-vercel-env.js        # Bulk environment sync to Vercel
│   ├── deploy-to-vercel-prod.ps1    # Production deployment
│   ├── set-vercel-env-from-local.ps1 # Sync .env to Vercel
│   └── migrate-categories-multi-parent.ts # Category migration
├── logs/                             # Application Logs
├── public/                           # Static Assets
├── docs/                             # Comprehensive Documentation
│   ├── ai/                           # AI Agent guides
│   ├── project/                      # Project documentation
│   └── resources/                    # Resource-specific docs
├── functions/                        # Firebase Cloud Functions
│   ├── src/                          # Function source code
│   └── lib/                          # Compiled JavaScript
├── .env.example                      # Environment variables template
├── firebase.json                     # Firebase configuration
├── vercel.json                       # Vercel deployment config
├── README.md                         # This file
└── package.json                      # Dependencies & scripts
```

## 🛠️ Setup & Installation

### Prerequisites

- Node.js 20+ (LTS recommended)
- npm or yarn
- Firebase account (FREE tier)
- Vercel account (FREE tier, optional for deployment)

### 1. Clone Repository

```bash
git clone https://github.com/mohasinac/justforview.in.git
cd justforview.in
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in your Firebase credentials (no Sentry needed):

```env
# Firebase Admin SDK (Backend - From Firebase Console → Service Account)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour Key Here\n-----END PRIVATE KEY-----\n"
FIREBASE_STORAGE_BUCKET=your-project-id.firebasestorage.app

# Firebase Client SDK (Frontend - From Firebase Console → Project Settings)
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your-project-id-default-rtdb.region.firebasedatabase.app

# Discord Notifications (Optional - Replace Slack)
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/your-webhook-url

# JWT Secret (Generate with: openssl rand -base64 32)
JWT_SECRET=your-super-secret-jwt-key-here

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 4. Firebase Setup

#### A. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add Project" or select existing project
3. Follow the setup wizard

#### B. Enable Firebase Services

**Authentication**:
- Go to Authentication → Sign-in method
- Enable "Email/Password"

**Firestore Database**:
- Go to Firestore Database → Create database
- Choose "Production mode"
- Select closest region (e.g., asia-south1 for India)
- Deploy rules: `firebase deploy --only firestore:rules,firestore:indexes`

**Firebase Storage**:
- Go to Storage → Get started
- Deploy rules: `firebase deploy --only storage`

**Realtime Database** (for auctions):
- Go to Realtime Database → Create database
- Choose closest region
- Start in "locked mode" (we have custom rules)
- Deploy rules: `firebase deploy --only database`

#### C. Get Firebase Credentials

**Service Account (Admin SDK)**:
1. Go to Project Settings → Service Accounts
2. Click "Generate New Private Key"
3. Save JSON file securely
4. Copy values to `.env.local`:
   - `project_id` → `FIREBASE_PROJECT_ID`
   - `client_email` → `FIREBASE_CLIENT_EMAIL`
   - `private_key` → `FIREBASE_PRIVATE_KEY`

**Web App Config (Client SDK)**:
1. Go to Project Settings → General
2. Scroll to "Your apps" → Web app
3. Click "Add app" if none exists
4. Copy config values to `.env.local` (all `NEXT_PUBLIC_FIREBASE_*`)

### 5. Deploy Firebase Configuration

```bash
# Deploy Firestore rules, indexes, and Storage rules
firebase deploy --only firestore:rules,firestore:indexes,storage,database

# Optional: Deploy Cloud Functions
npm run functions:build
npm run functions:deploy
```

### 6. Firestore Collections

Collections are created automatically when data is first added. Key collections:

- `users` - User profiles and authentication
- `products` - Product catalog
- `auctions` - Auction listings
- `bids` - Auction bid history (also in Realtime DB)
- `orders` - Order records
- `order_items` - Order line items
- `carts` - Shopping carts
- `shops` - Seller shops
- `categories` - Product categories
- `reviews` - Product/shop reviews
- `coupons` - Discount codes
- `support_tickets` - Customer support
- `hero_slides` - Homepage hero carousel

See `src/constants/database.ts` for complete list.

### 7. Run Development Server

```bash
npm run dev
```

The application will start on [http://localhost:3000](http://localhost:3000)

- **With Turbopack**: Faster builds and hot reloading
- **Real-time features**: Firebase Realtime Database (no Socket.IO server needed)

## 📚 Available Services (API Abstraction Layer)

**CRITICAL**: Never call APIs directly. Always use the service layer.

### Core Business Services

- `authService` - Authentication & sessions
- `productService` - Product CRUD & search
- `auctionService` - Auction management & bidding
- `categoryService` - Category hierarchy
- `shopService` - Shop/vendor management
- `cartService` - Shopping cart operations
- `orderService` - Order processing
- `reviewService` - Product reviews & ratings
- `userService` - User profile management
- `addressService` - User addresses

### Marketing & Content

- `couponService` - Discount codes
- `heroSlideService` - Homepage hero carousel
- `homepageService` - Homepage configuration
- `blogService` - Blog post management

### Support & Operations

- `supportService` - Support tickets
- `returnService` - Return requests
- `payoutService` - Seller payouts

### Utilities

- `mediaService` - File uploads (images, videos)
- `searchService` - Global search
- `analyticsService` - Analytics & insights
- `testDataService` - Test data generation (admin only)
- `favoritesService` - User wishlist
- `checkoutService` - Checkout process

### Usage Example

```typescript
// ❌ WRONG - Direct API call
fetch('/api/products')

// ❌ WRONG - Direct apiService
apiService.get('/api/products')

// ✅ CORRECT - Use service layer
import { productService } from '@/services/products.service'

// In Server Component
const products = await productService.getProducts({ status: 'published' })

// In Client Component
useEffect(() => {
  productService.getProducts().then(setProducts)
}, [])
```

**Documentation**: See [Service Layer Guide](docs/project/02-SERVICE-LAYER-GUIDE.md) for complete reference.

## 🎓 Learning Resources

### For AI Agents & New Developers

1. **[Quick Start Guide](docs/project/00-QUICK-START.md)** - 5-minute onboarding (START HERE!)
2. **[Architecture Overview](docs/project/01-ARCHITECTURE-OVERVIEW.md)** - System design & decisions
3. **[Service Layer Guide](docs/project/02-SERVICE-LAYER-GUIDE.md)** - How to use services
4. **[Component Patterns](docs/project/03-COMPONENT-PATTERNS.md)** - React best practices
5. **[AI Agent Guide](docs/ai/AI-AGENT-GUIDE.md)** - Development patterns & tools

### Resource Documentation

Located in `docs/resources/`, each resource has complete documentation:

- **Products** - Product catalog management
- **Auctions** - Auction system & bidding
- **Categories** - Hierarchical categories
- **Orders** - Order lifecycle
- **Shops** - Multi-vendor shops
- **Reviews** - Product reviews & ratings
- **Coupons** - Discount codes
- **And 8+ more**

Each document includes:
- Complete schema with all fields
- Relationships to other resources
- Filter configurations
- API routes
- Service methods
- Component patterns
- Bulk actions

## 🚢 Deployment

### Deploy to Vercel (Recommended)

```bash
# First time setup
vercel login
vercel link

# Deploy to production
npm run deploy:prod
```

### Deploy Firebase Functions

```bash
# Build and deploy
npm run functions:build
npm run functions:deploy
```

### Environment Variables (Vercel)

Sync local environment to Vercel:

```bash
# PowerShell
npm run setup:vercel
```

Or manually add in Vercel Dashboard → Project Settings → Environment Variables

## 📊 Monitoring & Maintenance

### Error Tracking

Errors are logged to:
- **Firebase Analytics** (automatic)
- **Discord Webhooks** (critical errors only)
- **Console logs** (development)

See `src/lib/firebase-error-logger.ts` for configuration.

### Performance Monitoring

- **Vercel Analytics**: Built-in performance monitoring
- **Firebase Performance**: Optional, can be enabled
- **Custom metrics**: Logged via `logPerformance()` in `firebase-error-logger.ts`

### Cache Management

```typescript
import { memoryCache } from '@/lib/memory-cache'

// Get cache statistics
const stats = memoryCache.getStats()
console.log(`Hits: ${stats.hits}, Misses: ${stats.misses}`)

// Clear cache
memoryCache.clear()
```

### Rate Limiting

Check rate limit status:

```typescript
import { apiRateLimiter } from '@/lib/rate-limiter'

// Check if identifier is allowed
const allowed = apiRateLimiter.check(userId)

// Cleanup expired entries
const cleaned = apiRateLimiter.cleanup()
```

## 🤝 Contributing

### Development Workflow

1. **Read documentation** - Understand the patterns
2. **Check existing code** - Follow established patterns
3. **Use TypeScript** - No `any` types
4. **Use service layer** - Never direct API calls
5. **Test your changes** - Run locally before committing
6. **Write clear commits** - Descriptive commit messages

### Code Standards

- **TypeScript**: Strict mode, all types defined
- **ESLint**: Follow Next.js config
- **Formatting**: Consistent indentation and style
- **Comments**: Explain non-obvious logic
- **Documentation**: Update docs when adding features

### Pull Request Guidelines

- Clear description of changes
- Link to related issues
- All tests passing
- No TypeScript errors
- Documentation updated if needed

## 📞 Support & Community

- **Issues**: [GitHub Issues](https://github.com/mohasinac/justforview.in/issues)
- **Discussions**: GitHub Discussions (coming soon)
- **Discord**: Team notifications channel

## 📄 License

This project is private and proprietary. All rights reserved.

---

**Built with ❤️ for zero-cost scalability**

Need help? Check the [docs](docs/) or open an issue on GitHub.
