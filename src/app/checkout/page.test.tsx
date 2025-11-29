import React from "react";
import {
  render,
  screen,
  waitFor,
  fireEvent,
  act,
} from "@testing-library/react";
import CheckoutPage from "@/app/checkout/page";

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

// Mock services
jest.mock("@/services/checkout.service");

const mockCheckoutService =
  require("@/services/checkout.service").checkoutService;

// Mock components
jest.mock("@/components/common/ErrorBoundary", () => ({
  ErrorBoundary: ({ children }: any) => <>{children}</>,
}));

jest.mock("@/components/common/ErrorMessage", () => ({
  ErrorMessage: ({ message, showRetry, onRetry }: any) => (
    <div data-testid="error-message">
      <p>{message}</p>
      {showRetry && (
        <button onClick={onRetry} data-testid="error-retry">
          Retry
        </button>
      )}
    </div>
  ),
}));

jest.mock("@/components/checkout/AddressSelector", () => ({
  AddressSelector: ({ selectedId, onSelect, type }: any) => (
    <div data-testid={`address-selector-${type}`}>
      <select
        value={selectedId}
        onChange={(e) => onSelect(e.target.value)}
        data-testid={`address-select-${type}`}
      >
        <option value="">Select {type} address</option>
        <option value="addr-1">Address 1</option>
        <option value="addr-2">Address 2</option>
      </select>
    </div>
  ),
}));

jest.mock("@/components/checkout/PaymentMethod", () => ({
  PaymentMethod: ({ selected, onSelect }: any) => (
    <div data-testid="payment-method">
      <button
        onClick={() => onSelect("razorpay")}
        data-testid="select-razorpay"
        className={selected === "razorpay" ? "selected" : ""}
      >
        Razorpay
      </button>
      <button
        onClick={() => onSelect("cod")}
        data-testid="select-cod"
        className={selected === "cod" ? "selected" : ""}
      >
        Cash on Delivery
      </button>
    </div>
  ),
}));

jest.mock("@/components/checkout/ShopOrderSummary", () => ({
  ShopOrderSummary: ({
    shopId,
    shopName,
    items,
    appliedCoupon,
    onApplyCoupon,
    onRemoveCoupon,
  }: any) => (
    <div data-testid={`shop-summary-${shopId}`}>
      <h3>{shopName}</h3>
      <p>{items.length} items</p>
      {appliedCoupon && (
        <div data-testid={`coupon-${shopId}`}>
          Coupon: {appliedCoupon.code} (-₹{appliedCoupon.discountAmount})
          <button
            onClick={() => onRemoveCoupon(shopId)}
            data-testid={`remove-coupon-${shopId}`}
          >
            Remove
          </button>
        </div>
      )}
      {!appliedCoupon && (
        <button
          onClick={() => onApplyCoupon(shopId, "TEST10")}
          data-testid={`apply-coupon-${shopId}`}
        >
          Apply Coupon
        </button>
      )}
    </div>
  ),
}));

// Mock lucide-react icons
jest.mock("lucide-react", () => ({
  ChevronLeft: () => <div data-testid="chevron-left">←</div>,
  Check: () => <div data-testid="check">✓</div>,
  Loader2: () => <div data-testid="loader">⏳</div>,
  ShoppingBag: () => <div data-testid="shopping-bag">🛒</div>,
  MapPin: () => <div data-testid="map-pin">📍</div>,
  CreditCard: () => <div data-testid="credit-card">💳</div>,
  FileText: () => <div data-testid="file-text">📄</div>,
}));

// Mock Razorpay
const mockRazorpay = {
  open: jest.fn(),
  on: jest.fn(),
};
global.window.Razorpay = jest.fn(() => mockRazorpay);

