# Firestore Route → Field Usage Map

> Companion to [`firestore-index-requirements.md`](firestore-index-requirements.md) (index → requirement) — this is the inverse: for every route/page in the app, which Firestore collection(s) it touches and (where known) which fields it filters/sorts by. Purpose: spot routes using fields nobody registered, and fields that are registered but no route actually uses. Generated 2026-08-18 by walking every `page.tsx` under `src/app/[locale]/{admin,store,user}` plus the homepage-sections renderer, cross-referenced against `appkit/scripts/audit-listing-indices.mjs`'s (now-complete) `ENDPOINT_TO_COLLECTION`/`REPO_TO_COLLECTION` registries and this session's findings.
>
> **Confidence markers**: plain rows are either scanned by `audit-listing-indices.mjs` (exact filters/sorts known) or directly verified this session. `(inferred — not directly verified)` means the collection is a reasonable guess from the component name, not confirmed by reading the file. `(inline / no View component)` means the route builds its own query inline rather than rendering a shared `*View` component — open the file directly for its field usage.
>
> **Regenerating this doc**: the admin/store/user tables were produced by walking `src/app/[locale]/{admin,store,user}/**/page.tsx`, extracting the rendered `*View`/`*Client` component name, and mapping it to a collection. There's no checked-in script for this (the doc was requested as hand-written) — if you need to refresh it, re-walk the three directories and cross-reference `appkit/scripts/audit-listing-indices.mjs`'s registries for the authoritative collection per admin/seller `ListingViewConfig`-based view.

---

## Exact filter/sort data (from `audit-listing-indices.mjs`)

For the 45 admin/seller views built on `DataListingView`/`ListingViewConfig`, the audit script extracts the *actual* `filterKeys` + `sortOptions` values at scan time — this is stronger evidence than the inferred tables below since it's mechanically re-verified every `npm run check:audits` run. Regenerate with:

```
node appkit/scripts/audit-listing-indices.mjs
```

Snapshot as of this session (45 views, 0 blocking violations):

| View | Collection | Filters | Sorts |
|---|---|---|---|
| AdminAllEventEntriesView | eventEntries | — | submittedAt |
| AdminArtView | products | listingType== | title |
| AdminBidsView | bids | — | bidDate |
| AdminBlogView | blogPosts | isFeatured== | publishedAt, title |
| AdminBrandsView | categories | categoryType== | — |
| AdminBundlesView | categories | categoryType== | bundlePrice |
| AdminCartsView | carts | — | — |
| AdminClassifiedView | products | listingType== | title |
| AdminContactView | contactSubmissions | — | — |
| AdminCouponsView | coupons | — | code |
| AdminDigitalCodesView | products | listingType== | title |
| AdminHistoryView | history | — | — |
| AdminLiveView | products | listingType== | title |
| AdminNewsletterView | newsletterSubscribers | — | subscribedAt |
| AdminNotificationsView | notifications | — | — |
| AdminOrdersView | orders | — | — |
| AdminPayoutsView | payouts | — | — |
| AdminPrizeDrawsView | products | listingType== | title, prizeRevealWindowEnd |
| AdminProductsView | products | isSold== | title |
| AdminReviewsView | reviews | — | — |
| AdminScammersView | scammerProfiles | — | — |
| AdminSessionsView | sessions | — | lastActivity |
| AdminStickersView | products | listingType== | title |
| AdminStoreAddressesView | addresses | ownerType== | storeId, city |
| AdminStoresView | stores | — | storeName |
| AdminSublistingCategoriesView | categories | categoryType== | — |
| AdminSupportTicketsView | supportTickets | — | — |
| AdminTeamView | users | role== | displayName |
| AdminUsersView | users | disabled==, disabled== | displayName |
| AdminWishlistsView | wishlists | — | — |
| SellerArtView | products | listingType== | title |
| SellerAuctionsView | products | — | auctionEndDate |
| SellerBundlesView | categories | categoryType== | bundlePrice |
| SellerClassifiedView | products | listingType== | title |
| SellerCouponsView | coupons | — | code |
| SellerDigitalCodesView | products | listingType== | title |
| SellerGroupedListingsView | groupedListings | — | title |
| SellerLiveView | products | listingType== | title |
| SellerOffersView | offers | — | — |
| SellerPayoutsView | payouts | — | — |
| SellerPreOrdersView | products | listingType== | title, preOrderDeliveryDate |
| SellerPrizeDrawsView | products | listingType== | title, prizeRevealWindowEnd |
| SellerStickersView | products | listingType== | title |

