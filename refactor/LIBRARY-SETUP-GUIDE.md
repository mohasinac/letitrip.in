# React Library Extraction - Setup Guide

**Project:** Extract reusable utilities, components, and styles into `@letitrip/react-library`
**Status:** Planning Phase
**Created:** January 12, 2026

## Table of Contents

1. [Overview](#overview)
2. [Workspace Configuration](#workspace-configuration)
3. [Library Structure](#library-structure)
4. [Build Configuration](#build-configuration)
5. [Storybook Setup](#storybook-setup)
6. [Migration Strategy](#migration-strategy)
7. [Files to Extract](#files-to-extract)
8. [Import Path Updates](#import-path-updates)

---

## Overview

### Goals

- **Create submodule**: Set up `react-library` as Git submodule
- **Workspace package**: Configure as `@letitrip/react-library`
- **Extract reusables**: Move 50+ utilities, 30+ components
- **Add Storybook**: Document all components with stories
- **Clean imports**: Enable `import { X } from '@letitrip/react-library'`
- **No publishing**: Use workspace reference only

### Scope

**Utilities (30+ files)**

- Formatters (date, price, phone, number, etc.)
- Validators (email, phone, pincode, URL)
- Date utilities (manipulation, formatting)
- String utilities (cn, slugify, truncate)
- Accessibility helpers
- Sanitization functions

**Components (30+ components)**

- Form components (20 components)
- UI components (Button, Card, Modal, etc.)
- Value displays (DateDisplay, Price, etc.)
- Pickers (DateTimePicker, Country, State)
- Layout components

**Hooks (10+ hooks)**

- useMediaQuery, useDebounce, useLocalStorage
- useClipboard, usePrevious, useToggle
- Other generic React hooks

**Styles**

- Tailwind configuration
- Theme utilities
- CSS variables
- Design tokens

---

## Workspace Configuration

### 1. Check Package Manager

```powershell
# Check which package manager is used
if (Test-Path "pnpm-lock.yaml") { Write-Host "Using PNPM" }
elseif (Test-Path "yarn.lock") { Write-Host "Using Yarn" }
elseif (Test-Path "package-lock.json") { Write-Host "Using NPM" }
```

### 2. Create Submodule

```bash
# Create react-library directory
mkdir react-library
cd react-library

# Initialize Git
git init
git remote add origin <your-react-library-repo-url>

# Go back to main repo
cd ..

# Add as submodule (optional - or just use as workspace package)
# git submodule add <your-react-library-repo-url> react-library
```

### 3. Update Root package.json

Add workspace configuration:

```json
{
  "name": "letitrip",
  "workspaces": ["react-library"],
  "scripts": {
    "lib:dev": "cd react-library && npm run dev",
    "lib:build": "cd react-library && npm run build",
    "lib:storybook": "cd react-library && npm run storybook"
  }
}
```

### 4. Update TypeScript Paths

**Root tsconfig.json:**

```json
{
  "compilerOptions": {
    "paths": {
      "@letitrip/react-library": ["./react-library/src"],
      "@letitrip/react-library/*": ["./react-library/src/*"]
    }
  }
}
```

---

## Library Structure

### Directory Layout

```
react-library/
├── .storybook/                # Storybook configuration
│   ├── main.ts
│   ├── preview.ts
│   └── preview-head.html
├── src/
│   ├── index.ts              # Main export file
│   ├── utils/                # Utility functions
│   │   ├── index.ts
│   │   ├── formatters.ts     # Date, price, phone formatters
│   │   ├── validators.ts     # Email, phone, URL validators
│   │   ├── date-utils.ts     # Date manipulation
│   │   ├── string-utils.ts   # cn, slugify, truncate
│   │   ├── sanitize.ts       # Input sanitization
│   │   └── accessibility.ts  # A11y helpers
│   ├── components/           # React components
│   │   ├── index.ts
│   │   ├── forms/            # Form components
│   │   │   ├── FormInput.tsx
│   │   │   ├── FormTextarea.tsx
│   │   │   ├── FormSelect.tsx
│   │   │   ├── FormPhoneInput.tsx
│   │   │   ├── FormCurrencyInput.tsx
│   │   │   ├── FormDatePicker.tsx
│   │   │   ├── FormField.tsx
│   │   │   └── index.ts
│   │   ├── ui/               # UI primitives
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── index.ts
│   │   ├── values/           # Value display components
│   │   │   ├── DateDisplay.tsx
│   │   │   ├── Price.tsx
│   │   │   └── index.ts
│   │   └── pickers/          # Picker components
│   │       ├── DateTimePicker.tsx
│   │       └── index.ts
│   ├── hooks/                # React hooks
│   │   ├── index.ts
│   │   ├── useMediaQuery.ts
│   │   ├── useDebounce.ts
│   │   ├── useLocalStorage.ts
│   │   ├── useClipboard.ts
│   │   └── usePrevious.ts
│   ├── styles/               # Styles and theme
│   │   ├── index.ts
│   │   ├── theme.ts
│   │   └── tailwind.config.ts
│   └── types/                # TypeScript types
│       ├── index.ts
│       └── common.ts
├── stories/                  # Storybook stories
│   ├── Introduction.stories.mdx
│   ├── utils/
│   │   ├── Formatters.stories.tsx
│   │   └── Validators.stories.tsx
│   ├── components/
│   │   ├── forms/
│   │   │   ├── FormInput.stories.tsx
│   │   │   └── FormPhoneInput.stories.tsx
│   │   └── ui/
│   │       └── Button.stories.tsx
│   └── hooks/
│       └── useDebounce.stories.tsx
├── package.json
├── tsconfig.json
├── vite.config.ts            # Build configuration
├── README.md
├── CHANGELOG.md
└── .gitignore
```

### Main Export (src/index.ts)

```typescript
// Utilities
export * from "./utils";

// Components
export * from "./components";

// Hooks
export * from "./hooks";

// Styles
export * from "./styles";

// Types
export * from "./types";
```

---

## Build Configuration

### package.json

```json
{
  "name": "@letitrip/react-library",
  "version": "1.0.0",
  "description": "Reusable React components and utilities for Letitrip",
  "type": "module",
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "require": "./dist/index.cjs",
      "types": "./dist/index.d.ts"
    },
    "./utils": {
      "import": "./dist/utils/index.js",
      "require": "./dist/utils/index.cjs",
      "types": "./dist/utils/index.d.ts"
    },
    "./components": {
      "import": "./dist/components/index.js",
      "require": "./dist/components/index.cjs",
      "types": "./dist/components/index.d.ts"
    },
    "./hooks": {
      "import": "./dist/hooks/index.js",
      "require": "./dist/hooks/index.cjs",
      "types": "./dist/hooks/index.d.ts"
    }
  },
  "files": ["dist"],
  "scripts": {
    "dev": "vite build --watch",
    "build": "tsc && vite build",
    "lint": "eslint src --ext ts,tsx",
    "test": "vitest",
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build"
  },
  "peerDependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  },
  "devDependencies": {
    "@storybook/react": "^7.6.0",
    "@storybook/react-vite": "^7.6.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32",
    "tailwindcss": "^3.4.0",
    "typescript": "^5.3.0",
    "vite": "^5.0.0",
    "vitest": "^1.0.0"
  },
  "dependencies": {
    "clsx": "^2.1.0",
    "date-fns": "^3.0.0",
    "libphonenumber-js": "^1.10.0",
    "tailwind-merge": "^2.2.0"
  }
}
```

### vite.config.ts

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [
    react(),
    dts({
      insertTypesEntry: true,
    }),
  ],
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, "src/index.ts"),
        utils: resolve(__dirname, "src/utils/index.ts"),
        components: resolve(__dirname, "src/components/index.ts"),
        hooks: resolve(__dirname, "src/hooks/index.ts"),
      },
      name: "LetitripReactLibrary",
      formats: ["es", "cjs"],
    },
    rollupOptions: {
      external: ["react", "react-dom", "react/jsx-runtime"],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
          "react/jsx-runtime": "jsxRuntime",
        },
      },
    },
  },
});
```

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,

    /* Types */
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,

    /* Paths */
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

---

## Storybook Setup

### .storybook/main.ts

```typescript
import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  stories: ["../stories/**/*.mdx", "../stories/**/*.stories.@(js|jsx|ts|tsx)"],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
    "@storybook/addon-a11y",
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  docs: {
    autodocs: "tag",
  },
};

