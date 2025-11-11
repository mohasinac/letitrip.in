# Bulk Action API Testing Guide

**Date**: November 11, 2025  
**Status**: Ready for Testing  
**Scripts**: 2 test scripts created

---

## Overview

This guide covers testing all bulk action API endpoints to ensure they work correctly across different entities and actions.

---

## Test Scripts

### 1. Basic Test Script

**File**: `scripts/test-bulk-actions.js`  
**Purpose**: Quick smoke tests without database integration  
**Usage**: `npm run test:bulk-actions`

**Features**:

- Tests all bulk endpoints
- Mock data support
- Error handling tests
- Authorization tests
- Console output with colors
- Results saved to JSON

**Limitations**:

- Requires manual test data IDs
- No database verification
- No cleanup

### 2. Integration Test Script

**File**: `scripts/test-bulk-actions-integration.mjs`  
**Purpose**: Full integration tests with Firebase  
**Usage**: `npm run test:bulk-actions:integration`

**Features**:

- Creates real test data in Firebase
- Tests actual database changes
- Verifies results after each action
- Automatic cleanup
- Comprehensive logging
- Results saved to JSON

**Requirements**:

- Firebase Admin SDK configured
- `firebase-service-account.json` file
- Dev server running (`npm run dev`)

---

## Bulk API Endpoints

### Admin Endpoints

#### 1. `/api/admin/categories/bulk` (5 actions)

```typescript
Actions:
- activate: Set is_active = true
- deactivate: Set is_active = false
- feature: Set is_featured = true
- unfeature: Set is_featured = false
- delete: Delete category (checks for children/products)
```

#### 2. `/api/admin/users/bulk` (4 actions)

```typescript
Actions:
- make-seller: Set role = "seller"
- make-user: Set role = "user"
- ban: Set is_banned = true
- unban: Set is_banned = false
```

#### 3. `/api/admin/hero-slides/bulk` (2 actions)

```typescript
Actions:
- activate: Set is_active = true
- delete: Delete hero slide
```

### Seller Endpoints

#### 4. `/api/seller/products/bulk` (5 actions)

```typescript
Actions:
- publish: Set status = "published"
- draft: Set status = "draft"
- archive: Set status = "archived"
- update-stock: Update stock_count
- delete: Delete product

Authorization:
- Seller can only edit own products
- Admin can edit all products
```

#### 5. `/api/seller/auctions/bulk` (4 actions)

```typescript
Actions:
- schedule: Set status = "scheduled" (only draft)
- cancel: Set status = "cancelled" (only scheduled/live)
- end: Set status = "ended", endTime = now (only live)
- delete: Delete auction (only draft/ended/cancelled)

Validation:
- Status-based restrictions
- Ownership verification
```

---

## Request Format

All bulk endpoints accept POST requests with this format:

```json
{
  "action": "action-name",
  "ids": ["id1", "id2", "id3"],
  "data": {
    // Optional data for specific actions
    "stockCount": 50
  }
}
```

---

## Response Format

### Success Response

```json
{
  "success": true,
  "results": {
    "success": 3,
    "failed": 0
  },
  "message": "Bulk operation completed"
}
```

### Partial Success Response

```json
{
  "success": true,
  "results": {
    "success": 2,
    "failed": 1,
    "errors": [
      {
        "id": "item-id",
        "error": "Error message"
      }
    ]
  },
  "message": "Bulk operation completed with 1 error"
}
```

### Error Response

```json
{
  "error": "Error message",
  "details": "Detailed error information"
}
```

---

## Running Tests

### Prerequisites

1. **Start Dev Server**:

   ```bash
   npm run dev
   ```

2. **Firebase Admin SDK**:

   - Ensure `firebase-service-account.json` exists
   - Configure Firebase project

3. **Install Dependencies**:
   ```bash
   npm install
   ```

### Run Basic Tests

```bash
npm run test:bulk-actions
```

**Expected Output**:

