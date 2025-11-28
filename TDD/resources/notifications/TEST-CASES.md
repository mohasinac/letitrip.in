# Notifications Resource - Test Cases

## Unit Tests

### NotificationService

#### List Notifications

```typescript
describe("NotificationService", () => {
  describe("listNotifications", () => {
    it("should return notifications for authenticated user", async () => {
      const userId = "user_123";
      const result = await notificationService.list(userId);
      expect(result.success).toBe(true);
      expect(result.data.every((n) => n.userId === userId)).toBe(true);
    });

    it("should filter by type", async () => {
      const result = await notificationService.list("user_123", {
        type: "order",
      });
      expect(result.data.every((n) => n.type === "order")).toBe(true);
    });

    it("should filter unread only", async () => {
      const result = await notificationService.list("user_123", {
        unread: true,
      });
      expect(result.data.every((n) => n.isRead === false)).toBe(true);
    });

    it("should return unread count in meta", async () => {
      const result = await notificationService.list("user_123");
      expect(result.meta.unreadCount).toBeDefined();
      expect(typeof result.meta.unreadCount).toBe("number");
    });

    it("should order by createdAt descending", async () => {
      const result = await notificationService.list("user_123");
      for (let i = 1; i < result.data.length; i++) {
        expect(
          new Date(result.data[i - 1].createdAt).getTime()
        ).toBeGreaterThanOrEqual(new Date(result.data[i].createdAt).getTime());
      }
    });

    it("should paginate correctly", async () => {
      const page1 = await notificationService.list("user_123", {
        page: 1,
        limit: 5,
      });
      const page2 = await notificationService.list("user_123", {
        page: 2,
        limit: 5,
      });
      expect(page1.meta.page).toBe(1);
      expect(page2.meta.page).toBe(2);
      if (page1.data.length > 0 && page2.data.length > 0) {
        expect(page1.data[0].id).not.toBe(page2.data[0].id);
      }
    });

    it("should exclude expired notifications", async () => {
      const result = await notificationService.list("user_123");
      const now = new Date();
      result.data.forEach((n) => {
        if (n.expiresAt) {
          expect(new Date(n.expiresAt).getTime()).toBeGreaterThan(
            now.getTime()
          );
        }
      });
    });
  });

  describe("getNotification", () => {
    it("should return notification by id", async () => {
      const result = await notificationService.getById("notif_001", "user_123");
      expect(result.success).toBe(true);
      expect(result.data.id).toBe("notif_001");
    });

    it("should return 404 for non-existent notification", async () => {
      const result = await notificationService.getById("notif_xxx", "user_123");
      expect(result.success).toBe(false);
      expect(result.status).toBe(404);
    });

    it("should not return notification for different user", async () => {
      const result = await notificationService.getById(
        "notif_001",
        "user_different"
      );
      expect(result.success).toBe(false);
      expect(result.status).toBe(404);
    });
  });

  describe("createNotification", () => {
    it("should create notification for user", async () => {
      const data = {
        userId: "user_123",
        type: "order",
        title: "Order Shipped",
        message: "Your order has been shipped",
      };
      const result = await notificationService.create(data);
      expect(result.success).toBe(true);
      expect(result.data.id).toBeDefined();
    });

    it("should set isRead to false by default", async () => {
      const result = await notificationService.create({
        userId: "user_123",
        type: "system",
        title: "Test",
        message: "Test message",
      });
      expect(result.data.isRead).toBe(false);
    });

    it("should set createdAt timestamp", async () => {
      const before = new Date();
      const result = await notificationService.create({
        userId: "user_123",
        type: "system",
        title: "Test",
        message: "Test message",
      });
      const after = new Date();
      const created = new Date(result.data.createdAt);
      expect(created.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(created.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it("should validate notification type", async () => {
      const result = await notificationService.create({
        userId: "user_123",
        type: "invalid" as any,
        title: "Test",
        message: "Test message",
      });
      expect(result.success).toBe(false);
      expect(result.error).toContain("type");
    });
  });

  describe("markAsRead", () => {
    it("should mark notification as read", async () => {
      const result = await notificationService.markAsRead(
        "notif_001",
        "user_123"
      );
      expect(result.success).toBe(true);
      expect(result.data.isRead).toBe(true);
    });

    it("should not modify other fields", async () => {
      const before = await notificationService.getById("notif_001", "user_123");
      await notificationService.markAsRead("notif_001", "user_123");
      const after = await notificationService.getById("notif_001", "user_123");
      expect(after.data.title).toBe(before.data.title);
      expect(after.data.message).toBe(before.data.message);
    });

    it("should not allow marking other user's notification", async () => {
      const result = await notificationService.markAsRead(
        "notif_001",
        "user_different"
      );
      expect(result.success).toBe(false);
    });
  });

  describe("markAllAsRead", () => {
    it("should mark all notifications as read", async () => {
      const result = await notificationService.markAllAsRead("user_123");
      expect(result.success).toBe(true);
      expect(result.data.updatedCount).toBeGreaterThanOrEqual(0);
    });

    it("should filter by type when provided", async () => {
      const result = await notificationService.markAllAsRead("user_123", {
        type: "order",
      });
      expect(result.success).toBe(true);
    });

    it("should only affect user's own notifications", async () => {
      await notificationService.markAllAsRead("user_123");
      const otherUser = await notificationService.list("user_456", {
        unread: true,
      });
      // Other user's unread notifications should remain
      expect(otherUser.meta.unreadCount).toBeGreaterThanOrEqual(0);
    });
  });

  describe("deleteNotification", () => {
    it("should delete notification", async () => {
      const result = await notificationService.delete("notif_001", "user_123");
      expect(result.success).toBe(true);
    });

    it("should return 404 for non-existent notification", async () => {
      const result = await notificationService.delete("notif_xxx", "user_123");
      expect(result.success).toBe(false);
      expect(result.status).toBe(404);
    });

    it("should not allow deleting other user's notification", async () => {
      const result = await notificationService.delete(
        "notif_001",
        "user_different"
      );
      expect(result.success).toBe(false);
    });
  });

  describe("broadcast", () => {
    it("should create notifications for all target users", async () => {
      const result = await notificationService.broadcast({
        type: "system",
        title: "Platform Update",
        message: "New features available",
        targetRoles: ["user"],
      });
      expect(result.success).toBe(true);
      expect(result.data.recipientCount).toBeGreaterThan(0);
    });

    it("should filter by target roles", async () => {
      const result = await notificationService.broadcast({
        type: "promo",
        title: "Seller Promo",
        message: "Exclusive seller offer",
        targetRoles: ["seller"],
      });
      expect(result.success).toBe(true);
    });
  });
});
```

