# Getting Started with @letitrip/react-library

This guide will help you start using the Letitrip React Library in your application.

## Prerequisites

- Node.js 18+ or 20+
- React 18 or 19
- TypeScript 5.3+ (recommended)
- Tailwind CSS 3.x (for styling)

## Installation

Since this is a workspace package, no installation is required. The library is already available in your project.

## Build Performance

The library is optimized for production with:
- **Tree-shaking**: Import only what you use
- **Code splitting**: Automatic chunking by feature
- **Minification**: Terser with 2-pass compression
- **TypeScript**: Full type safety with exported types
- **Bundle size**: ~297 KB production code
- **Build time**: ~7 seconds

For optimal bundle size, use specific entry points (see below).

## Step 1: Import What You Need

The library provides multiple entry points for optimal tree-shaking:

### Main Entry Point

```typescript
import { formatPrice, FormInput, useDebounce } from "@letitrip/react-library";
```

### Specific Entry Points (Recommended for Better Tree-Shaking)

```typescript
// Utilities
import {
  formatPrice,
  formatDate,
  validateEmail,
} from "@letitrip/react-library/utils";

// Components
import {
  FormInput,
  Button,
  DateDisplay,
} from "@letitrip/react-library/components";

// Hooks
import { useDebounce, useMediaQuery } from "@letitrip/react-library/hooks";

// TypeScript Types
import type {
  Size,
  Variant,
  FormFieldProps,
} from "@letitrip/react-library/types";

// Design tokens (in your global CSS)
import "@letitrip/react-library/styles/tokens";
```

## Step 2: Setup Design Tokens

### Import CSS Tokens

In your global CSS file or `_app.tsx`:

```css
/* styles/globals.css */
@import "@letitrip/react-library/styles/tokens";
```

Or in Next.js `_app.tsx`:

```typescript
import "@letitrip/react-library/styles/tokens";
```

### Configure Tailwind (Optional but Recommended)

Extend your `tailwind.config.js` with the library's theme:

```javascript
const libraryConfig = require("@letitrip/react-library/tailwind.config.js");

module.exports = {
  ...libraryConfig,
  content: [
    ...libraryConfig.content,
    "./src/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      ...libraryConfig.theme.extend,
      // Your custom extensions
    },
  },
};
```

## Step 3: Use Components

### Basic Form Example

```tsx
import {
  FormInput,
  FormSelect,
  Button,
} from "@letitrip/react-library/components";
import { validateEmail } from "@letitrip/react-library/utils";
import { useState } from "react";

function SignupForm() {
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("");

  const emailError =
    email && !validateEmail(email) ? "Invalid email" : undefined;

  return (
    <form className="space-y-4">
      <FormInput
        label="Email Address"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={emailError}
        required
      />

      <FormSelect
        label="Country"
        value={country}
        onChange={(e) => setCountry(e.target.value)}
        options={[
          { value: "IN", label: "India" },
          { value: "US", label: "United States" },
        ]}
        required
      />

      <Button type="submit" disabled={!!emailError}>
        Sign Up
      </Button>
    </form>
  );
}
```

### Display Formatted Values

```tsx
import { Price, DateDisplay, Rating } from "@letitrip/react-library/components";

function ProductCard({ product }) {
  return (
    <div className="card">
      <h3>{product.name}</h3>

      <Price
        amount={product.price}
        originalPrice={product.originalPrice}
        size="lg"
      />

      <Rating value={product.rating} max={5} />

      <DateDisplay date={product.createdAt} format="relative" />
    </div>
  );
}
```

## Step 4: Use Hooks

### Debounce Search Input

```tsx
import { FormInput } from "@letitrip/react-library/components";
import { useDebounce } from "@letitrip/react-library/hooks";
import { useState, useEffect } from "react";

function SearchBar() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 500);

  useEffect(() => {
    if (debouncedQuery) {
      // API call with debounced value
      searchProducts(debouncedQuery);
    }
  }, [debouncedQuery]);

  return (
    <FormInput
      placeholder="Search products..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
    />
  );
}
```

### Responsive Layout

```tsx
import { useIsMobile, useBreakpoint } from "@letitrip/react-library/hooks";

function Navigation() {
  const isMobile = useIsMobile();
  const breakpoint = useBreakpoint();

  return (
    <nav>
      {isMobile ? <MobileMenu /> : <DesktopMenu />}

      {breakpoint === "xs" && <CompactView />}
      {breakpoint === "xl" && <ExpandedView />}
    </nav>
  );
}
```

### Persistent State with localStorage

```tsx
import { useLocalStorage } from "@letitrip/react-library/hooks";

function ThemeToggle() {
  const [theme, setTheme] = useLocalStorage("theme", "light");

  return (
    <button onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
      Current theme: {theme}
    </button>
  );
}
```

