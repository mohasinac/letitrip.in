# UI Components Library — `src/components/`

> **Purpose**: Complete inventory and classification of every file in `src/components/`. This directory is a **pure, domain-agnostic primitive library** — Tier 1 of the three-tier architecture. Files marked ❌ BUSINESS do not belong here and are pending migration to the appropriate `src/features/<domain>/` module.

---

## Classification

| Label       | Meaning                                                                                                                                                                     |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ✅ GENERIC  | Only React, Tailwind, THEME_CONSTANTS, Tier 1 hooks/utils, or other `@/components`. Safe in `src/components/`.                                                              |
| ⚠️ MIXED    | No domain schema types or hooks, but imports site-specific constants (`ROUTES`, `SITE_CONFIG`, `MAIN_NAV_ITEMS`). Acceptable in Tier 1 only when used across many features. |
| ❌ BUSINESS | Imports `*Document` schema types, domain hooks, domain services, or domain-specific API endpoints. Must live in `src/features/<domain>/components/`.                        |

---

## Root-Level Files

| File                            | Classification | Notes                                                   |
| ------------------------------- | -------------- | ------------------------------------------------------- |
| `AvatarDisplay.tsx`             | ✅ GENERIC     | Avatar display wrapper                                  |
| `AvatarUpload.tsx`              | ❌ BUSINESS    | Uses `useMediaUpload` domain hook                       |
| `BlogCard.tsx`                  | ❌ BUSINESS    | Imports `BlogPostDocument`                              |
| `ErrorBoundary.tsx`             | ✅ GENERIC     | React error boundary                                    |
| `EventBanner.tsx`               | ❌ BUSINESS    | Uses `usePublicEvents` domain hook                      |
| `EventCard.tsx`                 | ❌ BUSINESS    | Imports `EventType`, `EventDocument` from `@/db/schema` |
| `FormField.tsx`                 | ✅ GENERIC     | Labelled form field wrapper                             |
| `LayoutClient.tsx`              | ⚠️ MIXED       | Uses `ROUTES`, `useSiteSettings`, `useTheme`            |
| `PasswordStrengthIndicator.tsx` | ✅ GENERIC     | Password strength meter                                 |
| `ReviewCard.tsx`                | ❌ BUSINESS    | Imports `ReviewDocument`                                |
| `StoreCard.tsx`                 | ❌ BUSINESS    | Imports `StoreListItem` from `@/types/stores`           |
| `ZodSetup.tsx`                  | ✅ GENERIC     | Zod error map provider                                  |

---

## `src/components/ui/` — Core UI Primitives ✅

All files are GENERIC — only React, Tailwind, lucide-react, and THEME_CONSTANTS.

| File                         | Description                                                       |
| ---------------------------- | ----------------------------------------------------------------- |
| `Accordion.tsx`              | Collapsible content sections                                      |
| `ActiveFilterChips.tsx`      | Chip list for active query filters                                |
| `Avatar.tsx`                 | Avatar image with fallback initials                               |
| `Badge.tsx`                  | Small status/label badge                                          |
| `BulkActionBar.tsx`          | Action bar for multi-select table operations                      |
| `Button.tsx`                 | Primary button primitive                                          |
| `CameraCapture.tsx`          | Web camera capture widget                                         |
| `Card.tsx`                   | Generic content card wrapper                                      |
| `CountdownDisplay.tsx`       | Formatted countdown timer display                                 |
| `Divider.tsx`                | Horizontal/vertical divider                                       |
| `Dropdown.tsx`               | Dropdown menu trigger + panel                                     |
| `DynamicSelect.tsx`          | Async-loadable select control                                     |
| `EmptyState.tsx`             | Empty list/page state illustration                                |
| `FilterDrawer.tsx`           | Side drawer for filter panels                                     |
| `FilterFacetSection.tsx`     | Collapsible filter facet group                                    |
| `HorizontalScroller.tsx`     | Horizontally scrollable content strip                             |
| `ImageGallery.tsx`           | Thumbnail + lightbox gallery                                      |
| `ItemRow.tsx`                | Single-row item summary (icon + label + value)                    |
| `ListingLayout.tsx`          | Full-page listing shell (header, filters, grid, pagination slots) |
| `Menu.tsx`                   | Contextual action menu                                            |
| `Pagination.tsx`             | Page number controls                                              |
| `PriceDisplay.tsx`           | Formatted price with currency                                     |
| `Progress.tsx`               | Linear progress bar                                               |
| `RatingDisplay.tsx`          | Star rating renderer                                              |
| `RoleBadge.tsx`              | User role label badge                                             |
| `SectionTabs.tsx`            | Horizontal tab bar for page sections                              |
| `SideDrawer.tsx`             | Slide-in side panel                                               |
| `Skeleton.tsx`               | Loading skeleton placeholder                                      |
| `SkipToMain.tsx`             | Accessibility skip-to-content link                                |
| `SortDropdown.tsx`           | Sort-by dropdown selector                                         |
| `Spinner.tsx`                | Loading spinner                                                   |
| `StatsGrid.tsx`              | Grid of stat cards (label + value)                                |
| `StatusBadge.tsx`            | Coloured status pill                                              |
| `StepperNav.tsx`             | Multi-step wizard navigation                                      |
| `SummaryCard.tsx`            | Summary panel (title + rows)                                      |
| `TablePagination.tsx`        | Table footer pagination row                                       |
| `Tabs.tsx`                   | Tab primitive (controlled/uncontrolled)                           |
| `Tooltip.tsx`                | Hover tooltip wrapper                                             |
| `useHorizontalAutoScroll.ts` | Hook: auto-scroll horizontally on overflow                        |
| `useHorizontalScrollDrag.ts` | Hook: drag-to-scroll on touch/mouse                               |

