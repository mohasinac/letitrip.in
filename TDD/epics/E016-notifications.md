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

---

## Implementation Status

**Status**: ⬜ PENDING (API is placeholder)

**Current State**:

- API at `/api/notifications` returns 501 Not Implemented
- No notification service implemented
- No preference management

**Requires Implementation**:

- Notifications API with Firestore persistence
- Notification service for creating notifications
- Email notification integration (Resend/SendGrid)
- Preference management API
- Notification triggers from other systems:
  - Order status changes (E005)
  - Auction events (E003)
  - Ticket updates (E010)
  - Price drops (E022)
  - Messages (E023)

**Priority**: HIGH - Many features depend on this epic

---

## Test Documentation

- **API Specs**: `/TDD/resources/notifications/API-SPECS.md`
- **Test Cases**: `/TDD/resources/notifications/TEST-CASES.md`

### Test Coverage

| Test File                                         | Status | Coverage          |
| ------------------------------------------------- | ------ | ----------------- |
| `src/app/api/notifications/(tests)/route.test.ts` | 📋     | Notifications API |

### Placeholder Tests

All tests in `route.test.ts` are `it.todo()` placeholders covering:

- GET /api/notifications (list)
- GET /api/notifications/unread-count
- PUT /api/notifications/:id/read
- PUT /api/notifications/mark-all-read
- DELETE /api/notifications/:id
- DELETE /api/notifications/clear-all
- POST /api/notifications/preferences
- GET /api/notifications/preferences
