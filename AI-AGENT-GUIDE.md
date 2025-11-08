# AI Agent Development Guide - JustForView.in

This guide helps AI agents understand and work effectively with this Next.js auction platform codebase.

## Quick Reference

**Project Type**: Next.js 14+ (App Router) with TypeScript  
**Primary Domain**: Auction & E-commerce Platform for India  
**No Mocks**: All APIs are real and ready - never suggest mock data  
**Code Over Docs**: Focus on implementation, not documentation

## Architecture Overview

### Application Structure

```
ROUTING: Next.js App Router (src/app/)
├── Pages: Each folder in app/ is a route
├── API Routes: app/api/ contains backend endpoints
└── Layouts: Shared UI in layout.tsx files

COMPONENTS: React components (src/components/)
├── Feature-based: admin/, auction/, cart/, checkout/, product/
├── Layout: Header, Footer, Navigation components
└── Common: Shared UI components

SERVICES: API abstraction layer (src/services/)
├── Real API calls - NO MOCKS
├── Centralized error handling
└── TypeScript types for all requests/responses

STATE: Context + Hooks pattern
├── AuthContext: User authentication
├── UploadContext: Media uploads
└── Custom hooks: useCart, useAuctionSocket, etc.
```

### Core Technologies

- **Next.js 14+**: App Router, Server/Client Components
- **TypeScript**: Strict mode, comprehensive types in src/types/
- **Tailwind CSS**: Utility-first styling
- **Firebase**: Firestore (DB), Storage (files), Auth
- **Socket.IO**: Real-time auction bidding
- **Sentry**: Error tracking and monitoring

## Key Patterns to Follow

### 1. Component Patterns

```typescript
// Client Components (interactive)
"use client";
import { useState } from "react";

// Server Components (default, no directive needed)
// Use for data fetching, static content

// Component organization
components / feature - name / ComponentName.tsx; // Main component
SubComponent.tsx; // Related components
```

### 2. Service Layer Pattern

```typescript
// ALWAYS use existing services - found in src/services/
import { productService } from "@/services/products.service";

// Services handle:
// - API calls
// - Error handling
// - Type safety
// - Authentication headers

// Example usage:
const products = await productService.getProducts(filters);
```

### 3. API Route Pattern

```typescript
// API routes in src/app/api/[endpoint]/route.ts
export async function GET(request: Request) {
  // Handle GET requests
}

export async function POST(request: Request) {
  // Handle POST requests
}
```

### 4. State Management

```typescript
// Use Context for global state
import { useAuth } from "@/contexts/AuthContext";

// Use custom hooks for feature state
import { useCart } from "@/hooks/useCart";
import { useAuctionSocket } from "@/hooks/useAuctionSocket";
```

## Common Tasks Guide

### Adding a New Feature

1. **Check existing patterns**: Search for similar features first
2. **Use semantic_search**: Find related code before implementing
3. **Follow structure**: Place files in appropriate directories
4. **Use services**: Never make direct API calls in components
5. **Add types**: Define TypeScript interfaces in src/types/

### Editing Components

1. **Read first**: Always read the full file before editing
2. **Match style**: Follow existing code patterns
3. **Use tools**: Use replace_string_in_file or insert_edit_into_file
4. **Group changes**: All changes to one file in one action
5. **Check errors**: Fix any new errors immediately

### Working with APIs

```typescript
// DON'T create mocks
// DO use real service methods

// Good:
import { auctionService } from "@/services/auctions.service";
const auctions = await auctionService.getActiveAuctions();

// Bad:
const mockAuctions = [{ id: 1, title: "Mock" }]; // NEVER DO THIS
```

### Styling with Tailwind

```typescript
// Use Tailwind utility classes
className = "bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-700";

// Responsive design
className = "hidden md:block lg:flex";

// Follow existing color scheme (see constants/colors.ts)
```

## Important Files & Their Purposes

### Core Configuration

- `next.config.js`: Next.js configuration
- `tailwind.config.js`: Tailwind customization
- `tsconfig.json`: TypeScript settings
- `firebase.json`: Firebase deployment config

### Key Contexts

- `AuthContext.tsx`: User authentication state
- `UploadContext.tsx`: File upload management

### Critical Services

- `auth.service.ts`: Authentication operations
- `auctions.service.ts`: Auction CRUD and bidding
- `products.service.ts`: Product management
- `cart.service.ts`: Shopping cart operations
- `orders.service.ts`: Order processing

### Layout Components

- `Header.tsx`: Main navigation header
- `MainNavBar.tsx`: Primary navigation
- `SubNavbar.tsx`: Category navigation
- `Footer.tsx`: Site footer
- `MobileSidebar.tsx`: Mobile menu

