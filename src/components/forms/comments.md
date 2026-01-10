# Form Components - Future Refactoring Notes

## Completed Improvements ✅

### Input Sanitization (January 10, 2026)

- ✅ **Auto-Sanitization on Blur**: FormInput, FormTextarea, and FormField now support automatic input sanitization
- ✅ **Multiple Sanitization Types**:
  - `string` - Plain text with trim, whitespace collapse, max length
  - `email` - Email normalization and cleaning
  - `phone` - Phone number cleaning
  - `url` - URL validation with protocol checking
  - `html` - HTML sanitization with configurable whitelist
- ✅ **Configurable Behavior**:
  - `sanitize` prop - Enable/disable sanitization
  - `sanitizeType` prop - Choose sanitization type
  - `sanitizeHtmlOptions` prop - Configure HTML sanitization (for FormTextarea)
  - `onSanitize` callback - React to sanitized values
- ✅ **XSS Prevention**: Blocks malicious scripts and dangerous protocols (javascript:, data:, vbscript:)
- ✅ **Raw Value Preservation**: Original value stays in state until blur event triggers sanitization
- ✅ **FormField Integration**: Sanitization props pass through to child components
- ✅ **Test Suite**: Created FormSanitizationTest.tsx with 7 comprehensive test scenarios

**Usage Examples:**

```tsx
// String sanitization
<FormInput
  sanitize
  sanitizeType="string"
  onSanitize={(cleaned) => setName(cleaned)}
/>

// Email sanitization
<FormInput
  type="email"
  sanitize
  sanitizeType="email"
  onSanitize={(cleaned) => setEmail(cleaned)}
/>

// HTML sanitization with basic formatting
<FormTextarea
  sanitize
  sanitizeType="html"
  sanitizeHtmlOptions={{ allowBasicFormatting: true }}
  onSanitize={(cleaned) => setBio(cleaned)}
/>

// Via FormField wrapper
<FormField label="Name" sanitize sanitizeType="string">
  <FormInput value={name} onChange={...} onSanitize={...} />
</FormField>
```

## Potential Improvements

### 1. Form Validation

- **Centralized Validation**: Create a unified validation system instead of scattered error props
  - Consider using a validation library like Zod or Yup
  - Create reusable validation schemas
  - Support async validation (e.g., checking username availability)
- **Real-time Validation**: Add debounced validation as user types
- **Cross-field Validation**: Support validation that depends on multiple fields
- **Custom Validators**: Better support for custom validation functions per component

### 2. Form State Management

- **React Hook Form Integration**: Add first-class support for React Hook Form
  - Create wrapper components that auto-register
  - Support for controller pattern
- **Form Context**: Create a shared form context to avoid prop drilling
  - Centralize error handling
  - Share loading states
  - Coordinate validation across fields
- **Undo/Redo**: Add form state history for undo/redo functionality
- **Auto-save**: Support for auto-saving form data to localStorage or API

### 3. Component API Improvements

- **Consistent Error Handling**: Standardize error prop vs error message prop across all components
- **Loading States**: Add built-in loading state support to all form components
- **Success States**: Add success state styling (green borders, checkmark)
- **Warning States**: Support warning/info states beyond just error states
- **Size Variants**: Add size prop (small, medium, large) for consistent sizing
- **Variant Prop**: Add visual variants (outlined, filled, ghost) for different contexts

### 4. FormNumberInput Enhancements

- **Currency Input**: Create specialized currency input with proper formatting
- **Percentage Input**: Specialized percentage input with % symbol
- **Range Slider**: Add visual slider option for min/max ranges
- **Unit Selection**: Support for unit dropdowns (e.g., kg, lbs, cm, inches)
- **Scientific Notation**: Support for very large/small numbers

### 5. FormListInput Improvements

- **Drag and Drop**: Implement proper drag-and-drop reordering
- **Bulk Actions**: Add select all, delete selected functionality
- **Import/Export**: Support CSV import/export for list values
- **Templates**: Pre-defined templates for common lists
- **Validation Preview**: Show validation errors before adding to list

### 6. Wizard Form Enhancements

