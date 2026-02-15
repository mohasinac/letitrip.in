import { render, screen, fireEvent } from "@testing-library/react";
import type React from "react";
import { AdminPageHeader } from "@/components";
import { UI_LABELS } from "@/constants";

describe("AdminPageHeader", () => {
  it("renders title, subtitle, and action button", () => {
    const onAction = jest.fn();

    render(
      <AdminPageHeader
        title={UI_LABELS.ADMIN.DASHBOARD.TITLE}
        subtitle={UI_LABELS.ADMIN.DASHBOARD.SUBTITLE}
        actionLabel={UI_LABELS.ACTIONS.REFRESH}
        onAction={onAction}
      />,
    );

    expect(
      screen.getByText(UI_LABELS.ADMIN.DASHBOARD.TITLE),
    ).toBeInTheDocument();
    expect(
      screen.getByText(UI_LABELS.ADMIN.DASHBOARD.SUBTITLE),
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: UI_LABELS.ACTIONS.REFRESH }),
    );
    expect(onAction).toHaveBeenCalledTimes(1);
  });
});
