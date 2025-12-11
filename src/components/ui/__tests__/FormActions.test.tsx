import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import { FormActions } from "../FormActions";

// Mock Button component
jest.mock("../Button", () => ({
  Button: ({
    children,
    onClick,
    disabled,
    isLoading,
    type,
    variant,
    ...props
  }: any) => (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      type={type}
      data-variant={variant}
      data-loading={isLoading}
      {...props}
    >
      {isLoading ? "Loading..." : children}
    </button>
  ),
}));

describe("FormActions - Form Action Buttons Layout", () => {
  describe("Basic Rendering", () => {
    it("should render FormActions container", () => {
      const { container } = render(<FormActions />);
      const wrapper = container.firstChild;
      expect(wrapper).toBeInTheDocument();
    });

    it("should have flex items-center gap-3", () => {
      const { container } = render(<FormActions />);
      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass("flex", "items-center", "gap-3");
    });

    it("should have rounded-lg border", () => {
      const { container } = render(<FormActions />);
      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass("rounded-lg", "border");
    });

    it("should have border-gray-200", () => {
      const { container } = render(<FormActions />);
      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass("border-gray-200");
    });

    it("should have bg-gray-50", () => {
      const { container } = render(<FormActions />);
      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass("bg-gray-50");
    });

    it("should have p-4 padding", () => {
      const { container } = render(<FormActions />);
      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass("p-4");
    });
  });

  describe("Submit Button", () => {
    it("should render submit button with default label", () => {
      render(<FormActions onSubmit={jest.fn()} />);
      expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
    });

    it("should render submit button with custom label", () => {
      render(<FormActions onSubmit={jest.fn()} submitLabel="Create" />);
      expect(
        screen.getByRole("button", { name: "Create" })
      ).toBeInTheDocument();
    });

    it("should have type submit", () => {
      render(<FormActions onSubmit={jest.fn()} />);
      const submitBtn = screen.getByRole("button", { name: "Save" });
      expect(submitBtn).toHaveAttribute("type", "submit");
    });

    it("should call onSubmit when clicked", () => {
      const handleSubmit = jest.fn();
      render(<FormActions onSubmit={handleSubmit} />);
      fireEvent.click(screen.getByRole("button", { name: "Save" }));
      expect(handleSubmit).toHaveBeenCalledTimes(1);
    });

    it("should use primary variant by default", () => {
      render(<FormActions onSubmit={jest.fn()} />);
      const submitBtn = screen.getByRole("button", { name: "Save" });
      expect(submitBtn).toHaveAttribute("data-variant", "primary");
    });

    it("should accept custom submitVariant", () => {
      render(<FormActions onSubmit={jest.fn()} submitVariant="secondary" />);
      const submitBtn = screen.getByRole("button", { name: "Save" });
      expect(submitBtn).toHaveAttribute("data-variant", "secondary");
    });

    it("should be disabled when submitDisabled is true", () => {
      render(<FormActions onSubmit={jest.fn()} submitDisabled />);
      const submitBtn = screen.getByRole("button", { name: "Save" });
      expect(submitBtn).toBeDisabled();
    });

    it("should be disabled when isSubmitting is true", () => {
      render(<FormActions onSubmit={jest.fn()} isSubmitting />);
      const submitBtn = screen.getByRole("button", { name: "Loading..." });
      expect(submitBtn).toBeDisabled();
    });

    it("should show loading state when isSubmitting", () => {
      render(<FormActions onSubmit={jest.fn()} isSubmitting />);
      expect(screen.getByText("Loading...")).toBeInTheDocument();
    });

    it("should not render when onSubmit is not provided", () => {
      render(<FormActions />);
      expect(
        screen.queryByRole("button", { name: "Save" })
      ).not.toBeInTheDocument();
    });
  });

  describe("Cancel Button", () => {
    it("should render cancel button by default when onCancel provided", () => {
      render(<FormActions onCancel={jest.fn()} />);
      expect(
        screen.getByRole("button", { name: "Cancel" })
      ).toBeInTheDocument();
    });

    it("should render cancel button with custom label", () => {
      render(<FormActions onCancel={jest.fn()} cancelLabel="Back" />);
      expect(screen.getByRole("button", { name: "Back" })).toBeInTheDocument();
    });

    it("should have type button", () => {
      render(<FormActions onCancel={jest.fn()} />);
      const cancelBtn = screen.getByRole("button", { name: "Cancel" });
      expect(cancelBtn).toHaveAttribute("type", "button");
    });

    it("should call onCancel when clicked", () => {
      const handleCancel = jest.fn();
      render(<FormActions onCancel={handleCancel} />);
      fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
      expect(handleCancel).toHaveBeenCalledTimes(1);
    });

    it("should use outline variant", () => {
      render(<FormActions onCancel={jest.fn()} />);
      const cancelBtn = screen.getByRole("button", { name: "Cancel" });
      expect(cancelBtn).toHaveAttribute("data-variant", "outline");
    });

    it("should be disabled when cancelDisabled is true", () => {
      render(<FormActions onCancel={jest.fn()} cancelDisabled />);
      const cancelBtn = screen.getByRole("button", { name: "Cancel" });
      expect(cancelBtn).toBeDisabled();
    });

    it("should be disabled when isSubmitting is true", () => {
      render(<FormActions onCancel={jest.fn()} isSubmitting />);
      const cancelBtn = screen.getByRole("button", { name: "Cancel" });
      expect(cancelBtn).toBeDisabled();
    });

    it("should not render when showCancel is false", () => {
      render(<FormActions onCancel={jest.fn()} showCancel={false} />);
      expect(
        screen.queryByRole("button", { name: "Cancel" })
      ).not.toBeInTheDocument();
    });

    it("should not render when onCancel is not provided", () => {
      render(<FormActions />);
      expect(
        screen.queryByRole("button", { name: "Cancel" })
      ).not.toBeInTheDocument();
    });
  });

  describe("Both Buttons", () => {
    it("should render both submit and cancel buttons", () => {
      render(<FormActions onSubmit={jest.fn()} onCancel={jest.fn()} />);
      expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Cancel" })
      ).toBeInTheDocument();
    });

    it("should render cancel before submit", () => {
      render(<FormActions onSubmit={jest.fn()} onCancel={jest.fn()} />);
      const buttons = screen.getAllByRole("button");
      expect(buttons[0]).toHaveTextContent("Cancel");
      expect(buttons[1]).toHaveTextContent("Save");
    });

    it("should have gap-3 between buttons", () => {
      const { container } = render(
        <FormActions onSubmit={jest.fn()} onCancel={jest.fn()} />
      );
      const buttonWrapper = container.querySelector(".gap-3");
      expect(buttonWrapper).toBeInTheDocument();
    });

    it("should disable both when isSubmitting", () => {
      render(
        <FormActions onSubmit={jest.fn()} onCancel={jest.fn()} isSubmitting />
      );
      const buttons = screen.getAllByRole("button");
      buttons.forEach((btn) => expect(btn).toBeDisabled());
    });
  });

  describe("Position Prop", () => {
    it("should have justify-end by default (right position)", () => {
      const { container } = render(<FormActions />);
      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass("justify-end");
    });

    it("should have justify-start when position is left", () => {
      const { container } = render(<FormActions position="left" />);
      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass("justify-start");
    });

    it("should have justify-end when position is right", () => {
      const { container } = render(<FormActions position="right" />);
      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass("justify-end");
    });

    it("should have justify-between when position is space-between", () => {
      const { container } = render(<FormActions position="space-between" />);
      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass("justify-between");
    });
  });

  describe("Additional Actions", () => {
    it("should render additionalActions", () => {
      render(<FormActions additionalActions={<button>Extra Action</button>} />);
      expect(screen.getByText("Extra Action")).toBeInTheDocument();
    });

    it("should render additionalActions with buttons", () => {
      render(
        <FormActions
          onSubmit={jest.fn()}
          onCancel={jest.fn()}
          additionalActions={<button>Delete</button>}
        />
      );
      expect(screen.getByText("Delete")).toBeInTheDocument();
      expect(screen.getByText("Save")).toBeInTheDocument();
      expect(screen.getByText("Cancel")).toBeInTheDocument();
    });

    it("should position additionalActions on left when position is space-between", () => {
      const { container } = render(
        <FormActions
          position="space-between"
          additionalActions={<button>Delete</button>}
        />
      );
      const leftActions = container.querySelector(".flex.items-center.gap-3");
      expect(leftActions).toHaveTextContent("Delete");
    });

    it("should render additionalActions inline when position is not space-between", () => {
      render(
        <FormActions
          position="right"
          onSubmit={jest.fn()}
          additionalActions={<button>Reset</button>}
        />
      );
      expect(screen.getByText("Reset")).toBeInTheDocument();
      expect(screen.getByText("Save")).toBeInTheDocument();
    });

    it("should handle multiple additional actions", () => {
      render(
        <FormActions
          additionalActions={
            <>
              <button>Delete</button>
              <button>Reset</button>
            </>
          }
        />
      );
      expect(screen.getByText("Delete")).toBeInTheDocument();
      expect(screen.getByText("Reset")).toBeInTheDocument();
    });
  });

  describe("Custom Styling", () => {
    it("should accept custom className", () => {
      const { container } = render(<FormActions className="custom-class" />);
      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass("custom-class");
    });

    it("should merge custom className with base classes", () => {
      const { container } = render(<FormActions className="mt-8" />);
      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass("mt-8", "flex", "p-4");
    });
  });

  describe("Dark Mode Support", () => {
    it("should have dark:border-gray-700", () => {
      const { container } = render(<FormActions />);
      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass("dark:border-gray-700");
    });

    it("should have dark:bg-gray-800", () => {
      const { container } = render(<FormActions />);
      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass("dark:bg-gray-800");
    });
  });

  describe("Form Integration", () => {
    it("should work within a form element", () => {
      const handleSubmit = jest.fn((e) => e.preventDefault());

      render(
        <form onSubmit={handleSubmit}>
          <FormActions onSubmit={handleSubmit} onCancel={jest.fn()} />
        </form>
      );

      const submitBtn = screen.getByRole("button", { name: "Save" });
      fireEvent.click(submitBtn);
      expect(handleSubmit).toHaveBeenCalled();
    });

    it("should prevent form submission when cancel is clicked", () => {
      const handleSubmit = jest.fn();
      const handleCancel = jest.fn();

      render(
        <form onSubmit={handleSubmit}>
          <FormActions onSubmit={handleSubmit} onCancel={handleCancel} />
        </form>
      );

      const cancelBtn = screen.getByRole("button", { name: "Cancel" });
      fireEvent.click(cancelBtn);

      expect(handleCancel).toHaveBeenCalled();
      expect(handleSubmit).not.toHaveBeenCalled();
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty submitLabel", () => {
      render(<FormActions onSubmit={jest.fn()} submitLabel="" />);
      const submitBtn = screen.getByRole("button", { name: "" });
      expect(submitBtn).toBeInTheDocument();
    });

    it("should handle empty cancelLabel", () => {
      render(<FormActions onCancel={jest.fn()} cancelLabel="" />);
      const cancelBtn = screen.getByRole("button", { name: "" });
      expect(cancelBtn).toBeInTheDocument();
    });

    it("should handle very long button labels", () => {
      render(
        <FormActions
          onSubmit={jest.fn()}
          submitLabel="Submit this very long form with detailed information"
        />
      );
      expect(
        screen.getByText("Submit this very long form with detailed information")
      ).toBeInTheDocument();
    });

    it("should handle rapid submit clicks while loading", () => {
      const handleSubmit = jest.fn();
      const { rerender } = render(
        <FormActions onSubmit={handleSubmit} isSubmitting={false} />
      );

      const submitBtn = screen.getByRole("button", { name: "Save" });
      fireEvent.click(submitBtn);

      // Simulate loading state
      rerender(<FormActions onSubmit={handleSubmit} isSubmitting={true} />);

      // Try to click again while loading
      fireEvent.click(screen.getByRole("button", { name: "Loading..." }));

      // Should only be called once
      expect(handleSubmit).toHaveBeenCalledTimes(1);
    });

    it("should handle all props simultaneously", () => {
      expect(() => {
        render(
          <FormActions
            onSubmit={jest.fn()}
            onCancel={jest.fn()}
            submitLabel="Create Account"
            cancelLabel="Go Back"
            isSubmitting={false}
            submitDisabled={false}
            cancelDisabled={false}
            showCancel={true}
            submitVariant="primary"
            className="custom-actions"
            position="space-between"
            additionalActions={<button>Reset</button>}
          />
        );
      }).not.toThrow();
    });
  });

  describe("Accessibility", () => {
    it("should have proper button types", () => {
      render(<FormActions onSubmit={jest.fn()} onCancel={jest.fn()} />);

      const submitBtn = screen.getByRole("button", { name: "Save" });
      const cancelBtn = screen.getByRole("button", { name: "Cancel" });

      expect(submitBtn).toHaveAttribute("type", "submit");
      expect(cancelBtn).toHaveAttribute("type", "button");
    });

    it("should be keyboard navigable", () => {
      render(<FormActions onSubmit={jest.fn()} onCancel={jest.fn()} />);

      const buttons = screen.getAllByRole("button");
      buttons[0].focus();
      expect(buttons[0]).toHaveFocus();
    });

    it("should maintain disabled state for screen readers", () => {
      render(<FormActions onSubmit={jest.fn()} submitDisabled />);
      const submitBtn = screen.getByRole("button", { name: "Save" });
      expect(submitBtn).toBeDisabled();
    });
  });

  describe("Performance", () => {
    it("should render without crashing with minimal props", () => {
      expect(() => {
        render(<FormActions />);
      }).not.toThrow();
    });

    it("should render without crashing with all props", () => {
      expect(() => {
        render(
          <FormActions
            onCancel={jest.fn()}
            onSubmit={jest.fn()}
            submitLabel="Submit"
            cancelLabel="Cancel"
            isSubmitting={false}
            submitDisabled={false}
            cancelDisabled={false}
            showCancel={true}
            submitVariant="primary"
            className="custom"
            position="right"
            additionalActions={<button>Extra</button>}
          />
        );
      }).not.toThrow();
    });

    it("should handle multiple rapid re-renders", () => {
      const { rerender } = render(<FormActions onSubmit={jest.fn()} />);

      for (let i = 0; i < 10; i++) {
        rerender(
          <FormActions onSubmit={jest.fn()} isSubmitting={i % 2 === 0} />
        );
      }

      expect(screen.getByRole("button")).toBeInTheDocument();
    });
  });
});
