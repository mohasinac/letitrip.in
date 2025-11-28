# Products Resource - Test Cases

## Unit Tests

### Product Listing Tests

```typescript
describe("ProductsService - List", () => {
  describe("list", () => {
    it("should list active products with pagination", async () => {
      const result = await productsService.list({ page: 1, limit: 10 });

      expect(result.data).toHaveLength(10);
      expect(result.meta.page).toBe(1);
      result.data.forEach((product) => {
        expect(product.status).toBe("active");
      });
    });

    it("should filter by category", async () => {
      const result = await productsService.list({ category: "mobiles" });

      result.data.forEach((product) => {
        expect(product.category.slug).toBe("mobiles");
      });
    });

    it("should filter by price range", async () => {
      const result = await productsService.list({
        minPrice: 50000,
        maxPrice: 100000,
      });

      result.data.forEach((product) => {
        expect(product.price).toBeGreaterThanOrEqual(50000);
        expect(product.price).toBeLessThanOrEqual(100000);
      });
    });

    it("should filter by shop", async () => {
      const result = await productsService.list({ shop: "test_shop_001" });

      result.data.forEach((product) => {
        expect(product.shop.id).toBe("test_shop_001");
      });
    });

    it("should sort by price ascending", async () => {
      const result = await productsService.list({
        sortBy: "price",
        order: "asc",
      });

      for (let i = 1; i < result.data.length; i++) {
        expect(result.data[i].price).toBeGreaterThanOrEqual(
          result.data[i - 1].price
        );
      }
    });

    it("should filter in-stock only", async () => {
      const result = await productsService.list({ inStock: true });

      result.data.forEach((product) => {
        expect(product.inStock).toBe(true);
        expect(product.quantity).toBeGreaterThan(0);
      });
    });

    it("should search by name", async () => {
      const result = await productsService.list({ search: "iPhone" });

      result.data.forEach((product) => {
        expect(product.name.toLowerCase()).toContain("iphone");
      });
    });

    it("should handle empty results", async () => {
      const result = await productsService.list({
        search: "nonexistentproduct12345",
      });

      expect(result.data).toHaveLength(0);
      expect(result.meta.total).toBe(0);
    });
  });
});
```

---

### Product Detail Tests

```typescript
describe("ProductsService - Detail", () => {
  describe("getById", () => {
    it("should get product by ID", async () => {
      const product = await productsService.getById("test_product_001");

      expect(product.id).toBe("test_product_001");
      expect(product.name).toBeDefined();
      expect(product.price).toBeDefined();
      expect(product.images).toBeDefined();
      expect(product.category).toBeDefined();
      expect(product.shop).toBeDefined();
    });

    it("should return 404 for non-existent product", async () => {
      await expect(productsService.getById("non_existent")).rejects.toThrow(
        "Product not found"
      );
    });

    it("should include related data", async () => {
      const product = await productsService.getById("test_product_001");

      expect(product.category.breadcrumb).toBeDefined();
      expect(product.shop.isVerified).toBeDefined();
      expect(product.specifications).toBeDefined();
    });
  });

  describe("getBySlug", () => {
    it("should get product by slug", async () => {
      const product = await productsService.getBySlug("iphone-15-pro");

      expect(product.slug).toBe("iphone-15-pro");
    });

    it("should return 404 for non-existent slug", async () => {
      await expect(
        productsService.getBySlug("non-existent-slug")
      ).rejects.toThrow("Product not found");
    });
  });

  describe("getReviews", () => {
    it("should get product reviews with summary", async () => {
      const result = await productsService.getReviews("test_product_001");

      expect(result.summary).toBeDefined();
      expect(result.summary.averageRating).toBeDefined();
      expect(result.summary.distribution).toBeDefined();
      expect(result.reviews).toBeDefined();
    });

    it("should filter reviews by rating", async () => {
      const result = await productsService.getReviews("test_product_001", {
        rating: 5,
      });

      result.reviews.forEach((review) => {
        expect(review.rating).toBe(5);
      });
    });
  });

  describe("getRelated", () => {
    it("should get related products", async () => {
      const related = await productsService.getRelated("test_product_001", {
        limit: 8,
      });

      expect(related).toHaveLength(8);
      related.forEach((product) => {
        expect(product.id).not.toBe("test_product_001");
      });
    });
  });
});
```

---

### Seller Product Tests

