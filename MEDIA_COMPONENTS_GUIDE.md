# Media Components Implementation Guide

## Overview

Comprehensive media handling system for uploading, capturing, editing, and managing photos and videos with metadata.

---

## Component Architecture

```
MediaUploader (Main Entry Point)
├── CameraCapture (Photo from camera)
├── VideoRecorder (Video from camera)
├── FileUpload (From device)
└── MediaPreviewCard
    ├── ImageEditor (Crop, Rotate, Zoom, Filters)
    ├── VideoThumbnailGenerator (Auto thumbnail)
    └── MediaMetadataForm (Slug, Description)
```

---

## 1. MediaUploader Component

### Features

- Upload from file system
- Capture photo from camera
- Record video from camera
- Multiple file support
- Drag & drop support
- Format validation (JPEG, PNG, WebP, MP4, WebM)
- Size validation (max 10MB for images, 100MB for videos)
- Preview before upload

### Props

```typescript
interface MediaUploaderProps {
  mode: "image" | "video" | "both";
  multiple?: boolean;
  maxFiles?: number;
  maxSizeImage?: number; // in MB
  maxSizeVideo?: number; // in MB
  acceptedFormats?: string[];
  onUpload: (files: MediaFile[]) => void;
  existingMedia?: MediaFile[];
  requireMetadata?: boolean;
}
```

### Usage

```tsx
<MediaUploader
  mode="both"
  multiple={true}
  maxFiles={10}
  requireMetadata={true}
  onUpload={(files) => console.log(files)}
/>
```

---

## 2. CameraCapture Component

### Features

- Access device camera (front/back)
- Live preview
- Switch between cameras
- Photo capture with countdown timer
- Flash control (if supported)
- Resolution selection
- Direct capture to canvas

### Props

```typescript
interface CameraCaptureProps {
  onCapture: (image: MediaFile) => void;
  onCancel: () => void;
  facing?: "user" | "environment"; // front or back
  resolution?: "low" | "medium" | "high";
  showTimer?: boolean;
}
```

### Technical Details

- Uses `navigator.mediaDevices.getUserMedia()`
- Captures to canvas using `canvas.toBlob()`
- Handles camera permissions
- Fallback for unsupported browsers

---

## 3. VideoRecorder Component

### Features

- Record video from camera
- Live preview while recording
- Record duration display
- Pause/resume recording
- Max duration limit
- Audio recording toggle
- Front/back camera switch
- Download recorded video

### Props

```typescript
interface VideoRecorderProps {
  onRecord: (video: MediaFile) => void;
  onCancel: () => void;
  maxDuration?: number; // in seconds
  facing?: "user" | "environment";
  includeAudio?: boolean;
}
```

### Technical Details

- Uses `MediaRecorder API`
- Records in WebM/MP4 format
- Automatic thumbnail generation on stop
- Chunk-based recording for large files

---

## 4. ImageEditor Component

### Features

- **Crop**: Freeform and aspect ratio (1:1, 4:3, 16:9, custom)
- **Rotate**: 90°, 180°, 270° rotation
- **Flip**: Horizontal and vertical flip
- **Zoom**: 0.5x to 3x zoom with pinch gesture support
- **Filters**: Grayscale, Sepia, Brightness, Contrast, Saturation
- **Adjustments**: Exposure, Highlights, Shadows, Warmth
- **Undo/Redo**: Action history
- **Reset**: Revert to original

### Props

```typescript
interface ImageEditorProps {
  image: string | File;
  onSave: (editedImage: MediaFile, metadata: ImageMetadata) => void;
  onCancel: () => void;
  aspectRatios?: AspectRatio[];
  enableFilters?: boolean;
  enableAdjustments?: boolean;
}

interface ImageMetadata {
  slug: string;
  description: string;
  altText: string;
  cropArea?: CropArea;
  rotation: number;
  flip: { horizontal: boolean; vertical: boolean };
  filters: FilterSettings;
  originalDimensions: { width: number; height: number };
  editedDimensions: { width: number; height: number };
}
```

### Technical Implementation

