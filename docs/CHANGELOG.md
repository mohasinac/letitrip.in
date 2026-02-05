# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added

#### 📋 Firebase Schema & Index Organization Standard

- **Complete Guidelines** for organizing Firebase schemas and indices:
  - Schema file template with 6 required sections
  - Index synchronization workflow (schema → firestore.indexes.json → deploy)
  - Clear DO/DON'T rules for file organization
  - Collection naming conventions (camelCase, plural form)
- **Organization Rules**:
  - One schema file per collection in `src/db/schema/`
  - Document `INDEXED_FIELDS` in each schema file with purposes
  - Keep `firestore.indexes.json` in sync with schema `INDEXED_FIELDS`
  - Update both files together when queries change
  - Export all constants from schema files (no hardcoding)
- **Documentation Standards**:
  - In schema files: Document WHAT fields are indexed and WHY
  - In firestore.indexes.json: Define HOW fields are indexed (composite patterns)
  - Pre-commit checklist includes schema/index sync verification
  - Common sync issues documented with solutions
- **Schema File Structure** (6 sections):
  1. Collection interface & name constant
  2. Indexed fields with purposes
  3. Relationships with diagram & foreign keys
  4. Helper constants (defaults, public fields, updatable)
  5. Type utilities (CreateInput, UpdateInput)
  6. Query helpers for common queries
- **Sync Workflow**:
  1. Update `INDEXED_FIELDS` in schema file
  2. Update `firestore.indexes.json` with composite indices
  3. Deploy: `firebase deploy --only firestore:indexes`
  4. Verify in Firebase Console
- **Benefits**:
  - Prevents schema/index drift
  - Documents all indexed fields with purposes
  - Easy to see which queries need indices
  - Type-safe query building
  - Single source of truth for collections

- **Files Updated**:
  - `.github/copilot-instructions.md` - New section "Firebase Schema & Index Organization"
  - Pre-commit checklist enhanced with Firebase sync checks

### Fixed

#### 🐛 Fixed Build Errors - Firebase Admin Initialization

- **Issue**: Build failing with "The default Firebase app does not exist" error
- **Root Cause**: `BaseRepository` was initializing `getFirestore()` at class definition time, causing Firebase Admin to initialize during build process
- **Fix**:
  - Changed `protected db = getFirestore()` to lazy initialization via getter
  - Firebase Admin now only initializes when repository methods are actually called (runtime, not build time)
- **Files Modified**:
  - `src/repositories/base.repository.ts` - Lazy initialization of Firestore instance
- **Impact**: Build now succeeds, Firebase Admin only initializes on server-side API calls

#### 🐛 Fixed Admin Users Page - Suspense Boundary

- **Issue**: Build failing with "useSearchParams() should be wrapped in a suspense boundary"
- **Fix**:
  - Wrapped admin users page with Suspense boundary
  - Separated content into `AdminUsersContent` component
  - Added loading fallback for better UX
- **Files Modified**:
  - `src/app/admin/users/page.tsx` - Added Suspense wrapper
- **Impact**: Admin users page now renders correctly during build

#### ✅ User Role Confirmed Admin in Firestore

- User successfully updated role from "user" to "admin" in Firebase Console
- Manual fix completed as documented in [docs/FIX_ADMIN_ROLE.md](docs/FIX_ADMIN_ROLE.md)
- Future registrations with admin@letitrip.in will automatically get admin role via `getDefaultRole()`

#### 🐛 Fixed Session Cookie Creation Error

- **Issue**: `createSessionCookie is not defined` error on registration/login
- **Root Cause**: Client-side code trying to call server-side function directly
- **Fix**:
  - Created `/api/auth/session` API route for session management
  - Added `createSession()` helper function in auth-helpers.ts
  - All auth methods now create session cookies via API call
- **Files Created**:
  - `src/app/api/auth/session/route.ts` - Session API endpoint (POST/DELETE)
- **Files Modified**:
  - `src/lib/firebase/auth-helpers.ts` - Added createSession() helper, replaced all createSessionCookie() calls
- **Impact**: Email, Google, and Apple authentication now work correctly with proper session management

#### 🐛 Fixed Build Errors and Syntax Issues

- **Issues**: Multiple syntax errors, duplicate functions, missing imports
- **Fixes**:
  - Fixed corrupted `getDefaultRole()` function after merge
  - Removed duplicate function declarations
  - Fixed session API cookie handling
  - Removed broken phone verification API routes (add-phone, verify-phone)
  - Removed `updateSession()` leftover from NextAuth
  - Fixed `useCurrentUser` hook to use `user` instead of `session`
  - Fixed ProfilePhoneSection unsupported props
  - Added missing `signInWithPhoneNumber` import
