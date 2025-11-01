# 🚀 Developer Onboarding Guide

**Welcome to HobbiesSpot.com!** - Beyblade Ecommerce Platform

---

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Project Overview](#project-overview)
3. [Tech Stack](#tech-stack)
4. [Project Structure](#project-structure)
5. [Common Tasks](#common-tasks)
6. [Best Practices](#best-practices)
7. [Troubleshooting](#troubleshooting)
8. [Resources](#resources)

---

## 🏁 Quick Start

### Prerequisites

- **Node.js**: v18+ (LTS recommended)
- **npm**: v9+ (comes with Node.js)
- **Git**: Latest version
- **VS Code**: Recommended editor
- **Firebase Account**: For database and storage

### Installation

```bash
# 1. Clone the repository
git clone <repository-url>
cd justforview.in

# 2. Install dependencies
npm install

# 3. Set up environment variables
# Copy .env.example to .env.local
# Add your Firebase credentials and other API keys

# 4. Run the development server
npm run dev

# 5. Open in browser
# Navigate to http://localhost:3000
```

### First Time Setup

1. **Configure Firebase**:

   - Create a Firebase project
   - Enable Firestore Database
   - Enable Storage
   - Enable Authentication (Email/Password)
   - Download service account key (for admin SDK)
   - Add credentials to `.env.local`

2. **Initialize Database**:

   - Deploy Firestore rules: `firebase deploy --only firestore:rules`
   - Deploy Firestore indexes: `firebase deploy --only firestore:indexes`
   - Deploy Storage rules: `firebase deploy --only storage`

3. **Verify Installation**:
   ```bash
   npm run build    # Should complete without errors
   npm run type-check  # Should pass all type checks
   ```

---

## 🎯 Project Overview

### What is HobbiesSpot.com?

A modern ecommerce platform for Beyblade products with:

- **Multi-seller marketplace**
- **Product listings with media (images/videos)**
- **Admin panel** for platform management
- **Seller panel** for shop management
- **Game database** (Beyblades, Arenas, Categories)
- **Order management** with invoicing
- **Mobile-first responsive design**
- **SEO optimized** with structured data

### Key Features

- ✅ **Firebase Backend**: Firestore + Cloud Storage
- ✅ **Next.js 16**: App Router, Server Components, TypeScript
- ✅ **Unified Component Library**: 14 reusable UI components
- ✅ **Mobile Optimized**: PWA support, touch-optimized UI
- ✅ **SEO Ready**: 10 Schema.org schemas, dynamic sitemap
- ✅ **Type Safe**: Full TypeScript coverage (~95%+)
- ✅ **Error Handling**: Centralized error handling
- ✅ **API Utilities**: Unified API client with caching

---

## 🛠️ Tech Stack

### Core

- **Framework**: Next.js 16.0.0 (App Router)
- **Language**: TypeScript 5
- **React**: 18.3.0
- **Node**: v18+ LTS

### Styling

- **Tailwind CSS**: 3.4.1
- **CSS Variables**: Custom theme system
- **Icons**: Lucide React 0.547.0
- **Fonts**: Geist (Next.js font optimization)

### Backend

- **Database**: Firebase Firestore
- **Storage**: Firebase Cloud Storage
- **Auth**: Firebase Authentication
- **Admin SDK**: Firebase Admin SDK (server-side)

### Development

- **Linting**: ESLint
- **Type Checking**: TypeScript
- **Package Manager**: npm

---

## 📂 Project Structure

```
d:\proj\justforview.in\
├── src/
│   ├── app/              # Next.js pages (App Router)
│   │   ├── (routes)/     # Public routes
│   │   ├── admin/        # Admin routes
│   │   ├── seller/       # Seller routes
│   │   └── api/          # API routes
│   │
│   ├── components/       # React components
│   │   ├── ui/unified/   # 14 unified components
│   │   ├── ui/mobile/    # 5 mobile components
│   │   ├── admin/        # Admin components
│   │   ├── seller/       # Seller components
│   │   └── shared/       # Shared components
│   │
│   ├── lib/              # Server-side utilities
│   │   ├── api/          # API client, error handler
│   │   ├── database/     # Firebase (Admin/Client)
│   │   ├── seo/          # SEO utilities
│   │   └── storage/      # File storage
│   │
│   ├── utils/            # Client-side utilities
│   ├── hooks/            # Custom React hooks
│   ├── contexts/         # React contexts
│   ├── types/            # TypeScript types
│   ├── styles/           # Global styles
│   └── config/           # Configuration
│
├── public/               # Static assets
├── content/              # Content files
├── scripts/              # Build scripts
│
├── Documentation/        # 20+ documentation files
│
└── Configuration files   # next.config.js, tsconfig.json, etc.
```

**📖 Detailed Structure**: See [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)

---

## 🎯 Common Tasks

### 1. Creating a New Component

```bash
# Navigate to the appropriate directory
cd src/components/[feature]/

# Create component file
touch ComponentName.tsx
```

**Component Template**:

```typescript
/**
 * ComponentName
 * Brief description
 */

"use client"; // If client component

import React from "react";
import { cn } from "@/lib/utils";

export interface ComponentNameProps {
  /** Description */
  propName: string;
  children?: React.ReactNode;
  className?: string;
}

export const ComponentName: React.FC<ComponentNameProps> = ({
  propName,
  children,
  className,
}) => {
  return <div className={cn("base-classes", className)}>{children}</div>;
};

export default ComponentName;
```

**✅ Best Practices**:

- Use TypeScript interfaces for props
- Include JSDoc comments
- Use `cn()` utility for className merging
- Always use path aliases (`@/...`)
- Export both named and default

---

### 2. Creating a New Hook

```bash
# Navigate to hooks directory
cd src/hooks/

# Create hook file
touch useSomething.ts
```

**Hook Template**:

```typescript
/**
 * useSomething
 * Brief description
 */

"use client";

import { useState, useEffect } from "react";

export function useSomething() {
  const [state, setState] = useState<Type>(initialValue);

  useEffect(() => {
    // Effect logic
  }, []);

  return { state, setState };
}
```

**✅ Best Practices**:

- Always start with `use` prefix
- Return objects (not arrays) for multiple values
- Add proper TypeScript types
- Document with JSDoc

---

### 3. Creating an API Route

```bash
# Navigate to API directory
cd src/app/api/[route-name]/

# Create route file
touch route.ts
```

**API Route Template**:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { successResponse, errorResponse } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/error-handler";

export async function GET(request: NextRequest) {
  try {
    // Extract query params
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    // Logic here
    const data = await fetchData(id);

    return successResponse(data);
  } catch (error) {
    const apiError = handleApiError(error);
    return errorResponse(apiError.message, apiError.status);
  }
}

export async function POST(request: NextRequest) {
  try {
    // Parse body
    const body = await request.json();

    // Validate
    if (!body.requiredField) {
      return errorResponse("Missing required field", 400);
    }

    // Logic here
    const result = await createData(body);

    return successResponse(result, 201);
  } catch (error) {
    const apiError = handleApiError(error);
    return errorResponse(apiError.message, apiError.status);
  }
}
```

**✅ Best Practices**:

- Use standardized responses (`successResponse`, `errorResponse`)
- Use centralized error handling (`handleApiError`)
- Validate input data
- Return appropriate status codes
- Add proper TypeScript types

---

### 4. Adding a New Page

```bash
# Navigate to app directory
cd src/app/[route-name]/

# Create page file
touch page.tsx
```

**Page Template**:

```typescript
import { Metadata } from "next";
import { ComponentName } from "@/components/feature/ComponentName";

export const metadata: Metadata = {
  title: "Page Title | HobbiesSpot.com",
  description: "Page description for SEO",
};

export default function PageName() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Page Title</h1>
      <ComponentName />
    </div>
  );
}
```

**✅ Best Practices**:

- Always export metadata for SEO
- Use semantic HTML
- Use Tailwind utility classes
- Import components using path aliases

---

### 5. Working with Firebase

**Firestore (Client-Side)**:

```typescript
import { db } from "@/lib/database/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

// Fetch documents
const productsRef = collection(db, "products");
const q = query(productsRef, where("active", "==", true));
const snapshot = await getDocs(q);
const products = snapshot.docs.map((doc) => ({
  id: doc.id,
  ...doc.data(),
}));
```

**Firestore (Server-Side)**:

```typescript
import { getAdminDb } from "@/lib/database/admin";

// Use Admin SDK (server-side only)
const db = getAdminDb();
const productsRef = db.collection("products");
const snapshot = await productsRef.where("active", "==", true).get();
const products = snapshot.docs.map((doc) => ({
  id: doc.id,
  ...doc.data(),
}));
```

**Storage Upload**:

```typescript
import { uploadToStorage } from "@/lib/storage/storage";

// Upload file
const file = event.target.files[0];
const url = await uploadToStorage(
  file,
  "products", // folder
  `product-${id}` // filename
);
```

---

### 6. Using the API Client

```typescript
import { apiClient } from "@/lib/api/client";
import type { Product } from "@/types";

// GET request with caching
const products = await apiClient.get<Product[]>("/api/products", {
  cache: "force-cache", // Enable caching
  tags: ["products"], // Cache tags for revalidation
});

// POST request
const newProduct = await apiClient.post<Product>("/api/products", {
  body: productData,
});

// With error handling
try {
  const product = await apiClient.get<Product>(`/api/products/${id}`);
} catch (error) {
  if (isApiError(error)) {
    console.error("API Error:", error.message);
  }
}
```

---

### 7. Using Unified Components

```typescript
import {
  UnifiedButton,
  UnifiedCard,
  UnifiedInput,
  UnifiedModal,
} from "@/components/ui/unified";

function MyComponent() {
  return (
    <UnifiedCard>
      <UnifiedInput label="Email" type="email" placeholder="Enter email" />
      <UnifiedButton variant="primary" size="md">
        Submit
      </UnifiedButton>
    </UnifiedCard>
  );
}
```

**Available Components**:

- `UnifiedButton` - Button with variants
- `UnifiedInput` - Input field
- `UnifiedCard` - Card container
- `UnifiedModal` - Modal dialog
- `UnifiedTable` - Data table
- And 9 more... (see Phase 2 docs)

---

### 8. Mobile Optimization

```typescript
import {
  MobileContainer,
  MobileButton,
  MobileBottomNav,
} from "@/components/ui/mobile";
import { useIsMobile } from "@/hooks";

function MyComponent() {
  const isMobile = useIsMobile();

  return (
    <MobileContainer>
      {isMobile ? (
        <MobileButton onClick={handleClick}>
          Mobile-optimized Button
        </MobileButton>
      ) : (
        <UnifiedButton onClick={handleClick}>Desktop Button</UnifiedButton>
      )}
    </MobileContainer>
  );
}
```

---

## 📚 Best Practices

### Code Style

1. **Use TypeScript**: Always type your props, state, and functions
2. **Use Path Aliases**: `@/components/...` instead of `../../components/...`
3. **Use Unified Components**: Don't reinvent the wheel
4. **Follow Naming Conventions**: See [NAMING_CONVENTIONS.md](./NAMING_CONVENTIONS.md)
5. **Add JSDoc Comments**: Document exported functions/components

### Performance

1. **Use Server Components**: Default to server components, use `"use client"` only when needed
2. **Optimize Images**: Use Next.js `<Image>` component
3. **Enable Caching**: Use API client caching for repeated requests
4. **Lazy Load**: Use dynamic imports for large components
5. **Memoize**: Use `React.memo()`, `useMemo()`, `useCallback()` appropriately

### Security

1. **Never Commit Secrets**: Use environment variables
2. **Validate Input**: Always validate user input
3. **Use Admin SDK Carefully**: Only in API routes, never client-side
4. **Follow Firestore Rules**: Enforce security rules
5. **Sanitize Data**: Never trust user input

### Testing

1. **Test Edge Cases**: Don't just test happy paths
2. **Write Descriptive Tests**: Test names should be clear
3. **Mock External Services**: Don't make real API calls in tests
4. **Test TypeScript Types**: Ensure types are correct

---

## 🐛 Troubleshooting

### Common Issues

**1. Module Not Found**

```bash
# Error: Cannot find module '@/components/...'
# Solution: Check tsconfig.json paths are configured correctly
```

**2. Firebase Admin Initialization Error**

```bash
# Error: Firebase Admin SDK initialization failed
# Solution: Verify FIREBASE_SERVICE_ACCOUNT_KEY in .env.local
```

**3. Type Errors**

```bash
# Run type checker
npm run type-check

# Fix: Add proper TypeScript types
```

**4. Tailwind Classes Not Working**

```bash
# Verify tailwind.config.js includes your files
# Check for typos in class names
# Restart dev server if needed
```

**5. API Route 404**

```bash
# Verify route.ts file exists in correct directory
# Check HTTP method matches (GET, POST, etc.)
# Restart dev server
```

---

## 📖 Resources

### Documentation

- [README.md](./README.md) - Project overview
- [REFACTORING_PLAN.md](./REFACTORING_PLAN.md) - Complete refactoring history
- [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) - Directory structure
- [NAMING_CONVENTIONS.md](./NAMING_CONVENTIONS.md) - Naming standards
- **Phase Documentation** (20+ files) - Implementation details

### External Resources

- **Next.js**: https://nextjs.org/docs
- **React**: https://react.dev/
- **TypeScript**: https://www.typescriptlang.org/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Firebase**: https://firebase.google.com/docs

### Component Documentation

- **Phase 2**: Unified Component Library (14 components)
- **Phase 5**: Mobile Components (5 components)
- **Phase 4**: SEO Components

### API Documentation

- **Phase 6**: API/Utils Consolidation
  - Unified API client
  - Centralized error handling
  - API types and type guards

---

## 🎯 Next Steps

1. **Explore the Codebase**: Start with `src/app/page.tsx`
2. **Read Documentation**: Review phase documentation
3. **Run the Project**: `npm run dev`
4. **Make a Small Change**: Edit a component, see it update
5. **Ask Questions**: Don't hesitate to ask the team!

---

## 🎉 Welcome Aboard!

You're now ready to start contributing to HobbiesSpot.com!

**Remember**:

- Follow the established patterns
- Write clean, maintainable code
- Document your work
- Ask questions when unsure
- Have fun! 🚀

---

_Last Updated: October 31, 2025_  
_Questions? Contact the development team._
