/**
 * @jest-environment node
 */
import { NextRequest } from "next/server";
import { GET } from "./route";
import { Collections } from "@/app/api/lib/firebase/collections";

jest.mock("@/app/api/lib/firebase/collections");

const mockCollections = Collections as jest.Mocked<typeof Collections>;

describe("GET /api/categories/search", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should search categories by name", async () => {
    const mockCategories = [
      {
        id: "cat1",
        data: () => ({ name: "Smartphones", description: "Mobile devices" }),
      },
      {
        id: "cat2",
        data: () => ({ name: "Smart Home", description: "Home automation" }),
      },
      {
        id: "cat3",
        data: () => ({ name: "Tablets", description: "Large screen devices" }),
      },
    ];

    const mockLimit = jest.fn().mockReturnThis();
    const mockGet = jest.fn().mockResolvedValue({ docs: mockCategories });

    mockCollections.categories.mockReturnValue({
      limit: mockLimit,
      get: mockGet,
    } as any);

    const req = new NextRequest(
      "http://localhost/api/categories/search?q=smart",
    );
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toHaveLength(2);
    expect(data.data.map((c: any) => c.name).sort()).toEqual([
      "Smart Home",
      "Smartphones",
    ]);
  });

  it("should search categories by description", async () => {
    const mockCategories = [
      {
        id: "cat1",
        data: () => ({
          name: "Electronics",
          description: "All electronic devices",
        }),
      },
      {
        id: "cat2",
        data: () => ({ name: "Fashion", description: "Clothing and devices" }),
      },
    ];

    const mockLimit = jest.fn().mockReturnThis();
    const mockGet = jest.fn().mockResolvedValue({ docs: mockCategories });

    mockCollections.categories.mockReturnValue({
      limit: mockLimit,
      get: mockGet,
    } as any);

    const req = new NextRequest(
      "http://localhost/api/categories/search?q=devices",
    );
    const response = await GET(req);
    const data = await response.json();

    expect(data.data).toHaveLength(2);
  });

  it("should be case-insensitive", async () => {
    const mockCategories = [
      { id: "cat1", data: () => ({ name: "ELECTRONICS", description: "" }) },
    ];

    const mockLimit = jest.fn().mockReturnThis();
    const mockGet = jest.fn().mockResolvedValue({ docs: mockCategories });

    mockCollections.categories.mockReturnValue({
      limit: mockLimit,
      get: mockGet,
    } as any);

    const req = new NextRequest(
      "http://localhost/api/categories/search?q=electronics",
    );
    const response = await GET(req);
    const data = await response.json();

    expect(data.data).toHaveLength(1);
    expect(data.data[0].name).toBe("ELECTRONICS");
  });

  it("should return empty array for no query", async () => {
    const req = new NextRequest("http://localhost/api/categories/search");
    const response = await GET(req);
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.data).toEqual([]);
  });

  it("should return empty array for no matches", async () => {
    const mockCategories = [
      { id: "cat1", data: () => ({ name: "Electronics", description: "" }) },
    ];

    const mockLimit = jest.fn().mockReturnThis();
    const mockGet = jest.fn().mockResolvedValue({ docs: mockCategories });

    mockCollections.categories.mockReturnValue({
      limit: mockLimit,
      get: mockGet,
    } as any);

    const req = new NextRequest(
      "http://localhost/api/categories/search?q=nonexistent",
    );
    const response = await GET(req);
    const data = await response.json();

    expect(data.data).toEqual([]);
  });

  it("should limit results to 50", async () => {
    const mockCategories = Array.from({ length: 100 }, (_, i) => ({
      id: `cat${i}`,
      data: () => ({ name: `Category ${i}`, description: "" }),
    }));

    const mockLimit = jest.fn().mockReturnThis();
    const mockGet = jest.fn().mockResolvedValue({ docs: mockCategories });

    mockCollections.categories.mockReturnValue({
      limit: mockLimit,
      get: mockGet,
    } as any);

    const req = new NextRequest(
      "http://localhost/api/categories/search?q=Category",
    );
    const response = await GET(req);
    const data = await response.json();

    expect(data.data.length).toBeLessThanOrEqual(50);
  });

  it("should handle database errors", async () => {
    const mockLimit = jest.fn().mockReturnThis();
    const mockGet = jest.fn().mockRejectedValue(new Error("DB error"));

    mockCollections.categories.mockReturnValue({
      limit: mockLimit,
      get: mockGet,
    } as any);

    const req = new NextRequest(
      "http://localhost/api/categories/search?q=test",
    );
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBe("Search failed");
  });
});
