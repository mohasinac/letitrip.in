# firestore-indexes/ - Firestore Index Management Documentation

## Overview

Firestore composite index definitions managed as JavaScript modules for version control and automated deployment.

## Purpose

Firestore requires composite indexes for complex queries. This directory manages indexes as code instead of relying on auto-generated `firestore.indexes.json`.

## Index Files

Each collection has its own index definition file:

- `addresses.js` - Address indexes
- `auctions.js` - Auction indexes
- `bids.js` - Bid indexes
- `blog-posts.js` - Blog post indexes
- `carts.js` - Shopping cart indexes
- `categories.js` - Category indexes
- `conversations.js` - Message indexes
- `favorites.js` - Favorite indexes
- `inbox-emails.js` - Email indexes
- `notifications.js` - Notification indexes
- `orders.js` - Order indexes
- `payments.js` - Payment indexes
- `payouts.js` - Payout indexes
- `products.js` - Product indexes
- `returns.js` - Return indexes
- `reviews.js` - Review indexes
- `riplimit-refunds.js` - RipLimit indexes
- `shops.js` - Shop indexes
- `support-tickets.js` - Support ticket indexes
- `user-activities.js` - Activity log indexes
- `users.js` - User indexes

## Key Files

### deploy-indexes.js

**Purpose**: Deploy all indexes to Firestore

**Usage**:

```bash
node firestore-indexes/deploy-indexes.js

# Dry run (preview changes)
node firestore-indexes/deploy-indexes.js --dry-run

# Build only (no deploy)
node firestore-indexes/deploy-indexes.js --skip-deploy
```

**Features**:

- Collects all index definitions
- Generates `firestore.indexes.json`
- Deploys to Firebase
- Shows diff of changes

### README.md

Documentation for index management

## Index Definition Format

```javascript
// products.js
module.exports = {
  indexes: [
    {
      collectionGroup: "products",
      queryScope: "COLLECTION",
      fields: [
        { fieldPath: "category", order: "ASCENDING" },
        { fieldPath: "price", order: "ASCENDING" },
      ],
    },
    // More indexes...
  ],
};
```

## Common Index Patterns

### Category + Sort

```javascript
{
  fields: [
    { fieldPath: "category", order: "ASCENDING" },
    { fieldPath: "createdAt", order: "DESCENDING" },
  ];
}
```

### Status + Timestamp

```javascript
{
  fields: [
    { fieldPath: "status", order: "ASCENDING" },
    { fieldPath: "updatedAt", order: "DESCENDING" },
  ];
}
```

### User + Status + Date

```javascript
{
  fields: [
    { fieldPath: "userId", order: "ASCENDING" },
    { fieldPath: "status", order: "ASCENDING" },
    { fieldPath: "createdAt", order: "DESCENDING" },
  ];
}
```

## NPM Scripts

```bash
# Deploy indexes
npm run indexes:deploy

# Dry run
npm run indexes:dry-run

# Build only
npm run indexes:build
```

## Best Practices

1. **One File Per Collection**: Keep indexes organized
2. **Document Purpose**: Comment why index is needed
3. **Review Before Deploy**: Use dry-run mode
4. **Version Control**: Track index changes in git
5. **Test Queries**: Verify indexes support your queries

## Index Exemptions

Some simple queries don't need indexes:

- Single field equality
- Single field range
- orderBy on single field

## Troubleshooting

### Index Build Failures

- Check field names match Firestore
- Verify collection names
- Check for duplicate indexes

### Query Requires Index

- Add required index to appropriate file
- Run deploy script
- Wait for index to build (can take minutes)

## Monitoring

- Check index build status in Firebase Console
- Monitor query performance
- Review unused indexes periodically

## Future Improvements

See [comments.md](./comments.md)
