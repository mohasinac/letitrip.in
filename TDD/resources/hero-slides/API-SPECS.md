# Hero Slides Resource - API Specifications

## Overview

Homepage hero slider management APIs.

---

## Endpoints

### Public Endpoints

#### GET /api/hero-slides

Get active hero slides.

**Response (200)**:

```json
{
  "success": true,
  "data": [
    {
      "id": "slide_001",
      "title": "Summer Sale",
      "subtitle": "Up to 50% off on electronics",
      "image": "https://...",
      "mobileImage": "https://...",
      "link": "/categories/electronics",
      "linkText": "Shop Now",
      "backgroundColor": "#1a365d",
      "textColor": "#ffffff",
      "sortOrder": 1,
      "isActive": true
    }
  ]
}
```

---

### Admin Endpoints

#### GET /api/admin/hero-slides

List all hero slides (including inactive).

---

#### POST /api/admin/hero-slides

Create hero slide.

**Request Body**:

```json
{
  "title": "Summer Sale",
  "subtitle": "Up to 50% off on electronics",
  "image": "https://...",
  "mobileImage": "https://...",
  "link": "/categories/electronics",
  "linkText": "Shop Now",
  "backgroundColor": "#1a365d",
  "textColor": "#ffffff",
  "sortOrder": 1,
  "isActive": true,
  "startDate": "2024-11-01T00:00:00Z",
  "endDate": "2024-11-30T23:59:59Z"
}
```

---

#### PATCH /api/admin/hero-slides/:id

Update hero slide.

---

#### DELETE /api/admin/hero-slides/:id

Delete hero slide.

---

#### PATCH /api/admin/hero-slides/reorder

Reorder hero slides.

**Request Body**:

```json
{
  "orders": [
    { "id": "slide_001", "sortOrder": 1 },
    { "id": "slide_002", "sortOrder": 2 }
  ]
}
```

---

## RBAC Permissions

| Endpoint                         | Guest | User | Seller | Admin |
| -------------------------------- | ----- | ---- | ------ | ----- |
| GET /hero-slides                 | ✅    | ✅   | ✅     | ✅    |
| GET /admin/hero-slides           | ❌    | ❌   | ❌     | ✅    |
| POST /admin/hero-slides          | ❌    | ❌   | ❌     | ✅    |
| PATCH /admin/hero-slides/:id     | ❌    | ❌   | ❌     | ✅    |
| DELETE /admin/hero-slides/:id    | ❌    | ❌   | ❌     | ✅    |
| PATCH /admin/hero-slides/reorder | ❌    | ❌   | ❌     | ✅    |

---

## Service Usage

```typescript
import { homepageService } from "@/services";

// Public
const slides = await homepageService.getHeroSlides();

// Admin
const allSlides = await homepageService.getHeroSlidesAdmin();
await homepageService.createHeroSlide({
  title: "Summer Sale",
  image: "https://...",
  link: "/categories/electronics",
  isActive: true,
});
await homepageService.updateHeroSlide("slide_001", { title: "Updated Title" });
await homepageService.deleteHeroSlide("slide_001");
await homepageService.reorderHeroSlides([{ id: "slide_001", sortOrder: 1 }]);
```

---

## Scheduling

Hero slides support scheduling with `startDate` and `endDate`:

- Slides automatically become active when `startDate` is reached
- Slides automatically become inactive when `endDate` is passed
- Both dates are optional
- If both are null, slide is always active (if `isActive: true`)
