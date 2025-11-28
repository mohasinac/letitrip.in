# Orders Resource - Test Cases

## Unit Tests

### Order Listing Tests

```typescript
describe("OrdersService - User Orders", () => {
  beforeEach(() => {
    // Set user auth context
  });

  describe("getUserOrders", () => {
    it("should list user orders", async () => {
      const result = await ordersService.getUserOrders({ page: 1 });

      expect(result.data.length).toBeGreaterThan(0);
      result.data.forEach((order) => {
        expect(order.userId).toBe("test_user_001");
      });
    });

    it("should filter by status", async () => {
      const result = await ordersService.getUserOrders({ status: "delivered" });

      result.data.forEach((order) => {
        expect(order.status).toBe("delivered");
      });
    });

    it("should sort by date descending", async () => {
      const result = await ordersService.getUserOrders({
        sortBy: "createdAt",
        order: "desc",
      });

      for (let i = 1; i < result.data.length; i++) {
        expect(
          new Date(result.data[i].createdAt).getTime()
        ).toBeLessThanOrEqual(new Date(result.data[i - 1].createdAt).getTime());
      }
    });

    it("should paginate correctly", async () => {
      const page1 = await ordersService.getUserOrders({ page: 1, limit: 5 });
      const page2 = await ordersService.getUserOrders({ page: 2, limit: 5 });

      const page1Ids = new Set(page1.data.map((o) => o.id));
      page2.data.forEach((o) => {
        expect(page1Ids.has(o.id)).toBe(false);
      });
    });
  });

  describe("getById", () => {
    it("should get order details", async () => {
      const order = await ordersService.getById("test_order_001");

      expect(order.id).toBe("test_order_001");
      expect(order.orderNumber).toBeDefined();
      expect(order.items).toBeDefined();
      expect(order.pricing).toBeDefined();
      expect(order.shippingAddress).toBeDefined();
      expect(order.timeline).toBeDefined();
    });

    it("should include tracking info for shipped orders", async () => {
      const order = await ordersService.getById("test_order_001");

      expect(order.tracking).toBeDefined();
      expect(order.tracking.number).toBeDefined();
      expect(order.tracking.events).toBeDefined();
    });

    it("should return 404 for non-existent order", async () => {
      await expect(ordersService.getById("non_existent")).rejects.toThrow(
        "Order not found"
      );
    });

    it("should reject access to another user's order", async () => {
      // As test_user_001 trying to access test_user_002's order
      await expect(ordersService.getById("other_user_order")).rejects.toThrow(
        "Access denied"
      );
    });

    it("should indicate return eligibility", async () => {
      const order = await ordersService.getById("test_order_001");

      expect(order.canReturn).toBeDefined();
      expect(order.returnDeadline).toBeDefined();
    });

    it("should indicate cancellation eligibility", async () => {
      const pendingOrder = await ordersService.getById("test_order_002");
      expect(pendingOrder.canCancel).toBe(true);

      const deliveredOrder = await ordersService.getById("test_order_001");
      expect(deliveredOrder.canCancel).toBe(false);
    });
  });
});
```

---

### Order Cancellation Tests

```typescript
describe("OrdersService - Cancel", () => {
  describe("cancel", () => {
    it("should cancel pending order", async () => {
      const result = await ordersService.cancel("test_order_pending", {
        reason: "Changed mind",
      });

      expect(result.status).toBe("cancelled");
      expect(result.cancelReason).toBe("Changed mind");
    });

    it("should trigger refund for prepaid orders", async () => {
      const result = await ordersService.cancel("test_order_prepaid", {
        reason: "Changed mind",
      });

      expect(result.refundStatus).toBe("processing");
      expect(result.refundAmount).toBeGreaterThan(0);
    });

    it("should reject cancellation of shipped order", async () => {
      await expect(
        ordersService.cancel("test_order_shipped", { reason: "Changed mind" })
      ).rejects.toThrow("Order has already been shipped");
    });

    it("should reject cancellation of delivered order", async () => {
      await expect(
        ordersService.cancel("test_order_001", { reason: "Changed mind" })
      ).rejects.toThrow("Order cannot be cancelled");
    });

    it("should reject cancellation of already cancelled order", async () => {
      await expect(
        ordersService.cancel("test_order_003", { reason: "Changed mind" })
      ).rejects.toThrow("Order is already cancelled");
    });
  });
});
```

