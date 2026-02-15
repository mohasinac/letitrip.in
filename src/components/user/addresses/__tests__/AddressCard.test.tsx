import { render, screen, fireEvent } from "@testing-library/react";
import type React from "react";
import { AddressCard } from "@/components";
import { UI_LABELS } from "@/constants";

describe("AddressCard", () => {
  it("calls actions", () => {
    const onEdit = jest.fn();
    const onDelete = jest.fn();
    const onSetDefault = jest.fn();

    render(
      <AddressCard
        address={{
          id: "addr-1",
          label: UI_LABELS.ACTIONS.SAVE,
          fullName: UI_LABELS.ACTIONS.SAVE,
          phone: "123",
          addressLine1: UI_LABELS.ACTIONS.SAVE,
          city: UI_LABELS.ACTIONS.SAVE,
          state: UI_LABELS.ACTIONS.SAVE,
          postalCode: "0",
          country: UI_LABELS.ACTIONS.SAVE,
        }}
        onEdit={onEdit}
        onDelete={onDelete}
        onSetDefault={onSetDefault}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: UI_LABELS.ACTIONS.EDIT }),
    );
    fireEvent.click(
      screen.getByRole("button", { name: UI_LABELS.ACTIONS.DELETE }),
    );

    const buttons = screen.getAllByRole("button");
    fireEvent.click(buttons[buttons.length - 1]);

    expect(onEdit).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onSetDefault).toHaveBeenCalledTimes(1);
  });
});
