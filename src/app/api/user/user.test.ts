/**
 * @jest-environment node
 */

// Mock dependencies BEFORE imports
jest.mock("@/app/api/lib/firebase/admin");
jest.mock("@/app/api/lib/auth-helpers");
jest.mock("../lib/session");
jest.mock("../lib/firebase/config", () => ({
  adminAuth: {},
  adminDb: {},
  getFirestoreAdmin: jest.fn(),
}));

import { NextRequest, NextResponse } from "next/server";
import { GET as profileGET, PATCH as profilePATCH } from "./profile/route";
import { GET as addressesGET, POST as addressesPOST } from "./addresses/route";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { requireAuth, handleAuthError } from "@/app/api/lib/auth-helpers";
import { getCurrentUser } from "../lib/session";
import { COLLECTIONS } from "@/constants/database";

const mockGetFirestoreAdmin = getFirestoreAdmin as jest.MockedFunction<typeof getFirestoreAdmin>;
const mockRequireAuth = requireAuth as jest.MockedFunction<typeof requireAuth>;
const mockHandleAuthError = handleAuthError as jest.MockedFunction<typeof handleAuthError>;
const mockGetCurrentUser = getCurrentUser as jest.MockedFunction<typeof getCurrentUser>;

describe("GET /api/user/profile", () => {
  let mockDb: any;
  let mockCollection: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockCollection = {
      doc: jest.fn().mockReturnValue({
        get: jest.fn().mockResolvedValue({
          exists: true,
          id: "user1",
          data: () => ({
            email: "test@example.com",
            name: "Test User",
            phone: "1234567890",
            role: "user",
          }),
        }),
      }),
    };

    mockDb = {
      collection: jest.fn().mockReturnValue(mockCollection),
    };

    mockGetFirestoreAdmin.mockReturnValue(mockDb);
    mockRequireAuth.mockResolvedValue({ id: "user1", email: "test@example.com" } as any);
  });

  it("should require authentication", async () => {
    mockRequireAuth.mockRejectedValue(new Error("Unauthorized"));
    mockHandleAuthError.mockReturnValue(
      NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    );

    const request = new NextRequest("http://localhost:3000/api/user/profile");
    const response = await profileGET(request);

    expect(response.status).toBe(401);
  });

  it("should return 404 when user not found", async () => {
    mockCollection.doc.mockReturnValue({
      get: jest.fn().mockResolvedValue({ exists: false }),
    });

    const request = new NextRequest("http://localhost:3000/api/user/profile");
    const response = await profileGET(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe("User not found");
  });

  it("should return user profile data", async () => {
    const request = new NextRequest("http://localhost:3000/api/user/profile");
    const response = await profileGET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.user).toMatchObject({
      id: "user1",
      email: "test@example.com",
      name: "Test User",
      phone: "1234567890",
    });
  });

  it("should remove password from response", async () => {
    mockCollection.doc.mockReturnValue({
      get: jest.fn().mockResolvedValue({
        exists: true,
        id: "user1",
        data: () => ({
          email: "test@example.com",
          name: "Test User",
          password: "secret_hash",
        }),
      }),
    });

    const request = new NextRequest("http://localhost:3000/api/user/profile");
    const response = await profileGET(request);
    const data = await response.json();

    expect(data.user).not.toHaveProperty("password");
  });
});

