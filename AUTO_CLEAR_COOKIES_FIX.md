# 🔧 Auto-Clear Invalid Cookies on Failed Auth

## ✅ **Fix Applied**

Updated login and register endpoints to automatically clear invalid session cookies when authentication fails.

## 📋 **Changes Made**

### Files Modified:
1. `src/app/api/auth/login/route.ts`
2. `src/app/api/auth/register/route.ts`

### What Changed:

#### Before (Problem):
```typescript
if (!isPasswordValid) {
  return NextResponse.json(
    { error: 'Invalid credentials' },
    { status: 401 }
  );
}
// Old invalid cookie still exists in browser!
```

#### After (Fixed):
```typescript
if (!isPasswordValid) {
  const response = NextResponse.json(
    { error: 'Invalid credentials' },
    { status: 401 }
  );
  // Clear any existing invalid session cookie
  clearSessionCookie(response);
  return response;
}
```

## 🎯 **What This Fixes**

### Problem:
1. User has old/invalid session cookie in browser
2. User tries to login with wrong password → 401 error
3. Old invalid cookie remains in browser
4. Every subsequent request sends the invalid cookie
5. Server keeps trying to verify invalid cookie → "invalid signature" errors

### Solution:
Now when login/register fails for ANY reason, the server automatically clears the session cookie:
- ❌ Invalid credentials → Clear cookie
- ❌ Account disabled → Clear cookie
- ❌ Email already exists → Clear cookie
- ❌ Validation errors → Clear cookie
- ❌ Server errors → Clear cookie

## 🚀 **Scenarios Now Handled**

### Login Route (`/api/auth/login`):
```typescript
✅ User not found → Clear cookie
✅ Wrong password → Clear cookie
✅ Account disabled → Clear cookie
✅ Server error → Clear cookie
```

### Register Route (`/api/auth/register`):
```typescript
✅ Missing fields → Clear cookie
✅ Invalid email format → Clear cookie
✅ Password too short → Clear cookie
✅ User already exists → Clear cookie
✅ Firebase auth errors → Clear cookie
✅ Server error → Clear cookie
```

## 🔄 **How It Works**

### Using `clearSessionCookie()` function:
```typescript
export function clearSessionCookie(response: NextResponse): void {
  const cookie = serialize(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,  // ← This expires the cookie immediately
    path: '/',
  });

  response.headers.set('Set-Cookie', cookie);
}
```

### Key Properties:
- `maxAge: 0` → Expires cookie immediately
- `path: '/'` → Clears cookie for entire site
- `httpOnly: true` → Secure (JS can't access)
- `sameSite: 'lax'` → CSRF protection

## 📊 **Before vs After**

### Before Fix:
```
1. User has invalid cookie from previous session
2. User tries to login with wrong password
3. POST /api/auth/login → 401
4. Invalid cookie still in browser
5. GET /api/auth/me → 401 "invalid signature"
6. User appears logged out but cookie exists
7. Confused state - can't login properly
```

### After Fix:
```
1. User has invalid cookie from previous session
2. User tries to login with wrong password
3. POST /api/auth/login → 401 + Clear cookie
4. No cookie in browser ✅
5. User tries again with correct password
6. POST /api/auth/login → 200 + New valid cookie ✅
7. GET /api/auth/me → 200 ✅
8. User logged in successfully!
```

## 🧪 **Testing**

### Test Scenario 1: Wrong Password
```bash
# 1. Try login with wrong password
POST /api/auth/login
Body: { email: "test@test.com", password: "wrong" }
Response: 401 + Set-Cookie: session=; Max-Age=0

# 2. Check browser - cookie should be gone
DevTools → Storage → Cookies → No 'session' cookie

# 3. Try login with correct password
POST /api/auth/login
Body: { email: "test@test.com", password: "correct" }
Response: 200 + Set-Cookie: session=eyJhbG... (valid token)

# 4. Should work now!
```

### Test Scenario 2: Invalid Email Format
```bash
# 1. Try register with invalid email
POST /api/auth/register
Body: { email: "notanemail", password: "password123", name: "Test" }
Response: 400 + Set-Cookie: session=; Max-Age=0

# 2. Cookie cleared automatically
# 3. Try again with valid email
POST /api/auth/register
Body: { email: "test@test.com", password: "password123", name: "Test" }
Response: 200 + Set-Cookie: session=eyJhbG... (valid token)
```

## ✅ **Benefits**

1. **Auto-cleanup**: No manual cookie clearing needed
2. **Prevents confusion**: Invalid cookies don't linger
3. **Better UX**: Users can retry login without issues
4. **Security**: Clears potentially compromised cookies
5. **Clean state**: Every failed attempt = fresh start

## 🎯 **What You Should Do Now**

### Option 1: Let it auto-fix (Recommended)
Just try to login again - the invalid cookie will be cleared automatically on the next failed attempt.

### Option 2: Manual clear (Faster)
Clear your browser cookies once now (F12 → Storage → Cookies → Delete), then all future failed attempts will auto-clear.

### Option 3: Fresh start
Use incognito/private window (`Ctrl + Shift + P`)

## 📝 **Summary**

- ✅ Login failures now auto-clear cookies
- ✅ Register failures now auto-clear cookies
- ✅ No more lingering invalid sessions
- ✅ No more "invalid signature" errors after failed auth
- ✅ Clean state after every failed attempt
- ✅ Better user experience

## 🔍 **Verify Fix Working**

After trying to login with wrong password:

1. **Open DevTools** (F12)
2. **Go to Network tab**
3. **Look at POST /api/auth/login response**
4. **Check Response Headers**:
   ```
   Set-Cookie: session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0
   ```
5. **Go to Application → Cookies**
6. **Verify**: `session` cookie is gone or empty ✅

## 🚀 **Next Steps**

Try logging in again - should work smoothly now without any "invalid signature" errors! Every failed attempt will automatically clear any invalid cookies.
