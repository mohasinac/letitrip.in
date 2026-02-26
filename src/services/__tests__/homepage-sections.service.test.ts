/**
 * Homepage Sections Service Unit Tests
 */
import { apiClient } from "@/lib/api-client";
import { homepageSectionsService } from "@/services";
import { API_ENDPOINTS } from "@/constants";

jest.mock("@/lib/api-client");

const mockGet = jest.mocked(apiClient.get);
const mockPost = jest.mocked(apiClient.post);
const mockPatch = jest.mocked(apiClient.patch);
const mockDelete = jest.mocked(apiClient.delete);

describe("homepageSectionsService", () => {
  beforeEach(() => jest.clearAllMocks());

  it("list() calls GET without params", async () => {
    mockGet.mockResolvedValueOnce([] as never);
    await homepageSectionsService.list();
    expect(mockGet).toHaveBeenCalledWith(API_ENDPOINTS.HOMEPAGE_SECTIONS.LIST);
  });

  it("list() appends params when provided", async () => {
    mockGet.mockResolvedValueOnce([] as never);
    await homepageSectionsService.list("type=hero");
    expect(mockGet).toHaveBeenCalledWith(
      `${API_ENDPOINTS.HOMEPAGE_SECTIONS.LIST}?type=hero`,
    );
  });

  it("listEnabled() calls GET with enabled=true filter", async () => {
    mockGet.mockResolvedValueOnce([] as never);
    await homepageSectionsService.listEnabled();
    expect(mockGet).toHaveBeenCalledWith(
      `${API_ENDPOINTS.HOMEPAGE_SECTIONS.LIST}?enabled=true`,
    );
  });

  it("getById() calls GET with section URL", async () => {
    mockGet.mockResolvedValueOnce({} as never);
    await homepageSectionsService.getById("section_1");
    expect(mockGet).toHaveBeenCalledWith(
      API_ENDPOINTS.HOMEPAGE_SECTIONS.GET_BY_ID("section_1"),
    );
  });

  it("create() calls POST with section data", async () => {
    mockPost.mockResolvedValueOnce({} as never);
    const data = { type: "hero", title: "Hero", enabled: true, order: 1 };
    await homepageSectionsService.create(data);
    expect(mockPost).toHaveBeenCalledWith(
      API_ENDPOINTS.HOMEPAGE_SECTIONS.CREATE,
      data,
    );
  });

  it("update() calls PATCH with id and data", async () => {
    mockPatch.mockResolvedValueOnce({} as never);
    await homepageSectionsService.update("section_1", { enabled: false });
    expect(mockPatch).toHaveBeenCalledWith(
      API_ENDPOINTS.HOMEPAGE_SECTIONS.UPDATE("section_1"),
      { enabled: false },
    );
  });

  it("delete() calls DELETE with section URL", async () => {
    mockDelete.mockResolvedValueOnce({} as never);
    await homepageSectionsService.delete("section_1");
    expect(mockDelete).toHaveBeenCalledWith(
      API_ENDPOINTS.HOMEPAGE_SECTIONS.DELETE("section_1"),
    );
  });

  it("reorder() calls POST with orderedIds payload", async () => {
    mockPost.mockResolvedValueOnce({} as never);
    const payload = { orderedIds: ["s1", "s2", "s3"] };
    await homepageSectionsService.reorder(payload);
    expect(mockPost).toHaveBeenCalledWith(
      API_ENDPOINTS.HOMEPAGE_SECTIONS.REORDER,
      payload,
    );
  });
});