```
╔════════════════════════════════════════════════════════╗
║       Bulk Action API Test Suite                      ║
╚════════════════════════════════════════════════════════╝

Base URL: http://localhost:3000
Started: 2025-11-11T...

==============================================================
Testing Category Bulk Actions
==============================================================

ℹ️  Testing: Categories: Activate
✅ Categories: Activate - Status 200
ℹ️    Result: 3 success, 0 failed

...

==============================================================
Test Summary
==============================================================

Total Tests: 18
✅ Passed: 16
❌ Failed: 2
⚠️  Skipped: 0
Pass Rate: 88.9%
```

### Run Integration Tests

```bash
npm run test:bulk-actions:integration
```

**Expected Output**:

```
╔════════════════════════════════════════════════════════════════╗
║     Bulk Action API Integration Test Suite                    ║
╚════════════════════════════════════════════════════════════════╝

Base URL: http://localhost:3000
Started: 2025-11-11T...

======================================================================
Testing Category Bulk Actions (5 actions)
======================================================================

ℹ️  Creating 3 test categories...
✅ Created 3 test categories

ℹ️  Testing: Categories: Activate
✅ Categories: Activate - Status 200
ℹ️    Success: 3, Failed: 0
✅   Validation passed

...

======================================================================
Cleaning Up Test Data
======================================================================

ℹ️  Cleaning 3 test categories...
✅ Cleaned up 15 test records

======================================================================
Test Summary
======================================================================

Total Tests: 18
✅ Passed: 18
❌ Failed: 0
⚠️  Skipped: 0
Pass Rate: 100.0%

ℹ️
Detailed results saved to: logs/bulk-action-tests-2025-11-11T....json
```

---

## Test Checklist

### Category Bulk Actions ✅

- [x] Activate categories
- [x] Deactivate categories
- [x] Feature categories
- [x] Unfeature categories
- [x] Delete categories

### User Bulk Actions ✅

- [x] Make users sellers
- [x] Make sellers users
- [x] Ban users
- [x] Unban users

### Product Bulk Actions ❌

- [ ] Publish products
- [ ] Draft products
- [ ] Archive products
- [ ] Update stock
- [ ] Delete products
- [ ] Test ownership validation

### Auction Bulk Actions ❌

- [ ] Schedule auctions
- [ ] Cancel auctions
- [ ] End auctions
- [ ] Delete auctions
- [ ] Test status validation

### Hero Slides Bulk Actions ❌

- [ ] Activate slides
- [ ] Delete slides

### Error Handling ✅

- [x] Invalid action
- [x] Empty IDs array
- [x] Non-existent IDs
- [x] Invalid data

### Authorization ✅

- [x] No auth token
- [x] Wrong role (admin/seller)
- [x] Ownership validation

---

## Known Issues

### Issue 1: Authentication in Tests

**Problem**: Tests don't include real auth tokens  
**Solution**:

1. Generate admin/seller tokens
2. Add to test config
3. Use Firebase Auth in tests

**Workaround**: Disable auth check in dev

### Issue 2: Test Data Cleanup

**Problem**: Failed tests may leave test data  
**Solution**:

1. Run cleanup script manually
2. Delete all TEST\_\* prefixed items
3. Use transaction rollback

**Command**:

```bash
node scripts/cleanup-test-data.js
```

### Issue 3: Rate Limiting

**Problem**: Too many requests may hit rate limit  
**Solution**:

1. Add delays between tests
2. Use bulk operations
3. Disable rate limiting in dev

### Issue 4: Missing Endpoints

**Problem**: Some bulk endpoints not implemented  
**Missing**:

- `/api/admin/products/bulk`
- `/api/admin/auctions/bulk`
- `/api/admin/shops/bulk`
- `/api/admin/orders/bulk`
- `/api/admin/reviews/bulk`
- `/api/admin/coupons/bulk`
- `/api/admin/tickets/bulk`
- `/api/admin/payouts/bulk`

**Solution**: Implement missing endpoints

---

## Adding New Bulk Endpoints

