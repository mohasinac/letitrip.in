# Hero Slides Fix

## Current State

**Status**: ✅ COMPLETE - Field naming standardized, services properly transform data

### Issues Fixed

1. **Field Name Inconsistency** ✅

   - Service now transforms camelCase ↔ snake_case between frontend and API
   - Create/edit pages use camelCase consistently
   - API stores snake_case in database

2. **API Response Mismatch** ✅

   - `hero-slides.service.ts` has `toApiFormat()` and `fromApiFormat()` transformers
   - `homepage.service.ts` has `transformSlide()` for public carousel
   - Both properly handle snake_case API → camelCase frontend

3. **Carousel Respects API Data** ✅
   - HeroCarousel uses `homepageService.getHeroSlides()`
   - Properly transforms API response to expected format

---

## Implementation Completed

### Phase 1: Fix Field Names ✅

- [x] Create page uses camelCase: `image`, `ctaLink`, `ctaText`, `isActive`
- [x] Edit page uses camelCase matching create page
- [x] Service transforms to snake_case for API: `image_url`, `link_url`, `cta_text`, `is_active`

### Phase 2: Service Transformation ✅

- [x] `hero-slides.service.ts` - Added `toApiFormat()` and `fromApiFormat()`
- [x] `homepage.service.ts` - Added `transformSlide()` for public carousel
- [x] Both services handle both naming conventions in responses

### Phase 3: Carousel Integration ✅

- [x] HeroCarousel fetches from `homepageService.getHeroSlides()`
- [x] Response properly transformed to `HeroSlide` interface

---

## Standardized Field Names

**Frontend (camelCase):**

```typescript
interface HeroSlideFormData {
  title: string;
  subtitle?: string;
  description?: string;
  image: string; // Frontend field name
  ctaText: string; // Frontend field name
  ctaLink: string; // Frontend field name
  isActive: boolean; // Frontend field name
  order: number; // Frontend field name
}
```

**API/Database (snake_case):**

```typescript
interface HeroSlideDB {
  title: string;
  subtitle?: string;
  description?: string;
  image_url: string; // Database field name
  cta_text: string; // Database field name
  link_url: string; // Database field name
  is_active: boolean; // Database field name
  position: number; // Database field name
}
```

---

## Files Changed

1. `src/services/hero-slides.service.ts` - Added `toApiFormat()`, `fromApiFormat()` transformers
2. `src/services/homepage.service.ts` - Added `transformSlide()` for public response
3. `src/app/admin/hero-slides/create/page.tsx` - Changed to camelCase fields
4. `src/app/admin/hero-slides/[id]/edit/page.tsx` - Changed to camelCase fields
