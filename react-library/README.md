# @letitrip/react-library

Reusable React components and utilities for Letitrip platform.

## 🚀 Features

### ✅ Week 14 Complete (Utilities & Setup)

- **Utilities**: 6 utility modules with 60+ functions
  - **Formatters** (25+ functions): Currency, dates, numbers, text, Indian formats
  - **Validators** (10+ functions): Email, phone, pincode, GST, PAN validation
  - **Date utilities** (6 functions): Safe date manipulation, ISO conversion
  - **Price utilities** (3 functions): Currency formatting with discounts
  - **Sanitization** (5 functions): XSS prevention, HTML cleaning
  - **Accessibility** (13 functions): ARIA helpers, keyboard nav, screen reader support
- **Components**: 20 value display components
  - **Date Components**: DateDisplay, RelativeDate, DateRange
  - **Price**: Price with discount badges and multiple sizes
  - **Status Badges**: Auction, Payment, Shipping, Stock status
  - **Formatted Values**: Address, Email, Phone, Rating, OrderId, SKU, etc.
- **Storybook**: Complete documentation with 27+ interactive examples
  - Utility stories: Formatters, Validators, DateUtils
  - Component stories: DateDisplay, Price, StatusBadges
  - Introduction guide with usage examples
- **Build System**: Vite 5.x with TypeScript 5.3+
  - Output: ESM + CommonJS with type definitions
  - Bundle size: ~147KB total (43KB utils, 35KB components, gzipped ~35KB)
  - Build time: ~7 seconds
- **TypeScript**: Full type safety with generated .d.ts files
- **Accessible**: WCAG 2.1 AA compliant utilities and components

### 🚧 Coming Soon (Weeks 15-16)

- **Form Components**: 21 accessible form inputs (Week 15)
- **UI Components**: Button, Card, Modal, Tabs, etc. (Week 15)
- **Hooks**: useDebounce, useMediaQuery, useLocalStorage, etc. (Week 15)
- **Styles**: Theme utilities and global styles (Week 16)

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
react-library/
├── src/
│   ├── index.ts                    # Main entry point
│   ├── utils/                      # Utility functions ✅
│   │   ├── index.ts
│   │   ├── cn.ts                   # Tailwind class merging
│   │   ├── formatters.ts           # 25+ formatting functions
│   │   ├── validators.ts           # 10+ validation functions
│   │   ├── date-utils.ts           # Date manipulation
│   │   ├── price.utils.ts          # Price formatting
│   │   ├── sanitize.ts             # XSS prevention
│   │   └── accessibility.ts        # A11y helpers
│   ├── components/                 # React components ✅ (20 components)
│   │   ├── index.ts
│   │   └── values/                 # Value display components
│   ├── hooks/                      # React hooks (Coming soon)
│   ├── styles/                     # Styles and theme (Coming soon)
│   └── types/                      # TypeScript types
├── stories/                        # Storybook documentation ✅
│   ├── Introduction.stories.mdx
│   ├── utils/                      # Utility stories
│   └── components/                 # Component stories
├── dist/                           # Build output (generated)
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 📊 Bundle Sizes

- **Utils**: 42.36 KB raw (13.57 KB gzipped)
- **Components**: 34.84 KB raw (7.97 KB gzipped)
- **Total**: ~147 KB raw (~35 KB gzipped)
- **Build time**: ~7 seconds

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
