import { render, screen } from "@testing-library/react";
import UnauthorizedPage from "../page";
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

jest.mock("@/components", () => ({
  Button: ({ children, ...props }: { children: React.ReactNode }) => (
    <button {...props}>{children}</button>
  ),
}));

describe("Unauthorized Page", () => {
  it("renders the unauthorized message", () => {
    render(<UnauthorizedPage />);

    expect(
      screen.getByText(UI_LABELS.ERROR_PAGES.UNAUTHORIZED.TITLE),
    ).toBeInTheDocument();
    expect(
      screen.getByText(UI_LABELS.ERROR_PAGES.UNAUTHORIZED.DESCRIPTION),
    ).toBeInTheDocument();
  });
});
