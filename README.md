# LetItRip.in - Modern Auction & E-commerce Platform

> A comprehensive Next.js-based marketplace platform for India with real-time auctions, product listings, multi-vendor shops, and advanced e-commerce features.

[![Next.js](https://img.shields.io/badge/Next.js-16.1-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-blue)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-11.1-orange)](https://firebase.google.com/)

## 📋 Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Key Features](#key-features)
- [Project Structure](#project-structure)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)

---

## 🎯 Overview

LetItRip.in is a production-ready auction and e-commerce platform built with Next.js 16, featuring:

- **Real-time Auctions** with live bidding
- **Multi-vendor Marketplace** with shop management
- **Product Listings** with advanced search and filters
- **User Profiles** with order history and watchlists
- **Admin Dashboard** for platform management
- **Seller Dashboard** for vendor operations
- **Blog System** with categories and tags
- **Shopping Cart & Checkout**
- **Payment Integration** (Razorpay)
- **Firebase Backend** (Firestore, Storage, Auth)

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local

# Run development server
npm run dev

# Open http://localhost:3000
```

### 🔄 Migration in Progress

This project is currently undergoing migration to use `@letitrip/react-library` for all components.

**Migration Documents**:

- [`MIGRATION-STATUS.md`](./MIGRATION-STATUS.md) - Current status & quick start
- [`MIGRATION-TRACKER.md`](./MIGRATION-TRACKER.md) - Complete tracking
- [`MIGRATION-QUICK-REFERENCE.md`](./MIGRATION-QUICK-REFERENCE.md) - Patterns & examples

**For Contributors**: See [`CONTINUE-MIGRATION-PROMPT.md`](./CONTINUE-MIGRATION-PROMPT.md) to resume migration work.

---

## 🛠 Tech Stack

**Frontend**: Next.js 16.1 • React 19.2 • TypeScript • Tailwind CSS • @letitrip/react-library

**Backend**: Firebase (Firestore, Storage, Auth, Functions) • Next.js API Routes • Razorpay

**State**: TanStack Query • React Context • React Hook Form • Zod

**Testing**: Playwright • Jest

---

## 🏗 Architecture

```
src/
├── app/
│   ├── (public)/      # Public pages
│   ├── (protected)/   # Auth required
│   ├── (admin)/       # Admin only
│   ├── (auth)/        # Login/register
│   └── api/           # API routes
├── components/        # React components
│   └── wrappers/      # Next.js wrappers for library components
├── lib/               # Utilities & helpers
│   └── adapters/      # Service adapters for library integration
├── services/          # API services
├── hooks/             # Custom hooks
├── constants/         # Application constants and enums
│   ├── routes.ts          # All route paths
│   ├── api-endpoints.ts   # All API endpoint paths
│   ├── status.ts          # Status enums
│   ├── validation.ts      # Validation rules
│   ├── config.ts          # App configuration
│   └── README.md          # Constants documentation
└── types/             # TypeScript types
```

### Constants & Enums

All application constants are centralized in `src/constants/` for:

- **Type Safety**: Using TypeScript enums and `as const`
- **Maintainability**: Single source of truth for values
- **Consistency**: Avoid magic numbers and hardcoded strings
- **Refactoring**: Easy to update values across the app

See [`src/constants/README.md`](./src/constants/README.md) for usage guidelines.

---

## ✨ Key Features

### 🛒 E-commerce

- Product listings with advanced search and filters
- Shopping cart with coupon support
- Multi-step checkout process
- Order tracking and management
- Review and rating system

### 🏷️ Auctions

- Real-time bidding system
- Countdown timers
- Auto-bid functionality
- Bid history tracking

### 🏪 Multi-vendor

- Vendor shop management
- Product inventory management
- Order fulfillment dashboard
- Sales analytics and reports
- Payout management

### 👤 User Features

- User profiles with order history
- Watchlist and favorites
- Address management
- Wallet system
- Real-time notifications
- Message system

### 🔐 Admin Features

- Platform management dashboard
- User and vendor management
- Product and auction moderation
- Order management
- Analytics and reports
- Settings and configuration

### 📱 Additional Features

- Responsive design (mobile-first)
- Blog system with rich content editor
- Category management
- Advanced search across content types
- Email notifications
- Firebase authentication
- File upload to Firebase Storage

---

## 📁 Project Structure

```
letitrip.in/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (public)/          # Public routes
│   │   ├── (protected)/       # Protected routes
│   │   ├── (admin)/           # Admin routes
│   │   ├── (auth)/            # Auth routes
│   │   └── api/               # API routes
│   ├── components/            # React components
│   │   ├── homepage/          # Homepage components
│   │   ├── product/           # Product components
│   │   ├── auction/           # Auction components
│   │   ├── cart/              # Cart components
│   │   ├── checkout/          # Checkout components
│   │   ├── user/              # User components
│   │   ├── seller/            # Seller components
│   │   ├── admin/             # Admin components
│   │   ├── layout/            # Layout components
│   │   ├── navigation/        # Navigation components
│   │   └── auth/              # Auth components
│   ├── lib/                   # Utilities
│   │   ├── firebase/          # Firebase config & utils
│   │   ├── utils/             # Helper functions
│   │   └── validation/        # Validation schemas
│   ├── services/              # API services
│   ├── hooks/                 # Custom React hooks
│   ├── contexts/              # React contexts
│   ├── types/                 # TypeScript definitions
│   └── styles/                # Global styles
├── scripts/                   # Utility scripts
│   ├── database/              # Database migrations
│   ├── deployment/            # Deployment utilities
│   ├── development/           # Development tools
│   └── setup/                 # Setup scripts
├── functions/                 # Firebase Cloud Functions
├── react-library/             # Custom React component library
├── tests/                     # Test files
├── public/                    # Static assets
├── refactor/                  # Migration tracker
└── NDocs/                     # Documentation

```

---

## 🔧 Development

### Prerequisites

- Node.js 18+
- npm or yarn
- Firebase account
- Razorpay account (for payments)

### Environment Variables

Create `.env.local` with the following:

```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Razorpay
NEXT_PUBLIC_RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
npm run format           # Format with Prettier

# Testing
npm run test             # Run all tests
npm run test:unit        # Run unit tests
npm run test:e2e         # Run E2E tests
npm run test:watch       # Run tests in watch mode

# Firebase
npm run firebase:deploy  # Deploy functions
npm run firebase:serve   # Serve functions locally
```

---

## 🧪 Testing

- **Unit Tests**: Jest + React Testing Library
- **E2E Tests**: Playwright
- **Test Coverage**: 80%+ coverage target

```bash
# Run all tests
npm run test

# Run specific test suite
npm run test:unit
npm run test:e2e

# Generate coverage report
npm run test:coverage
```

---

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Firebase Hosting

```bash
# Build the app
npm run build

# Deploy
firebase deploy
```

### Environment Variables

Make sure to set all required environment variables in your deployment platform:

- Firebase configuration
- Razorpay keys
- App URL

---

## 📚 Documentation

- **Full Documentation**: [/NDocs/README.md](/NDocs/README.md)
- **AI Agent Guide**: [/NDocs/getting-started/AI-AGENT-GUIDE.md](/NDocs/getting-started/AI-AGENT-GUIDE.md)
- **React Library**: [/react-library/README.md](/react-library/README.md)
- **Functions**: [/functions/README.md](/functions/README.md)

---

## 🗺️ Route Structure

### Public Routes

- `/` - Homepage
- `/products` - Product listings
- `/products/[slug]` - Product details
- `/auctions` - Auction listings
- `/auctions/[id]` - Auction details
- `/shops` - Shop listings
- `/shops/[slug]` - Shop details
- `/categories` - Categories
- `/blog` - Blog posts
- `/search` - Global search
- `/compare` - Product comparison

### Protected Routes (Login Required)

- `/cart` - Shopping cart
- `/checkout` - Checkout process
- `/user/profile` - User profile
- `/user/orders` - Order history
- `/user/addresses` - Address management
- `/user/watchlist` - Saved products
- `/user/messages` - Messages

### Seller Routes

- `/seller` - Seller dashboard
- `/seller/products` - Manage products
- `/seller/orders` - Manage orders
- `/seller/shop` - Shop settings
- `/seller/analytics` - Sales analytics

### Admin Routes

- `/admin` - Admin dashboard
- `/admin/users` - User management
- `/admin/products` - Product moderation
- `/admin/orders` - Order management
- `/admin/analytics` - Platform analytics

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is proprietary and confidential.

---

## 📞 Support

For issues and questions:

- Email: support@letitrip.in
- GitHub Issues: [Create an issue](https://github.com/mohasinac/letitrip.in/issues)

---

Made with ❤️ in India
