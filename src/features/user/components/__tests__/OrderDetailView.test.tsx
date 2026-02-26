/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { OrderDetailView } from "../OrderDetailView";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
  useParams: jest.fn(() => ({ id: "order_1" })),
}));

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

jest.mock("@/hooks", () => ({
  useAuth: jest.fn(() => ({
    user: { uid: "user_1" },
    loading: false,
  })),
  useApiQuery: jest.fn(() => ({ data: null, isLoading: false, error: null })),
}));

jest.mock("@/services", () => ({
  orderService: { getById: jest.fn() },
}));

jest.mock("@/components", () => ({
  Card: ({ children }: any) => <div data-testid="card">{children}</div>,
  Heading: ({ children }: any) => <h1 data-testid="heading">{children}</h1>,
  Text: ({ children }: any) => <span>{children}</span>,
  Button: ({ children, onClick }: any) => (
    <button onClick={onClick}>{children}</button>
  ),
  StatusBadge: ({ status }: any) => (
    <span data-testid="status-badge" data-status={status}>
      {status}
    </span>
  ),
  Spinner: () => <div data-testid="spinner" />,
  EmptyState: ({ title }: any) => <div data-testid="empty-state">{title}</div>,
}));

jest.mock("@/constants", () => ({
  THEME_CONSTANTS: {
    themed: {
      bgPrimary: "bg-white",
      textPrimary: "text-gray-900",
      textSecondary: "text-gray-600",
      border: "border-gray-200",
    },
    spacing: { stack: "space-y-4", gap: { md: "gap-4" } },
    typography: {
      h2: "text-3xl font-bold",
      h3: "text-xl font-semibold",
      caption: "text-xs text-gray-500",
    },
  },
  ROUTES: { USER: { ORDERS: "/user/orders" } },
}));

jest.mock("@/utils", () => ({
  formatCurrency: (v: number) => `₹${v}`,
  formatDate: (d: any) => String(d),
}));

describe("OrderDetailView", () => {
  beforeEach(() => jest.clearAllMocks());

  it("renders without crashing", () => {
    render(<OrderDetailView />);
  });

  it("shows spinner while loading", () => {
    const { useApiQuery } = require("@/hooks");
    useApiQuery.mockReturnValue({ data: null, isLoading: true, error: null });
    render(<OrderDetailView />);
    expect(screen.getByTestId("spinner")).toBeInTheDocument();
  });

  it("shows empty state when order not found", () => {
    const { useApiQuery } = require("@/hooks");
    useApiQuery.mockReturnValue({
      data: { data: null },
      isLoading: false,
      error: null,
    });
    render(<OrderDetailView />);
    expect(screen.getByTestId("empty-state")).toBeInTheDocument();
  });

  it("renders order details when order found", () => {
    const { useApiQuery } = require("@/hooks");
    useApiQuery.mockReturnValue({
      data: {
        data: {
          id: "order_1",
          orderNumber: "ORD-001",
          status: "delivered",
          paymentStatus: "paid",
          total: 2500,
          items: [
            { productId: "p1", title: "Item 1", quantity: 1, price: 2500 },
          ],
          shippingAddress: "123 Main St, Delhi",
          createdAt: new Date(),
        },
      },
      isLoading: false,
      error: null,
    });
    render(<OrderDetailView />);
    expect(screen.getAllByTestId("status-badge").length).toBeGreaterThan(0);
  });
});
