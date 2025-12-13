import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { LanguageSelector } from "../LanguageSelector";

// Mock i18n config module to prevent initialization errors
jest.mock("@/lib/i18n/config", () => ({
  LANGUAGES: {
    "en-IN": { name: "English", nativeName: "English" },
    hi: { name: "Hindi", nativeName: "हिन्दी" },
    ta: { name: "Tamil", nativeName: "தமிழ்" },
    te: { name: "Telugu", nativeName: "తెలుగు" },
    bn: { name: "Bengali", nativeName: "বাংলা" },
  },
}));

// Get the mocked LANGUAGES for use in tests
const { LANGUAGES } = jest.requireMock("@/lib/i18n/config");

// Mock lucide-react icons
jest.mock("lucide-react", () => ({
  Globe: jest.fn(() => <div data-testid="globe-icon" />),
  Check: jest.fn(() => <div data-testid="check-icon" />),
}));

// Mock react-i18next
const mockChangeLanguage = jest.fn();
const mockUseTranslation = {
  i18n: {
    language: "en-IN",
    changeLanguage: mockChangeLanguage,
  },
};

jest.mock("react-i18next", () => ({
  useTranslation: () => mockUseTranslation,
  initReactI18next: {
    type: "3rdParty",
    init: jest.fn(),
  },
}));

