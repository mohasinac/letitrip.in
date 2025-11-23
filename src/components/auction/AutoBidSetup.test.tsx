import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import AutoBidSetup from "./AutoBidSetup";

jest.mock("lucide-react", () => ({
  Zap: ({ className }: any) => (
    <div data-testid="zap-icon" className={className} />
  ),
  X: () => <div data-testid="x-icon" />,
  Check: () => <div data-testid="check-icon" />,
  AlertTriangle: () => <div data-testid="alert-icon" />,
}));

jest.mock("@/lib/formatters", () => ({
  formatCurrency: (amount: number) => `₹${amount.toLocaleString()}`,
}));

const mockProps = {
  auctionId: "auction1",
  currentBid: 10000,
  reservePrice: 50000,
  minIncrement: 100,
  onSetup: jest.fn(),
  onCancel: jest.fn(),
  isActive: false,
};

describe("AutoBidSetup", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Initial State", () => {
    it("renders setup button when not active", () => {
      render(<AutoBidSetup {...mockProps} />);
      expect(screen.getByText("Set Up Auto-Bid")).toBeInTheDocument();
    });

    it("shows setup button with icon", () => {
      render(<AutoBidSetup {...mockProps} />);
      expect(screen.getByTestId("zap-icon")).toBeInTheDocument();
    });

    it("does not show setup form initially", () => {
      render(<AutoBidSetup {...mockProps} />);
      expect(screen.queryByText("Maximum Bid Amount")).not.toBeInTheDocument();
    });
  });

  describe("Active State", () => {
    it("shows active message when isActive=true", () => {
      render(<AutoBidSetup {...mockProps} isActive={true} />);
      expect(screen.getByText("Auto-Bid Active")).toBeInTheDocument();
    });

    it("shows cancel button when active", () => {
      render(<AutoBidSetup {...mockProps} isActive={true} />);
      expect(screen.getByText("Cancel Auto-Bid")).toBeInTheDocument();
    });

    it("shows pulsing zap icon when active", () => {
      render(<AutoBidSetup {...mockProps} isActive={true} />);
      const icon = screen.getByTestId("zap-icon");
      expect(icon).toHaveClass("animate-pulse");
    });

    it("calls onCancel when cancel button clicked", () => {
      const onCancel = jest.fn();
      render(
        <AutoBidSetup {...mockProps} isActive={true} onCancel={onCancel} />
      );

      const cancelButton = screen.getByText("Cancel Auto-Bid");
      fireEvent.click(cancelButton);

      expect(onCancel).toHaveBeenCalled();
    });

    it("calls onCancel when X icon clicked", () => {
      const onCancel = jest.fn();
      render(
        <AutoBidSetup {...mockProps} isActive={true} onCancel={onCancel} />
      );

      const xButtons = screen.getAllByTestId("x-icon");
      fireEvent.click(xButtons[0].parentElement!);

      expect(onCancel).toHaveBeenCalled();
    });
  });

  describe("Setup Form", () => {
    beforeEach(() => {
      render(<AutoBidSetup {...mockProps} />);
      const setupButton = screen.getByText("Set Up Auto-Bid");
      fireEvent.click(setupButton);
    });

    it("shows form when setup button clicked", () => {
      expect(screen.getByText("Maximum Bid Amount")).toBeInTheDocument();
    });

    it("shows input field for bid amount", () => {
      const input = screen.getByPlaceholderText(/Min:/);
      expect(input).toBeInTheDocument();
    });

    it("shows suggested bid amounts", () => {
      expect(screen.getByText("₹11,000")).toBeInTheDocument(); // currentBid + minIncrement * 10
      expect(screen.getByText("₹12,000")).toBeInTheDocument(); // currentBid + minIncrement * 20
      expect(screen.getByText("₹15,000")).toBeInTheDocument(); // currentBid + minIncrement * 50
      expect(screen.getByText("₹50,000")).toBeInTheDocument(); // reservePrice
    });

    it("shows how auto-bid works info", () => {
      expect(screen.getByText("How Auto-Bid Works:")).toBeInTheDocument();
      expect(
        screen.getByText(/System bids on your behalf/)
      ).toBeInTheDocument();
    });

    it("closes form when X button clicked", () => {
      const xButtons = screen.getAllByTestId("x-icon");
      fireEvent.click(xButtons[0].parentElement!);

      expect(screen.queryByText("Maximum Bid Amount")).not.toBeInTheDocument();
    });

    it("closes form when Cancel clicked", () => {
      const cancelButton = screen.getByText("Cancel");
      fireEvent.click(cancelButton);

      expect(screen.queryByText("Maximum Bid Amount")).not.toBeInTheDocument();
    });
  });

  describe("Input Handling", () => {
    beforeEach(() => {
      render(<AutoBidSetup {...mockProps} />);
      const setupButton = screen.getByText("Set Up Auto-Bid");
      fireEvent.click(setupButton);
    });

    it("updates input value when typing", () => {
      const input = screen.getByPlaceholderText(/Min:/) as HTMLInputElement;
      fireEvent.change(input, { target: { value: "15000" } });

      expect(input.value).toBe("15000");
    });

    it("shows error for bid below current bid", () => {
      const input = screen.getByPlaceholderText(/Min:/);
      fireEvent.change(input, { target: { value: "5000" } });

      expect(
        screen.getByText(/Maximum bid must be higher than current bid/)
      ).toBeInTheDocument();
    });

    it("disables activate button for invalid bid", () => {
      const input = screen.getByPlaceholderText(/Min:/);
      fireEvent.change(input, { target: { value: "5000" } });

      const activateButton = screen.getByText("Activate Auto-Bid");
      expect(activateButton).toBeDisabled();
    });

    it("enables activate button for valid bid", () => {
      const input = screen.getByPlaceholderText(/Min:/);
      fireEvent.change(input, { target: { value: "15000" } });

      const activateButton = screen.getByText("Activate Auto-Bid");
      expect(activateButton).not.toBeDisabled();
    });
  });

  describe("Quick Select", () => {
    beforeEach(() => {
      render(<AutoBidSetup {...mockProps} />);
      const setupButton = screen.getByText("Set Up Auto-Bid");
      fireEvent.click(setupButton);
    });

    it("sets input value when quick select clicked", () => {
      const quickSelect = screen.getByText("₹11,000");
      fireEvent.click(quickSelect);

      const input = screen.getByPlaceholderText(/Min:/) as HTMLInputElement;
      expect(input.value).toBe("11000");
    });

    it("enables activate button after quick select", () => {
      const quickSelect = screen.getByText("₹15,000");
      fireEvent.click(quickSelect);

      const activateButton = screen.getByText("Activate Auto-Bid");
      expect(activateButton).not.toBeDisabled();
    });
  });

  describe("Activate Auto-Bid", () => {
    beforeEach(() => {
      render(<AutoBidSetup {...mockProps} />);
      const setupButton = screen.getByText("Set Up Auto-Bid");
      fireEvent.click(setupButton);
    });

    it("calls onSetup with correct amount", () => {
      const onSetup = jest.fn();
      const { rerender } = render(
        <AutoBidSetup {...mockProps} onSetup={onSetup} />
      );

      const setupButton = screen.getAllByText("Set Up Auto-Bid")[0];
      fireEvent.click(setupButton);

      const input = screen.getByPlaceholderText(/Min:/);
      fireEvent.change(input, { target: { value: "15000" } });

      const activateButton = screen.getByText("Activate Auto-Bid");
      fireEvent.click(activateButton);

      expect(onSetup).toHaveBeenCalledWith(15000);
    });

    it("closes form after activation", () => {
      const input = screen.getByPlaceholderText(/Min:/);
      fireEvent.change(input, { target: { value: "15000" } });

      const activateButton = screen.getByText("Activate Auto-Bid");
      fireEvent.click(activateButton);

      expect(screen.queryByText("Maximum Bid Amount")).not.toBeInTheDocument();
    });

    it("clears input after activation", () => {
      const input = screen.getByPlaceholderText(/Min:/) as HTMLInputElement;
      fireEvent.change(input, { target: { value: "15000" } });

      const activateButton = screen.getByText("Activate Auto-Bid");
      fireEvent.click(activateButton);

      // Re-open form
      const setupButton = screen.getByText("Set Up Auto-Bid");
      fireEvent.click(setupButton);

      const newInput = screen.getByPlaceholderText(/Min:/) as HTMLInputElement;
      expect(newInput.value).toBe("");
    });

    it("does not call onSetup for invalid amount", () => {
      const onSetup = jest.fn();
      render(<AutoBidSetup {...mockProps} onSetup={onSetup} />);

      const setupButton = screen.getAllByText("Set Up Auto-Bid")[0];
      fireEvent.click(setupButton);

      const input = screen.getByPlaceholderText(/Min:/);
      fireEvent.change(input, { target: { value: "5000" } });

      const activateButton = screen.getByText("Activate Auto-Bid");
      fireEvent.click(activateButton);

      expect(onSetup).not.toHaveBeenCalled();
    });
  });

  describe("Edge Cases", () => {
    it("handles missing reserve price", () => {
      const { reservePrice, ...propsWithoutReserve } = mockProps;
      render(<AutoBidSetup {...propsWithoutReserve} />);

      const setupButton = screen.getByText("Set Up Auto-Bid");
      fireEvent.click(setupButton);

      // Should show calculated fallback instead of reserve price
      expect(screen.getByText("₹20,000")).toBeInTheDocument(); // currentBid + minIncrement * 100
    });

    it("applies custom className", () => {
      const { container } = render(
        <AutoBidSetup {...mockProps} className="custom-class" />
      );
      expect(container.querySelector(".custom-class")).toBeInTheDocument();
    });

    it("handles zero min increment", () => {
      render(<AutoBidSetup {...mockProps} minIncrement={0} />);

      const setupButton = screen.getByText("Set Up Auto-Bid");
      fireEvent.click(setupButton);

      // Should still render without errors
      expect(screen.getByText("Maximum Bid Amount")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("has accessible input field", () => {
      render(<AutoBidSetup {...mockProps} />);

      const setupButton = screen.getByText("Set Up Auto-Bid");
      fireEvent.click(setupButton);

      const input = screen.getByPlaceholderText(/Min:/);
      expect(input).toHaveAttribute("type", "number");
    });

    it("shows check icon in activate button", () => {
      render(<AutoBidSetup {...mockProps} />);

      const setupButton = screen.getByText("Set Up Auto-Bid");
      fireEvent.click(setupButton);

      expect(screen.getByTestId("check-icon")).toBeInTheDocument();
    });

    it("shows alert icon in info box", () => {
      render(<AutoBidSetup {...mockProps} />);

      const setupButton = screen.getByText("Set Up Auto-Bid");
      fireEvent.click(setupButton);

      expect(screen.getByTestId("alert-icon")).toBeInTheDocument();
    });
  });
});
