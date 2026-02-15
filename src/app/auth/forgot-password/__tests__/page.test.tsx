import { render, screen } from "@testing-library/react";
import ForgotPasswordPage from "../page";
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
  useForgotPassword: () => ({ mutate: jest.fn(), isLoading: false }),
}));

jest.mock("@/components", () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Button: ({ children, ...props }: { children: React.ReactNode }) => (
    <button {...props}>{children}</button>
  ),
  Alert: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  FormField: ({ label }: { label?: string }) => (
    <label>
      {label}
      <input />
    </label>
  ),
  Heading: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
  Text: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
}));

describe("Forgot Password Page", () => {
  it("renders the forgot password form", () => {
    render(<ForgotPasswordPage />);

    expect(
      screen.getByText(UI_LABELS.AUTH.FORGOT_PASSWORD.PAGE_TITLE),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: UI_LABELS.AUTH.FORGOT_PASSWORD.SEND_RESET_LINK,
      }),
    ).toBeInTheDocument();
  });
});
