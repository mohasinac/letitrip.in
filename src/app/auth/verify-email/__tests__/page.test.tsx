import { render, screen } from "@testing-library/react";
import VerifyEmailPage from "../page";
import { UI_LABELS } from "@/constants";

const mockPush = jest.fn();
const mockGet = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => ({ get: mockGet }),
}));

jest.mock("@/hooks", () => ({
  useVerifyEmail: () => ({ mutate: jest.fn(), isLoading: true }),
}));

jest.mock("@/components", () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Button: ({ children, ...props }: { children: React.ReactNode }) => (
    <button {...props}>{children}</button>
  ),
  Alert: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Spinner: () => <div data-testid="spinner" />,
  Heading: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
  Text: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
}));

describe("Verify Email Page", () => {
  beforeEach(() => {
    mockGet.mockReturnValue("token");
  });

  it("renders the verifying state", () => {
    render(<VerifyEmailPage />);

    expect(
      screen.getByText(UI_LABELS.AUTH.VERIFY_EMAIL.VERIFYING_TITLE),
    ).toBeInTheDocument();
  });
});
