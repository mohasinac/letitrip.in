# Carts Resource - Test Cases

## Unit Tests

### Cart Operations

```typescript
describe("Cart Service", () => {
  describe("getCart", () => {
    it("should return empty cart for new user", async () => {
      const cart = await cartService.get();
      expect(cart.items).toEqual([]);
      expect(cart.total).toBe(0);
    });

    it("should return cart with items", async () => {
      const cart = await cartService.get();
      expect(cart.items).toHaveLength(2);
      expect(cart.items[0]).toHaveProperty("product");
      expect(cart.items[0]).toHaveProperty("quantity");
    });

    it("should calculate totals correctly", async () => {
      const cart = await cartService.get();
      const expectedSubtotal = cart.items.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0,
      );
      expect(cart.subtotal).toBe(expectedSubtotal);
    });
  });

  describe("addItem", () => {
    it("should add new item to cart", async () => {
      const result = await cartService.addItem({
        productId: "prod_001",
        quantity: 2,
      });
      expect(result.success).toBe(true);
      expect(result.cart.items).toContainEqual(
        expect.objectContaining({ productId: "prod_001", quantity: 2 }),
      );
    });

    it("should increase quantity if item exists", async () => {
      await cartService.addItem({ productId: "prod_001", quantity: 1 });
      await cartService.addItem({ productId: "prod_001", quantity: 2 });
      const cart = await cartService.get();
      const item = cart.items.find((i) => i.productId === "prod_001");
      expect(item.quantity).toBe(3);
    });

    it("should fail if product not found", async () => {
      await expect(
        cartService.addItem({ productId: "invalid", quantity: 1 }),
      ).rejects.toThrow("Product not found");
    });

    it("should fail if quantity exceeds stock", async () => {
      await expect(
        cartService.addItem({ productId: "prod_001", quantity: 100 }),
      ).rejects.toThrow("Insufficient stock");
    });

    it("should add with variant if specified", async () => {
      const result = await cartService.addItem({
        productId: "prod_001",
        quantity: 1,
        variantId: "var_001",
      });
      expect(result.cart.items[0].variantId).toBe("var_001");
    });
  });

  describe("updateItem", () => {
    it("should update item quantity", async () => {
      await cartService.updateItem("item_001", { quantity: 5 });
      const cart = await cartService.get();
      const item = cart.items.find((i) => i.id === "item_001");
      expect(item.quantity).toBe(5);
    });

    it("should remove item if quantity is 0", async () => {
      await cartService.updateItem("item_001", { quantity: 0 });
      const cart = await cartService.get();
      expect(cart.items.find((i) => i.id === "item_001")).toBeUndefined();
    });

    it("should fail for invalid item", async () => {
      await expect(
        cartService.updateItem("invalid", { quantity: 1 }),
      ).rejects.toThrow("Cart item not found");
    });
  });

  describe("removeItem", () => {
    it("should remove item from cart", async () => {
      await cartService.removeItem("item_001");
      const cart = await cartService.get();
      expect(cart.items.find((i) => i.id === "item_001")).toBeUndefined();
    });

    it("should recalculate totals after removal", async () => {
      const before = await cartService.get();
      await cartService.removeItem("item_001");
      const after = await cartService.get();
      expect(after.subtotal).toBeLessThan(before.subtotal);
    });
  });

  describe("clearCart", () => {
    it("should remove all items", async () => {
      await cartService.clear();
      const cart = await cartService.get();
      expect(cart.items).toEqual([]);
    });
  });
});
```

### Cart Validation

```typescript
describe("Cart Validation", () => {
  it("should validate stock availability", async () => {
    const validation = await cartService.validate();
    expect(validation.isValid).toBe(true);
  });

  it("should flag out of stock items", async () => {
    // Add item that becomes OOS
    const validation = await cartService.validate();
    expect(validation.isValid).toBe(false);
    expect(validation.errors).toContainEqual(
      expect.objectContaining({
        itemId: "item_001",
        error: "out_of_stock",
      }),
    );
  });

  it("should flag quantity exceeds stock", async () => {
    const validation = await cartService.validate();
    expect(validation.warnings).toContainEqual(
      expect.objectContaining({
        itemId: "item_002",
        warning: "quantity_reduced",
        newQuantity: 3,
      }),
    );
  });

  it("should flag inactive products", async () => {
    const validation = await cartService.validate();
    expect(validation.errors).toContainEqual(
      expect.objectContaining({
        itemId: "item_003",
        error: "product_unavailable",
      }),
    );
  });
});
```

