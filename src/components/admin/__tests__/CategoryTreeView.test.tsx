import { render, screen, fireEvent } from "@testing-library/react";
import type React from "react";
import { CategoryTreeView } from "@/components";
import { UI_LABELS } from "@/constants";

const categories = [
  {
    id: "cat-1",
    name: UI_LABELS.ACTIONS.SAVE,
    slug: "save",
    tier: 0,
    parentId: null,
    children: [],
  },
];

describe("CategoryTreeView", () => {
  it("calls onSelect when clicking category", () => {
    const onSelect = jest.fn();

    render(<CategoryTreeView categories={categories} onSelect={onSelect} />);

    fireEvent.click(
      screen.getByRole("button", { name: UI_LABELS.ACTIONS.SAVE }),
    );

    expect(onSelect).toHaveBeenCalledWith(categories[0]);
  });
});
