# Upload Components API Documentation

## Overview

The `@letitrip/react-library` provides two main upload components with advanced features for media handling:

1. **ImageUploadWithCrop** - Image upload with cropping, zoom, and rotation
2. **VideoUploadWithThumbnail** - Video upload with automatic thumbnail generation

Both components use a pluggable upload service architecture for flexibility.

---

## ImageUploadWithCrop

Advanced image upload component with live preview, cropping, zoom, and rotation controls.

### Import

```typescript
import { ImageUploadWithCrop, type CropData } from "@letitrip/react-library";
```

### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `uploadService` | `IUploadService` | Yes | - | Upload service implementation (Firebase, API, Mock) |
| `onUploadComplete` | `(url: string) => void` | No | - | Callback when upload succeeds |
| `onError` | `(error: string) => void` | No | - | Callback when upload fails |
| `maxSize` | `number` | No | `5MB` | Maximum file size in bytes |
| `allowedTypes` | `string[]` | No | `['image/jpeg', 'image/png', 'image/webp']` | Allowed MIME types |
| `context` | `string` | No | - | Upload context (e.g., "product", "avatar") |
| `contextId` | `string` | No | - | Context identifier (e.g., product ID) |
| `autoDelete` | `boolean` | No | `false` | Enable auto-delete after 24 hours |
| `className` | `string` | No | - | Additional CSS classes |

### CropData Interface

```typescript
interface CropData {
  x: number;          // Horizontal offset in pixels
  y: number;          // Vertical offset in pixels
  width: number;      // Original image width
  height: number;     // Original image height
  zoom: number;       // Zoom level (0.5 - 3.0)
  rotation: number;   // Rotation angle (0, 90, 180, 270)
}
```

### Basic Usage

```typescript
import { ImageUploadWithCrop } from "@letitrip/react-library";
import { useUploadService } from "@/contexts/ServicesContext";

function ProductImageUpload() {
  const uploadService = useUploadService();

  return (
    <ImageUploadWithCrop
      uploadService={uploadService}
      onUploadComplete={(url) => {
        console.log("Image uploaded:", url);
      }}
      onError={(error) => {
        console.error("Upload failed:", error);
      }}
      maxSize={5 * 1024 * 1024}  // 5MB
      context="product"
      contextId="product-123"
      autoDelete={true}
    />
  );
}
```

### With Form Integration

```typescript
import { ImageUploadWithCrop } from "@letitrip/react-library";
import { useState } from "react";

function ProductForm() {
  const [imageUrl, setImageUrl] = useState<string>("");
  const uploadService = useUploadService();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!imageUrl) {
      alert("Please upload an image");
      return;
    }

    // Submit form with image URL
    await createProduct({ image: imageUrl, ...formData });
  };

  return (
    <form onSubmit={handleSubmit}>
      <ImageUploadWithCrop
        uploadService={uploadService}
        onUploadComplete={setImageUrl}
        context="product"
      />
      
      {imageUrl && (
        <img src={imageUrl} alt="Preview" className="mt-4" />
      )}
      
      <button type="submit">Create Product</button>
    </form>
  );
}
```

### Features

- **Zoom Controls**: 0.5x to 3x zoom with slider and +/- buttons
- **Rotation**: 90° increments with rotate button
- **Pan/Drag**: Mouse drag or touch to reposition image
- **Preview**: Live preview of transformations
- **Validation**: File type and size validation
- **Progress**: Upload progress indicator
- **Mobile**: Touch-optimized controls
- **Error Handling**: Comprehensive error messages

### Best Practices

1. **Always provide context and contextId** for better file organization
2. **Enable autoDelete** for temporary uploads (drafts, previews)
3. **Set appropriate maxSize** based on your use case
4. **Handle errors gracefully** with user-friendly messages
5. **Show preview** after upload completes

---

## VideoUploadWithThumbnail

Video upload component with automatic thumbnail generation and frame selection.

### Import

```typescript
import { VideoUploadWithThumbnail } from "@letitrip/react-library";
```

### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `uploadService` | `IUploadService` | Yes | - | Upload service implementation |
| `onUploadComplete` | `(videoUrl: string, thumbnailUrl: string) => void` | No | - | Callback with both URLs |
| `onError` | `(error: string) => void` | No | - | Callback when upload fails |
| `maxSize` | `number` | No | `50MB` | Maximum file size in bytes |
| `maxDuration` | `number` | No | `300` | Maximum duration in seconds |
| `allowedTypes` | `string[]` | No | `['video/mp4', 'video/webm', 'video/quicktime']` | Allowed MIME types |
| `context` | `string` | No | - | Upload context (e.g., "auction") |
| `contextId` | `string` | No | - | Context identifier |
| `autoDelete` | `boolean` | No | `false` | Enable auto-delete after 24 hours |
| `className` | `string` | No | - | Additional CSS classes |

### Basic Usage

```typescript
import { VideoUploadWithThumbnail } from "@letitrip/react-library";
import { useUploadService } from "@/contexts/ServicesContext";

function AuctionVideoUpload() {
  const uploadService = useUploadService();

  return (
    <VideoUploadWithThumbnail
      uploadService={uploadService}
      onUploadComplete={(videoUrl, thumbnailUrl) => {
        console.log("Video:", videoUrl);
        console.log("Thumbnail:", thumbnailUrl);
      }}
      maxSize={50 * 1024 * 1024}  // 50MB
      maxDuration={300}  // 5 minutes
      context="auction"
      contextId="auction-456"
    />
  );
}
```

### With Form Integration

```typescript
import { VideoUploadWithThumbnail } from "@letitrip/react-library";
import { useState } from "react";

function AuctionForm() {
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [thumbnailUrl, setThumbnailUrl] = useState<string>("");
  const uploadService = useUploadService();

  const handleVideoUpload = (video: string, thumbnail: string) => {
    setVideoUrl(video);
    setThumbnailUrl(thumbnail);
  };

  return (
    <form>
      <VideoUploadWithThumbnail
        uploadService={uploadService}
        onUploadComplete={handleVideoUpload}
        context="auction"
      />
      
      {videoUrl && (
        <div className="mt-4">
          <video src={videoUrl} controls className="w-full" />
          <img src={thumbnailUrl} alt="Thumbnail" className="mt-2" />
        </div>
      )}
      
      <button type="submit">Create Auction</button>
    </form>
  );
}
```

### Features

- **Auto Thumbnail**: Automatic generation from first frame
- **Frame Selection**: Timeline slider to choose thumbnail frame
- **Video Preview**: HTML5 video player with controls
- **Duration Display**: Shows video length
- **Size Display**: Shows file size
- **Validation**: File type, size, and duration validation
- **Progress**: Separate progress for video and thumbnail
- **Mobile**: Mobile-optimized controls

### Best Practices

1. **Set maxDuration** to prevent extremely long videos
2. **Validate file size** before upload (50MB recommended max)
3. **Provide context** for better organization
4. **Handle both URLs** (video and thumbnail) in your form
5. **Show preview** with controls for user verification

---

## Upload Service Configuration

Both components require an upload service. Use the services context:

```typescript
import { ServicesProvider } from "@/contexts/ServicesContext";
import { services } from "@/lib/services/factory";

function App() {
  return (
    <ServicesProvider services={services}>
      <YourComponents />
    </ServicesProvider>
  );
}
```

### Available Upload Services

1. **Firebase Storage** (default):
   ```typescript
   import { services } from "@/lib/services/factory";
   const uploadService = services.upload.storage;
   ```

2. **API Endpoint**:
   ```typescript
   const uploadService = services.upload.api;
   ```

3. **Mock Service** (testing):
   ```typescript
   import { MockUploadService } from "@letitrip/react-library";
   const uploadService = new MockUploadService({
     mockUrl: "https://example.com/test.jpg",
     delay: 100,
   });
   ```

---

## Hook: useMediaUpload

Low-level hook for custom upload implementations.

### Import

```typescript
import { useMediaUpload } from "@letitrip/react-library";
```

### Usage

```typescript
const { upload, uploading, progress, error } = useMediaUpload({
  uploadService,
  onProgress: (percent) => console.log(`${percent}% uploaded`),
  onSuccess: (url) => console.log("Uploaded:", url),
  onError: (err) => console.error("Error:", err),
});

// Upload a file
await upload(file, { context: "product", contextId: "123" });
```

---

## Examples

### Multiple Image Upload

