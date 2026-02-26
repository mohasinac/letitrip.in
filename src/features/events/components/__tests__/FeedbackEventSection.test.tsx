/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import type React from "react";
import { FeedbackEventSection } from "../FeedbackEventSection";

jest.mock("../../services/event.service", () => ({
  eventService: { enter: jest.fn() },
}));

jest.mock("@/hooks", () => ({
  useMessage: () => ({ showSuccess: jest.fn(), showError: jest.fn() }),
  useApiMutation: jest.fn((opts: any) => ({
    mutate: jest.fn(),
    mutateAsync: jest.fn(),
    isLoading: false,
    isPending: false,
  })),
}));

jest.mock("@/components", () => ({
  Alert: ({ children, variant }: any) => (
    <div data-testid="alert" data-variant={variant}>
      {children}
    </div>
  ),
}));

jest.mock("@/constants", () => ({
  SUCCESS_MESSAGES: { EVENT: { ENTRY_SUBMITTED: "Entry submitted" } },
  ERROR_MESSAGES: { GENERIC: { INTERNAL_ERROR: "Something went wrong" } },
}));

const mockFeedbackConfig = {
  formFields: [
    {
      id: "f1",
      label: "Your rating",
      type: "text" as const,
      required: true,
      order: 0,
    },
    {
      id: "f2",
      label: "Comments",
      type: "textarea" as const,
      required: false,
      order: 1,
    },
  ],
};

describe("FeedbackEventSection", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders without crashing", () => {
    expect(() =>
      render(
        <FeedbackEventSection
          eventId="evt-1"
          feedbackConfig={mockFeedbackConfig}
        />,
      ),
    ).not.toThrow();
  });

  it("renders form fields from feedbackConfig", () => {
    render(
      <FeedbackEventSection
        eventId="evt-1"
        feedbackConfig={mockFeedbackConfig}
      />,
    );
    expect(screen.getByText("Your rating")).toBeInTheDocument();
    expect(screen.getByText("Comments")).toBeInTheDocument();
  });

  it("renders submit button", () => {
    render(
      <FeedbackEventSection
        eventId="evt-1"
        feedbackConfig={mockFeedbackConfig}
      />,
    );
    expect(screen.getByRole("button")).toBeInTheDocument();
  });
});
