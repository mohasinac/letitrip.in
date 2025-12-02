# Media Upload Enhancements - Resource Documentation

## Overview

Advanced media upload features including image editing (crop, zoom, rotate), mobile focus point selection, and video thumbnail generation.

## Files

### Core Implementation

| File | Purpose | Lines |
|------|---------|-------|
| `src/components/media/ImageEditor.tsx` | Crop, zoom, rotate with tabbed UI | ~450 |
| `src/components/media/VideoThumbnailGenerator.tsx` | Client-side thumbnail generation | ~280 |
| `src/components/media/MediaEditorModal.tsx` | Modal wrapper for editing | ~150 |
| `src/components/media/FocusPointSelector.tsx` | Mobile focus point UI | Integrated in ImageEditor |
| `src/components/common/OptimizedImage.tsx` | Uses focus point for rendering | ~180 |
| `src/types/media.ts` | Type definitions | ~60 |

### Dependencies

- `react-easy-crop` - Image cropping with zoom/rotate (~20KB)
- Canvas API - Video thumbnail generation (browser native)

## ImageEditor Component

### Features

1. **Crop Tab**:
   - Freeform or preset aspect ratios (1:1, 4:3, 16:9, free)
   - Zoom control (1-3x scale)
   - Rotation (90° increments)
   - Flip horizontal/vertical
   - Uses `react-easy-crop` library

2. **Focus Tab**:
   - Click/tap to set focus point
   - Visual crosshair indicator
   - Mobile preview showing cropped result
   - Percentage-based coordinates (0-100)

### Props

```typescript
interface ImageEditorProps {
  image: File | string;
  aspectRatio?: number; // e.g., 1 for square, 16/9 for widescreen
  onSave: (editedImage: Blob, focusPoint?: FocusPoint) => void;
  onCancel: () => void;
  showFocusPoint?: boolean; // Default: true
}

interface FocusPoint {
  x: number; // 0-100 (percentage from left)
  y: number; // 0-100 (percentage from top)
}
```

### Usage

```tsx
import { ImageEditor } from '@/components/media/ImageEditor';

const [editing, setEditing] = useState(false);
const [imageFile, setImageFile] = useState<File | null>(null);

const handleSave = async (editedBlob: Blob, focusPoint?: FocusPoint) => {
  // Upload edited image
  const formData = new FormData();
  formData.append('file', editedBlob, 'edited-image.jpg');
  formData.append('focusX', String(focusPoint?.x || 50));
  formData.append('focusY', String(focusPoint?.y || 50));
  
  const response = await uploadMedia(formData);
  // Use response.url, response.focusX, response.focusY
  
  setEditing(false);
};

{editing && (
  <ImageEditor
    image={imageFile}
    aspectRatio={1} // Square crop
    onSave={handleSave}
    onCancel={() => setEditing(false)}
    showFocusPoint={true}
  />
)}
```

### UI Structure

```
┌──────────────────────────────────────┐
│ [Cancel]  [Crop | Focus]   [Apply]  │ ← Header
├──────────────────────────────────────┤
│                                      │
│          [Image Preview]             │ ← Crop/Focus Area
│           with Controls              │
│                                      │
├──────────────────────────────────────┤
│ [Zoom] ──────●───────── [100%]      │ ← Controls
│ [Rotate L] [Rotate R] [Flip H]      │
│ [1:1] [4:3] [16:9] [Free]           │
└──────────────────────────────────────┘
```

## Focus Point Feature

### Purpose

On mobile screens, images display smaller. Instead of shrinking the entire image, we crop to show the area around the focus point at a readable size.

### Implementation

```tsx
// Setting focus point
<div
  className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-crosshair"
  onClick={(e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setFocusPoint({ x, y });
  }}
>
  <img src={imageUrl} alt="Preview" className="w-full h-full object-contain" />
  
  {/* Crosshair indicator */}
  <div
    className="absolute w-8 h-8 border-2 border-white rounded-full -translate-x-1/2 -translate-y-1/2"
    style={{
      left: `${focusPoint.x}%`,
      top: `${focusPoint.y}%`,
    }}
  >
    <Plus className="w-4 h-4 text-white" />
  </div>
</div>

{/* Mobile preview */}
<div className="flex gap-4 mt-4">
  <div className="text-center">
    <p className="text-xs text-gray-500 mb-2">Desktop</p>
    <div className="w-32 h-32 overflow-hidden rounded">
      <img src={imageUrl} className="w-full h-full object-cover" />
    </div>
  </div>
  <div className="text-center">
    <p className="text-xs text-gray-500 mb-2">Mobile Focus</p>
    <div className="w-20 h-20 overflow-hidden rounded">
      <img
        src={imageUrl}
        className="h-full object-cover"
        style={{
          objectPosition: `${focusPoint.x}% ${focusPoint.y}%`,
        }}
      />
    </div>
  </div>
</div>
```

