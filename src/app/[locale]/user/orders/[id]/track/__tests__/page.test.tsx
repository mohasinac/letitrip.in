/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import type React from "react";
import OrderTrackPage from "../page";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
  useParams: () => ({ id: "order-1" }),
}));

jest.mock("@/hooks", () => ({
  ...jest.requireActual("@/hooks"),
  useAuth: jest.fn(() => ({ user: { uid: "u1" }, loading: false })),
  useApiQuery: jest.fn(() => ({ data: null, isLoading: false, error: null })),
}));

jest.mock("@/services", () => ({
  orderService: { getById: jest.fn() },
}));

jest.mock("@/components", () => ({
  Spinner: () => <div data-testid="spinner" />,
  Button: ({ children, onClick }: any) => (
    <button onClick={onClick}>{children}</button>
  ),
  EmptyState: ({ title }: any) => <div data-testid="empty-state">{title}</div>,
  OrderTrackingView: ({ order, orderId }: any) => (
    <div data-testid="order-tracking-view" data-order-id={orderId}>
      {order?.id}
    </div>
  ),
}));

jest.mock("@/constants", () => ({
  ROUTES: { AUTH: { LOGIN: "/auth/login" }, USER: { ORDERS: "/user/orders" } },
  THEME_CONSTANTS: {
    spacing: {
      stack: "space-y-4",
      padding: { lg: "p-6" },
      gap: { md: "gap-4" },
    },
  },
}));

const { useAuth, useApiQuery } = require("@/hooks");

describe("Order Track Page (/user/orders/[id]/track)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({
      user: { uid: "u1" },
      loading: false,
    });
  });

  it("renders without crashing", () => {
    expect(() => render(<OrderTrackPage />)).not.toThrow();
  });

  it("shows loading spinner while fetching order", () => {
    (useApiQuery as jest.Mock).mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
    });
    render(<OrderTrackPage />);
    expect(screen.getByTestId("spinner")).toBeInTheDocument();
  });

  it("shows empty state when order fetch fails", () => {
    (useApiQuery as jest.Mock).mockReturnValue({
      data: null,
      isLoading: false,
      error: new Error("Order not found"),
    });
    render(<OrderTrackPage />);
    expect(screen.getByTestId("empty-state")).toBeInTheDocument();
  });

  it("renders OrderTrackingView when order is loaded", () => {
    (useApiQuery as jest.Mock).mockReturnValue({
      data: {
        data: { id: "order-1", status: "shipped", items: [], totalPrice: 500 },
      },
      isLoading: false,
      error: null,
    });
    render(<OrderTrackPage />);
    expect(screen.getByTestId("order-tracking-view")).toBeInTheDocument();
  });
});
