# 📁 Project Structure

## Root Directory

```
letitrip.in/
├── 📚 docs/                         # All documentation
├── 💻 src/                          # All source code
├── 📝 README.md                     # Project overview
├── 🤝 CONTRIBUTING.md               # Contribution guide
├── ⚙️ package.json                  # Dependencies & scripts
├── 🔧 .env.example                  # Environment template
├── 🎨 tailwind.config.js            # Tailwind configuration
├── 📘 tsconfig.json                 # TypeScript config
├── 🧪 jest.config.ts                # Jest configuration
└── 🔒 .gitignore                    # Git ignore rules
```

## Documentation Structure

```
docs/
├── 📋 README.md                     # Documentation index & navigation
│
├── 🚀 Quick Start
│   ├── QUICK_REFERENCE.md           # ⭐ Common patterns (START HERE)
│   ├── getting-started.md           # Installation & setup
│   └── project-structure.md         # Directory organization
│
├── 🏗️ Architecture
│   ├── ENGINEERING_IMPROVEMENTS.md  # ⭐ Best practices guide
│   ├── REFACTORING_SUMMARY.md       # Code evolution
│   └── development.md               # Development workflow
│
├── 🎯 Features
│   ├── AUTH_IMPLEMENTATION.md       # NextAuth v5 setup
│   ├── EMAIL_INTEGRATION.md         # Resend email service
│   └── PROFILE_FEATURES.md          # User profile features
│
├── 📦 Components
│   └── components/
│       └── README.md                # Component documentation
│
├── 🔌 API Reference
│   └── api/
│       ├── hooks.md                 # Custom hooks
│       ├── contexts.md              # Context providers
│       └── constants.md             # Constants reference
│
├── 📖 Guides
│   └── guides/
│       ├── mobile-gestures.md       # Touch interactions
│       ├── theming.md               # Theme system
│       ├── testing.md               # Testing patterns
│       └── accessibility.md         # A11y guidelines
│
├── 📜 Archives
│   ├── ARCHIVED_INSTRUCTIONS.md     # Historical docs
│   └── PROJECT_REORGANIZATION.md    # This reorganization
│
└── 🔍 Quick Links
    - Start: QUICK_REFERENCE.md
    - Setup: getting-started.md
    - Contribute: ../CONTRIBUTING.md
```

## Source Code Structure

```
src/
├── 🎯 app/                          # Next.js App Router
│   ├── api/                         # API Routes
│   │   ├── auth/                    # Authentication endpoints
│   │   │   ├── register/route.ts
│   │   │   ├── verify-email/route.ts
│   │   │   └── reset-password/route.ts
│   │   └── user/                    # User endpoints
│   │       ├── profile/route.ts
│   │       └── change-password/route.ts
│   ├── auth/                        # Auth pages
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   ├── verify-email/page.tsx
│   │   ├── forgot-password/page.tsx
│   │   └── reset-password/page.tsx
│   ├── profile/                     # User profile
│   │   └── page.tsx
│   ├── layout.tsx                   # Root layout
│   ├── page.tsx                     # Home page
│   └── globals.css                  # Global styles
│
├── 🎨 components/                   # UI Components
│   ├── ErrorBoundary.tsx            # Error handling
│   ├── FormField.tsx                # Reusable form field
│   ├── PasswordStrengthIndicator.tsx# Password validation
│   ├── Alert.tsx                    # Alert component
│   ├── Badge.tsx
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Checkbox.tsx
│   ├── Form.tsx
│   ├── Input.tsx
│   ├── Modal.tsx
│   ├── Radio.tsx
│   ├── Select.tsx
│   ├── Textarea.tsx
│   ├── Typography.tsx
│   ├── index.ts                     # Component barrel
│   └── layout/                      # Layout components
│       ├── BottomNavbar.tsx
│       ├── Footer.tsx
│       ├── MainNavbar.tsx
│       ├── NavItem.tsx
│       ├── Sidebar.tsx
│       └── TitleBar.tsx
│
├── 📌 constants/                    # ⭐ All Constants
│   ├── index.ts                     # Barrel export
│   ├── messages.ts                  # Error/success messages
│   ├── routes.ts                    # Route paths
│   ├── config.ts                    # Configuration values
│   ├── theme.ts                     # Theme constants
│   ├── site.ts                      # Site config
│   └── navigation.ts                # Navigation config
│
├── 🗄️ db/                           # Database Layer
│   ├── schema/                      # Type-safe schemas
│   │   ├── index.ts                 # Schema barrel
│   │   ├── users.ts                 # User schema
│   │   └── tokens.ts                # Token schemas
│   └── indices/                     # Firestore indices
│       ├── merge-indices.ts         # Index merger utility
│       ├── users.index.json
│       └── tokens.index.json
│
├── 🎣 hooks/                        # Custom React Hooks
│   ├── useApiRequest.ts             # API request hook
│   ├── useFormState.ts              # Form state hook
│   └── [other hooks]
│
├── 🔧 lib/                          # Utilities & Middleware
│   ├── api-middleware.ts            # withAuth, withErrorHandling
│   ├── api-response.ts              # successResponse, ApiErrors
│   ├── validation.ts                # Zod schemas
│   ├── tokens.ts                    # Token management
│   ├── email.ts                     # Email service (Resend)
│   ├── auth.ts                      # NextAuth configuration
│   └── firebase/
│       ├── admin.ts                 # Firebase Admin SDK
│       └── client.ts                # Firebase Client SDK
│
├── 🎭 providers/                    # Context Providers
│   └── AuthProvider.tsx             # NextAuth SessionProvider
│
└── 📘 types/                        # TypeScript Types
    └── auth.ts                      # Auth-related types
```

