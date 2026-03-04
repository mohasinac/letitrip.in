import React from "react";
import { render, screen } from "@testing-library/react";
import { CategoryCard } from "../CategoryCard";
import type { CategoryDocument } from "@/db/schema";

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string, params?: Record<string, unknown>) => {
    if (key === "productsCount") return `${params?.count ?? 0} products`;
    if (key === "subcategoriesCount") return `${params?.count ?? 0} subcategories`;
    return key;
  },
}));

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ alt, src }: { alt: string; src: string }) => <img alt={alt} src={src} />,
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
  display: { icon: "🥾", color: undefined, coverImage: undefined, showInMenu: false, showInFooter: false },
  metrics: { productCount: 12, totalProductCount: 12 } as CategoryDocument["metrics"],
  isFeatured: false,
  childrenIds: [],
};

describe("CategoryCard", () => {
  it("renders the category name", () => {
    render(<CategoryCard category={baseCategory as CategoryDocument} />);
    expect(screen.getByText("Trekking")).toBeInTheDocument();
  });

  it("renders the description", () => {
    render(<CategoryCard category={baseCategory as CategoryDocument} />);
    expect(screen.getByText("All trekking gear")).toBeInTheDocument();
  });

  it("renders product count from useTranslations", () => {
    render(<CategoryCard category={baseCategory as CategoryDocument} />);
    expect(screen.getByText("12 products")).toBeInTheDocument();
  });

  it("does NOT render subcategory count when childrenIds is empty", () => {
    render(<CategoryCard category={baseCategory as CategoryDocument} />);
    expect(screen.queryByText(/subcategor/i)).toBeNull();
  });

  it("renders subcategory count when childrenIds has entries", () => {
    const withSubs = {
      ...baseCategory,
      childrenIds: ["c1", "c2"],
    } as CategoryDocument;
    render(<CategoryCard category={withSubs} />);
    expect(screen.getByText("2 subcategories")).toBeInTheDocument();
  });

  it("shows featured badge when isFeatured is true", () => {
    const featured = { ...baseCategory, isFeatured: true } as CategoryDocument;
    render(<CategoryCard category={featured} />);
    expect(screen.getByText("featured")).toBeInTheDocument();
  });

  it("does NOT show featured badge when isFeatured is false", () => {
    render(<CategoryCard category={baseCategory as CategoryDocument} />);
    expect(screen.queryByText("featured")).toBeNull();
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
      <CategoryCard category={baseCategory as CategoryDocument} />
    );
    expect(container.textContent).toContain("🥾");
  });

  it("renders fallback emoji when no icon and no coverImage", () => {
    const noIcon = {
      ...baseCategory,
      display: { coverImage: undefined, icon: undefined, color: undefined, showInMenu: false, showInFooter: false },
    } as CategoryDocument;
    const { container } = render(<CategoryCard category={noIcon} />);
    expect(container.textContent).toContain("🗂️");
  });
});
