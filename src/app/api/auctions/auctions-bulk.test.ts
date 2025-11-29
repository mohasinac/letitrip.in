/**
 * @jest-environment node
 */

// Mock Firebase config BEFORE imports
jest.mock("@/app/api/lib/firebase/config", () => ({
  initializeFirebaseAdmin: jest.fn(),
  getFirebaseConfig: jest.fn(() => ({
    projectId: "test-project",
    clientEmail: "test@test.com",
    privateKey: "test-key",
  })),
}));

// Mock Firebase Admin BEFORE imports
jest.mock("@/app/api/lib/firebase/admin", () => ({
  getFirestoreAdmin: jest.fn(() => ({
    collection: jest.fn(),
  })),
}));

import { POST } from "./bulk/route";
import { GET as GET_LIVE } from "./live/route";
import { GET as GET_FEATURED } from "./featured/route";
import { GET as GET_WATCHLIST } from "./watchlist/route";
import { Collections } from "@/app/api/lib/firebase/collections";
import { requireAuth } from "@/app/api/middleware/rbac-auth";
import { userOwnsShop } from "@/app/api/lib/firebase/queries";
import { getCurrentUser } from "@/app/api/lib/session";

// Mock Firebase
jest.mock("@/app/api/lib/firebase/collections");
jest.mock("@/app/api/middleware/rbac-auth");
jest.mock("@/app/api/lib/firebase/queries");
jest.mock("@/app/api/lib/session");

const mockRequireAuth = requireAuth as jest.MockedFunction<typeof requireAuth>;
const mockUserOwnsShop = userOwnsShop as jest.MockedFunction<
  typeof userOwnsShop
>;
const mockGetCurrentUser = getCurrentUser as jest.MockedFunction<
  typeof getCurrentUser
>;

