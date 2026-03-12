import { renderHook } from "@testing-library/react";
import { render, screen, fireEvent } from "@testing-library/react";
import type React from "react";
import { useCarouselTableColumns } from "../CarouselTableColumns";
import type { CarouselSlide } from "../Carousel.types";

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

jest.mock("@/components", () => ({
  StatusBadge: ({ label }: any) => <span>{label}</span>,
  Button: ({ children, onClick }: any) => (
    <button onClick={onClick}>{children}</button>
  ),
  Text: ({ children }: any) => <span>{children}</span>,
  MediaImage: () => <img alt="media" />,
}));

describe("CarouselTableColumns", () => {
  const slide: CarouselSlide = {
    id: "slide-1",
    title: "Test Slide",
    media: { type: "image", url: "image-url", alt: "Test Slide" },
    active: true,
    order: 1,
    cards: [],
  };

  it("renders action buttons", () => {
    const onEdit = jest.fn();
    const onDelete = jest.fn();
    const { result } = renderHook(() =>
      useCarouselTableColumns(onEdit, onDelete),
    );
    const { actions } = result.current;

    render(actions(slide));

    fireEvent.click(screen.getByRole("button", { name: "edit" }));
    fireEvent.click(screen.getByRole("button", { name: "delete" }));

    expect(onEdit).toHaveBeenCalledWith(slide);
    expect(onDelete).toHaveBeenCalledWith(slide);
  });
});
