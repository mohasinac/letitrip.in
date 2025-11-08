# Phase 5.4: Homepage Management - Quick Reference

**Status:** ✅ COMPLETE | **Date:** November 8, 2025

---

## 🎯 Quick Overview

Phase 5.4 adds admin controls for homepage content:

- **Hero Slides:** Carousel slides at top of homepage
- **Featured Sections:** Curated content blocks (categories/shops/products/auctions)

---

## 📁 File Structure

```
/src
  /app
    /api/admin
      /hero-slides
        route.ts                    # GET (list), POST (create)
        /[id]
          route.ts                  # GET, PATCH, DELETE
        /reorder
          route.ts                  # POST (reorder)
      /featured-sections
        route.ts                    # GET (list), POST (create)
        /[id]
          route.ts                  # GET, PATCH, DELETE
        /reorder
          route.ts                  # POST (reorder)
    /admin
      /hero-slides
        page.tsx                    # List with drag-drop
        /create
          page.tsx                  # Create form
        /[id]
          /edit
            page.tsx                # Edit form
      /featured-sections
        page.tsx                    # List with drag-drop
  /constants
    database.ts                     # +HERO_SLIDES, +FEATURED_SECTIONS
```

---

## 🔌 API Endpoints

### Hero Slides

| Method | Endpoint                         | Description                           |
| ------ | -------------------------------- | ------------------------------------- |
| GET    | `/api/admin/hero-slides`         | List all slides (ordered by position) |
| POST   | `/api/admin/hero-slides`         | Create new slide                      |
| GET    | `/api/admin/hero-slides/[id]`    | Get slide details                     |
| PATCH  | `/api/admin/hero-slides/[id]`    | Update slide                          |
| DELETE | `/api/admin/hero-slides/[id]`    | Delete slide                          |
| POST   | `/api/admin/hero-slides/reorder` | Reorder slides                        |

**Request Body (POST/PATCH):**

```json
{
  "title": "Summer Sale",
  "subtitle": "Up to 70% Off",
  "description": "Limited time offer",
  "image_url": "https://...",
  "link_url": "/categories/summer-sale",
  "cta_text": "Shop Now",
  "is_active": true
}
```

**Reorder Body:**

```json
{
  "slides": [
    { "id": "slide1", "position": 1 },
    { "id": "slide2", "position": 2 }
  ]
}
```

---

### Featured Sections

| Method | Endpoint                               | Description                             |
| ------ | -------------------------------------- | --------------------------------------- |
| GET    | `/api/admin/featured-sections`         | List all sections (ordered by position) |
| POST   | `/api/admin/featured-sections`         | Create new section                      |
| GET    | `/api/admin/featured-sections/[id]`    | Get section details                     |
| PATCH  | `/api/admin/featured-sections/[id]`    | Update section                          |
| DELETE | `/api/admin/featured-sections/[id]`    | Delete section                          |
| POST   | `/api/admin/featured-sections/reorder` | Reorder sections                        |

**Request Body (POST/PATCH):**

```json
{
  "title": "Featured Categories",
  "subtitle": "Shop by Category",
  "type": "categories",
  "item_ids": ["cat1", "cat2", "cat3"],
  "layout": "grid",
  "max_items": 8,
  "is_active": true
}
```

**Section Types:**

- `categories` - Featured categories
- `shops` - Featured shops
- `products` - Featured products
- `auctions` - Featured auctions

**Layout Types:**

- `grid` - Grid layout (default)
- `carousel` - Horizontal carousel
- `list` - Vertical list

---

## 🎨 UI Components

### Hero Slides List (`/admin/hero-slides`)

**Features:**

- ✅ Drag-and-drop reordering
- ✅ Image preview thumbnails
- ✅ Active/Inactive toggle
- ✅ Edit/Delete actions
- ✅ Empty state with CTA

**Actions:**

- **Drag Handle:** Reorder slides
- **Power Icon:** Toggle active/inactive
- **Edit Icon:** Open edit page
- **Trash Icon:** Delete with confirmation

---

### Featured Sections List (`/admin/featured-sections`)

**Features:**

