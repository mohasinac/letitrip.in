# UI Schema Constants - Implementation Best Practices

> **Complete guide for implementing and maintaining the UI schema constants standard**

---

## Overview

The UI Schema Constants Pattern establishes a three-layer architecture for safely using Firestore schema field constants throughout the UI layer:

1. **Data Access** (Repositories) - Use constants in queries → **TYPE SAFE**
2. **Data Transformation** (Hooks, Contexts, API Routes) - Transform raw data to UI types → **CLEAN**
3. **UI Components** - Render clean props, no field name knowledge → **SIMPLE**

---

## Quick Reference

### Layer 1: Repositories (Data Access)

**Goal**: Safe, type-checked access to Firestore with schema constants

**Location**: `src/repositories/`

**Pattern**:

```typescript
import { USER_FIELDS, PRODUCT_FIELDS } from "@/db/schema";

// ✅ DO: Use schema constants in queries
async findByEmail(email: string) {
  return this.findOneBy(USER_FIELDS.EMAIL, email);
}

// ✅ DO: Use nested field constants
async updateLastSignIn(uid: string) {
  await this.update(uid, {
    [USER_FIELDS.META.LAST_SIGN_IN_TIME]: new Date(),
  });
}

// ❌ DONT: Hardcode field names
async findByEmail(email: string) {
  return this.findOneBy("email", email); // WRONG
}
```

**Benefits**:

- Single source of truth for field names
- Refactorings are traceable
- Typo prevention in queries
- IDE autocomplete support

---

### Layer 2: Data Transformation (Hooks, Contexts, API Routes)

**Goal**: Transform Firestore documents into UI-friendly types

**Location**: `src/contexts/`, `src/hooks/useApi`, `src/app/api/`

**Pattern**:

```typescript
// ✅ DO: Use adapter functions for predictable transformation
export async function GET(request: NextRequest) {
  const user = await userRepository.findById(uid);
  return NextResponse.json({
    success: true,
    data: adaptUserToUI(user), // Returns clean, UI-friendly object
  });
}

// ✅ DO: Transform in context/hook
export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        const profile = await fetch(API_ENDPOINTS.USER.PROFILE).then((r) =>
          r.json(),
        );
        setUser(adaptUserToUI(profile.data));
      }
    });
    return unsubscribe;
  }, []);
}

// ❌ DONT: Expose Firestore structure in API responses
export async function GET(request: NextRequest) {
  const user = await userRepository.findById(uid);
  return NextResponse.json({
    displayName: user.displayName,
    "publicProfile.isPublic": user.publicProfile?.isPublic, // Raw structure
  });
}
```

**Available Adapters**:

- `adaptUserToUI()` - Raw UserDocument → Clean SessionUser object
- `adaptProductToUI()` - ProductDocument → UI Product object
- `adaptOrderToUI()` - OrderDocument → UI Order object

(See [`src/lib/adapters/schema.adapter.ts`](../../src/lib/adapters/schema.adapter.ts))

**Benefits**:

- Predictable, typed output
- Nested data is flattened
- Sensible defaults provided
- Easy to extend transformations

---

### Layer 3: UI Components (Presentation)

**Goal**: Render clean data without field name knowledge

**Location**: `src/components/`

**Pattern**:

```tsx
// ✅ DO: Accept clean, typed props
interface UserProfileProps {
  user: {
    displayName: string;
    email: string;
    role: UserRole;
    stats: {
      totalOrders: number;
      rating: number;
    };
  };
}

export function UserProfile({ user }: UserProfileProps) {
  return (
    <div>
      <h2>{user.displayName}</h2>
      <p>Orders: {user.stats.totalOrders}</p>
    </div>
  );
}

// ❌ DONT: Accept raw Firestore documents
interface UserProfileProps {
  user: any; // Could have any field
}

export function UserProfile({ user }: UserProfileProps) {
  // Dangerous: Don't know what fields exist
  return <h2>{user.displayName}</h2>;
}

// ❌ DONT: Know about Firestore structure
export function UserProfile({ user }: UserProfileProps) {
  const bio = user?.publicProfile?.bio; // Implementation detail
  const orders = user?.stats?.totalOrders; // Internal structure
}
```

