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

jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ alt, src }: any) => <img alt={alt} src={src} />,
}));

jest.mock("@/i18n/navigation", () => ({
  Link: ({ children, href }: any) => <a href={href}>{children}</a>,
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => "/",
  redirect: jest.fn(),
}));

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const map: Record<string, string> = {
      visitEvent: "Visit Event",
      visitBtn: "Visit",
    };
    return map[key] ?? key;
  },
}));

jest.mock("@/constants", () => ({
  ROUTES: {
    PUBLIC: {
      EVENT_DETAIL: (id: string) => `/events/${id}`,
    },
  },
  THEME_CONSTANTS: {
    themed: {
      textSecondary: "text-gray-600",
      textPrimary: "text-gray-900",
      border: "border-gray-200",
    },
    flex: {
      center: "flex items-center justify-center",
      between: "flex items-center justify-between",
      rowCenter: "flex items-center",
    },
    spacing: { padding: { md: "p-4" }, gap: { md: "gap-4" } },
    typography: { h3: "text-xl font-bold" },
  },
  UI_LABELS: {
    ADMIN: {
      CATEGORIES: {
        TITLE: "Categories",
        ADD: "Add Category",
        EDIT: "Edit Category",
        DELETE: "Delete Category",
        FORM: { NAME: "Name", SLUG: "Slug", SAVE: "Save" },
      },
    },
    ACTIONS: { SAVE: "Save", CANCEL: "Cancel" },
    FORM: {},
  },
  UI_PLACEHOLDERS: {},
  ERROR_MESSAGES: { VALIDATION: {}, AUTH: {} },
  SUCCESS_MESSAGES: {},
  API_ENDPOINTS: {},
}));

const mockEvent = {
  id: "evt-1",
  title: "Summer Poll",
  type: "poll" as const,
  status: "active" as const,
  description: "<p>Vote on your <b>favourite</b> product</p>",
  endsAt: new Date(Date.now() + 86400000).toISOString(),
  coverImageUrl: undefined as string | undefined,
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
  createdBy: "user1",
  stats: { totalEntries: 0, approvedEntries: 0, flaggedEntries: 0 },
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

  it("strips HTML from description", () => {
    render(<EventCard event={mockEvent as any} />);
    expect(screen.getByText(/Vote on your/)).toBeInTheDocument();
    expect(screen.queryByText(/<p>/)).toBeNull();
  });

  it("renders Visit Event button", () => {
    render(<EventCard event={mockEvent as any} />);
    expect(screen.getByText("Visit Event")).toBeInTheDocument();
  });

  it("renders links for the event (title + visit button)", () => {
    render(<EventCard event={mockEvent as any} />);
    const links = screen.getAllByRole("link");
    expect(links.length).toBeGreaterThanOrEqual(2);
    links.forEach((link) =>
      expect(link).toHaveAttribute("href", "/events/evt-1")
    );
  });

  it("shows gradient placeholder when no cover image", () => {
    render(<EventCard event={mockEvent as any} />);
    expect(screen.queryByRole("img")).toBeNull();
  });

  it("shows cover image when provided", () => {
    const eventWithImage = {
      ...mockEvent,
      coverImageUrl: "https://example.com/img.jpg",
    };
    render(<EventCard event={eventWithImage as any} />);
    expect(screen.getByRole("img")).toBeInTheDocument();
  });

  it("renders checkbox when selectable is true", () => {
    render(<EventCard event={mockEvent as any} selectable selected={false} />);
    expect(screen.getByRole("checkbox")).toBeInTheDocument();
  });
});
