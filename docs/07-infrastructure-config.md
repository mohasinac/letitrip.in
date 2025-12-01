# Infrastructure Configuration

> **Status**: ✅ Complete
> **Priority**: ✅ Complete
> **Last Updated**: January 2025

## Firestore Index Recommendations

Current indexes in `firestore.indexes.json` cover most queries. Add missing indexes for:

### Missing Composite Indexes

```json
{
  "indexes": [
    {
      "collectionGroup": "products",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "categoryIds", "arrayConfig": "CONTAINS" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "auctions",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "endTime", "order": "ASCENDING" },
        { "fieldPath": "categoryIds", "arrayConfig": "CONTAINS" }
      ]
    },
    {
      "collectionGroup": "orders",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "shopId", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    }
  ]
}
```

## Storage Rules Updates

Current `storage.rules` needs updates for:

### Avatar Uploads

```rules
match /avatars/{userId}/{fileName} {
  allow read: if true;
  allow write: if request.auth != null
    && request.auth.uid == userId
    && request.resource.size < 5 * 1024 * 1024  // 5MB
    && request.resource.contentType.matches('image/.*');
}
```

### Category Images

```rules
match /categories/{categoryId}/{fileName} {
  allow read: if true;
  allow write: if request.auth != null
    && request.auth.token.role in ['admin', 'moderator']
    && request.resource.size < 5 * 1024 * 1024
    && request.resource.contentType.matches('image/.*');
}
```

## Realtime Database Updates

Current `database.rules.json` needs:

### Presence Tracking

```json
{
  "rules": {
    "presence": {
      "$userId": {
        ".read": "auth != null",
        ".write": "auth != null && auth.uid == $userId"
      }
    },
    "typing": {
      "$conversationId": {
        "$userId": {
          ".read": "auth != null",
          ".write": "auth != null && auth.uid == $userId"
        }
      }
    }
  }
}
```

## Vercel Configuration

Update `vercel.json` for optimal performance:

```json
{
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    },
    "app/api/admin/demo/**/*.ts": {
      "maxDuration": 300
    },
    "app/api/webhooks/**/*.ts": {
      "maxDuration": 60
    }
  },
  "crons": [
    {
      "path": "/api/cron/process-auctions",
      "schedule": "* * * * *"
    },
    {
      "path": "/api/cron/cleanup-sessions",
      "schedule": "0 * * * *"
    },
    {
      "path": "/api/cron/rebuild-counts",
      "schedule": "0 */6 * * *"
    }
  ],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [{ "key": "Cache-Control", "value": "no-store, max-age=0" }]
    },
    {
      "source": "/(.*).json",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

## Firebase Emulator Configuration

Add to `firebase.json`:

```json
{
  "emulators": {
    "auth": { "port": 9099 },
    "functions": { "port": 5001 },
    "firestore": { "port": 8080 },
    "database": { "port": 9000 },
    "storage": { "port": 9199 },
    "ui": { "enabled": true, "port": 4000 }
  }
}
```

## Environment Variables

Required environment variables for production:

```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
FIREBASE_ADMIN_PRIVATE_KEY=
FIREBASE_ADMIN_CLIENT_EMAIL=

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Payment Gateways
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Email
RESEND_API_KEY=
EMAIL_FROM=

# Other
NEXT_PUBLIC_APP_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
```

## Implementation Checklist

### Firestore

- [ ] Add missing composite indexes
- [ ] Deploy index updates
- [ ] Verify query performance

### Storage

- [ ] Add avatar upload rules
- [ ] Add category image rules
- [ ] Test upload permissions

### Realtime Database

- [ ] Add presence tracking rules
- [ ] Add typing indicator rules
- [ ] Test real-time updates

### Vercel

- [ ] Update function timeouts
- [ ] Add cron jobs
- [ ] Configure headers

### Environment

- [ ] Verify all env vars in Vercel
- [ ] Set up Google OAuth credentials
- [ ] Configure email service
