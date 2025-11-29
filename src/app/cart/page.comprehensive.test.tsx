import React from "react";
import {
  render,
  screen,
  waitFor,
  fireEvent,
  within,
} from "@testing-library/react";
import CartPage from "@/app/cart/page";

// Mock Firebase
jest.mock("@/app/api/lib/firebase/app", () => ({
  app: {},
  database: {},
  analytics: null,
}));

// Mock next/navigation
const mockPush = jest.fn();
const mockBack = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    back: mockBack,
  }),
}));

// Mock hooks
jest.mock("@/hooks/useCart");
jest.mock("@/contexts/AuthContext");

const mockUseCart = require("@/hooks/useCart").useCart;
const mockUseAuth = require("@/contexts/AuthContext").useAuth;

// Mock components
jest.mock("@/components/cart/CartItem", () => ({
  CartItem: ({ item, onUpdateQuantity, onRemove, disabled }: any) => (
    <div data-testid={`cart-item-${item.id}`}>
      <span>{item.product.name}</span>
      <span>Qty: {item.quantity}</span>
      <span>Price: ₹{item.price}</span>
      <button
        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
        data-testid={`increase-${item.id}`}
        disabled={disabled}
      >
        +
      </button>
      <button
        onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
        data-testid={`decrease-${item.id}`}
        disabled={disabled}
      >
        -
      </button>
      <button
        onClick={() => onRemove(item.id)}
        data-testid={`remove-${item.id}`}
        disabled={disabled}
      >
        Remove
      </button>
    </div>
  ),
}));

jest.mock("@/components/cart/CartSummary", () => ({
  CartSummary: ({
    subtotal,
    shipping,
    tax,
    discount,
    total,
    itemCount,
    couponCode,
    onApplyCoupon,
    onRemoveCoupon,
    onCheckout,
  }: any) => (
    <div data-testid="cart-summary">
      <div data-testid="subtotal">Subtotal: ₹{subtotal}</div>
      <div data-testid="shipping">Shipping: ₹{shipping}</div>
      <div data-testid="tax">Tax: ₹{tax}</div>
      <div data-testid="discount">Discount: ₹{discount}</div>
      <div data-testid="total">Total: ₹{total}</div>
      <div data-testid="item-count">Items: {itemCount}</div>
      {couponCode && <div data-testid="coupon-code">Coupon: {couponCode}</div>}
      <button
        onClick={() => onApplyCoupon("TEST10")}
        data-testid="apply-coupon"
      >
        Apply Coupon
      </button>
      {couponCode && (
        <button onClick={onRemoveCoupon} data-testid="remove-coupon">
          Remove Coupon
        </button>
      )}
      <button onClick={onCheckout} data-testid="checkout-button">
        Checkout
      </button>
    </div>
  ),
}));

jest.mock("@/components/common/EmptyState", () => ({
  EmptyState: ({ title, description, action }: any) => (
    <div data-testid="empty-state">
      <h2>{title}</h2>
      <p>{description}</p>
      <button onClick={action.onClick} data-testid="empty-action">
        {action.label}
      </button>
    </div>
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
    variant,
  }: any) =>
    isOpen ? (
      <div data-testid="confirm-dialog" data-variant={variant}>
        <h3>{title}</h3>
        <p>{description}</p>
        <button onClick={onConfirm} data-testid="confirm-yes">
          {confirmLabel}
        </button>
        <button onClick={onClose} data-testid="confirm-no">
          Cancel
        </button>
      </div>
    ) : null,
}));

jest.mock("@/components/common/Toast", () => ({
  __esModule: true,
  default: ({ message, type, show, onClose, duration }: any) =>
    show ? (
      <div data-testid="toast" data-type={type} data-duration={duration}>
        {message}
        <button onClick={onClose} data-testid="toast-close">
          ×
        </button>
      </div>
    ) : null,
}));

// Mock lucide-react icons
jest.mock("lucide-react", () => ({
  ShoppingCart: () => <div data-testid="shopping-cart-icon">🛒</div>,
  ArrowLeft: () => <div data-testid="arrow-left-icon">←</div>,
  Trash2: () => <div data-testid="trash-icon">🗑️</div>,
  Loader2: () => <div data-testid="loader-icon">⏳</div>,
}));

// Mock next/link
jest.mock("next/link", () => {
  return ({ children, href }: any) => (
    <a href={href} data-testid={`link-${href}`}>
      {children}
    </a>
  );
});

