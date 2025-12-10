# API Lib Batch 5 Analysis - December 10, 2024

## Files Analyzed

1. `src/app/api/lib/session.ts` (306 lines)
2. `src/app/api/lib/handler-factory.ts` (500 lines)
3. `src/app/api/lib/validation-middleware.ts` (252 lines)
4. `src/app/api/lib/sieve-middleware.ts` (303 lines)

## Analysis Summary

### session.ts (306 lines)

**Purpose**: JWT-based session management with Firestore persistence

#### Potential Issues Found:

**1. Weak Default SESSION_SECRET - CRITICAL**

- **Location**: Line 7
- **Issue**: Default secret is weak and predictable
- **Impact**: If production deploys without setting env var, all sessions compromised
- **Risk Level**: CRITICAL - Security vulnerability
- **Current Code**:

```typescript
const SESSION_SECRET =
  process.env.SESSION_SECRET || "your-secret-key-change-in-production";
```

- **Problem**: Default is obvious string, easily guessed, enables token forgery

**2. No Error Handling in createSession() - HIGH**

- **Location**: Lines 43-91
- **Issue**: Firestore write could fail, JWT signing could fail, no try-catch
- **Impact**: Session creation crashes user login flow
- **Risk Level**: HIGH - Breaks authentication

**3. Firestore Write Then JWT Sign - MEDIUM**

- **Location**: Lines 72-89
- **Issue**: Writes to Firestore before JWT signing. If JWT fails, orphan session left in DB
- **Impact**: Accumulates unused sessions in database
- **Risk Level**: MEDIUM - Data integrity issue

**4. verifySession() Updates lastActivity Every Time - MEDIUM**

- **Location**: Lines 127-132
- **Issue**: Every request triggers Firestore write
- **Impact**: Excessive Firestore writes, cost increases, rate limits
- **Risk Level**: MEDIUM - Performance/cost issue
- **Example**: 100 requests = 100 writes just for activity tracking

**5. No Error Handling in deleteSession() - MEDIUM**

- **Location**: Lines 143-145
- **Issue**: Delete operation not wrapped in try-catch
- **Impact**: Failed delete crashes logout flow
- **Risk Level**: MEDIUM - UX issue

**6. Batch Commit Without Error Handling - MEDIUM**

- **Location**: Lines 150-164, 267-279
- **Issue**: Two functions use batch.commit() without try-catch
- **Impact**: Batch failures crash the operation
- **Risk Level**: MEDIUM - Stability issue
- **Functions affected**:
  - `deleteAllUserSessions()` - line 162
  - `cleanupExpiredSessions()` - line 277

**7. getUserSessions() Deletes During Read - MEDIUM**

- **Location**: Lines 167-193
- **Issue**: Deletes expired sessions while iterating results
- **Impact**: Race conditions, inconsistent data
- **Risk Level**: MEDIUM - Data integrity
- **Problem**: Modifying collection while reading from it

**8. getCurrentUser() Does Two Separate DB Calls - LOW**

- **Location**: Lines 286-306
- **Issue**: Calls verifySession (reads sessions) then reads users separately
- **Impact**: Unnecessary database read, increased latency
- **Risk Level**: LOW - Performance optimization opportunity

**9. clearSessionCookie() Sets Two Cookies - LOW**

- **Location**: Lines 211-238
- **Issue**: Sets cookie twice with different httpOnly values
- **Impact**: Confusing, one should be sufficient
- **Risk Level**: LOW - Code smell

### handler-factory.ts (500 lines)

**Purpose**: Factory patterns for consistent API handlers with auth, validation, error handling

#### Potential Issues Found:

**1. Unhandled async/await in context.params - MEDIUM**

- **Location**: Line 198
- **Issue**: `_context?.params` is Promise but only awaited conditionally
- **Impact**: Could cause race conditions or undefined params
- **Risk Level**: MEDIUM - Runtime error potential
- **Current Code**:

```typescript
const params = _context?.params ? await(_context as any).params : {};
```

- **Problem**: Assumes params is Promise, but type not guaranteed

**2. Silent Body Parse Failure - MEDIUM**

