import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import type React from "react";
import CategoriesPage from "../page";

const mockUseApiQuery = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/categories",
}));

jest.mock("@/hooks", () => ({
  useApiQuery: (...args: any[]) => mockUseApiQuery(...args),
}));

jest.mock("@/components", () => ({
  CategoryGrid: ({ categories }: { categories: any[] }) => (
    <div data-testid="category-grid">
      {categories.map((c: any) => (
        <a
          key={c.id}
          href={`/categories/${c.slug}`}
          data-testid={`category-${c.id}`}
        >
          {c.name}
        </a>
      ))}
    </div>
  ),
  Spinner: () => <div data-testid="spinner" />,
  Input: ({
    value,
    onChange,
    placeholder,
  }: {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
  }) => (
    <input
      data-testid="search-input"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
    />
  ),
}));

const mockCategory = (id: string, name: string, slug: string) => ({
  id,
  name,
  slug,
  description: `${name} description`,
  tier: 1,
  isActive: true,
  createdAt: new Date().toISOString(),
});

describe("CategoriesPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseApiQuery.mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    });
  });

  it("renders loading spinner when isLoading", () => {
    mockUseApiQuery.mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
    });
    render(<CategoriesPage />);
    expect(screen.getByTestId("spinner")).toBeInTheDocument();
  });

  it("renders category grid cards", () => {
    mockUseApiQuery.mockReturnValue({
      data: {
        data: [
          mockCategory("c1", "Electronics", "electronics"),
          mockCategory("c2", "Clothing", "clothing"),
        ],
        meta: { total: 2 },
      },
      isLoading: false,
      error: null,
    });
    render(<CategoriesPage />);
    expect(screen.getByTestId("category-grid")).toBeInTheDocument();
    expect(screen.getByText("Electronics")).toBeInTheDocument();
    expect(screen.getByText("Clothing")).toBeInTheDocument();
  });

  it("each card links to /categories/:slug", () => {
    mockUseApiQuery.mockReturnValue({
      data: {
        data: [mockCategory("c1", "Electronics", "electronics")],
        meta: { total: 1 },
      },
      isLoading: false,
      error: null,
    });
    render(<CategoriesPage />);
    const link = screen.getByTestId("category-c1");
    expect(link).toHaveAttribute("href", "/categories/electronics");
  });

  it("renders EmptyState when no categories", () => {
    mockUseApiQuery.mockReturnValue({
      data: { data: [], meta: { total: 0 } },
      isLoading: false,
      error: null,
    });
    render(<CategoriesPage />);
    // When data.data is empty the CategoryGrid renders with 0 items
    expect(screen.getByTestId("category-grid")).toBeInTheDocument();
    expect(screen.queryByTestId(/category-c/)).not.toBeInTheDocument();
  });

  it("search input filters the displayed category list", () => {
    mockUseApiQuery.mockReturnValue({
      data: {
        data: [
          mockCategory("c1", "Electronics", "electronics"),
          mockCategory("c2", "Bags & Purses", "bags"),
        ],
        meta: { total: 2 },
      },
      isLoading: false,
      error: null,
    });
    render(<CategoriesPage />);
    const searchInput = screen.getByTestId("search-input");
    fireEvent.change(searchInput, { target: { value: "elec" } });
    // After filtering, only Electronics should be visible
    expect(screen.getByText("Electronics")).toBeInTheDocument();
    expect(screen.queryByText("Bags & Purses")).not.toBeInTheDocument();
  });
});