```typescript
// Using Canvas API for processing
const processImage = (
  image: HTMLImageElement,
  operations: ImageOperation[]
) => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  // Apply crop
  if (operations.crop) {
    canvas.width = operations.crop.width;
    canvas.height = operations.crop.height;
    ctx.drawImage(
      image,
      operations.crop.x,
      operations.crop.y,
      operations.crop.width,
      operations.crop.height,
      0,
      0,
      canvas.width,
      canvas.height
    );
  }

  // Apply rotation
  if (operations.rotation) {
    const tempCanvas = document.createElement("canvas");
    const tempCtx = tempCanvas.getContext("2d");
    // Rotation logic...
  }

  // Apply filters
  if (operations.filters) {
    ctx.filter = `
      brightness(${operations.filters.brightness}%)
      contrast(${operations.filters.contrast}%)
      saturate(${operations.filters.saturation}%)
      grayscale(${operations.filters.grayscale}%)
      sepia(${operations.filters.sepia}%)
    `;
    ctx.drawImage(canvas, 0, 0);
  }

  return canvas.toDataURL("image/jpeg", 0.95);
};
```

---

## 5. VideoThumbnailGenerator Component

### Features

- Auto-generate thumbnail from video
- Select frame at specific timestamp
- Multiple thumbnail generation (beginning, middle, end)
- Canvas-based thumbnail creation
- Customizable thumbnail dimensions
- Quality control

### Props

```typescript
interface VideoThumbnailGeneratorProps {
  video: File | string;
  onGenerate: (thumbnail: MediaFile) => void;
  timestamp?: number; // seconds
  width?: number;
  height?: number;
  quality?: number; // 0-1
  autoGenerate?: boolean;
}
```

### Technical Implementation

```typescript
const generateThumbnail = async (
  videoFile: File,
  timestamp: number = 2
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    video.preload = "metadata";
    video.src = URL.createObjectURL(videoFile);

    video.addEventListener("loadedmetadata", () => {
      video.currentTime = Math.min(timestamp, video.duration);
    });

    video.addEventListener("seeked", () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(video.src);
          resolve(blob);
        },
        "image/jpeg",
        0.85
      );
    });

    video.addEventListener("error", reject);
  });
};
```

---

## 6. MediaPreviewCard Component

### Features

- Display image/video preview
- Show file metadata (name, size, dimensions, duration)
- Edit button to open editor
- Delete button
- Drag handle for reordering
- Metadata form (slug, description)
- Status indicators (uploading, processing, error)
- Thumbnail display for videos

### Props

```typescript
interface MediaPreviewCardProps {
  media: MediaFile;
  onEdit: (media: MediaFile) => void;
  onDelete: (mediaId: string) => void;
  onMetadataUpdate: (mediaId: string, metadata: MediaMetadata) => void;
  showMetadataForm?: boolean;
  draggable?: boolean;
}

interface MediaFile {
  id: string;
  type: "image" | "video";
  file: File;
  preview: string; // Data URL or object URL
  thumbnail?: string; // For videos
  metadata: MediaMetadata;
  status: "idle" | "uploading" | "processing" | "success" | "error";
  progress?: number; // 0-100
  error?: string;
}

interface MediaMetadata {
  slug: string;
  description: string;
  altText?: string;
  dimensions?: { width: number; height: number };
  duration?: number; // For videos
  size: number; // File size in bytes
  format: string;
  createdAt: Date;
  editedAt?: Date;
}
```

---

## 7. MediaEditorModal Component

### Features

- Full-screen modal for editing
- Tabbed interface (Edit, Metadata, Preview)
- Save and cancel actions
- Keyboard shortcuts (Ctrl+S to save, Esc to cancel)
- Responsive design

### Props

```typescript
interface MediaEditorModalProps {
  media: MediaFile;
  isOpen: boolean;
  onClose: () => void;
  onSave: (editedMedia: MediaFile) => void;
}
```

---

## 8. MediaGallery Component

### Features

- Grid/list view toggle
- Sorting (date, name, size)
- Filtering (type, status)
- Bulk selection
- Bulk delete
- Reordering (drag & drop)
- Lightbox view
- Responsive grid

### Props

```typescript
interface MediaGalleryProps {
  media: MediaFile[];
  onMediaUpdate: (media: MediaFile[]) => void;
  allowReorder?: boolean;
  allowBulkActions?: boolean;
  viewMode?: "grid" | "list";
}
```

---

## Supporting Utilities

### 1. Image Processor (`/src/lib/media/image-processor.ts`)

```typescript
export const imageProcessor = {
  // Crop image
  crop: async (
    image: File,
    cropArea: CropArea
  ): Promise<Blob> => { ... },

  // Rotate image
  rotate: async (
    image: File,
    degrees: number
  ): Promise<Blob> => { ... },

  // Resize image
  resize: async (
    image: File,
    width: number,
    height: number,
    maintainAspectRatio?: boolean
  ): Promise<Blob> => { ... },

  // Apply filters
  applyFilters: async (
    image: File,
    filters: FilterSettings
  ): Promise<Blob> => { ... },

  // Compress image
  compress: async (
    image: File,
    quality: number
  ): Promise<Blob> => { ... },

  // Get image dimensions
  getDimensions: async (
    image: File
  ): Promise<{ width: number; height: number }> => { ... },
};
```

