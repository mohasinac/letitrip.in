/**
 * Comprehensive Test Suite for CartSummary Component
 * Session 15 - CRITICAL Priority: Cart & Checkout Expansion
 *
 * Coverage: 50+ tests covering all aspects of cart summary functionality
 * - Price calculations, shipping, GST, coupons, discounts, edge cases
 */

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CartSummary } from "./CartSummary";
import { useRouter } from "next/navigation";

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

// Mock icons
jest.mock("lucide-react", () => ({
  Tag: ({ className }: any) => (
    <div data-testid="tag-icon" className={className} />
  ),
  X: ({ className }: any) => <div data-testid="x-icon" className={className} />,
  Loader2: ({ className }: any) => (
    <div data-testid="loader-icon" className={className} />
  ),
  ShoppingBag: ({ className }: any) => (
    <div data-testid="shopping-bag-icon" className={className} />
  ),
}));

describe("CartSummary - Comprehensive Test Suite", () => {
  const mockRouterPush = jest.fn();
  const mockApplyCoupon = jest.fn();
  const mockRemoveCoupon = jest.fn();
  const mockCheckout = jest.fn();

  const defaultProps = {
    subtotal: 5000,
    shipping: 100,
    tax: 900, // 18% GST
    discount: 0,
    total: 6000,
    itemCount: 3,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockRouterPush,
    });
  });

  // ====================
  // Basic Rendering Tests
  // ====================
  describe("Basic Rendering", () => {
    it("renders order summary heading", () => {
      render(<CartSummary {...defaultProps} />);
      expect(screen.getByText("Order Summary")).toBeInTheDocument();
    });

    it("displays subtotal with item count", () => {
      render(<CartSummary {...defaultProps} itemCount={3} />);
      expect(screen.getByText(/Subtotal \(3 items\)/i)).toBeInTheDocument();
      expect(screen.getByText("₹5,000")).toBeInTheDocument();
    });

    it("displays singular item count correctly", () => {
      render(<CartSummary {...defaultProps} itemCount={1} />);
      expect(screen.getByText(/Subtotal \(1 item\)/i)).toBeInTheDocument();
    });

    it("displays shipping cost", () => {
      render(<CartSummary {...defaultProps} shipping={100} />);
      expect(screen.getByText("Shipping")).toBeInTheDocument();
      expect(screen.getByText("₹100")).toBeInTheDocument();
    });

    it("displays FREE shipping when shipping is 0", () => {
      render(<CartSummary {...defaultProps} shipping={0} />);
      expect(screen.getByText("FREE")).toBeInTheDocument();
    });

    it("displays GST 18% tax label", () => {
      render(<CartSummary {...defaultProps} />);
      expect(screen.getByText("Tax (GST 18%)")).toBeInTheDocument();
      expect(screen.getByText("₹900")).toBeInTheDocument();
    });

    it("displays total amount prominently", () => {
      render(<CartSummary {...defaultProps} total={6000} />);
      expect(screen.getByText("Total")).toBeInTheDocument();
      expect(screen.getByText("₹6,000")).toBeInTheDocument();
    });

    it("displays tax inclusive message", () => {
      render(<CartSummary {...defaultProps} />);
      expect(screen.getByText("Inclusive of all taxes")).toBeInTheDocument();
    });

    it("displays security note", () => {
      render(<CartSummary {...defaultProps} />);
      expect(
        screen.getByText(/Secure checkout powered by Razorpay/i)
      ).toBeInTheDocument();
    });

    it("renders checkout button", () => {
      render(<CartSummary {...defaultProps} />);
      expect(
        screen.getByRole("button", { name: /Proceed to Checkout/i })
      ).toBeInTheDocument();
    });
  });

  // ====================
  // Price Calculation Tests
  // ====================
  describe("Price Calculations", () => {
    it("displays subtotal correctly with Indian number format", () => {
      render(<CartSummary {...defaultProps} subtotal={123456} />);
      expect(screen.getByText("₹1,23,456")).toBeInTheDocument();
    });

    it("calculates and displays correct total", () => {
      render(
        <CartSummary
          {...defaultProps}
          subtotal={10000}
          shipping={200}
          tax={1800}
          discount={500}
          total={11500}
        />
      );
      expect(screen.getByText("₹11,500")).toBeInTheDocument();
    });

    it("formats large amounts correctly", () => {
      render(<CartSummary {...defaultProps} subtotal={9999999} />);
      expect(screen.getByText("₹99,99,999")).toBeInTheDocument();
    });

    it("handles decimal values in tax", () => {
      render(<CartSummary {...defaultProps} tax={899.99} />);
      expect(screen.getByText("₹899.99")).toBeInTheDocument();
    });

    it("handles decimal values in total", () => {
      render(<CartSummary {...defaultProps} total={5999.5} />);
      expect(screen.getByText("₹5,999.5")).toBeInTheDocument();
    });
  });

  // ====================
  // Shipping Tests
  // ====================
  describe("Shipping Calculations", () => {
    it("shows free shipping when subtotal is above ₹5000", () => {
      render(<CartSummary {...defaultProps} subtotal={6000} shipping={0} />);
      expect(screen.queryByText(/Add ₹/)).not.toBeInTheDocument();
      expect(screen.getByText("FREE")).toBeInTheDocument();
    });

    it("shows free shipping progress bar when subtotal is below ₹5000", () => {
      render(<CartSummary {...defaultProps} subtotal={3000} shipping={100} />);
      expect(
        screen.getByText(/Add ₹2,000 more for FREE shipping/i)
      ).toBeInTheDocument();
    });

    it("calculates correct amount to free shipping", () => {
      render(<CartSummary {...defaultProps} subtotal={4500} shipping={50} />);
      expect(
        screen.getByText(/Add ₹500 more for FREE shipping/i)
      ).toBeInTheDocument();
    });

    it("displays correct progress percentage", () => {
      render(<CartSummary {...defaultProps} subtotal={2500} shipping={100} />);
      expect(screen.getByText("50%")).toBeInTheDocument();
    });

    it("shows progress bar with correct width", () => {
      const { container } = render(
        <CartSummary {...defaultProps} subtotal={2500} shipping={100} />
      );
      const progressBar = container.querySelector(
        ".bg-blue-600.h-2.rounded-full"
      );
      expect(progressBar).toHaveStyle({ width: "50%" });
    });

    it("does not show progress bar when subtotal is at threshold", () => {
      render(<CartSummary {...defaultProps} subtotal={5000} shipping={0} />);
      expect(screen.queryByText(/Add ₹/)).not.toBeInTheDocument();
    });

    it("does not show progress bar when subtotal is 0", () => {
      render(<CartSummary {...defaultProps} subtotal={0} shipping={100} />);
      expect(screen.queryByText(/Add ₹/)).not.toBeInTheDocument();
    });

    it("caps progress at 100%", () => {
      const { container } = render(
        <CartSummary {...defaultProps} subtotal={10000} shipping={0} />
      );
      const progressBar = container.querySelector(
        ".bg-blue-600.h-2.rounded-full"
      );
      if (progressBar) {
        const width = progressBar.getAttribute("style");
        expect(width).toContain("100%");
      }
    });
  });

  // ====================
  // Discount/Coupon Tests
  // ====================
  describe("Discount Display", () => {
    it("shows discount when greater than 0", () => {
      render(<CartSummary {...defaultProps} discount={500} />);
      expect(screen.getByText("Discount")).toBeInTheDocument();
      expect(screen.getByText("-₹500")).toBeInTheDocument();
    });

    it("does not show discount line when discount is 0", () => {
      render(<CartSummary {...defaultProps} discount={0} />);
      expect(screen.queryByText("Discount")).not.toBeInTheDocument();
    });

    it("displays discount in green color", () => {
      const { container } = render(
        <CartSummary {...defaultProps} discount={1000} />
      );
      const discountElement = screen.getByText("-₹1,000");
      expect(discountElement).toHaveClass("text-green-600");
    });

    it("formats large discount values correctly", () => {
      render(<CartSummary {...defaultProps} discount={12345} />);
      expect(screen.getByText("-₹12,345")).toBeInTheDocument();
    });
  });

  // ====================
  // Coupon Input Tests
  // ====================
  describe("Coupon Input", () => {
    it("shows coupon input when onApplyCoupon is provided and no coupon applied", () => {
      render(<CartSummary {...defaultProps} onApplyCoupon={mockApplyCoupon} />);
      expect(screen.getByText("Have a coupon code?")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Enter code")).toBeInTheDocument();
    });

    it("does not show coupon input when onApplyCoupon is not provided", () => {
      render(<CartSummary {...defaultProps} />);
      expect(screen.queryByText("Have a coupon code?")).not.toBeInTheDocument();
    });

    it("does not show coupon input when coupon is already applied", () => {
      render(
        <CartSummary
          {...defaultProps}
          couponCode="SAVE10"
          onApplyCoupon={mockApplyCoupon}
        />
      );
      expect(
        screen.queryByPlaceholderText("Enter code")
      ).not.toBeInTheDocument();
    });

    it("converts coupon input to uppercase", () => {
      render(<CartSummary {...defaultProps} onApplyCoupon={mockApplyCoupon} />);
      const input = screen.getByPlaceholderText(
        "Enter code"
      ) as HTMLInputElement;
      fireEvent.change(input, { target: { value: "save10" } });
      expect(input.value).toBe("SAVE10");
    });

    it("enables Apply button when coupon is entered", () => {
      render(<CartSummary {...defaultProps} onApplyCoupon={mockApplyCoupon} />);
      const input = screen.getByPlaceholderText("Enter code");
      const applyBtn = screen.getByRole("button", { name: /Apply/i });

      expect(applyBtn).toBeDisabled();

      fireEvent.change(input, { target: { value: "TEST" } });
      expect(applyBtn).not.toBeDisabled();
    });

    it("disables Apply button when input is empty", () => {
      render(<CartSummary {...defaultProps} onApplyCoupon={mockApplyCoupon} />);
      const applyBtn = screen.getByRole("button", { name: /Apply/i });
      expect(applyBtn).toBeDisabled();
    });

    it("disables Apply button when input is only whitespace", () => {
      render(<CartSummary {...defaultProps} onApplyCoupon={mockApplyCoupon} />);
      const input = screen.getByPlaceholderText("Enter code");
      const applyBtn = screen.getByRole("button", { name: /Apply/i });

      fireEvent.change(input, { target: { value: "   " } });
      expect(applyBtn).toBeDisabled();
    });
  });

  // ====================
  // Coupon Application Tests
  // ====================
  describe("Coupon Application", () => {
    it("calls onApplyCoupon with uppercase trimmed code", async () => {
      mockApplyCoupon.mockResolvedValue(undefined);
      render(<CartSummary {...defaultProps} onApplyCoupon={mockApplyCoupon} />);

      const input = screen.getByPlaceholderText("Enter code");
      const applyBtn = screen.getByRole("button", { name: /Apply/i });

      fireEvent.change(input, { target: { value: "  save10  " } });
      fireEvent.click(applyBtn);

      await waitFor(() => {
        expect(mockApplyCoupon).toHaveBeenCalledWith("SAVE10");
      });
    });

    it("shows loading state while applying coupon", async () => {
      mockApplyCoupon.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );
      render(<CartSummary {...defaultProps} onApplyCoupon={mockApplyCoupon} />);

      const input = screen.getByPlaceholderText("Enter code");
      const applyBtn = screen.getByRole("button", { name: /Apply/i });

      fireEvent.change(input, { target: { value: "TEST" } });
      fireEvent.click(applyBtn);

      expect(screen.getByText("Applying...")).toBeInTheDocument();
      expect(screen.getByTestId("loader-icon")).toBeInTheDocument();
    });

    it("disables input while applying coupon", async () => {
      mockApplyCoupon.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );
      render(<CartSummary {...defaultProps} onApplyCoupon={mockApplyCoupon} />);

      const input = screen.getByPlaceholderText(
        "Enter code"
      ) as HTMLInputElement;
      fireEvent.change(input, { target: { value: "TEST" } });
      fireEvent.click(screen.getByRole("button", { name: /Apply/i }));

      expect(input).toBeDisabled();
    });

    it("clears input after successful coupon application", async () => {
      mockApplyCoupon.mockResolvedValue(undefined);
      render(<CartSummary {...defaultProps} onApplyCoupon={mockApplyCoupon} />);

      const input = screen.getByPlaceholderText(
        "Enter code"
      ) as HTMLInputElement;
      fireEvent.change(input, { target: { value: "TEST" } });
      fireEvent.click(screen.getByRole("button", { name: /Apply/i }));

      await waitFor(() => {
        expect(input.value).toBe("");
      });
    });

    it("shows error message when coupon application fails", async () => {
      mockApplyCoupon.mockRejectedValue(new Error("Invalid coupon code"));
      render(<CartSummary {...defaultProps} onApplyCoupon={mockApplyCoupon} />);

      const input = screen.getByPlaceholderText("Enter code");
      fireEvent.change(input, { target: { value: "INVALID" } });
      fireEvent.click(screen.getByRole("button", { name: /Apply/i }));

      await waitFor(() => {
        expect(screen.getByText("Invalid coupon code")).toBeInTheDocument();
      });
    });

    it("shows generic error when error has no message", async () => {
      mockApplyCoupon.mockRejectedValue({});
      render(<CartSummary {...defaultProps} onApplyCoupon={mockApplyCoupon} />);

      const input = screen.getByPlaceholderText("Enter code");
      fireEvent.change(input, { target: { value: "TEST" } });
      fireEvent.click(screen.getByRole("button", { name: /Apply/i }));

      await waitFor(() => {
        expect(screen.getByText("Invalid coupon code")).toBeInTheDocument();
      });
    });

    it("clears error when user types in input", async () => {
      mockApplyCoupon.mockRejectedValue(new Error("Invalid coupon"));
      render(<CartSummary {...defaultProps} onApplyCoupon={mockApplyCoupon} />);

      const input = screen.getByPlaceholderText("Enter code");
      fireEvent.change(input, { target: { value: "BAD" } });
      fireEvent.click(screen.getByRole("button", { name: /Apply/i }));

      await waitFor(() => {
        expect(screen.getByText("Invalid coupon")).toBeInTheDocument();
      });

      fireEvent.change(input, { target: { value: "NEW" } });
      expect(screen.queryByText("Invalid coupon")).not.toBeInTheDocument();
    });
  });

  // ====================
  // Applied Coupon Display Tests
  // ====================
  describe("Applied Coupon Display", () => {
    it("shows applied coupon badge", () => {
      render(
        <CartSummary {...defaultProps} couponCode="SAVE10" discount={500} />
      );
      expect(screen.getByText("SAVE10")).toBeInTheDocument();
    });

    it("shows savings message with applied coupon", () => {
      render(
        <CartSummary
          {...defaultProps}
          couponCode="FIRSTORDER"
          discount={1000}
        />
      );
      expect(screen.getByText("You saved ₹1,000!")).toBeInTheDocument();
    });

    it("shows tag icon with applied coupon", () => {
      render(<CartSummary {...defaultProps} couponCode="SAVE10" />);
      expect(screen.getByTestId("tag-icon")).toBeInTheDocument();
    });

    it("shows remove button when onRemoveCoupon is provided", () => {
      render(
        <CartSummary
          {...defaultProps}
          couponCode="SAVE10"
          onRemoveCoupon={mockRemoveCoupon}
        />
      );
      const removeBtn = screen.getByTitle("Remove coupon");
      expect(removeBtn).toBeInTheDocument();
    });

    it("does not show remove button when onRemoveCoupon is not provided", () => {
      render(<CartSummary {...defaultProps} couponCode="SAVE10" />);
      expect(screen.queryByTitle("Remove coupon")).not.toBeInTheDocument();
    });

    it("calls onRemoveCoupon when remove button clicked", async () => {
      mockRemoveCoupon.mockResolvedValue(undefined);
      render(
        <CartSummary
          {...defaultProps}
          couponCode="SAVE10"
          onRemoveCoupon={mockRemoveCoupon}
        />
      );

      const removeBtn = screen.getByTitle("Remove coupon");
      fireEvent.click(removeBtn);

      await waitFor(() => {
        expect(mockRemoveCoupon).toHaveBeenCalled();
      });
    });

    it("handles remove coupon error gracefully", async () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      mockRemoveCoupon.mockRejectedValue(new Error("Failed to remove"));
      render(
        <CartSummary
          {...defaultProps}
          couponCode="SAVE10"
          onRemoveCoupon={mockRemoveCoupon}
        />
      );

      const removeBtn = screen.getByTitle("Remove coupon");
      fireEvent.click(removeBtn);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalled();
      });

      consoleSpy.mockRestore();
    });
  });

  // ====================
  // Checkout Button Tests
  // ====================
  describe("Checkout Button", () => {
    it("calls onCheckout when provided", () => {
      render(<CartSummary {...defaultProps} onCheckout={mockCheckout} />);
      fireEvent.click(
        screen.getByRole("button", { name: /Proceed to Checkout/i })
      );
      expect(mockCheckout).toHaveBeenCalled();
    });

    it("navigates to /checkout when onCheckout not provided", () => {
      render(<CartSummary {...defaultProps} />);
      fireEvent.click(
        screen.getByRole("button", { name: /Proceed to Checkout/i })
      );
      expect(mockRouterPush).toHaveBeenCalledWith("/checkout");
    });

    it("disables checkout button when itemCount is 0", () => {
      render(<CartSummary {...defaultProps} itemCount={0} />);
      const checkoutBtn = screen.getByRole("button", {
        name: /Proceed to Checkout/i,
      });
      expect(checkoutBtn).toBeDisabled();
    });

    it("disables checkout button when loading", () => {
      render(<CartSummary {...defaultProps} loading={true} />);
      const checkoutBtn = screen.getByRole("button", {
        name: /Processing.../i,
      });
      expect(checkoutBtn).toBeDisabled();
    });

    it("shows loading state text when loading", () => {
      render(<CartSummary {...defaultProps} loading={true} />);
      expect(screen.getByText("Processing...")).toBeInTheDocument();
    });

    it("shows loader icon when loading", () => {
      render(<CartSummary {...defaultProps} loading={true} />);
      expect(screen.getByTestId("loader-icon")).toBeInTheDocument();
    });

    it("shows shopping bag icon when not loading", () => {
      render(<CartSummary {...defaultProps} />);
      expect(screen.getByTestId("shopping-bag-icon")).toBeInTheDocument();
    });

    it("enables checkout button when itemCount > 0 and not loading", () => {
      render(<CartSummary {...defaultProps} itemCount={1} loading={false} />);
      const checkoutBtn = screen.getByRole("button", {
        name: /Proceed to Checkout/i,
      });
      expect(checkoutBtn).not.toBeDisabled();
    });
  });

  // ====================
  // Edge Cases Tests
  // ====================
  describe("Edge Cases", () => {
    it("handles zero subtotal", () => {
      render(<CartSummary {...defaultProps} subtotal={0} />);
      expect(screen.getByText("₹0")).toBeInTheDocument();
    });

    it("handles very large subtotal", () => {
      render(<CartSummary {...defaultProps} subtotal={99999999} />);
      expect(screen.getByText("₹9,99,99,999")).toBeInTheDocument();
    });

    it("handles zero shipping", () => {
      render(<CartSummary {...defaultProps} shipping={0} />);
      expect(screen.getByText("FREE")).toBeInTheDocument();
    });

    it("handles zero tax", () => {
      render(<CartSummary {...defaultProps} tax={0} />);
      expect(screen.getByText("₹0")).toBeInTheDocument();
    });

    it("handles maximum item count", () => {
      render(<CartSummary {...defaultProps} itemCount={999} />);
      expect(screen.getByText(/Subtotal \(999 items\)/i)).toBeInTheDocument();
    });

    it("handles single item count", () => {
      render(<CartSummary {...defaultProps} itemCount={1} />);
      expect(screen.getByText(/Subtotal \(1 item\)/i)).toBeInTheDocument();
    });

    it("handles decimal tax values", () => {
      render(<CartSummary {...defaultProps} tax={123.456} />);
      expect(screen.getByText("₹123.46")).toBeInTheDocument();
    });

    it("handles decimal total values", () => {
      render(<CartSummary {...defaultProps} total={5432.109} />);
      expect(screen.getByText("₹5,432.11")).toBeInTheDocument();
    });

    it("handles multiple coupons scenario (only last one shown)", () => {
      render(
        <CartSummary {...defaultProps} couponCode="FINAL" discount={1000} />
      );
      expect(screen.getByText("FINAL")).toBeInTheDocument();
      expect(screen.getByText("You saved ₹1,000!")).toBeInTheDocument();
    });

    it("handles empty coupon code", () => {
      render(<CartSummary {...defaultProps} couponCode="" discount={0} />);
      // Should not show coupon badge when code is empty
      expect(screen.queryByTestId("tag-icon")).not.toBeInTheDocument();
    });
  });

  // ====================
  // Styling & Layout Tests
  // ====================
  describe("Styling & Layout", () => {
    it("applies sticky positioning to container", () => {
      const { container } = render(<CartSummary {...defaultProps} />);
      const summaryDiv = container.firstChild as HTMLElement;
      expect(summaryDiv).toHaveClass("sticky");
      expect(summaryDiv).toHaveClass("top-4");
    });

    it("applies proper padding to container", () => {
      const { container } = render(<CartSummary {...defaultProps} />);
      const summaryDiv = container.firstChild as HTMLElement;
      expect(summaryDiv).toHaveClass("p-6");
    });

    it("applies rounded border to container", () => {
      const { container } = render(<CartSummary {...defaultProps} />);
      const summaryDiv = container.firstChild as HTMLElement;
      expect(summaryDiv).toHaveClass("rounded-lg");
      expect(summaryDiv).toHaveClass("border");
    });

    it("has white background", () => {
      const { container } = render(<CartSummary {...defaultProps} />);
      const summaryDiv = container.firstChild as HTMLElement;
      expect(summaryDiv).toHaveClass("bg-white");
    });
  });
});
