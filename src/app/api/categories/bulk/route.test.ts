/**
 * @jest-environment node
 */
import { NextRequest, NextResponse } from "next/server";
import { POST } from "./route";
import { Collections } from "@/app/api/lib/firebase/collections";
import { requireRole } from "@/app/api/middleware/rbac-auth";

jest.mock("@/app/api/lib/firebase/collections");
jest.mock("@/app/api/middleware/rbac-auth");

const mockCollections = Collections as jest.Mocked<typeof Collections>;
const mockRequireRole = requireRole as jest.MockedFunction<typeof requireRole>;

describe("POST /api/categories/bulk", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should reject non-admin users", async () => {
    mockRequireRole.mockResolvedValue({
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    } as any);

    const req = new NextRequest("http://localhost/api/categories/bulk", {
      method: "POST",
      body: JSON.stringify({ action: "activate", ids: ["cat1"] }),
    });

    const response = await POST(req);
    expect(response.status).toBe(403);
  });

  it("should require action parameter", async () => {
    mockRequireRole.mockResolvedValue({
      user: { uid: "admin", email: "admin@test.com", role: "admin" },
    } as any);

    const req = new NextRequest("http://localhost/api/categories/bulk", {
      method: "POST",
      body: JSON.stringify({ ids: ["cat1"] }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.errors.action).toBeTruthy();
  });

  it("should require ids array", async () => {
    mockRequireRole.mockResolvedValue({
      user: { uid: "admin", email: "admin@test.com", role: "admin" },
    } as any);

    const req = new NextRequest("http://localhost/api/categories/bulk", {
      method: "POST",
      body: JSON.stringify({ action: "activate" }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.errors.ids).toBeTruthy();
  });

  it("should reject invalid action", async () => {
    mockRequireRole.mockResolvedValue({
      user: { uid: "admin", email: "admin@test.com", role: "admin" },
    } as any);

    const req = new NextRequest("http://localhost/api/categories/bulk", {
      method: "POST",
      body: JSON.stringify({ action: "invalid_action", ids: ["cat1"] }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.errors.action).toContain("Invalid action");
  });

  it("should activate multiple categories", async () => {
    mockRequireRole.mockResolvedValue({
      user: { uid: "admin", email: "admin@test.com", role: "admin" },
    } as any);

    const mockUpdate = jest.fn().mockResolvedValue(undefined);
    const mockGet = jest.fn().mockResolvedValue({ exists: true });
    const mockDoc = jest.fn().mockReturnValue({
      update: mockUpdate,
      get: mockGet,
    });

    mockCollections.categories.mockReturnValue({ doc: mockDoc } as any);

    const req = new NextRequest("http://localhost/api/categories/bulk", {
      method: "POST",
      body: JSON.stringify({ action: "activate", ids: ["cat1", "cat2"] }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.success).toHaveLength(2);
    expect(mockUpdate).toHaveBeenCalledTimes(2);
  });

  it("should deactivate multiple categories", async () => {
    mockRequireRole.mockResolvedValue({
      user: { uid: "admin", email: "admin@test.com", role: "admin" },
    } as any);

    const mockUpdate = jest.fn().mockResolvedValue(undefined);
    const mockGet = jest.fn().mockResolvedValue({ exists: true });
    const mockDoc = jest.fn().mockReturnValue({
      update: mockUpdate,
      get: mockGet,
    });

    mockCollections.categories.mockReturnValue({ doc: mockDoc } as any);

    const req = new NextRequest("http://localhost/api/categories/bulk", {
      method: "POST",
      body: JSON.stringify({ action: "deactivate", ids: ["cat1", "cat2"] }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(data.data.success).toHaveLength(2);
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ is_active: false }),
    );
  });

  it("should feature multiple categories", async () => {
    mockRequireRole.mockResolvedValue({
      user: { uid: "admin", email: "admin@test.com", role: "admin" },
    } as any);

    const mockUpdate = jest.fn().mockResolvedValue(undefined);
    const mockGet = jest.fn().mockResolvedValue({ exists: true });
    const mockDoc = jest.fn().mockReturnValue({
      update: mockUpdate,
      get: mockGet,
    });

    mockCollections.categories.mockReturnValue({ doc: mockDoc } as any);

    const req = new NextRequest("http://localhost/api/categories/bulk", {
      method: "POST",
      body: JSON.stringify({ action: "feature", ids: ["cat1"] }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ is_featured: true }),
    );
  });

  it("should update multiple categories with custom data", async () => {
    mockRequireRole.mockResolvedValue({
      user: { uid: "admin", email: "admin@test.com", role: "admin" },
    } as any);

    const mockUpdate = jest.fn().mockResolvedValue(undefined);
    const mockGet = jest.fn().mockResolvedValue({ exists: true });
    const mockDoc = jest.fn().mockReturnValue({
      update: mockUpdate,
      get: mockGet,
    });

    mockCollections.categories.mockReturnValue({ doc: mockDoc } as any);

    const req = new NextRequest("http://localhost/api/categories/bulk", {
      method: "POST",
      body: JSON.stringify({
        action: "update",
        ids: ["cat1"],
        updates: { commission_rate: 10 },
      }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ commission_rate: 10 }),
    );
  });

  it("should handle partial failures gracefully", async () => {
    mockRequireRole.mockResolvedValue({
      user: { uid: "admin", email: "admin@test.com", role: "admin" },
    } as any);

    const mockDoc = jest.fn().mockImplementation((id) => {
      if (id === "cat1") {
        return {
          get: jest.fn().mockResolvedValue({ exists: true }),
          update: jest.fn().mockResolvedValue(undefined),
        };
      } else {
        return {
          get: jest.fn().mockResolvedValue({ exists: false }),
          update: jest.fn(),
        };
      }
    });

    mockCollections.categories.mockReturnValue({ doc: mockDoc } as any);

    const req = new NextRequest("http://localhost/api/categories/bulk", {
      method: "POST",
      body: JSON.stringify({ action: "activate", ids: ["cat1", "cat2"] }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(data.data.success).toHaveLength(1);
    expect(data.data.failed).toHaveLength(1);
    expect(data.data.failed[0].error).toBe("Category not found");
  });

  it("should prevent deletion of categories with children", async () => {
    mockRequireRole.mockResolvedValue({
      user: { uid: "admin", email: "admin@test.com", role: "admin" },
    } as any);

    const mockDoc = jest.fn().mockReturnValue({
      get: jest.fn().mockResolvedValue({
        exists: true,
        data: () => ({ children_ids: ["child1"] }),
      }),
      delete: jest.fn(),
    });

    mockCollections.categories.mockReturnValue({ doc: mockDoc } as any);

    const req = new NextRequest("http://localhost/api/categories/bulk", {
      method: "POST",
      body: JSON.stringify({ action: "delete", ids: ["cat1"] }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(data.data.failed).toHaveLength(1);
    expect(data.data.failed[0].error).toBe("Category has subcategories");
  });

  it("should prevent deletion of categories with products", async () => {
    mockRequireRole.mockResolvedValue({
      user: { uid: "admin", email: "admin@test.com", role: "admin" },
    } as any);

    const mockDoc = jest.fn().mockReturnValue({
      get: jest.fn().mockResolvedValue({
        exists: true,
        data: () => ({ children_ids: [] }),
      }),
      delete: jest.fn(),
    });

    const mockWhere = jest.fn().mockReturnThis();
    const mockLimit = jest.fn().mockReturnThis();
    const mockGet = jest.fn().mockResolvedValue({ empty: false });

    mockCollections.categories.mockReturnValue({ doc: mockDoc } as any);
    mockCollections.products.mockReturnValue({
      where: mockWhere,
      limit: mockLimit,
      get: mockGet,
    } as any);

    const req = new NextRequest("http://localhost/api/categories/bulk", {
      method: "POST",
      body: JSON.stringify({ action: "delete", ids: ["cat1"] }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(data.data.failed).toHaveLength(1);
    expect(data.data.failed[0].error).toBe("Category has products");
  });
});
