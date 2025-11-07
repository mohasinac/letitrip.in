# Media Components - Usage Examples

## Quick Start

### Basic Upload

```typescript
"use client";

import { useState } from "react";
import { MediaUploader } from "@/components/media";
import { MediaFile } from "@/types/media";

export default function BasicUploadExample() {
  const [files, setFiles] = useState<MediaFile[]>([]);

  const handleFilesAdded = (newFiles: MediaFile[]) => {
    setFiles([...files, ...newFiles]);
  };

  const handleFileRemoved = (id: string) => {
    setFiles(files.filter((f) => f.id !== id));
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Upload Media</h1>

      <MediaUploader
        accept="all"
        maxFiles={10}
        resourceType="product"
        multiple
        files={files}
        onFilesAdded={handleFilesAdded}
        onFileRemoved={handleFileRemoved}
      />
    </div>
  );
}
```

### Upload with Camera

```typescript
"use client";

import { useState } from "react";
import { MediaUploader, CameraCapture } from "@/components/media";
import { MediaFile } from "@/types/media";

export default function CameraUploadExample() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [showCamera, setShowCamera] = useState(false);

  return (
    <>
      <MediaUploader
        accept="image"
        maxFiles={5}
        resourceType="product"
        files={files}
        onFilesAdded={(newFiles) => setFiles([...files, ...newFiles])}
        onFileRemoved={(id) => setFiles(files.filter((f) => f.id !== id))}
        onCameraClick={() => setShowCamera(true)}
      />

      {showCamera && (
        <CameraCapture
          onCapture={(mediaFile) => {
            setFiles([...files, mediaFile]);
            setShowCamera(false);
          }}
          onClose={() => setShowCamera(false)}
          facingMode="environment"
        />
      )}
    </>
  );
}
```

### Upload with Video Recording

```typescript
"use client";

import { useState } from "react";
import { MediaUploader, VideoRecorder } from "@/components/media";
import { MediaFile } from "@/types/media";

export default function VideoUploadExample() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [showRecorder, setShowRecorder] = useState(false);

  return (
    <>
      <MediaUploader
        accept="video"
        maxFiles={1}
        resourceType="product"
        files={files}
        onFilesAdded={(newFiles) => setFiles([...files, ...newFiles])}
        onFileRemoved={(id) => setFiles(files.filter((f) => f.id !== id))}
        onVideoRecordClick={() => setShowRecorder(true)}
      />

      {showRecorder && (
        <VideoRecorder
          onRecorded={(mediaFile) => {
            setFiles([...files, mediaFile]);
            setShowRecorder(false);
          }}
          onClose={() => setShowRecorder(false)}
          source="camera"
          maxDuration={60} // 1 minute
        />
      )}
    </>
  );
}
```

### Gallery with Editing

```typescript
"use client";

import { useState } from "react";
import { MediaGallery, MediaEditorModal } from "@/components/media";
import { MediaFile } from "@/types/media";

export default function GalleryExample() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [editingFile, setEditingFile] = useState<MediaFile | null>(null);

  const handleReorder = (reorderedFiles: MediaFile[]) => {
    setFiles(reorderedFiles);
  };

  const handleEdit = (id: string) => {
    const file = files.find((f) => f.id === id);
    if (file) setEditingFile(file);
  };

  const handleRemove = (id: string) => {
    setFiles(files.filter((f) => f.id !== id));
  };

  const handleSaveEdit = (editedMedia: MediaFile) => {
    setFiles(files.map((f) => (f.id === editedMedia.id ? editedMedia : f)));
    setEditingFile(null);
  };

  return (
    <>
      <MediaGallery
        files={files}
        onReorder={handleReorder}
        onEdit={handleEdit}
        onRemove={handleRemove}
        allowReorder
        allowBulkActions
      />

      {editingFile && (
        <MediaEditorModal
          media={editingFile}
          onSave={handleSaveEdit}
          onCancel={() => setEditingFile(null)}
        />
      )}
    </>
  );
}
```

### Complete Product Upload Flow

```typescript
"use client";

import { useState } from "react";
import {
  MediaUploader,
  MediaGallery,
  MediaEditorModal,
  MediaMetadataForm,
  CameraCapture,
  VideoRecorder,
} from "@/components/media";
import { MediaFile } from "@/types/media";

export default function ProductMediaManager() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [editingFile, setEditingFile] = useState<MediaFile | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [showRecorder, setShowRecorder] = useState(false);
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);

  const handleFilesAdded = (newFiles: MediaFile[]) => {
    setFiles([...files, ...newFiles]);
  };

  const handleFileRemoved = (id: string) => {
    setFiles(files.filter((f) => f.id !== id));
  };

  const handleEdit = (id: string) => {
    const file = files.find((f) => f.id === id);
    if (file) setEditingFile(file);
  };

  const handleSaveEdit = (editedMedia: MediaFile) => {
    setFiles(files.map((f) => (f.id === editedMedia.id ? editedMedia : f)));
    setEditingFile(null);
  };

  const handleMetadataChange = (fileId: string, metadata: any) => {
    setFiles(files.map((f) => (f.id === fileId ? { ...f, metadata } : f)));
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Upload Section */}
      <section>
        <h2 className="text-xl font-bold mb-4">Upload Product Media</h2>
        <MediaUploader
          accept="all"
          maxFiles={11} // 10 images + 1 video
          resourceType="product"
          multiple
          files={files}
          onFilesAdded={handleFilesAdded}
          onFileRemoved={handleFileRemoved}
          onCameraClick={() => setShowCamera(true)}
          onVideoRecordClick={() => setShowRecorder(true)}
        />
      </section>

      {/* Gallery Section */}
      {files.length > 0 && (
        <section>
          <h2 className="text-xl font-bold mb-4">Manage Media</h2>
          <MediaGallery
            files={files}
            onReorder={setFiles}
            onEdit={handleEdit}
            onRemove={handleFileRemoved}
            onSelect={(ids) => {
              // Handle bulk selection
              console.log("Selected:", ids);
            }}
            allowReorder
            allowBulkActions
          />
        </section>
      )}

      {/* Metadata Section */}
      {selectedFile && (
        <section>
          <h2 className="text-xl font-bold mb-4">Media Details</h2>
          <MediaMetadataForm
            metadata={selectedFile.metadata!}
            onChange={(metadata) =>
              handleMetadataChange(selectedFile.id, metadata)
            }
            autoSlug
          />
        </section>
      )}

      {/* Modals */}
      {editingFile && (
        <MediaEditorModal
          media={editingFile}
          onSave={handleSaveEdit}
          onCancel={() => setEditingFile(null)}
        />
      )}

      {showCamera && (
        <CameraCapture
          onCapture={(mediaFile) => {
            setFiles([...files, mediaFile]);
            setShowCamera(false);
          }}
          onClose={() => setShowCamera(false)}
        />
      )}

      {showRecorder && (
        <VideoRecorder
          onRecorded={(mediaFile) => {
            setFiles([...files, mediaFile]);
            setShowRecorder(false);
          }}
          onClose={() => setShowRecorder(false)}
          maxDuration={300}
        />
      )}
    </div>
  );
}
```

