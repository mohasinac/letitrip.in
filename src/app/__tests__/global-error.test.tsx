/**
 * Tests for GlobalError component
 *
 * Coverage:
 * - Renders heading via Heading primitive
 * - Renders description via Text primitive
 * - Calls reset when retry button is clicked
 * - Logs error on mount via logger
 * - Uses nowISO() for timestamp (not new Date())
 */

import { render, screen, fireEvent } from "@testing-library/react";
import GlobalError from "../global-error";

jest.mock("@/classes", () => ({
  logger: { error: jest.fn() },
}));

jest.mock("@/utils", () => ({
  nowISO: () => "2025-01-01T00:00:00.000Z",
}));

jest.mock("@/components", () => ({
  Heading: ({
    level,
    children,
  }: {
    level: number;
    children: React.ReactNode;
  }) => <h1 data-testid={`heading-${level}`}>{children}</h1>,
  Text: ({ children }: { children: React.ReactNode }) => (
    <p data-testid="text">{children}</p>
  ),
}));

jest.mock("@/constants", () => ({
  UI_LABELS: {
    ERROR_PAGES: {
      CRITICAL_ERROR: {
        TITLE: "Something went wrong",
        DESCRIPTION: "An unexpected error occurred.",
      },
    },
    ACTIONS: { RETRY: "Try again", BACK: "Back" },
  },
  ROUTES: { HOME: "/" },
  THEME_CONSTANTS: {
    themed: {
      bgPrimary: "",
      bgSecondary: "",
      border: "",
      textError: "",
      textSecondary: "",
    },
    spacing: { padding: { xl: "p-10", md: "p-4" }, stack: "space-y-4" },
    container: { "2xl": "max-w-2xl" },
    typography: { small: "text-sm" },
    borderRadius: { lg: "rounded-lg" },
  },
}));

const error = new Error("Test error") as Error & { digest?: string };
const reset = jest.fn();

describe("GlobalError", () => {
  beforeEach(() => jest.clearAllMocks());

  it("renders the heading using Heading primitive", () => {
    render(<GlobalError error={error} reset={reset} />);
    expect(screen.getByTestId("heading-1")).toHaveTextContent(
      "Something went wrong",
    );
  });

  it("renders the description using Text primitive", () => {
    render(<GlobalError error={error} reset={reset} />);
    expect(screen.getByTestId("text")).toHaveTextContent(
      "An unexpected error occurred.",
    );
  });

  it("calls reset when the retry button is clicked", () => {
    render(<GlobalError error={error} reset={reset} />);
    fireEvent.click(screen.getByText("Try again"));
    expect(reset).toHaveBeenCalledTimes(1);
  });

  it("calls logger.error with nowISO() timestamp on mount", () => {
    const { logger } = require("@/classes");
    render(<GlobalError error={error} reset={reset} />);
    expect(logger.error).toHaveBeenCalledWith(
      "Global Critical Error",
      expect.objectContaining({ timestamp: "2025-01-01T00:00:00.000Z" }),
    );
  });
});
