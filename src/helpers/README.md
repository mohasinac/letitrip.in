# Helpers

> Business logic functions for authentication, data manipulation, and UI utilities

## Overview

This directory contains helper functions that encapsulate business logic and domain-specific operations. Unlike utils (which are pure functions), helpers may have side effects and domain knowledge.

## Import

All helpers are exported through the barrel file:

```typescript
import { hasRole, groupBy, classNames, generateInitials } from "@/helpers";
```

## Directory Structure

```
helpers/
├── auth/        # Authentication and authorization helpers
├── data/        # Data manipulation and transformation helpers
├── ui/          # UI-specific helper functions
└── index.ts     # Barrel export
```

---

## 🔐 Auth Helpers

**Location**: `src/helpers/auth/`

### Authentication Helper

| Function                                 | Purpose                  | Returns   |
| ---------------------------------------- | ------------------------ | --------- |
| `hasRole(user, role)`                    | Check user role          | `boolean` |
| `isAdmin(user)`                          | Check if admin           | `boolean` |
| `isSeller(user)`                         | Check if seller          | `boolean` |
| `isModerator(user)`                      | Check if moderator       | `boolean` |
| `canAccessAdminPanel(user)`              | Check admin panel access | `boolean` |
| `getRoleHierarchy(role)`                 | Get role priority level  | `number`  |
| `isRoleHigherThan(userRole, targetRole)` | Compare roles            | `boolean` |
| `formatUserDisplayName(user)`            | Get display name         | `string`  |
| `getInitials(user)`                      | Get user initials        | `string`  |

**Example:**

```typescript
import { hasRole, isAdmin, canAccessAdminPanel } from '@/helpers';
import type { UserProfile } from '@/types/auth';

function ProtectedRoute({ user }: { user: UserProfile }) {
  if (!canAccessAdminPanel(user)) {
    return <UnauthorizedPage />;
  }

  return (
    <AdminDashboard>
      {isAdmin(user) && <SuperAdminControls />}
    </AdminDashboard>
  );
}
```

### Token Helper

| Function                    | Purpose                                 | Returns          |
| --------------------------- | --------------------------------------- | ---------------- |
| `generateToken(length?)`    | Generate random token                   | `string`         |
| `generateSecureToken()`     | Generate cryptographically secure token | `string`         |
| `hashToken(token)`          | Hash token for storage                  | `string`         |
| `verifyToken(token, hash)`  | Verify token against hash               | `boolean`        |
| `isTokenExpired(expiresAt)` | Check token expiration                  | `boolean`        |
| `encodeToken(data)`         | Encode data to token                    | `string`         |
| `decodeToken(token)`        | Decode token to data                    | `object \| null` |

**Example:**

```typescript
import { generateSecureToken, hashToken, isTokenExpired } from "@/helpers";

// Generate and store token
const resetToken = generateSecureToken();
const hashedToken = hashToken(resetToken);

await storePasswordResetToken({
  userId: user.id,
  token: hashedToken,
  expiresAt: new Date(Date.now() + 3600000), // 1 hour
});

// Verify token later
if (isTokenExpired(tokenData.expiresAt)) {
  throw new Error("Token expired");
}
```

---

## 📊 Data Helpers

**Location**: `src/helpers/data/`

### Array Helper

| Function                       | Purpose                 | Returns               |
| ------------------------------ | ----------------------- | --------------------- |
| `unique<T>(arr)`               | Remove duplicates       | `T[]`                 |
| `groupBy<T>(arr, key)`         | Group by property       | `Record<string, T[]>` |
| `chunk<T>(arr, size)`          | Split into chunks       | `T[][]`               |
| `shuffle<T>(arr)`              | Randomize order         | `T[]`                 |
| `sample<T>(arr, count)`        | Get random samples      | `T[]`                 |
| `partition<T>(arr, predicate)` | Split by condition      | `[T[], T[]]`          |
| `flatten<T>(arr)`              | Flatten nested arrays   | `T[]`                 |
| `difference<T>(arr1, arr2)`    | Array difference        | `T[]`                 |
| `intersection<T>(arr1, arr2)`  | Array intersection      | `T[]`                 |
| `union<T>(...arrays)`          | Array union             | `T[]`                 |
| `pluck<T>(arr, key)`           | Extract property values | `any[]`               |
| `sortBy<T>(arr, key, order?)`  | Sort by property        | `T[]`                 |

