import { render, screen } from "@testing-library/react";
import RegisterPage from "../page";

// Page-level test: verify the page composes the RegisterForm feature component.
// Feature-level tests for RegisterForm live in src/features/auth/__tests__/.
jest.mock("@/features/auth", () => ({
  RegisterForm: () => <div data-testid="register-form" />,
}));

describe("Register Page", () => {
  it("renders the RegisterForm feature component", () => {
    render(<RegisterPage />);
    expect(screen.getByTestId("register-form")).toBeInTheDocument();
  });
});
