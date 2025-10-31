# 📝 Naming Conventions

**JustForView.in** - Beyblade Ecommerce Platform

---

## 🎯 General Principles

1. **Be Descriptive**: Names should clearly indicate purpose
2. **Be Consistent**: Follow established patterns
3. **Be Concise**: Avoid unnecessary words, but don't sacrifice clarity
4. **Use English**: All code and comments in English
5. **Avoid Abbreviations**: Unless widely understood (API, URL, ID, etc.)

---

## 📁 File Naming

### Components

**Pattern**: `PascalCase.tsx`

**✅ Good Examples:**

```
UserProfile.tsx
ProductCard.tsx
MobileBottomNav.tsx
UnifiedButton.tsx
BeybladeManagement.tsx
```

**❌ Bad Examples:**

```
userprofile.tsx         # Not PascalCase
product-card.tsx        # Kebab case (use for routes only)
Mobile_Button.tsx       # Snake case
button.tsx              # Not descriptive enough
```

**Special Cases:**

- Unified components: `Unified[Name].tsx` (e.g., `UnifiedButton.tsx`)
- Mobile components: `Mobile[Name].tsx` (e.g., `MobileContainer.tsx`)
- Layout components: `[Feature]Layout.tsx` (e.g., `AdminLayout.tsx`, `ModernLayout.tsx`)

---

### Utilities

**Pattern**: `camelCase.ts` or `kebab-case.ts` for multi-word

**✅ Good Examples:**

```
mobile.ts
validation.ts
performance.ts
date.ts
currency.ts
error-handler.ts        # Multi-word with hyphen
api-middleware.ts
```

**❌ Bad Examples:**

```
Mobile.ts               # PascalCase (reserved for components)
validationUtils.ts      # Redundant "Utils"
perf.ts                 # Abbreviation
dateFormatter.ts        # Too verbose (date.ts is clear in context)
```

---

### Hooks

**Pattern**: `use[Name].ts` (camelCase with `use` prefix)

**✅ Good Examples:**

```
useAuth.ts
useProducts.ts
useIsMobile.ts
useDebounce.ts
useBreadcrumbTracker.ts
```

**❌ Bad Examples:**

```
authHook.ts             # Missing "use" prefix
UseAuth.ts              # PascalCase
use-auth.ts             # Kebab case
auth.ts                 # Missing "use" prefix
```

---

### Types

**Pattern**: `camelCase.ts` or `PascalCase.ts` for specific types

**✅ Good Examples:**

```
index.ts                # Main types file
api.ts                  # API-specific types
models.ts               # Model types
```

**Type/Interface Names**: Always `PascalCase`

```typescript
User;
Product;
ApiResponse;
ValidationError;
```

---

### Pages (App Router)

**Pattern**: `page.tsx`, `layout.tsx`, `loading.tsx`, etc.

**✅ Good Examples:**

```
page.tsx                # Route page
layout.tsx              # Route layout
loading.tsx             # Loading state
error.tsx               # Error boundary
not-found.tsx           # 404 page
```

**Route Folders**: `lowercase` with `hyphens` for multi-word

```
products/
user-profile/
admin/settings/game/
seller/inventory/
```

---

### API Routes

**Pattern**: `route.ts` in appropriately named folders

**✅ Good Examples:**

```
api/auth/route.ts
api/products/route.ts
api/sellers/[id]/route.ts
api/orders/[id]/status/route.ts
```

---

## 🏷️ Variable Naming

### Constants

**Pattern**: `UPPER_SNAKE_CASE` for true constants

**✅ Good Examples:**

```typescript
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const DEFAULT_THEME = "light";
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour
```

**Pattern**: `camelCase` for configuration objects

**✅ Good Examples:**

```typescript
const defaultConfig = { ... };
const apiConfig = { ... };
const themeConfig = { ... };
```

---

### Variables

**Pattern**: `camelCase`

**✅ Good Examples:**

```typescript
const userName = 'John';
const productList = products.filter(...);
const isLoading = false;
const hasError = true;
```

**Boolean Variables**: Start with `is`, `has`, `should`, `can`

```typescript
const isAuthenticated = true;
const hasPermission = false;
const shouldShowModal = true;
const canEdit = false;
```

---

### Functions

**Pattern**: `camelCase` with verb prefix

**✅ Good Examples:**

