import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CategoryCard } from "@/components";
import type { CategoryDocument } from "@/db/schema";

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string, params?: Record<string, unknown>) => {
    if (key === "productsCount") return `${params?.count ?? 0} products`;
    if (key === "view") return "View";
    return key;
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

const baseCategory: Partial<CategoryDocument> = {
  id: "cat1",
  name: "Trekking",
  slug: "trekking",
  description: "All trekking gear",
  display: {
    icon: "🥾",
    color: undefined,
    coverImage: undefined,
    showInMenu: false,
    showInFooter: false,
  },
  metrics: {
    productCount: 12,
    totalProductCount: 12,
  } as CategoryDocument["metrics"],
  isFeatured: false,
  childrenIds: [],
};

describe("CategoryCard", () => {
  it("renders the category name", () => {
    render(<CategoryCard category={baseCategory as CategoryDocument} />);
    expect(screen.getByText("Trekking")).toBeInTheDocument();
  });

  it("renders product count from useTranslations", () => {
    render(<CategoryCard category={baseCategory as CategoryDocument} />);
    expect(screen.getByText("12 products")).toBeInTheDocument();
  });

  it("renders the amber View label", () => {
    render(<CategoryCard category={baseCategory as CategoryDocument} />);
    expect(screen.getByText("View")).toBeInTheDocument();
  });

  it("shows featured star when isFeatured is true", () => {
    const featured = { ...baseCategory, isFeatured: true } as CategoryDocument;
    const { container } = render(<CategoryCard category={featured} />);
    // Star SVG is rendered inside the featured indicator div
    const starEl = container.querySelector(".fill-yellow-900");
    expect(starEl).toBeInTheDocument();
  });

  it("does NOT show featured star when isFeatured is false", () => {
    const { container } = render(
      <CategoryCard category={baseCategory as CategoryDocument} />,
    );
    expect(container.querySelector(".fill-yellow-900")).toBeNull();
  });

  it("renders checkbox when selectable is true", () => {
    render(
      <CategoryCard
        category={baseCategory as CategoryDocument}
        selectable
        selected={false}
        onSelect={jest.fn()}
      />,
    );
    expect(screen.getByRole("checkbox")).toBeInTheDocument();
  });

  it("calls onSelect with correct args when checkbox changes", async () => {
    const onSelect = jest.fn();
    render(
      <CategoryCard
        category={baseCategory as CategoryDocument}
        selectable
        selected={false}
        onSelect={onSelect}
      />,
    );
    await userEvent.click(screen.getByRole("checkbox"));
    expect(onSelect).toHaveBeenCalledWith("cat1", true);
  });

  it("renders cover image when display.coverImage is set", () => {
    const withImage = {
      ...baseCategory,
      display: { ...baseCategory.display, coverImage: "/cat-cover.jpg" },
    } as CategoryDocument;
    render(<CategoryCard category={withImage} />);
    expect(screen.getByAltText("Trekking")).toBeInTheDocument();
  });

  it("renders icon emoji when no coverImage", () => {
    const { container } = render(
      <CategoryCard category={baseCategory as CategoryDocument} />,
    );
    expect(container.textContent).toContain("🥾");
  });

  it("renders fallback emoji when no icon and no coverImage", () => {
    const noIcon = {
      ...baseCategory,
      display: {
        coverImage: undefined,
        icon: undefined,
        color: undefined,
        showInMenu: false,
        showInFooter: false,
      },
    } as CategoryDocument;
    const { container } = render(<CategoryCard category={noIcon} />);
    expect(container.textContent).toContain("🗂️");
  });

  it("renders a link to the category page", () => {
    render(<CategoryCard category={baseCategory as CategoryDocument} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", expect.stringContaining("trekking"));
  });
});
