# Feature Modules — `src/features/`

> **Purpose**: Complete inventory of every business feature module under `src/features/`. These are Tier 2 in the three-tier architecture — they own all domain-coupled UI (views, sub-components, forms, table columns), domain hooks, feature-specific types, and feature-specific constants. Features compose Tier 1 primitives from `src/components/`; they never import from another feature.

---

## Architecture Reference

```
src/features/<domain>/
  components/   ← Views (*View.tsx), sub-components, forms, table columns
  hooks/        ← Data-fetching and mutation hooks
  types/        ← Feature-specific TypeScript types (if not already in src/types/)
  constants/    ← Feature-specific constants (sort options, status maps, etc.)
  services/     ← Pure business logic services (optional)
  index.ts      ← Barrel export
```

Import chain: **Page → Feature → `@/components` (Tier 1)**. A feature never imports from another feature.

---

## Feature Modules

### `about/`

| Layer      | Files           |
| ---------- | --------------- |
| components | `AboutView.tsx` |

---

### `admin/`

| Layer                      | Files                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| components (views)         | `AdminAnalyticsView.tsx`, `AdminBidsView.tsx`, `AdminBlogView.tsx`, `AdminCarouselView.tsx`, `AdminCategoriesView.tsx`, `AdminCouponsView.tsx`, `AdminEventsView.tsx`, `AdminFaqsView.tsx`, `AdminFeatureFlagsView.tsx`, `AdminMediaView.tsx`, `AdminOrdersView.tsx`, `AdminPayoutsView.tsx`, `AdminProductsView.tsx`, `AdminReviewsView.tsx`, `AdminSectionsView.tsx`, `AdminSiteView.tsx`, `AdminStoresView.tsx`, `AdminUsersView.tsx`, `AlgoliaDashboardView.tsx`, `DemoSeedView.tsx` |
| components (misc)          | `AdminSessionsManager.tsx`, `AdminTabs.tsx`, `QuickActionsGrid.tsx`                                                                                                                                                                                                                                                                                                                                                                                                                      |
| components (forms)         | `BlogForm.tsx`, `CarouselSlideForm.tsx`, `CategoryForm.tsx`, `CouponForm.tsx`, `FaqForm.tsx`, `OrderStatusForm.tsx`, `PayoutStatusForm.tsx`, `SectionForm.tsx`, `SiteBasicInfoForm.tsx`, `SiteCommissionsForm.tsx`, `SiteContactForm.tsx`, `SiteSocialLinksForm.tsx`                                                                                                                                                                                                                     |
| components (table columns) | `BidTableColumns.tsx`, `BlogTableColumns.tsx`, `CarouselTableColumns.tsx`, `CategoryTableColumns.tsx`, `CouponTableColumns.tsx`, `FaqTableColumns.tsx`, `OrderTableColumns.tsx`, `PayoutTableColumns.tsx`, `ReviewTableColumns.tsx`, `SectionTableColumns.tsx`, `SessionTableColumns.tsx`, `UserTableColumns.tsx`                                                                                                                                                                        |
| components (reviews)       | `ReviewDetailView.tsx`, `ReviewRowActions.tsx`, `ReviewStars.tsx`                                                                                                                                                                                                                                                                                                                                                                                                                        |
| components (users)         | `UserDetailDrawer.tsx`                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| components (types)         | `Carousel.types.ts`, `Faq.types.ts`, `Review.types.ts`, `Section.types.ts`, `User.types.ts`                                                                                                                                                                                                                                                                                                                                                                                              |
| hooks                      | `useAdminAnalytics.ts`, `useAdminBids.ts`, `useAdminBlog.ts`, `useAdminCarousel.ts`, `useAdminCategories.ts`, `useAdminCoupons.ts`, `useAdminFaqs.ts`, `useAdminFeatureFlags.ts`, `useAdminOrders.ts`, `useAdminPayouts.ts`, `useAdminProducts.ts`, `useAdminReviews.ts`, `useAdminSections.ts`, `useAdminStores.ts`, `useAdminUsers.ts`, `useDemoSeed.ts`                                                                                                                               |
| filters (`@/components`)   | `BidFilters.tsx`, `BlogFilters.tsx`, `CarouselFilters.tsx`, `CategoryFilters.tsx`, `CouponFilters.tsx`, `EventEntryFilters.tsx`, `EventFilters.tsx`, `FaqFilters.tsx`, `HomepageSectionFilters.tsx`, `NewsletterFilters.tsx`, `OrderFilters.tsx`, `PayoutFilters.tsx`, `ProductFilters.tsx`, `ReviewFilters.tsx`, `SessionFilters.tsx`, `StoreFilters.tsx`, `UserFilters.tsx`                                                                                                            |

