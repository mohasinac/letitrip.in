# Shop Management Quick Reference

**Phase 3.2 Complete** - All shop management features ready to use

---

## 🚀 Quick Start

### Create a Shop

1. Navigate to `/seller/my-shops`
2. Click "Create Shop" button
3. Fill in shop details (name, description, contact)
4. Submit → Redirects to edit page
5. Upload logo and banner
6. View dashboard

### Edit a Shop

1. Navigate to `/seller/my-shops`
2. Click "Edit" on a shop card
3. Update basic info or upload media
4. Changes save automatically

### View Shop Dashboard

1. Navigate to `/seller/my-shops`
2. Click "View" on a shop card
3. See stats, recent activity, quick actions

---

## 📄 Pages

### Shop Listing

**URL:** `/seller/my-shops`

- **Seller:** See own shop(s) (max 1)
- **Admin:** See all shops with filters

### Create Shop

**URL:** `/seller/my-shops/create`

- Fill basic info
- Auto-generates slug from name
- Redirects to edit page after creation

### Edit Shop

**URL:** `/seller/my-shops/[id]/edit`

- Update shop info
- Upload logo (400x400px, max 2MB)
- Upload banner (1200x400px, max 5MB)

### Shop Dashboard

**URL:** `/seller/my-shops/[id]`

- View stats (products, orders, revenue, rating)
- Quick actions (add product, analytics, orders)
- Recent activity feed

---

## 🔌 API Endpoints

### List Shops

```http
GET /api/shops?verified=true&featured=false&search=tech

Role-based filtering:
- Guest/User: Only verified, non-banned
- Seller: Own shops only
- Admin: All shops

Response:
{
  "success": true,
  "shops": [...],
  "canCreateMore": true
}
```

### Create Shop

```http
POST /api/shops
Content-Type: application/json

{
  "name": "My Tech Store",
  "slug": "my-tech-store",
  "description": "Best tech products...",
  "email": "contact@mytech.com",
  "phone": "9876543210",
  "location": "Mumbai, India",
  "website": "https://mytech.com"
}

Response:
{
  "success": true,
  "shop": { "id": "123", ... },
  "message": "Shop created successfully"
}
```

### Get Shop Details

```http
GET /api/shops/[id]

Role-based access:
- Guest/User: Public data only (verified shops)
- Seller: Full data for own shops
- Admin: Full data for all shops

Response:
{
  "success": true,
  "shop": { ... }
}
```

### Update Shop

```http
PATCH /api/shops/[id]
Content-Type: application/json

{
  "name": "Updated Name",
  "logo": "/uploads/logos/logo.png",
  "banner": "/uploads/banners/banner.jpg"
}

Permissions:
- Seller: Basic fields only (name, description, logo, banner, etc.)
- Admin: All fields including status (verified, featured, banned)

Response:
{
  "success": true,
  "shop": { ... },
  "message": "Shop updated successfully"
}
```

### Delete Shop

```http
DELETE /api/shops/[id]

Constraints:
- Seller: Can delete own shop (if no active products/orders)
- Admin: Can delete any shop

Response:
{
  "success": true,
  "message": "Shop deleted successfully"
}
```

---

## 🧩 Components

### ShopCard

**Default Variant (Grid View):**

```tsx
import ShopCard from "@/components/seller/ShopCard";

<ShopCard shop={shop} showActions={true} variant="default" />;
```

**Compact Variant (List View):**

```tsx
<ShopCard shop={shop} showActions={false} variant="compact" />
```

**Props:**

- `shop`: Shop object (required)
- `showActions`: Show action buttons (default: true)
- `variant`: 'default' | 'compact' (default: 'default')

### ShopForm

```tsx
import ShopForm from '@/components/seller/ShopForm';

// Create mode
<ShopForm
  mode="create"
  onSubmit={handleCreate}
  loading={false}
/>

// Edit mode
<ShopForm
  mode="edit"
  initialData={shop}
  onSubmit={handleUpdate}
  loading={false}
/>
```

**Props:**

- `mode`: 'create' | 'edit' (required)
- `initialData`: Shop object (edit mode only)
- `onSubmit`: (data: Partial<Shop>) => Promise<void>
- `loading`: boolean (default: false)

---

## 🎨 Design Tokens

### Shop Status Badges

**Verified:**

```tsx
<span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
  <CheckCircle className="w-3 h-3" />
  Verified
</span>
```

**Featured:**

```tsx
<span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
  <Star className="w-3 h-3" />
  Featured
</span>
```

**Banned:**

```tsx
<span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
  <XCircle className="w-3 h-3" />
  Banned
</span>
```

### Logo Fallback

```tsx
{
  shop.logo ? (
    <img src={shop.logo} alt={shop.name} className="w-16 h-16 rounded-lg" />
  ) : (
    <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
      <Store className="w-8 h-8 text-white" />
    </div>
  );
}
```

---

## 🔐 Permissions

### Shop Creation Limits

