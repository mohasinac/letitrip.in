# RipCoins Feature

**Repository:** `ripcoinRepository`  
**Service:** `ripcoinService`  
**Feature views:** `src/features/user/` (RipCoins wallet + purchase)  
**Shared component:** `RipCoinsBalanceChip` (`src/components/user/`)

---

## Overview

RipCoins are the platform's virtual currency. Users earn them through purchases and platform activities, and spend them to get discounts at checkout or participate in coin-gated events.

---

## Earning RipCoins

| Activity                      | Coins earned                                       |
| ----------------------------- | -------------------------------------------------- |
| Place an order                | Based on order total (configured in site settings) |
| Write a verified review       | Fixed amount                                       |
| Refer a new user (if enabled) | Fixed amount                                       |
| Admin manual adjustment       | Any amount (admin panel)                           |

---

## Spending RipCoins

- **Checkout discount** — use coins to reduce order total (conversion rate in site settings)
- **Coin-gated events** — spend coins to enter premium events

---

## RipCoins Wallet

### `RipCoinsWallet` (`/user/ripcoins`)

- Large balance display
- `RipCoinsBalanceChip` chip (shows coins + icon)
- Transaction history table: date, type (earn/spend), amount, reason, order link

**Data:** `useRipCoinBalance()` → `ripcoinService.getBalance()` → `GET /api/ripcoins/balance`

---

## Purchasing RipCoins

### `RipCoinsPurchaseView` + `BuyRipCoinsModal`

(`/user/ripcoins/purchase`)

Package options (configured in site settings):

- 100 coins = ₹50
- 500 coins = ₹200
- 1000 coins = ₹350

**Purchase flow:**

1. Select package
2. `ripcoinService.initPurchase(pkg)` → `POST /api/ripcoins/purchase` → creates Razorpay order
3. Razorpay checkout dialog
4. On payment success: `useVerifyRipCoinPurchase` → `POST /api/ripcoins/purchase/verify`
5. HMAC signature verified → coins credited → balance refreshed

---

## Admin RipCoin Adjustment

From `AdminUsersView`, admins can open `RipCoinAdjustModal`:

- Enter amount (positive = credit, negative = debit)
- Enter reason (mandatory)
- Submit → `adminAdjustRipCoinsAction({ userId, amount, reason })`

This creates a transaction record in `ripcoinRepository` and updates `user.ripCoinBalance`.

---

## RipCoins Balance Chip

### `RipCoinsBalanceChip` — `src/components/user/RipCoinsBalanceChip.tsx`

Small inline display chip showing current coin balance with a coin icon. Used in:

- `UserAccountHub` dashboard
- `UserSidebar` (nav footer)
- `CheckoutPaymentMethod` (payment option display)

---

## Hooks

| Hook                       | Description                   |
| -------------------------- | ----------------------------- |
| `useRipCoinBalance`        | Current balance (cached)      |
| `usePurchaseRipCoins`      | Initiate purchase mutation    |
| `useVerifyRipCoinPurchase` | Verify payment + credit coins |

---

## API Routes

| Method | Route                           | Description            |
| ------ | ------------------------------- | ---------------------- |
| `GET`  | `/api/ripcoins/balance`         | Current balance        |
| `GET`  | `/api/ripcoins/history`         | Transaction history    |
| `POST` | `/api/ripcoins/purchase`        | Init Razorpay order    |
| `POST` | `/api/ripcoins/purchase/verify` | Verify + credit        |
| `POST` | `/api/ripcoins/refund`          | Admin-initiated refund |
