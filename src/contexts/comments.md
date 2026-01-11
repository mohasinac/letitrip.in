# React Contexts - Future Refactoring Notes

## General Improvements

### 1. Context Optimization

- **Context Splitting**: Split large contexts into smaller, focused contexts to prevent unnecessary re-renders
  - Example: Split AuthContext into AuthStateContext and AuthActionsContext
  - Consumers only re-render when their specific slice changes
- **Selector Pattern**: Implement selector hooks to read specific values
  ```typescript
  const userId = useAuthSelector((state) => state.user?.id);
  ```
- **Context Memoization**: More aggressive memoization of context values
- **Provider Nesting**: Create composite provider to simplify app wrapping

### 2. AuthContext Enhancements ✅

- ✅ **Token Management**: Better token refresh logic with retry (Task 11.4 - January 11, 2026)
  - ✅ Automatic token refresh before expiry (50 minutes, 10 minutes before expiration)
  - ✅ Exponential backoff retry logic (3 retries with increasing delays)
  - ✅ Background token refresh without disrupting user
  - ✅ Graceful handling of token expiration
  - ✅ Auto-logout after max retries exceeded
  - ✅ Token refresh on login, register, loginWithGoogle
  - ✅ Clear refresh timer on logout
- **Session Management**: More robust session handling
  - Configurable session timeout warnings
  - Auto-logout on inactivity
  - Multi-tab synchronization
- ✅ **Permission System**: Move from role-based to permission-based (Task 2.4 - January 10, 2026)
  ```typescript
  const canEditProduct = usePermission("products.edit");
  ```
- **Impersonation**: Admin user impersonation for support
- ✅ **MFA Support**: Multi-factor authentication flow (Task 11.1-11.2 - January 11, 2026)
- ✅ **Device Management**: Track and manage user devices/sessions (Task 11.3 - January 11, 2026)

### 3. LoginRegisterContext

- **Form Library Integration**: Consider React Hook Form integration
  - Reduce custom form state code
  - Better validation integration
- **Social Auth**: Extend for more providers (Facebook, Apple, etc.)
- **Passwordless**: Magic link and OTP-only login
- **Progressive Registration**: Multi-step registration wizard
- **Email Verification**: Built-in email verification flow
- **Password Recovery**: Integrated forgot password flow

### 4. ThemeContext

- **System Theme**: Add 'system' option to follow OS preference
  ```typescript
  theme: "light" | "dark" | "system";
  ```
- **Custom Themes**: Support for custom color schemes
- **Theme Variants**: Multiple dark/light variants
  - High contrast mode
  - Reduced motion mode
  - Color blind friendly modes
- **CSS Variables**: Generate CSS custom properties from theme
- **Theme Transitions**: Smooth transitions between themes
- **Per-route Themes**: Different themes for different sections

### 5. New Context: NotificationContext

Create centralized notification management:

```typescript
const { notify, dismiss, clearAll } = useNotification();
notify({ message, type: "success", duration: 3000 });
```

Features needed:

- Toast notifications
- Queue management
- Priority levels
- Grouping similar notifications
- Action buttons in notifications
- Persistent notifications
- Sound/vibration options

### 6. New Context: ModalContext

Global modal state management:

```typescript
const { openModal, closeModal } = useModal();
openModal("product-details", { productId: "123" });
```

Features needed:

- Modal registry
- Modal stacking
- Background scroll lock
- Focus trap
- Keyboard navigation
- Route synchronization
- Modal animations

### 7. New Context: FeatureFlagContext

Feature flag management:

```typescript
const showNewCheckout = useFeatureFlag("new-checkout-flow");
const { variant } = useABTest("checkout-experiment");
```

Features needed:

- Remote config integration
- A/B testing support
- User targeting
- Gradual rollouts
- Override for testing
- Analytics integration

## Architecture Improvements

### Context Composition

Create composite contexts for related functionality:

```typescript
<AppProviders>{/* Automatically includes all providers */}</AppProviders>
```

### Context DevTools

- Build React DevTools extension for contexts
- State inspector
- Time-travel debugging
- Action logging

### Context Middleware

Add middleware pattern for side effects:

```typescript
const authMiddleware = (action, state) => {
  if (action.type === "LOGIN_SUCCESS") {
    analytics.track("User Logged In");
  }
};
```

### Lazy Context Providers

Load context providers only when needed:

```typescript
const UploadProvider = lazy(() => import("./UploadContext"));
```

## Performance Optimizations

