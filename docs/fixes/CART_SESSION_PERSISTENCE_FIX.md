# Persistent Sessions and Cart - Issues & Fixes 🛒

## Issues Identified

### 1. **Cart API Routes Using JWT Middleware** ❌

**File**: `src/app/api/cart/route.ts`

- Using `createUserHandler` from old JWT middleware
- Should use `createFirebaseUserHandler` for Firebase token verification

### 2. **CartContext Using JWT Cookies** ❌

**File**: `src/contexts/CartContext.tsx`

- All cart API calls use `credentials: 'include'` (JWT cookies)
- Should use `apiClient` with automatic Firebase token injection
- Manual `fetch` calls throughout without proper authentication

### 3. **No Firebase Persistence Integration** ❌

- Firebase Authentication provides automatic session persistence
- But cart isn't properly synced with Firebase auth state
- Guest cart migration happens on `user` change, but might miss edge cases

### 4. **Guest Cart Storage** ⚠️

- Uses `cookieStorage` for guest carts (good)
- But cart sync might fail if Firebase tokens aren't properly sent

## Required Fixes

### Fix 1: Update Cart API Routes to Use Firebase Auth ✅

**File**: `src/app/api/cart/route.ts`

**Change**:

```typescript
// OLD
import { createUserHandler } from "@/lib/auth/api-middleware";
const getHandler = createUserHandler(async (request: NextRequest, user) => {

// NEW
import { createFirebaseUserHandler } from "@/lib/auth/firebase-api-auth";
const getHandler = createFirebaseUserHandler(async (request, { user }) => {
```

**Impact**: All cart API endpoints will verify Firebase tokens instead of JWT cookies.

### Fix 2: Update CartContext to Use apiClient ✅

**File**: `src/contexts/CartContext.tsx`

Replace all fetch calls with `apiClient`:

```typescript
// OLD - loadCart
const response = await fetch("/api/cart", {
  credentials: "include",
});

// NEW
import { apiClient } from "@/lib/api/client";
const cartData = await apiClient.get("/cart");
```

**Changes needed**:

- ✅ `loadCart()` - Use `apiClient.get('/cart')`
- ✅ `syncCart()` - Use `apiClient.post('/cart', { ... })`
- ✅ `addToCart()` - Use `apiClient.post('/cart', { ... })`
- ✅ `updateQuantity()` - Use `apiClient.put('/cart', { ... })`
- ✅ `removeFromCart()` - Use `apiClient.delete('/cart', { ... })`
- ✅ `clearCart()` - Use `apiClient.delete('/cart')`

### Fix 3: Add Firebase Auth State Listener to Cart ✅

**File**: `src/contexts/CartContext.tsx`

Current issue:

```typescript
useEffect(() => {
  loadCart();
}, [user]);
```

This watches `user` from AuthContext, which is good! But we need to ensure:

1. Cart loads when Firebase auth initializes
2. Guest cart syncs immediately when user logs in
3. Cart clears when user logs out

**Add**:

```typescript
useEffect(() => {
  if (user) {
    // User just logged in - sync guest cart first, then load
    syncCart().then(() => loadCart());
  } else {
    // User logged out or not authenticated - load guest cart
    loadCart();
  }
}, [user?.uid]); // Watch uid specifically for Firebase user changes
```

### Fix 4: Improve Guest Cart Cookie Storage ✅

Current guest cart uses `cookieStorage.setCartData()` which should respect cookie consent.

**Verify**: Guest cart storage respects cookie consent settings
**Location**: `src/lib/storage/cookieStorage.ts`

## Implementation Priority

### **HIGH PRIORITY** 🔴

1. **Update Cart API Routes** - Without this, cart won't work at all
2. **Update CartContext to use apiClient** - Cart operations will fail without proper tokens

### **MEDIUM PRIORITY** 🟡

3. **Improve cart sync logic** - Better handling of login/logout transitions
4. **Add error handling** - Handle token expiration, network errors

### **LOW PRIORITY** 🟢

5. **Add cart persistence indicators** - Show user when cart is syncing
6. **Optimize cart updates** - Debounce quantity changes

## Session Persistence Strategy

### **Firebase Authentication** (Already Fixed)

- ✅ Firebase `onAuthStateChanged` listener in AuthContext
- ✅ Automatic token refresh by Firebase
- ✅ Persistent sessions across tabs/windows
- ✅ Survives page refreshes

### **Cart Persistence**

- **Authenticated Users**: Cart stored in Firestore
  - Persists across devices
  - Survives browser close/reopen
  - Token auto-refreshed by Firebase
