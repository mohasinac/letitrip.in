# 📁 Project Structure Guide

**JustForView.in** - Beyblade Ecommerce Platform

---

## 🏗️ Directory Structure

```
d:\proj\justforview.in\
├── src/                          # Source code
│   ├── app/                      # Next.js App Router
│   │   ├── (routes)/             # Route groups
│   │   ├── admin/                # Admin pages
│   │   ├── seller/               # Seller pages
│   │   ├── api/                  # API routes
│   │   ├── layout.tsx            # Root layout
│   │   ├── page.tsx              # Homepage
│   │   └── sitemap.ts            # Dynamic sitemap
│   │
│   ├── components/               # React components
│   │   ├── ui/                   # UI components
│   │   │   ├── unified/          # 14 unified components (Phase 2)
│   │   │   └── mobile/           # 5 mobile components (Phase 5)
│   │   ├── admin/                # Admin-specific components
│   │   ├── seller/               # Seller-specific components
│   │   ├── home/                 # Homepage components
│   │   ├── game/                 # Game components
│   │   ├── shared/               # Shared components
│   │   ├── layout/               # Layout components
│   │   └── seo/                  # SEO components (Phase 4)
│   │
│   ├── lib/                      # Server-side utilities
│   │   ├── api/                  # API utilities
│   │   │   ├── client.ts         # API client with caching
│   │   │   ├── error-handler.ts  # Centralized error handling
│   │   │   ├── middleware.ts     # API middleware
│   │   │   └── response.ts       # Response utilities
│   │   ├── auth/                 # Authentication
│   │   │   ├── auth.ts           # Auth utilities
│   │   │   └── adminAuth.ts      # Admin auth
│   │   ├── database/             # Database (Firebase)
│   │   │   ├── admin.ts          # Admin SDK
│   │   │   └── firebase.ts       # Client SDK
│   │   ├── firebase/             # Firebase config
│   │   ├── seo/                  # SEO utilities (Phase 4)
│   │   │   ├── structured-data.ts # Schema.org generators
│   │   │   └── metadata.ts       # Metadata generation
│   │   ├── storage/              # File storage
│   │   └── utils.ts              # Common utilities
│   │
│   ├── utils/                    # Client-side utilities
│   │   ├── mobile.ts             # Mobile utilities (Phase 5)
│   │   ├── responsive.ts         # Responsive utilities
│   │   ├── validation.ts         # Validation utilities
│   │   ├── performance.ts        # Performance utilities
│   │   ├── theme.ts              # Theme utilities
│   │   ├── date.ts               # Date formatting
│   │   ├── currency.ts           # Currency formatting
│   │   └── ...                   # Other utilities
│   │
│   ├── hooks/                    # Custom React hooks
│   │   ├── auth/                 # Auth hooks
│   │   │   └── useAuth.ts        # Main auth hook
│   │   ├── data/                 # Data fetching hooks
│   │   │   ├── useProducts.ts    # Product data
│   │   │   ├── useArenas.ts      # Arena data
│   │   │   └── useOrders.ts      # Order data
│   │   └── index.ts              # Common hooks
│   │
│   ├── contexts/                 # React contexts
│   │   ├── AuthContext.tsx       # Authentication
│   │   ├── ModernThemeContext.tsx # Theme management
│   │   └── BreadcrumbContext.tsx # Navigation
│   │
│   ├── types/                    # TypeScript types
│   │   ├── index.ts              # Main types
│   │   ├── api.ts                # API types (Phase 6)
│   │   └── ...
│   │
│   ├── styles/                   # Global styles
│   │   ├── globals.css           # Global CSS
│   │   ├── mobile.css            # Mobile styles (Phase 5)
│   │   └── theme/                # Theme tokens (Phase 1)
│   │
│   └── config/                   # Configuration
│       ├── env.ts                # Environment config
│       └── ...
│
├── public/                       # Static assets
│   ├── manifest.json             # PWA manifest (Phase 5)
│   ├── robots.txt                # Crawler directives (Phase 4)
│   ├── icons/                    # App icons
│   └── images/                   # Static images
│
├── content/                      # Content files
│   ├── about/                    # About page content
│   ├── homepage/                 # Homepage content
│   └── faq.md                    # FAQ content
│
├── scripts/                      # Build/deployment scripts
│
├── .vscode/                      # VS Code settings
├── .next/                        # Next.js build output
├── node_modules/                 # Dependencies
│
├── firebase.json                 # Firebase config
├── firestore.rules               # Firestore security rules
├── firestore.indexes.json        # Firestore indexes
├── storage.rules                 # Storage security rules
│
├── next.config.js                # Next.js configuration
├── tsconfig.json                 # TypeScript configuration
├── tailwind.config.js            # Tailwind CSS configuration
├── postcss.config.js             # PostCSS configuration
├── package.json                  # Dependencies
│
└── Documentation files (20+)     # Phase documentation
    ├── README.md
    ├── REFACTORING_PLAN.md
    ├── PROJECT_STRUCTURE.md (this file)
    ├── NAMING_CONVENTIONS.md
    ├── DEVELOPER_ONBOARDING.md
    └── PHASE*_*.md
```

