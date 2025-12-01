# HTML Tag Wrappers - Consistent Component Usage

> **Status**: 🔄 Phase 1 Complete, Phase 2 Pending
> **Priority**: 🔴 Highest - Migration Pending
> **Last Updated**: December 1, 2025
> **Related**: [Doc 29 - Image Wrapper Migration](./29-image-wrapper-migration.md), [Doc 30 - Component Library Consolidation](./30-component-library-consolidation.md)

## ⚠️ CRITICAL RULE: Use ONLY These Form Components

**DO NOT use:**

- ❌ `Input` from `@/components/ui/Input` (DEPRECATED)
- ❌ `Select` from `@/components/ui/Select` (DEPRECATED)
- ❌ `MobileFormInput` from `@/components/mobile` (DUPLICATE)
- ❌ `MobileFormSelect` from `@/components/mobile` (DUPLICATE)

**USE ONLY:**

- ✅ `FormField`, `FormInput`, `FormSelect`, `FormCheckbox`, etc. from `@/components/forms` (Doc 27 Standards)
- ✅ Specialized inputs like `MobileInput`, `PincodeInput`, `LinkInput` when you need their specific features

**See [Doc 30 - Component Library Consolidation](./30-component-library-consolidation.md) for complete migration guide.**

## Components Created ✅

| Component           | File                                         | Status |
| ------------------- | -------------------------------------------- | ------ |
| `FormLabel`         | `src/components/forms/FormLabel.tsx`         | ✅     |
| `FormField`         | `src/components/forms/FormField.tsx`         | ✅     |
| `FormInput`         | `src/components/forms/FormInput.tsx`         | ✅     |
| `FormTextarea`      | `src/components/forms/FormTextarea.tsx`      | ✅     |
| `FormSelect`        | `src/components/forms/FormSelect.tsx`        | ✅     |
| `FormCheckbox`      | `src/components/forms/FormCheckbox.tsx`      | ✅     |
| `FormRadio`         | `src/components/forms/FormRadio.tsx`         | ✅     |
| `FormRadioGroup`    | `src/components/forms/FormRadio.tsx`         | ✅     |
| `FormFieldset`      | `src/components/forms/FormFieldset.tsx`      | ✅     |
| `FormSection`       | `src/components/forms/FormSection.tsx`       | ✅     |
| `FormListInput`     | `src/components/forms/FormListInput.tsx`     | ✅     |
| `FormKeyValueInput` | `src/components/forms/FormKeyValueInput.tsx` | ✅     |
| `FormNumberInput`   | `src/components/forms/FormNumberInput.tsx`   | ✅     |
| `Heading`           | `src/components/ui/Heading.tsx`              | ✅     |
| `Text`              | `src/components/ui/Text.tsx`                 | ✅     |

## Phase 2: Migration (Future)

Pages that could benefit from using these form wrappers:

- `/seller/products/create/page.tsx` - 15+ labels/inputs
- `/seller/auctions/create/page.tsx` - 12+ labels/inputs
- `/admin/categories/create/page.tsx` - 8+ labels/inputs
- `/admin/blog/create/page.tsx` - 10+ labels/inputs
- `/login/page.tsx` - 3 fields
- `/register/page.tsx` - 5 fields
- `/contact/page.tsx` - 4 fields

## Overview

Replace raw HTML tags with custom wrapper components for consistent theming, accessibility, and easier maintenance. When a change is needed (e.g., adding `htmlFor` to labels), updating one wrapper file fixes all usages instead of 100+ files.

---

## Problem

Currently, many files use raw HTML tags directly:

```tsx
// ❌ Bad - Raw HTML scattered across 100+ files
<label className="block text-sm font-medium text-gray-700 mb-1">
  Product Name
</label>
<input
  type="text"
  className="w-full rounded-lg border border-gray-300 px-3 py-2..."
/>
```

Issues:

- **Inconsistent styling** - Each file has slightly different classes
- **Accessibility gaps** - Many labels missing `htmlFor`, inputs missing `id`
- **Hard to update** - Changing label style requires editing 100+ files
- **No dark mode** - Many raw tags don't include `dark:` classes
- **Duplication** - Same patterns repeated everywhere

---

## Solution

Create wrapper components that enforce consistency:

```tsx
// ✅ Good - Single component handles everything
<FormField label="Product Name" required>
  <FormInput
    value={name}
    onChange={(e) => setName(e.target.value)}
    placeholder="Enter product name"
  />
</FormField>
```

---

## Components to Create/Update

### Phase 1: Form Components (High Priority)

