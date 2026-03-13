# User Portal Pages

All user portal pages live under `src/app/[locale]/user/`. They require an authenticated `user` role and are wrapped by the user layout with `UserSidebar`.

---

## Account Hub

**Route:** `/user`  
**Component:** `UserAccountHub`  
**Feature:** `src/features/user/`

The user's home dashboard. Shows a summary of recent orders, earned RipCoins, active wishlist count, saved addresses, and quick-action cards.

---

## Profile

**Route:** `/user/profile`  
**Components:** `ProfileView`, `ProfileHeader`, `ProfileInfoForm`, `ProfileStatsGrid`

Displays and edits the user's personal information:

- Display name, bio, avatar
- Email and phone (with verification status)
- `EmailVerificationCard` — trigger email verification
- `PhoneVerificationCard` — add/verify phone number
- `ProfileStatsGrid` — shows total orders, reviews written, coins earned

**Data flow:**

- Read: `useProfile()` → `profileService.getProfile()` → `GET /api/user/profile`
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

- `ChatList` — list of active chat rooms (seller-buyer conversations)
- `ChatWindow` — real-time message thread using `useChat` (Firebase Realtime DB)

Messages are stored in Firestore via `chatRepository`.

---

## RipCoins Wallet

**Route:** `/user/ripcoins`  
**Component:** `RipCoinsWallet`

Shows current RipCoin balance, transaction history, and how coins were earned/spent.

**Route:** `/user/ripcoins/purchase`  
**Component:** `RipCoinsPurchaseView` + `BuyRipCoinsModal`

Purchase RipCoins via Razorpay. Flow:

1. Select coin package
2. `POST /api/ripcoins/purchase` — creates Razorpay order
3. Razorpay checkout modal
4. `useVerifyRipCoinPurchase` — verifies payment and credits coins

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
