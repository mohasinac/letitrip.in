# Routes and Components Documentation

> **Last Updated:** October 28, 2025  
> **Purpose:** This document serves as the single source of truth for all routes and components in the JustForView application.

## 📁 Application Structure

### 🛣️ Routes (App Router - Next.js 14+)

#### **Public Routes**

| Route           | File Path                       | Description                                                         | Type   | Features                                            |
| --------------- | ------------------------------- | ------------------------------------------------------------------- | ------ | --------------------------------------------------- |
| `/`             | `src/app/page.tsx`              | Homepage with interactive hero banner, featured categories, reviews | Static | Interactive hero, dynamic theming, product showcase |
| `/about`        | `src/app/about/page.tsx`        | Company information and team details                                | Static | Company story, team profiles                        |
| `/contact`      | `src/app/contact/page.tsx`      | Contact form and business information                               | Static | Contact form, business hours, location              |
| `/faq`          | `src/app/faq/page.tsx`          | Frequently asked questions                                          | Static | Expandable FAQ sections                             |
| `/help`         | `src/app/help/page.tsx`         | Help center and support resources                                   | Static | Help articles, support contacts                     |
| `/login`        | `src/app/login/page.tsx`        | User authentication and login                                       | Static | Firebase Auth integration                           |
| `/register`     | `src/app/register/page.tsx`     | User registration and account creation                              | Static | Firebase Auth registration                          |
| `/profile`      | `src/app/profile/page.tsx`      | User profile management                                             | Static | Profile editing, preferences                        |
| `/cookies`      | `src/app/cookies/page.tsx`      | Cookie policy and preferences                                       | Static | GDPR compliance, cookie management                  |
| `/privacy`      | `src/app/privacy/page.tsx`      | Privacy policy and data handling                                    | Static | Privacy details, user rights                        |
| `/terms`        | `src/app/terms/page.tsx`        | Terms of service and legal information                              | Static | Legal terms, service conditions                     |
| `/unauthorized` | `src/app/unauthorized/page.tsx` | Access denied page                                                  | Static | Unauthorized access handling                        |

#### **Game Routes**

| Route                   | File Path                               | Description                | Type   | Features                                  |
| ----------------------- | --------------------------------------- | -------------------------- | ------ | ----------------------------------------- |
| `/game`                 | `src/app/game/page.tsx`                 | Game hub and selection     | Static | Game overview, controls help              |
| `/game/beyblade-battle` | `src/app/game/beyblade-battle/page.tsx` | Main battle game interface | Static | Real-time battle mechanics, strategy tips |

#### **Testing Routes**

| Route         | File Path                     | Description              | Type   | Features                               |
| ------------- | ----------------------------- | ------------------------ | ------ | -------------------------------------- |
| `/auth-demo`  | `src/app/auth-demo/page.tsx`  | Authentication demo page | Static | Auth testing, multiple implementations |
| `/test-error` | `src/app/test-error/page.tsx` | Error testing page       | Static | Error boundary testing                 |

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

| Component                  | File Path                                          | Purpose                               | Type         | Dependencies                        |
| -------------------------- | -------------------------------------------------- | ------------------------------------- | ------------ | ----------------------------------- |
| `InteractiveHeroBanner`    | `src/components/home/InteractiveHeroBanner.tsx`    | Interactive hero with dynamic theming | Interactive  | Material-UI, useCookie, theme-aware |
| `ModernHeroBanner`         | `src/components/home/ModernHeroBanner.tsx`         | Static homepage hero section          | Presentation | Material-UI, theme-aware            |
| `MinimalistHero`           | `src/components/home/MinimalistHero.tsx`           | Alternative hero design               | Presentation | Material-UI                         |
| `ModernFeaturedCategories` | `src/components/home/ModernFeaturedCategories.tsx` | Product category showcase             | Presentation | Material-UI, hover effects          |
| `ModernCustomerReviews`    | `src/components/home/ModernCustomerReviews.tsx`    | Customer testimonials                 | Presentation | Material-UI, carousel               |
| `ModernWhyChooseUs`        | `src/components/home/ModernWhyChooseUs.tsx`        | Value proposition section             | Presentation | Material-UI, feature cards          |

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
| `AuthGuard`           | `src/components/auth/AuthGuard.tsx`                    | Route protection wrapper  | Guard       | Auth context |
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