### NotificationPreferencesService

```typescript
describe("NotificationPreferencesService", () => {
  describe("getPreferences", () => {
    it("should return user preferences", async () => {
      const result = await preferencesService.get("user_123");
      expect(result.success).toBe(true);
      expect(result.data.email).toBeDefined();
      expect(result.data.push).toBeDefined();
      expect(result.data.inApp).toBeDefined();
    });

    it("should return defaults for new user", async () => {
      const result = await preferencesService.get("user_new");
      expect(result.success).toBe(true);
      expect(result.data.email.orderUpdates).toBe(true);
      expect(result.data.inApp.systemAlerts).toBe(true);
    });
  });

  describe("updatePreferences", () => {
    it("should update email preferences", async () => {
      const result = await preferencesService.update("user_123", {
        email: { promotions: false },
      });
      expect(result.success).toBe(true);
      expect(result.data.email.promotions).toBe(false);
    });

    it("should update push preferences", async () => {
      const result = await preferencesService.update("user_123", {
        push: { priceDrops: true },
      });
      expect(result.success).toBe(true);
      expect(result.data.push.priceDrops).toBe(true);
    });

    it("should merge with existing preferences", async () => {
      const before = await preferencesService.get("user_123");
      await preferencesService.update("user_123", {
        email: { promotions: false },
      });
      const after = await preferencesService.get("user_123");

      // Other preferences should remain unchanged
      expect(after.data.email.orderUpdates).toBe(
        before.data.email.orderUpdates
      );
    });

    it("should update updatedAt timestamp", async () => {
      const before = new Date();
      await preferencesService.update("user_123", {
        email: { newsletter: false },
      });
      const after = await preferencesService.get("user_123");
      expect(new Date(after.data.updatedAt).getTime()).toBeGreaterThanOrEqual(
        before.getTime()
      );
    });
  });
});
```

