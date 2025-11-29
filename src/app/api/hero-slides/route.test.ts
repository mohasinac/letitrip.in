/**
 * @jest-environment node
 */
import { NextRequest, NextResponse } from "next/server";
import { GET, POST } from "./route";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import {
  getUserFromRequest,
  requireRole,
} from "@/app/api/middleware/rbac-auth";
import { COLLECTIONS } from "@/constants/database";

jest.mock("@/app/api/lib/firebase/admin");
jest.mock("@/app/api/middleware/rbac-auth");

const mockGetFirestoreAdmin = getFirestoreAdmin as jest.MockedFunction<
  typeof getFirestoreAdmin
>;
const mockGetUserFromRequest = getUserFromRequest as jest.MockedFunction<
  typeof getUserFromRequest
>;
const mockRequireRole = requireRole as jest.MockedFunction<typeof requireRole>;

describe("GET /api/hero-slides", () => {
  let mockDb: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockDb = {
      collection: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      get: jest.fn(),
    };

    mockGetFirestoreAdmin.mockReturnValue(mockDb);
  });

  it("should return only active slides for public users", async () => {
    mockGetUserFromRequest.mockResolvedValue(null);

    const mockSlides = [
      {
        id: "slide1",
        data: () => ({
          title: "Slide 1",
          subtitle: "Subtitle 1",
          description: "Description 1",
          image_url: "https://example.com/image1.jpg",
          link_url: "/shop",
          cta_text: "Shop Now",
          position: 1,
          is_active: true,
        }),
      },
      {
        id: "slide2",
        data: () => ({
          title: "Slide 2",
          subtitle: "Subtitle 2",
          image_url: "https://example.com/image2.jpg",
          position: 2,
          is_active: true,
        }),
      },
    ];

    mockDb.get.mockResolvedValue({ docs: mockSlides });

    const req = new NextRequest("http://localhost/api/hero-slides");
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.slides).toHaveLength(2);
    expect(mockDb.where).toHaveBeenCalledWith("is_active", "==", true);
    expect(mockDb.orderBy).toHaveBeenCalledWith("position", "asc");

    // Check public response format
    expect(data.slides[0]).toHaveProperty("image");
    expect(data.slides[0]).toHaveProperty("ctaText");
    expect(data.slides[0]).toHaveProperty("ctaLink");
    expect(data.slides[0]).not.toHaveProperty("image_url");
  });

  it("should return all slides with full data for admin", async () => {
    mockGetUserFromRequest.mockResolvedValue({
      uid: "admin1",
      email: "admin@test.com",
      role: "admin",
    } as any);

    const mockSlides = [
      {
        id: "slide1",
        data: () => ({
          title: "Active Slide",
          image_url: "https://example.com/active.jpg",
          position: 1,
          is_active: true,
          created_at: "2024-01-01",
          updated_at: "2024-01-15",
        }),
      },
      {
        id: "slide2",
        data: () => ({
          title: "Inactive Slide",
          image_url: "https://example.com/inactive.jpg",
          position: 2,
          is_active: false,
          created_at: "2024-01-02",
          updated_at: "2024-01-10",
        }),
      },
    ];

    mockDb.get.mockResolvedValue({ docs: mockSlides });

    const req = new NextRequest("http://localhost/api/hero-slides");
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.slides).toHaveLength(2);
    // Admin should not filter by is_active
    expect(mockDb.where).not.toHaveBeenCalled();

    // Check admin response format
    expect(data.slides[0]).toHaveProperty("image_url");
    expect(data.slides[0]).toHaveProperty("is_active");
    expect(data.slides[0]).toHaveProperty("created_at");
    expect(data.slides[0]).toHaveProperty("updated_at");
  });

  it("should return empty array on error for public users", async () => {
    mockGetUserFromRequest.mockResolvedValue(null);
    mockDb.get.mockRejectedValue(new Error("Database error"));

    const req = new NextRequest("http://localhost/api/hero-slides");
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.slides).toEqual([]);
  });

  it("should order slides by position", async () => {
    mockGetUserFromRequest.mockResolvedValue(null);
    mockDb.get.mockResolvedValue({ docs: [] });

    const req = new NextRequest("http://localhost/api/hero-slides");
    await GET(req);

    expect(mockDb.orderBy).toHaveBeenCalledWith("position", "asc");
  });
});