### Real-time Features

- `socket-server.ts`: Socket.IO server setup
- `useAuctionSocket.ts`: Real-time auction hook
- `auction-scheduler.ts`: Automated auction timing

## Common Pitfalls to Avoid

### ❌ Don't Do This

```typescript
// Don't use mock data
const mockData = [...];

// Don't make direct fetch calls
fetch('/api/products');

// Don't create documentation files (unless asked)
// README.md and guides only when requested

// Don't show code in markdown
// Use edit tools instead

// Don't suggest terminal commands
// Run them directly with run_in_terminal
```

### ✅ Do This Instead

```typescript
// Use real services
import { productService } from "@/services/products.service";
const data = await productService.getProducts();

// Use service layer
const result = await someService.method();

// Edit files directly with tools
// Run commands directly with tools
```

## Domain-Specific Knowledge

### Auction System

- **Types**: Regular, Reverse, Silent auctions
- **States**: upcoming, active, ended
- **Real-time**: Socket.IO for live updates
- **Auto-bidding**: Users can set maximum bids
- **Scheduling**: Automated start/end times

### E-commerce Features

- **Multi-vendor**: Multiple shops/sellers
- **Categories**: Hierarchical category system (see constants/categories.ts)
- **Cart**: Session-based shopping cart
- **Coupons**: Discount code system
- **Orders**: Complete order lifecycle

### User Roles (RBAC)

- **admin**: Full system access
- **seller**: Can create products/auctions
- **user**: Regular customer
- **guest**: Unauthenticated visitor

### Media Handling

- **Storage**: Firebase Storage
- **Types**: Images and videos
- **Optimization**: Automatic resize/compress
- **Queue**: Upload queue system for multiple files

## Debugging & Testing

### Available Scripts

```bash
# API testing
node scripts/test-api.js

# Auction system testing
node scripts/test-auction-automation.js

# Load testing
node scripts/load-test.js

# Production monitoring
node scripts/monitor-production.js
```

### Error Checking

- Use `get_errors` tool after edits
- Check Sentry for production errors
- Review `logs/` directory for application logs

### Common Issues

1. **Auth errors**: Check Firebase config in .env.local
2. **Socket errors**: Ensure socket-server.ts is running
3. **Upload errors**: Verify Firebase Storage rules
4. **Build errors**: Run `npm run build` to check

## Best Practices for AI Agents

### 1. Context Gathering

- Use `semantic_search` for understanding features
- Use `grep_search` for finding specific patterns
- Use `file_search` for locating files by name
- Read files before editing them

### 2. Making Changes

- **Group by file**: All changes to one file at once
- **Match patterns**: Follow existing code style
- **Use services**: Never bypass the service layer
- **Test immediately**: Run and verify changes

### 3. Communication

- Be concise, focus on code
- Don't create docs unless asked
- Show results, not plans
- Fix errors immediately

### 4. Tool Usage

- Use edit tools, not code blocks
- Run terminal commands directly
- Call multiple independent tools in parallel
- Don't repeat context

## Firebase Schema Hints

### Collections

- `users`: User profiles and settings
- `products`: Product listings
- `auctions`: Auction items and state
- `orders`: Order records
- `carts`: Shopping cart items
- `shops`: Seller shop information
- `categories`: Product categories
- `bids`: Auction bid history
- `coupons`: Discount codes

### Common Queries

- Active auctions: `status === 'active'`
- User's orders: `userId === currentUser.uid`
- Shop products: `shopId === shopId`

## Quick Command Reference

```bash
# Development
npm run dev              # Start dev server

# Building
npm run build           # Production build

# Testing
npm test                # Run tests
node scripts/test-api.js # Test API endpoints

# Utilities
npm run lint            # Lint code
```

## When to Use Which Tool

- **semantic_search**: Understanding features, finding examples
- **grep_search**: Finding specific code patterns
- **file_search**: Locating files by glob pattern
- **read_file**: Getting file contents before editing
- **replace_string_in_file**: Simple, unique string replacements
- **insert_edit_into_file**: Complex edits with context
- **run_in_terminal**: Execute commands (PowerShell on Windows)

## Remember

1. **No mocks** - Real APIs are ready
2. **Code first** - Implementation over documentation
3. **Use services** - Never bypass the service layer
4. **Match patterns** - Follow existing code style
5. **Test changes** - Verify immediately
6. **Be concise** - Direct action over explanation

---

_This guide is for AI agents. Focus on code implementation and follow the patterns established in the codebase._