| Raw HTML                  | Wrapper Component | File                                    | Status |
| ------------------------- | ----------------- | --------------------------------------- | ------ |
| `<label>`                 | `FormLabel`       | `src/components/forms/FormLabel.tsx`    | ⬜     |
| `<input>`                 | `FormInput`       | Already exists, needs audit             | 🟡     |
| `<textarea>`              | `FormTextarea`    | Already exists, needs audit             | 🟡     |
| `<select>`                | `FormSelect`      | Already exists, needs audit             | 🟡     |
| `<label> + <input>`       | `FormField`       | `src/components/forms/FormField.tsx`    | ⬜     |
| `<input type="checkbox">` | `FormCheckbox`    | Already exists, needs audit             | 🟡     |
| `<input type="radio">`    | `FormRadio`       | `src/components/forms/FormRadio.tsx`    | ⬜     |
| `<fieldset>`              | `FormFieldset`    | `src/components/forms/FormFieldset.tsx` | ⬜     |

### Phase 2: Layout Components (Medium Priority)

| Raw HTML                         | Wrapper Component | File                              | Status |
| -------------------------------- | ----------------- | --------------------------------- | ------ |
| `<div className="card...">`      | `Card`            | `src/components/ui/Card.tsx`      | ⬜     |
| `<div className="container...">` | `Container`       | `src/components/ui/Container.tsx` | ⬜     |
| `<div className="grid...">`      | `Grid`            | `src/components/ui/Grid.tsx`      | ⬜     |
| `<div className="flex...">`      | `Flex` / `Stack`  | `src/components/ui/Stack.tsx`     | ⬜     |
| `<section>`                      | `Section`         | `src/components/ui/Section.tsx`   | ⬜     |

### Phase 3: Typography Components (Medium Priority)

| Raw HTML                      | Wrapper Component | File                                 | Status |
| ----------------------------- | ----------------- | ------------------------------------ | ------ |
| `<h1>` - `<h6>`               | `Heading`         | `src/components/ui/Heading.tsx`      | ⬜     |
| `<p>`                         | `Text`            | `src/components/ui/Text.tsx`         | ⬜     |
| `<span className="badge...">` | `Badge`           | Already exists                       | ✅     |
| `<a>` (external)              | `ExternalLink`    | `src/components/ui/ExternalLink.tsx` | ⬜     |

### Phase 4: Interactive Components (Low Priority)

| Raw HTML        | Wrapper Component | File                          | Status |
| --------------- | ----------------- | ----------------------------- | ------ |
| `<button>`      | `Button`          | Already exists                | ✅     |
| `<table>`       | `Table`           | `src/components/ui/Table.tsx` | ⬜     |
| `<ul>` / `<ol>` | `List`            | `src/components/ui/List.tsx`  | ⬜     |

---

## Component Specifications

### FormLabel

```tsx
interface FormLabelProps {
  htmlFor: string;
  children: React.ReactNode;
  required?: boolean;
  optional?: boolean;
  hint?: string;
  className?: string;
}

export const FormLabel: React.FC<FormLabelProps> = ({
  htmlFor,
  children,
  required,
  optional,
  hint,
  className,
}) => (
  <label
    htmlFor={htmlFor}
    className={cn(
      "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1",
      className
    )}
  >
    {children}
    {required && <span className="text-red-500 ml-1">*</span>}
    {optional && <span className="text-gray-400 ml-1">(optional)</span>}
    {hint && <span className="text-gray-400 text-xs ml-2">{hint}</span>}
  </label>
);
```

### FormField (Label + Input Combo)

```tsx
interface FormFieldProps {
  id?: string;
  label: string;
  required?: boolean;
  optional?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactElement;
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  id,
  label,
  required,
  optional,
  hint,
  error,
  children,
  className,
}) => {
  // Auto-generate ID if not provided
  const fieldId = id || `field-${label.toLowerCase().replace(/\s+/g, "-")}`;

  // Clone child to inject id
  const childWithId = React.cloneElement(children, {
    id: fieldId,
    "aria-invalid": !!error,
    "aria-describedby": error ? `${fieldId}-error` : undefined,
  });

  return (
    <div className={cn("space-y-1", className)}>
      <FormLabel
        htmlFor={fieldId}
        required={required}
        optional={optional}
        hint={hint}
      >
        {label}
      </FormLabel>
      {childWithId}
      {error && (
        <p
          id={`${fieldId}-error`}
          className="text-sm text-red-500 dark:text-red-400"
        >
          {error}
        </p>
      )}
    </div>
  );
};
```

### Heading

