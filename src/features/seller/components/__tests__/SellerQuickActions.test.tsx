/**
 * SellerQuickActions tests
 * TASK-36: verifies UI_LABELS → useTranslations migration
 */
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import type React from "react";

const mockPush = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

jest.mock("@/components/ui", () => ({
  Card: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <div data-testid="card" className={className}>
      {children}
    </div>
  ),
  Button: ({
    children,
    onClick,
    variant,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    variant?: string;
  }) => (
    <button onClick={onClick} data-variant={variant}>
      {children}
    </button>
  ),
}));

jest.mock("@/components/typography", () => ({
  Heading: ({ children }: { children: React.ReactNode }) => <h4>{children}</h4>,
}));

jest.mock("@/constants", () => ({
  ROUTES: {
    SELLER: {
      DASHBOARD: "/seller",
      PRODUCTS: "/seller/products",
      PRODUCTS_NEW: "/seller/products/new",
      ORDERS: "/seller/orders",
      AUCTIONS: "/seller/auctions",
    },
  },
}));

import { SellerQuickActions } from "../SellerQuickActions";

describe("SellerQuickActions", () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it("renders the quick actions heading", () => {
    render(<SellerQuickActions />);
    expect(screen.getByText("quickActions")).toBeInTheDocument();
  });

  it("renders all 4 action buttons", () => {
    render(<SellerQuickActions />);
    expect(screen.getByText("addProduct")).toBeInTheDocument();
    expect(screen.getByText("viewProducts")).toBeInTheDocument();
    expect(screen.getByText("viewAuctions")).toBeInTheDocument();
    expect(screen.getByText("viewSales")).toBeInTheDocument();
  });

  it("navigates to products/new on Add New Listing click", () => {
    render(<SellerQuickActions />);
    fireEvent.click(screen.getByText("addProduct").closest("button")!);
    expect(mockPush).toHaveBeenCalledWith("/seller/products/new");
  });

  it("navigates to products on View All Products click", () => {
    render(<SellerQuickActions />);
    fireEvent.click(screen.getByText("viewProducts").closest("button")!);
    expect(mockPush).toHaveBeenCalledWith("/seller/products");
  });

  it("navigates to auctions on View Auctions click", () => {
    render(<SellerQuickActions />);
    fireEvent.click(screen.getByText("viewAuctions").closest("button")!);
    expect(mockPush).toHaveBeenCalledWith("/seller/auctions");
  });

  it("navigates to orders on View Sales click", () => {
    render(<SellerQuickActions />);
    fireEvent.click(screen.getByText("viewSales").closest("button")!);
    expect(mockPush).toHaveBeenCalledWith("/seller/orders");
  });
});
