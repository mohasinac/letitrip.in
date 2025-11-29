# Shops Resource - Test Cases

## Unit Tests

### Shop Operations

```typescript
describe("Shop Service", () => {
  describe("getBySlug", () => {
    it("should return shop by slug", async () => {
      const shop = await shopsService.getBySlug("tech-store");
      expect(shop.name).toBe("Tech Store");
      expect(shop.slug).toBe("tech-store");
    });

    it("should include owner info", async () => {
      const shop = await shopsService.getBySlug("tech-store");
      expect(shop.owner).toHaveProperty("name");
      expect(shop.owner).toHaveProperty("id");
    });

    it("should throw for non-existent shop", async () => {
      await expect(shopsService.getBySlug("invalid")).rejects.toThrow(
        "Shop not found",
      );
    });

    it("should include product count", async () => {
      const shop = await shopsService.getBySlug("tech-store");
      expect(shop.productCount).toBeGreaterThan(0);
    });

    it("should include ratings", async () => {
      const shop = await shopsService.getBySlug("tech-store");
      expect(shop.rating).toHaveProperty("average");
      expect(shop.rating).toHaveProperty("count");
    });
  });

  describe("getProducts", () => {
    it("should return shop products", async () => {
      const products = await shopsService.getProducts("shop_001");
      expect(products.data).toBeInstanceOf(Array);
      expect(products.meta.total).toBeGreaterThan(0);
    });

    it("should filter by category", async () => {
      const products = await shopsService.getProducts("shop_001", {
        category: "electronics",
      });
      products.data.forEach((p) => {
        expect(p.category.slug).toBe("electronics");
      });
    });

    it("should paginate results", async () => {
      const page1 = await shopsService.getProducts("shop_001", { page: 1 });
      const page2 = await shopsService.getProducts("shop_001", { page: 2 });
      expect(page1.data[0].id).not.toBe(page2.data[0].id);
    });
  });

  describe("list", () => {
    it("should return all active shops", async () => {
      const shops = await shopsService.list();
      shops.data.forEach((shop) => {
        expect(shop.status).toBe("active");
      });
    });

    it("should filter by verification status", async () => {
      const verified = await shopsService.list({ verified: true });
      verified.data.forEach((shop) => {
        expect(shop.isVerified).toBe(true);
      });
    });

    it("should search by name", async () => {
      const results = await shopsService.list({ search: "tech" });
      results.data.forEach((shop) => {
        expect(shop.name.toLowerCase()).toContain("tech");
      });
    });
  });
});
```

### Seller Shop Management

```typescript
describe("Seller Shop Management", () => {
  let sellerToken: string;

  beforeAll(async () => {
    sellerToken = await getTestSellerToken();
  });

  describe("getMyShop", () => {
    it("should return seller's shop", async () => {
      const shop = await shopsService.getMyShop();
      expect(shop).toHaveProperty("id");
      expect(shop).toHaveProperty("name");
    });

    it("should include analytics data", async () => {
      const shop = await shopsService.getMyShop();
      expect(shop.analytics).toHaveProperty("totalSales");
      expect(shop.analytics).toHaveProperty("totalOrders");
    });
  });

  describe("create", () => {
    it("should create shop for new seller", async () => {
      const shop = await shopsService.create({
        name: "New Shop",
        description: "A new shop",
        logo: "https://...",
      });
      expect(shop.id).toBeDefined();
      expect(shop.status).toBe("pending");
    });

    it("should generate slug from name", async () => {
      const shop = await shopsService.create({ name: "My Amazing Store" });
      expect(shop.slug).toBe("my-amazing-store");
    });

    it("should fail if seller already has shop", async () => {
      await expect(
        shopsService.create({ name: "Second Shop" }),
      ).rejects.toThrow("Seller already has a shop");
    });

    it("should validate required fields", async () => {
      await expect(shopsService.create({})).rejects.toThrow(
        "Shop name is required",
      );
    });
  });

  describe("update", () => {
    it("should update shop details", async () => {
      const updated = await shopsService.update("shop_001", {
        name: "Updated Name",
      });
      expect(updated.name).toBe("Updated Name");
    });

    it("should update banner and logo", async () => {
      const updated = await shopsService.update("shop_001", {
        logo: "https://new-logo.jpg",
        banner: "https://new-banner.jpg",
      });
      expect(updated.logo).toContain("new-logo");
    });

    it("should fail for other seller's shop", async () => {
      await expect(
        shopsService.update("other_shop", { name: "Hacked" }),
      ).rejects.toThrow("Forbidden");
    });
  });
});
```

