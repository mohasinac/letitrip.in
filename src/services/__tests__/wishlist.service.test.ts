/**
 * Wishlist Service Unit Tests
 */
import { apiClient } from "@/lib/api-client";
import { wishlistService } from "@/services";
import { API_ENDPOINTS } from "@/constants";

jest.mock("@/lib/api-client");

const mockGet = jest.mocked(apiClient.get);

describe("wishlistService", () => {
  beforeEach(() => jest.clearAllMocks());

  it("list() calls GET wishlist endpoint", async () => {
    mockGet.mockResolvedValueOnce([] as never);
    await wishlistService.list();
    expect(mockGet).toHaveBeenCalledWith(API_ENDPOINTS.USER.WISHLIST.LIST);
  });
});
