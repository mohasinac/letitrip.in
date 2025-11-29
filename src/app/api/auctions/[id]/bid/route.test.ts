/**
 * @jest-environment node
 */
/**
 * Tests for Auction Bid API Routes
 * GET /api/auctions/[id]/bid - List bids for auction
 * POST /api/auctions/[id]/bid - Place a bid
 */

// Set up environment BEFORE any imports
process.env.FIREBASE_PROJECT_ID = "test-project";

// Mock dependencies BEFORE imports
jest.mock("@/app/api/lib/firebase/config", () => ({
  initializeFirebaseAdmin: jest.fn(),
  getFirestore: jest.fn(),
}));
jest.mock("@/app/api/lib/firebase/collections");
jest.mock("@/app/api/lib/session");
jest.mock("@/app/api/lib/firebase/transactions");

import { NextRequest } from "next/server";
import { GET, POST } from "./route";
import { Collections } from "@/app/api/lib/firebase/collections";
import { getCurrentUser } from "@/app/api/lib/session";
import { placeBid } from "@/app/api/lib/firebase/transactions";

const mockCollections = Collections as jest.Mocked<typeof Collections>;
const mockGetCurrentUser = getCurrentUser as jest.MockedFunction<
  typeof getCurrentUser
>;
const mockPlaceBid = placeBid as jest.MockedFunction<typeof placeBid>;

describe("GET /api/auctions/[id]/bid - List Bids", () => {
  let mockBidsCollection: any;
  let mockQuery: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock query chain
    mockQuery = {
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      startAfter: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      get: jest.fn(),
    };

    mockBidsCollection = {
      where: jest.fn().mockReturnValue(mockQuery),
      doc: jest.fn(),
    };

    mockCollections.bids.mockReturnValue(mockBidsCollection);
  });

  it("should list bids for an auction with default parameters", async () => {
    const mockBids = [
      {
        id: "bid1",
        data: () => ({
          auction_id: "auction1",
          user_id: "user1",
          amount: 1500,
          created_at: new Date(),
        }),
      },
      {
        id: "bid2",
        data: () => ({
          auction_id: "auction1",
          user_id: "user2",
          amount: 1400,
          created_at: new Date(),
        }),
      },
    ];

    mockQuery.get.mockResolvedValue({ docs: mockBids });

    const request = new NextRequest(
      "http://localhost:3000/api/auctions/auction1/bid",
    );
    const params = Promise.resolve({ id: "auction1" });

    const response = await GET(request, { params });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toHaveLength(2);
    expect(data.count).toBe(2);
    expect(mockBidsCollection.where).toHaveBeenCalledWith(
      "auction_id",
      "==",
      "auction1",
    );
    expect(mockQuery.orderBy).toHaveBeenCalledWith("created_at", "desc");
    expect(mockQuery.limit).toHaveBeenCalledWith(21); // limit + 1
  });

  it("should apply cursor pagination with startAfter", async () => {
    const mockStartDoc = {
      exists: true,
      id: "bid5",
    };

    mockBidsCollection.doc.mockReturnValue({
      get: jest.fn().mockResolvedValue(mockStartDoc),
    });

    mockQuery.get.mockResolvedValue({ docs: [] });

    const request = new NextRequest(
      "http://localhost:3000/api/auctions/auction1/bid?startAfter=bid5&limit=10",
    );
    const params = Promise.resolve({ id: "auction1" });

    await GET(request, { params });

    expect(mockBidsCollection.doc).toHaveBeenCalledWith("bid5");
    expect(mockQuery.startAfter).toHaveBeenCalledWith(mockStartDoc);
    expect(mockQuery.limit).toHaveBeenCalledWith(11); // limit + 1
  });

  it("should detect next page when docs exceed limit", async () => {
    const mockBids = Array.from({ length: 21 }, (_, i) => ({
      id: `bid${i}`,
      data: () => ({
        auction_id: "auction1",
        user_id: `user${i}`,
        amount: 1000 + i,
        created_at: new Date(),
      }),
    }));

    mockQuery.get.mockResolvedValue({ docs: mockBids });

    const request = new NextRequest(
      "http://localhost:3000/api/auctions/auction1/bid?limit=20",
    );
    const params = Promise.resolve({ id: "auction1" });

    const response = await GET(request, { params });
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.data).toHaveLength(20); // Trimmed to limit
    expect(data.pagination.hasNextPage).toBe(true);
    expect(data.pagination.nextCursor).toBe("bid19");
  });

  it("should set hasNextPage false when docs equal or below limit", async () => {
    const mockBids = Array.from({ length: 15 }, (_, i) => ({
      id: `bid${i}`,
      data: () => ({
        auction_id: "auction1",
        user_id: `user${i}`,
        amount: 1000 + i,
        created_at: new Date(),
      }),
    }));

    mockQuery.get.mockResolvedValue({ docs: mockBids });

    const request = new NextRequest(
      "http://localhost:3000/api/auctions/auction1/bid?limit=20",
    );
    const params = Promise.resolve({ id: "auction1" });

    const response = await GET(request, { params });
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.data).toHaveLength(15);
    expect(data.pagination.hasNextPage).toBe(false);
    expect(data.pagination.nextCursor).toBeNull();
  });

  it("should support ascending sort order", async () => {
    mockQuery.get.mockResolvedValue({ docs: [] });

    const request = new NextRequest(
      "http://localhost:3000/api/auctions/auction1/bid?sortOrder=asc",
    );
    const params = Promise.resolve({ id: "auction1" });

    await GET(request, { params });

    expect(mockQuery.orderBy).toHaveBeenCalledWith("created_at", "asc");
  });

  it("should return empty array when no bids exist", async () => {
    mockQuery.get.mockResolvedValue({ docs: [] });

    const request = new NextRequest(
      "http://localhost:3000/api/auctions/auction1/bid",
    );
    const params = Promise.resolve({ id: "auction1" });

    const response = await GET(request, { params });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toEqual([]);
    expect(data.count).toBe(0);
  });

  it("should handle database errors gracefully", async () => {
    mockQuery.get.mockRejectedValue(new Error("Database connection failed"));

    const request = new NextRequest(
      "http://localhost:3000/api/auctions/auction1/bid",
    );
    const params = Promise.resolve({ id: "auction1" });

    const response = await GET(request, { params });
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBe("Failed to list bids");
  });

  it("should skip startAfter if document doesn't exist", async () => {
    mockBidsCollection.doc.mockReturnValue({
      get: jest.fn().mockResolvedValue({ exists: false }),
    });

    mockQuery.get.mockResolvedValue({ docs: [] });

    const request = new NextRequest(
      "http://localhost:3000/api/auctions/auction1/bid?startAfter=invalid",
    );
    const params = Promise.resolve({ id: "auction1" });

    await GET(request, { params });

    // Should not call startAfter since doc doesn't exist
    expect(mockQuery.startAfter).not.toHaveBeenCalled();
  });
});