---

### `auth/`

| Layer      | Files                                                                                                                                  |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| components | `AuthSocialButtons.tsx`, `ForgotPasswordView.tsx`, `LoginForm.tsx`, `RegisterForm.tsx`, `ResetPasswordView.tsx`, `VerifyEmailView.tsx` |

---

### `blog/`

| Layer                    | Files                                                                                  |
| ------------------------ | -------------------------------------------------------------------------------------- |
| components               | `BlogCategoryTabs.tsx`, `BlogFeaturedCard.tsx`, `BlogListView.tsx`, `BlogPostView.tsx` |
| filters (`@/components`) | `BlogFilters.tsx`                                                                      |

---

### `cart/`

| Layer                      | Files                                                                                                                                                                            |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| components                 | `CartItemList.tsx`, `CartItemRow.tsx`, `CartSummary.tsx`, `CartView.tsx`                                                                                                         |
| components (checkout)      | `CheckoutAddressStep.tsx`, `CheckoutOrderReview.tsx`, `CheckoutOtpModal.tsx`, `CheckoutSuccessView.tsx`, `CheckoutView.tsx`, `GuestCartItemRow.tsx`, `GuestCartMergerEffect.tsx` |
| components (order success) | `OrderSuccessActions.tsx`, `OrderSuccessCard.tsx`, `OrderSuccessHero.tsx`, `OrderSummaryPanel.tsx`                                                                               |
| components (promo)         | `PromoCodeInput.tsx`                                                                                                                                                             |
| hooks                      | `usePaymentOtp.ts`                                                                                                                                                               |
| filters (`@/components`)   | `OrderFilters.tsx`                                                                                                                                                               |

---

### `categories/`

| Layer                    | Files                                                                                                                        |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| components               | `CategoriesListView.tsx`, `CategoriesSelectorCreate.tsx`, `CategoryCard.tsx`, `CategoryGrid.tsx`, `CategoryProductsView.tsx` |
| hooks                    | `useCategoryDetail.ts`, `useCategoryProducts.ts`                                                                             |
| filters (`@/components`) | `CategoryFilters.tsx`                                                                                                        |

---

### `contact/`

| Layer      | Files                                       |
| ---------- | ------------------------------------------- |
| components | `ContactForm.tsx`, `ContactInfoSidebar.tsx` |

---

### `events/`

| Layer                      | Files                                                                                                                                                                                                                                                                                                                                                                 |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| components                 | `AdminEventsView.tsx`, `EntryReviewDrawer.tsx`, `EventCard.tsx`, `EventEntriesTable.tsx`, `EventFormDrawer.tsx`, `EventLeaderboard.tsx`, `EventParticipateView.tsx`, `EventsListView.tsx`, `EventsTable.tsx`, `EventStatsBanner.tsx`, `EventStatusBadge.tsx`, `FeedbackEventSection.tsx`, `PollVotingSection.tsx`, `SurveyEventSection.tsx`, `SurveyFieldBuilder.tsx` |
| components/EventTypeConfig | `FeedbackConfigForm.tsx`, `OfferConfigForm.tsx`, `PollConfigForm.tsx`, `SaleConfigForm.tsx`, `SurveyConfigForm.tsx`                                                                                                                                                                                                                                                   |
| hooks                      | `useEvent.ts`, `useEventEntries.ts`, `useEventLeaderboard.ts`, `useEventMutations.ts`, `useEvents.ts`, `useEventStats.ts`, `useFeedbackSubmit.ts`, `usePollVote.ts`                                                                                                                                                                                                   |
| constants                  | `EVENT_SORT_OPTIONS.ts`, `EVENT_STATUS_OPTIONS.ts`, `EVENT_TYPE_OPTIONS.ts`, `FORM_FIELD_TYPE_OPTIONS.ts`                                                                                                                                                                                                                                                             |
| types                      | `index.ts`                                                                                                                                                                                                                                                                                                                                                            |
| filters (`@/components`)   | `EventFilters.tsx`, `EventEntryFilters.tsx`                                                                                                                                                                                                                                                                                                                           |

