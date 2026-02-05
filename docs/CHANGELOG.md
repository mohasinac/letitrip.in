# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added
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
