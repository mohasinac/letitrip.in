/**
 * Toast Component - Comprehensive Tests
 * Tests toast notifications, toast container, and all toast types
 */

import "@testing-library/jest-dom";
import { act, render, screen, waitFor } from "@testing-library/react";
import { toast, ToastContainer } from "../Toast";

describe("Toast System", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    // Clear all toasts before each test
    (toast as any).__clearAll();
  });

  afterEach(async () => {
    await act(async () => {
      jest.runOnlyPendingTimers();
      // Flush all pending promises
      await Promise.resolve();
    });
    jest.useRealTimers();
  });

  describe("ToastContainer", () => {
    it("should render nothing when no toasts", () => {
      const { container } = render(<ToastContainer />);
      expect(container.firstChild).toBeNull();
    });

    it("should render success toast", () => {
      render(<ToastContainer />);
      act(() => {
        toast.success("Operation successful");
      });
      expect(screen.getByText("Operation successful")).toBeInTheDocument();
    });

    it("should render error toast", () => {
      render(<ToastContainer />);
      act(() => {
        toast.error("Operation failed");
      });
      expect(screen.getByText("Operation failed")).toBeInTheDocument();
    });

    it("should render info toast", () => {
      render(<ToastContainer />);
      act(() => {
        toast.info("Information message");
      });
      expect(screen.getByText("Information message")).toBeInTheDocument();
    });

    it("should render warning toast", () => {
      render(<ToastContainer />);
      act(() => {
        toast.warning("Warning message");
      });
      expect(screen.getByText("Warning message")).toBeInTheDocument();
    });

    it("should render multiple toasts", () => {
      render(<ToastContainer />);
      act(() => {
        toast.success("First");
        toast.error("Second");
        toast.info("Third");
      });
      expect(screen.getByText("First")).toBeInTheDocument();
      expect(screen.getByText("Second")).toBeInTheDocument();
      expect(screen.getByText("Third")).toBeInTheDocument();
    });

    it("should auto-dismiss toast after duration", async () => {
      render(<ToastContainer />);
      act(() => {
        toast.success("Auto dismiss", 1000);
      });

      expect(screen.getByText("Auto dismiss")).toBeInTheDocument();

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(screen.queryByText("Auto dismiss")).not.toBeInTheDocument();
      });
    });

    it("should use default duration of 5000ms", async () => {
      render(<ToastContainer />);
      act(() => {
        toast.success("Default duration");
      });

      expect(screen.getByText("Default duration")).toBeInTheDocument();

      act(() => {
        jest.advanceTimersByTime(4999);
      });

      expect(screen.getByText("Default duration")).toBeInTheDocument();

      act(() => {
        jest.advanceTimersByTime(1);
      });

      await waitFor(() => {
        expect(screen.queryByText("Default duration")).not.toBeInTheDocument();
      });
    });

    it("should not auto-dismiss when duration is 0", () => {
      render(<ToastContainer />);
      act(() => {
        toast.success("Permanent", 0);
      });

      expect(screen.getByText("Permanent")).toBeInTheDocument();

      act(() => {
        jest.advanceTimersByTime(10000);
      });

      expect(screen.getByText("Permanent")).toBeInTheDocument();
    });

    it("should handle custom duration", async () => {
      render(<ToastContainer />);
      act(() => {
        toast.success("Custom", 2000);
      });

      act(() => {
        jest.advanceTimersByTime(2000);
      });

      await waitFor(() => {
        expect(screen.queryByText("Custom")).not.toBeInTheDocument();
      });
    });
  });

  describe("Toast Messages", () => {
    it("should handle empty message", () => {
      render(<ToastContainer />);
      act(() => {
        toast.success("");
      });
      expect(screen.getByText("")).toBeInTheDocument();
    });

    it("should handle long message", () => {
      const longMessage = "A".repeat(500);
      render(<ToastContainer />);
      act(() => {
        toast.success(longMessage);
      });
      expect(screen.getByText(longMessage)).toBeInTheDocument();
    });

    it("should handle special characters", () => {
      render(<ToastContainer />);
      act(() => {
        toast.success("<script>alert('xss')</script>");
      });
      expect(
        screen.getByText("<script>alert('xss')</script>")
      ).toBeInTheDocument();
    });

    it("should handle unicode characters", () => {
      render(<ToastContainer />);
      act(() => {
        toast.success("Success ✓ 成功");
      });
      expect(screen.getByText("Success ✓ 成功")).toBeInTheDocument();
    });
  });

  describe("Toast Styling", () => {
    it("should apply success styling", () => {
      const { container } = render(<ToastContainer />);
      act(() => {
        toast.success("Success");
      });
      const toastElement = container.querySelector(".bg-green-50");
      expect(toastElement).toBeInTheDocument();
    });

    it("should apply error styling", () => {
      const { container } = render(<ToastContainer />);
      act(() => {
        toast.error("Error");
      });
      const toastElement = container.querySelector(".bg-red-50");
      expect(toastElement).toBeInTheDocument();
    });

    it("should apply warning styling", () => {
      const { container } = render(<ToastContainer />);
      act(() => {
        toast.warning("Warning");
      });
      const toastElement = container.querySelector(".bg-yellow-50");
      expect(toastElement).toBeInTheDocument();
    });

    it("should apply info styling", () => {
      const { container } = render(<ToastContainer />);
      act(() => {
        toast.info("Info");
      });
      const toastElement = container.querySelector(".bg-blue-50");
      expect(toastElement).toBeInTheDocument();
    });
  });

  describe("Toast Icons", () => {
    it("should render CheckCircle icon for success", () => {
      const { container } = render(<ToastContainer />);
      act(() => {
        toast.success("Success");
      });
      const icon = container.querySelector(".text-green-500");
      expect(icon).toBeInTheDocument();
    });

    it("should render AlertCircle icon for error", () => {
      const { container } = render(<ToastContainer />);
      act(() => {
        toast.error("Error");
      });
      const icon = container.querySelector(".text-red-500");
      expect(icon).toBeInTheDocument();
    });

    it("should render AlertTriangle icon for warning", () => {
      const { container } = render(<ToastContainer />);
      act(() => {
        toast.warning("Warning");
      });
      const icon = container.querySelector(".text-yellow-500");
      expect(icon).toBeInTheDocument();
    });

    it("should render Info icon for info", () => {
      const { container } = render(<ToastContainer />);
      act(() => {
        toast.info("Info");
      });
      const icon = container.querySelector(".text-blue-500");
      expect(icon).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should handle rapid sequential toasts", () => {
      render(<ToastContainer />);
      act(() => {
        for (let i = 0; i < 10; i++) {
          toast.success(`Toast ${i}`);
        }
      });

      for (let i = 0; i < 10; i++) {
        expect(screen.getByText(`Toast ${i}`)).toBeInTheDocument();
      }
    });

    it("should handle negative duration", async () => {
      render(<ToastContainer />);
      act(() => {
        toast.success("Negative duration", -1000);
      });

      // Negative duration should be treated as 0 (no auto-dismiss)
      act(() => {
        jest.advanceTimersByTime(10000);
      });

      expect(screen.getByText("Negative duration")).toBeInTheDocument();
    });

    it("should handle very large duration", () => {
      render(<ToastContainer />);
      act(() => {
        toast.success("Large duration", 999999999);
      });

      act(() => {
        jest.advanceTimersByTime(100000);
      });

      expect(screen.getByText("Large duration")).toBeInTheDocument();
    });

    it("should generate unique IDs for toasts", () => {
      const { container } = render(<ToastContainer />);
      act(() => {
        toast.success("First");
        toast.success("Second");
      });

      const toasts = container.querySelectorAll(".p-4.rounded-lg");
      expect(toasts.length).toBe(2);
    });
  });

  describe("Container Position", () => {
    it("should render at top-right with correct z-index", () => {
      const { container } = render(<ToastContainer />);
      act(() => {
        toast.success("Position test");
      });

      const wrapper = container.querySelector(".fixed.top-20.right-4");
      expect(wrapper).toBeInTheDocument();
      expect(wrapper).toHaveClass("z-[100]");
    });

    it("should have max width", () => {
      const { container } = render(<ToastContainer />);
      act(() => {
        toast.success("Max width test");
      });

      const wrapper = container.querySelector(".max-w-md");
      expect(wrapper).toBeInTheDocument();
    });

    it("should apply spacing between toasts", () => {
      const { container } = render(<ToastContainer />);
      act(() => {
        toast.success("Toast 1");
        toast.success("Toast 2");
      });

      const wrapper = container.querySelector(".space-y-2");
      expect(wrapper).toBeInTheDocument();
    });
  });

  describe("Snapshot Tests", () => {
    it("should match snapshot - empty", () => {
      const { container } = render(<ToastContainer />);
      expect(container).toMatchSnapshot();
    });

    it("should match snapshot - success toast", () => {
      const { container } = render(<ToastContainer />);
      act(() => {
        toast.success("Success message");
      });
      expect(container).toMatchSnapshot();
    });

    it("should match snapshot - multiple toasts", () => {
      const { container } = render(<ToastContainer />);
      act(() => {
        toast.success("Success");
        toast.error("Error");
        toast.warning("Warning");
        toast.info("Info");
      });
      expect(container).toMatchSnapshot();
    });
  });
});
