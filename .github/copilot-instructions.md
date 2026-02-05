# GitHub Copilot Instructions for LetItRip Project

## 🎉 Status: 100% Coding Standards Compliance (110/110)

**All 11 coding standards fully implemented and documented.**  
[View Full Audit Report](../docs/AUDIT_REPORT.md) | [Changelog](../docs/CHANGELOG.md)

---

## Project Technology Stack

**Framework**: Next.js 16.1.1 (App Router, Turbopack)  
**Language**: TypeScript  
**Styling**: Tailwind CSS with custom theme system  
**Authentication**: Firebase Auth (Google, Apple, Email/Password)  
**Database**: Firebase Firestore (NoSQL) - Primary database  
**Realtime**: Firebase Realtime Database - Presence, chat, notifications  
**Storage**: Firebase Cloud Storage - Images & documents  
**Email**: Resend  
**State Management**: React Context + React hooks  
**Testing**: Jest + React Testing Library

---

## Firebase Services Architecture

### 🔥 Firebase Stack Overview

This project uses Firebase as the complete backend solution:

#### 1. **Firebase Authentication**
- **Email/Password** - Traditional authentication
- **Google OAuth** - No client ID/secret needed (Firebase manages)
- **Apple OAuth** - No Apple Developer account needed (Firebase manages)
- **Phone Authentication** - SMS verification via reCAPTCHA
- **Email Verification** - Automatic verification emails
- **Password Reset** - Built-in password reset flow

**Location**: `src/lib/firebase/auth-helpers.ts` (client), `src/lib/firebase/auth-server.ts` (server)

#### 2. **Firebase Firestore (Primary Database)**
- **Document-based NoSQL database**
- **Real-time synchronization**
- **Offline support**
- **Complex querying with indices**
- **Transaction support**

**Collections**:
- `users` - User profiles and roles
- `trips` - Trip data and itineraries
- `bookings` - Booking records
- `emailVerificationTokens` - Email verification tokens
- `passwordResetTokens` - Password reset tokens

**Location**: `src/db/schema/` (schemas), `src/repositories/` (data access)

#### 3. **Firebase Realtime Database** (Optional - for real-time features)
- **JSON tree structure**
- **Ultra-low latency**
- **Perfect for real-time chat, live updates**
- **Presence detection**

**Use Cases**:
- Real-time chat messages
- Live trip updates
- User presence/online status
- Live notifications

**Location**: Configure in `src/lib/firebase/config.ts` when needed

#### 4. **Firebase Cloud Storage**
- **File uploads** (images, documents, PDFs)
- **User profile photos**
- **Trip images and galleries**
- **Secure URL generation**
- **Automatic image optimization** (via Firebase Extensions)

**Folder Structure**:
```
storage/
├── users/{uid}/
│   ├── profile.jpg
│   └── documents/
├── trips/{tripId}/
│   ├── cover.jpg
│   └── gallery/
└── public/
    └── assets/
```

**Location**: `src/lib/firebase/storage.ts` (create when needed)

#### 5. **Firebase Admin SDK** (Server-Side)
- **Token verification**
- **User management**
- **Firestore admin operations**
- **Custom claims (roles)**

**Location**: `src/lib/firebase/admin.ts`

---

## Firestore Index Management

### Why Indices Matter
Firestore requires indices for:
- Queries with multiple fields
- Queries with range filters + orderBy
- Compound queries

### Index Setup Process

#### Method 1: Automatic (Recommended)
1. Run queries in development
2. Click the Firebase Console error link
3. Firebase creates index automatically
4. Wait 2-5 minutes for index build

#### Method 2: Manual (firestore.indexes.json)
```json
{
  "indexes": [
    {
      "collectionGroup": "trips",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "bookings",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "users",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "role", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    }
  ],
  "fieldOverrides": []
}
```

#### Method 3: Firebase CLI
```bash
# Deploy indices from firestore.indexes.json
firebase deploy --only firestore:indexes

# List existing indices
firebase firestore:indexes
```

### Common Index Patterns

**Pattern 1: User's Items with Sorting**
```typescript
// Query: Get user's trips sorted by date
query(
  collection(db, 'trips'),
  where('userId', '==', uid),
  orderBy('createdAt', 'desc')
)
// Index: [userId ASC, createdAt DESC]
```

**Pattern 2: Filtered List with Sorting**
```typescript
// Query: Get active bookings sorted by date
query(
  collection(db, 'bookings'),
  where('userId', '==', uid),
  where('status', '==', 'active'),
  orderBy('createdAt', 'desc')
)
// Index: [userId ASC, status ASC, createdAt DESC]
```

