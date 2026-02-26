/**
 * Profile Service Unit Tests
 */
import { apiClient } from "@/lib/api-client";
import { profileService } from "@/services";
import { API_ENDPOINTS } from "@/constants";

jest.mock("@/lib/api-client");

const mockGet = jest.mocked(apiClient.get);
const mockPatch = jest.mocked(apiClient.patch);

describe("profileService", () => {
  beforeEach(() => jest.clearAllMocks());

  it("getById() calls GET profile by user ID", async () => {
    mockGet.mockResolvedValueOnce({} as never);
    await profileService.getById("user_1");
    expect(mockGet).toHaveBeenCalledWith(
      API_ENDPOINTS.PROFILE.GET_BY_ID("user_1"),
    );
  });

  it("getSellerReviews() calls GET seller reviews by user ID", async () => {
    mockGet.mockResolvedValueOnce([] as never);
    await profileService.getSellerReviews("seller_1");
    expect(mockGet).toHaveBeenCalledWith(
      API_ENDPOINTS.PROFILE.GET_SELLER_REVIEWS("seller_1"),
    );
  });

  it("getSellerProducts() calls GET storefront products by user ID", async () => {
    mockGet.mockResolvedValueOnce([] as never);
    await profileService.getSellerProducts("seller_1");
    expect(mockGet).toHaveBeenCalledWith(
      API_ENDPOINTS.PROFILE.GET_STOREFRONT_PRODUCTS("seller_1"),
    );
  });

  it("update() calls PATCH user profile endpoint with data", async () => {
    mockPatch.mockResolvedValueOnce({} as never);
    const data = { displayName: "Updated Name" };
    await profileService.update(data);
    expect(mockPatch).toHaveBeenCalledWith(API_ENDPOINTS.USER.PROFILE, data);
  });
});
