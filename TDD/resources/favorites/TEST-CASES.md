# Favorites Resource - Test Cases

## Unit Tests

### Favorites Operations

```typescript
describe("Favorites Service", () => {
  describe("getAll", () => {
    it("should return user favorites", async () => {
      const favorites = await favoritesService.getAll();
      expect(favorites.data).toBeInstanceOf(Array);
    });

    it("should filter by type", async () => {
      const products = await favoritesService.getAll({ type: "product" });
      products.data.forEach((fav) => {
        expect(fav.type).toBe("product");
      });
    });

    it("should include entity details", async () => {
      const favorites = await favoritesService.getAll({ type: "product" });
      favorites.data.forEach((fav) => {
        expect(fav.product).toHaveProperty("name");
        expect(fav.product).toHaveProperty("price");
      });
    });

    it("should paginate results", async () => {
      const page1 = await favoritesService.getAll({ page: 1, limit: 5 });
      const page2 = await favoritesService.getAll({ page: 2, limit: 5 });
      expect(page1.data[0].id).not.toBe(page2.data[0]?.id);
    });
  });

  describe("add", () => {
    it("should add product to favorites", async () => {
      const result = await favoritesService.add({
        type: "product",
        entityId: "prod_001",
      });
      expect(result.id).toBeDefined();
      expect(result.type).toBe("product");
    });

    it("should add auction to favorites", async () => {
      const result = await favoritesService.add({
        type: "auction",
        entityId: "auc_001",
      });
      expect(result.type).toBe("auction");
    });

    it("should add shop to favorites", async () => {
      const result = await favoritesService.add({
        type: "shop",
        entityId: "shop_001",
      });
      expect(result.type).toBe("shop");
    });

    it("should fail if already favorited", async () => {
      await favoritesService.add({ type: "product", entityId: "prod_001" });
      await expect(
        favoritesService.add({ type: "product", entityId: "prod_001" })
      ).rejects.toThrow("Item already in favorites");
    });

    it("should fail for non-existent entity", async () => {
      await expect(
        favoritesService.add({ type: "product", entityId: "invalid" })
      ).rejects.toThrow("Product not found");
    });
  });

  describe("remove", () => {
    it("should remove from favorites by id", async () => {
      const result = await favoritesService.remove("fav_001");
      expect(result.success).toBe(true);
    });

    it("should fail for non-existent favorite", async () => {
      await expect(favoritesService.remove("invalid")).rejects.toThrow(
        "Favorite not found"
      );
    });
  });

  describe("removeByEntity", () => {
    it("should remove by entity type and id", async () => {
      await favoritesService.add({ type: "product", entityId: "prod_002" });
      const result = await favoritesService.removeByEntity(
        "product",
        "prod_002"
      );
      expect(result.success).toBe(true);
    });
  });

  describe("check", () => {
    it("should return true if favorited", async () => {
      await favoritesService.add({ type: "product", entityId: "prod_check" });
      const result = await favoritesService.check("product", "prod_check");
      expect(result.isFavorited).toBe(true);
      expect(result.favoriteId).toBeDefined();
    });

    it("should return false if not favorited", async () => {
      const result = await favoritesService.check("product", "prod_not_fav");
      expect(result.isFavorited).toBe(false);
    });
  });

  describe("sync", () => {
    it("should merge guest favorites after login", async () => {
      const guestItems = [
        { type: "product", entityId: "prod_001" },
        { type: "product", entityId: "prod_002" },
      ];
      const result = await favoritesService.sync(guestItems);
      expect(result.added).toBe(2);
    });

    it("should not duplicate existing favorites", async () => {
      await favoritesService.add({
        type: "product",
        entityId: "prod_existing",
      });
      const result = await favoritesService.sync([
        { type: "product", entityId: "prod_existing" },
        { type: "product", entityId: "prod_new" },
      ]);
      expect(result.added).toBe(1); // Only new one added
    });

    it("should handle empty sync list", async () => {
      const result = await favoritesService.sync([]);
      expect(result.added).toBe(0);
    });
  });
});
```

### Favorites with Product Availability

