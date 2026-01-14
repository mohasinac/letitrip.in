# @letitrip/react-library

**Reusable React components, hooks, utilities, and design system for the Letitrip platform.**

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/letitrip/react-library)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18%20%7C%2019-blue.svg)](https://react.dev/)

## 📦 What's Included

### ✅ Components (33)

- **20 Value Display Components**: DateDisplay, Price, Rating, Status badges, and more
- **9 Form Components**: FormInput, FormSelect, FormDatePicker, FormPhoneInput, etc.
- **2 UI Components**: Button (5 variants), Card/CardSection
- **2 Upload Components**: ImageUploadWithCrop, VideoUploadWithThumbnail

### ✅ Hooks (19)

- **Debounce & Throttle** (3): useDebounce, useDebouncedCallback, useThrottle
- **Storage** (1): useLocalStorage with cross-tab sync
- **Responsive** (7): useMediaQuery, useIsMobile, useViewport, useBreakpoint, and more
- **Upload** (1): useMediaUpload with progress tracking and validation
- **Utilities** (6): useToggle, usePrevious, useClipboard, useCounter, useInterval, useTimeout

### ✅ Utilities (60+)

- **Formatters** (25+): Currency, dates, numbers, Indian formats, addresses
- **Validators** (10+): Email, phone, pincode, GST, PAN validation
- **Date Utils** (6): Safe date manipulation, ISO conversion
- **Price Utils** (3): Currency formatting with discounts
- **Sanitization** (5): XSS prevention, HTML cleaning
- **Accessibility** (13): ARIA helpers, keyboard nav, screen reader support

### ✅ Design System

- **CSS Tokens** (200+): Colors, typography, spacing, shadows, borders, animations
- **Tailwind Config**: Complete theme with CSS variables
- **Dark Mode**: Built-in theme switching support

## 🚀 Quick Start

### Installation

This library is part of the Letitrip workspace and doesn't require separate installation.

### Basic Usage

```typescript
// Import utilities
import { formatPrice, formatDate, cn } from "@letitrip/react-library/utils";

// Import components
import {
  FormInput,
  Button,
  DateDisplay,
} from "@letitrip/react-library/components";

// Import hooks
import { useDebounce, useMediaQuery } from "@letitrip/react-library/hooks";

// Import design tokens
import "@letitrip/react-library/styles/tokens";
```

### Example: Form with Validation

```tsx
import { FormInput, Button } from "@letitrip/react-library/components";
import { validateEmail } from "@letitrip/react-library/utils";
import { useDebounce } from "@letitrip/react-library/hooks";
import { useState } from "react";

function ContactForm() {
  const [email, setEmail] = useState("");
  const debouncedEmail = useDebounce(email, 300);
  const isValid = validateEmail(debouncedEmail);

  return (
    <form>
      <FormInput
        label="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={!isValid ? "Invalid email address" : undefined}
      />
      <Button type="submit" disabled={!isValid}>
        Submit
      </Button>
    </form>
  );
}
```

### Example: Responsive UI

```tsx
import { useIsMobile, useBreakpoint } from "@letitrip/react-library/hooks";

function ResponsiveNav() {
  const isMobile = useIsMobile();
  const breakpoint = useBreakpoint();

  return (
    <nav>
      {isMobile ? <MobileMenu /> : <DesktopMenu />}
      <p>Current breakpoint: {breakpoint}</p>
    </nav>
  );
}
```

### Example: Image Upload with Crop

```tsx
import {
  ImageUploadWithCrop,
  type CropData,
} from "@letitrip/react-library/components";
import { useMediaUpload } from "@letitrip/react-library/hooks";

function ProductImageUpload() {
  const { upload, isUploading, progress } = useMediaUpload({
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ["image/jpeg", "image/png"],
    context: "product",
  });

  return (
    <ImageUploadWithCrop
      onUpload={async (file, cropData) => {
        const url = await upload(file);
        // Save url and cropData to your backend
        console.log("Uploaded:", url, cropData);
      }}
      maxSize={5 * 1024 * 1024}
      aspectRatio={4 / 3}
    />
  );
}
```

### Example: Video Upload with Thumbnail

```tsx
import { VideoUploadWithThumbnail } from "@letitrip/react-library/components";
import { useMediaUpload } from "@letitrip/react-library/hooks";

function ProductVideoUpload() {
  const videoUpload = useMediaUpload({
    maxSize: 50 * 1024 * 1024, // 50MB
    context: "product-video",
  });

  const thumbnailUpload = useMediaUpload({
    maxSize: 2 * 1024 * 1024, // 2MB
    context: "product-thumbnail",
  });

  return (
    <VideoUploadWithThumbnail
      onUpload={async (videoFile, thumbnailFile) => {
        const videoUrl = await videoUpload.upload(videoFile);
        const thumbUrl = thumbnailFile
          ? await thumbnailUpload.upload(thumbnailFile)
          : null;
        console.log("Video:", videoUrl, "Thumbnail:", thumbUrl);
      }}
      maxSize={50 * 1024 * 1024}
      maxDuration={300}
    />
  );
}
```

## 📚 Documentation

- **[Getting Started Guide](docs/getting-started.md)** - Setup and first steps
- **[Migration Guide](docs/migration-guide.md)** - Migrating from old imports
- **[Testing Guide](docs/testing.md)** - Running tests and writing new ones
- **[Release Notes](docs/RELEASE.md)** - v1.0.0 release highlights
- **[Contributing Guide](docs/contributing.md)** - Development workflow
- **[Changelog](docs/CHANGELOG.md)** - Version history
- **[Theme System](src/styles/README.md)** - Design tokens and theming

## 📊 Performance & Quality

### Bundle Sizes (Production)

- **Total**: ~297 KB (without source maps)
- **ESM**: 269 KB (97.3% of code)
- **CommonJS**: 7.5 KB (compatibility)
- **TypeScript Defs**: 63 KB
- **CSS Tokens**: 28 KB

### Build Metrics

- Build time: ~6.3 seconds
- Tree-shaking: Enabled
- Code splitting: Automatic
- Minification: Terser (2-pass)

### Testing & Quality

- Test coverage: 21 tests passing (100%)
- Type checking: Pass (0 errors)
- TypeScript: Strict mode
- Accessibility: WCAG 2.1 AA compliant
- CI/CD: Automated via GitHub Actions
- **[Changelog](docs/changelog.md)** - Version history

### Storybook

Interactive component documentation:

```bash
cd react-library
npm run storybook
```

Open [http://localhost:6006](http://localhost:6006) to view.

## 🎨 Design System

### Import CSS Tokens

```css
/* In your global CSS or _app.tsx */
@import "@letitrip/react-library/styles/tokens";
```

### Use Tailwind Theme

```javascript
// tailwind.config.js
const libraryConfig = require("@letitrip/react-library/tailwind.config.js");

module.exports = {
  ...libraryConfig,
  content: [...libraryConfig.content, "./src/**/*.{js,ts,jsx,tsx}"],
};
```

### CSS Variables

```css
.my-component {
  color: var(--color-primary);
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border-primary);
  box-shadow: var(--shadow-md);
  border-radius: var(--radius-md);
}
```

## 🛠️ Development

### Build Commands

```bash
# Build library
npm run build

# Watch mode for development
npm run dev

# Run tests
npm test

# Lint code
npm run lint
```

### Storybook Commands

```bash
# Start Storybook dev server
npm run storybook

# Build Storybook static site
npm run build-storybook
```

## 📦 Package Structure

```
@letitrip/react-library/
├── dist/                          # Built output
│   ├── index.js                   # ESM entry
│   ├── index.cjs                  # CommonJS entry
│   ├── index.d.ts                 # TypeScript types
│   ├── utils/                     # Utility exports
│   ├── components/                # Component exports
│   ├── hooks/                     # Hook exports
│   └── styles/                    # Style exports
│       └── tokens/                # CSS design tokens
├── src/                           # Source code
│   ├── components/                # React components
│   │   ├── values/                # Value display components (20)
│   │   ├── forms/                 # Form components (9)
│   │   └── ui/                    # UI components (2)
│   ├── hooks/                     # React hooks (18)
│   ├── utils/                     # Utility functions (60+)
│   └── styles/                    # Design tokens & theme
│       └── tokens/                # CSS token files (7)
├── stories/                       # Storybook stories
└── docs/                          # Documentation
```

## 📊 Bundle Size

- **Total**: ~224KB raw, ~51KB gzipped
- **Components**: 80KB (15.9KB gzipped)
- **Hooks**: 7.2KB (2.2KB gzipped)
- **Utils**: 108KB (26.8KB gzipped)
- **CSS Tokens**: 29KB (7KB gzipped)
- **Build Time**: ~7.3 seconds

## 🎯 Features

### Type Safety

- Full TypeScript support with generated `.d.ts` files
- Strict type checking enabled
- Comprehensive prop type definitions

### Accessibility

- WCAG 2.1 AA compliant
- ARIA attributes on all interactive components
- Keyboard navigation support
- Screen reader friendly

### Performance

- Tree-shakeable exports
- Code splitting by module
- Optimized bundle sizes
- SSR-safe hooks (Next.js compatible)

### Developer Experience

- Comprehensive Storybook documentation
- TypeScript autocomplete
- Inline JSDoc comments
- Usage examples for all exports

## 🔄 Migration from Old Imports

```typescript
// Old (direct imports from src)
import { formatPrice } from "@/lib/formatters";
import { FormInput } from "@/components/common/FormInput";
import { useDebounce } from "@/hooks/useDebounce";

// New (library imports)
import { formatPrice } from "@letitrip/react-library/utils";
import { FormInput } from "@letitrip/react-library/components";
import { useDebounce } from "@letitrip/react-library/hooks";
```

See the [Migration Guide](docs/migration-guide.md) for detailed instructions.

## 📝 Contributing

See [CONTRIBUTING.md](docs/contributing.md) for development guidelines.

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🔗 Links

- **Storybook**: http://localhost:6006 (when running locally)
- **Documentation**: [docs/](docs/)
- **Main App**: [../](../)

---

**Built with ❤️ for Letitrip**
