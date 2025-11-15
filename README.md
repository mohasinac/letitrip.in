# Letitrip.in - Auction & E-commerce Platform

Modern, scalable auction and e-commerce platform built for the Indian market with Next.js 15+, TypeScript, Firebase, and Socket.IO.

**Repository**: https://github.com/mohasinac/letitrip.in

## 🚀 Features

### Auction System

- ✅ **Real-time Bidding**: Live auction updates using Socket.IO
- ✅ **Multiple Auction Types**: Regular, Reverse, and Silent auctions
- ✅ **Auto-bidding**: Automated bidding up to user-defined maximum
- ✅ **Auction Scheduling**: Automated start/end times with notifications
- ✅ **Bid History**: Complete audit trail of all bids

### E-commerce

- ✅ **Multi-vendor Platform**: Support for multiple shops and sellers
- ✅ **Product Catalog**: Hierarchical categories with advanced filtering
- ✅ **Shopping Cart**: Session-based cart with real-time updates
- ✅ **Order Management**: Complete order lifecycle tracking
- ✅ **Coupon System**: Discount codes and promotional offers

### Development Guidelines

- Read existing code before making changes
- Use the service layer for all API calls
- Add TypeScript types for new features
- Write clear, concise commit messages
- Test thoroughly before submitting PR
- Follow the patterns in `AI-AGENT-GUIDE.md`

## 📐 Type System Architecture

**Status**: ✅ **Production-Ready Type System** (100% Complete - Nov 15, 2025)

This project uses a **strict FE/BE type separation** pattern for maximum type safety:

### Architecture Pattern

```
Backend API Response (BE Types)
  ↓ Transform Layer
Frontend UI Data (FE Types)
  ↓ Components
React UI
```

### Key Features

- ✅ **12 Complete Entity Type Systems**: Product, User, Order, Cart, Auction, Category, Shop, Review, Address, Coupon, SupportTicket, Return
- ✅ **Service Layer Transformation**: All services automatically convert BE → FE types
- ✅ **Zero TypeScript Errors**: 594 → 0 errors (100% reduction)
- ✅ **Type-Safe by Default**: Components receive correct FE types automatically
- ✅ **36+ Type Files**: Backend, Frontend, and Transform layers

### Usage Example

```typescript
// Service layer handles transformation automatically
const product = await productService.getProduct(id); // Returns ProductFE

// Component receives UI-optimized type
<ProductCard product={product} />; // product.formattedPrice, product.badges, etc.

// No manual transformation needed!
```

### Documentation

- **[Type System Status](docs/type-system/TYPE-SYSTEM-STATUS.md)** - Current completion status
- **[Migration Guide](docs/type-system/TYPE-MIGRATION-GUIDE.md)** - How to use the type system
- **[Final Checklist](docs/type-system/TYPE-SYSTEM-FINAL-CHECKLIST.md)** - Detailed progress tracking

### Benefits

- 🎯 **Type Safety**: Catch errors at compile time, not runtime
- 🚀 **Developer Experience**: IntelliSense shows exact fields available
- 📦 **UI-Optimized**: FE types include formatted strings, computed fields, badges
- 🔧 **Maintainable**: Clear separation between API and UI concerns
- ✅ **Production Ready**: Zero compilation errors

## 🧪 Testing

### Test Workflows (Complete Suite)

**11 comprehensive end-to-end test workflows** covering all major platform operations:

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

### Running Tests

```bash
# Run individual workflows
npm run test:workflow:1    # Product Purchase
npm run test:workflow:8    # Seller Product Creation (NEW)
npm run test:workflow:11   # Admin Inline Edits (NEW)

# Run all workflows
npm run test:workflows:all

# Run only new workflows (#8-11)
npm run test:workflows:new

# Interactive UI Dashboard
npm run dev
# Then visit: http://localhost:3000/test-workflows
```

### Test Architecture

- **Type-Safe Helpers**: 8 helper classes with 60+ methods
- **BaseWorkflow Pattern**: Reusable workflow abstraction
- **0 TypeScript Errors**: Full type safety across 2,000+ lines
- **Comprehensive Logging**: Step-by-step execution tracking
- **Real APIs**: No mocks, all real service layer calls

For detailed documentation, see [tests/README.md](./tests/README.md)

## 🔒 Authentication & Security

### Authentication Flow

1. User submits credentials via `/login` or `/register` page
2. Request goes through middleware (rate limiting, logging)
3. Backend verifies credentials with Firebase Authentication
4. Custom token is generated and returned with user data
5. Token and user profile stored in localStorage
6. `AuthContext` provides global auth state
7. `AuthGuard` component protects authenticated routes
8. `apiService` automatically adds token to all API requests

### Role-Based Access Control (RBAC)

- **admin**: Full system access, manage users, products, auctions
- **seller**: Create/manage products, shops, and auctions
- **user**: Browse, bid, purchase, manage orders
- **guest**: Browse public content only

### Protected Routes

Use `AuthGuard` component to protect pages:

```tsx
<AuthGuard requireAuth={true} allowedRoles={["seller", "admin"]}>
  <SellerDashboard />
</AuthGuard>
```

## 📁 Project Structure

