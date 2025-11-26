/**
 * @jest-environment node
 */
import { GET, POST } from "./route";
import { GET as GET_SLUG, PATCH, DELETE } from "./[slug]/route";
import { NextRequest } from "next/server";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";

// Mock Firebase config BEFORE imports
jest.mock("../lib/firebase/config", () => ({
  adminAuth: {},
  adminDb: {},
  getFirestoreAdmin: jest.fn(),
}));

jest.mock("@/app/api/lib/firebase/admin");

describe("Blog API", () => {
  const mockGet = jest.fn();
  const mockWhere = jest.fn();
  const mockOrderBy = jest.fn();
  const mockLimit = jest.fn();
  const mockStartAfter = jest.fn();
  const mockDoc = jest.fn();
  const mockAdd = jest.fn();
  const mockUpdate = jest.fn();
  const mockDelete = jest.fn();
  const mockCollection = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    mockStartAfter.mockReturnThis();
    mockLimit.mockReturnThis();
    mockOrderBy.mockReturnThis();
    mockWhere.mockReturnThis();
    mockGet.mockResolvedValue({ docs: [], empty: true });

    const mockRef = {
      get: mockGet,
      update: mockUpdate,
      delete: mockDelete,
    };

    mockDoc.mockReturnValue(mockRef);

    mockCollection.mockReturnValue({
      where: mockWhere,
      orderBy: mockOrderBy,
      limit: mockLimit,
      startAfter: mockStartAfter,
      get: mockGet,
      doc: mockDoc,
      add: mockAdd,
    });

    (getFirestoreAdmin as jest.Mock).mockReturnValue({
      collection: mockCollection,
    });
  });

  describe("GET /api/blog", () => {
    it("should list published posts by default", async () => {
      const mockPosts = [
        {
          id: "post1",
          data: () => ({
            title: "Post 1",
            slug: "post-1",
            status: "published",
          }),
        },
      ];

      mockGet.mockResolvedValue({ docs: mockPosts });

      const req = new NextRequest("http://localhost/api/blog");
      const response = await GET(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(1);
      expect(mockWhere).toHaveBeenCalledWith("status", "==", "published");
    });

    it("should filter by status", async () => {
      mockGet.mockResolvedValue({ docs: [] });

      const req = new NextRequest(
        "http://localhost/api/blog?status=draft"
      );
      await GET(req);

      expect(mockWhere).toHaveBeenCalledWith("status", "==", "draft");
    });

    it("should filter by category", async () => {
      mockGet.mockResolvedValue({ docs: [] });

      const req = new NextRequest(
        "http://localhost/api/blog?category=technology"
      );
      await GET(req);

      expect(mockWhere).toHaveBeenCalledWith("category", "==", "technology");
    });

    it("should filter by featured", async () => {
      mockGet.mockResolvedValue({ docs: [] });

      const req = new NextRequest(
        "http://localhost/api/blog?featured=true"
      );
      await GET(req);

      expect(mockWhere).toHaveBeenCalledWith("is_featured", "==", true);
    });

    it("should sort by publishedAt desc by default", async () => {
      mockGet.mockResolvedValue({ docs: [] });

      const req = new NextRequest("http://localhost/api/blog");
      await GET(req);

      expect(mockOrderBy).toHaveBeenCalledWith("publishedAt", "desc");
    });

    it("should support custom sorting", async () => {
      mockGet.mockResolvedValue({ docs: [] });

      const req = new NextRequest(
        "http://localhost/api/blog?sortBy=view_count&sortOrder=asc"
      );
      await GET(req);

      expect(mockOrderBy).toHaveBeenCalledWith("view_count", "asc");
    });

    it("should support cursor pagination", async () => {
      const mockCursorDoc = {
        exists: true,
        data: () => ({ title: "Cursor Post" }),
      };

      mockGet
        .mockResolvedValueOnce(mockCursorDoc) // cursor doc lookup
        .mockResolvedValueOnce({ docs: [] }); // actual query

      const req = new NextRequest(
        "http://localhost/api/blog?startAfter=post1&limit=10"
      );
      await GET(req);

      expect(mockDoc).toHaveBeenCalledWith("post1");
      expect(mockStartAfter).toHaveBeenCalledWith(mockCursorDoc);
      expect(mockLimit).toHaveBeenCalledWith(11); // limit + 1
    });

    it("should return hasNextPage when more results exist", async () => {
      const mockPosts = Array.from({ length: 21 }, (_, i) => ({
        id: `post${i}`,
        data: () => ({ title: `Post ${i}` }),
      }));

      mockGet.mockResolvedValue({ docs: mockPosts });

      const req = new NextRequest(
        "http://localhost/api/blog?limit=20"
      );
      const response = await GET(req);
      const data = await response.json();

      expect(data.data).toHaveLength(20);
      expect(data.pagination.hasNextPage).toBe(true);
      expect(data.pagination.nextCursor).toBe("post19");
    });

    it("should handle database errors", async () => {
      mockGet.mockRejectedValue(new Error("Database error"));

      const req = new NextRequest("http://localhost/api/blog");
      const response = await GET(req);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Failed to fetch blog posts");
    });
  });

  describe("POST /api/blog", () => {
    it("should create a blog post", async () => {
      mockGet.mockResolvedValue({ empty: true });
      mockAdd.mockResolvedValue({ id: "new-post" });

      const req = new NextRequest("http://localhost/api/blog", {
        method: "POST",
        body: JSON.stringify({
          title: "New Post",
          slug: "new-post",
          content: "Post content",
        }),
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(200); // Route returns 200 for success
      expect(data.id).toBe("new-post");
      expect(data.title).toBe("New Post");
      expect(mockAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "New Post",
          slug: "new-post",
          content: "Post content",
        })
      );
    });

    it("should require title, slug, and content", async () => {
      const req = new NextRequest("http://localhost/api/blog", {
        method: "POST",
        body: JSON.stringify({ title: "Incomplete" }),
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain("Missing required fields");
    });

    it("should reject duplicate slugs", async () => {
      mockGet.mockResolvedValue({
        empty: false,
        docs: [{ id: "existing", data: () => ({ slug: "existing-post" }) }],
      });

      const req = new NextRequest("http://localhost/api/blog", {
        method: "POST",
        body: JSON.stringify({
          title: "Duplicate",
          slug: "existing-post",
          content: "Content",
        }),
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain("slug already exists");
    });

    it("should set default values", async () => {
      mockGet.mockResolvedValue({ empty: true });
      mockAdd.mockResolvedValue({ id: "new-post" });

      const req = new NextRequest("http://localhost/api/blog", {
        method: "POST",
        body: JSON.stringify({
          title: "New Post",
          slug: "new-post",
          content: "Content",
        }),
      });

      await POST(req);

      expect(mockAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "draft",
          is_featured: false,
          views: 0,
          excerpt: "",
          category: "Uncategorized",
          tags: [],
        })
      );
    });
  });

  describe("GET /api/blog/[slug]", () => {
    it("should retrieve a blog post by slug", async () => {
      const mockPost = {
        id: "post1",
        data: () => ({ title: "Post 1", slug: "post-1", views: 5 }),
        ref: { update: mockUpdate },
      };

      mockGet.mockResolvedValue({ empty: false, docs: [mockPost] });

      const req = new NextRequest("http://localhost/api/blog/post-1");
      const response = await GET_SLUG(req, {
        params: Promise.resolve({ slug: "post-1" }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.id).toBe("post1");
      expect(data.title).toBe("Post 1");
      expect(mockUpdate).toHaveBeenCalledWith({ views: 6 });
    });

    it("should return 404 for non-existent post", async () => {
      mockGet.mockResolvedValue({ empty: true });

      const req = new NextRequest("http://localhost/api/blog/invalid");
      const response = await GET_SLUG(req, {
        params: Promise.resolve({ slug: "invalid" }),
      });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe("Blog post not found");
    });

    it("should handle database errors", async () => {
      mockGet.mockRejectedValue(new Error("Database error"));

      const req = new NextRequest("http://localhost/api/blog/test");
      const response = await GET_SLUG(req, {
        params: Promise.resolve({ slug: "test" }),
      });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Failed to fetch blog post");
    });
  });

  describe("PATCH /api/blog/[slug]", () => {
    it("should update a blog post", async () => {
      const mockPost = {
        id: "post1",
        data: () => ({ title: "Old Title", status: "draft" }),
        ref: { update: mockUpdate },
      };

      mockGet.mockResolvedValue({ empty: false, docs: [mockPost] });

      const req = new NextRequest("http://localhost/api/blog/post-1", {
        method: "PATCH",
        body: JSON.stringify({ title: "New Title" }),
      });

      const response = await PATCH(req, {
        params: Promise.resolve({ slug: "post-1" }),
      });

      expect(response.status).toBe(200);
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "New Title",
          updatedAt: expect.any(String),
        })
      );
    });

    it("should set publishedAt when changing to published", async () => {
      const mockPost = {
        id: "post1",
        data: () => ({ title: "Draft Post", status: "draft" }),
        ref: { update: mockUpdate },
      };

      mockGet.mockResolvedValue({ empty: false, docs: [mockPost] });

      const req = new NextRequest("http://localhost/api/blog/post-1", {
        method: "PATCH",
        body: JSON.stringify({ status: "published" }),
      });

      await PATCH(req, {
        params: Promise.resolve({ slug: "post-1" }),
      });

      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "published",
          publishedAt: expect.any(String),
        })
      );
    });

    it("should return 404 for non-existent post", async () => {
      mockGet.mockResolvedValue({ empty: true });

      const req = new NextRequest("http://localhost/api/blog/invalid", {
        method: "PATCH",
        body: JSON.stringify({ title: "Updated" }),
      });

      const response = await PATCH(req, {
        params: Promise.resolve({ slug: "invalid" }),
      });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe("Blog post not found");
    });
  });

  describe("DELETE /api/blog/[slug]", () => {
    it("should delete a blog post", async () => {
      const mockPost = {
        id: "post1",
        data: () => ({ title: "Post to Delete" }),
        ref: { delete: mockDelete },
      };

      mockGet.mockResolvedValue({ empty: false, docs: [mockPost] });

      const req = new NextRequest("http://localhost/api/blog/post-1");
      const response = await DELETE(req, {
        params: Promise.resolve({ slug: "post-1" }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockDelete).toHaveBeenCalled();
    });

    it("should return 404 for non-existent post", async () => {
      mockGet.mockResolvedValue({ empty: true });

      const req = new NextRequest("http://localhost/api/blog/invalid");
      const response = await DELETE(req, {
        params: Promise.resolve({ slug: "invalid" }),
      });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe("Blog post not found");
    });
  });
});
