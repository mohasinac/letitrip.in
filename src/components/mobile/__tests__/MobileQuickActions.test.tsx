import { fireEvent, render, screen } from "@testing-library/react";
import { Edit, MessageSquare, Share2 } from "lucide-react";
import { MobileQuickActions } from "../MobileQuickActions";

describe("MobileQuickActions - Floating Action Button", () => {
  const mockAction1 = jest.fn();
  const mockAction2 = jest.fn();
  const mockAction3 = jest.fn();

  const defaultActions = [
    {
      id: "action1",
      label: "Edit",
      icon: <Edit className="w-5 h-5" />,
      onClick: mockAction1,
    },
    {
      id: "action2",
      label: "Message",
      icon: <MessageSquare className="w-5 h-5" />,
      onClick: mockAction2,
      color: "bg-green-500 hover:bg-green-600",
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Basic Rendering", () => {
    it("should render main FAB button", () => {
      render(<MobileQuickActions actions={defaultActions} />);
      expect(screen.getByLabelText("Open quick actions")).toBeInTheDocument();
    });

    it("should render with Plus icon by default when closed", () => {
      const { container } = render(
        <MobileQuickActions actions={defaultActions} />
      );
      const mainButton = screen.getByLabelText("Open quick actions");
      expect(mainButton.querySelector("svg")).toBeInTheDocument();
    });

    it("should be hidden on desktop (lg:hidden)", () => {
      const { container } = render(
        <MobileQuickActions actions={defaultActions} />
      );
      expect(container.firstChild).toHaveClass("lg:hidden");
    });

    it("should not show action buttons initially", () => {
      const { container } = render(
        <MobileQuickActions actions={defaultActions} />
      );
      const actionsContainer = container.querySelector(".opacity-0");
      expect(actionsContainer).toBeInTheDocument();
      expect(actionsContainer).toHaveClass("pointer-events-none");
    });
  });

  describe("Position", () => {
    it("should position at bottom-right by default", () => {
      const { container } = render(
        <MobileQuickActions actions={defaultActions} />
      );
      expect(container.firstChild).toHaveClass("bottom-24", "right-4");
    });

    it("should position at bottom-left when specified", () => {
      const { container } = render(
        <MobileQuickActions actions={defaultActions} position="bottom-left" />
      );
      expect(container.firstChild).toHaveClass("bottom-24", "left-4");
    });

    it("should have fixed positioning", () => {
      const { container } = render(
        <MobileQuickActions actions={defaultActions} />
      );
      expect(container.firstChild).toHaveClass("fixed");
    });

    it("should have z-40", () => {
      const { container } = render(
        <MobileQuickActions actions={defaultActions} />
      );
      expect(container.firstChild).toHaveClass("z-40");
    });
  });

  describe("Opening/Closing", () => {
    it("should open action menu on main button click", () => {
      render(<MobileQuickActions actions={defaultActions} />);
      fireEvent.click(screen.getByLabelText("Open quick actions"));
      expect(screen.getByText("Edit")).toBeVisible();
      expect(screen.getByText("Message")).toBeVisible();
    });

    it("should close action menu on second main button click", () => {
      const { container } = render(
        <MobileQuickActions actions={defaultActions} />
      );
      const mainButton = screen.getByLabelText("Open quick actions");

      fireEvent.click(mainButton);
      expect(screen.getByText("Edit")).toBeInTheDocument();

      fireEvent.click(screen.getByLabelText("Close quick actions"));

      const actionsContainer = container.querySelector(".opacity-0");
      expect(actionsContainer).toHaveClass("pointer-events-none");
    });

    it("should change aria-expanded when opened", () => {
      render(<MobileQuickActions actions={defaultActions} />);
      const mainButton = screen.getByLabelText("Open quick actions");

      expect(mainButton).toHaveAttribute("aria-expanded", "false");

      fireEvent.click(mainButton);

      expect(screen.getByLabelText("Close quick actions")).toHaveAttribute(
        "aria-expanded",
        "true"
      );
    });

    it("should change label when opened", () => {
      render(<MobileQuickActions actions={defaultActions} />);

      expect(screen.getByLabelText("Open quick actions")).toBeInTheDocument();

      fireEvent.click(screen.getByLabelText("Open quick actions"));

      expect(screen.getByLabelText("Close quick actions")).toBeInTheDocument();
    });

    it("should rotate main button 45deg when opened", () => {
      render(<MobileQuickActions actions={defaultActions} />);
      const mainButton = screen.getByLabelText("Open quick actions");

      fireEvent.click(mainButton);

      expect(mainButton).toHaveClass("rotate-45");
    });

    it("should change main button background when opened", () => {
      render(<MobileQuickActions actions={defaultActions} />);
      const mainButton = screen.getByLabelText("Open quick actions");

      fireEvent.click(mainButton);

      expect(mainButton).toHaveClass("bg-gray-700");
    });
  });

  describe("Action Buttons", () => {
    it("should render all action buttons when open", () => {
      render(<MobileQuickActions actions={defaultActions} />);
      fireEvent.click(screen.getByLabelText("Open quick actions"));

      expect(screen.getByText("Edit")).toBeInTheDocument();
      expect(screen.getByText("Message")).toBeInTheDocument();
    });

    it("should render action labels", () => {
      render(<MobileQuickActions actions={defaultActions} />);
      fireEvent.click(screen.getByLabelText("Open quick actions"));

      expect(screen.getByText("Edit")).toBeInTheDocument();
    });

    it("should render action icons", () => {
      render(<MobileQuickActions actions={defaultActions} />);
      fireEvent.click(screen.getByLabelText("Open quick actions"));

      const editButton = screen.getByLabelText("Edit");
      expect(editButton.querySelector("svg")).toBeInTheDocument();
    });

    it("should call action onClick when clicked", () => {
      render(<MobileQuickActions actions={defaultActions} />);
      fireEvent.click(screen.getByLabelText("Open quick actions"));

      fireEvent.click(screen.getByLabelText("Edit"));

      expect(mockAction1).toHaveBeenCalledTimes(1);
    });

    it("should close menu after action click", () => {
      const { container } = render(
        <MobileQuickActions actions={defaultActions} />
      );
      fireEvent.click(screen.getByLabelText("Open quick actions"));

      fireEvent.click(screen.getByLabelText("Edit"));

      const actionsContainer = container.querySelector(".opacity-0");
      expect(actionsContainer).toHaveClass("pointer-events-none");
    });

    it("should apply custom color to action button", () => {
      render(<MobileQuickActions actions={defaultActions} />);
      fireEvent.click(screen.getByLabelText("Open quick actions"));

      const messageButton = screen.getByLabelText("Message");
      expect(messageButton).toHaveClass("bg-green-500");
    });

    it("should apply default blue color if no color specified", () => {
      render(<MobileQuickActions actions={defaultActions} />);
      fireEvent.click(screen.getByLabelText("Open quick actions"));

      const editButton = screen.getByLabelText("Edit");
      expect(editButton).toHaveClass("bg-blue-500");
    });

    it("should have touch-target class", () => {
      render(<MobileQuickActions actions={defaultActions} />);
      fireEvent.click(screen.getByLabelText("Open quick actions"));

      const editButton = screen.getByLabelText("Edit");
      expect(editButton).toHaveClass("touch-target");
    });

    it("should have active:scale-95 for touch feedback", () => {
      render(<MobileQuickActions actions={defaultActions} />);
      fireEvent.click(screen.getByLabelText("Open quick actions"));

      const editButton = screen.getByLabelText("Edit");
      expect(editButton).toHaveClass("active:scale-95");
    });

    it("should render action buttons in flex-col-reverse", () => {
      const { container } = render(
        <MobileQuickActions actions={defaultActions} />
      );
      fireEvent.click(screen.getByLabelText("Open quick actions"));

      const actionsContainer = container.querySelector(".flex-col-reverse");
      expect(actionsContainer).toBeInTheDocument();
    });
  });

  describe("Label Positioning", () => {
    it("should position label left of button for bottom-right", () => {
      render(<MobileQuickActions actions={defaultActions} />);
      fireEvent.click(screen.getByLabelText("Open quick actions"));

      const editLabel = screen.getByText("Edit");
      expect(editLabel).toHaveClass("order-1");
    });

    it("should position label right of button for bottom-left", () => {
      render(
        <MobileQuickActions actions={defaultActions} position="bottom-left" />
      );
      fireEvent.click(screen.getByLabelText("Open quick actions"));

      const editLabel = screen.getByText("Edit");
      expect(editLabel).toHaveClass("order-2");
    });

    it("should have dark background for labels", () => {
      render(<MobileQuickActions actions={defaultActions} />);
      fireEvent.click(screen.getByLabelText("Open quick actions"));

      const editLabel = screen.getByText("Edit");
      expect(editLabel).toHaveClass("bg-gray-900", "text-white");
    });

    it("should have shadow on labels", () => {
      render(<MobileQuickActions actions={defaultActions} />);
      fireEvent.click(screen.getByLabelText("Open quick actions"));

      const editLabel = screen.getByText("Edit");
      expect(editLabel).toHaveClass("shadow-lg");
    });

    it("should prevent label text wrapping", () => {
      render(<MobileQuickActions actions={defaultActions} />);
      fireEvent.click(screen.getByLabelText("Open quick actions"));

      const editLabel = screen.getByText("Edit");
      expect(editLabel).toHaveClass("whitespace-nowrap");
    });
  });

  describe("Custom Main Icon", () => {
    it("should render custom main icon", () => {
      const customIcon = (
        <Share2 className="w-6 h-6" data-testid="custom-icon" />
      );
      render(
        <MobileQuickActions actions={defaultActions} mainIcon={customIcon} />
      );

      expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
    });

    it("should use custom icon instead of Plus/X", () => {
      const customIcon = (
        <Share2 className="w-6 h-6" data-testid="custom-icon" />
      );
      render(
        <MobileQuickActions actions={defaultActions} mainIcon={customIcon} />
      );

      fireEvent.click(screen.getByLabelText("Open quick actions"));

      expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
    });
  });

  describe("Main FAB Button Styling", () => {
    it("should have yellow background when closed", () => {
      render(<MobileQuickActions actions={defaultActions} />);
      const mainButton = screen.getByLabelText("Open quick actions");

      expect(mainButton).toHaveClass("bg-yellow-500");
    });

    it("should have w-14 h-14 size", () => {
      render(<MobileQuickActions actions={defaultActions} />);
      const mainButton = screen.getByLabelText("Open quick actions");

      expect(mainButton).toHaveClass("w-14", "h-14");
    });

    it("should be circular (rounded-full)", () => {
      render(<MobileQuickActions actions={defaultActions} />);
      const mainButton = screen.getByLabelText("Open quick actions");

      expect(mainButton).toHaveClass("rounded-full");
    });

    it("should have shadow", () => {
      render(<MobileQuickActions actions={defaultActions} />);
      const mainButton = screen.getByLabelText("Open quick actions");

      expect(mainButton).toHaveClass("shadow-lg");
    });

    it("should have touch-target class", () => {
      render(<MobileQuickActions actions={defaultActions} />);
      const mainButton = screen.getByLabelText("Open quick actions");

      expect(mainButton).toHaveClass("touch-target");
    });

    it("should have active:scale-95 for touch feedback", () => {
      render(<MobileQuickActions actions={defaultActions} />);
      const mainButton = screen.getByLabelText("Open quick actions");

      expect(mainButton).toHaveClass("active:scale-95");
    });

    it("should have transition-all duration-300", () => {
      render(<MobileQuickActions actions={defaultActions} />);
      const mainButton = screen.getByLabelText("Open quick actions");

      expect(mainButton).toHaveClass("transition-all", "duration-300");
    });
  });

  describe("Animations", () => {
    it("should have opacity-100 when actions are open", () => {
      const { container } = render(
        <MobileQuickActions actions={defaultActions} />
      );
      fireEvent.click(screen.getByLabelText("Open quick actions"));

      const actionsContainer = container.querySelector(".opacity-100");
      expect(actionsContainer).toBeInTheDocument();
    });

    it("should have opacity-0 when actions are closed", () => {
      const { container } = render(
        <MobileQuickActions actions={defaultActions} />
      );

      const actionsContainer = container.querySelector(".opacity-0");
      expect(actionsContainer).toBeInTheDocument();
    });

    it("should have pointer-events-none when closed", () => {
      const { container } = render(
        <MobileQuickActions actions={defaultActions} />
      );

      const actionsContainer = container.querySelector(".pointer-events-none");
      expect(actionsContainer).toBeInTheDocument();
    });

    it("should have translate-y transformations", () => {
      const { container } = render(
        <MobileQuickActions actions={defaultActions} />
      );

      const actionsContainer = container.querySelector(".translate-y-4");
      expect(actionsContainer).toBeInTheDocument();
    });

    it("should have transition-all duration-300", () => {
      const { container } = render(
        <MobileQuickActions actions={defaultActions} />
      );

      const actionsContainer = container.querySelector(".duration-300");
      expect(actionsContainer).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty actions array", () => {
      const { container } = render(<MobileQuickActions actions={[]} />);

      fireEvent.click(screen.getByLabelText("Open quick actions"));

      const allButtons = container.querySelectorAll("button");
      expect(allButtons.length).toBe(1); // Only main FAB button
    });

    it("should handle single action", () => {
      const singleAction = [defaultActions[0]];
      render(<MobileQuickActions actions={singleAction} />);

      fireEvent.click(screen.getByLabelText("Open quick actions"));

      expect(screen.getByText("Edit")).toBeInTheDocument();
    });

    it("should handle many actions (5+)", () => {
      const manyActions = Array.from({ length: 7 }, (_, i) => ({
        id: `action${i}`,
        label: `Action ${i}`,
        icon: <Edit className="w-5 h-5" />,
        onClick: jest.fn(),
      }));

      render(<MobileQuickActions actions={manyActions} />);
      fireEvent.click(screen.getByLabelText("Open quick actions"));

      expect(screen.getByText("Action 0")).toBeInTheDocument();
      expect(screen.getByText("Action 6")).toBeInTheDocument();
    });

    it("should handle rapid open/close", () => {
      const { container } = render(
        <MobileQuickActions actions={defaultActions} />
      );

      for (let i = 0; i < 5; i++) {
        fireEvent.click(screen.getByLabelText(/quick actions/i));
        fireEvent.click(screen.getByLabelText(/quick actions/i));
      }

      const actionsContainer = container.querySelector(".opacity-0");
      expect(actionsContainer).toHaveClass("pointer-events-none");
    });

    it("should handle action with very long label", () => {
      const longLabelAction = [
        {
          id: "long",
          label: "This is a very long label that should not wrap",
          icon: <Edit className="w-5 h-5" />,
          onClick: jest.fn(),
        },
      ];

      render(<MobileQuickActions actions={longLabelAction} />);
      fireEvent.click(screen.getByLabelText("Open quick actions"));

      expect(
        screen.getByText("This is a very long label that should not wrap")
      ).toBeInTheDocument();
    });

    it("should handle action without color (default blue)", () => {
      const noColorAction = [
        {
          id: "nocolor",
          label: "No Color",
          icon: <Edit className="w-5 h-5" />,
          onClick: jest.fn(),
        },
      ];

      render(<MobileQuickActions actions={noColorAction} />);
      fireEvent.click(screen.getByLabelText("Open quick actions"));

      const button = screen.getByLabelText("No Color");
      expect(button).toHaveClass("bg-blue-500");
    });

    it("should handle clicking same action multiple times", () => {
      const mockFn = jest.fn();
      const actions = [
        {
          id: "repeat",
          label: "Repeat",
          icon: <Edit className="w-5 h-5" />,
          onClick: mockFn,
        },
      ];

      render(<MobileQuickActions actions={actions} />);

      fireEvent.click(screen.getByLabelText("Open quick actions"));
      fireEvent.click(screen.getByLabelText("Repeat"));
      fireEvent.click(screen.getByLabelText("Open quick actions"));
      fireEvent.click(screen.getByLabelText("Repeat"));

      expect(mockFn).toHaveBeenCalledTimes(2);
    });
  });

  describe("Accessibility", () => {
    it("should have aria-label on main button", () => {
      render(<MobileQuickActions actions={defaultActions} />);

      expect(screen.getByLabelText("Open quick actions")).toBeInTheDocument();
    });

    it("should have aria-expanded attribute", () => {
      render(<MobileQuickActions actions={defaultActions} />);
      const mainButton = screen.getByLabelText("Open quick actions");

      expect(mainButton).toHaveAttribute("aria-expanded", "false");
    });

    it("should have aria-label on each action button", () => {
      render(<MobileQuickActions actions={defaultActions} />);
      fireEvent.click(screen.getByLabelText("Open quick actions"));

      expect(screen.getByLabelText("Edit")).toBeInTheDocument();
      expect(screen.getByLabelText("Message")).toBeInTheDocument();
    });

    it("should be keyboard accessible (button elements)", () => {
      render(<MobileQuickActions actions={defaultActions} />);
      fireEvent.click(screen.getByLabelText("Open quick actions"));

      const editButton = screen.getByLabelText("Edit");
      expect(editButton.tagName).toBe("BUTTON");
    });
  });
});
