# Component Library Consolidation

> **Status**: 🔴 Critical - Migration Required
> **Priority**: 🔴 Highest
> **Last Updated**: December 1, 2025
> **Related**: [Doc 27 - HTML Tag Wrappers](./27-html-tag-wrappers.md), [Doc 04 - Component Consolidation](./04-component-consolidation.md)

## Problem

We have **3-4 different input components** doing essentially the same thing:

```
src/components/
├── ui/
│   ├── Input.tsx                    ❌ OLD - Desktop-focused
│   └── Select.tsx                   ❌ OLD - Desktop-focused
├── mobile/
│   ├── MobileFormInput.tsx          ❌ DUPLICATE - Just larger size
│   └── MobileFormSelect.tsx         ❌ DUPLICATE - Just larger size
├── forms/
│   ├── FormInput.tsx                ✅ KEEP - Doc 27 standard
│   ├── FormSelect.tsx               ✅ KEEP - Doc 27 standard
│   ├── FormField.tsx                ✅ KEEP - Wrapper with label
│   └── ...other form wrappers       ✅ KEEP - Doc 27 standards
└── common/
    ├── MobileInput.tsx              ✅ KEEP - Specialized (phone + country code)
    ├── PincodeInput.tsx             ✅ KEEP - Specialized (6-digit + lookup)
    ├── LinkInput.tsx                ✅ KEEP - Specialized (URL validation)
    ├── SlugInput.tsx                ✅ KEEP - Specialized (auto-slugify)
    └── TagInput.tsx                 ✅ KEEP - Specialized (multi-value tags)
```

**Issues:**

- `Input.tsx` vs `MobileFormInput.tsx` vs `FormInput.tsx` - **3 components doing same work**
- `Select.tsx` vs `MobileFormSelect.tsx` vs `FormSelect.tsx` - **3 components doing same work**
- Confusing imports: developers don't know which one to use
- Inconsistent styling and behavior across pages
- Maintenance nightmare: fix bug in 3 places

---

## Solution: Single Source of Truth

**Rule: Use ONLY Doc 27 form wrappers + specialized inputs when needed**

### Standard Form Inputs (Doc 27)

```tsx
// ✅ CORRECT - Use Doc 27 standardized components
import {
  FormField,
  FormInput,
  FormSelect,
  FormCheckbox,
} from "@/components/forms";

<FormField label="Email" required error={errors.email}>
  <FormInput
    type="email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    placeholder="you@example.com"
  />
</FormField>;
```

### Specialized Inputs (When Needed)

```tsx
// ✅ CORRECT - Use specialized component for specific features
import { MobileInput } from "@/components/common/MobileInput";

<FormField label="Phone Number" required error={errors.phone}>
  <MobileInput
    value={phone}
    onChange={setPhone}
    countryCode={countryCode}
    onCountryCodeChange={setCountryCode}
  />
</FormField>;
```

---

## Components to DELETE

### Phase 1: Delete Duplicate Generic Inputs

| Component                                    | Status    | Reason                                     | Migration Path                      |
| -------------------------------------------- | --------- | ------------------------------------------ | ----------------------------------- |
| `src/components/ui/Input.tsx`                | ❌ DELETE | Replaced by `FormInput.tsx`                | Replace with `FormField+FormInput`  |
| `src/components/ui/Select.tsx`               | ❌ DELETE | Replaced by `FormSelect.tsx`               | Replace with `FormField+FormSelect` |
| `src/components/mobile/MobileFormInput.tsx`  | ❌ DELETE | Duplicate of `FormInput` (just size="lg")  | Use `FormInput` (responsive now)    |
| `src/components/mobile/MobileFormSelect.tsx` | ❌ DELETE | Duplicate of `FormSelect` (just size="lg") | Use `FormSelect` (responsive now)   |

### Components to KEEP (Specialized)

| Component               | Purpose                                  | Keep?  |
| ----------------------- | ---------------------------------------- | ------ |
| `FormInput.tsx`         | Standard text input (Doc 27)             | ✅ YES |
| `FormSelect.tsx`        | Standard dropdown (Doc 27)               | ✅ YES |
| `FormField.tsx`         | Label + Input wrapper (Doc 27)           | ✅ YES |
| `FormCheckbox.tsx`      | Standard checkbox (Doc 27)               | ✅ YES |
| `FormTextarea.tsx`      | Standard textarea (Doc 27)               | ✅ YES |
| `FormRadio.tsx`         | Standard radio button (Doc 27)           | ✅ YES |
| `MobileInput.tsx`       | Phone + country code picker              | ✅ YES |
| `PincodeInput.tsx`      | 6-digit + postal code lookup             | ✅ YES |
| `LinkInput.tsx`         | URL validation + external link indicator | ✅ YES |
| `SlugInput.tsx`         | Auto-slugify from title                  | ✅ YES |
| `TagInput.tsx`          | Multi-value tag management               | ✅ YES |
| `FormNumberInput.tsx`   | Number input with increment/decrement    | ✅ YES |
| `FormListInput.tsx`     | Array of string values                   | ✅ YES |
| `FormKeyValueInput.tsx` | Key-value pair management                | ✅ YES |