```
letitrip.in/
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
│   │   ├── api.service.ts            # Base HTTP client
│   │   ├── auth.service.ts           # Authentication service
│   │   ├── auctions.service.ts       # Auction operations
│   │   ├── products.service.ts       # Product operations
│   │   ├── cart.service.ts           # Cart operations
│   │   ├── orders.service.ts         # Order operations
│   │   └── media.service.ts          # Media upload/management
│   ├── hooks/                        # Custom React Hooks
│   │   ├── useAuctionSocket.ts       # Real-time auction updates
│   │   ├── useCart.ts                # Shopping cart state
│   │   ├── useMediaUpload.ts         # File upload handling
│   │   └── useViewingHistory.ts      # Product view tracking
│   ├── contexts/                     # React Context Providers
│   │   ├── AuthContext.tsx           # Global auth state
│   │   └── UploadContext.tsx         # Upload queue state
│   ├── lib/                          # Utility Libraries
│   │   ├── socket-server.ts          # Socket.IO server setup
│   │   ├── auction-scheduler.ts      # Automated auction timing
│   │   ├── rbac.ts                   # Role-based access control
│   │   ├── formatters.ts             # Date, currency formatters
│   │   └── utils.ts                  # General utilities
│   ├── types/                        # TypeScript Type Definitions
│   └── constants/                    # App Constants & Config
├── scripts/                          # Utility Scripts
│   ├── test-api.js                   # API endpoint testing
│   ├── test-auction-automation.js    # Auction system tests
│   └── load-test.js                  # Performance testing
├── logs/                             # Application Logs
├── public/                           # Static Assets
├── .env.example                      # Environment variables template
├── firebase.json                     # Firebase configuration
├── server.js                         # Custom Next.js server
├── README.md                         # This file
├── AI-AGENT-GUIDE.md                 # AI Agent development guide
└── package.json
```

## 🛠️ Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in your Firebase and Sentry credentials:

```env
# Firebase Admin SDK (Backend)
FIREBASE_PROJECT_ID=letitrip-in-app
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@letitrip-in-app.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour Key\n-----END PRIVATE KEY-----\n"
FIREBASE_STORAGE_BUCKET=letitrip-in-app.firebasestorage.app

# Firebase Client SDK (Frontend)
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=letitrip-in-app.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=letitrip-in-app
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=letitrip-in-app.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://letitrip-in-app-default-rtdb.asia-southeast1.firebasedatabase.app

# Sentry (Error Tracking)
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
SENTRY_AUTH_TOKEN=your-sentry-auth-token

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### 3. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing
3. Enable Authentication > Email/Password
4. Create Firestore Database with rules from `firestore.rules`
5. Enable Firebase Storage with rules from `storage.rules`
6. Create indexes from `firestore.indexes.json`
7. Generate service account key:
   - Go to Project Settings > Service Accounts
   - Click "Generate New Private Key"
   - Copy credentials to `.env.local`

### 4. Firebase Collections Setup

Create these Firestore collections:

- `users` - User profiles
- `products` - Product listings
- `auctions` - Auction items
- `bids` - Bid history
- `orders` - Order records
- `carts` - Shopping carts
- `shops` - Seller shops
- `categories` - Product categories
- `coupons` - Discount codes

### 5. Run Development Server

```bash
npm run dev
```

The application will start on [http://localhost:3000](http://localhost:3000)

Socket.IO server will run on the same port for real-time features.

## 📚 API Quick Reference

### Authentication

#### Register

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"securePassword123","name":"John Doe"}'
```

#### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"securePassword123"}'
```

### Auctions

#### Get Active Auctions

```bash
curl http://localhost:3000/api/auctions?status=active
```

#### Place Bid

```bash
curl -X POST http://localhost:3000/api/auctions/[id]/bids \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"amount":1000}'
```

### Products

#### Search Products

```bash
curl "http://localhost:3000/api/products?search=laptop&category=electronics"
```

#### Get Product Details

```bash
curl http://localhost:3000/api/products/[id]
```

### Cart

#### Add to Cart

```bash
curl -X POST http://localhost:3000/api/cart \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"productId":"abc123","quantity":1}'
```

### Health Check

```bash
curl http://localhost:3000/api/health
```

## 🔒 Authentication & Security

### Authentication Flow

1. User submits credentials via `/login` or `/register` page
2. Request goes through middleware (rate limiting, logging)
3. Backend verifies credentials with Firebase Authentication
4. Custom token is generated and returned with user data
5. Token and user profile stored in localStorage
6. `AuthContext` provides global auth state
7. `AuthGuard` component protects authenticated routes
8. `apiService` automatically adds token to all API requests

### Role-Based Access Control (RBAC)

- **admin**: Full system access, manage users, products, auctions
- **seller**: Create/manage products, shops, and auctions
- **user**: Browse, bid, purchase, manage orders
- **guest**: Browse public content only

### Protected Routes

Use `AuthGuard` component to protect pages:

```tsx
<AuthGuard requireAuth={true} allowedRoles={["seller", "admin"]}>
  <SellerDashboard />
