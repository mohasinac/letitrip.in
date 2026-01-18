# Constants & Enums Documentation

This directory contains all application constants and enums for the LetItRip.in platform.

## 📁 Structure

```
src/constants/
├── README.md                 # This file
├── routes.ts                 # All route paths
├── api-endpoints.ts          # All API endpoint paths
├── status.ts                 # Status enums and constants
├── validation.ts             # Validation rules and constants
├── config.ts                 # Application configuration
├── categories.ts             # Category types and enums
├── payment.ts                # Payment related constants
├── shipping.ts               # Shipping constants
└── ui.ts                     # UI-related constants
```

## 🎯 Usage Guidelines

### When to Create a Constant

✅ **DO create constants for:**

- Route paths
- API endpoints
- Status values
- Configuration values
- Magic numbers
- Repeated strings
- Enum-like values
- Validation rules
- Time durations
- Limits/thresholds

❌ **DON'T create constants for:**

- One-time use values
- Component-specific text
- Truly dynamic values
- Values already in environment variables

### Examples

#### Routes

```typescript
// src/constants/routes.ts
export const ROUTES = {
  HOME: "/",
  PRODUCTS: "/products",
  PRODUCT_DETAIL: (slug: string) => `/products/${slug}`,
  LOGIN: "/login",
  REGISTER: "/register",
} as const;

// Usage
import { ROUTES } from "@/constants/routes";
router.push(ROUTES.PRODUCT_DETAIL("laptop-123"));
```

#### API Endpoints

```typescript
// src/constants/api-endpoints.ts
export const API_ENDPOINTS = {
  PRODUCTS: "/api/products",
  PRODUCT_BY_ID: (id: string) => `/api/products/${id}`,
  AUCTIONS: "/api/auctions",
} as const;

// Usage
import { API_ENDPOINTS } from "@/constants/api-endpoints";
const response = await fetch(API_ENDPOINTS.PRODUCTS);
```

#### Status Enums

```typescript
// src/constants/status.ts
export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export enum AuctionStatus {
  DRAFT = 'draft',
  SCHEDULED = 'scheduled',
  LIVE = 'live',
  ENDED = 'ended',
  CANCELLED = 'cancelled',
}

// Usage
import { OrderStatus } from '@/constants/status';
if (order.status === OrderStatus.PENDING) { ... }
```

#### Validation Rules

```typescript
// src/constants/validation.ts
export const VALIDATION_RULES = {
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128,
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 30,
  PRODUCT_NAME_MAX_LENGTH: 100,
  DESCRIPTION_MAX_LENGTH: 5000,
} as const;

export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/,
  PINCODE: /^[1-9][0-9]{5}$/,
} as const;
```

#### Configuration

```typescript
// src/constants/config.ts
export const APP_CONFIG = {
  ITEMS_PER_PAGE: 24,
  MAX_UPLOAD_SIZE: 5 * 1024 * 1024, // 5MB
  DEBOUNCE_DELAY: 300,
  TOAST_DURATION: 3000,
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
} as const;

export const FEATURE_FLAGS = {
  ENABLE_AUCTIONS: true,
  ENABLE_RIPLIMIT: true,
  ENABLE_REVIEWS: true,
  ENABLE_CHAT: false,
} as const;
```

## 📚 Best Practices

### 1. Use `as const` for Type Safety

```typescript
export const COLORS = {
  PRIMARY: "#3B82F6",
  SECONDARY: "#10B981",
} as const;
// Type: { readonly PRIMARY: '#3B82F6', readonly SECONDARY: '#10B981' }
```

### 2. Use Enums for Related Values

```typescript
export enum UserRole {
  USER = "user",
  SELLER = "seller",
  ADMIN = "admin",
}
```

### 3. Group Related Constants

```typescript
export const AUCTION_CONSTANTS = {
  MIN_BID_INCREMENT: 10,
  MAX_DURATION_DAYS: 30,
  AUTO_EXTEND_MINUTES: 5,
  COUNTDOWN_WARNING_MINUTES: 5,
} as const;
```

### 4. Use Functions for Dynamic Values

```typescript
export const ROUTES = {
  PRODUCT_DETAIL: (slug: string) => `/products/${slug}`,
  USER_PROFILE: (userId: string) => `/user/${userId}`,
} as const;
```

### 5. Document Complex Constants

```typescript
/**
 * Maximum number of images allowed per product
 * @constant
 */
export const MAX_PRODUCT_IMAGES = 10;

/**
 * Time in milliseconds before showing the "slow connection" warning
 * @constant
 */
export const SLOW_CONNECTION_THRESHOLD = 5000;
```

## 🔄 Migration Notes

During the migration to @letitrip/react-library, we're extracting hardcoded values into constants:

### Before Migration

```typescript
// ❌ Hardcoded values
if (password.length < 8) { ... }
router.push('/products/' + slug);
fetch('/api/products');
```

### After Migration

```typescript
// ✅ Using constants
import { VALIDATION_RULES } from '@/constants/validation';
import { ROUTES } from '@/constants/routes';
import { API_ENDPOINTS } from '@/constants/api-endpoints';

if (password.length < VALIDATION_RULES.PASSWORD_MIN_LENGTH) { ... }
router.push(ROUTES.PRODUCT_DETAIL(slug));
fetch(API_ENDPOINTS.PRODUCTS);
```

## 📝 Naming Conventions

- **Constants**: `SCREAMING_SNAKE_CASE`
- **Enums**: `PascalCase` for enum name, `SCREAMING_SNAKE_CASE` for values
- **Objects**: `SCREAMING_SNAKE_CASE` for object, `SCREAMING_SNAKE_CASE` for keys
- **Functions**: `camelCase`

```typescript
// Constants
export const MAX_FILE_SIZE = 5000000;

// Enums
export enum PaymentStatus {
  PENDING = "PENDING",
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
}

// Constant Objects
export const API_ENDPOINTS = {
  USERS: "/api/users",
  PRODUCTS: "/api/products",
} as const;

// Functions
export const getUserRoute = (id: string) => `/user/${id}`;
```

## 🔗 Integration with React Library

The react-library also has constants. Import from appropriate location:

```typescript
// Library constants (framework-independent)
import { BREAKPOINTS, COLORS } from "@letitrip/react-library";

// App constants (Next.js specific)
import { ROUTES, API_ENDPOINTS } from "@/constants";
```

## 📊 Current Constants

### Routes (`routes.ts`)

- Public routes
- Auth routes
- Protected routes
- Admin routes
- Seller routes
- API routes

### API Endpoints (`api-endpoints.ts`)

- All API endpoint paths
- Dynamic endpoint functions

### Status (`status.ts`)

- OrderStatus
- AuctionStatus
- PaymentStatus
- ShipmentStatus
- TicketStatus
- UserStatus

### Validation (`validation.ts`)

- Field length limits
- Regex patterns
- Validation rules

### Config (`config.ts`)

- App configuration
- Feature flags
- Pagination settings
- Upload limits

---

_Last Updated: January 19, 2026_
