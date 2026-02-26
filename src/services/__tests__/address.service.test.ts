/**
 * Address Service Unit Tests
 * Verifies each method calls the correct apiClient method + endpoint.
 */
import { apiClient } from "@/lib/api-client";
import { addressService } from "@/services";
import { API_ENDPOINTS } from "@/constants";

jest.mock("@/lib/api-client");

const mockGet = jest.mocked(apiClient.get);
const mockPost = jest.mocked(apiClient.post);
const mockPatch = jest.mocked(apiClient.patch);
const mockDelete = jest.mocked(apiClient.delete);

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

  it("create() calls POST with data", async () => {
    mockPost.mockResolvedValueOnce({} as never);
    const data = { line1: "123 Main St", city: "Delhi" };
    await addressService.create(data);
    expect(mockPost).toHaveBeenCalledWith(API_ENDPOINTS.ADDRESSES.CREATE, data);
  });

  it("update() calls PATCH with id and data", async () => {
    mockPatch.mockResolvedValueOnce({} as never);
    const data = { city: "Mumbai" };
    await addressService.update("addr_1", data);
    expect(mockPatch).toHaveBeenCalledWith(
      API_ENDPOINTS.ADDRESSES.UPDATE("addr_1"),
      data,
    );
  });

  it("delete() calls DELETE with address URL", async () => {
    mockDelete.mockResolvedValueOnce({} as never);
    await addressService.delete("addr_1");
    expect(mockDelete).toHaveBeenCalledWith(
      API_ENDPOINTS.ADDRESSES.DELETE("addr_1"),
    );
  });

  it("setDefault() calls POST with the set-default URL", async () => {
    mockPost.mockResolvedValueOnce({} as never);
    await addressService.setDefault("addr_1");
    expect(mockPost).toHaveBeenCalledWith(
      API_ENDPOINTS.ADDRESSES.SET_DEFAULT("addr_1"),
      {},
    );
  });
});
