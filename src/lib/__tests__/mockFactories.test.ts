// Example mock factory for Product
export function createMockProduct(overrides = {}) {
  return {
    id: "prod-1",
    name: "Test Product",
    price: 1000,
    ...overrides,
  };
}

describe("mockFactories", () => {
  it("creates a mock product with defaults", () => {
    const product = createMockProduct();
    expect(product.id).toBe("prod-1");
    expect(product.name).toBe("Test Product");
    expect(product.price).toBe(1000);
  });

  it("overrides default values", () => {
    const product = createMockProduct({ price: 2000 });
    expect(product.price).toBe(2000);
  });
});
