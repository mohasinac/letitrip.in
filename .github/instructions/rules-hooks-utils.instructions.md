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

`groupBy(arr, key)` · `unique(arr)` · `uniqueBy(arr, key)` · `sortBy(arr, key, order?)` · `chunk(arr, size)` · `shuffle(arr)` · `sample(arr, n)` · `partition(arr, fn)` · `flatten(arr)` · `difference(a, b)` · `intersection(a, b)` · `union(...arrs)` · `pluck(arr, key)` · `pick(obj, keys)` · `omit(obj, keys)` · `deepMerge(a, b)` · `deepCloneObject(obj)` · `calculatePagination(opts)` · `buildSieveFilters(...entries)` · `applySieveToArray(input)` _(in-memory Sieve fallback — only for legacy collections)_

**`buildSieveFilters`** — builds a Sieve filter string from tuples. Use in admin views instead of manual `filtersArr.push()` + `.join(",")`:

```ts
import { buildSieveFilters } from "@/helpers";
const filters = buildSieveFilters(
  ["status==", statusFilter],
  ["totalPrice>=", minAmount],
  ["createdAt>=", dateFrom],
);
// → "status==pending,totalPrice>=100,createdAt>=2026-01-01" (falsy values auto-skipped)
```

### UI Helpers

`cn(...)` / `classNames(...)` — conditional classes (NEVER template literal conditionals)  
`mergeTailwindClasses(...)` · `hexToRgb()` · `rgbToHex()` · `lightenColor()` · `darkenColor()` · `getContrastColor()`

### Auth Helpers

`hasRole(user, role)` · `hasAnyRole(user, roles)` · `isAdmin(user)` · `isSeller(user)` · `isModerator(user)` · `isSessionExpired(session)` · `generateInitials(name)` · `formatUserDisplayName(user)`

### API Request Helpers (server-side helper module)

`getSearchParams(req)` · `getRequiredSessionCookie(req)` · `getOptionalSessionCookie(req)` · `getBooleanParam(sp, key)` · `getStringParam(sp, key)` · `getNumberParam(sp, key, fallback, opts?)`

## RULE 6: Existing Hooks (`@/hooks`)

**Data fetching — TanStack Query (Stage C ✅ complete)**

For all feature hooks, use `useQuery` / `useMutation` directly from `@tanstack/react-query`. The old `useApiQuery`/`useApiMutation` adapters have been **deleted** — do not reference them.

### staleTime / gcTime tiers — MANDATORY for every useQuery call

Global defaults in `QueryProvider`: `staleTime: 5 min`, `gcTime: 30 min`, `retry: 1`, `refetchOnWindowFocus: false`, `refetchOnReconnect: false`.

**Always set `staleTime` explicitly** — do NOT rely on the global default because the wrong tier causes unnecessary Firestore reads.

| Data category              | `staleTime`      | `gcTime`         | Examples                                                |
| -------------------------- | ---------------- | ---------------- | ------------------------------------------------------- |
| Static config              | `Infinity`       | `Infinity`       | site settings, categories, FAQs, Indian states          |
| Public listings            | `10 * 60 * 1000` | `30 * 60 * 1000` | products, stores, events, blog posts, homepage sections |
| User-specific              | `5 * 60 * 1000`  | `15 * 60 * 1000` | orders, cart, wishlist, profile, addresses              |
| Fast-changing              | `30_000`         | `2 * 60 * 1000`  | notifications, active bids                              |
| Always fresh (write-check) | `0`              | —                | coupon validation, stock check                          |

```tsx
// ✅ Public listing — 10 min
const { data } = useQuery({
  queryKey: ["products", filters],
  queryFn: () => productService.list(filters),
  staleTime: 10 * 60 * 1000,
  gcTime: 30 * 60 * 1000,
});

// ✅ Static config — Infinity
const { data } = useQuery({
  queryKey: ["site-settings"],
  queryFn: () => siteSettingsService.get(),
  staleTime: Infinity,
  gcTime: Infinity,
});

// ✅ User-specific — guard with enabled
const { user } = useAuth();
const { data } = useQuery({
  queryKey: ["orders", user?.uid],
  queryFn: () => orderService.listMine(),
  enabled: !!user, // ← REQUIRED: prevents a read before auth resolves
  staleTime: 5 * 60 * 1000,
  gcTime: 15 * 60 * 1000,
});
```