### Rendering with Focus Point

```tsx
// OptimizedImage component
<OptimizedImage
  src="/products/iphone.jpg"
  alt="iPhone 14 Pro"
  width={400}
  height={400}
  objectFit="cover"
  focusX={50}  // Center horizontally
  focusY={35}  // 35% from top (focus on product, not background)
/>

// Renders as:
<Image
  src="/products/iphone.jpg"
  alt="iPhone 14 Pro"
  width={400}
  height={400}
  style={{
    objectFit: 'cover',
    objectPosition: '50% 35%',
  }}
/>
```

## Video Thumbnail Generation

### Component

```tsx
interface VideoThumbnailGeneratorProps {
  video: File | string;
  onSave: (thumbnailBlob: Blob, timestamp: number) => void;
  onCancel: () => void;
}

const VideoThumbnailGenerator: React.FC<VideoThumbnailGeneratorProps> = ({
  video,
  onSave,
  onCancel,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(1);
  
  // Generate thumbnail from current frame
  const generateThumbnail = () => {
    const video = videoRef.current;
    if (!video) return;
    
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    ctx?.drawImage(video, 0, 0);
    
    canvas.toBlob((blob) => {
      if (blob) onSave(blob, currentTime);
    }, 'image/jpeg', 0.8);
  };
  
  return (
    <div className="fixed inset-0 bg-black/90 z-50">
      {/* Video preview */}
      <video
        ref={videoRef}
        src={typeof video === 'string' ? video : URL.createObjectURL(video)}
        onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)}
        className="w-full h-auto"
      />
      
      {/* Timeline scrubber */}
      <input
        type="range"
        min={0}
        max={duration}
        step={0.1}
        value={currentTime}
        onChange={(e) => {
          const time = parseFloat(e.target.value);
          setCurrentTime(time);
          if (videoRef.current) videoRef.current.currentTime = time;
        }}
        className="w-full"
      />
      
      {/* Actions */}
      <button onClick={generateThumbnail}>Use This Frame</button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  );
};
```

## MediaMetadata Type

```typescript
interface MediaMetadata {
  // Existing fields
  url: string;
  filename: string;
  size: number;
  type: string;
  width?: number;
  height?: number;
  duration?: number; // For videos
  
  // New fields
  focusX?: number; // 0-100, percentage from left
  focusY?: number; // 0-100, percentage from top
  thumbnail?: string; // URL for video thumbnail
  thumbnailTimestamp?: number; // Seconds into video
  
  // Editing metadata
  edited?: boolean;
  editedAt?: string; // ISO timestamp
  originalUrl?: string; // Before editing
}
```

## MediaUploader Integration

```tsx
// src/components/media/MediaUploader.tsx

interface MediaUploaderProps {
  // ... existing props
  enableEditing?: boolean; // Show edit button
  onFileEdited?: (file: File, focusPoint?: FocusPoint) => void;
}

const MediaUploader: React.FC<MediaUploaderProps> = ({
  enableEditing = false,
  onFileEdited,
  ...props
}) => {
  const [editing, setEditing] = useState<File | null>(null);
  
  const handleEdit = (file: File) => {
    setEditing(file);
  };
  
  const handleSaveEdit = (editedBlob: Blob, focusPoint?: FocusPoint) => {
    const editedFile = new File([editedBlob], file.name, { type: 'image/jpeg' });
    onFileEdited?.(editedFile, focusPoint);
    setEditing(null);
  };
  
  return (
    <>
      <div>
        {/* Upload UI */}
        {enableEditing && (
          <button onClick={() => handleEdit(file)}>Edit</button>
        )}
      </div>
      
      {editing && (
        <MediaEditorModal
          file={editing}
          onSave={handleSaveEdit}
          onCancel={() => setEditing(null)}
        />
      )}
    </>
  );
};
```

