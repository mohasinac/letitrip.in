# Media Resource

## Overview

Media upload and management.

## Related Epic

- [E012: Media Management](../../epics/E012-media-management.md)

## Storage

- Firebase Storage

## API Routes

```
/api/media/upload  - POST   - Upload file
/api/media/delete  - DELETE - Delete file
/api/media         - GET    - List media
```

## Service

- `mediaService` - Media operations

## Hooks

- `useMediaUpload` - Upload hook

## Storage Paths

```
/product-images/
/product-videos/
/auction-images/
/shop-logos/
/shop-banners/
/blog-media/
/review-images/
/user-documents/
/static-assets/
```

## Status: 📋 Documentation Pending

- [ ] Detailed user stories
- [ ] API specifications
- [ ] Test cases
