# Modern Reusable Components Library - 2025 Specification

**Created:** November 1, 2025  
**Purpose:** Build modern, reusable, production-ready UI components for admin and seller panels  
**Design System:** 2025+ Modern, Clean, Glassmorphism, Smooth Animations  
**Target:** Zero MUI dependencies, 100% Tailwind CSS + Headless UI patterns

---

## 🎨 Design Philosophy

### Modern 2025+ UI Principles:

1. **Glassmorphism & Depth** - Layered, translucent cards with backdrop blur
2. **Smooth Micro-interactions** - Framer Motion animations, hover states, transitions
3. **Clean Typography** - Inter/Geist font, proper hierarchy, readable spacing
4. **Vibrant Gradients** - Subtle background gradients, colorful accents
5. **Dark Mode First** - Beautiful dark mode, not an afterthought
6. **Accessibility** - ARIA labels, keyboard navigation, screen reader support
7. **Mobile-First Responsive** - Touch-friendly, adaptive layouts
8. **Performance** - Lazy loading, virtualization, optimized re-renders

---

## 📦 Core Reusable Components Library

### Location: `src/components/ui/admin-seller/`

---

## 1. 🖼️ Image Editor Component

**File:** `ImageEditor.tsx` (< 250 lines)

### Features:

- **Drag & Drop** upload with preview
- **Crop & Resize** with aspect ratio presets (1:1, 16:9, 4:3, free)
- **Image Filters** - Brightness, contrast, saturation, blur
- **Multiple Upload** support with reordering
- **Cloudinary/Firebase Storage** integration
- **Thumbnail generation** for performance
- **Preview Modal** with zoom controls
- **Alt Text & SEO** fields per image
- **Format Conversion** (WebP optimization)
- **Validation** - Size limits, format checks, dimension checks

### Props Interface:

```typescript
interface ImageEditorProps {
  maxImages?: number; // Default: 10
  maxSizePerImageMB?: number; // Default: 5
  aspectRatios?: Array<{ label: string; value: number }>; // Default: common ratios
  onUpload: (images: UploadedImage[]) => void;
  onDelete: (imageId: string) => void;
  initialImages?: UploadedImage[];
  storagePath?: string; // Firebase Storage path
  showSeoFields?: boolean; // Default: true
  allowReorder?: boolean; // Default: true
  showThumbnails?: boolean; // Default: true
}

interface UploadedImage {
  id: string;
  url: string;
  thumbnailUrl?: string;
  alt: string;
  title?: string;
  width: number;
  height: number;
  sizeKB: number;
  order: number;
}
```

### UI Design:

```
┌─────────────────────────────────────────────────────────┐
│  📸 Product Images (3/10)                      [+ Add]   │
├─────────────────────────────────────────────────────────┤
│  ┌────────┐  ┌────────┐  ┌────────┐                     │
│  │ [IMG1] │  │ [IMG2] │  │ [IMG3] │   Drag to reorder   │
│  │  Main  │  │        │  │        │                     │
│  │ [Edit] │  │ [Edit] │  │ [Edit] │                     │
│  │  [×]   │  │  [×]   │  │  [×]   │                     │
│  └────────┘  └────────┘  └────────┘                     │
│                                                          │
│  Drop Zone: Click or drag images here                   │
│  └──────────────────────────────────────────┘           │
│                                                          │
│  When editing:                                          │
│  ┌──────────────────────────────────────────┐           │
│  │  [Image Preview with Crop Overlay]       │           │
│  │  ─────────────────────────────────────    │           │
│  │  Aspect Ratio: [1:1] [16:9] [4:3] [Free] │           │
│  │  Brightness: [──────●────]  50%          │           │
│  │  Contrast:   [──────●────]  50%          │           │
│  │  Alt Text:   [________________________]  │           │
│  │  Title:      [________________________]  │           │
│  │               [Cancel]  [Save Changes]    │           │
│  └──────────────────────────────────────────┘           │
└─────────────────────────────────────────────────────────┘
```

### Animation Style:

