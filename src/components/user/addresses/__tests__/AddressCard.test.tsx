import { render, screen, fireEvent } from "@testing-library/react";
import type React from "react";
import { AddressCard } from "@/components";
import { UI_LABELS } from "@/constants";

describe("AddressCard", () => {
  it("renders address label as heading", () => {
    render(
      <AddressCard
        address={{
          id: "addr-1",
          label: "Home",
          fullName: "John Doe",
          phone: "9876543210",
          addressLine1: "123 Main St",
          city: "Mumbai",
          state: "MH",
          postalCode: "400001",
          country: "India",
        }}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
      />,
    );
    const heading = screen.getByRole("heading", { name: "Home" });
    expect(heading).toBeInTheDocument();
    expect(heading.tagName).toBe("H3");
  });

  it("renders address details as text elements", () => {
    render(
      <AddressCard
        address={{
          id: "addr-2",
          label: "Work",
          fullName: "Jane Doe",
          phone: "1234567890",
          addressLine1: "456 Second Ave",
          city: "Delhi",
          state: "DL",
          postalCode: "110001",
          country: "India",
        }}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
      />,
    );
    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    expect(screen.getByText("1234567890")).toBeInTheDocument();
    expect(screen.getByText("456 Second Ave")).toBeInTheDocument();
    expect(screen.getByText("India")).toBeInTheDocument();
  });

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
