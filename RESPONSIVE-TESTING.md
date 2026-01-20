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
  - **Status**: \***\*\_\_\_\*\***

- [ ] **Navigation**: Hamburger menu visible

  - Icon: 24×24px, right side
  - Opens full-screen overlay on click
  - **Status**: \***\*\_\_\_\*\***

- [ ] **Search**: Icon only (magnifying glass)

  - Opens full-screen search on click
  - **Status**: \***\*\_\_\_\*\***

- [ ] **Cart**: Icon with badge
  - Badge: 16px circle, top-right
  - Shows item count
  - **Status**: \***\*\_\_\_\*\***

**Hero Section (375px):**

- [ ] **Carousel**: Full width, single image visible

  - Height: 50vh (viewport height)
  - Controls: Left/right arrows visible
  - Swipeable on touch
  - **Status**: \***\*\_\_\_\*\***

- [ ] **Hero Text**: Readable, not overlapping
  - Title: 24-28px
  - Subtitle: 14-16px
  - CTA Button: 44px height (touch-friendly)
  - **Status**: \***\*\_\_\_\*\***

**Product Grid (375px):**

- [ ] **Layout**: 2 columns (no scroll)

  - Gap: 12px between cards
  - Card width: ~165px each
  - **Status**: \***\*\_\_\_\*\***

- [ ] **Product Card**: All info visible

  - Image: Square aspect ratio
  - Title: 2 lines max, ellipsis
  - Price: Bold, 16px
  - Add to Cart: 40px height button
  - **Status**: \***\*\_\_\_\*\***

- [ ] **Horizontal Scroller**: Swipeable
  - Shows 1.5 products at a time
  - Scroll indicators visible
  - **Status**: \***\*\_\_\_\*\***

**Footer (375px):**

- [ ] **Links**: Stacked vertically

  - 4 sections, each full width
  - Accordions for mobile (collapsible)
  - **Status**: \***\*\_\_\_\*\***

- [ ] **Social Icons**: Visible, 44px touch targets
  - Row of icons, centered
  - **Status**: \***\*\_\_\_\*\***

**Bottom Navigation (375px):**

- [ ] **Sticky**: Fixed at bottom

  - Height: 64px
  - Background: white/dark (theme aware)
  - **Status**: \***\*\_\_\_\*\***

- [ ] **Icons**: 5 items, evenly spaced
  - Icon size: 24px
  - Label: 10-12px below
  - Active state: Color change
  - **Status**: \***\*\_\_\_\*\***

#### Product Details Page (375px):

- [ ] **Image Gallery**: Full width, swipeable

  - Thumbnail strip: Horizontal scroll
  - Lightbox: Full screen on tap
  - **Status**: \***\*\_\_\_\*\***

- [ ] **Product Info**: Stacked vertically

  - Title: 20px, 2-3 lines
  - Price: 24px, bold
  - Description: Expandable ("Read more")
  - **Status**: \***\*\_\_\_\*\***

- [ ] **Action Buttons**: Full width

  - Add to Cart: 100% width, 48px height
  - Buy Now: 100% width, 48px height
  - Gap: 12px between buttons
  - **Status**: \***\*\_\_\_\*\***

- [ ] **Tabs**: Full width, horizontal scroll
  - Description, Reviews, Specifications
  - Active tab: Underline indicator
  - **Status**: \***\*\_\_\_\*\***

#### Checkout Page (375px):

- [ ] **Form Fields**: Full width

  - Input height: 48px (touch-friendly)
  - Labels: Above input
  - Error messages: Below input, red
  - **Status**: \***\*\_\_\_\*\***

- [ ] **Order Summary**: Collapsed by default

  - Expandable accordion
  - Shows item count and total
  - **Status**: \***\*\_\_\_\*\***

- [ ] **Payment Options**: Stacked cards
  - Radio buttons: 24px touch target
  - Card logos visible
  - **Status**: \***\*\_\_\_\*\***

---

### Task 2: Tablet (768px) - Layout Adapts Correctly

#### Homepage Testing:

**Header (768px):**

