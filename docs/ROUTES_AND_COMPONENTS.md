# Routes and Components Documentation

> **Last Updated:** October 28, 2025  
> **Purpose:** This document serves as the single source of truth for all routes and components in the JustForView application.

## 📁 Application Structure

### 🛣️ Routes (App Router - Next.js 14+)

#### **Public Routes**

| Route      | File Path                  | Description                                             | Type   | Features                                     |
| ---------- | -------------------------- | ------------------------------------------------------- | ------ | -------------------------------------------- |
| `/`        | `src/app/page.tsx`         | Homepage with hero banner, featured categories, reviews | Static | Modern hero, category grid, customer reviews |
| `/about`   | `src/app/about/page.tsx`   | Company information and team details                    | Static | Company story, team profiles                 |
| `/contact` | `src/app/contact/page.tsx` | Contact form and business information                   | Static | Contact form, business hours, location       |
| `/faq`     | `src/app/faq/page.tsx`     | Frequently asked questions                              | Static | Expandable FAQ sections                      |
| `/help`    | `src/app/help/page.tsx`    | Help center and support resources                       | Static | Help articles, support contacts              |
| `/cookies` | `src/app/cookies/page.tsx` | Cookie policy and preferences                           | Static | GDPR compliance, cookie management           |
| `/privacy` | `src/app/privacy/page.tsx` | Privacy policy and data handling                        | Static | Privacy details, user rights                 |
| `/terms`   | `src/app/terms/page.tsx`   | Terms of service and legal information                  | Static | Legal terms, service conditions              |

#### **Game Routes**

| Route                   | File Path                               | Description                | Type   | Features                                  |
| ----------------------- | --------------------------------------- | -------------------------- | ------ | ----------------------------------------- |
| `/game`                 | `src/app/game/page.tsx`                 | Game hub and selection     | Static | Game overview, controls help              |
| `/game/beyblade-battle` | `src/app/game/beyblade-battle/page.tsx` | Main battle game interface | Static | Real-time battle mechanics, strategy tips |

#### **Special Routes**

| Route           | File Path                  | Description              | Type    | Features                               |
| --------------- | -------------------------- | ------------------------ | ------- | -------------------------------------- |
| `/loading`      | `src/app/loading.tsx`      | Global loading component | Special | Beyblade spinner animation             |
| `/error`        | `src/app/error.tsx`        | Global error boundary    | Special | Error recovery, user-friendly messages |
| `/not-found`    | `src/app/not-found.tsx`    | 404 page                 | Special | Custom 404 design, navigation links    |
| `/global-error` | `src/app/global-error.tsx` | Global error fallback    | Special | Critical error handling                |

#### **Layout**

| File                 | Description                     | Features                               |
| -------------------- | ------------------------------- | -------------------------------------- |
| `src/app/layout.tsx` | Root layout with theme provider | Theme context, metadata, global styles |

---

## 🧩 Components Architecture

### 📱 Layout Components

| Component      | File Path                                | Purpose                         | Type   | Dependencies               |
| -------------- | ---------------------------------------- | ------------------------------- | ------ | -------------------------- |
| `ModernLayout` | `src/components/layout/ModernLayout.tsx` | Main application layout wrapper | Layout | Material-UI, theme context |

### 🏠 Home Page Components

| Component                  | File Path                                          | Purpose                   | Type         | Dependencies               |
| -------------------------- | -------------------------------------------------- | ------------------------- | ------------ | -------------------------- |
| `ModernHeroBanner`         | `src/components/home/ModernHeroBanner.tsx`         | Homepage hero section     | Presentation | Material-UI, theme-aware   |
| `MinimalistHero`           | `src/components/home/MinimalistHero.tsx`           | Alternative hero design   | Presentation | Material-UI                |
| `ModernFeaturedCategories` | `src/components/home/ModernFeaturedCategories.tsx` | Product category showcase | Presentation | Material-UI, hover effects |
| `ModernCustomerReviews`    | `src/components/home/ModernCustomerReviews.tsx`    | Customer testimonials     | Presentation | Material-UI, carousel      |
| `ModernWhyChooseUs`        | `src/components/home/ModernWhyChooseUs.tsx`        | Value proposition section | Presentation | Material-UI, feature cards |

### 🎮 Game Components

| Component               | File Path                                           | Purpose                | Type         | Dependencies           |
| ----------------------- | --------------------------------------------------- | ---------------------- | ------------ | ---------------------- |
| `EnhancedBeybladeArena` | `src/app/game/components/EnhancedBeybladeArena.tsx` | Main game arena        | Interactive  | Canvas, physics engine |
| `GameArena`             | `src/app/game/components/GameArena.tsx`             | Basic arena component  | Interactive  | Canvas rendering       |
| `GameInstructions`      | `src/app/game/components/GameInstructions.tsx`      | Game tutorial overlay  | Presentation | Material-UI            |
| `GameControls`          | `src/app/game/components/GameControls.tsx`          | Game control interface | Interactive  | Touch/mouse events     |
| `VirtualDPad`           | `src/app/game/components/VirtualDPad.tsx`           | Mobile game controls   | Interactive  | Touch events           |
| `ControlsHelp`          | `src/app/game/components/ControlsHelp.tsx`          | Controls explanation   | Presentation | Material-UI            |

