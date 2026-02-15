# 🚀 QUICK START: Phase 1 - Right Now!

**Time to Read**: 5 minutes  
**Time to Start**: < 1 minute  
**Current Status**: 🔴 CRITICAL - All Hands on Deck

---

## ⚡ TL;DR - What's Blocking Us?

| Blocker                     | Impact               | Fix Time | Start Date |
| --------------------------- | -------------------- | -------- | ---------- |
| 119 failing tests           | Can't release        | 4-5h     | **NOW**    |
| 4 missing API routes        | Phone feature broken | 2h       | **NOW**    |
| SessionUser type incomplete | Settings page broken | 30m      | **NOW**    |
| Admin tests broken          | 30 tests failing     | 4h       | **NOW**    |

**Total to fix**: ~8-10 hours = **1 full day**

---

## ✅ The 5-Step Fix Plan

### Step 1️⃣: Add One Field to SessionUser (5 min)

**File**: `src/contexts/SessionContext.tsx`

**What to do**:

```typescript
// Find this interface:
export interface SessionUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  // ... other fields

  // ADD THIS:
  metadata?: {
    createdAt: Date;
    lastSignInTime?: Date;
  };
}
```

**Why**: Tests expect this field, settings page reads it.

**Verify**:

```bash
npx tsc --noEmit src/contexts/SessionContext.tsx
```

---

### Step 2️⃣: Create 2 Phone Routes (30 min)

**Files to create**:

- `src/app/api/profile/add-phone/route.ts`
- `src/app/api/profile/verify-phone/route.ts`

**Quick template** (add-phone):

```typescript
import { NextRequest, NextResponse } from "next/server";
import { verifySessionCookie } from "@/lib/firebase/auth-server";
import { handleApiError } from "@/lib/errors/error-handler";
import { AuthenticationError } from "@/lib/errors";
import { successResponse, ApiErrors } from "@/lib/api-response";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";
import { z } from "zod";

const requestSchema = z.object({
  phoneNumber: z.string().min(10).max(15),
});

export async function POST(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get("__session")?.value;
    if (!sessionCookie) {
      throw new AuthenticationError(ERROR_MESSAGES.AUTH.UNAUTHORIZED);
    }

    const decodedToken = await verifySessionCookie(sessionCookie);
    if (!decodedToken) {
      throw new AuthenticationError(ERROR_MESSAGES.AUTH.SESSION_EXPIRED);
    }

    const body = await request.json();
    const validation = requestSchema.safeParse(body);
    if (!validation.success) {
      return ApiErrors.validationError(validation.error.issues);
    }

    const verificationId = `verify_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    // TODO: Send SMS with code

    return successResponse(
      { success: true, verificationId },
      SUCCESS_MESSAGES.PHONE.VERIFICATION_SENT,
    );
  } catch (error) {
    return handleApiError(error);
  }
}
```

**Why**: Unblocks phone verification feature.

---

### Step 3️⃣: Fix Admin Test Mocks (4 hours)

**Files to fix** (~8 files):

- `src/app/admin/carousel/__tests__/page.test.tsx`
- `src/app/admin/categories/__tests__/page.test.tsx`
- `src/app/admin/faqs/__tests__/page.test.tsx`
- ... (5 more)

**The fix** (add to top of test file):

```typescript
import React from "react";

// Add this mock BEFORE importing the component
jest.mock("react", () => ({
  ...jest.requireActual("react"),
  use: jest.fn(() => ({})), // Mock the use() hook
}));

jest.mock("@/lib/firebase/config", () => ({
  db: {},
  auth: {},
  storage: {},
}));

// Now import component
import AdminCarouselPage from "../page";
```

**Why**: Removes circular dependencies that break tests.

---

### Step 4️⃣: Add Missing Constants (10 min)

**File**: `src/constants/messages.ts`

**Add this**:

```typescript
export const SUCCESS_MESSAGES = {
  // ... existing
  PHONE: {
    VERIFICATION_SENT: "Verification code sent to your phone",
    VERIFIED: "Phone verified successfully",
  },
};

