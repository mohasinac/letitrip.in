# UI Schema Constants Pattern

> **Standard Pattern for Using Schema Field Constants Across the UI Layer**

This document establishes a consistent approach to using schema field constants (`@/db/schema`) throughout the UI layer. It ensures type safety, prevents typos, and creates a single source of truth for field names.

---

## Architecture: Three Layers

### 1. **Data Access Layer (Repositories)**

- **Location**: `src/repositories/`
- **Purpose**: Query Firestore using schema field constants
- **Use**: `USER_FIELDS.*`, `PRODUCT_FIELDS.*`, etc.
- **Example**: Query builders, filters, updates

### 2. **Data Transformation Layer (Contexts, Hooks, API Routes)**

- **Location**: `src/contexts/`, `src/hooks/useApiQuery*`, `src/app/api/`
- **Purpose**: Transform raw Firestore data into UI-friendly types
- **Use**: Read from repository results, apply schema constants in complex queries
- **Output**: Clean, typed objects passed to UI

### 3. **UI Layer (Components)**

- **Location**: `src/components/`
- **Purpose**: Render data passed via props
- **Use**: Never hardcode field names; accept clean props
- **Pattern**: Receive transformed data, render it

---

## Usage Patterns by Layer

### 🔹 Repositories: Direct Schema Constant Usage

**✅ DO: Use schema constants in queries and filters**

```typescript
// src/repositories/user.repository.ts
import { UserDocument, USER_COLLECTION, USER_FIELDS } from "@/db/schema/users";

// Query using schema constants
async findByEmail(email: string): Promise<UserDocument | null> {
  return this.findOneBy(USER_FIELDS.EMAIL, email);
}

// Update using schema constants
async updateLastSignIn(uid: string): Promise<void> {
  await this.db
    .collection(this.collection)
    .doc(uid)
    .update({
      [USER_FIELDS.META.LAST_SIGN_IN_TIME]: new Date(),
    });
}

// Complex query with nested fields
async findNewSellers(since: Date): Promise<UserDocument[]> {
  let query = this.getCollection()
    .where(USER_FIELDS.ROLE, "==", "seller")
    .where(USER_FIELDS.CREATED_AT, ">=", since);

  const snapshot = await query.get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserDocument));
}
```

### 🔹 API Routes: Schema Constants in Complex Transformations

**✅ DO: Use schema constants when serializing/deserializing Firestore data**

```typescript
// src/app/api/user/profile/route.ts
import { USER_FIELDS } from "@/db/schema/users";

export async function GET(request: NextRequest) {
  try {
    const decodedToken = await verifySessionCookie(sessionCookie);
    const user = await userRepository.findById(decodedToken.uid);

    if (!user) {
      throw new AuthenticationError(ERROR_MESSAGES.DATABASE.NOT_FOUND);
    }

    // Use schema constants when accessing nested fields
    return NextResponse.json({
      success: true,
      data: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,

        // Accessing nested fields via schema constants
        profilePublic: user.publicProfile?.isPublic,
        totalOrders: user.stats?.totalOrders,
        lastSignInTime: user.metadata?.[USER_FIELDS.META.LAST_SIGN_IN_TIME],
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
```

### 🔹 Contexts & Hooks: Clean Data Transformation

**✅ DO: Transform repository data into UI-friendly types**

```typescript
// src/contexts/SessionContext.tsx
export interface SessionUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: UserRole;
  stats?: {
    totalOrders: number;
    reviewsCount: number;
  };
  publicProfile?: {
    isPublic: boolean;
    bio?: string;
  };
}

async function fetchUserProfile(authUser: User): Promise<SessionUser> {
  try {
    const response = await fetch(API_ENDPOINTS.USER.PROFILE);
    const { data } = await response.json();

    return {
      uid: authUser.uid,
      email: authUser.email,
      displayName: data.displayName || authUser.displayName,
      role: data.role || "user",
      stats: data.stats,
      publicProfile: data.publicProfile,
    };
  } catch (error) {
    // Fallback handling
  }
}
```

### 🔹 UI Components: Clean Props Only

