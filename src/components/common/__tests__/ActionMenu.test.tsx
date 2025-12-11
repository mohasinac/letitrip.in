/**
 * Comprehensive tests for ActionMenu component
 * Tests: Dropdown menu, action items, keyboard navigation, dark mode
 * Focus: Click outside, escape key, variants, disabled states, alignment
 */

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ActionMenu, ActionMenuItem } from "../ActionMenu";

const mockItems: ActionMenuItem[] = [
  { label: "Edit", onClick: jest.fn() },
  { label: "Delete", onClick: jest.fn(), variant: "danger" },
  { label: "Archive", onClick: jest.fn(), disabled: true },
];

describe("ActionMenu", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Basic Rendering", () => {
    it("renders trigger button with default label", () => {
      render(<ActionMenu items={mockItems} />);
      expect(
        screen.getByRole("button", { name: /actions/i })
      ).toBeInTheDocument();
    });

    it("renders trigger button with custom label", () => {
      render(<ActionMenu items={mockItems} label="Options" />);
      expect(
        screen.getByRole("button", { name: /options/i })
      ).toBeInTheDocument();
    });

    it("renders with custom icon", () => {
      const customIcon = <span data-testid="custom-icon">⚙️</span>;
      render(<ActionMenu items={mockItems} icon={customIcon} />);
      expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
    });

    it("renders default dots icon when no icon provided", () => {
      const { container } = render(<ActionMenu items={mockItems} />);
      const svg = container.querySelector('svg[viewBox="0 0 24 24"]');
      expect(svg).toBeInTheDocument();
    });

    it("menu is closed by default", () => {
      render(<ActionMenu items={mockItems} />);
      expect(screen.queryByText("Edit")).not.toBeInTheDocument();
    });

    it("applies custom className", () => {
      const { container } = render(
        <ActionMenu items={mockItems} className="custom-class" />
      );
      const wrapper = container.querySelector(".custom-class");
      expect(wrapper).toBeInTheDocument();
    });
  });

  describe("Menu Toggle", () => {
    it("opens menu when trigger button is clicked", async () => {
      render(<ActionMenu items={mockItems} />);
      const trigger = screen.getByRole("button", { name: /actions/i });

      fireEvent.click(trigger);

      await waitFor(() => {
        expect(screen.getByText("Edit")).toBeInTheDocument();
      });
    });

    it("closes menu when trigger button is clicked again", async () => {
      render(<ActionMenu items={mockItems} />);
      const trigger = screen.getByRole("button", { name: /actions/i });

      fireEvent.click(trigger);
      await waitFor(() => expect(screen.getByText("Edit")).toBeInTheDocument());

      fireEvent.click(trigger);
      await waitFor(() => {
        expect(screen.queryByText("Edit")).not.toBeInTheDocument();
      });
    });

    it("rotates chevron icon when menu opens", async () => {
      const { container } = render(<ActionMenu items={mockItems} />);
      const trigger = screen.getByRole("button", { name: /actions/i });

      const chevron = container.querySelector(
        'svg[viewBox="0 0 24 24"]:nth-of-type(2)'
      );
      expect(chevron).not.toHaveClass("rotate-180");

      fireEvent.click(trigger);
      await waitFor(() => {
        expect(chevron).toHaveClass("rotate-180");
      });
    });
  });

  describe("Action Items", () => {
    it("renders all action items when menu is open", async () => {
      render(<ActionMenu items={mockItems} />);
      const trigger = screen.getByRole("button", { name: /actions/i });

      fireEvent.click(trigger);

      await waitFor(() => {
        expect(screen.getByText("Edit")).toBeInTheDocument();
        expect(screen.getByText("Delete")).toBeInTheDocument();
        expect(screen.getByText("Archive")).toBeInTheDocument();
      });
    });

    it("calls onClick handler when action item is clicked", async () => {
      const onClick = jest.fn();
      const items: ActionMenuItem[] = [{ label: "Test Action", onClick }];

      render(<ActionMenu items={items} />);
      fireEvent.click(screen.getByRole("button", { name: /actions/i }));

      await waitFor(() =>
        expect(screen.getByText("Test Action")).toBeInTheDocument()
      );

      fireEvent.click(screen.getByText("Test Action"));
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it("closes menu after clicking action item", async () => {
      const onClick = jest.fn();
      const items: ActionMenuItem[] = [{ label: "Test Action", onClick }];

      render(<ActionMenu items={items} />);
      fireEvent.click(screen.getByRole("button", { name: /actions/i }));

      await waitFor(() =>
        expect(screen.getByText("Test Action")).toBeInTheDocument()
      );

      fireEvent.click(screen.getByText("Test Action"));

      await waitFor(() => {
        expect(screen.queryByText("Test Action")).not.toBeInTheDocument();
      });
    });

    it("renders action item with icon", async () => {
      const icon = <span data-testid="item-icon">📝</span>;
      const items: ActionMenuItem[] = [
        { label: "Edit", onClick: jest.fn(), icon },
      ];

      render(<ActionMenu items={items} />);
      fireEvent.click(screen.getByRole("button", { name: /actions/i }));

      await waitFor(() => {
        expect(screen.getByTestId("item-icon")).toBeInTheDocument();
      });
    });

    it("renders action item without icon", async () => {
      const items: ActionMenuItem[] = [{ label: "Edit", onClick: jest.fn() }];

      render(<ActionMenu items={items} />);
      fireEvent.click(screen.getByRole("button", { name: /actions/i }));

      await waitFor(() => {
        const button = screen.getByText("Edit").closest("button");
        // Should not have an icon span before the label
        const firstChild = button?.querySelector(":first-child");
        expect(firstChild?.textContent).toBe("Edit");
      });
    });
  });

  describe("Disabled Actions", () => {
    it("applies disabled styling to disabled items", async () => {
      render(<ActionMenu items={mockItems} />);
      fireEvent.click(screen.getByRole("button", { name: /actions/i }));

      await waitFor(() => {
        const archiveButton = screen.getByText("Archive").closest("button");
        expect(archiveButton).toHaveClass("opacity-50", "cursor-not-allowed");
      });
    });

    it("does not call onClick for disabled items", async () => {
      const onClick = jest.fn();
      const items: ActionMenuItem[] = [
        { label: "Disabled Action", onClick, disabled: true },
      ];

      render(<ActionMenu items={items} />);
      fireEvent.click(screen.getByRole("button", { name: /actions/i }));

      await waitFor(() =>
        expect(screen.getByText("Disabled Action")).toBeInTheDocument()
      );

      fireEvent.click(screen.getByText("Disabled Action"));
      expect(onClick).not.toHaveBeenCalled();
    });

    it("does not close menu when disabled item is clicked", async () => {
      const items: ActionMenuItem[] = [
        { label: "Disabled", onClick: jest.fn(), disabled: true },
      ];

      render(<ActionMenu items={items} />);
      fireEvent.click(screen.getByRole("button", { name: /actions/i }));

      await waitFor(() =>
        expect(screen.getByText("Disabled")).toBeInTheDocument()
      );

      fireEvent.click(screen.getByText("Disabled"));

      // Menu should still be open
      expect(screen.getByText("Disabled")).toBeInTheDocument();
    });

    it("has disabled attribute on disabled button", async () => {
      render(<ActionMenu items={mockItems} />);
      fireEvent.click(screen.getByRole("button", { name: /actions/i }));

      await waitFor(() => {
        const archiveButton = screen.getByText("Archive").closest("button");
        expect(archiveButton).toBeDisabled();
      });
    });
  });

  describe("Variant Styles", () => {
    it("applies default variant styling", async () => {
      const items: ActionMenuItem[] = [
        { label: "Default", onClick: jest.fn(), variant: "default" },
      ];

      render(<ActionMenu items={items} />);
      fireEvent.click(screen.getByRole("button", { name: /actions/i }));

      await waitFor(() => {
        const button = screen.getByText("Default").closest("button");
        expect(button).toHaveClass("text-gray-700", "dark:text-gray-200");
      });
    });

    it("applies danger variant styling", async () => {
      const items: ActionMenuItem[] = [
        { label: "Delete", onClick: jest.fn(), variant: "danger" },
      ];

      render(<ActionMenu items={items} />);
      fireEvent.click(screen.getByRole("button", { name: /actions/i }));

      await waitFor(() => {
        const button = screen.getByText("Delete").closest("button");
        expect(button).toHaveClass("text-red-600", "dark:text-red-400");
      });
    });

    it("applies success variant styling", async () => {
      const items: ActionMenuItem[] = [
        { label: "Approve", onClick: jest.fn(), variant: "success" },
      ];

      render(<ActionMenu items={items} />);
      fireEvent.click(screen.getByRole("button", { name: /actions/i }));

      await waitFor(() => {
        const button = screen.getByText("Approve").closest("button");
        expect(button).toHaveClass("text-green-600", "dark:text-green-400");
      });
    });

    it("uses default variant when not specified", async () => {
      const items: ActionMenuItem[] = [{ label: "Action", onClick: jest.fn() }];

      render(<ActionMenu items={items} />);
      fireEvent.click(screen.getByRole("button", { name: /actions/i }));

      await waitFor(() => {
        const button = screen.getByText("Action").closest("button");
        expect(button).toHaveClass("text-gray-700");
      });
    });
  });

  describe("Menu Alignment", () => {
    it("aligns menu to right by default", async () => {
      const { container } = render(<ActionMenu items={mockItems} />);
      fireEvent.click(screen.getByRole("button", { name: /actions/i }));

      await waitFor(() => {
        const menu = container.querySelector(".absolute");
        expect(menu).toHaveClass("right-0");
      });
    });

    it("aligns menu to left when specified", async () => {
      const { container } = render(
        <ActionMenu items={mockItems} align="left" />
      );
      fireEvent.click(screen.getByRole("button", { name: /actions/i }));

      await waitFor(() => {
        const menu = container.querySelector(".absolute");
        expect(menu).toHaveClass("left-0");
      });
    });

    it("aligns menu to right when explicitly specified", async () => {
      const { container } = render(
        <ActionMenu items={mockItems} align="right" />
      );
      fireEvent.click(screen.getByRole("button", { name: /actions/i }));

      await waitFor(() => {
        const menu = container.querySelector(".absolute");
        expect(menu).toHaveClass("right-0");
      });
    });
  });

  describe("Click Outside", () => {
    it("closes menu when clicking outside", async () => {
      const { container } = render(
        <div>
          <div data-testid="outside">Outside</div>
          <ActionMenu items={mockItems} />
        </div>
      );

      fireEvent.click(screen.getByRole("button", { name: /actions/i }));
      await waitFor(() => expect(screen.getByText("Edit")).toBeInTheDocument());

      fireEvent.mouseDown(screen.getByTestId("outside"));

      await waitFor(() => {
        expect(screen.queryByText("Edit")).not.toBeInTheDocument();
      });
    });

    it("does not close menu when clicking inside menu", async () => {
      const { container } = render(<ActionMenu items={mockItems} />);

      fireEvent.click(screen.getByRole("button", { name: /actions/i }));
      await waitFor(() => expect(screen.getByText("Edit")).toBeInTheDocument());

      const menu = container.querySelector(".absolute");
      fireEvent.mouseDown(menu!);

      expect(screen.getByText("Edit")).toBeInTheDocument();
    });

    it("does not close when clicking trigger button", async () => {
      render(<ActionMenu items={mockItems} />);
      const trigger = screen.getByRole("button", { name: /actions/i });

      fireEvent.click(trigger);
      await waitFor(() => expect(screen.getByText("Edit")).toBeInTheDocument());

      fireEvent.mouseDown(trigger);

      // Menu should still be visible
      expect(screen.getByText("Edit")).toBeInTheDocument();
    });
  });

  describe("Keyboard Navigation", () => {
    it("closes menu when Escape key is pressed", async () => {
      render(<ActionMenu items={mockItems} />);

      fireEvent.click(screen.getByRole("button", { name: /actions/i }));
      await waitFor(() => expect(screen.getByText("Edit")).toBeInTheDocument());

      fireEvent.keyDown(document, { key: "Escape" });

      await waitFor(() => {
        expect(screen.queryByText("Edit")).not.toBeInTheDocument();
      });
    });

    it("does not close menu on other key presses", async () => {
      render(<ActionMenu items={mockItems} />);

      fireEvent.click(screen.getByRole("button", { name: /actions/i }));
      await waitFor(() => expect(screen.getByText("Edit")).toBeInTheDocument());

      fireEvent.keyDown(document, { key: "Enter" });
      fireEvent.keyDown(document, { key: "Tab" });

      expect(screen.getByText("Edit")).toBeInTheDocument();
    });
  });

  describe("Event Listener Cleanup", () => {
    it("removes event listeners when menu closes", async () => {
      const { unmount } = render(<ActionMenu items={mockItems} />);

      fireEvent.click(screen.getByRole("button", { name: /actions/i }));
      await waitFor(() => expect(screen.getByText("Edit")).toBeInTheDocument());

      fireEvent.click(screen.getByRole("button", { name: /actions/i }));

      unmount();

      // Should not throw errors after unmount
      fireEvent.keyDown(document, { key: "Escape" });
    });

    it("removes event listeners on unmount", () => {
      const { unmount } = render(<ActionMenu items={mockItems} />);

      // Open menu to add listeners
      fireEvent.click(screen.getByRole("button", { name: /actions/i }));

      unmount();

      // Should not cause issues
      fireEvent.keyDown(document, { key: "Escape" });
      fireEvent.mouseDown(document.body);
    });
  });

  describe("Dark Mode", () => {
    it("applies dark mode classes to trigger button", () => {
      render(<ActionMenu items={mockItems} />);
      const trigger = screen.getByRole("button", { name: /actions/i });

      expect(trigger).toHaveClass(
        "dark:text-gray-200",
        "dark:bg-gray-800",
        "dark:border-gray-600",
        "dark:hover:bg-gray-700"
      );
    });

    it("applies dark mode classes to menu dropdown", async () => {
      const { container } = render(<ActionMenu items={mockItems} />);

      fireEvent.click(screen.getByRole("button", { name: /actions/i }));

      await waitFor(() => {
        const menu = container.querySelector(".absolute");
        expect(menu).toHaveClass("dark:bg-gray-800", "dark:border-gray-700");
      });
    });

    it("applies dark mode classes to default variant items", async () => {
      const items: ActionMenuItem[] = [
        { label: "Action", onClick: jest.fn(), variant: "default" },
      ];

      render(<ActionMenu items={items} />);
      fireEvent.click(screen.getByRole("button", { name: /actions/i }));

      await waitFor(() => {
        const button = screen.getByText("Action").closest("button");
        expect(button).toHaveClass(
          "dark:text-gray-200",
          "dark:hover:bg-gray-700"
        );
      });
    });

    it("applies dark mode classes to danger variant items", async () => {
      const items: ActionMenuItem[] = [
        { label: "Delete", onClick: jest.fn(), variant: "danger" },
      ];

      render(<ActionMenu items={items} />);
      fireEvent.click(screen.getByRole("button", { name: /actions/i }));

      await waitFor(() => {
        const button = screen.getByText("Delete").closest("button");
        expect(button).toHaveClass(
          "dark:text-red-400",
          "dark:hover:bg-red-900/20"
        );
      });
    });

    it("applies dark mode classes to success variant items", async () => {
      const items: ActionMenuItem[] = [
        { label: "Approve", onClick: jest.fn(), variant: "success" },
      ];

      render(<ActionMenu items={items} />);
      fireEvent.click(screen.getByRole("button", { name: /actions/i }));

      await waitFor(() => {
        const button = screen.getByText("Approve").closest("button");
        expect(button).toHaveClass(
          "dark:text-green-400",
          "dark:hover:bg-green-900/20"
        );
      });
    });
  });

  describe("Edge Cases", () => {
    it("handles empty items array", () => {
      render(<ActionMenu items={[]} />);

      fireEvent.click(screen.getByRole("button", { name: /actions/i }));

      // Menu should render but be empty
      expect(
        screen.queryByRole("button", { name: /actions/i })
      ).toBeInTheDocument();
    });

    it("handles very long item labels", async () => {
      const longLabel = "A".repeat(100);
      const items: ActionMenuItem[] = [
        { label: longLabel, onClick: jest.fn() },
      ];

      render(<ActionMenu items={items} />);
      fireEvent.click(screen.getByRole("button", { name: /actions/i }));

      await waitFor(() => {
        expect(screen.getByText(longLabel)).toBeInTheDocument();
      });
    });

    it("handles special characters in labels", async () => {
      const items: ActionMenuItem[] = [{ label: "<>&'\"", onClick: jest.fn() }];

      render(<ActionMenu items={items} />);
      fireEvent.click(screen.getByRole("button", { name: /actions/i }));

      await waitFor(() => {
        expect(screen.getByText("<>&'\"")).toBeInTheDocument();
      });
    });

    it("handles rapid open/close", async () => {
      render(<ActionMenu items={mockItems} />);
      const trigger = screen.getByRole("button", { name: /actions/i });

      fireEvent.click(trigger);
      fireEvent.click(trigger);
      fireEvent.click(trigger);
      fireEvent.click(trigger);

      // Should end up in closed state
      await waitFor(() => {
        expect(screen.queryByText("Edit")).not.toBeInTheDocument();
      });
    });

    it("handles multiple action menus on same page", () => {
      render(
        <>
          <ActionMenu items={mockItems} label="Menu 1" />
          <ActionMenu items={mockItems} label="Menu 2" />
        </>
      );

      expect(
        screen.getByRole("button", { name: /menu 1/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /menu 2/i })
      ).toBeInTheDocument();
    });

    it("handles undefined variant gracefully", async () => {
      const items: ActionMenuItem[] = [
        { label: "Action", onClick: jest.fn(), variant: undefined },
      ];

      render(<ActionMenu items={items} />);
      fireEvent.click(screen.getByRole("button", { name: /actions/i }));

      await waitFor(() => {
        const button = screen.getByText("Action").closest("button");
        expect(button).toHaveClass("text-gray-700");
      });
    });
  });

  describe("Accessibility", () => {
    it("trigger button is focusable", () => {
      render(<ActionMenu items={mockItems} />);
      const trigger = screen.getByRole("button", { name: /actions/i });

      trigger.focus();
      expect(trigger).toHaveFocus();
    });

    it("action items are buttons", async () => {
      render(<ActionMenu items={mockItems} />);
      fireEvent.click(screen.getByRole("button", { name: /actions/i }));

      await waitFor(() => {
        const editButton = screen.getByText("Edit").closest("button");
        expect(editButton?.tagName).toBe("BUTTON");
      });
    });

    it("disabled items have disabled attribute", async () => {
      render(<ActionMenu items={mockItems} />);
      fireEvent.click(screen.getByRole("button", { name: /actions/i }));

      await waitFor(() => {
        const archiveButton = screen.getByText("Archive").closest("button");
        expect(archiveButton).toHaveAttribute("disabled");
      });
    });
  });

  describe("Menu Positioning", () => {
    it("has proper z-index for dropdown", async () => {
      const { container } = render(<ActionMenu items={mockItems} />);

      fireEvent.click(screen.getByRole("button", { name: /actions/i }));

      await waitFor(() => {
        const menu = container.querySelector(".absolute");
        expect(menu).toHaveClass("z-10");
      });
    });

    it("has proper spacing from trigger", async () => {
      const { container } = render(<ActionMenu items={mockItems} />);

      fireEvent.click(screen.getByRole("button", { name: /actions/i }));

      await waitFor(() => {
        const menu = container.querySelector(".absolute");
        expect(menu).toHaveClass("mt-2");
      });
    });

    it("has fixed width for menu", async () => {
      const { container } = render(<ActionMenu items={mockItems} />);

      fireEvent.click(screen.getByRole("button", { name: /actions/i }));

      await waitFor(() => {
        const menu = container.querySelector(".absolute");
        expect(menu).toHaveClass("w-56");
      });
    });
  });
});