describe("LanguageSelector Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseTranslation.i18n.language = "en-IN";
  });

  describe("Basic Rendering", () => {
    it("should render language selector button", () => {
      render(<LanguageSelector />);
      const button = screen.getByRole("button", { name: /select language/i });
      expect(button).toBeInTheDocument();
    });

    it("should display current language native name", () => {
      render(<LanguageSelector />);
      expect(screen.getByText("English")).toBeInTheDocument();
    });

    it("should render Globe icon", () => {
      render(<LanguageSelector />);
      expect(screen.getByTestId("globe-icon")).toBeInTheDocument();
    });

    it("should not render dropdown initially", () => {
      render(<LanguageSelector />);
      const hindiOption = screen.queryByText("Hindi");
      expect(hindiOption).not.toBeInTheDocument();
    });
  });

  describe("Dropdown Toggle", () => {
    it("should open dropdown when button clicked", () => {
      render(<LanguageSelector />);
      const button = screen.getByRole("button", { name: /select language/i });
      fireEvent.click(button);

      expect(screen.getByText("हिन्दी")).toBeInTheDocument();
    });

    it("should close dropdown when button clicked again", () => {
      render(<LanguageSelector />);
      const button = screen.getByRole("button", { name: /select language/i });

      fireEvent.click(button);
      expect(screen.getByText("हिन्दी")).toBeInTheDocument();

      fireEvent.click(button);
      expect(screen.queryByText("हिन्दी")).not.toBeInTheDocument();
    });

    it("should set aria-expanded=true when dropdown is open", () => {
      render(<LanguageSelector />);
      const button = screen.getByRole("button", { name: /select language/i });

      fireEvent.click(button);
      expect(button).toHaveAttribute("aria-expanded", "true");
    });

    it("should set aria-expanded=false when dropdown is closed", () => {
      render(<LanguageSelector />);
      const button = screen.getByRole("button", { name: /select language/i });

      expect(button).toHaveAttribute("aria-expanded", "false");
    });
  });

  describe("Language Options", () => {
    it("should display all available languages", () => {
      render(<LanguageSelector />);
      const button = screen.getByRole("button", { name: /select language/i });
      fireEvent.click(button);

      Object.entries(LANGUAGES).forEach(([, { nativeName }]) => {
        const elements = screen.getAllByText(nativeName);
        expect(elements.length).toBeGreaterThan(0);
      });
    });

    it("should display native name and English name for each language", () => {
      render(<LanguageSelector />);
      const button = screen.getByRole("button", { name: /select language/i });
      fireEvent.click(button);

      expect(screen.getByText("हिन्दी")).toBeInTheDocument();
      expect(screen.getByText("Hindi")).toBeInTheDocument();
    });

    it("should highlight current language option", () => {
      render(<LanguageSelector />);
      const button = screen.getByRole("button", { name: /select language/i });
      fireEvent.click(button);

      const englishTexts = screen.getAllByText("English");
      const englishOption = englishTexts
        .find((el) => {
          const btn = el.closest("button");
          return btn && btn !== button && btn.className.includes("w-full");
        })
        ?.closest("button");
      expect(englishOption?.className).toContain("text-yellow-600");
    });

    it("should show check icon for current language", () => {
      render(<LanguageSelector />);
      const button = screen.getByRole("button", { name: /select language/i });
      fireEvent.click(button);

      const checkIcons = screen.getAllByTestId("check-icon");
      expect(checkIcons.length).toBeGreaterThan(0);
    });
  });

  describe("Language Change", () => {
    it("should call changeLanguage when language option clicked", () => {
      render(<LanguageSelector />);
      const button = screen.getByRole("button", { name: /select language/i });
      fireEvent.click(button);

      const hindiOption = screen.getByText("हिन्दी").closest("button");
      fireEvent.click(hindiOption!);

      expect(mockChangeLanguage).toHaveBeenCalledWith("hi");
    });

    it("should close dropdown after language selection", () => {
      render(<LanguageSelector />);
      const button = screen.getByRole("button", { name: /select language/i });
      fireEvent.click(button);

      const hindiOption = screen.getByText("हिन्दी").closest("button");
      fireEvent.click(hindiOption!);

      expect(screen.queryByText("हिन्दी")).not.toBeInTheDocument();
    });

    it("should change language to Tamil", () => {
      render(<LanguageSelector />);
      const button = screen.getByRole("button", { name: /select language/i });
      fireEvent.click(button);

      const tamilOption = screen.getByText("தமிழ்").closest("button");
      fireEvent.click(tamilOption!);

      expect(mockChangeLanguage).toHaveBeenCalledWith("ta");
    });

    it("should change language to Bengali", () => {
      render(<LanguageSelector />);
      const button = screen.getByRole("button", { name: /select language/i });
      fireEvent.click(button);

      const bengaliOption = screen.getByText("বাংলা").closest("button");
      fireEvent.click(bengaliOption!);

      expect(mockChangeLanguage).toHaveBeenCalledWith("bn");
    });
  });

  describe("Click Outside to Close", () => {
    it("should close dropdown when clicking outside", async () => {
      render(
        <div>
          <LanguageSelector />
          <div data-testid="outside">Outside element</div>
        </div>
      );

      const button = screen.getByRole("button", { name: /select language/i });
      fireEvent.click(button);

      expect(screen.getByText("हिन्दी")).toBeInTheDocument();

      const outside = screen.getByTestId("outside");
      fireEvent.mouseDown(outside);

      await waitFor(() => {
        expect(screen.queryByText("हिन्दी")).not.toBeInTheDocument();
      });
    });

    it("should not close dropdown when clicking inside dropdown", async () => {
      render(<LanguageSelector />);
      const button = screen.getByRole("button", { name: /select language/i });
      fireEvent.click(button);

      const dropdown = screen.getByText("हिन्दी").closest("div");
      fireEvent.mouseDown(dropdown!);

      await waitFor(() => {
        expect(screen.getByText("हिन्दी")).toBeInTheDocument();
      });
    });

    it("should cleanup event listener on unmount", () => {
      const { unmount } = render(<LanguageSelector />);
      const button = screen.getByRole("button", { name: /select language/i });
      fireEvent.click(button);

      const removeEventListenerSpy = jest.spyOn(
        document,
        "removeEventListener"
      );
      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        "mousedown",
        expect.any(Function)
      );
    });
  });

  describe("Current Language Display", () => {
    it("should display Hindi when current language is Hindi", () => {
      mockUseTranslation.i18n.language = "hi";
      render(<LanguageSelector />);

      expect(screen.getByText("हिन्दी")).toBeInTheDocument();
    });

    it("should display Tamil when current language is Tamil", () => {
      mockUseTranslation.i18n.language = "ta";
      render(<LanguageSelector />);

      expect(screen.getByText("தமிழ்")).toBeInTheDocument();
    });

    it("should display Bengali when current language is Bengali", () => {
      mockUseTranslation.i18n.language = "bn";
      render(<LanguageSelector />);

      expect(screen.getByText("বাংলা")).toBeInTheDocument();
    });

    it("should fallback to English for unknown language code", () => {
      mockUseTranslation.i18n.language = "unknown" as any;
      render(<LanguageSelector />);

      expect(screen.getByText("English")).toBeInTheDocument();
    });
  });

  describe("Styling and Layout", () => {
    it("should apply custom className to root element", () => {
      const { container } = render(
        <LanguageSelector className="custom-class" />
      );
      const root = container.firstChild as HTMLElement;

      expect(root).toHaveClass("custom-class");
      expect(root).toHaveClass("relative");
    });

    it("should position dropdown absolutely on right side", () => {
      render(<LanguageSelector />);
      const button = screen.getByRole("button", { name: /select language/i });
      fireEvent.click(button);

      // The dropdown is the parent of py-2 div containing buttons
      const dropdown = screen.getByText("हिन्दी").closest("button")
        ?.parentElement?.parentElement;
      expect(dropdown?.className).toContain("absolute");
      expect(dropdown?.className).toContain("right-0");
    });

    it("should apply hover styles to language button", () => {
      render(<LanguageSelector />);
      const button = screen.getByRole("button", { name: /select language/i });

      expect(button).toHaveClass("hover:bg-gray-100", "dark:hover:bg-gray-800");
    });

    it("should apply hover styles to language options", () => {
      render(<LanguageSelector />);
      const button = screen.getByRole("button", { name: /select language/i });
      fireEvent.click(button);

      const hindiOption = screen.getByText("हिन्दी").closest("button");
      expect(hindiOption).toHaveClass(
        "hover:bg-gray-100",
        "dark:hover:bg-gray-700"
      );
    });

    it("should apply z-50 to dropdown for layering", () => {
      render(<LanguageSelector />);
      const button = screen.getByRole("button", { name: /select language/i });
      fireEvent.click(button);

      // The dropdown is the parent of py-2 div containing buttons
      const dropdown = screen.getByText("हिन्दी").closest("button")
        ?.parentElement?.parentElement;
      expect(dropdown?.className).toContain("z-50");
    });
  });

  describe("Accessibility", () => {
    it("should have aria-label on language button", () => {
      render(<LanguageSelector />);
      const button = screen.getByRole("button", { name: /select language/i });

      expect(button).toHaveAttribute("aria-label", "Select language");
    });

    it("should update aria-expanded based on dropdown state", () => {
      render(<LanguageSelector />);
      const button = screen.getByRole("button", { name: /select language/i });

      expect(button).toHaveAttribute("aria-expanded", "false");

      fireEvent.click(button);
      expect(button).toHaveAttribute("aria-expanded", "true");

      fireEvent.click(button);
      expect(button).toHaveAttribute("aria-expanded", "false");
    });

    it("should render language options as buttons", () => {
      render(<LanguageSelector />);
      const button = screen.getByRole("button", { name: /select language/i });
      fireEvent.click(button);

      const hindiOption = screen.getByText("हिन्दी").closest("button");
      expect(hindiOption).toHaveAttribute("type", "button");
    });
  });

  describe("Dark Mode Support", () => {
    it("should apply dark mode classes to button", () => {
      render(<LanguageSelector />);
      const button = screen.getByRole("button", { name: /select language/i });

      expect(button).toHaveClass("dark:hover:bg-gray-800");
    });

    it("should apply dark mode classes to dropdown", () => {
      render(<LanguageSelector />);
      const button = screen.getByRole("button", { name: /select language/i });
      fireEvent.click(button);

      const dropdown = screen.getByText("हिन्दी").closest("button")
        ?.parentElement?.parentElement;
      expect(dropdown).toHaveClass("dark:bg-gray-800", "dark:border-gray-700");
    });

    it("should apply dark mode classes to language options", () => {
      render(<LanguageSelector />);
      const button = screen.getByRole("button", { name: /select language/i });
      fireEvent.click(button);

      const hindiOption = screen.getByText("हिन्दी").closest("button");
      expect(hindiOption).toHaveClass(
        "dark:hover:bg-gray-700",
        "dark:text-gray-300"
      );
    });

    it("should apply dark mode classes to selected language", () => {
      render(<LanguageSelector />);
      const button = screen.getByRole("button", { name: /select language/i });
      fireEvent.click(button);

      const englishTexts = screen.getAllByText("English");
      const englishOption = englishTexts
        .find((el) => {
          const btn = el.closest("button");
          return btn && btn !== button && btn.className.includes("w-full");
        })
        ?.closest("button");
      expect(englishOption?.className).toContain("dark:text-yellow-500");
    });
  });

  describe("Edge Cases", () => {
    it("should handle rapid dropdown toggle", () => {
      render(<LanguageSelector />);
      const button = screen.getByRole("button", { name: /select language/i });

      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);

      expect(screen.getByText("हिन्दी")).toBeInTheDocument();
    });

    it("should handle clicking same language option", () => {
      render(<LanguageSelector />);
      const button = screen.getByRole("button", { name: /select language/i });
      fireEvent.click(button);

      // Use getAllByText since "English" appears in both nativeName and name
      const englishTexts = screen.getAllByText("English");
      const englishOption = englishTexts
        .find((el) => el.closest("button") !== button)
        ?.closest("button");

      // Clear any previous calls from setup
      mockChangeLanguage.mockClear();

      fireEvent.click(englishOption!);

      expect(mockChangeLanguage).toHaveBeenCalledWith("en-IN");
    });

    it("should handle multiple language changes", () => {
      render(<LanguageSelector />);
      const button = screen.getByRole("button", { name: /select language/i });

      fireEvent.click(button);
      const hindiOption = screen.getByText("हिन्दी").closest("button");
      fireEvent.click(hindiOption!);

      fireEvent.click(button);
      const tamilOption = screen.getByText("தமிழ்").closest("button");
      fireEvent.click(tamilOption!);

      expect(mockChangeLanguage).toHaveBeenCalledTimes(2);
    });

    it("should not throw error with empty className", () => {
      expect(() => render(<LanguageSelector className="" />)).not.toThrow();
    });
  });

  describe("Multiple Instances", () => {
    it("should support multiple language selectors independently", () => {
      render(
        <div>
          <LanguageSelector className="selector-1" />
          <LanguageSelector className="selector-2" />
        </div>
      );

      const buttons = screen.getAllByRole("button", {
        name: /select language/i,
      });
      expect(buttons).toHaveLength(2);

      fireEvent.click(buttons[0]);
      expect(screen.getAllByText("हिन्दी")).toHaveLength(1);
    });
  });
});
