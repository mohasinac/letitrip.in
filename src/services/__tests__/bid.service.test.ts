/**
 * Bid Service Unit Tests
 */
import { apiClient } from "@/lib/api-client";
import { bidService } from "@/services";
import { API_ENDPOINTS } from "@/constants";

jest.mock("@/lib/api-client");

const mockGet = jest.mocked(apiClient.get);

describe("bidService", () => {
  beforeEach(() => jest.clearAllMocks());

  it("listByProduct() calls GET with productId param", async () => {
    mockGet.mockResolvedValueOnce([] as never);
    await bidService.listByProduct("prod_1");
    expect(mockGet).toHaveBeenCalledWith(
      `${API_ENDPOINTS.BIDS.LIST}?productId=${encodeURIComponent("prod_1")}`,
    );
  });

  it("listByProduct() appends additional params", async () => {
    mockGet.mockResolvedValueOnce([] as never);
    await bidService.listByProduct("prod_1", "page=2&pageSize=10");
    expect(mockGet).toHaveBeenCalledWith(
      `${API_ENDPOINTS.BIDS.LIST}?productId=${encodeURIComponent("prod_1")}&page=2&pageSize=10`,
    );
  });

  it("getById() calls GET with bid URL", async () => {
    mockGet.mockResolvedValueOnce({} as never);
    await bidService.getById("bid_1");
    expect(mockGet).toHaveBeenCalledWith(API_ENDPOINTS.BIDS.GET_BY_ID("bid_1"));
  });
});
