import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import type React from "react";
import EventParticipatePage from "../page";

jest.mock("react", () => {
  const actualReact = jest.requireActual("react");
  return {
    ...actualReact,
    use: (value: any) => {
      if (value && typeof value.then === "function") {
        return { id: "evt-1" };
      }
      return value;
    },
  };
});

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/events/evt-1/participate",
}));

jest.mock("@/hooks", () => ({
  useApiQuery: jest.fn(() => ({
    data: null,
    isLoading: false,
    error: null,
    refetch: jest.fn(),
  })),
  useApiMutation: jest.fn(() => ({
    mutate: jest.fn(),
    mutateAsync: jest.fn(),
    isLoading: false,
    isPending: false,
  })),
  useAuth: jest.fn(() => ({
    user: { uid: "user-001", email: "user@example.com" },
    loading: false,
  })),
  useMessage: () => ({ showError: jest.fn(), showSuccess: jest.fn() }),
}));

jest.mock("@/lib/api-client", () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock("@/constants", () => ({
  ROUTES: {
    AUTH: { LOGIN: "/auth/login" },
    PUBLIC: {
      EVENTS: "/events",
      EVENT_PARTICIPATE: (id: string) => `/events/${id}/participate`,
    },
  },
  UI_LABELS: {
    ACTIONS: { BACK: "Back", SUBMIT: "Submit" },
    EVENTS: {
      ENDS_IN: "Ends in",
      SUBMIT: "Submit",
      THANK_YOU_TITLE: "Thank you!",
      THANK_YOU_DESC: "Your response has been recorded.",
    },
    LOADING: { DEFAULT: "Loading..." },
  },
  SUCCESS_MESSAGES: { EVENT: { ENTRY_SUBMITTED: "Entry submitted" } },
  ERROR_MESSAGES: { EVENT: { ALREADY_ENTERED: "Already entered" } },
  THEME_CONSTANTS: {
    themed: {
      bgPrimary: "bg-white",
      textPrimary: "text-gray-900",
      textSecondary: "text-gray-600",
      border: "border-gray-200",
    },
    spacing: {
      stack: "space-y-4",
      padding: { lg: "p-6", md: "p-4" },
      gap: { md: "gap-4" },
    },
    typography: { h2: "text-2xl font-bold", h3: "text-xl font-semibold" },
    borderRadius: { xl: "rounded-xl" },
  },
}));

jest.mock("@/components", () => ({
  Card: ({ children }: any) => <div data-testid="card">{children}</div>,
  Spinner: () => <div data-testid="spinner" />,
  Alert: ({ children }: any) => <div data-testid="alert">{children}</div>,
  Button: ({ children, onClick }: any) => (
    <button onClick={onClick}>{children}</button>
  ),
  FormField: (props: any) => (
    <input data-testid={`field-${props.name || "input"}`} />
  ),
}));

jest.mock("@/features/events", () => ({
  eventService: { getById: jest.fn(), enter: jest.fn() },
}));

jest.mock("@/utils", () => ({
  formatDate: (d: any) => String(d),
}));

const { useApiQuery, useAuth } = require("@/hooks");

describe("Event Participate Page (/events/[id]/participate)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({
      user: { uid: "user-001", email: "user@example.com" },
      loading: false,
    });
  });

  it("renders without crashing", () => {
    (useApiQuery as jest.Mock).mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });
    expect(() =>
      render(
        <EventParticipatePage params={Promise.resolve({ id: "evt-1" })} />,
      ),
    ).not.toThrow();
  });

  it("shows loading spinner while fetching event data", () => {
    (useApiQuery as jest.Mock).mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
      refetch: jest.fn(),
    });
    render(<EventParticipatePage params={Promise.resolve({ id: "evt-1" })} />);
    expect(screen.getByTestId("spinner")).toBeInTheDocument();
  });

  it("renders participation form when event data is loaded", () => {
    const mockEvent = {
      id: "evt-1",
      title: "Survey Event",
      type: "survey",
      status: "active",
      endsAt: new Date(Date.now() + 86400000).toISOString(),
      surveyConfig: {
        formFields: [
          { id: "q1", label: "Question 1", type: "text", required: true },
        ],
        hasLeaderboard: false,
      },
    };
    (useApiQuery as jest.Mock).mockReturnValue({
      data: mockEvent,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });
    render(<EventParticipatePage params={Promise.resolve({ id: "evt-1" })} />);
    // Page title or event title should be visible
    expect(screen.getByText("Survey Event")).toBeInTheDocument();
  });
});
