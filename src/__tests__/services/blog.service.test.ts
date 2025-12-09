/**
 * Blog Service Tests
 *
 * Comprehensive test coverage for blog service including:
 * - List blog posts with filters (category, tag, author, search, status, featured)
 * - Get blog post by ID and slug
 * - CRUD operations (create, update, delete)
 * - Like/unlike functionality
 * - Related posts
 * - Discovery (featured, homepage)
 * - Filtering by category, tag, author
 * - Search functionality
 */

import { BLOG_STATUS } from "@/constants/statuses";
import { apiService } from "@/services/api.service";
import { blogService } from "@/services/blog.service";

// Mock apiService
jest.mock("@/services/api.service", () => ({
  apiService: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

describe("BlogService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Mock blog post data
  const mockBlogPost = {
    id: "post1",
    title: "Test Blog Post",
    slug: "test-blog-post",
    excerpt: "This is a test excerpt",
    content: "This is the full content of the blog post",
    featuredImage: "https://example.com/image.jpg",
    author: {
      id: "author1",
      name: "John Doe",
      avatar: "https://example.com/avatar.jpg",
    },
    category: "Technology",
    tags: ["tech", "web"],
    status: BLOG_STATUS.PUBLISHED,
    featured: false,
    publishedAt: new Date("2024-01-01"),
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
    views: 100,
    likes: 10,
  };

  const mockPagination = {
    page: 1,
    limit: 20,
    total: 1,
    totalPages: 1,
  };

  describe("list", () => {
    it("should list blog posts with default params", async () => {
      (apiService.get as jest.Mock).mockResolvedValueOnce({
        data: [mockBlogPost],
        count: 1,
        pagination: mockPagination,
      });

      const result = await blogService.list();

      expect(apiService.get).toHaveBeenCalledWith("/blog");
      expect(result.data).toHaveLength(1);
      expect(result.data[0].id).toBe("post1");
      expect(result.count).toBe(1);
    });

    it("should list blog posts with category filter", async () => {
      (apiService.get as jest.Mock).mockResolvedValueOnce({
        data: [mockBlogPost],
        count: 1,
        pagination: mockPagination,
      });

      const result = await blogService.list({ category: "Technology" });

      expect(apiService.get).toHaveBeenCalledWith("/blog?category=Technology");
      expect(result.data).toHaveLength(1);
    });

    it("should list blog posts with tag filter", async () => {
      (apiService.get as jest.Mock).mockResolvedValueOnce({
        data: [mockBlogPost],
        count: 1,
        pagination: mockPagination,
      });

      const result = await blogService.list({ tag: "tech" });

      expect(apiService.get).toHaveBeenCalledWith("/blog?tag=tech");
      expect(result.data[0].tags).toContain("tech");
    });

    it("should list blog posts with author filter", async () => {
      (apiService.get as jest.Mock).mockResolvedValueOnce({
        data: [mockBlogPost],
        count: 1,
        pagination: mockPagination,
      });

      const result = await blogService.list({ author: "author1" });

      expect(apiService.get).toHaveBeenCalledWith("/blog?author=author1");
      expect(result.data[0].author.id).toBe("author1");
    });

    it("should list blog posts with status filter", async () => {
      (apiService.get as jest.Mock).mockResolvedValueOnce({
        data: [mockBlogPost],
        count: 1,
        pagination: mockPagination,
      });

      const result = await blogService.list({ status: BLOG_STATUS.PUBLISHED });

      expect(apiService.get).toHaveBeenCalledWith("/blog?status=published");
      expect(result.data[0].status).toBe(BLOG_STATUS.PUBLISHED);
    });

    it("should list blog posts with search query", async () => {
      (apiService.get as jest.Mock).mockResolvedValueOnce({
        data: [mockBlogPost],
        count: 1,
        pagination: mockPagination,
      });

      const result = await blogService.list({ search: "test" });

      expect(apiService.get).toHaveBeenCalledWith("/blog?search=test");
      expect(result.data).toHaveLength(1);
    });

    it("should list blog posts with featured filter", async () => {
      const featuredPost = { ...mockBlogPost, featured: true };
      (apiService.get as jest.Mock).mockResolvedValueOnce({
        data: [featuredPost],
        count: 1,
        pagination: mockPagination,
      });

      const result = await blogService.list({ featured: true });

      expect(apiService.get).toHaveBeenCalledWith("/blog?featured=true");
      expect(result.data[0].featured).toBe(true);
    });

    it("should list blog posts with pagination", async () => {
      (apiService.get as jest.Mock).mockResolvedValueOnce({
        data: [],
        count: 0,
        pagination: { ...mockPagination, page: 2 },
      });

      const result = await blogService.list({ page: 2, limit: 10 });

      expect(apiService.get).toHaveBeenCalledWith("/blog?page=2&limit=10");
      expect(result.pagination.page).toBe(2);
    });

    it("should list blog posts with sort options", async () => {
      (apiService.get as jest.Mock).mockResolvedValueOnce({
        data: [mockBlogPost],
        count: 1,
        pagination: mockPagination,
      });

      await blogService.list({ sortBy: "views", sortOrder: "desc" });

      expect(apiService.get).toHaveBeenCalledWith(
        "/blog?sortBy=views&sortOrder=desc"
      );
    });

    it("should handle empty blog post list", async () => {
      (apiService.get as jest.Mock).mockResolvedValueOnce({
        data: [],
        count: 0,
        pagination: { ...mockPagination, total: 0 },
      });

      const result = await blogService.list();

      expect(result.data).toHaveLength(0);
      expect(result.count).toBe(0);
    });

    it("should handle null/undefined data", async () => {
      (apiService.get as jest.Mock).mockResolvedValueOnce({
        data: null,
        count: null,
        pagination: null,
      });

      const result = await blogService.list();

      expect(result.data).toEqual([]);
      expect(result.count).toBe(0);
    });
  });

  describe("getById", () => {
    it("should get blog post by ID", async () => {
      (apiService.get as jest.Mock).mockResolvedValueOnce(mockBlogPost);

      const result = await blogService.getById("post1");

      expect(apiService.get).toHaveBeenCalledWith("/blog/post1");
      expect(result.id).toBe("post1");
      expect(result.title).toBe("Test Blog Post");
    });

    it("should throw error for non-existent post", async () => {
      (apiService.get as jest.Mock).mockRejectedValueOnce(
        new Error("Post not found")
      );

      await expect(blogService.getById("invalid")).rejects.toThrow(
        "Post not found"
      );
    });
  });

  describe("getBySlug", () => {
    it("should get blog post by slug", async () => {
      (apiService.get as jest.Mock).mockResolvedValueOnce(mockBlogPost);

      const result = await blogService.getBySlug("test-blog-post");

      expect(apiService.get).toHaveBeenCalledWith("/blog/slug/test-blog-post");
      expect(result.slug).toBe("test-blog-post");
      expect(result.title).toBe("Test Blog Post");
    });

    it("should throw error for non-existent slug", async () => {
      (apiService.get as jest.Mock).mockRejectedValueOnce(
        new Error("Post not found")
      );

      await expect(blogService.getBySlug("invalid-slug")).rejects.toThrow(
        "Post not found"
      );
    });
  });

  describe("create", () => {
    it("should create draft blog post", async () => {
      const newPost = {
        title: "New Post",
        slug: "new-post",
        excerpt: "New excerpt",
        content: "New content",
        category: "Tech",
        status: BLOG_STATUS.DRAFT,
      };

      (apiService.post as jest.Mock).mockResolvedValueOnce({
        ...mockBlogPost,
        ...newPost,
        id: "post2",
      });

      const result = await blogService.create(newPost);

      expect(apiService.post).toHaveBeenCalledWith("/blog", newPost);
      expect(result.id).toBe("post2");
      expect(result.title).toBe("New Post");
    });

    it("should create published blog post", async () => {
      const newPost = {
        title: "Published Post",
        slug: "published-post",
        excerpt: "Published excerpt",
        content: "Published content",
        category: "Tech",
        status: BLOG_STATUS.PUBLISHED,
        publishedAt: new Date(),
      };

      (apiService.post as jest.Mock).mockResolvedValueOnce({
        ...mockBlogPost,
        ...newPost,
        id: "post3",
      });

      const result = await blogService.create(newPost);

      expect(result.status).toBe(BLOG_STATUS.PUBLISHED);
    });

    it("should create blog post with optional fields", async () => {
      const newPost = {
        title: "Complete Post",
        slug: "complete-post",
        excerpt: "Complete excerpt",
        content: "Complete content",
        featuredImage: "https://example.com/new-image.jpg",
        category: "Tech",
        tags: ["tag1", "tag2"],
        status: BLOG_STATUS.PUBLISHED,
        featured: true,
      };

      (apiService.post as jest.Mock).mockResolvedValueOnce({
        ...mockBlogPost,
        ...newPost,
        id: "post4",
      });

      const result = await blogService.create(newPost);

      expect(result.featuredImage).toBe("https://example.com/new-image.jpg");
      expect(result.tags).toEqual(["tag1", "tag2"]);
      expect(result.featured).toBe(true);
    });

    it("should throw error when creation fails", async () => {
      (apiService.post as jest.Mock).mockRejectedValueOnce(
        new Error("Unauthorized")
      );

      await expect(
        blogService.create({
          title: "Test",
          slug: "test",
          excerpt: "test",
          content: "test",
          category: "test",
          status: BLOG_STATUS.DRAFT,
        })
      ).rejects.toThrow("Unauthorized");
    });
  });

  describe("update", () => {
    it("should update blog post title", async () => {
      const updates = { title: "Updated Title" };
      (apiService.patch as jest.Mock).mockResolvedValueOnce({
        ...mockBlogPost,
        ...updates,
      });

      const result = await blogService.update("post1", updates);

      expect(apiService.patch).toHaveBeenCalledWith("/blog/post1", updates);
      expect(result.title).toBe("Updated Title");
    });

    it("should update blog post content", async () => {
      const updates = { content: "Updated content" };
      (apiService.patch as jest.Mock).mockResolvedValueOnce({
        ...mockBlogPost,
        ...updates,
      });

      const result = await blogService.update("post1", updates);

      expect(result.content).toBe("Updated content");
    });

    it("should update blog post status", async () => {
      const updates = { status: BLOG_STATUS.ARCHIVED };
      (apiService.patch as jest.Mock).mockResolvedValueOnce({
        ...mockBlogPost,
        ...updates,
      });

      const result = await blogService.update("post1", updates);

      expect(result.status).toBe(BLOG_STATUS.ARCHIVED);
    });

    it("should update multiple fields at once", async () => {
      const updates = {
        title: "New Title",
        excerpt: "New excerpt",
        tags: ["newtag"],
        featured: true,
      };
      (apiService.patch as jest.Mock).mockResolvedValueOnce({
        ...mockBlogPost,
        ...updates,
      });

      const result = await blogService.update("post1", updates);

      expect(result.title).toBe("New Title");
      expect(result.excerpt).toBe("New excerpt");
      expect(result.tags).toEqual(["newtag"]);
      expect(result.featured).toBe(true);
    });

    it("should throw error when update unauthorized", async () => {
      (apiService.patch as jest.Mock).mockRejectedValueOnce(
        new Error("Unauthorized")
      );

      await expect(
        blogService.update("post1", { title: "Test" })
      ).rejects.toThrow("Unauthorized");
    });
  });

  describe("delete", () => {
    it("should delete blog post", async () => {
      (apiService.delete as jest.Mock).mockResolvedValueOnce({
        message: "Blog post deleted successfully",
      });

      const result = await blogService.delete("post1");

      expect(apiService.delete).toHaveBeenCalledWith("/blog/post1");
      expect(result.message).toBe("Blog post deleted successfully");
    });

    it("should throw error for non-existent post", async () => {
      (apiService.delete as jest.Mock).mockRejectedValueOnce(
        new Error("Post not found")
      );

      await expect(blogService.delete("invalid")).rejects.toThrow(
        "Post not found"
      );
    });

    it("should throw error when deletion unauthorized", async () => {
      (apiService.delete as jest.Mock).mockRejectedValueOnce(
        new Error("Unauthorized")
      );

      await expect(blogService.delete("post1")).rejects.toThrow("Unauthorized");
    });
  });

  describe("getFeatured", () => {
    it("should get featured blog posts", async () => {
      const featuredPost = { ...mockBlogPost, featured: true };
      (apiService.get as jest.Mock).mockResolvedValueOnce({
        data: [featuredPost],
        count: 1,
        pagination: mockPagination,
      });

      const result = await blogService.getFeatured();

      expect(apiService.get).toHaveBeenCalledWith(
        "/blog?featured=true&status=published&limit=100"
      );
      expect(result).toHaveLength(1);
      expect(result[0].featured).toBe(true);
    });

    it("should return empty array when no featured posts", async () => {
      (apiService.get as jest.Mock).mockResolvedValueOnce({
        data: [],
        count: 0,
        pagination: mockPagination,
      });

      const result = await blogService.getFeatured();

      expect(result).toHaveLength(0);
    });
  });

  describe("getHomepage", () => {
    it("should get homepage blog posts", async () => {
      const featuredPost = { ...mockBlogPost, featured: true };
      (apiService.get as jest.Mock).mockResolvedValueOnce({
        data: [featuredPost],
        count: 1,
        pagination: mockPagination,
      });

      const result = await blogService.getHomepage();

      expect(apiService.get).toHaveBeenCalledWith(
        "/blog?featured=true&status=published&limit=20"
      );
      expect(result).toHaveLength(1);
    });

    it("should return empty array when no homepage posts", async () => {
      (apiService.get as jest.Mock).mockResolvedValueOnce({
        data: [],
        count: 0,
        pagination: mockPagination,
      });

      const result = await blogService.getHomepage();

      expect(result).toHaveLength(0);
    });
  });

  describe("toggleLike", () => {
    it("should like a blog post", async () => {
      (apiService.post as jest.Mock).mockResolvedValueOnce({
        liked: true,
        likes: 11,
      });

      const result = await blogService.toggleLike("post1");

      expect(apiService.post).toHaveBeenCalledWith("/blog/post1/like", {});
      expect(result.liked).toBe(true);
      expect(result.likes).toBe(11);
    });

    it("should unlike a blog post", async () => {
      (apiService.post as jest.Mock).mockResolvedValueOnce({
        liked: false,
        likes: 9,
      });

      const result = await blogService.toggleLike("post1");

      expect(result.liked).toBe(false);
      expect(result.likes).toBe(9);
    });

    it("should throw error when not authenticated", async () => {
      (apiService.post as jest.Mock).mockRejectedValueOnce(
        new Error("Unauthorized")
      );

      await expect(blogService.toggleLike("post1")).rejects.toThrow(
        "Unauthorized"
      );
    });
  });

  describe("getRelated", () => {
    it("should get related posts without limit", async () => {
      const relatedPosts = [
        { ...mockBlogPost, id: "post2", title: "Related Post 1" },
        { ...mockBlogPost, id: "post3", title: "Related Post 2" },
      ];
      (apiService.get as jest.Mock).mockResolvedValueOnce(relatedPosts);

      const result = await blogService.getRelated("post1");

      expect(apiService.get).toHaveBeenCalledWith("/blog/post1/related");
      expect(result).toHaveLength(2);
    });

    it("should get related posts with limit", async () => {
      const relatedPosts = [
        { ...mockBlogPost, id: "post2", title: "Related Post 1" },
      ];
      (apiService.get as jest.Mock).mockResolvedValueOnce(relatedPosts);

      const result = await blogService.getRelated("post1", 1);

      expect(apiService.get).toHaveBeenCalledWith(
        "/blog/post1/related?limit=1"
      );
      expect(result).toHaveLength(1);
    });

    it("should return empty array when no related posts", async () => {
      (apiService.get as jest.Mock).mockResolvedValueOnce([]);

      const result = await blogService.getRelated("post1");

      expect(result).toHaveLength(0);
    });
  });

  describe("getByCategory", () => {
    it("should get posts by category", async () => {
      (apiService.get as jest.Mock).mockResolvedValueOnce({
        data: [mockBlogPost],
        count: 1,
        pagination: mockPagination,
      });

      const result = await blogService.getByCategory("Technology");

      expect(apiService.get).toHaveBeenCalledWith(
        "/blog?category=Technology&status=published"
      );
      expect(result.data[0].category).toBe("Technology");
    });

    it("should get posts by category with pagination", async () => {
      (apiService.get as jest.Mock).mockResolvedValueOnce({
        data: [],
        count: 0,
        pagination: { ...mockPagination, page: 2 },
      });

      await blogService.getByCategory("Technology", 2, 10);

      expect(apiService.get).toHaveBeenCalledWith(
        "/blog?category=Technology&status=published&page=2&limit=10"
      );
    });
  });

  describe("getByTag", () => {
    it("should get posts by tag", async () => {
      (apiService.get as jest.Mock).mockResolvedValueOnce({
        data: [mockBlogPost],
        count: 1,
        pagination: mockPagination,
      });

      const result = await blogService.getByTag("tech");

      expect(apiService.get).toHaveBeenCalledWith(
        "/blog?tag=tech&status=published"
      );
      expect(result.data[0].tags).toContain("tech");
    });

    it("should get posts by tag with pagination", async () => {
      (apiService.get as jest.Mock).mockResolvedValueOnce({
        data: [],
        count: 0,
        pagination: mockPagination,
      });

      await blogService.getByTag("tech", 2, 5);

      expect(apiService.get).toHaveBeenCalledWith(
        "/blog?tag=tech&status=published&page=2&limit=5"
      );
    });
  });

  describe("getByAuthor", () => {
    it("should get posts by author", async () => {
      (apiService.get as jest.Mock).mockResolvedValueOnce({
        data: [mockBlogPost],
        count: 1,
        pagination: mockPagination,
      });

      const result = await blogService.getByAuthor("author1");

      expect(apiService.get).toHaveBeenCalledWith(
        "/blog?author=author1&status=published"
      );
      expect(result.data[0].author.id).toBe("author1");
    });

    it("should get posts by author with pagination", async () => {
      (apiService.get as jest.Mock).mockResolvedValueOnce({
        data: [],
        count: 0,
        pagination: mockPagination,
      });

      await blogService.getByAuthor("author1", 3, 15);

      expect(apiService.get).toHaveBeenCalledWith(
        "/blog?author=author1&status=published&page=3&limit=15"
      );
    });
  });

  describe("search", () => {
    it("should search blog posts", async () => {
      (apiService.get as jest.Mock).mockResolvedValueOnce({
        data: [mockBlogPost],
        count: 1,
        pagination: mockPagination,
      });

      const result = await blogService.search("test");

      expect(apiService.get).toHaveBeenCalledWith(
        "/blog?search=test&status=published"
      );
      expect(result.data).toHaveLength(1);
    });

    it("should search blog posts with pagination", async () => {
      (apiService.get as jest.Mock).mockResolvedValueOnce({
        data: [],
        count: 0,
        pagination: mockPagination,
      });

      await blogService.search("test", 2, 10);

      expect(apiService.get).toHaveBeenCalledWith(
        "/blog?search=test&status=published&page=2&limit=10"
      );
    });

    it("should return empty results for no matches", async () => {
      (apiService.get as jest.Mock).mockResolvedValueOnce({
        data: [],
        count: 0,
        pagination: mockPagination,
      });

      const result = await blogService.search("nonexistent");

      expect(result.data).toHaveLength(0);
    });
  });

  describe("Edge Cases", () => {
    it("should handle API errors gracefully", async () => {
      (apiService.get as jest.Mock).mockRejectedValueOnce(
        new Error("Network error")
      );

      await expect(blogService.list()).rejects.toThrow("Network error");
    });

    it("should handle blog post with missing optional fields", async () => {
      const minimalPost = {
        id: "post5",
        title: "Minimal Post",
        slug: "minimal-post",
        excerpt: "Minimal excerpt",
        content: "Minimal content",
        author: { id: "author1", name: "John Doe" },
        category: "Tech",
        tags: [],
        status: BLOG_STATUS.DRAFT,
        featured: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        views: 0,
        likes: 0,
      };

      (apiService.get as jest.Mock).mockResolvedValueOnce(minimalPost);

      const result = await blogService.getById("post5");

      expect(result.featuredImage).toBeUndefined();
      expect(result.publishedAt).toBeUndefined();
    });

    it("should handle concurrent like operations", async () => {
      (apiService.post as jest.Mock)
        .mockResolvedValueOnce({ liked: true, likes: 11 })
        .mockResolvedValueOnce({ liked: false, likes: 10 });

      const [result1, result2] = await Promise.all([
        blogService.toggleLike("post1"),
        blogService.toggleLike("post1"),
      ]);

      expect(result1.liked).toBe(true);
      expect(result2.liked).toBe(false);
    });

    it("should handle very long search queries", async () => {
      const longQuery = "a".repeat(1000);
      (apiService.get as jest.Mock).mockResolvedValueOnce({
        data: [],
        count: 0,
        pagination: mockPagination,
      });

      await blogService.search(longQuery);

      expect(apiService.get).toHaveBeenCalled();
    });

    it("should handle special characters in slug", async () => {
      (apiService.get as jest.Mock).mockResolvedValueOnce(mockBlogPost);

      await blogService.getBySlug("test-post-with-special-chars-123");

      expect(apiService.get).toHaveBeenCalledWith(
        "/blog/slug/test-post-with-special-chars-123"
      );
    });
  });
});
