# React Contexts

This folder contains React Context providers for global state management across the application.

## Authentication

### AuthContext.tsx

**Exports:** `AuthProvider`, `useAuth()`

**Purpose:** Global authentication state and user session management.

**Context Value:**

- `user: UserFE | null` - Current authenticated user
- `loading: boolean` - Auth initialization loading
- `isAuthenticated: boolean` - Whether user is logged in
- `isAdmin: boolean` - Is user an admin
- `isSeller: boolean` - Is user a seller
- `isAdminOrSeller: boolean` - Is user admin or seller
- `login(email, password, rememberMe?): Promise<AuthResponse>` - Email/password login
- `loginWithGoogle(idToken, userData?): Promise<GoogleAuthResponse>` - Google OAuth login
- `register(data): Promise<AuthResponse>` - User registration
- `logout(): Promise<void>` - Sign out user
- `refreshUser(): Promise<void>` - Refresh user data from server

**Features:**

- Server-side session validation
- Cached user for immediate UI updates
- Automatic token refresh
- Session persistence with remember me
- Role-based authentication helpers
- Google OAuth integration
- Real-time user data sync

**Usage:**

```typescript
const { user, isAuthenticated, login, logout } = useAuth();
```

---

### LoginRegisterContext.tsx

**Exports:** `LoginRegisterProvider`, `useLoginRegister()`

**Purpose:** Manages login and registration form state with validation.

**Context Value:**

**Login Form:**

- `loginForm: UseFormStateReturn<LoginFormData>` - Login form state
- `loginPassword: UsePasswordFieldStateReturn` - Password visibility toggle
- `loginLoading: boolean` - Login operation loading
- `loginError: string | null` - Login error message
- `handleLoginSubmit(e): Promise<void>` - Login form submission
- `resetLoginForm(): void` - Reset login form

**Register Form:**

- `registerForm: UseFormStateReturn<RegisterFormData>` - Register form state
- `registerPassword: UsePasswordFieldStateReturn` - Password visibility/strength
- `registerLoading: boolean` - Register operation loading
- `registerError: string | null` - Register error message
- `handleRegisterSubmit(e): Promise<void>` - Register form submission
- `resetRegisterForm(): void` - Reset register form

**Features:**

- Centralized form state management
- Built-in validation
- Password strength indicator
- Show/hide password
- Loading states during submission
- Error handling
- Form reset functionality

**Usage:**

```typescript
const { loginForm, loginPassword, handleLoginSubmit } = useLoginRegister();
```

---

## UI & Theme

### ThemeContext.tsx

**Exports:** `ThemeProvider`, `useTheme()`

**Purpose:** Dark/light theme management with persistence.

**Context Value:**

- `theme: Theme` - Current theme ('light' | 'dark')
- `setTheme(theme): void` - Set specific theme
- `toggleTheme(): void` - Toggle between light/dark
- `isLoading: boolean` - Theme initialization loading

**Features:**

- localStorage persistence
- Immediate theme application to DOM
- No flash of wrong theme on load
- CSS class application to `<html>` element
- Meta theme-color update for mobile
- data-theme attribute for CSS selectors

**Usage:**

```typescript
const { theme, toggleTheme } = useTheme();
```

---

### GlobalSearchContext.tsx

**Exports:** `GlobalSearchProvider`, `useGlobalSearch()`

**Purpose:** Global search state for site-wide search functionality.

**Context Value:**

- `isOpen: boolean` - Search modal open state
- `openSearch(): void` - Open search modal
- `closeSearch(): void` - Close search modal
- `searchQuery: string` - Current search query
- `setSearchQuery(query): void` - Update search query
- `results: SearchResult[]` - Search results
- `loading: boolean` - Search loading state
- `performSearch(query): Promise<void>` - Execute search

**Features:**

- Global search modal control
- Debounced search
- Multi-category search (products, shops, auctions)
- Recent searches persistence
- Search history
- Keyboard shortcuts (Cmd/Ctrl + K)

---

## Feature Contexts

### ComparisonContext.tsx

**Exports:** `ComparisonProvider`, `useComparison()`

**Purpose:** Product comparison state management.

**Context Value:**

- `comparedProducts: ProductFE[]` - Products in comparison
- `addToComparison(product): void` - Add product
- `removeFromComparison(productId): void` - Remove product
- `clearComparison(): void` - Clear all products
- `isComparing(productId): boolean` - Check if product is in comparison
- `comparisonCount: number` - Number of products being compared
- `maxComparison: number` - Max products allowed (default: 4)

**Features:**

- localStorage persistence
- Max product limit
- Toast notifications
- Comparison page integration

**Usage:**

