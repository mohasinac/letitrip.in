# Payouts Resource - Test Cases

## Unit Tests

### Payout Request

```typescript
describe("Payout Service", () => {
  describe("request", () => {
    it("should create payout request", async () => {
      const payout = await payoutsService.request({ amount: 50000 });
      expect(payout.id).toBeDefined();
      expect(payout.status).toBe("pending");
      expect(payout.amount).toBe(50000);
    });

    it("should fail if insufficient balance", async () => {
      await expect(payoutsService.request({ amount: 1000000 })).rejects.toThrow(
        "Insufficient available balance",
      );
    });

    it("should fail below minimum amount", async () => {
      await expect(payoutsService.request({ amount: 10000 })).rejects.toThrow(
        "Minimum payout is ₹500",
      );
    });

    it("should fail if pending payout exists", async () => {
      await payoutsService.request({ amount: 50000 });
      await expect(payoutsService.request({ amount: 50000 })).rejects.toThrow(
        "You have a pending payout",
      );
    });

    it("should fail if bank not verified", async () => {
      // Switch to seller with unverified bank
      await expect(payoutsService.request({ amount: 50000 })).rejects.toThrow(
        "Please verify bank account",
      );
    });
  });

  describe("list", () => {
    it("should return seller's payouts", async () => {
      const payouts = await payoutsService.list();
      expect(payouts.data).toBeInstanceOf(Array);
    });

    it("should include balance info", async () => {
      const payouts = await payoutsService.list();
      expect(payouts.meta).toHaveProperty("availableBalance");
      expect(payouts.meta).toHaveProperty("pendingPayout");
    });
  });

  describe("getRevenue", () => {
    it("should return revenue breakdown", async () => {
      const revenue = await payoutsService.getRevenue();
      expect(revenue).toHaveProperty("totalEarnings");
      expect(revenue).toHaveProperty("availableBalance");
      expect(revenue).toHaveProperty("pendingSettlement");
      expect(revenue).toHaveProperty("totalWithdrawn");
    });

    it("should include monthly breakdown", async () => {
      const revenue = await payoutsService.getRevenue();
      expect(revenue.breakdown).toHaveProperty("thisMonth");
      expect(revenue.breakdown).toHaveProperty("lastMonth");
    });
  });
});
```

### Admin Payout Processing

```typescript
describe("Admin Payout Processing", () => {
  describe("getPending", () => {
    it("should return pending payouts", async () => {
      const pending = await payoutsService.getPending();
      pending.data.forEach((p) => {
        expect(p.status).toBe("pending");
      });
    });

    it("should include seller info", async () => {
      const pending = await payoutsService.getPending();
      pending.data.forEach((p) => {
        expect(p).toHaveProperty("shop");
        expect(p).toHaveProperty("bankAccount");
      });
    });
  });

  describe("process", () => {
    it("should process multiple payouts", async () => {
      const result = await payoutsService.process(["payout_001", "payout_002"]);
      expect(result.processed).toBe(2);
      expect(result.failed).toBe(0);
    });

    it("should handle partial failures", async () => {
      const result = await payoutsService.process([
        "payout_valid",
        "payout_invalid_bank",
      ]);
      expect(result.processed).toBe(1);
      expect(result.failed).toBe(1);
      expect(result.errors).toHaveLength(1);
    });
  });

  describe("updateStatus", () => {
    it("should mark as processed", async () => {
      const result = await payoutsService.updateStatus("payout_001", {
        status: "processed",
        transactionId: "TXN123456",
      });
      expect(result.status).toBe("processed");
      expect(result.transactionId).toBe("TXN123456");
    });

    it("should mark as failed", async () => {
      const result = await payoutsService.updateStatus("payout_002", {
        status: "failed",
        failureReason: "Invalid bank account",
      });
      expect(result.status).toBe("failed");
    });
  });

  describe("listAdmin", () => {
    it("should return all payouts", async () => {
      const payouts = await payoutsService.listAdmin();
      expect(payouts.data).toBeInstanceOf(Array);
    });

    it("should filter by status", async () => {
      const pending = await payoutsService.listAdmin({ status: "pending" });
      pending.data.forEach((p) => {
        expect(p.status).toBe("pending");
      });
    });

    it("should filter by shop", async () => {
      const shopPayouts = await payoutsService.listAdmin({ shop: "shop_001" });
      shopPayouts.data.forEach((p) => {
        expect(p.shop.id).toBe("shop_001");
      });
    });
  });
});
```

---

## Integration Tests

### Seller Payout API

```typescript
describe("Seller Payout API Integration", () => {
  let sellerToken: string;

  beforeAll(async () => {
    sellerToken = await getTestSellerToken();
  });

  describe("GET /api/seller/payouts", () => {
    it("should return payouts", async () => {
      const response = await fetch("/api/seller/payouts", {
        headers: { Authorization: `Bearer ${sellerToken}` },
      });
      expect(response.status).toBe(200);
    });
  });

  describe("POST /api/seller/payouts/request", () => {
    it("should create payout request", async () => {
      const response = await fetch("/api/seller/payouts/request", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${sellerToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount: 50000 }),
      });
      expect(response.status).toBe(201);
    });
  });

  describe("GET /api/seller/revenue", () => {
    it("should return revenue data", async () => {
      const response = await fetch("/api/seller/revenue", {
        headers: { Authorization: `Bearer ${sellerToken}` },
      });
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.data).toHaveProperty("totalEarnings");
    });
  });
});
```

### Admin Payout API

```typescript
describe("Admin Payout API Integration", () => {
  let adminToken: string;

  beforeAll(async () => {
    adminToken = await getTestAdminToken();
  });

  describe("GET /api/admin/payouts", () => {
    it("should return all payouts", async () => {
      const response = await fetch("/api/admin/payouts", {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      expect(response.status).toBe(200);
    });
  });

  describe("GET /api/admin/payouts/pending", () => {
    it("should return pending payouts", async () => {
      const response = await fetch("/api/admin/payouts/pending", {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      expect(response.status).toBe(200);
    });
  });

  describe("POST /api/admin/payouts/process", () => {
    it("should process payouts", async () => {
      const response = await fetch("/api/admin/payouts/process", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${adminToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          payoutIds: ["payout_001", "payout_002"],
        }),
      });
      expect(response.status).toBe(200);
    });
  });

  describe("PATCH /api/admin/payouts/:id", () => {
    it("should update payout status", async () => {
      const response = await fetch("/api/admin/payouts/payout_001", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${adminToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "processed",
          transactionId: "TXN123456",
        }),
      });
      expect(response.status).toBe(200);
    });
  });
});
```
