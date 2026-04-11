# Prune Candidates — letitrip.in

Files and modules in `letitrip.in/src` that duplicate code already present in `appkit`, or whose bodies belong in appkit as reusable primitives. Organised by removal confidence and work required.

**Last updated:** April 12 2026 — synced against both `letitrip.in/index.md` and `appkit/index.md`.

---

## Legend

| Symbol | Meaning |
|--------|---------|
| ✅ | Already landed in appkit — prune letitrip copy when consumers are updated |
| 🔴 | Thin shim / re-export — delete immediately once imports are redirected |
| 🟠 | Direct 1-for-1 duplicate — replace import path, then delete |
| 🟡 | Same logical component but letitrip version is adapter/glue — keep minimal glue, remove body |
| 🟢 | Missing appkit piece — migration requires coordinated change (implement in appkit first) |

---

## 1. Thin Shims & Re-exports (🔴 immediate)

These letitrip files do nothing but re-export from `@mohasinac/appkit`. Once all consumers import directly from appkit, delete the shim.

| letitrip file | Delegates to (appkit) | Status |
|---|---|---|
| `src/lib/monitoring/error-tracking.ts` | `appkit/monitoring` → `error-tracking.ts` | 🔴 shim |
| `src/lib/monitoring/runtime.ts` | `appkit/monitoring` → `runtime.ts` | 🔴 shim |
| `src/lib/monitoring/performance.ts` | `appkit/monitoring` → `performance.ts` | 🔴 shim |
| `src/lib/api/cache-middleware.ts` | `appkit/next` → `cache-middleware.ts` | 🔴 shim |
| `src/lib/api-response.ts` | `appkit/next/api` → `api-response.ts` | 🔴 shim |
| `src/lib/firebase/firestore-helpers.ts` | `appkit/providers/db-firebase` → `helpers.ts` | 🔴 shim |
| `src/utils/converters/cookie.converter.ts` | `appkit/utils` → `cookie.converter.ts` | 🔴 shim |
| `src/utils/formatters/date.formatter.ts` | `appkit/utils` → `date.formatter.ts` | 🔴 shim |
| `src/utils/formatters/number.formatter.ts` | `appkit/utils` → `number.formatter.ts` | 🔴 shim |
| `src/utils/formatters/string.formatter.ts` | `appkit/utils` → `string.formatter.ts` | 🔴 shim |
| `src/utils/validators/email.validator.ts` | `appkit/validation` → `email.validator.ts` | 🔴 shim |
| `src/utils/validators/phone.validator.ts` | `appkit/validation` → `phone.validator.ts` | 🔴 shim |
| `src/utils/validators/password.validator.ts` | `appkit/validation` → `password.validator.ts` | 🔴 shim |
| `src/utils/validators/input.validator.ts` | `appkit/validation` → `input.validator.ts` | 🔴 shim |
| `src/utils/validators/url.validator.ts` | `appkit/validation` → `url.validator.ts` | 🔴 shim |
| `src/utils/events/event-manager.ts` | `appkit/utils` → `event-manager.ts` | 🔴 shim |
| `src/features/blog/components/BlogFeaturedCard.tsx` | `appkit/features/blog/components/BlogFeaturedCard.tsx` | 🔴 shim |
| `src/features/faq/components/FAQCategorySidebar.tsx` | `appkit/features/faq/components/` | 🔴 shim |
| `src/features/faq/components/FAQSortDropdown.tsx` | `appkit/features/faq/components/` | 🔴 shim |
| `src/features/faq/components/RelatedFAQs.tsx` | `appkit/features/faq/components/` | 🔴 shim |
| `src/features/faq/components/ContactCTA.tsx` | `appkit/features/faq/components/` | 🔴 shim |
| `src/features/homepage/components/HomepageSkeleton.tsx` | `appkit/features/homepage/components/HomepageSkeleton.tsx` | 🔴 shim |
| `src/features/homepage/components/SectionCarousel.tsx` | `appkit/features/homepage/components/SectionCarousel.tsx` | 🔴 shim |
| `src/lib/api/request-helpers.ts` | `appkit/next` → `request-helpers.ts` | 🔴 shim |

> **Already deleted:** `src/lib/monitoring/cache-metrics.ts` ✅

---

## 2. Homepage Thin-Adapter Components (🟡 keep minimal glue only)

The letitrip file should contain nothing but a re-export or props-passing wrapper. The component body must live entirely in appkit.

| letitrip file | appkit equivalent |
|---|---|
| `src/features/homepage/components/AdvertisementBanner.tsx` | `appkit/src/features/homepage/components/AdvertisementBanner.tsx` |
| `src/features/homepage/components/CustomerReviewsSection.tsx` | `appkit/src/features/homepage/components/CustomerReviewsSection.tsx` |
| `src/features/homepage/components/FAQSection.tsx` | `appkit/src/features/homepage/components/FAQSection.tsx` |
| `src/features/homepage/components/HowItWorksSection.tsx` | `appkit/src/features/homepage/components/HowItWorksSection.tsx` |
| `src/features/homepage/components/NewsletterSection.tsx` | `appkit/src/features/homepage/components/NewsletterSection.tsx` |
| `src/features/homepage/components/SecurityHighlightsSection.tsx` | `appkit/src/features/homepage/components/SecurityHighlightsSection.tsx` |

---

## 3. Feature View Duplicates (🟠 replace import, delete local)

Identical views exist in appkit. Replace usages with the appkit import, then delete the letitrip copy.

### 3a. Admin views

| letitrip file | appkit path |
|---|---|
| `src/features/admin/components/AdminAnalyticsView.tsx` | `src/features/admin/components/AdminAnalyticsView.tsx` |
| `src/features/admin/components/AdminBidsView.tsx` | `src/features/admin/components/AdminBidsView.tsx` |
| `src/features/admin/components/AdminBlogView.tsx` | `src/features/admin/components/AdminBlogView.tsx` |
| `src/features/admin/components/AdminCarouselView.tsx` | `src/features/admin/components/AdminCarouselView.tsx` |
| `src/features/admin/components/AdminCategoriesView.tsx` | `src/features/admin/components/AdminCategoriesView.tsx` |
| `src/features/copilot/components/AdminCopilotView.tsx` | `src/features/copilot/components/AdminCopilotView.tsx` |
| `src/features/admin/components/AdminCouponsView.tsx` | `src/features/admin/components/AdminCouponsView.tsx` |
| `src/features/admin/components/AdminDashboardView.tsx` | `src/features/admin/components/AdminDashboardView.tsx` |
| `src/features/events/components/AdminEventEntriesView.tsx` | `src/features/events/components/AdminEventEntriesView.tsx` |
| `src/features/events/components/AdminEventsView.tsx` | `src/features/events/components/AdminEventsView.tsx` |
| `src/features/admin/components/AdminFaqsView.tsx` | `src/features/admin/components/AdminFaqsView.tsx` |
| `src/features/admin/components/AdminFeatureFlagsView.tsx` | `src/features/admin/components/AdminFeatureFlagsView.tsx` |
| `src/features/admin/components/AdminMediaView.tsx` | `src/features/admin/components/AdminMediaView.tsx` |
| `src/features/admin/components/AdminNavigationView.tsx` | `src/features/admin/components/AdminNavigationView.tsx` |
| `src/features/admin/components/AdminOrdersView.tsx` | `src/features/admin/components/AdminOrdersView.tsx` |
| `src/features/admin/components/AdminPayoutsView.tsx` | `src/features/admin/components/AdminPayoutsView.tsx` |
| `src/features/admin/components/AdminProductsView.tsx` | `src/features/admin/components/AdminProductsView.tsx` |
| `src/features/admin/components/AdminReviewsView.tsx` | `src/features/admin/components/AdminReviewsView.tsx` |
| `src/features/admin/components/AdminSectionsView.tsx` | `src/features/admin/components/AdminSectionsView.tsx` |
| `src/features/admin/components/AdminSessionsManager.tsx` | `src/features/admin/components/AdminSessionsManager.tsx` |
| `src/features/admin/components/AdminSidebar.tsx` | `src/features/admin/components/AdminSidebar.tsx` |
| `src/features/admin/components/AdminSiteView.tsx` | `src/features/admin/components/AdminSiteView.tsx` |
| `src/features/admin/components/AdminStoresView.tsx` | `src/features/admin/components/AdminStoresView.tsx` |
| `src/features/admin/components/AdminTopBar.tsx` | `src/features/admin/components/AdminTopBar.tsx` |
| `src/features/admin/components/AdminUsersView.tsx` | `src/features/admin/components/AdminUsersView.tsx` |
| `src/features/admin/components/AlgoliaDashboardView.tsx` | `src/features/admin/components/AlgoliaDashboardView.tsx` |

### 3b. Auth views

| letitrip file | appkit path |
|---|---|
| `src/features/auth/components/ForgotPasswordView.tsx` | `src/features/auth/components/ForgotPasswordView.tsx` |
| `src/features/auth/components/LoginForm.tsx` | `src/features/auth/components/LoginForm.tsx` |
| `src/features/auth/components/RegisterForm.tsx` | `src/features/auth/components/RegisterForm.tsx` |
| `src/features/auth/components/ResetPasswordView.tsx` | `src/features/auth/components/ResetPasswordView.tsx` |

### 3c. Blog views

| letitrip file | appkit path |
|---|---|
| `src/features/blog/components/BlogListView.tsx` | `src/features/blog/components/BlogListView.tsx` |
| `src/features/blog/components/BlogPostView.tsx` | `src/features/blog/components/BlogPostView.tsx` |

### 3d. Cart / Checkout views

| letitrip file | appkit path |
|---|---|
| `src/features/cart/components/CartSummary.tsx` | `src/features/cart/components/CartSummary.tsx` |
| `src/features/cart/components/CartView.tsx` | `src/features/cart/components/CartView.tsx` |
| `src/features/cart/components/CheckoutAddressStep.tsx` | `src/features/cart/components/CheckoutAddressStep.tsx` |
| `src/features/cart/components/CheckoutOtpModal.tsx` | `src/features/cart/components/CheckoutOtpModal.tsx` |
| `src/features/cart/components/CheckoutSuccessView.tsx` | `src/features/cart/components/CheckoutSuccessView.tsx` |
| `src/features/cart/components/CheckoutView.tsx` | `src/features/cart/components/CheckoutView.tsx` |

### 3e. Category views

| letitrip file | appkit path |
|---|---|
| `src/features/categories/components/CategoriesListView.tsx` | `src/features/categories/components/CategoriesListView.tsx` |
| `src/features/categories/components/CategoryGrid.tsx` | `src/features/categories/components/CategoryGrid.tsx` |
| `src/features/categories/components/CategoryProductsView.tsx` | `src/features/categories/components/CategoryProductsView.tsx` |

### 3f. Contact / FAQ views

| letitrip file | appkit path |
|---|---|
| `src/features/contact/components/ContactForm.tsx` | `src/features/contact/components/ContactForm.tsx` |
| `src/features/contact/components/ContactInfoSidebar.tsx` | `src/features/contact/components/ContactInfoSidebar.tsx` |
| `src/features/faq/components/FAQAccordion.tsx` | `src/features/faq/components/FAQAccordion.tsx` |
| `src/features/faq/components/FAQHelpfulButtons.tsx` | `src/features/faq/components/FAQHelpfulButtons.tsx` |
| `src/features/faq/components/FAQPageContent.tsx` | `src/features/faq/components/FAQPageContent.tsx` |

### 3g. Events views

| letitrip file | appkit path |
|---|---|
| `src/components/EventCard.tsx` | `src/features/events/components/EventCard.tsx` |
| `src/features/events/components/EventDetailView.tsx` | `src/features/events/components/EventDetailView.tsx` |
| `src/features/events/components/EventFormDrawer.tsx` | `src/features/events/components/EventFormDrawer.tsx` |
| `src/features/events/components/EventLeaderboard.tsx` | `src/features/events/components/EventLeaderboard.tsx` |
| `src/features/events/components/EventParticipateView.tsx` | `src/features/events/components/EventParticipateView.tsx` |
| `src/features/events/components/EventsListView.tsx` | `src/features/events/components/EventsListView.tsx` |
| `src/features/events/components/EventStatusBadge.tsx` | `src/features/events/components/EventStatusBadge.tsx` |

### 3h. Homepage components

| letitrip file | appkit path |
|---|---|
| `src/features/homepage/components/BeforeAfterCard.tsx` | `src/features/homepage/components/BeforeAfterCard.tsx` |
| `src/features/homepage/components/FeaturedResultsSection.tsx` | `src/features/homepage/components/FeaturedResultsSection.tsx` |
| `src/features/homepage/components/HeroCarousel.tsx` | `src/features/homepage/components/HeroCarousel.tsx` |
| `src/features/homepage/components/HomepageView.tsx` | `src/features/homepage/components/HomepageView.tsx` |
| `src/features/homepage/components/HowItWorksInfoView.tsx` | `src/features/homepage/components/HowItWorksInfoView.tsx` |
| `src/features/homepage/components/SiteFeaturesSection.tsx` | `src/features/homepage/components/SiteFeaturesSection.tsx` |
| `src/features/homepage/components/StatsCounterSection.tsx` | `src/features/homepage/components/StatsCounterSection.tsx` |
| `src/features/homepage/components/TrustFeaturesSection.tsx` | `src/features/homepage/components/TrustFeaturesSection.tsx` |
| `src/features/homepage/components/TrustIndicatorsSection.tsx` | `src/features/homepage/components/TrustIndicatorsSection.tsx` |
| `src/features/homepage/components/WelcomeSection.tsx` | `src/features/homepage/components/WelcomeSection.tsx` |
| `src/features/homepage/components/WhatsAppCommunitySection.tsx` | `src/features/homepage/components/WhatsAppCommunitySection.tsx` |

### 3i. Products views

| letitrip file | appkit path |
|---|---|
| `src/features/products/components/AuctionDetailView.tsx` | `src/features/products/components/AuctionDetailView.tsx` |
| `src/features/products/components/AuctionsView.tsx` | `src/features/products/components/AuctionsView.tsx` |
| `src/features/products/components/BidHistory.tsx` | `src/features/products/components/BidHistory.tsx` |
| `src/features/products/components/MakeOfferForm.tsx` | `src/features/products/components/MakeOfferForm.tsx` |
| `src/features/products/components/PlaceBidForm.tsx` | `src/features/products/components/PlaceBidForm.tsx` |
| `src/features/products/components/PreOrderDetailView.tsx` | `src/features/products/components/PreOrderDetailView.tsx` |
| `src/features/products/components/PreOrdersView.tsx` | `src/features/products/components/PreOrdersView.tsx` |
| `src/features/products/components/ProductDetailView.tsx` | `src/features/products/components/ProductDetailView.tsx` |
| `src/features/products/components/ProductFeatureBadges.tsx` | `src/features/products/components/ProductFeatureBadges.tsx` |
| `src/features/products/components/ProductInfo.tsx` | `src/features/products/components/ProductInfo.tsx` |
| `src/features/products/components/ProductsView.tsx` | `src/features/products/components/ProductsView.tsx` |
| `src/features/products/components/ProductTabs.tsx` | `src/features/products/components/ProductTabs.tsx` |
| `src/features/products/components/RelatedProducts.tsx` | `src/features/products/components/RelatedProducts.tsx` |

### 3j. Seller views

| letitrip file | appkit path |
|---|---|
| `src/features/seller/components/SellerAddressesView.tsx` | `src/features/seller/components/SellerAddressesView.tsx` |
| `src/features/seller/components/SellerAnalyticsView.tsx` | `src/features/seller/components/SellerAnalyticsView.tsx` |
| `src/features/seller/components/SellerAuctionsView.tsx` | `src/features/seller/components/SellerAuctionsView.tsx` |
| `src/features/seller/components/SellerCouponsView.tsx` | `src/features/seller/components/SellerCouponsView.tsx` |
| `src/features/seller/components/SellerCreateProductView.tsx` | `src/features/seller/components/SellerCreateProductView.tsx` |
| `src/features/seller/components/SellerDashboardView.tsx` | `src/features/seller/components/SellerDashboardView.tsx` |
| `src/features/seller/components/SellerEditProductView.tsx` | `src/features/seller/components/SellerEditProductView.tsx` |
| `src/features/seller/components/SellerGuideView.tsx` | `src/features/seller/components/SellerGuideView.tsx` |
| `src/features/seller/components/SellerOffersView.tsx` | `src/features/seller/components/SellerOffersView.tsx` |
| `src/features/seller/components/SellerOrdersView.tsx` | `src/features/seller/components/SellerOrdersView.tsx` |
| `src/features/seller/components/SellerPayoutHistoryTable.tsx` | `src/features/seller/components/SellerPayoutHistoryTable.tsx` |
| `src/features/seller/components/SellerPayoutSettingsView.tsx` | `src/features/seller/components/SellerPayoutSettingsView.tsx` |
| `src/features/seller/components/SellerPayoutStats.tsx` | `src/features/seller/components/SellerPayoutStats.tsx` |
| `src/features/seller/components/SellerPayoutsView.tsx` | `src/features/seller/components/SellerPayoutsView.tsx` |
| `src/features/seller/components/SellerProductsView.tsx` | `src/features/seller/components/SellerProductsView.tsx` |
| `src/features/seller/components/SellerShippingView.tsx` | `src/features/seller/components/SellerShippingView.tsx` |
| `src/features/seller/components/SellerSidebar.tsx` | `src/features/seller/components/SellerSidebar.tsx` |
| `src/features/seller/components/SellersListView.tsx` | `src/features/seller/components/SellersListView.tsx` |
| `src/features/seller/components/SellerStatCard.tsx` | `src/features/seller/components/SellerStatCard.tsx` |
| `src/features/seller/components/SellerStorefrontView.tsx` | `src/features/seller/components/SellerStorefrontView.tsx` |
| `src/features/seller/components/SellerStoreSetupView.tsx` | `src/features/seller/components/SellerStoreSetupView.tsx` |
| `src/features/seller/components/SellerStoreView.tsx` | `src/features/seller/components/SellerStoreView.tsx` |

