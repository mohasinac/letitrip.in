/**
 * Product Service Unit Tests
 */
import { apiClient } from "@/lib/api-client";
import { productService } from "@/services";
import { API_ENDPOINTS } from "@/constants";

jest.mock("@/lib/api-client");

const mockGet = jest.mocked(apiClient.get);
const mockPost = jest.mocked(apiClient.post);
const mockPatch = jest.mocked(apiClient.patch);
const mockDelete = jest.mocked(apiClient.delete);

describe("productService", () => {
  beforeEach(() => jest.clearAllMocks());

  it("list() calls GET products without params", async () => {
    mockGet.mockResolvedValueOnce([] as never);
    await productService.list();
    expect(mockGet).toHaveBeenCalledWith(API_ENDPOINTS.PRODUCTS.LIST);
  });

  it("list() appends params when provided", async () => {
    mockGet.mockResolvedValueOnce([] as never);
    await productService.list("filters=status==published&pageSize=12");
    expect(mockGet).toHaveBeenCalledWith(
      `${API_ENDPOINTS.PRODUCTS.LIST}?filters=status==published&pageSize=12`,
    );
  });

  it("getById() calls GET with product ID", async () => {
    mockGet.mockResolvedValueOnce({} as never);
    await productService.getById("prod_1");
    expect(mockGet).toHaveBeenCalledWith(
      API_ENDPOINTS.PRODUCTS.GET_BY_ID("prod_1"),
    );
  });

  it("getFeatured() calls GET with featured filter", async () => {
    mockGet.mockResolvedValueOnce([] as never);
    await productService.getFeatured();
    expect(mockGet).toHaveBeenCalledWith(
      `${API_ENDPOINTS.PRODUCTS.LIST}?filters=featured==true&sorts=-createdAt&pageSize=8`,
    );
  });

  it("getFeaturedAuctions() calls GET with auction filter", async () => {
    mockGet.mockResolvedValueOnce([] as never);
    await productService.getFeaturedAuctions();
    expect(mockGet).toHaveBeenCalledWith(
      `${API_ENDPOINTS.PRODUCTS.LIST}?filters=type==auction,status==published&sorts=auctionEndDate&pageSize=6`,
    );
  });

  it("listAuctions() defaults to published auction filter", async () => {
    mockGet.mockResolvedValueOnce([] as never);
    await productService.listAuctions();
    expect(mockGet).toHaveBeenCalledWith(
      `${API_ENDPOINTS.PRODUCTS.LIST}?filters=isAuction==true,status==published&sorts=auctionEndDate`,
    );
  });

  it("listAuctions() appends sieve params when provided", async () => {
    mockGet.mockResolvedValueOnce([] as never);
    await productService.listAuctions("page=2&pageSize=10");
    expect(mockGet).toHaveBeenCalledWith(
      `${API_ENDPOINTS.PRODUCTS.LIST}?page=2&pageSize=10`,
    );
  });

  it("getRelated() builds correct related products URL", async () => {
    mockGet.mockResolvedValueOnce([] as never);
    await productService.getRelated("cat_1", "prod_999");
    expect(mockGet).toHaveBeenCalledWith(
      `${API_ENDPOINTS.PRODUCTS.LIST}?filters=categoryId==cat_1,status==published&sorts=-createdAt&pageSize=6&exclude=prod_999`,
    );
  });

  it("getBySeller() calls GET storefront products for seller", async () => {
    mockGet.mockResolvedValueOnce([] as never);
    await productService.getBySeller("seller_1");
    expect(mockGet).toHaveBeenCalledWith(
      API_ENDPOINTS.PROFILE.GET_STOREFRONT_PRODUCTS("seller_1"),
    );
  });

  it("create() calls POST with product data", async () => {
    mockPost.mockResolvedValueOnce({} as never);
    const data = { title: "New Product", price: 100 };
    await productService.create(data);
    expect(mockPost).toHaveBeenCalledWith(API_ENDPOINTS.PRODUCTS.CREATE, data);
  });

  it("update() calls PATCH with product ID and data", async () => {
    mockPatch.mockResolvedValueOnce({} as never);
    await productService.update("prod_1", { price: 150 });
    expect(mockPatch).toHaveBeenCalledWith(
      API_ENDPOINTS.PRODUCTS.UPDATE("prod_1"),
      { price: 150 },
    );
  });

  it("delete() calls DELETE with product ID", async () => {
    mockDelete.mockResolvedValueOnce({} as never);
    await productService.delete("prod_1");
    expect(mockDelete).toHaveBeenCalledWith(
      API_ENDPOINTS.PRODUCTS.DELETE("prod_1"),
    );
  });
});
