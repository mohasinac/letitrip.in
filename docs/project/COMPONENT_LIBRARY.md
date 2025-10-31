# Component Library Documentation

## Overview

This is the unified component library for JustForView. All components are designed to be:

- **Reusable**: Single source of truth for each component type
- **Accessible**: WCAG 2.1 AA compliant
- **Themeable**: Works with light/dark modes automatically
- **Responsive**: Mobile-first design with breakpoint support
- **Performant**: Optimized for bundle size and runtime performance

## Component Catalog

### Buttons

#### UnifiedButton

The primary button component supporting multiple variants and sizes.

```tsx
import { UnifiedButton, PrimaryButton, SecondaryButton } from '@/components/ui/unified';

// Basic usage
<UnifiedButton>Click me</UnifiedButton>

// With variant
<UnifiedButton variant="primary">Primary</UnifiedButton>
<UnifiedButton variant="outline">Outline</UnifiedButton>

// With size
<UnifiedButton size="sm">Small</UnifiedButton>
<UnifiedButton size="lg">Large</UnifiedButton>

// With icons
<UnifiedButton leftIcon={<Icon />}>With Icon</UnifiedButton>

// Loading state
<UnifiedButton loading>Loading...</UnifiedButton>

// Convenience components
<PrimaryButton>Primary</PrimaryButton>
<SecondaryButton>Secondary</SecondaryButton>
```

**Props:**

- `variant`: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'success' | 'warning'
- `size`: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
- `loading`: boolean
- `disabled`: boolean
- `leftIcon`: ReactNode
- `rightIcon`: ReactNode
- `fullWidth`: boolean
- `rounded`: 'none' | 'sm' | 'md' | 'lg' | 'full'

### Cards

#### UnifiedCard

A flexible card container component.

```tsx
import { UnifiedCard, CardHeader, CardContent, CardFooter } from '@/components/ui/unified';

// Basic usage
<UnifiedCard>
  <CardHeader title="Card Title" subtitle="Subtitle" />
  <CardContent>Card content goes here</CardContent>
  <CardFooter>Footer content</CardFooter>
</UnifiedCard>

// With variants
<UnifiedCard variant="elevated">Elevated card</UnifiedCard>
<UnifiedCard variant="outlined">Outlined card</UnifiedCard>

// Hover effect
<UnifiedCard hover>Hover me</UnifiedCard>

// Clickable card
<UnifiedCard clickable onClick={handleClick}>Click me</UnifiedCard>
```

**Props:**

- `variant`: 'default' | 'elevated' | 'outlined' | 'filled' | 'glass'
- `hover`: boolean
- `clickable`: boolean
- `padding`: 'none' | 'sm' | 'md' | 'lg' | 'xl'
- `shadow`: 'none' | 'sm' | 'md' | 'lg' | 'xl'
- `rounded`: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'

### Inputs

#### UnifiedInput

A versatile input component with validation support.

```tsx
import { UnifiedInput, UnifiedTextarea } from '@/components/ui/unified';

// Basic input
<UnifiedInput label="Email" type="email" placeholder="Enter your email" />

// With validation
<UnifiedInput
  label="Password"
  type="password"
  error={hasError}
  errorMessage="Password is required"
/>

// With icons
<UnifiedInput
  label="Search"
  type="search"
  leftIcon={<SearchIcon />}
/>

// Password with toggle
<UnifiedInput
  label="Password"
  type="password"
  showPasswordToggle
/>

// Textarea
<UnifiedTextarea
  label="Message"
  rows={4}
  maxLength={500}
  showCharCount
/>
```

**Props:**

- `inputType`: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search'
- `label`: string
- `helperText`: string
- `error`: boolean
- `errorMessage`: string
- `success`: boolean
- `successMessage`: string
- `leftIcon`: ReactNode
- `rightIcon`: ReactNode
- `size`: 'sm' | 'md' | 'lg'
- `variant`: 'outlined' | 'filled' | 'standard'
- `showPasswordToggle`: boolean
- `loading`: boolean

## Theming

All components automatically adapt to the current theme (light/dark mode) through CSS variables.

### CSS Variables

The following CSS variables control the theme:

