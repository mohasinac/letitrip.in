/**
 * Search Service Unit Tests
 */
import { apiClient } from "@/lib/api-client";
import { searchService } from "@/services";
import { API_ENDPOINTS } from "@/constants";

jest.mock("@/lib/api-client");

const mockGet = jest.mocked(apiClient.get);

describe("searchService", () => {
  beforeEach(() => jest.clearAllMocks());

  it("query() calls GET with search params appended", async () => {
    mockGet.mockResolvedValueOnce([] as never);
    await searchService.query("q=shoes&category=footwear&page=1");
    expect(mockGet).toHaveBeenCalledWith(
      `${API_ENDPOINTS.SEARCH.QUERY}?q=shoes&category=footwear&page=1`,
    );
  });

  it("query() passes empty params string as-is", async () => {
    mockGet.mockResolvedValueOnce([] as never);
    await searchService.query("");
    expect(mockGet).toHaveBeenCalledWith(`${API_ENDPOINTS.SEARCH.QUERY}?`);
  });
});
