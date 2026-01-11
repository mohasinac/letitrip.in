# Form Components

This folder contains reusable form components with consistent styling, validation, and accessibility features.

## Components

### FormField.tsx

**Export:** `FormField`

**Purpose:** Wrapper component that provides label, error message, helper text, and consistent styling for form inputs.

**Props:**

- `label?: string` - Field label text
- `required?: boolean` - Show required indicator
- `error?: string` - Error message to display
- `helperText?: string` - Helper text below input
- `children: React.ReactNode` - Input component
- `className?: string` - Additional CSS classes
- `labelClassName?: string` - Label-specific classes
- `sanitize?: boolean` - Enable auto-sanitization on blur (passed to child)
- `sanitizeType?: 'string' | 'email' | 'phone' | 'url' | 'html'` - Type of sanitization (passed to child)

**Features:**

- Consistent label styling with required indicator
- Error message display with red styling
- Helper text for additional guidance
- Dark mode support
- Accessible ARIA attributes
- ✅ **Auto-sanitization support** - Passes sanitization props to child components

---

### FormInput.tsx

**Export:** `FormInput`

**Purpose:** Enhanced text input component with consistent styling and validation states.

**Props:**

- Extends standard HTML input props
- `label?: string` - Input label
- `error?: string` - Error message
- `helperText?: string` - Helper text
- `leftIcon?: React.ReactNode` - Icon on left side
- `rightIcon?: React.ReactNode` - Icon on right side
- `leftAddon?: string` - Text addon on left
- `rightAddon?: string` - Text addon on right
- `fullWidth?: boolean` - Take full width (default: true)
- `showCharCount?: boolean` - Show character count
- `compact?: boolean` - Compact padding
- `sanitize?: boolean` - Enable auto-sanitization on blur
- `sanitizeType?: 'string' | 'email' | 'phone' | 'url'` - Type of sanitization (default: 'string')
- `onSanitize?: (sanitizedValue: string) => void` - Callback when value is sanitized
- Forward ref support for form libraries

**Features:**

- Error state styling (red border)
- Dark mode support
- Consistent padding and sizing
- Focus ring with blue accent
- Disabled state styling
- Mobile-optimized (min-height 48px)
- Icon support (left/right)
- Addon support (left/right)
- Character count display
- ✅ **Auto-sanitization on blur** - Prevents XSS, cleans input based on type

---

### FormTextarea.tsx

**Export:** `FormTextarea`

**Purpose:** Multi-line text input with consistent styling and optional HTML sanitization.

**Props:**

- Extends standard HTML textarea props
- `label?: string` - Textarea label
- `error?: string` - Error message
- `helperText?: string` - Helper text
- `leftIcon?: React.ReactNode` - Icon on left side
- `fullWidth?: boolean` - Take full width (default: true)
- `showCharCount?: boolean` - Show character count
- `compact?: boolean` - Compact padding
- `rows?: number` - Number of rows (default: 4)
- `sanitize?: boolean` - Enable auto-sanitization on blur
- `sanitizeType?: 'string' | 'html'` - Type of sanitization (default: 'string')
- `sanitizeHtmlOptions?: SanitizeHtmlOptions` - Options for HTML sanitization
- `onSanitize?: (sanitizedValue: string) => void` - Callback when value is sanitized
- Forward ref support

**Features:**

- Resizable text area
- Error state styling
- Character count support (when maxLength provided)
- Dark mode support
- ✅ **Auto-sanitization on blur** - Supports both plain text and HTML sanitization
- ✅ **Configurable HTML sanitization** - Control allowed tags and attributes

---

### FormCheckbox.tsx

**Export:** `FormCheckbox`

**Purpose:** Styled checkbox input with label support.

**Props:**

- `id: string` - Input ID (required for label association)
- `label: string` - Checkbox label text
- `checked?: boolean` - Controlled checked state
- `onChange?: (e: ChangeEvent) => void` - Change handler
- `error?: boolean` - Show error state
- Forward ref support

**Features:**

- Custom checkbox styling with yellow accent
- Label click handling
- Indeterminate state support
- Error state
- Dark mode support

---

### FormRadio.tsx

**Exports:** `FormRadio`, `FormRadioGroup`

**Purpose:** Radio button input and group container.

**FormRadio Props:**