### enabled guard — MANDATORY for auth-dependent or param-dependent queries

NEVER omit `enabled` when the query needs a userId, productId, or other runtime param. Firing a query with `undefined` wastes a read and may return wrong data.

```tsx
// ❌ WRONG — fires with undefined userId
useQuery({
  queryKey: ["profile", userId],
  queryFn: () => profileService.get(userId!),
});

// ✅ RIGHT
useQuery({
  queryKey: ["profile", userId],
  queryFn: () => profileService.get(userId!),
  enabled: !!userId,
});
```

### SSR initialData — no client fetch on first load

When a page passes `initialData` from an RSC, set `staleTime` to the same tier so the client does NOT immediately re-fetch the data the server just loaded.

```tsx
// In the RSC page:
const products = await productRepository.list(sieve);
return <ProductsView initialData={products} />;

// In the client view:
const { data } = useQuery({
  queryKey: ["products", filters],
  queryFn: () => productService.list(filters),
  initialData: props.initialData,
  staleTime: 10 * 60 * 1000, // ← client won't refetch until 10 min pass
});
```

```tsx
// ✅ Full hook example
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@mohasinac/http";
import { API_ENDPOINTS } from "@/constants";

const { data, isLoading } = useQuery({
  queryKey: ["products", filters],
  queryFn: () => apiClient.get(`${API_ENDPOINTS.PRODUCTS.LIST}?${filters}`),
  staleTime: 10 * 60 * 1000,
  gcTime: 30 * 60 * 1000,
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
| GET data                     | `useQuery(options)` from `@tanstack/react-query`; queryFn calls `apiClient` from `@mohasinac/http`                                                                   |
| POST/PUT/DELETE mutations    | `useMutation(options)` from `@tanstack/react-query`; mutationFn must be a Server Action from `@/actions`                                                             |
| Invalidate cache             | `useQueryClient()` → `queryClient.invalidateQueries({ queryKey })`                                                                                                   |
| Auth state                   | `useAuth()` / `useSession()`                                                                                                                                         |
| Login / Register             | `useLogin()` / `useRegister()`                                                                                                                                       |
| Google OAuth                 | `useGoogleLogin()`                                                                                                                                                   |
| Logout                       | `useLogout()`                                                                                                                                                        |
| Email verification           | `useVerifyEmail()` / `useResendVerification()`                                                                                                                       |
| Forgot / Reset password      | `useForgotPassword()` / `useResetPassword()`                                                                                                                         |
| Profile CRUD                 | `useProfile()`                                                                                                                                                       |
| Profile stats                | `useProfileStats()`                                                                                                                                                  |
| Public profile               | `usePublicProfile(uid)`                                                                                                                                              |
| Become seller                | `useBecomeSeller()`                                                                                                                                                  |
| Form state                   | `useForm({ resolver: zodResolver(schema), defaultValues })` — import from `@/hooks` (react-hook-form re-export)                                                      |
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
| Newsletter subscribe         | `useNewsletter()`                                                                                                                                                    |
| Contact form                 | `useContactSubmit()`                                                                                                                                                 |
| Media upload flow            | `useMediaUpload()`                                                                                                                                                   |
| Camera                       | `useCamera()`                                                                                                                                                        |
| RTDB one-shot auth event     | `useAuthEvent(sessionId)`                                                                                                                                            |
| RTDB one-shot payment event  | `usePaymentEvent(sessionId)`                                                                                                                                         |
| Generic RTDB one-shot        | `useRealtimeEvent<TData>(config)`                                                                                                                                    |
| Swipe / Gestures             | `useSwipe(ref, cbs, opts)` / `useGesture(ref, handlers)` / `useLongPress(cb, opts)` / `usePullToRefresh(onRefresh, opts)`                                            |
| Admin list factory           | `createAdminListQuery<TItem, TResult>(config)` — generates paginated admin hooks; use for new admin entities                                                         |

Package-first extension rule: if a hook/helper becomes reusable across domains, move it to LIR packages (`@mohasinac/react`, `@mohasinac/core`, or appropriate `@mohasinac/feat-*`) instead of adding generic logic in app-local modules.

**Service rule**: every `queryFn`/`mutationFn` MUST call a Server Action from `@/actions` or a direct `apiClient` call in a hook — never inline `fetch()`.
