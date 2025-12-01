# Mobile-Friendly Wizard Forms

> **Status**: ✅ Phase 1 & 2 Complete (Components Created & Integrated)
> **Priority**: High
> **Last Updated**: January 2025

## Overview

This document outlines requirements for making wizard forms (product creation, auction creation, etc.) fully mobile-friendly with improved UX patterns.

## Completed ✅

### Phase 1: Components Created

| Component         | File                                       | Status      |
| ----------------- | ------------------------------------------ | ----------- |
| `WizardSteps`     | `src/components/forms/WizardSteps.tsx`     | ✅ Complete |
| `WizardActionBar` | `src/components/forms/WizardActionBar.tsx` | ✅ Complete |
| `WizardForm`      | `src/components/forms/WizardForm.tsx`      | ✅ Complete |

### Phase 2: Pages Integrated

| Page           | File                               | Status      |
| -------------- | ---------------------------------- | ----------- |
| Create Product | `/seller/products/create/page.tsx` | ✅ Complete |
| Create Auction | `/seller/auctions/create/page.tsx` | ✅ Complete |

### Component Features

**WizardSteps:**

- Horizontal scroll with touch support
- Auto-scroll to current step
- Gradient fade indicators at edges
- Step states: current, completed, error, pending
- Click to navigate to any step
- Two variants: "numbered" and "pills"
- Dark mode support

**WizardActionBar:**

- Fixed position above mobile bottom nav
- Save Draft, Validate, Submit buttons
- Submit button changes based on form validity
- Loading states for async actions
- Dark mode support

## Remaining Pages (Future)

| Page                  | File                                | Priority |
| --------------------- | ----------------------------------- | -------- |
| Create Shop           | `/seller/my-shops/create/page.tsx`  | 🟡 Med   |
| Admin Category Create | `/admin/categories/create/page.tsx` | 🟢 Low   |
| Admin Blog Create     | `/admin/blog/create/page.tsx`       | 🟢 Low   |

---

## Current Issues

| Issue                                       | Impact                                            | Priority  |
| ------------------------------------------- | ------------------------------------------------- | --------- |
| Steps not horizontally scrollable on mobile | Users can't see all steps on small screens        | 🔴 High   |
| Submit button only on last step             | Users must complete all steps before saving       | 🔴 High   |
| No validation button                        | Users can't check form validity before submitting | 🟡 Medium |
| Steps are sequential only                   | Users can't jump to a specific step               | 🟡 Medium |
| Long forms on mobile                        | Hard to scroll through 6+ step content            | 🟡 Medium |
| No progress persistence                     | Leaving page loses all progress                   | 🟢 Low    |

---

## Affected Wizard Pages

| Page                  | File                                     | Current Steps    |
| --------------------- | ---------------------------------------- | ---------------- |
| Create Product        | `/seller/products/create/page.tsx`       | 6 steps          |
| Edit Product          | `/seller/products/[slug]/edit/page.tsx`  | Tabbed (similar) |
| Create Auction        | `/seller/auctions/create/page.tsx`       | 5 steps          |
| Edit Auction          | `/seller/auctions/[slug]/edit/page.tsx`  | Tabbed           |
| Create Shop           | `/seller/my-shops/create/page.tsx`       | Multi-step       |
| Admin Category Create | `/admin/categories/create/page.tsx`      | Multi-step       |
| Admin Category Edit   | `/admin/categories/[slug]/edit/page.tsx` | Tabbed           |
| Admin Blog Create     | `/admin/blog/create/page.tsx`            | Multi-step       |
| Admin Blog Edit       | `/admin/blog/[slug]/edit/page.tsx`       | Tabbed           |

---

## Required Improvements

### 1. Horizontally Scrollable Step Indicator

**Current Behavior:**

- Steps overflow and get cut off on mobile
- No indication that more steps exist

**Required Behavior:**

- Steps should be horizontally scrollable with touch
- Show gradient fade at edges to indicate more content
- Add left/right scroll arrows on larger mobile screens
- Current step should auto-scroll into view

```tsx
// Mobile-friendly step indicator component
<div className="relative">
  {/* Gradient fade left */}
  <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />

  {/* Scrollable steps */}
  <div
    className="flex gap-2 overflow-x-auto scrollbar-hide px-8 py-2 snap-x snap-mandatory"
    style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
  >
    {steps.map((step, index) => (
      <button
        key={step.id}
        onClick={() => setCurrentStep(index)}
        className={cn(
          "flex-shrink-0 snap-center px-4 py-2 rounded-full text-sm font-medium",
          "transition-colors touch-manipulation",
          currentStep === index
            ? "bg-blue-600 text-white"
            : completedSteps.includes(index)
            ? "bg-green-100 text-green-800"
            : "bg-gray-100 text-gray-600"
        )}
      >
        <span className="flex items-center gap-2">
          {completedSteps.includes(index) ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <span className="w-5 h-5 rounded-full border-2 flex items-center justify-center text-xs">
              {index + 1}
            </span>
          )}
          <span className="whitespace-nowrap">{step.name}</span>
        </span>
      </button>
    ))}
  </div>

  {/* Gradient fade right */}
  <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
</div>
```

