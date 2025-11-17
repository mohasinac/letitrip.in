# Migration & Upgrade Guides

**Last Updated**: November 18, 2025

Collection of migration guides for upgrading between versions and migrating infrastructure.

---

## 📋 Available Migration Guides

This document consolidates various migration scenarios you might encounter when working with JustForView.in.

---

## 🔥 Firebase Cron Jobs Migration

### Overview

Migrating from Vercel Cron Jobs to Firebase Cloud Functions for scheduled tasks.

### Why Migrate?

- **Vercel Cron**: Limited to Hobby plan, requires upgrade for production
- **Firebase Functions**: FREE tier includes 2M invocations/month

### What Was Migrated

**Scheduled Tasks**:

1. **Process Auctions** - Runs every minute
   - Closes ended auctions
   - Determines winners
   - Sends notifications

### Implementation

**Firebase Function** (`functions/src/index.ts`):

```typescript
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

export const processAuctions = functions
  .region("asia-south1")
  .runWith({
    memory: "1GB",
    timeoutSeconds: 540,
  })
  .pubsub.schedule("every 1 minutes")
  .onRun(async (context) => {
    const db = admin.firestore();
    const now = new Date();

    // Get ended auctions
    const auctionsSnapshot = await db
      .collection("auctions")
      .where("status", "==", "live")
      .where("endTime", "<=", now)
      .get();

    // Process each auction
    for (const doc of auctionsSnapshot.docs) {
      const auction = doc.data();

      // Determine winner
      const bidsSnapshot = await db
        .collection("bids")
        .where("auctionId", "==", doc.id)
        .orderBy("amount", auction.type === "reverse" ? "asc" : "desc")
        .limit(1)
        .get();

      const winner = bidsSnapshot.docs[0];

      // Update auction
      await doc.ref.update({
        status: "ended",
        winnerId: winner?.data().userId || null,
        winningBid: winner?.data().amount || null,
      });

      // Send notifications (if winner exists)
      if (winner) {
        // TODO: Send notification to winner
      }
    }

    console.log(`Processed ${auctionsSnapshot.size} auctions`);
    return null;
  });
```

### Deployment

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize (if not done)
firebase init functions

# Deploy
cd functions
npm install
npm run build
firebase deploy --only functions
```

### Monitoring

**Firebase Console**:

- Functions → processAuctions
- View logs, execution count, errors

**Discord Notifications** (optional):

- Sends alerts on errors
- Configure via `DISCORD_WEBHOOK_URL`

### Rollback

If issues occur:

```bash
# Delete function
firebase functions:delete processAuctions

# Redeploy Vercel cron (if applicable)
vercel --prod
```

---

## 📂 Multi-Parent Categories Migration

### Overview

Migrating from single-parent to multi-parent category hierarchy.

### Database Changes

**Before** (Single Parent):

```typescript
interface Category {
  id: string;
  name: string;
  parentId: string | null; // Single parent
  slug: string;
}
```

**After** (Multi-Parent):

```typescript
interface Category {
  id: string;
  name: string;
  parentIds: string[]; // Multiple parents
  slug: string;
  allParentIds: string[]; // Includes ancestors
  level: number;
}
```

### Migration Script

**Location**: `scripts/migrate-categories-multi-parent.ts`

```typescript
import * as admin from "firebase-admin";

async function migrateCategories() {
  const db = admin.firestore();
  const categoriesRef = db.collection("categories");
  const snapshot = await categoriesRef.get();

  for (const doc of snapshot.docs) {
    const category = doc.data();

    // Convert single parentId to array
    const parentIds = category.parentId ? [category.parentId] : [];

    // Calculate all ancestors
    const allParentIds = await getAllAncestors(db, parentIds);

    // Calculate level
    const level = allParentIds.length;

    // Update category
    await doc.ref.update({
      parentIds,
      allParentIds,
      level,
      // Remove old field
      parentId: admin.firestore.FieldValue.delete(),
    });

    console.log(`Migrated: ${category.name}`);
  }
}

