/**
 * @jest-environment node
 */
import { GET } from "./route";
import { Collections } from "@/app/api/lib/firebase/collections";

jest.mock("@/app/api/lib/firebase/collections");

const mockCollections = Collections as jest.Mocked<typeof Collections>;

describe("GET /api/categories/homepage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return featured categories sorted by sort_order", async () => {
    const mockCategories = [
      {
        id: "cat3",
        data: () => ({
          name: "Category C",
          sort_order: 3,
          is_featured: true,
        }),
      },
      {
        id: "cat1",
        data: () => ({
          name: "Category A",
          sort_order: 1,
          is_featured: true,
        }),
      },
      {
        id: "cat2",
        data: () => ({
          name: "Category B",
          sort_order: 2,
          is_featured: true,
        }),
      },
    ];

    const mockWhere = jest.fn().mockReturnThis();
    const mockOrderBy = jest.fn().mockReturnThis();
    const mockLimit = jest.fn().mockReturnThis();
    const mockGet = jest.fn().mockResolvedValue({ docs: mockCategories });

    mockCollections.categories.mockReturnValue({
      where: mockWhere,
      orderBy: mockOrderBy,
      limit: mockLimit,
      get: mockGet,
    } as any);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toHaveLength(3);
    expect(mockWhere).toHaveBeenCalledWith("is_featured", "==", true);
    expect(mockOrderBy).toHaveBeenCalledWith("sort_order", "asc");
    expect(mockLimit).toHaveBeenCalledWith(100);
  });

  it("should return empty array when no featured categories", async () => {
    const mockWhere = jest.fn().mockReturnThis();
    const mockOrderBy = jest.fn().mockReturnThis();
    const mockLimit = jest.fn().mockReturnThis();
    const mockGet = jest.fn().mockResolvedValue({ docs: [] });

    mockCollections.categories.mockReturnValue({
      where: mockWhere,
      orderBy: mockOrderBy,
      limit: mockLimit,
      get: mockGet,
    } as any);

    const response = await GET();
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.data).toEqual([]);
  });

  it("should include camelCase aliases for field names", async () => {
    const mockCategories = [
      {
        id: "cat1",
        data: () => ({
          name: "Electronics",
          parent_id: "parent1",
          is_featured: true,
          show_on_homepage: true,
          is_active: true,
          product_count: 10,
          child_count: 2,
          has_children: true,
          sort_order: 1,
          meta_title: "Meta",
          commission_rate: 5,
          created_at: new Date("2024-01-01"),
          updated_at: new Date("2024-01-02"),
        }),
      },
    ];

    const mockWhere = jest.fn().mockReturnThis();
    const mockOrderBy = jest.fn().mockReturnThis();
    const mockLimit = jest.fn().mockReturnThis();
    const mockGet = jest.fn().mockResolvedValue({ docs: mockCategories });

    mockCollections.categories.mockReturnValue({
      where: mockWhere,
      orderBy: mockOrderBy,
      limit: mockLimit,
      get: mockGet,
    } as any);

    const response = await GET();
    const data = await response.json();

    expect(data.data[0]).toMatchObject({
      parentId: "parent1",
      featured: true,
      showOnHomepage: true,
      isActive: true,
      productCount: 10,
      childCount: 2,
      hasChildren: true,
      sortOrder: 1,
      metaTitle: "Meta",
      commissionRate: 5,
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });
  });

  it("should handle database errors", async () => {
    const mockWhere = jest.fn().mockReturnThis();
    const mockOrderBy = jest.fn().mockReturnThis();
    const mockLimit = jest.fn().mockReturnThis();
    const mockGet = jest.fn().mockRejectedValue(new Error("DB error"));

    mockCollections.categories.mockReturnValue({
      where: mockWhere,
      orderBy: mockOrderBy,
      limit: mockLimit,
      get: mockGet,
    } as any);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBe("Failed to load homepage categories");
  });
});
