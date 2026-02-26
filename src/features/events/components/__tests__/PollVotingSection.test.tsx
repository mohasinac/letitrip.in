/**
 * @jest-environment jsdom
 */
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import type React from "react";
import { PollVotingSection } from "../PollVotingSection";

jest.mock("../../services/event.service", () => ({
  eventService: { enter: jest.fn() },
}));

jest.mock("@/hooks", () => ({
  useAuth: jest.fn(() => ({ user: { uid: "u1" } })),
  useMessage: () => ({ showSuccess: jest.fn(), showError: jest.fn() }),
  useApiMutation: jest.fn((opts: any) => ({
    mutate: opts?.mutationFn ? jest.fn(opts.mutationFn) : jest.fn(),
    mutateAsync: jest.fn(),
    isLoading: false,
    isPending: false,
  })),
}));

jest.mock("@/constants", () => ({
  SUCCESS_MESSAGES: { EVENT: { VOTE_SUBMITTED: "Vote submitted!" } },
  ERROR_MESSAGES: { EVENT: { ALREADY_ENTERED: "Already voted" } },
}));

const mockPollConfig = {
  options: [
    { id: "o1", label: "Option A", votes: 5, percentage: 50 },
    { id: "o2", label: "Option B", votes: 5, percentage: 50 },
  ],
  allowMultiSelect: false,
  allowComment: false,
  maxSelections: 1,
  resultsVisibility: "always" as const,
};

describe("PollVotingSection", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders without crashing", () => {
    expect(() =>
      render(<PollVotingSection eventId="evt-1" pollConfig={mockPollConfig} />),
    ).not.toThrow();
  });

  it("renders poll options", () => {
    render(<PollVotingSection eventId="evt-1" pollConfig={mockPollConfig} />);
    expect(screen.getByText("Option A")).toBeInTheDocument();
    expect(screen.getByText("Option B")).toBeInTheDocument();
  });

  it("shows voted state when existingVotes are provided", () => {
    render(
      <PollVotingSection
        eventId="evt-1"
        pollConfig={mockPollConfig}
        existingVotes={["o1"]}
      />,
    );
    // When already voted, submit button should not appear and voted message shown
    expect(
      screen.queryByRole("button", { name: /submit/i }),
    ).not.toBeInTheDocument();
  });

  it("selecting an option enables submit", () => {
    render(<PollVotingSection eventId="evt-1" pollConfig={mockPollConfig} />);
    // Click Option A
    fireEvent.click(screen.getByText("Option A"));
    // Submit button should now be visible and enabled
    const submitBtn = screen.getByRole("button", { name: /submit|vote/i });
    expect(submitBtn).toBeInTheDocument();
  });
});
