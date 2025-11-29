# Coupons Resource - Test Cases

## Unit Tests

### Coupon Validation

```typescript
describe("Coupon Service", () => {
  describe("validate", () => {
    it("should validate active coupon", async () => {
      const result = await couponsService.validate("SAVE20", {
        subtotal: 100000,
      });
      expect(result.isValid).toBe(true);
      expect(result.discount).toBe(20000); // 20% of 100000
    });

    it("should reject expired coupon", async () => {
      const result = await couponsService.validate("EXPIRED", {
        subtotal: 100000,
      });
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Coupon has expired");
    });

    it("should reject inactive coupon", async () => {
      const result = await couponsService.validate("INACTIVE", {
        subtotal: 100000,
      });
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Coupon is not active");
    });

    it("should check minimum order amount", async () => {
      const result = await couponsService.validate("MIN1000", {
        subtotal: 50000, // ₹500, minimum is ₹1000
      });
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Minimum order amount is ₹1,000");
    });

    it("should check usage limit", async () => {
      const result = await couponsService.validate("LIMITED", {
        subtotal: 100000,
      });
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Coupon usage limit reached");
    });

    it("should check user usage limit", async () => {
      const result = await couponsService.validate("ONCE_PER_USER", {
        subtotal: 100000,
        userId: "user_already_used",
      });
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("You have already used this coupon");
    });

    it("should validate category restrictions", async () => {
      const result = await couponsService.validate("ELECTRONICS_ONLY", {
        subtotal: 100000,
        categoryIds: ["fashion"],
      });
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Coupon not valid for selected categories");
    });

    it("should validate product restrictions", async () => {
      const result = await couponsService.validate("PRODUCT_SPECIFIC", {
        subtotal: 100000,
        productIds: ["prod_not_included"],
      });
      expect(result.isValid).toBe(false);
    });

    it("should check first order only coupons", async () => {
      const result = await couponsService.validate("FIRST_ORDER", {
        subtotal: 100000,
        userId: "user_with_orders",
      });
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Coupon is for first orders only");
    });
  });

  describe("calculateDiscount", () => {
    it("should calculate percentage discount", async () => {
      const discount = await couponsService.calculateDiscount("PERCENT10", {
        subtotal: 200000,
      });
      expect(discount).toBe(20000); // 10% of 200000
    });

    it("should apply maximum discount cap", async () => {
      const discount = await couponsService.calculateDiscount(
        "PERCENT50_MAX100",
        {
          subtotal: 500000, // Would be 250000, but capped at 100000
        },
      );
      expect(discount).toBe(100000);
    });

    it("should calculate fixed discount", async () => {
      const discount = await couponsService.calculateDiscount("FLAT500", {
        subtotal: 200000,
      });
      expect(discount).toBe(50000); // ₹500 in paise
    });

    it("should not exceed subtotal", async () => {
      const discount = await couponsService.calculateDiscount("FLAT500", {
        subtotal: 30000, // ₹300
      });
      expect(discount).toBe(30000); // Can't discount more than subtotal
    });
  });
});
```

### Coupon CRUD (Admin)

```typescript
describe("Coupon Admin Operations", () => {
  describe("create", () => {
    it("should create percentage coupon", async () => {
      const coupon = await couponsService.create({
        code: "SUMMER25",
        type: "percentage",
        value: 25,
        minOrderAmount: 50000,
        maxDiscount: 100000,
        startDate: "2024-06-01",
        endDate: "2024-08-31",
        usageLimit: 1000,
        perUserLimit: 1,
      });
      expect(coupon.code).toBe("SUMMER25");
      expect(coupon.isActive).toBe(true);
    });

    it("should create fixed coupon", async () => {
      const coupon = await couponsService.create({
        code: "FLAT100",
        type: "fixed",
        value: 10000,
        minOrderAmount: 50000,
      });
      expect(coupon.type).toBe("fixed");
      expect(coupon.value).toBe(10000);
    });

    it("should create category-specific coupon", async () => {
      const coupon = await couponsService.create({
        code: "ELEC20",
        type: "percentage",
        value: 20,
        categoryIds: ["cat_electronics"],
      });
      expect(coupon.categoryIds).toContain("cat_electronics");
    });

    it("should fail for duplicate code", async () => {
      await expect(
        couponsService.create({
          code: "EXISTING",
          type: "percentage",
          value: 10,
        }),
      ).rejects.toThrow("Coupon code already exists");
    });

    it("should validate discount value", async () => {
      await expect(
        couponsService.create({
          code: "INVALID",
          type: "percentage",
          value: 101,
        }),
      ).rejects.toThrow("Percentage must be between 1 and 100");
    });
  });

  describe("update", () => {
    it("should update coupon", async () => {
      const updated = await couponsService.update("coupon_001", {
        value: 30,
      });
      expect(updated.value).toBe(30);
    });

    it("should not allow changing code", async () => {
      await expect(
        couponsService.update("coupon_001", { code: "NEWCODE" }),
      ).rejects.toThrow("Cannot change coupon code");
    });
  });

  describe("deactivate", () => {
    it("should deactivate coupon", async () => {
      const result = await couponsService.deactivate("coupon_001");
      expect(result.isActive).toBe(false);
    });
  });

  describe("delete", () => {
    it("should delete unused coupon", async () => {
      const result = await couponsService.delete("coupon_unused");
      expect(result.success).toBe(true);
    });

    it("should fail for used coupon", async () => {
      await expect(couponsService.delete("coupon_used")).rejects.toThrow(
        "Cannot delete coupon that has been used",
      );
    });
  });
});
```

