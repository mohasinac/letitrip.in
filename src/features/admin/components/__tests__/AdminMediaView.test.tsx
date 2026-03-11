import React from "react";
import { render, screen } from "@testing-library/react";
import { AdminMediaView } from "../AdminMediaView";

jest.mock("@/hooks", () => ({
  ...jest.requireActual("@/hooks"),
  ...jest.requireActual("@/hooks"),
  useApiMutation: () => ({ mutate: jest.fn() }),
}));

jest.mock("@/services", () => ({
  mediaService: { crop: jest.fn(), trim: jest.fn() },
}));

jest.mock("@/components", () => ({
  Card: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => <div className={className}>{children}</div>,
  AdminPageHeader: ({ title }: { title: string }) => <h1>{title}</h1>,
  MediaOperationForm: () => <div data-testid="media-form" />,
  DataTable: () => <div data-testid="data-table" />,
  getMediaTableColumns: () => [],
  useToast: () => ({ showToast: jest.fn() }),
}));

jest.mock("next-intl", () => ({ useTranslations: () => (key: string) => key }));

describe("AdminMediaView", () => {
  it("renders the page header and form", () => {
    render(<AdminMediaView />);
    expect(screen.getByText("title")).toBeInTheDocument();
    expect(screen.getByTestId("media-form")).toBeInTheDocument();
  });

  it("shows empty state when no operations", () => {
    render(<AdminMediaView />);
    expect(screen.getByText("noOperations")).toBeInTheDocument();
  });
});
