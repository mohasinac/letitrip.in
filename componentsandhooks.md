# Components, Hooks, Features and API Migration Log

## The Rule
**Everything reusable must live in appkit. If it doesn't exist there yet, create a generic version in appkit and delete the letitrip copy.**

### What legitimately stays in letitrip
- `src/lib/firebase/` — Firebase project credentials, SDK init (secrets, env-specific)
- `src/lib/payment/razorpay.ts`, `src/lib/shiprocket/` — Market-specific payment/shipping SDK drivers
- `src/lib/pwa/` — App-specific PWA service-worker runtime config
- `src/lib/integration-keys.ts` — Letitrip-specific key constants
- `src/providers.config.ts`, `src/features.config.ts` — Registry wiring stubs
- `src/i18n/` — Locale routing config (locale list, `navigation.ts`)
- `src/constants/site.ts`, `src/constants/routes.ts`, `src/constants/api-endpoints.ts` — App-specific data/config
- `src/app/` — Next.js page/layout/loading/error.tsx (route wiring only; each calls an appkit `*View.tsx`)
- `src/actions/` — Server actions (thin wiring: validate → call appkit repo → return)
- `src/types/appkit-provider-shims.d.ts` — TS module augmentation shims

### What does NOT stay in letitrip
Everything else — including layouts, navbars, footers, filters, error boundaries, cards, forms, hooks, contexts, repositories, schema, seed data, utilities. These get a **generic version in appkit** and the letitrip file is deleted.

---

## Status Key
- ✅ Done — deleted, callers migrated to appkit
- ⬜ Todo — needs a generic version in appkit, then delete letitrip copy
- 🔄 In progress
- ❓ Review — API diff needed before merging

---

## src/components — Full Inventory

### ui/

| File | appkit destination | Status |
|------|--------------------|--------|
| `ui/ActiveFilterChips.tsx` | `@mohasinac/appkit/ui` `ActiveFilterChips` | ✅ Deleted |
| `ui/Avatar.tsx` | `appkit/ui/components/Avatar` (create generic) | ⬜ Todo |
| `ui/BaseListingCard.tsx` | `appkit/ui/components/BaseListingCard` (create generic base) | ⬜ Todo |
| `ui/Card.tsx` | `appkit/ui/components/Card` (create generic) | ⬜ Todo |
| `ui/Dropdown.tsx` | `appkit/ui/components/Dropdown` (create generic) | ⬜ Todo |
| `ui/DynamicSelect.tsx` | `appkit/ui/components/DynamicSelect` (create generic) | ⬜ Todo |
| `ui/EmptyState.tsx` | `appkit/ui/components/EmptyState` (create generic) | ⬜ Todo |
| `ui/FilterDrawer.tsx` | `appkit/ui/components/FilterDrawer` (create generic) | ⬜ Todo |
| `ui/FilterFacetSection.tsx` | `appkit/ui/components/FilterFacetSection` (create generic) | ⬜ Todo |
| `ui/FlowDiagram.tsx` | `appkit/ui/components/FlowDiagram` (create generic) | ⬜ Todo |
| `ui/ImageGallery.tsx` | merge with `appkit/ui/components/ImageLightbox` | ⬜ Todo |
| `ui/Menu.tsx` | `appkit/ui/components/Menu` (create generic) | ⬜ Todo |
| `ui/RoleBadge.tsx` | `appkit/ui/components/RoleBadge` (create generic) | ⬜ Todo |
| `ui/SectionTabs.tsx` | `@mohasinac/appkit/ui` `SectionTabs` | ✅ Deleted |
| `ui/SideDrawer.tsx` | merge with `appkit/ui/components/Drawer` | ❓ API diff needed |
| `ui/SkipToMain.tsx` | `appkit/ui/components/SkipToMain` (create generic a11y) | ⬜ Todo |
| `ui/Tabs.tsx` | merge with `appkit/ui/components/TabStrip` — align API | ⬜ Todo |

### feedback/

