# Shared Component Library

Shared components live in `src/components/`. They are Tier 1 — usable by any feature or page.

---

## Root-Level Components

| Component                   | File                            | Description                                           |
| --------------------------- | ------------------------------- | ----------------------------------------------------- |
| `AvatarDisplay`             | `AvatarDisplay.tsx`             | Read-only avatar with fallback initials               |
| `AvatarUpload`              | `AvatarUpload.tsx`              | Avatar with camera/upload overlay for profile editing |
| `BlogCard`                  | `BlogCard.tsx`                  | Blog post listing card with category badge            |
| `DashboardStatsCard`        | `DashboardStatsCard.tsx`        | Metric card with icon + trend arrow                   |
| `ErrorBoundary`             | `ErrorBoundary.tsx`             | React class error boundary                            |
| `EventBanner`               | `EventBanner.tsx`               | Active event strip banner                             |
| `EventCard`                 | `EventCard.tsx`                 | Event listing card                                    |
| `FormField`                 | `FormField.tsx`                 | Generic react-hook-form field wrapper                 |
| `LayoutClient`              | `LayoutClient.tsx`              | Client shell with all providers + main nav            |
| `PasswordStrengthIndicator` | `PasswordStrengthIndicator.tsx` | Real-time password strength bar                       |
| `ReviewCard`                | `ReviewCard.tsx`                | Review display card                                   |
| `RowActionMenu`             | `RowActionMenu.tsx`             | Three-dot context menu for table rows                 |
| `StoreCard`                 | `StoreCard.tsx`                 | Store listing card                                    |
| `ZodSetup`                  | `ZodSetup.tsx`                  | Client-side Zod locale initialiser                    |

---

## `components/admin/`

Admin-specific helper components.

| Component          | Description                                 |
| ------------------ | ------------------------------------------- |
| `AdminFilterBar`   | Debounced text search bar above data tables |
| `AdminPageHeader`  | Page title + optional action button         |
| `DrawerFormFooter` | Cancel/submit footer for drawer forms       |
| `ImageUpload`      | Single image drag-and-drop upload field     |
| `MediaUploadField` | Full media picker with crop/trim support    |

---

## `components/auctions/`

| Component     | Description                              |
| ------------- | ---------------------------------------- |
| `AuctionCard` | Auction listing card with live countdown |
| `AuctionGrid` | Responsive auction card grid             |

---

## `components/auth/`

| Component                               | Description                                        |
| --------------------------------------- | -------------------------------------------------- |
| `ProtectedRoute` / `withProtectedRoute` | Route guard — redirects if role requirements unmet |
| `RoleGate`                              | Render children conditionally based on role        |
| `AdminOnly`                             | Shorthand `<RoleGate role="admin">`                |

---

## `components/categories/`

| Component                 | Description                                 |
| ------------------------- | ------------------------------------------- |
| `CategoryCard`            | Category tile with image + product count    |
| `CategoryForm`            | Category create/edit form                   |
| `CategorySelectorCreate`  | Category picker with inline-create option   |
| `getCategoryTableColumns` | Column definitions for categories DataTable |

---

## `components/feedback/`

| Component                              | Description                                           |
| -------------------------------------- | ----------------------------------------------------- |
| `Alert`                                | Dismissable inline alert (info/success/warning/error) |
| `Modal` / `ModalFooter`                | Dialog overlay with configurable footer               |
| `Toast` / `ToastProvider` / `useToast` | Toast notification system                             |

---

## `components/filters/`

Config-driven filter panels and shared filter primitives.

| Component        | Description                                                   |
| ---------------- | ------------------------------------------------------------- |
| `FilterPanel`    | Generic config-driven filter panel (facets)                   |
| `BlogFilters`    | Blog-specific filter panel                                    |
| `EventFilters`   | Event filter panel                                            |
| `OrderFilters`   | Order filter panel (admin + seller variants)                  |
| `ProductFilters` | Faceted product filter panel (price, category, brand, rating) |
| `RangeFilter`    | Min/max range slider                                          |
| `ReviewFilters`  | Review filter panel                                           |
| `SwitchFilter`   | Boolean toggle filter chip                                    |

