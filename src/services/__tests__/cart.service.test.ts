/**
 * Cart Service Unit Tests
 * NOTE: Mutation methods (addItem, updateItem, removeItem, clear, mergeGuestCart)
 * were removed from cartService in G1 cont. — they are now Server Actions in @/actions.
 */
import { apiClient } from "@/lib/api-client";
import { cartService } from "@/services";
import { API_ENDPOINTS } from "@/constants";

jest.mock("@/lib/api-client");

const mockGet = jest.mocked(apiClient.get);

describe("cartService", () => {
  beforeEach(() => jest.clearAllMocks());

  it("get() calls GET cart endpoint", async () => {
    mockGet.mockResolvedValueOnce({} as never);
    await cartService.get();
    expect(mockGet).toHaveBeenCalledWith(API_ENDPOINTS.CART.GET);
  });
});
