# Session Authentication Flow Diagrams

## 1. Login Flow

```
┌─────────┐                ┌─────────┐                ┌──────────┐
│ Client  │                │  Server │                │ Firestore│
└────┬────┘                └────┬────┘                └────┬─────┘
     │                          │                          │
     │ POST /api/auth/login     │                          │
     │ {email, password}        │                          │
     ├─────────────────────────>│                          │
     │                          │                          │
     │                          │ Check user in Firestore  │
     │                          ├─────────────────────────>│
     │                          │                          │
     │                          │ User data                │
     │                          │<─────────────────────────┤
     │                          │                          │
     │                          │ Verify password (bcrypt) │
     │                          │                          │
     │                          │ Create session           │
     │                          ├─────────────────────────>│
     │                          │                          │
     │                          │ Session saved            │
     │                          │<─────────────────────────┤
     │                          │                          │
     │                          │ Generate JWT token       │
     │                          │                          │
     │ Response + Set-Cookie    │                          │
     │ {user, sessionId}        │                          │
     │<─────────────────────────┤                          │
     │                          │                          │
     │ Store user in localStorage                          │
     │ Browser stores cookie    │                          │
     │                          │                          │
```

## 2. Authenticated Request Flow

```
┌─────────┐                ┌─────────┐                ┌──────────┐
│ Client  │                │  Server │                │ Firestore│
└────┬────┘                └────┬────┘                └────┬─────┘
     │                          │                          │
     │ GET /api/protected       │                          │
     │ Cookie: session=jwt...   │                          │
     ├─────────────────────────>│                          │
     │                          │                          │
     │                          │ Extract JWT from cookie  │
     │                          │                          │
     │                          │ Verify JWT signature     │
     │                          │                          │
     │                          │ Get session from Firestore│
     │                          ├─────────────────────────>│
     │                          │                          │
     │                          │ Session data             │
     │                          │<─────────────────────────┤
     │                          │                          │
     │                          │ Check expiration         │
     │                          │                          │
     │                          │ Update lastActivity      │
     │                          ├─────────────────────────>│
     │                          │                          │
     │                          │ Process request          │
     │                          │ req.session = {...}      │
     │                          │                          │
     │ Protected data           │                          │
     │<─────────────────────────┤                          │
     │                          │                          │
```

## 3. Logout Flow

```
┌─────────┐                ┌─────────┐                ┌──────────┐
│ Client  │                │  Server │                │ Firestore│
└────┬────┘                └────┬────┘                └────┬─────┘
     │                          │                          │
     │ POST /api/auth/logout    │                          │
     │ Cookie: session=jwt...   │                          │
     ├─────────────────────────>│                          │
     │                          │                          │
     │                          │ Extract JWT from cookie  │
     │                          │                          │
     │                          │ Verify JWT               │
     │                          │                          │
     │                          │ Delete session           │
     │                          ├─────────────────────────>│
     │                          │                          │
     │                          │ Session deleted          │
     │                          │<─────────────────────────┤
     │                          │                          │
     │ Response + Clear Cookie  │                          │
     │ Set-Cookie: session=;... │                          │
     │<─────────────────────────┤                          │
     │                          │                          │
     │ Clear localStorage       │                          │
     │ Browser clears cookie    │                          │
     │                          │                          │
```

## 4. Session Validation Process

```
     ┌──────────────────────────────────┐
     │  Session Token in Cookie         │
     └────────────┬─────────────────────┘
                  │
                  ▼
     ┌──────────────────────────────────┐
     │  Extract JWT Token               │
     └────────────┬─────────────────────┘
                  │
                  ▼
     ┌──────────────────────────────────┐
     │  Verify JWT Signature            │◄──── SESSION_SECRET
     └────────────┬─────────────────────┘
                  │
                  ▼
           Valid? ─┬─ No ──> 401 Unauthorized
                   │
                   Yes
                   │
                   ▼
     ┌──────────────────────────────────┐
     │  Decode JWT to get sessionId     │
     └────────────┬─────────────────────┘
                  │
                  ▼
     ┌──────────────────────────────────┐
     │  Query Firestore for sessionId   │
     └────────────┬─────────────────────┘
                  │
                  ▼
          Exists? ─┬─ No ──> 401 Unauthorized
                   │
                   Yes
                   │
                   ▼
     ┌──────────────────────────────────┐
     │  Check expiration time           │
     └────────────┬─────────────────────┘
                  │
                  ▼
         Expired? ─┬─ Yes ──> Delete session
                   │           └──> 401 Unauthorized
                   No
                   │
                   ▼
     ┌──────────────────────────────────┐
     │  Update lastActivity             │
     └────────────┬─────────────────────┘
                  │
                  ▼
     ┌──────────────────────────────────┐
     │  Attach session to request       │
     │  req.session = {userId, role...} │
     └────────────┬─────────────────────┘
                  │
                  ▼
           ✅ Authenticated
```

## 5. Multi-Device Session Management

