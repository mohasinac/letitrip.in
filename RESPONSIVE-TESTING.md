# Responsive Testing Guide - Phase 9.3

## Overview

This document provides comprehensive testing procedures for responsive design across different devices and screen sizes.

## Testing Environment

### Browser DevTools:

1. **Chrome DevTools**: F12 → Device Toolbar (Ctrl+Shift+M)
2. **Responsive Mode**: Test custom dimensions
3. **Device Presets**: iPhone, iPad, Desktop

### Recommended Test Devices:

- **Mobile**: iPhone SE (375px), iPhone 12 Pro (390px), Samsung Galaxy (360px)
- **Tablet**: iPad Mini (768px), iPad Pro (1024px)
- **Desktop**: MacBook (1440px), Desktop (1920px), 4K (3840px)

## Phase 9.3: Responsive Testing (0/4)

### Task 1: Mobile (375px) - All Pages Responsive

#### Homepage Testing:

**Header (375px):**

- [ ] **Logo**: Visible, not truncated
  - Size: ~30-40px height
  - Position: Left aligned
  - **Status**: ___________

- [ ] **Navigation**: Hamburger menu visible
  - Icon: 24×24px, right side
  - Opens full-screen overlay on click
  - **Status**: ___________

- [ ] **Search**: Icon only (magnifying glass)
  - Opens full-screen search on click
  - **Status**: ___________

- [ ] **Cart**: Icon with badge
  - Badge: 16px circle, top-right
  - Shows item count
  - **Status**: ___________

**Hero Section (375px):**

- [ ] **Carousel**: Full width, single image visible
  - Height: 50vh (viewport height)
  - Controls: Left/right arrows visible
  - Swipeable on touch
  - **Status**: ___________

- [ ] **Hero Text**: Readable, not overlapping
  - Title: 24-28px
  - Subtitle: 14-16px
  - CTA Button: 44px height (touch-friendly)
  - **Status**: ___________

**Product Grid (375px):**

- [ ] **Layout**: 2 columns (no scroll)
  - Gap: 12px between cards
  - Card width: ~165px each
  - **Status**: ___________

- [ ] **Product Card**: All info visible
  - Image: Square aspect ratio
  - Title: 2 lines max, ellipsis
  - Price: Bold, 16px
  - Add to Cart: 40px height button
  - **Status**: ___________

- [ ] **Horizontal Scroller**: Swipeable
  - Shows 1.5 products at a time
  - Scroll indicators visible
  - **Status**: ___________

**Footer (375px):**

- [ ] **Links**: Stacked vertically
  - 4 sections, each full width
  - Accordions for mobile (collapsible)
  - **Status**: ___________

- [ ] **Social Icons**: Visible, 44px touch targets
  - Row of icons, centered
  - **Status**: ___________

**Bottom Navigation (375px):**

- [ ] **Sticky**: Fixed at bottom
  - Height: 64px
  - Background: white/dark (theme aware)
  - **Status**: ___________

- [ ] **Icons**: 5 items, evenly spaced
  - Icon size: 24px
  - Label: 10-12px below
  - Active state: Color change
  - **Status**: ___________

#### Product Details Page (375px):

- [ ] **Image Gallery**: Full width, swipeable
  - Thumbnail strip: Horizontal scroll
  - Lightbox: Full screen on tap
  - **Status**: ___________

- [ ] **Product Info**: Stacked vertically
  - Title: 20px, 2-3 lines
  - Price: 24px, bold
  - Description: Expandable ("Read more")
  - **Status**: ___________

- [ ] **Action Buttons**: Full width
  - Add to Cart: 100% width, 48px height
  - Buy Now: 100% width, 48px height
  - Gap: 12px between buttons
  - **Status**: ___________

- [ ] **Tabs**: Full width, horizontal scroll
  - Description, Reviews, Specifications
  - Active tab: Underline indicator
  - **Status**: ___________

#### Checkout Page (375px):

- [ ] **Form Fields**: Full width
  - Input height: 48px (touch-friendly)
  - Labels: Above input
  - Error messages: Below input, red
  - **Status**: ___________

- [ ] **Order Summary**: Collapsed by default
  - Expandable accordion
  - Shows item count and total
  - **Status**: ___________

- [ ] **Payment Options**: Stacked cards
  - Radio buttons: 24px touch target
  - Card logos visible
  - **Status**: ___________

---

### Task 2: Tablet (768px) - Layout Adapts Correctly

#### Homepage Testing:

**Header (768px):**

- [ ] **Logo**: Larger, ~50px height
  - **Status**: ___________

- [ ] **Navigation**: Visible menu items (5-7 items)
  - Inline, horizontal layout
  - No hamburger menu
  - **Status**: ___________

- [ ] **Search**: Visible search bar (200px width)
  - Icon + input field
  - **Status**: ___________

**Hero Section (768px):**

- [ ] **Carousel**: Wider, better aspect ratio
  - Height: 60vh
  - 2 slides visible (if multiple)
  - **Status**: ___________

**Product Grid (768px):**

