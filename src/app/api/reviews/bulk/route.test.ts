/**
 * @jest-environment node
 */
import { NextRequest, NextResponse } from "next/server";
import { POST } from "./route";
import { requireAdmin } from "@/app/api/middleware/rbac-auth";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";

jest.mock("@/app/api/middleware/rbac-auth");
jest.mock("@/app/api/lib/firebase/admin");

const mockRequireAdmin = requireAdmin as jest.MockedFunction<
  typeof requireAdmin
>;
const mockGetFirestoreAdmin = getFirestoreAdmin as jest.MockedFunction<
  typeof getFirestoreAdmin
>;

describe("POST /api/reviews/bulk", () => {
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

  it("should require admin authentication", async () => {
    const errorResponse = NextResponse.json(
      { error: "Admin access required" },
      { status: 403 },
    );
    mockRequireAdmin.mockResolvedValue({
      user: null,
      error: errorResponse,
    } as any);

    const req = new NextRequest("http://localhost/api/reviews/bulk", {
      method: "POST",
      body: JSON.stringify({ action: "approve", ids: ["rev1"] }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toBe("Admin access required");
  });

  it("should approve multiple reviews", async () => {
    mockRequireAdmin.mockResolvedValue({
      user: { uid: "admin1", email: "admin@test.com", role: "admin" as const },
      error: null,
    } as any);

    mockDb.get.mockResolvedValue({ exists: true });

    const req = new NextRequest("http://localhost/api/reviews/bulk", {
      method: "POST",
      body: JSON.stringify({ action: "approve", ids: ["rev1", "rev2"] }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.results.success).toHaveLength(2);
    expect(mockDb.update).toHaveBeenCalledTimes(2);
    expect(mockDb.update).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "published",
      }),
    );
  });

  it("should reject multiple reviews", async () => {
    mockRequireAdmin.mockResolvedValue({
      user: { uid: "admin1", email: "admin@test.com", role: "admin" as const },
      error: null,
    } as any);

    mockDb.get.mockResolvedValue({ exists: true });

    const req = new NextRequest("http://localhost/api/reviews/bulk", {
      method: "POST",
      body: JSON.stringify({ action: "reject", ids: ["rev1", "rev2"] }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.results.success).toHaveLength(2);
    expect(mockDb.update).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "rejected",
      }),
    );
  });

  it("should flag multiple reviews", async () => {
    mockRequireAdmin.mockResolvedValue({
      user: { uid: "admin1", email: "admin@test.com", role: "admin" as const },
      error: null,
    } as any);

    mockDb.get.mockResolvedValue({ exists: true });

    const req = new NextRequest("http://localhost/api/reviews/bulk", {
      method: "POST",
      body: JSON.stringify({ action: "flag", ids: ["rev1"] }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.results.success).toHaveLength(1);
    expect(mockDb.update).toHaveBeenCalledWith(
      expect.objectContaining({
        is_flagged: true,
      }),
    );
  });

  it("should unflag reviews", async () => {
    mockRequireAdmin.mockResolvedValue({
      user: { uid: "admin1", email: "admin@test.com", role: "admin" as const },
      error: null,
    } as any);

    mockDb.get.mockResolvedValue({ exists: true });

    const req = new NextRequest("http://localhost/api/reviews/bulk", {
      method: "POST",
      body: JSON.stringify({ action: "unflag", ids: ["rev1"] }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.results.success).toHaveLength(1);
    expect(mockDb.update).toHaveBeenCalledWith(
      expect.objectContaining({
        is_flagged: false,
        flagged_at: null,
      }),
    );
  });

  it("should delete multiple reviews", async () => {
    mockRequireAdmin.mockResolvedValue({
      user: { uid: "admin1", email: "admin@test.com", role: "admin" as const },
      error: null,
    } as any);

    mockDb.get.mockResolvedValue({ exists: true });

    const req = new NextRequest("http://localhost/api/reviews/bulk", {
      method: "POST",
      body: JSON.stringify({ action: "delete", ids: ["rev1", "rev2"] }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.results.success).toHaveLength(2);
    expect(mockDb.delete).toHaveBeenCalledTimes(2);
  });

  it("should update reviews with custom data", async () => {
    mockRequireAdmin.mockResolvedValue({
      user: { uid: "admin1", email: "admin@test.com", role: "admin" as const },
      error: null,
    } as any);

    mockDb.get.mockResolvedValue({ exists: true });

    const req = new NextRequest("http://localhost/api/reviews/bulk", {
      method: "POST",
      body: JSON.stringify({
        action: "update",
        ids: ["rev1"],
        data: { status: "published", is_flagged: false },
      }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.results.success).toHaveLength(1);
    expect(mockDb.update).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "published",
        is_flagged: false,
      }),
    );
  });

  it("should handle partial failures", async () => {
    mockRequireAdmin.mockResolvedValue({
      user: { uid: "admin1", email: "admin@test.com", role: "admin" as const },
      error: null,
    } as any);

    mockDb.get
      .mockResolvedValueOnce({ exists: true })
      .mockResolvedValueOnce({ exists: false })
      .mockResolvedValueOnce({ exists: true });

    const req = new NextRequest("http://localhost/api/reviews/bulk", {
      method: "POST",
      body: JSON.stringify({
        action: "approve",
        ids: ["rev1", "rev2", "rev3"],
      }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.results.success).toHaveLength(2);
    expect(data.results.failed).toHaveLength(1);
    expect(data.summary.succeeded).toBe(2);
    expect(data.summary.failed).toBe(1);
  });

  it("should reject invalid action", async () => {
    mockRequireAdmin.mockResolvedValue({
      user: { uid: "admin1", email: "admin@test.com", role: "admin" as const },
      error: null,
    } as any);

    mockDb.get.mockResolvedValue({ exists: true });

    const req = new NextRequest("http://localhost/api/reviews/bulk", {
      method: "POST",
      body: JSON.stringify({ action: "invalid", ids: ["rev1"] }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.results.failed).toHaveLength(1);
    expect(data.results.failed[0].error).toContain("Unknown action");
  });

  it("should reject missing ids", async () => {
    mockRequireAdmin.mockResolvedValue({
      user: { uid: "admin1", email: "admin@test.com", role: "admin" as const },
      error: null,
    } as any);

    const req = new NextRequest("http://localhost/api/reviews/bulk", {
      method: "POST",
      body: JSON.stringify({ action: "approve" }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain("Provide action and ids array");
  });

  it("should reject empty ids array", async () => {
    mockRequireAdmin.mockResolvedValue({
      user: { uid: "admin1", email: "admin@test.com", role: "admin" as const },
      error: null,
    } as any);

    const req = new NextRequest("http://localhost/api/reviews/bulk", {
      method: "POST",
      body: JSON.stringify({ action: "approve", ids: [] }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain("Provide action and ids array");
  });

  it("should handle database errors", async () => {
    mockRequireAdmin.mockResolvedValue({
      user: { uid: "admin1", email: "admin@test.com", role: "admin" as const },
      error: null,
    } as any);

    mockDb.get.mockRejectedValue(new Error("DB error"));

    const req = new NextRequest("http://localhost/api/reviews/bulk", {
      method: "POST",
      body: JSON.stringify({ action: "approve", ids: ["rev1"] }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.results.failed).toHaveLength(1);
  });
});
