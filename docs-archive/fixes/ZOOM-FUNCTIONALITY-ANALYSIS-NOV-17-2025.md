# Zoom Functionality Analysis - November 17, 2025

## Current Implementation

### 1. ProductGallery Component (`src/components/product/ProductGallery.tsx`)

**Zoom Button** (Lines 81-88):

```tsx
{
  /* Zoom Button */
}
<button
  onClick={() => setIsLightboxOpen(true)}
  className="absolute top-2 right-2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
  aria-label="Zoom image"
>
  <ZoomIn className="w-5 h-5" />
</button>;
```

**Features**:

- ✅ Opens lightbox modal for full-screen viewing
- ✅ Only visible on hover (`opacity-0 group-hover:opacity-100`)
- ✅ Positioned top-right (top-2 right-2)
- ✅ White background with shadow
- ✅ Smooth fade-in animation

**Lightbox Modal** (Lines 176-224):

```tsx
{
  isLightboxOpen && (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4">
      {/* Close button, image, navigation arrows */}
    </div>
  );
}
```

**Features**:

- ✅ Full-screen black background (z-50)
- ✅ Contains image/video in responsive container
- ✅ Navigation arrows for multiple images
- ✅ Close button (X icon)
- ✅ Image counter at bottom
- ✅ Object-contain for proper aspect ratio

### 2. ProductQuickView Component (`src/components/cards/ProductQuickView.tsx`)

**Zoom Implementation** (Lines 55, 155-160):

```tsx
const [isZoomed, setIsZoomed] = useState(false);

<Image
  src={product.images[currentImageIndex]}
  alt={product.name}
  fill
  className={`object-cover transition-transform duration-300 ${
    isZoomed ? "scale-150 cursor-zoom-out" : "cursor-zoom-in"
  }`}
  onClick={() => setIsZoomed(!isZoomed)}
/>;
```

**Features**:

- ✅ Click-to-zoom on image (scale-150)
- ✅ Toggle zoom with cursor change
- ✅ Smooth transform animation
- ✅ Zoom icon indicator (top-right)

## Potential Issues

### Issue 1: Hover-Only Visibility

**Problem**: Zoom button only appears on hover, may not be discoverable on mobile/touch devices

**Current**:

```tsx
opacity-0 group-hover:opacity-100
```

**Recommendation**: Always show zoom button with reduced opacity, increase on hover

```tsx
opacity-70 group-hover:opacity-100
```

### Issue 2: Z-Index Conflicts

**Lightbox Z-Index**: 50
**Potential Conflicts**:

- Navbar: z-30
- Sidebars: z-10
- Mobile overlays: z-40
- Filter sidebar: z-50 (CONFLICT!)

**Issue**: Filter sidebar (z-50) may overlay lightbox if both open simultaneously

**Fix**: Increase lightbox z-index to 60

### Issue 3: Position Overlap with Media Badges

**Current Layout** (Lines 91-132):

```tsx
{
  /* Zoom Button - top-2 right-2 */
}
{
  /* Media Count Badges - top-2 left-2 */
}
```

**Potential Issue**: If media badges are tall, they may visually crowd the zoom button area

**Recommendation**: Test with products having both many images AND videos

### Issue 4: Missing Keyboard Accessibility

**Current**: Only mouse click to open/close
**Missing**:

- Enter/Space key to activate zoom button
- Focus indicators for keyboard navigation

### Issue 5: No Zoom in Videos

**Current**: Videos display in lightbox but can't be zoomed
**Recommendation**: Consider adding video controls (fullscreen API)

## Testing Checklist

### Desktop

- [ ] Hover over product image - zoom button appears
- [ ] Click zoom button - lightbox opens
- [ ] Lightbox displays image correctly (no distortion)
- [ ] Navigation arrows work (if multiple images)
- [ ] Close button works (X icon)
- [ ] ESC key closes lightbox (if implemented)
- [ ] Click outside lightbox closes it (if implemented)
- [ ] Zoom button doesn't overlap media badges
- [ ] Filter sidebar doesn't overlay lightbox (z-index test)

