import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";

// Mock Next.js navigation
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

// Mock Next.js Link
jest.mock("next/link", () => {
  return ({ children, href }: any) => <a href={href}>{children}</a>;
});

// Mock auth context
jest.mock("@/contexts/AuthContext", () => ({
  useAuth: jest.fn(),
}));
const mockUseAuth = require("@/contexts/AuthContext").useAuth;

// Mock orders service
jest.mock("@/services/orders.service");
const mockOrdersService = require("@/services/orders.service").ordersService;

// Mock components
jest.mock("@/components/auth/AuthGuard", () => {
  const MockAuthGuard = ({ children }: { children: any }) => {
    return React.createElement(
      "div",
      { "data-testid": "auth-guard" },
      children
    );
  };
  return {
    __esModule: true,
    default: MockAuthGuard,
  };
});

jest.mock("@/components/common/ErrorBoundary", () => ({
  ErrorBoundary: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="error-boundary">{children}</div>
  ),
}));

jest.mock("@/components/common/inline-edit", () => ({
  UnifiedFilterSidebar: ({ resultCount, isLoading }: any) => (
    <div data-testid="unified-filter-sidebar">
      <div>Filters</div>
      <div>Results: {resultCount}</div>
      <div>Loading: {isLoading ? "true" : "false"}</div>
    </div>
  ),
  TableCheckbox: () => <div data-testid="table-checkbox" />,
}));

// Mock constants
jest.mock("@/constants/filters", () => ({
  ORDER_FILTERS: [
    {
      title: "Order Status",
      fields: [
        {
          key: "status",
          label: "Status",
          type: "multiselect",
          options: [
            { label: "Pending", value: "pending" },
            { label: "Confirmed", value: "confirmed" },
            { label: "Processing", value: "processing" },
            { label: "Shipped", value: "shipped" },
            { label: "Delivered", value: "delivered" },
            { label: "Cancelled", value: "cancelled" },
          ],
        },
      ],
    },
    {
      title: "Date Range",
      fields: [
        {
          key: "date_range",
          label: "Order Date",
          type: "daterange",
        },
      ],
    },
  ],
}));

// Mock error logger
jest.mock("@/lib/error-logger", () => ({
  logComponentError: jest.fn(),
}));

// Mock lucide-react icons
jest.mock("lucide-react", () => ({
  Eye: () => <div data-testid="eye-icon" />,
  Package: () => <div data-testid="package-icon" />,
  Truck: () => <div data-testid="truck-icon" />,
  ChevronLeft: () => <div data-testid="chevron-left-icon" />,
  ChevronRight: () => <div data-testid="chevron-right-icon" />,
}));

const mockRouter = {
  push: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
};

const mockSearchParams = {
  get: jest.fn(() => null),
  getAll: jest.fn(() => []),
  has: jest.fn(() => false),
  toString: jest.fn(() => ""),
};

const { useRouter, useSearchParams } = require("next/navigation");

// Mock window methods
Object.defineProperty(window, "scrollTo", {
  writable: true,
  value: jest.fn(),
});

// Import page after ALL mocks are set up
import SellerOrdersPage from "./page";

