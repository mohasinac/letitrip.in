# Migration Guide

Complete guide for migrating from old imports to the new @letitrip/react-library package.

## Why Migrate?

**Benefits of using the library:**
- ✅ **Better Tree-shaking**: Import only what you need
- ✅ **Type Safety**: Full TypeScript support with generated types
- ✅ **Consistent API**: Standardized props and patterns
- ✅ **Bundle Optimization**: ~51KB gzipped vs scattered imports
- ✅ **Better Maintenance**: Centralized components and utilities
- ✅ **Storybook Documentation**: Interactive component docs
- ✅ **Design System**: Unified CSS tokens and Tailwind config

## Import Path Changes

### Components

**Old (Direct Path Imports):**
```typescript
import FormInput from '@/components/form/FormInput';
import FormSelect from '@/components/form/FormSelect';
import FormTextarea from '@/components/form/FormTextarea';
import FormCheckbox from '@/components/form/FormCheckbox';
import FormRadio from '@/components/form/FormRadio';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
```

**New (Library Import):**
```typescript
import {
  FormInput,
  FormSelect,
  FormTextarea,
  FormCheckbox,
  FormRadio,
  Button,
  Card,
} from '@letitrip/react-library/components';
```

### Hooks

**Old (Direct Path Imports):**
```typescript
import useDebounce from '@/hooks/useDebounce';
import useDebounceCallback from '@/hooks/useDebounceCallback';
import useThrottledCallback from '@/hooks/useThrottledCallback';
import useMediaQuery from '@/hooks/useMediaQuery';
import useIsMobile from '@/hooks/useIsMobile';
import useBreakpoint from '@/hooks/useBreakpoint';
import useLocalStorage from '@/hooks/useLocalStorage';
```

**New (Library Import):**
```typescript
import {
  useDebounce,
  useDebounceCallback,
  useThrottledCallback,
  useMediaQuery,
  useIsMobile,
  useBreakpoint,
  useLocalStorage,
} from '@letitrip/react-library/hooks';
```

### Utility Functions

**Old (Direct Path Imports):**
```typescript
import { formatPrice } from '@/lib/formatters/price';
import { formatDate } from '@/lib/formatters/date';
import { validateEmail } from '@/lib/validators/email';
import { validatePhone } from '@/lib/validators/phone';
import { sanitizeInput } from '@/lib/sanitize';
```

**New (Library Import):**
```typescript
import {
  formatPrice,
  formatDate,
  validateEmail,
  validatePhone,
  sanitizeInput,
} from '@letitrip/react-library/utils';
```

## Component Migrations

### Form Components

#### FormInput

**Old:**
```tsx
import FormInput from '@/components/form/FormInput';

<FormInput
  label="Email"
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  error={error}
/>
```

**New:**
```tsx
import { FormInput } from '@letitrip/react-library/components';

// Same usage - API unchanged
<FormInput
  label="Email"
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  error={error}
/>
```

#### FormSelect

**Old:**
```tsx
import FormSelect from '@/components/form/FormSelect';

<FormSelect
  label="Country"
  value={country}
  onChange={(e) => setCountry(e.target.value)}
  options={options}
/>
```

**New:**
```tsx
import { FormSelect } from '@letitrip/react-library/components';

// Same usage - API unchanged
<FormSelect
  label="Country"
  value={country}
  onChange={(e) => setCountry(e.target.value)}
  options={options}
/>
```

### Value Display Components

#### Price

**Old:**
```tsx
import Price from '@/components/values/Price';

<Price
  amount={product.price}
  originalPrice={product.originalPrice}
  size="lg"
/>
```

**New:**
```tsx
import { Price } from '@letitrip/react-library/components';

// Same usage - API unchanged
<Price
  amount={product.price}
  originalPrice={product.originalPrice}
  size="lg"
/>
```

#### DateDisplay

**Old:**
```tsx
import DateDisplay from '@/components/values/DateDisplay';

<DateDisplay
  date={order.createdAt}
  format="relative"
/>
```

**New:**
```tsx
import { DateDisplay } from '@letitrip/react-library/components';

// Same usage - API unchanged
<DateDisplay
  date={order.createdAt}
  format="relative"
/>
```

### UI Components

#### Button

**Old:**
```tsx
import Button from '@/components/common/Button';

<Button
  variant="primary"
  size="md"
  onClick={handleClick}
  disabled={loading}
>
  Submit
</Button>
```

**New:**
```tsx
import { Button } from '@letitrip/react-library/components';

// Same usage - API unchanged
<Button
  variant="primary"
  size="md"
  onClick={handleClick}
  disabled={loading}
>
  Submit
</Button>
```

