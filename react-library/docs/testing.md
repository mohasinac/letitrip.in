# React Library - Integration Testing Documentation

## Testing Overview

The React Library includes comprehensive testing for all components, hooks, and utilities to ensure reliability and maintainability.

## Test Stack

- **Test Runner**: Vitest 1.6.1
- **Testing Library**: @testing-library/react 14.2.1
- **DOM Testing**: @testing-library/dom, @testing-library/user-event
- **Coverage**: Vitest coverage with v8 provider

## Running Tests

### Basic Commands

```bash
# Run all tests once
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Type checking (no emit)
npm run type-check
```

### All Available Scripts

```bash
npm run dev           # Development server with watch mode
npm run build         # Production build
npm run build:analyze # Build + bundle size analysis
npm run test          # Run tests once
npm run test:coverage # Tests with coverage report
npm run type-check    # TypeScript type checking
npm run lint          # ESLint code linting
npm run storybook     # Storybook development server
```

## Test Structure

```
src/
├── components/
│   ├── forms/
│   │   ├── __tests__/
│   │   │   └── FormInput.test.tsx
│   │   └── FormInput.tsx
│   ├── ui/
│   │   ├── __tests__/
│   │   │   └── Button.test.tsx
│   │   └── Button.tsx
│   └── values/
│       ├── __tests__/
│       │   └── displays.test.tsx
│       └── *.tsx
└── hooks/
    ├── __tests__/
    │   └── *.test.ts
    └── *.ts
```

## Test Coverage

Current test coverage (v8):

| Category              | Statements | Branches | Functions | Lines  |
| --------------------- | ---------- | -------- | --------- | ------ |
| **Overall**           | 19.09%     | 33.62%   | 8.49%     | 19.09% |
| **Tested Components** | 80%+       | 60%+     | 50%+      | 80%+   |

### Covered Areas

✅ **Form Components**:

- FormInput (80.6% coverage)
- Error handling and validation
- Accessibility features
- Character count display
- Sanitization on blur

✅ **UI Components**:

- Button (93.47% coverage)
- All variants (primary, secondary, danger, ghost, outline)
- All sizes (sm, md, lg)
- Loading states
- Disabled states

✅ **Value Display Components**:

- Price formatting
- Date display
- Auction status badges
- Rating display

✅ **Utilities**:

- Accessibility helpers (51.69% coverage)
- Class name merging (cn - 100% coverage)
- Price utilities (62.58% coverage)
- Formatters (39.27% coverage)
- Sanitizers (37.59% coverage)

### Areas for Expansion

⏳ **Pending Test Coverage**:

- Remaining form components (FormSelect, FormTextarea, FormCheckbox)
- Additional value display components
- Hook utilities (useDebounce, useLocalStorage, useMediaQuery)
- Date utilities
- Validators

## Writing Tests

### Component Test Example

```typescript
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Button } from "../Button";

describe("Button", () => {
  it("should render children", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  it("should be disabled when disabled prop is true", () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });
});
```

### Hook Test Example

```typescript
import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDebounce } from "../useDebounce";

describe("useDebounce", () => {
  it("should debounce value changes", async () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: "initial" } }
    );

    expect(result.current).toBe("initial");

    rerender({ value: "updated" });
    expect(result.current).toBe("initial"); // Still initial

    await act(() => new Promise((resolve) => setTimeout(resolve, 600)));
    expect(result.current).toBe("updated"); // Now updated
  });
});
```

## Test Configuration

### Vitest Configuration

Located in `vitest.config.ts`:

```typescript
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    css: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "src/test/",
        "**/*.d.ts",
        "**/*.config.*",
        "**/mockData",
        "**/*.type.ts",
      ],
    },
  },
});
```

### Test Setup

Test utilities are configured in `src/test/setup.ts`:

```typescript
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

// Cleanup after each test
afterEach(() => {
  cleanup();
});
```

## TypeScript Type Checking

### Configuration

TypeScript is configured to exclude test files from production type checking while maintaining type safety during development:

```json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "skipLibCheck": true
  },
  "include": ["src"],
  "exclude": [
    "node_modules",
    "dist",
    "build",
    "**/__tests__",
    "**/*.test.ts",
    "**/*.test.tsx"
  ]
}
```

### Running Type Checks

```bash
# Check types without emitting files
npm run type-check

# Type checking happens automatically during build
npm run build
```

## Continuous Integration

### GitHub Actions Workflow

CI/CD pipeline runs on every push and pull request:

```yaml
name: Test Library

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "20"
      - run: npm ci
      - run: npm run type-check
      - run: npm run lint
      - run: npm test
      - run: npm run build
```

## Best Practices

### 1. Test File Naming

- Component tests: `ComponentName.test.tsx`
- Hook tests: `hookName.test.ts`
- Utility tests: `utilityName.test.ts`
- Group related tests: `displays.test.tsx` for multiple display components

### 2. Test Organization

```typescript
describe("ComponentName", () => {
  describe("rendering", () => {
    // Rendering tests
  });

  describe("interactions", () => {
    // User interaction tests
  });

  describe("accessibility", () => {
    // A11y tests
  });
});
```

### 3. Test Coverage Goals

- **Components**: 80%+ coverage
- **Hooks**: 90%+ coverage
- **Utilities**: 90%+ coverage
- **Overall**: 80%+ coverage

### 4. What to Test

✅ **Do Test**:

- Component rendering
- Props handling
- User interactions
- Accessibility features
- Error states
- Edge cases

❌ **Don't Test**:

- Implementation details
- Third-party library internals
- CSS styling specifics
- Exact DOM structure

### 5. Accessibility Testing

Every component should include accessibility tests:

```typescript
it("should be accessible", () => {
  const { container } = render(<Component />);
  expect(container.firstChild).toHaveAttribute("role");
  expect(container.firstChild).toHaveAttribute("aria-label");
});
```

## Troubleshooting

### Common Issues

**Issue**: Tests fail with "Cannot find module"  
**Solution**: Check import paths and ensure vitest config includes proper path resolution

**Issue**: Coverage reports show 0%  
**Solution**: Ensure test files are not in coverage exclude list

**Issue**: Type errors in test files  
**Solution**: Test files are excluded from `npm run type-check`. Use IDE for test file type checking.

**Issue**: Tests timeout  
**Solution**: Increase timeout in vitest config or specific test:

```typescript
it(
  "async test",
  async () => {
    // Test code
  },
  { timeout: 10000 }
);
```

### Getting Help

- Check [Vitest Documentation](https://vitest.dev/)
- Review [Testing Library Best Practices](https://testing-library.com/docs/guiding-principles)
- See example tests in `src/components/__tests__/`

## Future Improvements

### Planned Enhancements

1. **Visual Regression Testing**

   - Integrate Chromatic or Percy
   - Screenshot comparison for UI components
   - Automatic visual diff reports

2. **E2E Testing**

   - Add Playwright or Cypress
   - Test full user workflows
   - Cross-browser testing

3. **Performance Testing**

   - Component render performance
   - Hook performance benchmarks
   - Bundle size impact testing

4. **Mutation Testing**

   - Integrate Stryker
   - Verify test quality
   - Identify missing test cases

5. **Accessibility Auditing**
   - Automated a11y testing with axe
   - WCAG 2.1 AA compliance verification
   - Screen reader testing automation

---

**Last Updated**: January 14, 2026  
**Test Framework**: Vitest 1.6.1  
**Coverage Provider**: v8  
**Current Test Files**: 3  
**Current Test Count**: 21 passing  
**Overall Coverage**: 19.09% (target: 80%)
