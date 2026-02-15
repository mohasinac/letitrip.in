import { render, screen, fireEvent } from "@testing-library/react";
import type React from "react";
import { SectionForm } from "@/components";
import { UI_LABELS } from "@/constants";
import type { HomepageSection } from "@/components";

describe("SectionForm", () => {
  const section: HomepageSection = {
    id: "section-1",
    type: "hero",
    title: UI_LABELS.ACTIONS.SAVE,
    enabled: true,
    order: 1,
    config: {},
  };

  it("updates section and config", () => {
    const onChange = jest.fn();

    render(<SectionForm section={section} onChange={onChange} />);

    const titleInput = screen.getByLabelText("Title");
    fireEvent.change(titleInput, { target: { value: "New Title" } });

    const textboxes = screen.getAllByRole("textbox");
    const configInput = textboxes[textboxes.length - 1];
    fireEvent.change(configInput, {
      target: { value: JSON.stringify({ key: "test-value" }) },
    });

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ title: "New Title" }),
    );
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        config: expect.objectContaining({ key: "test-value" }),
      }),
    );
  });
});
