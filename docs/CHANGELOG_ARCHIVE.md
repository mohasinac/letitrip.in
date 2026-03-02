# Changelog Archive

> **Archived entries** — version history predating February 2026.  
> Current entries are maintained in [CHANGELOG.md](./CHANGELOG.md).

---

## [1.2.0] - 2026-02-05

### Added

- Centralized API client system (`src/lib/api-client.ts`)
- API endpoint constants (`src/constants/api-endpoints.ts`)
- React hooks for data fetching (`useApiQuery`) and mutations (`useApiMutation`)
- Authentication hooks (`useAuth.ts`) with 7 specialized hooks
- Profile management hooks (`useProfile.ts`)
- Error handling with `ApiClientError` class
- Automatic authentication via session cookies
- Request timeout handling (30s default)

### Changed

- Refactored profile page to use new hooks and components
- Refactored auth pages (forgot-password, reset-password, register, verify-email)
- Updated all pages to use `FormField` component
- Updated all pages to use `PasswordStrengthIndicator` component
- Replaced all direct `fetch()` calls with `apiClient`
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
