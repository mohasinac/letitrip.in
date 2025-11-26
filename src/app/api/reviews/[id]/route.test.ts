/**
 * @jest-environment node
 */
import { NextRequest, NextResponse } from "next/server";
import { GET, PATCH, DELETE } from "./route";
import { getUserFromRequest, requireAuth } from "@/app/api/middleware/rbac-auth";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";

jest.mock("@/app/api/middleware/rbac-auth");
jest.mock("@/app/api/lib/firebase/admin");

const mockGetUserFromRequest = getUserFromRequest as jest.MockedFunction<typeof getUserFromRequest>;
const mockRequireAuth = requireAuth as jest.MockedFunction<typeof requireAuth>;
const mockGetFirestoreAdmin = getFirestoreAdmin as jest.MockedFunction<typeof getFirestoreAdmin>;

describe("GET /api/reviews/[id]", () => {
  let mockDb: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockDb = {
      collection: jest.fn().mockReturnThis(),
      doc: jest.fn().mockReturnThis(),
      get: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    
    mockGetFirestoreAdmin.mockReturnValue(mockDb as any);
  });

  it("should get published review for public users", async () => {
    mockGetUserFromRequest.mockResolvedValue(null);
    
    mockDb.get.mockResolvedValue({
      exists: true,
      id: "rev1",
      data: () => ({ product_id: "prod1", rating: 5, status: "published" }),
    });

    const req = new NextRequest("http://localhost/api/reviews/rev1");
    const response = await GET(req, { params: Promise.resolve({ id: "rev1" }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.review.id).toBe("rev1");
    expect(data.review.rating).toBe(5);
  });

  it("should hide unpublished reviews from public", async () => {
    mockGetUserFromRequest.mockResolvedValue(null);
    
    mockDb.get.mockResolvedValue({
      exists: true,
      id: "rev1",
      data: () => ({ user_id: "user2", status: "pending" }),
    });

    const req = new NextRequest("http://localhost/api/reviews/rev1");
    const response = await GET(req, { params: Promise.resolve({ id: "rev1" }) });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe("Review not found");
  });

  it("should allow owner to see their unpublished review", async () => {
    mockGetUserFromRequest.mockResolvedValue({ uid: "user1", email: "user1@test.com", role: "user" });
    
    mockDb.get.mockResolvedValue({
      exists: true,
      id: "rev1",
      data: () => ({ user_id: "user1", status: "pending" }),
    });

    const req = new NextRequest("http://localhost/api/reviews/rev1");
    const response = await GET(req, { params: Promise.resolve({ id: "rev1" }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it("should allow admin to see any review", async () => {
    mockGetUserFromRequest.mockResolvedValue({ uid: "admin1", email: "admin@test.com", role: "admin" });
    
    mockDb.get.mockResolvedValue({
      exists: true,
      id: "rev1",
      data: () => ({ user_id: "user1", status: "rejected" }),
    });

    const req = new NextRequest("http://localhost/api/reviews/rev1");
    const response = await GET(req, { params: Promise.resolve({ id: "rev1" }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it("should return 404 if review not found", async () => {
    mockGetUserFromRequest.mockResolvedValue(null);
    
    mockDb.get.mockResolvedValue({ exists: false });

    const req = new NextRequest("http://localhost/api/reviews/rev1");
    const response = await GET(req, { params: Promise.resolve({ id: "rev1" }) });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe("Review not found");
  });

  it("should handle database errors", async () => {
    mockGetUserFromRequest.mockResolvedValue(null);
    mockDb.get.mockRejectedValue(new Error("DB error"));

    const req = new NextRequest("http://localhost/api/reviews/rev1");
    const response = await GET(req, { params: Promise.resolve({ id: "rev1" }) });
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Failed to fetch review");
  });
});

describe("PATCH /api/reviews/[id]", () => {
  let mockDb: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockDb = {
      collection: jest.fn().mockReturnThis(),
      doc: jest.fn().mockReturnThis(),
      get: jest.fn(),
      update: jest.fn(),
    };
    
    mockGetFirestoreAdmin.mockReturnValue(mockDb as any);
  });

  it("should require authentication", async () => {
    const errorResponse = NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    mockRequireAuth.mockResolvedValue({
      user: null,
      error: errorResponse,
    } as any);

    const req = new NextRequest("http://localhost/api/reviews/rev1", {
      method: "PATCH",
      body: JSON.stringify({ rating: 4 }),
    });
    
    const response = await PATCH(req, { params: Promise.resolve({ id: "rev1" }) });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });

  it("should allow owner to update their review", async () => {
    mockRequireAuth.mockResolvedValue({
      user: { uid: "user1", email: "user1@test.com", role: "user" as const },
      error: null,
    } as any);
    
    mockDb.get.mockResolvedValueOnce({
      exists: true,
      id: "rev1",
      data: () => ({ user_id: "user1", rating: 5 }),
    });
    
    mockDb.get.mockResolvedValueOnce({
      id: "rev1",
      data: () => ({ user_id: "user1", rating: 4, title: "Updated", comment: "Better feedback" }),
    });

    const req = new NextRequest("http://localhost/api/reviews/rev1", {
      method: "PATCH",
      body: JSON.stringify({ rating: 4, title: "Updated", comment: "Better feedback" }),
    });
    
    const response = await PATCH(req, { params: Promise.resolve({ id: "rev1" }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(mockDb.update).toHaveBeenCalledWith(expect.objectContaining({
      rating: 4,
      title: "Updated",
      comment: "Better feedback",
    }));
  });

  it("should allow admin to update any review", async () => {
    mockRequireAuth.mockResolvedValue({
      user: { uid: "admin1", email: "admin@test.com", role: "admin" as const },
      error: null,
    } as any);
    
    mockDb.get.mockResolvedValueOnce({
      exists: true,
      id: "rev1",
      data: () => ({ user_id: "user1", status: "published" }),
    });
    
    mockDb.get.mockResolvedValueOnce({
      id: "rev1",
      data: () => ({ user_id: "user1", status: "rejected" }),
    });

    const req = new NextRequest("http://localhost/api/reviews/rev1", {
      method: "PATCH",
      body: JSON.stringify({ status: "rejected", is_flagged: true }),
    });
    
    const response = await PATCH(req, { params: Promise.resolve({ id: "rev1" }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(mockDb.update).toHaveBeenCalledWith(expect.objectContaining({
      status: "rejected",
      is_flagged: true,
    }));
  });

  it("should prevent non-owner from updating review", async () => {
    mockRequireAuth.mockResolvedValue({
      user: { uid: "user2", email: "user2@test.com", role: "user" as const },
      error: null,
    } as any);
    
    mockDb.get.mockResolvedValue({
      exists: true,
      id: "rev1",
      data: () => ({ user_id: "user1" }),
    });

    const req = new NextRequest("http://localhost/api/reviews/rev1", {
      method: "PATCH",
      body: JSON.stringify({ rating: 1 }),
    });
    
    const response = await PATCH(req, { params: Promise.resolve({ id: "rev1" }) });
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toBe("You can only edit your own reviews");
  });

  it("should reject invalid rating", async () => {
    mockRequireAuth.mockResolvedValue({
      user: { uid: "user1", email: "user1@test.com", role: "user" as const },
      error: null,
    } as any);
    
    mockDb.get.mockResolvedValue({
      exists: true,
      id: "rev1",
      data: () => ({ user_id: "user1" }),
    });

    const req = new NextRequest("http://localhost/api/reviews/rev1", {
      method: "PATCH",
      body: JSON.stringify({ rating: 6 }),
    });
    
    const response = await PATCH(req, { params: Promise.resolve({ id: "rev1" }) });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Rating must be between 1 and 5");
  });

  it("should return 404 if review not found", async () => {
    mockRequireAuth.mockResolvedValue({
      user: { uid: "user1", email: "user1@test.com", role: "user" as const },
      error: null,
    } as any);
    
    mockDb.get.mockResolvedValue({ exists: false });

    const req = new NextRequest("http://localhost/api/reviews/rev1", {
      method: "PATCH",
      body: JSON.stringify({ rating: 4 }),
    });
    
    const response = await PATCH(req, { params: Promise.resolve({ id: "rev1" }) });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe("Review not found");
  });

  it("should handle database errors", async () => {
    mockRequireAuth.mockResolvedValue({
      user: { uid: "user1", email: "user1@test.com", role: "user" as const },
      error: null,
    } as any);
    
    mockDb.get.mockRejectedValue(new Error("DB error"));

    const req = new NextRequest("http://localhost/api/reviews/rev1", {
      method: "PATCH",
      body: JSON.stringify({ rating: 4 }),
    });
    
    const response = await PATCH(req, { params: Promise.resolve({ id: "rev1" }) });
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Failed to update review");
  });
});

describe("DELETE /api/reviews/[id]", () => {
  let mockDb: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockDb = {
      collection: jest.fn().mockReturnThis(),
      doc: jest.fn().mockReturnThis(),
      get: jest.fn(),
      delete: jest.fn(),
    };
    
    mockGetFirestoreAdmin.mockReturnValue(mockDb as any);
  });

  it("should require authentication", async () => {
    const errorResponse = NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    mockRequireAuth.mockResolvedValue({
      user: null,
      error: errorResponse,
    } as any);

    const req = new NextRequest("http://localhost/api/reviews/rev1", {
      method: "DELETE",
    });
    
    const response = await DELETE(req, { params: Promise.resolve({ id: "rev1" }) });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });

  it("should allow owner to delete their review", async () => {
    mockRequireAuth.mockResolvedValue({
      user: { uid: "user1", email: "user1@test.com", role: "user" as const },
      error: null,
    } as any);
    
    mockDb.get.mockResolvedValue({
      exists: true,
      id: "rev1",
      data: () => ({ user_id: "user1" }),
    });

    const req = new NextRequest("http://localhost/api/reviews/rev1", {
      method: "DELETE",
    });
    
    const response = await DELETE(req, { params: Promise.resolve({ id: "rev1" }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(mockDb.delete).toHaveBeenCalled();
  });

  it("should allow admin to delete any review", async () => {
    mockRequireAuth.mockResolvedValue({
      user: { uid: "admin1", email: "admin@test.com", role: "admin" as const },
      error: null,
    } as any);
    
    mockDb.get.mockResolvedValue({
      exists: true,
      id: "rev1",
      data: () => ({ user_id: "user1" }),
    });

    const req = new NextRequest("http://localhost/api/reviews/rev1", {
      method: "DELETE",
    });
    
    const response = await DELETE(req, { params: Promise.resolve({ id: "rev1" }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(mockDb.delete).toHaveBeenCalled();
  });

  it("should prevent non-owner from deleting review", async () => {
    mockRequireAuth.mockResolvedValue({
      user: { uid: "user2", email: "user2@test.com", role: "user" as const },
      error: null,
    } as any);
    
    mockDb.get.mockResolvedValue({
      exists: true,
      id: "rev1",
      data: () => ({ user_id: "user1" }),
    });

    const req = new NextRequest("http://localhost/api/reviews/rev1", {
      method: "DELETE",
    });
    
    const response = await DELETE(req, { params: Promise.resolve({ id: "rev1" }) });
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toBe("You can only delete your own reviews");
    expect(mockDb.delete).not.toHaveBeenCalled();
  });

  it("should return 404 if review not found", async () => {
    mockRequireAuth.mockResolvedValue({
      user: { uid: "user1", email: "user1@test.com", role: "user" as const },
      error: null,
    } as any);
    
    mockDb.get.mockResolvedValue({ exists: false });

    const req = new NextRequest("http://localhost/api/reviews/rev1", {
      method: "DELETE",
    });
    
    const response = await DELETE(req, { params: Promise.resolve({ id: "rev1" }) });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe("Review not found");
  });

  it("should handle database errors", async () => {
    mockRequireAuth.mockResolvedValue({
      user: { uid: "user1", email: "user1@test.com", role: "user" as const },
      error: null,
    } as any);
    
    mockDb.get.mockRejectedValue(new Error("DB error"));

    const req = new NextRequest("http://localhost/api/reviews/rev1", {
      method: "DELETE",
    });
    
    const response = await DELETE(req, { params: Promise.resolve({ id: "rev1" }) });
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Failed to delete review");
  });
});
