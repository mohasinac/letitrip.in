/**
 * @jest-environment node
 */
import { NextRequest, NextResponse } from "next/server";
import { POST, DELETE, GET } from "./route";

// Mock Collections before importing
jest.mock("@/app/api/lib/firebase/collections", () => ({
  Collections: {
    favorites: jest.fn(),
  },
}));

// Mock session
jest.mock("@/app/api/lib/session", () => ({
  getCurrentUser: jest.fn(),
}));

import { Collections } from "@/app/api/lib/firebase/collections";
import * as session from "@/app/api/lib/session";

const mockGetCurrentUser = session.getCurrentUser as jest.Mock;

describe("POST /api/favorites/[type]/[id]", () => {
  const mockFavorites = {
    doc: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (Collections.favorites as jest.Mock).mockReturnValue(mockFavorites);
  });

  it("should require authentication", async () => {
    mockGetCurrentUser.mockResolvedValue(null);

    const request = new NextRequest(
      "http://localhost/api/favorites/product/prod123",
      {
        method: "POST",
      },
    );
    const response = await POST(request, {
      params: Promise.resolve({ type: "product", id: "prod123" }),
    });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });

  it("should require valid type", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "user123" });

    const request = new NextRequest(
      "http://localhost/api/favorites/invalid/item123",
      {
        method: "POST",
      },
    );
    const response = await POST(request, {
      params: Promise.resolve({ type: "invalid", id: "item123" }),
    });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Invalid type");
  });

  it("should add product to favorites", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "user123" });

    const mockGet = jest.fn().mockResolvedValue({ exists: false });
    const mockSet = jest.fn().mockResolvedValue(undefined);

    mockFavorites.doc.mockReturnValue({
      get: mockGet,
      set: mockSet,
    });

    const request = new NextRequest(
      "http://localhost/api/favorites/product/prod123",
      {
        method: "POST",
      },
    );
    const response = await POST(request, {
      params: Promise.resolve({ type: "product", id: "prod123" }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(mockSet).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: "user123",
        item_id: "prod123",
        item_type: "product",
      }),
    );
  });

  it("should prevent duplicate favorites", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "user123" });

    const mockGet = jest.fn().mockResolvedValue({ exists: true });

    mockFavorites.doc.mockReturnValue({
      get: mockGet,
    });

    const request = new NextRequest(
      "http://localhost/api/favorites/product/prod123",
      {
        method: "POST",
      },
    );
    const response = await POST(request, {
      params: Promise.resolve({ type: "product", id: "prod123" }),
    });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Already in favorites");
  });

  it("should support shop type", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "user123" });

    const mockGet = jest.fn().mockResolvedValue({ exists: false });
    const mockSet = jest.fn().mockResolvedValue(undefined);

    mockFavorites.doc.mockReturnValue({
      get: mockGet,
      set: mockSet,
    });

    const request = new NextRequest(
      "http://localhost/api/favorites/shop/shop123",
      {
        method: "POST",
      },
    );
    await POST(request, {
      params: Promise.resolve({ type: "shop", id: "shop123" }),
    });

    expect(mockSet).toHaveBeenCalledWith(
      expect.objectContaining({
        item_type: "shop",
        item_id: "shop123",
      }),
    );
  });

  it("should support auction type", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "user123" });

    const mockGet = jest.fn().mockResolvedValue({ exists: false });
    const mockSet = jest.fn().mockResolvedValue(undefined);

    mockFavorites.doc.mockReturnValue({
      get: mockGet,
      set: mockSet,
    });

    const request = new NextRequest(
      "http://localhost/api/favorites/auction/auc123",
      {
        method: "POST",
      },
    );
    await POST(request, {
      params: Promise.resolve({ type: "auction", id: "auc123" }),
    });

    expect(mockSet).toHaveBeenCalledWith(
      expect.objectContaining({
        item_type: "auction",
      }),
    );
  });

  it("should handle database errors", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "user123" });

    mockFavorites.doc.mockImplementation(() => {
      throw new Error("Database error");
    });

    const request = new NextRequest(
      "http://localhost/api/favorites/product/prod123",
      {
        method: "POST",
      },
    );
    const response = await POST(request, {
      params: Promise.resolve({ type: "product", id: "prod123" }),
    });
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Failed to add to favorites");
  });
});