</AuthGuard>
```

## 📁 Project Structure

```
letitrip.in/
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
│   │   ├── api.service.ts            # Base HTTP client
│   │   ├── auth.service.ts           # Authentication service
│   │   ├── auctions.service.ts       # Auction operations
│   │   ├── products.service.ts       # Product operations
│   │   ├── cart.service.ts           # Cart operations
│   │   ├── orders.service.ts         # Order operations
│   │   └── media.service.ts          # Media upload/management
│   ├── hooks/                        # Custom React Hooks
│   │   ├── useAuctionSocket.ts       # Real-time auction updates
│   │   ├── useCart.ts                # Shopping cart state
│   │   ├── useMediaUpload.ts         # File upload handling
│   │   └── useViewingHistory.ts      # Product view tracking
│   ├── contexts/                     # React Context Providers
│   │   ├── AuthContext.tsx           # Global auth state
│   │   └── UploadContext.tsx         # Upload queue state
│   ├── lib/                          # Utility Libraries
│   │   ├── socket-server.ts          # Socket.IO server setup
│   │   ├── auction-scheduler.ts      # Automated auction timing
│   │   ├── rbac.ts                   # Role-based access control
│   │   ├── formatters.ts             # Date, currency formatters
│   │   └── utils.ts                  # General utilities
│   ├── types/                        # TypeScript Type Definitions
│   └── constants/                    # App Constants & Config
├── scripts/                          # Utility Scripts
│   ├── test-api.js                   # API endpoint testing
│   ├── test-auction-automation.js    # Auction system tests
│   └── load-test.js                  # Performance testing
├── logs/                             # Application Logs
├── public/                           # Static Assets
├── .env.example                      # Environment variables template
├── firebase.json                     # Firebase configuration
├── server.js                         # Custom Next.js server
├── README.md                         # This file
├── AI-AGENT-GUIDE.md                 # AI Agent development guide
└── package.json
```

## 🛠️ Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in your Firebase and Sentry credentials:

```env
# Firebase Admin SDK (Backend)
FIREBASE_PROJECT_ID=letitrip-in-app
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@letitrip-in-app.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour Key\n-----END PRIVATE KEY-----\n"
FIREBASE_STORAGE_BUCKET=letitrip-in-app.firebasestorage.app

# Firebase Client SDK (Frontend)
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=letitrip-in-app.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=letitrip-in-app
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=letitrip-in-app.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://letitrip-in-app-default-rtdb.asia-southeast1.firebasedatabase.app

# Sentry (Error Tracking)
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
SENTRY_AUTH_TOKEN=your-sentry-auth-token

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### 3. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing
3. Enable Authentication > Email/Password
4. Create Firestore Database with rules from `firestore.rules`
5. Enable Firebase Storage with rules from `storage.rules`
6. Create indexes from `firestore.indexes.json`
7. Generate service account key:
   - Go to Project Settings > Service Accounts
   - Click "Generate New Private Key"
   - Copy credentials to `.env.local`

### 4. Firebase Collections Setup

Create these Firestore collections:

- `users` - User profiles
- `products` - Product listings
- `auctions` - Auction items
- `bids` - Bid history
- `orders` - Order records
- `carts` - Shopping carts
- `shops` - Seller shops
- `categories` - Product categories
- `coupons` - Discount codes

### 5. Run Development Server

```bash
npm run dev
```

The application will start on [http://localhost:3000](http://localhost:3000)

Socket.IO server will run on the same port for real-time features.

## 📚 API Quick Reference

### Authentication

#### Register

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"securePassword123","name":"John Doe"}'
```

#### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"securePassword123"}'
```

### Auctions

#### Get Active Auctions

```bash
curl http://localhost:3000/api/auctions?status=active
```

#### Place Bid

```bash
curl -X POST http://localhost:3000/api/auctions/[id]/bids \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"amount":1000}'
```

### Products

#### Search Products

```bash
curl "http://localhost:3000/api/products?search=laptop&category=electronics"
```

#### Get Product Details

```bash
curl http://localhost:3000/api/products/[id]
```

### Cart

#### Add to Cart

```bash
curl -X POST http://localhost:3000/api/cart \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"productId":"abc123","quantity":1}'
```

### Health Check

```bash
curl http://localhost:3000/api/health
```

## 🔒 Authentication & Security

### Authentication Flow

1. User submits credentials via `/login` or `/register` page
2. Request goes through middleware (rate limiting, logging)
3. Backend verifies credentials with Firebase Authentication
4. Custom token is generated and returned with user data
5. Token and user profile stored in localStorage
6. `AuthContext` provides global auth state
7. `AuthGuard` component protects authenticated routes
8. `apiService` automatically adds token to all API requests

### Role-Based Access Control (RBAC)

- **admin**: Full system access, manage users, products, auctions
- **seller**: Create/manage products, shops, and auctions
- **user**: Browse, bid, purchase, manage orders
- **guest**: Browse public content only

### Protected Routes

Use `AuthGuard` component to protect pages:

```tsx
<AuthGuard requireAuth={true} allowedRoles={["seller", "admin"]}>
  <SellerDashboard />
</AuthGuard>
```

## 📁 Project Structure

