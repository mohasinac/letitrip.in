# Components Index

## Error Handling

### ErrorBoundary
**File**: [error-boundary.tsx](error-boundary.tsx)
**Status**: ✅ Complete

React 19 Error Boundary implementation with:
- Class component with componentDidCatch lifecycle
- Error logging integration via logServiceError
- Reset functionality (resetErrorBoundary method)
- Default error fallback UI with error display
- Custom fallback support via props
- Development mode error details (stack trace)
- Section-specific error boundary wrapper

**Usage**:
```tsx
// Global app wrapper
<ErrorBoundary>
  <App />
</ErrorBoundary>

// With custom fallback
<ErrorBoundary fallback={(error, reset) => <CustomUI error={error} onReset={reset} />}>
  <Component />
</ErrorBoundary>

// Section-specific boundary
<SectionErrorBoundary sectionName="Product List">
  <ProductList />
</SectionErrorBoundary>
```

**Features**:
- Integrates with typed error system (isAppError)
- Error logger integration
- Graceful error recovery with retry
- User-friendly error messages
- Development vs production modes
- Go home and contact support actions
