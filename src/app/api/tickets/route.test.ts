/**
 * @jest-environment node
 */
import { NextRequest, NextResponse } from "next/server";
import { GET, POST } from "./route";
import * as rbacAuth from "@/app/api/middleware/rbac-auth";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import * as pagination from "@/app/api/lib/utils/pagination";

jest.mock("@/app/api/middleware/rbac-auth");
jest.mock("@/app/api/lib/firebase/admin");
jest.mock("@/app/api/lib/utils/pagination");

const Collections = {
  support_tickets: jest.fn(),
};

(getFirestoreAdmin as jest.Mock).mockReturnValue({
  collection: (name: string) =>
    Collections[name as keyof typeof Collections]?.() || jest.fn(),
});

describe("GET /api/tickets", () => {
  const mockGetUserFromRequest = rbacAuth.getUserFromRequest as jest.Mock;
  const mockRequireAuth = rbacAuth.requireAuth as jest.Mock;
  const mockExecutePagination =
    pagination.executeCursorPaginatedQuery as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should require authentication for users", async () => {
    mockGetUserFromRequest.mockResolvedValue(null);

    const request = new NextRequest("http://localhost/api/tickets");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Authentication required");
  });

  it("should list user's own tickets only", async () => {
    const mockUser = { uid: "user123", role: "user" };
    mockGetUserFromRequest.mockResolvedValue(mockUser);

    const mockQuery = {
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
    };
    Collections.support_tickets.mockReturnValue(mockQuery);

    mockExecutePagination.mockResolvedValue({
      items: [{ id: "ticket1", subject: "Test", userId: "user123" }],
      hasNextPage: false,
    });

    const request = new NextRequest("http://localhost/api/tickets");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(mockQuery.where).toHaveBeenCalledWith("userId", "==", "user123");
    expect(data.items).toHaveLength(1);
  });

  it("should require shopId for sellers", async () => {
    const mockUser = { uid: "seller123", role: "seller" };
    mockGetUserFromRequest.mockResolvedValue(mockUser);

    const request = new NextRequest("http://localhost/api/tickets");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Shop ID required for seller");
  });

  it("should filter tickets by shopId for sellers", async () => {
    const mockUser = { uid: "seller123", role: "seller" };
    mockGetUserFromRequest.mockResolvedValue(mockUser);

    const mockQuery = {
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
    };
    Collections.support_tickets.mockReturnValue(mockQuery);

    mockExecutePagination.mockResolvedValue({
      items: [{ id: "ticket1", shopId: "shop123" }],
      hasNextPage: false,
    });

    const request = new NextRequest(
      "http://localhost/api/tickets?shopId=shop123",
    );
    const response = await GET(request);

    expect(response.status).toBe(200);
    expect(mockQuery.where).toHaveBeenCalledWith("shopId", "==", "shop123");
  });

  it("should allow admin to see all tickets", async () => {
    const mockUser = { uid: "admin123", role: "admin" };
    mockGetUserFromRequest.mockResolvedValue(mockUser);

    const mockQuery = {
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
    };
    Collections.support_tickets.mockReturnValue(mockQuery);

    const mockGet = jest.fn().mockResolvedValue({
      size: 10,
      docs: [
        { data: () => ({ status: "open" }) },
        { data: () => ({ status: "in-progress" }) },
        { data: () => ({ status: "resolved" }) },
      ],
    });
    Collections.support_tickets.mockReturnValue({ ...mockQuery, get: mockGet });

    mockExecutePagination.mockResolvedValue({
      items: [{ id: "ticket1" }, { id: "ticket2" }],
      hasNextPage: false,
    });

    const request = new NextRequest("http://localhost/api/tickets");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.stats).toBeDefined();
    expect(data.stats.total).toBe(10);
    expect(data.stats.open).toBe(1);
    expect(data.stats.inProgress).toBe(1);
    expect(data.stats.resolved).toBe(1);
  });

  it("should filter by status", async () => {
    const mockUser = { uid: "admin123", role: "admin" };
    mockGetUserFromRequest.mockResolvedValue(mockUser);

    const mockQuery = {
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue({ size: 0, docs: [] }),
    };
    Collections.support_tickets.mockReturnValue(mockQuery);

    mockExecutePagination.mockResolvedValue({
      items: [],
      hasNextPage: false,
    });

    const request = new NextRequest("http://localhost/api/tickets?status=open");
    await GET(request);

    expect(mockQuery.where).toHaveBeenCalledWith("status", "==", "open");
  });

  it("should filter by category", async () => {
    const mockUser = { uid: "admin123", role: "admin" };
    mockGetUserFromRequest.mockResolvedValue(mockUser);

    const mockQuery = {
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue({ size: 0, docs: [] }),
    };
    Collections.support_tickets.mockReturnValue(mockQuery);

    mockExecutePagination.mockResolvedValue({
      items: [],
      hasNextPage: false,
    });

    const request = new NextRequest(
      "http://localhost/api/tickets?category=order-issue",
    );
    await GET(request);

    expect(mockQuery.where).toHaveBeenCalledWith(
      "category",
      "==",
      "order-issue",
    );
  });

  it("should filter by priority", async () => {
    const mockUser = { uid: "admin123", role: "admin" };
    mockGetUserFromRequest.mockResolvedValue(mockUser);

    const mockQuery = {
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue({ size: 0, docs: [] }),
    };
    Collections.support_tickets.mockReturnValue(mockQuery);

    mockExecutePagination.mockResolvedValue({
      items: [],
      hasNextPage: false,
    });

    const request = new NextRequest(
      "http://localhost/api/tickets?priority=urgent",
    );
    await GET(request);

    expect(mockQuery.where).toHaveBeenCalledWith("priority", "==", "urgent");
  });

  it("should allow admin to filter by assignedTo", async () => {
    const mockUser = { uid: "admin123", role: "admin" };
    mockGetUserFromRequest.mockResolvedValue(mockUser);

    const mockQuery = {
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue({ size: 0, docs: [] }),
    };
    Collections.support_tickets.mockReturnValue(mockQuery);

    mockExecutePagination.mockResolvedValue({
      items: [],
      hasNextPage: false,
    });

    const request = new NextRequest(
      "http://localhost/api/tickets?assignedTo=admin456",
    );
    await GET(request);

    expect(mockQuery.where).toHaveBeenCalledWith(
      "assignedTo",
      "==",
      "admin456",
    );
  });

  it("should sort by valid fields", async () => {
    const mockUser = { uid: "admin123", role: "admin" };
    mockGetUserFromRequest.mockResolvedValue(mockUser);

    const mockQuery = {
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue({ size: 0, docs: [] }),
    };
    Collections.support_tickets.mockReturnValue(mockQuery);

    mockExecutePagination.mockResolvedValue({
      items: [],
      hasNextPage: false,
    });

    const request = new NextRequest(
      "http://localhost/api/tickets?sortBy=priority&sortOrder=asc",
    );
    await GET(request);

    expect(mockQuery.orderBy).toHaveBeenCalledWith("priority", "asc");
  });

  it("should default to createdAt desc sorting", async () => {
    const mockUser = { uid: "admin123", role: "admin" };
    mockGetUserFromRequest.mockResolvedValue(mockUser);

    const mockQuery = {
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue({ size: 0, docs: [] }),
    };
    Collections.support_tickets.mockReturnValue(mockQuery);

    mockExecutePagination.mockResolvedValue({
      items: [],
      hasNextPage: false,
    });

    const request = new NextRequest("http://localhost/api/tickets");
    await GET(request);

    expect(mockQuery.orderBy).toHaveBeenCalledWith("createdAt", "desc");
  });

  it("should handle database errors", async () => {
    const mockUser = { uid: "user123", role: "user" };
    mockGetUserFromRequest.mockResolvedValue(mockUser);

    Collections.support_tickets.mockImplementation(() => {
      throw new Error("Database error");
    });

    const request = new NextRequest("http://localhost/api/tickets");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Database error");
  });
});

