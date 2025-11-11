# JustForView.in - Complete Documentation Index

**Last Updated**: November 11, 2025  
**Platform**: Auction & E-Commerce Marketplace for India  
**Tech Stack**: Next.js 14+, TypeScript, Firebase, Tailwind CSS

---

## 📚 Documentation Overview

This repository contains **comprehensive documentation** designed for:

- 🤖 **AI Agents** starting work on the codebase
- 👨‍💻 **New Developers** joining the team
- 📖 **Reference** for existing team members

---

## 🚀 Quick Start for AI Agents

### Start Here (5 minutes)

1. **[Quick Start Guide](./project/00-QUICK-START.md)** ⭐
   - 5-minute onboarding
   - Golden rules
   - Common tasks
   - Patterns cheat sheet

### Core Documentation (30 minutes)

2. **[Architecture Overview](./project/01-ARCHITECTURE-OVERVIEW.md)**

   - Technology stack
   - System architecture
   - Cost optimization (FREE tier)
   - Key decisions

3. **[Service Layer Guide](./project/02-SERVICE-LAYER-GUIDE.md)**

   - How to use services (25+ available)
   - Creating new services
   - Service patterns
   - Error handling

4. **[Component Patterns](./project/03-COMPONENT-PATTERNS.md)**
   - Server vs Client components
   - Component organization
   - Common patterns
   - State management

---

## 📁 Documentation Folders

### `/docs/project/` - Core Architecture Documentation

**Start here for understanding the system**

| File                          | Description                    | Time   |
| ----------------------------- | ------------------------------ | ------ |
| `README.md`                   | Project docs overview          | 2 min  |
| `00-QUICK-START.md`           | ⭐ 5-minute onboarding         | 5 min  |
| `01-ARCHITECTURE-OVERVIEW.md` | System design & tech stack     | 15 min |
| `02-SERVICE-LAYER-GUIDE.md`   | API service layer patterns     | 10 min |
| `03-COMPONENT-PATTERNS.md`    | React component best practices | 10 min |

### `/docs/resources/` - Resource-Specific Documentation

**Reference for specific features**

| File                     | Resource   | Contains                                         |
| ------------------------ | ---------- | ------------------------------------------------ |
| `products.md`            | Products   | Schema, API routes, filters, forms, bulk actions |
| `auctions.md`            | Auctions   | Bidding system, real-time updates, workflows     |
| `categories.md`          | Categories | Hierarchical structure, tree operations          |
| `orders.md`              | Orders     | Order lifecycle, fulfillment, status transitions |
| `shops.md`               | Shops      | Multi-vendor system, shop management             |
| `reviews.md`             | Reviews    | Rating system, verification, moderation          |
| `coupons.md`             | Coupons    | Discount codes, validation, usage tracking       |
| `addresses.md`           | Addresses  | User addresses, shipping/billing                 |
| `payments.md`            | Payments   | Payment processing, gateways, refunds            |
| `pages-api-reference.md` | API Index  | Complete API reference for all pages             |

### `/docs/ai/` - AI Agent Development Guide

**General AI development patterns**

| File                | Description                        |
| ------------------- | ---------------------------------- |
| `AI-AGENT-GUIDE.md` | Comprehensive AI development guide |

### `/docs/other/` - Additional Documentation

**Specialized guides and references**

| File                           | Description                    |
| ------------------------------ | ------------------------------ |
| `BULK-ACTION-TESTING-GUIDE.md` | Testing bulk operations        |
| `ESLINT-ARCHITECTURE-RULES.md` | Linting and architecture rules |

---

## 🔑 The Golden Rules

### Rule #1: Always Use the Service Layer

```typescript
// ❌ WRONG
fetch("/api/products");
apiService.get("/api/products");

// ✅ CORRECT
import { productService } from "@/services/products.service";
productService.getProducts();
```

### Rule #2: Server vs Client Components

```typescript
// Server Component (default) - Data fetching
export default async function Page() {
  const data = await service.getData()
  return <Display data={data} />
}

// Client Component - Interactivity
"use client"
export default function Button() {
  const [state, setState] = useState()
  return <button onClick={() => setState(...)}>Click</button>
}
```

### Rule #3: Firebase Admin SDK on Server Only

Never use Firebase Client SDK directly. Always go through API routes.

### Rule #4: No Mocks - Real APIs Only

All services call real API endpoints.

### Rule #5: TypeScript Everywhere

All parameters and return values must be typed.

---

## 🎯 Documentation by Use Case

### I'm Adding a New Feature