- ✅ Drag-and-drop reordering
- ✅ Type badges (color-coded)
- ✅ Layout indicators (⊞ grid, ⇄ carousel, ☰ list)
- ✅ Item count display
- ✅ Active/Inactive toggle
- ✅ Edit/Delete actions
- ✅ Empty state with CTA

**Type Colors:**

- `categories` → Blue
- `shops` → Green
- `products` → Purple
- `auctions` → Orange

---

## 💾 Database Schema

### hero_slides Collection

```typescript
{
  id: string; // Auto-generated
  title: string; // Required
  subtitle: string; // Optional
  description: string; // Optional
  image_url: string; // Required
  link_url: string; // Optional
  cta_text: string; // Default: "Shop Now"
  position: number; // Auto-assigned
  is_active: boolean; // Default: true
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}
```

### featured_sections Collection

```typescript
{
  id: string;              // Auto-generated
  title: string;           // Required
  subtitle: string;        // Optional
  type: string;            // 'categories' | 'shops' | 'products' | 'auctions'
  item_ids: string[];      // Array of IDs
  layout: string;          // 'grid' | 'carousel' | 'list'
  max_items: number;       // Default: 8
  position: number;        // Auto-assigned
  is_active: boolean;      // Default: true
  created_at: string;      // ISO timestamp
  updated_at: string;      // ISO timestamp
}
```

---

## 🔧 Usage Examples

### Creating a Hero Slide

```typescript
// From /admin/hero-slides/create
const handleSubmit = async (e) => {
  e.preventDefault();

  await apiService.post("/api/admin/hero-slides", {
    title: "Summer Sale",
    subtitle: "Up to 70% Off",
    description: "Limited time offer on all summer items",
    image_url: "https://storage.example.com/hero1.jpg",
    link_url: "/categories/summer-sale",
    cta_text: "Shop Now",
    is_active: true,
  });

  router.push("/admin/hero-slides");
};
```

### Reordering Slides

```typescript
// From /admin/hero-slides (drag-drop)
const handleDrop = async (draggedId, targetId) => {
  // Reorder locally
  const newSlides = reorderArray(slides, draggedId, targetId);
  setSlides(newSlides);

  // Save to backend
  await apiService.post("/api/admin/hero-slides/reorder", {
    slides: newSlides.map((s) => ({ id: s.id, position: s.position })),
  });
};
```

### Creating a Featured Section

```typescript
// Create featured categories section
await apiService.post("/api/admin/featured-sections", {
  title: "Popular Categories",
  subtitle: "Shop by Category",
  type: "categories",
  item_ids: ["electronics", "fashion", "home"],
  layout: "grid",
  max_items: 6,
  is_active: true,
});
```

---

## 🎯 Navigation

**Admin Sidebar:**

```
📊 Dashboard
👥 User Management
📁 Category Management
🏪 Shop Management
📦 Product Management
🛒 Order Management
🖼️ Homepage Management
   ├─ Hero Slides        → /admin/hero-slides
   └─ Featured Sections  → /admin/featured-sections
📈 Analytics & Reports
⚙️ Platform Settings
```

---

## ✅ Completion Checklist

### Phase 5.4 Tasks

- [x] Hero Slides API (GET, POST, PATCH, DELETE, reorder)
- [x] Hero Slides List Page (drag-drop, toggle, actions)
- [x] Hero Slides Create Page (form with image upload)
- [x] Hero Slides Edit Page (form with image upload, delete)
- [x] Featured Sections API (GET, POST, PATCH, DELETE, reorder)
- [x] Featured Sections List Page (drag-drop, toggle, actions)
- [x] Database constants (HERO_SLIDES, FEATURED_SECTIONS)
- [x] Documentation updates (PROJECT_STATUS.md, PENDING_TASKS.md)
- [x] Completion report (PHASE_5.4_COMPLETION.md)
- [x] Quick reference guide (this file)

---

## 🚀 Next Steps

**Phase 5 is 100% Complete!** 🎉

**Recommended Next:**

1. **Phase 3 Polish:** Complete seller dashboard features

   - Orders management pages
   - Returns & refunds pages
   - Revenue/payout pages
   - Support tickets pages

2. **Phase 6 Enhancements:** Improve customer experience
   - Search functionality
   - Wishlist/favorites enhancements
   - Review submission
   - Recommendations engine

---

**Project Progress:** 80% → 81% ✅
