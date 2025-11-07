# Firebase Admin SDK - Quick Reference

**Last Updated:** December 2024  
**Purpose:** Quick reference for using Firebase Admin SDK in API routes  
**Location:** All Firebase Admin code is in `/src/app/api/lib/firebase/`

---

## ⚠️ IMPORTANT: Backend Organization

**All Firebase Admin SDK code must be in `/src/app/api/lib/`:**

- ✅ `/src/app/api/lib/firebase/admin.ts` - Firebase Admin initialization
- ✅ `/src/app/api/lib/firebase/collections.ts` - Collection references
- ✅ `/src/app/api/lib/firebase/queries.ts` - Query builders
- ✅ `/src/app/api/lib/firebase/transactions.ts` - Transaction helpers

**Never import Firebase Admin SDK in:**

- ❌ `/src/lib/` - Client-accessible utilities
- ❌ `/src/components/` - Client components
- ❌ `/src/app/[page]/` - Client pages (use API routes instead)

---

## 🚀 Quick Start

### 1. Environment Setup

Add to `.env.local`:

```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
```

### 2. Import in API Route (ONLY in `/src/app/api/` files)

```typescript
import { Collections } from "@/app/api/lib/firebase/collections";
import { getDocumentById } from "@/app/api/lib/firebase/collections";
import { getShopsQuery, userOwnsShop } from "@/app/api/lib/firebase/queries";
```

---

## 📖 Common Patterns

### Get All Documents (with role-based filtering)

```typescript
// Shops API: GET /api/shops
const query = getShopsQuery(userRole, userId);
const snapshot = await query.get();
const shops = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
```

### Get Single Document by ID

```typescript
// Shop API: GET /api/shops/[id]
const shop = await getDocumentById<any>("shops", shopId);
if (!shop) {
  return NextResponse.json({ error: "Not found" }, { status: 404 });
}
```

### Create Document

```typescript
// Shop API: POST /api/shops
const shopData = {
  name: body.name,
  slug: body.slug,
  owner_id: userId,
  created_at: new Date(),
  updated_at: new Date(),
};

const docRef = await Collections.shops().add(shopData);
const newShop = await getDocumentById("shops", docRef.id);
```

### Update Document

```typescript
// Shop API: PATCH /api/shops/[id]
const shopRef = Collections.shops().doc(shopId);
await shopRef.update({
  name: body.name,
  updated_at: new Date(),
});
```

### Delete Document

```typescript
// Shop API: DELETE /api/shops/[id]
const shopRef = Collections.shops().doc(shopId);
await shopRef.delete();
```

---

## 🔍 Query Patterns

### Basic Query with Filters

```typescript
const query = Collections.shops()
  .where("is_verified", "==", true)
  .where("is_featured", "==", true)
  .orderBy("created_at", "desc")
  .limit(10);

const snapshot = await query.get();
const shops = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
```

### Query with Multiple Conditions

```typescript
const query = Collections.products()
  .where("shop_id", "==", shopId)
  .where("status", "==", "active")
  .orderBy("created_at", "desc");

const snapshot = await query.get();
```

### Check Document Existence

```typescript
const existingShopQuery = Collections.shops().where("slug", "==", slug);
const existingShopSnapshot = await existingShopQuery.get();

if (!existingShopSnapshot.empty) {
  // Slug already exists
}
```

### Count Documents

```typescript
const productsQuery = Collections.products()
  .where("shop_id", "==", shopId)
  .where("status", "==", "active");
const snapshot = await productsQuery.get();
const count = snapshot.size;
```

---

## 🔐 Access Control Patterns

### Ownership Check

```typescript
const shop = await getDocumentById<any>("shops", shopId);
const isOwner = shop.owner_id === userId;
const isAdmin = userRole === "admin";

if (!isOwner && !isAdmin) {
  return NextResponse.json({ error: "Access denied" }, { status: 403 });
}
```

### Role-Based Query

```typescript
import { getShopsQuery } from "@/lib/firebase/queries";

// Guest: sees only verified shops
// User: sees only verified shops
// Seller: sees own shops + verified shops
// Admin: sees ALL shops
const query = getShopsQuery(userRole, userId);
```

### Business Logic Validation

```typescript
// Before deleting shop, check for active products
const productsQuery = Collections.products()
  .where("shop_id", "==", shopId)
  .where("status", "==", "active")
  .limit(1);
const productsSnapshot = await productsQuery.get();

if (!productsSnapshot.empty) {
  return NextResponse.json(
    { error: "Cannot delete shop with active products" },
    { status: 400 }
  );
}
```

---

## 🔄 Transaction Patterns

### Use Built-in Transaction Helpers

```typescript
import { createOrderWithItems } from "@/lib/firebase/transactions";

const result = await createOrderWithItems({
  userId: user.id,
  shopId: shopId,
  items: orderItems,
  shippingAddress: address,
  paymentMethod: "cod",
});

if (!result.success) {
  return NextResponse.json({ error: result.error }, { status: 400 });
}
```

### Custom Transaction

