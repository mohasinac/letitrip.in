import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ReviewFilters, ReviewFilterValues } from "./ReviewFilters";

describe("ReviewFilters", () => {
  const mockOnChange = jest.fn();
  const mockOnApply = jest.fn();
  const mockOnReset = jest.fn();

  const defaultProps = {
    filters: {} as ReviewFilterValues,
    onChange: mockOnChange,
    onApply: mockOnApply,
    onReset: mockOnReset,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Basic Rendering", () => {
    it("renders filter header", () => {
      render(<ReviewFilters {...defaultProps} />);
      expect(screen.getByText("Filters")).toBeInTheDocument();
    });

    it("renders rating section", () => {
      render(<ReviewFilters {...defaultProps} />);
      expect(screen.getByText("Rating")).toBeInTheDocument();
    });

    it("renders review type section", () => {
      render(<ReviewFilters {...defaultProps} />);
      expect(screen.getByText("Review Type")).toBeInTheDocument();
    });

    it("renders review status section", () => {
      render(<ReviewFilters {...defaultProps} />);
      expect(screen.getByText("Review Status")).toBeInTheDocument();
    });

    it("renders apply button", () => {
      render(<ReviewFilters {...defaultProps} />);
      expect(screen.getByText("Apply Filters")).toBeInTheDocument();
    });
  });

  describe("Rating Filter", () => {
    it("renders all rating options", () => {
      render(<ReviewFilters {...defaultProps} />);
      const checkboxes = screen.getAllByRole("checkbox");
      expect(checkboxes.length).toBeGreaterThanOrEqual(5);
    });

    it("calls onChange when rating selected", () => {
      render(<ReviewFilters {...defaultProps} />);
      const checkboxes = screen.getAllByRole("checkbox");
      fireEvent.click(checkboxes[0]);
      expect(mockOnChange).toHaveBeenCalled();
    });
  });

  describe("Review Type Filter", () => {
    it("renders verified purchase checkbox", () => {
      render(<ReviewFilters {...defaultProps} />);
      expect(screen.getByText("Verified Purchases Only")).toBeInTheDocument();
    });

    it("renders has media checkbox", () => {
      render(<ReviewFilters {...defaultProps} />);
      expect(screen.getByText("With Images/Videos")).toBeInTheDocument();
    });
  });

  describe("Review Status Filter", () => {
    it("renders all status options", () => {
      render(<ReviewFilters {...defaultProps} />);
      expect(screen.getByText("Approved")).toBeInTheDocument();
      expect(screen.getByText("Pending")).toBeInTheDocument();
      expect(screen.getByText("Rejected")).toBeInTheDocument();
    });
  });

  describe("Actions", () => {
    it("calls onApply when apply button clicked", () => {
      render(<ReviewFilters {...defaultProps} />);
      fireEvent.click(screen.getByText("Apply Filters"));
      expect(mockOnApply).toHaveBeenCalled();
    });
  });
});