```css
:root {
  --color-background: #ffffff;
  --color-surface: #f8fafc;
  --color-surfaceVariant: #f1f5f9;
  --color-primary: #0095f6;
  --color-secondary: #64748b;
  --color-text: #0f172a;
  --color-textSecondary: #475569;
  --color-border: #e2e8f0;
  --color-error: #dc2626;
  --color-success: #16a34a;
  --color-warning: #d97706;
}

.dark {
  --color-background: #000000;
  --color-surface: #0f0f0f;
  --color-surfaceVariant: #1a1a1a;
  --color-primary: #0095f6;
  --color-secondary: #ffffff;
  --color-text: #ffffff;
  --color-textSecondary: #cccccc;
  --color-border: #333333;
  --color-error: #ef4444;
  --color-success: #22c55e;
  --color-warning: #f59e0b;
}
```

## Responsive Design

All components are mobile-first and responsive by default.

### Breakpoints

```javascript
xs: 475px
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
2xl: 1536px
```

### Usage

```tsx
// Tailwind responsive classes
<UnifiedButton className="w-full md:w-auto">Responsive Button</UnifiedButton>;

// Or use the mobile utility hooks
import { useBreakpoint, useDeviceDetection } from "@/utils/mobile";

const Component = () => {
  const breakpoint = useBreakpoint();
  const { isMobile } = useDeviceDetection();

  return (
    <div>
      Current breakpoint: {breakpoint}
      {isMobile && <p>Mobile view</p>}
    </div>
  );
};
```

## Performance

### Code Splitting

Components are automatically code-split using Next.js dynamic imports:

```tsx
import dynamic from "next/dynamic";

const HeavyComponent = dynamic(() => import("./HeavyComponent"), {
  loading: () => <p>Loading...</p>,
  ssr: false, // Disable SSR for client-only components
});
```

### Image Optimization

Always use Next.js Image component for optimized images:

```tsx
import Image from "next/image";

<Image
  src="/path/to/image.jpg"
  alt="Description"
  width={800}
  height={600}
  priority // For above-the-fold images
  placeholder="blur" // Optional blur placeholder
/>;
```

### Performance Utilities

```tsx
import { debounce, throttle, memoize } from "@/utils/performance";

// Debounce expensive operations
const debouncedSearch = debounce(searchFunction, 300);

// Throttle scroll handlers
const throttledScroll = throttle(scrollHandler, 100);

// Memoize expensive computations
const memoizedCalculation = memoize(expensiveFunction);
```

## Accessibility

All components follow WCAG 2.1 AA guidelines:

- Proper semantic HTML
- Keyboard navigation support
- Screen reader compatibility
- Focus management
- ARIA labels and roles
- Color contrast compliance

### Best Practices

```tsx
// Always provide labels
<UnifiedInput label="Email" type="email" />

// Use semantic HTML
<button type="button">Click</button> // instead of <div onClick={...}>

// Provide alt text for images
<Image alt="Descriptive text" src="..." />

// Use proper heading hierarchy
<h1>Main Title</h1>
<h2>Section Title</h2>
<h3>Subsection</h3>
```

## SEO

### Meta Tags

Use the SEOHead component for comprehensive SEO:

```tsx
import { SEOHead } from "@/components/seo/SEOHead";

<SEOHead
  title="Page Title"
  description="Page description"
  keywords={["keyword1", "keyword2"]}
  image="/path/to/og-image.jpg"
  type="article"
/>;
```

### Structured Data

Generate structured data for better search results:

```tsx
import {
  generateProductStructuredData,
  generateBreadcrumbStructuredData,
} from "@/components/seo/SEOHead";

const structuredData = generateProductStructuredData({
  name: "Product Name",
  description: "Product description",
  image: "/product-image.jpg",
  price: 99.99,
  currency: "INR",
  availability: "InStock",
});
```

## Migration Guide

### Migrating from Old Components

Replace old component imports with unified versions:

```tsx
// Old
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

// New
import { UnifiedButton, UnifiedCard } from "@/components/ui/unified";
```

Most props remain the same, but check the component documentation for any changes.

## Contributing

When adding new components:

1. Follow the existing naming convention: `Unified[ComponentName]`
2. Support light/dark themes via CSS variables
3. Make components responsive by default
4. Include proper TypeScript types
5. Add accessibility features (keyboard nav, ARIA labels, etc.)
6. Document props and usage examples
7. Export from the unified index file

## Questions?

For questions or issues, please refer to the main project README or create an issue in the repository.
