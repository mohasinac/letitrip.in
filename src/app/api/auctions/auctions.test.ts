/**
 * @jest-environment node
 */
import { GET, POST } from "./route";
import { GET as GET_BY_ID, PATCH, DELETE } from "./[id]/route";
import { Collections } from "@/app/api/lib/firebase/collections";
import { getUserFromRequest, requireAuth } from "@/app/api/middleware/rbac-auth";
import { userOwnsShop } from "@/app/api/lib/firebase/queries";
import { executeCursorPaginatedQuery } from "@/app/api/lib/utils/pagination";

// Mock Firebase
jest.mock("@/app/api/lib/firebase/collections");
jest.mock("@/app/api/middleware/rbac-auth");
jest.mock("@/app/api/lib/firebase/queries");
jest.mock("@/app/api/lib/utils/pagination");

const mockGetUserFromRequest = getUserFromRequest as jest.MockedFunction<typeof getUserFromRequest>;
const mockRequireAuth = requireAuth as jest.MockedFunction<typeof requireAuth>;
const mockUserOwnsShop = userOwnsShop as jest.MockedFunction<typeof userOwnsShop>;
const mockExecuteCursorPaginatedQuery = executeCursorPaginatedQuery as jest.MockedFunction<typeof executeCursorPaginatedQuery>;

describe("Auctions API - GET /api/auctions", () => {
  const mockWhere = jest.fn().mockReturnThis();
  const mockOrderBy = jest.fn().mockReturnThis();
  const mockLimit = jest.fn().mockReturnThis();
  const mockCount = jest.fn();
  const mockGet = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (Collections.auctions as jest.Mock).mockReturnValue({
      where: mockWhere,
      orderBy: mockOrderBy,
      limit: mockLimit,
      count: mockCount,
      get: mockGet,
      doc: jest.fn(),
      add: jest.fn(),
    });

    mockExecuteCursorPaginatedQuery.mockResolvedValue({
      success: true,
      data: [],
      count: 0,
      pagination: { limit: 50, hasNextPage: false, nextCursor: null, count: 0 },
    });
  });

  it("should list active auctions for guest users", async () => {
    mockGetUserFromRequest.mockResolvedValue(null);
    mockExecuteCursorPaginatedQuery.mockResolvedValue({
      success: true,
      data: [{ id: "a1", status: "active", name: "Auction 1" }],
      count: 1,
      pagination: { limit: 50, hasNextPage: false, nextCursor: null, count: 1 },
    });

    const request = new Request("http://localhost/api/auctions");
    const response = await GET(request);
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(mockWhere).toHaveBeenCalledWith("status", "==", "active");
    expect(mockExecuteCursorPaginatedQuery).toHaveBeenCalled();
  });

  it("should list active auctions for regular users", async () => {
    mockGetUserFromRequest.mockResolvedValue({ uid: "u1", role: "user" } as any);

    const request = new Request("http://localhost/api/auctions");
    const response = await GET(request);

    expect(mockWhere).toHaveBeenCalledWith("status", "==", "active");
  });

  it("should require shop_id for seller without returning auctions", async () => {
    mockGetUserFromRequest.mockResolvedValue({ uid: "s1", role: "seller" } as any);

    const request = new Request("http://localhost/api/auctions");
    const response = await GET(request);
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.data).toEqual([]);
    expect(data.count).toBe(0);
  });

  it("should list seller's auctions with shop_id", async () => {
    mockGetUserFromRequest.mockResolvedValue({ uid: "s1", role: "seller" } as any);
    mockExecuteCursorPaginatedQuery.mockResolvedValue({
      success: true,
      data: [{ id: "a1", shop_id: "shop1", status: "draft" }],
      count: 1,
      pagination: { limit: 50, hasNextPage: false, nextCursor: null, count: 1 },
    });

    const request = new Request("http://localhost/api/auctions?shop_id=shop1");
    const response = await GET(request);
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(mockWhere).toHaveBeenCalledWith("shop_id", "==", "shop1");
  });

  it("should list all auctions for admin", async () => {
    mockGetUserFromRequest.mockResolvedValue({ uid: "a1", role: "admin" } as any);

    const request = new Request("http://localhost/api/auctions");
    await GET(request);

    // Admin should not have status filter applied automatically
    expect(mockExecuteCursorPaginatedQuery).toHaveBeenCalled();
  });

  it("should filter by category_id", async () => {
    mockGetUserFromRequest.mockResolvedValue(null);

    const request = new Request("http://localhost/api/auctions?categoryId=cat1");
    await GET(request);

    expect(mockWhere).toHaveBeenCalledWith("category_id", "==", "cat1");
  });

  it("should filter featured auctions", async () => {
    mockGetUserFromRequest.mockResolvedValue(null);

    const request = new Request("http://localhost/api/auctions?featured=true");
    await GET(request);

    expect(mockWhere).toHaveBeenCalledWith("is_featured", "==", true);
  });

  it("should sort by end_time", async () => {
    mockGetUserFromRequest.mockResolvedValue(null);

    const request = new Request("http://localhost/api/auctions?sortBy=end_time&sortOrder=asc");
    await GET(request);

    expect(mockOrderBy).toHaveBeenCalledWith("end_time", "asc");
  });

  it("should handle database errors", async () => {
    mockGetUserFromRequest.mockResolvedValue(null);
    mockExecuteCursorPaginatedQuery.mockRejectedValue(new Error("DB error"));

    const request = new Request("http://localhost/api/auctions");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBe("Failed to list auctions");
  });
});