**Example:**

```typescript
import { groupBy, unique, sortBy } from "@/helpers";

// Group orders by status
const orders = await fetchOrders();
const ordersByStatus = groupBy(orders, "status");
// { 'pending': [...], 'completed': [...], 'cancelled': [...] }

// Remove duplicate categories
const allCategories = products.flatMap((p) => p.categories);
const uniqueCategories = unique(allCategories);

// Sort users by join date
const sortedUsers = sortBy(users, "createdAt", "desc");
```

### Object Helper

| Function                           | Purpose                      | Returns        |
| ---------------------------------- | ---------------------------- | -------------- |
| `pick<T>(obj, keys)`               | Select properties            | `Partial<T>`   |
| `omit<T>(obj, keys)`               | Exclude properties           | `Partial<T>`   |
| `merge<T>(...objects)`             | Deep merge objects           | `T`            |
| `clone<T>(obj)`                    | Deep clone object            | `T`            |
| `isEqual(obj1, obj2)`              | Deep equality check          | `boolean`      |
| `has(obj, path)`                   | Check nested property exists | `boolean`      |
| `get<T>(obj, path, defaultValue?)` | Get nested property          | `T`            |
| `set(obj, path, value)`            | Set nested property          | `object`       |
| `isEmpty(obj)`                     | Check if empty object        | `boolean`      |
| `keys<T>(obj)`                     | Type-safe keys               | `(keyof T)[]`  |
| `values<T>(obj)`                   | Type-safe values             | `T[keyof T][]` |

**Example:**

```typescript
import { pick, omit, get, set } from "@/helpers";

// Pick specific fields for API response
const userPublicData = pick(user, ["id", "name", "email", "avatar"]);

// Omit sensitive fields
const userWithoutPassword = omit(user, ["password", "resetToken"]);

// Get nested property safely
const city = get(user, "address.city", "Unknown");

// Set nested property
const updatedUser = set(user, "preferences.notifications.email", true);
```

### Pagination Helper

| Function                                           | Purpose                       | Returns          |
| -------------------------------------------------- | ----------------------------- | ---------------- |
| `calculatePagination(total, page, limit)`          | Calculate pagination metadata | `PaginationMeta` |
| `getPageRange(currentPage, totalPages, maxPages?)` | Get visible page numbers      | `number[]`       |
| `hasPreviousPage(page)`                            | Check if has previous         | `boolean`        |
| `hasNextPage(page, totalPages)`                    | Check if has next             | `boolean`        |
| `getOffset(page, limit)`                           | Calculate query offset        | `number`         |
| `getTotalPages(total, limit)`                      | Calculate total pages         | `number`         |

**Example:**

```typescript
import { calculatePagination, getPageRange } from "@/helpers";

// Calculate pagination for query results
const total = 150;
const page = 3;
const limit = 20;

const pagination = calculatePagination(total, page, limit);
// {
//   total: 150,
//   page: 3,
//   limit: 20,
//   totalPages: 8,
//   hasNext: true,
//   hasPrevious: true,
//   startIndex: 40,
//   endIndex: 60
// }

// Get visible page numbers for pagination UI
const pageNumbers = getPageRange(page, pagination.totalPages, 5);
// [1, 2, 3, 4, 5]
```

### Sorting Helper

