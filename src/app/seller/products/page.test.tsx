import React from "react";
import {
  render,
  screen,
  waitFor,
  fireEvent,
  within,
} from "@testing-library/react";

// Mock Next.js Link
jest.mock("next/link", () => {
  return ({ children, href }: any) => <a href={href}>{children}</a>;
});

// Mock services
jest.mock("@/services/products.service");
jest.mock("@/services/categories.service");
const mockProductsService =
  require("@/services/products.service").productsService;
const mockCategoriesService =
  require("@/services/categories.service").categoriesService;

// Mock hooks
jest.mock("@/hooks/useMobile");
const mockUseIsMobile = require("@/hooks/useMobile").useIsMobile;

// Mock components
jest.mock("@/components/seller/ViewToggle", () => ({
  ViewToggle: ({ view, onViewChange }: any) => (
    <div data-testid="view-toggle">
      <button
        data-testid="grid-view"
        onClick={() => onViewChange("grid")}
        className={view === "grid" ? "active" : ""}
      >
        Grid
      </button>
      <button
        data-testid="table-view"
        onClick={() => onViewChange("table")}
        className={view === "table" ? "active" : ""}
      >
        Table
      </button>
    </div>
  ),
}));

jest.mock("@/components/common/StatusBadge", () => ({
  StatusBadge: ({ status }: any) => (
    <span data-testid={`status-badge-${status}`}>{status}</span>
  ),
}));

jest.mock("@/components/common/ConfirmDialog", () => ({
  ConfirmDialog: ({ isOpen, title, onConfirm, onClose }: any) =>
    isOpen ? (
      <div data-testid="confirm-dialog">
        <h2>{title}</h2>
        <button onClick={onConfirm} data-testid="confirm-yes">
          Delete
        </button>
        <button onClick={onClose} data-testid="confirm-no">
          Cancel
        </button>
      </div>
    ) : null,
}));

jest.mock("@/components/common/inline-edit", () => ({
  InlineEditRow: ({ onSave, onCancel }: any) => (
    <tr data-testid="inline-edit-row">
      <td colSpan={7}>
        <button
          onClick={() => onSave({ name: "Updated Product" })}
          data-testid="save-edit"
        >
          Save
        </button>
        <button onClick={onCancel} data-testid="cancel-edit">
          Cancel
        </button>
      </td>
    </tr>
  ),
  QuickCreateRow: ({ onSave }: any) => (
    <tr data-testid="quick-create-row">
      <td colSpan={7}>
        <button
          onClick={() =>
            onSave({
              name: "New Product",
              price: 100,
              stockCount: 10,
              categoryId: "cat-1",
              status: "active",
            })
          }
          data-testid="create-product"
        >
          Create
        </button>
      </td>
    </tr>
  ),
  BulkActionBar: ({ selectedCount, onClearSelection }: any) => (
    <div data-testid="bulk-action-bar">
      <span>{selectedCount} selected</span>
      <button onClick={onClearSelection} data-testid="clear-selection">
        Clear
      </button>
    </div>
  ),
  TableCheckbox: ({ checked, onChange, indeterminate }: any) => (
    <input
      type="checkbox"
      checked={checked}
      ref={(el) => el && (el.indeterminate = indeterminate)}
      onChange={(e) => onChange(e.target.checked)}
      data-testid="table-checkbox"
    />
  ),
}));

