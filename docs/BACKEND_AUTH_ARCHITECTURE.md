# Backend-Only Authentication Architecture

**Security-First Firebase Auth Implementation**

This project uses a **backend-only authentication** approach where all Firebase operations happen server-side using Firebase Admin SDK. The client never directly communicates with Firebase Auth, providing enhanced security and control.

---

## 🔒 Security Benefits

### 1. **No Client-Side Firebase Credentials**

- Firebase API keys and credentials are **never exposed** to the client
- All authentication logic runs server-side only
- Eliminates client-side tampering risks

### 2. **Centralized Authentication**

- Single source of truth for auth logic
- Easier to audit and monitor
- Consistent security policies across all auth operations

### 3. **Enhanced Password Security**

- Passwords are **never sent** to the client
- Password verification happens server-side only
- Brute-force protection at the API level

### 4. **Session-Based Auth**

- Secure HTTP-only cookies (can't be accessed by JavaScript)
- Automatic CSRF protection
- Session revocation capability

### 5. **Admin-Level Control**

- Full control over user creation/modification
- Server-side email verification links
- Ability to disable/revoke accounts instantly

---

## 🏗️ Architecture Overview

```
┌─────────────┐         HTTPS          ┌──────────────┐
│   Browser   │ ────────────────────► │  Next.js API │
│   (Client)  │ ◄──────────────────── │   Routes     │
└─────────────┘    JSON + Cookies     └──────────────┘
                                              │
                                              │ Firebase Admin SDK
                                              │ (Server-side only)
                                              ▼
                                       ┌──────────────┐
                                       │   Firebase   │
                                       │  Auth/Store  │
                                       └──────────────┘
```

### Flow Diagram:

```
Registration:
Client → POST /api/auth/register → Firebase Admin creates user →
Store in Firestore → Create session → Return cookie

Login:
Client → POST /api/auth/login → Verify password via Firebase REST API →
Check Firestore data → Create session → Return cookie

Authenticated Requests:
Client → Request with session cookie → Verify session server-side →
Execute operation → Return result
```

---

## 📁 File Structure

```
src/
├── app/api/auth/
│   ├── register/route.ts      # POST /api/auth/register
│   ├── login/route.ts          # POST /api/auth/login
│   ├── logout/route.ts         # POST /api/auth/logout
│   ├── forgot-password/route.ts # POST /api/auth/forgot-password
│   └── session/route.ts        # Legacy endpoint (can be removed)
│
├── lib/firebase/
│   ├── admin.ts                # Firebase Admin SDK initialization
│   └── auth-server.ts          # Server-side auth utilities
│
└── middleware.ts               # Session verification middleware
```

---

## 🔧 API Endpoints

### 1. **Register** - `POST /api/auth/register`

**Request:**

```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "displayName": "John Doe" // optional
}
```

**Response:**

```json
{
  "success": true,
  "message": "Registration successful! Welcome aboard.",
  "user": {
    "uid": "abc123",
    "email": "user@example.com",
    "displayName": "John Doe",
    "role": "user",
    "emailVerified": false
  }
}
```

**Cookies Set:**

- `__session` - HTTP-only session cookie (5 days expiry)

---

### 2. **Login** - `POST /api/auth/login`

**Request:**

```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Login successful! Welcome back.",
  "user": {
    "uid": "abc123",
    "email": "user@example.com",
    "displayName": "John Doe",
    "photoURL": "https://...",
    "role": "user",
    "emailVerified": true,
    "phoneVerified": false
  }
}
```

**Cookies Set:**

- `__session` - HTTP-only session cookie (5 days expiry)

---

### 3. **Logout** - `POST /api/auth/logout`

**Request:** No body required (session cookie automatically sent)

**Response:**

```json
{
  "success": true,
  "message": "You have been logged out successfully"
}
```

**Cookies Cleared:**

- `__session` - Session cookie removed

**Additional Security:**

- Revokes all refresh tokens for the user
- Forces re-login on all devices

---

### 4. **Forgot Password** - `POST /api/auth/forgot-password`

**Request:**

```json
{
  "email": "user@example.com"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Password reset link sent to your email"
}
```

**Security Notes:**

- Always returns success (doesn't reveal if email exists)
- Reset link generated server-side
- Email sent via backend email service

---

## 🛡️ Security Features

### 1. **Password Requirements**

- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- Validated server-side using Zod schemas

### 2. **Session Management**

- HTTP-only cookies (JavaScript can't access)
- Secure flag in production (HTTPS only)
- SameSite=Lax (CSRF protection)
- 5-day expiry with automatic renewal
- Server-side verification on every request

### 3. **Account Security**

- Disabled accounts can't login
- Email verification tracking
- Phone verification tracking
- Login attempt tracking
- Last login timestamp

### 4. **Role-Based Access Control**

- Default role: `user`
- Special admin email: `admin@letitrip.in` gets `admin` role
- Roles stored in Firestore (tamper-proof)
- Verified on every authenticated request

---

## 🔑 Environment Variables

Add these to your `.env.local` file:

```bash
# Firebase Web API Key (for password verification)
FIREBASE_API_KEY=your_web_api_key

# Firebase Admin SDK (Server-side only)
FIREBASE_ADMIN_PROJECT_ID=your_project_id
FIREBASE_ADMIN_CLIENT_EMAIL=your_service_account@project.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

**⚠️ IMPORTANT:**

- Keep `FIREBASE_ADMIN_PRIVATE_KEY` secret
- Never commit `.env.local` to version control
- Use Firebase Admin service account, not regular user account

---

## 📝 Implementation Checklist

### Backend Setup ✅

- [x] Create `/api/auth/register` route
- [x] Create `/api/auth/login` route
- [x] Create `/api/auth/logout` route
- [x] Create `/api/auth/forgot-password` route
- [x] Add password validation with Zod
- [x] Implement session cookie management
- [x] Add error handling and response types

### Frontend Updates (Next Steps)

- [ ] Remove `firebase/auth` client SDK imports
- [ ] Update login page to use `/api/auth/login`
- [ ] Update registration page to use `/api/auth/register`
- [ ] Update logout to use `/api/auth/logout`
- [ ] Update password reset to use `/api/auth/forgot-password`
- [ ] Remove `src/lib/firebase/auth-helpers.ts` (if not needed)
- [ ] Test all authentication flows

### Security Enhancements

- [ ] Implement rate limiting on auth endpoints
- [ ] Add IP-based brute-force protection
- [ ] Set up email service for verification/reset emails
- [ ] Configure Content Security Policy headers
- [ ] Enable HTTPS in production
- [ ] Set up monitoring and alerting

---

## 🧪 Testing

### Manual Testing

1. **Register**:

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPass123","displayName":"Test User"}'
```

2. **Login**:

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPass123"}' \
  -c cookies.txt
```

3. **Logout**:

```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -b cookies.txt
```

---

## 🚀 Migration Guide

### From Client-Side Firebase to Backend-Only

1. **Replace auth helper calls**:

```typescript
// Before (Client-side Firebase)
import { signInWithEmail } from "@/lib/firebase/auth-helpers";
await signInWithEmail(email, password);

// After (Backend API)
const response = await fetch("/api/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, password }),
});
const data = await response.json();
```

2. **Update session management**:

```typescript
// Before (Client-side onAuthStateChanged)
onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is signed in
  }
});