| File | appkit destination | Status |
|------|--------------------|--------|
| `feedback/Alert.tsx` | `@mohasinac/appkit/ui` `Alert` | ✅ Deleted |
| `feedback/Modal.tsx` | `@mohasinac/appkit/ui` `Modal` — align API | ⬜ Todo |
| `feedback/Toast.tsx` | `appkit/ui/feedback/Toast` (create generic) | ⬜ Todo |

### forms/

| File | appkit destination | Status |
|------|--------------------|--------|
| `forms/Checkbox.tsx` | `appkit/ui/components/Checkbox` (create generic) | ⬜ Todo |
| `forms/Form.tsx` | `@mohasinac/appkit/ui` `Form` | ⬜ Todo |
| `forms/Input.tsx` | `@mohasinac/appkit/ui` `Input` | ⬜ Todo — high caller count |
| `forms/Radio.tsx` | `appkit/ui/components/Radio` (create generic) | ⬜ Todo |
| `forms/Select.tsx` | `@mohasinac/appkit/ui` `Select` | ⬜ Todo |
| `forms/Slider.tsx` | `@mohasinac/appkit/ui` `Slider` | ⬜ Todo |
| `forms/Textarea.tsx` | `@mohasinac/appkit/ui` `Textarea` | ⬜ Todo |
| `forms/Toggle.tsx` | `appkit/ui/components/Toggle` (create generic) | ⬜ Todo |

### filters/

All filter components are generic UI patterns that belong in appkit. Letitrip passes entity-specific config via props.

| File | appkit destination | Status |
|------|--------------------|--------|
| `filters/BlogFilters.tsx` | `appkit/features/blog/components/BlogFilters` | ⬜ Todo |
| `filters/EventFilters.tsx` | `appkit/features/events/components/EventFilters` | ⬜ Todo |
| `filters/FilterPanel.tsx` | `appkit/ui/components/FilterPanel` (create generic) | ⬜ Todo |
| `filters/OrderFilters.tsx` | `appkit/features/orders/components/OrderFilters` | ⬜ Todo |
| `filters/ProductFilters.tsx` | `appkit/features/products/components/ProductFilters` | ⬜ Todo |
| `filters/RangeFilter.tsx` | merge with `appkit/ui/components/Slider` + label wrapper | ⬜ Todo |
| `filters/ReviewFilters.tsx` | `appkit/features/reviews/components/ReviewFilters` | ⬜ Todo |
| `filters/SwitchFilter.tsx` | `appkit/ui/components/SwitchFilter` (create generic) | ⬜ Todo |

### layout/

All navigation and layout shells belong in appkit as configurable components. Letitrip passes navItems, config, locale.

| File | appkit destination | Status |
|------|--------------------|--------|
| `layout/LocaleSwitcher.tsx` | `appkit/features/layout/LocaleSwitcher` | ✅ Deleted |
| `layout/AutoBreadcrumbs.tsx` | `appkit/features/layout/AutoBreadcrumbs` (generic + config) | ⬜ Todo |
| `layout/Breadcrumbs.tsx` | merge with `appkit/ui/components/Breadcrumb` | ⬜ Todo |
| `layout/BottomActions.tsx` | `appkit/features/layout/BottomActions` (create generic) | ⬜ Todo |
| `layout/BottomNavbar.tsx` | `appkit/features/layout/BottomNavbar` (create generic, navItems prop) | ⬜ Todo |
| `layout/BottomNavLayout.tsx` | `appkit/features/layout/BottomNavLayout` | ⬜ Todo |
| `layout/Footer.tsx` | `appkit/features/layout/Footer` (create generic, config prop) | ⬜ Todo |
| `layout/FooterLayout.tsx` | `appkit/features/layout/FooterLayout` | ⬜ Todo |
| `layout/MainNavbar.tsx` | `appkit/features/layout/MainNavbar` (create generic, navItems/config prop) | ⬜ Todo |
| `layout/NavbarLayout.tsx` | `appkit/features/layout/NavbarLayout` | ⬜ Todo |
| `layout/NavItem.tsx` | `appkit/features/layout/NavItem` | ⬜ Todo |
| `layout/Sidebar.tsx` | `appkit/features/layout/Sidebar` (create generic, items prop) | ⬜ Todo |
| `layout/SidebarLayout.tsx` | `appkit/features/layout/SidebarLayout` | ⬜ Todo |
| `layout/TitleBar.tsx` | `appkit/features/layout/TitleBar` (create generic) | ⬜ Todo |
| `layout/TitleBarLayout.tsx` | `appkit/features/layout/TitleBarLayout` | ⬜ Todo |

