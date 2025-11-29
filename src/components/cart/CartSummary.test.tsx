import { render, screen, fireEvent } from "@testing-library/react";
import { CartSummary } from "./CartSummary";

describe("CartSummary", () => {
  it("renders order summary and totals", () => {
    render(
      <CartSummary
        subtotal={1000}
        shipping={50}
        tax={100}
        discount={100}
        total={1050}
        itemCount={2}
      />,
    );
    expect(screen.getByText(/Order Summary/i)).toBeInTheDocument();
    expect(screen.getByText(/Subtotal/i)).toBeInTheDocument();
    expect(screen.getByText(/₹1,050/)).toBeInTheDocument();
  });

  it("calls onApplyCoupon when coupon is applied", async () => {
    const mockApply = jest.fn().mockResolvedValue(undefined);
    render(
      <CartSummary
        subtotal={1000}
        shipping={50}
        tax={100}
        discount={100}
        total={1050}
        itemCount={2}
        onApplyCoupon={mockApply}
      />,
    );
    fireEvent.change(screen.getByPlaceholderText(/Enter code/i), {
      target: { value: "SAVE10" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Apply/i }));
    expect(mockApply).toHaveBeenCalledWith("SAVE10");
  });

  it("calls onCheckout when checkout button clicked", () => {
    const mockCheckout = jest.fn();
    render(
      <CartSummary
        subtotal={1000}
        shipping={50}
        tax={100}
        discount={100}
        total={1050}
        itemCount={2}
        onCheckout={mockCheckout}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /Checkout/i }));
    expect(mockCheckout).toHaveBeenCalled();
  });
});