```
letitrip.in/
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
│   │   ├── api.service.ts            # Base HTTP client
│   │   ├── auth.service.ts           # Authentication service
│   │   ├── auctions.service.ts       # Auction operations
│   │   ├── products.service.ts       # Product operations
│   │   ├── cart.service.ts           # Cart operations
│   │   ├── orders.service.ts         # Order operations
│   │   └── media.service.ts          # Media upload/management
│   ├── hooks/                        # Custom React Hooks
│   │   ├── useAuctionSocket.ts       # Real-time auction updates
│   │   ├── useCart.ts                # Shopping cart state
│   │   ├── useMediaUpload.ts         # File upload handling
│   │   └── useViewingHistory.ts      # Product view tracking
│   ├── contexts/                     # React Context Providers
│   │   ├── AuthContext.tsx           # Global auth state
│   │   └── UploadContext.tsx         # Upload queue state
│   ├── lib/                          # Utility Libraries
│   │   ├── socket-server.ts          # Socket.IO server setup
│   │   ├── auction-scheduler.ts      # Automated auction timing
│   │   ├── rbac.ts                   # Role-based access control
│   │   ├── formatters.ts             # Date, currency formatters
│   │   └── utils.ts                  # General utilities
│   ├── types/                        # TypeScript Type Definitions
│   └── constants/                    # App Constants & Config
├── scripts/                          # Utility Scripts
│   ├── test-api.js                   # API endpoint testing
│   ├── test-auction-automation.js    # Auction system tests
│   └── load-test.js                  # Performance testing
├── logs/                             # Application Logs
├── public/                           # Static Assets
├── .env.example                      # Environment variables template
├── firebase.json                     # Firebase configuration
├── server.js                         # Custom Next.js server
├── README.md                         # This file
├── AI-AGENT-GUIDE.md                 # AI Agent development guide
└── package.json
```

## 🛠️ Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in your Firebase and Sentry credentials:

```env
# Firebase Admin SDK (Backend)
FIREBASE_PROJECT_ID=letitrip-in-app
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@letitrip-in-app.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour Key\n-----END PRIVATE KEY-----\n"
FIREBASE_STORAGE_BUCKET=letitrip-in-app.firebasestorage.app

# Firebase Client SDK (Frontend)
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=letitrip-in-app.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=letitrip-in-app
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=letitrip-in-app.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://letitrip-in-app-default-rtdb.asia-southeast1.firebasedatabase.app

# Sentry (Error Tracking)
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
SENTRY_AUTH_TOKEN=your-sentry-auth-token

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### 3. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing
3. Enable Authentication > Email/Password
4. Create Firestore Database with rules from `firestore.rules`
5. Enable Firebase Storage with rules from `storage.rules`
6. Create indexes from `firestore.indexes.json`
7. Generate service account key:
   - Go to Project Settings > Service Accounts
   - Click "Generate New Private Key"
   - Copy credentials to `.env.local`

### 4. Firebase Collections Setup

Create these Firestore collections:

- `users` - User profiles
- `products` - Product listings
- `auctions` - Auction items
- `bids` - Bid history
- `orders` - Order records
- `carts` - Shopping carts
- `shops` - Seller shops
- `categories` - Product categories
- `coupons` - Discount codes

### 5. Run Development Server

```bash
npm run dev
```

The application will start on [http://localhost:3000](http://localhost:3000)

Socket.IO server will run on the same port for real-time features.

## 📚 API Quick Reference

### Authentication

#### Register

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"securePassword123","name":"John Doe"}'
```

#### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"securePassword123"}'
```

### Auctions

#### Get Active Auctions

```bash
curl http://localhost:3000/api/auctions?status=active
```

#### Place Bid

```bash
curl -X POST http://localhost:3000/api/auctions/[id]/bids \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"amount":1000}'
```

### Products

#### Search Products

```bash
curl "http://localhost:3000/api/products?search=laptop&category=electronics"
```

#### Get Product Details

```bash
curl http://localhost:3000/api/products/[id]
```

### Cart

#### Add to Cart

```bash
curl -X POST http://localhost:3000/api/cart \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"productId":"abc123","quantity":1}'
```

### Health Check

```bash
curl http://localhost:3000/api/health
```

## 🔒 Authentication & Security

### Authentication Flow

1. User submits credentials via `/login` or `/register` page
2. Request goes through middleware (rate limiting, logging)
3. Backend verifies credentials with Firebase Authentication
4. Custom token is generated and returned with user data
5. Token and user profile stored in localStorage
6. `AuthContext` provides global auth state
7. `AuthGuard` component protects authenticated routes
8. `apiService` automatically adds token to all API requests

### Role-Based Access Control (RBAC)

- **admin**: Full system access, manage users, products, auctions
- **seller**: Create/manage products, shops, and auctions
- **user**: Browse, bid, purchase, manage orders
- **guest**: Browse public content only

### Protected Routes

Use `AuthGuard` component to protect pages:

```tsx
<AuthGuard requireAuth={true} allowedRoles={["seller", "admin"]}>
  <SellerDashboard />