- **Result**: Build now compiles successfully with 0 TypeScript errors

#### 📝 Existing Users with admin@letitrip.in Need Manual Role Update

- **Issue**: Users who registered with `admin@letitrip.in` BEFORE the role system was implemented have role="user" in database
- **Solution**: Manual update required in Firebase Console
- **Documentation**: Created [docs/FIX_ADMIN_ROLE.md](docs/FIX_ADMIN_ROLE.md) with step-by-step instructions
- **Note**: Future registrations with admin@letitrip.in will automatically get admin role

#### 🐛 Removed Phone UI from Login/Registration Pages

- **Issue**: Phone fields were still visible on login and registration pages
- **Fix**: Removed all phone-related UI elements from auth pages
- **Changes**:
  - Login: Changed "Email or Phone" field to "Email Address" only
  - Register: Removed "Email/Phone" toggle, now only email registration
  - Phone verification is now ONLY available in user profile settings
- **Files Modified**:
  - `src/app/auth/login/page.tsx` - Email-only login
  - `src/app/auth/register/page.tsx` - Email-only registration
- **Note**: Users can add/verify phone numbers after registration in Profile → Security tab

### Added

#### 🎉 4-Role System with Permission Hierarchy

- **Complete Role-Based Access Control (RBAC)**:
  - 4 roles: `user`, `seller`, `moderator`, `admin`
  - Admin: Full permissions (can change any role including making other admins)
  - Moderator: Limited permissions (can only promote users to sellers)
  - Seller: New role for users who want to sell services/products
  - User: Default role for all new registrations

- **Special Admin Email Logic**:
  - `admin@letitrip.in` automatically gets `admin` role on registration
  - Applies to all auth methods: Email/Password, Google OAuth, Apple OAuth
  - Implemented via `getDefaultRole()` helper function

- **Role Permission System**:
  - `canChangeRole()` function for permission checking
  - Role hierarchy: user (0) < seller (1) < moderator (2) < admin (3)
  - Moderators cannot promote users to moderator or admin
  - Users cannot modify their own role (prevents privilege escalation)

- **Admin API Updates**:
  - `PATCH /api/admin/users/[uid]` now supports moderator access
  - Permission checks before role changes
  - Returns 403 if moderator tries to assign unauthorized role

- **Admin UI Updates**:
  - Added "Seller" role to filter dropdown
  - Added "Seller" role to user management table
  - Role dropdown now shows all 4 roles: User, Seller, Moderator, Admin

- **Files Created/Modified**:
  - `src/types/auth.ts` - Added "seller" to UserRole type
  - `src/lib/security/authorization.ts` - Added canChangeRole() and role hierarchy
  - `src/lib/firebase/auth-helpers.ts` - Added getDefaultRole() for admin email check
  - `src/app/api/admin/users/[uid]/route.ts` - Added moderator access + permission checks
  - `src/app/admin/users/page.tsx` - Added seller role to UI

#### 🎉 Complete Firebase Backend Integration

- **Firebase Services Fully Configured**:
  - ✅ Firebase Authentication (Google, Apple, Email/Password)
  - ✅ Cloud Firestore (primary database with optimized indices)
  - ✅ Cloud Storage (images, documents with security rules)
  - ✅ Realtime Database (presence, chat, notifications)
- **Security Rules & Configuration**:
  - `firestore.rules` - Comprehensive Firestore security rules with helper functions
  - `firestore.indexes.json` - 11 optimized composite indices for all collections
  - `storage.rules` - Cloud Storage security rules (5MB images, 10MB docs)
  - `database.rules.json` - Realtime Database security rules for presence/chat
- **Firebase Documentation**:
  - `docs/guides/FIREBASE_SETUP.md` - Complete 10-minute setup guide (500+ lines)
  - `docs/guides/FIREBASE_SERVICES.md` - Comprehensive services reference
  - Updated all project documentation to reflect complete Firebase stack
  - Environment variable configuration guide (.env.example)
- **Firebase Client SDK Updates**:
  - `src/lib/firebase/config.ts` - Added Storage and Realtime DB exports
  - All Firebase services initialized and ready to use
  - Single configuration file for all services

#### 🎉 Firebase Auth Migration Complete

- **Complete Firebase Authentication System**
  - Replaced NextAuth with native Firebase Auth
  - Email/password authentication
  - Google OAuth (no credentials needed!)
  - Apple OAuth (no credentials needed!)
  - Automatic session management with secure cookies
  - Server-side token verification
  - Protected route middleware
