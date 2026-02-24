# Demo Seed Manager

A development-only web interface for managing seed data in Firestore.

## 🔒 Security

- **Development Only**: This page and API are only accessible when `NODE_ENV=development`
- **ID-Based Operations**: All delete operations use specific document IDs from seed files
- **Safe by Design**: Will not affect other data in your database

## 📍 Access

Navigate to: **`http://localhost:3000/demo/seed`**

## ✨ Features

### 1. Load Seed Data (Upsert Mode)

- **Load All**: Seeds all 209 documents across 11 collections
- **Load Selected**: Choose specific collections to seed
- **Smart Upsert**: Checks if data exists before loading
  - ✨ **Creates** new documents if they don't exist
  - 🔄 **Updates** existing documents using `merge: true` (preserves fields not in seed data)
  - Shows separate counts for created vs updated
- **Auto ID Generation**: FAQs without IDs get auto-generated based on category and question
- Creates both Firebase Auth users and Firestore documents
- Auth users: Creates new or updates existing profiles (photoURL only included if valid URL)

### 2. Delete Seed Data (Safe by ID)

- **Delete All**: Removes all seed data by ID
- **Delete Selected**: Choose specific collections to delete
- **Existence Check**: Verifies document exists before attempting deletion
  - 🗑️ **Deletes** only documents that exist with matching seed IDs
  - ⏭️ **Skips** documents that don't exist (already deleted or never created)
  - Shows separate counts for deleted vs skipped
- Only deletes documents with IDs matching seed data
- Safe to use even if database has other documents

### 3. Collection Management

Select from 11 collections:

- `users` (8 documents + Auth users)
- `categories` (12 documents)
- `products` (11 documents)
- `orders` (12 documents)
- `reviews` (15 documents)
- `bids` (8 documents)
- `coupons` (10 documents)
- `carouselSlides` (6 documents)
- `homepageSections` (14 documents)
- `siteSettings` (1 document)
- `faqs` (102 documents)

## 🎯 Usage

### Loading Data

1. Visit `/demo/seed`
2. Select collections (or keep all selected)
3. Click **"📥 Load All Seed Data"** or **"📥 Load Selected"**
4. Wait for confirmation
5. Check result details:
   - ✨ **Created**: Number of new documents added
   - 🔄 **Updated**: Number of existing documents refreshed
   - ⚠️ **Errors**: Number of failures (if any)

**Note**: Running load multiple times is safe - it will update existing documents rather than creating duplicates.

### Deleting Data

1. Visit `/demo/seed`
2. Select collections to delete
3. Click **"🗑️ Delete All Seed Data"** or **"🗑️ Delete Selected"**
4. Confirm the action
5. Wait for confirmation
6. Check result details:
   - 🗑️ **Deleted**: Number of documents removed
   - ⏭️ **Skipped**: Number of documents not found (already deleted)
   - ⚠️ **Errors**: Number of failures (if any)

**Note**: Only documents with seed data IDs are deleted. Other data remains untouched.

### Typical Workflow

```bash
# 1. Start development server
npm run dev

# 2. Navigate to seed page
# http://localhost:3000/demo/seed

# 3. Load seed data
# Click "Load All Seed Data"

# 4. Develop and test
# ...

# 5. Clean up (optional)
# Click "Delete All Seed Data"
```

## 🔐 Authentication Users

When loading users, default credentials are created:

- **Email**: As specified in seed data
- **Password**: `TempPass123!` (for all demo users)
- **Email Verified**: As specified per user

### Demo User Accounts

| Email                         | Role   | Password     |
| ----------------------------- | ------ | ------------ |
| admin@letitrip.in             | admin  | TempPass123! |
| john.doe@example.com          | user   | TempPass123! |
| jane.smith@example.com        | user   | TempPass123! |
| mike.johnson@example.com      | user   | TempPass123! |
| electronics.store@example.com | seller | TempPass123! |
| fashion.boutique@example.com  | seller | TempPass123! |
| home.essentials@example.com   | seller | TempPass123! |

## 📊 Data Overview

Total: **209 documents**

