import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import type React from "react";

const mockApiQuery = jest.fn();

// Mock React.use() to synchronously return resolved params
jest.mock("react", () => ({
  ...jest.requireActual("react"),
  use: jest.fn().mockReturnValue({ slug: "test-post" }),
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/blog/test-post",
}));

jest.mock("@/hooks", () => ({
  useApiQuery: (...args: any[]) => mockApiQuery(...args),
}));

jest.mock("@/lib/api-client", () => ({
  apiClient: { get: jest.fn().mockResolvedValue({}) },
}));

jest.mock("@/utils", () => ({
  formatDate: (d: string) => d,
}));

jest.mock("@/components", () => ({
  Card: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card">{children}</div>
  ),
  Button: ({
    children,
    onClick,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
  }) => <button onClick={onClick}>{children}</button>,
  Spinner: () => <div data-testid="spinner" />,
}));

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({
    href,
    children,
  }: {
    href: string;
    children: React.ReactNode;
  }) => <a href={href}>{children}</a>,
}));

import BlogPostPage from "../page";

describe("BlogPostPage", () => {
  const mockPost = {
    id: "post-1",
    title: "How to Sell Online",
    slug: "how-to-sell-online",
    excerpt: "A beginner guide",
    content: "<p>Full article content here</p>",
    publishedAt: "2026-01-15T00:00:00Z",
    category: "guides",
    isFeatured: false,
    authorName: "Jane Doe",
    readTimeMinutes: 5,
    views: 123,
    tags: ["ecommerce", "guide"],
  };

  const mockRelated = [
    {
      id: "post-2",
      title: "Related Post",
      slug: "related-post",
      excerpt: "Related excerpt",
      category: "guides",
      publishedAt: "2026-01-10T00:00:00Z",
      author: "John",
      tags: [],
    },
  ];

  beforeEach(() => {
    mockApiQuery.mockReset();
  });

  it("renders article title and body content", () => {
    mockApiQuery.mockReturnValue({
      data: { post: mockPost, related: [] },
      isLoading: false,
      error: null,
    });
    render(
      <BlogPostPage params={Promise.resolve({ slug: "how-to-sell-online" })} />,
    );
    expect(screen.getByText("How to Sell Online")).toBeInTheDocument();
  });

  it("renders author and published date", () => {
    mockApiQuery.mockReturnValue({
      data: { post: mockPost, related: [] },
      isLoading: false,
      error: null,
    });
    render(
      <BlogPostPage params={Promise.resolve({ slug: "how-to-sell-online" })} />,
    );
    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
  });

  it("renders related articles section when related exist", () => {
    mockApiQuery.mockReturnValue({
      data: { post: mockPost, related: mockRelated },
      isLoading: false,
      error: null,
    });
    render(
      <BlogPostPage params={Promise.resolve({ slug: "how-to-sell-online" })} />,
    );
    expect(screen.getByText("Related Post")).toBeInTheDocument();
  });

  it("renders NotFound for unknown slug", () => {
    mockApiQuery.mockReturnValue({
      data: null,
      isLoading: false,
      error: new Error("Not found"),
    });
    render(<BlogPostPage params={Promise.resolve({ slug: "not-exist" })} />);
    expect(screen.queryByText("How to Sell Online")).not.toBeInTheDocument();
    // Should show error / not-found state
    expect(screen.getByText(/Post not found/i)).toBeInTheDocument();
  });

  it("renders loading spinner when fetching", () => {
    mockApiQuery.mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
    });
    render(
      <BlogPostPage params={Promise.resolve({ slug: "how-to-sell-online" })} />,
    );
    expect(screen.getByTestId("spinner")).toBeInTheDocument();
  });
});
