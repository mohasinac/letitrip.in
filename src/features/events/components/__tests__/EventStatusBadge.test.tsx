/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import type React from "react";
import { EventStatusBadge } from "../EventStatusBadge";

jest.mock("@/components", () => ({
  Badge: ({ children, variant }: any) => (
    <span data-testid="badge" data-variant={variant}>
      {children}
    </span>
  ),
}));

describe("EventStatusBadge", () => {
  it("renders active status with success variant", () => {
    render(<EventStatusBadge status="active" />);
    const badge = screen.getByTestId("badge");
    expect(badge).toHaveAttribute("data-variant", "success");
  });

  it("renders draft status with secondary variant", () => {
    render(<EventStatusBadge status="draft" />);
    const badge = screen.getByTestId("badge");
    expect(badge).toHaveAttribute("data-variant", "secondary");
  });

  it("renders paused status with warning variant", () => {
    render(<EventStatusBadge status="paused" />);
    const badge = screen.getByTestId("badge");
    expect(badge).toHaveAttribute("data-variant", "warning");
  });

  it("renders ended status with danger variant", () => {
    render(<EventStatusBadge status="ended" />);
    const badge = screen.getByTestId("badge");
    expect(badge).toHaveAttribute("data-variant", "danger");
  });
});
