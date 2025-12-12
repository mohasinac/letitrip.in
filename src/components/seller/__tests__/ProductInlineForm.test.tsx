import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ProductInlineForm } from "../ProductInlineForm";

// Mock dependencies
jest.mock("@/services/products.service");
const productsService = require("@/services/products.service");

jest.mock("@/lib/firebase-error-logger", () => ({
  logError: jest.fn(),
}));

jest.mock("@/components/common/SlugInput", () => ({
  __esModule: true,
  default: ({
    value,
    onChange,
    sourceText,
  }: {
    value: string;
    onChange: (value: string) => void;
    sourceText?: string;
  }) => (
    <div>
      <label htmlFor="slug-input">Slug</label>
      <input
        id="slug-input"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        data-testid="slug-input"
        data-sourcetext={sourceText}
      />
    </div>
  ),
}));

jest.mock("lucide-react", () => ({
  Loader2: ({ className }: { className?: string }) => (
    <span className={className} data-testid="loader-icon">
      Loading...
    </span>
  ),
}));

describe("ProductInlineForm", () => {
  let mockOnSuccess: jest.Mock;
  let mockOnCancel: jest.Mock;
  const shopId = "shop-123";

  beforeEach(() => {
    mockOnSuccess = jest.fn();
    mockOnCancel = jest.fn();
    productsService.create = jest.fn().mockResolvedValue({});
    productsService.update = jest.fn().mockResolvedValue({});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("Form Rendering", () => {
    it("renders all form fields for create mode", () => {
      render(
        <ProductInlineForm
          shopId={shopId}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      expect(
        screen.getByRole("textbox", { name: /product name/i })
      ).toBeInTheDocument();
      expect(screen.getByLabelText("Slug")).toBeInTheDocument();
      expect(
        screen.getByRole("spinbutton", { name: /price/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("spinbutton", { name: /stock count/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("textbox", { name: /category id/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("textbox", { name: /description/i })
      ).toBeInTheDocument();
    });

    it("renders Create Product button in create mode", () => {
      render(
        <ProductInlineForm
          shopId={shopId}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByText("Create Product")).toBeInTheDocument();
    });

    it("renders Update Product button in edit mode", () => {
      const product = {
        id: "prod-1",
        name: "Test Product",
        slug: "test-product",
        price: 1000,
        stockCount: 10,
        categoryId: "cat-1",
        status: "active" as const,
      };

      render(
        <ProductInlineForm
          product={product}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByText("Update Product")).toBeInTheDocument();
    });

    it("renders Cancel button", () => {
      render(
        <ProductInlineForm
          shopId={shopId}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByText("Cancel")).toBeInTheDocument();
    });
  });

  describe("Product Name Input", () => {
    it("allows entering product name", () => {
      render(
        <ProductInlineForm
          shopId={shopId}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      const nameInput = screen.getByLabelText(
        "Product Name"
      ) as HTMLInputElement;
      fireEvent.change(nameInput, { target: { value: "Gaming Laptop" } });

      expect(nameInput.value).toBe("Gaming Laptop");
    });

    it("passes product name to SlugInput as sourceText", () => {
      render(
        <ProductInlineForm
          shopId={shopId}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      const nameInput = screen.getByRole("textbox", { name: /product name/i });
      fireEvent.change(nameInput, { target: { value: "Gaming Laptop" } });

      const slugInput = screen.getByTestId("slug-input");
      expect(slugInput).toHaveAttribute("data-sourcetext", "Gaming Laptop");
    });
  });

  describe("Slug Input", () => {
    it("renders SlugInput component", () => {
      render(
        <ProductInlineForm
          shopId={shopId}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByTestId("slug-input")).toBeInTheDocument();
    });

    it("allows entering slug value", () => {
      render(
        <ProductInlineForm
          shopId={shopId}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      const slugInput = screen.getByTestId("slug-input") as HTMLInputElement;
      fireEvent.change(slugInput, { target: { value: "gaming-laptop" } });

      expect(slugInput.value).toBe("gaming-laptop");
    });
  });

  describe("Price Input", () => {
    it("allows entering price", () => {
      render(
        <ProductInlineForm
          shopId={shopId}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      const priceInput = screen.getByRole("spinbutton", {
        name: /price/i,
      }) as HTMLInputElement;
      fireEvent.change(priceInput, { target: { value: "45000" } });

      expect(priceInput.value).toBe("45000");
    });

    it("accepts decimal prices", () => {
      render(
        <ProductInlineForm
          shopId={shopId}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      const priceInput = screen.getByRole("spinbutton", {
        name: /price/i,
      }) as HTMLInputElement;
      fireEvent.change(priceInput, { target: { value: "999.99" } });

      expect(priceInput.value).toBe("999.99");
    });
  });

  describe("Stock Count Input", () => {
    it("allows entering stock count", () => {
      render(
        <ProductInlineForm
          shopId={shopId}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      const stockInput = screen.getByLabelText(
        "Stock Count"
      ) as HTMLInputElement;
      fireEvent.change(stockInput, { target: { value: "50" } });

      expect(stockInput.value).toBe("50");
    });
  });

  describe("Category Input", () => {
    it("allows entering category ID", () => {
      render(
        <ProductInlineForm
          shopId={shopId}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      const categoryInput = screen.getByLabelText(
        "Category ID"
      ) as HTMLInputElement;
      fireEvent.change(categoryInput, { target: { value: "electronics" } });

      expect(categoryInput.value).toBe("electronics");
    });

    it("shows placeholder for category", () => {
      render(
        <ProductInlineForm
          shopId={shopId}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      const categoryInput = screen.getByRole("textbox", {
        name: /category id/i,
      });
      expect(categoryInput).toHaveAttribute("placeholder", "e.g., electronics");
    });
  });

  describe("Description Input", () => {
    it("renders description textarea", () => {
      render(
        <ProductInlineForm
          shopId={shopId}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      expect(
        screen.getByRole("textbox", { name: /description/i })
      ).toBeInTheDocument();
    });

    it("allows entering description", () => {
      render(
        <ProductInlineForm
          shopId={shopId}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      const descInput = screen.getByLabelText(
        "Description"
      ) as HTMLTextAreaElement;
      fireEvent.change(descInput, {
        target: { value: "High-performance gaming laptop" },
      });

      expect(descInput.value).toBe("High-performance gaming laptop");
    });
  });

  describe("Form Validation", () => {
    it("validates required product name", async () => {
      render(
        <ProductInlineForm
          shopId={shopId}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      const submitButton = screen.getByText("Create Product");
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText("Product name is required")
        ).toBeInTheDocument();
      });
      expect(productsService.create).not.toHaveBeenCalled();
    });

    it("validates required slug", async () => {
      render(
        <ProductInlineForm
          shopId={shopId}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      const nameInput = screen.getByRole("textbox", { name: /product name/i });
      fireEvent.change(nameInput, { target: { value: "Test Product" } });

      const submitButton = screen.getByText("Create Product");
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("Slug is required")).toBeInTheDocument();
      });
      expect(productsService.create).not.toHaveBeenCalled();
    });

    it("validates price is greater than 0", async () => {
      render(
        <ProductInlineForm
          shopId={shopId}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      const nameInput = screen.getByRole("textbox", { name: /product name/i });
      fireEvent.change(nameInput, { target: { value: "Test Product" } });

      const slugInput = screen.getByTestId("slug-input");
      fireEvent.change(slugInput, { target: { value: "test-product" } });

      const priceInput = screen.getByRole("spinbutton", { name: /price/i });
      fireEvent.change(priceInput, { target: { value: "0" } });

      const submitButton = screen.getByText("Create Product");
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText("Price must be greater than 0")
        ).toBeInTheDocument();
      });
      expect(productsService.create).not.toHaveBeenCalled();
    });

    it("validates shopId is provided in create mode", async () => {
      render(
        <ProductInlineForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
      );

      const nameInput = screen.getByRole("textbox", { name: /product name/i });
      fireEvent.change(nameInput, { target: { value: "Test Product" } });

      const slugInput = screen.getByTestId("slug-input");
      fireEvent.change(slugInput, { target: { value: "test-product" } });

      const priceInput = screen.getByRole("spinbutton", { name: /price/i });
      fireEvent.change(priceInput, { target: { value: "100" } });

      const submitButton = screen.getByText("Create Product");
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("Shop ID is required")).toBeInTheDocument();
      });
      expect(productsService.create).not.toHaveBeenCalled();
    });

    it("clears error when name is corrected", async () => {
      render(
        <ProductInlineForm
          shopId={shopId}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      // Submit to trigger error
      const submitButton = screen.getByText("Create Product");
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText("Product name is required")
        ).toBeInTheDocument();
      });

      // Fix the error
      const nameInput = screen.getByRole("textbox", { name: /product name/i });
      fireEvent.change(nameInput, { target: { value: "Test Product" } });

      // Error should be cleared
      expect(
        screen.queryByText("Product name is required")
      ).not.toBeInTheDocument();
    });

    it("clears error when slug is corrected", async () => {
      render(
        <ProductInlineForm
          shopId={shopId}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      const nameInput = screen.getByRole("textbox", { name: /product name/i });
      fireEvent.change(nameInput, { target: { value: "Test" } });

      const submitButton = screen.getByText("Create Product");
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("Slug is required")).toBeInTheDocument();
      });

      const slugInput = screen.getByTestId("slug-input");
      fireEvent.change(slugInput, { target: { value: "test-slug" } });

      expect(screen.queryByText("Slug is required")).not.toBeInTheDocument();
    });

    it("clears error when price is corrected", async () => {
      render(
        <ProductInlineForm
          shopId={shopId}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      const nameInput = screen.getByRole("textbox", { name: /product name/i });
      fireEvent.change(nameInput, { target: { value: "Test" } });

      const slugInput = screen.getByTestId("slug-input");
      fireEvent.change(slugInput, { target: { value: "test" } });

      const priceInput = screen.getByRole("spinbutton", { name: /price/i });
      fireEvent.change(priceInput, { target: { value: "0" } });

      const submitButton = screen.getByText("Create Product");
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText("Price must be greater than 0")
        ).toBeInTheDocument();
      });

      fireEvent.change(priceInput, { target: { value: "100" } });

      expect(
        screen.queryByText("Price must be greater than 0")
      ).not.toBeInTheDocument();
    });
  });

  describe("Form Submission - Create Mode", () => {
    it("creates new product with valid data", async () => {
      render(
        <ProductInlineForm
          shopId={shopId}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      // Fill form
      fireEvent.change(screen.getByRole("textbox", { name: /product name/i }), {
        target: { value: "Gaming Laptop" },
      });
      fireEvent.change(screen.getByTestId("slug-input"), {
        target: { value: "gaming-laptop" },
      });
      fireEvent.change(screen.getByRole("spinbutton", { name: /price/i }), {
        target: { value: "45000" },
      });
      fireEvent.change(
        screen.getByRole("spinbutton", { name: /stock count/i }),
        {
          target: { value: "10" },
        }
      );
      fireEvent.change(screen.getByRole("textbox", { name: /category id/i }), {
        target: { value: "electronics" },
      });
      fireEvent.change(screen.getByRole("textbox", { name: /description/i }), {
        target: { value: "High-performance gaming laptop" },
      });

      const submitButton = screen.getByText("Create Product");
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(productsService.create).toHaveBeenCalledWith(
          expect.objectContaining({
            name: "Gaming Laptop",
            slug: "gaming-laptop",
            price: 45000,
            stockCount: 10,
            categoryId: "electronics",
            description: "High-performance gaming laptop",
            shopId: shopId,
            countryOfOrigin: "India",
            lowStockThreshold: 5,
            isReturnable: true,
            returnWindowDays: 7,
          })
        );
      });

      expect(mockOnSuccess).toHaveBeenCalled();
    });

    it("includes default values for new product", async () => {
      render(
        <ProductInlineForm
          shopId={shopId}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      fireEvent.change(screen.getByRole("textbox", { name: /product name/i }), {
        target: { value: "Test" },
      });
      fireEvent.change(screen.getByTestId("slug-input"), {
        target: { value: "test" },
      });
      fireEvent.change(screen.getByRole("spinbutton", { name: /price/i }), {
        target: { value: "100" },
      });
      fireEvent.change(
        screen.getByRole("spinbutton", { name: /stock count/i }),
        {
          target: { value: "5" },
        }
      );
      fireEvent.change(screen.getByRole("textbox", { name: /category id/i }), {
        target: { value: "test-cat" },
      });

      const submitButton = screen.getByText("Create Product");
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(productsService.create).toHaveBeenCalledWith(
          expect.objectContaining({
            countryOfOrigin: "India",
            lowStockThreshold: 5,
            isReturnable: true,
            returnWindowDays: 7,
          })
        );
      });
    });

    it("shows loading state during submission", async () => {
      productsService.create = jest
        .fn()
        .mockImplementation(
          () => new Promise((resolve) => setTimeout(resolve, 100))
        );

      render(
        <ProductInlineForm
          shopId={shopId}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      fireEvent.change(screen.getByRole("textbox", { name: /product name/i }), {
        target: { value: "Test" },
      });
      fireEvent.change(screen.getByTestId("slug-input"), {
        target: { value: "test" },
      });
      fireEvent.change(screen.getByRole("spinbutton", { name: /price/i }), {
        target: { value: "100" },
      });
      fireEvent.change(
        screen.getByRole("spinbutton", { name: /stock count/i }),
        {
          target: { value: "5" },
        }
      );
      fireEvent.change(screen.getByRole("textbox", { name: /category id/i }), {
        target: { value: "test" },
      });

      const submitButton = screen.getByText("Create Product");
      fireEvent.click(submitButton);

      // Should show loader
      expect(screen.getByTestId("loader-icon")).toBeInTheDocument();

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled();
      });
    });

    it("disables buttons during submission", async () => {
      productsService.create = jest
        .fn()
        .mockImplementation(
          () => new Promise((resolve) => setTimeout(resolve, 100))
        );

      render(
        <ProductInlineForm
          shopId={shopId}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      fireEvent.change(screen.getByRole("textbox", { name: /product name/i }), {
        target: { value: "Test" },
      });
      fireEvent.change(screen.getByTestId("slug-input"), {
        target: { value: "test" },
      });
      fireEvent.change(screen.getByRole("spinbutton", { name: /price/i }), {
        target: { value: "100" },
      });
      fireEvent.change(
        screen.getByRole("spinbutton", { name: /stock count/i }),
        {
          target: { value: "5" },
        }
      );
      fireEvent.change(screen.getByRole("textbox", { name: /category id/i }), {
        target: { value: "test" },
      });

      const submitButton = screen.getByText("Create Product");
      const cancelButton = screen.getByText("Cancel");

      fireEvent.click(submitButton);

      expect(submitButton).toBeDisabled();
      expect(cancelButton).toBeDisabled();

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled();
      });
    });

    it("shows error message on submission failure", async () => {
      productsService.create = jest
        .fn()
        .mockRejectedValue(new Error("Network error"));

      render(
        <ProductInlineForm
          shopId={shopId}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      fireEvent.change(screen.getByRole("textbox", { name: /product name/i }), {
        target: { value: "Test" },
      });
      fireEvent.change(screen.getByTestId("slug-input"), {
        target: { value: "test" },
      });
      fireEvent.change(screen.getByRole("spinbutton", { name: /price/i }), {
        target: { value: "100" },
      });
      fireEvent.change(
        screen.getByRole("spinbutton", { name: /stock count/i }),
        {
          target: { value: "5" },
        }
      );
      fireEvent.change(screen.getByRole("textbox", { name: /category id/i }), {
        target: { value: "test" },
      });

      const submitButton = screen.getByText("Create Product");
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("Network error")).toBeInTheDocument();
      });

      expect(mockOnSuccess).not.toHaveBeenCalled();
    });
  });

  describe("Form Submission - Edit Mode", () => {
    const existingProduct = {
      id: "prod-1",
      name: "Existing Product",
      slug: "existing-product",
      price: 1000,
      stockCount: 20,
      categoryId: "cat-1",
      description: "Existing description",
      condition: "new" as const,
      status: "active" as const,
    };

    it("updates existing product", async () => {
      render(
        <ProductInlineForm
          product={existingProduct}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      // Modify price
      fireEvent.change(screen.getByRole("spinbutton", { name: /price/i }), {
        target: { value: "1500" },
      });

      const submitButton = screen.getByText("Update Product");
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(productsService.update).toHaveBeenCalledWith(
          "existing-product",
          expect.objectContaining({
            price: 1500,
          })
        );
      });

      expect(mockOnSuccess).toHaveBeenCalled();
    });

    it("pre-fills form with existing product data", () => {
      render(
        <ProductInlineForm
          product={existingProduct}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      expect(
        (
          screen.getByRole("textbox", {
            name: /product name/i,
          }) as HTMLInputElement
        ).value
      ).toBe("Existing Product");
      expect((screen.getByTestId("slug-input") as HTMLInputElement).value).toBe(
        "existing-product"
      );
      expect(
        (screen.getByRole("spinbutton", { name: /price/i }) as HTMLInputElement)
          .value
      ).toBe("1000");
      expect(
        (
          screen.getByRole("spinbutton", {
            name: /stock count/i,
          }) as HTMLInputElement
        ).value
      ).toBe("20");
      expect(
        (
          screen.getByRole("textbox", {
            name: /category id/i,
          }) as HTMLInputElement
        ).value
      ).toBe("cat-1");
      expect(
        (
          screen.getByRole("textbox", {
            name: /description/i,
          }) as HTMLTextAreaElement
        ).value
      ).toBe("Existing description");
    });

    it("handles product without description field", () => {
      const productWithoutDescription = {
        id: "prod-2",
        name: "Test",
        slug: "test",
        price: 100,
        stockCount: 10,
        categoryId: "cat-1",
        status: "active" as const,
      };

      render(
        <ProductInlineForm
          product={productWithoutDescription}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      expect(
        (
          screen.getByRole("textbox", {
            name: /description/i,
          }) as HTMLTextAreaElement
        ).value
      ).toBe("");
    });
  });

  describe("Cancel Action", () => {
    it("calls onCancel when cancel button is clicked", () => {
      render(
        <ProductInlineForm
          shopId={shopId}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      const cancelButton = screen.getByText("Cancel");
      fireEvent.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalled();
    });

    it("does not submit form when cancel is clicked", () => {
      render(
        <ProductInlineForm
          shopId={shopId}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      const cancelButton = screen.getByText("Cancel");
      fireEvent.click(cancelButton);

      expect(productsService.create).not.toHaveBeenCalled();
    });
  });

  describe("Dark Mode Support", () => {
    it("has dark mode classes for error message", async () => {
      render(
        <ProductInlineForm
          shopId={shopId}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      const submitButton = screen.getByText("Create Product");
      fireEvent.click(submitButton);

      await waitFor(() => {
        const errorDiv = screen
          .getByText("Product name is required")
          .closest("div");
        expect(errorDiv).toHaveClass("dark:text-red-400");
      });
    });

    it("has dark mode classes for form-level error", async () => {
      productsService.create = jest
        .fn()
        .mockRejectedValue(new Error("Test error"));

      render(
        <ProductInlineForm
          shopId={shopId}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      fireEvent.change(screen.getByRole("textbox", { name: /product name/i }), {
        target: { value: "Test" },
      });
      fireEvent.change(screen.getByTestId("slug-input"), {
        target: { value: "test" },
      });
      fireEvent.change(screen.getByRole("spinbutton", { name: /price/i }), {
        target: { value: "100" },
      });
      fireEvent.change(
        screen.getByRole("spinbutton", { name: /stock count/i }),
        {
          target: { value: "5" },
        }
      );
      fireEvent.change(screen.getByRole("textbox", { name: /category id/i }), {
        target: { value: "test" },
      });

      const submitButton = screen.getByText("Create Product");
      fireEvent.click(submitButton);

      await waitFor(() => {
        const errorDiv = screen.getByText("Test error").closest("div");
        expect(errorDiv).toHaveClass("dark:bg-red-900/20");
        expect(errorDiv).toHaveClass("dark:border-red-800");
      });
    });

    it("has dark mode classes for buttons", () => {
      render(
        <ProductInlineForm
          shopId={shopId}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      const cancelButton = screen.getByText("Cancel");
      expect(cancelButton).toHaveClass("dark:border-gray-600");
      expect(cancelButton).toHaveClass("dark:text-gray-300");
      expect(cancelButton).toHaveClass("dark:hover:bg-gray-700");
    });

    it("has dark mode classes for action border", () => {
      render(
        <ProductInlineForm
          shopId={shopId}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      const actionDiv = screen.getByText("Cancel").closest("div");
      expect(actionDiv).toHaveClass("dark:border-gray-700");
    });
  });

  describe("Accessibility", () => {
    it("renders form element", () => {
      render(
        <ProductInlineForm
          shopId={shopId}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      const forms = document.querySelectorAll("form");
      expect(forms.length).toBeGreaterThan(0);
    });

    it("associates labels with inputs", () => {
      render(
        <ProductInlineForm
          shopId={shopId}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      const nameInput = screen.getByRole("textbox", { name: /product name/i });
      expect(nameInput).toHaveAttribute("id", "product-name");

      const priceInput = screen.getByRole("spinbutton", { name: /price/i });
      expect(priceInput).toHaveAttribute("id", "product-price");

      const stockInput = screen.getByRole("spinbutton", {
        name: /stock count/i,
      });
      expect(stockInput).toHaveAttribute("id", "product-stock");

      const categoryInput = screen.getByRole("textbox", {
        name: /category id/i,
      });
      expect(categoryInput).toHaveAttribute("id", "product-category");

      const descInput = screen.getByRole("textbox", { name: /description/i });
      expect(descInput).toHaveAttribute("id", "product-description");
    });

    it("marks required fields", () => {
      render(
        <ProductInlineForm
          shopId={shopId}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      expect(
        screen.getByRole("textbox", { name: /product name/i })
      ).toBeRequired();
      expect(screen.getByRole("spinbutton", { name: /price/i })).toBeRequired();
      expect(
        screen.getByRole("spinbutton", { name: /stock count/i })
      ).toBeRequired();
      expect(
        screen.getByRole("textbox", { name: /category id/i })
      ).toBeRequired();
    });

    it("provides error messages for invalid fields", async () => {
      render(
        <ProductInlineForm
          shopId={shopId}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      const submitButton = screen.getByText("Create Product");
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText("Product name is required")
        ).toBeInTheDocument();
      });
    });
  });
});
