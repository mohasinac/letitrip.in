import React from "react";
import { render, screen } from "@testing-library/react";
import { BlogPostView } from "../BlogPostView";

jest.mock("@/hooks", () => ({
  ...jest.requireActual("@/hooks"),
  ...jest.requireActual("@/hooks"),
  useApiQuery: () => ({ data: null, isLoading: true, error: null }),
}));
jest.mock("next-intl", () => ({ useTranslations: () => (key: string) => key }));
jest.mock("next/link", () => ({ default: ({ children }: any) => children }));
jest.mock("@/services", () => ({ blogService: { getBySlug: jest.fn() } }));
jest.mock("@/components", () => ({
  Spinner: () => <div data-testid="spinner" />,
  Card: ({ children }: any) => <div>{children}</div>,
  Button: ({ children }: any) => <button>{children}</button>,
}));
jest.mock("@/utils", () => ({ formatDate: (d: any) => String(d) }));
jest.mock("@/constants", () => ({
  ROUTES: { PUBLIC: { BLOG: "/blog" } },
  THEME_CONSTANTS: {
    themed: {
      bgPrimary: "",
      bgSecondary: "",
      textPrimary: "",
      textSecondary: "",
    },
    typography: { h2: "", h3: "" },
  },
}));

describe("BlogPostView", () => {
  it("shows spinner while loading", () => {
    render(<BlogPostView slug="test-post" />);
    expect(screen.getByTestId("spinner")).toBeInTheDocument();
  });

  it("shows not found message when data is null and not loading", () => {
    jest.spyOn(require("@/hooks"), "useApiQuery").mockReturnValue({
      data: null,
      isLoading: false,
      error: new Error("not found"),
    });
    render(<BlogPostView slug="missing" />);
    expect(screen.getByText("postNotFound")).toBeInTheDocument();
  });
});
