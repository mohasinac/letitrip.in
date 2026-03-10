/**
 * Address Service Unit Tests
 * Verifies each method calls the correct apiClient method + endpoint.
 */
import { apiClient } from "@/lib/api-client";
import { addressService } from "@/services";
import { API_ENDPOINTS } from "@/constants";

jest.mock("@/lib/api-client");

const mockGet = jest.mocked(apiClient.get);

describe("addressService", () => {
  beforeEach(() => jest.clearAllMocks());

  it("list() calls GET /api/user/addresses", async () => {
    mockGet.mockResolvedValueOnce([] as never);
    await addressService.list();
    expect(mockGet).toHaveBeenCalledWith(API_ENDPOINTS.ADDRESSES.LIST);
  });

  it("getById() calls GET with parameterised address URL", async () => {
    mockGet.mockResolvedValueOnce({} as never);
    await addressService.getById("addr_1");
    expect(mockGet).toHaveBeenCalledWith(
      API_ENDPOINTS.ADDRESSES.GET_BY_ID("addr_1"),
    );
  });
});