### 3k. User / Account views

appkit now has a full `src/features/account/components/` module. These letitrip user views are direct duplicates:

| letitrip file | appkit path |
|---|---|
| `src/features/user/components/BecomeSellerView.tsx` | `src/features/account/components/BecomeSellerView.tsx` |
| `src/features/user/components/ChatList.tsx` | `src/features/account/components/ChatList.tsx` |
| `src/features/user/components/ChatWindow.tsx` | `src/features/account/components/ChatWindow.tsx` |
| `src/features/user/components/MessagesView.tsx` | `src/features/account/components/MessagesView.tsx` |
| `src/features/user/components/OrderDetailView.tsx` | `src/features/account/components/OrderDetailView.tsx` |
| `src/features/user/components/ProfileView.tsx` | `src/features/account/components/ProfileView.tsx` |
| `src/features/user/components/UserAccountHub.tsx` | `src/features/account/components/UserAccountHubView.tsx` |
| `src/features/user/components/UserAddressesView.tsx` | `src/features/account/components/UserAddressesView.tsx` |
| `src/features/user/components/UserNotificationsView.tsx` | `src/features/account/components/UserNotificationsView.tsx` |
| `src/features/user/components/UserOffersView.tsx` | `src/features/account/components/UserOffersView.tsx` |
| `src/features/user/components/UserOrdersView.tsx` | `src/features/account/components/UserOrdersView.tsx` |
| `src/features/user/components/UserOrderTrackView.tsx` | `src/features/account/components/UserOrderTrackView.tsx` |
| `src/features/user/components/UserSettingsView.tsx` | `src/features/account/components/UserSettingsView.tsx` |
| `src/features/user/components/UserSidebar.tsx` | `src/features/user/components/UserSidebar.tsx` (appkit) |

**Keep in letitrip (no appkit equivalent yet):**
`AccountInfoCard.tsx`, `AddAddressView.tsx`, `EmailVerificationCard.tsx`, `NotificationItem.tsx`, `NotificationsBulkActions.tsx`, `OrderTrackingView.tsx`, `PasswordChangeForm.tsx`, `PhoneVerificationCard.tsx`, `ProfileHeader.tsx`, `ProfileInfoForm.tsx`, `ProfileStatsGrid.tsx`, `PublicProfileView.tsx`, `UserEditAddressView.tsx`

### 3l. Reviews / Promotions / Search views

| letitrip file | appkit path |
|---|---|
| `src/features/promotions/components/CouponCard.tsx` | `src/features/promotions/components/CouponCard.tsx` |
| `src/features/promotions/components/PromotionsView.tsx` | `src/features/promotions/components/PromotionsView.tsx` |
| `src/features/reviews/components/ReviewsListView.tsx` | `src/features/reviews/components/ReviewsListView.tsx` |
| `src/features/search/components/SearchFiltersRow.tsx` | `src/features/search/components/SearchFiltersRow.tsx` |
| `src/features/search/components/SearchResultsSection.tsx` | `src/features/search/components/SearchResultsSection.tsx` |
| `src/features/search/components/SearchView.tsx` | `src/features/search/components/SearchView.tsx` |

### 3m. About views

| letitrip file | appkit path |
|---|---|
| `src/features/about/components/AboutView.tsx` | `src/features/about/components/AboutView.tsx` |

### 3n. Layout components

| letitrip file | appkit path | Note |
|---|---|---|
| `src/components/layout/AutoBreadcrumbs.tsx` | `src/features/layout/AutoBreadcrumbs.tsx` | |
| `src/components/layout/BottomNavLayout.tsx` | `src/features/layout/BottomNavLayout.tsx` | |
| `src/components/layout/Breadcrumbs.tsx` | `src/features/layout/Breadcrumbs.tsx` | |
| `src/components/layout/FooterLayout.tsx` | `src/features/layout/FooterLayout.tsx` | |
| `src/components/layout/NavbarLayout.tsx` | `src/features/layout/NavbarLayout.tsx` | |
| `src/components/layout/SidebarLayout.tsx` | `src/features/layout/SidebarLayout.tsx` | |
| `src/components/utility/BackToTop.tsx` | `src/features/layout/BackToTop.tsx` | appkit also exports `SkipToMain` from same file |

### 3o. Media components

| letitrip file | appkit path |
|---|---|
| `src/components/media/MediaAvatar.tsx` | `src/features/media/MediaAvatar.tsx` |
| `src/components/media/MediaImage.tsx` | `src/features/media/MediaImage.tsx` |
| `src/components/media/MediaLightbox.tsx` | `src/features/media/MediaLightbox.tsx` |
| `src/components/media/MediaVideo.tsx` | `src/features/media/MediaVideo.tsx` |

### 3p. UI primitives

| letitrip file | appkit path | Note |
|---|---|---|
| `src/components/ui/Accordion.tsx` | `src/ui/components/Accordion.tsx` | letitrip exports `AccordionItem` which appkit is **missing** — extend appkit first (§7) |
| `src/components/ui/ActiveFilterChips.tsx` | `src/ui/components/ActiveFilterChips.tsx` | direct duplicate |
| `src/components/feedback/Alert.tsx` | `src/ui/components/Alert.tsx` | direct duplicate |

---

## 4. Error Handling — Now Fully in Appkit (✅ prune when imports updated)

| letitrip file | appkit location | Status |
|---|---|---|
| `src/components/ErrorBoundary.tsx` | `src/react/ErrorBoundary.tsx` | ✅ done |
| `src/app/global-error.tsx` | `src/next/components/GlobalError.tsx` | ✅ base component |
| `src/app/[locale]/not-found.tsx` | `src/next/components/NotFoundView.tsx` | ✅ base component |
| `src/app/[locale]/unauthorized/page.tsx` | `src/next/components/UnauthorizedView.tsx` | ✅ done |
| `src/app/[locale]/error.tsx` | `src/next/components/ErrorView.tsx` | ✅ done |
| `src/lib/monitoring/runtime.ts` | `src/monitoring/runtime.ts` | ✅ shim only |
| `src/lib/api-response.ts` | `src/next/api/api-response.ts` | ✅ shim only |
| `src/helpers/logging/error-logger.ts` | `src/monitoring/client-logger.ts` | ✅ done |
| `src/helpers/logging/server-error-logger.ts` | `src/monitoring/server-logger.ts` | ✅ done |
| `src/lib/server-logger.ts` | `src/monitoring/server-logger.ts` | ✅ collapse shim |
| `src/lib/monitoring/performance.ts` | `src/monitoring/performance.ts` | ✅ shim only |
| `src/repositories/newsletter.repository.ts` | `src/core/newsletter.repository.ts` | ✅ done |

---

## 5. SSR Foundation — Now Fully in Appkit (✅ prune when imports updated)

| letitrip file | appkit location | Status |
|---|---|---|
| `src/constants/routes.ts` | `src/next/routing/route-map.ts` | ✅ `createRouteMap()`, `ROUTES`, `RouteMap` |
| `src/constants/seo.ts` | `src/seo/metadata.ts` | ✅ `SeoConfig`, `generateMetadata()`, `createSeoConfig()` |

---

## 6. Utility Duplicates (🟠 both copies exist — shim then delete letitrip copy)

| letitrip file | appkit path | Exported API |
|---|---|---|
| `src/utils/business-day.ts` | `src/utils/business-day.ts` | `getBusinessDayStart`, `getBusinessDaysElapsed`, `getBusinessDaysRemaining`, `getBusinessDayEligibilityDate` |
| `src/utils/id-generators.ts` | `src/utils/id-generators.ts` | `generateCategoryId`, `generateUserId`, `generateProductId`, `generateAuctionId` +52 |
| `src/utils/order-splitter.ts` | `src/features/orders/utils/order-splitter.ts` | `splitCartIntoOrderGroups`, `OrderGroup` |
| `src/utils/guest-cart.ts` | `src/features/cart/utils/guest-cart.ts` | `getGuestCartItems`, `addToGuestCart`, `removeFromGuestCart`, `updateGuestCartQuantity` +6 |
| `src/components/filters/FilterPanel.tsx` | `src/features/filters/FilterPanel.tsx` | `FilterPanel`, `FacetSingleConfig`, `FacetMultiConfig`, `SwitchConfig` |
| `src/components/filters/filterUtils.ts` | `src/features/filters/filterUtils.ts` | `getFilterLabel`, `getFilterValue`, `FilterOption` |
| `src/components/ui/FilterFacetSection.tsx` | `src/features/filters/FilterFacetSection.tsx` | `FilterFacetSection`, `FacetOption`, `FilterFacetSectionProps` |
| `src/components/layout/BackToTop.tsx` | `src/features/layout/BackToTop.tsx` | `BackToTop`, `SkipToMain` |
| `src/helpers/auth/auth.helper.ts` | `src/security/authorization.ts` + RBAC hooks | `hasRole`, `hasAnyRole`, `getDefaultRole`, `formatAuthProvider` |
| `src/lib/firebase/admin.ts` | `src/providers/db-firebase/admin.ts` | `getAdminApp`, `getAdminAuth`, `getAdminDb`, `getAdminStorage` |

---

## 7. UI Primitives Missing From Appkit (🟢 move body to appkit, then shim)

Generic, project-agnostic UI primitives in letitrip `src/components/ui/` with no equivalent in `appkit/src/ui/components/`. Must be implemented in appkit first, then letitrip shims replaced.

