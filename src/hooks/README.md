# Hooks

> Custom React hooks for common functionality throughout the application

## Overview

This directory contains custom React hooks that encapsulate reusable logic for state management, API interactions, authentication, form handling, and UI interactions.

## Import

All hooks are exported through the barrel file:

```typescript
import { useAuth, useApiQuery, useProfile, useForm } from "@/hooks";
```

## Categories

### 🔐 Authentication Hooks

| Hook                      | Purpose                     | Returns                              |
| ------------------------- | --------------------------- | ------------------------------------ |
| `useAuth()`               | Access authentication state | `{ user, loading, logout }`          |
| `useLogin()`              | Handle user login           | `{ login, loading, error }`          |
| `useRegister()`           | Handle user registration    | `{ register, loading, error }`       |
| `useVerifyEmail()`        | Verify email address        | `{ verify, loading, error }`         |
| `useResendVerification()` | Resend verification email   | `{ resend, loading, error }`         |
| `useForgotPassword()`     | Request password reset      | `{ sendResetEmail, loading, error }` |
| `useResetPassword()`      | Reset password with token   | `{ resetPassword, loading, error }`  |

**Example:**

```typescript
import { useAuth, useLogin } from "@/hooks";

function LoginPage() {
  const { login, loading, error } = useLogin();
  const handleSubmit = async (credentials) => {
    await login(credentials);
  };
}
```

---

### 🌐 API Hooks

| Hook                                | Purpose                                 | Returns                               |
| ----------------------------------- | --------------------------------------- | ------------------------------------- |
| `useApiQuery(endpoint, options)`    | Fetch data from API with caching        | `{ data, loading, error, refetch }`   |
| `useApiMutation(endpoint, options)` | Mutate data via API (POST, PUT, DELETE) | `{ mutate, loading, error, success }` |

**Example:**

```typescript
import { useApiQuery, useApiMutation } from '@/hooks';
import { API_ENDPOINTS } from '@/constants';

function UsersList() {
  const { data: users, loading } = useApiQuery(API_ENDPOINTS.USERS.LIST);
  const { mutate: deleteUser } = useApiMutation(API_ENDPOINTS.USERS.DELETE);

  return (
    // render users...
  );
}
```

---

### 👤 Profile Hooks

| Hook             | Purpose               | Returns                                                                               |
| ---------------- | --------------------- | ------------------------------------------------------------------------------------- |
| `useProfile()`   | Manage user profile   | `{ profile, updateProfile, updateAvatar, loading, error }`                            |
| `useAddresses()` | Manage user addresses | `{ addresses, addAddress, updateAddress, deleteAddress, setDefaultAddress, loading }` |

**Example:**

```typescript
import { useProfile } from "@/hooks";

function ProfilePage() {
  const { profile, updateProfile, loading } = useProfile();

  const handleSave = async (updates) => {
    await updateProfile(updates);
  };
}
```

---

### 🔒 Session Management Hooks

| Hook                      | Purpose                                | Parameters       | Returns                         |
| ------------------------- | -------------------------------------- | ---------------- | ------------------------------- |
| `useAdminSessions()`      | Admin view of all active sessions      | -                | `{ sessions, loading, error }`  |
| `useUserSessions(userId)` | View sessions for specific user        | `userId: string` | `{ sessions, loading, error }`  |
| `useMySessions()`         | View current user's sessions           | -                | `{ sessions, loading, error }`  |
| `useRevokeSession()`      | Revoke a session (admin)               | -                | `{ revoke, loading, error }`    |
| `useRevokeMySession()`    | Revoke own session                     | -                | `{ revoke, loading, error }`    |
| `useRevokeUserSessions()` | Revoke all sessions for a user (admin) | -                | `{ revokeAll, loading, error }` |

---

### 📊 Admin Hooks

| Hook              | Purpose                          | Returns                              |
| ----------------- | -------------------------------- | ------------------------------------ |
| `useAdminStats()` | Fetch admin dashboard statistics | `{ stats, loading, error, refresh }` |

---

### 📋 Form Hooks

| Hook                                       | Purpose                               | Parameters                                          | Returns                                                                                         |
| ------------------------------------------ | ------------------------------------- | --------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `useForm(initialValues, validationSchema)` | Form state management with validation | `initialValues: object`, `validationSchema: object` | `{ values, errors, touched, handleChange, handleBlur, handleSubmit, setFieldValue, resetForm }` |
| `useFormState(initial)`                    | Track form dirty state                | `initial: object`                                   | `{ isDirty, setIsDirty, resetDirty }`                                                           |

**Example:**

```typescript
import { useForm } from '@/hooks';
import { isValidEmail, meetsPasswordRequirements } from '@/utils';

function RegisterForm() {
  const { values, errors, handleChange, handleSubmit } = useForm(
    { email: '', password: '' },
    {
      email: (value) => isValidEmail(value),
      password: (value) => meetsPasswordRequirements(value)
    }
  );

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="email"
        value={values.email}
        onChange={handleChange}
      />
      {errors.email && <span>{errors.email}</span>}
    </form>
  );
}
```

---

### 👆 Gesture Hooks

| Hook                                 | Purpose                       | Parameters                                                | Returns                    |
| ------------------------------------ | ----------------------------- | --------------------------------------------------------- | -------------------------- |
| `useSwipe(ref, callbacks, options)`  | Detect swipe gestures         | `ref: RefObject`, `callbacks: object`, `options?: object` | `{ isSwiping, direction }` |
| `useGesture(ref, handlers, options)` | Detect multiple gesture types | `ref: RefObject`, `handlers: object`, `options?: object`  | `{ activeGesture }`        |
| `useLongPress(callback, options)`    | Detect long press gesture     | `callback: Function`, `options?: object`                  | `{ handlers }`             |

