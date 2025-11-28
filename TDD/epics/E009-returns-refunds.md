# Epic E009: Returns & Refunds

## Overview

Return request management for delivered orders including approval workflow, refund processing, and escalation handling.

## Scope

- Return request creation
- Return approval/rejection
- Refund processing
- Escalation to admin
- Return media (photos/videos of issues)

## User Roles Involved

- **Admin**: Full return management, escalation handling
- **Seller**: Approve/reject returns for own shop
- **User**: Create return requests for own orders
- **Guest**: No access

---

## Features

### F009.1: Create Return Request

**US009.1.1**: Request Return

```
As a user
I want to request a return for a delivered order
So that I can get a refund

Acceptance Criteria:
- Given I have a delivered order within return window
- When I submit return request with reason and evidence
- Then return request is created
- And seller is notified

Return Reasons:
- Defective product
- Wrong item received
- Not as described
- Damaged in shipping
- Changed mind
- Other
```

### F009.2: Return Evidence

**US009.2.1**: Upload Return Media

```
Upload photos/videos showing the issue
```

### F009.3: Return Processing

**US009.3.1**: Approve Return (Seller)
**US009.3.2**: Reject Return (Seller)
**US009.3.3**: Escalate to Admin

### F009.4: Refund Processing

**US009.4.1**: Process Refund

```
Refund to original payment method
```

---

## API Endpoints

| Endpoint                   | Method | Auth         | Description        |
| -------------------------- | ------ | ------------ | ------------------ |
| `/api/returns`             | GET    | User         | List own returns   |
| `/api/returns`             | POST   | User         | Create return      |
| `/api/returns/:id`         | GET    | User         | Get return details |
| `/api/returns/:id`         | PATCH  | Seller/Admin | Update return      |
| `/api/returns/:id/approve` | POST   | Seller/Admin | Approve return     |
| `/api/returns/:id/reject`  | POST   | Seller/Admin | Reject return      |
| `/api/returns/:id/media`   | POST   | User         | Upload media       |
| `/api/returns/bulk`        | POST   | Seller/Admin | Bulk operations    |

---

## Data Models

```typescript
interface ReturnBE {
  id: string;
  orderId: string;
  orderItemId: string;
  customerId: string;
  shopId: string;
  reason:
    | "defective"
    | "wrong-item"
    | "not-as-described"
    | "damaged"
    | "changed-mind"
    | "other";
  description: string;
  media?: string[];
  status:
    | "requested"
    | "approved"
    | "rejected"
    | "item-received"
    | "refund-processed"
    | "completed"
    | "escalated";
  refundAmount?: number;
  refundMethod?: string;
  refundTransactionId?: string;
  refundedAt?: Timestamp;
  requiresAdminIntervention: boolean;
  adminNotes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

## Related Epics

- E005: Order Management (order returns)
- E011: Payment System (refund processing)

---

## Test Documentation

- **API Specs**: `/TDD/resources/returns/API-SPECS.md`
- **Test Cases**: `/TDD/resources/returns/TEST-CASES.md`

### Test Coverage

- Unit tests for return validation
- Unit tests for refund calculations
- Integration tests for return lifecycle
- E2E tests for complete return and refund flow
- RBAC tests for seller and admin processing

---

## Pending Routes

| Route             | Priority  | Status     | Notes                                                                      |
| ----------------- | --------- | ---------- | -------------------------------------------------------------------------- |
| `/user/returns`   | 🟡 MEDIUM | ⬜ PENDING | User's return requests list. Alternative: Navigate through `/user/orders`. |
| `/seller/returns` | 🟡 MEDIUM | ⬜ PENDING | Seller's return management.                                                |
| `/admin/returns`  | 🟡 MEDIUM | ⬜ PENDING | Admin returns moderation. Escalated returns.                               |

**Navigation Change**: Removed `/user/returns` from USER_MENU_ITEMS in `navigation.ts`.

**See**: `TDD/PENDING-ROUTES.md` for full details
