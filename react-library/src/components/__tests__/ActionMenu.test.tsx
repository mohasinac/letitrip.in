import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { ActionMenuItem } from "../tables/ActionMenu";
import { ActionMenu } from "../tables/ActionMenu";

describe("ActionMenu", () => {
  const defaultItems: ActionMenuItem[] = [
    { label: "Edit", onClick: vi.fn() },
    { label: "Delete", onClick: vi.fn(), variant: "danger" },
  ];

  it("renders trigger button with label", () => {
    render(<ActionMenu items={defaultItems} label="Actions" />);
    expect(
      screen.getByRole("button", { name: /actions/i })
    ).toBeInTheDocument();
  });

  it("menu is closed by default", () => {
    render(<ActionMenu items={defaultItems} />);
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("opens menu when trigger button is clicked", async () => {
    const user = userEvent.setup();
    render(<ActionMenu items={defaultItems} />);

    await user.click(screen.getByRole("button", { name: /actions/i }));
    expect(screen.getByRole("menu")).toBeInTheDocument();
  });

  it("displays all menu items when open", async () => {
    const user = userEvent.setup();
    render(<ActionMenu items={defaultItems} />);

    await user.click(screen.getByRole("button", { name: /actions/i }));
    expect(screen.getByRole("menuitem", { name: /edit/i })).toBeInTheDocument();
    expect(
      screen.getByRole("menuitem", { name: /delete/i })
    ).toBeInTheDocument();
  });

  it("calls onClick handler when menu item is clicked", async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    const items: ActionMenuItem[] = [{ label: "Edit", onClick: onEdit }];
    render(<ActionMenu items={items} />);

    await user.click(screen.getByRole("button", { name: /actions/i }));
    await user.click(screen.getByRole("menuitem", { name: /edit/i }));

    expect(onEdit).toHaveBeenCalled();
  });

  it("closes menu after item is clicked", async () => {
    const user = userEvent.setup();
    render(<ActionMenu items={defaultItems} />);

    await user.click(screen.getByRole("button", { name: /actions/i }));
    await user.click(screen.getByRole("menuitem", { name: /edit/i }));

    await waitFor(() => {
      expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    });
  });

  it("closes menu when trigger button is clicked again", async () => {
    const user = userEvent.setup();
    render(<ActionMenu items={defaultItems} />);

    const trigger = screen.getByRole("button", { name: /actions/i });
    await user.click(trigger);
    expect(screen.getByRole("menu")).toBeInTheDocument();

    await user.click(trigger);
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("closes menu on Escape key", async () => {
    const user = userEvent.setup();
    render(<ActionMenu items={defaultItems} />);

    await user.click(screen.getByRole("button", { name: /actions/i }));
    expect(screen.getByRole("menu")).toBeInTheDocument();

    await user.keyboard("{Escape}");
    await waitFor(() => {
      expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    });
  });

  it("closes menu when clicking outside", async () => {
    const user = userEvent.setup();
    render(
      <div>
        <ActionMenu items={defaultItems} />
        <button>Outside</button>
      </div>
    );

    await user.click(screen.getByRole("button", { name: /actions/i }));
    expect(screen.getByRole("menu")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /outside/i }));
    await waitFor(() => {
      expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    });
  });

  it("does not call onClick for disabled items", async () => {
    const user = userEvent.setup();
    const onDisabled = vi.fn();
    const items: ActionMenuItem[] = [
      { label: "Disabled", onClick: onDisabled, disabled: true },
    ];
    render(<ActionMenu items={items} />);

    await user.click(screen.getByRole("button", { name: /actions/i }));
    await user.click(screen.getByRole("menuitem", { name: /disabled/i }));

    expect(onDisabled).not.toHaveBeenCalled();
  });

  it("applies disabled styles to disabled items", async () => {
    const user = userEvent.setup();
    const items: ActionMenuItem[] = [
      { label: "Disabled", onClick: vi.fn(), disabled: true },
    ];
    render(<ActionMenu items={items} />);

    await user.click(screen.getByRole("button", { name: /actions/i }));
    const disabledItem = screen.getByRole("menuitem", { name: /disabled/i });

    expect(disabledItem).toHaveClass("opacity-50", "cursor-not-allowed");
    expect(disabledItem).toBeDisabled();
  });

  it("applies variant styles to menu items", async () => {
    const user = userEvent.setup();
    const items: ActionMenuItem[] = [
      { label: "Default", onClick: vi.fn(), variant: "default" },
      { label: "Danger", onClick: vi.fn(), variant: "danger" },
      { label: "Success", onClick: vi.fn(), variant: "success" },
    ];
    render(<ActionMenu items={items} />);

    await user.click(screen.getByRole("button", { name: /actions/i }));

    const dangerItem = screen.getByRole("menuitem", { name: /danger/i });
    expect(dangerItem).toHaveClass("text-red-600");

    const successItem = screen.getByRole("menuitem", { name: /success/i });
    expect(successItem).toHaveClass("text-green-600");
  });

  it("renders custom icons for menu items", async () => {
    const user = userEvent.setup();
    const items: ActionMenuItem[] = [
      {
        label: "Edit",
        onClick: vi.fn(),
        icon: <span data-testid="edit-icon">✏️</span>,
      },
    ];
    render(<ActionMenu items={items} />);

    await user.click(screen.getByRole("button", { name: /actions/i }));
    expect(screen.getByTestId("edit-icon")).toBeInTheDocument();
  });

  it("renders custom icon for trigger button", () => {
    const customIcon = <span data-testid="custom-icon">⚙️</span>;
    render(<ActionMenu items={defaultItems} icon={customIcon} />);

    expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
  });

  it("aligns menu to the right by default", async () => {
    const user = userEvent.setup();
    render(<ActionMenu items={defaultItems} />);

    await user.click(screen.getByRole("button", { name: /actions/i }));
    const menu = screen.getByRole("menu");

    expect(menu).toHaveClass("right-0");
  });

  it("aligns menu to the left when specified", async () => {
    const user = userEvent.setup();
    render(<ActionMenu items={defaultItems} align="left" />);

    await user.click(screen.getByRole("button", { name: /actions/i }));
    const menu = screen.getByRole("menu");

    expect(menu).toHaveClass("left-0");
  });

  it("applies custom className to container", () => {
    const { container } = render(
      <ActionMenu items={defaultItems} className="custom-menu" />
    );

    expect(container.querySelector(".custom-menu")).toBeInTheDocument();
  });

  it("uses custom DefaultIcon component", () => {
    const CustomIcon = () => <span data-testid="custom-default-icon">📋</span>;
    render(<ActionMenu items={defaultItems} DefaultIcon={CustomIcon} />);

    expect(screen.getByTestId("custom-default-icon")).toBeInTheDocument();
  });

  it("uses custom ChevronIcon component", () => {
    const CustomChevron = ({ isOpen }: { isOpen: boolean }) => (
      <span data-testid="custom-chevron">{isOpen ? "▲" : "▼"}</span>
    );
    render(<ActionMenu items={defaultItems} ChevronIcon={CustomChevron} />);

    expect(screen.getByTestId("custom-chevron")).toHaveTextContent("▼");
  });

  it("updates chevron icon when menu opens", async () => {
    const user = userEvent.setup();
    const CustomChevron = ({ isOpen }: { isOpen: boolean }) => (
      <span data-testid="custom-chevron">{isOpen ? "▲" : "▼"}</span>
    );
    render(<ActionMenu items={defaultItems} ChevronIcon={CustomChevron} />);

    const chevron = screen.getByTestId("custom-chevron");
    expect(chevron).toHaveTextContent("▼");

    await user.click(screen.getByRole("button", { name: /actions/i }));
    expect(chevron).toHaveTextContent("▲");
  });

  it("applies custom triggerClassName", () => {
    render(
      <ActionMenu
        items={defaultItems}
        triggerClassName="custom-trigger-class"
      />
    );

    const trigger = screen.getByRole("button", { name: /actions/i });
    expect(trigger).toHaveClass("custom-trigger-class");
  });

  it("applies custom menuClassName", async () => {
    const user = userEvent.setup();
    render(
      <ActionMenu items={defaultItems} menuClassName="custom-menu-class" />
    );

    await user.click(screen.getByRole("button", { name: /actions/i }));
    const menu = screen.getByRole("menu");

    expect(menu).toHaveClass("custom-menu-class");
  });

  it("handles multiple items with same label", async () => {
    const user = userEvent.setup();
    const onClick1 = vi.fn();
    const onClick2 = vi.fn();
    const items: ActionMenuItem[] = [
      { label: "Action", onClick: onClick1 },
      { label: "Action", onClick: onClick2 },
    ];
    render(<ActionMenu items={items} />);

    await user.click(screen.getByRole("button", { name: /actions/i }));
    const menuItems = screen.getAllByRole("menuitem", { name: /action/i });

    expect(menuItems).toHaveLength(2);

    await user.click(menuItems[0]);
    expect(onClick1).toHaveBeenCalled();
    expect(onClick2).not.toHaveBeenCalled();
  });

  it("sets correct aria attributes", async () => {
    const user = userEvent.setup();
    render(<ActionMenu items={defaultItems} label="User Actions" />);

    const trigger = screen.getByRole("button", { name: /user actions/i });
    expect(trigger).toHaveAttribute("aria-haspopup", "true");
    expect(trigger).toHaveAttribute("aria-expanded", "false");

    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");

    const menu = screen.getByRole("menu");
    expect(menu).toHaveAttribute("aria-orientation", "vertical");
  });

  it("handles empty items array", () => {
    render(<ActionMenu items={[]} />);
    expect(
      screen.getByRole("button", { name: /actions/i })
    ).toBeInTheDocument();
  });

  it("displays empty menu when opened with no items", async () => {
    const user = userEvent.setup();
    render(<ActionMenu items={[]} />);

    await user.click(screen.getByRole("button", { name: /actions/i }));
    const menu = screen.getByRole("menu");

    expect(menu).toBeInTheDocument();
    expect(screen.queryByRole("menuitem")).not.toBeInTheDocument();
  });
});
