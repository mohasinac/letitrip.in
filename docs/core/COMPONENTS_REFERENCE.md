# 🎨 Components Library & Usage Reference

**Project:** HobbiesSpot.com - Beyblade Ecommerce Platform  
**Last Updated:** November 1, 2025

---

## Table of Contents

1. [Unified Components (14)](#unified-components)
2. [Admin/Seller Components (4)](#adminseller-components)
3. [Feature Components](#feature-components)
4. [Layout Components](#layout-components)
5. [Usage Map](#where-components-are-used)

---

## Unified Components

**Location:** `src/components/ui/unified/`

### 1. UnifiedButton (`Button.tsx`)

**Purpose:** Standardized button component with multiple variants

**Variants:**

- `primary`, `secondary`, `outline`, `ghost`, `destructive`, `success`, `warning`

**Sizes:** `xs`, `sm`, `md`, `lg`, `xl`

**Usage:**

```tsx
import { UnifiedButton, PrimaryButton } from '@/components/ui/unified';

<UnifiedButton variant="primary" size="md">Click Me</UnifiedButton>
<PrimaryButton>Shorthand</PrimaryButton>
<UnifiedButton loading>Loading...</UnifiedButton>
<UnifiedButton leftIcon={<Icon />}>With Icon</UnifiedButton>
```

**Used in:**

- All forms (submit buttons)
- Navigation (action buttons)
- Tables (action buttons)
- Modals (confirm/cancel)

---

### 2. UnifiedCard (`Card.tsx`)

**Purpose:** Container component for content sections

**Variants:** `default`, `elevated`, `outlined`, `filled`, `glass`

**Subcomponents:** `CardHeader`, `CardContent`, `CardFooter`, `CardMedia`

**Usage:**

```tsx
import { UnifiedCard, CardHeader, CardContent } from "@/components/ui/unified";

<UnifiedCard variant="elevated">
  <CardHeader title="Title" subtitle="Subtitle" />
  <CardContent>
    <p>Content here</p>
  </CardContent>
</UnifiedCard>;
```

**Used in:**

- Dashboard widgets
- Product cards
- Form containers
- Data displays

---

### 3. UnifiedInput (`Input.tsx`)

**Purpose:** Form input fields with validation states

**Types:** text, email, password, number, tel, url, search, date, time, textarea

**Usage:**

```tsx
import { UnifiedInput } from "@/components/ui/unified";

<UnifiedInput
  label="Email"
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  error={!!errors.email}
  helperText={errors.email}
  leftIcon={<Mail />}
/>;
```

**Used in:**

- All forms
- Search bars
- Login/Register
- Profile edit

---

### 4. UnifiedModal (`Modal.tsx`)

**Purpose:** Dialog/modal overlays

**Types:** `default`, `alert`, `confirm`

**Usage:**

```tsx
import { UnifiedModal, ConfirmModal } from '@/components/ui/unified';

<UnifiedModal
  open={isOpen}
  onClose={() => setIsOpen(false)}
  title="Modal Title"
>
  <p>Modal content</p>
</UnifiedModal>

<ConfirmModal
  open={showConfirm}
  title="Delete Item?"
  message="This action cannot be undone."
  onConfirm={handleDelete}
  onCancel={() => setShowConfirm(false)}
/>
```

**Used in:**

- Delete confirmations
- Form submissions
- Image previews
- Alert dialogs

---

### 5. UnifiedBadge (`Badge.tsx`)

**Purpose:** Status indicators and labels

**Variants:** `default`, `primary`, `success`, `error`, `warning`, `info`

**Special:** `StatusBadge`, `CountBadge`

**Usage:**

```tsx
import { UnifiedBadge, StatusBadge } from '@/components/ui/unified';

<UnifiedBadge variant="success">Active</UnifiedBadge>
<StatusBadge status="active" />
<CountBadge count={42} max={99} />
```

**Used in:**

- Order status
- Product tags
- Notification counts
- Category labels

---

### 6. UnifiedAlert (`Alert.tsx`)

**Purpose:** Feedback messages

**Variants:** `info`, `success`, `warning`, `error`, `default`

**Usage:**

```tsx
import { UnifiedAlert } from "@/components/ui/unified";

<UnifiedAlert
  variant="success"
  title="Success!"
  onClose={() => setShowAlert(false)}
>
  Operation completed successfully
</UnifiedAlert>;
```

**Used in:**

- Form submissions
- Error messages
- Success notifications
- Warnings

---

### 7. Form Controls (`FormControls.tsx`)

**Components:** `UnifiedCheckbox`, `UnifiedRadio`, `UnifiedSwitch`, `UnifiedSelect`, `RadioGroup`

**Usage:**

```tsx
import { UnifiedCheckbox, UnifiedSwitch, UnifiedSelect } from '@/components/ui/unified';

<UnifiedCheckbox
  checked={agreed}
  onChange={(e) => setAgreed(e.target.checked)}
  label="I agree to terms"
/>

<UnifiedSwitch
  checked={isActive}
  onChange={(e) => setIsActive(e.target.checked)}
  label="Active"
/>

<UnifiedSelect
  value={category}
  onChange={(e) => setCategory(e.target.value)}
  options={categories}
/>
```

**Used in:**

- Settings pages
- Filters
- Form inputs
- Toggle features

---

### 8-14. Additional Unified Components

| Component            | Purpose              | Used In             |
| -------------------- | -------------------- | ------------------- |
| **UnifiedTabs**      | Tab navigation       | Multi-section pages |
| **UnifiedAccordion** | Collapsible sections | FAQs, Details       |
| **UnifiedTooltip**   | Hover information    | Icons, Help text    |
| **UnifiedDropdown**  | Context menus        | Action menus        |
| **UnifiedSkeleton**  | Loading placeholders | Data loading states |
| **UnifiedProgress**  | Progress indicators  | Uploads, Loading    |
| **UnifiedStepper**   | Multi-step flows     | Forms, Wizards      |

---

## Admin/Seller Components

**Location:** `src/components/ui/admin-seller/`

### 1. PageHeader

**Purpose:** Consistent page headers with breadcrumbs

**Usage:**

```tsx
import { PageHeader } from "@/components/ui/admin-seller/PageHeader";

<PageHeader
  title="Products"
  description="Manage your products"
  actions={
    <PrimaryButton onClick={() => router.push("/seller/products/new")}>
      Add Product
    </PrimaryButton>
  }
/>;
```

**Used in:**

- All admin pages
- All seller pages
- Detail pages

---

### 2. ModernDataTable

**Purpose:** Feature-rich data tables

**Features:**

- Sorting
- Pagination
- Search/Filter
- Action columns
- Selection

**Usage:**

```tsx
import { ModernDataTable } from "@/components/ui/admin-seller/ModernDataTable";

<ModernDataTable
  columns={[
    { key: "name", label: "Name", sortable: true },
    { key: "price", label: "Price", sortable: true },
    { key: "actions", label: "Actions" },
  ]}
  data={products}
  onSort={handleSort}
/>;
```

**Used in:**

- Product lists
- Order lists
- User lists
- Any tabular data

---

### 3. SmartCategorySelector

**Purpose:** Hierarchical category selection

**Features:**

- Tree structure
- Search
- Breadcrumb navigation
- Leaf validation

**Usage:**

```tsx
import { SmartCategorySelector } from "@/components/ui/admin-seller/SmartCategorySelector";

<SmartCategorySelector
  value={selectedCategory}
  onChange={setSelectedCategory}
  onlyLeafSelection={true}
/>;
```

**Used in:**

- Product forms
- Category filters
- Admin category management

---

### 4. SeoFieldsGroup

**Purpose:** SEO metadata input group

**Features:**

- Auto-generate from title
- Character counters
- URL preview
- Keyword management

**Usage:**

```tsx
import { SeoFieldsGroup } from "@/components/ui/admin-seller/SeoFieldsGroup";

<SeoFieldsGroup
  initialData={seoData}
  onChange={setSeoData}
  autoGenerateFromTitle={true}
  titleSource={productName}
/>;
```

**Used in:**

- Product forms
- Shop setup
- Category management

---

## Feature Components

### Auth Components (`src/components/features/auth/`)

#### RoleGuard

**Purpose:** Protect routes by user role

**Usage:**

```tsx
import RoleGuard from "@/components/features/auth/RoleGuard";

<RoleGuard allowedRoles={["seller", "admin"]}>
  <SellerDashboard />
</RoleGuard>;
```

**Used in:**

- All protected pages
- Conditional rendering

---

### Seller Components (`src/components/seller/`)

#### SellerSidebar

**Purpose:** Seller panel navigation

**Used in:** All seller pages

---

### Admin Components (`src/components/admin/`)

#### AdminSidebar

**Purpose:** Admin panel navigation

**Used in:** All admin pages

---

## Layout Components

**Location:** `src/components/layout/`

### 1. ModernLayout

**Purpose:** Main app layout with header, footer, and responsive navigation

**Features:**

- Modern navbar with 6 navigation links (Home, Products, Categories, Stores, Game, Contact)
- Search and shopping cart icons
- Theme switcher (light/dark mode)
- User authentication menu
- Responsive mobile drawer menu
- Comprehensive footer with 30+ links organized in 5 columns
- Social media integration (Facebook, Twitter, Instagram)
- Sticky header with smooth transitions

**Used in:** Root layout (`src/app/layout.tsx`)

**Navigation Links:**

```tsx
// Main Navigation
- Home (/)
- Products (/products)
- Categories (/categories)
- Stores (/stores)
- Game (/game)
- Contact (/contact)

// Quick Actions
- Search (/search)
- Shopping Cart (/cart)
- Theme Toggle
- User Profile Menu
```

**Footer Sections:**

- **Company Info**: Brand, description, social media
- **Shop**: Products, Categories, Stores, New Arrivals, Best Sellers, On Sale
- **Customer Service**: Contact, Help, FAQ, Track Order, Returns, Shipping
- **Company**: About, Careers, Blog, Game, Terms, Privacy
- **Bottom Bar**: Sitemap, Accessibility, Cookie Policy

**Responsive Breakpoints:**

- Mobile (<768px): Hamburger menu, single column footer
- Tablet (768-1024px): Partial navigation, 2-column footer
- Desktop (>1024px): Full navigation, 5-column footer

**Version:** v1.2.0 (Updated November 2025)

---

### 2. AdminSidebar

**Purpose:** Navigation sidebar for admin panel with collapsible menu

**Location:** `src/components/layout/AdminSidebar.tsx`

**Features:**

- ✅ Fixed minimize/maximize functionality
- ✅ Sticky positioning (stays visible during scroll)
- ✅ Scrollable content area with custom scrollbar
- ✅ Gradient header (blue → purple)
- ✅ Icon animations (pulse effect on active items)
- ✅ Progress bar in footer
- ✅ 13 menu items with logical grouping
- ✅ Smooth transitions (300ms ease-in-out)

**Menu Items:**

1. Dashboard (/admin)
2. Analytics (/admin/analytics)
3. Products (/admin/products)
4. Categories (/admin/categories)
5. Orders (/admin/orders)
6. Users (/admin/users)
7. Coupons (/admin/coupons)
8. Sales (/admin/sales)
9. Reviews (/admin/reviews)
10. Support (/admin/support)
11. Notifications (/admin/notifications)
12. Game (/admin/game/beyblades)
13. Settings (/admin/settings)

**States:**

- **Expanded**: 256px (w-64) - Shows icons + labels + badges
- **Collapsed**: 80px (w-20) - Shows icons only with tooltips

**Color Scheme:**

- **Gradient**: Blue (#2563eb) → Purple (#7c3aed)
- **Hover**: Light Blue (#eff6ff)
- **Active**: Blue Gradient + Shadow

**Footer Display:**

- Version v1.2.0
- Progress bar showing 75%
- Shield icon when collapsed

**Usage:**

```tsx
import AdminSidebar from "@/components/layout/AdminSidebar";

<AdminSidebar open={adminSidebarOpen} onToggle={setAdminSidebarOpen} />;
```

**Version:** v1.2.0 (Fixed & Enhanced November 2025)

---

### 3. SellerSidebar

**Purpose:** Navigation sidebar for seller panel with status indicators

**Location:** `src/components/seller/SellerSidebar.tsx`

**Features:**

- ✅ Fixed minimize/maximize functionality
- ✅ Sticky positioning (stays visible during scroll)
- ✅ Scrollable content area with custom scrollbar
- ✅ Green gradient theme (green → emerald)
- ✅ Enhanced badge system with bounce animation
- ✅ Store status indicator with pulsing dot
- ✅ 11 menu items with logical grouping
- ✅ Multiple badge locations (icon + end of row)

**Menu Items:**

1. Dashboard (/seller/dashboard)
2. Shop Setup (/seller/shop-setup)
3. Products (/seller/products)
4. Orders (/seller/orders)
5. Shipments (/seller/shipments)
6. Coupons (/seller/coupons)
7. Sales (/seller/sales)
8. Analytics (/seller/analytics)
9. Revenue (/seller/analytics?tab=revenue)
10. Alerts (/seller/alerts) - with badge
11. Settings (/seller/settings)

**States:**

- **Expanded**: 256px (w-64) - Shows icons + labels + badges
- **Collapsed**: 80px (w-20) - Shows icons only with tooltips

**Color Scheme:**

- **Gradient**: Green (#16a34a) → Emerald (#059669)
- **Hover**: Light Green (#f0fdf4)
- **Active**: Green Gradient + Shadow

**Badge System:**

- Small badge on icon (bounce animation)
- Large badge at end of row (when expanded)
- Displays "9+" for counts > 9, "99+" for counts > 99

**Footer Display:**

- Store Status: 🟢 Active (with pulsing dot)
- Version v1.2.0
- Store icon when collapsed

**Usage:**

```tsx
import SellerSidebar from "@/components/seller/SellerSidebar";

<SellerSidebar
  open={sellerSidebarOpen}
  onToggle={setSellerSidebarOpen}
  unreadAlerts={5}
/>;
```

**Version:** v1.2.0 (Fixed & Enhanced November 2025)

---

### Layout Component Improvements (v1.2.0)

**Bugs Fixed:**

1. ✅ Sidebar collapse/expand not working properly
2. ✅ Width jumping on toggle
3. ✅ Inline style conflicts
4. ✅ No sticky positioning
5. ✅ Content overflow issues
6. ✅ Animation glitches
7. ✅ Mobile menu overlapping
8. ✅ Footer not responsive
9. ✅ Active states not working
10. ✅ Dark mode inconsistencies

**New Features Added:**

- Search icon in navbar
- Shopping cart icon in navbar
- 30+ footer links organized by category
- Social media icons with custom SVGs
- Gradient backgrounds and text
- Smooth animations (pulse, bounce, transitions)
- Better hover states and visual feedback
- Consistent rounded corners (rounded-lg)
- Full accessibility (ARIA labels, focus states)
- Enhanced mobile responsiveness

**Accessibility Improvements:**

- Full keyboard navigation
- Comprehensive ARIA labels
- Clear focus indicators
- Screen reader optimized
- Color contrast compliant (WCAG 2.1)
- Touch target sizes met (44px minimum)

**Performance Optimizations:**

- Smooth 60fps animations
- No layout thrashing
- Efficient re-renders
- Optimized CSS transitions
- Minimal CSS overhead

---

## Where Components Are Used

### By Page Type

#### **Product Pages**

- `UnifiedCard` - Product display
- `UnifiedButton` - Add to cart, buy now
- `UnifiedBadge` - Stock status, tags
- `ModernDataTable` - Product lists (seller)
- `SmartCategorySelector` - Category navigation

#### **Forms (All)**

- `UnifiedInput` - Text fields
- `UnifiedSelect` - Dropdowns
- `UnifiedCheckbox` - Agreement checkboxes
- `UnifiedSwitch` - Toggle options
- `UnifiedButton` - Submit buttons
- `SeoFieldsGroup` - SEO fields (seller/admin)

#### **Dashboards**

- `PageHeader` - Page title
- `UnifiedCard` - Stat widgets
- `ModernDataTable` - Data tables
- `UnifiedAlert` - Notifications

#### **Admin/Seller Panels**

- `PageHeader` - All pages
- `AdminSidebar` / `SellerSidebar` - Navigation
- `ModernDataTable` - Lists
- `RoleGuard` - Access control

---

## Component Usage Statistics

### Most Used Components (Top 10)

1. **UnifiedButton** - 100+ usages
2. **UnifiedCard** - 80+ usages
3. **UnifiedInput** - 60+ usages
4. **PageHeader** - 30+ usages (all admin/seller pages)
5. **UnifiedBadge** - 40+ usages
6. **ModernDataTable** - 15+ usages
7. **UnifiedAlert** - 30+ usages
8. **RoleGuard** - 20+ usages
9. **SeoFieldsGroup** - 10+ usages
10. **SmartCategorySelector** - 8+ usages

---

## Import Patterns

### Single Import

```tsx
import {
  UnifiedButton,
  UnifiedCard,
  UnifiedInput,
} from "@/components/ui/unified";
```

### Specific Import (Better for tree-shaking)

```tsx
import { UnifiedButton } from "@/components/ui/unified/Button";
```

### Admin/Seller Components

```tsx
import { PageHeader } from "@/components/ui/admin-seller/PageHeader";
import { ModernDataTable } from "@/components/ui/admin-seller/ModernDataTable";
```

---

## Migration from MUI

If you see MUI components, replace with:

| MUI Component      | Unified Replacement |
| ------------------ | ------------------- |
| `Button`           | `UnifiedButton`     |
| `Card`             | `UnifiedCard`       |
| `TextField`        | `UnifiedInput`      |
| `Select`           | `UnifiedSelect`     |
| `Switch`           | `UnifiedSwitch`     |
| `Checkbox`         | `UnifiedCheckbox`   |
| `Dialog`           | `UnifiedModal`      |
| `Alert`            | `UnifiedAlert`      |
| `Chip`             | `UnifiedBadge`      |
| `Tabs`             | `UnifiedTabs`       |
| `Accordion`        | `UnifiedAccordion`  |
| `Tooltip`          | `UnifiedTooltip`    |
| `CircularProgress` | `UnifiedProgress`   |
| `Skeleton`         | `UnifiedSkeleton`   |

---

## Best Practices

1. **Always use Unified components** - Don't create one-off components
2. **Use shorthand exports** - `PrimaryButton`, `SecondaryButton` instead of `variant` prop when possible
3. **Consistent styling** - Use Tailwind classes, not inline styles
4. **Compose components** - Build complex UIs from simple unified components
5. **Document usage** - Add comments for complex component usage

---

## Quick Reference Card

```tsx
// Buttons
<PrimaryButton>Primary</PrimaryButton>
<SecondaryButton>Secondary</SecondaryButton>
<OutlineButton>Outline</OutlineButton>

// Cards
<UnifiedCard>Content</UnifiedCard>
<ElevatedCard>Content</ElevatedCard>

// Forms
<UnifiedInput label="Name" value={name} onChange={setName} />
<UnifiedSelect options={options} value={value} onChange={setValue} />
<UnifiedCheckbox label="Agree" checked={agreed} onChange={setAgreed} />

// Feedback
<UnifiedAlert variant="success">Success!</UnifiedAlert>
<StatusBadge status="active" />

// Admin/Seller
<PageHeader title="Page Title" />
<ModernDataTable columns={cols} data={data} />
<SmartCategorySelector value={cat} onChange={setCat} />
<SeoFieldsGroup initialData={seo} onChange={setSeo} />
```

---

_Last Updated: November 1, 2025_  
_For implementation details, see [UNIFIED_COMPONENTS_LIBRARY.md](./project/UNIFIED_COMPONENTS_LIBRARY.md)_
