# User Portal Pages

All user portal pages live under `src/app/[locale]/user/`. They require an authenticated `user` role and are wrapped by the user layout with `UserSidebar`.

---

## Account Hub

**Route:** `/user`  
**Component:** `UserAccountHub`  
**Feature:** `src/features/user/`

The user's home dashboard. Shows a summary of recent orders, active wishlist count, saved addresses, and quick-action cards.

---

## Profile

**Route:** `/user/profile`  
**Components:** `ProfileView`, `ProfileHeader`, `ProfileInfoForm`, `ProfileStatsGrid`

Displays and edits the user's personal information:

- Display name, bio, avatar
- Email and phone (with verification status)
- `EmailVerificationCard` — trigger email verification
- `PhoneVerificationCard` — add/verify phone number
- `ProfileStatsGrid` — shows total orders, reviews written

**Data flow:**

- Read: `useProfile()` → `getMyProfileAction()` (Server Action)
- Write: `useUpdateProfile()` wraps `updateProfileAction` (Server Action)

---

## Orders

**Route:** `/user/orders`  
**Component:** `UserOrdersView`

Paginated order history using `useUserOrders(params)`. Supports filter by status (pending, confirmed, shipped, delivered, cancelled) and date range. Each row shows an `OrderCard`.

**Route:** `/user/orders/view/[id]`  
**Component:** `OrderDetailView`

Full order detail: items, delivery address, payment method, status timeline, and invoice download link.

**Route:** `/user/orders/[id]/track`  
**Component:** `UserOrderTrackView` / `OrderTrackingView`

Live tracking view using ShipRocket data. Shows shipment steps and courier details.

**Actions:**

- `cancelOrderAction` — user cancels a pending order

---

## Addresses

**Route:** `/user/addresses`  
**Component:** `UserAddressesView`

Lists all saved delivery/pickup addresses. Each shows an `AddressCard` with edit and delete controls.

**Route:** `/user/addresses/add`  
**Component:** `AddAddressView`

Add new address form using `AddressForm` (react-hook-form + Zod). Supports address type: Home, Office, Other.

**Route:** `/user/addresses/edit/[id]`  
**Component:** `UserEditAddressView`

Edit an existing address.

**Actions:**

- `createAddressAction`
- `updateAddressAction`
- `deleteAddressAction`
- `setDefaultAddressAction`

---

## Wishlist

**Route:** `/user/wishlist`  
**Component:** `WishlistView`

Grid of saved products. Each product card has a remove-from-wishlist button. Uses `useWishlist()` for data and `useWishlistToggle` for mutations.

See also: [docs/features/wishlist.md](../features/wishlist.md)

---

## Notifications

**Route:** `/user/notifications`  
**Component:** `UserNotificationsView`

Paginated notification list with `NotificationItem` rows. Supports bulk mark-as-read via `NotificationsBulkActions`.

**Actions:**

- `markNotificationReadAction`
- `markAllNotificationsReadAction`
- `deleteNotificationAction`

The `NotificationBell` header component shows unread count in real-time.

---

## Messages

**Route:** `/user/messages`  
**Component:** `MessagesView`

In-app chat interface:

- `ChatList` — list of active chat rooms (seller↔buyer conversations ordered by `updatedAt`)
- `ChatWindow` — real-time message thread powered by `useRealtimeChat` (Firebase RTDB subscription)

**Architecture:**

- Room metadata (participants, lastMessage, deletedBy) stored in Firestore via `chatRepository`
- Individual messages stored in Firebase **RTDB**: `/chat_rooms/{roomId}/messages/{messageId}`
- Client authenticates with RTDB via a custom token from `getRealtimeTokenAction()`

**Actions:**

- `createOrGetChatRoomAction({ orderId, sellerId })` — idempotent room creation
- `sendChatMessageAction({ roomId, content })` — writes to RTDB
- `getChatRoomsAction()` — list rooms for authenticated user

**Note:** Chat is feature-flag gated via `FEATURE_FLAGS.CHAT_ENABLED`. If disabled, the route shows an unavailable message.

---

## Offers

**Route:** `/user/offers`  
**Component:** `UserOffersView`

Buyer's outgoing offer list. Shows offer amount, status (pending/accepted/countered/expired/paid), expiry countdown, and counter amount if applicable. Actions per row: accept counter, checkout accepted offer, withdraw pending offer. Uses `listBuyerOffersAction` via `useUserOffers()` hook.

---

## Settings

**Route:** `/user/settings`  
**Component:** `UserSettingsView`

- `AccountInfoCard` — read-only account details (email, join date, role)
- `PasswordChangeForm` — change password via `PUT /api/user/change-password`

---

## Become Seller

**Route:** `/user/become-seller`  
**Component:** `BecomeSellerView`

Onboarding flow to upgrade a user account to seller. Collects store name, description, and business details. Submits via `becomeSellerAction`.

After approval, user is redirected to `/seller/store` to complete store setup.
