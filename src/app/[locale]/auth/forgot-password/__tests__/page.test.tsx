import { render, screen } from "@testing-library/react";
import ForgotPasswordPage from "../page";

jest.mock("@/features/auth", () => ({
  ForgotPasswordView: () => (
    <div data-testid="forgot-password-view">ForgotPasswordView</div>
  ),
}));

describe("Forgot Password Page (thin shell)", () => {
  it("renders ForgotPasswordView", () => {
    render(<ForgotPasswordPage />);
    expect(screen.getByTestId("forgot-password-view")).toBeInTheDocument();
  });
});
