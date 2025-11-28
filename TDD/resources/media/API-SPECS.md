# Media Resource - API Specifications

## Overview

Media upload and management APIs with Firebase Storage integration.

---

## Endpoints

### Upload Endpoints

#### POST /api/media/upload

Upload single file.

**Headers**:

- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

**Request Body (FormData)**:

| Field    | Type   | Required | Description            |
| -------- | ------ | -------- | ---------------------- |
| file     | File   | ✅       | File to upload         |
| folder   | string | ❌       | Target folder          |
| type     | string | ❌       | product/shop/user/blog |
| entityId | string | ❌       | Associated entity ID   |

**Response (201)**:

```json
{
  "success": true,
  "data": {
    "id": "media_001",
    "url": "https://storage.googleapis.com/.../image.webp",
    "thumbnailUrl": "https://storage.googleapis.com/.../image_thumb.webp",
    "fileName": "image.webp",
    "originalName": "product-photo.jpg",
    "mimeType": "image/webp",
    "size": 125000,
    "width": 1200,
    "height": 800,
    "folder": "products",
    "createdAt": "2024-11-29T10:00:00Z"
  }
}
```

**Error Responses**:

| Status | Code                | Message                         |
| ------ | ------------------- | ------------------------------- |
| 400    | `FILE_TOO_LARGE`    | File exceeds maximum size (5MB) |
| 400    | `INVALID_TYPE`      | File type not allowed           |
| 413    | `PAYLOAD_TOO_LARGE` | Request entity too large        |

---

#### POST /api/media/upload-multiple

Upload multiple files.

**Request Body (FormData)**:

| Field  | Type   | Required | Description              |
| ------ | ------ | -------- | ------------------------ |
| files  | File[] | ✅       | Files to upload (max 10) |
| folder | string | ❌       | Target folder            |

**Response (201)**:

```json
{
  "success": true,
  "data": [
    { "id": "media_001", "url": "...", "fileName": "image1.webp" },
    { "id": "media_002", "url": "...", "fileName": "image2.webp" }
  ],
  "meta": {
    "uploaded": 2,
    "failed": 0
  }
}
```

---

#### POST /api/media/upload-url

Upload from URL.

**Request Body**:

```json
{
  "url": "https://example.com/image.jpg",
  "folder": "products"
}
```

---

### Management Endpoints

#### GET /api/media

List user's media files.

**Query Parameters**:

| Param  | Type   | Default | Description           |
| ------ | ------ | ------- | --------------------- |
| folder | string | -       | Filter by folder      |
| type   | string | -       | Filter by entity type |

---

#### DELETE /api/media/:id

Delete media file.

**Response (200)**:

```json
{
  "success": true,
  "message": "Media deleted successfully"
}
```

---

### Admin Endpoints

#### GET /api/admin/media

List all media files.

---

#### DELETE /api/admin/media/cleanup

Clean up orphaned media files.

---

## Allowed File Types

### Images

- `image/jpeg`
- `image/png`
- `image/webp`
- `image/gif`

### Documents (for tickets)

- `application/pdf`

### Size Limits

- Images: 5MB
- Documents: 10MB

---

## RBAC Permissions

| Endpoint                    | Guest | User | Seller | Admin |
| --------------------------- | ----- | ---- | ------ | ----- |
| POST /media/upload          | ❌    | ✅   | ✅     | ✅    |
| POST /media/upload-multiple | ❌    | ❌   | ✅     | ✅    |
| GET /media                  | ❌    | ✅   | ✅     | ✅    |
| DELETE /media/:id           | ❌    | ✅\* | ✅\*   | ✅    |
| GET /admin/media            | ❌    | ❌   | ❌     | ✅    |
| DELETE /admin/media/cleanup | ❌    | ❌   | ❌     | ✅    |

\*Own media only

---

## Image Processing

Images are automatically processed on upload:

1. **Format Conversion**: Converted to WebP for optimization
2. **Resizing**: Large images resized to max 2000px
3. **Thumbnails**: Generated at 300x300px
4. **Metadata**: EXIF data stripped for privacy

---

## Service Usage

```typescript
import { mediaService } from "@/services";

// Upload single file
const media = await mediaService.upload(file, { folder: "products" });

// Upload multiple files
const mediaList = await mediaService.uploadMultiple(files, {
  folder: "products",
});

// Upload from URL
const imported = await mediaService.uploadFromUrl("https://...", {
  folder: "products",
});

// List media
const myMedia = await mediaService.list({ folder: "products" });

// Delete media
await mediaService.delete("media_001");
```

---

## Storage Structure

```
/users/{userId}/profile.webp
/shops/{shopId}/logo.webp
/shops/{shopId}/banner.webp
/products/{productId}/{filename}.webp
/products/{productId}/thumbnails/{filename}.webp
/auctions/{auctionId}/{filename}.webp
/tickets/{ticketId}/{filename}.pdf
/blog/{postId}/{filename}.webp
```
