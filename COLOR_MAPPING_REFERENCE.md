# Color Mapping Reference - Hardcoded to Theme

> **Purpose:** Quick reference guide for replacing hardcoded colors  
> **Last Updated:** October 29, 2025

## 🎨 Background Colors

| Hardcoded | Context          | Theme Value          | Notes                     |
| --------- | ---------------- | -------------------- | ------------------------- |
| `#ffffff` | Light background | `background.default` | Page/container background |
| `#f8fafc` | Light surface    | `background.paper`   | Cards, paper components   |
| `#f9fafb` | Light neutral    | `background.paper`   | Alternative neutral       |
| `#f1f5f9` | Light variant    | `action.hover`       | Hover/selected states     |
| `#e2e8f0` | Light border     | `divider`            | Borders, dividers         |
| `#000000` | Dark background  | `background.default` | Dark mode page bg         |
| `#0f0f0f` | Dark surface     | `background.paper`   | Dark mode cards           |
| `#0a0a0a` | Dark variant     | `background.paper`   | Dark mode alternative     |
| `#1a1a1a` | Dark lighter     | `action.hover`       | Dark mode hover           |
| `#333333` | Dark border      | `divider`            | Dark mode borders         |

## 🎯 Text Colors

| Hardcoded | Context         | Theme Value      | Notes                    |
| --------- | --------------- | ---------------- | ------------------------ |
| `#0f172a` | Dark text       | `text.primary`   | Primary text content     |
| `#475569` | Gray text       | `text.secondary` | Secondary/helper text    |
| `#ffffff` | White text      | `text.primary`   | Dark mode primary text   |
| `#cccccc` | Light gray text | `text.secondary` | Dark mode secondary text |

## 🎨 Primary Colors

| Hardcoded | Context        | Theme Value     | Notes               |
| --------- | -------------- | --------------- | ------------------- |
| `#4f46e5` | Indigo primary | `primary.main`  | Main primary color  |
| `#6366f1` | Light indigo   | `primary.light` | Light variant       |
| `#4338ca` | Dark indigo    | `primary.dark`  | Dark variant        |
| `#0095f6` | Instagram blue | `primary.main`  | Alternative primary |
| `#007acc` | Dark blue      | `primary.dark`  | Blue dark variant   |
| `#0284c7` | Sky blue       | `primary.main`  | Info/sky blue       |
| `#0369a1` | Sky dark       | `primary.dark`  | Sky blue dark       |

## 🌸 Secondary/Accent Colors

| Hardcoded | Context     | Theme Value      | Notes          |
| --------- | ----------- | ---------------- | -------------- |
| `#ec4899` | Pink accent | `secondary.main` | Accent color   |
| `#db2777` | Dark pink   | `secondary.dark` | Dark accent    |
| `#be185d` | Darker pink | `secondary.dark` | Darker accent  |
| `#64748b` | Slate gray  | `secondary.main` | Gray secondary |

## ✅ Success Colors

| Hardcoded | Context      | Theme Value     | Notes             |
| --------- | ------------ | --------------- | ----------------- |
| `#22c55e` | Green        | `success.main`  | Success/positive  |
| `#16a34a` | Dark green   | `success.dark`  | Dark success      |
| `#86efac` | Light green  | `success.light` | Light success     |
| `#2ed573` | Bright green | `success.main`  | Bright variant    |
| `#00c851` | Green alt    | `success.main`  | Alternative green |

## ⚠️ Warning Colors

| Hardcoded | Context     | Theme Value                     | Notes          |
| --------- | ----------- | ------------------------------- | -------------- |
| `#f59e0b` | Amber       | `warning.main`                  | Warning color  |
| `#d97706` | Dark amber  | `warning.dark`                  | Dark warning   |
| `#fbbf24` | Light amber | `warning.light`                 | Light warning  |
| `#ffa502` | Orange      | `warning.main`                  | Orange variant |
| `#f39c12` | Dark orange | `warning.dark`                  | Orange dark    |
| `#ff6b35` | Red-orange  | `warning.main` or `error.light` | Red-orange     |

## ❌ Error Colors

| Hardcoded | Context       | Theme Value   | Notes             |
| --------- | ------------- | ------------- | ----------------- |
| `#ef4444` | Red           | `error.main`  | Error color       |
| `#dc2626` | Dark red      | `error.dark`  | Dark error        |
| `#f87171` | Light red     | `error.light` | Light error       |
| `#ff4757` | Bright red    | `error.main`  | Bright error      |
| `#e74c3c` | Crimson       | `error.main`  | Alternative error |
| `#ed4956` | Error variant | `error.main`  | Error variant     |

## 🔘 Neutral/Gray Colors

| Hardcoded | Context  | Theme Value      | Notes           |
| --------- | -------- | ---------------- | --------------- |
| `#9ca3af` | Gray 400 | `text.disabled`  | Disabled text   |
| `#6b7280` | Gray 500 | `text.secondary` | Secondary gray  |
| `#4b5563` | Gray 600 | `text.secondary` | Dark gray       |
| `#374151` | Gray 700 | `text.primary`   | Very dark gray  |
| `#1f2937` | Gray 800 | `text.primary`   | Almost black    |
| `#111827` | Gray 900 | `text.primary`   | Pure black gray |