describe("Auctions API - POST /api/auctions", () => {
  const mockAdd = jest.fn();
  const mockWhere = jest.fn().mockReturnThis();
  const mockLimit = jest.fn().mockReturnThis();
  const mockGet = jest.fn();
  const mockCount = jest.fn();
  const mockDoc = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (Collections.auctions as jest.Mock).mockReturnValue({
      add: mockAdd,
      where: mockWhere,
      limit: mockLimit,
      get: mockGet,
      count: mockCount,
      doc: mockDoc,
    });

    mockRequireAuth.mockResolvedValue({
      user: { uid: "s1", role: "seller" },
      error: null,
    } as any);

    mockUserOwnsShop.mockResolvedValue(true);
    mockGet.mockResolvedValue({ empty: true, docs: [] });
    mockCount.mockReturnValue({
      get: jest.fn().mockResolvedValue({ data: () => ({ count: 0 }) }),
    });
    mockAdd.mockResolvedValue({
      get: jest.fn().mockResolvedValue({
        id: "new-auction",
        data: () => ({ name: "New Auction", status: "active" }),
      }),
    });
  });

  it("should require authentication", async () => {
    mockRequireAuth.mockResolvedValue({
      user: null,
      error: new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 }),
    } as any);

    const request = new Request("http://localhost/api/auctions", {
      method: "POST",
      body: JSON.stringify({ shop_id: "shop1", name: "Test", slug: "test", starting_bid: 100, end_time: "2025-12-31" }),
    });
    const response = await POST(request);

    expect(response.status).toBe(401);
  });

  it("should reject non-seller/admin users", async () => {
    mockRequireAuth.mockResolvedValue({
      user: { uid: "u1", role: "user" },
      error: null,
    } as any);

    const request = new Request("http://localhost/api/auctions", {
      method: "POST",
      body: JSON.stringify({ shop_id: "shop1", name: "Test", slug: "test", starting_bid: 100, end_time: "2025-12-31" }),
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toContain("sellers and admins");
  });

  it("should create auction with valid data", async () => {
    const request = new Request("http://localhost/api/auctions", {
      method: "POST",
      body: JSON.stringify({
        shop_id: "shop1",
        name: "New Auction",
        slug: "new-auction",
        starting_bid: 100,
        end_time: "2025-12-31T23:59:59Z",
        description: "Test auction",
      }),
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(mockAdd).toHaveBeenCalled();
  });

  it("should reject missing required fields", async () => {
    const request = new Request("http://localhost/api/auctions", {
      method: "POST",
      body: JSON.stringify({ shop_id: "shop1", name: "Test" }),
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain("Missing required fields");
  });

  it("should prevent seller from creating auction for unowned shop", async () => {
    mockUserOwnsShop.mockResolvedValue(false);

    const request = new Request("http://localhost/api/auctions", {
      method: "POST",
      body: JSON.stringify({
        shop_id: "shop2",
        name: "Test",
        slug: "test",
        starting_bid: 100,
        end_time: "2025-12-31",
      }),
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toContain("Cannot create auction for this shop");
  });

  it("should enforce active auction limit per shop", async () => {
    mockCount.mockReturnValue({
      get: jest.fn().mockResolvedValue({ data: () => ({ count: 5 }) }),
    });

    const request = new Request("http://localhost/api/auctions", {
      method: "POST",
      body: JSON.stringify({
        shop_id: "shop1",
        name: "Test",
        slug: "test",
        starting_bid: 100,
        end_time: "2025-12-31",
      }),
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain("Active auction limit reached");
  });

  it("should reject duplicate slug", async () => {
    mockGet.mockResolvedValue({ empty: false, docs: [{ id: "existing" }] });

    const request = new Request("http://localhost/api/auctions", {
      method: "POST",
      body: JSON.stringify({
        shop_id: "shop1",
        name: "Test",
        slug: "existing-slug",
        starting_bid: 100,
        end_time: "2025-12-31",
      }),
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain("slug already exists");
  });

  it("should handle database errors", async () => {
    mockAdd.mockRejectedValue(new Error("DB error"));

    const request = new Request("http://localhost/api/auctions", {
      method: "POST",
      body: JSON.stringify({
        shop_id: "shop1",
        name: "Test",
        slug: "test",
        starting_bid: 100,
        end_time: "2025-12-31",
      }),
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Failed to create auction");
  });
});

describe("Auctions API - GET /api/auctions/[id]", () => {
  const mockWhere = jest.fn().mockReturnThis();
  const mockLimit = jest.fn().mockReturnThis();
  const mockGet = jest.fn();
  const mockDoc = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (Collections.auctions as jest.Mock).mockReturnValue({
      where: mockWhere,
      limit: mockLimit,
      get: mockGet,
      doc: mockDoc,
    });

    mockGetUserFromRequest.mockResolvedValue(null);
    mockUserOwnsShop.mockResolvedValue(false);
  });

  it("should get auction by slug", async () => {
    mockGet.mockResolvedValue({
      empty: false,
      docs: [
        {
          id: "a1",
          data: () => ({ name: "Auction 1", status: "active", shop_id: "shop1" }),
        },
      ],
    });

    const request = new Request("http://localhost/api/auctions/test-slug");
    const response = await GET_BY_ID(request, { params: Promise.resolve({ id: "test-slug" }) });
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.data.name).toBe("Auction 1");
    expect(mockWhere).toHaveBeenCalledWith("slug", "==", "test-slug");
  });

  it("should get auction by ID when slug not found", async () => {
    mockGet.mockResolvedValue({ empty: true, docs: [] });
    mockDoc.mockReturnValue({
      get: jest.fn().mockResolvedValue({
        exists: true,
        id: "a1",
        data: () => ({ name: "Auction 1", status: "active", shop_id: "shop1" }),
      }),
    });

    const request = new Request("http://localhost/api/auctions/a1");
    const response = await GET_BY_ID(request, { params: Promise.resolve({ id: "a1" }) });
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.data.name).toBe("Auction 1");
  });

  it("should return 404 for non-existent auction", async () => {
    mockGet.mockResolvedValue({ empty: true, docs: [] });
    mockDoc.mockReturnValue({
      get: jest.fn().mockResolvedValue({ exists: false }),
    });

    const request = new Request("http://localhost/api/auctions/nonexistent");
    const response = await GET_BY_ID(request, { params: Promise.resolve({ id: "nonexistent" }) });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe("Auction not found");
  });

  it("should hide draft/cancelled auctions from public", async () => {
    mockGet.mockResolvedValue({
      empty: false,
      docs: [
        {
          id: "a1",
          data: () => ({ name: "Draft Auction", status: "draft", shop_id: "shop1" }),
        },
      ],
    });

    const request = new Request("http://localhost/api/auctions/draft-auction");
    const response = await GET_BY_ID(request, { params: Promise.resolve({ id: "draft-auction" }) });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe("Auction not found");
  });

  it("should allow owner to view own draft auction", async () => {
    mockGetUserFromRequest.mockResolvedValue({ uid: "s1", role: "seller" } as any);
    mockUserOwnsShop.mockResolvedValue(true);
    mockGet.mockResolvedValue({
      empty: false,
      docs: [
        {
          id: "a1",
          data: () => ({ name: "Draft Auction", status: "draft", shop_id: "shop1" }),
        },
      ],
    });

    const request = new Request("http://localhost/api/auctions/draft-auction");
    const response = await GET_BY_ID(request, { params: Promise.resolve({ id: "draft-auction" }) });
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.data.status).toBe("draft");
  });

  it("should include camelCase aliases in response", async () => {
    mockGet.mockResolvedValue({
      empty: false,
      docs: [
        {
          id: "a1",
          data: () => ({
            name: "Auction 1",
            status: "active",
            shop_id: "shop1",
            starting_price: 100,
            current_price: 150,
            end_time: "2025-12-31",
          }),
        },
      ],
    });

    const request = new Request("http://localhost/api/auctions/test");
    const response = await GET_BY_ID(request, { params: Promise.resolve({ id: "test" }) });
    const data = await response.json();

    expect(data.data.shopId).toBe("shop1");
    expect(data.data.startingPrice).toBe(100);
    expect(data.data.currentPrice).toBe(150);
    expect(data.data.endTime).toBe("2025-12-31");
  });

  it("should handle database errors", async () => {
    mockGet.mockRejectedValue(new Error("DB error"));

    const request = new Request("http://localhost/api/auctions/test");
    const response = await GET_BY_ID(request, { params: Promise.resolve({ id: "test" }) });
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Failed to fetch auction");
  });
});

describe("Auctions API - PATCH /api/auctions/[id]", () => {
  const mockDoc = jest.fn();
  const mockUpdate = jest.fn();
  const mockGet = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (Collections.auctions as jest.Mock).mockReturnValue({ doc: mockDoc });

    mockRequireAuth.mockResolvedValue({
      user: { uid: "s1", role: "seller" },
      error: null,
    } as any);

    mockDoc.mockReturnValue({
      get: mockGet,
      update: mockUpdate,
    });

    mockGet.mockResolvedValue({
      exists: true,
      id: "a1",
      data: () => ({ name: "Original", status: "draft", shop_id: "shop1" }),
    });

    mockUserOwnsShop.mockResolvedValue(true);
  });

  it("should require authentication", async () => {
    mockRequireAuth.mockResolvedValue({
      user: null,
      error: new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 }),
    } as any);

    const request = new Request("http://localhost/api/auctions/a1", {
      method: "PATCH",
      body: JSON.stringify({ name: "Updated" }),
    });
    const response = await PATCH(request, { params: Promise.resolve({ id: "a1" }) });

    expect(response.status).toBe(401);
  });

  it("should update auction with valid data", async () => {
    const request = new Request("http://localhost/api/auctions/a1", {
      method: "PATCH",
      body: JSON.stringify({ name: "Updated Name", description: "Updated desc" }),
    });
    const response = await PATCH(request, { params: Promise.resolve({ id: "a1" }) });
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(mockUpdate).toHaveBeenCalled();
  });

  it("should prevent non-owner from updating", async () => {
    mockUserOwnsShop.mockResolvedValue(false);

    const request = new Request("http://localhost/api/auctions/a1", {
      method: "PATCH",
      body: JSON.stringify({ name: "Updated" }),
    });
    const response = await PATCH(request, { params: Promise.resolve({ id: "a1" }) });
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toBe("Forbidden");
  });

  it("should allow admin to update any auction", async () => {
    mockRequireAuth.mockResolvedValue({
      user: { uid: "a1", role: "admin" },
      error: null,
    } as any);

    const request = new Request("http://localhost/api/auctions/a1", {
      method: "PATCH",
      body: JSON.stringify({ name: "Admin Update" }),
    });
    const response = await PATCH(request, { params: Promise.resolve({ id: "a1" }) });
    const data = await response.json();

    expect(data.success).toBe(true);
  });

  it("should return 404 for non-existent auction", async () => {
    mockGet.mockResolvedValue({ exists: false });

    const request = new Request("http://localhost/api/auctions/nonexistent", {
      method: "PATCH",
      body: JSON.stringify({ name: "Updated" }),
    });
    const response = await PATCH(request, { params: Promise.resolve({ id: "nonexistent" }) });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe("Auction not found");
  });

  it("should handle database errors", async () => {
    mockUpdate.mockRejectedValue(new Error("DB error"));

    const request = new Request("http://localhost/api/auctions/a1", {
      method: "PATCH",
      body: JSON.stringify({ name: "Updated" }),
    });
    const response = await PATCH(request, { params: Promise.resolve({ id: "a1" }) });
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Failed to update auction");
  });
});

describe("Auctions API - DELETE /api/auctions/[id]", () => {
  const mockDoc = jest.fn();
  const mockDelete = jest.fn();
  const mockGet = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (Collections.auctions as jest.Mock).mockReturnValue({ doc: mockDoc });

    mockRequireAuth.mockResolvedValue({
      user: { uid: "s1", role: "seller" },
      error: null,
    } as any);

    mockDoc.mockReturnValue({
      get: mockGet,
      delete: mockDelete,
    });

    mockGet.mockResolvedValue({
      exists: true,
      id: "a1",
      data: () => ({ name: "Test Auction", status: "draft", shop_id: "shop1" }),
    });

    mockUserOwnsShop.mockResolvedValue(true);
  });

  it("should require authentication", async () => {
    mockRequireAuth.mockResolvedValue({
      user: null,
      error: new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 }),
    } as any);

    const request = new Request("http://localhost/api/auctions/a1", { method: "DELETE" });
    const response = await DELETE(request, { params: Promise.resolve({ id: "a1" }) });

    expect(response.status).toBe(401);
  });

  it("should delete auction successfully", async () => {
    const request = new Request("http://localhost/api/auctions/a1", { method: "DELETE" });
    const response = await DELETE(request, { params: Promise.resolve({ id: "a1" }) });
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.message).toBe("Auction deleted");
    expect(mockDelete).toHaveBeenCalled();
  });

  it("should prevent non-owner from deleting", async () => {
    mockUserOwnsShop.mockResolvedValue(false);

    const request = new Request("http://localhost/api/auctions/a1", { method: "DELETE" });
    const response = await DELETE(request, { params: Promise.resolve({ id: "a1" }) });
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toBe("Forbidden");
  });

  it("should allow admin to delete any auction", async () => {
    mockRequireAuth.mockResolvedValue({
      user: { uid: "a1", role: "admin" },
      error: null,
    } as any);

    const request = new Request("http://localhost/api/auctions/a1", { method: "DELETE" });
    const response = await DELETE(request, { params: Promise.resolve({ id: "a1" }) });
    const data = await response.json();

    expect(data.success).toBe(true);
  });

  it("should return 404 for non-existent auction", async () => {
    mockGet.mockResolvedValue({ exists: false });

    const request = new Request("http://localhost/api/auctions/nonexistent", { method: "DELETE" });
    const response = await DELETE(request, { params: Promise.resolve({ id: "nonexistent" }) });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe("Auction not found");
  });

  it("should handle database errors", async () => {
    mockDelete.mockRejectedValue(new Error("DB error"));

    const request = new Request("http://localhost/api/auctions/a1", { method: "DELETE" });
    const response = await DELETE(request, { params: Promise.resolve({ id: "a1" }) });
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Failed to delete auction");
  });
});