#### Card

**Old:**
```tsx
import Card from '@/components/common/Card';

<Card
  title="Product Details"
  footer={<Button>View More</Button>}
>
  {children}
</Card>
```

**New:**
```tsx
import { Card } from '@letitrip/react-library/components';

// Same usage - API unchanged
<Card
  title="Product Details"
  footer={<Button>View More</Button>}
>
  {children}
</Card>
```

## Hook Migrations

### useDebounce

**Old:**
```tsx
import useDebounce from '@/hooks/useDebounce';

function SearchBar() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 500);
  
  // ...
}
```

**New:**
```tsx
import { useDebounce } from '@letitrip/react-library/hooks';

function SearchBar() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 500);
  
  // Same usage - API unchanged
}
```

### useMediaQuery

**Old:**
```tsx
import useMediaQuery from '@/hooks/useMediaQuery';

function Component() {
  const isMobile = useMediaQuery('(max-width: 768px)');
  // ...
}
```

**New:**
```tsx
import { useMediaQuery } from '@letitrip/react-library/hooks';

function Component() {
  const isMobile = useMediaQuery('(max-width: 768px)');
  // Same usage - API unchanged
}
```

### useLocalStorage

**Old:**
```tsx
import useLocalStorage from '@/hooks/useLocalStorage';

function ThemeSwitcher() {
  const [theme, setTheme] = useLocalStorage('theme', 'light');
  // ...
}
```

**New:**
```tsx
import { useLocalStorage } from '@letitrip/react-library/hooks';

function ThemeSwitcher() {
  const [theme, setTheme] = useLocalStorage('theme', 'light');
  // Same usage - API unchanged
}
```

## Utility Migrations

### Formatters

**Old:**
```tsx
import { formatPrice } from '@/lib/formatters/price';
import { formatDate } from '@/lib/formatters/date';
import { formatPhoneNumber } from '@/lib/formatters/phone';

const price = formatPrice(1234.56);
const date = formatDate(new Date());
const phone = formatPhoneNumber('9876543210');
```

**New:**
```tsx
import {
  formatPrice,
  formatDate,
  formatPhoneNumber,
} from '@letitrip/react-library/utils';

const price = formatPrice(1234.56);
const date = formatDate(new Date());
const phone = formatPhoneNumber('9876543210');
// Same usage - API unchanged
```

### Validators

**Old:**
```tsx
import { validateEmail } from '@/lib/validators/email';
import { validatePhone } from '@/lib/validators/phone';
import { validatePincode } from '@/lib/validators/pincode';

const isValidEmail = validateEmail('user@example.com');
const isValidPhone = validatePhone('9876543210');
const isValidPincode = validatePincode('110001');
```

**New:**
```tsx
import {
  validateEmail,
  validatePhone,
  validatePincode,
} from '@letitrip/react-library/utils';

const isValidEmail = validateEmail('user@example.com');
const isValidPhone = validatePhone('9876543210');
const isValidPincode = validatePincode('110001');
// Same usage - API unchanged
```

### Sanitizers

**Old:**
```tsx
import { sanitizeInput } from '@/lib/sanitize';
import { sanitizeHTML } from '@/lib/sanitize';

const clean = sanitizeInput(userInput);
const cleanHTML = sanitizeHTML(richText);
```

**New:**
```tsx
import { sanitizeInput, sanitizeHTML } from '@letitrip/react-library/utils';

const clean = sanitizeInput(userInput);
const cleanHTML = sanitizeHTML(richText);
// Same usage - API unchanged
```

## Style Migrations

### CSS Token Imports

**Old:**
```css
/* Global styles with hardcoded values */
.button {
  background-color: #0070f3;
  padding: 12px 24px;
  border-radius: 8px;
}
```

**New:**
```css
/* Import tokens first */
@import '@letitrip/react-library/styles/tokens';

/* Use CSS variables */
.button {
  background-color: var(--color-primary);
  padding: var(--spacing-3) var(--spacing-6);
  border-radius: var(--radius-md);
}
```

### Tailwind Configuration

**Old (tailwind.config.js):**
```javascript
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#0070f3',
        // ...
      },
    },
  },
};
```

**New (tailwind.config.js):**
```javascript
const libraryConfig = require('@letitrip/react-library/tailwind.config.js');

module.exports = {
  ...libraryConfig,
  content: [
    ...libraryConfig.content,
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      ...libraryConfig.theme.extend,
      // Your custom extensions
    },
  },
};
```

## Breaking Changes

### No Breaking Changes

✅ All component APIs remain unchanged. Simply update import paths.

### Props Remain Compatible

