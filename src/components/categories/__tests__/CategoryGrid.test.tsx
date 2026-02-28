import { render, screen } from "@testing-library/react";
import { CategoryGrid } from "../CategoryGrid";
import type { CategoryDocument } from "@/db/schema";

jest.mock("../CategoryCard", () => ({
  CategoryCard: ({ category }: { category: CategoryDocument }) => (
    <div data-testid="category-card">{category.name}</div>
  ),
}));

const makeCat = (id: string, name: string): CategoryDocument =>
  ({
    id,
    name,
    slug: id,
    tier: 1,
    isActive: true,
    order: 0,
  }) as unknown as CategoryDocument;

describe("CategoryGrid", () => {
  it("renders a grid of category cards", () => {
    const categories = [makeCat("1", "Electronics"), makeCat("2", "Clothing")];
    render(<CategoryGrid categories={categories} />);
    expect(screen.getAllByTestId("category-card")).toHaveLength(2);
    expect(screen.getByText("Electronics")).toBeInTheDocument();
    expect(screen.getByText("Clothing")).toBeInTheDocument();
  });

  it("shows empty state when categories array is empty", () => {
    render(<CategoryGrid categories={[]} />);
    // The translated keys match what's in messages/en.json
    expect(screen.getByText("No categories found")).toBeInTheDocument();
    expect(
      screen.getByText("Check back soon for new categories"),
    ).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const cats = [makeCat("1", "Test")];
    const { container } = render(
      <CategoryGrid categories={cats} className="custom-class" />,
    );
    expect(container.firstChild).toHaveClass("custom-class");
  });
});