---

### `faq/`

| Layer                    | Files                                                                                                                                                   |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| components               | `ContactCTA.tsx`, `FAQAccordion.tsx`, `FAQCategorySidebar.tsx`, `FAQHelpfulButtons.tsx`, `FAQPageContent.tsx`, `FAQSortDropdown.tsx`, `RelatedFAQs.tsx` |
| filters (`@/components`) | `FaqFilters.tsx`                                                                                                                                        |

---

### `homepage/`

| Layer      | Files                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| components | `AdvertisementBanner.tsx`, `BlogArticlesSection.tsx`, `CustomerReviewsSection.tsx`, `FAQSection.tsx`, `FeaturedAuctionsSection.tsx`, `FeaturedEventsSection.tsx`, `FeaturedPreOrdersSection.tsx`, `FeaturedProductsSection.tsx`, `FeaturedStoresSection.tsx`, `HeroCarousel.tsx`, `HomepageSkeleton.tsx`, `HowItWorksSection.tsx`, `SectionCarousel.tsx`, `SiteFeaturesSection.tsx`, `StatsCounterSection.tsx`, `TopBrandsSection.tsx`, `TopCategoriesSection.tsx`, `TrustFeaturesSection.tsx`, `TrustIndicatorsSection.tsx`, `WelcomeSection.tsx`, `WhatsAppCommunitySection.tsx` |

---

### `products/`

| Layer                    | Files                                                                                                                                                                                                                                                                                                                                             |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| components               | `AddToCartButton.tsx`, `AuctionDetailView.tsx`, `AuctionsView.tsx`, `BidHistory.tsx`, `PlaceBidForm.tsx`, `PreOrderDetailView.tsx`, `PreOrdersView.tsx`, `ProductActions.tsx`, `ProductDetailView.tsx`, `ProductFeatureBadges.tsx`, `ProductImageGallery.tsx`, `ProductInfo.tsx`, `ProductReviews.tsx`, `ProductsView.tsx`, `RelatedProducts.tsx` |
| hooks                    | `useAuctions.ts`, `usePreOrders.ts`, `useProducts.ts`                                                                                                                                                                                                                                                                                             |
| filters (`@/components`) | `ProductFilters.tsx`, `BidFilters.tsx`                                                                                                                                                                                                                                                                                                            |

---

### `promotions/`

| Layer                    | Files                                  |
| ------------------------ | -------------------------------------- |
| components               | `CouponCard.tsx`, `ProductSection.tsx` |
| filters (`@/components`) | `CouponFilters.tsx`                    |

---

### `reviews/`

| Layer                    | Files                 |
| ------------------------ | --------------------- |
| components               | `ReviewsListView.tsx` |
| filters (`@/components`) | `ReviewFilters.tsx`   |

---

### `search/`

| Layer      | Files                                                                |
| ---------- | -------------------------------------------------------------------- |
| components | `SearchFiltersRow.tsx`, `SearchResultsSection.tsx`, `SearchView.tsx` |
| hooks      | `useSearch.ts`                                                       |

---

### `seller/`

