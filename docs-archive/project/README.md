# Project Documentation - JustForView.in

**Last Updated**: November 17, 2025  
**Repository**: https://github.com/mohasinac/justforview.in  
**Current Branch**: component

This folder contains comprehensive documentation designed specifically for AI agents and new developers to quickly understand and work with the JustForView.in codebase.

---

## 📚 Documentation Structure

### Quick Start (Start Here!)

- **[00-QUICK-START.md](./00-QUICK-START.md)** - 5-minute onboarding for AI agents
  - Golden rules
  - Project structure overview
  - Common tasks with examples
  - Patterns cheat sheet

### Core Architecture

1. **[01-ARCHITECTURE-OVERVIEW.md](./01-ARCHITECTURE-OVERVIEW.md)** - System architecture and design decisions

   - Platform overview
   - Technology stack
   - Architecture principles
   - Cost optimization strategy
   - Key architectural decisions

2. **[02-SERVICE-LAYER-GUIDE.md](./02-SERVICE-LAYER-GUIDE.md)** - How to use and create services

   - Service layer overview
   - Available services (25+)
   - Creating new services
   - Service patterns
   - Error handling

3. **[03-COMPONENT-PATTERNS.md](./03-COMPONENT-PATTERNS.md)** - React component best practices
   - Server vs Client components
   - Component organization
   - Common patterns (Cards, Forms, Modals, Tables)
   - State management
   - Forms & validation

---

## 🎯 For AI Agents: Where to Start

### First Time Working on This Project?

1. **Read**: [00-QUICK-START.md](./00-QUICK-START.md) (5 minutes)
2. **Understand**: [01-ARCHITECTURE-OVERVIEW.md](./01-ARCHITECTURE-OVERVIEW.md) (15 minutes)
3. **Learn**: [02-SERVICE-LAYER-GUIDE.md](./02-SERVICE-LAYER-GUIDE.md) (10 minutes)
4. **Reference**: Browse [../resources/](../resources/) for specific resource documentation

### Working on a Specific Feature?

**For API/Backend Work**:

- Read: [02-SERVICE-LAYER-GUIDE.md](./02-SERVICE-LAYER-GUIDE.md)
- Reference: `src/constants/api-routes.ts`
- Examples: Existing services in `src/services/`

**For Frontend/Components**:

- Read: [03-COMPONENT-PATTERNS.md](./03-COMPONENT-PATTERNS.md)
- Reference: Existing components in `src/components/`

**For Database/Firestore**:

- Reference: `src/constants/database.ts`
- Examples: `src/app/api/lib/` for server-side DB operations

**For Specific Resources** (Products, Auctions, Orders, etc.):

- Read: Relevant file in [../resources/](../resources/)
- Contains: Complete schemas, relationships, API routes, patterns

---

## 🔑 The Golden Rules (Critical!)

### 1. Always Use the Service Layer

```typescript
// ❌ WRONG
fetch("/api/products");
apiService.get("/api/products");

// ✅ CORRECT
import { productService } from "@/services/products.service";
productService.getProducts();
```

### 2. Server vs Client Components

```typescript
// Server Component (default) - for data fetching
export default async function Page() {
  const data = await service.getData()
  return <Display data={data} />
}

// Client Component - for interactivity
"use client"
export default function Button() {
  const [state, setState] = useState()
  return <button onClick={() => setState(...)}>Click</button>
}
```

### 3. Firebase Admin SDK on Server Only

Never use Firebase Client SDK directly in client code for Storage operations. Always go through API routes.

### 4. No Mocks - Real APIs Only

All services call real API endpoints. Use `testDataService` for test data generation (admin only).

### 5. TypeScript Everywhere

All parameters and return values must be typed. No `any` types except for external library integrations.

---

## 📖 Additional Resources

### Other Documentation Folders

- **[../resources/](../resources/)** - Detailed resource documentation
  - Products, Auctions, Categories, Orders, Shops, etc.
  - Complete schemas, relationships, API routes, patterns
- **[../ai/](../ai/)** - AI agent development guide
  - General development patterns
  - Tool usage guidelines
  - Best practices

### Code Reference

- **`src/constants/api-routes.ts`** - All API endpoint definitions
- **`src/constants/database.ts`** - Firestore collection names and indexes
- **`src/constants/inline-fields.ts`** - Form field configurations
- **`src/constants/bulk-actions.ts`** - Bulk action definitions
- **`src/services/`** - 25+ service implementations
- **`src/types/`** - TypeScript type definitions

### Test Workflows

- **`src/lib/test-workflows/`** - 11 comprehensive E2E test workflows
- **Documentation**: `tests/README.md`
- **Run tests**: `npm run test:workflows:all`

---

## 🏗️ Project Overview

### What is JustForView.in?

A modern auction and e-commerce platform for India featuring:

- **Multi-vendor marketplace** with individual seller shops
- **Dual selling modes**: Traditional e-commerce + auction bidding
- **Real-time auctions** via Firebase Realtime Database (no Socket.IO)
- **Complete order lifecycle** management
- **Integrated payments** (Razorpay, PayPal, COD)
- **Support system** with tickets
- **Product reviews** and ratings
- **Zero monthly costs** - 100% FREE tier infrastructure

### Technology Stack