- `id: string` - Input ID
- `label: string` - Radio label
- `value: string` - Radio value
- `checked?: boolean` - Controlled state
- `onChange?: (e: ChangeEvent) => void` - Change handler

**FormRadioGroup Props:**

- `name: string` - Radio group name
- `value: string` - Selected value
- `onChange: (value: string) => void` - Value change handler
- `options: Array<{label, value}>` - Radio options
- `error?: boolean` - Show error state

**Features:**

- Grouped radio buttons
- Single selection enforcement
- Yellow accent for selected state
- Vertical or horizontal layout
- Dark mode support

---

### FormSelect.tsx

**Export:** `FormSelect`

**Purpose:** Styled select dropdown with consistent styling.

**Props:**

- Extends standard HTML select props
- `error?: boolean` - Show error state
- `options?: Array<{label, value}>` - Select options
- `placeholder?: string` - Placeholder text
- Forward ref support

**Features:**

- Custom dropdown arrow styling
- Error state styling
- Placeholder support
- Option group support
- Dark mode support

---

### FormPhoneInput.tsx

**Export:** `FormPhoneInput`

**Purpose:** Phone number input with country code selector and auto-formatting.

**Props:**

- `label?: string` - Input label
- `error?: string` - Error message
- `helperText?: string` - Helper text
- `value?: string` - Phone number (without country code)
- `countryCode?: string` - Selected country code (default: "+91")
- `onChange?: (phone: string, countryCode: string) => void` - Change handler
- `onCountryCodeChange?: (countryCode: string) => void` - Country code change handler
- `autoFormat?: boolean` - Enable auto-formatting on blur (default: true)
- `showCountrySelector?: boolean` - Show country code dropdown (default: true)
- `sanitize?: boolean` - Enable sanitization on blur (default: true)
- `fullWidth?: boolean` - Full width input (default: true)
- `compact?: boolean` - Compact size variant
- Forward ref support

**Features:**

- Country code selector with 8 common countries (India, US, UK, Australia, UAE, Singapore, Malaysia, China)
- Flag emojis for visual country identification
- Auto-formatting for Indian numbers (XXXXX XXXXX format)
- Sanitization removes invalid characters
- Format preview shows formatted number
- Validation support with error messages
- Reuses `formatPhoneNumber` from @/lib/formatters
- Reuses `sanitizePhone` from @/lib/sanitize
- Accessible with proper ARIA attributes
- Demo: `/demo/form-phone-input`

**Example:**

```tsx
import { FormPhoneInput } from "@/components/forms/FormPhoneInput";

function MyForm() {
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("+91");

  return (
    <FormPhoneInput
      label="Phone Number"
      value={phone}
      countryCode={countryCode}
      onChange={(phone, code) => {
        setPhone(phone);
        setCountryCode(code);
      }}
      required
      helperText="Enter your mobile number"
    />
  );
}
```

---

### FormCurrencyInput.tsx

**Export:** `FormCurrencyInput`

**Purpose:** Currency input with symbol, auto-formatting, and optional currency selector.

**Props:**

- `label?: string` - Input label
- `error?: string` - Error message
- `helperText?: string` - Helper text
- `value?: number | null` - Numeric value (not formatted)
- `currency?: Currency` - Currency code: "INR", "USD", "EUR", "GBP" (default: "INR")
- `onChange?: (value: number | null, currency: Currency) => void` - Value change handler
- `onCurrencyChange?: (currency: Currency) => void` - Currency change handler
- `showCurrencySelector?: boolean` - Show currency dropdown (default: false)
- `autoFormat?: boolean` - Enable auto-formatting on blur (default: true)
- `allowNegative?: boolean` - Allow negative values (default: false)
- `min?: number` - Minimum value (auto-clamped)
- `max?: number` - Maximum value (auto-clamped)
- `fullWidth?: boolean` - Full width input (default: true)
- `compact?: boolean` - Compact size variant
- Forward ref support

**Features:**

- Currency symbol display (₹, $, €, £)
- Auto-formatting with Indian number format for INR (1,23,456.78)
- Currency selector dropdown with 4 currencies
- Format preview shows formatted value
- Min/max value clamping
- Removes formatting on focus for easy editing
- Reuses `formatPrice` from @/lib/price.utils
- Validation support with error messages
- Negative value support (optional)
- Accessible with proper ARIA attributes
- Demo: `/demo/form-currency-input`

