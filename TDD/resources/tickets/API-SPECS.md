# Support Tickets Resource - API Specifications

## Overview

Customer support ticket management APIs.

---

## Endpoints

### User Endpoints

#### GET /api/tickets

List user's tickets.

**Headers**: `Authorization: Bearer <token>`

**Query Parameters**:

| Param  | Type   | Default | Description               |
| ------ | ------ | ------- | ------------------------- |
| status | string | -       | open/in_progress/resolved |

---

#### POST /api/tickets

Create support ticket.

**Request Body**:

```json
{
  "category": "order_issue",
  "subject": "Order not delivered",
  "description": "My order ORD-2024-001234 was supposed to be delivered 3 days ago...",
  "orderId": "order_001",
  "priority": "high",
  "attachments": ["https://..."]
}
```

**Response (201)**:

```json
{
  "success": true,
  "data": {
    "id": "ticket_001",
    "ticketNumber": "TKT-2024-001234",
    "status": "open",
    "priority": "high",
    "createdAt": "2024-11-29T10:00:00Z"
  },
  "message": "Ticket created. We'll respond within 24 hours."
}
```

---

#### GET /api/tickets/:id

Get ticket details.

**Response (200)**:

```json
{
  "success": true,
  "data": {
    "id": "ticket_001",
    "ticketNumber": "TKT-2024-001234",
    "category": "order_issue",
    "subject": "Order not delivered",
    "description": "My order...",
    "status": "in_progress",
    "priority": "high",
    "order": {
      "id": "order_001",
      "orderNumber": "ORD-2024-001234"
    },
    "assignedTo": {
      "id": "admin_001",
      "name": "Support Agent"
    },
    "messages": [
      {
        "id": "msg_001",
        "sender": "user",
        "content": "My order...",
        "createdAt": "2024-11-29T10:00:00Z"
      },
      {
        "id": "msg_002",
        "sender": "agent",
        "agentName": "Support Agent",
        "content": "We're looking into this...",
        "createdAt": "2024-11-29T12:00:00Z"
      }
    ],
    "createdAt": "2024-11-29T10:00:00Z"
  }
}
```

---

#### POST /api/tickets/:id/reply

Reply to ticket.

**Request Body**:

```json
{
  "message": "Thank you for the update...",
  "attachments": []
}
```

---

### Seller Endpoints

#### GET /api/seller/tickets

List tickets related to seller's shop.

---

#### POST /api/seller/tickets/:id/reply

Reply to ticket as seller.

---

### Admin Endpoints

#### GET /api/admin/tickets

List all tickets.

**Query Parameters**:

| Param      | Type   | Default | Description          |
| ---------- | ------ | ------- | -------------------- |
| status     | string | -       | Filter by status     |
| priority   | string | -       | Filter by priority   |
| assignedTo | string | -       | Filter by agent      |
| unassigned | bool   | -       | Show unassigned only |

---

#### PATCH /api/admin/tickets/:id

Update ticket (assign, change status, priority).

**Request Body**:

```json
{
  "assignedTo": "admin_001",
  "status": "in_progress",
  "priority": "high"
}
```

---

## RBAC Permissions

| Endpoint                 | Guest | User | Seller | Admin |
| ------------------------ | ----- | ---- | ------ | ----- |
| GET /tickets             | ❌    | ✅   | ✅     | ✅    |
| POST /tickets            | ❌    | ✅   | ✅     | ✅    |
| GET /tickets/:id         | ❌    | ✅\* | ✅\*   | ✅    |
| POST /tickets/:id/reply  | ❌    | ✅\* | ✅\*   | ✅    |
| GET /admin/tickets       | ❌    | ❌   | ❌     | ✅    |
| PATCH /admin/tickets/:id | ❌    | ❌   | ❌     | ✅    |

\*Own tickets only

---

## Ticket Categories

- `order_issue` - Order related issues
- `payment` - Payment problems
- `product_inquiry` - Product questions
- `return_refund` - Return/refund issues
- `account` - Account issues
- `other` - Other inquiries

## Priority Levels

- `low` - General inquiries
- `medium` - Standard issues
- `high` - Urgent issues
- `critical` - Requires immediate attention

---

## Service Usage

```typescript
import { supportService } from "@/services";

// User
const tickets = await supportService.list({ status: "open" });
await supportService.create({
  category: "order_issue",
  subject: "Order not delivered",
  description: "...",
  orderId: "order_001",
});
const ticket = await supportService.getById("ticket_001");
await supportService.reply("ticket_001", { message: "Thank you..." });

// Admin
const allTickets = await supportService.listAdmin({ unassigned: true });
await supportService.assign("ticket_001", "admin_001");
await supportService.updateStatus("ticket_001", "resolved");
```
