# Search Resource - Test Cases

## Unit Tests

### SearchService

#### Product Search

```typescript
describe("SearchService - Products", () => {
  describe("searchProducts", () => {
    it("should return products matching search query", async () => {
      const result = await searchProducts({ q: "iphone" });
      expect(result.success).toBe(true);
      expect(
        result.data.every(
          (p) =>
            p.name.toLowerCase().includes("iphone") ||
            p.description.toLowerCase().includes("iphone")
        )
      ).toBe(true);
    });

    it("should filter by category slug", async () => {
      const result = await searchProducts({ category_slug: "mobiles" });
      expect(result.success).toBe(true);
      expect(result.data.every((p) => p.category_id === "cat_mobiles")).toBe(
        true
      );
    });

    it("should filter by shop slug", async () => {
      const result = await searchProducts({ shop_slug: "tech-store" });
      expect(result.success).toBe(true);
      expect(result.data.every((p) => p.shop_id === "shop_001")).toBe(true);
    });

    it("should filter by price range", async () => {
      const result = await searchProducts({
        min_price: 10000,
        max_price: 50000,
      });
      expect(result.success).toBe(true);
      expect(
        result.data.every((p) => p.price >= 10000 && p.price <= 50000)
      ).toBe(true);
    });

    it("should filter in-stock products only", async () => {
      const result = await searchProducts({ in_stock: true });
      expect(result.success).toBe(true);
      expect(result.data.every((p) => p.stock > 0)).toBe(true);
    });

    it("should exclude deleted products", async () => {
      const result = await searchProducts({});
      expect(result.success).toBe(true);
      expect(result.data.every((p) => p.is_deleted === false)).toBe(true);
    });

    it("should only return published products", async () => {
      const result = await searchProducts({});
      expect(result.success).toBe(true);
      expect(result.data.every((p) => p.status === "published")).toBe(true);
    });

    it("should sort by latest (default)", async () => {
      const result = await searchProducts({});
      expect(result.success).toBe(true);
      for (let i = 1; i < result.data.length; i++) {
        expect(
          new Date(result.data[i - 1].created_at).getTime()
        ).toBeGreaterThanOrEqual(new Date(result.data[i].created_at).getTime());
      }
    });

    it("should sort by price ascending", async () => {
      const result = await searchProducts({ sort: "price-asc" });
      expect(result.success).toBe(true);
      for (let i = 1; i < result.data.length; i++) {
        expect(result.data[i - 1].price).toBeLessThanOrEqual(
          result.data[i].price
        );
      }
    });

    it("should sort by price descending", async () => {
      const result = await searchProducts({ sort: "price-desc" });
      expect(result.success).toBe(true);
      for (let i = 1; i < result.data.length; i++) {
        expect(result.data[i - 1].price).toBeGreaterThanOrEqual(
          result.data[i].price
        );
      }
    });

    it("should sort by relevance when query provided", async () => {
      const result = await searchProducts({
        q: "iphone pro",
        sort: "relevance",
      });
      expect(result.success).toBe(true);
      // First result should have highest relevance (name match)
      expect(result.data[0].name.toLowerCase()).toContain("iphone");
    });

    it("should paginate results correctly", async () => {
      const page1 = await searchProducts({ page: 1, limit: 10 });
      const page2 = await searchProducts({ page: 2, limit: 10 });
      expect(page1.pagination.page).toBe(1);
      expect(page2.pagination.page).toBe(2);
      expect(page1.data[0].id).not.toBe(page2.data[0].id);
    });

    it("should respect limit parameter", async () => {
      const result = await searchProducts({ limit: 5 });
      expect(result.data.length).toBeLessThanOrEqual(5);
    });

    it("should cap limit at 100", async () => {
      const result = await searchProducts({ limit: 200 });
      expect(result.pagination.limit).toBe(100);
    });
  });
});
```

#### Auction Search

