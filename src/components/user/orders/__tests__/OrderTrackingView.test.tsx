import { render, screen } from "@testing-library/react";
import React from "react";

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn() }),
}));

jest.mock("@/utils", () => ({
  formatDate: (d: unknown) => String(d),
  formatRelativeTime: (d: unknown) => String(d),
}));

jest.mock("@/components", () => ({
  Card: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => <div className={className}>{children}</div>,
  Button: ({
    children,
    onClick,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
  }) => <button onClick={onClick}>{children}</button>,
  Heading: ({
    children,
    level,
  }: {
    children: React.ReactNode;
    level?: number;
  }) => React.createElement(`h${level ?? 2}`, {}, children),
  Text: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
  Caption: ({ children }: { children: React.ReactNode }) => (
    <span>{children}</span>
  ),
}));

jest.mock("@/constants", () => ({
  ROUTES: { PUBLIC: { PRODUCTS: "/products" } },
  THEME_CONSTANTS: {
    themed: {
      bgPrimary: "",
      bgSecondary: "",
      textPrimary: "",
      textSecondary: "",
      border: "",
    },
    spacing: { cardPadding: "p-4" },
  },
}));

import { OrderTrackingView } from "../OrderTrackingView";

describe("OrderTrackingView", () => {
  it("renders trackTitle as an h1 heading", () => {
    const mockOrder = {
      id: "order-abc-123",
      productId: "prod-1",
      productTitle: "Test Product",
      userId: "user-1",
      userName: "Test User",
      userEmail: "test@example.com",
      quantity: 1,
      unitPrice: 100,
      totalPrice: 100,
      currency: "INR",
      status: "delivered" as const,
      paymentStatus: "paid" as const,
      orderDate: new Date("2026-01-01"),
      trackingNumber: "TRK123456",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    render(<OrderTrackingView order={mockOrder} orderId="order-abc-123" />);

    const h1 = screen.getByRole("heading", { level: 1 });
    expect(h1).toHaveTextContent("trackTitle");
  });

  it("renders trackSubtitle as an h2 heading", () => {
    const mockOrder = {
      id: "order-xyz-456",
      productId: "prod-2",
      productTitle: "Another Product",
      userId: "user-1",
      userName: "Test User",
      userEmail: "test@example.com",
      quantity: 1,
      unitPrice: 200,
      totalPrice: 200,
      currency: "INR",
      status: "shipped" as const,
      paymentStatus: "paid" as const,
      orderDate: new Date("2026-01-01"),
      trackingNumber: undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    render(<OrderTrackingView order={mockOrder} orderId="order-xyz-456" />);

    const h2 = screen.getByRole("heading", { level: 2 });
    expect(h2).toHaveTextContent("trackSubtitle");
  });
});
