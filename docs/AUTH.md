# Authentication Architecture

> Complete reference for how LetItRip users are authenticated, how sessions are managed, and how the OAuth popup bridge works.

---

## Table of Contents

1. [Core Principle — Backend-Only Firebase Auth](#1-core-principle--backend-only-firebase-auth)
2. [Session Cookie](#2-session-cookie)
3. [Email / Password Login](#3-email--password-login)
4. [Registration](#4-registration)
5. [OAuth Popup Bridge — Google & Apple](#5-oauth-popup-bridge--google--apple)
6. [Session Management](#6-session-management)
7. [Password Reset & Email Verification](#7-password-reset--email-verification)
8. [RBAC — Route & Component Protection](#8-rbac--route--component-protection)
9. [Security Measures](#9-security-measures)
10. [Environment Variables](#10-environment-variables)
11. [File Map](#11-file-map)

---

## 1. Core Principle — Backend-Only Firebase Auth

**The Firebase client SDK is never used for Auth, Firestore, or Storage.** Every auth operation goes through a Next.js API route that uses the Firebase Admin SDK.

```
Browser                 Next.js API Route                  Firebase
  │                           │                               │
  │── POST /api/auth/login ──>│                               │
  │                           │── Admin SDK verifyPassword ──>│
  │                           │<── idToken ───────────────────│
  │                           │── createSessionCookie(idToken)│
  │<── Set-Cookie __session ──│                               │
```

**Why?**

- Session cookies are `HttpOnly` — JavaScript can never read them (XSS-safe).
- All token verification happens server-side with the Admin SDK.
- The client never holds a Firebase ID token or user credential object.

The only exception is the Realtime Database, which the client may **subscribe to (read-only)** via a server-issued custom token scoped to specific paths. See [Section 5](#5-oauth-popup-bridge--google--apple) and [Section 6](#6-session-management).

---

## 2. Session Cookie

### Cookie attributes

| Cookie         | Value                         | Attributes                                          |
| -------------- | ----------------------------- | --------------------------------------------------- |
| `__session`    | Firebase session cookie (JWT) | `HttpOnly`, `Secure`, `SameSite=Strict`, 5-day TTL  |
| `__session_id` | Firestore session document ID | `Secure`, `SameSite=Strict`, 5-day TTL, JS-readable |

`__session_id` is readable by JavaScript so the client can reference the session record (e.g. for the "My Sessions" UI). The actual auth token is always `HttpOnly`.

### Session lifetime

- **Max age**: 5 days (`maxAge: 60 * 60 * 24 * 5`)
- **Activity refresh**: `PATCH /api/auth/session/activity` extends the cookie on each navigation (handled by proxy)
- **Revocation**: stored in Firestore `sessions` collection; `POST /api/auth/logout` marks it inactive and clears the cookies

### Session validation

Every protected API route calls `verifySessionCookie(cookie)` from `@/lib/firebase/auth-server`. This wraps `adminAuth.verifySessionCookie(cookie, true)` — the `true` flag also checks Firebase token revocation status.

---

## 3. Email / Password Login

```
Browser                           API Route                    Firebase Admin
  │                                   │                              │
  │─── POST /api/auth/login ─────────>│                              │
  │    { email, password }            │                              │
  │                                   │── signInWithEmailAndPassword─>│
  │                                   │   (REST Identity Toolkit)    │
  │                                   │<── idToken ──────────────────│
  │                                   │── createSessionCookie ───────>│
  │                                   │<── sessionCookie ────────────│
  │                                   │── sessionRepository.create() │
  │<── Set-Cookie __session ──────────│                              │
  │    Set-Cookie __session_id        │                              │
```

**Client hook**: `useLogin()` from `@/hooks`  
**Service**: `authService.login()` from `@/services`  
**API route**: `POST /api/auth/login`

After the server returns, `useLogin` also calls `signInWithEmail()` (the thin client-SDK wrapper in `@/lib/firebase/auth-helpers`) so that `onAuthStateChanged` fires and any client-only Firebase listener picks up the user. This client-side step is purely cosmetic — the session cookie is authoritative.

---

## 4. Registration

```
POST /api/auth/register
  1. Validate input (zod schema)
  2. adminAuth.createUser({ email, password, displayName })
  3. userRepository.createWithId(uid, { ...DEFAULT_USER_DATA })
  4. Issue session cookie (same as login)
  5. Send verification email via Resend
  6. Return user profile
```

**Client hook**: `useRegister()` from `@/hooks`

Registration is always server-side. The client never receives a Firebase credential; it only receives the session cookie via `Set-Cookie`.

---

## 5. OAuth Popup Bridge — Google & Apple

### Why a bridge pattern?

Google and Apple OAuth require the browser to navigate to a consent screen. To avoid redirecting the main page (losing state) and to stay compatible with the backend-only Firebase Auth rule, the consent screen opens in a **popup window**. The popup handles the full OAuth flow server-side, sets the session cookie (shared cookie jar), then signals the main window via Firebase Realtime Database.

### Architecture overview

```
Main window                   Popup window                      Server
     │                              │                               │
     │─── POST /api/auth/event/init ────────────────────────────────>│
     │<── { eventId, customToken } ─────────────────────────────────│
     │                              │                               │
     │  window.open(                │                               │
     │   /api/auth/google/start     │                               │
     │   ?eventId=uuid)             │                               │
     │                              │<── GET /api/auth/google/start │
     │                              │    302 → Google              │
     │                              │── consent ────────────────────>
     │                              │<── code + state ──────────────
     │                              │                               │
     │                              │<── GET /api/auth/google/callback
     │                              │    (code exchange)            │
     │                              │── createSessionCookie ────────>│
     │                              │── write RTDB auth_events/{id} │
     │                              │── 302 → /auth/close           │
     │                              │                               │
     │  (subscribing via RTDB)      │                               │
     │<── onValue fires: "success" ─┤                               │
     │    router.refresh()          │  window.close()               │
```

### Step-by-step

#### Step 1 — Initialise an auth event

```ts
// Client (via authEventService or useGoogleLogin)
const { eventId, customToken, expiresAt } =
  await authEventService.initAuthEvent();
// POST /api/auth/event/init
// ← { eventId: "uuid", customToken: "eyJ...", expiresAt: 1234567890 }
```

The server:

1. Generates a random `eventId` (UUID v4, 122 bits of entropy)
2. Writes `{ status: "pending", createdAt: Date.now() }` to `/auth_events/{eventId}` via Admin SDK (bypasses RTDB security rules — write: false for clients)
3. Creates a custom token with synthetic UID `auth_event_{eventId}` and JWT claim `{ authEventId: eventId }`
4. Returns both to the client

The custom token expires in **5 minutes**. The RTDB security rule grants read access only to `/auth_events/{eventId}` — the token cannot read any other path.

#### Step 2 — Subscribe to the event

```ts
// In the component — before opening the popup
authEvent.subscribe(eventId, customToken);
// - Signs in the secondary realtimeApp instance (no main window auth state affected)
// - Starts onValue() listener on /auth_events/{eventId}
// - Arms a 2-minute hard timeout
```

`useAuthEvent` uses `realtimeApp` (the secondary Firebase app instance in `@/lib/firebase/realtime.ts`) so the custom token sign-in has no effect on the main app's auth state.

#### Step 3 — Open the popup

```ts
window.open(
  `/api/auth/google/start?eventId=${eventId}`,
  "oauth",
  "width=500,height=660,left=400,top=100",
);
```

`GET /api/auth/google/start`:

1. Validates the `eventId` (UUID format + RTDB pending check)
2. Redirects to Google's OAuth consent screen with `state=eventId` (CSRF token), `scope=openid email profile`, `prompt=select_account`

#### Step 4 — Server handles the callback

**Google** (`GET /api/auth/google/callback`):

1. Verifies `state` param matches a pending RTDB event
2. Exchanges the `code` for tokens using `google-auth-library` (`OAuth2Client.getToken`)
3. Verifies the ID token using `OAuth2Client.verifyIdToken`
4. Finds or creates a Firebase Auth user and Firestore profile
5. Exchanges custom token for Firebase ID token (REST Identity Toolkit)
6. Calls `createSessionCookie(idToken)` — sets `__session` cookie
7. Creates a session record in Firestore
8. Writes `{ status: "success" }` to `/auth_events/{eventId}` via Admin SDK
9. Schedules node deletion after 10 seconds (grace period for client to read outcome)
10. Redirects popup to `/auth/close`

**Apple** (`POST /api/auth/apple/callback`):  
Same outcome, different input — Apple sends a form POST (`response_mode=form_post`) with `code`, `id_token`, `state`, and (first sign-in only) `user`. Apple's `id_token` is verified using Apple's JWKS at `https://appleid.apple.com/auth/keys` via `jose`. Apple uses `response_mode=form_post`, so the callback **must** be a POST route.

#### Step 5 — Main window reacts

The `onValue` listener in `useAuthEvent` fires when the RTDB node changes to `"success"`. The component reacts:

```ts
import { RealtimeEventStatus } from "@/hooks";

useEffect(() => {
  if (authEvent.status === RealtimeEventStatus.SUCCESS) {
    router.refresh(); // ← re-fetches server components, picks up __session cookie
  }
  if (authEvent.status === RealtimeEventStatus.FAILED) {
    showMessage({ type: "error", message: authEvent.error });
  }
}, [authEvent.status]);
```

`router.refresh()` causes Next.js to re-render server components with the new session cookie — the user is now authenticated in the main window.

#### Step 6 — Popup closes itself

`/auth/close` is a client component that calls `window.close()` in a `useEffect`. The popup disappears within 200ms of the callback redirect.

### State machine (`useAuthEvent`)

`useAuthEvent` is a thin wrapper over `useRealtimeEvent` (see `src/hooks/useRealtimeEvent.ts`). The status values are from the shared `RealtimeEventStatus` const object exported from `@/hooks`.

```
idle
  │── subscribe() called
  ▼
subscribing   (signing custom token into realtimeApp)
  │── auth OK
  ▼
pending       (onValue listener active, 2-min timer ticking)
  │── RTDB status="success"            │── RTDB status="failed"/"error"   │── 2-min timeout
  ▼                                    ▼                                   ▼
success                               failed                             timeout
```

All terminal states (`success`, `failed`, `timeout`) call:

1. `off(dbRef)` — remove RTDB listener
2. `signOut(getAuth(realtimeApp))` — discard per-event custom token
3. `clearTimeout` — cancel the hard-timeout timer

Call `authEvent.reset()` to return to `idle` for a retry.

### RTDB security rules

```json
"auth_events": {
  "$eventId": {
    ".read": "auth != null && auth.token.authEventId == $eventId",
    ".write": false
  }
}
```

Clients can **read** only the exact node their token was issued for. No client can write.

### Stale node cleanup

The `cleanupAuthEvents` Firebase Function (every 5 minutes) deletes any `/auth_events/{id}` node where `createdAt < now - 3 minutes`. This handles:

- Popup closed before completing
- Network failure during callback
- Any scenario where the callback route didn't self-delete the node

The `cleanupPaymentEvents` Firebase Function (same schedule) deletes any `/payment_events/{razorpayOrderId}` node where `createdAt < now - 15 minutes`. Payment events persist longer to cover slow or retried transactions.

---

## 6. Session Management

### Creating a session

A Firestore `sessions` document is created on every login (email/password, Google, Apple). It records:

- `userId`, `ipAddress`, `deviceInfo` (browser/OS parsed from User-Agent)
- `isActive: true`, `lastActivity`, `createdAt`, `expiresAt`

### Validating a session

`verifySessionCookie()` in `@/lib/firebase/auth-server` is called in every protected API route:

```ts
const session = await verifySessionCookie(
  request.cookies.get("__session")?.value,
);
if (!session) throw new AuthenticationError(ERROR_MESSAGES.AUTH.UNAUTHORIZED);
```

It throws if the cookie is missing, expired, revoked, or tampered with.

### Revoking a session

```
POST /api/auth/logout
  1. verifySessionCookie (confirm identity)
  2. adminAuth.revokeRefreshTokens(uid) — Firebase token revocation
  3. sessionRepository.deactivate(sessionId) — Firestore record
  4. Clear __session + __session_id cookies
```

**Hook**: `useLogout()` from `@/hooks`

Users can also revoke **other devices** from their account settings via `useRevokeMySession(sessionId)`.

### Activity refresh

`PATCH /api/auth/session/activity` is called periodically by middleware to keep the `lastActivity` timestamp fresh. This powers the "last seen" indicator in session management UI.

---

## 7. Password Reset & Email Verification

### Forgot password

```
POST /api/auth/forgot-password  { email }
  1. Rate-limit (strict — prevents email enumeration timing attacks)
  2. Silently ignore if user not found (same response regardless)
  3. Generate token → store in email_verification tokens collection
  4. Send email via Resend with reset link /auth/reset-password?token=...
```

**Hook**: `useForgotPassword()` from `@/hooks`

### Reset password

```
POST /api/auth/reset-password  { token, password }
  1. Look up token document (check not used, not expired)
  2. adminAuth.updateUser(uid, { password })
  3. Mark token as used
  4. Revoke all existing sessions (force re-login)
```

**Hook**: `useResetPassword()` from `@/hooks`

### Email verification

After registration, an email is sent with a Firebase action link. The user clicks it; the browser navigates to `/auth/verify-email?oobCode=...`. The page calls `POST /api/auth/verify-email` which verifies the code via Admin SDK and updates `emailVerified` on the user profile.

---

## 8. RBAC — Route & Component Protection

See [RBAC.md](./RBAC.md) for full details. Summary:

| Role        | Access                            |
| ----------- | --------------------------------- |
| `user`      | Standard user routes (`/user/**`) |
| `seller`    | Seller dashboard (`/seller/**`)   |
| `moderator` | Moderation tools                  |
| `admin`     | All routes including `/admin/**`  |

**Proxy** (`src/proxy.ts`) checks the session cookie on every request and redirects unauthenticated users.

**Component guard**:

```tsx
import { ProtectedRoute } from "@/components";
<ProtectedRoute requiredRole="admin">
  <AdminPanel />
</ProtectedRoute>;
```

**Programmatic checks**:

```ts
import { useIsAdmin, useHasRole } from "@/hooks";
const isAdmin = useIsAdmin();
const isSeller = useHasRole("seller");
```

---

## 9. Security Measures

| Threat                     | Mitigation                                                                      |
| -------------------------- | ------------------------------------------------------------------------------- |
| XSS stealing session token | `HttpOnly` cookie — JS cannot read `__session`                                  |
| CSRF attacks               | `SameSite=Strict` on both cookies                                               |
| Brute-force login          | `RateLimitPresets.AUTH` on all auth endpoints                                   |
| OAuth state forgery (CSRF) | `state=eventId` verified against RTDB pending node                              |
| Stale OAuth events         | Custom token expires in 5 min; RTDB nodes self-delete or cleaned up by Function |
| Client Firestore writes    | Firebase Admin SDK only in API routes; no client Firestore SDK                  |
| Stack traces in responses  | `handleApiError` maps all errors to safe business messages                      |
| Email enumeration          | Forgot-password always returns the same response regardless of user existence   |
| Token leakage in RTDB      | Per-event custom token claim restricts read to `/auth_events/{eventId}` only    |
| Orphaned auth event nodes  | `cleanupAuthEvents` Firebase Function deletes nodes > 3 min old every 5 min     |

---

## 10. Environment Variables

All auth-related env vars are server-only (not prefixed with `NEXT_PUBLIC_`).

| Variable               | Purpose                                                         |
| ---------------------- | --------------------------------------------------------------- |
| `FIREBASE_API_KEY`     | REST Identity Toolkit (custom token → ID token exchange)        |
| `GOOGLE_CLIENT_ID`     | Google OAuth app client ID                                      |
| `GOOGLE_CLIENT_SECRET` | Google OAuth app client secret                                  |
| `GOOGLE_REDIRECT_URI`  | Must match the registered callback: `/api/auth/google/callback` |
| `APPLE_CLIENT_ID`      | Apple Service ID (e.g. `in.letitrip.app.web`)                   |
| `APPLE_TEAM_ID`        | 10-char Apple Developer team ID                                 |
| `APPLE_KEY_ID`         | Key ID of the Sign in with Apple `.p8` key                      |
| `APPLE_PRIVATE_KEY`    | Contents of the `.p8` file (newlines as `\n`)                   |
| `SESSION_SECRET`       | Additional secret used for HMAC signing (if applicable)         |

---

## 11. File Map

### API routes (`src/app/api/auth/`)

| File                         | Method | Purpose                                         |
| ---------------------------- | ------ | ----------------------------------------------- |
| `login/route.ts`             | POST   | Email/password login, session cookie            |
| `register/route.ts`          | POST   | New user registration                           |
| `logout/route.ts`            | POST   | Revoke session, clear cookies                   |
| `session/route.ts`           | POST   | Create session from existing ID token           |
| `session/validate/route.ts`  | GET    | Validate current session cookie                 |
| `session/activity/route.ts`  | PATCH  | Update session last-activity timestamp          |
| `forgot-password/route.ts`   | POST   | Send password reset email                       |
| `reset-password/route.ts`    | POST   | Apply password reset token                      |
| `verify-email/route.ts`      | POST   | Apply email verification code                   |
| `send-verification/route.ts` | POST   | Re-send verification email                      |
| `event/init/route.ts`        | POST   | Create RTDB auth event + per-event custom token |
| `google/start/route.ts`      | GET    | Redirect popup to Google consent screen         |
| `google/callback/route.ts`   | GET    | Google OAuth code exchange, session creation    |
| `apple/start/route.ts`       | GET    | Redirect popup to Apple Sign In                 |
| `apple/callback/route.ts`    | POST   | Apple `form_post` callback, session creation    |

### Hooks (`src/hooks/`)

| Hook                      | Purpose                                                |
| ------------------------- | ------------------------------------------------------ |
| `useLogin()`              | Email/password login mutation                          |
| `useRegister()`           | Registration mutation                                  |
| `useLogout()`             | Logout mutation                                        |
| `useGoogleLogin()`        | Google OAuth (uses `useAuthEvent` internally)          |
| `useAppleLogin()`         | Apple Sign In (uses `useAuthEvent` internally)         |
| `useAuthEvent()`          | Low-level RTDB event subscriber for OAuth popup bridge |
| `useForgotPassword()`     | Send reset email mutation                              |
| `useResetPassword()`      | Apply reset token mutation                             |
| `useVerifyEmail()`        | Apply verification code mutation                       |
| `useResendVerification()` | Re-send verification email mutation                    |
| `useChangePassword()`     | Change password (authenticated) mutation               |
| `useAuth()`               | Read current auth state from `SessionContext`          |
| `useSession()`            | Full session context (user, role, loading)             |

### Services (`src/services/`)

| Service            | Purpose                                               |
| ------------------ | ----------------------------------------------------- |
| `authService`      | `login()`, `register()`, `logout()`, OAuth helpers    |
| `authEventService` | `initAuthEvent()` — calls `POST /api/auth/event/init` |
| `sessionService`   | Session CRUD client calls                             |

### Lib utilities

| File                               | Purpose                                                               |
| ---------------------------------- | --------------------------------------------------------------------- |
| `src/lib/firebase/auth-server.ts`  | `verifySessionCookie()`, `createSessionCookie()` — server-side        |
| `src/lib/firebase/auth-helpers.ts` | Client-side thin wrappers — `signInWithEmail()`, `signInWithGoogle()` |
| `src/lib/firebase/admin.ts`        | `getAdminAuth()`, `getAdminDb()`, `getAdminRealtimeDb()`              |
| `src/lib/firebase/realtime.ts`     | `realtimeApp` secondary instance for RTDB subscriptions               |
| `src/lib/firebase/realtime-db.ts`  | `RTDB_PATHS` constants                                                |

### Firebase Function

| File                                         | Trigger     | Purpose                                                    |
| -------------------------------------------- | ----------- | ---------------------------------------------------------- |
| `functions/src/jobs/cleanupAuthEvents.ts`    | Every 5 min | Delete stale `/auth_events` nodes older than 3 minutes     |
| `functions/src/jobs/cleanupPaymentEvents.ts` | Every 5 min | Delete stale `/payment_events` nodes older than 15 minutes |
