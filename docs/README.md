# JustForView.in Documentation Index

## 📖 Project Documentation Hub

Welcome to the comprehensive documentation for JustForView.in - a premium hobby store platform built with Next.js.

## 📁 Documentation Structure

### 🏗️ **Architecture** (`/architecture/`)

Core system architecture and technical design documentation:

- **API_REFACTORING_README.md** - API refactoring guidelines and implementation
- **ROUTES_DOCUMENTATION.md** - Complete route system documentation
- **ROUTE_REFACTORING_IMPLEMENTATION.md** - Route refactoring implementation details
- **ROUTE_REFACTORING_PLAN.md** - Strategic plan for route improvements

### ⚡ **Features** (`/features/`)

Feature specifications and functionality documentation:

- **PRODUCT_FEATURES.md** - Product management feature specifications
- **SEED_DATA_FEATURES.md** - Data seeding and initialization features

### 🔧 **Systems** (`/systems/`)

Core system implementations and component documentation:

- **VALIDATION_SYSTEM_SUMMARY.md** - Validation system architecture and usage
- **CATEGORIES_API_REFERENCE.md** - Category system API reference
- **CATEGORIES_DOCUMENTATION.md** - Category system documentation
- **CATEGORIES_IMPLEMENTATION_GUIDE.md** - Category implementation guide
- **CATEGORY_SYSTEM_README.md** - Category system overview

### 📋 **Project** (`/project/`)

Project management, structure, and organizational documentation:

- **PROJECT_STRUCTURE_REORGANIZATION_COMPLETE.md** - Complete project restructuring guide
- **INDIAN_LOCALIZATION_COMPLETE.md** - Indian market localization implementation
- **PROJECT_STRUCTURE_PROPOSAL.md** - Original project structure proposal
- **FILE_CORRECTIONS_SUMMARY.md** - File corrections and improvements summary

### 📚 **Guides** (`/guides/`)

Step-by-step implementation and usage guides _(Coming Soon)_

## 🚀 Quick Navigation

### For Developers

- Start with [Project Structure](./project/PROJECT_STRUCTURE_REORGANIZATION_COMPLETE.md)
- Review [Route Architecture](./architecture/ROUTES_DOCUMENTATION.md)
- Understand [Validation Systems](./systems/VALIDATION_SYSTEM_SUMMARY.md)

### For API Integration

- Check [API Refactoring Guide](./architecture/API_REFACTORING_README.md)
- Review [Category System API](./systems/CATEGORIES_API_REFERENCE.md)

### For Feature Development

- Browse [Product Features](./features/PRODUCT_FEATURES.md)
- Check [Seed Data Features](./features/SEED_DATA_FEATURES.md)

### For Localization

- Review [Indian Localization](./project/INDIAN_LOCALIZATION_COMPLETE.md)

## 🎯 Key Technologies

- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Styling**: Tailwind CSS
- **State Management**: React Context + Custom Hooks
- **Validation**: Zod
- **Localization**: Indian market (INR, IST)

## 📈 Documentation Status

| Category     | Status         | Last Updated |
| ------------ | -------------- | ------------ |
| Architecture | ✅ Complete    | Oct 2025     |
| Features     | ✅ Complete    | Oct 2025     |
| Systems      | ✅ Complete    | Oct 2025     |
| Project      | ✅ Complete    | Oct 2025     |
| Guides       | 🚧 In Progress | -            |

## � Contributing to Documentation

1. Follow the established structure for new documentation
2. Use clear, descriptive file names
3. Include table of contents for longer documents
4. Add relevant code examples
5. Update this index when adding new documentation

## 📞 Support

For questions about this documentation or the project:

- Review the relevant section above
- Check implementation guides in `/guides/`
- Refer to code comments in the source files

---

_This documentation is maintained as part of the JustForView.in project. Last updated: October 2025_

### Project Structure

