import { render, screen, fireEvent } from "@testing-library/react";
import type React from "react";
import { ProfileInfoForm, ToastProvider } from "@/components";
import { UI_LABELS } from "@/constants";

describe("ProfileInfoForm", () => {
  it("submits profile data", () => {
    const onSubmit = jest.fn();

    render(
      <ToastProvider>
        <ProfileInfoForm
          userId="user-1"
          initialData={{ displayName: UI_LABELS.ACTIONS.SAVE, phone: "" }}
          onSubmit={onSubmit}
        />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByLabelText(/Display Name/i));
    fireEvent.click(
      screen.getByRole("button", { name: UI_LABELS.ACTIONS.SAVE }),
    );

    expect(onSubmit).toHaveBeenCalled();
  });
});
