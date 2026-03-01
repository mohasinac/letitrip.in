import { render, screen, fireEvent } from "@testing-library/react";
import type React from "react";

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

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

  it("renders phoneVerificationTitle from useTranslations", () => {
    render(<PhoneVerificationCard isVerified={false} />);
    expect(screen.getByText("phoneVerificationTitle")).toBeInTheDocument();
  });

  it("shows phoneNotAdded message when no phone", () => {
    render(<PhoneVerificationCard isVerified={false} />);
    expect(screen.getByText("phoneNotAdded")).toBeInTheDocument();
  });

  it("shows notVerified badge when phone present but not verified", () => {
    render(<PhoneVerificationCard phone="+919876543210" isVerified={false} />);
    expect(screen.getByText("notVerified")).toBeInTheDocument();
  });

  it("shows verified badge when phone present and verified", () => {
    render(<PhoneVerificationCard phone="+919876543210" isVerified={true} />);
    expect(screen.getByText("verified")).toBeInTheDocument();
  });

  it("shows phoneVerifiedMessage when verified", () => {
    render(<PhoneVerificationCard phone="+919876543210" isVerified={true} />);
    expect(screen.getByText("phoneVerifiedMessage")).toBeInTheDocument();
  });

  it("shows phoneNotVerifiedMessage when phone present but not verified", () => {
    render(<PhoneVerificationCard phone="+919876543210" isVerified={false} />);
    expect(screen.getByText("phoneNotVerifiedMessage")).toBeInTheDocument();
  });

  it("shows verify label when not loading", () => {
    render(
      <PhoneVerificationCard
        phone="+919876543210"
        isVerified={false}
        onVerify={jest.fn()}
        isLoading={false}
      />,
    );
    expect(screen.getByText("verify")).toBeInTheDocument();
  });

  it("shows verifying label when loading", () => {
    render(
      <PhoneVerificationCard
        phone="+919876543210"
        isVerified={false}
        onVerify={jest.fn()}
        isLoading={true}
      />,
    );
    expect(screen.getByText("verifying")).toBeInTheDocument();
  });

  it("renders phoneVerificationTitle inside an h3 element (Heading level={3})", () => {
    const { container } = render(<PhoneVerificationCard isVerified={false} />);
    const heading = container.querySelector("h3");
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent("phoneVerificationTitle");
  });
});