All props, types, and behaviors are preserved:
- ✅ All component props unchanged
- ✅ All hook signatures unchanged
- ✅ All utility function signatures unchanged
- ✅ All return types unchanged

## Step-by-Step Migration Process

### 1. Update One Module at a Time

Start with utilities (lowest risk):

```bash
# Find all utility imports
grep -r "from '@/lib/" src/
```

Replace with library imports:

```typescript
// Before
import { formatPrice } from '@/lib/formatters/price';

// After
import { formatPrice } from '@letitrip/react-library/utils';
```

### 2. Migrate Hooks

```bash
# Find all hook imports
grep -r "from '@/hooks/" src/
```

Replace with library imports:

```typescript
// Before
import useDebounce from '@/hooks/useDebounce';

// After
import { useDebounce } from '@letitrip/react-library/hooks';
```

### 3. Migrate Components

```bash
# Find all component imports
grep -r "from '@/components/" src/
```

Replace with library imports:

```typescript
// Before
import FormInput from '@/components/form/FormInput';

// After
import { FormInput } from '@letitrip/react-library/components';
```

### 4. Update CSS/Tailwind

```typescript
// app/_app.tsx or layout.tsx
import '@letitrip/react-library/styles/tokens';
```

```javascript
// tailwind.config.js
const libraryConfig = require('@letitrip/react-library/tailwind.config.js');

module.exports = {
  ...libraryConfig,
  content: [
    ...libraryConfig.content,
    './src/**/*.{js,ts,jsx,tsx}',
  ],
};
```

### 5. Test Each Module

After migrating each module:

```bash
# Run tests
npm test

# Check types
npm run type-check

# Build
npm run build
```

### 6. Update Dependencies (Optional)

Remove old component files if no longer needed:

```bash
# After verifying all imports migrated
rm -rf src/components/form/
rm -rf src/hooks/useDebounce.ts
rm -rf src/lib/formatters/
```

## Automated Migration Script

Create a migration script to automate import updates:

```javascript
// scripts/migrate-to-library.js
const fs = require('fs');
const path = require('path');

const replacements = {
  // Components
  "from '@/components/form/FormInput'": "from '@letitrip/react-library/components'",
  "from '@/components/form/FormSelect'": "from '@letitrip/react-library/components'",
  // Hooks
  "from '@/hooks/useDebounce'": "from '@letitrip/react-library/hooks'",
  // Utils
  "from '@/lib/formatters/price'": "from '@letitrip/react-library/utils'",
  // Add more...
};

function migrateFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  for (const [old, newPath] of Object.entries(replacements)) {
    if (content.includes(old)) {
      content = content.replace(new RegExp(old, 'g'), newPath);
      modified = true;
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`✓ Updated ${filePath}`);
  }
}

// Run on all .ts/.tsx files
// Implementation details...
```

## Verification Checklist

After migration, verify:

- [ ] All imports resolve correctly
- [ ] TypeScript compiles without errors
- [ ] All tests pass
- [ ] Application builds successfully
- [ ] Runtime behavior unchanged
- [ ] Bundle size optimized
- [ ] CSS tokens loaded
- [ ] Tailwind classes work
- [ ] Storybook accessible

## Rollback Strategy

If issues arise:

1. **Git Revert**: Revert migration commits
   ```bash
   git revert <commit-hash>
   ```

2. **Gradual Migration**: Migrate module by module instead of all at once

3. **Dual Imports**: Temporarily support both old and new paths
   ```typescript
   // Old path for gradual migration
   export { FormInput } from '@letitrip/react-library/components';
   ```

## Common Issues

### Issue: Import Not Found

**Error:**
```
Module not found: Can't resolve '@letitrip/react-library/components'
```

**Solution:**
Ensure package is built:
```bash
cd react-library
npm run build
```

### Issue: Types Not Recognized

**Error:**
```
Could not find a declaration file for module '@letitrip/react-library'
```

**Solution:**
Check TypeScript sees the library:
```json
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@letitrip/react-library": ["./react-library/dist/index.d.ts"]
    }
  }
}
```

### Issue: CSS Variables Not Working

**Error:**
Variables show as `var(--color-primary)` in browser

**Solution:**
Import CSS tokens:
```typescript
import '@letitrip/react-library/styles/tokens';
```

## Need Help?

- **[Getting Started Guide](getting-started.md)** - Setup instructions
- **[Component Documentation](components.md)** - Component API reference
- **[Storybook](http://localhost:6006)** - Interactive examples
- **Theme Documentation** - See [react-library/src/styles/README.md](../src/styles/README.md)

---

**Happy Migrating!** 🚀
