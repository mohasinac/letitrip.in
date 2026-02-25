import { render, screen } from "@testing-library/react";
import type React from "react";
import UserWishlistPage from "../page";

const mockPush = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock("@/hooks", () => ({
  useAuth: () => ({ user: { uid: "user-1" }, loading: false }),
  useApiQuery: () => ({
    data: null,
    isLoading: false,
    error: null,
    refetch: jest.fn(),
  }),
}));

jest.mock("@/components", () => ({
  Heading: ({ children }: { children: React.ReactNode }) => <h1>{children}</h1>,
  Spinner: () => <div data-testid="spinner" />,
  EmptyState: ({
    title,
    actionLabel,
  }: {
    title: string;
    actionLabel: string;
  }) => (
    <div>
      <div>{title}</div>
      <button>{actionLabel}</button>
    </div>
  ),
}));

describe("User Wishlist Page", () => {
  it("renders empty state", () => {
    render(<UserWishlistPage />);

    // wishlist.title from messages/en.json = "My Wishlist"
    expect(screen.getByText("My Wishlist")).toBeInTheDocument();
    // actions.browseProducts from messages/en.json = "Browse products"
    expect(
      screen.getByRole("button", {
        name: "Browse products",
      }),
    ).toBeInTheDocument();
  });
});
