# Auth Components - Future Refactoring Notes

## Completed Improvements ✅

### AuthGuard Component (AuthGuard.tsx)

- ✅ **Permission-Based Access Control**: Implemented granular permission checking (January 10, 2026)
- ✅ **New Props Added**:
  - `requiredPermissions` - Check single or multiple permissions (OR logic)
  - `requiredPermissionsAll` - Check all permissions required (AND logic)
  - `loadingComponent` - Custom loading component
  - `unauthorizedComponent` - Custom unauthorized component
- ✅ **Enhanced Loading State**: Better loading state management with `isCheckingPermissions`
- ✅ **Backwards Compatible**: Kept `allowedRoles` prop (deprecated) for backwards compatibility
- ✅ **Permission Integration**: Integrated with permission system using `hasPermission()` and `hasAllPermissions()`
- ✅ **Error Handling**: Uses `forbidden.insufficientPermissions()` for permission failures
- ✅ **TypeScript Support**: Full type safety with `Permission` type from permission system

## Potential Improvements

### 1. Google Sign-In Button

- **Consolidate Firebase Initialization**: Move Firebase client initialization to a centralized configuration file instead of initializing in the component
- **Environment Variable Validation**: Add runtime checks for required Firebase environment variables
- **Error Types**: Create typed error classes instead of generic Error objects
- **Loading State Unification**: Consider using a global loading state manager for consistent loading UX
- **Variant System**: Expand variant system to support more button styles (outlined, ghost, etc.)

### 2. AuthGuard

- ✅ **Permission Granularity**: ~~Move toward permission-based access control instead of role-based~~ (COMPLETED)
- ✅ **Loading UI**: ~~Add customizable loading component instead of rendering nothing~~ (COMPLETED)
- **Performance**: Consider memoizing authorization checks to prevent unnecessary re-renders
- **Multiple Role Support**: Enhance to support OR/AND logic for role combinations (e.g., admin OR seller)
- **TypeScript**: Create union types for role values instead of string arrays
- **Redirect State**: Preserve original URL in redirect for post-auth navigation

### 3. OTP Input

- **Auto-submit**: Add option to auto-submit when all digits are entered
- **Resend Timer**: Built-in countdown timer for resend button
- **Custom Validation**: Support custom validation rules beyond digit-only
- **Accessibility**: Add better ARIA labels for each input field
- **Animation**: Add subtle animations for error states and transitions

### 4. Verification Modals

- **Shared Logic**: Extract common verification logic into a custom hook (`useVerification`)
- **Rate Limiting UI**: Show visual feedback when rate limits are hit
- **Success Animations**: Add success animations for better UX
- **Modal Management**: Consider using a modal state manager for better control
- **Cooldown State**: Persist cooldown timers in localStorage to prevent abuse

### 5. VerificationGate

- **Selective Verification**: Allow specifying which verification is required (email, phone, both)
- **Bypass for Development**: Add development mode bypass for easier testing
- **Custom Messages**: Make verification messages customizable
- **Progressive Verification**: Support optional verification with escalating permissions

## Code Organization

### Extract to Separate Files

- Firebase configuration should be in `/src/config/firebase.client.ts`
- Auth types and interfaces should be in `/src/types/auth.types.ts`
- Verification utilities should be in `/src/lib/auth/verification.utils.ts`

### Create Shared Utilities

- `useAuthRedirect` - Custom hook for handling post-auth redirects
- `useVerificationFlow` - Shared hook for email/phone verification
- `authValidators` - Centralized validation functions for auth forms

### Testing Improvements

- Add comprehensive unit tests for each component
- Create mock AuthProvider for testing
- Add E2E tests for complete auth flows
- Add visual regression tests for UI states

## Performance Optimizations

### Code Splitting

- Lazy load verification modals (only load when needed)
- Split Firebase Auth code from main bundle
- Defer non-critical auth analytics

### Caching

- Cache Firebase auth state checks
- Implement request deduplication for verification API calls

## Security Enhancements

### Token Management

- Implement token refresh logic with retry
- Add token expiry warnings
- Secure token storage with encryption

### Rate Limiting

- Add client-side rate limiting for verification requests
- Implement exponential backoff for failed attempts
- Add CAPTCHA integration for excessive attempts

### Audit Logging

- Log all auth events for security monitoring
- Track failed login attempts
- Monitor suspicious patterns

## UI/UX Improvements

### Loading States

- Skeleton loaders instead of blank screens
- Progress indicators for multi-step flows
- Optimistic UI updates

### Error Messages

- More specific error messages based on error codes
- Helpful suggestions for common issues
- Support for multiple languages (i18n)

### Mobile Experience

- Add biometric authentication support (fingerprint, Face ID)
- Improve touch targets (already using min-height 48px, good!)
- Add haptic feedback on mobile devices

## Documentation Needs

- Add JSDoc comments to all exported functions
- Create authentication flow diagrams
- Document error codes and handling
- Add usage examples for each component
- Create migration guide for role-based to permission-based access
