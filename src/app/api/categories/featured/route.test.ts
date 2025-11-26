/**
 * @jest-environment node
 */
import { NextRequest, NextResponse } from "next/server";
import { GET as getFeatured } from "./route";
import { Collections } from "@/app/api/lib/firebase/collections";

jest.mock("@/app/api/lib/firebase/collections");

const mockCollections = Collections as jest.Mocked<typeof Collections>;

describe("GET /api/categories/featured", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return featured categories", async () => {
    const mockCategories = [
      {
        id: "cat1",
        data: () => ({
          name: "Electronics",
          slug: "electronics",
          is_featured: true,
          is_active: true,
          product_count: 100,
        }),
      },
      {
        id: "cat2",
        data: () => ({
          name: "Fashion",
          slug: "fashion",
          is_featured: true,
          is_active: true,
          product_count: 200,
        }),
      },
    ];

    const mockWhere = jest.fn().mockReturnThis();
    const mockLimit = jest.fn().mockReturnThis();
    const mockGet = jest.fn().mockResolvedValue({
      docs: mockCategories,
    });

    mockCollections.categories.mockReturnValue({
      where: mockWhere,
      limit: mockLimit,
      get: mockGet,
    } as any);

    const req = new NextRequest("http://localhost/api/categories/featured");
    const response = await getFeatured();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toHaveLength(2);
    expect(data.data[0].name).toBe("Electronics");
    expect(data.data[1].name).toBe("Fashion");
    expect(mockWhere).toHaveBeenCalledWith("is_featured", "==", true);
    expect(mockLimit).toHaveBeenCalledWith(100);
  });

  it("should return empty array if no featured categories", async () => {
    const mockWhere = jest.fn().mockReturnThis();
    const mockLimit = jest.fn().mockReturnThis();
    const mockGet = jest.fn().mockResolvedValue({ docs: [] });

    mockCollections.categories.mockReturnValue({
      where: mockWhere,
      limit: mockLimit,
      get: mockGet,
    } as any);

    const response = await getFeatured();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toEqual([]);
  });

  it("should handle database errors", async () => {
    const mockWhere = jest.fn().mockReturnThis();
    const mockLimit = jest.fn().mockReturnThis();
    const mockGet = jest.fn().mockRejectedValue(new Error("DB error"));

    mockCollections.categories.mockReturnValue({
      where: mockWhere,
      limit: mockLimit,
      get: mockGet,
    } as any);

    const response = await getFeatured();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBe("Failed to load featured categories");
  });

  it("should include camelCase field aliases", async () => {
    const mockCategories = [
      {
        id: "cat1",
        data: () => ({
          name: "Test",
          parent_id: "parent1",
          is_featured: true,
          show_on_homepage: true,
          is_active: true,
          product_count: 50,
          child_count: 5,
          has_children: true,
          sort_order: 10,
          meta_title: "Meta",
          commission_rate: 5.5,
          created_at: "2024-01-01",
          updated_at: "2024-01-02",
        }),
      },
    ];

    const mockWhere = jest.fn().mockReturnThis();
    const mockLimit = jest.fn().mockReturnThis();
    const mockGet = jest.fn().mockResolvedValue({ docs: mockCategories });

    mockCollections.categories.mockReturnValue({
      where: mockWhere,
      limit: mockLimit,
      get: mockGet,
    } as any);

    const response = await getFeatured();
    const data = await response.json();

    expect(data.data[0]).toMatchObject({
      parentId: "parent1",
      featured: true,
      showOnHomepage: true,
      isActive: true,
      productCount: 50,
      childCount: 5,
      hasChildren: true,
      sortOrder: 10,
      metaTitle: "Meta",
      commissionRate: 5.5,
      createdAt: "2024-01-01",
      updatedAt: "2024-01-02",
    });
  });
});
