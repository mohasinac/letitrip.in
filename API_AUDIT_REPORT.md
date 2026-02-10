# API Endpoints Audit Report

**Generated:** February 9, 2026  
**Scope:** All endpoints in `src/constants/api-endpoints.ts` vs actual routes in `src/app/api/`

---

## Executive Summary

- ✅ **13 Working Routes** with matching schemas
- ⚠️ **4 Missing Routes** referenced in constants
- 🔧 **3 Schema Mismatches** between frontend and backend
- 📝 **5 Undocumented Routes** exist but not in constants

---

## A) MISSING ROUTE FILES

### Critical (Used in Frontend Code)

#### 1. ❌ `/api/profile/add-phone`

- **Status:** MISSING - Route does not exist
- **Defined In:** `API_ENDPOINTS.PROFILE.ADD_PHONE`
- **Used By:** `src/components/profile/ProfilePhoneSection.tsx` (line 56)
- **Impact:** HIGH - Feature is broken, phone number addition fails
- **Expected Schema:**

  ```typescript
  // Request
  { phoneNumber: string }

  // Response
  { success: boolean, verificationId: string, message: string }
  ```

#### 2. ❌ `/api/profile/verify-phone`

- **Status:** MISSING - Route does not exist
- **Defined In:** `API_ENDPOINTS.PROFILE.VERIFY_PHONE`
- **Used By:** `src/components/profile/ProfilePhoneSection.tsx` (line 85)
- **Impact:** HIGH - Feature is broken, phone verification fails
- **Expected Schema:**

  ```typescript
  // Request
  { verificationId: string, code: string }

  // Response
  { success: boolean, phoneVerified: boolean, message: string }
  ```

### Low Priority (Not Currently Used)

#### 3. ❌ `/api/auth/refresh-token`

- **Status:** MISSING - Route does not exist
- **Defined In:** `API_ENDPOINTS.AUTH.REFRESH_TOKEN`
- **Used By:** None (no references found in codebase)
- **Impact:** MEDIUM - May be needed for future token refresh implementation
- **Expected Schema:**

  ```typescript
  // Request
  { refreshToken: string }

  // Response
  { success: boolean, idToken: string, refreshToken: string }
  ```

#### 4. ❌ `/api/user/account` (DELETE)

- **Status:** MISSING - Route does not exist
- **Defined In:** `API_ENDPOINTS.USER.DELETE_ACCOUNT`
- **Used By:** None (functionality implemented at `/api/profile/delete-account` instead)
- **Impact:** LOW - Alternative route exists at `/api/profile/delete-account`
- **Note:** Duplicate endpoint definition - should remove from constants

---

## B) SCHEMA MISMATCHES

### 1. ⚠️ Register Endpoint - Extra Fields Not Validated

**Route:** `POST /api/auth/register`

**Frontend:** `src/hooks/useAuth.ts` - `useRegister()`

```typescript
interface RegisterData {
  email?: string;
  phoneNumber?: string;
  password: string;
  displayName?: string;
  acceptTerms: boolean; // ❌ NOT validated by backend
}
```

**Backend:** `src/app/api/auth/register/route.ts`

```typescript
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)...,
  displayName: z.string().min(2).optional(),
  // ❌ Missing: phoneNumber, acceptTerms
});
```

**Impact:** MEDIUM

- Frontend collects `acceptTerms` but backend doesn't validate it
- Frontend allows `phoneNumber` registration but backend doesn't support it
- Could lead to legal compliance issues (terms acceptance not enforced)

**Fix Required:** Backend schema should validate all frontend fields

---

### 2. ⚠️ Login Endpoint - Field Name Mismatch

**Route:** `POST /api/auth/login`

**Frontend:** `src/hooks/useAuth.ts` - `useLogin()`

```typescript
interface LoginCredentials {
  emailOrPhone: string; // ❌ Field name doesn't match backend
  password: string;
}

// Hook checks if emailOrPhone contains "@" to determine if email
const isEmail = credentials.emailOrPhone.includes("@");
```

