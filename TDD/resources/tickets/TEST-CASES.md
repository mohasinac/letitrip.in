# Tickets Resource - Test Cases

## Unit Tests

### Ticket Operations

```typescript
describe("Support Ticket Service", () => {
  describe("create", () => {
    it("should create support ticket", async () => {
      const ticket = await supportService.create({
        category: "order_issue",
        subject: "Order not delivered",
        description: "My order was supposed to arrive yesterday...",
        orderId: "order_001",
      });
      expect(ticket.id).toBeDefined();
      expect(ticket.ticketNumber).toMatch(/^TKT-\d{4}-\d+$/);
      expect(ticket.status).toBe("open");
    });

    it("should set priority based on category", async () => {
      const ticket = await supportService.create({
        category: "payment",
        subject: "Payment failed",
        description: "Money deducted but order not placed",
      });
      expect(ticket.priority).toBe("high");
    });

    it("should allow attachments", async () => {
      const ticket = await supportService.create({
        category: "product_inquiry",
        subject: "Question about product",
        description: "Is this available?",
        attachments: ["https://screenshot.jpg"],
      });
      expect(ticket.attachments).toHaveLength(1);
    });

    it("should link to order if orderId provided", async () => {
      const ticket = await supportService.create({
        category: "order_issue",
        subject: "Wrong item",
        orderId: "order_001",
      });
      expect(ticket.order.id).toBe("order_001");
    });
  });

  describe("getById", () => {
    it("should return ticket with messages", async () => {
      const ticket = await supportService.getById("ticket_001");
      expect(ticket).toHaveProperty("messages");
      expect(ticket.messages).toBeInstanceOf(Array);
    });

    it("should include agent info if assigned", async () => {
      const ticket = await supportService.getById("ticket_assigned");
      expect(ticket.assignedTo).toHaveProperty("name");
    });

    it("should fail for other user's ticket", async () => {
      await expect(supportService.getById("other_ticket")).rejects.toThrow(
        "Forbidden"
      );
    });
  });

  describe("reply", () => {
    it("should add user reply", async () => {
      const result = await supportService.reply("ticket_001", {
        message: "Any update on this?",
      });
      expect(result.messages).toContainEqual(
        expect.objectContaining({
          sender: "user",
          content: "Any update on this?",
        })
      );
    });

    it("should reopen closed ticket on reply", async () => {
      const result = await supportService.reply("ticket_closed", {
        message: "Issue is back",
      });
      expect(result.status).toBe("reopened");
    });
  });

  describe("list", () => {
    it("should return user's tickets", async () => {
      const tickets = await supportService.list();
      expect(tickets.data).toBeInstanceOf(Array);
    });

    it("should filter by status", async () => {
      const open = await supportService.list({ status: "open" });
      open.data.forEach((t) => {
        expect(t.status).toBe("open");
      });
    });
  });
});
```

### Agent/Admin Ticket Management

```typescript
describe("Admin Ticket Management", () => {
  describe("assign", () => {
    it("should assign ticket to agent", async () => {
      const result = await supportService.assign("ticket_001", "admin_001");
      expect(result.assignedTo.id).toBe("admin_001");
      expect(result.status).toBe("in_progress");
    });
  });

  describe("replyAsAgent", () => {
    it("should add agent reply", async () => {
      const result = await supportService.replyAsAgent("ticket_001", {
        message: "We're looking into this...",
      });
      expect(result.messages).toContainEqual(
        expect.objectContaining({
          sender: "agent",
          content: "We're looking into this...",
        })
      );
    });
  });

  describe("updateStatus", () => {
    it("should update ticket status", async () => {
      const result = await supportService.updateStatus(
        "ticket_001",
        "resolved"
      );
      expect(result.status).toBe("resolved");
    });
  });

  describe("updatePriority", () => {
    it("should escalate priority", async () => {
      const result = await supportService.updatePriority(
        "ticket_001",
        "critical"
      );
      expect(result.priority).toBe("critical");
    });
  });

  describe("listAdmin", () => {
    it("should return all tickets", async () => {
      const tickets = await supportService.listAdmin();
      expect(tickets.data).toBeInstanceOf(Array);
    });

    it("should filter unassigned", async () => {
      const unassigned = await supportService.listAdmin({ unassigned: true });
      unassigned.data.forEach((t) => {
        expect(t.assignedTo).toBeNull();
      });
    });
  });
});
```

---

## Integration Tests

### Ticket API

```typescript
describe("Ticket API Integration", () => {
  let userToken: string;

  beforeAll(async () => {
    userToken = await getTestUserToken();
  });

  describe("POST /api/tickets", () => {
    it("should create ticket", async () => {
      const response = await fetch("/api/tickets", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          category: "order_issue",
          subject: "Missing item",
          description: "One item missing from order",
          orderId: "order_001",
        }),
      });
      expect(response.status).toBe(201);
    });
  });

  describe("GET /api/tickets", () => {
    it("should return user tickets", async () => {
      const response = await fetch("/api/tickets", {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      expect(response.status).toBe(200);
    });
  });

  describe("POST /api/tickets/:id/reply", () => {
    it("should add reply", async () => {
      const response = await fetch("/api/tickets/ticket_001/reply", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: "Still waiting..." }),
      });
      expect(response.status).toBe(200);
    });
  });
});
```

### Admin Ticket API

```typescript
describe("Admin Ticket API Integration", () => {
  let adminToken: string;

  beforeAll(async () => {
    adminToken = await getTestAdminToken();
  });

  describe("GET /api/admin/tickets", () => {
    it("should return all tickets", async () => {
      const response = await fetch("/api/admin/tickets", {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      expect(response.status).toBe(200);
    });
  });

  describe("PATCH /api/admin/tickets/:id", () => {
    it("should update ticket", async () => {
      const response = await fetch("/api/admin/tickets/ticket_001", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${adminToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          assignedTo: "admin_001",
          priority: "high",
        }),
      });
      expect(response.status).toBe(200);
    });
  });
});
```
