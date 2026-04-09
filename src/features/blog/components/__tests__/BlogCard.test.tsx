/**
 * @jest-environment jsdom
 */
import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { BlogCard } from "@/components";
import type { BlogPost } from "@mohasinac/appkit/features/blog";

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string, params?: Record<string, unknown>) => {
    const map: Record<string, string> = {
      continueReading: "Continue Reading",
      readTime: "min read",
    };
    return map[key] ?? key;
  },
}));

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ alt, src }: { alt: string; src: string }) => (
    <img alt={alt} src={src} />
  ),
}));

jest.mock("@/i18n/navigation", () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => "/",
  redirect: jest.fn(),
}));

const basePost: Partial<BlogPost> = {
  id: "post-1",
  slug: "my-first-post",
  title: "My First Post",
  excerpt: "This is a short excerpt of the blog post.",
  category: "news",
  authorName: "Jane Doe",
  readTimeMinutes: 5,
  isFeatured: false,
  coverImage: undefined,
  publishedAt: "2025-01-10",
};

describe("BlogCard", () => {
  it("renders the post title", () => {
    render(<BlogCard post={basePost as BlogPost} />);
    expect(screen.getByText("My First Post")).toBeInTheDocument();
  });

  it("renders the excerpt", () => {
    render(<BlogCard post={basePost as BlogPost} />);
    expect(
      screen.getByText("This is a short excerpt of the blog post."),
    ).toBeInTheDocument();
  });

  it("renders the author name", () => {
    render(<BlogCard post={basePost as BlogPost} />);
    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
  });

  it("renders the category badge", () => {
    render(<BlogCard post={basePost as BlogPost} />);
    expect(screen.getByText("news")).toBeInTheDocument();
  });

  it("renders 'Continue Reading' visual label", () => {
    render(<BlogCard post={basePost as BlogPost} />);
    expect(screen.getByText("Continue Reading")).toBeInTheDocument();
  });

  it("renders a link to the blog post", () => {
    render(<BlogCard post={basePost as BlogPost} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute(
      "href",
      expect.stringContaining("my-first-post"),
    );
  });

  it("shows featured star when isFeatured is true", () => {
    const featured = { ...basePost, isFeatured: true } as BlogPost;
    const { container } = render(<BlogCard post={featured} />);
    expect(container.querySelector(".fill-yellow-900")).toBeInTheDocument();
  });

  it("does NOT show featured star when isFeatured is false", () => {
    const { container } = render(<BlogCard post={basePost as BlogPost} />);
    expect(container.querySelector(".fill-yellow-900")).toBeNull();
  });

  it("renders cover image when provided", () => {
    const withImage = {
      ...basePost,
      coverImage: "https://example.com/cover.jpg",
    } as BlogPost;
    render(<BlogCard post={withImage} />);
    expect(screen.getByAltText("My First Post")).toBeInTheDocument();
  });

  it("renders checkbox when selectable is true", () => {
    render(
      <BlogCard
        post={basePost as BlogPost}
        selectable
        selected={false}
        onSelect={jest.fn()}
      />,
    );
    expect(screen.getByRole("checkbox")).toBeInTheDocument();
  });

  it("calls onSelect when checkbox is toggled", async () => {
    const onSelect = jest.fn();
    render(
      <BlogCard
        post={basePost as BlogPost}
        selectable
        selected={false}
        onSelect={onSelect}
      />,
    );
    await userEvent.click(screen.getByRole("checkbox"));
    expect(onSelect).toHaveBeenCalledWith("post-1", true);
  });
});