```tsx
interface HeadingProps {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  children: React.ReactNode;
  className?: string;
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span";
}

const sizeClasses = {
  1: "text-3xl md:text-4xl font-bold",
  2: "text-2xl md:text-3xl font-bold",
  3: "text-xl md:text-2xl font-semibold",
  4: "text-lg md:text-xl font-semibold",
  5: "text-base md:text-lg font-medium",
  6: "text-sm md:text-base font-medium",
};

export const Heading: React.FC<HeadingProps> = ({
  level = 2,
  children,
  className,
  as,
}) => {
  const Tag = as || `h${level}`;
  return (
    <Tag
      className={cn(
        sizeClasses[level],
        "text-gray-900 dark:text-white",
        className
      )}
    >
      {children}
    </Tag>
  );
};
```

### Text

```tsx
interface TextProps {
  size?: "xs" | "sm" | "base" | "lg" | "xl";
  color?: "default" | "muted" | "error" | "success";
  children: React.ReactNode;
  className?: string;
  as?: "p" | "span" | "div";
}

export const Text: React.FC<TextProps> = ({
  size = "base",
  color = "default",
  children,
  className,
  as = "p",
}) => {
  const Tag = as;
  return (
    <Tag
      className={cn(
        `text-${size}`,
        color === "default" && "text-gray-700 dark:text-gray-300",
        color === "muted" && "text-gray-500 dark:text-gray-400",
        color === "error" && "text-red-600 dark:text-red-400",
        color === "success" && "text-green-600 dark:text-green-400",
        className
      )}
    >
      {children}
    </Tag>
  );
};
```

---

## Files Needing Updates

### High-Impact Files (Most Raw HTML)

| File                                | Raw `<label>` | Raw `<input>` | Priority  |
| ----------------------------------- | ------------- | ------------- | --------- |
| `/seller/products/create/page.tsx`  | 15+           | 15+           | 🔴 High   |
| `/seller/auctions/create/page.tsx`  | 12+           | 12+           | 🔴 High   |
| `/admin/categories/create/page.tsx` | 8+            | 8+            | 🔴 High   |
| `/admin/blog/create/page.tsx`       | 10+           | 10+           | 🔴 High   |
| `/user/settings/page.tsx`           | 6+            | 6+            | 🟡 Medium |
| `/login/page.tsx`                   | 3             | 3             | 🟡 Medium |
| `/register/page.tsx`                | 5             | 5             | 🟡 Medium |
| `/contact/page.tsx`                 | 4             | 4             | 🟡 Medium |
| `/checkout/page.tsx`                | 8+            | 8+            | 🟡 Medium |

---

## Migration Strategy

### Step 1: Create Components

1. Create `FormLabel.tsx`
2. Create `FormField.tsx`
3. Create `FormRadio.tsx`
4. Create `FormFieldset.tsx`
5. Create `Heading.tsx`
6. Create `Text.tsx`

### Step 2: Audit Existing Components

1. Ensure `FormInput` has proper `id` support
2. Ensure `FormTextarea` has proper `id` support
3. Ensure `FormSelect` has proper `id` support
4. Ensure `FormCheckbox` has proper `htmlFor` support

### Step 3: Migrate High-Priority Files

1. Update create/edit pages for products, auctions
2. Update admin create/edit pages
3. Update auth pages (login, register)

### Step 4: Migrate Remaining Files

1. Update user settings pages
2. Update checkout flow
3. Update any remaining forms

---

## Search Patterns for Raw HTML

```powershell
# Find raw labels without htmlFor
grep -r "className=\".*text-sm font-medium" --include="*.tsx" | grep "<label"

# Find raw inputs
grep -r "<input" --include="*.tsx" | grep -v "FormInput" | grep -v "type=\"hidden\""

# Find raw textareas
grep -r "<textarea" --include="*.tsx" | grep -v "FormTextarea"

# Find raw selects
grep -r "<select" --include="*.tsx" | grep -v "FormSelect"
```

---

## Benefits

| Benefit                     | Before                                    | After           |
| --------------------------- | ----------------------------------------- | --------------- |
| Add `htmlFor` to all labels | Edit 100+ files                           | Edit 1 file     |
| Change label font size      | Edit 100+ files                           | Edit 1 file     |
| Add dark mode to labels     | Edit 100+ files                           | Edit 1 file     |
| Add error styling           | Copy-paste everywhere                     | Built-in        |
| Accessibility               | Manual, inconsistent                      | Automatic       |
| Required indicator          | `<span className="text-red-500">*</span>` | `required` prop |

---

## Related Documents

- **Doc 03**: Form UX Improvements
- **Doc 04**: Component Consolidation
- **Doc 25**: Wizard Forms Mobile
