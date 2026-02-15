import { render, screen } from "@testing-library/react";
import { Badge } from "@/components";
import { THEME_CONSTANTS } from "@/constants";

describe("Badge Component", () => {
  it("renders badge with children", () => {
    render(<Badge>New</Badge>);
    expect(screen.getByText("New")).toBeInTheDocument();
  });

  it("applies default variant by default", () => {
    const { container } = render(<Badge>Default</Badge>);
    const badge = container.firstChild as HTMLElement;
    expect(badge).toHaveClass(...THEME_CONSTANTS.badge.inactive.split(" "));
  });

  it("applies primary variant", () => {
    const { container } = render(<Badge variant="primary">Primary</Badge>);
    const badge = container.firstChild as HTMLElement;
    expect(badge).toHaveClass(
      ...THEME_CONSTANTS.colors.badge.primary.split(" "),
    );
  });

  it("applies success variant", () => {
    const { container } = render(<Badge variant="success">Success</Badge>);
    const badge = container.firstChild as HTMLElement;
    expect(badge).toHaveClass(...THEME_CONSTANTS.badge.success.split(" "));
  });

  it("applies warning variant", () => {
    const { container } = render(<Badge variant="warning">Warning</Badge>);
    const badge = container.firstChild as HTMLElement;
    expect(badge).toHaveClass(...THEME_CONSTANTS.badge.warning.split(" "));
  });

  it("applies danger variant", () => {
    const { container } = render(<Badge variant="danger">Danger</Badge>);
    const badge = container.firstChild as HTMLElement;
    expect(badge).toHaveClass(...THEME_CONSTANTS.badge.danger.split(" "));
  });

  it("includes default size tokens", () => {
    const { container } = render(<Badge>Default</Badge>);
    const badge = container.firstChild as HTMLElement;
    expect(badge).toHaveClass("px-2.5", "py-0.5", "text-xs");
  });
});
