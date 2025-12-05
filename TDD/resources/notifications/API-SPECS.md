# Notifications Resource - API Specifications

## Overview

Notification APIs for managing user alerts, preferences, and platform-wide announcements.

**Phase 1 Implementation**: Multi-channel notification system implemented:

- Email notifications (Resend/SendGrid)
- WhatsApp notifications (Twilio/Gupshup)
- In-app notifications (Firestore)
- Push notifications (planned)

**Related**: [E039: Phase 1 Backend Infrastructure](/TDD/epics/E039-phase1-backend-infrastructure.md)

---

## Data Models

### Notification

```typescript
interface NotificationBE {
  id: string;
  userId: string;
  type: "order" | "auction" | "product" | "system" | "promo";
  title: string;
  message: string;
  data?: {
    orderId?: string;
    auctionId?: string;
    productId?: string;
    link?: string;
    [key: string]: any;
  };
  isRead: boolean;
  createdAt: Timestamp;
  expiresAt?: Timestamp;
}
```

### Notification Preferences

```typescript
interface NotificationPreferencesBE {
  userId: string;
  email: {
    orderUpdates: boolean;
    auctionAlerts: boolean;
    priceDrops: boolean;
    promotions: boolean;
    newsletter: boolean;
  };
  push: {
    orderUpdates: boolean;
    auctionAlerts: boolean;
    priceDrops: boolean;
    promotions: boolean;
  };
  inApp: {
    orderUpdates: boolean;
    auctionAlerts: boolean;
    priceDrops: boolean;
    promotions: boolean;
    systemAlerts: boolean;
  };
  updatedAt: Timestamp;
}
```

---

## Endpoints

### GET /api/notifications

List notifications for the authenticated user.

**Authentication**: Required

**Query Parameters**:

| Param  | Type    | Default | Description                    |
| ------ | ------- | ------- | ------------------------------ |
| page   | number  | 1       | Page number                    |
| limit  | number  | 20      | Items per page (max 100)       |
| type   | string  | -       | Filter by type                 |
| unread | boolean | false   | Only show unread notifications |

**Response (200)**:

```json
{
  "success": true,
  "data": [
    {
      "id": "notif_001",
      "type": "order",
      "title": "Order Shipped",
      "message": "Your order #ORD123 has been shipped and will arrive by Jan 20",
      "data": {
        "orderId": "order_123",
        "link": "/user/orders/order_123"
      },
      "isRead": false,
      "createdAt": "2025-01-15T10:00:00Z"
    },
    {
      "id": "notif_002",
      "type": "auction",
      "title": "You've been outbid!",
      "message": "Someone placed a higher bid on 'Vintage Watch Collection'",
      "data": {
        "auctionId": "auc_001",
        "currentBid": 80000,
        "link": "/auctions/vintage-watch-collection"
      },
      "isRead": true,
      "createdAt": "2025-01-14T15:30:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "unreadCount": 12
  }
}
```

**Response (401)**:

```json
{
  "success": false,
  "error": "Unauthorized"
}
```

---

### POST /api/notifications

Create a notification (Admin or System only).

**Authentication**: Admin required

**Request Body**:

```json
{
  "userId": "user_123",
  "type": "system",
  "title": "Platform Maintenance",
  "message": "Scheduled maintenance on Jan 20 from 2 AM to 4 AM IST",
  "data": {
    "link": "/announcements/maintenance-jan-20"
  },
  "expiresAt": "2025-01-21T00:00:00Z"
}
```

**Bulk Create (Admin)**:

```json
{
  "broadcast": true,
  "type": "promo",
  "title": "New Year Sale!",
  "message": "Get up to 50% off on all products",
  "data": {
    "link": "/sale/new-year"
  },
  "targetRoles": ["user", "seller"],
  "expiresAt": "2025-01-31T23:59:59Z"
}
```

**Response (201)**:

```json
{
  "success": true,
  "data": {
    "id": "notif_new",
    "created": true,
    "recipientCount": 1
  }
}
```

**Response (403)**:

```json
{
  "success": false,
  "error": "Forbidden - Admin access required"
}
```

---

### GET /api/notifications/:id

