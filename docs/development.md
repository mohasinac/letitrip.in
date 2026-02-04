# Development Guide

Complete guide for developing with LetItRip component library.

## Table of Contents

- [Environment Setup](#environment-setup)
- [Development Workflow](#development-workflow)
- [Adding New Components](#adding-new-components)
- [Code Standards](#code-standards)
- [Testing](#testing)
- [Building](#building)
- [Debugging](#debugging)
- [Common Tasks](#common-tasks)

---

## Environment Setup

### Requirements

- **Node.js:** 18.0.0 or higher
- **npm:** 9.0.0 or higher
- **Git:** For version control
- **VS Code:** Recommended IDE

### Initial Setup

```bash
# Clone repository
git clone <repository-url>
cd letitrip.in

# Install dependencies
npm install

# Start development server
npm run dev
```

### Recommended VS Code Extensions

- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Enhanced TypeScript support
- **Tailwind CSS IntelliSense** - Tailwind class autocomplete
- **Jest** - Test runner integration

### Environment Configuration

Create `.env.local` for local development:

```env
# Example environment variables
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## Development Workflow

### Starting Development

```bash
# Start dev server with Turbopack
npm run dev

# Open browser to http://localhost:3000
```

### Hot Reload

Turbopack provides instant hot reload:
- **Component changes** - Instant reload
- **Style changes** - Instant update
- **Config changes** - Requires restart

### Development Server Options

```bash
# Custom port
npm run dev -- -p 3001

# Custom hostname
npm run dev -- -H 0.0.0.0
```

---

## Adding New Components

### Step-by-Step Process

#### 1. Choose Component Category

Determine the appropriate directory:
- `ui/` - Basic UI elements (Button, Card, Badge)
- `forms/` - Form inputs and controls
- `feedback/` - Alerts, modals, notifications
- `layout/` - Navigation and page structure
- `typography/` - Text display components
- `utility/` - Helper components (Search, BackToTop)

#### 2. Create Component File

Create file in chosen directory:

```tsx
// src/components/ui/NewComponent.tsx
'use client'; // If using hooks or interactivity

import React from 'react';

export interface NewComponentProps {
  /**
   * Variant style
   */
  variant?: 'primary' | 'secondary';
  
  /**
   * Component size
   */
  size?: 'sm' | 'md' | 'lg';
  
  /**
   * Additional CSS classes
   */
  className?: string;
  
  /**
   * Child elements
   */
  children?: React.ReactNode;
}

/**
 * NewComponent - Brief description
 * 
 * @example
 * ```tsx
 * <NewComponent variant="primary" size="md">
 *   Content
 * </NewComponent>
 * ```
 */
export function NewComponent({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
}: NewComponentProps) {
  return (
    <div className={`new-component ${variant} ${size} ${className}`}>
      {children}
    </div>
  );
}
```

#### 3. Add Tests

Create test file:

```tsx
// src/components/ui/__tests__/NewComponent.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { NewComponent } from '../NewComponent';

describe('NewComponent', () => {
  it('renders children', () => {
    render(<NewComponent>Test Content</NewComponent>);
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });
  
  it('applies variant classes', () => {
    const { container } = render(
      <NewComponent variant="secondary">Content</NewComponent>
    );
    expect(container.firstChild).toHaveClass('secondary');
  });
});
```

#### 4. Export from Category Index

Update category's `index.ts`:

```tsx
// src/components/ui/index.ts
export * from './Button';
export * from './Card';
export * from './NewComponent'; // Add this
```

#### 5. Document Component

Add to [Component Documentation](./components/README.md):

```markdown
### NewComponent

Brief description of the component.

**Props:**
- `variant` - 'primary' | 'secondary'
- `size` - 'sm' | 'md' | 'lg'
- `className` - Additional CSS classes
- `children` - Child elements

**Example:**
\`\`\`tsx
<NewComponent variant="primary" size="md">
  Content
</NewComponent>
\`\`\`
```

---

## Code Standards

### TypeScript

**Strict Mode**
```typescript
// Always use strict TypeScript
interface Props {
  name: string;        // ✅ Required props
  age?: number;        // ✅ Optional props  
  onClick: () => void; // ✅ Function types
}
```

**Type Exports**
```typescript
// Export interfaces for reuse
export interface ButtonProps {
  variant?: 'primary' | 'secondary';
}

// Use in other files
import type { ButtonProps } from '@/components';
```

**Generic Types**
```typescript
function GenericComponent<T>({ data }: { data: T[] }) {
  return <>{/* ... */}</>;
}
```

### React Patterns

**Functional Components**
```tsx
// ✅ Good - Arrow function
export const Component = ({ prop }: Props) => {
  return <div>{prop}</div>;
};

// ✅ Also good - Function declaration
export function Component({ prop }: Props) {
  return <div>{prop}</div>;
}
```

**Props Destructuring**
```tsx
// ✅ Good - Destructure in params
function Button({ variant, size, children }: ButtonProps) {
  return <button>{children}</button>;
}

// ❌ Bad - Access via props object
function Button(props: ButtonProps) {
  return <button>{props.children}</button>;
}
```

**Default Props**
```tsx
// ✅ Good - Default in destructuring
function Button({ variant = 'primary' }: ButtonProps) {
  // ...
}
```

### Naming Conventions

**Components**
```
PascalCase for components
Button.tsx, UserProfile.tsx, NavigationBar.tsx
```

**Files**
```
kebab-case for non-component files
utils.ts, theme-constants.ts, api-client.ts
```

**Variables/Functions**
```
camelCase for variables and functions
const userName = 'John';
function getUserData() {}
```

**Constants**
```
UPPER_SNAKE_CASE for constants
const MAX_RETRIES = 3;
const API_BASE_URL = '...';
```

**Types/Interfaces**
```
PascalCase for types and interfaces
interface UserData {}
type Theme = 'light' | 'dark';
```

### Import Order

```tsx
// 1. React imports
import React, { useState, useEffect } from 'react';

// 2. Third-party libraries
import { motion } from 'framer-motion';

// 3. Internal components
import { Button, Card } from '@/components';

// 4. Hooks
import { useTheme } from '@/contexts';

// 5. Utils and constants
import { THEME_CONSTANTS } from '@/constants';

// 6. Types
import type { ButtonProps } from './types';

// 7. Styles (if any)
import './styles.css';
```

### JSDoc Comments

```tsx
/**
 * Button component with multiple variants
 * 
 * @param {ButtonProps} props - Component props
 * @param {string} props.variant - Button style variant
 * @param {string} props.size - Button size
 * 
 * @example
 * ```tsx
 * <Button variant="primary" size="lg">
 *   Click Me
 * </Button>
 * ```
 */
export function Button({ variant, size }: ButtonProps) {
  // ...
}
```

---

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Watch mode
npm test -- --watch

# Coverage report
npm test -- --coverage

# Specific file
npm test Button.test.tsx
```

### Test Structure

```tsx
describe('ComponentName', () => {
  // Rendering tests
  describe('Rendering', () => {
    it('renders without crashing', () => {});
    it('renders children correctly', () => {});
  });
  
  // Props tests
  describe('Props', () => {
    it('applies variant styles', () => {});
    it('handles size prop', () => {});
  });
  
  // Interaction tests
  describe('Interactions', () => {
    it('handles click events', () => {});
    it('handles keyboard navigation', () => {});
  });
  
  // Edge cases
  describe('Edge Cases', () => {
    it('handles empty children', () => {});
    it('handles invalid props', () => {});
  });
});
```

### Testing Best Practices

See [Testing Guide](./guides/testing.md) for comprehensive patterns.

---

## Building

### Development Build

```bash
# Build with development mode
npm run build
```

### Production Build

```bash
# Build for production
npm run build

# Test production build locally
npm start
```

### Build Output

```
.next/
├── cache/           # Build cache
├── server/          # Server-side code
├── static/          # Static assets
└── standalone/      # Standalone build (if configured)
```

### Build Optimization

**Automatic optimizations:**
- Code splitting by route
- Tree shaking unused code
- Image optimization
- CSS minification
- JavaScript compression

**Manual optimizations:**
```tsx
// Dynamic imports for large components
const HeavyComponent = dynamic(() => import('./HeavyComponent'));

// Image optimization
import Image from 'next/image';
<Image src="/photo.jpg" width={500} height={500} alt="Photo" />
```

---

## Debugging

### Browser DevTools

**React DevTools**
- Install React DevTools extension
- Inspect component tree
- View props and state
- Profile performance

**Chrome DevTools**
```bash
# Enable source maps
npm run dev
# Sources tab shows original TypeScript
```

### VS Code Debugging

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug server-side",
      "type": "node-terminal",
      "request": "launch",
      "command": "npm run dev"
    },
    {
      "name": "Next.js: debug client-side",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:3000"
    }
  ]
}
```

### Console Logging

```tsx
// Component debugging
console.log('[Button] Rendering with props:', { variant, size });

// Effect debugging
useEffect(() => {
  console.log('[Button] Effect triggered:', dependency);
}, [dependency]);
```

### Error Boundaries

```tsx
// Create error boundary
class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    console.error('Error caught:', error, errorInfo);
  }
  
  render() {
    return this.props.children;
  }
}

// Use in app
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

---

## Common Tasks

### Adding a New Page

```tsx
// app/new-page/page.tsx
export default function NewPage() {
  return (
    <div>
      <h1>New Page</h1>
    </div>
  );
}
```

### Adding API Route

```tsx
// app/api/hello/route.ts
export async function GET(request: Request) {
  return Response.json({ message: 'Hello' });
}
```

### Updating Theme

```typescript
// src/constants/theme.ts
export const THEME_CONSTANTS = {
  colors: {
    primary: {
      DEFAULT: '#NEW_COLOR',
    },
  },
};
```

### Adding New Hook

```tsx
// src/hooks/useCustomHook.ts
'use client';

export function useCustomHook() {
  const [state, setState] = useState(null);
  
  useEffect(() => {
    // Hook logic
  }, []);
  
  return state;
}
```

### Updating Dependencies

```bash
# Check for updates
npm outdated

# Update specific package
npm update package-name

# Update all packages (careful!)
npm update
```

---

## Git Workflow

### Branch Strategy

```bash
# Create feature branch
git checkout -b feature/new-component

# Create fix branch
git checkout -b fix/button-styling

# Create docs branch
git checkout -b docs/update-readme
```

### Commit Messages

Follow conventional commits:

```bash
git commit -m "feat: add NewComponent with variants"
git commit -m "fix: resolve Button hover state issue"
git commit -m "docs: update component documentation"
git commit -m "test: add tests for NewComponent"
git commit -m "refactor: simplify theme logic"
```

### Before Committing

```bash
# Run tests
npm test

# Check linting
npm run lint

# Build to verify
npm run build
```

---

## Performance Tips

### Component Optimization

```tsx
// Memoize expensive components
const MemoizedComponent = React.memo(ExpensiveComponent);

// Memoize callbacks
const handleClick = useCallback(() => {
  // Handler
}, [dependencies]);

// Memoize computed values
const computedValue = useMemo(() => {
  return expensiveCalculation(data);
}, [data]);
```

### Bundle Analysis

```bash
# Install analyzer
npm install --save-dev @next/bundle-analyzer

# Add to next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer(nextConfig);

# Run analysis
ANALYZE=true npm run build
```

---

## Troubleshooting

### Common Issues

**Build Errors**
```bash
# Clear cache and rebuild
rm -rf .next
npm run build
```

**Type Errors**
```bash
# Restart TypeScript server in VS Code
Cmd+Shift+P -> "TypeScript: Restart TS Server"
```

**Module Not Found**
```bash
# Verify imports use correct path alias
import { Button } from '@/components'; // ✅
import { Button } from '../components'; // ❌
```

**Tests Failing**
```bash
# Clear Jest cache
npm test -- --clearCache
```

---

## Next Steps

- Review [Project Structure](./project-structure.md)
- Explore [Component API](./components/README.md)
- Read [Testing Guide](./guides/testing.md)
- Check [Theming Guide](./guides/theming.md)
