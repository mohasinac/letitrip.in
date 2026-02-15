import { render, screen, fireEvent } from "@testing-library/react";
import type React from "react";
import { BackgroundSettings } from "@/components";
import { UI_LABELS } from "@/constants";

describe("BackgroundSettings", () => {
  it("updates config on input change", () => {
    const onChange = jest.fn();

    render(
      <BackgroundSettings
        lightMode={{
          type: "color",
          value: "#000000",
          overlay: { enabled: false, color: "#000000", opacity: 0 },
        }}
        darkMode={{
          type: "color",
          value: "#111111",
          overlay: { enabled: false, color: "#000000", opacity: 0 },
        }}
        onChange={onChange}
      />,
    );

    const inputs = screen.getAllByRole("textbox");
    fireEvent.change(inputs[0], {
      target: { value: UI_LABELS.ACTIONS.SAVE },
    });

    expect(onChange).toHaveBeenCalledWith(
      "light",
      expect.objectContaining({ value: UI_LABELS.ACTIONS.SAVE }),
    );
  });
});
