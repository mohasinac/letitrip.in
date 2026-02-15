import React from "react";
import { render, screen } from "@testing-library/react";
import { MediaOperationForm } from "@/components";

describe("MediaOperationForm", () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Crop Form", () => {
    it("renders crop form", () => {
      const { container } = render(
        <MediaOperationForm operationType="crop" onSubmit={mockOnSubmit} />,
      );

      expect(screen.queryAllByText("Crop Image").length).toBeGreaterThan(0);
      expect(container.querySelector("form")).toBeInTheDocument();
    });

    it("renders all crop fields", () => {
      render(
        <MediaOperationForm operationType="crop" onSubmit={mockOnSubmit} />,
      );

      expect(screen.getByText("Source URL")).toBeInTheDocument();
      expect(screen.getByText("Crop Parameters")).toBeInTheDocument();
      expect(screen.getByText("X Position")).toBeInTheDocument();
      expect(screen.getByText("Y Position")).toBeInTheDocument();
      expect(screen.getByText("Width")).toBeInTheDocument();
      expect(screen.getByText("Height")).toBeInTheDocument();
    });

    it("disables button during loading", () => {
      const { rerender } = render(
        <MediaOperationForm
          operationType="crop"
          onSubmit={mockOnSubmit}
          isLoading={false}
        />,
      );

      let buttons = screen.getAllByRole("button") as HTMLButtonElement[];
      expect(buttons.some((b) => !b.disabled)).toBe(true);

      rerender(
        <MediaOperationForm
          operationType="crop"
          onSubmit={mockOnSubmit}
          isLoading={true}
        />,
      );

      buttons = screen.getAllByRole("button") as HTMLButtonElement[];
      expect(buttons.every((b) => b.disabled)).toBe(true);
    });
  });

  describe("Trim Form", () => {
    it("renders trim form", () => {
      const { container } = render(
        <MediaOperationForm operationType="trim" onSubmit={mockOnSubmit} />,
      );

      expect(container.querySelector("form")).toBeInTheDocument();
    });

    it("renders all trim fields", () => {
      render(
        <MediaOperationForm operationType="trim" onSubmit={mockOnSubmit} />,
      );

      expect(screen.getByText("Trim Parameters")).toBeInTheDocument();
      expect(screen.getByText("Start Time (seconds)")).toBeInTheDocument();
      expect(screen.getByText("End Time (seconds)")).toBeInTheDocument();
    });
  });
});
