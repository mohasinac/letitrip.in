import { render, screen } from "@testing-library/react";
import { BlogArticlesSection } from "../BlogArticlesSection";
import type { BlogPostDocument } from "@/db/schema";

// Mock hooks and services
const mockUseApiQuery = jest.fn();
jest.mock("@/hooks", () => ({
  useApiQuery: (...args: unknown[]) => mockUseApiQuery(...args),
}));
jest.mock("@/services", () => ({
  blogService: { getFeatured: jest.fn() },
}));

const mockPost = (
  overrides: Partial<BlogPostDocument> = {},
): BlogPostDocument => ({
  id: "post-1",
  title: "Test Post",
  slug: "test-post",
  excerpt: "A short excerpt about the post.",
  content: "<p>Full content</p>",
  coverImage: "https://example.com/img.jpg",
  category: "guides" as BlogPostDocument["category"],
  tags: [],
  isFeatured: true,
  status: "published" as BlogPostDocument["status"],
  publishedAt: new Date("2026-02-01T00:00:00Z"),
  authorId: "user-1",
  authorName: "Jane Doe",
  readTimeMinutes: 5,
  views: 100,
  createdAt: new Date("2026-02-01T00:00:00Z"),
  updatedAt: new Date("2026-02-01T00:00:00Z"),
  ...overrides,
});

describe("BlogArticlesSection", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ====================================
  // Empty / Loading States
  // ====================================
  describe("Empty and loading states", () => {
    it("returns null while loading", () => {
      mockUseApiQuery.mockReturnValue({ data: undefined, isLoading: true });
      const { container } = render(<BlogArticlesSection />);
      expect(container.firstChild).toBeNull();
    });

    it("returns null when no featured posts exist", () => {
      mockUseApiQuery.mockReturnValue({
        data: { posts: [], meta: { total: 0, page: 1, pageSize: 4 } },
        isLoading: false,
      });
      const { container } = render(<BlogArticlesSection />);
      expect(container.firstChild).toBeNull();
    });
  });

  // ====================================
  // Rendering with data
  // ====================================
  describe("Rendering", () => {
    beforeEach(() => {
      mockUseApiQuery.mockReturnValue({
        data: {
          posts: [
            mockPost({
              id: "p1",
              title: "First Post",
              excerpt: "About the first post.",
              category: "guides" as BlogPostDocument["category"],
              readTimeMinutes: 5,
              publishedAt: new Date("2026-02-01T00:00:00Z"),
              coverImage: "https://example.com/1.jpg",
            }),
            mockPost({
              id: "p2",
              title: "Second Post",
              excerpt: "About the second post.",
              category: "auctions" as BlogPostDocument["category"],
              readTimeMinutes: 7,
              publishedAt: new Date("2026-01-15T00:00:00Z"),
              coverImage: undefined,
            }),
          ],
          meta: { total: 2, page: 1, pageSize: 4 },
        },
        isLoading: false,
      });
    });

    it("renders the section", () => {
      render(<BlogArticlesSection />);
      expect(screen.getByText("From Our Blog")).toBeInTheDocument();
    });

    it("renders the heading as h2", () => {
      render(<BlogArticlesSection />);
      const heading = screen.getByRole("heading", { level: 2 });
      expect(heading).toBeTruthy();
    });

    it("renders as a section element", () => {
      const { container } = render(<BlogArticlesSection />);
      expect(container.querySelector("section")).toBeInTheDocument();
    });

    it("renders article titles from API data", () => {
      render(<BlogArticlesSection />);
      expect(screen.getByText("First Post")).toBeInTheDocument();
      expect(screen.getByText("Second Post")).toBeInTheDocument();
    });

    it("renders article excerpts", () => {
      render(<BlogArticlesSection />);
      expect(screen.getByText("About the first post.")).toBeInTheDocument();
      expect(screen.getByText("About the second post.")).toBeInTheDocument();
    });

    it("renders category badges", () => {
      render(<BlogArticlesSection />);
      expect(screen.getByText("guides")).toBeInTheDocument();
      expect(screen.getByText("auctions")).toBeInTheDocument();
    });

    it("renders read time for each article", () => {
      render(<BlogArticlesSection />);
      expect(screen.getByText("5 min")).toBeInTheDocument();
      expect(screen.getByText("7 min")).toBeInTheDocument();
    });

    it("renders article cards as clickable buttons", () => {
      render(<BlogArticlesSection />);
      const buttons = screen.getAllByRole("button");
      // 2 article cards + at least 1 "View All" button
      expect(buttons.length).toBeGreaterThanOrEqual(3);
    });

    it("renders article headings as h3", () => {
      render(<BlogArticlesSection />);
      const headings = screen.getAllByRole("heading", { level: 3 });
      expect(headings).toHaveLength(2);
    });
  });

  // ====================================
  // Images
  // ====================================
  describe("Article Images", () => {
    it("renders cover image when present", () => {
      mockUseApiQuery.mockReturnValue({
        data: {
          posts: [
            mockPost({
              id: "p1",
              title: "With Image",
              coverImage: "https://example.com/img.jpg",
            }),
          ],
          meta: { total: 1, page: 1, pageSize: 4 },
        },
        isLoading: false,
      });
      render(<BlogArticlesSection />);
      const img = screen.getByRole("img");
      expect(img).toHaveAttribute("alt", "With Image");
    });

    it("renders placeholder icon when coverImage is absent", () => {
      mockUseApiQuery.mockReturnValue({
        data: {
          posts: [
            mockPost({ id: "p1", title: "No Image", coverImage: undefined }),
          ],
          meta: { total: 1, page: 1, pageSize: 4 },
        },
        isLoading: false,
      });
      render(<BlogArticlesSection />);
      expect(screen.queryByRole("img")).toBeNull();
    });
  });

  // ====================================
  // Accessibility
  // ====================================
  describe("Accessibility", () => {
    beforeEach(() => {
      mockUseApiQuery.mockReturnValue({
        data: {
          posts: [
            mockPost({
              id: "p1",
              title: "Accessible Post",
              coverImage: "https://example.com/img.jpg",
            }),
          ],
          meta: { total: 1, page: 1, pageSize: 4 },
        },
        isLoading: false,
      });
    });

    it("images have non-empty alt text", () => {
      render(<BlogArticlesSection />);
      const images = screen.getAllByRole("img");
      images.forEach((img) => {
        expect(img).toHaveAttribute("alt");
        expect(img.getAttribute("alt")).not.toBe("");
      });
    });
  });
});