| letitrip file | Target appkit path | Exported API |
|---|---|---|
| `src/components/ui/Accordion.tsx` | `src/ui/components/Accordion.tsx` | `fn Accordion`, **`fn AccordionItem`** (missing from appkit), `AccordionProps`, `AccordionItemProps` |
| `src/components/ui/Avatar.tsx` | `src/ui/components/Avatar.tsx` | `fn Avatar`, `fn AvatarGroup`, `AvatarProps`, `AvatarGroupProps` |
| `src/components/ui/BaseListingCard.tsx` | `src/ui/components/BaseListingCard.tsx` | `BaseListingCard`, `BaseListingCardRootProps`, `BaseListingCardHeroProps`, `BaseListingCardInfoProps` |
| `src/components/ui/Card.tsx` | `src/ui/components/Card.tsx` | `fn Card`, `fn CardHeader`, `fn CardBody`, `fn CardFooter` |
| `src/components/ui/Dropdown.tsx` | `src/ui/components/Dropdown.tsx` | `DropdownProps`, `DropdownTriggerProps`, `DropdownMenuProps`, `DropdownItemProps` |
| `src/components/ui/DynamicSelect.tsx` | `src/ui/components/DynamicSelect.tsx` | `fn DynamicSelect`, `DynamicSelectOption`, `AsyncPage`, `DynamicSelectProps` |
| `src/components/ui/EmptyState.tsx` | `src/ui/components/EmptyState.tsx` | `fn EmptyState` |
| `src/components/ui/FilterDrawer.tsx` | `src/ui/components/FilterDrawer.tsx` | `fn FilterDrawer` |
| `src/components/ui/FlowDiagram.tsx` | `src/ui/components/FlowDiagram.tsx` | `fn FlowDiagram`, `FlowStep`, `FlowDiagramProps` |
| `src/components/ui/ImageGallery.tsx` | `src/ui/components/ImageGallery.tsx` | `fn ImageGallery`, `GalleryImage` |
| `src/components/ui/Menu.tsx` | `src/ui/components/Menu.tsx` | `MenuProps`, `MenuTriggerProps`, `MenuContentProps`, `MenuItemProps` |
| `src/components/ui/RoleBadge.tsx` | `src/ui/components/RoleBadge.tsx` | `fn RoleBadge` |
| `src/components/ui/SectionTabs.tsx` | `src/ui/components/SectionTabs.tsx` | `fn SectionTabs` |
| `src/components/ui/SideDrawer.tsx` | `src/ui/components/SideDrawer.tsx` | `fn SideDrawer` |
| `src/components/ui/Tabs.tsx` | `src/ui/components/Tabs.tsx` | `fn Tabs` |
| `src/components/feedback/Modal.tsx` | `src/ui/components/Modal.tsx` | `fn Modal`, **`fn ModalFooter`** (missing from appkit's current export) |
| `src/components/feedback/Toast.tsx` | `src/ui/components/Toast.tsx` | `fn Toast`, `fn ToastProvider`, `useToast` |

---

## 8. Shared General Components Missing From Appkit (🟢 move body to appkit)

Domain-adjacent, broadly reusable components that belong in appkit.

| letitrip file | Target appkit path | Notes |
|---|---|---|
| `src/components/AvatarDisplay.tsx` | `src/ui/components/AvatarDisplay.tsx` | Renders initials from `displayName`/`email` — generic cross-project |
| `src/components/AvatarUpload.tsx` | `src/features/media/upload/AvatarUpload.tsx` | Avatar crop/upload — belongs in media upload feature |
| `src/components/PasswordStrengthIndicator.tsx` | `src/ui/components/PasswordStrengthIndicator.tsx` | Works with appkit `PasswordStrength` type from `password.validator.ts` |
| `src/components/RowActionMenu.tsx` | `src/ui/components/RowActionMenu.tsx` | Generic table-row action dropdown — domain-agnostic |
| `src/components/DashboardStatsCard.tsx` | `src/features/admin/components/analytics/DashboardStatsCard.tsx` | Appkit has `AdminStatCard`; merge or create alias |
| `src/components/LayoutClient.tsx` | `src/next/components/LayoutClient.tsx` | Bottom-actions bar margin adjuster — generic layout utility |
| `src/components/EventBanner.tsx` | `src/features/events/components/EventBanner.tsx` | Session-storage-guarded banner — reusable across projects |
| `src/components/utility/BackgroundRenderer.tsx` | `src/features/layout/BackgroundRenderer.tsx` | Video/image/gradient background renderer — site-agnostic |
| `src/components/utility/ResponsiveView.tsx` | `src/react/ResponsiveView.tsx` | Viewport-responsive show/hide wrapper |
| `src/components/modals/ConfirmDeleteModal.tsx` | `src/ui/components/ConfirmDeleteModal.tsx` | Generic destructive-action confirmation modal |
| `src/components/FormField.tsx` | Merge into `src/ui/components/FormGrid.tsx` | Richer form field (media, select, text) — extend appkit `FormField` |

---

## 9. Admin UI Primitives Missing From Appkit (🟢 move to appkit admin feature)

Generic admin-surface components used by every admin panel — should live in `appkit/src/features/admin/components/`.

| letitrip file | Target appkit path | Exported API |
|---|---|---|
| `src/components/admin/AdminFilterBar.tsx` | `src/features/admin/components/AdminFilterBar.tsx` | `fn AdminFilterBar` |
| `src/components/admin/AdminPageHeader.tsx` | `src/features/admin/components/AdminPageHeader.tsx` | `fn AdminPageHeader` |
| `src/components/admin/DrawerFormFooter.tsx` | `src/features/admin/components/DrawerFormFooter.tsx` | `fn DrawerFormFooter` |
| `src/features/admin/components/AdminDashboardSkeleton.tsx` | `src/features/admin/components/AdminDashboardSkeleton.tsx` | `fn AdminDashboardSkeleton` |
| `src/features/admin/components/AdminStatsCards.tsx` | `src/features/admin/components/analytics/AdminStatsCards.tsx` | `fn AdminStatsCards` |
| `src/features/admin/components/AdminPriorityAlerts.tsx` | `src/features/admin/components/AdminPriorityAlerts.tsx` | `fn AdminPriorityAlerts` |
| `src/features/admin/components/GridEditor.tsx` | `src/features/admin/components/GridEditor.tsx` | `fn GridEditor` — generic drag-and-drop grid |

---

## 10. Admin Form Components Missing From Appkit (🟢 move to appkit)

Domain-specific admin forms that should be in appkit so `licorice` and `hobson` can reuse them.

| letitrip file | Target appkit path | Notes |
|---|---|---|
| `src/features/admin/components/BlogForm.tsx` | `src/features/blog/components/BlogForm.tsx` | Create/edit blog post form |
| `src/features/admin/components/CarouselSlideForm.tsx` | `src/features/admin/components/CarouselSlideForm.tsx` | Carousel slide CRUD form |
| `src/features/admin/components/CouponForm.tsx` | `src/features/promotions/components/CouponForm.tsx` | Coupon CRUD form |
| `src/features/admin/components/FaqForm.tsx` | `src/features/faq/components/FaqForm.tsx` | FAQ CRUD form |
| `src/features/admin/components/FooterConfigForm.tsx` | `src/features/admin/components/FooterConfigForm.tsx` | Footer link-group editor |
| `src/features/admin/components/NavbarConfigForm.tsx` | `src/features/admin/components/NavbarConfigForm.tsx` | Navbar item editor |
| `src/features/admin/components/BackgroundSettings.tsx` | `src/features/admin/components/BackgroundSettings.tsx` | Site background config |
| `src/features/admin/components/CategoryTreeView.tsx` | `src/features/categories/components/CategoryTree.tsx` | Appkit has `CategoryTree`; merge letitrip's `CategoryTreeView` into it |

---

## 11. Filter Components Missing From Appkit (🟢 move to appkit filters feature)

| letitrip file | Target appkit path | Notes |
|---|---|---|
| `src/components/filters/BlogFilters.tsx` | `src/features/blog/components/BlogFilters.tsx` | Blog sort/filter bar |
| `src/components/filters/EventFilters.tsx` | `src/features/events/components/EventFilters.tsx` | Event sort/filter bar |
| `src/features/admin/components/BidFilters.tsx` | `src/features/admin/components/BidFilters.tsx` | Bid admin filter bar |
| `src/features/admin/components/CarouselFilters.tsx` | `src/features/admin/components/CarouselFilters.tsx` | Carousel admin filters |
| `src/features/admin/components/CategoryFilters.tsx` | `src/features/admin/components/CategoryFilters.tsx` | Category admin filters |
| `src/features/admin/components/CouponFilters.tsx` | `src/features/admin/components/CouponFilters.tsx` | Coupon admin filters |
| `src/features/admin/components/EventEntryFilters.tsx` | `src/features/admin/components/EventEntryFilters.tsx` | Event entry admin filters |
| `src/features/admin/components/FaqFilters.tsx` | `src/features/admin/components/FaqFilters.tsx` | FAQ admin filters |
| `src/features/admin/components/HomepageSectionFilters.tsx` | `src/features/admin/components/HomepageSectionFilters.tsx` | Homepage section admin filters |
| `src/features/admin/components/NewsletterFilters.tsx` | `src/features/admin/components/NewsletterFilters.tsx` | Newsletter admin filters |
| `src/features/admin/components/NotificationFilters.tsx` | `src/features/admin/components/NotificationFilters.tsx` | Notification admin filters |

---

## 12. Homepage Section Components Missing From Appkit (🟢 new sections)

Homepage sections that exist in letitrip but are not yet in appkit. Move to enable reuse across projects.

| letitrip file | Target appkit path | Notes |
|---|---|---|
| `src/features/homepage/components/BlogArticlesSection.tsx` | `src/features/homepage/components/BlogArticlesSection.tsx` | Blog articles grid section |
| `src/features/homepage/components/FeaturedAuctionsSection.tsx` | `src/features/homepage/components/FeaturedAuctionsSection.tsx` | Hidden when empty |
| `src/features/homepage/components/FeaturedEventsSection.tsx` | `src/features/homepage/components/FeaturedEventsSection.tsx` | Featured events grid |
| `src/features/homepage/components/FeaturedPreOrdersSection.tsx` | `src/features/homepage/components/FeaturedPreOrdersSection.tsx` | Hidden when empty |
| `src/features/homepage/components/FeaturedProductsSection.tsx` | `src/features/homepage/components/FeaturedProductsSection.tsx` | Hidden when empty |
| `src/features/homepage/components/FeaturedStoresSection.tsx` | `src/features/homepage/components/FeaturedStoresSection.tsx` | Featured stores grid |
| `src/features/homepage/components/HowAuctionsWorkView.tsx` | `src/features/homepage/components/HowAuctionsWorkView.tsx` | Informational explainer |
| `src/features/homepage/components/HowPreOrdersWorkView.tsx` | `src/features/homepage/components/HowPreOrdersWorkView.tsx` | Informational explainer |

---

## 13. About / Informational Views Missing From Appkit (🟢)

| letitrip file | Target appkit path | Notes |
|---|---|---|
| `src/features/about/components/FeesView.tsx` | `src/features/about/components/FeesView.tsx` | Fee schedule page |
| `src/features/about/components/HowCheckoutWorksView.tsx` | `src/features/about/components/HowCheckoutWorksView.tsx` | Checkout explainer |
| `src/features/about/components/HowOffersWorkView.tsx` | `src/features/about/components/HowOffersWorkView.tsx` | Offers explainer |
| `src/features/about/components/HowOrdersWorkView.tsx` | `src/features/about/components/HowOrdersWorkView.tsx` | Orders explainer |
| `src/features/about/components/HowReviewsWorkView.tsx` | `src/features/about/components/HowReviewsWorkView.tsx` | Reviews explainer |
| `src/features/seller/components/HowPayoutsWorkView.tsx` | `src/features/seller/components/HowPayoutsWorkView.tsx` | Payout explainer for sellers |

---

## 14. Seed Data — Replace with Appkit Factories (🟢 coordinated migration)

letitrip has static fixture arrays in `src/db/seed-data/`. Appkit has typed factory functions in `src/seed/factories/`. Replace letitrip's fixed arrays with appkit factory calls.

| letitrip seed file | appkit factory |
|---|---|
| `src/db/seed-data/addresses-seed-data.ts` | `src/seed/factories/address.factory.ts` (`makeAddress`) |
| `src/db/seed-data/bids-seed-data.ts` | `src/seed/factories/bid.factory.ts` (`makeBid`) |
| `src/db/seed-data/blog-posts-seed-data.ts` | `src/seed/factories/blog-post.factory.ts` (`makeBlogPost`) |
| `src/db/seed-data/carousel-slides-seed-data.ts` | `src/seed/factories/carousel.factory.ts` (`makeCarouselSlide`) |
| `src/db/seed-data/cart-seed-data.ts` | `src/seed/factories/cart.factory.ts` (`makeCart`) |
| `src/db/seed-data/categories-seed-data.ts` | `src/seed/factories/category.factory.ts` + `src/seed/defaults/categories.ts` |
| `src/db/seed-data/coupons-seed-data.ts` | `src/seed/factories/coupon.factory.ts` (`makeCoupon`) |
| `src/db/seed-data/faq-seed-data.ts` | `src/seed/factories/faq.factory.ts` + `src/seed/defaults/faqs.ts` |
| `src/db/seed-data/homepage-sections-seed-data.ts` | `src/seed/factories/homepage-section.factory.ts` + `src/seed/defaults/homepage-sections.ts` |
| `src/db/seed-data/notifications-seed-data.ts` | `src/seed/factories/notification.factory.ts` (`makeNotification`) |
| `src/db/seed-data/orders-seed-data.ts` | `src/seed/factories/order.factory.ts` (`makeOrder`) |
| `src/db/seed-data/payouts-seed-data.ts` | `src/seed/factories/payout.factory.ts` (`makePayout`) |
| `src/db/seed-data/products-seed-data.ts` | `src/seed/factories/product.factory.ts` (`makeProduct`) |
| `src/db/seed-data/reviews-seed-data.ts` | `src/seed/factories/review.factory.ts` (`makeReview`) |
| `src/db/seed-data/sessions-seed-data.ts` | `src/seed/factories/session.factory.ts` (`makeSession`) |
| `src/db/seed-data/events-seed-data.ts` | (no factory yet — keep locally until events factory lands in appkit) |

---

## 15. Repository Singleton → Class Migration (🟢 breaking change)

letitrip uses module-level singletons (`const fooRepository`). Appkit exports class implementations. Migration: register appkit repos via `ProviderRegistry`, then delete letitrip singletons.

| letitrip singleton | appkit class |
|---|---|
| `src/repositories/blog.repository.ts` | `src/features/blog/repository/blog.repository.ts` (`class BlogRepository`) |
| `src/repositories/cart.repository.ts` | `src/features/cart/repository/cart.repository.ts` (`class CartRepository`) |
| `src/repositories/categories.repository.ts` | `src/features/categories/repository/categories.repository.ts` (`class CategoriesRepository`) |
| `src/repositories/event.repository.ts` | `src/features/events/repository/events.repository.ts` (`class EventsRepository`) |
| `src/repositories/faqs.repository.ts` | `src/features/faq/repository/faqs.repository.ts` (`class FAQsRepository`) |
| `src/repositories/homepage-sections.repository.ts` | `src/features/homepage/repository/homepage.repository.ts` (`class HomepageSectionsRepository`) |
| `src/repositories/order.repository.ts` | `src/features/orders/repository/orders.repository.ts` (`class OrdersRepository`) |
| `src/repositories/payout.repository.ts` | `src/features/seller/` (`class PayoutsRepository`) |
| `src/repositories/product.repository.ts` | `src/features/products/repository/products.repository.ts` (`class ProductsRepository`) |
| `src/repositories/review.repository.ts` | `src/features/reviews/repository/reviews.repository.ts` (`class ReviewsRepository`) |
| `src/repositories/offer.repository.ts` | (no appkit equivalent yet) |

---

## 16. Infrastructure — Implement in Appkit First (🟢)

These letitrip files have no appkit equivalent yet and belong there. Implement in appkit, publish, then delete from letitrip.

### 16a. Auth provider — session-cookie flow

| letitrip file | Target appkit location | Notes |
|---|---|---|
| `src/lib/firebase/auth-server.ts` | `src/providers/auth-firebase/auth-server.ts` | Merge with existing `helpers.ts`; exports `verifyIdToken`, `verifySessionCookie`, `getAuthenticatedUser`, `requireAuth` |
| `src/lib/firebase/auth-helpers.ts` | `src/providers/auth-firebase/` | Client-side: `signInWithEmail`, `registerWithEmail`, `signInWithGoogle` |
| `src/lib/firebase/__mocks__/auth-server.ts` | `src/providers/auth-firebase/__mocks__/` | Consolidate test mocks |

### 16b. Realtime DB / presence / chat

| letitrip file | Target appkit location | Notes |
|---|---|---|
| `src/lib/firebase/realtime-db.ts` | `src/providers/db-firebase/realtime-db.ts` | `setUserPresence`, `sendChatMessage`, `listenToChatMessages`, etc. behind `IRealtimeProvider` |
| `src/lib/firebase/rtdb-paths.ts` | `src/providers/db-firebase/rtdb-paths.ts` | Move `RTDB_PATHS` constant into provider package |

### 16c. OTP / consent

| letitrip file | Target appkit location | Notes |
|---|---|---|
| `src/lib/consent-otp.ts` | `src/security/otp.ts` or `src/features/checkout/otp.ts` | `generateOtpCode`, `hashOtp`, rate-limit refs, verify/store/delete helpers |

### 16d. Encryption & PII

| letitrip file | Target appkit location | Notes |
|---|---|---|
| `src/lib/encryption.ts` | `src/security/encryption.ts` | AES helpers: `encrypt`, `decrypt`, `isEncrypted`, `maskSecret` |
| `src/lib/pii.ts` | `src/security/pii-encrypt.ts` | Merge `encryptPii`, `decryptPii`, `piiBlindIndex` into existing appkit implementation |

### 16e. Payment — Razorpay

| letitrip file | Target appkit location | Notes |
|---|---|---|
| `src/lib/payment/razorpay.ts` | `src/providers/payment-razorpay/` | Absorb `createRazorpayOrder`, `verifyPaymentSignature`, `verifyWebhookSignature`, `rupeesToPaise` into existing `RazorpayProvider` class |

### 16f. Shipping — Shiprocket

| letitrip file | Target appkit location | Notes |
|---|---|---|
| `src/lib/shiprocket/client.ts` | `src/providers/shipping-shiprocket/` | Appkit already has 27 exports; collapse letitrip re-exports |
| `src/lib/shiprocket/platform-auth.ts` | `src/providers/shipping-shiprocket/platform-auth.ts` | Move `getPlatformShiprocketToken`, `invalidatePlatformShiprocketToken` into provider |

### 16g. Email orchestration

| letitrip file | Target appkit location | Notes |
|---|---|---|
| `src/lib/email.ts` | `src/providers/email-resend/` + `src/features/auth/email.ts` | Higher-level senders (`sendVerificationEmail`, `sendPasswordResetEmailWithLink`) move to feature layer |

### 16h. Integration keys

| letitrip file | Target appkit location | Notes |
|---|---|---|
| `src/lib/integration-keys.ts` | `src/core/integration-keys.ts` | `resolveKeys`, `invalidateIntegrationKeysCache` — generic live-key resolution from Firestore |

### 16i. DB Schema definitions

Firestore collection-name constants, indexed fields, default data shapes, and ID generators. Move to appkit so `licorice` and `hobson` can share them. After moving, update `src/repositories/` and `functions/src/repositories/` imports.

| letitrip file | Target appkit location |
|---|---|
| `src/db/schema/addresses.ts` | `src/features/account/schema/addresses.ts` |
| `src/db/schema/bids.ts` | `src/features/auctions/schema/bids.ts` |
| `src/db/schema/blog-posts.ts` | `src/features/blog/schema/blog-posts.ts` |
| `src/db/schema/carousel-slides.ts` | `src/features/homepage/schema/carousel-slides.ts` |
| `src/db/schema/cart.ts` | `src/features/cart/schema/cart.ts` |
| `src/db/schema/categories.ts` | `src/features/categories/schema/categories.ts` |
| `src/db/schema/chat.ts` | `src/features/account/schema/chat.ts` |
| `src/db/schema/copilot-logs.ts` | `src/features/copilot/schema/copilot-logs.ts` |
| `src/db/schema/coupons.ts` | `src/features/promotions/schema/coupons.ts` |
| `src/db/schema/events.ts` | `src/features/events/schema/events.ts` |
| `src/db/schema/failed-checkouts.ts` | `src/features/checkout/schema/failed-checkouts.ts` |
| `src/db/schema/faqs.ts` | `src/features/faq/schema/faqs.ts` |
| `src/db/schema/field-names.ts` | `src/providers/db-firebase/field-names.ts` |
| `src/db/schema/homepage-sections.ts` | `src/features/homepage/schema/homepage-sections.ts` |
| `src/db/schema/notifications.ts` | `src/features/account/schema/notifications.ts` |
| `src/db/schema/offers.ts` | `src/features/products/schema/offers.ts` |
| `src/db/schema/orders.ts` | `src/features/orders/schema/orders.ts` |
| `src/db/schema/payouts.ts` | `src/features/seller/schema/payouts.ts` |
| `src/db/schema/products.ts` | `src/features/products/schema/products.ts` |
| `src/db/schema/reviews.ts` | `src/features/reviews/schema/reviews.ts` |
| `src/db/schema/sessions.ts` | `src/features/auth/schema/sessions.ts` |

> Once schema files are moved, `src/db/indices/merge-indices.ts` should become an appkit CLI command or move to `appkit/scripts/`.

---

## Priority Order for Migration

Work in this sequence to unblock consumers fastest:

1. **§7 — UI Primitives** (`Accordion` + `AccordionItem`, `Avatar`, `Card`, `Dropdown`, `Modal`+`ModalFooter`, etc.) — unblocks many feature components
2. **§9 — Admin UI Primitives** (`AdminFilterBar`, `AdminPageHeader`, `DrawerFormFooter`, `GridEditor`) — unblocks all admin form wrappers
3. **§6 — Utility Duplicates** (`business-day`, `id-generators`, `order-splitter`, Firebase admin shim) — low-risk, high impact
4. **§1 — Remaining Thin Shims** — delete after redirecting all imports
5. **§10/11 — Admin Forms & Filters** — after UI primitives land in appkit
6. **§12/13 — Homepage & About sections** — after feature shells stabilise
7. **§15 — Repository migration** — register appkit repos via `ProviderRegistry`, then delete singletons
8. **§3 — Feature View Duplicates** — final sweep; delete local copies when all consumers updated
9. **§16 — Infrastructure** (auth, realtime, OTP, encryption, payment, shipping, email, schema) — largest coordinated effort; do per-subsystem
# Prune Candidates — letitrip.in

Files and modules in `letitrip.in/src` that duplicate code already present in `appkit`, or whose bodies belong in appkit as reusable primitives. Organised by removal confidence and work required.

**Last updated:** April 12 2026 — synced against both `letitrip.in/index.md` and `appkit/index.md`.

---

## Legend

| Symbol | Meaning |
|--------|---------|
| ✅ | Already landed in appkit — prune letitrip copy when consumers are updated |
| 🔴 | Thin shim / re-export — delete or collapse immediately once imports are redirected |
| 🟠 | Direct 1-for-1 duplicate — replace import path, then delete |
| 🟡 | Same logical component but letitrip version is adapter/glue — keep minimal glue, remove body |
| 🟢 | Different architecture or missing appkit piece — migration requires coordinated change |

---

## 1. Thin Shims & Re-exports (🔴 immediate)

These letitrip files do nothing but re-export from `@mohasinac/appkit`. Once all consumers import directly from appkit, delete the shim.

| letitrip file | Delegates to (appkit) | Status |
|---|---|---|
| `src/lib/monitoring/error-tracking.ts` | `appkit/monitoring` → `error-tracking.ts` | 🔴 shim |
| `src/lib/monitoring/runtime.ts` | `appkit/monitoring` → `runtime.ts` | 🔴 shim |
| `src/lib/monitoring/performance.ts` | `appkit/monitoring` → `performance.ts` | 🔴 shim |
| `src/lib/api/cache-middleware.ts` | `appkit/next` → `cache-middleware.ts` | 🔴 shim |
| `src/lib/api-response.ts` | `appkit/next/api` → `api-response.ts` | 🔴 shim |
| `src/lib/firebase/firestore-helpers.ts` | `appkit/providers/db-firebase` → `helpers.ts` | 🔴 shim |
| `src/utils/converters/cookie.converter.ts` | `appkit/utils` → `cookie.converter.ts` | 🔴 shim |
| `src/utils/formatters/date.formatter.ts` | `appkit/utils` → `date.formatter.ts` | 🔴 shim |
| `src/utils/formatters/number.formatter.ts` | `appkit/utils` → `number.formatter.ts` | 🔴 shim |
| `src/utils/formatters/string.formatter.ts` | `appkit/utils` → `string.formatter.ts` | 🔴 shim |
| `src/utils/validators/email.validator.ts` | `appkit/validation` → `email.validator.ts` | 🔴 shim |
| `src/utils/validators/phone.validator.ts` | `appkit/validation` → `phone.validator.ts` | 🔴 shim |
| `src/utils/validators/password.validator.ts` | `appkit/validation` → `password.validator.ts` | 🔴 shim |
| `src/utils/validators/input.validator.ts` | `appkit/validation` → `input.validator.ts` | 🔴 shim |
| `src/utils/validators/url.validator.ts` | `appkit/validation` → `url.validator.ts` | 🔴 shim |
| `src/utils/events/event-manager.ts` | `appkit/utils` → `event-manager.ts` | 🔴 shim |
| `src/features/blog/components/BlogFeaturedCard.tsx` | `appkit/features/blog/components/BlogFeaturedCard.tsx` | 🔴 shim |
| `src/features/faq/components/FAQCategorySidebar.tsx` | `appkit/features/faq/components/` | 🔴 shim |
| `src/features/faq/components/FAQSortDropdown.tsx` | `appkit/features/faq/components/` | 🔴 shim |
| `src/features/faq/components/RelatedFAQs.tsx` | `appkit/features/faq/components/` | 🔴 shim |
| `src/features/faq/components/ContactCTA.tsx` | `appkit/features/faq/components/` | 🔴 shim |
| `src/features/homepage/components/HomepageSkeleton.tsx` | `appkit/features/homepage/components/HomepageSkeleton.tsx` | 🔴 shim |
| `src/features/homepage/components/SectionCarousel.tsx` | `appkit/features/homepage/components/SectionCarousel.tsx` | 🔴 shim |
| `src/lib/api/request-helpers.ts` | `appkit/next` → `request-helpers.ts` | 🔴 shim |

> **Note:** `src/lib/monitoring/cache-metrics.ts` has already been deleted. ✅

---

## 2. Homepage Thin-Adapter Components (🟡 keep minimal glue only)

The letitrip file should contain nothing but a re-export or props-passing wrapper. The component body must live entirely in appkit.

| letitrip file | appkit equivalent |
|---|---|
| `src/features/homepage/components/AdvertisementBanner.tsx` | `appkit/src/features/homepage/components/AdvertisementBanner.tsx` |
| `src/features/homepage/components/CustomerReviewsSection.tsx` | `appkit/src/features/homepage/components/CustomerReviewsSection.tsx` |
| `src/features/homepage/components/FAQSection.tsx` | `appkit/src/features/homepage/components/FAQSection.tsx` |
| `src/features/homepage/components/HowItWorksSection.tsx` | `appkit/src/features/homepage/components/HowItWorksSection.tsx` |
| `src/features/homepage/components/NewsletterSection.tsx` | `appkit/src/features/homepage/components/NewsletterSection.tsx` |
| `src/features/homepage/components/SecurityHighlightsSection.tsx` | `appkit/src/features/homepage/components/SecurityHighlightsSection.tsx` |

---

## 3. Feature View Duplicates (🟠 replace import, delete local)

Identical views exist in appkit. Replace usages with the appkit import, then delete the letitrip copy.

### 3a. Admin views

| letitrip file | appkit path |
|---|---|
| `src/features/admin/components/AdminAnalyticsView.tsx` | `src/features/admin/components/AdminAnalyticsView.tsx` |
| `src/features/admin/components/AdminBidsView.tsx` | `src/features/admin/components/AdminBidsView.tsx` |
| `src/features/admin/components/AdminBlogView.tsx` | `src/features/admin/components/AdminBlogView.tsx` |
| `src/features/admin/components/AdminCarouselView.tsx` | `src/features/admin/components/AdminCarouselView.tsx` |
| `src/features/admin/components/AdminCategoriesView.tsx` | `src/features/admin/components/AdminCategoriesView.tsx` |
| `src/features/copilot/components/AdminCopilotView.tsx` | `src/features/copilot/components/AdminCopilotView.tsx` |
| `src/features/admin/components/AdminCouponsView.tsx` | `src/features/admin/components/AdminCouponsView.tsx` |
| `src/features/admin/components/AdminDashboardView.tsx` | `src/features/admin/components/AdminDashboardView.tsx` |
| `src/features/events/components/AdminEventEntriesView.tsx` | `src/features/events/components/AdminEventEntriesView.tsx` |
| `src/features/events/components/AdminEventsView.tsx` | `src/features/events/components/AdminEventsView.tsx` |
| `src/features/admin/components/AdminFaqsView.tsx` | `src/features/admin/components/AdminFaqsView.tsx` |
| `src/features/admin/components/AdminFeatureFlagsView.tsx` | `src/features/admin/components/AdminFeatureFlagsView.tsx` |
| `src/features/admin/components/AdminMediaView.tsx` | `src/features/admin/components/AdminMediaView.tsx` |
| `src/features/admin/components/AdminNavigationView.tsx` | `src/features/admin/components/AdminNavigationView.tsx` |
| `src/features/admin/components/AdminOrdersView.tsx` | `src/features/admin/components/AdminOrdersView.tsx` |
| `src/features/admin/components/AdminPayoutsView.tsx` | `src/features/admin/components/AdminPayoutsView.tsx` |
| `src/features/admin/components/AdminProductsView.tsx` | `src/features/admin/components/AdminProductsView.tsx` |
| `src/features/admin/components/AdminReviewsView.tsx` | `src/features/admin/components/AdminReviewsView.tsx` |
| `src/features/admin/components/AdminSectionsView.tsx` | `src/features/admin/components/AdminSectionsView.tsx` |
| `src/features/admin/components/AdminSessionsManager.tsx` | `src/features/admin/components/AdminSessionsManager.tsx` |
| `src/features/admin/components/AdminSidebar.tsx` | `src/features/admin/components/AdminSidebar.tsx` |
| `src/features/admin/components/AdminSiteView.tsx` | `src/features/admin/components/AdminSiteView.tsx` |
| `src/features/admin/components/AdminStoresView.tsx` | `src/features/admin/components/AdminStoresView.tsx` |
| `src/features/admin/components/AdminTopBar.tsx` | `src/features/admin/components/AdminTopBar.tsx` |
| `src/features/admin/components/AdminUsersView.tsx` | `src/features/admin/components/AdminUsersView.tsx` |
| `src/features/admin/components/AlgoliaDashboardView.tsx` | `src/features/admin/components/AlgoliaDashboardView.tsx` |

### 3b. Auth views

| letitrip file | appkit path |
|---|---|
| `src/features/auth/components/ForgotPasswordView.tsx` | `src/features/auth/components/ForgotPasswordView.tsx` |
| `src/features/auth/components/LoginForm.tsx` | `src/features/auth/components/LoginForm.tsx` |
| `src/features/auth/components/RegisterForm.tsx` | `src/features/auth/components/RegisterForm.tsx` |
| `src/features/auth/components/ResetPasswordView.tsx` | `src/features/auth/components/ResetPasswordView.tsx` |

### 3c. Blog views

| letitrip file | appkit path |
|---|---|
| `src/features/blog/components/BlogListView.tsx` | `src/features/blog/components/BlogListView.tsx` |
| `src/features/blog/components/BlogPostView.tsx` | `src/features/blog/components/BlogPostView.tsx` |

### 3d. Cart / Checkout views

| letitrip file | appkit path |
|---|---|
| `src/features/cart/components/CartSummary.tsx` | `src/features/cart/components/CartSummary.tsx` |
| `src/features/cart/components/CartView.tsx` | `src/features/cart/components/CartView.tsx` |
| `src/features/cart/components/CheckoutAddressStep.tsx` | `src/features/cart/components/CheckoutAddressStep.tsx` |
| `src/features/cart/components/CheckoutOtpModal.tsx` | `src/features/cart/components/CheckoutOtpModal.tsx` |
| `src/features/cart/components/CheckoutSuccessView.tsx` | `src/features/cart/components/CheckoutSuccessView.tsx` |
| `src/features/cart/components/CheckoutView.tsx` | `src/features/cart/components/CheckoutView.tsx` |

### 3e. Category views

| letitrip file | appkit path |
|---|---|
| `src/features/categories/components/CategoriesListView.tsx` | `src/features/categories/components/CategoriesListView.tsx` |
| `src/features/categories/components/CategoryGrid.tsx` | `src/features/categories/components/CategoryGrid.tsx` |
| `src/features/categories/components/CategoryProductsView.tsx` | `src/features/categories/components/CategoryProductsView.tsx` |

### 3f. Contact / FAQ views

| letitrip file | appkit path |
|---|---|
| `src/features/contact/components/ContactForm.tsx` | `src/features/contact/components/ContactForm.tsx` |
| `src/features/contact/components/ContactInfoSidebar.tsx` | `src/features/contact/components/ContactInfoSidebar.tsx` |
| `src/features/faq/components/FAQAccordion.tsx` | `src/features/faq/components/FAQAccordion.tsx` |
| `src/features/faq/components/FAQHelpfulButtons.tsx` | `src/features/faq/components/FAQHelpfulButtons.tsx` |
| `src/features/faq/components/FAQPageContent.tsx` | `src/features/faq/components/FAQPageContent.tsx` |

### 3g. Events views

| letitrip file | appkit path |
|---|---|
| `src/components/EventCard.tsx` | `src/features/events/components/EventCard.tsx` |
| `src/features/events/components/EventDetailView.tsx` | `src/features/events/components/EventDetailView.tsx` |
| `src/features/events/components/EventFormDrawer.tsx` | `src/features/events/components/EventFormDrawer.tsx` |
| `src/features/events/components/EventLeaderboard.tsx` | `src/features/events/components/EventLeaderboard.tsx` |
| `src/features/events/components/EventParticipateView.tsx` | `src/features/events/components/EventParticipateView.tsx` |
| `src/features/events/components/EventsListView.tsx` | `src/features/events/components/EventsListView.tsx` |
| `src/features/events/components/EventStatusBadge.tsx` | `src/features/events/components/EventStatusBadge.tsx` |

### 3h. Homepage components

| letitrip file | appkit path |
|---|---|
| `src/features/homepage/components/BeforeAfterCard.tsx` | `src/features/homepage/components/BeforeAfterCard.tsx` |
| `src/features/homepage/components/FeaturedResultsSection.tsx` | `src/features/homepage/components/FeaturedResultsSection.tsx` |
| `src/features/homepage/components/HeroCarousel.tsx` | `src/features/homepage/components/HeroCarousel.tsx` |
| `src/features/homepage/components/HomepageView.tsx` | `src/features/homepage/components/HomepageView.tsx` |
| `src/features/homepage/components/HowItWorksInfoView.tsx` | `src/features/homepage/components/HowItWorksInfoView.tsx` |
| `src/features/homepage/components/SiteFeaturesSection.tsx` | `src/features/homepage/components/SiteFeaturesSection.tsx` |
| `src/features/homepage/components/StatsCounterSection.tsx` | `src/features/homepage/components/StatsCounterSection.tsx` |
| `src/features/homepage/components/TrustFeaturesSection.tsx` | `src/features/homepage/components/TrustFeaturesSection.tsx` |
| `src/features/homepage/components/TrustIndicatorsSection.tsx` | `src/features/homepage/components/TrustIndicatorsSection.tsx` |
| `src/features/homepage/components/WelcomeSection.tsx` | `src/features/homepage/components/WelcomeSection.tsx` |
| `src/features/homepage/components/WhatsAppCommunitySection.tsx` | `src/features/homepage/components/WhatsAppCommunitySection.tsx` |

### 3i. Products views

| letitrip file | appkit path |
|---|---|
| `src/features/products/components/AuctionDetailView.tsx` | `src/features/products/components/AuctionDetailView.tsx` |
| `src/features/products/components/AuctionsView.tsx` | `src/features/products/components/AuctionsView.tsx` |
| `src/features/products/components/BidHistory.tsx` | `src/features/products/components/BidHistory.tsx` |
| `src/features/products/components/MakeOfferForm.tsx` | `src/features/products/components/MakeOfferForm.tsx` |
| `src/features/products/components/PlaceBidForm.tsx` | `src/features/products/components/PlaceBidForm.tsx` |
| `src/features/products/components/PreOrderDetailView.tsx` | `src/features/products/components/PreOrderDetailView.tsx` |
| `src/features/products/components/PreOrdersView.tsx` | `src/features/products/components/PreOrdersView.tsx` |
| `src/features/products/components/ProductDetailView.tsx` | `src/features/products/components/ProductDetailView.tsx` |
| `src/features/products/components/ProductFeatureBadges.tsx` | `src/features/products/components/ProductFeatureBadges.tsx` |
| `src/features/products/components/ProductInfo.tsx` | `src/features/products/components/ProductInfo.tsx` |
| `src/features/products/components/ProductsView.tsx` | `src/features/products/components/ProductsView.tsx` |
| `src/features/products/components/ProductTabs.tsx` | `src/features/products/components/ProductTabs.tsx` |
| `src/features/products/components/RelatedProducts.tsx` | `src/features/products/components/RelatedProducts.tsx` |

### 3j. Seller views

| letitrip file | appkit path |
|---|---|
| `src/features/seller/components/SellerAddressesView.tsx` | `src/features/seller/components/SellerAddressesView.tsx` |
| `src/features/seller/components/SellerAnalyticsView.tsx` | `src/features/seller/components/SellerAnalyticsView.tsx` |
| `src/features/seller/components/SellerAuctionsView.tsx` | `src/features/seller/components/SellerAuctionsView.tsx` |
| `src/features/seller/components/SellerCouponsView.tsx` | `src/features/seller/components/SellerCouponsView.tsx` |
| `src/features/seller/components/SellerCreateProductView.tsx` | `src/features/seller/components/SellerCreateProductView.tsx` |
| `src/features/seller/components/SellerDashboardView.tsx` | `src/features/seller/components/SellerDashboardView.tsx` |
| `src/features/seller/components/SellerEditProductView.tsx` | `src/features/seller/components/SellerEditProductView.tsx` |
| `src/features/seller/components/SellerGuideView.tsx` | `src/features/seller/components/SellerGuideView.tsx` |
| `src/features/seller/components/SellerOffersView.tsx` | `src/features/seller/components/SellerOffersView.tsx` |
| `src/features/seller/components/SellerOrdersView.tsx` | `src/features/seller/components/SellerOrdersView.tsx` |
| `src/features/seller/components/SellerPayoutHistoryTable.tsx` | `src/features/seller/components/SellerPayoutHistoryTable.tsx` |
| `src/features/seller/components/SellerPayoutSettingsView.tsx` | `src/features/seller/components/SellerPayoutSettingsView.tsx` |
| `src/features/seller/components/SellerPayoutStats.tsx` | `src/features/seller/components/SellerPayoutStats.tsx` |
| `src/features/seller/components/SellerPayoutsView.tsx` | `src/features/seller/components/SellerPayoutsView.tsx` |
| `src/features/seller/components/SellerProductsView.tsx` | `src/features/seller/components/SellerProductsView.tsx` |
| `src/features/seller/components/SellerShippingView.tsx` | `src/features/seller/components/SellerShippingView.tsx` |
| `src/features/seller/components/SellerSidebar.tsx` | `src/features/seller/components/SellerSidebar.tsx` |
| `src/features/seller/components/SellersListView.tsx` | `src/features/seller/components/SellersListView.tsx` |
| `src/features/seller/components/SellerStatCard.tsx` | `src/features/seller/components/SellerStatCard.tsx` |
| `src/features/seller/components/SellerStorefrontView.tsx` | `src/features/seller/components/SellerStorefrontView.tsx` |
| `src/features/seller/components/SellerStoreSetupView.tsx` | `src/features/seller/components/SellerStoreSetupView.tsx` |
| `src/features/seller/components/SellerStoreView.tsx` | `src/features/seller/components/SellerStoreView.tsx` |

### 3k. User / Account views

appkit now has a full `src/features/account/components/` module (added v2.0.8). These letitrip user views are direct duplicates:

| letitrip file | appkit path |
|---|---|
| `src/features/user/components/BecomeSellerView.tsx` | `src/features/account/components/BecomeSellerView.tsx` |
| `src/features/user/components/ChatList.tsx` | `src/features/account/components/ChatList.tsx` |
| `src/features/user/components/ChatWindow.tsx` | `src/features/account/components/ChatWindow.tsx` |
| `src/features/user/components/MessagesView.tsx` | `src/features/account/components/MessagesView.tsx` |
| `src/features/user/components/OrderDetailView.tsx` | `src/features/account/components/OrderDetailView.tsx` |
| `src/features/user/components/ProfileView.tsx` | `src/features/account/components/ProfileView.tsx` |
| `src/features/user/components/UserAccountHub.tsx` | `src/features/account/components/UserAccountHubView.tsx` |
| `src/features/user/components/UserAddressesView.tsx` | `src/features/account/components/UserAddressesView.tsx` |
| `src/features/user/components/UserNotificationsView.tsx` | `src/features/account/components/UserNotificationsView.tsx` |
| `src/features/user/components/UserOffersView.tsx` | `src/features/account/components/UserOffersView.tsx` |
| `src/features/user/components/UserOrdersView.tsx` | `src/features/account/components/UserOrdersView.tsx` |
| `src/features/user/components/UserOrderTrackView.tsx` | `src/features/account/components/UserOrderTrackView.tsx` |
| `src/features/user/components/UserSettingsView.tsx` | `src/features/account/components/UserSettingsView.tsx` |
| `src/features/user/components/UserSidebar.tsx` | `src/features/user/components/UserSidebar.tsx` (appkit) |

**Keep in letitrip (no appkit equivalent yet):**
`AccountInfoCard.tsx`, `AddAddressView.tsx`, `EmailVerificationCard.tsx`, `NotificationItem.tsx`, `NotificationsBulkActions.tsx`, `OrderTrackingView.tsx`, `PasswordChangeForm.tsx`, `PhoneVerificationCard.tsx`, `ProfileHeader.tsx`, `ProfileInfoForm.tsx`, `ProfileStatsGrid.tsx`, `PublicProfileView.tsx`, `UserEditAddressView.tsx`

### 3l. Reviews / Promotions / Search views

| letitrip file | appkit path |
|---|---|
| `src/features/promotions/components/CouponCard.tsx` | `src/features/promotions/components/CouponCard.tsx` |
| `src/features/promotions/components/PromotionsView.tsx` | `src/features/promotions/components/PromotionsView.tsx` |
| `src/features/reviews/components/ReviewsListView.tsx` | `src/features/reviews/components/ReviewsListView.tsx` |
| `src/features/search/components/SearchFiltersRow.tsx` | `src/features/search/components/SearchFiltersRow.tsx` |
| `src/features/search/components/SearchResultsSection.tsx` | `src/features/search/components/SearchResultsSection.tsx` |
| `src/features/search/components/SearchView.tsx` | `src/features/search/components/SearchView.tsx` |

### 3m. About views

| letitrip file | appkit path |
|---|---|
| `src/features/about/components/AboutView.tsx` | `src/features/about/components/AboutView.tsx` |

### 3n. Layout components

| letitrip file | appkit path |
|---|---|
| `src/components/layout/AutoBreadcrumbs.tsx` | `src/features/layout/AutoBreadcrumbs.tsx` |
| `src/components/layout/BottomNavLayout.tsx` | `src/features/layout/BottomNavLayout.tsx` |
| `src/components/layout/Breadcrumbs.tsx` | `src/features/layout/Breadcrumbs.tsx` |
| `src/components/layout/FooterLayout.tsx` | `src/features/layout/FooterLayout.tsx` |
| `src/components/layout/NavbarLayout.tsx` | `src/features/layout/NavbarLayout.tsx` |
| `src/components/layout/SidebarLayout.tsx` | `src/features/layout/SidebarLayout.tsx` |

### 3o. Media components

| letitrip file | appkit path |
|---|---|
| `src/components/media/MediaAvatar.tsx` | `src/features/media/MediaAvatar.tsx` |
| `src/components/media/MediaImage.tsx` | `src/features/media/MediaImage.tsx` |
| `src/components/media/MediaLightbox.tsx` | `src/features/media/MediaLightbox.tsx` |
| `src/components/media/MediaVideo.tsx` | `src/features/media/MediaVideo.tsx` |

### 3p. UI primitives

| letitrip file | appkit path |
|---|---|
| `src/components/ui/Accordion.tsx` | `src/ui/components/Accordion.tsx` |
| `src/components/ui/ActiveFilterChips.tsx` | `src/ui/components/ActiveFilterChips.tsx` |
| `src/components/feedback/Alert.tsx` | `src/ui/components/Alert.tsx` |

---

## 4. Error Handling — Now Fully in Appkit (✅ prune when imports updated)

All error surfaces and logging utilities have been implemented in appkit. Letitrip files are direct removals after consumers are updated:

| letitrip file | appkit location | appkit status |
|---|---|---|
| `src/components/ErrorBoundary.tsx` | `src/react/ErrorBoundary.tsx` | ✅ done |
| `src/app/global-error.tsx` | `src/next/components/GlobalError.tsx` | ✅ base component |
| `src/app/[locale]/not-found.tsx` | `src/next/components/NotFoundView.tsx` | ✅ base component |
| `src/app/[locale]/unauthorized/page.tsx` | `src/next/components/UnauthorizedView.tsx` | ✅ done |
| `src/app/[locale]/error.tsx` | `src/next/components/ErrorView.tsx` | ✅ done |
| `src/lib/monitoring/runtime.ts` | `src/monitoring/runtime.ts` | ✅ shim only |
| `src/lib/api-response.ts` | `src/next/api/api-response.ts` | ✅ shim only |
| `src/helpers/logging/error-logger.ts` | `src/monitoring/client-logger.ts` | ✅ done |
| `src/helpers/logging/server-error-logger.ts` | `src/monitoring/server-logger.ts` | ✅ done |
| `src/lib/server-logger.ts` | `src/monitoring/server-logger.ts` | ✅ collapse shim |
| `src/lib/monitoring/performance.ts` | `src/monitoring/performance.ts` | ✅ shim only |

---

## 5. SSR Foundation — Now Fully in Appkit (✅ prune when imports updated)

| letitrip file | appkit location | appkit status |
|---|---|---|
| `src/constants/routes.ts` | `src/next/routing/route-map.ts` | ✅ `createRouteMap()`, `ROUTES`, `RouteMap` |
| `src/constants/seo.ts` | `src/seo/metadata.ts` | ✅ `SeoConfig`, `generateMetadata()`, `createSeoConfig()` |

---

## 6. Utility Duplicates (🟠 — both copies exist, letitrip copy should become a shim then be deleted)

These utility files exist verbatim in both repos. The letitrip version should import from `@mohasinac/appkit/utils` and be deleted after all internal callers are updated.

| letitrip file | appkit path | Exports |
|---|---|---|
| `src/utils/business-day.ts` | `src/utils/business-day.ts` | `getBusinessDayStart`, `getBusinessDaysElapsed`, `getBusinessDaysRemaining`, `getBusinessDayEligibilityDate` |
| `src/utils/id-generators.ts` | `src/utils/id-generators.ts` | `generateCategoryId`, `generateUserId`, `generateProductId`, `generateAuctionId` +52 |
| `src/utils/order-splitter.ts` | `src/features/orders/utils/order-splitter.ts` | `splitCartIntoOrderGroups`, `OrderGroup` |
| `src/utils/guest-cart.ts` | `src/features/cart/utils/guest-cart.ts` | `getGuestCartItems`, `addToGuestCart`, `removeFromGuestCart`, `updateGuestCartQuantity` +6 |
| `src/components/filters/FilterPanel.tsx` | `src/features/filters/FilterPanel.tsx` | `FilterPanel`, `FacetSingleConfig`, `FacetMultiConfig`, `SwitchConfig` |
| `src/components/filters/filterUtils.ts` | `src/features/filters/filterUtils.ts` | `getFilterLabel`, `getFilterValue`, `FilterOption` |
| `src/components/ui/FilterFacetSection.tsx` | `src/features/filters/FilterFacetSection.tsx` | `FilterFacetSection`, `FacetOption`, `FilterFacetSectionProps` |
| `src/components/layout/BackToTop.tsx` | `src/features/layout/BackToTop.tsx` | `BackToTop`, `SkipToMain` |

---

## 7. UI Primitives Missing From Appkit (🟢 — move body to appkit first, then replace letitrip copy with shim)

These are generic, project-agnostic UI primitives that live in letitrip's `src/components/ui/` but have no equivalent in `appkit/src/ui/components/`. They must be implemented in appkit and then be re-exported/shimmed in letitrip.

| letitrip file | Target appkit path | Exported API |
|---|---|---|
| `src/components/ui/Accordion.tsx` | `src/ui/components/Accordion.tsx` | `fn Accordion`, `fn AccordionItem`, `AccordionProps`, `AccordionItemProps` — appkit version is **missing `AccordionItem`**, merge and expand |
| `src/components/ui/Avatar.tsx` | `src/ui/components/Avatar.tsx` | `fn Avatar`, `fn AvatarGroup`, `AvatarProps`, `AvatarGroupProps` |
| `src/components/ui/BaseListingCard.tsx` | `src/ui/components/BaseListingCard.tsx` | `BaseListingCard`, `BaseListingCardRootProps`, `BaseListingCardHeroProps`, `BaseListingCardInfoProps` |
| `src/components/ui/Card.tsx` | `src/ui/components/Card.tsx` | `fn Card`, `fn CardHeader`, `fn CardBody`, `fn CardFooter` |
| `src/components/ui/Dropdown.tsx` | `src/ui/components/Dropdown.tsx` | `DropdownProps`, `DropdownTriggerProps`, `DropdownMenuProps`, `DropdownItemProps` |
| `src/components/ui/DynamicSelect.tsx` | `src/ui/components/DynamicSelect.tsx` | `fn DynamicSelect`, `DynamicSelectOption`, `AsyncPage`, `DynamicSelectProps` |
| `src/components/ui/EmptyState.tsx` | `src/ui/components/EmptyState.tsx` | `fn EmptyState` |
| `src/components/ui/FilterDrawer.tsx` | `src/ui/components/FilterDrawer.tsx` | `fn FilterDrawer` |
| `src/components/ui/FlowDiagram.tsx` | `src/ui/components/FlowDiagram.tsx` | `fn FlowDiagram`, `FlowStep`, `FlowDiagramProps` |
| `src/components/ui/ImageGallery.tsx` | `src/ui/components/ImageGallery.tsx` | `fn ImageGallery`, `GalleryImage` |
| `src/components/ui/Menu.tsx` | `src/ui/components/Menu.tsx` | `MenuProps`, `MenuTriggerProps`, `MenuContentProps`, `MenuItemProps` |
| `src/components/ui/RoleBadge.tsx` | `src/ui/components/RoleBadge.tsx` | `fn RoleBadge` |
| `src/components/ui/SectionTabs.tsx` | `src/ui/components/SectionTabs.tsx` | `fn SectionTabs` |
| `src/components/ui/SideDrawer.tsx` | `src/ui/components/SideDrawer.tsx` | `fn SideDrawer` |
| `src/components/ui/Tabs.tsx` | `src/ui/components/Tabs.tsx` | `fn Tabs` |
| `src/components/feedback/Modal.tsx` | `src/ui/components/Modal.tsx` | `fn Modal`, `fn ModalFooter` — appkit has `Modal` but not the exported `ModalFooter` |
| `src/components/feedback/Toast.tsx` | `src/ui/components/Toast.tsx` | `fn Toast`, `fn ToastProvider`, `useToast` |

---

## 8. Shared General Components Missing From Appkit (🟢 — move body to appkit)

Non-primitive, domain-adjacent components used broadly enough to belong in appkit.

| letitrip file | Target appkit path | Notes |
|---|---|---|
| `src/components/AvatarDisplay.tsx` | `src/ui/components/AvatarDisplay.tsx` | Renders initials from `displayName` or `email` — generic, cross-project |
| `src/components/AvatarUpload.tsx` | `src/features/media/upload/AvatarUpload.tsx` | Avatar cropping/upload — belongs in media upload feature |
| `src/components/PasswordStrengthIndicator.tsx` | `src/ui/components/PasswordStrengthIndicator.tsx` | Works with appkit's `password.validator.ts` `PasswordStrength` type |
| `src/components/RowActionMenu.tsx` | `src/ui/components/RowActionMenu.tsx` | Generic table row actions dropdown — domain-agnostic |
| `src/components/DashboardStatsCard.tsx` | `src/features/admin/components/analytics/DashboardStatsCard.tsx` | Already has `AdminStatCard` in appkit; merge or create alias |
| `src/components/LayoutClient.tsx` | `src/next/components/LayoutClient.tsx` | Bottom-actions bar margin adjuster — generic layout utility |
| `src/components/EventBanner.tsx` | `src/features/events/components/EventBanner.tsx` | Session-storage-guarded event banner — re-usable across projects |
| `src/components/utility/BackgroundRenderer.tsx` | `src/features/layout/BackgroundRenderer.tsx` | Renders video/image/gradient backgrounds — site-agnostic |
| `src/components/utility/ResponsiveView.tsx` | `src/react/ResponsiveView.tsx` | Viewport-responsive show/hide wrapper |
| `src/components/modals/ConfirmDeleteModal.tsx` | `src/ui/components/ConfirmDeleteModal.tsx` | Generic destructive-action confirmation modal |
| `src/components/FormField.tsx` | Merge into `src/ui/components/FormGrid.tsx` | Richer form field (media, select, text) — extend appkit's `FormField` |

---

## 9. Admin UI Primitives Missing From Appkit (🟢 — move to appkit admin feature)

Generic admin-surface components used by every admin panel — belong in appkit's `src/features/admin/components/`.

| letitrip file | Target appkit path | Exported API |
|---|---|---|
| `src/components/admin/AdminFilterBar.tsx` | `src/features/admin/components/AdminFilterBar.tsx` | `fn AdminFilterBar` |
| `src/components/admin/AdminPageHeader.tsx` | `src/features/admin/components/AdminPageHeader.tsx` | `fn AdminPageHeader` |
| `src/components/admin/DrawerFormFooter.tsx` | `src/features/admin/components/DrawerFormFooter.tsx` | `fn DrawerFormFooter` |
| `src/features/admin/components/AdminDashboardSkeleton.tsx` | `src/features/admin/components/AdminDashboardSkeleton.tsx` | `fn AdminDashboardSkeleton` |
| `src/features/admin/components/AdminStatsCards.tsx` | `src/features/admin/components/analytics/AdminStatsCards.tsx` | `fn AdminStatsCards` |
| `src/features/admin/components/AdminPriorityAlerts.tsx` | `src/features/admin/components/AdminPriorityAlerts.tsx` | `fn AdminPriorityAlerts` |
| `src/features/admin/components/GridEditor.tsx` | `src/features/admin/components/GridEditor.tsx` | `fn GridEditor` — generic drag-and-drop grid |

---

## 10. Admin Form Components Missing From Appkit (🟢 — move to appkit)

These domain-specific admin forms exist in letitrip but not in appkit. Move the body to appkit so other projects (licorice, hobson) can reuse them.

| letitrip file | Target appkit path | Notes |
|---|---|---|
| `src/features/admin/components/BlogForm.tsx` | `src/features/blog/components/BlogForm.tsx` | Create/edit blog post form |
| `src/features/admin/components/CarouselSlideForm.tsx` | `src/features/admin/components/CarouselSlideForm.tsx` | Carousel slide CRUD form |
| `src/features/admin/components/CouponForm.tsx` | `src/features/promotions/components/CouponForm.tsx` | Coupon CRUD form |
| `src/features/admin/components/FaqForm.tsx` | `src/features/faq/components/FaqForm.tsx` | FAQ CRUD form |
| `src/features/admin/components/FooterConfigForm.tsx` | `src/features/admin/components/FooterConfigForm.tsx` | Footer link-group editor |
| `src/features/admin/components/NavbarConfigForm.tsx` | `src/features/admin/components/NavbarConfigForm.tsx` | Navbar item editor |
| `src/features/admin/components/BackgroundSettings.tsx` | `src/features/admin/components/BackgroundSettings.tsx` | Site background config |
| `src/features/admin/components/CategoryTreeView.tsx` | `src/features/categories/components/CategoryTree.tsx` | Tree view for nested categories — appkit has `CategoryTree`, merge |

---

## 11. Filter Components Missing From Appkit (🟢 — move to appkit filters feature)

| letitrip file | Target appkit path | Notes |
|---|---|---|
| `src/components/filters/BlogFilters.tsx` | `src/features/blog/components/BlogFilters.tsx` | Blog sort/filter bar |
| `src/components/filters/EventFilters.tsx` | `src/features/events/components/EventFilters.tsx` | Event sort/filter bar |
| `src/features/admin/components/BidFilters.tsx` | `src/features/admin/components/BidFilters.tsx` | Bid admin filter bar |
| `src/features/admin/components/CarouselFilters.tsx` | `src/features/admin/components/CarouselFilters.tsx` | Carousel admin filters |
| `src/features/admin/components/CategoryFilters.tsx` | `src/features/admin/components/CategoryFilters.tsx` | Category admin filters |
| `src/features/admin/components/CouponFilters.tsx` | `src/features/admin/components/CouponFilters.tsx` | Coupon admin filters |
| `src/features/admin/components/EventEntryFilters.tsx` | `src/features/admin/components/EventEntryFilters.tsx` | Event entry admin filters |
| `src/features/admin/components/FaqFilters.tsx` | `src/features/admin/components/FaqFilters.tsx` | FAQ admin filters |
| `src/features/admin/components/HomepageSectionFilters.tsx` | `src/features/admin/components/HomepageSectionFilters.tsx` | Homepage section admin filters |
| `src/features/admin/components/NewsletterFilters.tsx` | `src/features/admin/components/NewsletterFilters.tsx` | Newsletter admin filters |
| `src/features/admin/components/NotificationFilters.tsx` | `src/features/admin/components/NotificationFilters.tsx` | Notification admin filters |

---

## 12. Homepage Section Components Missing From Appkit (🟢 — new homepage sections)

These homepage sections exist in letitrip but are not yet in appkit. Move to enable reuse across projects.

| letitrip file | Target appkit path | Notes |
|---|---|---|
| `src/features/homepage/components/BlogArticlesSection.tsx` | `src/features/homepage/components/BlogArticlesSection.tsx` | Blog articles grid section |
| `src/features/homepage/components/FeaturedAuctionsSection.tsx` | `src/features/homepage/components/FeaturedAuctionsSection.tsx` | Hidden when empty |
| `src/features/homepage/components/FeaturedEventsSection.tsx` | `src/features/homepage/components/FeaturedEventsSection.tsx` | Featured events grid |
| `src/features/homepage/components/FeaturedPreOrdersSection.tsx` | `src/features/homepage/components/FeaturedPreOrdersSection.tsx` | Hidden when empty |
| `src/features/homepage/components/FeaturedProductsSection.tsx` | `src/features/homepage/components/FeaturedProductsSection.tsx` | Hidden when empty |
| `src/features/homepage/components/FeaturedStoresSection.tsx` | `src/features/homepage/components/FeaturedStoresSection.tsx` | Featured stores grid |
| `src/features/homepage/components/HowAuctionsWorkView.tsx` | `src/features/homepage/components/HowAuctionsWorkView.tsx` | Informational explainer |
| `src/features/homepage/components/HowPreOrdersWorkView.tsx` | `src/features/homepage/components/HowPreOrdersWorkView.tsx` | Informational explainer |

---

## 13. About/Informational Views Missing From Appkit (🟢)

| letitrip file | Target appkit path | Notes |
|---|---|---|
| `src/features/about/components/FeesView.tsx` | `src/features/about/components/FeesView.tsx` | Fee schedule page |
| `src/features/about/components/HowCheckoutWorksView.tsx` | `src/features/about/components/HowCheckoutWorksView.tsx` | Checkout explainer |
| `src/features/about/components/HowOffersWorkView.tsx` | `src/features/about/components/HowOffersWorkView.tsx` | Offers explainer |
| `src/features/about/components/HowOrdersWorkView.tsx` | `src/features/about/components/HowOrdersWorkView.tsx` | Orders explainer |
| `src/features/about/components/HowReviewsWorkView.tsx` | `src/features/about/components/HowReviewsWorkView.tsx` | Reviews explainer |
| `src/features/seller/components/HowPayoutsWorkView.tsx` | `src/features/seller/components/HowPayoutsWorkView.tsx` | Payout explainer for sellers |

---

## 14. Seller Informational Views Missing From Appkit (🟢)

| letitrip file | Target appkit path | Notes |
|---|---|---|
| `src/features/seller/components/HowPayoutsWorkView.tsx` | `src/features/seller/components/HowPayoutsWorkView.tsx` | Payout explainer — already in seller feature |

---

## Priority Order for Migration

Work in this sequence to unblock consumers fastest:

1. **Section 7 — UI Primitives** (`Accordion` fix + `Avatar`, `Card`, `Dropdown` etc.) — unblocks many feature components
2. **Section 9 — Admin UI Primitives** (`AdminFilterBar`, `AdminPageHeader`, `DrawerFormFooter`) — unblocks all admin form wrappers
3. **Section 6 — Utility Duplicates** (`business-day`, `id-generators`, `order-splitter`) — low-risk, high impact
4. **Section 1 — Remaining Shims** — delete after redirecting imports
5. **Section 10/11 — Admin Forms & Filters** — after UI primitives land in appkit
6. **Section 3 — Feature View Duplicates** — after per-feature work is done in steps 1–5
| `src/constants/site.ts` | `src/core/site-config.ts` | ✅ `SiteConfig`, dynamic loader with env + cache |
| `src/utils/guest-cart.ts` | `src/features/cart/utils/guest-cart.ts` | ✅ SSR-safe, storage adapter |
| `src/utils/order-splitter.ts` | `src/features/orders/utils/order-splitter.ts` | ✅ multi-seller split strategy |
| `src/repositories/copilot-log.repository.ts` | `src/core/copilot-log.repository.ts` | ✅ done |
| `src/repositories/newsletter.repository.ts` | `src/core/newsletter.repository.ts` | ✅ done |

---

## 6. Firebase Admin Provider Duplicate (🟠)

| letitrip file | appkit equivalent |
|---|---|
| `src/lib/firebase/admin.ts` | `src/providers/db-firebase/admin.ts` — `getAdminApp`, `getAdminAuth`, `getAdminDb`, `getAdminStorage` |
| `src/lib/firebase/__mocks__/admin.ts` | consolidate with appkit provider mocks |

---

## 7. Utility Functions Duplicated Locally (🟠)

| letitrip file | appkit equivalent |
|---|---|
| `src/utils/id-generators.ts` | `src/utils/id-generators.ts` |
| `src/helpers/auth/auth.helper.ts` | `src/security/authorization.ts` + rbac hooks |

---

## 8. Seed Data vs Appkit Factories (🟢 migration plan needed)

letitrip has flat `*-seed-data.ts` files in `src/db/seed-data/`. Appkit has typed factory functions in `src/seed/factories/`. The letitrip files are static fixture arrays — replace with appkit factory calls in a coordinated migration.

| letitrip seed file | appkit factory |
|---|---|
| `src/db/seed-data/addresses-seed-data.ts` | `src/seed/factories/address.factory.ts` (`makeAddress`) |
| `src/db/seed-data/bids-seed-data.ts` | `src/seed/factories/bid.factory.ts` (`makeBid`) |
| `src/db/seed-data/blog-posts-seed-data.ts` | `src/seed/factories/blog-post.factory.ts` (`makeBlogPost`) |
| `src/db/seed-data/carousel-slides-seed-data.ts` | `src/seed/factories/carousel.factory.ts` (`makeCarouselSlide`) |
| `src/db/seed-data/cart-seed-data.ts` | `src/seed/factories/cart.factory.ts` (`makeCart`) |
| `src/db/seed-data/categories-seed-data.ts` | `src/seed/factories/category.factory.ts` |
| `src/db/seed-data/coupons-seed-data.ts` | `src/seed/factories/coupon.factory.ts` (`makeCoupon`) |
| `src/db/seed-data/faq-seed-data.ts` | `src/seed/factories/faq.factory.ts` |
| `src/db/seed-data/homepage-sections-seed-data.ts` | `src/seed/factories/homepage-section.factory.ts` |
| `src/db/seed-data/notifications-seed-data.ts` | `src/seed/factories/notification.factory.ts` (`makeNotification`) |
| `src/db/seed-data/orders-seed-data.ts` | `src/seed/factories/order.factory.ts` (`makeOrder`) |
| `src/db/seed-data/payouts-seed-data.ts` | `src/seed/factories/payout.factory.ts` (`makePayout`) |
| `src/db/seed-data/products-seed-data.ts` | `src/seed/factories/product.factory.ts` (`makeProduct`) |
| `src/db/seed-data/reviews-seed-data.ts` | `src/seed/factories/review.factory.ts` (`makeReview`) |
| `src/db/seed-data/sessions-seed-data.ts` | `src/seed/factories/session.factory.ts` (`makeSession`) |
| `src/db/seed-data/events-seed-data.ts` | (no factory yet — keep locally) |

---

## 9. Repository Singleton vs Class Migration (🟢 breaking change)

letitrip uses module-level singletons; appkit exports class implementations. Migration path: register appkit repositories through `ProviderRegistry`, then delete letitrip singletons.

| letitrip singleton | appkit class | Notes |
|---|---|---|
| `src/repositories/blog.repository.ts` | `src/features/blog/repository/blog.repository.ts` | Consumers use singleton directly |
| `src/repositories/cart.repository.ts` | `src/features/cart/repository/cart.repository.ts` | — |
| `src/repositories/categories.repository.ts` | `src/features/categories/repository/categories.repository.ts` | — |
| `src/repositories/event.repository.ts` | `src/features/events/repository/events.repository.ts` | — |
| `src/repositories/faqs.repository.ts` | `src/features/faq/repository/faqs.repository.ts` | — |
| `src/repositories/homepage-sections.repository.ts` | `src/features/homepage/repository/homepage.repository.ts` | — |
| `src/repositories/order.repository.ts` | `src/features/orders/repository/orders.repository.ts` | — |
| `src/repositories/payout.repository.ts` | `src/features/seller/repository/seller.repository.ts` (`PayoutsRepository`) | — |
| `src/repositories/product.repository.ts` | `src/features/products/repository/products.repository.ts` | — |
| `src/repositories/review.repository.ts` | `src/features/reviews/repository/reviews.repository.ts` | — |
| `src/repositories/offer.repository.ts` | (no appkit equivalent yet) | — |

---

## 10. Move to Appkit — Still Needed (🟢 implement in appkit first)

These letitrip files have no appkit equivalent yet and belong there. Implement in appkit, publish, then prune letitrip.

### 10a. Auth provider — session-cookie flow

| letitrip file | Target appkit location | Notes |
|---|---|---|
| `src/lib/firebase/auth-server.ts` | `src/providers/auth-firebase/auth-server.ts` | Merge with existing `helpers.ts`; exports `verifyIdToken`, `verifySessionCookie`, `getAuthenticatedUser`, `requireAuth` |
| `src/lib/firebase/__mocks__/auth-server.ts` | `src/providers/auth-firebase/__mocks__/` | — |
| `src/lib/firebase/auth-helpers.ts` | `src/providers/auth-firebase/` | Client-side: `signInWithEmail`, `registerWithEmail`, `signInWithGoogle` |

### 10b. Realtime DB / presence / chat

| letitrip file | Target appkit location | Notes |
|---|---|---|
| `src/lib/firebase/realtime-db.ts` | `src/providers/db-firebase/realtime-db.ts` | `setUserPresence`, `sendChatMessage`, `listenToChatMessages`, etc. behind `IRealtimeProvider` |
| `src/lib/firebase/rtdb-paths.ts` | `src/providers/db-firebase/rtdb-paths.ts` | Move `RTDB_PATHS` into provider package |

### 10c. OTP / consent

| letitrip file | Target appkit location | Notes |
|---|---|---|
| `src/lib/consent-otp.ts` | `src/security/otp.ts` or `src/features/checkout/otp.ts` | `generateOtpCode`, `hashOtp`, rate-limit refs, verify/store/delete helpers |

### 10d. Encryption & PII

| letitrip file | Target appkit location | Notes |
|---|---|---|
| `src/lib/encryption.ts` | `src/security/encryption.ts` | AES helpers: `encrypt`, `decrypt`, `isEncrypted`, `maskSecret` |
| `src/lib/pii.ts` | `src/security/pii-encrypt.ts` | Merge `encryptPii`, `decryptPii`, `piiBlindIndex` into existing appkit implementation |

### 10e. Payment — Razorpay

| letitrip file | Target appkit location | Notes |
|---|---|---|
| `src/lib/payment/razorpay.ts` | `src/providers/payment-razorpay/` | Absorb `createRazorpayOrder`, `verifyPaymentSignature`, `verifyWebhookSignature`, `rupeesToPaise` into existing `RazorpayProvider` class |

### 10f. Shipping — Shiprocket

| letitrip file | Target appkit location | Notes |
|---|---|---|
| `src/lib/shiprocket/client.ts` | `src/providers/shipping-shiprocket/` | Appkit already has 27 exports; collapse letitrip re-exports |
| `src/lib/shiprocket/platform-auth.ts` | `src/providers/shipping-shiprocket/platform-auth.ts` | Move `getPlatformShiprocketToken`, `invalidatePlatformShiprocketToken` into provider |

### 10g. Email orchestration

| letitrip file | Target appkit location | Notes |
|---|---|---|
| `src/lib/email.ts` | `src/providers/email-resend/` + `src/features/auth/email.ts` | Higher-level senders (`sendVerificationEmail`, `sendPasswordResetEmailWithLink`) move to feature layer |

### 10h. Integration keys

| letitrip file | Target appkit location | Notes |
|---|---|---|
| `src/lib/integration-keys.ts` | `src/core/integration-keys.ts` | `resolveKeys`, `invalidateIntegrationKeysCache` — generic live-key resolution from Firestore |

### 10i. DB Schema definitions

The `src/db/schema/` files are Firestore collection contracts. Move to appkit so `licorice` and `hobson` can share them. After moving, update imports in `src/repositories/` and `functions/src/repositories/`.

| letitrip file | Target appkit location |
|---|---|
| `src/db/schema/addresses.ts` | `src/features/account/schema/addresses.ts` |
| `src/db/schema/bids.ts` | `src/features/auctions/schema/bids.ts` |
| `src/db/schema/blog-posts.ts` | `src/features/blog/schema/blog-posts.ts` |
| `src/db/schema/carousel-slides.ts` | `src/features/homepage/schema/carousel-slides.ts` |
| `src/db/schema/cart.ts` | `src/features/cart/schema/cart.ts` |
| `src/db/schema/categories.ts` | `src/features/categories/schema/categories.ts` |
| `src/db/schema/chat.ts` | `src/features/account/schema/chat.ts` |
| `src/db/schema/copilot-logs.ts` | `src/features/copilot/schema/copilot-logs.ts` |
| `src/db/schema/coupons.ts` | `src/features/promotions/schema/coupons.ts` |
| `src/db/schema/events.ts` | `src/features/events/schema/events.ts` |
| `src/db/schema/failed-checkouts.ts` | `src/features/checkout/schema/failed-checkouts.ts` |
| `src/db/schema/faqs.ts` | `src/features/faq/schema/faqs.ts` |
| `src/db/schema/field-names.ts` | `src/providers/db-firebase/field-names.ts` |
| `src/db/schema/homepage-sections.ts` | `src/features/homepage/schema/homepage-sections.ts` |
| `src/db/schema/notifications.ts` | `src/features/account/schema/notifications.ts` |
| `src/db/schema/offers.ts` | `src/features/products/schema/offers.ts` |
| `src/db/schema/orders.ts` | `src/features/orders/schema/orders.ts` |
| `src/db/schema/payouts.ts` | `src/features/seller/schema/payouts.ts` |
| `src/db/schema/products.ts` | `src/features/products/schema/products.ts` |
| `src/db/schema/reviews.ts` | `src/features/reviews/schema/reviews.ts` |
| `src/db/schema/sessions.ts` | `src/features/auth/schema/sessions.ts` |

> Once moved, `src/db/indices/merge-indices.ts` should become an appkit CLI command or move to `appkit/scripts/`.
# Prune Candidates — letitrip.in

Files and modules in `letitrip.in/src` that duplicate code already present in `appkit`. Organised by removal confidence and work required.

---

## Legend

| Symbol | Meaning |
|--------|---------|
| 🔴 | Already a thin shim / re-export — delete or collapse immediately |
| 🟠 | Direct 1-for-1 duplicate — replace import path, then delete |
| 🟡 | Same logical component but letitrip version is adapter/glue — keep the minimal glue, remove the body |
| 🟢 | Different architecture (class vs singleton) — migration requires coordinated change |

---

## 1. Thin Shims & Re-exports (🔴 immediate)

These letitrip files do nothing but re-export from `@mohasinac/appkit`. Once all consumers import directly from appkit, delete the shim.

| letitrip file | Delegates to (appkit) |
|---|---|
| `src/lib/monitoring/cache-metrics.ts` | `@mohasinac/appkit` → `src/monitoring/cache-metrics.ts` |
| `src/lib/monitoring/error-tracking.ts` | `@mohasinac/appkit` → `src/monitoring/error-tracking.ts` |
| `src/lib/firebase/firestore-helpers.ts` | `@mohasinac/appkit` → `src/providers/db-firebase/helpers.ts` |
| `src/utils/converters/cookie.converter.ts` | `@mohasinac/appkit` → `src/utils/cookie.converter.ts` |
| `src/utils/formatters/date.formatter.ts` | `@mohasinac/appkit` → `src/utils/date.formatter.ts` |
| `src/utils/formatters/number.formatter.ts` | `@mohasinac/appkit` → `src/utils/number.formatter.ts` |
| `src/utils/validators/email.validator.ts` | `@mohasinac/appkit` → `src/validation/email.validator.ts` |
| `src/utils/validators/phone.validator.ts` | `@mohasinac/appkit` → `src/validation/phone.validator.ts` |
| `src/utils/validators/password.validator.ts` | `@mohasinac/appkit` → `src/validation/password.validator.ts` |
| `src/utils/validators/input.validator.ts` | `@mohasinac/appkit` → `src/validation/input.validator.ts` |
| `src/utils/events/event-manager.ts` | `@mohasinac/appkit` → `src/utils/event-manager.ts` |
| `src/features/blog/components/BlogFeaturedCard.tsx` | re-exports `BlogFeaturedCard` from appkit `src/features/blog/components/BlogFeaturedCard.tsx` |
| `src/features/faq/components/FAQCategorySidebar.tsx` | re-exports `FAQCategorySidebar` from appkit |
| `src/features/faq/components/FAQSortDropdown.tsx` | re-exports `FAQSortDropdown` from appkit |
| `src/features/faq/components/RelatedFAQs.tsx` | re-exports `RelatedFAQs` from appkit |
| `src/features/faq/components/ContactCTA.tsx` | re-exports `ContactCTA` from appkit |
| `src/features/homepage/components/HomepageSkeleton.tsx` | re-exports `HomepageSkeleton` from appkit |
| `src/features/homepage/components/SectionCarousel.tsx` | re-exports `SectionCarousel` from appkit |
| `src/lib/api/cache-middleware.ts` | re-exports `withCache`, `invalidateCache` from appkit `src/next/cache-middleware.ts` |
| `src/lib/api/request-helpers.ts` | re-exports `getSearchParams` etc. from appkit `src/next/request-helpers.ts` |

---

## 2. Homepage Thin-Adapter Components (🟡 keep minimal glue only)

These letitrip components have a `Note: Thin adapter layout lives in @mohasinac/appkit` comment already. The letitrip file should contain nothing but a re-export (or a wrapper that passes site-specific props). The component body should live entirely in appkit.

| letitrip file | appkit equivalent |
|---|---|
| `src/features/homepage/components/AdvertisementBanner.tsx` | `appkit/src/features/homepage/components/AdvertisementBanner.tsx` |
| `src/features/homepage/components/CustomerReviewsSection.tsx` | `appkit/src/features/homepage/components/CustomerReviewsSection.tsx` |
| `src/features/homepage/components/FAQSection.tsx` | `appkit/src/features/homepage/components/FAQSection.tsx` |
| `src/features/homepage/components/HowItWorksSection.tsx` | `appkit/src/features/homepage/components/HowItWorksSection.tsx` |
| `src/features/homepage/components/NewsletterSection.tsx` | `appkit/src/features/homepage/components/NewsletterSection.tsx` |
| `src/features/homepage/components/SecurityHighlightsSection.tsx` | `appkit/src/features/homepage/components/SecurityHighlightsSection.tsx` |

---

## 3. Feature View Duplicates (🟠 replace import, delete local)

Identical views exist in appkit. Replace usages with the appkit import, then delete the letitrip copy.

### 3a. Admin views

| letitrip file | appkit path |
|---|---|
| `src/features/admin/components/AdminAnalyticsView.tsx` | `src/features/admin/components/AdminAnalyticsView.tsx` |
| `src/features/admin/components/AdminBidsView.tsx` | `src/features/admin/components/AdminBidsView.tsx` |
| `src/features/admin/components/AdminBlogView.tsx` | `src/features/admin/components/AdminBlogView.tsx` |
| `src/features/admin/components/AdminCarouselView.tsx` | `src/features/admin/components/AdminCarouselView.tsx` |
| `src/features/admin/components/AdminCategoriesView.tsx` | `src/features/admin/components/AdminCategoriesView.tsx` |
| `src/features/copilot/components/AdminCopilotView.tsx` | `src/features/copilot/components/AdminCopilotView.tsx` |
| `src/features/admin/components/AdminCouponsView.tsx` | `src/features/admin/components/AdminCouponsView.tsx` |
| `src/features/admin/components/AdminDashboardView.tsx` | `src/features/admin/components/AdminDashboardView.tsx` |
| `src/features/events/components/AdminEventEntriesView.tsx` | `src/features/events/components/AdminEventEntriesView.tsx` |
| `src/features/events/components/AdminEventsView.tsx` | `src/features/events/components/AdminEventsView.tsx` |
| `src/features/admin/components/AdminFaqsView.tsx` | `src/features/admin/components/AdminFaqsView.tsx` |
| `src/features/admin/components/AdminFeatureFlagsView.tsx` | `src/features/admin/components/AdminFeatureFlagsView.tsx` |
| `src/features/admin/components/AdminMediaView.tsx` | `src/features/admin/components/AdminMediaView.tsx` |
| `src/features/admin/components/AdminNavigationView.tsx` | `src/features/admin/components/AdminNavigationView.tsx` |
| `src/features/admin/components/AdminOrdersView.tsx` | `src/features/admin/components/AdminOrdersView.tsx` |
| `src/features/admin/components/AdminPayoutsView.tsx` | `src/features/admin/components/AdminPayoutsView.tsx` |
| `src/features/admin/components/AdminProductsView.tsx` | `src/features/admin/components/AdminProductsView.tsx` |
| `src/features/admin/components/AdminReviewsView.tsx` | `src/features/admin/components/AdminReviewsView.tsx` |
| `src/features/admin/components/AdminSectionsView.tsx` | `src/features/admin/components/AdminSectionsView.tsx` |
| `src/features/admin/components/AdminSessionsManager.tsx` | `src/features/admin/components/AdminSessionsManager.tsx` |
| `src/features/admin/components/AdminSidebar.tsx` | `src/features/admin/components/AdminSidebar.tsx` |
| `src/features/admin/components/AdminSiteView.tsx` | `src/features/admin/components/AdminSiteView.tsx` |
| `src/features/admin/components/AdminStoresView.tsx` | `src/features/admin/components/AdminStoresView.tsx` |
| `src/features/admin/components/AdminTopBar.tsx` | `src/features/admin/components/AdminTopBar.tsx` |
| `src/features/admin/components/AdminUsersView.tsx` | `src/features/admin/components/AdminUsersView.tsx` |
| `src/features/admin/components/AlgoliaDashboardView.tsx` | `src/features/admin/components/AlgoliaDashboardView.tsx` |
| `src/features/admin/components/DemoSeedView.tsx` | `src/features/admin/components/DemoSeedView.tsx` |

### 3b. Auth views

| letitrip file | appkit path |
|---|---|
| `src/features/auth/components/ForgotPasswordView.tsx` | `src/features/auth/components/ForgotPasswordView.tsx` |
| `src/features/auth/components/LoginForm.tsx` | `src/features/auth/components/LoginForm.tsx` |
| `src/features/auth/components/RegisterForm.tsx` | `src/features/auth/components/RegisterForm.tsx` |
| `src/features/auth/components/ResetPasswordView.tsx` | `src/features/auth/components/ResetPasswordView.tsx` |

### 3c. Blog views

| letitrip file | appkit path |
|---|---|
| `src/features/blog/components/BlogCategoryTabs.tsx` | exported as `fn BlogCategoryTabs` from `src/features/blog/components/BlogListView.tsx` |
| `src/features/blog/components/BlogListView.tsx` | `src/features/blog/components/BlogListView.tsx` |
| `src/features/blog/components/BlogPostView.tsx` | `src/features/blog/components/BlogPostView.tsx` |

### 3d. Cart / Checkout views

| letitrip file | appkit path |
|---|---|
| `src/features/cart/components/CartItemRow.tsx` | exported from `src/features/cart/components/CartDrawer.tsx` |
| `src/features/cart/components/CartSummary.tsx` | `src/features/cart/components/CartSummary.tsx` |
| `src/features/cart/components/CartView.tsx` | `src/features/cart/components/CartView.tsx` |
| `src/features/cart/components/CheckoutAddressStep.tsx` | `src/features/cart/components/CheckoutAddressStep.tsx` |
| `src/features/cart/components/CheckoutOtpModal.tsx` | `src/features/cart/components/CheckoutOtpModal.tsx` |
| `src/features/cart/components/CheckoutSuccessView.tsx` | `src/features/cart/components/CheckoutSuccessView.tsx` |
| `src/features/cart/components/CheckoutView.tsx` | `src/features/cart/components/CheckoutView.tsx` |

### 3e. Category views

| letitrip file | appkit path |
|---|---|
| `src/features/categories/components/CategoriesListView.tsx` | `src/features/categories/components/CategoriesListView.tsx` |
| `src/features/categories/components/CategoryGrid.tsx` | `src/features/categories/components/CategoryGrid.tsx` |
| `src/features/categories/components/CategoryProductsView.tsx` | `src/features/categories/components/CategoryProductsView.tsx` |

### 3f. Contact / FAQ views

| letitrip file | appkit path |
|---|---|
| `src/features/contact/components/ContactForm.tsx` | `src/features/contact/components/ContactForm.tsx` |
| `src/features/contact/components/ContactInfoSidebar.tsx` | `src/features/contact/components/ContactInfoSidebar.tsx` |
| `src/features/faq/components/FAQAccordion.tsx` | `src/features/faq/components/FAQAccordion.tsx` |
| `src/features/faq/components/FAQHelpfulButtons.tsx` | `src/features/faq/components/FAQHelpfulButtons.tsx` |
| `src/features/faq/components/FAQPageContent.tsx` | `src/features/faq/components/FAQPageContent.tsx` |

### 3g. Events views

| letitrip file | appkit path |
|---|---|
| `src/components/EventCard.tsx` | `src/features/events/components/EventCard.tsx` |
| `src/features/events/components/EventDetailView.tsx` | `src/features/events/components/EventDetailView.tsx` |
| `src/features/events/components/EventFormDrawer.tsx` | `src/features/events/components/EventFormDrawer.tsx` |
| `src/features/events/components/EventLeaderboard.tsx` | `src/features/events/components/EventLeaderboard.tsx` |
| `src/features/events/components/EventParticipateView.tsx` | `src/features/events/components/EventParticipateView.tsx` |
| `src/features/events/components/EventsListView.tsx` | `src/features/events/components/EventsListView.tsx` |
| `src/features/events/components/EventStatusBadge.tsx` | `src/features/events/components/EventStatusBadge.tsx` |

### 3h. Homepage components

| letitrip file | appkit path |
|---|---|
| `src/features/homepage/components/BeforeAfterCard.tsx` | `src/features/homepage/components/BeforeAfterCard.tsx` |
| `src/features/homepage/components/FeaturedResultsSection.tsx` | `src/features/homepage/components/FeaturedResultsSection.tsx` |
| `src/features/homepage/components/HeroCarousel.tsx` | `src/features/homepage/components/HeroCarousel.tsx` |
| `src/features/homepage/components/HomepageView.tsx` | `src/features/homepage/components/HomepageView.tsx` |

### 3i. Products views

| letitrip file | appkit path |
|---|---|
| `src/features/products/components/AuctionDetailView.tsx` | `src/features/products/components/AuctionDetailView.tsx` |
| `src/features/products/components/AuctionsView.tsx` | `src/features/products/components/AuctionsView.tsx` |
| `src/features/products/components/BidHistory.tsx` | `src/features/products/components/BidHistory.tsx` |
| `src/features/products/components/MakeOfferForm.tsx` | `src/features/products/components/MakeOfferForm.tsx` |
| `src/features/products/components/PlaceBidForm.tsx` | `src/features/products/components/PlaceBidForm.tsx` |
| `src/features/products/components/PreOrderDetailView.tsx` | `src/features/products/components/PreOrderDetailView.tsx` |
| `src/features/products/components/PreOrdersView.tsx` | `src/features/products/components/PreOrdersView.tsx` |
| `src/features/products/components/ProductDetailView.tsx` | `src/features/products/components/ProductDetailView.tsx` |
| `src/features/products/components/ProductFeatureBadges.tsx` | `src/features/products/components/ProductFeatureBadges.tsx` |
| `src/features/products/components/ProductInfo.tsx` | `src/features/products/components/ProductInfo.tsx` |
| `src/features/products/components/ProductsView.tsx` | `src/features/products/components/ProductsView.tsx` |
| `src/features/products/components/ProductTabs.tsx` | `src/features/products/components/ProductTabs.tsx` |
| `src/features/products/components/RelatedProducts.tsx` | `src/features/products/components/RelatedProducts.tsx` |

### 3j. Seller views

| letitrip file | appkit path |
|---|---|
| `src/features/seller/components/BecomeSellerView.tsx` | `src/features/user/components/BecomeSellerView.tsx` |
| `src/features/seller/components/SellerAddressesView.tsx` | `src/features/seller/components/SellerAddressesView.tsx` |
| `src/features/seller/components/SellerAnalyticsView.tsx` | `src/features/seller/components/SellerAnalyticsView.tsx` |
| `src/features/seller/components/SellerAuctionsView.tsx` | `src/features/seller/components/SellerAuctionsView.tsx` |
| `src/features/seller/components/SellerCouponsView.tsx` | `src/features/seller/components/SellerCouponsView.tsx` |
| `src/features/seller/components/SellerCreateProductView.tsx` | `src/features/seller/components/SellerCreateProductView.tsx` |
| `src/features/seller/components/SellerDashboardView.tsx` | `src/features/seller/components/SellerDashboardView.tsx` |
| `src/features/seller/components/SellerEditProductView.tsx` | `src/features/seller/components/SellerEditProductView.tsx` |
| `src/features/seller/components/SellerGuideView.tsx` | `src/features/seller/components/SellerGuideView.tsx` |
| `src/features/seller/components/SellerOffersView.tsx` | `src/features/seller/components/SellerOffersView.tsx` |
| `src/features/seller/components/SellerOrdersView.tsx` | `src/features/seller/components/SellerOrdersView.tsx` |
| `src/features/seller/components/SellerPayoutHistoryTable.tsx` | `src/features/seller/components/SellerPayoutHistoryTable.tsx` |
| `src/features/seller/components/SellerPayoutSettingsView.tsx` | `src/features/seller/components/SellerPayoutSettingsView.tsx` |
| `src/features/seller/components/SellerPayoutStats.tsx` | `src/features/seller/components/SellerPayoutStats.tsx` |
| `src/features/seller/components/SellerPayoutsView.tsx` | `src/features/seller/components/SellerPayoutsView.tsx` |
| `src/features/seller/components/SellerProductsView.tsx` | `src/features/seller/components/SellerProductsView.tsx` |
| `src/features/seller/components/SellerShippingView.tsx` | `src/features/seller/components/SellerShippingView.tsx` |
| `src/features/seller/components/SellerSidebar.tsx` | `src/features/seller/components/SellerSidebar.tsx` |
| `src/features/seller/components/SellersListView.tsx` | `src/features/seller/components/SellersListView.tsx` |
| `src/features/seller/components/SellerStatCard.tsx` | `src/features/seller/components/SellerStatCard.tsx` |
| `src/features/seller/components/SellerStorefrontView.tsx` | `src/features/seller/components/SellerStorefrontView.tsx` |
| `src/features/seller/components/SellerStoreSetupView.tsx` | `src/features/seller/components/SellerStoreSetupView.tsx` |
| `src/features/seller/components/SellerStoreView.tsx` | `src/features/seller/components/SellerStoreView.tsx` |

### 3k. User / Account views

| letitrip file | appkit path |
|---|---|
| `src/features/user/components/ChatList.tsx` | `src/features/account/components/ChatList.tsx` |
| `src/features/user/components/ChatWindow.tsx` | `src/features/account/components/ChatWindow.tsx` |
| `src/features/user/components/MessagesView.tsx` | `src/features/account/components/MessagesView.tsx` |
| `src/features/user/components/OrderDetailView.tsx` | `src/features/account/components/OrderDetailView.tsx` |
| `src/features/user/components/ProfileView.tsx` | `src/features/account/components/ProfileView.tsx` |

### 3l. Reviews / Promotions / Search views

| letitrip file | appkit path |
|---|---|
| `src/features/promotions/components/CouponCard.tsx` | `src/features/promotions/components/CouponCard.tsx` |
| `src/features/promotions/components/PromotionsView.tsx` | `src/features/promotions/components/PromotionsView.tsx` |
| `src/features/reviews/components/ReviewsListView.tsx` | `src/features/reviews/components/ReviewsListView.tsx` |
| `src/features/search/components/SearchFiltersRow.tsx` | `src/features/search/components/SearchFiltersRow.tsx` |
| `src/features/search/components/SearchResultsSection.tsx` | `src/features/search/components/SearchResultsSection.tsx` |
| `src/features/search/components/SearchView.tsx` | `src/features/search/components/SearchView.tsx` |

### 3m. About views

| letitrip file | appkit path |
|---|---|
| `src/features/about/components/AboutView.tsx` | `src/features/about/components/AboutView.tsx` |

### 3n. Layout components

| letitrip file | appkit path |
|---|---|
| `src/components/layout/AutoBreadcrumbs.tsx` | `src/features/layout/AutoBreadcrumbs.tsx` |
| `src/components/layout/BottomNavLayout.tsx` | `src/features/layout/BottomNavLayout.tsx` |
| `src/components/layout/Breadcrumbs.tsx` | `src/features/layout/Breadcrumbs.tsx` |
| `src/components/layout/FooterLayout.tsx` | `src/features/layout/FooterLayout.tsx` |
| `src/components/layout/NavbarLayout.tsx` | `src/features/layout/NavbarLayout.tsx` |
| `src/components/layout/SidebarLayout.tsx` | `src/features/layout/SidebarLayout.tsx` |

### 3o. Media components

| letitrip file | appkit path |
|---|---|
| `src/components/media/MediaAvatar.tsx` | `src/features/media/MediaAvatar.tsx` |
| `src/components/media/MediaImage.tsx` | `src/features/media/MediaImage.tsx` |
| `src/components/media/MediaLightbox.tsx` | `src/features/media/MediaLightbox.tsx` |
| `src/components/media/MediaVideo.tsx` | `src/features/media/MediaVideo.tsx` |

### 3p. UI primitives

| letitrip file | appkit path |
|---|---|
| `src/components/ui/Accordion.tsx` | `src/ui/components/Accordion.tsx` |
| `src/components/ui/ActiveFilterChips.tsx` | `src/ui/components/ActiveFilterChips.tsx` |
| `src/components/feedback/Alert.tsx` | `src/ui/components/Alert.tsx` |

---

## 4. Firebase Admin Provider Duplicate (🟠)

letitrip's Firebase admin initialisation duplicates appkit's provider implementation.

| letitrip file | appkit equivalent |
|---|---|
| `src/lib/firebase/admin.ts` | `src/providers/db-firebase/admin.ts` — exports `getAdminApp`, `getAdminAuth`, `getAdminDb`, `getAdminStorage` |
| `src/lib/firebase/__mocks__/admin.ts` | same appkit provider; mocks should also be consolidated |

---

## 5. Utility Functions Duplicated Locally (🟠)

These utility modules exist in full in both `letitrip/src/utils/` **and** `appkit/src/utils/`. The letitrip versions are typically "direct" (not shims). Replace all local imports with the appkit package import once `@mohasinac/appkit` is a declared dependency.

| letitrip file | appkit file |
|---|---|
| `src/utils/id-generators.ts` | `src/utils/id-generators.ts` |
| `src/utils/business-day.ts` | (similar to `functions/src/utils/businessDay.ts` in appkit) |
| `src/utils/guest-cart.ts` | `src/features/cart/utils/guest-cart.ts` (new appkit utility with storage adapter; SSR-safe fallback) |
| `src/utils/order-splitter.ts` | `src/features/orders/utils/order-splitter.ts` (new appkit strategy utility for multi-seller grouping) |
| `src/helpers/auth/auth.helper.ts` | `src/security/authorization.ts` + rbac hooks |

---

## 6. Seed Data vs Appkit Factories (🟢 migration plan needed)

letitrip has flat `*-seed-data.ts` files in `src/db/seed-data/`. Appkit has typed factory functions in `src/seed/factories/`. The letitrip files are not simple re-exports — they are static fixture arrays. They should eventually be replaced with appkit factory calls, but this requires a coordinated migration.

| letitrip seed file | appkit factory |
|---|---|
| `src/db/seed-data/addresses-seed-data.ts` | `src/seed/factories/address.factory.ts` (`makeAddress`) |
| `src/db/seed-data/bids-seed-data.ts` | `src/seed/factories/bid.factory.ts` (`makeBid`) |
| `src/db/seed-data/blog-posts-seed-data.ts` | `src/seed/factories/blog-post.factory.ts` (`makeBlogPost`) |
| `src/db/seed-data/carousel-slides-seed-data.ts` | `src/seed/factories/carousel.factory.ts` (`makeCarouselSlide`) |
| `src/db/seed-data/cart-seed-data.ts` | `src/seed/factories/cart.factory.ts` (`makeCart`) |
| `src/db/seed-data/categories-seed-data.ts` | `src/seed/factories/category.factory.ts` + `src/seed/defaults/categories.ts` |
| `src/db/seed-data/coupons-seed-data.ts` | `src/seed/factories/coupon.factory.ts` (`makeCoupon`) |
| `src/db/seed-data/events-seed-data.ts` | (no direct factory; keep locally until events factory added) |
| `src/db/seed-data/faq-seed-data.ts` | `src/seed/factories/faq.factory.ts` + `src/seed/defaults/faqs.ts` |
| `src/db/seed-data/homepage-sections-seed-data.ts` | `src/seed/factories/homepage-section.factory.ts` + `src/seed/defaults/homepage-sections.ts` |
| `src/db/seed-data/notifications-seed-data.ts` | `src/seed/factories/notification.factory.ts` (`makeNotification`) |
| `src/db/seed-data/orders-seed-data.ts` | `src/seed/factories/order.factory.ts` (`makeOrder`) |
| `src/db/seed-data/payouts-seed-data.ts` | `src/seed/factories/payout.factory.ts` (`makePayout`) |
| `src/db/seed-data/products-seed-data.ts` | `src/seed/factories/product.factory.ts` (`makeProduct`) |
| `src/db/seed-data/reviews-seed-data.ts` | `src/seed/factories/review.factory.ts` (`makeReview`) |
| `src/db/seed-data/sessions-seed-data.ts` | `src/seed/factories/session.factory.ts` (`makeSession`) |

---

## 7. Repository Singleton vs Class Migration (🟢 breaking change)

letitrip uses module-level singletons (`const fooRepository = new FooRepository(db)`). Appkit uses class exports that the caller instantiates. These are architecturally different. The migration path is: register appkit repositories through `ProviderRegistry`, then delete the letitrip singletons.

| letitrip singleton | appkit class | Migration blocker |
|---|---|---|
| `src/repositories/blog.repository.ts` (`const blogRepository`) | `src/features/blog/repository/blog.repository.ts` (`class BlogRepository`) | Consumers use the singleton directly |
| `src/repositories/cart.repository.ts` | `src/features/cart/repository/cart.repository.ts` | — |
| `src/repositories/categories.repository.ts` | `src/features/categories/repository/categories.repository.ts` | — |
| `src/repositories/event.repository.ts` | `src/features/events/repository/events.repository.ts` | — |
| `src/repositories/faqs.repository.ts` | `src/features/faq/repository/faqs.repository.ts` | — |
| `src/repositories/homepage-sections.repository.ts` | `src/features/homepage/repository/homepage.repository.ts` | — |
| `src/repositories/offer.repository.ts` | (no direct appkit equivalent yet) | — |
| `src/repositories/order.repository.ts` | `src/features/orders/repository/orders.repository.ts` | — |
| `src/repositories/payout.repository.ts` | `src/features/seller/repository/seller.repository.ts` (`PayoutsRepository`) | — |
| `src/repositories/product.repository.ts` | `src/features/products/repository/products.repository.ts` | — |
| `src/repositories/review.repository.ts` | `src/features/reviews/repository/reviews.repository.ts` | — |

---

## 8. Move to Appkit — Infrastructure & Provider Modules (🟢 new appkit providers needed)

These letitrip files currently have no appkit equivalent but **belong in appkit** as concrete provider implementations or shared infrastructure. The work is: implement in appkit behind the relevant contract interface, publish, then delete from letitrip.

### 8a. Auth provider — session-cookie flow

| letitrip file | Target appkit location | Contract to implement |
|---|---|---|
| `src/lib/firebase/auth-server.ts` (`verifyIdToken`, `verifySessionCookie`, `getAuthenticatedUser`, `requireAuth`) | `src/providers/auth-firebase/auth-server.ts` | `IAuthProvider` — already partially exists in `src/providers/auth-firebase/helpers.ts` in appkit; merge |
| `src/lib/firebase/__mocks__/auth-server.ts` | `src/providers/auth-firebase/__mocks__/auth-server.ts` | — |

### 8b. Realtime DB / presence / chat

| letitrip file | Target appkit location | Notes |
|---|---|---|
| `src/lib/firebase/realtime.ts` | `src/providers/db-firebase/realtime.ts` | Already a stub in appkit; expand with presence + chat |
| `src/lib/firebase/realtime-db.ts` (`setUserPresence`, `sendChatMessage`, `listenToChatMessages`, etc.) | `src/providers/db-firebase/realtime-db.ts` | Expose behind an `IRealtimeProvider` contract |
| `src/lib/firebase/rtdb-paths.ts` (`RTDB_PATHS`) | `src/providers/db-firebase/rtdb-paths.ts` | Move constant into provider package |

### 8c. OTP / consent

| letitrip file | Target appkit location | Notes |
|---|---|---|
| `src/lib/consent-otp.ts` (`generateOtpCode`, `hashOtp`, `consentOtpRef`, rate-limit refs, verify/store/delete helpers) | `src/security/otp.ts` or `src/features/checkout/otp.ts` | New security utility; no existing contract — create alongside implementation |

### 8d. Encryption & PII

| letitrip file | Target appkit location | Notes |
|---|---|---|
| `src/lib/encryption.ts` (`encrypt`, `decrypt`, `isEncrypted`, `maskSecret`) | `src/security/encryption.ts` | Low-level AES helpers → security package |
| `src/lib/pii.ts` (`encryptPii`, `decryptPii`, `isPiiEncrypted`, `piiBlindIndex`, field-level helpers) | `src/security/pii-encrypt.ts` | Appkit already has `src/security/pii-encrypt.ts` (`encryptPiiFields`, `hmacBlindIndex`); merge letitrip's higher-level helpers into it |

### 8e. Payment — Razorpay

| letitrip file | Target appkit location | Notes |
|---|---|---|
| `src/lib/payment/razorpay.ts` (`createRazorpayOrder`, `verifyPaymentSignature`, `verifyWebhookSignature`, `rupeesToPaise`, etc.) | `src/providers/payment-razorpay/` | Appkit already has `src/providers/payment-razorpay/index.ts` with `RazorpayProvider`; letitrip's standalone functions should be absorbed into that class |

### 8f. Shipping — Shiprocket

| letitrip file | Target appkit location | Notes |
|---|---|---|
| `src/lib/shiprocket/client.ts` | `src/providers/shipping-shiprocket/` | Appkit already has `src/providers/shipping-shiprocket/index.ts` (27 exports); letitrip's `client.ts` re-exports a subset — collapse into the appkit provider |
| `src/lib/shiprocket/platform-auth.ts` (`getPlatformShiprocketToken`, `invalidatePlatformShiprocketToken`) | `src/providers/shipping-shiprocket/platform-auth.ts` | Move token-cache into the provider package |

### 8g. Email orchestration

| letitrip file | Target appkit location | Notes |
|---|---|---|
| `src/lib/email.ts` (`sendEmail`, `sendVerificationEmail`, `sendPasswordResetEmailWithLink`, etc.) | `src/providers/email-resend/` or new `src/features/auth/email.ts` | Appkit has `src/providers/email-resend/provider.ts`; higher-level sending helpers (verification, password reset) can live in `src/features/auth/` |

### 8h. Integration keys

| letitrip file | Target appkit location | Notes |
|---|---|---|
| `src/lib/integration-keys.ts` (`resolveKeys`, `invalidateIntegrationKeysCache`) | `src/providers/` or `src/core/integration-keys.ts` | Generic live-key resolution from Firestore; useful to any appkit consumer — promote to `src/core/` |

### 8i. DB Schema definitions

The `src/db/schema/` files define Firestore collection names, indexed fields, default data shapes, and ID generators for every letitrip collection. These are the canonical schema contracts and should live in appkit so other projects (`licorice`, `hobson`) can share them.

| letitrip directory | Target appkit location |
|---|---|
| `src/db/schema/addresses.ts` | `src/features/account/schema/addresses.ts` |
| `src/db/schema/bids.ts` | `src/features/auctions/schema/bids.ts` |
| `src/db/schema/blog-posts.ts` | `src/features/blog/schema/blog-posts.ts` |
| `src/db/schema/carousel-slides.ts` | `src/features/homepage/schema/carousel-slides.ts` |
| `src/db/schema/cart.ts` | `src/features/cart/schema/cart.ts` |
| `src/db/schema/categories.ts` | `src/features/categories/schema/categories.ts` |
| `src/db/schema/chat.ts` | `src/features/account/schema/chat.ts` |
| `src/db/schema/copilot-logs.ts` | `src/features/copilot/schema/copilot-logs.ts` |
| `src/db/schema/coupons.ts` | `src/features/promotions/schema/coupons.ts` |
| `src/db/schema/events.ts` | `src/features/events/schema/events.ts` |
| `src/db/schema/failed-checkouts.ts` | `src/features/checkout/schema/failed-checkouts.ts` |
| `src/db/schema/faqs.ts` | `src/features/faq/schema/faqs.ts` |
| `src/db/schema/field-names.ts` | `src/providers/db-firebase/field-names.ts` |
| `src/db/schema/homepage-sections.ts` | `src/features/homepage/schema/homepage-sections.ts` |
| `src/db/schema/notifications.ts` | `src/features/account/schema/notifications.ts` |
| `src/db/schema/offers.ts` | `src/features/products/schema/offers.ts` |
| `src/db/schema/orders.ts` | `src/features/orders/schema/orders.ts` |
| `src/db/schema/payouts.ts` | `src/features/seller/schema/payouts.ts` |
| `src/db/schema/products.ts` | `src/features/products/schema/products.ts` |
| `src/db/schema/reviews.ts` | `src/features/reviews/schema/reviews.ts` |
| `src/db/schema/sessions.ts` | `src/features/auth/schema/sessions.ts` |

> **Migration note:** Once a schema file is moved to appkit, update the corresponding `src/repositories/*.ts` and `functions/src/repositories/*.ts` imports. The `src/db/indices/merge-indices.ts` helper should move to `appkit/scripts/` or become a CLI command.

### 8j. Error handling — UI, API, and global runtime

Appkit already has the error *classes* (`AppError`, `ApiError`, `NotFoundError`, `AuthenticationError`, `AuthorizationError`, `ValidationError`, `DatabaseError`) and the API-layer handler (`createApiErrorHandler`, `createRouteHandler`). What is missing is:

1. **React UI error boundary component** — currently lives only in letitrip.
2. **Full-page error surfaces** (`global-error`, `not-found`, `unauthorized`) — each project currently builds its own; appkit should ship composable base components that apps wrap.
3. **Global runtime error bootstrap** (`setupGlobalErrorHandler`, `setupCacheMonitoring`) — registering `window.onerror` / `unhandledRejection` should be a shared utility.
4. **API response helpers** (`successResponse`, `errorResponse`, `ApiErrors`) — letitrip's `src/lib/api-response.ts` is independent; appkit's `createRouteHandler` covers the same ground but these helpers are also useful standalone.
5. **Logging helpers** — client-side and server-side loggers currently live in `src/helpers/logging/`; appkit's `Logger` class is the canonical implementation they should delegate to.

| letitrip file | Target appkit location | Status in appkit |
|---|---|---|
| `src/components/ErrorBoundary.tsx` (`class ErrorBoundary`) | `src/react/ErrorBoundary.tsx` | ✅ done |
| `src/app/global-error.tsx` | `src/next/components/GlobalError.tsx` (base component) | ✅ done |
| `src/app/[locale]/not-found.tsx` | `src/next/components/NotFoundView.tsx` (base component) | ✅ done |
| `src/app/[locale]/unauthorized/page.tsx` | `src/next/components/UnauthorizedView.tsx` (base component) | ✅ done |
| `src/app/[locale]/error.tsx` | `src/next/components/ErrorView.tsx` (base component) | ✅ done |
| `src/lib/monitoring/runtime.ts` (`setupGlobalErrorHandler`, `setupCacheMonitoring`) | `src/monitoring/runtime.ts` | ✅ done |
| `src/lib/api-response.ts` (`successResponse`, `errorResponse`, `ApiErrors`) | `src/next/api/api-response.ts` | ✅ done |
| `src/helpers/logging/error-logger.ts` (client: `logClientError` etc.) | `src/monitoring/client-logger.ts` | ✅ done |
| `src/helpers/logging/server-error-logger.ts` (`logServerError`, `extractRequestMetadata` etc.) | `src/monitoring/server-logger.ts` | ✅ done |
| `src/lib/monitoring/performance.ts` (`startTrace`, `stopTrace`, etc.) | `src/monitoring/performance.ts` | ✅ done |

**Suggested appkit API surface after migration:**

```ts
// src/react/ErrorBoundary.tsx
export class ErrorBoundary extends React.Component { ... }

// src/next/components/  (each is a base that projects override)
export function NotFoundView(props: NotFoundViewProps)
export function UnauthorizedView(props: UnauthorizedViewProps)
export function ErrorView(props: ErrorViewProps)
export function GlobalError(props: GlobalErrorProps)

// src/monitoring/runtime.ts
export function setupGlobalErrorHandler(opts?: GlobalErrorHandlerOptions): void
export function setupCacheMonitoring(): void

// src/next/api/api-response.ts
export function successResponse<T>(data: T, status?: number): NextResponse
export function errorResponse(code: string, message: string, status: number): NextResponse
export const ApiErrors: Record<string, { code: string; message: string; status: number }>

// src/monitoring/client-logger.ts  (delegates to Logger)
export const logClientError: (msg: string, ctx?: object) => void
// ... warn, info, debug

// src/monitoring/server-logger.ts  (delegates to Logger)
export const logServerError: (msg: string, ctx?: object) => void
export const extractRequestMetadata: (req: Request) => object
```

---

## 9. Move to Appkit — SSR Foundation Modules (🟢 new shared modules needed)

These modules are currently in letitrip but are useful for any SSR app. They should be migrated into appkit with project-level configurability.

| letitrip file | Target appkit location | Notes |
|---|---|---|
| `src/constants/routes.ts` | `src/next/routing/route-map.ts` | Promote route map into appkit since routing is mostly centralized there. Keep app-level route extension hooks. |
| `src/constants/seo.ts` | `src/seo/metadata.ts` | Extract SEO metadata helpers into framework-agnostic generators with app-level overrides. |
| `src/constants/site.ts` | `src/core/site-config.ts` | Replace static `SITE_CONFIG` with dynamic loader (`env`, DB, cache) and typed defaults for SSR/runtime contexts. |
| `src/utils/guest-cart.ts` | `src/features/cart/utils/guest-cart.ts` | Move guest-cart helpers behind a storage adapter so browser `localStorage` is optional and SSR-safe. |
| `src/utils/order-splitter.ts` | `src/features/orders/utils/order-splitter.ts` | Extract multi-seller split logic as configurable strategy/policy helpers for shared checkout flows. |
| `src/repositories/copilot-log.repository.ts` | `src/features/copilot/repository/copilot-log.repository.ts` | Add a generic Copilot conversation/log repository contract + Firebase implementation. |
| `src/repositories/newsletter.repository.ts` | `src/features/newsletter/repository/newsletter.repository.ts` | Add newsletter repository abstraction + provider integrations (`resend`, Mailchimp, etc.). |

**Migration notes:**

1. `routes` + `seo` + `site-config` should ship together as the SSR app foundation layer in appkit.
2. `copilot-log` and `newsletter` are currently under-implemented; make them first-class appkit features (contracts, providers, and basic UI wiring) before pruning letitrip copies.
3. Keep letitrip as a thin configuration/composition layer after migration (no business logic duplication).

---

## 10. Files to Keep Locally (letitrip-specific only)

Only files that are genuinely deployment-specific and have no cross-project value belong here.

- `functions/` — all Firebase Cloud Functions are letitrip-specific deployment units

---

## Summary Counts

| Priority | Files |
|---|---|
| 🔴 Delete immediately (shims) | ~20 |
| 🟡 Collapse to re-export | 6 |
| 🟠 Replace import + delete | ~110 |
| 🟢 Migration needed (repos + seed) | ~27 |
| 🟢 Move to appkit (new providers / schema) | ~35 |
| 🟢 Move to appkit (error handling + logging) | ~10 |
| 🟢 Move to appkit (SSR foundation modules) | 7 |
| Keep locally (letitrip-only) | ~1 |