- **Guest Users**: Cart stored in cookies
  - Persists across page refreshes
  - Respects cookie consent
  - Migrated to user cart on login

### **What Happens When...**

#### User Logs In:

```
1. AuthContext: Firebase authenticates → user state updated
2. CartContext: useEffect detects user change
3. syncCart(): Migrate guest cart items to user cart via API
4. Clear guest cart from cookies
5. loadCart(): Fetch full user cart from Firestore
```

#### User Logs Out:

```
1. AuthContext: Firebase signs out → user = null
2. CartContext: useEffect detects user = null
3. clearCart(): Clear user cart from state
4. Guest cart remains in cookies (if any)
```

#### Page Refresh (Logged In):

```
1. Firebase: Auto-restore session from localStorage
2. AuthContext: onAuthStateChanged fires with user
3. CartContext: Detects user → loads cart from API
4. apiClient: Auto-adds Firebase token to request
```

#### Page Refresh (Guest):

```
1. Firebase: No user in session
2. CartContext: Loads guest cart from cookies
3. Cart displays without API call
```

## Code Changes Needed

### 1. Cart API Route (`src/app/api/cart/route.ts`)

```typescript
import { createFirebaseUserHandler } from "@/lib/auth/firebase-api-auth";

export const GET = createFirebaseUserHandler(async (request, { user }) => {
  // user.uid available here (Firebase user)
  const cartItems = await firebaseService.getCartItems(user.uid);
  // ...
});

export const POST = createFirebaseUserHandler(async (request, { user }) => {
  // ...
});

export const PUT = createFirebaseUserHandler(async (request, { user }) => {
  // ...
});

export const DELETE = createFirebaseUserHandler(async (request, { user }) => {
  // ...
});
```

### 2. CartContext (`src/contexts/CartContext.tsx`)

```typescript
import { apiClient } from "@/lib/api/client";

// Load cart
const loadCart = async () => {
  if (user) {
    const cartData = await apiClient.get("/cart");
    dispatch({ type: "SET_ITEMS", payload: cartData.items || [] });
  } else {
    // Load guest cart from cookies
    const guestCart = cookieStorage.getCartData<CartItem[]>();
    dispatch({ type: "SET_ITEMS", payload: guestCart || [] });
  }
};

// Add to cart
const addToCart = async (item) => {
  if (user) {
    const result = await apiClient.post("/cart", {
      productId: item.productId,
      quantity: item.quantity,
    });
    dispatch({ type: "ADD_ITEM", payload: result });
  } else {
    // Guest cart logic
  }
};

// Similar changes for updateQuantity, removeFromCart, clearCart
```

## Testing Checklist

After implementing fixes, test:

- [ ] **Guest Cart**
  - [ ] Add items as guest
  - [ ] Items persist on page refresh
  - [ ] Items stored in cookies (check DevTools)
- [ ] **Login with Guest Cart**
  - [ ] Add items as guest
  - [ ] Log in
  - [ ] Guest cart items migrated to user cart
  - [ ] Guest cart cookies cleared
  - [ ] User cart loaded from Firestore
- [ ] **Authenticated Cart**
  - [ ] Add items while logged in
  - [ ] Items saved to Firestore
  - [ ] Refresh page → items persist
  - [ ] Open in new tab → cart synced
- [ ] **Logout**
  - [ ] Log out
  - [ ] User cart cleared from state
  - [ ] Can still use guest cart
- [ ] **Cross-Device** (if implemented)
  - [ ] Add items on Desktop
  - [ ] Log in on Mobile → cart synced
- [ ] **Token Refresh**
  - [ ] Keep page open for 1 hour
  - [ ] Cart operations still work (token auto-refreshed)

## Benefits After Fixes

✅ **Cart persists correctly** across sessions  
✅ **Automatic token management** - no manual handling  
✅ **Guest to user migration** works seamlessly  
✅ **Cross-tab sync** via Firebase  
✅ **Error handling** improved with apiClient  
✅ **Cookie consent** respected for guest carts  
✅ **No JWT dependencies** - fully Firebase-based

## Related Documentation

- [Authentication Guards Fix](./AUTH_GUARDS_FIX.md)
- [Component Migration Complete](../COMPONENT_MIGRATION_COMPLETE.md)
- [Firebase Auth Migration](../FIREBASE_AUTH_MIGRATION.md)

---

**Status**: ⚠️ **NEEDS IMPLEMENTATION**  
**Priority**: 🔴 **HIGH** - Cart won't work without these fixes  
**Estimated Time**: 30-45 minutes