### Mobile/Touch

- [ ] Tap image area - zoom button visible?
- [ ] Tap zoom button - lightbox opens
- [ ] Pinch to zoom works in lightbox (if supported)
- [ ] Swipe to navigate between images
- [ ] Close button large enough for touch
- [ ] Lightbox doesn't conflict with mobile menu

### Quick View Modal

- [ ] Click product image - zoom toggles (scale-150)
- [ ] Cursor changes (zoom-in/zoom-out)
- [ ] Zoom animation smooth
- [ ] Zoomed image doesn't break layout
- [ ] Multiple images navigate correctly when zoomed

### Accessibility

- [ ] Zoom button has proper aria-label
- [ ] Keyboard focus visible on zoom button
- [ ] Tab navigation reaches zoom button
- [ ] Enter/Space activates zoom button
- [ ] Screen reader announces lightbox state

## Recommended Fixes

### Fix 1: Improve Zoom Button Visibility

```tsx
// src/components/product/ProductGallery.tsx (Line 83)
<button
  onClick={() => setIsLightboxOpen(true)}
  className="absolute top-2 right-2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg opacity-70 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity"
  aria-label="Zoom image"
>
```

**Change**: Always visible on mobile (opacity-70), hover-only on desktop

### Fix 2: Increase Lightbox Z-Index

```tsx
// src/components/product/ProductGallery.tsx (Line 177)
<div className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center p-4">
```

**Change**: z-50 → z-[60] to ensure it overlays filter sidebar

### Fix 3: Add Keyboard Support

```tsx
// src/components/product/ProductGallery.tsx
<button
  onClick={() => setIsLightboxOpen(true)}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsLightboxOpen(true);
    }
  }}
  className="absolute top-2 right-2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg opacity-70 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
  aria-label="Zoom image"
>
```

**Changes**:

- Add onKeyDown handler
- Add focus ring styles
- Improve accessibility

### Fix 4: Add Click-Outside to Close

```tsx
// src/components/product/ProductGallery.tsx (Line 177)
<div
  className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center p-4"
  onClick={(e) => {
    if (e.target === e.currentTarget) {
      setIsLightboxOpen(false);
    }
  }}
>
```

**Change**: Click on backdrop closes lightbox

### Fix 5: Add ESC Key Handler

```tsx
// src/components/product/ProductGallery.tsx (add useEffect)
useEffect(() => {
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === "Escape" && isLightboxOpen) {
      setIsLightboxOpen(false);
    }
  };

  if (isLightboxOpen) {
    window.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";
  }

  return () => {
    window.removeEventListener("keydown", handleEscape);
    document.body.style.overflow = "unset";
  };
}, [isLightboxOpen]);
```

**Changes**:

- ESC key closes lightbox
- Prevents body scroll when lightbox open
- Cleans up on unmount

## Implementation Priority

### High Priority (User Experience)

1. ✅ Increase lightbox z-index (z-60) - **Prevents filter sidebar conflict**
2. ✅ Mobile zoom button visibility - **Improves discoverability**
3. ✅ ESC key to close - **Expected behavior**
4. ✅ Click-outside to close - **Common UX pattern**

### Medium Priority (Accessibility)

5. ⏳ Keyboard navigation support
6. ⏳ Focus indicators
7. ⏳ Body scroll lock when lightbox open

### Low Priority (Polish)

8. ⏳ Pinch-to-zoom in lightbox
9. ⏳ Touch swipe gestures
10. ⏳ Video fullscreen support

## Status

**Current State**: Zoom functionality exists but may have visibility/z-index issues

**Next Steps**:

1. Test zoom button visibility on actual product pages
2. Test z-index conflicts with filter sidebar
3. Implement high-priority fixes
4. Test on mobile devices
5. Verify accessibility compliance

---

**Last Updated**: November 17, 2025  
**Investigation**: Zoom button working, may need UX improvements
