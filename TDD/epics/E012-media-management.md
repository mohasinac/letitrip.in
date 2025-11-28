# Epic E012: Media Management

## Overview

Media upload and management for products, auctions, shops, blogs, and user documents using Firebase Storage.

## Scope

- Image upload and management
- Video upload and management
- Document upload
- Media organization by context
- Media cleanup

## User Roles Involved

- **Admin**: Full media access, cleanup
- **Seller**: Upload product/shop media
- **User**: Upload review/ticket media, documents
- **Guest**: No upload access

---

## Features

### F012.1: Image Upload

**US012.1.1**: Upload Images

```
Contexts:
- Product images (seller)
- Auction images (seller)
- Shop logo/banner (seller)
- Blog media (admin)
- Review images (user)
- Ticket attachments (user)

Constraints:
- Max 10MB per image
- Formats: JPEG, PNG, GIF, WebP
```

### F012.2: Video Upload

**US012.2.1**: Upload Videos

```
Constraints:
- Max 100MB per video
- Formats: MP4, WebM, MOV
```

### F012.3: Document Upload

**US012.3.1**: Upload Documents

```
For verification, tickets, etc.
Formats: PDF, Word, Excel
```

### F012.4: Media Management

**US012.4.1**: Delete Media
**US012.4.2**: Reorder Media
**US012.4.3**: Set Primary Image

---

## API Endpoints

| Endpoint            | Method | Auth | Description    |
| ------------------- | ------ | ---- | -------------- |
| `/api/media/upload` | POST   | User | Upload file    |
| `/api/media/delete` | DELETE | User | Delete file    |
| `/api/media`        | GET    | User | List own media |

---

## Storage Paths

```
/product-images/{productId}/{filename}
/product-videos/{productId}/{filename}
/auction-images/{auctionId}/{filename}
/shop-logos/{shopId}/{filename}
/shop-banners/{shopId}/{filename}
/blog-media/{postId}/{filename}
/review-images/{reviewId}/{filename}
/user-documents/{userId}/{filename}
/static-assets/{type}/{category}/{filename}
```

## Related Epics

- E002: Product Catalog (product media)
- E003: Auction System (auction media)
- E006: Shop Management (shop media)
- E007: Review System (review media)

---

## Test Documentation

- **API Specs**: `/TDD/resources/media/API-SPECS.md`
- **Test Cases**: `/TDD/resources/media/TEST-CASES.md`

### Test Coverage

- Unit tests for file validation
- Unit tests for size and format checks
- Integration tests for Firebase Storage
- E2E tests for upload and management flow
- RBAC tests for media ownership