**Benefits**:

- Components are fully decoupled from database
- Props are self-documenting
- Easy to reuse with different data sources
- Testing is simpler (mock props instead of documents)

---

## Implementation Workflow

### Step 1: Define Schema Constants

**File**: `src/db/schema/field-names.ts`

```typescript
export const USER_FIELDS = {
  EMAIL: "email",
  ROLE: "role",
  DISPLAY_NAME: "displayName",

  // Nested
  PROFILE: {
    IS_PUBLIC: "publicProfile.isPublic",
    BIO: "publicProfile.bio",
  },

  STAT: {
    TOTAL_ORDERS: "stats.totalOrders",
  },
} as const;
```

✅ **Done once per schema**

### Step 2: Update Repositories

**File**: `src/repositories/*.repository.ts`

```typescript
import { USER_FIELDS } from "@/db/schema";

// Replace hardcoded strings with constants
async findByEmail(email: string) {
  return this.findOneBy(USER_FIELDS.EMAIL, email); // NOT "email"
}
```

✅ **Update all query methods**

### Step 3: Create Adapter Functions

**File**: `src/lib/adapters/schema.adapter.ts`

```typescript
export function adaptUserToUI(user: UserDocument) {
  return {
    displayName: user.displayName || "Unknown",
    email: user.email,
    role: user.role,
    stats: {
      totalOrders: user.stats?.totalOrders || 0,
    },
  };
}
```

✅ **Create once per major entity**

### Step 4: Use in API Routes

**File**: `src/app/api/user/profile/route.ts`

```typescript
export async function GET(request: NextRequest) {
  const user = await userRepository.findById(uid);
  return NextResponse.json({
    success: true,
    data: adaptUserToUI(user), // Clean transformation
  });
}
```

✅ **Use adapters in all API responses**

### Step 5: Consume in Contexts/Hooks

**File**: `src/contexts/SessionContext.tsx`

```typescript
const data = await fetch(API_ENDPOINTS.USER.PROFILE);
const { data: user } = await data.json();
setUser(user); // Already transformed by adapter
```

✅ **Trust the adapter output**

### Step 6: Use in Components

**File**: `src/components/UserProfile.tsx`

```tsx
interface UserProfileProps {
  user: {
    displayName: string;
    stats: { totalOrders: number };
  };
}

export function UserProfile({ user }: UserProfileProps) {
  return (
    <div>
      {user.displayName} - {user.stats.totalOrders} orders
    </div>
  );
}
```

✅ **Components are simple and testable**

---

## Common Patterns

### Pattern 1: Query with Filters

```typescript
// ❌ BEFORE: Hardcoded strings
const snapshot = await db
  .collection("users")
  .where("role", "==", "admin")
  .where("disabled", "==", false)
  .get();

// ✅ AFTER: Schema constants
const snapshot = await db
  .collection(USER_COLLECTION)
  .where(USER_FIELDS.ROLE, "==", "admin")
  .where(USER_FIELDS.DISABLED, "==", false)
  .get();
```

### Pattern 2: Nested Field Updates

```typescript
// ❌ BEFORE: Hardcoded nested paths
await db.collection("users").doc(uid).update({
  "publicProfile.isPublic": true,
  "metadata.lastSignInTime": new Date(),
});

// ✅ AFTER: Schema constants with nested fields
await db
  .collection(USER_COLLECTION)
  .doc(uid)
  .update({
    [USER_FIELDS.PROFILE.IS_PUBLIC]: true,
    [USER_FIELDS.META.LAST_SIGN_IN_TIME]: new Date(),
  });
```

### Pattern 3: Conditional Rendering in Components

```tsx
// ❌ AVOID: Complex Firestore logic in components
export function UserInfo({ userData }: { userData: any }) {
  if (userData?.publicProfile?.isPublic) {
    return <div>{userData?.displayName}</div>;
  }
}

// ✅ PREFER: Pre-processed data in props
interface UserInfoProps {
  user: {
    displayName: string;
    isProfilePublic: boolean;
  };
}

export function UserInfo({ user }: UserInfoProps) {
  if (user.isProfilePublic) {
    return <div>{user.displayName}</div>;
  }
}
```

