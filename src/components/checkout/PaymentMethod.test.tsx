import { render, screen, fireEvent } from "@testing-library/react";
import { PaymentMethod } from "./PaymentMethod";

describe("PaymentMethod", () => {
  it("renders payment options and selects Razorpay", () => {
    const mockSelect = jest.fn();
    render(<PaymentMethod selected="razorpay" onSelect={mockSelect} />);
    expect(screen.getByText(/Online Payment/i)).toBeInTheDocument();
    expect(screen.getByText(/Cash on Delivery/i)).toBeInTheDocument();
    fireEvent.click(screen.getByText(/Online Payment/i));
    expect(mockSelect).toHaveBeenCalledWith("razorpay");
  });

  it("selects Cash on Delivery option", () => {
    const mockSelect = jest.fn();
    render(<PaymentMethod selected="cod" onSelect={mockSelect} />);
    fireEvent.click(screen.getByText(/Cash on Delivery/i));
    expect(mockSelect).toHaveBeenCalledWith("cod");
  });
});