- **Progress Persistence**: Save wizard progress to localStorage
- **Step Validation**: Validate each step before allowing navigation
- **Conditional Steps**: Support skipping steps based on previous answers
- **Review Step**: Auto-generate review/summary step before submission
- **Exit Confirmation**: Warn users when leaving incomplete wizard
- **Mobile Optimization**: Better mobile navigation (swipe between steps)

### 7. Accessibility Improvements

- **ARIA Live Regions**: Announce validation errors to screen readers
- **Focus Management**: Better focus handling on error/success
- **Keyboard Shortcuts**: Add keyboard shortcuts for common actions
- **High Contrast Mode**: Ensure visibility in high contrast mode
- **Error Summary**: Add error summary at top of form listing all errors

### 8. Testing & Documentation

- **Unit Tests**: Add comprehensive tests for each component
- **Visual Regression Tests**: Ensure UI consistency across changes
- **Storybook Stories**: Create interactive documentation
- **Usage Examples**: More real-world examples for each component
- **Migration Guide**: Document changes for component API updates

## Code Organization

### Extract Shared Logic

- Create `useFormField` hook for shared field logic
- Create `useFormValidation` hook for validation patterns
- Extract error message formatting to utility functions
- Share styling via CSS classes or styled system

### Create Specialized Components

- `FormPhoneInput` - Phone number with country code selector
- `FormDatePicker` - Date picker with calendar UI
- `FormTimePicker` - Time picker with AM/PM support
- `FormColorPicker` - Color picker with hex/rgb/hsl support
- `FormFileUpload` - File upload with drag-and-drop
- `FormRichText` - Rich text editor integration
- `FormAutocomplete` - Autocomplete with API integration
- `FormMultiSelect` - Multi-select dropdown with search
- `FormRating` - Star rating input
- `FormSlider` - Range slider input

### Type Safety

- Create strict TypeScript types for form values
- Use discriminated unions for variant props
- Add generic types for flexible data handling
- Type-safe validation error messages

## Performance Optimizations

### Rendering

- Memoize components with React.memo
- Use useCallback for event handlers
- Debounce validation and onChange handlers
- Lazy load rich text editor and other heavy components
- Virtualize long lists in FormListInput

### Bundle Size

- Split heavy dependencies (e.g., date pickers) into separate chunks
- Tree-shake unused form components
- Replace heavy libraries with lighter alternatives

## Design System Integration

### Token System

- Replace hardcoded colors with design tokens
- Use spacing tokens for consistent padding/margins
- Typography tokens for font sizes and weights
- Animation tokens for consistent transitions

### Component Variants

- Create design system variants (primary, secondary, tertiary)
- Support different themes (not just dark mode)
- Brand-specific styling overrides

## Developer Experience

### Better Error Messages

- Provide helpful error messages when props are misused
- Add development-only warnings for common mistakes
- Better TypeScript intellisense hints

### Code Generation

- CLI tool to generate form components from schemas
- Generate validation schemas from TypeScript types
- Auto-generate form layouts from backend models

### Documentation

- Add JSDoc comments to all exports
- Create interactive playground for testing components
- Add performance benchmarks
- Document common patterns and recipes

## Mobile Experience

### Touch Optimization

- Increase touch target sizes on mobile (already using 48px minimum)
- Add touch-friendly date/time pickers
- Improve mobile keyboard handling
- Add haptic feedback on interactions

### Native Inputs

- Use native date/time inputs on mobile for better UX
- Native file picker integration
- Native select on mobile devices

## Integration Improvements

### Backend Integration

- Auto-generate forms from OpenAPI/GraphQL schemas
- Better error mapping from API responses
- Support for optimistic updates
- Conflict resolution for concurrent edits

### Third-party Integrations

- Stripe Elements integration for payment forms
- Google Places API integration for address inputs
- reCAPTCHA integration
- Analytics event tracking for form interactions

## Security Enhancements

### Input Sanitization

- XSS prevention in all text inputs
- SQL injection prevention (even though client-side)
- Prevent clipboard injection attacks
- Sanitize pasted content

### Privacy

- Password manager integration
- Support for password visibility toggle (already implemented in some)
- Autocomplete attributes for security-sensitive fields
- Clear sensitive data on unmount
