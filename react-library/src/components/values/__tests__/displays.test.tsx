import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DateDisplay } from "../DateDisplay";
import { Price } from "../Price";
import { StatusBadge } from "../StatusBadge";

describe("Value Display Components", () => {
  describe("Price", () => {
    it("should format and display price", () => {
      render(<Price value={1000} />);
      expect(screen.getByText(/1,000/)).toBeInTheDocument();
    });

    it("should display with custom currency", () => {
      render(<Price value={1000} currency="USD" />);
      const element = screen.getByText(/1,000/);
      expect(element.textContent).toContain("$");
    });

    it("should handle zero value", () => {
      render(<Price value={0} />);
      expect(screen.getByText(/0/)).toBeInTheDocument();
    });
  });

  describe("DateDisplay", () => {
    it("should display formatted date", () => {
      const date = new Date("2024-01-15");
      render(<DateDisplay value={date} />);
      expect(screen.getByText(/Jan.*15.*2024/)).toBeInTheDocument();
    });

    it("should handle invalid date", () => {
      render(<DateDisplay value={new Date("invalid")} />);
      expect(screen.getByText(/Invalid Date/)).toBeInTheDocument();
    });

    it("should display relative time", () => {
      const now = new Date();
      render(<DateDisplay value={now} format="relative" />);
      expect(screen.getByText(/ago|now|in/i)).toBeInTheDocument();
    });
  });

  describe("StatusBadge", () => {
    it("should render status text", () => {
      render(<StatusBadge status="active">Active</StatusBadge>);
      expect(screen.getByText("Active")).toBeInTheDocument();
    });

    it("should apply status color classes", () => {
      const { rerender } = render(
        <StatusBadge status="success">Success</StatusBadge>
      );
      expect(screen.getByText("Success")).toHaveClass("bg-success-light");

      rerender(<StatusBadge status="error">Error</StatusBadge>);
      expect(screen.getByText("Error")).toHaveClass("bg-error-light");
    });

    it("should render in different sizes", () => {
      render(
        <StatusBadge status="active" size="sm">
          Small
        </StatusBadge>
      );
      expect(screen.getByText("Small")).toHaveClass("text-xs");
    });
  });
});