</AuthGuard>
```

## 📁 Project Structure

```
letitrip.in/
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
│   │   ├── api.service.ts            # Base HTTP client
│   │   ├── auth.service.ts           # Authentication service
│   │   ├── auctions.service.ts       # Auction operations
│   │   ├── products.service.ts       # Product operations
│   │   ├── cart.service.ts           # Cart operations
│   │   ├── orders.service.ts         # Order operations
│   │   └── media.service.ts          # Media upload/management
│   ├── hooks/                        # Custom React Hooks
│   │   ├── useAuctionSocket.ts       # Real-time auction updates
│   │   ├── useCart.ts                # Shopping cart state
│   │   ├── useMediaUpload.ts         # File upload handling
│   │   └── useViewingHistory.ts      # Product view tracking
│   ├── contexts/                     # React Context Providers
│   │   ├── AuthContext.tsx           # Global auth state
│   │   └── UploadContext.tsx         # Upload queue state
│   ├── lib/                          # Utility Libraries
│   │   ├── socket-server.ts          # Socket.IO server setup
│   │   ├── auction-scheduler.ts      # Automated auction timing
│   │   ├── rbac.ts                   # Role-based access control
│   │   ├── formatters.ts             # Date, currency formatters
│   │   └── utils.ts                  # General utilities
│   ├── types/                        # TypeScript Type Definitions
│   └── constants/                    # App Constants & Config
├── scripts/                          # Utility Scripts
│   ├── test-api.js                   # API endpoint testing
│   ├── test-auction-automation.js    # Auction system tests
│   └── load-test.js                  # Performance testing
├── logs/                             # Application Logs
├── public/                           # Static Assets
├── .env.example                      # Environment variables template
├── firebase.json                     # Firebase configuration
├── server.js                         # Custom Next.js server
├── README.md                         # This file
├── AI-AGENT-GUIDE.md                 # AI Agent development guide
└── package.json
```

## 🛠️ Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in your Firebase and Sentry credentials:

```env
# Firebase Admin SDK (Backend)
FIREBASE_PROJECT_ID=letitrip-in-app
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@letitrip-in-app.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour Key\n-----END PRIVATE KEY-----\n"
FIREBASE_STORAGE_BUCKET=letitrip-in-app.firebasestorage.app

# Firebase Client SDK (Frontend)
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=letitrip-in-app.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=letitrip-in-app
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=letitrip-in-app.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://letitrip-in-app-default-rtdb.asia-southeast1.firebasedatabase.app

# Sentry (Error Tracking)
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
SENTRY_AUTH_TOKEN=your-sentry-auth-token

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### 3. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing
3. Enable Authentication > Email/Password
4. Create Firestore Database with rules from `firestore.rules`
5. Enable Firebase Storage with rules from `storage.rules`
6. Create indexes from `firestore.indexes.json`
7. Generate service account key:
   - Go to Project Settings > Service Accounts
   - Click "Generate New Private Key"
   - Copy credentials to `.env.local`

### 4. Firebase Collections Setup

Create these Firestore collections:

- `users` - User profiles
- `products` - Product listings
- `auctions` - Auction items
- `bids` - Bid history
- `orders` - Order records
- `carts` - Shopping carts
- `shops` - Seller shops
- `categories` - Product categories
- `coupons` - Discount codes

### 5. Run Development Server

```bash
npm run dev
```

The application will start on [http://localhost:3000](http://localhost:3000)

Socket.IO server will run on the same port for real-time features.

## 📚 API Quick Reference

### Authentication

#### Register

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"securePassword123","name":"John Doe"}'
```

#### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"securePassword123"}'
```

### Auctions

#### Get Active Auctions

```bash
curl http://localhost:3000/api/auctions?status=active
```

#### Place Bid

```bash
curl -X POST http://localhost:3000/api/auctions/[id]/bids \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"amount":1000}'
```

### Products

#### Search Products

```bash
curl "http://localhost:3000/api/products?search=laptop&category=electronics"
```

#### Get Product Details

```bash
curl http://localhost:3000/api/products/[id]
```

### Cart

#### Add to Cart

```bash
curl -X POST http://localhost:3000/api/cart \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"productId":"abc123","quantity":1}'
```

### Health Check

```bash
curl http://localhost:3000/api/health
```

## 🔒 Authentication & Security

### Authentication Flow

1. User submits credentials via `/login` or `/register` page
2. Request goes through middleware (rate limiting, logging)
3. Backend verifies credentials with Firebase Authentication
4. Custom token is generated and returned with user data
5. Token and user profile stored in localStorage
6. `AuthContext` provides global auth state
7. `AuthGuard` component protects authenticated routes
8. `apiService` automatically adds token to all API requests

### Role-Based Access Control (RBAC)

- **admin**: Full system access, manage users, products, auctions
- **seller**: Create/manage products, shops, and auctions
- **user**: Browse, bid, purchase, manage orders
- **guest**: Browse public content only

### Protected Routes

Use `AuthGuard` component to protect pages:

```tsx
<AuthGuard requireAuth={true} allowedRoles={["seller", "admin"]}>
  <SellerDashboard />
</AuthGuard>
```

## 📁 Project Structure

```
letitrip.in/
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
│   │   ├── api.service.ts            # Base HTTP client
│   │   ├── auth.service.ts           # Authentication service
│   │   ├── auctions.service.ts       # Auction operations
│   │   ├── products.service.ts       # Product operations
│   │   ├── cart.service.ts           # Cart operations
│   │   ├── orders.service.ts         # Order operations
│   │   └── media.service.ts          # Media upload/management
│   ├── hooks/                        # Custom React Hooks
│   │   ├── useAuctionSocket.ts       # Real-time auction updates
│   │   ├── useCart.ts                # Shopping cart state
│   │   ├── useMediaUpload.ts         # File upload handling
│   │   └── useViewingHistory.ts      # Product view tracking
│   ├── contexts/                     # React Context Providers
│   │   ├── AuthContext.tsx           # Global auth state
│   │   └── UploadContext.tsx         # Upload queue state
│   ├── lib/                          # Utility Libraries
│   │   ├── socket-server.ts          # Socket.IO server setup
│   │   ├── auction-scheduler.ts      # Automated auction timing
│   │   ├── rbac.ts                   # Role-based access control
│   │   ├── formatters.ts             # Date, currency formatters
│   │   └── utils.ts                  # General utilities
│   ├── types/                        # TypeScript Type Definitions
│   └── constants/                    # App Constants & Config
├── scripts/                          # Utility Scripts
│   ├── test-api.js                   # API endpoint testing
│   ├── test-auction-automation.js    # Auction system tests
│   └── load-test.js                  # Performance testing
├── logs/                             # Application Logs
├── public/                           # Static Assets
├── .env.example                      # Environment variables template
├── firebase.json                     # Firebase configuration
├── server.js                         # Custom Next.js server
├── README.md                         # This file
├── AI-AGENT-GUIDE.md                 # AI Agent development guide
└── package.json
```

