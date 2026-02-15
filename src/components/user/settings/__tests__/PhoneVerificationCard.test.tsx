import { render, screen, fireEvent } from "@testing-library/react";
import type React from "react";
import { PhoneVerificationCard } from "@/components";

describe("PhoneVerificationCard", () => {
  it("calls onVerify", () => {
    const onVerify = jest.fn();

    render(
      <PhoneVerificationCard
        phone="123"
        isVerified={false}
        onVerify={onVerify}
      />,
    );

    const buttons = screen.getAllByRole("button");
    fireEvent.click(buttons[0]);

    expect(onVerify).toHaveBeenCalledTimes(1);
  });
});