export default config;
```

### .storybook/preview.ts

```typescript
import type { Preview } from "@storybook/react";
import "../src/styles/tailwind.css";

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
};

export default preview;
```

### Example Story - stories/components/forms/FormInput.stories.tsx

```typescript
import type { Meta, StoryObj } from "@storybook/react";
import { FormInput } from "../../../src/components/forms/FormInput";

const meta = {
  title: "Components/Forms/FormInput",
  component: FormInput,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    label: { control: "text" },
    type: {
      control: "select",
      options: ["text", "email", "password", "number"],
    },
  },
} satisfies Meta<typeof FormInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: "Username",
    placeholder: "Enter your username",
  },
};

export const WithError: Story = {
  args: {
    label: "Email",
    type: "email",
    error: "Please enter a valid email address",
  },
};

export const Required: Story = {
  args: {
    label: "Full Name",
    required: true,
  },
};

export const Disabled: Story = {
  args: {
    label: "Disabled Input",
    disabled: true,
    value: "Cannot edit this",
  },
};
```

---

## Migration Strategy

### Phase 1: Setup (Task 14.1)

1. **Create directory structure**

   ```powershell
   mkdir react-library
   cd react-library
   npm init -y
   ```

2. **Install dependencies**

   ```powershell
   npm install --save-dev vite @vitejs/plugin-react typescript
   npm install --save-dev @storybook/react @storybook/react-vite
   npm install --save-dev vite-plugin-dts
   npm install clsx tailwind-merge date-fns libphonenumber-js
   ```

3. **Create config files**

   - vite.config.ts
   - tsconfig.json
   - .storybook/main.ts
   - .storybook/preview.ts

4. **Update root workspace**
   - Add "workspaces" to root package.json
   - Update root tsconfig.json with paths

### Phase 2: Utilities Migration (Tasks 14.2-14.6)

1. **Copy utility files** (don't delete from main app yet)

   - src/lib/formatters.ts → react-library/src/utils/formatters.ts
   - src/lib/validators.ts → react-library/src/utils/validators.ts
   - src/lib/date-utils.ts → react-library/src/utils/date-utils.ts
   - src/lib/utils.ts → react-library/src/utils/string-utils.ts
   - src/lib/sanitize.ts → react-library/src/utils/sanitize.ts
   - src/lib/accessibility.ts → react-library/src/utils/accessibility.ts
   - src/lib/price.utils.ts → react-library/src/utils/price.ts

2. **Create index files**

   - react-library/src/utils/index.ts (export all utilities)

3. **Add Storybook stories**

   - stories/utils/Formatters.stories.tsx
   - stories/utils/Validators.stories.tsx

4. **Test library build**

   ```powershell
   cd react-library
   npm run build
   ```

5. **Update ONE file in main app as test**

   ```typescript
   // Before
   import { formatPrice } from "@/lib/formatters";

   // After
   import { formatPrice } from "@letitrip/react-library";
   ```

6. **Verify it works, then continue**

### Phase 3: Component Migration (Tasks 15.1-15.6)

1. **Copy form components** (maintain in main app initially)

   - src/components/forms/_ → react-library/src/components/forms/_

2. **Copy UI components**

   - src/components/ui/_ → react-library/src/components/ui/_

3. **Copy value displays**

   - src/components/common/values/_ → react-library/src/components/values/_

4. **Copy pickers**

   - src/components/common/DateTimePicker.tsx → react-library/src/components/pickers/

5. **Add Storybook stories for each component**

6. **Test components in Storybook**

   ```powershell
   cd react-library
   npm run storybook
   ```

7. **Update imports gradually**
   - Start with one component type (e.g., FormInput)
   - Test thoroughly
   - Move to next component

### Phase 4: Hooks Migration (Task 15.4)

1. **Copy generic hooks**

   - src/hooks/useMediaQuery.ts → react-library/src/hooks/
   - src/hooks/useDebounce.ts → react-library/src/hooks/
   - (other generic hooks)

2. **Add hook stories**

3. **Update imports**

### Phase 5: Styles Migration (Task 16.1)

1. **Extract Tailwind config**

   - Create react-library/tailwind.config.ts
   - Export reusable theme tokens

2. **Extract CSS variables**

3. **Test styling in Storybook**

### Phase 6: Cleanup (After all migrations)

1. **Delete original files from main app**

   - Only after all imports updated
   - Use grep to find any remaining old imports

2. **Final testing**
   - Run all tests
   - Build main app
   - Verify nothing broken

---

## Files to Extract

### Utilities (30+ files)

#### Core Utilities

- ✅ `src/lib/formatters.ts` → `utils/formatters.ts`
- ✅ `src/lib/validators.ts` → `utils/validators.ts`
- ✅ `src/lib/date-utils.ts` → `utils/date-utils.ts`
- ✅ `src/lib/utils.ts` → `utils/string-utils.ts` (cn, slugify, etc.)
- ✅ `src/lib/sanitize.ts` → `utils/sanitize.ts`
- ✅ `src/lib/accessibility.ts` → `utils/accessibility.ts`
- ✅ `src/lib/price.utils.ts` → `utils/price.ts`

#### Validation

- ✅ `src/lib/validation/email.ts` → `utils/validators/email.ts`
- ✅ `src/lib/validation/phone.ts` → `utils/validators/phone.ts`
- ✅ `src/lib/validation/pincode.ts` → `utils/validators/pincode.ts`
- ✅ `src/lib/form-validation.ts` → `utils/form-validation.ts`

### Components (30+ components)

#### Form Components (20 components)

- ✅ `src/components/forms/FormInput.tsx`
- ✅ `src/components/forms/FormTextarea.tsx`
- ✅ `src/components/forms/FormSelect.tsx`
- ✅ `src/components/forms/FormCheckbox.tsx`
- ✅ `src/components/forms/FormRadio.tsx`
- ✅ `src/components/forms/FormSwitch.tsx`
- ✅ `src/components/forms/FormPhoneInput.tsx`
- ✅ `src/components/forms/FormCurrencyInput.tsx`
- ✅ `src/components/forms/FormDatePicker.tsx`
- ✅ `src/components/forms/FormTimePicker.tsx`
- ✅ `src/components/forms/FormFileUpload.tsx`
- ✅ `src/components/forms/FormRichText.tsx`
- ✅ `src/components/forms/FormField.tsx`
- ✅ `src/components/forms/FormLabel.tsx`
- ✅ `src/components/forms/FormActions.tsx`
- ✅ `src/components/forms/FormSlider.tsx`
- ✅ `src/components/forms/FormColorPicker.tsx`
- ✅ `src/components/forms/FormTagInput.tsx`
- ✅ `src/components/forms/FormPasswordInput.tsx`
- ✅ `src/components/forms/FormOTPInput.tsx`
- ✅ `src/components/forms/FormRating.tsx`

#### UI Components

- ✅ `src/components/ui/Button.tsx`
- ✅ `src/components/ui/Card.tsx`
- ✅ `src/components/ui/Modal.tsx`
- ✅ `src/components/common/Tooltip.tsx`
- ✅ `src/components/common/Badge.tsx`

#### Value Displays

- ✅ `src/components/common/values/DateDisplay.tsx`
- ✅ `src/components/common/values/Price.tsx`
- ✅ `src/components/common/values/` (all value components)

#### Pickers

- ✅ `src/components/common/DateTimePicker.tsx`
- ✅ `src/components/common/StateSelector.tsx`
- ✅ `src/components/common/PincodeInput.tsx`

### Hooks (10+ hooks)

- ✅ `src/hooks/useMediaQuery.ts`
- ✅ `src/hooks/useDebounce.ts`
- ✅ `src/hooks/useLocalStorage.ts`
- ✅ `src/hooks/useClipboard.ts`
- ✅ `src/hooks/usePrevious.ts`
- ✅ `src/hooks/useToggle.ts`
- Other generic React hooks (not business-logic specific)

### Styles

- ✅ Tailwind configuration (reusable parts)
- ✅ `src/lib/theme/` utilities
- ✅ CSS variables
- ✅ Design tokens

---

## Import Path Updates

### Before (Current)

```typescript
// Utilities
import { formatPrice, formatDate } from "@/lib/formatters";
import { isValidEmail, isValidPhone } from "@/lib/validators";
import { cn, slugify } from "@/lib/utils";

