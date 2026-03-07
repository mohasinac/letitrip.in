import { render, screen } from "@testing-library/react";
import { RegisterForm } from "../components/RegisterForm";
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
  Heading: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
  Text: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
  Label: ({ children }: { children: React.ReactNode }) => (
    <label>{children}</label>
  ),
  Span: ({ children }: { children: React.ReactNode }) => (
    <span>{children}</span>
  ),
  TextLink: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

describe("RegisterForm", () => {
  it("renders create account button", () => {
    render(<RegisterForm />);
    expect(
      screen.getByRole("button", {
        name: UI_LABELS.AUTH.REGISTER.CREATE_ACCOUNT,
      }),
    ).toBeInTheDocument();
  });

  it("renders Google sign-up button", () => {
    render(<RegisterForm />);
    expect(
      screen.getByRole("button", {
        name: new RegExp(UI_LABELS.AUTH.LOGIN.GOOGLE, "i"),
      }),
    ).toBeInTheDocument();
  });

  it("renders page title", () => {
    render(<RegisterForm />);
    expect(screen.getByText(UI_LABELS.AUTH.REGISTER.TITLE)).toBeInTheDocument();
  });

  it("renders OR divider", () => {
    render(<RegisterForm />);
    expect(
      screen.getByText(UI_LABELS.AUTH.LOGIN.OR_CONTINUE_WITH),
    ).toBeInTheDocument();
  });

  it("terms and conditions checkbox is rendered", () => {
    render(<RegisterForm />);
    expect(screen.getByRole("checkbox")).toBeInTheDocument();
  });
});
