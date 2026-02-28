/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import type React from "react";
import { EventFormDrawer } from "../EventFormDrawer";

jest.mock("next-intl", () => ({
  useTranslations: (_ns: string) => (key: string) => key,
}));

jest.mock("../../constants/EVENT_TYPE_OPTIONS", () => ({
  EVENT_TYPE_VALUES: ["sale", "offer", "poll", "survey", "feedback"],
}));

jest.mock("@/hooks", () => ({
  useMessage: () => ({ showError: jest.fn(), showSuccess: jest.fn() }),
}));

jest.mock("../../hooks/useEventMutations", () => ({
  useCreateEvent: jest.fn(() => ({ mutate: jest.fn(), isLoading: false })),
  useUpdateEvent: jest.fn(() => ({ mutate: jest.fn(), isLoading: false })),
}));

jest.mock("@/components", () => ({
  SideDrawer: ({ isOpen, children }: any) =>
    isOpen ? <div data-testid="side-drawer">{children}</div> : null,
  Button: ({ children, onClick, type }: any) => (
    <button type={type || "button"} onClick={onClick}>
      {children}
    </button>
  ),
  FormField: ({ label, name }: any) => <input aria-label={label} name={name} />,
  Alert: ({ message }: any) => <div role="alert">{message}</div>,
}));

jest.mock("../EventTypeConfig/SaleConfigForm", () => ({
  SaleConfigForm: () => <div data-testid="sale-config" />,
}));
jest.mock("../EventTypeConfig/OfferConfigForm", () => ({
  OfferConfigForm: () => <div data-testid="offer-config" />,
}));
jest.mock("../EventTypeConfig/PollConfigForm", () => ({
  PollConfigForm: () => <div data-testid="poll-config" />,
}));
jest.mock("../EventTypeConfig/SurveyConfigForm", () => ({
  SurveyConfigForm: () => <div data-testid="survey-config" />,
}));
jest.mock("../EventTypeConfig/FeedbackConfigForm", () => ({
  FeedbackConfigForm: () => <div data-testid="feedback-config" />,
}));

describe("EventFormDrawer", () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    onSuccess: jest.fn(),
    editTarget: null,
  };

  it("renders without crashing when open", () => {
    expect(() => render(<EventFormDrawer {...defaultProps} />)).not.toThrow();
  });

  it("renders the drawer when isOpen is true", () => {
    render(<EventFormDrawer {...defaultProps} />);
    expect(screen.getByTestId("side-drawer")).toBeInTheDocument();
  });

  it("does not render drawer when isOpen is false", () => {
    render(<EventFormDrawer {...defaultProps} isOpen={false} />);
    expect(screen.queryByTestId("side-drawer")).not.toBeInTheDocument();
  });

  it("renders event type options using EVENT_TYPE_VALUES", () => {
    render(<EventFormDrawer {...defaultProps} />);
    // The component maps over EVENT_TYPE_VALUES and creates <option> elements
    const options = screen.getAllByRole("option");
    // Should have at least the mocked type values as options
    expect(options.length).toBeGreaterThanOrEqual(5);
  });
});