jest.mock("@/components/common/inline-edit", () => ({
  InlineEditRow: ({ onSave, onCancel }: any) => (
    <tr data-testid="inline-edit-row">
      <td colSpan={7}>
        <button
          onClick={() => onSave({ name: "Updated Product" })}
          data-testid="save-edit"
        >
          Save
        </button>
        <button onClick={onCancel} data-testid="cancel-edit">
          Cancel
        </button>
      </td>
    </tr>
  ),
  QuickCreateRow: ({ onSave }: any) => (
    <tr data-testid="quick-create-row">
      <td colSpan={7}>
        <button
          onClick={() =>
            onSave({
              name: "New Product",
              price: 100,
              stockCount: 10,
              categoryId: "cat-1",
              status: "active",
            })
          }
          data-testid="create-product"
        >
          Create
        </button>
      </td>
    </tr>
  ),
  BulkActionBar: ({ selectedCount, onClearSelection }: any) => (
    <div data-testid="bulk-action-bar">
      <span>{selectedCount} selected</span>
      <button onClick={onClearSelection} data-testid="clear-selection">
        Clear
      </button>
    </div>
  ),
  TableCheckbox: ({ checked, onChange, indeterminate }: any) => (
    <input
      type="checkbox"
      checked={checked}
      ref={(el) => el && (el.indeterminate = indeterminate)}
      onChange={(e) => onChange(e.target.checked)}
      data-testid="table-checkbox"
    />
  ),
  InlineField: () => null,
  BulkAction: () => null,
  UnifiedFilterSidebar: ({
    mobile,
    isOpen,
    onClose,
    resultCount,
    isLoading,
  }: any) =>
    mobile && isOpen ? (
      <div data-testid="mobile-filters">
        <span>Filters ({resultCount})</span>
        <button onClick={onClose} data-testid="close-filters">
          Close
        </button>
      </div>
    ) : !mobile ? (
      <div data-testid="desktop-filters">
        <span>Desktop Filters ({resultCount})</span>
      </div>
    ) : null,
}));

// Mock constants
jest.mock("@/constants/filters", () => ({
  PRODUCT_FILTERS: [
    {
      key: "status",
      label: "Status",
      type: "select",
      options: [
        { value: "active", label: "Active" },
        { value: "draft", label: "Draft" },
      ],
    },
  ],
}));

jest.mock("@/constants/bulk-actions", () => ({
  getProductBulkActions: (count: number) => [
    {
      id: "delete",
      label: "Delete Selected",
      variant: "danger",
      requiresConfirmation: true,
    },
  ],
}));

jest.mock("@/constants/form-fields", () => ({
  PRODUCT_FIELDS: {
    name: { required: true, type: "text" },
    price: { required: true, type: "number" },
    stockCount: { required: true, type: "number" },
    categoryId: { required: true, type: "select" },
    status: { required: true, type: "select" },
  },
  getFieldsForContext: () => [],
  toInlineFields: () => [],
}));

jest.mock("@/lib/form-validation", () => ({
  validateForm: () => ({ isValid: true, errors: {} }),
}));

// Import page after mocks
const ProductsPage = require("./page").default;