- **Location**: Lines 223-228
- **Issue**: Catches JSON parse error but only throws BadRequestError
- **Impact**: Loses original error details, harder to debug
- **Risk Level**: MEDIUM - Observability issue

**3. createCrudHandlers() Missing Error Handling - HIGH**

- **Location**: Lines 259-468
- **Issue**: No try-catch around Firestore operations
- **Impact**: Database errors crash the handler
- **Risk Level**: HIGH - Multiple functions affected
- **Functions**:
  - GET (line 298)
  - POST (line 318)
  - PATCH (line 367)
  - DELETE (line 438)

**4. canAccess Returns false Instead of Throwing - MEDIUM**

- **Location**: Lines 304-308
- **Issue**: Returns NotFoundError instead of ForbiddenError
- **Impact**: Misleading error messages (looks like 404 instead of 403)
- **Risk Level**: MEDIUM - Security information leak
- **Current Code**:

```typescript
if (!canAccess(ctx.user, data)) {
  throw new NotFoundError(`${resourceName} not found`); // Should be 403 not 404
}
```

**5. PATCH Handler Doesn't Validate Empty Body - MEDIUM**

- **Location**: Lines 367-435
- **Issue**: No check if body is empty or null
- **Impact**: Could attempt update with no fields
- **Risk Level**: MEDIUM - Data validation issue

**6. getPaginationParams() Allows page=0 - LOW**

- **Location**: Line 478
- **Issue**: No validation that page >= 1
- **Impact**: Could cause pagination bugs
- **Risk Level**: LOW - Edge case handling

**7. getPaginationParams() Clamps Limit But Not Page - LOW**

- **Location**: Line 477
- **Issue**: Limits max to 100 but doesn't limit page number
- **Impact**: Could request page 999999 causing performance issues
- **Risk Level**: LOW - DoS potential

### validation-middleware.ts (252 lines)

**Purpose**: Request validation and sanitization middleware

#### Potential Issues Found:

**1. sanitizeInput() Basic XSS Protection Only - MEDIUM**

- **Location**: Lines 208-214
- **Issue**: Simple regex replacement for XSS, not comprehensive
- **Impact**: May not catch all XSS vectors
- **Risk Level**: MEDIUM - Security issue
- **Current Code**:

```typescript
return input
  .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
  .replace(/on\w+="[^"]*"/gi, "")
  .replace(/javascript:/gi, "")
  .trim();
```

- **Missing**: data: URLs, SVG exploits, HTML entities, many bypass techniques

**2. validateRequest() Swallows JSON Parse Error - MEDIUM**

- **Location**: Lines 63-68
- **Issue**: Catches all errors and returns generic message
- **Impact**: Loses specific error information
- **Risk Level**: MEDIUM - Debugging difficulty

**3. No Rate Limiting on Validation - LOW**

- **Location**: Entire file
- **Issue**: No protection against validation spam
- **Impact**: Could be abused to overwhelm server
- **Risk Level**: LOW - DoS potential

**4. sanitizeInput() Modifies Objects In-Place - LOW**

- **Location**: Lines 218-225
- **Issue**: Creates new object but doesn't handle nested references
- **Impact**: Could have unintended mutations
- **Risk Level**: LOW - Data integrity edge case

### sieve-middleware.ts (303 lines)

**Purpose**: Sieve query middleware for advanced filtering/sorting/pagination

#### Potential Issues Found:

**1. No Error Handling in withSieve() - HIGH**

- **Location**: Lines 95-145
- **Issue**: Only try-catch wrapper, but errors not properly logged
- **Impact**: Generic error responses, hard to debug
- **Risk Level**: HIGH - Observability issue

**2. Missing requireAuth Implementation - MEDIUM**

- **Location**: Line 79
- **Issue**: Option `requireAuth` defined but never checked
- **Impact**: Auth requirement ignored, potential security issue
- **Risk Level**: MEDIUM - Security feature not implemented
- **Current Code**:

```typescript
/**
 * Whether to require authentication
 */
requireAuth?: boolean;
```

- **Problem**: This field is defined in options but never used in the handler

**3. Missing requiredRoles Implementation - MEDIUM**