```typescript
const { addToComparison, comparedProducts, isComparing } = useComparison();
```

---

### ViewingHistoryContext.tsx

**Exports:** `ViewingHistoryProvider`, `useViewingHistory()`

**Purpose:** Track recently viewed products.

**Context Value:**

- `history: ProductFE[]` - Recently viewed products
- `addToHistory(product): void` - Add product to history
- `clearHistory(): void` - Clear all history
- `historyCount: number` - Number of items in history
- `maxHistory: number` - Max items to keep (default: 20)

**Features:**

- Automatic tracking on product view
- localStorage persistence
- Duplicate prevention (move to front if already viewed)
- FIFO when limit reached
- Privacy-friendly (stored locally)

**Usage:**

```typescript
const { history, addToHistory } = useViewingHistory();
```

---

### UploadContext.tsx

**Exports:** `UploadProvider`, `useUpload()`

**Purpose:** Global file upload state management.

**Context Value:**

- `uploads: Upload[]` - Active uploads
- `startUpload(file, options): string` - Start new upload, returns upload ID
- `cancelUpload(uploadId): void` - Cancel upload
- `removeUpload(uploadId): void` - Remove from list
- `getUpload(uploadId): Upload | undefined` - Get upload by ID
- `activeUploadsCount: number` - Number of active uploads

**Upload Object:**

- `id: string` - Unique upload ID
- `file: File` - File being uploaded
- `progress: number` - Upload progress 0-100
- `status: 'pending' | 'uploading' | 'completed' | 'error'`
- `url?: string` - Uploaded file URL (when completed)
- `error?: string` - Error message (if failed)

**Features:**

- Multiple concurrent uploads
- Progress tracking
- Cancel support
- Error handling
- Upload notification toasts
- Cleanup on unmount

**Usage:**

```typescript
const { startUpload, activeUploadsCount } = useUpload();
const uploadId = await startUpload(file, { folder: "products" });
```

---

## Common Patterns

### Context Provider Hierarchy

Wrap your app with providers in this order (outer to inner):

```tsx
<AuthProvider>
  <ThemeProvider>
    <ComparisonProvider>
      <ViewingHistoryProvider>
        <UploadProvider>
          <App />
        </UploadProvider>
      </ViewingHistoryProvider>
    </ComparisonProvider>
  </ThemeProvider>
</AuthProvider>
```

### Custom Hook Pattern

All contexts export a custom hook for easier usage:

```typescript
// Instead of:
const context = useContext(AuthContext);

// Use:
const { user, login } = useAuth();
```

### Error Handling

All hooks throw if used outside their provider:

```typescript
if (!context) {
  throw new Error("useAuth must be used within AuthProvider");
}
```

### TypeScript

All contexts are fully typed with TypeScript interfaces:

```typescript
interface AuthContextType {
  user: UserFE | null;
  login: (email: string, password: string) => Promise<void>;
  // ...
}
```

### Performance

- Contexts use `useMemo` for stable context values
- Functions use `useCallback` to prevent re-renders
- Child components use `React.memo` when appropriate

### Persistence

Several contexts persist state:

- **AuthContext**: Session tokens in cookies/localStorage
- **ThemeContext**: Theme preference in localStorage
- **ComparisonContext**: Compared products in localStorage
- **ViewingHistoryContext**: Viewed products in localStorage

### Server-Side Rendering (SSR)

All contexts handle SSR appropriately:

- Check for `typeof window !== 'undefined'`
- Provide default values for server rendering
- Hydrate from localStorage on client mount

---

## Context Best Practices

### When to Use Context

- Truly global state (auth, theme, etc.)
- State needed by many components
- Avoid prop drilling
- Cross-cutting concerns

### When NOT to Use Context

- Local component state (use useState)
- State needed by 1-2 components (use props)
- Frequently changing state (consider alternatives)
- Large lists/tables (use proper state management)

### Performance Considerations

- Split contexts by concern (don't create mega-context)
- Use multiple small contexts instead of one large
- Memoize context values
- Use selectors for specific data

### Testing

- Export context types for testing
- Create mock providers for tests
- Test hooks in isolation with custom providers

---

## Future Context Candidates

### CheckoutContext

Comprehensive checkout flow state:

- Cart items
- Shipping address
- Payment method
- Order review
- Submission status

### NotificationContext

Toast notifications and alerts:

- Show notification
- Queue notifications
- Auto-dismiss
- Custom positioning

### ModalContext

Global modal management:

- Open/close modals
- Modal stack
- Modal data passing
- Background scroll lock

### FeatureFlagContext

Feature flag management:

- Check feature availability
- A/B testing support
- Gradual rollout
