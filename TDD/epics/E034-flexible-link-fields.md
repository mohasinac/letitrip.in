# Epic E034: Flexible Link Fields

## Overview

Update all link input fields throughout the application to support both relative paths (e.g., `/products`, `/shops/my-shop`) and absolute URLs. When a relative path is provided without a domain, the current domain should be automatically prepended when the link is clicked. This eliminates validation errors for internal links.

## Scope

- Update link field validation across the app
- Support relative paths (starting with `/`)
- Auto-prepend domain for relative paths on click
- Update all forms with link inputs
- Hero slides, banners, CTAs, shop links, etc.

---

## Current Problem

```
User enters: /products/sale
System says: "Invalid URL"

User has to enter: https://justforview.in/products/sale
Which is cumbersome and error-prone
```

## Expected Behavior

```
User enters: /products/sale
System accepts it ✓

On click: Opens https://justforview.in/products/sale

User enters: https://external.com/page
System accepts it ✓

On click: Opens https://external.com/page
```

---

## Features

### F034.1: Link Field Validation

**Priority**: P0 (Critical)

Update validation to accept relative paths.

#### User Stories

**US034.1.1**: Accept Relative Paths

```
As a content editor adding links
I want to use relative paths like /products
So that I don't have to type the full domain

Acceptance Criteria:
- Paths starting with "/" are valid
- No "invalid URL" error for relative paths
- Full URLs still work as before
- Empty string is valid (optional field)
- Paths with query params work: /search?q=test
- Paths with hash work: /faq#shipping
```

**US034.1.2**: URL Format Hints

```
As a content editor entering links
I want to see format hints
So that I know what's acceptable

Acceptance Criteria:
- Placeholder shows: "e.g., /products or https://..."
- Helper text explains both formats
- Examples in documentation/tooltips
- No confusion about what's valid
```

---

### F034.2: Link Resolution

**Priority**: P0 (Critical)

Resolve relative paths to full URLs at runtime.

#### User Stories

**US034.2.1**: Auto-Prepend Domain

```
As a user clicking an internal link
I want it to open correctly
So that navigation works seamlessly

Acceptance Criteria:
- Relative paths get current domain prepended
- Works with window.location.origin
- Works in SSR context (use request headers)
- Works in preview/staging environments
- Does not modify external URLs
```

**US034.2.2**: Link Component Update

```
As a developer using link components
I want automatic URL resolution
So that I don't handle it manually

Acceptance Criteria:
- SmartLink component handles resolution
- Uses Next.js Link for internal paths
- Uses <a> with target for external links
- Detects external by protocol (http/https not matching)
- Opens external links in new tab (configurable)
```

---

### F034.3: Form Input Component

**Priority**: P1 (High)

Create a reusable link input component.

```typescript
interface LinkInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  helperText?: string;
  error?: string;
  required?: boolean;
  allowExternal?: boolean; // Allow external URLs (default: true)
  allowRelative?: boolean; // Allow relative paths (default: true)
  onlyInternal?: boolean; // Only allow internal paths
  validatePath?: (path: string) => boolean; // Custom path validation
}
```

#### User Stories

**US034.3.1**: LinkInput Component

```
As a developer building forms with links
I want a reusable LinkInput component
So that link handling is consistent

Acceptance Criteria:
- Component handles all link validation
- Shows appropriate error messages
- Displays format hints
- Works with form libraries (react-hook-form)
- Supports disabled state
- Supports required validation
```

**US034.3.2**: Link Preview

```
As a content editor entering a link
I want to preview where it goes
So that I can verify it's correct

Acceptance Criteria:
- Shows resolved URL below input
- For relative: shows full URL with domain
- For external: shows as-is
- Visual indicator for external links
- Optional: Preview button to test link
```

---

### F034.4: Integration Points

**Priority**: P0 (Critical)

Update all existing link fields.

#### Locations to Update

| Location          | Field         | Current           | Update Needed   |
| ----------------- | ------------- | ----------------- | --------------- |
| Hero Slides       | linkUrl       | Full URL required | Accept relative |
| Homepage Sections | ctaLink       | Full URL required | Accept relative |
| Shop Profile      | socialLinks   | Full URL required | Keep (external) |
| Shop Profile      | websiteUrl    | Full URL required | Keep (external) |
| Blog Posts        | externalLinks | Full URL required | Keep (external) |
| Product Form      | affiliateLink | Full URL required | Keep (external) |
| Category          | customLink    | Full URL required | Accept relative |
| Banner Config     | buttonLink    | Full URL required | Accept relative |
| Navigation Items  | href          | Mixed             | Standardize     |
| Footer Links      | href          | Mixed             | Standardize     |
| Sidebar Links     | href          | Mixed             | Standardize     |
| CMS Rich Text     | links         | Full URL required | Accept relative |

