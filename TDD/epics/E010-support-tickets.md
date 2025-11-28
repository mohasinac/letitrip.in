# Epic E010: Support Tickets

## Overview

Customer support ticket system for handling inquiries, complaints, and issues with threaded messaging and escalation.

## Scope

- Ticket creation and management
- Ticket messaging (threaded)
- Ticket assignment and escalation
- Ticket categories and priorities
- Internal notes

## User Roles Involved

- **Admin**: Full ticket management, assignment, internal notes
- **Seller**: Handle tickets for own shop
- **User**: Create and reply to own tickets
- **Guest**: No access

---

## Features

### F010.1: Create Ticket

**US010.1.1**: Submit Support Ticket

```
As a user
I want to create a support ticket
So that I can get help with an issue

Categories:
- Order issue
- Return/Refund
- Product question
- Account issue
- Payment problem
- Other

Priority:
- Low
- Medium
- High
- Urgent
```

### F010.2: Ticket Messaging

**US010.2.1**: Reply to Ticket
**US010.2.2**: Add Attachments

### F010.3: Ticket Management

**US010.3.1**: Assign Ticket (Admin)
**US010.3.2**: Escalate Ticket
**US010.3.3**: Close Ticket
**US010.3.4**: Add Internal Note (Admin)

---

## API Endpoints

| Endpoint                 | Method | Auth       | Description      |
| ------------------------ | ------ | ---------- | ---------------- |
| `/api/tickets`           | GET    | User       | List own tickets |
| `/api/tickets`           | POST   | User       | Create ticket    |
| `/api/tickets/:id`       | GET    | User       | Get ticket       |
| `/api/tickets/:id`       | PATCH  | User/Admin | Update ticket    |
| `/api/tickets/:id/reply` | POST   | User/Admin | Reply to ticket  |
| `/api/tickets/bulk`      | POST   | Admin      | Bulk operations  |

---

## Data Models

```typescript
interface SupportTicketBE {
  id: string;
  userId: string;
  shopId?: string;
  orderId?: string;
  category:
    | "order-issue"
    | "return-refund"
    | "product-question"
    | "account"
    | "payment"
    | "other";
  priority: "low" | "medium" | "high" | "urgent";
  subject: string;
  description: string;
  attachments?: string[];
  status: "open" | "in-progress" | "resolved" | "closed" | "escalated";
  assignedTo?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  resolvedAt?: Timestamp;
}

interface SupportTicketMessageBE {
  id: string;
  ticketId: string;
  senderId: string;
  senderRole: "admin" | "seller" | "user";
  message: string;
  attachments?: string[];
  isInternal: boolean;
  createdAt: Timestamp;
}
```

## Related Epics

- E005: Order Management (order-related tickets)
- E009: Returns & Refunds (return-related tickets)

---

## Test Documentation

- **API Specs**: `/TDD/resources/tickets/API-SPECS.md`
- **Test Cases**: `/TDD/resources/tickets/TEST-CASES.md`

### Test Coverage

- Unit tests for ticket validation
- Unit tests for status transitions
- Integration tests for CRUD operations
- E2E tests for ticket creation to resolution flow
- RBAC tests for admin ticket management
