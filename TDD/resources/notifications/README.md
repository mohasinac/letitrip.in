# Notifications Resource

## Overview

In-app and email notification system for order updates, auction activity, and platform announcements.

## Related Epic

- E016: Notifications

## API Endpoints

| Endpoint                         | Method | Auth     | Description             |
| -------------------------------- | ------ | -------- | ----------------------- |
| `/api/notifications`             | GET    | Required | List user notifications |
| `/api/notifications`             | POST   | Admin    | Create notification     |
| `/api/notifications/:id`         | GET    | Required | Get notification        |
| `/api/notifications/:id`         | PATCH  | Required | Mark as read            |
| `/api/notifications/:id`         | DELETE | Required | Delete notification     |
| `/api/notifications/read-all`    | POST   | Required | Mark all as read        |
| `/api/notifications/preferences` | GET    | Required | Get preferences         |
| `/api/notifications/preferences` | PATCH  | Required | Update preferences      |

## Notification Types

- `order` - Order status updates
- `auction` - Outbid, won, ending soon
- `product` - Price drops, back in stock
- `system` - Platform announcements
- `promo` - Promotional notifications

## Files

- `API-SPECS.md` - Detailed endpoint documentation
- `TEST-CASES.md` - Unit and integration test cases

## Test Files

| Test File                                         | Coverage          | Status         |
| ------------------------------------------------- | ----------------- | -------------- |
| `src/app/api/notifications/(tests)/route.test.ts` | Notifications API | 📋 Placeholder |

## Status: 📋 Placeholder Tests Only

- [x] User stories (E016)
- [x] API specifications
- [x] Test cases documented
- [ ] API implementation (pending)
- [ ] API tests (placeholder only)