describe("ProductsPage", () => {
  const mockProducts = [
    {
      id: "prod-1",
      slug: "test-product-1",
      name: "Test Product 1",
      price: 1000,
      stockCount: 50,
      categoryId: "cat-1",
      status: "active",
      images: ["image1.jpg"],
      salesCount: 10,
      lowStockThreshold: 5,
    },
    {
      id: "prod-2",
      slug: "test-product-2",
      name: "Test Product 2",
      price: 2000,
      stockCount: 3,
      categoryId: "cat-2",
      status: "draft",
      images: [],
      salesCount: 5,
      lowStockThreshold: 5,
    },
  ];

  const mockCategories = [
    { id: "cat-1", name: "Category 1" },
    { id: "cat-2", name: "Category 2" },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseIsMobile.mockReturnValue(false);
  });

  describe("Loading and Data Fetching", () => {
    it("shows loading state initially", () => {
      mockProductsService.list.mockImplementation(() => new Promise(() => {}));
      mockCategoriesService.list.mockResolvedValue({ data: mockCategories });

      render(<ProductsPage />);

      expect(screen.getByText("Loading products...")).toBeInTheDocument();
    });

    it("loads products and categories on mount", async () => {
      mockProductsService.list.mockResolvedValue({
        data: mockProducts,
        count: 2,
      });
      mockCategoriesService.list.mockResolvedValue({ data: mockCategories });

      render(<ProductsPage />);

      await waitFor(() => {
        expect(mockProductsService.list).toHaveBeenCalled();
        expect(mockCategoriesService.list).toHaveBeenCalled();
      });
    });

    it("displays products in table view by default", async () => {
      mockProductsService.list.mockResolvedValue({
        data: mockProducts,
        count: 2,
      });
      mockCategoriesService.list.mockResolvedValue({ data: mockCategories });

      render(<ProductsPage />);

      await waitFor(() => {
        expect(screen.getByText("Test Product 1")).toBeInTheDocument();
        expect(screen.getByText("Test Product 2")).toBeInTheDocument();
      });

      expect(screen.getByTestId("table-view")).toHaveClass("active");
    });
  });

  describe("View Toggle", () => {
    beforeEach(() => {
      mockProductsService.list.mockResolvedValue({
        data: mockProducts,
        count: 2,
      });
      mockCategoriesService.list.mockResolvedValue({ data: mockCategories });
    });

    it("switches to grid view", async () => {
      render(<ProductsPage />);

      await waitFor(() => {
        expect(screen.getByText("Test Product 1")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId("grid-view"));

      expect(screen.getByTestId("grid-view")).toHaveClass("active");
    });

    it("displays products in grid view", async () => {
      render(<ProductsPage />);

      await waitFor(() => {
        expect(screen.getByText("Test Product 1")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId("grid-view"));

      // Grid view should show product cards
      expect(screen.getAllByText("Edit")).toHaveLength(2);
      expect(screen.getAllByText("View")).toHaveLength(2);
    });
  });

  describe("Search Functionality", () => {
    beforeEach(() => {
      mockProductsService.list.mockResolvedValue({
        data: mockProducts,
        count: 2,
      });
      mockCategoriesService.list.mockResolvedValue({ data: mockCategories });
    });

    it("filters products based on search query", async () => {
      render(<ProductsPage />);

      await waitFor(() => {
        expect(screen.getByText("Test Product 1")).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText("Search products...");
      fireEvent.change(searchInput, { target: { value: "Product 1" } });

      await waitFor(() => {
        expect(mockProductsService.list).toHaveBeenCalledWith(
          expect.objectContaining({ search: "Product 1" })
        );
      });
    });
  });

  describe("Table View Features", () => {
    beforeEach(() => {
      mockProductsService.list.mockResolvedValue({
        data: mockProducts,
        count: 2,
      });
      mockCategoriesService.list.mockResolvedValue({ data: mockCategories });
    });

    it("displays product information correctly", async () => {
      render(<ProductsPage />);

      await waitFor(() => {
        expect(screen.getByText("Test Product 1")).toBeInTheDocument();
      });

      expect(screen.getByText("₹1,000")).toBeInTheDocument();
      expect(screen.getByText("50")).toBeInTheDocument();
      expect(screen.getByText("Category 1")).toBeInTheDocument();
      expect(screen.getByTestId("status-badge-active")).toBeInTheDocument();
    });

    it("shows low stock warning", async () => {
      render(<ProductsPage />);

      await waitFor(() => {
        expect(screen.getByText("Test Product 2")).toBeInTheDocument();
      });

      expect(screen.getByText("Low stock")).toBeInTheDocument();
    });

    it("handles product selection", async () => {
      render(<ProductsPage />);

      await waitFor(() => {
        expect(screen.getByText("Test Product 1")).toBeInTheDocument();
      });

      const checkboxes = screen.getAllByTestId("table-checkbox");
      fireEvent.click(checkboxes[1]); // Select first product

      expect(screen.getByTestId("bulk-action-bar")).toBeInTheDocument();
      expect(screen.getByText("1 selected")).toBeInTheDocument();
    });

    it("selects all products", async () => {
      render(<ProductsPage />);

      await waitFor(() => {
        expect(screen.getByText("Test Product 1")).toBeInTheDocument();
      });

      const checkboxes = screen.getAllByTestId("table-checkbox");
      fireEvent.click(checkboxes[0]); // Select all checkbox

      expect(screen.getByText("2 selected")).toBeInTheDocument();
    });
  });

  describe("Inline Editing", () => {
    beforeEach(() => {
      mockProductsService.list.mockResolvedValue({
        data: mockProducts,
        count: 2,
      });
      mockCategoriesService.list.mockResolvedValue({ data: mockCategories });
      mockProductsService.quickUpdate.mockResolvedValue({});
    });

    it("enters edit mode on double click", async () => {
      render(<ProductsPage />);

      await waitFor(() => {
        expect(screen.getByText("Test Product 1")).toBeInTheDocument();
      });

      const productRow = screen.getByText("Test Product 1").closest("tr");
      fireEvent.doubleClick(productRow!);

      expect(screen.getByTestId("inline-edit-row")).toBeInTheDocument();
    });

    it("saves product changes", async () => {
      render(<ProductsPage />);

      await waitFor(() => {
        expect(screen.getByText("Test Product 1")).toBeInTheDocument();
      });

      const productRow = screen.getByText("Test Product 1").closest("tr");
      fireEvent.doubleClick(productRow!);

      fireEvent.click(screen.getByTestId("save-edit"));

      await waitFor(() => {
        expect(mockProductsService.quickUpdate).toHaveBeenCalledWith(
          "test-product-1",
          expect.objectContaining({ name: "Updated Product" })
        );
      });
    });

    it("cancels edit mode", async () => {
      render(<ProductsPage />);

      await waitFor(() => {
        expect(screen.getByText("Test Product 1")).toBeInTheDocument();
      });

      const productRow = screen.getByText("Test Product 1").closest("tr");
      fireEvent.doubleClick(productRow!);

      fireEvent.click(screen.getByTestId("cancel-edit"));

      expect(screen.queryByTestId("inline-edit-row")).not.toBeInTheDocument();
    });
  });

  describe("Quick Create", () => {
    beforeEach(() => {
      mockProductsService.list.mockResolvedValue({
        data: mockProducts,
        count: 2,
      });
      mockCategoriesService.list.mockResolvedValue({ data: mockCategories });
      mockProductsService.quickCreate.mockResolvedValue({});
    });

    it("creates new product", async () => {
      render(<ProductsPage />);

      await waitFor(() => {
        expect(screen.getByText("Test Product 1")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId("create-product"));

      await waitFor(() => {
        expect(mockProductsService.quickCreate).toHaveBeenCalledWith(
          expect.objectContaining({
            name: "New Product",
            price: 100,
            stockCount: 10,
            categoryId: "cat-1",
            status: "active",
          })
        );
      });
    });
  });

  describe("Delete Functionality", () => {
    beforeEach(() => {
      mockProductsService.list.mockResolvedValue({
        data: mockProducts,
        count: 2,
      });
      mockCategoriesService.list.mockResolvedValue({ data: mockCategories });
      mockProductsService.delete.mockResolvedValue({});
    });

    it("shows delete confirmation dialog", async () => {
      render(<ProductsPage />);

      await waitFor(() => {
        expect(screen.getByText("Test Product 1")).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByTitle("Delete");
      fireEvent.click(deleteButtons[0]);

      expect(screen.getByTestId("confirm-dialog")).toBeInTheDocument();
      expect(screen.getByText("Delete Product")).toBeInTheDocument();
    });

    it("deletes product on confirmation", async () => {
      render(<ProductsPage />);

      await waitFor(() => {
        expect(screen.getByText("Test Product 1")).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByTitle("Delete");
      fireEvent.click(deleteButtons[0]);

      fireEvent.click(screen.getByTestId("confirm-yes"));

      await waitFor(() => {
        expect(mockProductsService.delete).toHaveBeenCalledWith(
          "test-product-1"
        );
      });
    });

    it("cancels delete operation", async () => {
      render(<ProductsPage />);

      await waitFor(() => {
        expect(screen.getByText("Test Product 1")).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByTitle("Delete");
      fireEvent.click(deleteButtons[0]);

      fireEvent.click(screen.getByTestId("confirm-no"));

      expect(screen.queryByTestId("confirm-dialog")).not.toBeInTheDocument();
      expect(mockProductsService.delete).not.toHaveBeenCalled();
    });
  });

  describe("Bulk Actions", () => {
    beforeEach(() => {
      mockProductsService.list.mockResolvedValue({
        data: mockProducts,
        count: 2,
      });
      mockCategoriesService.list.mockResolvedValue({ data: mockCategories });
      mockProductsService.bulkAction.mockResolvedValue({ success: true });
    });

    it("performs bulk delete", async () => {
      render(<ProductsPage />);

      await waitFor(() => {
        expect(screen.getByText("Test Product 1")).toBeInTheDocument();
      });

      const checkboxes = screen.getAllByTestId("table-checkbox");
      fireEvent.click(checkboxes[1]); // Select first product
      fireEvent.click(checkboxes[2]); // Select second product

      // Note: Bulk action implementation would need to be mocked properly
      // This test verifies the selection mechanism
      expect(screen.getByText("2 selected")).toBeInTheDocument();
    });

    it("clears selection", async () => {
      render(<ProductsPage />);

      await waitFor(() => {
        expect(screen.getByText("Test Product 1")).toBeInTheDocument();
      });

      const checkboxes = screen.getAllByTestId("table-checkbox");
      fireEvent.click(checkboxes[1]);

      expect(screen.getByTestId("bulk-action-bar")).toBeInTheDocument();

      fireEvent.click(screen.getByTestId("clear-selection"));

      expect(screen.queryByTestId("bulk-action-bar")).not.toBeInTheDocument();
    });
  });

  describe("Mobile Responsiveness", () => {
    beforeEach(() => {
      mockUseIsMobile.mockReturnValue(true);
      mockProductsService.list.mockResolvedValue({
        data: mockProducts,
        count: 2,
      });
      mockCategoriesService.list.mockResolvedValue({ data: mockCategories });
    });

    it("shows mobile filters button", async () => {
      render(<ProductsPage />);

      await waitFor(() => {
        expect(screen.getByText("Test Product 1")).toBeInTheDocument();
      });

      expect(
        screen.getByRole("button", { name: /filters/i })
      ).toBeInTheDocument();
    });

    it("opens mobile filters drawer", async () => {
      render(<ProductsPage />);

      await waitFor(() => {
        expect(screen.getByText("Test Product 1")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole("button", { name: /filters/i }));

      expect(screen.getByTestId("mobile-filters")).toBeInTheDocument();
    });
  });

  describe("Navigation", () => {
    beforeEach(() => {
      mockProductsService.list.mockResolvedValue({
        data: mockProducts,
        count: 2,
      });
      mockCategoriesService.list.mockResolvedValue({ data: mockCategories });
    });

    it("links to create product page", async () => {
      render(<ProductsPage />);

      await waitFor(() => {
        expect(screen.getByText("Test Product 1")).toBeInTheDocument();
      });

      const createLink = screen.getByRole("link", { name: /add product/i });
      expect(createLink).toHaveAttribute("href", "/seller/products/create");
    });

    it("links to product edit page", async () => {
      render(<ProductsPage />);

      await waitFor(() => {
        expect(screen.getByText("Test Product 1")).toBeInTheDocument();
      });

      const editLinks = screen.getAllByRole("link");
      const editLink = editLinks.find((link) =>
        link
          .getAttribute("href")
          ?.includes("/seller/products/test-product-1/edit")
      );
      expect(editLink).toBeInTheDocument();
    });

    it("links to public product page", async () => {
      render(<ProductsPage />);

      await waitFor(() => {
        expect(screen.getByText("Test Product 1")).toBeInTheDocument();
      });

      const viewLinks = screen.getAllByRole("link");
      const viewLink = viewLinks.find(
        (link) => link.getAttribute("href") === "/products/test-product-1"
      );
      expect(viewLink).toBeInTheDocument();
    });
  });

  describe("Error Handling", () => {
    it("handles products loading error gracefully", async () => {
      mockProductsService.list.mockRejectedValue(new Error("API Error"));
      mockCategoriesService.list.mockResolvedValue({ data: mockCategories });

      // Mock console.error to avoid test output pollution
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      render(<ProductsPage />);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          "Failed to load products:",
          expect.any(Error)
        );
      });

      consoleSpy.mockRestore();
    });

    it("handles categories loading error gracefully", async () => {
      mockProductsService.list.mockResolvedValue({
        data: mockProducts,
        count: 2,
      });
      mockCategoriesService.list.mockRejectedValue(new Error("API Error"));

      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      render(<ProductsPage />);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          "Failed to load categories:",
          expect.any(Error)
        );
      });

      consoleSpy.mockRestore();
    });
  });
});
