/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import type React from "react";
import { EventCard } from "../EventCard";

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

jest.mock("@/components", () => ({
  Card: ({ children, className }: any) => (
    <div data-testid="card" className={className}>
      {children}
    </div>
  ),
  Badge: ({ children }: any) => <span data-testid="badge">{children}</span>,
}));

jest.mock("@/constants", () => ({
  ROUTES: {
    PUBLIC: {
      PRODUCTS: "/products",
      EVENT_DETAIL: (id: string) => `/events/${id}`,
    },
  },
  THEME_CONSTANTS: {
    themed: { textSecondary: "text-gray-600", textPrimary: "text-gray-900" },
    spacing: {
      stack: "space-y-4",
      padding: { xs: "p-2", md: "p-4", lg: "p-6" },
      gap: { xs: "gap-2", md: "gap-4", lg: "gap-6" },
    },
    borderRadius: { xl: "rounded-xl", lg: "rounded-lg" },
    typography: { h3: "text-xl font-semibold", h4: "text-lg font-semibold" },
  },
}));

jest.mock("@/utils", () => ({
  formatRelativeTime: (d: any) => "in 2 days",
}));

jest.mock("../EventStatusBadge", () => ({
  EventStatusBadge: ({ status }: any) => (
    <span data-testid="status-badge" data-status={status}>
      {status}
    </span>
  ),
}));

const mockEvent = {
  id: "evt-1",
  title: "Summer Poll",
  type: "poll" as const,
  status: "active" as const,
  description: "Vote on your favourite product",
  endsAt: new Date(Date.now() + 86400000).toISOString(),
  coverImageUrl: null,
  pollConfig: {
    options: [{ id: "o1", label: "Option A", votes: 0, percentage: 0 }],
    allowMultiSelect: false,
    allowComment: false,
    maxSelections: 1,
  },
  saleConfig: null,
  offerConfig: null,
  feedbackConfig: null,
  surveyConfig: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  startsAt: new Date().toISOString(),
};

describe("EventCard", () => {
  it("renders without crashing", () => {
    expect(() => render(<EventCard event={mockEvent as any} />)).not.toThrow();
  });

  it("renders event title", () => {
    render(<EventCard event={mockEvent as any} />);
    expect(screen.getByText("Summer Poll")).toBeInTheDocument();
  });

  it("renders status badge", () => {
    render(<EventCard event={mockEvent as any} />);
    expect(screen.getByTestId("status-badge")).toBeInTheDocument();
  });

  it("renders a link for the event", () => {
    render(<EventCard event={mockEvent as any} />);
    const link = screen.getByRole("link");
    expect(link).toBeInTheDocument();
  });

  it("shows gradient placeholder when no cover image", () => {
    render(<EventCard event={mockEvent as any} />);
    // No img tag when coverImageUrl is null
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("shows cover image when provided", () => {
    const eventWithImage = {
      ...mockEvent,
      coverImageUrl: "https://example.com/img.jpg",
    };
    render(<EventCard event={eventWithImage as any} />);
    expect(screen.getByRole("img")).toBeInTheDocument();
  });
});
