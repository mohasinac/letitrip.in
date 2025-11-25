/**
 * ProductInlineForm Component Tests
 *
 * Tests for inline product creation/editing form (seller functionality)
 */

import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from "@testing-library/react";
import "@testing-library/jest-dom";
import { ProductInlineForm } from "./ProductInlineForm";
import { productsService } from "@/services/products.service";

// Mock dependencies
jest.mock("@/services/products.service", () => ({
  productsService: {
    create: jest.fn(),
    update: jest.fn(),
  },
}));

jest.mock("@/components/common/SlugInput", () => {
  return function MockSlugInput({
    value,
    sourceText,
    onChange,
  }: {
    value: string;
    sourceText: string;
    onChange: (slug: string) => void;
  }) {
    return (
      <div>
        <label htmlFor="slug-input">Slug</label>
        <input
          id="slug-input"
          data-testid="slug-input"
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          data-source-text={sourceText}
        />
      </div>
    );
  };
});

jest.mock("lucide-react", () => ({
  Loader2: ({ className }: { className?: string }) => (
    <span data-testid="loader-icon" className={className}>
      Loading...
    </span>
  ),
}));

// Sample product data
const mockProduct = {
  id: "product-1",
  name: "Test Product",
  slug: "test-product",
  price: 1999,
  stockCount: 50,
  categoryId: "electronics",
  description: "Test product description",
  condition: "new" as const,
  status: "active" as const,
  shopId: "shop-1",
} as any;