```typescript
describe("Favorites Product Status", () => {
  it("should show product availability in favorites", async () => {
    const favorites = await favoritesService.getAll({ type: "product" });
    favorites.data.forEach((fav) => {
      expect(fav.product).toHaveProperty("inStock");
    });
  });

  it("should show auction status in favorites", async () => {
    const favorites = await favoritesService.getAll({ type: "auction" });
    favorites.data.forEach((fav) => {
      expect(fav.auction).toHaveProperty("status");
      expect(fav.auction).toHaveProperty("endsAt");
    });
  });

  it("should filter out deleted entities", async () => {
    // Add favorite to product that gets deleted
    const favorites = await favoritesService.getAll();
    favorites.data.forEach((fav) => {
      // All entities should exist
      if (fav.type === "product") {
        expect(fav.product).not.toBeNull();
      }
    });
  });
});
```

---

## Integration Tests

### Favorites API

```typescript
describe("Favorites API Integration", () => {
  let userToken: string;

  beforeAll(async () => {
    userToken = await getTestUserToken();
  });

  describe("GET /api/favorites", () => {
    it("should require authentication", async () => {
      const response = await fetch("/api/favorites");
      expect(response.status).toBe(401);
    });

    it("should return user favorites", async () => {
      const response = await fetch("/api/favorites", {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.data).toBeInstanceOf(Array);
    });

    it("should filter by type", async () => {
      const response = await fetch("/api/favorites?type=product", {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      const data = await response.json();
      data.data.forEach((fav: any) => {
        expect(fav.type).toBe("product");
      });
    });
  });

  describe("POST /api/favorites", () => {
    it("should add to favorites", async () => {
      const response = await fetch("/api/favorites", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "product",
          entityId: "prod_test",
        }),
      });
      expect(response.status).toBe(201);
    });
  });

  describe("DELETE /api/favorites/:id", () => {
    it("should remove from favorites", async () => {
      const response = await fetch("/api/favorites/fav_001", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${userToken}` },
      });
      expect(response.status).toBe(200);
    });
  });

  describe("DELETE /api/favorites/entity/:type/:entityId", () => {
    it("should remove by entity", async () => {
      // First add
      await fetch("/api/favorites", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ type: "product", entityId: "prod_remove" }),
      });

      // Then remove by entity
      const response = await fetch(
        "/api/favorites/entity/product/prod_remove",
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${userToken}` },
        }
      );
      expect(response.status).toBe(200);
    });
  });

  describe("GET /api/favorites/check/:type/:entityId", () => {
    it("should check if favorited", async () => {
      const response = await fetch("/api/favorites/check/product/prod_001", {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.data).toHaveProperty("isFavorited");
    });
  });

  describe("POST /api/favorites/sync", () => {
    it("should sync guest favorites", async () => {
      const response = await fetch("/api/favorites/sync", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: [
            { type: "product", entityId: "prod_sync1" },
            { type: "product", entityId: "prod_sync2" },
          ],
        }),
      });
      expect(response.status).toBe(200);
    });
  });
});
```

### Favorites UI Integration

```typescript
describe("Favorites UI Integration", () => {
  it("should toggle favorite on product card", async () => {
    // Check initial state
    const check = await favoritesService.check("product", "prod_ui");
    expect(check.isFavorited).toBe(false);

    // Add to favorites
    await favoritesService.add({ type: "product", entityId: "prod_ui" });

    // Verify added
    const checkAfter = await favoritesService.check("product", "prod_ui");
    expect(checkAfter.isFavorited).toBe(true);

    // Remove from favorites
    await favoritesService.removeByEntity("product", "prod_ui");

    // Verify removed
    const checkFinal = await favoritesService.check("product", "prod_ui");
    expect(checkFinal.isFavorited).toBe(false);
  });

  it("should sync favorites after login", async () => {
    // Simulate guest favorites in localStorage
    const guestFavorites = {
      products: ["prod_guest1", "prod_guest2"],
      auctions: ["auc_guest1"],
      shops: [],
    };

    // Login and sync
    const items = [
      ...guestFavorites.products.map((id) => ({
        type: "product" as const,
        entityId: id,
      })),
      ...guestFavorites.auctions.map((id) => ({
        type: "auction" as const,
        entityId: id,
      })),
    ];

    const result = await favoritesService.sync(items);
    expect(result.added).toBe(3);

    // Verify all added
    const favorites = await favoritesService.getAll();
    expect(favorites.data.length).toBeGreaterThanOrEqual(3);
  });
});
```
