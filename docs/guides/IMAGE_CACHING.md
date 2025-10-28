# Image Caching & Storage System

## Overview

The image storage and caching system provides:

1. **Smart image uploading** with slug-based naming for categories
2. **Intelligent caching** via a centralized API endpoint
3. **Efficient retrieval** with ETag support and configurable cache durations

## Image Upload System

### Features

✅ **Slug-Based Naming**: Images automatically saved with category slug names
✅ **Auto-Prefix**: Category images auto-prefixed with 'buy-' in filename
✅ **Multi-Method Upload**: URL, file upload, and device camera
✅ **Firebase Storage Integration**: Secure cloud storage with public URLs
✅ **Validation**: File type and size checking
✅ **User Attribution**: Tracks who uploaded images with metadata

### Upload Endpoint: `/api/storage/upload`

**Request Format:**

```typescript
interface ImageUploadRequest {
  file: File; // Image file from upload/camera
  folder: string; // Storage folder ("categories", "products", etc.)
  slug?: string; // Optional - for custom naming
}
```

**Response:**

```typescript
{
  success: true,
  data: {
    url: "storage/categories/buy-electronics.jpg",
    filename: "buy-electronics.jpg",
    filepath: "categories/buy-electronics.jpg",
    size: 45231,
    type: "image/jpeg"
  }
}
```

### Usage in Components

**ImageUploader Component**

```tsx
import ImageUploader from "@/components/admin/categories/ImageUploader";

<ImageUploader
  value={imageValue}
  onChange={onImageChange}
  slug="buy-electronics" // Slug for custom naming
  onError={handleError}
/>;
```

**Three Upload Methods:**

1. **URL Tab**: Paste image URL directly
2. **Upload Tab**: Select image from device
3. **Camera Tab**: Capture photo with device camera
   - Permission-based with user-friendly dialogs
   - Fallback options if permission denied
   - Works on mobile and desktop

---

## Image Caching System

### Purpose

The caching endpoint retrieves images from Firebase Storage with intelligent HTTP caching headers for optimal performance.

### Caching Endpoint: `/api/storage/get`

**Query Parameters:**

| Parameter | Type   | Default | Description                           |
| --------- | ------ | ------- | ------------------------------------- |
| `path`    | string | require | File path in storage                  |
| `cache`   | number | 86400   | Cache duration in seconds (0-2592000) |

**Example Requests:**

```
GET /api/storage/get?path=categories/buy-electronics.jpg
GET /api/storage/get?path=categories/buy-electronics.jpg&cache=3600
```

### HTTP Caching Headers

```
Cache-Control: public, max-age=86400, immutable
ETag: "firebase-etag-value"
Last-Modified: Wed, 29 Oct 2025 10:30:00 GMT
```

### Features

✅ **Smart Caching**: Configurable cache duration (0 seconds to 30 days)
✅ **ETag Support**: 304 Not Modified responses for efficient validation
✅ **CORS Enabled**: Cross-origin requests supported
✅ **Security**: Directory traversal protection
✅ **Performance**: Metadata caching with Last-Modified header
✅ **Error Handling**: Proper HTTP status codes (404 for missing files, 500 for errors)

---

## Usage Patterns

### 1. Using Storage Utility Functions

**With Caching (Recommended)**

```tsx
import { getImageUrl } from "@/lib/utils/storage";

// Use cached API endpoint (24-hour default cache)
const imageUrl = getImageUrl("categories/buy-electronics.jpg");
<img src={imageUrl} alt="Electronics" />;

// With custom cache duration (1 hour)
const imageUrl = getImageUrl("categories/buy-electronics.jpg", true, 3600);
```

**Direct Firebase URL**

```tsx
import { getStoragePublicUrl } from "@/lib/utils/storage";

// Get direct Firebase Storage URL (no caching)
const imageUrl = getStoragePublicUrl("categories/buy-electronics.jpg");
```

### 2. In React Components

**CategoryForm Integration**

```tsx
import { getImageUrl } from "@/lib/utils/storage";

function ImagePreview({ imageUrl }) {
  if (!imageUrl) return <Box>No image</Box>;

  // Automatically uses caching endpoint with 24-hour cache
  const cachedUrl = getImageUrl(imageUrl, true, 86400);

  return <img src={cachedUrl} alt="Category" />;
}
```

### 3. Direct API Usage

```typescript
// Fetch with default cache
const response = await fetch(
  "/api/storage/get?path=categories/buy-electronics.jpg"
);

// Fetch with custom cache duration
const response = await fetch(
  "/api/storage/get?path=categories/buy-electronics.jpg&cache=3600"
);
```

---

## Cache Strategy

### Browser Caching

- **Default Duration**: 24 hours (86400 seconds)
- **Immutable Flag**: Tells browsers the image won't change for the cache duration
- **Suitable for**: Category images, product thumbnails, static content

### CDN Caching (if deployed behind CDN)

- All caching headers are CDN-compatible
- ETag support enables cache revalidation
- Works with Vercel, Cloudflare, AWS CloudFront, etc.

### Cache Duration Recommendations

