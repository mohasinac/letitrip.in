# Auth Feature

**Feature path:** `src/features/auth/`  
**Repository:** `userRepository`, `sessionRepository`, `tokenRepository`  
**Service:** `authService`  
**Actions:** None (auth mutations are API routes, not Server Actions, because they set cookies)

---

## Overview

Authentication uses Firebase Auth for identity verification but manages sessions server-side via an HTTP-only `__session` cookie. The Firebase client SDK is never used in UI components — all Firebase Auth calls are server-only.

---

## Auth Flow

### Email/Password Login (`/auth/login`)

```
LoginForm.submit
  → POST /api/auth/login { idToken }
      → Firebase Admin verifyIdToken(idToken)
      → sessionRepository.create(sessionData)
      → Set-Cookie: __session (httpOnly, secure, SameSite=Lax)
      → 200 { user }
          → AuthContext.refresh()
```

### Google OAuth (`/auth/google/...`)

```
Click "Continue with Google"
  → GET /api/auth/google/start
      → Build Google OAuth URL
      → Redirect to Google
          → Google redirects → /api/auth/google/callback?code=...
              → Exchange code for tokens
              → verifyIdToken
              → sessionRepository.create
              → Set-Cookie: __session
              → Redirect to dashboard
```

### Registration (`/auth/register`)

```
RegisterForm.submit
  → POST /api/auth/register { email, password, name }
      → Firebase Admin createUser
      → userRepository.create(profile)
      → Send verification email (Resend)
      → Set-Cookie: __session
      → 201 { user }
```

### Logout

```
useLogout.mutate()
  → POST /api/auth/logout
      → sessionRepository.delete(sessionId)
      → Clear-Cookie: __session
      → AuthContext.clear()
```

---

## Auth Pages

### `LoginForm` (`/auth/login`)

- Email input + password input with show/hide toggle
- Validation via Zod schema
- `AuthSocialButtons` — Google sign-in button
- Link to register and forgot-password pages

### `RegisterForm` (`/auth/register`)

- Name, email, password, confirm-password
- `PasswordStrengthIndicator` — real-time strength bar
- Terms checkbox
- Posts to `POST /api/auth/register`

### `ForgotPasswordView` (`/auth/forgot-password`)

- Email input
- Sends reset link via `POST /api/auth/forgot-password`
- Email sent via Resend, contains token link

### `ResetPasswordView` (`/auth/reset-password?token=...`)

- New password + confirm
- Token validated via `passwordResetTokenRepository.findValid(token)`
- Action: `POST /api/auth/reset-password { token, password }`

### `VerifyEmailView` (`/auth/verify-email`)

- 6-digit OTP input
- Verify via `POST /api/auth/verify-email { code }`
- Resend code via `POST /api/auth/send-verification`

### `AuthSocialButtons`

Google sign-in button. Navigates to `/api/auth/google/start` which initiates the OAuth flow.

---

## Middleware Auth Guard

`middleware.ts` runs on every request:

1. Reads `__session` cookie
2. Calls `authVerifier.verifySessionCookie(token)`
3. Checks `RBAC_CONFIG` for minimum role requirement of the route
4. Redirects to `/auth/login` if unauthenticated
5. Redirects to `/unauthorized` if insufficient role

---

## Role Gate Components — `src/components/auth/`

### `ProtectedRoute` / `withProtectedRoute`

HOC wrapping a component — redirects if the user doesn't meet role requirements.

### `RoleGate`

Conditionally renders children based on user role:

```tsx
<RoleGate role="admin">
  <AdminOnlyButton />
</RoleGate>
```

### `AdminOnly`

Shorthand `<RoleGate role="admin">` wrapper.

---

## Session Management

Sessions are stored in Firestore via `sessionRepository`. Each session has:

- `sessionId` (UUID)
- `userId`
- `device` (user agent)
- `ip`
- `createdAt`, `lastActivityAt`
- `expiresAt`

Users can view and revoke their own sessions on the settings page.  
Admins can revoke any session via `revokeSessionAction`.

Session activity is updated via `POST /api/auth/session/activity` — called periodically from the client to bump `lastActivityAt`.

---

## Phone Verification

`/api/profile/add-phone` — adds phone number  
`/api/profile/verify-phone` — verifies via OTP (SMS via provider)  
`smsCounterRepository` rate-limits OTP requests per phone number.

---

## Hooks

| Hook                | Description                    |
| ------------------- | ------------------------------ |
| `useLogin`          | Email/password login mutation  |
| `useGoogleLogin`    | Google OAuth login initiation  |
| `useRegister`       | Registration mutation          |
| `useLogout`         | Logout + cookie clear          |
| `useHasRole(role)`  | Check if current user has role |
| `useIsAdmin`        | Shorthand admin check          |
| `useIsModerator`    | Shorthand moderator check      |
| `useAuth` (context) | Current user, loading state    |

---

## API Routes

| Method | Route                         | Description                  |
| ------ | ----------------------------- | ---------------------------- |
| `POST` | `/api/auth/login`             | Sign in, set session cookie  |
| `POST` | `/api/auth/register`          | Create account               |
| `POST` | `/api/auth/logout`            | Destroy session              |
| `GET`  | `/api/auth/session`           | Get current session user     |
| `POST` | `/api/auth/session/validate`  | Validate session token       |
| `POST` | `/api/auth/session/activity`  | Bump session last-activity   |
| `POST` | `/api/auth/forgot-password`   | Send reset email             |
| `POST` | `/api/auth/reset-password`    | Apply new password           |
| `POST` | `/api/auth/send-verification` | Resend email verification    |
| `POST` | `/api/auth/verify-email`      | Verify OTP code              |
| `GET`  | `/api/auth/google/start`      | Start Google OAuth           |
| `GET`  | `/api/auth/google/callback`   | Handle Google callback       |
| `POST` | `/api/auth/event/init`        | Initialise auth event (RTDB) |