### products/ stores/ (components)

| File | appkit destination | Status |
|------|--------------------|--------|
| `products/ProductCard.tsx` | `appkit/features/products/ProductCard` | ✅ Deleted |
| `products/ProductGrid.tsx` | `appkit/features/products/ProductGrid` | ✅ Deleted |
| `products/InteractiveProductCard.tsx` | merge into `appkit/features/products/ProductCard` (interactive variant) | ⬜ Todo |
| `products/ProductForm.tsx` | `appkit/features/products/components/ProductForm` | ⬜ Todo |
| `products/ProductSortBar.tsx` | merge with `appkit/ui/components/SortDropdown` | ⬜ Todo |
| `products/ProductTableColumns.tsx` | `appkit/features/products/schema/productTableColumns` | ⬜ Todo |
| `stores/InteractiveStoreCard.tsx` | merge into `appkit/features/stores/StoreCard` (interactive variant) | ⬜ Todo |

### other/

| File | appkit destination | Status |
|------|--------------------|--------|
| `ReviewCard.tsx` | `appkit/features/reviews/ReviewCard` | ✅ Deleted |
| `BlogCard.tsx` | `appkit/features/blog/BlogCard` | ✅ Deleted |
| `EventCard.tsx` | `appkit/features/events/EventCard` | ✅ Deleted |
| `AvatarDisplay.tsx` | `appkit/ui/components/AvatarDisplay` | ⬜ Todo |
| `AvatarUpload.tsx` | `appkit/features/media/AvatarUpload` (create generic with onAbort) | ⬜ Todo |
| `DashboardStatsCard.tsx` | merge with `appkit/ui/components/StatsGrid` | ⬜ Todo |
| `ErrorBoundary.tsx` | `appkit/next/ErrorBoundary` (create generic RSC-compatible) | ⬜ Todo |
| `EventBanner.tsx` | `appkit/features/events/EventBanner` | ⬜ Todo |
| `FormField.tsx` | `appkit/ui/components/FormField` (create generic, replaces DescriptionField) | ⬜ Todo |
| `LayoutClient.tsx` | `appkit/features/layout/LayoutClient` (create generic, providers prop) | ⬜ Todo |
| `PasswordStrengthIndicator.tsx` | `appkit/ui/components/PasswordStrengthIndicator` | ⬜ Todo |
| `RowActionMenu.tsx` | `appkit/ui/components/RowActionMenu` (create generic) | ⬜ Todo |
| `ZodSetup.tsx` | `appkit/validation/ZodSetup` (create generic zod locale init) | ⬜ Todo |

### media/

| File | appkit destination | Status |
|------|--------------------|--------|
| `media/MediaImage.tsx` | `appkit/features/media/MediaImage` (create generic, storageProvider prop) | ⬜ Todo |
| `media/MediaAvatar.tsx` | `appkit/features/media/MediaAvatar` | ⬜ Todo |
| `media/MediaLightbox.tsx` | merge with `appkit/ui/components/ImageLightbox` | ⬜ Todo |
| `media/MediaVideo.tsx` | `appkit/features/media/MediaVideo` (create generic) | ⬜ Todo |

---

## src/hooks — Full Inventory