**Pattern 3: Role-Based Queries**
```typescript
// Query: Get all admin users
query(
  collection(db, 'users'),
  where('role', '==', 'admin'),
  orderBy('createdAt', 'desc')
)
// Index: [role ASC, createdAt DESC]
```

### Index Best Practices

✅ **DO**:
- Create indices for production queries
- Use composite indices for multi-field queries
- Document required indices in schema files
- Test queries in development first
- Monitor index usage in Firebase Console

❌ **DON'T**:
- Create unnecessary indices (costs storage)
- Over-index simple queries (single field queries don't need indices)
- Forget to update indices when queries change
- Use too many orderBy clauses (max 1 per query without array-contains)

### Index Monitoring

**Firebase Console → Firestore → Indexes**
- View all indices
- See index build status
- Check index usage stats
- Delete unused indices

---

## Firebase Security Rules

### Firestore Rules (`firestore.rules`)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isSignedIn() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isSignedIn() && request.auth.uid == userId;
    }
    
    function isAdmin() {
      return isSignedIn() && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if isSignedIn();
      allow create: if isSignedIn() && request.auth.uid == userId;
      allow update: if isOwner(userId) || isAdmin();
      allow delete: if isAdmin();
    }
    
    // Trips collection
    match /trips/{tripId} {
      allow read: if true; // Public
      allow create: if isSignedIn();
      allow update, delete: if isOwner(resource.data.userId) || isAdmin();
    }
    
    // Bookings collection
    match /bookings/{bookingId} {
      allow read: if isOwner(resource.data.userId) || isAdmin();
      allow create: if isSignedIn();
      allow update: if isOwner(resource.data.userId) || isAdmin();
      allow delete: if isAdmin();
    }
  }
}
```

### Storage Rules (`storage.rules`)
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // User profile photos
    match /users/{userId}/profile.jpg {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // User documents
    match /users/{userId}/documents/{document} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Trip images
    match /trips/{tripId}/{allPaths=**} {
      allow read: if true; // Public
      allow write: if request.auth != null;
    }
    
    // Public assets
    match /public/{allPaths=**} {
      allow read: if true;
      allow write: if false; // Admin only via Firebase Console
    }
  }
}
```

### Realtime Database Rules (`database.rules.json`)
```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "auth != null",
        ".write": "auth != null && auth.uid == $uid"
      }
    },
    "presence": {
      "$uid": {
        ".read": true,
        ".write": "auth != null && auth.uid == $uid"
      }
    },
    "chat": {
      "$chatId": {
        ".read": "auth != null",
        ".write": "auth != null"
      }
    }
  }
}
```

---

## Coding Standards & Best Practices

Follow these guidelines for all code contributions to ensure high-quality, maintainable, and loosely coupled code.

---

## 1. Code Reusability & Architecture

**Principle:** Maximize reuse, minimize duplication

### Before Writing New Code:
- ✅ Check existing components in `src/components/`
- ✅ Check existing hooks in `src/hooks/`
- ✅ Check existing constants in `src/constants/`
- ✅ Check existing classes in `src/lib/`
- ✅ Check existing contexts in `src/contexts/`
- ✅ Check existing repositories in `src/repositories/`
- ✅ Check existing schemas in `src/db/schema/` (type utilities & query helpers)
- ✅ Check existing security utilities in `src/lib/security/`
- ✅ Check existing API endpoints in `src/constants/api-endpoints.ts`

### When Extending:
- ✅ **Extend** existing components/hooks rather than duplicating
- ✅ Keep code **loosely coupled** - components should work independently
- ✅ Maintain **high cohesion** - each component has a single, well-defined purpose
- ✅ Use **composition** over inheritance
- ✅ Follow **dependency injection** patterns where applicable

### Example:
```tsx
// ❌ BAD: Creating new component when one exists
const CustomInput = () => { /* duplicate logic */ }

// ✅ GOOD: Reusing and extending
import { FormField } from '@/components'
<FormField {...props} customFeature={value} />
```

---

## 2. Documentation Standards

**Principle:** Update, don't duplicate

### Rules:
- ✅ Update **ONLY** documents in `docs/` folder
- ✅ **Extend** existing documentation instead of creating new files
- ✅ Use `docs/CHANGELOG.md` for version updates
- ✅ **NO** session-specific documentation (e.g., `REFACTORING_2026-02-05.md`)
- ✅ Keep documentation **concise** and **actionable**
- ✅ Update relevant docs when changing code

### Documentation Structure:
```
docs/
├── README.md              # Main entry point
├── CHANGELOG.md           # Version history (update this!)
├── API_CLIENT.md          # API usage
├── QUICK_REFERENCE.md     # Quick lookups
└── guides/                # Specific guides
```