---

## `src/components/forms/` — Form Controls ✅

All files are GENERIC.

| File           | Description                              |
| -------------- | ---------------------------------------- |
| `Checkbox.tsx` | Checkbox input                           |
| `Form.tsx`     | Form wrapper with Zod validation context |
| `Input.tsx`    | Text input field                         |
| `Radio.tsx`    | Radio button group                       |
| `Select.tsx`   | Native `<select>` primitive              |
| `Slider.tsx`   | Range slider                             |
| `Textarea.tsx` | Multi-line text area                     |
| `Toggle.tsx`   | Toggle/switch input                      |

---

## `src/components/typography/` — Text Primitives ✅

| File             | Exports                                       |
| ---------------- | --------------------------------------------- |
| `Typography.tsx` | `Heading`, `Text`, `Caption`, `Label`, `Span` |
| `TextLink.tsx`   | Styled anchor                                 |

---

## `src/components/semantic/` — HTML Semantics ✅

| File           | Exports                                                                                      |
| -------------- | -------------------------------------------------------------------------------------------- |
| `Semantic.tsx` | `Section`, `Article`, `Main`, `Aside`, `Nav`, `BlockHeader`, `BlockFooter`, `Ul`, `Ol`, `Li` |

---

## `src/components/media/` — Media Wrappers ✅

| File                | Description                            |
| ------------------- | -------------------------------------- |
| `MediaAvatar.tsx`   | Avatar via Firebase Storage URL        |
| `MediaImage.tsx`    | Responsive image from Firebase Storage |
| `MediaLightbox.tsx` | Full-screen image lightbox             |
| `MediaVideo.tsx`    | Video player from Firebase Storage     |

---

## `src/components/feedback/` — User Feedback ✅

| File        | Description                                            |
| ----------- | ------------------------------------------------------ |
| `Alert.tsx` | Inline alert banner (info / success / warning / error) |
| `Modal.tsx` | Generic overlay modal with swipe-to-close              |
| `Toast.tsx` | Toast notification display                             |

---

## `src/components/modals/` — Modal Dialogs ✅

| File                      | Description                               |
| ------------------------- | ----------------------------------------- |
| `ConfirmDeleteModal.tsx`  | Reusable delete confirmation dialog       |
| `ImageCropModal.tsx`      | Image crop + preview dialog               |
| `UnsavedChangesModal.tsx` | Prompts via `eventBus` on unsaved changes |

---

## `src/components/layout/` — Structural Layouts

