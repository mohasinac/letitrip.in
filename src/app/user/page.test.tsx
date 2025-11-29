import React from "react";
import {
  render,
  screen,
  waitFor,
  fireEvent,
  within,
} from "@testing-library/react";
import { jest } from "@jest/globals";

// Mock Next.js router
const mockPush = jest.fn();
const mockRouter = {
  push: mockPush,
};

jest.mock("next/navigation", () => ({
  useRouter: () => mockRouter,
}));

// Mock Next.js Link
jest.mock("next/link", () => {
  return ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  );
});

// Mock components
jest.mock("@/components/common/StatsCard", () => ({
  StatsCard: ({ title, value, icon }: any) => (
    <div data-testid={`stats-card-${title.toLowerCase().replace(/\s+/g, "-")}`}>
      {icon}
      <h3>{title}</h3>
      <p>{value}</p>
    </div>
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

// Mock services
jest.mock("@/services/orders.service");
const mockOrdersService = require("@/services/orders.service").ordersService;

// Mock auth context
jest.mock("@/contexts/AuthContext", () => ({
  useAuth: jest.fn(),
  AuthProvider: ({ children }: any) => <div>{children}</div>,
}));
const mockUseAuth = require("@/contexts/AuthContext").useAuth;

// Import page after mocks
const UserDashboardPage = require("./page").default;

describe("UserDashboardPage", () => {
  const mockUser: UserFE = {
    id: "user-123",
    uid: "user-123",
    email: "test@example.com",
    displayName: "John Doe",
    photoURL: null,
    phoneNumber: "+91-9876543210",
    role: UserRole.USER,
    status: UserStatus.ACTIVE,
    firstName: "John",
    lastName: "Doe",
    fullName: "John Doe",
    initials: "JD",
    bio: null,
    location: null,
    emailVerified: true,
    phoneVerified: true,
    isVerified: true,
    shopId: null,
    shopName: null,
    shopSlug: null,
    hasShop: false,
    totalOrders: 5,
    totalSpent: 15000,
    totalSales: 0,
    totalProducts: 0,
    totalAuctions: 0,
    rating: 4.5,
    reviewCount: 3,
    formattedTotalSpent: "₹15,000",
    formattedTotalSales: "₹0",
    ratingStars: 5,
    ratingDisplay: "4.5 (3 reviews)",
    notifications: {
      email: true,
      push: true,
      orderUpdates: true,
      auctionUpdates: false,
      promotions: true,
    },
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-15"),
    lastLoginAt: new Date("2024-01-15"),
    memberSince: "Member since Jan 2024",
    lastLoginDisplay: "Last seen today",
    accountAge: "2 weeks",
    isActive: true,
    isBlocked: false,
    isSuspended: false,
    isAdmin: false,
    isSeller: false,
    isUser: true,
    badges: ["Verified"],
    metadata: {},
  };

  const mockOrders: OrderCardFE[] = [
    {
      id: "order-1",
      orderNumber: "ORD-001",
      shopName: "Test Shop",
      itemCount: 1,
      total: 2500,
      formattedTotal: "₹2,500",
      status: OrderStatus.DELIVERED,
      paymentStatus: PaymentStatus.COMPLETED,
      orderDate: "15 Jan 2024",
      badges: ["Delivered"],
      isPaid: true,
      canCancel: false,
      items: [{ id: "item-1", name: "Test Product", quantity: 1, price: 2500 }],
      createdAt: "15 Jan 2024",
    },
    {
      id: "order-2",
      orderNumber: "ORD-002",
      shopName: "Another Shop",
      itemCount: 2,
      total: 1500,
      formattedTotal: "₹1,500",
      status: OrderStatus.PENDING,
      paymentStatus: PaymentStatus.COMPLETED,
      orderDate: "14 Jan 2024",
      badges: ["Pending"],
      isPaid: true,
      canCancel: true,
      items: [
        { id: "item-2", name: "Product A", quantity: 1, price: 1000 },
        { id: "item-3", name: "Product B", quantity: 1, price: 500 },
      ],
      createdAt: "14 Jan 2024",
    },
    {
      id: "order-3",
      orderNumber: "ORD-003",
      shopName: "Shop C",
      itemCount: 1,
      total: 3000,
      formattedTotal: "₹3,000",
      status: OrderStatus.CANCELLED,
      paymentStatus: PaymentStatus.REFUNDED,
      orderDate: "13 Jan 2024",
      badges: ["Cancelled"],
      isPaid: false,
      canCancel: false,
      items: [
        { id: "item-4", name: "Cancelled Product", quantity: 1, price: 3000 },
      ],
      createdAt: "13 Jan 2024",
    },
  ];

  const mockOrdersResponse: PaginatedResponseFE<OrderCardFE> = {
    data: mockOrders,
    count: mockOrders.length,
    pagination: {
      page: 1,
      limit: 10,
      total: mockOrders.length,
      hasNextPage: false,
      hasPrevPage: false,
      totalPages: 1,
    },
  };

  const mockEmptyOrdersResponse: PaginatedResponseFE<OrderCardFE> = {
    data: [],
    count: 0,
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      hasNextPage: false,
      hasPrevPage: false,
      totalPages: 0,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockPush.mockClear();
  });

  describe("Authentication", () => {
    it("redirects to login when user is not authenticated", () => {
      mockUseAuth.mockReturnValue({
        user: null,
        loading: false,
        isAuthenticated: false,
        login: jest.fn(),
        register: jest.fn(),
        logout: jest.fn(),
        refreshUser: jest.fn(),
        isAdmin: false,
        isSeller: false,
        isAdminOrSeller: false,
      } as any);

      render(<UserDashboardPage />);

      expect(mockPush).toHaveBeenCalledWith("/login?redirect=/user");
    });

    it("does not redirect when user is authenticated", () => {
      mockUseAuth.mockReturnValue({
        user: mockUser,
        loading: false,
        isAuthenticated: true,
        login: jest.fn(),
        register: jest.fn(),
        logout: jest.fn(),
        refreshUser: jest.fn(),
        isAdmin: false,
        isSeller: false,
        isAdminOrSeller: false,
      } as any);
      mockOrdersService.list.mockResolvedValue(mockEmptyOrdersResponse);

      render(<UserDashboardPage />);

      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  describe("Loading State", () => {
    it("shows loading spinner while data is loading", () => {
      mockUseAuth.mockReturnValue({
        user: mockUser,
        loading: false,
        isAuthenticated: true,
        login: jest.fn(),
        register: jest.fn(),
        logout: jest.fn(),
        refreshUser: jest.fn(),
        isAdmin: false,
        isSeller: false,
        isAdminOrSeller: false,
      } as any);
      mockOrdersService.list.mockImplementation(
        () => new Promise(() => {}), // Never resolves
      );

      render(<UserDashboardPage />);

      expect(screen.getByRole("status")).toBeInTheDocument();
    });
  });

  describe("Dashboard Data Loading", () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: mockUser,
        loading: false,
        isAuthenticated: true,
        login: jest.fn(),
        register: jest.fn(),
        logout: jest.fn(),
        refreshUser: jest.fn(),
        isAdmin: false,
        isSeller: false,
        isAdminOrSeller: false,
      } as any);
    });

    it("loads and displays dashboard data successfully", async () => {
      mockOrdersService.list.mockResolvedValue(mockOrdersResponse);

      render(<UserDashboardPage />);

      await waitFor(() => {
        expect(mockOrdersService.list).toHaveBeenCalled();
      });

      // Check welcome message
      expect(screen.getByText("Welcome back, John Doe!")).toBeInTheDocument();

      // Check stats cards
      expect(screen.getByTestId("stats-card-total-orders")).toHaveTextContent(
        "3",
      );
      expect(screen.getByTestId("stats-card-pending")).toHaveTextContent("1");
      expect(screen.getByTestId("stats-card-completed")).toHaveTextContent("1");
      expect(screen.getByTestId("stats-card-cancelled")).toHaveTextContent("1");
    });

    it("handles API errors gracefully", async () => {
      mockOrdersService.list.mockRejectedValue(new Error("API Error"));

      // Mock console.error to avoid test output pollution
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      render(<UserDashboardPage />);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          "Failed to load dashboard data:",
          expect.any(Error),
        );
      });

      // Should still show the dashboard with zero stats
      expect(screen.getByText("Welcome back, John Doe!")).toBeInTheDocument();
      expect(screen.getByTestId("stats-card-total-orders")).toHaveTextContent(
        "0",
      );

      consoleSpy.mockRestore();
    });
  });

  describe("Stats Calculation", () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: mockUser,
        loading: false,
        isAuthenticated: true,
        login: jest.fn(),
        register: jest.fn(),
        logout: jest.fn(),
        refreshUser: jest.fn(),
        isAdmin: false,
        isSeller: false,
        isAdminOrSeller: false,
      } as any);
    });

    it("calculates stats correctly from orders", async () => {
      mockOrdersService.list.mockResolvedValue(mockOrdersResponse);

      render(<UserDashboardPage />);

      await waitFor(() => {
        expect(screen.getByTestId("stats-card-total-orders")).toHaveTextContent(
          "3",
        );
      });

      expect(screen.getByTestId("stats-card-pending")).toHaveTextContent("1");
      expect(screen.getByTestId("stats-card-completed")).toHaveTextContent("1");
      expect(screen.getByTestId("stats-card-cancelled")).toHaveTextContent("1");
    });

    it("handles empty orders list", async () => {
      mockOrdersService.list.mockResolvedValue(mockEmptyOrdersResponse);

      render(<UserDashboardPage />);

      await waitFor(() => {
        expect(screen.getByTestId("stats-card-total-orders")).toHaveTextContent(
          "0",
        );
      });

      expect(screen.getByTestId("stats-card-pending")).toHaveTextContent("0");
      expect(screen.getByTestId("stats-card-completed")).toHaveTextContent("0");
      expect(screen.getByTestId("stats-card-cancelled")).toHaveTextContent("0");
    });
  });

  describe("Quick Actions", () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: mockUser,
        loading: false,
        isAuthenticated: true,
        login: jest.fn(),
        register: jest.fn(),
        logout: jest.fn(),
        refreshUser: jest.fn(),
        isAdmin: false,
        isSeller: false,
        isAdminOrSeller: false,
      } as any);
      mockOrdersService.list.mockResolvedValue(mockOrdersResponse);
    });

    it("renders all quick action links", async () => {
      render(<UserDashboardPage />);

      await waitFor(() => {
        expect(screen.getByText("My Orders")).toBeInTheDocument();
      });

      expect(screen.getByText("My Addresses")).toBeInTheDocument();
      expect(screen.getByText("Account Settings")).toBeInTheDocument();
    });

    it("links to correct routes", async () => {
      render(<UserDashboardPage />);

      await waitFor(() => {
        expect(screen.getByText("My Orders")).toBeInTheDocument();
      });

      const ordersLink = screen.getByRole("link", { name: /my orders/i });
      const addressesLink = screen.getByRole("link", { name: /my addresses/i });
      const settingsLink = screen.getByRole("link", {
        name: /account settings/i,
      });

      expect(ordersLink).toHaveAttribute("href", "/user/orders");
      expect(addressesLink).toHaveAttribute("href", "/user/addresses");
      expect(settingsLink).toHaveAttribute("href", "/user/settings");
    });
  });

  describe("Recent Orders", () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: mockUser,
        loading: false,
        isAuthenticated: true,
        login: jest.fn(),
        register: jest.fn(),
        logout: jest.fn(),
        refreshUser: jest.fn(),
        isAdmin: false,
        isSeller: false,
        isAdminOrSeller: false,
      } as any);
    });

    it("displays recent orders when available", async () => {
      mockOrdersService.list.mockResolvedValue(mockOrdersResponse);

      render(<UserDashboardPage />);

      await waitFor(() => {
        expect(screen.getByText("Recent Orders")).toBeInTheDocument();
      });

      // Check order display (scope queries to the specific recent order element)
      const recentOrder = screen.getByTestId("recent-order-order-1");
      expect(recentOrder).toBeInTheDocument();
      expect(within(recentOrder).getByText(/ORD-001/)).toBeInTheDocument();
      expect(within(recentOrder).getByText("₹2,500")).toBeInTheDocument();
      expect(within(recentOrder).getByText("Delivered")).toBeInTheDocument();
      expect(within(recentOrder).getByText("1 item")).toBeInTheDocument();
    });

    it("shows empty state when no orders", async () => {
      mockOrdersService.list.mockResolvedValue(mockEmptyOrdersResponse);

      render(<UserDashboardPage />);

      await waitFor(() => {
        expect(screen.getByTestId("empty-state")).toBeInTheDocument();
      });

      expect(screen.getByText("No orders yet")).toBeInTheDocument();
      expect(
        screen.getByText("Start shopping to see your orders here!"),
      ).toBeInTheDocument();
    });

    it("links to individual order pages", async () => {
      mockOrdersService.list.mockResolvedValue({
        ...mockOrdersResponse,
        data: [mockOrders[0]],
      });

      render(<UserDashboardPage />);

      await waitFor(() => {
        expect(screen.getByTestId("recent-order-order-1")).toBeInTheDocument();
      });

      const orderLink = screen.getByTestId("recent-order-order-1");
      expect(orderLink).toHaveAttribute("href", "/user/orders/order-1");
    });

    it("navigates to home page from empty state action", async () => {
      mockOrdersService.list.mockResolvedValue(mockEmptyOrdersResponse);

      render(<UserDashboardPage />);

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

  describe("Order Status Display", () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: mockUser,
        loading: false,
        isAuthenticated: true,
        login: jest.fn(),
        register: jest.fn(),
        logout: jest.fn(),
        refreshUser: jest.fn(),
        isAdmin: false,
        isSeller: false,
        isAdminOrSeller: false,
      } as any);
      mockOrdersService.list.mockResolvedValue(mockOrdersResponse);
    });

    it("displays correct status badges", async () => {
      render(<UserDashboardPage />);

      await waitFor(() => {
        expect(screen.getByText("Delivered")).toBeInTheDocument();
      });

      // Use testids for order badges to avoid ambiguous text matches
      expect(screen.getByTestId("order-status-order-2")).toHaveTextContent(
        "Pending",
      );
      expect(screen.getByTestId("order-status-order-3")).toHaveTextContent(
        "Cancelled",
      );
    });

    it("handles plural items correctly", async () => {
      render(<UserDashboardPage />);

      await waitFor(() => {
        expect(screen.getByText("2 items")).toBeInTheDocument();
      });
    });
  });

  describe("Date Formatting", () => {
    it("displays order dates correctly", async () => {
      mockUseAuth.mockReturnValue({
        user: mockUser,
        loading: false,
        isAuthenticated: true,
        login: jest.fn(),
        register: jest.fn(),
        logout: jest.fn(),
        refreshUser: jest.fn(),
        isAdmin: false,
        isSeller: false,
        isAdminOrSeller: false,
      } as any);
      mockOrdersService.list.mockResolvedValue(mockOrdersResponse);

      render(<UserDashboardPage />);

      await waitFor(() => {
        expect(screen.getByText("15 Jan 2024")).toBeInTheDocument();
      });
    });
  });
});

import type { UserFE } from "@/types/frontend/user.types";
import type { OrderCardFE } from "@/types/frontend/order.types";
import type { PaginatedResponseFE } from "@/types/shared/common.types";
import {
  UserRole,
  UserStatus,
  OrderStatus,
  PaymentStatus,
} from "@/types/shared/common.types";
