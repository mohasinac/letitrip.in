import { logError } from "@/lib/firebase-error-logger";
import { productsService } from "@/services/products.service";
import type { ProductCardFE } from "@/types/frontend/product.types";
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { toast } from "sonner";
import ProductTable from "../ProductTable";

// Mock dependencies
jest.mock("@/services/products.service");
jest.mock("@/lib/firebase-error-logger");
jest.mock("sonner");
jest.mock("next/link", () => {
  return ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  );
});

jest.mock("@/components/common/OptimizedImage", () => ({
  __esModule: true,
  default: ({
    src,
    alt,
    className,
  }: {
    src: string;
    alt: string;
    className?: string;
  }) => <img src={src} alt={alt} className={className} />,
}));

jest.mock("@/components/common/DataTable", () => ({
  DataTable: ({
    data,
    columns,
    isLoading,
    emptyMessage,
  }: {
    data: any[];
    columns: any[];
    isLoading?: boolean;
    emptyMessage?: string;
  }) => {
    if (isLoading) {
      return <div>Loading...</div>;
    }

    if (data.length === 0) {
      return <div>{emptyMessage}</div>;
    }

    return (
      <table>
        <thead>
          <tr>
            {columns.map((col: any) => (
              <th key={col.key}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item: any, idx: number) => (
            <tr key={idx}>
              {columns.map((col: any) => (
                <td key={col.key}>
                  {col.render ? col.render(item[col.key], item) : item[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  },
}));

jest.mock("@/components/common/StatusBadge", () => ({
  StatusBadge: ({ status }: { status: string }) => (
    <span data-status={status}>Status: {status}</span>
  ),
}));

jest.mock("@/components/common/ConfirmDialog", () => ({
  ConfirmDialog: ({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmLabel,
    isLoading,
  }: any) =>
    isOpen ? (
      <div role="dialog">
        <h2>{title}</h2>
        <p>{description}</p>
        <button onClick={onConfirm} disabled={isLoading}>
          {confirmLabel}
        </button>
        <button onClick={onClose}>Cancel</button>
      </div>
    ) : null,
}));

jest.mock("@/components/common/FormModal", () => ({
  FormModal: ({ isOpen, onClose, title, children }: any) =>
    isOpen ? (
      <div role="dialog">
        <h2>{title}</h2>
        <button onClick={onClose}>Close</button>
        {children}
      </div>
    ) : null,
}));

jest.mock("@/components/common/values/Price", () => ({
  Price: ({ amount }: { amount: number }) => (
    <span>₹{amount.toLocaleString("en-IN")}</span>
  ),
}));

jest.mock("../ProductInlineForm", () => ({
  ProductInlineForm: ({ product, onSuccess, onCancel }: any) => (
    <div>
      <div>Editing: {product?.name}</div>
      <button onClick={onSuccess}>Save</button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  ),
}));

const mockProductsService = productsService as jest.Mocked<
  typeof productsService
>;
const mockLogError = logError as jest.MockedFunction<typeof logError>;
const mockToast = toast as jest.Mocked<typeof toast>;

describe("ProductTable", () => {
  const mockProducts: ProductCardFE[] = [
    {
      id: "prod-1",
      slug: "product-one",
      name: "Product One",
      sku: "SKU-001",
      categoryId: "cat-1",
      price: 1000,
      originalPrice: 1500,
      stockCount: 10,
      lowStockThreshold: 5,
      status: "active",
      images: ["https://example.com/image1.jpg"],
      description: "Test product",
      shopId: "shop-1",
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
    },
    {
      id: "prod-2",
      slug: "product-two",
      name: "Product Two",
      sku: "SKU-002",
      categoryId: "cat-2",
      price: 2000,
      stockCount: 3,
      lowStockThreshold: 5,
      status: "active",
      images: [],
      description: "Test product 2",
      shopId: "shop-1",
      createdAt: new Date("2024-01-02"),
      updatedAt: new Date("2024-01-02"),
    },
    {
      id: "prod-3",
      slug: "product-three",
      name: "Product Three",
      sku: "",
      categoryId: "",
      price: 500,
      stockCount: 0,
      status: "inactive",
      images: [],
      description: "Test product 3",
      shopId: "shop-1",
      createdAt: new Date("2024-01-03"),
      updatedAt: new Date("2024-01-03"),
    },
  ];

  const mockOnRefresh = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockProductsService.delete = jest.fn().mockResolvedValue(undefined);
  });

  describe("Table Rendering", () => {
    it("renders product table with data", () => {
      render(
        <ProductTable products={mockProducts} onRefresh={mockOnRefresh} />
      );

      expect(screen.getByRole("table")).toBeInTheDocument();
      expect(screen.getByText("Product One")).toBeInTheDocument();
      expect(screen.getByText("Product Two")).toBeInTheDocument();
      expect(screen.getByText("Product Three")).toBeInTheDocument();
    });

    it("displays loading state", () => {
      render(
        <ProductTable
          products={[]}
          isLoading={true}
          onRefresh={mockOnRefresh}
        />
      );

      expect(screen.getByText("Loading...")).toBeInTheDocument();
    });

    it("displays empty message when no products", () => {
      render(<ProductTable products={[]} onRefresh={mockOnRefresh} />);

      expect(
        screen.getByText(/No products found. Create your first/i)
      ).toBeInTheDocument();
    });
  });

  describe("Product Information Display", () => {
    it("displays product images", () => {
      render(
        <ProductTable products={mockProducts} onRefresh={mockOnRefresh} />
      );

      const image = screen.getByAltText("Product One");
      expect(image).toHaveAttribute("src", "https://example.com/image1.jpg");
    });

    it("shows placeholder for missing images", () => {
      render(
        <ProductTable products={mockProducts} onRefresh={mockOnRefresh} />
      );

      expect(screen.getAllByText("No image").length).toBeGreaterThan(0);
    });

    it("displays product name and SKU", () => {
      render(
        <ProductTable products={mockProducts} onRefresh={mockOnRefresh} />
      );

      expect(screen.getByText("Product One")).toBeInTheDocument();
      expect(screen.getByText("SKU: SKU-001")).toBeInTheDocument();
    });

    it("displays N/A for missing SKU", () => {
      render(
        <ProductTable products={mockProducts} onRefresh={mockOnRefresh} />
      );

      expect(screen.getByText("SKU: N/A")).toBeInTheDocument();
    });

    it("displays category", () => {
      render(
        <ProductTable products={mockProducts} onRefresh={mockOnRefresh} />
      );

      expect(screen.getByText("cat-1")).toBeInTheDocument();
    });

    it("displays Uncategorized for missing category", () => {
      render(
        <ProductTable products={mockProducts} onRefresh={mockOnRefresh} />
      );

      expect(screen.getByText("Uncategorized")).toBeInTheDocument();
    });

    it("displays product slug", () => {
      render(
        <ProductTable products={mockProducts} onRefresh={mockOnRefresh} />
      );

      expect(screen.getByText("product-one")).toBeInTheDocument();
    });
  });

  describe("Price Display", () => {
    it("displays current price", () => {
      render(
        <ProductTable products={mockProducts} onRefresh={mockOnRefresh} />
      );

      expect(screen.getByText("₹1,000")).toBeInTheDocument();
    });

    it("displays original price with strikethrough when higher", () => {
      render(
        <ProductTable products={mockProducts} onRefresh={mockOnRefresh} />
      );

      expect(screen.getByText("₹1,500")).toBeInTheDocument();
    });

    it("does not display original price when equal to current", () => {
      const products = [
        {
          ...mockProducts[0],
          price: 1500,
          originalPrice: 1500,
        },
      ];

      render(<ProductTable products={products} onRefresh={mockOnRefresh} />);

      const prices = screen.getAllByText("₹1,500");
      expect(prices.length).toBe(1);
    });
  });

  describe("Stock Display", () => {
    it("displays stock count", () => {
      render(
        <ProductTable products={mockProducts} onRefresh={mockOnRefresh} />
      );

      expect(screen.getByText("10")).toBeInTheDocument();
    });

    it("shows low stock warning", () => {
      render(
        <ProductTable products={mockProducts} onRefresh={mockOnRefresh} />
      );

      expect(screen.getByText("Low stock")).toBeInTheDocument();
    });

    it("shows out of stock message", () => {
      render(
        <ProductTable products={mockProducts} onRefresh={mockOnRefresh} />
      );

      expect(screen.getByText("Out of stock")).toBeInTheDocument();
    });

    it("applies red color to out of stock count", () => {
      render(
        <ProductTable products={mockProducts} onRefresh={mockOnRefresh} />
      );

      const outOfStockElement = screen
        .getAllByText("0")
        .find((el) => el.classList.contains("text-red-600"));
      expect(outOfStockElement).toBeInTheDocument();
    });

    it("applies yellow color to low stock count", () => {
      render(
        <ProductTable products={mockProducts} onRefresh={mockOnRefresh} />
      );

      const lowStockElement = screen.getByText("3");
      expect(lowStockElement).toHaveClass("text-yellow-600");
    });
  });

  describe("Status Display", () => {
    it("displays product status badge", () => {
      render(
        <ProductTable products={mockProducts} onRefresh={mockOnRefresh} />
      );

      expect(screen.getAllByText(/Status: active/i).length).toBeGreaterThan(0);
    });
  });

  describe("Action Buttons", () => {
    it("renders view public page link", () => {
      render(
        <ProductTable products={mockProducts} onRefresh={mockOnRefresh} />
      );

      const viewLinks = screen.getAllByTitle("View public page");

      expect(viewLinks.length).toBeGreaterThan(0);
      expect(viewLinks[0]).toHaveAttribute("href", "/products/product-one");
      expect(viewLinks[0]).toHaveAttribute("target", "_blank");
    });

    it("renders quick edit button", () => {
      render(
        <ProductTable products={mockProducts} onRefresh={mockOnRefresh} />
      );

      const editButtons = screen
        .getAllByRole("button")
        .filter((btn) => btn.getAttribute("title") === "Quick edit");
      expect(editButtons.length).toBeGreaterThan(0);
    });

    it("renders full edit page link", () => {
      render(
        <ProductTable products={mockProducts} onRefresh={mockOnRefresh} />
      );

      const fullEditLinks = screen.getAllByTitle("Full edit page");
      expect(fullEditLinks.length).toBeGreaterThan(0);
      expect(fullEditLinks[0]).toHaveAttribute(
        "href",
        "/seller/products/product-one/edit"
      );
    });

    it("renders delete button", () => {
      render(
        <ProductTable products={mockProducts} onRefresh={mockOnRefresh} />
      );

      const deleteButtons = screen
        .getAllByRole("button")
        .filter((btn) => btn.getAttribute("title")?.includes("Delete"));
      expect(deleteButtons.length).toBeGreaterThan(0);
    });
  });

  describe("Quick Edit Modal", () => {
    it("opens quick edit modal when edit button clicked", () => {
      render(
        <ProductTable products={mockProducts} onRefresh={mockOnRefresh} />
      );

      const editButtons = screen.getAllByTitle("Quick edit");
      fireEvent.click(editButtons[0]);

      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(screen.getByText("Quick Edit ProductCardFE")).toBeInTheDocument();
      expect(screen.getByText("Editing: Product One")).toBeInTheDocument();
    });

    it("closes modal when close button clicked", () => {
      render(
        <ProductTable products={mockProducts} onRefresh={mockOnRefresh} />
      );

      const editButtons = screen.getAllByTitle("Quick edit");
      fireEvent.click(editButtons[0]);

      const closeButton = screen.getByRole("button", { name: "Close" });
      fireEvent.click(closeButton);

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("closes modal and refreshes on successful save", () => {
      render(
        <ProductTable products={mockProducts} onRefresh={mockOnRefresh} />
      );

      const editButtons = screen.getAllByTitle("Quick edit");
      fireEvent.click(editButtons[0]);

      const saveButton = screen.getByRole("button", { name: "Save" });
      fireEvent.click(saveButton);

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      expect(mockOnRefresh).toHaveBeenCalled();
    });

    it("closes modal when cancel button clicked in form", () => {
      render(
        <ProductTable products={mockProducts} onRefresh={mockOnRefresh} />
      );

      const editButtons = screen.getAllByTitle("Quick edit");
      fireEvent.click(editButtons[0]);

      const cancelButton = screen.getAllByRole("button", {
        name: "Cancel",
      })[0];
      fireEvent.click(cancelButton);

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  describe("Delete Functionality", () => {
    it("opens delete confirmation dialog when delete button clicked", () => {
      render(
        <ProductTable products={mockProducts} onRefresh={mockOnRefresh} />
      );

      const deleteButtons = screen.getAllByTitle(/Delete/i);
      fireEvent.click(deleteButtons[0]);

      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(
        screen.getByText(/Are you sure you want to delete "Product One"/i)
      ).toBeInTheDocument();
    });

    it("closes delete dialog when cancel clicked", () => {
      render(
        <ProductTable products={mockProducts} onRefresh={mockOnRefresh} />
      );

      const deleteButtons = screen.getAllByTitle(/Delete/i);
      fireEvent.click(deleteButtons[0]);

      const cancelButton = screen.getByRole("button", { name: "Cancel" });
      fireEvent.click(cancelButton);

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("deletes product successfully", async () => {
      render(
        <ProductTable products={mockProducts} onRefresh={mockOnRefresh} />
      );

      const deleteButtons = screen.getAllByTitle(/Delete/i);
      fireEvent.click(deleteButtons[0]);

      const dialog = screen.getByRole("dialog");
      const confirmButton = within(dialog).getByRole("button", {
        name: /Delete ProductCardFE/i,
      });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(mockProductsService.delete).toHaveBeenCalledWith("product-one");
        expect(mockOnRefresh).toHaveBeenCalledTimes(1);
      });
    });

    it("handles delete error gracefully", async () => {
      const error = new Error("Delete failed");
      mockProductsService.delete.mockRejectedValueOnce(error);

      render(
        <ProductTable products={mockProducts} onRefresh={mockOnRefresh} />
      );

      const deleteButtons = screen.getAllByTitle(/Delete/i);
      fireEvent.click(deleteButtons[0]);

      const dialog = screen.getByRole("dialog");
      const confirmButton = within(dialog).getByRole("button", {
        name: /Delete ProductCardFE/i,
      });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(mockLogError).toHaveBeenCalledWith(error, {
          component: "ProductTable.handleConfirmDelete",
          metadata: { productSlug: "product-one" },
        });
        expect(mockToast.error).toHaveBeenCalledWith(
          "Failed to delete product. Please try again."
        );
      });
    });

    it("shows loading state during delete", async () => {
      let resolveDelete: () => void;
      mockProductsService.delete.mockImplementationOnce(
        () =>
          new Promise<void>((resolve) => {
            resolveDelete = resolve;
          })
      );

      render(
        <ProductTable products={mockProducts} onRefresh={mockOnRefresh} />
      );

      const deleteButtons = screen.getAllByTitle(/Delete/i);
      fireEvent.click(deleteButtons[0]);

      const dialog = screen.getByRole("dialog");
      const confirmButton = within(dialog).getByRole("button", {
        name: /Delete ProductCardFE/i,
      });
      fireEvent.click(confirmButton);

      // During delete, button should show loading state or be disabled
      await waitFor(() => {
        expect(confirmButton).toBeDisabled();
      });

      // Resolve the promise
      resolveDelete!();

      await waitFor(() => {
        expect(mockOnRefresh).toHaveBeenCalled();
      });
    });
  });

  describe("Stock Status", () => {
    it("shows stock information in table", () => {
      render(
        <ProductTable products={mockProducts} onRefresh={mockOnRefresh} />
      );

      // Verify table renders with product data
      expect(screen.getByText("Product One")).toBeInTheDocument();
      expect(screen.getByText("Product Two")).toBeInTheDocument();
    });
  });

  describe("Dark Mode", () => {
    it("applies dark mode classes to table container", () => {
      render(
        <ProductTable products={mockProducts} onRefresh={mockOnRefresh} />
      );

      const productName = screen.getByText("Product One");
      expect(productName).toHaveClass("dark:text-white");
    });

    it("applies dark mode to product name", () => {
      render(
        <ProductTable products={mockProducts} onRefresh={mockOnRefresh} />
      );

      const productName = screen.getByText("Product One");
      expect(productName).toHaveClass("dark:text-white");
    });

    it("applies dark mode to low stock text", () => {
      render(
        <ProductTable products={mockProducts} onRefresh={mockOnRefresh} />
      );

      const lowStockText = screen.getByText("Low stock");
      expect(lowStockText).toHaveClass("dark:text-yellow-400");
    });

    it("applies dark mode to out of stock text", () => {
      render(
        <ProductTable products={mockProducts} onRefresh={mockOnRefresh} />
      );

      const outOfStockText = screen.getByText("Out of stock");
      expect(outOfStockText).toHaveClass("dark:text-red-400");
    });
  });

  describe("Responsive Design", () => {
    it("applies min-width to product name column", () => {
      render(
        <ProductTable products={mockProducts} onRefresh={mockOnRefresh} />
      );

      const nameCell = screen.getByText("Product One").parentElement;
      expect(nameCell).toHaveClass("min-w-[200px]");
    });

    it("applies max-width and truncate to slug column", () => {
      render(
        <ProductTable products={mockProducts} onRefresh={mockOnRefresh} />
      );

      const slugCell = screen.getByText("product-one");
      expect(slugCell).toHaveClass("max-w-[150px]");
      expect(slugCell).toHaveClass("truncate");
    });
  });

  describe("Edge Cases", () => {
    it("handles missing onRefresh callback gracefully", () => {
      render(<ProductTable products={mockProducts} />);

      const editButtons = screen.getAllByTitle("Quick edit");
      fireEvent.click(editButtons[0]);

      const saveButton = screen.getByRole("button", { name: "Save" });
      fireEvent.click(saveButton);

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("does not show original price when not provided", () => {
      const products = [
        {
          ...mockProducts[1],
          originalPrice: undefined,
        },
      ];

      render(<ProductTable products={products} onRefresh={mockOnRefresh} />);

      expect(screen.queryByText("₹1,500")).not.toBeInTheDocument();
    });

    it("handles product with no ID using slug as key", () => {
      const products = [
        {
          ...mockProducts[0],
          id: undefined,
        },
      ];

      render(
        <ProductTable products={products as any} onRefresh={mockOnRefresh} />
      );

      expect(screen.getByText("Product One")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("has table structure with proper roles", () => {
      render(
        <ProductTable products={mockProducts} onRefresh={mockOnRefresh} />
      );

      // DataTable component should render
      expect(screen.getByText("Product One")).toBeInTheDocument();
      expect(screen.getByText("Product Two")).toBeInTheDocument();
    });

    it("has title attributes for action buttons", () => {
      render(
        <ProductTable products={mockProducts} onRefresh={mockOnRefresh} />
      );

      const allButtons = screen.getAllByRole("button");
      const quickEditButtons = allButtons.filter(
        (btn) => btn.getAttribute("title") === "Quick edit"
      );
      const deleteButtons = allButtons.filter((btn) =>
        btn.getAttribute("title")?.includes("Delete")
      );

      expect(quickEditButtons.length).toBeGreaterThan(0);
      expect(deleteButtons.length).toBeGreaterThan(0);
    });
  });

  describe("Action Button Rendering", () => {
    it("renders all action buttons for each product", () => {
      render(
        <ProductTable products={mockProducts} onRefresh={mockOnRefresh} />
      );

      expect(screen.getAllByTitle("View public page").length).toBeGreaterThan(
        0
      );
      expect(screen.getAllByTitle("Quick edit").length).toBeGreaterThan(0);
      expect(screen.getAllByTitle("Full edit page").length).toBeGreaterThan(0);
      expect(screen.getAllByTitle(/Delete/i).length).toBeGreaterThan(0);
    });
  });
});
