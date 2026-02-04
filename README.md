# LetItRip

A modern, mobile-optimized component library built with Next.js 16, React 19, and TypeScript.

## ✨ Highlights

- 🎨 **40+ Production-Ready Components** - Complete UI library with dark mode
- 📱 **Mobile Gestures** - Advanced touch interactions (swipe, pinch, rotate, long-press)
- 🎯 **100% TypeScript** - Full type safety with strict mode
- ⚡ **Performance** - Optimized with Turbopack, tree-shaking, lazy loading
- ♿ **Accessible** - WCAG compliant with ARIA labels and keyboard navigation
- 🧪 **Well Tested** - 301+ tests with Jest and React Testing Library

## 📚 Documentation

Complete documentation available in the [`/docs`](./docs) folder:

- **[Getting Started](./docs/getting-started.md)** - Installation and setup
- **[Project Structure](./docs/project-structure.md)** - Directory organization
- **[Components](./docs/components/README.md)** - Component library overview
- **[Mobile Gestures](./docs/guides/mobile-gestures.md)** - Touch interaction guide
- **[Theming](./docs/guides/theming.md)** - Theme system and dark mode
- **[Testing](./docs/guides/testing.md)** - Testing patterns and best practices
- **[API Reference](./docs/api/)** - Hooks, contexts, and constants

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## 🛠️ Tech Stack

- **Next.js 16.1.1** - App Router with Turbopack
- **React 19.2.0** - Server & client components
- **TypeScript 5.x** - Strict mode enabled
- **Tailwind CSS v3** - Utility-first styling
- **Jest + RTL** - Comprehensive testing suite

## 📦 Component Categories

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