---

### F034.5: SmartLink Component

**Priority**: P0 (Critical)

Create a universal link component.

```typescript
interface SmartLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  target?: "_blank" | "_self";
  rel?: string;
  onClick?: (e: React.MouseEvent) => void;
  prefetch?: boolean;

  // Behavior
  external?: boolean; // Force external behavior
  newTab?: boolean; // Open in new tab
  showExternalIcon?: boolean; // Show icon for external links
}
```

#### User Stories

**US034.5.1**: SmartLink Usage

```
As a developer rendering links
I want a smart link component
So that internal/external handling is automatic

Acceptance Criteria:
- Automatically detects internal vs external
- Uses Next.js Link for internal (prefetch, client nav)
- Uses <a> for external
- Adds rel="noopener noreferrer" for external
- Adds target="_blank" for external (configurable)
- Shows external icon when configured
- Handles mailto: and tel: links
```

**US034.5.2**: Link Detection Logic

```
As a developer
I want consistent link detection
So that behavior is predictable

Acceptance Criteria:
- Starts with "/" → Internal
- Starts with "#" → Anchor (internal)
- Starts with "mailto:" → Email
- Starts with "tel:" → Phone
- Starts with "http://" or "https://" with different domain → External
- Same domain → Internal
```

---

## Utility Functions

```typescript
// lib/link-utils.ts

/**
 * Check if a URL/path is internal
 */
export function isInternalLink(href: string): boolean;

/**
 * Check if a URL/path is external
 */
export function isExternalLink(href: string): boolean;

/**
 * Resolve a relative path to full URL
 */
export function resolveUrl(href: string, baseUrl?: string): string;

/**
 * Validate a link value (for form validation)
 */
export function validateLink(
  value: string,
  options?: LinkValidationOptions,
): ValidationResult;

/**
 * Get link type
 */
export function getLinkType(
  href: string,
): "internal" | "external" | "email" | "phone" | "anchor";
```

---

## Implementation Checklist

### Phase 1: Utilities (Week 1)

- [ ] Create lib/link-utils.ts
- [ ] Implement isInternalLink
- [ ] Implement isExternalLink
- [ ] Implement resolveUrl
- [ ] Implement validateLink
- [ ] Write unit tests

### Phase 2: Components (Week 1)

- [ ] Create SmartLink component
- [ ] Create LinkInput component
- [ ] Add link preview feature
- [ ] Write component tests

### Phase 3: Form Integration (Week 2)

- [ ] Update hero slide form
- [ ] Update homepage section forms
- [ ] Update category form
- [ ] Update banner configuration
- [ ] Update navigation config
- [ ] Update footer links

### Phase 4: Validation Updates (Week 2)

- [ ] Update Zod schemas for links
- [ ] Update form validation rules
- [ ] Update API validation
- [ ] Test all form submissions

### Phase 5: Migration (Week 2-3)

- [ ] Audit all link fields in codebase
- [ ] Replace hardcoded <a> tags with SmartLink
- [ ] Update existing content if needed
- [ ] Document link format for content editors

### Phase 6: Testing (Week 3)

- [ ] Unit tests for utilities
- [ ] Component tests
- [ ] Integration tests for forms
- [ ] E2E tests for navigation

---

## Acceptance Criteria

- [ ] Relative paths accepted in all link fields
- [ ] No "invalid URL" errors for paths like /products
- [ ] External URLs still work correctly
- [ ] SmartLink component handles all link types
- [ ] LinkInput component available for forms
- [ ] Resolved URL preview shown in forms
- [ ] External links open in new tab
- [ ] External links have proper rel attributes
- [ ] All existing link fields updated

---

## Dependencies

- E019: Common Code Architecture (utilities)

## Related Epics

- E014: Homepage CMS (hero slides, banners)
- E013: Category Management (category links)

---

## Test Documentation

**Test Cases**: `TDD/resources/links/TEST-CASES.md`
