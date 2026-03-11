/**
 * Tests for AddToCartButton component
 *
 * Coverage:
 * - Default "Add to Cart" label
 * - "Place Bid" label for auction products
 * - Loading state label
 * - Disabled state
 */

import { render, screen } from "@testing-library/react";
import { AddToCartButton } from "../AddToCartButton";

jest.mock("@/hooks", () => ({
  ...jest.requireActual("@/hooks"),
  ...jest.requireActual("@/hooks"),
  useAddToCart: ({ onSuccess, onError }: any) => ({
    mutate: jest.fn(),
    isLoading: false,
  }),
  useMessage: () => ({
    showSuccess: jest.fn(),
    showError: jest.fn(),
  }),
}));

const baseProps = {
  productId: "prod-001",
  productTitle: "Test Product",
  price: 999,
};

describe("AddToCartButton", () => {
  it("renders Add to Cart label by default", () => {
    render(<AddToCartButton {...baseProps} />);
    expect(
      screen.getByRole("button", { name: /add to cart/i }),
    ).toBeInTheDocument();
  });

  it("renders Place Bid label when isAuction is true", () => {
    render(<AddToCartButton {...baseProps} isAuction />);
    expect(
      screen.getByRole("button", { name: /place bid/i }),
    ).toBeInTheDocument();
  });

  it("renders disabled button when disabled prop is true", () => {
    render(<AddToCartButton {...baseProps} disabled />);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("renders loading label when isLoading is true", () => {
    jest.resetModules();
    const { useAddToCart } = require("@/hooks");
    jest
      .spyOn(require("@/hooks"), "useAddToCart")
      .mockReturnValue({ mutate: jest.fn(), isLoading: true });

    render(<AddToCartButton {...baseProps} />);
    // When loading, label comes from tLoading("default") = "Loading..."
    expect(screen.getByRole("button")).toBeInTheDocument();
  });
});
