import { render, screen, fireEvent } from "@testing-library/react";
import type React from "react";
import { useProductTableColumns } from "@/components";
import type { AdminProduct } from "@/components";

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

const mockProduct: AdminProduct = {
  id: "prod-1",
  title: "Test Product",
  description: "A test product",
  category: "Electronics",
  price: 999,
  currency: "INR",
  stockQuantity: 10,
  availableQuantity: 10,
  status: "published",
  sellerName: "Seller A",
  sellerEmail: "seller@example.com",
  sellerId: "seller-1",
  featured: true,
  mainImage: "https://example.com/img.jpg",
  images: [],
  tags: [],
  createdAt: "2025-01-01",
  updatedAt: "2025-01-01",
};

describe("useProductTableColumns", () => {
  it("renders edit and delete action buttons", () => {
    const onEdit = jest.fn();
    const onDelete = jest.fn();

    function TestComponent() {
      const { actions } = useProductTableColumns(onEdit, onDelete);
      return <div>{actions(mockProduct)}</div>;
    }

    render(<TestComponent />);

    fireEvent.click(screen.getByRole("button", { name: "edit" }));
    expect(onEdit).toHaveBeenCalledWith(mockProduct);

    fireEvent.click(screen.getByRole("button", { name: "delete" }));
    expect(onDelete).toHaveBeenCalledWith(mockProduct);
  });

  it("returns 7 columns", () => {
    function TestComponent() {
      const { columns } = useProductTableColumns(jest.fn(), jest.fn());
      return <span data-testid="count">{columns.length}</span>;
    }
    render(<TestComponent />);
    expect(screen.getByTestId("count").textContent).toBe("7");
  });

  it("renders yes/no for featured column", () => {
    function TestComponent() {
      const { columns } = useProductTableColumns(jest.fn(), jest.fn());
      const featuredCol = columns.find((c) => c.key === "featured");
      return <div>{featuredCol?.render?.(mockProduct)}</div>;
    }
    render(<TestComponent />);
    expect(screen.getByText("yes")).toBeTruthy();
  });
});
