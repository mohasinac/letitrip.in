import { render, screen } from "@testing-library/react";
import type React from "react";
import PublicProfilePage from "../page";
import { ERROR_MESSAGES, UI_LABELS } from "@/constants";

jest.mock("next/navigation", () => ({
  useParams: () => ({ userId: "user-1" }),
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

jest.mock("@/utils", () => ({
  formatMonthYear: () => "Jan 2026",
}));

jest.mock("@/classes", () => ({
  logger: { error: jest.fn() },
}));

jest.mock("@/components", () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Badge: ({ children }: { children: React.ReactNode }) => (
    <span>{children}</span>
  ),
  Alert: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Text: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
  AvatarDisplay: () => <div data-testid="avatar" />,
}));

describe("Public Profile Page", () => {
  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({}),
    } as Response);
  });

  it("renders not found state", async () => {
    render(<PublicProfilePage />);

    expect(
      await screen.findByText(ERROR_MESSAGES.USER.NOT_FOUND),
    ).toBeInTheDocument();
    expect(screen.getByText(UI_LABELS.ACTIONS.GO_HOME)).toBeInTheDocument();
  });
});
