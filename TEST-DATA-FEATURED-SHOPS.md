# Test Data Generation - Featured Shops Update

## Changes Made

Updated the test data generation to ensure **at least 3 featured shops** are always created for the homepage.

### Modified File

- `src/app/api/test-data/generate-complete/route.ts`

### Changes

**Before:**

```typescript
is_verified: Math.random() < 0.7,
is_featured: Math.random() < config.featuredPercentage / 100,
show_on_homepage: Math.random() < config.homepagePercentage / 100,
```

**After:**

```typescript
// Ensure first 3 shops are featured and on homepage
const shouldBeFeatured = shopIndex < 3 || Math.random() < config.featuredPercentage / 100;
const shouldBeOnHomepage = shopIndex < 3 || Math.random() < config.homepagePercentage / 100;

is_verified: true, // Always verify for featured shops
is_featured: shouldBeFeatured,
show_on_homepage: shouldBeOnHomepage,
```

### What This Does

1. **First 3 Shops:**

   - Always `is_featured = true`
   - Always `show_on_homepage = true`
   - Always `is_verified = true`
   - Ensures homepage has content to display

2. **Remaining Shops:**

   - Follow the configured percentage
   - `featuredPercentage` (default: 30%)
   - `homepagePercentage` (default: 20%)

3. **Benefits:**
   - Homepage FeaturedShopsSection will always have data
   - No more empty sections during testing
   - Still maintains variety with random shops

## How to Generate Test Data

### Option 1: Via UI

1. Go to `/test-workflow` page
2. Click **"Test Data Generation"** tab
3. Configure settings (default is fine)
4. Click **"Generate Complete Dummy Data"**
5. Wait for completion

### Option 2: Via API

```bash
curl -X POST http://localhost:3001/api/test-data/generate-complete \
  -H "Content-Type: application/json" \
  -d '{
    "users": 5,
    "shopsPerUser": 1,
    "productsPerShop": 10,
    "auctionsPerShop": 5,
    "featuredPercentage": 30,
    "homepagePercentage": 20
  }'
```

## Expected Result

After generating test data, you should see:

### Homepage Stats

- ✅ At least 3 featured shops
- ✅ At least 3 shops on homepage
- ✅ All featured shops are verified
- ✅ FeaturedShopsSection displays properly

### Test Data Example

```
Featured Shops: 3+ (guaranteed)
Homepage Items: 3+ (guaranteed)
Total Shops: 5 (with 5 users × 1 shop each)
```

## Testing

1. **Clean existing data:**

   ```bash
   # Go to /test-workflow → Danger Zone → Delete All Test Data
   ```

2. **Generate new data:**

   ```bash
   # Click "Generate Complete Dummy Data"
   # Wait for completion (~30 seconds)
   ```

3. **Verify on homepage:**
   ```bash
   # Visit homepage
   # Scroll to "Featured Shops" section
   # Should see 3+ shops with products
   ```

## Configuration

Default configuration in `/test-workflow`:

```typescript
{
  users: 5,                    // 5 test users
  shopsPerUser: 1,             // 1 shop per seller
  productsPerShop: 10,         // 10 products per shop
  auctionsPerShop: 5,          // 5 auctions per shop
  featuredPercentage: 30,      // 30% chance for featured
  homepagePercentage: 20,      // 20% chance for homepage
  heroSlidesCount: 5           // 5 hero slides
}
```

**With the update:**

- First 3 shops: 100% featured + homepage
- Remaining 2 shops: 30% featured, 20% homepage

**Result:**

- Guaranteed: 3 shops on homepage
- Likely: 4-5 shops on homepage (with random percentage)

## API Response

After generation, the API returns:

```json
{
  "success": true,
  "stats": {
    "users": 5,
    "shops": 5,
    "featuredShops": 3+,        // At least 3
    "homepageItems": 3+,        // At least 3
    "products": 50,
    "auctions": 25,
    "reviews": 150,
    // ... more stats
  }
}
```

## Notes

- All test data is prefixed with `TEST_`
- Easy to identify and clean up
- Safe to run multiple times
- Previous data is not deleted (use cleanup first)

## Troubleshooting

### No shops showing on homepage

**Cause:** Firestore indexes still building

**Solution:**

1. Wait 10-15 minutes for indexes
2. Or set `USE_COMPOSITE_INDEXES=false` (already done)

### Empty FeaturedShopsSection

**Cause:** No test data generated yet

**Solution:**

1. Visit `/test-workflow`
2. Generate complete dummy data
3. Refresh homepage

### Shops not verified

**Cause:** Old test data

**Solution:**

1. Clean all test data
2. Regenerate with updated code
3. All new shops will be verified

## Summary

✅ **First 3 shops guaranteed featured**
✅ **First 3 shops guaranteed on homepage**
✅ **All featured shops are verified**
✅ **Homepage will never be empty**
✅ **Easy to test and demo**

Run the data generation and your homepage will be populated with featured shops!
