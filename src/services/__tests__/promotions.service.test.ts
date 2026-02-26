/**
 * Promotions Service Unit Tests
 */
import { apiClient } from "@/lib/api-client";
import { promotionsService } from "@/services";
import { API_ENDPOINTS } from "@/constants";

jest.mock("@/lib/api-client");

const mockGet = jest.mocked(apiClient.get);

describe("promotionsService", () => {
  beforeEach(() => jest.clearAllMocks());

  it("list() calls GET promotions endpoint", async () => {
    mockGet.mockResolvedValueOnce({} as never);
    await promotionsService.list();
    expect(mockGet).toHaveBeenCalledWith(API_ENDPOINTS.PROMOTIONS.LIST);
  });
});
