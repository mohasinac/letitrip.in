# ESLint Architecture Rules

**Last Updated**: November 11, 2025  
**Purpose**: Enforce service layer architecture and prevent common violations

---

## 🎯 Overview

Our ESLint configuration enforces architectural patterns to maintain code quality and consistency. These rules prevent violations that would break our service layer architecture.

---

## 🚫 Restricted Patterns

### 1. No Direct `apiService` Imports

**Rule**: `no-restricted-imports`  
**Severity**: Error ❌

```typescript
// ❌ WRONG - Direct apiService import in component
import { apiService } from "@/services/api.service";

async function loadProducts() {
  const response = await apiService.get('/api/products');
  return response.data;
}

// ✅ CORRECT - Use feature-specific service
import { productsService } from "@/services/products.service";

async function loadProducts() {
  const response = await productsService.list();
  return response.data;
}
```

**Error Message**:
```
❌ Direct apiService imports not allowed in components/pages/hooks. 
Use feature-specific services instead (e.g., productsService, authService). 
See docs/ai/AI-AGENT-GUIDE.md for architecture.
```

**Why?**
- Centralizes business logic in services
- Makes API changes easier (change once in service)
- Provides type safety
- Enables better error handling
- Facilitates testing with service mocks

---

### 2. No Client-Side Firebase Auth

**Rule**: `no-restricted-imports`  
**Severity**: Error ❌

```typescript
// ❌ WRONG - Firebase Auth on client
import { auth } from "@/app/api/lib/firebase/app";
import { signInWithEmailAndPassword } from "firebase/auth";

await signInWithEmailAndPassword(auth, email, password);

// ✅ CORRECT - Use authService (server-side)
import { authService } from "@/services/auth.service";

await authService.login({ email, password });
```

**Error Message**:
```
❌ Firebase Auth must be used server-side only. 
Authentication is handled via API routes. 
Only Realtime Database (for bidding) is allowed on client.
```

**Why?**
- Security: Auth tokens handled server-side only
- Session management via HTTP-only cookies
- Prevents token exposure in client bundle
- Consistent error handling
- FREE tier optimization (no client auth SDK)

**Exception**: Firebase Realtime Database (for auction bidding) IS allowed on client.

---

### 3. No Hardcoded API Routes

**Rule**: `no-restricted-syntax`  
**Severity**: Error ❌

```typescript
// ❌ WRONG - Hardcoded API route
const response = await fetch('/api/products');
const response = await apiService.get('/api/products');

// ❌ WRONG - Template literal with hardcoded route
const response = await fetch(`/api/products/${id}`);

// ✅ CORRECT - Use constants
import { PRODUCT_ROUTES } from "@/constants/api-routes";

const response = await fetch(PRODUCT_ROUTES.LIST);
const response = await fetch(PRODUCT_ROUTES.BY_ID(id));
```

**Error Message**:
```
❌ Hardcoded API routes not allowed. 
Use API route constants from @/constants/api-routes instead. 
Example: Use PRODUCT_ROUTES.LIST instead of '/api/products'.
```

**Why?**
- Single source of truth for API routes
- Easy to refactor routes (change once in constants)
- Prevents typos in route URLs
- Better IDE autocomplete
- Type-safe route parameters

---

## ✅ Code Quality Rules

### 4. No Console.log in Production

**Rule**: `no-console`  
**Severity**: Warning ⚠️

```typescript
// ❌ WRONG
console.log("User data:", user);

// ✅ CORRECT - Use allowed methods
console.error("API Error:", error);
console.warn("Deprecated feature used");
console.info("App initialized");

// ✅ BEST - Use error logger
import { logError } from "@/lib/firebase-error-logger";
logError(error, { component: "UserProfile" });
```

**Allowed**: `console.error`, `console.warn`, `console.info`  
**Not Allowed**: `console.log`, `console.debug`, `console.trace`

---

### 5. No Unused Variables

**Rule**: `@typescript-eslint/no-unused-vars`  
**Severity**: Warning ⚠️

```typescript
// ❌ WRONG
const [user, setUser] = useState(null);
const apiKey = process.env.API_KEY; // Never used

// ✅ CORRECT - Prefix with underscore if intentionally unused
const [user, _setUser] = useState(null);
const _apiKey = process.env.API_KEY; // Reserved for future use
```

---

### 6. Prefer Const Over Let

**Rule**: `prefer-const`  
**Severity**: Warning ⚠️

```typescript
// ❌ WRONG
let name = "John";
let total = 100;

// ✅ CORRECT
const name = "John";
const total = 100;

// ✅ CORRECT - Use let when reassignment needed
let count = 0;
count++;
```

---

### 7. No Var Usage

**Rule**: `no-var`  
**Severity**: Error ❌

```typescript
// ❌ WRONG
var x = 10;

// ✅ CORRECT
const x = 10;
let y = 20;
```

---

## 📁 File Structure for Architecture

