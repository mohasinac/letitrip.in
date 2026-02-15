import { render, screen, fireEvent } from "@testing-library/react";
import type React from "react";
import { getCarouselTableColumns } from "@/components";
import { UI_LABELS } from "@/constants";
import type { CarouselSlide } from "@/components";

describe("CarouselTableColumns", () => {
  const slide: CarouselSlide = {
    id: "slide-1",
    title: UI_LABELS.ACTIONS.SAVE,
    imageUrl: "image-url",
    isActive: true,
    order: 1,
  };

  it("renders action buttons", () => {
    const onEdit = jest.fn();
    const onDelete = jest.fn();
    const { actions } = getCarouselTableColumns(onEdit, onDelete);

    render(actions(slide));

    fireEvent.click(
      screen.getByRole("button", { name: UI_LABELS.ACTIONS.EDIT }),
    );
    fireEvent.click(
      screen.getByRole("button", { name: UI_LABELS.ACTIONS.DELETE }),
    );

    expect(onEdit).toHaveBeenCalledWith(slide);
    expect(onDelete).toHaveBeenCalledWith(slide);
  });
});