### Coupon Application

```typescript
describe("Cart Coupon", () => {
  it("should apply valid coupon", async () => {
    const result = await cartService.applyCoupon("SAVE20");
    expect(result.success).toBe(true);
    expect(result.discount).toBeGreaterThan(0);
  });

  it("should calculate percentage discount", async () => {
    const cart = await cartService.get();
    const result = await cartService.applyCoupon("PERCENT10");
    expect(result.discount).toBe(cart.subtotal * 0.1);
  });

  it("should calculate fixed discount", async () => {
    const result = await cartService.applyCoupon("FLAT500");
    expect(result.discount).toBe(50000); // ₹500 in paise
  });

  it("should fail for invalid coupon", async () => {
    await expect(cartService.applyCoupon("INVALID")).rejects.toThrow(
      "Invalid coupon code",
    );
  });

  it("should fail for expired coupon", async () => {
    await expect(cartService.applyCoupon("EXPIRED")).rejects.toThrow(
      "Coupon has expired",
    );
  });

  it("should remove coupon", async () => {
    await cartService.applyCoupon("SAVE20");
    await cartService.removeCoupon();
    const cart = await cartService.get();
    expect(cart.coupon).toBeNull();
    expect(cart.discount).toBe(0);
  });
});
```

---

## Integration Tests

### Cart API

```typescript
describe("Cart API Integration", () => {
  let authToken: string;

  beforeAll(async () => {
    authToken = await getTestUserToken();
  });

  describe("GET /api/cart", () => {
    it("should require authentication", async () => {
      const response = await fetch("/api/cart");
      expect(response.status).toBe(401);
    });

    it("should return user cart", async () => {
      const response = await fetch("/api/cart", {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.data).toHaveProperty("items");
      expect(data.data).toHaveProperty("subtotal");
    });
  });

  describe("POST /api/cart/items", () => {
    it("should add item to cart", async () => {
      const response = await fetch("/api/cart/items", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId: "prod_001", quantity: 1 }),
      });
      expect(response.status).toBe(201);
    });

    it("should return updated cart", async () => {
      const response = await fetch("/api/cart/items", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId: "prod_002", quantity: 2 }),
      });
      const data = await response.json();
      expect(data.data.items).toContainEqual(
        expect.objectContaining({ productId: "prod_002" }),
      );
    });
  });

  describe("PATCH /api/cart/items/:id", () => {
    it("should update item quantity", async () => {
      const response = await fetch("/api/cart/items/item_001", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ quantity: 3 }),
      });
      expect(response.status).toBe(200);
    });
  });

  describe("DELETE /api/cart/items/:id", () => {
    it("should remove item", async () => {
      const response = await fetch("/api/cart/items/item_001", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${authToken}` },
      });
      expect(response.status).toBe(200);
    });
  });

  describe("POST /api/cart/merge", () => {
    it("should merge guest cart on login", async () => {
      const guestItems = [{ productId: "prod_003", quantity: 1 }];
      const response = await fetch("/api/cart/merge", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ items: guestItems }),
      });
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.data.items).toContainEqual(
        expect.objectContaining({ productId: "prod_003" }),
      );
    });
  });
});
```

### Cart Checkout Flow

```typescript
describe("Cart to Checkout Flow", () => {
  it("should validate cart before checkout", async () => {
    // Add items
    await cartService.addItem({ productId: "prod_001", quantity: 2 });

    // Validate
    const validation = await cartService.validate();
    expect(validation.isValid).toBe(true);

    // Proceed to checkout
    const checkout = await checkoutService.initiate();
    expect(checkout.cart.items).toHaveLength(1);
  });

  it("should block checkout with invalid cart", async () => {
    // Add OOS item
    await expect(checkoutService.initiate()).rejects.toThrow(
      "Cart has invalid items",
    );
  });
});
```
