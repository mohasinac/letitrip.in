# Auth Components

This folder contains authentication-related UI components for user authentication flows.

## Components

### GoogleSignInButton.tsx

**Export:** `GoogleSignInButton`, `GoogleSignInButtonInner`

**Purpose:** Provides Google OAuth sign-in functionality using Firebase Authentication.

**Features:**

- Google OAuth popup authentication
- Firebase client initialization
- Auto-redirect after successful authentication
- Loading and disabled states
- Success/error callbacks
- Supports full button and icon-only variants
- Integrates with AuthContext for session management

**Props:**

- `onSuccess?: () => void` - Callback on successful sign-in
- `onError?: (error: Error) => void` - Callback on error
- `className?: string` - Additional CSS classes
- `variant?: "full" | "icon"` - Button display variant
- `disabled?: boolean` - Disable button interaction
- `redirectPath?: string` - Custom redirect after sign-in

---

### AuthGuard.tsx

**Export:** `AuthGuard` (default)

**Purpose:** HOC/wrapper component for protecting routes that require authentication or specific permissions/roles. ✅

**Features:**

- Checks authentication status before rendering children
- ✅ **Permission-based access control** (granular permissions) - NEW
- ✅ **Role-based access control** (RBAC) - LEGACY (deprecated)
- Automatic redirects for unauthorized access
- Integration with error-redirect utility
- Loading state management during auth check
- ✅ **Custom loading/unauthorized components** - NEW
- ✅ **Multiple permission checks** (OR and AND logic) - NEW

**Props:**

- `children: React.ReactNode` - Protected content
- `requireAuth?: boolean` - Whether authentication is required (default: true)
- `redirectTo?: string` - Custom redirect path (default: '/login')
- `allowedRoles?: string[]` - ⚠️ **DEPRECATED** - Array of roles permitted to access (use `requiredPermissions` instead)
- ✅ `requiredPermissions?: Permission | Permission[]` - **NEW** - Required permissions (OR logic - user needs at least one)
- ✅ `requiredPermissionsAll?: Permission[]` - **NEW** - Required permissions (AND logic - user needs all)
- ✅ `loadingComponent?: React.ReactNode` - **NEW** - Custom loading component
- ✅ `unauthorizedComponent?: React.ReactNode` - **NEW** - Custom unauthorized component

**Usage:**

```tsx
// Legacy role-based (deprecated)
<AuthGuard allowedRoles={["admin", "seller"]}>
  <ProtectedContent />
</AuthGuard>

// NEW: Permission-based (recommended)
<AuthGuard requiredPermissions={PERMISSIONS.PRODUCTS_CREATE}>
  <CreateProduct />
</AuthGuard>

// NEW: Multiple permissions (OR logic)
<AuthGuard requiredPermissions={[PERMISSIONS.PRODUCTS_CREATE, PERMISSIONS.PRODUCTS_EDIT]}>
  <ProductEditor />
</AuthGuard>

// NEW: Multiple permissions (AND logic)
<AuthGuard requiredPermissionsAll={[PERMISSIONS.PRODUCTS_CREATE, PERMISSIONS.PRODUCTS_PUBLISH]}>
  <PublishProduct />
</AuthGuard>

// NEW: Custom loading component
<AuthGuard
  requiredPermissions={PERMISSIONS.ADMIN_DASHBOARD}
  loadingComponent={<CustomSpinner />}
>
  <AdminDashboard />
</AuthGuard>
```

---

### OTPInput.tsx

**Export:** `OTPInput`

**Purpose:** Specialized input component for One-Time Password (OTP) entry.

**Features:**

- 6-digit OTP input (configurable length)
- Auto-focus next input on digit entry
- Auto-focus previous input on backspace
- Paste support (handles full OTP paste)
- Keyboard navigation support
- Error state styling
- Dark mode support
- Mobile-friendly

**Props:**

- `length?: number` - Number of digits (default: 6)
- `value: string` - Current OTP value
- `onChange: (value: string) => void` - Value change handler
- `disabled?: boolean` - Disable input
- `error?: boolean` - Show error state
- `autoFocus?: boolean` - Auto-focus first input

---

### EmailVerificationModal.tsx

**Export:** `EmailVerificationModal`

**Purpose:** Modal dialog for email verification flow.

**Features:**

- Email verification UI
- Resend verification email functionality
- Success/error feedback
- Modal overlay and close handling

---

### PhoneVerificationModal.tsx

**Export:** `PhoneVerificationModal`

**Purpose:** Modal dialog for phone number verification with OTP.

**Features:**

- Phone number input
- OTP verification flow
- Integrates with OTPInput component
- SMS sending and verification
- Resend OTP functionality

---

### VerificationGate.tsx

**Export:** `VerificationGate`