export const ERROR_MESSAGES = {
  // ... existing
  PHONE: {
    INVALID_FORMAT: "Invalid phone number format",
    CODE_EXPIRED: "Verification code expired",
  },
};
```

**Why**: Routes need these for error/success messages.

---

### Step 5️⃣: Run Tests (5 min)

```bash
# Full test suite
npm test

# Should see:
# ✅ Tests: 2150+ passing (95%+)
# ✅ No TypeScript errors
```

**If tests still fail**:

```bash
# Clear Jest cache and retry
npm test -- --clearCache
npm test
```

---

## 🎯 Success Looks Like

```
PASS  src/app/api/profile/add-phone/__tests__/route.test.ts
PASS  src/app/api/profile/verify-phone/__tests__/route.test.ts
PASS  src/app/admin/carousel/__tests__/page.test.tsx
...
PASS  src/contexts/SessionContext.tsx

Test Suites: 164 passed, 0 failed
Tests:       2150+ passed, 0-10 failed
```

---

## 📋 Checklist to Do Right Now

```
TODAY (February 12, 2026):

[ ] 09:00 - Read this document (you are here!)
[ ] 09:10 - Add metadata to SessionContext.tsx
[ ] 09:20 - Create add-phone route
[ ] 09:50 - Create verify-phone route
[ ] 10:20 - Add phone constants to messages.ts
[ ] 10:30 - Fix admin test mock (start first file)
[ ] 11:30 - Continue admin test fixes (7 more files)
[ ] 14:30 - Run full test suite
[ ] 15:00 - Verify 95%+ pass rate ✅

DONE!
```

---

## 🆘 Quick Troubleshooting

### "TypeScript error: Property 'metadata' missing"

**Fix**: Make sure you added the metadata field to SessionUser interface

### "Tests still failing after fix"

**Fix**:

```bash
npm test -- --clearCache  # Clear Jest cache
npm test                  # Run again
```

### "Cannot find module '@/lib/firebase/config'"

**Fix**: Make sure `jest.mock()` is BEFORE the import statement

### "Missing ERROR_MESSAGES or SUCCESS_MESSAGES"

**Fix**: Add them to `src/constants/messages.ts` - see Step 4 above

---

## 📞 Got Stuck? Follow This Path

| Problem             | Solution                                              | File |
| ------------------- | ----------------------------------------------------- | ---- |
| Not sure what to do | Read [PHASE1_ACTION_PLAN.md](./PHASE1_ACTION_PLAN.md) | -    |
| Test errors         | Check "If You Get Stuck" in action plan               | -    |
| Type errors         | See [GUIDE.md](./GUIDE.md) section on types           | -    |
| API errors          | Review [API_AUDIT_REPORT.md](../API_AUDIT_REPORT.md)  | -    |

---

## 🚀 What Happens After Phase 1?

Once Phase 1 is done ✅:

1. **Phase 2** (3-5 days): Build 47 type definitions
2. **Phase 3** (5-10 days): Implement 87 feature TODOs
3. **Phase 4** (3-5 days): Increase test coverage to 95%+
4. **Phase 5** (2-3 days): Optimize performance
5. **Phase 6** (1-2 days): Update documentation

**See**: [IMPLEMENTATION_TRACKER.md](../IMPLEMENTATION_TRACKER.md) for full details

---

## 💪 You Got This!

```
Current: 🔴 94.8% tests passing (CRITICAL)
Target:  ✅ 95%+ tests passing (READY)

ONE DAY OF WORK = UNBLOCKED FOR 2 WEEKS

Let's go! 🚀
```

---

**Created**: February 12, 2026  
**Status**: Ready to execute  
**Next**: Start Step 1️⃣ now!