---

### Invoice Tests

```typescript
describe("OrdersService - Invoice", () => {
  describe("getInvoice", () => {
    it("should get invoice for paid order", async () => {
      const invoice = await ordersService.getInvoice("test_order_001");

      expect(invoice.invoiceUrl).toBeDefined();
      expect(invoice.invoiceNumber).toBeDefined();
    });

    it("should reject invoice for unpaid order", async () => {
      await expect(ordersService.getInvoice("test_order_002")).rejects.toThrow(
        "Invoice not available"
      );
    });
  });
});
```

---

### Checkout Tests

```typescript
describe("CheckoutService", () => {
  beforeEach(() => {
    // Set user auth context with items in cart
  });

  describe("createOrder", () => {
    it("should create order from cart", async () => {
      const result = await checkoutService.createOrder({
        shippingAddressId: "test_address_001",
        paymentMethod: "razorpay",
      });

      expect(result.orderId).toBeDefined();
      expect(result.orderNumber).toBeDefined();
      expect(result.total).toBeGreaterThan(0);
      expect(result.razorpayOrderId).toBeDefined();
    });

    it("should apply coupon discount", async () => {
      const result = await checkoutService.createOrder({
        shippingAddressId: "test_address_001",
        paymentMethod: "razorpay",
        couponCode: "SAVE10",
      });

      expect(result.total).toBeLessThan(129900); // Original price
    });

    it("should reject empty cart", async () => {
      // With empty cart
      await expect(
        checkoutService.createOrder({
          shippingAddressId: "test_address_001",
          paymentMethod: "razorpay",
        })
      ).rejects.toThrow("Cart is empty");
    });

    it("should reject invalid address", async () => {
      await expect(
        checkoutService.createOrder({
          shippingAddressId: "invalid_address",
          paymentMethod: "razorpay",
        })
      ).rejects.toThrow("Invalid shipping address");
    });

    it("should reject out of stock items", async () => {
      // Cart contains out of stock item
      await expect(
        checkoutService.createOrder({
          shippingAddressId: "test_address_001",
          paymentMethod: "razorpay",
        })
      ).rejects.toThrow("out of stock");
    });

    it("should reject invalid coupon", async () => {
      await expect(
        checkoutService.createOrder({
          shippingAddressId: "test_address_001",
          paymentMethod: "razorpay",
          couponCode: "INVALID_COUPON",
        })
      ).rejects.toThrow("invalid or expired");
    });

    it("should handle price changes gracefully", async () => {
      // Product price changed after adding to cart
      await expect(
        checkoutService.createOrder({
          shippingAddressId: "test_address_001",
          paymentMethod: "razorpay",
        })
      ).rejects.toThrow("prices have changed");
    });

    it("should clear cart after successful order", async () => {
      await checkoutService.createOrder({
        shippingAddressId: "test_address_001",
        paymentMethod: "razorpay",
      });

      const cart = await cartService.get();
      expect(cart.items).toHaveLength(0);
    });
  });

  describe("verifyPayment", () => {
    it("should verify valid payment", async () => {
      const result = await checkoutService.verifyPayment({
        orderId: "test_order_new",
        razorpay_payment_id: "pay_test123456",
        razorpay_order_id: "order_test123456",
        razorpay_signature: "valid_signature",
      });

      expect(result.paymentStatus).toBe("paid");
      expect(result.status).toBe("confirmed");
    });

    it("should reject invalid signature", async () => {
      await expect(
        checkoutService.verifyPayment({
          orderId: "test_order_new",
          razorpay_payment_id: "pay_test123456",
          razorpay_order_id: "order_test123456",
          razorpay_signature: "invalid_signature",
        })
      ).rejects.toThrow("Payment verification failed");
    });

    it("should reject already paid order", async () => {
      await expect(
        checkoutService.verifyPayment({
          orderId: "test_order_001", // Already paid
          razorpay_payment_id: "pay_test123456",
          razorpay_order_id: "order_test123456",
          razorpay_signature: "valid_signature",
        })
      ).rejects.toThrow("Order already paid");
    });
  });
});
```