### **Interactive Components** (Client-Side)

- **InteractiveHeroBanner** - Dynamic hero with product showcases, auto-rotation, generation switching
- User interactions (clicks, forms, games)
- State management with cookie persistence
- Browser API access
- Real-time updates and animations

### **Presentation Components** (Server-Side Compatible)

- Static content display
- SEO-optimized
- No client-side interactivity
- Theme-aware styling via CSS variables

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

## 🆕 New Component Features

### **InteractiveHeroBanner Enhanced Features**

```tsx
// Key features implemented:
- Dynamic generation switching (4 Beyblade generations)
- Auto-rotation with pause/resume controls
- Cookie-based preference persistence
- Product card grid (2x2 layout)
- Sale banner integration
- Theme-aware styling
- Media controls bar with generation tabs
- Smooth transitions and animations
```

**Component Structure:**

- Sale Banner (promotional content)
- Hero Content (left: text content, right: product cards)
- Media Controls Bar (left: play controls, right: generation selector)

**State Management:**

- `useCookie` for persistent preferences
- Auto-play functionality with pause/resume
- Generation selection with smooth transitions

**Styling Approach:**

- Clean, minimal card design
- Consistent spacing and hover effects
- Theme-aware colors and gradients
- Responsive grid layout

---

## 📋 Component Usage Patterns

### **Interactive Hero Banner**

```tsx
import InteractiveHeroBanner from "@/components/home/InteractiveHeroBanner";

export default function HomePage() {
  return (
    <main>
      <InteractiveHeroBanner />
      {/* Other homepage components */}
    </main>
  );
}
```

**Features:**

- Automatic theme adaptation
- Cookie-based state persistence
- Dynamic product showcase
- Interactive media controls

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

- **Static Routes:** 18+ pages pre-rendered at build time
- **Dynamic Routes:** API routes server-rendered on demand
- **Client Components:** Hydrated after initial page load
- **Interactive Components:** Progressive enhancement with state persistence
- **Bundle Splitting:** Automatic code splitting by route

### **Component Loading Strategy**

1. **Server Components:** Rendered on server, sent as HTML
2. **Interactive Components:** Hydrated progressively with state restoration
3. **Game Components:** Loaded on-demand for game routes
4. **Auth Components:** Loaded only when authentication required
5. **Hero Components:** Immediate rendering with progressive enhancement

---

## 📝 Maintenance Guidelines

### **When Adding New Routes:**

1. Create page component in appropriate `src/app/` directory
2. Update this documentation
3. Add route to constants if needed
4. Consider SEO metadata
5. Test with interactive components

### **When Adding New Components:**

1. Choose appropriate category (presentation/interactive/guard/utility)
2. Follow naming convention (Pascal case with descriptive suffix)
3. Add proper TypeScript interfaces
4. Update this documentation
5. Consider theme compatibility
6. Test state persistence if interactive

### **Interactive Component Guidelines:**

1. Use `"use client"` directive for client components
2. Implement proper error boundaries
3. Use `useCookie` for state persistence
4. Follow theme-aware styling patterns
5. Implement proper loading states

### **Component Naming Conventions:**

- **Pages:** `Page` suffix (e.g., `ContactPage`)
- **Layout:** `Layout` suffix (e.g., `ModernLayout`)
- **Interactive:** Descriptive name (e.g., `InteractiveHeroBanner`)
- **Utility:** Purpose-based (e.g., `ThemeAwareBox`)
- **Guards:** `Guard` suffix (e.g., `RouteGuard`)

---

_This documentation is automatically maintained and should be updated whenever routes or components are added, modified, or removed._
