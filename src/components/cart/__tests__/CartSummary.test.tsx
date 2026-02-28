import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CartSummary } from "../CartSummary";

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string, params?: Record<string, unknown>) => {
    if (params) return JSON.stringify({ key, ...params });
    return key;
  },
}));
jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));
jest.mock("@/utils", () => ({
  formatCurrency: (amount: number) => `₹${amount}`,
}));

const defaultProps = {
  subtotal: 5000,
  itemCount: 2,
  onCheckout: jest.fn(),
};

describe("CartSummary", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders order summary heading", () => {
    render(<CartSummary {...defaultProps} />);
    expect(screen.getByText("orderSummary")).toBeInTheDocument();
  });

  it("renders total label", () => {
    render(<CartSummary {...defaultProps} />);
    expect(screen.getByText("total")).toBeInTheDocument();
  });

  it("renders checkout button with translation key", () => {
    render(<CartSummary {...defaultProps} />);
    expect(screen.getByText("checkout")).toBeInTheDocument();
  });

  it("renders continue shopping link", () => {
    render(<CartSummary {...defaultProps} />);
    expect(screen.getByText(/continueShopping/)).toBeInTheDocument();
  });

  it("shows loading state when isCheckingOut is true", () => {
    render(<CartSummary {...defaultProps} isCheckingOut />);
    expect(screen.getByText("default")).toBeInTheDocument();
  });

  it("shows discount row when discount > 0 and couponCode provided", () => {
    render(
      <CartSummary {...defaultProps} discount={500} couponCode="SAVE10" />,
    );
    expect(screen.getByText(/discount/)).toBeInTheDocument();
    expect(screen.getByText(/SAVE10/)).toBeInTheDocument();
  });

  it("calls onCheckout when checkout button clicked", async () => {
    const onCheckout = jest.fn();
    render(<CartSummary {...defaultProps} onCheckout={onCheckout} />);
    await userEvent.click(screen.getByText("checkout"));
    expect(onCheckout).toHaveBeenCalledTimes(1);
  });

  it("disables checkout button when itemCount is 0", () => {
    render(<CartSummary {...defaultProps} itemCount={0} />);
    const button = screen.getByText("checkout").closest("button");
    expect(button).toBeDisabled();
  });
});