| File                  | Classification | Description                                  |
| --------------------- | -------------- | -------------------------------------------- |
| `AutoBreadcrumbs.tsx` | ✅ GENERIC     | Automatic breadcrumb from URL path           |
| `BottomNavbar.tsx`    | ⚠️ MIXED       | Mobile bottom navigation bar — uses `ROUTES` |
| `BottomNavLayout.tsx` | ✅ GENERIC     | Bottom-nav page layout shell                 |
| `Breadcrumbs.tsx`     | ✅ GENERIC     | Manual breadcrumb trail                      |
| `Footer.tsx`          | ⚠️ MIXED       | Site footer — uses `SITE_CONFIG`, `ROUTES`   |
| `FooterLayout.tsx`    | ✅ GENERIC     | Footer layout shell                          |
| `LocaleSwitcher.tsx`  | ✅ GENERIC     | Language/locale picker                       |
| `MainNavbar.tsx`      | ⚠️ MIXED       | Top navigation bar — uses `MAIN_NAV_ITEMS`   |
| `NavItem.tsx`         | ✅ GENERIC     | Navigation link item                         |
| `Sidebar.tsx`         | ✅ GENERIC     | Side navigation panel                        |
| `SidebarLayout.tsx`   | ✅ GENERIC     | Sidebar page layout shell                    |
| `TitleBar.tsx`        | ✅ GENERIC     | Page section title bar                       |
| `TitleBarLayout.tsx`  | ✅ GENERIC     | Title bar layout shell                       |

---

## `src/components/admin/` — Admin UI Utilities ✅

Top-level admin utilities — all GENERIC. Domain-specific forms, table columns, and views live in `src/features/admin/components/`.

| File                     | Description                           |
| ------------------------ | ------------------------------------- |
| `AdminFilterBar.tsx`     | Filter toolbar shell for admin tables |
| `AdminPageHeader.tsx`    | Page header with title + action slot  |
| `AdminStatsCards.tsx`    | Stats card grid for admin dashboards  |
| `BackgroundSettings.tsx` | Background customization control      |
| `CategoryTreeView.tsx`   | Hierarchical category tree renderer   |
| `DataTable.tsx`          | Sortable/paginated data table         |
| `DrawerFormFooter.tsx`   | Footer bar for drawer-based forms     |
| `GridEditor.tsx`         | Drag-and-drop grid layout editor      |
| `ImageUpload.tsx`        | Image upload field with preview       |
| `MediaUploadField.tsx`   | Generic media upload form field       |
| `RichTextEditor.tsx`     | Tiptap-based rich text editor         |

**`admin/dashboard/`** — ✅ GENERIC

| File                         | Description                |
| ---------------------------- | -------------------------- |
| `AdminDashboardSkeleton.tsx` | Dashboard loading skeleton |
| `RecentActivityCard.tsx`     | Recent activity item card  |

**`admin/media/`** — ✅ GENERIC

| File                     | Description                              |
| ------------------------ | ---------------------------------------- |
| `MediaOperationForm.tsx` | Media library operation form             |
| `MediaTableColumns.tsx`  | Column definitions for media admin table |

---

## `src/components/filters/` — Filter Controls

Generic filter primitives (`RangeFilter`, `SwitchFilter`, `filterUtils`) are fully GENERIC. Domain-named filters import domain-specific sort-option constants, making them domain-aware. They are kept in Tier 1 because they are pure UI + config with zero domain hooks or schema types.

| File                         | Domain              | Notes                                   |
| ---------------------------- | ------------------- | --------------------------------------- |
| `filterUtils.ts`             | shared              | ✅ Pure utility functions               |
| `RangeFilter.tsx`            | shared              | ✅ Generic number range picker          |
| `SwitchFilter.tsx`           | shared              | ✅ Generic boolean toggle filter        |
| `BidFilters.tsx`             | products (auctions) | Domain sort constants only              |
| `BlogFilters.tsx`            | blog                | Domain sort constants only              |
| `CarouselFilters.tsx`        | admin               | Domain sort constants only              |
| `CategoryFilters.tsx`        | categories          | Domain sort constants only              |
| `CouponFilters.tsx`          | promotions          | Domain sort constants only              |
| `EventEntryFilters.tsx`      | events              | Domain sort constants only              |
| `EventFilters.tsx`           | events              | Domain sort constants only              |
| `FaqFilters.tsx`             | faq                 | Domain sort constants only              |
| `HomepageSectionFilters.tsx` | admin               | Domain sort constants only              |
| `NewsletterFilters.tsx`      | admin               | Domain sort constants only              |
| `NotificationFilters.tsx`    | user                | Domain sort constants only              |
| `OrderFilters.tsx`           | cart / seller       | Dual-role: admin orders + seller orders |
| `PayoutFilters.tsx`          | seller              | Domain sort constants only              |
| `ProductFilters.tsx`         | products            | Domain sort constants only              |
| `ReviewFilters.tsx`          | reviews             | Domain sort constants only              |
| `RipCoinFilters.tsx`         | user                | Domain sort constants only              |
| `SessionFilters.tsx`         | admin               | Domain sort constants only              |
| `StoreFilters.tsx`           | stores              | Domain sort constants only              |
| `UserFilters.tsx`            | admin               | Domain sort constants only              |

