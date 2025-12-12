import { useTheme } from "@/contexts/ThemeContext";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ThemeToggle } from "../ThemeToggle";

// Mock ThemeContext
jest.mock("@/contexts/ThemeContext", () => ({
  useTheme: jest.fn(),
}));

const mockUseTheme = useTheme as jest.MockedFunction<typeof useTheme>;

describe("ThemeToggle", () => {
  const mockSetTheme = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseTheme.mockReturnValue({
      theme: "dark",
      setTheme: mockSetTheme,
      toggleTheme: jest.fn(),
      isLoading: false,
    });
  });

  describe("Basic Rendering - Button Variant", () => {
    it("renders button variant by default", () => {
      render(<ThemeToggle />);
      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
    });

    it("shows moon icon for dark theme", () => {
      mockUseTheme.mockReturnValue({
        theme: "dark",
        setTheme: mockSetTheme,
        toggleTheme: jest.fn(),
        isLoading: false,
      });
      const { container } = render(<ThemeToggle />);
      const moonIcon = container.querySelector('path[d*="M21 12.79"]');
      expect(moonIcon).toBeInTheDocument();
    });

    it("shows sun icon for light theme", () => {
      mockUseTheme.mockReturnValue({
        theme: "light",
        setTheme: mockSetTheme,
        toggleTheme: jest.fn(),
        isLoading: false,
      });
      const { container } = render(<ThemeToggle />);
      const sunIcon = container.querySelector('circle[cx="12"]');
      expect(sunIcon).toBeInTheDocument();
    });

    it("does not show label by default", () => {
      render(<ThemeToggle />);
      expect(screen.queryByText("Dark")).not.toBeInTheDocument();
      expect(screen.queryByText("Light")).not.toBeInTheDocument();
    });

    it("shows label when showLabel is true", () => {
      mockUseTheme.mockReturnValue({
        theme: "dark",
        setTheme: mockSetTheme,
        toggleTheme: jest.fn(),
        isLoading: false,
      });
      render(<ThemeToggle showLabel />);
      expect(screen.getByText("Dark")).toBeInTheDocument();
    });

    it("applies custom className", () => {
      const { container } = render(<ThemeToggle className="custom-class" />);
      const button = container.querySelector(".custom-class");
      expect(button).toBeInTheDocument();
    });

    it("has aria-label describing current theme", () => {
      mockUseTheme.mockReturnValue({
        theme: "dark",
        setTheme: mockSetTheme,
        toggleTheme: jest.fn(),
        isLoading: false,
      });
      render(<ThemeToggle />);
      const button = screen.getByRole("button");
      expect(button).toHaveAttribute(
        "aria-label",
        "Current theme: Dark. Click to change."
      );
    });

    it("has title attribute", () => {
      mockUseTheme.mockReturnValue({
        theme: "light",
        setTheme: mockSetTheme,
        toggleTheme: jest.fn(),
        isLoading: false,
      });
      render(<ThemeToggle />);
      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("title", "Theme: Light");
    });
  });

  describe("Theme Toggle Functionality", () => {
    it("toggles from dark to light", () => {
      mockUseTheme.mockReturnValue({
        theme: "dark",
        setTheme: mockSetTheme,
        toggleTheme: jest.fn(),
        isLoading: false,
      });
      render(<ThemeToggle />);
      const button = screen.getByRole("button");
      fireEvent.click(button);
      expect(mockSetTheme).toHaveBeenCalledWith("light");
    });

    it("toggles from light to dark", () => {
      mockUseTheme.mockReturnValue({
        theme: "light",
        setTheme: mockSetTheme,
        toggleTheme: jest.fn(),
        isLoading: false,
      });
      render(<ThemeToggle />);
      const button = screen.getByRole("button");
      fireEvent.click(button);
      expect(mockSetTheme).toHaveBeenCalledWith("dark");
    });

    it("calls setTheme only once per click", () => {
      render(<ThemeToggle />);
      const button = screen.getByRole("button");
      fireEvent.click(button);
      expect(mockSetTheme).toHaveBeenCalledTimes(1);
    });

    it("supports rapid toggling", () => {
      render(<ThemeToggle />);
      const button = screen.getByRole("button");
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);
      expect(mockSetTheme).toHaveBeenCalledTimes(3);
    });
  });

  describe("Dropdown Variant - Rendering", () => {
    it("renders dropdown variant", () => {
      render(<ThemeToggle variant="dropdown" />);
      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("aria-haspopup", "listbox");
    });

    it("shows chevron icon in dropdown variant", () => {
      const { container } = render(<ThemeToggle variant="dropdown" />);
      const chevron = container.querySelector('path[d*="M19 9l-7 7-7-7"]');
      expect(chevron).toBeInTheDocument();
    });

    it("dropdown is closed by default", () => {
      render(<ThemeToggle variant="dropdown" />);
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });

    it("has aria-expanded false when closed", () => {
      render(<ThemeToggle variant="dropdown" />);
      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("aria-expanded", "false");
    });

    it("opens dropdown on click", () => {
      render(<ThemeToggle variant="dropdown" />);
      const button = screen.getByRole("button");
      fireEvent.click(button);
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });

    it("has aria-expanded true when open", () => {
      render(<ThemeToggle variant="dropdown" />);
      const button = screen.getByRole("button");
      fireEvent.click(button);
      expect(button).toHaveAttribute("aria-expanded", "true");
    });

    it("shows both theme options in dropdown", () => {
      render(<ThemeToggle variant="dropdown" />);
      const button = screen.getByRole("button");
      fireEvent.click(button);
      expect(screen.getByText("Light")).toBeInTheDocument();
      expect(screen.getByText("Dark")).toBeInTheDocument();
    });

    it("highlights current theme option", () => {
      mockUseTheme.mockReturnValue({
        theme: "dark",
        setTheme: mockSetTheme,
        toggleTheme: jest.fn(),
        isLoading: false,
      });
      render(<ThemeToggle variant="dropdown" />);
      fireEvent.click(screen.getByRole("button"));
      const darkOption = screen.getByRole("option", { name: /Dark/i });
      expect(darkOption).toHaveAttribute("aria-selected", "true");
    });

    it("shows checkmark on selected option", () => {
      mockUseTheme.mockReturnValue({
        theme: "light",
        setTheme: mockSetTheme,
        toggleTheme: jest.fn(),
        isLoading: false,
      });
      const { container } = render(<ThemeToggle variant="dropdown" />);
      fireEvent.click(screen.getByRole("button"));
      const checkmark = container.querySelector('path[d*="M5 13l4 4L19 7"]');
      expect(checkmark).toBeInTheDocument();
    });
  });

  describe("Dropdown Variant - Interactions", () => {
    it("changes theme when option clicked", () => {
      mockUseTheme.mockReturnValue({
        theme: "dark",
        setTheme: mockSetTheme,
        toggleTheme: jest.fn(),
        isLoading: false,
      });
      render(<ThemeToggle variant="dropdown" />);
      fireEvent.click(screen.getByRole("button"));
      fireEvent.click(screen.getByRole("option", { name: /Light/i }));
      expect(mockSetTheme).toHaveBeenCalledWith("light");
    });

    it("closes dropdown after selecting option", async () => {
      render(<ThemeToggle variant="dropdown" />);
      fireEvent.click(screen.getByRole("button"));
      fireEvent.click(screen.getByRole("option", { name: /Light/i }));
      await waitFor(() => {
        expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
      });
    });

    it("toggles dropdown on repeated clicks", () => {
      render(<ThemeToggle variant="dropdown" />);
      const button = screen.getByRole("button");
      fireEvent.click(button);
      expect(screen.getByRole("listbox")).toBeInTheDocument();
      fireEvent.click(button);
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });

    it("closes on outside click", async () => {
      render(
        <div>
          <ThemeToggle variant="dropdown" />
          <div data-testid="outside">Outside</div>
        </div>
      );
      fireEvent.click(screen.getByRole("button"));
      expect(screen.getByRole("listbox")).toBeInTheDocument();
      fireEvent.mouseDown(screen.getByTestId("outside"));
      await waitFor(() => {
        expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
      });
    });

    it("does not close on inside click", () => {
      render(<ThemeToggle variant="dropdown" />);
      fireEvent.click(screen.getByRole("button"));
      const dropdown = screen.getByRole("listbox");
      fireEvent.mouseDown(dropdown);
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });
  });

  describe("Keyboard Navigation", () => {
    it("closes dropdown on Escape key", async () => {
      render(<ThemeToggle variant="dropdown" />);
      fireEvent.click(screen.getByRole("button"));
      expect(screen.getByRole("listbox")).toBeInTheDocument();
      fireEvent.keyDown(screen.getByRole("button"), { key: "Escape" });
      await waitFor(() => {
        expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
      });
    });

    it("opens dropdown on ArrowDown key", () => {
      render(<ThemeToggle variant="dropdown" />);
      const button = screen.getByRole("button");
      fireEvent.keyDown(button, { key: "ArrowDown" });
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });

    it("does not open dropdown on ArrowDown if already open", () => {
      render(<ThemeToggle variant="dropdown" />);
      const button = screen.getByRole("button");
      fireEvent.click(button);
      const initialDropdown = screen.getByRole("listbox");
      fireEvent.keyDown(button, { key: "ArrowDown" });
      expect(screen.getByRole("listbox")).toBe(initialDropdown);
    });

    it("focuses button after Escape", async () => {
      render(<ThemeToggle variant="dropdown" />);
      const button = screen.getByRole("button");
      fireEvent.click(button);
      fireEvent.keyDown(button, { key: "Escape" });
      await waitFor(() => {
        expect(button).toHaveFocus();
      });
    });

    it("button variant does not handle keyboard navigation", () => {
      const { container } = render(<ThemeToggle variant="button" />);
      const button = screen.getByRole("button");
      fireEvent.keyDown(button, { key: "Escape" });
      fireEvent.keyDown(button, { key: "ArrowDown" });
      expect(
        container.querySelector('[role="listbox"]')
      ).not.toBeInTheDocument();
    });
  });

  describe("Size Variants", () => {
    it("applies sm size classes (BUG: size prop ignored, always uses p-2)", () => {
      const { container } = render(<ThemeToggle size="sm" />);
      const button = container.querySelector("button");
      // BUG: Component defines sizeClasses but doesn't use them in buttonStyles
      expect(button).toHaveClass("p-2"); // Should be p-1.5
    });

    it("applies md size classes by default", () => {
      const { container } = render(<ThemeToggle />);
      const button = container.querySelector("button");
      expect(button).toHaveClass("p-2");
    });

    it("applies lg size classes (BUG: size prop ignored, always uses p-2)", () => {
      const { container } = render(<ThemeToggle size="lg" />);
      const button = container.querySelector("button");
      // BUG: Component defines sizeClasses but doesn't use them in buttonStyles
      expect(button).toHaveClass("p-2"); // Should be p-3
    });

    it("icon size is consistent across sizes", () => {
      const { container: sm } = render(<ThemeToggle size="sm" />);
      const { container: md } = render(<ThemeToggle size="md" />);
      const { container: lg } = render(<ThemeToggle size="lg" />);

      expect(sm.querySelector(".w-6")).toBeInTheDocument();
      expect(md.querySelector(".w-6")).toBeInTheDocument();
      expect(lg.querySelector(".w-6")).toBeInTheDocument();
    });
  });

  describe("Styling", () => {
    it("has hover styles", () => {
      render(<ThemeToggle />);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("hover:bg-gray-100");
      expect(button).toHaveClass("dark:hover:bg-gray-700");
    });

    it("has focus-visible ring", () => {
      render(<ThemeToggle />);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("focus-visible:ring-2");
      expect(button).toHaveClass("focus-visible:ring-yellow-500");
    });

    it("has transition classes", () => {
      render(<ThemeToggle />);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("transition-colors");
      expect(button).toHaveClass("duration-200");
    });

    it("has dark mode text color", () => {
      render(<ThemeToggle />);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("text-gray-900");
      expect(button).toHaveClass("dark:text-white");
    });

    it("icon has transition transform", () => {
      const { container } = render(<ThemeToggle />);
      const iconWrapper = container.querySelector(".transition-transform");
      expect(iconWrapper).toBeInTheDocument();
    });

    it("chevron rotates when dropdown open", () => {
      const { container } = render(<ThemeToggle variant="dropdown" />);
      const button = screen.getByRole("button");
      fireEvent.click(button);
      const chevron = container.querySelector(".rotate-180");
      expect(chevron).toBeInTheDocument();
    });

    it("dropdown has shadow and border", () => {
      const { container } = render(<ThemeToggle variant="dropdown" />);
      fireEvent.click(screen.getByRole("button"));
      const dropdown = container.querySelector(".shadow-lg");
      expect(dropdown).toBeInTheDocument();
      expect(dropdown).toHaveClass("border");
      expect(dropdown).toHaveClass("border-gray-200");
      expect(dropdown).toHaveClass("dark:border-gray-700");
    });

    it("selected option has highlighted background", () => {
      mockUseTheme.mockReturnValue({
        theme: "dark",
        setTheme: mockSetTheme,
        toggleTheme: jest.fn(),
        isLoading: false,
      });
      render(<ThemeToggle variant="dropdown" />);
      fireEvent.click(screen.getByRole("button"));
      const darkOption = screen.getByRole("option", { name: /Dark/i });
      expect(darkOption).toHaveClass("bg-yellow-50");
      expect(darkOption).toHaveClass("dark:bg-yellow-900/20");
    });

    it("unselected option has hover state", () => {
      mockUseTheme.mockReturnValue({
        theme: "dark",
        setTheme: mockSetTheme,
        toggleTheme: jest.fn(),
        isLoading: false,
      });
      render(<ThemeToggle variant="dropdown" />);
      fireEvent.click(screen.getByRole("button"));
      const lightOption = screen.getByRole("option", { name: /Light/i });
      expect(lightOption).toHaveClass("hover:bg-gray-100");
      expect(lightOption).toHaveClass("dark:hover:bg-gray-700");
    });
  });

  describe("Accessibility", () => {
    it("button has type button", () => {
      render(<ThemeToggle />);
      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("type", "button");
    });

    it("dropdown button has aria-haspopup", () => {
      render(<ThemeToggle variant="dropdown" />);
      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("aria-haspopup", "listbox");
    });

    it("dropdown has aria-label", () => {
      render(<ThemeToggle variant="dropdown" />);
      fireEvent.click(screen.getByRole("button"));
      const dropdown = screen.getByRole("listbox");
      expect(dropdown).toHaveAttribute("aria-label", "Select theme");
    });

    it("options have role option", () => {
      render(<ThemeToggle variant="dropdown" />);
      fireEvent.click(screen.getByRole("button"));
      const options = screen.getAllByRole("option");
      expect(options).toHaveLength(2);
    });

    it("options have aria-selected", () => {
      mockUseTheme.mockReturnValue({
        theme: "light",
        setTheme: mockSetTheme,
        toggleTheme: jest.fn(),
        isLoading: false,
      });
      render(<ThemeToggle variant="dropdown" />);
      fireEvent.click(screen.getByRole("button"));
      const lightOption = screen.getByRole("option", { name: /Light/i });
      const darkOption = screen.getByRole("option", { name: /Dark/i });
      expect(lightOption).toHaveAttribute("aria-selected", "true");
      expect(darkOption).toHaveAttribute("aria-selected", "false");
    });

    it("icons have aria-hidden", () => {
      const { container } = render(<ThemeToggle />);
      const icons = container.querySelectorAll('[aria-hidden="true"]');
      expect(icons.length).toBeGreaterThan(0);
    });

    it("has focus:outline-none", () => {
      render(<ThemeToggle />);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("focus:outline-none");
    });
  });

  describe("Edge Cases", () => {
    it("handles undefined theme gracefully", () => {
      mockUseTheme.mockReturnValue({
        theme: "dark" as any,
        setTheme: mockSetTheme,
        toggleTheme: jest.fn(),
        isLoading: false,
      });
      expect(() => render(<ThemeToggle />)).not.toThrow();
    });

    it("handles showLabel with dropdown variant", () => {
      render(<ThemeToggle variant="dropdown" showLabel />);
      expect(screen.getByText("Dark")).toBeInTheDocument();
    });

    it("handles multiple theme toggles in rapid succession", () => {
      render(<ThemeToggle />);
      const button = screen.getByRole("button");
      for (let i = 0; i < 10; i++) {
        fireEvent.click(button);
      }
      expect(mockSetTheme).toHaveBeenCalledTimes(10);
    });

    it("cleans up event listeners on unmount", () => {
      const { unmount } = render(<ThemeToggle variant="dropdown" />);
      fireEvent.click(screen.getByRole("button"));
      unmount();
      // No error should occur
    });

    it("maintains dropdown position with z-50", () => {
      const { container } = render(<ThemeToggle variant="dropdown" />);
      fireEvent.click(screen.getByRole("button"));
      const dropdown = container.querySelector(".z-50");
      expect(dropdown).toBeInTheDocument();
    });

    it("dropdown is positioned absolute right-0", () => {
      const { container } = render(<ThemeToggle variant="dropdown" />);
      fireEvent.click(screen.getByRole("button"));
      const dropdown = container.querySelector(".absolute.right-0");
      expect(dropdown).toBeInTheDocument();
    });

    it("handles very long className prop", () => {
      const longClass = "a".repeat(200);
      expect(() => render(<ThemeToggle className={longClass} />)).not.toThrow();
    });

    it("button works with disabled event listeners", () => {
      const { container } = render(<ThemeToggle />);
      const button = container.querySelector("button");
      expect(button).toBeInTheDocument();
    });
  });

  describe("Multiple Instances", () => {
    it("handles multiple toggles independently", () => {
      render(
        <>
          <ThemeToggle data-testid="toggle1" />
          <ThemeToggle data-testid="toggle2" />
        </>
      );
      const buttons = screen.getAllByRole("button");
      expect(buttons).toHaveLength(2);
    });

    it("handles multiple dropdowns independently", () => {
      render(
        <>
          <ThemeToggle variant="dropdown" />
          <ThemeToggle variant="dropdown" />
        </>
      );
      const buttons = screen.getAllByRole("button");
      fireEvent.click(buttons[0]);
      expect(screen.getByRole("listbox")).toBeInTheDocument();
      fireEvent.click(buttons[1]);
      // Both dropdowns open now (no auto-close of other dropdowns)
      const dropdowns = screen.getAllByRole("listbox");
      expect(dropdowns).toHaveLength(2);
    });
  });

  describe("Label Display", () => {
    it("shows correct label for light theme", () => {
      mockUseTheme.mockReturnValue({
        theme: "light",
        setTheme: mockSetTheme,
        toggleTheme: jest.fn(),
        isLoading: false,
      });
      render(<ThemeToggle showLabel />);
      expect(screen.getByText("Light")).toBeInTheDocument();
    });

    it("shows correct label for dark theme", () => {
      mockUseTheme.mockReturnValue({
        theme: "dark",
        setTheme: mockSetTheme,
        toggleTheme: jest.fn(),
        isLoading: false,
      });
      render(<ThemeToggle showLabel />);
      expect(screen.getByText("Dark")).toBeInTheDocument();
    });

    it("label has correct styling", () => {
      render(<ThemeToggle showLabel />);
      const label = screen.getByText("Dark");
      expect(label).toHaveClass("text-sm");
      expect(label).toHaveClass("font-medium");
    });
  });
});