### Example Update:
```markdown
<!-- In CHANGELOG.md -->
## [Unreleased]
### Changed
- Updated FormField component to support custom validation
```

---

## 3. Design Patterns & Security

**Principle:** Use proven patterns and secure practices

### Required Patterns:
- ✅ **Singleton Pattern** - API client, configuration managers
- ✅ **Factory Pattern** - Component creation, object instantiation
- ✅ **Observer Pattern** - Event handling, state management
- ✅ **Facade Pattern** - Simplified interfaces for complex systems
- ✅ **Strategy Pattern** - Interchangeable algorithms (validation, sorting)
- ✅ **Repository Pattern** - Data access layer
- ✅ **Dependency Injection** - Testability and loose coupling

### Security Best Practices:
- ✅ **Input Validation** - Validate all user inputs
- ✅ **Output Encoding** - Prevent XSS attacks
- ✅ **CSRF Protection** - Use NextAuth CSRF tokens
- ✅ **Secure Headers** - Set in `next.config.js`
- ✅ **Environment Variables** - Never commit secrets
- ✅ **Rate Limiting** - Implement on API routes
- ✅ **SQL Injection Prevention** - Use parameterized queries
- ✅ **Authentication** - Use NextAuth v5 patterns
- ✅ **Authorization** - Check permissions on every protected route

### Example:
```tsx
// ✅ GOOD: Using Strategy Pattern for validation
const validationStrategies = {
  email: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
  phone: (value: string) => /^\+?[\d\s-()]+$/.test(value),
}

const validate = (type: string, value: string) => 
  validationStrategies[type]?.(value) ?? false
```

---

## 4. TypeScript Validation Workflow

**Principle:** Catch type errors before build errors

### Pre-Build Checklist:
```bash
# Step 1: TypeScript check on changed files ONLY
npx tsc --noEmit <changed-file-paths>

# Step 2: If no errors, run full build
npm run build

# Step 3: If build succeeds, run tests
npm test
```

### Workflow:
1. ✅ Make code changes
2. ✅ Run TypeScript check on **ONLY** modified files
3. ✅ Fix all type errors
4. ✅ Run full build
5. ✅ Fix any runtime errors
6. ✅ Run tests

### Example:
```bash
# After modifying profile page and auth hook
npx tsc --noEmit src/app/profile/page.tsx src/hooks/useAuth.ts

# If no errors, then build
npm run build
```

### Benefits:
- 🚀 **Faster** - Check only changed files
- 🎯 **Focused** - See only relevant errors
- 💰 **Efficient** - Less time, less cost

---

## 5. Database Schema & Organization

**Principle**: Co-locate schema, indices, and relationships

**Note**: This project uses **Firebase Firestore** for database storage.

### Structure:
```
src/db/schema/
├── users.ts              # Users collection schema
├── trips.ts              # Trips collection schema
├── bookings.ts           # Bookings collection schema
├── tokens.ts             # Token collections schema
└── index.ts              # Exports
```

### Each Schema File Must Include:

#### 1. Collection Interface Definition
```typescript
// users.ts
export interface UserDocument {
  uid: string;
  email: string | null;
  emailVerified: boolean;
  displayName: string | null;
  photoURL: string | null;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export const USER_COLLECTION = 'users' as const;
```

#### 2. Indexed Fields Documentation
```typescript
/**
 * Fields that should be indexed in Firestore
 * Configure these in Firebase Console or via firebase.indexes.json
 */
export const USER_INDEXED_FIELDS = [
  'email',       // For login lookups
  'role',        // For role-based queries
  'emailVerified', // For filtering verified users
  'createdAt',   // For date-based sorting
] as const;
```

#### 3. Relationships Documentation
```typescript
/**
 * RELATIONSHIPS:
 * 
 * users (1) ----< (N) trips
 *       (1) ----< (N) bookings
 * 
 * Collection References:
 * - trips/{tripId}/userId references users/{uid}
 * - bookings/{bookingId}/userId references users/{uid}
 */
```