**Types:** `FacetSingleConfig`, `FacetMultiConfig`, `FacetOption`, `UrlTable`

---

## `components/forms/`

Form primitive components. Used inside larger forms but also useful standalone.

| Component            | Description                                       |
| -------------------- | ------------------------------------------------- |
| `Checkbox`           | Styled checkbox input                             |
| `Form` / `FormGroup` | Form container + labelled field group             |
| `Input`              | Text input with label, placeholder, error message |
| `RadioGroup`         | Styled radio button group                         |
| `Select`             | Native `<select>` dropdown                        |
| `Slider`             | Range slider input                                |
| `Textarea`           | Auto-resize textarea                              |
| `Toggle`             | iOS-style toggle switch                           |

---

## `components/layout/`

Page layout building blocks.

| Component                        | Description                                                     |
| -------------------------------- | --------------------------------------------------------------- |
| `AutoBreadcrumbs`                | Route-driven auto breadcrumb trail                              |
| `BottomActions`                  | Mobile action bar above BottomNavbar — page actions + bulk mode |
| `BottomNavbar`                   | Mobile bottom navigation bar (5 icons)                          |
| `BottomNavLayout`                | Layout wrapper that adds bottom nav padding                     |
| `Breadcrumbs` / `BreadcrumbItem` | Manual breadcrumb trail                                         |
| `Footer`                         | Site footer                                                     |
| `FooterLayout`                   | Configurable footer sections layout                             |
| `LocaleSwitcher`                 | Language picker dropdown                                        |
| `MainNavbar`                     | Desktop/mobile main navigation                                  |
| `NavbarLayout`                   | Configurable navbar layout                                      |
| `NavItem`                        | Single navigation link item                                     |
| `Sidebar`                        | Collapsible sidebar panel                                       |
| `SidebarLayout`                  | Page layout with sticky left sidebar                            |
| `TitleBar`                       | Section title bar with action slots                             |
| `TitleBarLayout`                 | Admin/seller portal title bar                                   |

---

## `components/media/`

All media rendering goes through these components. Never use raw `<img>` or `<video>` tags.

| Component       | Description                                               |
| --------------- | --------------------------------------------------------- |
| `MediaImage`    | Firebase Storage image with responsive sizes and fallback |
| `MediaVideo`    | Firebase Storage video player                             |
| `MediaAvatar`   | Firebase Storage backed avatar with initials fallback     |
| `MediaLightbox` | Multi-image full-screen lightbox overlay                  |

**Types:** `MediaImageProps`, `MediaImageSize`, `MediaVideoProps`, `MediaAvatarProps`, `LightboxItem`, `MediaLightboxProps`

---

## `components/modals/`

| Component             | Description                                           |
| --------------------- | ----------------------------------------------------- |
| `ConfirmDeleteModal`  | Standardised delete confirmation dialog               |
| `ImageCropModal`      | Image crop + resize modal with aspect ratio lock      |
| `UnsavedChangesModal` | Warning dialog when leaving page with unsaved changes |

---

## `components/orders/`

| Component   | Description                      |
| ----------- | -------------------------------- |
| `OrderCard` | Order summary card used in lists |

---

## `components/pre-orders/`

| Component      | Description                                   |
| -------------- | --------------------------------------------- |
| `PreOrderCard` | Pre-order product card with availability date |

---

## `components/products/`

| Component                | Description                     |
| ------------------------ | ------------------------------- |
| `ProductCard`            | Product listing card            |
| `ProductForm`            | Full product create/edit form   |
| `ProductGrid`            | Responsive product grid         |
| `ProductSortBar`         | Sort dropdown + results count   |
| `useProductTableColumns` | Admin product DataTable columns |

**Types:** `ProductCardProps`, `PRODUCT_SORT_VALUES`, `ProductSortValue`

---

## `components/providers/`