## Step 5: Use Utility Functions

### Format Values

```tsx
import {
  formatPrice,
  formatDate,
  formatPhoneNumber,
  formatCompactCurrency,
} from "@letitrip/react-library/utils";

function OrderSummary({ order }) {
  return (
    <div>
      <p>Total: {formatPrice(order.total)}</p>
      <p>Compact: {formatCompactCurrency(order.total)}</p>
      <p>Date: {formatDate(order.createdAt)}</p>
      <p>Phone: {formatPhoneNumber(order.phone)}</p>
    </div>
  );
}
```

### Validate Input

```tsx
import {
  validateEmail,
  validatePhone,
  validatePincode,
} from "@letitrip/react-library/utils";

function validateForm(data) {
  const errors = {};

  if (!validateEmail(data.email)) {
    errors.email = "Invalid email address";
  }

  if (!validatePhone(data.phone)) {
    errors.phone = "Invalid phone number";
  }

  if (!validatePincode(data.pincode)) {
    errors.pincode = "Invalid pincode";
  }

  return errors;
}
```

### Sanitize User Input

```tsx
import { sanitizeInput, sanitizeHTML } from "@letitrip/react-library/utils";

function CommentForm() {
  const handleSubmit = (rawComment) => {
    // Sanitize before saving
    const cleanComment = sanitizeInput(rawComment);

    // Or for rich text
    const cleanHTML = sanitizeHTML(rawComment);

    saveComment(cleanComment);
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

## Step 6: Use CSS Variables

### In CSS/SCSS

```css
.my-button {
  background-color: var(--color-primary);
  color: var(--color-text-inverse);
  border-radius: var(--radius-md);
  padding: var(--spacing-3) var(--spacing-6);
  box-shadow: var(--shadow-md);
  transition: all var(--duration-200) var(--ease-in-out);
}

.my-button:hover {
  background-color: var(--color-primary-hover);
  box-shadow: var(--shadow-lg);
}
```

### In Tailwind Classes

```tsx
<button className="bg-primary text-text-inverse rounded-token-md shadow-token-md hover:bg-primary-hover">
  Click Me
</button>
```

### Inline Styles (Not Recommended)

```tsx
<div
  style={{
    color: "var(--color-primary)",
    fontSize: "var(--text-lg)",
    padding: "var(--spacing-4)",
  }}
>
  Content
</div>
```

## Common Patterns

### Form with Real-time Validation

```tsx
import { FormInput, Button } from "@letitrip/react-library/components";
import { validateEmail, validatePhone } from "@letitrip/react-library/utils";
import { useDebounce } from "@letitrip/react-library/hooks";
import { useState } from "react";

function ContactForm() {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const debouncedEmail = useDebounce(email, 300);
  const debouncedPhone = useDebounce(phone, 300);

  const emailError =
    debouncedEmail && !validateEmail(debouncedEmail)
      ? "Invalid email address"
      : undefined;

  const phoneError =
    debouncedPhone && !validatePhone(debouncedPhone)
      ? "Invalid phone number"
      : undefined;

  const isValid = !emailError && !phoneError && email && phone;

  return (
    <form>
      <FormInput
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={emailError}
      />

      <FormInput
        label="Phone"
        type="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        error={phoneError}
      />

      <Button type="submit" disabled={!isValid}>
        Submit
      </Button>
    </form>
  );
}
```

### Responsive Dashboard

```tsx
import { useIsMobile, useViewport } from "@letitrip/react-library/hooks";
import { Card } from "@letitrip/react-library/components";

function Dashboard() {
  const isMobile = useIsMobile();
  const { width } = useViewport();

  const columns = width > 1536 ? 4 : width > 1024 ? 3 : width > 768 ? 2 : 1;

  return (
    <div className={`grid grid-cols-${columns} gap-4`}>
      {stats.map((stat) => (
        <Card key={stat.id}>
          <h3>{stat.title}</h3>
          <p>{isMobile ? stat.shortValue : stat.value}</p>
        </Card>
      ))}
    </div>
  );
}
```

## Next Steps

- **[Component Documentation](components.md)** - Explore all components
- **[Hook Documentation](hooks.md)** - Learn about all hooks
- **[Utility Documentation](utilities.md)** - Reference for utility functions
- **[Theme System](../src/styles/README.md)** - Customize the design system
- **[Migration Guide](migration-guide.md)** - Migrate existing code

## Need Help?

- Check the [Storybook documentation](http://localhost:6006)
- Review inline JSDoc comments in your IDE
- See example usage in component stories
- Consult the migration guide for converting old imports

---

**Ready to build amazing UIs!** 🚀