---

## `src/components/auth/` — Auth Infrastructure ✅

Kept in Tier 1 — used as infrastructure guards across all features, not tied to one domain.

| File                 | Description                             |
| -------------------- | --------------------------------------- |
| `ProtectedRoute.tsx` | Redirects unauthenticated users         |
| `RoleGate.tsx`       | Renders children only for allowed roles |

---

## `src/components/providers/` ✅

| File                     | Description                        |
| ------------------------ | ---------------------------------- |
| `MonitoringProvider.tsx` | Sentry/monitoring context provider |

---

## `src/components/utility/` — Utility Components

| File                     | Classification | Description                                                |
| ------------------------ | -------------- | ---------------------------------------------------------- |
| `BackToTop.tsx`          | ✅ GENERIC     | Floating scroll-to-top button                              |
| `BackgroundRenderer.tsx` | ✅ GENERIC     | Dynamic background image/colour renderer                   |
| `ResponsiveView.tsx`     | ✅ GENERIC     | Conditionally renders children by breakpoint               |
| `Search.tsx`             | ❌ BUSINESS    | Uses `useNavSuggestions` + `AlgoliaNavRecord` domain types |

---

## `src/components/user/` — User UI Components

| File                        | Classification | Description                                  |
| --------------------------- | -------------- | -------------------------------------------- |
| `AccountInfoCard.tsx`       | ❌ BUSINESS    | Uses `useAuth` — belongs in `features/user/` |
| `AddressCard.tsx`           | ❌ BUSINESS    | Address domain display card                  |
| `AddressForm.tsx`           | ✅ GENERIC     | Address input form (no domain hooks)         |
| `AddressSelectorCreate.tsx` | ❌ BUSINESS    | Uses `useAddresses`, `useCreateAddress`      |
| `EmailVerificationCard.tsx` | ❌ BUSINESS    | Uses `useEmailVerification` hook             |
| `NotificationBell.tsx`      | ❌ BUSINESS    | Imports `NotificationDocument`               |
| `PasswordChangeForm.tsx`    | ❌ BUSINESS    | Uses `useChangePassword` hook                |
| `PhoneVerificationCard.tsx` | ❌ BUSINESS    | Uses `usePhoneVerification` hook             |
| `ProfileHeader.tsx`         | ❌ BUSINESS    | User-specific profile data                   |
| `ProfileInfoForm.tsx`       | ❌ BUSINESS    | User profile update hook                     |
| `ProfileStatsGrid.tsx`      | ❌ BUSINESS    | User stats domain shape                      |
| `WishlistButton.tsx`        | ❌ BUSINESS    | Uses `useWishlistToggle`, `useAuth`          |

---

## `src/components/categories/` — Category UI

| File                         | Classification | Description                                                 |
| ---------------------------- | -------------- | ----------------------------------------------------------- |
| `Category.types.ts`          | ❌ BUSINESS    | Category domain types                                       |
| `CategoryCard.tsx`           | ❌ BUSINESS    | Imports `CategoryDocument`                                  |
| `CategoryForm.tsx`           | ❌ BUSINESS    | Uses `useCategories`, `useCreateCategory`, `useMediaUpload` |
| `CategorySelectorCreate.tsx` | ❌ BUSINESS    | Category-specific selector with inline create               |
| `CategoryTableColumns.tsx`   | ❌ BUSINESS    | Admin column definitions for categories                     |

---

## `src/components/products/` — Product UI ❌ ALL BUSINESS

| File                      | Classification | Description                                                    |
| ------------------------- | -------------- | -------------------------------------------------------------- |
| `Product.types.ts`        | ❌ BUSINESS    | Admin product + status domain types                            |
| `ProductCard.tsx`         | ❌ BUSINESS    | Imports `ProductDocument`, `useAddToCart`, `useWishlistToggle` |
| `ProductForm.tsx`         | ❌ BUSINESS    | Admin product form (create/edit)                               |
| `ProductGrid.tsx`         | ❌ BUSINESS    | Imports `ProductDocument`, renders `ProductCard`               |
| `ProductInfo.tsx`         | ❌ BUSINESS    | `ProductDocument` display component                            |
| `ProductReviews.tsx`      | ❌ BUSINESS    | Review domain logic for product detail                         |
| `ProductSortBar.tsx`      | ❌ BUSINESS    | Product-specific sort option constants                         |
| `ProductTableColumns.tsx` | ❌ BUSINESS    | Admin column definitions for products                          |
| `RelatedProducts.tsx`     | ❌ BUSINESS    | Uses `useRelatedProducts` domain hook                          |