```typescript
import { getFirestoreAdmin } from "@/lib/firebase/admin";

const db = getFirestoreAdmin();
await db.runTransaction(async (transaction) => {
  const shopRef = Collections.shops().doc(shopId);
  const shopDoc = await transaction.get(shopRef);

  if (!shopDoc.exists) {
    throw new Error("Shop not found");
  }

  transaction.update(shopRef, {
    order_count: FieldValue.increment(1),
    updated_at: new Date(),
  });
});
```

---

## 📝 Field Naming Convention

**Always use snake_case in Firestore:**

✅ **Correct:**

```typescript
{
  owner_id: "user_123",
  is_verified: true,
  created_at: new Date(),
  shop_id: "shop_456"
}
```

❌ **Wrong:**

```typescript
{
  ownerId: "user_123",      // Don't use camelCase
  isVerified: true,
  createdAt: new Date(),
  shopId: "shop_456"
}
```

---

## 🎯 Role Permissions Matrix

| Action              | Guest | User | Seller     | Admin          |
| ------------------- | ----- | ---- | ---------- | -------------- |
| View verified shops | ✅    | ✅   | ✅         | ✅             |
| View own shops      | ❌    | ❌   | ✅         | ✅             |
| View all shops      | ❌    | ❌   | ❌         | ✅             |
| Create shop         | ❌    | ❌   | ✅ (1 max) | ✅ (unlimited) |
| Edit own shop       | ❌    | ❌   | ✅         | ✅             |
| Edit any shop       | ❌    | ❌   | ❌         | ✅             |
| Delete own shop     | ❌    | ❌   | ✅         | ✅             |
| Delete any shop     | ❌    | ❌   | ❌         | ✅             |

---

## 🗂️ Collection References

```typescript
import { Collections } from "@/lib/firebase/collections";

// Available collections
Collections.shops();
Collections.products();
Collections.orders();
Collections.orderItems();
Collections.auctions();
Collections.bids();
Collections.coupons();
Collections.reviews();
Collections.returns();
Collections.refunds();
Collections.supportTickets();
Collections.cartItems();
Collections.favorites();
Collections.viewingHistory();
Collections.paymentTransactions();
Collections.notifications();
```

---

## 🐛 Error Handling

```typescript
try {
  const shop = await getDocumentById("shops", shopId);

  if (!shop) {
    return NextResponse.json(
      { success: false, error: "Shop not found" },
      { status: 404 }
    );
  }

  // Process shop...
} catch (error) {
  console.error("[API Error]", error);
  return NextResponse.json(
    { success: false, error: "Internal server error" },
    { status: 500 }
  );
}
```

---

## 📊 Pagination Example

```typescript
const pageSize = 10;
const page = parseInt(searchParams.get("page") || "1");

let query = Collections.shops()
  .where("is_verified", "==", true)
  .orderBy("created_at", "desc")
  .limit(pageSize);

// For subsequent pages, use startAfter
if (page > 1) {
  const lastDoc = await getLastDocumentFromPreviousPage(page - 1);
  query = query.startAfter(lastDoc);
}

const snapshot = await query.get();
const shops = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
```

---

## 🔥 Common Firestore Methods

```typescript
// Get single document
const docRef = Collections.shops().doc(shopId);
const doc = await docRef.get();
const data = doc.data();

// Query collection
const snapshot = await Collections.shops()
  .where("owner_id", "==", userId)
  .get();
snapshot.forEach((doc) => console.log(doc.id, doc.data()));

// Add document (auto ID)
const newDocRef = await Collections.shops().add({ name: "New Shop" });
console.log(newDocRef.id);

// Set document (custom ID)
await Collections.shops().doc("custom-id").set({ name: "New Shop" });

// Update document
await Collections.shops().doc(shopId).update({ name: "Updated Name" });

// Delete document
await Collections.shops().doc(shopId).delete();

// Batch write
const batch = getFirestoreAdmin().batch();
batch.update(Collections.shops().doc(id1), { status: "active" });
batch.update(Collections.shops().doc(id2), { status: "inactive" });
await batch.commit();
```

---

## 🎓 Best Practices

1. **Always validate ownership** before write operations
2. **Use role-based queries** to filter data at query level
3. **Check document existence** before operations
4. **Use transactions** for multi-document updates
5. **Add business logic checks** (e.g., prevent deleting shop with active products)
6. **Use snake_case** field naming consistently
7. **Include timestamps** (created_at, updated_at) in all documents
8. **Plan indexes** for common query patterns
9. **Handle errors gracefully** with proper HTTP status codes
10. **Log errors** for debugging (use console.error)
11. **Keep Firebase Admin in `/src/app/api/lib/`** - Never import in client code

---

## 📚 See Also

- `/src/app/api/lib/firebase/admin.ts` - Firebase Admin initialization
- `/src/app/api/lib/firebase/collections.ts` - Collection references
- `/src/app/api/lib/firebase/queries.ts` - Role-based query builders
- `/src/app/api/lib/firebase/transactions.ts` - Transaction helpers
- `/firestore.indexes.json` - Composite indexes
- `/CHECKLIST/PHASE_3.3_COMPLETION.md` - Full migration details

---

**Need Help?** Check the Firebase Admin SDK docs: https://firebase.google.com/docs/admin/setup
