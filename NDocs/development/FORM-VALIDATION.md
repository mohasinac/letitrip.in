# Form Validation Integration Guide

## Overview

The validation infrastructure is now complete and ready to use. This guide shows how to integrate validation into existing forms incrementally.

## What's Available

### Validation Schemas

- ✅ `product.schema.ts` - Product CRUD with step-by-step validation
- ✅ `auction.schema.ts` - Auction, bid, auto-bid validation
- ✅ `user.schema.ts` - Profile, password, auth validation
- ✅ `address.schema.ts` - Address validation (Indian format)
- ✅ `category.schema.ts` - Category CRUD validation
- ✅ `shop.schema.ts` - Shop settings validation
- ✅ `review.schema.ts` - Review and reply validation

### Helper Utilities

- ✅ `helpers.ts` - Validation helper functions
- ✅ `FieldError.tsx` - Reusable error display component

## Integration Approaches

### Approach 1: Minimal Integration (Quick Win)

Add validation to critical fields without refactoring the entire form.

```tsx
import { useState } from "react";
import { validateStep, getFieldError } from "@/lib/validations/helpers";
import { productStep1Schema } from "@/lib/validations/product.schema";
import { FieldError } from "@/components/common/FieldError";

function MyForm() {
  const [formData, setFormData] = useState({ name: "", price: 0 });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Validate on blur
  const handleBlur = (fieldName: string) => {
    const stepErrors = validateStep(productStep1Schema, formData);
    setErrors((prev) => ({
      ...prev,
      [fieldName]: stepErrors[fieldName] || "",
    }));
  };

  // Validate before next step
  const handleNext = () => {
    const stepErrors = validateStep(productStep1Schema, formData);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }
    // Proceed to next step...
  };

  return (
    <div>
      <input
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        onBlur={() => handleBlur("name")}
        className={errors.name ? "border-red-500" : "border-gray-300"}
      />
      <FieldError error={errors.name} />

      <button onClick={handleNext}>Next</button>
    </div>
  );
}
```

### Approach 2: Full Integration with react-hook-form

For new forms or major refactors, use react-hook-form with Zod resolver.

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  productSchema,
  type ProductFormData,
} from "@/lib/validations/product.schema";
import { FieldError } from "@/components/common/FieldError";

function ProductForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    mode: "onBlur",
  });

  const onSubmit = async (data: ProductFormData) => {
    // Form is valid, submit...
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("name")} />
      <FieldError error={errors.name?.message} />

      <input {...register("price", { valueAsNumber: true })} />
      <FieldError error={errors.price?.message} />

      <button type="submit">Submit</button>
    </form>
  );
}
```

### Approach 3: Wizard Forms with Step-by-Step Validation

Use step-specific schemas for multi-step wizards.

```tsx
import { useState } from "react";
import { validateStep } from "@/lib/validations/helpers";
import {
  productStep1Schema,
  productStep2Schema,
  productStep3Schema,
} from "@/lib/validations/product.schema";

const STEP_SCHEMAS = [
  productStep1Schema,
  productStep2Schema,
  productStep3Schema,
];

function WizardForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({...});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleNext = () => {
    const currentSchema = STEP_SCHEMAS[currentStep];
    const stepErrors = validateStep(currentSchema, formData);

    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      // Optionally scroll to first error
      return;
    }

    setErrors({});
    setCurrentStep(currentStep + 1);
  };

  return (
    <div>
      {/* Step content */}
      <button onClick={handleNext}>Next</button>
    </div>
  );
}
```

## Sticky Action Buttons

Add persistent Save/Create buttons for better UX:

```tsx
<div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 shadow-lg">
  <div className="max-w-4xl mx-auto flex justify-between">
    <button
      type="button"
      onClick={handlePrevious}
      disabled={currentStep === 1}
      className="btn btn-secondary"
    >
      Previous
    </button>

    <button
      type="button"
      onClick={currentStep === STEPS.length ? handleSubmit : handleNext}
      disabled={loading}
      className="btn btn-primary"
    >
      {loading
        ? "Saving..."
        : currentStep === STEPS.length
        ? "Create Product"
        : "Next"}
    </button>
  </div>
</div>
```

## Best Practices

### 1. Error Display

- Show errors below the field
- Use red border for invalid fields
- Clear error when user starts fixing
- Show validation hint text when no error

### 2. Validation Timing

- `onBlur`: Validate when user leaves field (recommended)
- `onChange`: Real-time validation (can be annoying)
- `onSubmit`: Final validation before submission (required)

### 3. User Experience

- Don't block user from moving forward initially
- Show errors when they try to proceed to next step
- Clear errors when user fixes the issue
- Provide helpful error messages

### 4. Performance

- Debounce async validation (slug uniqueness, etc.)
- Use step-specific schemas for wizard validation
- Validate only changed fields when possible

## Priority Order for Integration

Based on user impact, integrate validation in this order:

1. **Product Creation** (seller workflow) - Step 1-2 validation
2. **Auction Creation** (seller workflow) - Bid rules validation
3. **User Registration** - Password strength, email format
4. **Address Forms** - Indian address format validation
5. **Profile Settings** - Name, phone validation
6. **Review Forms** - Rating, comment validation
7. **Category Creation** (admin) - Name, slug validation
8. **Shop Settings** - Contact info validation

## Status

✅ **Infrastructure Complete** - All schemas and helpers ready  
📋 **Integration Optional** - Apply incrementally based on priority  
✅ **Zero Breaking Changes** - Existing forms continue to work  
✅ **0 TypeScript Errors** - All validation code compiles successfully

## Next Steps

The validation system is ready to use. Integration can be done:

- **Immediately**: For new forms being built
- **Incrementally**: Add to existing forms based on priority
- **Later**: When UX improvements are prioritized

The forms work correctly without validation - adding it is purely a UX enhancement.
