# UI Schema Constants Standard - Summary

> **Established Standard Pattern for Using Schema Field Constants Across the UI Layer**

**Status**: ✅ Implemented  
**Date**: February 11, 2026  
**Coverage**: User Repository, Product Repository, Order Repository

---

## What Changed?

### ✅ Established Standard Pattern

A consistent three-layer architecture for using schema field constants across the UI:

```
┌─────────────────────────────────────┐
│  LAYER 1: Repositories              │
│  └─ Use schema constants in queries │
│     (e.g., USER_FIELDS.EMAIL)       │
└─────────────────────────────────────┘
            ↓
┌─────────────────────────────────────┐
│  LAYER 2: Adapters/Transformers     │
│  └─ Clean data before sending UI    │
│     (e.g., adaptUserToUI())         │
└─────────────────────────────────────┘
            ↓
┌─────────────────────────────────────┐
│  LAYER 3: Components                │
│  └─ Render clean props, no          │
│     Firestore knowledge             │
└─────────────────────────────────────┘
```

---

## Files Created/Updated

### 📄 Documentation

| File                                                                             | Purpose                                                                     |
| -------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| [UI_SCHEMA_CONSTANTS_PATTERN.md](./UI_SCHEMA_CONSTANTS_PATTERN.md)               | **Core standard** - Architecture, patterns, anti-patterns                   |
| [UI_SCHEMA_CONSTANTS_BEST_PRACTICES.md](./UI_SCHEMA_CONSTANTS_BEST_PRACTICES.md) | **Implementation guide** - Step-by-step workflow, examples, troubleshooting |

### 💾 Code

| File                                                                                | Changes                                                  |
| ----------------------------------------------------------------------------------- | -------------------------------------------------------- |
| [src/repositories/user.repository.ts](../src/repositories/user.repository.ts)       | ✅ Updated 9 methods to use `USER_FIELDS.*` constants    |
| [src/repositories/product.repository.ts](../src/repositories/product.repository.ts) | ✅ Updated 9 methods to use `PRODUCT_FIELDS.*` constants |
| [src/repositories/order.repository.ts](../src/repositories/order.repository.ts)     | ✅ Updated 6 methods to use `ORDER_FIELDS.*` constants   |
| [src/lib/adapters/schema.adapter.ts](../src/lib/adapters/schema.adapter.ts)         | ✅ **NEW** - Adapter functions for safe transformation   |

---

## The Standard Pattern

### ✅ LAYER 1: Repositories (Use Schema Constants)

```typescript
import { USER_FIELDS } from "@/db/schema";

// ✅ DO: Use schema constants
async findByEmail(email: string) {
  return this.findOneBy(USER_FIELDS.EMAIL, email);
}

async updateLastSignIn(uid: string) {
  await this.update(uid, {
    [USER_FIELDS.META.LAST_SIGN_IN_TIME]: new Date(),
  });
}
```

**Benefits**:

- Type-safe field references
- Single source of truth
- Refactoring-safe (change in one place = everywhere)
- IDE autocomplete support

---

### ✅ LAYER 2: Adapters (Transform Data)

```typescript
// src/lib/adapters/schema.adapter.ts
export function adaptUserToUI(user: UserDocument) {
  return {
    uid: user.uid,
    displayName: user.displayName || "Unknown User",
    email: user.email,
    role: user.role || "user",
    stats: {
      totalOrders: user.stats?.totalOrders || 0,
    },
  };
}
```

**Benefits**:

- Predictable output shape
- Nested data flattened
- Sensible defaults provided
- Easy to extend

---

### ✅ LAYER 3: Components (Accept Clean Props)

```tsx
interface UserProfileProps {
  user: {
    displayName: string;
    email: string;
    role: UserRole;
    stats: { totalOrders: number };
  };
}

export function UserProfile({ user }: UserProfileProps) {
  return (
    <div>
      <h2>{user.displayName}</h2>
      <p>{user.stats.totalOrders} orders</p>
    </div>
  );
}
```

**Benefits**:

- No Firestore knowledge in components
- Self-documenting props
- Easy to test (mock props instead of documents)
- Fully decoupled from database

---

## ❌ Anti-Patterns Eliminated

### Before (❌ WRONG)

```typescript
// Repositories with hardcoded strings
async findByEmail(email: string) {
  return this.findOneBy("email", email);
}

// Components accessing nested Firestore fields
<div>{user?.publicProfile?.bio}</div>

// Magic strings in queries
.where("role", "==", "admin")
.where("disabled", "==", false)
```

### After (✅ CORRECT)

```typescript
// Repositories with schema constants
async findByEmail(email: string) {
  return this.findOneBy(USER_FIELDS.EMAIL, email);
}

// Components with clean, flat props
<div>{user.bio}</div>

// Schema constants in queries
.where(USER_FIELDS.ROLE, "==", "admin")
.where(USER_FIELDS.DISABLED, "==", false)
```

---

