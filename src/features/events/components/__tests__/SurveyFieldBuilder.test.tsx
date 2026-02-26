/**
 * @jest-environment jsdom
 */
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import type React from "react";
import { SurveyFieldBuilder } from "../SurveyFieldBuilder";

jest.mock("../../constants/FORM_FIELD_TYPE_OPTIONS", () => ({
  FORM_FIELD_TYPE_OPTIONS: [
    { value: "text", label: "Text" },
    { value: "textarea", label: "Textarea" },
  ],
}));

jest.mock("@/components", () => ({
  Button: ({ children, onClick, type }: any) => (
    <button type={type || "button"} onClick={onClick}>
      {children}
    </button>
  ),
}));

describe("SurveyFieldBuilder", () => {
  it("renders without crashing with empty fields", () => {
    expect(() =>
      render(<SurveyFieldBuilder fields={[]} onChange={jest.fn()} />),
    ).not.toThrow();
  });

  it("shows empty state message when no fields", () => {
    render(<SurveyFieldBuilder fields={[]} onChange={jest.fn()} />);
    expect(screen.getByText(/no fields yet/i)).toBeInTheDocument();
  });

  it("renders add field button", () => {
    render(<SurveyFieldBuilder fields={[]} onChange={jest.fn()} />);
    // "Add Field" button should be present
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThanOrEqual(1);
  });

  it("calls onChange when add field button is clicked", () => {
    const onChange = jest.fn();
    render(<SurveyFieldBuilder fields={[]} onChange={onChange} />);
    const addButton = screen.getAllByRole("button")[0];
    fireEvent.click(addButton);
    expect(onChange).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ type: "text", required: false }),
      ]),
    );
  });

  it("renders existing fields", () => {
    const fields = [
      {
        id: "f1",
        label: "Name",
        type: "text" as const,
        required: true,
        order: 0,
      },
    ];
    render(<SurveyFieldBuilder fields={fields} onChange={jest.fn()} />);
    expect(screen.getByDisplayValue("Name")).toBeInTheDocument();
  });
});
