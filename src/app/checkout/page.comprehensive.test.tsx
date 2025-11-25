import React from "react";
import {
  render,
  screen,
  waitFor,
  fireEvent,
  act,
  within,
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

describe("CheckoutPage - Comprehensive Tests", () => {
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

  describe("Basic Rendering", () => {
    it("should render checkout page with header", () => {
      render(<CheckoutPage />);

      expect(screen.getByText("Checkout")).toBeInTheDocument();
      expect(screen.getByText("Back to Cart")).toBeInTheDocument();
      expect(screen.getByTestId("chevron-left")).toBeInTheDocument();
    });

    it("should render progress steps with icons", () => {
      render(<CheckoutPage />);

      expect(screen.getByTestId("map-pin")).toBeInTheDocument();
      expect(screen.getByTestId("credit-card")).toBeInTheDocument();
      expect(screen.getByTestId("file-text")).toBeInTheDocument();
    });

    it("should render order summary sidebar", () => {
      render(<CheckoutPage />);

      expect(screen.getByText("Order Summary")).toBeInTheDocument();
      expect(screen.getByText("Grand Total")).toBeInTheDocument();
    });

    it("should render security badges", () => {
      render(<CheckoutPage />);

      expect(
        screen.getByText("✓ Safe and secure payments")
      ).toBeInTheDocument();
      expect(
        screen.getByText("✓ Easy returns and refunds")
      ).toBeInTheDocument();
      expect(screen.getByText("✓ 100% authentic products")).toBeInTheDocument();
    });

    it("should start with address step", () => {
      render(<CheckoutPage />);

      expect(
        screen.getByTestId("address-selector-shipping")
      ).toBeInTheDocument();
      expect(
        screen.getByText("Billing address same as shipping")
      ).toBeInTheDocument();
    });
  });

  describe("Authentication & Authorization", () => {
    it("should redirect to login when not authenticated", () => {
      mockUseAuth.mockReturnValue({
        user: null,
        loading: false,
      });

      render(<CheckoutPage />);

      expect(mockPush).toHaveBeenCalledWith("/login?redirect=/checkout");
    });

    it("should show loading state when user is loading", () => {
      mockUseAuth.mockReturnValue({
        user: null,
        loading: true,
      });

      render(<CheckoutPage />);

      expect(screen.getByTestId("loader")).toBeInTheDocument();
    });

    it("should not render content until user is loaded", () => {
      mockUseAuth.mockReturnValue({
        user: null,
        loading: true,
      });

      render(<CheckoutPage />);

      expect(screen.queryByText("Checkout")).not.toBeInTheDocument();
    });
  });

  describe("Cart Validation", () => {
    it("should redirect to cart when cart is empty", () => {
      mockUseCart.mockReturnValue({
        cart: mockEmptyCart,
        loading: false,
      });

      render(<CheckoutPage />);

      expect(mockPush).toHaveBeenCalledWith("/cart");
    });

    it("should show loading state when cart is loading", () => {
      mockUseCart.mockReturnValue({
        cart: null,
        loading: true,
      });

      render(<CheckoutPage />);

      expect(screen.getByTestId("loader")).toBeInTheDocument();
    });

    it("should not render content when cart is null", () => {
      mockUseCart.mockReturnValue({
        cart: null,
        loading: false,
      });

      render(<CheckoutPage />);

      expect(mockPush).toHaveBeenCalledWith("/cart");
    });

    it("should handle cart with multiple items from same shop", () => {
      const multiItemCart = {
        ...mockCart,
        items: [
          mockCartItem,
          { ...mockCartItem, id: "cart-item-2", productId: "product-2" },
        ],
        itemCount: 2,
      };

      mockUseCart.mockReturnValue({
        cart: multiItemCart,
        loading: false,
      });

      render(<CheckoutPage />);

      expect(screen.getByText("2 items")).toBeInTheDocument();
    });

    it("should handle cart with items from multiple shops", () => {
      const multiShopCart = {
        ...mockCart,
        items: [
          mockCartItem,
          {
            ...mockCartItem,
            id: "cart-item-2",
            shopId: "shop-2",
            shopName: "Shop 2",
          },
        ],
        itemCount: 2,
      };

      mockUseCart.mockReturnValue({
        cart: multiShopCart,
        loading: false,
      });

      render(<CheckoutPage />);

      expect(screen.getByText("Test Shop")).toBeInTheDocument();
      expect(screen.getByText("Shop 2")).toBeInTheDocument();
    });
  });

  describe("Progress Steps", () => {
    it("should highlight current step", () => {
      render(<CheckoutPage />);

      const steps = screen.getAllByRole("button");
      // First step (address) should be current, others not
      expect(screen.getByTestId("map-pin").parentElement).toHaveClass(
        "bg-primary"
      );
    });

    it("should show check icon for completed steps", async () => {
      render(<CheckoutPage />);

      // Select address and move to payment
      const shippingSelect = screen.getByTestId("address-select-shipping");
      fireEvent.change(shippingSelect, { target: { value: "addr-1" } });

      const continueButton = screen.getByText("Continue");
      fireEvent.click(continueButton);

      await waitFor(() => {
        expect(screen.getByTestId("payment-method")).toBeInTheDocument();
      });

      // Address step should now show check icon
      expect(screen.getByTestId("check")).toBeInTheDocument();
    });

    it("should show progress line between steps", () => {
      const { container } = render(<CheckoutPage />);

      // Check for progress line elements
      const progressLines = container.querySelectorAll(".h-1");
      expect(progressLines.length).toBeGreaterThan(0);
    });
  });

  describe("Address Step - Validation", () => {
    it("should validate shipping address selection", async () => {
      render(<CheckoutPage />);

      const continueButton = screen.getByText("Continue");
      fireEvent.click(continueButton);

      await waitFor(() => {
        expect(
          screen.getByText("Please complete all required fields to continue.")
        ).toBeInTheDocument();
      });

      expect(
        screen.getByText("Please select a shipping address")
      ).toBeInTheDocument();
    });

    it("should validate billing address when not using same address", async () => {
      render(<CheckoutPage />);

      // Select shipping address
      const shippingSelect = screen.getByTestId("address-select-shipping");
      fireEvent.change(shippingSelect, { target: { value: "addr-1" } });

      // Uncheck same address
      const sameAddressCheckbox = screen.getByLabelText(
        "Billing address same as shipping"
      );
      fireEvent.click(sameAddressCheckbox);

      const continueButton = screen.getByText("Continue");
      fireEvent.click(continueButton);

      await waitFor(() => {
        expect(
          screen.getByText("Please select a billing address")
        ).toBeInTheDocument();
      });
    });

    it("should clear validation errors when error retry is clicked", async () => {
      render(<CheckoutPage />);

      const continueButton = screen.getByText("Continue");
      fireEvent.click(continueButton);

      await waitFor(() => {
        expect(screen.getByTestId("error-message")).toBeInTheDocument();
      });

      const retryButton = screen.getByTestId("error-retry");
      fireEvent.click(retryButton);

      await waitFor(() => {
        expect(screen.queryByTestId("error-message")).not.toBeInTheDocument();
      });
    });

    it("should show validation error summary", async () => {
      render(<CheckoutPage />);

      // Uncheck same address
      const sameAddressCheckbox = screen.getByLabelText(
        "Billing address same as shipping"
      );
      fireEvent.click(sameAddressCheckbox);

      const continueButton = screen.getByText("Continue");
      fireEvent.click(continueButton);

      await waitFor(() => {
        expect(
          screen.getByText("Please fix the following errors:")
        ).toBeInTheDocument();
      });
    });
  });

  describe("Address Step - Navigation", () => {
    it("should navigate to payment step when shipping address is selected", async () => {
      render(<CheckoutPage />);

      const shippingSelect = screen.getByTestId("address-select-shipping");
      fireEvent.change(shippingSelect, { target: { value: "addr-1" } });

      const continueButton = screen.getByText("Continue");
      fireEvent.click(continueButton);

      await waitFor(() => {
        expect(screen.getByTestId("payment-method")).toBeInTheDocument();
      });
    });

    it("should navigate to payment with both addresses when different", async () => {
      render(<CheckoutPage />);

      // Select shipping address
      const shippingSelect = screen.getByTestId("address-select-shipping");
      fireEvent.change(shippingSelect, { target: { value: "addr-1" } });

      // Uncheck same address and select billing
      const sameAddressCheckbox = screen.getByLabelText(
        "Billing address same as shipping"
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

    it("should show/hide billing address selector based on checkbox", () => {
      render(<CheckoutPage />);

      // Initially billing selector should not be visible
      expect(
        screen.queryByTestId("address-selector-billing")
      ).not.toBeInTheDocument();

      // Uncheck same address
      const sameAddressCheckbox = screen.getByLabelText(
        "Billing address same as shipping"
      );
      fireEvent.click(sameAddressCheckbox);

      // Billing selector should now be visible
      expect(
        screen.getByTestId("address-selector-billing")
      ).toBeInTheDocument();

      // Check same address again
      fireEvent.click(sameAddressCheckbox);

      // Billing selector should be hidden again
      expect(
        screen.queryByTestId("address-selector-billing")
      ).not.toBeInTheDocument();
    });
  });

  describe("Payment Step", () => {
    beforeEach(async () => {
      render(<CheckoutPage />);

      // Navigate to payment step
      const shippingSelect = screen.getByTestId("address-select-shipping");
      fireEvent.change(shippingSelect, { target: { value: "addr-1" } });

      const continueButton = screen.getByText("Continue");
      fireEvent.click(continueButton);

      await waitFor(() => {
        expect(screen.getByTestId("payment-method")).toBeInTheDocument();
      });
    });

    it("should render payment method selector", () => {
      expect(screen.getByTestId("payment-method")).toBeInTheDocument();
      expect(screen.getByTestId("select-razorpay")).toBeInTheDocument();
      expect(screen.getByTestId("select-cod")).toBeInTheDocument();
    });

    it("should select Razorpay by default", () => {
      expect(screen.getByTestId("select-razorpay")).toHaveClass("selected");
    });

    it("should allow switching payment method", () => {
      const codButton = screen.getByTestId("select-cod");
      fireEvent.click(codButton);

      expect(codButton).toHaveClass("selected");
    });

    it("should navigate back to address step", async () => {
      const backButton = screen.getByText("Back");
      fireEvent.click(backButton);

      await waitFor(() => {
        expect(
          screen.getByTestId("address-selector-shipping")
        ).toBeInTheDocument();
      });
    });

    it("should navigate to review step", async () => {
      const continueButton = screen.getByText("Continue");
      fireEvent.click(continueButton);

      await waitFor(() => {
        expect(
          screen.getByText("Delivery Notes (Optional)")
        ).toBeInTheDocument();
      });
    });
  });

  describe("Address Step - Back Button", () => {
    it("should not show back button on address step", () => {
      render(<CheckoutPage />);

      expect(screen.queryByText("Back")).not.toBeInTheDocument();
    });
  });

  describe("Review Step - Shop Order Summaries", () => {
    beforeEach(async () => {
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
        expect(
          screen.getByText("Delivery Notes (Optional)")
        ).toBeInTheDocument();
      });
    });

    it("should render shop order summaries", () => {
      expect(screen.getByTestId("shop-summary-shop-1")).toBeInTheDocument();
    });

    it("should show shop details in summary", () => {
      const shopSummary = screen.getByTestId("shop-summary-shop-1");
      expect(shopSummary).toHaveTextContent("Test Shop");
      expect(shopSummary).toHaveTextContent("1 items");
    });

    it("should render delivery notes textarea", () => {
      expect(
        screen.getByPlaceholderText(
          "Add any special instructions for delivery..."
        )
      ).toBeInTheDocument();
    });

    it("should allow adding delivery notes", () => {
      const notesTextarea = screen.getByPlaceholderText(
        "Add any special instructions for delivery..."
      );

      fireEvent.change(notesTextarea, {
        target: { value: "Please ring the doorbell twice" },
      });

      expect(notesTextarea).toHaveValue("Please ring the doorbell twice");
    });

    it("should render Place Order button", () => {
      expect(screen.getByText("Place Order")).toBeInTheDocument();
    });

    it("should navigate back to payment step", async () => {
      const backButton = screen.getByText("Back");
      fireEvent.click(backButton);

      await waitFor(() => {
        expect(screen.getByTestId("payment-method")).toBeInTheDocument();
      });
    });
  });

  describe("Review Step - Coupon Management", () => {
    beforeEach(async () => {
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
    });

    it("should show apply coupon button", () => {
      expect(screen.getByTestId("apply-coupon-shop-1")).toBeInTheDocument();
    });

    it("should apply coupon to shop", async () => {
      const applyCouponButton = screen.getByTestId("apply-coupon-shop-1");
      fireEvent.click(applyCouponButton);

      await waitFor(() => {
        expect(screen.getByTestId("coupon-shop-1")).toBeInTheDocument();
      });

      expect(screen.getByText(/Coupon: TEST10/)).toBeInTheDocument();
    });

    it("should show coupon discount amount", async () => {
      const applyCouponButton = screen.getByTestId("apply-coupon-shop-1");
      fireEvent.click(applyCouponButton);

      await waitFor(() => {
        // Check that the coupon element exists with discount text
        const couponElement = screen.getByTestId("coupon-shop-1");
        expect(couponElement).toHaveTextContent("TEST10");
        expect(couponElement).toHaveTextContent("-₹200");
      });
    });

    it("should allow removing applied coupon", async () => {
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

    it("should update order total after applying coupon", async () => {
      const applyCouponButton = screen.getByTestId("apply-coupon-shop-1");
      fireEvent.click(applyCouponButton);

      await waitFor(() => {
        expect(screen.getByText(/Discount/)).toBeInTheDocument();
      });
    });
  });

  describe("Order Summary Calculations", () => {
    it("should display subtotal for shop", () => {
      render(<CheckoutPage />);

      expect(screen.getByText("₹2,000")).toBeInTheDocument();
    });

    it("should calculate shipping correctly (free over ₹5000)", () => {
      render(<CheckoutPage />);

      // Use more specific query to find shipping cost
      const orderSummary = screen.getByText("Order Summary").closest("div");
      expect(within(orderSummary!).getByText(/Shipping/)).toBeInTheDocument();
      expect(within(orderSummary!).getByText("₹100")).toBeInTheDocument();
    });

    it("should show free shipping for orders over ₹5000", () => {
      const highValueCart = {
        ...mockCart,
        items: [{ ...mockCartItem, price: 6000, total: 6000 }],
        subtotal: 6000,
      };

      mockUseCart.mockReturnValue({
        cart: highValueCart,
        loading: false,
      });

      render(<CheckoutPage />);

      expect(screen.getByText("FREE")).toBeInTheDocument();
    });

    it("should calculate tax at 18%", () => {
      render(<CheckoutPage />);

      expect(screen.getByText("₹360")).toBeInTheDocument(); // 18% of 2000
    });

    it("should display grand total", () => {
      render(<CheckoutPage />);

      const grandTotalLabel = screen.getByText("Grand Total");
      expect(grandTotalLabel).toBeInTheDocument();

      // Find the grand total value in the same section
      const grandTotalSection = grandTotalLabel.closest("div");
      expect(
        within(grandTotalSection!).getByText("₹2,460")
      ).toBeInTheDocument(); // 2000 + 100 + 360
    });

    it("should calculate shop total correctly", () => {
      render(<CheckoutPage />);

      expect(screen.getByText("Shop Total")).toBeInTheDocument();
    });

    it("should handle multiple shops in total calculation", () => {
      const multiShopCart = {
        ...mockCart,
        items: [
          mockCartItem,
          {
            ...mockCartItem,
            id: "cart-item-2",
            shopId: "shop-2",
            shopName: "Shop 2",
            price: 500,
            total: 500,
          },
        ],
        itemCount: 2,
      };

      mockUseCart.mockReturnValue({
        cart: multiShopCart,
        loading: false,
      });

      render(<CheckoutPage />);

      // Both shops should be displayed
      expect(screen.getByText("Test Shop")).toBeInTheDocument();
      expect(screen.getByText("Shop 2")).toBeInTheDocument();
    });
  });

  describe("COD Order Placement", () => {
    beforeEach(async () => {
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
    });

    it("should place COD order successfully", async () => {
      const placeOrderButton = screen.getByText("Place Order");
      fireEvent.click(placeOrderButton);

      await waitFor(() => {
        expect(mockCheckoutService.createOrder).toHaveBeenCalledWith({
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
    });

    it("should redirect to order page after COD order", async () => {
      const placeOrderButton = screen.getByText("Place Order");
      fireEvent.click(placeOrderButton);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith(
          "/user/orders/order-1?success=true&multi=true"
        );
      });
    });

    it("should include delivery notes in order", async () => {
      const notesTextarea = screen.getByPlaceholderText(
        "Add any special instructions for delivery..."
      );
      fireEvent.change(notesTextarea, {
        target: { value: "Ring doorbell" },
      });

      const placeOrderButton = screen.getByText("Place Order");
      fireEvent.click(placeOrderButton);

      await waitFor(() => {
        expect(mockCheckoutService.createOrder).toHaveBeenCalledWith(
          expect.objectContaining({
            notes: "Ring doorbell",
          })
        );
      });
    });

    it("should show processing state during order", async () => {
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
              100
            )
          )
      );
      mockCheckoutService.createOrder = mockCreateOrder;

      const placeOrderButton = screen.getByText("Place Order");
      fireEvent.click(placeOrderButton);

      expect(screen.getByText("Processing...")).toBeInTheDocument();
      expect(screen.getByTestId("loader")).toBeInTheDocument();
    });

    it("should disable Place Order button while processing", async () => {
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
              100
            )
          )
      );
      mockCheckoutService.createOrder = mockCreateOrder;

      const placeOrderButton = screen.getByText("Place Order");
      fireEvent.click(placeOrderButton);

      expect(placeOrderButton).toBeDisabled();
    });
  });

  describe("Razorpay Payment", () => {
    beforeEach(async () => {
      const mockCreateOrder = jest.fn().mockResolvedValue({
        orders: [{ id: "order-1" }],
        amount: 246000, // Razorpay expects amount in paisa
        currency: "INR",
        total: 2460,
        razorpay_order_id: "rzp_order_123",
      });
      mockCheckoutService.createOrder = mockCreateOrder;

      render(<CheckoutPage />);

      // Navigate to review step with Razorpay selected
      const shippingSelect = screen.getByTestId("address-select-shipping");
      fireEvent.change(shippingSelect, { target: { value: "addr-1" } });

      let continueButton = screen.getByText("Continue");
      fireEvent.click(continueButton);

      await waitFor(() => {
        expect(screen.getByTestId("payment-method")).toBeInTheDocument();
      });

      // Razorpay is selected by default
      continueButton = screen.getByText("Continue");
      fireEvent.click(continueButton);

      await waitFor(() => {
        expect(screen.getByText("Place Order")).toBeInTheDocument();
      });
    });

    it("should initialize Razorpay on order placement", async () => {
      const placeOrderButton = screen.getByText("Place Order");
      fireEvent.click(placeOrderButton);

      await waitFor(() => {
        expect(global.window.Razorpay).toHaveBeenCalled();
      });
    });

    it("should open Razorpay payment modal", async () => {
      const placeOrderButton = screen.getByText("Place Order");
      fireEvent.click(placeOrderButton);

      await waitFor(() => {
        expect(mockRazorpay.open).toHaveBeenCalled();
      });
    });

    it("should handle Razorpay payment success", async () => {
      const mockVerifyPayment = jest.fn().mockResolvedValue({});
      mockCheckoutService.verifyPayment = mockVerifyPayment;

      const placeOrderButton = screen.getByText("Place Order");
      fireEvent.click(placeOrderButton);

      await waitFor(() => {
        expect(mockCheckoutService.createOrder).toHaveBeenCalled();
      });

      // Simulate Razorpay success callback
      const razorpayHandler = mockRazorpay.on.mock.calls.find(
        ([event]) => event === "payment.success"
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
          "/user/orders/order-1?success=true&multi=true"
        );
      }
    });

    it("should handle Razorpay payment failure", async () => {
      const placeOrderButton = screen.getByText("Place Order");
      fireEvent.click(placeOrderButton);

      await waitFor(() => {
        expect(mockCheckoutService.createOrder).toHaveBeenCalled();
      });

      // Simulate Razorpay failure
      const razorpayFailureHandler = mockRazorpay.on.mock.calls.find(
        ([event]) => event === "payment.failed"
      )?.[1];

      if (razorpayFailureHandler) {
        await act(async () => {
          razorpayFailureHandler({
            error: { description: "Payment failed due to insufficient funds" },
          });
        });

        expect(
          screen.getByText("Payment failed due to insufficient funds")
        ).toBeInTheDocument();
      }
    });

    it("should handle Razorpay not loaded", async () => {
      // Remove Razorpay from window
      delete (global.window as any).Razorpay;

      const placeOrderButton = screen.getByText("Place Order");
      fireEvent.click(placeOrderButton);

      await waitFor(() => {
        expect(
          screen.getByText(
            /Payment gateway not available. Please try Cash on Delivery/
          )
        ).toBeInTheDocument();
      });
    });

    it("should include user details in Razorpay prefill", async () => {
      const placeOrderButton = screen.getByText("Place Order");
      fireEvent.click(placeOrderButton);

      await waitFor(() => {
        expect(global.window.Razorpay).toHaveBeenCalledWith(
          expect.objectContaining({
            prefill: {
              name: "Test User",
              email: "test@example.com",
            },
          })
        );
      });
    });
  });

  describe("Error Handling", () => {
    it("should handle order creation error", async () => {
      const mockCreateOrder = jest
        .fn()
        .mockRejectedValue(new Error("Order creation failed"));
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

      const placeOrderButton = screen.getByText("Place Order");
      fireEvent.click(placeOrderButton);

      await waitFor(() => {
        expect(screen.getByTestId("error-message")).toBeInTheDocument();
      });

      expect(screen.getByText("Order creation failed")).toBeInTheDocument();
    });

    it("should handle payment verification error", async () => {
      const mockCreateOrder = jest.fn().mockResolvedValue({
        orders: [{ id: "order-1" }],
        amount: 246000,
        currency: "INR",
        total: 2460,
        razorpay_order_id: "rzp_order_123",
      });
      const mockVerifyPayment = jest
        .fn()
        .mockRejectedValue(new Error("Payment verification failed"));
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

      continueButton = screen.getByText("Continue");
      fireEvent.click(continueButton);

      await waitFor(() => {
        expect(screen.getByText("Place Order")).toBeInTheDocument();
      });

      const placeOrderButton = screen.getByText("Place Order");
      fireEvent.click(placeOrderButton);

      await waitFor(() => {
        expect(mockCheckoutService.createOrder).toHaveBeenCalled();
      });

      // Simulate Razorpay success but verification failure
      const razorpayHandler = mockRazorpay.on.mock.calls.find(
        ([event]) => event === "payment.success"
      )?.[1];

      if (razorpayHandler) {
        await act(async () => {
          razorpayHandler({
            razorpay_order_id: "rzp_order_123",
            razorpay_payment_id: "rzp_payment_123",
            razorpay_signature: "signature_123",
          });
        });

        await waitFor(() => {
          expect(
            screen.getByText(/Payment verification failed/)
          ).toBeInTheDocument();
        });
      }
    });

    it("should stop processing on error", async () => {
      const mockCreateOrder = jest
        .fn()
        .mockRejectedValue(new Error("Network error"));
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

      const codButton = screen.getByTestId("select-cod");
      fireEvent.click(codButton);

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

      // Button should be enabled again
      expect(placeOrderButton).not.toBeDisabled();
    });

    it("should clear previous errors on retry", async () => {
      render(<CheckoutPage />);

      // Try to continue without selecting address
      const continueButton = screen.getByText("Continue");
      fireEvent.click(continueButton);

      await waitFor(() => {
        expect(screen.getByTestId("error-message")).toBeInTheDocument();
      });

      // Now select address
      const shippingSelect = screen.getByTestId("address-select-shipping");
      fireEvent.change(shippingSelect, { target: { value: "addr-1" } });

      // Try again
      fireEvent.click(continueButton);

      await waitFor(() => {
        expect(screen.queryByTestId("error-message")).not.toBeInTheDocument();
      });
    });
  });

  describe("Navigation & Back Button", () => {
    it("should navigate back to cart", () => {
      render(<CheckoutPage />);

      const backToCartButton = screen.getByText("Back to Cart");
      fireEvent.click(backToCartButton);

      expect(mockPush).toHaveBeenCalledWith("/cart");
    });

    it("should disable back button while processing", async () => {
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
              100
            )
          )
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

      const codButton = screen.getByTestId("select-cod");
      fireEvent.click(codButton);

      continueButton = screen.getByText("Continue");
      fireEvent.click(continueButton);

      await waitFor(() => {
        expect(screen.getByText("Place Order")).toBeInTheDocument();
      });

      const placeOrderButton = screen.getByText("Place Order");
      fireEvent.click(placeOrderButton);

      const backButton = screen.getByText("Back");
      expect(backButton).toBeDisabled();
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty delivery notes", async () => {
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

      const codButton = screen.getByTestId("select-cod");
      fireEvent.click(codButton);

      continueButton = screen.getByText("Continue");
      fireEvent.click(continueButton);

      await waitFor(() => {
        expect(screen.getByText("Place Order")).toBeInTheDocument();
      });

      // Don't add notes, place order
      const placeOrderButton = screen.getByText("Place Order");
      fireEvent.click(placeOrderButton);

      await waitFor(() => {
        expect(mockCreateOrder).toHaveBeenCalledWith(
          expect.objectContaining({
            notes: undefined,
          })
        );
      });
    });

    it("should handle user without full name", async () => {
      mockUseAuth.mockReturnValue({
        user: { ...mockUser, fullName: undefined },
        loading: false,
      });

      const mockCreateOrder = jest.fn().mockResolvedValue({
        orders: [{ id: "order-1" }],
        amount: 246000,
        currency: "INR",
        total: 2460,
        razorpay_order_id: "rzp_order_123",
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

      continueButton = screen.getByText("Continue");
      fireEvent.click(continueButton);

      await waitFor(() => {
        expect(screen.getByText("Place Order")).toBeInTheDocument();
      });

      const placeOrderButton = screen.getByText("Place Order");
      fireEvent.click(placeOrderButton);

      await waitFor(() => {
        expect(global.window.Razorpay).toHaveBeenCalledWith(
          expect.objectContaining({
            prefill: {
              name: "test@example.com", // Falls back to email
              email: "test@example.com",
            },
          })
        );
      });
    });

    it("should handle single item cart", () => {
      render(<CheckoutPage />);

      expect(screen.getByText("1 items")).toBeInTheDocument();
    });

    it("should handle cart updates during checkout", () => {
      const { rerender } = render(<CheckoutPage />);

      // Update cart
      const updatedCart = {
        ...mockCart,
        items: [
          mockCartItem,
          { ...mockCartItem, id: "cart-item-2", productId: "product-2" },
        ],
        itemCount: 2,
      };

      mockUseCart.mockReturnValue({
        cart: updatedCart,
        loading: false,
      });

      rerender(<CheckoutPage />);

      expect(screen.getByText("2 items")).toBeInTheDocument();
    });

    it("should preserve address selection across step changes", async () => {
      render(<CheckoutPage />);

      // Select address
      const shippingSelect = screen.getByTestId("address-select-shipping");
      fireEvent.change(shippingSelect, { target: { value: "addr-1" } });

      // Go to payment
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
          screen.getByTestId("address-selector-shipping")
        ).toBeInTheDocument();
      });

      // Address should still be selected
      expect(screen.getByTestId("address-select-shipping")).toHaveValue(
        "addr-1"
      );
    });
  });
});
