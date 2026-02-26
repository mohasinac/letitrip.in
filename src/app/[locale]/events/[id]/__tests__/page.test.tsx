import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import type React from "react";
import EventDetailPage from "../page";

jest.mock("react", () => {
  const actualReact = jest.requireActual("react");
  return {
    ...actualReact,
    use: (value: any) => {
      if (value && typeof value.then === "function") {
        // Return mock resolved value for Promise<params>
        return { id: "evt-1" };
      }
      return value;
    },
  };
});

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/events/evt-1",
}));

jest.mock("@/hooks", () => ({
  useApiQuery: jest.fn(() => ({
    data: null,
    isLoading: false,
    error: null,
    refetch: jest.fn(),
  })),
  useApiMutation: () => ({ mutate: jest.fn(), isLoading: false }),
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
  UI_LABELS: {
    ACTIONS: { BACK: "Back" },
    EVENTS: {
      PARTICIPATE: "Participate",
      ENTRIES_CLOSED: "Entries Closed",
      SALE_BANNER: (d: number) => `${d}% off`,
      OFFER_BANNER: (c: string) => `Use code ${c}`,
    },
    LOADING: { DEFAULT: "Loading..." },
  },
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
    typography: {
      h1: "text-3xl font-bold",
      h2: "text-2xl font-bold",
      h3: "text-xl font-semibold",
    },
    borderRadius: { xl: "rounded-xl" },
  },
  ROUTES: { PUBLIC: { EVENTS: "/events" } },
}));

jest.mock("@/components", () => ({
  Card: ({ children }: any) => <div data-testid="card">{children}</div>,
  Spinner: () => <div data-testid="spinner" />,
  EmptyState: ({ title }: any) => <div data-testid="empty-state">{title}</div>,
  Alert: ({ children }: any) => <div data-testid="alert">{children}</div>,
}));

jest.mock("@/features/events", () => ({
  EventStatusBadge: ({ status }: any) => (
    <span data-testid="status-badge">{status}</span>
  ),
  PollVotingSection: () => <div data-testid="poll-section" />,
  SurveyEventSection: () => <div data-testid="survey-section" />,
  FeedbackEventSection: () => <div data-testid="feedback-section" />,
  EventLeaderboard: () => <div data-testid="leaderboard-section" />,
  eventService: { list: jest.fn(), getById: jest.fn() },
}));

jest.mock("@/utils", () => ({
  formatDate: (d: any) => String(d),
  formatRelativeTime: (d: any) => String(d),
  formatCurrency: (v: number) => `₹${v}`,
}));

const { useApiQuery } = require("@/hooks");

describe("Event Detail Page (/events/[id])", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders without crashing", () => {
    (useApiQuery as jest.Mock).mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });
    expect(() =>
      render(<EventDetailPage params={Promise.resolve({ id: "evt-1" })} />),
    ).not.toThrow();
  });

  it("shows loading spinner while fetching event", () => {
    (useApiQuery as jest.Mock).mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
      refetch: jest.fn(),
    });
    render(<EventDetailPage params={Promise.resolve({ id: "evt-1" })} />);
    expect(screen.getByTestId("spinner")).toBeInTheDocument();
  });

  it("shows empty state when event is not found", () => {
    (useApiQuery as jest.Mock).mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });
    render(<EventDetailPage params={Promise.resolve({ id: "evt-1" })} />);
    expect(screen.getByTestId("empty-state")).toBeInTheDocument();
  });

  it("renders event content when event data is available", () => {
    const mockEvent = {
      id: "evt-1",
      title: "Test Event",
      type: "sale",
      status: "active",
      startsAt: new Date().toISOString(),
      endsAt: new Date(Date.now() + 86400000).toISOString(),
      description: "Test description",
      saleConfig: { discountPercent: 10 },
    };
    (useApiQuery as jest.Mock).mockReturnValue({
      data: mockEvent,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });
    render(<EventDetailPage params={Promise.resolve({ id: "evt-1" })} />);
    expect(screen.getByText("Test Event")).toBeInTheDocument();
  });
});
