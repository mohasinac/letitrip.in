import { render, screen, fireEvent } from "@testing-library/react";
import type React from "react";
import { DrawerFormFooter } from "@/components";
import { UI_LABELS } from "@/constants";

describe("DrawerFormFooter", () => {
  it("renders action buttons and handles clicks", () => {
    const onCancel = jest.fn();
    const onSubmit = jest.fn();
    const onDelete = jest.fn();

    render(
      <DrawerFormFooter
        onCancel={onCancel}
        onSubmit={onSubmit}
        onDelete={onDelete}
        submitLabel={UI_LABELS.ACTIONS.SAVE}
        deleteLabel={UI_LABELS.ACTIONS.DELETE}
        cancelLabel={UI_LABELS.ACTIONS.CANCEL}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: UI_LABELS.ACTIONS.CANCEL }),
    );
    fireEvent.click(
      screen.getByRole("button", { name: UI_LABELS.ACTIONS.SAVE }),
    );
    fireEvent.click(
      screen.getByRole("button", { name: UI_LABELS.ACTIONS.DELETE }),
    );

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledTimes(1);
  });
});
