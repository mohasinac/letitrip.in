/**
 * @jest-environment node
 */
import { NextRequest } from "next/server";
import { GET } from "./route";
import { Collections } from "@/app/api/lib/firebase/collections";

jest.mock("@/app/api/lib/firebase/collections");

const mockCollections = Collections as jest.Mocked<typeof Collections>;

describe("GET /api/categories/leaves", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return only leaf categories (no children)", async () => {
    const mockCategories = [
      {
        id: "cat1",
        data: () => ({ name: "Electronics", parent_id: null }),
      },
      {
        id: "cat2",
        data: () => ({ name: "Phones", parent_id: "cat1" }),
      },
      {
        id: "cat3",
        data: () => ({ name: "Smartphones", parent_id: "cat2" }),
      },
      {
        id: "cat4",
        data: () => ({ name: "Accessories", parent_id: "cat2" }),
      },
    ];

    const mockLimit = jest.fn().mockReturnThis();
    const mockGet = jest.fn().mockResolvedValue({ docs: mockCategories });

    mockCollections.categories.mockReturnValue({
      limit: mockLimit,
      get: mockGet,
    } as any);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toHaveLength(2); // Smartphones and Accessories
    expect(data.data.map((c: any) => c.name).sort()).toEqual([
      "Accessories",
      "Smartphones",
    ]);
  });

  it("should return all categories if none have children", async () => {
    const mockCategories = [
      { id: "cat1", data: () => ({ name: "Cat1", parent_id: null }) },
      { id: "cat2", data: () => ({ name: "Cat2", parent_id: null }) },
      { id: "cat3", data: () => ({ name: "Cat3", parent_id: null }) },
    ];

    const mockLimit = jest.fn().mockReturnThis();
    const mockGet = jest.fn().mockResolvedValue({ docs: mockCategories });

    mockCollections.categories.mockReturnValue({
      limit: mockLimit,
      get: mockGet,
    } as any);

    const response = await GET();
    const data = await response.json();

    expect(data.data).toHaveLength(3);
  });

  it("should return empty array if no categories exist", async () => {
    const mockLimit = jest.fn().mockReturnThis();
    const mockGet = jest.fn().mockResolvedValue({ docs: [] });

    mockCollections.categories.mockReturnValue({
      limit: mockLimit,
      get: mockGet,
    } as any);

    const response = await GET();
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

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBe("Failed to fetch leaf categories");
  });
});