**Example:**

```tsx
import { FormCurrencyInput } from "@/components/forms/FormCurrencyInput";

function ProductForm() {
  const [price, setPrice] = useState<number | null>(null);
  const [currency, setCurrency] = useState<Currency>("INR");

  return (
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
      required
      helperText="Enter price in INR"
    />
  );
}
```

---

### FormDatePicker.tsx

**Export:** `FormDatePicker`

**Purpose:** Date picker with custom calendar UI and date validation (no external dependencies).

**Props:**

- `label?: string` - Input label
- `error?: string` - Error message
- `helperText?: string` - Helper text
- `value?: Date | string | null` - Selected date
- `onChange?: (date: Date | null) => void` - Date change handler
- `minDate?: Date | string` - Minimum allowed date
- `maxDate?: Date | string` - Maximum allowed date
- `displayFormat?: "YYYY-MM-DD" | "DD/MM/YYYY" | "MM/DD/YYYY"` - Date display format (default: "YYYY-MM-DD")
- `showIcon?: boolean` - Show calendar icon (default: true)
- `placeholder?: string` - Input placeholder
- `fullWidth?: boolean` - Full width input (default: true)
- `compact?: boolean` - Compact size variant
- `disabled?: boolean` - Disable input and calendar
- Forward ref support

**Features:**

- Custom calendar UI without external dependencies (no date-fns/dayjs)
- Month/year navigation with arrow buttons
- 7-column calendar grid with day headers (Sun-Sat)
- Min/max date validation with disabled states
- Multiple display formats (ISO, European, US)
- Visual indicators: selected (blue bg), today (blue border), disabled (gray)
- Footer actions: "Today" button, "Clear" button
- Format preview shows formatted date below input
- Date range hint when min/max dates are set
- Native JavaScript Date API (lightweight, ~469 lines)
- Full keyboard navigation support
- Proper ARIA attributes for accessibility
- Helper functions: getDaysInMonth, getFirstDayOfMonth, formatDate, parseDate
- Demo: `/demo/form-date-picker`

**Example:**

```tsx
import { FormDatePicker } from "@/components/forms/FormDatePicker";

function BookingForm() {
  const [date, setDate] = useState<Date | null>(null);

  // Only allow future dates
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);

  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 6); // 6 months max

  return (
    <FormDatePicker
      label="Booking Date"
      value={date}
      onChange={setDate}
      minDate={minDate}
      maxDate={maxDate}
      displayFormat="DD/MM/YYYY"
      required
      helperText="Select your preferred date"
    />
  );
}
```

---

### FormNumberInput.tsx

**Export:** `FormNumberInput`

**Purpose:** Number input with increment/decrement buttons and validation.

**Props:**

- `value: number` - Current value
- `onChange: (value: number) => void` - Value change handler
- `min?: number` - Minimum value
- `max?: number` - Maximum value
- `step?: number` - Increment step (default: 1)
- `error?: boolean` - Show error state
- `disabled?: boolean` - Disable input
- Forward ref support

**Features:**

- Increment/decrement buttons
- Min/max validation
- Step support for decimals
- Keyboard arrow key support
- Mouse wheel support (optional)
- Error state styling
- Mobile-friendly button sizes

---

### FormListInput.tsx

**Export:** `FormListInput`

**Purpose:** Dynamic list input for adding/removing multiple values (e.g., tags, URLs, features).

**Props:**

- `values: string[]` - Array of current values
- `onChange: (values: string[]) => void` - Values change handler
- `placeholder?: string` - Input placeholder
- `addButtonText?: string` - Add button text
- `error?: boolean` - Show error state
- `maxItems?: number` - Maximum number of items
- `validator?: (value: string) => boolean` - Custom validation function

**Features:**

- Add new items with button or Enter key
- Remove items individually
- Drag and drop reordering
- Validation per item
- Max items limit
- Empty state message
- Dark mode support

---

### FormKeyValueInput.tsx

**Export:** `FormKeyValueInput`

**Purpose:** Input for key-value pairs (e.g., metadata, custom fields).

**Props:**

- `pairs: Array<{key: string, value: string}>` - Current key-value pairs
- `onChange: (pairs) => void` - Pairs change handler
- `keyPlaceholder?: string` - Key input placeholder
- `valuePlaceholder?: string` - Value input placeholder
- `addButtonText?: string` - Add button text
- `error?: boolean` - Show error state

