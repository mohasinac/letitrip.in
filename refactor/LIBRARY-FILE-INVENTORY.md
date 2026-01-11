# React Library - File Inventory & Dependency Analysis

**Project:** @letitrip/react-library
**Created:** January 12, 2026
**Status:** Planning Phase

## Summary

- **Total Files to Migrate**: 65+ files
- **Utilities**: 12 files
- **Components**: 33 files
- **Hooks**: 10 files
- **Styles**: 5 files
- **Types**: 5 files
- **Estimated Lines of Code**: ~8,000 LOC

---

## Utilities (12 files)

### Core Formatters

#### 1. src/lib/formatters.ts

**Lines:** ~400
**Dependencies:** date-fns, External APIs
**Exports:** 20+ functions

**Key Functions:**

- `formatDate(date, format)` - Format dates with various formats
- `formatRelativeTime(date)` - "2 hours ago" style
- `formatDateRange(start, end)` - Date range formatting
- `formatPrice(amount, currency)` - Currency formatting with symbols
- `formatCompactCurrency(amount)` - 1K, 1M notation
- `formatDiscount(original, discounted)` - Discount percentage
- `formatPhoneNumber(phone, countryCode)` - Phone formatting
- `formatPincode(pincode, state)` - Indian pincode formatting
- `formatNumber(num)` - Number with commas
- `formatCompactNumber(num)` - 1K, 1M notation
- `formatPercentage(value)` - Percentage formatting
- `formatFileSize(bytes)` - File size (KB, MB, GB)
- `formatRating(rating)` - Star rating display
- `formatSKU(sku)` - Product SKU formatting
- `truncateText(text, length)` - Text truncation with ellipsis
- `slugToTitle(slug)` - Convert slug to title case

**Dependencies:**

- date-fns: format, formatDistanceToNow, parseISO
- No internal dependencies

**Migration Notes:**

- Pure utility functions
- No React dependencies
- Can be migrated as-is

---

#### 2. src/lib/date-utils.ts

**Lines:** ~150
**Dependencies:** date-fns
**Exports:** 10+ functions

**Key Functions:**

- `safeToISOString(date)` - Safe date to ISO conversion
- `isValidDate(date)` - Date validation
- `toDateInputValue(date)` - Convert to input format (YYYY-MM-DD)
- `getTodayDateInputValue()` - Today's date for input
- `safeToDate(value)` - Safe string/Date conversion
- `addDays(date, days)` - Add days to date
- `subtractDays(date, days)` - Subtract days
- `isFutureDate(date)` - Check if future
- `isPastDate(date)` - Check if past
- `getDaysDifference(date1, date2)` - Calculate difference

**Dependencies:**

- date-fns: parseISO, isValid, format, addDays, subDays
- No internal dependencies

**Migration Notes:**

- Pure utility functions
- No React dependencies
- Can be migrated as-is

---

#### 3. src/lib/utils.ts

**Lines:** ~100
**Dependencies:** clsx, tailwind-merge
**Exports:** 5+ functions

**Key Functions:**

- `cn(...inputs)` - Tailwind class merging (most important!)
- `slugify(text)` - Convert text to URL-friendly slug
- `capitalize(text)` - Capitalize first letter
- `truncate(text, length)` - Text truncation
- `debounce(func, delay)` - Debounce utility

**Dependencies:**

- clsx: ^2.1.0
- tailwind-merge: ^2.2.0
- No internal dependencies

**Migration Notes:**

- Essential for Tailwind usage
- cn() used everywhere in components
- Must be migrated first

---

#### 4. src/lib/validators.ts

**Lines:** ~200
**Dependencies:** libphonenumber-js
**Exports:** 15+ validation functions

**Key Functions:**

