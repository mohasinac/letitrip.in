# Contributing to @letitrip/react-library

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to the library.

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher
- Git

### Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/react-library.git
   cd react-library
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## 📝 Development Workflow

### Running Locally

```bash
# Start development mode (watch mode)
npm run dev

# Run Storybook for component development
npm run storybook

# Run tests in watch mode
npm run test:watch

# Type checking
npm run type-check

# Linting
npm run lint
```

### Making Changes

1. **Components**: Add new components in `src/components/`
2. **Hooks**: Add new hooks in `src/hooks/`
3. **Utils**: Add new utilities in `src/utils/`
4. **Types**: Add new types in `src/types/`
5. **Styles**: Update design tokens in `src/styles/tokens/`

### Code Style

- Use TypeScript for all code
- Follow existing naming conventions
- Write JSDoc comments for public APIs
- Use meaningful variable and function names
- Keep functions small and focused

### Writing Tests

- Write tests for all new features
- Aim for >80% code coverage
- Use Vitest and React Testing Library
- Place tests next to the code: `MyComponent.test.tsx`

Example test:

```typescript
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MyComponent } from "./MyComponent";

describe("MyComponent", () => {
  it("renders correctly", () => {
    render(<MyComponent title="Test" />);
    expect(screen.getByText("Test")).toBeInTheDocument();
  });
});
```

### Writing Storybook Stories

All components should have stories for documentation and testing.

```typescript
import type { Meta, StoryObj } from "@storybook/react";
import { MyComponent } from "./MyComponent";

const meta: Meta<typeof MyComponent> = {
  title: "Components/MyComponent",
  component: MyComponent,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: "Example",
  },
};
```

## ✅ Before Submitting

### Checklist

- [ ] Code follows the project's style guidelines
- [ ] All tests pass: `npm test`
- [ ] Type checking passes: `npm run type-check`
- [ ] Linting passes: `npm run lint`
- [ ] Build succeeds: `npm run build`
- [ ] Added tests for new features
- [ ] Updated documentation (README, JSDoc)
- [ ] Added Storybook stories for new components
- [ ] Verified changes in Storybook
- [ ] Updated CHANGELOG.md (if applicable)

### Running All Checks

```bash
# Run all checks at once
npm run lint && npm run type-check && npm test && npm run build
```

## 📦 Pull Request Process

1. Update the README.md with details of changes (if needed)
2. Update the CHANGELOG.md with your changes
3. Ensure all tests pass and the build succeeds
4. Create a Pull Request with a clear title and description
5. Link any relevant issues
6. Wait for review from maintainers

### PR Title Format

Use conventional commit format:

- `feat: Add new component`
- `fix: Fix button styling issue`
- `docs: Update README`
- `refactor: Improve hook performance`
- `test: Add tests for utility function`
- `chore: Update dependencies`

### PR Description Template

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] Bug fix (non-breaking change fixing an issue)
- [ ] New feature (non-breaking change adding functionality)
- [ ] Breaking change (fix or feature causing existing functionality to break)
- [ ] Documentation update

## Testing

How has this been tested?

## Screenshots (if applicable)

Add screenshots or GIFs

## Checklist

- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] Storybook stories added/updated
```

## 🏗️ Project Structure

```
react-library/
├── src/
│   ├── components/     # React components
│   ├── hooks/          # Custom React hooks
│   ├── utils/          # Utility functions
│   ├── types/          # TypeScript types
│   └── styles/         # CSS and design tokens
├── stories/            # Storybook stories
├── docs/               # Documentation
├── scripts/            # Build and utility scripts
└── tests/              # Test utilities
```

## 🎨 Design System

When adding new components or styles:

- Use existing design tokens from `src/styles/tokens/`
- Follow the color palette
- Maintain consistency with existing components
- Support dark mode
- Ensure accessibility (WCAG 2.1 AA)

## 📚 Documentation

### JSDoc Comments

All exported functions, components, and utilities should have JSDoc comments:

````typescript
/**
 * Formats a price with currency symbol and Indian number format
 * @param amount - The price amount in rupees
 * @param options - Formatting options
 * @returns Formatted price string (e.g., "₹1,23,456.00")
 * @example
 * ```ts
 * formatPrice(123456) // "₹1,23,456.00"
 * formatPrice(123456, { showSymbol: false }) // "1,23,456.00"
 * ```
 */
export function formatPrice(amount: number, options?: PriceOptions): string {
  // Implementation
}
````

### Component Props

Document all props with TypeScript interfaces and JSDoc:

```typescript
export interface ButtonProps {
  /** Button text content */
  children: React.ReactNode;
  /** Button visual style variant */
  variant?: "primary" | "secondary" | "outline";
  /** Button size */
  size?: "sm" | "md" | "lg";
  /** Disabled state */
  disabled?: boolean;
  /** Click handler */
  onClick?: () => void;
}
```

## 🐛 Reporting Bugs

### Before Reporting

- Check existing issues
- Verify it's reproducible
- Test in latest version

### Bug Report Template

```markdown
**Describe the bug**
A clear description

**To Reproduce**
Steps to reproduce:

1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What should happen

**Screenshots**
If applicable

**Environment:**

- OS: [e.g. Windows 11]
- Browser: [e.g. Chrome 120]
- Library Version: [e.g. 1.0.0]
- Node Version: [e.g. 20.10.0]
```

## 💡 Suggesting Features

We welcome feature suggestions! Please:

1. Check if it already exists
2. Explain the use case
3. Provide examples
4. Consider implementation complexity

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

## 🤝 Code of Conduct

### Our Standards

- Be respectful and inclusive
- Welcome newcomers
- Accept constructive criticism
- Focus on what's best for the community

### Unacceptable Behavior

- Harassment or discrimination
- Trolling or insulting comments
- Publishing private information
- Other unprofessional conduct

## 📞 Contact

- GitHub Issues: [Report bugs or suggest features](https://github.com/letitrip/react-library/issues)
- Discussions: [Ask questions](https://github.com/letitrip/react-library/discussions)

## 🎉 Recognition

Contributors will be recognized in:

- CHANGELOG.md
- README.md (Contributors section)
- GitHub contributors page

Thank you for contributing! 🙏