### Coupon Analytics

```typescript
describe("Coupon Analytics", () => {
  it("should return usage statistics", async () => {
    const stats = await couponsService.getStats("coupon_001");
    expect(stats).toHaveProperty("totalUsage");
    expect(stats).toHaveProperty("totalDiscount");
    expect(stats).toHaveProperty("averageOrderValue");
  });

  it("should return usage by date", async () => {
    const usage = await couponsService.getUsageByDate("coupon_001", {
      from: "2024-01-01",
      to: "2024-12-31",
    });
    expect(usage).toBeInstanceOf(Array);
    usage.forEach((day) => {
      expect(day).toHaveProperty("date");
      expect(day).toHaveProperty("count");
      expect(day).toHaveProperty("discount");
    });
  });
});
```

---

## Integration Tests

### Coupon Validation API

```typescript
describe("Coupon API Integration", () => {
  let userToken: string;

  beforeAll(async () => {
    userToken = await getTestUserToken();
  });

  describe("POST /api/coupons/validate", () => {
    it("should validate coupon", async () => {
      const response = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: "SAVE20",
          cartTotal: 100000,
        }),
      });
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.data.isValid).toBe(true);
      expect(data.data.discount).toBe(20000);
    });

    it("should return error for invalid coupon", async () => {
      const response = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: "INVALID" }),
      });
      expect(response.status).toBe(400);
    });
  });

  describe("POST /api/cart/apply-coupon", () => {
    it("should apply coupon to cart", async () => {
      const response = await fetch("/api/cart/apply-coupon", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: "SAVE20" }),
      });
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.data.coupon.code).toBe("SAVE20");
    });
  });

  describe("DELETE /api/cart/coupon", () => {
    it("should remove coupon from cart", async () => {
      const response = await fetch("/api/cart/coupon", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${userToken}` },
      });
      expect(response.status).toBe(200);
    });
  });
});
```

### Admin Coupon API

```typescript
describe("Admin Coupon API Integration", () => {
  let adminToken: string;

  beforeAll(async () => {
    adminToken = await getTestAdminToken();
  });

  describe("GET /api/admin/coupons", () => {
    it("should return all coupons", async () => {
      const response = await fetch("/api/admin/coupons", {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.data).toBeInstanceOf(Array);
    });

    it("should filter by status", async () => {
      const response = await fetch("/api/admin/coupons?status=active", {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const data = await response.json();
      data.data.forEach((coupon: any) => {
        expect(coupon.isActive).toBe(true);
      });
    });
  });

  describe("POST /api/admin/coupons", () => {
    it("should create coupon", async () => {
      const response = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${adminToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: "TEST50",
          type: "percentage",
          value: 50,
          minOrderAmount: 100000,
          maxDiscount: 50000,
        }),
      });
      expect(response.status).toBe(201);
    });
  });

  describe("PATCH /api/admin/coupons/:id", () => {
    it("should update coupon", async () => {
      const response = await fetch("/api/admin/coupons/coupon_001", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${adminToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ value: 25 }),
      });
      expect(response.status).toBe(200);
    });
  });

  describe("DELETE /api/admin/coupons/:id", () => {
    it("should delete coupon", async () => {
      const response = await fetch("/api/admin/coupons/coupon_unused", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      expect(response.status).toBe(200);
    });
  });
});
```

### Coupon in Checkout Flow

```typescript
describe("Coupon Checkout Integration", () => {
  it("should apply coupon discount to order total", async () => {
    // Add items to cart
    await cartService.addItem({ productId: "prod_001", quantity: 2 });

    // Apply coupon
    await cartService.applyCoupon("SAVE20");

    // Checkout
    const order = await checkoutService.complete({
      addressId: "addr_001",
      paymentMethod: "razorpay",
    });

    expect(order.coupon.code).toBe("SAVE20");
    expect(order.discount).toBeGreaterThan(0);
    expect(order.total).toBe(order.subtotal - order.discount);
  });

  it("should increment coupon usage after order", async () => {
    const before = await couponsService.getById("coupon_001");
    await completeOrderWithCoupon("SAVE20");
    const after = await couponsService.getById("coupon_001");
    expect(after.usageCount).toBe(before.usageCount + 1);
  });
});
```