---

### Seller Order Tests

```typescript
describe("OrdersService - Seller", () => {
  beforeEach(() => {
    // Set seller auth context
  });

  describe("getSellerOrders", () => {
    it("should list seller orders only", async () => {
      const result = await ordersService.getSellerOrders({});

      result.data.forEach((order) => {
        expect(order.shopId).toBe("test_shop_001");
      });
    });

    it("should include order stats", async () => {
      const result = await ordersService.getSellerOrders({});

      expect(result.meta.stats).toBeDefined();
      expect(result.meta.stats.pending).toBeDefined();
      expect(result.meta.stats.processing).toBeDefined();
    });
  });

  describe("updateStatus", () => {
    it("should update to processing", async () => {
      const result = await ordersService.updateStatus("seller_order_pending", {
        status: "processing",
      });

      expect(result.status).toBe("processing");
    });

    it("should require tracking for shipping", async () => {
      await expect(
        ordersService.updateStatus("seller_order_processing", {
          status: "shipped",
          // Missing tracking info
        })
      ).rejects.toThrow("Tracking number required");
    });

    it("should update to shipped with tracking", async () => {
      const result = await ordersService.updateStatus(
        "seller_order_processing",
        {
          status: "shipped",
          trackingNumber: "DTDC123456789",
          trackingCarrier: "DTDC",
        }
      );

      expect(result.status).toBe("shipped");
      expect(result.tracking.number).toBe("DTDC123456789");
    });

    it("should reject invalid status transition", async () => {
      // Cannot go from pending to delivered directly
      await expect(
        ordersService.updateStatus("seller_order_pending", {
          status: "delivered",
        })
      ).rejects.toThrow("Invalid status transition");
    });

    it("should reject update of another seller's order", async () => {
      await expect(
        ordersService.updateStatus("other_seller_order", {
          status: "processing",
        })
      ).rejects.toThrow("Access denied");
    });

    it("should notify customer on status change", async () => {
      // Verify notification was sent (mock check)
      const result = await ordersService.updateStatus("seller_order_pending", {
        status: "processing",
      });

      // Notification assertions
    });
  });

  describe("bulkSeller", () => {
    it("should bulk mark as shipped", async () => {
      const result = await ordersService.bulkSeller({
        action: "mark_shipped",
        orderIds: ["seller_order_001", "seller_order_002"],
        trackingCarrier: "DTDC",
      });

      expect(result.processed).toBe(2);
    });

    it("should handle partial failures", async () => {
      const result = await ordersService.bulkSeller({
        action: "mark_shipped",
        orderIds: ["seller_order_001", "invalid_order"],
        trackingCarrier: "DTDC",
      });

      expect(result.processed).toBe(1);
      expect(result.failed).toBe(1);
    });
  });
});
```

---

### Admin Order Tests

