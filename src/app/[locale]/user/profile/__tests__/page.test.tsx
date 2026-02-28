import { render, screen } from "@testing-library/react";
import type React from "react";
import UserProfilePage from "../page";

const mockPush = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock("@/hooks", () => ({
  useAuth: () => ({
    user: {
      email: "user@example.com",
      role: "user",
      displayName: "User",
      photoURL: null,
    },
    loading: false,
  }),
  useApiQuery: () => ({
    data: null,
    isLoading: false,
    error: null,
    refetch: jest.fn(),
  }),
  useProfileStats: () => ({
    orderCount: 3,
    addressCount: 2,
  }),
}));

jest.mock("@/components", () => ({
  Heading: ({ children }: { children: React.ReactNode }) => <h1>{children}</h1>,
  Button: ({ children, ...props }: { children: React.ReactNode }) => (
    <button {...props}>{children}</button>
  ),
  Spinner: () => <div data-testid="spinner" />,
  ProfileHeader: () => <div data-testid="profile-header" />,
  ProfileStatsGrid: () => <div data-testid="profile-stats" />,
}));

describe("User Profile Page", () => {
  it("renders profile content", () => {
    render(<UserProfilePage />);

    expect(screen.getByText("My Profile")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Edit Profile" }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("profile-header")).toBeInTheDocument();
    expect(screen.getByTestId("profile-stats")).toBeInTheDocument();
  });
});
