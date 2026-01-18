# Design System & Theming

Comprehensive design system with CSS tokens and Tailwind configuration.

## Overview

- **200+ CSS Tokens**: Colors, typography, spacing, shadows, borders
- **Tailwind Configuration**: Pre-configured theme with CSS variables
- **Dark Mode**: Built-in theme switching support

## Quick Start

### Import Tokens

In your global CSS:

```css
@import "@letitrip/react-library/styles/tokens";
```

### Use Tailwind Config

Extend your `tailwind.config.js`:

```javascript
const libraryConfig = require("@letitrip/react-library/tailwind.config.js");

module.exports = {
  ...libraryConfig,
  content: [...libraryConfig.content, "./src/**/*.{js,ts,jsx,tsx}"],
};
```

## CSS Tokens

### Colors

```css
--color-primary
--color-secondary
--color-accent
--color-success
--color-error
--color-warning
--color-info
```

### Typography

```css
--font-sans
--font-serif
--font-mono
--font-size-xs
--font-size-sm
--font-size-base
--font-size-lg
--font-size-xl
```

### Spacing

```css
--spacing-0 to --spacing-80
```

### Shadows

```css
--shadow-sm
--shadow-md
--shadow-lg
--shadow-xl
```

## Tailwind Usage

Use CSS variables in Tailwind classes:

```tsx
<div className="bg-primary text-white rounded-lg shadow-md p-4">
  <h1 className="text-xl font-semibold">Hello</h1>
</div>
```

## Dark Mode

Toggle dark mode by setting the `data-theme` attribute:

```javascript
document.documentElement.setAttribute("data-theme", "dark");
```

Theme styles are defined in the CSS tokens and automatically switch based on the theme attribute.

## Custom Tokens

Add your own tokens in your app's CSS:

```css
:root {
  --custom-color: #123456;
}

[data-theme="dark"] {
  --custom-color: #654321;
}
```

## File Structure

```
styles/
├── index.css           # Main style entry
├── tokens/            # CSS token files
│   ├── colors.css
│   ├── typography.css
│   ├── spacing.css
│   ├── shadows.css
│   ├── borders.css
│   └── animations.css
└── README.md          # This file
```

---

See [/react-library/README.md](/react-library/README.md) for more information.