```typescript
function getUserById(id: string) { ... }
function createProduct(data: ProductData) { ... }
function validateEmail(email: string) { ... }
function formatCurrency(amount: number) { ... }
function calculateTotal(items: CartItem[]) { ... }
```

**Event Handlers**: Start with `handle` or `on`

```typescript
function handleClick() { ... }
function handleSubmit(e: FormEvent) { ... }
function onUserLogin(user: User) { ... }
function onError(error: Error) { ... }
```

---

## 🎨 Component Naming

### Component Names

**Pattern**: `PascalCase`, descriptive of purpose

**✅ Good Examples:**

```typescript
export const UserProfile: React.FC = () => { ... };
export const ProductCard: React.FC = () => { ... };
export const MobileBottomNav: React.FC = () => { ... };
export const UnifiedButton: React.FC = () => { ... };
```

**Unified Components** (Phase 2):

```typescript
UnifiedButton;
UnifiedInput;
UnifiedCard;
UnifiedModal;
UnifiedTable;
```

**Mobile Components** (Phase 5):

```typescript
MobileContainer;
MobileButton;
MobileBottomNav;
MobileGrid;
MobileStack;
```

---

### Component Props

**Pattern**: `[ComponentName]Props` interface

**✅ Good Examples:**

```typescript
interface UserProfileProps {
  user: User;
  onEdit?: () => void;
  className?: string;
}

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  variant?: "default" | "compact";
}

interface UnifiedButtonProps {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  onClick?: () => void;
}
```

---

## 🔧 Type Naming

### Interfaces

**Pattern**: `PascalCase`, descriptive

**✅ Good Examples:**

```typescript
interface User {
  id: string;
  name: string;
  email: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
```

---

### Type Aliases

**Pattern**: `PascalCase`, same as interfaces

**✅ Good Examples:**

```typescript
type UserId = string;
type ProductId = string;
type ButtonVariant = "primary" | "secondary" | "outline";
type ThemeMode = "light" | "dark";
```

---

### Enums

**Pattern**: `PascalCase` for enum name, `UPPER_SNAKE_CASE` for values

**✅ Good Examples:**

```typescript
enum OrderStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  SHIPPED = "SHIPPED",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
}

enum UserRole {
  ADMIN = "ADMIN",
  SELLER = "SELLER",
  USER = "USER",
}
```

---

### Generic Type Parameters

**Pattern**: Single uppercase letter or descriptive `PascalCase`

**✅ Good Examples:**

```typescript
function identity<T>(value: T): T { ... }
function mapArray<T, U>(arr: T[], fn: (item: T) => U): U[] { ... }

// More descriptive for complex cases
interface Repository<TEntity, TId> {
  findById(id: TId): Promise<TEntity | null>;
  save(entity: TEntity): Promise<void>;
}
```

---

## 📦 Import Path Conventions

### Use Path Aliases

**✅ Good:**

```typescript
import { Button } from "@/components/ui/unified";
import { apiClient } from "@/lib/api/client";
import { useAuth } from "@/hooks/auth/useAuth";
import type { User } from "@/types";
```

**❌ Avoid:**

```typescript
import { Button } from "../../../components/ui/unified";
import { apiClient } from "../../lib/api/client";
```

---

### Import Grouping

**Order**:

1. External packages (React, Next.js, etc.)
2. Internal components
3. Internal hooks
4. Internal utilities/API
5. Types
6. Styles

**✅ Good:**

```typescript
// External
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

// Components
import { UnifiedButton } from "@/components/ui/unified";
import { ProductCard } from "@/components/shared/ProductCard";

// Hooks
import { useAuth } from "@/hooks/auth/useAuth";
import { useProducts } from "@/hooks/data/useProducts";

// Utilities/API
import { apiClient } from "@/lib/api/client";
import { formatCurrency } from "@/utils/currency";

// Types
import type { User, Product } from "@/types";

// Styles
import styles from "./styles.module.css";
```

---

## 🎣 Hook Naming

### Custom Hooks

**Pattern**: `use[Name]` (camelCase)

**✅ Good Examples:**

```typescript
export function useAuth() { ... }
export function useProducts() { ... }
export function useIsMobile() { ... }
export function useDebounce<T>(value: T, delay: number) { ... }
export function useLocalStorage(key: string, initialValue: any) { ... }
```

**Return Values**: Use objects for multiple returns

