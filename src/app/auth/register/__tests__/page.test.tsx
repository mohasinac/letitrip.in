import { render, screen } from "@testing-library/react";
import RegisterPage from "../page";
import { UI_LABELS } from "@/constants";

const mockPush = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

jest.mock("@/hooks", () => ({
  useAuth: () => ({ user: null, loading: false }),
  useRegister: () => ({ mutate: jest.fn(), isLoading: false }),
  useGoogleLogin: () => ({ mutate: jest.fn(), isLoading: false }),
  useAppleLogin: () => ({ mutate: jest.fn(), isLoading: false }),
}));

jest.mock("@/components", () => ({
  Button: ({ children, ...props }: { children: React.ReactNode }) => (
    <button {...props}>{children}</button>
  ),
  Alert: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Checkbox: (props: { id?: string }) => <input type="checkbox" {...props} />,
  Spinner: () => <div data-testid="spinner" />,
  FormField: ({ label }: { label?: string }) => (
    <label>
      {label}
      <input />
    </label>
  ),
  PasswordStrengthIndicator: () => <div data-testid="password-strength" />,
}));

describe("Register Page", () => {
  it("renders the registration form", () => {
    render(<RegisterPage />);

    expect(
      screen.getByRole("button", {
        name: UI_LABELS.AUTH.REGISTER.CREATE_ACCOUNT,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: UI_LABELS.AUTH.LOGIN.GOOGLE }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: UI_LABELS.AUTH.LOGIN.APPLE }),
    ).toBeInTheDocument();
  });
});
