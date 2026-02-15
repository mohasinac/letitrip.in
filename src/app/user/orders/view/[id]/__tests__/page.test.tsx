import { render, screen } from "@testing-library/react";
import type React from "react";
import OrderViewPage from "../page";
import { UI_LABELS } from "@/constants";

const mockPush = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, replace: mockPush }),
  useParams: () => ({ id: "order-1" }),
}));

jest.mock("@/hooks", () => ({
  useAuth: () => ({ user: { uid: "user-1" }, loading: false }),
}));

jest.mock("@/utils", () => ({
  formatCurrency: () => "0",
}));

jest.mock("@/components", () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Heading: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
  Text: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
  Button: ({ children, ...props }: { children: React.ReactNode }) => (
    <button {...props}>{children}</button>
  ),
  StatusBadge: () => <div data-testid="status-badge" />,
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

describe("Order View Page", () => {
  it("renders empty order state", () => {
    render(<OrderViewPage />);

    expect(
      screen.getByText(UI_LABELS.USER.ORDERS.ORDER_NOT_FOUND),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: new RegExp(UI_LABELS.USER.ORDERS.BACK_TO_ORDERS),
      }),
    ).toBeInTheDocument();
  });
});