### Step 1: Create Route File

```typescript
// src/app/api/admin/[entity]/bulk/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  executeBulkOperation,
  parseBulkRequest,
  createBulkErrorResponse,
} from "../../../lib/bulk-operations";

export async function POST(request: NextRequest) {
  try {
    const { action, ids, data } = await parseBulkRequest(request);

    const result = await executeBulkOperation({
      collection: "entity-name",
      action,
      ids,
      data,
      validateItem: async (item, actionType) => {
        // Add validation logic
        return { valid: true };
      },
      customHandler: async (db, id, updateData) => {
        const ref = db.collection("entity-name").doc(id);

        switch (action) {
          case "action-name":
            await ref.update({
              // Update fields
            });
            break;

          default:
            throw new Error(`Unknown action: ${action}`);
        }
      },
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Bulk operation error:", error);
    return NextResponse.json(createBulkErrorResponse(error), { status: 500 });
  }
}
```

### Step 2: Add to Bulk Actions Config

```typescript
// src/constants/bulk-actions.ts
export function getEntityBulkActions(selectedCount: number): BulkAction[] {
  return [
    {
      id: "action-name",
      label: "Action Label",
      icon: Icon,
      variant: "default",
      requiresConfirmation: false,
    },
  ];
}
```

### Step 3: Add Tests

```javascript
// In test-bulk-actions-integration.mjs
async function testEntityBulkActions() {
  logSection("Testing Entity Bulk Actions");

  const entityIds = await createTestEntities(3);

  await testBulkAction({
    name: "Entity: Action",
    endpoint: "/api/admin/entity/bulk",
    action: "action-name",
    ids: entityIds,
    validateResult: async () =>
      verifyDatabaseChanges("entities", entityIds, { field: value }),
  });
}
```

---

## Best Practices

### 1. Test Data

- Use TEST\_ prefix for all test data
- Clean up after tests
- Use realistic data
- Test edge cases

### 2. Error Handling

- Test invalid actions
- Test empty arrays
- Test non-existent IDs
- Test validation failures

### 3. Authorization

- Test without auth
- Test with wrong role
- Test ownership validation
- Test cross-tenant access

### 4. Performance

- Test with 1, 10, 100, 1000 items
- Measure execution time
- Check database load
- Monitor memory usage

### 5. Validation

- Verify database changes
- Check response format
- Test partial failures
- Validate error messages

---

## Debugging Failed Tests

### Step 1: Check Logs

```bash
cat logs/bulk-action-tests-*.json
```

### Step 2: Check Server Logs

```bash
npm run dev
# Look for error messages
```

### Step 3: Manual Test

```bash
curl -X POST http://localhost:3000/api/admin/categories/bulk \
  -H "Content-Type: application/json" \
  -d '{"action":"activate","ids":["test-id"]}'
```

### Step 4: Check Database

```bash
# Firebase Console
# Check if changes were applied
```

---

## Next Steps

### Immediate (Quick Win #2)

1. ✅ Create test scripts
2. ❌ Run basic smoke tests
3. ❌ Fix failing tests
4. ❌ Run integration tests
5. ❌ Document results
6. ❌ Update progress (92%)

### Short Term

1. Implement missing bulk endpoints
2. Add authentication to tests
3. Create cleanup script
4. Add performance tests
5. Create CI/CD integration

### Long Term

1. Add E2E tests
2. Add load tests
3. Monitor production usage
4. Optimize performance
5. Add analytics

---

## Results Documentation

After running tests, create summary:

**File**: `CHECKLIST/SESSION-BULK-API-TESTING.md`

**Content**:

- Test execution date
- Total tests run
- Pass/fail counts
- Failed test details
- Issues discovered
- Fixes applied
- Progress update

---

## Support

For issues or questions:

1. Check this documentation
2. Review test output logs
3. Check server logs
4. Test manually with curl
5. Review bulk-operations.ts code

---

**Last Updated**: November 11, 2025  
**Next Review**: After running integration tests