// After (Server-side session verification)
// Session is automatically verified by middleware
// User data fetched from Firestore on server
```

3. **Remove client Firebase config** (optional):

```typescript
// Can remove or keep for Firestore/Storage if needed
// Authentication no longer uses client SDK
```

---

## 📊 Benefits Summary

| Feature                   | Client-Side Auth | Backend-Only Auth |
| ------------------------- | ---------------- | ----------------- |
| **Security**              | Medium           | High ✅           |
| **Credential Exposure**   | Exposed          | Hidden ✅         |
| **Password Verification** | Client           | Server ✅         |
| **Session Control**       | Limited          | Full ✅           |
| **Auditability**          | Difficult        | Easy ✅           |
| **Rate Limiting**         | Complex          | Simple ✅         |
| **Account Revocation**    | Delayed          | Instant ✅        |

---

## 🐛 Troubleshooting

### Issue: "auth/invalid-api-key"

**Solution:** Set `FIREBASE_API_KEY` in `.env.local` to your Firebase Web API key

### Issue: "Session verification failed"

**Solution:** Check that `FIREBASE_ADMIN_PRIVATE_KEY` is correctly formatted with `\n` line breaks

### Issue: "Password verification failed"

**Solution:** Ensure `FIREBASE_API_KEY` matches your Firebase project's Web API key

### Issue: "User already exists"

**Solution:** This is expected - the email is already registered. Use login endpoint instead.

---

## 📚 Additional Resources

- [Firebase Admin SDK Documentation](https://firebase.google.com/docs/admin/setup)
- [Firebase REST API Reference](https://firebase.google.com/docs/reference/rest/auth)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [HTTP-only Cookies Security](https://owasp.org/www-community/HttpOnly)

---

## ✅ Conclusion

This backend-only architecture provides enterprise-grade security while maintaining ease of use. All sensitive operations happen server-side, giving you complete control over authentication and authorization.

**Key Takeaway:** Never trust the client. Verify everything on the server.
