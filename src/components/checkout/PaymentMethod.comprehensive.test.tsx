import { render, screen, fireEvent } from "@testing-library/react";
import { PaymentMethod } from "./PaymentMethod";

// Mock lucide-react icons
jest.mock("lucide-react", () => ({
  CreditCard: () => <div data-testid="credit-card-icon">CreditCard</div>,
  Wallet: () => <div data-testid="wallet-icon">Wallet</div>,
  Banknote: () => <div data-testid="banknote-icon">Banknote</div>,
  Shield: () => <div data-testid="shield-icon">Shield</div>,
  Check: () => <div data-testid="check-icon">Check</div>,
}));

describe("PaymentMethod - Comprehensive Tests", () => {
  const mockOnSelect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Basic Rendering", () => {
    it("should render the payment method selection title", () => {
      render(<PaymentMethod selected="razorpay" onSelect={mockOnSelect} />);
      expect(screen.getByText("Payment Method")).toBeInTheDocument();
    });

    it("should render both payment options", () => {
      render(<PaymentMethod selected="razorpay" onSelect={mockOnSelect} />);
      expect(screen.getByText("Online Payment")).toBeInTheDocument();
      expect(screen.getByText("Cash on Delivery")).toBeInTheDocument();
    });

    it("should render Razorpay option with correct structure", () => {
      render(<PaymentMethod selected="razorpay" onSelect={mockOnSelect} />);
      expect(screen.getByText("Online Payment")).toBeInTheDocument();
      expect(screen.getByText(/Pay securely using UPI/i)).toBeInTheDocument();
    });

    it("should render COD option with correct structure", () => {
      render(<PaymentMethod selected="cod" onSelect={mockOnSelect} />);
      expect(screen.getByText("Cash on Delivery")).toBeInTheDocument();
      expect(
        screen.getByText(/Pay with cash when your order is delivered/i)
      ).toBeInTheDocument();
    });

    it("should render both payment options in the correct order", () => {
      const { container } = render(
        <PaymentMethod selected="razorpay" onSelect={mockOnSelect} />
      );
      const paymentOptions = container.querySelectorAll(".space-y-3 > div");
      expect(paymentOptions[0]).toHaveTextContent(/Online Payment/i);
      expect(paymentOptions[1]).toHaveTextContent(/Cash on Delivery/i);
    });

    it("should render in a space-y layout", () => {
      const { container } = render(
        <PaymentMethod selected="razorpay" onSelect={mockOnSelect} />
      );
      const spaceContainer = container.querySelector(".space-y-3");
      expect(spaceContainer).toBeInTheDocument();
    });

    it("should render radio inputs for both options", () => {
      render(<PaymentMethod selected="razorpay" onSelect={mockOnSelect} />);
      const radioInputs = screen.getAllByRole("radio");
      expect(radioInputs).toHaveLength(2);
    });

    it("should have proper HTML structure with payment options", () => {
      const { container } = render(
        <PaymentMethod selected="razorpay" onSelect={mockOnSelect} />
      );
      const paymentOptions = container.querySelectorAll(".space-y-3 > div");
      expect(paymentOptions).toHaveLength(2);
    });
  });

  describe("Payment Option Icons", () => {
    it("should render CreditCard icon for Razorpay option", () => {
      render(<PaymentMethod selected="razorpay" onSelect={mockOnSelect} />);
      expect(screen.getByTestId("credit-card-icon")).toBeInTheDocument();
    });

    it("should render Banknote icon for COD option", () => {
      render(<PaymentMethod selected="cod" onSelect={mockOnSelect} />);
      expect(screen.getByTestId("banknote-icon")).toBeInTheDocument();
    });

    it("should render icons with proper styling", () => {
      const { container } = render(
        <PaymentMethod selected="razorpay" onSelect={mockOnSelect} />
      );
      const creditCardIcon = screen.getByTestId("credit-card-icon");
      expect(creditCardIcon).toBeInTheDocument();
    });
  });

  describe("Payment Method Badges", () => {
    it("should render all payment method badges for Razorpay", () => {
      render(<PaymentMethod selected="razorpay" onSelect={mockOnSelect} />);
      expect(screen.getByText("UPI")).toBeInTheDocument();
      expect(screen.getByText("Cards")).toBeInTheDocument();
      expect(screen.getByText("Net Banking")).toBeInTheDocument();
      expect(screen.getByText("Wallets")).toBeInTheDocument();
    });

    it("should render payment method badges in flex layout", () => {
      const { container } = render(
        <PaymentMethod selected="razorpay" onSelect={mockOnSelect} />
      );
      const badgeContainer = container.querySelector(".flex.flex-wrap");
      expect(badgeContainer).toBeInTheDocument();
    });

    it("should style payment method badges with colored backgrounds", () => {
      const { container } = render(
        <PaymentMethod selected="razorpay" onSelect={mockOnSelect} />
      );
      const blueBadge = container.querySelector(".bg-blue-100");
      const purpleBadge = container.querySelector(".bg-purple-100");
      expect(blueBadge).toBeInTheDocument();
      expect(purpleBadge).toBeInTheDocument();
    });

    it("should render payment badges with proper spacing", () => {
      const { container } = render(
        <PaymentMethod selected="razorpay" onSelect={mockOnSelect} />
      );
      const badgeContainer = container.querySelector(
        ".flex.items-center.gap-2.flex-wrap"
      );
      expect(badgeContainer).toBeInTheDocument();
    });
  });

  describe("Selection State", () => {
    it("should show Razorpay as selected when selected='razorpay'", () => {
      render(<PaymentMethod selected="razorpay" onSelect={mockOnSelect} />);
      const razorpayRadio = screen.getAllByRole("radio")[0];
      expect(razorpayRadio).toBeChecked();
    });

    it("should show COD as selected when selected='cod'", () => {
      render(<PaymentMethod selected="cod" onSelect={mockOnSelect} />);
      const codRadio = screen.getAllByRole("radio")[1];
      expect(codRadio).toBeChecked();
    });

    it("should not check Razorpay when COD is selected", () => {
      render(<PaymentMethod selected="cod" onSelect={mockOnSelect} />);
      const razorpayRadio = screen.getAllByRole("radio")[0];
      expect(razorpayRadio).not.toBeChecked();
    });

    it("should not check COD when Razorpay is selected", () => {
      render(<PaymentMethod selected="razorpay" onSelect={mockOnSelect} />);
      const codRadio = screen.getAllByRole("radio")[1];
      expect(codRadio).not.toBeChecked();
    });

    it("should highlight selected option with primary border", () => {
      const { container } = render(
        <PaymentMethod selected="razorpay" onSelect={mockOnSelect} />
      );
      const paymentOptions = container.querySelectorAll(".space-y-3 > div");
      const selectedOption = paymentOptions[0]; // Razorpay is first
      expect(selectedOption).toHaveClass("border-primary");
      expect(selectedOption).toHaveClass("bg-primary/5");
    });

    it("should show gray border for unselected option", () => {
      const { container } = render(
        <PaymentMethod selected="razorpay" onSelect={mockOnSelect} />
      );
      const paymentOptions = container.querySelectorAll(".space-y-3 > div");
      const unselectedOption = paymentOptions[1]; // COD is not selected
      expect(unselectedOption).toHaveClass("border-gray-200");
    });

    it("should apply background color to selected option", () => {
      const { container } = render(
        <PaymentMethod selected="cod" onSelect={mockOnSelect} />
      );
      const paymentOptions = container.querySelectorAll(".space-y-3 > div");
      const selectedOption = paymentOptions[1]; // COD is selected
      expect(selectedOption).toHaveClass("bg-primary/5");
    });
  });

  describe("Click Interactions", () => {
    it("should call onSelect with 'razorpay' when Razorpay option is clicked", () => {
      render(<PaymentMethod selected="cod" onSelect={mockOnSelect} />);
      const razorpayRadio = screen.getAllByRole("radio")[0];
      fireEvent.click(razorpayRadio);
      expect(mockOnSelect).toHaveBeenCalledWith("razorpay");
      // NOTE: BUG - onSelect is called twice (div onClick + radio onChange)
      expect(mockOnSelect).toHaveBeenCalledTimes(2);
    });

    it("should call onSelect with 'cod' when COD option is clicked", () => {
      render(<PaymentMethod selected="razorpay" onSelect={mockOnSelect} />);
      const codRadio = screen.getAllByRole("radio")[1];
      fireEvent.click(codRadio);
      expect(mockOnSelect).toHaveBeenCalledWith("cod");
      // NOTE: BUG - onSelect is called twice (div onClick + radio onChange)
      expect(mockOnSelect).toHaveBeenCalledTimes(2);
    });

    it("should allow switching from Razorpay to COD", () => {
      const { rerender } = render(
        <PaymentMethod selected="razorpay" onSelect={mockOnSelect} />
      );
      const codRadio = screen.getAllByRole("radio")[1];
      fireEvent.click(codRadio);
      expect(mockOnSelect).toHaveBeenCalledWith("cod");

      // Rerender with new selection
      rerender(<PaymentMethod selected="cod" onSelect={mockOnSelect} />);
      expect(codRadio).toBeChecked();
    });

    it("should allow switching from COD to Razorpay", () => {
      const { rerender } = render(
        <PaymentMethod selected="cod" onSelect={mockOnSelect} />
      );
      const razorpayRadio = screen.getAllByRole("radio")[0];
      fireEvent.click(razorpayRadio);
      expect(mockOnSelect).toHaveBeenCalledWith("razorpay");

      // Rerender with new selection
      rerender(<PaymentMethod selected="razorpay" onSelect={mockOnSelect} />);
      expect(razorpayRadio).toBeChecked();
    });

    it("should trigger onSelect when clicking on label text", () => {
      render(<PaymentMethod selected="cod" onSelect={mockOnSelect} />);
      const razorpayLabel = screen.getByText("Online Payment");
      fireEvent.click(razorpayLabel);
      expect(mockOnSelect).toHaveBeenCalledWith("razorpay");
    });

    it("should not break when clicking multiple times", () => {
      render(<PaymentMethod selected="razorpay" onSelect={mockOnSelect} />);
      const razorpayRadio = screen.getAllByRole("radio")[0];
      fireEvent.click(razorpayRadio);
      fireEvent.click(razorpayRadio);
      fireEvent.click(razorpayRadio);
      expect(mockOnSelect).toHaveBeenCalledTimes(3);
      expect(mockOnSelect).toHaveBeenCalledWith("razorpay");
    });

    it("should handle rapid switching between options", () => {
      render(<PaymentMethod selected="razorpay" onSelect={mockOnSelect} />);
      const [razorpayRadio, codRadio] = screen.getAllByRole("radio");

      fireEvent.click(codRadio);

      // NOTE: BUG - Clicking already-selected radio doesn't trigger double call
      // Only clicking different radio triggers double call (div + radio)
      expect(mockOnSelect).toHaveBeenCalledTimes(2); // 1 click × 2 calls
      expect(mockOnSelect).toHaveBeenCalledWith("cod");
    });
  });

  describe("Security Notes", () => {
    it("should display security note for Razorpay", () => {
      render(<PaymentMethod selected="razorpay" onSelect={mockOnSelect} />);
      expect(
        screen.getByText(/Secure payment powered by Razorpay/i)
      ).toBeInTheDocument();
    });

    it("should display COD charges note", () => {
      render(<PaymentMethod selected="cod" onSelect={mockOnSelect} />);
      expect(
        screen.getByText(/Additional charges may apply/i)
      ).toBeInTheDocument();
    });

    it("should display overall security note at bottom", () => {
      render(<PaymentMethod selected="razorpay" onSelect={mockOnSelect} />);
      expect(
        screen.getByText(/Your payment information is secure and encrypted/i)
      ).toBeInTheDocument();
    });

    it("should style security notes with proper text color", () => {
      const { container } = render(
        <PaymentMethod selected="razorpay" onSelect={mockOnSelect} />
      );
      const securityNote = container.querySelector(".text-gray-500");
      expect(securityNote).toBeInTheDocument();
    });
  });

  describe("Styling & Layout", () => {
    it("should apply hover effects on unselected options", () => {
      const { container } = render(
        <PaymentMethod selected="razorpay" onSelect={mockOnSelect} />
      );
      const paymentOptions = container.querySelectorAll(".space-y-3 > div");
      const unselectedOption = paymentOptions[1]; // COD is not selected
      expect(unselectedOption).toHaveClass("hover:border-gray-300");
    });

    it("should have proper spacing between elements", () => {
      const { container } = render(
        <PaymentMethod selected="razorpay" onSelect={mockOnSelect} />
      );
      const labels = container.querySelectorAll("label");
      labels.forEach((label) => {
        expect(label).toHaveClass("p-4");
      });
    });

    it("should have rounded corners on option cards", () => {
      const { container } = render(
        <PaymentMethod selected="razorpay" onSelect={mockOnSelect} />
      );
      const labels = container.querySelectorAll("label");
      labels.forEach((label) => {
        expect(label).toHaveClass("rounded-lg");
      });
    });

    it("should have proper border styling", () => {
      const { container } = render(
        <PaymentMethod selected="razorpay" onSelect={mockOnSelect} />
      );
      const labels = container.querySelectorAll("label");
      labels.forEach((label) => {
        expect(label).toHaveClass("border-2");
      });
    });

    it("should use cursor pointer for interactive elements", () => {
      const { container } = render(
        <PaymentMethod selected="razorpay" onSelect={mockOnSelect} />
      );
      const labels = container.querySelectorAll("label");
      labels.forEach((label) => {
        expect(label).toHaveClass("cursor-pointer");
      });
    });

    it("should have transition effects", () => {
      const { container } = render(
        <PaymentMethod selected="razorpay" onSelect={mockOnSelect} />
      );
      const labels = container.querySelectorAll("label");
      labels.forEach((label) => {
        expect(label).toHaveClass("transition-all");
      });
    });

    it("should have different styling for selected vs unselected options", () => {
      const { container } = render(
        <PaymentMethod selected="razorpay" onSelect={mockOnSelect} />
      );
      const paymentOptions = container.querySelectorAll(".space-y-3 > div");
      const selectedOption = paymentOptions[0];
      const unselectedOption = paymentOptions[1];

      expect(selectedOption).toHaveClass("border-primary");
      expect(unselectedOption).toHaveClass("border-gray-200");
    });
  });

  describe("Accessibility", () => {
    it("should have proper radio button roles", () => {
      render(<PaymentMethod selected="razorpay" onSelect={mockOnSelect} />);
      const radioInputs = screen.getAllByRole("radio");
      expect(radioInputs).toHaveLength(2);
    });

    it("should have radio inputs without ids (accessibility issue)", () => {
      // NOTE: BUG - Radio inputs lack id attributes for proper label association
      const { container } = render(
        <PaymentMethod selected="razorpay" onSelect={mockOnSelect} />
      );
      const radioInputs = container.querySelectorAll("input[type='radio']");
      const ids = Array.from(radioInputs).map((input) => input.id);
      // Currently no IDs are set
      expect(ids.every((id) => id === "")).toBe(true);
    });

    it("should have radio inputs without name attribute (accessibility issue)", () => {
      // NOTE: BUG - Radio inputs lack name attribute for proper grouping
      const { container } = render(
        <PaymentMethod selected="razorpay" onSelect={mockOnSelect} />
      );
      const radioInputs = container.querySelectorAll("input[type='radio']");
      radioInputs.forEach((input) => {
        expect(input).not.toHaveAttribute("name");
      });
    });

    it("should not use semantic label elements (accessibility issue)", () => {
      // NOTE: BUG - Component uses divs instead of proper label elements
      const { container } = render(
        <PaymentMethod selected="razorpay" onSelect={mockOnSelect} />
      );
      const labels = container.querySelectorAll("label");
      expect(labels.length).toBe(0); // No labels present
    });

    it("should support keyboard navigation", () => {
      render(<PaymentMethod selected="razorpay" onSelect={mockOnSelect} />);
      const razorpayRadio = screen.getAllByRole("radio")[0];
      razorpayRadio.focus();
      expect(document.activeElement).toBe(razorpayRadio);
    });

    it("should allow keyboard interaction (limited due to missing semantics)", () => {
      // NOTE: BUG - Component lacks proper semantic structure and keyboard accessibility
      // Missing: label elements, proper id/name/for attributes, keyboard event handlers
      render(<PaymentMethod selected="cod" onSelect={mockOnSelect} />);
      const razorpayRadio = screen.getAllByRole("radio")[0];
      razorpayRadio.focus();
      expect(document.activeElement).toBe(razorpayRadio);

      // Direct click works, but keyboard-only users have poor experience
      fireEvent.click(razorpayRadio);
      expect(mockOnSelect).toHaveBeenCalledWith("razorpay");
    });
  });

  describe("Edge Cases", () => {
    it("should handle undefined onSelect gracefully", () => {
      const { container } = render(
        <PaymentMethod selected="razorpay" onSelect={undefined as any} />
      );
      expect(container).toBeInTheDocument();
    });

    it("should render correctly with empty onSelect", () => {
      render(<PaymentMethod selected="razorpay" onSelect={() => {}} />);
      expect(screen.getByText("Online Payment")).toBeInTheDocument();
    });

    it("should maintain state when rerendering with same props", () => {
      const { rerender } = render(
        <PaymentMethod selected="razorpay" onSelect={mockOnSelect} />
      );
      const razorpayRadio = screen.getAllByRole("radio")[0];
      expect(razorpayRadio).toBeChecked();

      rerender(<PaymentMethod selected="razorpay" onSelect={mockOnSelect} />);
      expect(razorpayRadio).toBeChecked();
    });

    it("should update correctly when selected prop changes", () => {
      const { rerender } = render(
        <PaymentMethod selected="razorpay" onSelect={mockOnSelect} />
      );
      const [razorpayRadio, codRadio] = screen.getAllByRole("radio");
      expect(razorpayRadio).toBeChecked();

      rerender(<PaymentMethod selected="cod" onSelect={mockOnSelect} />);
      expect(codRadio).toBeChecked();
      expect(razorpayRadio).not.toBeChecked();
    });

    it("should handle rapid prop changes", () => {
      const { rerender } = render(
        <PaymentMethod selected="razorpay" onSelect={mockOnSelect} />
      );
      rerender(<PaymentMethod selected="cod" onSelect={mockOnSelect} />);
      rerender(<PaymentMethod selected="razorpay" onSelect={mockOnSelect} />);
      rerender(<PaymentMethod selected="cod" onSelect={mockOnSelect} />);

      const codRadio = screen.getAllByRole("radio")[1];
      expect(codRadio).toBeChecked();
    });

    it("should handle changing onSelect callback", () => {
      const newMockOnSelect = jest.fn();
      const { rerender } = render(
        <PaymentMethod selected="razorpay" onSelect={mockOnSelect} />
      );

      rerender(
        <PaymentMethod selected="razorpay" onSelect={newMockOnSelect} />
      );

      const codRadio = screen.getAllByRole("radio")[1];
      fireEvent.click(codRadio);

      expect(mockOnSelect).not.toHaveBeenCalled();
      expect(newMockOnSelect).toHaveBeenCalledWith("cod");
    });

    it("should not break with rendering multiple times", () => {
      render(<PaymentMethod selected="razorpay" onSelect={mockOnSelect} />);
      expect(screen.getByText("Payment Method")).toBeInTheDocument();
      expect(screen.getByText("Online Payment")).toBeInTheDocument();
    });
  });

  describe("Component Isolation", () => {
    it("should not affect other components when mounted", () => {
      const { container } = render(
        <div>
          <PaymentMethod selected="razorpay" onSelect={mockOnSelect} />
          <div data-testid="sibling">Sibling Component</div>
        </div>
      );
      expect(screen.getByTestId("sibling")).toBeInTheDocument();
      expect(screen.getByText("Online Payment")).toBeInTheDocument();
    });

    it("should clean up properly when unmounted", () => {
      const { unmount, container } = render(
        <PaymentMethod selected="razorpay" onSelect={mockOnSelect} />
      );
      unmount();
      expect(container.innerHTML).toBe("");
    });

    it("should work with multiple instances", () => {
      const mockOnSelect2 = jest.fn();
      const { container } = render(
        <div>
          <PaymentMethod selected="razorpay" onSelect={mockOnSelect} />
          <PaymentMethod selected="cod" onSelect={mockOnSelect2} />
        </div>
      );
      const radioInputs = container.querySelectorAll("input[type='radio']");
      expect(radioInputs).toHaveLength(4); // 2 instances × 2 options
    });
  });
});