| File | appkit destination | Status |
|------|--------------------|--------|
| `useMediaUpload` fn | `appkit/features/media/useMediaUpload` | ✅ Deleted |
| `useMediaAbort` fn | `appkit/features/media/useMediaAbort` (create, endpoint injected via config) | ⬜ Todo |
| `useMediaCrop` fn | align generics with `appkit/features/media/useMediaCrop` | ⬜ Todo |
| `useMediaTrim` fn | align generics with `appkit/features/media/useMediaTrim` | ⬜ Todo |
| `useAuth.ts` | `appkit/features/auth/useAuth` | ❓ API diff needed |
| `useLogout.ts` | `appkit/features/auth/hooks/useLogout` (create) | ⬜ Todo |
| `useUrlTable.ts` | `appkit/react/hooks/useUrlTable` | ⬜ Todo |
| `useUnsavedChanges.ts` | `appkit/react/hooks/useUnsavedChanges` | ⬜ Todo |
| `useMessage.ts` | `appkit/react/hooks/useMessage` (create generic) | ⬜ Todo |
| `useAddresses.ts` | `appkit/features/account/hooks/useAddresses` (create) | ⬜ Todo |
| `useAddressForm.ts` | `appkit/features/account/hooks/useAddressForm` (create) | ⬜ Todo |
| `useAddressSelector.ts` | `appkit/features/account/hooks/useAddressSelector` (create) | ⬜ Todo |
| `useAddToCart.ts` | `appkit/features/cart/hooks/useAddToCart` | ❓ API diff needed |
| `useAuthEvent.ts` | `appkit/features/auth/hooks/useAuthEvent` (create) | ⬜ Todo |
| `useBecomeSeller.ts` | `appkit/features/seller/hooks/useBecomeSeller` (create) | ⬜ Todo |
| `useBottomActions.ts` | `appkit/features/layout/hooks/useBottomActions` (create) | ⬜ Todo |
| `useBrands.ts` | `appkit/features/products/hooks/useBrands` (create) | ⬜ Todo |
| `useBulkEvent.ts` | merge with `appkit/react/hooks/useBulkAction` | ❓ API diff needed |
| `useCartCount.ts` | `appkit/features/cart/hooks/useCartCount` | ❓ API diff needed |
| `useGuestCart.ts` | `appkit/features/cart/hooks/useGuestCart` | ❓ API diff needed |
| `useGuestCartMerge.ts` | `appkit/features/cart/hooks/useGuestCartMerge` | ❓ API diff needed |
| `useCategorySelector.ts` | `appkit/features/categories/hooks/useCategorySelector` (create) | ⬜ Todo |
| `useChat.ts` | `appkit/features/chat/hooks/useChat` (create feature) | ⬜ Todo |
| `useCheckout.ts` | `appkit/features/checkout/hooks/useCheckout` | ❓ API diff needed |
| `useCouponValidate.ts` | `appkit/features/promotions/hooks/useCouponValidate` (create) | ⬜ Todo |
| `useFaqVote.ts` | `appkit/features/faq/hooks/useFaqVote` (create) | ⬜ Todo |
| `useHomepageReviews.ts` | `appkit/features/homepage/hooks/useHomepageReviews` (create) | ⬜ Todo |
| `useHomepageSections.ts` | `appkit/features/homepage/hooks/useHomepageSections` | ❓ API diff needed |
| `useNavSuggestions.ts` | `appkit/features/search/hooks/useNavSuggestions` (create) | ⬜ Todo |
| `useNewsletter.ts` | `appkit/features/homepage/hooks/useNewsletter` (create) | ⬜ Todo |
| `useNotifications.ts` | `appkit/features/notifications/hooks/useNotifications` (create feature) | ⬜ Todo |
| `usePaymentEvent.ts` | `appkit/features/payments/hooks/usePaymentEvent` (create) | ⬜ Todo |
| `useProductReviews.ts` | `appkit/features/reviews/hooks/useProductReviews` | ❓ API diff needed |
| `useProfile.ts` | `appkit/features/account/hooks/useProfile` | ❓ API diff needed |
| `useProfileStats.ts` | `appkit/features/account/hooks/useProfileStats` (create) | ⬜ Todo |
| `usePublicProfile.ts` | `appkit/features/account/hooks/usePublicProfile` (create) | ⬜ Todo |
| `useRazorpay.ts` | `appkit/providers/payment/useRazorpay` (create generic, provider-injected) | ⬜ Todo |
| `useRBAC.ts` | `appkit/features/auth/hooks/useRBAC` (create, roles passed via config) | ⬜ Todo |
| `useRealtimeEvent.ts` | `appkit/features/events/hooks/useRealtimeEvent` (create) | ⬜ Todo |
| `useRelatedProducts.ts` | `appkit/features/products/hooks/useRelatedProducts` | ❓ API diff needed |
| `useSellerStorefront.ts` | `appkit/features/seller/hooks/useSellerStorefront` | ❓ API diff needed |
| `useSiteSettings.ts` | `appkit/core/hooks/useSiteSettings` (create, backed by site-config.ts) | ⬜ Todo |
| `useStoreAddressSelector.ts` | `appkit/features/stores/hooks/useStoreAddressSelector` (create) | ⬜ Todo |
| `useWishlistToggle.ts` | `appkit/features/wishlist/hooks/useWishlistToggle` | ❓ API diff needed |