describe("PATCH /api/user/profile", () => {
  let mockDb: any;
  let mockCollection: any;
  let mockUpdate: jest.Mock;
  let mockGet: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockUpdate = jest.fn().mockResolvedValue(undefined);
    mockGet = jest.fn().mockResolvedValue({
      exists: true,
      id: "user1",
      data: () => ({
        email: "updated@example.com",
        name: "Updated User",
      }),
    });

    mockCollection = {
      doc: jest.fn().mockReturnValue({
        update: mockUpdate,
        get: mockGet,
      }),
      where: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue({ empty: true, docs: [] }),
    };

    mockDb = {
      collection: jest.fn().mockReturnValue(mockCollection),
    };

    mockGetFirestoreAdmin.mockReturnValue(mockDb);
    mockRequireAuth.mockResolvedValue({ id: "user1", email: "test@example.com" } as any);
  });

  it("should require authentication", async () => {
    mockRequireAuth.mockRejectedValue(new Error("Unauthorized"));
    mockHandleAuthError.mockReturnValue(
      NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    );

    const request = new NextRequest("http://localhost:3000/api/user/profile", {
      method: "PATCH",
      body: JSON.stringify({ name: "New Name" }),
    });

    const response = await profilePATCH(request);
    expect(response.status).toBe(401);
  });

  it("should require name", async () => {
    const request = new NextRequest("http://localhost:3000/api/user/profile", {
      method: "PATCH",
      body: JSON.stringify({ email: "test@example.com" }),
    });

    const response = await profilePATCH(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Name is required");
  });

  it("should require email", async () => {
    const request = new NextRequest("http://localhost:3000/api/user/profile", {
      method: "PATCH",
      body: JSON.stringify({ name: "Test User" }),
    });

    const response = await profilePATCH(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Email is required");
  });

  it("should validate email format", async () => {
    const request = new NextRequest("http://localhost:3000/api/user/profile", {
      method: "PATCH",
      body: JSON.stringify({ name: "Test User", email: "invalid-email" }),
    });

    const response = await profilePATCH(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Invalid email format");
  });

  it("should reject duplicate email", async () => {
    mockCollection.get.mockResolvedValue({
      empty: false,
      docs: [{ id: "otheruser" }],
    });

    const request = new NextRequest("http://localhost:3000/api/user/profile", {
      method: "PATCH",
      body: JSON.stringify({ name: "Test User", email: "taken@example.com" }),
    });

    const response = await profilePATCH(request);
    const data = await response.json();

    expect(response.status).toBe(409);
    expect(data.error).toBe("Email already in use");
  });

  it("should allow same email for current user", async () => {
    mockCollection.get.mockResolvedValue({
      empty: false,
      docs: [{ id: "user1" }], // same user
    });

    const request = new NextRequest("http://localhost:3000/api/user/profile", {
      method: "PATCH",
      body: JSON.stringify({ name: "Test User", email: "test@example.com" }),
    });

    const response = await profilePATCH(request);
    expect(response.status).toBe(200);
  });

  it("should update profile successfully", async () => {
    const request = new NextRequest("http://localhost:3000/api/user/profile", {
      method: "PATCH",
      body: JSON.stringify({
        name: "Updated User",
        email: "updated@example.com",
        phone: "9876543210",
      }),
    });

    const response = await profilePATCH(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Updated User",
        email: "updated@example.com",
        phone: "9876543210",
        updated_at: expect.any(String),
      })
    );
    expect(data.user.name).toBe("Updated User");
  });

  it("should trim and lowercase email", async () => {
    const localMockUpdate = jest.fn().mockResolvedValue(undefined);
    const localMockGet = jest.fn().mockResolvedValue({
      exists: true,
      id: "user1",
      data: () => ({
        email: "test@example.com",
        name: "Test User",
      }),
    });

    const localMockCollection = {
      doc: jest.fn().mockReturnValue({
        update: localMockUpdate,
        get: localMockGet,
      }),
      where: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue({ empty: true, docs: [] }),
    };

    const localMockDb = {
      collection: jest.fn().mockReturnValue(localMockCollection),
    };

    mockGetFirestoreAdmin.mockReturnValue(localMockDb);
    mockRequireAuth.mockResolvedValue({ id: "user1", email: "test@example.com" } as any);

    const request = new NextRequest("http://localhost:3000/api/user/profile", {
      method: "PATCH",
      body: JSON.stringify({
        name: "Test User",
        email: " TEST@EXAMPLE.COM ",
      }),
    });

    await profilePATCH(request);

    expect(localMockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "test@example.com",
      })
    );
  });

  it("should only update phone if provided", async () => {
    const request = new NextRequest("http://localhost:3000/api/user/profile", {
      method: "PATCH",
      body: JSON.stringify({
        name: "Test User",
        email: "test@example.com",
      }),
    });

    await profilePATCH(request);

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.not.objectContaining({
        phone: expect.anything(),
      })
    );
  });
});

