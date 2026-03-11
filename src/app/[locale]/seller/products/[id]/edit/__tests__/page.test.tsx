/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import type React from "react";
import SellerEditProductPage from "../page";

jest.mock("react", () => {
  const actual = jest.requireActual("react");
  return {
    ...actual,
    use: (val: any) => {
      if (val && typeof val.then === "function") return { id: "prod-1" };
      return val;
    },
  };
});

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
}));

jest.mock("@/hooks", () => ({
  ...jest.requireActual("@/hooks"),
  useAuth: jest.fn(() => ({ user: { uid: "seller-1" }, loading: false })),
  useApiQuery: jest.fn(() => ({ data: null, isLoading: false })),
  useMessage: () => ({ showSuccess: jest.fn(), showError: jest.fn() }),
}));

jest.mock("@/services", () => ({
  productService: { getById: jest.fn(), update: jest.fn() },
}));

jest.mock("@/components", () => ({
  Card: ({ children }: any) => <div data-testid="card">{children}</div>,
  Button: ({ children, onClick, disabled }: any) => (
    <button onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
  Spinner: () => <div data-testid="spinner" />,
  Alert: ({ children }: any) => <div data-testid="alert">{children}</div>,
  AdminPageHeader: ({ title }: any) => (
    <div data-testid="admin-page-header">{title}</div>
  ),
  ProductForm: () => <div data-testid="product-form" />,
}));

jest.mock("@/constants", () => ({
  ROUTES: {
    AUTH: { LOGIN: "/auth/login" },
    SELLER: { PRODUCTS: "/seller/products" },
  },
  THEME_CONSTANTS: {
    spacing: {
      stack: "space-y-4",
      padding: { lg: "p-6", md: "p-4" },
      gap: { md: "gap-4" },
    },
  },
  SUCCESS_MESSAGES: { PRODUCT: { UPDATED: "Product updated successfully" } },
  ERROR_MESSAGES: {
    PRODUCT: {
      NOT_FOUND: "Product not found",
      UPDATE_NOT_ALLOWED: "Not allowed",
      UPDATE_FAILED: "Update failed",
    },
  },
}));

const { useAuth, useApiQuery } = require("@/hooks");

describe("Seller Edit Product Page (/seller/products/[id]/edit)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({
      user: { uid: "seller-1" },
      loading: false,
    });
  });

  it("renders without crashing", () => {
    expect(() =>
      render(
        <SellerEditProductPage params={Promise.resolve({ id: "prod-1" })} />,
      ),
    ).not.toThrow();
  });

  it("shows loading spinner while product is loading", () => {
    (useApiQuery as jest.Mock).mockReturnValue({ data: null, isLoading: true });
    render(
      <SellerEditProductPage params={Promise.resolve({ id: "prod-1" })} />,
    );
    expect(screen.getByTestId("spinner")).toBeInTheDocument();
  });

  it("shows error when product not found", () => {
    (useApiQuery as jest.Mock).mockReturnValue({
      data: null,
      isLoading: false,
    });
    render(
      <SellerEditProductPage params={Promise.resolve({ id: "prod-1" })} />,
    );
    expect(screen.getByTestId("alert")).toBeInTheDocument();
  });

  it("renders product form when product is owned by seller", () => {
    (useApiQuery as jest.Mock).mockReturnValue({
      data: {
        id: "prod-1",
        title: "Test Product",
        price: 100,
        sellerId: "seller-1",
        status: "published",
      },
      isLoading: false,
    });
    render(
      <SellerEditProductPage params={Promise.resolve({ id: "prod-1" })} />,
    );
    expect(screen.getByTestId("product-form")).toBeInTheDocument();
  });
});
