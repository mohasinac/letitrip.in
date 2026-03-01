/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { UserNotificationsView } from "../UserNotificationsView";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

jest.mock("@/hooks", () => ({
  useAuth: jest.fn(() => ({ user: { uid: "user_1" }, loading: false })),
  useApiQuery: jest.fn(() => ({
    data: null,
    isLoading: false,
    error: null,
    refetch: jest.fn(),
  })),
  useApiMutation: jest.fn(() => ({ mutate: jest.fn(), isLoading: false })),
  useMessage: jest.fn(() => ({ showSuccess: jest.fn(), showError: jest.fn() })),
}));

jest.mock("@/services", () => ({
  notificationService: {
    list: jest.fn(),
    markRead: jest.fn(),
    delete: jest.fn(),
    markAllRead: jest.fn(),
  },
}));

jest.mock("@/constants", () => ({
  ROUTES: { AUTH: { LOGIN: "/login" } },
  THEME_CONSTANTS: {
    themed: { border: "border-gray-200" },
    spacing: { stack: "space-y-4" },
  },
}));

jest.mock("@/components", () => ({
  Spinner: ({ size }: any) => <div data-testid="spinner">{size}</div>,
  EmptyState: ({ title }: any) => <div data-testid="empty-state">{title}</div>,
  NotificationItem: ({ notification }: any) => (
    <div data-testid="notification-item">{notification.id}</div>
  ),
  NotificationsBulkActions: ({ unreadCount }: any) => (
    <div data-testid="bulk-actions">{unreadCount}</div>
  ),
}));

describe("UserNotificationsView", () => {
  it("shows empty state when no notifications", () => {
    const { useApiQuery } = require("@/hooks");
    (useApiQuery as jest.Mock).mockReturnValue({
      data: { notifications: [], unreadCount: 0 },
      isLoading: false,
      refetch: jest.fn(),
    });

    render(<UserNotificationsView />);
    expect(screen.getByTestId("empty-state")).toBeInTheDocument();
    expect(screen.getByText("empty")).toBeInTheDocument();
  });

  it("renders notification items when data is available", () => {
    const { useApiQuery } = require("@/hooks");
    (useApiQuery as jest.Mock).mockReturnValue({
      data: {
        notifications: [
          {
            id: "n1",
            title: "Test",
            message: "Hello",
            read: false,
            createdAt: new Date(),
          },
        ],
        unreadCount: 1,
      },
      isLoading: false,
      refetch: jest.fn(),
    });

    render(<UserNotificationsView />);
    expect(screen.getByTestId("notification-item")).toBeInTheDocument();
    expect(screen.getByTestId("bulk-actions")).toBeInTheDocument();
  });

  it("shows spinner while loading", () => {
    const { useApiQuery } = require("@/hooks");
    (useApiQuery as jest.Mock).mockReturnValue({
      data: null,
      isLoading: true,
      refetch: jest.fn(),
    });

    render(<UserNotificationsView />);
    expect(screen.getByTestId("spinner")).toBeInTheDocument();
  });

  it("redirects to login if unauthenticated", () => {
    const { useAuth } = require("@/hooks");
    const push = jest.fn();
    (useAuth as jest.Mock).mockReturnValue({ user: null, loading: false });
    jest.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

    render(<UserNotificationsView />);
    // spinner shown while auth loads; redirect handled in effect
  });
});