// Components
import { FormInput } from "@/components/forms/FormInput";
import { FormPhoneInput } from "@/components/forms/FormPhoneInput";
import { DateDisplay } from "@/components/common/values/DateDisplay";

// Hooks
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useDebounce } from "@/hooks/useDebounce";
```

### After (With Library)

```typescript
// Utilities
import { formatPrice, formatDate } from "@letitrip/react-library";
import { isValidEmail, isValidPhone } from "@letitrip/react-library";
import { cn, slugify } from "@letitrip/react-library";

// Components
import { FormInput, FormPhoneInput } from "@letitrip/react-library";
import { DateDisplay } from "@letitrip/react-library";

// Hooks
import { useMediaQuery, useDebounce } from "@letitrip/react-library";
```

### Alternative (Specific Imports for Tree-Shaking)

```typescript
// Import specific modules
import { formatPrice, formatDate } from "@letitrip/react-library/utils";
import { FormInput, FormPhoneInput } from "@letitrip/react-library/components";
import { useMediaQuery, useDebounce } from "@letitrip/react-library/hooks";
```

### Update Script

Create a PowerShell script to update imports:

```powershell
# update-imports.ps1

# Find all TypeScript files
$files = Get-ChildItem -Path "src" -Include "*.ts","*.tsx" -Recurse

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw

    # Update utility imports
    $content = $content -replace "from '@/lib/formatters'", "from '@letitrip/react-library'"
    $content = $content -replace "from '@/lib/validators'", "from '@letitrip/react-library'"
    $content = $content -replace "from '@/lib/date-utils'", "from '@letitrip/react-library'"
    $content = $content -replace "from '@/lib/utils'", "from '@letitrip/react-library'"

    # Update component imports
    $content = $content -replace "from '@/components/forms/", "from '@letitrip/react-library/components/"
    $content = $content -replace "from '@/components/ui/", "from '@letitrip/react-library/components/"

    # Update hook imports
    $content = $content -replace "from '@/hooks/(useMediaQuery|useDebounce|useLocalStorage|useClipboard|usePrevious|useToggle)'", "from '@letitrip/react-library/hooks/`$1'"

    Set-Content $file.FullName $content
}

