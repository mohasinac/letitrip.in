# Error Logging Service - Architecture Overview

## 🏗️ Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        Your Application                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────┐            │
│  │ Components  │  │ API Calls    │  │ User Actions│            │
│  │             │  │              │  │             │            │
│  │ - Forms     │  │ - fetch()    │  │ - Clicks    │            │
│  │ - Pages     │  │ - axios      │  │ - Submits   │            │
│  │ - Features  │  │ - apiClient  │  │ - Checkout  │            │
│  └──────┬──────┘  └──────┬───────┘  └──────┬──────┘            │
│         │                │                 │                     │
│         └────────────────┼─────────────────┘                     │
│                          │                                       │
│                          ▼                                       │
│         ┌────────────────────────────────┐                      │
│         │   Error Logging Service        │                      │
│         │                                 │                      │
│         │  • logError()                   │                      │
│         │  • logComponentError()          │                      │
│         │  • logNetworkError()            │                      │
│         │  • logUserActionError()         │                      │
│         │  • logPerformanceIssue()        │                      │
│         │  • batchLogErrors()             │                      │
│         └────────────────┬────────────────┘                      │
│                          │                                       │
└──────────────────────────┼───────────────────────────────────────┘
                           │
                           ▼
                  ┌────────────────┐
                  │  POST /api/    │
                  │     errors     │
                  └────────┬───────┘
                           │
                           ▼
         ┌─────────────────────────────────────┐
         │      Backend API Route               │
         │   /api/errors/route.ts               │
         │                                      │
         │  • Validate error entry              │
         │  • Log to console                    │
         │  • Save to database (optional)       │
         │  • Send to monitoring service        │
         │  • Alert on critical errors          │
         └─────────────────────────────────────┘
```

## 🔄 Error Flow

### 1. Error Occurs

```
User Action / Component Render / API Call
                ↓
        Error Thrown
                ↓
    Caught by try-catch or Error Boundary
```

### 2. Error Logged

```
        try-catch block
                ↓
    errorLoggingService.logError()
                ↓
    Enriched with context:
    - timestamp
    - URL
    - user agent
    - custom context
    - severity
    - source
```

### 3. Error Sent to Backend

```
    Error Log Entry (JSON)
                ↓
    POST /api/errors
                ↓
    Backend receives and processes
                ↓
    - Console log
    - Database storage
    - External monitoring
    - Email alerts (critical)
