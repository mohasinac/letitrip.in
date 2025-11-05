# 🚀 Quick Migration Guide for Existing Components

## Update Your Login Component

### Before (Token-based)

```typescript
import { useAuth } from "@/contexts/AuthContext";

function LoginForm() {
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(email, password);
    // Token was stored in localStorage
  };
}
```

### After (Session-based)

```typescript
import { loginWithSession } from "@/lib/auth/session-client";
import { useRouter } from "next/navigation";

function LoginForm() {
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await loginWithSession(email, password);
      // Session cookie is automatically set
      router.push("/dashboard");
    } catch (error) {
      console.error("Login failed:", error);
    }
  };
}
```

---

## Update Your Logout Functionality

### Before

```typescript
import { useAuth } from "@/contexts/AuthContext";

function LogoutButton() {
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    // Manually clear tokens
  };
}
```

### After

```typescript
import { logoutSession } from "@/lib/auth/session-client";
import { useRouter } from "next/navigation";

function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await logoutSession();
    router.push("/login");
  };
}
```

---

## Update Protected Pages

### Before

```typescript
"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) return <div>Loading...</div>;
  if (!user) return null;

  return <div>Protected content</div>;
}
```

### After

```typescript
"use client";

import { getCurrentSessionUser } from "@/lib/auth/session-client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ProtectedPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    getCurrentSessionUser()
      .then(setUser)
      .catch(() => router.push("/login"))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) return <div>Loading...</div>;
  if (!user) return null;

  return <div>Protected content</div>;
}
```

---

## Update API Calls

### Before (Manual token handling)

```typescript
import { auth } from "@/lib/database/config";

async function fetchUserData() {
  const token = await auth.currentUser?.getIdToken();

  const response = await fetch("/api/user/profile", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.json();
}
```

### After (Automatic cookie handling)

```typescript
import { apiClient } from "@/lib/api/client";

async function fetchUserData() {
  // Session cookie is automatically sent
  const data = await apiClient.get("/api/user/profile");
  return data;
}
```

---

## Create a Custom Hook for Session

```typescript
// src/hooks/useSession.ts
import { useState, useEffect } from "react";
import {
  getCurrentSessionUser,
  type SessionUser,
} from "@/lib/auth/session-client";

export function useSession() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    getCurrentSessionUser()
      .then(setUser)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  const refresh = async () => {
    setLoading(true);
    try {
      const user = await getCurrentSessionUser();
      setUser(user);
      setError(null);
    } catch (err) {
      setError(err as Error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  return { user, loading, error, refresh };
}
```

### Usage

```typescript
import { useSession } from "@/hooks/useSession";

function MyComponent() {
  const { user, loading, error } = useSession();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!user) return <div>Not logged in</div>;

  return <div>Welcome, {user.name}!</div>;
}
```

---

## Remove Old Token Storage

Find and remove these patterns from your codebase:

### Remove localStorage/sessionStorage token access

```typescript
// ❌ Remove these
localStorage.setItem("authToken", token);
localStorage.getItem("authToken");
localStorage.removeItem("authToken");

// ❌ Remove these
sessionStorage.setItem("authToken", token);
sessionStorage.getItem("authToken");
```

### Remove manual Authorization headers

```typescript
// ❌ Remove these
headers: {
  'Authorization': `Bearer ${token}`,
}

// ✅ Use this instead
import { apiClient } from '@/lib/api/client';
await apiClient.get('/api/endpoint');
```

### Remove token refresh logic

```typescript
// ❌ Remove token refresh functions
async function refreshToken() { ... }

// ✅ Sessions are automatically refreshed on each request
```

---

## Update Your AuthContext (Optional)

If you want to keep using a context, update it to use sessions:

```typescript
// src/contexts/SessionAuthContext.tsx
"use client";

import { createContext, useContext, useState, useEffect } from "react";
import {
  loginWithSession,
  registerWithSession,
  logoutSession,
  getCurrentSessionUser,
  type SessionUser,
} from "@/lib/auth/session-client";

interface AuthContextType {
  user: SessionUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function SessionAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    try {
      const user = await getCurrentSessionUser();
      setUser(user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const login = async (email: string, password: string) => {
    const user = await loginWithSession(email, password);
    setUser(user);
  };

  const register = async (name: string, email: string, password: string) => {
    const user = await registerWithSession(name, email, password);
    setUser(user);
  };

  const logout = async () => {
    await logoutSession();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, refresh }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useSessionAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useSessionAuth must be used within SessionAuthProvider");
  }
  return context;
}
```

---

## Testing Checklist

- [ ] Login flow works and creates session
- [ ] Register flow works and creates session
- [ ] Logout flow works and clears session
- [ ] Protected routes redirect unauthenticated users
- [ ] API calls automatically include session cookie
- [ ] Session persists across page refreshes
- [ ] Session expires after configured time
- [ ] Admin-only routes check role correctly
- [ ] Seller routes check role correctly
- [ ] 401 errors redirect to login page

---

## Common Pitfalls

### 1. **Forgetting withCredentials**

Make sure your axios instance has `withCredentials: true`:

```typescript
axios.create({
  withCredentials: true, // Required for cookies
});
```

### 2. **CORS Issues**

If frontend and backend are on different domains:

```typescript
// next.config.js
headers: [
  { key: "Access-Control-Allow-Credentials", value: "true" },
  { key: "Access-Control-Allow-Origin", value: process.env.FRONTEND_URL },
];
```

### 3. **Mixing Old and New Auth**

Don't mix token-based and session-based auth. Choose one system.

### 4. **Not Handling 401 Errors**

Make sure to redirect to login on 401:

```typescript
if (error.response?.status === 401) {
  router.push("/login");
}
```

---

## Next Steps

1. **Test locally** - Make sure everything works in development
2. **Update all components** - Replace token logic with session logic
3. **Remove old code** - Clean up token storage and manual headers
4. **Setup Redis** - For production session storage
5. **Deploy** - Test in production environment

---

Need help? Check:

- `/docs/SESSION_AUTH_MIGRATION.md` - Complete migration guide
- `/src/lib/auth/session.ts` - Session management
- `/src/lib/auth/session-client.ts` - Client utilities
