import { render, screen, fireEvent } from "@testing-library/react";
import type React from "react";

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

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

  it("renders emailVerificationTitle from useTranslations", () => {
    render(
      <EmailVerificationCard email="user@example.com" isVerified={false} />,
    );
    expect(screen.getByText("emailVerificationTitle")).toBeInTheDocument();
  });

  it("shows notVerified badge when not verified", () => {
    render(
      <EmailVerificationCard email="user@example.com" isVerified={false} />,
    );
    expect(screen.getByText("notVerified")).toBeInTheDocument();
  });

  it("shows verified badge when verified", () => {
    render(
      <EmailVerificationCard email="user@example.com" isVerified={true} />,
    );
    expect(screen.getByText("verified")).toBeInTheDocument();
  });

  it("shows notVerifiedMessage when not verified", () => {
    render(
      <EmailVerificationCard email="user@example.com" isVerified={false} />,
    );
    expect(screen.getByText("notVerifiedMessage")).toBeInTheDocument();
  });

  it("shows verifiedMessage when verified", () => {
    render(
      <EmailVerificationCard email="user@example.com" isVerified={true} />,
    );
    expect(screen.getByText("verifiedMessage")).toBeInTheDocument();
  });

  it("shows resendVerification button label when not loading", () => {
    render(
      <EmailVerificationCard
        email="user@example.com"
        isVerified={false}
        onResendVerification={jest.fn()}
        isLoading={false}
      />,
    );
    expect(screen.getByText("resendVerification")).toBeInTheDocument();
  });

  it("shows sending label when loading", () => {
    render(
      <EmailVerificationCard
        email="user@example.com"
        isVerified={false}
        onResendVerification={jest.fn()}
        isLoading={true}
      />,
    );
    expect(screen.getByText("sending")).toBeInTheDocument();
  });
});