**✅ DO: Accept clean, typed props**

```tsx
// src/components/user/profile/ProfileStatsGrid.tsx
export interface ProfileStats {
  orders: number;
  wishlist: number;
  addresses: number;
}

interface ProfileStatsGridProps {
  stats: ProfileStats;
  className?: string;
}

export function ProfileStatsGrid({
  stats,
  className = "",
}: ProfileStatsGridProps) {
  return (
    <div className={className}>
      <div>Orders: {stats.orders}</div>
      <div>Wishlist: {stats.wishlist}</div>
    </div>
  );
}
```

**✅ DO: Use components without knowing about Firestore field names**

```tsx
// src/app/user/dashboard/page.tsx
import { ProfileStatsGrid } from "@/components";

export default function DashboardPage() {
  const { user } = useSession();

  return (
    <ProfileStatsGrid
      stats={{
        orders: user?.stats?.totalOrders || 0,
        wishlist: 8,
        addresses: 3,
      }}
    />
  );
}
```

---

## ❌ Anti-Patterns to Avoid

### 1. **Hardcoding Field Names in Components**

```tsx
// ❌ WRONG - Hardcoded Firestore field names
export function UserCard({ user }: { user: any }) {
  return (
    <div>
      <h2>{user["displayName"]}</h2>
      <p>{user["publicProfile"]["bio"]}</p>
      <p>Orders: {user["stats"]["totalOrders"]}</p>
    </div>
  );
}
```

### 2. **Using String Literals in Queries**

```typescript
// ❌ WRONG - String literals instead of schema constants
async findByRole(role: string) {
  return this.findOneBy("role", role); // Should use USER_FIELDS.ROLE
}

async updateMetadata(uid: string) {
  await this.db.collection("users").doc(uid).update({
    "metadata.lastSignInTime": new Date(), // Should use USER_FIELDS.META.LAST_SIGN_IN_TIME
  });
}
```

### 3. **Complex Field Access in UI Layer**

```tsx
// ❌ WRONG - Complex Firestore logic in components
export function UserProfile({ userData }: { userData: any }) {
  // Shouldn't know about Firestore structure
  const lastSignIn = userData?.metadata?.lastSignInTime?.toDate?.();
  const isPublic = userData?.publicProfile?.isPublic;

  return (
    <div>
      {lastSignIn} - Public: {isPublic}
    </div>
  );
}
```

### 4. **Missing Schema Constants During Serialization**

```typescript
// ❌ WRONG - Mixing hardcoded strings with data transformation
const serializeUser = (user: UserDocument) => ({
  uid: user.uid,
  last_sign_in: user.metadata?.lastSignInTime, // Inconsistent naming
  "stats.orders": user.stats?.totalOrders, // Hardcoded nested path
});
```

---

## Checklist for UI Layer Code

When adding new UI features that use data:

- [ ] **Repositories**: Using schema field constants in queries (`USER_FIELDS.*`)
- [ ] **Queries**: Complex filters use schema constants, not strings
- [ ] **Transformations**: API routes gracefully handle nested Firestore data
- [ ] **Contexts/Hooks**: Return clean, typed objects (no raw Firestore references)
- [ ] **Components**: Receive fully transformed props, no field name knowledge
- [ ] **Props**: Interfaces are simple, flat, UI-focused
- [ ] **No Magic Strings**: Zero hardcoded field names in components
- [ ] **Type Safety**: All data flows have TypeScript types

---

## Common Scenarios

### ✅ Displaying User Statistics

**Correct Pattern:**

1. **Repository** (Query with constants):

```typescript
async findUserStats(uid: string) {
  const user = await this.getCollection()
    .doc(uid)
    .get();
  return { totalOrders: user.get(USER_FIELDS.STAT.TOTAL_ORDERS) };
}
```

2. **Context** (Transform):

```typescript
const stats = {
  totalOrders: user?.stats?.totalOrders || 0,
  reviews: user?.stats?.reviewsCount || 0,
};
```

3. **Component** (Render):

```tsx
<StatsGrid orders={stats.totalOrders} reviews={stats.reviews} />
```

---

