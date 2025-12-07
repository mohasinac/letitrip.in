# Firestore Indexes - Modular Management

This directory contains modular Firestore index definitions, organized by collection for better maintainability.

## 📁 Structure

```
firestore-indexes/
├── products.js         # Product listing, filtering, sorting (19 indexes)
├── auctions.js         # Auction queries, bidding, time-based (13 indexes)
├── shops.js            # Shop discovery, verification (5 indexes)
├── orders.js           # Order tracking, fulfillment (7 indexes)
├── categories.js       # Category navigation, hierarchy (4 indexes)
├── reviews.js          # Product/shop reviews, ratings (4 indexes)
├── bids.js             # Bid history, tracking (4 indexes)
├── favorites.js        # Wishlist, saved items (2 indexes)
├── users.js            # User management, RBAC (3 indexes)
├── user-activities.js  # IP tracking, rate limiting (4 indexes)
├── addresses.js        # User addresses, defaults (3 indexes)
├── support-tickets.js  # Customer support tickets (6 indexes)
├── payments.js         # Payment tracking, history (5 indexes)
├── riplimit-refunds.js # Refund management (2 indexes)
├── notifications.js    # User notifications (4 indexes)
├── conversations.js    # Messaging, chat (3 indexes)
├── inbox-emails.js     # Email inbox (3 indexes)
├── returns.js          # Product returns (6 indexes)
├── payouts.js          # Seller payouts (3 indexes)
├── deploy-indexes.js   # Deployment script
└── README.md           # This file
```

## 🚀 Usage

### Deploy All Indexes

```bash
node firestore-indexes/deploy-indexes.js
```

This will:

1. ✅ Load all index modules
2. ✅ Merge indexes and field overrides
3. ✅ Write to `firestore.indexes.json`
4. ✅ Deploy to Firebase automatically

### Dry Run (Preview Only)

```bash
node firestore-indexes/deploy-indexes.js --dry-run
```

See what would be deployed without making changes.

### Skip Deployment

```bash
node firestore-indexes/deploy-indexes.js --skip-deploy
```

Generate `firestore.indexes.json` but don't deploy to Firebase.

## 📝 Adding New Indexes

1. **Edit the appropriate collection file** (e.g., `products.js`)
2. **Add your index** to the `indexes` array:

```javascript
{
  collectionGroup: "products",
  queryScope: "COLLECTION",
  fields: [
    { fieldPath: "status", order: "ASCENDING" },
    { fieldPath: "your_field", order: "DESCENDING" }
  ]
}
```

3. **Run deployment**:

```bash
node firestore-indexes/deploy-indexes.js
```

## 🛠️ Module Format

Each module exports:

```javascript
module.exports = {
  indexes: [
    // Array of index definitions
  ],
  fieldOverrides: [
    // Array of field override definitions (optional)
  ],
};
```

## 📊 Index Design Principles

1. **Most selective field first** (status, shop_id, user_id)
2. **Foreign keys second** (category_id, product_id)
3. **Sorting fields last** (created_at, price, rating)
4. **Separate indexes for ASC/DESC** on same field

## 🔍 Field Overrides

Used for fields that need both **equality** AND **array-contains** queries:

- **products.category_id** - Multi-category support
- **auctions.category_id** - Multi-category support

Example:

```javascript
// Equality query
where("category_id", "==", "electronics");

// Array-contains query
where("category_id", "array-contains", "electronics");
```

## 📈 Statistics

- **Total Indexes**: 60+
- **Collections Covered**: 9
- **Field Overrides**: 2 (category_id)

## 🔗 Related Documentation

- [Integration & Enhancements Guide](../docs/INTEGRATION-AND-ENHANCEMENTS-GUIDE.md)
- [Task 26.5 - Sieve Performance Optimization](../docs/INTEGRATION-AND-ENHANCEMENTS-GUIDE.md#task-265)

## 💡 Tips

- **Comment your indexes** - Future you will thank you
- **Test locally first** - Use `--dry-run` to preview
- **Monitor index usage** - Firebase Console > Firestore > Indexes
- **Remove unused indexes** - Keep your config lean

## 🐛 Troubleshooting

### Deployment fails

```bash
# Check Firebase authentication
firebase login

# Verify project
firebase use
```

### Module not found

Ensure all modules listed in `deploy-indexes.js` exist in the `firestore-indexes/` directory.

### Index conflicts

If you see "index already exists" errors, check Firebase Console for duplicate definitions.

## 📞 Support

For issues related to index design or deployment, refer to:

- [Firestore Index Documentation](https://firebase.google.com/docs/firestore/query-data/indexing)
- [AI Agent Guide](../TDD/AI-AGENT-GUIDE.md)