- **New Files Created**:
  - `src/lib/firebase/auth-helpers.ts` - Client-side auth functions (256 lines)
  - `src/lib/firebase/auth-server.ts` - Server-side auth utilities
  - `src/middleware.ts` - Protected routes middleware
  - `src/app/api/auth/session/route.ts` - Session management API
  - `docs/guides/firebase-auth-migration.md` - Comprehensive migration guide
  - `docs/guides/firebase-auth-setup-quick.md` - 5-minute setup guide

- **Updated Files**:
  - `src/app/auth/login/page.tsx` - Now uses Firebase Auth
  - `src/app/auth/register/page.tsx` - Now uses Firebase Auth
  - `src/app/auth/forgot-password/page.tsx` - Now uses Firebase Auth
  - `src/app/auth/verify-email/page.tsx` - Now uses Firebase Auth pattern
  - `src/hooks/useAuth.ts` - Integrated Firebase Auth helpers

- **Key Benefits**:
  - ✅ Zero OAuth credentials needed (Firebase manages internally)
  - ✅ Single authentication system (removed NextAuth duplicate)
  - ✅ 2-minute setup (just enable in Firebase Console)
  - ✅ $99/year saved (no Apple Developer account needed)
  - ✅ Better Firebase integration
  - ✅ Automatic Firestore profile sync
  - ✅ Secure server-side token verification

#### 🎉 Perfect Compliance (110/110 - 100%)

- **Type Utilities** for all Firestore schemas
  - `UserCreateInput`, `UserUpdateInput`, `UserAdminUpdateInput` types
  - `EmailVerificationTokenCreateInput`, `PasswordResetTokenCreateInput` types
  - `UserQueryFilter` type for filtering queries
  - Complete type safety for all database operations

- **Query Helpers** for Firestore collections
  - `userQueryHelpers`: byEmail, byPhone, byRole, verified, active, disabled
  - `tokenQueryHelpers`: byUserId, byEmail, byToken, unused, expired
  - Type-safe query building with Firestore where() clauses
  - Reusable query patterns for common operations

- **Cascade Delete Documentation**
  - Complete relationship documentation in users schema
  - Step-by-step cascade delete behavior for user deletion
  - Ensures data integrity when deleting related documents
  - Batch write patterns for atomic operations

- **Comprehensive Style Guide**
  - Added to copilot instructions
  - Clear rules for `themed.*` vs `colors.*` usage
  - Fixed incorrect `useTheme()` example (returns mode, not colors)
  - Complete examples for all styling patterns
  - Documentation for when to use each theme constant

- GitHub Copilot instructions file (`.github/copilot-instructions.md`)
- Development instructions document (`docs/INSTRUCTIONS.md`)
- This changelog file
- 11-point coding standards and best practices
- Pre-commit audit checklist
- `serverExternalPackages` configuration for Turbopack compatibility
- Profile link in BottomNavbar for mobile access
- Login/Logout functionality in Sidebar with NextAuth integration
- User authentication state display in navigation components
- **Centralized error handling system** (`src/lib/errors/`):
  - AppError base class with status codes and error codes
  - Specialized error classes (ApiError, ValidationError, AuthenticationError, AuthorizationError, NotFoundError, DatabaseError)
  - ERROR_CODES constants with structured error codes (AUTH_XXX, VAL_XXX, etc.)
  - ERROR_MESSAGES for consistent error messaging
  - handleApiError() for API route error handling
  - Error logging utilities
- **Comprehensive codebase audit** (`docs/AUDIT_REPORT.md`):
  - 11-point standards compliance review
  - Compliance matrix with scores
  - Critical action items identified
  - Next session priorities documented
- **Repository pattern implementation** (`src/repositories/`):
  - BaseRepository with generic CRUD operations
  - UserRepository for user-specific operations
  - TokenRepository for email verification and password reset tokens
  - Singleton instances exported for convenience
  - Type-safe Firestore operations with error handling
- **Security utilities** (`src/lib/security/`):
  - Rate limiting with in-memory store and configurable presets
  - Authorization utilities (requireAuth, requireRole, requireOwnership, etc.)
  - Permission checking with role hierarchy
  - Active account and email verification checks
- **Pre-commit automation**:
  - Husky configured for Git hooks
  - lint-staged for automatic code quality checks
  - TypeScript validation before commits
  - Linting and formatting enforcement
- **Example API route** (`src/app/api/user/profile-new/route.ts`):
  - Demonstrates Repository pattern usage
  - Shows new error handling approach
  - Includes rate limiting and authorization
  - Comprehensive migration guide in comments

### Changed

