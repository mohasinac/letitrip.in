import { render, screen } from "@testing-library/react";
import { Card, CardHeader, CardBody, CardFooter } from "@/components";
import { THEME_CONSTANTS } from "@/constants";

describe("Card Component", () => {
  it("renders card with children", () => {
    render(<Card>Card Content</Card>);
    expect(screen.getByText("Card Content")).toBeInTheDocument();
  });

  it("applies default variant", () => {
    const { container } = render(<Card>Content</Card>);
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass(...THEME_CONSTANTS.card.shadow.split(" "));
  });

  it("applies bordered variant", () => {
    const { container } = render(<Card variant="bordered">Content</Card>);
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass("border-2");
  });

  it("applies elevated variant", () => {
    const { container } = render(<Card variant="elevated">Content</Card>);
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass(...THEME_CONSTANTS.card.shadowElevated.split(" "));
  });

  it("applies hover effect when specified", () => {
    const { container } = render(<Card hover>Content</Card>);
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass(...THEME_CONSTANTS.card.hover.split(" "));
  });
});

describe("CardHeader Component", () => {
  it("renders header with children", () => {
    render(<CardHeader>Header Content</CardHeader>);
    expect(screen.getByText("Header Content")).toBeInTheDocument();
  });

  it("has bottom border", () => {
    const { container } = render(<CardHeader>Header</CardHeader>);
    const header = container.firstChild as HTMLElement;
    expect(header).toHaveClass("border-b");
  });
});

describe("CardBody Component", () => {
  it("renders body with children", () => {
    render(<CardBody>Body Content</CardBody>);
    expect(screen.getByText("Body Content")).toBeInTheDocument();
  });

  it("has base padding", () => {
    const { container } = render(<CardBody>Body</CardBody>);
    const body = container.firstChild as HTMLElement;
    expect(body).toHaveClass("p-4");
  });
});

describe("CardFooter Component", () => {
  it("renders footer with children", () => {
    render(<CardFooter>Footer Content</CardFooter>);
    expect(screen.getByText("Footer Content")).toBeInTheDocument();
  });

  it("has top border", () => {
    const { container } = render(<CardFooter>Footer</CardFooter>);
    const footer = container.firstChild as HTMLElement;
    expect(footer).toHaveClass("border-t");
  });
});