- `isValidEmail(email)` - Email validation
- `isValidPhone(phone, countryCode)` - Phone validation
- `isValidPincode(pincode, state)` - Indian pincode validation
- `isValidURL(url)` - URL validation
- `isValidUsername(username)` - Username validation
- `isValidPassword(password)` - Password strength validation
- `isValidGST(gst)` - GST number validation
- `isValidPAN(pan)` - PAN card validation
- `isValidAadhar(aadhar)` - Aadhar number validation
- `isValidIFSC(ifsc)` - IFSC code validation
- `isValidUPI(upi)` - UPI ID validation

**Dependencies:**

- libphonenumber-js: ^1.10.0
- ./validation/email, ./validation/phone (internal)

**Migration Notes:**

- Has internal dependencies (validation/\* folder)
- Must migrate validation folder first

---

#### 5. src/lib/validation/email.ts

**Lines:** ~50
**Dependencies:** None
**Exports:** Email validation functions

**Functions:**

- `validateEmail(email)` - Regex-based email validation
- `isDisposableEmail(email)` - Check disposable email providers
- `getDomainFromEmail(email)` - Extract domain

**Migration Notes:**

- No dependencies
- Can be migrated independently

---

#### 6. src/lib/validation/phone.ts

**Lines:** ~80
**Dependencies:** libphonenumber-js
**Exports:** Phone validation functions

**Functions:**

- `validatePhone(phone, country)` - Phone validation with country
- `formatPhoneForDisplay(phone)` - Format for display
- `parsePhoneNumber(phone)` - Parse phone components

**Migration Notes:**

- Depends on libphonenumber-js
- Used by validators.ts

---

#### 7. src/lib/validation/pincode.ts

**Lines:** ~60
**Dependencies:** None
**Exports:** Pincode validation functions

**Functions:**

- `validatePincode(pincode, state)` - Indian pincode validation
- `getPincodeState(pincode)` - Get state from pincode
- `isValidPincodeFormat(pincode)` - Format validation

**Migration Notes:**

- India-specific validation
- No external dependencies

---

#### 8. src/lib/sanitize.ts

**Lines:** ~100
**Dependencies:** None
**Exports:** Input sanitization functions

**Functions:**

- `sanitizeHTML(html)` - Remove dangerous HTML
- `sanitizeInput(input)` - Sanitize user input
- `escapeRegExp(string)` - Escape regex special chars
- `stripTags(html)` - Remove all HTML tags
- `sanitizeFileName(filename)` - Safe filename

**Migration Notes:**

- Security-critical functions
- No dependencies
- Pure functions

---

#### 9. src/lib/accessibility.ts

**Lines:** ~80
**Dependencies:** None
**Exports:** Accessibility helper functions

**Functions:**

- `generateAriaLabel(label, required)` - Generate ARIA labels
- `getAriaProps(props)` - Extract ARIA props from component props
- `announceToScreenReader(message)` - Screen reader announcements
- `trapFocus(element)` - Focus trap for modals
- `getNextFocusableElement(element)` - Find next focusable
- `isElementVisible(element)` - Check element visibility

**Migration Notes:**

- Used by form components
- No external dependencies
- Browser API usage (DOM)

---

#### 10. src/lib/price.utils.ts

**Lines:** ~120
**Dependencies:** None
**Exports:** Price calculation and formatting

**Functions:**

- `formatPrice(amount, currency, locale)` - Format with Intl.NumberFormat
- `calculateDiscount(original, discount)` - Calculate discount
- `calculateDiscountPercentage(original, final)` - Calculate %
- `addTax(amount, taxRate)` - Add tax to price
- `removeTax(amount, taxRate)` - Remove tax from price
- `convertCurrency(amount, from, to, rates)` - Currency conversion

**Migration Notes:**

- Some overlap with formatters.ts
- Consider consolidating formatPrice functions
- No external dependencies

---

#### 11. src/lib/form-validation.ts

**Lines:** ~150
**Dependencies:** ./validators
**Exports:** Form validation utilities

**Functions:**

- `validateFormField(field, value, rules)` - Validate single field
- `validateForm(values, rules)` - Validate entire form
- `getFieldError(field, value)` - Get error message
- `isFormValid(errors)` - Check if form has errors

**Migration Notes:**