| Use Case               | Duration   | Reason                      |
| ---------------------- | ---------- | --------------------------- |
| Static category images | 24-30 days | Rarely change               |
| Product photos         | 7-14 days  | May be updated periodically |
| User-uploaded content  | 24 hours   | More frequently changed     |
| Temporary images       | 1-6 hours  | May be deleted soon         |
| No caching             | 0          | Always fetch fresh          |

---

## Slug-Based Image Naming

### Auto-Slug Prefix for Categories

Category images automatically get the 'buy-' prefix in their slug:

**Input:**

```
Category name: Electronics
Auto-generated slug: buy-electronics
```

**Saved as:**

```
Storage path: categories/buy-electronics.jpg
Filename: buy-electronics.jpg
```

### Manual Slug Editing

While the slug auto-prefixes with 'buy-', it can still be edited:

```tsx
// User can modify the slug in the form
<TextField
  value={slug} // e.g., "buy-custom-name"
  onChange={handleSlugChange}
/>

// Image will be saved with the edited slug
ImageUploader receives slug prop and saves accordingly
```

### Slug Validation

- Must start with 'buy-' (auto-prefixed)
- Can be edited but must remain unique
- Must follow URL-friendly naming conventions
- Auto-generated from category name if not provided

---

## Response Examples

### Success (200 OK)

```
HTTP/1.1 200 OK
Content-Type: image/jpeg
Content-Length: 45231
Cache-Control: public, max-age=86400, immutable
ETag: "abc123def456"
Last-Modified: Wed, 29 Oct 2025 10:30:00 GMT

[Binary image data]
```

### Cached (304 Not Modified)

```
HTTP/1.1 304 Not Modified
ETag: "abc123def456"
Cache-Control: public, max-age=86400, immutable
```

### Not Found (404)

```
HTTP/1.1 404 Not Found
Content-Type: application/json

{
  "success": false,
  "error": "File not found"
}
```

### Upload Success (200 OK)

```json
{
  "success": true,
  "data": {
    "url": "storage/categories/buy-electronics.jpg",
    "filename": "buy-electronics.jpg",
    "filepath": "categories/buy-electronics.jpg",
    "size": 45231,
    "type": "image/jpeg"
  }
}
```

---

## Security Considerations

### Upload Security

- Authentication required (Firebase token)
- File type validation (image/\* only)
- File size limits (5MB client, 10MB server)
- User attribution tracked in metadata

### Retrieval Security

- Path validation prevents `../` sequences
- Paths cannot start with `/`
- Invalid paths return 400 Bad Request
- Endpoint is public (read-only) for performance
- Sensitive images should not be stored in public folder

---

## Integration with Components

### CategoryForm.tsx

- Auto-generates 'buy-' prefixed slug from category name
- Passes slug to ImageUploader for custom naming
- Displays preview using cached endpoint
- Validates slug uniqueness before save

### ImageUploader.tsx

- Accepts slug prop for custom naming
- Supports three upload methods (URL, file, camera)
- Handles camera permissions gracefully
- Shows progress during upload
- Returns Firebase Storage path

### ImagePreview.tsx

- Uses cached endpoint via `getImageUrl()` helper
- Shows 80x80 preview thumbnail
- Handles load errors gracefully
- Auto-updates when image changes

---

## Performance Benefits

1. **Reduced Firebase Storage Requests**: Browser cache reduces repeat requests
2. **Faster Page Loads**: Browser retrieves cached images from disk
3. **Bandwidth Savings**: 304 Not Modified responses save bandwidth
4. **CDN Optimization**: Cache headers enable CDN edge caching
5. **Better SEO**: Fast image loading improves Core Web Vitals
6. **Organized Storage**: Slug-based naming makes images easy to find

---

## Monitoring & Debugging

### Check Cache Headers

```bash
curl -I "http://localhost:3000/api/storage/get?path=categories/buy-electronics.jpg"
```

### Monitor with DevTools

1. Open browser DevTools → Network tab
2. Filter by type: Image
3. Check Response Headers for `Cache-Control` and `ETag`
4. Verify "Size" shows "disk cache" for cached responses

### Troubleshooting

**Image not loading?**

- Check file path is correct in storage
- Verify image is in public bucket location
- Check browser console for CORS errors

**Caching not working?**

- Check Cache-Control headers in Network tab
- Verify browser isn't in "Disable cache" mode
- Clear cache and reload: Ctrl+Shift+Delete

**Slug not prefixed?**

- Ensure slug validation includes 'buy-' prefix
- Check that auto-generation is enabled in form
- Verify database has slug value

---

## Environment Variables

Ensure these are configured in `.env.local`:

```
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-bucket-name.appspot.com
```

---

## File Structure

```
src/
├── app/
│   └── api/
│       └── storage/
│           ├── upload/
│           │   └── route.ts (Upload handler)
│           └── get/
│               └── route.ts (Retrieval handler)
├── components/
│   └── admin/
│       └── categories/
│           └── ImageUploader.tsx (Multi-method upload)
└── lib/
    └── utils/
        └── storage.ts (Helper functions)
```

---