Write-Host "Import paths updated!"
```

---

## Testing Strategy

### Unit Tests

```typescript
// react-library/src/utils/__tests__/formatters.test.ts
import { describe, it, expect } from "vitest";
import { formatPrice, formatDate } from "../formatters";

describe("formatPrice", () => {
  it("formats INR currency correctly", () => {
    expect(formatPrice(1000, "INR")).toBe("₹1,000.00");
  });

  it("formats USD currency correctly", () => {
    expect(formatPrice(1000, "USD")).toBe("$1,000.00");
  });
});

describe("formatDate", () => {
  it("formats date correctly", () => {
    const date = new Date("2024-01-15");
    expect(formatDate(date)).toBe("15 Jan 2024");
  });
});
```

### Integration Tests

Test library in main app:

```typescript
// src/__tests__/library-integration.test.ts
import { render, screen } from "@testing-library/react";
import { FormInput } from "@letitrip/react-library";

describe("Library Integration", () => {
  it("renders FormInput from library", () => {
    render(<FormInput label="Test" />);
    expect(screen.getByLabelText("Test")).toBeInTheDocument();
  });
});
```

### Visual Regression Tests

Use Storybook for visual testing:

```typescript
// react-library/.storybook/test-runner.ts
import { toMatchImageSnapshot } from "jest-image-snapshot";

