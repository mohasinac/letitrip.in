import { render, screen } from "@testing-library/react";
import type React from "react";
import { AccountInfoCard } from "@/components";
import { UI_LABELS } from "@/constants";

jest.mock("@/utils", () => ({
  formatDate: () => UI_LABELS.LOADING.DEFAULT,
}));

describe("AccountInfoCard", () => {
  it("renders account data", () => {
    render(
      <AccountInfoCard
        uid="user-1"
        email="user@example.com"
        createdAt={new Date()}
      />,
    );

    expect(screen.getByText("user@example.com")).toBeInTheDocument();
    expect(screen.getByText("user-1")).toBeInTheDocument();
  });
});