("—" means the view either has no filter/sort controls, or the audit's regex couldn't extract one — doesn't necessarily mean broken, see the sievejs sweep in `firestore-index-bugfixes.md` for the controls that were actually checked by hand.)

---

## Homepage sections

`appkit/src/features/homepage/lib/section-renderer.tsx` has 25 section-type branches. Data is pre-fetched by the page-level server components (`HomepageView.tsx`/`MarketplaceHomepageView.tsx`) via the hooks/loaders under `appkit/src/features/homepage/hooks/`, then passed down as props — the renderer itself is a pure display function, not a query site.

| Section type | Backing hook/loader | Collection |
|---|---|---|
| `products` | `useFeaturedProducts` | products (listingType==standard, featured/promoted) |
| `auctions` | `useFeaturedAuctions` | products (listingType==auction) |
| `pre-orders` | `useFeaturedPreOrders` | products (listingType==pre-order) |
| `featured-bundles` | (bundle-specific loader) | categories (categoryType==bundle) |
| `prize-draws` | (prize-draw loader, shares products query shape) | products (listingType==prize-draw) |
| `stores` | `useFeaturedStores` | stores |
| `events` | `useHomepageEvents` | events |
| `reviews` | `useHomepageReviews` | reviews |
| `blog-articles` | `useBlogArticles` | blogPosts |
| `brands` | `useTopBrands` | categories (categoryType==brand) |
| `categories` | `useTopCategories` | categories |
| `carousel` | `useHeroCarousel` | carouselSlides |
| `newsletter` | `useNewsletter` | newsletterSubscribers (write path — subscribe) |
| `faq` | (FAQ loader) | faqs |
| `google-reviews` | `google-reviews-fetcher.ts` | storeGoogleConfig / external Google API |
| `social-feed` | `social-feed-fetcher.ts` | external (not Firestore) |
| `event-raffles` | (raffle-specific loader) | events, eventEntries |
| `welcome`, `stats`, `banner`, `trust-indicators`, `features`, `whatsapp-community`, `custom-cards`, `collection-cards` | — | static/config-driven (siteSettings or hardcoded), no per-item Firestore query beyond what's already covered above |

Section *type* config itself (which sections are enabled, in what order) lives in the `homepageSections` collection — see `AdminSectionsView` in the admin table below.

---

## Dashboards

| Dashboard | File | What it queries |
|---|---|---|
| `/admin` | `src/app/[locale]/admin/page.tsx` | Pure redirect to `/admin/dashboard` — no data itself |
| `/admin/dashboard` | → `AdminDashboardView` | Fans out to multiple repositories for stat tiles (orders, users, products, payouts summary counts) |
| `/store` | `src/app/[locale]/store/page.tsx` → `StoreDashboardView` | `useStoreDashboard` hook + `SellerTopProducts` — orders, products, payouts for the logged-in store |
| `/user` | `src/app/[locale]/user/page.tsx` → `UserAccountHubView` | `useOrders`, `useWishlistCount`, notifications, and other per-user summary hooks |

---

## Admin routes (124)

<!-- table-admin.md -->
| Route | Component | Collection / notes |
|---|---|---|
| `/admin/address-clusters` | AdminAddressClustersView | addresses — cluster/dedupe view |
| `/admin/addresses/[id]/edit` | AdminAddressEditorView | addresses |
| `/admin/addresses/new` | AdminAddressEditorView | addresses |
| `/admin/addresses` | AdminAddressBookView | addresses |
| `/admin/admin-notifications` | (inline / no View component) | (not extracted — open the route file directly) |
| `/admin/ads/[id]/edit` | AdminAdEditorView | ads |
| `/admin/ads/new` | AdminAdEditorView | ads |
| `/admin/ads` | AdminAdsView | ads |
| `/admin/analytics` | AdminAnalyticsClient | (analytics aggregate — pageViews + orders) |
| `/admin/art` | AdminArtView | products — listingType==art |
| `/admin/banned-addresses` | AdminAddressesView | addresses — banned-addresses, banStatus filter |
| `/admin/bids` | AdminBidsView | bids |
| `/admin/blog/[id]/edit` | BlogEditClient | blogPosts |
| `/admin/blog/new` | BlogNewClient | blogPosts |
| `/admin/blog` | AdminBlogView | blogPosts |
| `/admin/brands/[id]/edit` | AdminBrandEditorView | categories — categoryType==brand |
| `/admin/brands/new` | AdminBrandEditorView | categories — categoryType==brand |
| `/admin/brands` | AdminBrandsView | categories — categoryType==brand |
| `/admin/bundles/[id]/edit` | BundleEditClient | categories — categoryType==bundle |
| `/admin/bundles/new` | BundleNewClient | categories — categoryType==bundle |
| `/admin/bundles` | AdminBundlesView | categories — categoryType==bundle |
| `/admin/carousel/[id]/edit` | CarouselEditClient | carouselSlides |
| `/admin/carousel/new` | CarouselNewClient | carouselSlides |
| `/admin/carousel` | AdminCarouselView | carouselSlides |
| `/admin/carousels/[id]` | (inline / no View component) | (not extracted — open the route file directly) |
| `/admin/carousels` | AdminCarouselView | carouselSlides |
| `/admin/carts` | AdminCartsView | carts |
| `/admin/catalogue-approvals` | AdminCatalogueApprovalsView | catalogueItems — listingStatus==pending_admin_approval |
| `/admin/categories/[id]/edit` | CategoryEditClient | categories |
| `/admin/categories/new` | CategoryNewClient | categories |
| `/admin/categories` | AdminCategoriesView | categories |
| `/admin/classified` | AdminClassifiedView | products — listingType==classified |
| `/admin/contact` | AdminContactView | contactSubmissions |
| `/admin/copilot` | AdminCopilotView | copilotLogs |
| `/admin/coupons/[id]/edit` | CouponEditClient | coupons |
| `/admin/coupons/new` | CouponNewClient | coupons |
| `/admin/coupons` | AdminCouponsView | coupons |
| `/admin/dashboard` | AdminDashboardView | (multiple) — stat tiles fan out to several repos |
| `/admin/deals` | DataListingView | (inferred — not directly verified) |
| `/admin/digital-codes` | AdminDigitalCodesView | products — listingType==digital-code |
| `/admin/event-entries` | AdminAllEventEntriesView | eventEntries |
| `/admin/events/[id]/edit` | AdminEventEditorView | events |
| `/admin/events/[id]/entries` | AdminEventEntriesView | eventEntries — single-event scope |
| `/admin/events/new` | AdminEventEditorView | events |
| `/admin/events` | AdminEventsView | events |
| `/admin/faqs/[id]/edit` | FaqEditClient | faqs |
| `/admin/faqs/new` | FaqNewClient | faqs |
| `/admin/faqs` | AdminFaqsView | faqs |
| `/admin/feature-flags` | AdminFeatureFlagsView | siteSettings (singleton) |
| `/admin/featured` | DataListingView | (inferred — not directly verified) |
| `/admin/features/[id]/edit` | AdminFeatureEditorView | productFeatures |
| `/admin/features/new` | AdminFeatureEditorView | productFeatures |
| `/admin/features` | AdminFeaturesView | productFeatures |
| `/admin/fulfillment` | AdminFulfillmentView | orders — fulfillment queue |
| `/admin/guide/analytics` | AdminAnalyticsGuideView | (static content) |
| `/admin/guide/catalog` | AdminCatalogGuideView | (static content) |
| `/admin/guide/content` | AdminContentGuideView | (static content) |
| `/admin/guide/orders` | AdminOrdersGuideView | (static content) |
| `/admin/guide` | AdminGuideHubView | (static content) |
| `/admin/guide/site` | AdminSiteConfigGuideView | (static content) |
| `/admin/guide/stores` | AdminStoresGuideView | (static content) |
| `/admin/guide/team` | AdminTeamGuideView | (static content) |
| `/admin/guide/trust` | AdminTrustGuideView | (static content) |
| `/admin/guide/users` | AdminUsersGuideView | (static content) |
| `/admin/history` | AdminHistoryView | history — one-doc-per-user summaries |
| `/admin/item-requests` | (inline / no View component) | (not extracted — open the route file directly) |
| `/admin/live` | AdminLiveView | products — listingType==live |
| `/admin/lotteries/[id]/entries` | LotteryEntriesView | lotteryEntries |
| `/admin/lotteries` | LotteryListView | events — type==lottery-style events, unrelated to prize-draw listingType |
| `/admin/maintenance/analysis` | AnalysisRunnerView | serverErrors — diagnostic tool |
| `/admin/maintenance/client-errors` | ServerErrorsListView | serverErrors |
| `/admin/maintenance/cloud-logs` | (inline / no View component) | (not extracted — open the route file directly) |
| `/admin/maintenance/function-errors` | ServerErrorsListView | serverErrors |
| `/admin/maintenance` | MaintenanceDashboardView | serverErrors |
| `/admin/maintenance/payment-rollbacks` | ServerErrorsListView | serverErrors |
| `/admin/maintenance/server-errors/[id]` | ServerErrorDetailView | serverErrors |
| `/admin/maintenance/server-errors` | ServerErrorsListView | serverErrors |
| `/admin/media` | AdminMediaView | (Firebase Storage, not Firestore) |
| `/admin/moderation` | (inline / no View component) | (not extracted — open the route file directly) |
| `/admin/navigation` | AdminNavigationView | siteSettings (singleton) |
| `/admin/newsletter` | AdminNewsletterView | newsletterSubscribers |
| `/admin/notifications` | AdminNotificationsView | notifications |
| `/admin/orders` | AdminOrdersView | orders |
| `/admin` | (inline / no View component) | pure redirect to `/admin/dashboard` |
| `/admin/payment-methods/clusters` | AdminPaymentClustersView | savedPaymentMethods — cluster/dedupe view |
| `/admin/payment-methods` | AdminPaymentMethodsView | savedPaymentMethods |
| `/admin/payouts` | AdminPayoutsView | payouts |
| `/admin/print-center` | PrintCenterView | orders — label/invoice generation |
| `/admin/prize-draws/[id]/edit` | (inline / no View component) | (not extracted — open the route file directly) |
| `/admin/prize-draws/[id]/entries` | LotteryEntriesView | lotteryEntries |
| `/admin/prize-draws` | AdminPrizeDrawsView | products — listingType==prize-draw |
| `/admin/products/[id]/edit` | ProductEditClient | products |
| `/admin/products/new` | ProductNewClient | products |
| `/admin/products` | AdminProductsView | products |
| `/admin/reports` | (inline / no View component) | (not extracted — open the route file directly) |
| `/admin/return-requests` | AdminReturnRequestsView | orders — status==RETURN_REQUESTED |
| `/admin/reviews` | AdminReviewsView | reviews |
| `/admin/roles/[id]/edit` | (inline / no View component) | (not extracted — open the route file directly) |
| `/admin/roles/new` | (inline / no View component) | (not extracted — open the route file directly) |
| `/admin/roles` | (inline / no View component) | (not extracted — open the route file directly) |
| `/admin/scammers` | AdminScammersView | scammerProfiles |
| `/admin/sections` | AdminSectionsView | homepageSections |
| `/admin/sessions` | AdminSessionsView | sessions |
| `/admin/settings/actions` | (inline / no View component) | (not extracted — open the route file directly) |
| `/admin/settings/navigation` | (inline / no View component) | (not extracted — open the route file directly) |
| `/admin/shipments/[id]/edit` | AdminShipmentEditorView | procurementShipments |
| `/admin/shipments/[id]/lots/[lotId]/items` | AdminShipmentLotItemsView | shipmentItems |
| `/admin/shipments/new` | AdminShipmentEditorView | procurementShipments |
| `/admin/shipments` | AdminShipmentsView | procurementShipments |
| `/admin/shipments/projections` | AdminShipmentProjectionsView | shipmentLots |
| `/admin/site` | AdminSiteSettingsView | siteSettings (singleton) |
| `/admin/stickers` | AdminStickersView | products — listingType==stickers |
| `/admin/store-addresses` | AdminStoreAddressesView | addresses — ownerType==store |
| `/admin/stores` | AdminStoresView | stores |
| `/admin/sublisting-categories/[id]/edit` | SublistingCategoryEditClient | categories — categoryType==sublisting |
| `/admin/sublisting-categories/new` | SublistingCategoryNewClient | (inferred — not directly verified) |
| `/admin/sublisting-categories` | AdminSublistingCategoriesView | categories — categoryType==sublisting |
| `/admin/support-tickets` | AdminSupportTicketsView | supportTickets |
| `/admin/team` | AdminTeamView | users — role==employee |
| `/admin/tester-checklist` | AdminTesterChecklistView | testerChecklistItems |
| `/admin/tester-feedback` | AdminTesterFeedbackView | testerChecklistResponses |
| `/admin/users/[id]` | (inline / no View component) | (not extracted — open the route file directly) |
| `/admin/users` | AdminUsersView | users |
| `/admin/wishlists` | AdminWishlistsView | wishlists — one-doc-per-user summaries |

---

## Store (seller) routes (82)

| Route | Component | Collection / notes |
|---|---|---|
| `/store/addresses` | SellerAddressesView | addresses — ownerType==store, own store scope |
| `/store/analytics/alerts` | SellerAnalyticsAlertsView | analyticsAlerts |
| `/store/analytics/cards` | (inline / no View component) | (not extracted — open the route file directly) |
| `/store/analytics` | SellerAnalyticsView | analyticsCards |
| `/store/art/[id]/edit` | (inline / no View component) | (not extracted — open the route file directly) |
| `/store/art/new` | (inline / no View component) | (not extracted — open the route file directly) |
| `/store/art` | SellerArtView | products — listingType==art |
| `/store/auctions/[id]/edit` | (inline / no View component) | (not extracted — open the route file directly) |
| `/store/auctions/new` | (inline / no View component) | (not extracted — open the route file directly) |
| `/store/auctions` | (inline / no View component) | (not extracted — open the route file directly) |
| `/store/bids` | SellerBidsView | bids |
| `/store/bundles/[id]/edit` | StoreBundleEditClient | categories — categoryType==bundle |
| `/store/bundles/new` | StoreBundleNewClient | categories — categoryType==bundle |
| `/store/bundles` | SellerBundlesView | categories — categoryType==bundle |
| `/store/categories/[id]/edit` | (inline / no View component) | (not extracted — open the route file directly) |
| `/store/categories/new` | (inline / no View component) | (not extracted — open the route file directly) |
| `/store/categories` | SellerStoreCategoriesView | storeCategories |
| `/store/classified/[id]/edit` | (inline / no View component) | (not extracted — open the route file directly) |
| `/store/classified/new` | (inline / no View component) | (not extracted — open the route file directly) |
| `/store/classified` | SellerClassifiedView | products — listingType==classified |
| `/store/coupons/[id]/edit` | SellerCouponEditorView | coupons |
| `/store/coupons/new` | CouponNewClient | coupons |
| `/store/coupons` | SellerCouponsClient | coupons |
| `/store/digital-codes/[id]/edit` | (inline / no View component) | (not extracted — open the route file directly) |
| `/store/digital-codes/new` | (inline / no View component) | (not extracted — open the route file directly) |
| `/store/digital-codes` | SellerDigitalCodesView | products — listingType==digital-code |
| `/store/features/new` | (inline / no View component) | (not extracted — open the route file directly) |
| `/store/features` | SellerFeaturesView | productFeatures |
| `/store/fulfillment` | FulfillmentView | orders |
| `/store/google-reviews` | SellerGoogleReviewsView | storeGoogleConfig |
| `/store/grouped-listings/[id]/edit` | (inline / no View component) | (not extracted — open the route file directly) |
| `/store/grouped-listings/new` | (inline / no View component) | (not extracted — open the route file directly) |
| `/store/grouped-listings` | GroupedListingsClient | groupedListings |
| `/store/guide/capabilities` | StoreCapabilitiesGuideView | (static content) |
| `/store/guide/finance` | StoreFinanceGuideView | (static content) |
| `/store/guide/listings` | StoreListingsGuideView | (static content) |
| `/store/guide/orders` | StoreOrdersGuideView | (static content) |
| `/store/guide` | StoreGuideHubView | (static content) |
| `/store/guide/settings` | StoreSettingsGuideView | (static content) |
| `/store/inventory/print` | PrintCenterView | orders — label/invoice generation |
| `/store/listing-templates/[id]/edit` | (inline / no View component) | (not extracted — open the route file directly) |
| `/store/listing-templates/new` | (inline / no View component) | (not extracted — open the route file directly) |
| `/store/listing-templates` | (inline / no View component) | (not extracted — open the route file directly) |
| `/store/live/[id]/edit` | (inline / no View component) | (not extracted — open the route file directly) |
| `/store/live/new` | (inline / no View component) | (not extracted — open the route file directly) |
| `/store/live` | SellerLiveView | products — listingType==live |
| `/store/messages` | MessagesView | conversations |
| `/store/offers` | SellerOffersView | offers |
| `/store/orders` | SellerOrdersView | orders |
| `/store` | StoreDashboardView | (multiple) — stat tiles fan out to several repos |
| `/store/payout-methods/[id]/edit` | (inline / no View component) | (not extracted — open the route file directly) |
| `/store/payout-methods/new` | (inline / no View component) | (not extracted — open the route file directly) |
| `/store/payout-methods` | SellerPayoutMethodsView | payoutMethods |
| `/store/payout-settings` | SellerPayoutSettingsView | stores (payoutDetails field) |
| `/store/payouts` | SellerPayoutRequestView, SellerPayoutsView | payouts |
| `/store/pre-orders/[id]/edit` | (inline / no View component) | (not extracted — open the route file directly) |
| `/store/pre-orders/new` | (inline / no View component) | (not extracted — open the route file directly) |
| `/store/pre-orders` | (inline / no View component) | (not extracted — open the route file directly) |
| `/store/print-center` | PrintCenterView | orders — label/invoice generation |
| `/store/prize-draws/[id]/edit` | (inline / no View component) | (not extracted — open the route file directly) |
| `/store/prize-draws/[id]/entries` | LotteryEntriesView | lotteryEntries |
| `/store/prize-draws/new` | (inline / no View component) | (not extracted — open the route file directly) |
| `/store/prize-draws` | (inline / no View component) | (not extracted — open the route file directly) |
| `/store/products/[id]/edit` | (inline / no View component) | (not extracted — open the route file directly) |
| `/store/products/new` | (inline / no View component) | (not extracted — open the route file directly) |
| `/store/products` | SellerProductsClient | products |
| `/store/reviews` | SellerReviewsView | reviews |
| `/store/shipping-configs/[id]/edit` | (inline / no View component) | (not extracted — open the route file directly) |
| `/store/shipping-configs/new` | (inline / no View component) | (not extracted — open the route file directly) |
| `/store/shipping-configs` | SellerShippingConfigsView | shippingConfigs |
| `/store/shipping` | SellerShippingView | stores (shippingConfig field) |
| `/store/slug` | (inline / no View component) | (not extracted — open the route file directly) |
| `/store/stickers/[id]/edit` | (inline / no View component) | (not extracted — open the route file directly) |
| `/store/stickers/new` | (inline / no View component) | (not extracted — open the route file directly) |
| `/store/stickers` | SellerStickersView | products — listingType==stickers |
| `/store/storefront` | SellerStorefrontView | stores |
| `/store/sublisting-categories/[id]/edit` | (inline / no View component) | (not extracted — open the route file directly) |
| `/store/sublisting-categories/new` | (inline / no View component) | (not extracted — open the route file directly) |
| `/store/sublisting-categories` | (inline / no View component) | (not extracted — open the route file directly) |
| `/store/templates/new` | (inline / no View component) | (not extracted — open the route file directly) |
| `/store/templates` | SellerTemplatesView | product_templates |
| `/store/whatsapp` | SellerWhatsAppSettingsView | storeWhatsAppConfig |

---

## User routes (34)

| Route | Component | Collection / notes |
|---|---|---|
| `/user/addresses/add` | AddAddressClient | addresses — ownerType==user |
| `/user/addresses/edit/[id]` | EditAddressClient | addresses |
| `/user/addresses` | UserAddressesClient | addresses — ownerType==user |
| `/user/become-seller` | BecomeSellerView | users, stores |
| `/user/bids` | AuctionBidsTable | bids — client-side sort/filter only, see `firestore-index-bugfixes.md` |
| `/user/catalogue/[id]/edit` | CatalogueItemEditorView | catalogueItems |
| `/user/catalogue/new` | CatalogueItemEditorView | catalogueItems |
| `/user/catalogue` | UserCatalogueView | catalogueItems — ownerId==self |
| `/user/coupons` | (inline / no View component) | (not extracted — open the route file directly) |
| `/user/digital-codes` | (inline / no View component) | (not extracted — open the route file directly) |
| `/user/events` | (inline / no View component) | (not extracted — open the route file directly) |
| `/user/history` | (inline / no View component) | (not extracted — open the route file directly) |
| `/user/messages/[id]` | UserMessagesPage | conversations |
| `/user/messages` | MessagesView | conversations |
| `/user/notifications/[tab]` | (inline / no View component) | (not extracted — open the route file directly) |
| `/user/notifications` | UserNotificationsView | notifications — userId==self |
| `/user/offers` | (inline / no View component) | (not extracted — open the route file directly) |
| `/user/orders/[id]/cancel` | (inline / no View component) | (not extracted — open the route file directly) |
| `/user/orders/[id]/invoice` | (inline / no View component) | (not extracted — open the route file directly) |
| `/user/orders/[id]/payment` | (inline / no View component) | (not extracted — open the route file directly) |
| `/user/orders/[id]/track` | UserOrderTrackView | orders |
| `/user/orders` | UserOrdersView | orders — userId==self |
| `/user/orders/view/[id]` | OrderDetailView | orders |
| `/user` | UserAccountHubView | (multiple) — dashboard stat tiles |
| `/user/pre-orders` | (inline / no View component) | (not extracted — open the route file directly) |
| `/user/prize-draws` | (inline / no View component) | (not extracted — open the route file directly) |
| `/user/profile` | ProfilePageClient | users |
| `/user/returns` | UserReturnsView | orders — status==RETURN_REQUESTED, userId==self |
| `/user/reviews` | (inline / no View component) | (not extracted — open the route file directly) |
| `/user/settings` | AsyncPage | users — profile settings |
| `/user/support/[id]` | (inline / no View component) | (not extracted — open the route file directly) |
| `/user/support/new` | (inline / no View component) | (not extracted — open the route file directly) |
| `/user/support` | (inline / no View component) | (not extracted — open the route file directly) |
| `/user/tester` | TesterHubView | testerChecklistItems, testerChecklistResponses |

---

## Known gaps / follow-ups spotted while compiling this

- **~30 routes marked `(inline / no View component)`** — mostly single-item detail/edit/action pages (`/user/orders/[id]/cancel`, `/admin/roles/[id]/edit`, etc.) that build their query inline rather than through a shared `*View` component, so this doc's extraction script couldn't identify them automatically. None of these were flagged by `audit-listing-indices.mjs` either (it only scans `ListingViewConfig`-based views and `repo.list()`/`.listAll()` call sites with literal filter/sort strings). If you're auditing one of these routes specifically, open the file directly.
- **`/admin/lotteries`** and the **`/user/prize-draws`, `/user/pre-orders`, `/user/coupons`, `/user/digital-codes`, `/user/events`, `/user/history`, `/user/offers`, `/user/reviews`** routes are worth a closer look — several either don't render obviously (no matched View component) or (for `/admin/lotteries`) point at a completely different collection (`events`) than the name suggests, mirroring the `/lottery` vs `/prize-draws` naming confusion already flagged in the listing-type consolidation plan.
- **`/store/auctions`, `/store/pre-orders`, `/store/prize-draws`, `/store/sublisting-categories`, `/store/listing-templates`** list pages didn't match a `*View` component pattern — worth confirming these aren't dead/unwired routes the way `SellerAuctionsView`/`SellerPreOrdersView`/`SellerPrizeDrawsView` themselves turned out to be (see `firestore-index-bugfixes.md`).
