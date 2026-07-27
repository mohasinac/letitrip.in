import { describe, it, expect, vi, beforeEach } from "vitest";

const {
  mockListProducts,
  mockGetProductById,
  mockGetFeaturedProducts,
  mockGetFeaturedAuctions,
  mockGetLatestProducts,
  mockGetLatestAuctions,
  mockListAuctions,
  mockGetFeaturedPreOrders,
  mockGetLatestPreOrders,
  mockListPreOrders,
  mockGetRelatedProducts,
  mockGetStoreStorefrontProducts,
} = vi.hoisted(() => ({
  mockListProducts: vi.fn(),
  mockGetProductById: vi.fn(),
  mockGetFeaturedProducts: vi.fn(),
  mockGetFeaturedAuctions: vi.fn(),
  mockGetLatestProducts: vi.fn(),
  mockGetLatestAuctions: vi.fn(),
  mockListAuctions: vi.fn(),
  mockGetFeaturedPreOrders: vi.fn(),
  mockGetLatestPreOrders: vi.fn(),
  mockListPreOrders: vi.fn(),
  mockGetRelatedProducts: vi.fn(),
  mockGetStoreStorefrontProducts: vi.fn(),
}));

vi.mock("@mohasinac/appkit/server", () => ({
  wrapAction: async (fn: () => Promise<unknown>) => {
    try {
      return { ok: true, data: await fn() };
    } catch (e: unknown) {
      return { ok: false, error: e instanceof Error ? e.message : String(e) };
    }
  },
}));

vi.mock("@mohasinac/appkit", () => ({
  listProducts: mockListProducts,
  getProductById: mockGetProductById,
  getFeaturedProducts: mockGetFeaturedProducts,
  getFeaturedAuctions: mockGetFeaturedAuctions,
  getLatestProducts: mockGetLatestProducts,
  getLatestAuctions: mockGetLatestAuctions,
  listAuctions: mockListAuctions,
  getFeaturedPreOrders: mockGetFeaturedPreOrders,
  getLatestPreOrders: mockGetLatestPreOrders,
  listPreOrders: mockListPreOrders,
  getRelatedProducts: mockGetRelatedProducts,
  getStoreStorefrontProducts: mockGetStoreStorefrontProducts,
}));

import {
  listProductsAction,
  getProductByIdAction,
  getFeaturedProductsAction,
  getFeaturedAuctionsAction,
  getLatestProductsAction,
  getLatestAuctionsAction,
  listAuctionsAction,
  getFeaturedPreOrdersAction,
  getLatestPreOrdersAction,
  listPreOrdersAction,
  getRelatedProductsAction,
  getSellerStorefrontProductsAction,
} from "../product.actions";

const emptyListResult = { items: [], total: 0, hasMore: false };
const singleProduct = { id: "product-hot-wheels-1", title: "Hot Wheels Redline", price: 50000 };

describe("listProductsAction — no auth required", () => {
  beforeEach(() => { vi.clearAllMocks(); mockListProducts.mockResolvedValue(emptyListResult); });

  it("no auth guard", async () => { await listProductsAction({}); });

  it("empty params → listProducts called with {}", async () => {
    await listProductsAction({});
    expect(mockListProducts).toHaveBeenCalledWith({});
  });

  it("params forwarded unchanged", async () => {
    await listProductsAction({ storeId: "store-1", page: 2 });
    expect(mockListProducts).toHaveBeenCalledWith({ storeId: "store-1", page: 2 });
  });

  it("returns { ok: true, data }", async () => {
    const result = await listProductsAction({});
    expect(result.ok).toBe(true);
  });
});

describe("getProductByIdAction — no auth required", () => {
  beforeEach(() => { vi.clearAllMocks(); mockGetProductById.mockResolvedValue(singleProduct); });

  it("id forwarded to getProductById", async () => {
    await getProductByIdAction("product-hot-wheels-1");
    expect(mockGetProductById).toHaveBeenCalledWith("product-hot-wheels-1");
  });

  it("returns { ok: true, data: ProductDocument }", async () => {
    const result = await getProductByIdAction("product-hot-wheels-1");
    expect(result.ok).toBe(true);
  });
});

describe("getFeaturedProductsAction — no auth required", () => {
  beforeEach(() => { vi.clearAllMocks(); mockGetFeaturedProducts.mockResolvedValue(emptyListResult); });

  it("default pageSize=8 → getFeaturedProducts(8)", async () => {
    await getFeaturedProductsAction();
    expect(mockGetFeaturedProducts).toHaveBeenCalledWith(8);
  });

  it("pageSize=4 forwarded", async () => {
    await getFeaturedProductsAction(4);
    expect(mockGetFeaturedProducts).toHaveBeenCalledWith(4);
  });
});