### 2. Always-Visible Action Buttons

**Current Behavior:**

- Create/Submit button only appears on last step
- No way to save progress

**Required Behavior:**

- Sticky footer with action buttons visible on all steps
- Buttons: "Save Draft", "Validate", "Create/Finish"
- Visual indication of form validity

```tsx
// Sticky action footer
<div className="fixed bottom-16 lg:bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 z-40">
  <div className="max-w-4xl mx-auto flex gap-3">
    {/* Validate button */}
    <button
      onClick={handleValidate}
      className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
    >
      <CheckCircle className="w-4 h-4 mr-2 inline" />
      Validate
    </button>

    {/* Save Draft */}
    <button
      onClick={handleSaveDraft}
      disabled={saving}
      className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
    >
      <Save className="w-4 h-4 mr-2 inline" />
      Save Draft
    </button>

    {/* Create/Finish - changes based on form validity */}
    <button
      onClick={handleSubmit}
      disabled={!isValid || submitting}
      className={cn(
        "flex-1 px-4 py-2 rounded-lg text-sm font-medium text-white",
        isValid
          ? "bg-green-600 hover:bg-green-700"
          : "bg-gray-400 cursor-not-allowed"
      )}
    >
      {submitting
        ? "Creating..."
        : isValid
        ? "Create Product"
        : "Complete Required Fields"}
    </button>
  </div>
</div>;

{
  /* Spacer to prevent content from being hidden behind sticky footer */
}
<div className="h-24 lg:h-20" />;
```

### 3. Non-Sequential Step Navigation

**Current Behavior:**

- Must go through steps in order
- Can only use Next/Previous buttons

**Required Behavior:**

- Can click any step to jump to it
- Completed steps show checkmark
- Invalid steps show warning indicator
- Current step is highlighted

```tsx
// Step validation state
interface StepState {
  isComplete: boolean;
  isValid: boolean;
  hasErrors: boolean;
  errorCount: number;
}

// On step click
const handleStepClick = (stepIndex: number) => {
  // Always allow navigation, but show validation toast if leaving invalid step
  if (!stepStates[currentStep].isValid) {
    toast.warning("Some fields need attention before continuing");
  }
  setCurrentStep(stepIndex);
};
```

### 4. Validation Button Behavior

**Validate button should:**

1. Run validation on all fields in current step
2. Show inline errors below each invalid field
3. Show toast summary: "3 errors in Basic Info, 1 error in Pricing"
4. Scroll to first error if on current step
5. Update step indicators to show which steps have errors

```tsx
const handleValidate = () => {
  const allErrors: Record<string, string[]> = {};

  steps.forEach((step, index) => {
    const stepErrors = validateStep(index, formData);
    if (stepErrors.length > 0) {
      allErrors[step.name] = stepErrors;
    }
  });

  if (Object.keys(allErrors).length === 0) {
    toast.success("All fields are valid! Ready to submit.");
    setIsValid(true);
  } else {
    const errorSummary = Object.entries(allErrors)
      .map(
        ([step, errors]) =>
          `${errors.length} error${errors.length > 1 ? "s" : ""} in ${step}`
      )
      .join(", ");
    toast.error(`Please fix: ${errorSummary}`);
    setErrors(allErrors);
  }
};
```

### 5. Mobile-Optimized Form Layout

**Each step should:**

- Have clear section headers
- Use single-column layout on mobile
- Have adequate spacing between fields
- Show character counts for text inputs
- Use full-width inputs on mobile

```tsx
// Mobile-friendly form section
<div className="space-y-6">
  {/* Section header */}
  <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
      {step.name}
    </h2>
    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
      {step.description}
    </p>
  </div>

  {/* Form fields */}
  <div className="space-y-4">
    {step.fields.map((field) => (
      <div key={field.name} className="space-y-1">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {field.label}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </label>

        <Input
          value={formData[field.name]}
          onChange={(e) => handleFieldChange(field.name, e.target.value)}
          className={cn(
            "w-full",
            errors[field.name] && "border-red-500 focus:ring-red-500"
          )}
          placeholder={field.placeholder}
        />

        {/* Error message */}
        {errors[field.name] && (
          <p className="text-sm text-red-500 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {errors[field.name]}
          </p>
        )}

        {/* Helper text / character count */}
        {field.maxLength && (
          <p className="text-xs text-gray-400 text-right">
            {formData[field.name]?.length || 0}/{field.maxLength}
          </p>
        )}
      </div>
    ))}
  </div>
</div>
```

---

## WizardSteps Component Specification

Create a reusable `WizardSteps` component:

