# Media Upload Cleanup System - Usage Guide

## Overview

This system automatically cleans up uploaded media files from Firebase Storage when resource creation fails, preventing orphaned files and storage waste.

## Problem Statement

Traditional upload flow:

1. User selects images
2. Images upload immediately to Firebase Storage
3. User fills out form
4. User clicks "Create"
5. **If creation fails** → Images remain in Storage (orphaned)

## Solution

The `useMediaUploadWithCleanup` hook tracks uploaded files and automatically deletes them if resource creation fails.

## Quick Start

### 1. Import the Hook

```typescript
import { useMediaUploadWithCleanup } from "@/hooks/useMediaUploadWithCleanup";
```

### 2. Initialize in Your Component

```typescript
const {
  uploadMedia, // Upload single file
  uploadMultipleMedia, // Upload multiple files
  cleanupUploadedMedia, // Clean up all tracked files
  clearTracking, // Stop tracking (on success)
  isUploading, // Upload status
  hasUploadedMedia, // True if files tracked
} = useMediaUploadWithCleanup({
  onUploadSuccess: (url) => {
    // Update your form state with the URL
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, url],
    }));
  },
  onUploadError: (error) => {
    console.error("Upload failed:", error);
  },
});
```

### 3. Handle File Upload

```typescript
const handleFilesAdded = async (files: MediaFile[]) => {
  try {
    // Convert MediaFile[] to File[]
    const fileObjects = files.map((f) => f.file);

    // Upload and track
    await uploadMultipleMedia(fileObjects, "product", productId);
  } catch (error) {
    console.error("Failed to upload:", error);
  }
};
```

### 4. Handle Form Submission

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    // Try to create the resource
    await apiService.post("/products", formData);

    // ✅ Success! Clear tracking (keep files in Storage)
    clearTracking();

    // Navigate away
    router.push("/products");
  } catch (error) {
    // ❌ Failed! Clean up uploaded files
    await cleanupUploadedMedia();

    // Reset form
    setFormData((prev) => ({ ...prev, images: [] }));

    alert("Failed to create product. Uploaded images have been deleted.");
  }
};
```

### 5. Handle Cancel/Navigation

```typescript
const handleCancel = async () => {
  if (hasUploadedMedia) {
    // Confirm before cleaning up
    const confirmed = confirm(
      "You have uploaded images. Cancel and delete them?"
    );

    if (confirmed) {
      await cleanupUploadedMedia();
      router.back();
    }
  } else {
    router.back();
  }
};
```

## Complete Example

```typescript
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMediaUploadWithCleanup } from "@/hooks/useMediaUploadWithCleanup";
import MediaUploader from "@/components/media/MediaUploader";
import { apiService } from "@/services/api.service";
import { MediaFile } from "@/types/media";

