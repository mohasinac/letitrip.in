/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import type React from "react";
import { EventLeaderboard } from "../EventLeaderboard";

jest.mock("../../hooks/useEventLeaderboard", () => ({
  useEventLeaderboard: jest.fn(() => ({
    leaderboard: [],
    isLoading: false,
    error: null,
    refetch: jest.fn(),
  })),
}));

jest.mock("@/hooks", () => ({
  useAuth: jest.fn(() => ({ user: null })),
}));

jest.mock("@/components", () => ({
  Spinner: () => <div data-testid="spinner" />,
}));

jest.mock("@/constants", () => ({
  THEME_CONSTANTS: {
    themed: { textSecondary: "text-gray-600" },
  },
}));

const { useEventLeaderboard } = require("../../hooks/useEventLeaderboard");
const { useAuth } = require("@/hooks");

describe("EventLeaderboard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useEventLeaderboard as jest.Mock).mockReturnValue({
      leaderboard: [],
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });
    (useAuth as jest.Mock).mockReturnValue({ user: null });
  });

  it("renders without crashing", () => {
    expect(() => render(<EventLeaderboard eventId="evt-1" />)).not.toThrow();
  });

  it("shows loading spinner while fetching", () => {
    (useEventLeaderboard as jest.Mock).mockReturnValue({
      leaderboard: [],
      isLoading: true,
      error: null,
    });
    render(<EventLeaderboard eventId="evt-1" />);
    expect(screen.getByTestId("spinner")).toBeInTheDocument();
  });

  it("shows empty state text when no entries", () => {
    render(<EventLeaderboard eventId="evt-1" />);
    expect(screen.getByText(/no entries yet/i)).toBeInTheDocument();
  });

  it("renders leaderboard entries when data is loaded", () => {
    (useEventLeaderboard as jest.Mock).mockReturnValue({
      leaderboard: [
        {
          id: "e1",
          userId: "u1",
          userDisplayName: "Alice",
          score: 100,
          reviewStatus: "approved",
        },
        {
          id: "e2",
          userId: "u2",
          userDisplayName: "Bob",
          score: 80,
          reviewStatus: "approved",
        },
      ],
      isLoading: false,
      error: null,
    });
    render(<EventLeaderboard eventId="evt-1" />);
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
  });

  it("highlights current user's row", () => {
    (useAuth as jest.Mock).mockReturnValue({ user: { uid: "u1" } });
    (useEventLeaderboard as jest.Mock).mockReturnValue({
      leaderboard: [
        {
          id: "e1",
          userId: "u1",
          userDisplayName: "Alice",
          score: 100,
          reviewStatus: "approved",
        },
      ],
      isLoading: false,
      error: null,
    });
    render(<EventLeaderboard eventId="evt-1" />);
    const row = screen.getByText("Alice").closest('[class*="ring"]');
    expect(row).toBeTruthy();
  });
});
