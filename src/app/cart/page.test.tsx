import React from "react";
import {
  render,
  screen,
  waitFor,
  fireEvent,
  act,
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
  CartItem: ({ item, onUpdateQuantity, onRemove }: any) => (
    <div data-testid={`cart-item-${item.id}`}>
      <span>{item.product.name}</span>
      <span>Qty: {item.quantity}</span>
      <button
        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
        data-testid={`increase-${item.id}`}
      >
        +
      </button>
      <button
        onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
        data-testid={`decrease-${item.id}`}
      >
        -
      </button>
      <button
        onClick={() => onRemove(item.id)}
        data-testid={`remove-${item.id}`}
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
      <div>Subtotal: ₹{subtotal}</div>
      <div>Shipping: ₹{shipping}</div>
      <div>Tax: ₹{tax}</div>
      <div>Discount: ₹{discount}</div>
      <div>Total: ₹{total}</div>
      <div>Items: {itemCount}</div>
      {couponCode && <div>Coupon: {couponCode}</div>}
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
  ConfirmDialog: ({ isOpen, onClose, onConfirm, title, description }: any) =>
    isOpen ? (
      <div data-testid="confirm-dialog">
        <h3>{title}</h3>
        <p>{description}</p>
        <button onClick={onConfirm} data-testid="confirm-yes">
          Confirm
        </button>
        <button onClick={onClose} data-testid="confirm-no">
          Cancel
        </button>
      </div>
    ) : null,
}));

jest.mock("@/components/common/Toast", () => ({
  __esModule: true,
  default: ({ message, type, show, onClose }: any) =>
    show ? (
      <div data-testid="toast" data-type={type}>
        {message}
        <button onClick={onClose} data-testid="toast-close">
          ×
        </button>
      </div>
    ) : null,
}));

// Mock lucide-react icons
jest.mock("lucide-react", () => ({
  ShoppingCart: () => <div data-testid="shopping-cart">🛒</div>,
  ArrowLeft: () => <div data-testid="arrow-left">←</div>,
  Trash2: () => <div data-testid="trash">🗑️</div>,
  Loader2: () => <div data-testid="loader">⏳</div>,
}));

