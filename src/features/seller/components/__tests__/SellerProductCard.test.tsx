/**
 * @jest-environment jsdom
 */
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { SellerProductCard } from "../SellerProductCard";

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

jest.mock("@/components", () => ({
  Badge: ({ children, variant }: any) => (
    <span data-testid="badge" data-variant={variant}>
      {children}
    </span>
  ),
}));

jest.mock("@/constants", () => ({
  THEME_CONSTANTS: {
    themed: {
      bgPrimary: "bg-white",
      textPrimary: "text-gray-900",
      textSecondary: "text-gray-600",
      border: "border-gray-200",
    },
    icon: { muted: "text-gray-400" },
  },
}));

jest.mock("@/utils", () => ({
  formatCurrency: (v: number) => `₹${v}`,
}));

const mockProduct = {
  id: "prod_1",
  title: "Test Product",
  price: 999,
  currency: "INR",
  status: "published" as const,
  mainImage: "",
  description: "",
  category: "Electronics",
};

describe("SellerProductCard", () => {
  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => jest.clearAllMocks());

  it("renders without crashing", () => {
    render(
      <SellerProductCard
        product={mockProduct as any}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />,
    );
  });

  it("renders product title", () => {
    render(
      <SellerProductCard
        product={mockProduct as any}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />,
    );
    expect(screen.getByText("Test Product")).toBeInTheDocument();
  });

  it("renders formatted product price", () => {
    render(
      <SellerProductCard
        product={mockProduct as any}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />,
    );
    expect(screen.getByText("₹999")).toBeInTheDocument();
  });

  it("renders a status badge", () => {
    render(
      <SellerProductCard
        product={mockProduct as any}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />,
    );
    expect(screen.getByTestId("badge")).toBeInTheDocument();
  });

  it("calls onEdit when edit button is clicked", () => {
    render(
      <SellerProductCard
        product={mockProduct as any}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />,
    );
    const editBtn = screen.getByText("edit");
    fireEvent.click(editBtn);
    expect(mockOnEdit).toHaveBeenCalledWith(mockProduct);
  });

  it("calls onDelete when delete button is clicked", () => {
    render(
      <SellerProductCard
        product={mockProduct as any}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />,
    );
    const deleteBtn = screen.getByText("delete");
    fireEvent.click(deleteBtn);
    expect(mockOnDelete).toHaveBeenCalledWith(mockProduct);
  });
});