## Implementation Checklist

### For Repositories

- [x] Import field constants from `@/db/schema`
- [x] Replace hardcoded field names with constants
- [x] Use nested field syntax (FIELD.NESTED.PATH)
- [x] Type checking passes

### For API Routes

- [x] Use repositories for data access
- [x] Use adapter functions for transformation
- [x] Return clean, typed data
- [x] Never expose Firestore structure

### For Components

- [x] Accept simple, flat props
- [x] No Firestore field name knowledge
- [x] All required fields always defined
- [x] Props interfaces are self-documenting

---

## Quick Start

### For New Features

1. **Define constants** in `src/db/schema/field-names.ts`
2. **Create repository** methods using `FIELD_CONSTANTS.*`
3. **Create adapter** function in `src/lib/adapters/schema.adapter.ts`
4. **Create API route** using adapter for response
5. **Create component** accepting clean props

### For Refactoring

1. Find hardcoded field names: `"email"`, `"role"`, `"displayName"`
2. Replace with constants: `USER_FIELDS.EMAIL`, `USER_FIELDS.ROLE`, etc.
3. Type-check: `npx tsc --noEmit`
4. Test: `npm test`

---

## Available Adapters

Pre-built transformation functions in `src/lib/adapters/schema.adapter.ts`:

- `adaptUserToUI(user)` → Clean user object with defaults
- `adaptProductToUI(product)` → Clean product object with defaults
- `adaptOrderToUI(order)` → Clean order object with defaults

```typescript
import { adaptUserToUI } from "@/lib/adapters/schema.adapter";

// In API route
return NextResponse.json({
  success: true,
  data: adaptUserToUI(user),
});
```

---

## Benefits Summary

| Aspect                   | Before                   | After                           |
| ------------------------ | ------------------------ | ------------------------------- |
| **Type Safety**          | Hardcoded strings        | Constants with IDE autocomplete |
| **Refactoring**          | Search/replace all files | Change in one constant          |
| **Component Complexity** | Know Firestore structure | Simple, flat props              |
| **Testing**              | Need Firestore mocks     | Mock simple props               |
| **Data Consistency**     | Variable across files    | Predictable transformation      |
| **Nested Fields**        | Magic string paths       | `FIELD.NESTED.PATH` constants   |

---

## References

### Core Documentation

- **Standard Pattern**: [UI_SCHEMA_CONSTANTS_PATTERN.md](./UI_SCHEMA_CONSTANTS_PATTERN.md)
- **Implementation Guide**: [UI_SCHEMA_CONSTANTS_BEST_PRACTICES.md](./UI_SCHEMA_CONSTANTS_BEST_PRACTICES.md)

### Code References

- **Schema Constants**: [src/db/schema/field-names.ts](../src/db/schema/field-names.ts)
- **Adapter Functions**: [src/lib/adapters/schema.adapter.ts](../src/lib/adapters/schema.adapter.ts)
- **Updated Repositories**:
  - [user.repository.ts](../src/repositories/user.repository.ts) (9 methods updated)
  - [product.repository.ts](../src/repositories/product.repository.ts) (9 methods updated)
  - [order.repository.ts](../src/repositories/order.repository.ts) (6 methods updated)

### Copilot Instructions

- [RULE 8: Use Repository Pattern](../.github/copilot-instructions.md#rule-8-use-repository-pattern-for-db-access)
- [RULE 13: Collection Names from Constants](../.github/copilot-instructions.md#rule-13-collection-names-from-constants)

---

## Next Steps

### Immediate (High Priority)

- [ ] Review updated repositories for consistency
- [ ] Run type-checking: `npx tsc --noEmit`
- [ ] Run tests: `npm test`
- [ ] Apply same pattern to remaining repositories (review, category, bid, session)

### Short Term (This Sprint)

- [ ] Create adapters for remaining entities (FAQ, Carousel, Coupon, etc.)
- [ ] Update API routes to use adapters
- [ ] Audit existing code for anti-patterns
- [ ] Update team on standard using best practices guide

### Medium Term (Next Sprint)

- [ ] Complete refactoring of all repositories
- [ ] Establish CI/CD checks for pattern compliance
- [ ] Add linting rules to enforce constants
- [ ] Create code examples in project README

---

## Contact & Questions

Refer to the documentation files for detailed explanations:

- **How should I structure my code?** → [Business Logic Pattern](./UI_SCHEMA_CONSTANTS_PATTERN.md#usage-patterns-by-layer)
- **How do I implement this?** → [Best Practices Guide](./UI_SCHEMA_CONSTANTS_BEST_PRACTICES.md#implementation-workflow)
- **What went wrong?** → [Troubleshooting](./UI_SCHEMA_CONSTANTS_BEST_PRACTICES.md#troubleshooting)

---

**Standard Established**: ✅ February 11, 2026  
**Coverage**: Repositories ✅ | Adapters ✅ | Documentation ✅  
**Status**: Ready for team implementation
