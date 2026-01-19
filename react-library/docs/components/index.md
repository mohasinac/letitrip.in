# Component Reference

Complete documentation for all components in @letitrip/react-library.

## Table of Contents

- [Value Display Components](#value-display-components)
- [Form Components](#form-components)
- [UI Components](#ui-components)
- [Upload Components](#upload-components)
- [Card Components](#card-components)
- [Table Components](#table-components)
- [Search & Filter Components](#search--filter-components)
- [Pagination Components](#pagination-components)
- [Selector Components](#selector-components)
- [Wizard Components](#wizard-components)
- [Layout Components](#layout-components)
- [Navigation Components](#navigation-components)
- [Dashboard Components](#dashboard-components)
- [Auction Components](#auction-components)
- [Product Components](#product-components)
- [Shop Components](#shop-components)
- [Category Components](#category-components)
- [Cart Components](#cart-components)
- [Checkout Components](#checkout-components)
- [User Components](#user-components)
- [Auth Components](#auth-components)
- [Admin Components](#admin-components)
- [Seller Components](#seller-components)
- [Analytics Components](#analytics-components)
- [Events Components](#events-components)
- [Homepage Components](#homepage-components)
- [FAQ Components](#faq-components)
- [Legal Components](#legal-components)
- [Mobile Components](#mobile-components)
- [Media Components](#media-components)
- [Common Components](#common-components)
- [Skeleton Components](#skeleton-components)

---

## Value Display Components

Components for displaying formatted values with consistent styling.

### `DateDisplay`

Displays dates with flexible formatting options.

**Props:**

- `date: Date | string | number` - Date to display
- `format?: string` - Date format (default: 'MMM dd, yyyy')
- `relative?: boolean` - Show relative time (e.g., "2 hours ago")
- `className?: string` - Additional CSS classes

**Usage:**

```tsx
<DateDisplay date={new Date()} format="dd/MM/yyyy" />
<DateDisplay date="2024-01-15" relative />
```

### `Price`

Currency display with Indian format and INR symbol.

**Props:**

- `amount: number` - Price amount
- `currency?: string` - Currency code (default: 'INR')
- `showSymbol?: boolean` - Show currency symbol (default: true)
- `showDecimals?: boolean` - Show decimal places (default: true)
- `className?: string` - Additional CSS classes

**Usage:**

```tsx
<Price amount={1999.99} />
<Price amount={50000} showDecimals={false} />
```

### `Rating`

Star rating display with half-star support.

**Props:**

- `value: number` - Rating value (0-5)
- `max?: number` - Maximum rating (default: 5)
- `showValue?: boolean` - Show numeric value (default: true)
- `size?: 'sm' | 'md' | 'lg'` - Star size
- `className?: string` - Additional CSS classes

**Usage:**

```tsx
<Rating value={4.5} />
<Rating value={3} size="lg" showValue={false} />
```

### `AuctionStatus`

Display auction status with color-coded badges.

**Props:**

- `status: AuctionStatus` - Current auction status
- `endTime?: Date` - Auction end time
- `className?: string` - Additional CSS classes

**Usage:**

```tsx
<AuctionStatus status="active" endTime={new Date()} />
```

### `PaymentStatus`

Display payment status with appropriate styling.

**Props:**

- `status: PaymentStatus` - Payment status
- `amount?: number` - Payment amount
- `className?: string` - Additional CSS classes

**Usage:**

```tsx
<PaymentStatus status="completed" amount={1999} />
```

### `ShippingStatus`

Display shipping/delivery status.

**Props:**

- `status: ShippingStatus` - Shipping status
- `trackingNumber?: string` - Tracking number
- `className?: string` - Additional CSS classes

**Usage:**

```tsx
<ShippingStatus status="shipped" trackingNumber="TRK123456" />
```

### `StockStatus`

Display product stock availability.

**Props:**

- `quantity: number` - Available quantity
- `lowStockThreshold?: number` - Threshold for low stock warning
- `className?: string` - Additional CSS classes

**Usage:**

```tsx
<StockStatus quantity={5} lowStockThreshold={10} />
```

### `Currency`

Format and display currency values.

**Props:**

- `amount: number` - Amount to display
- `code?: string` - Currency code
- `locale?: string` - Locale for formatting
- `className?: string` - Additional CSS classes

### `Percentage`

Display percentage values with formatting.

**Props:**

- `value: number` - Percentage value
- `decimals?: number` - Decimal places (default: 0)
- `showSign?: boolean` - Show + sign for positive values
- `className?: string` - Additional CSS classes

### `Quantity`

Display quantity with unit.

**Props:**

- `value: number` - Quantity value
- `unit?: string` - Unit of measurement
- `className?: string` - Additional CSS classes

### `BidCount`

Display number of bids in an auction.

**Props:**

- `count: number` - Number of bids
- `showLabel?: boolean` - Show "bids" label
- `className?: string` - Additional CSS classes

### `TimeRemaining`

Display countdown timer for auctions.

**Props:**

- `endTime: Date` - End time
- `format?: 'short' | 'long'` - Display format
- `onExpire?: () => void` - Callback when timer expires
- `className?: string` - Additional CSS classes

### `OrderId`

Display formatted order ID.

**Props:**

- `id: string` - Order ID
- `prefix?: string` - Prefix for display
- `copyable?: boolean` - Enable copy to clipboard
- `className?: string` - Additional CSS classes

### `SKU`

Display product SKU.

**Props:**

- `sku: string` - SKU code
- `copyable?: boolean` - Enable copy to clipboard
- `className?: string` - Additional CSS classes

### `PhoneNumber`

Display formatted phone number.

**Props:**

- `number: string` - Phone number
- `countryCode?: string` - Country code
- `clickable?: boolean` - Make it clickable (tel: link)
- `className?: string` - Additional CSS classes

### `Email`

Display email address.

**Props:**

- `email: string` - Email address
- `clickable?: boolean` - Make it clickable (mailto: link)
- `className?: string` - Additional CSS classes

### `Address`

Display formatted address.

**Props:**

- `address: Address` - Address object
- `format?: 'short' | 'full'` - Display format
- `className?: string` - Additional CSS classes

### `Weight`

Display weight with unit.

**Props:**

- `value: number` - Weight value
- `unit?: 'kg' | 'g' | 'lb'` - Unit of measurement
- `className?: string` - Additional CSS classes

### `Dimensions`

Display product dimensions.

**Props:**

- `length: number` - Length
- `width: number` - Width
- `height: number` - Height
- `unit?: 'cm' | 'in'` - Unit of measurement
- `className?: string` - Additional CSS classes

### `TruncatedText`

Display text with truncation and expand option.

**Props:**

- `text: string` - Text to display
- `maxLength: number` - Maximum length before truncation
- `expandable?: boolean` - Allow expanding to full text
- `className?: string` - Additional CSS classes

---

## Form Components

Complete form controls with validation and accessibility support.

### `FormInput`

Standard text input field with label and validation.

**Props:**

- `name: string` - Input name
- `label?: string` - Input label
- `type?: string` - Input type (default: 'text')
- `placeholder?: string` - Placeholder text
- `required?: boolean` - Mark as required
- `error?: string` - Error message
- `disabled?: boolean` - Disable input
- `className?: string` - Additional CSS classes

**Usage:**

```tsx
<FormInput
  name="username"
  label="Username"
  placeholder="Enter username"
  required
  error={errors.username}
/>
```

### `FormSelect`

Dropdown select with label and validation.

**Props:**

- `name: string` - Select name
- `label?: string` - Select label
- `options: Array<{value: string, label: string}>` - Options
- `placeholder?: string` - Placeholder text
- `required?: boolean` - Mark as required
- `error?: string` - Error message
- `disabled?: boolean` - Disable select
- `multiple?: boolean` - Allow multiple selection
- `className?: string` - Additional CSS classes

**Usage:**

```tsx
<FormSelect name="category" label="Category" options={categories} required />
```

### `FormTextarea`

Textarea field with label and validation.

**Props:**

- `name: string` - Textarea name
- `label?: string` - Textarea label
- `placeholder?: string` - Placeholder text
- `rows?: number` - Number of rows (default: 4)
- `maxLength?: number` - Maximum character length
- `required?: boolean` - Mark as required
- `error?: string` - Error message
- `disabled?: boolean` - Disable textarea
- `className?: string` - Additional CSS classes

**Usage:**

```tsx
<FormTextarea name="description" label="Description" rows={6} maxLength={500} />
```

### `FormCheckbox`

Checkbox input with label.

**Props:**

- `name: string` - Checkbox name
- `label: string` - Checkbox label
- `checked?: boolean` - Checked state
- `onChange?: (checked: boolean) => void` - Change handler
- `error?: string` - Error message
- `disabled?: boolean` - Disable checkbox
- `className?: string` - Additional CSS classes

**Usage:**

```tsx
<FormCheckbox name="terms" label="I agree to terms and conditions" required />
```

### `FormRadio`

Radio button group.

**Props:**

- `name: string` - Radio group name
- `label?: string` - Group label
- `options: Array<{value: string, label: string}>` - Radio options
- `value?: string` - Selected value
- `onChange?: (value: string) => void` - Change handler
- `error?: string` - Error message
- `disabled?: boolean` - Disable all radios
- `className?: string` - Additional CSS classes

**Usage:**

```tsx
<FormRadio
  name="gender"
  label="Gender"
  options={[
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
  ]}
/>
```

### `FormDatePicker`

Date picker with calendar popup.

**Props:**

- `name: string` - Input name
- `label?: string` - Input label
- `value?: Date` - Selected date
- `onChange?: (date: Date) => void` - Change handler
- `minDate?: Date` - Minimum selectable date
- `maxDate?: Date` - Maximum selectable date
- `error?: string` - Error message
- `disabled?: boolean` - Disable input
- `className?: string` - Additional CSS classes

**Usage:**

```tsx
<FormDatePicker name="startDate" label="Start Date" minDate={new Date()} />
```

### `DateTimePicker`

Combined date and time picker.

**Props:**

- `name: string` - Input name
- `label?: string` - Input label
- `value?: Date` - Selected date/time
- `onChange?: (date: Date) => void` - Change handler
- `showTime?: boolean` - Show time picker (default: true)
- `error?: string` - Error message
- `className?: string` - Additional CSS classes

### `FormFileUpload`

File upload with drag-and-drop.

**Props:**

- `name: string` - Input name
- `label?: string` - Input label
- `accept?: string` - Accepted file types
- `multiple?: boolean` - Allow multiple files
- `maxSize?: number` - Maximum file size in bytes
- `onUpload?: (files: File[]) => void` - Upload handler
- `error?: string` - Error message
- `className?: string` - Additional CSS classes

### `RichTextEditor`

WYSIWYG text editor.

**Props:**

- `name: string` - Editor name
- `label?: string` - Editor label
- `value?: string` - Editor content (HTML)
- `onChange?: (html: string) => void` - Change handler
- `placeholder?: string` - Placeholder text
- `error?: string` - Error message
- `className?: string` - Additional CSS classes

### `SlugInput`

Auto-generate URL slug from title.

**Props:**

- `name: string` - Input name
- `label?: string` - Input label
- `source?: string` - Source text for auto-generation
- `value?: string` - Slug value
- `onChange?: (slug: string) => void` - Change handler
- `error?: string` - Error message
- `className?: string` - Additional CSS classes

### `TagInput`

Add/remove tags with autocomplete.

**Props:**

- `name: string` - Input name
- `label?: string` - Input label
- `tags: string[]` - Current tags
- `onChange?: (tags: string[]) => void` - Change handler
- `suggestions?: string[]` - Tag suggestions
- `maxTags?: number` - Maximum number of tags
- `error?: string` - Error message
- `className?: string` - Additional CSS classes

### `PincodeInput`

Indian pincode input with validation.

**Props:**

- `name: string` - Input name
- `label?: string` - Input label
- `value?: string` - Pincode value
- `onChange?: (pincode: string) => void` - Change handler
- `onValidate?: (isValid: boolean) => void` - Validation callback
- `error?: string` - Error message
- `className?: string` - Additional CSS classes

### `FormPhoneInput`

Phone number input with country code.

**Props:**

- `name: string` - Input name
- `label?: string` - Input label
- `value?: string` - Phone number
- `onChange?: (phone: string) => void` - Change handler
- `defaultCountry?: string` - Default country code
- `error?: string` - Error message
- `className?: string` - Additional CSS classes

### `FormCurrencyInput`

Currency input with formatting.

**Props:**

- `name: string` - Input name
- `label?: string` - Input label
- `value?: number` - Amount value
- `onChange?: (amount: number) => void` - Change handler
- `currency?: string` - Currency code (default: 'INR')
- `error?: string` - Error message
- `className?: string` - Additional CSS classes

### `FormNumberInput`

Numeric input with increment/decrement controls.

**Props:**

- `name: string` - Input name
- `label?: string` - Input label
- `value?: number` - Number value
- `onChange?: (value: number) => void` - Change handler
- `min?: number` - Minimum value
- `max?: number` - Maximum value
- `step?: number` - Step increment (default: 1)
- `error?: string` - Error message
- `className?: string` - Additional CSS classes

### `LinkInput`

URL input with validation.

**Props:**

- `name: string` - Input name
- `label?: string` - Input label
- `value?: string` - URL value
- `onChange?: (url: string) => void` - Change handler
- `placeholder?: string` - Placeholder text
- `error?: string` - Error message
- `className?: string` - Additional CSS classes

### `FormKeyValueInput`

Dynamic key-value pair input.

**Props:**

- `name: string` - Input name
- `label?: string` - Input label
- `pairs: Array<{key: string, value: string}>` - Key-value pairs
- `onChange?: (pairs: Array) => void` - Change handler
- `keyPlaceholder?: string` - Key placeholder
- `valuePlaceholder?: string` - Value placeholder
- `error?: string` - Error message
- `className?: string` - Additional CSS classes

### `FormListInput`

Dynamic list input with add/remove.

**Props:**

- `name: string` - Input name
- `label?: string` - Input label
- `items: string[]` - List items
- `onChange?: (items: string[]) => void` - Change handler
- `placeholder?: string` - Placeholder text
- `maxItems?: number` - Maximum number of items
- `error?: string` - Error message
- `className?: string` - Additional CSS classes

### `FormField`

Generic form field wrapper.

**Props:**

- `label?: string` - Field label
- `name: string` - Field name
- `required?: boolean` - Mark as required
- `error?: string` - Error message
- `hint?: string` - Helpful hint text
- `children: ReactNode` - Field input content
- `className?: string` - Additional CSS classes

### `FormFieldset`

Group related form fields.

**Props:**

- `legend?: string` - Fieldset legend
- `children: ReactNode` - Form fields
- `className?: string` - Additional CSS classes

### `FormLabel`

Accessible form label.

**Props:**

- `htmlFor: string` - Associated input ID
- `required?: boolean` - Mark as required
- `children: ReactNode` - Label text
- `className?: string` - Additional CSS classes

### `FormSection`

Form section with heading.

**Props:**

- `title: string` - Section title
- `description?: string` - Section description
- `children: ReactNode` - Section content
- `className?: string` - Additional CSS classes

### `FormModal`

Modal dialog with form.

**Props:**

- `isOpen: boolean` - Modal open state
- `onClose: () => void` - Close handler
- `title: string` - Modal title
- `children: ReactNode` - Form content
- `onSubmit?: () => void` - Submit handler
- `submitLabel?: string` - Submit button label
- `className?: string` - Additional CSS classes

### `InlineFormModal`

Inline modal for quick edits.

**Props:**

- `isOpen: boolean` - Modal open state
- `onClose: () => void` - Close handler
- `children: ReactNode` - Form content
- `className?: string` - Additional CSS classes

### `WizardForm`

Multi-step wizard form container.

**Props:**

- `steps: Array<{id: string, label: string}>` - Wizard steps
- `currentStep: number` - Current step index
- `onStepChange?: (step: number) => void` - Step change handler
- `children: ReactNode` - Step content
- `className?: string` - Additional CSS classes

### `WizardSteps`

Wizard step indicator.

**Props:**

- `steps: Array<{id: string, label: string}>` - Wizard steps
- `currentStep: number` - Current step index
- `completedSteps: number[]` - Completed step indices
- `onStepClick?: (step: number) => void` - Step click handler
- `className?: string` - Additional CSS classes

### `WizardActionBar`

Wizard navigation buttons.

**Props:**

- `currentStep: number` - Current step index
- `totalSteps: number` - Total number of steps
- `onPrevious?: () => void` - Previous button handler
- `onNext?: () => void` - Next button handler
- `onSubmit?: () => void` - Submit handler (last step)
- `isValid?: boolean` - Current step validation state
- `className?: string` - Additional CSS classes

### `AuctionForm`

Complete auction creation form.

**Props:**

- `initialData?: Partial<Auction>` - Initial form data
- `onSubmit: (data: Auction) => void` - Submit handler
- `onCancel?: () => void` - Cancel handler
- `className?: string` - Additional CSS classes

### `ShopForm`

Complete shop creation/edit form.

**Props:**

- `initialData?: Partial<Shop>` - Initial form data
- `onSubmit: (data: Shop) => void` - Submit handler
- `onCancel?: () => void` - Cancel handler
- `className?: string` - Additional CSS classes

---

## UI Components

Core UI building blocks for the application.

### `Button`

Primary button component with variants.

**Props:**

- `variant?: 'primary' | 'secondary' | 'ghost' | 'danger'` - Button style
- `size?: 'sm' | 'md' | 'lg'` - Button size
- `loading?: boolean` - Show loading state
- `disabled?: boolean` - Disable button
- `fullWidth?: boolean` - Full width button
- `icon?: ReactNode` - Icon element
- `children: ReactNode` - Button text
- `onClick?: () => void` - Click handler
- `className?: string` - Additional CSS classes

**Usage:**

```tsx
<Button variant="primary" onClick={handleClick}>
  Submit
</Button>
<Button variant="secondary" icon={<IconPlus />} loading>
  Loading...
</Button>
```

### `Card`

Container card component.

**Props:**

- `title?: string` - Card title
- `subtitle?: string` - Card subtitle
- `header?: ReactNode` - Custom header content
- `footer?: ReactNode` - Card footer content
- `padding?: 'none' | 'sm' | 'md' | 'lg'` - Card padding
- `border?: boolean` - Show border (default: true)
- `shadow?: boolean` - Show shadow (default: true)
- `children: ReactNode` - Card content
- `className?: string` - Additional CSS classes

**Usage:**

```tsx
<Card title="Profile" subtitle="User information">
  <p>Card content</p>
</Card>
```

### `BaseCard`

Basic card wrapper without styling.

**Props:**

- `children: ReactNode` - Card content
- `onClick?: () => void` - Click handler
- `className?: string` - Additional CSS classes

### `SectionCard`

Card for form sections.

**Props:**

- `title: string` - Section title
- `description?: string` - Section description
- `children: ReactNode` - Section content
- `collapsible?: boolean` - Make section collapsible
- `defaultExpanded?: boolean` - Default expanded state
- `className?: string` - Additional CSS classes

### `StatCard`

Card for displaying statistics.

**Props:**

- `title: string` - Stat title
- `value: string | number` - Stat value
- `change?: number` - Percentage change
- `trend?: 'up' | 'down' | 'neutral'` - Trend indicator
- `icon?: ReactNode` - Icon element
- `className?: string` - Additional CSS classes

### `Toast`

Toast notification component.

**Props:**

- `type?: 'success' | 'error' | 'warning' | 'info'` - Toast type
- `message: string` - Notification message
- `duration?: number` - Auto-dismiss duration (ms)
- `onClose?: () => void` - Close handler
- `className?: string` - Additional CSS classes

**Usage:**

```tsx
<Toast type="success" message="Profile updated successfully" duration={3000} />
```

### `Modal`

Modal dialog component.

**Props:**

- `isOpen: boolean` - Modal open state
- `onClose: () => void` - Close handler
- `title?: string` - Modal title
- `size?: 'sm' | 'md' | 'lg' | 'xl'` - Modal size
- `closeOnOverlay?: boolean` - Close when clicking overlay
- `children: ReactNode` - Modal content
- `footer?: ReactNode` - Modal footer content
- `className?: string` - Additional CSS classes

**Usage:**

```tsx
<Modal isOpen={isOpen} onClose={onClose} title="Confirm Action" size="md">
  <p>Are you sure?</p>
</Modal>
```

### `ConfirmDialog`

Confirmation dialog component.

**Props:**

- `isOpen: boolean` - Dialog open state
- `onClose: () => void` - Close handler
- `onConfirm: () => void` - Confirm handler
- `title: string` - Dialog title
- `message: string` - Confirmation message
- `confirmLabel?: string` - Confirm button label
- `cancelLabel?: string` - Cancel button label
- `variant?: 'danger' | 'warning'` - Dialog variant
- `className?: string` - Additional CSS classes

### `LoadingSpinner`

Loading spinner indicator.

**Props:**

- `size?: 'sm' | 'md' | 'lg'` - Spinner size
- `color?: string` - Spinner color
- `label?: string` - Loading label
- `overlay?: boolean` - Show as overlay
- `className?: string` - Additional CSS classes

### `ErrorMessage`

Error message display.

**Props:**

- `message: string` - Error message
- `title?: string` - Error title
- `retry?: () => void` - Retry action handler
- `className?: string` - Additional CSS classes

### `FieldError`

Form field error message.

**Props:**

- `error?: string` - Error message
- `className?: string` - Additional CSS classes

### `Checkbox`

Standalone checkbox component.

**Props:**

- `checked?: boolean` - Checked state
- `onChange?: (checked: boolean) => void` - Change handler
- `label?: string` - Checkbox label
- `disabled?: boolean` - Disable checkbox
- `className?: string` - Additional CSS classes

### `ToggleSwitch`

Toggle switch component.

**Props:**

- `checked?: boolean` - Checked state
- `onChange?: (checked: boolean) => void` - Change handler
- `label?: string` - Switch label
- `disabled?: boolean` - Disable switch
- `className?: string` - Additional CSS classes

### `Textarea`

Standalone textarea component.

**Props:**

- `value?: string` - Textarea value
- `onChange?: (value: string) => void` - Change handler
- `placeholder?: string` - Placeholder text
- `rows?: number` - Number of rows
- `disabled?: boolean` - Disable textarea
- `className?: string` - Additional CSS classes

### `Heading`

Semantic heading component.

**Props:**

- `level?: 1 | 2 | 3 | 4 | 5 | 6` - Heading level (default: 2)
- `children: ReactNode` - Heading text
- `className?: string` - Additional CSS classes

### `Text`

Text component with variants.

**Props:**

- `variant?: 'body' | 'caption' | 'label'` - Text variant
- `size?: 'sm' | 'md' | 'lg'` - Text size
- `weight?: 'normal' | 'medium' | 'semibold' | 'bold'` - Font weight
- `color?: string` - Text color
- `children: ReactNode` - Text content
- `className?: string` - Additional CSS classes

### `SmartLink`

Intelligent link component (internal/external).

**Props:**

- `href: string` - Link URL
- `external?: boolean` - Open in new tab
- `children: ReactNode` - Link text
- `className?: string` - Additional CSS classes

### `DynamicIcon`

Dynamic icon loader.

**Props:**

- `name: string` - Icon name
- `size?: number` - Icon size
- `color?: string` - Icon color
- `className?: string` - Additional CSS classes

### `OptimizedImage`

Optimized image with lazy loading.

**Props:**

- `src: string` - Image source
- `alt: string` - Alt text
- `width?: number` - Image width
- `height?: number` - Image height
- `lazy?: boolean` - Enable lazy loading (default: true)
- `placeholder?: string` - Placeholder image
- `className?: string` - Additional CSS classes

### `FavoriteButton`

Toggle favorite/wishlist button.

**Props:**

- `isFavorite: boolean` - Favorite state
- `onToggle: () => void` - Toggle handler
- `size?: 'sm' | 'md' | 'lg'` - Button size
- `className?: string` - Additional CSS classes

### `GPSButton`

Get current location button.

**Props:**

- `onLocation: (coords: Coordinates) => void` - Location handler
- `disabled?: boolean` - Disable button
- `className?: string` - Additional CSS classes

### `ThemeToggle`

Dark/light theme toggle.

**Props:**

- `theme: 'light' | 'dark'` - Current theme
- `onToggle: () => void` - Toggle handler
- `className?: string` - Additional CSS classes

### `ViewToggle`

Grid/list view toggle.

**Props:**

- `view: 'grid' | 'list'` - Current view
- `onToggle: (view: 'grid' | 'list') => void` - Toggle handler
- `className?: string` - Additional CSS classes

### `MobileInput`

Mobile-optimized input field.

**Props:**

- `type?: string` - Input type
- `value?: string` - Input value
- `onChange?: (value: string) => void` - Change handler
- `placeholder?: string` - Placeholder text
- `className?: string` - Additional CSS classes

### `MobileStickyBar`

Sticky action bar for mobile.

**Props:**

- `children: ReactNode` - Bar content
- `className?: string` - Additional CSS classes

### `SliderControl`

Slider input control.

**Props:**

- `min: number` - Minimum value
- `max: number` - Maximum value
- `value: number` - Current value
- `onChange: (value: number) => void` - Change handler
- `step?: number` - Step increment
- `label?: string` - Slider label
- `className?: string` - Additional CSS classes

### `HorizontalScrollContainer`

Horizontal scrollable container.

**Props:**

- `children: ReactNode` - Container content
- `showControls?: boolean` - Show scroll controls
- `className?: string` - Additional CSS classes

### `FormActions`

Form action buttons container.

**Props:**

- `onCancel?: () => void` - Cancel handler
- `onSubmit?: () => void` - Submit handler
- `submitLabel?: string` - Submit button label
- `cancelLabel?: string` - Cancel button label
- `loading?: boolean` - Loading state
- `disabled?: boolean` - Disable buttons
- `className?: string` - Additional CSS classes

### `FormLayout`

Form layout wrapper.

**Props:**

- `columns?: 1 | 2 | 3` - Number of columns
- `children: ReactNode` - Form content
- `className?: string` - Additional CSS classes

### `Accessibility`

Screen reader only content.

**Props:**

- `children: ReactNode` - Accessible content
- `className?: string` - Additional CSS classes

### `InlineImageUpload`

Inline image upload widget.

**Props:**

- `onUpload: (file: File) => void` - Upload handler
- `maxSize?: number` - Maximum file size
- `className?: string` - Additional CSS classes

### `UploadProgress`

Upload progress indicator.

**Props:**

- `progress: number` - Progress percentage (0-100)
- `fileName?: string` - File name
- `onCancel?: () => void` - Cancel upload handler
- `className?: string` - Additional CSS classes

### `PendingUploadsWarning`

Warning for pending uploads.

**Props:**

- `count: number` - Number of pending uploads
- `onView?: () => void` - View details handler
- `className?: string` - Additional CSS classes

### `PaymentLogo`

Payment method logo.

**Props:**

- `method: string` - Payment method name
- `size?: 'sm' | 'md' | 'lg'` - Logo size
- `className?: string` - Additional CSS classes

### `RipLimitStatsCards`

RipLimit statistics cards.

**Props:**

- `stats: RipLimitStats` - Statistics data
- `className?: string` - Additional CSS classes

### `BaseTable`

Base table component without styling.

**Props:**

- `columns: Column[]` - Table columns
- `data: any[]` - Table data
- `className?: string` - Additional CSS classes

---

## Upload Components

Media upload components with preview and validation.

### `ImageUploadWithCrop`

Image upload with crop functionality.

**Props:**

- `onUpload: (file: File, cropData: CropData) => void` - Upload handler
- `aspect?: number` - Crop aspect ratio
- `maxSize?: number` - Maximum file size in bytes
- `accept?: string` - Accepted file types
- `cropShape?: 'rect' | 'round'` - Crop shape
- `className?: string` - Additional CSS classes

**Usage:**

```tsx
<ImageUploadWithCrop
  onUpload={handleUpload}
  aspect={16 / 9}
  maxSize={5 * 1024 * 1024}
/>
```

### `VideoUploadWithThumbnail`

Video upload with thumbnail generation.

**Props:**

- `onUpload: (file: File, thumbnail: File) => void` - Upload handler
- `maxSize?: number` - Maximum file size in bytes
- `accept?: string` - Accepted file types
- `thumbnailTime?: number` - Time for thumbnail capture (seconds)
- `className?: string` - Additional CSS classes

**Usage:**

```tsx
<VideoUploadWithThumbnail onUpload={handleUpload} maxSize={100 * 1024 * 1024} />
```

---

## Card Components

Pre-built card components for different content types.

### `ProductCard`

Product display card.

**Props:**

- `product: Product` - Product data
- `onClick?: () => void` - Card click handler
- `onFavorite?: () => void` - Favorite toggle handler
- `showActions?: boolean` - Show action buttons
- `variant?: 'grid' | 'list'` - Card layout variant
- `className?: string` - Additional CSS classes

**Usage:**

```tsx
<ProductCard
  product={product}
  onClick={() => navigate(`/product/${product.id}`)}
  showActions
/>
```

### `ProductCardSkeleton`

Loading skeleton for ProductCard.

### `AuctionCard`

Auction display card with countdown.

**Props:**

- `auction: Auction` - Auction data
- `onClick?: () => void` - Card click handler
- `onBid?: () => void` - Bid button handler
- `showTimer?: boolean` - Show countdown timer
- `className?: string` - Additional CSS classes

### `AuctionCardSkeleton`

Loading skeleton for AuctionCard.

### `ShopCard`

Shop/seller display card.

**Props:**

- `shop: Shop` - Shop data
- `onClick?: () => void` - Card click handler
- `showStats?: boolean` - Show shop statistics
- `className?: string` - Additional CSS classes

### `ShopCardSkeleton`

Loading skeleton for ShopCard.

### `CategoryCard`

Category display card.

**Props:**

- `category: Category` - Category data
- `onClick?: () => void` - Card click handler
- `showCount?: boolean` - Show item count
- `className?: string` - Additional CSS classes

### `CategoryCardSkeleton`

Loading skeleton for CategoryCard.

### `BlogCard`

Blog post card.

**Props:**

- `post: BlogPost` - Blog post data
- `onClick?: () => void` - Card click handler
- `variant?: 'horizontal' | 'vertical'` - Card layout
- `className?: string` - Additional CSS classes

### `ReviewCard`

Review/rating card.

**Props:**

- `review: Review` - Review data
- `showProduct?: boolean` - Show product info
- `onHelpful?: () => void` - Helpful button handler
- `className?: string` - Additional CSS classes

### `StatsCard`

Statistics display card.

**Props:**

- `title: string` - Card title
- `value: string | number` - Stat value
- `change?: number` - Change percentage
- `trend?: 'up' | 'down'` - Trend direction
- `icon?: ReactNode` - Icon element
- `className?: string` - Additional CSS classes

---

## Table Components

Advanced table components with sorting, filtering, and pagination.

### `DataTable`

Full-featured data table.

**Props:**

- `columns: Column[]` - Table columns definition
- `data: any[]` - Table data
- `loading?: boolean` - Loading state
- `error?: Error` - Error state
- `pagination?: PaginationOptions` - Pagination config
- `sorting?: SortingOptions` - Sorting config
- `selection?: SelectionOptions` - Row selection config
- `onRowClick?: (row: any) => void` - Row click handler
- `className?: string` - Additional CSS classes

**Usage:**

```tsx
<DataTable
  columns={[
    { key: "name", label: "Name", sortable: true },
    { key: "email", label: "Email" },
    { key: "status", label: "Status" },
  ]}
  data={users}
  pagination={{ page: 1, pageSize: 10, total: 100 }}
  onRowClick={handleRowClick}
/>
```

### `ResponsiveTable`

Mobile-responsive table.

**Props:**

- `columns: Column[]` - Table columns
- `data: any[]` - Table data
- `breakpoint?: number` - Mobile breakpoint (px)
- `className?: string` - Additional CSS classes

### `ActionMenu`

Row action menu for tables.

**Props:**

- `actions: Array<{label: string, onClick: () => void}>` - Actions
- `className?: string` - Additional CSS classes

### `BulkActionBar`

Bulk action toolbar for selected rows.

**Props:**

- `selectedCount: number` - Number of selected rows
- `actions: Array<{label: string, onClick: () => void}>` - Bulk actions
- `onClear?: () => void` - Clear selection handler
- `className?: string` - Additional CSS classes

### `EmptyState`

Empty table state.

**Props:**

- `message?: string` - Empty message
- `icon?: ReactNode` - Icon element
- `action?: {label: string, onClick: () => void}` - Action button
- `className?: string` - Additional CSS classes

### `ErrorState`

Table error state.

**Props:**

- `error: Error` - Error object
- `onRetry?: () => void` - Retry handler
- `className?: string` - Additional CSS classes

### `PageState`

Generic page state handler.

**Props:**

- `loading?: boolean` - Loading state
- `error?: Error` - Error state
- `empty?: boolean` - Empty state
- `children: ReactNode` - Content when loaded
- `className?: string` - Additional CSS classes

### `InlineEditor`

Inline cell editor.

**Props:**

- `value: any` - Cell value
- `type: 'text' | 'number' | 'select'` - Editor type
- `onSave: (value: any) => void` - Save handler
- `options?: any[]` - Options for select type
- `className?: string` - Additional CSS classes

### `InlineEditRow`

Inline row editor.

**Props:**

- `row: any` - Row data
- `columns: Column[]` - Editable columns
- `onSave: (row: any) => void` - Save handler
- `onCancel?: () => void` - Cancel handler
- `className?: string` - Additional CSS classes

### `QuickCreateRow`

Quick add row inline.

**Props:**

- `columns: Column[]` - Table columns
- `onCreate: (data: any) => void` - Create handler
- `className?: string` - Additional CSS classes

### `TableCheckbox`

Table row selection checkbox.

**Props:**

- `checked?: boolean` - Checked state
- `onChange?: (checked: boolean) => void` - Change handler
- `className?: string` - Additional CSS classes

### `StatusBadge`

Status badge for table cells.

**Props:**

- `status: string` - Status value
- `variant?: 'success' | 'warning' | 'error' | 'info'` - Badge variant
- `className?: string` - Additional CSS classes

### `Skeleton`

Table skeleton loader.

**Props:**

- `rows?: number` - Number of skeleton rows
- `columns?: number` - Number of skeleton columns
- `className?: string` - Additional CSS classes

---

## Search & Filter Components

Components for searching and filtering data.

### `SearchBar`

Search input with autocomplete.

**Props:**

- `value?: string` - Search value
- `onChange?: (value: string) => void` - Change handler
- `onSearch?: (query: string) => void` - Search handler
- `placeholder?: string` - Placeholder text
- `suggestions?: string[]` - Autocomplete suggestions
- `loading?: boolean` - Loading state
- `className?: string` - Additional CSS classes

**Usage:**

```tsx
<SearchBar
  value={query}
  onChange={setQuery}
  onSearch={handleSearch}
  placeholder="Search products..."
  suggestions={recentSearches}
/>
```

### `FilterSidebar`

Filter sidebar with multiple filters.

**Props:**

- `filters: Filter[]` - Available filters
- `values: FilterValues` - Current filter values
- `onChange: (values: FilterValues) => void` - Change handler
- `onApply?: () => void` - Apply filters handler
- `onClear?: () => void` - Clear filters handler
- `className?: string` - Additional CSS classes

### `AdvancedFilters`

Advanced filter builder.

**Props:**

- `filters: Filter[]` - Available filters
- `value: FilterQuery` - Current filter query
- `onChange: (query: FilterQuery) => void` - Change handler
- `className?: string` - Additional CSS classes

### `FilterChips`

Active filter chips display.

**Props:**

- `filters: ActiveFilter[]` - Active filters
- `onRemove: (filterId: string) => void` - Remove filter handler
- `onClear?: () => void` - Clear all handler
- `className?: string` - Additional CSS classes

### `SortDropdown`

Sort options dropdown.

**Props:**

- `options: Array<{value: string, label: string}>` - Sort options
- `value?: string` - Current sort value
- `onChange: (value: string) => void` - Change handler
- `className?: string` - Additional CSS classes

---

## Pagination Components

Pagination components for data navigation.

### `SimplePagination`

Basic previous/next pagination.

**Props:**

- `page: number` - Current page
- `totalPages: number` - Total pages
- `onPageChange: (page: number) => void` - Page change handler
- `className?: string` - Additional CSS classes

**Usage:**

```tsx
<SimplePagination
  page={currentPage}
  totalPages={10}
  onPageChange={setCurrentPage}
/>
```

### `AdvancedPagination`

Full pagination with page numbers.

**Props:**

- `page: number` - Current page
- `pageSize: number` - Items per page
- `total: number` - Total items
- `onPageChange: (page: number) => void` - Page change handler
- `onPageSizeChange?: (size: number) => void` - Page size change handler
- `pageSizeOptions?: number[]` - Available page sizes
- `showTotal?: boolean` - Show total count
- `className?: string` - Additional CSS classes

### `CursorPagination`

Cursor-based pagination for infinite scroll.

**Props:**

- `hasMore: boolean` - Has more items flag
- `loading?: boolean` - Loading state
- `onLoadMore: () => void` - Load more handler
- `className?: string` - Additional CSS classes

---

## Selector Components

Specialized input selector components.

### `CategorySelector`

Hierarchical category selector.

**Props:**

- `categories: Category[]` - Available categories
- `value?: string` - Selected category ID
- `onChange: (categoryId: string) => void` - Change handler
- `placeholder?: string` - Placeholder text
- `className?: string` - Additional CSS classes

### `AddressSelector`

Saved addresses selector.

**Props:**

- `addresses: Address[]` - User addresses
- `value?: string` - Selected address ID
- `onChange: (addressId: string) => void` - Change handler
- `onAddNew?: () => void` - Add new address handler
- `className?: string` - Additional CSS classes

### `TagSelector`

Tag selection with autocomplete.

**Props:**

- `tags: string[]` - Available tags
- `selected: string[]` - Selected tags
- `onChange: (tags: string[]) => void` - Change handler
- `maxTags?: number` - Maximum selectable tags
- `className?: string` - Additional CSS classes

### `ColorSelector`

Color swatch selector.

**Props:**

- `colors: Color[]` - Available colors
- `value?: string` - Selected color
- `onChange: (color: string) => void` - Change handler
- `className?: string` - Additional CSS classes

### `SizeSelector`

Size variant selector.

**Props:**

- `sizes: Size[]` - Available sizes
- `value?: string` - Selected size
- `onChange: (size: string) => void` - Change handler
- `className?: string` - Additional CSS classes

### `DateRangeSelector`

Date range picker.

**Props:**

- `startDate?: Date` - Start date
- `endDate?: Date` - End date
- `onChange: (range: {start: Date, end: Date}) => void` - Change handler
- `presets?: DateRangePreset[]` - Quick select presets
- `className?: string` - Additional CSS classes

---

## Wizard Components

Multi-step wizard form components.

### `CategorySelectionStep`

Category selection wizard step.

**Props:**

- `categories: Category[]` - Available categories
- `selected?: string` - Selected category
- `onSelect: (categoryId: string) => void` - Select handler
- `onNext?: () => void` - Next step handler
- `className?: string` - Additional CSS classes

### `BusinessAddressStep`

Business address wizard step.

**Props:**

- `address?: Address` - Current address
- `onSubmit: (address: Address) => void` - Submit handler
- `onPrevious?: () => void` - Previous step handler
- `className?: string` - Additional CSS classes

### `ContactInfoStep`

Contact information wizard step.

**Props:**

- `contact?: ContactInfo` - Current contact info
- `onSubmit: (contact: ContactInfo) => void` - Submit handler
- `onPrevious?: () => void` - Previous step handler
- `className?: string` - Additional CSS classes

### `ShopSelectionStep`

Shop selection wizard step.

**Props:**

- `shops: Shop[]` - User shops
- `selected?: string` - Selected shop ID
- `onSelect: (shopId: string) => void` - Select handler
- `onCreateNew?: () => void` - Create new shop handler
- `className?: string` - Additional CSS classes

---

## Layout Components

Layout and structure components.

Export from [layout/](./layout) directory.

---

## Navigation Components

Navigation and menu components.

Export from [navigation/](./navigation) directory.

---

## Dashboard Components

Dashboard-specific components.

Export from [dashboard/](./dashboard) directory.

---

## Auction Components

Auction-related components.

Export from [auction/](./auction) directory.

---

## Product Components

Product-specific components.

Export from [product/](./product) directory.

---

## Shop Components

Shop/seller components.

Export from [shop/](./shop) directory.

---

## Category Components

Category-related components.

Export from [category/](./category) directory.

---

## Cart Components

Shopping cart components.

Export from [cart/](./cart) directory.

---

## Checkout Components

Checkout flow components.

Export from [checkout/](./checkout) directory.

---

## User Components

User profile and account components.

Export from [user/](./user) directory.

---

## Auth Components

Authentication components.

Export from [auth/](./auth) directory.

---

## Admin Components

Admin panel components.

Export from [admin/](./admin) directory.

---

## Seller Components

Seller dashboard components.

Export from [seller/](./seller) directory.

---

## Analytics Components

Analytics and reporting components.

Export from [analytics/](./analytics) directory.

---

## Events Components

Event handling components.

Export from [events/](./events) directory.

---

## Homepage Components

Homepage-specific components.

Export from [homepage/](./homepage) directory.

---

## FAQ Components

FAQ and help components.

Export from [faq/](./faq) directory.

---

## Legal Components

Legal document components.

Export from [legal/](./legal) directory.

---

## Mobile Components

Mobile-specific components.

Export from [mobile/](./mobile) directory.

---

## Media Components

Media handling components.

Export from [media/](./media) directory.

---

## Common Components

Common shared components.

Export from [common/](./common) directory.

---

## Skeleton Components

Loading skeleton components.

### `ProductCardSkeleton`

Loading skeleton for product cards.

### `ShopCardSkeleton`

Loading skeleton for shop cards.

### `CategoryCardSkeleton`

Loading skeleton for category cards.

### `AuctionCardSkeleton`

Loading skeleton for auction cards.

### `TableSkeleton`

Loading skeleton for tables.

---

## Component Guidelines

### Accessibility

- All interactive components have proper ARIA labels
- Keyboard navigation support
- Focus management
- Screen reader friendly

### Responsiveness

- Mobile-first design
- Breakpoint utilities from hooks
- Touch-friendly interactions
- Adaptive layouts

### Theming

- CSS token support
- Dark mode compatible
- Customizable via Tailwind
- Consistent design system

### Performance

- Lazy loading support
- Optimized re-renders
- Bundle size optimized
- Tree-shakeable exports

---

## Usage Examples

### Form with Validation

```tsx
import { FormInput, FormSelect, Button, Card } from "@letitrip/react-library";

function MyForm() {
  const [data, setData] = useState({});
  const [errors, setErrors] = useState({});

  return (
    <Card title="Create Product">
      <FormInput
        name="title"
        label="Product Title"
        value={data.title}
        onChange={(e) => setData({ ...data, title: e.target.value })}
        error={errors.title}
        required
      />
      <FormSelect
        name="category"
        label="Category"
        options={categories}
        value={data.category}
        onChange={(e) => setData({ ...data, category: e.target.value })}
        error={errors.category}
        required
      />
      <Button type="submit">Create</Button>
    </Card>
  );
}
```

### Data Table with Pagination

```tsx
import { DataTable, AdvancedPagination } from "@letitrip/react-library";

function UsersList() {
  const [page, setPage] = useState(1);
  const { data, loading } = useUsers({ page, pageSize: 10 });

  return (
    <>
      <DataTable
        columns={[
          { key: "name", label: "Name", sortable: true },
          { key: "email", label: "Email" },
          { key: "status", label: "Status" },
        ]}
        data={data.users}
        loading={loading}
        onRowClick={(user) => navigate(`/users/${user.id}`)}
      />
      <AdvancedPagination
        page={page}
        pageSize={10}
        total={data.total}
        onPageChange={setPage}
      />
    </>
  );
}
```

### Product Grid with Cards

```tsx
import { ProductCard, SimplePagination } from "@letitrip/react-library";

function ProductGrid() {
  const { data, page, setPage } = useProducts();

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {data.products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onClick={() => navigate(`/products/${product.id}`)}
            showActions
          />
        ))}
      </div>
      <SimplePagination
        page={page}
        totalPages={data.totalPages}
        onPageChange={setPage}
      />
    </>
  );
}
```

---

For more detailed documentation on specific component categories, see the individual documentation files in this directory.
