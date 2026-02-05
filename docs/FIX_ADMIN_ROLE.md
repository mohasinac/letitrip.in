# Fix Admin Role - Manual Database Update

## Issue

You registered with `admin@letitrip.in` **before** we implemented the automatic admin role assignment. Your role in the database is currently "user" instead of "admin".

## Solution: Update Role in Firebase Console

### Option 1: Firebase Console (Recommended)

1. **Open Firebase Console**
   - Go to https://console.firebase.google.com
   - Select your project

2. **Navigate to Firestore Database**
   - Click "Firestore Database" in the left sidebar
   - Click on the "users" collection

3. **Find Your User Document**
   - Look for the document with your email: `admin@letitrip.in`
   - Or search by your UID

4. **Update the Role Field**
   - Click on your user document
   - Find the `role` field
   - Change the value from `"user"` to `"admin"`
   - Click "Update"

5. **Refresh the Page**
   - Log out and log back in
   - Or simply refresh the profile page
   - Your role should now show as "admin"

### Option 2: Re-register (Not Recommended)

If you haven't added important data to your account:

1. Delete your current account from Firebase Console
2. Re-register with `admin@letitrip.in`
3. The automatic admin assignment will work now

## Verification

After updating your role:

1. Go to your Profile page
2. Check that "Role" field shows: **admin**
3. Go to `/admin/users` page
4. You should now have access to the admin dashboard

## Future Users

For any future registrations with `admin@letitrip.in`, the role will be automatically set to "admin" during registration. This is implemented in:

- `src/lib/firebase/auth-helpers.ts` - `getDefaultRole()` function

```typescript
function getDefaultRole(email: string | null): UserRole {
  if (email === "admin@letitrip.in") {
    return "admin";
  }
  return "user";
}
```