```typescript
// ✅ Good
export function useAuth() {
  return {
    user,
    loading,
    error,
    login,
    logout,
  };
}

// ❌ Avoid (hard to remember order)
export function useAuth() {
  return [user, loading, error, login, logout];
}
```

---

## 🌐 API Route Naming

### Endpoint Patterns

**Pattern**: RESTful conventions

**✅ Good Examples:**

```
GET    /api/products           # List products
GET    /api/products/[id]      # Get product
POST   /api/products           # Create product
PATCH  /api/products/[id]      # Update product
DELETE /api/products/[id]      # Delete product

POST   /api/auth/login         # Login
POST   /api/auth/logout        # Logout
POST   /api/auth/register      # Register

GET    /api/sellers/[id]/products   # Seller's products
POST   /api/orders/[id]/cancel      # Cancel order
PATCH  /api/orders/[id]/status      # Update order status
```

---

## 📄 File Structure in Components

### Component File Template

```typescript
/**
 * ComponentName
 * Brief description of what this component does
 */

"use client"; // If client component

import React from "react";
import { cn } from "@/lib/utils";

// ===== TYPES =====
export interface ComponentNameProps {
  /** Description of prop */
  propName: string;
  children?: React.ReactNode;
  className?: string;
}

// ===== CONSTANTS =====
const DEFAULT_VALUE = "default";

// ===== COMPONENT =====
export const ComponentName: React.FC<ComponentNameProps> = ({
  propName,
  children,
  className,
}) => {
  // State
  const [state, setState] = React.useState<string>("");

  // Hooks
  const router = useRouter();

  // Effects
  React.useEffect(() => {
    // Effect logic
  }, []);

  // Handlers
  const handleClick = () => {
    // Handler logic
  };

  // Render
  return <div className={cn("base-classes", className)}>{children}</div>;
};

// Default export (optional)
export default ComponentName;
```

---

## 🎨 CSS/Tailwind Naming

### CSS Custom Properties

**Pattern**: `--[category]-[property]-[variant]`

**✅ Good Examples:**

```css
--color-primary-500
--color-secondary-700
--spacing-small
--spacing-large
--font-size-body
--font-weight-bold
--border-radius-sm
--shadow-elevation-1
```

---

### Tailwind Custom Classes

**Pattern**: `kebab-case` (lowercase with hyphens)

**✅ Good Examples:**

```css
.mobile-safe-area {
  ...;
}
.touch-target {
  ...;
}
.card-elevated {
  ...;
}
.button-primary {
  ...;
}
```

---

## 📚 Documentation Naming

### Documentation Files

**Pattern**: `UPPER_SNAKE_CASE.md` for major docs, `kebab-case.md` for guides

**✅ Good Examples:**

```
README.md
REFACTORING_PLAN.md
PHASE7_CODE_ORGANIZATION_COMPLETE.md
PROJECT_STRUCTURE.md
NAMING_CONVENTIONS.md
DEVELOPER_ONBOARDING.md

quick-start-guide.md
deployment-guide.md
```

---

## ✅ Quick Reference

| Item        | Pattern              | Example                         |
| ----------- | -------------------- | ------------------------------- |
| Components  | PascalCase           | `UserProfile.tsx`               |
| Utilities   | camelCase/kebab-case | `mobile.ts`, `error-handler.ts` |
| Hooks       | use + PascalCase     | `useAuth.ts`                    |
| Types       | camelCase            | `index.ts`, `api.ts`            |
| Pages       | lowercase            | `page.tsx`, `layout.tsx`        |
| Routes      | lowercase + hyphens  | `user-profile/`                 |
| Variables   | camelCase            | `userName`, `isLoading`         |
| Constants   | UPPER_SNAKE_CASE     | `MAX_FILE_SIZE`                 |
| Functions   | camelCase            | `getUserById()`                 |
| Interfaces  | PascalCase           | `User`, `ApiResponse`           |
| Type Params | T, U or PascalCase   | `<T>`, `<TEntity>`              |
| Enums       | PascalCase           | `OrderStatus.PENDING`           |
| CSS Classes | kebab-case           | `.mobile-safe-area`             |
| Docs        | UPPER_SNAKE_CASE.md  | `README.md`                     |

---

_Last Updated: October 31, 2025_  
_Related: PROJECT_STRUCTURE.md, DEVELOPER_ONBOARDING.md_
