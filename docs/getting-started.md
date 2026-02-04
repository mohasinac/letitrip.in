# Getting Started

This guide will help you set up and start developing with LetItRip.

## Prerequisites

- **Node.js:** v18.0.0 or higher
- **npm:** v9.0.0 or higher
- **Git:** For version control

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd letitrip.in
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Copy the example environment file and configure it:

```bash
cp .env.example .env.local
```

Update `.env.local` with your configuration:

```env
NEXT_PUBLIC_API_URL=https://api.example.com
NEXT_PUBLIC_SITE_NAME=LetItRip
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Development Scripts

```bash
# Development server with Turbopack
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate test coverage report
npm run test:coverage
```

## First Steps

### 1. Review Components

Use the barrel export for easy imports:

```tsx
import { Button, Card, Input, useToast } from '@/index';
```

Or import from specific directories:

```tsx
import { Button } from '@/components/ui';
import { Input } from '@/components/forms';
```

### 3. Use Theme System

All components support dark mode automatically:

```tsx
import { ThemeProvider, useTheme } from '@/contexts';

function App() {
  return (
    <ThemeProvider>
      <YourApp />
    </ThemeProvider>
  );
}

function YourComponent() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <button onClick={toggleTheme}>
      Current theme: {theme}
    </button>
  );
}
```

### 4. Add Gesture Support

Use gesture hooks for mobile interactions:

```tsx
import { useSwipe, useGesture } from '@/hooks';

function MyComponent() {
  const ref = useRef<HTMLDivElement>(null);
  
  useSwipe(ref, {
    onSwipeLeft: () => console.log('Swiped left'),
    onSwipeRight: () => console.log('Swiped right'),
  });
  
  return <div ref={ref}>Swipe me!</div>;
}
```

## Project Structure

```
letitrip.in/
├── src/
│   ├── app/                # Next.js pages (App Router)
│   │   ├── page.tsx        # Home page
│   │   ├── layout.tsx      # Root layout
│   │   └── demo/           # Component demo page
│   ├── components/         # UI components
│   │   ├── ui/             # Basic UI components
│   │   ├── forms/          # Form inputs
│   │   ├── feedback/       # Alerts, modals, toasts
│   │   ├── layout/         # Navigation & layout
│   │   └── typography/     # Text components
│   ├── hooks/              # Custom React hooks
│   │   ├── useSwipe.ts
│   │   ├── useGesture.ts
│   │   └── ...
│   ├── contexts/           # React contexts
│   │   ├── ThemeContext.tsx
│   │   └── index.ts
│   ├── constants/          # Configuration & themes
│   │   ├── theme.ts
│   │   ├── navigation.tsx
│   │   └── site.ts
│   ├── utils/              # Utility functions
│   │   └── eventHandlers.ts
│   └── index.ts            # Main barrel export
├── docs/                   # Documentation
├── public/                 # Static assets
└── tests/                  # Test files

```

## IDE Setup

### VS Code (Recommended)

Install recommended extensions:

1. **ESLint** - Code linting
2. **Prettier** - Code formatting
3. **Tailwind CSS IntelliSense** - CSS class autocomplete
4. **TypeScript and JavaScript** - Language support

### Settings

Add to `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

## Next Steps

- Read the [Component Documentation](./components/README.md)
- Learn about [Mobile Gestures](./guides/mobile-gestures.md)
- Explore [Theme Customization](./guides/theming.md)
- Check [Testing Guide](./guides/testing.md)

## Troubleshooting

### Port Already in Use

```bash
# Kill process on port 3000 (Windows)
npx kill-port 3000

# Or use a different port
npm run dev -- -p 3001
```

### Module Not Found

```bash
# Clear cache and reinstall
rm -rf node_modules .next
npm install
```

### TypeScript Errors

```bash
# Regenerate type definitions
npm run build
```

## Getting Help

- Check the [FAQ](./guides/faq.md)
- Review [API Documentation](./api/hooks.md)
- Search existing issues in the repository