| Function                            | Purpose                    | Returns                  |
| ----------------------------------- | -------------------------- | ------------------------ |
| `sortByDate<T>(arr, key, order?)`   | Sort by date field         | `T[]`                    |
| `sortByString<T>(arr, key, order?)` | Sort by string field       | `T[]`                    |
| `sortByNumber<T>(arr, key, order?)` | Sort by number field       | `T[]`                    |
| `sortByMultiple<T>(arr, sortKeys)`  | Multi-field sort           | `T[]`                    |
| `createSorter<T>(key, order?)`      | Create comparator function | `(a: T, b: T) => number` |

**Example:**

```typescript
import { sortByDate, sortByMultiple } from "@/helpers";

// Sort products by creation date
const recentProducts = sortByDate(products, "createdAt", "desc");

// Multi-field sort: by category (asc), then by price (desc)
const sortedProducts = sortByMultiple(products, [
  { key: "category", order: "asc" },
  { key: "price", order: "desc" },
]);
```

---

## 🎨 UI Helpers

**Location**: `src/helpers/ui/`

### Style Helper

| Function                                                    | Purpose                                    | Returns  |
| ----------------------------------------------------------- | ------------------------------------------ | -------- |
| `classNames(...classes)`                                    | Combine class names                        | `string` |
| `mergeTailwindClasses(...classes)`                          | Merge Tailwind classes (remove duplicates) | `string` |
| `responsive(base, sm?, md?, lg?, xl?)`                      | Create responsive classes                  | `string` |
| `variant<T>(variants, active)`                              | Get variant classes                        | `string` |
| `toggleClass(baseClass, condition, trueClass, falseClass?)` | Conditional classes                        | `string` |
| `sizeClass(size, type?)`                                    | Get size utility classes                   | `string` |

**Example:**

```typescript
import { classNames, cn, variant } from '@/helpers';
import { THEME_CONSTANTS } from '@/constants';

function Button({ variant, isActive, isDisabled, className }) {
  const { themed } = THEME_CONSTANTS;

  return (
    <button
      className={classNames(
        'px-4 py-2 rounded',
        variant({
          primary: 'bg-blue-500 text-white',
          secondary: themed.bgSecondary,
          danger: 'bg-red-500 text-white'
        }, variant),
        {
          'opacity-50 cursor-not-allowed': isDisabled,
          'ring-2 ring-blue-300': isActive
        },
        className
      )}
    >
      Click me
    </button>
  );
}
```

### Color Helper

| Function                                  | Purpose                    | Returns                                       |
| ----------------------------------------- | -------------------------- | --------------------------------------------- |
| `hexToRgb(hex)`                           | Convert hex to RGB         | `{ r: number, g: number, b: number } \| null` |
| `rgbToHex(r, g, b)`                       | Convert RGB to hex         | `string`                                      |
| `lightenColor(hex, percent)`              | Lighten color              | `string`                                      |
| `darkenColor(hex, percent)`               | Darken color               | `string`                                      |
| `randomColor()`                           | Generate random hex color  | `string`                                      |
| `getContrastColor(hex)`                   | Get contrasting text color | `'#000000' \| '#ffffff'`                      |
| `generateGradient(color1, color2, steps)` | Generate gradient steps    | `string[]`                                    |

**Example:**

```typescript
import { lightenColor, getContrastColor, generateGradient } from "@/helpers";

// Lighten brand color for hover state
const brandColor = "#3b82f6";
const hoverColor = lightenColor(brandColor, 10); // "#5a9af8"

// Get readable text color
const textColor = getContrastColor(brandColor); // "#ffffff"

// Generate gradient steps
const gradient = generateGradient("#3b82f6", "#8b5cf6", 5);
// ['#3b82f6', '#5281f6', '#6980f6', '#807ff6', '#8b5cf6']
```

### Animation Helper

| Function                                   | Purpose                    | Returns         |
| ------------------------------------------ | -------------------------- | --------------- |
| `animate(element, keyframes, options)`     | Web Animations API wrapper | `Animation`     |
| `stagger(elements, animation, delay)`      | Stagger animations         | `void`          |
| `fadeIn(element, duration?)`               | Fade in animation          | `Promise<void>` |
| `fadeOut(element, duration?)`              | Fade out animation         | `Promise<void>` |
| `slideIn(element, direction?, duration?)`  | Slide in animation         | `Promise<void>` |
| `slideOut(element, direction?, duration?)` | Slide out animation        | `Promise<void>` |

