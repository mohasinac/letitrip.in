/**
 * @jest-environment node
 */
import { GET, PATCH, POST } from "./route";
import { NextRequest, NextResponse } from "next/server";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { requireRole } from "@/app/api/middleware/rbac-auth";

// Mock Firebase config BEFORE imports
jest.mock("../lib/firebase/config", () => ({
  adminAuth: {},
  adminDb: {},
  getFirestoreAdmin: jest.fn(),
}));

jest.mock("@/app/api/lib/firebase/admin");
jest.mock("@/app/api/middleware/rbac-auth");

describe("Homepage API", () => {
  const mockGet = jest.fn();
  const mockSet = jest.fn();
  const mockDoc = jest.fn();
  const mockCollection = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    const mockRef = {
      get: mockGet,
      set: mockSet,
    };

    mockDoc.mockReturnValue(mockRef);
    mockCollection.mockReturnValue({
      doc: mockDoc,
    });

    (getFirestoreAdmin as jest.Mock).mockReturnValue({
      collection: mockCollection,
    });
  });

  describe("GET /api/homepage", () => {
    it("should return default settings when not configured", async () => {
      mockGet.mockResolvedValue({ exists: false });

      const req = new NextRequest("http://localhost/api/homepage");
      const response = await GET(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.isDefault).toBe(true);
      expect(data.data).toHaveProperty("specialEventBanner");
      expect(data.data).toHaveProperty("heroCarousel");
      expect(data.data).toHaveProperty("sections");
      expect(data.data).toHaveProperty("sectionOrder");
    });

    it("should return custom settings when configured", async () => {
      const mockSettings = {
        specialEventBanner: {
          enabled: false,
          title: "Custom Event",
          content: "Custom content",
        },
        heroCarousel: {
          enabled: true,
          autoPlayInterval: 3000,
        },
        sections: {
          valueProposition: { enabled: true },
          featuredCategories: {
            enabled: true,
            maxCategories: 10,
            productsPerCategory: 5,
          },
        },
        sectionOrder: ["hero", "categories"],
        updatedAt: "2024-01-01T00:00:00Z",
      };

      mockGet.mockResolvedValue({
        exists: true,
        data: () => mockSettings,
      });

      const req = new NextRequest("http://localhost/api/homepage");
      const response = await GET(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.isDefault).toBe(false);
      expect(data.data.specialEventBanner.title).toBe("Custom Event");
    });

    it("should merge custom settings with defaults", async () => {
      mockGet.mockResolvedValue({
        exists: true,
        data: () => ({
          heroCarousel: { enabled: false },
        }),
      });

      const req = new NextRequest("http://localhost/api/homepage");
      const response = await GET(req);
      const data = await response.json();

      expect(data.data.specialEventBanner).toBeDefined(); // From defaults
      expect(data.data.heroCarousel.enabled).toBe(false); // From custom
    });

    it("should handle database errors", async () => {
      mockGet.mockRejectedValue(new Error("Database error"));

      const req = new NextRequest("http://localhost/api/homepage");
      const response = await GET(req);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Failed to fetch homepage settings");
    });
  });

  describe("PATCH /api/homepage", () => {
    it("should require admin role", async () => {
      (requireRole as jest.Mock).mockResolvedValue({
        error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
      });

      const req = new NextRequest("http://localhost/api/homepage", {
        method: "PATCH",
        body: JSON.stringify({ settings: {} }),
      });

      const response = await PATCH(req);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe("Forbidden");
    });

    it("should update homepage settings", async () => {
      (requireRole as jest.Mock).mockResolvedValue({
        user: { uid: "admin1", role: "admin" },
      });

      const newSettings = {
        specialEventBanner: {
          enabled: true,
          title: "New Event",
          content: "New content",
        },
      };

      const req = new NextRequest("http://localhost/api/homepage", {
        method: "PATCH",
        body: JSON.stringify({ settings: newSettings }),
      });

      const response = await PATCH(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockSet).toHaveBeenCalledWith(
        expect.objectContaining({
          specialEventBanner: newSettings.specialEventBanner,
          updatedBy: "admin1",
        }),
        { merge: true }
      );
    });

    it("should accept settings in data field", async () => {
      (requireRole as jest.Mock).mockResolvedValue({
        user: { uid: "admin1", role: "admin" },
      });

      const req = new NextRequest("http://localhost/api/homepage", {
        method: "PATCH",
        body: JSON.stringify({
          data: { heroCarousel: { enabled: false } },
        }),
      });

      const response = await PATCH(req);

      expect(response.status).toBe(200);
      expect(mockSet).toHaveBeenCalled();
    });

    it("should require settings object", async () => {
      (requireRole as jest.Mock).mockResolvedValue({
        user: { uid: "admin1", role: "admin" },
      });

      const req = new NextRequest("http://localhost/api/homepage", {
        method: "PATCH",
        body: JSON.stringify({}),
      });

      const response = await PATCH(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Settings object is required");
    });

    it("should set updatedAt and updatedBy", async () => {
      (requireRole as jest.Mock).mockResolvedValue({
        user: { uid: "admin1", role: "admin" },
      });

      const req = new NextRequest("http://localhost/api/homepage", {
        method: "PATCH",
        body: JSON.stringify({ settings: { heroCarousel: {} } }),
      });

      await PATCH(req);

      expect(mockSet).toHaveBeenCalledWith(
        expect.objectContaining({
          updatedAt: expect.any(String),
          updatedBy: "admin1",
        }),
        { merge: true }
      );
    });
  });

  describe("POST /api/homepage", () => {
    it("should require admin role", async () => {
      (requireRole as jest.Mock).mockResolvedValue({
        error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
      });

      const req = new NextRequest("http://localhost/api/homepage", {
        method: "POST",
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe("Forbidden");
    });

    it("should reset settings to defaults", async () => {
      (requireRole as jest.Mock).mockResolvedValue({
        user: { uid: "admin1", role: "admin" },
      });

      const req = new NextRequest("http://localhost/api/homepage", {
        method: "POST",
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toContain("reset to defaults");
      expect(mockSet).toHaveBeenCalledWith(
        expect.objectContaining({
          specialEventBanner: expect.any(Object),
          heroCarousel: expect.any(Object),
          sections: expect.any(Object),
          updatedBy: "admin1",
        })
      );
    });

    it("should set updatedAt and updatedBy on reset", async () => {
      (requireRole as jest.Mock).mockResolvedValue({
        user: { uid: "admin1", role: "admin" },
      });

      const req = new NextRequest("http://localhost/api/homepage", {
        method: "POST",
      });

      await POST(req);

      expect(mockSet).toHaveBeenCalledWith(
        expect.objectContaining({
          updatedAt: expect.any(String),
          updatedBy: "admin1",
        })
      );
    });
  });
});