```typescript
describe("SearchService - Auctions", () => {
  describe("searchAuctions", () => {
    it("should return auctions matching search query", async () => {
      const result = await searchAuctions({ q: "vintage" });
      expect(result.success).toBe(true);
      expect(
        result.data.every(
          (a) =>
            a.title.toLowerCase().includes("vintage") ||
            a.description.toLowerCase().includes("vintage")
        )
      ).toBe(true);
    });

    it("should filter by category", async () => {
      const result = await searchAuctions({ category_slug: "watches" });
      expect(result.success).toBe(true);
      expect(result.data.every((a) => a.category_id === "cat_watches")).toBe(
        true
      );
    });

    it("should filter by shop", async () => {
      const result = await searchAuctions({ shop_slug: "antique-store" });
      expect(result.success).toBe(true);
      expect(result.data.every((a) => a.shop_id === "shop_002")).toBe(true);
    });

    it("should filter by current bid range", async () => {
      const result = await searchAuctions({
        min_price: 10000,
        max_price: 100000,
      });
      expect(result.success).toBe(true);
      expect(
        result.data.every(
          (a) => a.current_bid >= 10000 && a.current_bid <= 100000
        )
      ).toBe(true);
    });

    it("should only return active/live auctions", async () => {
      const result = await searchAuctions({});
      expect(result.success).toBe(true);
      expect(
        result.data.every((a) => a.status === "active" || a.status === "live")
      ).toBe(true);
    });

    it("should sort by ending soon (default)", async () => {
      const result = await searchAuctions({});
      expect(result.success).toBe(true);
      for (let i = 1; i < result.data.length; i++) {
        expect(
          new Date(result.data[i - 1].end_time).getTime()
        ).toBeLessThanOrEqual(new Date(result.data[i].end_time).getTime());
      }
    });

    it("should sort by current bid ascending", async () => {
      const result = await searchAuctions({ sort: "price-asc" });
      expect(result.success).toBe(true);
      for (let i = 1; i < result.data.length; i++) {
        expect(result.data[i - 1].current_bid).toBeLessThanOrEqual(
          result.data[i].current_bid
        );
      }
    });

    it("should sort by current bid descending", async () => {
      const result = await searchAuctions({ sort: "price-desc" });
      expect(result.success).toBe(true);
      for (let i = 1; i < result.data.length; i++) {
        expect(result.data[i - 1].current_bid).toBeGreaterThanOrEqual(
          result.data[i].current_bid
        );
      }
    });
  });
});
```

#### Shop Search

```typescript
describe("SearchService - Shops", () => {
  describe("searchShops", () => {
    it("should return shops matching search query", async () => {
      const result = await searchShops({ q: "tech" });
      expect(result.success).toBe(true);
      expect(
        result.data.every((s) => s.name.toLowerCase().includes("tech"))
      ).toBe(true);
    });

    it("should filter by city", async () => {
      const result = await searchShops({ city: "Mumbai" });
      expect(result.success).toBe(true);
      expect(result.data.every((s) => s.address.city === "Mumbai")).toBe(true);
    });

    it("should filter by state", async () => {
      const result = await searchShops({ state: "Maharashtra" });
      expect(result.success).toBe(true);
      expect(result.data.every((s) => s.address.state === "Maharashtra")).toBe(
        true
      );
    });

    it("should filter verified shops only", async () => {
      const result = await searchShops({ verified: true });
      expect(result.success).toBe(true);
      expect(result.data.every((s) => s.isVerified === true)).toBe(true);
    });

    it("should sort by rating", async () => {
      const result = await searchShops({ sort: "rating" });
      expect(result.success).toBe(true);
      for (let i = 1; i < result.data.length; i++) {
        expect(result.data[i - 1].rating).toBeGreaterThanOrEqual(
          result.data[i].rating
        );
      }
    });

    it("should sort by name alphabetically", async () => {
      const result = await searchShops({ sort: "name" });
      expect(result.success).toBe(true);
      for (let i = 1; i < result.data.length; i++) {
        expect(
          result.data[i - 1].name.localeCompare(result.data[i].name)
        ).toBeLessThanOrEqual(0);
      }
    });
  });
});
```

---

## Integration Tests

### GET /api/search