### Pattern 4: Fallback Values

```typescript
// ✅ Adapter provides sensible defaults
export function adaptUserToUI(user: UserDocument) {
  return {
    displayName: user.displayName || "Unknown User", // Default
    role: user.role || "user", // Default
    stats: {
      totalOrders: user.stats?.totalOrders || 0, // Default to 0
    },
  };
}

// Components trust the defaults
export function UserCard({ user }: { user: AdaptedUser }) {
  // displayName is always defined (never undefined)
  return <div>{user.displayName}</div>;
}
```

---

## Validation Checklist

### When Updating a Repository

- [ ] Import field constants from `@/db/schema`
- [ ] Replace all hardcoded field names with constants
- [ ] Works with nested fields using `FIELD.NESTED.PATH` syntax
- [ ] Type checking passes (`npx tsc --noEmit`)
- [ ] Tests pass (`npm test`)

### When Creating an API Route

- [ ] Uses repositories for data access
- [ ] Imports and uses adapter functions
- [ ] Transforms raw Firestore docs to UI types
- [ ] Never exposes internal Firestore structure
- [ ] Response has `{ success: boolean, data: ... }`

### When Building a Component

- [ ] Props are simple, flat objects
- [ ] No knowledge of Firestore field names
- [ ] All required fields are always defined (no optional chains)
- [ ] Props interface is self-documenting
- [ ] Component can be tested with mock props

### For New Schemas

- [ ] Field constants defined in `src/db/schema/field-names.ts`
- [ ] Export from `src/db/schema/index.ts`
- [ ] Adapter function in `src/lib/adapters/schema.adapter.ts`
- [ ] Repository uses field constants in all queries
- [ ] API routes use adapter for responses

---

## Troubleshooting

### Issue: Component receives undefined nested properties

```tsx
// ❌ PROBLEM
<div>{user.profile.bio}</div>; // Error: Cannot read property 'bio' of undefined

// ✅ SOLUTION: Use adapter with defaults
export function adaptUserToUI(user: UserDocument) {
  return {
    profile: {
      bio: user.publicProfile?.bio || "", // Always defined
    },
  };
}
```

### Issue: Hardcoded strings in repository methods

```typescript
// ❌ FOUND in code review
async findByRole(role: string) {
  return this.findBy("role", role); // String instead of constant
}

// ✅ FIX
async findByRole(role: string) {
  return this.findBy(USER_FIELDS.ROLE, role);
}
```

### Issue: Firestore field names leak into components

```tsx
// ❌ ANTI-PATTERN
export function UserCard({ user }: { user: any }) {
  <div>{user["public Profile"]["isPublic"]}</div>; // Hardcoded paths
}

// ✅ SOLUTION: Flatten in adapter
interface UserCardProps {
  user: { isProfilePublic: boolean };
}
export function UserCard({ user }: UserCardProps) {
  <div>{user.isProfilePublic}</div>; // Clean and simple
}
```

---

## Maintenance

### When a Field Name Changes

**Old**: `publicProfile.bio`  
**New**: `profile.bio`

**Update Steps**:

1. Update `src/db/schema/field-names.ts`:

```typescript
PROFILE: {
  BIO: "profile.bio", // Changed from "publicProfile.bio"
}
```

2. Update adapter in `src/lib/adapters/schema.adapter.ts`:

```typescript
profile: {
  bio: user.profile?.bio || "", // Still works, changed source
}
```

3. **No changes needed** in repositories (they use constants)
4. **No changes needed** in components (they use adapted props)

✅ **Single change propagates everywhere!**

---

## References

- [Schema Standards in GUIDE.md](../../docs/GUIDE.md#schema-standards)
- [Repository Pattern](../../docs/GUIDE.md#8-repository-pattern)
- [Copilot Instruction - RULE 8](../../.github/copilot-instructions.md#rule-8-use-repository-pattern-for-db-access)
- [Copilot Instruction - RULE 13](../../.github/copilot-instructions.md#rule-13-collection-names-from-constants)
- [Field Names Constants](../../src/db/schema/field-names.ts)
- [Schema Adapters](../../src/lib/adapters/schema.adapter.ts)