- Depends on validators.ts
- Used by form components
- May need to update for library context

---

#### 12. src/lib/link-utils.ts (Optional - Check if reusable)

**Lines:** ~40
**Dependencies:** Next.js (may not be reusable)
**Exports:** Link utilities

**Functions:**

- `buildProductUrl(slug)` - Build product URL
- `buildCategoryUrl(slug)` - Build category URL

**Migration Notes:**

- May be too application-specific
- Consider excluding from library
- Uses Next.js routing (not reusable)

---

## Components (33 files)

### Form Components (21 files)

#### 1. src/components/forms/FormField.tsx

**Lines:** ~80
**Dependencies:** React
**Props:** children, label, error, required, helperText

**Description:**
Wrapper component for form fields with label, error display, and helper text.

**Internal Dependencies:**

- FormLabel
- None from lib/

**External Dependencies:**

- react: ^18.0.0

**Migration Priority:** HIGH (used by all form components)

---

#### 2. src/components/forms/FormLabel.tsx

**Lines:** ~40
**Dependencies:** React
**Props:** children, required, htmlFor

**Description:**
Form label with required indicator.

**Internal Dependencies:**

- None

**External Dependencies:**

- react: ^18.0.0

**Migration Priority:** HIGH

---

#### 3. src/components/forms/FormInput.tsx

**Lines:** ~120
**Dependencies:** React, @/lib/utils (cn), @/lib/accessibility
**Props:** label, type, error, required, disabled, placeholder, value, onChange

**Description:**
Standard text input with label, error display, and accessibility.

**Internal Dependencies:**

- FormField
- FormLabel
- cn (from utils)
- getAriaProps (from accessibility)

**External Dependencies:**

- react: ^18.0.0

**Migration Priority:** HIGH
**Migration Notes:**

- Update imports for cn and accessibility utilities
- Ensure FormField and FormLabel migrated first

---

#### 4. src/components/forms/FormTextarea.tsx

**Lines:** ~100
**Dependencies:** React, @/lib/utils
**Props:** label, error, required, rows, maxLength, value, onChange

**Description:**
Textarea with character counter and auto-resize.

**Internal Dependencies:**

- FormField
- FormLabel
- cn

**External Dependencies:**

- react: ^18.0.0

**Migration Priority:** HIGH

---

#### 5. src/components/forms/FormSelect.tsx

**Lines:** ~110
**Dependencies:** React, @/lib/utils
**Props:** label, options, error, required, placeholder, value, onChange

**Description:**
Select dropdown with custom styling.

**Internal Dependencies:**

- FormField
- FormLabel
- cn

**External Dependencies:**

- react: ^18.0.0

**Migration Priority:** HIGH

---

#### 6. src/components/forms/FormCheckbox.tsx

**Lines:** ~80
**Dependencies:** React, @/lib/utils
**Props:** label, checked, onChange, disabled

**Description:**
Checkbox with label.

**Internal Dependencies:**

- cn

**External Dependencies:**

- react: ^18.0.0

**Migration Priority:** MEDIUM

---

#### 7. src/components/forms/FormRadio.tsx

**Lines:** ~90
**Dependencies:** React, @/lib/utils
**Props:** name, options, value, onChange, label

**Description:**
Radio button group.

**Internal Dependencies:**

- FormField
- cn

**External Dependencies:**

- react: ^18.0.0

**Migration Priority:** MEDIUM

---

#### 8. src/components/forms/FormSwitch.tsx

**Lines:** ~70
**Dependencies:** React, @/lib/utils
**Props:** checked, onChange, label, disabled

**Description:**
Toggle switch.

**Internal Dependencies:**

- cn

**External Dependencies:**

- react: ^18.0.0

**Migration Priority:** MEDIUM

---

#### 9. src/components/forms/FormPhoneInput.tsx ⭐

**Lines:** ~200
**Dependencies:** React, libphonenumber-js, @/lib/validators, @/lib/formatters
**Props:** label, value, onChange, countryCode, error, required

