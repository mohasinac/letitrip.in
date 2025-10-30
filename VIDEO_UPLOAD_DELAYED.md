# Video Upload - Delayed to Form Submission

## 🎯 Objective

Change video upload behavior to match image upload - store videos locally and upload only when form is submitted (on "Finish" button click).

---

## ✅ Changes Made

### 1. **MediaUploadStep Component**

**File:** `src/components/seller/products/MediaUploadStep.tsx`

#### Updated `handleVideoUpload` Function

**Before:**

- Immediately uploaded videos to Firebase Storage when selected
- Uploaded thumbnails to Firebase Storage
- Required `slug` to exist before upload
- Showed upload progress
- Could fail during selection

**After:**

- ✅ Stores videos locally using `URL.createObjectURL()`
- ✅ Generates thumbnail preview locally
- ✅ Stores both video file and thumbnail blob in state
- ✅ Adds `isNew: true` flag to identify pending uploads
- ✅ No upload until form submission
- ✅ Only validates file size (20MB limit)

```typescript
// OLD - Immediate upload
const handleVideoUpload = async (e) => {
  // ...validate slug exists
  // Upload video to Firebase
  const videoResponse = await uploadWithAuth(...);
  // Upload thumbnail to Firebase
  const thumbnailResponse = await uploadWithAuth(...);
  // Add to state with Firebase URLs
};

// NEW - Local storage
const handleVideoUpload = async (e) => {
  // Generate thumbnail preview
  const { blob: thumbnailBlob, url: thumbnailUrl } = await generateVideoThumbnail(videoFile);

  // Create preview URL for video
  const videoPreviewUrl = URL.createObjectURL(videoFile);

  // Store locally - don't upload yet
  newVideos.push({
    file: videoFile,              // Store file for later upload
    thumbnailBlob: thumbnailBlob, // Store thumbnail for later upload
    url: videoPreviewUrl,         // Temporary preview URL
    thumbnail: thumbnailUrl,      // Temporary thumbnail URL
    order: index,
    name: videoFile.name,
    size: videoFile.size,
    isNew: true,                  // Flag for upload on submit
  });
};
```

#### UI Changes

```typescript
// Button text changed
"Upload Videos" → "Add Videos"
"Uploading..." → "Processing..."

// Caption changed
"X / 2 videos uploaded" → "X / 2 videos • Saved locally until you submit"
```

#### Removed State

```typescript
// REMOVED - No longer needed
const [uploadProgress, setUploadProgress] = useState(0);
```

---

### 2. **Create Product Page**

**File:** `src/app/seller/products/new/page.tsx`

#### Updated TypeScript Interface

```typescript
interface ProductFormData {
  media: {
    videos: Array<{
      url: string;
      thumbnail: string;
      order: number;
      file?: File; // NEW - Video file for upload
      thumbnailBlob?: Blob; // NEW - Thumbnail blob for upload
      isNew?: boolean; // NEW - Upload flag
      path?: string;
      name?: string;
      size?: number;
    }>;
  };
}
```

#### Added `uploadPendingVideos` Function

```typescript
const uploadPendingVideos = async () => {
  const videos = formData.media.videos;
  const uploadedVideos = [];

  for (let i = 0; i < videos.length; i++) {
    const video = videos[i];

    // Skip already uploaded videos
    if (!video.isNew || !video.file) {
      if (!video.isNew) {
        uploadedVideos.push({
          url: video.url,
          thumbnail: video.thumbnail,
          order: i,
          // ...other fields
        });
      }
      continue;
    }

    // Upload video file
    const videoFormData = new FormData();
    videoFormData.append("files", video.file);
    videoFormData.append("slug", formData.seo.slug);
    videoFormData.append("type", "video");

    const videoResponse = await uploadWithAuth(
      "/api/seller/products/media",
      videoFormData
    );

    // Upload thumbnail
    const thumbnailFormData = new FormData();
    thumbnailFormData.append(
      "files",
      video.thumbnailBlob,
      `${videoData.name}-thumb.jpg`
    );
    thumbnailFormData.append("slug", formData.seo.slug);
    thumbnailFormData.append("type", "image");

    const thumbnailResponse = await uploadWithAuth(
      "/api/seller/products/media",
      thumbnailFormData
    );

    uploadedVideos.push({
      url: videoData.url,
      thumbnail: thumbnailData.url,
      // ...other fields
    });

    // Clean up blob URLs
    URL.revokeObjectURL(video.url);
    URL.revokeObjectURL(video.thumbnail);
  }

  return uploadedVideos;
};
```

#### Updated `handleSubmit`

```typescript
const handleSubmit = async () => {
  // ...validation

  try {
    // Upload new images
    const uploadedImages = await uploadPendingImages();

    // Upload new videos ✨ NEW
    const uploadedVideos = await uploadPendingVideos();

    // Prepare form data with uploaded URLs
    const finalFormData = {
      ...formData,
      media: {
        images: uploadedImages,
        videos: uploadedVideos, // ✨ NEW
      },
    };

    // Submit to API
    const response = await apiPost("/api/seller/products", finalFormData);

    if (response.success) {
      // Clean up blob URLs
      formData.media.images.forEach((img) => {
        if (img.isNew && img.url.startsWith("blob:")) {
          URL.revokeObjectURL(img.url);
        }
      });

      // Clean up video blob URLs ✨ NEW
      formData.media.videos.forEach((video) => {
        if (video.isNew && video.url.startsWith("blob:")) {
          URL.revokeObjectURL(video.url);
          URL.revokeObjectURL(video.thumbnail);
        }
      });

      router.push("/seller/products");
    }
  } catch (error) {
    setError(error.message);
  }
};
```