describe("CartPage - Comprehensive Tests", () => {
  const mockUser = {
    id: "user-1",
    email: "test@example.com",
    displayName: "Test User",
  };

  const createMockCartItem = (id: string, overrides = {}) => ({
    id: `cart-item-${id}`,
    productId: `product-${id}`,
    product: {
      id: `product-${id}`,
      name: `Test Product ${id}`,
      slug: `test-product-${id}`,
      price: 1000,
      images: [`/test-image-${id}.jpg`],
    },
    quantity: 2,
    price: 1000,
    total: 2000,
    addedAt: new Date(),
    ...overrides,
  });

  const mockCart = {
    id: "cart-1",
    userId: "user-1",
    items: [createMockCartItem("1")],
    itemCount: 1,
    subtotal: 2000,
    tax: 360,
    discount: 0,
    total: 2360,
    shipping: 0,
    couponCode: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockEmptyCart = {
    ...mockCart,
    items: [],
    itemCount: 0,
    subtotal: 0,
    tax: 0,
    total: 0,
  };

  const defaultCartHookValue = {
    cart: mockCart,
    loading: false,
    isMerging: false,
    mergeSuccess: false,
    updateItem: jest.fn(),
    removeItem: jest.fn(),
    clearCart: jest.fn(),
    applyCoupon: jest.fn(),
    removeCoupon: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseAuth.mockReturnValue({
      user: mockUser,
      loading: false,
    });

    mockUseCart.mockReturnValue(defaultCartHookValue);
  });

  describe("Loading States", () => {
    it("should show loading state when cart is loading", () => {
      mockUseCart.mockReturnValue({
        ...defaultCartHookValue,
        loading: true,
      });

      render(<CartPage />);

      expect(screen.getByTestId("loader-icon")).toBeInTheDocument();
      expect(screen.getByText("Loading cart...")).toBeInTheDocument();
    });

    it("should show merging state when cart is merging", () => {
      mockUseCart.mockReturnValue({
        ...defaultCartHookValue,
        loading: true,
        isMerging: true,
      });

      render(<CartPage />);

      expect(screen.getByTestId("loader-icon")).toBeInTheDocument();
      expect(
        screen.getByText("Merging your cart items..."),
      ).toBeInTheDocument();
    });

    it("should have proper loading state container styling", () => {
      mockUseCart.mockReturnValue({
        ...defaultCartHookValue,
        loading: true,
      });

      const { container } = render(<CartPage />);
      const loadingContainer = container.querySelector(
        ".min-h-screen.bg-gray-50",
      );

      expect(loadingContainer).toBeInTheDocument();
    });

    it("should transition from loading to content state", async () => {
      const { rerender } = render(<CartPage />);

      mockUseCart.mockReturnValue({
        ...defaultCartHookValue,
        loading: true,
      });

      rerender(<CartPage />);
      expect(screen.getByTestId("loader-icon")).toBeInTheDocument();

      mockUseCart.mockReturnValue(defaultCartHookValue);
      rerender(<CartPage />);

      await waitFor(() => {
        expect(screen.queryByTestId("loader-icon")).not.toBeInTheDocument();
        expect(screen.getByText(/Shopping Cart/i)).toBeInTheDocument();
      });
    });
  });

  describe("Empty Cart State", () => {
    beforeEach(() => {
      mockUseCart.mockReturnValue({
        ...defaultCartHookValue,
        cart: mockEmptyCart,
      });
    });

    it("should render empty state component", () => {
      render(<CartPage />);

      expect(screen.getByTestId("empty-state")).toBeInTheDocument();
    });

    it("should show empty cart title and description", () => {
      render(<CartPage />);

      expect(screen.getByText("Your cart is empty")).toBeInTheDocument();
      expect(
        screen.getByText(
          "Start adding products to your cart to see them here.",
        ),
      ).toBeInTheDocument();
    });

    it("should show continue shopping link in empty state", () => {
      render(<CartPage />);

      expect(screen.getByTestId("arrow-left-icon")).toBeInTheDocument();
      expect(screen.getByText("Continue Shopping")).toBeInTheDocument();
    });

    it("should navigate to products page from empty state action", () => {
      render(<CartPage />);

      const actionButton = screen.getByTestId("empty-action");
      fireEvent.click(actionButton);

      expect(mockPush).toHaveBeenCalledWith("/products");
    });

    it("should not show clear cart button in empty state", () => {
      render(<CartPage />);

      expect(screen.queryByText("Clear Cart")).not.toBeInTheDocument();
    });

    it("should not render cart summary in empty state", () => {
      render(<CartPage />);

      expect(screen.queryByTestId("cart-summary")).not.toBeInTheDocument();
    });

    it("should not render recommendations in empty state", () => {
      render(<CartPage />);

      expect(screen.queryByText("You might also like")).not.toBeInTheDocument();
    });

    it("should handle null cart as empty", () => {
      mockUseCart.mockReturnValue({
        ...defaultCartHookValue,
        cart: null,
      });

      render(<CartPage />);

      expect(screen.getByTestId("empty-state")).toBeInTheDocument();
    });

    it("should handle cart with null items as empty", () => {
      mockUseCart.mockReturnValue({
        ...defaultCartHookValue,
        cart: { ...mockEmptyCart, items: null as any },
      });

      render(<CartPage />);

      expect(screen.getByTestId("empty-state")).toBeInTheDocument();
    });

    it("should handle cart with undefined items as empty", () => {
      mockUseCart.mockReturnValue({
        ...defaultCartHookValue,
        cart: { ...mockEmptyCart, items: undefined as any },
      });

      render(<CartPage />);

      expect(screen.getByTestId("empty-state")).toBeInTheDocument();
    });
  });

  describe("Cart Content Rendering", () => {
    it("should render cart page header", () => {
      render(<CartPage />);

      expect(screen.getByText(/Shopping Cart/i)).toBeInTheDocument();
    });

    it("should display correct item count for single item", () => {
      render(<CartPage />);

      expect(screen.getByText("Shopping Cart (1 item)")).toBeInTheDocument();
    });

    it("should display correct item count for multiple items", () => {
      mockUseCart.mockReturnValue({
        ...defaultCartHookValue,
        cart: {
          ...mockCart,
          items: [createMockCartItem("1"), createMockCartItem("2")],
          itemCount: 2,
        },
      });

      render(<CartPage />);

      expect(screen.getByText("Shopping Cart (2 items)")).toBeInTheDocument();
    });

    it("should render all cart items", () => {
      mockUseCart.mockReturnValue({
        ...defaultCartHookValue,
        cart: {
          ...mockCart,
          items: [
            createMockCartItem("1"),
            createMockCartItem("2"),
            createMockCartItem("3"),
          ],
          itemCount: 3,
        },
      });

      render(<CartPage />);

      expect(screen.getByTestId("cart-item-cart-item-1")).toBeInTheDocument();
      expect(screen.getByTestId("cart-item-cart-item-2")).toBeInTheDocument();
      expect(screen.getByTestId("cart-item-cart-item-3")).toBeInTheDocument();
    });

    it("should render CartItem with correct props", () => {
      const mockUpdateItem = jest.fn();
      const mockRemoveItem = jest.fn();

      mockUseCart.mockReturnValue({
        ...defaultCartHookValue,
        updateItem: mockUpdateItem,
        removeItem: mockRemoveItem,
      });

      render(<CartPage />);

      expect(screen.getByText("Test Product 1")).toBeInTheDocument();
      expect(screen.getByText("Qty: 2")).toBeInTheDocument();
      expect(screen.getByText("Price: ₹1000")).toBeInTheDocument();
    });

    it("should render cart summary sidebar", () => {
      render(<CartPage />);

      expect(screen.getByTestId("cart-summary")).toBeInTheDocument();
    });

    it("should pass correct props to CartSummary", () => {
      render(<CartPage />);

      expect(screen.getByTestId("subtotal")).toHaveTextContent(
        "Subtotal: ₹2000",
      );
      expect(screen.getByTestId("shipping")).toHaveTextContent("Shipping: ₹0");
      expect(screen.getByTestId("tax")).toHaveTextContent("Tax: ₹360");
      expect(screen.getByTestId("discount")).toHaveTextContent("Discount: ₹0");
      expect(screen.getByTestId("total")).toHaveTextContent("Total: ₹2360");
      expect(screen.getByTestId("item-count")).toHaveTextContent("Items: 1");
    });

    it("should show continue shopping link with icon", () => {
      render(<CartPage />);

      expect(screen.getByTestId("arrow-left-icon")).toBeInTheDocument();
      expect(screen.getByText("Continue Shopping")).toBeInTheDocument();
      expect(screen.getByTestId("link-/")).toBeInTheDocument();
    });

    it("should show clear cart button with icon", () => {
      render(<CartPage />);

      expect(screen.getByTestId("trash-icon")).toBeInTheDocument();
      expect(screen.getByText("Clear Cart")).toBeInTheDocument();
    });

    it("should render recommendations section", () => {
      render(<CartPage />);

      expect(screen.getByText("You might also like")).toBeInTheDocument();
      expect(
        screen.getByText("Product recommendations will appear here"),
      ).toBeInTheDocument();
    });

    it("should render accepted payment methods section", () => {
      render(<CartPage />);

      expect(screen.getByText("We Accept")).toBeInTheDocument();
      expect(screen.getByText("UPI")).toBeInTheDocument();
      expect(screen.getByText("Credit Card")).toBeInTheDocument();
      expect(screen.getByText("Debit Card")).toBeInTheDocument();
      expect(screen.getByText("Net Banking")).toBeInTheDocument();
    });

    it("should render additional info sections with emojis", () => {
      render(<CartPage />);

      expect(screen.getByText("Free Shipping")).toBeInTheDocument();
      expect(screen.getByText("On orders above ₹5,000")).toBeInTheDocument();
      expect(screen.getByText("Secure Payment")).toBeInTheDocument();
      expect(screen.getByText("100% secure transactions")).toBeInTheDocument();
      expect(screen.getByText("Easy Returns")).toBeInTheDocument();
      expect(screen.getByText("7-day return policy")).toBeInTheDocument();
    });
  });

  describe("Cart Item Operations", () => {
    it("should call updateItem when increasing quantity", () => {
      const mockUpdateItem = jest.fn();
      mockUseCart.mockReturnValue({
        ...defaultCartHookValue,
        updateItem: mockUpdateItem,
      });

      render(<CartPage />);

      const increaseButton = screen.getByTestId("increase-cart-item-1");
      fireEvent.click(increaseButton);

      expect(mockUpdateItem).toHaveBeenCalledWith("cart-item-1", 3);
    });

    it("should call updateItem when decreasing quantity", () => {
      const mockUpdateItem = jest.fn();
      mockUseCart.mockReturnValue({
        ...defaultCartHookValue,
        updateItem: mockUpdateItem,
      });

      render(<CartPage />);

      const decreaseButton = screen.getByTestId("decrease-cart-item-1");
      fireEvent.click(decreaseButton);

      expect(mockUpdateItem).toHaveBeenCalledWith("cart-item-1", 1);
    });

    it("should call removeItem when clicking remove", () => {
      const mockRemoveItem = jest.fn();
      mockUseCart.mockReturnValue({
        ...defaultCartHookValue,
        removeItem: mockRemoveItem,
      });

      render(<CartPage />);

      const removeButton = screen.getByTestId("remove-cart-item-1");
      fireEvent.click(removeButton);

      expect(mockRemoveItem).toHaveBeenCalledWith("cart-item-1");
    });

    it("should update multiple items independently", () => {
      const mockUpdateItem = jest.fn();
      mockUseCart.mockReturnValue({
        ...defaultCartHookValue,
        cart: {
          ...mockCart,
          items: [createMockCartItem("1"), createMockCartItem("2")],
          itemCount: 2,
        },
        updateItem: mockUpdateItem,
      });

      render(<CartPage />);

      fireEvent.click(screen.getByTestId("increase-cart-item-1"));
      fireEvent.click(screen.getByTestId("increase-cart-item-2"));

      expect(mockUpdateItem).toHaveBeenCalledWith("cart-item-1", 3);
      expect(mockUpdateItem).toHaveBeenCalledWith("cart-item-2", 3);
    });

    it("should remove multiple items independently", () => {
      const mockRemoveItem = jest.fn();
      mockUseCart.mockReturnValue({
        ...defaultCartHookValue,
        cart: {
          ...mockCart,
          items: [createMockCartItem("1"), createMockCartItem("2")],
          itemCount: 2,
        },
        removeItem: mockRemoveItem,
      });

      render(<CartPage />);

      fireEvent.click(screen.getByTestId("remove-cart-item-1"));
      fireEvent.click(screen.getByTestId("remove-cart-item-2"));

      expect(mockRemoveItem).toHaveBeenCalledWith("cart-item-1");
      expect(mockRemoveItem).toHaveBeenCalledWith("cart-item-2");
    });
  });

  describe("Clear Cart Functionality", () => {
    it("should open clear cart confirmation dialog", () => {
      render(<CartPage />);

      const clearButton = screen.getByText("Clear Cart");
      fireEvent.click(clearButton);

      expect(screen.getByTestId("confirm-dialog")).toBeInTheDocument();
    });

    it("should show correct dialog content", () => {
      render(<CartPage />);

      fireEvent.click(screen.getByText("Clear Cart"));

      expect(
        screen.getByRole("heading", { name: "Clear Cart" }),
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          "Are you sure you want to remove all items from your cart? This action cannot be undone.",
        ),
      ).toBeInTheDocument();
    });

    it("should have danger variant on confirm dialog", () => {
      render(<CartPage />);

      fireEvent.click(screen.getByText("Clear Cart"));

      const dialog = screen.getByTestId("confirm-dialog");
      expect(dialog).toHaveAttribute("data-variant", "danger");
    });

    it("should call clearCart when confirmed", async () => {
      const mockClearCart = jest.fn().mockResolvedValue(undefined);
      mockUseCart.mockReturnValue({
        ...defaultCartHookValue,
        clearCart: mockClearCart,
      });

      render(<CartPage />);

      fireEvent.click(screen.getByText("Clear Cart"));
      fireEvent.click(screen.getByTestId("confirm-yes"));

      await waitFor(() => {
        expect(mockClearCart).toHaveBeenCalled();
      });
    });

    it("should close dialog after successful clear", async () => {
      const mockClearCart = jest.fn().mockResolvedValue(undefined);
      mockUseCart.mockReturnValue({
        ...defaultCartHookValue,
        clearCart: mockClearCart,
      });

      render(<CartPage />);

      fireEvent.click(screen.getByText("Clear Cart"));
      fireEvent.click(screen.getByTestId("confirm-yes"));

      await waitFor(() => {
        expect(screen.queryByTestId("confirm-dialog")).not.toBeInTheDocument();
      });
    });

    it("should close dialog when cancelled", () => {
      render(<CartPage />);

      fireEvent.click(screen.getByText("Clear Cart"));
      fireEvent.click(screen.getByTestId("confirm-no"));

      expect(screen.queryByTestId("confirm-dialog")).not.toBeInTheDocument();
    });

    it("should not call clearCart when cancelled", () => {
      const mockClearCart = jest.fn();
      mockUseCart.mockReturnValue({
        ...defaultCartHookValue,
        clearCart: mockClearCart,
      });

      render(<CartPage />);

      fireEvent.click(screen.getByText("Clear Cart"));
      fireEvent.click(screen.getByTestId("confirm-no"));

      expect(mockClearCart).not.toHaveBeenCalled();
    });

    it("should show alert on clear cart error", async () => {
      const mockClearCart = jest
        .fn()
        .mockRejectedValue(new Error("Clear failed"));
      mockUseCart.mockReturnValue({
        ...defaultCartHookValue,
        clearCart: mockClearCart,
      });

      const mockAlert = jest
        .spyOn(window, "alert")
        .mockImplementation(() => {});

      render(<CartPage />);

      fireEvent.click(screen.getByText("Clear Cart"));
      fireEvent.click(screen.getByTestId("confirm-yes"));

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith(
          "Failed to clear cart. Please try again.",
        );
      });

      mockAlert.mockRestore();
    });

    it("should keep dialog open on error", async () => {
      const mockClearCart = jest
        .fn()
        .mockRejectedValue(new Error("Clear failed"));
      mockUseCart.mockReturnValue({
        ...defaultCartHookValue,
        clearCart: mockClearCart,
      });

      const mockAlert = jest
        .spyOn(window, "alert")
        .mockImplementation(() => {});

      render(<CartPage />);

      fireEvent.click(screen.getByText("Clear Cart"));
      fireEvent.click(screen.getByTestId("confirm-yes"));

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalled();
      });

      // Dialog should still be visible after error
      expect(screen.getByTestId("confirm-dialog")).toBeInTheDocument();

      mockAlert.mockRestore();
    });
  });

  describe("Coupon Management", () => {
    it("should apply coupon through CartSummary", () => {
      const mockApplyCoupon = jest.fn().mockResolvedValue(undefined);
      mockUseCart.mockReturnValue({
        ...defaultCartHookValue,
        applyCoupon: mockApplyCoupon,
      });

      render(<CartPage />);

      fireEvent.click(screen.getByTestId("apply-coupon"));

      expect(mockApplyCoupon).toHaveBeenCalledWith("TEST10");
    });

    it("should display applied coupon code", () => {
      mockUseCart.mockReturnValue({
        ...defaultCartHookValue,
        cart: { ...mockCart, couponCode: "SAVE20" },
      });

      render(<CartPage />);

      expect(screen.getByTestId("coupon-code")).toHaveTextContent(
        "Coupon: SAVE20",
      );
    });

    it("should show remove coupon button when coupon is applied", () => {
      mockUseCart.mockReturnValue({
        ...defaultCartHookValue,
        cart: { ...mockCart, couponCode: "SAVE20" },
      });

      render(<CartPage />);

      expect(screen.getByTestId("remove-coupon")).toBeInTheDocument();
    });

    it("should remove coupon when remove button is clicked", () => {
      const mockRemoveCoupon = jest.fn();
      mockUseCart.mockReturnValue({
        ...defaultCartHookValue,
        cart: { ...mockCart, couponCode: "SAVE20" },
        removeCoupon: mockRemoveCoupon,
      });

      render(<CartPage />);

      fireEvent.click(screen.getByTestId("remove-coupon"));

      expect(mockRemoveCoupon).toHaveBeenCalled();
    });

    it("should not show remove button when no coupon applied", () => {
      render(<CartPage />);

      expect(screen.queryByTestId("remove-coupon")).not.toBeInTheDocument();
    });

    it("should pass applyCoupon handler to CartSummary", () => {
      const mockApplyCoupon = jest.fn();
      mockUseCart.mockReturnValue({
        ...defaultCartHookValue,
        applyCoupon: mockApplyCoupon,
      });

      render(<CartPage />);

      fireEvent.click(screen.getByTestId("apply-coupon"));

      expect(mockApplyCoupon).toHaveBeenCalledWith("TEST10");
    });

    it("should update discount when coupon is applied", () => {
      mockUseCart.mockReturnValue({
        ...defaultCartHookValue,
        cart: {
          ...mockCart,
          couponCode: "SAVE20",
          discount: 400,
          total: 1960,
        },
      });

      render(<CartPage />);

      expect(screen.getByTestId("discount")).toHaveTextContent(
        "Discount: ₹400",
      );
      expect(screen.getByTestId("total")).toHaveTextContent("Total: ₹1960");
    });
  });

  describe("Checkout Navigation", () => {
    it("should navigate to checkout when logged in", () => {
      render(<CartPage />);

      fireEvent.click(screen.getByTestId("checkout-button"));

      expect(mockPush).toHaveBeenCalledWith("/checkout");
    });

    it("should redirect to login with return URL when not logged in", () => {
      mockUseAuth.mockReturnValue({
        user: null,
        loading: false,
      });

      render(<CartPage />);

      fireEvent.click(screen.getByTestId("checkout-button"));

      expect(mockPush).toHaveBeenCalledWith("/login?redirect=/checkout");
    });

    it("should not navigate to checkout on Enter key (rely on button click)", () => {
      render(<CartPage />);

      const checkoutButton = screen.getByTestId("checkout-button");
      fireEvent.keyDown(checkoutButton, { key: "Enter", code: "Enter" });

      // Should only navigate on click, not on Enter (button handles its own Enter)
      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  describe("Guest User Experience", () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: null,
        loading: false,
      });
    });

    it("should show guest checkout notice", () => {
      render(<CartPage />);

      expect(screen.getByText("New to Letitrip?")).toBeInTheDocument();
      expect(
        screen.getByText(
          "Create an account to track your order and enjoy faster checkout next time.",
        ),
      ).toBeInTheDocument();
    });

    it("should have create account link", () => {
      render(<CartPage />);

      const createAccountLink = screen.getByText("Create Account →");
      expect(createAccountLink).toBeInTheDocument();
      expect(createAccountLink.closest("a")).toHaveAttribute(
        "href",
        "/register",
      );
    });

    it("should not show guest notice when logged in", () => {
      mockUseAuth.mockReturnValue({
        user: mockUser,
        loading: false,
      });

      render(<CartPage />);

      expect(screen.queryByText("New to Letitrip?")).not.toBeInTheDocument();
    });
  });

  describe("Merge Success Toast", () => {
    it("should show toast when merge is successful", () => {
      mockUseCart.mockReturnValue({
        ...defaultCartHookValue,
        mergeSuccess: true,
      });

      render(<CartPage />);

      expect(screen.getByTestId("toast")).toBeInTheDocument();
      expect(
        screen.getByText("Your cart items have been successfully merged!"),
      ).toBeInTheDocument();
    });

    it("should have success type on toast", () => {
      mockUseCart.mockReturnValue({
        ...defaultCartHookValue,
        mergeSuccess: true,
      });

      render(<CartPage />);

      const toast = screen.getByTestId("toast");
      expect(toast).toHaveAttribute("data-type", "success");
    });

    it("should have 3000ms duration on toast", () => {
      mockUseCart.mockReturnValue({
        ...defaultCartHookValue,
        mergeSuccess: true,
      });

      render(<CartPage />);

      const toast = screen.getByTestId("toast");
      expect(toast).toHaveAttribute("data-duration", "3000");
    });

    it("should close toast when close button is clicked", async () => {
      mockUseCart.mockReturnValue({
        ...defaultCartHookValue,
        mergeSuccess: true,
      });

      render(<CartPage />);

      const closeButton = screen.getByTestId("toast-close");
      fireEvent.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByTestId("toast")).not.toBeInTheDocument();
      });
    });

    it("should not show toast when merge is not successful", () => {
      render(<CartPage />);

      expect(screen.queryByTestId("toast")).not.toBeInTheDocument();
    });

    it("should show toast only when both showToast and mergeSuccess are true", () => {
      mockUseCart.mockReturnValue({
        ...defaultCartHookValue,
        mergeSuccess: false,
      });

      render(<CartPage />);

      expect(screen.queryByTestId("toast")).not.toBeInTheDocument();
    });
  });

  describe("Cart Calculations", () => {
    it("should display subtotal correctly", () => {
      mockUseCart.mockReturnValue({
        ...defaultCartHookValue,
        cart: { ...mockCart, subtotal: 5000 },
      });

      render(<CartPage />);

      expect(screen.getByTestId("subtotal")).toHaveTextContent(
        "Subtotal: ₹5000",
      );
    });

    it("should display shipping cost", () => {
      mockUseCart.mockReturnValue({
        ...defaultCartHookValue,
        cart: { ...mockCart, shipping: 100 },
      });

      render(<CartPage />);

      expect(screen.getByTestId("shipping")).toHaveTextContent(
        "Shipping: ₹100",
      );
    });

    it("should handle undefined shipping as 0", () => {
      mockUseCart.mockReturnValue({
        ...defaultCartHookValue,
        cart: { ...mockCart, shipping: undefined },
      });

      render(<CartPage />);

      expect(screen.getByTestId("shipping")).toHaveTextContent("Shipping: ₹0");
    });

    it("should display tax correctly", () => {
      render(<CartPage />);

      expect(screen.getByTestId("tax")).toHaveTextContent("Tax: ₹360");
    });

    it("should display discount when applied", () => {
      mockUseCart.mockReturnValue({
        ...defaultCartHookValue,
        cart: { ...mockCart, discount: 500 },
      });

      render(<CartPage />);

      expect(screen.getByTestId("discount")).toHaveTextContent(
        "Discount: ₹500",
      );
    });

    it("should display correct total", () => {
      render(<CartPage />);

      expect(screen.getByTestId("total")).toHaveTextContent("Total: ₹2360");
    });

    it("should handle large numbers in calculations", () => {
      mockUseCart.mockReturnValue({
        ...defaultCartHookValue,
        cart: {
          ...mockCart,
          subtotal: 99999,
          tax: 17999,
          total: 117998,
        },
      });

      render(<CartPage />);

      expect(screen.getByTestId("subtotal")).toHaveTextContent(
        "Subtotal: ₹99999",
      );
      expect(screen.getByTestId("tax")).toHaveTextContent("Tax: ₹17999");
      expect(screen.getByTestId("total")).toHaveTextContent("Total: ₹117998");
    });
  });

  describe("Edge Cases", () => {
    it("should handle cart with very large item count", () => {
      mockUseCart.mockReturnValue({
        ...defaultCartHookValue,
        cart: { ...mockCart, itemCount: 999 },
      });

      render(<CartPage />);

      expect(screen.getByText("Shopping Cart (999 items)")).toBeInTheDocument();
    });

    it("should handle item with quantity of 1", () => {
      const itemQty1 = createMockCartItem("1", { quantity: 1, total: 1000 });

      mockUseCart.mockReturnValue({
        ...defaultCartHookValue,
        cart: { ...mockCart, items: [itemQty1] },
      });

      render(<CartPage />);

      expect(screen.getByText("Qty: 1")).toBeInTheDocument();
    });

    it("should handle item with quantity of 99", () => {
      const itemQty99 = createMockCartItem("1", { quantity: 99, total: 99000 });

      mockUseCart.mockReturnValue({
        ...defaultCartHookValue,
        cart: { ...mockCart, items: [itemQty99] },
      });

      render(<CartPage />);

      expect(screen.getByText("Qty: 99")).toBeInTheDocument();
    });

    it("should handle cart with 0 subtotal", () => {
      mockUseCart.mockReturnValue({
        ...defaultCartHookValue,
        cart: { ...mockCart, subtotal: 0, tax: 0, total: 0 },
      });

      render(<CartPage />);

      expect(screen.getByTestId("subtotal")).toHaveTextContent("Subtotal: ₹0");
      expect(screen.getByTestId("total")).toHaveTextContent("Total: ₹0");
    });

    it("should handle rapid button clicks", () => {
      const mockUpdateItem = jest.fn();
      mockUseCart.mockReturnValue({
        ...defaultCartHookValue,
        updateItem: mockUpdateItem,
      });

      render(<CartPage />);

      const increaseButton = screen.getByTestId("increase-cart-item-1");

      // Simulate rapid clicks
      fireEvent.click(increaseButton);
      fireEvent.click(increaseButton);
      fireEvent.click(increaseButton);

      expect(mockUpdateItem).toHaveBeenCalledTimes(3);
    });

    it("should handle cart state updates during operations", async () => {
      const { rerender } = render(<CartPage />);

      // Update cart
      mockUseCart.mockReturnValue({
        ...defaultCartHookValue,
        cart: {
          ...mockCart,
          items: [createMockCartItem("1"), createMockCartItem("2")],
          itemCount: 2,
        },
      });

      rerender(<CartPage />);

      await waitFor(() => {
        expect(screen.getByText("Shopping Cart (2 items)")).toBeInTheDocument();
      });
    });

    it("should handle missing coupon code gracefully", () => {
      mockUseCart.mockReturnValue({
        ...defaultCartHookValue,
        cart: { ...mockCart, couponCode: undefined },
      });

      render(<CartPage />);

      expect(screen.queryByTestId("coupon-code")).not.toBeInTheDocument();
    });

    it("should handle null coupon code gracefully", () => {
      mockUseCart.mockReturnValue({
        ...defaultCartHookValue,
        cart: { ...mockCart, couponCode: null },
      });

      render(<CartPage />);

      expect(screen.queryByTestId("coupon-code")).not.toBeInTheDocument();
    });

    it("should handle empty string coupon code", () => {
      mockUseCart.mockReturnValue({
        ...defaultCartHookValue,
        cart: { ...mockCart, couponCode: "" },
      });

      render(<CartPage />);

      // Empty string is falsy, should not show coupon
      expect(screen.queryByTestId("coupon-code")).not.toBeInTheDocument();
    });
  });

  describe("Accessibility & Layout", () => {
    it("should have proper heading hierarchy", () => {
      render(<CartPage />);

      const mainHeading = screen.getByText(/Shopping Cart/i);
      expect(mainHeading).toBeInTheDocument();
      expect(mainHeading.tagName).toBe("H1");
    });

    it("should render recommendations heading as h2", () => {
      render(<CartPage />);

      const recommendationsHeading = screen.getByText("You might also like");
      expect(recommendationsHeading).toBeInTheDocument();
      expect(recommendationsHeading.tagName).toBe("H2");
    });

    it("should render payment methods heading as h3", () => {
      render(<CartPage />);

      const paymentHeading = screen.getByText("We Accept");
      expect(paymentHeading).toBeInTheDocument();
      expect(paymentHeading.tagName).toBe("H3");
    });

    it("should have responsive grid layout", () => {
      const { container } = render(<CartPage />);

      const gridContainer = container.querySelector(
        ".lg\\:grid.lg\\:grid-cols-12",
      );
      expect(gridContainer).toBeInTheDocument();
    });

    it("should have proper spacing classes", () => {
      const { container } = render(<CartPage />);

      const mainContainer = container.querySelector(".max-w-7xl.mx-auto");
      expect(mainContainer).toBeInTheDocument();
    });

    it("should render info cards in grid", () => {
      const { container } = render(<CartPage />);

      const infoGrid = container.querySelector(".md\\:grid-cols-3");
      expect(infoGrid).toBeInTheDocument();
    });
  });

  describe("Component Integration", () => {
    it("should pass updateItem function to CartItem components", () => {
      const mockUpdateItem = jest.fn();
      mockUseCart.mockReturnValue({
        ...defaultCartHookValue,
        updateItem: mockUpdateItem,
      });

      render(<CartPage />);

      fireEvent.click(screen.getByTestId("increase-cart-item-1"));

      expect(mockUpdateItem).toHaveBeenCalled();
    });

    it("should pass removeItem function to CartItem components", () => {
      const mockRemoveItem = jest.fn();
      mockUseCart.mockReturnValue({
        ...defaultCartHookValue,
        removeItem: mockRemoveItem,
      });

      render(<CartPage />);

      fireEvent.click(screen.getByTestId("remove-cart-item-1"));

      expect(mockRemoveItem).toHaveBeenCalled();
    });

    it("should pass checkout handler to CartSummary", () => {
      render(<CartPage />);

      fireEvent.click(screen.getByTestId("checkout-button"));

      expect(mockPush).toHaveBeenCalledWith("/checkout");
    });

    it("should pass coupon handlers to CartSummary", () => {
      const mockApplyCoupon = jest.fn();
      const mockRemoveCoupon = jest.fn();

      mockUseCart.mockReturnValue({
        ...defaultCartHookValue,
        cart: { ...mockCart, couponCode: "TEST10" },
        applyCoupon: mockApplyCoupon,
        removeCoupon: mockRemoveCoupon,
      });

      render(<CartPage />);

      fireEvent.click(screen.getByTestId("apply-coupon"));
      fireEvent.click(screen.getByTestId("remove-coupon"));

      expect(mockApplyCoupon).toHaveBeenCalled();
      expect(mockRemoveCoupon).toHaveBeenCalled();
    });
  });
});