## 🛠️ Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in your Firebase and Sentry credentials:

```env
# Firebase Admin SDK (Backend)
FIREBASE_PROJECT_ID=letitrip-in-app
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@letitrip-in-app.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour Key\n-----END PRIVATE KEY-----\n"
FIREBASE_STORAGE_BUCKET=letitrip-in-app.firebasestorage.app

# Firebase Client SDK (Frontend)
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=letitrip-in-app.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=letitrip-in-app
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=letitrip-in-app.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://letitrip-in-app-default-rtdb.asia-southeast1.firebasedatabase.app

# Sentry (Error Tracking)
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
SENTRY_AUTH_TOKEN=your-sentry-auth-token

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### 3. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing
3. Enable Authentication > Email/Password
4. Create Firestore Database with rules from `firestore.rules`
5. Enable Firebase Storage with rules from `storage.rules`
6. Create indexes from `firestore.indexes.json`
7. Generate service account key:
   - Go to Project Settings > Service Accounts
   - Click "Generate New Private Key"
   - Copy credentials to `.env.local`

### 4. Firebase Collections Setup

Create these Firestore collections:

- `users` - User profiles
- `products` - Product listings
- `auctions` - Auction items
- `bids` - Bid history
- `orders` - Order records
- `carts` - Shopping carts
- `shops` - Seller shops
- `categories` - Product categories
- `coupons` - Discount codes

### 5. Run Development Server

```bash
npm run dev
```

The application will start on [http://localhost:3000](http://localhost:3000)

Socket.IO server will run on the same port for real-time features.

## 📚 API Quick Reference

### Authentication

#### Register

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"securePassword123","name":"John Doe"}'
```

#### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"securePassword123"}'
```

### Auctions

#### Get Active Auctions

```bash
curl http://localhost:3000/api/auctions?status=active
```

#### Place Bid

```bash
curl -X POST http://localhost:3000/api/auctions/[id]/bids \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"amount":1000}'
```

### Products

#### Search Products

```bash
curl "http://localhost:3000/api/products?search=laptop&category=electronics"
```

#### Get Product Details

```bash
curl http://localhost:3000/api/products/[id]
```

### Cart

#### Add to Cart

```bash
curl -X POST http://localhost:3000/api/cart \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"productId":"abc123","quantity":1}'
```

### Health Check

```bash
curl http://localhost:3000/api/health
```

## 🔒 Authentication & Security

### Authentication Flow

1. User submits credentials via `/login` or `/register` page
2. Request goes through middleware (rate limiting, logging)
3. Backend verifies credentials with Firebase Authentication
4. Custom token is generated and returned with user data
5. Token and user profile stored in localStorage
6. `AuthContext` provides global auth state
7. `AuthGuard` component protects authenticated routes
8. `apiService` automatically adds token to all API requests

### Role-Based Access Control (RBAC)

- **admin**: Full system access, manage users, products, auctions
- **seller**: Create/manage products, shops, and auctions
- **user**: Browse, bid, purchase, manage orders
- **guest**: Browse public content only

### Protected Routes

Use `AuthGuard` component to protect pages:

```tsx
<AuthGuard requireAuth={true} allowedRoles={["seller", "admin"]}>
  <SellerDashboard />
</AuthGuard>
```

## 📁 Project Structure

```
letitrip.in/
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
│   │   ├── api.service.ts            # Base HTTP client
│   │   ├── auth.service.ts           # Authentication service
│   │   ├── auctions.service.ts       # Auction operations
│   │   ├── products.service.ts       # Product operations
│   │   ├── cart.service.ts           # Cart operations
│   │   ├── orders.service.ts         # Order operations
│   │   └── media.service.ts          # Media upload/management
│   ├── hooks/                        # Custom React Hooks
│   │   ├── useAuctionSocket.ts       # Real-time auction updates
│   │   ├── useCart.ts                # Shopping cart state
│   │   ├── useMediaUpload.ts         # File upload handling
│   │   └── useViewingHistory.ts      # Product view tracking
│   ├── contexts/                     # React Context Providers
│   │   ├── AuthContext.tsx           # Global auth state
│   │   └── UploadContext.tsx         # Upload queue state
│   ├── lib/                          # Utility Libraries
│   │   ├── socket-server.ts          # Socket.IO server setup
│   │   ├── auction-scheduler.ts      # Automated auction timing
│   │   ├── rbac.ts                   # Role-based access control
│   │   ├── formatters.ts             # Date, currency formatters
│   │   └── utils.ts                  # General utilities
│   ├── types/                        # TypeScript Type Definitions
│   └── constants/                    # App Constants & Config
├── scripts/                          # Utility Scripts
│   ├── test-api.js                   # API endpoint testing
│   ├── test-auction-automation.js    # Auction system tests
│   └── load-test.js                  # Performance testing
├── logs/                             # Application Logs
├── public/                           # Static Assets
├── .env.example                      # Environment variables template
├── firebase.json                     # Firebase configuration
├── server.js                         # Custom Next.js server
├── README.md                         # This file
├── AI-AGENT-GUIDE.md                 # AI Agent development guide
└── package.json
```

## 🛠️ Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in your Firebase and Sentry credentials:

```env
# Firebase Admin SDK (Backend)
FIREBASE_PROJECT_ID=letitrip-in-app
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@letitrip-in-app.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour Key\n-----END PRIVATE KEY-----\n"
FIREBASE_STORAGE_BUCKET=letitrip-in-app.firebasestorage.app

