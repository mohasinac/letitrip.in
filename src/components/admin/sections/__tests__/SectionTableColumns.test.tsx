import { render, screen, fireEvent } from "@testing-library/react";
import type React from "react";
import { getSectionTableColumns } from "@/components";
import { UI_LABELS } from "@/constants";
import type { HomepageSection } from "@/components";

describe("SectionTableColumns", () => {
  const section: HomepageSection = {
    id: "section-1",
    type: "hero",
    title: UI_LABELS.ACTIONS.SAVE,
    enabled: true,
    order: 1,
    config: {},
  };

  it("renders action buttons", () => {
    const onEdit = jest.fn();
    const onDelete = jest.fn();
    const { actions } = getSectionTableColumns(onEdit, onDelete);

    render(actions(section));

    fireEvent.click(
      screen.getByRole("button", { name: UI_LABELS.ACTIONS.EDIT }),
    );
    fireEvent.click(
      screen.getByRole("button", { name: UI_LABELS.ACTIONS.DELETE }),
    );

    expect(onEdit).toHaveBeenCalledWith(section);
    expect(onDelete).toHaveBeenCalledWith(section);
  });
});
