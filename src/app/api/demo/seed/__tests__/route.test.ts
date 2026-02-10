/**
 * @jest-environment node
 */

/**
 * Demo Seed API Integration Tests
 *
 * Tests:
 * - POST /api/demo/seed (load action)
 * - POST /api/demo/seed (delete action)
 * - Environment protection
 * - Upsert behavior
 * - Collection selection
 */

// Set NODE_ENV before any imports to prevent module-level errors
(process.env as any).NODE_ENV = "development";

import { POST } from "../route";
import { buildRequest, parseResponse } from "@/app/api/__tests__/helpers";

// Store original NODE_ENV
const originalEnv = process.env.NODE_ENV;

// Mock Firebase Admin
const mockGetAdminDb = jest.fn();
const mockGetAdminAuth = jest.fn();
jest.mock("@/lib/firebase/admin", () => ({
  getAdminDb: () => mockGetAdminDb(),
  getAdminAuth: () => mockGetAdminAuth(),
}));

// Mock seed data
jest.mock("../../../../../../scripts/seed-data", () => ({
  usersSeedData: [
    {
      uid: "test-user-1",
      email: "test1@example.com",
      displayName: "Test User 1",
      phoneNumber: null,
      photoURL: null,
      emailVerified: true,
      disabled: false,
    },
  ],
  categoriesSeedData: [
    { id: "cat-1", name: "Electronics", slug: "electronics" },
  ],
  productsSeedData: [{ id: "prod-1", title: "Test Product", price: 100 }],
  ordersSeedData: [],
  reviewsSeedData: [],
  bidsSeedData: [],
  couponsSeedData: [],
  carouselSlidesSeedData: [],
  homepageSectionsSeedData: [],
  siteSettingsSeedData: { siteName: "LetItRip", siteDescription: "Test" },
  FAQ_SEED_DATA: [],
  faqSeedData: [],
}));

