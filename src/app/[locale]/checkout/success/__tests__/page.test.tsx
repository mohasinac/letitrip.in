import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import CheckoutSuccessPage from "../page";

jest.mock("@/components", () => ({
  CheckoutSuccessView: () => (
    <div data-testid="checkout-success-view">CheckoutSuccessView</div>
  ),
}));

describe("CheckoutSuccessPage", () => {
  it("renders CheckoutSuccessView inside Suspense", () => {
    render(<CheckoutSuccessPage />);
    expect(screen.getByTestId("checkout-success-view")).toBeInTheDocument();
  });
});