```typescript
describe("OrdersService - Admin", () => {
  beforeEach(() => {
    // Set admin auth context
  });

  describe("getAdminOrders", () => {
    it("should list all orders", async () => {
      const result = await ordersService.getAdminOrders({});

      expect(result.data.length).toBeGreaterThan(0);
    });

    it("should filter by shop", async () => {
      const result = await ordersService.getAdminOrders({
        shop: "test_shop_001",
      });

      result.data.forEach((order) => {
        expect(order.shopId).toBe("test_shop_001");
      });
    });

    it("should filter by payment status", async () => {
      const result = await ordersService.getAdminOrders({ payment: "paid" });

      result.data.forEach((order) => {
        expect(order.paymentStatus).toBe("paid");
      });
    });
  });

  describe("adminAction", () => {
    it("should force refund", async () => {
      const result = await ordersService.adminAction("test_order_001", {
        action: "force_refund",
        refundAmount: 50000,
        reason: "Customer complaint",
      });

      expect(result.refundStatus).toBe("processing");
      expect(result.refundAmount).toBe(50000);
    });

    it("should override status", async () => {
      const result = await ordersService.adminAction("test_order_stuck", {
        action: "override_status",
        status: "delivered",
        reason: "Manual verification",
      });

      expect(result.status).toBe("delivered");
    });

    it("should add admin note", async () => {
      const result = await ordersService.adminAction("test_order_001", {
        action: "add_note",
        note: "Customer called about delay",
      });

      expect(result.adminNotes).toContain("Customer called about delay");
    });
  });
});
```

---

## Integration Tests

### Complete Checkout Flow

```typescript
describe("Checkout Flow Integration", () => {
  it("should complete full checkout flow", async () => {
    // 1. Add items to cart
    await cartService.add({
      productId: "test_product_001",
      quantity: 1,
    });

    // 2. Create order
    const orderResult = await checkoutService.createOrder({
      shippingAddressId: "test_address_001",
      paymentMethod: "razorpay",
    });

    expect(orderResult.orderId).toBeDefined();
    expect(orderResult.razorpayOrderId).toBeDefined();

    // 3. Simulate payment (mock Razorpay)
    const paymentResult = await checkoutService.verifyPayment({
      orderId: orderResult.orderId,
      razorpay_payment_id: "pay_simulated",
      razorpay_order_id: orderResult.razorpayOrderId,
      razorpay_signature: "simulated_signature",
    });

    expect(paymentResult.paymentStatus).toBe("paid");
    expect(paymentResult.status).toBe("confirmed");

    // 4. Verify order appears in user orders
    const userOrders = await ordersService.getUserOrders({});
    expect(userOrders.data.some((o) => o.id === orderResult.orderId)).toBe(
      true
    );

    // 5. Verify cart is cleared
    const cart = await cartService.get();
    expect(cart.items).toHaveLength(0);
  });
});
```

---

### Order Lifecycle Integration

```typescript
describe("Order Lifecycle Integration", () => {
  it("should complete order lifecycle", async () => {
    // Assuming order already created and paid

    // 1. Seller marks as processing
    await ordersService.updateStatus("lifecycle_order", {
      status: "processing",
    });

    // 2. Seller ships order
    await ordersService.updateStatus("lifecycle_order", {
      status: "shipped",
      trackingNumber: "TEST123456",
      trackingCarrier: "DTDC",
    });

    // 3. Order delivered
    await ordersService.updateStatus("lifecycle_order", {
      status: "delivered",
    });

    // 4. Verify final state
    const order = await ordersService.getById("lifecycle_order");
    expect(order.status).toBe("delivered");
    expect(order.timeline).toHaveLength(5); // placed, confirmed, processing, shipped, delivered
  });
});
```

---

## Test Coverage Targets

| Area                 | Target | Priority |
| -------------------- | ------ | -------- |
| User Orders          | 90%    | High     |
| Checkout Flow        | 95%    | Critical |
| Payment Verification | 95%    | Critical |
| Order Cancellation   | 90%    | High     |
| Seller Operations    | 85%    | High     |
| Admin Operations     | 80%    | Medium   |
| Status Transitions   | 100%   | Critical |

---

## Test Data Dependencies

- Requires test orders from `TEST-DATA-REQUIREMENTS.md`
- Need orders in various statuses
- Razorpay test/mock configuration
- Test products in cart for checkout tests