**Example:**

```typescript
import { useSwipe } from "@/hooks";

function ImageCarousel() {
  const containerRef = useRef(null);
  const { isSwiping, direction } = useSwipe(
    containerRef,
    {
      onSwipeLeft: () => nextImage(),
      onSwipeRight: () => prevImage(),
    },
    { threshold: 50 },
  );
}
```

---

### 🖱️ UI Interaction Hooks

| Hook                                        | Purpose                       | Parameters                                                    | Returns |
| ------------------------------------------- | ----------------------------- | ------------------------------------------------------------- | ------- |
| `useClickOutside(ref, callback, options)`   | Detect clicks outside element | `ref: RefObject`, `callback: Function`, `options?: object`    | -       |
| `useKeyPress(targetKey, callback, options)` | Detect keyboard shortcuts     | `targetKey: string`, `callback: Function`, `options?: object` | -       |

**Example:**

```typescript
import { useClickOutside, useKeyPress } from "@/hooks";

function Dropdown() {
  const dropdownRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);

  useClickOutside(dropdownRef, () => setIsOpen(false));
  useKeyPress("Escape", () => setIsOpen(false));
}
```

---

### 📤 Storage Upload Hook

| Hook                 | Purpose                          | Returns                                       |
| -------------------- | -------------------------------- | --------------------------------------------- |
| `useStorageUpload()` | Upload files to Firebase Storage | `{ upload, uploading, progress, error, url }` |

**Options:**

- `maxSize` - Maximum file size in bytes
- `allowedTypes` - Array of allowed MIME types
- `path` - Storage path for upload
- `generateThumbnail` - Whether to generate thumbnail

**Example:**

```typescript
import { useStorageUpload } from "@/hooks";

function AvatarUpload() {
  const { upload, uploading, progress, url } = useStorageUpload();

  const handleFileSelect = async (file: File) => {
    await upload(file, {
      maxSize: 5 * 1024 * 1024, // 5MB
      allowedTypes: ["image/jpeg", "image/png"],
      path: "avatars/",
    });
  };
}
```

---

### 💬 Message Hook

| Hook           | Purpose                     | Returns                                                          |
| -------------- | --------------------------- | ---------------------------------------------------------------- |
| `useMessage()` | Display toast notifications | `{ showMessage, showSuccess, showError, showInfo, showWarning }` |

**Example:**

```typescript
import { useMessage } from "@/hooks";

function SaveButton() {
  const { showSuccess, showError } = useMessage();

  const handleSave = async () => {
    try {
      await saveData();
      showSuccess("Data saved successfully!");
    } catch (error) {
      showError("Failed to save data");
    }
  };
}
```

---

### ⚠️ Unsaved Changes Hook

| Hook                                     | Purpose                          | Parameters                                | Returns                              |
| ---------------------------------------- | -------------------------------- | ----------------------------------------- | ------------------------------------ |
| `useUnsavedChanges(hasChanges, options)` | Warn users about unsaved changes | `hasChanges: boolean`, `options?: object` | `{ showWarning, confirmNavigation }` |

**Options:**

- `message` - Warning message to display
- `enablePrompt` - Whether to show browser prompt on navigation

**Example:**

```typescript
import { useUnsavedChanges } from "@/hooks";

function EditForm() {
  const [isDirty, setIsDirty] = useState(false);

  useUnsavedChanges(isDirty, {
    message: "You have unsaved changes. Are you sure you want to leave?",
    enablePrompt: true,
  });
}
```

---

## Best Practices

### 1. Always Handle Loading States

```typescript
const { data, loading, error } = useApiQuery(endpoint);

if (loading) return <Spinner />;
if (error) return <ErrorMessage error={error} />;
return <DataDisplay data={data} />;
```

### 2. Clean Up Side Effects

```typescript
useEffect(() => {
  const subscription = eventBus.subscribe("event", handler);
  return () => subscription.unsubscribe();
}, []);
```

### 3. Use Proper Dependencies

```typescript
const { data } = useApiQuery(endpoint, {
  // Only refetch when userId changes
  deps: [userId],
});
```

### 4. Handle Errors Gracefully

```typescript
const { mutate, error } = useApiMutation(endpoint);

const handleSubmit = async (data) => {
  try {
    await mutate(data);
  } catch (err) {
    // Handle error
    console.error("Mutation failed:", err);
  }
};
```

---

## Testing

All hooks have corresponding test files in `__tests__/` directory. Run tests with:

```bash
npm test src/hooks
```

---

## Adding New Hooks

When creating a new hook:

1. **Create the hook file**: `src/hooks/useNewFeature.ts`
2. **Add JSDoc comments**: Document parameters, returns, and examples
3. **Export from barrel**: Add to `src/hooks/index.ts`
4. **Write tests**: Create `__tests__/useNewFeature.test.ts`
5. **Update this README**: Document the new hook
6. **Update GUIDE.md**: Add to the hooks reference section

---

## Related Documentation

- [GUIDE.md](../../docs/GUIDE.md) - Complete codebase reference
- [Coding Standards](../../.github/copilot-instructions.md) - Hook best practices
- [API Documentation](../lib/api-client.ts) - API client usage

---

**Last Updated**: February 8, 2026