# Firebase Client SDK (Frontend)
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=letitrip-in-app.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=letitrip-in-app
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=letitrip-in-app.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://letitrip-in-app-default-rtdb.asia-southeast1.firebasedatabase.app

# Sentry (Error Tracking)
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
SENTRY_AUTH_TOKEN=your-sentry-auth-token

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### 3. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing
3. Enable Authentication > Email/Password
4. Create Firestore Database with rules from `firestore.rules`
5. Enable Firebase Storage with rules from `storage.rules`
6. Create indexes from `firestore.indexes.json`
7. Generate service account key:
   - Go to Project Settings > Service Accounts
   - Click "Generate New Private Key"
   - Copy credentials to `.env.local`

### 4. Firebase Collections Setup

Create these Firestore collections:

- `users` - User profiles
- `products` - Product listings
- `auctions` - Auction items
- `bids` - Bid history
- `orders` - Order records
- `carts` - Shopping carts
- `shops` - Seller shops
- `categories` - Product categories
- `coupons` - Discount codes

### 5. Run Development Server

```bash
npm run dev
```

The application will start on [http://localhost:3000](http://localhost:3000)

Socket.IO server will run on the same port for real-time features.

## 📚 API Quick Reference

### Authentication

#### Register

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"securePassword123","name":"John Doe"}'
```

#### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"securePassword123"}'
```

### Auctions

#### Get Active Auctions

```bash
curl http://localhost:3000/api/auctions?status=active
```

#### Place Bid

```bash
curl -X POST http://localhost:3000/api/auctions/[id]/bids \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"amount":1000}'
```

### Products

#### Search Products

```bash
curl "http://localhost:3000/api/products?search=laptop&category=electronics"
```

#### Get Product Details

```bash
curl http://localhost:3000/api/products/[id]
```

### Cart

#### Add to Cart

```bash
curl -X POST http://localhost:3000/api/cart \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"productId":"abc123","quantity":1}'
```

### Health Check

```bash
curl http://localhost:3000/api/health
```

## 🔒 Authentication & Security

### Authentication Flow

1. User submits credentials via `/login` or `/register` page
2. Request goes through middleware (rate limiting, logging)
3. Backend verifies credentials with Firebase Authentication
4. Custom token is generated and returned with user data
5. Token and user profile stored in localStorage
6. `AuthContext` provides global auth state
7. `AuthGuard` component protects authenticated routes
8. `apiService` automatically adds token to all API requests

### Role-Based Access Control (RBAC)

- **admin**: Full system access, manage users, products, auctions
- **seller**: Create/manage products, shops, and auctions
- **user**: Browse, bid, purchase, manage orders
- **guest**: Browse public content only

### Protected Routes

Use `AuthGuard` component to protect pages:

```tsx
<AuthGuard requireAuth={true} allowedRoles={["seller", "admin"]}>
  <SellerDashboard />
</AuthGuard>
```

## 📁 Project Structure

```
letitrip.in/
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
│   │   ├── api.service.ts            # Base HTTP client
│   │   ├── auth.service.ts           # Authentication service
│   │   ├── auctions.service.ts       # Auction operations
│   │   ├── products.service.ts       # Product operations
│   │   ├── cart.service.ts           # Cart operations
│   │   ├── orders.service.ts         # Order operations
│   │   └── media.service.ts          # Media upload/management
│   ├── hooks/                        # Custom React Hooks
│   │   ├── useAuctionSocket.ts       # Real-time auction updates
│   │   ├── useCart.ts                # Shopping cart state
│   │   ├── useMediaUpload.ts         # File upload handling
│   │   └── useViewingHistory.ts      # Product view tracking
│   ├── contexts/                     # React Context Providers
│   │   ├── AuthContext.tsx           # Global auth state
│   │   └── UploadContext.tsx         # Upload queue state
│   ├── lib/                          # Utility Libraries
│   │   ├── socket-server.ts          # Socket.IO server setup
│   │   ├── auction-scheduler.ts      # Automated auction timing
│   │   ├── rbac.ts                   # Role-based access control
│   │   ├── formatters.ts             # Date, currency formatters
│   │   └── utils.ts                  # General utilities
│   ├── types/                        # TypeScript Type Definitions
│   └── constants/                    # App Constants & Config
├── scripts/                          # Utility Scripts
│   ├── test-api.js                   # API endpoint testing
│   ├── test-auction-automation.js    # Auction system tests
│   └── load-test.js                  # Performance testing
├── logs/                             # Application Logs
├── public/                           # Static Assets
├── .env.example                      # Environment variables template
├── firebase.json                     # Firebase configuration
├── server.js                         # Custom Next.js server
├── README.md                         # This file
├── AI-AGENT-GUIDE.md                 # AI Agent development guide
└── package.json
```