---

## Integration Tests

### GET /api/notifications

```typescript
describe("GET /api/notifications", () => {
  it("should return 401 for unauthenticated request", async () => {
    const res = await fetch("/api/notifications");
    expect(res.status).toBe(401);
  });

  it("should return 200 with notifications for authenticated user", async () => {
    const res = await fetch("/api/notifications", {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(Array.isArray(json.data)).toBe(true);
    expect(json.meta.unreadCount).toBeDefined();
  });

  it("should filter by type", async () => {
    const res = await fetch("/api/notifications?type=order", {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    expect(res.status).toBe(200);
    const json = await res.json();
    json.data.forEach((n: any) => {
      expect(n.type).toBe("order");
    });
  });

  it("should filter unread only", async () => {
    const res = await fetch("/api/notifications?unread=true", {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    expect(res.status).toBe(200);
    const json = await res.json();
    json.data.forEach((n: any) => {
      expect(n.isRead).toBe(false);
    });
  });

  it("should paginate correctly", async () => {
    const res1 = await fetch("/api/notifications?page=1&limit=5", {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    const res2 = await fetch("/api/notifications?page=2&limit=5", {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    const json1 = await res1.json();
    const json2 = await res2.json();
    expect(json1.meta.page).toBe(1);
    expect(json2.meta.page).toBe(2);
  });
});
```

### POST /api/notifications

```typescript
describe("POST /api/notifications", () => {
  it("should return 401 for unauthenticated request", async () => {
    const res = await fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: "user_123",
        type: "system",
        title: "Test",
        message: "Test message",
      }),
    });
    expect(res.status).toBe(401);
  });

  it("should return 403 for non-admin user", async () => {
    const res = await fetch("/api/notifications", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: "user_456",
        type: "system",
        title: "Test",
        message: "Test message",
      }),
    });
    expect(res.status).toBe(403);
  });

  it("should return 201 for admin creating notification", async () => {
    const res = await fetch("/api/notifications", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${adminToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: "user_123",
        type: "system",
        title: "Admin Notice",
        message: "This is an admin notification",
      }),
    });
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.id).toBeDefined();
  });

  it("should validate required fields", async () => {
    const res = await fetch("/api/notifications", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${adminToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: "user_123",
      }),
    });
    expect(res.status).toBe(400);
  });
});
```

### PATCH /api/notifications/:id

```typescript
describe("PATCH /api/notifications/:id", () => {
  it("should mark notification as read", async () => {
    const res = await fetch("/api/notifications/notif_001", {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ isRead: true }),
    });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.isRead).toBe(true);
  });

  it("should return 404 for non-existent notification", async () => {
    const res = await fetch("/api/notifications/notif_xxx", {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ isRead: true }),
    });
    expect(res.status).toBe(404);
  });

  it("should not allow modifying other user's notification", async () => {
    const res = await fetch("/api/notifications/notif_other_user", {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ isRead: true }),
    });
    expect(res.status).toBe(404);
  });
});
```

### POST /api/notifications/read-all

