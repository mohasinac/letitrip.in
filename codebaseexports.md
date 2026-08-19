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
| Section | Component | children, surface, padding, rounded, border, shadow, tone, background (SectionBackgroundConfig) | Semantic `<section>` for thematically grouped content; `background` renders a scoped color/gradient/image layer behind children |
| sectionBackgroundStyle | Function | (bg: SectionBackgroundConfig) => React.CSSProperties | Resolves a SectionBackgroundConfig to inline style; reused by FilterDrawer/ListingFilterDrawer/SidebarLayout for their own `background` prop |
| SectionBackgroundConfig | Type | { type: "color"\|"gradient"\|"image", value, overlay? } | Scoped (non-viewport-fixed) background shape shared by Section/FilterDrawer/ListingFilterDrawer/SidebarLayout |
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
| Select | Component | options, value, onChange, onValueChange, placeholder, label, error, helperText, required, variant, bare, className, wrapperClassName | Styled native select with label and error handling. `className` styles the inner `<select>`; `wrapperClassName` sizes the real flex-child wrapper div (use for `flex-shrink-0`/`min-w-*`/`max-w-*` inside a Row) |
| SelectOption | Type | {label, value, disabled?} | Select option object type |
| SelectProps | Type | {options, value?, onChange?, onValueChange?, ..., wrapperClassName?} | Select props interface |

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
| Tabs.tsx | Tabs, TabsList, TabsTrigger (badge/label props), TabsContent | Component | Tab navigation — TabsList collapses to a colored dropdown past 5 triggers; canonical primitive for every tab strip in the app (2026-08-19: absorbed CategoryDetailTabs/BrandDetailTabs/DetailPageTabs/TabStrip/FAQCategoryTabs/homepage FAQ tabs) |
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
| SiteMark.tsx | SiteMark | Component | Icon-only glyph (distinct from SiteLogo's text wordmark); `size`/`tone` presets, themed via the same `--appkit-logo-stop-*` variables |
| PageLoader.tsx | PageLoader | Component | Full-page loading with 15s timeout |
| ViewToggle.tsx | ViewToggle | Component | Grid/list view toggle |
| ResponsiveView.tsx | ResponsiveView | Component | Responsive breakpoint-aware container |
| ImageGallery.tsx | ImageGallery | Component | Image gallery with lightbox |
| ImageLightbox.tsx | ImageLightbox | Component | Fullscreen image/video viewer — `LightboxImage.kind?: "image" \| "video"` (+ `poster?`) renders a native `<video controls>` slide, zoom/rotate transform still applies |
| BackgroundRenderer.tsx | BackgroundRenderer | Component | Background image/video/gradient renderer |
| DashboardStatsCard.tsx | DashboardStatsCard | Component | Dashboard metric card |
| StatsGrid.tsx | StatsGrid | Component | Grid of stat cards |
| SummaryCard.tsx | SummaryCard | Component | Summary/overview card |
| FlowDiagram.tsx | FlowDiagram | Component | Flow/step diagram |
| BaseListingCard.tsx | BaseListingCard, BaseListingCard.Checkbox | Component | Base card for marketplace listings with selection support |
| ../forms/FormShell.tsx | FormShellProvider, useFormShell, useFormShellState, applyZodIssues | Component/Hook | Form-state provider + context consumed by `<Form>` and the wizard's `<StepForm>` — NOT the wizard chrome itself (see `features/shell/FormShell.tsx` below) |
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
| UserSidebar | Component | Account navigation sidebar. 2026-08-19: inline search box via `useSidebarSearch` (shared with Admin/Seller sidebars) |
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
| AdminTesterChecklistView | View | Tester QA checklist catalog management (mirrors FAQs). Defaults the Status filter to Active (bug-confirmed/reopened-away cases stay hidden unless explicitly filtered); "Reopen as New Test Case" row action on bug-confirmed rows (2026-08-19) |
| AdminTesterChecklistItemEditorView | View | Tester checklist test-case create/edit form |
| AdminEventsView | View | Events management |
| AdminEventEditorView | View | Event editor |
| AdminEventEntriesView | View | Event entries management |
| AdminAllEventEntriesView | View | All event entries listing |
| AdminReviewsView | View | Reviews management |
| AdminPayoutsView | View | Payouts management |
| AdminArtView | View | Art print listings management (EMI/art-stickers session) |
| AdminStickersView | View | Sticker listings management (EMI/art-stickers session) |
| AdminSectionsView | View | Homepage sections management |
| AdminCarouselView | View | Carousel management |
| AdminCarouselEditorView | View | Carousel editor |
| AdminCarouselGroupEditorView | View | Carousel group create/edit form (name + active/draft status) |
| AdminGroupedListingsView | View | Admin cross-store grouped-listings moderation (Sieve list + reassign-products drawer); wired to `/admin/grouped-listings` 2026-08-19, was previously unreachable (Root Cause #37) |
| AdminAdsView, AdminAdEditorView | View | Ads management and editor |
| AdminMediaView | View | Media management |
| AdminNavigationView | View | Navigation management |
| AdminNavEditorView | View | Navigation editor |
| AdminSiteView | View | Site configuration |
| AdminSiteSettingsView | View | Site settings. 2026-08-19 — added inputs for previously Firestore-console-only fields (`commissions.codDepositPercent`/`sellerShippingFixed`/`platformShippingPercent`/`platformShippingFixedMin`, `payment.otpCheckoutThreshold`, `notificationChannels.{whatsapp,email}.types` per-type allowlists via `<PaginatedSelect multiple>`, per-listing-type/per-category-type `featureFlags` toggles); new generic "⑱ Feature Flags" tab mapping over `FEATURE_FLAG_META` (was a fully-built, zero-consumer scaffold — closes the `chats`/`translations`/`reviews`/`sellerRegistration`/`preOrders`/`wishlists`/`events`/`blog`/`coupons`/`notifications` toggle gaps in one generic block); Gift Wrap + Shipment Protection fee toggle pairs added to the Fees tab. Does **not** duplicate `adminCheckoutBypass` — that flag already has a dedicated, audited toggle on the Admin Dashboard page (`audit-checkout-bypass.mjs` is strict-zero on a second source). |
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
| AdminSidebar, AdminTopBar | Component | Admin sidebar and top bar. 2026-08-19: AdminSidebar gets inline search via `useSidebarSearch` |
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
| BlogPostView | View | Single blog post view — renders 3 related-posts sections (same category, tag overlap, same author) via `useBlogPost()`'s `related`/`relatedByTags`/`relatedByAuthor` (2026-08-19) |

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
| CategoryCard, CategoryGrid | Grid | Category grid display — `CategoryCard`'s item count now reads the (2026-08-19-backfilled) `metrics.productCount` field correctly; both are reused by `CategoryDetailPageView`/`BrandDetailPageView`'s new "Related Categories"/"Related Brands" sections (root-sibling / other-active-brand lookups) |
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
| BundleDetailView | View | Public bundle detail page — contents collage + numbered list, discount badge (`computeBundleDiscount`) when `bundleOriginalTotal` is set |
| BundleDynamicRuleEditor | Form | Bundle dynamic rule editor |
| BundleCollage | Display | Bundle products collage |
| BundleItemsPicker | Picker | Multi-select bundle items picker |
| CategoryBundlesListing | Listing | Bundles in category (cards via `MarketplaceBundleCard`, discount-aware) |
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
| RelatedEventsCarousel | Carousel | Related-events carousel — other active events sharing ≥1 tag with the current one (`getRelatedEvents()` server action); used on `/events/[id]`'s Overview tab (2026-08-19) |
| EventRafflesSection | Section | Raffles section in event |
| EventRaffleWinnerView | View | Raffle winner announcement |
| SpinWheelView | View | Spin wheel game |

### Lottery (`appkit/src/_internal/client/features/lottery/`)

| Export | Type | Purpose |
|--------|------|---------|
| LotterySlotGrid | Grid | Visual slot grid (never shows price/weight) |
| LotteryPullForm | Form | User lottery pull form (TX ID + phone + slot) |
| LotteryListView | Listing | Card grid of lottery events |
| LotteryDetailView | Detail | Full lottery event page with slot grid + pull form |
| LotteryEntriesView | Admin | Admin/owner entry table with flag action |
| LotteryAdminSlotView | Admin | Admin-only slot view with price + weight |
| LotteryAdminEditView | Admin | Lottery create/edit form with slot builder |
| PrizeDrawLotteryDetailView | Detail | Prize-draw product in lottery mode |

### FAQ (`appkit/src/features/faq/components/`)

| Export | Type | Purpose |
|--------|------|---------|
| FAQAccordion, FAQCategoryTabs | Accordion | FAQ accordion |
| FAQCategorySidebar | Sidebar | FAQ category navigation |
| FAQSortDropdown | Select | FAQ sort selector |
| FAQHelpfulButtons | Component | Helpful/unhelpful vote buttons |
| RelatedFAQs | List | Related FAQs section |
| ContactCTA | Button | Contact CTA |
| FAQPageContent | Page | FAQ page content. **2026-08-19: now actually wired to the live `/faqs` + `/faqs/[category]` routes** via the new consumer-side `src/components/faq/FAQPageClient.tsx` wrapper (manages search/sort/category `useUrlTable` state, contact info + categories fetched server-side in `page.tsx` via `siteSettingsRepository`). Previously built but unreferenced by any route — the routes rendered `FAQPageView`/`FAQSearchableList` (client-side substring search only) instead. `FAQPageView`/`FAQSearchableList` are now unreferenced dead code, left in place. |
| FAQSearchableList | Component | 2026-08-19 — searchable FAQ list extracted from `FAQPageView` for reuse (category filter + free-text search over question/answer). Superseded by `FAQPageContent` on the live routes (see above) — no longer referenced by any page. |

### Tester (`appkit/src/features/tester/components/`)

| Export | Type | Purpose |
|--------|------|---------|
| TesterHubView | View | `/user/tester` — searchable (title or route) grouped-accordion QA checklist; Yes/No per case, inline comment + screenshot. Access gate is `isTester \|\| isAdminUser` (2026-08-19), so admins see the same hub as flagged testers |
| TesterChecklistStepRow | Component | One checklist step row — Yes/No button pair + expandable note/screenshot form |
| TesterFeedbackChart | Component | Recharts bar chart of pass/fail per group, dynamically imported (SSR disabled) — mirrors `AdminAnalyticsCharts.tsx`'s pattern |
| AdminTesterFeedbackView | View | `/admin/tester-feedback` — Report / Main Issues / All Submissions tabs |
| AdminTesterFeedbackReportView | View | Report tab — stat row + `TesterFeedbackChart` |
| AdminTesterFeedbackIssuesView | View | Main Issues tab — every `answer:"no"` response with comment/screenshot |
| AdminTesterFeedbackListView | View | All Submissions tab — `DataListingView` + Mark Reviewed + Mark as Bug row actions |
| AdminTesterFeedbackView "Download Report" button | Button | `ACTIONS.ADMIN["export-tester-feedback"]` — downloads the Markdown report via `GET /api/admin/tester-feedback/export` (2026-08-17) |
| BugHunterLeaderboardView | Component | Public — render-prop leaderboard listing testers ranked by confirmed-bug count (2026-08-19), mirrors `EventLeaderboard`'s shape. Mounted at `/bug-hunters` |

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
| ProductGalleryClient | Gallery | Product image + video gallery — `video?: ProductGalleryVideo` renders a trailing slide (poster + play badge), opens in `ImageLightbox` theater mode with a native `<video controls>` (zoom/rotate still apply) |
| BidHistory | Component | Auction bid history |
| PlaceBidForm | Form | Place bid form |
| MakeOfferForm, MakeOfferButton | Component | Make offer components |
| RelatedProducts, RelatedProductsCarousel | Component | Related products — `ProductDetailPageView` now renders up to 4 carousels (same category — fixed off the deprecated `category` field 2026-08-19, same brand, tag overlap, same store) via `RelatedProductsCarousel`, each independently fetched |
| CustomFieldsEditor, CustomSectionsEditor, CustomSectionTabContent | Editor | Custom fields/sections |
| NonRefundableConsentModal | Modal | Non-refundable product consent |
| PrizeDrawItemsEditor | Editor | Prize draw items editor (min 2 items, was 3, 2026-08-19) |
| PrizeDrawCollage | Display | Prize draw items collage |
| PrizeRevealModal | Modal | Redesigned 2026-08-19 for fully-automatic reveal — pure display (`pending`/`won` from `initialPrizeWon`), no more buyer-click `onReveal` flow; props: `revealMode?: "instant"\|"scheduled"`, exports `PrizeRevealResult` (renamed from `PrizeRevealResponse`) |
| PrizeDrawWinnerMappingView | View | New 2026-08-19 — read-only item→order winner mapping for classic reveal-mode draws, admin/seller-only (never public); wired into the admin/seller prize-draw "entries" pages alongside `LotteryEntriesView` (lottery mode) |
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
| SellerPayoutsView | View | Seller payouts history — row "View Details" opens a self-contained SideDrawer (status/progress, transaction ID, expected date, `sellerReminderFlag` toggle); bulk-select drives a working "Export Selected" CSV action (`ACTIONS.STORE["export-payout"]`) |
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
| SellerBundlesView | View | Seller bundles |
| SellerClassifiedView | View | Classified ads management |
| SellerDigitalCodesView | View | Digital codes management |
| SellerLiveView | View | Live streaming management |
| SellerArtView | View | Art print listings management (EMI/art-stickers session) |
| SellerStickersView | View | Sticker listings management (EMI/art-stickers session) |
| SellerGoogleReviewsView | View | Google reviews integration |
| PrintCenterView | View | Label/document printing |
| SellerSidebar, SellerStatCard | Component | Dashboard navigation/stats. 2026-08-19: SellerSidebar gets inline search via `useSidebarSearch` |
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
| orders | OrderCard, OrdersList, MarketplaceOrderCard | Component | Order display components; both accept `renderActions?: (order) => ReactNode` — per-card quick-action slot (e.g. buyer Track/Cancel links) rendered in the card footer, click-stop-propagated so it doesn't trigger the card's own onClick |
| orders | OrderFilters, OrderSiblingPayments | Component | Order filtering, sibling payments |
| orders | RefundHistoryTable, RefundRequestView | Component | Refund components |
| orders | OrderPaymentSummary | Component | `appkit/src/features/orders/components/OrderPaymentSummary.tsx` — reads `order.paymentRecord` (Feature C), falls back to legacy `paymentMethod`/`paymentId`/`paymentProofUrl` fields for pre-migration orders |
| shipments | AdminShipmentsView, AdminShipmentEditorView, AdminShipmentLotItemsView, AdminShipmentProjectionsView, ShipmentItemLinkModal | View/Component | `appkit/src/features/shipments/components/` — Feature A (Procurement Shipments, admin-only): list/editor/lot-items(+bulk-import)/projections + the shared "Create pre-order link" modal |
| catalogue | UserCatalogueView, CatalogueItemEditorView, PublicCatalogueView, AdminCatalogueApprovalsView | View | `appkit/src/features/catalogue/components/` — Feature B (Personal Catalogue): owner's own list, item editor, public read-only grid (mounted as the "Catalogue" tab on `/profile/[userId]/[tab]`), admin approval queue |
| pre-orders | MarketplacePreorderCard, PreOrderFilters | Component | Pre-order card and filtering |
| pre-orders | PreOrdersListView, PreOrdersIndexListing | View | Pre-orders listing |
| pre-orders | PreOrderDetailPageView | Page | Pre-order detail page |
| promotions | CouponCard, CouponsIndexListing | Component | Coupon display |
| promotions | PromotionsView, PromotionsHero | View | Promotions/offers page |
| reviews | ReviewCard, ReviewsList, ReviewFilters | Component | Reviews display |
| reviews | ReviewSummary, ViewReviewModal | Component | Review summary and modal |
| reviews | ReviewsIndexListing | Listing | Reviews index/search |
| shell | FormShell, StepForm, StepFormActions | Component | `appkit/src/features/shell/` — the real multi-step wizard chrome + step engine (see Rule #9 table in CLAUDE.md); state comes from `ui/forms/FormShell.tsx`'s `FormShellProvider` |
| shell | QuickFormDrawer | Component | `appkit/src/features/shell/QuickFormDrawer.tsx` — compact 1–3 field inline-edit drawer, schema required |
| shell | CommandPalette, useCommandPaletteHotkey, CommandPaletteGroup | Component/Hook/Type | `appkit/src/features/shell/CommandPalette.tsx` — ⌘K/Ctrl+K search-and-jump modal over a flat group/item list; mounted in admin via consumer's `AdminCommandPaletteMount.tsx` |
| search | Search | Component | Search input with suggestions |
| search | SearchFiltersRow, SearchResultsSection | Component | Search UI |
| search | SearchView | View | Full search page |
| wishlist | WishlistCard, WishlistPage, WishlistView | View | Wishlist page |
| wishlist | WishlistToggleButton | Button | Add to wishlist button |
| wishlist | WishlistCapWatcher | Watcher | Wishlist capacity monitor |
| scams | ScamRegistryView, ScamProfileView | View | Scam registry — `ScamProfileView` now takes `similarScamReports?` (other verified profiles sharing scamType, distinct from the pre-existing explicit `relatedScammerIds`-based "Related Profiles"); `getScammerProfilePageData()` returns both (2026-08-19) |
| scams | ScamAwarenessModal | Modal | Scam awareness warning |
| scams | SellerTrustBadge | Badge | Verified-scammer lookup badge on store pages (P-12); reads `getSellerTrustStatus()`; named to avoid colliding with the unrelated homepage `TrustBadge` type |
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
| bundles | getBundleForDetail | cache(slug) | Fetch bundle (categoryType:"bundle" row) by slug |
| bundles | listBundleMembers | cache(bundle) | Resolve bundle's member `ProductDocument[]` — falls back to `bundleQueryRule.productIds` when `bundleProductIds` mirror is empty |
| bundles | resolveBundleMemberIds | sync(bundle) | Pure id-resolution helper backing `listBundleMembers` |
| bundles | resolveBundleOriginalTotal | async(productIds[]) | Sum member product prices for the discount "before" total; `undefined` if any member fails to resolve |
| bundles | listFeaturedBundles | cache(limit?) | Active bundles for homepage placement |
| cart | getCartForUser | cache(userId) | Fetch user's cart |
| events | getEventForDetail | cache(slugOrId) | Fetch event details |
| history | getHistoryForUser | cache(userId) | Fetch user view history |
| maintenance | listCloudLogEntries | cache(opts?) | Google Cloud Logging entries for `/admin/maintenance/cloud-logs`; bounded single `getEntries()` call, client-driven pagination via `nextPageToken` (Hobby tier rule #6) |
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
| bundles | computeBundleDiscount | Pure `(bundlePrice, bundleOriginalTotal) → { originalTotal, savings, percent } \| null` — null when there's no real discount (missing total, or bundle priced at/above the member sum) |
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
| CloudLogsListView | features/maintenance/views/CloudLogsListView.tsx | Component | `/admin/maintenance/cloud-logs` table view — filters, pagination, message preview |
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
| EventRepository / EventsRepository | events | findBySlug, listByStatus, list | Events |
| EventEntryRepository / EventEntriesRepository | eventEntries | findByEvent, findByUser | Event participation |
| LotteryEntryRepository | lotteryEntries | listForSource, listForUser, countByUser, countByTransactionId, flagEntry, createEntry | Lottery pulls + entries |
| NewsletterRepository | newsletter | findByEmail, subscribe, unsubscribe | Newsletter |
| CopilotLogRepository | copilotLogs | findByUser | AI chat history |
| ScammerRepository | scammers | findByUserId, findByPhone | Scam registry |
| SupportRepository | supportTickets | findByStatus, addMessage | Support tickets |
| ProductTemplateRepository | productTemplates | findByStore | Listing templates |
| ProductFeaturesRepository | productFeatures | search, listByStore | Product features |
| UnitOfWork | — | transaction wrapper | Atomic multi-collection operations |
| ShipmentsRepository | procurementShipments | findByShipmentNumber, list (Sieve) | Feature A shipment header CRUD; `create`/`update`/`delete` enforce uniqueness + linked-item delete guard |
| ShipmentLotsRepository | shipmentLots | listByShipment, createLot, updateLot, listForProjections (Sieve) | Feature A per-lot CRUD; `listForProjections` is the real paginated Projections query |
| ShipmentItemsRepository | shipmentItems | listByLot, createItem, bulkCreate, updateItem, unlink, hasLinkedItemsInLot | Feature A per-item CRUD; `bulkCreate` writes ≤500 rows in one Firestore WriteBatch |
| CatalogueRepository | catalogueItems | listByOwner, listPublicByOwner, listPendingApproval (Sieve), listStale | Feature B personal-catalogue CRUD; `update` auto-stamps `lastImageUpdateAt` whenever `images` changes |
| JobsRepository (`jobsRepository`) | jobs | markProcessing, markDone, markFailed, getStaleFinishedRefs | Async job primitive (2026-08-15) — pure auto-ID docs, `getStaleFinishedRefs(ttlDays=30)` feeds the `cleanupRtdbEvents` TTL sweep |
| TesterChecklistItemRepository (`testerChecklistItemRepository`) | testerChecklistItems | createItem, update, listActive, list (Sieve), confirmBug, reopenAsNewVersion, getBugHunterLeaderboard | Tester QA program (2026-08-17) — admin-managed test-case catalog, mirrors FAQs. Bug-hunter rewards (2026-08-19): `confirmBug(id, hunterId, hunterName)` credits the reporting tester and sets `isActive:false`; `reopenAsNewVersion(oldId)` clones a disabled, bug-confirmed item into a new active `version+1` doc (id `{old.id}-v{n}`) for retest, leaving the old doc disabled with its credit intact; `getBugHunterLeaderboard(limit)` single-query in-memory aggregation of `bugConfirmed==true` docs by `bugHunterId`, mirrors `EventEntryRepository.getLeaderboard()` |
| TesterChecklistResponseRepository (`testerChecklistResponseRepository`) | testerChecklistResponses | upsertResponse, listForTester, list (Sieve), markReviewed, getCoverageReport, getMarkdownReport | Tester QA program — one doc per (tester, case), deterministic ID `${testerId}__${checklistItemId}`; `getCoverageReport()` powers the admin Report + Main Issues tabs (2026-08-19: `issues[]` now also carries `bugConfirmed`/`bugHunterId`/`bugHunterName`/`supersededByItemId` denormalized from the catalog item); `getMarkdownReport(siteOrigin)` (2026-08-17) dumps every answered case as Markdown — Issues ("No") + Notes on passing cases ("Yes" with a comment), grouped by feature area, for a human or a future Claude session to read directly and go fix |

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

### Shipments Hooks (Feature A) — `appkit/src/features/shipments/hooks/useShipments.ts`

| Hook | Returns | Purpose |
|------|---------|---------|
| useShipments(params) | { shipments, meta, isLoading, error, refetch } | Paginated shipment list |
| useShipment(shipmentId) | { shipment, lots, isLoading, error, refetchShipment, refetchLots } | One shipment + its ≤10 lots |
| useShipmentItems(shipmentId, lotId, params) | { items, meta, isLoading, error, refetch } | Paginated items within one lot |
| useShipmentProjections(params) | { lots, meta, isLoading, error, refetch } | Real paginated Projections query over `shipmentLots` |

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
| Checkout | createCheckoutOrderAction | buyer+ | COD/UPI/EMI/admin-bypass order placement. `outOfStockPolicy` param (2026-08-15, default `"skip_items"`) decides cancel-whole-order vs. ship-available-items-only when the transaction finds a shortfall |
| Checkout | verifyAndPlaceRazorpayOrderAction | buyer+ | Razorpay-paid order placement after signature + amount verification. Same `outOfStockPolicy` param (default `"cancel_order"`); `skip_items` triggers an automatic partial refund via `processRefundAction` since payment was already captured for the full cart |
| Checkout | sendCheckoutValueOtpAction (`appkit/src/features/checkout/actions/checkout-value-otp-actions.ts`) | buyer+ | Tier PP (2026-08-18) — sends an OTP against the `checkoutValueOtps` namespace when cart total ≥ `siteSettings.payment.otpCheckoutThreshold` (default ₹5,000) and `paymentMethod != "cod"`; evaluated against the whole cart total before per-seller order splitting |
| Checkout | verifyCheckoutValueOtpAction (same file) | buyer+ | Tier PP — verifies the code; `createCheckoutOrderAction` re-checks `isCheckoutValueOtpVerified()` before placing a high-value non-COD order |
| Classified | startClassifiedConversationAction | buyer+ | Initiate seller contact |
| Digital Code | claimCodeAction | buyer+ | Reveal purchased code |
| Events | registerEventAction | any authed | Register for event |
| Events | cancelRegistrationAction | any authed | Cancel registration |
| History | trackProductViewAction | buyer+ | Track product view |
| History | mergeGuestHistoryAction | buyer+ | Merge guest history |
| Jobs | enqueueJob (`appkit/src/features/jobs/actions/enqueue-job.ts`) | server-only (called from route handlers) | Async job primitive (2026-08-15) — the ONLY thing a Vercel route may do to start heavy work: writes a `jobs/{jobId}` doc + mints a `bulkJobId`-scoped custom token, returns `{jobId, customToken}` immediately. All actual processing runs in the `onJobCreated` Firebase Function (§20 Firebase Jobs). |
| Orders | createOrderAction | buyer+ | Create order |
| Orders | cancelOrderAction | buyer+ | Cancel pending order |
| Orders | requestReturnAction | buyer+ | Request return |
| Orders | updateOrderStatusAction | seller+ | Update order status |
| Orders | shipOrderAction | seller+ | Manual ship (carrier + tracking); gated by assertEmiShippable for EMI orders |
| Orders | attachPaymentProofAction | buyer (owner) | Feature C, extended Tier PP (2026-08-18) — buyer attaches cash/UPI proof; now also takes `buyerReportedUpiId`, `buyerMarkedPaid`, `buyerFraudAgreementAccepted` (server-validated — 400 if the agreement checkbox is false), computes `paymentUpiMismatch` against `order.displayedUpiId`, and fires `notifyAdminsOfPaymentProof()` (fan-out WhatsApp push, non-fatal) |
| Orders | adminVerifyPaymentAction | admin/mod | Feature C — confirms manual payment; sets `paymentStatus:"paid"` + `paymentRecord` (method:"manual", verificationMethod:"manual_review") |
| Orders | adminRequestProofReuploadAction (Tier PP, 2026-08-18) | admin/mod | Clears proof/mark-paid/agreement/UPI fields so the buyer can cleanly resubmit; extends `order.paymentDeadline` by 15 more minutes from now; sets `paymentReviewOutcome:"reupload_requested"` |
| Orders | adminRejectPaymentAsFraudAction (Tier PP, 2026-08-18) | admin/mod | Cancels the order (`cancellationReason:"payment_fraud_rejected"`), calls `restoreStockForOrder()`, sets `paymentReviewOutcome:"rejected_fraud"`, enqueues `hardBanCascade` with `expiresAt: now+7d` (temporary hard ban, not permanent) |
| Orders | raiseOrderDisputeAction (Tier PP, 2026-08-18) | buyer/seller/admin | Only valid when `order.autoApproved===true`; sets `disputeRaised`/`disputeStatus:"open"` for manual admin investigation, does not itself reverse payment/order status |
| EMI | markEmiInstallmentPaidAction | seller+ | Record collection of one EMI installment |
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
| Catalogue | listFromCatalogueAction | seller/admin | Feature B — direct-lists a catalogue item (seller: own store; admin: `store-letitrip-official`, since admins have no personal seller store) |
| Catalogue | submitCatalogueItemForApprovalAction | any authed | Feature B — buyer "Request to sell"; flips `listingStatus` to `pending_admin_approval` |
| Catalogue | approveCatalogueListingAction | admin | Feature B — creates the product under `store-letitrip-official`, marks the catalogue item listed |
| Catalogue | rejectCatalogueListingAction | admin | Feature B — records a rejection reason, flips `listingStatus` to `rejected` |

---

## 9. API Routes

### Admin Routes (~100 endpoints)

| Route | Methods | Purpose |
|-------|---------|---------|
| `/api/admin/products` | GET, POST | List/create products |
| `/api/admin/products/[id]` | GET, PUT, DELETE | Product CRUD |
| `/api/admin/users` | GET, POST | List/create users |
| `/api/admin/users/[uid]` | GET, PUT, DELETE | User CRUD |
| `/api/admin/users/[uid]/hard-ban` | POST | Enqueues the `hardBanCascade` job (2026-08-15 — was inline, now async via the jobs primitive) and returns `{jobId, customToken}`; synchronous guards (self-ban, target-exists, admin-target) still run in the route |
| `/api/admin/users/bulk` | POST | Bulk suspend/restore/delete (2026-08-15) — bounded `Promise.all`, `BULK_MAX=50`; suspend and delete both soft-disable, no cascade, no real data deletion |
| `/api/admin/notifications/bulk` | POST | Bulk mark-read/delete (2026-08-15) — same bounded pattern |
| `/api/admin/sessions` | GET | Active/expired session list; per-uid Firebase Auth enrichment fixed from a sequential loop to `Promise.all` (2026-08-15) |
| `/api/admin/stores` | GET, POST | List/create stores |
| `/api/admin/stores/[uid]` | GET, PUT, DELETE | Store CRUD |
| `/api/admin/orders` | GET, POST | List/create orders |
| `/api/admin/orders/[id]` | GET, PUT, DELETE | Order CRUD |
| `/api/admin/orders/[id]/refund` | POST | Order refund |
| `/api/admin/orders/[id]/payment-reupload` | PATCH | Tier PP (2026-08-18) — `adminRequestProofReuploadAction`; order stays open, `paymentDeadline` extended +15 min |
| `/api/admin/orders/[id]/payment-reject-fraud` | PATCH | Tier PP (2026-08-18) — `adminRejectPaymentAsFraudAction`; cancels order, restores stock, enqueues `hardBanCascade` (7-day expiry). `kind:"danger"`, confirmation-gated per Rule #7 |
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
| `/api/admin/faqs/[id]` | GET, PUT, PATCH, DELETE | FAQ CRUD — 2026-08-19: schema fixed to accept `tags`/`order`/`priority`/`isPinned`/`showOnHomepage`/`showInFooter` (was silently dropping all 6); `answer`/`slug` now correctly transformed to `{text,format}`/`"seo.slug"` on update to match create (previously wrote wrong shapes) |
| `/api/admin/tester-checklist-items` | GET, POST | List/create tester QA checklist test cases |
| `/api/admin/tester-checklist-items/[id]` | GET, PUT, PATCH, DELETE | Tester checklist item CRUD |
| `/api/admin/tester-checklist-items/[id]/reopen` | POST | Bug-hunter rewards (2026-08-19) — `ROLES_ADMIN_ONLY`. Reopens a bug-confirmed, disabled case as a new active `version+1` item for retest via `testerChecklistItemRepository.reopenAsNewVersion()`; 400 if not bug-confirmed, 409 if already reopened |
| `/api/admin/tester-feedback` | GET | Flat filterable list of every tester's checklist responses (All Submissions tab) |
| `/api/admin/tester-feedback/[id]` | PATCH | Mark a tester response reviewed |
| `/api/admin/tester-feedback/[id]/confirm-bug` | POST | Bug-hunter rewards (2026-08-19) — `ROLES_ADMIN_ONLY`. Confirms a "No" response as a real bug via `testerChecklistItemRepository.confirmBug()`: credits the reporting tester as `bugHunterId`/`bugHunterName` on the checklist item and sets `isActive:false` (disabling the case for all other testers); also marks the response reviewed. 400 if the response isn't a "No", 409 if the item is already bug-confirmed |
| `/api/admin/tester-feedback/report` | GET | Coverage report — per-item yes/no counts + flat "no"-answer issues list (Report + Main Issues tabs); issues now also carry `bugConfirmed`/`bugHunterId`/`bugHunterName`/`supersededByItemId` (2026-08-19) |
| `/api/admin/tester-feedback/export` | GET | Downloads every answered checklist response as a Markdown file (`Content-Disposition: attachment`), grouped by feature area, joined against the checklist catalog for readable labels — `TesterChecklistResponseRepository.getMarkdownReport()`, same output as `npm run tester:export-feedback` (2026-08-17) |
| `/api/admin/coupons` | GET, POST | List/create coupons |
| `/api/admin/coupons/[id]` | GET, PATCH, DELETE | Coupon CRUD — 2026-08-19: PATCH previously never called `couponsRepository.update()` at all (only activate/deactivate worked); every other edit (name/description/discount/usage/restrictions/validity dates) silently no-op'd while returning a 200 that echoed the submission as if saved. Now persists correctly, with `validity`/`restrictions` merged (not replaced wholesale) against the existing document |
| `/api/admin/carousel` | GET, POST | List/create carousel slides |
| `/api/admin/carousel/[id]` | GET, PUT, DELETE | Carousel CRUD |
| `/api/admin/carousels` | GET, POST | List/create carousel groups (`AdminCarouselGroupEditorView`) |
| `/api/admin/carousels/[id]` | GET, PUT, DELETE | Carousel group CRUD |
| `/api/admin/grouped-listings/[id]` | GET, PATCH, DELETE | Admin moderation endpoint for a grouped listing (seller-scoped CRUD lives at `/api/store/grouped-listings/[id]`) — PATCH added 2026-08-19 (previously 405'd, "Reassign products" was fully broken); recomputes `activeMemberCount` from `productIds.length` on write, matching create's derivation |
| `/api/admin/maintenance/cloud-logs` | GET | Google Cloud Logging entries for `/admin/maintenance/cloud-logs` — `listCloudLogEntries()`, bounded single call + client-driven pagination |
| `/api/admin/sections` | GET, POST | List/create homepage sections |
| `/api/admin/sections/[id]` | GET, PUT, DELETE | Section CRUD |
| `/api/admin/ads` | GET, POST | List/create ads |
| `/api/admin/ads/[id]` | GET, PUT, DELETE | Ad CRUD |
| `/api/admin/events` | GET, POST | List/create events |
| `/api/admin/events/[id]` | GET, PATCH, DELETE | Event CRUD — 2026-08-19: PATCH now runs the same staged-media finalize calls (`finalizeStagedMediaField`/`Object`/`ObjectArray`) as create for `coverImage`/`eventImages`/`winnerImages`/`additionalImages`, so a newly-uploaded image swapped in via edit gets promoted out of Storage `tmp/` instead of staying orphaned |
| `/api/admin/events/[id]/trigger-raffle` | POST | Manual raffle trigger |
| `/api/admin/payouts` | GET, POST | List/manage payouts |
| `/api/admin/payouts/[id]` | GET, PUT, DELETE | Payout CRUD |
| `/api/admin/payouts/weekly` | POST | Admin-manual trigger for the weekly payout sweep. Enqueues the `payoutsWeekly` job (2026-08-15 — was ~150 lines of inline grouping/creation logic duplicating the scheduled twin; now a thin wrapper around the same `runWeeklyPayoutEligibility` the `weeklyPayoutEligibility` scheduled Function uses) and returns `{jobId, customToken}` |
| `/api/admin/bundles` | GET, POST | List/create bundles |
| `/api/admin/bundles/[id]` | GET, PUT, DELETE | Bundle CRUD |
| `/api/admin/bundles/[id]/rebuild` | POST | Rebuild bundle |
| `/api/admin/site-settings` | GET, PUT | Site configuration |
| `/api/admin/analytics` | GET | Admin analytics |
| `/api/admin/dashboard` | GET | Admin dashboard data — revenue/delivered-order figures read from the `analytics/dashboardRollup` singleton doc via `analyticsRollupRepository.getDashboardRollup()` (2026-08-19, replaced an unbounded `orderRepository.findByStatus("delivered")` scan; rollup refreshed daily by the `revenueRollup` scheduled Function) |
| `/api/admin/newsletter/export` | GET | 2026-08-19 — enqueues the `newsletterExport` async job (`enqueueJob`) and returns `{jobId, customToken}` immediately; replaced a synchronous in-route CSV build over up to 10,000 subscribers. `AdminNewsletterView`'s "Download CSV" button subscribes via `useBulkEvent` and reads `result.data.csv` on completion |
| `/api/admin/addresses` | GET, POST | List/manage addresses |
| `/api/admin/addresses/[id]` | GET, PUT, DELETE | Address CRUD |
| `/api/admin/sublisting-categories` | GET, POST | Sublisting categories |
| `/api/admin/sublisting-categories/[id]` | GET, PUT, DELETE | Sublisting CRUD |
| `/api/admin/newsletter` | GET, POST | Newsletter management |
| `/api/admin/newsletter/[id]` | GET, PUT, DELETE | Newsletter CRUD |
| `/api/admin/contact-submissions` | GET | Contact submissions |
| `/api/admin/contact-submissions/[id]` | GET, DELETE | Submission CRUD |
| `/api/admin/shipments` | GET, POST | Feature A — list/create procurement shipments (409 on duplicate `shipmentNumber`) |
| `/api/admin/shipments/[id]` | GET, PATCH, DELETE | Feature A — shipment header CRUD; PATCH of customs/shipping/labor fields re-triggers the `onShipmentLotWrite` cascade; DELETE 409s while any item is still `linkedProductId` |
| `/api/admin/shipments/[id]/lots` | GET, POST | Feature A — list/create lots (≤10 per shipment) |
| `/api/admin/shipments/[id]/lots/[lotId]` | GET, PATCH, DELETE | Feature A — single lot header + remainder-count/value fields |
| `/api/admin/shipments/[id]/lots/[lotId]/items` | GET, POST | Feature A — paginated item list / single item create |
| `/api/admin/shipments/[id]/lots/[lotId]/items/bulk` | POST | Feature A — bulk paste-import, ≤500 rows, single Firestore `WriteBatch` |
| `/api/admin/shipments/[id]/lots/[lotId]/items/[itemId]` | PATCH, DELETE | Feature A — edit/delete/unlink a single item |
| `/api/admin/shipments/[id]/lots/[lotId]/items/[itemId]/link` | POST | Feature A — link a main item to an existing or newly-created pre-order product |
| `/api/admin/shipments/projections` | GET | Feature A — real paginated `shipmentLots` query, sortable by `projectedProfitPaise`/`projectedRevenuePaise`/`createdAt` |
| `/api/admin/catalogue` | GET | Feature B — admin approval queue (`listingStatus === "pending_admin_approval"`) |
| `/api/admin/catalogue/[id]/approve` | POST | Feature B — creates the product under `store-letitrip-official`, flips item to `listed` |
| `/api/admin/catalogue/[id]/reject` | POST | Feature B — records a rejection reason, flips item to `rejected` |
| `/api/admin/orders/[id]/payment-verify` | PATCH | Feature C — admin manual-payment verification; writes `paymentRecord` (method:"manual", verificationMethod:"manual_review") |
| + ~50 more | — | Moderation, RBAC, notifications, team, support tickets, etc. |

### Store Routes (~55 endpoints)

| Route | Methods | Purpose |
|-------|---------|---------|
| `/api/store/products` | GET, POST | List/create store products |
| `/api/store/bundles` | GET, POST | P-17 fix — seller-scoped bundle create/list, reuses `bundleCreateSchema` verbatim from the admin route; the seller UI previously called a dead `listingType:"bundle"` product endpoint that could never succeed |
| `/api/store/bundles/[id]` | GET, PUT, DELETE | P-17 fix — seller-scoped bundle CRUD, `storeId`-owner-checked |
| `/api/store/orders` | GET | List store orders |
| `/api/store/orders/[id]` | GET, PUT, PATCH | Order management; PATCH `{ markCodCollected, codCollectionNote }` — Feature C, writes `paymentRecord` (method:"cod"), 400 if `paymentMethod !== "cod"` |
| `/api/store/orders/[id]/ship` | POST | Ship order |
| `/api/store/orders/[id]/emi-installment` | PATCH | Mark one EMI installment paid (EMI/art-stickers session) |
| `/api/store/coupons` | GET, POST | Store coupons |
| `/api/store/coupons/[id]` | GET, PATCH, DELETE | Coupon CRUD — 2026-08-19: `validity`/`discount` now merged against the existing document rather than replaced wholesale on PATCH (a caller sending only `validity:{isActive:false}` would otherwise wipe `startDate`/`endDate`); `discount.value`/`minPurchase`/`maxDiscount` rounding for `fixed`-type coupons now mirrors create |
| `/api/store/grouped-listings/[id]` | GET, PATCH, DELETE | Seller-scoped grouped-listing CRUD (admin moderation lives at `/api/admin/grouped-listings/[id]`) — 2026-08-19: PATCH now coerces `productIds`/`minActiveMembers` and recomputes `activeMemberCount`, mirroring create's derivation (previously wrote uncoerced values and left the count stale) |
| `/api/store/sublisting-categories/[id]` | GET, PUT, DELETE | Sublisting category CRUD — 2026-08-19: PUT now recomputes `seo.title`/`seo.description` when `name`/`description` change, mirroring create's derivation (previously left page metadata frozen at creation-time values after every rename) |
| `/api/store/storefront` | GET, PUT | Storefront settings |
| `/api/store/shipping` | GET, PUT | Shipping settings (manual carrier/pickup only — Shiprocket removed) |
| `/api/store/payout-settings` | GET, PUT | Payout config |
| `/api/store/payouts` | GET | Payout history |
| `/api/store/payouts/[id]` | GET, PATCH | Single payout (ownership-scoped) — PATCH accepts only `sellerReminderFlag`; every other field is admin-managed via `/api/admin/payouts/[id]` |
| `/api/store/payouts/request` | POST | Request payout |
| `/api/store/reviews` | GET | Store reviews |
| `/api/store/reviews/[id]/reply` | POST | Reply to review |
| `/api/store/profile` | GET, PUT | Store profile |
| `/api/store/addresses` | GET, POST | Store addresses |
| `/api/store/addresses/[id]` | GET, PUT, DELETE | Address CRUD |
| `/api/store/slug/check` | GET | Slug availability |
| `/api/store/conversations` | GET | P-11 fix — seller-scoped conversation list; `useConversations` hook parametrized with `{endpoint, unreadField}` to reuse the same hook on the new `/store/messages` page as the existing buyer page |
| `/api/store/products/[id]/codes` | GET | 501 — digital-code reveal not implemented (was mistakenly a barcode-scan duplicate, now honest) |
| `/api/store/features` | GET, POST | Store features |
| `/api/store/features/[id]` | GET, PUT, DELETE | Feature CRUD |
| + ~30 more | — | WhatsApp, analytics, categories, extensions, etc. |

### User Routes (~36 endpoints)

| Route | Methods | Purpose |
|-------|---------|---------|
| `/api/user/profile` | GET, PUT | User profile |
| `/api/user/orders` | GET | User orders |
| `/api/user/orders/[id]` | GET | Order details |
| `/api/user/orders/[id]/cancel` | POST | Cancel order (full) or, with optional `itemIds: string[]` in the body, cancel selected line items only — marks `refundPending: true`, no auto-refund, falls through to full-order cancel when every item ends up selected |
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
| `/api/user/catalogue` | GET, POST | Feature B — list own catalogue items / create (any authed user/seller/admin); `ownerRole` resolved server-side via `isAdminUser`/`isSellerUser` |
| `/api/user/catalogue/[id]` | GET, PATCH, DELETE | Feature B — single item CRUD, ownership-checked; PATCH re-stamps `lastImageUpdateAt` only when `images` is part of the patch |
| `/api/user/catalogue/[id]/list` | POST | Feature B — direct list; seller → own store, admin → `store-letitrip-official` (no personal store) |
| `/api/user/catalogue/[id]/submit` | POST | Feature B — buyer "Request to sell", flips `listingStatus` to `pending_admin_approval` |
| `/api/user/tester-checklist` | GET | Active checklist items joined with the current tester's own responses (Tester Hub hydration); 403 unless `user.isTester === true` or `isAdminUser(user)` (2026-08-19) |
| `/api/user/tester-checklist/[checklistItemId]` | PUT | Upserts `{ answer?, comment?, screenshotUrl? }` for the current tester + item (deterministic-ID upsert — the persistence mechanism behind the Tester Hub) |
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
| `/api/catalogue/[ownerSlug]` | GET | Feature B — public catalogue items for one owner (`visibility:"public"` only, no auth) |
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
| `/api/orders/[id]/payment-proof` | POST | Buyer proof upload (`attachPaymentProofAction`); extended Tier PP (2026-08-18) with `buyerReportedUpiId`/`buyerMarkedPaid`/`buyerFraudAgreementAccepted` |
| `/api/orders/[id]/dispute` | POST | Tier PP (2026-08-18) — `raiseOrderDisputeAction`, buyer/seller/admin, only valid on `autoApproved` orders |
| `/api/orders/[id]/code` | GET | Digital-code order reveal |
| `/api/orders/[id]/invoice` | GET | Order invoice PDF |
| `/api/orders/[id]/refund` | POST | Buyer-initiated refund request |
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
| admin-permissions.ts | PERMISSION_GROUPS, PERMISSION_DOMAINS, getPermissionsForDomain, formatPermLabel | Display data for `/admin/permissions` reference page. **Temporary mirror** — verbatim copy of the same exports newly added in `appkit/src/features/auth/permissions/constants.ts` (S-ADMIN-7, 2026-08-19); duplicated here only because this repo currently pins `@mohasinac/appkit` from the npm registry (`^4.1.1`), not `file:./appkit`, so the new appkit exports aren't resolvable yet. Delete this file and import directly once appkit is republished. |
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
| orders/payment-window.ts | PAYMENT_WINDOW_MINUTES (15), PAYMENT_WINDOW_MS, PAYMENT_WINDOW_EXPIRED_REASON, PAYMENT_FRAUD_REJECTED_REASON | Tier PP (2026-08-18) — shared by checkout order creation, buyer countdown UI, and the `paymentWindowTimeout` sweep so they never drift |

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
| PayoutDocument | payouts | payments/schemas/firestore.ts (has `transactionId?`, `sellerReminderFlag?` — added 2026-08-19; path corrected, was previously listed as seller/schemas/firestore.ts) |
| AddressDocument | addresses | addresses/schemas/firestore.ts |
| ConversationDocument | conversations | messages/schemas/firestore.ts |
| CarouselSlideDocument | carouselSlides | homepage/schemas/firestore.ts |
| HomepageSectionDocument | homepageSections | homepage/schemas/firestore.ts |
| SiteSettingsDocument | siteSettings | admin/schemas/firestore.ts |
| WishlistDocument | wishlists | wishlist/schemas/ |
| HistoryDocument | history | history/schemas/ |
| ScammerDocument | scammers | scams/schemas/firestore.ts |
| SupportTicketDocument | supportTickets | support/schemas/firestore.ts |
| JobDocument | jobs | jobs/schemas/firestore.ts — async job primitive (2026-08-15); `jobType`/`status`/`payload`/`result`/`error` |
| TesterChecklistItemDocument | testerChecklistItems | tester/schemas/firestore.ts — admin-managed QA test-case catalog (2026-08-17); `groupKey`/`pageKey`/`label`/`href`/`order`/`isActive`/`searchTokens`/`adminOnly?: boolean` (2026-08-19 — gates admin-area cases to `canTestAdmin` testers/admins). Bug-hunter rewards (2026-08-19): `bugConfirmed?/bugHunterId?/bugHunterName?/bugConfirmedAt?` (set once by `confirmBug()`, permanent — never touched by reopen) + `version?/previousVersionId?/supersededByItemId?` (retest lifecycle via `reopenAsNewVersion()`) |
| BugHunterLeaderboardEntry | — | tester/schemas/firestore.ts — `{rank, hunterId, hunterName, bugCount}`, returned by `getBugHunterLeaderboard()` (2026-08-19) |
| TesterChecklistResponseDocument | testerChecklistResponses | tester/schemas/firestore.ts — one doc per (tester, case), deterministic ID `${testerId}__${checklistItemId}`; `answer: "yes"\|"no"\|null`, `comment?`, `screenshotUrl?`, `status: "new"\|"reviewed"` |

**2026-08-17**: `isTester?: boolean` added to `UserDocument` (account/schemas/firestore.ts) — orthogonal to `role`, unlocks the Tester Hub + auto-approves the user's store. `isTestData?: boolean` + `testDataExpiresAt?: Date` added to `StoreDocument`, `CategoryDocument`, `ProductDocument`, `BlogPostDocument`, `EventDocument` for the tester sandbox (swept by `testerSandboxCleanup`).

**2026-08-19**: `canTestAdmin?: boolean` added to `UserDocument` (auth/schemas/firestore.ts) — orthogonal to `isTester`, unlocks admin-only checklist items in the Tester Hub AND real `/admin/**` RBAC access without changing `role`; meaningless unless `isTester` is also true. Separately, real `isAdminUser(user)` accounts now bypass the `isTester` gate outright (not via this flag) in `TesterHubView`, `getUserNavGroups`, and both `/api/user/tester-checklist*` routes — an admin never needs `isTester`/`canTestAdmin` set to reach the Tester Hub. `EVENT_FIELDS.SLUG` added to `events/schemas/firestore.ts`; `getPublicEventById`/`getEventLeaderboard`/`enterEvent` (events/actions/event-actions.ts) now resolve by `findByIdOrSlug` so public event URLs can link by slug.

**2026-08-19 (follow-up — RBAC mechanism for `canTestAdmin`)**: `isEffectiveAdminUser(input)` added to `features/auth/role-predicates.ts`, exported from both `index.ts` and `client.ts` alongside `isAdminUser`/`isSellerUser`/etc. — `isAdminUser(input) || Boolean(input?.isTester && input?.canTestAdmin)`. This is the actual bypass used at the two RBAC chokepoints: `next/api/routeHandler.ts` (`createRouteHandler`) — when the plain JWT-role check fails and `"admin"` is in `effectiveRoles`, one live `userRepository.findById(uid)` lookup resolves `isTester`/`canTestAdmin` (never present in session-cookie claims — only `role` is) and, on success, merges them onto the in-memory `RouteUser` before calling the handler; the `options.permission` bypass (`!isAdminUser(user)`) was changed to `!isEffectiveAdminUser(user)` using the same enriched user — and `_internal/server/features/auth/permissions.ts` (`makeAdminSectionLayout`) — `if (user.role === "admin")` became `if (isEffectiveAdminUser(user))`, and `GetUser`'s return shape widened to include `isTester?`/`canTestAdmin?`. `src/lib/firebase/auth-server.ts`'s `getServerSessionUser()` (the RSC `SessionUser` builder every `makeAdminSectionLayout` call uses as `getUser`) now returns `isTester`/`canTestAdmin` — previously omitted even though it already did a live Firestore read. Bug fixed alongside: `src/app/api/user/tester-checklist/route.ts` (GET) and `.../[checklistItemId]/route.ts` (PUT) previously read `user!.isTester` off the JWT-derived `RouteUser`, which is never populated (only `role` is baked into session-cookie claims) — real testers were silently 403ing. Both routes now do their own live `userRepository.findById(user!.uid)` lookup and filter out `adminOnly: true` checklist items unless `isEffectiveAdminUser(profile)`. New seed exports from `features/tester/seed-data/` (all re-exported via `seed/index.ts` and merged in `appkit/scripts/seed-cli.mjs`): `couponsTesterSeedData` (3 disposable coupons — perUserLimit:1, pre-expired, seller-scope), `bidsTesterSeedData` (1 winning bid on a dedicated already-ended `auction-tester-sandbox-won`, kept separate from the still-biddable `auction-tester-sandbox-1`), `ordersTesterSeedData` (14 orders — one per `OrderStatus` value plus auction-win/bundle/prize-draw-win/prize-draw-lose order types, plus a 5-item "order-tester-sandbox-multi-item" fixture added 2026-08-19 to exercise the My Orders / dashboard Recent Orders item-summary + "+N more" badge UI). `products-prize-draws-seed-data.ts` / `products-classifieds-seed-data.ts` / `products-digital-codes-seed-data.ts` (`appkit/src/seed/`) — previously empty stubs never wired into `seed-cli.mjs`'s write path — now each hold one real Beyblade-themed listing and are merged into `SEED_DATA_MAP.products` in `seed-cli.mjs` (`products-live-items-seed-data.ts` deliberately stays empty — `listingType:"live"` is animal/plant-specific, inapplicable to this catalog). `orders-seed-data.ts`'s `statuses` rotation gained `"confirmed"`/`"returned"` (previously only 7 of 9 `OrderStatus` values were ever seeded). Admin UI: `AdminUserEditorView` gained a "Can Test Admin Areas" toggle under "Is Tester" (hidden unless Is Tester is on); the checklist item editor (`AdminTesterChecklistItemEditorView`) gained an "Admin-only" toggle; `src/app/api/admin/tester-checklist-items/route.ts` + `[id]/route.ts` Zod schemas gained `adminOnly`. Navigation: `getUserNavGroups` (`src/constants/navigation.tsx`) gained a 4th `canTestAdmin` param — when true, injects an "Admin Dashboard (Testing)" link into the Help nav group alongside the existing `isTester`-gated "Tester Hub" link.

**2026-08-19 (bug-hunter rewards + public leaderboard)**: Admin can now confirm a tester-reported "No" answer as a real bug from the existing `/admin/tester-feedback` → Main Issues tab (`AdminTesterFeedbackIssuesView`) or the All Submissions tab (`AdminTesterFeedbackListView`) — `POST /api/admin/tester-feedback/[id]/confirm-bug` credits the reporting tester (`bugHunterId`/`bugHunterName` on the checklist item) and disables the case (`isActive:false`) for every other tester. Once the underlying bug is fixed, `POST /api/admin/tester-checklist-items/[id]/reopen` (row action on `AdminTesterChecklistView`, also surfaced next to the confirmed badge in the Issues tab) clones the disabled item into a new active `version+1` doc for retest — the old doc stays disabled forever with its credit intact, so `getBugHunterLeaderboard()`'s tally never changes retroactively. `AdminTesterChecklistView`'s Status filter now defaults to "Active" (via a new `filterDefaults` option on `useAdminListing`/`AdminListingConfig`, `appkit/src/features/admin/hooks/useAdminListing.ts`) so bug-confirmed/reopened-away cases don't clutter the catalog by default; a new "Bug status" filter chip surfaces them on demand. New public route `ROUTES.PUBLIC.BUG_HUNTERS = "/bug-hunters"` (`src/app/[locale]/bug-hunters/page.tsx`, footer-linked under "Support") renders `BugHunterLeaderboardView` fed by the new server action `getBugHunterLeaderboard(limit?)` (`appkit/src/features/tester/actions/leaderboard-actions.ts`). New action-registry entries `ACTIONS.ADMIN["confirm-bug"]` / `ACTIONS.ADMIN["reopen-checklist-item"]` and endpoints `ADMIN_ENDPOINTS.TESTER_FEEDBACK_CONFIRM_BUG(id)` / `TESTER_CHECKLIST_ITEM_REOPEN(id)`. **Seed-data follow-up (same day)**: `tester-checklist-seed-data.ts` gained a new "Bug Hunter Rewards" page under the `admin` group (`confirm-bug`, `confirm-bug-idempotent`, `reopen-case`, `catalog-default-active-filter` — all `adminOnly:true`) and a new "Bug Hunters Leaderboard" page under `public-pages` (`leaderboard-loads`, `leaderboard-empty-state`, `leaderboard-footer-link`), plus a standalone demo fixture pair added directly to `rawTesterChecklistItems` (outside `group()`, since `bugConfirmed`/`bugHunterId`/`version`/`previousVersionId`/`supersededByItemId` aren't part of `CaseInput`): `checklist-admin-bug-hunter-rewards-demo-fixture` (v1, disabled, `bugConfirmed:true`, credited to seeded tester `user-tester-qa` / "Mock User 18") and `checklist-admin-bug-hunter-rewards-demo-fixture-v2` (v2, active, `previousVersionId` pointing back to v1) — so a fresh reseed shows a working example of the confirm→disable→reopen lifecycle and a non-empty `/bug-hunters` leaderboard without needing a live tester to exercise the flow first. Catalog total: 345 → 354 items. Reseeded via `npx appkit-seed load --collections testerChecklistItems` (354/354 confirmed via `status`).

**2026-08-19 (user dashboard public-profile access + order-row summary)**: Three new "View public profile" entry points, all linking to `ROUTES.PUBLIC.PROFILE(uid)`: the `/user` dashboard header (next to "View / edit profile →"), a "My Public Profile" tile prepended to the dashboard's quick-links `NAV_LINKS` grid, and a "View Public Profile" link on `/user/profile` (`ProfilePageClient.tsx`, next to "Manage Addresses"). Order rows (`appkit/src/features/orders/components/OrdersList.tsx`'s `OrderCard` — already showed item thumbnails/title/qty + a "+N more" badge, order id was already de-emphasized) gained an explicit "View Details" CTA via a new `ACTIONS.USER["view-order"]` entry (`action-registry.ts`, label "View Details", `kind: "ghost"`) — wired into both `/user/orders`' `renderActions` and the dashboard's Recent Orders widget, which previously passed neither `onOrderClick` nor `renderActions` (rows were non-interactive there). **Bug found + fixed while testing this**: `couponsTesterSeedData`/`bidsTesterSeedData`/`ordersTesterSeedData` (Tester QA sandbox fixtures, `features/tester/seed-data/`) were re-exported from `seed/index.ts` but never from the top-level `appkit/src/index.ts` barrel — unlike their siblings `storesTesterSeedData`/`categoriesTesterSeedData`/`productsTesterSeedData`/`blogTesterSeedData`/`eventsTesterSeedData`, which were. Since `seed-cli.mjs` destructures all seed data from one `import("@mohasinac/appkit")`, this meant the tester-sandbox orders/bids/coupons fixtures had silently never been written to Firestore on any prior `load` (`ordersTesterSeedData` always resolved `undefined` → `[]` in `orders: [...ordersSeedData, ...ordersTesterSeedData]`). Fixed by adding the 3 missing `export { X } from "./seed/index"` lines to `index.ts`. Confirmed via `npx appkit-seed status`: before the fix, `orders` reported seed=50 (only the main catalog); after, seed=64 (50 + all 14 tester fixtures), matching `db` post-reseed. New tester checklist cases (`tester-checklist-seed-data.ts`): `own-public-profile-quick-links` (account-auth → profile-settings) and a new `my-orders` page (buying group) with `orders-item-summary`, `orders-view-details-button`, `dashboard-recent-orders-linked`.

**2026-08-19 (checkout addons follow-up)**: `OrderDocument` (orders/schemas/firestore.ts) gains `giftWrapAddon?: boolean`, `giftWrapFee?: number`, `giftWrapMessage?: string` (free-text, capped, surfaces on `SellerOrdersView` as a "🎁 Gift wrap requested" note), `shipmentProtectionAddon?: boolean`, `shipmentProtectionFee?: number` — same shape as the prior session's `whatsappNotifyAddon?`/`whatsappNotifyFee?`. `SiteSettingsDocument.commissions` (admin/schemas/firestore.ts) gains `giftWrapFeeEnabled`, `giftWrapFee` (default ~₹49), `shipmentProtectionFeeEnabled`, `shipmentProtectionFeePercent` (default ~2%), `shipmentProtectionFeeMin` (default ~₹30). See § Fee Calculators in `appkit/index.md` for `computeGiftWrapFee`/`computeShipmentProtectionFee`. `NotificationDocument` (account/schemas/firestore.ts) gains `whatsappStatus?`/`whatsappJobId?`. `AnalyticsRollupDocument` (new, admin/repository/analytics-rollup.repository.ts) — singleton doc `analytics/dashboardRollup`, `{totalRevenue, deliveredOrderCount, updatedAt}`, written by the `revenueRollup` scheduled Function (§20 Firebase Jobs).

**2026-08-18 (Tier PP)**: `OrderDocument` (orders/schemas/firestore.ts) gains — `paymentDeadline?: Date` (15-min window, `upi_manual`/`cash`/`emi` only), `displayedUpiId?: string` (server-resolved once at order creation), `buyerReportedUpiId?: string`, `paymentUpiMismatch?: boolean`, `buyerMarkedPaid?: boolean` + `buyerMarkedPaidAt?: Date`, `buyerFraudAgreementAccepted?: boolean` + `buyerFraudAgreementAcceptedAt?: Date`, `paymentReviewOutcome?: "approved"\|"reupload_requested"\|"rejected_fraud"`, `paymentReviewNote?/paymentReviewedBy?/paymentReviewedAt?`, `stockRestored?: boolean` + `stockRestoredAt?: Date`, `autoApproved?: boolean` + `autoApprovedAt?: Date`, `disputeRaised?/disputeRaisedBy?/disputeRaisedAt?/disputeReason?`, `disputeStatus?: "open"\|"resolved"`; new `cancellationReason` values `"payment_window_expired"` / `"payment_fraud_rejected"`. `OrderDocumentItem` gains `bundleCategorySlug?`/`bundleProductIds?`. `UserDocument` (auth/schemas/firestore.ts) gains `isDisabled?: boolean`, `hardBanExpiresAt?: Date | null` (null/absent = permanent), `hardBanFraudOrderId?: string`, `hardBanReinstatedAt?: Date`. `SiteSettingsDocument.payment` (admin/schemas/firestore.ts) gains `otpCheckoutThreshold?: number` (default ₹5,000). `NotificationType` union gains `"payment_review"`.

**2026-08-15**: `OrderDocument` gained `outOfStockPolicy?: "cancel_order" \| "skip_items"`, `droppedItems?: {productId, productTitle, requestedQty, availableQty}[]`, and `refundPending?: boolean` (orders/schemas/firestore.ts). New `OutOfStockPolicyValues` const alongside the existing `PaymentMethodValues`/`OrderStatusValues` pattern.

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
| number.formatter.ts | formatCurrency, formatNumber, parseNumber, roundRupees | Number formatting (₹ support); roundRupees(amount) rounds decimal-rupee math to 2dp |
| object.helper.ts | deepMerge, pick, omit, mapValues | Object utilities |
| pagination.helper.ts | calculatePages, getPageRange, paginate | Pagination math |
| schema-ui.ts | getFieldLabel, getErrorMessage | Schema metadata extraction |
| search-tokens.ts | tokenizeSearch, matchToken | Search tokenization |
| sorting.helper.ts | compareFn, naturalSort | Sorting utilities |
| string.formatter.ts | slugify, capitalize, truncate, sanitize | String utilities |
| type.converter.ts | toRecord, toArray, isRecord | Type coercion helpers |
| action-response.ts | ActionResponse, success, error | Server action response wrapper |
| animation.helper.ts | Animation constants & helpers | Animation token utilities |

### `appkit/src/security/` (server.ts + index.ts split — see note below)

| File | Key Exports | Purpose | Barrel |
|------|-------------|---------|--------|
| pii-encrypt.ts | encryptValue, decryptValue, hmacBlindIndex, encryptPiiFields, decryptPiiFields, encryptPii, decryptPii, piiBlindIndex, addPiiIndices, getPiiConfigError, encrypt/decryptShippingAddress, encrypt/decryptPayoutDetails, encrypt/decryptShippingConfig, encrypt/decryptPayoutBankAccount | AES-256-GCM + HMAC-SHA256 PII encryption (Node `crypto`) | `server.ts` only |
| pii-mask.ts *(new, 3.8.2)* | ENC_PREFIX, HMAC_PREFIX, isPiiEncrypted, maskName, maskEmail, maskPublicReview, maskPublicBid, maskPublicEventEntry, maskOfferForSeller | Crypto-free display-masking helpers (pure string ops) | `index.ts` (universal) + `server.ts` |
| pii-redact.ts | redactPii, safeDisplayName, safeDisplayEmail, maskIp | Log/error redaction | `index.ts` + `server.ts` |
| authorization.ts | requireAuth, requireRole, requireOwnership, canChangeRole, getRoleLevel | RBAC guard functions | `index.ts` + `server.ts` |
| rate-limit.ts | rateLimit, applyRateLimit, RateLimitPresets | Request rate limiting | `index.ts` + `server.ts` |
| rbac.ts | DEFAULT_ROLES, resolvePermissions, hasPermission, Can, createRbacHook | Permission resolution | `index.ts` + `server.ts` |
| settings-encryption.ts | encryptSecret, decryptSecret, maskSecret | Site-settings API-key encryption (no Node builtin) | `index.ts` + `server.ts` |

> **pii-encrypt.ts / pii-mask.ts split (2026-08-17, appkit 3.8.2):** `pii-encrypt.ts` calls Node's
> `crypto` via a bare, non-static `require("crypto")` inside a function body — deliberately not a
> top-level `import`, because Turbopack resolves a module's full static import graph before any
> tree-shaking pass and hard-fails the browser build on any unresolvable Node builtin, even for a
> symbol nothing client-side actually uses. The 6 display-masking helpers (`maskName` etc.) are
> genuinely needed client-side (`ReviewModal`/`ReviewDetailShell`/`ReviewsList`, all `"use client"`)
> and have zero crypto dependency, so they live in the separate `pii-mask.ts` file instead — see
> `asciiDiagrams.md` → "Architecture > PII Encryption vs Display Masking" for the full incident
> writeup, and CLAUDE.md Root Cause Pattern #24.

---

## 13. Registries

| Registry | File | Entries | Purpose |
|----------|------|---------|---------|
| ACTIONS | _internal/shared/actions/action-registry.ts | 23 resource buckets | Master CTA registry — labels, permissions, confirmation, icons |
| ACTION_META | features/products/constants/action-defs.ts | Tier 1 public CTAs | Primary action metadata |
| ROW_ACTION_META | features/products/constants/action-defs.ts | Tier 2 row/table actions | Row action metadata |
| FORM_ACTION_META | features/products/constants/action-defs.ts | Tier 3 form footers | Form footer actions |
| DASHBOARD_QUICK_ACTION_META | features/products/constants/action-defs.ts | Tier 4 dashboard shortcuts (42 IDs: 22 admin / 13 seller / 7 user, extended 2026-08-19) | Quick action metadata — consumed by `admin/dashboard/page.tsx`, `store/page.tsx`, `user/page.tsx` via `DASHBOARD_QUICK_ACTIONS.<role>` with RBAC filtering (was dead config before 2026-08-19, each dashboard hand-rolled its own array) |
| ADMIN_BULK_ACTIONS | features/products/constants/action-defs.ts | Preset array | Admin bulk action set |
| SELLER_BULK_ACTIONS | features/products/constants/action-defs.ts | Preset array | Seller bulk action set |
| LISTING_BULK_ACTIONS | features/products/constants/action-defs.ts | Preset array | Listing bulk action set |
| ADMIN_ROW_ACTIONS | features/products/constants/action-defs.ts | Preset array | Admin row action set |
| SELLER_ROW_ACTIONS | features/products/constants/action-defs.ts | Preset array | Seller row action set |
| USER_ROW_ACTIONS | features/products/constants/action-defs.ts | Preset array | User row action set |
| SCAM_TYPES | features/scams/constants/scam-types.ts | 27 scam types | Scam pattern registry |
| FEATURE_FLAG_META | admin/schemas/firestore.ts | 12 entries | Generic metadata (`{key, label, description}`) per `siteSettings.featureFlags.*` boolean — wired into `AdminSiteSettingsView`'s Feature Flags tab 2026-08-19 (previously defined but zero consumers) |

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
| catalogue | firestore.ts, validation.ts, index.ts | Feature B — `CatalogueItemDocument` + create/update Zod schemas |
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
| shipments | firestore.ts, validation.ts, index.ts | Feature A — `ShipmentDocument`/`ShipmentLot`/`ShipmentItem` + bulk-import Zod schema (≤500 rows) |
| store-extensions | firestore.ts, index.ts, rbac.ts | Store feature schemas & RBAC rules |
| stores | firestore.ts, index.ts | Store document schemas |
| support | firestore.ts, index.ts | Support ticket document schemas |
| wishlist | index.ts | Wishlist document schemas |
| tester | firestore.ts, index.ts | Tester QA program (2026-08-17) — `TesterChecklistItemDocument` (catalog) + `TesterChecklistResponseDocument` (per-tester answers) |

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
| grouped-listings-seed-data.ts | groupedListings | Theme-group scrollers (`GroupedListingDocument`: productIds[]/groupTheme/minActiveMembers, SB-UNI-V) — NOT a pricing bundle; pricing bundles live on `categories` (`categoryType:"bundle"`, SB-UNI-D). Rewritten 2026-08-19 off a stale pre-SB-UNI-V shape. |
| payouts-seed-data.ts | payouts | Seller payouts |
| scammers-seed-data.ts | scammers | Reported scammer profiles |
| support-tickets-seed-data.ts | supportTickets | Support ticket examples |
| product-features-seed-data.ts | productFeatures | Dynamic feature flags |
| offers-seed-data.ts | offers | Promotion offers |
| features/tester/seed-data/tester-checklist-seed-data.ts | testerChecklistItems | 354 default tester QA test cases (admins add more via `/admin/tester-checklist`); deliberately isolated outside `appkit/src/seed/`. 2026-08-19: expanded from ~55 to ~308 across two passes — dashboard collapsible sections, mobile table/card view, seller payouts detail panel, footer dark-mode, FAQ borders/tabs-dropdown, the Tester Hub itself, then a much deeper sweep of checkout/wishlist/cart/history/dashboard-nav edge cases. 308 → 354 (same day, bug-hunter rewards follow-up): new "Bug Hunter Rewards" (admin) and "Bug Hunters Leaderboard" (public-pages) pages, plus a demo fixture pair exercising `bugConfirmed`/`version`/`previousVersionId`/`supersededByItemId` directly (outside `group()`). Some cases carry `adminOnly: true` (only visible to admins/`canTestAdmin` testers). |
| features/tester/seed-data/{stores,categories,products,blog,events}-tester-seed-data.ts | stores, categories, products, blogPosts, events | Shared 7-day auto-expiring tester sandbox — 1 store, 3 plain categories + 1 brand + 1 bundle, 4 products (standard×2/auction/pre-order), 1 blog post, 1 spin-wheel+raffle event; every doc tagged `isTestData: true` + `testDataExpiresAt` (recomputed on each seed run) |
| store-extensions-seed-data.ts | storeExtensions + 11 sub-collections | Store feature extensions |
| shipments-seed-data.ts | procurementShipments | Feature A — sample shipments across statuses |
| shipment-lots-seed-data.ts | shipmentLots | Feature A — lots per shipment (incl. one remainder-only lot) |
| shipment-items-seed-data.ts | shipmentItems | Feature A — main items per lot (self-use + pre-linked examples), totals pre-computed via `allocateShipmentCosts()` at seed-build time |
| catalogue-seed-data.ts | catalogueItems | Feature B — 6 items spanning every `listingStatus` value |
| manifest.ts | — | Seed manifest index (metadata only) |
| runner.ts | — | Seed execution orchestrator |

---

## 16. Page Shims

All pages are thin shims delegating to appkit `_internal/server/features/*/` helpers.

| Domain | Count | Examples |
|--------|-------|---------|
| Admin | ~113 | /admin/products, /admin/orders, /admin/orders/[id]/view (reuses AdminOrderEditorView full-page, 2026-08-19), /admin/users, /admin/categories, /admin/blog, /admin/reviews, /admin/coupons, /admin/carousel, /admin/sections, /admin/events, /admin/payouts, /admin/team, /admin/support, /admin/scammers, /admin/scammers/[id] (reuses AdminScammerEditorView full-page, 2026-08-19), /admin/support-tickets/[id] (reuses AdminSupportTicketDetailView full-page, 2026-08-19), /admin/moderation/[id], /admin/reports/[id], /admin/item-requests/[id] (2026-08-19 — new RSC detail pages, no prior detail UI), /admin/permissions (2026-08-19 — read-only permission catalog, sourced from `src/constants/admin-permissions.ts` mirror pending appkit republish), /admin/art, /admin/stickers, /admin/addresses, /admin/shipments (+ new/[id]/edit/[id]/lots/[lotId]/items/projections — Feature A), /admin/catalogue-approvals (Feature B), /admin/tester-checklist, /admin/tester-feedback (2026-08-17), /admin/grouped-listings (2026-08-19), /admin/integration-guides (2026-08-19 — reads `docs/integration-guides/*.md`, converts via `marked`, renders through `<RichTextRenderer>`; gated `admin:site:read`) |
| Store | ~74 | /store/products, /store/orders, /store/coupons, /store/analytics, /store/payouts, /store/reviews, /store/features, /store/shipping, /store/art, /store/stickers, /store/messages (P-11 fix), /store/bundles/new + [id]/edit (P-17 fix, was wired to a dead endpoint) — /store/templates* and /store/inventory/print removed 2026-08-19 |
| User | ~33 | /user/orders, /user/profile, /user/wishlist, /user/addresses, /user/history, /user/conversations, /user/notifications, /user/catalogue (+ new/[id]/edit — Feature B), /user/tester (2026-08-17) |
| Public | ~107 | /products/[id], /categories, /blog, /events, /auctions, /stores, /about, /contact, /faqs, /seller, /cart, /checkout, /profile/[userId]/[tab] (Feature B public catalogue tab) |
| **Total** | **~322** | |

### RSC + thin client-wrapper pattern (applied 2026-06-24)

Editor and list pages that previously used `"use client"` only for `useRouter` callbacks are now split into:
- **`page.tsx`** — async RSC, no `"use client"`. Awaits `params`, passes `id` as a serializable string prop.
- **`*-client.tsx`** — `"use client"` wrapper owning `useRouter` and any navigation/mutation callbacks.

Affected files (21 client wrappers created):

| Client wrapper | RSC page |
|---|---|
| `admin/blog/[id]/edit/blog-edit-client.tsx` | `admin/blog/[id]/edit/page.tsx` |
| `admin/blog/new/blog-new-client.tsx` | `admin/blog/new/page.tsx` |
| `admin/bundles/[id]/edit/bundle-edit-client.tsx` | `admin/bundles/[id]/edit/page.tsx` |
| `admin/bundles/new/bundle-new-client.tsx` | `admin/bundles/new/page.tsx` |
| `admin/carousel/[id]/edit/carousel-edit-client.tsx` | `admin/carousel/[id]/edit/page.tsx` |
| `admin/carousel/new/carousel-new-client.tsx` | `admin/carousel/new/page.tsx` |
| `admin/categories/[id]/edit/category-edit-client.tsx` | `admin/categories/[id]/edit/page.tsx` |
| `admin/categories/new/category-new-client.tsx` | `admin/categories/new/page.tsx` |
| `admin/coupons/[id]/edit/coupon-edit-client.tsx` | `admin/coupons/[id]/edit/page.tsx` |
| `admin/coupons/new/coupon-new-client.tsx` | `admin/coupons/new/page.tsx` |
| `admin/faqs/[id]/edit/faq-edit-client.tsx` | `admin/faqs/[id]/edit/page.tsx` |
| `admin/faqs/new/faq-new-client.tsx` | `admin/faqs/new/page.tsx` |
| `admin/products/[id]/edit/product-edit-client.tsx` | `admin/products/[id]/edit/page.tsx` |
| `admin/products/new/product-new-client.tsx` | `admin/products/new/page.tsx` |
| `admin/sublisting-categories/[id]/edit/sublisting-category-edit-client.tsx` | `admin/sublisting-categories/[id]/edit/page.tsx` |
| `admin/sublisting-categories/new/sublisting-category-new-client.tsx` | `admin/sublisting-categories/new/page.tsx` |
| `report/report-form-client.tsx` | `report/page.tsx` (reads searchParams as RSC prop) |
| `store/coupons/seller-coupons-client.tsx` | `store/coupons/page.tsx` |
| `store/coupons/new/coupon-new-client.tsx` | `store/coupons/new/page.tsx` |
| `store/products/seller-products-client.tsx` | `store/products/page.tsx` |
| `store/grouped-listings/grouped-listings-client.tsx` | `store/grouped-listings/page.tsx` |

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
| ROUTES.PUBLIC | PRODUCTS, PRODUCT(id), AUCTIONS, STORES, STORE(slug), BLOG, EVENTS, FAQS, CART, CHECKOUT, SEARCH, PROFILE(userId) — `/profile/[userId]`, tabbed via `/profile/[userId]/[tab]`; Feature B renders `PublicCatalogueView` at `tab === "catalogue"` | Public page routes |
| ROUTES.ADMIN | DASHBOARD, PRODUCTS, ORDERS, USERS, STORES, CATEGORIES, BRANDS, BLOG, EVENTS, PAYOUTS, SETTINGS, SHIPMENTS / SHIPMENTS_NEW / SHIPMENTS_EDIT(id) / SHIPMENT_LOT_ITEMS(id, lotId) / SHIPMENTS_PROJECTIONS (Feature A), CATALOGUE_APPROVALS (Feature B), TESTER_CHECKLIST / TESTER_FEEDBACK (2026-08-17) | Admin dashboard routes |
| ROUTES.STORE | DASHBOARD, PRODUCTS, ORDERS, COUPONS, ANALYTICS, PAYOUTS, REVIEWS, SHIPPING, TEMPLATES | Store dashboard routes |
| ROUTES.USER | ORDERS, ORDER_DETAIL(id), PROFILE, WISHLIST, ADDRESSES, HISTORY, NOTIFICATIONS, CONVERSATIONS, CATALOGUE / CATALOGUE_NEW / CATALOGUE_EDIT(id) (Feature B), TESTER_HUB (2026-08-17) | User dashboard routes |
| ROUTES.AUTH | LOGIN, REGISTER, FORGOT_PASSWORD, RESET_PASSWORD, VERIFY_EMAIL | Auth routes |

---

## 20. Firebase Jobs

Firebase Functions are declared once in the appkit registry (single source of truth) and bound from [functions/src/index.ts](functions/src/index.ts). Consumer extensions live in [functions/src/consumer-functions.ts](functions/src/consumer-functions.ts) (empty by default).

Registry sources:
- [appkit/src/_internal/server/functions/scheduled.ts](appkit/src/_internal/server/functions/scheduled.ts) — `SCHEDULED_FUNCTIONS` (27 entries, incl. `testerSandboxCleanup` — daily 05:00 UTC, deletes expired tester QA sandbox data, cascading into bids on deleted test auctions; 3 Tier PP entries 2026-08-18; `revenueRollup` 2026-08-19, see below). 27 registered Scheduler jobs (~$2.40/month, Cloud Scheduler's free tier is only 3 jobs/billing account) is a documented, accepted cost — see "Firebase Functions & Firestore Budget" in CLAUDE.md — not something to "fix" by consolidating.
- [appkit/src/_internal/server/functions/firestore.ts](appkit/src/_internal/server/functions/firestore.ts) — `FIRESTORE_TRIGGER_FUNCTIONS` (18 entries)
- [appkit/src/_internal/server/functions/https.ts](appkit/src/_internal/server/functions/https.ts) — `HTTPS_FUNCTIONS` (7 entries)
- Aggregated in [appkit/src/_internal/server/functions/manifest.ts](appkit/src/_internal/server/functions/manifest.ts) as `APPKIT_FUNCTIONS`

All functions deploy to region `asia-south1`. HTTPS functions require `LETITRIP_INTERNAL_SECRET` env var (enforced by `audit-functions-registry-completeness.mjs`).

### Scheduled (27 functions)

| Function | Cron | Purpose |
|----------|------|---------|
| revenueRollup | daily 01:30 UTC | 2026-08-19 — pre-aggregates `{totalRevenue, deliveredOrderCount}` into the `analytics/dashboardRollup` singleton doc (`analyticsRollupRepository`), so `GET /api/admin/dashboard` reads one doc instead of scanning every `delivered` order |
| auctionSettlement | every 15 minutes (UTC) | Settle expired auctions + notify winners |
| pendingOrderTimeout | every 2 hours | Cancel pending COD orders past timeout (skips any order with `paymentDeadline` set — that's `paymentWindowTimeout`'s domain — and now calls `restoreStockForOrder()`, Tier PP 2026-08-18) |
| paymentWindowTimeout | every 5 minutes | Tier PP (2026-08-18) — transactionally cancel manual/cash/EMI orders whose 15-min `paymentDeadline` passed with no proof uploaded; `restoreStockForOrder()` |
| hardBanReinstatement | every 15 minutes | Tier PP (2026-08-18) — re-enable Firebase Auth login + clear `isDisabled` for accounts whose `hardBanExpiresAt` has passed (narrow scope — doesn't reverse store suspension or linked-account bans) |
| paymentReviewAutoApprove | every 15 minutes | Tier PP (2026-08-18) — 2-hour safety net: auto-confirms an unreviewed manual-payment proof, same effect as `adminVerifyPaymentAction` plus `autoApproved`/`autoApprovedAt` |
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
| prizeDrawExpiryReveal | every 5 minutes | Scheduled-mode prize draws: assign winners for outstanding paid orders past `prizeRevealWindowEnd`, then close (renamed/repurposed from `prizeRevealClose` 2026-08-19; `prizeRevealOpen`/`prizeRevealExpiry`/`prizeRevealReminder` retired — reveal is now fully automatic, no buyer-claim-deadline mechanic) |
| bundleStockSync | daily 10:05 IST | Flip bundle isSold when any item runs OOS; also refreshes `bundleOriginalTotal` (sum of member prices) so the discount badge stays accurate as member prices change |
| catalogueImageStalenessReminder | daily 07:00 IST | Feature B — remind catalogue owners whose photos near the 30-day freshness cutoff |

### Firestore Triggers (21 functions)

| Function | Trigger | Purpose |
|----------|---------|---------|
| onBidPlaced | documentCreated `bids/{bidId}` | Bid creation side-effects (notifications, outbid emails) |
| onOrderCreate | documentCreated `orders/{orderId}` | Notify store + decrement stock |
| onOrderStatusChange | documentUpdated `orders/{orderId}` | Status transition notifications + returns |
| onProductWrite | documentWritten `products/{productId}` | Search index + stats + audits |
| onProductStockChange | documentWritten `products/{productId}` | Recompute bundleStockStatus + groupedListing activeMemberCount |
| onPrizeDrawPaymentConfirmed | documentUpdated `orders/{orderId}` | Instant-mode prize-draw winner assignment the moment an order's payment is confirmed (2026-08-19) |
| prizeDrawSoldOutReveal | documentWritten `products/{productId}` | Scheduled-mode prize draws: assign winners for all outstanding orders the instant a draw sells out, then close (2026-08-19) |
| onReviewWrite | documentWritten `reviews/{reviewId}` | Recompute product + store rating aggregates |
| onCategoryWrite | documentWritten `categories/{categoryId}` | Path materialization + slug indexes |
| onStoreWrite | documentWritten `stores/{storeId}` | Status mirror + owner uid index |
| onSupportTicketCreate | documentCreated `supportTickets/{ticketId}` | Confirm to reporter + queue routing |
| onSupportTicketUpdate | documentUpdated `supportTickets/{ticketId}` | Notify reporter on status change |
| onUserBanChange | documentUpdated `users/{uid}` | Append ban-history audit entries |
| onScamReportCreate | documentCreated `scammerProfiles/{scammerId}` | Notify reporter + scam-read employees |
| onScamReportUpdate | documentUpdated `scammerProfiles/{scammerId}` | Notify reporter on verified/rejected flip |
| onShipmentItemWrite | documentWritten `shipmentItems/{itemId}` | Feature A — recompute lot `itemCount` + `mainItemsProjectedRevenuePaise` |
| onShipmentLotWrite | documentWritten `shipmentLots/{lotId}` | Feature A — recompute cross-lot customs/shipping allocation + shipment totals |
| onShipmentHeaderWrite | documentWritten `procurementShipments/{shipmentId}` | Feature A — recompute allocation when customs/shipping/labor/status fields change |
| onShipmentDeleted | documentWritten `procurementShipments/{shipmentId}` | Feature A — cascade-delete a shipment's lots + items in batches of 500 |
| onCatalogueSubmittedForApproval | documentUpdated `catalogueItems/{itemId}` | Feature B — notify admins when `listingStatus` transitions to `pending_admin_approval` |
| onJobCreated | documentCreated `jobs/{jobId}` (300s timeout, 512MiB) | Async job primitive (2026-08-15) — dispatches by `job.jobType` through `JOB_RUNNERS` (`appkit/src/_internal/server/jobs/core/jobRunners.ts`), pings `bulk_events/{jobId}` RTDB on completion. The single Function that does all heavy async admin work Vercel routes can't. Registered job types: `payoutsWeekly`, `hardBanCascade`, `whatsappNotify`, `newsletterExport` (2026-08-19 — builds the subscriber CSV, replacing the prior synchronous in-route build; result surfaces via `useBulkEvent` on `AdminNewsletterView`) — see `enqueueJob()` below. |

### HTTPS Callables (8 functions, server-to-server)

| Function | Memory | Purpose |
|----------|--------|---------|
| adminAnalytics | 512 MiB | Admin analytics roll-ups (heavy queries offloaded from Vercel) |
| storeAnalytics | 256 MiB | Per-store analytics roll-ups |
| promotionsApi | 256 MiB | Coupon + offer evaluation |
| listingProcessor | 256 MiB | Sieve query processor (auctions / pre-orders / prize-draws) |
| triggerEventRaffle | 256 MiB | Admin-triggered raffle draw (crypto.randomInt) |
| assignSpinPrize | 256 MiB | Weighted random spin-wheel + coupon issuance |
| invoicePdf | 256 MiB | P-8 — Rule-46-compliant GST invoice PDF generator (`pdfkit`); called from `/api/user/orders/[id]/invoice` over HTTPS with `x-internal-secret`, imports repositories via `@mohasinac/appkit/jobs` (not `/server`) to avoid the OG-rendering bundling trap |
| gateway | 512 MiB | Multiplexed endpoint dispatching on `input.action` to all 7 above |

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
| audit-server-client-function-props.mjs | strict-0 | Server Component `page.tsx` passing an inline function prop to a component whose defining file is `"use client"` — RSC forbids this; caused the 2026-08-19 "Something went wrong" crashes (root-cause #25) |
| audit-functions-query-indices.mjs | strict-0 | Raw `.collection().where()` chains (server jobs/functions + consumer `src/app`) missing a matching composite index |
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
| audit-money-units.mjs | strict-0 | No `*Paise`/`InPaise` identifiers or paise-scale `*100`/`/100` arithmetic — money is stored/displayed as decimal rupees everywhere except the Razorpay boundary |
| audit-raw-money-math.mjs | **report-only, not wired into `run-audits.mjs`** | New (Tier PP, 2026-08-18) — flags ad-hoc `Math.round(x*100)/100` / raw rupee arithmetic that bypasses the canonical rounding helper. 30 pre-existing violations at authoring time; deliberately left unwired pending a dedicated cleanup pass, not run as part of `npm run check` |
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
| audit-media-ext-hmac.mjs | strict-0 | `MEDIA_EXT_HMAC_SECRET` is read only by `src/app/api/media/ext/_signing.ts`; route handler calls `verifyExtSignature()` before any upstream fetch |
| audit-storage-rules-shape.mjs | strict-0 | `appkit/firebase/base/storage.rules` stays `allow read: if true` / `allow write: if false` |
| audit-silent-body-parse.mjs | strict-0 | No silent `request.json().catch(() => ({}))` outside `createRouteHandler` |
| audit-server-action-envelope.mjs | strict-0 | Every server action returns `ActionResult` or `void` (Track W6) |
| audit-usemutation-onerror.mjs | strict-0 | Every mutation flows through `useApiMutation` (not raw `useMutation`) |
| audit-unnecessary-use-client.mjs | strict-0 | Page / component files with `"use client"` import at least one React hook, next/navigation hook, next-intl hook, or browser global — RSC pages that only render Client Components must not carry the directive (root-cause #17 corollary) |
| audit-listing-filter-parity.mjs | strict-0 | SSR/client default-filter divergence on public listing pages — `staleTime:Infinity` freezes SSR `initialData` forever if the SSR filter-builder doesn't mirror the client's default toggle state (root-cause #30) |
| audit-nav-page-wiring.mjs | strict-0 | Every admin/store/user sidebar nav `href` resolves to a real `page.tsx`; every top-level dashboard page has a nav entry pointing at it (root-cause #37) |
| audit-select-wrapper-classname.mjs | strict-0 | `<Select className="...">` sizing/flex utilities silently ignored — the real flex child is the wrapper div; use `wrapperClassName` instead |
| audit-tester-checklist-hrefs.mjs | strict-0 | Every `href` in tester checklist seed data resolves to a real route — catches route renames/relocations silently 404-ing the tester's "Go test this →" button |
| audit-media-filename-generators.mjs (appkit) | strict-0 | `MEDIA_FILENAME_PATTERNS` validator regex table stays in sync with `generateMediaFilename()`'s dispatcher — drift causes `/api/media/sign` to 500 in production (W1-51 bug class) |
| audit-filter-tab-enums.mjs | strict-0 | Every `ADMIN_*_TABS`/`SELLER_*_TABS` filter-chip `id` matches a real value its target Firestore field can hold — a mismatch silently returns zero rows forever (root-cause #33) |
| audit-function-trigger-shadow-types.mjs | strict-0 | A Firestore-trigger handler's local shadow type (e.g. `NewOrder`) has no field name that doesn't exist on the real document type — caught the 2026-08-19 onOrderCreate bug (every WhatsApp purchase announcement read "A customer" / "₹0") |
| audit-list-serializer-parity.mjs | strict-0 | Every admin resource's PATCH-writable field (Zod schema) is present in the sibling LIST endpoint's hand-rolled serializer — a missing field means a list-backed editor reseeds from a stale/default value and silently overwrites real data on the next save. Root-caused 2026-08-19 in admin users (`isTester`/`canTestAdmin`) and stores (`isVerified`/`isFeatured`/`capabilities`); registry currently covers users/stores/team (root-cause #38) |

### ESLint mirror rules (`scripts/eslint-rules/index.mjs`)

5 consumer-local rules under the `letitrip/*` namespace fire inline in the editor for audit patterns whose check-on-stop hook would otherwise wait until the end of every turn. Registered in [eslint.config.mjs](eslint.config.mjs); kept distinct from the shared `lir/*` plugin (at `../packages/packages/eslint-plugin-letitrip/`) to avoid forking the monorepo plugin.

| Rule | Mirrors | Severity | Catches |
|------|---------|----------|---------|
| letitrip/no-double-navigation | audit-double-navigation | error | `table.set(...)` followed by `table.setPage(N)` — second call overwrites the URL update (root-cause #13) |
| letitrip/no-jsx-text-comment | audit-jsx-text-comments | error | `// comment` in JSX child position — renders as literal text in the DOM |
| letitrip/no-hardcoded-sticky-offset | audit-sticky-offsets | error | `sticky top-N` className — should use `top-[var(--header-height,0px)]` (root-cause #2) |
| letitrip/no-button-as-toggle | audit-code-quality / BUTTON_AS_TOGGLE | warn | `<Button role="switch">` — Button styles override toggle sizing; use `<Toggle>` (root-cause #15). Currently "warn" because the Toggle primitive itself violates this; flip to "error" once Toggle is rewritten |
| letitrip/no-dark-mode-orphan | audit-dark-mode (orphan rule subset) | warn | `dark:text-X` / `dark:bg-X` without a base `text-*` / `bg-*` in the same className — leaves light mode undefined |

### Audits delegated to appkit/scripts/ via the dispatcher

Three appkit audits run directly from the consumer dispatcher (separate from the `appkit` npm-prefix entry that runs the chain):
- `appkit/scripts/audit-catch-normalize.mjs`
- `appkit/scripts/audit-route-schema-registry.mjs`
- `appkit/scripts/audit-unknown-leakage.mjs` — **closed strict-0** (W18 complete 2026-06-17: 992 → 0)
