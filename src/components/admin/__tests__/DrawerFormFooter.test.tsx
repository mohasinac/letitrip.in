import { render, screen, fireEvent } from "@testing-library/react";
import type React from "react";
import { DrawerFormFooter } from "@/components";

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

describe("DrawerFormFooter", () => {
  it("renders action buttons with default translation keys", () => {
    const onCancel = jest.fn();
    const onSubmit = jest.fn();
    const onDelete = jest.fn();

    render(
      <DrawerFormFooter
        onCancel={onCancel}
        onSubmit={onSubmit}
        onDelete={onDelete}
      />,
    );

    // Default labels come from t('save'), t('cancel'), t('delete') → key strings
    expect(screen.getByRole("button", { name: "cancel" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "save" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "delete" })).toBeInTheDocument();
  });

  it("handles button click callbacks", () => {
    const onCancel = jest.fn();
    const onSubmit = jest.fn();
    const onDelete = jest.fn();

    render(
      <DrawerFormFooter
        onCancel={onCancel}
        onSubmit={onSubmit}
        onDelete={onDelete}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "cancel" }));
    fireEvent.click(screen.getByRole("button", { name: "save" }));
    fireEvent.click(screen.getByRole("button", { name: "delete" }));

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it("shows loading text when isLoading is true", () => {
    render(
      <DrawerFormFooter
        onCancel={jest.fn()}
        onSubmit={jest.fn()}
        isLoading={true}
      />,
    );

    // isLoading → tLoading('saving') → 'saving'
    expect(screen.getByRole("button", { name: "saving" })).toBeInTheDocument();
  });

  it("accepts custom submitLabel/cancelLabel/deleteLabel props", () => {
    render(
      <DrawerFormFooter
        onCancel={jest.fn()}
        onSubmit={jest.fn()}
        onDelete={jest.fn()}
        submitLabel="Update User"
        cancelLabel="Go Back"
        deleteLabel="Remove"
      />,
    );

    expect(
      screen.getByRole("button", { name: "Update User" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Go Back" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Remove" })).toBeInTheDocument();
  });

  it("does not render delete button when onDelete is not provided", () => {
    render(<DrawerFormFooter onCancel={jest.fn()} onSubmit={jest.fn()} />);

    expect(
      screen.queryByRole("button", { name: "delete" }),
    ).not.toBeInTheDocument();
  });
});