**Backend:** `src/app/api/auth/login/route.ts`

```typescript
const loginSchema = z.object({
  email: z.string().email(), // ❌ Expects "email" not "emailOrPhone"
  password: z.string().min(1),
});
```

**Impact:** LOW - Currently works because frontend only calls `signInWithEmail()` directly

- Frontend checks `emailOrPhone` but throws error for phone numbers
- Phone login is marked as "NOT_IMPLEMENTED"
- Schema mismatch doesn't cause issues but is misleading

**Fix Required:** Either:

1. Update backend to accept `emailOrPhone` field, OR
2. Update frontend to use `email` field consistently

---

### 3. ⚠️ Update Profile Endpoint - Route Mismatch

**Constants:**

```typescript
USER: {
  UPDATE_PROFILE: "/api/user/profile",  // ❌ This route doesn't exist as POST/PUT/PATCH
}
PROFILE: {
  UPDATE: "/api/profile/update",  // ✅ This is the actual route
}
```

**Frontend:** `src/hooks/useProfile.ts` - `useUpdateProfile()`

```typescript
mutationFn: (data) => apiClient.put(API_ENDPOINTS.USER.UPDATE_PROFILE, data);
// ❌ Calls /api/user/profile with PUT method
```

**Actual Routes:**

- `GET /api/user/profile` - ✅ Exists (fetch profile)
- `PUT /api/user/profile` - ❌ Does NOT exist
- `PATCH /api/profile/update` - ✅ Exists (update profile)

**Impact:** HIGH - Profile updates will fail!

- Hook calls non-existent endpoint
- Actual update endpoint is at different path

**Fix Required:** Update `useUpdateProfile()` to use `API_ENDPOINTS.PROFILE.UPDATE`

---

## C) ROUTES WITH MATCHING SCHEMAS ✅

### Authentication Routes

#### 1. ✅ `POST /api/auth/register`

