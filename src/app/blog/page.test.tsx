import React from "react";
import {
  render,
  screen,
  waitFor,
  fireEvent,
  act,
} from "@testing-library/react";
import { useRouter, useSearchParams } from "next/navigation";
import BlogPage from "./page";
import BlogListClient from "./BlogListClient";
import { blogService } from "@/services/blog.service";

jest.mock("@/services/blog.service");
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));
jest.mock("lucide-react", () => ({
  Search: () => <div data-testid="search-icon" />,
  Filter: () => <div data-testid="filter-icon" />,
  Tag: () => <div data-testid="tag-icon" />,
  Calendar: () => <div data-testid="calendar-icon" />,
  ChevronLeft: () => <div data-testid="chevron-left-icon" />,
  ChevronRight: () => <div data-testid="chevron-right-icon" />,
}));
jest.mock("@/components/cards/BlogCard", () => ({
  BlogCard: ({ title, slug }: any) => (
    <div data-testid={`blog-card-${slug}`}>{title}</div>
  ),
}));

const mockBlogService = blogService as jest.Mocked<typeof blogService>;
const mockRouter = { push: jest.fn() };
const mockSearchParams = { get: jest.fn() };

beforeEach(() => {
  (useRouter as jest.Mock).mockReturnValue(mockRouter);
  (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);
  mockRouter.push.mockReset();
  mockSearchParams.get.mockReset();
  mockBlogService.list.mockReset();
});

const mockBlogPosts = [
  {
    id: "1",
    title: "Getting Started with Auctions",
    slug: "getting-started-with-auctions",
    excerpt: "Learn how to participate in online auctions",
    content: "Full content here",
    featuredImage: "https://example.com/image1.jpg",
    author: {
      id: "author1",
      name: "John Doe",
      avatar: "https://example.com/avatar1.jpg",
    },
    category: "Guides",
    tags: ["auction", "beginner"],
    status: "published" as const,
    featured: true,
    publishedAt: new Date("2024-01-15"),
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15"),
    views: 1500,
    likes: 120,
  },
  {
    id: "2",
    title: "Top Collectibles of 2024",
    slug: "top-collectibles-2024",
    excerpt: "Discover the most sought-after items this year",
    content: "Full content here",
    featuredImage: "https://example.com/image2.jpg",
    author: {
      id: "author2",
      name: "Jane Smith",
      avatar: "https://example.com/avatar2.jpg",
    },
    category: "Trends",
    tags: ["collectibles", "2024"],
    status: "published" as const,
    featured: false,
    publishedAt: new Date("2024-02-20"),
    createdAt: new Date("2024-02-20"),
    updatedAt: new Date("2024-02-20"),
    views: 2300,
    likes: 180,
  },
];

describe("BlogPage", () => {
  it("renders page with metadata and suspense fallback", () => {
    render(<BlogPage />);
    expect(screen.getByRole("main")).toBeInTheDocument();
  });
});

