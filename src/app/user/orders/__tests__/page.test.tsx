import { render, screen } from "@testing-library/react";
import type React from "react";
import UserOrdersPage from "../page";
import { UI_LABELS } from "@/constants";

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

describe("User Orders Page", () => {
  it("renders empty state", () => {
    render(<UserOrdersPage />);

    expect(screen.getByText(UI_LABELS.USER.ORDERS.TITLE)).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: UI_LABELS.USER.ORDERS.BROWSE_PRODUCTS,
      }),
    ).toBeInTheDocument();
  });
});