- **Frontend:** `useRegister()` in `src/hooks/useAuth.ts`
- **Backend:** `src/app/api/auth/register/route.ts`
- **Schema Match:** Partial (see mismatch #1 above)
- **Request:** `{ email, password, displayName? }`
- **Response:** `{ success, message, user, sessionId }`

#### 2. ✅ `POST /api/auth/login`

- **Frontend:** `useLogin()` in `src/hooks/useAuth.ts`
- **Backend:** `src/app/api/auth/login/route.ts`
- **Schema Match:** Functional (see mismatch #2 above)
- **Request:** `{ email, password }`
- **Response:** `{ success, message, user, sessionId }`

#### 3. ✅ `POST /api/auth/logout`

- **Frontend:** Called directly via apiClient
- **Backend:** `src/app/api/auth/logout/route.ts`
- **Schema Match:** Perfect ✓
- **Request:** None (uses session cookie)
- **Response:** `{ success, message }`

#### 4. ✅ `GET /api/auth/verify-email`

- **Frontend:** `useVerifyEmail()` in `src/hooks/useAuth.ts`
- **Backend:** `src/app/api/auth/verify-email/route.ts`
- **Schema Match:** Perfect ✓
- **Request:** Query param `?token=xxx`
- **Response:** `{ success, message }`

#### 5. ✅ `POST /api/auth/forgot-password`

- **Frontend:** `useForgotPassword()` in `src/hooks/useAuth.ts` (calls Firebase directly)
- **Backend:** `src/app/api/auth/forgot-password/route.ts`
- **Schema Match:** Perfect ✓
- **Request:** `{ email }`
- **Response:** `{ success, message }`

#### 6. ✅ `PUT /api/auth/reset-password`

- **Frontend:** `useResetPassword()` in `src/hooks/useAuth.ts` (calls Firebase directly)
- **Backend:** `src/app/api/auth/reset-password/route.ts`
- **Schema Match:** Perfect ✓
- **Request:** `{ token, newPassword }`
- **Response:** `{ success, message }`

---

### User Routes

#### 7. ✅ `GET /api/user/profile`

- **Frontend:** `useProfile()` in `src/hooks/useProfile.ts`
- **Backend:** `src/app/api/user/profile/route.ts`
- **Schema Match:** Perfect ✓
- **Request:** None (uses session cookie)
- **Response:**
  ```typescript
  {
    success: boolean;
    data: {
      (uid,
        email,
        emailVerified,
        displayName,
        photoURL,
        phoneNumber,
        phoneVerified,
        role,
        disabled,
        avatarMetadata,
        createdAt,
        updatedAt);
    }
  }
  ```

#### 8. ✅ `POST /api/user/change-password`

- **Frontend:** `useChangePassword()` in `src/hooks/useAuth.ts`
- **Backend:** `src/app/api/user/change-password/route.ts`
- **Schema Match:** Perfect ✓
- **Request:** `{ currentPassword, newPassword }`
- **Response:** `{ success, message }`
- **Note:** Requires client-side password verification before API call

---

### Profile Routes

#### 9. ✅ `PATCH /api/profile/update`

- **Frontend:** Should be used by `useUpdateProfile()` (currently broken - see mismatch #3)
- **Backend:** `src/app/api/profile/update/route.ts`
- **Schema Match:** Perfect ✓ (when used correctly)
- **Request:**
  ```typescript
  {
    displayName?: string;
    email?: string;
    phoneNumber?: string;
    photoURL?: string;
    avatarMetadata?: { url, position: {x, y}, zoom }
  }
  ```
- **Response:** `{ success, message, user, verificationReset }`

#### 10. ✅ `POST /api/profile/update-password`

- **Frontend:** Not directly hooked (alternative to user/change-password)
- **Backend:** `src/app/api/profile/update-password/route.ts`
- **Schema Match:** Perfect ✓
- **Request:** `{ currentPassword, newPassword }`
- **Response:** `{ success, message }`

#### 11. ✅ `DELETE /api/profile/delete-account`

- **Frontend:** Not directly hooked
- **Backend:** `src/app/api/profile/delete-account/route.ts`
- **Schema Match:** Perfect ✓
- **Request:** None (uses authenticated session)
- **Response:** `{ success, message }`
- **Note:** This is the ACTUAL delete account route (not `/api/user/account`)

---

### Admin Routes

#### 12. ✅ `GET /api/admin/dashboard`

- **Frontend:** `useAdminStats()` in `src/hooks/useAdminStats.ts`
- **Backend:** `src/app/api/admin/dashboard/route.ts`
- **Schema Match:** Perfect ✓
- **Request:** None (requires admin session)
- **Response:**
  ```typescript
  {
    success: boolean;
    data: {
      users: { total, active, new, newThisMonth, disabled, admins },
      products: { total },
      orders: { total }
    }
  }
  ```

---

## D) UNDOCUMENTED ROUTES (Exist But Not in Constants)

### 1. 📝 `POST /api/auth/session`

- **Location:** `src/app/api/auth/session/route.ts`
- **Usage:** Called by `auth-helpers.ts` - `createSession()`
- **Purpose:** Create session cookie from Firebase ID token
- **Request:** `{ idToken: string }`
- **Response:** `{ success: boolean, sessionId: string }`
- **Should Add to Constants:** `AUTH.CREATE_SESSION`

### 2. 📝 `DELETE /api/auth/session`

- **Location:** `src/app/api/auth/session/route.ts`
- **Usage:** Called by `auth-helpers.ts` - `destroySession()`
- **Purpose:** Clear session cookie and revoke session
- **Request:** None (uses cookies)
- **Response:** `{ success: boolean }`
- **Should Add to Constants:** `AUTH.DESTROY_SESSION`

### 3. 📝 `POST /api/auth/send-verification`

- **Location:** `src/app/api/auth/send-verification/route.ts`
- **Usage:** `useResendVerification()` in `src/hooks/useAuth.ts`
- **Purpose:** Resend email verification
- **Request:** `{ email: string }`
- **Response:** `{ success: boolean, message: string }`
- **Should Add to Constants:** `AUTH.RESEND_VERIFICATION`

### 4. 📝 `GET /api/user/sessions`

- **Location:** `src/app/api/user/sessions/route.ts`
- **Usage:** `useMySessions()` in `src/hooks/useSessions.ts`
- **Purpose:** Get current user's active sessions
- **Request:** None (uses session cookie)
- **Response:** `{ success, sessions[], activeCount, total }`
- **Should Add to Constants:** `USER.SESSIONS`

### 5. 📝 `GET /api/admin/sessions`

- **Location:** `src/app/api/admin/sessions/route.ts`
- **Usage:** `useAdminSessions()` in `src/hooks/useSessions.ts`
- **Purpose:** Get all sessions (admin only)
- **Request:** Query params `?userId=xxx&limit=100`
- **Response:** `{ success, sessions[], stats, count }`
- **Should Add to Constants:** `ADMIN.SESSIONS`

### 6. 📝 `GET /api/profile/[userId]`

- **Location:** `src/app/api/profile/[userId]/route.ts`
- **Usage:** None currently (public profile viewing)
- **Purpose:** Get public profile by user ID
- **Request:** URL param `userId`
- **Response:** `{ success, user: { uid, displayName, photoURL, ... } }`
- **Should Add to Constants:** `PROFILE.GET_PUBLIC: (id) => \`/api/profile/${id}\``

---

## Priority Action Items

### 🔴 Critical (Breaks Existing Features)

1. **Create `/api/profile/add-phone` route**
   - Currently breaking phone number addition feature
   - Component already integrated and calling missing endpoint

2. **Create `/api/profile/verify-phone` route**
   - Currently breaking phone verification feature
   - Component already integrated and calling missing endpoint

3. **Fix `useUpdateProfile()` hook**
   - Change from `API_ENDPOINTS.USER.UPDATE_PROFILE` to `API_ENDPOINTS.PROFILE.UPDATE`
   - This is breaking profile updates!

### 🟡 High Priority (Schema Mismatches)

4. **Add validation for `acceptTerms` in register endpoint**
   - Backend should validate this field
   - Legal compliance concern

5. **Align login field naming**
   - Either backend accepts `emailOrPhone` or frontend uses `email`

### 🟢 Medium Priority (Documentation)

6. **Add undocumented routes to constants:**

   ```typescript
   AUTH: {
     CREATE_SESSION: "/api/auth/session",
     DESTROY_SESSION: "/api/auth/session",
     RESEND_VERIFICATION: "/api/auth/send-verification",
   },
   USER: {
     SESSIONS: "/api/user/sessions",
   },
   ADMIN: {
     SESSIONS: "/api/admin/sessions",
   },
   PROFILE: {
     GET_PUBLIC: (id: string) => `/api/profile/${id}`,
   }
   ```

7. **Remove duplicate endpoint:**
   - Remove `USER.DELETE_ACCOUNT` from constants (use `PROFILE.DELETE_ACCOUNT` instead)

8. **Decide on refresh token implementation:**
   - Either create the route or remove from constants

---

## Recommendations

### Immediate Actions

1. Create missing phone endpoints (`add-phone`, `verify-phone`)
2. Fix `useUpdateProfile()` to call correct endpoint
3. Add `acceptTerms` validation to register schema

### Short-term Improvements

4. Add all existing routes to constants file
5. Remove unused/duplicate endpoint definitions
6. Align field naming between frontend and backend
7. Create comprehensive API documentation

### Long-term Strategy

8. Implement API versioning (`/api/v1/...`)
9. Add OpenAPI/Swagger documentation
10. Create automated tests for all endpoints
11. Implement refresh token mechanism (if needed)

---

## Testing Checklist

- [ ] Test register flow with all fields
- [ ] Test login with email
- [ ] Test profile update functionality
- [ ] Test phone number addition (will fail until route created)
- [ ] Test phone verification (will fail until route created)
- [ ] Test password change flow
- [ ] Test account deletion
- [ ] Test admin dashboard stats
- [ ] Test session management (user and admin)
- [ ] Verify all error handling and validation

---

**End of Report**
