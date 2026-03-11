import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import type React from "react";
import EventsPage from "../page";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/events",
}));

jest.mock("@/hooks", () => ({
  ...jest.requireActual("@/hooks"),
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
  THEME_CONSTANTS: {
    themed: {
      bgPrimary: "bg-white",
      bgSecondary: "bg-gray-50",
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
      h4: "text-xl font-bold",
    },
    borderRadius: { xl: "rounded-xl" },
    container: { xl: "max-w-xl" },
  },
  ROUTES: { PUBLIC: { EVENTS: "/events" } },
}));

jest.mock("@/components", () => ({
  EmptyState: ({ title, description }: any) => (
    <div data-testid="empty-state">
      <p>{title}</p>
      <p>{description}</p>
    </div>
  ),
  Spinner: () => <div data-testid="spinner" />,
  Card: ({ children }: any) => <div>{children}</div>,
}));

jest.mock("@/features/events", () => ({
  EventCard: ({ event }: any) => (
    <div data-testid="event-card">{event?.title}</div>
  ),
  eventService: { list: jest.fn(), getById: jest.fn() },
}));

// Re-import after mocks
const { useApiQuery } = require("@/hooks");

describe("Events Page (/events)", () => {
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
    expect(() => render(<EventsPage />)).not.toThrow();
  });

  it("shows loading spinner while data is fetching", () => {
    (useApiQuery as jest.Mock).mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
      refetch: jest.fn(),
    });
    render(<EventsPage />);
    expect(screen.getAllByTestId("spinner").length).toBeGreaterThan(0);
  });

  it("shows empty state when no events are available", () => {
    (useApiQuery as jest.Mock).mockReturnValue({
      data: { items: [] },
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });
    render(<EventsPage />);
    expect(screen.getAllByTestId("empty-state").length).toBeGreaterThan(0);
  });

  it("renders event cards when events are returned", () => {
    (useApiQuery as jest.Mock).mockImplementation(({ queryKey }: any) => {
      if (
        queryKey[1] === "public-events-active" ||
        queryKey[0] === "public-events-active"
      ) {
        return {
          data: {
            items: [{ id: "evt-1", title: "Active Event", status: "active" }],
          },
          isLoading: false,
          error: null,
          refetch: jest.fn(),
        };
      }
      return {
        data: { items: [] },
        isLoading: false,
        error: null,
        refetch: jest.fn(),
      };
    });
    render(<EventsPage />);
    expect(screen.getByTestId("event-card")).toBeInTheDocument();
  });
});
