# API Client Guide

A comprehensive guide to using the centralized API client for all HTTP requests in the application.

## Table of Contents

1. [Overview](#overview)
2. [Basic Usage](#basic-usage)
3. [API Endpoints](#api-endpoints)
4. [React Hooks](#react-hooks)
5. [Error Handling](#error-handling)
6. [Advanced Usage](#advanced-usage)
7. [Best Practices](#best-practices)

---

## Overview

The API client provides a centralized way to make HTTP requests with:

- ✅ **Consistent error handling** - All errors are parsed and typed
- ✅ **Automatic authentication** - Session cookies included automatically
- ✅ **Type safety** - TypeScript types for requests and responses
- ✅ **Request timeout** - Configurable timeout for all requests
- ✅ **Query parameters** - Easy URL query param handling
- ✅ **File uploads** - Built-in support for FormData
- ✅ **React hooks** - Ready-to-use hooks for queries and mutations

**Files:**
- `src/lib/api-client.ts` - API client class
- `src/constants/api-endpoints.ts` - API endpoint constants
- `src/hooks/useApiQuery.ts` - React hook for fetching data
- `src/hooks/useApiMutation.ts` - React hook for mutations

---

## Basic Usage

### Importing

```tsx
import { apiClient, API_ENDPOINTS, ApiClientError } from '@/lib/api-client';
```

### GET Request

```tsx
// Fetch user profile
const profile = await apiClient.get(API_ENDPOINTS.USER.PROFILE);
console.log(profile); // { name: 'John', email: 'john@example.com', ... }
```

### POST Request

```tsx
// Register new user
const result = await apiClient.post(API_ENDPOINTS.AUTH.REGISTER, {
  email: 'user@example.com',
  password: 'SecurePass123!',
  name: 'John Doe'
});
```

### PUT Request

```tsx
// Update user profile
const updated = await apiClient.put(API_ENDPOINTS.USER.UPDATE_PROFILE, {
  name: 'Jane Doe',
  phone: '+1234567890'
});
```

### DELETE Request

```tsx
// Delete user account
await apiClient.delete(API_ENDPOINTS.USER.DELETE_ACCOUNT);
```

### Query Parameters

```tsx
// GET /api/trips?status=active&limit=10
const trips = await apiClient.get('/api/trips', {
  params: {
    status: 'active',
    limit: 10
  }
});
```

### File Upload

```tsx
// Upload profile picture
const formData = new FormData();
formData.append('file', file);
formData.append('type', 'avatar');

const result = await apiClient.upload('/api/user/upload', formData);
```

---

## API Endpoints

All API endpoints are defined as constants in `src/constants/api-endpoints.ts`.

### Available Endpoints

```tsx
import { API_ENDPOINTS } from '@/lib/api-client';

// Authentication
API_ENDPOINTS.AUTH.REGISTER           // /api/auth/register
API_ENDPOINTS.AUTH.LOGIN              // /api/auth/login
API_ENDPOINTS.AUTH.LOGOUT             // /api/auth/logout
API_ENDPOINTS.AUTH.VERIFY_EMAIL       // /api/auth/verify-email
API_ENDPOINTS.AUTH.FORGOT_PASSWORD    // /api/auth/forgot-password
API_ENDPOINTS.AUTH.RESET_PASSWORD     // /api/auth/reset-password

// User
API_ENDPOINTS.USER.PROFILE            // /api/user/profile
API_ENDPOINTS.USER.CHANGE_PASSWORD    // /api/user/change-password
API_ENDPOINTS.USER.UPDATE_PROFILE     // /api/user/profile
API_ENDPOINTS.USER.DELETE_ACCOUNT     // /api/user/account
```

### Adding New Endpoints

Edit `src/constants/api-endpoints.ts`:

```tsx
export const API_ENDPOINTS = {
  // ... existing endpoints
  
  TRIPS: {
    LIST: '/api/trips',
    CREATE: '/api/trips',
    GET: (id: string) => `/api/trips/${id}`,
    UPDATE: (id: string) => `/api/trips/${id}`,
    DELETE: (id: string) => `/api/trips/${id}`,
  },
} as const;
```

Usage:

```tsx
// List all trips
const trips = await apiClient.get(API_ENDPOINTS.TRIPS.LIST);

// Get specific trip
const trip = await apiClient.get(API_ENDPOINTS.TRIPS.GET('trip-123'));

// Create trip
const newTrip = await apiClient.post(API_ENDPOINTS.TRIPS.CREATE, { name: 'Bali 2026' });
```

---

## React Hooks

### useApiQuery - Fetch Data

Use for GET requests to fetch and cache data.

```tsx
import { useApiQuery } from '@/hooks/useApiQuery';
import { apiClient, API_ENDPOINTS } from '@/lib/api-client';

function ProfilePage() {
  const { data, isLoading, error, refetch } = useApiQuery({
    queryKey: ['profile'],
    queryFn: () => apiClient.get(API_ENDPOINTS.USER.PROFILE),
    enabled: true, // Enable/disable query
  });

  if (isLoading) return <Spinner />;
  if (error) return <Alert type="error">{error.message}</Alert>;

  return (
    <div>
      <h1>{data.name}</h1>
      <p>{data.email}</p>
      <button onClick={refetch}>Refresh</button>
    </div>
  );
}
```

**Options:**
- `queryKey` - Unique identifier for caching
- `queryFn` - Function that returns a Promise
- `enabled` - Enable/disable automatic fetching (default: `true`)
- `refetchInterval` - Auto-refetch interval in ms (optional)
- `onSuccess` - Callback on successful fetch
- `onError` - Callback on error

### useApiMutation - Mutate Data

Use for POST, PUT, PATCH, DELETE requests to modify data.

```tsx
import { useApiMutation } from '@/hooks/useApiMutation';
import { apiClient, API_ENDPOINTS } from '@/lib/api-client';

function ChangePasswordForm() {
  const { mutate, isLoading, error } = useApiMutation({
    mutationFn: (data) => apiClient.post(API_ENDPOINTS.USER.CHANGE_PASSWORD, data),
    onSuccess: () => {
      toast.success('Password changed successfully!');
      router.push('/profile');
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await mutate({
      currentPassword: 'old123',
      newPassword: 'new456'
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <Alert type="error">{error.message}</Alert>}
      <input type="password" name="currentPassword" />
      <input type="password" name="newPassword" />
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Saving...' : 'Change Password'}
      </button>
    </form>
  );
}
```

**Options:**
- `mutationFn` - Function that performs the mutation
- `onSuccess` - Callback on successful mutation
- `onError` - Callback on error
- `onSettled` - Callback that runs after success or error

---

## Error Handling

### ApiClientError

All API errors are wrapped in `ApiClientError` with consistent structure:

```tsx
try {
  const data = await apiClient.post(API_ENDPOINTS.AUTH.REGISTER, userData);
} catch (error) {
  if (error instanceof ApiClientError) {
    console.error('Status:', error.status);     // HTTP status code
    console.error('Message:', error.message);   // Error message
    console.error('Data:', error.data);         // Additional error data
  }
}
```

### Status Codes

```tsx
import { ApiClientError } from '@/lib/api-client';

try {
  await apiClient.get(API_ENDPOINTS.USER.PROFILE);
} catch (error) {
  if (error instanceof ApiClientError) {
    switch (error.status) {
      case 401:
        // Unauthorized - redirect to login
        router.push('/auth/login');
        break;
      case 403:
        // Forbidden - show access denied
        toast.error('Access denied');
        break;
      case 404:
        // Not found
        toast.error('Resource not found');
        break;
      case 408:
        // Request timeout
        toast.error('Request timed out. Please try again.');
        break;
      case 422:
        // Validation error
        setFieldErrors(error.data?.errors);
        break;
      case 500:
        // Server error
        toast.error('Server error. Please try again later.');
        break;
      default:
        toast.error(error.message);
    }
  }
}
```

### Global Error Handler

```tsx
// src/lib/error-handler.ts
import { ApiClientError } from '@/lib/api-client';
import { toast } from 'react-hot-toast';

export function handleApiError(error: unknown) {
  if (error instanceof ApiClientError) {
    // Show user-friendly message
    toast.error(error.message);
    
    // Log for debugging
    console.error('API Error:', {
      status: error.status,
      message: error.message,
      data: error.data
    });
    
    // Handle specific cases
    if (error.status === 401) {
      // Redirect to login
      window.location.href = '/auth/login';
    }
  } else {
    toast.error('An unexpected error occurred');
    console.error('Unexpected error:', error);
  }
}
```

---

## Advanced Usage

### Custom Headers

```tsx
await apiClient.post(API_ENDPOINTS.USER.PROFILE, data, {
  headers: {
    'X-Custom-Header': 'value'
  }
});
```

### Custom Timeout

```tsx
// 10 second timeout
await apiClient.get(API_ENDPOINTS.USER.PROFILE, {
  timeout: 10000
});
```

### TypeScript Types

```tsx
interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

// Type-safe API call
const profile = await apiClient.get<UserProfile>(API_ENDPOINTS.USER.PROFILE);
console.log(profile.name); // TypeScript knows this is a string
```

### Conditional Queries

```tsx
const userId = session?.user?.id;

const { data } = useApiQuery({
  queryKey: ['user', userId],
  queryFn: () => apiClient.get(`/api/users/${userId}`),
  enabled: !!userId, // Only fetch if userId exists
});
```

### Dependent Queries

```tsx
function UserTrips({ userId }: { userId: string }) {
  // First, fetch user
  const { data: user } = useApiQuery({
    queryKey: ['user', userId],
    queryFn: () => apiClient.get(`/api/users/${userId}`),
  });

  // Then, fetch trips (only when user is loaded)
  const { data: trips } = useApiQuery({
    queryKey: ['trips', user?.id],
    queryFn: () => apiClient.get(`/api/trips?userId=${user!.id}`),
    enabled: !!user, // Wait for user to load
  });

  return <TripsList trips={trips} />;
}
```

### Optimistic Updates

```tsx
const { mutate } = useApiMutation({
  mutationFn: (data) => apiClient.put(API_ENDPOINTS.USER.PROFILE, data),
  onMutate: (newData) => {
    // Update UI optimistically
    setProfile(prev => ({ ...prev, ...newData }));
  },
  onError: (error, variables) => {
    // Revert on error
    refetch();
  }
});
```

---

## Best Practices

### ✅ DO

```tsx
// ✅ Use API_ENDPOINTS constants
await apiClient.get(API_ENDPOINTS.USER.PROFILE);

// ✅ Use TypeScript types
interface User { name: string; email: string; }
const user = await apiClient.get<User>(API_ENDPOINTS.USER.PROFILE);

// ✅ Handle errors properly
try {
  await apiClient.post(API_ENDPOINTS.AUTH.REGISTER, data);
} catch (error) {
  if (error instanceof ApiClientError) {
    handleError(error);
  }
}

// ✅ Use hooks for data fetching in components
const { data, isLoading } = useApiQuery({
  queryKey: ['profile'],
  queryFn: () => apiClient.get(API_ENDPOINTS.USER.PROFILE)
});

// ✅ Provide feedback during loading
{isLoading ? <Spinner /> : <ProfileView data={data} />}
```

### ❌ DON'T

```tsx
// ❌ Don't use hardcoded URLs
await apiClient.get('/api/user/profile'); // Use API_ENDPOINTS.USER.PROFILE

// ❌ Don't use fetch directly
await fetch('/api/auth/register', { /* ... */ }); // Use apiClient

// ❌ Don't ignore errors
await apiClient.post(endpoint, data); // Always use try/catch

// ❌ Don't duplicate request logic
// Use useApiQuery/useApiMutation instead of useEffect + useState

// ❌ Don't forget loading states
const data = await apiClient.get(endpoint);
return <div>{data.name}</div>; // What if it's still loading?
```

### Migration from fetch/axios

**Before:**
```tsx
const [data, setData] = useState(null);
const [loading, setLoading] = useState(false);

useEffect(() => {
  setLoading(true);
  fetch('/api/user/profile')
    .then(res => res.json())
    .then(data => setData(data))
    .catch(err => console.error(err))
    .finally(() => setLoading(false));
}, []);
```

**After:**
```tsx
const { data, isLoading } = useApiQuery({
  queryKey: ['profile'],
  queryFn: () => apiClient.get(API_ENDPOINTS.USER.PROFILE)
});
```

---

## Testing

### Mocking API Client

```tsx
// tests/mocks/api-client.ts
import { vi } from 'vitest';

export const mockApiClient = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
};

// tests/ProfilePage.test.tsx
import { mockApiClient } from './mocks/api-client';

vi.mock('@/lib/api-client', () => ({
  apiClient: mockApiClient,
  API_ENDPOINTS: { USER: { PROFILE: '/api/user/profile' } }
}));

test('displays user profile', async () => {
  mockApiClient.get.mockResolvedValue({ name: 'John', email: 'john@test.com' });
  
  render(<ProfilePage />);
  
  await waitFor(() => {
    expect(screen.getByText('John')).toBeInTheDocument();
  });
});
```

---

## Summary

The API client system provides:

1. **Centralized requests** - All API calls through one interface
2. **Type safety** - Full TypeScript support
3. **Error handling** - Consistent error structure
4. **React integration** - Ready-to-use hooks
5. **Best practices** - Timeout, authentication, query params

**Key files to remember:**
- `src/lib/api-client.ts` - Main API client
- `src/constants/api-endpoints.ts` - Endpoint constants
- `src/hooks/useApiQuery.ts` - Fetch data hook
- `src/hooks/useApiMutation.ts` - Mutate data hook

For more examples, see the [Quick Reference](QUICK_REFERENCE.md).