describe("Auctions API - POST /api/auctions/bulk", () => {
  const mockDoc = jest.fn();
  const mockUpdate = jest.fn();
  const mockDelete = jest.fn();
  const mockGet = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (Collections.auctions as jest.Mock).mockReturnValue({ doc: mockDoc });

    mockRequireAuth.mockResolvedValue({
      user: { uid: "s1", role: "seller" },
      error: null,
    } as any);

    mockUserOwnsShop.mockResolvedValue(true);

    mockDoc.mockReturnValue({
      get: mockGet,
      update: mockUpdate,
      delete: mockDelete,
    });

    mockGet.mockResolvedValue({
      exists: true,
      id: "a1",
      data: () => ({
        name: "Auction 1",
        status: "scheduled",
        shop_id: "shop1",
      }),
    });
  });

  it("should require authentication", async () => {
    mockRequireAuth.mockResolvedValue({
      user: null,
      error: new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      }),
    } as any);

    const request = new Request("http://localhost/api/auctions/bulk", {
      method: "POST",
      body: JSON.stringify({ action: "start", auctionIds: ["a1"] }),
    });
    const response = await POST(request);

    expect(response.status).toBe(401);
  });

  it("should reject non-seller/admin users", async () => {
    mockRequireAuth.mockResolvedValue({
      user: { uid: "u1", role: "user" },
      error: null,
    } as any);

    const request = new Request("http://localhost/api/auctions/bulk", {
      method: "POST",
      body: JSON.stringify({ action: "start", auctionIds: ["a1"] }),
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toContain("sellers and admins");
  });

  it("should require action and auctionIds", async () => {
    const request = new Request("http://localhost/api/auctions/bulk", {
      method: "POST",
      body: JSON.stringify({}),
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain("Action and auctionIds");
  });

  it("should reject invalid action", async () => {
    const request = new Request("http://localhost/api/auctions/bulk", {
      method: "POST",
      body: JSON.stringify({ action: "invalid", auctionIds: ["a1"] }),
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain("Invalid action");
  });

  it("should start scheduled auctions", async () => {
    const request = new Request("http://localhost/api/auctions/bulk", {
      method: "POST",
      body: JSON.stringify({ action: "start", auctionIds: ["a1"] }),
    });
    const response = await POST(request);
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.results[0].success).toBe(true);
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "active",
      }),
    );
  });

  it("should reject starting non-scheduled auctions", async () => {
    mockGet.mockResolvedValue({
      exists: true,
      data: () => ({ status: "active", shop_id: "shop1" }),
    });

    const request = new Request("http://localhost/api/auctions/bulk", {
      method: "POST",
      body: JSON.stringify({ action: "start", auctionIds: ["a1"] }),
    });
    const response = await POST(request);
    const data = await response.json();

    expect(data.results[0].success).toBe(false);
    expect(data.results[0].error).toContain("Only scheduled auctions");
  });

  it("should end active auctions", async () => {
    mockGet.mockResolvedValue({
      exists: true,
      data: () => ({ status: "active", shop_id: "shop1" }),
    });

    const request = new Request("http://localhost/api/auctions/bulk", {
      method: "POST",
      body: JSON.stringify({ action: "end", auctionIds: ["a1"] }),
    });
    const response = await POST(request);
    const data = await response.json();

    expect(data.results[0].success).toBe(true);
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "ended",
      }),
    );
  });

  it("should cancel scheduled/active auctions", async () => {
    mockGet.mockResolvedValue({
      exists: true,
      data: () => ({ status: "active", shop_id: "shop1" }),
    });

    const request = new Request("http://localhost/api/auctions/bulk", {
      method: "POST",
      body: JSON.stringify({ action: "cancel", auctionIds: ["a1"] }),
    });
    const response = await POST(request);
    const data = await response.json();

    expect(data.results[0].success).toBe(true);
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "cancelled",
      }),
    );
  });

  it("should feature auctions", async () => {
    const request = new Request("http://localhost/api/auctions/bulk", {
      method: "POST",
      body: JSON.stringify({ action: "feature", auctionIds: ["a1"] }),
    });
    const response = await POST(request);
    const data = await response.json();

    expect(data.results[0].success).toBe(true);
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        is_featured: true,
      }),
    );
  });

  it("should unfeature auctions", async () => {
    const request = new Request("http://localhost/api/auctions/bulk", {
      method: "POST",
      body: JSON.stringify({ action: "unfeature", auctionIds: ["a1"] }),
    });
    const response = await POST(request);
    const data = await response.json();

    expect(data.results[0].success).toBe(true);
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        is_featured: false,
      }),
    );
  });

  it("should delete draft/ended/cancelled auctions", async () => {
    mockGet.mockResolvedValue({
      exists: true,
      data: () => ({ status: "ended", shop_id: "shop1" }),
    });

    const request = new Request("http://localhost/api/auctions/bulk", {
      method: "POST",
      body: JSON.stringify({ action: "delete", auctionIds: ["a1"] }),
    });
    const response = await POST(request);
    const data = await response.json();

    expect(data.results[0].success).toBe(true);
    expect(mockDelete).toHaveBeenCalled();
  });

  it("should reject deleting active auctions", async () => {
    mockGet.mockResolvedValue({
      exists: true,
      data: () => ({ status: "active", shop_id: "shop1" }),
    });

    const request = new Request("http://localhost/api/auctions/bulk", {
      method: "POST",
      body: JSON.stringify({ action: "delete", auctionIds: ["a1"] }),
    });
    const response = await POST(request);
    const data = await response.json();

    expect(data.results[0].success).toBe(false);
    expect(data.results[0].error).toContain("draft, ended, or cancelled");
  });

  it("should update auction fields", async () => {
    const request = new Request("http://localhost/api/auctions/bulk", {
      method: "POST",
      body: JSON.stringify({
        action: "update",
        auctionIds: ["a1"],
        data: { name: "Updated Name" },
      }),
    });
    const response = await POST(request);
    const data = await response.json();

    expect(data.results[0].success).toBe(true);
    expect(mockUpdate).toHaveBeenCalled();
  });

  it("should require data for update action", async () => {
    const request = new Request("http://localhost/api/auctions/bulk", {
      method: "POST",
      body: JSON.stringify({ action: "update", auctionIds: ["a1"] }),
    });
    const response = await POST(request);
    const data = await response.json();

    expect(data.results[0].success).toBe(false);
    expect(data.results[0].error).toContain("Update data is required");
  });

  it("should prevent seller from modifying unowned auctions", async () => {
    mockUserOwnsShop.mockResolvedValue(false);

    const request = new Request("http://localhost/api/auctions/bulk", {
      method: "POST",
      body: JSON.stringify({ action: "start", auctionIds: ["a1"] }),
    });
    const response = await POST(request);
    const data = await response.json();

    expect(data.results[0].success).toBe(false);
    expect(data.results[0].error).toContain("Not authorized");
  });

  it("should handle non-existent auctions", async () => {
    mockGet.mockResolvedValue({ exists: false });

    const request = new Request("http://localhost/api/auctions/bulk", {
      method: "POST",
      body: JSON.stringify({ action: "start", auctionIds: ["nonexistent"] }),
    });
    const response = await POST(request);
    const data = await response.json();

    expect(data.results[0].success).toBe(false);
    expect(data.results[0].error).toBe("Auction not found");
  });

  it("should process multiple auctions with mixed results", async () => {
    mockGet
      .mockResolvedValueOnce({
        exists: true,
        data: () => ({ status: "scheduled", shop_id: "shop1" }),
      })
      .mockResolvedValueOnce({
        exists: true,
        data: () => ({ status: "active", shop_id: "shop1" }),
      });

    const request = new Request("http://localhost/api/auctions/bulk", {
      method: "POST",
      body: JSON.stringify({ action: "start", auctionIds: ["a1", "a2"] }),
    });
    const response = await POST(request);
    const data = await response.json();

    expect(data.results).toHaveLength(2);
    expect(data.results[0].success).toBe(true);
    expect(data.results[1].success).toBe(false);
    expect(data.summary.succeeded).toBe(1);
    expect(data.summary.failed).toBe(1);
  });

  it("should handle database errors gracefully", async () => {
    mockUpdate.mockRejectedValue(new Error("DB error"));

    const request = new Request("http://localhost/api/auctions/bulk", {
      method: "POST",
      body: JSON.stringify({ action: "start", auctionIds: ["a1"] }),
    });
    const response = await POST(request);
    const data = await response.json();

    expect(data.results[0].success).toBe(false);
    expect(data.results[0].error).toBe("DB error"); // Error message from the mock
  });
});