#### 4. Helper Constants
```typescript
/**
 * Default data for new documents
 */
export const DEFAULT_USER_DATA: Partial<UserDocument> = {
  role: 'user',
  emailVerified: false,
  photoURL: null,
};

/**
 * Fields that are publicly readable
 */
export const USER_PUBLIC_FIELDS = [
  'uid',
  'email',
  'displayName',
  'photoURL',
  'role',
] as const;

/**
 * Fields that users can update themselves
 */
export const USER_UPDATABLE_FIELDS = [
  'displayName',
  'photoURL',
] as const;

// ============================================
// TYPE UTILITIES (COMPLETE IMPLEMENTATION)
// ============================================
/**
 * Type for creating new users (omit system-generated fields)
 */
export type UserCreateInput = Omit<UserDocument, 'uid' | 'id' | 'createdAt' | 'updatedAt'>;

/**
 * Type for updating user profiles (only user-modifiable fields)
 */
export type UserUpdateInput = Partial<Pick<UserDocument, 'displayName' | 'photoURL'>>;

/**
 * Type for admin user updates (all mutable fields)
 */
export type UserAdminUpdateInput = Partial<Omit<UserDocument, 'uid' | 'id' | 'createdAt'>>;

// ============================================
// QUERY HELPERS (COMPLETE IMPLEMENTATION)
// ============================================
/**
 * Firestore query helper functions for type-safe queries
 */
export const userQueryHelpers = {
  byEmail: (email: string) => ['email', '==', email] as const,
  byPhone: (phone: string) => ['phoneNumber', '==', phone] as const,
  byRole: (role: UserRole) => ['role', '==', role] as const,
  verified: () => ['emailVerified', '==', true] as const,
  active: () => ['disabled', '==', false] as const,
  disabled: () => ['disabled', '==', true] as const,
} as const;
```

**IMPORTANT**: The above is the COMPLETE schema structure. All 6 sections are mandatory for 100% compliance.

### Example Complete Schema:
```typescript
// src/db/schema/users.ts

import { UserRole } from '@/types/auth';

// ============================================
// COLLECTION INTERFACE
// ============================================
export interface UserDocument {
  uid: string;
  email: string | null;
  phoneNumber: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: UserRole;
  emailVerified: boolean;
  disabled: boolean;
  createdAt: Date;
  updatedAt: Date;
  metadata?: {
    lastSignInTime?: string;
    loginCount?: number;
  };
}

export const USER_COLLECTION = 'users' as const;

// ============================================
// INDEXED FIELDS
// ============================================
/**
 * Fields indexed in Firestore for query performance
 * Configure in Firebase Console: Firestore Database → Indexes
 */
export const USER_INDEXED_FIELDS = [
  'email',          // For authentication queries
  'phoneNumber',    // For phone auth lookups
  'role',           // For role-based access control
  'disabled',       // For filtering active users
  'emailVerified',  // For filtering verified users
  'createdAt',      // For date-based sorting
] as const;

// ============================================
// RELATIONSHIPS
// ============================================
/**
 * RELATIONSHIP DIAGRAM:
 * 
 * users (1) ----< (N) trips
 *       (1) ----< (N) bookings
 *       (1) ----< (N) emailVerificationTokens
 *       (1) ----< (N) passwordResetTokens
 * 
 * Foreign Key Pattern (Firestore):
 * - trips/{tripId}.userId references users/{uid}
 * - bookings/{bookingId}.userId references users/{uid}
 * - emailVerificationTokens/{tokenId}.userId references users/{uid}
 */

// ============================================
// HELPER CONSTANTS
// ============================================
/**
 * Default user data for new registrations
 */
export const DEFAULT_USER_DATA: Partial<UserDocument> = {
  role: 'user',
  emailVerified: false,
  disabled: false,
  photoURL: null,
  displayName: null,
};

/**
 * Fields that are publicly readable (exclude sensitive data)
 */
export const USER_PUBLIC_FIELDS = [
  'uid',
  'email',
  'phoneNumber',
  'displayName',
  'photoURL',
  'role',
  'emailVerified',
  'createdAt',
] as const;

/**
 * Fields that users can update themselves
 */
export const USER_UPDATABLE_FIELDS = [
  'displayName',
  'photoURL',
] as const;
```

### Using Type Utilities & Query Helpers:

#### Example: Creating Users with Type Safety
```typescript
import type { UserCreateInput } from '@/db/schema/users';
import { userRepository } from '@/repositories';

// Type-safe user creation
const newUserData: UserCreateInput = {
  email: 'user@example.com',
  displayName: 'John Doe',
  role: 'user',
  emailVerified: false,
  disabled: false,
  phoneNumber: null,
  photoURL: null,
};

const user = await userRepository.create(newUserData);
```

#### Example: Querying with Query Helpers
```typescript
import { collection, query, where } from 'firebase-admin/firestore';
import { USER_COLLECTION, userQueryHelpers } from '@/db/schema/users';

const db = getFirestore();
const usersRef = collection(db, USER_COLLECTION);

// Find user by email (type-safe)
const [field, op, value] = userQueryHelpers.byEmail('user@example.com');
const emailQuery = query(usersRef, where(field, op, value));

// Find all admins
const adminQuery = query(usersRef, where(...userQueryHelpers.byRole('admin')));

// Find verified users
const verifiedQuery = query(usersRef, where(...userQueryHelpers.verified()));
```

