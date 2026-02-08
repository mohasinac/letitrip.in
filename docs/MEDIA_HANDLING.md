# Media Handling Guide

**Last Updated**: February 7, 2026

This guide covers image and video handling across the platform.

---

## Table of Contents

1. [Overview](#overview)
2. [Entity-Specific Requirements](#entity-specific-requirements)
3. [Image Upload & Editing](#image-upload--editing)
4. [Video Upload & Processing](#video-upload--processing)
5. [Firebase Storage Structure](#firebase-storage-structure)
6. [Component Architecture](#component-architecture)

---

## Overview

The platform supports comprehensive media management with the following features:

- **Images**: Crop, resize, 1:1 main images for grid consistency
- **Videos**: Upload, trim, thumbnail selection
- **Storage**: Firebase Cloud Storage with organized folder structure
- **Reusability**: Same editor components across products, reviews, categories

---

## Entity-Specific Requirements

### Products & Auctions

**Required**:

- `mainImage` (string): 1:1 aspect ratio for grid display
- `images` (string[]): Max 10 additional images with crop metadata

**Optional**:

- `video` (object):
  ```typescript
  {
    url: string;              // Firebase Storage URL
    thumbnailUrl: string;     // User-selected thumbnail
    duration: number;         // Video length in seconds
    trimStart?: number;       // Trim start time (optional)
    trimEnd?: number;         // Trim end time (optional)
  }
  ```

**Use Cases**:

- Product galleries with multiple angles
- Video demonstrations of products in use
- Auction item condition documentation

---

### Reviews

**Optional**:

- `images` (string[]): Max 10 images with crop metadata
- `video` (object): Same structure as products

**Use Cases**:

- Customer photos of received products
- Video reviews and unboxing
- Product condition documentation

---

### Categories

**Optional**:

- `image` (string): Single category image (any aspect ratio)

**Use Cases**:

- Category banner images
- Visual representation in navigation
- Category landing page headers

---

## Image Upload & Editing

### Main Image (1:1 Required)

**Component**: `ImageCropModal`
**Aspect Ratio**: 1:1 (square)
**Purpose**: Grid consistency across product listings

```tsx
<ImageCropModal
  isOpen={isMainImageModalOpen}
  imageUrl={selectedMainImage}
  aspectRatio={1} // 1:1 enforced
  onSave={handleMainImageSave}
  onCancel={handleCancel}
/>
```

### Additional Images (Max 10)

**Component**: `ImageCropModal`
**Aspect Ratios**: 1:1, 4:3, 16:9, or free
**Validation**: Max 10 images per product/review

```tsx
<ImageCropModal
  isOpen={isImageModalOpen}
  imageUrl={selectedImage}
  aspectRatio={undefined} // Flexible ratio
  onSave={handleImageSave}
  onCancel={handleCancel}
/>
```

### Image Upload Flow

1. **File Selection**: User selects image from device
2. **Preview Generation**: Create blob URL for preview
3. **Crop Modal**: Open `ImageCropModal` for editing
4. **User Edits**: Zoom, position, rotate image
5. **Save**: Upload to Firebase Storage with crop metadata
6. **Display**: Show cropped image in product gallery

---

## Video Upload & Processing

### Video Upload Component

**Features**:

- Progress bar during upload
- Format validation (MP4, WebM)
- File size limit: 100MB
- Duration extraction

```tsx
<VideoUpload
  maxSize={100 * 1024 * 1024} // 100MB
  acceptedFormats={["video/mp4", "video/webm"]}
  onUploadComplete={handleVideoUpload}
/>
```

### Video Trimming

**Component**: `VideoTrimEditor`
**Features**:

- Timeline with start/end markers
- Real-time preview
- Duration display
- Save trimmed video metadata

```tsx
<VideoTrimEditor
  videoUrl={uploadedVideoUrl}
  onSave={(trimData) => {
    // Save trim start/end times
    setVideo({
      url: videoUrl,
      trimStart: trimData.startTime,
      trimEnd: trimData.endTime,
      duration: trimData.duration,
    });
  }}
/>
```

### Thumbnail Selection

**Component**: `VideoThumbnailPicker`
**Features**:

- Extract frames from video
- Display 10-15 thumbnail options
- User selects preferred thumbnail
- Upload thumbnail to storage

```tsx
<VideoThumbnailPicker
  videoUrl={uploadedVideoUrl}
  onSelect={(thumbnailBlob) => {
    // Upload thumbnail to storage
    const thumbnailUrl = await uploadThumbnail(thumbnailBlob);
    setVideo({ ...video, thumbnailUrl });
  }}
/>
```

---

## Firebase Storage Structure

### Organization

```
storage/
├── products/
│   ├── {productId}/
│   │   ├── main.jpg              # 1:1 main image
│   │   ├── images/
│   │   │   ├── 1.jpg             # Additional images
│   │   │   ├── 2.jpg
│   │   │   └── ...
│   │   ├── video.mp4             # Product video
│   │   └── video-thumb.jpg       # Video thumbnail
│
├── reviews/
│   ├── {reviewId}/
│   │   ├── images/
│   │   │   ├── 1.jpg
│   │   │   └── ...
│   │   ├── video.mp4
│   │   └── video-thumb.jpg
│
└── categories/
    └── {categoryId}/
        └── image.jpg              # Category image
```

### Storage Rules

Update `storage.rules`:

```javascript
// Products
match /products/{productId}/{allPaths=**} {
  allow read: if true;
  allow write: if request.auth != null &&
    request.auth.uid == getProductSellerId(productId);

  // File size limits
  allow write: if request.resource.size < 10 * 1024 * 1024 && // 10MB images
    request.resource.contentType.matches('image/.*');
  allow write: if request.resource.size < 100 * 1024 * 1024 && // 100MB videos
    request.resource.contentType.matches('video/(mp4|webm)');
}

// Reviews
match /reviews/{reviewId}/{allPaths=**} {
  allow read: if true;
  allow write: if request.auth != null &&
    request.auth.uid == getReviewUserId(reviewId);
}

// Categories (admin only)
match /categories/{categoryId}/{allPaths=**} {
  allow read: if true;
  allow write: if isAdmin();
}
```

---

## Component Architecture

### Reusable Components

#### 1. `MediaUploadManager`

**Purpose**: Unified component for managing all media uploads
**Props**:

```typescript
interface MediaUploadManagerProps {
  entityType: "product" | "review" | "category";
  entityId: string;
  maxImages?: number; // Default 10
  maxVideos?: number; // Default 1
  requireMainImage?: boolean; // Default true for products
  onSaveComplete?: (media: MediaData) => void;
}
```

#### 2. `ImageGalleryEditor`

**Purpose**: Edit multiple images with crop/delete functionality
**Features**:

- Drag-and-drop reordering
- Individual image editing (crop modal)
- Delete confirmation
- Main image indicator

#### 3. `VideoEditor`

**Purpose**: Complete video editing workflow
**Features**:

- Upload with progress
- Trim timeline editor
- Thumbnail frame selector
- Preview player

### Component Hierarchy

```
MediaUploadManager
├── MainImageUpload (1:1 enforced)
│   └── ImageCropModal
├── ImageGalleryEditor (max 10)
│   ├── ImageUpload
│   └── ImageCropModal
└── VideoUpload (max 1)
    ├── VideoTrimEditor
    └── VideoThumbnailPicker
```

---

## Implementation Checklist

### Phase 1: Schema Updates ✅

- [x] Update `ProductDocument` with media fields
- [x] Update `ReviewDocument` with media fields
- [x] Update `CategoryDocument` with image field
- [x] Update `PLAN.md` with media architecture

### Phase 2: Component Creation

- [ ] Create `MediaUploadManager` component
- [ ] Create `ImageGalleryEditor` component
- [ ] Create `VideoUpload` component
- [ ] Create `VideoTrimEditor` component
- [ ] Create `VideoThumbnailPicker` component

### Phase 3: Storage Integration

- [ ] Update `storage.rules` with media paths
- [ ] Create media upload utilities
- [ ] Implement progress tracking
- [ ] Add file validation

### Phase 4: Product Integration

- [ ] Add media manager to product creation
- [ ] Add media manager to product editing
- [ ] Display media in product cards
- [ ] Display media in product details

### Phase 5: Review Integration

- [ ] Add media upload to review form
- [ ] Display review media in listings
- [ ] Media moderation for reviews

### Phase 6: Category Integration

- [ ] Add image upload to category admin
- [ ] Display category images in navigation
- [ ] Category image in breadcrumbs

---

## Best Practices

### Image Optimization

1. **Compress before upload**: Use browser APIs to compress images client-side
2. **Generate thumbnails**: Create multiple sizes for different views
3. **Lazy loading**: Load images only when visible
4. **WebP format**: Use WebP for better compression (with fallbacks)

### Video Optimization

1. **Transcode server-side**: Use Firebase Functions or third-party service
2. **Adaptive streaming**: HLS/DASH for better playback
3. **CDN delivery**: Serve videos through CDN
4. **Thumbnail generation**: Auto-generate if user doesn't select

### User Experience

1. **Progress indicators**: Show upload/processing progress
2. **Error handling**: Clear error messages for failed uploads
3. **Preview before save**: Always show preview before finalizing
4. **Undo functionality**: Allow users to undo recent changes

### Performance

1. **Batch uploads**: Upload multiple images simultaneously
2. **Resize client-side**: Reduce upload size with client-side resizing
3. **Cancel uploads**: Allow users to cancel in-progress uploads
4. **Cache thumbnails**: Cache generated thumbnails locally

---

## Security Considerations

### Validation

- File type validation (whitelist)
- File size limits (10MB images, 100MB videos)
- Image dimension validation
- Malware scanning (Firebase Extensions)

### Access Control

- Verify user owns the entity before upload
- Implement rate limiting on uploads
- Log all media operations for audit

### Content Moderation

- Manual review for reported content
- Automated NSFW detection (Cloud Vision API)
- Watermarking for sensitive content

---

## Future Enhancements

### Planned Features

1. **Bulk editing**: Edit multiple images at once
2. **AI suggestions**: Auto-crop to best framing
3. **Background removal**: AI-powered background removal
4. **Video filters**: Apply filters to videos
5. **GIF support**: Animated GIF uploads
6. **360° images**: Support for 360° product views
7. **AR previews**: Augmented reality product previews
8. **Live streaming**: Live product demonstrations

---

## Resources

- [Firebase Storage Documentation](https://firebase.google.com/docs/storage)
- [Image Optimization Guide](../guides/image-optimization.md)
- [Video Processing Best Practices](../guides/video-processing.md)
- [Component API Reference](../components/media-components.md)

---

**Need Help?**

- Review existing `AvatarUpload` component for reference
- Check `ImageCropModal` implementation
- See Firebase storage rules examples
