# Project Instructions & Standards

**LetItRip Component Library** - Development standards and coding conventions.

Last Updated: February 4, 2026

## Table of Contents

- [Project Overview](#project-overview)
- [Code Standards](#code-standards)
- [Component Development](#component-development)
- [Testing Requirements](#testing-requirements)
- [Documentation Standards](#documentation-standards)
- [Build & Deployment](#build--deployment)
- [File Organization](#file-organization)
- [Git Workflow](#git-workflow)

---

## Project Overview

### Tech Stack
- **Next.js 16.1.1** - App Router with Turbopack
- **React 19.2.0** - Server & client components
- **TypeScript 5.x** - Strict mode enabled
- **Tailwind CSS v3** - Utility-first styling
- **Jest + RTL** - Testing framework

### Quality Metrics
- **Tests:** 301/301 passing (100% pass rate)
- **Build:** Zero errors, zero warnings
- **TypeScript:** Strict mode, no type errors
- **Accessibility:** WCAG 2.1 Level AA compliant

---

## Code Standards

### TypeScript

#### Strict Mode Requirements
```typescript
// ✅ REQUIRED - All files must be strict TypeScript
interface ComponentProps {
  // Required props - no undefined
  name: string;
  onClick: () => void;
  
  // Optional props - explicit undefined
  className?: string;
  disabled?: boolean;
}

// ❌ FORBIDDEN - Any types
const data: any = {};  // Never use 'any'

// ✅ REQUIRED - Proper typing
const data: UserData = {};
```

#### Client Directives
```typescript
// ✅ REQUIRED - Add 'use client' for hooks or browser APIs
'use client';

import { useState } from 'react';

export function Component() {
  const [state, setState] = useState(0);
  // ...
}

// ✅ REQUIRED - Add 'use client' for styled-jsx
'use client';

export function Component() {
  return (
    <div>
      <style jsx>{`
        div { color: red; }
      `}</style>
    </div>
  );
}
```

#### Type Exports
```typescript
// ✅ REQUIRED - Export all prop interfaces
export interface ButtonProps {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

// ✅ REQUIRED - Use exported types
import type { ButtonProps } from '@/components';
```

### React Patterns

#### Component Structure
```tsx
// ✅ REQUIRED - Standard component structure
'use client'; // If using hooks

import React from 'react';

export interface ComponentNameProps {
  /** JSDoc for each prop */
  variant?: 'primary' | 'secondary';
  /** Size of the component */
  size?: 'sm' | 'md' | 'lg';
  /** Additional CSS classes */
  className?: string;
  /** Child elements */
  children?: React.ReactNode;
}

/**
 * ComponentName - Brief description
 * 
 * @example
 * ```tsx
 * <ComponentName variant="primary" size="md">
 *   Content
 * </ComponentName>
 * ```
 */
export function ComponentName({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
}: ComponentNameProps) {
  return (
    <div className={`component ${variant} ${size} ${className}`}>
      {children}
    </div>
  );
}
```

#### Prop Defaults
```tsx
// ✅ REQUIRED - Defaults in destructuring
function Button({ variant = 'primary', size = 'md' }: ButtonProps) {
  // ...
}

// ❌ FORBIDDEN - Defaults in props object
function Button(props: ButtonProps) {
  const variant = props.variant || 'primary'; // Don't do this
}
```

#### Hooks
```tsx
// ✅ REQUIRED - Hooks at top level
function Component() {
  const [state, setState] = useState(0);
  const value = useMemo(() => calculate(), []);
  const callback = useCallback(() => {}, []);
  
  // Then other logic
  useEffect(() => {}, []);
  
  return <div />;
}

// ❌ FORBIDDEN - Conditional hooks
function Component() {
  if (condition) {
    useState(0); // Never conditional
  }
}
```

### Naming Conventions

```
NAMING STANDARDS:

Components:     PascalCase      → Button.tsx, UserProfile.tsx
Hooks:          camelCase       → useSwipe.ts, useTheme.ts
Files:          kebab-case      → theme-utils.ts, api-client.ts
Constants:      UPPER_SNAKE     → THEME_CONSTANTS, MAX_RETRIES
Variables:      camelCase       → userName, isActive, handleClick
Types:          PascalCase      → ButtonProps, ThemeMode
Directories:    lowercase       → components/, utils/, hooks/
```

### Import Organization

```tsx
// ✅ REQUIRED - Import order
// 1. React imports
import React, { useState, useEffect } from 'react';

// 2. Third-party libraries
import { motion } from 'framer-motion';

// 3. Internal components (use @/ alias)
import { Button, Card, Input } from '@/components';

// 4. Hooks
import { useTheme } from '@/contexts';

// 5. Utils and constants
import { THEME_CONSTANTS } from '@/constants';

// 6. Types (use type imports)
import type { ButtonProps } from './types';

// 7. Styles
import './styles.css';
```

### JSDoc Requirements

```tsx
/**
 * Component description - what it does, when to use it
 * 
 * @param {PropsType} props - Component props
 * 
 * @example
 * ```tsx
 * <Component variant="primary" size="lg">
 *   Content
 * </Component>
 * ```
 * 
 * @remarks
 * Additional notes, warnings, or important information
 */
export function Component(props: PropsType) {
  // ...
}
```

---

## Component Development

### Component Checklist

Every component MUST have:

- [ ] TypeScript interface for props
- [ ] JSDoc documentation
- [ ] 'use client' directive (if using hooks/browser APIs)
- [ ] Default prop values
- [ ] Accessibility attributes (ARIA)
- [ ] Keyboard navigation support
- [ ] Dark mode support
- [ ] Responsive design
- [ ] Test file with >80% coverage
- [ ] Exported from category index.ts

### Accessibility Requirements

```tsx
// ✅ REQUIRED - Accessible components
function Button({ 
  children, 
  onClick, 
  disabled,
  'aria-label': ariaLabel 
}: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-disabled={disabled}
    >
      {children}
    </button>
  );
}

// ✅ REQUIRED - Keyboard navigation
function CustomButton({ onClick }: Props) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.();
    }
  };
  
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={handleKeyDown}
    >
      Content
    </div>
  );
}
```

### Dark Mode Support

```tsx
// ✅ REQUIRED - All components support dark mode
import { useTheme } from '@/contexts';

function Component() {
  const { theme } = useTheme();
  
  return (
    <div data-theme={theme} className="component">
      {/* Use CSS variables for theming */}
      <style jsx>{`
        .component {
          background-color: var(--color-background);
          color: var(--color-text);
        }
      `}</style>
    </div>
  );
}

// ✅ REQUIRED - Use THEME_CONSTANTS
import { THEME_CONSTANTS } from '@/constants';

const bgColor = theme === 'dark' 
  ? THEME_CONSTANTS.darkMode.background.primary
  : THEME_CONSTANTS.colors.gray[50];
```

### Component Categories

Place components in correct subdirectory:

```
src/components/
├── ui/           # Basic UI (Button, Card, Badge, Avatar, Divider, etc.)
├── forms/        # Form inputs (Input, Select, Checkbox, Radio, etc.)
├── feedback/     # User feedback (Alert, Modal, Toast)
├── layout/       # Page structure (Navbar, Sidebar, Footer)
├── typography/   # Text display (Heading, Text, Label, Caption)
└── utility/      # Helper components (Search, BackToTop, Dropdown)
```

---

## Testing Requirements

### Test Standards

```tsx
// ✅ REQUIRED - Test file structure
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '@/contexts';
import { ComponentName } from '../ComponentName';

// Helper for theme-aware tests
function renderWithTheme(ui: React.ReactElement) {
  return render(
    <ThemeProvider>
      {ui}
    </ThemeProvider>
  );
}

describe('ComponentName', () => {
  describe('Rendering', () => {
    it('renders without crashing', () => {
      renderWithTheme(<ComponentName />);
    });
    
    it('renders children correctly', () => {
      renderWithTheme(<ComponentName>Test Content</ComponentName>);
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });
  });
  
  describe('Props', () => {
    it('applies variant classes', () => {
      const { container } = renderWithTheme(
        <ComponentName variant="primary" />
      );
      expect(container.firstChild).toHaveClass('primary');
    });
    
    it('handles disabled state', () => {
      renderWithTheme(<ComponentName disabled />);
      const element = screen.getByRole('button');
      expect(element).toBeDisabled();
    });
  });
  
  describe('Interactions', () => {
    it('handles click events', () => {
      const handleClick = jest.fn();
      renderWithTheme(<ComponentName onClick={handleClick} />);
      
      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });
  
  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      renderWithTheme(<ComponentName aria-label="Test" />);
      expect(screen.getByLabelText('Test')).toBeInTheDocument();
    });
    
    it('supports keyboard navigation', () => {
      const handleClick = jest.fn();
      renderWithTheme(<ComponentName onClick={handleClick} />);
      
      const element = screen.getByRole('button');
      fireEvent.keyDown(element, { key: 'Enter' });
      expect(handleClick).toHaveBeenCalled();
    });
  });
  
  describe('Dark Mode', () => {
    it('renders correctly in dark mode', () => {
      // Test dark mode specific rendering
    });
  });
});
```

### Testing Requirements

- ✅ **Minimum 80% code coverage**
- ✅ **Test all props and variants**
- ✅ **Test user interactions (click, keyboard, etc.)**
- ✅ **Test accessibility attributes**
- ✅ **Test dark mode rendering**
- ✅ **Test edge cases (empty, null, invalid props)**

### Running Tests

```bash
# Before committing - ALL tests must pass
npm test                    # Run all tests
npm test -- --coverage      # Check coverage
npm test ComponentName      # Test specific component
```

**CRITICAL:** Zero failing tests allowed. Fix all test failures before committing.

---

## Documentation Standards

### Component Documentation

Every component needs documentation in `/docs/components/README.md`:

```markdown
### ComponentName

Brief description of what the component does and when to use it.

**Props:**
- `variant` - 'primary' | 'secondary' | 'error' - Component style variant
- `size` - 'sm' | 'md' | 'lg' - Component size
- `disabled` - boolean - Disable component interaction
- `className` - string - Additional CSS classes
- `children` - ReactNode - Child elements

**Example:**
\`\`\`tsx
import { ComponentName } from '@/components';

<ComponentName variant="primary" size="md">
  Content here
</ComponentName>
\`\`\`

**Accessibility:**
- Supports keyboard navigation (Enter/Space)
- ARIA labels included
- Screen reader compatible

**Dark Mode:**
- Automatically adapts to theme
- Uses CSS variables
```

### Documentation Locations

```
docs/
├── README.md                # Main documentation index
├── getting-started.md       # Setup guide
├── development.md           # Development workflow
├── project-structure.md     # File organization
├── components/
│   └── README.md           # All component documentation
├── guides/
│   ├── theming.md          # Theme system guide
│   ├── testing.md          # Testing patterns
│   ├── mobile-gestures.md  # Gesture hooks guide
│   └── accessibility.md    # Accessibility guide
└── api/
    ├── hooks.md            # Hook API reference
    ├── contexts.md         # Context API reference
    └── constants.md        # Constants reference
```

---

## Build & Deployment

### Pre-Commit Checklist

```bash
# ✅ REQUIRED - Must pass before commit
npm test                    # All tests pass
npm run build               # Build succeeds
npm run lint                # No linting errors
```

### Build Requirements

- ✅ **Zero build errors**
- ✅ **Zero TypeScript errors**
- ✅ **Zero console warnings**
- ✅ **All tests passing (301/301)**
- ✅ **Production build successful**

### Deployment Steps

```bash
# 1. Verify all tests pass
npm test

# 2. Build for production
npm run build

# 3. Test production build locally
npm start

# 4. Verify in browser
# http://localhost:3000

# 5. Deploy (if all checks pass)
```

---

## File Organization

### Barrel Exports

```typescript
// ✅ REQUIRED - Use barrel exports
// src/components/ui/index.ts
export * from './Button';
export * from './Card';
export * from './Badge';

// ✅ REQUIRED - Import from barrel
import { Button, Card, Badge } from '@/components';

// ❌ FORBIDDEN - Direct imports
import { Button } from '@/components/ui/Button';
```

### File Structure

```
src/
├── app/                      # Next.js pages
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Home page
│   └── globals.css          # Global styles
├── components/              # All components
│   ├── ui/                  # UI components
│   │   ├── Button.tsx
│   │   ├── __tests__/
│   │   │   └── Button.test.tsx
│   │   └── index.ts         # Barrel export
│   ├── forms/               # Form components
│   ├── feedback/            # Feedback components
│   ├── layout/              # Layout components
│   ├── typography/          # Typography components
│   ├── utility/             # Utility components
│   └── index.ts             # Main barrel export
├── hooks/                   # Custom hooks
│   ├── useSwipe.ts
│   ├── useGesture.ts
│   └── index.ts
├── contexts/                # React contexts
│   ├── ThemeContext.tsx
│   └── index.ts
├── constants/               # Constants
│   ├── theme.ts
│   └── index.ts
└── index.ts                 # Root barrel export

docs/                        # Documentation
├── README.md
├── getting-started.md
├── components/
├── guides/
└── api/
```

### Path Aliases

```typescript
// ✅ REQUIRED - Use @ alias for imports
import { Button } from '@/components';
import { useTheme } from '@/contexts';
import { THEME_CONSTANTS } from '@/constants';

// ❌ FORBIDDEN - Relative paths
import { Button } from '../../../components/ui/Button';
```

---

## Git Workflow

### Branch Naming

```bash
feature/component-name      # New features
fix/bug-description         # Bug fixes
docs/documentation-update   # Documentation
test/test-improvements      # Testing
refactor/code-improvement   # Refactoring
```

### Commit Messages

Follow conventional commits:

```bash
feat: add NewComponent with dark mode support
fix: resolve Button hover state in dark mode
docs: update component documentation
test: add tests for NewComponent interactions
refactor: simplify theme switching logic
style: format code with Prettier
chore: update dependencies
```

### Commit Requirements

Before every commit:

```bash
# 1. Run tests
npm test

# 2. Build project
npm run build

# 3. Check linting
npm run lint

# 4. Stage changes
git add .

# 5. Commit with message
git commit -m "feat: add new component"
```

---

## Common Patterns

### Form Components

```tsx
'use client';

import React, { forwardRef } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', ...props }, ref) => {
    const inputId = props.id || `input-${Math.random()}`;
    
    return (
      <div className={`input-group ${className}`}>
        {label && (
          <label htmlFor={inputId}>
            {label}
            {props.required && <span aria-label="required">*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
          {...props}
        />
        {error && (
          <span id={`${inputId}-error`} role="alert" className="error">
            {error}
          </span>
        )}
        {helperText && !error && (
          <span id={`${inputId}-helper`} className="helper">
            {helperText}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
```

### Modal/Dialog Components

```tsx
'use client';

import React, { useEffect, useRef } from 'react';
import { useClickOutside } from '@/hooks';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  
  // Close on outside click
  useClickOutside(modalRef, onClose, { enabled: isOpen });
  
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);
  
  // Focus trap and restoration
  useEffect(() => {
    if (!isOpen) return;
    
    const previousFocus = document.activeElement as HTMLElement;
    const modal = modalRef.current;
    if (!modal) return;
    
    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0] as HTMLElement;
    firstElement?.focus();
    
    return () => {
      previousFocus?.focus();
    };
  }, [isOpen]);
  
  if (!isOpen) return null;
  
  return (
    <>
      <div className="modal-backdrop" aria-hidden="true" />
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        className="modal"
      >
        {title && <h2 id="modal-title">{title}</h2>}
        {children}
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="close-button"
        >
          ×
        </button>
      </div>
    </>
  );
}
```

---

## Performance Standards

### Optimization Requirements

```tsx
// ✅ REQUIRED - Memoize expensive components
const MemoizedComponent = React.memo(ExpensiveComponent);

// ✅ REQUIRED - Memoize callbacks
const handleClick = useCallback(() => {
  // Handler logic
}, [dependencies]);

// ✅ REQUIRED - Memoize computed values
const computedValue = useMemo(() => {
  return expensiveCalculation(data);
}, [data]);

// ✅ REQUIRED - Lazy load heavy components
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Spinner />,
});
```

### Bundle Size

- ✅ Keep bundle size minimal
- ✅ Use dynamic imports for large components
- ✅ Implement code splitting per route
- ✅ Optimize images with Next.js Image component

---

## Error Handling

### Component Error Boundaries

```tsx
// ✅ REQUIRED - Graceful error handling
try {
  // Risky operation
} catch (error) {
  console.error('Component error:', error);
  // Show fallback UI
}

// ✅ REQUIRED - Null checks
function Component({ data }: Props) {
  if (!data) {
    return <div>No data available</div>;
  }
  
  return <div>{data.value}</div>;
}
```

---

## Final Checklist

Before considering any work complete:

- [ ] All tests pass (301/301)
- [ ] Production build succeeds
- [ ] Zero TypeScript errors
- [ ] Zero console warnings
- [ ] Component documented
- [ ] Accessibility verified
- [ ] Dark mode tested
- [ ] Responsive design confirmed
- [ ] Code reviewed
- [ ] Git commit with conventional message

---

## Resources

- [Project Documentation](./docs/README.md)
- [Component Library](./docs/components/README.md)
- [Testing Guide](./docs/guides/testing.md)
- [Accessibility Guide](./docs/guides/accessibility.md)
- [Development Guide](./docs/development.md)

---

**Last Updated:** February 4, 2026
**Maintainer:** Development Team
**Status:** ✅ Production Ready (301 tests passing, zero errors)
