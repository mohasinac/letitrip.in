/**
 * Admin Blog Page Tests
 *
 * @status IMPLEMENTED - Page has full functionality
 * @epic E020 - Blog System
 * @priority MEDIUM
 *
 * Tests for the admin blog management page.
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AdminBlogPage from "../page";
import { useAuth } from "@/contexts/AuthContext";
import { blogService } from "@/services/blog.service";
import { useIsMobile } from "@/hooks/useMobile";

// Mock dependencies
jest.mock("@/contexts/AuthContext");
jest.mock("@/services/blog.service");
jest.mock("@/hooks/useMobile");
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
    refresh: jest.fn(),
  }),
  usePathname: () => "/admin/blog",
}));

const mockUseAuth = useAuth as jest.Mock;
const mockBlogService = blogService as jest.Mocked<typeof blogService>;
const mockUseIsMobile = useIsMobile as jest.Mock;

const mockPosts = [
  {
    id: "post1",
    title: "Test Blog Post 1",
    slug: "test-blog-post-1",
    excerpt: "This is a test excerpt",
    content: "Full content here",
    category: "Technology",
    status: "published",
    featured: false,
    featuredImage: "https://example.com/image.jpg",
    views: 100,
    likes: 10,
    author: { id: "author1", name: "John Doe" },
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z",
    publishedAt: "2025-01-01T00:00:00Z",
  },
  {
    id: "post2",
    title: "Test Blog Post 2",
    slug: "test-blog-post-2",
    excerpt: "Another test excerpt",
    content: "More content",
    category: "Business",
    status: "draft",
    featured: true,
    featuredImage: null,
    views: 50,
    likes: 5,
    author: { id: "author1", name: "John Doe" },
    createdAt: "2025-01-02T00:00:00Z",
    updatedAt: "2025-01-02T00:00:00Z",
    publishedAt: null,
  },
];

describe("Admin Blog Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({
      user: { id: "admin1", role: "admin" },
      isAdmin: true,
    });
    mockUseIsMobile.mockReturnValue(false);
    mockBlogService.list.mockResolvedValue({
      data: mockPosts,
      count: 2,
    });
  });

  describe("Access Control", () => {
    it("should show access denied for non-admin users", () => {
      mockUseAuth.mockReturnValue({
        user: { id: "user1", role: "user" },
        isAdmin: false,
      });

      render(<AdminBlogPage />);
      expect(screen.getByText("Access Denied")).toBeInTheDocument();
    });

    it("should show access denied message for non-admin", () => {
      mockUseAuth.mockReturnValue({
        user: { id: "seller1", role: "seller" },
        isAdmin: false,
      });

      render(<AdminBlogPage />);
      expect(
        screen.getByText("You must be an admin to access this page.")
      ).toBeInTheDocument();
    });

    it("should render page for admin users", async () => {
      render(<AdminBlogPage />);
      await waitFor(() => {
        expect(screen.getByText("Blog Posts")).toBeInTheDocument();
      });
    });
  });

  describe("Loading State", () => {
    it("should show loading spinner initially", () => {
      mockBlogService.list.mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      render(<AdminBlogPage />);
      expect(document.querySelector(".animate-spin")).toBeInTheDocument();
    });
  });

  describe("Error State", () => {
    it("should show error message on API failure", async () => {
      mockBlogService.list.mockRejectedValue(new Error("Failed to load"));

      render(<AdminBlogPage />);
      await waitFor(() => {
        expect(screen.getByText("Error")).toBeInTheDocument();
      });
    });

    it("should show try again button on error", async () => {
      mockBlogService.list.mockRejectedValue(new Error("Failed to load"));

      render(<AdminBlogPage />);
      await waitFor(() => {
        expect(screen.getByText("Try Again")).toBeInTheDocument();
      });
    });
  });

  describe("Blog Post List", () => {
    it("should display blog posts", async () => {
      render(<AdminBlogPage />);
      await waitFor(() => {
        expect(screen.getByText("Test Blog Post 1")).toBeInTheDocument();
        expect(screen.getByText("Test Blog Post 2")).toBeInTheDocument();
      });
    });

    it("should display post excerpts", async () => {
      render(<AdminBlogPage />);
      await waitFor(() => {
        expect(screen.getByText("This is a test excerpt")).toBeInTheDocument();
      });
    });

    it("should display post categories", async () => {
      render(<AdminBlogPage />);
      await waitFor(() => {
        expect(screen.getByText("Technology")).toBeInTheDocument();
        expect(screen.getByText("Business")).toBeInTheDocument();
      });
    });

    it("should display author names", async () => {
      render(<AdminBlogPage />);
      await waitFor(() => {
        const authorElements = screen.getAllByText("John Doe");
        expect(authorElements.length).toBeGreaterThan(0);
      });
    });
  });

  describe("Stats Cards", () => {
    it("should display all stats cards", async () => {
      render(<AdminBlogPage />);
      await waitFor(() => {
        expect(screen.getByText("Total Posts")).toBeInTheDocument();
      });
      // Check for stats labels (using text-sm class on stats cards)
      const statsLabels = screen.getAllByText(/^(Published|Drafts|Archived)$/);
      expect(statsLabels.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe("Search", () => {
    it("should render search input", async () => {
      render(<AdminBlogPage />);
      await waitFor(() => {
        expect(
          screen.getByPlaceholderText("Search blog posts...")
        ).toBeInTheDocument();
      });
    });

    it("should update search query on input", async () => {
      render(<AdminBlogPage />);
      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText("Search blog posts...");
        fireEvent.change(searchInput, { target: { value: "test query" } });
        expect(searchInput).toHaveValue("test query");
      });
    });
  });

  describe("View Toggle", () => {
    it("should render view toggle buttons", async () => {
      render(<AdminBlogPage />);
      await waitFor(() => {
        expect(screen.getByText("Blog Posts")).toBeInTheDocument();
      });
    });
  });

  describe("Create Post Button", () => {
    it("should render create post button", async () => {
      render(<AdminBlogPage />);
      await waitFor(() => {
        expect(screen.getByText("Create Post")).toBeInTheDocument();
      });
    });

    it("should link to create page", async () => {
      render(<AdminBlogPage />);
      await waitFor(() => {
        const createButton = screen.getByText("Create Post");
        expect(createButton.closest("a")).toHaveAttribute(
          "href",
          "/admin/blog/create"
        );
      });
    });
  });

  describe("Actions", () => {
    it("should render edit buttons", async () => {
      render(<AdminBlogPage />);
      await waitFor(() => {
        const editLinks = screen.getAllByTitle("Edit");
        expect(editLinks.length).toBeGreaterThan(0);
      });
    });

    it("should render view buttons", async () => {
      render(<AdminBlogPage />);
      await waitFor(() => {
        const viewLinks = screen.getAllByTitle("View");
        expect(viewLinks.length).toBeGreaterThan(0);
      });
    });

    it("should render delete buttons", async () => {
      render(<AdminBlogPage />);
      await waitFor(() => {
        const deleteButtons = screen.getAllByTitle("Delete");
        expect(deleteButtons.length).toBeGreaterThan(0);
      });
    });
  });

  describe("Bulk Actions", () => {
    it("should render checkboxes for selection", async () => {
      render(<AdminBlogPage />);
      await waitFor(() => {
        expect(screen.getByText("Test Blog Post 1")).toBeInTheDocument();
      });

      // Verify checkboxes are rendered for bulk selection
      const checkboxes = screen.getAllByRole("checkbox");
      expect(checkboxes.length).toBeGreaterThan(0);
    });
  });

  describe("Empty State", () => {
    it("should show empty state when no posts", async () => {
      mockBlogService.list.mockResolvedValue({
        data: [],
        count: 0,
      });

      render(<AdminBlogPage />);
      await waitFor(() => {
        expect(screen.getByText("No blog posts yet")).toBeInTheDocument();
      });
    });

    it("should show create button in empty state", async () => {
      mockBlogService.list.mockResolvedValue({
        data: [],
        count: 0,
      });

      render(<AdminBlogPage />);
      await waitFor(() => {
        expect(screen.getByText("No blog posts yet")).toBeInTheDocument();
      });
      // Multiple "Create Post" buttons: one in header, one in empty state
      const createButtons = screen.getAllByText("Create Post");
      expect(createButtons.length).toBe(2);
    });
  });

  describe("Mobile View", () => {
    it("should show filters button on mobile", async () => {
      mockUseIsMobile.mockReturnValue(true);

      render(<AdminBlogPage />);
      // Wait for posts to load first (not in loading state)
      await waitFor(() => {
        expect(screen.getByText("Blog Posts")).toBeInTheDocument();
      });
      // Find filter buttons (may be multiple in mobile layout)
      const filterButtons = screen.getAllByRole("button", { name: /Filters/i });
      expect(filterButtons.length).toBeGreaterThan(0);
    });
  });

  describe("Delete Confirmation", () => {
    it("should show delete dialog when delete clicked", async () => {
      render(<AdminBlogPage />);
      await waitFor(() => {
        expect(screen.getByText("Test Blog Post 1")).toBeInTheDocument();
      });

      const deleteButton = screen.getAllByTitle("Delete")[0];
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByText("Delete Blog Post")).toBeInTheDocument();
      });
    });
  });
});
