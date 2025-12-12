import { initErrorHandlers } from "@/lib/firebase-error-logger";
import { render } from "@testing-library/react";
import ErrorInitializer from "../ErrorInitializer";

// Mock Firebase error logger
jest.mock("@/lib/firebase-error-logger", () => ({
  initErrorHandlers: jest.fn(),
}));

const mockInitErrorHandlers = initErrorHandlers as jest.MockedFunction<
  typeof initErrorHandlers
>;

describe("ErrorInitializer", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Initialization", () => {
    it("renders without errors", () => {
      expect(() => render(<ErrorInitializer />)).not.toThrow();
    });

    it("returns null (renders nothing)", () => {
      const { container } = render(<ErrorInitializer />);
      expect(container.firstChild).toBeNull();
    });

    it("calls initErrorHandlers on mount", () => {
      render(<ErrorInitializer />);
      expect(mockInitErrorHandlers).toHaveBeenCalledTimes(1);
    });

    it("calls initErrorHandlers with no arguments", () => {
      render(<ErrorInitializer />);
      expect(mockInitErrorHandlers).toHaveBeenCalledWith();
    });
  });

  describe("Component Lifecycle", () => {
    it("only initializes once on mount", () => {
      const { rerender } = render(<ErrorInitializer />);
      rerender(<ErrorInitializer />);
      rerender(<ErrorInitializer />);
      expect(mockInitErrorHandlers).toHaveBeenCalledTimes(1);
    });

    it("does not reinitialize on rerender", () => {
      const { rerender } = render(<ErrorInitializer />);
      mockInitErrorHandlers.mockClear();
      rerender(<ErrorInitializer />);
      expect(mockInitErrorHandlers).not.toHaveBeenCalled();
    });

    it("cleans up properly on unmount", () => {
      const { unmount } = render(<ErrorInitializer />);
      expect(() => unmount()).not.toThrow();
    });
  });

  describe("Multiple Instances", () => {
    it("each instance calls initErrorHandlers", () => {
      render(
        <>
          <ErrorInitializer />
          <ErrorInitializer />
          <ErrorInitializer />
        </>
      );
      expect(mockInitErrorHandlers).toHaveBeenCalledTimes(3);
    });

    it("handles multiple mounts and unmounts", () => {
      const { unmount: unmount1 } = render(<ErrorInitializer />);
      const { unmount: unmount2 } = render(<ErrorInitializer />);
      const { unmount: unmount3 } = render(<ErrorInitializer />);

      expect(mockInitErrorHandlers).toHaveBeenCalledTimes(3);

      expect(() => {
        unmount1();
        unmount2();
        unmount3();
      }).not.toThrow();
    });
  });

  describe("Error Handling", () => {
    it("handles initErrorHandlers throwing error", () => {
      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      mockInitErrorHandlers.mockImplementation(() => {
        throw new Error("Initialization failed");
      });

      // Component should still render even if initialization fails
      const { container } = render(<ErrorInitializer />);
      expect(container.firstChild).toBeNull(); // Still returns null

      consoleSpy.mockRestore();
    });

    it("handles initErrorHandlers rejecting promise", () => {
      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      mockInitErrorHandlers.mockRejectedValue(new Error("Async error"));

      const { container } = render(<ErrorInitializer />);
      expect(container.firstChild).toBeNull();

      consoleSpy.mockRestore();
    });
  });

  describe("Integration", () => {
    it("works in production-like environment", () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "production";

      render(<ErrorInitializer />);
      expect(mockInitErrorHandlers).toHaveBeenCalled();

      process.env.NODE_ENV = originalEnv;
    });

    it("works in development environment", () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "development";

      render(<ErrorInitializer />);
      expect(mockInitErrorHandlers).toHaveBeenCalled();

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe("Edge Cases", () => {
    it("handles rapid mount/unmount cycles", () => {
      for (let i = 0; i < 10; i++) {
        const { unmount } = render(<ErrorInitializer />);
        unmount();
      }

      expect(mockInitErrorHandlers).toHaveBeenCalledTimes(10);
    });

    it("works when wrapped in other components", () => {
      render(
        <div>
          <span>
            <ErrorInitializer />
          </span>
        </div>
      );

      expect(mockInitErrorHandlers).toHaveBeenCalled();
    });

    it("does not affect sibling components", () => {
      const { container } = render(
        <div>
          <div>Sibling 1</div>
          <ErrorInitializer />
          <div>Sibling 2</div>
        </div>
      );

      expect(container.textContent).toBe("Sibling 1Sibling 2");
    });
  });
});
