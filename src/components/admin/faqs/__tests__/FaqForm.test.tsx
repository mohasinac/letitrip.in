import { render, screen, fireEvent } from "@testing-library/react";
import type React from "react";
import { FaqForm } from "@/components";
import { UI_LABELS } from "@/constants";

describe("FaqForm", () => {
  it("updates question and answer", () => {
    const onChange = jest.fn();

    render(<FaqForm faq={{}} onChange={onChange} />);

    const questionInput = screen.getByLabelText("Question");
    fireEvent.change(questionInput, { target: { value: "Test Question" } });

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ question: "Test Question" }),
    );
  });
});
