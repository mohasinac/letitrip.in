/**
 * @jest-environment node
 */
import { NextRequest } from "next/server";
import { GET } from "./route";
import { Collections } from "@/app/api/lib/firebase/collections";
import { getCurrentUser } from "../../lib/session";

jest.mock("@/app/api/lib/firebase/collections");

// Mock session before importing route
jest.mock("../../lib/session", () => ({
  getCurrentUser: jest.fn(),
}));

const mockCollections = Collections as jest.Mocked<typeof Collections>;
const mockGetCurrentUser = getCurrentUser as jest.MockedFunction<
  typeof getCurrentUser
>;

describe("GET /api/categories/validate-slug", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should reject non-admin users", async () => {
    mockGetCurrentUser.mockResolvedValue({
      email: "user@test.com",
      role: "user",
    } as any);

    const req = new NextRequest(
      "http://localhost/api/categories/validate-slug?slug=test"
    );
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toBe("Admin access required");
  });

  it("should reject unauthenticated users", async () => {
    mockGetCurrentUser.mockResolvedValue(null);

    const req = new NextRequest(
      "http://localhost/api/categories/validate-slug?slug=test"
    );
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(403);
  });

  it("should require slug parameter", async () => {
    mockGetCurrentUser.mockResolvedValue({
      email: "admin@test.com",
      role: "admin",
    } as any);

    const req = new NextRequest(
      "http://localhost/api/categories/validate-slug"
    );
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Slug parameter is required");
  });

  it("should return available true for unique slug", async () => {
    mockGetCurrentUser.mockResolvedValue({
      email: "admin@test.com",
      role: "admin",
    } as any);

    const mockWhere = jest.fn().mockReturnThis();
    const mockGet = jest.fn().mockResolvedValue({ docs: [] });

    mockCollections.categories.mockReturnValue({
      where: mockWhere,
      get: mockGet,
    } as any);

    const req = new NextRequest(
      "http://localhost/api/categories/validate-slug?slug=new-category"
    );
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.available).toBe(true);
    expect(data.slug).toBe("new-category");
  });

  it("should return available false for existing slug", async () => {
    mockGetCurrentUser.mockResolvedValue({
      email: "admin@test.com",
      role: "admin",
    } as any);

    const mockDoc = { id: "cat1" };
    const mockWhere = jest.fn().mockReturnThis();
    const mockGet = jest.fn().mockResolvedValue({ docs: [mockDoc] });

    mockCollections.categories.mockReturnValue({
      where: mockWhere,
      get: mockGet,
    } as any);

    const req = new NextRequest(
      "http://localhost/api/categories/validate-slug?slug=electronics"
    );
    const response = await GET(req);
    const data = await response.json();

    expect(data.available).toBe(false);
    expect(data.slug).toBe("electronics");
  });

  it("should exclude current category in edit mode", async () => {
    mockGetCurrentUser.mockResolvedValue({
      email: "admin@test.com",
      role: "admin",
    } as any);

    const mockDoc1 = { id: "cat1" }; // Current category being edited
    const mockWhere = jest.fn().mockReturnThis();
    const mockGet = jest.fn().mockResolvedValue({ docs: [mockDoc1] });

    mockCollections.categories.mockReturnValue({
      where: mockWhere,
      get: mockGet,
    } as any);

    const req = new NextRequest(
      "http://localhost/api/categories/validate-slug?slug=electronics&exclude_id=cat1"
    );
    const response = await GET(req);
    const data = await response.json();

    expect(data.available).toBe(true); // Available because we excluded the current category
  });

  it("should detect conflict when another category has the slug", async () => {
    mockGetCurrentUser.mockResolvedValue({
      email: "admin@test.com",
      role: "admin",
    } as any);

    const mockDoc1 = { id: "cat1" }; // Current category
    const mockDoc2 = { id: "cat2" }; // Another category with same slug
    const mockWhere = jest.fn().mockReturnThis();
    const mockGet = jest
      .fn()
      .mockResolvedValue({ docs: [mockDoc1, mockDoc2] });

    mockCollections.categories.mockReturnValue({
      where: mockWhere,
      get: mockGet,
    } as any);

    const req = new NextRequest(
      "http://localhost/api/categories/validate-slug?slug=electronics&exclude_id=cat1"
    );
    const response = await GET(req);
    const data = await response.json();

    expect(data.available).toBe(false); // Not available because cat2 also has this slug
  });

  it("should handle database errors", async () => {
    mockGetCurrentUser.mockResolvedValue({
      email: "admin@test.com",
      role: "admin",
    } as any);

    const mockWhere = jest.fn().mockReturnThis();
    const mockGet = jest.fn().mockRejectedValue(new Error("DB error"));

    mockCollections.categories.mockReturnValue({
      where: mockWhere,
      get: mockGet,
    } as any);

    const req = new NextRequest(
      "http://localhost/api/categories/validate-slug?slug=test"
    );
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Failed to validate slug");
  });
});