- [ ] **Layout**: 3-4 columns
  - Gap: 16px
  - Card width: ~220px each
  - **Status**: ___________

- [ ] **Product Card**: More spacious
  - Larger images
  - Full title visible (no ellipsis)
  - **Status**: ___________

**Footer (768px):**

- [ ] **Links**: 2×2 grid
  - 2 columns, 2 rows
  - No accordions (all visible)
  - **Status**: ___________

**Bottom Navigation (768px):**

- [ ] **Hidden** or **Persistent**:
  - Option 1: Hidden (use header nav only)
  - Option 2: Visible with labels
  - **Status**: ___________

#### Product Details Page (768px):

- [ ] **Image Gallery**: 50% width, left side
  - Thumbnails: Vertical on left
  - Main image: Right of thumbnails
  - **Status**: ___________

- [ ] **Product Info**: 50% width, right side
  - Side-by-side layout
  - More breathing room
  - **Status**: ___________

- [ ] **Tabs**: Full width, below product info
  - All tabs visible (no scroll)
  - **Status**: ___________

#### Checkout Page (768px):

- [ ] **Two-Column Layout**:
  - Left: Shipping form (60%)
  - Right: Order summary (40%)
  - **Status**: ___________

---

### Task 3: Desktop (1440px) - Optimal Spacing

#### Homepage Testing:

**Header (1440px):**

- [ ] **Container**: Max width 1440px, centered
  - Padding: 40px left/right
  - **Status**: ___________

- [ ] **Logo**: 60px height
  - **Status**: ___________

- [ ] **Navigation**: Full menu (8+ items)
  - Spacing: 24px between items
  - **Status**: ___________

- [ ] **Search**: Wider (300px)
  - **Status**: ___________

**Hero Section (1440px):**

- [ ] **Carousel**: Max width 1440px
  - Height: 70vh
  - 3 slides visible (if multiple)
  - **Status**: ___________

- [ ] **Hero Text**: Larger fonts
  - Title: 48-56px
  - Subtitle: 18-20px
  - **Status**: ___________

**Product Grid (1440px):**

- [ ] **Layout**: 5-6 columns
  - Gap: 24px
  - Card width: ~250px each
  - **Status**: ___________

- [ ] **Hover Effects**: Visible and smooth
  - Scale up: 1.05
  - Shadow: Increases
  - Transition: 300ms
  - **Status**: ___________

**Footer (1440px):**

- [ ] **Links**: 4 columns, single row
  - Even spacing
  - All links visible
  - **Status**: ___________

#### Product Details Page (1440px):

- [ ] **Image Gallery**: 60% width
  - Larger main image (800×800px)
  - Grid thumbnails (4×2)
  - **Status**: ___________

- [ ] **Product Info**: 40% width
  - Sticky on scroll
  - **Status**: ___________

- [ ] **Related Products**: 4 columns
  - Below product details
  - **Status**: ___________

#### Checkout Page (1440px):

- [ ] **Three-Column Layout** (optional):
  - Left: Shipping (50%)
  - Center: Payment (25%)
  - Right: Summary (25%)
  - **Status**: ___________

---

### Task 4: Dark Mode - All Components Support Dark Mode

#### Global Dark Mode Testing:

**Color Scheme:**

- [ ] **Background**: `bg-gray-50` → `dark:bg-gray-900`
  - **Status**: ___________

- [ ] **Text**: `text-gray-900` → `dark:text-gray-100`
  - **Status**: ___________

- [ ] **Cards**: `bg-white` → `dark:bg-gray-800`
  - **Status**: ___________

- [ ] **Borders**: `border-gray-200` → `dark:border-gray-700`
  - **Status**: ___________

**Component-Specific Testing:**

**Header (Dark Mode):**

- [ ] **Background**: White → Dark gray/black
  - No harsh contrast
  - **Status**: ___________

- [ ] **Logo**: Inverts or has dark variant
  - **Status**: ___________

- [ ] **Icons**: Light color (white/gray-300)
  - **Status**: ___________

**Product Card (Dark Mode):**

- [ ] **Card Background**: Dark gray
  - **Status**: ___________

- [ ] **Image**: No background change
  - **Status**: ___________

- [ ] **Text**: Light color, readable
  - Title: white
  - Price: Light gray
  - **Status**: ___________

- [ ] **Button**: Dark mode variant
  - Primary: Blue-500 → Blue-400
  - Text: White remains white
  - **Status**: ___________

**Forms (Dark Mode):**

- [ ] **Input Fields**: Dark background
  - Background: gray-800
  - Border: gray-600
  - Text: white
  - Placeholder: gray-400
  - **Status**: ___________

- [ ] **Focus State**: Visible in dark mode
  - Border: blue-400 or blue-300
  - **Status**: ___________

**Modals (Dark Mode):**

- [ ] **Overlay**: Dark with transparency
  - Background: `rgba(0, 0, 0, 0.7)`
  - **Status**: ___________

- [ ] **Modal Content**: Dark background
  - Background: gray-800
  - Text: white
  - **Status**: ___________

**Footer (Dark Mode):**

- [ ] **Background**: Dark gray/black
  - **Status**: ___________