- **Location**: Line 84
- **Issue**: Option `requiredRoles` defined but never checked
- **Impact**: Role-based access control not enforced
- **Risk Level**: MEDIUM - Security feature not implemented

**4. Mandatory Filters Can Be Bypassed - HIGH**

- **Location**: Lines 107-111
- **Issue**: Just concatenates filters, client could override with later filters
- **Impact**: Security filters may not be enforced
- **Risk Level**: HIGH - Security bypass potential
- **Problem**: If client sends conflicting filter, last one might win

**5. No Validation of transform Function - LOW**

- **Location**: Lines 122-126
- **Issue**: Transform function could throw, not caught
- **Impact**: Transform errors crash the handler
- **Risk Level**: LOW - Error handling gap

## Bug Priority Summary

### CRITICAL (1)

1. ✅ **session.ts** - Weak default SESSION_SECRET
   - Security vulnerability if deployed without env var

### HIGH (5)

1. ✅ **session.ts** - No error handling in createSession()
2. ✅ **handler-factory.ts** - Missing error handling in createCrudHandlers()
3. ✅ **sieve-middleware.ts** - No error handling in withSieve()
4. ✅ **sieve-middleware.ts** - Mandatory filters can be bypassed
5. ✅ **sieve-middleware.ts** - requireAuth/requiredRoles not implemented

### MEDIUM (15)

1. ✅ **session.ts** - Firestore write before JWT sign (orphan sessions)
2. ✅ **session.ts** - verifySession updates lastActivity every time (performance)
3. ✅ **session.ts** - No error handling in deleteSession()
4. ✅ **session.ts** - Batch commit without error handling (2 locations)
5. ✅ **session.ts** - getUserSessions deletes during read (race condition)
6. ✅ **handler-factory.ts** - Unhandled async params
7. ✅ **handler-factory.ts** - Silent body parse failure
8. ✅ **handler-factory.ts** - canAccess returns 404 instead of 403
9. ✅ **handler-factory.ts** - PATCH doesn't validate empty body
10. ✅ **validation-middleware.ts** - sanitizeInput basic XSS protection only
11. ✅ **validation-middleware.ts** - validateRequest swallows JSON parse error

### LOW (7)

1. getCurrentUser does two DB calls (optimization)
2. clearSessionCookie sets two cookies (code smell)
3. getPaginationParams allows page=0
4. getPaginationParams doesn't clamp page number
5. No rate limiting on validation
6. sanitizeInput modifies objects (edge case)
7. No validation of transform function

## Recommended Fixes

### session.ts

1. **CRITICAL: Replace weak default secret**: Throw error if SESSION_SECRET not set in production
2. **Add error handling**: Wrap all Firestore operations in try-catch
3. **Optimize lastActivity**: Only update if > 5 minutes since last update
4. **Fix orphan sessions**: Sign JWT first, then write to Firestore
5. **Fix getUserSessions**: Separate read and delete operations

### handler-factory.ts

1. **Add error handling to CRUD handlers**: Wrap Firestore calls
2. **Fix canAccess error**: Return ForbiddenError (403) not NotFoundError (404)
3. **Validate PATCH body**: Check body not empty
4. **Add pagination limits**: Validate page number

### validation-middleware.ts

1. **Enhance XSS protection**: Use established library like DOMPurify
2. **Preserve error details**: Don't swallow specific errors

### sieve-middleware.ts

1. **CRITICAL: Implement auth checks**: Honor requireAuth and requiredRoles options
2. **Fix mandatory filters**: Ensure they can't be overridden
3. **Add error handling**: Wrap operations properly
4. **Validate transform**: Catch transform errors

## Files to Fix

- ✅ `src/app/api/lib/session.ts` - Security + error handling
- ✅ `src/app/api/lib/handler-factory.ts` - Error handling + validation
- ✅ `src/app/api/lib/validation-middleware.ts` - XSS protection
- ✅ `src/app/api/lib/sieve-middleware.ts` - Auth implementation + security

## Next Steps

1. Fix CRITICAL: weak SESSION_SECRET and implement auth in sieve
2. Fix HIGH: error handling, security bypasses
3. Fix MEDIUM: performance, validation issues
4. Create BATCH-5-FIXES summary
5. Continue to next lib subfolder or API routes
