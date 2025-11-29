/**
 * @jest-environment node
 */

jest.mock("@/app/api/lib/firebase/collections");
jest.mock("@/app/api/lib/session");
jest.mock("@/app/api/lib/firebase/queries");
jest.mock("@/app/api/lib/utils/pagination");
jest.mock("@/app/api/lib/firebase/config", () => ({
  adminAuth: {},
  adminDb: {},
  getFirestoreAdmin: jest.fn(),
}));

import { NextRequest } from "next/server";
import { GET, POST } from "./route";
import { Collections } from "@/app/api/lib/firebase/collections";
import { getCurrentUser } from "@/app/api/lib/session";
import { getReturnsQuery, UserRole } from "@/app/api/lib/firebase/queries";
import { executeCursorPaginatedQuery } from "@/app/api/lib/utils/pagination";

describe("GET /api/returns", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should require authentication", async () => {
    (getCurrentUser as jest.Mock).mockResolvedValue(null);
    (getReturnsQuery as jest.Mock).mockReturnValue({
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
    });
    (executeCursorPaginatedQuery as jest.Mock).mockResolvedValue({
      success: true,
      data: [],
    });

    const req = new NextRequest("http://localhost/api/returns");
    const res = await GET(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(getReturnsQuery).toHaveBeenCalledWith("user", undefined, undefined);
  });

  it("should filter by status", async () => {
    (getCurrentUser as jest.Mock).mockResolvedValue({
      id: "user1",
      role: "user",
    });

    const mockQuery = {
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
    };
    (getReturnsQuery as jest.Mock).mockReturnValue(mockQuery);
    (executeCursorPaginatedQuery as jest.Mock).mockResolvedValue({
      success: true,
      data: [],
    });

    const req = new NextRequest("http://localhost/api/returns?status=pending");
    const res = await GET(req);

    expect(mockQuery.where).toHaveBeenCalledWith("status", "==", "pending");
  });

  it("should filter by date range", async () => {
    (getCurrentUser as jest.Mock).mockResolvedValue({
      id: "user1",
      role: "user",
    });

    const mockQuery = {
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
    };
    (getReturnsQuery as jest.Mock).mockReturnValue(mockQuery);
    (executeCursorPaginatedQuery as jest.Mock).mockResolvedValue({
      success: true,
      data: [],
    });

    const req = new NextRequest(
      "http://localhost/api/returns?start_date=2025-01-01&end_date=2025-12-31",
    );
    const res = await GET(req);

    expect(mockQuery.where).toHaveBeenCalledWith(
      "created_at",
      ">=",
      "2025-01-01",
    );
    expect(mockQuery.where).toHaveBeenCalledWith(
      "created_at",
      "<=",
      "2025-12-31",
    );
  });

  it("should handle database errors", async () => {
    (getCurrentUser as jest.Mock).mockResolvedValue({ id: "user1" });
    (getReturnsQuery as jest.Mock).mockImplementation(() => {
      throw new Error("Database error");
    });

    const req = new NextRequest("http://localhost/api/returns");
    const res = await GET(req);
    const json = await res.json();

    expect(res.status).toBe(500);
    expect(json.error).toBe("Failed to load returns");
  });
});

describe("POST /api/returns", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should require authentication", async () => {
    (getCurrentUser as jest.Mock).mockResolvedValue(null);

    const req = new NextRequest("http://localhost/api/returns", {
      method: "POST",
      body: JSON.stringify({}),
    });
    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(401);
    expect(json.error).toBe("Unauthorized");
  });

  it("should require mandatory fields", async () => {
    (getCurrentUser as jest.Mock).mockResolvedValue({ id: "user1" });

    const req = new NextRequest("http://localhost/api/returns", {
      method: "POST",
      body: JSON.stringify({ orderId: "order1" }),
    });
    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toBe("Missing required fields");
  });

  it("should create return request", async () => {
    (getCurrentUser as jest.Mock).mockResolvedValue({ id: "user1" });

    const mockRef = {
      get: jest.fn().mockResolvedValue({
        id: "return1",
        data: () => ({
          order_id: "order1",
          status: "pending",
        }),
      }),
    };

    (Collections.returns as jest.Mock).mockReturnValue({
      add: jest.fn().mockResolvedValue(mockRef),
    });

    const req = new NextRequest("http://localhost/api/returns", {
      method: "POST",
      body: JSON.stringify({
        orderId: "order1",
        orderItemId: "item1",
        reason: "defective",
        shopId: "shop1",
      }),
    });
    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(201);
    expect(json.success).toBe(true);
    expect(json.data.id).toBe("return1");
  });

  it("should handle database errors", async () => {
    (getCurrentUser as jest.Mock).mockResolvedValue({ id: "user1" });
    (Collections.returns as jest.Mock).mockImplementation(() => {
      throw new Error("Database error");
    });

    const req = new NextRequest("http://localhost/api/returns", {
      method: "POST",
      body: JSON.stringify({
        orderId: "order1",
        orderItemId: "item1",
        reason: "defective",
        shopId: "shop1",
      }),
    });
    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(500);
  });
});