describe("POST /api/tickets", () => {
  const mockRequireAuth = rbacAuth.requireAuth as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should require authentication", async () => {
    mockRequireAuth.mockResolvedValue({
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    });

    const request = new NextRequest("http://localhost/api/tickets", {
      method: "POST",
      body: JSON.stringify({}),
    });
    const response = await POST(request);

    expect(response.status).toBe(401);
  });

  it("should create a ticket with valid data", async () => {
    const mockUser = { uid: "user123", role: "user" };
    mockRequireAuth.mockResolvedValue({ user: mockUser });

    const mockAdd = jest.fn().mockResolvedValue({ id: "ticket123" });
    Collections.support_tickets.mockReturnValue({ add: mockAdd });

    const ticketData = {
      subject: "Test issue",
      category: "order-issue",
      priority: "high",
      description: "This is a test ticket description",
      shopId: "shop123",
      orderId: "order123",
    };

    const request = new NextRequest("http://localhost/api/tickets", {
      method: "POST",
      body: JSON.stringify(ticketData),
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.id).toBe("ticket123");
    expect(data.data.subject).toBe("Test issue");
    expect(data.data.userId).toBe("user123");
    expect(mockAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        subject: "Test issue",
        category: "order-issue",
        priority: "high",
        status: "open",
        userId: "user123",
      }),
    );
  });

  it("should require subject", async () => {
    const mockUser = { uid: "user123", role: "user" };
    mockRequireAuth.mockResolvedValue({ user: mockUser });

    const request = new NextRequest("http://localhost/api/tickets", {
      method: "POST",
      body: JSON.stringify({
        category: "order-issue",
        description: "Test description",
      }),
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.errors.subject).toBeDefined();
  });

  it("should require description", async () => {
    const mockUser = { uid: "user123", role: "user" };
    mockRequireAuth.mockResolvedValue({ user: mockUser });

    const request = new NextRequest("http://localhost/api/tickets", {
      method: "POST",
      body: JSON.stringify({
        subject: "Test subject",
        category: "order-issue",
      }),
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.errors.description).toBeDefined();
  });

  it("should require valid category", async () => {
    const mockUser = { uid: "user123", role: "user" };
    mockRequireAuth.mockResolvedValue({ user: mockUser });

    const request = new NextRequest("http://localhost/api/tickets", {
      method: "POST",
      body: JSON.stringify({
        subject: "Test subject",
        category: "invalid-category",
        description: "Test description",
      }),
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.errors.category).toBeDefined();
  });

  it("should default to medium priority", async () => {
    const mockUser = { uid: "user123", role: "user" };
    mockRequireAuth.mockResolvedValue({ user: mockUser });

    const mockAdd = jest.fn().mockResolvedValue({ id: "ticket123" });
    Collections.support_tickets.mockReturnValue({ add: mockAdd });

    const request = new NextRequest("http://localhost/api/tickets", {
      method: "POST",
      body: JSON.stringify({
        subject: "Test subject",
        category: "order-issue",
        description: "Test description",
      }),
    });
    await POST(request);

    expect(mockAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        priority: "medium",
      }),
    );
  });

  it("should handle database errors", async () => {
    const mockUser = { uid: "user123", role: "user" };
    mockRequireAuth.mockResolvedValue({ user: mockUser });

    Collections.support_tickets.mockReturnValue({
      add: jest.fn().mockRejectedValue(new Error("Database error")),
    });

    const request = new NextRequest("http://localhost/api/tickets", {
      method: "POST",
      body: JSON.stringify({
        subject: "Test subject",
        category: "order-issue",
        description: "Test description",
      }),
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Database error");
  });
});