```
src/
├── app/
│   ├── page.tsx                    ✅ Use services only
│   └── products/page.tsx           ✅ Use services only
├── components/
│   └── ProductCard.tsx             ✅ Use services only
├── hooks/
│   └── useProducts.ts              ✅ Use services only
├── services/
│   ├── api.service.ts              ⚠️ Low-level (don't import directly)
│   ├── products.service.ts         ✅ Import this
│   ├── auth.service.ts             ✅ Import this
│   └── auctions.service.ts         ✅ Import this
└── constants/
    └── api-routes.ts               ✅ Import for route constants
```

---

## 🔧 Available Services

Import these instead of `apiService`:

### Core Services
- `authService` - Authentication & sessions
- `usersService` - User management
- `addressService` - User addresses

### Products & Inventory
- `productsService` - Product CRUD & search
- `categoriesService` - Category management
- `reviewsService` - Product reviews

### Shopping
- `cartService` - Shopping cart
- `ordersService` - Order management
- `couponsService` - Coupon validation

### Auctions
- `auctionsService` - Auction CRUD & bidding
- `firebase-realtime` - Real-time bid updates (client-side OK)

### Sellers
- `shopsService` - Shop management
- `analyticsService` - Dashboard stats
- `payoutsService` - Payout management

### Support & Content
- `supportService` - Support tickets
- `blogService` - Blog posts
- `heroSlidesService` - Homepage slides

### Search & Discovery
- `searchService` - Product search
- `favoritesService` - Wishlist/favorites

---

## 🚀 API Route Constants

Always use constants from `@/constants/api-routes`:

```typescript
import {
  PRODUCT_ROUTES,
  AUTH_ROUTES,
  ORDER_ROUTES,
  // ... etc
} from "@/constants/api-routes";

// ✅ Static routes
PRODUCT_ROUTES.LIST              // '/api/products'
AUTH_ROUTES.LOGIN                // '/api/auth/login'

// ✅ Dynamic routes (functions)
PRODUCT_ROUTES.BY_SLUG(slug)     // `/api/products/${slug}`
ORDER_ROUTES.BY_ID(id)           // `/api/orders/${id}`
```

---

## 🔍 Checking for Violations

### Run ESLint
```bash
npm run lint
```

### Auto-fix what's possible
```bash
npm run lint -- --fix
```

### Check specific files
```bash
npx eslint src/app/products/page.tsx
```

---

## 📝 Adding New Services

When creating a new service:

1. **Create service file**: `src/services/feature.service.ts`
2. **Use apiService internally**: Import `apiService` in the service file
3. **Export service instance**: `export const featureService = new FeatureService()`
4. **Update this doc**: Add to "Available Services" section
5. **Use in components**: Import the service, not `apiService`

**Example**:
```typescript
// src/services/notifications.service.ts
import { apiService } from "./api.service";

class NotificationsService {
  async list() {
    return apiService.get("/api/notifications");
  }
  
  async markRead(id: string) {
    return apiService.patch(`/api/notifications/${id}`, { read: true });
  }
}

export const notificationsService = new NotificationsService();
```

---

## 🎓 Best Practices

### DO ✅
- Use feature-specific services in components/pages/hooks
- Use API route constants from `@/constants/api-routes`
- Keep client-side Firebase usage to Realtime DB only (bidding)
- Handle errors in services, not components
- Create new services for new features

### DON'T ❌
- Import `apiService` directly in components/pages/hooks
- Use hardcoded API route strings like `'/api/products'`
- Use Firebase Auth on client-side
- Use `fetch()` directly (use services)
- Use `console.log()` for debugging (use proper logging)

---

## 🆘 Troubleshooting

### Error: "Direct apiService imports not allowed"

**Solution**: Import the feature-specific service instead:
```typescript
// Change this:
import { apiService } from "@/services/api.service";

// To this:
import { productsService } from "@/services/products.service";
```

### Error: "Hardcoded API routes not allowed"

**Solution**: Use constants:
```typescript
// Change this:
await fetch('/api/products');

// To this:
import { PRODUCT_ROUTES } from "@/constants/api-routes";
await fetch(PRODUCT_ROUTES.LIST);
```

### Error: "Firebase Auth must be used server-side only"

**Solution**: Use authService:
```typescript
// Change this:
import { auth } from "@/app/api/lib/firebase/app";

// To this:
import { authService } from "@/services/auth.service";
```

---

## 📚 Related Documentation

- [AI Agent Guide](./ai/AI-AGENT-GUIDE.md) - Architecture overview
- [Architecture Violations](../CHECKLIST/ARCHITECTURE-VIOLATIONS.md) - Phase 6 completion
- [API Routes Constants](../src/constants/api-routes.ts) - All route constants

---

## 🎉 Benefits

Following these rules ensures:

- ✅ **Maintainability** - Easy to update API endpoints
- ✅ **Type Safety** - TypeScript types in services
- ✅ **Testing** - Easy to mock services
- ✅ **Security** - Auth handled server-side only
- ✅ **Performance** - Optimized client bundle size
- ✅ **Consistency** - Same patterns everywhere
- ✅ **Developer Experience** - Clear error messages

