import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { FAQHelpfulButtons } from "../FAQHelpfulButtons";
import { apiClient } from "@/lib/api-client";
import { UI_LABELS } from "@/constants/ui";

// Mock API client
jest.mock("@/lib/api-client", () => ({
  apiClient: {
    post: jest.fn(),
  },
}));

const mockApiPost = apiClient.post as jest.MockedFunction<
  typeof apiClient.post
>;

describe("FAQHelpfulButtons", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockApiPost.mockResolvedValue({ success: true, data: null });
  });

  describe("Rendering", () => {
    it('should render "Was this helpful?" message initially', () => {
      render(
        <FAQHelpfulButtons
          faqId="faq-1"
          initialHelpful={10}
          initialNotHelpful={2}
        />,
      );

      expect(
        screen.getByText(UI_LABELS.FAQ.WAS_THIS_HELPFUL),
      ).toBeInTheDocument();
    });

    it("should render Yes button with thumbs up icon", () => {
      render(
        <FAQHelpfulButtons
          faqId="faq-1"
          initialHelpful={10}
          initialNotHelpful={2}
        />,
      );

      const yesButton = screen.getByRole("button", { name: /yes/i });
      expect(yesButton).toBeInTheDocument();
      expect(yesButton.querySelector("svg")).toBeInTheDocument();
    });

    it("should render No button with thumbs down icon", () => {
      render(
        <FAQHelpfulButtons
          faqId="faq-1"
          initialHelpful={10}
          initialNotHelpful={2}
        />,
      );

      const noButton = screen.getByRole("button", { name: /no/i });
      expect(noButton).toBeInTheDocument();
      expect(noButton.querySelector("svg")).toBeInTheDocument();
    });

    it("should display initial helpful count", () => {
      render(
        <FAQHelpfulButtons
          faqId="faq-1"
          initialHelpful={25}
          initialNotHelpful={5}
        />,
      );

      expect(screen.getByText("(25)")).toBeInTheDocument();
    });

    it("should display initial not helpful count", () => {
      render(
        <FAQHelpfulButtons
          faqId="faq-1"
          initialHelpful={10}
          initialNotHelpful={8}
        />,
      );

      expect(screen.getByText("(8)")).toBeInTheDocument();
    });

    it("should display zero counts", () => {
      render(
        <FAQHelpfulButtons
          faqId="faq-1"
          initialHelpful={0}
          initialNotHelpful={0}
        />,
      );

      const counts = screen.getAllByText("(0)");
      expect(counts).toHaveLength(2);
    });
  });

  describe("Helpful Vote", () => {
    it("should call API when clicking Yes button", async () => {
      render(
        <FAQHelpfulButtons
          faqId="faq-123"
          initialHelpful={10}
          initialNotHelpful={2}
        />,
      );

      const yesButton = screen.getByRole("button", { name: /yes/i });
      fireEvent.click(yesButton);

      await waitFor(() => {
        expect(mockApiPost).toHaveBeenCalledTimes(1);
      });

      expect(mockApiPost).toHaveBeenCalledWith("/api/faqs/faq-123/vote", {
        isHelpful: true,
      });
    });

    it("should increment helpful count after voting", async () => {
      render(
        <FAQHelpfulButtons
          faqId="faq-1"
          initialHelpful={10}
          initialNotHelpful={2}
        />,
      );

      expect(screen.getByText("(10)")).toBeInTheDocument();

      const yesButton = screen.getByRole("button", { name: /yes/i });
      fireEvent.click(yesButton);

      await waitFor(() => {
        expect(screen.getByText("(11)")).toBeInTheDocument();
      });
    });

    it('should show "Thanks for your feedback!" after voting', async () => {
      render(
        <FAQHelpfulButtons
          faqId="faq-1"
          initialHelpful={10}
          initialNotHelpful={2}
        />,
      );

      const yesButton = screen.getByRole("button", { name: /yes/i });
      fireEvent.click(yesButton);

      await waitFor(() => {
        expect(
          screen.getByText("Thanks for your feedback!"),
        ).toBeInTheDocument();
      });

      expect(
        screen.queryByText(UI_LABELS.FAQ.WAS_THIS_HELPFUL),
      ).not.toBeInTheDocument();
    });

    it("should highlight Yes button after voting helpful", async () => {
      render(
        <FAQHelpfulButtons
          faqId="faq-1"
          initialHelpful={10}
          initialNotHelpful={2}
        />,
      );

      const yesButton = screen.getByRole("button", { name: /yes/i });
      fireEvent.click(yesButton);

      await waitFor(() => {
        expect(yesButton).toHaveClass("bg-green-600", "text-white");
      });
    });

    it("should disable No button after voting helpful", async () => {
      render(
        <FAQHelpfulButtons
          faqId="faq-1"
          initialHelpful={10}
          initialNotHelpful={2}
        />,
      );

      const yesButton = screen.getByRole("button", { name: /yes/i });
      const noButton = screen.getByRole("button", { name: /no/i });

      fireEvent.click(yesButton);

      await waitFor(() => {
        expect(noButton).toBeDisabled();
      });

      expect(noButton).toHaveClass("cursor-not-allowed", "opacity-50");
    });
  });

  describe("Not Helpful Vote", () => {
    it("should call API when clicking No button", async () => {
      render(
        <FAQHelpfulButtons
          faqId="faq-456"
          initialHelpful={10}
          initialNotHelpful={2}
        />,
      );

      const noButton = screen.getByRole("button", { name: /no/i });
      fireEvent.click(noButton);

      await waitFor(() => {
        expect(mockApiPost).toHaveBeenCalledTimes(1);
      });

      expect(mockApiPost).toHaveBeenCalledWith("/api/faqs/faq-456/vote", {
        isHelpful: false,
      });
    });

    it("should increment not helpful count after voting", async () => {
      render(
        <FAQHelpfulButtons
          faqId="faq-1"
          initialHelpful={10}
          initialNotHelpful={5}
        />,
      );

      expect(screen.getByText("(5)")).toBeInTheDocument();

      const noButton = screen.getByRole("button", { name: /no/i });
      fireEvent.click(noButton);

      await waitFor(() => {
        expect(screen.getByText("(6)")).toBeInTheDocument();
      });
    });

    it('should show "Thanks for your feedback!" after voting not helpful', async () => {
      render(
        <FAQHelpfulButtons
          faqId="faq-1"
          initialHelpful={10}
          initialNotHelpful={2}
        />,
      );

      const noButton = screen.getByRole("button", { name: /no/i });
      fireEvent.click(noButton);

      await waitFor(() => {
        expect(
          screen.getByText("Thanks for your feedback!"),
        ).toBeInTheDocument();
      });
    });

    it("should highlight No button after voting not helpful", async () => {
      render(
        <FAQHelpfulButtons
          faqId="faq-1"
          initialHelpful={10}
          initialNotHelpful={2}
        />,
      );

      const noButton = screen.getByRole("button", { name: /no/i });
      fireEvent.click(noButton);

      await waitFor(() => {
        expect(noButton).toHaveClass("bg-red-600", "text-white");
      });
    });

    it("should disable Yes button after voting not helpful", async () => {
      render(
        <FAQHelpfulButtons
          faqId="faq-1"
          initialHelpful={10}
          initialNotHelpful={2}
        />,
      );

      const yesButton = screen.getByRole("button", { name: /yes/i });
      const noButton = screen.getByRole("button", { name: /no/i });

      fireEvent.click(noButton);

      await waitFor(() => {
        expect(yesButton).toBeDisabled();
      });

      expect(yesButton).toHaveClass("cursor-not-allowed", "opacity-50");
    });
  });

  describe("Vote Prevention", () => {
    it("should prevent voting twice", async () => {
      render(
        <FAQHelpfulButtons
          faqId="faq-1"
          initialHelpful={10}
          initialNotHelpful={2}
        />,
      );

      const yesButton = screen.getByRole("button", { name: /yes/i });

      // First vote
      fireEvent.click(yesButton);

      await waitFor(() => {
        expect(yesButton).toBeDisabled();
      });

      // Try to vote again
      fireEvent.click(yesButton);

      // API should only be called once
      expect(mockApiPost).toHaveBeenCalledTimes(1);
    });

    it("should prevent voting on other button after one vote", async () => {
      render(
        <FAQHelpfulButtons
          faqId="faq-1"
          initialHelpful={10}
          initialNotHelpful={2}
        />,
      );

      const yesButton = screen.getByRole("button", { name: /yes/i });
      const noButton = screen.getByRole("button", { name: /no/i });

      // Vote helpful
      fireEvent.click(yesButton);

      await waitFor(() => {
        expect(noButton).toBeDisabled();
      });

      // Try to vote not helpful
      fireEvent.click(noButton);

      // API should only be called once
      expect(mockApiPost).toHaveBeenCalledTimes(1);
      expect(mockApiPost).toHaveBeenCalledWith("/api/faqs/faq-1/vote", {
        isHelpful: true,
      });
    });

    it("should prevent rapid clicking", async () => {
      render(
        <FAQHelpfulButtons
          faqId="faq-1"
          initialHelpful={10}
          initialNotHelpful={2}
        />,
      );

      const yesButton = screen.getByRole("button", { name: /yes/i });

      // Rapid clicks
      fireEvent.click(yesButton);
      fireEvent.click(yesButton);
      fireEvent.click(yesButton);

      await waitFor(() => {
        expect(yesButton).toBeDisabled();
      });

      // API should only be called once
      expect(mockApiPost).toHaveBeenCalledTimes(1);
    });
  });

  describe("API Error Handling", () => {
    it("should handle API errors gracefully", async () => {
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
      mockApiPost.mockRejectedValueOnce(new Error("Network error"));

      render(
        <FAQHelpfulButtons
          faqId="faq-1"
          initialHelpful={10}
          initialNotHelpful={2}
        />,
      );

      const yesButton = screen.getByRole("button", { name: /yes/i });
      fireEvent.click(yesButton);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          "Failed to submit vote:",
          expect.any(Error),
        );
      });

      // Buttons should be re-enabled after error
      await waitFor(() => {
        expect(yesButton).not.toBeDisabled();
      });

      consoleErrorSpy.mockRestore();
    });

    it("should not update counts on API error", async () => {
      jest.spyOn(console, "error").mockImplementation();
      mockApiPost.mockRejectedValueOnce(new Error("API error"));

      render(
        <FAQHelpfulButtons
          faqId="faq-1"
          initialHelpful={10}
          initialNotHelpful={2}
        />,
      );

      const yesButton = screen.getByRole("button", { name: /yes/i });
      fireEvent.click(yesButton);

      await waitFor(() => {
        expect(mockApiPost).toHaveBeenCalled();
      });

      // Count should remain unchanged
      expect(screen.getByText("(10)")).toBeInTheDocument();

      jest.restoreAllMocks();
    });

    it("should allow retry after API error", async () => {
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
      mockApiPost.mockRejectedValueOnce(new Error("First attempt failed"));

      render(
        <FAQHelpfulButtons
          faqId="faq-1"
          initialHelpful={10}
          initialNotHelpful={2}
        />,
      );

      const yesButton = screen.getByRole("button", { name: /yes/i });

      // First attempt (fails)
      fireEvent.click(yesButton);

      await waitFor(() => {
        expect(yesButton).not.toBeDisabled();
      });

      // Second attempt (succeeds)
      mockApiPost.mockResolvedValueOnce({ success: true, data: null });
      fireEvent.click(yesButton);

      await waitFor(() => {
        expect(screen.getByText("(11)")).toBeInTheDocument();
      });

      consoleErrorSpy.mockRestore();
    });
  });

  describe("Edge Cases", () => {
    it("should handle zero initial counts", () => {
      render(
        <FAQHelpfulButtons
          faqId="faq-1"
          initialHelpful={0}
          initialNotHelpful={0}
        />,
      );

      expect(screen.getAllByText("(0)")).toHaveLength(2);
    });

    it("should handle very large initial counts", () => {
      render(
        <FAQHelpfulButtons
          faqId="faq-1"
          initialHelpful={9999}
          initialNotHelpful={8888}
        />,
      );

      expect(screen.getByText("(9999)")).toBeInTheDocument();
      expect(screen.getByText("(8888)")).toBeInTheDocument();
    });

    it("should handle different FAQ IDs", async () => {
      const { unmount } = render(
        <FAQHelpfulButtons
          faqId="faq-123"
          initialHelpful={10}
          initialNotHelpful={2}
        />,
      );

      const yesButton = screen.getByRole("button", { name: /yes/i });
      fireEvent.click(yesButton);

      await waitFor(() => {
        expect(mockApiPost).toHaveBeenCalledWith(
          "/api/faqs/faq-123/vote",
          expect.any(Object),
        );
      });

      unmount();
      mockApiPost.mockClear();

      render(
        <FAQHelpfulButtons
          faqId="faq-456"
          initialHelpful={5}
          initialNotHelpful={1}
        />,
      );

      const newYesButton = screen.getByRole("button", { name: /yes/i });
      fireEvent.click(newYesButton);

      await waitFor(() => {
        expect(mockApiPost).toHaveBeenCalledWith(
          "/api/faqs/faq-456/vote",
          expect.any(Object),
        );
      });
    });
  });

  describe("Accessibility", () => {
    it("should have proper button roles", () => {
      render(
        <FAQHelpfulButtons
          faqId="faq-1"
          initialHelpful={10}
          initialNotHelpful={2}
        />,
      );

      const buttons = screen.getAllByRole("button");
      expect(buttons).toHaveLength(2);
    });

    it("should be keyboard accessible before voting", () => {
      render(
        <FAQHelpfulButtons
          faqId="faq-1"
          initialHelpful={10}
          initialNotHelpful={2}
        />,
      );

      const yesButton = screen.getByRole("button", { name: /yes/i });
      const noButton = screen.getByRole("button", { name: /no/i });

      yesButton.focus();
      expect(yesButton).toHaveFocus();

      noButton.focus();
      expect(noButton).toHaveFocus();
    });

    it("should support keyboard voting with Enter", async () => {
      render(
        <FAQHelpfulButtons
          faqId="faq-1"
          initialHelpful={10}
          initialNotHelpful={2}
        />,
      );

      const yesButton = screen.getByRole("button", { name: /yes/i });

      yesButton.focus();
      fireEvent.keyDown(yesButton, { key: "Enter", code: "Enter" });
      fireEvent.click(yesButton);

      await waitFor(() => {
        expect(mockApiPost).toHaveBeenCalled();
      });
    });

    it("should support keyboard voting with Space", async () => {
      render(
        <FAQHelpfulButtons
          faqId="faq-1"
          initialHelpful={10}
          initialNotHelpful={2}
        />,
      );

      const noButton = screen.getByRole("button", { name: /no/i });

      noButton.focus();
      fireEvent.keyDown(noButton, { key: " ", code: "Space" });
      fireEvent.click(noButton);

      await waitFor(() => {
        expect(mockApiPost).toHaveBeenCalled();
      });
    });

    it("should have disabled attribute when buttons are disabled", async () => {
      render(
        <FAQHelpfulButtons
          faqId="faq-1"
          initialHelpful={10}
          initialNotHelpful={2}
        />,
      );

      const yesButton = screen.getByRole("button", { name: /yes/i });
      const noButton = screen.getByRole("button", { name: /no/i });

      fireEvent.click(yesButton);

      await waitFor(() => {
        expect(yesButton).toHaveAttribute("disabled");
        expect(noButton).toHaveAttribute("disabled");
      });
    });
  });

  describe("Visual States", () => {
    it("should have hover states before voting", () => {
      render(
        <FAQHelpfulButtons
          faqId="faq-1"
          initialHelpful={10}
          initialNotHelpful={2}
        />,
      );

      const yesButton = screen.getByRole("button", { name: /yes/i });
      const noButton = screen.getByRole("button", { name: /no/i });

      expect(yesButton.className).toContain("hover:bg-green");
      expect(noButton.className).toContain("hover:bg-red");
    });

    it("should show transition classes", () => {
      render(
        <FAQHelpfulButtons
          faqId="faq-1"
          initialHelpful={10}
          initialNotHelpful={2}
        />,
      );

      const yesButton = screen.getByRole("button", { name: /yes/i });
      const noButton = screen.getByRole("button", { name: /no/i });

      expect(yesButton).toHaveClass("transition-all");
      expect(noButton).toHaveClass("transition-all");
    });

    it("should have flex layout for buttons", () => {
      const { container } = render(
        <FAQHelpfulButtons
          faqId="faq-1"
          initialHelpful={10}
          initialNotHelpful={2}
        />,
      );

      const buttonContainer = container.querySelector(".flex.gap-3");
      expect(buttonContainer).toBeInTheDocument();
    });
  });
});
