/**
 * Tests for SurveyConfigForm component
 *
 * Coverage:
 * - Renders Label for entryReview checkbox
 * - Renders Label for hasLeaderboard checkbox
 * - Fires onChange when entryReview toggled
 * - Fires onChange when hasLeaderboard toggled
 * - Delegates formFields to SurveyFieldBuilder
 */

import { render, screen, fireEvent } from "@testing-library/react";
import { SurveyConfigForm } from "../SurveyConfigForm";

jest.mock("@/components", () => ({
  Label: ({
    children,
    htmlFor,
  }: {
    children: React.ReactNode;
    htmlFor?: string;
  }) => (
    <label htmlFor={htmlFor} data-testid="label">
      {children}
    </label>
  ),
}));

jest.mock("../../SurveyFieldBuilder", () => ({
  SurveyFieldBuilder: ({
    fields,
    onChange,
  }: {
    fields: unknown[];
    onChange: (f: unknown[]) => void;
  }) => <div data-testid="survey-field-builder" data-count={fields.length} />,
}));

describe("SurveyConfigForm", () => {
  it("renders Label for entryReview checkbox", () => {
    render(<SurveyConfigForm value={{}} onChange={jest.fn()} />);
    const labels = screen.getAllByTestId("label");
    expect(labels[0]).toHaveTextContent(/require admin review/i);
  });

  it("renders Label for hasLeaderboard checkbox", () => {
    render(<SurveyConfigForm value={{}} onChange={jest.fn()} />);
    const labels = screen.getAllByTestId("label");
    expect(labels[1]).toHaveTextContent(/leaderboard/i);
  });

  it("calls onChange when entryReview checkbox is toggled", () => {
    const handleChange = jest.fn();
    render(
      <SurveyConfigForm
        value={{ entryReviewRequired: false }}
        onChange={handleChange}
      />,
    );
    fireEvent.click(
      screen.getByRole("checkbox", { name: /require admin review/i }),
    );
    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({ entryReviewRequired: true }),
    );
  });

  it("calls onChange when hasLeaderboard checkbox is toggled", () => {
    const handleChange = jest.fn();
    render(
      <SurveyConfigForm
        value={{ hasLeaderboard: false }}
        onChange={handleChange}
      />,
    );
    fireEvent.click(screen.getByRole("checkbox", { name: /leaderboard/i }));
    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({ hasLeaderboard: true }),
    );
  });

  it("renders SurveyFieldBuilder with formFields", () => {
    render(
      <SurveyConfigForm
        value={{
          formFields: [
            { id: "f1", type: "text", label: "Name", required: false },
          ],
        }}
        onChange={jest.fn()}
      />,
    );
    expect(screen.getByTestId("survey-field-builder")).toHaveAttribute(
      "data-count",
      "1",
    );
  });
});
