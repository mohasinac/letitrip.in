/**
 * Category Service Unit Tests
 */
import { apiClient } from "@/lib/api-client";
import { categoryService } from "@/services";
import { API_ENDPOINTS } from "@/constants";

jest.mock("@/lib/api-client");

const mockGet = jest.mocked(apiClient.get);
const mockPost = jest.mocked(apiClient.post);
const mockPatch = jest.mocked(apiClient.patch);
const mockDelete = jest.mocked(apiClient.delete);

describe("categoryService", () => {
  beforeEach(() => jest.clearAllMocks());

  it("list() calls GET categories without params", async () => {
    mockGet.mockResolvedValueOnce([] as never);
    await categoryService.list();
    expect(mockGet).toHaveBeenCalledWith(API_ENDPOINTS.CATEGORIES.LIST);
  });

  it("list() calls GET categories with params", async () => {
    mockGet.mockResolvedValueOnce([] as never);
    await categoryService.list("filters=tier==1");
    expect(mockGet).toHaveBeenCalledWith(
      `${API_ENDPOINTS.CATEGORIES.LIST}?filters=tier==1`,
    );
  });

  it("listTopLevel() calls GET with tier==1 filter and default limit", async () => {
    mockGet.mockResolvedValueOnce([] as never);
    await categoryService.listTopLevel();
    expect(mockGet).toHaveBeenCalledWith(
      `${API_ENDPOINTS.CATEGORIES.LIST}?filters=tier==1&sorts=order&pageSize=12`,
    );
  });

  it("listTopLevel() uses custom limit", async () => {
    mockGet.mockResolvedValueOnce([] as never);
    await categoryService.listTopLevel(6);
    expect(mockGet).toHaveBeenCalledWith(
      `${API_ENDPOINTS.CATEGORIES.LIST}?filters=tier==1&sorts=order&pageSize=6`,
    );
  });

  it("getById() calls GET with category URL", async () => {
    mockGet.mockResolvedValueOnce({} as never);
    await categoryService.getById("cat_1");
    expect(mockGet).toHaveBeenCalledWith(
      API_ENDPOINTS.CATEGORIES.GET_BY_ID("cat_1"),
    );
  });

  it("create() calls POST with data", async () => {
    mockPost.mockResolvedValueOnce({} as never);
    const data = { name: "Electronics", slug: "electronics" };
    await categoryService.create(data);
    expect(mockPost).toHaveBeenCalledWith(
      API_ENDPOINTS.CATEGORIES.CREATE,
      data,
    );
  });

  it("update() calls PATCH with id and data", async () => {
    mockPatch.mockResolvedValueOnce({} as never);
    await categoryService.update("cat_1", { name: "Updated" });
    expect(mockPatch).toHaveBeenCalledWith(
      API_ENDPOINTS.CATEGORIES.UPDATE("cat_1"),
      { name: "Updated" },
    );
  });

  it("delete() calls DELETE with category URL", async () => {
    mockDelete.mockResolvedValueOnce({} as never);
    await categoryService.delete("cat_1");
    expect(mockDelete).toHaveBeenCalledWith(
      API_ENDPOINTS.CATEGORIES.DELETE("cat_1"),
    );
  });
});
