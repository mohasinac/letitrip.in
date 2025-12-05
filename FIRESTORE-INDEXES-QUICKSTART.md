# Firestore Index Management - Quick Start

## 🎯 Overview

Firestore indexes are now **modular** - split across collection-specific files in `firestore-indexes/` for better organization and maintainability.

## 📁 File Structure

```
firestore-indexes/
├── products.js      → Product indexes (11)
├── auctions.js      → Auction indexes (9)
├── shops.js         → Shop indexes (5)
├── orders.js        → Order indexes (7)
├── categories.js    → Category indexes (4)
├── reviews.js       → Review indexes (4)
├── bids.js          → Bid indexes (4)
├── favorites.js     → Favorite indexes (2)
├── users.js         → User indexes (3)
└── deploy-indexes.js → Deployment script
```

## 🚀 Common Commands

### Deploy All Indexes to Firebase

```bash
npm run indexes:deploy
```

**What it does:**

1. ✅ Merges all `firestore-indexes/*.js` files
2. ✅ Generates `firestore.indexes.json`
3. ✅ Deploys to Firebase automatically

---

### Preview Changes (Dry Run)

```bash
npm run indexes:dry-run
```

See what would be deployed **without** making changes.

---

### Build Only (No Deploy)

```bash
npm run indexes:build
```

Generate `firestore.indexes.json` but don't deploy to Firebase.

---

## ✏️ Adding a New Index

### Step 1: Edit the Collection File

Open the appropriate file (e.g., `firestore-indexes/products.js`):

```javascript
module.exports = {
  indexes: [
    // Add your new index here
    {
      collectionGroup: "products",
      queryScope: "COLLECTION",
      fields: [
        { fieldPath: "status", order: "ASCENDING" },
        { fieldPath: "your_new_field", order: "DESCENDING" },
      ],
    },
  ],
  fieldOverrides: [],
};
```

### Step 2: Deploy

```bash
npm run indexes:deploy
```

That's it! 🎉

---

## 🔍 Finding the Right File

| Need to add an index for...  | Edit this file  |
| ---------------------------- | --------------- |
| Product listings, filtering  | `products.js`   |
| Auction queries, bidding     | `auctions.js`   |
| Shop discovery, verification | `shops.js`      |
| Order tracking, fulfillment  | `orders.js`     |
| Category navigation          | `categories.js` |
| Product/shop reviews         | `reviews.js`    |
| Auction bid history          | `bids.js`       |
| User wishlists               | `favorites.js`  |
| User management, RBAC        | `users.js`      |

---

## 💡 Index Design Tips

### 1. Order Matters

Put **most selective** fields first:

```javascript
// ✅ Good - status filters most records first
{ fieldPath: "status", order: "ASCENDING" },
{ fieldPath: "shop_id", order: "ASCENDING" },
{ fieldPath: "created_at", order: "DESCENDING" }

// ❌ Bad - created_at doesn't filter much
{ fieldPath: "created_at", order: "DESCENDING" },
{ fieldPath: "status", order: "ASCENDING" }
```

### 2. Separate ASC/DESC Indexes

Firestore needs separate indexes for ascending/descending sorts:

```javascript
// Index 1: Price low to high
{ fieldPath: "price", order: "ASCENDING" }

// Index 2: Price high to low
{ fieldPath: "price", order: "DESCENDING" }
```

### 3. Document Your Indexes

Always add comments explaining the purpose:

```javascript
// Query: Get featured products sorted by price (lowest first)
// Use Case: "Featured Deals" section on homepage
// Routes: /api/products?featured=true&sort=price:asc
{
  collectionGroup: "products",
  queryScope: "COLLECTION",
  fields: [
    { fieldPath: "is_featured", order: "ASCENDING" },
    { fieldPath: "price", order: "ASCENDING" }
  ]
}
```

---

## 🐛 Troubleshooting

### "Module not found" error

Make sure you're in the project root:

```bash
cd d:\proj\justforview.in
npm run indexes:deploy
```

---

### Deployment fails

Check Firebase authentication:

```bash
firebase login
firebase use
```

---

### Index already exists

Firebase may have cached indexes. Check the Firebase Console:

1. Go to **Firestore Database**
2. Click **Indexes** tab
3. Delete conflicting indexes
4. Re-run: `npm run indexes:deploy`

---

## 📊 Current Statistics

- **Total Indexes**: 49
- **Collections Covered**: 9
- **Field Overrides**: 2 (category_id)

---

## 🔗 Related Docs

- [Full Documentation](firestore-indexes/README.md)
- [Integration Guide](docs/INTEGRATION-AND-ENHANCEMENTS-GUIDE.md)
- [Firestore Index Docs](https://firebase.google.com/docs/firestore/query-data/indexing)

---

## 📝 Best Practices

✅ **DO:**

- Test with `--dry-run` before deploying
- Add descriptive comments to indexes
- Keep related indexes in the same file
- Deploy after testing query changes

❌ **DON'T:**

- Edit `firestore.indexes.json` directly (it's auto-generated)
- Deploy without testing locally first
- Create duplicate indexes
- Forget to document why an index exists

---

## 🎓 Examples

### Example 1: Simple Query Index

**Query:** Get active products sorted by date

```javascript
{
  collectionGroup: "products",
  queryScope: "COLLECTION",
  fields: [
    { fieldPath: "status", order: "ASCENDING" },
    { fieldPath: "created_at", order: "DESCENDING" }
  ]
}
```

---

### Example 2: Multi-Field Filter + Sort

**Query:** Get shop products filtered by status, sorted by price

```javascript
{
  collectionGroup: "products",
  queryScope: "COLLECTION",
  fields: [
    { fieldPath: "shop_id", order: "ASCENDING" },
    { fieldPath: "status", order: "ASCENDING" },
    { fieldPath: "price", order: "ASCENDING" }
  ]
}
```

---

### Example 3: Field Override (Multi-Mode)

**Use Case:** category_id needs both equality AND array-contains queries

```javascript
fieldOverrides: [
  {
    collectionGroup: "products",
    fieldPath: "category_id",
    indexes: [
      {
        order: "ASCENDING",
        queryScope: "COLLECTION",
      },
      {
        arrayConfig: "CONTAINS",
        queryScope: "COLLECTION",
      },
    ],
  },
];
```

This allows:

```javascript
// Equality query
where("category_id", "==", "electronics");

// Array-contains query
where("category_id", "array-contains", "electronics");
```

---

## 🎉 Success!

You're now ready to manage Firestore indexes like a pro! 🚀

For questions, check the [full README](firestore-indexes/README.md) or ask the team.
