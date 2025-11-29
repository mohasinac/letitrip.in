/// <reference types="@testing-library/jest-dom" />

import { render, screen, waitFor } from "@testing-library/react";
import LogoutPage from "./page";

// Mock the AuthContext
const mockLogout = jest.fn();
const mockUser = {
  id: "user1",
  email: "test@example.com",
  fullName: "John Doe",
};
const mockAuthContextValue = {
  user: mockUser,
  isAuthenticated: true,
  login: jest.fn(),
  logout: mockLogout,
  register: jest.fn(),
  loading: false,
};

jest.mock("@/contexts/AuthContext", () => ({
  useAuth: () => mockAuthContextValue,
}));

// Mock useRouter
const mockReplace = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
}));

describe("LogoutPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("renders logging out state initially", () => {
    render(<LogoutPage />);

    expect(screen.getByText("Logging you out...")).toBeInTheDocument();
    expect(screen.getByText("Goodbye, John Doe!")).toBeInTheDocument();
  });

  it("calls logout and shows success state", async () => {
    mockLogout.mockResolvedValueOnce(undefined);

    render(<LogoutPage />);

    // Advance timer for the delay
    jest.advanceTimersByTime(500);

    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalled();
    });

    expect(screen.getByText("You've been logged out")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Thanks for visiting! Redirecting you to the homepage...",
      ),
    ).toBeInTheDocument();

    // Advance timer for redirect
    jest.advanceTimersByTime(1500);

    expect(mockReplace).toHaveBeenCalledWith("/");
  });

  it("shows error state on logout failure", async () => {
    mockLogout.mockRejectedValueOnce(new Error("Logout failed"));

    render(<LogoutPage />);

    // Advance timer for the delay
    jest.advanceTimersByTime(500);

    await waitFor(() => {
      expect(screen.getByText("Logout Error")).toBeInTheDocument();
      expect(screen.getByText("Logout failed")).toBeInTheDocument();
    });
  });

  it("shows generic user message when no fullName", () => {
    mockAuthContextValue.user = { ...mockUser, fullName: undefined as any };

    render(<LogoutPage />);

    expect(screen.getByText("Please wait a moment")).toBeInTheDocument();

    // Reset
    mockAuthContextValue.user = mockUser;
  });
});
