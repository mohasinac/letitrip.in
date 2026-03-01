import React from "react";
import { render, screen } from "@testing-library/react";
import { CartView } from "../CartView";

jest.mock("@/hooks", () => ({
  useApiQuery: () => ({ data: undefined, isLoading: true, refetch: jest.fn() }),
  useApiMutation: () => ({ mutate: jest.fn() }),
  useMessage: () => ({ showError: jest.fn(), showSuccess: jest.fn() }),
}));

jest.mock("@/services", () => ({
  cartService: { get: jest.fn(), updateItem: jest.fn(), removeItem: jest.fn() },
}));

jest.mock("@/components", () => ({
  CartItemList: () => <div data-testid="cart-items" />,
  CartSummary: () => <div data-testid="cart-summary" />,
  PromoCodeInput: () => <div data-testid="promo-input" />,
}));

jest.mock("@/constants", () => ({
  ROUTES: { USER: { CHECKOUT: "/checkout" } },
  THEME_CONSTANTS: {
    themed: {
      bgSecondary: "bg-gray-50",
      bgPrimary: "bg-white",
      textPrimary: "text-gray-900",
      border: "border-gray-200",
    },
    spacing: { stack: "space-y-4" },
    typography: { h2: "text-2xl font-bold" },
  },
  ERROR_MESSAGES: {
    CART: { UPDATE_FAILED: "Update failed", REMOVE_FAILED: "Remove failed" },
  },
  SUCCESS_MESSAGES: { CART: { ITEM_REMOVED: "Item removed" } },
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
}));
jest.mock("next-intl", () => ({ useTranslations: () => (key: string) => key }));

describe("CartView", () => {
  it("shows loading skeleton while fetching", () => {
    const { container } = render(<CartView />);
    expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
  });
});
