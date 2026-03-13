# RC Feature

**Repository:** `rcRepository`  
**Actions:** `src/actions/rc.actions.ts`  
**Feature views:** `src/features/user/` (RC wallet + purchase)  
**Shared component:** `RCBalanceChip` (`src/components/user/`)

> **Note:** `rcService` was deleted as part of Stage I1 (service layer removal). All reads go via `getRCBalanceAction` / `getRCHistoryAction` Server Actions.

---

## Overview

RC are the platform's virtual currency. Users earn them through purchases and platform activities, and spend them to get discounts at checkout or participate in coin-gated events.

---

## Earning RC

| Activity                      | Coins earned                                       |
| ----------------------------- | -------------------------------------------------- |
| Place an order                | Based on order total (configured in site settings) |
| Write a verified review       | Fixed amount                                       |
| Refer a new user (if enabled) | Fixed amount                                       |
| Admin manual adjustment       | Any amount (admin panel)                           |

---

## Spending RC

- **Checkout discount** — use coins to reduce order total (conversion rate in site settings)
- **Coin-gated events** — spend coins to enter premium events
- **Offer engagement** — RC coins are locked (`engagedRC`) when a buyer makes an offer; released on decline/expiry or adjusted on counter-acceptance; 10 RC = ₹1

---

## RC Wallet

### `RCWallet` (`/user/rc`)

- Large balance display
- `RCBalanceChip` chip (shows coins + icon)
- Transaction history table: date, type (earn/spend), amount, reason, order link

**Data:** `getRCBalanceAction()` → `rcRepository.getBalance(uid)` → returns `{ rcBalance, engagedRC }`  
Transaction history: `getRCHistoryAction(params)` → `GET /api/rc/history`

---

## Purchasing RC

### `RCPurchaseView` + `BuyRCModal`

(`/user/rc/purchase`)

Package options (configured in site settings):

- 100 coins = ₹50
- 500 coins = ₹200
- 1000 coins = ₹350

**Purchase flow:**

1. Select package from `RC_PACKAGES` (100/500/1000/5000/10 000 coins)
2. `apiClient.post(API_ENDPOINTS.RC.PURCHASE, { packageId })` → `POST /api/rc/purchase` → creates Razorpay order
3. Razorpay checkout dialog
4. On payment success: `apiClient.post(API_ENDPOINTS.RC.PURCHASE_VERIFY, payload)` → `POST /api/rc/purchase/verify`
5. HMAC signature verified → base + bonus RC credited → immutable `RCTransactionDocument` (`type: 'purchase'`) written → balance refreshed

---

## Admin RC Adjustment

From `AdminUsersView`, admins can open `RCAdjustModal`:

- Enter amount (positive = credit, negative = debit)
- Enter reason (mandatory)
- Submit → `adminAdjustRCAction({ userId, amount, reason })`

This creates a transaction record in `rcRepository` and updates `user.rcBalance`.

---

## RC Balance Chip

### `RCBalanceChip` — `src/components/user/RCBalanceChip.tsx`

Small inline display chip showing current coin balance with a coin icon. Used in:

- `UserAccountHub` dashboard
- `UserSidebar` (nav footer)
- `CheckoutPaymentMethod` (payment option display)

---

## Hooks

| Hook                  | Description                   |
| --------------------- | ----------------------------- |
| `useRCBalance`        | Current balance (cached)      |
| `usePurchaseRC`       | Initiate purchase mutation    |
| `useVerifyRCPurchase` | Verify payment + credit coins |

---

## API Routes

| Method | Route                     | Description            |
| ------ | ------------------------- | ---------------------- |
| `GET`  | `/api/rc/balance`         | Current balance        |
| `GET`  | `/api/rc/history`         | Transaction history    |
| `POST` | `/api/rc/purchase`        | Init Razorpay order    |
| `POST` | `/api/rc/purchase/verify` | Verify + credit        |
| `POST` | `/api/rc/refund`          | Admin-initiated refund |