describe("POST /api/auctions/[id]/bid - Place Bid", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should place a bid successfully", async () => {
    const mockUser = {
      id: "user123",
      email: "user@test.com",
      name: "Test User",
      role: "user" as const,
    };
    const mockBidId = "bid123";
    const mockBidData = {
      auction_id: "auction1",
      user_id: "user123",
      amount: 1500,
      is_winning: true,
      created_at: new Date(),
    };

    mockGetCurrentUser.mockResolvedValue(mockUser);
    mockPlaceBid.mockResolvedValue(mockBidId);

    const mockBidsCollection = {
      doc: jest.fn().mockReturnValue({
        get: jest.fn().mockResolvedValue({
          id: mockBidId,
          data: () => mockBidData,
        }),
      }),
    };
    mockCollections.bids.mockReturnValue(mockBidsCollection as any);

    const request = new NextRequest(
      "http://localhost:3000/api/auctions/auction1/bid",
      {
        method: "POST",
        body: JSON.stringify({ bidAmount: 1500 }),
      },
    );
    const params = Promise.resolve({ id: "auction1" });

    const response = await POST(request, { params });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.id).toBe(mockBidId);
    expect(data.data.amount).toBe(1500);
    expect(mockPlaceBid).toHaveBeenCalledWith("auction1", "user123", 1500);
  });

  it("should reject bid from unauthenticated user", async () => {
    mockGetCurrentUser.mockResolvedValue(null);

    const request = new NextRequest(
      "http://localhost:3000/api/auctions/auction1/bid",
      {
        method: "POST",
        body: JSON.stringify({ bidAmount: 1500 }),
      },
    );
    const params = Promise.resolve({ id: "auction1" });

    const response = await POST(request, { params });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.error).toBe("Unauthorized");
    expect(mockPlaceBid).not.toHaveBeenCalled();
  });

  it("should reject invalid bid amount (not a number)", async () => {
    const mockUser = {
      id: "user123",
      email: "user@test.com",
      name: "Test User",
      role: "user" as const,
    };
    mockGetCurrentUser.mockResolvedValue(mockUser);

    const request = new NextRequest(
      "http://localhost:3000/api/auctions/auction1/bid",
      {
        method: "POST",
        body: JSON.stringify({ bidAmount: "invalid" }),
      },
    );
    const params = Promise.resolve({ id: "auction1" });

    const response = await POST(request, { params });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe("Invalid bid amount");
    expect(mockPlaceBid).not.toHaveBeenCalled();
  });

  it("should reject NaN bid amount (passed as null through JSON)", async () => {
    const mockUser = {
      id: "user123",
      email: "user@test.com",
      name: "Test User",
      role: "user" as const,
    };
    mockGetCurrentUser.mockResolvedValue(mockUser);
    // Number(null) = 0, which will fail at transaction level
    mockPlaceBid.mockRejectedValue(
      new Error("Bid amount must be higher than current bid"),
    );

    const mockBidId = "bid123";
    const mockBidsCollection = {
      doc: jest.fn().mockReturnValue({
        get: jest.fn().mockResolvedValue({
          id: mockBidId,
          data: () => ({ amount: 0 }),
        }),
      }),
    };
    mockCollections.bids.mockReturnValue(mockBidsCollection as any);

    // NaN converts to null in JSON, Number(null) = 0
    const request = new NextRequest(
      "http://localhost:3000/api/auctions/auction1/bid",
      {
        method: "POST",
        body: JSON.stringify({ bidAmount: null }),
      },
    );
    const params = Promise.resolve({ id: "auction1" });

    const response = await POST(request, { params });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    // Bid of 0 will be rejected by transaction as too low
    expect(mockPlaceBid).toHaveBeenCalledWith("auction1", "user123", 0);
  });

  it("should reject Infinity bid amount (passed as null through JSON)", async () => {
    const mockUser = {
      id: "user123",
      email: "user@test.com",
      name: "Test User",
      role: "user" as const,
    };
    mockGetCurrentUser.mockResolvedValue(mockUser);
    // Number(null) = 0, which will fail at transaction level
    mockPlaceBid.mockRejectedValue(
      new Error("Bid amount must be higher than current bid"),
    );

    const mockBidId = "bid123";
    const mockBidsCollection = {
      doc: jest.fn().mockReturnValue({
        get: jest.fn().mockResolvedValue({
          id: mockBidId,
          data: () => ({ amount: 0 }),
        }),
      }),
    };
    mockCollections.bids.mockReturnValue(mockBidsCollection as any);

    // Infinity converts to null in JSON, Number(null) = 0
    const request = new NextRequest(
      "http://localhost:3000/api/auctions/auction1/bid",
      {
        method: "POST",
        body: JSON.stringify({ bidAmount: null }),
      },
    );
    const params = Promise.resolve({ id: "auction1" });

    const response = await POST(request, { params });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    // Bid of 0 will be rejected by transaction as too low
    expect(mockPlaceBid).toHaveBeenCalledWith("auction1", "user123", 0);
  });

  it("should handle auction not found error", async () => {
    const mockUser = {
      id: "user123",
      email: "user@test.com",
      name: "Test User",
      role: "user" as const,
    };
    mockGetCurrentUser.mockResolvedValue(mockUser);
    mockPlaceBid.mockRejectedValue(new Error("Auction not found"));

    const request = new NextRequest(
      "http://localhost:3000/api/auctions/invalid/bid",
      {
        method: "POST",
        body: JSON.stringify({ bidAmount: 1500 }),
      },
    );
    const params = Promise.resolve({ id: "invalid" });

    const response = await POST(request, { params });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe("Auction not found");
  });

  it("should handle bid amount too low error", async () => {
    const mockUser = {
      id: "user123",
      email: "user@test.com",
      name: "Test User",
      role: "user" as const,
    };
    mockGetCurrentUser.mockResolvedValue(mockUser);
    mockPlaceBid.mockRejectedValue(
      new Error("Bid amount must be higher than current bid"),
    );

    const request = new NextRequest(
      "http://localhost:3000/api/auctions/auction1/bid",
      {
        method: "POST",
        body: JSON.stringify({ bidAmount: 1000 }),
      },
    );
    const params = Promise.resolve({ id: "auction1" });

    const response = await POST(request, { params });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe("Bid amount must be higher than current bid");
  });

  it("should handle missing bidAmount in request body", async () => {
    const mockUser = {
      id: "user123",
      email: "user@test.com",
      name: "Test User",
      role: "user" as const,
    };
    mockGetCurrentUser.mockResolvedValue(mockUser);

    const request = new NextRequest(
      "http://localhost:3000/api/auctions/auction1/bid",
      {
        method: "POST",
        body: JSON.stringify({}),
      },
    );
    const params = Promise.resolve({ id: "auction1" });

    const response = await POST(request, { params });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe("Invalid bid amount");
  });

  it("should handle zero bid amount", async () => {
    const mockUser = {
      id: "user123",
      email: "user@test.com",
      name: "Test User",
      role: "user" as const,
    };
    mockGetCurrentUser.mockResolvedValue(mockUser);
    mockPlaceBid.mockRejectedValue(
      new Error("Bid amount must be higher than current bid"),
    );

    const request = new NextRequest(
      "http://localhost:3000/api/auctions/auction1/bid",
      {
        method: "POST",
        body: JSON.stringify({ bidAmount: 0 }),
      },
    );
    const params = Promise.resolve({ id: "auction1" });

    const response = await POST(request, { params });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
  });

  it("should handle negative bid amount", async () => {
    const mockUser = {
      id: "user123",
      email: "user@test.com",
      name: "Test User",
      role: "user" as const,
    };
    mockGetCurrentUser.mockResolvedValue(mockUser);
    mockPlaceBid.mockRejectedValue(
      new Error("Bid amount must be higher than current bid"),
    );

    const request = new NextRequest(
      "http://localhost:3000/api/auctions/auction1/bid",
      {
        method: "POST",
        body: JSON.stringify({ bidAmount: -100 }),
      },
    );
    const params = Promise.resolve({ id: "auction1" });

    const response = await POST(request, { params });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
  });

  it("should handle database transaction errors", async () => {
    const mockUser = {
      id: "user123",
      email: "user@test.com",
      name: "Test User",
      role: "user" as const,
    };
    mockGetCurrentUser.mockResolvedValue(mockUser);
    mockPlaceBid.mockRejectedValue(new Error("Transaction failed"));

    const request = new NextRequest(
      "http://localhost:3000/api/auctions/auction1/bid",
      {
        method: "POST",
        body: JSON.stringify({ bidAmount: 1500 }),
      },
    );
    const params = Promise.resolve({ id: "auction1" });

    const response = await POST(request, { params });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe("Transaction failed");
  });

  it("should handle user without id", async () => {
    mockGetCurrentUser.mockResolvedValue({
      id: undefined,
      email: "user@test.com",
      name: "Test User",
      role: "user",
    } as any);

    const request = new NextRequest(
      "http://localhost:3000/api/auctions/auction1/bid",
      {
        method: "POST",
        body: JSON.stringify({ bidAmount: 1500 }),
      },
    );
    const params = Promise.resolve({ id: "auction1" });

    const response = await POST(request, { params });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.error).toBe("Unauthorized");
  });

  it("should handle large bid amounts", async () => {
    const mockUser = {
      id: "user123",
      email: "user@test.com",
      name: "Test User",
      role: "user" as const,
    };
    const largeBidAmount = 999999999;
    const mockBidId = "bid123";

    mockGetCurrentUser.mockResolvedValue(mockUser);
    mockPlaceBid.mockResolvedValue(mockBidId);

    const mockBidsCollection = {
      doc: jest.fn().mockReturnValue({
        get: jest.fn().mockResolvedValue({
          id: mockBidId,
          data: () => ({
            auction_id: "auction1",
            user_id: "user123",
            amount: largeBidAmount,
            is_winning: true,
          }),
        }),
      }),
    };
    mockCollections.bids.mockReturnValue(mockBidsCollection as any);

    const request = new NextRequest(
      "http://localhost:3000/api/auctions/auction1/bid",
      {
        method: "POST",
        body: JSON.stringify({ bidAmount: largeBidAmount }),
      },
    );
    const params = Promise.resolve({ id: "auction1" });

    const response = await POST(request, { params });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.amount).toBe(largeBidAmount);
  });

  it("should handle decimal bid amounts", async () => {
    const mockUser = {
      id: "user123",
      email: "user@test.com",
      name: "Test User",
      role: "user" as const,
    };
    const decimalBidAmount = 1500.5;
    const mockBidId = "bid123";

    mockGetCurrentUser.mockResolvedValue(mockUser);
    mockPlaceBid.mockResolvedValue(mockBidId);

    const mockBidsCollection = {
      doc: jest.fn().mockReturnValue({
        get: jest.fn().mockResolvedValue({
          id: mockBidId,
          data: () => ({
            auction_id: "auction1",
            user_id: "user123",
            amount: decimalBidAmount,
            is_winning: true,
          }),
        }),
      }),
    };
    mockCollections.bids.mockReturnValue(mockBidsCollection as any);

    const request = new NextRequest(
      "http://localhost:3000/api/auctions/auction1/bid",
      {
        method: "POST",
        body: JSON.stringify({ bidAmount: decimalBidAmount }),
      },
    );
    const params = Promise.resolve({ id: "auction1" });

    const response = await POST(request, { params });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.amount).toBe(decimalBidAmount);
  });

  it("should handle errors without message property", async () => {
    const mockUser = {
      id: "user123",
      email: "user@test.com",
      name: "Test User",
      role: "user" as const,
    };
    mockGetCurrentUser.mockResolvedValue(mockUser);
    mockPlaceBid.mockRejectedValue("Unknown error");

    const request = new NextRequest(
      "http://localhost:3000/api/auctions/auction1/bid",
      {
        method: "POST",
        body: JSON.stringify({ bidAmount: 1500 }),
      },
    );
    const params = Promise.resolve({ id: "auction1" });

    const response = await POST(request, { params });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe("Failed to place bid");
  });
});
