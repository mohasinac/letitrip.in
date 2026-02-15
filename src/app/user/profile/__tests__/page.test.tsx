import { render, screen } from "@testing-library/react";
import type React from "react";
import UserProfilePage from "../page";
import { UI_LABELS } from "@/constants";

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

    expect(screen.getByText(UI_LABELS.PROFILE.MY_PROFILE)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: UI_LABELS.ACTIONS.EDIT_PROFILE }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("profile-header")).toBeInTheDocument();
    expect(screen.getByTestId("profile-stats")).toBeInTheDocument();
  });
});
