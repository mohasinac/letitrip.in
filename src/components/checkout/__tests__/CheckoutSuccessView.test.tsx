import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { CheckoutSuccessView } from "../CheckoutSuccessView";

let mockSearchParamsGet: jest.Mock;
const mockUseApiQuery: jest.Mock = jest.fn(() => ({
  data: null,
  isLoading: false,
  error: null,
  refetch: jest.fn(),
}));
const mockRouterReplace = jest.fn();

const MOCK_ORDER = {
  id: "order-abc",
  orderNumber: "ORD-001",
  status: "confirmed",
  totalAmount: 500,
  items: [],
  createdAt: new Date().toISOString(),
};

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), replace: mockRouterReplace }),
  useSearchParams: () => ({ get: (k: string) => mockSearchParamsGet(k) }),
  usePathname: () => "/checkout/success",
}));

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const map: Record<string, string> = {
      fallbackTitle: "Order Placed!",
      fallbackConfirmed: "Order confirmed",
      fallbackSubtitle: "Check your email for details.",
      viewOrders: "View Orders",
      continueShopping: "Continue Shopping",
    };
    return map[key] ?? key;
  },
}));

jest.mock("@/hooks", () => ({
  useApiQuery: (...args: any[]) => (mockUseApiQuery as any)(...args),
}));

jest.mock("@/constants", () => ({
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
    borderRadius: { xl: "rounded-xl" },
  },
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
    <div data-testid="order-success-actions" data-orderid={orderId}>
      Actions
    </div>
  ),
}));

jest.mock("@/services", () => ({
  orderService: { getById: jest.fn(() => Promise.resolve({ data: null })) },
}));

describe("CheckoutSuccessView", () => {
  beforeEach(() => {
    mockSearchParamsGet = jest.fn();
    jest.clearAllMocks();
  });

  it("returns null and redirects when orderId is missing", () => {
    mockSearchParamsGet.mockReturnValue(null);
    const { container } = render(<CheckoutSuccessView />);
    expect(container.firstChild).toBeNull();
    expect(mockRouterReplace).toHaveBeenCalledWith("/products");
  });

  it("renders spinner while loading", () => {
    mockSearchParamsGet.mockImplementation((k: string) =>
      k === "orderId" ? "order-abc" : null,
    );
    mockUseApiQuery.mockReturnValueOnce({
      data: null,
      isLoading: true,
      error: null,
      refetch: jest.fn(),
    });
    render(<CheckoutSuccessView />);
    expect(screen.getByTestId("spinner")).toBeInTheDocument();
  });

  it("renders fallback UI when order fetch fails", () => {
    mockSearchParamsGet.mockImplementation((k: string) =>
      k === "orderId" ? "order-abc" : null,
    );
    mockUseApiQuery.mockReturnValueOnce({
      data: null,
      isLoading: false,
      error: new Error("Network error"),
      refetch: jest.fn(),
    });
    render(<CheckoutSuccessView />);
    expect(screen.getByText("Order Placed!")).toBeInTheDocument();
    expect(screen.getByText("View Orders")).toBeInTheDocument();
    expect(screen.getByText("Continue Shopping")).toBeInTheDocument();
  });

  it("displays orderId in fallback UI", () => {
    mockSearchParamsGet.mockImplementation((k: string) =>
      k === "orderId" ? "order-XYZ" : null,
    );
    mockUseApiQuery.mockReturnValueOnce({
      data: null,
      isLoading: false,
      error: new Error("fail"),
      refetch: jest.fn(),
    });
    render(<CheckoutSuccessView />);
    expect(screen.getByText("order-XYZ")).toBeInTheDocument();
  });

  it("renders success components when order loads", () => {
    mockSearchParamsGet.mockImplementation((k: string) =>
      k === "orderId" ? "order-abc" : null,
    );
    mockUseApiQuery.mockReturnValueOnce({
      data: { data: MOCK_ORDER },
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });
    render(<CheckoutSuccessView />);
    expect(screen.getByTestId("order-success-hero")).toBeInTheDocument();
    expect(screen.getByTestId("order-success-card")).toBeInTheDocument();
    expect(screen.getByTestId("order-success-actions")).toHaveAttribute(
      "data-orderid",
      "order-abc",
    );
  });

  it("does not redirect when orderId is present", () => {
    mockSearchParamsGet.mockImplementation((k: string) =>
      k === "orderId" ? "order-abc" : null,
    );
    mockUseApiQuery.mockReturnValueOnce({
      data: { data: MOCK_ORDER },
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });
    render(<CheckoutSuccessView />);
    expect(mockRouterReplace).not.toHaveBeenCalled();
  });
});