## Component Props Reference

### MediaUploader

| Prop               | Type                        | Default   | Description                  |
| ------------------ | --------------------------- | --------- | ---------------------------- |
| accept             | 'image' \| 'video' \| 'all' | 'all'     | File types to accept         |
| maxFiles           | number                      | 10        | Maximum number of files      |
| resourceType       | string                      | 'product' | Resource type for validation |
| multiple           | boolean                     | true      | Allow multiple files         |
| files              | MediaFile[]                 | []        | Current files                |
| onFilesAdded       | function                    | -         | Callback when files added    |
| onFileRemoved      | function                    | -         | Callback when file removed   |
| onCameraClick      | function                    | -         | Callback for camera button   |
| onVideoRecordClick | function                    | -         | Callback for video button    |
| disabled           | boolean                     | false     | Disable upload               |

### MediaGallery

| Prop             | Type        | Default  | Description              |
| ---------------- | ----------- | -------- | ------------------------ |
| files            | MediaFile[] | required | Files to display         |
| onReorder        | function    | -        | Callback for reorder     |
| onRemove         | function    | -        | Callback for remove      |
| onEdit           | function    | -        | Callback for edit        |
| onSelect         | function    | -        | Callback for selection   |
| selectedIds      | string[]    | []       | Currently selected IDs   |
| allowReorder     | boolean     | true     | Enable drag-drop reorder |
| allowBulkActions | boolean     | true     | Enable bulk selection    |

### CameraCapture

| Prop       | Type                    | Default       | Description                  |
| ---------- | ----------------------- | ------------- | ---------------------------- |
| onCapture  | function                | required      | Callback with captured photo |
| onClose    | function                | required      | Callback to close            |
| facingMode | 'user' \| 'environment' | 'environment' | Camera to use                |

### VideoRecorder

| Prop        | Type                 | Default  | Description                  |
| ----------- | -------------------- | -------- | ---------------------------- |
| onRecorded  | function             | required | Callback with recorded video |
| onClose     | function             | required | Callback to close            |
| source      | 'camera' \| 'screen' | 'camera' | Recording source             |
| maxDuration | number               | 300      | Max duration in seconds      |

### ImageEditor

| Prop     | Type      | Default  | Description                |
| -------- | --------- | -------- | -------------------------- |
| media    | MediaFile | required | Media to edit              |
| onSave   | function  | required | Callback with edited media |
| onCancel | function  | required | Callback to cancel         |

### VideoThumbnailGenerator

| Prop           | Type      | Default  | Description                      |
| -------------- | --------- | -------- | -------------------------------- |
| media          | MediaFile | required | Video media                      |
| onSelect       | function  | required | Callback with selected thumbnail |
| onCancel       | function  | required | Callback to cancel               |
| thumbnailCount | number    | 5        | Number of thumbnails to generate |

### MediaEditorModal

| Prop     | Type      | Default  | Description                |
| -------- | --------- | -------- | -------------------------- |
| media    | MediaFile | required | Media to edit              |
| onSave   | function  | required | Callback with edited media |
| onCancel | function  | required | Callback to cancel         |

### MediaMetadataForm

| Prop     | Type          | Default  | Description                         |
| -------- | ------------- | -------- | ----------------------------------- |
| metadata | MediaMetadata | required | Metadata to edit                    |
| onChange | function      | required | Callback with updated metadata      |
| autoSlug | boolean       | true     | Auto-generate slug from description |

## Tips

1. **Memory Management**: Always clean up object URLs when components unmount
2. **Validation**: Validate files before allowing upload to prevent errors
3. **Progress**: Use MediaPreviewCard to show upload progress
4. **Metadata**: Collect metadata before or after upload based on UX needs
5. **Error Handling**: Handle camera/video permissions gracefully
6. **Mobile**: Test camera features on actual devices, not just emulators
7. **Limits**: Enforce file size and count limits early
8. **Formats**: Check browser support for webm video format
9. **Performance**: Process images in batches for better UX
10. **Accessibility**: Ensure all interactive elements are keyboard accessible