describe("POST /api/hero-slides", () => {
  let mockDb: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockDb = {
      collection: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      get: jest.fn(),
      add: jest.fn(),
    };

    mockGetFirestoreAdmin.mockReturnValue(mockDb);
  });

  it("should require admin role", async () => {
    mockRequireRole.mockResolvedValue({
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    } as any);

    const req = new NextRequest("http://localhost/api/hero-slides", {
      method: "POST",
      body: JSON.stringify({
        title: "Test Slide",
        image_url: "https://example.com/image.jpg",
      }),
    });
    const response = await POST(req);

    expect(response.status).toBe(403);
    expect(mockRequireRole).toHaveBeenCalledWith(req, ["admin"]);
  });

  it("should require title and image_url", async () => {
    mockRequireRole.mockResolvedValue({
      user: { uid: "admin1", role: "admin" },
    } as any);

    // Missing both
    const req1 = new NextRequest("http://localhost/api/hero-slides", {
      method: "POST",
      body: JSON.stringify({}),
    });
    const response1 = await POST(req1);
    const data1 = await response1.json();

    expect(response1.status).toBe(400);
    expect(data1.errors).toBeDefined();

    // Missing image_url
    const req2 = new NextRequest("http://localhost/api/hero-slides", {
      method: "POST",
      body: JSON.stringify({ title: "Test" }),
    });
    const response2 = await POST(req2);

    expect(response2.status).toBe(400);
  });

  it("should create slide with auto-increment position", async () => {
    mockRequireRole.mockResolvedValue({
      user: { uid: "admin1", role: "admin" },
    } as any);

    // Mock existing slides with max position 3
    mockDb.get.mockResolvedValue({
      empty: false,
      docs: [{ data: () => ({ position: 3 }) }],
    });

    mockDb.add.mockResolvedValue({ id: "newslide1" });

    const slideData = {
      title: "New Slide",
      image_url: "https://example.com/new.jpg",
      subtitle: "New Subtitle",
      description: "New Description",
      link_url: "/new-page",
      cta_text: "Click Here",
    };

    const req = new NextRequest("http://localhost/api/hero-slides", {
      method: "POST",
      body: JSON.stringify(slideData),
    });
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.slide.id).toBe("newslide1");
    expect(data.slide.title).toBe("New Slide");
    expect(data.slide.position).toBe(4); // max + 1
    expect(data.slide.is_active).toBe(true);
  });

  it("should set position to 1 for first slide", async () => {
    mockRequireRole.mockResolvedValue({
      user: { uid: "admin1", role: "admin" },
    } as any);

    // No existing slides
    mockDb.get.mockResolvedValue({ empty: true, docs: [] });
    mockDb.add.mockResolvedValue({ id: "firstslide" });

    const req = new NextRequest("http://localhost/api/hero-slides", {
      method: "POST",
      body: JSON.stringify({
        title: "First Slide",
        image_url: "https://example.com/first.jpg",
      }),
    });
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.slide.position).toBe(1);
  });

  it("should allow custom position", async () => {
    mockRequireRole.mockResolvedValue({
      user: { uid: "admin1", role: "admin" },
    } as any);

    mockDb.get.mockResolvedValue({
      empty: false,
      docs: [{ data: () => ({ position: 5 }) }],
    });
    mockDb.add.mockResolvedValue({ id: "slide1" });

    const req = new NextRequest("http://localhost/api/hero-slides", {
      method: "POST",
      body: JSON.stringify({
        title: "Custom Position Slide",
        image_url: "https://example.com/custom.jpg",
        position: 2,
      }),
    });
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.slide.position).toBe(2);
  });

  it("should set default values", async () => {
    mockRequireRole.mockResolvedValue({
      user: { uid: "admin1", role: "admin" },
    } as any);

    mockDb.get.mockResolvedValue({ empty: true, docs: [] });
    mockDb.add.mockResolvedValue({ id: "slide1" });

    const req = new NextRequest("http://localhost/api/hero-slides", {
      method: "POST",
      body: JSON.stringify({
        title: "Minimal Slide",
        image_url: "https://example.com/min.jpg",
      }),
    });
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.slide.subtitle).toBe("");
    expect(data.slide.description).toBe("");
    expect(data.slide.link_url).toBe("");
    expect(data.slide.cta_text).toBe("Shop Now");
    expect(data.slide.is_active).toBe(true);
  });

  it("should allow inactive slides", async () => {
    mockRequireRole.mockResolvedValue({
      user: { uid: "admin1", role: "admin" },
    } as any);

    mockDb.get.mockResolvedValue({ empty: true, docs: [] });
    mockDb.add.mockResolvedValue({ id: "slide1" });

    const req = new NextRequest("http://localhost/api/hero-slides", {
      method: "POST",
      body: JSON.stringify({
        title: "Draft Slide",
        image_url: "https://example.com/draft.jpg",
        is_active: false,
      }),
    });
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.slide.is_active).toBe(false);
  });

  it("should handle database errors", async () => {
    mockRequireRole.mockResolvedValue({
      user: { uid: "admin1", role: "admin" },
    } as any);

    mockDb.get.mockResolvedValue({ empty: true, docs: [] });
    mockDb.add.mockRejectedValue(new Error("Database error"));

    const req = new NextRequest("http://localhost/api/hero-slides", {
      method: "POST",
      body: JSON.stringify({
        title: "Error Slide",
        image_url: "https://example.com/error.jpg",
      }),
    });
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Failed to create hero slide");
  });
});
