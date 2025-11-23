import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ToggleSwitch } from "./ToggleSwitch";

describe("ToggleSwitch Component", () => {
  describe("Basic Rendering", () => {
    it("renders the toggle switch button", () => {
      render(<ToggleSwitch enabled={false} onToggle={jest.fn()} />);
      const button = screen.getByRole("button", { pressed: false });
      expect(button).toBeInTheDocument();
    });

    it("renders with enabled state", () => {
      render(<ToggleSwitch enabled={true} onToggle={jest.fn()} />);
      const button = screen.getByRole("button", { pressed: true });
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass("bg-blue-600");
    });

    it("renders with disabled state", () => {
      render(<ToggleSwitch enabled={false} onToggle={jest.fn()} />);
      const button = screen.getByRole("button", { pressed: false });
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass("bg-gray-200");
    });
  });

  describe("Sizes", () => {
    it("renders with small size", () => {
      render(<ToggleSwitch enabled={false} onToggle={jest.fn()} size="sm" />);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("h-5", "w-9");
    });

    it("renders with medium size (default)", () => {
      render(<ToggleSwitch enabled={false} onToggle={jest.fn()} size="md" />);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("h-6", "w-11");
    });

    it("renders with large size", () => {
      render(<ToggleSwitch enabled={false} onToggle={jest.fn()} size="lg" />);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("h-7", "w-14");
    });

    it("defaults to medium size when size prop is omitted", () => {
      render(<ToggleSwitch enabled={false} onToggle={jest.fn()} />);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("h-6", "w-11");
    });
  });

  describe("Toggle Interaction", () => {
    it("calls onToggle when clicked", async () => {
      const onToggle = jest.fn();
      const user = userEvent.setup();
      render(<ToggleSwitch enabled={false} onToggle={onToggle} />);

      const button = screen.getByRole("button");
      await user.click(button);

      expect(onToggle).toHaveBeenCalledTimes(1);
    });

    it("calls onToggle when enabled state is true", async () => {
      const onToggle = jest.fn();
      const user = userEvent.setup();
      render(<ToggleSwitch enabled={true} onToggle={onToggle} />);

      const button = screen.getByRole("button", { pressed: true });
      await user.click(button);

      expect(onToggle).toHaveBeenCalledTimes(1);
    });

    it("does not call onToggle when disabled", async () => {
      const onToggle = jest.fn();
      const user = userEvent.setup();
      render(<ToggleSwitch enabled={false} onToggle={onToggle} disabled />);

      const button = screen.getByRole("button");
      await user.click(button);

      expect(onToggle).not.toHaveBeenCalled();
    });
  });

  describe("Disabled State", () => {
    it("applies disabled styling when disabled", () => {
      render(<ToggleSwitch enabled={false} onToggle={jest.fn()} disabled />);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("opacity-50", "cursor-not-allowed");
    });

    it("has disabled attribute when disabled", () => {
      render(<ToggleSwitch enabled={false} onToggle={jest.fn()} disabled />);
      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
    });

    it("does not have disabled attribute when not disabled", () => {
      render(<ToggleSwitch enabled={false} onToggle={jest.fn()} />);
      const button = screen.getByRole("button");
      expect(button).not.toBeDisabled();
    });
  });

  describe("Label and Description", () => {
    it("renders with label only", () => {
      render(
        <ToggleSwitch
          enabled={false}
          onToggle={jest.fn()}
          label="Enable notifications"
        />
      );
      expect(screen.getByText("Enable notifications")).toBeInTheDocument();
    });

    it("renders with label and description", () => {
      render(
        <ToggleSwitch
          enabled={false}
          onToggle={jest.fn()}
          label="Enable notifications"
          description="Receive email updates"
        />
      );
      expect(screen.getByText("Enable notifications")).toBeInTheDocument();
      expect(screen.getByText("Receive email updates")).toBeInTheDocument();
    });

    it("renders with description only", () => {
      render(
        <ToggleSwitch
          enabled={false}
          onToggle={jest.fn()}
          description="Receive email updates"
        />
      );
      expect(screen.getByText("Receive email updates")).toBeInTheDocument();
    });

    it("renders without label and description", () => {
      const { container } = render(
        <ToggleSwitch enabled={false} onToggle={jest.fn()} />
      );
      // Only button should exist, no label/description wrapper
      expect(container.querySelector("label")).not.toBeInTheDocument();
      expect(container.querySelector(".flex-1")).not.toBeInTheDocument();
    });

    it("applies font-medium to label", () => {
      render(
        <ToggleSwitch enabled={false} onToggle={jest.fn()} label="Test Label" />
      );
      const label = screen.getByText("Test Label");
      expect(label).toHaveClass("font-medium");
    });

    it("applies text-gray-500 to description", () => {
      render(
        <ToggleSwitch
          enabled={false}
          onToggle={jest.fn()}
          description="Test Description"
        />
      );
      const description = screen.getByText("Test Description");
      expect(description).toHaveClass("text-gray-500");
    });
  });

  describe("Circle Translation", () => {
    it("translates circle to left when disabled (sm)", () => {
      const { container } = render(
        <ToggleSwitch enabled={false} onToggle={jest.fn()} size="sm" />
      );
      const circle = container.querySelector("span");
      expect(circle).toHaveClass("translate-x-1");
    });

    it("translates circle to right when enabled (sm)", () => {
      const { container } = render(
        <ToggleSwitch enabled={true} onToggle={jest.fn()} size="sm" />
      );
      const circle = container.querySelector("span");
      expect(circle).toHaveClass("translate-x-5");
    });

    it("translates circle to left when disabled (md)", () => {
      const { container } = render(
        <ToggleSwitch enabled={false} onToggle={jest.fn()} size="md" />
      );
      const circle = container.querySelector("span");
      expect(circle).toHaveClass("translate-x-1");
    });

    it("translates circle to right when enabled (md)", () => {
      const { container } = render(
        <ToggleSwitch enabled={true} onToggle={jest.fn()} size="md" />
      );
      const circle = container.querySelector("span");
      expect(circle).toHaveClass("translate-x-6");
    });

    it("translates circle to left when disabled (lg)", () => {
      const { container } = render(
        <ToggleSwitch enabled={false} onToggle={jest.fn()} size="lg" />
      );
      const circle = container.querySelector("span");
      expect(circle).toHaveClass("translate-x-1");
    });

    it("translates circle to right when enabled (lg)", () => {
      const { container } = render(
        <ToggleSwitch enabled={true} onToggle={jest.fn()} size="lg" />
      );
      const circle = container.querySelector("span");
      expect(circle).toHaveClass("translate-x-8");
    });
  });

  describe("Accessibility", () => {
    it("has aria-pressed attribute with correct value", () => {
      const { rerender } = render(
        <ToggleSwitch enabled={false} onToggle={jest.fn()} />
      );
      let button = screen.getByRole("button", { pressed: false });
      expect(button).toHaveAttribute("aria-pressed", "false");

      rerender(<ToggleSwitch enabled={true} onToggle={jest.fn()} />);
      button = screen.getByRole("button", { pressed: true });
      expect(button).toHaveAttribute("aria-pressed", "true");
    });

    it("is keyboard accessible", async () => {
      const onToggle = jest.fn();
      const user = userEvent.setup();
      render(<ToggleSwitch enabled={false} onToggle={onToggle} />);

      const button = screen.getByRole("button");
      button.focus();
      expect(button).toHaveFocus();

      await user.keyboard("{Enter}");
      expect(onToggle).toHaveBeenCalledTimes(1);
    });

    it("can be toggled with Space key", async () => {
      const onToggle = jest.fn();
      const user = userEvent.setup();
      render(<ToggleSwitch enabled={false} onToggle={onToggle} />);

      const button = screen.getByRole("button");
      button.focus();

      await user.keyboard(" ");
      expect(onToggle).toHaveBeenCalledTimes(1);
    });
  });

  describe("Styling", () => {
    it("applies correct background color when enabled", () => {
      render(<ToggleSwitch enabled={true} onToggle={jest.fn()} />);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("bg-blue-600");
    });

    it("applies correct background color when disabled", () => {
      render(<ToggleSwitch enabled={false} onToggle={jest.fn()} />);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("bg-gray-200");
    });

    it("applies cursor-pointer when not disabled", () => {
      render(<ToggleSwitch enabled={false} onToggle={jest.fn()} />);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("cursor-pointer");
    });

    it("applies rounded-full to container", () => {
      render(<ToggleSwitch enabled={false} onToggle={jest.fn()} />);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("rounded-full");
    });

    it("applies rounded-full to circle", () => {
      const { container } = render(
        <ToggleSwitch enabled={false} onToggle={jest.fn()} />
      );
      const circle = container.querySelector("span");
      expect(circle).toHaveClass("rounded-full", "bg-white");
    });

    it("applies transition classes", () => {
      render(<ToggleSwitch enabled={false} onToggle={jest.fn()} />);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("transition-colors");
    });
  });

  describe("Edge Cases", () => {
    it("handles rapid clicking", async () => {
      const onToggle = jest.fn();
      const user = userEvent.setup();
      render(<ToggleSwitch enabled={false} onToggle={onToggle} />);

      const button = screen.getByRole("button");
      await user.click(button);
      await user.click(button);
      await user.click(button);

      expect(onToggle).toHaveBeenCalledTimes(3);
    });

    it("handles long label text", () => {
      const longLabel = "A".repeat(100);
      render(
        <ToggleSwitch enabled={false} onToggle={jest.fn()} label={longLabel} />
      );
      expect(screen.getByText(longLabel)).toBeInTheDocument();
    });

    it("handles long description text", () => {
      const longDescription = "B".repeat(200);
      render(
        <ToggleSwitch
          enabled={false}
          onToggle={jest.fn()}
          description={longDescription}
        />
      );
      expect(screen.getByText(longDescription)).toBeInTheDocument();
    });

    it("handles special characters in label", () => {
      render(
        <ToggleSwitch
          enabled={false}
          onToggle={jest.fn()}
          label="Enable <notifications> & alerts!"
        />
      );
      expect(
        screen.getByText("Enable <notifications> & alerts!")
      ).toBeInTheDocument();
    });

    it("works with all combinations of props", () => {
      render(
        <ToggleSwitch
          enabled={true}
          onToggle={jest.fn()}
          disabled={true}
          size="lg"
          label="Test Label"
          description="Test Description"
        />
      );
      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
      expect(button).toBeDisabled();
      expect(button).toHaveClass("bg-blue-600", "h-7", "w-14");
      expect(screen.getByText("Test Label")).toBeInTheDocument();
      expect(screen.getByText("Test Description")).toBeInTheDocument();
    });
  });
});