| Component                          | Description                         |
| ---------------------------------- | ----------------------------------- |
| `MonitoringProvider`               | Sentry error monitoring initialiser |
| `QueryProvider` / `getQueryClient` | TanStack Query client provider      |

---

## `components/semantic/`

Re-exports semantic HTML primitives from `@lir/ui`:

`Section`, `Article`, `Nav`, `Ul`, `Li`, `Aside`, `Header`, `Footer`, `Main`

Use these instead of raw HTML tags.

---

## `components/typography/`

Re-exports typography components from `@lir/ui`:

`Heading`, `Text`, `Label`, `Caption`, `Span` + adds `TextLink` (Next.js Link with typography styles).

---

## `components/ui/`

General-purpose UI components.

| Component                            | Description                                       |
| ------------------------------------ | ------------------------------------------------- |
| `Accordion` / `AccordionItem`        | Collapsible content panel                         |
| `ActiveFilterChips`                  | Strip of active URL filter chips with remove      |
| `Avatar` / `AvatarGroup`             | Avatar image with group overflow                  |
| `Badge`                              | Inline status/label badge                         |
| `BulkActionBar`                      | Floating action bar for table bulk operations     |
| `Button`                             | Primary action button                             |
| `CameraCapture`                      | Mobile camera capture widget                      |
| `Card` / `CardHeader`                | Generic content card                              |
| `CountdownDisplay`                   | Live countdown timer display                      |
| `Divider`                            | Horizontal separator                              |
| `Dropdown` / `DropdownTrigger`       | Dropdown menu                                     |
| `DynamicSelect`                      | Async paginated select with search                |
| `EmptyState`                         | Empty state with illustration + message           |
| `FilterDrawer`                       | Mobile slide-in filter drawer                     |
| `FilterFacetSection`                 | Filter section within a drawer                    |
| `FlowDiagram`                        | Step-by-step process flow visualization           |
| `HorizontalScroller`                 | Responsive horizontal scroll container            |
| `ImageGallery`                       | Thumbnail grid gallery                            |
| `ItemRow`                            | Labelled key-value detail row                     |
| `ListingLayout`                      | Two-column listing page layout (filter + results) |
| `Menu`                               | Contextual action menu                            |
| `Pagination`                         | Page number navigator                             |
| `PriceDisplay`                       | Price with original/discounted formatting         |
| `Progress` / `IndeterminateProgress` | Progress bars                                     |
| `RatingDisplay`                      | Star rating display                               |
| `RoleBadge`                          | User role chip                                    |
| `SectionTabs`                        | Tabbed section navigation                         |
| `SideDrawer`                         | Generic slide-in side panel                       |
| `Skeleton`                           | Loading shimmer placeholder                       |
| `SkipToMain`                         | Accessibility skip-to-content anchor              |
| `SortDropdown`                       | Sort order selection dropdown                     |
| `Spinner`                            | Loading spinner                                   |
| `StatsGrid`                          | Metric stats grid                                 |
| `StatusBadge`                        | Domain status badge (order/payment/review)        |
| `StepperNav`                         | Checkout step progress indicator                  |
| `SummaryCard`                        | Labelled totals summary card                      |
| `TablePagination`                    | Pagination component for data tables              |
| `Tabs` / `TabsList`                  | Tab navigation                                    |
| `Tooltip`                            | Hover tooltip overlay                             |

---

## `components/user/`

| Component               | Description                         |
| ----------------------- | ----------------------------------- |
| `AddressCard`           | Saved delivery address display card |
| `AddressForm`           | Address create/edit form            |
| `AddressSelectorCreate` | Address picker with inline-create   |
| `NotificationBell`      | Header bell with unread badge       |
| `RCBalanceChip`         | Coin balance inline chip            |

---

## `components/utility/`

| Component            | Description                                              |
| -------------------- | -------------------------------------------------------- |
| `BackgroundRenderer` | Renders configurable page backgrounds from site settings |
| `BackToTop`          | Floating scroll-to-top button                            |
| `ResponsiveView`     | Conditionally render content per breakpoint              |
| `Search`             | Navbar search bar with Algolia suggestions               |
