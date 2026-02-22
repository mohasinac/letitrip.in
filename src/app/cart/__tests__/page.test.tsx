import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import type React from "react";
import CartPage from "../page";
import { UI_LABELS, ROUTES } from "@/constants";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/cart",
}));

const mockUseApiQuery = jest.fn(() => ({
  data: null,
  isLoading: false,
  error: null,
  refetch: jest.fn(),
}));

jest.mock("@/hooks", () => ({
  useApiQuery: (...args: any[]) => mockUseApiQuery(...args),
  useApiMutation: () => ({ mutate: jest.fn(), isLoading: false }),
  useMessage: () => ({ showError: jest.fn(), showSuccess: jest.fn() }),
}));

jest.mock("@/lib/api-client", () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock("@/constants", () => ({
  UI_LABELS: {
    CART: {
      TITLE: "Shopping Cart",
      EMPTY: "Your cart is empty",
      EMPTY_SUBTITLE: "Browse products and add items to your cart",
      START_SHOPPING: "Start Shopping",
      ITEM_COUNT: (n: number) => `${n} item${n !== 1 ? "s" : ""}`,
      REMOVE: "Remove",
      QUANTITY: "Qty",
      PRICE: "Price",
      SUBTOTAL: "Subtotal",
      PROMO_CODE: "Promo Code",
      PROMO_APPLY: "Apply",
      ORDER_SUMMARY: "Order Summary",
      TOTAL: "Total",
      CHECKOUT: "Proceed to Checkout",
      CONTINUE_SHOPPING: "Continue Shopping",
    },
    LOADING: { DEFAULT: "Loading..." },
    ACTIONS: { REMOVE: "Remove" },
  },
  ROUTES: {
    PUBLIC: { PRODUCTS: "/products" },
    CHECKOUT: { CHECKOUT: "/checkout" },
  },
  THEME_CONSTANTS: {
    themed: {
      bgPrimary: "bg-white",
      bgSecondary: "bg-gray-50",
      textPrimary: "text-gray-900",
      textSecondary: "text-gray-600",
      border: "border-gray-200",
    },
    spacing: {
      stack: "space-y-4",
      padding: { lg: "p-6", md: "p-4" },
      gap: { md: "gap-4" },
    },
    typography: {
      h1: "text-3xl font-bold",
      h2: "text-2xl font-bold",
      h4: "text-xl font-bold",
    },
    borderRadius: { xl: "rounded-xl" },
  },
  API_ENDPOINTS: {
    CART: { GET: "/api/cart" },
    COUPONS: { VALIDATE: "/api/coupons/validate" },
  },
  ERROR_MESSAGES: { GENERIC: { INTERNAL_ERROR: "Something went wrong" } },
  SUCCESS_MESSAGES: { CART: { ITEM_REMOVED: "Item removed" } },
}));

jest.mock("@/components", () => ({
  CartItemList: ({ items }: any) => (
    <div data-testid="cart-item-list">
      {items?.map((item: any) => (
        <div key={item.id} data-testid="cart-item">
          {item.productTitle}
        </div>
      ))}
    </div>
  ),
  CartSummary: ({ subtotal, total }: any) => (
    <div data-testid="cart-summary">
      <span data-testid="subtotal">{subtotal}</span>
      <span data-testid="total">{total}</span>
    </div>
  ),
  PromoCodeInput: ({ onApply }: any) => (
    <div data-testid="promo-code-input">
      <button onClick={() => onApply?.("SAVE10")}>Apply Code</button>
    </div>
  ),
  EmptyState: ({ title, description, actionHref }: any) => (
    <div data-testid="empty-state">
      <p>{title}</p>
      <p>{description}</p>
      {actionHref && (
        <a href={actionHref} data-testid="empty-state-cta">
          Shop Now
        </a>
      )}
    </div>
  ),
  Button: ({ children, onClick, href }: any) => (
    <button onClick={onClick} data-href={href}>
      {children}
    </button>
  ),
}));

describe("Cart Page", () => {
  beforeEach(() => jest.clearAllMocks());

  it("renders loading skeleton when isLoading=true", () => {
    mockUseApiQuery.mockReturnValueOnce({
      data: null,
      isLoading: true,
      error: null,
      refetch: jest.fn(),
    });
    const { container } = render(<CartPage />);
    expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
  });

  it("renders CartItemList (which handles its own empty state) when cart is empty", () => {
    mockUseApiQuery.mockReturnValueOnce({
      data: { cart: { items: [] }, itemCount: 0, subtotal: 0 },
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });
    render(<CartPage />);
    // Cart page always renders CartItemList (empty state is handled inside CartItemList)
    expect(screen.getByTestId("cart-item-list")).toBeInTheDocument();
    // No cart items should be inside it
    expect(screen.queryByTestId("cart-item")).not.toBeInTheDocument();
  });

  it("renders cart item list when items exist", () => {
    mockUseApiQuery.mockReturnValueOnce({
      data: {
        cart: {
          items: [
            {
              id: "item1",
              productId: "p1",
              productTitle: "Test Product",
              quantity: 1,
              price: 100,
              mainImage: null,
            },
          ],
        },
        itemCount: 1,
        subtotal: 100,
      },
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });
    render(<CartPage />);
    expect(screen.getByTestId("cart-item-list")).toBeInTheDocument();
    expect(screen.getByText("Test Product")).toBeInTheDocument();
  });

  it("renders CartSummary when items exist", () => {
    mockUseApiQuery.mockReturnValueOnce({
      data: {
        cart: {
          items: [
            {
              id: "i1",
              productId: "p1",
              productTitle: "P",
              quantity: 1,
              price: 200,
            },
          ],
        },
        itemCount: 1,
        subtotal: 200,
      },
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });
    render(<CartPage />);
    expect(screen.getByTestId("cart-summary")).toBeInTheDocument();
  });

  it("renders PromoCodeInput when items exist", () => {
    mockUseApiQuery.mockReturnValueOnce({
      data: {
        cart: {
          items: [
            {
              id: "i1",
              productId: "p1",
              productTitle: "P",
              quantity: 1,
              price: 200,
            },
          ],
        },
        itemCount: 1,
        subtotal: 200,
      },
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });
    render(<CartPage />);
    expect(screen.getByTestId("promo-code-input")).toBeInTheDocument();
  });
});
