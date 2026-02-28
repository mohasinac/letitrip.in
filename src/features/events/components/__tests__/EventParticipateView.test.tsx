/**
 * @jest-environment jsdom
 */
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import type React from "react";
import { EventParticipateView } from "../EventParticipateView";

const mockReplace = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

jest.mock("@/services", () => ({
  eventService: {
    getById: jest.fn(),
    enter: jest.fn(),
  },
}));

jest.mock("@/hooks", () => ({
  useAuth: jest.fn(() => ({ user: { uid: "u1" }, loading: false })),
  useMessage: () => ({ showSuccess: jest.fn(), showError: jest.fn() }),
  useApiQuery: jest.fn(),
  useApiMutation: jest.fn((opts: any) => ({
    mutate: jest.fn(),
    isLoading: false,
  })),
}));

jest.mock("@/constants", () => ({
  ROUTES: {
    AUTH: { LOGIN: "/auth/login" },
    PUBLIC: { EVENT_PARTICIPATE: (id: string) => `/events/${id}/participate` },
  },
  THEME_CONSTANTS: {
    themed: { textPrimary: "text-primary", textSecondary: "text-secondary" },
    spacing: { stack: "space-y-4" },
    typography: { h2: "text-2xl font-bold", h3: "text-xl font-bold" },
  },
  SUCCESS_MESSAGES: { EVENT: { ENTRY_SUBMITTED: "Entry submitted!" } },
  ERROR_MESSAGES: { EVENT: { ALREADY_ENTERED: "Already entered" } },
}));

jest.mock("@/components", () => ({
  Card: ({ children, className }: any) => (
    <div data-testid="card" className={className}>
      {children}
    </div>
  ),
  Spinner: () => <div data-testid="spinner" />,
  Alert: ({ children, variant }: any) => (
    <div data-testid="alert" data-variant={variant}>
      {children}
    </div>
  ),
  FormField: ({ name, label, type, value, onChange, options }: any) => (
    <div data-testid={`field-${name}`}>
      {label && <label>{label}</label>}
      {type === "select" ? (
        <select value={value} onChange={(e) => onChange?.(e.target.value)}>
          {options?.map((o: any) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
        />
      )}
    </div>
  ),
  Button: ({ children, onClick, isLoading, disabled }: any) => (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      data-loading={isLoading}
    >
      {children}
    </button>
  ),
  Input: ({ name, type, value, onChange, min, max }: any) => (
    <input
      name={name}
      type={type}
      value={value}
      min={min}
      max={max}
      onChange={onChange}
    />
  ),
}));

jest.mock("@/utils", () => ({
  formatDate: (d: string) => d,
}));

const { useAuth, useApiQuery, useApiMutation } = require("@/hooks");

const mockSurveyEvent = {
  id: "evt-1",
  title: "Test Survey",
  description: "Fill in the survey",
  type: "survey" as const,
  status: "active" as const,
  endsAt: null,
  surveyConfig: {
    formFields: [
      {
        id: "q1",
        label: "Your name",
        type: "text",
        required: true,
        placeholder: "Enter your name",
      },
      {
        id: "q2",
        label: "Feedback",
        type: "textarea",
        required: false,
      },
      {
        id: "q3",
        label: "Choose one",
        type: "select",
        required: false,
        options: ["A", "B", "C"],
      },
    ],
  },
};

describe("EventParticipateView", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({
      user: { uid: "u1" },
      loading: false,
    });
    (useApiMutation as jest.Mock).mockReturnValue({
      mutate: jest.fn(),
      isLoading: false,
    });
  });

  it("shows spinner while loading", () => {
    (useApiQuery as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: true,
    });
    render(<EventParticipateView id="evt-1" />);
    expect(screen.getByTestId("spinner")).toBeInTheDocument();
  });

  it("redirects to login when unauthenticated", () => {
    (useAuth as jest.Mock).mockReturnValue({ user: null, loading: false });
    (useApiQuery as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: false,
    });
    render(<EventParticipateView id="evt-1" />);
    expect(mockReplace).toHaveBeenCalledWith(
      expect.stringContaining("/auth/login"),
    );
  });

  it("shows warning alert when event has no survey config", () => {
    (useApiQuery as jest.Mock).mockReturnValue({
      data: { type: "poll", status: "active" },
      isLoading: false,
    });
    render(<EventParticipateView id="evt-1" />);
    expect(screen.getByTestId("alert")).toHaveAttribute(
      "data-variant",
      "warning",
    );
  });

  it("shows entries-closed alert when event is not active", () => {
    (useApiQuery as jest.Mock).mockReturnValue({
      data: { ...mockSurveyEvent, status: "ended" },
      isLoading: false,
    });
    render(<EventParticipateView id="evt-1" />);
    expect(screen.getByTestId("alert")).toHaveAttribute("data-variant", "info");
  });

  it("renders survey fields when event is active", () => {
    (useApiQuery as jest.Mock).mockReturnValue({
      data: mockSurveyEvent,
      isLoading: false,
    });
    render(<EventParticipateView id="evt-1" />);
    expect(screen.getByTestId("field-q1")).toBeInTheDocument();
    expect(screen.getByTestId("field-q2")).toBeInTheDocument();
    expect(screen.getByTestId("field-q3")).toBeInTheDocument();
  });

  it("shows submit button", () => {
    (useApiQuery as jest.Mock).mockReturnValue({
      data: mockSurveyEvent,
      isLoading: false,
    });
    render(<EventParticipateView id="evt-1" />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("calls mutation on submit when required fields are filled", async () => {
    const mockMutate = jest.fn();
    (useApiMutation as jest.Mock).mockReturnValue({
      mutate: mockMutate,
      isLoading: false,
    });
    (useApiQuery as jest.Mock).mockReturnValue({
      data: mockSurveyEvent,
      isLoading: false,
    });

    render(<EventParticipateView id="evt-1" />);

    // Fill the required text field (q1)
    const textInput = screen.getByTestId("field-q1").querySelector("input")!;
    fireEvent.change(textInput, { target: { value: "John" } });

    // Submit
    fireEvent.click(screen.getByRole("button"));
    expect(mockMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        formResponses: expect.objectContaining({ q1: "John" }),
      }),
    );
  });

  it("shows error and does not submit when required fields are empty", () => {
    const mockMutate = jest.fn();
    const { showError } = require("@/hooks").useMessage();
    (useApiMutation as jest.Mock).mockReturnValue({
      mutate: mockMutate,
      isLoading: false,
    });
    (useApiQuery as jest.Mock).mockReturnValue({
      data: mockSurveyEvent,
      isLoading: false,
    });

    render(<EventParticipateView id="evt-1" />);
    fireEvent.click(screen.getByRole("button"));
    expect(mockMutate).not.toHaveBeenCalled();
  });
});
