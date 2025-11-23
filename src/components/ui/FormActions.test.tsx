import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { FormActions } from "./FormActions";

describe("FormActions", () => {
  describe("Basic Rendering", () => {
    it("renders form actions container", () => {
      const { container } = render(<FormActions />);
      expect(container.firstChild).toHaveClass("flex", "items-center", "gap-3");
    });

    it("renders submit button when onSubmit provided", () => {
      render(<FormActions onSubmit={() => {}} />);
      expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
    });

    it("renders cancel button when onCancel provided", () => {
      render(<FormActions onCancel={() => {}} />);
      expect(
        screen.getByRole("button", { name: "Cancel" })
      ).toBeInTheDocument();
    });

    it("renders both buttons when both handlers provided", () => {
      render(<FormActions onSubmit={() => {}} onCancel={() => {}} />);
      expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Cancel" })
      ).toBeInTheDocument();
    });
  });

  describe("Button Labels", () => {
    it("uses default submit label", () => {
      render(<FormActions onSubmit={() => {}} />);
      expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
    });

    it("uses custom submit label", () => {
      render(<FormActions onSubmit={() => {}} submitLabel="Create" />);
      expect(
        screen.getByRole("button", { name: "Create" })
      ).toBeInTheDocument();
    });

    it("uses default cancel label", () => {
      render(<FormActions onCancel={() => {}} />);
      expect(
        screen.getByRole("button", { name: "Cancel" })
      ).toBeInTheDocument();
    });

    it("uses custom cancel label", () => {
      render(<FormActions onCancel={() => {}} cancelLabel="Back" />);
      expect(screen.getByRole("button", { name: "Back" })).toBeInTheDocument();
    });
  });

  describe("Button Actions", () => {
    it("calls onSubmit when submit button clicked", () => {
      const onSubmit = jest.fn();
      render(<FormActions onSubmit={onSubmit} />);

      fireEvent.click(screen.getByRole("button", { name: "Save" }));
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    it("calls onCancel when cancel button clicked", () => {
      const onCancel = jest.fn();
      render(<FormActions onCancel={onCancel} />);

      fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
      expect(onCancel).toHaveBeenCalledTimes(1);
    });
  });

  describe("Submit Button", () => {
    it("has submit type", () => {
      render(<FormActions onSubmit={() => {}} />);
      expect(screen.getByRole("button", { name: "Save" })).toHaveAttribute(
        "type",
        "submit"
      );
    });

    it("uses primary variant by default", () => {
      render(<FormActions onSubmit={() => {}} />);
      const button = screen.getByRole("button", { name: "Save" });
      expect(button).toHaveClass("bg-blue-600");
    });

    it("uses custom variant", () => {
      render(<FormActions onSubmit={() => {}} submitVariant="danger" />);
      const button = screen.getByRole("button", { name: "Save" });
      expect(button).toHaveClass("bg-red-600");
    });

    it("is disabled when submitDisabled is true", () => {
      render(<FormActions onSubmit={() => {}} submitDisabled />);
      expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
    });

    it("is disabled when isSubmitting is true", () => {
      render(<FormActions onSubmit={() => {}} isSubmitting />);
      expect(screen.getByRole("button", { name: /Save/ })).toBeDisabled();
    });

    it("shows loading state when isSubmitting", () => {
      render(<FormActions onSubmit={() => {}} isSubmitting />);
      const button = screen.getByRole("button", { name: /Save/ });
      expect(button).toHaveAttribute("aria-busy", "true");
    });
  });

  describe("Cancel Button", () => {
    it("has button type", () => {
      render(<FormActions onCancel={() => {}} />);
      expect(screen.getByRole("button", { name: "Cancel" })).toHaveAttribute(
        "type",
        "button"
      );
    });

    it("uses outline variant", () => {
      render(<FormActions onCancel={() => {}} />);
      const button = screen.getByRole("button", { name: "Cancel" });
      expect(button).toHaveClass("border-gray-300", "bg-transparent");
    });

    it("is disabled when cancelDisabled is true", () => {
      render(<FormActions onCancel={() => {}} cancelDisabled />);
      expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();
    });

    it("is disabled when isSubmitting is true", () => {
      render(<FormActions onCancel={() => {}} isSubmitting />);
      expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();
    });

    it("can be hidden with showCancel false", () => {
      render(<FormActions onCancel={() => {}} showCancel={false} />);
      expect(
        screen.queryByRole("button", { name: "Cancel" })
      ).not.toBeInTheDocument();
    });

    it("is hidden when onCancel is not provided", () => {
      render(<FormActions onSubmit={() => {}} />);
      expect(
        screen.queryByRole("button", { name: "Cancel" })
      ).not.toBeInTheDocument();
    });
  });

  describe("Position", () => {
    it("aligns to right by default", () => {
      const { container } = render(<FormActions onSubmit={() => {}} />);
      expect(container.firstChild).toHaveClass("justify-end");
    });

    it("can align to left", () => {
      const { container } = render(
        <FormActions onSubmit={() => {}} position="left" />
      );
      expect(container.firstChild).toHaveClass("justify-start");
    });

    it("can use space-between", () => {
      const { container } = render(
        <FormActions onSubmit={() => {}} position="space-between" />
      );
      expect(container.firstChild).toHaveClass("justify-between");
    });
  });

  describe("Additional Actions", () => {
    it("renders additional actions", () => {
      render(
        <FormActions
          onSubmit={() => {}}
          additionalActions={<button>Delete</button>}
        />
      );
      expect(
        screen.getByRole("button", { name: "Delete" })
      ).toBeInTheDocument();
    });

    it("renders additional actions in left container with space-between", () => {
      const { container } = render(
        <FormActions
          onSubmit={() => {}}
          position="space-between"
          additionalActions={<button>Extra</button>}
        />
      );

      expect(screen.getByRole("button", { name: "Extra" })).toBeInTheDocument();
      const wrapper = container.querySelector(
        ".flex.items-center.gap-3:first-child"
      );
      expect(wrapper).toBeInTheDocument();
    });

    it("renders additional actions inline without space-between", () => {
      render(
        <FormActions
          onSubmit={() => {}}
          onCancel={() => {}}
          position="right"
          additionalActions={<button>Help</button>}
        />
      );

      const buttons = screen.getAllByRole("button");
      expect(buttons).toHaveLength(3);
      expect(screen.getByRole("button", { name: "Help" })).toBeInTheDocument();
    });

    it("renders multiple additional actions", () => {
      render(
        <FormActions
          onSubmit={() => {}}
          additionalActions={
            <>
              <button>Action 1</button>
              <button>Action 2</button>
            </>
          }
        />
      );

      expect(
        screen.getByRole("button", { name: "Action 1" })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Action 2" })
      ).toBeInTheDocument();
    });
  });

  describe("Styling", () => {
    it("applies base styling", () => {
      const { container } = render(<FormActions />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass(
        "rounded-lg",
        "border",
        "border-gray-200",
        "bg-gray-50",
        "p-4"
      );
    });

    it("applies custom className", () => {
      const { container } = render(<FormActions className="custom-class" />);
      expect(container.firstChild).toHaveClass("custom-class");
    });

    it("preserves base classes with custom className", () => {
      const { container } = render(<FormActions className="mt-8" />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass("flex", "items-center", "mt-8");
    });
  });

  describe("Integration", () => {
    it("renders complete form actions with all features", () => {
      const onSubmit = jest.fn();
      const onCancel = jest.fn();

      render(
        <FormActions
          onSubmit={onSubmit}
          onCancel={onCancel}
          submitLabel="Update"
          cancelLabel="Discard"
          position="space-between"
          additionalActions={<button>Preview</button>}
        />
      );

      expect(
        screen.getByRole("button", { name: "Update" })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Discard" })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Preview" })
      ).toBeInTheDocument();
    });

    it("handles form submission flow", () => {
      const onSubmit = jest.fn();
      const { rerender } = render(<FormActions onSubmit={onSubmit} />);

      // Click submit
      fireEvent.click(screen.getByRole("button", { name: "Save" }));
      expect(onSubmit).toHaveBeenCalled();

      // Show submitting state
      rerender(<FormActions onSubmit={onSubmit} isSubmitting />);
      expect(screen.getByRole("button", { name: /Save/ })).toBeDisabled();
    });
  });

  describe("Edge Cases", () => {
    it("renders without any handlers", () => {
      const { container } = render(<FormActions />);
      expect(container.firstChild).toBeInTheDocument();
      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });

    it("handles empty submit label", () => {
      render(<FormActions onSubmit={() => {}} submitLabel="" />);
      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
      expect(button.textContent).toBe("");
    });

    it("handles empty cancel label", () => {
      render(<FormActions onCancel={() => {}} cancelLabel="" />);
      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
      expect(button.textContent).toBe("");
    });

    it("handles both disabled states simultaneously", () => {
      render(
        <FormActions
          onSubmit={() => {}}
          onCancel={() => {}}
          submitDisabled
          cancelDisabled
        />
      );

      expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
      expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();
    });

    it("handles submitting state for both buttons", () => {
      render(
        <FormActions onSubmit={() => {}} onCancel={() => {}} isSubmitting />
      );

      expect(screen.getByRole("button", { name: /Save/ })).toBeDisabled();
      expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();
    });

    it("does not call handlers when disabled", () => {
      const onSubmit = jest.fn();
      const onCancel = jest.fn();

      render(
        <FormActions onSubmit={onSubmit} onCancel={onCancel} isSubmitting />
      );

      fireEvent.click(screen.getByRole("button", { name: /Save/ }));
      fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

      expect(onSubmit).not.toHaveBeenCalled();
      expect(onCancel).not.toHaveBeenCalled();
    });
  });
});
