import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { AvatarDisplay } from "../AvatarDisplay";
import { UI_LABELS } from "@/constants";
import type { ImageCropData } from "../modals/ImageCropModal";

describe("AvatarDisplay", () => {
  describe("With Avatar Image", () => {
    const mockCropData: ImageCropData = {
      url: "https://example.com/avatar.jpg",
      position: { x: 50, y: 50 },
      zoom: 1.2,
    };

    it("renders avatar image when cropData is provided", () => {
      render(<AvatarDisplay cropData={mockCropData} />);
      const img = screen.getByRole("img");
      expect(img).toHaveAttribute("src", mockCropData.url);
      expect(img).toHaveAttribute("alt", UI_LABELS.AVATAR.ALT_TEXT);
    });

    it("applies crop metadata styles correctly", () => {
      render(<AvatarDisplay cropData={mockCropData} />);
      const img = screen.getByRole("img");

      expect(img).toHaveStyle({
        width: "120%", // 1.2 zoom
        height: "120%",
        left: "50%",
        top: "50%",
        transform: "translate(-50%, -50%)",
      });
    });

    it("applies custom alt text", () => {
      render(<AvatarDisplay cropData={mockCropData} alt="John Doe" />);
      const img = screen.getByRole("img");
      expect(img).toHaveAttribute("alt", "John Doe");
    });

    it("applies different size classes", () => {
      const { container, rerender } = render(
        <AvatarDisplay cropData={mockCropData} size="sm" />,
      );
      expect(container.firstChild).toHaveClass("w-8", "h-8");

      rerender(<AvatarDisplay cropData={mockCropData} size="md" />);
      expect(container.firstChild).toHaveClass("w-12", "h-12");

      rerender(<AvatarDisplay cropData={mockCropData} size="lg" />);
      expect(container.firstChild).toHaveClass("w-16", "h-16");

      rerender(<AvatarDisplay cropData={mockCropData} size="xl" />);
      expect(container.firstChild).toHaveClass("w-24", "h-24");

      rerender(<AvatarDisplay cropData={mockCropData} size="2xl" />);
      expect(container.firstChild).toHaveClass("w-32", "h-32");
    });

    it("applies custom className", () => {
      const { container } = render(
        <AvatarDisplay cropData={mockCropData} className="custom-class" />,
      );
      expect(container.firstChild).toHaveClass("custom-class");
    });
  });

  describe("Without Avatar Image - Initials Display", () => {
    it("displays initials from full name (first + last)", () => {
      render(<AvatarDisplay cropData={null} displayName="John Doe" />);
      expect(screen.getByText("JD")).toBeInTheDocument();
    });

    it("displays first 2 letters for single name", () => {
      render(<AvatarDisplay cropData={null} displayName="Madonna" />);
      expect(screen.getByText("MA")).toBeInTheDocument();
    });

    it("displays initials from email when no displayName", () => {
      render(<AvatarDisplay cropData={null} email="john@example.com" />);
      expect(screen.getByText("JO")).toBeInTheDocument();
    });

    it("displays default initial when no name or email", () => {
      render(<AvatarDisplay cropData={null} />);
      expect(
        screen.getByText(UI_LABELS.AVATAR.DEFAULT_INITIAL),
      ).toBeInTheDocument();
    });

    it("prefers displayName over email for initials", () => {
      render(
        <AvatarDisplay
          cropData={null}
          displayName="John Doe"
          email="different@example.com"
        />,
      );
      expect(screen.getByText("JD")).toBeInTheDocument();
    });

    it("handles names with extra spaces", () => {
      render(<AvatarDisplay cropData={null} displayName="  John   Doe  " />);
      expect(screen.getByText("JD")).toBeInTheDocument();
    });

    it("handles three or more names (uses first + last)", () => {
      render(<AvatarDisplay cropData={null} displayName="John Michael Doe" />);
      expect(screen.getByText("JD")).toBeInTheDocument();
    });

    it("uppercases initials", () => {
      render(<AvatarDisplay cropData={null} displayName="john doe" />);
      expect(screen.getByText("JD")).toBeInTheDocument();
    });
  });

  describe("Gradient Background Colors", () => {
    it("applies gradient background for initials", () => {
      const { container } = render(
        <AvatarDisplay cropData={null} displayName="John Doe" />,
      );
      const avatar = container.firstChild as HTMLElement;
      expect(avatar.className).toMatch(/bg-gradient-to-br/);
      expect(avatar.className).toMatch(/from-\w+-\d+/);
      expect(avatar.className).toMatch(/to-\w+-\d+/);
    });

    it("generates consistent colors for same name", () => {
      const { container: container1 } = render(
        <AvatarDisplay cropData={null} displayName="John Doe" />,
      );
      const { container: container2 } = render(
        <AvatarDisplay cropData={null} displayName="John Doe" />,
      );

      const avatar1Classes = (container1.firstChild as HTMLElement).className;
      const avatar2Classes = (container2.firstChild as HTMLElement).className;

      // Same name should produce same gradient
      expect(avatar1Classes).toContain(
        avatar2Classes.match(/from-\w+-\d+/)?.[0],
      );
    });

    it("displays white text on gradient background", () => {
      const { container } = render(
        <AvatarDisplay cropData={null} displayName="John Doe" />,
      );
      const text = container.querySelector("span");
      expect(text).toHaveClass("text-white");
    });
  });

  describe("Text Sizing", () => {
    it("applies correct text size for each avatar size", () => {
      const { container, rerender } = render(
        <AvatarDisplay cropData={null} displayName="JD" size="sm" />,
      );

      let text = container.querySelector("span");
      expect(text).toHaveClass("text-xs");

      rerender(<AvatarDisplay cropData={null} displayName="JD" size="md" />);
      text = container.querySelector("span");
      expect(text).toHaveClass("text-sm");

      rerender(<AvatarDisplay cropData={null} displayName="JD" size="lg" />);
      text = container.querySelector("span");
      expect(text).toHaveClass("text-base");

      rerender(<AvatarDisplay cropData={null} displayName="JD" size="xl" />);
      text = container.querySelector("span");
      expect(text).toHaveClass("text-2xl");

      rerender(<AvatarDisplay cropData={null} displayName="JD" size="2xl" />);
      text = container.querySelector("span");
      expect(text).toHaveClass("text-3xl");
    });
  });

  describe("Edge Cases", () => {
    it("handles empty cropData object", () => {
      render(
        <AvatarDisplay
          cropData={{ url: "", position: { x: 50, y: 50 }, zoom: 1 }}
          displayName="John Doe"
        />,
      );
      expect(screen.getByText("JD")).toBeInTheDocument();
    });

    it("handles null displayName and email", () => {
      render(<AvatarDisplay cropData={null} displayName={null} email={null} />);
      expect(
        screen.getByText(UI_LABELS.AVATAR.DEFAULT_INITIAL),
      ).toBeInTheDocument();
    });

    it("handles undefined displayName and email", () => {
      render(
        <AvatarDisplay
          cropData={null}
          displayName={undefined}
          email={undefined}
        />,
      );
      expect(
        screen.getByText(UI_LABELS.AVATAR.DEFAULT_INITIAL),
      ).toBeInTheDocument();
    });

    it("handles empty string displayName", () => {
      render(
        <AvatarDisplay
          cropData={null}
          displayName=""
          email="test@example.com"
        />,
      );
      expect(screen.getByText("TE")).toBeInTheDocument();
    });

    it("applies default zoom and position when not provided", () => {
      const cropDataWithoutZoom: ImageCropData = {
        url: "https://example.com/avatar.jpg",
        position: { x: 50, y: 50 },
        zoom: 1,
      };

      render(<AvatarDisplay cropData={cropDataWithoutZoom} />);
      const img = screen.getByRole("img");
      expect(img).toHaveStyle({
        width: "100%",
        height: "100%",
      });
    });
  });

  describe("Accessibility", () => {
    it("provides alt text for images", () => {
      const mockCropData: ImageCropData = {
        url: "https://example.com/avatar.jpg",
        position: { x: 50, y: 50 },
        zoom: 1,
      };

      render(<AvatarDisplay cropData={mockCropData} />);
      const img = screen.getByRole("img");
      expect(img).toHaveAttribute("alt");
    });

    it("makes initials non-selectable", () => {
      const { container } = render(
        <AvatarDisplay cropData={null} displayName="John Doe" />,
      );
      const text = container.querySelector("span");
      expect(text).toHaveClass("select-none");
    });

    it("makes image non-selectable", () => {
      const mockCropData: ImageCropData = {
        url: "https://example.com/avatar.jpg",
        position: { x: 50, y: 50 },
        zoom: 1,
      };

      render(<AvatarDisplay cropData={mockCropData} />);
      const img = screen.getByRole("img");
      expect(img).toHaveClass("select-none");
    });
  });
});