**Example:**

```typescript
import { fadeIn, stagger } from "@/helpers";

// Fade in a modal
const modal = document.querySelector(".modal");
await fadeIn(modal, 300);

// Stagger animation for list items
const listItems = document.querySelectorAll(".list-item");
stagger(
  Array.from(listItems),
  (element) => fadeIn(element, 200),
  100, // 100ms delay between each
);
```

---

## Best Practices

### 1. Use Helpers for Business Logic

```typescript
// ✅ GOOD - Use helper with domain knowledge
import { hasRole, canAccessAdminPanel } from "@/helpers";

if (canAccessAdminPanel(user)) {
  // Show admin UI
}

// ❌ BAD - Inline business logic
if (user.role === "admin" || user.role === "moderator") {
  // Logic repeated everywhere
}
```

### 2. Combine with Utils for Complex Operations

```typescript
import { formatDate } from "@/utils";
import { sortByDate, groupBy } from "@/helpers";

// Sort orders by date
const sortedOrders = sortByDate(orders, "createdAt", "desc");

// Group by month (combining helper + util)
const ordersByMonth = groupBy(sortedOrders, (order) =>
  formatDate(order.createdAt, "YYYY-MM"),
);
```

### 3. Type Safety with Generics

```typescript
import { pick } from "@/helpers";
import type { User } from "@/types";

// Type-safe property selection
const publicUser = pick<User>(user, ["id", "name", "avatar"]);
// TypeScript knows the result type
```

### 4. Memoize Expensive Operations

```typescript
import { groupBy, sortBy } from '@/helpers';
import { useMemo } from 'react';

function ProductList({ products }) {
  const productsByCategory = useMemo(
    () => groupBy(products, 'category'),
    [products]
  );

  return (
    // render categorized products
  );
}
```

### 5. Compose Helpers for Complex Logic

```typescript
import { sortBy, groupBy, unique } from "@/helpers";

function processOrders(orders) {
  // Chain helpers for complex transformations
  return Object.entries(groupBy(orders, "status")).map(([status, orders]) => ({
    status,
    orders: sortBy(orders, "createdAt", "desc"),
    total: orders.length,
    customers: unique(orders.map((o) => o.customerId)),
  }));
}
```

---

## Helpers vs Utils

### Use **Utils** when:

- ✅ Function is pure (no side effects)
- ✅ Function is generic (works for any data type)
- ✅ Function has no domain knowledge
- ✅ Function is framework-agnostic

**Example**: `formatDate()`, `isValidEmail()`, `truncate()`

### Use **Helpers** when:

- ✅ Function has business logic
- ✅ Function has domain knowledge (users, orders, products)
- ✅ Function may have side effects
- ✅ Function composes multiple operations

**Example**: `hasRole()`, `groupBy()`, `calculatePagination()`

---

## Testing

All helpers have corresponding test files. Run tests with:

```bash
npm test src/helpers
```

---

## Adding New Helpers

When creating a new helper:

1. **Choose the right category**: auth, data, or ui
2. **Create the file**: `src/helpers/category/feature.helper.ts`
3. **Add comprehensive JSDoc**: Document parameters, returns, examples
4. **Export from barrel**: Add to category `index.ts` and main `src/helpers/index.ts`
5. **Write tests**: Create `__tests__/feature.helper.test.ts`
6. **Update this README**: Document the new helper
7. **Update GUIDE.md**: Add to the helpers reference section

---

## Related Documentation

- [GUIDE.md](../../docs/GUIDE.md) - Complete codebase reference
- [Utils](../utils/README.md) - Pure utility functions
- [Hooks](../hooks/README.md) - React hooks
- [Coding Standards](../../.github/copilot-instructions.md) - Helper best practices

---

**Last Updated**: February 8, 2026
