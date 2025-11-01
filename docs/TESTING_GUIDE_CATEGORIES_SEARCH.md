# Quick Testing Guide - Categories & Search

## 🧪 How to Test the New Features

### Prerequisites

- Development server running: `npm run dev`
- Firebase deployed (indexes + rules) ✅
- Browser with DevTools open

---

## 1️⃣ Test Global Search (Header Integration)

### Steps:

1. **Open any page** (e.g., http://localhost:3000)
2. **Look at the header** - search bar should be visible between logo and navigation (desktop only)
3. **Click the search bar** - dropdown should open
4. **Type "test"** (2+ characters required)
5. **Wait 300ms** - autocomplete results should appear
6. **Check results sections**:
   - Products (with images and prices)
   - Categories (with descriptions)
   - Stores (if any exist)

### Expected Behavior:

- ✅ Search bar appears on desktop (>768px)
- ✅ Search bar hidden on mobile (<768px)
- ✅ Dropdown opens smoothly
- ✅ Results categorized by type
- ✅ Images load for products
- ✅ Dark mode works

### Keyboard Navigation:

- Press **↓** (down arrow) - highlight first result
- Press **↓** again - highlight next result
- Press **↑** (up arrow) - highlight previous result
- Press **Enter** - navigate to selected item
- Press **Escape** - close dropdown

### Recent Searches:

1. Search for "laptop"
2. Click a result or press Enter
3. Click search bar again (empty)
4. Should see "laptop" in recent searches
5. Click "Clear" to remove all

---

## 2️⃣ Test Categories Listing Page

### URL: http://localhost:3000/categories

### Steps:

1. **Navigate to /categories**
2. **Check grid view** - cards with images
3. **Click "List View"** icon - horizontal layout
4. **Type in search box** - filter categories in real-time
5. **Click a category card** - navigate to detail page

### Expected Behavior:

- ✅ Root categories only (no nested children)
- ✅ Featured badge on featured categories
- ✅ Product count displays
- ✅ First 3 subcategories shown
- ✅ Search filters by name and description
- ✅ Grid/list toggle works
- ✅ Empty state if no results

### Test Cases:

- **With data**: Should show all active root categories
- **Search "elec"**: Should show Electronics (if exists)
- **Toggle views**: Layout changes smoothly
- **Dark mode**: Colors invert correctly

---

## 3️⃣ Test Category Detail Page

### URL: http://localhost:3000/categories/[slug]

(Replace [slug] with actual category slug, e.g., "electronics")

### Steps:

1. **Navigate to category page** (click from /categories)
2. **Check breadcrumb** - Home > Categories > Current Category
3. **View subcategories** - grid of child categories
4. **Scroll to products** - 20 products load initially
5. **Apply filters**:
   - Search: type product name
   - Min Price: enter 100
   - Max Price: enter 5000
   - Check "In Stock Only"
6. **Change sorting**:
   - Price: Low to High
   - Price: High to Low
   - Newest First
   - Most Popular
7. **Toggle view mode** - grid/list
8. **Click "Load More"** - next 20 products load

### Expected Behavior:

- ✅ Category info displays (name, description)
- ✅ Subcategories show (if any)
- ✅ Products filter correctly
- ✅ Sorting changes order
- ✅ View toggle works
- ✅ Pagination loads more
- ✅ Filter count badge updates
- ✅ "Clear all filters" resets

### Test Cases:

- **Valid slug**: Loads category and products
- **Invalid slug**: Shows 404 or redirects
- **No products**: Shows empty state
- **Price filter**: Only shows products in range
- **In stock**: Hides out-of-stock items

---

## 4️⃣ Test Search Results Page

### URL: http://localhost:3000/search?q=laptop

### Steps:

1. **Use global search** - type "laptop", click "View all results"
2. **Check results** - products matching "laptop"
3. **Change view mode** - grid/list toggle
4. **Check product cards** - image, name, price, rating
5. **Click a product** - navigate to detail page

### Expected Behavior:

- ✅ Query parameter in URL (`?q=laptop`)
- ✅ Results count displays
- ✅ Products show with full info
- ✅ View toggle works
- ✅ Empty state if no results
- ✅ "Browse All Products" link works

### Test Cases:

- **Common term**: "phone" - shows multiple results
- **Rare term**: "zzzzz" - shows empty state
- **Special chars**: "laptop's" - handles correctly
- **Long query**: 100+ characters - doesn't break

---

## 5️⃣ Test Firebase Integration

### Check Browser Console:

1. Open DevTools (F12)
2. Go to Console tab
3. Perform searches and navigation
4. **No errors should appear**

### Common Issues to Check:

- ❌ "Firestore index required" - Run `firebase deploy --only firestore:indexes`
- ❌ "Permission denied" - Check security rules
- ❌ "Network error" - Check Firebase config

### Test Security Rules:

#### As Unauthenticated User:

```javascript
// In browser console
// Should work - read active products
fetch("/api/products")
  .then((r) => r.json())
  .then(console.log);

// Should work - read active categories
fetch("/api/categories")
  .then((r) => r.json())
  .then(console.log);

// Should work - search
fetch("/api/search?q=test")
  .then((r) => r.json())
  .then(console.log);
```

#### As Authenticated User:

- Create wishlist - should succeed
- Read own wishlist - should succeed
- Read another user's wishlist - should fail

---

## 6️⃣ Performance Tests

### Speed Checks:

1. **Search autocomplete**: Type character, wait < 300ms
2. **Category page load**: Click category, load < 500ms
3. **Search results**: Full results < 1s
4. **Load more**: Additional products < 500ms

### Use DevTools Network Tab:

1. Open Network tab
2. Filter by "Fetch/XHR"
3. Perform actions
4. Check response times

### Expected API Response Times:

- `/api/search?q=test` - 100-300ms
- `/api/categories` - 100-200ms
- `/api/categories/[slug]` - 100-200ms
- `/api/products?category=...` - 200-400ms

---

## 7️⃣ Mobile Testing

### Responsive Breakpoints:

#### Mobile (< 768px):

- ✅ Global search hidden (use search icon in header)
- ✅ Categories grid: 1 column
- ✅ Category detail: Filters collapse
- ✅ Search results: 1 column

#### Tablet (768px - 1024px):

- ✅ Global search visible
- ✅ Categories grid: 2 columns
- ✅ Category detail: Filters visible
- ✅ Search results: 2 columns

#### Desktop (> 1024px):

- ✅ Global search visible (max-width: 2xl)
- ✅ Categories grid: 3-4 columns
- ✅ All features accessible
- ✅ Search results: 4 columns

### Test Steps:

1. Open DevTools
2. Click device toolbar icon (Ctrl+Shift+M)
3. Select different devices
4. Test all features

---

## 8️⃣ Dark Mode Testing

### Toggle Dark Mode:

1. Click sun/moon icon in header
2. All pages should switch themes

### Check These Elements:

- ✅ Search bar (white → dark gray)
- ✅ Dropdown (white → dark gray)
- ✅ Category cards (white → dark gray)
- ✅ Product cards (white → dark gray)
- ✅ Text colors (dark → light)
- ✅ Borders (gray-300 → gray-700)
- ✅ Hover states

---

## ✅ Testing Checklist

### Global Search

- [ ] Search bar visible on desktop
- [ ] Hidden on mobile
- [ ] Autocomplete works
- [ ] Recent searches save
- [ ] Keyboard navigation
- [ ] Dark mode

### Categories

- [ ] Listing page loads
- [ ] Grid/list views work
- [ ] Search filters
- [ ] Click navigates

### Category Detail

- [ ] Page loads with slug
- [ ] Breadcrumb correct
- [ ] Subcategories show
- [ ] Products load
- [ ] Filters work
- [ ] Sorting works
- [ ] Pagination works

### Search Results

- [ ] Results display
- [ ] View toggle works
- [ ] Empty state shows
- [ ] URL parameter works

### Firebase

- [ ] No console errors
- [ ] Rules work correctly
- [ ] Indexes perform well
- [ ] Response times good

### Performance

- [ ] Autocomplete < 300ms
- [ ] Page loads < 500ms
- [ ] Search < 1s

### Responsive

- [ ] Mobile layout correct
- [ ] Tablet layout correct
- [ ] Desktop layout correct

### Dark Mode

- [ ] All components switch
- [ ] Colors correct
- [ ] Readable text

---

## 🐛 Common Issues & Fixes

### Issue: Search not showing results

**Fix**: Check if products exist in Firestore with `status: "active"`

### Issue: Category page 404

**Fix**: Check category slug in Firestore, ensure `isActive: true`

### Issue: "Index required" error

**Fix**: Run `firebase deploy --only firestore:indexes`, wait 5-10 minutes

### Issue: Permission denied

**Fix**: Run `firebase deploy --only firestore:rules`

### Issue: Slow autocomplete

**Fix**: Reduce debounce time or check network speed

### Issue: Images not loading

**Fix**: Check image URLs in Firestore, ensure proper format

---

## 📊 Success Criteria

### All Tests Pass ✅

- Search works on all pages
- Categories browsing smooth
- Filters apply correctly
- No console errors
- Good performance
- Mobile responsive
- Dark mode works

### Ready for Production ✅

- Firebase deployed
- Rules secure
- Indexes optimized
- Integration tested
- Documentation complete

---

**Testing Time**: ~15-20 minutes  
**Coverage**: All major features  
**Status**: Ready to test! 🚀
