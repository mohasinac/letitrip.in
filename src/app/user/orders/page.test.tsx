import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";

// Mock Next.js router and search params
const mockPush = jest.fn();
const mockRouter = {
  push: mockPush,
};

const mockSearchParams = {
  get: jest.fn(),
};

jest.mock("next/navigation", () => ({
  useRouter: () => mockRouter,
  useSearchParams: () => mockSearchParams,
}));

// Mock auth context
jest.mock("@/contexts/AuthContext", () => ({
  useAuth: jest.fn(),
  AuthProvider: ({ children }: any) => <div>{children}</div>,
}));
const mockUseAuth = require("@/contexts/AuthContext").useAuth;

// Mock services
jest.mock("@/services/orders.service");
const mockOrdersService = require("@/services/orders.service").ordersService;

// Mock components
jest.mock("@/components/common/DataTable", () => ({
  DataTable: ({ data, columns, onRowClick }: any) => (
    <div data-testid="data-table">
      {data.map((item: any) => (
        <div
          key={item.id}
          data-testid={`row-${item.id}`}
          onClick={() => onRowClick(item)}
        >
          {columns.map((col: any) => (
            <div key={col.key} data-testid={`cell-${col.key}-${item.id}`}>
              {col.render ? col.render(item) : item[col.key]}
            </div>
          ))}
        </div>
      ))}
    </div>
  ),
}));

// Mock MobileDataTable - same interface as DataTable but used on mobile
jest.mock("@/components/mobile/MobileDataTable", () => ({
  MobileDataTable: ({ data, columns, onRowClick }: any) => (
    <div data-testid="data-table">
      {data.map((item: any) => (
        <div
          key={item.id}
          data-testid={`row-${item.id}`}
          onClick={() => onRowClick(item)}
        >
          {columns.map((col: any) => (
            <div key={col.key} data-testid={`cell-${col.key}-${item.id}`}>
              {col.render ? col.render(item) : item[col.key]}
            </div>
          ))}
        </div>
      ))}
    </div>
  ),
}));

// Mock MobilePullToRefresh
jest.mock("@/components/mobile/MobilePullToRefresh", () => ({
  MobilePullToRefresh: ({ children }: any) => <div>{children}</div>,
}));

jest.mock("@/components/common/StatusBadge", () => ({
  StatusBadge: ({ status }: any) => (
    <span data-testid={`status-${status}`}>{status}</span>
  ),
}));

jest.mock("@/components/common/EmptyState", () => ({
  EmptyState: ({ title, description, action }: any) => (
    <div data-testid="empty-state">
      <h3>{title}</h3>
      <p>{description}</p>
      <button onClick={action.onClick}>{action.label}</button>
    </div>
  ),
}));

// Import page after mocks
import OrdersPage from "./page";

