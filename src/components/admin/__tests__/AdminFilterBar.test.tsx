import { render, screen } from "@testing-library/react";
import type React from "react";
import { AdminFilterBar } from "@/components";
import { UI_LABELS } from "@/constants";

describe("AdminFilterBar", () => {
  it("renders children", () => {
    render(
      <AdminFilterBar columns={2}>
        <div>{UI_LABELS.ACTIONS.SEARCH}</div>
        <div>{UI_LABELS.ACTIONS.SAVE}</div>
      </AdminFilterBar>,
    );

    expect(screen.getByText(UI_LABELS.ACTIONS.SEARCH)).toBeInTheDocument();
    expect(screen.getByText(UI_LABELS.ACTIONS.SAVE)).toBeInTheDocument();
  });
});
