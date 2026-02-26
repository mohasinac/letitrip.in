/**
 * Blog Service Unit Tests
 */
import { apiClient } from "@/lib/api-client";
import { blogService } from "@/services";
import { API_ENDPOINTS } from "@/constants";

jest.mock("@/lib/api-client");

const mockGet = jest.mocked(apiClient.get);

describe("blogService", () => {
  beforeEach(() => jest.clearAllMocks());

  it("list() calls GET blog list without params", async () => {
    mockGet.mockResolvedValueOnce([] as never);
    await blogService.list();
    expect(mockGet).toHaveBeenCalledWith(API_ENDPOINTS.BLOG.LIST);
  });

  it("list() calls GET blog list with params", async () => {
    mockGet.mockResolvedValueOnce([] as never);
    await blogService.list("category=news&page=2");
    expect(mockGet).toHaveBeenCalledWith(
      `${API_ENDPOINTS.BLOG.LIST}?category=news&page=2`,
    );
  });

  it("getBySlug() calls GET with slug URL", async () => {
    mockGet.mockResolvedValueOnce({} as never);
    await blogService.getBySlug("my-post");
    expect(mockGet).toHaveBeenCalledWith(
      API_ENDPOINTS.BLOG.GET_BY_SLUG("my-post"),
    );
  });
});
