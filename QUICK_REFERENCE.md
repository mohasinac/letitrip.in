# Quick Reference Guide - Refactored Code

## 🚀 Quick Start

### Import API Utilities

```typescript
import { createApiHandler, successResponse, errorResponse } from "@/lib/api";
```

### Import UI Components

```typescript
import { Button, Card, Input, Spinner } from "@/components/ui";
```

### Import Utilities

```typescript
import { cn, formatCurrency, slugify } from "@/lib/utils";
import { debounce, throttle } from "@/utils/performance";
import { isMobile, getCurrentBreakpoint } from "@/utils/responsive";
import { getThemeColor, applyTheme } from "@/utils/theme";
```

### Import Hooks

```typescript
import { useIsMobile, useDebounce, useLocalStorage } from "@/hooks";
```

---

## 📘 Common Patterns

### 1. Create API Route

```typescript
// src/app/api/my-route/route.ts
import { NextRequest } from "next/server";
import { createApiHandler } from "@/lib/api/middleware";
import { successResponse, errorResponse } from "@/lib/api/response";
import { z } from "zod";

// Define schema
const querySchema = z.object({
  id: z.string(),
  page: z.coerce.number().default(1),
});

async function GET(request: NextRequest) {
  try {
    // Get data
    const data = await fetchData();

    // Return success
    return successResponse(data, "Success", 200, request);
  } catch (error) {
    return errorResponse("Error message", 500, undefined, request);
  }
}

// Export with middleware
export const GET_HANDLER = createApiHandler(GET);
export { GET_HANDLER as GET };
```

### 2. Create UI Component

```typescript
// src/components/MyComponent.tsx
"use client";

import { Button, Card } from "@/components/ui";
import { cn } from "@/lib/utils";

export function MyComponent({ className }: { className?: string }) {
  return (
    <Card variant="elevated" className={cn("p-6", className)}>
      <h2 className="heading-md text-theme-text">Title</h2>
      <p className="text-body text-theme-muted mt-2">Description</p>
      <Button variant="primary" size="lg" className="mt-4">
        Click Me
      </Button>
    </Card>
  );
}
```

### 3. Use Theme Colors

```typescript
// In TypeScript
import { getThemeColor } from '@/utils/theme';

const primaryColor = getThemeColor('primary', 'light');

// In CSS/Tailwind
<div className="bg-theme-primary text-theme-text">
  <span className="text-theme-muted">Muted text</span>
</div>

// In inline styles (avoid if possible)
<div style={{
  backgroundColor: 'var(--theme-primary)',
  color: 'var(--theme-text)'
}}>
```

### 4. Make Component Responsive

```typescript
import { useIsMobile, useBreakpoint } from "@/hooks";

export function ResponsiveComponent() {
  const isMobile = useIsMobile();
  const breakpoint = useBreakpoint();

  return (
    <div className="container mx-auto px-4">
      {isMobile ? <MobileView /> : <DesktopView />}
    </div>
  );
}
```

### 5. Optimize Performance

```typescript
import { debounce, memoize } from "@/utils/performance";
import { useDebounce } from "@/hooks";
import { useMemo, useCallback } from "react";

export function OptimizedComponent() {
  // Debounce input
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  // Memoize expensive calculation
  const expensiveValue = useMemo(() => {
    return calculateExpensiveValue(data);
  }, [data]);

  // Memoize callback
  const handleClick = useCallback(() => {
    console.log("Clicked");
  }, []);

  return <div>...</div>;
}
```

### 6. Add Animation

```typescript
import { optimizeAnimation } from "@/utils/performance";
import { useEffect } from "react";

export function AnimatedComponent() {
  useEffect(() => {
    // Optimized animation loop
    const cleanup = optimizeAnimation(() => {
      // Your animation logic
    }, 60); // 60 FPS

    return cleanup;
  }, []);

  return (
    <div className="animate-fadeIn hover:animate-pulse">Animated content</div>
  );
}
```

---

## 🎨 Theme Classes

### Colors

```css
/* Background */
.bg-theme-primary
.bg-theme-secondary
.bg-theme-accent
.bg-theme-background

/* Text */
.text-theme-primary
.text-theme-secondary
.text-theme-text
.text-theme-muted

/* Border */
.border-theme-primary
.border-theme-border;
```

### Typography

```css
.heading-xl    /* Extra large heading */
/* Extra large heading */
.heading-lg    /* Large heading */
.heading-md    /* Medium heading */
.heading-sm    /* Small heading */
.text-lead     /* Lead paragraph */
.text-body     /* Body text */
.text-small    /* Small text */
.text-muted; /* Muted text */
```

### Buttons

