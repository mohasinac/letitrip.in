import { render, screen, fireEvent } from "@testing-library/react";
import type React from "react";
import { SiteSocialLinksForm } from "@/components";
import { UI_LABELS } from "@/constants";

describe("SiteSocialLinksForm", () => {
  it("renders labels and handles change", () => {
    const onChange = jest.fn();

    render(<SiteSocialLinksForm settings={{}} onChange={onChange} />);

    const facebookInput = screen.getByLabelText(UI_LABELS.ADMIN.SITE.FACEBOOK);
    fireEvent.change(facebookInput, {
      target: { value: "https://facebook.com/example" },
    });
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        socialLinks: expect.objectContaining({
          facebook: "https://facebook.com/example",
        }),
      }),
    );
  });
});
