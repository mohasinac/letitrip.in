import { render, screen } from "@testing-library/react";
import VerifyEmailPage from "../page";

jest.mock("@/features/auth", () => ({
  VerifyEmailView: () => (
    <div data-testid="verify-email-view">VerifyEmailView</div>
  ),
}));

describe("Verify Email Page (thin shell)", () => {
  it("renders VerifyEmailView", () => {
    render(<VerifyEmailPage />);
    expect(screen.getByTestId("verify-email-view")).toBeInTheDocument();
  });
});
