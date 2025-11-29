# Returns Resource - Test Cases

## Unit Tests

### Return Request Operations

```typescript
describe("Returns Service", () => {
  describe("create", () => {
    it("should create return request", async () => {
      const returnReq = await returnsService.create({
        orderId: "order_001",
        orderItemId: "item_001",
        reason: "defective",
        description: "Product stopped working after 2 days",
      });
      expect(returnReq.id).toBeDefined();
      expect(returnReq.status).toBe("pending");
      expect(returnReq.returnNumber).toMatch(/^RET-\d{4}-\d+$/);
    });

    it("should fail if return window expired", async () => {
      await expect(
        returnsService.create({
          orderId: "order_old",
          orderItemId: "item_001",
          reason: "changed_mind",
        }),
      ).rejects.toThrow("Return window has expired");
    });

    it("should fail if already returned", async () => {
      await expect(
        returnsService.create({
          orderId: "order_with_return",
          orderItemId: "item_returned",
          reason: "defective",
        }),
      ).rejects.toThrow("Item already has return request");
    });

    it("should fail for non-returnable items", async () => {
      await expect(
        returnsService.create({
          orderId: "order_001",
          orderItemId: "item_non_returnable",
          reason: "changed_mind",
        }),
      ).rejects.toThrow("Item not eligible for return");
    });

    it("should allow images upload", async () => {
      const returnReq = await returnsService.create({
        orderId: "order_001",
        orderItemId: "item_001",
        reason: "defective",
        images: ["https://img1.jpg", "https://img2.jpg"],
      });
      expect(returnReq.images).toHaveLength(2);
    });
  });

  describe("getById", () => {
    it("should return return details", async () => {
      const returnReq = await returnsService.getById("return_001");
      expect(returnReq).toHaveProperty("order");
      expect(returnReq).toHaveProperty("item");
      expect(returnReq).toHaveProperty("timeline");
    });

    it("should include refund status", async () => {
      const returnReq = await returnsService.getById("return_approved");
      expect(returnReq).toHaveProperty("refundStatus");
      expect(returnReq).toHaveProperty("refundAmount");
    });

    it("should fail for other user's return", async () => {
      await expect(returnsService.getById("other_return")).rejects.toThrow(
        "Forbidden",
      );
    });
  });

  describe("list", () => {
    it("should return user's returns", async () => {
      const returns = await returnsService.list();
      expect(returns.data).toBeInstanceOf(Array);
    });

    it("should filter by status", async () => {
      const pending = await returnsService.list({ status: "pending" });
      pending.data.forEach((r) => {
        expect(r.status).toBe("pending");
      });
    });
  });
});
```

### Seller Return Management

```typescript
describe("Seller Returns", () => {
  let sellerToken: string;

  beforeAll(async () => {
    sellerToken = await getTestSellerToken();
  });

  describe("listSeller", () => {
    it("should return returns for seller's shop", async () => {
      const returns = await returnsService.listSeller();
      expect(returns.data).toBeInstanceOf(Array);
    });
  });

  describe("approve", () => {
    it("should approve return with full refund", async () => {
      const result = await returnsService.approve("return_001", {
        refundAmount: 129900,
      });
      expect(result.status).toBe("approved");
      expect(result.refundAmount).toBe(129900);
    });

    it("should approve with partial refund", async () => {
      const result = await returnsService.approve("return_002", {
        refundAmount: 50000,
        notes: "Partial refund due to wear",
      });
      expect(result.refundAmount).toBe(50000);
    });

    it("should fail for other seller's return", async () => {
      await expect(
        returnsService.approve("other_shop_return", { refundAmount: 100 }),
      ).rejects.toThrow("Forbidden");
    });
  });

  describe("reject", () => {
    it("should reject return with reason", async () => {
      const result = await returnsService.reject("return_003", {
        reason: "Product was damaged by user",
      });
      expect(result.status).toBe("rejected");
    });
  });
});
```

### Admin Return Override

```typescript
describe("Admin Returns", () => {
  describe("forceApprove", () => {
    it("should force approve rejected return", async () => {
      const result = await returnsService.forceApprove("return_rejected", {
        refundAmount: 100000,
      });
      expect(result.status).toBe("approved");
    });
  });

  describe("forceReject", () => {
    it("should force reject approved return", async () => {
      const result = await returnsService.forceReject("return_approved", {
        reason: "Fraud detected",
      });
      expect(result.status).toBe("rejected");
    });
  });
});
```

---

## Integration Tests

### Return API

```typescript
describe("Return API Integration", () => {
  let userToken: string;

  beforeAll(async () => {
    userToken = await getTestUserToken();
  });

  describe("POST /api/returns", () => {
    it("should create return request", async () => {
      const response = await fetch("/api/returns", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: "order_delivered",
          orderItemId: "item_001",
          reason: "defective",
          description: "Not working",
        }),
      });
      expect(response.status).toBe(201);
    });
  });

  describe("GET /api/returns/:id", () => {
    it("should return details", async () => {
      const response = await fetch("/api/returns/return_001", {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      expect(response.status).toBe(200);
    });
  });
});
```

### Seller Return API

```typescript
describe("Seller Return API Integration", () => {
  let sellerToken: string;

  beforeAll(async () => {
    sellerToken = await getTestSellerToken();
  });

  describe("GET /api/seller/returns", () => {
    it("should return shop returns", async () => {
      const response = await fetch("/api/seller/returns", {
        headers: { Authorization: `Bearer ${sellerToken}` },
      });
      expect(response.status).toBe(200);
    });
  });

  describe("PATCH /api/seller/returns/:id", () => {
    it("should approve return", async () => {
      const response = await fetch("/api/seller/returns/return_pending", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${sellerToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "approve",
          refundAmount: 100000,
        }),
      });
      expect(response.status).toBe(200);
    });
  });
});
```