- Image hover: Scale(1.05), lift shadow
- Upload progress: Smooth circular progress ring
- Reorder: Framer Motion drag & drop with visual feedback

---

## 2. 🎬 Video Upload & Thumbnail Selector

**File:** `VideoUploadWithThumbnail.tsx` (< 280 lines)

### Features:

- **Video Upload** with progress indicator
- **Auto Thumbnail Generation** - Extract frames at 0%, 25%, 50%, 75%, 100%
- **Custom Thumbnail Upload** option
- **Video Preview** player with controls
- **Thumbnail Gallery** - Select from auto-generated or upload custom
- **Video Metadata** - Duration, resolution, size, format
- **Firebase Storage** integration with compression
- **Poster Image** selection for lazy loading
- **Format Validation** - MP4, WebM, MOV
- **Size Limits** - Max 100MB, with warnings

### Props Interface:

```typescript
interface VideoUploadProps {
  maxSizeMB?: number; // Default: 100
  acceptedFormats?: string[]; // Default: ['video/mp4', 'video/webm', 'video/mov']
  onUpload: (video: UploadedVideo) => void;
  onDelete: () => void;
  initialVideo?: UploadedVideo;
  storagePath?: string;
  autoGenerateThumbnails?: boolean; // Default: true
  thumbnailCount?: number; // Default: 5
}

interface UploadedVideo {
  id: string;
  url: string;
  thumbnailUrl: string; // Selected thumbnail
  thumbnailOptions: string[]; // All generated thumbnails
  duration: number; // seconds
  width: number;
  height: number;
  sizeMB: number;
  format: string;
  title?: string;
}
```

### UI Design:

```
┌─────────────────────────────────────────────────────────┐
│  🎬 Product Video                               [Upload] │
├─────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────┐           │
│  │                                          │           │
│  │        [Video Player Preview]            │           │
│  │         ▶ 0:45 / 2:30                   │           │
│  │                                          │           │
│  └──────────────────────────────────────────┘           │
│                                                          │
│  Select Video Thumbnail:                                │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐  [Upload Custom]   │
│  │[T1]│ │[T2]│ │[T3]│ │[T4]│ │[T5]│                    │
│  │ ✓  │ │    │ │    │ │    │ │    │                    │
│  └────┘ └────┘ └────┘ └────┘ └────┘                    │
│                                                          │
│  Video Details:                                         │
│  Duration: 2:30 | Size: 45.2 MB | Resolution: 1920x1080│
│  Format: MP4                                [Remove]     │
└─────────────────────────────────────────────────────────┘
```

### Animation Style:

- Upload: Circular progress with percentage
- Thumbnail selection: Border highlight with smooth transition
- Video hover: Glow effect on preview container

---

## 3. 🔍 SEO Fields Component

**File:** `SeoFieldsGroup.tsx` (< 200 lines)

### Features:

- **Meta Title** with character counter (50-60 optimal)
- **Meta Description** with character counter (150-160 optimal)
- **URL Slug** with auto-generation from title
- **Keywords** input with tag interface
- **Open Graph** fields (OG Title, OG Description, OG Image)
- **Twitter Card** fields
- **Canonical URL** input
- **Schema.org** structured data preview
- **SEO Score** indicator with recommendations
- **Preview** of how it appears in Google search results
- **Validation** - Duplicates check, keyword density

### Props Interface:

```typescript
interface SeoFieldsGroupProps {
  initialData?: SeoData;
  onChange: (data: SeoData) => void;
  autoGenerateFromTitle?: boolean; // Auto-fill slug, og:title
  showAdvanced?: boolean; // Show OG, Twitter, Schema fields
  showPreview?: boolean; // Show Google search preview
  entityType?: "product" | "category" | "blog" | "page"; // For Schema.org
  baseUrl?: string; // For slug preview
}

interface SeoData {
  metaTitle: string;
  metaDescription: string;
  slug: string;
  keywords: string[];
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterCard?: "summary" | "summary_large_image";
  canonicalUrl?: string;
  schema?: Record<string, any>; // Schema.org JSON-LD
}
```