**Description:**
Phone input with country code selector and validation.
Supports 8 countries: IN, US, UK, CA, AU, SG, AE, NZ

**Internal Dependencies:**

- FormField
- FormLabel
- FormSelect (for country dropdown)
- cn
- isValidPhone (validators)
- formatPhoneNumber (formatters)

**External Dependencies:**

- react: ^18.0.0
- libphonenumber-js: ^1.10.0

**Migration Priority:** HIGH (already refined and tested)

---

#### 10. src/components/forms/FormCurrencyInput.tsx ⭐

**Lines:** ~180
**Dependencies:** React, @/lib/price.utils, @/lib/formatters
**Props:** label, value, onChange, currency, error, required

**Description:**
Currency input with formatting and validation.
Supports 4 currencies: INR, USD, EUR, GBP

**Internal Dependencies:**

- FormField
- FormLabel
- FormSelect (for currency dropdown)
- cn
- formatPrice (price.utils)

**External Dependencies:**

- react: ^18.0.0

**Migration Priority:** HIGH (already refined and tested)

---

#### 11. src/components/forms/FormDatePicker.tsx

**Lines:** ~150
**Dependencies:** React, date-fns, @/lib/date-utils
**Props:** label, value, onChange, minDate, maxDate, error, required

**Description:**
Date picker with calendar popup.

**Internal Dependencies:**

- FormField
- FormLabel
- DateTimePicker (common component)
- cn
- date utilities

**External Dependencies:**

- react: ^18.0.0
- date-fns: ^3.0.0

**Migration Priority:** HIGH

---

#### 12. src/components/forms/FormTimePicker.tsx

**Lines:** ~100
**Dependencies:** React, @/lib/date-utils
**Props:** label, value, onChange, error, required

**Description:**
Time picker (HH:MM format).

**Internal Dependencies:**

- FormField
- FormLabel
- cn

**External Dependencies:**

- react: ^18.0.0

**Migration Priority:** MEDIUM

---

#### 13. src/components/forms/FormFileUpload.tsx

**Lines:** ~180
**Dependencies:** React, @/lib/formatters
**Props:** label, onChange, accept, maxSize, multiple, error

**Description:**
File upload with drag-and-drop, preview, and validation.

**Internal Dependencies:**

- FormField
- FormLabel
- cn
- formatFileSize

**External Dependencies:**

- react: ^18.0.0

**Migration Priority:** MEDIUM

---

#### 14. src/components/forms/FormRichText.tsx

**Lines:** ~150
**Dependencies:** React, (rich text editor library)
**Props:** label, value, onChange, error, toolbar

**Description:**
Rich text editor for formatted content.

**Internal Dependencies:**

- FormField
- FormLabel
- cn

**External Dependencies:**

- react: ^18.0.0
- (Check if using external editor library)

**Migration Priority:** LOW (may have external editor dependency)

---

#### 15. src/components/forms/FormSlider.tsx

**Lines:** ~100
**Dependencies:** React, @/lib/utils
**Props:** label, min, max, step, value, onChange

**Description:**
Range slider input.

**Internal Dependencies:**

- FormField
- cn

**External Dependencies:**

- react: ^18.0.0

**Migration Priority:** MEDIUM

---

#### 16. src/components/forms/FormColorPicker.tsx

**Lines:** ~120
**Dependencies:** React, @/lib/utils
**Props:** label, value, onChange, error

**Description:**
Color picker input.

**Internal Dependencies:**

- FormField
- FormLabel
- cn

**External Dependencies:**

- react: ^18.0.0
- (May use external color picker library)

**Migration Priority:** LOW

---

#### 17. src/components/forms/FormTagInput.tsx

**Lines:** ~130
**Dependencies:** React, @/lib/utils
**Props:** label, tags, onTagsChange, error

**Description:**
Tag input for multiple values.

**Internal Dependencies:**

- FormField
- FormLabel
- cn

**External Dependencies:**

- react: ^18.0.0

**Migration Priority:** MEDIUM

