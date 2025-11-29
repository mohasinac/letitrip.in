/**
 * @jest-environment node
 */
import { NextRequest, NextResponse } from "next/server";
import { GET, PATCH, DELETE } from "./route";
import { Collections } from "@/app/api/lib/firebase/collections";
import {
  getUserFromRequest,
  requireRole,
} from "@/app/api/middleware/rbac-auth";

jest.mock("@/app/api/lib/firebase/collections");
jest.mock("@/app/api/middleware/rbac-auth");

const mockCollections = Collections as jest.Mocked<typeof Collections>;
const mockGetUserFromRequest = getUserFromRequest as jest.MockedFunction<
  typeof getUserFromRequest
>;
const mockRequireRole = requireRole as jest.MockedFunction<typeof requireRole>;

describe("GET /api/categories/[slug]", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return category for public user (active category)", async () => {
    mockGetUserFromRequest.mockResolvedValue(null);

    const mockDoc = {
      id: "cat1",
      data: () => ({
        name: "Electronics",
        slug: "electronics",
        is_active: true,
        parent_id: "parent1",
        parent_ids: ["parent1"],
        children_ids: ["child1", "child2"],
        is_featured: true,
        show_on_homepage: true,
        product_count: 50,
        child_count: 2,
        has_children: true,
        sort_order: 1,
        meta_title: "Buy Electronics",
        commission_rate: 5,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-02T00:00:00Z",
      }),
    };

    const mockWhere = jest.fn().mockReturnThis();
    const mockLimit = jest.fn().mockReturnThis();
    const mockGet = jest.fn().mockResolvedValue({
      empty: false,
      docs: [mockDoc],
    });

    mockCollections.categories.mockReturnValue({
      where: mockWhere,
      limit: mockLimit,
      get: mockGet,
    } as any);

    const req = new NextRequest("http://localhost/api/categories/electronics");
    const response = await GET(req, {
      params: Promise.resolve({ slug: "electronics" }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.name).toBe("Electronics");
    expect(data.data.parentIds).toEqual(["parent1"]);
    expect(data.data.childrenIds).toEqual(["child1", "child2"]);
  });

  it("should hide inactive category from public user", async () => {
    mockGetUserFromRequest.mockResolvedValue(null);

    const mockDoc = {
      id: "cat1",
      data: () => ({
        name: "Electronics",
        slug: "electronics",
        is_active: false,
      }),
    };

    const mockWhere = jest.fn().mockReturnThis();
    const mockLimit = jest.fn().mockReturnThis();
    const mockGet = jest.fn().mockResolvedValue({
      empty: false,
      docs: [mockDoc],
    });

    mockCollections.categories.mockReturnValue({
      where: mockWhere,
      limit: mockLimit,
      get: mockGet,
    } as any);

    const req = new NextRequest("http://localhost/api/categories/electronics");
    const response = await GET(req, {
      params: Promise.resolve({ slug: "electronics" }),
    });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.success).toBe(false);
    expect(data.error).toBe("Category not found");
  });

  it("should return inactive category for admin user", async () => {
    mockGetUserFromRequest.mockResolvedValue({
      uid: "admin1",
      email: "admin@test.com",
      role: "admin",
    });

    const mockDoc = {
      id: "cat1",
      data: () => ({
        name: "Electronics",
        slug: "electronics",
        is_active: false,
      }),
    };

    const mockWhere = jest.fn().mockReturnThis();
    const mockLimit = jest.fn().mockReturnThis();
    const mockGet = jest.fn().mockResolvedValue({
      empty: false,
      docs: [mockDoc],
    });

    mockCollections.categories.mockReturnValue({
      where: mockWhere,
      limit: mockLimit,
      get: mockGet,
    } as any);

    const req = new NextRequest("http://localhost/api/categories/electronics");
    const response = await GET(req, {
      params: Promise.resolve({ slug: "electronics" }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.name).toBe("Electronics");
  });

  it("should return 404 for non-existent category", async () => {
    mockGetUserFromRequest.mockResolvedValue(null);

    const mockWhere = jest.fn().mockReturnThis();
    const mockLimit = jest.fn().mockReturnThis();
    const mockGet = jest.fn().mockResolvedValue({ empty: true });

    mockCollections.categories.mockReturnValue({
      where: mockWhere,
      limit: mockLimit,
      get: mockGet,
    } as any);

    const req = new NextRequest("http://localhost/api/categories/nonexistent");
    const response = await GET(req, {
      params: Promise.resolve({ slug: "nonexistent" }),
    });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.success).toBe(false);
  });

  it("should handle database errors", async () => {
    mockGetUserFromRequest.mockResolvedValue(null);

    const mockWhere = jest.fn().mockReturnThis();
    const mockLimit = jest.fn().mockReturnThis();
    const mockGet = jest.fn().mockRejectedValue(new Error("DB error"));

    mockCollections.categories.mockReturnValue({
      where: mockWhere,
      limit: mockLimit,
      get: mockGet,
    } as any);

    const req = new NextRequest("http://localhost/api/categories/electronics");
    const response = await GET(req, {
      params: Promise.resolve({ slug: "electronics" }),
    });
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
  });
});

