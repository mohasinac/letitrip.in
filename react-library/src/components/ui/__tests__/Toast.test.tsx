

import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  setGlobalToastHandler,
  toast,
  ToastContainer,
  ToastProvider,
  useToast,
} from "../Toast";

// Test component that uses toast
function TestComponent() {
  const toast = useToast();

  return (
    <div>
      <button onClick={() => toast.success("Success message")}>
        Show Success
      </button>
      <button onClick={() => toast.error("Error message")}>Show Error</button>
      <button onClick={() => toast.warning("Warning message")}>
        Show Warning
      </button>
      <button onClick={() => toast.info("Info message")}>Show Info</button>
      <button
        onClick={() =>
          toast.showToast({ message: "Custom", variant: "info", duration: 0 })
        }
      >
        Show Persistent
      </button>
      <button onClick={() => toast.dismissAll()}>Dismiss All</button>
    </div>
  );
}

describe("Toast", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  describe("ToastProvider and useToast", () => {
    it("should throw error when useToast is used outside provider", () => {
      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, "error").mockImplementation();

      expect(() => {
        render(<TestComponent />);
      }).toThrow("useToast must be used within ToastProvider");

      consoleSpy.mockRestore();
    });

    it("should render toast provider with children", () => {
      render(
        <ToastProvider>
          <div>Test Content</div>
        </ToastProvider>
      );

      expect(screen.getByText("Test Content")).toBeInTheDocument();
    });
  });

  describe("Toast variants", () => {
    it("should show success toast", async () => {
      const user = userEvent.setup({ delay: null });

      render(
        <ToastProvider>
          <TestComponent />
          <ToastContainer />
        </ToastProvider>
      );

      await user.click(screen.getByText("Show Success"));

      expect(screen.getByText("Success message")).toBeInTheDocument();
      expect(screen.getByRole("alert")).toHaveClass("bg-green-50");
    });

    it("should show error toast", async () => {
      const user = userEvent.setup({ delay: null });

      render(
        <ToastProvider>
          <TestComponent />
          <ToastContainer />
        </ToastProvider>
      );

      await user.click(screen.getByText("Show Error"));

      expect(screen.getByText("Error message")).toBeInTheDocument();
      expect(screen.getByRole("alert")).toHaveClass("bg-red-50");
    });

    it("should show warning toast", async () => {
      const user = userEvent.setup({ delay: null });

      render(
        <ToastProvider>
          <TestComponent />
          <ToastContainer />
        </ToastProvider>
      );

      await user.click(screen.getByText("Show Warning"));

      expect(screen.getByText("Warning message")).toBeInTheDocument();
      expect(screen.getByRole("alert")).toHaveClass("bg-yellow-50");
    });

    it("should show info toast", async () => {
      const user = userEvent.setup({ delay: null });

      render(
        <ToastProvider>
          <TestComponent />
          <ToastContainer />
        </ToastProvider>
      );

      await user.click(screen.getByText("Show Info"));

      expect(screen.getByText("Info message")).toBeInTheDocument();
      expect(screen.getByRole("alert")).toHaveClass("bg-blue-50");
    });
  });

  describe("Toast auto-dismiss", () => {
    it("should auto-dismiss toast after default duration", async () => {
      const user = userEvent.setup({ delay: null });

      render(
        <ToastProvider>
          <TestComponent />
          <ToastContainer />
        </ToastProvider>
      );

      await user.click(screen.getByText("Show Success"));

      expect(screen.getByText("Success message")).toBeInTheDocument();

      // Fast-forward time
      act(() => {
        vi.advanceTimersByTime(5000);
      });

      await waitFor(() => {
        expect(screen.queryByText("Success message")).not.toBeInTheDocument();
      });
    });

    it("should not auto-dismiss toast with duration 0", async () => {
      const user = userEvent.setup({ delay: null });

      render(
        <ToastProvider>
          <TestComponent />
          <ToastContainer />
        </ToastProvider>
      );

      await user.click(screen.getByText("Show Persistent"));

      expect(screen.getByText("Custom")).toBeInTheDocument();

      // Fast-forward time
      act(() => {
        vi.advanceTimersByTime(10000);
      });

      // Should still be there
      expect(screen.getByText("Custom")).toBeInTheDocument();
    });

    it("should use custom duration", async () => {
      const user = userEvent.setup({ delay: null });

      function CustomDurationComponent() {
        const toast = useToast();
        return (
          <button onClick={() => toast.success("Quick message", 1000)}>
            Show Quick
          </button>
        );
      }

      render(
        <ToastProvider>
          <CustomDurationComponent />
          <ToastContainer />
        </ToastProvider>
      );

      await user.click(screen.getByText("Show Quick"));

      expect(screen.getByText("Quick message")).toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(screen.queryByText("Quick message")).not.toBeInTheDocument();
      });
    });
  });

  describe("Toast dismissal", () => {
    it("should dismiss toast when close button clicked", async () => {
      const user = userEvent.setup({ delay: null });

      render(
        <ToastProvider>
          <TestComponent />
          <ToastContainer />
        </ToastProvider>
      );

      await user.click(screen.getByText("Show Success"));

      expect(screen.getByText("Success message")).toBeInTheDocument();

      const dismissButton = screen.getByLabelText("Dismiss notification");
      await user.click(dismissButton);

      // Wait for exit animation
      act(() => {
        vi.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(screen.queryByText("Success message")).not.toBeInTheDocument();
      });
    });

    it("should dismiss all toasts", async () => {
      const user = userEvent.setup({ delay: null });

      render(
        <ToastProvider>
          <TestComponent />
          <ToastContainer />
        </ToastProvider>
      );

      await user.click(screen.getByText("Show Success"));
      await user.click(screen.getByText("Show Error"));
      await user.click(screen.getByText("Show Warning"));

      expect(screen.getByText("Success message")).toBeInTheDocument();
      expect(screen.getByText("Error message")).toBeInTheDocument();
      expect(screen.getByText("Warning message")).toBeInTheDocument();

      await user.click(screen.getByText("Dismiss All"));

      expect(screen.queryByText("Success message")).not.toBeInTheDocument();
      expect(screen.queryByText("Error message")).not.toBeInTheDocument();
      expect(screen.queryByText("Warning message")).not.toBeInTheDocument();
    });
  });

  describe("Toast action button", () => {
    it("should render and handle action button", async () => {
      const user = userEvent.setup({ delay: null });
      const actionFn = vi.fn();

      function ActionComponent() {
        const toast = useToast();
        return (
          <button
            onClick={() =>
              toast.showToast({
                message: "Action message",
                variant: "info",
                action: {
                  label: "Undo",
                  onClick: actionFn,
                },
              })
            }
          >
            Show Action
          </button>
        );
      }

      render(
        <ToastProvider>
          <ActionComponent />
          <ToastContainer />
        </ToastProvider>
      );

      await user.click(screen.getByText("Show Action"));

      expect(screen.getByText("Action message")).toBeInTheDocument();
      expect(screen.getByText("Undo")).toBeInTheDocument();

      await user.click(screen.getByText("Undo"));

      expect(actionFn).toHaveBeenCalledTimes(1);
    });
  });

  describe("Toast max limit", () => {
    it("should respect maxToasts limit", async () => {
      const user = userEvent.setup({ delay: null });

      function MultiToastComponent() {
        const toast = useToast();
        return (
          <button
            onClick={() => {
              for (let i = 0; i < 10; i++) {
                toast.info(`Toast ${i + 1}`);
              }
            }}
          >
            Show Many
          </button>
        );
      }

      render(
        <ToastProvider maxToasts={3}>
          <MultiToastComponent />
          <ToastContainer />
        </ToastProvider>
      );

      await user.click(screen.getByText("Show Many"));

      // Should only show last 3
      expect(screen.queryByText("Toast 1")).not.toBeInTheDocument();
      expect(screen.queryByText("Toast 7")).not.toBeInTheDocument();
      expect(screen.getByText("Toast 8")).toBeInTheDocument();
      expect(screen.getByText("Toast 9")).toBeInTheDocument();
      expect(screen.getByText("Toast 10")).toBeInTheDocument();
    });
  });

  describe("Toast positioning", () => {
    it("should render at top-right by default", () => {
      render(
        <ToastProvider>
          <ToastContainer />
        </ToastProvider>
      );

      const container = document.querySelector(".top-4.right-4");
      expect(container).toBeInTheDocument();
    });

    it("should render at custom position", () => {
      render(
        <ToastProvider>
          <ToastContainer position="bottom-left" />
        </ToastProvider>
      );

      const container = document.querySelector(".bottom-4.left-4");
      expect(container).toBeInTheDocument();
    });

    it("should render at top-center", () => {
      render(
        <ToastProvider>
          <ToastContainer position="top-center" />
        </ToastProvider>
      );

      const container = document.querySelector(".top-4.left-1\\/2");
      expect(container).toBeInTheDocument();
    });
  });

  describe("Custom icons", () => {
    it("should use custom icons", async () => {
      const user = userEvent.setup({ delay: null });

      const customIcons = {
        success: <span data-testid="custom-success-icon">✓</span>,
        error: <span data-testid="custom-error-icon">✗</span>,
        warning: <span data-testid="custom-warning-icon">!</span>,
        info: <span data-testid="custom-info-icon">i</span>,
      };

      render(
        <ToastProvider>
          <TestComponent />
          <ToastContainer icons={customIcons} />
        </ToastProvider>
      );

      await user.click(screen.getByText("Show Success"));

      expect(screen.getByTestId("custom-success-icon")).toBeInTheDocument();
    });
  });

  describe("Global toast API", () => {
    it("should work with global toast API", () => {
      const mockHandler = vi.fn();
      setGlobalToastHandler(mockHandler);

      toast.success("Global success");
      toast.error("Global error");
      toast.warning("Global warning");
      toast.info("Global info");

      expect(mockHandler).toHaveBeenCalledTimes(4);
      expect(mockHandler).toHaveBeenCalledWith({
        message: "Global success",
        variant: "success",
        duration: undefined,
      });
    });

    it("should clear global handler on null", () => {
      const mockHandler = vi.fn();
      setGlobalToastHandler(mockHandler);
      setGlobalToastHandler(null);

      toast.success("Should not call handler");

      expect(mockHandler).not.toHaveBeenCalled();
    });
  });

  describe("Dark mode", () => {
    it("should have dark mode classes", async () => {
      const user = userEvent.setup({ delay: null });

      render(
        <ToastProvider>
          <TestComponent />
          <ToastContainer />
        </ToastProvider>
      );

      await user.click(screen.getByText("Show Success"));

      const toast = screen.getByRole("alert");
      expect(toast).toHaveClass("dark:bg-green-900/30");
      expect(toast).toHaveClass("dark:border-green-800");
      expect(toast).toHaveClass("dark:text-green-200");
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA attributes", async () => {
      const user = userEvent.setup({ delay: null });

      render(
        <ToastProvider>
          <TestComponent />
          <ToastContainer />
        </ToastProvider>
      );

      await user.click(screen.getByText("Show Success"));

      const toast = screen.getByRole("alert");
      expect(toast).toHaveAttribute("aria-live", "polite");
    });

    it("should have dismiss button with label", async () => {
      const user = userEvent.setup({ delay: null });

      render(
        <ToastProvider>
          <TestComponent />
          <ToastContainer />
        </ToastProvider>
      );

      await user.click(screen.getByText("Show Success"));

      const dismissButton = screen.getByLabelText("Dismiss notification");
      expect(dismissButton).toBeInTheDocument();
    });
  });

  describe("Multiple toasts", () => {
    it("should show multiple toasts stacked", async () => {
      const user = userEvent.setup({ delay: null });

      render(
        <ToastProvider>
          <TestComponent />
          <ToastContainer />
        </ToastProvider>
      );

      await user.click(screen.getByText("Show Success"));
      await user.click(screen.getByText("Show Error"));
      await user.click(screen.getByText("Show Info"));

      expect(screen.getByText("Success message")).toBeInTheDocument();
      expect(screen.getByText("Error message")).toBeInTheDocument();
      expect(screen.getByText("Info message")).toBeInTheDocument();
    });

    it("should dismiss toasts independently", async () => {
      const user = userEvent.setup({ delay: null });

      render(
        <ToastProvider>
          <TestComponent />
          <ToastContainer />
        </ToastProvider>
      );

      await user.click(screen.getByText("Show Success"));
      await user.click(screen.getByText("Show Error"));

      const dismissButtons = screen.getAllByLabelText("Dismiss notification");
      await user.click(dismissButtons[0]);

      act(() => {
        vi.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(screen.queryByText("Success message")).not.toBeInTheDocument();
      });
      expect(screen.getByText("Error message")).toBeInTheDocument();
    });
  });
});
