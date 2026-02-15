import { render, screen, fireEvent } from "@testing-library/react";
import type React from "react";
import { SiteBasicInfoForm } from "@/components";
import { UI_LABELS } from "@/constants";

describe("SiteBasicInfoForm", () => {
  it("renders labels and handles change", () => {
    const onChange = jest.fn();

    render(
      <SiteBasicInfoForm
        settings={{ siteName: UI_LABELS.ADMIN.SITE.TITLE }}
        onChange={onChange}
      />,
    );

    const siteNameInput = screen.getByLabelText(UI_LABELS.ADMIN.SITE.SITE_NAME);
    fireEvent.change(siteNameInput, {
      target: { value: UI_LABELS.ACTIONS.SAVE },
    });
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ siteName: UI_LABELS.ACTIONS.SAVE }),
    );
  });
});
