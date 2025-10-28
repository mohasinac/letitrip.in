# Theme System Documentation

> **Last Updated:** October 28, 2025  
> **Purpose:** This document serves as the single source of truth for the theme system, including light/dark modes, color palettes, component styling, and usage patterns.

## 🎨 Theme Architecture Overview

### **Theme System Components**

- **ModernThemeContext** - Core theme provider and state management
- **useModernTheme** - Theme context hook for mode switching
- **useThemeStyles** - Utility hook for theme-aware styling
- **ThemeAwareComponents** - Pre-built theme-responsive components
- **CSS Custom Properties** - Global theme variables for non-MUI components

### **Design Philosophy**

- **Consistency:** Unified color palette across all components
- **Accessibility:** WCAG 2.1 AA compliant contrast ratios
- **Performance:** Minimal re-renders and efficient theme switching
- **Flexibility:** Easy customization and extension
- **Modern:** Instagram-inspired blue accent (#0095f6) with clean aesthetics

---

## 🌈 Color Palette

### **Light Theme**

```css
/* Background Colors */
--color-background: #ffffff; /* Pure white background */
--color-surface: #f8fafc; /* Light gray surface */
--color-surface-variant: #f1f5f9; /* Lighter gray variant */

/* Primary Colors */
--color-primary: #0095f6; /* Instagram blue */
--color-secondary: #64748b; /* Slate gray */

/* Text Colors */
--color-text: #0f172a; /* Dark text */
--color-text-secondary: #475569; /* Medium gray text */

/* Border & Dividers */
--color-border: #e2e8f0; /* Light border */

/* Status Colors */
--color-error: #dc2626; /* Red */
--color-success: #16a34a; /* Green */
--color-warning: #d97706; /* Orange */
```

### **Dark Theme**

```css
/* Background Colors */
--color-background: #000000; /* Pure black background */
--color-surface: #0f0f0f; /* Dark gray surface */
--color-surface-variant: #1a1a1a; /* Darker gray variant */

/* Primary Colors */
--color-primary: #0095f6; /* Same Instagram blue */
--color-secondary: #ffffff; /* White for contrast */

/* Text Colors */
--color-text: #ffffff; /* Pure white text */
--color-text-secondary: #cccccc; /* Light gray text */

/* Border & Dividers */
--color-border: #333333; /* Dark border */

/* Status Colors */
--color-error: #ff4757; /* Bright red */
--color-success: #2ed573; /* Bright green */
--color-warning: #ffa502; /* Bright orange */
```

### **Color Usage Guidelines**

| Color              | Light Mode | Dark Mode | Usage                      |
| ------------------ | ---------- | --------- | -------------------------- |
| **Primary**        | #0095f6    | #0095f6   | Buttons, links, highlights |
| **Background**     | #ffffff    | #000000   | Page backgrounds           |
| **Surface**        | #f8fafc    | #0f0f0f   | Cards, panels, modals      |
| **Text Primary**   | #0f172a    | #ffffff   | Headings, primary text     |
| **Text Secondary** | #475569    | #cccccc   | Descriptions, labels       |
| **Border**         | #e2e8f0    | #333333   | Dividers, borders          |

---

## 🧩 Theme Provider Setup

### **Root Layout Integration**

```tsx
// src/app/layout.tsx
import { ModernThemeProvider } from "@/contexts/ModernThemeContext";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ModernThemeProvider>{children}</ModernThemeProvider>
      </body>
    </html>
  );
}
```

### **Theme Context Interface**

```typescript
interface ModernThemeContextType {
  mode: "light" | "dark"; // Current theme mode
  toggleTheme: () => void; // Function to switch themes
  isDark: boolean; // Convenience boolean for dark mode
}
```

### **Theme Persistence**

- **Storage:** `localStorage.getItem("theme-mode")`
- **Fallback:** System preference via `prefers-color-scheme`
- **Hydration:** Prevents flash of incorrect theme
- **CSS Variables:** Automatically updated on theme change

---

## 🎛️ Material-UI Theme Configuration

### **Typography Scale**

```typescript
const typography = {
  fontFamily: [
    "-apple-system",
    "BlinkMacSystemFont",
    "Segoe UI",
    "Roboto",
    "Helvetica Neue",
    "Arial",
    "sans-serif",
  ].join(","),

  h1: { fontSize: "2.25rem", fontWeight: 700, lineHeight: 1.2 },
  h2: { fontSize: "1.875rem", fontWeight: 600, lineHeight: 1.3 },
  h3: { fontSize: "1.5rem", fontWeight: 600, lineHeight: 1.4 },
  h4: { fontSize: "1.25rem", fontWeight: 600, lineHeight: 1.4 },
  h5: { fontSize: "1.125rem", fontWeight: 600, lineHeight: 1.4 },
  h6: { fontSize: "1rem", fontWeight: 600, lineHeight: 1.4 },
  body1: { fontSize: "1rem", lineHeight: 1.6 },
  body2: { fontSize: "0.875rem", lineHeight: 1.6 },
  caption: { fontSize: "0.75rem", lineHeight: 1.4 },
};
```

### **Component Overrides**

```typescript
const components = {
  MuiButton: {
    styleOverrides: {
      root: {
        textTransform: "none", // No uppercase transformation
        fontWeight: 600,
        borderRadius: 8,
        padding: "8px 16px",
      },
    },
  },

  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: 12, // Rounded corners
        border: "1px solid var(--color-border)",
        boxShadow: "theme-aware-shadow",
      },
    },
  },

  MuiTextField: {
    styleOverrides: {
      root: {
        "& .MuiOutlinedInput-root": {
          backgroundColor: "var(--color-surface)",
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "var(--color-primary)",
          },
        },
      },
    },
  },
};
```

---

## 🛠️ Usage Patterns

### **1. Client Components with Theme Context**

```tsx
"use client";
import { useModernTheme } from "@/contexts/ModernThemeContext";

function ThemeToggleButton() {
  const { mode, toggleTheme, isDark } = useModernTheme();

  return (
    <button onClick={toggleTheme}>
      Switch to {isDark ? "light" : "dark"} mode
    </button>
  );
}
```

### **2. Client Components with Theme Styles**

```tsx
"use client";
import { useThemeStyles } from "@/hooks/useThemeStyles";

function StyledCard() {
  const { colors, gradients, shadows } = useThemeStyles();

  return (
    <div
      style={{
        backgroundColor: colors.surface,
        color: colors.text,
        background: gradients.card,
        boxShadow: shadows.card,
      }}
    >
      Theme-aware card content
    </div>
  );
}
```

### **3. Server Components with Theme Wrappers**

```tsx
import {
  ThemeAwareBox,
  HeroSection,
} from "@/components/shared/ThemeAwareComponents";

function ServerPage() {
  return (
    <ThemeAwareBox>
      <HeroSection>
        <h1>This automatically adapts to theme!</h1>
      </HeroSection>
    </ThemeAwareBox>
  );
}
```

### **4. Custom CSS with Theme Variables**

```css
.custom-component {
  background-color: var(--color-surface);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  transition: all 0.3s ease;
}

.custom-component:hover {
  background-color: var(--color-surface-variant);
  box-shadow: 0 4px 12px rgba(0, 149, 246, 0.15);
}
```

---

## 🎯 Theme-Aware Components

### **HeroSection Component**

```tsx
<HeroSection>
  {/* Automatically applies hero gradient and proper spacing */}
  <Container>
    <Typography variant="h1" color="white">
      Hero Title
    </Typography>
  </Container>
</HeroSection>
```

**Features:**

- Automatic theme-aware gradient background
- Proper contrast text (white on colored background)
- Responsive padding (8 units mobile, 12 units desktop)

### **ThemeAwareBox Component**

```tsx
<ThemeAwareBox variant="card" gradient>
  {/* Content with theme-aware background and styling */}
</ThemeAwareBox>
```

**Variants:**

- `hero` - Hero section styling with gradient
- `card` - Card styling with surface background
- `surface` - Surface background color
- `background` - Default background color

### **ClientLinkButton Component**

```tsx
<ClientLinkButton href="/about" variant="contained">
  Navigate to About
</ClientLinkButton>
```

**Features:**

- Client-side navigation using Next.js router
- Full Material-UI Button API compatibility
- Theme-aware styling

---

## 🎨 Gradients and Effects

### **Predefined Gradients**

```typescript
const gradients = {
  // Primary brand gradient
  primary: "linear-gradient(135deg, #0095f6 0%, #007acc 100%)",

  // Hero section gradients
  hero: {
    light: "linear-gradient(135deg, #0095f6 0%, #007acc 100%)",
    dark: "linear-gradient(135deg, #000000 0%, #1a1a1a 100%)",
  },

  // Card gradients
  card: {
    light: "linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)",
    dark: "linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)",
  },
};
```

### **Box Shadows**

```typescript
const shadows = {
  // Card shadows
  card: {
    light: "0 2px 8px rgba(0, 0, 0, 0.1)",
    dark: "0 2px 8px rgba(255, 255, 255, 0.05)",
  },

  // Hover effects
  hover: {
    light: "0 8px 25px rgba(0, 149, 246, 0.3)",
    dark: "0 8px 25px rgba(255, 255, 255, 0.1)",
  },
};
```

---

## 🔧 Customization Guide

### **Adding New Colors**

1. **Update Color Palette**

```typescript
// src/contexts/ModernThemeContext.tsx
const colors = {
  light: {
    // ...existing colors...
    accent: "#ff6b35", // New accent color
  },
  dark: {
    // ...existing colors...
    accent: "#ff8c65", // Dark mode accent
  },
};
```

2. **Update CSS Variables**

```typescript
// Add to the useEffect that updates CSS custom properties
root.style.setProperty(`--color-accent`, currentColors.accent);
```

3. **Add to Material-UI Theme**

```typescript
const muiTheme = createTheme({
  palette: {
    // ...existing palette...
    accent: {
      main: colors[mode].accent,
    },
  },
});
```

### **Creating Custom Theme Variants**

```typescript
// Create a custom variant hook
export function useCustomThemeVariant() {
  const { mode } = useModernTheme();

  return {
    brandColors: {
      primary: mode === "dark" ? "#0095f6" : "#0075cc",
      secondary: mode === "dark" ? "#ff6b35" : "#e55a2b",
    },
    customGradients: {
      brand: `linear-gradient(45deg, ${brandColors.primary}, ${brandColors.secondary})`,
    },
  };
}
```

### **Adding Component-Specific Themes**

```typescript
// Component-specific theme extension
const gameTheme = {
  arena: {
    background: mode === "dark" ? "#1a1a2e" : "#f0f4ff",
    border: mode === "dark" ? "#16213e" : "#d1e7ff",
  },
  beyblade: {
    player: "#0095f6",
    enemy: "#ff4757",
  },
};
```

---

## 🚦 Theme Switching Behavior

### **Automatic System Detection**

```typescript
// Detects user's system preference on first visit
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
```

### **Manual Theme Toggle**

```typescript
// Toggles between light and dark, saves to localStorage
const toggleTheme = () => {
  setMode((prev) => (prev === "light" ? "dark" : "light"));
};
```

### **Smooth Transitions**

```css
/* Applied globally for smooth theme transitions */
* {
  transition: background-color 0.3s ease, color 0.3s ease,
    border-color 0.3s ease;
}
```

### **Theme Persistence**

- **Storage:** `localStorage.setItem("theme-mode", mode)`
- **Retrieval:** Checked on component mount
- **Fallback:** System preference if no stored value
- **Hydration:** Prevents flash of wrong theme

---

## 🧪 Testing Theme Components

### **Theme Context Testing**

```tsx
import { render } from "@testing-library/react";
import { ModernThemeProvider } from "@/contexts/ModernThemeContext";

function renderWithTheme(component: React.ReactElement) {
  return render(<ModernThemeProvider>{component}</ModernThemeProvider>);
}

test("component adapts to dark theme", () => {
  // Test theme-aware component behavior
});
```

### **Visual Regression Testing**

- Light mode screenshots
- Dark mode screenshots
- Theme transition animations
- Component contrast validation

---

## 📱 Responsive Theme Behavior

### **Mobile Optimizations**

- Larger touch targets in both themes
- High contrast mode support
- Battery-efficient dark mode
- Reduced motion preferences

### **Accessibility Features**

- WCAG 2.1 AA contrast ratios
- Focus indicators visible in both themes
- Screen reader announcements for theme changes
- Keyboard navigation support

---

## 🔍 Debugging Theme Issues

### **Common Issues & Solutions**

**1. Flash of Wrong Theme (FOUT)**

```typescript
// Solution: Use hydration check
const [isHydrated, setIsHydrated] = useState(false);

useEffect(() => {
  setIsHydrated(true);
}, []);

if (!isHydrated) return null; // Or loading state
```

**2. CSS Variables Not Updating**

```typescript
// Solution: Ensure CSS custom properties are set
useEffect(() => {
  const root = document.documentElement;
  Object.entries(currentColors).forEach(([key, value]) => {
    root.style.setProperty(`--color-${key}`, value);
  });
}, [mode]);
```

**3. Material-UI Components Not Theming**

```typescript
// Solution: Ensure MuiThemeProvider wraps component
<MuiThemeProvider theme={muiTheme}>
  <YourComponent />
</MuiThemeProvider>
```

### **Development Tools**

- React DevTools for context inspection
- Browser DevTools for CSS variable inspection
- Console warnings for missing theme properties
- Performance profiler for re-render analysis

---

## 📝 Maintenance Guidelines

### **When Adding New Components:**

1. Determine if component needs theme awareness
2. Use appropriate pattern (server wrapper vs client hook)
3. Test in both light and dark modes
4. Verify accessibility compliance
5. Update this documentation

### **When Modifying Colors:**

1. Update both light and dark color objects
2. Test contrast ratios (use WebAIM contrast checker)
3. Update CSS custom properties
4. Verify Material-UI theme integration
5. Test across all components

### **Performance Considerations:**

- Minimize theme context re-renders
- Use CSS custom properties for non-React elements
- Implement theme preloading for faster switches
- Monitor bundle size impact of theme system

---

_This documentation is automatically maintained and should be updated whenever theme colors, components, or patterns are added, modified, or removed._
