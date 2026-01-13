/**
 * Styles Module
 *
 * Exports CSS design tokens and theme configuration.
 * Import these in your app to use the design system.
 *
 * Usage:
 * ```tsx
 * // In your app's global CSS or _app.tsx:
 * import '@letitrip/react-library/styles/tokens';
 * ```
 */

// CSS Design Tokens
// Import these in your application to use the design system
export const TOKENS_PATH = "./tokens/index.css";

// Re-export token paths for convenience
export const TOKEN_FILES = {
  colors: "./tokens/colors.css",
  typography: "./tokens/typography.css",
  spacing: "./tokens/spacing.css",
  shadows: "./tokens/shadows.css",
  borders: "./tokens/borders.css",
  animations: "./tokens/animations.css",
  all: "./tokens/index.css",
} as const;

// Note: To use the design tokens in your app:
// 1. Import the CSS tokens in your global styles or _app.tsx:
//    import '@letitrip/react-library/dist/styles/tokens/index.css'
// 2. Use the CSS variables in your Tailwind config or components
// 3. The library components already use these tokens internally
