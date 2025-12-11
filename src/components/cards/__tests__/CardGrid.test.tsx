/**
 * CardGrid Component - Comprehensive Tests
 */

import "@testing-library/jest-dom";
import { render } from "@testing-library/react";
import { CardGrid } from "../../cards/CardGrid";

describe("CardGrid", () => {
  it("should render children", () => {
    const { getByText } = render(
      <CardGrid>
        <div>Child 1</div>
        <div>Child 2</div>
      </CardGrid>
    );
    expect(getByText("Child 1")).toBeInTheDocument();
    expect(getByText("Child 2")).toBeInTheDocument();
  });

  it("should apply default columns", () => {
    const { container } = render(
      <CardGrid>
        <div>Test</div>
      </CardGrid>
    );
    const grid = container.firstChild;
    expect(grid).toHaveClass("grid-cols-1");
    expect(grid).toHaveClass("sm:grid-cols-2");
    expect(grid).toHaveClass("md:grid-cols-3");
    expect(grid).toHaveClass("lg:grid-cols-4");
  });

  it("should apply custom columns", () => {
    const { container } = render(
      <CardGrid columns={{ xs: 2, sm: 3, md: 4, lg: 5, xl: 6 }}>
        <div>Test</div>
      </CardGrid>
    );
    const grid = container.firstChild;
    expect(grid).toHaveClass("grid-cols-2");
    expect(grid).toHaveClass("sm:grid-cols-3");
    expect(grid).toHaveClass("md:grid-cols-4");
    expect(grid).toHaveClass("lg:grid-cols-5");
    expect(grid).toHaveClass("xl:grid-cols-6");
  });

  it("should apply small gap", () => {
    const { container } = render(
      <CardGrid gap="sm">
        <div>Test</div>
      </CardGrid>
    );
    expect(container.firstChild).toHaveClass("gap-2");
  });

  it("should apply medium gap by default", () => {
    const { container } = render(
      <CardGrid>
        <div>Test</div>
      </CardGrid>
    );
    expect(container.firstChild).toHaveClass("gap-4");
  });

  it("should apply large gap", () => {
    const { container } = render(
      <CardGrid gap="lg">
        <div>Test</div>
      </CardGrid>
    );
    expect(container.firstChild).toHaveClass("gap-6");
  });

  it("should apply custom className", () => {
    const { container } = render(
      <CardGrid className="custom-class">
        <div>Test</div>
      </CardGrid>
    );
    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("should handle partial column configuration", () => {
    const { container } = render(
      <CardGrid columns={{ md: 3 }}>
        <div>Test</div>
      </CardGrid>
    );
    const grid = container.firstChild;
    expect(grid).toHaveClass("md:grid-cols-3");
  });

  it("should handle no children", () => {
    const { container } = render(<CardGrid />);
    expect(container.firstChild).toBeInTheDocument();
    expect(container.firstChild).toHaveClass("grid");
  });

  it("should match snapshot - default", () => {
    const { container } = render(
      <CardGrid>
        <div>Item 1</div>
        <div>Item 2</div>
      </CardGrid>
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it("should match snapshot - custom config", () => {
    const { container } = render(
      <CardGrid columns={{ xs: 1, md: 2, lg: 3 }} gap="lg" className="custom">
        <div>Item</div>
      </CardGrid>
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});