- **Users**: 8 (1 admin, 3 customers, 3 sellers, 1 disabled)
- **Categories**: 13 (4 root, 9 children)
- **Products**: 10 (9 regular + 1 auction)
- **Orders**: 12 (various statuses)
- **Reviews**: 15 (12 approved, 2 pending, 1 rejected)
- **Bids**: 8 (for vintage camera auction)
- **Coupons**: 10 (various types)
- **Carousel**: 6 slides
- **Homepage**: 14 sections
- **Site Settings**: 1 global config
- **FAQs**: 102 questions

## 🛡️ Safety Features

### Smart Upsert Logic

```typescript
// Load operation checks existence first
const docRef = db.collection("products").doc("product-iphone-15-pro-...");
const snapshot = await docRef.get();

if (snapshot.exists) {
  // Updates existing document with merge
  await docRef.set(seedData, { merge: true });
  // Result: "Updated: 1"
} else {
  // Creates new document
  await docRef.set(seedData, { merge: true });
  // Result: "Created: 1"
}
```

### ID-Based Deletion

```typescript
// Delete operation checks existence first
const seedIds = [
  "user-john-doe-johndoe",
  "product-iphone-15-pro-max-...",
  "order-1-20260115-xk7m9p",
  // etc.
];

for (const id of seedIds) {
  const docRef = db.collection("products").doc(id);
  const snapshot = await docRef.get();

  if (snapshot.exists) {
    await docRef.delete();
    // Result: "Deleted: 1"
  } else {
    // Result: "Skipped: 1" (not found)
  }
}
```

### Won't Delete Other Data

```typescript
// ✅ Will delete (seed data ID)
await db.collection("products").doc("product-iphone-15-pro-max-...").delete();

// ❌ Won't touch (custom ID)
await db.collection("products").doc("my-custom-product-123").delete(); // Not in seed IDs
```

## 🚨 Error Handling

The interface shows:

- ✅ Success count
- ⚠️ Error count
- 📝 Processed collections
- Detailed error messages

Common issues:

- **Import errors**: Check seed data files exist
- **Permission errors**: Ensure Firebase Admin credentials are configured
- **Network errors**: Check Firebase connection
- **FAQ ID generation**: FAQs without IDs are auto-generated using category + question slug

### Automatic Fixes

The API automatically handles:

- **PhotoURL validation**: Only includes `photoURL` in Firebase Auth if it's a valid non-empty URL
- **FAQ ID generation**: Generates IDs using pattern `faq-{category}-{question-slug}` for FAQs without IDs
- **Null field handling**: Filters out null Firebase Auth fields that would cause validation errors

## 🧪 Testing

After loading seed data, you can test:

1. **User Authentication**: Login with demo accounts
2. **Product Listing**: Browse products and auction
3. **Order Flow**: View orders in various statuses
4. **Review System**: See approved/pending/rejected reviews
5. **Auction System**: View bids for vintage camera
6. **Category Tree**: Navigate hierarchical categories
7. **Coupons**: Test discount codes
8. **Admin Features**: Use admin account for management

## 📝 Notes

- All dates are set relative to Feb 10, 2026
- Auction ends on Feb 20, 2026
- Jane Smith is currently winning the camera auction at ₹22,000
- All relationships and foreign keys are properly linked
- User stats match actual order/review counts

## 🔧 Technical Details

### API Endpoint

- **Path**: `/api/demo/seed`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "action": "load" | "delete",
    "collections": ["users", "products"] // optional
  }
  ```

### Response Format

```json
{
  "success": true,
  "message": "Successfully loaded seed data. Created 150, updated 59 documents.",
  "details": {
    "created": 150,
    "updated": 59,
    "errors": 0,
    "collections": ["users", "categories", "products", ...]
  }
}
```

**For Delete Operations:**

```json
{
  "success": true,
  "message": "Successfully deleted seed data. Removed 180 documents, skipped 29 (not found).",
  "details": {
    "deleted": 180,
    "skipped": 29,
    "errors": 0,
    "collections": ["users", "products", ...]
  }
}
```

## 🚀 Production

Remember:

- This page **will not work** in production (`NODE_ENV=production`)
- The API route **will return 403** in production
- Remove `/demo` routes before production deployment if desired
- Or keep them - they're safe because of the environment check

## 📚 Related

- Seed data files: `scripts/seed-data/*.ts`
- Data relationships: `scripts/seed-data/RELATIONSHIPS.md`
- Proof check report: `scripts/seed-data/PROOF_CHECK_REPORT.md`
- Schema docs: `src/db/schema/`
