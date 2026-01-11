# @letitrip/react-library

Reusable React components and utilities for Letitrip platform.

## 🚀 Features

- **Utilities**: 12+ utility modules (formatters, validators, date utils)
- **Components**: 33+ React components (forms, UI, values, pickers)
- **Hooks**: 10+ custom React hooks
- **TypeScript**: Full TypeScript support with type definitions
- **Storybook**: Complete component documentation
- **Accessible**: WCAG 2.1 AA compliant components

## 📦 Installation

This is a workspace package. No installation needed - it's referenced locally.

## 🎯 Usage

```typescript
// Import utilities
import { formatPrice, formatDate, isValidEmail } from "@letitrip/react-library";

// Import components
import { FormInput, Button, DateDisplay } from "@letitrip/react-library";

// Import hooks
import { useDebounce, useMediaQuery } from "@letitrip/react-library";
```

### Alternative: Specific imports for tree-shaking

```typescript
import { formatPrice } from "@letitrip/react-library/utils";
import { FormInput } from "@letitrip/react-library/components";
import { useDebounce } from "@letitrip/react-library/hooks";
```

## 📚 Documentation

Run Storybook to view complete component documentation:

```bash
npm run storybook
```

## 🛠️ Development

```bash
# Install dependencies
npm install

# Build library
npm run build

# Watch mode for development
npm run dev

# Run tests
npm test

# Run Storybook
npm run storybook

# Build Storybook
npm run build-storybook
```

## 📂 Structure

```
src/
├── utils/          # Utility functions
├── components/     # React components
├── hooks/          # React hooks
├── styles/         # Styles and theme
└── types/          # TypeScript types
```

## 🧪 Testing

```bash
npm test
```

## 📖 Storybook

View component documentation and examples:

```bash
npm run storybook
```

## 🤝 Contributing

This library is part of the Letitrip monorepo. See main repository for contribution guidelines.

## 📄 License

MIT

---

**Version**: 1.0.0
**Status**: In Development
**Last Updated**: January 12, 2026
