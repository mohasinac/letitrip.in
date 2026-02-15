import { render, screen } from "@testing-library/react";
import type React from "react";
import { ProfileHeader } from "@/components";
import { UI_LABELS } from "@/constants";

describe("ProfileHeader", () => {
  it("renders user info", () => {
    render(
      <ProfileHeader
        displayName={UI_LABELS.ACTIONS.SAVE}
        email="user@example.com"
        role="user"
      />,
    );

    expect(screen.getByText(UI_LABELS.ACTIONS.SAVE)).toBeInTheDocument();
    expect(screen.getByText("user@example.com")).toBeInTheDocument();
    expect(screen.getByRole("img")).toBeInTheDocument();
  });
});