```
User has 3 active sessions:

┌──────────────────────────────────────────────────────────────┐
│                     Firestore Sessions                        │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────────────────────────────────┐         │
│  │ Session 1 (Current)                             │         │
│  │ sessionId: sess_1234...                         │         │
│  │ userId: user123                                 │         │
│  │ device: Chrome/Windows                          │         │
│  │ ipAddress: 192.168.1.100                        │         │
│  │ createdAt: 2025-11-01                           │         │
│  │ lastActivity: 2025-11-07 (just now)             │         │
│  └─────────────────────────────────────────────────┘         │
│                                                               │
│  ┌─────────────────────────────────────────────────┐         │
│  │ Session 2                                       │         │
│  │ sessionId: sess_5678...                         │         │
│  │ userId: user123                                 │         │
│  │ device: Safari/iPhone                           │         │
│  │ ipAddress: 192.168.1.101                        │         │
│  │ createdAt: 2025-11-05                           │         │
│  │ lastActivity: 2025-11-06                        │         │
│  └─────────────────────────────────────────────────┘         │
│                                                               │
│  ┌─────────────────────────────────────────────────┐         │
│  │ Session 3                                       │         │
│  │ sessionId: sess_9012...                         │         │
│  │ userId: user123                                 │         │
│  │ device: Firefox/Linux                           │         │
│  │ ipAddress: 192.168.1.102                        │         │
│  │ createdAt: 2025-11-03                           │         │
│  │ lastActivity: 2025-11-07                        │         │
│  └─────────────────────────────────────────────────┘         │
│                                                               │
└──────────────────────────────────────────────────────────────┘

User can:
- View all active sessions: GET /api/auth/sessions
- Delete specific session: DELETE /api/auth/sessions {sessionId}
- Delete all sessions: DELETE /api/auth/sessions {deleteAll: true}
```

## 6. Security Architecture

```
┌───────────────────────────────────────────────────────────────┐
│                      Security Layers                           │
└───────────────────────────────────────────────────────────────┘

Layer 1: HTTP-Only Cookie
┌─────────────────────────────────────────────────────────────┐
│ • Prevents JavaScript access (XSS protection)                │
│ • Browser automatically sends with requests                  │
│ • Cannot be read by client-side code                         │
└─────────────────────────────────────────────────────────────┘
                            ▼
Layer 2: Secure Flag (Production)
┌─────────────────────────────────────────────────────────────┐
│ • Only transmitted over HTTPS                                │
│ • Prevents man-in-the-middle attacks                         │
│ • No cookie transmission over HTTP                           │
└─────────────────────────────────────────────────────────────┘
                            ▼
Layer 3: SameSite Protection
┌─────────────────────────────────────────────────────────────┐
│ • SameSite=lax prevents CSRF attacks                         │
│ • Cookie only sent with same-site requests                   │
│ • Protects against cross-site request forgery                │
└─────────────────────────────────────────────────────────────┘
                            ▼
Layer 4: JWT Signature
┌─────────────────────────────────────────────────────────────┐
│ • Token signed with SESSION_SECRET                           │
│ • Tampering invalidates signature                            │
│ • Verifies token authenticity                                │
└─────────────────────────────────────────────────────────────┘
                            ▼
Layer 5: Firestore Validation
┌─────────────────────────────────────────────────────────────┐
│ • Session must exist in database                             │
│ • Can be revoked immediately                                 │
│ • Tracks all active sessions                                 │
└─────────────────────────────────────────────────────────────┘
                            ▼
Layer 6: Expiration Check
┌─────────────────────────────────────────────────────────────┐
│ • Sessions expire after 7 days                               │
│ • Expired sessions automatically deleted                     │
│ • Forces periodic re-authentication                          │
└─────────────────────────────────────────────────────────────┘
                            ▼
Layer 7: Rate Limiting
┌─────────────────────────────────────────────────────────────┐
│ • Login attempts limited                                     │
│ • Prevents brute force attacks                               │
│ • Per-IP rate limiting                                       │
└─────────────────────────────────────────────────────────────┘
```

## 7. Data Flow Summary

```
┌─────────────────────────────────────────────────────────────┐
│                    Data Storage Locations                     │
└─────────────────────────────────────────────────────────────┘

Client Browser:
├─ Cookie Storage (HTTP-Only)
│  └─ session=<JWT_TOKEN>                    [Secure, HttpOnly]
│
└─ LocalStorage
   └─ user={uid, email, name, role...}       [For UI display]


Server (Firestore):
├─ users/ collection
│  └─ {userId}/
│     ├─ uid, email, name
│     ├─ hashedPassword                      [bcrypt hashed]
│     ├─ role, isEmailVerified
│     └─ profile, preferences
│
└─ sessions/ collection
   └─ {sessionId}/
      ├─ sessionId, userId, email, role
      ├─ createdAt, expiresAt, lastActivity
      └─ userAgent, ipAddress                [Optional tracking]


In-Memory (During Request):
└─ req.session = {
      userId: string,
      email: string,
      role: string,
      sessionId: string,
      iat: number,                           [Issued at]
      exp: number                            [Expiration]
   }
```

## 8. Middleware Chain

```
Incoming Request
      │
      ▼
┌──────────────────┐
│ withMiddleware   │  ← Rate limiting, logging
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ requireAuth      │  ← Extract & verify session
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ requireRole?     │  ← Check user role (optional)
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Your Handler     │  ← req.session available
└────────┬─────────┘
         │
         ▼
     Response
```

---

These diagrams illustrate the complete session authentication flow, security architecture, and data management in the system.