describe("BlogListClient", () => {
  describe("Initial Load", () => {
    it("renders loading state initially", async () => {
      mockBlogService.list.mockImplementation(
        () =>
          new Promise(() => {
            // Never resolves to keep loading state
          })
      );

      render(<BlogListClient />);

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText("Search blog posts...")
        ).toBeInTheDocument();
        // Loading skeleton should be present
        const pulseElements = document.querySelectorAll(".animate-pulse");
        expect(pulseElements.length).toBeGreaterThan(0);
      });
    });

    it("renders blog posts after loading", async () => {
      mockBlogService.list.mockResolvedValue({
        data: mockBlogPosts,
        count: 2,
        pagination: { hasNextPage: false },
      });

      await act(async () => {
        render(<BlogListClient />);
      });

      await waitFor(() => {
        expect(
          screen.getByText("Getting Started with Auctions")
        ).toBeInTheDocument();
        expect(
          screen.getByText("Top Collectibles of 2024")
        ).toBeInTheDocument();
      });
    });

    it("displays header with title and description", async () => {
      mockBlogService.list.mockResolvedValue({
        data: [],
        count: 0,
        pagination: { hasNextPage: false },
      });

      await act(async () => {
        render(<BlogListClient />);
      });

      await waitFor(() => {
        expect(screen.getByText("Blog")).toBeInTheDocument();
        expect(
          screen.getByText(/Discover articles, guides, and stories/)
        ).toBeInTheDocument();
      });
    });
  });

  describe("Search Functionality", () => {
    it("allows users to type in search box", async () => {
      mockBlogService.list.mockResolvedValue({
        data: [],
        count: 0,
        pagination: { hasNextPage: false },
      });

      await act(async () => {
        render(<BlogListClient />);
      });

      const searchInput = screen.getByPlaceholderText("Search blog posts...");

      await act(async () => {
        fireEvent.change(searchInput, { target: { value: "auction" } });
      });

      expect(searchInput).toHaveValue("auction");
    });

    it("performs search when search button is clicked", async () => {
      mockBlogService.list.mockResolvedValue({
        data: [],
        count: 0,
        pagination: { hasNextPage: false },
      });

      await act(async () => {
        render(<BlogListClient />);
      });

      const searchInput = screen.getByPlaceholderText("Search blog posts...");
      const searchButton = screen.getByRole("button", { name: /search/i });

      await act(async () => {
        fireEvent.change(searchInput, { target: { value: "collectibles" } });
      });

      mockBlogService.list.mockResolvedValue({
        data: [mockBlogPosts[1]],
        count: 1,
        pagination: { hasNextPage: false },
      });

      await act(async () => {
        fireEvent.click(searchButton);
      });

      await waitFor(() => {
        expect(mockBlogService.list).toHaveBeenCalledWith(
          expect.objectContaining({
            search: "collectibles",
          })
        );
      });
    });

    it("reads search query from URL on mount", async () => {
      mockSearchParams.get.mockImplementation((key) => {
        if (key === "search") return "auction guide";
        return null;
      });

      mockBlogService.list.mockResolvedValue({
        data: [mockBlogPosts[0]],
        count: 1,
        pagination: { hasNextPage: false },
      });

      await act(async () => {
        render(<BlogListClient />);
      });

      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText("Search blog posts...");
        expect(searchInput).toHaveValue("auction guide");
      });
    });

    it("displays and removes search filter chip", async () => {
      mockBlogService.list.mockResolvedValue({
        data: mockBlogPosts,
        count: 2,
        pagination: { hasNextPage: false },
      });

      await act(async () => {
        render(<BlogListClient />);
      });

      const searchInput = screen.getByPlaceholderText("Search blog posts...");
      const searchButton = screen.getByRole("button", { name: /search/i });

      await act(async () => {
        fireEvent.change(searchInput, { target: { value: "test search" } });
        fireEvent.click(searchButton);
      });

      await waitFor(() => {
        expect(screen.getByText("test search")).toBeInTheDocument();
      });

      const removeFilterButton = screen.getByText("×");
      await act(async () => {
        fireEvent.click(removeFilterButton);
      });

      await waitFor(() => {
        expect(screen.queryByText("test search")).not.toBeInTheDocument();
      });
    });
  });

  describe("Sort Functionality", () => {
    it("renders sort dropdown with options", async () => {
      mockBlogService.list.mockResolvedValue({
        data: [],
        count: 0,
        pagination: { hasNextPage: false },
      });

      await act(async () => {
        render(<BlogListClient />);
      });

      const sortSelect = screen.getByRole("combobox");
      expect(sortSelect).toBeInTheDocument();
      expect(screen.getByText("Latest")).toBeInTheDocument();
    });

    it("changes sort option and fetches blogs", async () => {
      mockBlogService.list.mockResolvedValue({
        data: mockBlogPosts,
        count: 2,
        pagination: { hasNextPage: false },
      });

      await act(async () => {
        render(<BlogListClient />);
      });

      const sortSelect = screen.getByRole("combobox");

      await act(async () => {
        fireEvent.change(sortSelect, { target: { value: "views" } });
      });

      await waitFor(() => {
        expect(mockBlogService.list).toHaveBeenCalledWith(
          expect.objectContaining({
            sortBy: "views",
          })
        );
      });
    });

    it("supports sorting by likes", async () => {
      mockBlogService.list.mockResolvedValue({
        data: mockBlogPosts,
        count: 2,
        pagination: { hasNextPage: false },
      });

      await act(async () => {
        render(<BlogListClient />);
      });

      const sortSelect = screen.getByRole("combobox");

      await act(async () => {
        fireEvent.change(sortSelect, { target: { value: "likes" } });
      });

      await waitFor(() => {
        expect(mockBlogService.list).toHaveBeenCalledWith(
          expect.objectContaining({
            sortBy: "likes",
          })
        );
      });
    });
  });

  describe("Category Filtering", () => {
    it("displays and removes category filter chip", async () => {
      mockSearchParams.get.mockImplementation((key) => {
        if (key === "category") return "Guides";
        return null;
      });

      mockBlogService.list.mockResolvedValue({
        data: [mockBlogPosts[0]],
        count: 1,
        pagination: { hasNextPage: false },
      });

      await act(async () => {
        render(<BlogListClient />);
      });

      await waitFor(() => {
        expect(screen.getByText("Guides")).toBeInTheDocument();
      });

      const removeButton = screen.getByText("×");
      await act(async () => {
        fireEvent.click(removeButton);
      });

      await waitFor(() => {
        expect(mockBlogService.list).toHaveBeenCalledWith(
          expect.objectContaining({
            category: undefined,
          })
        );
      });
    });
  });

  describe("Pagination", () => {
    it("displays pagination controls when multiple pages exist", async () => {
      mockBlogService.list.mockResolvedValue({
        data: mockBlogPosts,
        count: 2,
        pagination: { hasNextPage: true, nextCursor: "cursor123" },
      });

      await act(async () => {
        render(<BlogListClient />);
      });

      await waitFor(() => {
        expect(screen.getByText(/Previous/)).toBeInTheDocument();
        expect(screen.getByText(/Next/)).toBeInTheDocument();
      });
    });

    it("disables previous button on first page", async () => {
      mockBlogService.list.mockResolvedValue({
        data: mockBlogPosts,
        count: 2,
        pagination: { hasNextPage: true, nextCursor: "cursor123" },
      });

      await act(async () => {
        render(<BlogListClient />);
      });

      await waitFor(() => {
        const prevButton = screen.getByText(/Previous/);
        expect(prevButton).toBeDisabled();
      });
    });

    it("disables next button when no next page", async () => {
      mockBlogService.list.mockResolvedValue({
        data: mockBlogPosts,
        count: 2,
        pagination: { hasNextPage: false },
      });

      await act(async () => {
        render(<BlogListClient />);
      });

      await waitFor(() => {
        const nextButton = screen.getByText(/Next/);
        expect(nextButton).toBeDisabled();
      });
    });

    it("navigates to next page when next button is clicked", async () => {
      mockBlogService.list.mockResolvedValueOnce({
        data: mockBlogPosts,
        count: 2,
        pagination: { hasNextPage: true, nextCursor: "cursor123" },
      });

      await act(async () => {
        render(<BlogListClient />);
      });

      await waitFor(() => {
        expect(
          screen.getByText("Getting Started with Auctions")
        ).toBeInTheDocument();
      });

      mockBlogService.list.mockResolvedValueOnce({
        data: [mockBlogPosts[1]],
        count: 1,
        pagination: { hasNextPage: false },
      });

      const nextButton = screen.getByText(/Next/);
      await act(async () => {
        fireEvent.click(nextButton);
      });

      await waitFor(() => {
        expect(mockBlogService.list).toHaveBeenCalledTimes(2);
      });
    });

    it("navigates to previous page when previous button is clicked", async () => {
      mockBlogService.list.mockResolvedValue({
        data: mockBlogPosts,
        count: 2,
        pagination: { hasNextPage: true, nextCursor: "cursor123" },
      });

      await act(async () => {
        render(<BlogListClient />);
      });

      await waitFor(() => {
        expect(screen.getByText(/Previous/)).toBeInTheDocument();
      });

      // Click next first
      const nextButton = screen.getByText(/Next/);
      await act(async () => {
        fireEvent.click(nextButton);
      });

      await waitFor(() => {
        const prevButton = screen.getByText(/Previous/);
        expect(prevButton).not.toBeDisabled();
      });

      // Now click previous
      const prevButton = screen.getByText(/Previous/);
      await act(async () => {
        fireEvent.click(prevButton);
      });

      await waitFor(() => {
        expect(mockBlogService.list).toHaveBeenCalledTimes(3);
      });
    });

    it("displays current page and post count", async () => {
      mockBlogService.list.mockResolvedValue({
        data: mockBlogPosts,
        count: 2,
        pagination: { hasNextPage: true },
      });

      await act(async () => {
        render(<BlogListClient />);
      });

      await waitFor(() => {
        expect(screen.getByText(/Page 1/)).toBeInTheDocument();
        expect(screen.getByText(/2 posts/)).toBeInTheDocument();
      });
    });
  });

  describe("Error Handling", () => {
    it("displays error message when fetch fails", async () => {
      mockBlogService.list.mockRejectedValue(new Error("Network error"));

      await act(async () => {
        render(<BlogListClient />);
      });

      await waitFor(() => {
        expect(
          screen.getByText(/Failed to load blog posts/)
        ).toBeInTheDocument();
      });
    });

    it("allows retry after error", async () => {
      mockBlogService.list.mockRejectedValueOnce(new Error("Network error"));

      await act(async () => {
        render(<BlogListClient />);
      });

      await waitFor(() => {
        expect(screen.getByText(/Try Again/)).toBeInTheDocument();
      });

      mockBlogService.list.mockResolvedValue({
        data: mockBlogPosts,
        count: 2,
        pagination: { hasNextPage: false },
      });

      const retryButton = screen.getByText(/Try Again/);
      await act(async () => {
        fireEvent.click(retryButton);
      });

      await waitFor(() => {
        expect(
          screen.getByText("Getting Started with Auctions")
        ).toBeInTheDocument();
      });
    });
  });

  describe("Empty States", () => {
    it("displays empty state when no posts found", async () => {
      mockBlogService.list.mockResolvedValue({
        data: [],
        count: 0,
        pagination: { hasNextPage: false },
      });

      await act(async () => {
        render(<BlogListClient />);
      });

      await waitFor(() => {
        expect(screen.getByText("No blog posts found")).toBeInTheDocument();
      });
    });

    it("shows different message when filters are active", async () => {
      mockSearchParams.get.mockImplementation((key) => {
        if (key === "search") return "nonexistent";
        return null;
      });

      mockBlogService.list.mockResolvedValue({
        data: [],
        count: 0,
        pagination: { hasNextPage: false },
      });

      await act(async () => {
        render(<BlogListClient />);
      });

      await waitFor(() => {
        expect(
          screen.getByText(/Try adjusting your filters/)
        ).toBeInTheDocument();
      });
    });

    it("shows clear filters button when filters are active", async () => {
      mockSearchParams.get.mockImplementation((key) => {
        if (key === "search") return "test";
        return null;
      });

      mockBlogService.list.mockResolvedValue({
        data: [],
        count: 0,
        pagination: { hasNextPage: false },
      });

      await act(async () => {
        render(<BlogListClient />);
      });

      await waitFor(() => {
        expect(screen.getByText("Clear Filters")).toBeInTheDocument();
      });

      const clearButton = screen.getByText("Clear Filters");
      await act(async () => {
        fireEvent.click(clearButton);
      });

      await waitFor(() => {
        expect(mockBlogService.list).toHaveBeenCalledWith(
          expect.objectContaining({
            search: undefined,
          })
        );
      });
    });
  });

  describe("URL Sync", () => {
    it("updates URL when search changes", async () => {
      mockBlogService.list.mockResolvedValue({
        data: [],
        count: 0,
        pagination: { hasNextPage: false },
      });

      await act(async () => {
        render(<BlogListClient />);
      });

      const searchInput = screen.getByPlaceholderText("Search blog posts...");
      const searchButton = screen.getByRole("button", { name: /search/i });

      await act(async () => {
        fireEvent.change(searchInput, { target: { value: "auction" } });
        fireEvent.click(searchButton);
      });

      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith(
          expect.stringContaining("search=auction"),
          { scroll: false }
        );
      });
    });

    it("updates URL when sort changes", async () => {
      mockBlogService.list.mockResolvedValue({
        data: [],
        count: 0,
        pagination: { hasNextPage: false },
      });

      await act(async () => {
        render(<BlogListClient />);
      });

      const sortSelect = screen.getByRole("combobox");

      await act(async () => {
        fireEvent.change(sortSelect, { target: { value: "views" } });
      });

      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith(
          expect.stringContaining("sortBy=views"),
          { scroll: false }
        );
      });
    });
  });

  describe("Blog Grid Display", () => {
    it("renders blog posts in grid layout", async () => {
      mockBlogService.list.mockResolvedValue({
        data: mockBlogPosts,
        count: 2,
        pagination: { hasNextPage: false },
      });

      await act(async () => {
        render(<BlogListClient />);
      });

      await waitFor(() => {
        expect(
          screen.getByTestId("blog-card-getting-started-with-auctions")
        ).toBeInTheDocument();
        expect(
          screen.getByTestId("blog-card-top-collectibles-2024")
        ).toBeInTheDocument();
      });
    });
  });
});
