import React from "react";
import { render, screen } from "@testing-library/react";
import { MediaAvatar } from "../MediaAvatar";

jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ alt, src }: { alt: string; src: string }) => (
    <img alt={alt} src={src} />
  ),
}));

describe("MediaAvatar", () => {
  it("renders img with correct alt when src is provided", () => {
    render(<MediaAvatar src="/avatar.jpg" alt="Jane Doe" />);
    expect(screen.getByAltText("Jane Doe")).toBeInTheDocument();
  });

  it("renders 👤 fallback when src is undefined", () => {
    const { container } = render(
      <MediaAvatar src={undefined} alt="Unknown user" />,
    );
    expect(container.textContent).toContain("👤");
  });

  it("applies sm size class", () => {
    const { container } = render(
      <MediaAvatar src="/a.jpg" alt="User" size="sm" />,
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass("w-8", "h-8");
  });

  it("applies md size class by default", () => {
    const { container } = render(<MediaAvatar src="/a.jpg" alt="User" />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass("w-10", "h-10");
  });

  it("applies lg size class", () => {
    const { container } = render(
      <MediaAvatar src="/a.jpg" alt="User" size="lg" />,
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass("w-14", "h-14");
  });

  it("applies xl size class", () => {
    const { container } = render(
      <MediaAvatar src="/a.jpg" alt="User" size="xl" />,
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass("w-20", "h-20");
  });

  it("applies rounded-full and overflow-hidden to wrapper", () => {
    const { container } = render(<MediaAvatar src="/a.jpg" alt="User" />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass("rounded-full", "overflow-hidden");
  });

  it("forwards extra className to wrapper", () => {
    const { container } = render(
      <MediaAvatar
        src="/a.jpg"
        alt="User"
        className="ring-2 ring-indigo-500"
      />,
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass("ring-2", "ring-indigo-500");
  });
});
