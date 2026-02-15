import { render, screen, fireEvent } from "@testing-library/react";
import type React from "react";
import { EmailVerificationCard } from "@/components";

describe("EmailVerificationCard", () => {
  it("calls onResendVerification", () => {
    const onResendVerification = jest.fn();

    render(
      <EmailVerificationCard
        email="user@example.com"
        isVerified={false}
        onResendVerification={onResendVerification}
      />,
    );

    const buttons = screen.getAllByRole("button");
    fireEvent.click(buttons[0]);

    expect(onResendVerification).toHaveBeenCalledTimes(1);
  });
});
