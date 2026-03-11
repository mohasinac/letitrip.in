import React from "react";
import { render, screen } from "@testing-library/react";
import { SellerEditProductView } from "../SellerEditProductView";

jest.mock("@/hooks", () => ({
  ...jest.requireActual("@/hooks"),
  ...jest.requireActual("@/hooks"),
  useAuth: () => ({ user: null, loading: true }),
  useApiQuery: () => ({ data: null, isLoading: true, error: null }),
  useMessage: () => ({ showSuccess: jest.fn(), showError: jest.fn() }),
}));
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
}));
jest.mock("next-intl", () => ({ useTranslations: () => (key: string) => key }));
jest.mock("@/services", () => ({
  productService: { getById: jest.fn(), update: jest.fn() },
}));
jest.mock("@/components", () => ({
  Card: ({ children }: any) => <div>{children}</div>,
  Button: ({ children, onClick, disabled }: any) => (
    <button onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
  Spinner: () => <div data-testid="spinner" />,
  Alert: ({ children }: any) => <div role="alert">{children}</div>,
  AdminPageHeader: ({ title }: any) => <h1>{title}</h1>,
  ProductForm: () => <div data-testid="product-form" />,
}));
jest.mock("@/constants", () => ({
  ROUTES: {
    AUTH: { LOGIN: "/login" },
    SELLER: { PRODUCTS: "/seller/products" },
  },
  THEME_CONSTANTS: { spacing: { stack: "space-y-4" } },
  SUCCESS_MESSAGES: { PRODUCT: { UPDATED: "ok" } },
  ERROR_MESSAGES: {
    PRODUCT: { NOT_FOUND: "not found", UPDATE_NOT_ALLOWED: "not allowed" },
  },
}));

describe("SellerEditProductView", () => {
  it("shows spinner while loading", () => {
    render(<SellerEditProductView id="prod-001" />);
    expect(screen.getByTestId("spinner")).toBeInTheDocument();
  });
});
