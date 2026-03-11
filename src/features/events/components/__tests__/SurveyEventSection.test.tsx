/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import type React from "react";
import { SurveyEventSection } from "../SurveyEventSection";

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

jest.mock("@/hooks", () => ({
  ...jest.requireActual("@/hooks"),
  ...jest.requireActual("@/hooks"),
  useAuth: jest.fn(() => ({ user: { uid: "u1" } })),
}));

jest.mock("@/components", () => ({
  Alert: ({ children, variant }: any) => (
    <div data-testid="alert" data-variant={variant}>
      {children}
    </div>
  ),
}));

jest.mock("@/constants", () => ({
  ROUTES: {
    AUTH: { LOGIN: "/auth/login" },
    PUBLIC: { EVENT_PARTICIPATE: (id: string) => `/events/${id}/participate` },
  },
}));

const { useAuth } = require("@/hooks");

const mockEvent = {
  id: "evt-1",
  title: "Survey Event",
  type: "survey" as const,
  status: "active" as const,
};

describe("SurveyEventSection", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({ user: { uid: "u1" } });
  });

  it("renders without crashing", () => {
    expect(() =>
      render(<SurveyEventSection event={mockEvent as any} />),
    ).not.toThrow();
  });

  it("shows login prompt when user is not authenticated", () => {
    (useAuth as jest.Mock).mockReturnValue({ user: null });
    render(<SurveyEventSection event={mockEvent as any} />);
    expect(screen.getByTestId("alert")).toBeInTheDocument();
  });

  it("shows pending review alert when userEntryStatus is pending", () => {
    render(
      <SurveyEventSection event={mockEvent as any} userEntryStatus="pending" />,
    );
    expect(screen.getByTestId("alert")).toHaveAttribute("data-variant", "info");
  });

  it("shows approved alert when userEntryStatus is approved", () => {
    render(
      <SurveyEventSection
        event={mockEvent as any}
        userEntryStatus="approved"
      />,
    );
    expect(screen.getByTestId("alert")).toHaveAttribute(
      "data-variant",
      "success",
    );
  });

  it("renders participate link for authenticated users with no entry", () => {
    render(
      <SurveyEventSection event={mockEvent as any} userEntryStatus={null} />,
    );
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/events/evt-1/participate");
  });
});
