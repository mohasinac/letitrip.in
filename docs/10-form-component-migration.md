# Form Component Consolidation

> **Status**: ✅ Complete
> **Priority**: Medium
> **Created**: November 30, 2025
> **Last Updated**: November 30, 2025

## Summary

All form components have been consolidated into a single unified set in `/src/components/forms/`:

| Component      | Location                                | Features                                         |
| -------------- | --------------------------------------- | ------------------------------------------------ |
| `FormInput`    | `src/components/forms/FormInput.tsx`    | Responsive, dark mode, icons, addons, char count |
| `FormTextarea` | `src/components/forms/FormTextarea.tsx` | Responsive, dark mode, char count, resizable     |
| `FormSelect`   | `src/components/forms/FormSelect.tsx`   | Responsive, dark mode, placeholder, chevron      |

## Deleted Components

The following duplicate components have been removed:

### From `/src/components/ui/`

- ~~`Input.tsx`~~ → Use `FormInput`
- ~~`Input.test.tsx`~~
- ~~`Textarea.tsx`~~ → Use `FormTextarea`
- ~~`Textarea.test.tsx`~~
- ~~`Select.tsx`~~ → Use `FormSelect`
- ~~`Select.test.tsx`~~

### From `/src/components/mobile/`

- ~~`MobileFormInput.tsx`~~ → Use `FormInput`
- ~~`MobileFormInput.test.tsx`~~
- ~~`MobileFormSelect.tsx`~~ → Use `FormSelect`
- ~~`MobileFormSelect.test.tsx`~~
- ~~`MobileTextarea.tsx`~~ → Use `FormTextarea`

## Usage

### Import

```tsx
import { FormInput, FormTextarea, FormSelect } from "@/components/forms";
```

### FormInput

```tsx
<FormInput
  label="Email Address"
  type="email"
  placeholder="you@example.com"
  error={errors.email}
  helperText="We'll never share your email"
  leftIcon={<Mail className="w-5 h-5" />}
  required
/>
```

### FormTextarea

```tsx
<FormTextarea
  label="Message"
  placeholder="Your message..."
  rows={4}
  maxLength={500}
  showCharCount
  error={errors.message}
/>
```

### FormSelect

```tsx
<FormSelect
  label="Country"
  options={[
    { value: "IN", label: "India" },
    { value: "US", label: "United States" },
  ]}
  placeholder="Select a country"
  error={errors.country}
/>
```

## Props

### Common Props (All Components)

| Prop            | Type      | Default | Description                   |
| --------------- | --------- | ------- | ----------------------------- |
| `label`         | `string`  | -       | Label text                    |
| `error`         | `string`  | -       | Error message                 |
| `helperText`    | `string`  | -       | Helper text below input       |
| `fullWidth`     | `boolean` | `true`  | Full width container          |
| `compact`       | `boolean` | `false` | Smaller padding for dense UIs |
| `showErrorIcon` | `boolean` | `true`  | Show error icon with message  |

### FormInput Specific

| Prop            | Type        | Default | Description                        |
| --------------- | ----------- | ------- | ---------------------------------- |
| `leftIcon`      | `ReactNode` | -       | Icon on left side                  |
| `rightIcon`     | `ReactNode` | -       | Icon on right side                 |
| `leftAddon`     | `string`    | -       | Text addon on left (e.g., "$")     |
| `rightAddon`    | `string`    | -       | Text addon on right (e.g., ".com") |
| `showCharCount` | `boolean`   | `false` | Show character count               |

### FormTextarea Specific

| Prop            | Type      | Default | Description            |
| --------------- | --------- | ------- | ---------------------- |
| `rows`          | `number`  | `4`     | Number of visible rows |
| `showCharCount` | `boolean` | `false` | Show character count   |

### FormSelect Specific

| Prop          | Type                 | Default  | Description      |
| ------------- | -------------------- | -------- | ---------------- |
| `options`     | `FormSelectOption[]` | required | Array of options |
| `placeholder` | `string`             | -        | Placeholder text |

## Responsive Behavior

All components are responsive by default:

- **Mobile (< md)**: Touch-optimized with 48px min-height, larger padding, base text size
- **Desktop (≥ md)**: Compact sizing, smaller padding, small text size

Use `compact={true}` to force compact sizing on all screen sizes.

## Migrated Files

The following files were updated to use the new components:

- `src/app/login/page.tsx`
- `src/app/register/page.tsx`
- `src/app/contact/page.tsx`
- `src/app/checkout/page.tsx`
- `src/app/user/settings/page.tsx`
- `src/components/checkout/AddressForm.tsx`
- `src/components/seller/ShopForm.tsx`
- `src/components/admin/CategoryForm.tsx`
