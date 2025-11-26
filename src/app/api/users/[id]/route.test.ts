/**
 * @jest-environment node
 */
import { NextRequest, NextResponse } from "next/server";
import { GET, PATCH, DELETE } from "./route";
import { Collections } from "@/app/api/lib/firebase/collections";
import {
  getUserFromRequest,
  requireRole,
} from "@/app/api/middleware/rbac-auth";

jest.mock("@/app/api/lib/firebase/collections");
jest.mock("@/app/api/middleware/rbac-auth");

const mockCollections = Collections as jest.Mocked<typeof Collections>;
const mockGetUserFromRequest = getUserFromRequest as jest.MockedFunction<
  typeof getUserFromRequest
>;
const mockRequireRole = requireRole as jest.MockedFunction<typeof requireRole>;

describe("GET /api/users/[id]", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should allow user to view their own profile", async () => {
    mockGetUserFromRequest.mockResolvedValue({
      uid: "user1",
      email: "user@test.com",
      role: "user",
    } as any);

    const mockDoc = jest.fn().mockReturnValue({
      get: jest.fn().mockResolvedValue({
        exists: true,
        id: "user1",
        data: () => ({ email: "user@test.com", name: "Test User" }),
      }),
    });

    mockCollections.users.mockReturnValue({ doc: mockDoc } as any);

    const req = new NextRequest("http://localhost/api/users/user1");
    const response = await GET(req, {
      params: Promise.resolve({ id: "user1" }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.email).toBe("user@test.com");
  });

  it("should allow admin to view any user profile", async () => {
    mockGetUserFromRequest.mockResolvedValue({
      uid: "admin1",
      email: "admin@test.com",
      role: "admin",
    } as any);

    const mockDoc = jest.fn().mockReturnValue({
      get: jest.fn().mockResolvedValue({
        exists: true,
        id: "user2",
        data: () => ({ email: "user2@test.com", name: "User 2" }),
      }),
    });

    mockCollections.users.mockReturnValue({ doc: mockDoc } as any);

    const req = new NextRequest("http://localhost/api/users/user2");
    const response = await GET(req, {
      params: Promise.resolve({ id: "user2" }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data.email).toBe("user2@test.com");
  });

  it("should prevent user from viewing another user's profile", async () => {
    mockGetUserFromRequest.mockResolvedValue({
      uid: "user1",
      email: "user1@test.com",
      role: "user",
    } as any);

    const req = new NextRequest("http://localhost/api/users/user2");
    const response = await GET(req, {
      params: Promise.resolve({ id: "user2" }),
    });
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toBe("Unauthorized");
  });

  it("should return 404 for non-existent user", async () => {
    mockGetUserFromRequest.mockResolvedValue({
      uid: "admin1",
      email: "admin@test.com",
      role: "admin",
    } as any);

    const mockDoc = jest.fn().mockReturnValue({
      get: jest.fn().mockResolvedValue({ exists: false }),
    });

    mockCollections.users.mockReturnValue({ doc: mockDoc } as any);

    const req = new NextRequest("http://localhost/api/users/nonexistent");
    const response = await GET(req, {
      params: Promise.resolve({ id: "nonexistent" }),
    });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe("User not found");
  });

  it("should handle unauthenticated requests", async () => {
    mockGetUserFromRequest.mockResolvedValue(null);

    const req = new NextRequest("http://localhost/api/users/user1");
    const response = await GET(req, {
      params: Promise.resolve({ id: "user1" }),
    });
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toBe("Unauthorized");
  });
});

describe("PATCH /api/users/[id]", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should allow user to update their own profile", async () => {
    mockGetUserFromRequest.mockResolvedValue({
      uid: "user1",
      email: "user@test.com",
      role: "user",
    } as any);

    const mockUpdate = jest.fn().mockResolvedValue(undefined);
    const mockDoc = jest.fn().mockReturnValue({
      update: mockUpdate,
      get: jest.fn().mockResolvedValue({
        id: "user1",
        data: () => ({ name: "Updated Name", email: "user@test.com" }),
      }),
    });

    mockCollections.users.mockReturnValue({ doc: mockDoc } as any);

    const req = new NextRequest("http://localhost/api/users/user1", {
      method: "PATCH",
      body: JSON.stringify({ updates: { name: "Updated Name" } }),
    });

    const response = await PATCH(req, {
      params: Promise.resolve({ id: "user1" }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(mockUpdate).toHaveBeenCalled();
  });

  it("should allow admin to update user role", async () => {
    mockGetUserFromRequest.mockResolvedValue({
      uid: "admin1",
      email: "admin@test.com",
      role: "admin",
    } as any);

    const mockUpdate = jest.fn().mockResolvedValue(undefined);
    const mockDoc = jest.fn().mockReturnValue({
      update: mockUpdate,
      get: jest.fn().mockResolvedValue({
        id: "user2",
        data: () => ({ role: "seller" }),
      }),
    });

    mockCollections.users.mockReturnValue({ doc: mockDoc } as any);

    const req = new NextRequest("http://localhost/api/users/user2", {
      method: "PATCH",
      body: JSON.stringify({ updates: { role: "seller" } }),
    });

    await PATCH(req, { params: Promise.resolve({ id: "user2" }) });

    const callArgs = mockUpdate.mock.calls[0][0];
    expect(callArgs.role).toBe("seller");
  });

  it("should allow admin to ban user", async () => {
    mockGetUserFromRequest.mockResolvedValue({
      uid: "admin1",
      email: "admin@test.com",
      role: "admin",
    } as any);

    const mockUpdate = jest.fn().mockResolvedValue(undefined);
    const mockDoc = jest.fn().mockReturnValue({
      update: mockUpdate,
      get: jest.fn().mockResolvedValue({
        id: "user2",
        data: () => ({ is_banned: true }),
      }),
    });

    mockCollections.users.mockReturnValue({ doc: mockDoc } as any);

    const req = new NextRequest("http://localhost/api/users/user2", {
      method: "PATCH",
      body: JSON.stringify({
        updates: { is_banned: true, ban_reason: "Spam" },
      }),
    });

    await PATCH(req, { params: Promise.resolve({ id: "user2" }) });

    const callArgs = mockUpdate.mock.calls[0][0];
    expect(callArgs.is_banned).toBe(true);
    expect(callArgs.ban_reason).toBe("Spam");
    expect(callArgs.banned_at).toBeDefined();
    expect(callArgs.banned_by).toBe("admin1");
  });

  it("should clear ban fields when unbanning", async () => {
    mockGetUserFromRequest.mockResolvedValue({
      uid: "admin1",
      email: "admin@test.com",
      role: "admin",
    } as any);

    const mockUpdate = jest.fn().mockResolvedValue(undefined);
    const mockDoc = jest.fn().mockReturnValue({
      update: mockUpdate,
      get: jest.fn().mockResolvedValue({
        id: "user2",
        data: () => ({ is_banned: false }),
      }),
    });

    mockCollections.users.mockReturnValue({ doc: mockDoc } as any);

    const req = new NextRequest("http://localhost/api/users/user2", {
      method: "PATCH",
      body: JSON.stringify({ updates: { is_banned: false } }),
    });

    await PATCH(req, { params: Promise.resolve({ id: "user2" }) });

    const callArgs = mockUpdate.mock.calls[0][0];
    expect(callArgs.is_banned).toBe(false);
    expect(callArgs.ban_reason).toBeNull();
    expect(callArgs.banned_at).toBeNull();
    expect(callArgs.banned_by).toBeNull();
  });

  it("should prevent non-owner from updating user profile", async () => {
    mockGetUserFromRequest.mockResolvedValue({
      uid: "user1",
      email: "user1@test.com",
      role: "user",
    } as any);

    const req = new NextRequest("http://localhost/api/users/user2", {
      method: "PATCH",
      body: JSON.stringify({ updates: { name: "Hacked" } }),
    });

    const response = await PATCH(req, {
      params: Promise.resolve({ id: "user2" }),
    });
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toBe("Unauthorized");
  });

  it("should prevent user from updating role (admin-only)", async () => {
    mockGetUserFromRequest.mockResolvedValue({
      uid: "user1",
      email: "user@test.com",
      role: "user",
    } as any);

    const req = new NextRequest("http://localhost/api/users/user1", {
      method: "PATCH",
      body: JSON.stringify({ updates: { role: "admin" } }),
    });

    const response = await PATCH(req, {
      params: Promise.resolve({ id: "user1" }),
    });
    const data = await response.json();

    // User trying to change role results in "no valid updates" error
    expect(response.status).toBe(400);
    expect(data.error).toBe("No valid updates provided");
  });

  it("should require updates object", async () => {
    mockGetUserFromRequest.mockResolvedValue({
      uid: "user1",
      email: "user@test.com",
      role: "user",
    } as any);

    const req = new NextRequest("http://localhost/api/users/user1", {
      method: "PATCH",
      body: JSON.stringify({}),
    });

    const response = await PATCH(req, {
      params: Promise.resolve({ id: "user1" }),
    });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Updates are required");
  });

  it("should reject updates with no valid fields", async () => {
    mockGetUserFromRequest.mockResolvedValue({
      uid: "user1",
      email: "user@test.com",
      role: "user",
    } as any);

    const req = new NextRequest("http://localhost/api/users/user1", {
      method: "PATCH",
      body: JSON.stringify({ updates: { invalid_field: "value" } }),
    });

    const response = await PATCH(req, {
      params: Promise.resolve({ id: "user1" }),
    });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("No valid updates provided");
  });

  it("should require authentication", async () => {
    mockGetUserFromRequest.mockResolvedValue(null);

    const req = new NextRequest("http://localhost/api/users/user1", {
      method: "PATCH",
      body: JSON.stringify({ updates: { name: "Test" } }),
    });

    const response = await PATCH(req, {
      params: Promise.resolve({ id: "user1" }),
    });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });
});

describe("DELETE /api/users/[id]", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should require admin role", async () => {
    mockRequireRole.mockResolvedValue({
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    } as any);

    const req = new NextRequest("http://localhost/api/users/user1", {
      method: "DELETE",
    });

    const response = await DELETE(req, {
      params: Promise.resolve({ id: "user1" }),
    });

    expect(response.status).toBe(403);
  });

  it("should delete user", async () => {
    mockRequireRole.mockResolvedValue({
      user: { uid: "admin1", email: "admin@test.com", role: "admin" },
    } as any);

    const mockDelete = jest.fn().mockResolvedValue(undefined);
    const mockDoc = jest.fn().mockReturnValue({
      get: jest.fn().mockResolvedValue({ exists: true }),
      delete: mockDelete,
    });

    mockCollections.users.mockReturnValue({ doc: mockDoc } as any);

    const req = new NextRequest("http://localhost/api/users/user1", {
      method: "DELETE",
    });

    const response = await DELETE(req, {
      params: Promise.resolve({ id: "user1" }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(mockDelete).toHaveBeenCalled();
  });

  it("should return 404 for non-existent user", async () => {
    mockRequireRole.mockResolvedValue({
      user: { uid: "admin1", email: "admin@test.com", role: "admin" },
    } as any);

    const mockDoc = jest.fn().mockReturnValue({
      get: jest.fn().mockResolvedValue({ exists: false }),
    });

    mockCollections.users.mockReturnValue({ doc: mockDoc } as any);

    const req = new NextRequest("http://localhost/api/users/nonexistent", {
      method: "DELETE",
    });

    const response = await DELETE(req, {
      params: Promise.resolve({ id: "nonexistent" }),
    });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe("User not found");
  });

  it("should handle database errors", async () => {
    mockRequireRole.mockResolvedValue({
      user: { uid: "admin1", email: "admin@test.com", role: "admin" },
    } as any);

    const mockDoc = jest.fn().mockReturnValue({
      get: jest.fn().mockRejectedValue(new Error("DB error")),
    });

    mockCollections.users.mockReturnValue({ doc: mockDoc } as any);

    const req = new NextRequest("http://localhost/api/users/user1", {
      method: "DELETE",
    });

    const response = await DELETE(req, {
      params: Promise.resolve({ id: "user1" }),
    });
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Failed to delete user");
  });
});