1. **Check existing features** - Browse `/docs/resources/` for similar patterns
2. **Understand the architecture** - Read [Architecture Overview](./project/01-ARCHITECTURE-OVERVIEW.md)
3. **Follow service layer pattern** - Read [Service Layer Guide](./project/02-SERVICE-LAYER-GUIDE.md)
4. **Use component patterns** - Read [Component Patterns](./project/03-COMPONENT-PATTERNS.md)
5. **Reference similar code** - Check `src/services/` and `src/components/`

**Example**: Adding "Wishlists"

- Read: `products.md` (similar resource)
- Copy: `src/services/favorites.service.ts` structure
- Create: Types, Service, API Route, Components
- Test: Add to test workflows

### I'm Fixing a Bug

1. **Understand the flow** - Read relevant resource doc in `/docs/resources/`
2. **Check the service** - Review service implementation in `src/services/`
3. **Check the API route** - Review endpoint in `src/app/api/`
4. **Debug** - Use browser console and server logs

### I'm Reviewing Code

1. **Check types** - Are interfaces defined in `src/types/`?
2. **Check service usage** - Is the service layer used correctly?
3. **Check patterns** - Does it follow [Component Patterns](./project/03-COMPONENT-PATTERNS.md)?
4. **Check constants** - Are routes in `src/constants/api-routes.ts`?

### I'm Understanding the Codebase

**Day 1**: Foundation

- Read: [Quick Start](./project/00-QUICK-START.md)
- Browse: Project structure
- Run: `npm run dev`

**Day 2**: Architecture

- Read: [Architecture Overview](./project/01-ARCHITECTURE-OVERVIEW.md)
- Explore: `src/services/` folder
- Review: Key patterns

**Day 3**: Deep Dive

- Read: [Service Layer Guide](./project/02-SERVICE-LAYER-GUIDE.md)
- Read: [Component Patterns](./project/03-COMPONENT-PATTERNS.md)
- Study: Existing implementations

**Day 4**: Hands-On

- Pick: Simple task
- Code: Following patterns
- Test: Your changes

---

## 📖 Complete Documentation Map

```
docs/
├── README.md (this file)             # 📍 START HERE - Documentation index
│
├── project/                          # 🏗️ Core Architecture
│   ├── README.md                     # Project docs overview
│   ├── 00-QUICK-START.md            # ⭐ 5-min onboarding
│   ├── 01-ARCHITECTURE-OVERVIEW.md  # System design
│   ├── 02-SERVICE-LAYER-GUIDE.md    # Service patterns
│   └── 03-COMPONENT-PATTERNS.md     # React patterns
│
├── resources/                        # 📚 Resource Reference
│   ├── products.md                   # Product system
│   ├── auctions.md                   # Auction system
│   ├── categories.md                 # Category hierarchy
│   ├── orders.md                     # Order lifecycle
│   ├── shops.md                      # Multi-vendor shops
│   ├── reviews.md                    # Review system
│   ├── coupons.md                    # Discount codes
│   ├── addresses.md                  # User addresses
│   ├── payments.md                   # Payment processing
│   └── pages-api-reference.md        # Complete API index
│
├── ai/                               # 🤖 AI Development
│   └── AI-AGENT-GUIDE.md            # AI agent guide
│
└── other/                            # 📄 Additional Docs
    ├── BULK-ACTION-TESTING-GUIDE.md # Bulk testing
    └── ESLINT-ARCHITECTURE-RULES.md # Linting rules
```

---

## 🔗 Important Files to Know

### Constants (Check First)

- **`src/constants/api-routes.ts`** - All API endpoints (REQUIRED)
- **`src/constants/database.ts`** - Firestore collections
- **`src/constants/inline-fields.ts`** - Form configurations
- **`src/constants/bulk-actions.ts`** - Bulk operations

### Services (Never Skip)

- **`src/services/index.ts`** - All available services (25+)
- **`src/services/api.service.ts`** - Base HTTP client
- **Individual services** - Product, Auction, Cart, Order, etc.

### Custom Libraries (FREE Tier)

- **`src/lib/memory-cache.ts`** - Caching (Redis replacement)
- **`src/lib/rate-limiter.ts`** - Rate limiting
- **`src/lib/firebase-realtime.ts`** - Real-time auctions
- **`src/lib/firebase-error-logger.ts`** - Error tracking
- **`src/lib/discord-notifier.ts`** - Notifications

### Types

- **`src/types/`** - TypeScript interfaces for all entities

---

## 🏗️ Project Structure