### UI Design:

```
┌─────────────────────────────────────────────────────────┐
│  🔍 SEO Settings                           [Auto-Fill]   │
├─────────────────────────────────────────────────────────┤
│  Meta Title *                                [55/60] ✅  │
│  [_____________________________________________]          │
│                                                          │
│  Meta Description *                         [158/160] ✅ │
│  [_____________________________________________]          │
│  [_____________________________________________]          │
│                                                          │
│  URL Slug *                              justforview.in/ │
│  [product-name-here______________________]               │
│  🔗 Preview: justforview.in/product-name-here            │
│                                                          │
│  Keywords (SEO)                         [+ Add Keyword]  │
│  [electronics] [mobile] [smartphone] [android]           │
│                                                          │
│  ┌─ Google Search Preview ────────────────────┐         │
│  │ justforview.in › product-name-here          │         │
│  │ Product Name Here - Best Product | Just...  │         │
│  │ This is how your meta description will...   │         │
│  └─────────────────────────────────────────────┘         │
│                                                          │
│  [▼ Advanced SEO Settings]                               │
│   ├─ Open Graph (Facebook/LinkedIn)                     │
│   ├─ Twitter Card                                       │
│   └─ Structured Data (Schema.org)                       │
│                                                          │
│  SEO Score: 85/100 🟢 Good                              │
│  ✅ Title length optimal                                │
│  ✅ Meta description length optimal                     │
│  ⚠️  Add more keywords (recommended 5-10)               │
└─────────────────────────────────────────────────────────┘
```

### Animation Style:

- Character counter: Color changes (green → yellow → red)
- Auto-fill: Smooth fade-in of generated content
- Preview: Real-time update with typing debounce

---

## 4. 🗂️ Smart Category Selector

**File:** `SmartCategorySelector.tsx` (< 250 lines)

### Features (Your Requirements):

- **Show Only Leaf Nodes** toggle - Display only final categories (no children)
- **Show All Categories** toggle - Display entire tree
- **Auto-Include Category SEO** checkbox - Inherit parent category SEO data
- **Auto-Include All Parents** checkbox - Automatically select parent categories
- **Search** with highlighting
- **Tree View** with expand/collapse
- **Breadcrumb Path** showing selected category hierarchy
- **Multi-Select Mode** for tags/related categories
- **Quick Filters** - Recent, Popular, By Department
- **Category Preview** - Show category details on hover
- **Validation** - Ensure leaf node selection when required

### Props Interface:

```typescript
interface SmartCategorySelectorProps {
  mode?: "single" | "multi"; // Default: single
  onSelect: (categories: SelectedCategory[]) => void;
  initialSelected?: SelectedCategory[];
  requireLeafNode?: boolean; // Default: true
  showControls?: boolean; // Show filter toggles - Default: true
  enableSeoInheritance?: boolean; // Default: true
  maxSelections?: number; // For multi mode
  placeholder?: string;
}

interface SelectedCategory {
  id: string;
  name: string;
  slug: string;
  path: string[]; // ['Electronics', 'Mobile', 'Smartphones']
  isLeaf: boolean;
  parentIds: string[];
  seoData?: CategorySeoData; // If inherited
}

interface CategorySeoData {
  keywords: string[];
  metaTitle?: string;
  metaDescription?: string;
}
```

### UI Design:

```
┌─────────────────────────────────────────────────────────┐
│  🗂️  Select Product Category *                          │
├─────────────────────────────────────────────────────────┤
│  [🔍 Search categories...]                               │
│                                                          │
│  View Options:                                          │
│  ☑️ Show Only Leaf Categories (final categories)         │
│  ☐ Show All Categories (including parents)              │
│                                                          │
│  Auto-Fill Options:                                     │
│  ☑️ Auto-include category SEO keywords                   │
│  ☑️ Auto-select all parent categories                    │
│                                                          │
│  ┌─────────────────────────────────────────┐            │
│  │ 📦 Electronics                      [▼] │            │
│  │   ├─ 📱 Mobile & Accessories         [▼] │            │
│  │   │   ├─ Smartphones                ✓  │ ← Selected  │
│  │   │   ├─ Feature Phones                 │            │
│  │   │   └─ Mobile Accessories             │            │
│  │   ├─ 💻 Laptops & Computers          [▼] │            │
│  │   └─ 📷 Cameras                         │            │
│  │ 👕 Fashion                          [▼] │            │
│  └─────────────────────────────────────────┘            │
│                                                          │
│  Selected Path:                                         │
│  Electronics > Mobile & Accessories > Smartphones       │
│                                                          │
│  📋 Inherited SEO Keywords (3):                         │
│  [electronics] [mobile] [smartphone]     [Clear]        │
│                                                          │
│  ℹ️ This category is a leaf node (final category) ✓     │
└─────────────────────────────────────────────────────────┘
```

### Advanced Features:

**Quick Filters Bar:**

```
[🕐 Recent] [⭐ Popular] [👔 Fashion] [💻 Electronics] [🏠 Home]
```

**Multi-Select Mode:**

```
Selected Categories (3/5):
[Electronics > Smartphones ×] [Fashion > T-Shirts ×] [Books ×]
```

### Animation Style:

- Tree expand/collapse: Smooth height transition
- Category hover: Subtle background highlight with left border accent
- Selection: Checkmark fade-in with scale animation
- Search: Highlight matched text with yellow background

---

## 5. 🎨 Modern Data Table Component

**File:** `ModernDataTable.tsx` (< 300 lines)

### Features:

- **Sortable Columns** with multi-sort support
- **Resizable Columns** with drag handles
- **Column Visibility** toggle
- **Row Selection** with checkbox (single/multi)
- **Bulk Actions** toolbar when rows selected
- **Pagination** with page size options
- **Search & Filters** with column-specific filters
- **Responsive** - Card view on mobile
- **Loading States** - Skeleton rows
- **Empty State** with illustration
- **Row Actions Menu** (three dots)
- **Expandable Rows** for details
- **Sticky Header** on scroll
- **Export** to CSV/Excel
- **Virtualization** for large datasets (10,000+ rows)

### Props Interface:

```typescript
interface ModernDataTableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  totalRows?: number; // For server-side pagination
  pageSize?: number; // Default: 20
  onPageChange?: (page: number, pageSize: number) => void;
  onSort?: (column: string, direction: "asc" | "desc") => void;
  selectable?: boolean; // Default: false
  onRowSelect?: (selectedRows: T[]) => void;
  bulkActions?: BulkAction[];
  rowActions?: RowAction<T>[];
  expandableRows?: boolean;
  renderExpandedRow?: (row: T) => React.ReactNode;
  emptyState?: React.ReactNode;
  stickyHeader?: boolean; // Default: true
  virtualized?: boolean; // For 10k+ rows
}

interface TableColumn<T> {
  key: string;
  label: string;
  sortable?: boolean;
  resizable?: boolean;
  width?: number | string;
  minWidth?: number;
  hidden?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
  filterType?: "text" | "select" | "date" | "number" | "boolean";
  filterOptions?: Array<{ label: string; value: any }>;
}

interface BulkAction {
  label: string;
  icon?: React.ReactNode;
  onClick: (selectedRows: any[]) => void;
  variant?: "default" | "danger" | "success";
}

interface RowAction<T> {
  label: string;
  icon?: React.ReactNode;
  onClick: (row: T) => void;
  hidden?: (row: T) => boolean;
  variant?: "default" | "danger";
}
```

### UI Design:

```
┌─────────────────────────────────────────────────────────────────┐
│  Products                                     [🔍] [⚙️] [Export] │
├─────────────────────────────────────────────────────────────────┤
│  [Search products...]           [Status ▼] [Category ▼] [Clear] │
│                                                                  │
│  ☑️ 3 items selected                                             │
│  [🗑️ Delete] [✅ Approve] [📤 Export Selected]                  │
│                                                                  │
│  ┌──┬────────────┬──────────┬─────────┬────────┬────────┬────┐ │
│  │☑️│ Product ↑  │ Category │  Price  │ Status │  Date  │ ⋮  │ │
│  ├──┼────────────┼──────────┼─────────┼────────┼────────┼────┤ │
│  │☑️│ iPhone 15  │ Mobile   │ ₹79,999 │🟢Active│ Oct 30 │ ⋮  │ │
│  │☐│ MacBook    │ Laptop   │₹1,29,000│🟡Review│ Oct 29 │ ⋮  │ │
│  │☑️│ AirPods    │ Audio    │ ₹24,999 │🟢Active│ Oct 28 │ ⋮  │ │
│  └──┴────────────┴──────────┴─────────┴────────┴────────┴────┘ │
│                                                                  │
│  Showing 1-20 of 156           [< Prev]  1 2 3 ... 8  [Next >]  │
│  Show: [20 ▼] per page                                          │
└─────────────────────────────────────────────────────────────────┘
```

### Mobile Responsive (< 768px):

```
┌──────────────────────────────────────┐
│  Products              [🔍] [Filter] │
├──────────────────────────────────────┤
│  ┌────────────────────────────────┐  │
│  │ ☑️ iPhone 15 Pro Max          ⋮│  │
│  │ Mobile | ₹79,999                │  │
│  │ 🟢 Active • Oct 30, 2024       │  │
│  └────────────────────────────────┘  │
│  ┌────────────────────────────────┐  │
│  │ ☐ MacBook Pro M3              ⋮│  │
│  │ Laptop | ₹1,29,000              │  │
│  │ 🟡 Under Review • Oct 29       │  │
│  └────────────────────────────────┘  │
└──────────────────────────────────────┘
```

### Animation Style:

- Row hover: Subtle background change with left accent border
- Sort icon: Rotate animation
- Checkbox: Scale bounce on select
- Bulk actions toolbar: Slide down from top
- Loading: Shimmer skeleton rows

---

## 6. 📝 Modern Form Components

**File:** `ModernFormField.tsx` (< 150 lines)

### Features:

- **Smart Input** - Auto-detect type, formatting
- **Floating Labels** - Modern material design style
- **Inline Validation** - Real-time with icons
- **Helper Text** - Below field with character count
- **Error States** - Red border, shake animation
- **Success States** - Green border, checkmark
- **Prefix/Suffix** - Icons, currency symbols, units
- **Loading State** - For async validation
- **Copy Button** - For read-only fields
- **Password Toggle** - Show/hide password
- **Rich Text Editor** - For description fields
- **Date Picker** - Modern calendar with range support
- **Color Picker** - With preset swatches
- **File Upload** - Drag & drop with preview

### Component Variants:

```typescript
// Text Input
<FormField
  label="Product Name"
  type="text"
  value={name}
  onChange={setName}
  required
  minLength={3}
  maxLength={100}
  placeholder="Enter product name"
  helperText="Use descriptive names for better SEO"
/>

// Number Input with Prefix/Suffix
<FormField
  label="Price"
  type="number"
  value={price}
  onChange={setPrice}
  prefix="₹"
  suffix="INR"
  min={0}
  step={0.01}
/>

// Select Dropdown
<FormField
  label="Status"
  type="select"
  value={status}
  onChange={setStatus}
  options={[
    { label: "Active", value: "active" },
    { label: "Draft", value: "draft" },
  ]}
/>

// Textarea with Character Counter
<FormField
  label="Description"
  type="textarea"
  value={description}
  onChange={setDescription}
  rows={5}
  maxLength={500}
  showCharacterCount
/>

// Toggle Switch
<FormField
  label="Published"
  type="switch"
  checked={published}
  onChange={setPublished}
  helperText="Make product visible to customers"
/>

// Rich Text Editor
<FormField
  label="Product Description"
  type="richtext"
  value={description}
  onChange={setDescription}
  toolbar={["bold", "italic", "link", "list"]}
/>
```

