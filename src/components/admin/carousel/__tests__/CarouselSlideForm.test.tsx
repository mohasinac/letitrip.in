import { render, screen, fireEvent } from "@testing-library/react";
import type React from "react";
import { CarouselSlideForm } from "@/components";
import { UI_LABELS } from "@/constants";
import type { CarouselSlide } from "@/components";

describe("CarouselSlideForm", () => {
  const baseSlide: CarouselSlide = {
    id: "slide-1",
    title: UI_LABELS.ACTIONS.SAVE,
    imageUrl: "image-url",
    isActive: true,
    order: 1,
  };

  it("calls onChange when fields update", () => {
    const onChange = jest.fn();

    render(<CarouselSlideForm slide={baseSlide} onChange={onChange} />);

    const titleInput = screen.getByLabelText("Title");
    fireEvent.change(titleInput, { target: { value: "New Title" } });

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ title: "New Title" }),
    );
  });

  it("shows image upload when editable", () => {
    const onChange = jest.fn();

    render(<CarouselSlideForm slide={baseSlide} onChange={onChange} />);

    expect(
      screen.getByRole("button", { name: /change|click to upload/i }),
    ).toBeInTheDocument();
  });

  it("hides image upload when readonly", () => {
    const onChange = jest.fn();

    render(
      <CarouselSlideForm
        slide={baseSlide}
        onChange={onChange}
        isReadonly={true}
      />,
    );

    expect(
      screen.queryByRole("button", { name: /change|click to upload/i }),
    ).not.toBeInTheDocument();
  });
});