```
justforview.in/
├── docs/                    # 📚 This documentation
├── src/
│   ├── app/                # Next.js App Router
│   │   ├── api/            # API Routes
│   │   ├── admin/          # Admin dashboard
│   │   ├── seller/         # Seller dashboard
│   │   └── (pages)/        # Public pages
│   │
│   ├── services/           # 🔑 API Service Layer (25+ services)
│   ├── components/         # React components
│   ├── lib/                # Custom libraries (FREE tier)
│   ├── types/              # TypeScript types
│   ├── constants/          # App constants
│   └── hooks/              # Custom hooks
│
├── tests/                  # Test workflows
├── scripts/                # Utility scripts
└── public/                 # Static assets
```

---

## 💡 Quick Tips

### For AI Agents

1. **Always read [Quick Start](./project/00-QUICK-START.md) first**
2. **Check `/docs/resources/` for specific features**
3. **Follow existing patterns** - Don't reinvent
4. **Use TypeScript** - Types are your friend
5. **Test with test workflows** - `npm run test:workflows:all`

### For Developers

1. **Start with architecture docs** - Understand the system
2. **Use service layer always** - No direct API calls
3. **Follow component patterns** - Server vs Client
4. **Check constants first** - Routes, collections, fields
5. **Reference resource docs** - Complete schemas and patterns

---

## 🚀 Getting Started Commands

```bash
# Clone and setup
git clone <repo-url>
cd justforview.in
npm install

# Development
npm run dev                    # Start dev server
npm run build                  # Build for production

# Testing
npm run test:workflows:all     # Run all test workflows
npm run test:workflow:1        # Run specific workflow

# Type checking
npm run type-check             # TypeScript validation
```

---

## 📊 Documentation Statistics

- **Total Docs**: 20+ files
- **Core Guides**: 4 comprehensive guides
- **Resource Docs**: 10 detailed resource specifications
- **Code Examples**: 100+ code snippets
- **Coverage**: Architecture, Services, Components, Resources, Testing

---

## 🎓 Recommended Reading Order

### For AI Agents (First Time)

1. [Quick Start](./project/00-QUICK-START.md) ⭐ (5 min)
2. [Architecture Overview](./project/01-ARCHITECTURE-OVERVIEW.md) (15 min)
3. [Service Layer Guide](./project/02-SERVICE-LAYER-GUIDE.md) (10 min)
4. Browse [resources](./resources/) as needed

### For New Developers

1. [Quick Start](./project/00-QUICK-START.md) (5 min)
2. [Architecture Overview](./project/01-ARCHITECTURE-OVERVIEW.md) (15 min)
3. [Service Layer Guide](./project/02-SERVICE-LAYER-GUIDE.md) (10 min)
4. [Component Patterns](./project/03-COMPONENT-PATTERNS.md) (10 min)
5. [AI Agent Guide](./ai/AI-AGENT-GUIDE.md) (20 min)
6. Explore codebase with knowledge

### For Quick Reference

- Jump to specific resource doc in [resources](./resources/)
- Use as reference during development

---

## 🤝 Contributing to Documentation

When updating docs:

1. **Keep it concise** - Developers want code, not essays
2. **Use code examples** - Show, don't tell
3. **Update this index** - Add new docs here
4. **Follow format** - Match existing doc structure
5. **Test examples** - Make sure code samples work

---

## 📞 Support

- **Documentation Issues**: Open GitHub issue with "docs:" prefix
- **Code Questions**: Check docs first, then ask team
- **Missing Docs**: Request via GitHub issue

---

## 📝 Version History

- **v1.0** (Nov 11, 2025) - Initial comprehensive documentation
  - Architecture guides
  - Service layer guide
  - Component patterns
  - Resource specifications
  - AI agent guide

---

**Last Updated**: November 11, 2025  
**Maintained by**: Development Team  
**Built with**: ❤️ for the developer experience

---

## 🎯 Quick Links

- **Main README**: [README.md](../README.md)
- **Quick Start**: [project/00-QUICK-START.md](./project/00-QUICK-START.md)
- **Architecture**: [project/01-ARCHITECTURE-OVERVIEW.md](./project/01-ARCHITECTURE-OVERVIEW.md)
- **Services**: [project/02-SERVICE-LAYER-GUIDE.md](./project/02-SERVICE-LAYER-GUIDE.md)
- **Components**: [project/03-COMPONENT-PATTERNS.md](./project/03-COMPONENT-PATTERNS.md)
- **Resources**: [resources/](./resources/)