### UI Design (Text Input):

```
┌─────────────────────────────────────┐
│  Product Name *                     │
│  ┌───────────────────────────────┐  │
│  │ iPhone 15 Pro Max           ✓│  │
│  └───────────────────────────────┘  │
│  Use descriptive names for SEO      │
│  45/100 characters                  │
└─────────────────────────────────────┘
```

### Animation Style:

- Label: Float up on focus
- Validation: Checkmark fade-in, shake on error
- Character count: Color changes near limit

---

## 7. 🎭 Modern Modal/Dialog Component

**File:** `ModernModal.tsx` (< 180 lines)

### Features:

- **Backdrop Blur** - Glassmorphism effect
- **Smooth Animations** - Fade + scale entrance
- **Draggable** - Optional drag to reposition
- **Resizable** - For large content
- **Multiple Sizes** - sm, md, lg, xl, full
- **Scrollable Content** - Fixed header/footer
- **Close Methods** - X button, ESC key, backdrop click
- **Confirmation Dialogs** - Quick helpers
- **Loading State** - For async actions
- **Footer Actions** - Flexible button layout
- **Stacking** - Multiple modals support

### Props Interface:

```typescript
interface ModernModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  children: React.ReactNode;
  footer?: React.ReactNode;
  showCloseButton?: boolean; // Default: true
  closeOnBackdrop?: boolean; // Default: true
  closeOnEscape?: boolean; // Default: true
  draggable?: boolean;
  loading?: boolean;
  className?: string;
}
```

### UI Design:

```
┌─────────────────────────────────────────────────────────┐
│                    [Backdrop Blur]                      │
│  ┌───────────────────────────────────────────────────┐  │
│  │ Edit Product                                  [×] │  │
│  ├───────────────────────────────────────────────────┤  │
│  │                                                   │  │
│  │  [Modal Content Here]                            │  │
│  │  Scrollable if content exceeds viewport          │  │
│  │                                                   │  │
│  │                                                   │  │
│  ├───────────────────────────────────────────────────┤  │
│  │                     [Cancel]  [Save Changes]     │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Animation Style:

- Enter: Fade opacity 0→1, scale 0.95→1
- Exit: Fade opacity 1→0, scale 1→0.95
- Backdrop: Blur increase with fade

---

## 8. 🔔 Modern Toast Notifications

**File:** `ModernToast.tsx` (< 120 lines)

### Features:

- **Multiple Variants** - Success, Error, Warning, Info
- **Auto-Dismiss** - Configurable timeout
- **Stacking** - Multiple toasts at once
- **Progress Bar** - Visual countdown
- **Icons** - Contextual icons per variant
- **Actions** - Undo, Retry buttons
- **Positioning** - Top/bottom, left/right/center
- **Sound Effects** - Optional audio cues
- **Animations** - Slide-in from edge

### Usage:

```typescript
import { toast } from "@/components/ui/admin-seller/ModernToast";

// Success toast
toast.success("Product created successfully!", {
  duration: 3000,
  action: {
    label: "View",
    onClick: () => router.push(`/seller/products/${id}`),
  },
});

// Error toast
toast.error("Failed to save changes", {
  duration: 5000,
  action: {
    label: "Retry",
    onClick: () => handleSave(),
  },
});

// Loading toast (dismissible manually)
const loadingToast = toast.loading("Uploading images...");
// Later: toast.dismiss(loadingToast);

// Promise toast (auto-resolves)
toast.promise(uploadImages(), {
  loading: "Uploading...",
  success: "Images uploaded!",
  error: "Upload failed",
});
```

### UI Design:

```
                                    ┌────────────────────────────┐
                                    │ ✓ Product saved!     [×]   │
                                    │ ▓▓▓▓▓▓░░░░░░░░░░░░         │
                                    └────────────────────────────┘
                                    ┌────────────────────────────┐
                                    │ ⚠️ Stock is low      [×]   │
                                    │ [View Details]             │
                                    └────────────────────────────┘
