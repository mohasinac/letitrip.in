# Codebase Exports Catalog

> **Auto-generated catalog of every export from every source file in the LetItRip monorepo.**
> Update this file after every code change to track impact across the codebase.
> Last updated: 2026-05-22 (full from-scratch regeneration via 4 parallel scan agents)

---

## Table of Contents

1. [UI Components (appkit/src/ui/)](#1-ui-components)
2. [Feature View Components](#2-feature-view-components)
3. [Internal Server Features](#3-internal-server-features)
4. [Internal Client Features](#4-internal-client-features)
5. [Internal Shared](#5-internal-shared)
6. [Repositories](#6-repositories)
7. [Hooks](#7-hooks)
8. [Server Actions](#8-server-actions)
9. [API Routes (src/app/api/)](#9-api-routes)
10. [Constants](#10-constants)
11. [Types & Interfaces](#11-types--interfaces)
12. [Utils & Helpers](#12-utils--helpers)
13. [Registries](#13-registries)
14. [Schemas (Zod)](#14-schemas-zod)
15. [Seed Data](#15-seed-data)
16. [Page Shims (src/app/)](#16-page-shims)
17. [Config](#17-config)
18. [Tokens & Design System](#18-tokens--design-system)
19. [Route Map](#19-route-map)
20. [Firebase Jobs](#20-firebase-jobs)
21. [Audit Scripts](#21-audit-scripts)

---

## 1. UI Components

### Layout Primitives (`appkit/src/ui/components/Layout.tsx`)

| Export | Type | Props/Signature | Purpose |
|--------|------|-----------------|---------|
| Container | Component | size, as, surface, padding, rounded, border, shadow, children | Page-level container with max-width, centering, responsive padding |
| Stack | Component | gap, centered, align, as, surface, padding, rounded, border, shadow, children | Vertical flex column with responsive gap |
| Row | Component | gap, centered, align, justify, wrap, as, surface, padding, rounded, border, shadow, children | Horizontal flex row with alignment control |
| Grid | Component | cols, gap, as, surface, padding, rounded, border, shadow, children | Responsive CSS grid with multiple layout presets |
| GAP_MAP | Constant | {none, px, xs, sm, 2.5, 3, md, 5, lg, xl, 2xl} | Gap token map for spacing |
| GRID_MAP | Constant | {1-6, cards, productCards, sidebar, etc.} | Responsive grid column presets |
| GapKey | Type | keyof GAP_MAP | Gap token type |
| GridCols | Type | keyof GRID_MAP | Grid column preset type |
| ContainerSize | Type | keyof CONTAINER_MAP | Container size type |
| ViewPortal | Type | "admin" \| "seller" \| "user" \| "public" | Portal context type |

### Typography (`appkit/src/ui/components/Typography.tsx`)

| Export | Type | Props/Signature | Purpose |
|--------|------|-----------------|---------|
| Heading | Component | level, variant, color, className, children | Semantic heading (h1-h6) with color variants |
| Text | Component | variant, color, size, weight, as, className, children | Flexible text element with size/weight/color control |
| Label | Component | required, className, children | Form label with optional required indicator |
| Caption | Component | variant, className, children | Small caption text (default, accent, inverse) |
| Span | Component | variant, color, size, weight, className, children | Inline text wrapper with optional styling |
| ColorVariant | Type | keyof TYPOGRAPHY.colorVariant | Color variant type |
| TYPOGRAPHY | Constant | {headingLevel, textSize, textWeight, colorVariant} | Typography token map |

### Semantic HTML (`appkit/src/ui/components/Semantic.tsx`)

| Export | Type | Props/Signature | Purpose |
|--------|------|-----------------|---------|
| Section | Component | children, surface, padding, rounded, border, shadow | Semantic `<section>` for thematically grouped content |
| Article | Component | children, surface, padding, rounded, border, shadow | Semantic `<article>` for self-contained compositions |
| Main | Component | children, surface, padding, rounded, border, shadow | Semantic `<main>` wrapping primary page content |
| Aside | Component | children, surface, padding, rounded, border, shadow | Semantic `<aside>` for supplementary content |
| Nav | Component | aria-label (required), children | Semantic `<nav>` with enforced aria-label |
| BlockHeader / Header | Component | children, surface, padding, rounded, border, shadow | Block-level `<header>` for component headers |
| BlockFooter / Footer | Component | children, surface, padding, rounded, border, shadow | Block-level `<footer>` for component footers |
| Ul | Component | children | Semantic `<ul>` for unordered lists |
| Ol | Component | children | Semantic `<ol>` for ordered lists |
| Li | Component | children | Semantic `<li>` list item |
| Table | Component | variant, size, stickyHeader, surface, padding, rounded, border, shadow, children | Semantic `<table>` with style variants (default, striped, bordered) |
| Thead | Component | children | Semantic `<thead>` table head section |
| Tbody | Component | children | Semantic `<tbody>` table body section |
| Tr | Component | hover, children | Semantic `<tr>` with optional hover state |
| Th | Component | align, children | Semantic `<th>` table header cell |
| Td | Component | align, children | Semantic `<td>` table data cell |
| Code | Component | color, className, children | Semantic `<code>` inline code (default, primary, error, success) |
| Pre | Component | surface, padding, rounded, border, shadow, children | Semantic `<pre>` code block |
| Blockquote | Component | color, surface, padding, rounded, border, shadow, children | Semantic `<blockquote>` (default, primary, info, warning) |
| Figure | Component | surface, padding, rounded, border, shadow, children | Semantic `<figure>` for images/illustrations |
| Figcaption | Component | children | Semantic `<figcaption>` for figure captions |
| Dl | Component | variant, surface, padding, rounded, border, shadow, children | Semantic `<dl>` description list (stacked, inline) |
| Dt | Component | children | Semantic `<dt>` description term |
| Dd | Component | children | Semantic `<dd>` description details |

### Div (`appkit/src/ui/components/Div.tsx`)

| Export | Type | Props/Signature | Purpose |
|--------|------|-----------------|---------|
| Div | Component | surface, padding, rounded, border, shadow, className, children | Generic div with surface token support |
| DivProps | Type | HTMLDivAttributes & SurfaceProps | Div props interface |

### Surface Tokens (`appkit/src/ui/components/surface-tokens.ts`)

| Export | Type | Props/Signature | Purpose |
|--------|------|-----------------|---------|
| SURFACE_MAP | Constant | {none, default, muted, subtle, inset, card, elevated, interactive, glass, form} | Surface/background token map |
| PADDING_MAP | Constant | {none, xs, sm, md, lg, xl, card, section, sectionSm, page, inline, inlineSm, inlineLg} | Padding token map |
| ROUNDED_MAP | Constant | {none, sm, md, lg, xl, 2xl, full} | Border radius token map |
| BORDER_MAP | Constant | {none, default, subtle, strong, dashed} | Border style token map |
| SHADOW_MAP | Constant | {none, sm, md, lg, xl} | Box shadow token map |
| buildSurfaceClasses | Function | (props: SurfaceProps) => string | Builds tailwind classes from surface tokens |
| SurfaceProps | Type | {surface?, padding?, rounded?, border?, shadow?} | Surface token props interface |
| SurfaceKey | Type | keyof SURFACE_MAP | Surface token key type |
| PaddingKey | Type | keyof PADDING_MAP | Padding token key type |
| RoundedKey | Type | keyof ROUNDED_MAP | Rounded token key type |
| BorderKey | Type | keyof BORDER_MAP | Border token key type |
| ShadowKey | Type | keyof SHADOW_MAP | Shadow token key type |

### Motion & Animation (`appkit/src/ui/components/Motion.tsx`)

| Export | Type | Props/Signature | Purpose |
|--------|------|-----------------|---------|
| AnimatePresence | Component | (motion/react re-export) | Animate presence wrapper for exit animations |
| FadeIn | Component | delay, duration, children | Fade in animation (0→1 opacity) |
| SlideUp | Component | delay, distance, children | Slide up animation with fade |
| SlideIn | Component | direction, delay, distance, children | Slide in from any direction (left/right/up/down) |
| ScaleIn | Component | delay, children | Scale in animation (0.95→1) |
| Collapse | Component | isOpen, children | Animate height collapse/expand |
| PressScale | Component | scale, children | Scale on tap/click (0.97 default) |
| HoverLift | Component | lift, children | Lift up on hover (y: -2 default) |
| AnimatedList | Component | staggerDelay, children | Staggered list item animations |
| AnimatedDiv | Component | delay, children | Animated div wrapper (fade) |
| AnimatedStack | Component | delay, className, children | Animated flex column (fade) |
| AnimatedRow | Component | delay, className, children | Animated flex row (fade) |
| Draggable | Component | axis, constraints, dragElastic, children | Draggable container wrapper |
| Swipeable | Component | onSwipeLeft, onSwipeRight, threshold, children | Swipeable container (x-axis) |

### Button (`appkit/src/ui/components/Button.tsx`)

| Export | Type | Props/Signature | Purpose |
|--------|------|-----------------|---------|
| Button | Component | variant, size, isLoading, children, asChild, action, ...buttonProps | Versatile button with ripple, variants (primary, secondary, outline, ghost, danger, warning), action registry support |
| ButtonProps | Type | {variant?, size?, isLoading?, asChild?, action?} | Button props interface |

### Input (`appkit/src/ui/components/Input.tsx`)

| Export | Type | Props/Signature | Purpose |
|--------|------|-----------------|---------|
| Input | Component | label, error, helperText, icon, rightIcon, success, bare, variant | Text input with icon, label, error state, helper text |
| InputProps | Type | {label?, error?, helperText?, icon?, rightIcon?, success?, bare?, variant?} | Input props interface |

### Select (`appkit/src/ui/components/Select.tsx`)

| Export | Type | Props/Signature | Purpose |
|--------|------|-----------------|---------|
| Select | Component | options, value, onChange, onValueChange, placeholder, label, error, helperText, required, variant | Styled native select with label and error handling |
| SelectOption | Type | {label, value, disabled?} | Select option object type |
| SelectProps | Type | {options, value?, onChange?, onValueChange?, ...} | Select props interface |

### Card (`appkit/src/ui/components/Card.tsx`)

| Export | Type | Props/Signature | Purpose |
|--------|------|-----------------|---------|
| Card | Component | variant, padding, hover, animate, surface, rounded, border, shadow, className, children, onClick | Flexible card with 14 variants, animation modes, surface tokens |
| CardHeader | Component | children, className | Card header section |
| CardBody | Component | children, className | Card body/content section |
| CardFooter | Component | children, className | Card footer section |
| CardProps | Type | {variant?, padding?, hover?, animate?, ...SurfaceProps} | Card props interface |

### Badge (`appkit/src/ui/components/Badge.tsx`)

| Export | Type | Props/Signature | Purpose |
|--------|------|-----------------|---------|
| Badge | Component | children, variant, className | Compact status/role badge with ring border variants |
| BadgeVariant | Type | "active" \| "inactive" \| "pending" \| "approved" \| "rejected" \| "success" \| "warning" \| "danger" \| "info" \| "admin" \| "moderator" \| "seller" \| "employee" \| "user" \| "default" \| "primary" \| "secondary" | Badge variant type |

### Modal (`appkit/src/ui/components/Modal.tsx`)

| Export | Type | Props/Signature | Purpose |
|--------|------|-----------------|---------|
| Modal | Component | isOpen, open, onClose, title, children, size, showCloseButton, actions, className | Portal-rendered modal dialog with keyboard/focus management |
| ModalFooter | Component | children, className | Modal footer section |
| ModalProps | Type | {isOpen?, open?, onClose, title?, children, size?, ...} | Modal props interface |

### Toast (`appkit/src/ui/components/Toast.tsx`)

| Export | Type | Props/Signature | Purpose |
|--------|------|-----------------|---------|
| ToastProvider | Component | children, position | Toast provider wrapper (context) |
| useToast | Hook | () => {showToast, hideToast} | Toast context hook |
| ToastVariant | Type | "success" \| "error" \| "warning" \| "info" | Toast notification variant |
| ToastPosition | Type | "top-right" \| "top-left" \| "bottom-right" \| "bottom-left" \| "top-center" \| "bottom-center" | Toast position type |

### Additional UI Components

| File | Export | Type | Purpose |
|------|--------|------|---------|
| Checkbox.tsx | Checkbox | Component | Styled checkbox with label, error, indeterminate support |
| Textarea.tsx | Textarea | Component | Multi-line text input with label, error, counter |
| Toggle.tsx | Toggle | Component | Toggle switch (pill-style) |
| Radio.tsx | Radio, RadioGroup | Component | Radio button and group |
| Slider.tsx | Slider | Component | Range slider |
| DateInput.tsx | DateInput | Component | Date input with formatting |
| OtpInput.tsx | OtpInput | Component | One-time password input (6-digit) |
| TagInput.tsx | TagInput | Component | Tag/chip input with add/remove |
| PaginatedSelect.tsx | PaginatedSelect | Component | Unified searchable, async-paginated select — single (default) or multi (`multiple` prop), with optional inline "+ Create new" drawer. Replaced DynamicSelect / InlineCreateSelect / PaginatedMultiSelect 2026-05-23. |
| SideDrawer.tsx | SideDrawer | Component | Side panel drawer |
| SideModal.tsx | SideModal | Component | Side modal (wider drawer) |
| Drawer.tsx | Drawer | Component | Bottom/side drawer |
| StatusBadge.tsx | StatusBadge | Component | Status-specific badge |
| RoleBadge.tsx | RoleBadge | Component | User role badge |
| Alert.tsx | Alert | Component | Alert banner (success/error/warning/info) |
| Tooltip.tsx | Tooltip | Component | Hover tooltip |
| Avatar.tsx | Avatar | Component | User avatar with fallback |
| Accordion.tsx | Accordion, AccordionItem | Component | Expandable accordion panels |
| Tabs.tsx | Tabs | Component | Tab navigation |
| Pagination.tsx | Pagination | Component | Page navigation controls |
| Dropdown.tsx | Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, DropdownSeparator | Component | Composite dropdown/menu system with keyboard support |
| Skeleton.tsx | Skeleton | Component | Loading skeleton placeholder |
| Spinner.tsx | Spinner | Component | Loading spinner |
| Progress.tsx | Progress | Component | Progress bar |
| Breadcrumb.tsx | Breadcrumb | Component | Breadcrumb navigation |
| Divider.tsx | Divider | Component | Visual separator |
| EmptyState.tsx | EmptyState | Component | Empty/no-data state with icon + CTA |
| IconButton.tsx | IconButton | Component | Icon-only button |
| TextLink.tsx | TextLink | Component | Styled inline link |
| StarRating.tsx | StarRating | Component | Star rating display/input |
| PriceDisplay.tsx | PriceDisplay | Component | Currency-formatted price |
| CountdownDisplay.tsx | CountdownDisplay | Component | Countdown timer |
| SiteLogo.tsx | SiteLogo | Component | SVG wordmark + admin-override pipeline |
| PageLoader.tsx | PageLoader | Component | Full-page loading with 15s timeout |
| ViewToggle.tsx | ViewToggle | Component | Grid/list view toggle |
| ResponsiveView.tsx | ResponsiveView | Component | Responsive breakpoint-aware container |
| ImageGallery.tsx | ImageGallery | Component | Image gallery with lightbox |
| ImageLightbox.tsx | ImageLightbox | Component | Fullscreen image viewer |
| BackgroundRenderer.tsx | BackgroundRenderer | Component | Background image/video/gradient renderer |
| DashboardStatsCard.tsx | DashboardStatsCard | Component | Dashboard metric card |
| StatsGrid.tsx | StatsGrid | Component | Grid of stat cards |
| SummaryCard.tsx | SummaryCard | Component | Summary/overview card |
| FlowDiagram.tsx | FlowDiagram | Component | Flow/step diagram |
| BaseListingCard.tsx | BaseListingCard, BaseListingCard.Checkbox | Component | Base card for marketplace listings with selection support |
| FormShell.tsx | FormShell | Component | Form wrapper with Zod schema, validateOnChange, splitPreview |
| FormGroup.tsx | FormGroup | Component | Logical form field group |
| FormField.tsx | FormField | Component | Individual form field |
| FormActionBar.tsx | FormActionBar | Component | Form submit/cancel action bar |
| ConfirmDeleteModal.tsx | ConfirmDeleteModal | Component | Confirm destructive action modal |
| UnsavedChangesModal.tsx | UnsavedChangesModal | Component | Unsaved changes warning modal |
| LoginRequiredModal.tsx | LoginRequiredModal | Component | Login prompt modal |
| QuickCreateModal.tsx | QuickCreateModal | Component | Quick create entity modal |
| PasswordStrengthIndicator.tsx | PasswordStrengthIndicator | Component | Password strength meter |
| RichTextEditor.tsx | RichTextEditor | Component | Rich text/HTML editor |
| DescriptionField.tsx | DescriptionField | Component | Description textarea with rich text |
| ItemRow.tsx | ItemRow | Component | Horizontal item display row |
| ActiveFilterChips.tsx | ActiveFilterChips | Component | Active filter chip display |
| FilterChipGroup.tsx | FilterChipGroup | Component | Filter chip group |
| FilterDrawer.tsx | FilterDrawer | Component | Filter sidebar/drawer |
| BulkActionBar.tsx | BulkActionBar | Component | Bulk selection action bar |
| RowActionMenu.tsx | RowActionMenu | Component | Row-level action dropdown |
| SortDropdown.tsx | SortDropdown | Component | Sort column/direction dropdown |
| SectionTabs.tsx | SectionTabs | Component | Section tab navigation |
| TabStrip.tsx | TabStrip | Component | Horizontal tab strip |
| StepperNav.tsx | StepperNav | Component | Multi-step navigation |
| HorizontalScroller.tsx | HorizontalScroller | Component | Horizontal scroll container with arrows |
| ListingLayout.tsx | ListingLayout | Component | Listing page layout shell |
| ListingViewShell.tsx | ListingViewShell | Component | Listing view scaffold |
| SlottedListingView.tsx | SlottedListingView | Component | Slot-based listing view |
| StackedViewShell.tsx | StackedViewShell | Component | Stacked card view scaffold |
| DetailViewShell.tsx | DetailViewShell | Component | Detail page scaffold |
| ListingToolbar.tsx | ListingToolbar | Component | Search/filter/sort toolbar |
| VacationBanner.tsx | VacationBanner | Component | Store vacation mode banner |
| ClaimCouponButton.tsx | ClaimCouponButton | Component | Coupon claim CTA button |

---

## 2. Feature View Components

### Account (`appkit/src/features/account/components/`)

| Export | Type | Purpose |
|--------|------|---------|
| UserSidebar | Component | Account navigation sidebar |
| AddressCard, AddressBook | Component | Display and manage user addresses |
| AddressForm | Component | Form for creating/editing addresses |
| AddressSelectorCreate | Component | Address selector with create option |
| NotificationBell | Component | Notification bell icon with dropdown |
| NotificationPreferencesPanel | Component | Notification preference settings |
| UserAccountHubView | View | Main user account hub/dashboard |
| ProfileView | View | User profile display and edit |
| UserSettingsView | View | User settings and preferences |
| UserOrdersView | View | User orders listing and history |
| OrderDetailView | View | Single order detail view |
| UserAddressesView | View | Address book management |
| UserNotificationsView | View | Notification center |
| UserOffersView, UserOffersPanel | View | User offers/negotiations |
| MessagesView | View | User messaging view |
| ChatList, ChatWindow | Component | Chat conversations list and window |
| BecomeSellerView | View | Seller registration form |
| UserOrderTrackView | View | Order tracking page |
| UserReturnsView | View | Returns and refunds management |
| UserSupportView | View | Support/ticket interface |

### Admin (`appkit/src/features/admin/components/`)

| Export | Type | Purpose |
|--------|------|---------|
| DataTable | Component | Generic data table for admin listings |
| QuickEditMenu | Component | Context menu for quick edits |
| AdminListingScaffold | Component | Template for admin list views |
| DashboardStatsGrid | Component | Dashboard statistics grid |
| AdminDashboardView | View | Main admin dashboard |
| AdminProductsView | View | Admin products listing |
| AdminProductEditorView | View | Admin product editor |
| AdminOrdersView | View | Admin orders management |
| AdminOrderEditorView | View | Order editor |
| AdminUsersView | View | Admin user management |
| AdminUserEditorView | View | User editor |
| AdminStoresView | View | Stores management |
| AdminStoreEditorView | View | Store editor |
| AdminCategoriesView | View | Categories management |
| AdminCategoryEditorView | View | Category editor |
| AdminBrandsView | View | Brands management |
| AdminBrandEditorView | View | Brand editor |
| AdminBidsView | View | Auction bids view |
| AdminCouponsView | View | Coupons management |
| AdminCouponEditorView | View | Coupon editor |
| AdminBlogView | View | Blog posts management |
| AdminBlogEditorView | View | Blog post editor |
| AdminFaqsView | View | FAQs management |
| AdminFaqEditorView | View | FAQ editor |
| AdminEventsView | View | Events management |
| AdminEventEditorView | View | Event editor |
| AdminEventEntriesView | View | Event entries management |
| AdminAllEventEntriesView | View | All event entries listing |
| AdminReviewsView | View | Reviews management |
| AdminPayoutsView | View | Payouts management |
| AdminSectionsView | View | Homepage sections management |
| AdminCarouselView | View | Carousel management |
| AdminCarouselEditorView | View | Carousel editor |
| AdminAdsView, AdminAdEditorView | View | Ads management and editor |
| AdminMediaView | View | Media management |
| AdminNavigationView | View | Navigation management |
| AdminNavEditorView | View | Navigation editor |
| AdminSiteView | View | Site configuration |
| AdminSiteSettingsView | View | Site settings |
| AdminAnalyticsView | View | Analytics dashboard |
| AdminSessionsView, AdminSessionsManager | View | Sessions management |
| AdminNotificationsView | View | Notifications management |
| AdminCartsView | View | User carts management |
| AdminWishlistsView | View | User wishlists management |
| AdminHistoryView | View | User history management |
| AdminPrizeDrawsView | View | Prize draws management |
| AdminBundlesView, AdminBundleEditorView | View | Bundles management and editor |
| AdminSublistingCategoriesView, AdminSublistingCategoryEditorView | View | Sublisting categories |
| AdminFeaturesView, AdminFeatureEditorView | View | Product features management |
| AdminFeatureFlagsView | View | Feature flags management |
| AdminTeamView | View | Team management |
| AdminEmployeeEditorView | View | Employee editor |
| AdminSupportTicketsView, AdminSupportTicketDetailView | View | Support tickets |
| AdminScammersView, AdminScammerEditorView | View | Scammers registry |
| AdminReturnRequestsView | View | Return requests management |
| AdminStoreAddressesView | View | Store addresses management |
| AdminAddressEditorView | View | Address editor |
| AdminNewsletterView | View | Newsletter management |
| AdminContactView, AdminContactEditorView | View | Contact management |
| AdminCopilotView | View | AI Copilot admin interface |
| DemoSeedView | View | Demo data seeding |
| QuickActionsPanel | Component | Quick actions panel |
| AdminSidebar, AdminTopBar | Component | Admin sidebar and top bar |
| AdminFilterBar, AdminPageHeader | Component | Filter bar and page header |
| DrawerFormFooter | Component | Form footer in drawer |
| CategoryQuickCreateForm, BrandQuickCreateForm | Form | Quick create forms |
| AdminStatCard, AdminRevenueChart, AdminOrdersChart, AdminTopProductsTable | Component | Analytics components |

### Auctions (`appkit/src/features/auctions/components/`)

| Export | Type | Purpose |
|--------|------|---------|
| MarketplaceAuctionCard | Card | Auction card for marketplace |
| MarketplaceAuctionGrid | Grid | Auctions grid display |
| AuctionsListView | View | Auctions list view |
| AuctionDetailPageView | Page | Single auction detail page |
| AuctionBidsTable | Table | Bids history table |

### Auth (`appkit/src/features/auth/components/`)

| Export | Type | Purpose |
|--------|------|---------|
| RoleGate, ProtectedRoute | Component | Route protection and role checking |
| SocialAuthButtons | Component | OAuth sign-in buttons |
| AuthStatusPanel | Component | Auth status display |
| LoginForm | Form | Login form |
| RegisterForm | Form | Registration form |
| ForgotPasswordView | View | Forgot password page |
| ResetPasswordView | View | Password reset page |
| VerifyEmailView | View | Email verification page |
| OAuthLoadingView | View | OAuth loading state |

### Blog (`appkit/src/features/blog/components/`)

| Export | Type | Purpose |
|--------|------|---------|
| BlogCard, BlogCategoryTabs, BlogListView | View | Blog posts listing |
| BlogIndexListing | Listing | Blog index/search listing |
| BlogFilters | Filter | Blog filtering |
| BlogFeaturedCard | Card | Featured blog post card |
| BlogPostForm | Form | Blog post editor form |
| BlogPostView | View | Single blog post view |

### Cart & Checkout (`appkit/src/features/cart/components/`)

| Export | Type | Purpose |
|--------|------|---------|
| CartItemRow, CartDrawer | Component | Cart sidebar drawer |
| CartView | View | Full cart page |
| CartSummary | Component | Cart summary widget |
| CheckoutView | View | Checkout page |
| CheckoutAddressStep | Step | Checkout address step |
| CheckoutOtpModal | Modal | OTP verification modal |
| CheckoutSuccessView | View | Checkout success page |
| ShippingPicker | Component | Shipping method picker |
| CheckoutStepper | Component | Checkout progress stepper |

### Categories (`appkit/src/features/categories/components/`)

| Export | Type | Purpose |
|--------|------|---------|
| CategoryCard, CategoryGrid | Grid | Category grid display |
| CategoryTree | Tree | Hierarchical category tree |
| BreadcrumbTrail | Navigation | Category breadcrumbs |
| CategoryFilters, CategorySortSelect | Filter | Category filtering |
| CategoryProductsView | View | Products in category |
| CategoryProductsListing | Listing | Category products listing |
| CategoryForm | Form | Category editor form |
| CategorySelectorCreate | Component | Category selector with create |
| CategoryDetailTabs | Tabs | Category detail tabs |
| CategoriesIndexListing | Listing | Categories index/search |
| ConcernCard, ConcernGrid | Component | Concern category display |
| BundleBuyNowCta | Button | Bundle direct checkout CTA |
| BundleDynamicRuleEditor | Form | Bundle dynamic rule editor |
| BundleCollage | Display | Bundle products collage |
| BundleItemsPicker | Picker | Multi-select bundle items picker |
| CategoryBundlesListing | Listing | Bundles in category |
| CategoryStoresListing | Listing | Stores in category |

### Events (`appkit/src/features/events/components/`)

| Export | Type | Purpose |
|--------|------|---------|
| EventStatusBadge | Badge | Event status badge |
| EventCard | Card | Event card |
| EventFilters | Filter | Event filtering |
| EventsListView | View | Events listing |
| EventsIndexListing | Listing | Events index/search |
| EventDetailView | View | Single event detail |
| EventParticipateView | View | Event participation form |
| EventLeaderboard | Component | Event leaderboard display |
| EventFormDrawer | Drawer | Event form drawer |
| EventBanner | Banner | Event banner |
| EventPollWidget | Widget | Event poll widget |
| EventRafflesSection | Section | Raffles section in event |
| EventRaffleWinnerView | View | Raffle winner announcement |
| SpinWheelView | View | Spin wheel game |

### FAQ (`appkit/src/features/faq/components/`)

| Export | Type | Purpose |
|--------|------|---------|
| FAQAccordion, FAQCategoryTabs | Accordion | FAQ accordion |
| FAQCategorySidebar | Sidebar | FAQ category navigation |
| FAQSortDropdown | Select | FAQ sort selector |
| FAQHelpfulButtons | Component | Helpful/unhelpful vote buttons |
| RelatedFAQs | List | Related FAQs section |
| ContactCTA | Button | Contact CTA |
| FAQPageContent | Page | FAQ page content |

### Homepage (`appkit/src/features/homepage/components/`)

| Export | Type | Purpose |
|--------|------|---------|
| HomepageView | View | Homepage |
| MarketplaceHomepageView | View | Marketplace homepage |
| HeroSection, HeroBanner, HeroCarousel | Section | Hero area components |
| WelcomeSection | Section | Welcome/greeting section |
| ShopByCategorySection | Section | Shop by category section |
| FeaturedProductsSection | Section | Featured products section |
| FeaturedAuctionsSection | Section | Featured auctions section |
| FeaturedPreOrdersSection | Section | Featured pre-orders section |
| FeaturedStoresSection | Section | Featured stores section |
| FeaturedResultsSection | Section | Featured results section |
| EventsSection | Section | Events section |
| TrustBadges, TrustFeaturesSection, TrustIndicatorsSection | Section | Trust elements |
| SecurityHighlightsSection | Section | Security highlights |
| SiteFeaturesSection | Section | Site features section |
| StatsCounterSection | Section | Statistics counter section |
| HowItWorksSection, HowItWorksInfoView | Section | How it works instructions |
| CustomerReviewsSection, HomepageCustomerReviewsSection | Section | Customer reviews |
| FAQSection | Section | FAQ section |
| NewsletterSection, NewsletterBanner | Section | Newsletter signup |
| BlogArticlesSection | Section | Blog articles section |
| CTABannerSection | Section | Call-to-action banner |
| WhatsAppCommunitySection | Section | WhatsApp community CTA |
| AdvertisementBanner, AdSlot | Component | Ad placement |
| AnnouncementBar | Component | Announcement banner |
| TestimonialsCarousel, SectionCarousel | Carousel | Carousel components |
| PromoGrid | Grid | Promotional grid |
| CharacterHotspot, CharacterHotspotForm | Component | Interactive hotspot |
| HomepageSkeleton | Skeleton | Homepage loading skeleton |

### Products (`appkit/src/features/products/components/`)

| Export | Type | Purpose |
|--------|------|---------|
| ProductCard, ProductGrid | Grid | Product grid display |
| InteractiveProductCard | Card | Interactive product card with selection |
| ProductsView | View | Products listing page |
| ProductDetailView | View | Single product detail page |
| AuctionDetailView | View | Auction detail view |
| PreOrderDetailView | View | Pre-order detail view |
| ProductForm | Form | Product editor form |
| ProductInfo | Component | Product information display |
| ProductTabs, ProductTabsShell | Tabs | Product detail tabs |
| ProductGalleryClient | Gallery | Product image gallery |
| BidHistory | Component | Auction bid history |
| PlaceBidForm | Form | Place bid form |
| MakeOfferForm, MakeOfferButton | Component | Make offer components |
| RelatedProducts, RelatedProductsCarousel | Component | Related products |
| CustomFieldsEditor, CustomSectionsEditor, CustomSectionTabContent | Editor | Custom fields/sections |
| NonRefundableConsentModal | Modal | Non-refundable product consent |
| PrizeDrawItemsEditor | Editor | Prize draw items editor |
| PrizeDrawCollage | Display | Prize draw items collage |
| PrizeRevealModal | Modal | Prize reveal animation |
| PrizeDrawEntryActions | Actions | Prize draw entry actions |
| PrizeDrawsSection, PrizeDrawsIndexListing | Component | Prize draws listing |
| MarketplacePrizeDrawCard | Card | Prize draw marketplace card |
| MarketplaceBundleCard | Card | Bundle marketplace card |
| ProductFeaturesSelector | Selector | Product features multi-select |
| ProductFeatureBadges, FeatureBadge, FeatureBadgeList | Badge | Feature badges display |
| ProductFeaturesProvider, useProductFeatures | Context | Product features context |
| CompareOverlay | Overlay | Product comparison |
| SublistingCategorySelect | Select | Sublisting category picker |
| SublistingCarouselSection | Section | Sublisting carousel |
| ShowGroupSection, GroupSettingsPanel | Component | Grouped listing display |

### Seller / Store Dashboard (`appkit/src/features/seller/components/`)

| Export | Type | Purpose |
|--------|------|---------|
| SellerDashboardView | View | Seller dashboard |
| SellerProductsView | View | Seller products listing |
| SellerAuctionsView | View | Seller auctions |
| SellerPreOrdersView | View | Seller pre-orders |
| SellerPrizeDrawsView | View | Seller prize draws |
| SellerOrdersView | View | Seller orders |
| SellerBidsView | View | Seller auction bids |
| SellerCouponsView, SellerCouponEditorView | View | Seller coupons |
| SellerReviewsView | View | Seller reviews |
| SellerPayoutsView | View | Seller payouts history |
| SellerPayoutStats, SellerPayoutHistoryTable | Component | Payout statistics |
| SellerPayoutSettingsView | View | Payout configuration |
| SellerPayoutRequestView | View | Payout withdrawal form |
| SellerPayoutMethodsView | View | Payout bank accounts |
| SellerAnalyticsView | View | Seller analytics dashboard |
| SellerAnalyticsAlertsView | View | Analytics alerts configuration |
| SellerCreateProductView, SellerEditProductView | View | Product creation/editing |
| SellerProductShell | Shell | Product creation/edit template |
| SellerStoreSetupView | View | Store setup wizard |
| SellerStoreView | View | Store/seller settings |
| SellerStorefrontView | View | Store customization |
| SellerShippingView | View | Shipping settings |
| SellerShippingConfigsView | View | Shipping configuration |
| SellerAddressesView | View | Seller address book |
| SellerGuideView | View | Seller documentation |
| SellerOffersView, SellerOffersPanel | View | Seller offers/negotiation |
| SellerFeaturesView | View | Feature management |
| SellerGroupedListingsView | View | Grouped listings management |
| SellerStoreCategoriesView | View | Store category management |
| SellerTemplatesView | View | Product templates |
| SellerBundlesView | View | Seller bundles |
| SellerClassifiedView | View | Classified ads management |
| SellerDigitalCodesView | View | Digital codes management |
| SellerLiveView | View | Live streaming management |
| SellerGoogleReviewsView | View | Google reviews integration |
| PrintCenterView | View | Label/document printing |
| SellerSidebar, SellerStatCard | Component | Dashboard navigation/stats |
| CategoryInlineSelect, BrandInlineSelect | Select | Inline entity pickers |
| SellersListView | View | Public sellers directory |

### Stores (`appkit/src/features/stores/components/`)

| Export | Type | Purpose |
|--------|------|---------|
| StoreHeader | Header | Store page header |
| StoreNavTabs | Tabs | Store page navigation |
| StoreAboutView | View | Store about/info page |
| StoreProductsView | View | Store products page |
| StoreAuctionsView | View | Store auctions page |
| StoreReviewsView | View | Store reviews page |
| InteractiveStoreCard | Card | Interactive store card |
| StoresIndexListing | Listing | Stores index/search |
| StoreProductsListing | Listing | Products in store listing |
| StoreAuctionsListing | Listing | Auctions in store listing |
| StoreReviewsListing | Listing | Reviews in store listing |
| StorePreOrdersListing | Listing | Pre-orders in store listing |
| StoreAddressSelectorCreate | Selector | Store address selector |
| StoreGuideHubView | View | Store guide documentation |
| StoreListingsGuideView, StoreOrdersGuideView, StoreFinanceGuideView, StoreCapabilitiesGuideView, StoreSettingsGuideView | View | Guide views |

### Other Feature Components

| Feature | Export | Type | Purpose |
|---------|--------|------|---------|
| classified | ClassifiedListView, ClassifiedIndexListing, ClassifiedFilters | View/Filter | Classifieds listing and filtering |
| digital-codes | DigitalCodesListView, DigitalCodesIndexListing, DigitalCodeFilters | View/Filter | Digital codes listing and filtering |
| live | LiveItemsListView, LiveItemsIndexListing, LiveItemFilters | View/Filter | Live items listing and filtering |
| orders | OrderCard, OrdersList, MarketplaceOrderCard | Component | Order display components |
| orders | OrderFilters, OrderSiblingPayments | Component | Order filtering, sibling payments |
| orders | RefundHistoryTable, RefundRequestView | Component | Refund components |
| pre-orders | MarketplacePreorderCard, PreOrderFilters | Component | Pre-order card and filtering |
| pre-orders | PreOrdersListView, PreOrdersIndexListing | View | Pre-orders listing |
| pre-orders | PreOrderDetailPageView | Page | Pre-order detail page |
| promotions | CouponCard, CouponsIndexListing | Component | Coupon display |
| promotions | PromotionsView, PromotionsHero | View | Promotions/offers page |
| reviews | ReviewCard, ReviewsList, ReviewFilters | Component | Reviews display |
| reviews | ReviewSummary, ViewReviewModal | Component | Review summary and modal |
| reviews | ReviewsIndexListing | Listing | Reviews index/search |
| search | Search | Component | Search input with suggestions |
| search | SearchFiltersRow, SearchResultsSection | Component | Search UI |
| search | SearchView | View | Full search page |
| wishlist | WishlistCard, WishlistPage, WishlistView | View | Wishlist page |
| wishlist | WishlistToggleButton | Button | Add to wishlist button |
| wishlist | WishlistCapWatcher | Watcher | Wishlist capacity monitor |
| scams | ScamRegistryView, ScamProfileView | View | Scam registry |
| scams | ScamAwarenessModal | Modal | Scam awareness warning |
| contact | ContactForm, ContactInfoSidebar, ContactPageView | Component | Contact page |
| whatsapp-bot | WhatsAppChatButton, SellerWhatsAppSettingsView | Component | WhatsApp integration |
| loyalty | CoinsBadge, CoinsDisplay | Display | Loyalty coins display |
| collections | CollectionCard, CollectionGrid | Component | Collection display |
| before-after | BeforeAfterSlider, BeforeAfterGallery | Component | Before/after image comparison |

---

## 3. Internal Server Features

### Data Fetchers (`appkit/src/_internal/server/features/`)

| Domain | Export | Signature | Purpose |
|--------|--------|-----------|---------|
| account | getAccountForDetail | cache(uid, opts?) | Fetch full account profile |
| account | listAddressesForUser | cache(uid, opts?) | Fetch address book |
| auctions | getAuctionForDetail | cache(slugOrId) | Fetch auction details |
| auctions | getProductFeaturesForAuction | cache(storeId) | Load features for auction |
| blog | getBlogPostForDetail | cache(slug) | Fetch blog post by slug |
| blog | getBlogPostById | cache(id) | Fetch blog post by ID |
| brands | getBrandForDetail | cache(slugOrId) | Fetch brand details |
| brands | getBrandCategoryForDetail | cache(slugOrId) | Fetch brand category |
| cart | getCartForUser | cache(userId) | Fetch user's cart |
| events | getEventForDetail | cache(slugOrId) | Fetch event details |
| history | getHistoryForUser | cache(userId) | Fetch user view history |
| orders | getOrderForDetail | cache(orderId) | Fetch order details |
| orders | getOrdersForBuyer | cache(buyerId) | Fetch buyer's orders |
| orders | getRecentOrdersForBuyer | cache(buyerId) | Fetch recent orders |
| pre-orders | getPreOrderForDetail | cache(slugOrId) | Fetch pre-order details |
| pre-orders | getProductFeaturesForPreOrder | cache(storeId) | Load features for pre-order |
| products | getProductForDetail | cache(slugOrId) | Fetch product details |
| products | getReviewsForProduct | cache(productId) | Fetch product reviews |
| products | listSitemapProducts | async() | List products for sitemap |
| promotions | getCouponByCode | cache(code) | Fetch coupon details |
| reviews | getReviewsForProduct | cache(productId) | Fetch product reviews |
| reviews | getReviewsForStore | cache(storeId) | Fetch store reviews |
| reviews | hasUserPurchasedProduct | cache(userId, productId) | Check purchase history |
| search | getSearchResults | cache(query) | Fetch search results |
| wishlist | getWishlistForUser | cache(userId) | Fetch user's wishlist |
| wishlist | isProductInWishlist | cache(userId, productId) | Check if product is wishlisted |

### Service Layer

| Domain | Export | Purpose |
|--------|--------|---------|
| auctions | assertAuctionActive, assertBidAmount, assertNotAuctionOwner, computeMinBid, shouldAutoExtend | Auction business logic |
| blog | assertBlogPostExists, computeReadTime | Blog validation |
| brands | assertBrandExists, assertBrandSlugUnique | Brand validation |
| cart | assertCartCapacity, upsertCartItem, mergeGuestItems | Cart business logic |
| events | assertEventActive, isEventAcceptingRegistrations | Event validation |
| orders | assertOrderOwnership, assertOrderCancellable | Order validation |
| payments | resolvePaymentFee | Payment fee calculation |
| pre-orders | assertPreOrderAvailable, computeDeposit, isPreOrderOpen | Pre-order business logic |
| promotions | validateCoupon, computeDiscount | Coupon validation/calculation |

### Adapters

| Domain | Export | Purpose |
|--------|--------|---------|
| orders | orderDocumentToOrder | Convert Firestore doc to Order shape |
| classified | adapters (barrel) | Classified data adapters |
| digital-code | adapters (barrel) | Digital code adapters |
| live | adapters (barrel) | Live item adapters |

### OG Image Renderers

| Domain | Export | Purpose |
|--------|--------|---------|
| auctions | renderAuctionOgImage, renderAuctionOg | Auction OG image + metadata |
| blog | renderBlogOgImage, renderBlogOg | Blog OG image + metadata |
| brands | renderBrandOgImage, renderBrandOg | Brand OG image + metadata |
| events | renderEventOgImage, renderEventOg | Event OG image + metadata |
| pre-orders | renderPreOrderOgImage, renderPreOrderOg | Pre-order OG image + metadata |
| products | renderProductOgImage, renderProductOg | Product OG image + metadata |
| profile | renderPrivateProfileOgImage, renderUserProfileOgImage, renderProfileOg | Profile OG image + metadata |
| reviews | renderReviewOgImage, renderReviewOg | Review OG image + metadata |
| scams | renderScamOgImage, renderScamOg | Scam report OG image + metadata |
| stores | renderStoreOgImage, renderStoreOg | Store OG image + metadata |
| sublisting-categories | renderSublistingCategoryOgImage, renderSublistingCategoryOg | Sublisting OG image + metadata |
| seo | buildDefaultOgImage, resolveOgImageUrl | Default OG image rendering |

### SEO

| Export | Purpose |
|--------|---------|
| buildRobots | Build robots.txt |
| buildManifest | Build web manifest |
| buildSitemap | Build XML sitemap |

---

## 4. Internal Client Features

| Export | File | Type | Purpose |
|--------|------|------|---------|
| DashboardLayoutClient | layout/DashboardLayoutClient.tsx | Component | Unified dashboard sidebar manager (admin/store/user) |
| RoleGuard | layout/RoleGuard.tsx | Component | Auth guard wrapper with role checks |
| SidebarCollapseToggle | layout/SidebarCollapseToggle.tsx | Component | Sidebar collapse/expand handle |
| filterNavItems | layout/filterNavItems.ts | Function | Filter nav items by enabled status & permissions |
| ClassifiedDetailView | features/classified/ | Component | Classified listing detail view |
| DigitalCodeDetailView | features/digital-code/ | Component | Digital code listing detail |
| CodeRevealPanel | features/digital-code/ | Component | Digital code reveal UI |
| LiveItemDetailView | features/live/ | Component | Live item detail view |
| makeCategoryLoadOptions | features/filters/ | Factory | Create category filter loader |
| makeCategoryFacetLoadOptions | features/filters/ | Factory | Create category facet loader |
| LabelsProvider | i18n/LabelsProvider.tsx | Component | i18n context provider (zero-dependency) |
| useLabels | i18n/LabelsProvider.tsx | Hook | Access label translations |
| AppShell | scaffolds/AppShell.tsx | Component | Main application shell scaffold |
| DashboardScaffold | scaffolds/DashboardScaffold.tsx | Component | Dashboard layout scaffold |

---

## 5. Internal Shared

### Action Registry (`appkit/src/_internal/shared/actions/action-registry.ts`)

| Export | Type | Purpose |
|--------|------|---------|
| ACTIONS | ActionTree | Master action registry — 23 resource buckets (PRODUCT, AUCTION, PRE_ORDER, PRIZE_DRAW, CLASSIFIED, DIGITAL_CODE, LIVE, BUNDLE, GROUP, CATEGORY, BRAND, SUBLISTING, STORE, BLOG, EVENT, USER, SELLER, ADMIN, CART, CHECKOUT, NAV, MEDIA, SUPPORT) |
| action() | Function | Pluck action by resource + id |
| canPerformAction() | Function | Permission gate (admin always passes) |
| actionsForListingType() | Function | Filter by listing type scope |
| actionLabel() | Function | Resolve label (i18n hook placeholder) |
| act() | Function | Shorthand for action() |
| ActionKind | Type | "primary" \| "secondary" \| "danger" \| "ghost" \| "link" \| "chip" |
| ActionResource | Type | Union of 23 resource buckets |
| ActionDef | Interface | Action definition (id, label, ariaLabel, description, kind, permissions, confirmation, iconKey) |
| ActionConfirmation | Interface | Confirmation dialog config |

### Config Schema

| Export | Type | Purpose |
|--------|------|---------|
| AppkitConfig | Interface | Consumer's contract with appkit CLI |
| AppkitBrandConfig | Interface | Brand identity |
| AppkitSeoConfig | Interface | SEO defaults |
| AppkitI18nConfig | Interface | i18n routing |
| AppkitFirebaseConfig | Interface | Firebase project config |
| AppkitVercelConfig | Interface | Vercel project config |
| AppkitImagePattern | Interface | next/image remotePattern |
| AppkitAuthFixture | Interface | Auth fixture with cookie header |
| AppkitSmokeRoute | Interface | Smoke test route |

### Error Classes

| Export | Extends | Code | Purpose |
|--------|---------|------|---------|
| AppkitError | Error | — | Base domain error with code field |
| NotFoundError | AppkitError | NOT_FOUND | 404-style errors |
| ValidationError | AppkitError | VALIDATION_ERROR | Input validation errors |
| UnauthorizedError | AppkitError | UNAUTHORIZED | Auth/permission errors |
| ConflictError | AppkitError | CONFLICT | Conflict/duplicate errors |
| CapacityError | AppkitError | CAPACITY_EXCEEDED | Limit exceeded |
| ExpiredError | AppkitError | EXPIRED | Resource expired |

### Design System Tokens (`appkit/src/_internal/shared/tokens/`)

| Export | Type | Purpose |
|--------|------|---------|
| SEMANTIC_COLORS | Object | Light-mode semantic color aliases |
| SEMANTIC_COLORS_DARK | Object | Dark-mode overrides |
| SEMANTIC_RADIUS | Object | Radius aliases |
| SEMANTIC_SHADOWS | Object | Shadow aliases |
| SEMANTIC_Z_INDEX | Object | Z-index semantic names |
| MOTION_TOKENS | Object | Duration & easing tokens |
| BREAKPOINTS | Object | Responsive breakpoints (xs=0, sm=480, md=768, lg=1024, xl=1280, 2xl=1536) |
| PLATFORM_LIMITS | Object | Wishlist max 20, history max 50, cart max 50, auction increment 5% |

### Feature Configs (per-domain)

| Domain | Key Constants | Purpose |
|--------|--------------|---------|
| auctions | AUCTIONS_PAGE_SIZE, AUCTIONS_ACTIVE_LIMIT, AUCTION_MIN_BID_INCREMENT_PAISE, AUCTION_SNIPING_WINDOW_SECONDS | Auction limits |
| blog | BLOG_PAGE_SIZE, BLOG_FEATURED_LIMIT, BLOG_RELATED_LIMIT | Blog limits |
| cart | CART_MAX_ITEMS, CART_GUEST_STORAGE_KEY | Cart limits |
| events | Event config constants | Event limits |
| history | HISTORY_MAX, HISTORY_GUEST_STORAGE_KEY | History limits |
| orders | ORDERS_PAGE_SIZE, ORDER_CANCELLABLE_STATUSES, ORDER_RETURN_WINDOW_DAYS | Order limits |
| products | PRODUCTS_PAGE_SIZE, PRODUCTS_FEATURED_LIMIT, PRODUCTS_RELATED_LIMIT | Product limits |
| promotions | COUPONS_PAGE_SIZE, COUPON_CODE_MAX_LENGTH | Coupon limits |
| reviews | REVIEWS_PAGE_SIZE, REVIEW_MAX_RATING, REVIEW_IMAGES_MAX | Review limits |
| wishlist | WISHLIST_MAX, WISHLIST_GUEST_STORAGE_KEY | Wishlist limits |

---

## 6. Repositories

| Repository Class | Collection | Key Methods | Purpose |
|------------------|-----------|-------------|---------|
| BaseRepository (FirebaseRepository) | — | findById, list, create, update, delete, exists, count | Base CRUD class |
| UserRepository | users | findByEmail, findByPhone | User account management |
| EmailVerificationTokenRepository | emailVerificationTokens | create, findById, delete, deleteExpired | Email verification tokens |
| PasswordResetTokenRepository | passwordResetTokens | create, findById, delete, deleteExpired | Password reset tokens |
| SessionRepository | sessions | findByUserId, deleteExpired | User session management |
| SmsCounterRepository | smsCounters | increment, get, reset, findByPhone | SMS rate limiting |
| AddressesRepository | addresses | findByOwner, setDefault | User and store addresses |
| ProductRepository / ProductsRepository | products | listByStatus, listByStore, publish, unpublish, search | Product listings |
| OrderRepository / OrdersRepository | orders | listByUser, listByStore, listByStatus, updateStatus | Order management |
| ReviewRepository / ReviewsRepository | reviews | listByProduct, listByUser, listByStore | Product reviews |
| BidRepository | auctions/bids | listByAuction | Auction bid management |
| CartRepository | carts | getOrCreate, addItem, updateItem, removeItem, clear, findByUserId | Shopping cart |
| StoreRepository | stores | findByUserId, search, findBySlug | Store/seller profiles |
| SiteSettingsRepository | siteSettings | findAll | Site configuration |
| NotificationRepository | notifications | listByUser, markAsRead, markAsUnread | Notifications |
| ChatRepository | chats | addMessage, findByParticipants | Chat/messaging |
| CarouselRepository / CarouselsRepository | carousels | — | Carousel management |
| HomepageSectionsRepository | homepageSections | reorder | Homepage sections |
| CategoriesRepository | categories | listByType, findBySlug, getTree | Category management |
| CouponsRepository | coupons | findByCode, validate | Coupon codes |
| ClaimedCouponsRepository | claimedCoupons | listByUser, listByStore | Coupon redemptions |
| FAQsRepository / FirebaseFAQsRepository | faqs | search, listByCategory, findBySlug | FAQ management |
| BlogRepository | blogs | publish, unpublish, search, listByCategory | Blog posts |
| PayoutRepository | payouts | listByStore, listByStatus, updateStatus | Seller payouts |
| GroupedListingsRepository | groupedListings | findByStore, findByCategory | Grouped products |
| PayoutMethodsRepository | stores/payoutMethods | findByStore | Seller bank accounts |
| ShippingConfigsRepository | stores/shippingConfigs | findByStore | Seller shipping rules |
| AnalyticsCardsRepository | stores/analyticsCards | findByStore | Custom analytics |
| AnalyticsAlertsRepository | stores/analyticsAlerts | findByStore | Analytics alerts |
| StoreCategoriesRepository | stores/categories | findByStore | Store-specific categories |
| ListingTemplatesRepository | stores/templates | findByStore | Product templates |
| ModerationQueueRepository | stores/moderation | listByStatus | Content moderation |
| ReportsRepository | stores/reports | listByStatus, findByReporter | User/content reports |
| ItemRequestsRepository | stores/itemRequests | findByStore | Product requests |
| StoreWhatsAppConfigRepository | stores/whatsapp | findByStore | WhatsApp integration |
| StoreGoogleConfigRepository | stores/google | findByStore | Google integration |
| RoleOverridesRepository | stores/roleOverrides | findByStore | Custom RBAC rules |
| CustomRolesRepository | stores/customRoles | findByStore | Custom user roles |
| AdminNotificationsRepository | stores/adminNotifications | listByStore | Admin alerts |
| OfferRepository | offers | listByProduct, listByUser, listByStore | Price negotiation |
| WishlistRepository | wishlists | getOrCreate, addItem, removeItem, findByUser, isFull | Wishlists |
| HistoryRepository | history | addItem, removeItem, findByUser, clear | View history |
| EventRepository / EventsRepository | events | findBySlug, listByStatus | Events |
| EventEntryRepository / EventEntriesRepository | eventEntries | findByEvent, findByUser | Event participation |
| NewsletterRepository | newsletter | findByEmail, subscribe, unsubscribe | Newsletter |
| CopilotLogRepository | copilotLogs | findByUser | AI chat history |
| ScammerRepository | scammers | findByUserId, findByPhone | Scam registry |
| SupportRepository | supportTickets | findByStatus, addMessage | Support tickets |
| ProductTemplateRepository | productTemplates | findByStore | Listing templates |
| ProductFeaturesRepository | productFeatures | search, listByStore | Product features |
| UnitOfWork | — | transaction wrapper | Atomic multi-collection operations |

---

## 7. Hooks

### Auth Hooks

| Hook | Returns | Purpose |
|------|---------|---------|
| useCurrentUser | User state | Current authenticated user |
| useLogin | Mutation | Email/password login |
| useGoogleLogin | Mutation | Google OAuth login |
| useRegister | Mutation | User registration |
| useVerifyEmail | Mutation | Email verification |
| useResendVerification | Mutation | Resend verification |
| useForgotPassword | Mutation | Forgot password |
| useResetPassword | Mutation | Password reset |
| useChangePassword | Mutation | Change password |
| useChangeEmail | Mutation | Change email |
| useLogout | Mutation | Sign out |
| useHasRole, useIsAdmin, useIsModerator | boolean | Check user permissions |
| useAuthEvent | AuthEventData | Listen to auth events |

### Account Hooks

| Hook | Returns | Purpose |
|------|---------|---------|
| useAccount | Account data + ops | Fetch user account info |
| useAddresses, useAddress, useCreateAddress, useUpdateAddress, useDeleteAddress, useSetDefaultAddress | Address CRUD | Address operations |
| useAddressForm | Form state | Address form management |
| useAddressSelector | Selected + list | Address selection |
| useNotifications | Notifications[] | Fetch user notifications |
| useProfile, useCurrentProfile, usePublicProfile | Profile data | Fetch user profiles |
| useUpdateCurrentProfile | Mutation | Update profile |
| useProfileStats | ProfileStats | Fetch user statistics |

### Product/Listing Hooks

| Hook | Returns | Purpose |
|------|---------|---------|
| useProducts | Products[] | Fetch products |
| useProductDetail | ProductDetail | Fetch product detail |
| useRelatedProducts | Products[] | Fetch related products |
| useBrands | Brands[] | Fetch brands |
| useAuctions, useAuction, useAuctionBids, useAuctionDetail | Auction data | Fetch auctions |
| usePlaceBid | Mutation | Place auction bid |
| useRealtimeBids | RealtimeBidData | Real-time bid updates |
| usePreOrders | Pre-orders[] | Fetch pre-orders |

### Cart/Checkout Hooks

| Hook | Returns | Purpose |
|------|---------|---------|
| useCart | CartData + ops | Fetch user cart |
| useCartCount | number | Cart item count |
| useCartQuery | Cart query state | Raw cart query |
| useAddToCart | Mutation | Add item to cart |
| useGuestCart | Guest cart data | Guest shopping cart |
| useGuestCartMerge | Mutation | Merge guest to user cart |
| useCheckout | Checkout state | Checkout form state |
| useCheckoutApi | Mutation | Create checkout |
| useCheckoutReadQueries | Read queries | Checkout data loading |
| usePaymentCheckout | Mutation | Process payment |
| usePaymentEvent | Event listener | Payment status updates |
| usePayments | Payments[] | Fetch payment history |
| useOrder | OrderData | Fetch order details |
| useOrders | Orders[] | Fetch orders |

### Engagement Hooks

| Hook | Returns | Purpose |
|------|---------|---------|
| useWishlist, useWishlistWithGuest | Wishlist data | Combined wishlist |
| useUserWishlist | Wishlist items[] | User wishlist |
| useGuestWishlist | Guest wishlist[] | Guest wishlist |
| useWishlistCount | number | Wishlist item count |
| useWishlistToggle | Mutation | Add/remove wishlist |
| useHistory | History items[] | Fetch view history |
| useHistoryMergeOnLogin | Mutation | Merge guest history |
| useReviews | Reviews[] | Fetch reviews |
| useCreateReview | Mutation | Submit review |
| useCouponValidate | Mutation | Validate coupon |
| usePromotions | Promotions[] | Fetch promotions |

### Content Hooks

| Hook | Returns | Purpose |
|------|---------|---------|
| useBlog | Blog posts[] | Fetch blog listings |
| useCategories | Categories[] | Fetch categories |
| useCategorySelector | Selected + list | Category selection |
| useCategoryTree | Hierarchical tree | Category hierarchy |
| useEvents, useEvent, useBulkEvent | Events data | Fetch events |
| useFAQs, useFaqList, useFaqVote | FAQ data | FAQ operations |
| useStores | Stores[] | Fetch stores |
| useStoreAddressSelector | Selector state | Store address selection |
| useSearch | Results[] | Product/store search |
| useNavSuggestions | Suggestions[] | Search suggestions |

### Homepage Hooks

| Hook | Returns | Purpose |
|------|---------|---------|
| useHomepage | Homepage data | Main homepage data |
| useHomepageSections | Sections[] | Homepage sections config |
| useHeroCarousel | Slides[] | Hero carousel data |
| useFeaturedProducts | Products[] | Featured products |
| useFeaturedAuctions | Auctions[] | Featured auctions |
| useFeaturedPreOrders | Pre-orders[] | Featured pre-orders |
| useFeaturedStores | Stores[] | Featured stores |
| useTopBrands | Brands[] | Top brands |
| useTopCategories | Categories[] | Top categories |
| useHomepageEvents | Events[] | Homepage events |
| useHomepageReviews | Reviews[] | Featured reviews |
| useBlogArticles | Articles[] | Featured blog articles |
| useActiveAd | Active ad | Fetch active ad |
| useNewsletter | Mutation | Newsletter subscription |

### Dashboard Hooks

| Hook | Returns | Purpose |
|------|---------|---------|
| useAdmin, useDashboardStats | Dashboard data | Admin dashboard metrics |
| useAdminListingData | Listing + pagination | Generic admin listing |
| useAdminSectionsListing | Sections list | Homepage sections listing |
| useChat, useChatRooms | Chat data | Admin chat management |
| useSellerListingData | Listing data | Seller products listing |
| useSellerPayouts | Payouts[] | Seller payout history |
| useSellerStore | Store data | Seller store info |
| useSellerStorefront | Storefront data | Store customization |
| useBecomeSeller | Mutation | Register as seller |
| useBottomActions | Actions[] | Bottom action bar items |

### Other Hooks

| Hook | Returns | Purpose |
|------|---------|---------|
| useConversation | Messages[] | Fetch conversation |
| useConversations | Conversations[] | User conversations |
| useLoyaltyBalance | Coins | Loyalty points |
| useMedia | Media data | Fetch media |
| useCollections | Collections[] | Fetch collections |
| useCopilotChat | Chat state | AI chat interface |
| useCopilotFeedback | Mutation | AI feedback |
| useContactSubmit | Mutation | Contact form |
| useBookConsultation | Mutation | Submit consultation |
| useSubmitCorporateInquiry | Mutation | Corporate inquiry |
| useBeforeAfter | Slider state | Before/after slider |
| useToast | {showToast, hideToast} | Toast notifications |

---

## 8. Server Actions

| Feature | Action | Auth | Purpose |
|---------|--------|------|---------|
| Account | createAddressForUserAction | buyer+ | Create delivery address |
| Account | updateAddressForUserAction | buyer+ | Update address |
| Account | deleteAddressForUserAction | buyer+ | Delete address |
| Account | setDefaultAddressForUserAction | buyer+ | Set default address |
| Auctions | placeBidAction | buyer+ | Place auction bid |
| Blog | createBlogPostAction | admin/mod | Create blog post |
| Blog | updateBlogPostAction | admin/mod | Update blog post |
| Blog | deleteBlogPostAction | admin/mod | Delete blog post |
| Blog | publishBlogPostAction | admin/mod | Publish blog post |
| Blog | unpublishBlogPostAction | admin/mod | Unpublish blog post |
| Brands | createBrandAction | admin | Create brand |
| Brands | updateBrandAction | admin | Update brand |
| Brands | deleteBrandAction | admin | Delete brand |
| Brands | toggleBrandActiveAction | admin | Toggle brand status |
| Bundles | addBundleToCartAction | buyer+ | Add bundle to cart |
| Cart | addToCartAction | buyer+ | Add item to cart |
| Cart | removeFromCartAction | buyer+ | Remove from cart |
| Cart | clearCartAction | buyer+ | Clear entire cart |
| Cart | mergeGuestCartAction | buyer+ | Merge guest cart |
| Classified | startClassifiedConversationAction | buyer+ | Initiate seller contact |
| Digital Code | claimCodeAction | buyer+ | Reveal purchased code |
| Events | registerEventAction | any authed | Register for event |
| Events | cancelRegistrationAction | any authed | Cancel registration |
| History | trackProductViewAction | buyer+ | Track product view |
| History | mergeGuestHistoryAction | buyer+ | Merge guest history |
| Orders | createOrderAction | buyer+ | Create order |
| Orders | cancelOrderAction | buyer+ | Cancel pending order |
| Orders | requestReturnAction | buyer+ | Request return |
| Orders | updateOrderStatusAction | seller+ | Update order status |
| Payouts | requestPayoutAction | seller | Request seller payout |
| Pre-Orders | reservePreOrderAction | buyer+ | Reserve pre-order |
| Products | publishProductAction | seller+ | Publish product listing |
| Products | unpublishProductAction | seller+ | Unpublish listing |
| Promotions | applyCouponAction | buyer+ | Apply coupon at checkout |
| Promotions | createCouponAction | admin/seller | Create coupon code |
| Promotions | updateCouponAction | admin/seller | Update coupon |
| Promotions | deactivateCouponAction | admin/seller | Deactivate coupon |
| Raffle | enterRaffleAction | buyer+ | Enter prize draw |
| Refunds | initiateRefundAction | admin | Initiate refund |
| Reviews | createReviewAction | buyer+ | Create product review |
| Reviews | replyToReviewAction | seller+ | Reply to review |
| Reviews | deleteReviewAction | buyer+ | Delete review |
| Search | searchAction | any | Execute search |
| Wishlist | addToWishlistAction | buyer+ | Add to wishlist |
| Wishlist | removeFromWishlistAction | buyer+ | Remove from wishlist |
| Wishlist | mergeGuestWishlistAction | buyer+ | Merge guest wishlist |

---

## 9. API Routes

### Admin Routes (~100 endpoints)

| Route | Methods | Purpose |
|-------|---------|---------|
| `/api/admin/products` | GET, POST | List/create products |
| `/api/admin/products/[id]` | GET, PUT, DELETE | Product CRUD |
| `/api/admin/users` | GET, POST | List/create users |
| `/api/admin/users/[uid]` | GET, PUT, DELETE | User CRUD |
| `/api/admin/stores` | GET, POST | List/create stores |
| `/api/admin/stores/[uid]` | GET, PUT, DELETE | Store CRUD |
| `/api/admin/orders` | GET, POST | List/create orders |
| `/api/admin/orders/[id]` | GET, PUT, DELETE | Order CRUD |
| `/api/admin/orders/[id]/refund` | POST | Order refund |
| `/api/admin/categories` | GET, POST | List/create categories |
| `/api/admin/categories/[id]` | GET, PUT, DELETE | Category CRUD |
| `/api/admin/brands` | GET, POST | List/create brands |
| `/api/admin/brands/[id]` | GET, PUT, DELETE | Brand CRUD |
| `/api/admin/blog` | GET, POST | List/create blog posts |
| `/api/admin/blog/[id]` | GET, PUT, DELETE | Blog post CRUD |
| `/api/admin/reviews` | GET, POST | List/manage reviews |
| `/api/admin/reviews/[id]` | GET, PUT, DELETE | Review CRUD |
| `/api/admin/bids` | GET, POST | List/manage bids |
| `/api/admin/bids/[id]` | GET, PUT, DELETE | Bid CRUD |
| `/api/admin/faqs` | GET, POST | List/create FAQs |
| `/api/admin/faqs/[id]` | GET, PUT, DELETE | FAQ CRUD |
| `/api/admin/coupons` | GET, POST | List/create coupons |
| `/api/admin/coupons/[id]` | GET, PUT, DELETE | Coupon CRUD |
| `/api/admin/carousel` | GET, POST | List/create carousel slides |
| `/api/admin/carousel/[id]` | GET, PUT, DELETE | Carousel CRUD |
| `/api/admin/sections` | GET, POST | List/create homepage sections |
| `/api/admin/sections/[id]` | GET, PUT, DELETE | Section CRUD |
| `/api/admin/ads` | GET, POST | List/create ads |
| `/api/admin/ads/[id]` | GET, PUT, DELETE | Ad CRUD |
| `/api/admin/events` | GET, POST | List/create events |
| `/api/admin/events/[id]` | GET, PUT, DELETE | Event CRUD |
| `/api/admin/events/[id]/trigger-raffle` | POST | Manual raffle trigger |
| `/api/admin/payouts` | GET, POST | List/manage payouts |
| `/api/admin/payouts/[id]` | GET, PUT, DELETE | Payout CRUD |
| `/api/admin/bundles` | GET, POST | List/create bundles |
| `/api/admin/bundles/[id]` | GET, PUT, DELETE | Bundle CRUD |
| `/api/admin/bundles/[id]/rebuild` | POST | Rebuild bundle |
| `/api/admin/site-settings` | GET, PUT | Site configuration |
| `/api/admin/analytics` | GET | Admin analytics |
| `/api/admin/dashboard` | GET | Admin dashboard data |
| `/api/admin/addresses` | GET, POST | List/manage addresses |
| `/api/admin/addresses/[id]` | GET, PUT, DELETE | Address CRUD |
| `/api/admin/sublisting-categories` | GET, POST | Sublisting categories |
| `/api/admin/sublisting-categories/[id]` | GET, PUT, DELETE | Sublisting CRUD |
| `/api/admin/newsletter` | GET, POST | Newsletter management |
| `/api/admin/newsletter/[id]` | GET, PUT, DELETE | Newsletter CRUD |
| `/api/admin/contact-submissions` | GET | Contact submissions |
| `/api/admin/contact-submissions/[id]` | GET, DELETE | Submission CRUD |
| + ~50 more | — | Moderation, RBAC, notifications, team, support tickets, etc. |

### Store Routes (~55 endpoints)

| Route | Methods | Purpose |
|-------|---------|---------|
| `/api/store/products` | GET, POST | List/create store products |
| `/api/store/orders` | GET | List store orders |
| `/api/store/orders/[id]` | GET, PUT | Order management |
| `/api/store/orders/[id]/ship` | POST | Ship order |
| `/api/store/coupons` | GET, POST | Store coupons |
| `/api/store/coupons/[id]` | GET, PUT, DELETE | Coupon CRUD |
| `/api/store/storefront` | GET, PUT | Storefront settings |
| `/api/store/shipping` | GET, PUT | Shipping settings |
| `/api/store/shipping/verify-pickup` | POST | Pickup verification |
| `/api/store/payout-settings` | GET, PUT | Payout config |
| `/api/store/payouts` | GET | Payout history |
| `/api/store/payouts/request` | POST | Request payout |
| `/api/store/reviews` | GET | Store reviews |
| `/api/store/reviews/[id]/reply` | POST | Reply to review |
| `/api/store/profile` | GET, PUT | Store profile |
| `/api/store/addresses` | GET, POST | Store addresses |
| `/api/store/addresses/[id]` | GET, PUT, DELETE | Address CRUD |
| `/api/store/slug/check` | GET | Slug availability |
| `/api/store/products/[id]/codes` | GET, POST | Digital code pool |
| `/api/store/templates` | GET, POST | Product templates |
| `/api/store/templates/[id]` | GET, PUT, DELETE | Template CRUD |
| `/api/store/features` | GET, POST | Store features |
| `/api/store/features/[id]` | GET, PUT, DELETE | Feature CRUD |
| + ~30 more | — | WhatsApp, analytics, categories, extensions, etc. |

### User Routes (~36 endpoints)

| Route | Methods | Purpose |
|-------|---------|---------|
| `/api/user/profile` | GET, PUT | User profile |
| `/api/user/orders` | GET | User orders |
| `/api/user/orders/[id]` | GET | Order details |
| `/api/user/orders/[id]/cancel` | POST | Cancel order |
| `/api/user/addresses` | GET, POST | User addresses |
| `/api/user/addresses/[id]` | GET, PUT, DELETE | Address CRUD |
| `/api/user/wishlist` | GET, POST | Wishlist |
| `/api/user/wishlist/[productId]` | POST, DELETE | Add/remove wishlist |
| `/api/user/history` | GET, POST | View history |
| `/api/user/history/merge` | POST | Merge histories |
| `/api/user/notifications` | GET | Notifications |
| `/api/user/notifications/read-all` | POST | Mark all read |
| `/api/user/change-password` | POST | Change password |
| `/api/user/sessions` | GET | User sessions |
| `/api/user/sessions/[id]` | DELETE | Revoke session |
| `/api/user/conversations` | GET, POST | Conversations |
| `/api/user/conversations/[id]` | GET, PUT | Conversation CRUD |
| `/api/user/conversations/[id]/read` | POST | Mark as read |
| `/api/user/conversations/[id]/messages` | GET, POST | Messages |
| + ~16 more | — | Become seller, reviews, events, offers, etc. |

### Public Routes (~110 endpoints)

| Route | Methods | Purpose |
|-------|---------|---------|
| `/api/products` | GET | List products |
| `/api/products/[id]` | GET | Product details |
| `/api/categories` | GET | List categories |
| `/api/categories/[id]` | GET | Category details |
| `/api/stores` | GET | List stores |
| `/api/stores/[storeSlug]` | GET | Store details |
| `/api/stores/[storeSlug]/products` | GET | Store products |
| `/api/stores/[storeSlug]/reviews` | GET | Store reviews |
| `/api/blog` | GET | List blog posts |
| `/api/blog/[slug]` | GET | Blog post details |
| `/api/reviews` | GET | List reviews |
| `/api/reviews/[id]` | GET | Review details |
| `/api/reviews/[id]/vote` | POST | Vote on review |
| `/api/faqs` | GET | List FAQs |
| `/api/faqs/vote` | POST | Vote on FAQ |
| `/api/events` | GET | List events |
| `/api/events/[id]` | GET | Event details |
| `/api/events/[id]/leaderboard` | GET | Event leaderboard |
| `/api/events/[id]/spin` | POST | Spin wheel |
| `/api/coupons` | GET | List coupons |
| `/api/coupons/validate` | POST | Validate coupon |
| `/api/auctions` | GET | List auctions |
| `/api/auctions/[id]` | GET | Auction details |
| `/api/bids` | GET | List bids |
| `/api/bids/[id]` | GET, POST | Bid CRUD |
| `/api/cart` | GET, POST | Cart operations |
| `/api/cart/[itemId]` | PUT, DELETE | Cart item CRUD |
| `/api/cart/selection` | POST | Selection update |
| `/api/cart/merge` | POST | Merge carts |
| `/api/checkout/preflight` | POST | Checkout validation |
| `/api/checkout` | POST | Place order |
| `/api/payment/verify` | POST | Payment verification |
| `/api/search` | GET | Product search |
| `/api/carousel` | GET | Carousel slides |
| `/api/homepage-sections` | GET | Homepage sections |
| `/api/notifications` | GET | List notifications |
| `/api/notifications/unread-count` | GET | Unread count |
| + ~65 more | — | Auth, media, chat, newsletter, demo seed, etc. |

---

## 10. Constants

### Consumer Constants (`src/constants/`)

| File | Key Exports | Purpose |
|------|-------------|---------|
| api.ts | API_ROUTES | API endpoint strings for client-side fetch |
| api-roles.ts | ROLES_ADMIN_ONLY, ROLES_ADMIN_MOD, ROLES_STORE_WRITE, ROLES_STORE_READ, ROLES_ANY_STAFF | RBAC permission tuples |
| brand.ts | BRAND, getBrandCopyright | Brand identity |
| config.ts | Site configuration | Environment-specific config |
| dashboard-tabs.ts | STORE_LISTINGS_TABS, STORE_ORDERS_TABS, USER_ORDERS_TABS, ADMIN_PRODUCTS_TABS | Dashboard navigation tabs |
| faq.ts | FAQ_CATEGORIES | FAQ category mapping |
| homepage-data.ts | TRUST_INDICATORS, TRUST_FEATURES, SITE_FEATURES | Homepage content blocks |
| languages.ts | SUPPORTED_LANGUAGES, LANGUAGES_PAGE_SIZE | i18n configuration |
| navigation.tsx | MAIN_NAV_ITEMS, ADMIN_NAV_GROUPS, STORE_NAV_GROUPS, USER_NAV_GROUPS, SIDEBAR_SUPPORT_LINKS, FOOTER_LINK_GROUPS | Navigation structures |
| search.ts | SEARCH_LABELS | Search overlay labels |
| seo.ts | SEO_CONFIG | SEO metadata defaults |
| seo.server.ts | generateMetadata, generateProductMetadata, etc. | Server-side metadata generators |
| theme.ts | THEME_CONSTANTS | Theme mode constants |
| tickets.ts | TICKET_CATEGORIES, TICKET_STATUSES | Support ticket enums |
| ui.ts | UI_LABELS | UI copy/labels |

### Appkit Constants (`appkit/src/constants/`)

| File | Key Exports | Purpose |
|------|-------------|---------|
| api-endpoints.ts | API_ENDPOINTS + 50 endpoint collections | Canonical API paths |
| api-endpoint-resolver.ts | resolveEndpoint, resolveEndpointFn | Endpoint path resolution |
| cache-invalidation.ts | COLLECTION_CACHE_PATHS | Collection-to-cache path mapping |
| field-names.ts | Schema field constants | Firestore document field names |
| limits.ts | WISHLIST_MAX, HISTORY_MAX, CART_MAX_ITEMS | User-facing hard caps |
| sort.ts | SORT_DIR, sortBy | Sieve sort token builder |
| table-keys.ts | TABLE_KEYS, VIEW_MODE | useUrlTable() parameter keys |

### Feature Constants (`appkit/src/features/*/constants/`)

| File | Key Exports | Purpose |
|------|-------------|---------|
| products/action-defs.ts | ACTION_META, ROW_ACTION_META, ADMIN_BULK_ACTIONS, SELLER_BULK_ACTIONS, ADMIN_ROW_ACTIONS, SELLER_ROW_ACTIONS | CTA registry (42 actions) |
| products/listing-tabs.ts | LISTING_TABS, SELLER_LISTING_TABS | Product listing type tabs |
| products/sieve.ts | Sieve query builders | Filter/sort helpers |
| scams/scam-types.ts | SCAM_TYPES, SCAM_CATEGORIES (27 types, 6 categories) | Scam pattern data |

---

## 11. Types & Interfaces

Types are co-located with their feature schemas in `appkit/src/features/*/schemas/firestore.ts`. Key document types:

| Type | Collection | Source |
|------|-----------|--------|
| UserDocument | users | account/schemas/firestore.ts |
| ProductDocument | products | products/schemas/firestore.ts |
| OrderDocument | orders | orders/schemas/firestore.ts |
| ReviewDocument | reviews | reviews/schemas/firestore.ts |
| StoreDocument | stores | stores/schemas/firestore.ts |
| CategoryDocument | categories | categories/schemas/firestore.ts |
| CouponDocument | coupons | promotions/schemas/firestore.ts |
| EventDocument | events | events/schemas/firestore.ts |
| BlogPostDocument | blogPosts | blog/schemas/firestore.ts |
| FAQDocument | faqs | faq/schemas/firestore.ts |
| CartDocument | carts | cart/schemas/firestore.ts |
| BidDocument | bids | auctions/schemas/firestore.ts |
| NotificationDocument | notifications | account/schemas/firestore.ts |
| SessionDocument | sessions | auth/schemas/firestore.ts |
| PayoutDocument | payouts | seller/schemas/firestore.ts |
| AddressDocument | addresses | addresses/schemas/firestore.ts |
| ConversationDocument | conversations | messages/schemas/firestore.ts |
| CarouselSlideDocument | carouselSlides | homepage/schemas/firestore.ts |
| HomepageSectionDocument | homepageSections | homepage/schemas/firestore.ts |
| SiteSettingsDocument | siteSettings | admin/schemas/firestore.ts |
| WishlistDocument | wishlists | wishlist/schemas/ |
| HistoryDocument | history | history/schemas/ |
| ScammerDocument | scammers | scams/schemas/firestore.ts |
| SupportTicketDocument | supportTickets | support/schemas/firestore.ts |

---

## 12. Utils & Helpers

### `appkit/src/utils/`

| File | Key Exports | Purpose |
|------|-------------|---------|
| array.helper.ts | chunk, uniq, flatten, groupBy, findDups | Array utilities |
| auth-error.ts | Error handling utilities | Auth error classification |
| business-day.ts | addBusinessDays, isBusinessDay | India business day math |
| color.helper.ts | hexToRgb, rgbToHex, adjustBrightness | Color conversion |
| cookie.converter.ts | parseCookie, stringifyCookie | Cookie serialization |
| date.formatter.ts | formatDate, formatTime, parseDate | Date/time formatting |
| filter.helper.ts | buildFilter, matchFilter | Filter matching |
| id-generators.ts | generateId, generateSlug, generateTrackingId, generateMediaFilename | ID/slug generation |
| listing-params.ts | parseListingParams, buildListingUrl | Product listing URL builders |
| media-field.ts | MediaField, compressImage | Media field validation |
| number.formatter.ts | formatCurrency, formatNumber, parseNumber | Number formatting (₹ support) |
| object.helper.ts | deepMerge, pick, omit, mapValues | Object utilities |
| pagination.helper.ts | calculatePages, getPageRange, paginate | Pagination math |
| schema-ui.ts | getFieldLabel, getErrorMessage | Schema metadata extraction |
| search-tokens.ts | tokenizeSearch, matchToken | Search tokenization |
| sorting.helper.ts | compareFn, naturalSort | Sorting utilities |
| string.formatter.ts | slugify, capitalize, truncate, sanitize | String utilities |
| type.converter.ts | toRecord, toArray, isRecord | Type coercion helpers |
| action-response.ts | ActionResponse, success, error | Server action response wrapper |
| animation.helper.ts | Animation constants & helpers | Animation token utilities |

---

## 13. Registries

| Registry | File | Entries | Purpose |
|----------|------|---------|---------|
| ACTIONS | _internal/shared/actions/action-registry.ts | 23 resource buckets | Master CTA registry — labels, permissions, confirmation, icons |
| ACTION_META | features/products/constants/action-defs.ts | Tier 1 public CTAs | Primary action metadata |
| ROW_ACTION_META | features/products/constants/action-defs.ts | Tier 2 row/table actions | Row action metadata |
| FORM_ACTION_META | features/products/constants/action-defs.ts | Tier 3 form footers | Form footer actions |
| DASHBOARD_QUICK_ACTION_META | features/products/constants/action-defs.ts | Tier 4 dashboard shortcuts | Quick action metadata |
| ADMIN_BULK_ACTIONS | features/products/constants/action-defs.ts | Preset array | Admin bulk action set |
| SELLER_BULK_ACTIONS | features/products/constants/action-defs.ts | Preset array | Seller bulk action set |
| LISTING_BULK_ACTIONS | features/products/constants/action-defs.ts | Preset array | Listing bulk action set |
| ADMIN_ROW_ACTIONS | features/products/constants/action-defs.ts | Preset array | Admin row action set |
| SELLER_ROW_ACTIONS | features/products/constants/action-defs.ts | Preset array | Seller row action set |
| USER_ROW_ACTIONS | features/products/constants/action-defs.ts | Preset array | User row action set |
| SCAM_TYPES | features/scams/constants/scam-types.ts | 27 scam types | Scam pattern registry |

---

## 14. Schemas (Zod)

| Feature | Files | Primary Schemas |
|---------|-------|-----------------|
| account | firestore.ts, index.ts | User account document schemas |
| addresses | firestore.ts, index.ts | Address validation & persistence |
| admin | firestore.ts, index.ts | Admin-specific document schemas |
| auctions | firestore.ts, index.ts | Auction document schemas |
| auth | firestore.ts, index.ts | Authentication request/response schemas |
| blog | firestore.ts, index.ts | Blog post document schemas |
| cart | firestore.ts, index.ts | Shopping cart document schemas |
| categories | firestore.ts, index.ts | Product category document schemas |
| checkout | firestore.ts, index.ts | Checkout flow request schemas |
| events | firestore.ts, index.ts | Event document schemas |
| faq | firestore.ts, index.ts | FAQ document schemas |
| messages | firestore.ts, index.ts | Chat message document schemas |
| orders | firestore.ts, index.ts | Order document & status transition schemas |
| payments | firestore.ts, index.ts | Payment request/response schemas |
| products | firestore.ts, index.ts, catalog-product.ts, product-features.ts, product-templates.ts | Product document, features, templates, validators |
| promotions | firestore.ts, index.ts | Coupon/promotion document schemas |
| reviews | firestore.ts, index.ts | Review document schemas |
| scams | firestore.ts, index.ts | Scam report document schemas |
| seller | firestore.ts, index.ts | Seller (store) document schemas |
| store-extensions | firestore.ts, index.ts, rbac.ts | Store feature schemas & RBAC rules |
| stores | firestore.ts, index.ts | Store document schemas |
| support | firestore.ts, index.ts | Support ticket document schemas |
| wishlist | index.ts | Wishlist document schemas |

---

## 15. Seed Data

| File | Collection | Purpose |
|------|-----------|---------|
| categories-seed-data.ts | categories | Product categories + brands (merged SB-UNI-C) |
| users-seed-data.ts | users | Demo user profiles |
| stores-seed-data.ts | stores | Demo seller stores |
| products-standard-seed-data.ts | products | Standard product listings |
| products-auctions-seed-data.ts | products | Auction-type products |
| products-preorders-seed-data.ts | products | Pre-order products |
| products-prize-draws-seed-data.ts | products | Prize draw products |
| products-classifieds-seed-data.ts | products | Classified listings |
| products-digital-codes-seed-data.ts | products | Digital code pool products |
| products-live-items-seed-data.ts | products | Live-streamed item products |
| orders-seed-data.ts | orders | Demo orders |
| reviews-seed-data.ts | reviews | Product reviews |
| bids-seed-data.ts | bids | Auction bids |
| coupons-seed-data.ts | coupons | Promotion coupons |
| coupon-usage-seed-data.ts | couponUsage | Coupon claim tracking |
| carousels-seed-data.ts | carousels | Carousel collections |
| carousel-slides-seed-data.ts | carouselSlides | Individual carousel slides |
| homepage-sections-seed-data.ts | homepageSections | Homepage layout sections |
| faq-seed-data.ts | faqs | FAQ entries |
| blog-posts-seed-data.ts | blogPosts | Blog articles |
| events-seed-data.ts | events | Raffle/spin events |
| site-settings-seed-data.ts | siteSettings | Global site config |
| notifications-seed-data.ts | notifications | System notifications |
| sessions-seed-data.ts | sessions | User sessions |
| addresses-seed-data.ts | addresses | User addresses |
| store-addresses-seed-data.ts | storeAddresses | Store addresses |
| cart-seed-data.ts | cart | Demo shopping carts |
| wishlist-seed-data.ts | wishlists | User wishlists |
| history-seed-data.ts | history | Search history |
| conversations-seed-data.ts | conversations | User messages |
| grouped-listings-seed-data.ts | groupedListings | Product grouping |
| payouts-seed-data.ts | payouts | Seller payouts |
| scammers-seed-data.ts | scammers | Reported scammer profiles |
| support-tickets-seed-data.ts | supportTickets | Support ticket examples |
| product-features-seed-data.ts | productFeatures | Dynamic feature flags |
| offers-seed-data.ts | offers | Promotion offers |
| store-extensions-seed-data.ts | storeExtensions + 11 sub-collections | Store feature extensions |
| manifest.ts | — | Seed manifest index (metadata only) |
| runner.ts | — | Seed execution orchestrator |

---

## 16. Page Shims

All pages are thin shims delegating to appkit `_internal/server/features/*/` helpers.

| Domain | Count | Examples |
|--------|-------|---------|
| Admin | ~94 | /admin/products, /admin/orders, /admin/users, /admin/categories, /admin/blog, /admin/reviews, /admin/coupons, /admin/carousel, /admin/sections, /admin/events, /admin/payouts, /admin/team, /admin/support, /admin/scammers |
| Store | ~73 | /store/products, /store/orders, /store/coupons, /store/analytics, /store/payouts, /store/reviews, /store/templates, /store/features, /store/shipping |
| User | ~29 | /user/orders, /user/profile, /user/wishlist, /user/addresses, /user/history, /user/conversations, /user/notifications |
| Public | ~105 | /products/[id], /categories, /blog, /events, /auctions, /stores, /about, /contact, /faqs, /seller, /cart, /checkout |
| **Total** | **~301** | |

---

## 17. Config

| File | Type | Purpose |
|------|------|---------|
| next.config.js | Next.js | Build config with i18n plugin, Turbopack alias, image domains, version stamping |
| tailwind.config.js | Tailwind CSS | Theme colors, spacing, z-index, animations, safelist |
| appkit.config.js | Custom | AppKit consumer configuration |
| firebase.json | Firebase | Hosting rules, redirects, rewrites |
| appkit/tailwind.config.js | Tailwind CSS | Shared theme tokens (pre-compiled utilities) |
| .env.example | Environment | Template for required env vars |

---

## 18. Tokens & Design System

### `appkit/src/tokens/index.ts`

| Export | Type | Purpose |
|--------|------|---------|
| COLORS | Constant | Brand color palette with shades (primary, secondary, cobalt, accent, semantic) |
| RADIUS | Constant | Border radius values (sm, md, lg, xl, 2xl, 3xl, card, btn, full) |
| SHADOWS | Constant | Box shadow definitions (sm, md, lg, xl, soft, glow, glowPink) |
| Z_INDEX | Constant | Z-index stacking (dropdown, searchBackdrop, navbar, bottomNav, overlay, sidebar, titleBar, modal, toast) |
| TOKENS | Constant | Token convenience group |
| token | Function | CSS custom property reference builder |
| LOCALE_CONFIG | Constant | Locale and currency configuration (INR, en-IN) |
| THEME_CONSTANTS | Constant | Complete responsive design system map (themed, layout, typography, spacing, grid, page, input, card, etc.) |
| LAYOUT | Constant | Layout dimension constants (heights, widths, padding) |
| FLUID_GRID_MIN_WIDTHS | Constant | Minimum item widths for fluid grids (card: 220, admin: 260, wide: 300, thumb: 160) |

### `appkit/src/tokens/motion.ts`

| Export | Type | Purpose |
|--------|------|---------|
| SPRING_SNAPPY | Constant | Snappy spring transition (stiffness: 400, damping: 30) |
| SPRING_GENTLE | Constant | Gentle spring transition (stiffness: 200, damping: 25) |
| EASE_OUT | Constant | Ease-out tween transition |
| MOTION_PRESETS | Constant | Named animation presets (fadeIn, fadeInUp, slideUp, slideDown, scaleIn, pressScale, hoverLift, stagger, etc.) |
| MotionPreset | Type | Motion preset key type |

### `appkit/src/tokens/themes/` (added 2026-06-14)

| Export | Type | Purpose |
|--------|------|---------|
| DEFAULT_LIGHT_THEME | Constant | Built-in light theme record (cobalt + lime). Mirrors `:root` block in `tokens.css`. |
| DEFAULT_DARK_THEME | Constant | Built-in dark theme record (hot-pink). Mirrors `[data-theme="dark"]` block in `tokens.css`. |
| BUILT_IN_THEMES | Constant | `readonly ThemeRecord[]` — built-ins that cannot be deleted by admin. |
| getDefaultBuiltInTheme | Function | `(mode) => ThemeRecord` fallback resolver. |
| REQUIRED_THEME_TOKENS | Constant | Catalogue of every CSS variable a theme record must declare. |
| REQUIRED_GRADIENT_KEYS | Constant | Catalogue of every gradient slot a theme record must declare. |
| ThemeRecord / ThemeMode / GradientKey / RequiredThemeToken | Type | Theme registry types. |

### `appkit/src/_internal/client/theme/` (re-exported via `appkit/src/theme/index.ts`)

| Export | Type | Purpose |
|--------|------|---------|
| ThemeProvider | Component | Registry-aware provider. Reads `siteSettings.theme` → applies `<html data-theme>` + inline CSS-variable writes. Tracks `prefers-color-scheme` for `"auto"` preference. |
| useTheme | Hook | `{ activeTheme, effectiveMode, theme, preference, setPreference, setTheme, toggleTheme }`. |
| buildThemeRegistry | Function | `(siteSettings.theme | undefined) => ThemeRegistry`. Combines built-ins with admin records, resolves default ids. |
| ThemeRegistry / ThemeContextValue / ThemeProviderProps / ModePreference / SiteSettingsThemeInput | Type | Theme provider types. |

### Variant catalogue primitives (added 2026-06-14)

Exported from `@mohasinac/appkit` unless otherwise noted.

| Primitive | File | Purpose |
|---|---|---|
| Anchor | `appkit/src/ui/components/Anchor.tsx` | External / `mailto:` / `tel:` link wrapper. `tone` + `underline` enums. |
| MediaAudio | `appkit/src/features/media/MediaAudio.tsx` | `<audio>` proxied through `/api/media/…`. |
| Iframe | `appkit/src/ui/components/Iframe.tsx` | Embedded third-party content with `aspect` / `rounded` / `sandbox` enums. |
| HorizontalRule | `appkit/src/ui/components/HorizontalRule.tsx` | `<hr>` with `tone="accent"` consuming themed gradient divider. |
| Fieldset / Legend | `appkit/src/ui/components/Fieldset.tsx` | Grouped form-control wrapper. |
| Details / Summary | `appkit/src/ui/components/Details.tsx` | Native `<details>` disclosure widget. |
| Dialog | `appkit/src/ui/components/Dialog.tsx` | Native `<dialog>` with top-layer rendering + focus trap. |
| StickyToolbar | `appkit/src/ui/components/StickyToolbar.tsx` | Translucent sticky bar under `AppLayoutShell`; offset from `--header-height`. |
| IconBox | `appkit/src/ui/components/IconBox.tsx` | Square icon container (`size` × `rounded` × `tone`). |
| Kbd | `appkit/src/ui/components/Kbd.tsx` | `<kbd>` with `size` + `tone`. |
| Quote | `appkit/src/ui/components/Quote.tsx` | Inline `<q>` + multi-line `<blockquote>` via `block`. |
| Show / Hide | `appkit/src/ui/components/Responsive.tsx` | Breakpoint-conditional render — hydration-safe, no consumer-side `sm:`/`md:`/`lg:` prefixes. |
| FallbackShell | `appkit/src/ui/components/FallbackShell.tsx` | ErrorBoundary / `global-error.tsx` primitive with inlined critical CSS. |
| HotspotMarker | `appkit/src/ui/components/HotspotMarker.tsx` | `xPct` / `yPct` overlay marker; primitive for dynamic positioning. |
| SiteLogo | `appkit/src/ui/components/SiteLogo.tsx` | `size` + `tone` enums; binds gradient stops to theme variables. |
| ThemeManagerView | `appkit/src/features/site-settings/components/ThemeManagerView.tsx` | Admin UI for Site Settings → Themes tab. |
| Email* (10 primitives) | `appkit/src/features/email/primitives.tsx` | EmailDoc, EmailContainer, EmailHeader, EmailRow, EmailColumn, EmailButton, EmailLink, EmailImage, EmailDivider, EmailFooter — exported from `@mohasinac/appkit/server`. |

---

## 19. Route Map

Route constants defined in `appkit/src/next/routing/route-map.ts` via the `ROUTES` object. Key segments:

| Namespace | Examples | Purpose |
|-----------|---------|---------|
| ROUTES.PUBLIC | PRODUCTS, PRODUCT(id), AUCTIONS, STORES, STORE(slug), BLOG, EVENTS, FAQS, CART, CHECKOUT, SEARCH | Public page routes |
| ROUTES.ADMIN | DASHBOARD, PRODUCTS, ORDERS, USERS, STORES, CATEGORIES, BRANDS, BLOG, EVENTS, PAYOUTS, SETTINGS | Admin dashboard routes |
| ROUTES.STORE | DASHBOARD, PRODUCTS, ORDERS, COUPONS, ANALYTICS, PAYOUTS, REVIEWS, SHIPPING, TEMPLATES | Store dashboard routes |
| ROUTES.USER | ORDERS, ORDER_DETAIL(id), PROFILE, WISHLIST, ADDRESSES, HISTORY, NOTIFICATIONS, CONVERSATIONS | User dashboard routes |
| ROUTES.AUTH | LOGIN, REGISTER, FORGOT_PASSWORD, RESET_PASSWORD, VERIFY_EMAIL | Auth routes |

---

## 20. Firebase Jobs

Firebase Functions are declared once in the appkit registry (single source of truth) and bound from [functions/src/index.ts](functions/src/index.ts). Consumer extensions live in [functions/src/consumer-functions.ts](functions/src/consumer-functions.ts) (empty by default).

Registry sources:
- [appkit/src/_internal/server/functions/scheduled.ts](appkit/src/_internal/server/functions/scheduled.ts) — `SCHEDULED_FUNCTIONS` (21 entries)
- [appkit/src/_internal/server/functions/firestore.ts](appkit/src/_internal/server/functions/firestore.ts) — `FIRESTORE_TRIGGER_FUNCTIONS` (13 entries)
- [appkit/src/_internal/server/functions/https.ts](appkit/src/_internal/server/functions/https.ts) — `HTTPS_FUNCTIONS` (7 entries)
- Aggregated in [appkit/src/_internal/server/functions/manifest.ts](appkit/src/_internal/server/functions/manifest.ts) as `APPKIT_FUNCTIONS`

All functions deploy to region `asia-south1`. HTTPS functions require `LETITRIP_INTERNAL_SECRET` env var (enforced by `audit-functions-registry-completeness.mjs`).

### Scheduled (21 functions)

| Function | Cron | Purpose |
|----------|------|---------|
| auctionSettlement | every 15 minutes (UTC) | Settle expired auctions + notify winners |
| pendingOrderTimeout | every 2 hours | Cancel pending orders past timeout |
| couponExpiry | daily 00:05 UTC | Mark coupons inactive past endDate |
| offerExpiry | daily 00:15 UTC | Mark offers inactive past endDate |
| productStatsSync | daily 01:00 UTC | Recompute aggregated product stats |
| dailyDataCleanup | daily 02:00 UTC | Drafts + transient record cleanup |
| countersReconcile | daily 03:00 UTC | Reconcile aggregated counters vs source-of-truth |
| positionsReconcile | daily 03:30 UTC | Reconcile bid / auction positions |
| draftPrune | weekly Sun 03:00 UTC | Prune store form drafts > 30 days |
| cartPrune | weekly Sun 04:00 UTC | Prune abandoned carts |
| autoPayoutEligibility | daily 04:45 UTC | Recompute auto-payout eligibility |
| mediaTmpCleanup | daily 04:30 IST | Delete orphaned `tmp/*` media uploads |
| payoutBatch | daily 06:00 UTC | Dispatch the day's payout batch |
| weeklyPayoutEligibility | weekly Sat 05:00 UTC | Recompute weekly seller payout eligibility |
| notificationPrune | weekly Mon 01:00 UTC | Prune read notifications past retention |
| cleanupRtdbEvents | every 5 minutes | Reap stale RTDB auth-event nodes |
| prizeRevealOpen | every 5 minutes | Flip prize-draw reveals pending→open + opening notifications |
| prizeRevealClose | every 5 minutes | Flip prize-draw reveals open→closed |
| prizeRevealExpiry | every 6 hours UTC | Auto-refund unrevealed prize-draw entries past deadline |
| prizeRevealReminder | daily 10:00 IST | Nudge prize-draw buyers <24h to deadline |
| bundleStockSync | daily 10:05 IST | Flip bundle isSold when any item runs OOS |

### Firestore Triggers (13 functions)

| Function | Trigger | Purpose |
|----------|---------|---------|
| onBidPlaced | documentCreated `bids/{bidId}` | Bid creation side-effects (notifications, outbid emails) |
| onOrderCreate | documentCreated `orders/{orderId}` | Notify store + decrement stock |
| onOrderStatusChange | documentUpdated `orders/{orderId}` | Status transition notifications + returns |
| onProductWrite | documentWritten `products/{productId}` | Search index + stats + audits |
| onProductStockChange | documentWritten `products/{productId}` | Recompute bundleStockStatus + groupedListing activeMemberCount |
| onReviewWrite | documentWritten `reviews/{reviewId}` | Recompute product + store rating aggregates |
| onCategoryWrite | documentWritten `categories/{categoryId}` | Path materialization + slug indexes |
| onStoreWrite | documentWritten `stores/{storeId}` | Status mirror + owner uid index |
| onSupportTicketCreate | documentCreated `supportTickets/{ticketId}` | Confirm to reporter + queue routing |
| onSupportTicketUpdate | documentUpdated `supportTickets/{ticketId}` | Notify reporter on status change |
| onUserBanChange | documentUpdated `users/{uid}` | Append ban-history audit entries |
| onScamReportCreate | documentCreated `scammerProfiles/{scammerId}` | Notify reporter + scam-read employees |
| onScamReportUpdate | documentUpdated `scammerProfiles/{scammerId}` | Notify reporter on verified/rejected flip |

### HTTPS Callables (7 functions, server-to-server)

| Function | Memory | Purpose |
|----------|--------|---------|
| adminAnalytics | 512 MiB | Admin analytics roll-ups (heavy queries offloaded from Vercel) |
| storeAnalytics | 256 MiB | Per-store analytics roll-ups |
| promotionsApi | 256 MiB | Coupon + offer evaluation |
| listingProcessor | 256 MiB | Sieve query processor (auctions / pre-orders / prize-draws) |
| triggerEventRaffle | 256 MiB | Admin-triggered raffle draw (crypto.randomInt) |
| assignSpinPrize | 256 MiB | Weighted random spin-wheel + coupon issuance |
| gateway | 512 MiB | Multiplexed endpoint dispatching on `input.action` to all 6 above |

---

## 21. Audit Scripts

Single dispatcher: [scripts/run-audits.mjs](scripts/run-audits.mjs). Runs every audit in registry order; `--all` is the default, `--no-fail-fast` runs all even on failure. Stop hook ([scripts/claude-hooks/check-on-stop.mjs](scripts/claude-hooks/check-on-stop.mjs)) runs the fast subset after every Claude turn.

**State legend**: **strict-0** = zero tolerance, any violation fails; **drift** = baseline-locked, only regressions fail; **report** = informational counts.

### Appkit audits (21 scripts in `appkit/scripts/`)

All 21 run as a chain via `appkit`'s `npm run check:audits` (the first entry in the dispatcher).

| Script | State | What it catches |
|--------|-------|-----------------|
| audit-violations.mjs | strict-0 | `_internal/` boundary breaches — imports from `_internal/server` into client bundles |
| verify-entries.mjs | strict-0 | Client entry barrels stay firebase-admin-free |
| verify-css-build.mjs | strict-0 | Compiled CSS class completeness vs source utilities |
| audit-use-client.mjs | strict-0 | `"use client"` first-line on files with React hooks / next-intl / next/navigation |
| audit-double-navigation.mjs | strict-0 | `table.set(...); table.setPage(1)` paired calls (race condition root-cause #13) |
| audit-repository-fields.mjs | strict-0 | Deprecated Sieve fields + root-level sort paths in repositories |
| audit-query-provider.mjs | strict-0 | React Query Provider scope (no QueryClient set root-cause #19) |
| audit-export-paths.mjs | strict-0 | Import-alias hygiene (no deep `dist/...` paths) |
| audit-listing-indices.mjs | strict-0 | Firestore composite indices for `listingType+...` queries (J13) |
| audit-listing-type-reads.mjs | strict-0 | No reads of the dropped `isAuction` / `isPreOrder` booleans |
| audit-create-with-id.mjs | strict-0 | `createWithId` overrides in PII-encrypting subclasses (root-cause #9) |
| audit-css-imports.mjs | strict-0 | No `@import "pkg"` in `globals.css` (Turbopack PostCSS trap root-cause #10) |
| audit-appkit-reexports.mjs | strict-0 | Re-exports respect the firebase-admin client-bundle trap (root-cause #6 + #18) |
| audit-action-confirmation.mjs | strict-0 | Destructive ACTIONS carry `confirmation` config |
| audit-route-strings.mjs | strict-0 | No hardcoded route strings outside `ROUTES` registry |
| audit-paginated-select.mjs | strict-0 | >5-option selects use `<PaginatedSelect>` |
| audit-sieve-constants-views.mjs | strict-0 | Views use `SIEVE_OP` / `sieveBuilder` constants, not raw filter strings |
| audit-schema-registry-completeness.mjs | strict-0 | Every API route has a schema in `SCHEMAS.api[...]` |
| audit-firestore-schema-coverage.mjs | strict-0 | Every collection's repository has a Zod schema |
| audit-catch-normalize.mjs | strict-0 | Every `catch (e)` site flows through `normalizeError(e)` |
| audit-route-schema-registry.mjs | strict-0 | All 464 route exports are registered (or carry suppression marker) |
| audit-z-any-z-unknown.mjs | strict-0 | No `z.any()` / `z.unknown()` in schema definitions |

### Consumer audits (58 scripts in `scripts/`)

Run via the dispatcher; ordering mirrors the historical `check:audits` chain.

| Script | State | What it catches |
|--------|-------|-----------------|
| audit-ssr-in-appkit.mjs | drift | Route-shim thresholds (`page.tsx` ≤ 30 lines) + sidecar files + brand strings inside `_internal/` |
| audit-hex-tokens.mjs | strict-0 (`--fix`) | Hardcoded hex colors outside `tokens.css` |
| audit-config-factories.mjs | strict-0 | Config factory pattern compliance |
| audit-html-wrappers.mjs | drift | Raw `<div>` / `<span>` wrappers + `RAW_GRADIENT_UTILITY` token misuse |
| audit-code-quality.mjs | drift | Code style — `BUTTON_AS_TOGGLE` + others |
| audit-bom.mjs | strict-0 | Byte-Order-Mark detection in TS/TSX sources |
| audit-suspense-boundaries.mjs | strict-0 | Listing page shims wrap `useUrlTable()` in `<Suspense>` (root-cause #17) |
| audit-auth-gates.mjs | strict-0 | Public-CTA gating |
| audit-inline-actions.mjs | strict-0 | No duplicate inline `action` definitions (CTA Registry Rule #7) |
| audit-product-form-shell.mjs | strict-0 | Product form pages use shell wrappers |
| audit-dashboard-padding.mjs | strict-0 | Dashboard pages don't double-pad |
| audit-user-pages-overhaul.mjs | strict-0 | User-page migration completeness checklist |
| audit-root-cause.mjs | strict-0 | Recurrent root-cause patterns (rolled into CLAUDE.md §Recurrent Root Cause Patterns) |
| audit-dark-mode.mjs | strict-0 | Dark-mode companion class completeness on text/bg color pairs |
| audit-gitignore.mjs | strict-0 | `.gitignore` shape (no accidental commit of `dist/` etc.) |
| audit-typography.mjs | strict-0 | Raw HTML typography tags must use `<Heading>` / `<Text>` / `<Span>` primitives |
| audit-inline-styles.mjs | strict-0 | `style={{ color }}` / `backgroundColor` / `borderColor` outside primitives + `RAW_JUSTIFY_ON_ROW` etc. |
| audit-env-alignment.mjs | strict-0 | `.env.local` consistency with `.env.example` |
| audit-sieve-constants.mjs | strict-0 | Same as appkit's `sieve-constants-views` for consumer sources |
| audit-toast-coverage.mjs | drift | User-facing handlers carry toast feedback or `// toast-intentionally-silent` marker |
| audit-auth-gate-derivation.mjs | strict-0 | Login gates don't derive from UX-affordance flags |
| audit-route-nav-field-constants.mjs | strict-0 | Route / nav / field-name constants honored (no raw string literals) |
| audit-spinner-defaults.mjs | strict-0 | No bare "Loading…" text spinners in view components |
| audit-silent-fetch-catch.mjs | strict-0 | No silent `.catch(() => {})` swallows (root-cause #4) |
| audit-listing-pagesize.mjs | strict-0 | List endpoints clamp `pageSize ≤ 50` (Hobby tier rule #6) |
| audit-jsx-text-comments.mjs | strict-0 | No `// comment` lines inside JSX child position (renders as text) |
| audit-seed-external-urls.mjs | strict-0 | Seed data uses `seedExtMedia()`, not raw firebase storage URLs |
| audit-raw-form-input.mjs | strict-0 | No raw `<form>` / `<input>` / `<select>` / `<textarea>` in product code (Rule #9) |
| audit-sticky-offsets.mjs | strict-0 | Sticky elements use `var(--header-height)` not hardcoded `top-N` (root-cause #2) |
| audit-firebase-alias.mjs | strict-0 | Webpack + Turbopack `firebase` alias in `next.config.js` (root-cause #14) |
| audit-semantic-colors.mjs | strict-0 | Status colors use semantic tokens (`text-error` etc.) not raw red/green/amber |
| audit-theme-drift.mjs | strict-0 | TS theme presets aligned with matching CSS blocks in `tokens.css` |
| audit-error-display-i18n.mjs | strict-0 | `ERROR_CODES` / `HTTP_ERROR_CODES` enum values match `messages/en.json` errors.codes.* (UNKNOWN sentinel allowed) |
| audit-email-raw-html.mjs | strict-0 | Raw `html: \`<` literals outside email primitives — every sender uses `<EmailDoc>` + `renderToStaticMarkup` |
| audit-form-mutation-hook.mjs | strict-0 | `<Form>` callsites use `useApiMutation` + `apiClient`, not raw `fetch()` |
| audit-variant-prop-coverage.mjs | drift | className tokens on primitives that should use variant props (catalogued in [scripts/variant-catalogue.mjs](scripts/variant-catalogue.mjs)). **Other-session lane.** |
| audit-functions-registry-completeness.mjs | strict-0 | Every Firebase function declares `secretEnvVar`; HTTPS funcs declare `options.secrets[]` |
| audit-payment-provider-import.mjs | strict-0 | `razorpay` only imported from `appkit/src/providers/payment-razorpay/**` |
| audit-shipping-provider-import.mjs | strict-0 | Shiprocket REST host only called from `appkit/src/providers/shipping-shiprocket/**` |
| audit-mock-flag-production.mjs | strict-0 | `siteSettings.featureFlags.useMockPayment/Shipping` throws in `NODE_ENV=production` |
| audit-orphan-dev-routes.mjs | strict-0 | No new `/api/dev/mock-*` routes — webhook simulation goes through admin-only `/api/admin/dev/...` |
| audit-checkout-bypass.mjs | strict-0 | `adminCheckoutBypass` only consumed by `/api/admin/checkout-bypass/route.ts` + RBAC |
| audit-auth-rate-limit.mjs | strict-0 | Every `/api/auth/**` route applies `RateLimitPresets.<AUTH \| PASSWORD_RESET \| OAUTH>` |
| audit-inline-session-cookie.mjs | strict-0 | Only `src/lib/firebase/auth-server.ts` reads `cookies().get("__session")` |
| audit-inline-role-check.mjs | strict-0 | Role checks use `isAdminUser()` etc. predicates, not `user.role === "admin"` |
| audit-route-rbac.mjs | strict-0 | Every API route wraps `createRouteHandler({ auth, roles, permission })` or carries `// rbac-public:` |
| audit-page-rbac.mjs | strict-0 | Dashboard pages have ancestor `makeAdminSectionLayout(perm)` / `<RoleGuard>` |
| audit-mock-gating.mjs | strict-0 | `__mocks__/*` files are jest-only and seed data only imported by `/api/demo/seed` |
| audit-form-schema.mjs | strict-0 | Every `<FormShell>` / `useFormShellState(...)` references a Zod schema (Track D) |
| audit-quick-form-drawer-schema.mjs | strict-0 | Every `<QuickFormDrawer>` passes `schema` prop |
| audit-media-direct-upload.mjs | strict-0 | No `request.formData()` / `arrayBuffer()` outside `/api/media/sign` + `/finalize` (Track E) |
| audit-firestore-storage-urls.mjs | strict-0 | No raw `firebasestorage.googleapis.com` / `storage.googleapis.com/v0/` URLs in source |
| audit-raw-img-src.mjs | strict-0 | JSX `src="https://..."` blocked for Firebase Storage / GCS / googleusercontent (except `lh3.*` Google photos) |
| audit-finalize-magic-bytes.mjs | strict-0 | `/api/media/finalize` always calls `fileTypeFromBuffer()` + emits `422 MIME_MISMATCH` |
| audit-storage-rules-shape.mjs | strict-0 | `appkit/firebase/base/storage.rules` stays `allow read: if true` / `allow write: if false` |
| audit-silent-body-parse.mjs | strict-0 | No silent `request.json().catch(() => ({}))` outside `createRouteHandler` |
| audit-server-action-envelope.mjs | strict-0 | Every server action returns `ActionResult` or `void` (Track W6) |
| audit-usemutation-onerror.mjs | strict-0 | Every mutation flows through `useApiMutation` (not raw `useMutation`) |

### Audits delegated to appkit/scripts/ via the dispatcher

Three appkit audits run directly from the consumer dispatcher (separate from the `appkit` npm-prefix entry that runs the chain):
- `appkit/scripts/audit-catch-normalize.mjs`
- `appkit/scripts/audit-route-schema-registry.mjs`
- `appkit/scripts/audit-unknown-leakage.mjs` — **closed strict-0** (W18 complete 2026-06-17: 992 → 0)
