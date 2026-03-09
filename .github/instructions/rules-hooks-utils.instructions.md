---
applyTo: "src/**"
description: "Existing utils, helpers, and hooks — check before writing. Rules 5, 6."
---

# Utils, Helpers & Hooks — Check Before Writing

**NEVER reimplement logic that already exists. Search first. Extend in-place if close but not exact.**

## RULE 5: Existing Utils (`@/utils`)

### Validation

`isValidEmail` · `calculatePasswordStrength` · `meetsPasswordRequirements` · `isCommonPassword` · `isValidPhone` · `normalizePhone` · `formatPhone` · `isValidIndianMobile` · `isValidIndianPincode` · `isValidUrl` · `sanitizeUrl` · `isExternalUrl` · `isRequired` · `minLength(val, n)` · `maxLength(val, n)` · `exactLength` · `isNumeric` · `isAlphabetic` · `isAlphanumeric` · `inRange` · `matchesPattern` · `isInList` · `isValidCreditCard` · `isValidPostalCode`

### String Formatting

`formatDate` · `formatTime` · `formatDateTime` · `formatRelativeTime` · `formatDateRange` · `formatDuration` · `formatCountdown` · `formatCurrency` · `formatNumber` · `formatPercentage` · `formatFileSize` · `formatCompactNumber` · `parseFormattedNumber` · `formatDecimal` · `formatOrdinal` · `truncate` · `truncateWords` · `slugify` · `capitalize` · `capitalizeWords` · `toCamelCase` · `toPascalCase` · `toSnakeCase` · `toKebabCase` · `stripHtml` · `escapeHtml` · `maskString` · `randomString` · `isBlank` · `isEmptyString` · `wordCount` · `reverse` · `clamp` · `proseMirrorToHtml`

### Date Utilities (NEVER use `new Date()`, `Date.now()`, or raw `.toLocaleDateString()` outside `@/utils`)

`isToday` · `isPast` · `isFuture` · `isSameDay` · `isSameMonth` · `startOfDay` · `endOfDay` · `addDays` · `subtractDays` · `parseDate` · `fromFirestoreTimestamp` · `toFirestoreTimestamp` · `nowMs` · `nowISO()` · `currentYear()`

### Converters

`stringToBoolean` · `booleanToString` · `arrayToObject` · `objectToArray` · `objectToKeyValueArray` · `parseCookies` · `queryStringToObject` · `objectToQueryString` · `csvToArray` · `arrayToCsv` · `deepClone` · `flattenObject` · `unflattenObject`

### ID Generation (NEVER hand-craft Firestore document IDs)

`generateProductId` · `generateOrderId` · `generateUserId` · `generateCategoryId` · `generateAuctionId` · `generateReviewId` · `generateCarouselId` · `generateFaqId` · `generateCouponId` · `generateHomepageSectionId` · `generateBarcodeFromId` · `generateQRCodeData`

### Event Utilities

`throttle(fn, ms)` · `debounce(fn, ms)` · `getViewportDimensions()` · `isMobileDevice()` · `hasTouchSupport()` · `isInViewport(el)` · `smoothScrollTo(target)` · `preventBodyScroll(prevent)`

### Static FAQ Helpers (from `@/constants` — NOT an API call)

`getStaticFaqsByCategory(category, limit?)` · `getAllStaticFaqs(limit?)` · `getStaticFaqCategoryCounts()` — type: `StaticFAQItem`

## RULE 5: Existing Helpers (`@/helpers`)

### Data Helpers

`groupBy(arr, key)` · `unique(arr)` · `uniqueBy(arr, key)` · `sortBy(arr, key, order?)` · `chunk(arr, size)` · `shuffle(arr)` · `sample(arr, n)` · `partition(arr, fn)` · `flatten(arr)` · `difference(a, b)` · `intersection(a, b)` · `union(...arrs)` · `pluck(arr, key)` · `pick(obj, keys)` · `omit(obj, keys)` · `deepMerge(a, b)` · `deepCloneObject(obj)` · `calculatePagination(opts)` · `applySieveToArray(input)` _(in-memory Sieve fallback — only for legacy collections)_

### UI Helpers

`cn(...)` / `classNames(...)` — conditional classes (NEVER template literal conditionals)  
`mergeTailwindClasses(...)` · `hexToRgb()` · `rgbToHex()` · `lightenColor()` · `darkenColor()` · `getContrastColor()`

### Auth Helpers

