import { render, screen } from "@testing-library/react";
import ResetPasswordPage from "../page";
import { UI_LABELS } from "@/constants";

const mockPush = jest.fn();
const mockGet = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => ({ get: mockGet }),
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
  useResetPassword: () => ({
    mutate: jest.fn(),
    isLoading: false,
    error: null,
  }),
}));

jest.mock("@/components", () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Button: ({ children, ...props }: { children: React.ReactNode }) => (
    <button {...props}>{children}</button>
  ),
  Alert: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Spinner: () => <div data-testid="spinner" />,
  FormField: ({ label }: { label?: string }) => (
    <label>
      {label}
      <input />
    </label>
  ),
  PasswordStrengthIndicator: () => <div data-testid="password-strength" />,
  Heading: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
  Text: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
}));

describe("Reset Password Page", () => {
  beforeEach(() => {
    mockGet.mockReturnValue("token");
  });

  it("renders the reset password form", () => {
    render(<ResetPasswordPage />);

    expect(
      screen.getByRole("button", {
        name: UI_LABELS.AUTH.RESET_PASSWORD.RESET_PASSWORD,
      }),
    ).toBeInTheDocument();
  });
});
