# Form Components - Future Refactoring Notes

## Completed Improvements ✅

### WizardForm Auto-Save Enhancement (January 11, 2026)

- ✅ **useLocalStorage Hook**: Created reusable localStorage sync hook
- ✅ **Auto-Save to localStorage**: Automatic form data persistence
- ✅ **Debounced Saving**: Configurable delay (default 1 second)
- ✅ **Automatic Restoration**: Data restored on page reload
- ✅ **Current Step Tracking**: Remembers which step user was on
- ✅ **Restore Notification**: Banner showing restore timestamp
- ✅ **Start Fresh Option**: Button to discard auto-saved data
- ✅ **Clear on Submit**: Auto-save cleared after successful submission
- ✅ **Save Callbacks**: onAutoSave and onRestore event hooks
- ✅ **SSR Safe**: useLocalStorage handles server-side rendering
- ✅ **Cross-tab Sync**: Optional synchronization across browser tabs
- ✅ **TypeScript Generics**: Full type safety for form data
- ✅ **Demo Page**: Created `/demo/wizard-form-autosave` with activity log
- ✅ **Task 10.6 Complete**: 60 minutes

**Usage:**

```tsx
<WizardForm<FormData>
  steps={steps}
  onSubmit={handleSubmit}
  enableAutoSave={true}
  autoSaveKey="my-form"
  autoSaveDelay={1000}
  onAutoSave={(data, step) => console.log("Saved")}
/>
```

### FormRichText Component (January 11, 2026)

- ✅ **React Quill Integration**: Built on industry-standard Quill.js editor
- ✅ **Toolbar Presets**: Minimal (basic), Standard (balanced), Full (complete)
- ✅ **Rich Formatting**: Headers (H1-H6), bold, italic, underline, strike, colors, background
- ✅ **Lists & Indentation**: Ordered and unordered lists with nesting support
- ✅ **Links & Media**: Insert and edit links, images, and videos
- ✅ **Code Blocks**: Syntax-highlighted code blocks with dark theme
- ✅ **Blockquotes**: Beautiful blockquote styling with left border
- ✅ **Custom Heights**: Configurable min and max height for editor
- ✅ **Character Count**: Shows character count excluding HTML tags
- ✅ **Read-only Mode**: Display formatted content without editing
- ✅ **SSR Compatible**: Dynamic import to avoid server-side rendering issues
- ✅ **Loading Skeleton**: Shows placeholder while editor initializes
- ✅ **Custom Styling**: Tailwind-based styling with custom Quill theme
- ✅ **Scrollbar Styling**: Custom scrollbar for better UX
- ✅ **State Variants**: Compact size, disabled, read-only, no toolbar
- ✅ **Accessible**: Keyboard navigation and focus management
- ✅ **Demo Page**: Created `/demo/form-rich-text` with 6 examples
- ✅ **Task 10.5 Complete**: 90 minutes

**Usage:**

```tsx
<FormRichText
  label="Blog Post"
  value={content}
  onChange={setContent}
  modules="full"
  minHeight="300px"
  required
/>
```

### FormFileUpload Component (January 11, 2026)

- ✅ **Drag and Drop**: Full drag-and-drop support with visual feedback
- ✅ **Image Preview**: Automatic preview for image files using object URLs
- ✅ **Progress Tracking**: Real-time upload progress display
- ✅ **File Validation**: Size and type validation before upload
- ✅ **Auto Upload Mode**: Automatic upload on file selection (default)
- ✅ **Manual Upload Mode**: Option to review file before uploading
- ✅ **Clear Function**: Easy file removal with clear button
- ✅ **Visual Feedback**: Blue border when dragging, progress overlay on preview
- ✅ **Error Handling**: Comprehensive error messages for validation failures
- ✅ **Reuses useMediaUpload**: Built on existing upload infrastructure
- ✅ **File Size Display**: Human-readable format (KB, MB)
- ✅ **File Type Hints**: Shows accepted types based on accept attribute
- ✅ **State Variants**: Compact size, disabled state, custom preview height
- ✅ **Accessible**: Keyboard navigation, screen reader support
- ✅ **Demo Page**: Created `/demo/form-file-upload` with 6 examples
- ✅ **Task 10.4 Complete**: 60 minutes

**Usage:**

```tsx
<FormFileUpload
  label="Product Image"
  value={imageUrl}
  onChange={setImageUrl}
  accept="image/*"
  maxSize={5 * 1024 * 1024}
  required
  helperText="Upload product image (max 5MB)"
/>
```

### FormDatePicker Component (January 11, 2026)

