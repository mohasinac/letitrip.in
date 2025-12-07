# Notifications Resource

> **Last Updated**: December 7, 2025  
> **Status**: ✅ Fully Implemented (Phase 1 & 2)  
> **Related Epic**: [E016: Notifications](../../epics/E016-notifications.md)

---

## Overview

Multi-channel notification system with Email, SMS, WhatsApp, and Push notifications. Granular user preferences with category-based controls for all notification types.

## Database Collections

- `notifications` - In-app notification records
- `notification_preferences` - User notification settings
- `email_logs` - Email delivery logs
- `whatsapp_logs` - WhatsApp delivery logs
- `sms_logs` - SMS delivery logs

## Service Layer

**Location**: `src/services/notification.service.ts`, `src/services/email.service.ts`, `src/services/whatsapp.service.ts`, `src/services/sms.service.ts`

## API Endpoints

### User Routes

| Endpoint                             | Method | Auth     | Description             |
| ------------------------------------ | ------ | -------- | ----------------------- |
| `/api/notifications`                 | GET    | Required | List user notifications |
| `/api/notifications/unread-count`    | GET    | Required | Get unread count        |
| `/api/notifications/:id`             | PATCH  | Required | Mark as read            |
| `/api/notifications/read-all`        | POST   | Required | Mark all as read        |
| `/api/user/notification-preferences` | GET    | Required | Get preferences         |
| `/api/user/notification-preferences` | PUT    | Required | Update preferences      |
| `/api/whatsapp/opt-in`               | POST   | Required | WhatsApp opt-in         |
| `/api/whatsapp/opt-out`              | POST   | Required | WhatsApp opt-out        |

### Admin Routes

| Endpoint                             | Method | Auth  | Description            |
| ------------------------------------ | ------ | ----- | ---------------------- |
| `/api/admin/notifications`           | GET    | Admin | All notifications      |
| `/api/admin/notifications/broadcast` | POST   | Admin | Broadcast notification |
| `/api/admin/emails/logs`             | GET    | Admin | Email logs             |
| `/api/admin/emails/stats`            | GET    | Admin | Email statistics       |
| `/api/admin/email/test`              | POST   | Admin | Send test email        |

## Notification Types & Channels

### Order Notifications

| Event           | Email | SMS | WhatsApp | Push |
| --------------- | ----- | --- | -------- | ---- |
| Order Confirmed | ✅    | ✅  | ✅       | ✅   |
| Order Shipped   | ✅    | ✅  | ✅       | ✅   |
| Delivered       | ✅    | ✅  | ✅       | ✅   |

### Auction Notifications

| Event       | Email | SMS | WhatsApp | Push |
| ----------- | ----- | --- | -------- | ---- |
| New Bid     | ✅    | ❌  | ✅       | ✅   |
| Outbid      | ✅    | ✅  | ✅       | ✅   |
| Auction Won | ✅    | ✅  | ✅       | ✅   |
| Ending Soon | ✅    | ❌  | ✅       | ✅   |

## Features Implemented

### Phase 1 (Backend)

- ✅ WhatsApp integration (Twilio/Gupshup)
- ✅ Email integration (Resend/SendGrid)
- ✅ SMS integration (Twilio)
- ✅ Firebase Functions for automated notifications
- ✅ Webhook handlers
- ✅ Scheduled newsletters

### Phase 2 (Integration)

- ✅ User notification preferences page (463 lines)
- ✅ Granular control per channel (Email/SMS/WhatsApp/Push)
- ✅ Category-based toggles (orders/auctions/bids/messages/marketing)
- ✅ Mobile-optimized accordion UI
- ✅ Dark mode support
- ✅ WhatsApp opt-in/opt-out flow

## Notification Preferences

**Location**: `/user/settings/notifications`

### Controls

- ✅ Email: Orders, Auctions, Bids, Messages, Marketing, Newsletter
- ✅ SMS: Orders, Auctions, Bids, Deliveries
- ✅ WhatsApp: Orders, Auctions, Bids, Deliveries, Support
- ✅ Push: Orders, Auctions, Bids, Messages

## RBAC Permissions

| Action                 | Admin | Seller | User | Guest |
| ---------------------- | ----- | ------ | ---- | ----- |
| View Own Notifications | ✅    | ✅     | ✅   | ❌    |
| View All Notifications | ✅    | ❌     | ❌   | ❌    |
| Manage Preferences     | ✅    | ✅     | ✅   | ❌    |
| Broadcast Notification | ✅    | ❌     | ❌   | ❌    |
| View Logs              | ✅    | ❌     | ❌   | ❌    |

## Related Documentation

- [API-SPECS.md](./API-SPECS.md) - Detailed API documentation
- [TEST-CASES.md](./TEST-CASES.md) - Test scenarios
- [Phase 2 Summary](../../PHASE-2-INTEGRATION-SUMMARY-DEC-7-2025.md#24-notification-preferences-) - Implementation
- [RBAC](../../rbac/RBAC-CONSOLIDATED.md) - Permissions
