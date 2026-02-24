import { render, screen } from "@testing-library/react";
import LoginPage from "../page";

// Page-level test: verify the page composes the LoginForm feature component.
// Feature-level tests for LoginForm itself live in src/features/auth/__tests__/.
jest.mock("@/features/auth", () => ({
  LoginForm: () => <div data-testid="login-form" />,
}));

jest.mock("@/components", () => ({
  Spinner: () => <div data-testid="spinner" />,
}));

describe("Login Page", () => {
  it("renders the LoginForm feature component", () => {
    render(<LoginPage />);
    expect(screen.getByTestId("login-form")).toBeInTheDocument();
  });
});