---

## src/features — 19 modules (~375 files)

All components, hooks, types, and constants in every letitrip feature module must move to the matching appkit feature directory. Letitrip keeps only locale-aware `<Link>`/`useRouter` wrappers and `page.tsx` route files.

| Feature | appkit destination | Status |
|---------|--------------------|--------|
| `about/` | `appkit/features/about/` | ⬜ Todo |
| `admin/` hooks (19), views (20+), forms, columns | `appkit/features/admin/` | ⬜ Todo |
| `auth/` components (7) | `appkit/features/auth/` | ⬜ Todo |
| `blog/` components (3) | `appkit/features/blog/` | ⬜ Todo |
| `cart/` components (16), hooks (4) | `appkit/features/cart/` | ⬜ Todo |
| `categories/` components + hooks | `appkit/features/categories/` | ⬜ Todo |
| `contact/` | `appkit/features/contact/` | ⬜ Todo |
| `copilot/` | `appkit/features/copilot/` | ⬜ Todo |
| `events/` components (22), hooks (9), constants (4), types | `appkit/features/events/` | ⬜ Todo |
| `faq/` | `appkit/features/faq/` | ⬜ Todo |
| `homepage/` components (22) | `appkit/features/homepage/` | ⬜ Todo |
| `products/` components (16), hooks | `appkit/features/products/` | ⬜ Todo |
| `promotions/` | `appkit/features/promotions/` | ⬜ Todo |
| `reviews/` + hook | `appkit/features/reviews/` | ⬜ Todo |
| `search/` | `appkit/features/search/` | ⬜ Todo |
| `seller/` components (28), hooks (13) | `appkit/features/seller/` | ⬜ Todo |
| `stores/` components (6), hooks, types, utils | `appkit/features/stores/` | ⬜ Todo |
| `user/` components (22), hooks (4), lib | `appkit/features/account/` | ⬜ Todo |
| `wishlist/` | `appkit/features/wishlist/` | ⬜ Todo |

---

## src/repositories — 26 files (ALL → appkit)

