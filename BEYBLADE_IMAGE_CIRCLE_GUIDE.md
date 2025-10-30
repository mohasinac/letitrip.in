# Beyblade Image Upload - Circle Guide Update

## Changes Made

### ✨ New Features

1. **300px Circle Guide**

   - Shows a blue dashed circle overlay (300px diameter)
   - Helps users visualize the final circular crop
   - Displays "Fit image within this circle" text
   - Shows "300px diameter" dimension

2. **Scale Control**

   - Interactive slider (10% - 200%)
   - Real-time preview as you adjust scale
   - Large, prominent display with blue styling
   - Shows current scale percentage

3. **Automatic Background Removal**
   - Background removal is now **enabled by default** (checkbox checked)
   - Labeled as "Remove Background (Recommended)"
   - Adjustable tolerance slider (5-50)
   - Works with PNG, JPG, and WebP images

### 🎨 Visual Improvements

- **Live Preview**: Canvas-based preview with overlaid circle guide
- **Better Layout**: Circle guide and image preview stack visually
- **Enhanced Scale Slider**: Blue-themed slider with custom styling
- **Clear Instructions**: User-friendly text guiding the upload process

### 🔧 Technical Implementation

**Component Updates** (`BeybladeImageUploader.tsx`):

- Added `scale` state (default 100%)
- Added `overlayCanvasRef` for circle guide
- New `drawCircleGuide()` function to render the 300px circle
- New `updateScaledPreview()` function to apply scale in real-time
- `useEffect` hooks to update preview when scale changes

**CSS Styling** (`globals.css`):

- Custom slider thumb styling (`.slider-thumb-blue`)
- Blue color scheme (#2563eb)
- Hover effects for better UX

### 📝 User Flow

1. **Select Image** → Click "Upload Image" or "Change Image"
2. **Adjust Scale** → Use slider to fit image within the circle guide
3. **Configure Options**:
   - Background removal (enabled by default)
   - Tolerance adjustment
   - Fit mode (contain/cover)
4. **Process** → Click "Process Image"
5. **Preview & Upload** → Review circular preview and upload

### 🎯 Benefits

- **Visual Guidance**: Users can see exactly where their image will be cropped
- **Better Framing**: Scale control helps users position their image perfectly
- **Clean Results**: Default background removal ensures professional-looking beyblades
- **User-Friendly**: Clear instructions and real-time feedback

## Usage

```tsx
import BeybladeImageUploader from "@/components/admin/BeybladeImageUploader";

<BeybladeImageUploader
  currentImageUrl={beyblade.imageUrl}
  beybladeId={beyblade.id}
  onImageUploaded={(url) => handleImageUploaded(beyblade.id, url)}
/>;
```

## Example

When uploading a beyblade image:

1. The 300px blue circle guide appears
2. User drags scale slider to fit beyblade within circle
3. Background is automatically removed
4. Image is processed at 300x300px
5. Final circular preview is shown before upload

## Files Modified

- `src/components/admin/BeybladeImageUploader.tsx` - Main component
- `src/app/globals.css` - Slider styling
