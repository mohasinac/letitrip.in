import { PAGINATION } from "@/constants/limits";
import { BLOG_STATUS } from "@/constants/statuses";
import { apiService } from "../api.service";
import type { BlogPost } from "../blog.service";
import { blogService } from "../blog.service";

jest.mock("../api.service");
jest.mock("@/lib/firebase-error-logger");

describe("BlogService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockBlogPost: BlogPost = {
    id: "post1",
    title: "Test Blog Post",
    slug: "test-blog-post",
    excerpt: "This is a test excerpt",
    content: "Full blog post content here",
    featuredImage: "https://example.com/image.jpg",
    author: {
      id: "author1",
      name: "John Doe",
      avatar: "https://example.com/avatar.jpg",
    },
    category: "Technology",
    tags: ["tech", "programming"],
    status: BLOG_STATUS.PUBLISHED,
    featured: true,
    publishedAt: new Date("2024-01-15"),
    createdAt: new Date("2024-01-10"),
    updatedAt: new Date("2024-01-15"),
    views: 100,
    likes: 25,
  };

  describe("list", () => {
    it("lists all blog posts without filters", async () => {
      const mockResponse = {
        data: [mockBlogPost],
        count: 1,
        pagination: { page: 1, pageSize: 20 },
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await blogService.list();

      expect(apiService.get).toHaveBeenCalledWith("/blog");
      expect(result.data).toHaveLength(1);
      expect(result.count).toBe(1);
    });

    it("lists blog posts with category filter", async () => {
      const mockResponse = {
        data: [mockBlogPost],
        count: 1,
        pagination: { page: 1, pageSize: 20 },
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      await blogService.list({ category: "Technology" });

      expect(apiService.get).toHaveBeenCalledWith("/blog?category=Technology");
    });

    it("lists blog posts with pagination", async () => {
      const mockResponse = {
        data: [mockBlogPost],
        count: 50,
        pagination: { page: 2, pageSize: 20 },
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      await blogService.list({ page: 2, limit: 20 });

      expect(apiService.get).toHaveBeenCalledWith("/blog?page=2&limit=20");
    });

    it("lists featured blog posts only", async () => {
      const mockResponse = {
        data: [mockBlogPost],
        count: 5,
        pagination: { page: 1, pageSize: 20 },
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      await blogService.list({ featured: true });

      expect(apiService.get).toHaveBeenCalledWith("/blog?featured=true");
    });

    it("lists blog posts with search query", async () => {
      const mockResponse = {
        data: [mockBlogPost],
        count: 3,
        pagination: { page: 1, pageSize: 20 },
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      await blogService.list({ search: "programming" });

      expect(apiService.get).toHaveBeenCalledWith("/blog?search=programming");
    });

    it("returns empty data when no posts found", async () => {
      const mockResponse = {
        data: [],
        count: 0,
        pagination: { page: 1, pageSize: 20 },
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await blogService.list();

      expect(result.data).toEqual([]);
      expect(result.count).toBe(0);
    });
  });

  describe("getById", () => {
    it("gets blog post by ID", async () => {
      (apiService.get as jest.Mock).mockResolvedValue(mockBlogPost);

      const result = await blogService.getById("post1");

      expect(apiService.get).toHaveBeenCalledWith("/blog/post1");
      expect(result.id).toBe("post1");
      expect(result.title).toBe("Test Blog Post");
    });

    it("handles not found error", async () => {
      const error = new Error("Blog post not found");
      (apiService.get as jest.Mock).mockRejectedValue(error);

      await expect(blogService.getById("invalid")).rejects.toThrow(
        "Blog post not found"
      );
    });
  });

  describe("getBySlug", () => {
    it("gets blog post by slug", async () => {
      (apiService.get as jest.Mock).mockResolvedValue(mockBlogPost);

      const result = await blogService.getBySlug("test-blog-post");

      expect(apiService.get).toHaveBeenCalledWith("/blog/slug/test-blog-post");
      expect(result.slug).toBe("test-blog-post");
    });

    it("handles invalid slug", async () => {
      const error = new Error("Blog post not found");
      (apiService.get as jest.Mock).mockRejectedValue(error);

      await expect(blogService.getBySlug("invalid-slug")).rejects.toThrow();
    });
  });

  describe("create", () => {
    it("creates new blog post", async () => {
      const createData = {
        title: "New Post",
        slug: "new-post",
        excerpt: "New post excerpt",
        content: "Full content",
        category: "Technology",
        tags: ["tech"],
        status: BLOG_STATUS.DRAFT,
        featured: false,
      };

      const mockCreatedPost = { ...mockBlogPost, ...createData };
      (apiService.post as jest.Mock).mockResolvedValue(mockCreatedPost);

      const result = await blogService.create(createData as any);

      expect(apiService.post).toHaveBeenCalledWith("/blog", createData);
      expect(result.title).toBe("New Post");
    });

    it("creates published blog post", async () => {
      const createData = {
        title: "Published Post",
        slug: "published-post",
        excerpt: "Published excerpt",
        content: "Content",
        category: "News",
        status: BLOG_STATUS.PUBLISHED,
        publishedAt: new Date(),
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockBlogPost);

      await blogService.create(createData as any);

      expect(apiService.post).toHaveBeenCalledWith("/blog", createData);
    });
  });

  describe("update", () => {
    it("updates blog post", async () => {
      const updateData = {
        title: "Updated Title",
        excerpt: "Updated excerpt",
      };

      const updatedPost = { ...mockBlogPost, ...updateData };
      (apiService.patch as jest.Mock).mockResolvedValue(updatedPost);

      const result = await blogService.update("post1", updateData);

      expect(apiService.patch).toHaveBeenCalledWith("/blog/post1", updateData);
      expect(result.title).toBe("Updated Title");
    });

    it("updates blog post status", async () => {
      const updateData = {
        status: BLOG_STATUS.PUBLISHED,
        publishedAt: new Date(),
      };

      (apiService.patch as jest.Mock).mockResolvedValue(mockBlogPost);

      await blogService.update("post1", updateData);

      expect(apiService.patch).toHaveBeenCalledWith("/blog/post1", updateData);
    });
  });

  describe("delete", () => {
    it("deletes blog post", async () => {
      const mockResponse = { message: "Blog post deleted successfully" };
      (apiService.delete as jest.Mock).mockResolvedValue(mockResponse);

      const result = await blogService.delete("post1");

      expect(apiService.delete).toHaveBeenCalledWith("/blog/post1");
      expect(result.message).toContain("deleted");
    });
  });

  describe("getFeatured", () => {
    it("gets featured blog posts", async () => {
      const mockResponse = {
        data: [mockBlogPost],
        count: 1,
        pagination: {},
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await blogService.getFeatured();

      expect(apiService.get).toHaveBeenCalledWith(
        "/blog?featured=true&status=published&limit=100"
      );
      expect(result).toHaveLength(1);
      expect(result[0].featured).toBe(true);
    });

    it("returns empty array when no featured posts", async () => {
      const mockResponse = {
        data: [],
        count: 0,
        pagination: {},
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await blogService.getFeatured();

      expect(result).toEqual([]);
    });
  });

  describe("getHomepage", () => {
    it("gets homepage blog posts", async () => {
      const mockResponse = {
        data: [mockBlogPost],
        count: 1,
        pagination: {},
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await blogService.getHomepage();

      expect(apiService.get).toHaveBeenCalledWith(
        `/blog?featured=true&status=published&limit=${PAGINATION.DEFAULT_PAGE_SIZE}`
      );
      expect(result).toHaveLength(1);
    });
  });

  describe("toggleLike", () => {
    it("likes a blog post", async () => {
      const mockResponse = { liked: true, likes: 26 };
      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await blogService.toggleLike("post1");

      expect(apiService.post).toHaveBeenCalledWith("/blog/post1/like", {});
      expect(result.liked).toBe(true);
      expect(result.likes).toBe(26);
    });

    it("unlikes a blog post", async () => {
      const mockResponse = { liked: false, likes: 24 };
      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await blogService.toggleLike("post1");

      expect(result.liked).toBe(false);
      expect(result.likes).toBe(24);
    });
  });

  describe("getRelated", () => {
    it("gets related blog posts", async () => {
      const relatedPosts = [
        { ...mockBlogPost, id: "post2", title: "Related Post 1" },
        { ...mockBlogPost, id: "post3", title: "Related Post 2" },
      ];

      (apiService.get as jest.Mock).mockResolvedValue(relatedPosts);

      const result = await blogService.getRelated("post1");

      expect(apiService.get).toHaveBeenCalledWith("/blog/post1/related");
      expect(result).toHaveLength(2);
    });

    it("gets related posts with limit", async () => {
      (apiService.get as jest.Mock).mockResolvedValue([mockBlogPost]);

      await blogService.getRelated("post1", 5);

      expect(apiService.get).toHaveBeenCalledWith(
        "/blog/post1/related?limit=5"
      );
    });
  });

  describe("getByCategory", () => {
    it("gets posts by category", async () => {
      const mockResponse = {
        data: [mockBlogPost],
        count: 5,
        pagination: {},
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await blogService.getByCategory("Technology");

      expect(apiService.get).toHaveBeenCalledWith(
        "/blog?category=Technology&status=published"
      );
      expect(result.data).toHaveLength(1);
    });

    it("gets posts by category with pagination", async () => {
      const mockResponse = {
        data: [mockBlogPost],
        count: 20,
        pagination: {},
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      await blogService.getByCategory("Technology", 2, 10);

      expect(apiService.get).toHaveBeenCalledWith(
        "/blog?category=Technology&status=published&page=2&limit=10"
      );
    });
  });

  describe("getByTag", () => {
    it("gets posts by tag", async () => {
      const mockResponse = {
        data: [mockBlogPost],
        count: 3,
        pagination: {},
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await blogService.getByTag("programming");

      expect(apiService.get).toHaveBeenCalledWith(
        "/blog?tag=programming&status=published"
      );
      expect(result.data).toHaveLength(1);
    });
  });

  describe("getByAuthor", () => {
    it("gets posts by author", async () => {
      const mockResponse = {
        data: [mockBlogPost],
        count: 10,
        pagination: {},
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await blogService.getByAuthor("author1");

      expect(apiService.get).toHaveBeenCalledWith(
        "/blog?author=author1&status=published"
      );
      expect(result.data).toHaveLength(1);
    });
  });

  describe("search", () => {
    it("searches blog posts", async () => {
      const mockResponse = {
        data: [mockBlogPost],
        count: 1,
        pagination: {},
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await blogService.search("test query");

      expect(apiService.get).toHaveBeenCalledWith(
        "/blog?search=test+query&status=published"
      );
      expect(result.data).toHaveLength(1);
    });

    it("searches with pagination", async () => {
      const mockResponse = {
        data: [mockBlogPost],
        count: 15,
        pagination: {},
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      await blogService.search("programming", 1, 10);

      expect(apiService.get).toHaveBeenCalledWith(
        "/blog?search=programming&status=published&page=1&limit=10"
      );
    });
  });

  describe("error handling", () => {
    it("handles API errors in list", async () => {
      const error = new Error("API Error");
      (apiService.get as jest.Mock).mockRejectedValue(error);

      await expect(blogService.list()).rejects.toThrow("API Error");
    });

    it("handles API errors in create", async () => {
      const error = new Error("Create failed");
      (apiService.post as jest.Mock).mockRejectedValue(error);

      await expect(
        blogService.create({
          title: "Test",
          slug: "test",
          excerpt: "test",
          content: "test",
          category: "test",
          status: BLOG_STATUS.DRAFT,
        })
      ).rejects.toThrow("Create failed");
    });

    it("handles API errors in update", async () => {
      const error = new Error("Update failed");
      (apiService.patch as jest.Mock).mockRejectedValue(error);

      await expect(
        blogService.update("post1", { title: "New Title" })
      ).rejects.toThrow("Update failed");
    });
  });
});
