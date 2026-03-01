import { render, screen, fireEvent } from "@testing-library/react";
import type React from "react";

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

jest.mock("@/utils", () => ({
  formatRelativeTime: () => "3 hours ago",
}));

jest.mock("@/components", () => ({
  Badge: ({ children }: { children: React.ReactNode }) => (
    <span>{children}</span>
  ),
  Text: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => <p className={className}>{children}</p>,
}));

jest.mock("@/constants", () => ({
  THEME_CONSTANTS: {
    themed: {
      bgPrimary: "bg-white",
      textSecondary: "text-gray-600",
    },
  },
}));

import { NotificationItem } from "../NotificationItem";

const baseNotification = {
  id: "notif-1",
  userId: "user-1",
  type: "order_placed" as const,
  priority: "normal" as const,
  title: "Order Placed",
  message: "Your order has been placed",
  isRead: false,
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-01"),
};

describe("NotificationItem", () => {
  it("renders title using Text component", () => {
    render(
      <NotificationItem
        notification={baseNotification}
        onMarkRead={jest.fn()}
        onDelete={jest.fn()}
      />,
    );
    expect(screen.getByText("Order Placed")).toBeInTheDocument();
  });

  it("renders message text", () => {
    render(
      <NotificationItem
        notification={baseNotification}
        onMarkRead={jest.fn()}
        onDelete={jest.fn()}
      />,
    );
    expect(screen.getByText("Your order has been placed")).toBeInTheDocument();
  });

  it("renders relative time", () => {
    render(
      <NotificationItem
        notification={baseNotification}
        onMarkRead={jest.fn()}
        onDelete={jest.fn()}
      />,
    );
    expect(screen.getByText("3 hours ago")).toBeInTheDocument();
  });

  it("calls onMarkRead when mark-read button clicked", () => {
    const onMarkRead = jest.fn();
    render(
      <NotificationItem
        notification={baseNotification}
        onMarkRead={onMarkRead}
        onDelete={jest.fn()}
      />,
    );
    const markReadBtn = screen.getByTitle("markRead");
    fireEvent.click(markReadBtn);
    expect(onMarkRead).toHaveBeenCalledWith("notif-1");
  });
});
