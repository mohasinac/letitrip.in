/**
 * @jest-environment node
 */
import { NextRequest } from "next/server";
import { GET } from "./route";
import { Collections } from "@/app/api/lib/firebase/collections";

jest.mock("@/app/api/lib/firebase/collections");
jest.mock("@/app/api/middleware/cache", () => ({
  withCache: jest.fn((req, handler) => handler(req)),
}));

const mockCollections = Collections as jest.Mocked<typeof Collections>;

describe("GET /api/categories/tree", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should build category tree with parent-child relationships", async () => {
    const mockCategories = [
      {
        id: "cat1",
        data: () => ({
          name: "Electronics",
          slug: "electronics",
          parent_id: null,
          is_active: true,
        }),
      },
      {
        id: "cat2",
        data: () => ({
          name: "Phones",
          slug: "phones",
          parent_id: "cat1",
          is_active: true,
        }),
      },
      {
        id: "cat3",
        data: () => ({
          name: "Smartphones",
          slug: "smartphones",
          parent_id: "cat2",
          is_active: true,
        }),
      },
    ];

    const mockLimit = jest.fn().mockReturnThis();
    const mockGet = jest.fn().mockResolvedValue({ docs: mockCategories });

    mockCollections.categories.mockReturnValue({
      limit: mockLimit,
      get: mockGet,
    } as any);

    const req = new NextRequest("http://localhost/api/categories/tree");
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toHaveLength(1); // Only root
    expect(data.data[0].name).toBe("Electronics");
    expect(data.data[0].children).toHaveLength(1);
    expect(data.data[0].children[0].name).toBe("Phones");
    expect(data.data[0].children[0].children).toHaveLength(1);
    expect(data.data[0].children[0].children[0].name).toBe("Smartphones");
  });

  it("should handle multiple root categories", async () => {
    const mockCategories = [
      { id: "cat1", data: () => ({ name: "Electronics", parent_id: null }) },
      { id: "cat2", data: () => ({ name: "Fashion", parent_id: null }) },
      { id: "cat3", data: () => ({ name: "Home", parent_id: null }) },
    ];

    const mockLimit = jest.fn().mockReturnThis();
    const mockGet = jest.fn().mockResolvedValue({ docs: mockCategories });

    mockCollections.categories.mockReturnValue({
      limit: mockLimit,
      get: mockGet,
    } as any);

    const req = new NextRequest("http://localhost/api/categories/tree");
    const response = await GET(req);
    const data = await response.json();

    expect(data.data).toHaveLength(3);
    expect(data.data.map((c: any) => c.name)).toEqual([
      "Electronics",
      "Fashion",
      "Home",
    ]);
  });

  it("should handle orphaned categories (missing parent)", async () => {
    const mockCategories = [
      { id: "cat1", data: () => ({ name: "Electronics", parent_id: null }) },
      {
        id: "cat2",
        data: () => ({ name: "Orphan", parent_id: "nonexistent" }),
      },
    ];

    const mockLimit = jest.fn().mockReturnThis();
    const mockGet = jest.fn().mockResolvedValue({ docs: mockCategories });

    mockCollections.categories.mockReturnValue({
      limit: mockLimit,
      get: mockGet,
    } as any);

    const req = new NextRequest("http://localhost/api/categories/tree");
    const response = await GET(req);
    const data = await response.json();

    expect(data.data).toHaveLength(2); // Both become roots
    expect(data.data.map((c: any) => c.name)).toContain("Orphan");
  });

  it("should return empty array for no categories", async () => {
    const mockLimit = jest.fn().mockReturnThis();
    const mockGet = jest.fn().mockResolvedValue({ docs: [] });

    mockCollections.categories.mockReturnValue({
      limit: mockLimit,
      get: mockGet,
    } as any);

    const req = new NextRequest("http://localhost/api/categories/tree");
    const response = await GET(req);
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.data).toEqual([]);
  });

  it("should handle database errors", async () => {
    const mockLimit = jest.fn().mockReturnThis();
    const mockGet = jest.fn().mockRejectedValue(new Error("DB error"));

    mockCollections.categories.mockReturnValue({
      limit: mockLimit,
      get: mockGet,
    } as any);

    const req = new NextRequest("http://localhost/api/categories/tree");
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBe("Failed to load category tree");
  });
});
