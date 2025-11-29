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

// Mock MobileSwipeActions to prevent duplicate rendering in tests
// The component renders both mobile and desktop versions, causing duplicate elements
jest.mock("@/components/mobile/MobileSwipeActions", () => ({
  MobileSwipeActions: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  createDeleteAction: jest.fn((onClick) => ({
    id: "delete",
    icon: null,
    label: "Delete",
    color: "text-white",
    bgColor: "bg-red-500",
    onClick,
  })),
}));

// Helper to get the desktop container to avoid duplicate element issues
// The CartItem component renders both mobile (sm:hidden) and desktop (hidden sm:block) versions
// We need to be careful to select the outer container div, not child elements with similar classes
const getDesktopContainer = (container: HTMLElement) => {
  // The desktop wrapper is a direct child div with classes "hidden sm:block"
  const children = container.querySelectorAll(":scope > div.hidden.sm\\:block");
  for (const child of children) {
    // The desktop container has the cartItemContent inside, not just buttons
    if (child.querySelector(".border-b")) {
      return child as HTMLElement;
    }
  }
  // Fallback - find any div with the classes that contains the cart content
  return container.querySelector("div.hidden.sm\\:block") as HTMLElement;
};

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

  // Helper to render with scoped desktop queries
  const renderWithDesktop = (item = mockItem, disabled = false) => {
    const result = render(
      <CartItem
        item={item}
        onUpdateQuantity={mockOnUpdateQuantity}
        onRemove={mockOnRemove}
        disabled={disabled}
      />
    );
    const desktop = getDesktopContainer(result.container);
    return {
      ...result,
      desktop,
      withinDesktop: within(desktop),
    };
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockOnUpdateQuantity.mockResolvedValue(undefined);
    mockOnRemove.mockResolvedValue(undefined);

    // Mock window.alert
    global.alert = jest.fn();
  });

  describe("Basic Rendering", () => {
    it("should render product image", () => {
      const { withinDesktop } = renderWithDesktop();

      const image = withinDesktop.getByAltText("Test Product");
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute("src", "/test-image.jpg");
    });

    it("should render placeholder when no image provided", () => {
      const itemWithoutImage = { ...mockItem, productImage: "" };

      const { withinDesktop } = renderWithDesktop(itemWithoutImage);

      expect(withinDesktop.getByText("No image")).toBeInTheDocument();
    });

    it("should render product name", () => {
      const { withinDesktop } = renderWithDesktop();

      expect(withinDesktop.getByText("Test Product")).toBeInTheDocument();
    });

    it("should render shop name", () => {
      const { withinDesktop } = renderWithDesktop();

      expect(withinDesktop.getByText("Test Shop")).toBeInTheDocument();
    });

    it("should render current quantity in input", () => {
      const { withinDesktop } = renderWithDesktop();

      const input = withinDesktop.getByRole("spinbutton");
      expect(input).toHaveValue(2);
    });

    it("should render quantity control buttons", () => {
      const { withinDesktop } = renderWithDesktop();

      expect(withinDesktop.getByTestId("minus-icon")).toBeInTheDocument();
      expect(withinDesktop.getByTestId("plus-icon")).toBeInTheDocument();
    });

    it("should render remove button", () => {
      const { withinDesktop } = renderWithDesktop();

      expect(withinDesktop.getByLabelText("Remove")).toBeInTheDocument();
      expect(withinDesktop.getByTestId("trash-icon")).toBeInTheDocument();
    });

    it("should render variant information when present", () => {
      const itemWithVariant = {
        ...mockItem,
        variantId: "variant-1",
      };

      const { withinDesktop } = renderWithDesktop(itemWithVariant);

      expect(withinDesktop.getByText(/Variant: variant-1/)).toBeInTheDocument();
    });

    it("should not render variant information when absent", () => {
      const { withinDesktop } = renderWithDesktop();

      expect(withinDesktop.queryByText(/Variant:/)).not.toBeInTheDocument();
    });
  });

  describe("Price Display", () => {
    it("should display product price with Indian formatting", () => {
      const { withinDesktop } = renderWithDesktop();

      expect(withinDesktop.getByText("₹1,000")).toBeInTheDocument();
    });

    it("should display subtotal based on quantity", () => {
      const { withinDesktop } = renderWithDesktop();

      // Subtotal = price * quantity = 1000 * 2 = 2000
      expect(withinDesktop.getByText("₹2,000")).toBeInTheDocument();
    });

    it("should display original price when discounted", () => {
      const discountedItem = {
        ...mockItem,
        price: 800,
        originalPrice: 1000,
      };

      const { withinDesktop } = renderWithDesktop(discountedItem);

      expect(withinDesktop.getByText("₹800")).toBeInTheDocument();
      expect(withinDesktop.getByText("₹1,000")).toBeInTheDocument();
    });

    it("should display discount percentage", () => {
      const discountedItem = {
        ...mockItem,
        price: 800,
        originalPrice: 1000,
      };

      const { withinDesktop } = renderWithDesktop(discountedItem);

      // Discount = (1000 - 800) / 1000 * 100 = 20%
      expect(withinDesktop.getByText("20% off")).toBeInTheDocument();
    });

    it("should not display discount info when no original price", () => {
      const { withinDesktop } = renderWithDesktop();

      expect(withinDesktop.queryByText(/% off/)).not.toBeInTheDocument();
    });

    it("should update subtotal when quantity changes", async () => {
      const { withinDesktop } = renderWithDesktop();

      const plusButton = withinDesktop
        .getByTestId("plus-icon")
        .closest("button")!;
      fireEvent.click(plusButton);

      await waitFor(() => {
        // New subtotal = 1000 * 3 = 3000
        expect(withinDesktop.getByText("₹3,000")).toBeInTheDocument();
      });
    });
  });

  describe("Quantity Controls - Increment", () => {
    it("should increment quantity when plus button clicked", async () => {
      const { withinDesktop } = renderWithDesktop();

      const plusButton = withinDesktop
        .getByTestId("plus-icon")
        .closest("button")!;
      fireEvent.click(plusButton);

      await waitFor(() => {
        expect(mockOnUpdateQuantity).toHaveBeenCalledWith("item-1", 3);
      });
    });

    it("should disable plus button when quantity is 99", () => {
      const maxQuantityItem = { ...mockItem, quantity: 99 };

      const { withinDesktop } = renderWithDesktop(maxQuantityItem);

      const plusButton = withinDesktop
        .getByTestId("plus-icon")
        .closest("button")!;
      expect(plusButton).toBeDisabled();
    });

    it("should show loading spinner when updating quantity", async () => {
      mockOnUpdateQuantity.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      const { withinDesktop } = renderWithDesktop();

      const plusButton = withinDesktop
        .getByTestId("plus-icon")
        .closest("button")!;
      fireEvent.click(plusButton);

      expect(withinDesktop.getByTestId("loader-icon")).toBeInTheDocument();

      await waitFor(() => {
        expect(
          withinDesktop.queryByTestId("loader-icon")
        ).not.toBeInTheDocument();
      });
    });

    it("should disable controls while updating", async () => {
      mockOnUpdateQuantity.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      const { withinDesktop } = renderWithDesktop();

      const plusButton = withinDesktop
        .getByTestId("plus-icon")
        .closest("button")!;
      fireEvent.click(plusButton);

      const minusButton = withinDesktop
        .getByTestId("minus-icon")
        .closest("button")!;
      const input = withinDesktop.getByRole("spinbutton");

      expect(plusButton).toBeDisabled();
      expect(minusButton).toBeDisabled();
      expect(input).toBeDisabled();
    });
  });

  describe("Quantity Controls - Decrement", () => {
    it("should decrement quantity when minus button clicked", async () => {
      const { withinDesktop } = renderWithDesktop();

      const minusButton = withinDesktop
        .getByTestId("minus-icon")
        .closest("button")!;
      fireEvent.click(minusButton);

      await waitFor(() => {
        expect(mockOnUpdateQuantity).toHaveBeenCalledWith("item-1", 1);
      });
    });

    it("should disable minus button when quantity is 1", () => {
      const minQuantityItem = { ...mockItem, quantity: 1 };

      const { withinDesktop } = renderWithDesktop(minQuantityItem);

      const minusButton = withinDesktop
        .getByTestId("minus-icon")
        .closest("button")!;
      expect(minusButton).toBeDisabled();
    });

    it("should not call update when quantity would go below 1", () => {
      const minQuantityItem = { ...mockItem, quantity: 1 };

      const { withinDesktop } = renderWithDesktop(minQuantityItem);

      const minusButton = withinDesktop
        .getByTestId("minus-icon")
        .closest("button")!;
      fireEvent.click(minusButton);

      expect(mockOnUpdateQuantity).not.toHaveBeenCalled();
    });
  });

  describe("Quantity Controls - Direct Input", () => {
    it("should update quantity when typing in input", async () => {
      const { withinDesktop } = renderWithDesktop();

      const input = withinDesktop.getByRole("spinbutton");
      fireEvent.change(input, { target: { value: "5" } });

      await waitFor(() => {
        expect(mockOnUpdateQuantity).toHaveBeenCalledWith("item-1", 5);
      });
    });

    it("should handle empty input by setting quantity to 1", async () => {
      const { withinDesktop } = renderWithDesktop();

      const input = withinDesktop.getByRole("spinbutton");
      fireEvent.change(input, { target: { value: "" } });

      await waitFor(() => {
        expect(mockOnUpdateQuantity).toHaveBeenCalledWith("item-1", 1);
      });
    });

    it("should handle invalid input by setting quantity to 1", async () => {
      const { withinDesktop } = renderWithDesktop();

      const input = withinDesktop.getByRole("spinbutton");
      fireEvent.change(input, { target: { value: "abc" } });

      await waitFor(() => {
        expect(mockOnUpdateQuantity).toHaveBeenCalledWith("item-1", 1);
      });
    });

    it("should have min and max attributes", () => {
      const { withinDesktop } = renderWithDesktop();

      const input = withinDesktop.getByRole("spinbutton");
      expect(input).toHaveAttribute("min", "1");
      expect(input).toHaveAttribute("max", "99");
    });
  });

  describe("Error Handling", () => {
    it("should show alert and revert quantity on update error", async () => {
      mockOnUpdateQuantity.mockRejectedValueOnce(new Error("Update failed"));

      const { withinDesktop } = renderWithDesktop();

      const plusButton = withinDesktop
        .getByTestId("plus-icon")
        .closest("button")!;
      fireEvent.click(plusButton);

      await waitFor(() => {
        expect(global.alert).toHaveBeenCalledWith(
          "Failed to update quantity. Please try again."
        );
      });

      // Quantity should revert to original
      const input = withinDesktop.getByRole("spinbutton");
      expect(input).toHaveValue(2);
    });

    it("should show alert on remove error", async () => {
      mockOnRemove.mockRejectedValueOnce(new Error("Remove failed"));

      const { withinDesktop } = renderWithDesktop();

      // Open dialog
      const removeButton = withinDesktop.getByLabelText("Remove");
      fireEvent.click(removeButton);

      // Confirm removal (dialog is outside desktop container)
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

      const { withinDesktop } = renderWithDesktop();

      const plusButton = withinDesktop
        .getByTestId("plus-icon")
        .closest("button")!;
      fireEvent.click(plusButton);

      await waitFor(() => {
        expect(
          withinDesktop.queryByTestId("loader-icon")
        ).not.toBeInTheDocument();
      });
    });
  });

  describe("Remove Item", () => {
    it("should open confirm dialog when remove button clicked", () => {
      const { withinDesktop } = renderWithDesktop();

      const removeButton = withinDesktop.getByLabelText("Remove");
      fireEvent.click(removeButton);

      expect(screen.getByTestId("confirm-dialog")).toBeInTheDocument();
      expect(screen.getByText("Remove from Cart")).toBeInTheDocument();
    });

    it("should display product name in confirm dialog", () => {
      const { withinDesktop } = renderWithDesktop();

      const removeButton = withinDesktop.getByLabelText("Remove");
      fireEvent.click(removeButton);

      expect(
        screen.getByText(/Are you sure you want to remove "Test Product"/)
      ).toBeInTheDocument();
    });

    it("should close dialog when cancel clicked", () => {
      const { withinDesktop } = renderWithDesktop();

      // Open dialog
      const removeButton = withinDesktop.getByLabelText("Remove");
      fireEvent.click(removeButton);

      // Cancel
      const cancelButton = screen.getByText("Cancel");
      fireEvent.click(cancelButton);

      expect(screen.queryByTestId("confirm-dialog")).not.toBeInTheDocument();
    });

    it("should call onRemove when confirmed", async () => {
      const { withinDesktop } = renderWithDesktop();

      // Open dialog
      const removeButton = withinDesktop.getByLabelText("Remove");
      fireEvent.click(removeButton);

      // Confirm
      const confirmButton = screen.getByText("Remove");
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(mockOnRemove).toHaveBeenCalledWith("item-1");
      });
    });

    it("should close dialog after successful removal", async () => {
      const { withinDesktop } = renderWithDesktop();

      // Open dialog
      const removeButton = withinDesktop.getByLabelText("Remove");
      fireEvent.click(removeButton);

      // Confirm
      const confirmButton = screen.getByText("Remove");
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(screen.queryByTestId("confirm-dialog")).not.toBeInTheDocument();
      });
    });

    it("should show danger variant for confirm dialog", () => {
      const { withinDesktop } = renderWithDesktop();

      // Open dialog
      const removeButton = withinDesktop.getByLabelText("Remove");
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

      const { withinDesktop } = renderWithDesktop(lowStockItem);

      expect(
        withinDesktop.getByText("Only 3 left in stock")
      ).toBeInTheDocument();
    });

    it("should not show stock warning when stock is sufficient", () => {
      const sufficientStockItem = {
        ...mockItem,
        quantity: 2,
        stockCount: 10,
      };

      const { withinDesktop } = renderWithDesktop(sufficientStockItem);

      expect(
        withinDesktop.queryByText(/left in stock/)
      ).not.toBeInTheDocument();
    });

    it("should not show stock warning when stockCount is undefined", () => {
      const { withinDesktop } = renderWithDesktop();

      expect(
        withinDesktop.queryByText(/left in stock/)
      ).not.toBeInTheDocument();
    });
  });

  describe("Links & Navigation", () => {
    it("should link product image to product page", () => {
      const { withinDesktop } = renderWithDesktop();

      const imageLink = withinDesktop.getByAltText("Test Product").closest("a");
      expect(imageLink).toHaveAttribute("href", "/products/product-1");
    });

    it("should link product name to product page", () => {
      const { withinDesktop } = renderWithDesktop();

      const nameLink = withinDesktop.getByText("Test Product").closest("a");
      expect(nameLink).toHaveAttribute("href", "/products/product-1");
    });

    it("should link shop name to shop page", () => {
      const { withinDesktop } = renderWithDesktop();

      const shopLink = withinDesktop.getByText("Test Shop").closest("a");
      expect(shopLink).toHaveAttribute("href", "/shops/shop-1");
    });
  });

  describe("Disabled State", () => {
    it("should disable all controls when disabled prop is true", () => {
      const { withinDesktop } = renderWithDesktop(mockItem, true);

      const plusButton = withinDesktop
        .getByTestId("plus-icon")
        .closest("button")!;
      const minusButton = withinDesktop
        .getByTestId("minus-icon")
        .closest("button")!;
      const input = withinDesktop.getByRole("spinbutton");
      const removeButton = withinDesktop.getByLabelText("Remove");

      expect(plusButton).toBeDisabled();
      expect(minusButton).toBeDisabled();
      expect(input).toBeDisabled();
      expect(removeButton).toBeDisabled();
    });

    it("should not call onUpdateQuantity when disabled", () => {
      const { withinDesktop } = renderWithDesktop(mockItem, true);

      const plusButton = withinDesktop
        .getByTestId("plus-icon")
        .closest("button")!;
      fireEvent.click(plusButton);

      expect(mockOnUpdateQuantity).not.toHaveBeenCalled();
    });

    it("should not open remove dialog when disabled", () => {
      const { withinDesktop } = renderWithDesktop(mockItem, true);

      const removeButton = withinDesktop.getByLabelText("Remove");
      fireEvent.click(removeButton);

      expect(screen.queryByTestId("confirm-dialog")).not.toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should handle quantity of 1", () => {
      const singleItem = { ...mockItem, quantity: 1 };

      const { withinDesktop } = renderWithDesktop(singleItem);

      const input = withinDesktop.getByRole("spinbutton");
      expect(input).toHaveValue(1);

      // Check subtotal specifically (not the unit price)
      const subtotals = withinDesktop.getAllByText((content, element) => {
        return !!(
          element?.className?.includes("font-semibold") &&
          content.includes("1,000")
        );
      });
      expect(subtotals.length).toBeGreaterThan(0);
    });

    it("should handle quantity of 99", () => {
      const maxItem = { ...mockItem, quantity: 99 };

      const { withinDesktop } = renderWithDesktop(maxItem);

      const input = withinDesktop.getByRole("spinbutton");
      expect(input).toHaveValue(99);

      // Subtotal = 1000 * 99 = 99000
      expect(withinDesktop.getByText("₹99,000")).toBeInTheDocument();
    });

    it("should handle large prices with proper formatting", () => {
      const expensiveItem = {
        ...mockItem,
        price: 123456,
        quantity: 1,
      };

      const { withinDesktop } = renderWithDesktop(expensiveItem);

      // Look for the formatted price text in the unit price section (font-bold)
      const unitPrices = withinDesktop.getAllByText((content, element) => {
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

      const { withinDesktop } = renderWithDesktop(noDiscountItem);

      // When prices are equal, component treats it as no discount (hasDiscount = false)
      expect(withinDesktop.queryByText(/% off/)).not.toBeInTheDocument();
    });

    it("should handle item without shop information", () => {
      const noShopItem = {
        ...mockItem,
        shopId: null,
        shopName: null,
      };

      const { withinDesktop } = renderWithDesktop(noShopItem);

      // Should not crash, shop name should not be rendered
      expect(withinDesktop.queryByText("Test Shop")).not.toBeInTheDocument();
    });

    it("should handle multiple rapid quantity changes", async () => {
      const { withinDesktop } = renderWithDesktop();

      const plusButton = withinDesktop
        .getByTestId("plus-icon")
        .closest("button")!;

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
      const { withinDesktop } = renderWithDesktop();

      const removeButton = withinDesktop.getByLabelText("Remove");
      expect(removeButton).toHaveAttribute("aria-label", "Remove");
    });

    it("should have proper title attribute on remove button", () => {
      const { withinDesktop } = renderWithDesktop();

      const removeButton = withinDesktop.getByLabelText("Remove");
      expect(removeButton).toHaveAttribute("title", "Remove from cart");
    });

    it("should have number input with proper type", () => {
      const { withinDesktop } = renderWithDesktop();

      const input = withinDesktop.getByRole("spinbutton");
      expect(input).toHaveAttribute("type", "number");
    });

    it("should disable buttons with proper opacity styling", () => {
      const minItem = { ...mockItem, quantity: 1 };

      const { withinDesktop } = renderWithDesktop(minItem);

      const minusButton = withinDesktop
        .getByTestId("minus-icon")
        .closest("button")!;
      expect(minusButton).toHaveClass("disabled:opacity-50");
      expect(minusButton).toHaveClass("disabled:cursor-not-allowed");
    });
  });

  describe("Styling & Layout", () => {
    it("should have proper border styling", () => {
      const { desktop } = renderWithDesktop();

      const mainDiv = desktop.querySelector(".border-b");
      expect(mainDiv).toHaveClass("border-gray-200");
    });

    it("should have proper image container size", () => {
      const { desktop } = renderWithDesktop();

      const imageContainer = desktop.querySelector(".w-24.h-24");
      expect(imageContainer).toBeInTheDocument();
      expect(imageContainer).toHaveClass("rounded-lg");
    });

    it("should have proper gap spacing", () => {
      const { desktop } = renderWithDesktop();

      const mainDiv = desktop.querySelector(".gap-4");
      expect(mainDiv).toBeInTheDocument();
    });

    it("should have hover effects on buttons", () => {
      const { withinDesktop } = renderWithDesktop();

      const plusButton = withinDesktop
        .getByTestId("plus-icon")
        .closest("button")!;
      expect(plusButton).toHaveClass("hover:border-gray-400");
    });

    it("should have proper color styling for discount", () => {
      const discountedItem = {
        ...mockItem,
        price: 800,
        originalPrice: 1000,
      };

      const { withinDesktop } = renderWithDesktop(discountedItem);

      const discountText = withinDesktop.getByText("20% off");
      expect(discountText).toHaveClass("text-green-600");
    });
  });
});