describe("getFeaturedAuctionsAction — no auth required", () => {
  beforeEach(() => { vi.clearAllMocks(); mockGetFeaturedAuctions.mockResolvedValue(emptyListResult); });

  it("default pageSize=6 → getFeaturedAuctions(6)", async () => {
    await getFeaturedAuctionsAction();
    expect(mockGetFeaturedAuctions).toHaveBeenCalledWith(6);
  });

  it("pageSize=3 forwarded", async () => {
    await getFeaturedAuctionsAction(3);
    expect(mockGetFeaturedAuctions).toHaveBeenCalledWith(3);
  });
});

describe("getLatestProductsAction — no auth required", () => {
  beforeEach(() => { vi.clearAllMocks(); mockGetLatestProducts.mockResolvedValue(emptyListResult); });

  it("default pageSize=12", async () => {
    await getLatestProductsAction();
    expect(mockGetLatestProducts).toHaveBeenCalledWith(12);
  });

  it("custom pageSize forwarded", async () => {
    await getLatestProductsAction(6);
    expect(mockGetLatestProducts).toHaveBeenCalledWith(6);
  });
});

describe("getLatestAuctionsAction — no auth required", () => {
  beforeEach(() => { vi.clearAllMocks(); mockGetLatestAuctions.mockResolvedValue(emptyListResult); });

  it("default pageSize=12", async () => {
    await getLatestAuctionsAction();
    expect(mockGetLatestAuctions).toHaveBeenCalledWith(12);
  });
});

describe("listAuctionsAction — no auth required", () => {
  beforeEach(() => { vi.clearAllMocks(); mockListAuctions.mockResolvedValue(emptyListResult); });

  it("params forwarded to listAuctions", async () => {
    await listAuctionsAction({ status: "active" });
    expect(mockListAuctions).toHaveBeenCalledWith({ status: "active" });
  });
});

describe("getFeaturedPreOrdersAction — no auth required", () => {
  beforeEach(() => { vi.clearAllMocks(); mockGetFeaturedPreOrders.mockResolvedValue(emptyListResult); });

  it("default pageSize=6", async () => {
    await getFeaturedPreOrdersAction();
    expect(mockGetFeaturedPreOrders).toHaveBeenCalledWith(6);
  });
});

describe("getLatestPreOrdersAction — no auth required", () => {
  beforeEach(() => { vi.clearAllMocks(); mockGetLatestPreOrders.mockResolvedValue(emptyListResult); });

  it("default pageSize=12", async () => {
    await getLatestPreOrdersAction();
    expect(mockGetLatestPreOrders).toHaveBeenCalledWith(12);
  });
});

describe("listPreOrdersAction — no auth required", () => {
  beforeEach(() => { vi.clearAllMocks(); mockListPreOrders.mockResolvedValue(emptyListResult); });

  it("params forwarded to listPreOrders", async () => {
    await listPreOrdersAction({ storeId: "store-1" });
    expect(mockListPreOrders).toHaveBeenCalledWith({ storeId: "store-1" });
  });
});

describe("getRelatedProductsAction — no auth required", () => {
  beforeEach(() => { vi.clearAllMocks(); mockGetRelatedProducts.mockResolvedValue(emptyListResult); });

  it("takes (categoryId, excludeId, limit) — NOT (productId, limit)", async () => {
    await getRelatedProductsAction("category-action-figures", "product-1", 4);
    expect(mockGetRelatedProducts).toHaveBeenCalledWith("category-action-figures", "product-1", 4);
  });

  it("default limit=6", async () => {
    await getRelatedProductsAction("category-action-figures", "product-1");
    expect(mockGetRelatedProducts).toHaveBeenCalledWith("category-action-figures", "product-1", 6);
  });
});

describe("getSellerStorefrontProductsAction — no auth required", () => {
  beforeEach(() => { vi.clearAllMocks(); mockGetStoreStorefrontProducts.mockResolvedValue([]); });

  it("delegates to getStoreStorefrontProducts (not getSellerStorefrontProducts)", async () => {
    await getSellerStorefrontProductsAction("store-pokemon-palace");
    expect(mockGetStoreStorefrontProducts).toHaveBeenCalledWith("store-pokemon-palace");
  });

  it("returns { ok: true, data: ProductDocument[] }", async () => {
    const result = await getSellerStorefrontProductsAction("store-pokemon-palace");
    expect(result.ok).toBe(true);
  });
});