---

#### 18. src/components/forms/FormPasswordInput.tsx

**Lines:** ~100
**Dependencies:** React, @/lib/validators, @/lib/utils
**Props:** label, value, onChange, showStrength, error

**Description:**
Password input with visibility toggle and strength indicator.

**Internal Dependencies:**

- FormInput
- cn
- isValidPassword

**External Dependencies:**

- react: ^18.0.0

**Migration Priority:** HIGH

---

#### 19. src/components/forms/FormOTPInput.tsx

**Lines:** ~110
**Dependencies:** React, @/lib/utils
**Props:** length, value, onChange, error

**Description:**
OTP input with automatic focus management.

**Internal Dependencies:**

- FormField
- cn

**External Dependencies:**

- react: ^18.0.0

**Migration Priority:** MEDIUM

---

#### 20. src/components/forms/FormRating.tsx

**Lines:** ~90
**Dependencies:** React, @/lib/utils
**Props:** label, value, onChange, max, error

**Description:**
Star rating input.

**Internal Dependencies:**

- FormField
- cn

**External Dependencies:**

- react: ^18.0.0

**Migration Priority:** LOW

---

#### 21. src/components/forms/FormActions.tsx

**Lines:** ~60
**Dependencies:** React, @/lib/utils
**Props:** children, align

**Description:**
Form action buttons container.

**Internal Dependencies:**

- cn

**External Dependencies:**

- react: ^18.0.0

**Migration Priority:** MEDIUM

---

### UI Components (5 files)

#### 22. src/components/ui/Button.tsx

**Lines:** ~150
**Dependencies:** React, @/lib/utils
**Props:** variant, size, disabled, loading, children, onClick

**Variants:** primary, secondary, outline, ghost, danger

**Description:**
Button component with variants, sizes, and loading state.

**Internal Dependencies:**

- cn

**External Dependencies:**

- react: ^18.0.0

**Migration Priority:** HIGH

---

#### 23. src/components/ui/Card.tsx

**Lines:** ~80
**Dependencies:** React, @/lib/utils
**Props:** children, variant, padding

**Description:**
Card container component.

**Internal Dependencies:**

- cn

**External Dependencies:**

- react: ^18.0.0

**Migration Priority:** HIGH

---

#### 24. src/components/ui/Modal.tsx

**Lines:** ~130
**Dependencies:** React, @/lib/accessibility
**Props:** isOpen, onClose, title, children

**Description:**
Modal dialog with focus trap and accessibility.

**Internal Dependencies:**

- cn
- trapFocus (accessibility)

**External Dependencies:**

- react: ^18.0.0

**Migration Priority:** HIGH

---

#### 25. src/components/common/Tooltip.tsx

**Lines:** ~90
**Dependencies:** React, @/lib/utils
**Props:** content, children, position

**Description:**
Tooltip component.

**Internal Dependencies:**

- cn

**External Dependencies:**

- react: ^18.0.0

**Migration Priority:** MEDIUM

---

#### 26. src/components/common/Badge.tsx

**Lines:** ~60
**Dependencies:** React, @/lib/utils
**Props:** children, variant, size

**Description:**
Badge component for status indicators.

**Internal Dependencies:**

- cn

**External Dependencies:**

- react: ^18.0.0

**Migration Priority:** MEDIUM

---

### Value Display Components (4 files)

#### 27. src/components/common/values/DateDisplay.tsx ⭐

**Lines:** ~100
**Dependencies:** React, @/lib/formatters, @/lib/date-utils
**Props:** date, format, relative

**Sub-components:**

- DateDisplay - Format dates
- RelativeDate - "2 hours ago"
- DateRange - Date range display

**Description:**
Display formatted dates with various formats.

**Internal Dependencies:**

- formatDate, formatRelativeTime, formatDateRange
- date utilities

**External Dependencies:**

- react: ^18.0.0
- date-fns: ^3.0.0

**Migration Priority:** HIGH (well-tested)

---