---

## `src/components/auctions/` — Auction UI ❌ ALL BUSINESS

| File              | Target                              |
| ----------------- | ----------------------------------- |
| `AuctionCard.tsx` | `src/features/products/components/` |
| `AuctionGrid.tsx` | `src/features/products/components/` |

---

## `src/components/pre-orders/` — Pre-Order UI ❌ ALL BUSINESS

| File               | Target                              |
| ------------------ | ----------------------------------- |
| `PreOrderCard.tsx` | `src/features/products/components/` |
| `PreOrderGrid.tsx` | `src/features/products/components/` |

---

## Business Files Pending Migration

All files below import domain types, domain hooks, or domain services — they do not belong in `src/components/`.

| File (current location)                 | Target                                |
| --------------------------------------- | ------------------------------------- |
| `AvatarUpload.tsx`                      | `src/features/user/components/`       |
| `BlogCard.tsx`                          | `src/features/blog/components/`       |
| `EventBanner.tsx`                       | `src/features/events/components/`     |
| `EventCard.tsx`                         | `src/features/events/components/`     |
| `ReviewCard.tsx`                        | `src/features/reviews/components/`    |
| `StoreCard.tsx`                         | `src/features/stores/components/`     |
| `utility/Search.tsx`                    | `src/features/search/components/`     |
| `user/AccountInfoCard.tsx`              | `src/features/user/components/`       |
| `user/AddressCard.tsx`                  | `src/features/user/components/`       |
| `user/AddressSelectorCreate.tsx`        | `src/features/user/components/`       |
| `user/EmailVerificationCard.tsx`        | `src/features/user/components/`       |
| `user/NotificationBell.tsx`             | `src/features/user/components/`       |
| `user/PasswordChangeForm.tsx`           | `src/features/user/components/`       |
| `user/PhoneVerificationCard.tsx`        | `src/features/user/components/`       |
| `user/ProfileHeader.tsx`                | `src/features/user/components/`       |
| `user/ProfileInfoForm.tsx`              | `src/features/user/components/`       |
| `user/ProfileStatsGrid.tsx`             | `src/features/user/components/`       |
| `user/WishlistButton.tsx`               | `src/features/user/components/`       |
| `categories/Category.types.ts`          | `src/features/categories/components/` |
| `categories/CategoryCard.tsx`           | `src/features/categories/components/` |
| `categories/CategoryForm.tsx`           | `src/features/admin/components/`      |
| `categories/CategorySelectorCreate.tsx` | `src/features/categories/components/` |
| `categories/CategoryTableColumns.tsx`   | `src/features/admin/components/`      |
| `products/Product.types.ts`             | `src/features/products/components/`   |
| `products/ProductCard.tsx`              | `src/features/products/components/`   |
| `products/ProductForm.tsx`              | `src/features/admin/components/`      |
| `products/ProductGrid.tsx`              | `src/features/products/components/`   |
| `products/ProductInfo.tsx`              | `src/features/products/components/`   |
| `products/ProductReviews.tsx`           | `src/features/products/components/`   |
| `products/ProductSortBar.tsx`           | `src/features/products/components/`   |
| `products/ProductTableColumns.tsx`      | `src/features/admin/components/`      |
| `products/RelatedProducts.tsx`          | `src/features/products/components/`   |
| `auctions/AuctionCard.tsx`              | `src/features/products/components/`   |
| `auctions/AuctionGrid.tsx`              | `src/features/products/components/`   |
| `pre-orders/PreOrderCard.tsx`           | `src/features/products/components/`   |
| `pre-orders/PreOrderGrid.tsx`           | `src/features/products/components/`   |

---

## Import Rule

Always import from the barrel — never from a deep path:

```ts
// ✅ correct
import { Button, Card, DataTable } from "@/components";

// ❌ wrong
import { Button } from "@/components/ui/Button";
```
