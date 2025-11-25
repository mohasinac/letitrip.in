import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from "@testing-library/react";
import { CartItem } from "./CartItem";

// Mock Next.js components
jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ src, alt, fill, className }: any) => (
    <img src={src} alt={alt} className={className} data-fill={fill} />
  ),
}));

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

// Mock lucide-react icons
jest.mock("lucide-react", () => ({
  Minus: () => <div data-testid="minus-icon">-</div>,
  Plus: () => <div data-testid="plus-icon">+</div>,
  Trash2: () => <div data-testid="trash-icon">🗑️</div>,
  Loader2: () => <div data-testid="loader-icon">⏳</div>,
}));

// Mock ConfirmDialog
jest.mock("@/components/common/ConfirmDialog", () => ({
  ConfirmDialog: ({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmLabel,
    variant,
  }: any) =>
    isOpen ? (
      <div data-testid="confirm-dialog">
        <h2>{title}</h2>
        <p>{description}</p>
        <button onClick={onClose}>Cancel</button>
        <button onClick={onConfirm} data-variant={variant}>
          {confirmLabel}
        </button>
      </div>
    ) : null,
}));

describe("CartItem - Comprehensive Tests", () => {
  const mockItem = {
    id: "item-1",
    productId: "product-1",
    productName: "Test Product",
    productSlug: "test-product",
    productImage: "/test-image.jpg",
    variantId: null,
    variantName: null,
    sku: "SKU123",
    price: 1000,
    quantity: 2,
    maxQuantity: 10,
    subtotal: 2000,
    discount: 0,
    total: 2000,
    shopId: "shop-1",
    shopName: "Test Shop",
    isAvailable: true,
    addedAt: new Date(),
    formattedPrice: "₹1,000",
    formattedSubtotal: "₹2,000",
    formattedTotal: "₹2,000",
    isOutOfStock: false,
    isLowStock: false,
    canIncrement: true,
    canDecrement: true,
    hasDiscount: false,
    addedTimeAgo: "Added just now",
  };

  const mockOnUpdateQuantity = jest.fn();
  const mockOnRemove = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockOnUpdateQuantity.mockResolvedValue(undefined);
    mockOnRemove.mockResolvedValue(undefined);

    // Mock window.alert
    global.alert = jest.fn();
  });

  describe("Basic Rendering", () => {
    it("should render product image", () => {
      render(
        <CartItem
          item={mockItem}
          onUpdateQuantity={mockOnUpdateQuantity}
          onRemove={mockOnRemove}
        />
      );

      const image = screen.getByAltText("Test Product");
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute("src", "/test-image.jpg");
    });

    it("should render placeholder when no image provided", () => {
      const itemWithoutImage = { ...mockItem, productImage: "" };

      render(
        <CartItem
          item={itemWithoutImage}
          onUpdateQuantity={mockOnUpdateQuantity}
          onRemove={mockOnRemove}
        />
      );

      expect(screen.getByText("No image")).toBeInTheDocument();
    });

    it("should render product name", () => {
      render(
        <CartItem
          item={mockItem}
          onUpdateQuantity={mockOnUpdateQuantity}
          onRemove={mockOnRemove}
        />
      );

      expect(screen.getByText("Test Product")).toBeInTheDocument();
    });

    it("should render shop name", () => {
      render(
        <CartItem
          item={mockItem}
          onUpdateQuantity={mockOnUpdateQuantity}
          onRemove={mockOnRemove}
        />
      );

      expect(screen.getByText("Test Shop")).toBeInTheDocument();
    });

    it("should render current quantity in input", () => {
      render(
        <CartItem
          item={mockItem}
          onUpdateQuantity={mockOnUpdateQuantity}
          onRemove={mockOnRemove}
        />
      );

      const input = screen.getByRole("spinbutton");
      expect(input).toHaveValue(2);
    });

    it("should render quantity control buttons", () => {
      render(
        <CartItem
          item={mockItem}
          onUpdateQuantity={mockOnUpdateQuantity}
          onRemove={mockOnRemove}
        />
      );

      expect(screen.getByTestId("minus-icon")).toBeInTheDocument();
      expect(screen.getByTestId("plus-icon")).toBeInTheDocument();
    });

    it("should render remove button", () => {
      render(
        <CartItem
          item={mockItem}
          onUpdateQuantity={mockOnUpdateQuantity}
          onRemove={mockOnRemove}
        />
      );

      expect(screen.getByLabelText("Remove")).toBeInTheDocument();
      expect(screen.getByTestId("trash-icon")).toBeInTheDocument();
    });

    it("should render variant information when present", () => {
      const itemWithVariant = {
        ...mockItem,
        variantId: "variant-1",
      };

      render(
        <CartItem
          item={itemWithVariant}
          onUpdateQuantity={mockOnUpdateQuantity}
          onRemove={mockOnRemove}
        />
      );

      expect(screen.getByText(/Variant: variant-1/)).toBeInTheDocument();
    });

    it("should not render variant information when absent", () => {
      render(
        <CartItem
          item={mockItem}
          onUpdateQuantity={mockOnUpdateQuantity}
          onRemove={mockOnRemove}
        />
      );

      expect(screen.queryByText(/Variant:/)).not.toBeInTheDocument();
    });
  });

  describe("Price Display", () => {
    it("should display product price with Indian formatting", () => {
      render(
        <CartItem
          item={mockItem}
          onUpdateQuantity={mockOnUpdateQuantity}
          onRemove={mockOnRemove}
        />
      );

      expect(screen.getByText("₹1,000")).toBeInTheDocument();
    });

    it("should display subtotal based on quantity", () => {
      render(
        <CartItem
          item={mockItem}
          onUpdateQuantity={mockOnUpdateQuantity}
          onRemove={mockOnRemove}
        />
      );

      // Subtotal = price * quantity = 1000 * 2 = 2000
      expect(screen.getByText("₹2,000")).toBeInTheDocument();
    });

    it("should display original price when discounted", () => {
      const discountedItem = {
        ...mockItem,
        price: 800,
        originalPrice: 1000,
      };

      render(
        <CartItem
          item={discountedItem}
          onUpdateQuantity={mockOnUpdateQuantity}
          onRemove={mockOnRemove}
        />
      );

      expect(screen.getByText("₹800")).toBeInTheDocument();
      expect(screen.getByText("₹1,000")).toBeInTheDocument();
    });

    it("should display discount percentage", () => {
      const discountedItem = {
        ...mockItem,
        price: 800,
        originalPrice: 1000,
      };

      render(
        <CartItem
          item={discountedItem}
          onUpdateQuantity={mockOnUpdateQuantity}
          onRemove={mockOnRemove}
        />
      );

      // Discount = (1000 - 800) / 1000 * 100 = 20%
      expect(screen.getByText("20% off")).toBeInTheDocument();
    });

    it("should not display discount info when no original price", () => {
      render(
        <CartItem
          item={mockItem}
          onUpdateQuantity={mockOnUpdateQuantity}
          onRemove={mockOnRemove}
        />
      );

      expect(screen.queryByText(/% off/)).not.toBeInTheDocument();
    });

    it("should update subtotal when quantity changes", async () => {
      render(
        <CartItem
          item={mockItem}
          onUpdateQuantity={mockOnUpdateQuantity}
          onRemove={mockOnRemove}
        />
      );

      const plusButton = screen.getByTestId("plus-icon").closest("button")!;
      fireEvent.click(plusButton);

      await waitFor(() => {
        // New subtotal = 1000 * 3 = 3000
        expect(screen.getByText("₹3,000")).toBeInTheDocument();
      });
    });
  });

  describe("Quantity Controls - Increment", () => {
    it("should increment quantity when plus button clicked", async () => {
      render(
        <CartItem
          item={mockItem}
          onUpdateQuantity={mockOnUpdateQuantity}
          onRemove={mockOnRemove}
        />
      );

      const plusButton = screen.getByTestId("plus-icon").closest("button")!;
      fireEvent.click(plusButton);

      await waitFor(() => {
        expect(mockOnUpdateQuantity).toHaveBeenCalledWith("item-1", 3);
      });
    });

    it("should disable plus button when quantity is 99", () => {
      const maxQuantityItem = { ...mockItem, quantity: 99 };

      render(
        <CartItem
          item={maxQuantityItem}
          onUpdateQuantity={mockOnUpdateQuantity}
          onRemove={mockOnRemove}
        />
      );

      const plusButton = screen.getByTestId("plus-icon").closest("button")!;
      expect(plusButton).toBeDisabled();
    });

    it("should show loading spinner when updating quantity", async () => {
      mockOnUpdateQuantity.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      render(
        <CartItem
          item={mockItem}
          onUpdateQuantity={mockOnUpdateQuantity}
          onRemove={mockOnRemove}
        />
      );

      const plusButton = screen.getByTestId("plus-icon").closest("button")!;
      fireEvent.click(plusButton);

      expect(screen.getByTestId("loader-icon")).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.queryByTestId("loader-icon")).not.toBeInTheDocument();
      });
    });

    it("should disable controls while updating", async () => {
      mockOnUpdateQuantity.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      render(
        <CartItem
          item={mockItem}
          onUpdateQuantity={mockOnUpdateQuantity}
          onRemove={mockOnRemove}
        />
      );

      const plusButton = screen.getByTestId("plus-icon").closest("button")!;
      fireEvent.click(plusButton);

      const minusButton = screen.getByTestId("minus-icon").closest("button")!;
      const input = screen.getByRole("spinbutton");

      expect(plusButton).toBeDisabled();
      expect(minusButton).toBeDisabled();
      expect(input).toBeDisabled();
    });
  });

  describe("Quantity Controls - Decrement", () => {
    it("should decrement quantity when minus button clicked", async () => {
      render(
        <CartItem
          item={mockItem}
          onUpdateQuantity={mockOnUpdateQuantity}
          onRemove={mockOnRemove}
        />
      );

      const minusButton = screen.getByTestId("minus-icon").closest("button")!;
      fireEvent.click(minusButton);

      await waitFor(() => {
        expect(mockOnUpdateQuantity).toHaveBeenCalledWith("item-1", 1);
      });
    });

    it("should disable minus button when quantity is 1", () => {
      const minQuantityItem = { ...mockItem, quantity: 1 };

      render(
        <CartItem
          item={minQuantityItem}
          onUpdateQuantity={mockOnUpdateQuantity}
          onRemove={mockOnRemove}
        />
      );

      const minusButton = screen.getByTestId("minus-icon").closest("button")!;
      expect(minusButton).toBeDisabled();
    });

    it("should not call update when quantity would go below 1", () => {
      const minQuantityItem = { ...mockItem, quantity: 1 };

      render(
        <CartItem
          item={minQuantityItem}
          onUpdateQuantity={mockOnUpdateQuantity}
          onRemove={mockOnRemove}
        />
      );

      const minusButton = screen.getByTestId("minus-icon").closest("button")!;
      fireEvent.click(minusButton);

      expect(mockOnUpdateQuantity).not.toHaveBeenCalled();
    });
  });

  describe("Quantity Controls - Direct Input", () => {
    it("should update quantity when typing in input", async () => {
      render(
        <CartItem
          item={mockItem}
          onUpdateQuantity={mockOnUpdateQuantity}
          onRemove={mockOnRemove}
        />
      );

      const input = screen.getByRole("spinbutton");
      fireEvent.change(input, { target: { value: "5" } });

      await waitFor(() => {
        expect(mockOnUpdateQuantity).toHaveBeenCalledWith("item-1", 5);
      });
    });

    it("should handle empty input by setting quantity to 1", async () => {
      render(
        <CartItem
          item={mockItem}
          onUpdateQuantity={mockOnUpdateQuantity}
          onRemove={mockOnRemove}
        />
      );

      const input = screen.getByRole("spinbutton");
      fireEvent.change(input, { target: { value: "" } });

      await waitFor(() => {
        expect(mockOnUpdateQuantity).toHaveBeenCalledWith("item-1", 1);
      });
    });

    it("should handle invalid input by setting quantity to 1", async () => {
      render(
        <CartItem
          item={mockItem}
          onUpdateQuantity={mockOnUpdateQuantity}
          onRemove={mockOnRemove}
        />
      );

      const input = screen.getByRole("spinbutton");
      fireEvent.change(input, { target: { value: "abc" } });

      await waitFor(() => {
        expect(mockOnUpdateQuantity).toHaveBeenCalledWith("item-1", 1);
      });
    });

    it("should have min and max attributes", () => {
      render(
        <CartItem
          item={mockItem}
          onUpdateQuantity={mockOnUpdateQuantity}
          onRemove={mockOnRemove}
        />
      );

      const input = screen.getByRole("spinbutton");
      expect(input).toHaveAttribute("min", "1");
      expect(input).toHaveAttribute("max", "99");
    });
  });

  describe("Error Handling", () => {
    it("should show alert and revert quantity on update error", async () => {
      mockOnUpdateQuantity.mockRejectedValueOnce(new Error("Update failed"));

      render(
        <CartItem
          item={mockItem}
          onUpdateQuantity={mockOnUpdateQuantity}
          onRemove={mockOnRemove}
        />
      );

      const plusButton = screen.getByTestId("plus-icon").closest("button")!;
      fireEvent.click(plusButton);

      await waitFor(() => {
        expect(global.alert).toHaveBeenCalledWith(
          "Failed to update quantity. Please try again."
        );
      });

      // Quantity should revert to original
      const input = screen.getByRole("spinbutton");
      expect(input).toHaveValue(2);
    });

    it("should show alert on remove error", async () => {
      mockOnRemove.mockRejectedValueOnce(new Error("Remove failed"));

      render(
        <CartItem
          item={mockItem}
          onUpdateQuantity={mockOnUpdateQuantity}
          onRemove={mockOnRemove}
        />
      );

      // Open dialog
      const removeButton = screen.getByLabelText("Remove");
      fireEvent.click(removeButton);

      // Confirm removal
      const confirmButton = screen.getByText("Remove");
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(global.alert).toHaveBeenCalledWith(
          "Failed to remove item. Please try again."
        );
      });
    });

    it("should stop loading state after error", async () => {
      mockOnUpdateQuantity.mockRejectedValueOnce(new Error("Update failed"));

      render(
        <CartItem
          item={mockItem}
          onUpdateQuantity={mockOnUpdateQuantity}
          onRemove={mockOnRemove}
        />
      );

      const plusButton = screen.getByTestId("plus-icon").closest("button")!;
      fireEvent.click(plusButton);

      await waitFor(() => {
        expect(screen.queryByTestId("loader-icon")).not.toBeInTheDocument();
      });
    });
  });

  describe("Remove Item", () => {
    it("should open confirm dialog when remove button clicked", () => {
      render(
        <CartItem
          item={mockItem}
          onUpdateQuantity={mockOnUpdateQuantity}
          onRemove={mockOnRemove}
        />
      );

      const removeButton = screen.getByLabelText("Remove");
      fireEvent.click(removeButton);

      expect(screen.getByTestId("confirm-dialog")).toBeInTheDocument();
      expect(screen.getByText("Remove from Cart")).toBeInTheDocument();
    });

    it("should display product name in confirm dialog", () => {
      render(
        <CartItem
          item={mockItem}
          onUpdateQuantity={mockOnUpdateQuantity}
          onRemove={mockOnRemove}
        />
      );

      const removeButton = screen.getByLabelText("Remove");
      fireEvent.click(removeButton);

      expect(
        screen.getByText(/Are you sure you want to remove "Test Product"/)
      ).toBeInTheDocument();
    });

    it("should close dialog when cancel clicked", () => {
      render(
        <CartItem
          item={mockItem}
          onUpdateQuantity={mockOnUpdateQuantity}
          onRemove={mockOnRemove}
        />
      );

      // Open dialog
      const removeButton = screen.getByLabelText("Remove");
      fireEvent.click(removeButton);

      // Cancel
      const cancelButton = screen.getByText("Cancel");
      fireEvent.click(cancelButton);

      expect(screen.queryByTestId("confirm-dialog")).not.toBeInTheDocument();
    });

    it("should call onRemove when confirmed", async () => {
      render(
        <CartItem
          item={mockItem}
          onUpdateQuantity={mockOnUpdateQuantity}
          onRemove={mockOnRemove}
        />
      );

      // Open dialog
      const removeButton = screen.getByLabelText("Remove");
      fireEvent.click(removeButton);

      // Confirm
      const confirmButton = screen.getByText("Remove");
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(mockOnRemove).toHaveBeenCalledWith("item-1");
      });
    });

    it("should close dialog after successful removal", async () => {
      render(
        <CartItem
          item={mockItem}
          onUpdateQuantity={mockOnUpdateQuantity}
          onRemove={mockOnRemove}
        />
      );

      // Open dialog
      const removeButton = screen.getByLabelText("Remove");
      fireEvent.click(removeButton);

      // Confirm
      const confirmButton = screen.getByText("Remove");
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(screen.queryByTestId("confirm-dialog")).not.toBeInTheDocument();
      });
    });

    it("should show danger variant for confirm dialog", () => {
      render(
        <CartItem
          item={mockItem}
          onUpdateQuantity={mockOnUpdateQuantity}
          onRemove={mockOnRemove}
        />
      );

      // Open dialog
      const removeButton = screen.getByLabelText("Remove");
      fireEvent.click(removeButton);

      const confirmButton = screen.getByText("Remove");
      expect(confirmButton).toHaveAttribute("data-variant", "danger");
    });
  });

  describe("Stock Warnings", () => {
    it("should show stock warning when stock is less than quantity", () => {
      const lowStockItem = {
        ...mockItem,
        quantity: 5,
        stockCount: 3,
      };

      render(
        <CartItem
          item={lowStockItem}
          onUpdateQuantity={mockOnUpdateQuantity}
          onRemove={mockOnRemove}
        />
      );

      expect(screen.getByText("Only 3 left in stock")).toBeInTheDocument();
    });

    it("should not show stock warning when stock is sufficient", () => {
      const sufficientStockItem = {
        ...mockItem,
        quantity: 2,
        stockCount: 10,
      };

      render(
        <CartItem
          item={sufficientStockItem}
          onUpdateQuantity={mockOnUpdateQuantity}
          onRemove={mockOnRemove}
        />
      );

      expect(screen.queryByText(/left in stock/)).not.toBeInTheDocument();
    });

    it("should not show stock warning when stockCount is undefined", () => {
      render(
        <CartItem
          item={mockItem}
          onUpdateQuantity={mockOnUpdateQuantity}
          onRemove={mockOnRemove}
        />
      );

      expect(screen.queryByText(/left in stock/)).not.toBeInTheDocument();
    });
  });

  describe("Links & Navigation", () => {
    it("should link product image to product page", () => {
      render(
        <CartItem
          item={mockItem}
          onUpdateQuantity={mockOnUpdateQuantity}
          onRemove={mockOnRemove}
        />
      );

      const imageLink = screen.getByAltText("Test Product").closest("a");
      expect(imageLink).toHaveAttribute("href", "/products/product-1");
    });

    it("should link product name to product page", () => {
      render(
        <CartItem
          item={mockItem}
          onUpdateQuantity={mockOnUpdateQuantity}
          onRemove={mockOnRemove}
        />
      );

      const nameLink = screen.getByText("Test Product").closest("a");
      expect(nameLink).toHaveAttribute("href", "/products/product-1");
    });

    it("should link shop name to shop page", () => {
      render(
        <CartItem
          item={mockItem}
          onUpdateQuantity={mockOnUpdateQuantity}
          onRemove={mockOnRemove}
        />
      );

      const shopLink = screen.getByText("Test Shop").closest("a");
      expect(shopLink).toHaveAttribute("href", "/shops/shop-1");
    });
  });

  describe("Disabled State", () => {
    it("should disable all controls when disabled prop is true", () => {
      render(
        <CartItem
          item={mockItem}
          onUpdateQuantity={mockOnUpdateQuantity}
          onRemove={mockOnRemove}
          disabled={true}
        />
      );

      const plusButton = screen.getByTestId("plus-icon").closest("button")!;
      const minusButton = screen.getByTestId("minus-icon").closest("button")!;
      const input = screen.getByRole("spinbutton");
      const removeButton = screen.getByLabelText("Remove");

      expect(plusButton).toBeDisabled();
      expect(minusButton).toBeDisabled();
      expect(input).toBeDisabled();
      expect(removeButton).toBeDisabled();
    });

    it("should not call onUpdateQuantity when disabled", () => {
      render(
        <CartItem
          item={mockItem}
          onUpdateQuantity={mockOnUpdateQuantity}
          onRemove={mockOnRemove}
          disabled={true}
        />
      );

      const plusButton = screen.getByTestId("plus-icon").closest("button")!;
      fireEvent.click(plusButton);

      expect(mockOnUpdateQuantity).not.toHaveBeenCalled();
    });

    it("should not open remove dialog when disabled", () => {
      render(
        <CartItem
          item={mockItem}
          onUpdateQuantity={mockOnUpdateQuantity}
          onRemove={mockOnRemove}
          disabled={true}
        />
      );

      const removeButton = screen.getByLabelText("Remove");
      fireEvent.click(removeButton);

      expect(screen.queryByTestId("confirm-dialog")).not.toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should handle quantity of 1", () => {
      const singleItem = { ...mockItem, quantity: 1 };

      render(
        <CartItem
          item={singleItem}
          onUpdateQuantity={mockOnUpdateQuantity}
          onRemove={mockOnRemove}
        />
      );

      const input = screen.getByRole("spinbutton");
      expect(input).toHaveValue(1);

      // Check subtotal specifically (not the unit price)
      const subtotals = screen.getAllByText((content, element) => {
        return !!(
          element?.className?.includes("font-semibold") &&
          content.includes("1,000")
        );
      });
      expect(subtotals.length).toBeGreaterThan(0);
    });

    it("should handle quantity of 99", () => {
      const maxItem = { ...mockItem, quantity: 99 };

      render(
        <CartItem
          item={maxItem}
          onUpdateQuantity={mockOnUpdateQuantity}
          onRemove={mockOnRemove}
        />
      );

      const input = screen.getByRole("spinbutton");
      expect(input).toHaveValue(99);

      // Subtotal = 1000 * 99 = 99000
      expect(screen.getByText("₹99,000")).toBeInTheDocument();
    });

    it("should handle large prices with proper formatting", () => {
      const expensiveItem = {
        ...mockItem,
        price: 123456,
        quantity: 1,
      };

      render(
        <CartItem
          item={expensiveItem}
          onUpdateQuantity={mockOnUpdateQuantity}
          onRemove={mockOnRemove}
        />
      );

      // Look for the formatted price text in the unit price section (font-bold)
      const unitPrices = screen.getAllByText((content, element) => {
        return !!(
          element?.className?.includes("font-bold") &&
          content.includes("1,23,456")
        );
      });
      expect(unitPrices.length).toBeGreaterThan(0);
    });

    it("should not show discount when original price equals current price", () => {
      const noDiscountItem = {
        ...mockItem,
        price: 1000,
        originalPrice: 1000,
      };

      render(
        <CartItem
          item={noDiscountItem}
          onUpdateQuantity={mockOnUpdateQuantity}
          onRemove={mockOnRemove}
        />
      );

      // When prices are equal, component treats it as no discount (hasDiscount = false)
      expect(screen.queryByText(/% off/)).not.toBeInTheDocument();
    });

    it("should handle item without shop information", () => {
      const noShopItem = {
        ...mockItem,
        shopId: null,
        shopName: null,
      };

      render(
        <CartItem
          item={noShopItem}
          onUpdateQuantity={mockOnUpdateQuantity}
          onRemove={mockOnRemove}
        />
      );

      // Should not crash, shop name should not be rendered
      expect(screen.queryByText("Test Shop")).not.toBeInTheDocument();
    });

    it("should handle multiple rapid quantity changes", async () => {
      render(
        <CartItem
          item={mockItem}
          onUpdateQuantity={mockOnUpdateQuantity}
          onRemove={mockOnRemove}
        />
      );

      const plusButton = screen.getByTestId("plus-icon").closest("button")!;

      // Click multiple times rapidly
      fireEvent.click(plusButton);
      fireEvent.click(plusButton);
      fireEvent.click(plusButton);

      // Should handle all clicks even if previous ones are still processing
      await waitFor(() => {
        expect(mockOnUpdateQuantity).toHaveBeenCalled();
      });
    });
  });

  describe("Accessibility", () => {
    it("should have accessible remove button with aria-label", () => {
      render(
        <CartItem
          item={mockItem}
          onUpdateQuantity={mockOnUpdateQuantity}
          onRemove={mockOnRemove}
        />
      );

      const removeButton = screen.getByLabelText("Remove");
      expect(removeButton).toHaveAttribute("aria-label", "Remove");
    });

    it("should have proper title attribute on remove button", () => {
      render(
        <CartItem
          item={mockItem}
          onUpdateQuantity={mockOnUpdateQuantity}
          onRemove={mockOnRemove}
        />
      );

      const removeButton = screen.getByLabelText("Remove");
      expect(removeButton).toHaveAttribute("title", "Remove from cart");
    });

    it("should have number input with proper type", () => {
      render(
        <CartItem
          item={mockItem}
          onUpdateQuantity={mockOnUpdateQuantity}
          onRemove={mockOnRemove}
        />
      );

      const input = screen.getByRole("spinbutton");
      expect(input).toHaveAttribute("type", "number");
    });

    it("should disable buttons with proper opacity styling", () => {
      const minItem = { ...mockItem, quantity: 1 };

      render(
        <CartItem
          item={minItem}
          onUpdateQuantity={mockOnUpdateQuantity}
          onRemove={mockOnRemove}
        />
      );

      const minusButton = screen.getByTestId("minus-icon").closest("button")!;
      expect(minusButton).toHaveClass("disabled:opacity-50");
      expect(minusButton).toHaveClass("disabled:cursor-not-allowed");
    });
  });

  describe("Styling & Layout", () => {
    it("should have proper border styling", () => {
      const { container } = render(
        <CartItem
          item={mockItem}
          onUpdateQuantity={mockOnUpdateQuantity}
          onRemove={mockOnRemove}
        />
      );

      const mainDiv = container.querySelector(".border-b");
      expect(mainDiv).toHaveClass("border-gray-200");
    });

    it("should have proper image container size", () => {
      const { container } = render(
        <CartItem
          item={mockItem}
          onUpdateQuantity={mockOnUpdateQuantity}
          onRemove={mockOnRemove}
        />
      );

      const imageContainer = container.querySelector(".w-24.h-24");
      expect(imageContainer).toBeInTheDocument();
      expect(imageContainer).toHaveClass("rounded-lg");
    });

    it("should have proper gap spacing", () => {
      const { container } = render(
        <CartItem
          item={mockItem}
          onUpdateQuantity={mockOnUpdateQuantity}
          onRemove={mockOnRemove}
        />
      );

      const mainDiv = container.querySelector(".gap-4");
      expect(mainDiv).toBeInTheDocument();
    });

    it("should have hover effects on buttons", () => {
      render(
        <CartItem
          item={mockItem}
          onUpdateQuantity={mockOnUpdateQuantity}
          onRemove={mockOnRemove}
        />
      );

      const plusButton = screen.getByTestId("plus-icon").closest("button")!;
      expect(plusButton).toHaveClass("hover:border-gray-400");
    });

    it("should have proper color styling for discount", () => {
      const discountedItem = {
        ...mockItem,
        price: 800,
        originalPrice: 1000,
      };

      render(
        <CartItem
          item={discountedItem}
          onUpdateQuantity={mockOnUpdateQuantity}
          onRemove={mockOnRemove}
        />
      );

      const discountText = screen.getByText("20% off");
      expect(discountText).toHaveClass("text-green-600");
    });
  });
});
