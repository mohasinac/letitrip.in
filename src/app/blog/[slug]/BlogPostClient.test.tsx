/// <reference types="@testing-library/jest-dom" />

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useRouter } from "next/navigation";
import BlogPostClient from "./BlogPostClient";
import { blogService } from "@/services/blog.service";

// Mock dependencies
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("@/services/blog.service", () => ({
  blogService: {
    getBySlug: jest.fn(),
    getRelated: jest.fn(),
    toggleLike: jest.fn(),
  },
}));

jest.mock("@/components/cards/BlogCard", () => ({
  BlogCard: ({ title }: any) => <div data-testid="blog-card">{title}</div>,
}));

jest.mock("lucide-react", () => ({
  Calendar: () => <div data-testid="calendar-icon" />,
  User: () => <div data-testid="user-icon" />,
  Clock: () => <div data-testid="clock-icon" />,
  Eye: () => <div data-testid="eye-icon" />,
  Heart: () => <div data-testid="heart-icon" />,
  Share2: () => <div data-testid="share-icon" />,
  ArrowLeft: () => <div data-testid="arrow-icon" />,
  Tag: () => <div data-testid="tag-icon" />,
}));

const mockPost = {
  id: "1",
  title: "Test Blog Post",
  slug: "test-blog-post",
  excerpt: "This is a test excerpt",
  content: "<p>This is the full content of the blog post.</p>",
  author: {
    name: "John Doe",
    avatar: null,
  },
  publishedAt: "2025-01-01T00:00:00Z",
  featuredImage: "/test-image.jpg",
  category: "Technology",
  tags: ["react", "testing"],
  views: 100,
  likes: 50,
};

const mockRelatedPosts = [
  {
    id: "2",
    title: "Related Post 1",
    slug: "related-1",
    excerpt: "Excerpt 1",
    image: "/img1.jpg",
  },
  {
    id: "3",
    title: "Related Post 2",
    slug: "related-2",
    excerpt: "Excerpt 2",
    image: "/img2.jpg",
  },
];