- [ ] **Logo**: Larger, ~50px height

  - **Status**: \***\*\_\_\_\*\***

- [ ] **Navigation**: Visible menu items (5-7 items)

  - Inline, horizontal layout
  - No hamburger menu
  - **Status**: \***\*\_\_\_\*\***

- [ ] **Search**: Visible search bar (200px width)
  - Icon + input field
  - **Status**: \***\*\_\_\_\*\***

**Hero Section (768px):**

- [ ] **Carousel**: Wider, better aspect ratio
  - Height: 60vh
  - 2 slides visible (if multiple)
  - **Status**: \***\*\_\_\_\*\***

**Product Grid (768px):**

- [ ] **Layout**: 3-4 columns

  - Gap: 16px
  - Card width: ~220px each
  - **Status**: \***\*\_\_\_\*\***

- [ ] **Product Card**: More spacious
  - Larger images
  - Full title visible (no ellipsis)
  - **Status**: \***\*\_\_\_\*\***

**Footer (768px):**

- [ ] **Links**: 2×2 grid
  - 2 columns, 2 rows
  - No accordions (all visible)
  - **Status**: \***\*\_\_\_\*\***

**Bottom Navigation (768px):**

- [ ] **Hidden** or **Persistent**:
  - Option 1: Hidden (use header nav only)
  - Option 2: Visible with labels
  - **Status**: \***\*\_\_\_\*\***

#### Product Details Page (768px):

- [ ] **Image Gallery**: 50% width, left side

  - Thumbnails: Vertical on left
  - Main image: Right of thumbnails
  - **Status**: \***\*\_\_\_\*\***

- [ ] **Product Info**: 50% width, right side

  - Side-by-side layout
  - More breathing room
  - **Status**: \***\*\_\_\_\*\***

- [ ] **Tabs**: Full width, below product info
  - All tabs visible (no scroll)
  - **Status**: \***\*\_\_\_\*\***

#### Checkout Page (768px):

- [ ] **Two-Column Layout**:
  - Left: Shipping form (60%)
  - Right: Order summary (40%)
  - **Status**: \***\*\_\_\_\*\***

---

### Task 3: Desktop (1440px) - Optimal Spacing

#### Homepage Testing:

**Header (1440px):**

- [ ] **Container**: Max width 1440px, centered

  - Padding: 40px left/right
  - **Status**: \***\*\_\_\_\*\***

- [ ] **Logo**: 60px height

  - **Status**: \***\*\_\_\_\*\***

- [ ] **Navigation**: Full menu (8+ items)

  - Spacing: 24px between items
  - **Status**: \***\*\_\_\_\*\***

- [ ] **Search**: Wider (300px)
  - **Status**: \***\*\_\_\_\*\***

**Hero Section (1440px):**

- [ ] **Carousel**: Max width 1440px

  - Height: 70vh
  - 3 slides visible (if multiple)
  - **Status**: \***\*\_\_\_\*\***

- [ ] **Hero Text**: Larger fonts
  - Title: 48-56px
  - Subtitle: 18-20px
  - **Status**: \***\*\_\_\_\*\***

**Product Grid (1440px):**

- [ ] **Layout**: 5-6 columns

  - Gap: 24px
  - Card width: ~250px each
  - **Status**: \***\*\_\_\_\*\***

- [ ] **Hover Effects**: Visible and smooth
  - Scale up: 1.05
  - Shadow: Increases
  - Transition: 300ms
  - **Status**: \***\*\_\_\_\*\***

**Footer (1440px):**

- [ ] **Links**: 4 columns, single row
  - Even spacing
  - All links visible
  - **Status**: \***\*\_\_\_\*\***

#### Product Details Page (1440px):

- [ ] **Image Gallery**: 60% width

  - Larger main image (800×800px)
  - Grid thumbnails (4×2)
  - **Status**: \***\*\_\_\_\*\***

- [ ] **Product Info**: 40% width

  - Sticky on scroll
  - **Status**: \***\*\_\_\_\*\***

- [ ] **Related Products**: 4 columns
  - Below product details
  - **Status**: \***\*\_\_\_\*\***