#### Example: Using Repository Pattern
```typescript
import { userRepository } from '@/repositories';

// Find by email (built-in method)
const user = await userRepository.findByEmail('user@example.com');

// Find all admins
const admins = await userRepository.findByRole('admin');

// Check if email is registered
const exists = await userRepository.isEmailRegistered('user@example.com');

// Update user profile
await userRepository.updateProfile('userId', {
  displayName: 'Jane Doe',
  photoURL: 'https://example.com/photo.jpg',
});
```

---

## 6. Error Handling Standards

**Principle:** Centralize error handling with typed errors and constants

### Error Class Hierarchy:
```typescript
// src/lib/errors/base-error.ts
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code: string,
    public data?: unknown
  ) {
    super(message)
    this.name = this.constructor.name
  }
}

// src/lib/errors/api-error.ts
export class ApiError extends AppError {
  constructor(statusCode: number, message: string, data?: unknown) {
    super(statusCode, message, 'API_ERROR', data)
  }
}

// src/lib/errors/validation-error.ts
export class ValidationError extends AppError {
  constructor(message: string, fields?: Record<string, string>) {
    super(400, message, 'VALIDATION_ERROR', fields)
  }
}
```

### Error Constants:
```typescript
// src/constants/errors.ts
export const ERROR_CODES = {
  // Authentication
  AUTH_INVALID_CREDENTIALS: 'AUTH_001',
  AUTH_TOKEN_EXPIRED: 'AUTH_002',
  AUTH_UNAUTHORIZED: 'AUTH_003',
  
  // Validation
  VALIDATION_INVALID_EMAIL: 'VAL_001',
  VALIDATION_REQUIRED_FIELD: 'VAL_002',
  
  // Database
  DB_CONNECTION_FAILED: 'DB_001',
  DB_QUERY_FAILED: 'DB_002',
} as const

export const ERROR_MESSAGES = {
  [ERROR_CODES.AUTH_INVALID_CREDENTIALS]: 'Invalid email or password',
  [ERROR_CODES.AUTH_TOKEN_EXPIRED]: 'Your session has expired',
  // ... rest
} as const
```

### Usage:
```typescript
// ✅ GOOD: Using error classes and constants
import { ApiError, ERROR_CODES, ERROR_MESSAGES } from '@/lib/errors'

if (!user) {
  throw new ApiError(
    401,
    ERROR_MESSAGES[ERROR_CODES.AUTH_INVALID_CREDENTIALS]
  )
}

// ✅ GOOD: Centralized error handler
export function handleApiError(error: unknown): NextResponse {
  if (error instanceof AppError) {
    return NextResponse.json(
      { success: false, error: error.message, code: error.code },
      { status: error.statusCode }
    )
  }
  
  // Log unexpected errors
  console.error('Unexpected error:', error)
  return NextResponse.json(
    { success: false, error: 'Internal server error' },
    { status: 500 }
  )
}
```

---

## 7. Styling Standards

**Principle:** Use theme context and extend existing components

### Rules:
- ✅ **Always** use existing components from `src/components/`
- ✅ **Always** work with `ThemeContext` for colors/spacing
- ✅ Use **Tailwind classes** for basic styling
- ✅ **Extend** component variants for complex styles
- ✅ **NO** inline styles (except dynamic values)
- ✅ **NO** CSS modules unless absolutely necessary

### Theme Usage:
```tsx
// ✅ GOOD: Using theme context for conditional styling
import { useTheme } from '@/contexts/ThemeContext'
import { THEME_CONSTANTS } from '@/constants/theme'

const MyComponent = () => {
  const { theme } = useTheme() // Returns 'light' | 'dark'
  
  return (
    <div className={THEME_CONSTANTS.themed.bgSecondary}>
      <Button variant={theme === 'dark' ? 'primary' : 'secondary'}>
        Click me
      </Button>
    </div>
  )
}

// ✅ GOOD: Using THEME_CONSTANTS for styling
import { THEME_CONSTANTS } from '@/constants/theme'

const MyComponent = () => {
  const { themed, colors } = THEME_CONSTANTS
  
  return (
    <div className={themed.bgPrimary}>
      <h1 className={themed.textPrimary}>Title</h1>
      <button className={colors.iconButton.onLight}>Click</button>
    </div>
  )
}
```

### Style Guide:
- **Use `themed.*`** for basic colors (backgrounds, text, borders) - auto dark mode
- **Use `colors.*`** for semantic component colors (badges, alerts, icons, buttons)
- **Use `useTheme()`** only for conditional logic based on theme mode
- **Always prefer Tailwind classes** from THEME_CONSTANTS over inline styles