#### 28. src/components/common/values/Price.tsx

**Lines:** ~70
**Dependencies:** React, @/lib/price.utils
**Props:** amount, currency, showDiscount, originalPrice

**Description:**
Display formatted prices with optional discount.

**Internal Dependencies:**

- formatPrice
- calculateDiscountPercentage

**External Dependencies:**

- react: ^18.0.0

**Migration Priority:** HIGH

---

#### 29. src/components/common/values/Status.tsx

**Lines:** ~60
**Dependencies:** React, @/lib/utils, Badge
**Props:** status, variant

**Description:**
Display status with colored badge.

**Internal Dependencies:**

- Badge
- cn

**External Dependencies:**

- react: ^18.0.0

**Migration Priority:** LOW (may be too app-specific)

---

### Picker Components (3 files)

#### 30. src/components/common/DateTimePicker.tsx

**Lines:** ~250
**Dependencies:** React, date-fns, @/lib/date-utils
**Props:** value, onChange, showTime, minDate, maxDate

**Description:**
Full-featured date/time picker with calendar.

**Internal Dependencies:**

- date utilities
- cn

**External Dependencies:**

- react: ^18.0.0
- date-fns: ^3.0.0

**Migration Priority:** HIGH (used by FormDatePicker)

---

#### 31. src/components/common/StateSelector.tsx

**Lines:** ~100
**Dependencies:** React, FormSelect
**Props:** value, onChange, country

**Description:**
Indian state selector dropdown.

**Internal Dependencies:**

- FormSelect
- cn

**External Dependencies:**

- react: ^18.0.0

**Migration Priority:** MEDIUM

---

#### 32. src/components/common/PincodeInput.tsx

**Lines:** ~90
**Dependencies:** React, @/lib/validators, FormInput
**Props:** value, onChange, error, state

**Description:**
Indian pincode input with validation.

**Internal Dependencies:**

- FormInput
- isValidPincode

**External Dependencies:**

- react: ^18.0.0

**Migration Priority:** MEDIUM

---

#### 33. src/components/error-boundary.tsx

**Lines:** ~80
**Dependencies:** React
**Props:** children, fallback

**Description:**
Error boundary component.

**Internal Dependencies:**

- None

**External Dependencies:**

- react: ^18.0.0

**Migration Priority:** LOW (may be app-specific)

---

## Hooks (10 files)

#### 1. src/hooks/useMediaQuery.ts

**Lines:** ~50
**Dependencies:** React

**Description:**
Hook for responsive design based on media queries.

**Usage:**

```tsx
const isMobile = useMediaQuery("(max-width: 768px)");
```

**Migration Priority:** HIGH

---

#### 2. src/hooks/useDebounce.ts

**Lines:** ~30
**Dependencies:** React

**Description:**
Debounce hook for delayed value updates.

**Usage:**

```tsx
const debouncedSearch = useDebounce(searchTerm, 500);
```

**Migration Priority:** HIGH

---

#### 3. src/hooks/useLocalStorage.ts

**Lines:** ~60
**Dependencies:** React

**Description:**
Hook for localStorage with React state sync.

**Usage:**

```tsx
const [value, setValue] = useLocalStorage("key", defaultValue);
```

**Migration Priority:** HIGH

---

#### 4. src/hooks/useClipboard.ts

**Lines:** ~40
**Dependencies:** React

**Description:**
Hook for clipboard operations.

**Usage:**

```tsx
const { copy, copied } = useClipboard();
```

**Migration Priority:** MEDIUM

---

#### 5. src/hooks/usePrevious.ts

**Lines:** ~20
**Dependencies:** React

**Description:**
Hook to get previous value of a variable.

**Usage:**

```tsx
const previousValue = usePrevious(value);
```

**Migration Priority:** MEDIUM

---

#### 6. src/hooks/useToggle.ts

**Lines:** ~25
**Dependencies:** React

**Description:**
Hook for boolean toggle state.

**Usage:**

```tsx
const [isOpen, toggle] = useToggle(false);
```