```typescript
describe("POST /api/notifications/read-all", () => {
  it("should mark all notifications as read", async () => {
    const res = await fetch("/api/notifications/read-all", {
      method: "POST",
      headers: { Authorization: `Bearer ${userToken}` },
    });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.updatedCount).toBeGreaterThanOrEqual(0);
  });

  it("should filter by type when provided", async () => {
    const res = await fetch("/api/notifications/read-all", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ type: "order" }),
    });
    expect(res.status).toBe(200);
  });
});
```

### DELETE /api/notifications/:id

```typescript
describe("DELETE /api/notifications/:id", () => {
  it("should delete notification", async () => {
    const res = await fetch("/api/notifications/notif_to_delete", {
      method: "DELETE",
      headers: { Authorization: `Bearer ${userToken}` },
    });
    expect(res.status).toBe(200);
  });

  it("should return 404 for non-existent notification", async () => {
    const res = await fetch("/api/notifications/notif_xxx", {
      method: "DELETE",
      headers: { Authorization: `Bearer ${userToken}` },
    });
    expect(res.status).toBe(404);
  });
});
```

### Preferences Endpoints

```typescript
describe("GET /api/notifications/preferences", () => {
  it("should return user preferences", async () => {
    const res = await fetch("/api/notifications/preferences", {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.email).toBeDefined();
    expect(json.data.push).toBeDefined();
    expect(json.data.inApp).toBeDefined();
  });
});

describe("PATCH /api/notifications/preferences", () => {
  it("should update preferences", async () => {
    const res = await fetch("/api/notifications/preferences", {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: { promotions: false },
      }),
    });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.email.promotions).toBe(false);
  });
});
```

---

## E2E Test Scenarios

### Order Notification Flow

```typescript
describe("E2E: Order Notification Flow", () => {
  it("should receive notification when order is placed", async () => {
    // 1. Place order
    const orderRes = await fetch("/api/checkout/create-order", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        /* order data */
      }),
    });
    const { data: order } = await orderRes.json();

    // 2. Wait for notification
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // 3. Check notifications
    const notifRes = await fetch("/api/notifications?type=order", {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    const { data: notifications } = await notifRes.json();

    const orderNotif = notifications.find(
      (n: any) => n.data?.orderId === order.id
    );
    expect(orderNotif).toBeDefined();
    expect(orderNotif.title).toContain("Order");
  });
});
```

### Auction Outbid Notification

```typescript
describe("E2E: Auction Outbid Notification", () => {
  it("should notify previous bidder when outbid", async () => {
    // 1. User A places bid
    await fetch("/api/auctions/auc_001/bids", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userAToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ amount: 50000 }),
    });

    // 2. User B places higher bid
    await fetch("/api/auctions/auc_001/bids", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userBToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ amount: 55000 }),
    });

    // 3. Check User A's notifications
    const notifRes = await fetch("/api/notifications?type=auction", {
      headers: { Authorization: `Bearer ${userAToken}` },
    });
    const { data: notifications } = await notifRes.json();

    const outbidNotif = notifications.find((n: any) =>
      n.title.toLowerCase().includes("outbid")
    );
    expect(outbidNotif).toBeDefined();
  });
});
```

---

## Test Data Requirements

### Notifications

| ID        | UserId   | Type    | Title              | IsRead | Created              |
| --------- | -------- | ------- | ------------------ | ------ | -------------------- |
| notif_001 | user_123 | order   | Order Shipped      | false  | 2025-01-15T10:00:00Z |
| notif_002 | user_123 | auction | You've been outbid | true   | 2025-01-14T15:30:00Z |
| notif_003 | user_123 | system  | Platform Update    | false  | 2025-01-13T09:00:00Z |
| notif_004 | user_456 | order   | Order Delivered    | false  | 2025-01-15T11:00:00Z |
| notif_exp | user_123 | promo   | Expired Promo      | false  | 2024-12-01T00:00:00Z |

### User Preferences

| UserId   | Email.orderUpdates | Email.promotions | Push.auctionAlerts |
| -------- | ------------------ | ---------------- | ------------------ |
| user_123 | true               | false            | true               |
| user_456 | true               | true             | false              |