- **Frontend**: Next.js 16+ (App Router), React 19, TypeScript 5.3
- **Backend**: Next.js API Routes, Firebase Admin SDK
- **Database**: Firestore (NoSQL)
- **Storage**: Firebase Storage (images/videos)
- **Real-time**: Firebase Realtime Database (auctions)
- **Auth**: Firebase Authentication
- **Hosting**: Vercel (FREE tier)
- **Styling**: Tailwind CSS 3.4
- **Forms**: React Hook Form + Zod validation

### Cost: $0/month

All services use FREE tiers with custom implementations replacing paid services:

- ✅ Firebase FREE tier (sufficient for 0-1000 users)
- ✅ Vercel FREE tier (100GB bandwidth/month)
- ✅ Custom cache (replaced Redis $10/mo)
- ✅ Firebase Analytics (replaced Sentry $26/mo)
- ✅ Firebase Realtime DB (replaced Socket.IO hosting)

**Total savings**: $432+/year

---

## 🚀 Quick Commands

```bash
# Development
npm run dev              # Start dev server

# Building
npm run build            # Build for production
npm start                # Run production build

# Testing
npm run test:workflows:all    # Run all test workflows
npm run test:workflow:1       # Run specific workflow

# Type checking
npm run type-check       # TypeScript validation
```

---

## 🔗 Important Files to Know

### Constants (Always Check These First)

- **`src/constants/api-routes.ts`** - All API endpoints
- **`src/constants/database.ts`** - Firestore collections
- **`src/constants/inline-fields.ts`** - Form configurations
- **`src/constants/bulk-actions.ts`** - Bulk operations

### Services (Never Skip This)

- **`src/services/api.service.ts`** - Base HTTP client (DON'T USE DIRECTLY)
- **`src/services/products.service.ts`** - Product operations
- **`src/services/auctions.service.ts`** - Auction operations
- **`src/services/cart.service.ts`** - Shopping cart
- **`src/services/orders.service.ts`** - Order processing
- **25+ other services** - Check `src/services/index.ts`

### Custom Libraries (FREE Tier Infrastructure)

- **`src/lib/memory-cache.ts`** - In-memory cache (Redis replacement)
- **`src/lib/rate-limiter.ts`** - API rate limiting
- **`src/lib/firebase-realtime.ts`** - Real-time auctions
- **`src/lib/firebase-error-logger.ts`** - Error tracking
- **`src/lib/discord-notifier.ts`** - Team notifications

---

## 📝 Documentation Index

### By Topic

**Getting Started**:

- [Quick Start Guide](./00-QUICK-START.md)
- [Architecture Overview](./01-ARCHITECTURE-OVERVIEW.md)

**Development**:

- [Service Layer Guide](./02-SERVICE-LAYER-GUIDE.md)
- [Component Patterns](./03-COMPONENT-PATTERNS.md)

**Resources**:

- [Products](../resources/products.md)
- [Auctions](../resources/auctions.md)
- [Categories](../resources/categories.md)
- [Orders](../resources/orders.md)
- [And 8+ more in ../resources/](../resources/)

**General**:

- [AI Agent Guide](../ai/AI-AGENT-GUIDE.md)
- [Project README](../../README.md)

---

## 💡 Tips for AI Agents

### When Adding New Features

1. **Check if similar feature exists** - Browse `src/services/` and `src/components/`
2. **Follow existing patterns** - Copy structure from similar features
3. **Use TypeScript** - Define types first in `src/types/`
4. **Add to constants** - Update `src/constants/api-routes.ts` if adding API routes
5. **Create service** - Always wrap APIs with service layer
6. **Test it** - Use test workflows or create new ones

### When Debugging

1. **Check service layer** - Is the service method correct?
2. **Check API route** - Does the endpoint exist? Is it handling errors?
3. **Check types** - Are TypeScript types matching?
4. **Check Firebase** - Is the collection name correct in `database.ts`?
5. **Check console** - Browser console and terminal logs

### When Reading Code

1. **Start with types** - Understand data structures first
2. **Then services** - See how data is fetched/modified
3. **Then components** - See how UI uses services
4. **Check constants** - Understand configuration

---

## 🎓 Learning Path

### Day 1: Foundation

1. Read [Quick Start](./00-QUICK-START.md)
2. Browse main README
3. Explore project structure

### Day 2: Architecture

1. Read [Architecture Overview](./01-ARCHITECTURE-OVERVIEW.md)
2. Understand service layer
3. Review key patterns

### Day 3: Deep Dive

1. Read [Service Layer Guide](./02-SERVICE-LAYER-GUIDE.md)
2. Read [Component Patterns](./03-COMPONENT-PATTERNS.md)
3. Study existing services and components

### Day 4: Hands-On

1. Pick a simple task
2. Follow patterns from existing code
3. Test your changes
4. Review test workflows

---

## 🤝 Contributing

When contributing code:

1. **Follow existing patterns** - Don't introduce new patterns without discussion
2. **Use TypeScript** - No `any` types
3. **Use service layer** - Never direct API calls in components
4. **Document complex logic** - Add comments for non-obvious code
5. **Test your changes** - Use test workflows or manual testing

---

## 📞 Support

- **Issues**: Open GitHub issue
- **Questions**: Check existing documentation first
- **Discord**: Team notifications channel

---

**Last Updated**: November 11, 2025  
**Maintained by**: Development Team  
**For**: AI Agents and New Developers