## Aspect Ratio Presets by Context

| Context | Recommended Ratios | Use Case |
|---------|-------------------|----------|
| Product Main | 1:1 (square) | Consistent grid display |
| Product Gallery | 1:1 or 4:3 | Detail views |
| Auction Image | 1:1 or 4:3 | Grid display |
| Shop Logo | 1:1 (square) | Profile pictures |
| Shop Banner | 16:9 or 3:1 | Wide header images |
| Hero Slide | 16:9 or 21:9 | Full-width banners |
| Blog Featured | 16:9 | Article headers |
| Category Image | 1:1 or 4:3 | Category cards |
| User Avatar | 1:1 (circle crop) | Profile pictures |

## Business Rules

1. **Image Quality**: Save edited images at 80% JPEG quality
2. **Max Dimensions**: Limit edited images to 2048x2048 max
3. **Focus Point Default**: Center (50, 50) if not specified
4. **Video Thumbnail**: Default to frame at 1 second if not specified
5. **Original Preservation**: Keep original URL if user edits later
6. **Aspect Ratio**: Enforce preset ratios for specific contexts
7. **File Size**: Warn if edited image > 5MB

## Testing

### Unit Tests

```typescript
// ImageEditor
- Crop image to square (1:1)
- Crop image to 16:9
- Zoom in/out (1-3x)
- Rotate 90° clockwise/counterclockwise
- Flip horizontal/vertical
- Set focus point via click
- Generate edited blob correctly

// VideoThumbnailGenerator
- Load video and get duration
- Seek to specific timestamp
- Generate thumbnail from frame
- Thumbnail dimensions match video
- Handle video load errors

// OptimizedImage
- Render with focus point (object-position)
- Fallback to center if no focus point
- Show fallback image on error
```

### Integration Tests

```typescript
// MediaUploader with editing
- Show edit button when enableEditing=true
- Click edit button opens ImageEditor
- Save edited image triggers onFileEdited
- Cancel closes editor without saving
- Edited file replaces original in preview

// Upload flow with editing
- Upload image → Show preview
- Click edit → ImageEditor opens
- Crop and set focus point → Save
- Upload edited image to server
- Server returns URL with focusX, focusY
- OptimizedImage renders with focus point
```

### E2E Tests

```typescript
// Product creation with edited image
- Seller uploads product image
- Clicks "Edit" button
- Crops image to square
- Sets focus point on product (not background)
- Saves edited image
- Image uploads to Firebase Storage
- Product created with image URL and focus point
- Product page renders image with correct focus
- Mobile view shows zoomed focus area

// Video thumbnail generation
- Seller uploads product video
- Timeline scrubber appears
- Seller drags to frame at 3 seconds
- Clicks "Use This Frame"
- Thumbnail generated and uploaded
- Product card shows thumbnail
- Clicking thumbnail plays video
```

## Performance Considerations

- **Image Editing**: Process client-side to reduce server load
- **Canvas Optimization**: Reuse canvas element, don't create each time
- **Debouncing**: Debounce zoom/rotate updates (16ms = 60fps)
- **Web Workers**: Consider offloading image processing to worker
- **Lazy Loading**: Only load editor when needed (code splitting)

## Accessibility

- ImageEditor has keyboard shortcuts (Esc = cancel, Enter = save)
- Zoom slider has aria-label "Zoom level"
- Rotation buttons have aria-label "Rotate 90 degrees"
- Focus point has aria-instructions "Click to set focus point"
- Video scrubber has aria-label "Select thumbnail frame"

## Future Enhancements

- [ ] Filters/adjustments (brightness, contrast, saturation)
- [ ] Drawing tools (arrows, text annotations)
- [ ] Multiple focus points (for different screen sizes)
- [ ] Batch editing (apply same edits to multiple images)
- [ ] Undo/redo stack
- [ ] Server-side FFmpeg for video thumbnails (fallback)
- [ ] AI-powered auto focus point detection
- [ ] Object removal tool

## Related Documentation

- Epic: `TDD/epics/E003-auction-system.md` (F003.10: Media Upload)
- Implementation: `docs/26-media-upload-enhancements.md`
- Test Cases: `TDD/resources/auctions/TEST-CASES.md` (Media section)