### 2. Video Processor (`/src/lib/media/video-processor.ts`)

```typescript
export const videoProcessor = {
  // Generate thumbnail
  generateThumbnail: async (
    video: File,
    timestamp?: number
  ): Promise<Blob> => { ... },

  // Generate multiple thumbnails
  generateThumbnails: async (
    video: File,
    count: number
  ): Promise<Blob[]> => { ... },

  // Get video metadata
  getMetadata: async (
    video: File
  ): Promise<VideoMetadata> => { ... },

  // Extract frame at timestamp
  extractFrame: async (
    video: File,
    timestamp: number
  ): Promise<Blob> => { ... },
};
```

### 3. Media Validator (`/src/lib/media/media-validator.ts`)

```typescript
export const mediaValidator = {
  // Validate file type
  validateType: (
    file: File,
    allowedTypes: string[]
  ): ValidationResult => { ... },

  // Validate file size
  validateSize: (
    file: File,
    maxSize: number
  ): ValidationResult => { ... },

  // Validate image dimensions
  validateDimensions: async (
    file: File,
    constraints: DimensionConstraints
  ): Promise<ValidationResult> => { ... },

  // Validate video duration
  validateDuration: async (
    file: File,
    maxDuration: number
  ): Promise<ValidationResult> => { ... },

  // Comprehensive validation
  validate: async (
    file: File,
    rules: ValidationRules
  ): Promise<ValidationResult> => { ... },
};
```

---

## Type Definitions (`/src/types/media.ts`)

```typescript
export interface MediaFile {
  id: string;
  type: "image" | "video";
  file: File;
  preview: string;
  thumbnail?: string;
  metadata: MediaMetadata;
  status: MediaStatus;
  progress?: number;
  error?: string;
}

export interface MediaMetadata {
  slug: string;
  description: string;
  altText?: string;
  dimensions?: Dimensions;
  duration?: number;
  size: number;
  format: string;
  createdAt: Date;
  editedAt?: Date;
  customFields?: Record<string, any>;
}

export type MediaStatus =
  | "idle"
  | "uploading"
  | "processing"
  | "success"
  | "error";

export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface FilterSettings {
  brightness: number; // 0-200
  contrast: number; // 0-200
  saturation: number; // 0-200
  grayscale: number; // 0-100
  sepia: number; // 0-100
}

export interface ImageMetadata extends MediaMetadata {
  cropArea?: CropArea;
  rotation: number;
  flip: { horizontal: boolean; vertical: boolean };
  filters: FilterSettings;
  originalDimensions: Dimensions;
  editedDimensions: Dimensions;
}

export interface VideoMetadata extends MediaMetadata {
  thumbnail: string;
  duration: number;
  codec?: string;
  bitrate?: number;
  fps?: number;
}

export interface Dimensions {
  width: number;
  height: number;
}

export interface AspectRatio {
  label: string;
  value: number; // width/height
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface ValidationRules {
  allowedTypes: string[];
  maxSize: number; // in bytes
  minDimensions?: Dimensions;
  maxDimensions?: Dimensions;
  maxDuration?: number; // for videos
}

export interface ImageOperation {
  type: "crop" | "rotate" | "flip" | "filter" | "resize";
  params: any;
}

export interface EditorState {
  originalImage: string;
  currentImage: string;
  history: ImageOperation[];
  historyIndex: number;
  isDirty: boolean;
}
```

---

## API Endpoints

### Upload Media

```typescript
POST /api/media/upload

Request (multipart/form-data):
- files: File[]
- metadata: MediaMetadata[]

Response:
{
  success: boolean;
  data: {
    uploadedFiles: {
      id: string;
      url: string;
      thumbnailUrl?: string;
      metadata: MediaMetadata;
    }[];
  };
  errors?: string[];
}
```

### Delete Media

```typescript
DELETE / api / media / [id];

Response: {
  success: boolean;
  message: string;
}
```

### Update Media Metadata

```typescript
PATCH / api / media / [id] / metadata;

Request: {
  metadata: Partial<MediaMetadata>;
}

Response: {
  success: boolean;
  data: MediaMetadata;
}
```

---

## Usage Examples

### 1. Product Image Upload with Editing

```tsx
import { MediaUploader } from "@/components/media/MediaUploader";
import { useState } from "react";

export default function ProductForm() {
  const [productImages, setProductImages] = useState<MediaFile[]>([]);

  return (
    <div>
      <MediaUploader
        mode="image"
        multiple={true}
        maxFiles={10}
        requireMetadata={true}
        onUpload={(files) => {
          setProductImages([...productImages, ...files]);
        }}
      />
    </div>
  );
}
```

