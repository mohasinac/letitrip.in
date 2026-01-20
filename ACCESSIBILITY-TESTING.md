# Accessibility Testing Guide - Phase 9.4

## Overview

This document provides comprehensive testing procedures for accessibility (a11y) compliance following WCAG 2.1 AA standards.

## Testing Tools

### Browser Extensions:

- **axe DevTools**: [Chrome/Edge/Firefox](https://www.deque.com/axe/devtools/)
- **WAVE**: [Chrome/Firefox](https://wave.webaim.org/extension/)
- **Lighthouse**: Built into Chrome DevTools (F12 → Lighthouse tab)

### Screen Readers:

- **Windows**: NVDA (free), JAWS (paid)
- **Mac**: VoiceOver (built-in, Cmd+F5)
- **Mobile**: TalkBack (Android), VoiceOver (iOS)

### Keyboard Testing:

- **Tab**: Navigate forward
- **Shift+Tab**: Navigate backward
- **Enter/Space**: Activate buttons/links
- **Arrow Keys**: Navigate lists, menus, sliders
- **Esc**: Close modals/dialogs

## Phase 9.4: Accessibility (0/4)

### Task 1: Keyboard Navigation - All Interactive Elements

#### Tab Order Testing:

**Homepage:**

- [ ] Press Tab repeatedly from top of page
- [ ] **Expected Tab Order**:
  1. Skip to content link (hidden, visible on focus)
  2. Logo
  3. Nav items (Home, Products, Categories, Auctions, Shops)
  4. Search button
  5. Cart icon
  6. User menu
  7. Hero carousel controls (if present)
  8. First product card → Add to Cart button
  9. Second product card → Add to Cart button
  10. ... (continue for all interactive elements)
  11. Footer links
  12. Back to top button (if visible)
- [ ] **Status**: ___________

**Tab Focus Visibility:**

- [ ] All focused elements have visible outline
  - Recommended: 2px solid ring, offset 2px
  - Color: Blue (#2563eb) or theme-appropriate
- [ ] **Status**: ___________

**No Keyboard Traps:**

- [ ] Can navigate INTO and OUT OF all components
  - Modals: Esc to close
  - Dropdowns: Esc to close
  - Carousels: Tab to exit
- [ ] **Status**: ___________

#### Navigation Testing:

**Header Navigation:**

- [ ] Tab to each nav item
- [ ] Press Enter on "Products"
- [ ] **Expected**: Navigate to Products page
- [ ] **Status**: ___________

- [ ] Tab to "Categories" (if has dropdown)
- [ ] Press Enter or Arrow Down to open dropdown
- [ ] **Expected**: Dropdown opens, focus moves to first item
- [ ] **Status**: ___________

- [ ] Arrow Down/Up to navigate dropdown
- [ ] Press Enter to select item
- [ ] **Expected**: Navigate to selected category
- [ ] **Status**: ___________

- [ ] Press Esc in dropdown
- [ ] **Expected**: Dropdown closes, focus returns to "Categories"
- [ ] **Status**: ___________

**Search:**

- [ ] Tab to search button
- [ ] Press Enter
- [ ] **Expected**: Search modal opens, focus in input
- [ ] **Status**: ___________

- [ ] Type search query
- [ ] Arrow Down to navigate suggestions
- [ ] Press Enter on suggestion
- [ ] **Expected**: Navigate to selected result
- [ ] **Status**: ___________

- [ ] Press Esc in search modal
- [ ] **Expected**: Modal closes, focus returns to search button
- [ ] **Status**: ___________

**Product Cards:**

- [ ] Tab to product card
- [ ] Press Enter on card
- [ ] **Expected**: Navigate to product details
- [ ] **Status**: ___________

- [ ] Tab to "Add to Cart" button
- [ ] Press Enter
- [ ] **Expected**: Product added to cart, toast notification
- [ ] **Status**: ___________

**Carousel:**

- [ ] Tab to previous/next buttons
- [ ] Press Enter to navigate slides
- [ ] **Expected**: Slide changes
- [ ] **Status**: ___________

- [ ] Arrow Left/Right to navigate (if implemented)
- [ ] **Expected**: Slide changes
- [ ] **Status**: ___________

**Forms:**

- [ ] Tab through all input fields
- [ ] Enter text in each field
- [ ] Tab to "Submit" button
- [ ] Press Enter
- [ ] **Expected**: Form submits
- [ ] **Status**: ___________

- [ ] Tab to checkbox/radio
- [ ] Press Space to toggle
- [ ] **Expected**: Checkbox/radio toggles
- [ ] **Status**: ___________

**Modals:**

- [ ] Open modal (e.g., Add to Cart confirmation)
- [ ] **Expected**: Focus moves inside modal
- [ ] **Status**: ___________

- [ ] Tab through modal elements
- [ ] **Expected**: Focus stays within modal (focus trap)
- [ ] **Status**: ___________

- [ ] Press Esc
- [ ] **Expected**: Modal closes, focus returns to trigger button
- [ ] **Status**: ___________

---

### Task 2: Screen Reader Support - ARIA Labels, Semantic HTML

#### Semantic HTML Testing:

**Header:**

- [ ] Uses `<header>` tag
- [ ] Logo uses `<a>` with `aria-label="LetItRip Homepage"`
- [ ] Nav uses `<nav>` with `aria-label="Main navigation"`
- [ ] Search uses `<button>` or `<a>` with `aria-label="Search"`
- [ ] Cart uses `<a>` with `aria-label="Cart, X items"`
- [ ] **Status**: ___________

**Main Content:**

- [ ] Uses `<main>` tag
- [ ] Sections use `<section>` with `aria-labelledby`
- [ ] Headings use `<h1>`, `<h2>`, `<h3>` in hierarchical order
  - H1: "LetItRip - E-Commerce Platform" (only one per page)
  - H2: "Featured Products", "Popular Categories"
  - H3: Product titles, category names
- [ ] **Status**: ___________

**Product Cards:**

- [ ] Uses `<article>` or `<div>` with role="article"
- [ ] Image has `alt` text describing product
- [ ] Price has `aria-label="Price: Rupees 12,999"`
- [ ] Add to Cart button: `<button>` with clear label
- [ ] **Status**: ___________

**Forms:**

- [ ] All inputs have associated `<label>`
  - Using `for` attribute matching input `id`
  - Or wrapped in `<label>` tag
- [ ] Required fields have `aria-required="true"`
- [ ] Error messages have `aria-live="polite"` or `aria-describedby`
- [ ] **Status**: ___________

**Footer:**

- [ ] Uses `<footer>` tag
- [ ] Link sections use `<nav>` with `aria-label="Footer navigation"`
- [ ] Social links have `aria-label` (e.g., "Facebook", "Twitter")
- [ ] **Status**: ___________

#### ARIA Labels Testing:

**Icons Without Text:**

- [ ] Search icon: `aria-label="Search"`
- [ ] Cart icon: `aria-label="Cart, 3 items"` (dynamic count)
- [ ] User icon: `aria-label="User menu"`
- [ ] Close icon: `aria-label="Close"`
- [ ] **Status**: ___________

**Buttons:**

- [ ] "Add to Cart": `aria-label="Add iPhone 15 to cart"` (specific product)
- [ ] "Buy Now": `aria-label="Buy iPhone 15 now"`
- [ ] "Remove": `aria-label="Remove from cart"`
- [ ] **Status**: ___________

**Links:**

- [ ] "Learn More": `aria-label="Learn more about iPhone 15"`
- [ ] "View Details": `aria-label="View details of iPhone 15"`
- [ ] External links: `aria-label="Opens in new window"` or icon
- [ ] **Status**: ___________

**Images:**

- [ ] Product images: `alt="iPhone 15 Pro Max in Blue"`
- [ ] Decorative images: `alt=""` (empty, screen reader ignores)
- [ ] Logo: `alt="LetItRip Logo"`
- [ ] **Status**: ___________

#### Screen Reader Testing (NVDA/VoiceOver):

**Homepage:**

- [ ] Turn on screen reader
- [ ] Navigate from top of page
- [ ] **Expected Announcements**:
  - "LetItRip, link" (logo)
  - "Main navigation" (nav)
  - "Products, link"
  - "Search, button"
  - "Cart, 3 items, link"
  - "Featured Products, heading level 2"
  - "iPhone 15 Pro Max, article" (product card)
  - "Add to cart, button"
- [ ] **Status**: ___________

**Product Details:**

- [ ] Navigate to product page
- [ ] **Expected Announcements**:
  - "iPhone 15 Pro Max, heading level 1"
  - "Price: Rupees 129,900"
  - "4.5 out of 5 stars, 1,234 reviews"
  - "In stock, 15 available"
  - "Add to cart, button"
- [ ] **Status**: ___________

**Forms:**

- [ ] Navigate to login form
- [ ] **Expected Announcements**:
  - "Email, required, edit, blank" (input)
  - "Password, required, password, blank" (password input)
  - "Login, button"
  - "Invalid email format" (error message, if present)
- [ ] **Status**: ___________

**Modals:**

- [ ] Open modal
- [ ] **Expected Announcements**:
  - "Added to cart, dialog" (modal title)
  - "iPhone 15 Pro Max added to cart"
  - "View cart, button"
  - "Continue shopping, button"
- [ ] **Status**: ___________

---

### Task 3: Focus Indicators - Visible Focus States

#### Focus Ring Testing:

**Global Focus Styles:**

- [ ] All focusable elements have visible focus indicator
- [ ] Focus ring style:
  - Width: 2px or more
  - Color: High contrast (blue, black, or theme color)
  - Offset: 2px from element (using `ring-offset`)
- [ ] **Status**: ___________

**Component-Specific Focus:**

**Links:**

- [ ] Default links:
  - Focus: Blue ring, 2px
  - Underline appears/thickens
- [ ] **Status**: ___________

**Buttons:**

- [ ] Primary button:
  - Focus: Ring matches button color, offset 2px
  - Example: Blue button → Blue ring
- [ ] Secondary button:
  - Focus: Ring matches border color
- [ ] **Status**: ___________

**Input Fields:**

- [ ] Text input:
  - Focus: Blue border (2px)
  - Box shadow for depth
- [ ] Checkbox/Radio:
  - Focus: Ring around input (4px)
- [ ] **Status**: ___________

**Custom Components:**

- [ ] Carousel controls:
  - Focus: Ring visible on prev/next buttons
- [ ] Product cards:
  - Focus: Ring around entire card or image
- [ ] Dropdown menus:
  - Focus: Ring on current item
- [ ] **Status**: ___________

**Focus Visible vs Always:**

- [ ] Mouse click: No focus ring (`:focus-visible` not triggered)
- [ ] Keyboard Tab: Focus ring visible (`:focus-visible` triggered)
- [ ] **Status**: ___________

**Tailwind CSS Focus Classes:**

```css
/* Recommended focus styles */
.focus-ring {
  @apply focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2;
}

.focus-ring-inset {
  @apply focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500;
}
```

#### Focus Order Testing:

**Logical Tab Order:**

- [ ] Tab order follows visual layout
  - Left to right
  - Top to bottom
- [ ] No elements out of order
- [ ] **Status**: ___________

**Hidden Elements:**

- [ ] Off-screen elements not focusable
  - Use `hidden`, `display: none`, or `visibility: hidden`
  - NOT `opacity: 0` or `position: absolute; left: -9999px`
- [ ] **Status**: ___________

**Dynamic Content:**

- [ ] New elements (e.g., modal) receive focus
- [ ] Removed elements don't break tab order
- [ ] **Status**: ___________

---

### Task 4: Alt Text - All Images Have Descriptive Alt Text

#### Image Alt Text Audit:

**Product Images:**

- [ ] **Format**: `alt="[Product Name] in [Color/Variant]"`
  - Example: `alt="iPhone 15 Pro Max in Deep Purple"`
  - Not: `alt="product-image-1.jpg"`
- [ ] **Status**: ___________

**Category Images:**

- [ ] **Format**: `alt="[Category Name] category"`
  - Example: `alt="Electronics category"`
- [ ] **Status**: ___________

**Banner Images:**

- [ ] **Format**: Describe the offer/message
  - Example: `alt="50% off on all electronics - Limited time offer"`
  - Not: `alt="Banner image"`
- [ ] **Status**: ___________

**User Avatars:**

- [ ] **Format**: `alt="[Username] profile picture"`
  - Example: `alt="John Doe profile picture"`
  - Or: `alt="User avatar"`
- [ ] **Status**: ___________

**Logos:**

- [ ] **Format**: `alt="[Company Name] logo"`
  - Example: `alt="LetItRip logo"`
- [ ] **Status**: ___________

**Decorative Images:**

- [ ] **Empty alt**: `alt=""`
  - For images that don't convey information
  - Background patterns, dividers, spacers
- [ ] **Status**: ___________

**Icons:**

- [ ] **With text**: `alt=""` (icon is decorative)
  - Example: `<ShoppingCart /> Cart` → Icon alt is empty
- [ ] **Without text**: `alt="[Action]"`
  - Example: `alt="Search"` (search icon only)
- [ ] **Status**: ___________

**Complex Images (Charts, Diagrams):**

- [ ] **Format**: Brief alt + longer description
  - Alt: `alt="Sales chart showing growth in 2024"`
  - Description: Use `aria-describedby` or `<figcaption>`
- [ ] **Status**: ___________

#### Image Alt Text Checklist:

- [ ] All `<img>` tags have `alt` attribute (never missing)
- [ ] Alt text is concise (< 125 characters)
- [ ] Alt text is descriptive and specific
- [ ] No "image of" or "picture of" (redundant)
- [ ] No file names as alt text
- [ ] Decorative images have empty alt (`alt=""`)
- [ ] Complex images have extended descriptions

#### Testing Tools:

**Automated Check (Chrome DevTools):**

```javascript
// Run in console
document.querySelectorAll("img:not([alt])").forEach((img) => {
  console.error("Missing alt:", img.src);
});

document.querySelectorAll('img[alt=""]').forEach((img) => {
  console.log("Empty alt (decorative?):", img.src);
});
```

**Manual Check:**

- [ ] Turn off images (Chrome extension)
- [ ] **Expected**: Alt text displayed in place of images
- [ ] **Actual**: ___________

**Screen Reader Check:**

- [ ] Navigate through page with screen reader
- [ ] **Expected**: All images announced with descriptive alt text
- [ ] **Actual**: ___________

---

## Accessibility Checklist Summary

| Task                          | Test Cases | Status         |
| ----------------------------- | ---------- | -------------- |
| 1. Keyboard Navigation        | 50+ tests  | ⚪ Not Started |
| 2. Screen Reader Support      | 30+ tests  | ⚪ Not Started |
| 3. Focus Indicators           | 20+ tests  | ⚪ Not Started |
| 4. Alt Text                   | 10+ tests  | ⚪ Not Started |
| **Total Accessibility Tests** | **110+**   | **⚪**         |

## WCAG 2.1 AA Compliance

### Level A (Must Have):

- [ ] **1.1.1 Non-text Content**: All images have alt text
- [ ] **1.3.1 Info and Relationships**: Semantic HTML (headings, lists, etc.)
- [ ] **1.4.1 Use of Color**: Don't rely on color alone
- [ ] **2.1.1 Keyboard**: All functionality available via keyboard
- [ ] **2.4.1 Bypass Blocks**: Skip to content link
- [ ] **2.4.2 Page Titled**: All pages have unique `<title>`
- [ ] **3.1.1 Language of Page**: `<html lang="en">`
- [ ] **4.1.2 Name, Role, Value**: All UI components have accessible names

### Level AA (Should Have):

- [ ] **1.4.3 Contrast (Minimum)**: 4.5:1 for normal text, 3:1 for large text
- [ ] **1.4.5 Images of Text**: Use real text, not images of text
- [ ] **2.4.6 Headings and Labels**: Descriptive headings
- [ ] **2.4.7 Focus Visible**: Visible focus indicator
- [ ] **3.2.4 Consistent Navigation**: Navigation same on all pages
- [ ] **3.3.3 Error Suggestion**: Provide suggestions for form errors

## Accessibility Testing Tools

### Automated Tools:

**Lighthouse (Chrome DevTools):**

```
1. F12 → Lighthouse tab
2. Select "Accessibility"
3. Click "Analyze page load"
4. Target Score: 95+
```

**axe DevTools:**

```
1. Install extension
2. F12 → axe DevTools tab
3. Click "Scan ALL of my page"
4. Fix all "Critical" and "Serious" issues
```

**WAVE:**

```
1. Install extension
2. Click WAVE icon
3. Review errors (red) and alerts (yellow)
4. Fix all errors
```

### Manual Testing:

**Keyboard Navigation:**

```
1. Unplug mouse
2. Navigate entire site with keyboard only
3. Ensure all functions accessible
```

**Screen Reader:**

```
1. Turn on NVDA (Windows) or VoiceOver (Mac)
2. Navigate page
3. Ensure all content announced correctly
```

**Color Contrast:**

```
1. Use contrast checker: https://webaim.org/resources/contrastchecker/
2. Check all text/background combinations
3. Minimum ratio: 4.5:1 (normal text), 3:1 (large text)
```

## Common Accessibility Issues

### Issue 1: Missing Alt Text

**Problem**: `<img src="product.jpg" />` (no alt)

**Solution**:

```html
<img src="product.jpg" alt="iPhone 15 Pro Max in Deep Purple" />
```

### Issue 2: Non-Semantic HTML

**Problem**:

```html
<div onclick="navigate()">Products</div>
```

**Solution**:

```html
<a href="/products">Products</a>
```

### Issue 3: Missing ARIA Labels

**Problem**:

```html
<button><SearchIcon /></button>
```

**Solution**:

```html
<button aria-label="Search"><SearchIcon /></button>
```

### Issue 4: Keyboard Trap

**Problem**: Can tab into modal but not out

**Solution**:

```typescript
// Focus trap in modal
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") closeModal();
    if (e.key === "Tab") {
      // Trap focus within modal
      const focusableElements = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      // Cycle through focusable elements
    }
  };
  document.addEventListener("keydown", handleKeyDown);
  return () => document.removeEventListener("keydown", handleKeyDown);
}, []);
```

### Issue 5: Low Color Contrast

**Problem**: Light gray text on white background (2:1 ratio)

**Solution**:

```css
/* Increase contrast */
.text-low-contrast {
  color: #999; /* Old: 2.8:1 */
  color: #666; /* New: 4.5:1 ✅ */
}
```

## Accessibility Resources

- [WCAG 2.1 Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [A11y Project Checklist](https://www.a11yproject.com/checklist/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)

## Status

⚪ **Not Started** - All 4 tasks pending
📋 **Test Documentation Created** - Comprehensive guide ready

---

**Note**: Mark each test case with ✅ when passed, ❌ when failed (with bug report), or ⚠️ when partially working.

## Next Steps

1. [ ] Complete keyboard navigation testing
2. [ ] Test with screen reader (NVDA/VoiceOver)
3. [ ] Verify all focus indicators
4. [ ] Audit all image alt text
5. [ ] Run Lighthouse accessibility audit (target: 95+)
6. [ ] Run axe DevTools scan (fix all critical issues)
7. [ ] Document bugs
8. [ ] Fix accessibility issues
9. [ ] Retest
10. [ ] Phase 9 Complete! 🎉
