import React from "react";
import {
  render,
  screen,
  waitFor,
  fireEvent,
  act,
} from "@testing-library/react";
import { useRouter, useSearchParams } from "next/navigation";
import BlogListClient from "./BlogListClient";
import { blogService } from "@/services/blog.service";
import type { BlogPost } from "@/services/blog.service";

// Mock dependencies
jest.mock("@/services/blog.service");
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

// Mock lucide-react icons
jest.mock("lucide-react", () => ({
  Search: () => <div data-testid="search-icon" />,
  Filter: () => <div data-testid="filter-icon" />,
  Tag: () => <div data-testid="tag-icon" />,
  Calendar: () => <div data-testid="calendar-icon" />,
  ChevronLeft: () => <div data-testid="chevron-left-icon" />,
  ChevronRight: () => <div data-testid="chevron-right-icon" />,
  Eye: () => <div data-testid="eye-icon" />,
  Heart: () => <div data-testid="heart-icon" />,
  User: () => <div data-testid="user-icon" />,
  Clock: () => <div data-testid="clock-icon" />,
}));

// Mock BlogCard component
jest.mock("@/components/cards/BlogCard", () => ({
  BlogCard: ({ title }: any) => (
    <div data-testid={`blog-card-${title}`}>
      <h3>{title}</h3>
    </div>
  ),
}));

const mockBlogService = blogService as jest.Mocked<typeof blogService>;
const mockRouter = {
  push: jest.fn(),
};
const mockSearchParams = {
  get: jest.fn(),
};

// Mock data
const mockBlogPosts: BlogPost[] = [
  {
    id: "1",
    title: "Test Blog Post 1",
    slug: "test-blog-post-1",
    excerpt: "This is a test blog post excerpt",
    content: "Full content here",
    featuredImage: "/test-image.jpg",
    author: {
      id: "author-1",
      name: "John Doe",
      avatar: "/avatar.jpg",
    },
    category: "Test Category",
    tags: ["tag1", "tag2"],
    status: "published",
    featured: true,
    publishedAt: new Date("2023-12-01"),
    createdAt: new Date("2023-12-01"),
    updatedAt: new Date("2023-12-01"),
    views: 100,
    likes: 25,
  },
  {
    id: "2",
    title: "Test Blog Post 2",
    slug: "test-blog-post-2",
    excerpt: "Another test blog post",
    content: "More content",
    author: {
      id: "author-2",
      name: "Jane Smith",
    },
    category: "Another Category",
    tags: ["tag3"],
    status: "published",
    featured: false,
    publishedAt: new Date("2023-11-15"),
    createdAt: new Date("2023-11-15"),
    updatedAt: new Date("2023-11-15"),
    views: 50,
    likes: 10,
  },
];

