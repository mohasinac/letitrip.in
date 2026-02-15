import { render, screen, fireEvent } from "@testing-library/react";
import type React from "react";
import { getCategoryTableColumns } from "@/components";
import { UI_LABELS } from "@/constants";
import type { Category } from "@/components";

describe("CategoryTableColumns", () => {
  const category: Category = {
    id: "cat-1",
    name: UI_LABELS.ACTIONS.SAVE,
    slug: "save",
    parentId: null,
    tier: 0,
    order: 0,
    enabled: true,
    showOnHomepage: false,
    metrics: {
      productCount: 0,
      totalProductCount: 0,
      auctionCount: 0,
      totalAuctionCount: 0,
    },
    children: [],
  };

  it("renders action buttons", () => {
    const onEdit = jest.fn();
    const onDelete = jest.fn();
    const { actions } = getCategoryTableColumns(onEdit, onDelete);

    render(actions(category));

    fireEvent.click(
      screen.getByRole("button", { name: UI_LABELS.ACTIONS.EDIT }),
    );
    fireEvent.click(
      screen.getByRole("button", { name: UI_LABELS.ACTIONS.DELETE }),
    );

    expect(onEdit).toHaveBeenCalledWith(category);
    expect(onDelete).toHaveBeenCalledWith(category);
  });
});
