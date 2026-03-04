import React from "react";
import { render, screen } from "@testing-library/react";
import { MediaImage } from "../MediaImage";

jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ alt, src }: { alt: string; src: string }) => (
    <img alt={alt} src={src} />
  ),
}));

describe("MediaImage", () => {
  it("renders an img with correct alt when src is provided", () => {
    render(<MediaImage src="/test.jpg" alt="Test image" />);
    expect(screen.getByAltText("Test image")).toBeInTheDocument();
  });

  it("renders fallback with aria-label when src is undefined", () => {
    render(<MediaImage src={undefined} alt="Missing image" />);
    // Fallback div has role=img with the aria-label
    expect(screen.getByRole("img", { name: "Missing image" })).toBeInTheDocument();
    // The mocked next/image <img> element should NOT be present
    expect(document.querySelector("img")).toBeNull();
  });

  it("renders custom fallback icon when provided", () => {
    const { container } = render(
      <MediaImage src={undefined} alt="Alt" fallback="🏔️" />
    );
    expect(container.textContent).toContain("🏔️");
  });

  it("uses 📦 as default fallback for card size", () => {
    const { container } = render(<MediaImage src={undefined} alt="Alt" size="card" />);
    expect(container.textContent).toContain("📦");
  });

  it("uses 👤 as default fallback for avatar size", () => {
    const { container } = render(<MediaImage src={undefined} alt="Alt" size="avatar" />);
    expect(container.textContent).toContain("👤");
  });

  it("applies className to the wrapper div when src is provided", () => {
    const { container } = render(
      <MediaImage src="/test.jpg" alt="Alt" className="my-custom-class" />
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass("my-custom-class");
  });

  it("applies className to the fallback div when src is undefined", () => {
    const { container } = render(
      <MediaImage src={undefined} alt="Alt" className="my-custom-class" />
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass("my-custom-class");
  });
});