**Migration Priority:** MEDIUM

---

#### 7. src/hooks/useInterval.ts

**Lines:** ~35
**Dependencies:** React

**Description:**
Hook for setInterval with auto cleanup.

**Usage:**

```tsx
useInterval(() => {
  /* code */
}, 1000);
```

**Migration Priority:** LOW

---

#### 8. src/hooks/useOnClickOutside.ts

**Lines:** ~40
**Dependencies:** React

**Description:**
Hook to detect clicks outside an element.

**Usage:**

```tsx
useOnClickOutside(ref, () => setIsOpen(false));
```

**Migration Priority:** MEDIUM

---

#### 9. src/hooks/useKeyPress.ts

**Lines:** ~35
**Dependencies:** React

**Description:**
Hook to detect specific key presses.

**Usage:**

```tsx
const escapePressed = useKeyPress("Escape");
```

**Migration Priority:** LOW

---

#### 10. src/hooks/useWindowSize.ts

**Lines:** ~45
**Dependencies:** React

**Description:**
Hook to track window size.

**Usage:**

```tsx
const { width, height } = useWindowSize();
```

**Migration Priority:** MEDIUM

---

## Styles (5 files)

#### 1. Tailwind Configuration (Reusable Parts)

**File:** tailwind.config.js (extract reusable theme)
**Lines:** ~50 (reusable parts)

**Extract:**

- Color palette
- Spacing scale
- Typography scale
- Border radius
- Shadows

**Migration Notes:**

- Create react-library/tailwind.config.ts
- Export theme tokens separately
- Main app can extend library config

---

#### 2. src/lib/theme/colors.ts

**Lines:** ~40
**Dependencies:** None

**Description:**
Color theme constants.

**Migration Priority:** MEDIUM

---

#### 3. src/lib/theme/typography.ts

**Lines:** ~30
**Dependencies:** None

**Description:**
Typography constants and utilities.

**Migration Priority:** MEDIUM

---

#### 4. CSS Variables (Extract from globals.css)

**Lines:** ~30 (reusable parts)

**Description:**
CSS custom properties for theming.

**Migration Priority:** MEDIUM

---

#### 5. Design Tokens

**Lines:** ~50
**Dependencies:** None

**Description:**
Design system tokens (spacing, colors, etc.).

**Migration Priority:** MEDIUM

---

## Types (5 files)

#### 1. src/types/common.ts

**Lines:** ~100
**Dependencies:** None

**Types:**

- CommonProps
- ValueOf
- Optional
- RequireAtLeastOne
- And other utility types

**Migration Priority:** HIGH

---

#### 2. Form Component Prop Types

**Lines:** ~150 (all form components)
**Dependencies:** React

**Types:**

- FormFieldProps
- FormInputProps
- FormSelectProps
- FormPhoneInputProps
- FormCurrencyInputProps
- etc.

**Migration Priority:** HIGH

---

#### 3. Utility Function Types

**Lines:** ~50
**Dependencies:** None

**Types:**

- Currency
- DateFormat
- ValidationRule
- etc.

**Migration Priority:** HIGH

---

#### 4. Hook Types

**Lines:** ~30
**Dependencies:** None

**Types:**

- UseMediaQueryOptions
- UseDebounceOptions
- etc.

**Migration Priority:** MEDIUM

---

## Dependencies Summary

### External Dependencies (to add to library package.json)

**Required (peerDependencies):**

- react: ^18.0.0
- react-dom: ^18.0.0

**Direct Dependencies:**

- clsx: ^2.1.0 (for cn function)
- tailwind-merge: ^2.2.0 (for cn function)
- date-fns: ^3.0.0 (for date utilities)
- libphonenumber-js: ^1.10.0 (for phone validation)

**DevDependencies:**

- typescript: ^5.3.0
- vite: ^5.0.0
- @vitejs/plugin-react: ^4.2.0
- vite-plugin-dts: ^3.7.0
- @storybook/react: ^7.6.0
- @storybook/react-vite: ^7.6.0
- vitest: ^1.0.0
- autoprefixer: ^10.4.16
- postcss: ^8.4.32
- tailwindcss: ^3.4.0

