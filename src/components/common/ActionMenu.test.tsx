import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ActionMenu, ActionMenuItem } from "./ActionMenu";

const mockItems: ActionMenuItem[] = [
  { label: "Edit", onClick: jest.fn() },
  { label: "Delete", onClick: jest.fn(), variant: "danger" },
  { label: "Archive", onClick: jest.fn(), variant: "success" },
];

describe("ActionMenu", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Basic Rendering", () => {
    it("renders action menu button", () => {
      render(<ActionMenu items={mockItems} />);
      expect(screen.getByRole("button", { name: /Actions/i })).toBeInTheDocument();
    });

    it("renders with default label", () => {
      render(<ActionMenu items={mockItems} />);
      expect(screen.getByText("Actions")).toBeInTheDocument();
    });

    it("renders with custom label", () => {
      render(<ActionMenu items={mockItems} label="Options" />);
      expect(screen.getByText("Options")).toBeInTheDocument();
    });

    it("renders custom icon when provided", () => {
      render(<ActionMenu items={mockItems} icon={<span data-testid="custom-icon">⚙</span>} />);
      expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
    });

    it("does not show dropdown menu initially", () => {
      render(<ActionMenu items={mockItems} />);
      expect(screen.queryByText("Edit")).not.toBeInTheDocument();
    });
  });

  describe("Menu Toggle", () => {
    it("shows menu when button clicked", () => {
      render(<ActionMenu items={mockItems} />);
      
      fireEvent.click(screen.getByRole("button", { name: /Actions/i }));
      
      expect(screen.getByText("Edit")).toBeInTheDocument();
      expect(screen.getByText("Delete")).toBeInTheDocument();
      expect(screen.getByText("Archive")).toBeInTheDocument();
    });

    it("hides menu when button clicked again", () => {
      render(<ActionMenu items={mockItems} />);
      
      const button = screen.getByRole("button", { name: /Actions/i });
      fireEvent.click(button);
      expect(screen.getByText("Edit")).toBeInTheDocument();
      
      fireEvent.click(button);
      expect(screen.queryByText("Edit")).not.toBeInTheDocument();
    });

    it("rotates chevron icon when menu opens", () => {
      const { container } = render(<ActionMenu items={mockItems} />);
      
      const chevron = container.querySelector("svg.rotate-180");
      expect(chevron).not.toBeInTheDocument();
      
      fireEvent.click(screen.getByRole("button", { name: /Actions/i }));
      
      const rotatedChevron = container.querySelector("svg.rotate-180");
      expect(rotatedChevron).toBeInTheDocument();
    });
  });

  describe("Menu Items", () => {
    it("renders all menu items", () => {
      render(<ActionMenu items={mockItems} />);
      fireEvent.click(screen.getByRole("button", { name: /Actions/i }));
      
      mockItems.forEach(item => {
        expect(screen.getByText(item.label)).toBeInTheDocument();
      });
    });

    it("renders item icons when provided", () => {
      const itemsWithIcons: ActionMenuItem[] = [
        { label: "Edit", onClick: jest.fn(), icon: <span data-testid="edit-icon">✏️</span> },
      ];
      
      render(<ActionMenu items={itemsWithIcons} />);
      fireEvent.click(screen.getByRole("button", { name: /Actions/i }));
      
      expect(screen.getByTestId("edit-icon")).toBeInTheDocument();
    });

    it("calls onClick when item clicked", () => {
      const onClick = jest.fn();
      const items: ActionMenuItem[] = [{ label: "Test", onClick }];
      
      render(<ActionMenu items={items} />);
      fireEvent.click(screen.getByRole("button", { name: /Actions/i }));
      fireEvent.click(screen.getByText("Test"));
      
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it("closes menu after item clicked", async () => {
      const items: ActionMenuItem[] = [{ label: "Test", onClick: jest.fn() }];
      
      render(<ActionMenu items={items} />);
      fireEvent.click(screen.getByRole("button", { name: /Actions/i }));
      
      expect(screen.getByText("Test")).toBeInTheDocument();
      
      fireEvent.click(screen.getByText("Test"));
      
      await waitFor(() => {
        expect(screen.queryByText("Test")).not.toBeInTheDocument();
      });
    });
  });

  describe("Item Variants", () => {
    it("applies default variant styling", () => {
      const items: ActionMenuItem[] = [{ label: "Default", onClick: jest.fn(), variant: "default" }];
      render(<ActionMenu items={items} />);
      fireEvent.click(screen.getByRole("button", { name: /Actions/i }));
      
      const item = screen.getByText("Default");
      expect(item).toHaveClass("text-gray-700");
    });

    it("applies danger variant styling", () => {
      const items: ActionMenuItem[] = [{ label: "Delete", onClick: jest.fn(), variant: "danger" }];
      render(<ActionMenu items={items} />);
      fireEvent.click(screen.getByRole("button", { name: /Actions/i }));
      
      const item = screen.getByText("Delete");
      expect(item).toHaveClass("text-red-600");
    });

    it("applies success variant styling", () => {
      const items: ActionMenuItem[] = [{ label: "Approve", onClick: jest.fn(), variant: "success" }];
      render(<ActionMenu items={items} />);
      fireEvent.click(screen.getByRole("button", { name: /Actions/i }));
      
      const item = screen.getByText("Approve");
      expect(item).toHaveClass("text-green-600");
    });
  });

  describe("Disabled Items", () => {
    it("renders disabled item with reduced opacity", () => {
      const items: ActionMenuItem[] = [{ label: "Disabled", onClick: jest.fn(), disabled: true }];
      render(<ActionMenu items={items} />);
      fireEvent.click(screen.getByRole("button", { name: /Actions/i }));
      
      const item = screen.getByText("Disabled");
      expect(item).toHaveClass("opacity-50", "cursor-not-allowed");
    });

    it("does not call onClick when disabled item clicked", () => {
      const onClick = jest.fn();
      const items: ActionMenuItem[] = [{ label: "Disabled", onClick, disabled: true }];
      
      render(<ActionMenu items={items} />);
      fireEvent.click(screen.getByRole("button", { name: /Actions/i }));
      fireEvent.click(screen.getByText("Disabled"));
      
      expect(onClick).not.toHaveBeenCalled();
    });

    it("disabled attribute is set on disabled items", () => {
      const items: ActionMenuItem[] = [{ label: "Disabled", onClick: jest.fn(), disabled: true }];
      render(<ActionMenu items={items} />);
      fireEvent.click(screen.getByRole("button", { name: /Actions/i }));
      
      const item = screen.getByText("Disabled").closest("button");
      expect(item).toBeDisabled();
    });
  });

  describe("Menu Alignment", () => {
    it("aligns menu to right by default", () => {
      const { container } = render(<ActionMenu items={mockItems} />);
      fireEvent.click(screen.getByRole("button", { name: /Actions/i }));
      
      const menu = container.querySelector(".right-0");
      expect(menu).toBeInTheDocument();
    });

    it("aligns menu to left when specified", () => {
      const { container } = render(<ActionMenu items={mockItems} align="left" />);
      fireEvent.click(screen.getByRole("button", { name: /Actions/i }));
      
      const menu = container.querySelector(".left-0");
      expect(menu).toBeInTheDocument();
    });
  });

  describe("Click Outside", () => {
    it("closes menu when clicking outside", async () => {
      render(
        <div>
          <div data-testid="outside">Outside</div>
          <ActionMenu items={mockItems} />
        </div>
      );
      
      fireEvent.click(screen.getByRole("button", { name: /Actions/i }));
      expect(screen.getByText("Edit")).toBeInTheDocument();
      
      fireEvent.mouseDown(screen.getByTestId("outside"));
      
      await waitFor(() => {
        expect(screen.queryByText("Edit")).not.toBeInTheDocument();
      });
    });

    it("does not close when clicking inside menu", () => {
      render(<ActionMenu items={mockItems} />);
      
      fireEvent.click(screen.getByRole("button", { name: /Actions/i }));
      const menuItem = screen.getByText("Edit");
      
      fireEvent.mouseDown(menuItem);
      
      expect(screen.getByText("Edit")).toBeInTheDocument();
    });
  });

  describe("Keyboard Navigation", () => {
    it("closes menu on Escape key", async () => {
      render(<ActionMenu items={mockItems} />);
      
      fireEvent.click(screen.getByRole("button", { name: /Actions/i }));
      expect(screen.getByText("Edit")).toBeInTheDocument();
      
      fireEvent.keyDown(document, { key: "Escape" });
      
      await waitFor(() => {
        expect(screen.queryByText("Edit")).not.toBeInTheDocument();
      });
    });

    it("does not close on other keys", () => {
      render(<ActionMenu items={mockItems} />);
      
      fireEvent.click(screen.getByRole("button", { name: /Actions/i }));
      fireEvent.keyDown(document, { key: "Enter" });
      
      expect(screen.getByText("Edit")).toBeInTheDocument();
    });
  });

  describe("Custom Styling", () => {
    it("applies custom className", () => {
      const { container } = render(<ActionMenu items={mockItems} className="custom-class" />);
      expect(container.querySelector(".custom-class")).toBeInTheDocument();
    });

    it("preserves base classes with custom className", () => {
      const { container } = render(<ActionMenu items={mockItems} className="mt-4" />);
      const wrapper = container.querySelector(".relative.inline-block.mt-4");
      expect(wrapper).toBeInTheDocument();
    });
  });

  describe("Empty Items", () => {
    it("renders menu with no items", () => {
      render(<ActionMenu items={[]} />);
      fireEvent.click(screen.getByRole("button", { name: /Actions/i }));
      
      const buttons = screen.getAllByRole("button");
      expect(buttons).toHaveLength(1); // Only the trigger button
    });
  });

  describe("Menu Positioning", () => {
    it("menu has absolute positioning", () => {
      const { container } = render(<ActionMenu items={mockItems} />);
      fireEvent.click(screen.getByRole("button", { name: /Actions/i }));
      
      const menu = container.querySelector(".absolute.z-10");
      expect(menu).toBeInTheDocument();
    });

    it("menu has shadow and border styling", () => {
      const { container } = render(<ActionMenu items={mockItems} />);
      fireEvent.click(screen.getByRole("button", { name: /Actions/i }));
      
      const menu = container.querySelector(".shadow-lg.border.border-gray-200");
      expect(menu).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("handles rapid clicks on toggle button", () => {
      render(<ActionMenu items={mockItems} />);
      const button = screen.getByRole("button", { name: /Actions/i });
      
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);
      
      expect(screen.getByText("Edit")).toBeInTheDocument();
    });

    it("handles items with empty labels", () => {
      const items: ActionMenuItem[] = [{ label: "", onClick: jest.fn() }];
      render(<ActionMenu items={items} />);
      fireEvent.click(screen.getByRole("button", { name: /Actions/i }));
      
      const buttons = screen.getAllByRole("button");
      expect(buttons.length).toBeGreaterThan(1);
    });

    it("handles items with special characters in labels", () => {
      const items: ActionMenuItem[] = [{ label: "<Delete> & \"Remove\"", onClick: jest.fn() }];
      render(<ActionMenu items={items} />);
      fireEvent.click(screen.getByRole("button", { name: /Actions/i }));
      
      expect(screen.getByText("<Delete> & \"Remove\"")).toBeInTheDocument();
    });
  });
});