---

## 📂 Component Organization

### UI Components (14 Unified + 5 Mobile)

**Unified Components (`components/ui/unified/`)**:

1. `UnifiedButton.tsx` - Button component
2. `UnifiedInput.tsx` - Input field
3. `UnifiedCard.tsx` - Card container
4. `UnifiedModal.tsx` - Modal dialog
5. `UnifiedTable.tsx` - Data table
6. `UnifiedBadge.tsx` - Badge/tag
7. `UnifiedAvatar.tsx` - User avatar
8. `UnifiedSelect.tsx` - Dropdown select
9. `UnifiedTabs.tsx` - Tab navigation
10. `UnifiedAlert.tsx` - Alert/notification
11. `UnifiedChip.tsx` - Chip/token
12. `UnifiedProgress.tsx` - Progress indicator
13. `UnifiedSkeleton.tsx` - Loading skeleton
14. `UnifiedTooltip.tsx` - Tooltip

**Mobile Components (`components/ui/mobile/`)**:

1. `MobileContainer.tsx` - Layout components (Container, Grid, Stack, Scroll)
2. `MobileButton.tsx` - Touch-optimized button
3. `MobileBottomNav.tsx` - Bottom navigation
4. `index.ts` - Mobile exports

### Feature Components

**Admin (`components/admin/`)**:

- `BeybladeManagement.tsx` - Beyblade CRUD
- `ArenaManagement.tsx` - Arena CRUD
- `OrderManagement.tsx` - Order management
- `UserManagement.tsx` - User management
- `SellerManagement.tsx` - Seller approval
- `AnalyticsDashboard.tsx` - Analytics
- And more...

**Seller (`components/seller/`)**:

- `ProductForm.tsx` - Product creation/edit
- `InventoryManager.tsx` - Inventory management
- `OrderList.tsx` - Seller orders
- `ShopSettings.tsx` - Shop configuration
- `Analytics.tsx` - Seller analytics
- And more...

**Home (`components/home/`)**:

- `HeroSection.tsx` - Homepage hero
- `FeaturedProducts.tsx` - Featured products
- `CategoryGrid.tsx` - Category grid
- `TestimonialSlider.tsx` - Testimonials
- And more...

**Game (`components/game/`)**:

- `BeybladeCard.tsx` - Beyblade card
- `BeybladeSelect.tsx` - Beyblade selector
- `ArenaCard.tsx` - Arena card
- `ArenaSelect.tsx` - Arena selector
- And more...

**Shared (`components/shared/`)**:

- `ProductCard.tsx` - Product card
- `CategoryCard.tsx` - Category card
- `UserProfile.tsx` - User profile
- `SearchBar.tsx` - Search
- `Pagination.tsx` - Pagination
- And more...

**Layout (`components/layout/`)**:

- `ModernLayout.tsx` - Main layout
- `AdminLayout.tsx` - Admin layout
- `SellerLayout.tsx` - Seller layout
- `Header.tsx` - Header
- `Footer.tsx` - Footer
- `Sidebar.tsx` - Sidebar
- And more...

**SEO (`components/seo/`)** (Phase 4):

- `SEOHead.tsx` - SEO meta tags

---

## 📚 Library Organization

### API Utilities (`lib/api/`)

**11 Files:**