expect.extend({ toMatchImageSnapshot });

export default {
  async postRender(page, context) {
    const image = await page.screenshot();
    expect(image).toMatchImageSnapshot({
      customSnapshotIdentifier: context.id,
    });
  },
};
```

---

## Checklist

### Setup Phase

- [ ] Create react-library directory
- [ ] Initialize package.json
- [ ] Install dependencies
- [ ] Create vite.config.ts
- [ ] Create tsconfig.json
- [ ] Setup Storybook
- [ ] Update root package.json workspaces
- [ ] Update root tsconfig.json paths

### Utilities Migration

- [ ] Copy utility files
- [ ] Create index exports
- [ ] Add Storybook stories
- [ ] Test library build
- [ ] Update imports in one test file
- [ ] Verify test passes

### Component Migration

- [ ] Copy form components
- [ ] Copy UI components
- [ ] Copy value displays
- [ ] Copy pickers
- [ ] Add all component stories
- [ ] Test in Storybook
- [ ] Update imports gradually

### Hooks Migration

- [ ] Copy generic hooks
- [ ] Add hook stories
- [ ] Update imports

### Styles Migration

- [ ] Extract Tailwind config
- [ ] Extract CSS variables
- [ ] Test styling

### Documentation

- [ ] Write README.md
- [ ] Create migration guide
- [ ] Add usage examples
- [ ] Write changelog

### Testing

- [ ] Run unit tests
- [ ] Run integration tests
- [ ] Visual regression tests
- [ ] Test in main app

### Cleanup

- [ ] Delete original files
- [ ] Search for old imports
- [ ] Final build test
- [ ] Deploy Storybook

---

## Next Steps

1. **Start with Task 14.1**: Create library structure
2. **Follow IMPLEMENTATION-TRACKER.md**: Complete tasks in order
3. **Test incrementally**: Don't migrate everything at once
4. **Document as you go**: Update this guide with learnings

---

**Last Updated:** January 12, 2026
**Status:** Planning Complete - Ready to Start Implementation
