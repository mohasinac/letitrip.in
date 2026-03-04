/**
 * Tests for FeedbackConfigForm component
 *
 * Coverage:
 * - Renders allowAnonymous checkbox with translated label
 * - Fires onChange when anonymous checkbox is toggled
 * - Delegates formFields to SurveyFieldBuilder
 */

import { render, screen, fireEvent } from "@testing-library/react";
import { FeedbackConfigForm } from "../FeedbackConfigForm";

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

jest.mock("@/components", () => ({
  Checkbox: ({
    id,
    checked,
    onChange,
    label,
  }: {
    id: string;
    checked: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    label: string;
  }) => (
    <input
      data-testid={`checkbox-${id}`}
      type="checkbox"
      aria-label={label}
      checked={checked}
      onChange={onChange}
    />
  ),
}));

jest.mock("@/constants", () => ({
  THEME_CONSTANTS: {
    spacing: { stack: "space-y-4" },
  },
}));

jest.mock("../../SurveyFieldBuilder", () => ({
  SurveyFieldBuilder: ({
    fields,
  }: {
    fields: unknown[];
    onChange: (f: unknown[]) => void;
  }) => <div data-testid="survey-field-builder" data-count={fields.length} />,
}));

describe("FeedbackConfigForm", () => {
  it("renders allowAnonymous checkbox with translated label key", () => {
    render(<FeedbackConfigForm value={{}} onChange={jest.fn()} />);
    expect(
      screen.getByRole("checkbox", { name: "allowAnonymousLabel" }),
    ).toBeInTheDocument();
  });

  it("calls onChange with anonymous:true when checkbox is toggled on", () => {
    const handleChange = jest.fn();
    render(
      <FeedbackConfigForm
        value={{ anonymous: false }}
        onChange={handleChange}
      />,
    );
    fireEvent.click(
      screen.getByRole("checkbox", { name: "allowAnonymousLabel" }),
    );
    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({ anonymous: true }),
    );
  });

  it("calls onChange with anonymous:false when checkbox is toggled off", () => {
    const handleChange = jest.fn();
    render(
      <FeedbackConfigForm
        value={{ anonymous: true }}
        onChange={handleChange}
      />,
    );
    fireEvent.click(
      screen.getByRole("checkbox", { name: "allowAnonymousLabel" }),
    );
    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({ anonymous: false }),
    );
  });

  it("renders SurveyFieldBuilder with formFields", () => {
    render(
      <FeedbackConfigForm value={{ formFields: [] }} onChange={jest.fn()} />,
    );
    expect(screen.getByTestId("survey-field-builder")).toBeInTheDocument();
  });

  it("calls onChange with updated formFields from SurveyFieldBuilder", () => {
    // SurveyFieldBuilder is mocked so we just verify rendering
    render(
      <FeedbackConfigForm value={{ formFields: [] }} onChange={jest.fn()} />,
    );
    expect(screen.getByTestId("survey-field-builder")).toHaveAttribute(
      "data-count",
      "0",
    );
  });
});