### 2. Return Request with Video Evidence

```tsx
import { MediaUploader } from "@/components/media/MediaUploader";

export default function ReturnRequestForm() {
  const [evidence, setEvidence] = useState<MediaFile[]>([]);

  return (
    <div>
      <h3>Upload Photos or Videos of the Issue</h3>
      <MediaUploader
        mode="both"
        multiple={true}
        maxFiles={5}
        maxSizeVideo={50}
        requireMetadata={false}
        onUpload={(files) => {
          setEvidence([...evidence, ...files]);
        }}
      />
    </div>
  );
}
```

### 3. Shop Logo with Cropping

```tsx
import { MediaUploader } from "@/components/media/MediaUploader";

export default function ShopSettings() {
  const [logo, setLogo] = useState<MediaFile | null>(null);

  return (
    <div>
      <h3>Shop Logo</h3>
      <MediaUploader
        mode="image"
        multiple={false}
        requireMetadata={false}
        onUpload={(files) => {
          setLogo(files[0]);
        }}
      />
    </div>
  );
}
```

---

## Best Practices

### 1. Performance Optimization

- Use Web Workers for heavy image processing
- Lazy load media gallery items
- Use intersection observer for thumbnail loading
- Implement virtual scrolling for large galleries
- Cache processed images in IndexedDB

### 2. Security

- Validate file types on both client and server
- Scan uploaded files for malware
- Sanitize file names and metadata
- Implement rate limiting for uploads
- Use signed URLs for media access

### 3. User Experience

- Show upload progress
- Provide clear error messages
- Allow editing before upload
- Save drafts of edited images
- Support keyboard shortcuts
- Provide undo/redo functionality

### 4. Accessibility

- Provide alt text fields
- Support keyboard navigation
- Add ARIA labels
- Announce status changes to screen readers
- Ensure sufficient color contrast

### 5. Mobile Optimization

- Support touch gestures (pinch to zoom)
- Optimize for smaller screens
- Reduce image quality for mobile uploads
- Use native camera app when beneficial
- Handle orientation changes

---

## Browser Compatibility

### Required APIs

- **MediaDevices API**: Camera access (90%+ support)
- **MediaRecorder API**: Video recording (90%+ support)
- **Canvas API**: Image processing (98%+ support)
- **File API**: File handling (98%+ support)
- **Blob API**: Binary data (98%+ support)

### Fallbacks

- Provide file upload fallback for camera access
- Show browser compatibility warnings
- Progressive enhancement approach
- Polyfills for older browsers

---

## Testing Checklist

- [ ] Upload image from file system
- [ ] Upload video from file system
- [ ] Capture photo from camera
- [ ] Record video from camera
- [ ] Crop image to different aspect ratios
- [ ] Rotate and flip images
- [ ] Apply filters and adjustments
- [ ] Generate video thumbnails
- [ ] Add metadata (slug, description)
- [ ] Delete media items
- [ ] Reorder media items
- [ ] Bulk operations
- [ ] Error handling (oversized files, invalid formats)
- [ ] Progress indicators
- [ ] Mobile responsiveness
- [ ] Keyboard navigation
- [ ] Screen reader compatibility
- [ ] Performance with large files
- [ ] Multiple simultaneous uploads

---

## Dependencies

```json
{
  "dependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "react-easy-crop": "^5.0.0",
    "@radix-ui/react-dialog": "^1.0.0",
    "@radix-ui/react-slider": "^1.0.0",
    "@radix-ui/react-tabs": "^1.0.0",
    "lucide-react": "^0.300.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "typescript": "^5.0.0"
  }
}
```

---

## Implementation Timeline

### Week 1: Core Infrastructure

- MediaUploader component
- File validation
- Basic preview
- API endpoints

### Week 2: Camera & Recording

- CameraCapture component
- VideoRecorder component
- Permission handling
- Browser compatibility

### Week 3: Image Editing

- ImageEditor component
- Crop functionality
- Rotate/flip
- Filters and adjustments

### Week 4: Video Processing

- VideoThumbnailGenerator
- Thumbnail extraction
- Multiple thumbnails
- Metadata extraction

### Week 5: UI Polish

- MediaPreviewCard
- MediaGallery
- MediaEditorModal
- Loading states

### Week 6: Testing & Optimization

- Unit tests
- Integration tests
- Performance optimization
- Documentation

---

Last Updated: November 7, 2025
