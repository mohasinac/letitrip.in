# Notifications Feature

**Repository:** `notificationRepository`  
**Service:** `notificationService`  
**Actions:** `markNotificationReadAction`, `markAllNotificationsReadAction`, `deleteNotificationAction`

---

## Overview

Notifications are per-user in-app messages created server-side by API routes and Server Actions. They are stored in Firestore and displayed in the notification centre and header bell.

---

## Notification Types

| Type              | Trigger                        |
| ----------------- | ------------------------------ |
| `order_confirmed` | Order payment succeeds         |
| `order_shipped`   | Seller ships an order          |
| `order_delivered` | ShipRocket delivery webhook    |
| `order_cancelled` | Order cancelled                |
| `review_approved` | Admin approves a review        |
| `bid_outbid`      | Another user outbids the user  |
| `bid_won`         | User wins an auction           |
| `event_started`   | Event user entered has started |
| `payout_approved` | Admin approves payout (seller) |
| `payout_rejected` | Admin rejects payout (seller)  |
| `coins_credited`  | RipCoins added to wallet       |
| `system`          | General platform announcements |

---

## Notification Centre

### `UserNotificationsView` (`/user/notifications`)

Full notification list page.

### `NotificationItem`

Row component for a single notification:

- Icon (type-based colour + icon mapping)
- Title in bold
- Body text
- Relative timestamp (e.g. "2 hours ago")
- Unread indicator — blue left border
- Click handler → `markNotificationReadAction({ id })` + navigate to related page

### `NotificationsBulkActions`

Floating toolbar:

- "Mark All as Read" → `markAllNotificationsReadAction()`
- "Delete Read" → `deleteNotificationAction` for each read notification

**Hook:** `useUserNotifications(queryParams, enabled)`

---

## Notification Bell

### `NotificationBell` — `src/components/user/NotificationBell.tsx`

Header component:

- Bell icon button
- Badge showing unread count (hidden if 0)
- Click → opens dropdown showing last 5 notifications with "View All" link

**Hooks:**

- `useNotifications(5)` — latest 5 for dropdown preview
- Unread count from `GET /api/notifications/unread-count`

---

## API Routes

| Method  | Route                             | Description            |
| ------- | --------------------------------- | ---------------------- |
| `GET`   | `/api/notifications`              | User notification list |
| `GET`   | `/api/notifications/unread-count` | Unread badge count     |
| `PATCH` | `/api/notifications/[id]/read`    | Mark single read       |
| `POST`  | `/api/notifications/read-all`     | Mark all read          |