- Renamed `src/middleware.ts` to `src/proxy.ts` (Next.js 16+ convention)
- Configured Next.js to properly handle Node.js core modules with Turbopack
- Removed webpack configuration in favor of native Turbopack support
- Updated SITE_CONFIG account routes to match actual application paths (`/profile` instead of `/account/profile`)
- Sidebar now shows authenticated user info and implements real logout with NextAuth
- BottomNavbar restored search button, kept 5-item layout (Home, Destinations, Services, Profile, Search)
- **Updated copilot instructions** to reflect Firebase Firestore as database choice (not PostgreSQL/Drizzle)
- **Updated database schema files** (users.ts, tokens.ts) with proper relationship documentation
- **Audit report updated** with Firebase compliance - score improved from 69/110 to 85/110

### Fixed

- Fixed "Cannot find module 'node:process'" Turbopack error by configuring serverExternalPackages
- Resolved Next.js 16 Turbopack compatibility with Node.js modules (crypto, bcryptjs, firebase-admin)
- Fixed navigation routes consistency across all components
- **Fixed TypeScript errors**:
  - BottomNavbar: Changed `colors.textSecondary` to `themed.textSecondary`
  - BottomNavbar: Changed `layout.bottomNavTextSize` to `typography.xs`
  - Typography tests: Fixed invalid variant prop `body1` to `primary`
- **Build status**: 0 TypeScript errors ✅

---

## [1.2.0] - 2026-02-05

### Added

- Centralized API client system (`src/lib/api-client.ts`)
- API endpoint constants (`src/constants/api-endpoints.ts`)
- React hooks for data fetching (`useApiQuery`) and mutations (`useApiMutation`)
- Authentication hooks (`useAuth.ts`) with 7 specialized hooks
- Profile management hooks (`useProfile.ts`)
- Comprehensive API client documentation (`docs/API_CLIENT.md`)
- Error handling with `ApiClientError` class
- Automatic authentication via session cookies
- Request timeout handling (30s default)

### Changed

- Refactored profile page to use new hooks and components
- Refactored auth pages (forgot-password, reset-password, register, verify-email)
- Updated all pages to use `FormField` component
- Updated all pages to use `PasswordStrengthIndicator` component
- Replaced all direct `fetch()` calls with `apiClient`
- Updated `auth-utils.ts` to use new API client
- Reorganized hook exports in `src/hooks/index.ts`

### Fixed

- TypeScript errors in FormField component usage
- Error message constant references
- Password validation edge cases
- Form field type validation

### Deprecated

- `useApiRequest` hook (use `useApiQuery` or `useApiMutation`)
- Direct usage of `auth-utils` functions (use `useAuth` hooks)

### Removed

- Direct fetch calls from all pages
- Duplicate form validation logic
- Manual password strength calculations

### Security

- Added centralized error handling with status codes
- Implemented proper input validation on all forms
- Added timeout protection for API calls

---

## [1.1.0] - 2026-01-15

### Added

- Profile page with avatar upload
- Email verification functionality
- Password change feature
- Display name and phone number updates

### Changed

- Updated user profile schema
- Enhanced authentication flow

### Fixed

- Session persistence issues
- Profile image upload errors

---

## [1.0.0] - 2026-01-01

### Added

- Initial project setup with Next.js 16.1.1
- Authentication system with NextAuth v5
- User registration and login
- Mobile-first component library (40+ components)
- Dark mode support with theme context
- TypeScript configuration
- Tailwind CSS styling
- Testing setup with Jest
- Documentation structure

### Security

- CSRF protection
- Secure password hashing
- Environment variable management

---

## How to Use This Changelog

### When Making Changes:

1. **Add your changes to the `[Unreleased]` section** at the top
2. **Use the appropriate category**:
   - `Added` - New features
   - `Changed` - Changes to existing functionality
   - `Deprecated` - Soon-to-be removed features
   - `Removed` - Removed features
   - `Fixed` - Bug fixes
   - `Security` - Security improvements

3. **Example Entry**:

```markdown
## [Unreleased]

### Added

- New useDebounce hook for search optimization

### Fixed

- Fixed theme switching bug in mobile view
```

### Before Release:

1. Move unreleased changes to a new version section
2. Add release date
3. Follow semantic versioning (MAJOR.MINOR.PATCH)

---

## Version Guidelines

- **MAJOR** (1.0.0) - Breaking changes
- **MINOR** (1.1.0) - New features (backward compatible)
- **PATCH** (1.1.1) - Bug fixes (backward compatible)

---

**Note**: All changes should be documented in this file. Do NOT create separate session-specific documentation files.