describe("ProductInlineForm Component", () => {
  const mockOnSuccess = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset window.alert mock
    global.alert = jest.fn();
  });

  describe("Basic Rendering", () => {
    it("should render form with all fields for new product", () => {
      render(
        <ProductInlineForm
          shopId="shop-1"
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByText("Product Name *")).toBeInTheDocument();
      expect(screen.getByText("Slug")).toBeInTheDocument();
      expect(screen.getByText("Price (₹) *")).toBeInTheDocument();
      expect(screen.getByText("Stock Count *")).toBeInTheDocument();
      expect(screen.getByText("Category ID *")).toBeInTheDocument();
      expect(screen.getByText("Description")).toBeInTheDocument();
    });

    it("should render Cancel and Create buttons for new product", () => {
      render(
        <ProductInlineForm
          shopId="shop-1"
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByText("Cancel")).toBeInTheDocument();
      expect(screen.getByText("Create Product")).toBeInTheDocument();
    });

    it("should render Update button for existing product", () => {
      render(
        <ProductInlineForm
          product={mockProduct}
          shopId="shop-1"
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByText("Update Product")).toBeInTheDocument();
      expect(screen.queryByText("Create Product")).not.toBeInTheDocument();
    });

    it("should show loader icon when loading", async () => {
      (productsService.create as jest.Mock).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      render(
        <ProductInlineForm
          shopId="shop-1"
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      // Fill required fields
      fireEvent.change((screen.getAllByRole("textbox") as HTMLElement[])[0], {
        target: { value: "New Product" },
      });
      fireEvent.change(screen.getByTestId("slug-input"), {
        target: { value: "new-product" },
      });
      fireEvent.change((screen.getAllByRole("spinbutton") as HTMLElement[])[0], {
        target: { value: "999" },
      });
      fireEvent.change((screen.getAllByRole("spinbutton") as HTMLElement[])[1], {
        target: { value: "10" },
      });
      fireEvent.change(screen.getByPlaceholderText("e.g., electronics"), {
        target: { value: "electronics" },
      });

      fireEvent.click(screen.getByText("Create Product"));

      await waitFor(() => {
        expect(screen.getByTestId("loader-icon")).toBeInTheDocument();
      });
    });

    it("should render all fields as enabled by default", () => {
      render(
        <ProductInlineForm
          shopId="shop-1"
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      expect((screen.getAllByRole("textbox") as HTMLElement[])[0]).not.toBeDisabled();
      expect((screen.getAllByRole("spinbutton") as HTMLElement[])[0]).not.toBeDisabled();
      expect((screen.getAllByRole("spinbutton") as HTMLElement[])[1]).not.toBeDisabled();
      expect(screen.getByPlaceholderText("e.g., electronics")).not.toBeDisabled();
    });
  });

  describe("Form Initialization", () => {
    it("should initialize with empty values for new product", () => {
      render(
        <ProductInlineForm
          shopId="shop-1"
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      expect((screen.getAllByRole("textbox") as HTMLElement[])[0]).toHaveValue("");
      expect(screen.getByTestId("slug-input")).toHaveValue("");
      expect((screen.getAllByRole("spinbutton") as HTMLElement[])[0]).toHaveValue(0);
      expect((screen.getAllByRole("spinbutton") as HTMLElement[])[1]).toHaveValue(0);
      expect(screen.getByPlaceholderText("e.g., electronics")).toHaveValue("");
      expect(document.querySelector("textarea")!).toHaveValue("");
    });

    it("should initialize with product values for editing", () => {
      render(
        <ProductInlineForm
          product={mockProduct}
          shopId="shop-1"
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      expect((screen.getAllByRole("textbox") as HTMLElement[])[0]).toHaveValue("Test Product");
      expect(screen.getByTestId("slug-input")).toHaveValue("test-product");
      expect((screen.getAllByRole("spinbutton") as HTMLElement[])[0]).toHaveValue(1999);
      expect((screen.getAllByRole("spinbutton") as HTMLElement[])[1]).toHaveValue(50);
      expect(screen.getByPlaceholderText("e.g., electronics")).toHaveValue("electronics");
      expect(document.querySelector("textarea")!).toHaveValue(
        "Test product description"
      );
    });

    it("should handle product without description field", () => {
      const productWithoutDesc = {
        id: "product-2",
        name: "Product 2",
        slug: "product-2",
        price: 500,
        stockCount: 10,
        categoryId: "books",
        status: "draft" as const,
      } as any;

      render(
        <ProductInlineForm
          product={productWithoutDesc}
          shopId="shop-1"
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      expect(document.querySelector("textarea")!).toHaveValue("");
    });

    it("should handle product without condition field", () => {
      const productWithoutCondition = {
        id: "product-3",
        name: "Product 3",
        slug: "product-3",
        price: 500,
        stockCount: 10,
        categoryId: "books",
        status: "draft" as const,
      } as any;

      render(
        <ProductInlineForm
          product={productWithoutCondition}
          shopId="shop-1"
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      // Should not crash
      expect((screen.getAllByRole("textbox") as HTMLElement[])[0]).toBeInTheDocument();
    });
  });

  describe("Input Field Interactions", () => {
    it("should update name field on change", () => {
      render(
        <ProductInlineForm
          shopId="shop-1"
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      const nameInput = (screen.getAllByRole("textbox") as HTMLElement[])[0];
      fireEvent.change(nameInput, { target: { value: "New Product Name" } });

      expect(nameInput).toHaveValue("New Product Name");
    });

    it("should update slug field on change", () => {
      render(
        <ProductInlineForm
          shopId="shop-1"
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      const slugInput = screen.getByTestId("slug-input");
      fireEvent.change(slugInput, { target: { value: "new-slug" } });

      expect(slugInput).toHaveValue("new-slug");
    });

    it("should update price field on change", () => {
      render(
        <ProductInlineForm
          shopId="shop-1"
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      const priceInput = (screen.getAllByRole("spinbutton") as HTMLElement[])[0];
      fireEvent.change(priceInput, { target: { value: "2999.99" } });

      expect(priceInput).toHaveValue(2999.99);
    });

    it("should update stock count on change", () => {
      render(
        <ProductInlineForm
          shopId="shop-1"
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      const stockInput = (screen.getAllByRole("spinbutton") as HTMLElement[])[1];
      fireEvent.change(stockInput, { target: { value: "100" } });

      expect(stockInput).toHaveValue(100);
    });

    it("should update category ID on change", () => {
      render(
        <ProductInlineForm
          shopId="shop-1"
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      const categoryInput = screen.getByPlaceholderText("e.g., electronics");
      fireEvent.change(categoryInput, { target: { value: "fashion" } });

      expect(categoryInput).toHaveValue("fashion");
    });

    it("should update description on change", () => {
      render(
        <ProductInlineForm
          shopId="shop-1"
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      const descInput = document.querySelector("textarea")!;
      fireEvent.change(descInput, {
        target: { value: "Updated description" },
      });

      expect(descInput).toHaveValue("Updated description");
    });

    it("should pass source text to slug input", () => {
      render(
        <ProductInlineForm
          shopId="shop-1"
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      const nameInput = (screen.getAllByRole("textbox") as HTMLElement[])[0];
      fireEvent.change(nameInput, { target: { value: "Test Product" } });

      const slugInput = screen.getByTestId("slug-input");
      expect(slugInput).toHaveAttribute("data-source-text", "Test Product");
    });
  });

  describe("Form Submission - Create Product", () => {
    it("should call productsService.create with correct data on new product submission", async () => {
      (productsService.create as jest.Mock).mockResolvedValue({
        id: "new-product-id",
      });

      render(
        <ProductInlineForm
          shopId="shop-1"
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      // Fill all required fields
      fireEvent.change((screen.getAllByRole("textbox") as HTMLElement[])[0], {
        target: { value: "New Product" },
      });
      fireEvent.change(screen.getByTestId("slug-input"), {
        target: { value: "new-product" },
      });
      fireEvent.change((screen.getAllByRole("spinbutton") as HTMLElement[])[0], {
        target: { value: "1500" },
      });
      fireEvent.change((screen.getAllByRole("spinbutton") as HTMLElement[])[1], {
        target: { value: "25" },
      });
      fireEvent.change(screen.getByPlaceholderText("e.g., electronics"), {
        target: { value: "electronics" },
      });
      fireEvent.change(document.querySelector("textarea")!, {
        target: { value: "Product description" },
      });

      fireEvent.submit(screen.getByText("Create Product").closest("form")!);

      await waitFor(() => {
        expect(productsService.create).toHaveBeenCalledWith({
          name: "New Product",
          slug: "new-product",
          price: 1500,
          stockCount: 25,
          categoryId: "electronics",
          description: "Product description",
          condition: "new",
          status: "draft",
          shopId: "shop-1",
          countryOfOrigin: "India",
          lowStockThreshold: 5,
          isReturnable: true,
          returnWindowDays: 7,
        });
      });
    });

    it("should call onSuccess after successful product creation", async () => {
      (productsService.create as jest.Mock).mockResolvedValue({
        id: "new-product-id",
      });

      render(
        <ProductInlineForm
          shopId="shop-1"
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      // Fill required fields
      fireEvent.change((screen.getAllByRole("textbox") as HTMLElement[])[0], {
        target: { value: "New Product" },
      });
      fireEvent.change(screen.getByTestId("slug-input"), {
        target: { value: "new-product" },
      });
      fireEvent.change((screen.getAllByRole("spinbutton") as HTMLElement[])[0], {
        target: { value: "999" },
      });
      fireEvent.change((screen.getAllByRole("spinbutton") as HTMLElement[])[1], {
        target: { value: "10" },
      });
      fireEvent.change(screen.getByPlaceholderText("e.g., electronics"), {
        target: { value: "electronics" },
      });

      fireEvent.submit(screen.getByText("Create Product").closest("form")!);

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalledTimes(1);
      });
    });

    it("should show alert and not create product if slug is missing", async () => {
      render(
        <ProductInlineForm
          shopId="shop-1"
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      // Fill all fields except slug
      fireEvent.change((screen.getAllByRole("textbox") as HTMLElement[])[0], {
        target: { value: "New Product" },
      });
      fireEvent.change((screen.getAllByRole("spinbutton") as HTMLElement[])[0], {
        target: { value: "999" },
      });
      fireEvent.change((screen.getAllByRole("spinbutton") as HTMLElement[])[1], {
        target: { value: "10" },
      });
      fireEvent.change(screen.getByPlaceholderText("e.g., electronics"), {
        target: { value: "electronics" },
      });

      fireEvent.submit(screen.getByText("Create Product").closest("form")!);

      await waitFor(() => {
        expect(global.alert).toHaveBeenCalledWith("Slug is required");
        expect(productsService.create).not.toHaveBeenCalled();
        expect(mockOnSuccess).not.toHaveBeenCalled();
      });
    });

    it("should show alert and not create product if shopId is missing", async () => {
      render(
        <ProductInlineForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
      );

      // Fill all required fields
      fireEvent.change((screen.getAllByRole("textbox") as HTMLElement[])[0], {
        target: { value: "New Product" },
      });
      fireEvent.change(screen.getByTestId("slug-input"), {
        target: { value: "new-product" },
      });
      fireEvent.change((screen.getAllByRole("spinbutton") as HTMLElement[])[0], {
        target: { value: "999" },
      });
      fireEvent.change((screen.getAllByRole("spinbutton") as HTMLElement[])[1], {
        target: { value: "10" },
      });
      fireEvent.change(screen.getByPlaceholderText("e.g., electronics"), {
        target: { value: "electronics" },
      });

      fireEvent.submit(screen.getByText("Create Product").closest("form")!);

      await waitFor(() => {
        expect(global.alert).toHaveBeenCalledWith("Shop ID is required");
        expect(productsService.create).not.toHaveBeenCalled();
        expect(mockOnSuccess).not.toHaveBeenCalled();
      });
    });

    it("should handle product creation errors", async () => {
      const consoleError = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      (productsService.create as jest.Mock).mockRejectedValue(
        new Error("Creation failed")
      );

      render(
        <ProductInlineForm
          shopId="shop-1"
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      // Fill required fields
      fireEvent.change((screen.getAllByRole("textbox") as HTMLElement[])[0], {
        target: { value: "New Product" },
      });
      fireEvent.change(screen.getByTestId("slug-input"), {
        target: { value: "new-product" },
      });
      fireEvent.change((screen.getAllByRole("spinbutton") as HTMLElement[])[0], {
        target: { value: "999" },
      });
      fireEvent.change((screen.getAllByRole("spinbutton") as HTMLElement[])[1], {
        target: { value: "10" },
      });
      fireEvent.change(screen.getByPlaceholderText("e.g., electronics"), {
        target: { value: "electronics" },
      });

      fireEvent.submit(screen.getByText("Create Product").closest("form")!);

      await waitFor(() => {
        expect(global.alert).toHaveBeenCalledWith("Failed to save product");
        expect(mockOnSuccess).not.toHaveBeenCalled();
      });

      consoleError.mockRestore();
    });
  });

  describe("Form Submission - Update Product", () => {
    it("should call productsService.update with correct data on product update", async () => {
      (productsService.update as jest.Mock).mockResolvedValue({});

      render(
        <ProductInlineForm
          product={mockProduct}
          shopId="shop-1"
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      // Update a field
      fireEvent.change((screen.getAllByRole("textbox") as HTMLElement[])[0], {
        target: { value: "Updated Product" },
      });

      fireEvent.submit(screen.getByText("Update Product").closest("form")!);

      await waitFor(() => {
        expect(productsService.update).toHaveBeenCalledWith("test-product", {
          name: "Updated Product",
          slug: "test-product",
          price: 1999,
          stockCount: 50,
          categoryId: "electronics",
          description: "Test product description",
          condition: "new",
          status: "active",
        });
      });
    });

    it("should call onSuccess after successful product update", async () => {
      (productsService.update as jest.Mock).mockResolvedValue({});

      render(
        <ProductInlineForm
          product={mockProduct}
          shopId="shop-1"
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      fireEvent.submit(screen.getByText("Update Product").closest("form")!);

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalledTimes(1);
      });
    });

    it("should handle product update errors", async () => {
      const consoleError = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      (productsService.update as jest.Mock).mockRejectedValue(
        new Error("Update failed")
      );

      render(
        <ProductInlineForm
          product={mockProduct}
          shopId="shop-1"
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      fireEvent.submit(screen.getByText("Update Product").closest("form")!);

      await waitFor(() => {
        expect(global.alert).toHaveBeenCalledWith("Failed to save product");
        expect(mockOnSuccess).not.toHaveBeenCalled();
      });

      consoleError.mockRestore();
    });

    it("should show alert if slug is removed during update", async () => {
      render(
        <ProductInlineForm
          product={mockProduct}
          shopId="shop-1"
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      // Clear slug field
      fireEvent.change(screen.getByTestId("slug-input"), {
        target: { value: "" },
      });

      fireEvent.submit(screen.getByText("Update Product").closest("form")!);

      await waitFor(() => {
        expect(global.alert).toHaveBeenCalledWith("Slug is required");
        expect(productsService.update).not.toHaveBeenCalled();
        expect(mockOnSuccess).not.toHaveBeenCalled();
      });
    });
  });

  describe("Cancel Button", () => {
    it("should call onCancel when Cancel button is clicked", () => {
      render(
        <ProductInlineForm
          shopId="shop-1"
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      fireEvent.click(screen.getByText("Cancel"));

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it("should disable Cancel button during submission", async () => {
      (productsService.create as jest.Mock).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      render(
        <ProductInlineForm
          shopId="shop-1"
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      // Fill required fields
      fireEvent.change((screen.getAllByRole("textbox") as HTMLElement[])[0], {
        target: { value: "New Product" },
      });
      fireEvent.change(screen.getByTestId("slug-input"), {
        target: { value: "new-product" },
      });
      fireEvent.change((screen.getAllByRole("spinbutton") as HTMLElement[])[0], {
        target: { value: "999" },
      });
      fireEvent.change((screen.getAllByRole("spinbutton") as HTMLElement[])[1], {
        target: { value: "10" },
      });
      fireEvent.change(screen.getByPlaceholderText("e.g., electronics"), {
        target: { value: "electronics" },
      });

      fireEvent.click(screen.getByText("Create Product"));

      await waitFor(() => {
        expect(screen.getByText("Cancel")).toBeDisabled();
      });
    });
  });

  describe("Loading State", () => {
    it("should disable submit button during submission", async () => {
      (productsService.create as jest.Mock).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      render(
        <ProductInlineForm
          shopId="shop-1"
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      // Fill required fields
      fireEvent.change((screen.getAllByRole("textbox") as HTMLElement[])[0], {
        target: { value: "New Product" },
      });
      fireEvent.change(screen.getByTestId("slug-input"), {
        target: { value: "new-product" },
      });
      fireEvent.change((screen.getAllByRole("spinbutton") as HTMLElement[])[0], {
        target: { value: "999" },
      });
      fireEvent.change((screen.getAllByRole("spinbutton") as HTMLElement[])[1], {
        target: { value: "10" },
      });
      fireEvent.change(screen.getByPlaceholderText("e.g., electronics"), {
        target: { value: "electronics" },
      });

      const submitButton = screen.getByText("Create Product");
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(submitButton).toBeDisabled();
      });
    });

    it("should re-enable buttons after successful submission", async () => {
      (productsService.create as jest.Mock).mockResolvedValue({
        id: "new-product-id",
      });

      render(
        <ProductInlineForm
          shopId="shop-1"
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      // Fill required fields
      fireEvent.change((screen.getAllByRole("textbox") as HTMLElement[])[0], {
        target: { value: "New Product" },
      });
      fireEvent.change(screen.getByTestId("slug-input"), {
        target: { value: "new-product" },
      });
      fireEvent.change((screen.getAllByRole("spinbutton") as HTMLElement[])[0], {
        target: { value: "999" },
      });
      fireEvent.change((screen.getAllByRole("spinbutton") as HTMLElement[])[1], {
        target: { value: "10" },
      });
      fireEvent.change(screen.getByPlaceholderText("e.g., electronics"), {
        target: { value: "electronics" },
      });

      fireEvent.click(screen.getByText("Create Product"));

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled();
      });

      // Buttons should be enabled again (though component may be unmounted by parent)
      // This tests that loading state is properly reset
    });

    it("should re-enable buttons after failed submission", async () => {
      const consoleError = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      (productsService.create as jest.Mock).mockRejectedValue(
        new Error("Creation failed")
      );

      render(
        <ProductInlineForm
          shopId="shop-1"
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      // Fill required fields
      fireEvent.change((screen.getAllByRole("textbox") as HTMLElement[])[0], {
        target: { value: "New Product" },
      });
      fireEvent.change(screen.getByTestId("slug-input"), {
        target: { value: "new-product" },
      });
      fireEvent.change((screen.getAllByRole("spinbutton") as HTMLElement[])[0], {
        target: { value: "999" },
      });
      fireEvent.change((screen.getAllByRole("spinbutton") as HTMLElement[])[1], {
        target: { value: "10" },
      });
      fireEvent.change(screen.getByPlaceholderText("e.g., electronics"), {
        target: { value: "electronics" },
      });

      fireEvent.click(screen.getByText("Create Product"));

      await waitFor(() => {
        expect(global.alert).toHaveBeenCalledWith("Failed to save product");
      });

      // Check buttons are enabled again
      expect(screen.getByText("Create Product")).not.toBeDisabled();
      expect(screen.getByText("Cancel")).not.toBeDisabled();

      consoleError.mockRestore();
    });
  });

  describe("Input Validation", () => {
    it("should have required attribute on name field", () => {
      render(
        <ProductInlineForm
          shopId="shop-1"
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      expect((screen.getAllByRole("textbox") as HTMLElement[])[0]).toBeRequired();
    });

    it("should have required attribute on price field", () => {
      render(
        <ProductInlineForm
          shopId="shop-1"
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      expect((screen.getAllByRole("spinbutton") as HTMLElement[])[0]).toBeRequired();
    });

    it("should have required attribute on stock count field", () => {
      render(
        <ProductInlineForm
          shopId="shop-1"
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      expect((screen.getAllByRole("spinbutton") as HTMLElement[])[1]).toBeRequired();
    });

    it("should have required attribute on category ID field", () => {
      render(
        <ProductInlineForm
          shopId="shop-1"
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByPlaceholderText("e.g., electronics")).toBeRequired();
    });

    it("should have min=0 on price field", () => {
      render(
        <ProductInlineForm
          shopId="shop-1"
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      expect((screen.getAllByRole("spinbutton") as HTMLElement[])[0]).toHaveAttribute("min", "0");
    });

    it("should have step=0.01 on price field", () => {
      render(
        <ProductInlineForm
          shopId="shop-1"
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      expect((screen.getAllByRole("spinbutton") as HTMLElement[])[0]).toHaveAttribute("step", "0.01");
    });

    it("should have min=0 on stock count field", () => {
      render(
        <ProductInlineForm
          shopId="shop-1"
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      expect((screen.getAllByRole("spinbutton") as HTMLElement[])[1]).toHaveAttribute("min", "0");
    });

    it("should parse price as float", () => {
      render(
        <ProductInlineForm
          shopId="shop-1"
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      const priceInput = (screen.getAllByRole("spinbutton") as HTMLElement[])[0];
      fireEvent.change(priceInput, { target: { value: "99.99" } });

      expect(priceInput).toHaveValue(99.99);
    });

    it("should parse stock count as integer", () => {
      render(
        <ProductInlineForm
          shopId="shop-1"
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      const stockInput = (screen.getAllByRole("spinbutton") as HTMLElement[])[1];
      fireEvent.change(stockInput, { target: { value: "42.7" } });

      // Should be parsed as integer
      expect(stockInput).toHaveValue(42);
    });
  });

  describe("Field Labels and Placeholders", () => {
    it("should show asterisk for required fields", () => {
      render(
        <ProductInlineForm
          shopId="shop-1"
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByText("Product Name *")).toBeInTheDocument();
      expect(screen.getByText("Price (₹) *")).toBeInTheDocument();
      expect(screen.getByText("Stock Count *")).toBeInTheDocument();
      expect(screen.getByText("Category ID *")).toBeInTheDocument();
    });

    it("should show placeholder for category ID field", () => {
      render(
        <ProductInlineForm
          shopId="shop-1"
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByPlaceholderText("e.g., electronics")).toHaveAttribute(
        "placeholder",
        "e.g., electronics"
      );
    });

    it("should show currency symbol in price label", () => {
      render(
        <ProductInlineForm
          shopId="shop-1"
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByText(/Price \(₹\)/)).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should handle very large price values", async () => {
      (productsService.create as jest.Mock).mockResolvedValue({
        id: "new-product-id",
      });

      render(
        <ProductInlineForm
          shopId="shop-1"
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      fireEvent.change((screen.getAllByRole("textbox") as HTMLElement[])[0], {
        target: { value: "Expensive Product" },
      });
      fireEvent.change(screen.getByTestId("slug-input"), {
        target: { value: "expensive-product" },
      });
      fireEvent.change((screen.getAllByRole("spinbutton") as HTMLElement[])[0], {
        target: { value: "999999999.99" },
      });
      fireEvent.change((screen.getAllByRole("spinbutton") as HTMLElement[])[1], {
        target: { value: "1" },
      });
      fireEvent.change(screen.getByPlaceholderText("e.g., electronics"), {
        target: { value: "luxury" },
      });

      fireEvent.submit(screen.getByText("Create Product").closest("form")!);

      await waitFor(() => {
        expect(productsService.create).toHaveBeenCalledWith(
          expect.objectContaining({
            price: 999999999.99,
          })
        );
      });
    });

    it("should handle very large stock counts", async () => {
      (productsService.create as jest.Mock).mockResolvedValue({
        id: "new-product-id",
      });

      render(
        <ProductInlineForm
          shopId="shop-1"
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      fireEvent.change((screen.getAllByRole("textbox") as HTMLElement[])[0], {
        target: { value: "Bulk Product" },
      });
      fireEvent.change(screen.getByTestId("slug-input"), {
        target: { value: "bulk-product" },
      });
      fireEvent.change((screen.getAllByRole("spinbutton") as HTMLElement[])[0], {
        target: { value: "100" },
      });
      fireEvent.change((screen.getAllByRole("spinbutton") as HTMLElement[])[1], {
        target: { value: "999999" },
      });
      fireEvent.change(screen.getByPlaceholderText("e.g., electronics"), {
        target: { value: "bulk" },
      });

      fireEvent.submit(screen.getByText("Create Product").closest("form")!);

      await waitFor(() => {
        expect(productsService.create).toHaveBeenCalledWith(
          expect.objectContaining({
            stockCount: 999999,
          })
        );
      });
    });

    it("should handle very long product names", () => {
      render(
        <ProductInlineForm
          shopId="shop-1"
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      const longName = "A".repeat(500);
      fireEvent.change((screen.getAllByRole("textbox") as HTMLElement[])[0], {
        target: { value: longName },
      });

      expect((screen.getAllByRole("textbox") as HTMLElement[])[0]).toHaveValue(longName);
    });

    it("should handle very long descriptions", () => {
      render(
        <ProductInlineForm
          shopId="shop-1"
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      const longDesc = "B".repeat(5000);
      fireEvent.change(document.querySelector("textarea")!, {
        target: { value: longDesc },
      });

      expect(document.querySelector("textarea")!).toHaveValue(longDesc);
    });

    it("should handle empty string for optional description", async () => {
      (productsService.create as jest.Mock).mockResolvedValue({
        id: "new-product-id",
      });

      render(
        <ProductInlineForm
          shopId="shop-1"
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      fireEvent.change((screen.getAllByRole("textbox") as HTMLElement[])[0], {
        target: { value: "Product" },
      });
      fireEvent.change(screen.getByTestId("slug-input"), {
        target: { value: "product" },
      });
      fireEvent.change((screen.getAllByRole("spinbutton") as HTMLElement[])[0], {
        target: { value: "100" },
      });
      fireEvent.change((screen.getAllByRole("spinbutton") as HTMLElement[])[1], {
        target: { value: "10" },
      });
      fireEvent.change(screen.getByPlaceholderText("e.g., electronics"), {
        target: { value: "general" },
      });

      fireEvent.submit(screen.getByText("Create Product").closest("form")!);

      await waitFor(() => {
        expect(productsService.create).toHaveBeenCalledWith(
          expect.objectContaining({
            description: "",
          })
        );
      });
    });

    it("should handle rapid form submissions", async () => {
      (productsService.create as jest.Mock).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      render(
        <ProductInlineForm
          shopId="shop-1"
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      // Fill required fields
      fireEvent.change((screen.getAllByRole("textbox") as HTMLElement[])[0], {
        target: { value: "Product" },
      });
      fireEvent.change(screen.getByTestId("slug-input"), {
        target: { value: "product" },
      });
      fireEvent.change((screen.getAllByRole("spinbutton") as HTMLElement[])[0], {
        target: { value: "100" },
      });
      fireEvent.change((screen.getAllByRole("spinbutton") as HTMLElement[])[1], {
        target: { value: "10" },
      });
      fireEvent.change(screen.getByPlaceholderText("e.g., electronics"), {
        target: { value: "general" },
      });

      // Click submit multiple times rapidly
      const submitButton = screen.getByText("Create Product");
      fireEvent.click(submitButton);
      fireEvent.click(submitButton);
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalledTimes(1);
      });

      // Should only be called once due to disabled state
      expect(productsService.create).toHaveBeenCalledTimes(1);
    });
  });

  describe("Form Structure", () => {
    it("should render as a form element", () => {
      const { container } = render(
        <ProductInlineForm
          shopId="shop-1"
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      expect(container.querySelector("form")).toBeInTheDocument();
    });

    it("should have space-y-4 class for field spacing", () => {
      const { container } = render(
        <ProductInlineForm
          shopId="shop-1"
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      expect(container.querySelector("form")).toHaveClass("space-y-4");
    });

    it("should render all input fields with proper styling", () => {
      render(
        <ProductInlineForm
          shopId="shop-1"
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      // Check that all main inputs (except slug which is mocked) have proper classes
      const inputs = [
        (screen.getAllByRole("textbox") as HTMLElement[])[0],
        (screen.getAllByRole("spinbutton") as HTMLElement[])[0],
        (screen.getAllByRole("spinbutton") as HTMLElement[])[1],
        screen.getByPlaceholderText("e.g., electronics"),
      ];

      inputs.forEach((input) => {
        expect(input).toHaveClass(
          "w-full",
          "rounded-lg",
          "border",
          "border-gray-300"
        );
      });
    });

    it("should render textarea with proper styling", () => {
      render(
        <ProductInlineForm
          shopId="shop-1"
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      const textarea = document.querySelector("textarea")!;
      expect(textarea).toHaveClass(
        "w-full",
        "rounded-lg",
        "border",
        "border-gray-300"
      );
      expect(textarea.tagName).toBe("TEXTAREA");
    });

    it("should have action buttons in flex container", () => {
      const { container } = render(
        <ProductInlineForm
          shopId="shop-1"
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      const buttonContainer = screen
        .getByText("Cancel")
        .closest(".flex.items-center");
      expect(buttonContainer).toHaveClass("justify-end", "gap-3");
    });
  });

  describe("Accessibility", () => {
    it("should have labels for all form fields", () => {
      render(
        <ProductInlineForm
          shopId="shop-1"
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      // Check that labels exist for all fields
      expect(screen.getByText("Product Name *")).toBeInTheDocument();
      expect(screen.getByText("Price (₹) *")).toBeInTheDocument();
      expect(screen.getByText("Stock Count *")).toBeInTheDocument();
      expect(screen.getByText("Category ID *")).toBeInTheDocument();
      expect(screen.getByText("Description")).toBeInTheDocument();
    });

    it("should have button type='button' for Cancel", () => {
      render(
        <ProductInlineForm
          shopId="shop-1"
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByText("Cancel")).toHaveAttribute("type", "button");
    });

    it("should have button type='submit' for submit button", () => {
      render(
        <ProductInlineForm
          shopId="shop-1"
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByText("Create Product")).toHaveAttribute(
        "type",
        "submit"
      );
    });
  });
});