describe("CartPage", () => {
  const mockUser = {
    id: "user-1",
    email: "test@example.com",
    displayName: "Test User",
  };

  const mockCartItem = {
    id: "cart-item-1",
    productId: "product-1",
    product: {
      id: "product-1",
      name: "Test Product",
      slug: "test-product",
      price: 1000,
      images: ["/test-image.jpg"],
    },
    quantity: 2,
    price: 1000,
    total: 2000,
    addedAt: new Date(),
  };

  const mockCart = {
    id: "cart-1",
    userId: "user-1",
    items: [mockCartItem],
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

  beforeEach(() => {
    jest.clearAllMocks();

    // Default mocks
    mockUseAuth.mockReturnValue({
      user: mockUser,
      loading: false,
    });

    mockUseCart.mockReturnValue({
      cart: mockCart,
      loading: false,
      isMerging: false,
      mergeSuccess: false,
      updateItem: jest.fn(),
      removeItem: jest.fn(),
      clearCart: jest.fn(),
      applyCoupon: jest.fn(),
      removeCoupon: jest.fn(),
    });
  });

  it("renders loading state initially", () => {
    mockUseCart.mockReturnValue({
      ...mockUseCart(),
      loading: true,
      isMerging: false,
    });

    render(<CartPage />);

    expect(screen.getByTestId("loader")).toBeInTheDocument();
    expect(screen.getByText("Loading cart...")).toBeInTheDocument();
  });

  it("renders merging state when cart is merging", () => {
    mockUseCart.mockReturnValue({
      ...mockUseCart(),
      loading: true,
      isMerging: true,
    });

    render(<CartPage />);

    expect(screen.getByTestId("loader")).toBeInTheDocument();
    expect(screen.getByText("Merging your cart items...")).toBeInTheDocument();
  });

  it("renders empty cart state", () => {
    mockUseCart.mockReturnValue({
      ...mockUseCart(),
      cart: mockEmptyCart,
      loading: false,
    });

    render(<CartPage />);

    expect(screen.getByTestId("empty-state")).toBeInTheDocument();
    expect(screen.getByText("Your cart is empty")).toBeInTheDocument();
    expect(
      screen.getByText("Start adding products to your cart to see them here."),
    ).toBeInTheDocument();
    expect(screen.getByTestId("empty-action")).toBeInTheDocument();
    expect(screen.getByText("Start Shopping")).toBeInTheDocument();
  });

  it("renders cart with items", () => {
    render(<CartPage />);

    expect(screen.getByText("Shopping Cart (1 item)")).toBeInTheDocument();
    expect(screen.getByTestId("cart-summary")).toBeInTheDocument();
    expect(screen.getByTestId("cart-item-cart-item-1")).toBeInTheDocument();
    expect(screen.getByText("Test Product")).toBeInTheDocument();
    expect(screen.getByText("Qty: 2")).toBeInTheDocument();
  });

  it("renders cart with multiple items", () => {
    const mockCartWithMultipleItems = {
      ...mockCart,
      items: [
        mockCartItem,
        {
          ...mockCartItem,
          id: "cart-item-2",
          product: {
            ...mockCartItem.product,
            id: "product-2",
            name: "Test Product 2",
          },
        },
      ],
      itemCount: 2,
    };

    mockUseCart.mockReturnValue({
      ...mockUseCart(),
      cart: mockCartWithMultipleItems,
    });

    render(<CartPage />);

    expect(screen.getByText("Shopping Cart (2 items)")).toBeInTheDocument();
    expect(screen.getByTestId("cart-item-cart-item-1")).toBeInTheDocument();
    expect(screen.getByTestId("cart-item-cart-item-2")).toBeInTheDocument();
  });

  it("shows continue shopping link", () => {
    render(<CartPage />);

    expect(screen.getByTestId("arrow-left")).toBeInTheDocument();
    expect(screen.getByText("Continue Shopping")).toBeInTheDocument();
  });

  it("shows clear cart button when cart has items", () => {
    render(<CartPage />);

    expect(screen.getByTestId("trash")).toBeInTheDocument();
    expect(screen.getByText("Clear Cart")).toBeInTheDocument();
  });

  it("does not show clear cart button when cart is empty", () => {
    mockUseCart.mockReturnValue({
      ...mockUseCart(),
      cart: mockEmptyCart,
    });

    render(<CartPage />);

    expect(screen.queryByText("Clear Cart")).not.toBeInTheDocument();
  });

  it("opens clear cart confirmation dialog", () => {
    render(<CartPage />);

    const clearButton = screen.getByRole("button", { name: /clear cart/i });
    fireEvent.click(clearButton);

    expect(screen.getByTestId("confirm-dialog")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Clear Cart" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Are you sure you want to remove all items from your cart? This action cannot be undone.",
      ),
    ).toBeInTheDocument();
  });

  it("clears cart when confirmed", async () => {
    const mockClearCart = jest.fn().mockResolvedValue(undefined);
    mockUseCart.mockReturnValue({
      ...mockUseCart(),
      clearCart: mockClearCart,
    });

    render(<CartPage />);

    // Open dialog
    const clearButton = screen.getByRole("button", { name: /clear cart/i });
    fireEvent.click(clearButton);

    // Confirm
    const confirmButton = screen.getByTestId("confirm-yes");
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockClearCart).toHaveBeenCalled();
    });

    // Dialog should close after clearing
    await waitFor(() => {
      expect(screen.queryByTestId("confirm-dialog")).not.toBeInTheDocument();
    });
  });

  it("closes clear cart dialog when cancelled", () => {
    render(<CartPage />);

    // Open dialog
    const clearButton = screen.getByText("Clear Cart");
    fireEvent.click(clearButton);

    // Cancel
    const cancelButton = screen.getByTestId("confirm-no");
    fireEvent.click(cancelButton);

    expect(screen.queryByTestId("confirm-dialog")).not.toBeInTheDocument();
  });

  it("handles clear cart error", async () => {
    const mockClearCart = jest
      .fn()
      .mockRejectedValue(new Error("Clear failed"));
    mockUseCart.mockReturnValue({
      ...mockUseCart(),
      clearCart: mockClearCart,
    });

    // Mock alert
    const mockAlert = jest.spyOn(window, "alert").mockImplementation(() => {});

    render(<CartPage />);

    // Open dialog
    const clearButton = screen.getByText("Clear Cart");
    fireEvent.click(clearButton);

    // Confirm
    const confirmButton = screen.getByTestId("confirm-yes");
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith(
        "Failed to clear cart. Please try again.",
      );
    });

    mockAlert.mockRestore();
  });

  it("updates item quantity", () => {
    const mockUpdateItem = jest.fn();
    mockUseCart.mockReturnValue({
      ...mockUseCart(),
      updateItem: mockUpdateItem,
    });

    render(<CartPage />);

    const increaseButton = screen.getByTestId("increase-cart-item-1");
    fireEvent.click(increaseButton);

    expect(mockUpdateItem).toHaveBeenCalledWith("cart-item-1", 3);
  });

  it("removes item from cart", () => {
    const mockRemoveItem = jest.fn();
    mockUseCart.mockReturnValue({
      ...mockUseCart(),
      removeItem: mockRemoveItem,
    });

    render(<CartPage />);

    const removeButton = screen.getByTestId("remove-cart-item-1");
    fireEvent.click(removeButton);

    expect(mockRemoveItem).toHaveBeenCalledWith("cart-item-1");
  });

  it("applies coupon", () => {
    const mockApplyCoupon = jest.fn();
    mockUseCart.mockReturnValue({
      ...mockUseCart(),
      applyCoupon: mockApplyCoupon,
    });

    render(<CartPage />);

    const applyButton = screen.getByTestId("apply-coupon");
    fireEvent.click(applyButton);

    expect(mockApplyCoupon).toHaveBeenCalledWith("TEST10");
  });

  it("removes coupon when applied", () => {
    const mockRemoveCoupon = jest.fn();
    mockUseCart.mockReturnValue({
      ...mockUseCart(),
      cart: { ...mockCart, couponCode: "TEST10" },
      removeCoupon: mockRemoveCoupon,
    });

    render(<CartPage />);

    expect(screen.getByText("Coupon: TEST10")).toBeInTheDocument();

    const removeButton = screen.getByTestId("remove-coupon");
    fireEvent.click(removeButton);

    expect(mockRemoveCoupon).toHaveBeenCalled();
  });

  it("navigates to checkout when user is logged in", () => {
    render(<CartPage />);

    const checkoutButton = screen.getByTestId("checkout-button");
    fireEvent.click(checkoutButton);

    expect(mockPush).toHaveBeenCalledWith("/checkout");
  });

  it("redirects to login when checking out without authentication", () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
    });

    render(<CartPage />);

    const checkoutButton = screen.getByTestId("checkout-button");
    fireEvent.click(checkoutButton);

    expect(mockPush).toHaveBeenCalledWith("/login?redirect=/checkout");
  });

  it("shows guest checkout notice when not logged in", () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
    });

    render(<CartPage />);

    expect(screen.getByText("New to Letitrip?")).toBeInTheDocument();
    expect(screen.getByText("Create Account →")).toBeInTheDocument();
  });

  it("does not show guest checkout notice when logged in", () => {
    render(<CartPage />);

    expect(screen.queryByText("New to Letitrip?")).not.toBeInTheDocument();
  });

  it("shows merge success toast", () => {
    mockUseCart.mockReturnValue({
      ...mockUseCart(),
      mergeSuccess: true,
    });

    render(<CartPage />);

    expect(screen.getByTestId("toast")).toBeInTheDocument();
    expect(
      screen.getByText("Your cart items have been successfully merged!"),
    ).toBeInTheDocument();
  });

  it("closes merge success toast", async () => {
    mockUseCart.mockReturnValue({
      ...mockUseCart(),
      mergeSuccess: true,
    });

    render(<CartPage />);

    // Wait for toast to appear
    await waitFor(() => {
      expect(screen.getByTestId("toast")).toBeInTheDocument();
    });

    const closeButton = screen.getByTestId("toast-close");
    fireEvent.click(closeButton);

    // Toast should close
    await waitFor(() => {
      expect(screen.queryByTestId("toast")).not.toBeInTheDocument();
    });
  });

  it("navigates to products page from empty state", () => {
    mockUseCart.mockReturnValue({
      ...mockUseCart(),
      cart: mockEmptyCart,
    });

    render(<CartPage />);

    const startShoppingButton = screen.getByTestId("empty-action");
    fireEvent.click(startShoppingButton);

    expect(mockPush).toHaveBeenCalledWith("/products");
  });

  it("shows accepted payment methods", () => {
    render(<CartPage />);

    expect(screen.getByText("We Accept")).toBeInTheDocument();
    expect(screen.getByText("UPI")).toBeInTheDocument();
    expect(screen.getByText("Credit Card")).toBeInTheDocument();
    expect(screen.getByText("Debit Card")).toBeInTheDocument();
    expect(screen.getByText("Net Banking")).toBeInTheDocument();
  });

  it("shows additional info sections", () => {
    render(<CartPage />);

    expect(screen.getByText("Free Shipping")).toBeInTheDocument();
    expect(screen.getByText("On orders above ₹5,000")).toBeInTheDocument();
    expect(screen.getByText("Secure Payment")).toBeInTheDocument();
    expect(screen.getByText("100% secure transactions")).toBeInTheDocument();
    expect(screen.getByText("Easy Returns")).toBeInTheDocument();
    expect(screen.getByText("7-day return policy")).toBeInTheDocument();
  });

  it("shows recommendations section", () => {
    render(<CartPage />);

    expect(screen.getByText("You might also like")).toBeInTheDocument();
    expect(
      screen.getByText("Product recommendations will appear here"),
    ).toBeInTheDocument();
  });
});
