import { render, screen, fireEvent } from "@testing-library/react";
import type React from "react";
import { SiteContactForm } from "@/components";
import { UI_LABELS } from "@/constants";

describe("SiteContactForm", () => {
  it("renders labels and handles change", () => {
    const onChange = jest.fn();

    render(
      <SiteContactForm
        settings={{ contact: { email: "", phone: "", address: "" } }}
        onChange={onChange}
      />,
    );

    const emailInput = screen.getByLabelText(
      UI_LABELS.ADMIN.SITE.SUPPORT_EMAIL,
    );
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        contact: expect.objectContaining({ email: "test@example.com" }),
      }),
    );
  });
});