### 🔐 Authentication Components

| Component             | File Path                                              | Purpose                   | Type        | Dependencies |
| --------------------- | ------------------------------------------------------ | ------------------------- | ----------- | ------------ |
| `RouteGuard`          | `src/components/features/auth/RouteGuard.tsx`          | Route protection wrapper  | Guard       | Auth context |
| `RoleGuard`           | `src/components/features/auth/RoleGuard.tsx`           | Role-based access control | Guard       | Auth context |
| `ProtectedRoute`      | `src/components/features/auth/ProtectedRoute.tsx`      | Authentication wrapper    | Guard       | Auth context |
| `CookieConsentBanner` | `src/components/features/auth/CookieConsentBanner.tsx` | GDPR cookie consent       | Interactive | Material-UI  |

### 🛠️ Shared Components

| Component              | File Path                                        | Purpose                       | Type        | Dependencies               |
| ---------------------- | ------------------------------------------------ | ----------------------------- | ----------- | -------------------------- |
| `ThemeAwareComponents` | `src/components/shared/ThemeAwareComponents.tsx` | Theme-responsive wrappers     | Utility     | Theme context, Material-UI |
| `ClientLinkButton`     | `src/components/shared/ClientLinkButton.tsx`     | Client-side navigation button | Interactive | Next.js router             |
| `ErrorBoundary`        | `src/components/shared/ErrorBoundary.tsx`        | Error boundary wrapper        | Guard       | React error boundary       |
| `CookieConsent`        | `src/components/shared/CookieConsent.tsx`        | Cookie management component   | Interactive | localStorage               |

---

## 🎨 Component Categories

### **Presentation Components** (Server-Side Compatible)

- Static content display
- SEO-optimized
- No client-side interactivity
- Theme-aware styling via CSS variables

### **Interactive Components** (Client-Side)

- User interactions (clicks, forms, games)
- State management
- Browser API access
- Real-time updates

### **Guard Components** (Security)

- Route protection
- Authentication checks
- Role-based access
- Error boundaries

### **Utility Components** (Helpers)

- Theme wrappers
- Layout utilities
- Navigation helpers
- Reusable UI patterns

---

## 📋 Component Usage Patterns

### **Theme-Aware Server Components**

```tsx
import {
  ThemeAwareBox,
  HeroSection,
} from "@/components/shared/ThemeAwareComponents";

export default function Page() {
  return (
    <ThemeAwareBox>
      <HeroSection>{/* Content automatically adapts to theme */}</HeroSection>
    </ThemeAwareBox>
  );
}
```

### **Client-Side Interactive Components**

```tsx
"use client";
import { useModernTheme } from "@/contexts/ModernThemeContext";

export default function InteractiveComponent() {
  const { mode, toggleTheme } = useModernTheme();
  // Component logic here
}
```

### **Navigation Components**

```tsx
import { ClientLinkButton } from "@/components/shared/ClientLinkButton";

<ClientLinkButton href="/about" variant="contained">
  Navigate to About
</ClientLinkButton>;
```

---

## 🚀 Performance Characteristics

### **Build Output Analysis**

- **Static Routes:** 16 pages pre-rendered at build time
- **Dynamic Routes:** API routes server-rendered on demand
- **Client Components:** Hydrated after initial page load
- **Bundle Splitting:** Automatic code splitting by route

### **Component Loading Strategy**

1. **Server Components:** Rendered on server, sent as HTML
2. **Client Components:** Hydrated progressively
3. **Game Components:** Loaded on-demand for game routes
4. **Auth Components:** Loaded only when authentication required

---

## 📝 Maintenance Guidelines

### **When Adding New Routes:**

1. Create page component in appropriate `src/app/` directory
2. Update this documentation
3. Add route to constants if needed
4. Consider SEO metadata

### **When Adding New Components:**

1. Choose appropriate category (presentation/interactive/guard/utility)
2. Follow naming convention (Pascal case with descriptive suffix)
3. Add proper TypeScript interfaces
4. Update this documentation
5. Consider theme compatibility

### **Component Naming Conventions:**

- **Pages:** `Page` suffix (e.g., `ContactPage`)
- **Layout:** `Layout` suffix (e.g., `ModernLayout`)
- **Interactive:** Descriptive name (e.g., `GameControls`)
- **Utility:** Purpose-based (e.g., `ThemeAwareBox`)
- **Guards:** `Guard` suffix (e.g., `RouteGuard`)

---

_This documentation is automatically maintained and should be updated whenever routes or components are added, modified, or removed._
