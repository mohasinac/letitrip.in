# User Portal Feature

**Feature path:** `src/features/user/`  
**Repository:** `userRepository`, `orderRepository`, `addressRepository`, `notificationRepository`  
**Actions:** Server Actions only (service layer deleted — see Stage I1)

---

## Overview

The user feature module owns the entire authenticated buyer experience: account, orders, addresses, notifications, messages, and settings.

---

## Account Hub

### `UserAccountHub` (`/user`)

Dashboard grid linking to all account sub-sections:

- Summary counts: pending orders, wishlist count, unread messages
- Quick-action cards for each section

---

## Profile

### `ProfileView`

Displays editable user profile.

### `ProfileHeader`

Avatar (via `MediaAvatar`), cover photo, display name, bio, join date, `EditProfile` button.

### `ProfileInfoForm`

react-hook-form form for:

- Display name
- Bio (textarea)
- Avatar (via `AvatarUpload` — crop then upload)
- Phone (separate verify flow)

**Mutation:** `updateProfileAction`

### `ProfileStatsGrid`

Shows:

- Total orders placed
- Reviews written
- RC earned (lifetime)
- Seller rating (if seller)

**Hook:** `useProfileStats(enabled)` → returns `ProfileStats`

### `EmailVerificationCard`

Shows email verification status. If unverified, shows "Send Verification" button → `POST /api/auth/send-verification`.

### `PhoneVerificationCard`

Shows phone status. "Add Phone" opens a modal → `POST /api/profile/add-phone` → OTP → `POST /api/profile/verify-phone`.

---

## Public Profile

### `PublicProfileView` (`/profile/[userId]`)

Public view of any user or seller:

- `ProfileHeader` (read-only)
- Listed products (if seller)
- Reviews received (from `buildSellerReviews()`)
- `ProfileStatsGrid` (public stats only)

**Data:** `usePublicProfile(userId)`  
**Types:** `SellerReviewsData`, `ProductsApiResponse`  
**Server utility:** `buildSellerReviews(userId, reviews[])` — assembles the reviews panel for RSC pages.

---

## Orders

See [docs/features/orders.md](orders.md) for full detail.

Key components:

- `UserOrdersView` — order history list
- `OrderDetailView` — single order detail
- `UserOrderTrackView` — shipment tracking

**Hooks:**

- `useUserOrders(params)` — paginated order list
- `useOrderDetail(id)` — single order

---

## Addresses

### `UserAddressesView`

Lists all saved addresses. Each `AddressCard` shows label, recipient, full address, and action buttons.

### `AddAddressView` / `UserEditAddressView`

`AddressForm` — react-hook-form with Zod. Fields:

- Label (Home / Office / Other)
- Recipient name + phone
- Line 1, Line 2 (optional)
- City, State (selector from `INDIAN_STATES`), Pincode, Country
- Set as default toggle

**Actions:** `createAddressAction`, `updateAddressAction`, `deleteAddressAction`, `setDefaultAddressAction`

**Shared components:** `AddressCard`, `AddressForm`, `AddressSelectorCreate` (in `src/components/user/`)

---

## Notifications

### `UserNotificationsView`

Paginated notification feed.

### `NotificationItem`

Individual notification row:

- Icon by notification type (order, promotion, review, system)
- Title + body text
- Timestamp (relative)
- Unread indicator dot
- Click → `markNotificationReadAction`

### `NotificationsBulkActions`

Bulk actions bar: "Mark All Read", "Delete All Read".

**Hook:** `useUserNotifications(queryParams, enabled)`

### `NotificationBell`

Header component (in `src/components/user/`) showing a bell icon with unread badge count. Clicking opens a dropdown preview of latest notifications.  
**Hook:** `useNotifications(limit)` + `GET /api/notifications/unread-count`

---

## Messages / Chat

### `MessagesView`

Two-panel chat interface.

### `ChatList`

Left panel — list of conversation rooms. Each entry shows:

- Seller avatar + name
- Last message preview
- Unread count badge

### `ChatWindow`

Right panel — active conversation:

- Message bubbles (sent vs received styling)
- Timestamp on hover
- Text input + send button
- Real-time updates via `useChat(chatId)` (Firebase RTDB)

**Hook:** `useChat` returns `{ messages, sendMessage }` — type: `ChatMessage`, `UseChatReturn`

---

## Offers

### `UserOffersView`

Buyer's outgoing offer list. Columns: product, offer amount, status, counter amount, expiry.

- **Accept counter** — `acceptCounterOfferAction` → locks new price
- **Checkout** — `checkoutOfferAction` → transitions to `paid`
- **Withdraw** — `withdrawOfferAction` → releases locked RC

**Hook:** `useUserOffers()` → `listBuyerOffersAction(params)`

See [docs/features/offers.md](offers.md) for full detail.

---

## Account Settings

### `UserSettingsView`

Tabbed settings page.

### `AccountInfoCard`

Read-only: email, UID, role badge, account created date, last login.

### `PasswordChangeForm`

Current password + new password (with `PasswordStrengthIndicator`) + confirm.  
Submits to `PUT /api/user/change-password`.

---

## Become Seller

### `BecomeSellerView` (`/user/become-seller`)

Onboarding for users wanting to sell:

1. Store name, category
2. Business description
3. Accept seller agreement
4. Submit via `becomeSellerAction`

After approval, role is upgraded to `seller` and store document is created.

---

## User Sidebar — `UserSidebar`

Left navigation for user portal:

```
Account
  Dashboard       → /user
  Profile         → /user/profile
  Settings        → /user/settings
Shopping
  Orders          → /user/orders
  Wishlist        → /user/wishlist
  Addresses       → /user/addresses
Wallet
  RC        → /user/rc
Communication
  Messages        → /user/messages
  Notifications   → /user/notifications
Seller
  Become Seller   → /user/become-seller  (hidden if already seller)
```

---

## Hooks in `features/user/hooks/`

| Hook                                         | Description       |
| -------------------------------------------- | ----------------- |
| `useUserOrders(params)`                      | Order history     |
| `useOrderDetail(id)`                         | Single order      |
| `useUserNotifications(queryParams, enabled)` | Notification list |
