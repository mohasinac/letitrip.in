/**
 * Newsletter Service Unit Tests
 */
import { apiClient } from "@/lib/api-client";
import { newsletterService } from "@/services";
import { API_ENDPOINTS } from "@/constants";

jest.mock("@/lib/api-client");

const mockGet = jest.mocked(apiClient.get);
const mockPost = jest.mocked(apiClient.post);
const mockPatch = jest.mocked(apiClient.patch);
const mockDelete = jest.mocked(apiClient.delete);

describe("newsletterService", () => {
  beforeEach(() => jest.clearAllMocks());

  it("subscribe() calls POST with email data", async () => {
    mockPost.mockResolvedValueOnce({} as never);
    await newsletterService.subscribe({ email: "test@example.com" });
    expect(mockPost).toHaveBeenCalledWith(API_ENDPOINTS.NEWSLETTER.SUBSCRIBE, {
      email: "test@example.com",
    });
  });

  it("subscribe() includes optional name field", async () => {
    mockPost.mockResolvedValueOnce({} as never);
    await newsletterService.subscribe({
      email: "test@example.com",
      name: "John",
    });
    expect(mockPost).toHaveBeenCalledWith(API_ENDPOINTS.NEWSLETTER.SUBSCRIBE, {
      email: "test@example.com",
      name: "John",
    });
  });

  it("list() calls GET admin newsletter without params", async () => {
    mockGet.mockResolvedValueOnce([] as never);
    await newsletterService.list();
    expect(mockGet).toHaveBeenCalledWith(API_ENDPOINTS.ADMIN.NEWSLETTER);
  });

  it("list() appends params when provided", async () => {
    mockGet.mockResolvedValueOnce([] as never);
    await newsletterService.list("page=2&pageSize=25");
    expect(mockGet).toHaveBeenCalledWith(
      `${API_ENDPOINTS.ADMIN.NEWSLETTER}?page=2&pageSize=25`,
    );
  });

  it("getById() calls GET newsletter by ID", async () => {
    mockGet.mockResolvedValueOnce({} as never);
    await newsletterService.getById("sub_1");
    expect(mockGet).toHaveBeenCalledWith(
      API_ENDPOINTS.ADMIN.NEWSLETTER_BY_ID("sub_1"),
    );
  });

  it("update() calls PATCH newsletter by ID with data", async () => {
    mockPatch.mockResolvedValueOnce({} as never);
    await newsletterService.update("sub_1", { active: false });
    expect(mockPatch).toHaveBeenCalledWith(
      API_ENDPOINTS.ADMIN.NEWSLETTER_BY_ID("sub_1"),
      { active: false },
    );
  });

  it("delete() calls DELETE newsletter by ID", async () => {
    mockDelete.mockResolvedValueOnce({} as never);
    await newsletterService.delete("sub_1");
    expect(mockDelete).toHaveBeenCalledWith(
      API_ENDPOINTS.ADMIN.NEWSLETTER_BY_ID("sub_1"),
    );
  });
});