describe("BlogPostClient", () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (blogService.getBySlug as jest.Mock).mockResolvedValue(mockPost);
    (blogService.getRelated as jest.Mock).mockResolvedValue(mockRelatedPosts);
    Object.defineProperty(global.navigator, "clipboard", {
      value: { writeText: jest.fn() },
      writable: true,
    });
    global.alert = jest.fn();
  });

  describe("Loading State", () => {
    it("shows loading skeleton", () => {
      (blogService.getBySlug as jest.Mock).mockImplementation(
        () => new Promise(() => {}),
      );

      render(<BlogPostClient slug="test" />);

      // Loading skeleton doesn't have text, just visual skeleton with animate-pulse
      const pulseElements = document.querySelectorAll(".animate-pulse");
      expect(pulseElements.length).toBeGreaterThan(0);
    });
  });

  describe("Post Display", () => {
    it("fetches and displays blog post", async () => {
      render(<BlogPostClient slug="test-blog-post" />);

      await waitFor(() => {
        expect(blogService.getBySlug).toHaveBeenCalledWith("test-blog-post");
      });

      await waitFor(() => {
        expect(screen.getByText("Test Blog Post")).toBeInTheDocument();
      });
    });

    it("displays post content", async () => {
      render(<BlogPostClient slug="test-blog-post" />);

      await waitFor(() => {
        expect(
          screen.getByText(/this is the full content/i),
        ).toBeInTheDocument();
      });
    });

    it("displays post metadata", async () => {
      render(<BlogPostClient slug="test-blog-post" />);

      await waitFor(() => {
        expect(screen.getByText("John Doe")).toBeInTheDocument();
        expect(screen.getByText("100 views")).toBeInTheDocument(); // views formatted with "views" suffix
        // readTime is calculated from content word count, not a fixed value
        expect(screen.getByText(/min read/)).toBeInTheDocument();
      });
    });

    it("displays post tags", async () => {
      render(<BlogPostClient slug="test-blog-post" />);

      await waitFor(() => {
        // Tags are rendered with # prefix in the component
        expect(screen.getByText(/#react/)).toBeInTheDocument();
        expect(screen.getByText(/#testing/)).toBeInTheDocument();
      });
    });
  });

  describe("Related Posts", () => {
    it("fetches related posts", async () => {
      render(<BlogPostClient slug="test-blog-post" />);

      await waitFor(() => {
        expect(blogService.getRelated).toHaveBeenCalledWith("1", 3);
      });
    });

    it("displays related posts", async () => {
      render(<BlogPostClient slug="test-blog-post" />);

      await waitFor(() => {
        expect(screen.getByText("Related Post 1")).toBeInTheDocument();
        expect(screen.getByText("Related Post 2")).toBeInTheDocument();
      });
    });
  });

  describe("Like Functionality", () => {
    it("handles like button click", async () => {
      (blogService.toggleLike as jest.Mock).mockResolvedValueOnce({});

      render(<BlogPostClient slug="test-blog-post" />);

      await waitFor(() => {
        expect(screen.getByText("Test Blog Post")).toBeInTheDocument();
      });

      const likeButton = screen.getByTestId("heart-icon").closest("button")!;
      fireEvent.click(likeButton);

      await waitFor(() => {
        expect(blogService.toggleLike).toHaveBeenCalledWith("1");
      });
    });

    it("updates like count after liking", async () => {
      (blogService.toggleLike as jest.Mock).mockResolvedValueOnce({});

      render(<BlogPostClient slug="test-blog-post" />);

      await waitFor(() => {
        expect(screen.getByText("50")).toBeInTheDocument();
      });

      const likeButton = screen.getByTestId("heart-icon").closest("button")!;
      fireEvent.click(likeButton);

      await waitFor(() => {
        expect(screen.getByText("51")).toBeInTheDocument();
      });
    });

    it("handles unlike", async () => {
      (blogService.toggleLike as jest.Mock).mockResolvedValueOnce({});

      render(<BlogPostClient slug="test-blog-post" />);

      await waitFor(() => {
        expect(screen.getByText("Test Blog Post")).toBeInTheDocument();
      });

      const likeButton = screen.getByTestId("heart-icon").closest("button")!;

      // First like
      fireEvent.click(likeButton);
      await waitFor(() => {
        expect(screen.getByText("51")).toBeInTheDocument();
      });

      // Then unlike
      fireEvent.click(likeButton);
      await waitFor(() => {
        expect(screen.getByText("50")).toBeInTheDocument();
      });
    });

    it("handles like error gracefully", async () => {
      (blogService.toggleLike as jest.Mock).mockRejectedValueOnce(
        new Error("Like failed"),
      );
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      render(<BlogPostClient slug="test-blog-post" />);

      await waitFor(() => {
        expect(screen.getByText("Test Blog Post")).toBeInTheDocument();
      });

      const likeButton = screen.getByTestId("heart-icon").closest("button")!;
      fireEvent.click(likeButton);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          "Error liking post:",
          expect.any(Error),
        );
      });

      consoleSpy.mockRestore();
    });
  });

  describe("Share Functionality", () => {
    it("uses native share API when available", async () => {
      const mockShare = jest.fn().mockResolvedValue(undefined);
      global.navigator.share = mockShare;

      render(<BlogPostClient slug="test-blog-post" />);

      await waitFor(() => {
        expect(screen.getByText("Test Blog Post")).toBeInTheDocument();
      });

      const shareButton = screen.getByTestId("share-icon").closest("button")!;
      fireEvent.click(shareButton);

      await waitFor(() => {
        expect(mockShare).toHaveBeenCalledWith({
          title: "Test Blog Post",
          text: "This is a test excerpt",
          url: expect.any(String),
        });
      });
    });

    it("falls back to clipboard when share API unavailable", async () => {
      delete (global.navigator as any).share;
      const mockWriteText = jest.fn();
      Object.defineProperty(global.navigator, "clipboard", {
        value: { writeText: mockWriteText },
        writable: true,
      });

      render(<BlogPostClient slug="test-blog-post" />);

      await waitFor(() => {
        expect(screen.getByText("Test Blog Post")).toBeInTheDocument();
      });

      const shareButton = screen.getByTestId("share-icon").closest("button")!;
      fireEvent.click(shareButton);

      expect(mockWriteText).toHaveBeenCalled();
      expect(global.alert).toHaveBeenCalledWith("Link copied to clipboard!");
    });

    it("handles share error gracefully", async () => {
      const mockShare = jest
        .fn()
        .mockRejectedValue(new Error("Share cancelled"));
      global.navigator.share = mockShare;
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      render(<BlogPostClient slug="test-blog-post" />);

      await waitFor(() => {
        expect(screen.getByText("Test Blog Post")).toBeInTheDocument();
      });

      const shareButton = screen.getByTestId("share-icon").closest("button")!;
      fireEvent.click(shareButton);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          "Error sharing:",
          expect.any(Error),
        );
      });

      consoleSpy.mockRestore();
    });
  });

  describe("Error Handling", () => {
    it("shows error message when post not found", async () => {
      (blogService.getBySlug as jest.Mock).mockRejectedValueOnce(
        new Error("Post not found"),
      );

      render(<BlogPostClient slug="non-existent" />);

      await waitFor(() => {
        expect(screen.getByText("Post Not Found")).toBeInTheDocument();
        expect(screen.getByText("Post not found")).toBeInTheDocument();
      });
    });

    it("shows back to blog link on error", async () => {
      (blogService.getBySlug as jest.Mock).mockRejectedValueOnce(
        new Error("Error"),
      );

      render(<BlogPostClient slug="test" />);

      await waitFor(() => {
        const backLink = screen.getByRole("link", { name: /back to blog/i });
        expect(backLink).toBeInTheDocument();
        expect(backLink).toHaveAttribute("href", "/blog");
      });
    });

    it("logs error to console", async () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      (blogService.getBySlug as jest.Mock).mockRejectedValueOnce(
        new Error("Test error"),
      );

      render(<BlogPostClient slug="test" />);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          "Error fetching blog post:",
          expect.any(Error),
        );
      });

      consoleSpy.mockRestore();
    });
  });

  describe("Navigation", () => {
    it("renders back button", async () => {
      render(<BlogPostClient slug="test-blog-post" />);

      await waitFor(() => {
        const backButton = screen.getByTestId("arrow-icon").closest("button");
        expect(backButton).toBeInTheDocument();
      });
    });
  });

  describe("Edge Cases", () => {
    it("handles post without related posts", async () => {
      (blogService.getRelated as jest.Mock).mockResolvedValueOnce([]);

      render(<BlogPostClient slug="test-blog-post" />);

      await waitFor(() => {
        expect(screen.getByText("Test Blog Post")).toBeInTheDocument();
      });

      expect(screen.queryByTestId("blog-card")).not.toBeInTheDocument();
    });

    it("handles post without tags", async () => {
      const postWithoutTags = { ...mockPost, tags: [] };
      (blogService.getBySlug as jest.Mock).mockResolvedValueOnce(
        postWithoutTags,
      );

      render(<BlogPostClient slug="test" />);

      await waitFor(() => {
        expect(screen.getByText("Test Blog Post")).toBeInTheDocument();
      });

      expect(screen.queryByText("react")).not.toBeInTheDocument();
    });

    it("refetches post when slug changes", async () => {
      const { rerender } = render(<BlogPostClient slug="slug-1" />);

      await waitFor(() => {
        expect(blogService.getBySlug).toHaveBeenCalledWith("slug-1");
      });

      rerender(<BlogPostClient slug="slug-2" />);

      await waitFor(() => {
        expect(blogService.getBySlug).toHaveBeenCalledWith("slug-2");
      });
    });

    it("handles null post gracefully", async () => {
      (blogService.getBySlug as jest.Mock).mockResolvedValueOnce(null);

      render(<BlogPostClient slug="test" />);

      await waitFor(() => {
        expect(screen.getByText("Post Not Found")).toBeInTheDocument();
      });
    });
  });
});