**Features:**

- Add/remove key-value pairs
- Duplicate key prevention
- Empty state handling
- Validation for both key and value
- Dark mode support

---

### FormLabel.tsx

**Export:** `FormLabel`

**Purpose:** Standalone label component with consistent styling.

**Props:**

- `htmlFor?: string` - Associated input ID
- `required?: boolean` - Show required indicator
- `children: React.ReactNode` - Label content
- `className?: string` - Additional classes

**Features:**

- Required indicator (red asterisk)
- Consistent typography
- Dark mode support
- Accessible label association

---

### FormSection.tsx

**Export:** `FormSection`

**Purpose:** Section container for grouping related form fields.

**Props:**

- `title?: string` - Section title
- `description?: string` - Section description
- `children: React.ReactNode` - Form fields
- `className?: string` - Additional classes

**Features:**

- Visual grouping with border
- Title and description styling
- Consistent spacing
- Dark mode support

---

### FormFieldset.tsx

**Export:** `FormFieldset`

**Purpose:** Semantic fieldset element with legend for form groups.

**Props:**

- `legend?: string` - Fieldset legend
- `children: React.ReactNode` - Form fields
- `disabled?: boolean` - Disable all child inputs
- Extends standard fieldset HTML attributes

**Features:**

- Semantic HTML fieldset
- Legend styling
- Disabled state propagation
- Accessible grouping

---

## Wizard Components

### WizardForm.tsx

**Export:** `WizardForm`

**Purpose:** Multi-step form wizard container.

**Props:**

- `steps: Array<StepConfig>` - Wizard steps configuration
- `currentStep: number` - Current active step
- `onStepChange: (step: number) => void` - Step change handler
- `onSubmit: () => void` - Final submission handler
- `children: React.ReactNode` - Step content

**Features:**

- Multi-step navigation
- Progress indicator
- Step validation
- Back/Next navigation
- Submit on final step

---

### WizardSteps.tsx

**Export:** `WizardSteps`

**Purpose:** Visual step indicator for wizard forms.

**Props:**

- `steps: Array<{label: string}>` - Step labels
- `currentStep: number` - Current active step
- `completedSteps: number[]` - Array of completed step indices

**Features:**

- Visual progress indicator
- Step numbers with status (completed, active, pending)
- Connecting lines between steps
- Responsive design
- Yellow accent for active/completed steps

---

### WizardActionBar.tsx

**Export:** `WizardActionBar`

**Purpose:** Action buttons for wizard navigation (Back, Next, Submit).

**Props:**

- `currentStep: number` - Current step
- `totalSteps: number` - Total number of steps
- `onBack: () => void` - Back button handler
- `onNext: () => void` - Next button handler
- `onSubmit: () => void` - Submit button handler
- `nextDisabled?: boolean` - Disable next button
- `submitDisabled?: boolean` - Disable submit button
- `isLoading?: boolean` - Show loading state

**Features:**

- Context-aware button display (Back/Next vs Submit)
- Loading states
- Disabled states
- Mobile-optimized button sizes
- Yellow primary action buttons

---

## Common Patterns

### Form State Management

- Controlled components pattern
- Forward ref support for form libraries (React Hook Form, Formik)
- Error prop for validation feedback
- onChange handlers with typed events

### Styling Conventions

- Tailwind CSS utility classes
- Dark mode via `dark:` variants
- Yellow accent color (`yellow-500/600`) for interactive elements
- Consistent spacing (`p-2`, `p-3`, `gap-2`)
- Mobile-first responsive design
- Min-height 48px for touch targets

### Validation & Error Handling

- Error prop triggers error styling (red borders, text)
- Error messages displayed below inputs
- Required field indicators (asterisk)
- Helper text for additional guidance
- Inline validation support

### Accessibility

- Proper label associations with htmlFor/id
- ARIA attributes (aria-invalid, aria-describedby)
- Keyboard navigation support
- Focus management
- Screen reader friendly error messages
- Semantic HTML elements

### Component Composition

- FormField wraps inputs for consistent layout
- FormSection groups related fields
- FormFieldset for semantic grouping
- Wizard components for multi-step flows

### TypeScript Support

- Fully typed props with interfaces
- Generic types for flexible data structures
- Extends standard HTML element props
- Forward ref types