1. `client.ts` - API client with caching and retry
2. `error-handler.ts` - Centralized error handling (350 lines)
3. `middleware.ts` - API middleware
4. `response.ts` - Response utilities
5. `sellers.ts` - Seller API
6. `products.ts` - Product API
7. `orders.ts` - Order API
8. `auth.ts` - Auth API
9. `addresses.ts` - Address API
10. `inventory.ts` - Inventory API
11. `shop.ts` - Shop API

### Database (`lib/database/`)

1. `admin.ts` - Firebase Admin SDK (server-side)
2. `firebase.ts` - Firebase Client SDK (client-side)

### SEO (`lib/seo/`)` (Phase 4)

1. `structured-data.ts` - 10 Schema.org generators (450 lines)
2. `metadata.ts` - Metadata generation

### Storage (`lib/storage/`)

1. `storage.ts` - File upload/delete utilities
2. `cleanup.ts` - Storage cleanup

### Authentication (`lib/auth/`)

1. `auth.ts` - Auth utilities
2. `adminAuth.ts` - Admin authentication

---

## 🎣 Hook Organization

### Common Hooks (`hooks/index.ts`)

- `useIsMobile()` - Mobile detection
- `useDebounce()` - Debounce values
- `useLocalStorage()` - Local storage
- `useSessionStorage()` - Session storage
- `useMediaQuery()` - Media queries
- `usePrevious()` - Previous value
- `useToggle()` - Boolean toggle
- `useCopyToClipboard()` - Clipboard
- `useOnClickOutside()` - Click outside
- `useWindowSize()` - Window dimensions

### Auth Hooks (`hooks/auth/`)

- `useAuth.ts` - Main authentication hook

### Data Hooks (`hooks/data/`)

- `useProducts.ts` - Product data fetching
- `useArenas.ts` - Arena data fetching
- `useOrders.ts` - Order data fetching
- `useBeyblades.ts` - Beyblade data fetching
- `useCategories.ts` - Category data fetching

### Specialized Hooks

- `useBreadcrumbTracker.ts` - Navigation tracking
- `useFirebaseAuth.ts` - Firebase auth

---

## 🎨 Styling Organization

### Global Styles (`src/styles/`)