Get a single notification.

**Authentication**: Required (owner only)

**Response (200)**:

```json
{
  "success": true,
  "data": {
    "id": "notif_001",
    "type": "order",
    "title": "Order Shipped",
    "message": "Your order #ORD123 has been shipped...",
    "data": {
      "orderId": "order_123",
      "trackingNumber": "TRK123456",
      "carrier": "BlueDart",
      "link": "/user/orders/order_123"
    },
    "isRead": false,
    "createdAt": "2025-01-15T10:00:00Z"
  }
}
```

**Response (404)**:

```json
{
  "success": false,
  "error": "Notification not found"
}
```

---

### PATCH /api/notifications/:id

Update notification (mark as read).

**Authentication**: Required (owner only)

**Request Body**:

```json
{
  "isRead": true
}
```

**Response (200)**:

```json
{
  "success": true,
  "data": {
    "id": "notif_001",
    "isRead": true
  }
}
```

---

### DELETE /api/notifications/:id

Delete a notification.

**Authentication**: Required (owner only)

**Response (200)**:

```json
{
  "success": true,
  "message": "Notification deleted"
}
```

---

### POST /api/notifications/read-all

Mark all notifications as read.

**Authentication**: Required

**Request Body** (optional):

```json
{
  "type": "order"
}
```

**Response (200)**:

```json
{
  "success": true,
  "data": {
    "updatedCount": 12
  }
}
```

---

### GET /api/notifications/preferences

Get notification preferences.

**Authentication**: Required

**Response (200)**:

```json
{
  "success": true,
  "data": {
    "email": {
      "orderUpdates": true,
      "auctionAlerts": true,
      "priceDrops": false,
      "promotions": false,
      "newsletter": true
    },
    "push": {
      "orderUpdates": true,
      "auctionAlerts": true,
      "priceDrops": false,
      "promotions": false
    },
    "inApp": {
      "orderUpdates": true,
      "auctionAlerts": true,
      "priceDrops": true,
      "promotions": true,
      "systemAlerts": true
    }
  }
}
```

---

### PATCH /api/notifications/preferences

Update notification preferences.

**Authentication**: Required

**Request Body**:

```json
{
  "email": {
    "promotions": true,
    "newsletter": false
  },
  "push": {
    "priceDrops": true
  }
}
```

**Response (200)**:

```json
{
  "success": true,
  "data": {
    "email": {
      "orderUpdates": true,
      "auctionAlerts": true,
      "priceDrops": false,
      "promotions": true,
      "newsletter": false
    },
    "push": {
      "orderUpdates": true,
      "auctionAlerts": true,
      "priceDrops": true,
      "promotions": false
    },
    "inApp": {
      "orderUpdates": true,
      "auctionAlerts": true,
      "priceDrops": true,
      "promotions": true,
      "systemAlerts": true
    }
  }
}
```

---

## Phase 1: Multi-Channel Notification System

### Email Notifications (Implemented)

**Firebase Functions**:

- `functions/src/notifications/email/orderEmail.ts` - Order status emails
- `functions/src/notifications/email/shipmentEmail.ts` - Shipping updates
- `functions/src/notifications/email/returnEmail.ts` - Return confirmations
- `functions/src/notifications/email/payoutEmail.ts` - Payout notifications
- `functions/src/notifications/email/scheduledNewsletter.ts` - Weekly/monthly newsletters

**Features**:

- Template-based emails (Firestore)
- Multi-provider support (Resend/SendGrid)
- Webhook event tracking
- Open/click rate analytics
- Batch processing for newsletters

**Admin API Routes**:

- `GET /api/admin/email/templates` - List templates
- `POST /api/admin/email/templates` - Create template
- `PUT /api/admin/email/templates/:id` - Update template
- `DELETE /api/admin/email/templates/:id` - Delete template
- `GET /api/admin/email/logs` - View email logs
- `POST /api/admin/email/webhook` - Webhook handler

### WhatsApp Notifications (Implemented)

**Firebase Functions**:

