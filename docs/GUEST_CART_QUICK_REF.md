# Quick Reference: Guest Cart & Currency

**Date**: November 2, 2025

---

## Currency System

### Default Currency
**INR** (Indian Rupee) - Set as default for all users

### How It Works

**Guests**:
- Currency saved in cookies (365 days)
- Persists across browser sessions
- Falls back to localStorage

**Logged-In Users**:
- Currency saved to database
- Syncs automatically
- Cookie used for instant loading

### Usage

```typescript
import { useCurrency } from "@/contexts/CurrencyContext";

const { currency, setCurrency, formatPrice } = useCurrency();

// Change currency (guest)
await setCurrency("USD");

// Change currency (logged-in user)
await setCurrency("EUR", user.id);

// Format price
formatPrice(100); // "₹100" or "$1" depending on currency
```

---

## Guest Cart System

### Features

- ✅ Add to cart without login
- ✅ Cart persists 30 days
- ✅ Auto-merge on login
- ✅ Duplicate handling

### How It Works

**Guest Users**:
1. Add items to cart
2. Items saved to cookies + localStorage
3. Cart persists across sessions

**On Login**:
1. Guest cart loaded
2. Merged with user's existing cart
3. Duplicates combined (quantities added)
4. Stock limits respected
5. Guest cart cleared
6. Merged cart saved to database
7. Toast shown: "X item(s) merged from guest cart"

### Storage Locations

| User Type | Primary Storage | Backup |
|-----------|----------------|--------|
| Guest | Cookies (30 days) | localStorage |
| Logged-in | Firestore | Cookies |

---

## API Endpoints

### Currency

```
PUT /api/user/preferences
Body: { userId, preferredCurrency }
```

### Cart

```
GET  /api/cart?userId=xxx       # Load cart
POST /api/cart                  # Save cart
Body: { userId, items }

DELETE /api/cart?userId=xxx     # Clear cart
```

---

## Database Schema

### Users Collection
```typescript
{
  // ...existing fields...
  preferredCurrency?: "INR" | "USD" | "EUR" | "GBP"
}
```

### Carts Collection (NEW)
```typescript
{
  userId: string,        // Document ID
  items: CartItem[],
  updatedAt: string
}
```

---

## Testing Quick Commands

```bash
# Test running
npm run dev

# Open in browser
http://localhost:3000

# Test as guest:
1. Add items to cart
2. Close browser
3. Reopen → Cart persists

# Test login merge:
1. Add 2 items as guest
2. Log in
3. Check cart → Items merged
4. Check toast → "2 item(s) merged"

# Test currency:
1. Change to USD
2. Refresh → USD persists
3. Log in → Currency syncs to database
```

---

## Files Changed

**New Files** (4):
- `src/utils/guestCart.ts`
- `src/app/api/cart/route.ts`
- `src/app/api/user/preferences/route.ts`
- `docs/GUEST_CART_CURRENCY_IMPLEMENTATION.md`

**Updated Files** (4):
- `src/contexts/CurrencyContext.tsx`
- `src/contexts/CartContext.tsx`
- `src/components/layout/ModernLayout.tsx`
- `src/types/index.ts`

---

## Common Issues

**Cart not merging?**
- Check browser console for errors
- Verify user is logged in (`user?.id` exists)
- Check network tab for API calls

**Currency not saving?**
- Check cookies are enabled
- Verify `/api/user/preferences` endpoint works
- Check Firestore permissions

**Guest cart lost?**
- Check cookie expiry (30 days)
- Verify localStorage not cleared
- Check browser privacy settings

---

**Status**: ✅ Ready for production  
**Breaking Changes**: None  
**Backward Compatible**: Yes