```

---

## 9. 📊 Modern Stats Cards

**File:** `ModernStatsCard.tsx` (< 100 lines)

### Features:

- **Gradient Backgrounds** - Vibrant, modern colors
- **Trend Indicators** - Up/down arrows with percentage
- **Comparison Period** - "vs last month"
- **Mini Charts** - Sparkline graphs
- **Icons** - Contextual icons
- **Loading Skeleton** - Smooth loading state
- **Hover Effects** - Lift shadow, scale
- **Click Actions** - Navigate to details

### UI Design:

```
┌────────────────────────────────┐  ┌────────────────────────────────┐
│ 💰 Total Revenue      [📈]    │  │ 🛍️ Total Orders       [📊]    │
│                               │  │                               │
│ ₹2,45,890                    │  │ 1,234                        │
│ ▲ +12.5% vs last month       │  │ ▼ -2.3% vs last month        │
│ ▁▂▃▅▄▆█ (mini sparkline)     │  │ █▆▇▅▆▄▃ (mini sparkline)     │
└────────────────────────────────┘  └────────────────────────────────┘
```

### Animation Style:

- Hover: Lift shadow, scale(1.02)
- Number counter: Animated count-up on mount
- Trend arrow: Pulse animation

---

## 10. 🎯 Modern Page Header

**File:** `ModernPageHeader.tsx` (< 150 lines)

### Features:

- **Breadcrumbs** with icons
- **Page Title** with optional badge
- **Description** text
- **Action Buttons** - Primary, secondary, dropdown
- **Tabs** integration
- **Search Bar** inline
- **Filters Toggle** button
- **Responsive** - Stack on mobile

### UI Design:

```
┌─────────────────────────────────────────────────────────────────┐
│  Home > Seller > Products                                       │
│                                                                  │
│  📦 Products Management                            [+ Add New]  │
│  Manage your product catalog, inventory, and pricing            │
│                                                                  │
│  ┌─────┬─────────┬────────┬─────────┐  [🔍 Search] [Filter ▼] │
│  │ All │ Active  │ Draft  │ Pending │                          │
│  └─────┴─────────┴────────┴─────────┘                          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎨 Modern Design Tokens

### Color Palette (2025 Vibrant):

```css
/* Primary */
--primary-50: #eff6ff;
--primary-500: #3b82f6; /* Main blue */
--primary-600: #2563eb;
--primary-700: #1d4ed8;

/* Success */
--success-500: #10b981;
--success-600: #059669;

/* Warning */
--warning-500: #f59e0b;

/* Error */
--error-500: #ef4444;
--error-600: #dc2626;

/* Gradients */
--gradient-primary: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
--gradient-success: linear-gradient(135deg, #0093e9 0%, #80d0c7 100%);
--gradient-sunset: linear-gradient(135deg, #fa709a 0%, #fee140 100%);

/* Glassmorphism */
--glass-bg: rgba(255, 255, 255, 0.1);
--glass-border: rgba(255, 255, 255, 0.2);
--backdrop-blur: blur(10px);
```

### Shadows (Layered Depth):

```css
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1);
--shadow-glow: 0 0 20px rgba(59, 130, 246, 0.5);
```

### Typography:

```css
/* Font: Inter or Geist Sans */
--font-sans: "Inter", system-ui, sans-serif;

/* Sizes */
--text-xs: 0.75rem; /* 12px */
--text-sm: 0.875rem; /* 14px */
--text-base: 1rem; /* 16px */
--text-lg: 1.125rem; /* 18px */
--text-xl: 1.25rem; /* 20px */
--text-2xl: 1.5rem; /* 24px */
--text-3xl: 1.875rem; /* 30px */

/* Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### Spacing (Consistent 4px base):

```css
--space-1: 0.25rem; /* 4px */
--space-2: 0.5rem; /* 8px */
--space-3: 0.75rem; /* 12px */
--space-4: 1rem; /* 16px */
--space-6: 1.5rem; /* 24px */
--space-8: 2rem; /* 32px */
--space-12: 3rem; /* 48px */
```

### Border Radius (Smooth Corners):

```css
--radius-sm: 0.375rem; /* 6px */
--radius-md: 0.5rem; /* 8px */
--radius-lg: 0.75rem; /* 12px */
--radius-xl: 1rem; /* 16px */
--radius-2xl: 1.5rem; /* 24px */
--radius-full: 9999px;
```

---

## 🎬 Animation Library

### Framer Motion Variants:

```typescript
// Fade In Up (for modals, cards)
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" },
  },
};

