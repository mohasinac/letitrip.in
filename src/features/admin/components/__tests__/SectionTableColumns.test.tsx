import { render, screen, fireEvent } from "@testing-library/react";
import type React from "react";
import { useSectionTableColumns } from "@/components";
import type { HomepageSection } from "@/components";

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

describe("useSectionTableColumns", () => {
  const section: HomepageSection = {
    id: "section-1",
    type: "hero",
    title: "Hero Section",
    enabled: true,
    order: 1,
    config: {},
  };

  it("renders edit and delete action buttons", () => {
    const onEdit = jest.fn();
    const onDelete = jest.fn();

    function TestComponent() {
      const { actions } = useSectionTableColumns(onEdit, onDelete);
      return actions(section);
    }

    render(<TestComponent />);

    fireEvent.click(screen.getByRole("button", { name: "edit" }));
    fireEvent.click(screen.getByRole("button", { name: "delete" }));

    expect(onEdit).toHaveBeenCalledWith(section);
    expect(onDelete).toHaveBeenCalledWith(section);
  });

  it("returns correct column count", () => {
    function TestComponent() {
      const { columns } = useSectionTableColumns(jest.fn(), jest.fn());
      return <span data-testid="count">{columns.length}</span>;
    }
    render(<TestComponent />);
    expect(screen.getByTestId("count").textContent).toBe("4");
  });
});

