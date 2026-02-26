/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import type React from "react";
import UserNotificationsPage from "../page";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
}));

jest.mock("@/hooks", () => ({
  useAuth: jest.fn(() => ({
    user: { uid: "u1", email: "user@example.com" },
    loading: false,
  })),
  useApiQuery: jest.fn(() => ({
    data: null,
    isLoading: false,
    refetch: jest.fn(),
  })),
  useApiMutation: jest.fn(() => ({
    mutate: jest.fn(),
    mutateAsync: jest.fn(),
    isLoading: false,
    isPending: false,
  })),
  useMessage: () => ({ showError: jest.fn(), showSuccess: jest.fn() }),
}));

jest.mock("@/services", () => ({
  notificationService: {
    list: jest.fn(),
    markRead: jest.fn(),
    delete: jest.fn(),
    markAllRead: jest.fn(),
  },
}));

jest.mock("@/components", () => ({
  Spinner: () => <div data-testid="spinner" />,
  EmptyState: ({ title }: any) => <div data-testid="empty-state">{title}</div>,
  NotificationItem: ({ notification }: any) => (
    <div data-testid="notification-item">{notification.title}</div>
  ),
  NotificationsBulkActions: ({ unreadCount }: any) => (
    <div data-testid="bulk-actions" data-unread={unreadCount} />
  ),
}));

jest.mock("@/constants", () => ({
  ROUTES: { AUTH: { LOGIN: "/auth/login" } },
  THEME_CONSTANTS: {
    themed: {
      bgPrimary: "bg-white",
      textPrimary: "text-gray-900",
      textSecondary: "text-gray-600",
      border: "border-gray-200",
    },
    spacing: {
      stack: "space-y-4",
      padding: { lg: "p-6", md: "p-4" },
      gap: { md: "gap-4" },
    },
    typography: { h2: "text-2xl font-bold" },
    borderRadius: { xl: "rounded-xl" },
  },
}));

const { useAuth, useApiQuery } = require("@/hooks");

describe("User Notifications Page (/user/notifications)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({
      user: { uid: "u1", email: "user@example.com" },
      loading: false,
    });
  });

  it("renders without crashing", () => {
    expect(() => render(<UserNotificationsPage />)).not.toThrow();
  });

  it("shows loading spinner while query is loading", () => {
    (useApiQuery as jest.Mock).mockReturnValue({
      data: null,
      isLoading: true,
      refetch: jest.fn(),
    });
    render(<UserNotificationsPage />);
    expect(screen.getByTestId("spinner")).toBeInTheDocument();
  });

  it("shows empty state when there are no notifications", () => {
    (useApiQuery as jest.Mock).mockReturnValue({
      data: { notifications: [], unreadCount: 0 },
      isLoading: false,
      refetch: jest.fn(),
    });
    render(<UserNotificationsPage />);
    expect(screen.getByTestId("empty-state")).toBeInTheDocument();
  });

  it("renders notification items when data is loaded", () => {
    (useApiQuery as jest.Mock).mockReturnValue({
      data: {
        notifications: [
          {
            id: "n1",
            title: "Order shipped",
            message: "On the way",
            isRead: false,
            createdAt: new Date().toISOString(),
          },
          {
            id: "n2",
            title: "New sale",
            message: "Check out deals",
            isRead: true,
            createdAt: new Date().toISOString(),
          },
        ],
        unreadCount: 1,
      },
      isLoading: false,
      refetch: jest.fn(),
    });
    render(<UserNotificationsPage />);
    const items = screen.getAllByTestId("notification-item");
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent("Order shipped");
  });
});
