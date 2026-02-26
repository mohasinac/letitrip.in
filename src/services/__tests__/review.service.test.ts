/**
 * Review Service Unit Tests
 */
import { apiClient } from "@/lib/api-client";
import { reviewService } from "@/services";
import { API_ENDPOINTS } from "@/constants";

jest.mock("@/lib/api-client");

const mockGet = jest.mocked(apiClient.get);
const mockPost = jest.mocked(apiClient.post);
const mockPatch = jest.mocked(apiClient.patch);
const mockDelete = jest.mocked(apiClient.delete);

describe("reviewService", () => {
  beforeEach(() => jest.clearAllMocks());

  it("list() calls GET reviews without params", async () => {
    mockGet.mockResolvedValueOnce([] as never);
    await reviewService.list();
    expect(mockGet).toHaveBeenCalledWith(API_ENDPOINTS.REVIEWS.LIST);
  });

  it("list() appends params when provided", async () => {
    mockGet.mockResolvedValueOnce([] as never);
    await reviewService.list("filters=status==approved");
    expect(mockGet).toHaveBeenCalledWith(
      `${API_ENDPOINTS.REVIEWS.LIST}?filters=status==approved`,
    );
  });

  it("listAdmin() calls GET admin reviews without sieve query", async () => {
    mockGet.mockResolvedValueOnce([] as never);
    await reviewService.listAdmin();
    expect(mockGet).toHaveBeenCalledWith(API_ENDPOINTS.ADMIN.REVIEWS);
  });

  it("listAdmin() appends sieve query when provided", async () => {
    mockGet.mockResolvedValueOnce([] as never);
    await reviewService.listAdmin("?filters=status==pending");
    expect(mockGet).toHaveBeenCalledWith(
      `${API_ENDPOINTS.ADMIN.REVIEWS}?filters=status==pending`,
    );
  });

  it("listByProduct() builds correct paginated URL", async () => {
    mockGet.mockResolvedValueOnce([] as never);
    await reviewService.listByProduct("prod_1");
    expect(mockGet).toHaveBeenCalledWith(
      `${API_ENDPOINTS.REVIEWS.LIST}?productId=prod_1&page=1&pageSize=10&sorts=-createdAt`,
    );
  });

  it("listByProduct() uses custom page and pageSize", async () => {
    mockGet.mockResolvedValueOnce([] as never);
    await reviewService.listByProduct("prod_1", 2, 5);
    expect(mockGet).toHaveBeenCalledWith(
      `${API_ENDPOINTS.REVIEWS.LIST}?productId=prod_1&page=2&pageSize=5&sorts=-createdAt`,
    );
  });

  it("listBySeller() calls GET seller reviews for storefront", async () => {
    mockGet.mockResolvedValueOnce([] as never);
    await reviewService.listBySeller("seller_1");
    expect(mockGet).toHaveBeenCalledWith(
      API_ENDPOINTS.PROFILE.GET_SELLER_REVIEWS("seller_1"),
    );
  });

  it("getHomepageReviews() calls GET with approved+top-rated filter", async () => {
    mockGet.mockResolvedValueOnce([] as never);
    await reviewService.getHomepageReviews();
    expect(mockGet).toHaveBeenCalledWith(
      `${API_ENDPOINTS.REVIEWS.LIST}?filters=status==approved&sorts=-rating&pageSize=6`,
    );
  });

  it("getById() calls GET with review ID", async () => {
    mockGet.mockResolvedValueOnce({} as never);
    await reviewService.getById("rev_1");
    expect(mockGet).toHaveBeenCalledWith(
      API_ENDPOINTS.REVIEWS.GET_BY_ID("rev_1"),
    );
  });

  it("create() calls POST with review data", async () => {
    mockPost.mockResolvedValueOnce({} as never);
    const data = { productId: "prod_1", rating: 5, comment: "Great!" };
    await reviewService.create(data);
    expect(mockPost).toHaveBeenCalledWith(API_ENDPOINTS.REVIEWS.CREATE, data);
  });

  it("update() calls PATCH with review ID and data", async () => {
    mockPatch.mockResolvedValueOnce({} as never);
    await reviewService.update("rev_1", { rating: 4 });
    expect(mockPatch).toHaveBeenCalledWith(
      API_ENDPOINTS.REVIEWS.UPDATE("rev_1"),
      { rating: 4 },
    );
  });

  it("delete() calls DELETE with review ID", async () => {
    mockDelete.mockResolvedValueOnce({} as never);
    await reviewService.delete("rev_1");
    expect(mockDelete).toHaveBeenCalledWith(
      API_ENDPOINTS.REVIEWS.DELETE("rev_1"),
    );
  });

  it("vote() calls POST helpful vote", async () => {
    mockPost.mockResolvedValueOnce({} as never);
    await reviewService.vote("rev_1", { helpful: true });
    expect(mockPost).toHaveBeenCalledWith(API_ENDPOINTS.REVIEWS.VOTE("rev_1"), {
      helpful: true,
    });
  });

  it("vote() calls POST not-helpful vote", async () => {
    mockPost.mockResolvedValueOnce({} as never);
    await reviewService.vote("rev_1", { helpful: false });
    expect(mockPost).toHaveBeenCalledWith(API_ENDPOINTS.REVIEWS.VOTE("rev_1"), {
      helpful: false,
    });
  });
});
