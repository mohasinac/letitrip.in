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

**Purpose:** HOC/wrapper component for protecting routes that require authentication or specific roles.

**Features:**

- Checks authentication status before rendering children
- Role-based access control (RBAC)
- Automatic redirects for unauthorized access
- Integration with error-redirect utility
- Loading state management during auth check

**Props:**

- `children: React.ReactNode` - Protected content
- `requireAuth?: boolean` - Whether authentication is required (default: true)
- `redirectTo?: string` - Custom redirect path (default: '/login')
- `allowedRoles?: string[]` - Array of roles permitted to access

**Usage:**

```tsx
<AuthGuard allowedRoles={["admin", "seller"]}>
  <ProtectedContent />
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
