# 🎯 PHASE 1: Critical Path - Detailed Action Plan

**Start Date**: February 12, 2026  
**Target Completion**: February 13, 2026  
**Status**: 🔴 NOT STARTED

---

## 📋 Quick Start Checklist

- [ ] **1.1** Run test diagnostics
- [ ] **1.2** Fix SessionUser metadata type
- [ ] **1.3** Resolve admin test circular dependencies
- [ ] **1.4** Create phone verification routes
- [ ] **1.5** Update API constants
- [ ] **VERIFICATION** Run full test suite, achieve ≥ 95% pass rate

---

## Phase 1.1: Test Diagnostics

### Action 1.1.1: Get Failing Test Summary

```bash
# List all test files with failures
npm test -- --listTests | Select-String -Pattern "test\\.ts$" | Measure-Object

# Run tests and capture failures
npm test 2>&1 | Tee-Object -FilePath test-run.log

# Analyze failures by category
npm test -- --verbose 2>&1 | Select-Object -First 1000 | Select-String -Pattern "FAIL|●"
```

**Current Status**: 119 failing tests out of 2268

**Expected Failure Categories**:

1. Admin page tests (circular deps, async hooks) - ~30 tests
2. User profile tests (missing metadata) - ~20 tests
3. Component integration tests - ~40 tests
4. API route tests (missing endpoints) - ~29 tests

### Action 1.1.2: Document Failure Patterns

**Output File**: `docs/PHASE1_FAILURES.md`

```markdown
## Test Failure Summary

### Category: SessionUser metadata missing (20 tests)

Files:

- src/app/user/settings/**tests**/page.test.tsx

Fix:

- Add metadata field to SessionUser type
- Update mock objects

### Category: Admin circular deps (30 tests)

Files:

- src/app/admin/carousel/**tests**/page.test.tsx
- src/app/admin/categories/**tests**/page.test.tsx
- ... (6 more files)

Fix:

- Remove jest.requireActual patterns
- Use proper mocking strategy

### Category: Missing API routes (20 tests)

Files:

- src/app/api/**tests**/profile.test.ts

Fix:

- Create /api/profile/add-phone
- Create /api/profile/verify-phone
```

---

## Phase 1.2: Fix SessionUser Type Error

### Subtask 1.2.1: Add metadata to SessionUser

**File**: `src/contexts/SessionContext.tsx`

**Current Issue**: `SessionUser` type missing `metadata` field

**Solution**:

```typescript
import type { AvatarMetadata } from "@/db/schema";

export interface SessionUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: UserRole;
  emailVerified: boolean;
  phoneVerified?: boolean;
  metadata?: {
    createdAt: Date;
    lastSignInTime?: Date;
    avatarMetadata?: AvatarMetadata;
  };
  publicProfile?: {
    bio: string;
    location: string;
    isPublic: boolean;
  };
  stats?: {
    totalOrders: number;
    totalReviews: number;
    totalBids: number;
  };
}
```

**References**:

- Schema: `src/db/schema/users.ts` - USER_FIELDS
- Auth types: `src/types/auth.ts`
- Tests: `src/app/user/settings/__tests__/page.test.tsx`

**Verification**:

```bash
npx tsc --noEmit src/contexts/SessionContext.tsx
```

---

### Subtask 1.2.2: Update Type Imports

**File**: `src/types/auth.ts`

**Current**: May have duplicate `AvatarMetadata` definition

**Solution**: Remove duplicate, import from schema

```typescript
// ❌ OLD
export interface AvatarMetadata {
  url?: string;
  bgColor?: string;
  initials?: string;
}

// ✅ NEW
import type { AvatarMetadata } from "@/db/schema";
// Re-export
export type { AvatarMetadata };
```

**Verification**: No type duplication, clean imports

---

## Phase 1.3: Fix Admin Test Circular Dependencies

### Analysis of Circular Dependency Issue

**Problem**: Tests trying to use `jest.requireActual('@/components')` creates circular deps

**Solution**: Properly mock React `use()` hook

### Subtask 1.3.1: Identify Affected Files

Files with circular dependency issues (~8):

```bash
# Search for jest.requireActual patterns
grep -r "jest.requireActual" src/app --include="*.test.ts"
```

Expected files:

- `src/app/admin/carousel/__tests__/page.test.tsx`
- `src/app/admin/categories/__tests__/page.test.tsx`
- `src/app/admin/faqs/__tests__/page.test.tsx`
- `src/app/admin/sections/__tests__/page.test.tsx`
- `src/app/admin/users/__tests__/page.test.tsx`
- `src/app/admin/coupons/__tests__/page.test.tsx` (if exists)
- `src/app/admin/site/__tests__/page.test.tsx` (if exists)
- `src/app/admin/reviews/__tests__/page.test.tsx` (if exists)

