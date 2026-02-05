# Development Instructions

**🎉 100% Coding Standards Compliance (110/110)** - [View Audit Report](./AUDIT_REPORT.md)

This document outlines the mandatory coding standards and best practices for the LetItRip project. All contributors must follow these guidelines.

**Status**: All 11 standards fully implemented with Repository pattern, Type utilities, Query helpers, Rate limiting, and Authorization.

---

## Core Principles

1. **Reuse Over Reinvention** - Leverage existing code (repositories, schemas, utilities)
2. **Living Documentation** - Update, don't duplicate
3. **Secure by Design** - Security first, always (rate limiting + authorization implemented)
4. **Type Safety** - Validate early, validate often (type utilities for all schemas)
5. **Maintainable Architecture** - Clean, testable, scalable (SOLID principles met)

---

## 1. Code Reusability & Architecture

### Always Check First:
- ✅ `src/components/` - Existing UI components
- ✅ `src/hooks/` - Existing React hooks
- ✅ `src/constants/` - Existing constants
- ✅ `src/lib/` - Existing utilities and classes
- ✅ `src/contexts/` - Existing contexts
- ✅ `src/repositories/` - Repository pattern for data access
- ✅ `src/db/schema/` - Type utilities and query helpers
- ✅ `src/constants/api-endpoints.ts` - API endpoints

### Guidelines:
- **Extend** existing code rather than duplicating
- Keep components **loosely coupled**
- Maintain **high cohesion** (single responsibility)
- Use **composition** over inheritance
- Apply **dependency injection** for testability

### Example:
```tsx
// ❌ BAD
const MyCustomButton = () => <button>Click</button>

// ✅ GOOD
import { Button } from '@/components'
<Button variant="primary">Click</Button>
```

---

## 2. Documentation Standards

### Rules:
- ✅ Update **only** files in `docs/` folder
- ✅ Extend existing docs, don't create duplicates
- ✅ Use `docs/CHANGELOG.md` for all changes
- ❌ No session-specific docs (`REFACTORING_YYYY-MM-DD.md`)
- ✅ Keep concise and actionable

### Structure:
```
docs/
├── README.md              # Documentation index
├── CHANGELOG.md           # Change log (update here!)
├── INSTRUCTIONS.md        # This file
├── API_CLIENT.md          # API documentation
├── QUICK_REFERENCE.md     # Quick lookups
└── guides/                # Topic-specific guides
```

---

## 3. Design Patterns & Security

### Required Design Patterns:
- ✅ **Singleton** - API client, config managers, repositories
- ✅ **Factory** - Object creation
- ✅ **Observer** - Event handling, state management
- ✅ **Facade** - Simplified interfaces
- ✅ **Strategy** - Interchangeable algorithms
- ✅ **Repository** - Data access layer (IMPLEMENTED)

### Repository Pattern Usage:
```typescript
import { userRepository } from '@/repositories';

// Type-safe CRUD operations
const user = await userRepository.findById('userId');
const users = await userRepository.findByRole('admin');

// Using type utilities
import type { UserCreateInput } from '@/db/schema/users';
const newUser: UserCreateInput = { /* ... */ };

// Using query helpers
import { userQueryHelpers } from '@/db/schema/users';
const [field, op, value] = userQueryHelpers.byEmail('user@example.com');
```

### Security Checklist:
- ✅ Input validation on all user inputs
- ✅ Output encoding (XSS prevention)
- ✅ CSRF protection via NextAuth
- ✅ Secure headers in `next.config.js`
- ✅ Never commit environment secrets
- ✅ **Rate limiting on API routes (IMPLEMENTED)**
- ✅ Parameterized queries (Firestore safe by default)
- ✅ Authentication with NextAuth v5
- ✅ **Authorization checks on protected routes (IMPLEMENTED)**

### Security Implementation:
```typescript
import { rateLimit, RateLimitPresets } from '@/lib/security/rate-limit';
import { requireAuth, requireRole } from '@/lib/security/authorization';

// Rate limiting
const result = await rateLimit(request, RateLimitPresets.API);
if (!result.success) {
  return NextResponse.json({ error: result.error }, { status: 429 });
}

// Authorization
const user = await requireAuth();
await requireRole(user.id, 'admin');
```

---

## 4. TypeScript Validation Workflow

### Pre-Build Process:
```bash
# Step 1: Check only changed files
npx tsc --noEmit src/app/profile/page.tsx src/hooks/useAuth.ts

# Step 2: If no errors, run full build
npm run build

# Step 3: Run tests
npm test
```

### Benefits:
- 🚀 Faster feedback (check only what changed)
- 🎯 Focused error messages
- 💰 Lower cost and time

---

## 5. Database Schema Organization

### File Structure:
```
src/models/
├── user.schema.ts
├── trip.schema.ts
├── booking.schema.ts
└── index.ts
```

### Each Schema File Must Include:

1. **Table Definition**
```typescript
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
})
```

2. **Indices**
```typescript
export const userIndices = {
  emailIndex: index('user_email_idx').on(users.email),
}
```

3. **Relationships with Comments**
```typescript
export const userRelations = relations(users, ({ many }) => ({
  trips: many(trips),  // One user → many trips
}))

// RELATIONSHIP: users (1) ----< (N) trips
// FOREIGN KEY: trips.userId → users.id
```

4. **TypeScript Types**
```typescript
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
```

---

## 6. Error Handling Standards

### Error Class Hierarchy:
```typescript
// Base error class
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code: string,
    public data?: unknown
  ) {
    super(message)
  }
}

// Specific error types
export class ApiError extends AppError { }
export class ValidationError extends AppError { }
export class AuthenticationError extends AppError { }
```