1. **globals.css** - Global CSS, CSS variables
2. **mobile.css** - Mobile utilities (390 lines, Phase 5)
3. **theme/** - Theme tokens (Phase 1)

### Tailwind Configuration

**File**: `tailwind.config.js`

**Custom Theme Tokens**:

- Colors: primary, secondary, accent, neutral
- Spacing: consistent 8px scale
- Typography: font families, sizes, weights
- Breakpoints: mobile-first
- Shadows: elevation system
- Border radius: consistent radii

---

## 🔧 Configuration Files

### Build Configuration

- `next.config.js` - Next.js configuration
- `tsconfig.json` - TypeScript configuration
- `tailwind.config.js` - Tailwind CSS configuration
- `postcss.config.js` - PostCSS configuration

### Firebase Configuration

- `firebase.json` - Firebase hosting/functions config
- `firestore.rules` - Firestore security rules
- `firestore.indexes.json` - Firestore indexes
- `storage.rules` - Storage security rules

### Deployment Configuration

- `vercel.json` - Vercel configuration
- `render.yaml` - Render configuration
- `package.json` - Dependencies and scripts

---

## 📦 Type Organization

### Main Types (`src/types/`)

**index.ts** - Core types:

- `User` - User model
- `Product` - Product model
- `Order` - Order model
- `Seller` - Seller model
- `Shop` - Shop model
- `Beyblade` - Beyblade model
- `Arena` - Arena model
- `Category` - Category model
- `Address` - Address model

**api.ts** - API types (Phase 6):

- `ApiResponse<T>` - Standard API response
- `PaginatedResponse<T>` - Paginated response
- `ApiError` - Error response
- `ValidationError` - Validation errors
- Type guards: `isApiError()`, `isPaginatedResponse()`, etc.

---

## 🚀 Route Organization

### App Router Structure

```
src/app/
├── (routes)/              # Route groups (public)
│   ├── products/
│   │   ├── page.tsx       # Product listing
│   │   └── [id]/
│   │       └── page.tsx   # Product detail
│   ├── cart/
│   ├── checkout/
│   └── ...
│
├── admin/                 # Admin routes (protected)
│   ├── page.tsx           # Admin dashboard
│   ├── layout.tsx         # Admin layout
│   ├── products/
│   ├── orders/
│   ├── sellers/
│   ├── users/
│   ├── settings/
│   │   ├── game/
│   │   │   └── page.tsx   # Game settings
│   │   └── ...
│   └── ...
│
├── seller/                # Seller routes (protected)
│   ├── page.tsx           # Seller dashboard
│   ├── layout.tsx         # Seller layout
│   ├── products/
│   │   ├── page.tsx       # Product list
│   │   ├── new/
│   │   │   └── page.tsx   # Create product
│   │   └── [id]/
│   │       └── edit/
│   │           └── page.tsx # Edit product
│   ├── orders/
│   ├── inventory/
│   ├── analytics/
│   └── settings/
│
├── api/                   # API routes
│   ├── auth/
│   ├── products/
│   ├── orders/
│   ├── sellers/
│   └── ...
│
├── layout.tsx             # Root layout
├── page.tsx               # Homepage
├── sitemap.ts             # Dynamic sitemap (Phase 4)
├── loading.tsx            # Loading state
├── error.tsx              # Error boundary
└── not-found.tsx          # 404 page
```

---

## 📖 Documentation Structure

### Phase Documentation (20+ files)

**Planning:**

- `REFACTORING_PLAN.md` - Master refactoring plan
- `REFACTORING_SUMMARY.md` - High-level summary
- `MASTER_REFACTORING_CHECKLIST.md` - Complete checklist

**Phase Completion:**

- `PHASE2_COMPLETE.md` - Component Library (Phase 2)
- `PHASE3_*.md` - MUI Migration (Phase 3) - 10+ files
- `PHASE4_*.md` - SEO (Phase 4)
- `PHASE5_*.md` - Mobile (Phase 5)
- `PHASE6_COMPLETION.md` - API/Utils (Phase 6)
- `PHASE7_CODE_ORGANIZATION_COMPLETE.md` - Final phase (Phase 7)

**Feature Documentation:**

- `VIDEO_UPLOAD_COMPLETE.md`
- `UNIQUE_ITEM_FEATURE.md`
- `USER_ADDRESS_FEATURE.md`
- `WHATSAPP_EDITOR_IMPROVEMENTS.md`
- And more...

**Project Documentation:**

- `README.md` - Project overview
- `PROJECT_STRUCTURE.md` - This file
- `NAMING_CONVENTIONS.md` - Naming standards
- `DEVELOPER_ONBOARDING.md` - Onboarding guide
- `QUICK_START_GUIDE.md` - Quick start
- `FIREBASE_DEPLOYMENT_GUIDE.md` - Deployment

---

## 🎯 Best Practices

### File Organization

**✅ Good:**

- Group related files together (by feature)
- Use clear, descriptive names
- Keep files focused (single responsibility)
- Use index.ts for clean exports

**❌ Avoid:**

- Deeply nested directories (max 3 levels)
- Generic names (utils.ts in multiple places)
- Large monolithic files (>500 lines)
- Mixed concerns in one file

### Component Organization

**✅ Good:**

- Feature-based organization (admin/, seller/, home/)
- Shared components in ui/unified/ or shared/
- Co-locate tests with components
- One component per file

**❌ Avoid:**

- Mixing feature and UI components
- Duplicate components in multiple directories
- Components without proper typing
- Components without clear naming

### Import Organization

**✅ Good:**

```typescript
// External imports first
import React from "react";
import { useRouter } from "next/navigation";

// Internal imports (grouped by type)
import { Button } from "@/components/ui/unified";
import { useAuth } from "@/hooks/auth/useAuth";
import { apiClient } from "@/lib/api/client";
import type { User } from "@/types";
```

**❌ Avoid:**

```typescript
// Mixed imports (hard to read)
import { Button } from "@/components/ui/unified";
import React from "react";
import type { User } from "@/types";
import { useRouter } from "next/navigation";
```

---

_Last Updated: October 31, 2025_  
_Related: NAMING_CONVENTIONS.md, DEVELOPER_ONBOARDING.md_