```
justforview.in/
├── scripts/                    # Build and deployment scripts
│   ├── build-static.js
│   ├── fix-api-routes.js
│   ├── init-firebase.js
│   └── setup-vercel-env.js
├── src/
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── (auth)/             # Authentication pages
│   │   │   ├── forgot-password/
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (shop)/             # Shop pages
│   │   │   └── products/
│   │   ├── admin/              # Admin dashboard
│   │   │   ├── categories/
│   │   │   ├── coupons/
│   │   │   ├── dashboard/
│   │   │   ├── orders/
│   │   │   └── products/
│   │   ├── seller/             # Seller dashboard
│   │   │   ├── deals/
│   │   │   ├── orders/
│   │   │   ├── products/
│   │   │   └── dashboard/
│   │   ├── api/                # API Routes (Backend)
│   │   │   ├── auth/
│   │   │   ├── admin/
│   │   │   ├── products/
│   │   │   ├── orders/
│   │   │   ├── payment/
│   │   │   └── shipping/
│   │   ├── auctions/           # Auction system
│   │   ├── cart/               # Shopping cart
│   │   ├── checkout/           # Checkout process
│   │   ├── profile/            # User profile
│   │   ├── orders/             # Order management
│   │   ├── wishlist/           # User wishlist
│   │   └── [other pages]/      # Additional pages
│   ├── components/
│   │   ├── admin/              # Admin components
│   │   ├── auth/               # Auth components
│   │   │   ├── RoleGuard.tsx
│   │   │   └── CookieConsent.tsx
│   │   ├── categories/         # Category components
│   │   ├── layout/             # Layout components
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── Sidebar.tsx
│   │   ├── products/           # Product components
│   │   ├── seller/             # Seller components
│   │   │   └── SellerSidebar.tsx
│   │   └── ui/                 # UI components
│   ├── contexts/
│   │   ├── AuthContext.tsx     # Enhanced authentication
│   │   ├── CartContext.tsx     # Shopping cart state
│   │   └── CategoriesContext.tsx
│   ├── hooks/
│   │   ├── useEnhancedAuth.ts  # Auth hook
│   │   ├── useAuthRedirect.ts  # Auth redirects
│   │   ├── useCategories.ts    # Categories hook
│   │   ├── useFirebase.ts      # Firebase hook
│   │   └── useProducts.ts      # Products hook
│   ├── lib/
│   │   ├── api/                # API services
│   │   ├── auth/               # JWT, roles, middleware
│   │   │   ├── jwt.ts
│   │   │   ├── roles.ts
│   │   │   └── middleware.ts
│   │   ├── config/             # Configuration
│   │   │   ├── firebase.ts
│   │   │   └── payment.ts
│   │   ├── firebase/           # Firebase services
│   │   │   ├── admin.ts
│   │   │   └── client.ts
│   │   ├── services/           # Business logic
│   │   │   ├── auth.service.ts
│   │   │   ├── product.service.ts
│   │   │   ├── razorpay.ts
│   │   │   └── shiprocket.ts
│   │   ├── storage/            # Storage utilities
│   │   ├── utils/              # Utility functions
│   │   └── validations/        # Zod schemas
│   └── types/
│       └── index.ts            # TypeScript definitions
├── firebase.json               # Firebase configuration
├── vercel.json                 # Vercel deployment config
├── next.config.js              # Next.js configuration
├── tailwind.config.js          # Tailwind CSS config
└── package.json                # Dependencies
```

## 🔐 Enhanced Security Features

### Authentication & Authorization

- **JWT Cookies**: HTTP-only cookies with secure flags
- **Claims-Based Auth**: Rich user claims with permissions
- **Role-Based Access Control**: Admin, Seller, Customer roles
- **Session Management**: Secure session handling with automatic refresh
- **Password Security**: bcrypt hashing (12 rounds)

### Privacy & Compliance

- **Cookie Consent**: GDPR-compliant consent management
- **Storage Preferences**: Granular storage permissions
- **Data Protection**: Secure data handling with user consent
- **Fallback Storage**: localStorage fallback when cookies disabled

### Security Measures

- **CSRF Protection**: Cross-site request forgery prevention
- **Secure Redirects**: Safe redirect handling
- **Input Validation**: Comprehensive Zod schema validation
- **Rate Limiting**: API endpoint protection
- **Error Handling**: Secure error responses

## 📱 Using the Enhanced Authentication

### React Components

```typescript
import { useEnhancedAuth } from "@/hooks/useEnhancedAuth";

function MyComponent() {
  const { user, isAuthenticated, hasPermission, hasRole, login, logout } =
    useEnhancedAuth();

  if (hasRole("admin")) {
    return <AdminDashboard />;
  }

  if (hasPermission("products", "create")) {
    return <CreateProduct />;
  }

  return <CustomerView />;
}
```

### Role-Based Access Control

```typescript
import { RoleGuard } from "@/components/auth/RoleGuard";

<RoleGuard
  roles={["admin", "seller"]}
  permissions={[{ resource: "products", action: "manage" }]}
>
  <ProductManagement />
</RoleGuard>;
```

### API Usage

```bash
# Login (sets HTTP-only cookie)
curl -X POST https://yoursite.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'

# Subsequent requests use cookies automatically
curl -X GET https://yoursite.com/api/user/profile \
  -H "Cookie: auth-token=<cookie-value>"
```

## 🌟 Tech Stack

### Frontend

- **Next.js 16.0.0** - React framework with App Router
- **React 19** - Latest React with concurrent features
- **TypeScript 5.6** - Full type safety
- **Tailwind CSS** - Utility-first styling

### Backend & Database

- **Firebase Firestore** - NoSQL database
- **Firebase Authentication** - User management
- **Firebase Storage** - File storage
- **Firebase Admin SDK** - Server-side operations

### Authentication & Security

- **JWT (jsonwebtoken)** - Token-based authentication
- **bcryptjs** - Password hashing
- **HTTP-only cookies** - Secure token storage
- **Zod** - Runtime validation

### Integrations

- **Razorpay** - Payment processing
- **Shiprocket** - Shipping management
- **Vercel** - Hosting and deployment

## � Recent Updates

### Authentication Enhancement (auth-part-2)

- ✅ Complete authentication system overhaul
- ✅ JWT cookies with claims-based authorization
- ✅ Role-based access control (RBAC)
- ✅ Cookie consent & GDPR compliance
- ✅ Enhanced security measures
- ✅ Comprehensive session management

### Development Status

- **Current Branch**: `feature/dynamic-pages-implementation`
- **Deployment**: Production-ready on Vercel
- **Test Coverage**: Authentication system fully tested

## �📄 License

MIT License

---

**Built with ❤️ for modern e-commerce needs**
