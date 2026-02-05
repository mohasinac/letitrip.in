# Letitrip.in - Travel Platform

A modern Next.js 16 travel platform with comprehensive authentication, user management, and professional software engineering practices.

## 🚀 Features

- ⚡️ **Next.js 16** with App Router & Turbopack
- 🔐 **NextAuth v5** with multiple providers (Credentials, Google, Apple)
- 🎨 **Tailwind CSS** with custom design system
- 📦 **Custom Component Library** with 40+ reusable components
- 🔥 **TypeScript** with full type safety
- 🗄️ **Firebase/Firestore** for database and auth
- 📧 **Resend** for email service
- 🛡️ **Security Best Practices** with bcrypt password hashing
- 🎯 **Professional Architecture** following SOLID principles

## 📚 Documentation

**Start Here:**
- 🌟 **[Quick Reference Guide](./docs/QUICK_REFERENCE.md)** - Common patterns and quick lookups
- 📖 **[Getting Started](./docs/getting-started.md)** - Installation and setup
- 🏗️ **[Engineering Guide](./docs/ENGINEERING_IMPROVEMENTS.md)** - Architecture and best practices
- 🤝 **[Contributing](./CONTRIBUTING.md)** - How to contribute

**Full Documentation:**
- [Documentation Index](./docs/README.md) - Complete documentation navigation
- [Project Structure](./docs/project-structure.md) - Directory organization
- [Component Library](./docs/components/README.md) - UI components
- [API Documentation](./docs/api/) - API reference
- [Refactoring Summary](./docs/REFACTORING_SUMMARY.md) - Code evolution

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Firebase project with Firestore
- Resend account (for emails)

### Installation

```bash
# 1. Clone the repository
git clone <repository-url>
cd letitrip.in

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# 4. Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

### Build for Production

```bash
npm run build
npm start
```

### Theme System

- **Dark Mode** - Automatic system detection with manual toggle
- **CSS Variables** - Dynamic theming with CSS custom properties
- **Variants** - Primary, secondary, success, error, warning, info
- **Responsive** - Mobile-first breakpoints (sm, md, lg, xl, 2xl)

### Mobile Gestures

5 custom hooks for advanced touch interactions:

- `useSwipe` - Swipe detection with velocity tracking
- `useGesture` - Multi-touch (tap, double-tap, pinch, rotate)
- `useLongPress` - Long-press with movement threshold
- `useClickOutside` - Outside-click handler
- `useKeyPress` - Keyboard shortcuts with modifiers

### Performance

- **Code Splitting** - Automatic route-based splitting
- **Tree Shaking** - Dead code elimination
- **Lazy Loading** - Dynamic imports for heavy components
- **Optimized Assets** - Image optimization with Next.js Image

## 📖 Example Usage

```tsx
import { Button, Card, Input, useSwipe } from '@/index';
import { useTheme } from '@/contexts';
import { useRef } from 'react';

function ExampleComponent() {
  const { theme, toggleTheme } = useTheme();
  const cardRef = useRef<HTMLDivElement>(null);
  
  useSwipe(cardRef, {
    onSwipeLeft: () => console.log('Swiped left!'),
    minSwipeDistance: 50,
  });
  
  return (
    <Card ref={cardRef}>
      <h1>Current theme: {theme}</h1>
      <Button onClick={toggleTheme} variant="primary">
        Toggle Theme
      </Button>
      <Input placeholder="Enter text..." />
    </Card>
  );
}
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Watch mode
npm test -- --watch

# Coverage report
npm test -- --coverage
```

**Current Status:** 301 tests passing across 27 test suites

## 🤝 Contributing

1. Follow the existing project structure
2. Add tests for new components
3. Update documentation in `/docs`
4. Use TypeScript strict mode
5. Follow accessibility guidelines (WCAG 2.1)

## 📄 License

MIT

## 🔗 Links

- [Documentation](./docs/README.md)
- [Component API](./docs/components/README.md)
- [Gesture Hooks](./docs/api/hooks.md)
- [Testing Guide](./docs/guides/testing.md)

---

**Built with ❤️ using Next.js, React, and TypeScript**


## 🎨 Styling System

### Theme Constants
All styling uses centralized `THEME_CONSTANTS`:
- Automatic dark mode support
- No hardcoded colors or spacing
- Consistent design system