---

### 3. **Edit Product Page**

**File:** `src/app/seller/products/[id]/edit/page.tsx`

#### Same Changes as Create Page

1. ✅ Updated video type interface with `file`, `thumbnailBlob`, `isNew`
2. ✅ Added `uploadPendingImages()` function
3. ✅ Added `uploadPendingVideos()` function
4. ✅ Updated `handleSubmit()` to:
   - Upload pending images
   - Upload pending videos
   - Use uploaded URLs in API payload
   - Clean up blob URLs after success

---

## 🔄 Upload Flow

### Old Flow (Immediate Upload)

```
User selects video
  ↓
Check slug exists ❌ Error if missing
  ↓
Validate file size
  ↓
Generate thumbnail
  ↓
Upload video to Firebase ❌ Can fail here
  ↓
Upload thumbnail to Firebase ❌ Can fail here
  ↓
Add to form state with Firebase URLs
```

### New Flow (Delayed Upload)

```
User selects video
  ↓
Validate file size
  ↓
Generate thumbnail locally
  ↓
Create blob URLs for preview
  ↓
Add to form state with local URLs
  ↓
User clicks "Finish" ✅
  ↓
Upload video to Firebase
  ↓
Upload thumbnail to Firebase
  ↓
Submit form with Firebase URLs
  ↓
Clean up blob URLs
```

---

## ✅ Benefits

1. **No Premature Uploads** - Videos only upload when user is ready to submit
2. **No Slug Dependency** - Can add videos before entering product name
3. **Faster Selection** - Instant feedback, no waiting for upload
4. **Better Error Handling** - Upload errors shown at form submission, not during selection
5. **Consistent UX** - Videos work the same as images
6. **Network Efficiency** - No wasted uploads if user cancels form

---

## 📦 Video Data Structure

### In Form State (Before Submit)

```typescript
{
  file: File,                    // The video file object
  thumbnailBlob: Blob,           // Generated thumbnail
  url: "blob:http://...",        // Local preview URL
  thumbnail: "blob:http://...",  // Local thumbnail URL
  order: 0,
  name: "product-demo.mp4",
  size: 15728640,                // 15 MB
  isNew: true,                   // Flag for upload
}
```

### After Upload (In API)

```typescript
{
  url: "https://storage.googleapis.com/.../video.mp4",
  thumbnail: "https://storage.googleapis.com/.../thumb.jpg",
  order: 0,
  name: "product-demo.mp4",
  size: 15728640,
  path: "sellers/uid/products/buy-slug/video-timestamp.mp4",
}
```

---

## 🧪 Testing Checklist

### Create Product Page

- [x] Can add videos without entering product name first
- [x] Video preview shows immediately after selection
- [x] Thumbnail is generated and shown
- [x] Can remove videos before submission
- [x] Can reorder between steps without losing videos
- [x] Videos upload when clicking "Finish & Create Product"
- [x] Success: Redirects to products list
- [x] Failure: Shows error message, keeps videos in form
- [x] Blob URLs are cleaned up after upload

### Edit Product Page

- [x] Existing videos load correctly
- [x] Can add new videos to existing product
- [x] Mix of existing + new videos works
- [x] New videos upload when clicking "Finish & Save Changes"
- [x] Existing videos are preserved
- [x] Blob URLs are cleaned up after upload

### Error Handling

- [x] File size > 20MB: Shows error, doesn't add to form
- [x] More than 2 videos: Shows error
- [x] Upload fails: Shows error at submission, not during selection
- [x] Network error: Proper error message shown

---

## 🔧 Technical Details

### Thumbnail Generation

Videos now generate thumbnails locally using Canvas API:

```typescript
const generateVideoThumbnail = (
  videoFile: File
): Promise<{ blob: Blob; url: string }> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    video.onloadedmetadata = () => {
      video.currentTime = Math.min(1, video.duration * 0.1); // Seek to 1s or 10%
    };

    video.onseeked = () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(
        (blob) => {
          const url = URL.createObjectURL(blob);
          resolve({ blob, url });
        },
        "image/jpeg",
        0.85
      );
    };

    video.src = URL.createObjectURL(videoFile);
  });
};
```

### Blob URL Management

```typescript
// Create blob URL
const previewUrl = URL.createObjectURL(file);

// Use in UI
<video src={previewUrl} />;

// Clean up when done
URL.revokeObjectURL(previewUrl);
```

### Upload API

```typescript
// Upload video
POST /api/seller/products/media
FormData: {
  files: File,
  slug: "buy-product-name",
  type: "video"
}

// Upload thumbnail
POST /api/seller/products/media
FormData: {
  files: Blob,
  slug: "buy-product-name",
  type: "image"
}
```

---

## 📝 Summary

**Problem:** Videos were uploaded immediately when selected, causing errors and poor UX.

**Solution:** Store videos locally, upload only on form submission.

**Files Changed:**

1. `src/components/seller/products/MediaUploadStep.tsx` - Local storage logic
2. `src/app/seller/products/new/page.tsx` - Upload on create
3. `src/app/seller/products/[id]/edit/page.tsx` - Upload on edit

**Result:** ✅ Videos now work the same as images - fast selection, reliable upload!

---

## 🎉 Success Metrics

- ✅ No upload errors during video selection
- ✅ Instant video preview after selection
- ✅ Upload only happens once (on submit)
- ✅ Consistent behavior with images
- ✅ Better user experience
- ✅ Network efficient

All video upload issues resolved! 🚀
