/**
 * SortDropdown Tests — Phase 2
 */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

jest.mock("@/constants", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const ui = require("../../../constants/ui");
  return {
    UI_LABELS: ui.UI_LABELS,
    THEME_CONSTANTS: {
      themed: { textSecondary: "text-gray-600" },
      input: { base: "border rounded-lg px-3 py-2" },
    },
  };
});

import { SortDropdown } from "../SortDropdown";

const OPTIONS = [
  { value: "-createdAt", label: "Newest first" },
  { value: "price", label: "Price: low → high" },
  { value: "-price", label: "Price: high → low" },
];

describe("SortDropdown", () => {
  it("renders all passed options as <option> elements", () => {
    render(
      <SortDropdown
        value="-createdAt"
        onChange={jest.fn()}
        options={OPTIONS}
      />,
    );
    expect(
      screen.getByRole("option", { name: "Newest first" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "Price: low → high" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "Price: high → low" }),
    ).toBeInTheDocument();
  });

  it("calls onChange with selected value on change", () => {
    const onChange = jest.fn();
    render(
      <SortDropdown value="-createdAt" onChange={onChange} options={OPTIONS} />,
    );
    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "-price" },
    });
    expect(onChange).toHaveBeenCalledWith("-price");
  });

  it("<label htmlFor> matches <select id> — accessible pairing", () => {
    render(
      <SortDropdown
        value="-createdAt"
        onChange={jest.fn()}
        options={OPTIONS}
      />,
    );
    const select = screen.getByRole("combobox");
    const label = screen.getByText("Sort by");
    expect(label).toHaveAttribute("for", select.id);
  });

  it("uses custom label when provided", () => {
    render(
      <SortDropdown
        value="-createdAt"
        onChange={jest.fn()}
        options={OPTIONS}
        label="Order by"
      />,
    );
    expect(screen.getByText("Order by")).toBeInTheDocument();
  });
});