export default function CreateHeroSlideForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    image_url: "",
  });
  const [saving, setSaving] = useState(false);

  // Initialize cleanup hook
  const {
    uploadMedia,
    cleanupUploadedMedia,
    clearTracking,
    isUploading,
    hasUploadedMedia,
  } = useMediaUploadWithCleanup({
    onUploadSuccess: (url) => {
      setFormData((prev) => ({ ...prev, image_url: url }));
    },
    onUploadError: (error) => {
      alert(`Upload failed: ${error}`);
    },
  });

  // Handle file upload from MediaUploader
  const handleFilesAdded = async (files: MediaFile[]) => {
    if (files.length > 0) {
      try {
        // Upload and track the file
        await uploadMedia(files[0].file, "shop");
      } catch (error) {
        console.error("Upload failed:", error);
      }
    }
  };

  // Handle form submission with cleanup
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.image_url) {
      alert("Title and image are required");
      return;
    }

    setSaving(true);

    try {
      // Create the hero slide
      await apiService.post("/admin/hero-slides", formData);

      // Success! Don't delete the uploaded image
      clearTracking();

      // Redirect
      router.push("/admin/hero-slides");
    } catch (error) {
      console.error("Failed to create slide:", error);

      // Failure! Delete the uploaded image
      await cleanupUploadedMedia();

      // Reset form
      setFormData((prev) => ({ ...prev, image_url: "" }));

      alert("Failed to create slide. Uploaded image has been deleted.");
    } finally {
      setSaving(false);
    }
  };

  // Handle cancel with cleanup
  const handleCancel = async () => {
    if (hasUploadedMedia) {
      const confirmed = confirm(
        "You have an uploaded image. Cancel and delete it?"
      );

      if (!confirmed) return;

      await cleanupUploadedMedia();
    }

    router.back();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-4 py-2 border rounded-lg"
          required
        />
      </div>

      {/* Image Uploader */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Image <span className="text-red-500">*</span>
        </label>
        <MediaUploader
          accept="image"
          maxFiles={1}
          resourceType="shop"
          onFilesAdded={handleFilesAdded}
          files={[]}
          disabled={isUploading}
        />
        {formData.image_url && (
          <img
            src={formData.image_url}
            alt="Uploaded"
            className="mt-4 w-full h-48 object-cover rounded-lg"
          />
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={saving || isUploading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
        >
          {saving ? "Creating..." : "Create Slide"}
        </button>
        <button
          type="button"
          onClick={handleCancel}
          disabled={saving || isUploading}
          className="px-6 py-2 bg-gray-200 rounded-lg"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
```

## Hook API Reference

### Functions

#### `uploadMedia(file, context, contextId?)`

Upload a single file and track it.

- **file**: `File` object
- **context**: `'product' | 'shop' | 'auction' | 'review' | 'return' | 'avatar' | 'category'`
- **contextId**: Optional resource ID
- **Returns**: `Promise<string>` (uploaded URL)

#### `uploadMultipleMedia(files, context, contextId?)`

Upload multiple files and track them.

- **files**: `File[]` array
- **context**: Resource context
- **contextId**: Optional resource ID
- **Returns**: `Promise<string[]>` (uploaded URLs)

#### `cleanupUploadedMedia()`

Delete all tracked files from Firebase Storage.

- **Returns**: `Promise<void>`

#### `clearTracking()`

Stop tracking files without deleting them (call on success).

- **Returns**: `void`

#### `removeFromTracking(url)`

Remove specific file from tracking.

- **url**: File URL to stop tracking
- **Returns**: `void`

### State

- **uploadedMedia**: `UploadedMedia[]` - Array of tracked uploads
- **isUploading**: `boolean` - Upload in progress
- **isCleaning**: `boolean` - Cleanup in progress
- **hasUploadedMedia**: `boolean` - True if any files tracked

### Callbacks

- **onUploadSuccess**: `(url: string) => void` - Called when upload succeeds
- **onUploadError**: `(error: string) => void` - Called when upload fails
- **onCleanupComplete**: `() => void` - Called when cleanup finishes

## Use Cases

### 1. Hero Slides

```typescript
await uploadMedia(file, "shop"); // 'shop' context for hero slides
```

### 2. Products

```typescript
await uploadMultipleMedia(files, "product", productId);
```

### 3. Shops

```typescript
await uploadMedia(logoFile, "shop", shopId);
await uploadMedia(bannerFile, "shop", shopId);
```

### 4. Reviews

```typescript
await uploadMultipleMedia(files, "review", reviewId);
```

## Best Practices

### ✅ DO

- **Always use the cleanup hook** for forms with media upload
- **Call `clearTracking()` after successful resource creation**
- **Call `cleanupUploadedMedia()` when creation fails**
- **Handle cancel/back navigation** with cleanup
- **Show loading states** using `isUploading` and `isCleaning`
- **Disable submit button** while uploading or cleaning

### ❌ DON'T

- **Don't skip cleanup** on errors (creates orphaned files)
- **Don't call `clearTracking()` on errors** (files won't be cleaned up)
- **Don't allow navigation** without cleanup prompt
- **Don't upload files** on form submit (upload immediately)

## Testing Cleanup

1. Open browser DevTools → Network tab
2. Start creating a resource (product, shop, etc.)
3. Upload an image
4. Note the Firebase Storage URL in Network tab
5. Submit form with invalid data (to trigger failure)
6. Check Network tab for DELETE request to `/api/media/delete`
7. Verify the image is deleted from Firebase Storage console

## Troubleshooting

### Files not being cleaned up?

- Ensure `cleanupUploadedMedia()` is called in the catch block
- Check browser console for errors
- Verify Firebase Storage permissions

### Getting "File not found" errors?

- The file may have already been deleted
- Check if you're calling cleanup multiple times
- Verify the URL format is correct

### Cleanup is slow?

- This is normal for many files (each requires a Storage API call)
- Show a loading indicator using the `isCleaning` flag
- Consider batch deletion for performance

## Migration Guide

### Converting Existing Forms

**Before:**

```typescript
const handleSubmit = async () => {
  try {
    await apiService.post("/products", formData);
    router.push("/products");
  } catch (error) {
    alert("Failed to create product");
    // ❌ Uploaded images remain in Storage!
  }
};
```

**After:**

```typescript
const { cleanupUploadedMedia, clearTracking } = useMediaUploadWithCleanup();

const handleSubmit = async () => {
  try {
    await apiService.post("/products", formData);
    clearTracking(); // ✅ Don't delete on success
    router.push("/products");
  } catch (error) {
    await cleanupUploadedMedia(); // ✅ Delete on failure
    alert("Failed to create product. Images deleted.");
  }
};
```

## Related Files

- Hook: `src/hooks/useMediaUploadWithCleanup.ts`
- API: `src/app/api/media/delete/route.ts`
- Service: `src/services/media.service.ts`
- Example: `src/components/examples/ExampleMediaCleanup.tsx`
- Guide: `AI-AGENT-GUIDE.md` (Media Upload section)

## Support

For issues or questions, check:

1. Browser console for error messages
2. Firebase Storage console for orphaned files
3. Network tab for failed API requests
4. AI-AGENT-GUIDE.md for implementation patterns