```typescript
describe("ProductsService - Seller", () => {
  beforeEach(() => {
    // Set seller auth context
  });

  describe("listSeller", () => {
    it("should list seller's products only", async () => {
      const result = await productsService.listSeller();

      result.data.forEach((product) => {
        expect(product.shopId).toBe("test_shop_001"); // Current seller's shop
      });
    });

    it("should include all statuses for seller", async () => {
      const result = await productsService.listSeller({});

      const statuses = new Set(result.data.map((p) => p.status));
      expect(statuses.has("draft") || statuses.has("active")).toBe(true);
    });
  });

  describe("create", () => {
    it("should create product with valid data", async () => {
      const productData = {
        name: "New Test Product",
        slug: "new-test-product",
        description: "Test description",
        price: 50000,
        categoryId: "cat_electronics",
        images: [{ url: "https://...", alt: "Product" }],
        quantity: 10,
        status: "draft",
      };

      const result = await productsService.create(productData);

      expect(result.id).toBeDefined();
      expect(result.name).toBe(productData.name);
      expect(result.status).toBe("draft");
    });

    it("should reject invalid category", async () => {
      const productData = {
        name: "New Product",
        slug: "new-product",
        price: 50000,
        categoryId: "invalid_category",
        images: [{ url: "https://...", alt: "Product" }],
      };

      await expect(productsService.create(productData)).rejects.toThrow(
        "Invalid category"
      );
    });

    it("should reject duplicate slug", async () => {
      const productData = {
        name: "Duplicate Slug Product",
        slug: "iphone-15-pro", // Existing slug
        price: 50000,
        categoryId: "cat_electronics",
        images: [{ url: "https://...", alt: "Product" }],
      };

      await expect(productsService.create(productData)).rejects.toThrow(
        "Slug already exists"
      );
    });

    it("should reject missing required fields", async () => {
      const productData = {
        name: "Incomplete Product",
        // Missing price, categoryId, images
      };

      await expect(productsService.create(productData)).rejects.toThrow(
        "Validation error"
      );
    });

    it("should reject invalid price", async () => {
      const productData = {
        name: "Invalid Price Product",
        slug: "invalid-price",
        price: -1000,
        categoryId: "cat_electronics",
        images: [{ url: "https://...", alt: "Product" }],
      };

      await expect(productsService.create(productData)).rejects.toThrow(
        "Invalid price"
      );
    });

    it("should require shop verification", async () => {
      // With unverified shop seller context
      const productData = {
        name: "Product",
        slug: "product",
        price: 50000,
        categoryId: "cat_electronics",
        images: [{ url: "https://...", alt: "Product" }],
      };

      await expect(productsService.create(productData)).rejects.toThrow(
        "Shop must be verified"
      );
    });
  });

  describe("update", () => {
    it("should update product", async () => {
      const result = await productsService.update("test_product_001", {
        price: 149900,
        quantity: 30,
      });

      expect(result.price).toBe(149900);
      expect(result.quantity).toBe(30);
    });

    it("should reject update of another seller's product", async () => {
      await expect(
        productsService.update("other_seller_product", { price: 100000 })
      ).rejects.toThrow("Access denied");
    });

    it("should validate compare price vs price", async () => {
      await expect(
        productsService.update("test_product_001", {
          price: 150000,
          comparePrice: 100000, // Lower than price
        })
      ).rejects.toThrow("Compare price must be >= price");
    });
  });

  describe("delete", () => {
    it("should delete product", async () => {
      await productsService.delete("test_product_draft");
      // Verify deletion
    });

    it("should reject deletion of another seller's product", async () => {
      await expect(
        productsService.delete("other_seller_product")
      ).rejects.toThrow("Access denied");
    });

    it("should soft delete if product has orders", async () => {
      const result = await productsService.delete("test_product_with_orders");
      // Should change status to archived, not actually delete
    });
  });

  describe("bulkSeller", () => {
    it("should bulk activate products", async () => {
      const result = await productsService.bulkSeller({
        action: "activate",
        productIds: ["test_product_draft"],
      });

      expect(result.processed).toBe(1);
      expect(result.failed).toBe(0);
    });

    it("should reject bulk operations on other seller's products", async () => {
      const result = await productsService.bulkSeller({
        action: "activate",
        productIds: ["test_product_001", "other_seller_product"],
      });

      expect(result.failed).toBe(1);
    });
  });
});
```

---

### Admin Product Tests

