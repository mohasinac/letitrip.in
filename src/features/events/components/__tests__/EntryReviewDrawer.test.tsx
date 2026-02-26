/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import type React from "react";
import { EntryReviewDrawer } from "../EntryReviewDrawer";

jest.mock("../../hooks/useEventMutations", () => ({
  useReviewEntry: jest.fn(() => ({
    mutate: jest.fn(),
    mutateAsync: jest.fn(),
    isLoading: false,
    isPending: false,
  })),
}));

jest.mock("@/hooks", () => ({
  useMessage: () => ({ showSuccess: jest.fn(), showError: jest.fn() }),
}));

jest.mock("@/components", () => ({
  SideDrawer: ({ children, isOpen, title, footer }: any) =>
    isOpen ? (
      <div data-testid="sidebar" data-title={title}>
        {children}
        {footer}
      </div>
    ) : null,
  Button: ({ children, onClick, disabled }: any) => (
    <button onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
  FormField: (props: any) => (
    <input data-testid={`field-${props.name || "input"}`} />
  ),
}));

jest.mock("@/constants", () => ({
  SUCCESS_MESSAGES: {
    EVENT: { ENTRY_APPROVED: "Approved", ENTRY_FLAGGED: "Flagged" },
  },
  ERROR_MESSAGES: { EVENT: { REVIEW_FAILED: "Review failed" } },
}));

const mockEntry = {
  id: "entry-1",
  userId: "u1",
  userDisplayName: "Alice",
  userEmail: "alice@example.com",
  reviewStatus: "pending" as const,
  eventId: "evt-1",
  createdAt: new Date().toISOString(),
  formResponses: {},
};

describe("EntryReviewDrawer", () => {
  it("renders nothing when closed", () => {
    render(
      <EntryReviewDrawer
        entry={mockEntry as any}
        eventId="evt-1"
        isOpen={false}
        onClose={jest.fn()}
        onSuccess={jest.fn()}
      />,
    );
    expect(screen.queryByTestId("sidebar")).not.toBeInTheDocument();
  });

  it("renders drawer when open", () => {
    render(
      <EntryReviewDrawer
        entry={mockEntry as any}
        eventId="evt-1"
        isOpen={true}
        onClose={jest.fn()}
        onSuccess={jest.fn()}
      />,
    );
    expect(screen.getByTestId("sidebar")).toBeInTheDocument();
  });

  it("renders approve and flag buttons when open", () => {
    render(
      <EntryReviewDrawer
        entry={mockEntry as any}
        eventId="evt-1"
        isOpen={true}
        onClose={jest.fn()}
        onSuccess={jest.fn()}
      />,
    );
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThanOrEqual(2);
  });
});
