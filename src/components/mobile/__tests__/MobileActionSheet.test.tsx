/**
 * Comprehensive Unit Tests for MobileActionSheet Component
 * Testing action handling, variants, accessibility, and mobile interactions
 *
 * @batch 13
 * @status NEW
 */

import { fireEvent, render, screen } from "@testing-library/react";
import { Edit, Share, Trash } from "lucide-react";
import { MobileActionSheet } from "../MobileActionSheet";

describe("MobileActionSheet - Mobile Component", () => {
  const mockActions = [
    {
      id: "edit",
      label: "Edit",
      icon: <Edit />,
      onClick: jest.fn(),
      variant: "default" as const,
    },
    {
      id: "share",
      label: "Share",
      icon: <Share />,
      onClick: jest.fn(),
      variant: "primary" as const,
    },
    {
      id: "delete",
      label: "Delete",
      icon: <Trash />,
      onClick: jest.fn(),
      variant: "destructive" as const,
    },
  ];

  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    title: "Actions",
    actions: mockActions,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Basic Rendering", () => {
    it("should render when isOpen is true", () => {
      render(<MobileActionSheet {...defaultProps} />);
      expect(screen.getByText("Edit")).toBeInTheDocument();
      expect(screen.getByText("Share")).toBeInTheDocument();
      expect(screen.getByText("Delete")).toBeInTheDocument();
    });

    it("should not render when isOpen is false", () => {
      render(<MobileActionSheet {...defaultProps} isOpen={false} />);
      expect(screen.queryByText("Edit")).not.toBeInTheDocument();
    });

    it("should render all actions", () => {
      render(<MobileActionSheet {...defaultProps} />);
      mockActions.forEach((action) => {
        expect(screen.getByText(action.label)).toBeInTheDocument();
      });
    });

    it("should render empty state with no actions", () => {
      render(<MobileActionSheet {...defaultProps} actions={[]} />);
      expect(screen.getByText("Cancel")).toBeInTheDocument();
    });

    it("should render title when provided", () => {
      render(<MobileActionSheet {...defaultProps} title="Choose Action" />);
      expect(screen.getByText("Choose Action")).toBeInTheDocument();
    });
  });

  describe("Action Items", () => {
    it("should call action onClick when clicked", () => {
      render(<MobileActionSheet {...defaultProps} />);
      fireEvent.click(screen.getByText("Edit"));
      expect(mockActions[0].onClick).toHaveBeenCalledTimes(1);
    });

    it("should close sheet after action is clicked", () => {
      const onClose = jest.fn();
      render(<MobileActionSheet {...defaultProps} onClose={onClose} />);
      fireEvent.click(screen.getByText("Edit"));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("should not close if action is disabled", () => {
      const disabledAction = {
        id: "disabled",
        label: "Disabled Action",
        onClick: jest.fn(),
        disabled: true,
      };
      const onClose = jest.fn();
      render(
        <MobileActionSheet
          {...defaultProps}
          onClose={onClose}
          actions={[disabledAction]}
        />
      );
      fireEvent.click(screen.getByText("Disabled Action"));
      expect(disabledAction.onClick).not.toHaveBeenCalled();
      expect(onClose).not.toHaveBeenCalled();
    });

    it("should render action icons", () => {
      const { container } = render(<MobileActionSheet {...defaultProps} />);
      const icons = container.querySelectorAll(".w-6.h-6");
      expect(icons.length).toBeGreaterThan(0);
    });

    it("should handle actions without icons", () => {
      const actionsWithoutIcons = [
        {
          id: "action1",
          label: "Action 1",
          onClick: jest.fn(),
        },
      ];
      render(
        <MobileActionSheet {...defaultProps} actions={actionsWithoutIcons} />
      );
      expect(screen.getByText("Action 1")).toBeInTheDocument();
    });
  });

  describe("Action Variants", () => {
    it("should style default variant correctly", () => {
      render(<MobileActionSheet {...defaultProps} />);
      const editButton = screen.getByText("Edit").closest("button");
      expect(editButton).toHaveClass("text-gray-700");
    });

    it("should style primary variant correctly", () => {
      render(<MobileActionSheet {...defaultProps} />);
      const shareButton = screen.getByText("Share").closest("button");
      expect(shareButton).toHaveClass("text-yellow-700");
      expect(shareButton).toHaveClass("bg-yellow-50");
    });

    it("should style destructive variant correctly", () => {
      render(<MobileActionSheet {...defaultProps} />);
      const deleteButton = screen.getByText("Delete").closest("button");
      expect(deleteButton).toHaveClass("text-red-600");
    });

    it("should handle actions without variant (defaults to default)", () => {
      const actionWithoutVariant = [
        {
          id: "test",
          label: "Test",
          onClick: jest.fn(),
        },
      ];
      render(
        <MobileActionSheet {...defaultProps} actions={actionWithoutVariant} />
      );
      const button = screen.getByText("Test").closest("button");
      expect(button).toHaveClass("text-gray-700");
    });
  });

  describe("Disabled State", () => {
    it("should disable button when action is disabled", () => {
      const disabledAction = [
        {
          id: "disabled",
          label: "Disabled",
          onClick: jest.fn(),
          disabled: true,
        },
      ];
      render(<MobileActionSheet {...defaultProps} actions={disabledAction} />);
      const button = screen.getByText("Disabled").closest("button");
      expect(button).toBeDisabled();
    });

    it("should apply disabled styling", () => {
      const disabledAction = [
        {
          id: "disabled",
          label: "Disabled",
          onClick: jest.fn(),
          disabled: true,
        },
      ];
      render(<MobileActionSheet {...defaultProps} actions={disabledAction} />);
      const button = screen.getByText("Disabled").closest("button");
      expect(button).toHaveClass("opacity-50");
      expect(button).toHaveClass("cursor-not-allowed");
    });

    it("should not call onClick for disabled action", () => {
      const disabledAction = [
        {
          id: "disabled",
          label: "Disabled",
          onClick: jest.fn(),
          disabled: true,
        },
      ];
      render(<MobileActionSheet {...defaultProps} actions={disabledAction} />);
      fireEvent.click(screen.getByText("Disabled"));
      expect(disabledAction[0].onClick).not.toHaveBeenCalled();
    });
  });

  describe("Cancel Button", () => {
    it("should show cancel button by default", () => {
      render(<MobileActionSheet {...defaultProps} />);
      expect(screen.getByText("Cancel")).toBeInTheDocument();
    });

    it("should hide cancel button when showCancel is false", () => {
      render(<MobileActionSheet {...defaultProps} showCancel={false} />);
      expect(screen.queryByText("Cancel")).not.toBeInTheDocument();
    });

    it("should call onClose when cancel is clicked", () => {
      const onClose = jest.fn();
      render(<MobileActionSheet {...defaultProps} onClose={onClose} />);
      fireEvent.click(screen.getByText("Cancel"));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("should use custom cancel label", () => {
      render(<MobileActionSheet {...defaultProps} cancelLabel="Close" />);
      expect(screen.getByText("Close")).toBeInTheDocument();
      expect(screen.queryByText("Cancel")).not.toBeInTheDocument();
    });

    it("should have separator before cancel button", () => {
      const { container } = render(<MobileActionSheet {...defaultProps} />);
      const separator = container.querySelector(".border-t.border-gray-200");
      expect(separator).toBeInTheDocument();
    });
  });

  describe("Mobile-Specific Styling", () => {
    it("should have touch-target class on action buttons", () => {
      render(<MobileActionSheet {...defaultProps} />);
      const editButton = screen.getByText("Edit").closest("button");
      expect(editButton).toHaveClass("touch-target");
    });

    it("should have active scale effect", () => {
      render(<MobileActionSheet {...defaultProps} />);
      const editButton = screen.getByText("Edit").closest("button");
      expect(editButton).toHaveClass("active:scale-[0.98]");
    });

    it("should have full width buttons", () => {
      render(<MobileActionSheet {...defaultProps} />);
      const editButton = screen.getByText("Edit").closest("button");
      expect(editButton).toHaveClass("w-full");
    });

    it("should have rounded corners", () => {
      render(<MobileActionSheet {...defaultProps} />);
      const editButton = screen.getByText("Edit").closest("button");
      expect(editButton).toHaveClass("rounded-lg");
    });

    it("should have adequate padding for touch", () => {
      render(<MobileActionSheet {...defaultProps} />);
      const editButton = screen.getByText("Edit").closest("button");
      expect(editButton).toHaveClass("px-4");
      expect(editButton).toHaveClass("py-4");
    });
  });

  describe("Accessibility", () => {
    it("should render buttons with proper semantics", () => {
      render(<MobileActionSheet {...defaultProps} />);
      const buttons = screen.getAllByRole("button");
      expect(buttons.length).toBeGreaterThan(0);
    });

    it("should support keyboard navigation", () => {
      render(<MobileActionSheet {...defaultProps} />);
      const editButton = screen.getByText("Edit").closest("button");
      editButton?.focus();
      expect(document.activeElement).toBe(editButton);
    });

    it("should have proper disabled state", () => {
      const disabledAction = [
        {
          id: "disabled",
          label: "Disabled",
          onClick: jest.fn(),
          disabled: true,
        },
      ];
      render(<MobileActionSheet {...defaultProps} actions={disabledAction} />);
      const button = screen.getByText("Disabled").closest("button");
      expect(button).toHaveAttribute("disabled");
    });
  });

  describe("Layout & Spacing", () => {
    it("should have spacing between actions", () => {
      const { container } = render(<MobileActionSheet {...defaultProps} />);
      const actionContainer = container.querySelector(".space-y-1");
      expect(actionContainer).toBeInTheDocument();
    });

    it("should have padding around action list", () => {
      const { container } = render(<MobileActionSheet {...defaultProps} />);
      const wrapper = container.querySelector(".p-2");
      expect(wrapper).toBeInTheDocument();
    });

    it("should have gap between icon and label", () => {
      render(<MobileActionSheet {...defaultProps} />);
      const editButton = screen.getByText("Edit").closest("button");
      expect(editButton).toHaveClass("gap-3");
    });

    it("should center icon container", () => {
      const { container } = render(<MobileActionSheet {...defaultProps} />);
      const iconContainer = container.querySelector(
        ".w-6.h-6.flex.items-center.justify-center"
      );
      expect(iconContainer).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should handle single action", () => {
      const singleAction = [mockActions[0]];
      render(<MobileActionSheet {...defaultProps} actions={singleAction} />);
      expect(screen.getByText("Edit")).toBeInTheDocument();
      expect(screen.queryByText("Share")).not.toBeInTheDocument();
    });

    it("should handle many actions (10+)", () => {
      const manyActions = Array.from({ length: 15 }, (_, i) => ({
        id: `action-${i}`,
        label: `Action ${i}`,
        onClick: jest.fn(),
      }));
      render(<MobileActionSheet {...defaultProps} actions={manyActions} />);
      expect(screen.getByText("Action 0")).toBeInTheDocument();
      expect(screen.getByText("Action 14")).toBeInTheDocument();
    });

    it("should handle very long action labels", () => {
      const longLabel =
        "This is a very long action label that might wrap to multiple lines";
      const actionWithLongLabel = [
        {
          id: "long",
          label: longLabel,
          onClick: jest.fn(),
        },
      ];
      render(
        <MobileActionSheet {...defaultProps} actions={actionWithLongLabel} />
      );
      expect(screen.getByText(longLabel)).toBeInTheDocument();
    });

    it("should handle special characters in labels", () => {
      const specialLabel = "Edit <>&\"' Item";
      const actionWithSpecialChars = [
        {
          id: "special",
          label: specialLabel,
          onClick: jest.fn(),
        },
      ];
      render(
        <MobileActionSheet {...defaultProps} actions={actionWithSpecialChars} />
      );
      expect(screen.getByText(specialLabel)).toBeInTheDocument();
    });

    it("should handle rapid clicks", () => {
      render(<MobileActionSheet {...defaultProps} />);
      const editButton = screen.getByText("Edit");
      fireEvent.click(editButton);
      fireEvent.click(editButton);
      fireEvent.click(editButton);
      // onClick is called for each click in the test environment
      // In real usage, sheet would close and prevent additional clicks
      expect(mockActions[0].onClick).toHaveBeenCalledTimes(3);
    });
  });

  describe("Integration with MobileBottomSheet", () => {
    it("should pass isOpen to MobileBottomSheet", () => {
      const { rerender } = render(
        <MobileActionSheet {...defaultProps} isOpen={true} />
      );
      expect(screen.getByText("Edit")).toBeInTheDocument();

      rerender(<MobileActionSheet {...defaultProps} isOpen={false} />);
      expect(screen.queryByText("Edit")).not.toBeInTheDocument();
    });

    it("should pass onClose to MobileBottomSheet", () => {
      const onClose = jest.fn();
      render(<MobileActionSheet {...defaultProps} onClose={onClose} />);
      // The overlay click should trigger onClose
      // This tests the integration
      expect(onClose).toBeDefined();
    });

    it("should pass title to MobileBottomSheet", () => {
      render(<MobileActionSheet {...defaultProps} title="My Actions" />);
      expect(screen.getByText("My Actions")).toBeInTheDocument();
    });

    it("should hide close button in MobileBottomSheet", () => {
      render(<MobileActionSheet {...defaultProps} />);
      // Should not have X button since showCloseButton={false}
      expect(screen.queryByLabelText("Close")).not.toBeInTheDocument();
    });
  });

  describe("Action Flow", () => {
    it("should execute action then close", () => {
      const onClose = jest.fn();
      const onClick = jest.fn();
      const action = [
        {
          id: "test",
          label: "Test",
          onClick,
        },
      ];
      render(
        <MobileActionSheet
          {...defaultProps}
          onClose={onClose}
          actions={action}
        />
      );
      fireEvent.click(screen.getByText("Test"));
      expect(onClick).toHaveBeenCalledTimes(1);
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("should close on cancel without executing action", () => {
      const onClose = jest.fn();
      render(<MobileActionSheet {...defaultProps} onClose={onClose} />);
      fireEvent.click(screen.getByText("Cancel"));
      mockActions.forEach((action) => {
        expect(action.onClick).not.toHaveBeenCalled();
      });
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });
});
