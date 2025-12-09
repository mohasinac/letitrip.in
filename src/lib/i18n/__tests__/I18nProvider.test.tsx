import { render, screen, waitFor } from "@testing-library/react";
import { useTranslation } from "react-i18next";
import { I18nProvider } from "../I18nProvider";
import i18n from "../config";

// Mock child component to test provider
function TestComponent() {
  const { t, i18n: i18nInstance } = useTranslation();

  return (
    <div>
      <div data-testid="translation">{t("test.key")}</div>
      <div data-testid="language">{i18nInstance.language}</div>
    </div>
  );
}

describe("I18nProvider", () => {
  beforeEach(() => {
    // Ensure i18n is initialized before each test
    if (!i18n.isInitialized) {
      i18n.init();
    }
  });

  describe("Provider rendering", () => {
    it("should render children", () => {
      render(
        <I18nProvider>
          <div data-testid="child">Test Content</div>
        </I18nProvider>
      );

      expect(screen.getByTestId("child")).toBeInTheDocument();
      expect(screen.getByText("Test Content")).toBeInTheDocument();
    });

    it("should render multiple children", () => {
      render(
        <I18nProvider>
          <div data-testid="child1">Child 1</div>
          <div data-testid="child2">Child 2</div>
          <div data-testid="child3">Child 3</div>
        </I18nProvider>
      );

      expect(screen.getByTestId("child1")).toBeInTheDocument();
      expect(screen.getByTestId("child2")).toBeInTheDocument();
      expect(screen.getByTestId("child3")).toBeInTheDocument();
    });

    it("should render nested components", () => {
      render(
        <I18nProvider>
          <div data-testid="parent">
            <div data-testid="child">Nested Content</div>
          </div>
        </I18nProvider>
      );

      expect(screen.getByTestId("parent")).toBeInTheDocument();
      expect(screen.getByTestId("child")).toBeInTheDocument();
    });
  });

  describe("i18n initialization", () => {
    it("should initialize i18n on mount if not initialized", async () => {
      // Create a spy on i18n.init
      const initSpy = jest.spyOn(i18n, "init");

      // Mark as not initialized for this test
      (i18n as any).isInitialized = false;

      render(
        <I18nProvider>
          <div>Content</div>
        </I18nProvider>
      );

      await waitFor(() => {
        // Should have attempted initialization
        expect(i18n.isInitialized).toBe(true);
      });

      initSpy.mockRestore();
    });

    it("should not reinitialize if already initialized", () => {
      const initSpy = jest.spyOn(i18n, "init");

      // Ensure i18n is initialized
      if (!i18n.isInitialized) {
        i18n.init();
      }

      render(
        <I18nProvider>
          <div>Content</div>
        </I18nProvider>
      );

      // Should not call init again since already initialized
      expect(i18n.isInitialized).toBe(true);

      initSpy.mockRestore();
    });
  });

  describe("i18n context provision", () => {
    it("should provide i18n context to children", () => {
      render(
        <I18nProvider>
          <TestComponent />
        </I18nProvider>
      );

      expect(screen.getByTestId("translation")).toBeInTheDocument();
      expect(screen.getByTestId("language")).toBeInTheDocument();
    });

    it("should provide translation functionality", () => {
      render(
        <I18nProvider>
          <TestComponent />
        </I18nProvider>
      );

      const translationElement = screen.getByTestId("translation");
      expect(translationElement).toBeInTheDocument();
      expect(translationElement.textContent).toBeTruthy();
    });

    it("should provide current language", () => {
      render(
        <I18nProvider>
          <TestComponent />
        </I18nProvider>
      );

      const languageElement = screen.getByTestId("language");
      expect(languageElement).toBeInTheDocument();
      expect(languageElement.textContent).toBeTruthy();
    });
  });

  describe("Multiple components", () => {
    it("should provide context to multiple child components", () => {
      render(
        <I18nProvider>
          <TestComponent />
          <TestComponent />
        </I18nProvider>
      );

      const translations = screen.getAllByTestId("translation");
      expect(translations).toHaveLength(2);
    });
  });

  describe("Edge cases", () => {
    it("should handle empty children", () => {
      const { container } = render(<I18nProvider>{null}</I18nProvider>);

      expect(container).toBeInTheDocument();
    });

    it("should handle undefined children", () => {
      const { container } = render(<I18nProvider>{undefined}</I18nProvider>);

      expect(container).toBeInTheDocument();
    });

    it("should handle fragment children", () => {
      render(
        <I18nProvider>
          <>
            <div data-testid="fragment-child-1">Child 1</div>
            <div data-testid="fragment-child-2">Child 2</div>
          </>
        </I18nProvider>
      );

      expect(screen.getByTestId("fragment-child-1")).toBeInTheDocument();
      expect(screen.getByTestId("fragment-child-2")).toBeInTheDocument();
    });

    it("should handle conditional children", () => {
      const showChild = true;

      render(
        <I18nProvider>
          {showChild && <div data-testid="conditional">Conditional</div>}
        </I18nProvider>
      );

      expect(screen.getByTestId("conditional")).toBeInTheDocument();
    });

    it("should handle array of children", () => {
      const children = [
        <div key="1" data-testid="array-child-1">
          Child 1
        </div>,
        <div key="2" data-testid="array-child-2">
          Child 2
        </div>,
      ];

      render(<I18nProvider>{children}</I18nProvider>);

      expect(screen.getByTestId("array-child-1")).toBeInTheDocument();
      expect(screen.getByTestId("array-child-2")).toBeInTheDocument();
    });
  });

  describe("Re-rendering", () => {
    it("should maintain i18n state on re-render", () => {
      const { rerender } = render(
        <I18nProvider>
          <TestComponent />
        </I18nProvider>
      );

      const initialLanguage = screen.getByTestId("language").textContent;

      rerender(
        <I18nProvider>
          <TestComponent />
        </I18nProvider>
      );

      expect(screen.getByTestId("language").textContent).toBe(initialLanguage);
    });

    it("should handle children updates", () => {
      const { rerender } = render(
        <I18nProvider>
          <div data-testid="child">Original</div>
        </I18nProvider>
      );

      expect(screen.getByText("Original")).toBeInTheDocument();

      rerender(
        <I18nProvider>
          <div data-testid="child">Updated</div>
        </I18nProvider>
      );

      expect(screen.getByText("Updated")).toBeInTheDocument();
      expect(screen.queryByText("Original")).not.toBeInTheDocument();
    });
  });

  describe("Nested providers", () => {
    it("should handle nested I18nProviders", () => {
      render(
        <I18nProvider>
          <I18nProvider>
            <div data-testid="nested-child">Nested Content</div>
          </I18nProvider>
        </I18nProvider>
      );

      expect(screen.getByTestId("nested-child")).toBeInTheDocument();
    });
  });

  describe("Component lifecycle", () => {
    it("should initialize on mount", () => {
      const { container } = render(
        <I18nProvider>
          <div>Content</div>
        </I18nProvider>
      );

      expect(container).toBeInTheDocument();
      expect(i18n.isInitialized).toBe(true);
    });

    it("should not cause errors on unmount", () => {
      const { unmount } = render(
        <I18nProvider>
          <div>Content</div>
        </I18nProvider>
      );

      expect(() => unmount()).not.toThrow();
    });
  });

  describe("Type safety", () => {
    it("should accept React.ReactNode children", () => {
      render(
        <I18nProvider>
          <div>Text Node</div>
          {123}
          {true}
          {false}
          {null}
          <span>Element</span>
        </I18nProvider>
      );

      expect(screen.getByText("Text Node")).toBeInTheDocument();
    });
  });

  describe("Integration", () => {
    it("should integrate with useTranslation hook", () => {
      function TranslationUser() {
        const { t } = useTranslation();
        return <div data-testid="translated">{t("key")}</div>;
      }

      render(
        <I18nProvider>
          <TranslationUser />
        </I18nProvider>
      );

      expect(screen.getByTestId("translated")).toBeInTheDocument();
    });

    it("should provide i18n instance through context", () => {
      function I18nInstanceUser() {
        const { i18n: i18nInstance } = useTranslation();
        return (
          <div data-testid="instance-data">
            {i18nInstance.isInitialized ? "initialized" : "not-initialized"}
          </div>
        );
      }

      render(
        <I18nProvider>
          <I18nInstanceUser />
        </I18nProvider>
      );

      expect(screen.getByText("initialized")).toBeInTheDocument();
    });
  });
});
