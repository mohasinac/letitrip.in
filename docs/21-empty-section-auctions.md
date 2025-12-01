# Doc 21: Empty Section Fallback UI - Auctions

> **Status**: ✅ Complete
> **Priority**: Medium
> **Last Updated**: December 2025

## Problem

The auction detail page (`/auctions/[slug]`) conditionally rendered "More from this shop" and "Similar Auctions" sections only when items existed. This caused sections to disappear entirely when empty.

## Solution

Changed conditional rendering to always show sections with fallback empty state cards when no auctions are available.

## Changes Made

### File: `src/app/auctions/[slug]/page.tsx`

Added `Store` icon import:

```tsx
import {
  Gavel,
  Clock,
  Eye,
  Heart,
  Share2,
  Loader2,
  User,
  Calendar,
  AlertCircle,
  TrendingUp,
  Store,
} from "lucide-react";
```

**Shop Auctions Section - Before:**

```tsx
{shopAuctions.length > 0 && (
  <div className="rounded-lg border border-gray-200 bg-white p-6">
    <h2>More from this shop</h2>
    <div className="grid ...">
      {shopAuctions.map(...)}
    </div>
  </div>
)}
```

**After:**

```tsx
<div className="rounded-lg border border-gray-200 bg-white p-6">
  <h2 className="text-xl font-bold text-gray-900 mb-4">
    More from this shop
  </h2>
  {shopAuctions.length > 0 ? (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {shopAuctions.map((a) => (...))}
    </div>
  ) : (
    <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
      <Store className="w-10 h-10 text-gray-400 mb-3" />
      <p className="text-gray-500 mb-4 text-sm">No other auctions from this shop</p>
      <Link
        href="/auctions"
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
      >
        View All Auctions
      </Link>
    </div>
  )}
</div>
```

**Similar Auctions Section - Before:**

```tsx
{
  similarAuctions.length > 0 && (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h2>Similar Auctions</h2>
      ...
    </div>
  );
}
```

**After:**

```tsx
<div className="rounded-lg border border-gray-200 bg-white p-6">
  <h2 className="text-xl font-bold text-gray-900 mb-4">
    Similar Auctions
  </h2>
  {similarAuctions.length > 0 ? (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {similarAuctions.map((a) => (...))}
    </div>
  ) : (
    <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
      <Gavel className="w-10 h-10 text-gray-400 mb-3" />
      <p className="text-gray-500 mb-4 text-sm">No similar auctions available</p>
      <Link
        href="/auctions"
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
      >
        View All Auctions
      </Link>
    </div>
  )}
</div>
```

## Result

- Sections always visible with helpful headers
- Empty states guide users to browse all auctions
- Consistent styling with dashed border cards
- Uses existing Gavel and Store icons appropriately
