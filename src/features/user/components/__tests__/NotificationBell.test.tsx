import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import NotificationBell from "../NotificationBell";

// --- Mocks ---
jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

jest.mock("@/i18n/navigation", () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) =>
    React.createElement("a", { href }, children),
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => "/",
  redirect: jest.fn(),
}));

const mockMarkRead = jest.fn().mockResolvedValue(undefined);
const mockMarkAllRead = jest.fn().mockResolvedValue(undefined);
const mockRefetch = jest.fn();
const mockUseClickOutside = jest.fn();

jest.mock("@/hooks", () => ({
  useNotifications: jest.fn(),
  useMessage: jest.fn(() => ({
    showSuccess: jest.fn(),
    showError: jest.fn(),
  })),
  useClickOutside: (...args: unknown[]) => mockUseClickOutside(...args),
}));

jest.mock("@/constants", () => ({
  THEME_CONSTANTS: {
    colors: {
      iconButton: { onPrimary: "btn-class" },
      icon: { titleBar: "icon-class" },
      notification: { badge: "badge-class" },
    },
    flex: {
      between: "flex-between",
      betweenStart: "flex-between-start",
      center: "flex-center",
      centerCol: "flex-center-col",
      rowCenter: "flex-row-center",
      noShrink: "flex-no-shrink",
    },
    themed: {
      bgPrimary: "bg-primary",
      bgSecondary: "bg-secondary",
      textPrimary: "text-primary",
      textSecondary: "text-secondary",
      border: "border-themed",
    },
  },
  ROUTES: {
    USER: { NOTIFICATIONS: "/user/notifications" },
  },
}));

jest.mock("@/utils", () => ({
  formatRelativeTime: () => "2 hours ago",
}));

jest.mock("@/db/schema", () => ({}));

jest.mock("@/components", () => ({
  Button: ({
    children,
    onClick,
    disabled,
    "aria-label": ariaLabel,
    "aria-expanded": ariaExpanded,
    className,
  }: React.ComponentPropsWithoutRef<"button"> & {
    "aria-label"?: string;
    "aria-expanded"?: boolean;
  }) =>
    React.createElement(
      "button",
      {
        onClick,
        disabled,
        "aria-label": ariaLabel,
        "aria-expanded": String(ariaExpanded),
        className,
      },
      children,
    ),
  Heading: ({
    children,
    level,
  }: {
    children: React.ReactNode;
    level?: number;
  }) => React.createElement(`h${level ?? 2}`, {}, children),
  Text: ({ children }: { children: React.ReactNode }) =>
    React.createElement("p", {}, children),
  Span: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => React.createElement("span", { className }, children),
  Li: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => React.createElement("li", { className }, children),
  Ul: ({ children }: { children: React.ReactNode }) =>
    React.createElement("ul", {}, children),
  Spinner: () => React.createElement("div", { "data-testid": "spinner" }),
  TextLink: ({
    children,
    href,
    onClick,
  }: {
    children: React.ReactNode;
    href: string;
    onClick?: () => void;
  }) => React.createElement("a", { href, onClick }, children),
}));

// --- Test Data ---
const mockNotification = {
  id: "notif-1",
  title: "Your order was shipped",
  message: "Order #12345 has been shipped.",
  type: "order_shipped",
  isRead: false,
  createdAt: new Date("2024-01-01T10:00:00Z"),
  actionUrl: "/user/orders/12345",
  actionLabel: "View Order",
};

const { useNotifications } = jest.requireMock("@/hooks");

describe("NotificationBell", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useNotifications as jest.Mock).mockReturnValue({
      notifications: [],
      unreadCount: 0,
      isLoading: false,
      refetch: mockRefetch,
      markRead: mockMarkRead,
      markAllRead: mockMarkAllRead,
      isMarkingAll: false,
    });
  });

  it("renders the bell button", () => {
    render(<NotificationBell />);
    expect(screen.getByRole("button", { name: /title/i })).toBeInTheDocument();
  });

  it("does not show unread badge when count is 0", () => {
    render(<NotificationBell />);
    expect(screen.queryByText(/0/)).not.toBeInTheDocument();
  });

  it("shows unread badge when unreadCount > 0", () => {
    (useNotifications as jest.Mock).mockReturnValue({
      notifications: [],
      unreadCount: 5,
      isLoading: false,
      refetch: mockRefetch,
      markRead: mockMarkRead,
      markAllRead: mockMarkAllRead,
      isMarkingAll: false,
    });
    render(<NotificationBell />);
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("shows 99+ when unreadCount > 99", () => {
    (useNotifications as jest.Mock).mockReturnValue({
      notifications: [],
      unreadCount: 150,
      isLoading: false,
      refetch: mockRefetch,
      markRead: mockMarkRead,
      markAllRead: mockMarkAllRead,
      isMarkingAll: false,
    });
    render(<NotificationBell />);
    expect(screen.getByText("99+")).toBeInTheDocument();
  });

  it("opens dropdown on bell click and calls refetch", () => {
    render(<NotificationBell />);
    fireEvent.click(screen.getByRole("button", { name: /title/i }));
    expect(mockRefetch).toHaveBeenCalledTimes(1);
    expect(screen.getByText("empty")).toBeInTheDocument(); // empty state visible
  });

  it("shows spinner when loading", () => {
    (useNotifications as jest.Mock).mockReturnValue({
      notifications: [],
      unreadCount: 0,
      isLoading: true,
      refetch: mockRefetch,
      markRead: mockMarkRead,
      markAllRead: mockMarkAllRead,
      isMarkingAll: false,
    });
    render(<NotificationBell />);
    fireEvent.click(screen.getByRole("button", { name: /title/i }));
    expect(screen.getByTestId("spinner")).toBeInTheDocument();
  });

  it("renders notification item when notifications exist", () => {
    (useNotifications as jest.Mock).mockReturnValue({
      notifications: [mockNotification],
      unreadCount: 1,
      isLoading: false,
      refetch: mockRefetch,
      markRead: mockMarkRead,
      markAllRead: mockMarkAllRead,
      isMarkingAll: false,
    });
    render(<NotificationBell />);
    fireEvent.click(screen.getByRole("button", { name: /title/i }));
    expect(screen.getByText("Your order was shipped")).toBeInTheDocument();
  });

  it("calls markRead when 'markRead' button is clicked", async () => {
    (useNotifications as jest.Mock).mockReturnValue({
      notifications: [mockNotification],
      unreadCount: 1,
      isLoading: false,
      refetch: mockRefetch,
      markRead: mockMarkRead,
      markAllRead: mockMarkAllRead,
      isMarkingAll: false,
    });
    render(<NotificationBell />);
    fireEvent.click(screen.getByRole("button", { name: /title/i }));
    fireEvent.click(screen.getByRole("button", { name: /markRead/ }));
    await waitFor(() => expect(mockMarkRead).toHaveBeenCalledWith("notif-1"));
  });

  it("registers useClickOutside with enabled:isOpen", () => {
    render(<NotificationBell />);
    // Initially isOpen=false — useClickOutside called with enabled:false
    expect(mockUseClickOutside).toHaveBeenCalledWith(
      expect.any(Object),
      expect.any(Function),
      { enabled: false },
    );
  });

  it("shows View All link in footer when open", () => {
    render(<NotificationBell />);
    fireEvent.click(screen.getByRole("button", { name: /title/i }));
    expect(screen.getByText("viewAll")).toBeInTheDocument();
  });
});