| Repository | appkit destination | Status |
|------------|-------------------|--------|
| `base.repository.ts` | replace with `appkit/contracts/repository.ts` base | ⬜ Delete |
| `copilot-log.repository.ts` | `appkit/core/copilot-log.repository.ts` (already exists) | ⬜ Delete letitrip copy |
| `newsletter.repository.ts` | `appkit/core/newsletter.repository.ts` (already exists) | ⬜ Delete letitrip copy |
| `address.repository.ts` | `appkit/features/account/` | ⬜ Move |
| `bid.repository.ts` | `appkit/features/auctions/` | ⬜ Move |
| `blog.repository.ts` | `appkit/features/blog/` | ⬜ Move |
| `carousel.repository.ts` | `appkit/features/cms/` | ⬜ Move |
| `cart.repository.ts` | `appkit/features/cart/` | ⬜ Move |
| `categories.repository.ts` | `appkit/features/categories/` | ⬜ Move |
| `chat.repository.ts` | `appkit/features/chat/` (create feature) | ⬜ Move |
| `coupons.repository.ts` | `appkit/features/promotions/` | ⬜ Move |
| `event.repository.ts` + `eventEntry.repository.ts` | `appkit/features/events/` | ⬜ Move |
| `failed-checkout.repository.ts` | `appkit/features/checkout/` | ⬜ Move |
| `faqs.repository.ts` | `appkit/features/faq/` | ⬜ Move |
| `homepage-sections.repository.ts` | `appkit/features/homepage/` | ⬜ Move |
| `notification.repository.ts` | `appkit/features/notifications/` (create feature) | ⬜ Move |
| `offer.repository.ts` | `appkit/features/products/` | ⬜ Move |
| `order.repository.ts` | `appkit/features/orders/` | ⬜ Move |
| `payout.repository.ts` | `appkit/features/seller/` | ⬜ Move |
| `product.repository.ts` | `appkit/features/products/` | ⬜ Move |
| `review.repository.ts` | `appkit/features/reviews/` | ⬜ Move |
| `session.repository.ts` | `appkit/features/auth/` | ⬜ Move |
| `site-settings.repository.ts` | consolidate into `appkit/core/site-config.ts` | ⬜ Move |
| `sms-counter.repository.ts` | `appkit/features/auth/` | ⬜ Move |
| `store.repository.ts` + `store-address.repository.ts` | `appkit/features/stores/` | ⬜ Move |
| `token.repository.ts` | `appkit/features/auth/` | ⬜ Move |
| `unit-of-work.ts` | `appkit/core/` | ⬜ Move |
| `user.repository.ts` | `appkit/features/account/` | ⬜ Move |
| `wishlist.repository.ts` | `appkit/features/wishlist/` | ⬜ Move |

---

## src/db — Schema + seed data (ALL → appkit)

| Directory | appkit destination | Status |
|-----------|--------------------|--------|
| `db/schema/*.ts` (25 files) | `appkit/features/*/schema/*.schema.ts` | ⬜ Move |
| `db/seed-data/*.ts` (21 files) | `appkit/src/seed/` | ⬜ Move |
| `db/indices/merge-indices.ts` | `appkit/scripts/` deployment tooling | ⬜ Move |

---

## src/helpers — ALL → appkit

| File | appkit destination | Status |
|------|--------------------|--------|
| `helpers/auth/auth.helper.ts` + `token.helper.ts` | `appkit/features/auth/helpers/` | ⬜ Move |
| `helpers/logging/error-logger.ts` + `server-error-logger.ts` | `appkit/monitoring/` | ⬜ Move |
| `helpers/validation/address.helper.ts` | `appkit/features/account/helpers/` | ⬜ Move |

---

## src/lib — Split: SDK drivers stay, logic moves

| File | Status |
|------|--------|
| `lib/firebase/config.ts`, `client-config.ts`, `auth-server.ts`, `realtime.ts`, `storage.ts` | **Stays** — Firebase project credentials/init |
| `lib/firebase/auth-helpers.ts`, `rtdb-paths.ts`, `realtime-db.ts` | ⬜ Move to `appkit/features/auth/` or `appkit/core/` |
| `lib/payment/razorpay.ts` | **Stays** — Razorpay SDK init (market driver) |
| `lib/shiprocket/*.ts` | **Stays** — Shiprocket SDK init (market driver) |
| `lib/pwa/runtime-caching*.ts` | **Stays** — App-specific service worker config |
| `lib/integration-keys.ts` | **Stays** — Letitrip key constants |
| `lib/email.ts` | ⬜ Move to `appkit/providers/email/` |
| `lib/encryption.ts` | ⬜ Move to `appkit/security/` |
| `lib/pii.ts` | ⬜ Move to `appkit/security/` |
| `lib/api/api-handler.ts` | ⬜ Move to `appkit/next/` |
| `lib/consent-otp.ts` | ⬜ Move to `appkit/features/auth/` |
| `lib/media/finalize.ts` | ⬜ Move to `appkit/features/media/` |
| `lib/monitoring/analytics.ts` | ⬜ Move to `appkit/monitoring/` |
| `lib/query/firebase-sieve.ts` | ⬜ Move to `appkit/core/` |
| `lib/server-logger.ts` | ⬜ Move to `appkit/monitoring/` |
| `lib/tokens.ts` | ⬜ Move to `appkit/features/auth/` |
| `lib/validation/schemas.ts` | ⬜ Move to `appkit/validation/` |