describe("DELETE /api/favorites/[type]/[id]", () => {
  const mockFavorites = {
    doc: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (Collections.favorites as jest.Mock).mockReturnValue(mockFavorites);
  });

  it("should require authentication", async () => {
    mockGetCurrentUser.mockResolvedValue(null);

    const request = new NextRequest(
      "http://localhost/api/favorites/product/prod123",
      {
        method: "DELETE",
      },
    );
    const response = await DELETE(request, {
      params: Promise.resolve({ type: "product", id: "prod123" }),
    });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });

  it("should require valid type", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "user123" });

    const request = new NextRequest(
      "http://localhost/api/favorites/invalid/item123",
      {
        method: "DELETE",
      },
    );
    const response = await DELETE(request, {
      params: Promise.resolve({ type: "invalid", id: "item123" }),
    });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Invalid type");
  });

  it("should remove favorite", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "user123" });

    const mockGet = jest.fn().mockResolvedValue({ exists: true });
    const mockDelete = jest.fn().mockResolvedValue(undefined);

    mockFavorites.doc.mockReturnValue({
      get: mockGet,
      delete: mockDelete,
    });

    const request = new NextRequest(
      "http://localhost/api/favorites/product/prod123",
      {
        method: "DELETE",
      },
    );
    const response = await DELETE(request, {
      params: Promise.resolve({ type: "product", id: "prod123" }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(mockDelete).toHaveBeenCalled();
  });

  it("should return 404 if not in favorites", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "user123" });

    const mockGet = jest.fn().mockResolvedValue({ exists: false });

    mockFavorites.doc.mockReturnValue({
      get: mockGet,
    });

    const request = new NextRequest(
      "http://localhost/api/favorites/product/prod123",
      {
        method: "DELETE",
      },
    );
    const response = await DELETE(request, {
      params: Promise.resolve({ type: "product", id: "prod123" }),
    });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe("Not in favorites");
  });
});

describe("GET /api/favorites/[type]/[id]", () => {
  const mockFavorites = {
    doc: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (Collections.favorites as jest.Mock).mockReturnValue(mockFavorites);
  });

  it("should return false when not authenticated", async () => {
    mockGetCurrentUser.mockResolvedValue(null);

    const request = new NextRequest(
      "http://localhost/api/favorites/product/prod123",
    );
    const response = await GET(request, {
      params: Promise.resolve({ type: "product", id: "prod123" }),
    });
    const data = await response.json();

    expect(data.isFavorite).toBe(false);
  });

  it("should return false for invalid type", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "user123" });

    const request = new NextRequest(
      "http://localhost/api/favorites/invalid/item123",
    );
    const response = await GET(request, {
      params: Promise.resolve({ type: "invalid", id: "item123" }),
    });
    const data = await response.json();

    expect(response.status).toBe(400);
  });

  it("should check if item is favorited", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "user123" });

    const mockGet = jest.fn().mockResolvedValue({ exists: true });

    mockFavorites.doc.mockReturnValue({
      get: mockGet,
    });

    const request = new NextRequest(
      "http://localhost/api/favorites/product/prod123",
    );
    const response = await GET(request, {
      params: Promise.resolve({ type: "product", id: "prod123" }),
    });
    const data = await response.json();

    expect(data.isFavorite).toBe(true);
  });

  it("should return false if not favorited", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "user123" });

    const mockGet = jest.fn().mockResolvedValue({ exists: false });

    mockFavorites.doc.mockReturnValue({
      get: mockGet,
    });

    const request = new NextRequest(
      "http://localhost/api/favorites/product/prod123",
    );
    const response = await GET(request, {
      params: Promise.resolve({ type: "product", id: "prod123" }),
    });
    const data = await response.json();

    expect(data.isFavorite).toBe(false);
  });
});