`hasRole(user, role)` · `hasAnyRole(user, roles)` · `isAdmin(user)` · `isSeller(user)` · `isModerator(user)` · `isSessionExpired(session)` · `generateInitials(name)` · `formatUserDisplayName(user)`

### API Request Helpers (server-side, from `@/lib/api/`)

`getSearchParams(req)` · `getRequiredSessionCookie(req)` · `getOptionalSessionCookie(req)` · `getBooleanParam(sp, key)` · `getStringParam(sp, key)` · `getNumberParam(sp, key, fallback, opts?)`

## RULE 6: Existing Hooks (`@/hooks`)

**Data fetching — TanStack Query (Stage C ✅ complete)**

For **new** feature hooks, use `useQuery` / `useMutation` directly from `@tanstack/react-query`.
`useApiQuery` / `useApiMutation` remain as thin adapters for existing callers — do NOT remove them.

```tsx
// ✅ Preferred for new hooks
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productService } from "@/services";

const { data, isLoading } = useQuery({
  queryKey: ["products", filters],
  queryFn: () => productService.list(filters),
  staleTime: 5 * 60 * 1000,
});

// Invalidate after mutation
const queryClient = useQueryClient();
queryClient.invalidateQueries({ queryKey: ["products"] });
```

**Forms — react-hook-form + zodResolver (Stage D ✅ complete)**

`src/hooks/useForm.ts` is **deleted**. `useForm` re-exported from `react-hook-form` via barrel.

```tsx
// ✅ Required pattern for all forms
import { useForm } from "@/hooks"; // re-exports react-hook-form's useForm
import { zodResolver } from "@hookform/resolvers/zod";
import { createProductSchema } from "@/db/schema/products";

const {
  register,
  handleSubmit,
  formState: { errors, isSubmitting },
} = useForm({
  resolver: zodResolver(createProductSchema),
  defaultValues: { title: "", price: 0 },
});
```

