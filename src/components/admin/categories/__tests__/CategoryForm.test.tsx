import { render, screen, fireEvent } from "@testing-library/react";
import type React from "react";
import { CategoryForm } from "@/components";
import { UI_LABELS } from "@/constants";
import type { Category } from "@/components";

describe("CategoryForm", () => {
  const categories: Category[] = [
    {
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
    },
  ];

  it("updates name and slug", () => {
    const onChange = jest.fn();

    render(
      <CategoryForm
        category={{ id: "cat-2" }}
        allCategories={categories}
        onChange={onChange}
      />,
    );

    const nameInput = screen.getByLabelText(UI_LABELS.TABLE.NAME);
    fireEvent.change(nameInput, { target: { value: "New Category" } });

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "New Category",
        slug: "new-category",
      }),
    );
  });

  it("shows image upload when editable", () => {
    const onChange = jest.fn();

    render(
      <CategoryForm
        category={{ id: "cat-2" }}
        allCategories={categories}
        onChange={onChange}
      />,
    );

    expect(
      screen.getByRole("button", { name: /change|click to upload/i }),
    ).toBeInTheDocument();
  });
});