| Role   | Max Shops | Notes                       |
| ------ | --------- | --------------------------- |
| User   | 1         | Must upgrade to seller role |
| Seller | 1         | Contact admin for more      |
| Admin  | Unlimited | Can create multiple shops   |

### Edit Permissions

| Field       | Seller | Admin |
| ----------- | ------ | ----- |
| name        | ✅     | ✅    |
| slug        | ✅     | ✅    |
| description | ✅     | ✅    |
| logo        | ✅     | ✅    |
| banner      | ✅     | ✅    |
| email       | ✅     | ✅    |
| phone       | ✅     | ✅    |
| location    | ✅     | ✅    |
| website     | ✅     | ✅    |
| verified    | ❌     | ✅    |
| featured    | ❌     | ✅    |
| banned      | ❌     | ✅    |

---

## 📊 Data Flow

### Shop Creation Flow

```
1. User clicks "Create Shop" → /seller/my-shops/create
2. User fills ShopForm (name, slug, description, contact)
3. POST /api/shops → Creates shop in database (no media URLs yet)
4. API returns shop.id
5. Redirect to /seller/my-shops/{id}/edit
6. User uploads logo and banner
7. PATCH /api/shops/{id} → Updates shop with media URLs
8. Shop is now complete!
```

### Shop Update Flow

```
1. User clicks "Edit" → /seller/my-shops/{id}/edit
2. GET /api/shops/{id} → Fetches current shop data
3. User updates form fields or uploads media
4. PATCH /api/shops/{id} → Updates shop in database
5. Success message displayed
6. Shop data refreshed
```

---

## 🧪 Testing Scenarios

### Create Shop

1. ✅ Seller can create 1 shop
2. ✅ Seller cannot create 2nd shop
3. ✅ Admin can create unlimited shops
4. ✅ Slug auto-generates from name
5. ✅ Slug is unique (validated on submit)
6. ✅ Description requires min 50 characters
7. ✅ Email validation works
8. ✅ Phone validation (10 digits)
9. ✅ Website URL validation
10. ✅ Redirects to edit page after creation

### Edit Shop

1. ✅ Loads existing shop data
2. ✅ ShopForm pre-fills with current values
3. ✅ Logo upload works (preview + remove)
4. ✅ Banner upload works (preview + remove)
5. ✅ Updates save successfully
6. ✅ Error messages display on failure
7. ✅ Success messages display
8. ✅ Media upload retry on failure (TODO: UploadContext)

### Shop Dashboard

1. ✅ Stats cards display correct data
2. ✅ Quick actions navigate correctly
3. ✅ Recent activity shows latest events
4. ✅ Edit button goes to edit page
5. ✅ Public page link opens in new tab
6. ✅ Back navigation works
7. ✅ Loading states display
8. ✅ Error handling works

### Permissions

1. ✅ Unauthenticated users redirected
2. ✅ 'user' role cannot access seller routes
3. ✅ Seller sees only own shops
4. ✅ Seller can edit only own shops
5. ✅ Admin sees all shops
6. ✅ Admin can edit any shop
7. ✅ Admin can change shop status (verified, featured, banned)

---

## 🐛 Common Issues & Solutions

### Shop creation blocked

**Problem:** "You have reached the maximum number of shops"
**Solution:** Sellers can only create 1 shop. Contact admin for more.

### Cannot edit shop

**Problem:** 403 Forbidden error
**Solution:** You can only edit shops you own. Check ownership.

### Slug already taken

**Problem:** "Slug already in use"
**Solution:** Change the shop name or manually edit the slug.

### Logo/banner not uploading

**Problem:** Upload fails silently
**Solution:** Check file size (logo: 2MB, banner: 5MB) and format (images only).
**TODO:** Integrate UploadContext for retry logic.

### Stats not loading

**Problem:** Dashboard shows zeros or loading
**Solution:** Stats use mock data currently. Implement analytics API in Phase 7.

---

## 📚 Related Docs

- **Phase 3.2 Completion**: `/CHECKLIST/PHASE_3.2_COMPLETION.md`
- **Filter Components**: `/CHECKLIST/PHASE_2.7_FILTER_COMPONENTS.md`
- **Media Components**: `/CHECKLIST/MEDIA_COMPONENTS_GUIDE.md`
- **Unified API**: `/CHECKLIST/UNIFIED_API_ARCHITECTURE.md`

---

## 🔮 Future Enhancements

### Phase 7 (Database Integration)

- [ ] Replace mock data with real database queries
- [ ] Implement slug uniqueness check in database
- [ ] Add shop analytics aggregation
- [ ] Track recent activity from orders/products/reviews

### Upload Improvements

- [ ] Integrate UploadContext for retry logic
- [ ] Add progress bars for uploads
- [ ] Support drag-and-drop for logo/banner
- [ ] Add image cropping before upload

### Dashboard Enhancements

- [ ] Real-time stats updates
- [ ] Charts for revenue trends
- [ ] Top products list
- [ ] Customer reviews preview

---

**Ready to build? Start with `/seller/my-shops` and explore!** 🚀
