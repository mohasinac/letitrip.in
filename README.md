# LetItRip.in - Multi-Seller E-commerce & Auction Platform

A modern Next.js 16 e-commerce platform with multi-seller marketplace, auction system, and promotional advertisements.

## 🚀 Features

- ⚡️ **Next.js 16** with App Router & Turbopack
- 🛍️ **Multi-Seller Marketplace** - Sellers can list and manage products
- 🎯 **Auction System** - Time-based bidding for auction items
- 📢 **Advertisement/Promotion System** - Featured and promoted products
- 🔐 **Firebase Authentication** - Google, Apple, Email/Password
- 🎨 **Tailwind CSS** with custom design system
- 📦 **Custom Component Library** with 40+ reusable components
- 🔥 **TypeScript** with full type safety
- 🗄️ **Firebase/Firestore** for database and real-time updates
- 📧 **Resend** for email service
- 🛡️ **Security Best Practices** with HTTP-only cookies
- 🎯 **Professional Architecture** following SOLID principles
- 📊 **Admin Dashboard** for platform management

## 🏪 Platform Overview

**Core Features:**

- **Products** - Standard product listings with inventory management
- **Auctions** - Time-limited bidding system with real-time updates
- **Orders** - Complete order management with shipping tracking
- **Reviews** - Product reviews and ratings
- **Categories** - Organized product categorization
- **Promotions** - Featured and promoted product listings
- **Seller Management** - Multi-vendor support with individual storefronts

## 📚 Documentation

**Start Here:**

- 🌟 **[Quick Reference Guide](./docs/QUICK_REFERENCE.md)** - Common patterns and quick lookups
- 📋 **[Changelog](./docs/CHANGELOG.md)** - Version history and updates
- 🤝 **[Contributing](./CONTRIBUTING.md)** - How to contribute

**Full Documentation:**

- [Documentation Index](./docs/README.md) - Complete documentation navigation
- [Guide](./docs/GUIDE.md) - Complete codebase reference
- [Security](./docs/SECURITY.md) - Security practices
- [RBAC](./docs/RBAC.md) - Role access system
- [Error Handling](./docs/ERROR_HANDLING.md) - Error architecture
- [Styling Guide](./docs/STYLING_GUIDE.md) - UI and styling standards

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Firebase project with Firestore
- Resend account (for emails)

### Installation

```bash
# 1. Clone the repository
git clone <repository-url>
cd letitrip.in

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# 4. Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

### Build for Production

```bash
npm run build
npm start
```

### Firebase Deployment

Deploy Firestore rules and indices using the provided PowerShell scripts:

```powershell
# Deploy composite indices (firestore.indexes.json)
.\scripts\deploy-firestore-indices.ps1

# Deploy security rules (firestore.rules, storage.rules, database.rules.json)
.\scripts\deploy-firestore-rules.ps1

# Check deployment status and view active indices
.\scripts\check-firestore-status.ps1
```

Or use Firebase CLI directly:

```bash
# Deploy all Firestore resources
firebase deploy --only firestore

# Deploy specific resources
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
firebase deploy --only storage:rules
firebase deploy --only database:rules
```

**Note:** Index creation can take several minutes. Monitor progress in Firebase Console.

### Vercel Deployment

Sync environment variables from `.env.local` to Vercel using the provided PowerShell scripts:

```powershell
# Sync all variables from .env.local to Vercel (production, preview, development)
.\scripts\sync-env-to-vercel.ps1

# Dry run to see what would be synced without making changes
.\scripts\sync-env-to-vercel.ps1 -DryRun

# Sync to specific environment(s)
.\scripts\sync-env-to-vercel.ps1 -Environment "production"

# Pull environment variables from Vercel to local file
.\scripts\pull-env-from-vercel.ps1

# List all environment variables in Vercel
.\scripts\list-vercel-env.ps1
```

Or use Vercel CLI directly:

```bash
# Add a single environment variable
vercel env add VARIABLE_NAME production,preview,development

# Remove an environment variable
vercel env rm VARIABLE_NAME production

# List all environment variables
vercel env ls

# Pull environment variables to file
vercel env pull .env.vercel
```

**Note:** The sync script automatically handles updates by removing and re-adding variables. Always review variables before syncing to production.

### Theme System

- **Dark Mode** - Automatic system detection with manual toggle
- **CSS Variables** - Dynamic theming with CSS custom properties
- **Variants** - Primary, secondary, success, error, warning, info
- **Responsive** - Mobile-first breakpoints (sm, md, lg, xl, 2xl)

### Mobile Gestures

5 custom hooks for advanced touch interactions:

- `useSwipe` - Swipe detection with velocity tracking
- `useGesture` - Multi-touch (tap, double-tap, pinch, rotate)
- `useLongPress` - Long-press with movement threshold
- `useClickOutside` - Outside-click handler
- `useKeyPress` - Keyboard shortcuts with modifiers

### Performance

- **Code Splitting** - Automatic route-based splitting
- **Tree Shaking** - Dead code elimination
- **Lazy Loading** - Dynamic imports for heavy components
- **Optimized Assets** - Image optimization with Next.js Image

## 📖 Example Usage

```tsx
import { Button, Card, Input, useSwipe } from "@/index";
import { useTheme } from "@/contexts";
import { useRef } from "react";

function ExampleComponent() {
  const { theme, toggleTheme } = useTheme();
  const cardRef = useRef<HTMLDivElement>(null);

  useSwipe(cardRef, {
    onSwipeLeft: () => console.log("Swiped left!"),
    minSwipeDistance: 50,
  });

  return (
    <Card ref={cardRef}>
      <h1>Current theme: {theme}</h1>
      <Button onClick={toggleTheme} variant="primary">
        Toggle Theme
      </Button>
      <Input placeholder="Enter text..." />
    </Card>
  );
}
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Watch mode
npm test -- --watch

# Coverage report
npm test -- --coverage
```

**Current Status:** 301 tests passing across 27 test suites

## 🤝 Contributing

1. Follow the existing project structure
2. Add tests for new components
3. Update documentation in `/docs`
4. Use TypeScript strict mode
5. Follow accessibility guidelines (WCAG 2.1)

## 📄 License

MIT

## 🔗 Links

- [Documentation](./docs/README.md)
- [Guide](./docs/GUIDE.md)
- [Quick Reference](./docs/QUICK_REFERENCE.md)
- [Security](./docs/SECURITY.md)

---

**Built with ❤️ using Next.js, React, and TypeScript**

## 🎨 Styling System

### Theme Constants

All styling uses centralized `THEME_CONSTANTS`:

- Automatic dark mode support
- No hardcoded colors or spacing
- Consistent design system
