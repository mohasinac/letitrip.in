# Architecture Confirmation

**Date:** November 7, 2025  
**Status:** ✅ Confirmed Correct

---

## 🎯 Correct Architecture

### Three-Layer Pattern

```
┌─────────────────────────────────────────────────────────────┐
│                     Browser (Client-Side)                    │
├─────────────────────────────────────────────────────────────┤
│  UI Components                                               │
│  - MyShopsPage.tsx                                           │
│  - Uses: shopsService.list()                                 │
│  - NO database imports                                       │
│  - NO Firebase imports                                       │
├─────────────────────────────────────────────────────────────┤
│  Services (Client-Side API Wrappers)                         │
│  - shops.service.ts                                          │
│  - Uses: apiService.get('/api/shops')                        │
│  - NO database imports                                       │
│  - NO Firebase imports                                       │
│  - Follows auth.service.ts pattern                           │
└─────────────────────────────────────────────────────────────┘
                              ↓ HTTP Request
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                     Server (Backend)                         │
├─────────────────────────────────────────────────────────────┤
│  API Routes                                                  │
│  - /api/shops/route.ts                                       │
│  - Uses: db.collection('shops')                              │
│  - Uses: getServerSession()                                  │
│  - Imports Firebase/Database clients                         │
│  - Handles ALL database operations                           │
│  - Role-based access control                                 │
└─────────────────────────────────────────────────────────────┘
                              ↓
                        Firebase/Database
```

---

## ✅ What's Correct

### 1. Client-Side Services (Browser)

**Location:** `src/services/shops.service.ts`

```typescript
// ✅ CORRECT - Client-side service
import { apiService } from "./api.service"; // ✅ HTTP client only

class ShopsService {
  async list(filters?: ShopFilters): Promise<ShopsListResponse> {
    // ✅ Makes HTTP call to API route
    return apiService.get<ShopsListResponse>("/shops", filters);
  }
}

export const shopsService = new ShopsService();
```

**Characteristics:**

- ✅ Runs in browser
- ✅ Uses `apiService` for HTTP calls
- ✅ NO database imports
- ✅ NO Firebase imports
- ✅ NO `getServerSession` imports
- ✅ Follows `auth.service.ts` pattern exactly

### 2. API Routes (Server)

**Location:** `src/app/api/shops/route.ts`

```typescript
// ✅ CORRECT - Server-side API route
import { getServerSession } from "next-auth"; // ✅ Server-side auth
import { db } from "@/lib/db/client"; // ✅ Database access
import { COLLECTIONS } from "@/constants/database"; // ✅ DB constants

export async function GET(request: NextRequest) {
  // ✅ Server-side authentication
  const session = await getServerSession(authOptions);
  const role = session?.user?.role || "guest";

  // ✅ Database operations happen HERE
  let query = db.collection(COLLECTIONS.SHOPS);

  if (role === "seller") {
    query = query.where("ownerId", "==", session.user.id);
  }

  const snapshot = await query.get();
  const shops = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

  return NextResponse.json({ success: true, shops });
}
```

**Characteristics:**

- ✅ Runs on server
- ✅ Imports database clients (Firebase/Prisma/etc.)
- ✅ Uses `getServerSession` for auth
- ✅ Handles ALL database operations
- ✅ Role-based filtering
- ✅ Returns JSON responses

### 3. UI Components (Browser)

**Location:** `src/app/seller/my-shops/page.tsx`

```typescript
// ✅ CORRECT - UI component
"use client";
import { shopsService } from "@/services/shops.service"; // ✅ Uses service

export default function MyShopsPage() {
  const [shops, setShops] = useState<Shop[]>([]);

  useEffect(() => {
    fetchShops();
  }, []);

  const fetchShops = async () => {
    // ✅ Calls service (not fetch directly)
    const response = await shopsService.list();
    setShops(response.shops);
  };

  return <div>{/* Render shops */}</div>;
}
```

**Characteristics:**

- ✅ Runs in browser
- ✅ Uses services (not direct `fetch()`)
- ✅ NO database imports
- ✅ NO Firebase imports
- ✅ Clean, focused on UI logic

---

## ❌ What's Wrong

### ❌ WRONG: Database imports in services

```typescript
// ❌ WRONG - DO NOT DO THIS
import { db } from "@/lib/db/client"; // ❌ NO DATABASE IN SERVICES
import { COLLECTIONS } from "@/constants/database"; // ❌ NO

class ShopsService {
  async list() {
    // ❌ Services should NOT access database directly
    const snapshot = await db.collection(COLLECTIONS.SHOPS).get();
    return snapshot.docs.map((doc) => doc.data());
  }
}
```

**Why it's wrong:**

- Services run in browser - can't access database
- Firebase/database clients are server-side only
- Violates separation of concerns
- Can't handle authentication/authorization properly

### ❌ WRONG: Direct fetch() in UI components

```typescript
// ❌ WRONG - DO NOT DO THIS
export default function MyShopsPage() {
  const fetchShops = async () => {
    // ❌ Should use service instead
    const response = await fetch("/api/shops");
    const data = await response.json();
    setShops(data.shops);
  };
}
```

**Why it's wrong:**

- Harder to maintain
- No type safety
- Can't cache responses easily
- Inconsistent with auth pattern

---

## 🎓 Key Rules

1. **Firebase/Database ONLY in API routes** (server-side)
2. **Services are client-side** - use apiService for HTTP calls
3. **UI components use services** - not direct fetch()
4. **Follow auth.service.ts pattern** - it's the reference implementation
5. **Three layers:** UI → Service → API Route → Database

---

## 📖 Reference Files

- ✅ `/src/services/auth.service.ts` - THE reference pattern
- ✅ `/src/services/api.service.ts` - HTTP client used by all services
- ✅ `/CHECKLIST/SERVICE_LAYER_ARCHITECTURE.md` - Full guide (corrected)
- ✅ `/CHECKLIST/SERVICE_LAYER_QUICK_REF.md` - Quick reference (corrected)
- ✅ `/CHECKLIST/SERVICE_LAYER_CORRECTION.md` - What was fixed

---

## ✅ Verification Checklist

When creating a new service:

- [ ] ✅ Client-side class (runs in browser)
- [ ] ✅ Imports only `apiService` (no database)
- [ ] ✅ Uses `apiService.get/post/patch/delete`
- [ ] ✅ Exports singleton instance
- [ ] ✅ TypeScript interfaces defined
- [ ] ❌ NO `import { db }` statements
- [ ] ❌ NO `import { COLLECTIONS }` statements
- [ ] ❌ NO Firebase imports
- [ ] ❌ NO `getServerSession` imports
- [ ] ❌ NO database operations

When creating an API route:

- [ ] ✅ Server-side route handler
- [ ] ✅ Uses `getServerSession` for auth
- [ ] ✅ Imports database client (db)
- [ ] ✅ Handles database operations
- [ ] ✅ Role-based access control
- [ ] ✅ Returns JSON responses

---

**Confirmed:** All documentation now correctly describes the three-layer architecture with NO database access in client-side code.