describe("GET /api/user/addresses", () => {
  let mockDb: any;
  let mockCollection: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockCollection = {
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue({
        docs: [
          {
            id: "addr1",
            data: () => ({
              name: "Home",
              addressLine1: "123 Main St",
              city: "City",
              isDefault: true,
            }),
          },
        ],
      }),
    };

    mockDb = {
      collection: jest.fn().mockReturnValue(mockCollection),
    };

    mockGetFirestoreAdmin.mockReturnValue(mockDb);
    mockGetCurrentUser.mockResolvedValue({ id: "user1", email: "test@example.com" } as any);
  });

  it("should require authentication", async () => {
    mockGetCurrentUser.mockResolvedValue(null);

    const request = new NextRequest("http://localhost:3000/api/user/addresses");
    const response = await addressesGET(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });

  it("should return user addresses", async () => {
    const request = new NextRequest("http://localhost:3000/api/user/addresses");
    const response = await addressesGET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.addresses).toHaveLength(1);
    expect(data.addresses[0]).toMatchObject({
      id: "addr1",
      name: "Home",
      city: "City",
    });
  });

  it("should order by default and createdAt", async () => {
    const request = new NextRequest("http://localhost:3000/api/user/addresses");
    await addressesGET(request);

    expect(mockCollection.orderBy).toHaveBeenCalledWith("isDefault", "desc");
    expect(mockCollection.orderBy).toHaveBeenCalledWith("createdAt", "desc");
  });

  it("should handle database errors", async () => {
    mockCollection.get.mockRejectedValue(new Error("Database error"));

    const request = new NextRequest("http://localhost:3000/api/user/addresses");
    const response = await addressesGET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Failed to fetch addresses");
  });
});

describe("POST /api/user/addresses", () => {
  let mockDb: any;
  let mockCollection: any;
  let mockBatch: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockBatch = {
      update: jest.fn(),
      commit: jest.fn().mockResolvedValue(undefined),
    };

    mockCollection = {
      where: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue({ docs: [] }),
      doc: jest.fn().mockReturnValue({
        id: "newaddr1",
        set: jest.fn().mockResolvedValue(undefined),
      }),
    };

    mockDb = {
      collection: jest.fn().mockReturnValue(mockCollection),
      batch: jest.fn().mockReturnValue(mockBatch),
    };

    mockGetFirestoreAdmin.mockReturnValue(mockDb);
    mockGetCurrentUser.mockResolvedValue({ id: "user1", email: "test@example.com" } as any);
  });

  it("should require authentication", async () => {
    mockGetCurrentUser.mockResolvedValue(null);

    const request = new NextRequest("http://localhost:3000/api/user/addresses", {
      method: "POST",
      body: JSON.stringify({}),
    });

    const response = await addressesPOST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });

  it("should require all mandatory fields", async () => {
    const request = new NextRequest("http://localhost:3000/api/user/addresses", {
      method: "POST",
      body: JSON.stringify({
        name: "Home",
        phone: "1234567890",
      }),
    });

    const response = await addressesPOST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Missing required fields");
  });

  it("should create address with valid data", async () => {
    const mockSet = jest.fn().mockResolvedValue(undefined);
    mockCollection.doc.mockReturnValue({
      id: "newaddr1",
      set: mockSet,
    });

    const request = new NextRequest("http://localhost:3000/api/user/addresses", {
      method: "POST",
      body: JSON.stringify({
        name: "Home",
        phone: "1234567890",
        addressLine1: "123 Main St",
        city: "City",
        state: "State",
        postalCode: "12345",
        country: "Country",
      }),
    });

    const response = await addressesPOST(request);

    expect(response.status).toBe(201);
    expect(mockSet).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user1",
        name: "Home",
        phone: "1234567890",
        addressLine1: "123 Main St",
        city: "City",
        state: "State",
        postalCode: "12345",
        country: "Country",
      })
    );
  });

  it("should unset other default addresses when isDefault=true", async () => {
    mockCollection.get.mockResolvedValue({
      docs: [
        { ref: "ref1" },
        { ref: "ref2" },
      ],
    });

    const request = new NextRequest("http://localhost:3000/api/user/addresses", {
      method: "POST",
      body: JSON.stringify({
        name: "Home",
        phone: "1234567890",
        addressLine1: "123 Main St",
        city: "City",
        state: "State",
        postalCode: "12345",
        country: "Country",
        isDefault: true,
      }),
    });

    await addressesPOST(request);

    expect(mockBatch.update).toHaveBeenCalledTimes(2);
    expect(mockBatch.commit).toHaveBeenCalled();
  });

  it("should set addressLine2 to null if not provided", async () => {
    const mockSet = jest.fn().mockResolvedValue(undefined);
    mockCollection.doc.mockReturnValue({
      id: "newaddr1",
      set: mockSet,
    });

    const request = new NextRequest("http://localhost:3000/api/user/addresses", {
      method: "POST",
      body: JSON.stringify({
        name: "Home",
        phone: "1234567890",
        addressLine1: "123 Main St",
        city: "City",
        state: "State",
        postalCode: "12345",
        country: "Country",
      }),
    });

    await addressesPOST(request);

    expect(mockSet).toHaveBeenCalledWith(
      expect.objectContaining({
        addressLine2: null,
      })
    );
  });
});