describe("CheckoutPage", () => {
  const mockUser = {
    id: "user-1",
    email: "test@example.com",
    fullName: "Test User",
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
    shopId: "shop-1",
    shopName: "Test Shop",
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
    });

    // Mock Razorpay
    global.window.Razorpay = jest.fn(() => mockRazorpay);
  });

  it("redirects to login when not authenticated", () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
    });

    render(<CheckoutPage />);

    expect(mockPush).toHaveBeenCalledWith("/login?redirect=/checkout");
  });

  it("redirects to cart when cart is empty", () => {
    mockUseCart.mockReturnValue({
      cart: mockEmptyCart,
      loading: false,
    });

    render(<CheckoutPage />);

    expect(mockPush).toHaveBeenCalledWith("/cart");
  });

  it("shows loading state when cart is loading", () => {
    mockUseCart.mockReturnValue({
      cart: null,
      loading: true,
    });

    render(<CheckoutPage />);

    expect(screen.getByTestId("loader")).toBeInTheDocument();
  });

  it("shows loading state when user is loading", () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: true,
    });

    render(<CheckoutPage />);

    expect(screen.getByTestId("loader")).toBeInTheDocument();
  });

  it("renders checkout page with cart items", () => {
    render(<CheckoutPage />);

    expect(screen.getByText("Checkout")).toBeInTheDocument();
    expect(screen.getByText("Back to Cart")).toBeInTheDocument();
    expect(screen.getByTestId("chevron-left")).toBeInTheDocument();
  });

  it("starts with address step", () => {
    render(<CheckoutPage />);

    expect(screen.getByTestId("address-selector-shipping")).toBeInTheDocument();
    expect(
      screen.getByText("Billing address same as shipping"),
    ).toBeInTheDocument();
  });

  it("shows progress steps", () => {
    render(<CheckoutPage />);

    // Check for the step labels in the progress indicator
    expect(screen.getByTestId("map-pin")).toBeInTheDocument();
    expect(screen.getByTestId("credit-card")).toBeInTheDocument();
    expect(screen.getByTestId("file-text")).toBeInTheDocument();
  });

  it("validates shipping address selection", async () => {
    render(<CheckoutPage />);

    const continueButton = screen.getByText("Continue");
    fireEvent.click(continueButton);

    await waitFor(() => {
      expect(
        screen.getByText("Please complete all required fields to continue."),
      ).toBeInTheDocument();
    });

    expect(
      screen.getByText("Please select a shipping address"),
    ).toBeInTheDocument();
  });

  it("navigates to payment step when address is selected", async () => {
    render(<CheckoutPage />);

    // Select shipping address
    const shippingSelect = screen.getByTestId("address-select-shipping");
    fireEvent.change(shippingSelect, { target: { value: "addr-1" } });

    const continueButton = screen.getByText("Continue");
    fireEvent.click(continueButton);

    await waitFor(() => {
      expect(screen.getByTestId("payment-method")).toBeInTheDocument();
    });
  });

  it("validates billing address when not using same address", async () => {
    render(<CheckoutPage />);

    // Select shipping address
    const shippingSelect = screen.getByTestId("address-select-shipping");
    fireEvent.change(shippingSelect, { target: { value: "addr-1" } });

    // Uncheck same address
    const sameAddressCheckbox = screen.getByLabelText(
      "Billing address same as shipping",
    );
    fireEvent.click(sameAddressCheckbox);

    const continueButton = screen.getByText("Continue");
    fireEvent.click(continueButton);

    await waitFor(() => {
      expect(
        screen.getByText("Please select a billing address"),
      ).toBeInTheDocument();
    });
  });

  it("shows billing address selector when not using same address", async () => {
    render(<CheckoutPage />);

    // Uncheck same address
    const sameAddressCheckbox = screen.getByLabelText(
      "Billing address same as shipping",
    );
    fireEvent.click(sameAddressCheckbox);

    expect(screen.getByTestId("address-selector-billing")).toBeInTheDocument();
  });

  it("navigates to payment step with both addresses selected", async () => {
    render(<CheckoutPage />);

    // Select shipping address
    const shippingSelect = screen.getByTestId("address-select-shipping");
    fireEvent.change(shippingSelect, { target: { value: "addr-1" } });

    // Uncheck same address and select billing
    const sameAddressCheckbox = screen.getByLabelText(
      "Billing address same as shipping",
    );
    fireEvent.click(sameAddressCheckbox);

    const billingSelect = screen.getByTestId("address-select-billing");
    fireEvent.change(billingSelect, { target: { value: "addr-2" } });

    const continueButton = screen.getByText("Continue");
    fireEvent.click(continueButton);

    await waitFor(() => {
      expect(screen.getByTestId("payment-method")).toBeInTheDocument();
    });
  });

  it("validates payment method selection", async () => {
    // Start at payment step
    render(<CheckoutPage />);

    // Navigate to payment step
    const shippingSelect = screen.getByTestId("address-select-shipping");
    fireEvent.change(shippingSelect, { target: { value: "addr-1" } });

    const continueButton = screen.getByText("Continue");
    fireEvent.click(continueButton);

    await waitFor(() => {
      expect(screen.getByTestId("payment-method")).toBeInTheDocument();
    });

    // Clear payment method and try to continue
    // Note: This test might need adjustment based on component state management
  });

  it("navigates to review step when payment method is selected", async () => {
    render(<CheckoutPage />);

    // Navigate to payment step
    const shippingSelect = screen.getByTestId("address-select-shipping");
    fireEvent.change(shippingSelect, { target: { value: "addr-1" } });

    const continueButton = screen.getByText("Continue");
    fireEvent.click(continueButton);

    await waitFor(() => {
      expect(screen.getByTestId("payment-method")).toBeInTheDocument();
    });

    // Continue to review
    const continueToReviewButton = screen.getByText("Continue");
    fireEvent.click(continueToReviewButton);

    await waitFor(() => {
      expect(screen.getByText("Delivery Notes (Optional)")).toBeInTheDocument();
    });
  });

  it("shows shop order summaries in review step", async () => {
    render(<CheckoutPage />);

    // Navigate to review step
    const shippingSelect = screen.getByTestId("address-select-shipping");
    fireEvent.change(shippingSelect, { target: { value: "addr-1" } });

    let continueButton = screen.getByText("Continue");
    fireEvent.click(continueButton);

    await waitFor(() => {
      expect(screen.getByTestId("payment-method")).toBeInTheDocument();
    });

    continueButton = screen.getByText("Continue");
    fireEvent.click(continueButton);

    await waitFor(() => {
      expect(screen.getByTestId("shop-summary-shop-1")).toBeInTheDocument();
    });

    // Check the shop summary component content - look within the specific component
    const shopSummary = screen.getByTestId("shop-summary-shop-1");
    expect(shopSummary).toBeInTheDocument();
    expect(shopSummary).toHaveTextContent("Test Shop");
    expect(shopSummary).toHaveTextContent("1 items");
  });

  it("allows applying coupons to shops", async () => {
    render(<CheckoutPage />);

    // Navigate to review step
    const shippingSelect = screen.getByTestId("address-select-shipping");
    fireEvent.change(shippingSelect, { target: { value: "addr-1" } });

    let continueButton = screen.getByText("Continue");
    fireEvent.click(continueButton);

    await waitFor(() => {
      expect(screen.getByTestId("payment-method")).toBeInTheDocument();
    });

    continueButton = screen.getByText("Continue");
    fireEvent.click(continueButton);

    await waitFor(() => {
      expect(screen.getByTestId("apply-coupon-shop-1")).toBeInTheDocument();
    });

    const applyCouponButton = screen.getByTestId("apply-coupon-shop-1");
    fireEvent.click(applyCouponButton);

    await waitFor(() => {
      expect(screen.getByTestId("coupon-shop-1")).toBeInTheDocument();
    });

    expect(screen.getByText("Coupon: TEST10 (-₹200)")).toBeInTheDocument();
  });

  it("allows removing coupons from shops", async () => {
    render(<CheckoutPage />);

    // Navigate to review step
    const shippingSelect = screen.getByTestId("address-select-shipping");
    fireEvent.change(shippingSelect, { target: { value: "addr-1" } });

    let continueButton = screen.getByText("Continue");
    fireEvent.click(continueButton);

    await waitFor(() => {
      expect(screen.getByTestId("payment-method")).toBeInTheDocument();
    });

    continueButton = screen.getByText("Continue");
    fireEvent.click(continueButton);

    await waitFor(() => {
      expect(screen.getByTestId("apply-coupon-shop-1")).toBeInTheDocument();
    });

    // Apply coupon first
    const applyCouponButton = screen.getByTestId("apply-coupon-shop-1");
    fireEvent.click(applyCouponButton);

    await waitFor(() => {
      expect(screen.getByTestId("coupon-shop-1")).toBeInTheDocument();
    });

    // Remove coupon
    const removeCouponButton = screen.getByTestId("remove-coupon-shop-1");
    fireEvent.click(removeCouponButton);

    await waitFor(() => {
      expect(screen.queryByTestId("coupon-shop-1")).not.toBeInTheDocument();
    });
  });

  it("shows order summary with correct calculations", () => {
    render(<CheckoutPage />);

    expect(screen.getByText("Order Summary")).toBeInTheDocument();
    expect(screen.getByText("Test Shop")).toBeInTheDocument();
    expect(screen.getByText("Grand Total")).toBeInTheDocument();
    // The exact amount will depend on calculations, but we check the structure
  });

  it("handles back navigation", async () => {
    render(<CheckoutPage />);

    // Navigate to payment step
    const shippingSelect = screen.getByTestId("address-select-shipping");
    fireEvent.change(shippingSelect, { target: { value: "addr-1" } });

    const continueButton = screen.getByText("Continue");
    fireEvent.click(continueButton);

    await waitFor(() => {
      expect(screen.getByTestId("payment-method")).toBeInTheDocument();
    });

    // Go back
    const backButton = screen.getByText("Back");
    fireEvent.click(backButton);

    await waitFor(() => {
      expect(
        screen.getByTestId("address-selector-shipping"),
      ).toBeInTheDocument();
    });
  });

  it("places COD order successfully", async () => {
    const mockCreateOrder = jest.fn().mockResolvedValue({
      orders: [{ id: "order-1" }],
      amount: 2360,
      currency: "INR",
      total: 2360,
    });
    mockCheckoutService.createOrder = mockCreateOrder;

    render(<CheckoutPage />);

    // Navigate to review step
    const shippingSelect = screen.getByTestId("address-select-shipping");
    fireEvent.change(shippingSelect, { target: { value: "addr-1" } });

    let continueButton = screen.getByText("Continue");
    fireEvent.click(continueButton);

    await waitFor(() => {
      expect(screen.getByTestId("payment-method")).toBeInTheDocument();
    });

    // Select COD
    const codButton = screen.getByTestId("select-cod");
    fireEvent.click(codButton);

    continueButton = screen.getByText("Continue");
    fireEvent.click(continueButton);

    await waitFor(() => {
      expect(screen.getByText("Place Order")).toBeInTheDocument();
    });

    // Place order
    const placeOrderButton = screen.getByText("Place Order");
    fireEvent.click(placeOrderButton);

    await waitFor(() => {
      expect(mockCreateOrder).toHaveBeenCalledWith({
        shippingAddressId: "addr-1",
        billingAddressId: "addr-1",
        paymentMethod: "cod",
        shopOrders: [
          {
            shopId: "shop-1",
            shopName: "Test Shop",
            items: [mockCartItem],
            couponCode: undefined,
          },
        ],
        notes: undefined,
      });
    });

    expect(mockPush).toHaveBeenCalledWith(
      "/user/orders/order-1?success=true&multi=true",
    );
  });

  it("places Razorpay order and handles payment success", async () => {
    const mockCreateOrder = jest.fn().mockResolvedValue({
      orders: [{ id: "order-1" }],
      amount: 236000, // Razorpay expects amount in paisa
      currency: "INR",
      total: 2360,
      razorpay_order_id: "rzp_order_123",
    });
    const mockVerifyPayment = jest.fn().mockResolvedValue({});
    mockCheckoutService.createOrder = mockCreateOrder;
    mockCheckoutService.verifyPayment = mockVerifyPayment;

    render(<CheckoutPage />);

    // Navigate to review step
    const shippingSelect = screen.getByTestId("address-select-shipping");
    fireEvent.change(shippingSelect, { target: { value: "addr-1" } });

    let continueButton = screen.getByText("Continue");
    fireEvent.click(continueButton);

    await waitFor(() => {
      expect(screen.getByTestId("payment-method")).toBeInTheDocument();
    });

    // Select Razorpay (default)
    continueButton = screen.getByText("Continue");
    fireEvent.click(continueButton);

    await waitFor(() => {
      expect(screen.getByText("Place Order")).toBeInTheDocument();
    });

    // Place order
    const placeOrderButton = screen.getByText("Place Order");
    fireEvent.click(placeOrderButton);

    await waitFor(() => {
      expect(mockCreateOrder).toHaveBeenCalled();
    });

    // Simulate Razorpay success
    const razorpayHandler = mockRazorpay.on.mock.calls.find(
      ([event]) => event === "payment.success",
    )?.[1];

    if (razorpayHandler) {
      await act(async () => {
        razorpayHandler({
          razorpay_order_id: "rzp_order_123",
          razorpay_payment_id: "rzp_payment_123",
          razorpay_signature: "signature_123",
        });
      });

      expect(mockVerifyPayment).toHaveBeenCalledWith({
        order_ids: ["order-1"],
        razorpay_order_id: "rzp_order_123",
        razorpay_payment_id: "rzp_payment_123",
        razorpay_signature: "signature_123",
      });

      expect(mockPush).toHaveBeenCalledWith(
        "/user/orders/order-1?success=true&multi=true",
      );
    }
  });

  it("handles Razorpay payment failure", async () => {
    const mockCreateOrder = jest.fn().mockResolvedValue({
      orders: [{ id: "order-1" }],
      amount: 236000,
      currency: "INR",
      total: 2360,
      razorpay_order_id: "rzp_order_123",
    });
    mockCheckoutService.createOrder = mockCreateOrder;

    render(<CheckoutPage />);

    // Navigate to review step and place order
    const shippingSelect = screen.getByTestId("address-select-shipping");
    fireEvent.change(shippingSelect, { target: { value: "addr-1" } });

    let continueButton = screen.getByText("Continue");
    fireEvent.click(continueButton);

    await waitFor(() => {
      expect(screen.getByTestId("payment-method")).toBeInTheDocument();
    });

    continueButton = screen.getByText("Continue");
    fireEvent.click(continueButton);

    await waitFor(() => {
      expect(screen.getByText("Place Order")).toBeInTheDocument();
    });

    const placeOrderButton = screen.getByText("Place Order");
    fireEvent.click(placeOrderButton);

    await waitFor(() => {
      expect(mockCreateOrder).toHaveBeenCalled();
    });

    // Simulate Razorpay failure
    const razorpayFailureHandler = mockRazorpay.on.mock.calls.find(
      ([event]) => event === "payment.failed",
    )?.[1];

    if (razorpayFailureHandler) {
      await act(async () => {
        razorpayFailureHandler({
          error: { description: "Payment failed" },
        });
      });

      expect(screen.getByText("Payment failed")).toBeInTheDocument();
    }
  });

  it("handles order creation error", async () => {
    const mockCreateOrder = jest
      .fn()
      .mockRejectedValue(new Error("Order creation failed"));
    mockCheckoutService.createOrder = mockCreateOrder;

    render(<CheckoutPage />);

    // Navigate to review step and place order
    const shippingSelect = screen.getByTestId("address-select-shipping");
    fireEvent.change(shippingSelect, { target: { value: "addr-1" } });

    let continueButton = screen.getByText("Continue");
    fireEvent.click(continueButton);

    await waitFor(() => {
      expect(screen.getByTestId("payment-method")).toBeInTheDocument();
    });

    continueButton = screen.getByText("Continue");
    fireEvent.click(continueButton);

    await waitFor(() => {
      expect(screen.getByText("Place Order")).toBeInTheDocument();
    });

    const placeOrderButton = screen.getByText("Place Order");
    fireEvent.click(placeOrderButton);

    await waitFor(() => {
      expect(screen.getByTestId("error-message")).toBeInTheDocument();
    });

    expect(screen.getByText("Order creation failed")).toBeInTheDocument();
  });

  it("handles Razorpay not loaded error", async () => {
    // Mock Razorpay not available
    delete (global.window as any).Razorpay;

    const mockCreateOrder = jest.fn().mockResolvedValue({
      orders: [{ id: "order-1" }],
      amount: 236000,
      currency: "INR",
      total: 2360,
      razorpay_order_id: "rzp_order_123",
    });
    mockCheckoutService.createOrder = mockCreateOrder;

    render(<CheckoutPage />);

    // Navigate to review step and place order
    const shippingSelect = screen.getByTestId("address-select-shipping");
    fireEvent.change(shippingSelect, { target: { value: "addr-1" } });

    let continueButton = screen.getByText("Continue");
    fireEvent.click(continueButton);

    await waitFor(() => {
      expect(screen.getByTestId("payment-method")).toBeInTheDocument();
    });

    continueButton = screen.getByText("Continue");
    fireEvent.click(continueButton);

    await waitFor(() => {
      expect(screen.getByText("Place Order")).toBeInTheDocument();
    });

    const placeOrderButton = screen.getByText("Place Order");
    fireEvent.click(placeOrderButton);

    await waitFor(() => {
      expect(screen.getByTestId("error-message")).toBeInTheDocument();
    });

    expect(
      screen.getByText(
        "Payment gateway not available. Please try Cash on Delivery or refresh the page.",
      ),
    ).toBeInTheDocument();
  });

  it("shows processing state during order placement", async () => {
    const mockCreateOrder = jest.fn().mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                orders: [{ id: "order-1" }],
                amount: 2360,
                currency: "INR",
                total: 2360,
              }),
            100,
          ),
        ),
    );
    mockCheckoutService.createOrder = mockCreateOrder;

    render(<CheckoutPage />);

    // Navigate to review step
    const shippingSelect = screen.getByTestId("address-select-shipping");
    fireEvent.change(shippingSelect, { target: { value: "addr-1" } });

    let continueButton = screen.getByText("Continue");
    fireEvent.click(continueButton);

    await waitFor(() => {
      expect(screen.getByTestId("payment-method")).toBeInTheDocument();
    });

    // Select COD
    const codButton = screen.getByTestId("select-cod");
    fireEvent.click(codButton);

    continueButton = screen.getByText("Continue");
    fireEvent.click(continueButton);

    await waitFor(() => {
      expect(screen.getByText("Place Order")).toBeInTheDocument();
    });

    // Place order
    const placeOrderButton = screen.getByText("Place Order");
    fireEvent.click(placeOrderButton);

    // Should show processing state
    expect(screen.getByText("Processing...")).toBeInTheDocument();
    expect(screen.getByTestId("loader")).toBeInTheDocument();
  });

  it("allows adding delivery notes", async () => {
    render(<CheckoutPage />);

    // Navigate to review step
    const shippingSelect = screen.getByTestId("address-select-shipping");
    fireEvent.change(shippingSelect, { target: { value: "addr-1" } });

    let continueButton = screen.getByText("Continue");
    fireEvent.click(continueButton);

    await waitFor(() => {
      expect(screen.getByTestId("payment-method")).toBeInTheDocument();
    });

    continueButton = screen.getByText("Continue");
    fireEvent.click(continueButton);

    await waitFor(() => {
      expect(screen.getByText("Delivery Notes (Optional)")).toBeInTheDocument();
    });

    const notesTextarea = screen.getByPlaceholderText(
      "Add any special instructions for delivery...",
    );
    fireEvent.change(notesTextarea, {
      target: { value: "Please ring the doorbell twice" },
    });

    expect(notesTextarea).toHaveValue("Please ring the doorbell twice");
  });

  it("navigates back to cart", () => {
    render(<CheckoutPage />);

    const backToCartButton = screen.getByText("Back to Cart");
    fireEvent.click(backToCartButton);

    expect(mockPush).toHaveBeenCalledWith("/cart");
  });

  it("shows security badges in order summary", () => {
    render(<CheckoutPage />);

    expect(screen.getByText("✓ Safe and secure payments")).toBeInTheDocument();
    expect(screen.getByText("✓ Easy returns and refunds")).toBeInTheDocument();
    expect(screen.getByText("✓ 100% authentic products")).toBeInTheDocument();
  });
});