describe("PATCH /api/categories/[slug]", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should reject non-admin users", async () => {
    mockRequireRole.mockResolvedValue({
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    } as any);

    const req = new NextRequest("http://localhost/api/categories/electronics", {
      method: "PATCH",
      body: JSON.stringify({ name: "Updated" }),
    });

    const response = await PATCH(req, {
      params: Promise.resolve({ slug: "electronics" }),
    });

    expect(response.status).toBe(403);
  });

  it("should update category fields", async () => {
    mockRequireRole.mockResolvedValue({
      user: { uid: "admin", email: "admin@test.com", role: "admin" },
    } as any);

    const mockDoc = {
      id: "cat1",
      data: () => ({
        name: "Electronics",
        slug: "electronics",
        parent_ids: [],
      }),
    };

    const mockWhere = jest.fn().mockReturnThis();
    const mockLimit = jest.fn().mockReturnThis();
    const mockGet = jest.fn().mockResolvedValue({
      empty: false,
      docs: [mockDoc],
    });
    const mockDoc2 = jest.fn();
    const mockUpdate = jest.fn().mockResolvedValue(undefined);
    const mockGet2 = jest.fn().mockResolvedValue({
      id: "cat1",
      data: () => ({
        name: "Updated Electronics",
        slug: "electronics",
        updated_at: "2024-01-03T00:00:00Z",
      }),
    });

    mockCollections.categories.mockReturnValue({
      where: mockWhere,
      limit: mockLimit,
      get: mockGet,
      doc: mockDoc2.mockReturnValue({ update: mockUpdate, get: mockGet2 }),
    } as any);

    const req = new NextRequest("http://localhost/api/categories/electronics", {
      method: "PATCH",
      body: JSON.stringify({ name: "Updated Electronics" }),
    });

    const response = await PATCH(req, {
      params: Promise.resolve({ slug: "electronics" }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(mockUpdate).toHaveBeenCalled();
  });

  it("should reject duplicate slug", async () => {
    mockRequireRole.mockResolvedValue({
      user: { uid: "admin", email: "admin@test.com", role: "admin" },
    } as any);

    const mockDoc = {
      id: "cat1",
      data: () => ({ name: "Electronics", slug: "electronics" }),
    };

    const mockWhere = jest.fn().mockImplementation((field, op, value) => {
      return {
        limit: jest.fn().mockReturnThis(),
        get: jest.fn().mockResolvedValue({
          empty: value === "smartphones" ? false : false,
          docs: value === "smartphones" ? [{ id: "cat2" }] : [mockDoc],
        }),
      };
    });

    mockCollections.categories.mockReturnValue({
      where: mockWhere,
    } as any);

    const req = new NextRequest("http://localhost/api/categories/electronics", {
      method: "PATCH",
      body: JSON.stringify({ slug: "smartphones" }),
    });

    const response = await PATCH(req, {
      params: Promise.resolve({ slug: "electronics" }),
    });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Slug already in use");
  });

  it("should update parent_ids and cascade to parents", async () => {
    mockRequireRole.mockResolvedValue({
      user: { uid: "admin", email: "admin@test.com", role: "admin" },
    } as any);

    const mockCategoryDoc = {
      id: "cat1",
      data: () => ({
        name: "Smartphones",
        slug: "smartphones",
        parent_ids: ["oldParent1"],
      }),
    };

    const mockParentDoc = {
      exists: true,
      data: () => ({ children_ids: ["cat1", "cat2"] }),
    };

    const mockNewParentDoc = {
      exists: true,
      data: () => ({ children_ids: ["cat3"] }),
    };

    const mockWhere = jest.fn().mockReturnThis();
    const mockLimit = jest.fn().mockReturnThis();
    const mockGet = jest
      .fn()
      .mockResolvedValue({ empty: false, docs: [mockCategoryDoc] });

    const mockDocRef = jest.fn();
    const mockParentRef = jest.fn();
    const mockUpdate = jest.fn().mockResolvedValue(undefined);
    const mockGetDoc = jest.fn().mockImplementation((id) => {
      if (id === "oldParent1") return Promise.resolve(mockParentDoc);
      if (id === "newParent1") return Promise.resolve(mockNewParentDoc);
      return Promise.resolve({
        id: "cat1",
        data: () => ({
          name: "Smartphones",
          parent_ids: ["newParent1"],
          updated_at: "2024-01-03T00:00:00Z",
        }),
      });
    });

    mockCollections.categories.mockReturnValue({
      where: mockWhere,
      limit: mockLimit,
      get: mockGet,
      doc: mockDocRef.mockImplementation((id) => ({
        update: mockUpdate,
        get: mockGetDoc.bind(null, id),
      })),
    } as any);

    const req = new NextRequest("http://localhost/api/categories/smartphones", {
      method: "PATCH",
      body: JSON.stringify({ parent_ids: ["newParent1"] }),
    });

    const response = await PATCH(req, {
      params: Promise.resolve({ slug: "smartphones" }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(mockUpdate).toHaveBeenCalledTimes(3); // oldParent, newParent, category itself
  });
});

describe("DELETE /api/categories/[slug]", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should reject non-admin users", async () => {
    mockRequireRole.mockResolvedValue({
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    } as any);

    const req = new NextRequest("http://localhost/api/categories/electronics", {
      method: "DELETE",
    });

    const response = await DELETE(req, {
      params: Promise.resolve({ slug: "electronics" }),
    });

    expect(response.status).toBe(403);
  });

  it("should prevent deletion of category with children", async () => {
    mockRequireRole.mockResolvedValue({
      user: { uid: "admin", email: "admin@test.com", role: "admin" },
    } as any);

    const mockDoc = {
      id: "cat1",
      data: () => ({
        name: "Electronics",
        slug: "electronics",
        children_ids: ["child1", "child2"],
      }),
    };

    const mockWhere = jest.fn().mockReturnThis();
    const mockLimit = jest.fn().mockReturnThis();
    const mockGet = jest.fn().mockResolvedValue({
      empty: false,
      docs: [mockDoc],
    });

    mockCollections.categories.mockReturnValue({
      where: mockWhere,
      limit: mockLimit,
      get: mockGet,
    } as any);

    const req = new NextRequest("http://localhost/api/categories/electronics", {
      method: "DELETE",
    });

    const response = await DELETE(req, {
      params: Promise.resolve({ slug: "electronics" }),
    });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Cannot delete category with children");
  });

  it("should delete category and cascade to parents", async () => {
    mockRequireRole.mockResolvedValue({
      user: { uid: "admin", email: "admin@test.com", role: "admin" },
    } as any);

    const mockDoc = {
      id: "cat1",
      data: () => ({
        name: "Smartphones",
        slug: "smartphones",
        children_ids: [],
        parent_ids: ["parent1"],
      }),
    };

    const mockParentDoc = {
      exists: true,
      data: () => ({ children_ids: ["cat1", "cat2"] }),
    };

    const mockWhere = jest.fn().mockReturnThis();
    const mockLimit = jest.fn().mockReturnThis();
    const mockGet = jest.fn().mockResolvedValue({
      empty: false,
      docs: [mockDoc],
    });

    const mockDocRef = jest.fn();
    const mockDelete = jest.fn().mockResolvedValue(undefined);
    const mockUpdate = jest.fn().mockResolvedValue(undefined);
    const mockGetDoc = jest.fn().mockResolvedValue(mockParentDoc);

    mockCollections.categories.mockReturnValue({
      where: mockWhere,
      limit: mockLimit,
      get: mockGet,
      doc: mockDocRef.mockReturnValue({
        delete: mockDelete,
        update: mockUpdate,
        get: mockGetDoc,
      }),
    } as any);

    const req = new NextRequest("http://localhost/api/categories/smartphones", {
      method: "DELETE",
    });

    const response = await DELETE(req, {
      params: Promise.resolve({ slug: "smartphones" }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(mockDelete).toHaveBeenCalled();
    expect(mockUpdate).toHaveBeenCalled(); // Parent update
  });

  it("should return 404 for non-existent category", async () => {
    mockRequireRole.mockResolvedValue({
      user: { uid: "admin", email: "admin@test.com", role: "admin" },
    } as any);

    const mockWhere = jest.fn().mockReturnThis();
    const mockLimit = jest.fn().mockReturnThis();
    const mockGet = jest.fn().mockResolvedValue({ empty: true });

    mockCollections.categories.mockReturnValue({
      where: mockWhere,
      limit: mockLimit,
      get: mockGet,
    } as any);

    const req = new NextRequest("http://localhost/api/categories/nonexistent", {
      method: "DELETE",
    });

    const response = await DELETE(req, {
      params: Promise.resolve({ slug: "nonexistent" }),
    });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.success).toBe(false);
  });
});