---

## Migration Strategy

### Step 1: Update FormInput to be Responsive (Make Mobile-Ready)

**File**: `src/components/forms/FormInput.tsx`

Add responsive sizing so it works perfectly on mobile:

```tsx
export interface FormInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  size?: "sm" | "md" | "lg"; // Add size prop
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ size = "md", className, type = "text", ...props }, ref) => {
    const sizeClasses = {
      sm: "h-9 text-sm px-3",
      md: "h-10 text-base px-3",
      lg: "h-12 text-base px-4 md:h-10 md:px-3", // Larger on mobile, normal on desktop
    };

    return (
      <input
        ref={ref}
        type={type}
        inputMode={getInputMode(type)} // Already has mobile keyboard support
        className={cn(
          "w-full rounded-lg border border-gray-300 dark:border-gray-600",
          "bg-white dark:bg-gray-800 text-gray-900 dark:text-white",
          "focus:ring-2 focus:ring-blue-500 focus:border-transparent",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "placeholder:text-gray-400 dark:placeholder:text-gray-500",
          sizeClasses[size],
          className
        )}
        {...props}
      />
    );
  }
);
```

### Step 2: Replace ui/Input.tsx Usage

**Before:**

```tsx
import { Input } from "@/components/ui/Input";

<Input
  label="Email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  error={errors.email}
/>;
```

**After:**

```tsx
import { FormField, FormInput } from "@/components/forms";

<FormField label="Email" error={errors.email}>
  <FormInput value={email} onChange={(e) => setEmail(e.target.value)} />
</FormField>;
```

### Step 3: Replace mobile/MobileFormInput.tsx Usage

**Before:**

```tsx
import { MobileFormInput } from "@/components/mobile";

<MobileFormInput
  label="Email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  error={errors.email}
/>;
```

**After:**

```tsx
import { FormField, FormInput } from "@/components/forms";

<FormField label="Email" error={errors.email}>
  <FormInput
    size="lg" // Use lg size for mobile-first
    value={email}
    onChange={(e) => setEmail(e.target.value)}
  />
</FormField>;
```

**Or use responsive default (recommended):**

```tsx
<FormField label="Email" error={errors.email}>
  <FormInput
    // No size prop = uses "md" which is already responsive
    value={email}
    onChange={(e) => setEmail(e.target.value)}
  />
</FormField>
```

### Step 4: Pages to Migrate

| File                                      | Current           | Replace With              | Priority  |
| ----------------------------------------- | ----------------- | ------------------------- | --------- |
| `src/app/login/page.tsx`                  | `Input` (ui)      | `FormField` + `FormInput` | 🔴 High   |
| `src/app/register/page.tsx`               | `Input` (ui)      | `FormField` + `FormInput` | 🔴 High   |
| `src/app/contact/page.tsx`                | `Input` (ui)      | `FormField` + `FormInput` | 🔴 High   |
| `src/app/user/settings/page.tsx`          | `Input` (ui)      | `FormField` + `FormInput` | 🟡 Medium |
| `src/app/checkout/page.tsx`               | `MobileFormInput` | `FormField` + `FormInput` | 🟡 Medium |
| `src/app/seller/products/create/page.tsx` | Mixed             | `FormField` + `FormInput` | 🟡 Medium |
| `src/app/seller/auctions/create/page.tsx` | Mixed             | `FormField` + `FormInput` | 🟡 Medium |
| `src/app/admin/*/create/page.tsx`         | Mixed             | `FormField` + `FormInput` | 🟢 Low    |

### Step 5: Delete Old Components

After all migrations complete:

```bash
# Delete duplicate components
rm src/components/ui/Input.tsx
rm src/components/ui/Input.test.tsx
rm src/components/ui/Select.tsx
rm src/components/ui/Select.test.tsx
rm src/components/mobile/MobileFormInput.tsx
rm src/components/mobile/MobileFormInput.test.tsx
rm src/components/mobile/MobileFormSelect.tsx
rm src/components/mobile/MobileFormSelect.test.tsx
```

### Step 6: Add ESLint Rules to Prevent Future Issues

**File**: `eslint.config.mjs`

```js
{
  rules: {
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: ['**/components/ui/Input', '**/components/ui/Select'],
            message: 'Use FormInput/FormSelect from @/components/forms instead (Doc 27)',
          },
          {
            group: ['**/components/mobile/MobileFormInput', '**/components/mobile/MobileFormSelect'],
            message: 'Use FormInput/FormSelect from @/components/forms instead (Doc 27)',
          },
        ],
      },
    ],
  },
}
```

---

## Decision Matrix: Which Component to Use?

### Text Input

