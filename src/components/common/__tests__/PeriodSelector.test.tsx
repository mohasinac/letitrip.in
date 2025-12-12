import { fireEvent, render, screen } from "@testing-library/react";
import { PeriodSelector } from "../PeriodSelector";

describe("PeriodSelector", () => {
  const defaultProps = {
    value: "day",
    onChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Basic Rendering", () => {
    it("renders without errors", () => {
      render(<PeriodSelector {...defaultProps} />);
      expect(screen.getByText("Today")).toBeInTheDocument();
    });

    it("renders all default periods", () => {
      render(<PeriodSelector {...defaultProps} />);
      expect(screen.getByText("Today")).toBeInTheDocument();
      expect(screen.getByText("This Week")).toBeInTheDocument();
      expect(screen.getByText("This Month")).toBeInTheDocument();
      expect(screen.getByText("This Year")).toBeInTheDocument();
    });

    it("renders 4 buttons by default", () => {
      render(<PeriodSelector {...defaultProps} />);
      const buttons = screen.getAllByRole("button");
      expect(buttons).toHaveLength(4);
    });

    it("has container with proper styling", () => {
      const { container } = render(<PeriodSelector {...defaultProps} />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass("inline-flex", "rounded-lg", "border");
    });
  });

  describe("Selected State", () => {
    it("highlights selected period (day)", () => {
      render(<PeriodSelector {...defaultProps} value="day" />);
      const button = screen.getByText("Today");
      expect(button).toHaveClass("bg-indigo-600", "text-white");
    });

    it("highlights selected period (week)", () => {
      render(<PeriodSelector {...defaultProps} value="week" />);
      const button = screen.getByText("This Week");
      expect(button).toHaveClass("bg-indigo-600", "text-white");
    });

    it("highlights selected period (month)", () => {
      render(<PeriodSelector {...defaultProps} value="month" />);
      const button = screen.getByText("This Month");
      expect(button).toHaveClass("bg-indigo-600", "text-white");
    });

    it("highlights selected period (year)", () => {
      render(<PeriodSelector {...defaultProps} value="year" />);
      const button = screen.getByText("This Year");
      expect(button).toHaveClass("bg-indigo-600", "text-white");
    });

    it("unselected periods have gray styling", () => {
      render(<PeriodSelector {...defaultProps} value="day" />);
      const weekButton = screen.getByText("This Week");
      expect(weekButton).toHaveClass("text-gray-700");
      expect(weekButton).not.toHaveClass("bg-indigo-600");
    });

    it("only one period is selected at a time", () => {
      render(<PeriodSelector {...defaultProps} value="month" />);
      const buttons = screen.getAllByRole("button");

      const selectedButtons = buttons.filter((btn) =>
        btn.className.includes("bg-indigo-600")
      );

      expect(selectedButtons).toHaveLength(1);
    });
  });

  describe("User Interaction", () => {
    it("calls onChange when period is clicked", () => {
      const onChange = jest.fn();
      render(<PeriodSelector {...defaultProps} onChange={onChange} />);

      const weekButton = screen.getByText("This Week");
      fireEvent.click(weekButton);

      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith("week");
    });

    it("calls onChange with correct value for day", () => {
      const onChange = jest.fn();
      render(<PeriodSelector {...defaultProps} onChange={onChange} />);

      fireEvent.click(screen.getByText("Today"));
      expect(onChange).toHaveBeenCalledWith("day");
    });

    it("calls onChange with correct value for month", () => {
      const onChange = jest.fn();
      render(<PeriodSelector {...defaultProps} onChange={onChange} />);

      fireEvent.click(screen.getByText("This Month"));
      expect(onChange).toHaveBeenCalledWith("month");
    });

    it("calls onChange with correct value for year", () => {
      const onChange = jest.fn();
      render(<PeriodSelector {...defaultProps} onChange={onChange} />);

      fireEvent.click(screen.getByText("This Year"));
      expect(onChange).toHaveBeenCalledWith("year");
    });

    it("allows clicking already selected period", () => {
      const onChange = jest.fn();
      render(
        <PeriodSelector {...defaultProps} value="day" onChange={onChange} />
      );

      fireEvent.click(screen.getByText("Today"));
      expect(onChange).toHaveBeenCalledWith("day");
    });

    it("can switch between periods multiple times", () => {
      const onChange = jest.fn();
      render(<PeriodSelector {...defaultProps} onChange={onChange} />);

      fireEvent.click(screen.getByText("This Week"));
      fireEvent.click(screen.getByText("This Month"));
      fireEvent.click(screen.getByText("Today"));

      expect(onChange).toHaveBeenCalledTimes(3);
    });
  });

  describe("Custom Periods", () => {
    it("renders custom periods when provided", () => {
      const customPeriods = [
        { label: "Last Hour", value: "hour" },
        { label: "Last 24h", value: "24h" },
      ];

      render(
        <PeriodSelector
          {...defaultProps}
          periods={customPeriods}
          value="hour"
        />
      );

      expect(screen.getByText("Last Hour")).toBeInTheDocument();
      expect(screen.getByText("Last 24h")).toBeInTheDocument();
      expect(screen.queryByText("Today")).not.toBeInTheDocument();
    });

    it("renders correct number of custom periods", () => {
      const customPeriods = [
        { label: "P1", value: "p1" },
        { label: "P2", value: "p2" },
        { label: "P3", value: "p3" },
      ];

      render(
        <PeriodSelector {...defaultProps} periods={customPeriods} value="p1" />
      );

      const buttons = screen.getAllByRole("button");
      expect(buttons).toHaveLength(3);
    });

    it("handles custom period clicks correctly", () => {
      const onChange = jest.fn();
      const customPeriods = [{ label: "Custom", value: "custom-value" }];

      render(
        <PeriodSelector
          {...defaultProps}
          periods={customPeriods}
          value="custom-value"
          onChange={onChange}
        />
      );

      fireEvent.click(screen.getByText("Custom"));
      expect(onChange).toHaveBeenCalledWith("custom-value");
    });

    it("highlights selected custom period", () => {
      const customPeriods = [
        { label: "Custom 1", value: "c1" },
        { label: "Custom 2", value: "c2" },
      ];

      render(
        <PeriodSelector {...defaultProps} periods={customPeriods} value="c2" />
      );

      const button = screen.getByText("Custom 2");
      expect(button).toHaveClass("bg-indigo-600", "text-white");
    });

    it("handles empty custom periods array", () => {
      render(<PeriodSelector {...defaultProps} periods={[]} value="" />);

      const buttons = screen.queryAllByRole("button");
      expect(buttons).toHaveLength(0);
    });

    it("handles single custom period", () => {
      const customPeriods = [{ label: "Only One", value: "one" }];

      render(
        <PeriodSelector {...defaultProps} periods={customPeriods} value="one" />
      );

      expect(screen.getByText("Only One")).toBeInTheDocument();
      expect(screen.getAllByRole("button")).toHaveLength(1);
    });

    it("handles many custom periods", () => {
      const customPeriods = Array.from({ length: 10 }, (_, i) => ({
        label: `Period ${i}`,
        value: `p${i}`,
      }));

      render(
        <PeriodSelector {...defaultProps} periods={customPeriods} value="p0" />
      );

      expect(screen.getAllByRole("button")).toHaveLength(10);
    });
  });

  describe("Styling and Layout", () => {
    it("applies custom className", () => {
      const { container } = render(
        <PeriodSelector {...defaultProps} className="custom-class" />
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass("custom-class");
    });

    it("retains default classes with custom className", () => {
      const { container } = render(
        <PeriodSelector {...defaultProps} className="custom-class" />
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass("inline-flex", "rounded-lg", "custom-class");
    });

    it("all buttons have consistent styling", () => {
      render(<PeriodSelector {...defaultProps} value="day" />);
      const buttons = screen.getAllByRole("button");

      buttons.forEach((button) => {
        expect(button).toHaveClass(
          "px-4",
          "py-2",
          "text-sm",
          "font-medium",
          "rounded-md"
        );
      });
    });

    it("buttons have transition classes", () => {
      render(<PeriodSelector {...defaultProps} />);
      const buttons = screen.getAllByRole("button");

      buttons.forEach((button) => {
        expect(button).toHaveClass("transition-colors");
      });
    });

    it("unselected buttons have hover classes", () => {
      render(<PeriodSelector {...defaultProps} value="day" />);
      const weekButton = screen.getByText("This Week");

      expect(weekButton.className).toContain("hover:bg-gray-100");
    });
  });

  describe("Dark Mode", () => {
    it("container has dark mode border classes", () => {
      const { container } = render(<PeriodSelector {...defaultProps} />);
      const wrapper = container.firstChild as HTMLElement;

      expect(wrapper.className).toContain("dark:border-gray-700");
    });

    it("container has dark mode background classes", () => {
      const { container } = render(<PeriodSelector {...defaultProps} />);
      const wrapper = container.firstChild as HTMLElement;

      expect(wrapper.className).toContain("dark:bg-gray-800");
    });

    it("unselected buttons have dark mode text classes", () => {
      render(<PeriodSelector {...defaultProps} value="day" />);
      const weekButton = screen.getByText("This Week");

      expect(weekButton.className).toContain("dark:text-gray-300");
    });

    it("unselected buttons have dark mode hover classes", () => {
      render(<PeriodSelector {...defaultProps} value="day" />);
      const weekButton = screen.getByText("This Week");

      expect(weekButton.className).toContain("dark:hover:bg-gray-700");
    });
  });

  describe("Accessibility", () => {
    it("all periods are keyboard accessible", () => {
      render(<PeriodSelector {...defaultProps} />);
      const buttons = screen.getAllByRole("button");

      buttons.forEach((button) => {
        button.focus();
        expect(document.activeElement).toBe(button);
      });
    });

    it("buttons have descriptive text", () => {
      render(<PeriodSelector {...defaultProps} />);

      expect(screen.getByText("Today")).toBeInTheDocument();
      expect(screen.getByText("This Week")).toBeInTheDocument();
      expect(screen.getByText("This Month")).toBeInTheDocument();
      expect(screen.getByText("This Year")).toBeInTheDocument();
    });

    it("selected button is visually distinct", () => {
      render(<PeriodSelector {...defaultProps} value="week" />);

      const selectedButton = screen.getByText("This Week");
      const unselectedButton = screen.getByText("Today");

      expect(selectedButton.className).toContain("bg-indigo-600");
      expect(unselectedButton.className).not.toContain("bg-indigo-600");
    });
  });

  describe("State Updates", () => {
    it("updates selection when value prop changes", () => {
      const { rerender } = render(
        <PeriodSelector {...defaultProps} value="day" />
      );

      expect(screen.getByText("Today")).toHaveClass("bg-indigo-600");

      rerender(<PeriodSelector {...defaultProps} value="week" />);

      expect(screen.getByText("This Week")).toHaveClass("bg-indigo-600");
      expect(screen.getByText("Today")).not.toHaveClass("bg-indigo-600");
    });

    it("handles rapid value changes", () => {
      const { rerender } = render(
        <PeriodSelector {...defaultProps} value="day" />
      );

      const values = ["week", "month", "year", "day"];
      values.forEach((value) => {
        rerender(<PeriodSelector {...defaultProps} value={value} />);
      });

      expect(screen.getByText("Today")).toHaveClass("bg-indigo-600");
    });
  });

  describe("Edge Cases", () => {
    it("handles invalid value gracefully", () => {
      render(<PeriodSelector {...defaultProps} value="invalid" />);

      const buttons = screen.getAllByRole("button");
      const selectedButtons = buttons.filter((btn) =>
        btn.className.includes("bg-indigo-600")
      );

      expect(selectedButtons).toHaveLength(0);
    });

    it("handles empty string value", () => {
      render(<PeriodSelector {...defaultProps} value="" />);

      const buttons = screen.getAllByRole("button");
      expect(buttons).toHaveLength(4);
    });

    it("handles special characters in custom period labels", () => {
      const customPeriods = [{ label: "Today & Tomorrow", value: "special" }];

      render(
        <PeriodSelector
          {...defaultProps}
          periods={customPeriods}
          value="special"
        />
      );

      expect(screen.getByText("Today & Tomorrow")).toBeInTheDocument();
    });

    it("handles very long custom period labels", () => {
      const customPeriods = [{ label: "A".repeat(100), value: "long" }];

      render(
        <PeriodSelector
          {...defaultProps}
          periods={customPeriods}
          value="long"
        />
      );

      expect(screen.getByText("A".repeat(100))).toBeInTheDocument();
    });
  });

  describe("Multiple Instances", () => {
    it("renders multiple selectors independently", () => {
      render(
        <>
          <PeriodSelector value="day" onChange={jest.fn()} />
          <PeriodSelector value="week" onChange={jest.fn()} />
        </>
      );

      const buttons = screen.getAllByRole("button");
      expect(buttons.length).toBeGreaterThanOrEqual(8); // At least 4 per selector
    });

    it("each instance maintains independent state", () => {
      const onChange1 = jest.fn();
      const onChange2 = jest.fn();

      render(
        <>
          <PeriodSelector value="day" onChange={onChange1} />
          <PeriodSelector value="week" onChange={onChange2} />
        </>
      );

      const todayButtons = screen.getAllByText("Today");
      fireEvent.click(todayButtons[0]);

      expect(onChange1).toHaveBeenCalled();
      expect(onChange2).not.toHaveBeenCalled();
    });
  });
});