describe("SellerOrdersPage", () => {
  const mockUser = {
    id: "seller-123",
    email: "seller@example.com",
  };

  const mockOrdersData = [
    {
      id: "ORD-001",
      orderNumber: "ORD-001",
      itemCount: 2,
      total: 2500,
      status: "pending",
      orderDate: "2024-01-15",
      shippingAddress: {
        name: "John Doe",
        phone: "1234567890",
      },
    },
    {
      id: "ORD-002",
      orderNumber: "ORD-002",
      itemCount: 1,
      total: 1500,
      status: "processing",
      orderDate: "2024-01-14",
      shippingAddress: {
        name: "Jane Smith",
        phone: "0987654321",
      },
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockOrdersService.getSellerOrders.mockResolvedValue({
      data: mockOrdersData,
      count: mockOrdersData.length,
      pagination: { hasNextPage: false },
    });
    useRouter.mockReturnValue(mockRouter);
    useSearchParams.mockReturnValue(mockSearchParams);
    mockSearchParams.get.mockReturnValue(null);
  });

  describe("Authentication and Layout", () => {
    it("renders with auth guard and error boundary", () => {
      mockUseAuth.mockReturnValue({
        user: mockUser,
      });

      render(<SellerOrdersPage />);

      expect(screen.getByTestId("auth-guard")).toBeInTheDocument();
      expect(screen.getByTestId("error-boundary")).toBeInTheDocument();
    });

    it("displays page title", async () => {
      mockUseAuth.mockReturnValue({
        user: mockUser,
      });

      render(<SellerOrdersPage />);

      await waitFor(() => {
        expect(screen.getByText("My Orders")).toBeInTheDocument();
      });
    });
  });

  describe("Loading and Data Fetching", () => {
    it("shows loading spinner initially", () => {
      mockUseAuth.mockReturnValue({
        user: mockUser,
      });
      mockOrdersService.getSellerOrders.mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      render(<SellerOrdersPage />);

      // Check for loading spinner by class
      expect(screen.getByText("My Orders")).toBeInTheDocument();
      const spinner = document.querySelector(".animate-spin");
      expect(spinner).toBeInTheDocument();
    });

    it("loads orders data on mount", async () => {
      mockUseAuth.mockReturnValue({
        user: mockUser,
      });
      mockOrdersService.getSellerOrders.mockResolvedValue(mockOrdersData);

      render(<SellerOrdersPage />);

      await waitFor(() => {
        expect(mockOrdersService.getSellerOrders).toHaveBeenCalled();
      });
    });

    it("displays orders data", async () => {
      mockUseAuth.mockReturnValue({
        user: mockUser,
      });
      mockOrdersService.getSellerOrders.mockResolvedValue({
        data: mockOrdersData,
        count: mockOrdersData.length,
        pagination: { hasNextPage: false },
      });

      render(<SellerOrdersPage />);

      await waitFor(() => {
        expect(screen.getByText("ORD-001")).toBeInTheDocument();
      });

      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("₹2,500.00")).toBeInTheDocument();
    });

    it("handles API error gracefully", async () => {
      mockUseAuth.mockReturnValue({
        user: mockUser,
      });
      mockOrdersService.getSellerOrders.mockRejectedValue(
        new Error("API Error")
      );

      render(<SellerOrdersPage />);

      // Component should not crash and should show empty state or loading
      await waitFor(() => {
        expect(screen.getByText("My Orders")).toBeInTheDocument();
      });
    });
  });

  describe("Order Display", () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: mockUser,
      });
      mockOrdersService.getSellerOrders.mockResolvedValue({
        data: mockOrdersData,
        count: mockOrdersData.length,
        pagination: { hasNextPage: false },
      });
    });

    it("displays orders in table", async () => {
      render(<SellerOrdersPage />);

      await waitFor(() => {
        expect(screen.getByText("ORD-001")).toBeInTheDocument();
      });

      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("₹2,500.00")).toBeInTheDocument();
      expect(screen.getByText("pending")).toBeInTheDocument();
    });

    it("shows order actions", async () => {
      render(<SellerOrdersPage />);

      await waitFor(() => {
        expect(screen.getByText("ORD-001")).toBeInTheDocument();
      });

      expect(screen.getByTestId("package-icon")).toBeInTheDocument();
      expect(screen.getAllByTestId("eye-icon").length).toBeGreaterThan(0);
    });
  });

  describe("Retry Functionality", () => {
    it("retries loading on component remount", async () => {
      mockUseAuth.mockReturnValue({
        user: mockUser,
      });
      mockOrdersService.getSellerOrders.mockRejectedValueOnce(
        new Error("API Error")
      );
      mockOrdersService.getSellerOrders.mockResolvedValueOnce({
        data: mockOrdersData,
        count: mockOrdersData.length,
        pagination: { hasNextPage: false },
      });

      const { unmount } = render(<SellerOrdersPage />);

      // Wait for first call to complete
      await waitFor(() => {
        expect(mockOrdersService.getSellerOrders).toHaveBeenCalledTimes(1);
      });

      // Unmount and remount to trigger another call
      unmount();
      render(<SellerOrdersPage />);

      await waitFor(() => {
        expect(mockOrdersService.getSellerOrders).toHaveBeenCalledTimes(2);
      });
    });
  });

  it("can be imported", () => {
    expect(typeof SellerOrdersPage).toBe("function");
  });
});