### Shop Verification

```typescript
describe("Shop Verification", () => {
  describe("admin verification", () => {
    it("should verify shop", async () => {
      const result = await shopsService.verify("shop_001");
      expect(result.isVerified).toBe(true);
      expect(result.verifiedAt).toBeDefined();
    });

    it("should reject shop with reason", async () => {
      const result = await shopsService.reject("shop_002", {
        reason: "Incomplete documents",
      });
      expect(result.status).toBe("rejected");
    });

    it("should suspend shop", async () => {
      const result = await shopsService.suspend("shop_003", {
        reason: "Policy violation",
      });
      expect(result.status).toBe("suspended");
    });
  });

  describe("verification requirements", () => {
    it("should check if shop is eligible for verification", async () => {
      const eligibility =
        await shopsService.checkVerificationEligibility("shop_001");
      expect(eligibility.eligible).toBe(true);
    });

    it("should list missing requirements", async () => {
      const eligibility =
        await shopsService.checkVerificationEligibility("shop_incomplete");
      expect(eligibility.eligible).toBe(false);
      expect(eligibility.missing).toContain("bank_account");
    });
  });
});
```

---

## Integration Tests

### Shop API

```typescript
describe("Shop API Integration", () => {
  describe("GET /api/shops", () => {
    it("should return shop list", async () => {
      const response = await fetch("/api/shops");
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.data).toBeInstanceOf(Array);
    });

    it("should support search", async () => {
      const response = await fetch("/api/shops?search=electronics");
      const data = await response.json();
      expect(data.data.length).toBeGreaterThan(0);
    });
  });

  describe("GET /api/shops/:slug", () => {
    it("should return shop details", async () => {
      const response = await fetch("/api/shops/tech-store");
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.data.slug).toBe("tech-store");
    });

    it("should return 404 for non-existent shop", async () => {
      const response = await fetch("/api/shops/non-existent");
      expect(response.status).toBe(404);
    });
  });

  describe("GET /api/shops/:id/products", () => {
    it("should return shop products", async () => {
      const response = await fetch("/api/shops/shop_001/products");
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.data).toBeInstanceOf(Array);
    });
  });
});
```

### Seller Shop API

```typescript
describe("Seller Shop API Integration", () => {
  let sellerToken: string;

  beforeAll(async () => {
    sellerToken = await getTestSellerToken();
  });

  describe("GET /api/seller/shop", () => {
    it("should require seller role", async () => {
      const userToken = await getTestUserToken();
      const response = await fetch("/api/seller/shop", {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      expect(response.status).toBe(403);
    });

    it("should return seller shop", async () => {
      const response = await fetch("/api/seller/shop", {
        headers: { Authorization: `Bearer ${sellerToken}` },
      });
      expect(response.status).toBe(200);
    });
  });

  describe("PATCH /api/seller/shop", () => {
    it("should update shop", async () => {
      const response = await fetch("/api/seller/shop", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${sellerToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ description: "Updated description" }),
      });
      expect(response.status).toBe(200);
    });
  });

  describe("GET /api/seller/shop/analytics", () => {
    it("should return shop analytics", async () => {
      const response = await fetch("/api/seller/shop/analytics", {
        headers: { Authorization: `Bearer ${sellerToken}` },
      });
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.data).toHaveProperty("revenue");
      expect(data.data).toHaveProperty("orders");
    });
  });
});
```

### Admin Shop Management

```typescript
describe("Admin Shop API Integration", () => {
  let adminToken: string;

  beforeAll(async () => {
    adminToken = await getTestAdminToken();
  });

  describe("POST /api/admin/shops/:id/verify", () => {
    it("should verify shop", async () => {
      const response = await fetch("/api/admin/shops/shop_pending/verify", {
        method: "POST",
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      expect(response.status).toBe(200);
    });
  });

  describe("POST /api/admin/shops/:id/suspend", () => {
    it("should suspend shop", async () => {
      const response = await fetch("/api/admin/shops/shop_001/suspend", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${adminToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason: "Policy violation" }),
      });
      expect(response.status).toBe(200);
    });
  });
});
```