#### Checkout Page (1440px):

- [ ] **Three-Column Layout** (optional):
  - Left: Shipping (50%)
  - Center: Payment (25%)
  - Right: Summary (25%)
  - **Status**: \***\*\_\_\_\*\***

---

### Task 4: Dark Mode - All Components Support Dark Mode

#### Global Dark Mode Testing:

**Color Scheme:**

- [ ] **Background**: `bg-gray-50` → `dark:bg-gray-900`

  - **Status**: \***\*\_\_\_\*\***

- [ ] **Text**: `text-gray-900` → `dark:text-gray-100`

  - **Status**: \***\*\_\_\_\*\***

- [ ] **Cards**: `bg-white` → `dark:bg-gray-800`

  - **Status**: \***\*\_\_\_\*\***

- [ ] **Borders**: `border-gray-200` → `dark:border-gray-700`
  - **Status**: \***\*\_\_\_\*\***

**Component-Specific Testing:**

**Header (Dark Mode):**

- [ ] **Background**: White → Dark gray/black

  - No harsh contrast
  - **Status**: \***\*\_\_\_\*\***

- [ ] **Logo**: Inverts or has dark variant

  - **Status**: \***\*\_\_\_\*\***

- [ ] **Icons**: Light color (white/gray-300)
  - **Status**: \***\*\_\_\_\*\***

**Product Card (Dark Mode):**

- [ ] **Card Background**: Dark gray

  - **Status**: \***\*\_\_\_\*\***

- [ ] **Image**: No background change

  - **Status**: \***\*\_\_\_\*\***

- [ ] **Text**: Light color, readable

  - Title: white
  - Price: Light gray
  - **Status**: \***\*\_\_\_\*\***

- [ ] **Button**: Dark mode variant
  - Primary: Blue-500 → Blue-400
  - Text: White remains white
  - **Status**: \***\*\_\_\_\*\***

**Forms (Dark Mode):**

- [ ] **Input Fields**: Dark background

  - Background: gray-800
  - Border: gray-600
  - Text: white
  - Placeholder: gray-400
  - **Status**: \***\*\_\_\_\*\***

- [ ] **Focus State**: Visible in dark mode
  - Border: blue-400 or blue-300
  - **Status**: \***\*\_\_\_\*\***

**Modals (Dark Mode):**

- [ ] **Overlay**: Dark with transparency

  - Background: `rgba(0, 0, 0, 0.7)`
  - **Status**: \***\*\_\_\_\*\***

- [ ] **Modal Content**: Dark background
  - Background: gray-800
  - Text: white
  - **Status**: \***\*\_\_\_\*\***

**Footer (Dark Mode):**

- [ ] **Background**: Dark gray/black

  - **Status**: \***\*\_\_\_\*\***

- [ ] **Links**: Light color
  - Hover: Lighter or underline
  - **Status**: \***\*\_\_\_\*\***

**Skeletons (Dark Mode):**

- [ ] **Animation**: Visible in dark mode
  - Base: gray-700
  - Highlight: gray-600
  - **Status**: \***\*\_\_\_\*\***

**Toasts/Alerts (Dark Mode):**

- [ ] **Success**: Green with dark bg

  - Background: green-800
  - Text: white
  - **Status**: \***\*\_\_\_\*\***

- [ ] **Error**: Red with dark bg

  - Background: red-800
  - Text: white
  - **Status**: \***\*\_\_\_\*\***

- [ ] **Info**: Blue with dark bg
  - Background: blue-800
  - Text: white
  - **Status**: \***\*\_\_\_\*\***

**Images (Dark Mode):**

- [ ] **No Inversion**: Images remain normal

  - Product images: No filter
  - **Status**: \***\*\_\_\_\*\***

- [ ] **Icons**: SVG icons change color
  - Using `currentColor` or `fill-current`
  - **Status**: \***\*\_\_\_\*\***

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
  if (localStorage.theme === 'dark' || (!('theme' in localStorage) &&
  window.matchMedia('(prefers-color-scheme: dark)').matches)){" "}
  {document.documentElement.classList.add("dark")}
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