### Internal Dependencies (Within Library)

**High Dependency:**

- cn (utils.ts) - Used by ALL components
- FormField, FormLabel - Used by all form components
- date utilities - Used by date/time components
- validators - Used by form inputs with validation

**Migration Order (Based on Dependencies):**

1. utils.ts (cn function)
2. accessibility.ts
3. FormLabel.tsx
4. FormField.tsx
5. date-utils.ts
6. formatters.ts
7. validators.ts (after validation/\* folder)
8. All other utilities
9. Form components (after FormField/FormLabel)
10. UI components
11. Value displays
12. Hooks

---

## Migration Statistics

### By Priority

**HIGH Priority (Must migrate first):**

- 15 utilities
- 12 form components
- 4 UI components
- 2 value displays
- 1 picker
- 4 hooks

**MEDIUM Priority:**

- 3 utilities
- 7 form components
- 2 UI components
- 2 pickers
- 4 hooks

**LOW Priority (Can skip or migrate later):**

- 2 form components
- 1 value display
- 2 hooks

### By File Type

| Type       | Total  | HIGH   | MEDIUM | LOW   |
| ---------- | ------ | ------ | ------ | ----- |
| Utilities  | 12     | 8      | 3      | 1     |
| Components | 33     | 18     | 11     | 4     |
| Hooks      | 10     | 4      | 4      | 2     |
| Styles     | 5      | 1      | 4      | 0     |
| Types      | 5      | 4      | 1      | 0     |
| **Total**  | **65** | **35** | **23** | **7** |

### Estimated Migration Time

| Phase         | Tasks  | Files  | Estimated Time             |
| ------------- | ------ | ------ | -------------------------- |
| Setup         | 1      | -      | 90 min                     |
| Utilities     | 5      | 12     | 450 min                    |
| Components    | 6      | 33     | 720 min                    |
| Hooks         | 1      | 10     | 120 min                    |
| Styles        | 1      | 5      | 120 min                    |
| Documentation | 1      | -      | 150 min                    |
| Testing       | 2      | -      | 270 min                    |
| **Total**     | **18** | **65** | **~1,920 min (~32 hours)** |

---

## Exclusions (Files NOT to Migrate)

### Business Logic (Too App-Specific)

1. **src/lib/link-utils.ts** - Next.js routing specific
2. **src/lib/category-hierarchy.ts** - App domain logic
3. **src/lib/payment-gateway-selector.ts** - Business logic
4. **src/lib/permissions.ts** - App-specific permissions
5. **src/lib/rbac-permissions.ts** - App-specific RBAC
6. **src/lib/rate-limiter.ts** - Server-side logic
7. **src/lib/errors.ts** - App-specific error handling
8. **src/lib/api-errors.ts** - API-specific errors
9. **src/lib/firebase/** - Firebase configuration (app-specific)

### Components (Domain-Specific)

1. **src/components/admin/** - Admin-specific
2. **src/components/auction/** - Auction domain
3. **src/components/product/** - Product domain
4. **src/components/shop/** - Shop domain
5. **src/components/user/** - User domain
6. **src/components/checkout/** - Checkout domain

### Hooks (App-Specific)

1. **src/hooks/useAuth.ts** - Auth context specific
2. **src/hooks/useCart.ts** - Cart context specific
3. **src/hooks/useProducts.ts** - Product domain
4. **src/hooks/useAuction.ts** - Auction domain

---

## Next Steps

1. ✅ Review this inventory
2. ⏳ Create library structure (Task 14.1)
3. ⏳ Start with HIGH priority utilities
4. ⏳ Migrate form components
5. ⏳ Add Storybook stories
6. ⏳ Update imports incrementally
7. ⏳ Test thoroughly

---

**Last Updated:** January 12, 2026
**Status:** Inventory Complete
**Ready for:** Implementation Start
