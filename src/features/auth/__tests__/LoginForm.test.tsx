import { render, screen } from "@testing-library/react";
import { LoginForm } from "../components/LoginForm";
import { UI_LABELS } from "@/constants";

const mockPush = jest.fn();
const mockGet = jest.fn().mockReturnValue(null);

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
  useAuth: () => ({ user: null, loading: false }),
  useLogin: () => ({ mutate: jest.fn(), isLoading: false }),
  useGoogleLogin: () => ({ mutate: jest.fn(), isLoading: false }),
  useAppleLogin: () => ({ mutate: jest.fn(), isLoading: false }),
}));

jest.mock("@/components", () => ({
  Input: ({ label, ...props }: { label?: string; [key: string]: unknown }) => (
    <input aria-label={label} {...(props as object)} />
  ),
  Button: ({ children, ...props }: { children: React.ReactNode }) => (
    <button {...props}>{children}</button>
  ),
  Alert: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Checkbox: (props: { id?: string }) => <input type="checkbox" {...props} />,
  Spinner: () => <div data-testid="spinner" />,
}));

describe("LoginForm", () => {
  beforeEach(() => {
    mockGet.mockReturnValue(null);
    mockPush.mockClear();
  });

  it("renders sign-in button", () => {
    render(<LoginForm />);
    expect(
      screen.getByRole("button", { name: UI_LABELS.AUTH.LOGIN.SIGN_IN }),
    ).toBeInTheDocument();
  });

  it("renders email and password inputs", () => {
    render(<LoginForm />);
    expect(
      screen.getByRole("textbox", {
        name: UI_LABELS.AUTH.SHARED.EMAIL_ADDRESS,
      }),
    ).toBeInTheDocument();
  });

  it("renders Google and Apple social buttons", () => {
    render(<LoginForm />);
    expect(
      screen.getByRole("button", {
        name: new RegExp(UI_LABELS.AUTH.LOGIN.GOOGLE, "i"),
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: new RegExp(UI_LABELS.AUTH.LOGIN.APPLE, "i"),
      }),
    ).toBeInTheDocument();
  });

  it("renders page title", () => {
    render(<LoginForm />);
    expect(screen.getByText(UI_LABELS.AUTH.LOGIN.TITLE)).toBeInTheDocument();
  });

  it("renders OR divider", () => {
    render(<LoginForm />);
    expect(
      screen.getByText(UI_LABELS.AUTH.LOGIN.OR_CONTINUE_WITH),
    ).toBeInTheDocument();
  });
});