describe("OrdersPage", () => {
  const mockUser = {
    id: "user-123",
    uid: "user-123",
    email: "test@example.com",
    displayName: "John Doe",
    fullName: "John Doe",
  };

  const mockOrders = [
    {
      id: "order-1",
      orderNumber: "ORD-001",
      shopName: "Test Shop",
      total: 2500,
      status: "DELIVERED",
      paymentStatus: "COMPLETED",
      createdAt: "2024-01-15T00:00:00Z",
    },
    {
      id: "order-2",
      orderNumber: "ORD-002",
      shopName: "Another Shop",
      total: 1500,
      status: "PENDING",
      paymentStatus: "COMPLETED",
      createdAt: "2024-01-14T00:00:00Z",
    },
  ];

  const mockOrdersResponse = {
    data: mockOrders,
    pagination: {
      hasNextPage: false,
      nextCursor: null,
    },
  };

  const mockEmptyResponse = {
    data: [],
    pagination: {
      hasNextPage: false,
      nextCursor: null,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockPush.mockClear();
    mockSearchParams.get.mockImplementation((key: string) => {
      if (key === "status") return null;
      if (key === "sortBy") return "created_at";
      if (key === "sortOrder") return "desc";
      return null;
    });
  });

  describe("Authentication", () => {
    it("redirects to login when user is not authenticated", () => {
      mockUseAuth.mockReturnValue({
        user: null,
        loading: false,
        isAuthenticated: false,
      });

      render(<OrdersPage />);

      expect(mockPush).toHaveBeenCalledWith("/login?redirect=/user/orders");
    });

    it("does not redirect when user is authenticated", () => {
      mockUseAuth.mockReturnValue({
        user: mockUser,
        loading: false,
        isAuthenticated: true,
      });
      mockOrdersService.list.mockResolvedValue(mockEmptyResponse);

      render(<OrdersPage />);

      // Should not redirect to login, but may update URL for filters
      expect(mockPush).toHaveBeenCalledWith(
        "/user/orders?sortBy=created_at&sortOrder=desc",
        { scroll: false },
      );
    });
  });

  describe("Orders Loading", () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: mockUser,
        loading: false,
        isAuthenticated: true,
      });
    });

    it("loads orders on mount", async () => {
      mockOrdersService.list.mockResolvedValue(mockOrdersResponse);

      render(<OrdersPage />);

      await waitFor(() => {
        expect(mockOrdersService.list).toHaveBeenCalledWith({
          status: undefined,
          sortBy: "created_at",
          sortOrder: "desc",
          startAfter: undefined,
          limit: 20,
        });
      });
    });

    it("displays orders in table", async () => {
      mockOrdersService.list.mockResolvedValue(mockOrdersResponse);

      render(<OrdersPage />);

      await waitFor(() => {
        expect(screen.getByTestId("data-table")).toBeInTheDocument();
      });

      expect(screen.getByText("#ORD-001")).toBeInTheDocument();
      expect(screen.getByText("#ORD-002")).toBeInTheDocument();
    });

    it("shows empty state when no orders", async () => {
      mockOrdersService.list.mockResolvedValue(mockEmptyResponse);

      render(<OrdersPage />);

      await waitFor(() => {
        expect(screen.getByTestId("empty-state")).toBeInTheDocument();
      });

      expect(screen.getByText("No orders found")).toBeInTheDocument();
      expect(
        screen.getByText("You haven't placed any orders yet"),
      ).toBeInTheDocument();
    });

    it("shows loading spinner while loading", () => {
      mockOrdersService.list.mockImplementation(
        () => new Promise(() => {}), // Never resolves
      );

      render(<OrdersPage />);

      expect(screen.getByRole("status")).toBeInTheDocument();
    });
  });

  describe("Row Interaction", () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: mockUser,
        loading: false,
        isAuthenticated: true,
      });
      mockOrdersService.list.mockResolvedValue(mockOrdersResponse);
    });

    it("navigates to order detail on row click", async () => {
      render(<OrdersPage />);

      await waitFor(() => {
        expect(screen.getByTestId("data-table")).toBeInTheDocument();
      });

      const firstRow = screen.getByTestId("row-order-1");
      fireEvent.click(firstRow);

      expect(mockPush).toHaveBeenCalledWith("/user/orders/order-1");
    });

    it("navigates to order detail on order ID click", async () => {
      render(<OrdersPage />);

      await waitFor(() => {
        expect(screen.getByText("#ORD-001")).toBeInTheDocument();
      });

      const orderIdButton = screen.getByText("#ORD-001");
      fireEvent.click(orderIdButton);

      expect(mockPush).toHaveBeenCalledWith("/user/orders/order-1");
    });
  });

  describe("Empty State Action", () => {
    it("navigates to home page from empty state", async () => {
      mockUseAuth.mockReturnValue({
        user: mockUser,
        loading: false,
        isAuthenticated: true,
      });
      mockOrdersService.list.mockResolvedValue(mockEmptyResponse);

      render(<OrdersPage />);

      await waitFor(() => {
        expect(screen.getByTestId("empty-state")).toBeInTheDocument();
      });

      const startShoppingButton = screen.getByRole("button", {
        name: "Start Shopping",
      });
      fireEvent.click(startShoppingButton);

      expect(mockPush).toHaveBeenCalledWith("/");
    });
  });

  describe("Pagination", () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: mockUser,
        loading: false,
        isAuthenticated: true,
      });
    });

    it("shows pagination controls when there are orders", async () => {
      mockOrdersService.list.mockResolvedValue(mockOrdersResponse);

      render(<OrdersPage />);

      await waitFor(() => {
        expect(screen.getByText("Page 1")).toBeInTheDocument();
      });

      expect(screen.getByRole("button", { name: /previous/i })).toBeDisabled();
      expect(screen.getByRole("button", { name: /next/i })).toBeDisabled();
    });

    it("enables next button when hasNextPage is true", async () => {
      const responseWithNext = {
        ...mockOrdersResponse,
        pagination: {
          hasNextPage: true,
          nextCursor: "cursor-123",
        },
      };
      mockOrdersService.list.mockResolvedValue(responseWithNext);

      render(<OrdersPage />);

      await waitFor(() => {
        expect(screen.getByText("Page 1")).toBeInTheDocument();
      });

      const nextButton = screen.getByRole("button", { name: /next/i });
      expect(nextButton).not.toBeDisabled();
    });

    it("handles next page click", async () => {
      const responseWithNext = {
        ...mockOrdersResponse,
        pagination: {
          hasNextPage: true,
          nextCursor: "cursor-123",
        },
      };
      mockOrdersService.list.mockResolvedValueOnce(responseWithNext);
      mockOrdersService.list.mockResolvedValueOnce(mockOrdersResponse); // Second call for page 2

      render(<OrdersPage />);

      await waitFor(() => {
        expect(screen.getByText("Page 1")).toBeInTheDocument();
      });

      const nextButton = screen.getByRole("button", { name: /next/i });
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(mockOrdersService.list).toHaveBeenCalledWith(
          expect.objectContaining({
            startAfter: "cursor-123",
          }),
        );
      });
    });
  });
});
