# Homepage Dynamic Rendering Implementation

## Overview

The homepage now dynamically renders sections based on the admin homepage settings configuration.

## Changes Made

### 1. Converted Homepage to Client Component

- Added `"use client"` directive
- Imported `useState` and `useEffect` from React
- Imported `homepageSettingsService` and types

### 2. Added Settings State Management

```typescript
const [settings, setSettings] = useState<HomepageSettings | null>(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const loadSettings = async () => {
    try {
      const response = await homepageSettingsService.getSettings();
      setSettings(response.settings);
    } catch (error) {
      console.error("Failed to load homepage settings:", error);
      setSettings(null); // Fallback to show all sections
    } finally {
      setLoading(false);
    }
  };
  loadSettings();
}, []);
```

### 3. Added Loading State

Shows skeleton loaders while fetching settings:

```tsx
if (loading) {
  return (
    <main id="home-page" className="container mx-auto px-4 py-8">
      <div className="space-y-8 animate-pulse">
        <div className="h-96 bg-gray-200 rounded-lg"></div>
        <div className="h-64 bg-gray-200 rounded-lg"></div>
        <div className="h-64 bg-gray-200 rounded-lg"></div>
      </div>
    </main>
  );
}
```

### 4. Conditional Section Rendering

Each section now checks settings before rendering:

#### Always Shown (Not configurable):

- ✅ Welcome Heading
- ✅ Featured Categories Icon Grid
- ✅ Shops Navigation
- ✅ FAQ Section

#### Conditionally Shown (Admin configurable):

- ⚙️ **Hero Carousel**: `settings.heroCarousel.enabled`
- ⚙️ **Value Proposition**: `settings.sections.valueProposition.enabled`
- ⚙️ **Featured Categories**: `settings.sections.featuredCategories.enabled`
- ⚙️ **Featured Products**: `settings.sections.featuredProducts.enabled`
- ⚙️ **Featured Auctions**: `settings.sections.featuredAuctions.enabled`
- ⚙️ **Featured Shops**: `settings.sections.featuredShops.enabled`
- ⚙️ **Featured Blogs**: `settings.sections.featuredBlogs.enabled`
- ⚙️ **Featured Reviews**: `settings.sections.featuredReviews.enabled`

### 5. Fallback Behavior

If settings fail to load or are null, all sections are shown by default:

```tsx
{
  (!settings || settings.heroCarousel.enabled) && (
    <section id="hero-section" className="relative">
      <HeroCarousel />
    </section>
  );
}
```

This ensures the site never breaks if the API is down.

## How It Works

1. **Page Load**: Homepage component mounts
2. **Fetch Settings**: Calls `/api/admin/homepage` to get current settings
3. **Evaluate**: For each section, checks if `enabled` is true
4. **Render**: Only renders sections that are enabled
5. **Fallback**: If API fails, shows all sections (safe default)

## Admin Control

Admins can now control homepage sections via:

- **Admin Panel**: `/admin/homepage` - Toggle switches for each section
- **API**: Direct API calls to update settings
- **Real-time**: Changes reflect immediately on homepage reload

## Benefits

✅ **Dynamic Control**: No code changes needed to show/hide sections
✅ **Performance**: Doesn't fetch data for disabled sections
✅ **A/B Testing**: Easy to test different homepage configurations
✅ **Graceful Degradation**: Site works even if settings API fails
✅ **Admin Friendly**: Visual interface in admin panel

## API Endpoints

### Get Settings

```
GET /api/admin/homepage
Response: { settings: HomepageSettings, isDefault: boolean }
```

### Update Settings

```
PATCH /api/admin/homepage
Body: { settings: Partial<HomepageSettings>, userId?: string }
Response: { settings: HomepageSettings }
```

### Reset to Defaults

```
POST /api/admin/homepage/reset
Response: { settings: HomepageSettings }
```

## Configuration Example

```typescript
{
  heroCarousel: {
    enabled: true,
    autoPlayInterval: 5000
  },
  sections: {
    valueProposition: { enabled: true },
    featuredCategories: {
      enabled: true,
      maxCategories: 5,
      productsPerCategory: 10
    },
    featuredProducts: {
      enabled: true,
      maxProducts: 10
    },
    featuredAuctions: {
      enabled: true,
      maxAuctions: 10
    },
    featuredShops: {
      enabled: true,
      maxShops: 5,
      productsPerShop: 10
    },
    featuredBlogs: {
      enabled: true,
      maxBlogs: 10
    },
    featuredReviews: {
      enabled: true,
      maxReviews: 10
    }
  },
  sectionOrder: [
    "heroCarousel",
    "valueProposition",
    "featuredCategories",
    "featuredProducts",
    "featuredAuctions",
    "featuredShops",
    "featuredBlogs",
    "featuredReviews"
  ]
}
```

## Testing

### Enable/Disable Sections

1. Go to `/admin/homepage`
2. Toggle any section switch
3. Click "Save Changes"
4. Reload homepage to see changes

### Verify Fallback

1. Stop the API server
2. Reload homepage
3. Should show all sections (fallback behavior)

## Next Steps (Optional Enhancements)

### 1. Section Reordering

Implement drag-drop to reorder sections based on `sectionOrder` array

### 2. Individual Section Settings

Pass max limits to each section component:

```tsx
<FeaturedProductsSection
  maxProducts={settings.sections.featuredProducts.maxProducts}
/>
```

### 3. Preview Mode

Add preview feature in admin panel to see changes before publishing

### 4. Scheduled Changes

Allow scheduling section visibility changes (e.g., seasonal campaigns)

### 5. Analytics Integration

Track which sections get most engagement to optimize homepage

## Status

✅ **Complete**: Homepage now dynamically renders based on admin settings
✅ **Tested**: Conditional rendering works correctly
✅ **Fallback**: Safe defaults if API fails
✅ **Admin UI**: Full control panel at `/admin/homepage`

---

**Implementation Date**: November 9, 2025
**Files Modified**:

- `src/app/page.tsx` - Added dynamic rendering
- `src/services/homepage-settings.service.ts` - Already existed
- `src/app/api/admin/homepage/route.ts` - Already existed
