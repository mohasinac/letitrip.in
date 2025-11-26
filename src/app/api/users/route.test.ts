/**
 * @jest-environment node
 */
import { NextRequest, NextResponse } from "next/server";
import { GET, POST } from "./route";
import { Collections } from "@/app/api/lib/firebase/collections";
import { requireRole } from "@/app/api/middleware/rbac-auth";
import { executeCursorPaginatedQuery } from "@/app/api/lib/utils/pagination";

jest.mock("@/app/api/lib/firebase/collections");
jest.mock("@/app/api/middleware/rbac-auth");
jest.mock("@/app/api/lib/utils/pagination");

const mockCollections = Collections as jest.Mocked<typeof Collections>;
const mockRequireRole = requireRole as jest.MockedFunction<typeof requireRole>;
const mockExecuteCursorPaginatedQuery =
  executeCursorPaginatedQuery as jest.MockedFunction<
    typeof executeCursorPaginatedQuery
  >;

describe("GET /api/users", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should require admin role", async () => {
    mockRequireRole.mockResolvedValue({
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    } as any);

    const req = new NextRequest("http://localhost/api/users");
    const response = await GET(req);

    expect(response.status).toBe(403);
  });

  it("should list all users with default sorting", async () => {
    mockRequireRole.mockResolvedValue({
      user: { uid: "admin1", email: "admin@test.com", role: "admin" },
    } as any);

    const mockUsers = [
      { id: "user1", email: "user1@test.com", name: "User 1", role: "user" },
      { id: "user2", email: "user2@test.com", name: "User 2", role: "seller" },
    ];

    mockExecuteCursorPaginatedQuery.mockResolvedValue({
      data: mockUsers,
      count: 2,
      pagination: { hasNextPage: false, hasPrevPage: false },
    } as any);

    const mockOrderBy = jest.fn().mockReturnThis();
    mockCollections.users.mockReturnValue({
      orderBy: mockOrderBy,
    } as any);

    const req = new NextRequest("http://localhost/api/users");
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data).toEqual(mockUsers);
    expect(mockOrderBy).toHaveBeenCalledWith("created_at", "desc");
  });

  it("should filter by role", async () => {
    mockRequireRole.mockResolvedValue({
      user: { uid: "admin1", email: "admin@test.com", role: "admin" },
    } as any);

    mockExecuteCursorPaginatedQuery.mockResolvedValue({
      data: [],
      count: 0,
      pagination: { hasNextPage: false, hasPrevPage: false },
    } as any);

    const mockWhere = jest.fn().mockReturnThis();
    const mockOrderBy = jest.fn().mockReturnThis();
    mockCollections.users.mockReturnValue({
      where: mockWhere,
      orderBy: mockOrderBy,
    } as any);

    const req = new NextRequest("http://localhost/api/users?role=seller");
    await GET(req);

    expect(mockWhere).toHaveBeenCalledWith("role", "==", "seller");
  });

  it("should filter by status (banned)", async () => {
    mockRequireRole.mockResolvedValue({
      user: { uid: "admin1", email: "admin@test.com", role: "admin" },
    } as any);

    mockExecuteCursorPaginatedQuery.mockResolvedValue({
      data: [],
      count: 0,
      pagination: { hasNextPage: false, hasPrevPage: false },
    } as any);

    const mockWhere = jest.fn().mockReturnThis();
    const mockOrderBy = jest.fn().mockReturnThis();
    mockCollections.users.mockReturnValue({
      where: mockWhere,
      orderBy: mockOrderBy,
    } as any);

    const req = new NextRequest("http://localhost/api/users?status=banned");
    await GET(req);

    expect(mockWhere).toHaveBeenCalledWith("is_banned", "==", true);
  });

  it("should filter by status (active)", async () => {
    mockRequireRole.mockResolvedValue({
      user: { uid: "admin1", email: "admin@test.com", role: "admin" },
    } as any);

    mockExecuteCursorPaginatedQuery.mockResolvedValue({
      data: [],
      count: 0,
      pagination: { hasNextPage: false, hasPrevPage: false },
    } as any);

    const mockWhere = jest.fn().mockReturnThis();
    const mockOrderBy = jest.fn().mockReturnThis();
    mockCollections.users.mockReturnValue({
      where: mockWhere,
      orderBy: mockOrderBy,
    } as any);

    const req = new NextRequest("http://localhost/api/users?status=active");
    await GET(req);

    expect(mockWhere).toHaveBeenCalledWith("is_banned", "==", false);
  });

  it("should support client-side search filter", async () => {
    mockRequireRole.mockResolvedValue({
      user: { uid: "admin1", email: "admin@test.com", role: "admin" },
    } as any);

    const mockUsers = [
      {
        id: "user1",
        email: "john@test.com",
        name: "John Doe",
        phone: "1234567890",
      },
      {
        id: "user2",
        email: "jane@test.com",
        name: "Jane Smith",
        phone: "9876543210",
      },
      {
        id: "user3",
        email: "bob@test.com",
        name: "Bob Johnson",
        phone: "5555555555",
      },
    ];

    mockExecuteCursorPaginatedQuery.mockResolvedValue({
      data: mockUsers,
      count: 3,
      pagination: { hasNextPage: false, hasPrevPage: false },
    } as any);

    const mockOrderBy = jest.fn().mockReturnThis();
    mockCollections.users.mockReturnValue({
      orderBy: mockOrderBy,
    } as any);

    const req = new NextRequest("http://localhost/api/users?search=john");
    const response = await GET(req);
    const data = await response.json();

    expect(data.data).toHaveLength(2); // John Doe and Bob Johnson
    expect(data.data.map((u: any) => u.name).sort()).toEqual([
      "Bob Johnson",
      "John Doe",
    ]);
  });

  it("should support custom sorting", async () => {
    mockRequireRole.mockResolvedValue({
      user: { uid: "admin1", email: "admin@test.com", role: "admin" },
    } as any);

    mockExecuteCursorPaginatedQuery.mockResolvedValue({
      data: [],
      count: 0,
      pagination: { hasNextPage: false, hasPrevPage: false },
    } as any);

    const mockOrderBy = jest.fn().mockReturnThis();
    mockCollections.users.mockReturnValue({
      orderBy: mockOrderBy,
    } as any);

    const req = new NextRequest(
      "http://localhost/api/users?sortBy=name&sortOrder=asc"
    );
    await GET(req);

    expect(mockOrderBy).toHaveBeenCalledWith("name", "asc");
  });

  it("should handle database errors", async () => {
    mockRequireRole.mockResolvedValue({
      user: { uid: "admin1", email: "admin@test.com", role: "admin" },
    } as any);

    mockExecuteCursorPaginatedQuery.mockRejectedValue(new Error("DB error"));

    const mockOrderBy = jest.fn().mockReturnThis();
    mockCollections.users.mockReturnValue({
      orderBy: mockOrderBy,
    } as any);

    const req = new NextRequest("http://localhost/api/users");
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Failed to fetch users");
  });
});

