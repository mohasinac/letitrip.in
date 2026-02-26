/**
 * Carousel Service Unit Tests
 */
import { apiClient } from "@/lib/api-client";
import { carouselService } from "@/services";
import { API_ENDPOINTS } from "@/constants";

jest.mock("@/lib/api-client");

const mockGet = jest.mocked(apiClient.get);
const mockPost = jest.mocked(apiClient.post);
const mockPatch = jest.mocked(apiClient.patch);
const mockDelete = jest.mocked(apiClient.delete);

describe("carouselService", () => {
  beforeEach(() => jest.clearAllMocks());

  it("list() calls GET carousel list", async () => {
    mockGet.mockResolvedValueOnce([] as never);
    await carouselService.list();
    expect(mockGet).toHaveBeenCalledWith(API_ENDPOINTS.CAROUSEL.LIST);
  });

  it("getActive() calls GET carousel list with active=true", async () => {
    mockGet.mockResolvedValueOnce([] as never);
    await carouselService.getActive();
    expect(mockGet).toHaveBeenCalledWith(
      `${API_ENDPOINTS.CAROUSEL.LIST}?active=true`,
    );
  });

  it("getById() calls GET with slide URL", async () => {
    mockGet.mockResolvedValueOnce({} as never);
    await carouselService.getById("slide_1");
    expect(mockGet).toHaveBeenCalledWith(
      API_ENDPOINTS.CAROUSEL.GET_BY_ID("slide_1"),
    );
  });

  it("create() calls POST with data", async () => {
    mockPost.mockResolvedValueOnce({} as never);
    const data = { title: "Slide 1", order: 1 };
    await carouselService.create(data);
    expect(mockPost).toHaveBeenCalledWith(API_ENDPOINTS.CAROUSEL.CREATE, data);
  });

  it("update() calls PATCH with id and data", async () => {
    mockPatch.mockResolvedValueOnce({} as never);
    await carouselService.update("slide_1", { title: "Updated" });
    expect(mockPatch).toHaveBeenCalledWith(
      API_ENDPOINTS.CAROUSEL.UPDATE("slide_1"),
      { title: "Updated" },
    );
  });

  it("delete() calls DELETE with slide URL", async () => {
    mockDelete.mockResolvedValueOnce({} as never);
    await carouselService.delete("slide_1");
    expect(mockDelete).toHaveBeenCalledWith(
      API_ENDPOINTS.CAROUSEL.DELETE("slide_1"),
    );
  });

  it("reorder() calls POST reorder endpoint with orderedIds", async () => {
    mockPost.mockResolvedValueOnce({} as never);
    const data = { orderedIds: ["slide_2", "slide_1", "slide_3"] };
    await carouselService.reorder(data);
    expect(mockPost).toHaveBeenCalledWith(API_ENDPOINTS.CAROUSEL.REORDER, data);
  });
});
