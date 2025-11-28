# Categories Resource - Test Cases

## Unit Tests

### Category Operations

```typescript
describe("Categories Service", () => {
  describe("getAll", () => {
    it("should return category tree", async () => {
      const categories = await categoriesService.getAll();
      expect(categories).toBeInstanceOf(Array);
      categories.forEach((cat) => {
        expect(cat).toHaveProperty("children");
      });
    });

    it("should filter by type", async () => {
      const products = await categoriesService.getAll({ type: "product" });
      products.forEach((cat) => {
        expect(cat.type).toBe("product");
      });
    });

    it("should return flat list when specified", async () => {
      const flat = await categoriesService.getAll({ flat: true });
      flat.forEach((cat) => {
        expect(cat.children).toBeUndefined();
      });
    });

    it("should include product counts", async () => {
      const categories = await categoriesService.getAll({
        includeProducts: true,
      });
      categories.forEach((cat) => {
        expect(cat).toHaveProperty("productCount");
      });
    });

    it("should return children of parent", async () => {
      const children = await categoriesService.getAll({
        parentId: "cat_electronics",
      });
      children.forEach((cat) => {
        expect(cat.parentIds).toContain("cat_electronics");
      });
    });
  });

  describe("getBySlug", () => {
    it("should return category by slug", async () => {
      const category = await categoriesService.getBySlug("mobile-phones");
      expect(category.slug).toBe("mobile-phones");
      expect(category.name).toBe("Mobile Phones");
    });

    it("should include parent info", async () => {
      const category = await categoriesService.getBySlug("mobile-phones");
      expect(category.parents).toBeInstanceOf(Array);
      expect(category.parents[0]).toHaveProperty("name");
    });

    it("should throw for non-existent category", async () => {
      await expect(categoriesService.getBySlug("invalid")).rejects.toThrow(
        "Category not found"
      );
    });
  });

  describe("getProducts", () => {
    it("should return products in category", async () => {
      const products = await categoriesService.getProducts("cat_electronics");
      expect(products.data).toBeInstanceOf(Array);
    });

    it("should include products from children by default", async () => {
      const products = await categoriesService.getProducts("cat_electronics", {
        includeChildren: true,
      });
      // Should include products from child categories
      expect(products.meta.total).toBeGreaterThan(0);
    });

    it("should exclude children when specified", async () => {
      const products = await categoriesService.getProducts("cat_electronics", {
        includeChildren: false,
      });
      products.data.forEach((p) => {
        expect(p.categoryId).toBe("cat_electronics");
      });
    });

    it("should paginate results", async () => {
      const page1 = await categoriesService.getProducts("cat_electronics", {
        page: 1,
      });
      const page2 = await categoriesService.getProducts("cat_electronics", {
        page: 2,
      });
      expect(page1.data[0].id).not.toBe(page2.data[0].id);
    });
  });
});
```

### Multi-Parent Support

```typescript
describe("Multi-Parent Categories", () => {
  it("should create category with multiple parents", async () => {
    const category = await categoriesService.create({
      name: "Wireless Earbuds",
      slug: "wireless-earbuds",
      parentIds: ["cat_electronics", "cat_audio", "cat_accessories"],
    });
    expect(category.parentIds).toHaveLength(3);
  });

  it("should appear in all parent hierarchies", async () => {
    const electronics = await categoriesService.getAll({
      parentId: "cat_electronics",
    });
    const audio = await categoriesService.getAll({ parentId: "cat_audio" });

    expect(
      electronics.find((c) => c.slug === "wireless-earbuds")
    ).toBeDefined();
    expect(audio.find((c) => c.slug === "wireless-earbuds")).toBeDefined();
  });

  it("should update parent relationships", async () => {
    const updated = await categoriesService.update("cat_wireless_earbuds", {
      parentIds: ["cat_electronics"], // Remove other parents
    });
    expect(updated.parentIds).toHaveLength(1);
  });
});
```

### Admin Category Management