describe("POST /api/users", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should require admin role", async () => {
    mockRequireRole.mockResolvedValue({
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    } as any);

    const req = new NextRequest("http://localhost/api/users", {
      method: "POST",
      body: JSON.stringify({ email: "test@test.com", name: "Test" }),
    });

    const response = await POST(req);
    expect(response.status).toBe(403);
  });

  it("should create a new user", async () => {
    mockRequireRole.mockResolvedValue({
      user: { uid: "admin1", email: "admin@test.com", role: "admin" },
    } as any);

    const mockWhere = jest.fn().mockReturnThis();
    const mockLimit = jest.fn().mockReturnThis();
    const mockGet = jest.fn().mockResolvedValue({ empty: true });
    const mockAdd = jest.fn().mockResolvedValue({
      id: "newuser1",
      get: jest.fn().mockResolvedValue({
        id: "newuser1",
        data: () => ({
          email: "newuser@test.com",
          name: "New User",
          role: "user",
        }),
      }),
    });

    mockCollections.users.mockReturnValue({
      where: mockWhere,
      limit: mockLimit,
      get: mockGet,
      add: mockAdd,
    } as any);

    const req = new NextRequest("http://localhost/api/users", {
      method: "POST",
      body: JSON.stringify({ email: "newuser@test.com", name: "New User" }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.data.email).toBe("newuser@test.com");
    expect(mockAdd).toHaveBeenCalled();
  });

  it("should require email and name", async () => {
    mockRequireRole.mockResolvedValue({
      user: { uid: "admin1", email: "admin@test.com", role: "admin" },
    } as any);

    const req = new NextRequest("http://localhost/api/users", {
      method: "POST",
      body: JSON.stringify({ email: "test@test.com" }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Email and name are required");
  });

  it("should reject duplicate email", async () => {
    mockRequireRole.mockResolvedValue({
      user: { uid: "admin1", email: "admin@test.com", role: "admin" },
    } as any);

    const mockWhere = jest.fn().mockReturnThis();
    const mockLimit = jest.fn().mockReturnThis();
    const mockGet = jest.fn().mockResolvedValue({
      empty: false,
      docs: [{ id: "existing", data: () => ({ email: "existing@test.com" }) }],
    });

    mockCollections.users.mockReturnValue({
      where: mockWhere,
      limit: mockLimit,
      get: mockGet,
    } as any);

    const req = new NextRequest("http://localhost/api/users", {
      method: "POST",
      body: JSON.stringify({
        email: "existing@test.com",
        name: "Existing User",
      }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Email already exists");
  });

  it("should set default role to user", async () => {
    mockRequireRole.mockResolvedValue({
      user: { uid: "admin1", email: "admin@test.com", role: "admin" },
    } as any);

    const mockWhere = jest.fn().mockReturnThis();
    const mockLimit = jest.fn().mockReturnThis();
    const mockGet = jest.fn().mockResolvedValue({ empty: true });
    const mockAdd = jest.fn().mockResolvedValue({
      id: "newuser1",
      get: jest.fn().mockResolvedValue({
        id: "newuser1",
        data: () => ({ role: "user" }),
      }),
    });

    mockCollections.users.mockReturnValue({
      where: mockWhere,
      limit: mockLimit,
      get: mockGet,
      add: mockAdd,
    } as any);

    const req = new NextRequest("http://localhost/api/users", {
      method: "POST",
      body: JSON.stringify({ email: "test@test.com", name: "Test" }),
    });

    await POST(req);

    const callArgs = mockAdd.mock.calls[0][0];
    expect(callArgs.role).toBe("user");
    expect(callArgs.is_banned).toBe(false);
  });

  it("should handle database errors", async () => {
    mockRequireRole.mockResolvedValue({
      user: { uid: "admin1", email: "admin@test.com", role: "admin" },
    } as any);

    const mockWhere = jest.fn().mockReturnThis();
    const mockLimit = jest.fn().mockReturnThis();
    const mockGet = jest.fn().mockRejectedValue(new Error("DB error"));

    mockCollections.users.mockReturnValue({
      where: mockWhere,
      limit: mockLimit,
      get: mockGet,
    } as any);

    const req = new NextRequest("http://localhost/api/users", {
      method: "POST",
      body: JSON.stringify({ email: "test@test.com", name: "Test" }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Failed to create user");
  });
});