- ✅ **Lightweight Implementation**: No external dependencies (no date-fns, dayjs, or react-datepicker)
- ✅ **Custom Calendar UI**: Month/year navigation with arrow buttons
- ✅ **Calendar Grid**: 7-column grid with day headers (Sun-Sat)
- ✅ **Date Validation**: Min/max date checking with disabled state rendering
- ✅ **Display Formats**: YYYY-MM-DD (ISO), DD/MM/YYYY (European), MM/DD/YYYY (US)
- ✅ **Visual Indicators**: Selected (blue bg), today (blue border), disabled (gray text)
- ✅ **Quick Actions**: "Today" button (sets current date), "Clear" button (clears selection)
- ✅ **Format Preview**: Shows formatted date below input field
- ✅ **Date Range Hint**: Displays allowed date range when min/max dates set
- ✅ **Helper Functions**: getDaysInMonth, getFirstDayOfMonth, formatDate, parseDate
- ✅ **State Variants**: Compact size, disabled state, without icon option
- ✅ **Accessibility**: Full keyboard navigation, proper ARIA attributes
- ✅ **Native Date API**: Uses JavaScript Date for all calculations (lightweight)
- ✅ **Demo Page**: Created `/demo/form-date-picker` with 6 examples
- ✅ **Task 10.3 Complete**: 60 minutes

**Usage:**

```tsx
<FormDatePicker
  label="Booking Date"
  value={date}
  onChange={setDate}
  minDate={new Date()}
  displayFormat="DD/MM/YYYY"
  required
  helperText="Select your preferred date"
/>
```

### FormCurrencyInput Component (January 11, 2026)

- ✅ **Currency Symbol Display**: Shows ₹ for INR, $ for USD, € for EUR, £ for GBP
- ✅ **Auto-formatting**: Formats with Indian number system for INR (1,23,456.78)
- ✅ **Currency Selector**: Optional dropdown to switch between 4 currencies
- ✅ **Format Preview**: Shows formatted value below input when not focused
- ✅ **Min/Max Validation**: Automatic clamping to valid range
- ✅ **Negative Values**: Optional support for negative amounts
- ✅ **Clean Input**: Removes formatting on focus for easy editing
- ✅ **Reuses Utilities**: Uses `formatPrice` from @/lib/price.utils
- ✅ **Validation Support**: Error messages and required field indicators
- ✅ **State Variants**: Compact size, disabled state
- ✅ **Demo Page**: Created `/demo/form-currency-input` with examples
- ✅ **Task 10.2 Complete**: 30 minutes

**Usage:**

```tsx
<FormCurrencyInput
  label="Product Price"
  value={price}
  currency={currency}
  onChange={(value, curr) => {
    setPrice(value);
    setCurrency(curr);
  }}
  showCurrencySelector
  min={10}
  max={1000000}
/>
```

### FormPhoneInput Component (January 11, 2026)

- ✅ **Country Code Selector**: Dropdown with 8 common countries (India, US, UK, Australia, UAE, Singapore, Malaysia, China)
- ✅ **Flag Emojis**: Visual country identification in dropdown
- ✅ **Auto-formatting**: Indian numbers formatted as XXXXX XXXXX on blur
- ✅ **Sanitization**: Removes invalid characters using `sanitizePhone` from @/lib/sanitize
- ✅ **Format Preview**: Shows formatted number below input field
- ✅ **Reuses Utilities**: Uses `formatPhoneNumber` from @/lib/formatters
- ✅ **Validation Support**: Error messages and required field indicators
- ✅ **Flexible API**: Separate callbacks for phone and country code changes
- ✅ **State Variants**: Compact size, disabled state, without country selector
- ✅ **Demo Page**: Created `/demo/form-phone-input` with examples
- ✅ **Task 10.1 Complete**: 45 minutes

**Usage:**

```tsx
<FormPhoneInput
  label="Phone Number"
  value={phone}
  countryCode={countryCode}
  onChange={(phone, code) => {
    setPhone(phone);
    setCountryCode(code);
  }}
  required
/>
```

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

- ✅ `FormPhoneInput` - Phone number with country code selector (Task 10.1 Complete)
- ✅ `FormCurrencyInput` - Currency input with symbol and formatter (Task 10.2 Complete)
- ✅ `FormDatePicker` - Date picker with calendar UI (Task 10.3 Complete)
- ✅ `FormFileUpload` - File upload with drag-and-drop (Task 10.4 Complete)
- ✅ `FormRichText` - Rich text editor integration (Task 10.5 Complete)
- `FormTimePicker` - Time picker with AM/PM support
- `FormColorPicker` - Color picker with hex/rgb/hsl support
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