```typescript
describe("GET /api/search", () => {
  describe("Product Search", () => {
    it("should return 200 with product results", async () => {
      const res = await fetch("/api/search?type=products");
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.type).toBe("products");
      expect(Array.isArray(json.data)).toBe(true);
      expect(json.pagination).toBeDefined();
    });

    it("should search by query", async () => {
      const res = await fetch("/api/search?type=products&q=iphone");
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      json.data.forEach((p: any) => {
        const searchable = `${p.name} ${p.description}`.toLowerCase();
        expect(searchable).toContain("iphone");
      });
    });

    it("should filter by category_slug", async () => {
      const res = await fetch(
        "/api/search?type=products&category_slug=mobiles"
      );
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
    });

    it("should return 404 for invalid category", async () => {
      const res = await fetch(
        "/api/search?type=products&category_slug=nonexistent"
      );
      expect(res.status).toBe(404);
      const json = await res.json();
      expect(json.error).toBe("Category not found");
    });

    it("should filter by shop_slug", async () => {
      const res = await fetch("/api/search?type=products&shop_slug=tech-store");
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
    });

    it("should return 404 for invalid shop", async () => {
      const res = await fetch(
        "/api/search?type=products&shop_slug=nonexistent"
      );
      expect(res.status).toBe(404);
      const json = await res.json();
      expect(json.error).toBe("Shop not found");
    });

    it("should filter by price range", async () => {
      const res = await fetch(
        "/api/search?type=products&min_price=10000&max_price=50000"
      );
      expect(res.status).toBe(200);
      const json = await res.json();
      json.data.forEach((p: any) => {
        expect(p.price).toBeGreaterThanOrEqual(10000);
        expect(p.price).toBeLessThanOrEqual(50000);
      });
    });

    it("should filter in-stock products", async () => {
      const res = await fetch("/api/search?type=products&in_stock=true");
      expect(res.status).toBe(200);
      const json = await res.json();
      json.data.forEach((p: any) => {
        expect(p.stock).toBeGreaterThan(0);
      });
    });

    it("should sort by price ascending", async () => {
      const res = await fetch("/api/search?type=products&sort=price-asc");
      expect(res.status).toBe(200);
      const json = await res.json();
      for (let i = 1; i < json.data.length; i++) {
        expect(json.data[i - 1].price).toBeLessThanOrEqual(json.data[i].price);
      }
    });

    it("should paginate correctly", async () => {
      const res1 = await fetch("/api/search?type=products&page=1&limit=5");
      const res2 = await fetch("/api/search?type=products&page=2&limit=5");
      const json1 = await res1.json();
      const json2 = await res2.json();
      expect(json1.pagination.page).toBe(1);
      expect(json2.pagination.page).toBe(2);
      if (json1.data.length > 0 && json2.data.length > 0) {
        expect(json1.data[0].id).not.toBe(json2.data[0].id);
      }
    });
  });

  describe("Auction Search", () => {
    it("should return 200 with auction results", async () => {
      const res = await fetch("/api/search?type=auctions");
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.type).toBe("auctions");
      expect(Array.isArray(json.data)).toBe(true);
    });

    it("should search by query", async () => {
      const res = await fetch("/api/search?type=auctions&q=vintage");
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
    });

    it("should filter by price range (current_bid)", async () => {
      const res = await fetch(
        "/api/search?type=auctions&min_price=10000&max_price=100000"
      );
      expect(res.status).toBe(200);
      const json = await res.json();
      json.data.forEach((a: any) => {
        expect(a.current_bid).toBeGreaterThanOrEqual(10000);
        expect(a.current_bid).toBeLessThanOrEqual(100000);
      });
    });

    it("should sort by ending soon", async () => {
      const res = await fetch("/api/search?type=auctions&sort=endingSoon");
      expect(res.status).toBe(200);
      const json = await res.json();
      for (let i = 1; i < json.data.length; i++) {
        expect(
          new Date(json.data[i - 1].end_time).getTime()
        ).toBeLessThanOrEqual(new Date(json.data[i].end_time).getTime());
      }
    });
  });

  describe("Rate Limiting", () => {
    it("should return 429 when rate limit exceeded", async () => {
      // This test requires mocking or fast sequential requests
      const requests = Array(150)
        .fill(null)
        .map(() => fetch("/api/search?type=products"));
      const responses = await Promise.all(requests);
      const rateLimited = responses.filter((r) => r.status === 429);
      expect(rateLimited.length).toBeGreaterThan(0);
    });
  });

  describe("Error Handling", () => {
    it("should handle invalid type gracefully", async () => {
      const res = await fetch("/api/search?type=invalid");
      expect(res.status).toBe(200);
      const json = await res.json();
      // Falls back to products
      expect(json.type).toBe("invalid"); // Returns whatever type was passed
    });

    it("should handle invalid page number", async () => {
      const res = await fetch("/api/search?page=-1");
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.pagination.page).toBe(1);
    });

    it("should handle invalid limit", async () => {
      const res = await fetch("/api/search?limit=-1");
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.pagination.limit).toBeGreaterThan(0);
    });
  });
});
```