```typescript
describe("ProductsService - Admin", () => {
  beforeEach(() => {
    // Set admin auth context
  });

  describe("listAdmin", () => {
    it("should list all products including non-active", async () => {
      const result = await productsService.listAdmin({});

      const statuses = new Set(result.data.map((p) => p.status));
      expect(statuses.size).toBeGreaterThan(1);
    });

    it("should filter by seller", async () => {
      const result = await productsService.listAdmin({
        seller: "test_seller_001",
      });

      // All products belong to seller
    });
  });

  describe("adminUpdate", () => {
    it("should ban product", async () => {
      const result = await productsService.adminUpdate("test_product_001", {
        status: "banned",
        banReason: "Policy violation",
      });

      expect(result.status).toBe("banned");
    });

    it("should feature product", async () => {
      const result = await productsService.adminUpdate("test_product_001", {
        isFeatured: true,
      });

      expect(result.isFeatured).toBe(true);
    });
  });

  describe("bulkAdmin", () => {
    it("should bulk ban products", async () => {
      const result = await productsService.bulkAdmin({
        action: "ban",
        productIds: ["test_product_001", "test_product_002"],
        reason: "Policy violation",
      });

      expect(result.processed).toBe(2);
    });
  });
});
```

---

## Integration Tests

### Product Lifecycle

```typescript
describe("Product Lifecycle", () => {
  it("should complete product lifecycle", async () => {
    // 1. Create product as seller
    const created = await productsService.create({
      name: "Lifecycle Test Product",
      slug: "lifecycle-test-product",
      description: "Test product for lifecycle",
      price: 50000,
      categoryId: "cat_electronics",
      images: [{ url: "https://...", alt: "Test" }],
      quantity: 10,
      status: "draft",
    });

    expect(created.status).toBe("draft");

    // 2. Update to active
    await productsService.update(created.id, { status: "active" });

    // 3. Verify public visibility
    const publicProduct = await productsService.getById(created.id);
    expect(publicProduct.status).toBe("active");

    // 4. Search for product
    const searchResult = await productsService.list({
      search: "Lifecycle Test",
    });
    expect(searchResult.data.some((p) => p.id === created.id)).toBe(true);

    // 5. Update inventory
    await productsService.update(created.id, { quantity: 0 });

    // 6. Verify out of stock
    const outOfStock = await productsService.getById(created.id);
    expect(outOfStock.inStock).toBe(false);

    // 7. Deactivate
    await productsService.update(created.id, { status: "inactive" });

    // 8. Verify not in public listing
    const afterDeactivate = await productsService.list({
      search: "Lifecycle Test",
    });
    expect(afterDeactivate.data.some((p) => p.id === created.id)).toBe(false);

    // 9. Delete
    await productsService.delete(created.id);
  });
});
```

---

### Search and Filter Integration

```typescript
describe("Product Search & Filter", () => {
  it("should combine multiple filters", async () => {
    const result = await productsService.list({
      category: "mobiles",
      minPrice: 50000,
      maxPrice: 150000,
      inStock: true,
      sortBy: "price",
      order: "asc",
    });

    result.data.forEach((product) => {
      expect(product.category.slug).toBe("mobiles");
      expect(product.price).toBeGreaterThanOrEqual(50000);
      expect(product.price).toBeLessThanOrEqual(150000);
      expect(product.inStock).toBe(true);
    });

    // Verify sorting
    for (let i = 1; i < result.data.length; i++) {
      expect(result.data[i].price).toBeGreaterThanOrEqual(
        result.data[i - 1].price
      );
    }
  });

  it("should paginate correctly", async () => {
    const page1 = await productsService.list({ page: 1, limit: 5 });
    const page2 = await productsService.list({ page: 2, limit: 5 });

    expect(page1.data).toHaveLength(5);
    expect(page2.data).toHaveLength(5);

    // No overlap
    const page1Ids = new Set(page1.data.map((p) => p.id));
    page2.data.forEach((p) => {
      expect(page1Ids.has(p.id)).toBe(false);
    });
  });
});
```

---

## Test Coverage Targets

| Area             | Target | Priority |
| ---------------- | ------ | -------- |
| Product Listing  | 90%    | High     |
| Product Detail   | 90%    | High     |
| Seller CRUD      | 95%    | Critical |
| Admin Operations | 85%    | Medium   |
| Search & Filter  | 90%    | High     |
| Input Validation | 100%   | Critical |
| RBAC Permissions | 100%   | Critical |

---

## Test Data Dependencies

- Requires test products from `TEST-DATA-REQUIREMENTS.md`
- Test seller must have verified shop
- Test categories must exist
- Clean up created products after tests