```css
.btn-primary      /* Primary button */
/* Primary button */
.btn-secondary    /* Secondary button */
.btn-outline      /* Outlined button */
.btn-ghost        /* Ghost button */
.btn-destructive  /* Destructive action */

.btn-sm          /* Small size */
.btn-lg          /* Large size */
.btn-xl; /* Extra large size */
```

### Cards

```css
.card            /* Default card */
/* Default card */
.card-elevated   /* Elevated card */
.card-feature    /* Feature card */
.card-hero       /* Hero card */
.card-hover; /* Hoverable card */
```

---

## 🔧 Utility Functions

### String Utilities

```typescript
import { truncate, capitalize, slugify } from "@/lib/utils";

truncate("Long text...", 20); // 'Long text...'
capitalize("hello world"); // 'Hello world'
slugify("Hello World!"); // 'hello-world'
```

### Array Utilities

```typescript
import { unique, chunk, groupBy, sortBy } from "@/lib/utils";

unique([1, 2, 2, 3]); // [1, 2, 3]
chunk([1, 2, 3, 4], 2); // [[1, 2], [3, 4]]
groupBy(users, "role"); // { admin: [...], user: [...] }
sortBy(users, "name", "asc"); // Sorted array
```

### Object Utilities

```typescript
import { omit, pick, get, set } from "@/lib/utils";

omit(user, ["password"]); // User without password
pick(user, ["id", "name"]); // Only id and name
get(user, "profile.bio", "N/A"); // Get nested value
set(user, "profile.bio", "New bio"); // Set nested value
```

### Performance Utilities

```typescript
import { debounce, throttle, memoize } from "@/utils/performance";

const debouncedFn = debounce(fn, 300);
const throttledFn = throttle(fn, 1000);
const memoizedFn = memoize(expensiveFn);
```

---

## 📱 Responsive Utilities

### Device Detection

```typescript
import {
  isMobile,
  isTablet,
  isDesktop,
  isTouchDevice,
} from "@/utils/responsive";

if (isMobile()) {
  // Mobile logic
}
```

### Breakpoints

```typescript
import { getCurrentBreakpoint, matchesBreakpoint } from "@/utils/responsive";

const bp = getCurrentBreakpoint(); // 'sm' | 'md' | 'lg' | 'xl' | '2xl'
const isLarge = matchesBreakpoint("lg"); // true if >= lg
```

### Viewport

```typescript
import { getViewportDimensions, watchViewportResize } from "@/utils/responsive";

const { width, height } = getViewportDimensions();

const cleanup = watchViewportResize((dimensions) => {
  console.log("Viewport changed:", dimensions);
});
```

---

## 🎭 Animation Utilities

### CSS Animations

```typescript
import { animations, durations, easings } from '@/utils/animations';

<div className={animations.fadeIn}>Fades in</div>
<div className={animations.slideInFromLeft}>Slides in</div>
```

### Programmatic Animations

```typescript
import { smoothScrollTo, staggerAnimation } from "@/utils/animations";

smoothScrollTo("#target", { duration: 1000, offset: 100 });

staggerAnimation(elements, "animate-fadeIn", 100);
```

---

## 🎯 Best Practices

1. **Always use theme variables** - No hardcoded colors
2. **Use utilities** - Don't reinvent the wheel
3. **Make it responsive** - Test on mobile
4. **Optimize performance** - Use memoization
5. **Handle errors** - Use try-catch
6. **Add types** - TypeScript everywhere
7. **Document code** - JSDoc comments
8. **Test thoroughly** - Multiple devices

---

## ⚡ Performance Tips

1. Use `React.memo` for expensive components
2. Use `useMemo` for expensive calculations
3. Use `useCallback` for event handlers
4. Debounce input handlers
5. Lazy load heavy components
6. Optimize images (WebP, sizes)
7. Use CSS transforms for animations
8. Add `will-change` for animations

---

## 🐛 Debugging

### Check CORS

```typescript
// In API route
import { getCorsHeaders } from "@/lib/api/cors";
const headers = getCorsHeaders(origin);
console.log("CORS headers:", headers);
```

### Check Theme

```typescript
// In browser console
console.log(
  getComputedStyle(document.documentElement).getPropertyValue("--theme-primary")
);
```

### Check Performance

```typescript
import { PerformanceMonitor } from "@/utils/performance";

const monitor = new PerformanceMonitor();
monitor.start("operation");
// ... do something
monitor.endAndLog("operation"); // Logs duration
```

---

## 📚 Documentation Links

- [Full Refactoring Guide](./REFACTORING_GUIDE.md)
- [Implementation Summary](./REFACTORING_COMPLETE.md)
- [Example API Route](./EXAMPLE_REFACTORED_API.ts)
- [Original Plan](./REFACTORING_PLAN.md)

---

**Last Updated:** October 30, 2025
**Version:** 1.0.0
