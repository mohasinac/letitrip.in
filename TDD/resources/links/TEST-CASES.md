# Flexible Link Fields Test Cases

## E034: Flexible Link Fields

### Unit Tests

#### TC-LINKS-001: Link Detection

```typescript
describe("Link Type Detection", () => {
  it.todo("should detect internal paths starting with /");
  it.todo("should detect anchor links starting with #");
  it.todo("should detect mailto: links");
  it.todo("should detect tel: links");
  it.todo("should detect external http:// links");
  it.todo("should detect external https:// links");
  it.todo("should detect same-domain as internal");
  it.todo("should detect different domain as external");
});
```

#### TC-LINKS-002: URL Resolution

```typescript
describe("URL Resolution", () => {
  it.todo("should prepend domain to relative paths");
  it.todo("should use window.location.origin");
  it.todo("should handle paths with query params");
  it.todo("should handle paths with hash");
  it.todo("should not modify external URLs");
  it.todo("should not modify mailto/tel links");
  it.todo("should work in SSR context");
});
```

#### TC-LINKS-003: Link Validation

```typescript
describe("Link Validation", () => {
  it.todo("should accept paths starting with /");
  it.todo("should accept valid http URLs");
  it.todo("should accept valid https URLs");
  it.todo("should accept empty string (optional)");
  it.todo("should reject invalid URLs");
  it.todo("should reject paths not starting with /");
  it.todo("should validate based on options (internal only, etc.)");
});
```

### Component Tests

#### TC-LINKS-004: SmartLink Component

```typescript
describe("SmartLink Component", () => {
  it.todo("should render Next.js Link for internal paths");
  it.todo("should render <a> for external URLs");
  it.todo('should add target="_blank" for external');
  it.todo('should add rel="noopener noreferrer" for external');
  it.todo("should show external icon when configured");
  it.todo("should handle mailto: links");
  it.todo("should handle tel: links");
  it.todo("should support onClick handler");
  it.todo("should support className");
  it.todo("should support custom target");
});
```

#### TC-LINKS-005: LinkInput Component

```typescript
describe("LinkInput Component", () => {
  it.todo("should accept relative paths");
  it.todo("should accept external URLs");
  it.todo("should show validation error for invalid input");
  it.todo("should show format hints in placeholder");
  it.todo("should show resolved URL preview");
  it.todo("should indicate external links");
  it.todo("should work with react-hook-form");
  it.todo("should support required validation");
  it.todo("should support onlyInternal mode");
});
```

#### TC-LINKS-006: Link Preview

```typescript
describe("Link Preview", () => {
  it.todo("should show full URL for relative paths");
  it.todo("should show URL as-is for external");
  it.todo("should show external icon for external");
  it.todo("should update on input change");
  it.todo("should hide when empty");
});
```

### Integration Tests

#### TC-LINKS-007: Hero Slide Form

```typescript
describe("Hero Slide Link Field", () => {
  it.todo("should accept /products as valid");
  it.todo("should accept https://external.com as valid");
  it.todo("should save relative path correctly");
  it.todo("should display saved relative path");
  it.todo("should resolve to full URL on click");
});
```

#### TC-LINKS-008: Homepage Section Form

```typescript
describe("Homepage Section CTA Link", () => {
  it.todo("should accept relative CTA links");
  it.todo("should validate link field");
  it.todo("should save and display correctly");
});
```

#### TC-LINKS-009: Category Form

```typescript
describe("Category Custom Link", () => {
  it.todo("should accept /custom-page");
  it.todo("should validate link");
  it.todo("should save correctly");
});
```

#### TC-LINKS-010: Navigation Config

```typescript
describe("Navigation Links", () => {
  it.todo("should support relative nav links");
  it.todo("should support external nav links");
  it.todo("should render correctly in nav");
});
```

### E2E Tests

#### TC-LINKS-011: Hero Slide Link E2E

```typescript
describe("Hero Slide Link E2E", () => {
  it.todo("should create slide with relative link");
  it.todo("should see slide on homepage");
  it.todo("should click slide");
  it.todo("should navigate to correct page");
});
```

#### TC-LINKS-012: External Link E2E

```typescript
describe("External Link E2E", () => {
  it.todo("should enter external URL");
  it.todo("should save successfully");
  it.todo("should open in new tab on click");
});
```

#### TC-LINKS-013: Navigation Link E2E

```typescript
describe("Navigation Link E2E", () => {
  it.todo("should have relative nav links");
  it.todo("should click nav link");
  it.todo("should navigate within app");
  it.todo("should not full page reload");
});
```

### Validation Tests

#### TC-LINKS-014: Zod Schema Updates

```typescript
describe("Link Validation Schemas", () => {
  it.todo("should update heroSlideSchema for flexible links");
  it.todo("should update categorySchema for flexible links");
  it.todo("should update bannerSchema for flexible links");
  it.todo("should maintain external-only for social links");
});
```

#### TC-LINKS-015: API Validation

```typescript
describe("API Link Validation", () => {
  it.todo("should accept relative paths in API");
  it.todo("should accept external URLs in API");
  it.todo("should reject truly invalid formats");
});
```

### Migration Tests

#### TC-LINKS-016: Codebase Audit

```typescript
describe("Link Component Audit", () => {
  it.todo("should replace hardcoded <a> with SmartLink");
  it.todo("should use SmartLink in hero slides");
  it.todo("should use SmartLink in nav items");
  it.todo("should use SmartLink in footer");
  it.todo("should use SmartLink in cards");
});
```

#### TC-LINKS-017: Form Migration

```typescript
describe("Form Link Migration", () => {
  it.todo("should use LinkInput in hero slide form");
  it.todo("should use LinkInput in category form");
  it.todo("should use LinkInput in banner form");
  it.todo("should use LinkInput in homepage section form");
});
```

### Accessibility Tests

#### TC-LINKS-018: Link Accessibility

```typescript
describe("Link Accessibility", () => {
  it.todo("should announce external links");
  it.todo("should have proper focus styles");
  it.todo("should have descriptive aria-labels");
  it.todo("should indicate new tab opening");
});
```

### Edge Case Tests

#### TC-LINKS-019: Edge Cases

```typescript
describe("Link Edge Cases", () => {
  it.todo("should handle path with special characters");
  it.todo("should handle encoded URLs");
  it.todo("should handle unicode in paths");
  it.todo("should handle very long URLs");
  it.todo("should handle protocol-relative URLs");
  it.todo("should handle localhost URLs in development");
});
```
