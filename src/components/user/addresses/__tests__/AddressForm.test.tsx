import { render, screen, fireEvent } from "@testing-library/react";
import type React from "react";
import { AddressForm } from "@/components";
import { UI_LABELS } from "@/constants";

describe("AddressForm", () => {
  it("submits and cancels", () => {
    const onSubmit = jest.fn();
    const onCancel = jest.fn();

    render(<AddressForm onSubmit={onSubmit} onCancel={onCancel} />);

    fireEvent.click(
      screen.getByRole("button", { name: UI_LABELS.ACTIONS.CANCEL }),
    );
    fireEvent.click(
      screen.getByRole("button", { name: UI_LABELS.ACTIONS.SAVE }),
    );

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });
});