describe("Auctions API - GET /api/auctions/live", () => {
  const mockWhere = jest.fn().mockReturnThis();
  const mockOrderBy = jest.fn().mockReturnThis();
  const mockLimit = jest.fn().mockReturnThis();
  const mockGet = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (Collections.auctions as jest.Mock).mockReturnValue({
      where: mockWhere,
      orderBy: mockOrderBy,
      limit: mockLimit,
      get: mockGet,
    });

    mockGet.mockResolvedValue({
      docs: [
        {
          id: "a1",
          data: () => ({ name: "Live Auction 1", status: "active" }),
        },
        {
          id: "a2",
          data: () => ({ name: "Live Auction 2", status: "active" }),
        },
      ],
    });
  });

  it("should list live auctions", async () => {
    const request = new Request("http://localhost/api/auctions/live");
    const response = await GET_LIVE();
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.data).toHaveLength(2);
    expect(mockWhere).toHaveBeenCalledWith("status", "==", "active");
    expect(mockWhere).toHaveBeenCalledWith(
      "end_time",
      ">=",
      expect.any(String),
    );
    expect(mockOrderBy).toHaveBeenCalledWith("end_time", "asc");
    expect(mockLimit).toHaveBeenCalledWith(50);
  });

  it("should handle database errors", async () => {
    mockGet.mockRejectedValue(new Error("DB error"));

    const response = await GET_LIVE();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Failed to load live auctions");
  });
});

describe("Auctions API - GET /api/auctions/featured", () => {
  const mockWhere = jest.fn().mockReturnThis();
  const mockOrderBy = jest.fn().mockReturnThis();
  const mockLimit = jest.fn().mockReturnThis();
  const mockGet = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (Collections.auctions as jest.Mock).mockReturnValue({
      where: mockWhere,
      orderBy: mockOrderBy,
      limit: mockLimit,
      get: mockGet,
    });

    mockGet.mockResolvedValue({
      docs: [
        { id: "a1", data: () => ({ name: "Featured 1", is_featured: true }) },
        { id: "a2", data: () => ({ name: "Featured 2", is_featured: true }) },
      ],
    });
  });

  it("should list featured auctions", async () => {
    const response = await GET_FEATURED();
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.data).toHaveLength(2);
    expect(mockWhere).toHaveBeenCalledWith("is_featured", "==", true);
    expect(mockOrderBy).toHaveBeenCalledWith("featured_priority", "desc");
    expect(mockLimit).toHaveBeenCalledWith(50);
  });

  it("should handle database errors", async () => {
    mockGet.mockRejectedValue(new Error("DB error"));

    const response = await GET_FEATURED();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Failed to load featured auctions");
  });
});

describe("Auctions API - GET /api/auctions/watchlist", () => {
  const mockWhere = jest.fn().mockReturnThis();
  const mockOrderBy = jest.fn().mockReturnThis();
  const mockLimit = jest.fn().mockReturnThis();
  const mockGet = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (Collections.favorites as jest.Mock).mockReturnValue({
      where: mockWhere,
      orderBy: mockOrderBy,
      limit: mockLimit,
      get: mockGet,
    });

    mockGetCurrentUser.mockResolvedValue({ id: "u1", role: "user" } as any);
    mockGet.mockResolvedValue({
      docs: [
        {
          id: "f1",
          data: () => ({
            user_id: "u1",
            type: "auction_watch",
            auction_id: "a1",
          }),
        },
        {
          id: "f2",
          data: () => ({
            user_id: "u1",
            type: "auction_watch",
            auction_id: "a2",
          }),
        },
      ],
    });
  });

  it("should require authentication", async () => {
    mockGetCurrentUser.mockResolvedValue(null);

    const request = new Request("http://localhost/api/auctions/watchlist");
    const response = await GET_WATCHLIST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });

  it("should list user's watched auctions", async () => {
    const request = new Request("http://localhost/api/auctions/watchlist");
    const response = await GET_WATCHLIST(request);
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.data).toHaveLength(2);
    expect(mockWhere).toHaveBeenCalledWith("user_id", "==", "u1");
    expect(mockWhere).toHaveBeenCalledWith("type", "==", "auction_watch");
    expect(mockOrderBy).toHaveBeenCalledWith("created_at", "desc");
    expect(mockLimit).toHaveBeenCalledWith(100);
  });

  it("should handle database errors", async () => {
    mockGet.mockRejectedValue(new Error("DB error"));

    const request = new Request("http://localhost/api/auctions/watchlist");
    const response = await GET_WATCHLIST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Failed to load watchlist");
  });
});
