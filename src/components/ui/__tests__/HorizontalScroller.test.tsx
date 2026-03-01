/**
 * HorizontalScroller Tests — Wave 1 (children passthrough + snapToItems)
 *
 * Covers:
 * - items+renderItem mode (basic render)
 * - children passthrough mode (new)
 * - snapToItems adds snap classes in children mode
 * - className forwarded in children mode
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

jest.mock("@/constants", () => ({
  THEME_CONSTANTS: {
    themed: {
      border: "border-gray-200",
      textPrimary: "text-gray-900",
      bgPrimary: "bg-white",
      hover: "hover:bg-gray-100",
    },
    utilities: { scrollbarHide: "scrollbar-hide" },
  },
}));

jest.mock("../useHorizontalScrollDrag", () => ({
  useHorizontalScrollDrag: () => ({
    style: {},
    cursorClass: "",
    handlers: {},
  }),
}));

jest.mock("../useHorizontalAutoScroll", () => ({
  useHorizontalAutoScroll: jest.fn(),
}));

// Polyfill ResizeObserver for JSDOM (items mode uses it)
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

import { HorizontalScroller } from "../HorizontalScroller";

describe("HorizontalScroller — children passthrough mode", () => {
  it("renders children directly", () => {
    render(
      <HorizontalScroller>
        <span data-testid="child-a">A</span>
        <span data-testid="child-b">B</span>
      </HorizontalScroller>,
    );
    expect(screen.getByTestId("child-a")).toBeInTheDocument();
    expect(screen.getByTestId("child-b")).toBeInTheDocument();
  });

  it("applies custom className in children mode", () => {
    const { container } = render(
      <HorizontalScroller className="mt-4 pb-2">
        <span>item</span>
      </HorizontalScroller>,
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain("mt-4");
    expect(wrapper.className).toContain("pb-2");
  });

  it("adds snap-x snap-mandatory when snapToItems=true in children mode", () => {
    const { container } = render(
      <HorizontalScroller snapToItems>
        <span>item</span>
      </HorizontalScroller>,
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain("snap-x");
    expect(wrapper.className).toContain("snap-mandatory");
  });

  it("does NOT add snap classes when snapToItems is false/omitted in children mode", () => {
    const { container } = render(
      <HorizontalScroller>
        <span>item</span>
      </HorizontalScroller>,
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).not.toContain("snap-x");
  });

  it("applies overflow-x-auto and flex in children mode", () => {
    const { container } = render(
      <HorizontalScroller>
        <span>item</span>
      </HorizontalScroller>,
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain("overflow-x-auto");
    expect(wrapper.className).toContain("flex");
  });
});

describe("HorizontalScroller — items mode", () => {
  const items = ["Apple", "Banana", "Cherry"];

  it("renders each item via renderItem", () => {
    render(
      <HorizontalScroller
        items={items}
        renderItem={(item) => <span key={item}>{item}</span>}
      />,
    );
    expect(screen.getByText("Apple")).toBeInTheDocument();
    expect(screen.getByText("Banana")).toBeInTheDocument();
    expect(screen.getByText("Cherry")).toBeInTheDocument();
  });
});