## Key Files by Purpose

### 🚀 Getting Started
```
📖 docs/QUICK_REFERENCE.md           # Start here!
📖 docs/getting-started.md           # Setup guide
📝 README.md                         # Project overview
🤝 CONTRIBUTING.md                   # How to contribute
🔧 .env.example                      # Environment setup
```

### 🏗️ Architecture
```
📖 docs/ENGINEERING_IMPROVEMENTS.md  # Best practices
📖 docs/REFACTORING_SUMMARY.md       # Code evolution
📖 docs/project-structure.md         # Structure guide
💻 src/constants/                    # All constants
💻 src/db/schema/                    # Database schemas
```

### 🎨 Components
```
💻 src/components/                   # All components
💻 src/components/FormField.tsx      # Reusable forms
💻 src/components/ErrorBoundary.tsx  # Error handling
💻 src/components/index.ts           # Component exports
```

### 🔌 API & Backend
```
💻 src/app/api/                      # API routes
💻 src/lib/api-middleware.ts         # Middleware
💻 src/lib/api-response.ts           # Responses
💻 src/lib/validation.ts             # Validation
💻 src/lib/tokens.ts                 # Token management
💻 src/lib/email.ts                  # Email service
```

### 🗄️ Database
```
💻 src/db/schema/                    # Type-safe schemas
💻 src/db/indices/                   # Firestore indices
💻 src/lib/firebase/                 # Firebase config
```

### 🎯 Authentication
```
📖 docs/AUTH_IMPLEMENTATION.md       # Auth guide
💻 src/lib/auth.ts                   # NextAuth config
💻 src/app/api/auth/                 # Auth endpoints
💻 src/app/auth/                     # Auth pages
💻 src/providers/AuthProvider.tsx    # Auth provider
```

## Navigation Guide

### I want to...

**Learn the codebase:**
1. Start → `docs/QUICK_REFERENCE.md`
2. Understand → `docs/ENGINEERING_IMPROVEMENTS.md`
3. Explore → `docs/project-structure.md`

**Add a feature:**
1. Patterns → `docs/QUICK_REFERENCE.md`
2. Constants → `src/constants/`
3. Components → `src/components/`
4. API → `src/app/api/`

**Find something:**
- Error messages → `src/constants/messages.ts`
- Routes → `src/constants/routes.ts`
- Config → `src/constants/config.ts`
- Schemas → `src/db/schema/`
- Components → `src/components/`

**Contribute:**
1. Read → `CONTRIBUTING.md`
2. Setup → `docs/getting-started.md`
3. Patterns → `docs/QUICK_REFERENCE.md`
4. Code → Follow existing patterns

## File Counts

```
📁 Root Level:      20 files (config & docs)
📁 docs/:          ~25 files (documentation)
📁 src/app/:       ~15 files (pages & API)
📁 src/components/: ~20 files (UI components)
📁 src/constants/:  ~7 files (all constants)
📁 src/lib/:       ~10 files (utilities)
📁 src/db/:        ~5 files (schemas & indices)
```

## Benefits of This Structure

✅ **Clean Root** - Only essential config files
✅ **Organized Docs** - Easy to find information
✅ **Logical Grouping** - Related files together
✅ **Scalable** - Easy to add new features
✅ **Professional** - Industry best practices
✅ **Discoverable** - Clear navigation
✅ **Maintainable** - Easy to update

---

**Pro Tip:** Bookmark these files:
- 🌟 `docs/QUICK_REFERENCE.md` - Your daily companion
- 🏗️ `docs/ENGINEERING_IMPROVEMENTS.md` - Architecture reference
- 🎨 `src/constants/` - All strings & config
- 📦 `src/components/` - Reusable components

**Last Updated:** February 5, 2026