### Subtask 1.3.2: Fix Pattern - Mock React.use()

**Template for each test file**:

```typescript
// src/app/admin/[section]/__tests__/page.test.tsx

import React from 'react';
import { render, screen } from '@testing-library/react';

// Mock React.use() to return empty object immediately
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  use: jest.fn(() => ({})),
}));

// Mock firebase modules
jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(),
}));

jest.mock('@/lib/firebase/config', () => ({
  db: {},
  auth: {},
  storage: {},
}));

// Import component AFTER mocks
import AdmitPage from '../page';

describe('Admin [Section] Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render without errors', () => {
    render(<AdminPage />);
    expect(screen.getByRole('heading')).toBeInTheDocument();
  });
});
```

**Key Points**:

- Mock `React.use()` BEFORE importing component
- Mock all Firebase modules
- Use `jest.clearAllMocks()` in beforeEach
- Mock only what's needed, don't use `jest.requireActual()`

### Subtask 1.3.3: Verify No Circular Imports

```bash
# Check for circular dependency warnings
npm test -- --detectOpenHandles 2>&1 | Select-String "circular"
```

---

## Phase 1.4: Create Missing Phone Verification Routes

### Subtask 1.4.1: Create POST /api/profile/add-phone

**File**: `src/app/api/profile/add-phone/route.ts`

**Template**:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { verifySessionCookie } from "@/lib/firebase/auth-server";
import { handleApiError } from "@/lib/errors/error-handler";
import { AuthenticationError, ValidationError } from "@/lib/errors";
import { successResponse, ApiErrors } from "@/lib/api-response";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";
import { userRepository } from "@/repositories";
import { z } from "zod";

const requestSchema = z.object({
  phoneNumber: z
    .string()
    .min(10, ERROR_MESSAGES.VALIDATION.INVALID_PHONE)
    .max(15, ERROR_MESSAGES.VALIDATION.INVALID_PHONE),
});

export async function POST(request: NextRequest) {
  try {
    // 1. Verify authentication
    const sessionCookie = request.cookies.get("__session")?.value;
    if (!sessionCookie) {
      throw new AuthenticationError(ERROR_MESSAGES.AUTH.UNAUTHORIZED);
    }

    const decodedToken = await verifySessionCookie(sessionCookie);
    if (!decodedToken) {
      throw new AuthenticationError(ERROR_MESSAGES.AUTH.SESSION_EXPIRED);
    }

    // 2. Validate request
    const body = await request.json();
    const validation = requestSchema.safeParse(body);
    if (!validation.success) {
      return ApiErrors.validationError(validation.error.issues);
    }

    // 3. TODO: Send verification code via SMS/email
    // Using Firebase Phone Authentication or Twilio
    const verificationId = generateVerificationId();
    // await sendVerificationCode(validation.data.phoneNumber, verificationId);

    // 4. Return response
    return successResponse(
      {
        success: true,
        verificationId,
        message: "Verification code sent",
      },
      SUCCESS_MESSAGES.PHONE.VERIFICATION_SENT,
    );
  } catch (error) {
    return handleApiError(error);
  }
}

