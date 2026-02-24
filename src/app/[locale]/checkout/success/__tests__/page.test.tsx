import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import OrderSuccessPage from "../page";

let mockSearchParamsGet: jest.Mock;
const mockUseApiQuery: jest.Mock = jest.fn(() => ({
  data: null,
  isLoading: false,
  error: null,
  refetch: jest.fn(),
}));

const MOCK_ORDER = {
  id: "order-abc",
  orderNumber: "ORD-001",
  status: "confirmed",
  totalAmount: 500,
  items: [],
  createdAt: new Date().toISOString(),
};

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
  useSearchParams: () => ({ get: (k: string) => mockSearchParamsGet(k) }),
  usePathname: () => "/checkout/success",
}));

jest.mock("@/hooks", () => ({
  useApiQuery: (...args: any[]) => (mockUseApiQuery as any)(...args),
}));

jest.mock("@/constants", () => ({
  UI_LABELS: {
    ORDER_SUCCESS_PAGE: {
      TITLE: "Order Placed Successfully!",
      SUBTITLE: "Thank you for your order",
      CONTINUE_SHOPPING: "Continue Shopping",
      ORDER_NUMBER_LABEL: "Order Number",
      FALLBACK_TITLE: "Order Received",
      FALLBACK_SUBTITLE: "We have received your order.",
    },
    LOADING: { DEFAULT: "Loading..." },
    ACTIONS: { CONFIRM: "Confirmed" },
    USER: { ORDERS: { TITLE: "My Orders" } },
  },
  ROUTES: {
    PUBLIC: { PRODUCTS: "/products" },
    USER: { ORDERS: "/user/orders" },
  },
  THEME_CONSTANTS: {
    themed: {
      bgPrimary: "bg-white",
      bgSecondary: "bg-gray-50",
      textPrimary: "text-gray-900",
      textSecondary: "text-gray-600",
      border: "border-gray-200",
    },
    spacing: { stack: "space-y-4", padding: { lg: "p-6" } },
    typography: { h1: "text-3xl font-bold", h2: "text-2xl font-bold" },
    borderRadius: { xl: "rounded-xl" },
  },
  API_ENDPOINTS: { ORDERS: { GET_BY_ID: (id: string) => `/api/orders/${id}` } },
}));

jest.mock("@/components", () => ({
  Spinner: () => <div data-testid="spinner">Loading...</div>,
  OrderSuccessHero: () => (
    <div data-testid="order-success-hero">🎉 Success!</div>
  ),
  OrderSuccessCard: ({ order }: any) => (
    <div data-testid="order-success-card" data-orderid={order?.id}>
      Order #{order?.orderNumber}
    </div>
  ),
  OrderSuccessActions: ({ orderId }: any) => (
    <div data-testid="order-success-actions">
      <a href={`/user/orders/${orderId}`}>View Order</a>
    </div>
  ),
  Button: ({ children, href }: any) => <a href={href}>{children}</a>,
  LoadingSpinner: () => <div data-testid="loading-spinner" />,
}));

describe("Checkout Success Page", () => {
  beforeEach(() => {
    mockSearchParamsGet = jest.fn();
    jest.clearAllMocks();
  });

  it("returns null when orderId is missing", () => {
    mockSearchParamsGet.mockReturnValue(null);
    const { container } = render(<OrderSuccessPage />);
    // Page returns null when no orderId (triggers router.replace)
    expect(container.firstChild).toBeNull();
  });

  it("renders spinner when order is loading", () => {
    mockSearchParamsGet.mockImplementation((k: string) =>
      k === "orderId" ? "order-abc" : null,
    );
    mockUseApiQuery.mockReturnValueOnce({
      data: null,
      isLoading: true,
      error: null,
      refetch: jest.fn(),
    });
    render(<OrderSuccessPage />);
    expect(screen.getByTestId("spinner")).toBeInTheDocument();
  });

  it("renders success hero and card when order is loaded", () => {
    mockSearchParamsGet.mockImplementation((k: string) =>
      k === "orderId" ? "order-abc" : null,
    );
    mockUseApiQuery.mockReturnValueOnce({
      data: { data: MOCK_ORDER },
      isLoading: false,
      error: null as any,
      refetch: jest.fn(),
    } as any);
    render(<OrderSuccessPage />);
    expect(screen.getByTestId("order-success-hero")).toBeInTheDocument();
    expect(screen.getByTestId("order-success-card")).toBeInTheDocument();
    expect(screen.getByTestId("order-success-actions")).toBeInTheDocument();
  });

  it("renders fallback title when order cannot be fetched", () => {
    mockSearchParamsGet.mockImplementation((k: string) =>
      k === "orderId" ? "order-abc" : null,
    );
    mockUseApiQuery.mockReturnValueOnce({
      data: null,
      isLoading: false,
      error: new Error("Network error") as any,
      refetch: jest.fn(),
    } as any);
    render(<OrderSuccessPage />);
    expect(screen.getByText("Order Received")).toBeInTheDocument();
  });
});