| Need                         | Hook                                                                                                                                                                 |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| GET data (new hooks)         | `useQuery(options)` from `@tanstack/react-query`; queryFn must call a service                                                                                        |
| GET data (existing callers)  | `useApiQuery({ queryKey, queryFn, ... })` — TanStack adapter, backward compatible                                                                                    |
| POST/PUT/DELETE (new hooks)  | `useMutation(options)` from `@tanstack/react-query`; mutationFn must call a service                                                                                  |
| POST/PUT/DELETE (existing)   | `useApiMutation({ mutationFn, ... })` — TanStack adapter, backward compatible                                                                                        |
| Invalidate cache             | `useQueryClient()` → `queryClient.invalidateQueries({ queryKey })` OR `invalidateQueries(key)` from `@/hooks`                                                        |
| Auth state                   | `useAuth()` / `useSession()`                                                                                                                                         |
| Login / Register             | `useLogin()` / `useRegister()`                                                                                                                                       |
| Google / Apple OAuth         | `useGoogleLogin()` / `useAppleLogin()`                                                                                                                               |
| Logout                       | `useLogout()`                                                                                                                                                        |
| Email verification           | `useVerifyEmail()` / `useResendVerification()`                                                                                                                       |
| Forgot / Reset password      | `useForgotPassword()` / `useResetPassword()`                                                                                                                         |
| Profile CRUD                 | `useProfile()`                                                                                                                                                       |
| Profile stats                | `useProfileStats()`                                                                                                                                                  |
| Public profile               | `usePublicProfile(uid)`                                                                                                                                              |
| Become seller                | `useBecomeSeller()`                                                                                                                                                  |
| Form state                   | `useForm({ resolver: zodResolver(schema), defaultValues })` — react-hook-form via `@/hooks`                                                                          |
| Address form state           | `useAddressForm(initialData?)`                                                                                                                                       |
| Address list                 | `useAddresses()`                                                                                                                                                     |
| Single address               | `useAddress(id)`                                                                                                                                                     |
| Address CRUD                 | `useCreateAddress()` · `useUpdateAddress(id)` · `useDeleteAddress()` · `useSetDefaultAddress()`                                                                      |
| Address selector             | `useAddressSelector()`                                                                                                                                               |
| Click outside                | `useClickOutside(ref, handler)`                                                                                                                                      |
| Keyboard shortcuts           | `useKeyPress(key, handler)`                                                                                                                                          |
| Viewport breakpoint          | `useBreakpoint()` / `useMediaQuery(query)`                                                                                                                           |
| Toast/messages               | `useMessage()`                                                                                                                                                       |
| RBAC checks                  | `useRBAC()` → `useHasRole` · `useIsAdmin` · `useIsModerator` · `useIsSeller` · `useCanAccess` · `useRoleChecks` · `useIsOwner` · `useRequireAuth` · `useRequireRole` |
| URL list state               | `useUrlTable(options)`                                                                                                                                               |
| Bulk checkbox selection      | `useBulkSelection(options)`                                                                                                                                          |
| Sync bulk action             | `useBulkAction(options)`                                                                                                                                             |
| Async bulk RTDB result       | `useBulkEvent<TData>()`                                                                                                                                              |
| Pending table / filter state | `usePendingTable()` / `usePendingFilters()`                                                                                                                          |
| Countdown timer              | `useCountdown(targetDate)`                                                                                                                                           |
| Wishlist toggle              | `useWishlistToggle(productId)`                                                                                                                                       |
| Add to cart                  | `useAddToCart()`                                                                                                                                                     |
| Checkout                     | `useCheckout()`                                                                                                                                                      |
| Live bid stream              | `useRealtimeBids(auctionId)`                                                                                                                                         |
| Place bid                    | `usePlaceBid()`                                                                                                                                                      |
| Auction detail               | `useAuctionDetail(auctionId)`                                                                                                                                        |
| Real-time chat               | `useChat(chatId)`                                                                                                                                                    |
| Notifications                | `useNotifications()`                                                                                                                                                 |
| Unsaved changes              | `useUnsavedChanges(isDirty)`                                                                                                                                         |
| Admin stats                  | `useAdminStats()`                                                                                                                                                    |
| Sessions (mine / admin list) | `useMySessions()` / `useAdminSessions()` / `useUserSessions(userId)`                                                                                                 |
| Session revoke               | `useRevokeSession()` / `useRevokeMySession()` / `useRevokeUserSessions(userId)`                                                                                      |
| Coupon validation            | `useCouponValidate()`                                                                                                                                                |
| Razorpay checkout            | `useRazorpay()`                                                                                                                                                      |
| Hero carousel                | `useHeroCarousel()`                                                                                                                                                  |
| Homepage sections/reviews    | `useHomepageSections()` / `useHomepageReviews()`                                                                                                                     |
| Site settings                | `useSiteSettings()`                                                                                                                                                  |
| Featured products/auctions   | `useFeaturedProducts()` / `useFeaturedAuctions()`                                                                                                                    |
| Top categories               | `useTopCategories()`                                                                                                                                                 |
| Category query / create      | `useCategories()` / `useCreateCategory(opts?)`                                                                                                                       |
| Blog posts                   | `useBlogPosts(options?)`                                                                                                                                             |
| FAQ vote                     | `useFaqVote()`                                                                                                                                                       |
| Public events                | `usePublicEvents()`                                                                                                                                                  |
| Product reviews (public)     | `useProductReviews(productId)`                                                                                                                                       |
| Related products             | `useRelatedProducts(productId)`                                                                                                                                      |
| Seller storefront            | `useSellerStorefront(sellerId)`                                                                                                                                      |
| Promotions                   | `usePromotions()`                                                                                                                                                    |
| RipCoin balance              | `useRipCoinBalance()`                                                                                                                                                |
| RipCoin purchase             | `usePurchaseRipCoins()` / `useVerifyRipCoinPurchase()`                                                                                                               |
| RipCoin history              | `useRipCoinHistory(params?)`                                                                                                                                         |
| Newsletter subscribe         | `useNewsletter()`                                                                                                                                                    |
| Contact form                 | `useContactSubmit()`                                                                                                                                                 |
| Media upload flow            | `useMediaUpload()`                                                                                                                                                   |
| Camera                       | `useCamera()`                                                                                                                                                        |
| RTDB one-shot auth event     | `useAuthEvent(sessionId)`                                                                                                                                            |
| RTDB one-shot payment event  | `usePaymentEvent(sessionId)`                                                                                                                                         |
| Generic RTDB one-shot        | `useRealtimeEvent<TData>(config)`                                                                                                                                    |
| Swipe / Gestures             | `useSwipe(ref, cbs, opts)` / `useGesture(ref, handlers)` / `useLongPress(cb, opts)` / `usePullToRefresh(onRefresh, opts)`                                            |

**Service rule**: every `queryFn`/`mutationFn` MUST call a named service function from `@/services` — never inline `apiClient.*`.
