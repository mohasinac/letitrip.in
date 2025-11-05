# Project Architecture

## Overview

This project follows a **clean service layer architecture** with clear separation between frontend and backend code, while maintaining Next.js conventions.

## 📁 Folder Structure

```
justforview// ❌ NOT ALLOWED
import { db } from '@/app/(backend)/api/_lib/database/config';
import { collection } from 'firebase/firestore';
import { ProductModel } from '@/app/(backend)/api/_lib/models/product.model';
│
├── 🔴 BACKEND (API & Server-side Logic)
│   └── src/app/(backend)/        ← Route group (invisible to URLs)
│       └── api/                  ← All API routes (still at /api/*)
│           ├── _lib/             ← Backend-only code
│           │   ├── models/       ← Database models
│           │   ├── controllers/  ← Business logic controllers
│           │   ├── middleware/   ← API middleware
│           │   ├── database/     ← DB config & services
│           │   ├── storage/      ← File storage utilities
│           │   └── utils/        ← Backend utilities
│           └── [feature]/route.ts ← API endpoints
│
├── 🔵 FRONTEND (UI & Client-side Logic)
│   ├── src/app/(frontend)/       ← Route group (invisible to URLs)
│   │   ├── page.tsx             ← Homepage (at /)
│   │   ├── shop/page.tsx        ← Shop page (at /shop)
│   │   ├── cart/page.tsx        ← Cart page (at /cart)
│   │   ├── loading.tsx          ← Loading states
│   │   └── not-found.tsx        ← 404 page
│   │
│   ├── src/components/           ← React components
│   │   ├── ui/                   ← UI primitives
│   │   ├── features/             ← Feature components
│   │   ├── layout/               ← Layout components
│   │   └── [feature]/            ← Feature-specific components
│   │
│   ├── src/hooks/                ← React hooks
│   │   ├── data/                 ← Data fetching hooks
│   │   └── auth/                 ← Authentication hooks
│   │
│   ├── src/contexts/             ← React contexts
│   │   ├── AuthContext.tsx       ← Auth state
│   │   └── [feature]Context.tsx  ← Feature contexts
│   │
│   └── src/styles/               ← Styling
│
├── 🟢 SERVICE LAYER (Frontend ↔ Backend Interface)
│   └── src/lib/api/              ← API service layer
│       ├── client.ts             ← API client with auth
│       ├── index.ts              ← Service exports
│       └── services/             ← Service classes
│           ├── product.service.ts
│           ├── cart.service.ts
│           └── [feature].service.ts
│
├── 🟡 SHARED (Used by both)
│   ├── src/types/                ← TypeScript types
│   ├── src/config/               ← Configuration
│   ├── src/constants/            ← Constants
│   └── src/utils/                ← Shared utilities
│
└── 📚 DOCUMENTATION
    ├── docs/                     ← All documentation
    ├── ARCHITECTURE.md           ← This file
    ├── MIGRATION_COMPLETE.md     ← Migration summary
    └── SERVICE_LAYER_COMPLETE.md ← Service layer docs
```

## 🏗️ Architecture Layers

### Layer 1: Frontend (Client-side)

**Location**: `/src/app/(frontend)`, `/src/components`, `/src/hooks`, `/src/contexts`

**Responsibilities**:

- UI rendering
- User interactions
- Client-side routing
- State management
- Form handling

**Rules**:

- ✅ Can import from: Services, Shared, UI components
- ❌ Cannot import: Backend code, Firebase Admin, Direct Firebase Firestore
- ✅ Can use: Firebase Auth client SDK (for auth state only)

**Example**:

```typescript
// ✅ ALLOWED - Using service layer
import { ProductService } from "@/lib/api";
const products = await ProductService.getProducts();

// ❌ NOT ALLOWED - Direct Firebase
import { collection, getDocs } from "firebase/firestore";
```

### Layer 2: Service Layer (Interface/Boundary)

**Location**: `/src/lib/api/services`

**Responsibilities**:

- API communication
- Request/response handling
- Error handling
- Caching
- Authentication token management
- Type safety

**Rules**:

- ✅ Only communicates with backend via HTTP
- ✅ Uses `apiClient` for all requests
- ❌ No direct database access
- ❌ No Firebase imports (except for apiClient auth)

**Example**:

```typescript
// Service method
static async getProducts(): Promise<Product[]> {
  const response = await apiClient.get('/api/products');
  return response;
}
```

### Layer 3: Backend (Server-side)

**Location**: `/src/app/(backend)/api`

**Responsibilities**:

- API endpoints
- Business logic
- Database operations
- Authentication & authorization
- File uploads
- Payment processing
- Email sending

**Rules**:

- ✅ Can use: Firebase Admin SDK, Firestore, Storage
- ✅ Can access: Database, external APIs
- ✅ Validates all inputs
- ✅ Handles authentication
- ❌ No UI components
- ❌ No client-side code

**Example**:

