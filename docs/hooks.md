# Shared Hooks

All hooks live in `src/hooks/`. They wire up UI → Service → `apiClient` reads (via `useQuery`) or wrap Server Actions (via `useMutation`). Components must never call services or `apiClient` directly.

Re-exports from `@lir/react` are available via `src/hooks/` barrel as well. See [packages/react.md](packages/react.md) for those UI hooks.

---

## Authentication

| Hook                  | Description                                                                                   |
| --------------------- | --------------------------------------------------------------------------------------------- |
| `useAuth()`           | Current user state: `user`, `role`, `loading`, `signOut`, `getIdToken`                        |
| `useAuthEvent(event)` | Subscribe to Firebase Auth events (login/logout/refresh)                                      |
| `useRBAC()`           | Current user roles + helpers: `hasRole(role)`, `isAdmin`, `isModerator`, `isSeller`, `isUser` |
| `useHasRole(role)`    | Boolean shorthand for a single role check                                                     |
| `useIsAdmin()`        | `true` when user is `admin`                                                                   |
| `useIsModerator()`    | `true` when user is `moderator` or higher                                                     |

---

## Profile

| Hook                 | Params | Returns                                                        |
| -------------------- | ------ | -------------------------------------------------------------- |
| `useProfile()`       | —      | `{ profile, isLoading, error }` — fetches current user profile |
| `useUpdateProfile()` | —      | `{ mutate, isPending }` — wraps `updateProfileAction`          |

---

## Addresses

| Hook                         | Params           | Returns                                                   |
| ---------------------------- | ---------------- | --------------------------------------------------------- |
| `useAddresses()`             | —                | `{ addresses, isLoading }` — all saved delivery addresses |
| `useAddressForm(addressId?)` | optional edit ID | `{ form, onSubmit, isPending }` — create/update address   |

---

## Cart

| Hook                                  | Returns                                                                        |
| ------------------------------------- | ------------------------------------------------------------------------------ |
| `useCart()`                           | `{ items, total, itemCount, addItem, removeItem, updateQuantity, clearCart }`  |
| `useCartCount()`                      | `number` — item count for navbar badge                                         |
| `useGuestCart()`                      | Same as `useCart()` but uses `localStorage` fallback for unauthenticated users |
| `useGuestCartMerge()`                 | Merges guest cart into authenticated cart on sign-in                           |
| `useAddToCart(productId, variantId?)` | `{ addToCart, isPending }` — validates stock before adding                     |

---

## Checkout

| Hook                  | Params | Returns                                                                                      |
| --------------------- | ------ | -------------------------------------------------------------------------------------------- |
| `useCheckout()`       | —      | Multi-step checkout state: `step`, `address`, `coupon`, `payment`, `placeOrder`, `isPending` |
| `useCouponValidate()` | —      | `{ validate, discount, error, isPending }` — validates coupon code                           |
| `useRazorpay()`       | —      | Razorpay SDK loader + `openPayment(options)`                                                 |

---

## Orders

| Hook                        | Params        | Returns                                              |
| --------------------------- | ------------- | ---------------------------------------------------- |
| `useOrders()`               | filter params | `{ orders, total, isLoading }`                       |
| `useOrderDetail(orderId)`   | `orderId`     | `{ order, isLoading }`                               |
| `useOrderReturn(orderId)`   | `orderId`     | `{ submit, isPending }` — submits return request     |
| `useOrderCancel(orderId)`   | `orderId`     | `{ cancel, isPending }`                              |
| `useOrderTracking(orderId)` | `orderId`     | `{ tracking, isLoading }` — ShipRocket tracking data |

---

## Products

| Hook                                   | Params                     | Returns                         |
| -------------------------------------- | -------------------------- | ------------------------------- |
| `useProductDetail(productId)`          | `productId`                | `{ product, isLoading }`        |
| `useProductVariants(productId)`        | `productId`                | `{ variants, isLoading }`       |
| `useProductReviews(productId, params)` | `productId`, filter params | `{ reviews, total, isLoading }` |
| `useSimilarProducts(productId)`        | `productId`                | `{ products, isLoading }`       |

---

## Auctions

| Hook                          | Params      | Returns                                                    |
| ----------------------------- | ----------- | ---------------------------------------------------------- |
| `useAuctionDetail(auctionId)` | `auctionId` | `{ auction, isLoading }`                                   |
| `useRealtimeBids(auctionId)`  | `auctionId` | `{ bids, currentBid, isLoading }` — live RTDB subscription |
| `useBidForm(auctionId)`       | `auctionId` | `{ form, onSubmit, isPending }`                            |

---

## Reviews

| Hook                                  | Params                        | Returns                                                  |
| ------------------------------------- | ----------------------------- | -------------------------------------------------------- |
| `useUserReview(productId)`            | `productId`                   | `{ review, isLoading }` — current user's existing review |
| `useReviewForm(productId, reviewId?)` | `productId`, optional edit ID | `{ form, onSubmit, isPending }`                          |
| `useReviewVote(reviewId)`             | `reviewId`                    | `{ vote, isPending }` — helpful/not helpful              |

---

## Wishlist

| Hook                           | Returns                                                      |
| ------------------------------ | ------------------------------------------------------------ |
| `useWishlist()`                | `{ items, isLoading, addItem, removeItem, hasItem, toggle }` |
| `useWishlistToggle(productId)` | `{ inWishlist, toggle, isPending }`                          |

---

## Search & Navigation