---

## src/constants — Split

| File | Status |
|------|--------|
| `constants/site.ts`, `constants/routes.ts`, `constants/api-endpoints.ts` | **Stays** — App-specific data |
| `constants/config.ts`, `constants/seo.ts` | **Stays** — App config |
| `constants/theme.ts`, `constants/ui.ts` | ⬜ Move to `appkit/tokens/` or `appkit/style/` |
| `constants/rbac.ts` | ⬜ Move to `appkit/features/auth/schema/` |
| `constants/error-messages.ts`, `success-messages.ts`, `messages.ts` | ⬜ Move to appkit i18n |
| `constants/ui-labels-admin.ts`, `ui-labels-core.ts` | ⬜ Move to appkit i18n |
| `constants/faq.ts`, `homepage-data.ts`, `address.ts` | ⬜ Move to appkit feature schemas |

---

## src/utils — ALL → appkit

| File | appkit destination | Status |
|------|--------------------|--------|
| `utils/business-day.ts` | `appkit/utils/` | ⬜ Move |
| `utils/guest-cart.ts` | `appkit/features/cart/utils/` | ⬜ Move |

---

## src/actions — Stays (thin wiring)

All 35 server action files stay here as the correct letitrip-side wiring layer. Each must be as thin as possible: validate input → call appkit repository → return. No inline Firestore reads or business logic.

---

## src/app/ — Routes (thin page wiring)

Page/layout/error/loading files stay here. However:
- Each `page.tsx` must call an appkit `*View.tsx` — no component logic in pages
- `error.tsx` boundaries must call `appkit/next/ErrorBoundary` (create generic)
- `loading.tsx` skeletons should use `appkit/ui` skeleton primitives
- App route layouts call appkit `*Layout` components from `appkit/features/layout/`

---

## src/app/api — 143 routes (stay, but must use appkit internals)

Route handlers are letitrip's. They must import repositories, auth helpers, and request handlers from appkit.

### Already using appkit (90/143) ✅