function generateVerificationId(): string {
  return `verify_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}
```

**References**:

- Component: `src/components/profile/ProfilePhoneSection.tsx` (line 56)
- API Endpoint: `API_ENDPOINTS.PROFILE.ADD_PHONE`
- Error Messages: `ERROR_MESSAGES.PHONE.*`
- Success Messages: `SUCCESS_MESSAGES.PHONE.*`

**Constants Needed** (add to `src/constants/messages.ts` if missing):

```typescript
export const SUCCESS_MESSAGES = {
  PHONE: {
    VERIFICATION_SENT: "Verification code sent to your phone",
    VERIFIED: "Phone number verified successfully",
  },
};

export const ERROR_MESSAGES = {
  PHONE: {
    INVALID_FORMAT: "Invalid phone number format",
    NOT_VERIFIED: "Phone number not verified",
    CODE_EXPIRED: "Verification code expired",
  },
};
```

**Tests**: Create `src/app/api/profile/add-phone/__tests__/route.test.ts`

```typescript
import { POST } from "../route";
import { verifySessionCookie } from "@/lib/firebase/auth-server";

jest.mock("@/lib/firebase/auth-server");

describe("POST /api/profile/add-phone", () => {
  it("should return verification ID on valid phone", async () => {
    // Mock session
    (verifySessionCookie as jest.Mock).mockResolvedValue({
      uid: "user-123",
    });

    const request = new Request("http://localhost/api/profile/add-phone", {
      method: "POST",
      body: JSON.stringify({ phoneNumber: "+1234567890" }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(request as NextRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.verificationId).toBeDefined();
  });

  it("should reject invalid phone numbers", async () => {
    // ... test invalid formats
  });

  it("should require authentication", async () => {
    // ... test missing session
  });
});
```

---

### Subtask 1.4.2: Create POST /api/profile/verify-phone

**File**: `src/app/api/profile/verify-phone/route.ts`

**Template**:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { verifySessionCookie } from "@/lib/firebase/auth-server";
import { handleApiError } from "@/lib/errors/error-handler";
import { AuthenticationError } from "@/lib/errors";
import { successResponse, ApiErrors } from "@/lib/api-response";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";
import { userRepository } from "@/repositories";
import { USER_FIELDS } from "@/db/schema";
import { z } from "zod";

const requestSchema = z.object({
  verificationId: z.string().min(1),
  code: z.string().regex(/^\d{6}$/, "Code must be 6 digits"),
});

export async function POST(request: NextRequest) {
  try {
    // 1. Verify authentication
    const sessionCookie = request.cookies.get("__session")?.value;
    if (!sessionCookie) {
      throw new AuthenticationError(ERROR_MESSAGES.AUTH.UNAUTHORIZED);
    }

    const decodedToken = await verifySessionCookie(sessionCookie);
    if (!decodedToken) {
      throw new AuthenticationError(ERROR_MESSAGES.AUTH.SESSION_EXPIRED);
    }

    // 2. Validate request
    const body = await request.json();
    const validation = requestSchema.safeParse(body);
    if (!validation.success) {
      return ApiErrors.validationError(validation.error.issues);
    }

    // 3. TODO: Verify the code against stored verification ID
    // const isValid = await verifyCode(validation.data);
    // if (!isValid) {
    //   throw new ValidationError(ERROR_MESSAGES.PHONE.CODE_EXPIRED);
    // }

    // 4. Update user profile with verified phone
    await userRepository.update(decodedToken.uid, {
      [USER_FIELDS.PHONE_VERIFIED]: true,
    });

    // 5. Return success
    return successResponse(
      {
        success: true,
        phoneVerified: true,
        message: "Phone verified successfully",
      },
      SUCCESS_MESSAGES.PHONE.VERIFIED,
    );
  } catch (error) {
    return handleApiError(error);
  }
}
```

**References**:

- Component: `src/components/profile/ProfilePhoneSection.tsx` (line 85)
- API Endpoint: `API_ENDPOINTS.PROFILE.VERIFY_PHONE`
- Schema: `USER_FIELDS.PHONE_VERIFIED`

**Tests**: Create equivalent test file

---

## Phase 1.5: Update API Constants

### Subtask 1.5.1: Clean up src/constants/api-endpoints.ts

**File**: `src/constants/api-endpoints.ts`

**Actions**:

1. **Remove Duplicate Entries**:

```typescript
// ❌ REMOVE - duplicate of CREATE_SESSION
AUTH: {
  // ... other entries
  // DESTROY_SESSION: `${API_BASE}/auth/session`, // DELETE method
}

// ❌ REMOVE - duplicate of PROFILE endpoint
USER: {
  // ... other entries
  // UPDATE_PROFILE: `${API_BASE}/user/profile`, // PATCH method
}

// ❌ REMOVE - duplicate of FAQS.LIST
FAQS: {
  // BASE: `${API_BASE}/faqs`, // DELETE THIS
  LIST: `${API_BASE}/faqs`,
}
```

2. **Consolidate ADDRESS Endpoints**:

```typescript
// ⚠️ DEPRECATE - exists in both locations
USER: {
  ADDRESSES: {
    // ... (mark as deprecated)
  },
}

// ✅ USE THIS - top-level
ADDRESSES: {
  LIST: `${API_BASE}/user/addresses`,
  CREATE: `${API_BASE}/user/addresses`,
  GET: (id: string) => `${API_BASE}/user/addresses/${id}`,
  UPDATE: (id: string) => `${API_BASE}/user/addresses/${id}`,
  DELETE: (id: string) => `${API_BASE}/user/addresses/${id}`,
}
```

3. **Document Missing Routes**:

```typescript
// ❌ MISSING ROUTES (referenced but not implemented)
// - AUTH.REFRESH_TOKEN - not used yet
// - USER.DELETE_ACCOUNT - use /api/profile/delete-account instead
// - ADMIN.REVOKE_SESSION
// - ADMIN.REVOKE_USER_SESSIONS
// - LOGS.WRITE
// - NEWSLETTER.SUBSCRIBE
```

4. **Add JSDoc Status**:

```typescript
/**
 * Phone verification routes
 * ✅ Routes implemented
 * Used by: ProfilePhoneSection component
 */
PROFILE: {
  // ... existing entries
  ADD_PHONE: `${API_BASE}/profile/add-phone`, // NEW
  VERIFY_PHONE: `${API_BASE}/profile/verify-phone`, // NEW
}
```

---

### Subtask 1.5.2: Verify Constants are Used

**Command**:

```bash
# Find all references to API constants
grep -r "API_ENDPOINTS\." src --include="*.ts" --include="*.tsx" | grep -v "api-endpoints.ts"

# Ensure no hardcoded API paths remain
grep -r "\"/api/" src --include="*.ts" --include="*.tsx" | grep -v "api-endpoints.ts" | grep -v "__tests__"
```

**Expected Output**: All API calls use `API_ENDPOINTS.*` constants

---

## Phase 1.6: Verification & Sign-Off

### Checklist Before Proceeding to Phase 2:

- [ ] Run full test suite: `npm test`
- [ ] Verify pass rate ≥ 95% (≥ 2150 passing tests)
- [ ] No TypeScript errors: `npx tsc --noEmit`
- [ ] Phone routes created and tested
- [ ] API constants cleaned up
- [ ] All test files updated with proper mocks

### Commands to Run:

```bash
# 1. Type check
npx tsc --noEmit

# 2. Run all tests
npm test

# 3. Check specific failing tests (if any)
npm test -- --testPathPattern="profile|phone" --verbose

# 4. Verify no hardcoded strings
grep -r "add-phone\|verify-phone" src --include="*.ts" --include="*.tsx" | grep -v "api-endpoints\|__tests__"

# 5. Check constants are imported
grep -r "API_ENDPOINTS.PROFILE" src --include="*.ts" --include="*.tsx"
```

### Success Criteria Met When:

✅ **Tests**: 2150+ passing (94.8% → 95%+)  
✅ **Types**: 0 TypeScript errors  
✅ **APIs**: 4 missing routes implemented and tested  
✅ **Constants**: All duplicates removed, status documented  
✅ **Lint**: No critical warnings

### When Complete:

Update [IMPLEMENTATION_TRACKER.md](../IMPLEMENTATION_TRACKER.md):

- Mark Phase 1 as ✅ COMPLETE
- Update status badges
- Note completion date
- Proceed to Phase 2

---

## 📚 Quick Reference

### Key Files to Modify

| File                                        | Action                | Effort    |
| ------------------------------------------- | --------------------- | --------- |
| `src/contexts/SessionContext.tsx`           | Add metadata field    | ⚡ 5 min  |
| `src/types/auth.ts`                         | Import AvatarMetadata | ⚡ 5 min  |
| `src/app/admin/*/page.test.tsx` (8 files)   | Fix mocks             | 🔧 1 hour |
| `src/app/api/profile/add-phone/route.ts`    | Create endpoint       | 🔧 30 min |
| `src/app/api/profile/verify-phone/route.ts` | Create endpoint       | 🔧 30 min |
| `src/constants/api-endpoints.ts`            | Clean up duplicates   | 🔧 30 min |
| `src/constants/messages.ts`                 | Add PHONE messages    | ⚡ 10 min |

**Total Estimate**: 3-4 hours

---

## 🆘 If You Get Stuck

**Issue**: Tests still failing after fixes

```bash
# Reset jest cache
npm test -- --clearCache
npm test
```

**Issue**: "Cannot find module" errors

```bash
# Reinstall dependencies
npm install
# Clear TypeScript cache
npx tsc --build --clean
npx tsc --noEmit
```

**Issue**: Mock errors in admin tests

- Check that `jest.mock()` calls are BEFORE imports
- Ensure React.use is mocked properly
- Verify all Firebase modules are mocked

**Issue**: Phone verification not working

- Verify UserRepository.update() method exists
- Check USER_FIELDS.PHONE_VERIFIED constant
- Ensure error messages are defined in constants

---

Generated: February 12, 2026 | Next: [Phase 2 Plan](./PHASE2_API_TYPES.md)