- [ ] **Links**: Light color
  - Hover: Lighter or underline
  - **Status**: ___________

**Skeletons (Dark Mode):**

- [ ] **Animation**: Visible in dark mode
  - Base: gray-700
  - Highlight: gray-600
  - **Status**: ___________

**Toasts/Alerts (Dark Mode):**

- [ ] **Success**: Green with dark bg
  - Background: green-800
  - Text: white
  - **Status**: ___________

- [ ] **Error**: Red with dark bg
  - Background: red-800
  - Text: white
  - **Status**: ___________

- [ ] **Info**: Blue with dark bg
  - Background: blue-800
  - Text: white
  - **Status**: ___________

**Images (Dark Mode):**

- [ ] **No Inversion**: Images remain normal
  - Product images: No filter
  - **Status**: ___________

- [ ] **Icons**: SVG icons change color
  - Using `currentColor` or `fill-current`
  - **Status**: ___________

---

## Responsive Breakpoints

### Tailwind CSS Breakpoints:

```
sm:  640px  - Small tablets
md:  768px  - Tablets
lg:  1024px - Small desktops
xl:  1280px - Desktops
2xl: 1536px - Large desktops
```

### Custom Breakpoints (if needed):

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    screens: {
      xs: "375px", // Mobile
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
      "3xl": "1920px", // Large desktop
    },
  },
};
```

## Testing Tools

### Browser DevTools:

```javascript
// Test in Chrome Console
// Mobile
window.innerWidth; // Should be 375, 768, etc.

// Toggle dark mode
document.documentElement.classList.toggle("dark");

// Check media queries
window.matchMedia("(max-width: 768px)").matches; // true if mobile
window.matchMedia("(prefers-color-scheme: dark)").matches; // true if dark mode
```

### Responsive Design Checklist:

- [ ] All text readable (min 14px on mobile)
- [ ] Touch targets: Min 44×44px
- [ ] No horizontal scroll
- [ ] Images don't overflow
- [ ] Buttons full width on mobile (or min 140px)
- [ ] Forms: One column on mobile
- [ ] Tables: Horizontal scroll or card view on mobile
- [ ] Modals: Full screen on mobile
- [ ] Videos: Responsive aspect ratio

### Dark Mode Checklist:

- [ ] All backgrounds adapt
- [ ] All text remains readable (contrast 4.5:1 minimum)
- [ ] All borders visible
- [ ] All icons visible
- [ ] Images don't invert
- [ ] Shadows visible (adjust opacity)
- [ ] Focus states visible

## Common Responsive Issues

### Issue 1: Horizontal Scroll on Mobile

**Cause**: Element wider than viewport

**Solution**:

```css
/* Add to problematic element */
max-width: 100%;
overflow-x: hidden;
```

### Issue 2: Text Too Small on Mobile

**Cause**: Fixed font size

**Solution**:

```css
/* Use responsive font sizes */
@layer utilities {
  .text-responsive {
    @apply text-sm md:text-base lg:text-lg;
  }
}
```

### Issue 3: Images Overflow

**Cause**: No max-width set

**Solution**:

```css
img {
  max-width: 100%;
  height: auto;
}
```

### Issue 4: Touch Targets Too Small

**Cause**: Buttons/links < 44px

**Solution**:

```css
/* Min touch target */
button,
a {
  min-height: 44px;
  min-width: 44px;
}
```

### Issue 5: Dark Mode Flash (FOUC)

**Cause**: Theme loads after page

**Solution**:

```javascript
// Add to <head> (before any content)
<script>
  if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark')
  }
</script>
```

## Testing Checklist Summary

| Task                    | Viewports Tested | Dark Mode | Status         |
| ----------------------- | ---------------- | --------- | -------------- |
| 1. Mobile (375px)       | 5 pages          | ✅ Yes    | ⚪ Not Started |
| 2. Tablet (768px)       | 5 pages          | ✅ Yes    | ⚪ Not Started |
| 3. Desktop (1440px)     | 5 pages          | ✅ Yes    | ⚪ Not Started |
| 4. Dark Mode Components | All components   | ✅ Yes    | ⚪ Not Started |

## Bug Tracking Template

```markdown
### Bug #[NUMBER]: [Title]

**Priority**: High/Medium/Low
**Component**: [Component name]
**Viewport**: [375px/768px/1440px]
**Theme**: [Light/Dark]

**Steps to Reproduce**:

1. ...
2. ...

**Expected**: ...
**Actual**: ...

**Screenshot**: [Attach]
```

## Next Steps

1. [ ] Test all pages at 375px (mobile)
2. [ ] Test all pages at 768px (tablet)
3. [ ] Test all pages at 1440px (desktop)
4. [ ] Test dark mode on all components
5. [ ] Document bugs
6. [ ] Fix responsive issues
7. [ ] Move to Phase 9.4 - Accessibility

## Status

⚪ **Not Started** - All 4 tasks pending
📋 **Test Documentation Created** - Ready for testing

---

**Note**: Mark each test case with ✅ when passed, ❌ when failed, or ⚠️ when partially working.