```typescript
// API route handler
export async function GET(request: NextRequest) {
  // Validate auth
  // Query database with Firebase Admin
  // Return response
}
```

## 🔄 Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    USER INTERFACE                            │
│              (Components, Pages, Hooks)                      │
│                     FRONTEND                                 │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ Uses services
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   SERVICE LAYER                              │
│            (ProductService, CartService, etc.)               │
│                  BOUNDARY/INTERFACE                          │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              API Client                              │  │
│  │  • Adds auth tokens                                  │  │
│  │  • Handles retries                                   │  │
│  │  • Caches responses                                  │  │
│  │  • Formats errors                                    │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ HTTP Requests
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   BACKEND API                                │
│                 (API Route Handlers)                         │
│                      BACKEND                                 │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Controllers                             │  │
│  │              Models                                  │  │
│  │              Middleware                              │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ Database operations
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                 FIREBASE/DATABASE                            │
│           (Firestore, Auth, Storage)                         │
└─────────────────────────────────────────────────────────────┘
```

## 🎯 Code Location Guidelines

### When writing code, ask:

#### "Is this UI?"

→ Put in `/src/components` or `/src/app/(frontend)` (Frontend)

#### "Is this an API endpoint?"

→ Put in `/src/app/(backend)/api` (Backend)

#### "Is this calling the backend?"

→ Put in `/src/lib/api/services` (Service Layer)

#### "Is this shared between frontend and backend?"

→ Put in `/src/types`, `/src/constants`, or `/src/utils` (Shared)

## 🚫 Import Rules

### Frontend Code

```typescript
// ✅ ALLOWED
import { Button } from "@/components/ui/button";
import { ProductService } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Product } from "@/types";

// ❌ NOT ALLOWED
import { db } from "@/app/api/_lib/database/config";
import { collection } from "firebase/firestore";
import { ProductModel } from "@/app/api/_lib/models/product.model";
```

### Backend Code

```typescript
// ✅ ALLOWED
import { getFirestore } from "firebase-admin/firestore";
import { ProductModel } from "../_lib/models/product.model";
import { authMiddleware } from "../_lib/middleware/auth";

// ❌ NOT ALLOWED
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
```

### Service Layer

```typescript
// ✅ ALLOWED
import { apiClient } from "../client";
import { Product } from "@/types";

// ❌ NOT ALLOWED
import { db } from "@/app/api/_lib/database/config";
import { Button } from "@/components/ui/button";
```

## 📦 Module Boundaries

### Frontend Modules

- `@/components/*` - UI components
- `@/app/(frontend)/*` - Pages & routes
- `@/hooks/*` - React hooks
- `@/contexts/*` - React contexts
- `@/styles/*` - Styling

### Backend Modules

- `@/app/(backend)/api/*` - API routes
- `@/app/(backend)/api/_lib/*` - Backend utilities

### Interface Modules

- `@/lib/api/*` - Service layer

### Shared Modules

- `@/types/*` - TypeScript types
- `@/constants/*` - Constants
- `@/config/*` - Configuration
- `@/utils/*` - Shared utilities

## 🔐 Authentication Flow

```
Frontend (UI)
    │
    │ Login/Register
    ▼
Firebase Auth Client SDK
    │
    │ Returns user + token
    ▼
Auth Context (Frontend)
    │
    │ Stores user state
    ▼
API Client (Service Layer)
    │
    │ Adds token to requests
    │ Authorization: Bearer <token>
    ▼
Backend API Routes
    │
    │ Verifies token
    │ Checks permissions
    ▼
Protected Resources
```

## 🎨 Best Practices

### 1. Frontend

- Use services for all API calls
- Never import from `/app/api/_lib`
- Use hooks for data fetching
- Keep components focused and small

### 2. Service Layer

- One service per API resource
- Always use `apiClient`
- Handle errors gracefully
- Cache where appropriate

### 3. Backend

- Validate all inputs
- Check authentication
- Use models for database operations
- Return consistent response format

### 4. Shared Code

- Keep types synchronized
- Use constants for magic values
- Share validation logic
- Document shared utilities

## 🚀 Benefits of This Architecture

1. **Clear Separation** - Easy to understand where code belongs
2. **Type Safety** - Full TypeScript support across layers
3. **Testability** - Each layer can be tested independently
4. **Maintainability** - Changes isolated to specific layers
5. **Scalability** - Can scale frontend/backend independently
6. **Team Friendly** - Frontend/backend teams can work independently
7. **Future-Proof** - Can swap backend without touching UI

## 📚 Related Documentation

- [Service Layer Complete](./SERVICE_LAYER_COMPLETE.md)
- [Migration Complete](./MIGRATION_COMPLETE.md)
- [API Services Guide](./docs/api/API_SERVICES_COMPLETE_GUIDE.md)
- [Quick Reference](./docs/guides/QUICK_REFERENCE.md)

---

**This architecture achieves clean separation while maintaining Next.js conventions and build compatibility.**
