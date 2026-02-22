import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import CheckoutPage from "../page";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/checkout",
}));

const mockUseApiQuery = jest.fn(() => ({
  data: null,
  isLoading: false,
  error: null,
  refetch: jest.fn(),
}));

const mockUseRazorpay = jest.fn(() => ({
  isLoading: false,
  openRazorpay: jest.fn(),
}));

jest.mock("@/hooks", () => ({
  useApiQuery: (...args: any[]) => mockUseApiQuery(...args),
  useApiMutation: () => ({ mutate: jest.fn(), isLoading: false }),
  useMessage: () => ({ showError: jest.fn(), showSuccess: jest.fn() }),
  useRazorpay: (...args: any[]) => mockUseRazorpay(...args),
}));

jest.mock("@/constants", () => ({
  UI_LABELS: {
    CHECKOUT: {
      TITLE: "Checkout",
      STEP_ADDRESS: "Delivery Address",
      STEP_REVIEW: "Order Review",
      BACK_TO_CART: "Back to Cart",
      PLACE_ORDER: "Place Order",
      PLACING_ORDER: "Placing Order...",
    },
    LOADING: { DEFAULT: "Loading..." },
  },
  ROUTES: {
    USER: { CART: "/cart", CHECKOUT_SUCCESS: "/checkout/success" },
  },
  THEME_CONSTANTS: {
    themed: {
      bgPrimary: "bg-white",
      bgSecondary: "bg-gray-50",
      textPrimary: "text-gray-900",
      textSecondary: "text-gray-600",
    },
    spacing: {
      stack: "space-y-4",
      padding: { lg: "p-6", md: "p-4" },
      gap: { md: "gap-4" },
    },
    typography: { h2: "text-2xl font-bold", h3: "text-xl font-bold" },
    borderRadius: { xl: "rounded-xl" },
  },
  API_ENDPOINTS: {
    CART: { GET: "/api/cart" },
    ADDRESSES: { LIST: "/api/addresses" },
    CHECKOUT: { PLACE_ORDER: "/api/checkout" },
    PAYMENT: {
      CREATE_ORDER: "/api/payment/create-order",
      VERIFY: "/api/payment/verify",
    },
  },
  ERROR_MESSAGES: {
    GENERIC: { INTERNAL_ERROR: "Something went wrong" },
    AUTH: { UNAUTHORIZED: "Unauthorized" },
    CHECKOUT: {
      FAILED: "Order failed",
      ADDRESS_REQUIRED: "Select an address",
      PAYMENT_FAILED: "Payment failed",
    },
  },
}));

jest.mock("@/components", () => ({
  CheckoutStepper: ({ currentStep }: any) => (
    <div data-testid="checkout-stepper" data-step={currentStep}>
      Stepper
    </div>
  ),
  CheckoutAddressStep: ({ onSelect }: any) => (
    <div data-testid="checkout-address-step">
      <button onClick={() => onSelect?.("addr1")}>Select Address</button>
    </div>
  ),
  CheckoutOrderReview: ({ cart }: any) => (
    <div data-testid="checkout-order-review">
      {cart ? "has-cart" : "no-cart"}
    </div>
  ),
  OrderSummaryPanel: ({ total }: any) => (
    <div data-testid="order-summary-panel">Total: {total}</div>
  ),
  Button: ({ children, onClick, disabled }: any) => (
    <button onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
  LoadingSpinner: () => <div data-testid="loading-spinner" />,
}));

// Cart with items for tests that need a fully-rendered page
const CART_WITH_ITEMS = {
  cart: {
    items: [
      {
        id: "i1",
        productId: "p1",
        productTitle: "Widget",
        quantity: 1,
        price: 500,
      },
    ],
  },
  itemCount: 1,
  subtotal: 500,
};

// Addresses list for address step tests
const ADDR_DATA = {
  data: [
    {
      id: "addr1",
      fullName: "John",
      addressLine1: "1 St",
      city: "Delhi",
      isDefault: true,
    },
  ],
};

describe("Checkout Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock window.scrollTo used in handleNext
    global.window.scrollTo = jest.fn() as any;
  });

  it("renders loading skeleton when data is loading", () => {
    mockUseApiQuery.mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
      refetch: jest.fn(),
    });
    const { container } = render(<CheckoutPage />);
    // CheckoutSkeleton renders an inline animate-pulse div, not a named component
    expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
  });

  it("renders checkout stepper when cart has items", () => {
    // Both addr and cart queries get different data
    mockUseApiQuery
      .mockReturnValueOnce({
        data: ADDR_DATA,
        isLoading: false,
        error: null,
        refetch: jest.fn(),
      })
      .mockReturnValueOnce({
        data: CART_WITH_ITEMS,
        isLoading: false,
        error: null,
        refetch: jest.fn(),
      });
    render(<CheckoutPage />);
    expect(screen.getByTestId("checkout-stepper")).toBeInTheDocument();
  });

  it("renders the address step by default", () => {
    mockUseApiQuery
      .mockReturnValueOnce({
        data: ADDR_DATA,
        isLoading: false,
        error: null,
        refetch: jest.fn(),
      })
      .mockReturnValueOnce({
        data: CART_WITH_ITEMS,
        isLoading: false,
        error: null,
        refetch: jest.fn(),
      });
    render(<CheckoutPage />);
    expect(screen.getByTestId("checkout-address-step")).toBeInTheDocument();
  });

  it("renders order summary panel", () => {
    mockUseApiQuery
      .mockReturnValueOnce({
        data: ADDR_DATA,
        isLoading: false,
        error: null,
        refetch: jest.fn(),
      })
      .mockReturnValueOnce({
        data: CART_WITH_ITEMS,
        isLoading: false,
        error: null,
        refetch: jest.fn(),
      });
    render(<CheckoutPage />);
    expect(screen.getByTestId("order-summary-panel")).toBeInTheDocument();
  });
});
