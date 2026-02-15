import { render, screen, fireEvent } from "@testing-library/react";
import type React from "react";
import { PasswordChangeForm } from "@/components";
import { UI_LABELS } from "@/constants";

jest.mock("@/utils", () => ({
  calculatePasswordStrength: () => ({ score: 5 }),
}));

describe("PasswordChangeForm", () => {
  it("submits new password", () => {
    const onSubmit = jest.fn();

    render(<PasswordChangeForm onSubmit={onSubmit} />);

    // Enter values into the password fields
    const currentPasswordInput = screen.getByLabelText(/Current Password/i);
    const newPasswordInput = screen.getByLabelText(/New Password/i);
    const confirmPasswordInput = screen.getByLabelText(/Confirm Password/i);

    fireEvent.change(currentPasswordInput, { target: { value: "oldPass123" } });
    fireEvent.change(newPasswordInput, { target: { value: "newPass456" } });
    fireEvent.change(confirmPasswordInput, { target: { value: "newPass456" } });

    // Submit the form
    fireEvent.click(
      screen.getByRole("button", { name: UI_LABELS.ACTIONS.CHANGE_PASSWORD }),
    );

    // Verify onSubmit was called with the correct password values
    expect(onSubmit).toHaveBeenCalledWith("oldPass123", "newPass456");
  });
});
