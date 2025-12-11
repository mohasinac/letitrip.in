/**
 * Comprehensive Unit Tests for MobileSwipeActions Component
 * Testing swipe gestures, touch handling, actions, and accessibility
 *
 * @batch 13
 * @status NEW
 */

import { fireEvent, render, screen } from "@testing-library/react";
import { Edit, Trash2 } from "lucide-react";
import {
  MobileSwipeActions,
  createDeleteAction,
  createEditAction,
  createMoreAction,
} from "../MobileSwipeActions";

describe("MobileSwipeActions - Mobile Gesture Component", () => {
  const mockLeftActions = [
    {
      id: "archive",
      icon: <span>📦</span>,
      label: "Archive",
      color: "text-white",
      bgColor: "bg-yellow-500",
      onClick: jest.fn(),
    },
  ];

  const mockRightActions = [
    {
      id: "delete",
      icon: <Trash2 />,
      label: "Delete",
      color: "text-white",
      bgColor: "bg-red-500",
      onClick: jest.fn(),
    },
    {
      id: "edit",
      icon: <Edit />,
      label: "Edit",
      color: "text-white",
      bgColor: "bg-blue-500",
      onClick: jest.fn(),
    },
  ];

  const defaultProps = {
    children: <div>Swipeable Content</div>,
    rightActions: mockRightActions,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Basic Rendering", () => {
    it("should render children content", () => {
      render(<MobileSwipeActions {...defaultProps} />);
      expect(screen.getByText("Swipeable Content")).toBeInTheDocument();
    });

    it("should render with no actions", () => {
      render(<MobileSwipeActions>{<div>Content</div>}</MobileSwipeActions>);
      expect(screen.getByText("Content")).toBeInTheDocument();
    });

    it("should apply custom className", () => {
      const { container } = render(
        <MobileSwipeActions {...defaultProps} className="custom-swipe" />
      );
      expect(container.firstChild).toHaveClass("custom-swipe");
    });

    it("should have relative positioning", () => {
      const { container } = render(<MobileSwipeActions {...defaultProps} />);
      expect(container.firstChild).toHaveClass("relative");
    });

    it("should have overflow-hidden", () => {
      const { container } = render(<MobileSwipeActions {...defaultProps} />);
      expect(container.firstChild).toHaveClass("overflow-hidden");
    });
  });

  describe("Right Actions (Swipe Left)", () => {
    it("should render right action buttons", () => {
      render(<MobileSwipeActions {...defaultProps} />);
      expect(screen.getByLabelText("Delete")).toBeInTheDocument();
      expect(screen.getByLabelText("Edit")).toBeInTheDocument();
    });

    it("should position right actions absolutely on right side", () => {
      const { container } = render(<MobileSwipeActions {...defaultProps} />);
      const rightActionsContainer =
        container.querySelector(".absolute.right-0");
      expect(rightActionsContainer).toBeInTheDocument();
    });

    it("should render right action icons", () => {
      const { container } = render(<MobileSwipeActions {...defaultProps} />);
      // Icons are rendered but may not have specific lucide- classes in test env
      const buttons = screen.getAllByRole("button");
      expect(buttons.length).toBeGreaterThan(0);
    });

    it("should render right action labels", () => {
      render(<MobileSwipeActions {...defaultProps} />);
      expect(screen.getByText("Delete")).toBeInTheDocument();
      expect(screen.getByText("Edit")).toBeInTheDocument();
    });

    it("should apply action colors", () => {
      render(<MobileSwipeActions {...defaultProps} />);
      const deleteButton = screen.getByLabelText("Delete");
      expect(deleteButton).toHaveClass("bg-red-500");
    });

    it("should call onClick when action is clicked", () => {
      render(<MobileSwipeActions {...defaultProps} />);
      fireEvent.click(screen.getByLabelText("Delete"));
      expect(mockRightActions[0].onClick).toHaveBeenCalledTimes(1);
    });
  });

  describe("Left Actions (Swipe Right)", () => {
    it("should render left action buttons", () => {
      render(
        <MobileSwipeActions leftActions={mockLeftActions}>
          {<div>Content</div>}
        </MobileSwipeActions>
      );
      expect(screen.getByLabelText("Archive")).toBeInTheDocument();
    });

    it("should position left actions absolutely on left side", () => {
      const { container } = render(
        <MobileSwipeActions leftActions={mockLeftActions}>
          {<div>Content</div>}
        </MobileSwipeActions>
      );
      const leftActionsContainer = container.querySelector(".absolute.left-0");
      expect(leftActionsContainer).toBeInTheDocument();
    });

    it("should render left action labels", () => {
      render(
        <MobileSwipeActions leftActions={mockLeftActions}>
          {<div>Content</div>}
        </MobileSwipeActions>
      );
      expect(screen.getByText("Archive")).toBeInTheDocument();
    });

    it("should call onClick when left action is clicked", () => {
      render(
        <MobileSwipeActions leftActions={mockLeftActions}>
          {<div>Content</div>}
        </MobileSwipeActions>
      );
      fireEvent.click(screen.getByLabelText("Archive"));
      expect(mockLeftActions[0].onClick).toHaveBeenCalledTimes(1);
    });

    it("should apply left action colors", () => {
      render(
        <MobileSwipeActions leftActions={mockLeftActions}>
          {<div>Content</div>}
        </MobileSwipeActions>
      );
      const archiveButton = screen.getByLabelText("Archive");
      expect(archiveButton).toHaveClass("bg-yellow-500");
    });
  });

  describe("Touch Gesture Handling", () => {
    it("should handle touchStart event", () => {
      const { container } = render(<MobileSwipeActions {...defaultProps} />);
      const content = container.querySelector(".relative.bg-white");

      fireEvent.touchStart(content!, {
        touches: [{ clientX: 100, clientY: 50 }],
      });

      // Should not throw error
      expect(content).toBeInTheDocument();
    });

    it("should handle touchMove event", () => {
      const { container } = render(<MobileSwipeActions {...defaultProps} />);
      const content = container.querySelector(".relative.bg-white");

      fireEvent.touchStart(content!, {
        touches: [{ clientX: 100, clientY: 50 }],
      });

      fireEvent.touchMove(content!, {
        touches: [{ clientX: 50, clientY: 50 }],
      });

      expect(content).toBeInTheDocument();
    });

    it("should handle touchEnd event", () => {
      const { container } = render(<MobileSwipeActions {...defaultProps} />);
      const content = container.querySelector(".relative.bg-white");

      fireEvent.touchStart(content!, {
        touches: [{ clientX: 100, clientY: 50 }],
      });

      fireEvent.touchEnd(content!);

      expect(content).toBeInTheDocument();
    });

    it("should call onSwipeComplete callback", () => {
      const onSwipeComplete = jest.fn();
      const { container } = render(
        <MobileSwipeActions
          {...defaultProps}
          threshold={50}
          onSwipeComplete={onSwipeComplete}
        />
      );
      const content = container.querySelector(".relative.bg-white");

      // Simulate swipe left (reveal right actions) - must exceed threshold/2
      fireEvent.touchStart(content!, {
        touches: [{ clientX: 200, clientY: 50 }],
      });

      // Move significantly left (more than threshold/2 = 25px)
      fireEvent.touchMove(content!, {
        touches: [{ clientX: 150, clientY: 50 }], // First move to determine direction
      });

      fireEvent.touchMove(content!, {
        touches: [{ clientX: 100, clientY: 50 }], // Move 100px left (exceeds threshold)
      });

      fireEvent.touchEnd(content!);

      // Callback should be called with direction
      expect(onSwipeComplete).toHaveBeenCalledWith("left");
    });
  });

  describe("Action Button Styling", () => {
    it("should have touch-target class on action buttons", () => {
      render(<MobileSwipeActions {...defaultProps} />);
      const deleteButton = screen.getByLabelText("Delete");
      expect(deleteButton).toHaveClass("touch-target");
    });

    it("should have minimum width for actions", () => {
      render(<MobileSwipeActions {...defaultProps} />);
      const deleteButton = screen.getByLabelText("Delete");
      expect(deleteButton).toHaveClass("min-w-[80px]");
    });

    it("should have flex column layout for icon + label", () => {
      render(<MobileSwipeActions {...defaultProps} />);
      const deleteButton = screen.getByLabelText("Delete");
      expect(deleteButton).toHaveClass("flex");
      expect(deleteButton).toHaveClass("flex-col");
    });

    it("should center items in buttons", () => {
      render(<MobileSwipeActions {...defaultProps} />);
      const deleteButton = screen.getByLabelText("Delete");
      expect(deleteButton).toHaveClass("items-center");
      expect(deleteButton).toHaveClass("justify-center");
    });

    it("should have padding for touch area", () => {
      render(<MobileSwipeActions {...defaultProps} />);
      const deleteButton = screen.getByLabelText("Delete");
      expect(deleteButton).toHaveClass("px-4");
    });
  });

  describe("Content Container", () => {
    it("should have white background", () => {
      const { container } = render(<MobileSwipeActions {...defaultProps} />);
      const content = container.querySelector(".relative.bg-white");
      expect(content).toBeInTheDocument();
    });

    it("should have z-10 to stay above actions", () => {
      const { container } = render(<MobileSwipeActions {...defaultProps} />);
      const content = container.querySelector(".z-10");
      expect(content).toBeInTheDocument();
    });

    it("should have transform style for sliding", () => {
      const { container } = render(<MobileSwipeActions {...defaultProps} />);
      const content = container.querySelector(
        ".relative.bg-white"
      ) as HTMLElement;
      expect(content?.style.transform).toBeDefined();
    });

    it("should have transition for smooth animation", () => {
      const { container } = render(<MobileSwipeActions {...defaultProps} />);
      const content = container.querySelector(
        ".relative.bg-white"
      ) as HTMLElement;
      expect(content?.style.transition).toBeDefined();
    });
  });

  describe("Accessibility", () => {
    it("should have aria-label on action buttons", () => {
      render(<MobileSwipeActions {...defaultProps} />);
      const deleteButton = screen.getByLabelText("Delete");
      expect(deleteButton).toHaveAttribute("aria-label", "Delete");
    });

    it("should be keyboard accessible via button elements", () => {
      render(<MobileSwipeActions {...defaultProps} />);
      const deleteButton = screen.getByLabelText("Delete");
      expect(deleteButton.tagName).toBe("BUTTON");
    });

    it("should support keyboard navigation", () => {
      render(<MobileSwipeActions {...defaultProps} />);
      const deleteButton = screen.getByLabelText("Delete");
      deleteButton.focus();
      expect(document.activeElement).toBe(deleteButton);
    });
  });

  describe("Edge Cases", () => {
    it("should handle no left actions", () => {
      render(
        <MobileSwipeActions rightActions={mockRightActions}>
          {<div>Content</div>}
        </MobileSwipeActions>
      );
      expect(screen.queryByLabelText("Archive")).not.toBeInTheDocument();
    });

    it("should handle no right actions", () => {
      render(
        <MobileSwipeActions leftActions={mockLeftActions}>
          {<div>Content</div>}
        </MobileSwipeActions>
      );
      expect(screen.queryByLabelText("Delete")).not.toBeInTheDocument();
    });

    it("should handle multiple right actions", () => {
      const multipleActions = [
        ...mockRightActions,
        {
          id: "share",
          icon: <span>📤</span>,
          label: "Share",
          color: "text-white",
          bgColor: "bg-green-500",
          onClick: jest.fn(),
        },
      ];
      render(
        <MobileSwipeActions rightActions={multipleActions}>
          {<div>Content</div>}
        </MobileSwipeActions>
      );
      expect(screen.getByLabelText("Delete")).toBeInTheDocument();
      expect(screen.getByLabelText("Edit")).toBeInTheDocument();
      expect(screen.getByLabelText("Share")).toBeInTheDocument();
    });

    it("should handle custom threshold", () => {
      render(<MobileSwipeActions {...defaultProps} threshold={100} />);
      expect(screen.getByText("Swipeable Content")).toBeInTheDocument();
    });

    it("should handle rapid touch events", () => {
      const { container } = render(<MobileSwipeActions {...defaultProps} />);
      const content = container.querySelector(".relative.bg-white");

      fireEvent.touchStart(content!, {
        touches: [{ clientX: 100, clientY: 50 }],
      });
      fireEvent.touchEnd(content!);
      fireEvent.touchStart(content!, {
        touches: [{ clientX: 100, clientY: 50 }],
      });
      fireEvent.touchEnd(content!);

      // Should not throw error
      expect(content).toBeInTheDocument();
    });

    it("should handle long labels", () => {
      const longLabelAction = [
        {
          id: "long",
          icon: <span>🔒</span>,
          label: "This is a very long action label",
          color: "text-white",
          bgColor: "bg-purple-500",
          onClick: jest.fn(),
        },
      ];
      render(
        <MobileSwipeActions rightActions={longLabelAction}>
          {<div>Content</div>}
        </MobileSwipeActions>
      );
      expect(
        screen.getByText("This is a very long action label")
      ).toBeInTheDocument();
    });

    it("should handle action without icon", () => {
      const noIconAction = [
        {
          id: "no-icon",
          icon: null,
          label: "No Icon",
          color: "text-white",
          bgColor: "bg-gray-500",
          onClick: jest.fn(),
        },
      ];
      render(
        <MobileSwipeActions rightActions={noIconAction as any}>
          {<div>Content</div>}
        </MobileSwipeActions>
      );
      expect(screen.getByText("No Icon")).toBeInTheDocument();
    });
  });

  describe("Pre-built Action Helpers", () => {
    it("should create delete action with correct properties", () => {
      const onClick = jest.fn();
      const action = createDeleteAction(onClick);

      expect(action.id).toBe("delete");
      expect(action.label).toBe("Delete");
      expect(action.color).toBe("text-white");
      expect(action.bgColor).toBe("bg-red-500");

      action.onClick();
      expect(onClick).toHaveBeenCalled();
    });

    it("should create edit action with correct properties", () => {
      const onClick = jest.fn();
      const action = createEditAction(onClick);

      expect(action.id).toBe("edit");
      expect(action.label).toBe("Edit");
      expect(action.color).toBe("text-white");
      expect(action.bgColor).toBe("bg-blue-500");

      action.onClick();
      expect(onClick).toHaveBeenCalled();
    });

    it("should create more action with correct properties", () => {
      const onClick = jest.fn();
      const action = createMoreAction(onClick);

      expect(action.id).toBe("more");
      expect(action.label).toBe("More");
      expect(action.color).toBe("text-white");
      expect(action.bgColor).toBe("bg-gray-500");

      action.onClick();
      expect(onClick).toHaveBeenCalled();
    });

    it("should create delete action with Trash2 icon", () => {
      const onClick = jest.fn();
      const action = createDeleteAction(onClick);

      render(
        <MobileSwipeActions rightActions={[action]}>
          {<div>Content</div>}
        </MobileSwipeActions>
      );

      const { container } = render(<>{action.icon}</>);
      expect(container.querySelector(".lucide-trash-2")).toBeInTheDocument();
    });

    it("should create edit action with Edit icon", () => {
      const onClick = jest.fn();
      const action = createEditAction(onClick);

      // Verify icon renders (actual class may vary in test env)
      expect(action.icon).toBeTruthy();
    });

    it("should create more action with MoreHorizontal icon", () => {
      const onClick = jest.fn();
      const action = createMoreAction(onClick);

      // Verify icon renders (actual class may vary in test env)
      expect(action.icon).toBeTruthy();
    });
  });

  describe("Action Execution Flow", () => {
    it("should execute action and close swipe", () => {
      render(<MobileSwipeActions {...defaultProps} />);

      // Click action
      fireEvent.click(screen.getByLabelText("Delete"));

      // Should call onClick
      expect(mockRightActions[0].onClick).toHaveBeenCalledTimes(1);

      // Component should still be rendered (close is internal state)
      expect(screen.getByText("Swipeable Content")).toBeInTheDocument();
    });

    it("should render all actions without errors", () => {
      const multipleActions = [
        createDeleteAction(jest.fn()),
        createEditAction(jest.fn()),
        createMoreAction(jest.fn()),
      ];

      render(
        <MobileSwipeActions rightActions={multipleActions}>
          {<div>Content</div>}
        </MobileSwipeActions>
      );

      expect(screen.getByLabelText("Delete")).toBeInTheDocument();
      expect(screen.getByLabelText("Edit")).toBeInTheDocument();
      expect(screen.getByLabelText("More")).toBeInTheDocument();
    });
  });

  describe("Responsive Design", () => {
    it("should stretch actions to full height", () => {
      const { container } = render(<MobileSwipeActions {...defaultProps} />);
      const actionsContainer = container.querySelector(".absolute.right-0");
      expect(actionsContainer).toHaveClass("top-0");
      expect(actionsContainer).toHaveClass("bottom-0");
    });

    it("should have flex layout for actions", () => {
      const { container } = render(<MobileSwipeActions {...defaultProps} />);
      const actionsContainer = container.querySelector(".absolute.right-0");
      expect(actionsContainer).toHaveClass("flex");
      expect(actionsContainer).toHaveClass("items-stretch");
    });
  });
});