describe("BlogListClient", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup router and search params mocks
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);

    // Setup default mocks
    mockBlogService.list.mockResolvedValue({
      data: mockBlogPosts,
      count: 2,
      pagination: { hasNextPage: false, nextCursor: null },
    });

    // Mock search params
    mockSearchParams.get.mockImplementation((key: string) => {
      if (key === "search") return "";
      if (key === "sortBy") return "publishedAt";
      if (key === "sortOrder") return "desc";
      if (key === "category") return null;
      if (key === "featured") return null;
      return null;
    });
  });

  it("renders blog posts on load", async () => {
    await act(async () => {
      render(<BlogListClient />);
    });

    await waitFor(() => {
      expect(screen.getByText("Test Blog Post 1")).toBeInTheDocument();
      expect(screen.getByText("Test Blog Post 2")).toBeInTheDocument();
    });

    expect(mockBlogService.list).toHaveBeenCalledWith({
      status: "published",
      limit: 12,
      sortBy: "publishedAt",
      sortOrder: "desc",
      category: undefined,
      featured: undefined,
      startAfter: undefined,
      search: undefined,
    });
  });

  it("shows loading state initially", async () => {
    // Delay the mock response
    mockBlogService.list.mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                data: mockBlogPosts,
                count: 2,
                pagination: { hasNextPage: false, nextCursor: null },
              }),
            100,
          ),
        ),
    );

    await act(async () => {
      render(<BlogListClient />);
    });

    // Should show loading skeletons
    expect(
      screen
        .getAllByRole("generic", { hidden: true })
        .some((el) => el.classList.contains("animate-pulse")),
    ).toBeTruthy();
  });

  it("handles search functionality", async () => {
    await act(async () => {
      render(<BlogListClient />);
    });

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText("Search blog posts..."),
      ).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText("Search blog posts...");
    const initialCallCount = mockBlogService.list.mock.calls.length;

    await act(async () => {
      fireEvent.change(searchInput, { target: { value: "test search" } });
      fireEvent.keyDown(searchInput, { key: "Enter" });
    });

    await waitFor(() => {
      expect(mockBlogService.list.mock.calls.length).toBeGreaterThan(
        initialCallCount,
      );
    });

    const calls = mockBlogService.list.mock.calls;
    const lastCall = calls[calls.length - 1][0];
    expect(lastCall.search).toBe("test search");
  });

  it("handles sort changes", async () => {
    await act(async () => {
      render(<BlogListClient />);
    });

    await waitFor(() => {
      const sortSelect = screen.getByDisplayValue("Latest");
      fireEvent.change(sortSelect, { target: { value: "views" } });
    });

    await waitFor(() => {
      expect(mockBlogService.list).toHaveBeenCalledWith(
        expect.objectContaining({
          sortBy: "views",
        }),
      );
    });
  });

  it("displays error state on fetch failure", async () => {
    mockBlogService.list.mockRejectedValue(new Error("Network error"));

    await act(async () => {
      render(<BlogListClient />);
    });

    await waitFor(() => {
      expect(
        screen.getByText("Failed to load blog posts. Please try again later."),
      ).toBeInTheDocument();
      expect(screen.getByText("Try Again")).toBeInTheDocument();
    });
  });

  it("shows empty state when no posts", async () => {
    mockBlogService.list.mockResolvedValue({
      data: [],
      count: 0,
      pagination: { hasNextPage: false, nextCursor: null },
    });

    await act(async () => {
      render(<BlogListClient />);
    });

    await waitFor(() => {
      expect(screen.getByText("No blog posts found")).toBeInTheDocument();
      expect(
        screen.getByText("Check back later for new content"),
      ).toBeInTheDocument();
    });
  });

  it("handles pagination", async () => {
    mockBlogService.list.mockResolvedValueOnce({
      data: mockBlogPosts,
      count: 2,
      pagination: { hasNextPage: true, nextCursor: "cursor123" },
    });

    await act(async () => {
      render(<BlogListClient />);
    });

    await waitFor(() => {
      expect(screen.getByText("Next")).toBeInTheDocument();
    });

    // Click next page
    const nextButton = screen.getByText("Next");
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(mockBlogService.list).toHaveBeenCalledWith(
        expect.objectContaining({
          startAfter: "cursor123",
        }),
      );
    });
  });

  it("updates URL with filters", async () => {
    await act(async () => {
      render(<BlogListClient />);
    });

    const searchInput = screen.getByPlaceholderText("Search blog posts...");
    const initialCallCount = mockRouter.push.mock.calls.length;

    await act(async () => {
      fireEvent.change(searchInput, { target: { value: "test query" } });
      fireEvent.keyDown(searchInput, { key: "Enter" });
    });

    await waitFor(() => {
      expect(mockRouter.push.mock.calls.length).toBeGreaterThan(
        initialCallCount,
      );
      const calls = mockRouter.push.mock.calls;
      const hasSearchParam = calls.some((call) =>
        call[0].includes("search=test"),
      );
      expect(hasSearchParam).toBe(true);
    });
  });

  it("clears filters correctly", async () => {
    // First set up with search filter
    mockSearchParams.get.mockImplementation((key: string) => {
      if (key === "search") return "test search";
      return null;
    });

    mockBlogService.list.mockResolvedValueOnce({
      data: [],
      count: 0,
      pagination: { hasNextPage: false, nextCursor: null },
    });

    await act(async () => {
      render(<BlogListClient />);
    });

    await waitFor(() => {
      expect(screen.getByText("Clear Filters")).toBeInTheDocument();
    });

    const clearButton = screen.getByText("Clear Filters");
    fireEvent.click(clearButton);

    await waitFor(() => {
      expect(mockBlogService.list).toHaveBeenCalledWith(
        expect.objectContaining({
          sortBy: "publishedAt",
          sortOrder: "desc",
        }),
      );
    });
  });

  it("displays pagination info correctly", async () => {
    await act(async () => {
      render(<BlogListClient />);
    });

    await waitFor(() => {
      expect(screen.getByText("Page 1 • 2 posts")).toBeInTheDocument();
    });
  });

  it("handles previous page navigation", async () => {
    // Set up initial state with next page available
    mockBlogService.list.mockResolvedValueOnce({
      data: mockBlogPosts,
      count: 2,
      pagination: { hasNextPage: true, nextCursor: "cursor123" },
    });

    await act(async () => {
      render(<BlogListClient />);
    });

    // Navigate to page 2 first
    await waitFor(() => {
      const nextButton = screen.getByText("Next");
      expect(nextButton).not.toBeDisabled();
      fireEvent.click(nextButton);
    });

    // Mock the page 2 response
    mockBlogService.list.mockResolvedValueOnce({
      data: mockBlogPosts,
      count: 2,
      pagination: { hasNextPage: false, nextCursor: null },
    });

    // Now test previous button should be enabled on page 2
    await waitFor(() => {
      const prevButton = screen.getByText("Previous");
      expect(prevButton).not.toBeDisabled();
      fireEvent.click(prevButton);
    });

    expect(screen.getByText("Page 1 • 2 posts")).toBeInTheDocument();
  });
});