### ✅ Filtering Admin Users

**Correct Pattern:**

1. **Repository** (Use schema constants):

```typescript
async findActiveAdmins() {
  return this.getCollection()
    .where(USER_FIELDS.ROLE, "==", "admin")
    .where(USER_FIELDS.DISABLED, "==", false)
    .get();
}
```

2. **API Route** (Serialize results):

```typescript
const admins = await userRepository.findActiveAdmins();
return NextResponse.json({ data: admins });
```

3. **Page/Hook** (Consume):

```tsx
const { data: admins } = useApiQuery(API_ENDPOINTS.ADMIN.USERS);
return <AdminTable users={admins} />;
```

4. **Component** (Render clean data):

```tsx
export function AdminTable({ users }: { users: AdminUser[] }) {
  return users.map((u) => <div key={u.uid}>{u.email}</div>);
}
```

---

## Implementation Guidelines

### When Adding New Features:

1. **Define Firestore schema in `src/db/schema/`** with field constants
2. **Create/update repository methods** using schema constants in queries
3. **Create API endpoints** that serialize data cleanly
4. **Create hooks/contexts** that transform API responses to UI types
5. **Create components** that receive simple, typed props
6. **Write tests** at each layer

### When Refactoring Existing Code:

1. Check repositories for hardcoded strings → Replace with schema constants
2. Check API routes for hardcoded field names → Replace with schema constants
3. Check components for Firestore knowledge → Remove, use props instead
4. Update types to be UI-focused, not schema-focused

---

## Schema Constants Available

| Collection    | Constants                                  | Import        |
| ------------- | ------------------------------------------ | ------------- |
| Users         | `USER_FIELDS`, `SCHEMA_DEFAULTS.USER_ROLE` | `@/db/schema` |
| Products      | `PRODUCT_FIELDS`                           | `@/db/schema` |
| Orders        | `ORDER_FIELDS`                             | `@/db/schema` |
| Reviews       | `REVIEW_FIELDS`                            | `@/db/schema` |
| Sessions      | `SESSION_FIELDS`                           | `@/db/schema` |
| Categories    | `CATEGORY_FIELDS`                          | `@/db/schema` |
| FAQs          | `FAQ_FIELDS`                               | `@/db/schema` |
| Carousels     | `CAROUSEL_FIELDS`                          | `@/db/schema` |
| Coupons       | `COUPON_FIELDS`                            | `@/db/schema` |
| Site Settings | `SITE_SETTINGS_FIELDS`                     | `@/db/schema` |

---

## Examples by Schema

### User Fields

```typescript
import { USER_FIELDS, SCHEMA_DEFAULTS } from "@/db/schema";

// Query
.where(USER_FIELDS.EMAIL, "==", email)
.where(USER_FIELDS.ROLE, "==", SCHEMA_DEFAULTS.USER_ROLE)

// Update
.update({
  [USER_FIELDS.META.LAST_SIGN_IN_TIME]: new Date(),
  [USER_FIELDS.PROFILE.IS_PUBLIC]: true,
})

// Access nested
user[USER_FIELDS.PROFILE.SOCIAL.TWITTER]
```

### Product Fields

```typescript
import { PRODUCT_FIELDS } from "@/db/schema";

// Query
.where(PRODUCT_FIELDS.STATUS, "==", PRODUCT_FIELDS.STATUS_VALUES.PUBLISHED)
.where(PRODUCT_FIELDS.SELLER_ID, "==", sellerId)

// Update
.update({
  [PRODUCT_FIELDS.PRICE]: newPrice,
  [PRODUCT_FIELDS.TITLE]: newTitle,
})
```

---

## Related Documentation

- [Schema Standards](./GUIDE.md#schema-standards)
- [Repository Pattern](./GUIDE.md#8-repository-pattern)
- [API Route Pattern](./GUIDE.md#9-api-route-pattern)
- [Copilot Instructions - RULE 8](../.github/copilot-instructions.md#rule-8-use-repository-pattern-for-db-access)
- [Copilot Instructions - RULE 13](../.github/copilot-instructions.md#rule-13-collection-names-from-constants)