async function getAllAncestors(
  db: admin.firestore.Firestore,
  parentIds: string[]
): Promise<string[]> {
  const ancestors = new Set<string>(parentIds);

  for (const parentId of parentIds) {
    const parentDoc = await db.collection("categories").doc(parentId).get();
    if (parentDoc.exists) {
      const parent = parentDoc.data();
      if (parent?.parentIds?.length > 0) {
        const grandparents = await getAllAncestors(db, parent.parentIds);
        grandparents.forEach((id) => ancestors.add(id));
      }
    }
  }

  return Array.from(ancestors);
}

migrateCategories().catch(console.error);
```

### Run Migration

```bash
npm run migrate:categories
```

### Verify

```typescript
// Check a category
const category = await db.collection("categories").doc("electronics").get();
console.log(category.data());
// Should have: parentIds, allParentIds, level
```

---

## 🔄 Type System Migration (Frontend/Backend Separation)

### Overview

Separating types into Frontend (UI-optimized) and Backend (Database) types.

### Pattern

**Backend Type** (matches Firestore):

```typescript
interface ProductBE {
  id: string;
  name: string;
  price: number;
  createdAt: admin.firestore.Timestamp;
}
```

**Frontend Type** (UI-optimized):

```typescript
interface ProductFE {
  id: string;
  name: string;
  price: number;
  formattedPrice: string; // "₹1,999"
  createdAt: Date;
}
```

**Transform Function**:

```typescript
function toFEProduct(product: ProductBE): ProductFE {
  return {
    ...product,
    formattedPrice: formatPrice(product.price),
    createdAt: product.createdAt.toDate(),
  };
}
```

### Service Layer Integration

```typescript
class ProductsService {
  async getProducts(): Promise<ProductFE[]> {
    const response = await apiService.get<{ products: ProductBE[] }>(
      "/api/products"
    );
    return response.products.map(toFEProduct);
  }
}
```

### Migration Steps

1. **Create FE types** in `src/types/frontend/`
2. **Create transform functions** in `src/types/transforms/`
3. **Update services** to use transforms
4. **Update components** to use FE types
5. **Test thoroughly**

---

## 📦 Package Upgrades

### Next.js Major Version Upgrade

**Example: Next.js 14 → 16**

**Breaking Changes**:

- App Router stabilized
- Server Actions syntax changes
- Image component updates

**Steps**:

```bash
# Backup
git checkout -b upgrade-nextjs-16

# Update packages
npm install next@16 react@19 react-dom@19

# Fix breaking changes
# (Follow Next.js migration guide)

# Test
npm run build
npm run dev

# Commit
git add .
git commit -m "Upgrade to Next.js 16"
```

### Firebase SDK Upgrade

**Example: Firebase Admin SDK 11 → 12**

**Steps**:

```bash
# Update packages
npm install firebase-admin@12

# Check breaking changes
# (Follow Firebase migration guide)

# Update code if needed

# Test
npm run test
npm run build
```

---

## 🗄️ Database Schema Changes

### Adding New Fields

**Safe Migration** (no downtime):

```typescript
// Step 1: Add field with default
await db
  .collection("products")
  .get()
  .then((snapshot) => {
    snapshot.docs.forEach((doc) => {
      doc.ref.update({
        newField: defaultValue,
      });
    });
  });

// Step 2: Deploy code that uses new field
// (Code should handle both old and new data)

// Step 3: Backfill existing data
// (Run migration script)
```

### Renaming Fields

**Safe Migration**:

```typescript
// Step 1: Add new field (copy from old)
await db
  .collection("products")
  .get()
  .then((snapshot) => {
    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      doc.ref.update({
        newFieldName: data.oldFieldName,
      });
    });
  });

// Step 2: Deploy code that reads from new field
// (Code should fallback to old field if new doesn't exist)

// Step 3: Remove old field
await db
  .collection("products")
  .get()
  .then((snapshot) => {
    snapshot.docs.forEach((doc) => {
      doc.ref.update({
        oldFieldName: admin.firestore.FieldValue.delete(),
      });
    });
  });
```

---

## 📚 Additional Resources

- [Deployment Guide](DEPLOYMENT-GUIDE.md)
- [Firebase Functions Guide](FIREBASE-FUNCTIONS.md)
- [Environment Setup](ENVIRONMENT-SETUP.md)

---

**Last Updated**: November 18, 2025

**Note**: Always backup data before running migrations. Test in development first.
