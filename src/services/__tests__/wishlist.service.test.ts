/**
 * Wishlist Service Unit Tests
 */
import { apiClient } from "@/lib/api-client";
import { wishlistService } from "@/services";
import { API_ENDPOINTS } from "@/constants";

jest.mock("@/lib/api-client");

const mockGet = jest.mocked(apiClient.get);
const mockPost = jest.mocked(apiClient.post);
const mockDelete = jest.mocked(apiClient.delete);

describe("wishlistService", () => {
  beforeEach(() => jest.clearAllMocks());

  it("list() calls GET wishlist endpoint", async () => {
    mockGet.mockResolvedValueOnce([] as never);
    await wishlistService.list();
    expect(mockGet).toHaveBeenCalledWith(API_ENDPOINTS.USER.WISHLIST.LIST);
  });

  it("add() calls POST with productId payload", async () => {
    mockPost.mockResolvedValueOnce({} as never);
    await wishlistService.add("prod_1");
    expect(mockPost).toHaveBeenCalledWith(API_ENDPOINTS.USER.WISHLIST.ADD, {
      productId: "prod_1",
    });
  });

  it("remove() calls DELETE with product remove URL", async () => {
    mockDelete.mockResolvedValueOnce({} as never);
    await wishlistService.remove("prod_1");
    expect(mockDelete).toHaveBeenCalledWith(
      API_ENDPOINTS.USER.WISHLIST.REMOVE("prod_1"),
    );
  });

  it("check() calls GET with product check URL", async () => {
    mockGet.mockResolvedValueOnce({ inWishlist: true } as never);
    await wishlistService.check("prod_1");
    expect(mockGet).toHaveBeenCalledWith(
      API_ENDPOINTS.USER.WISHLIST.CHECK("prod_1"),
    );
  });
});