| Need                           | Component      | Why                               |
| ------------------------------ | -------------- | --------------------------------- |
| Standard text/email/password   | `FormInput`    | Doc 27 standard                   |
| Phone number with country code | `MobileInput`  | Has country picker + validation   |
| 6-digit postal code            | `PincodeInput` | Has postal lookup API             |
| URL with validation            | `LinkInput`    | Shows external/internal indicator |
| Auto-slugify from title        | `SlugInput`    | Auto-generates slug               |

### Dropdown/Select

| Need                   | Component          | Why                         |
| ---------------------- | ------------------ | --------------------------- |
| Standard dropdown      | `FormSelect`       | Doc 27 standard             |
| Category with search   | `CategorySelector` | Has category tree + search  |
| State/Province picker  | `StateSelector`    | Pre-populated Indian states |
| Shop picker for seller | `ShopSelector`     | Loads user's shops          |

### Multi-Value Inputs

| Need            | Component           | Why                        |
| --------------- | ------------------- | -------------------------- |
| Tags/keywords   | `TagInput`          | Add/remove tags with chips |
| List of strings | `FormListInput`     | Array management           |
| Key-value pairs | `FormKeyValueInput` | Object properties          |

### Number Inputs

| Need                    | Component                           | Why                     |
| ----------------------- | ----------------------------------- | ----------------------- |
| Standard number         | `FormInput` with `type="number"`    | Simple numeric input    |
| Number with +/- buttons | `FormNumberInput`                   | Has increment/decrement |
| Currency/Price          | `FormNumberInput` with `prefix="₹"` | Formatted currency      |

---

## Testing Strategy

### Unit Tests

```tsx
describe("FormInput Migration", () => {
  it("should have same API as old Input component", () => {
    const { container } = render(
      <FormField label="Email" error="Invalid">
        <FormInput value="test" onChange={jest.fn()} />
      </FormField>
    );

    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByText("Invalid")).toBeInTheDocument();
  });

  it("should support mobile-optimized size", () => {
    render(<FormInput size="lg" />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveClass("h-12"); // Larger on mobile
  });
});
```

### E2E Tests

After migration, verify:

- [ ] Login form works on mobile and desktop
- [ ] Register form works on mobile and desktop
- [ ] Contact form submits correctly
- [ ] Product creation wizard works
- [ ] Auction creation wizard works
- [ ] All forms validate correctly
- [ ] Dark mode works on all forms
- [ ] Touch targets are 44px+ on mobile

---

## Rollout Plan

### Week 1: Preparation

- [x] Create this document
- [ ] Update `FormInput.tsx` to be responsive
- [ ] Update `FormSelect.tsx` to be responsive
- [ ] Add size variants (sm/md/lg)
- [ ] Update tests for form components

### Week 2: High Priority Pages

- [ ] Migrate `/login/page.tsx`
- [ ] Migrate `/register/page.tsx`
- [ ] Migrate `/contact/page.tsx`
- [ ] Test on mobile and desktop
- [ ] Deploy to staging

### Week 3: Medium Priority Pages

- [ ] Migrate user settings
- [ ] Migrate checkout
- [ ] Migrate seller product creation
- [ ] Migrate seller auction creation
- [ ] Test on mobile and desktop

### Week 4: Admin & Cleanup

- [ ] Migrate all admin create/edit pages
- [ ] Update all tests
- [ ] Delete old components
- [ ] Add ESLint rules
- [ ] Update documentation

---

## Success Metrics

- ✅ Zero usage of `ui/Input.tsx`
- ✅ Zero usage of `ui/Select.tsx`
- ✅ Zero usage of `mobile/MobileFormInput.tsx`
- ✅ Zero usage of `mobile/MobileFormSelect.tsx`
- ✅ All forms use Doc 27 standard components
- ✅ ESLint prevents new usage of old components
- ✅ All tests pass
- ✅ Mobile forms have 44px+ touch targets
- ✅ Dark mode works on all forms

---

## Related Documents

- [Doc 27 - HTML Tag Wrappers](./27-html-tag-wrappers.md) - Standard form components
- [Doc 04 - Component Consolidation](./04-component-consolidation.md) - Earlier consolidation work
- [Doc 28 - Component Splitting](./28-component-splitting.md) - Breaking down large components
- [Doc 29 - Image Wrapper Migration](./29-image-wrapper-migration.md) - Similar migration pattern

---

## FAQs

**Q: Why not just update `Input.tsx` instead of deleting it?**  
A: `FormInput.tsx` is already the standard (Doc 27). Having both creates confusion about which to use.

**Q: What about existing tests that use `Input.tsx`?**  
A: Update them to use `FormField + FormInput`. The API is nearly identical.

**Q: Can I still use specialized inputs like `MobileInput`?**  
A: Yes! Specialized inputs with unique features (country picker, postal lookup) are kept. Only generic duplicates are removed.

**Q: What if I need a quick input without a label?**  
A: Use `FormInput` directly without `FormField` wrapper:

```tsx
<FormInput placeholder="Search..." />
```

**Q: How do I migrate a complex form?**  
A: Do it incrementally:

1. Replace one field at a time
2. Test after each change
3. Commit working changes
4. Continue to next field
