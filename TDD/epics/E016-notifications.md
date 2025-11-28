# Epic E016: Notifications

## Overview

Notification system for order updates, auction activity, and platform announcements.

## Scope

- In-app notifications
- Email notifications
- Push notifications (future)
- Notification preferences

## User Roles Involved

- **Admin**: Send platform notifications
- **Seller**: Receive shop notifications
- **User**: Receive personal notifications
- **Guest**: No notifications

---

## Features

### F016.1: Notification Types

```
Types:
- Order updates (placed, shipped, delivered)
- Auction updates (outbid, won, ending soon)
- Review responses
- Ticket updates
- Promotional (opt-in)
```

### F016.2: Notification Channels

**US016.2.1**: In-App Notifications
**US016.2.2**: Email Notifications
**US016.2.3**: Manage Preferences

### F016.3: Notification Management

**US016.3.1**: View Notifications
**US016.3.2**: Mark as Read
**US016.3.3**: Clear Notifications

---

## Data Models

```typescript
interface NotificationBE {
  id: string;
  userId: string;
  type: "order" | "auction" | "product" | "system" | "promo";
  title: string;
  message: string;
  data?: Record<string, any>;
  isRead: boolean;
  createdAt: Timestamp;
}
```

## Related Epics

- E005: Order Management
- E003: Auction System
- E010: Support Tickets