### Extending Components:
```tsx
// ✅ GOOD: Extending existing component
// src/components/FormField.tsx (extend)
export interface FormFieldProps {
  // ... existing props
  customVariant?: 'inline' | 'stacked'  // NEW
}

export const FormField = ({ customVariant, ...props }: FormFieldProps) => {
  const variantClasses = {
    inline: 'flex flex-row items-center gap-4',
    stacked: 'flex flex-col gap-2'
  }
  
  return (
    <div className={variantClasses[customVariant ?? 'stacked']}>
      {/* ... existing logic */}
    </div>
  )
}
```

### Bad Practice:
```tsx
// ❌ BAD: Inline styles everywhere
<div style={{ backgroundColor: '#1a1a1a', padding: '16px' }}>
  <button style={{ color: 'white', fontSize: '14px' }}>Click</button>
</div>

// ❌ BAD: Not using existing components
<input type="text" style={{ ... }} />

// ✅ GOOD: Using existing component with theme
<FormField type="text" />
```

---

## 7.5. Constants Usage Standards

**Principle:** Always use constants - NEVER hardcode strings, labels, or styling values

### Rules:
- ✅ **ALWAYS** use constants from `@/constants` for ALL strings
- ✅ **NEVER** hardcode UI text, labels, placeholders, or messages
- ✅ **ALWAYS** use `THEME_CONSTANTS` for spacing, sizing, colors
- ✅ **NEVER** duplicate Tailwind classes - use theme constants
- ✅ Import constants at the top of every file that needs them

### Available Constants:

#### 1. **UI Labels** (`UI_LABELS`)
```tsx
import { UI_LABELS } from '@/constants';

// Loading states
<div>{UI_LABELS.LOADING.DEFAULT}</div>        // "Loading..."
<div>{UI_LABELS.LOADING.USERS}</div>          // "Loading users..."

// Actions
<Button>{UI_LABELS.ACTIONS.SAVE}</Button>     // "Save"
<Button>{UI_LABELS.ACTIONS.CANCEL}</Button>   // "Cancel"

// Empty states
<div>{UI_LABELS.EMPTY.NO_DATA}</div>          // "No data available"

// Status labels
<Badge>{UI_LABELS.STATUS.ACTIVE}</Badge>      // "Active"
```

#### 2. **UI Placeholders** (`UI_PLACEHOLDERS`)
```tsx
import { UI_PLACEHOLDERS } from '@/constants';

<Input placeholder={UI_PLACEHOLDERS.EMAIL} />     // "Enter your email address"
<Input placeholder={UI_PLACEHOLDERS.PASSWORD} />  // "Enter your password"
<Input placeholder={UI_PLACEHOLDERS.SEARCH} />    // "Search..."
```

#### 3. **UI Help Text** (`UI_HELP_TEXT`)
```tsx
import { UI_HELP_TEXT } from '@/constants';

<FormField 
  helpText={UI_HELP_TEXT.PASSWORD_REQUIREMENTS}  // Password requirements message
/>
```

#### 4. **Theme Constants** (`THEME_CONSTANTS`)
```tsx
import { THEME_CONSTANTS } from '@/constants';

// Spacing
<div className={THEME_CONSTANTS.spacing.stack}>        // "space-y-4"
<div className={THEME_CONSTANTS.spacing.padding.lg}>  // "p-6"

// Typography
<h1 className={THEME_CONSTANTS.typography.h1}>        // "text-4xl md:text-5xl font-bold"

// Container widths
<div className={THEME_CONSTANTS.container.xl}>        // "max-w-xl"

// Border radius
<div className={THEME_CONSTANTS.borderRadius.xl}>     // "rounded-xl"
```

#### 5. **Error Messages** (`ERROR_MESSAGES`)
```tsx
import { ERROR_MESSAGES } from '@/constants';

throw new Error(ERROR_MESSAGES.AUTH.UNAUTHORIZED);
showError(ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD);
```

#### 6. **Success Messages** (`SUCCESS_MESSAGES`)
```tsx
import { SUCCESS_MESSAGES } from '@/constants';

showSuccess(SUCCESS_MESSAGES.USER.PROFILE_UPDATED);
```

### Examples:

**❌ BAD - Hardcoded strings:**
```tsx
<button>Save</button>
<input placeholder="Enter your email" />
<div>Loading...</div>
<div className="space-y-4">
  <div className="p-6">
    <h1 className="text-4xl font-bold">Title</h1>
  </div>
</div>
```

**✅ GOOD - Using constants:**
```tsx
import { UI_LABELS, UI_PLACEHOLDERS, THEME_CONSTANTS } from '@/constants';

<button>{UI_LABELS.ACTIONS.SAVE}</button>
<input placeholder={UI_PLACEHOLDERS.EMAIL} />
<div>{UI_LABELS.LOADING.DEFAULT}</div>
<div className={THEME_CONSTANTS.spacing.stack}>
  <div className={THEME_CONSTANTS.spacing.padding.lg}>
    <h1 className={THEME_CONSTANTS.typography.h1}>Title</h1>
  </div>
</div>
```

