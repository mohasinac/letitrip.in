/**
 * StoreAboutView Tests
 *
 * Covers:
 * - Loading state shows Spinner
 * - Error / not-found state shows EmptyState
 * - Store name and description are rendered
 * - Website is rendered as a TextLink (not raw <a>)
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

jest.mock("lucide-react", () => ({
  Globe: () => <span data-testid="globe-icon" />,
  MapPin: () => <span data-testid="map-pin-icon" />,
  Store: () => <span data-testid="store-icon" />,
}));

jest.mock("@/utils", () => ({
  formatDate: jest.fn(() => "Jan 1, 2025"),
}));

jest.mock("@/components", () => ({
  Card: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => <div className={className}>{children}</div>,
  Heading: ({
    children,
    level,
  }: {
    children: React.ReactNode;
    level?: number;
  }) => <h2 data-testid={`heading-${level ?? 2}`}>{children}</h2>,
  Text: ({
    children,
    variant,
  }: {
    children: React.ReactNode;
    variant?: string;
  }) => (
    <p data-testid="text" data-variant={variant}>
      {children}
    </p>
  ),
  EmptyState: ({ title }: { title: string }) => (
    <div data-testid="empty-state">{title}</div>
  ),
  Spinner: () => <div data-testid="spinner" />,
  TextLink: ({
    href,
    children,
    className,
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

jest.mock("@/constants", () => ({
  THEME_CONSTANTS: {
    spacing: { stack: "space-y-4" },
    themed: {
      textPrimary: "text-gray-900",
      textSecondary: "text-gray-600",
    },
    flex: { hCenter: "flex justify-center" },
    page: { empty: "py-16" },
  },
}));

const mockUseStoreBySlug = jest.fn();
jest.mock("../../hooks", () => ({
  useStoreBySlug: (...args: unknown[]) => mockUseStoreBySlug(...args),
}));

import { StoreAboutView } from "../StoreAboutView";

const baseStore = {
  storeName: "Test Shop",
  displayName: "Seller Name",
  storeDescription: "A great place to shop",
  storeCategory: null,
  bio: null,
  location: null,
  website: null,
  createdAt: null,
};

describe("StoreAboutView", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("shows spinner while loading", () => {
    mockUseStoreBySlug.mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
    });
    render(<StoreAboutView storeSlug="test-shop" />);
    expect(screen.getByTestId("spinner")).toBeInTheDocument();
  });

  it("shows empty state on fetch error", () => {
    mockUseStoreBySlug.mockReturnValue({
      data: null,
      isLoading: false,
      error: new Error("not found"),
    });
    render(<StoreAboutView storeSlug="test-shop" />);
    expect(screen.getByTestId("empty-state")).toBeInTheDocument();
  });

  it("shows empty state when store is null", () => {
    mockUseStoreBySlug.mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    });
    render(<StoreAboutView storeSlug="test-shop" />);
    expect(screen.getByTestId("empty-state")).toBeInTheDocument();
  });

  it("renders store name", () => {
    mockUseStoreBySlug.mockReturnValue({
      data: baseStore,
      isLoading: false,
      error: null,
    });
    render(<StoreAboutView storeSlug="test-shop" />);
    expect(screen.getByText("Test Shop")).toBeInTheDocument();
  });

  it("renders store description when provided", () => {
    mockUseStoreBySlug.mockReturnValue({
      data: baseStore,
      isLoading: false,
      error: null,
    });
    render(<StoreAboutView storeSlug="test-shop" />);
    expect(screen.getByText("A great place to shop")).toBeInTheDocument();
  });

  it("renders website as a TextLink (anchor with href)", () => {
    mockUseStoreBySlug.mockReturnValue({
      data: { ...baseStore, website: "https://testshop.com" },
      isLoading: false,
      error: null,
    });
    render(<StoreAboutView storeSlug="test-shop" />);
    const link = screen.getByRole("link", { name: "https://testshop.com" });
    expect(link).toHaveAttribute("href", "https://testshop.com");
  });

  it("does not render website section when website is absent", () => {
    mockUseStoreBySlug.mockReturnValue({
      data: baseStore,
      isLoading: false,
      error: null,
    });
    render(<StoreAboutView storeSlug="test-shop" />);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});
