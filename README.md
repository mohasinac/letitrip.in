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

### � Key Files

- [.env.local](.env.local) - Environment variables (create from .env.example)
- [react-library/](./react-library/) - Shared component library v1.0.2
- [src/lib/fallback-data.ts](./src/lib/fallback-data.ts) - Data fetching with fallbacks
- [src/lib/logger.ts](./src/lib/logger.ts) - Error logging system

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16.1.1 with App Router & Turbopack
- **Language**: TypeScript 5.3
- **UI**: React 19.2, Tailwind CSS 3.4
- **Component Library**: @mohasinac/react-library v1.0.2 (115+ components, 19 hooks, 60+ utilities)
- **Backend**: Firebase (Firestore, Storage, Auth, Functions)
- **Payments**: Razorpay Integration
- **Error Logging**: File-based logger with daily rotation
- **State Management**: React Context, TanStack Query
- **Forms**: React Hook Form, Zod validation
- **Testing**: Playwright (E2E), Jest (Unit)
- **Deployment**: Vercel

---

## 🏗️ Architecture

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth routes (login, register)
│   ├── (protected)/       # Protected routes (profile, orders)
│   ├── admin/             # Admin dashboard
│   ├── seller/            # Seller dashboard
│   ├── products/          # Product pages
│   ├── auctions/          # Auction pages
│   └── api/               # API routes
├── components/            # Application-specific components
│   ├── admin/            # Admin-specific components
│   ├── seller/           # Seller-specific components
│   ├── layout/           # Layout shells
│   └── providers/        # Context providers
├── lib/                   # Utilities & configs
│   ├── firebase/         # Firebase configuration
│   ├── logger.ts         # Error logging with daily rotation
│   └── fallback-data.ts  # Data fetching with fallback system
├── constants/             # App constants & enums
│   ├── routes.ts         # All route paths
│   ├── api-endpoints.ts  # All API endpoint paths
│   ├── categories.ts     # Category definitions
│   └── statuses.ts       # Status enums
├── hooks/                 # Custom React hooks
└── types/                 # TypeScript type definitions
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
│   │   ├── (auth)/            # Auth routes (login, register)
│   │   ├── (protected)/       # Protected routes (profile, orders)
│   │   ├── admin/             # Admin dashboard
│   │   ├── seller/            # Seller dashboard
│   │   ├── products/          # Product pages
│   │   ├── auctions/          # Auction pages
│   │   └── api/               # API routes
│   ├── components/            # Application-specific components
│   │   ├── admin/             # Admin-specific
│   │   ├── seller/            # Seller-specific
│   │   ├── layout/            # Layout shells
│   │   └── providers/         # Context providers
│   ├── lib/                   # Utilities & configs
│   │   ├── firebase/          # Firebase setup
│   │   ├── logger.ts          # Error logging system
│   │   └── fallback-data.ts   # Data fetching with fallbacks
│   ├── constants/             # App constants
│   ├── hooks/                 # Custom React hooks
│   └── types/                 # TypeScript definitions
├── react-library/             # Shared component library (v1.0.2)
│   ├── src/components/        # 115+ reusable components
│   ├── src/hooks/             # 19 custom hooks
│   └── src/utils/             # 60+ utility functions
├── functions/                 # Firebase Cloud Functions
├── logs/                      # Application logs (git-ignored)
├── public/                    # Static assets
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

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_ENABLE_FALLBACK=true  # Enable/disable fallback data (default: true)
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
- **Component Library**: [/react-library/README.md](/react-library/README.md) - 115+ components, 19 hooks, 60+ utilities
- **Firebase Functions**: [/functions/README.md](/functions/README.md)

## 📊 Error Logging

The application uses a file-based logging system that writes to:

- `logs/error-YYYY-MM-DD.log` - Error logs
- `logs/warn-YYYY-MM-DD.log` - Warning logs
- `logs/info-YYYY-MM-DD.log` - Info logs
- `logs/debug-YYYY-MM-DD.log` - Debug logs

Logs are automatically rotated daily and excluded from git.

## 🔄 Fallback System

The application includes a robust fallback data system for better UX when APIs fail:

- **Automatic Fallback**: Returns mock data when API calls fail or return empty results
- **Type-Safe**: All fallback data matches real Firebase schema
- **Global Control**: Enable/disable via environment variable
- **Categories**: Products, Auctions, Shops, Categories, Blog posts

### Configuration

Add to `.env.local`:

```env
# Fallback System (default: enabled)
NEXT_PUBLIC_ENABLE_FALLBACK=true  # Set to false to disable fallback
```

### Usage

```typescript
import { fetchWithFallback, FALLBACK_PRODUCTS } from "@/lib/fallback-data";

const products = await fetchWithFallback(
  () => fetch("/api/products").then((r) => r.json()),
  FALLBACK_PRODUCTS,
  "Failed to fetch products",
);
```

When `NEXT_PUBLIC_ENABLE_FALLBACK=false`, errors are thrown instead of returning fallback data, useful for development and debugging.

---

## 🗺️ Route Structure

### Public Routes

- `/` - Homepage
- `/products` - Product listings with filters
- `/products/[slug]` - Product details
- `/auctions` - Auction listings with filters
- `/auctions/[slug]` - Auction details with bidding
- `/shops/[slug]` - Shop details
- `/categories/[slug]` - Category listings
- `/blog` - Blog posts
- `/search` - Global search

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
