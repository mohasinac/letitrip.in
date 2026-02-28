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

  it("getFeatured() calls GET with featured=true and default count 4", async () => {
    mockGet.mockResolvedValueOnce([] as never);
    await blogService.getFeatured();
    expect(mockGet).toHaveBeenCalledWith(
      `${API_ENDPOINTS.BLOG.LIST}?featured=true&pageSize=4&sorts=-publishedAt`,
    );
  });

  it("getFeatured() calls GET with custom count", async () => {
    mockGet.mockResolvedValueOnce([] as never);
    await blogService.getFeatured(6);
    expect(mockGet).toHaveBeenCalledWith(
      `${API_ENDPOINTS.BLOG.LIST}?featured=true&pageSize=6&sorts=-publishedAt`,
    );
  });
});
