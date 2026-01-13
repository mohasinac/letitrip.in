# Contributing to @letitrip/react-library

Thank you for your interest in contributing! This guide will help you get started.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Code Standards](#code-standards)
- [Component Guidelines](#component-guidelines)
- [Hook Guidelines](#hook-guidelines)
- [Utility Guidelines](#utility-guidelines)
- [Testing Requirements](#testing-requirements)
- [Documentation Requirements](#documentation-requirements)
- [Pull Request Process](#pull-request-process)
- [Storybook Stories](#storybook-stories)

## Code of Conduct

- Be respectful and inclusive
- Follow best practices and coding standards
- Write clean, maintainable code
- Document your changes
- Test thoroughly before submitting

## Getting Started

### Prerequisites

- Node.js 18+ or 20+
- NPM 9+
- Git
- VS Code (recommended) with ESLint and Prettier extensions

### Fork and Clone

```bash
# Fork the repository on GitHub, then clone your fork
git clone https://github.com/YOUR_USERNAME/letitrip.in.git
cd letitrip.in
```

## Development Setup

### 1. Install Dependencies

```bash
# Install root dependencies
npm install

# Install library dependencies
cd react-library
npm install
```

### 2. Start Development

```bash
# Start Storybook for interactive development
npm run storybook

# In another terminal, start build watch mode
npm run dev
```

### 3. Verify Setup

```bash
# Run tests
npm test

# Type check
npm run type-check

# Build library
npm run build
```

Storybook should open at `http://localhost:6006`.

## Project Structure

```
react-library/
├── src/
│   ├── components/        # React components
│   │   ├── form/          # Form components
│   │   ├── values/        # Display components
│   │   └── ui/            # UI components
│   ├── hooks/             # React hooks
│   ├── utils/             # Utility functions
│   ├── styles/            # CSS tokens and styles
│   │   └── tokens/        # Design tokens
│   └── index.ts           # Main entry
├── stories/               # Storybook stories
├── tests/                 # Test files
├── docs/                  # Documentation
├── dist/                  # Build output
├── package.json
├── vite.config.ts         # Build configuration
├── tailwind.config.js     # Tailwind theme
└── tsconfig.json          # TypeScript config
```

## Development Workflow

### 1. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/issue-description
```

**Branch naming conventions:**

- `feature/` - New features
- `fix/` - Bug fixes
- `refactor/` - Code refactoring
- `docs/` - Documentation only
- `test/` - Test improvements
- `chore/` - Maintenance tasks

### 2. Make Changes

Follow the guidelines below for components, hooks, or utilities.

### 3. Test Your Changes

```bash
# Run all tests
npm test

# Run specific test
npm test -- FormInput.test.tsx

# Watch mode
npm test -- --watch

# Coverage
npm test -- --coverage
```

### 4. Check Code Quality

```bash
# Type check
npm run type-check

# Lint
npm run lint

# Format
npm run format
```

### 5. Build and Verify

```bash
# Build library
npm run build

# Test build output
node scripts/test-library-build.mjs

# Check bundle size
npm run build -- --analyze
```

### 6. Update Documentation

- Add JSDoc comments to your code
- Create/update Storybook story
- Update relevant docs in `docs/`
- Update CHANGELOG.md

### 7. Commit Changes

```bash
git add .
git commit -m "feat: add new FormComponent

- Add FormComponent with validation
- Add tests and stories
- Update documentation"
```

**Commit message format:**

```
<type>: <subject>

<body>

<footer>
```

**Types:**

- `feat` - New feature
- `fix` - Bug fix
- `refactor` - Code refactoring
- `docs` - Documentation
- `test` - Tests
- `chore` - Maintenance
- `perf` - Performance improvement
- `style` - Code style (formatting)

## Code Standards

### TypeScript

- **Strict Mode**: All code must pass strict TypeScript checks
- **No `any`**: Avoid `any` type, use proper types or `unknown`
- **Explicit Types**: Export all public types
- **Type Safety**: Ensure full type coverage

```typescript
// ✅ Good
interface ButtonProps {
  variant: "primary" | "secondary";
  onClick: () => void;
}

export function Button({ variant, onClick }: ButtonProps) {
  // ...
}

// ❌ Bad
export function Button({ variant, onClick }: any) {
  // ...
}
```

### Code Style

- **Formatting**: Use Prettier (automatic)
- **Linting**: Follow ESLint rules
- **Naming**: Use clear, descriptive names
- **Comments**: Add JSDoc for all exports

```typescript
/**
 * Format a number as Indian Rupees currency.
 *
 * @param amount - The amount to format
 * @param options - Formatting options
 * @returns Formatted price string (e.g., "₹1,234.56")
 *
 * @example
 * formatPrice(1234.56) // "₹1,234.56"
 * formatPrice(1234.56, { compact: true }) // "₹1.2K"
 */
export function formatPrice(amount: number, options?: FormatOptions): string {
  // ...
}
```

## Component Guidelines

### Component Structure

```typescript
import React from "react";

/**
 * Button component with multiple variants and sizes.
 *
 * @example
 * <Button variant="primary" size="md" onClick={handleClick}>
 *   Click Me
 * </Button>
 */
export interface ButtonProps {
  /** Button style variant */
  variant?: "primary" | "secondary" | "outline";
  /** Button size */
  size?: "sm" | "md" | "lg";
  /** Disabled state */
  disabled?: boolean;
  /** Click handler */
  onClick?: () => void;
  /** Button content */
  children: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
}

export function Button({
  variant = "primary",
  size = "md",
  disabled = false,
  onClick,
  children,
  className = "",
}: ButtonProps) {
  return (
    <button
      className={`btn btn-${variant} btn-${size} ${className}`}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}
```

### Component Requirements

1. **TypeScript Interface**: Define and export props interface
2. **JSDoc Comments**: Document component and all props
3. **Default Props**: Use default parameters
4. **Accessibility**: Include ARIA attributes
5. **CSS Classes**: Use Tailwind + design tokens
6. **Example**: Provide usage example in JSDoc

### Accessibility Checklist

- [ ] Semantic HTML elements
- [ ] ARIA labels where needed
- [ ] Keyboard navigation support
- [ ] Focus indicators
- [ ] Screen reader compatible
- [ ] Color contrast meets WCAG 2.1 AA (4.5:1)

## Hook Guidelines

### Hook Structure

```typescript
import { useState, useEffect } from "react";

/**
 * Debounce a value with a specified delay.
 *
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds (default: 500)
 * @returns Debounced value
 *
 * @example
 * const [query, setQuery] = useState('');
 * const debouncedQuery = useDebounce(query, 500);
 *
 * useEffect(() => {
 *   // API call with debounced value
 *   searchAPI(debouncedQuery);
 * }, [debouncedQuery]);
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
```

### Hook Requirements

1. **Naming**: Start with `use` prefix
2. **TypeScript**: Full type safety with generics
3. **JSDoc**: Document hook, parameters, and return value
4. **Example**: Provide usage example
5. **Cleanup**: Properly clean up effects
6. **SSR Safe**: Handle server-side rendering

## Utility Guidelines

### Utility Structure

```typescript
/**
 * Format a number as Indian Rupees currency.
 *
 * @param amount - The amount to format
 * @param options - Optional formatting configuration
 * @returns Formatted currency string
 *
 * @example
 * formatPrice(1234.56) // "₹1,234.56"
 * formatPrice(1500000, { compact: true }) // "₹15L"
 * formatPrice(0) // "₹0.00"
 */
export function formatPrice(
  amount: number,
  options: {
    compact?: boolean;
    decimals?: number;
  } = {}
): string {
  const { compact = false, decimals = 2 } = options;

  if (compact && amount >= 100000) {
    return formatCompactCurrency(amount);
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
}
```

### Utility Requirements

1. **Pure Functions**: No side effects
2. **Type Safety**: Explicit types for params and return
3. **JSDoc**: Complete documentation
4. **Examples**: Multiple usage examples
5. **Edge Cases**: Handle null, undefined, empty
6. **Performance**: Optimize for common cases

## Testing Requirements

### Test Structure

```typescript
import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "./Button";

describe("Button", () => {
  it("renders with children", () => {
    render(<Button>Click Me</Button>);
    expect(screen.getByText("Click Me")).toBeInTheDocument();
  });

  it("calls onClick when clicked", () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click Me</Button>);

    fireEvent.click(screen.getByText("Click Me"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("is disabled when disabled prop is true", () => {
    render(<Button disabled>Click Me</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("applies correct variant classes", () => {
    render(<Button variant="primary">Click Me</Button>);
    expect(screen.getByRole("button")).toHaveClass("btn-primary");
  });
});
```

### Testing Requirements

- **Coverage**: Aim for 80%+ code coverage
- **Unit Tests**: Test each component/hook/utility
- **Integration Tests**: Test component interactions
- **Accessibility**: Test with @testing-library/jest-dom
- **Edge Cases**: Test error states and edge cases

## Documentation Requirements

### JSDoc Comments

All exports must have JSDoc comments:

```typescript
/**
 * Brief description of what it does.
 *
 * Longer explanation if needed. Can include multiple paragraphs.
 *
 * @param paramName - Description of parameter
 * @param options - Optional parameter description
 * @returns Description of return value
 *
 * @throws {ErrorType} When this error occurs
 *
 * @example
 * // Basic usage
 * const result = myFunction('value');
 *
 * @example
 * // Advanced usage
 * const result = myFunction('value', { option: true });
 *
 * @see {@link RelatedFunction} for related functionality
 */
```

### README Updates

Update relevant sections:

- Component list if adding component
- Hook list if adding hook
- Utility list if adding utility
- Examples if changing API

## Pull Request Process

### 1. Pre-submission Checklist

- [ ] All tests pass (`npm test`)
- [ ] Type checking passes (`npm run type-check`)
- [ ] Linting passes (`npm run lint`)
- [ ] Build succeeds (`npm run build`)
- [ ] Storybook story created/updated
- [ ] JSDoc comments added
- [ ] Tests written (80%+ coverage)
- [ ] Documentation updated
- [ ] CHANGELOG.md updated

### 2. Submit PR

```bash
git push origin feature/your-feature-name
```

Create pull request on GitHub with:

- Clear title describing the change
- Description of what changed and why
- Link to related issues
- Screenshots if UI changes
- Checklist of completed items

### 3. PR Template

```markdown
## Description

Brief description of changes.

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Checklist

- [ ] Tests pass
- [ ] Types pass
- [ ] Linting passes
- [ ] Documentation updated
- [ ] Storybook story added
- [ ] CHANGELOG updated

## Screenshots

If applicable, add screenshots.
```

### 4. Code Review

- Address all review comments
- Make requested changes
- Re-request review when ready

### 5. Merge

Once approved, maintainers will merge your PR.

## Storybook Stories

### Story Structure

Create a story file for each component:

```typescript
// Button.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./Button";

const meta: Meta<typeof Button> = {
  title: "Components/Button",
  component: Button,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary", "outline"],
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    variant: "primary",
    children: "Button",
  },
};

export const Secondary: Story = {
  args: {
    variant: "secondary",
    children: "Button",
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    children: "Button",
  },
};
```

### Story Requirements

- One story file per component
- Export default meta configuration
- Multiple story variants
- Interactive controls
- Accessibility addon enabled

## Questions?

If you have questions:

1. Check existing documentation
2. Search closed issues
3. Ask in pull request discussion
4. Contact maintainers

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing!** 🙏