describe("Demo Seed API", () => {
  let mockDb: any;
  let mockAuth: any;
  let mockCollectionRef: any;
  let mockDocRef: any;
  let mockDocSnapshot: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Reset environment to development
    (process.env as any).NODE_ENV = "development";

    // Setup Firestore mocks
    mockDocSnapshot = {
      exists: false,
      data: jest.fn().mockReturnValue(null),
    };

    mockDocRef = {
      get: jest.fn().mockResolvedValue(mockDocSnapshot),
      set: jest.fn().mockResolvedValue(undefined),
      delete: jest.fn().mockResolvedValue(undefined),
    };

    mockCollectionRef = {
      doc: jest.fn().mockReturnValue(mockDocRef),
    };

    mockDb = {
      collection: jest.fn().mockReturnValue(mockCollectionRef),
    };

    // Setup Auth mocks
    mockAuth = {
      getUser: jest.fn().mockRejectedValue({ code: "auth/user-not-found" }),
      createUser: jest.fn().mockResolvedValue({ uid: "test-user-1" }),
      updateUser: jest.fn().mockResolvedValue(undefined),
      deleteUser: jest.fn().mockResolvedValue(undefined),
    };

    mockGetAdminDb.mockReturnValue(mockDb);
    mockGetAdminAuth.mockReturnValue(mockAuth);
  });

  afterAll(() => {
    // Restore original NODE_ENV
    (process.env as any).NODE_ENV = originalEnv;
  });

  describe("Environment Protection", () => {
    it("should reject requests in production", async () => {
      (process.env as any).NODE_ENV = "production";

      const request = buildRequest("/api/demo/seed", {
        method: "POST",
        body: { action: "load" },
      });

      const response = await POST(request);
      const { status, body } = await parseResponse(response);

      expect(status).toBe(403);
      expect(body.success).toBe(false);
      expect(body.message).toContain("development mode");
    });

    it("should allow requests in development", async () => {
      (process.env as any).NODE_ENV = "development";

      const request = buildRequest("/api/demo/seed", {
        method: "POST",
        body: { action: "load", collections: [] },
      });

      const response = await POST(request);
      const { status } = await parseResponse(response);

      expect(status).toBe(200);
    });
  });

  describe("Request Validation", () => {
    it("should require action parameter", async () => {
      const request = buildRequest("/api/demo/seed", {
        method: "POST",
        body: {},
      });

      const response = await POST(request);
      const { status, body } = await parseResponse(response);

      expect(status).toBe(400);
      expect(body.success).toBe(false);
      expect(body.message).toContain("Invalid action");
    });

    it("should only accept load or delete actions", async () => {
      const request = buildRequest("/api/demo/seed", {
        method: "POST",
        body: { action: "invalid-action" },
      });

      const response = await POST(request);
      const { status, body } = await parseResponse(response);

      expect(status).toBe(400);
      expect(body.success).toBe(false);
      expect(body.message).toContain("Invalid action");
    });
  });

  describe("Load Action", () => {
    it("should create new documents when they don't exist", async () => {
      mockDocSnapshot.exists = false;

      const request = buildRequest("/api/demo/seed", {
        method: "POST",
        body: { action: "load", collections: ["categories"] },
      });

      const response = await POST(request);
      const { status, body } = await parseResponse(response);

      expect(status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.details.created).toBe(1);
      expect(body.details.updated).toBe(0);
      expect(mockDocRef.set).toHaveBeenCalledWith(
        expect.objectContaining({ name: "Electronics" }),
        { merge: true },
      );
    });

    it("should update existing documents", async () => {
      mockDocSnapshot.exists = true;

      const request = buildRequest("/api/demo/seed", {
        method: "POST",
        body: { action: "load", collections: ["categories"] },
      });

      const response = await POST(request);
      const { status, body } = await parseResponse(response);

      expect(status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.details.created).toBe(0);
      expect(body.details.updated).toBe(1);
      expect(mockDocRef.set).toHaveBeenCalledWith(
        expect.objectContaining({ name: "Electronics" }),
        { merge: true },
      );
    });

    it("should handle users collection with Auth and Firestore", async () => {
      mockDocSnapshot.exists = false;

      const request = buildRequest("/api/demo/seed", {
        method: "POST",
        body: { action: "load", collections: ["users"] },
      });

      const response = await POST(request);
      const { status, body } = await parseResponse(response);

      expect(status).toBe(200);
      expect(body.success).toBe(true);

      // Should check Auth user existence
      expect(mockAuth.getUser).toHaveBeenCalledWith("test-user-1");

      // Should create Auth user (since it doesn't exist)
      expect(mockAuth.createUser).toHaveBeenCalledWith(
        expect.objectContaining({
          uid: "test-user-1",
          email: "test1@example.com",
          password: "TempPass123!",
        }),
      );

      // Should create Firestore document
      expect(mockDocRef.set).toHaveBeenCalled();
    });

    it("should update existing Auth users", async () => {
      mockAuth.getUser.mockResolvedValue({ uid: "test-user-1" });
      mockDocSnapshot.exists = true;

      const request = buildRequest("/api/demo/seed", {
        method: "POST",
        body: { action: "load", collections: ["users"] },
      });

      const response = await POST(request);

      expect(mockAuth.updateUser).toHaveBeenCalledWith(
        "test-user-1",
        expect.objectContaining({
          email: "test1@example.com",
        }),
      );
      expect(mockAuth.createUser).not.toHaveBeenCalled();
    });

    it("should handle siteSettings singleton", async () => {
      mockDocSnapshot.exists = false;

      const request = buildRequest("/api/demo/seed", {
        method: "POST",
        body: { action: "load", collections: ["siteSettings"] },
      });

      const response = await POST(request);
      const { status, body } = await parseResponse(response);

      expect(status).toBe(200);
      expect(body.success).toBe(true);

      // Should use 'global' as doc ID
      expect(mockCollectionRef.doc).toHaveBeenCalledWith("global");
      expect(mockDocRef.set).toHaveBeenCalledWith(
        expect.objectContaining({ siteName: "LetItRip" }),
        { merge: true },
      );
    });

    it("should process multiple collections", async () => {
      const request = buildRequest("/api/demo/seed", {
        method: "POST",
        body: { action: "load", collections: ["categories", "products"] },
      });

      const response = await POST(request);
      const { status, body } = await parseResponse(response);

      expect(status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.details.collections).toEqual(["categories", "products"]);
      expect(body.details.created).toBe(2);
    });

    it("should process all collections when none specified", async () => {
      const request = buildRequest("/api/demo/seed", {
        method: "POST",
        body: { action: "load" },
      });

      const response = await POST(request);
      const { status, body } = await parseResponse(response);

      expect(status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.details.collections.length).toBeGreaterThan(1);
    });
  });

  describe("Delete Action", () => {
    it("should delete existing documents", async () => {
      mockDocSnapshot.exists = true;

      const request = buildRequest("/api/demo/seed", {
        method: "POST",
        body: { action: "delete", collections: ["categories"] },
      });

      const response = await POST(request);
      const { status, body } = await parseResponse(response);

      expect(status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.details.deleted).toBe(1);
      expect(body.details.skipped).toBe(0);
      expect(mockDocRef.delete).toHaveBeenCalled();
    });

    it("should skip non-existent documents", async () => {
      mockDocSnapshot.exists = false;

      const request = buildRequest("/api/demo/seed", {
        method: "POST",
        body: { action: "delete", collections: ["categories"] },
      });

      const response = await POST(request);
      const { status, body } = await parseResponse(response);

      expect(status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.details.deleted).toBe(0);
      expect(body.details.skipped).toBe(1);
      expect(mockDocRef.delete).not.toHaveBeenCalled();
    });

    it("should handle users collection with Auth deletion", async () => {
      mockAuth.getUser.mockResolvedValue({ uid: "test-user-1" });
      mockDocSnapshot.exists = true;

      const request = buildRequest("/api/demo/seed", {
        method: "POST",
        body: { action: "delete", collections: ["users"] },
      });

      const response = await POST(request);
      const { status, body } = await parseResponse(response);

      expect(status).toBe(200);
      expect(body.success).toBe(true);

      // Should delete Auth user
      expect(mockAuth.deleteUser).toHaveBeenCalledWith("test-user-1");

      // Should delete Firestore document
      expect(mockDocRef.delete).toHaveBeenCalled();
      expect(body.details.deleted).toBe(1);
    });

    it("should handle missing Auth users gracefully", async () => {
      mockAuth.getUser.mockRejectedValue({ code: "auth/user-not-found" });
      mockDocSnapshot.exists = true;

      const request = buildRequest("/api/demo/seed", {
        method: "POST",
        body: { action: "delete", collections: ["users"] },
      });

      const response = await POST(request);
      const { status, body } = await parseResponse(response);

      expect(status).toBe(200);
      expect(body.success).toBe(true);

      // Should not try to delete non-existent Auth user
      expect(mockAuth.deleteUser).not.toHaveBeenCalled();

      // Should still delete Firestore document
      expect(mockDocRef.delete).toHaveBeenCalled();
    });

    it("should delete siteSettings singleton by global ID", async () => {
      mockDocSnapshot.exists = true;

      const request = buildRequest("/api/demo/seed", {
        method: "POST",
        body: { action: "delete", collections: ["siteSettings"] },
      });

      const response = await POST(request);
      const { status, body } = await parseResponse(response);

      expect(status).toBe(200);
      expect(body.success).toBe(true);

      // Should use 'global' as doc ID
      expect(mockCollectionRef.doc).toHaveBeenCalledWith("global");
      expect(mockDocRef.delete).toHaveBeenCalled();
    });
  });

  describe("Error Handling", () => {
    it("should track errors and continue processing", async () => {
      mockDocRef.set.mockRejectedValueOnce(new Error("Firestore error"));

      const request = buildRequest("/api/demo/seed", {
        method: "POST",
        body: { action: "load", collections: ["categories"] },
      });

      const response = await POST(request);
      const { status, body } = await parseResponse(response);

      expect(status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.details.errors).toBeGreaterThan(0);
    });

    it("should handle malformed request body", async () => {
      const request = buildRequest("/api/demo/seed", {
        method: "POST",
        body: null,
      });

      const response = await POST(request);
      const { status, body } = await parseResponse(response);

      expect(status).toBeGreaterThanOrEqual(400);
      expect(body.success).toBe(false);
    });
  });

  describe("Response Format", () => {
    it("should return detailed metrics for load", async () => {
      mockDocSnapshot.exists = false;

      const request = buildRequest("/api/demo/seed", {
        method: "POST",
        body: { action: "load", collections: ["categories", "products"] },
      });

      const response = await POST(request);
      const { body } = await parseResponse(response);

      expect(body).toHaveProperty("success");
      expect(body).toHaveProperty("message");
      expect(body).toHaveProperty("details");
      expect(body.details).toHaveProperty("created");
      expect(body.details).toHaveProperty("updated");
      expect(body.details).toHaveProperty("errors");
      expect(body.details).toHaveProperty("collections");
    });

    it("should return detailed metrics for delete", async () => {
      mockDocSnapshot.exists = true;

      const request = buildRequest("/api/demo/seed", {
        method: "POST",
        body: { action: "delete", collections: ["categories"] },
      });

      const response = await POST(request);
      const { body } = await parseResponse(response);

      expect(body).toHaveProperty("success");
      expect(body).toHaveProperty("message");
      expect(body).toHaveProperty("details");
      expect(body.details).toHaveProperty("deleted");
      expect(body.details).toHaveProperty("skipped");
      expect(body.details).toHaveProperty("errors");
      expect(body.details).toHaveProperty("collections");
    });

    it("should include skipped count in delete message when applicable", async () => {
      mockDocSnapshot.exists = false;

      const request = buildRequest("/api/demo/seed", {
        method: "POST",
        body: { action: "delete", collections: ["categories"] },
      });

      const response = await POST(request);
      const { body } = await parseResponse(response);

      expect(body.message).toContain("skipped");
      expect(body.message).toContain("not found");
    });
  });
});
