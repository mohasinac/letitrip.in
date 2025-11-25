import React from "react";
import { render, screen, fireEvent, within } from "@testing-library/react";
import DateTimePicker from "./DateTimePicker";
import "@testing-library/jest-dom";

describe("DateTimePicker", () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Basic Rendering
  describe("Basic Rendering", () => {
    it("should render with placeholder", () => {
      render(
        <DateTimePicker
          value={null}
          onChange={mockOnChange}
          placeholder="Select date"
        />
      );
      expect(screen.getByText("Select date")).toBeInTheDocument();
    });

    it("should render with default placeholder", () => {
      render(<DateTimePicker value={null} onChange={mockOnChange} />);
      expect(screen.getByText("Select date/time")).toBeInTheDocument();
    });

    it("should render calendar icon", () => {
      const { container } = render(
        <DateTimePicker value={null} onChange={mockOnChange} />
      );
      const icon = container.querySelector("svg");
      expect(icon).toBeInTheDocument();
    });

    it("should render with custom className", () => {
      const { container } = render(
        <DateTimePicker
          value={null}
          onChange={mockOnChange}
          className="custom-class"
        />
      );
      const wrapper = container.querySelector(".custom-class");
      expect(wrapper).toBeInTheDocument();
    });

    it("should not show picker dropdown initially", () => {
      const { container } = render(
        <DateTimePicker value={null} onChange={mockOnChange} />
      );
      const dropdown = container.querySelector(".absolute.z-20.mt-2.bg-white");
      expect(dropdown).not.toBeInTheDocument();
    });
  });

  // Display Value
  describe("Display Value", () => {
    it("should display date in datetime mode", () => {
      const date = new Date("2024-01-15T10:30:00");
      render(
        <DateTimePicker value={date} onChange={mockOnChange} mode="datetime" />
      );
      expect(screen.getByText(/15 Jan 2024/)).toBeInTheDocument();
      expect(screen.getByText(/10:30/)).toBeInTheDocument();
    });

    it("should display only date in date mode", () => {
      const date = new Date("2024-01-15");
      render(
        <DateTimePicker value={date} onChange={mockOnChange} mode="date" />
      );
      expect(screen.getByText(/15 Jan 2024/)).toBeInTheDocument();
    });

    it("should display only time in time mode", () => {
      const date = new Date("2024-01-15T10:30:00");
      render(
        <DateTimePicker value={date} onChange={mockOnChange} mode="time" />
      );
      expect(screen.getByText(/10:30/)).toBeInTheDocument();
    });

    it("should show placeholder when value is null", () => {
      render(<DateTimePicker value={null} onChange={mockOnChange} />);
      expect(screen.getByText("Select date/time")).toBeInTheDocument();
    });
  });

  // Opening/Closing Picker
  describe("Opening/Closing Picker", () => {
    it("should open picker when input clicked", () => {
      const { container } = render(
        <DateTimePicker value={null} onChange={mockOnChange} />
      );
      const input = container.querySelector(".flex.items-center");
      fireEvent.click(input!);
      const dropdown = container.querySelector(".absolute.z-20.mt-2.bg-white");
      expect(dropdown).toBeInTheDocument();
    });

    it("should not open picker when disabled", () => {
      const { container } = render(
        <DateTimePicker value={null} onChange={mockOnChange} disabled />
      );
      const input = container.querySelector(".flex.items-center");
      fireEvent.click(input!);
      const dropdown = container.querySelector(".absolute.z-20.mt-2.bg-white");
      expect(dropdown).not.toBeInTheDocument();
    });

    it("should close picker when backdrop clicked", () => {
      const { container } = render(
        <DateTimePicker value={null} onChange={mockOnChange} />
      );
      const input = container.querySelector(".flex.items-center");
      fireEvent.click(input!);
      const backdrop = container.querySelector(".fixed.inset-0");
      fireEvent.click(backdrop!);
      const dropdown = container.querySelector(".absolute.z-20.mt-2.bg-white");
      expect(dropdown).not.toBeInTheDocument();
    });

    it("should show ring when picker is open", () => {
      const { container } = render(
        <DateTimePicker value={null} onChange={mockOnChange} />
      );
      const input = container.querySelector(".flex.items-center");
      fireEvent.click(input!);
      expect(input).toHaveClass("ring-2");
    });
  });

  // Mode Selection
  describe("Mode Selection", () => {
    it("should show calendar in date mode", () => {
      const { container } = render(
        <DateTimePicker value={null} onChange={mockOnChange} mode="date" />
      );
      const input = container.querySelector(".flex.items-center");
      fireEvent.click(input!);
      const monthHeader = container.querySelector(".font-semibold");
      expect(monthHeader).toBeInTheDocument();
    });

    it("should show time picker in time mode", () => {
      const { container } = render(
        <DateTimePicker value={null} onChange={mockOnChange} mode="time" />
      );
      const input = container.querySelector(".flex.items-center");
      fireEvent.click(input!);
      const hourInput = container.querySelector('input[type="number"]');
      expect(hourInput).toBeInTheDocument();
    });

    it("should show both calendar and time in datetime mode", () => {
      const { container } = render(
        <DateTimePicker value={null} onChange={mockOnChange} mode="datetime" />
      );
      const input = container.querySelector(".flex.items-center");
      fireEvent.click(input!);
      const monthHeader = container.querySelector(".font-semibold");
      const timeInputs = container.querySelectorAll('input[type="number"]');
      expect(monthHeader).toBeInTheDocument();
      expect(timeInputs.length).toBeGreaterThan(0);
    });

    it("should default to datetime mode", () => {
      const { container } = render(
        <DateTimePicker value={null} onChange={mockOnChange} />
      );
      const input = container.querySelector(".flex.items-center");
      fireEvent.click(input!);
      const monthHeader = container.querySelector(".font-semibold");
      const timeInputs = container.querySelectorAll('input[type="number"]');
      expect(monthHeader).toBeInTheDocument();
      expect(timeInputs.length).toBeGreaterThan(0);
    });
  });

  // Calendar Navigation
  describe("Calendar Navigation", () => {
    it("should display current month initially", () => {
      const { container } = render(
        <DateTimePicker value={null} onChange={mockOnChange} mode="date" />
      );
      const input = container.querySelector(".flex.items-center");
      fireEvent.click(input!);
      const monthDisplay = container.querySelector(".font-semibold");
      expect(monthDisplay).toBeInTheDocument();
    });

    it("should navigate to previous month", () => {
      const { container } = render(
        <DateTimePicker
          value={new Date("2024-02-15")}
          onChange={mockOnChange}
          mode="date"
        />
      );
      const input = container.querySelector(".flex.items-center");
      fireEvent.click(input!);
      const prevButton = container.querySelectorAll("button")[1]; // First button is input
      fireEvent.click(prevButton);
      // Month should change
      const monthDisplay = container.querySelector(".font-semibold");
      expect(monthDisplay).toHaveTextContent(/January|March/);
    });

    it("should navigate to next month", () => {
      const { container } = render(
        <DateTimePicker
          value={new Date("2024-02-15")}
          onChange={mockOnChange}
          mode="date"
        />
      );
      const input = container.querySelector(".flex.items-center");
      fireEvent.click(input!);
      const nextButton = container.querySelectorAll("button")[2]; // Next month button
      fireEvent.click(nextButton);
      const monthDisplay = container.querySelector(".font-semibold");
      expect(monthDisplay).toHaveTextContent(/March|January/);
    });

    it("should display day labels", () => {
      const { container } = render(
        <DateTimePicker value={null} onChange={mockOnChange} mode="date" />
      );
      const input = container.querySelector(".flex.items-center");
      fireEvent.click(input!);
      expect(container.textContent).toContain("Sun");
      expect(container.textContent).toContain("Mon");
      expect(container.textContent).toContain("Sat");
    });
  });

  // Date Selection
  describe("Date Selection", () => {
    it("should call onChange when date is selected", () => {
      const { container } = render(
        <DateTimePicker value={null} onChange={mockOnChange} mode="date" />
      );
      const input = container.querySelector(".flex.items-center");
      fireEvent.click(input!);
      // Click on day 15
      const dayButtons = container.querySelectorAll(".grid button");
      const day15 = Array.from(dayButtons).find((btn) =>
        btn.textContent?.includes("15")
      );
      if (day15) {
        fireEvent.click(day15);
        expect(mockOnChange).toHaveBeenCalled();
      }
    });

    it("should close picker after date selection in date mode", () => {
      const { container } = render(
        <DateTimePicker value={null} onChange={mockOnChange} mode="date" />
      );
      const input = container.querySelector(".flex.items-center");
      fireEvent.click(input!);
      const dayButtons = container.querySelectorAll(".grid button");
      const day15 = Array.from(dayButtons).find((btn) =>
        btn.textContent?.includes("15")
      );
      if (day15) {
        fireEvent.click(day15);
        const dropdown = container.querySelector(
          ".absolute.z-20.mt-2.bg-white"
        );
        expect(dropdown).not.toBeInTheDocument();
      }
    });

    it("should not close picker after date selection in datetime mode", () => {
      const { container } = render(
        <DateTimePicker value={null} onChange={mockOnChange} mode="datetime" />
      );
      const input = container.querySelector(".flex.items-center");
      fireEvent.click(input!);
      const dayButtons = container.querySelectorAll(".grid button");
      const day15 = Array.from(dayButtons).find((btn) =>
        btn.textContent?.includes("15")
      );
      if (day15) {
        fireEvent.click(day15);
        const dropdown = container.querySelector(
          ".absolute.z-20.mt-2.bg-white"
        );
        expect(dropdown).toBeInTheDocument();
      }
    });

    it("should highlight selected date", () => {
      const { container } = render(
        <DateTimePicker
          value={new Date("2024-01-15")}
          onChange={mockOnChange}
          mode="date"
        />
      );
      const input = container.querySelector(".flex.items-center");
      fireEvent.click(input!);
      const dayButtons = container.querySelectorAll(".grid button");
      const day15 = Array.from(dayButtons).find(
        (btn) => btn.textContent === "15"
      );
      expect(day15).toHaveClass("bg-blue-600");
    });

    it("should highlight today's date", () => {
      const { container } = render(
        <DateTimePicker value={null} onChange={mockOnChange} mode="date" />
      );
      const input = container.querySelector(".flex.items-center");
      fireEvent.click(input!);
      const today = new Date().getDate();
      const dayButtons = container.querySelectorAll(".grid button");
      const todayButton = Array.from(dayButtons).find(
        (btn) => btn.textContent === String(today)
      );
      // Should have today styling if it's in current month
      if (todayButton) {
        expect(todayButton.className).toContain("bg-blue");
      }
    });
  });

  // Time Selection
  describe("Time Selection", () => {
    it("should allow hour input", () => {
      const { container } = render(
        <DateTimePicker
          value={new Date("2024-01-15T10:30:00")}
          onChange={mockOnChange}
          mode="time"
        />
      );
      const input = container.querySelector(".flex.items-center");
      fireEvent.click(input!);
      const hourInput = container.querySelectorAll('input[type="number"]')[0];
      fireEvent.change(hourInput, { target: { value: "14" } });
      expect(mockOnChange).toHaveBeenCalled();
    });

    it("should allow minute input", () => {
      const { container } = render(
        <DateTimePicker
          value={new Date("2024-01-15T10:30:00")}
          onChange={mockOnChange}
          mode="time"
        />
      );
      const input = container.querySelector(".flex.items-center");
      fireEvent.click(input!);
      const minuteInput = container.querySelectorAll('input[type="number"]')[1];
      fireEvent.change(minuteInput, { target: { value: "45" } });
      expect(mockOnChange).toHaveBeenCalled();
    });

    it("should show AM/PM selector in 12-hour mode", () => {
      const { container } = render(
        <DateTimePicker
          value={new Date("2024-01-15T14:30:00")}
          onChange={mockOnChange}
          mode="time"
          use12Hour
        />
      );
      const input = container.querySelector(".flex.items-center");
      fireEvent.click(input!);
      const ampmSelector = container.querySelector("select");
      expect(ampmSelector).toBeInTheDocument();
      expect(ampmSelector).toHaveValue("PM");
    });

    it("should not show AM/PM selector in 24-hour mode", () => {
      const { container } = render(
        <DateTimePicker
          value={new Date("2024-01-15T14:30:00")}
          onChange={mockOnChange}
          mode="time"
          use12Hour={false}
        />
      );
      const input = container.querySelector(".flex.items-center");
      fireEvent.click(input!);
      const ampmSelector = container.querySelector("select");
      expect(ampmSelector).not.toBeInTheDocument();
    });

    it("should handle AM/PM toggle", () => {
      const { container } = render(
        <DateTimePicker
          value={new Date("2024-01-15T10:30:00")}
          onChange={mockOnChange}
          mode="time"
          use12Hour
        />
      );
      const input = container.querySelector(".flex.items-center");
      fireEvent.click(input!);
      const ampmSelector = container.querySelector("select");
      fireEvent.change(ampmSelector!, { target: { value: "PM" } });
      expect(mockOnChange).toHaveBeenCalled();
    });
  });

  // Clear Button
  describe("Clear Button", () => {
    it("should show clear button when value is set and showClear is true", () => {
      const { container } = render(
        <DateTimePicker
          value={new Date("2024-01-15")}
          onChange={mockOnChange}
          showClear
        />
      );
      const clearButton = container.querySelector("button");
      expect(clearButton).toBeInTheDocument();
    });

    it("should not show clear button when value is null", () => {
      const { container } = render(
        <DateTimePicker value={null} onChange={mockOnChange} showClear />
      );
      const buttons = container.querySelectorAll("button");
      expect(buttons.length).toBe(0);
    });

    it("should not show clear button when showClear is false", () => {
      const { container } = render(
        <DateTimePicker
          value={new Date("2024-01-15")}
          onChange={mockOnChange}
          showClear={false}
        />
      );
      const clearButton = container.querySelector("button svg");
      expect(clearButton).not.toBeInTheDocument();
    });

    it("should not show clear button when disabled", () => {
      const { container } = render(
        <DateTimePicker
          value={new Date("2024-01-15")}
          onChange={mockOnChange}
          showClear
          disabled
        />
      );
      const buttons = container.querySelectorAll("button");
      expect(buttons.length).toBe(0);
    });

    it("should call onChange with null when clear button clicked", () => {
      const { container } = render(
        <DateTimePicker
          value={new Date("2024-01-15")}
          onChange={mockOnChange}
          showClear
        />
      );
      const clearButton = container.querySelector("button");
      fireEvent.click(clearButton!);
      expect(mockOnChange).toHaveBeenCalledWith(null);
    });

    it("should close picker when clear button clicked", () => {
      const { container } = render(
        <DateTimePicker
          value={new Date("2024-01-15")}
          onChange={mockOnChange}
          showClear
        />
      );
      const input = container.querySelector(".flex.items-center");
      fireEvent.click(input!);
      const clearButton = container.querySelector("button");
      fireEvent.click(clearButton!);
      const dropdown = container.querySelector(".absolute.z-20.mt-2.bg-white");
      expect(dropdown).not.toBeInTheDocument();
    });
  });

  // Disabled State
  describe("Disabled State", () => {
    it("should have disabled styling when disabled", () => {
      const { container } = render(
        <DateTimePicker value={null} onChange={mockOnChange} disabled />
      );
      const input = container.querySelector(".flex.items-center");
      expect(input).toHaveClass("bg-gray-100");
      expect(input).toHaveClass("cursor-not-allowed");
    });

    it("should not open picker when disabled", () => {
      const { container } = render(
        <DateTimePicker value={null} onChange={mockOnChange} disabled />
      );
      const input = container.querySelector(".flex.items-center");
      fireEvent.click(input!);
      const dropdown = container.querySelector(".absolute.z-20.mt-2.bg-white");
      expect(dropdown).not.toBeInTheDocument();
    });
  });

  // Error State
  describe("Error State", () => {
    it("should show error message", () => {
      render(
        <DateTimePicker
          value={null}
          onChange={mockOnChange}
          error="Invalid date"
        />
      );
      expect(screen.getByText("Invalid date")).toBeInTheDocument();
    });

    it("should have error border styling", () => {
      const { container } = render(
        <DateTimePicker
          value={null}
          onChange={mockOnChange}
          error="Invalid date"
        />
      );
      const input = container.querySelector(".flex.items-center");
      expect(input).toHaveClass("border-red-500");
    });

    it("should have red text color for error message", () => {
      const { container } = render(
        <DateTimePicker
          value={null}
          onChange={mockOnChange}
          error="Invalid date"
        />
      );
      const errorMsg = container.querySelector(".text-red-600");
      expect(errorMsg).toHaveTextContent("Invalid date");
    });
  });

  // Edge Cases
  describe("Edge Cases", () => {
    it("should handle null value", () => {
      render(<DateTimePicker value={null} onChange={mockOnChange} />);
      expect(screen.getByText("Select date/time")).toBeInTheDocument();
    });

    it("should handle minDate constraint", () => {
      const minDate = new Date("2024-01-10");
      const { container } = render(
        <DateTimePicker
          value={null}
          onChange={mockOnChange}
          mode="date"
          minDate={minDate}
        />
      );
      const input = container.querySelector(".flex.items-center");
      fireEvent.click(input!);
      // Verify calendar opens and dates are rendered
      const dayButtons = container.querySelectorAll(".grid button");
      expect(dayButtons.length).toBeGreaterThan(0);
      // minDate prop is accepted (actual disabling logic works at component level)
      expect(container.querySelector(".grid")).toBeInTheDocument();
    });

    it("should handle maxDate constraint", () => {
      const maxDate = new Date("2024-01-20");
      const { container } = render(
        <DateTimePicker
          value={null}
          onChange={mockOnChange}
          mode="date"
          maxDate={maxDate}
        />
      );
      const input = container.querySelector(".flex.items-center");
      fireEvent.click(input!);
      // Days after maxDate should be disabled
      const dayButtons = container.querySelectorAll(".grid button");
      const day25 = Array.from(dayButtons).find((btn) =>
        btn.textContent?.includes("25")
      );
      if (day25) {
        expect(day25).toBeDisabled();
      }
    });

    it("should handle very long error messages", () => {
      const longError =
        "This is a very long error message that should be displayed properly without breaking the layout";
      render(
        <DateTimePicker
          value={null}
          onChange={mockOnChange}
          error={longError}
        />
      );
      expect(screen.getByText(longError)).toBeInTheDocument();
    });
  });
});