- `functions/src/notifications/whatsapp/orderWhatsApp.ts` - Order updates
- `functions/src/notifications/whatsapp/shipmentWhatsApp.ts` - Tracking updates
- `functions/src/notifications/whatsapp/auctionWhatsApp.ts` - Auction alerts

**Features**:

- Multi-provider support (Twilio/Gupshup)
- Template management
- Delivery status tracking
- Opt-in/opt-out support

**Admin Configuration**:

- `POST /api/admin/settings/whatsapp` - Configure provider
- `GET /api/admin/settings/whatsapp/templates` - List templates
- `POST /api/admin/settings/whatsapp/test` - Test delivery

### Notification Preferences API

#### PUT /api/user/notification-preferences

Update notification preferences.

**Request Body**:

```json
{
  "email": {
    "orderUpdates": true,
    "auctionAlerts": true,
    "priceDrops": false,
    "promotions": false,
    "newsletter": true
  },
  "whatsapp": {
    "orderUpdates": true,
    "auctionAlerts": false,
    "priceDrops": false
  },
  "inApp": {
    "orderUpdates": true,
    "auctionAlerts": true,
    "priceDrops": true,
    "promotions": true,
    "systemAlerts": true
  }
}
```

**Response (200)**:

```json
{
  "success": true,
  "data": {
    "userId": "user_123",
    "email": { "orderUpdates": true, "newsletter": true },
    "whatsapp": { "orderUpdates": true },
    "inApp": { "orderUpdates": true, "auctionAlerts": true },
    "updatedAt": "2024-12-06T10:00:00Z"
  }
}
```

---

## Notification Triggers

### Order Notifications (Phase 1: Email + WhatsApp)

| Event           | Type  | Recipients | Channels                     |
| --------------- | ----- | ---------- | ---------------------------- |
| Order Placed    | order | Customer   | email, whatsapp, inApp       |
| Order Confirmed | order | Customer   | email, whatsapp, inApp       |
| Order Shipped   | order | Customer   | email, whatsapp, push, inApp |
| Order Delivered | order | Customer   | email, whatsapp, push, inApp |
| Order Cancelled | order | Customer   | email, whatsapp, inApp       |
| New Order       | order | Seller     | email, whatsapp, push, inApp |

### Auction Notifications

| Event         | Type    | Recipients      | Channels           |
| ------------- | ------- | --------------- | ------------------ |
| Outbid        | auction | Previous bidder | email, push, inApp |
| Auction Won   | auction | Winner          | email, push, inApp |
| Auction Lost  | auction | Bidders         | inApp              |
| Ending Soon   | auction | Watchers        | push, inApp        |
| Auction Ended | auction | Seller          | email, inApp       |

### Product Notifications

| Event         | Type    | Recipients  | Channels     |
| ------------- | ------- | ----------- | ------------ |
| Price Drop    | product | Wishlisters | email, inApp |
| Back in Stock | product | Wishlisters | email, push  |

### System Notifications

| Event         | Type   | Recipients | Channels     |
| ------------- | ------ | ---------- | ------------ |
| Maintenance   | system | All Users  | email, inApp |
| New Feature   | system | All Users  | inApp        |
| Policy Update | system | All Users  | email, inApp |

---

## RBAC Permissions

| Action                  | Admin | Seller | User | Guest |
| ----------------------- | ----- | ------ | ---- | ----- |
| List own notifications  | ✅    | ✅     | ✅   | ❌    |
| Read own notification   | ✅    | ✅     | ✅   | ❌    |
| Mark as read            | ✅    | ✅     | ✅   | ❌    |
| Delete own notification | ✅    | ✅     | ✅   | ❌    |
| Create notification     | ✅    | ❌     | ❌   | ❌    |
| Broadcast notification  | ✅    | ❌     | ❌   | ❌    |
| Update preferences      | ✅    | ✅     | ✅   | ❌    |

---

## Implementation Notes

1. **Real-time**: Consider WebSocket/SSE for real-time notification delivery
2. **Cleanup**: Implement TTL-based cleanup for expired notifications
3. **Email Service**: Integrate with Resend for email notifications
4. **Push**: Future implementation with Firebase Cloud Messaging
5. **Rate Limiting**: Limit notification creation to prevent spam
