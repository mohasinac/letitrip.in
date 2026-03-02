/**
 * Seller Service Unit Tests
 */
import { apiClient } from "@/lib/api-client";
import { sellerService } from "@/services";
import { API_ENDPOINTS } from "@/constants";

jest.mock("@/lib/api-client");

const mockGet = jest.mocked(apiClient.get);
const mockPost = jest.mocked(apiClient.post);
const mockPatch = jest.mocked(apiClient.patch);

describe("sellerService", () => {
  beforeEach(() => jest.clearAllMocks());

  it("listOrders() calls GET seller orders without params", async () => {
    mockGet.mockResolvedValueOnce([] as never);
    await sellerService.listOrders();
    expect(mockGet).toHaveBeenCalledWith(API_ENDPOINTS.SELLER.ORDERS);
  });

  it("listOrders() appends params when provided", async () => {
    mockGet.mockResolvedValueOnce([] as never);
    await sellerService.listOrders("filters=status==pending&page=1");
    expect(mockGet).toHaveBeenCalledWith(
      `${API_ENDPOINTS.SELLER.ORDERS}?filters=status==pending&page=1`,
    );
  });

  it("getAnalytics() calls GET seller analytics endpoint", async () => {
    mockGet.mockResolvedValueOnce({} as never);
    await sellerService.getAnalytics();
    expect(mockGet).toHaveBeenCalledWith(API_ENDPOINTS.SELLER.ANALYTICS);
  });

  it("listPayouts() calls GET seller payouts without params", async () => {
    mockGet.mockResolvedValueOnce([] as never);
    await sellerService.listPayouts();
    expect(mockGet).toHaveBeenCalledWith(API_ENDPOINTS.SELLER.PAYOUTS);
  });

  it("listPayouts() appends params when provided", async () => {
    mockGet.mockResolvedValueOnce([] as never);
    await sellerService.listPayouts("page=2&pageSize=10");
    expect(mockGet).toHaveBeenCalledWith(
      `${API_ENDPOINTS.SELLER.PAYOUTS}?page=2&pageSize=10`,
    );
  });

  it("requestPayout() calls POST with payout data", async () => {
    mockPost.mockResolvedValueOnce({} as never);
    const data = { amount: 5000 };
    await sellerService.requestPayout(data);
    expect(mockPost).toHaveBeenCalledWith(API_ENDPOINTS.SELLER.PAYOUTS, data);
  });

  it("listProducts() builds URL with encoded sellerId filter", async () => {
    mockGet.mockResolvedValueOnce([] as never);
    await sellerService.listProducts("uid_123");
    expect(mockGet).toHaveBeenCalledWith(
      `${API_ENDPOINTS.PRODUCTS.LIST}?filters=${encodeURIComponent("sellerId==uid_123")}&pageSize=200`,
    );
  });

  it("getStore() calls GET seller store endpoint", async () => {
    mockGet.mockResolvedValueOnce({} as never);
    await sellerService.getStore();
    expect(mockGet).toHaveBeenCalledWith(API_ENDPOINTS.SELLER.STORE);
  });

  it("updateStore() calls PATCH with store data", async () => {
    mockPatch.mockResolvedValueOnce({} as never);
    const data = { storeName: "My Shop", isVacationMode: false };
    await sellerService.updateStore(data);
    expect(mockPatch).toHaveBeenCalledWith(API_ENDPOINTS.SELLER.STORE, data);
  });
});