```tsx
// src/components/forms/WizardSteps.tsx

interface WizardStep {
  id: string;
  name: string;
  description?: string;
  icon?: React.ReactNode;
}

interface WizardStepsProps {
  steps: WizardStep[];
  currentStep: number;
  completedSteps: number[];
  errorSteps: number[];
  onStepClick: (index: number) => void;
  className?: string;
}

export const WizardSteps: React.FC<WizardStepsProps> = ({
  steps,
  currentStep,
  completedSteps,
  errorSteps,
  onStepClick,
  className,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to current step
  useEffect(() => {
    const container = scrollRef.current;
    const activeButton = container?.querySelector(
      `[data-step="${currentStep}"]`
    );
    if (activeButton && container) {
      activeButton.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }, [currentStep]);

  return (
    <div className={cn("relative", className)}>
      {/* Scroll container */}
      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto scrollbar-hide px-4 py-2 snap-x snap-mandatory"
      >
        {steps.map((step, index) => (
          <button
            key={step.id}
            data-step={index}
            onClick={() => onStepClick(index)}
            className={cn(
              "flex-shrink-0 snap-center"
              // ... styling based on state
            )}
          >
            {/* Step content */}
          </button>
        ))}
      </div>

      {/* Fade indicators */}
      <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-white dark:from-gray-900 to-transparent pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-white dark:from-gray-900 to-transparent pointer-events-none" />
    </div>
  );
};
```

---

## WizardForm Component Specification

Create a reusable `WizardForm` wrapper:

```tsx
// src/components/forms/WizardForm.tsx

interface WizardFormProps {
  steps: WizardStep[];
  children: React.ReactNode; // Step content
  onSaveDraft: () => void;
  onValidate: () => ValidationResult;
  onSubmit: () => void;
  isSubmitting?: boolean;
  submitLabel?: string;
}

export const WizardForm: React.FC<WizardFormProps> = ({
  steps,
  children,
  onSaveDraft,
  onValidate,
  onSubmit,
  isSubmitting,
  submitLabel = "Create",
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [errorSteps, setErrorSteps] = useState<number[]>([]);
  const [isValid, setIsValid] = useState(false);

  return (
    <div className="min-h-screen pb-24 lg:pb-20">
      {/* Step indicator */}
      <WizardSteps
        steps={steps}
        currentStep={currentStep}
        completedSteps={completedSteps}
        errorSteps={errorSteps}
        onStepClick={setCurrentStep}
        className="sticky top-0 bg-white dark:bg-gray-900 z-30 border-b"
      />

      {/* Step content */}
      <div className="max-w-4xl mx-auto px-4 py-6">{children}</div>

      {/* Sticky action footer */}
      <WizardActionBar
        onSaveDraft={onSaveDraft}
        onValidate={() => {
          const result = onValidate();
          setIsValid(result.isValid);
          setErrorSteps(result.errorSteps);
        }}
        onSubmit={onSubmit}
        isSubmitting={isSubmitting}
        isValid={isValid}
        submitLabel={submitLabel}
      />
    </div>
  );
};
```

---

## Implementation Checklist

### Phase 1: Create Base Components

- [ ] Create `WizardSteps` component with horizontal scroll
- [ ] Create `WizardActionBar` component with sticky footer
- [ ] Create `WizardForm` wrapper component
- [ ] Add CSS for scrollbar hiding and snap scrolling

### Phase 2: Update Product Wizard

- [ ] Refactor `/seller/products/create/page.tsx` to use new components
- [ ] Add validation function for each step
- [ ] Implement Save Draft functionality
- [ ] Add step completion tracking
- [ ] Test on mobile devices

### Phase 3: Update Auction Wizard

- [ ] Refactor `/seller/auctions/create/page.tsx` to use new components
- [ ] Add validation function for each step
- [ ] Implement Save Draft functionality
- [ ] Test on mobile devices

### Phase 4: Update Other Wizards

- [ ] Update shop creation wizard
- [ ] Update admin category creation
- [ ] Update admin blog creation
- [ ] Ensure consistent behavior across all wizards

### Phase 5: Testing

- [ ] Test horizontal scroll on various mobile devices
- [ ] Test sticky footer doesn't overlap bottom nav
- [ ] Test validation flow end-to-end
- [ ] Test Save Draft persistence
- [ ] Test step navigation in any order

---

## Mobile Testing Requirements

| Test                    | Expected Behavior                            |
| ----------------------- | -------------------------------------------- |
| Step overflow           | Steps horizontally scroll with touch         |
| Current step visibility | Current step auto-scrolls into view          |
| Action buttons          | Always visible in sticky footer              |
| Step navigation         | Can tap any step to navigate                 |
| Validation              | Shows errors inline and in step indicators   |
| Save Draft              | Persists form data, can resume later         |
| Submit                  | Works from any step when valid               |
| Keyboard                | Mobile keyboard doesn't hide inputs          |
| Scroll                  | Form content scrolls without moving step bar |
