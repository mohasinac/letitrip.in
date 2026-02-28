/**
 * Admin Service Unit Tests
 * Verifies each method calls the correct apiClient method + endpoint.
 */
import { apiClient } from "@/lib/api-client";
import { adminService } from "@/services";
import { API_ENDPOINTS } from "@/constants";

jest.mock("@/lib/api-client");

const mockGet = jest.mocked(apiClient.get);
const mockPost = jest.mocked(apiClient.post);
const mockPatch = jest.mocked(apiClient.patch);
const mockDelete = jest.mocked(apiClient.delete);

describe("adminService", () => {
  beforeEach(() => jest.clearAllMocks());

  it("getDashboardStats() calls GET /api/admin/dashboard", async () => {
    mockGet.mockResolvedValueOnce({} as never);
    await adminService.getDashboardStats();
    expect(mockGet).toHaveBeenCalledWith(API_ENDPOINTS.ADMIN.DASHBOARD);
  });

  it("listSessions() calls GET sessions without params", async () => {
    mockGet.mockResolvedValueOnce([] as never);
    await adminService.listSessions();
    expect(mockGet).toHaveBeenCalledWith(API_ENDPOINTS.ADMIN.SESSIONS);
  });

  it("listSessions() calls GET sessions with params", async () => {
    mockGet.mockResolvedValueOnce([] as never);
    await adminService.listSessions("page=2");
    expect(mockGet).toHaveBeenCalledWith(
      `${API_ENDPOINTS.ADMIN.SESSIONS}?page=2`,
    );
  });

  it("revokeSession() calls DELETE with session URL", async () => {
    mockDelete.mockResolvedValueOnce({} as never);
    await adminService.revokeSession("sess_1");
    expect(mockDelete).toHaveBeenCalledWith(
      API_ENDPOINTS.ADMIN.REVOKE_SESSION("sess_1"),
    );
  });

  it("revokeUserSessions() calls POST with userId", async () => {
    mockPost.mockResolvedValueOnce({} as never);
    await adminService.revokeUserSessions("user_1");
    expect(mockPost).toHaveBeenCalledWith(
      API_ENDPOINTS.ADMIN.REVOKE_USER_SESSIONS,
      { userId: "user_1" },
    );
  });

  it("listOrders() calls GET admin orders without params", async () => {
    mockGet.mockResolvedValueOnce([] as never);
    await adminService.listOrders();
    expect(mockGet).toHaveBeenCalledWith(API_ENDPOINTS.ADMIN.ORDERS);
  });

  it("listOrders() calls GET admin orders with sieve query", async () => {
    mockGet.mockResolvedValueOnce([] as never);
    await adminService.listOrders("?filters=status==pending");
    expect(mockGet).toHaveBeenCalledWith(
      `${API_ENDPOINTS.ADMIN.ORDERS}?filters=status==pending`,
    );
  });

  it("updateOrder() calls PATCH with id and data", async () => {
    mockPatch.mockResolvedValueOnce({} as never);
    await adminService.updateOrder("ord_1", { status: "shipped" });
    expect(mockPatch).toHaveBeenCalledWith(
      API_ENDPOINTS.ADMIN.ORDER_BY_ID("ord_1"),
      { status: "shipped" },
    );
  });

  it("getAnalytics() calls GET analytics endpoint", async () => {
    mockGet.mockResolvedValueOnce({} as never);
    await adminService.getAnalytics();
    expect(mockGet).toHaveBeenCalledWith(API_ENDPOINTS.ADMIN.ANALYTICS);
  });

  it("listUsers() calls GET admin users without params", async () => {
    mockGet.mockResolvedValueOnce([] as never);
    await adminService.listUsers();
    expect(mockGet).toHaveBeenCalledWith(API_ENDPOINTS.ADMIN.USERS);
  });

  it("updateUser() calls PATCH with uid and data", async () => {
    mockPatch.mockResolvedValueOnce({} as never);
    await adminService.updateUser("uid_1", { role: "seller" });
    expect(mockPatch).toHaveBeenCalledWith(
      API_ENDPOINTS.ADMIN.USER_BY_ID("uid_1"),
      { role: "seller" },
    );
  });

  it("deleteUser() calls DELETE with uid URL", async () => {
    mockDelete.mockResolvedValueOnce({} as never);
    await adminService.deleteUser("uid_1");
    expect(mockDelete).toHaveBeenCalledWith(
      API_ENDPOINTS.ADMIN.USER_BY_ID("uid_1"),
    );
  });

  it("listBids() calls GET admin bids without params", async () => {
    mockGet.mockResolvedValueOnce([] as never);
    await adminService.listBids();
    expect(mockGet).toHaveBeenCalledWith(API_ENDPOINTS.ADMIN.BIDS);
  });

  it("listBlog() calls GET admin blog without params", async () => {
    mockGet.mockResolvedValueOnce([] as never);
    await adminService.listBlog();
    expect(mockGet).toHaveBeenCalledWith(API_ENDPOINTS.ADMIN.BLOG);
  });

  it("createBlogPost() calls POST with data", async () => {
    mockPost.mockResolvedValueOnce({} as never);
    const data = { title: "Post", content: "Content" };
    await adminService.createBlogPost(data);
    expect(mockPost).toHaveBeenCalledWith(API_ENDPOINTS.ADMIN.BLOG, data);
  });

  it("updateBlogPost() calls PATCH with id and data", async () => {
    mockPatch.mockResolvedValueOnce({} as never);
    await adminService.updateBlogPost("post_1", { title: "Updated" });
    expect(mockPatch).toHaveBeenCalledWith(
      API_ENDPOINTS.ADMIN.BLOG_BY_ID("post_1"),
      { title: "Updated" },
    );
  });

  it("deleteBlogPost() calls DELETE with post URL", async () => {
    mockDelete.mockResolvedValueOnce({} as never);
    await adminService.deleteBlogPost("post_1");
    expect(mockDelete).toHaveBeenCalledWith(
      API_ENDPOINTS.ADMIN.BLOG_BY_ID("post_1"),
    );
  });

  it("listPayouts() calls GET payouts without params", async () => {
    mockGet.mockResolvedValueOnce([] as never);
    await adminService.listPayouts();
    expect(mockGet).toHaveBeenCalledWith(API_ENDPOINTS.ADMIN.PAYOUTS);
  });

  it("updatePayout() calls PATCH with id and data", async () => {
    mockPatch.mockResolvedValueOnce({} as never);
    await adminService.updatePayout("pay_1", { status: "approved" });
    expect(mockPatch).toHaveBeenCalledWith(
      API_ENDPOINTS.ADMIN.PAYOUT_BY_ID("pay_1"),
      { status: "approved" },
    );
  });

  it("listAdminProducts() calls GET admin products without params", async () => {
    mockGet.mockResolvedValueOnce([] as never);
    await adminService.listAdminProducts();
    expect(mockGet).toHaveBeenCalledWith(API_ENDPOINTS.ADMIN.PRODUCTS);
  });

  it("createAdminProduct() calls POST with data", async () => {
    mockPost.mockResolvedValueOnce({} as never);
    const data = { title: "Product" };
    await adminService.createAdminProduct(data);
    expect(mockPost).toHaveBeenCalledWith(API_ENDPOINTS.ADMIN.PRODUCTS, data);
  });

  it("updateAdminProduct() calls PATCH with id and data", async () => {
    mockPatch.mockResolvedValueOnce({} as never);
    await adminService.updateAdminProduct("prod_1", { status: "published" });
    expect(mockPatch).toHaveBeenCalledWith(
      API_ENDPOINTS.ADMIN.PRODUCT_BY_ID("prod_1"),
      { status: "published" },
    );
  });

  it("deleteAdminProduct() calls DELETE with product URL", async () => {
    mockDelete.mockResolvedValueOnce({} as never);
    await adminService.deleteAdminProduct("prod_1");
    expect(mockDelete).toHaveBeenCalledWith(
      API_ENDPOINTS.ADMIN.PRODUCT_BY_ID("prod_1"),
    );
  });
});
