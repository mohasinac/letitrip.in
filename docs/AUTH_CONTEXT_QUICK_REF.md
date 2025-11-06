# AuthContext Quick Reference Card

## 🎯 Import & Usage

```typescript
import { useAuth } from "@/contexts/AuthContext";

const { user, isAuthenticated, isAdmin, logout } = useAuth();
```

## 📊 Available Values

| Property          | Type           | Description                |
| ----------------- | -------------- | -------------------------- |
| `user`            | `User \| null` | Current user object        |
| `loading`         | `boolean`      | Auth operation in progress |
| `isAuthenticated` | `boolean`      | Is user logged in?         |
| `isAdmin`         | `boolean`      | Is user an admin?          |
| `isSeller`        | `boolean`      | Is user a seller?          |
| `isAdminOrSeller` | `boolean`      | Is user admin or seller?   |

## 🔧 Available Methods

| Method        | Parameters                              | Returns         | Description       |
| ------------- | --------------------------------------- | --------------- | ----------------- |
| `login`       | `email, password`                       | `Promise<void>` | Login user        |
| `register`    | `{email, password, name, phoneNumber?}` | `Promise<void>` | Register user     |
| `logout`      | none                                    | `Promise<void>` | Logout user       |
| `refreshUser` | none                                    | `Promise<void>` | Refresh user data |

## 💡 Common Patterns

### Conditional Rendering

```typescript
// Authenticated only
{
  isAuthenticated && <UserDashboard />;
}

// Guests only
{
  !isAuthenticated && <LoginButton />;
}

// Admin only
{
  isAdmin && <AdminPanel />;
}

// Seller or Admin
{
  isAdminOrSeller && <SellerTools />;
}
```

### User Info

```typescript
// Display user name
<p>Welcome, {user?.name}</p>

// Display user email
<p>{user?.email}</p>

// Display user role
<span>{user?.role}</span>

// Profile picture
<img src={user?.profile?.avatar} />
```

### Auth Actions

```typescript
// Login
const handleLogin = async () => {
  try {
    await login(email, password);
    router.push("/dashboard");
  } catch (error) {
    setError(error.message);
  }
};

// Logout
const handleLogout = async () => {
  await logout();
  router.push("/");
};

// Register
const handleRegister = async () => {
  try {
    await register({ email, password, name });
    router.push("/welcome");
  } catch (error) {
    setError(error.message);
  }
};
```

### Loading States

```typescript
if (loading) {
  return <Spinner />;
}

return <Content />;
```

## 🎨 UI Components Changes

### MainNavBar

```typescript
// Shows user profile or Sign In button
isAuthenticated ? <UserProfile user={user} /> : <SignInButton />;
```

### BottomNav

```typescript
// Account button routing
href={isAuthenticated ? "/user/settings" : "/login"}
```

### MobileSidebar

```typescript
// Logout button visibility
{
  isAuthenticated && <LogoutButton />;
}

// Admin section
{
  isAdmin && <AdminMenu />;
}

// Seller section
{
  isAdminOrSeller && <SellerMenu />;
}
```

## 🔐 Role Hierarchy

```
Guest (not logged in)
  ↓
User (role: "user")
  ↓
Seller (role: "seller")
  ↓
Admin (role: "admin")
```

**Access Levels:**

- Guest: Public pages only
- User: + User features
- Seller: + Seller features
- Admin: + Admin features + Seller features

## ⚡ Quick Checks

```typescript
// Is user logged in?
if (isAuthenticated) {
  /* ... */
}

// Is admin?
if (isAdmin) {
  /* ... */
}

// Is seller (not admin)?
if (isSeller && !isAdmin) {
  /* ... */
}

// Is admin or seller?
if (isAdminOrSeller) {
  /* ... */
}

// Has specific role?
if (user?.role === "admin") {
  /* ... */
}
```

## 🚀 Complete Example

```typescript
"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function MyPage() {
  const { user, isAuthenticated, isAdmin, loading, logout } = useAuth();

  const router = useRouter();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div>
        <h1>Please log in</h1>
        <button onClick={() => router.push("/login")}>Login</button>
      </div>
    );
  }

  return (
    <div>
      <h1>Welcome, {user?.name}!</h1>
      <p>Email: {user?.email}</p>
      <p>Role: {user?.role}</p>

      {isAdmin && (
        <div>
          <h2>Admin Tools</h2>
          <button onClick={() => router.push("/admin")}>Admin Dashboard</button>
        </div>
      )}

      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

## 📝 Notes

- AuthContext must be wrapped in root layout
- All values are reactive (auto-update UI)
- User data cached in localStorage for instant UI
- Session validated with server on mount
- Logout clears both cookie and localStorage
- Role changes require re-login to take effect

## 🐛 Troubleshooting

| Issue             | Solution                                |
| ----------------- | --------------------------------------- |
| useAuth() error   | Ensure component is inside AuthProvider |
| User always null  | Check session cookie exists             |
| Role not updating | User needs to logout and login again    |
| Loading forever   | Check API /auth/me endpoint             |

## 📚 Related Files

- Context: `src/contexts/AuthContext.tsx`
- Layout: `src/app/layout.tsx`
- Service: `src/services/auth.service.ts`

---

**Version**: 1.0.0  
**Last Updated**: November 7, 2025
