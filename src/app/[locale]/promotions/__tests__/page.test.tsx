import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import type React from "react";
import PromotionsPage from "../page";

const mockUseApiQuery = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/promotions",
}));

jest.mock("@/hooks", () => ({
  useApiQuery: (...args: any[]) => mockUseApiQuery(...args),
}));

jest.mock("@/lib/api-client", () => ({
  apiClient: { get: jest.fn().mockResolvedValue({}) },
}));

jest.mock("@/components", () => ({
  Spinner: () => <div data-testid="spinner" />,
  CouponCard: ({ coupon }: { coupon: any }) => (
    <div data-testid={`coupon-${coupon.id}`}>{coupon.code}</div>
  ),
  ProductSection: ({ title, products }: { title: string; products: any[] }) => (
    <div data-testid="product-section" aria-label={title}>
      <h2>{title}</h2>
      {products.map((p: any) => (
        <div key={p.id} data-testid={`promo-product-${p.id}`}>
          {p.title}
        </div>
      ))}
    </div>
  ),
}));

jest.mock("@/constants", () => ({
  UI_LABELS: {
    LOADING: { FAILED: "Failed to load" },
    PROMOTIONS_PAGE: {
      TITLE: "Promotions & Deals",
      SUBTITLE: "Best deals for you",
      FEATURED_TITLE: "Featured Products",
      PROMOTED_TITLE: "Promoted Products",
      COUPONS_TITLE: "Active Coupons",
      EMPTY_DEALS: "No Promotions Active",
      CHECK_BACK: "Check back later",
      DEALS_TITLE: "Exclusive Deals",
      DEALS_SUBTITLE: "Hot deals right now",
      FEATURED_SUBTITLE: "Staff picks",
      COUPONS_SUBTITLE: "Use these codes at checkout",
      EMPTY_COUPONS: "No coupons right now",
      LOADING: "Loading...",
    },
  },
  API_ENDPOINTS: {
    PROMOTIONS: { LIST: "/api/promotions" },
  },
  THEME_CONSTANTS: {
    themed: {
      bgPrimary: "bg-white",
      textPrimary: "text-gray-900",
      textSecondary: "text-gray-600",
    },
    typography: { h2: "text-3xl font-bold" },
    spacing: { stack: "space-y-8", padding: { lg: "p-6" } },
  },
}));

describe("PromotionsPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseApiQuery.mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    });
  });

  it("renders loading spinner when fetching", () => {
    mockUseApiQuery.mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
    });
    render(<PromotionsPage />);
    expect(screen.getByTestId("spinner")).toBeInTheDocument();
  });

  it("renders promotion cards when promotions are returned by API", () => {
    const mockProduct = (id: string) => ({
      id,
      title: `Product ${id}`,
      price: 100,
      currency: "INR",
      mainImage: "",
      status: "published",
      featured: true,
      isPromoted: true,
    });
    mockUseApiQuery.mockReturnValue({
      data: {
        promotedProducts: [mockProduct("p1")],
        featuredProducts: [mockProduct("p2")],
        activeCoupons: [
          { id: "c1", code: "SAVE10", discount: 10, type: "percentage" },
        ],
      },
      isLoading: false,
      error: null,
    });
    render(<PromotionsPage />);
    expect(screen.getAllByTestId("product-section").length).toBeGreaterThan(0);
    expect(screen.getByTestId("coupon-c1")).toBeInTheDocument();
    expect(screen.getByText("SAVE10")).toBeInTheDocument();
  });

  it("renders EmptyState when no promotions are active", () => {
    mockUseApiQuery.mockReturnValue({
      data: {
        promotedProducts: [],
        featuredProducts: [],
        activeCoupons: [],
      },
      isLoading: false,
      error: null,
    });
    render(<PromotionsPage />);
    expect(screen.getByText("No Promotions Active")).toBeInTheDocument();
  });
});