**Purpose:** Component that enforces email/phone verification before allowing access.

**Features:**

- Checks user verification status
- Displays verification prompts
- Blocks unverified users from protected actions
- Modal-based verification flow

---

### MFAEnrollment.tsx

**Export:** `MFAEnrollment`

**Purpose:** UI component for enrolling in Multi-Factor Authentication (MFA). Allows users to add phone SMS or authenticator app as second factor.

**Features:**

- Method selection (Phone SMS or Authenticator App)
- Phone MFA enrollment flow with SMS verification
- TOTP MFA enrollment flow with QR code generation
- Display and manage enrolled factors
- Remove enrolled factors with confirmation
- QR code display for authenticator apps
- Manual secret key entry with copy button
- Display names for factors (optional)
- Step-based enrollment flow
- reCAPTCHA integration for phone MFA
- Full error handling and loading states
- Dark mode support
- Responsive design

**Props:**

- `onEnrollmentComplete?: () => void` - Callback on successful enrollment
- `onError?: (error: Error) => void` - Callback on error
- `className?: string` - Additional CSS classes

**Usage:**

```tsx
import { MFAEnrollment } from "@/components/auth/MFAEnrollment";

function AccountSecurity() {
  return (
    <MFAEnrollment
      onEnrollmentComplete={() => {
        toast.success("MFA enabled successfully");
      }}
      onError={(error) => {
        toast.error(error.message);
      }}
    />
  );
}
```

**Enrollment Flow:**

1. **Select Method**: User chooses Phone SMS or Authenticator App
2. **Phone SMS Flow**:
   - Enter phone number with country code
   - Enter optional display name
   - Receive SMS verification code
   - Enter 6-digit code to complete enrollment
3. **Authenticator App Flow**:
   - Generate QR code and secret key
   - Scan QR code with authenticator app (or enter key manually)
   - Enter optional display name
   - Enter 6-digit code from app to complete enrollment
4. **Factor Management**:
   - View all enrolled factors
   - Remove factors with confirmation

---

### MFAVerification.tsx

**Export:** `MFAVerification`

**Purpose:** UI component for verifying MFA during sign-in. Handles second-factor verification challenge.

**Features:**

- Display available MFA factors
- Factor selection (if multiple enrolled)
- 6-digit code input
- Support for phone SMS and TOTP factors
- reCAPTCHA integration for phone verification
- Integration with MultiFactorResolver
- Error handling and loading states
- Resend code option for SMS
- Help/support links
- Dark mode support
- Responsive design

**Props:**

- `resolver: MultiFactorResolver` - Firebase MFA resolver from auth error
- `onVerificationComplete?: () => void` - Callback on successful verification
- `onVerificationError?: (error: Error) => void` - Callback on error
- `onCancel?: () => void` - Callback when user cancels
- `className?: string` - Additional CSS classes

**Usage:**

```tsx
import { MFAVerification } from "@/components/auth/MFAVerification";
import { MultiFactorError } from "firebase/auth";

// In sign-in error handler
catch (error) {
  if (error.code === "auth/multi-factor-auth-required") {
    const mfaError = error as MultiFactorError;
    setMFAResolver(mfaError.resolver);
  }
}

// Render verification component
{mfaResolver && (
  <MFAVerification
    resolver={mfaResolver}
    onVerificationComplete={() => {
      toast.success("Signed in successfully");
      router.push("/dashboard");
    }}
    onVerificationError={(error) => {
      toast.error(error.message);
    }}
    onCancel={() => {
      setMFAResolver(null);
    }}
  />
)}
```

**Verification Flow:**

1. User attempts sign-in and triggers MFA challenge
2. Component displays available factors (phone or authenticator)
3. User selects factor (if multiple enrolled)
4. User enters 6-digit verification code
5. Component verifies code with Firebase
6. On success, sign-in completes and user is authenticated

---

## Common Patterns

### Authentication Flow

All auth components follow a consistent pattern:

1. Check authentication state via `useAuth()`
2. Show loading state during auth operations
3. Handle success/error states with toast notifications
4. Auto-redirect after successful authentication
5. Use Suspense boundaries for async operations

### Error Handling

- Uses `logError` from firebase-error-logger
- Toast notifications via `sonner`
- Custom error redirect utilities
- Graceful degradation on errors

### Styling

- Tailwind CSS utility classes
- Dark mode support via `dark:` variants
- Mobile-responsive design
- Consistent spacing and sizing (min-height 48px for mobile)
- Yellow accent color (`yellow-500/600`) for primary actions

### State Management

- Local component state for UI interactions
- Context API (`AuthContext`) for global auth state
- Loading states to prevent double submissions
- Form validation and error messages

### Accessibility

- Proper ARIA labels
- Keyboard navigation support
- Focus management
- Screen reader friendly