**admin/** — analytics, bids, blog, coupons, dashboard, events, faqs, newsletter, orders, payouts, payouts/weekly, products, reviews, sessions, sessions/revoke-user, stores, users

**auth/** — event/init, forgot-password, google/callback, google/start, login, logout, me, register, reset-password, send-verification, session, session/activity, session/validate, verify-email

**media/** — crop, delete, trim, upload

**payment/** — create-order, event/init, otp/request, preorder, verify, webhook

**seller/** — analytics, coupons, offers, orders, payout-settings, payouts, products, shipping, shipping/verify-pickup, store, store/addresses

**user/** — addresses, become-seller, change-password, offers, orders, profile, sessions, wishlist

**other/** — bids, cache/revalidate, carousel, cart, cart/merge, chat, checkout, checkout/preflight, contact, copilot/chat, copilot/history, coupons/validate, demo/seed, faqs, logs/write, newsletter/subscribe, notifications, notifications/read-all, notifications/unread-count, pre-orders, products, promotions, realtime/token, reviews, search, profile/add-phone, profile/delete-account, profile/verify-phone, site-settings, webhooks/shiprocket

### No appkit imports — need audit (53/143) ⬜

These almost certainly use inline `@/db` or `@/repositories` imports that need replacing with appkit repositories.

**admin [id]** — blog/[id], coupons/[id], events/[id], events/[id]/entries, events/[id]/entries/[entryId], events/[id]/stats, events/[id]/status, newsletter/[id], orders/[id], orders/[id]/refund, payouts/[id], products/[id], sessions/[id], stores/[uid], users/[uid]

**public CRUD** — blog/[slug], carousel/[id], cart/[itemId], categories, categories/[id], chat/[chatId], chat/[chatId]/messages, events, events/[id], events/[id]/enter, events/[id]/leaderboard, faqs/[id], faqs/[id]/vote, homepage-sections, homepage-sections/[id], notifications/[id], orders/[id]/invoice, products/[id], profile/[userId], profile/[userId]/reviews, realtime/bids/[id], reviews/[id], reviews/[id]/vote, stores, stores/[storeSlug], stores/[storeSlug]/auctions, stores/[storeSlug]/products, stores/[storeSlug]/reviews

**user/seller** — bids/[id], copilot/feedback/[logId], seller/orders/[id]/ship, user/addresses/[id], user/addresses/[id]/set-default, user/orders/[id], user/orders/[id]/cancel, user/sessions/[id], user/wishlist/[productId]

### Migration action for [id] routes

```ts
// ✗ Before — inline db
import { db } from '@/db';
const doc = await db.collection('products').doc(id).get();

// ✓ After — appkit repository
import { registry } from '@mohasinac/appkit/contracts';
const repo = registry.get('product');
const product = await repo.findById(id);
```

---

## Migration Priority Order

| Priority | Item | Why |
|----------|------|-----|
| 1 | `forms/Input`, `Select`, `Textarea`, `Slider`, `Form` | Highest caller count, unblocks many migrations |
| 2 | `feedback/Modal`, `feedback/Toast` | Cross-cutting, used everywhere |
| 3 | `ui/EmptyState`, `ui/Card`, `RowActionMenu` | Widely used primitives |
| 4 | `forms/Checkbox`, `Radio`, `Toggle` | Complete forms layer |
| 5 | `useUrlTable`, `useUnsavedChanges` | Already in appkit, quick wins |
| 6 | `layout/` all files | Creates clean layout shell in appkit |
| 7 | `filters/` all files | Move to appkit feature dirs |
| 8 | `ErrorBoundary`, `ZodSetup`, `LayoutClient` | Infrastructure pieces |
| 9 | `src/repositories/` — start copilot-log + newsletter (zero work) | Quick wins |
| 10 | `src/db/schema/` | No caller changes, just file moves |
| 11 | `src/features/reviews/`, `wishlist/`, `promotions/` | Smallest features |
| 12 | `src/features/search/`, `faq/`, `contact/`, `blog/` | Small-medium |
| 13 | `src/features/cart/`, `products/`, `user/` | Larger features |
| 14 | `src/features/admin/`, `seller/` | Largest — tackle last |
| 15 | API route audit for 53 local-only routes | Replace @/db with appkit repos |

---

## Completed Deletions Log

### Prior sessions
- `src/features/faq/components/FAQAccordion.tsx`
- `src/features/products/components/ProductTabs.tsx`
- `src/features/stores/components/StoreNavTabs.tsx`
- `src/features/homepage/components/AdvertisementBanner.tsx`
- `src/features/homepage/components/FAQSection.tsx`
- `src/components/ui/SectionTabs.tsx`
- `src/components/ReviewCard.tsx`
- `src/components/layout/LocaleSwitcher.tsx`
- `src/components/BlogCard.tsx`
- `src/components/EventCard.tsx`
- `src/components/products/ProductGrid.tsx`
- `src/components/products/ProductCard.tsx`

### 2026-04-14 (this session)
- `src/components/ui/ActiveFilterChips.tsx` — migrated all callers + type imports to `@mohasinac/appkit/ui`
- `src/components/feedback/Alert.tsx` — migrated all callers to `@mohasinac/appkit/ui`
- `useMediaUpload` function — removed from `src/hooks/useMediaUpload.ts`, migrated 10 callers to `@mohasinac/appkit/features/media`
- Fixed JSX bugs: `DemoSeedView.tsx`, `PublicProfileView.tsx`