### Error Constants:
```typescript
// src/constants/errors.ts
export const ERROR_CODES = {
  AUTH_INVALID_CREDENTIALS: 'AUTH_001',
  VALIDATION_REQUIRED_FIELD: 'VAL_001',
} as const

export const ERROR_MESSAGES = {
  [ERROR_CODES.AUTH_INVALID_CREDENTIALS]: 'Invalid credentials',
} as const
```

### Usage:
```typescript
import { ApiError, ERROR_CODES, ERROR_MESSAGES } from '@/lib/errors'

throw new ApiError(
  401,
  ERROR_MESSAGES[ERROR_CODES.AUTH_INVALID_CREDENTIALS]
)
```

---

## 7. Styling Standards

### Rules:
- ✅ Use existing components from `src/components/`
- ✅ Work with `ThemeContext` for theming
- ✅ Use Tailwind utility classes
- ✅ Extend component variants for custom styles
- ❌ No inline styles (except dynamic values)
- ❌ No CSS modules unless necessary

### Style Guide:
- **Use `themed.*`** for basic colors (backgrounds, text, borders) - auto dark mode
- **Use `colors.*`** for semantic component colors (badges, alerts, icons, buttons)
- **Use `useTheme()`** only for conditional logic based on theme mode
- **Always prefer Tailwind classes** from THEME_CONSTANTS over inline styles

### Examples:
```tsx
// ✅ GOOD: Using theme context for conditional logic
import { useTheme } from '@/contexts/ThemeContext'
import { THEME_CONSTANTS } from '@/constants/theme'

const { theme } = useTheme() // Returns 'light' | 'dark'
<Button variant={theme === 'dark' ? 'primary' : 'secondary'}>Click</Button>

// ✅ GOOD: Using THEME_CONSTANTS for styling
const { themed, colors } = THEME_CONSTANTS
<div className={themed.bgPrimary}>
  <h1 className={themed.textPrimary}>Title</h1>
  <button className={colors.iconButton.onLight}>Click</button>
</div>

// ❌ BAD: Inline styles
<button style={{ color: 'blue', padding: '10px' }}>Click</button>

// ❌ BAD: Incorrect useTheme usage (it doesn't return colors)
const { theme } = useTheme()
<div style={{ backgroundColor: theme.colors.background }}> // WRONG!
```

---

## 8. Proxy Over Middleware

### Use Proxy For:
- API route rewrites
- Static redirects
- External API proxying
- URL rewriting

### Use Middleware For:
- Authentication checks (dynamic)
- Request/response modification
- Rate limiting
- A/B testing

### Example:
```javascript
// next.config.js - Proxy
async rewrites() {
  return [
    { source: '/api/v1/:path*', destination: 'https://api.example.com/:path*' }
  ]
}

// middleware.ts - Auth check
export function middleware(request: NextRequest) {
  if (!request.cookies.get('session')) {
    return NextResponse.redirect('/login')
  }
}
```

---

## 9. Code Quality Principles

### SOLID Principles:
- **S** - Single Responsibility: One class, one purpose
- **O** - Open/Closed: Open for extension, closed for modification
- **L** - Liskov Substitution: Subtypes replace base types
- **I** - Interface Segregation: Small, focused interfaces
- **D** - Dependency Injection: Inject dependencies

### Testability:
- ✅ Pure functions (no side effects)
- ✅ Dependency injection
- ✅ Small, focused functions
- ✅ Avoid global state
- ✅ Clear contracts

---

## 10. Documentation Update Process

### For Every Code Change:
1. Make code changes
2. Update relevant docs in `docs/`
3. Add entry to `CHANGELOG.md`
4. Commit together

### Changelog Format:
```markdown
## [Unreleased]

### Added
- New feature X

### Changed
- Updated component Y

### Fixed
- Fixed bug Z

### Deprecated
- Old hook ABC

### Security
- Added rate limiting
```

---

## 11. Pre-Commit Audit

### Checklist (Complete Before Every Commit):

```
□ 1. Checked for existing components/hooks/constants?
□ 2. Updated docs/ and CHANGELOG.md?
□ 3. Followed design patterns and security best practices?
□ 4. Ran TypeScript check on changed files?
□ 5. Database schema includes tables/indices/relations?
□ 6. Using error classes and constants?
□ 7. Using existing components and theme context?
□ 8. Used proxy over middleware where appropriate?
□ 9. Code follows SOLID principles and is testable?
□ 10. Updated living documentation (no session docs)?
□ 11. Completed this audit checklist?
```

### Pre-Commit Commands:
```bash
# Type check changed files
npx tsc --noEmit <changed-files>

# Run full build
npm run build

# Run tests
npm test

# Lint check
npm run lint
```

---

## Quick Reference

| Task | Command |
|------|---------|
| Type check files | `npx tsc --noEmit <files>` |
| Build project | `npm run build` |
| Run tests | `npm test` |
| Lint code | `npm run lint` |
| Fix lint issues | `npm run lint:fix` |

---

## Summary

**Remember: Quality > Speed**

1. ♻️ **Reuse** existing code
2. 📝 **Document** in CHANGELOG
3. 🏗️ **Follow** design patterns
4. ✅ **Validate** TypeScript first
5. 🗄️ **Organize** database schemas
6. 🚨 **Handle** errors properly
7. 🎨 **Style** with components
8. 🔀 **Use** proxy when possible
9. 🧪 **Write** testable code
10. 📚 **Update** living docs
11. ✔️ **Audit** before commit

**Follow these instructions to maintain a clean, secure, and maintainable codebase.**

---

For detailed examples and patterns, see:
- [GitHub Copilot Instructions](../.github/copilot-instructions.md)
- [API Client Guide](./API_CLIENT.md)
- [Quick Reference](./QUICK_REFERENCE.md)