| Hook                       | Params         | Returns                                          |
| -------------------------- | -------------- | ------------------------------------------------ |
| `useNavSuggestions(query)` | `query` string | `{ suggestions, isLoading }` — Algolia typeahead |
| `useSearch(params)`        | search params  | `{ results, facets, total, isLoading }`          |
| `useSearchFilters()`       | —              | URL-synced filter state for search pages         |

---

## Data Tables

| Hook                      | Params                   | Returns                                                                              |
| ------------------------- | ------------------------ | ------------------------------------------------------------------------------------ |
| `useUrlTable(config)`     | column config + defaults | URL-synced table state: `page`, `sort`, `filters`, `setPage`, `setSort`, `setFilter` |
| `usePendingTable(config)` | column config            | Local state table for pre-submission forms                                           |
| `usePendingFilters()`     | —                        | Filter state held in local state before URL push                                     |
| `useBulkAction(items)`    | items array              | `{ selected, toggle, selectAll, clear, isSelected }`                                 |
| `useBulkSelection(items)` | items array              | Same as above + `selectedItems` as typed array                                       |

---

## Media Upload

| Hook                      | Params                     | Returns                                         |
| ------------------------- | -------------------------- | ----------------------------------------------- |
| `useMediaUpload(options)` | `{ accept, maxSizetypes }` | `{ upload, file, preview, isUploading, error }` |
| `useMediaCrop(options)`   | `{ aspect, maxWidth }`     | `{ crop, setCrop, getBlob }`                    |
| `useMediaTrim(options)`   | `{ maxDuration }`          | `{ trim, setTrimRange, getBlob }`               |

---

## Notifications

| Hook                           | Returns                                                            |
| ------------------------------ | ------------------------------------------------------------------ |
| `useNotifications()`           | `{ notifications, unreadCount, markRead, markAllRead, isLoading }` |
| `useNotificationPreferences()` | `{ preferences, update, isPending }`                               |

---

## RipCoins

| Hook                  | Returns                                                            |
| --------------------- | ------------------------------------------------------------------ |
| `useRipCoins()`       | `{ balance, history, isLoading }`                                  |
| `useRipCoinsRedeem()` | `{ redeem, isPending, maxRedeemable }` — applies coins at checkout |

---

## Seller

| Hook                        | Returns                                                  |
| --------------------------- | -------------------------------------------------------- |
| `useSellerDashboard()`      | Aggregated seller KPIs: sales, revenue, top products     |
| `useSellerProducts(params)` | Paginated seller product listing with URL-synced filters |
| `useSellerOrders(params)`   | Paginated seller order listing                           |
| `useSellerStore()`          | Current seller's store details                           |
| `useSellerAnalytics(range)` | Revenue/order chart data                                 |

---

## Events

| Hook                            | Params    | Returns                              |
| ------------------------------- | --------- | ------------------------------------ |
| `useEventDetail(eventId)`       | `eventId` | `{ event, registration, isLoading }` |
| `useEventRegistration(eventId)` | `eventId` | `{ register, isPending }`            |
| `useEventPolls(eventId)`        | `eventId` | `{ polls, vote, isPending }`         |

---

## Blog

| Hook                  | Params        | Returns                       |
| --------------------- | ------------- | ----------------------------- |
| `useBlogPost(slug)`   | `slug`        | `{ post, isLoading }`         |
| `useBlogList(params)` | filter params | `{ posts, total, isLoading }` |

---

## General Purpose

| Hook                                    | Description                                                                            |
| --------------------------------------- | -------------------------------------------------------------------------------------- |
| `useMessage()`                          | Toast/snackbar helper: `showSuccess(msg)`, `showError(msg)` — use instead of `alert()` |
| `useUnsavedChanges(isDirty)`            | Prompts user before navigating away from dirty form                                    |
| `useDebounce(value, delay)`             | Returns debounced value                                                                |
| `usePrevious(value)`                    | Returns previous render's value                                                        |
| `useToggle(initial)`                    | `[state, toggle, setTrue, setFalse]`                                                   |
| `useLocalStorage(key, initial)`         | Persist state in `localStorage`                                                        |
| `useSessionStorage(key, initial)`       | Persist state in `sessionStorage`                                                      |
| `useImagePreview(file)`                 | Object URL preview for a `File`                                                        |
| `useScrollLock(locked)`                 | Toggle `body` scroll lock                                                              |
| `useIntersectionObserver(ref, options)` | Visibility detection for lazy-load                                                     |
| `useWindowSize()`                       | `{ width, height }` responsive window dimensions                                       |

---

## Re-exported from `@lir/react`

These are accessible via the `src/hooks/` barrel:

| Hook                             | Description                                                   |
| -------------------------------- | ------------------------------------------------------------- |
| `useBreakpoint()`                | Current Tailwind breakpoint string                            |
| `useMediaQuery(query)`           | Raw CSS media query match                                     |
| `useClickOutside(ref, handler)`  | Click outside callback                                        |
| `useKeyPress(key, options)`      | Keyboard shortcut handler                                     |
| `useLongPress(ref, handler)`     | Long press / touch hold                                       |
| `useGesture(ref, options)`       | Swipe/pinch/rotate gestures                                   |
| `useSwipe(ref, options)`         | Swipe direction + distance                                    |
| `useCamera(options)`             | Camera access + photo capture                                 |
| `usePullToRefresh(ref, options)` | Pull-to-refresh for mobile                                    |
| `useCountdown(target)`           | Countdown timer: `{ days, hours, minutes, seconds, expired }` |
