---
applyTo: "src/**"
description: "Singleton classes, RBAC, Firestore collection names, schema field constants, ROUTES, API_ENDPOINTS. Rules 15, 16, 17, 18, 19."
---

# Constants, RBAC & Schema Rules

## RULE 15: Singleton Classes

| Need                        | Use              | Import                |
| --------------------------- | ---------------- | --------------------- |
| In-memory cache             | `cacheManager`   | `@/classes`           |
| localStorage/sessionStorage | `storageManager` | `@/classes`           |
| Client logging              | `logger`         | `@/classes`           |
| **Server logging**          | `serverLogger`   | `@/lib/server-logger` |
| Inter-component events      | `eventBus`       | `@/classes`           |
| Task queueing               | `new Queue()`    | `@/classes`           |

NEVER write custom localStorage wrappers, event emitters, or caching logic.  
`console.log()` is FORBIDDEN in production code — use `logger` (client) or `serverLogger` (server/API routes).

## RULE 16: RBAC

Route protection is centralized in `src/constants/rbac.ts` via `RBAC_CONFIG`.  
Role hierarchy: `admin` > `moderator` > `seller` > `user`.  
Component protection: `<ProtectedRoute requiredRole="admin">` from `@/components`.  
Programmatic: `hasRole(user, role)` / `hasAnyRole(user, roles)` from `@/helpers`.

## RULE 17: Firestore Collection Names from Constants

NEVER hardcode collection names.

```typescript
// ❌  db.collection('users')
// ✅
import { USER_COLLECTION } from "@/db/schema";
db.collection(USER_COLLECTION);
```

Available: `USER_COLLECTION` · `PRODUCT_COLLECTION` · `ORDER_COLLECTION` · `REVIEW_COLLECTION` · `BID_COLLECTION` · `SESSION_COLLECTION` · `EMAIL_VERIFICATION_COLLECTION` · `PASSWORD_RESET_COLLECTION` · `CAROUSEL_SLIDES_COLLECTION` · `HOMEPAGE_SECTIONS_COLLECTION` · `CATEGORIES_COLLECTION` · `COUPONS_COLLECTION` · `FAQS_COLLECTION` · `SITE_SETTINGS_COLLECTION`

## RULE 17: Schema Field Constants

NEVER hardcode Firestore field names in queries or update operations.

```typescript
// ❌  .update({ 'metadata.lastSignInTime': new Date() })
// ✅
import { USER_FIELDS, SCHEMA_DEFAULTS } from '@/db/schema';
.update({ [USER_FIELDS.META.LAST_SIGN_IN_TIME]: new Date() })
```

Available field objects: `USER_FIELDS` · `TOKEN_FIELDS` · `PRODUCT_FIELDS` · `ORDER_FIELDS` · `REVIEW_FIELDS` · `BID_FIELDS` · `SESSION_FIELDS` · `CAROUSEL_FIELDS` · `CATEGORY_FIELDS` · `COUPON_FIELDS` · `FAQ_FIELDS` · `HOMEPAGE_SECTION_FIELDS` · `SITE_SETTINGS_FIELDS` · `COMMON_FIELDS` · `SCHEMA_DEFAULTS`

## RULE 18: Routes from Constants

```typescript
// ❌  router.push('/auth/login')
// ✅
import { ROUTES } from '@/constants';
router.push(ROUTES.AUTH.LOGIN);
<TextLink href={ROUTES.USER.PROFILE}>Profile</TextLink>
```

## RULE 19: API Endpoints from Constants

```typescript
// ❌  fetch('/api/auth/login')
// ✅
import { API_ENDPOINTS } from "@/constants";
productService.getById = (id) =>
  apiClient.get(API_ENDPOINTS.PRODUCTS.GET_BY_ID(id));
```

## Other Constants to Know

### Navigation Tabs

```typescript
import { ADMIN_TAB_ITEMS, USER_TAB_ITEMS } from '@/constants';
<SectionTabs tabs={ADMIN_TAB_ITEMS} variant="admin" />
<SectionTabs tabs={USER_TAB_ITEMS} variant="user" />
```

### Address/State Constants

```typescript
import { ADDRESS_TYPES, INDIAN_STATES } from "@/constants";
// ADDRESS_TYPES = [{ value: 'home' | 'work' | 'other', label }]
// INDIAN_STATES = string[] of 36 states/UTs
```
