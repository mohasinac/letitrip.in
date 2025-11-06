# 🔧 SESSION_SECRET Fix - Clear Old Cookies

## ❌ **Error:**

```
Session verification error: Error [JsonWebTokenError]: invalid signature
GET /api/auth/me 401 in 35ms
```

## 🎯 **Root Cause:**

You have **old session cookies** in your browser that were created with a **different secret** (or no secret). When the server tries to verify them with the new `SESSION_SECRET`, the signature doesn't match.

## ✅ **Solution: Clear Browser Cookies**

### Firefox (Your Browser):

1. Press `Ctrl + Shift + Delete`
2. Select "Cookies"
3. Time range: "Last Hour" (or "Everything")
4. Click "Clear Now"

**OR use Developer Tools:**

1. Press `F12` to open DevTools
2. Go to "Storage" tab
3. Click "Cookies" → `http://localhost:3000`
4. Right-click the `session` cookie → Delete
5. Refresh page

### Alternative: Use Incognito/Private Window

```
Ctrl + Shift + P (Firefox Private Window)
```

Then visit `http://localhost:3000`

## 🔄 **After Clearing Cookies:**

1. **Try accessing home page** - should work without redirect
2. **Try logging in again** - should create new valid session
3. **Check browser console** - should see `GET /api/auth/me 200`

## 🐛 **Why This Happens:**

### Timeline:

```
1. Old cookie created with JWT_SECRET (or no secret)
   → Token signature: abc123xyz

2. SESSION_SECRET added to .env
   → Server restarts with new secret

3. Browser sends old cookie to server
   → Server tries to verify with SESSION_SECRET
   → Signature doesn't match (invalid signature error)
   → Returns 401 Unauthorized
```

### After clearing cookies:

```
1. Browser has no cookies
2. Try to login → Creates new token with SESSION_SECRET
3. Server verifies with SESSION_SECRET → ✅ Match!
4. Authentication works
```

## 📋 **Verification Steps:**

After clearing cookies and logging in:

1. **Check browser DevTools:**

   ```
   Application → Cookies → localhost:3000
   Should see: session = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

2. **Check browser console:**

   ```
   ✅ GET /api/auth/me 200 (not 401)
   ```

3. **Check server logs:**
   ```
   ✅ No "invalid signature" errors
   ✅ Should see successful API requests
   ```

## ⚠️ **Important Note:**

Your `.env` file structure is fine for development, but for security best practices:

### Current Setup:

```
.env (contains secrets) ✅ Works but not ideal
```

### Recommended Setup:

```
.env (defaults, no secrets, committed to git)
.env.local (secrets, NOT committed to git)
```

But since you're already using `.env` and it works, just make sure:

- ✅ `.env` is in `.gitignore`
- ✅ Don't commit secrets to git
- ✅ Use different secrets for production

## 🚀 **Quick Test:**

After clearing cookies:

```bash
# 1. Clear cookies (F12 → Storage → Cookies → Delete)
# 2. Go to login page
# 3. Login with your account
# 4. Should stay logged in
# 5. Refresh page → Should still be logged in
```

## 🎯 **TL;DR:**

1. **Press `Ctrl + Shift + Delete`**
2. **Clear cookies**
3. **Login again**
4. **Should work now!** 🎉

The old cookies were signed with a different secret, so they can't be verified anymore. Fresh login = fresh token = no errors!