### Render Optimization

- **Bail Out**: Use same reference when state doesn't change
- **Split Contexts**: Separate data and actions
- **Use Zustand/Jotai**: Consider lighter alternatives for some contexts
- **Context Selectors**: Fine-grained subscriptions

### Memory Management

- **Cleanup**: Better cleanup on unmount
- **Weak Maps**: Use WeakMap for caches
- **Garbage Collection**: Help GC with null assignments

### Bundle Size

- **Tree Shaking**: Ensure contexts are tree-shakeable
- **Code Splitting**: Split large contexts
- **Lazy Evaluation**: Lazy load heavy dependencies

## Testing Improvements

### Test Utilities

- Create mock providers for each context
- Test helpers for common scenarios
- Integration test utilities

```typescript
const { result } = renderHook(() => useAuth(), {
  wrapper: createMockAuthProvider({ user: mockUser }),
});
```

### Test Coverage

- Unit tests for each context
- Integration tests for context interactions
- E2E tests for critical flows

## Security Enhancements

### AuthContext Security

- **Token Encryption**: Encrypt tokens in storage
- **CSRF Protection**: CSRF token management
- **XSS Prevention**: Sanitize user data
- **Rate Limiting**: Client-side rate limiting for auth attempts
- **Audit Logging**: Log all auth events
- **Suspicious Activity**: Detect and block suspicious patterns

### Data Privacy

- **PII Handling**: Proper handling of personal data
- **Data Minimization**: Only store necessary data in context
- **Consent Management**: GDPR compliance
- **Data Deletion**: Right to be forgotten

## Developer Experience

### Better Error Messages

- Descriptive error messages when hooks used incorrectly
- Helpful suggestions for common mistakes
- Stack traces in development

### TypeScript Improvements

- Stricter types
- Better inference
- Branded types for IDs
- Utility types for common patterns

### Documentation

- Add JSDoc comments to all exports
- Usage examples for each context
- Migration guides for breaking changes
- Performance best practices

## Accessibility

### ARIA Integration

- Announce auth state changes
- Announce theme changes
- Announce notifications
- Focus management on modal open/close

### Keyboard Navigation

- Context-aware keyboard shortcuts
- Modal keyboard navigation
- Skip links for authenticated users

## Mobile Considerations

### Offline Support

- Offline mode detection in contexts
- Queue actions for when online
- Sync state when connection restored

### Performance

- Lazy load contexts on mobile
- Reduce localStorage usage
- Optimize for slow networks

## Integration Improvements

### Analytics

- Track context state changes
- User flow analytics
- Error tracking
- Performance monitoring

### Backend Sync

- Real-time state sync with backend
- Conflict resolution
- Optimistic updates with rollback
- WebSocket integration

## Migration Strategy

### Breaking Changes

- Provide codemod scripts
- Deprecation warnings
- Backward compatibility layer
- Migration documentation

### Gradual Adoption

- Feature flags for new context versions
- Parallel running of old and new
- Incremental migration path

## Future Features

### Context Persistence

- Save context state to backend
- Restore state across devices
- Time-travel debugging in production

### Context Snapshots

- Save application state snapshots
- Restore from snapshot
- Share state between users (support)

### Context Replay

- Record context changes
- Replay user sessions
- Debug production issues

### Collaborative Features

- Shared state between users
- Real-time collaboration
- Presence indicators
- CRDT integration

## Anti-patterns to Avoid

### Performance Anti-patterns

- ❌ Putting everything in one mega-context
- ❌ Not memoizing context values
- ❌ Frequent updates to context
- ❌ Large objects in context

### Architecture Anti-patterns

- ❌ Business logic in context
- ❌ API calls directly in context
- ❌ Tight coupling to specific implementations
- ❌ Global state for local concerns

### Testing Anti-patterns

- ❌ Not mocking contexts in tests
- ❌ Testing implementation details
- ❌ Brittle tests dependent on context structure

## Best Practices to Follow

### Do's

- ✅ Keep contexts focused and single-purpose
- ✅ Memoize context values and callbacks
- ✅ Provide default values
- ✅ Handle SSR appropriately
- ✅ Clean up effects
- ✅ Use TypeScript
- ✅ Document all contexts
- ✅ Test contexts thoroughly

### Don'ts

- ❌ Don't use context for frequently changing data
- ❌ Don't bypass providers in tests
- ❌ Don't store derived state
- ❌ Don't use context as event bus
- ❌ Don't put form state in context (usually)