## 🎨 Gradient Colors

### Hero Gradients

```tsx
// Light Mode
"linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #f8fafc 100%)"
→ `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.action.hover} 50%, ${theme.palette.background.paper} 100%)`

// Dark Mode
"linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #000000 100%)"
→ `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.action.hover} 50%, ${theme.palette.background.default} 100%)`

// Primary Gradient
"linear-gradient(135deg, #0095f6 0%, #007acc 100%)"
→ `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`
```

### Card Gradients

```tsx
// Light Mode
"linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)"
→ `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`

// Dark Mode
"linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)"
→ `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.action.hover} 100%)`
```

## 💫 Shadow Colors

### Box Shadows

```tsx
// Small shadow
"0 2px 8px rgba(0, 0, 0, 0.1)"  // Light mode
→ theme.shadows[2] or "0 2px 8px rgba(0, 0, 0, 0.1)"

"0 2px 8px rgba(255, 255, 255, 0.05)"  // Dark mode
→ Use theme.shadows or custom CSS variables

// Large shadow
"0 8px 25px rgba(0, 149, 246, 0.3)"  // Light mode (blue glow)
→ "0 8px 25px rgba(79, 70, 229, 0.3)" using primary color

"0 8px 25px rgba(255, 255, 255, 0.1)"  // Dark mode
→ Use theme.shadows[4] or higher
```

### Drop Shadows (Filters)

```tsx
// Drop shadow
"drop-shadow(0px 2px 8px rgba(0,0,0,0.32))"
→ "drop-shadow(0px 2px 8px rgba(0,0,0,0.15))" (reduce opacity)
```

## 🌈 Transparent Colors (RGBA)

| Hardcoded                   | Context            | Replacement              | Notes              |
| --------------------------- | ------------------ | ------------------------ | ------------------ |
| `rgba(0, 0, 0, 0.02)`       | Very light overlay | `action.hover`           | Subtle hover       |
| `rgba(0, 0, 0, 0.04)`       | Light overlay      | `action.hover`           | Light hover        |
| `rgba(0, 0, 0, 0.08)`       | Medium overlay     | `action.selected`        | Medium overlay     |
| `rgba(0, 0, 0, 0.1)`        | Dark overlay       | `action.hover` or shadow | Visible overlay    |
| `rgba(255, 255, 255, 0.05)` | Light text overlay | Use directly             | Dark mode text     |
| `rgba(255, 255, 255, 0.08)` | Medium overlay     | `action.hover`           | Dark mode hover    |
| `rgba(255, 255, 255, 0.1)`  | Dark overlay       | `action.selected`        | Dark mode selected |
| `rgba(0, 149, 246, 0.1)`    | Blue overlay       | Use with primary         | Blue tint          |
| `rgba(0, 149, 246, 0.3)`    | Strong blue        | Shadow/glow effect       | Strong blue glow   |

## 📋 Quick Replace Patterns

### Pattern 1: Simple Background

```tsx
// ❌ OLD
backgroundColor: "#f5f5f5";
// ✅ NEW
backgroundColor: "background.paper";
```

### Pattern 2: Conditional Theme

```tsx
// ❌ OLD
backgroundColor: isDark ? "#0f0f0f" : "#f8fafc";
// ✅ NEW
backgroundColor: "background.paper";
```

### Pattern 3: With Theme Object

```tsx
// ✅ NEW (when using useTheme)
backgroundColor: theme.palette.background.paper;
```

### Pattern 4: SX Prop with Palette

```tsx
// ✅ NEW (Material-UI way)
sx={{
  backgroundColor: "background.paper",
  color: "text.primary",
  border: "1px solid",
  borderColor: "divider"
}}
```

## 🔍 Regex Patterns for Finding Hardcoded Colors

### Find all hex colors

```regex
#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3}
```

### Find all rgba colors

```regex
rgba\([0-9]{1,3},\s*[0-9]{1,3},\s*[0-9]{1,3},\s*[0-9.]+\)
```

### Find all rgb colors

```regex
rgb\([0-9]{1,3},\s*[0-9]{1,3},\s*[0-9]{1,3}\)
```

## 📚 Material-UI Documentation Links

- [Palette API](https://mui.com/material-ui/customization/palette/)
- [useTheme Hook](https://mui.com/material-ui/styles/useTheme/)
- [sx Prop](https://mui.com/system/getting-started/the-sx-prop/)
- [Default Theme](https://mui.com/material-ui/customization/default-theme/)

## ✨ Best Practices

1. **Always use theme values** when available
2. **Avoid hardcoded colors** in component code
3. **Use sx prop** for Material-UI components
4. **Use CSS variables** for custom styled components
5. **Test in both themes** before committing
6. **Check contrast ratios** using WebAIM tool
7. **Use theme.palette** when accessing in JavaScript
8. **Prefer semantic names** (primary, error) over hex values

---

**Last Updated:** October 29, 2025  
**Maintenance:** Update when new colors are added to theme system
