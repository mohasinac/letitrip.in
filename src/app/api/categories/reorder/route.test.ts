/**
 * @jest-environment node
 */
import { NextRequest } from "next/server";
import { POST } from "./route";
import { Collections } from "@/app/api/lib/firebase/collections";
import { getCurrentUser } from "../../lib/session";
import { createBatch } from "@/app/api/lib/firebase/transactions";

jest.mock("@/app/api/lib/firebase/collections");
jest.mock("@/app/api/lib/firebase/transactions");

// Mock session before importing route
jest.mock("../../lib/session", () => ({
  getCurrentUser: jest.fn(),
}));

const mockCollections = Collections as jest.Mocked<typeof Collections>;
const mockGetCurrentUser = getCurrentUser as jest.MockedFunction<
  typeof getCurrentUser
>;
const mockCreateBatch = createBatch as jest.MockedFunction<typeof createBatch>;

describe("POST /api/categories/reorder", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should reject non-admin users", async () => {
    mockGetCurrentUser.mockResolvedValue({
      email: "user@test.com",
      role: "user",
    } as any);

    const req = new NextRequest("http://localhost/api/categories/reorder", {
      method: "POST",
      body: JSON.stringify({ orders: [{ id: "cat1", sortOrder: 1 }] }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toBe("Forbidden");
  });

  it("should reject unauthenticated users", async () => {
    mockGetCurrentUser.mockResolvedValue(null);

    const req = new NextRequest("http://localhost/api/categories/reorder", {
      method: "POST",
      body: JSON.stringify({ orders: [{ id: "cat1", sortOrder: 1 }] }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(403);
  });

  it("should require orders array", async () => {
    mockGetCurrentUser.mockResolvedValue({
      email: "admin@test.com",
      role: "admin",
    } as any);

    const req = new NextRequest("http://localhost/api/categories/reorder", {
      method: "POST",
      body: JSON.stringify({}),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("No orders provided");
  });

  it("should reject empty orders array", async () => {
    mockGetCurrentUser.mockResolvedValue({
      email: "admin@test.com",
      role: "admin",
    } as any);

    const req = new NextRequest("http://localhost/api/categories/reorder", {
      method: "POST",
      body: JSON.stringify({ orders: [] }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
  });

  it("should reorder categories with batch update", async () => {
    mockGetCurrentUser.mockResolvedValue({
      email: "admin@test.com",
      role: "admin",
    } as any);

    const mockUpdate = jest.fn();
    const mockCommit = jest.fn().mockResolvedValue(undefined);
    const mockBatch = {
      update: mockUpdate,
      commit: mockCommit,
    };

    mockCreateBatch.mockReturnValue(mockBatch as any);

    const mockDoc = jest.fn().mockReturnValue({ id: "cat1" });
    mockCollections.categories.mockReturnValue({ doc: mockDoc } as any);

    const orders = [
      { id: "cat1", sortOrder: 3 },
      { id: "cat2", sortOrder: 1 },
      { id: "cat3", sortOrder: 2 },
    ];

    const req = new NextRequest("http://localhost/api/categories/reorder", {
      method: "POST",
      body: JSON.stringify({ orders }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(mockUpdate).toHaveBeenCalledTimes(3);
    expect(mockCommit).toHaveBeenCalled();
  });

  it("should update sort_order and updated_at fields", async () => {
    mockGetCurrentUser.mockResolvedValue({
      email: "admin@test.com",
      role: "admin",
    } as any);

    const mockUpdate = jest.fn();
    const mockCommit = jest.fn().mockResolvedValue(undefined);
    const mockBatch = {
      update: mockUpdate,
      commit: mockCommit,
    };

    mockCreateBatch.mockReturnValue(mockBatch as any);

    const mockDoc = jest.fn().mockReturnValue({ id: "cat1" });
    mockCollections.categories.mockReturnValue({ doc: mockDoc } as any);

    const req = new NextRequest("http://localhost/api/categories/reorder", {
      method: "POST",
      body: JSON.stringify({ orders: [{ id: "cat1", sortOrder: 5 }] }),
    });

    await POST(req);

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        sort_order: 5,
        updated_at: expect.any(String),
      })
    );
  });

  it("should handle database errors", async () => {
    mockGetCurrentUser.mockResolvedValue({
      email: "admin@test.com",
      role: "admin",
    } as any);

    mockCreateBatch.mockImplementation(() => {
      throw new Error("DB error");
    });

    const req = new NextRequest("http://localhost/api/categories/reorder", {
      method: "POST",
      body: JSON.stringify({ orders: [{ id: "cat1", sortOrder: 1 }] }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Failed to reorder categories");
  });
});