### When Creating New Components:
1. ✅ Check if constant exists in `src/constants/ui.ts`
2. ✅ If not, ADD it there (don't hardcode)
3. ✅ Use `as const` for type safety
4. ✅ Export from `src/constants/index.ts`

### Benefits:
- 🌐 **i18n Ready** - Easy to add translations
- 🔄 **Consistency** - Same text everywhere
- 📝 **Maintainability** - Update once, apply everywhere
- ✅ **Type Safety** - TypeScript autocomplete
- 🎨 **DRY** - No duplicate styling

---

## 8. Proxy Over Middleware

**Principle:** Use Next.js rewrites/redirects (proxy) instead of middleware where possible

### When to Use Proxy:
- ✅ API route rewrites
- ✅ Static redirects
- ✅ External API proxying
- ✅ URL rewriting for SEO

### When to Use Middleware:
- ✅ Authentication checks (dynamic)
- ✅ Request/response modification
- ✅ Rate limiting
- ✅ A/B testing
- ✅ Geolocation-based routing

### Proxy Example (next.config.js):
```javascript
// ✅ GOOD: Proxy for API routes
module.exports = {
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: 'https://api.external.com/:path*',
      },
    ]
  },
  async redirects() {
    return [
      {
        source: '/old-profile',
        destination: '/profile',
        permanent: true,
      },
    ]
  },
}
```

### Middleware Example (middleware.ts):
```typescript
// ✅ GOOD: Middleware for auth
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const session = request.cookies.get('session')
  
  if (!session && request.nextUrl.pathname.startsWith('/profile')) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }
  
  return NextResponse.next()
}
```

### Benefits:
- 🚀 **Proxy**: Faster, cached, no runtime overhead
- 🔒 **Middleware**: Dynamic, secure, request-aware

---

## 9. Code Quality Principles

**Principle:** Write maintainable, loosely coupled, and testable code

### SOLID Principles:

#### S - Single Responsibility
```tsx
// ✅ GOOD: Each function has one job
const validateEmail = (email: string) => /^[^\s@]+@/.test(email)
const sendEmail = (to: string, subject: string) => { /* ... */ }

// ❌ BAD: Function does too much
const validateAndSendEmail = (email: string) => { /* validates AND sends */ }
```

#### O - Open/Closed
```tsx
// ✅ GOOD: Open for extension, closed for modification
interface Validator {
  validate(value: string): boolean
}

class EmailValidator implements Validator {
  validate(value: string) { return /^[^\s@]+@/.test(value) }
}

// Add new validators without modifying existing code
class PhoneValidator implements Validator {
  validate(value: string) { return /^\+?\d{10,}$/.test(value) }
}
```

#### L - Liskov Substitution
```tsx
// ✅ GOOD: Subtypes can replace base types
class ApiClient {
  async get(url: string) { /* ... */ }
}

class AuthenticatedApiClient extends ApiClient {
  async get(url: string) {
    // Adds auth, but still returns same type
    return super.get(url)
  }
}
```

#### I - Interface Segregation
```tsx
// ✅ GOOD: Small, focused interfaces
interface Readable {
  read(): string
}

interface Writable {
  write(data: string): void
}

// Classes implement only what they need
class FileReader implements Readable {
  read() { return 'data' }
}
```

#### D - Dependency Injection
```tsx
// ✅ GOOD: Dependencies injected
class UserService {
  constructor(private apiClient: ApiClient) {}
  
  async getUser(id: string) {
    return this.apiClient.get(`/users/${id}`)
  }
}

// Easy to test with mock
const mockApi = { get: vi.fn() }
const service = new UserService(mockApi)
```

### Testability Checklist:
- ✅ Pure functions (no side effects)
- ✅ Dependency injection
- ✅ Small, focused functions
- ✅ Avoid global state
- ✅ Mock-friendly interfaces
- ✅ Clear input/output contracts

### Example Testable Code:
```tsx
// ✅ GOOD: Easy to test
export const calculateTotal = (items: Item[]): number => {
  return items.reduce((sum, item) => sum + item.price, 0)
}

// Test
test('calculates total correctly', () => {
  const items = [{ price: 10 }, { price: 20 }]
  expect(calculateTotal(items)).toBe(30)
})
```

---

## 10. Documentation Updates

**Principle:** Maintain living documentation with changelog

### Update Process:

1. **Make Code Changes**
2. **Update Relevant Docs** in `docs/` folder
3. **Add Entry to CHANGELOG.md**
4. **Commit Together**

### Changelog Format:
```markdown
<!-- docs/CHANGELOG.md -->
# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- New FormField variant for inline forms
- useDebounce hook for search inputs

### Changed
- Updated API client to support AbortController
- Refactored error handling to use error classes

### Fixed
- Fixed password validation edge case
- Fixed theme switching in mobile view

### Deprecated
- useApiRequest hook (use useApiQuery/useApiMutation)

### Removed
- Removed unused Modal component variant

### Security
- Added rate limiting to auth endpoints
- Implemented CSRF protection

## [1.2.0] - 2026-02-05

### Added
- Centralized API client with hooks
- Profile management hooks
```

### Documentation Files to Update:

| File | When to Update |
|------|----------------|
| `CHANGELOG.md` | **Every change** |
| `API_CLIENT.md` | API client changes |
| `QUICK_REFERENCE.md` | New components/hooks/constants |
| `README.md` | Major features |
| Component docs | Component changes |

### NO Session Docs:
- ❌ `REFACTORING_2026-02-05.md`
- ❌ `SESSION_SUMMARY.md`
- ❌ `WORK_LOG.md`

### YES Living Docs:
- ✅ `CHANGELOG.md` (version history)
- ✅ `API_CLIENT.md` (API guide)
- ✅ `QUICK_REFERENCE.md` (quick lookups)

---

## 11. Pre-Commit Audit Checklist

**Before committing, audit ALL 11 points above:**

### Checklist:
```bash
# 1. Code Reusability
□ Checked for existing components/hooks/constants?
□ Reused existing code instead of duplicating?
□ Code is loosely coupled?
□ Each component has high cohesion?

# 2. Documentation
□ Updated docs/ folder?
□ Extended existing docs instead of creating new?
□ Updated CHANGELOG.md?
□ No session-specific documentation?

# 3. Design Patterns & Security
□ Used appropriate design patterns?
□ Followed security best practices?
□ Input validation implemented?
□ Environment variables secured?

# 4. TypeScript Validation
□ Ran tsc on changed files?
□ Fixed all type errors?
□ Ran full build?
□ All tests passing?

# 5. Database Schema
□ Schema includes table definition?
□ Indices defined and commented?
□ Relationships documented?
□ Types exported?

# 6. Error Handling
□ Using error classes?
□ Using error constants?
□ Centralized error handling?
□ Proper error codes?

# 7. Styling
□ Using existing components?
□ Working with ThemeContext?
□ Extended components properly?
□ No unnecessary inline styles?

# 7.5. Constants Usage
□ Using UI_LABELS for all text?
□ Using UI_PLACEHOLDERS for inputs?
□ Using THEME_CONSTANTS for styling?
□ No hardcoded strings or values?
□ Added new strings to constants if needed?

# 8. Proxy vs Middleware
□ Used proxy for static rewrites?
□ Used middleware only when needed?
□ Performance optimized?

# 9. Code Quality
□ Follows SOLID principles?
□ Loosely coupled?
□ Easily testable?
□ High maintainability?

# 10. Documentation Updates
□ Updated relevant docs?
□ Updated CHANGELOG.md?
□ No session docs created?

# 11. This Audit
□ Completed this checklist?
```

### Automated Check Script:
```bash
# Add to package.json
{
  "scripts": {
    "pre-commit": "npm run lint && npm run type-check && npm test"
  }
}

# Run before commit
npm run pre-commit
```

---

## Quick Reference Commands

```bash
# Check TypeScript on changed files only
npx tsc --noEmit src/app/profile/page.tsx src/hooks/useAuth.ts

# Run full build
npm run build

# Run tests
npm test

# Run tests for specific file
npm test -- useAuth.test.ts

# Lint check
npm run lint

# Lint fix
npm run lint:fix

# Pre-commit check
npm run pre-commit
```

---

## Summary

**Remember: Code quality > Speed**

1. ♻️ **Reuse** - Check existing code first
2. 📝 **Document** - Update docs/, use CHANGELOG
3. 🏗️ **Patterns** - Follow design patterns & security
4. ✅ **TypeScript** - Check types before build
5. 🗄️ **Database** - Co-locate schema, indices, relations
6. 🚨 **Errors** - Use error classes & constants
7. 🎨 **Styling** - Use components & theme
7.5. 📋 **Constants** - ALWAYS use constants, NEVER hardcode
8. 🔀 **Proxy** - Prefer proxy over middleware
9. 🧪 **Quality** - SOLID, loosely coupled, testable
10. 📚 **Docs** - Living docs, no session files
11. ✔️ **Audit** - Check all points before commit

**These guidelines ensure our codebase remains clean, maintainable, and scalable.**