## 🛠️ Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in your Firebase and Sentry credentials:

```env
# Firebase Admin SDK (Backend)
FIREBASE_PROJECT_ID=letitrip-in-app
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@letitrip-in-app.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour Key\n-----END PRIVATE KEY-----\n"
FIREBASE_STORAGE_BUCKET=letitrip-in-app.firebasestorage.app

# Firebase Client SDK (Frontend)
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=letitrip-in-app.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=letitrip-in-app
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=letitrip-in-app.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://letitrip-in-app-default-rtdb.asia-southeast1.firebasedatabase.app

# Sentry (Error Tracking)
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
SENTRY_AUTH_TOKEN=your-sentry-auth-token

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### 3. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing
3. Enable Authentication > Email/Password
4. Create Firestore Database with rules from `firestore.rules`
5. Enable Firebase Storage with rules from `storage.rules`
6. Create indexes from `firestore.indexes.json`
7. Generate service account key:
   - Go to Project Settings > Service Accounts
   - Click "Generate New Private Key"
   - Copy credentials to `.env.local`

### 4. Firebase Collections Setup

Create these Firestore collections:

- `users` - User profiles
- `products` - Product listings
- `auctions` - Auction items
- `bids` - Bid history
- `orders` - Order records
- `carts` - Shopping carts
- `shops` - Seller shops
- `categories` - Product categories
- `coupons` - Discount codes

### 5. Run Development Server

```bash
npm run dev
```

The application will start on [http://localhost:3000](http://localhost:3000)

Socket.IO server will run on the same port for real-time features.

## 📚 API Quick Reference

### Authentication

#### Register

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"securePassword123","name":"John Doe"}'
```

#### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"securePassword123"}'
```

### Auctions

#### Get Active Auctions

```bash
curl http://localhost:3000/api/auctions?status=active
```

#### Place Bid

```bash
curl -X POST http://localhost:3000/api/auctions/[id]/bids \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"amount":1000}'
```

### Products

#### Search Products

```bash
curl "http://localhost:3000/api/products?search=laptop&category=electronics"
```

#### Get Product Details

```bash
curl http://localhost:3000/api/products/[id]
```

### Cart

#### Add to Cart

```bash
curl -X POST http://localhost:3000/api/cart \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"productId":"abc123","quantity":1}'
```

### Health Check

```bash
curl http://localhost:3000/api/health
```

## 🔒 Authentication & Security

### Authentication Flow

1. User submits credentials via `/login` or `/register` page
2. Request goes through middleware (rate limiting, logging)
3. Backend verifies credentials with Firebase Authentication
4. Custom token is generated and returned with user data
5. Token and user profile stored in localStorage
6. `AuthContext` provides global auth state
7. `AuthGuard` component protects authenticated routes
8. `apiService` automatically adds token to all API requests

### Role-Based Access Control (RBAC)

- **admin**: Full system access, manage users, products, auctions
- **seller**: Create/manage products, shops, and auctions
- **user**: Browse, bid, purchase, manage orders
- **guest**: Browse public content only

### Protected Routes

Use `AuthGuard` component to protect pages:

```tsx
<AuthGuard requireAuth={true} allowedRoles={["seller", "admin"]}>
  <SellerDashboard />
</AuthGuard>
```

## 📁 Project Structure

```
letitrip.in/
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
│   │   ├── api.service.ts            # Base HTTP client
│   │   ├── auth.service.ts           # Authentication service
│   │   ├── auctions.service.ts       # Auction operations
│   │   ├── products.service.ts       # Product operations
│   │   ├── cart.service.ts           # Cart operations
│   │   ├── orders.service.ts         # Order operations
│   │   └── media.service.ts          # Media upload/management
│   ├── hooks/                        # Custom React Hooks
│   │   ├── useAuctionSocket.ts       # Real-time auction updates
│   │   ├── useCart.ts                # Shopping cart state
│   │   ├── useMediaUpload.ts         # File upload handling
│   │   └── useViewingHistory.ts      # Product view tracking
│   ├── contexts/                     # React Context Providers
│   │   ├── AuthContext.tsx           # Global auth state
│   │   └── UploadContext.tsx         # Upload queue state
│   ├── lib/                          # Utility Libraries
│   │   ├── socket-server.ts          # Socket.IO server setup
│   │   ├── auction-scheduler.ts      # Automated auction timing
│   │   ├── rbac.ts                   # Role-based access control
│   │   ├── formatters.ts             # Date, currency formatters
│   │   └── utils.ts                  # General utilities
│   ├── types/                        # TypeScript Type Definitions
│   └── constants/                    # App Constants & Config
├── scripts/                          # Utility Scripts
│   ├── test-api.js                   # API endpoint testing
│   ├── test-auction-automation.js    # Auction system tests
│   └── load-test.js                  # Performance testing
├── logs/                             # Application Logs
├── public/                           # Static Assets
├── .env.example                      # Environment variables template
├── firebase.json                     # Firebase configuration
├── server.js                         # Custom Next.js server
├── README.md                         # This file
├── AI-AGENT-GUIDE.md                 # AI Agent development guide
└── package.json
```