```

## 📊 Component Integration Points

```
┌──────────────────────────────────────────────────────────────────┐
│                     Application Root                              │
│  ┌────────────────────────────────────────────────────────┐      │
│  │  ErrorLoggingProvider (Optional)                        │      │
│  │  - Initializes global error handlers                   │      │
│  │  - Catches unhandled errors                             │      │
│  │  - Catches unhandled promise rejections                 │      │
│  └────────────────────────────────────────────────────────┘      │
│                                                                    │
│  ┌────────────────────────────────────────────────────────┐      │
│  │  ErrorBoundary                                          │      │
│  │  - Catches component errors                             │      │
│  │  - Uses errorLoggingService.logComponentError()         │      │
│  │  - Shows fallback UI                                    │      │
│  │  ┌─────────────────────────────────────────────────┐   │      │
│  │  │  Your Application Components                     │   │      │
│  │  │                                                  │   │      │
│  │  │  ┌─────────────┐  ┌─────────────┐              │   │      │
│  │  │  │  API Calls  │  │ Form Submit │              │   │      │
│  │  │  │             │  │             │              │   │      │
│  │  │  │  try {      │  │  try {      │              │   │      │
│  │  │  │    fetch()  │  │    submit() │              │   │      │
│  │  │  │  } catch {  │  │  } catch {  │              │   │      │
│  │  │  │    log()    │  │    log()    │              │   │      │
│  │  │  │  }          │  │  }          │              │   │      │
│  │  │  └─────────────┘  └─────────────┘              │   │      │
│  │  │                                                  │   │      │
│  │  └─────────────────────────────────────────────────┘   │      │
│  └────────────────────────────────────────────────────────┘      │
└──────────────────────────────────────────────────────────────────┘
```

## 🎯 Error Types & Methods

```
┌───────────────────────────────────────────────────────────────┐
│                    Error Types                                 │
├───────────────────────────────────────────────────────────────┤
│                                                                │
│  Component Errors              ──────►  logComponentError()   │
│  (React Error Boundary)                                       │
│                                                                │
│  Network/API Errors            ──────►  logNetworkError()     │
│  (fetch, axios failures)                                      │
│                                                                │
│  User Action Errors            ──────►  logUserActionError()  │
│  (form submit, checkout, etc.)                                │
│                                                                │
│  Performance Issues            ──────►  logPerformanceIssue() │
│  (slow operations)                                            │
│                                                                │
│  General Errors                ──────►  logError()            │
│  (any other error)                                            │
│                                                                │
│  Batch Logging                 ──────►  batchLogErrors()      │
│  (multiple errors at once)                                    │
│                                                                │
└───────────────────────────────────────────────────────────────┘
```

## 🔐 Data Flow & Context

```
┌──────────────────────┐
│   Error Occurs       │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────────────────────────┐
│  Error Object                             │
│  - name: string                          │
│  - message: string                       │
│  - stack?: string                        │
└──────────┬───────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────┐
│  Enriched with Context                    │
│  + timestamp                             │
│  + url (current page)                    │
│  + userAgent                             │
│  + userId (if available)                 │
│  + sessionId (if available)              │
│  + additionalContext                     │
│  + source (component/service name)       │
│  + severity (low/medium/high/critical)   │
└──────────┬───────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────┐
│  Sent to Backend as ErrorLogEntry        │
│  {                                       │
│    error: { name, message, stack },     │
│    timestamp: "2024-...",               │
│    url: "/products/123",                │
│    userAgent: "Mozilla/...",            │
│    additionalContext: { ... },          │
│    ...                                   │
│  }                                       │
└──────────────────────────────────────────┘
```

## 🛠️ Development vs Production

```
┌─────────────────────────────────────────────────────────────┐
│                   Development Mode                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ✅ Detailed console logs with 🚨 icon                      │
│  ✅ Full error stack traces                                 │
│  ✅ Component stack information                             │
│  ✅ All context data visible                                │
│  ✅ Errors sent to API (for testing)                        │
│  ✅ Helpful debugging information                           │
│                                                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                   Production Mode                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ✅ Silent console (no spam)                                │
│  ✅ Errors sent to API                                      │
│  ✅ User sees friendly error messages                       │
│  ✅ Background logging (non-blocking)                       │
│  ✅ Fails gracefully (won't break app)                      │
│  ✅ Ready for monitoring integration                        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## 📦 File Structure

```
src/lib/api/services/
├── error-logging.service.ts          ← Main service (CORE)
├── error-logging.provider.tsx        ← React provider
├── ERROR_LOGGING_README.md           ← Full documentation
├── error-logging.examples.md         ← Code examples
├── INTEGRATION_GUIDE.md              ← Quick setup guide
├── ERROR_LOGGING_SUMMARY.md          ← Implementation summary
├── ERROR_LOGGING_QUICK_REF.md        ← Quick reference
└── ERROR_LOGGING_ARCHITECTURE.md     ← This file

src/components/shared/
└── ErrorBoundary.tsx                 ← Uses error-logging.service

src/app/(backend)/api/errors/
└── route.ts                          ← Backend endpoint
```

## 🚀 Usage Flow Example

```
1. User clicks "Checkout" button
            ↓
2. handleCheckout() function executes
            ↓
3. API call fails
            ↓
4. Error caught in try-catch
            ↓
5. errorLoggingService.logUserActionError() called
            ↓
6. Error enriched with context:
   - action: 'checkout'
   - severity: 'high'
   - context: { cartTotal, itemCount, userId }
            ↓
7. POST /api/errors with error data
            ↓
8. Backend logs/stores error
            ↓
9. User sees friendly error message
            ↓
10. Developer can review error in logs/dashboard
```

## 🎨 Integration Patterns

### Pattern 1: Direct Usage

```typescript
try {
  await operation();
} catch (error) {
  await errorLoggingService.logError(error);
}
```

### Pattern 2: Wrapper Functions

```typescript
const safeOperation = withErrorLogging(operation, "MyContext");
await safeOperation();
```

### Pattern 3: Interceptors

```typescript
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    await errorLoggingService.logNetworkError(url, error);
    return Promise.reject(error);
  }
);
```

### Pattern 4: Error Boundary

```typescript
componentDidCatch(error, errorInfo) {
  errorLoggingService.logComponentError(error, errorInfo);
}
```

## 🎯 Key Benefits

✅ **Centralized** - All error logging in one place  
✅ **Consistent** - Same format for all errors  
✅ **Rich Context** - Detailed error information  
✅ **Type-Safe** - Full TypeScript support  
✅ **Production-Ready** - Environment-aware behavior  
✅ **Non-Blocking** - Async logging, won't slow down app  
✅ **Flexible** - Multiple methods for different scenarios  
✅ **Extensible** - Easy to add new features

## 📊 Monitoring Flow (Future)

```
Error Logged
     ↓
Backend API (/api/errors)
     ↓
┌────────────────────────────┐
│  Multiple Destinations:    │
│                            │
│  1. Database Storage       │
│  2. Monitoring Service     │
│  3. Email Alerts          │
│  4. Slack Notifications   │
│  5. Analytics Dashboard   │
└────────────────────────────┘
```

## 🔗 Integration Points

```
Your App ←→ Error Logging Service ←→ Backend API ←→ Storage/Monitoring

Components      errorLoggingService      /api/errors      Database
API Calls   →   .logError()          →   POST         →   MongoDB
Forms           .logNetworkError()        Validation       PostgreSQL
Features        .logUserActionError()     Processing       Sentry
                .logPerformanceIssue()    Alerting         LogRocket
```

---

## 📖 Further Reading

- 📘 Complete API Documentation: `ERROR_LOGGING_README.md`
- 💡 Usage Examples: `error-logging.examples.md`
- 🚀 Setup Guide: `INTEGRATION_GUIDE.md`
- 📋 Quick Reference: `ERROR_LOGGING_QUICK_REF.md`
- 📊 Implementation Summary: `ERROR_LOGGING_SUMMARY.md`

---

**Status:** ✅ Production Ready  
**Version:** 1.0.0  
**Location:** `src/lib/api/services/error-logging.service.ts`
