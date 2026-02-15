import { render, screen } from "@testing-library/react";
import LoginPage from "../page";
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
  useAuth: () => ({ user: null, loading: false }),
  useLogin: () => ({ mutate: jest.fn(), isLoading: false }),
  useGoogleLogin: () => ({ mutate: jest.fn(), isLoading: false }),
  useAppleLogin: () => ({ mutate: jest.fn(), isLoading: false }),
}));

jest.mock("@/components", () => ({
  Input: ({ label, ...props }: { label?: string; [key: string]: unknown }) => (
    <input aria-label={label} {...props} />
  ),
  Button: ({ children, ...props }: { children: React.ReactNode }) => (
    <button {...props}>{children}</button>
  ),
  Alert: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Spinner: () => <div data-testid="spinner" />,
}));

describe("Login Page", () => {
  beforeEach(() => {
    mockGet.mockReturnValue(null);
    mockPush.mockClear();
  });

  it("renders the login form", () => {
    render(<LoginPage />);

    expect(
      screen.getByRole("button", { name: UI_LABELS.AUTH.LOGIN.SIGN_IN }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: UI_LABELS.AUTH.LOGIN.GOOGLE }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: UI_LABELS.AUTH.LOGIN.APPLE }),
    ).toBeInTheDocument();
  });
});
