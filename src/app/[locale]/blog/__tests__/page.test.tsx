import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import type React from "react";
import BlogPage from "../page";

const mockSet = jest.fn();
const mockSetMany = jest.fn();
const mockSetPage = jest.fn();
const mockGet = jest.fn().mockReturnValue("");
const mockGetNumber = jest.fn().mockReturnValue(1);
const mockUseApiQuery = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace: jest.fn(), push: jest.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/blog",
}));

jest.mock("@/hooks", () => ({
  useApiQuery: (...args: any[]) => mockUseApiQuery(...args),
  useUrlTable: () => ({
    get: mockGet,
    getNumber: mockGetNumber,
    set: mockSet,
    setMany: mockSetMany,
    setPage: mockSetPage,
    setPageSize: jest.fn(),
    setSort: jest.fn(),
    clear: jest.fn(),
    params: new URLSearchParams(),
  }),
}));

jest.mock("@/lib/api-client", () => ({
  apiClient: { get: jest.fn().mockResolvedValue({}) },
}));

jest.mock("@/components", () => ({
  Spinner: () => <div data-testid="spinner" />,
  Pagination: ({
    currentPage,
    totalPages,
    onPageChange,
  }: {
    currentPage: number;
    totalPages: number;
    onPageChange: (p: number) => void;
  }) => (
    <div data-testid="pagination">
      <button onClick={() => onPageChange(currentPage + 1)}>Next</button>
    </div>
  ),
  BlogCard: ({ post }: { post: any }) => (
    <div data-testid={`blog-card-${post.id}`}>
      <h3>{post.title}</h3>
      <time>{post.publishedAt}</time>
      <p>{post.excerpt}</p>
    </div>
  ),
  BlogFeaturedCard: ({ post }: { post: any }) => (
    <div data-testid="blog-featured-card">{post.title}</div>
  ),
  BlogCategoryTabs: ({
    activeCategory,
    onChange,
  }: {
    activeCategory: string;
    onChange: (key: string) => void;
  }) => (
    <div data-testid="blog-category-tabs">
      <button onClick={() => onChange("news")}>news</button>
      <button onClick={() => onChange("tips")}>tips</button>
      <button onClick={() => onChange("")}>All</button>
    </div>
  ),
  EmptyState: ({ title }: { title: string }) => (
    <div data-testid="empty-state">{title}</div>
  ),
}));

const mockPost = (id: string, opts: Record<string, any> = {}) => ({
  id,
  title: `Post ${id}`,
  slug: `post-${id}`,
  excerpt: `Excerpt ${id}`,
  publishedAt: "2026-01-01T00:00:00Z",
  category: "news",
  isFeatured: false,
  author: "Author",
  ...opts,
});

describe("BlogPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGet.mockReturnValue("");
    mockGetNumber.mockReturnValue(1);
    mockUseApiQuery.mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    });
  });

  it("renders loading skeleton when isLoading=true", () => {
    mockUseApiQuery.mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
    });
    render(<BlogPage />);
    expect(screen.getByTestId("spinner")).toBeInTheDocument();
  });

  it("renders article cards with title, date, excerpt", () => {
    mockUseApiQuery.mockReturnValue({
      data: {
        posts: [mockPost("1"), mockPost("2")],
        meta: { total: 2, page: 1, pageSize: 9, totalPages: 1 },
      },
      isLoading: false,
      error: null,
    });
    render(<BlogPage />);
    expect(screen.getByText("Post 1")).toBeInTheDocument();
    expect(screen.getByText("Post 2")).toBeInTheDocument();
    expect(screen.getByText("Excerpt 1")).toBeInTheDocument();
  });

  it("renders EmptyState when no articles", () => {
    mockUseApiQuery.mockReturnValue({
      data: {
        posts: [],
        meta: { total: 0, page: 1, pageSize: 9, totalPages: 0 },
      },
      isLoading: false,
      error: null,
    });
    render(<BlogPage />);
    expect(screen.getByTestId("empty-state")).toBeInTheDocument();
  });

  it("category filter tabs are present", () => {
    mockUseApiQuery.mockReturnValue({
      data: {
        posts: [],
        meta: { total: 0, page: 1, pageSize: 9, totalPages: 0 },
      },
      isLoading: false,
      error: null,
    });
    render(<BlogPage />);
    expect(screen.getByTestId("blog-category-tabs")).toBeInTheDocument();
  });

  it("active category tab updates URL params via setMany", () => {
    mockUseApiQuery.mockReturnValue({
      data: {
        posts: [],
        meta: { total: 0, page: 1, pageSize: 9, totalPages: 0 },
      },
      isLoading: false,
      error: null,
    });
    render(<BlogPage />);
    fireEvent.click(screen.getByRole("button", { name: "news" }));
    expect(mockSetMany).toHaveBeenCalledWith({ category: "news", page: "1" });
  });

  it("Pagination component visible when totalPages > 1", () => {
    mockUseApiQuery.mockReturnValue({
      data: {
        posts: [mockPost("1")],
        meta: { total: 20, page: 1, pageSize: 9, totalPages: 3 },
      },
      isLoading: false,
      error: null,
    });
    render(<BlogPage />);
    expect(screen.getByTestId("pagination")).toBeInTheDocument();
  });
});
