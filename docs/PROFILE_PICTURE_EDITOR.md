# Profile Picture Editor - WhatsApp Image Editor Integration

## Overview

The profile edit page now includes a sophisticated image cropping and editing feature using the WhatsApp Image Editor component. This allows users to crop and position their profile pictures perfectly before uploading.

## Changes Made

### 1. Profile Edit Page (`/src/app/profile/edit/page.tsx`)

#### New Imports

```tsx
import WhatsAppImageEditor, {
  WhatsAppCropData,
} from "@/components/seller/products/WhatsAppImageEditor";
import { Crop } from "lucide-react";
```

#### New State Variables

```tsx
const [editorOpen, setEditorOpen] = useState(false);
const [currentPhotoUrl, setCurrentPhotoUrl] = useState<string>("");
const [photoCropData, setPhotoCropData] = useState<WhatsAppCropData | null>(
  null
);
```

#### Enhanced Photo Handling

- **Auto-open editor**: When a user selects a photo, the editor opens automatically
- **Crop data storage**: Crop settings (position, zoom) are saved
- **Manual crop access**: Users can re-open the editor to adjust their crop
- **Visual feedback**: Shows "✓ Photo cropped and ready" when crop is saved

#### New Functions

```tsx
const handleCropSave = (cropData: WhatsAppCropData) => {
  setPhotoCropData(cropData);
  setEditorOpen(false);
  toast.success("Profile picture cropped successfully");
};

const openEditor = () => {
  if (photoPreview || formData.photoURL) {
    setCurrentPhotoUrl(photoPreview || formData.photoURL);
    setEditorOpen(true);
  }
};
```

### 2. API Updates (`/src/app/api/user/profile/route.ts`)

#### Added Fields

- `photoCropData`: Stores the crop settings (crop position, zoom, cropped area pixels)
- `userId`: Always saved/updated to ensure consistency

#### PUT Request Updates

```typescript
const allowedFields = [
  "name",
  "phone",
  "photoURL",
  "photoCropData", // NEW
  "avatar",
  "addresses",
];

// Ensure userId is always saved
updates.userId = user.uid;
```

### 3. User Registration Updates

#### Register Route (`/src/app/api/auth/register/route.ts`)

- Added `userId` field when creating new users
- Ensures consistency between `id` and `userId` fields

#### OTP Verification Route (`/src/app/api/auth/verify-otp/route.ts`)

- Added `userId` field when creating users via phone authentication
- Maintains consistency across all authentication methods

## Features

### User Experience

#### Photo Selection Flow

1. User clicks camera icon to upload photo
2. Photo preview appears
3. Editor opens automatically in 800x800 crop mode
4. User can:
   - Drag image to reposition
   - Zoom in/out (0.1x - 3x)
   - See live preview with WhatsApp-style frame
   - Save crop settings

#### Crop & Adjust Button

- Appears when a photo is present
- Allows users to re-edit their crop anytime
- Maintains previous crop settings when reopened
- Shows crop icon for visual clarity

#### Visual Indicators

- Blue "Crop & Adjust" button with crop icon
- Red "Remove new photo" button when photo is changed
- Green checkmark "✓ Photo cropped and ready" when crop is saved
- WhatsApp-style green frame (800x800) during editing

### Technical Features

#### Crop Data Structure

```typescript
interface WhatsAppCropData {
  crop: Point; // { x: number, y: number }
  zoom: number; // 0.1 to 3
  croppedAreaPixels: Area; // { width, height, x, y }
}
```

#### Database Storage

```typescript
{
  userId: "user123",
  photoURL: "https://...",
  photoCropData: {
    crop: { x: 0, y: 0 },
    zoom: 1.5,
    croppedAreaPixels: { width: 800, height: 800, x: 100, y: 50 }
  }
}
```

## Benefits

### For Users

1. **Professional Profile Pictures**: Perfect cropping ensures photos look great
2. **Easy Adjustments**: Can re-crop anytime without re-uploading
3. **Consistent Display**: 800x800 format works everywhere (like WhatsApp)
4. **Immediate Feedback**: See exactly how photo will appear
5. **No Extra Steps**: Editor opens automatically after upload

### For System

1. **Consistent Format**: All profile pictures are 800x800
2. **Reusable Component**: Same editor used across app (products, profile)
3. **Stored Settings**: Crop data can be used to regenerate images
4. **userId Consistency**: Ensures proper data relationships

## Implementation Details

### Editor Integration

```tsx
{
  editorOpen && currentPhotoUrl && (
    <WhatsAppImageEditor
      open={editorOpen}
      imageUrl={currentPhotoUrl}
      initialCrop={photoCropData?.crop}
      initialZoom={photoCropData?.zoom}
      onClose={() => setEditorOpen(false)}
      onSave={handleCropSave}
    />
  );
}
```

### Upload Flow with Crop Data

```tsx
const response = await fetch("/api/user/profile", {
  method: "PUT",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({
    name: formData.name,
    phone: formData.phone,
    photoURL,
    photoCropData: photoCropData || undefined, // Send crop data
  }),
});
```

## Testing Checklist

### Photo Upload

- [ ] Can select a new photo
- [ ] Editor opens automatically after selection
- [ ] Can drag image to reposition
- [ ] Can zoom in/out using slider
- [ ] Can see WhatsApp-style 800x800 frame
- [ ] Can save crop settings
- [ ] Photo preview updates after crop

### Crop & Adjust

- [ ] Button appears when photo is present
- [ ] Clicking opens editor with current photo
- [ ] Previous crop settings are maintained
- [ ] Can adjust crop and save again
- [ ] Changes are reflected in preview

### Form Submission

- [ ] Crop data is sent to API
- [ ] Photo URL is uploaded correctly
- [ ] Profile updates successfully
- [ ] Success toast appears
- [ ] Redirects to profile page
- [ ] New photo appears on profile

### Data Persistence

- [ ] userId is saved in user document
- [ ] photoCropData is saved in user document
- [ ] Crop settings persist across sessions
- [ ] Can retrieve and use crop data later

### Edge Cases

- [ ] Can cancel editor without saving
- [ ] Can remove photo and select new one
- [ ] Editor handles large images
- [ ] Editor handles small images
- [ ] Works with existing profile pictures
- [ ] Works with newly uploaded photos

## Related Files

- `/src/app/profile/edit/page.tsx` - Profile edit page with editor
- `/src/components/seller/products/WhatsAppImageEditor.tsx` - Reusable editor component
- `/src/app/api/user/profile/route.ts` - Profile API with crop data
- `/src/app/api/auth/register/route.ts` - User registration with userId
- `/src/app/api/auth/verify-otp/route.ts` - Phone auth with userId

## Future Enhancements

1. **Server-side Cropping**: Generate cropped image on server
2. **Multiple Sizes**: Create thumbnail, medium, large versions
3. **Filters & Effects**: Add photo filters and adjustments
4. **Background Removal**: AI-powered background removal
5. **Avatar Generator**: Fallback avatar generation from name
6. **Image Compression**: Automatic compression for faster loads
7. **CDN Integration**: Store images on CDN for performance
8. **Lazy Loading**: Load images progressively