---

## E2E Test Scenarios

### Product Discovery Flow

```typescript
describe("E2E: Product Discovery", () => {
  it("should find products through search", async () => {
    // 1. User searches for "iphone"
    const searchRes = await fetch("/api/search?type=products&q=iphone");
    const searchJson = await searchRes.json();
    expect(searchJson.data.length).toBeGreaterThan(0);

    // 2. User filters by category
    const filteredRes = await fetch(
      "/api/search?type=products&q=iphone&category_slug=mobiles"
    );
    const filteredJson = await filteredRes.json();
    expect(filteredJson.data.length).toBeLessThanOrEqual(
      searchJson.data.length
    );

    // 3. User sorts by price
    const sortedRes = await fetch(
      "/api/search?type=products&q=iphone&category_slug=mobiles&sort=price-asc"
    );
    const sortedJson = await sortedRes.json();
    if (sortedJson.data.length >= 2) {
      expect(sortedJson.data[0].price).toBeLessThanOrEqual(
        sortedJson.data[1].price
      );
    }

    // 4. User views product detail
    if (sortedJson.data.length > 0) {
      const productId = sortedJson.data[0].id;
      const detailRes = await fetch(`/api/products/${productId}`);
      expect(detailRes.status).toBe(200);
    }
  });
});
```

### Auction Discovery Flow

```typescript
describe("E2E: Auction Discovery", () => {
  it("should find auctions ending soon", async () => {
    // 1. User browses auctions sorted by ending soon
    const searchRes = await fetch("/api/search?type=auctions&sort=endingSoon");
    const searchJson = await searchRes.json();
    expect(searchJson.data.length).toBeGreaterThan(0);

    // 2. User filters by price range
    const filteredRes = await fetch(
      "/api/search?type=auctions&sort=endingSoon&min_price=5000&max_price=50000"
    );
    const filteredJson = await filteredRes.json();

    // 3. User views auction detail
    if (filteredJson.data.length > 0) {
      const auctionId = filteredJson.data[0].id;
      const detailRes = await fetch(`/api/auctions/${auctionId}`);
      expect(detailRes.status).toBe(200);
    }
  });
});
```

---

## Test Data Requirements

### Products for Search Tests

| ID       | Name          | Category | Shop       | Price  | Stock | Status    |
| -------- | ------------- | -------- | ---------- | ------ | ----- | --------- |
| prod_001 | iPhone 15 Pro | mobiles  | tech-store | 129900 | 50    | published |
| prod_002 | iPhone 14     | mobiles  | tech-store | 79900  | 30    | published |
| prod_003 | Samsung S24   | mobiles  | tech-store | 89900  | 0     | published |
| prod_004 | MacBook Pro   | laptops  | tech-store | 199900 | 10    | published |
| prod_005 | Deleted Phone | mobiles  | tech-store | 49900  | 20    | deleted   |

### Auctions for Search Tests

| ID      | Title           | Category | Shop          | Current Bid | End Time             | Status |
| ------- | --------------- | -------- | ------------- | ----------- | -------------------- | ------ |
| auc_001 | Vintage Watch   | watches  | antique-store | 75000       | 2025-02-01T23:59:59Z | active |
| auc_002 | Rare Painting   | art      | antique-store | 150000      | 2025-01-25T23:59:59Z | active |
| auc_003 | Antique Vase    | decor    | antique-store | 25000       | 2025-01-20T23:59:59Z | live   |
| auc_004 | Expired Auction | watches  | antique-store | 10000       | 2024-12-01T23:59:59Z | ended  |

### Shops for Search Tests

| ID       | Name          | City   | State       | Verified | Rating |
| -------- | ------------- | ------ | ----------- | -------- | ------ |
| shop_001 | Tech Store    | Mumbai | Maharashtra | true     | 4.8    |
| shop_002 | Antique Store | Delhi  | Delhi       | true     | 4.5    |
| shop_003 | Fashion Hub   | Mumbai | Maharashtra | false    | 4.2    |

### Categories for Search Tests

| ID          | Name    | Slug    | Parent      |
| ----------- | ------- | ------- | ----------- |
| cat_mobiles | Mobiles | mobiles | electronics |
| cat_laptops | Laptops | laptops | electronics |
| cat_watches | Watches | watches | accessories |