// Scale Bounce (for buttons, checkboxes)
const scaleBounce = {
  tap: { scale: 0.95 },
  hover: { scale: 1.05, transition: { duration: 0.2 } },
};

// Slide In From Right (for drawers, sidebars)
const slideInRight = {
  hidden: { x: "100%" },
  visible: {
    x: 0,
    transition: { type: "spring", damping: 25, stiffness: 200 },
  },
};

// Stagger Children (for lists)
const staggerContainer = {
  visible: {
    transition: { staggerChildren: 0.1 },
  },
};
```

---

## 📁 File Structure

```
src/components/ui/admin-seller/
├── ImageEditor.tsx                 (250 lines)
├── VideoUploadWithThumbnail.tsx    (280 lines)
├── SeoFieldsGroup.tsx              (200 lines)
├── SmartCategorySelector.tsx       (250 lines)
├── ModernDataTable.tsx             (300 lines)
├── ModernFormField.tsx             (150 lines)
├── ModernModal.tsx                 (180 lines)
├── ModernToast.tsx                 (120 lines)
├── ModernStatsCard.tsx             (100 lines)
├── ModernPageHeader.tsx            (150 lines)
├── ModernTabs.tsx                  (100 lines)
├── ModernBadge.tsx                 (60 lines)
├── ModernButton.tsx                (80 lines)
├── ModernDropdown.tsx              (120 lines)
├── ModernSkeleton.tsx              (80 lines)
└── index.ts                        (exports)
```

---

## 🚀 Implementation Priority

### Phase 1: Core Components (Week 1)

1. **ModernFormField** - Foundation for all forms
2. **ModernButton** - Used everywhere
3. **ModernToast** - Essential feedback mechanism
4. **ModernModal** - Critical for workflows

### Phase 2: Specialized Components (Week 2)

5. **SmartCategorySelector** - Core business logic
6. **SeoFieldsGroup** - Essential for content creation
7. **ImageEditor** - Media management
8. **VideoUploadWithThumbnail** - Media management

### Phase 3: Advanced Components (Week 3)

9. **ModernDataTable** - Complex but reusable
10. **ModernPageHeader** - Consistency across pages
11. **ModernStatsCard** - Dashboard components
12. Remaining utility components

---

## ✅ Quality Checklist Per Component

- [ ] TypeScript interfaces fully typed
- [ ] Props validation with defaults
- [ ] Accessibility (ARIA labels, keyboard nav)
- [ ] Dark mode support
- [ ] Mobile responsive (< 768px)
- [ ] Loading states
- [ ] Error states
- [ ] Empty states
- [ ] Animation with Framer Motion
- [ ] Unit tests (Jest + React Testing Library)
- [ ] Storybook documentation
- [ ] Performance optimized (React.memo, useMemo)
- [ ] Zero console errors/warnings
- [ ] Example usage in docs

---

## 🎯 Next Steps

1. **Review & Approve** this spec document
2. **Create Component Library Folder** structure
3. **Implement Phase 1** components (4 components, ~1 week)
4. **Test & Document** each component
5. **Start Migration** using new components
6. **Iterate & Improve** based on usage feedback

---

**Estimated Time:**

- Phase 1 (Core): 40-50 hours
- Phase 2 (Specialized): 50-60 hours
- Phase 3 (Advanced): 40-50 hours
- **Total: 130-160 hours** (3-4 weeks with 1-2 developers)

---

**Last Updated:** November 1, 2025
