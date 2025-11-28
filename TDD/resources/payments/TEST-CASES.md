# Payments Resource - Test Cases

## Unit Tests

### Payment Verification

```typescript
describe("Payment Service", () => {
  describe("verify", () => {
    it("should verify valid Razorpay signature", async () => {
      const result = await paymentService.verify({
        razorpay_payment_id: "pay_test123456",
        razorpay_order_id: "order_test123456",
        razorpay_signature: "valid_signature",
      });
      expect(result.verified).toBe(true);
    });

    it("should fail for invalid signature", async () => {
      await expect(
        paymentService.verify({
          razorpay_payment_id: "pay_test123456",
          razorpay_order_id: "order_test123456",
          razorpay_signature: "invalid_signature",
        })
      ).rejects.toThrow("Payment verification failed");
    });

    it("should update order status on success", async () => {
      await paymentService.verify({
        razorpay_payment_id: "pay_test123456",
        razorpay_order_id: "order_test123456",
        razorpay_signature: "valid_signature",
      });
      const order = await ordersService.getById("order_001");
      expect(order.paymentStatus).toBe("paid");
    });
  });

  describe("list", () => {
    it("should return user's payments", async () => {
      const payments = await paymentService.list();
      expect(payments.data).toBeInstanceOf(Array);
    });

    it("should include order info", async () => {
      const payments = await paymentService.list();
      payments.data.forEach((p) => {
        expect(p).toHaveProperty("orderNumber");
      });
    });
  });

  describe("getById", () => {
    it("should return payment details", async () => {
      const payment = await paymentService.getById("payment_001");
      expect(payment).toHaveProperty("razorpayId");
      expect(payment).toHaveProperty("method");
      expect(payment).toHaveProperty("status");
    });

    it("should fail for other user's payment", async () => {
      await expect(paymentService.getById("other_payment")).rejects.toThrow(
        "Forbidden"
      );
    });
  });
});
```

### Admin Payment Operations

```typescript
describe("Admin Payment Operations", () => {
  describe("listAdmin", () => {
    it("should return all payments", async () => {
      const payments = await paymentService.listAdmin();
      expect(payments.data).toBeInstanceOf(Array);
    });

    it("should filter by status", async () => {
      const captured = await paymentService.listAdmin({ status: "captured" });
      captured.data.forEach((p) => {
        expect(p.status).toBe("captured");
      });
    });

    it("should filter by method", async () => {
      const upi = await paymentService.listAdmin({ method: "upi" });
      upi.data.forEach((p) => {
        expect(p.method).toBe("upi");
      });
    });

    it("should filter by date range", async () => {
      const payments = await paymentService.listAdmin({
        from: "2024-11-01",
        to: "2024-11-30",
      });
      payments.data.forEach((p) => {
        const date = new Date(p.createdAt);
        expect(date >= new Date("2024-11-01")).toBe(true);
        expect(date <= new Date("2024-11-30")).toBe(true);
      });
    });
  });

  describe("refund", () => {
    it("should process full refund", async () => {
      const result = await paymentService.refund("payment_001", {
        amount: 129900,
        reason: "Customer request",
      });
      expect(result.status).toBe("processed");
      expect(result.amount).toBe(129900);
    });

    it("should process partial refund", async () => {
      const result = await paymentService.refund("payment_002", {
        amount: 50000,
        reason: "Partial return",
      });
      expect(result.amount).toBe(50000);
    });

    it("should fail if amount exceeds payment", async () => {
      await expect(
        paymentService.refund("payment_001", {
          amount: 500000,
          reason: "Too much",
        })
      ).rejects.toThrow("Refund amount exceeds payment amount");
    });

    it("should fail for already refunded payment", async () => {
      await expect(
        paymentService.refund("payment_refunded", {
          amount: 100,
          reason: "Duplicate",
        })
      ).rejects.toThrow("Payment already refunded");
    });
  });

  describe("getStats", () => {
    it("should return payment statistics", async () => {
      const stats = await paymentService.getStats({
        from: "2024-11-01",
        to: "2024-11-30",
      });
      expect(stats).toHaveProperty("totalAmount");
      expect(stats).toHaveProperty("totalCount");
      expect(stats).toHaveProperty("byMethod");
      expect(stats).toHaveProperty("successRate");
    });
  });
});
```

---

## Integration Tests

### Payment API

```typescript
describe("Payment API Integration", () => {
  let userToken: string;

  beforeAll(async () => {
    userToken = await getTestUserToken();
  });

  describe("GET /api/payments", () => {
    it("should return user payments", async () => {
      const response = await fetch("/api/payments", {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      expect(response.status).toBe(200);
    });
  });

  describe("POST /api/payments/verify", () => {
    it("should verify payment", async () => {
      const response = await fetch("/api/payments/verify", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          razorpay_payment_id: "pay_test123",
          razorpay_order_id: "order_test123",
          razorpay_signature: "valid_sig",
        }),
      });
      expect(response.status).toBe(200);
    });
  });
});
```

### Admin Payment API

```typescript
describe("Admin Payment API Integration", () => {
  let adminToken: string;

  beforeAll(async () => {
    adminToken = await getTestAdminToken();
  });

  describe("GET /api/admin/payments", () => {
    it("should return all payments", async () => {
      const response = await fetch("/api/admin/payments", {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      expect(response.status).toBe(200);
    });
  });

  describe("POST /api/admin/payments/:id/refund", () => {
    it("should process refund", async () => {
      const response = await fetch("/api/admin/payments/payment_001/refund", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${adminToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: 50000,
          reason: "Customer request",
        }),
      });
      expect(response.status).toBe(200);
    });
  });
});
```

### Checkout Payment Flow

```typescript
describe("Checkout Payment Flow", () => {
  it("should complete payment flow", async () => {
    // 1. Create order
    const order = await checkoutService.createOrder({
      addressId: "addr_001",
      paymentMethod: "razorpay",
    });
    expect(order.razorpayOrderId).toBeDefined();

    // 2. Simulate Razorpay payment
    const razorpayResult = {
      razorpay_payment_id: `pay_${Date.now()}`,
      razorpay_order_id: order.razorpayOrderId,
      razorpay_signature: "test_signature",
    };

    // 3. Verify payment
    const verified = await paymentService.verify(razorpayResult);
    expect(verified.verified).toBe(true);

    // 4. Check order status
    const updatedOrder = await ordersService.getById(order.id);
    expect(updatedOrder.paymentStatus).toBe("paid");
    expect(updatedOrder.status).toBe("processing");
  });
});
```