```typescript
describe("Admin Category Operations", () => {
  describe("create", () => {
    it("should create root category", async () => {
      const category = await categoriesService.create({
        name: "New Category",
        slug: "new-category",
        type: "product",
      });
      expect(category.id).toBeDefined();
      expect(category.parentIds).toEqual([]);
    });

    it("should create child category", async () => {
      const category = await categoriesService.create({
        name: "Sub Category",
        slug: "sub-category",
        parentIds: ["cat_electronics"],
      });
      expect(category.parentIds).toContain("cat_electronics");
    });

    it("should validate unique slug", async () => {
      await expect(
        categoriesService.create({
          name: "Electronics",
          slug: "electronics", // Already exists
        })
      ).rejects.toThrow("Category slug already exists");
    });

    it("should set SEO fields", async () => {
      const category = await categoriesService.create({
        name: "SEO Category",
        slug: "seo-category",
        metaTitle: "Best SEO Category",
        metaDescription: "Shop the best...",
      });
      expect(category.metaTitle).toBe("Best SEO Category");
    });
  });

  describe("update", () => {
    it("should update category", async () => {
      const updated = await categoriesService.update("cat_001", {
        name: "Updated Name",
      });
      expect(updated.name).toBe("Updated Name");
    });

    it("should update slug", async () => {
      const updated = await categoriesService.update("cat_001", {
        slug: "new-slug",
      });
      expect(updated.slug).toBe("new-slug");
    });
  });

  describe("delete", () => {
    it("should delete empty category", async () => {
      const result = await categoriesService.delete("cat_empty");
      expect(result.success).toBe(true);
    });

    it("should reassign products when specified", async () => {
      const result = await categoriesService.delete("cat_with_products", {
        reassignTo: "cat_other",
      });
      expect(result.productsReassigned).toBeGreaterThan(0);
    });

    it("should fail if has products and no reassign", async () => {
      await expect(
        categoriesService.delete("cat_with_products")
      ).rejects.toThrow("Category has products");
    });
  });

  describe("reorder", () => {
    it("should reorder categories", async () => {
      await categoriesService.reorder([
        { id: "cat_001", sortOrder: 3 },
        { id: "cat_002", sortOrder: 1 },
        { id: "cat_003", sortOrder: 2 },
      ]);

      const categories = await categoriesService.getAll();
      expect(categories[0].id).toBe("cat_002");
      expect(categories[1].id).toBe("cat_003");
      expect(categories[2].id).toBe("cat_001");
    });
  });
});
```

---

## Integration Tests

### Category API

```typescript
describe("Category API Integration", () => {
  describe("GET /api/categories", () => {
    it("should return categories", async () => {
      const response = await fetch("/api/categories");
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.data).toBeInstanceOf(Array);
    });

    it("should filter by type", async () => {
      const response = await fetch("/api/categories?type=product");
      const data = await response.json();
      data.data.forEach((cat: any) => {
        expect(cat.type).toBe("product");
      });
    });
  });

  describe("GET /api/categories/:slug", () => {
    it("should return category", async () => {
      const response = await fetch("/api/categories/electronics");
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.data.slug).toBe("electronics");
    });

    it("should return 404 for invalid slug", async () => {
      const response = await fetch("/api/categories/invalid");
      expect(response.status).toBe(404);
    });
  });

  describe("GET /api/categories/:id/products", () => {
    it("should return products", async () => {
      const response = await fetch("/api/categories/cat_electronics/products");
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.data).toBeInstanceOf(Array);
    });
  });
});
```

### Admin Category API

```typescript
describe("Admin Category API Integration", () => {
  let adminToken: string;

  beforeAll(async () => {
    adminToken = await getTestAdminToken();
  });

  describe("POST /api/admin/categories", () => {
    it("should create category", async () => {
      const response = await fetch("/api/admin/categories", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${adminToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "Test Category",
          slug: "test-category",
          type: "product",
        }),
      });
      expect(response.status).toBe(201);
    });
  });

  describe("PATCH /api/admin/categories/:id", () => {
    it("should update category", async () => {
      const response = await fetch("/api/admin/categories/cat_001", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${adminToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: "Updated" }),
      });
      expect(response.status).toBe(200);
    });
  });

  describe("DELETE /api/admin/categories/:id", () => {
    it("should delete category", async () => {
      const response = await fetch("/api/admin/categories/cat_empty", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      expect(response.status).toBe(200);
    });
  });

  describe("PATCH /api/admin/categories/reorder", () => {
    it("should reorder categories", async () => {
      const response = await fetch("/api/admin/categories/reorder", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${adminToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orders: [
            { id: "cat_001", sortOrder: 1 },
            { id: "cat_002", sortOrder: 2 },
          ],
        }),
      });
      expect(response.status).toBe(200);
    });
  });
});
```