| Layer                       | Files                                                                                                                                                                                                                                                                                                                                                        |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| components (views)          | `SellerAddressesView.tsx`, `SellerAuctionsView.tsx`, `SellerCreateProductView.tsx`, `SellerDashboardView.tsx`, `SellerEditProductView.tsx`, `SellerOrdersView.tsx`, `SellerPayoutSettingsView.tsx`, `SellerProductsView.tsx`, `SellerShippingView.tsx`, `SellersListView.tsx`, `SellerStorefrontView.tsx`, `SellerStoreSetupView.tsx`, `SellerStoreView.tsx` |
| components (sub-components) | `PayoutTableColumns.tsx`, `SellerAnalyticsStats.tsx`, `SellerPayoutHistoryTable.tsx`, `SellerPayoutRequestForm.tsx`, `SellerPayoutStats.tsx`, `SellerProductCard.tsx`, `SellerQuickActions.tsx`, `SellerRecentListings.tsx`, `SellerRevenueChart.tsx`, `SellerStatCard.tsx`, `SellerTabs.tsx`, `SellerTopProducts.tsx`                                       |
| hooks                       | `useSellerOrders.ts`, `useSellerPayoutSettings.ts`, `useSellerProducts.ts`, `useSellerShipping.ts`, `useSellerStore.ts`                                                                                                                                                                                                                                      |
| filters (`@/components`)    | `PayoutFilters.tsx`, `OrderFilters.tsx`                                                                                                                                                                                                                                                                                                                      |

---

### `stores/`

| Layer                    | Files                                                                                                                                                       |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| components               | `StoreAboutView.tsx`, `StoreAuctionsView.tsx`, `StoreHeader.tsx`, `StoreNavTabs.tsx`, `StoreProductsView.tsx`, `StoreReviewsView.tsx`, `StoresListView.tsx` |
| hooks                    | `useStoreBySlug.ts`, `useStores.ts`                                                                                                                         |
| types                    | `index.ts`                                                                                                                                                  |
| filters (`@/components`) | `StoreFilters.tsx`                                                                                                                                          |

---

### `user/`

| Layer                       | Files                                                                                                                                                                                                                                                                                                |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| components (views)          | `BecomeSellerView.tsx`, `MessagesView.tsx`, `OrderDetailView.tsx`, `OrderTrackingView.tsx`, `PublicProfileView.tsx`, `RipCoinsPurchaseView.tsx`, `RipCoinsWallet.tsx`, `UserAddressesView.tsx`, `UserEditAddressView.tsx`, `UserNotificationsView.tsx`, `UserOrdersView.tsx`, `UserSettingsView.tsx` |
| components (sub-components) | `AddressSelectorCreate.tsx`, `BuyRipCoinsModal.tsx`, `ChatList.tsx`, `ChatWindow.tsx`, `NotificationItem.tsx`, `NotificationsBulkActions.tsx`, `UserTabs.tsx`                                                                                                                                        |
| hooks                       | `useOrderDetail.ts`, `useUserOrders.ts`                                                                                                                                                                                                                                                              |
| filters (`@/components`)    | `NotificationFilters.tsx`, `OrderFilters.tsx`, `RipCoinFilters.tsx`                                                                                                                                                                                                                                  |

---

### `wishlist/`

| Layer      | Files              |
| ---------- | ------------------ |
| components | `WishlistView.tsx` |

---

## Module Count Summary

| Feature    | Views | Sub-components | Hooks | Constants | Types |
| ---------- | ----- | -------------- | ----- | --------- | ----- |
| about      | 1     | —              | —     | —         | —     |
| admin      | 20    | 19             | 16    | —         | 5     |
| auth       | 6     | —              | —     | —         | —     |
| blog       | 2     | 2              | —     | —         | —     |
| cart       | 8     | 9              | 1     | —         | —     |
| categories | 3     | 2              | 2     | —         | —     |
| contact    | 2     | —              | —     | —         | —     |
| events     | 14    | 6              | 8     | 4         | 1     |
| faq        | 1     | 6              | —     | —         | —     |
| homepage   | —     | 21             | —     | —         | —     |
| products   | 4     | 11             | 3     | —         | —     |
| promotions | —     | 2              | —     | —         | —     |
| reviews    | 1     | —              | —     | —         | —     |
| search     | 1     | 2              | 1     | —         | —     |
| seller     | 13    | 12             | 5     | —         | —     |
| stores     | 7     | —              | 2     | —         | 1     |
| user       | 12    | 7              | 2     | —         | —     |
| wishlist   | 1     | —              | —     | —         | —     |

**Total: 18 feature modules**