```typescript
function MultipleImageUpload() {
  const [images, setImages] = useState<string[]>([]);
  const uploadService = useUploadService();

  const handleUpload = (url: string) => {
    setImages(prev => [...prev, url]);
  };

  return (
    <div>
      {images.map((url, i) => (
        <img key={i} src={url} alt={`Image ${i + 1}`} />
      ))}
      
      <ImageUploadWithCrop
        uploadService={uploadService}
        onUploadComplete={handleUpload}
        context="product"
        contextId="product-123"
      />
    </div>
  );
}
```

### Custom Error Handling

```typescript
function UploadWithCustomErrors() {
  const [errorMessage, setErrorMessage] = useState<string>("");
  const uploadService = useUploadService();

  const handleError = (error: string) => {
    if (error.includes("size")) {
      setErrorMessage("File is too large. Max size: 5MB");
    } else if (error.includes("type")) {
      setErrorMessage("Only JPEG, PNG, and WebP images are allowed");
    } else {
      setErrorMessage("Upload failed. Please try again.");
    }
  };

  return (
    <div>
      {errorMessage && (
        <div className="alert alert-error">{errorMessage}</div>
      )}
      
      <ImageUploadWithCrop
        uploadService={uploadService}
        onError={handleError}
        maxSize={5 * 1024 * 1024}
        allowedTypes={['image/jpeg', 'image/png', 'image/webp']}
      />
    </div>
  );
}
```

---

## Testing

### Unit Testing with MockUploadService

```typescript
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MockUploadService } from "@letitrip/react-library";
import { ImageUploadWithCrop } from "@letitrip/react-library";

test("uploads image successfully", async () => {
  const mockService = new MockUploadService({
    mockUrl: "https://example.com/image.jpg",
    delay: 100,
  });

  const onComplete = jest.fn();

  render(
    <ImageUploadWithCrop
      uploadService={mockService}
      onUploadComplete={onComplete}
    />
  );

  const file = new File(["content"], "test.jpg", { type: "image/jpeg" });
  const input = screen.getByLabelText(/upload/i);

  await userEvent.upload(input, file);

  await waitFor(() => {
    expect(onComplete).toHaveBeenCalledWith("https://example.com/image.jpg");
  });
});
```

### Integration Testing

```typescript
import { render, screen } from "@testing-library/react";
import { ServicesProvider } from "@/contexts/ServicesContext";
import ProductForm from "./ProductForm";

test("product form with image upload", () => {
  render(
    <ServicesProvider>
      <ProductForm />
    </ServicesProvider>
  );

  expect(screen.getByText(/upload image/i)).toBeInTheDocument();
});
```

---

## Performance

### Bundle Size

- ImageUploadWithCrop: ~12KB (gzipped)
- VideoUploadWithThumbnail: ~15KB (gzipped)
- Combined: ~18KB (gzipped) with shared dependencies

### Optimization Tips

1. **Lazy load** components if not immediately needed
2. **Use code splitting** for video upload (larger bundle)
3. **Implement image optimization** before upload
4. **Cache upload service** instance

---

## Migration Guide

### From Old Upload Components

**Before** (old components):
```typescript
import ImageUploadWithCrop from "@/components/upload/ImageUploadWithCrop";

<ImageUploadWithCrop onUpload={handleUpload} />
```

**After** (library components):
```typescript
import { ImageUploadWithCrop } from "@letitrip/react-library";
import { useUploadService } from "@/contexts/ServicesContext";

const uploadService = useUploadService();

<ImageUploadWithCrop 
  uploadService={uploadService}
  onUploadComplete={handleUpload}
/>
```

### Key Changes

1. **Upload service required**: Pass `uploadService` prop
2. **Callback renamed**: `onUpload` → `onUploadComplete`
3. **Import path**: From `@/components/upload` to `@letitrip/react-library`

---

## Troubleshooting

### Common Issues

**Issue**: "uploadService is undefined"  
**Solution**: Wrap component in `ServicesProvider` and use `useUploadService()` hook

**Issue**: "File type not allowed"  
**Solution**: Check `allowedTypes` prop matches your file MIME type

**Issue**: "Upload failed with CORS error"  
**Solution**: Configure CORS on your upload endpoint or Firebase Storage

**Issue**: "Thumbnail not generating"  
**Solution**: Ensure video is a valid format and browser supports video preview

---

## Related Documentation

- [Service Adapters Guide](../SERVICE-ADAPTERS.md)
- [Testing Guide](../testing.md)
- [Migration Guide](../migration-guide.md)
- [Getting Started](../getting-started.md)
