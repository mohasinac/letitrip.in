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

### ModernLayout

**Purpose:** Main app layout with header/footer

**Used in:** Root layout (`src/app/layout.tsx`)

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
