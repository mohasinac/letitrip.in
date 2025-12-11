import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MobileInstallPrompt } from "../MobileInstallPrompt";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(globalThis, "localStorage", {
  value: localStorageMock,
  writable: true,
});

// Mock matchMedia
const createMatchMediaMock = (matches: boolean) =>
  jest.fn().mockImplementation((query) => ({
    matches,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }));

describe("MobileInstallPrompt - PWA Installation", () => {
  let mockBeforeInstallPromptEvent: any;
  let addEventListenerSpy: jest.SpyInstance | undefined;
  let removeEventListenerSpy: jest.SpyInstance | undefined;

  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
    jest.useFakeTimers();

    // Reset navigator using delete and redefine
    delete (globalThis as any).navigator;
    (globalThis as any).navigator = {
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    };

    // Reset matchMedia using delete and redefine
    delete (globalThis as any).matchMedia;
    (globalThis as any).matchMedia = createMatchMediaMock(false);

    // Create mock beforeinstallprompt event
    mockBeforeInstallPromptEvent = {
      preventDefault: jest.fn(),
      prompt: jest.fn().mockResolvedValue(undefined),
      userChoice: Promise.resolve({ outcome: "accepted" }),
    };

    // Spy on addEventListener/removeEventListener
    if (globalThis.addEventListener) {
      addEventListenerSpy = jest.spyOn(globalThis, "addEventListener");
    }
    if (globalThis.removeEventListener) {
      removeEventListenerSpy = jest.spyOn(globalThis, "removeEventListener");
    }
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    addEventListenerSpy?.mockRestore();
    removeEventListenerSpy?.mockRestore();
    addEventListenerSpy = undefined;
    removeEventListenerSpy = undefined;
  });

  describe("Basic Rendering", () => {
    it("should not render initially (waiting for event)", () => {
      render(<MobileInstallPrompt />);
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("should register beforeinstallprompt listener on mount", () => {
      render(<MobileInstallPrompt />);
      expect(addEventListenerSpy).toHaveBeenCalledWith(
        "beforeinstallprompt",
        expect.any(Function)
      );
    });

    it("should cleanup event listener on unmount", () => {
      const { unmount } = render(<MobileInstallPrompt />);
      unmount();
      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        "beforeinstallprompt",
        expect.any(Function)
      );
    });

    it("should have mobile-only visibility (lg:hidden)", async () => {
      render(<MobileInstallPrompt />);

      // Trigger beforeinstallprompt event
      const handler = addEventListenerSpy.mock.calls.find(
        (call) => call[0] === "beforeinstallprompt"
      )?.[1];
      handler?.(mockBeforeInstallPromptEvent);

      jest.advanceTimersByTime(3000);

      const dialog = await screen.findByRole("dialog");
      expect(dialog).toHaveClass("lg:hidden");
    });
  });

  describe("BeforeInstallPrompt Event", () => {
    it("should show prompt after event and delay", async () => {
      render(<MobileInstallPrompt />);

      // Trigger beforeinstallprompt event
      const handler = addEventListenerSpy.mock.calls.find(
        (call) => call[0] === "beforeinstallprompt"
      )?.[1];
      handler?.(mockBeforeInstallPromptEvent);

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

      jest.advanceTimersByTime(3000);

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });
    });

    it("should prevent default on beforeinstallprompt", () => {
      render(<MobileInstallPrompt />);

      const handler = addEventListenerSpy.mock.calls.find(
        (call) => call[0] === "beforeinstallprompt"
      )?.[1];
      handler?.(mockBeforeInstallPromptEvent);

      expect(mockBeforeInstallPromptEvent.preventDefault).toHaveBeenCalled();
    });

    it("should render app icon with gradient", async () => {
      render(<MobileInstallPrompt />);

      const handler = addEventListenerSpy.mock.calls.find(
        (call) => call[0] === "beforeinstallprompt"
      )?.[1];
      handler?.(mockBeforeInstallPromptEvent);

      jest.advanceTimersByTime(3000);

      await waitFor(() => {
        const iconContainer = screen
          .getByRole("dialog")
          .querySelector(".bg-gradient-to-br");
        expect(iconContainer).toBeInTheDocument();
        expect(iconContainer).toHaveClass("from-yellow-400", "to-yellow-600");
      });
    });

    it("should render title with correct ID", async () => {
      render(<MobileInstallPrompt />);

      const handler = addEventListenerSpy.mock.calls.find(
        (call) => call[0] === "beforeinstallprompt"
      )?.[1];
      handler?.(mockBeforeInstallPromptEvent);

      jest.advanceTimersByTime(3000);

      await waitFor(() => {
        const title = screen.getByText("Install Let It Rip");
        expect(title).toHaveAttribute("id", "install-prompt-title");
      });
    });

    it("should render description text", async () => {
      render(<MobileInstallPrompt />);

      const handler = addEventListenerSpy.mock.calls.find(
        (call) => call[0] === "beforeinstallprompt"
      )?.[1];
      handler?.(mockBeforeInstallPromptEvent);

      jest.advanceTimersByTime(3000);

      await waitFor(() => {
        expect(
          screen.getByText("Add to home screen for faster access")
        ).toBeInTheDocument();
      });
    });
  });

  describe("Android/Chrome Install Flow", () => {
    it("should render Install button on non-iOS", async () => {
      render(<MobileInstallPrompt />);

      const handler = addEventListenerSpy.mock.calls.find(
        (call) => call[0] === "beforeinstallprompt"
      )?.[1];
      handler?.(mockBeforeInstallPromptEvent);

      jest.advanceTimersByTime(3000);

      await waitFor(() => {
        expect(screen.getByText("Install")).toBeInTheDocument();
      });
    });

    it("should render Not now button on non-iOS", async () => {
      render(<MobileInstallPrompt />);

      const handler = addEventListenerSpy.mock.calls.find(
        (call) => call[0] === "beforeinstallprompt"
      )?.[1];
      handler?.(mockBeforeInstallPromptEvent);

      jest.advanceTimersByTime(3000);

      await waitFor(() => {
        expect(screen.getByText("Not now")).toBeInTheDocument();
      });
    });

    it("should call prompt() when Install is clicked", async () => {
      render(<MobileInstallPrompt />);

      const handler = addEventListenerSpy.mock.calls.find(
        (call) => call[0] === "beforeinstallprompt"
      )?.[1];
      handler?.(mockBeforeInstallPromptEvent);

      jest.advanceTimersByTime(3000);

      await waitFor(() => {
        expect(screen.getByText("Install")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Install"));

      expect(mockBeforeInstallPromptEvent.prompt).toHaveBeenCalled();
    });

    it("should hide prompt after successful install", async () => {
      render(<MobileInstallPrompt />);

      const handler = addEventListenerSpy.mock.calls.find(
        (call) => call[0] === "beforeinstallprompt"
      )?.[1];
      handler?.(mockBeforeInstallPromptEvent);

      jest.advanceTimersByTime(3000);

      await waitFor(() => {
        expect(screen.getByText("Install")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Install"));

      await waitFor(() => {
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      });
    });

    it("should have Download icon on Install button", async () => {
      render(<MobileInstallPrompt />);

      const handler = addEventListenerSpy.mock.calls.find(
        (call) => call[0] === "beforeinstallprompt"
      )?.[1];
      handler?.(mockBeforeInstallPromptEvent);

      jest.advanceTimersByTime(3000);

      await waitFor(() => {
        const installBtn = screen.getByText("Install").closest("button");
        expect(installBtn?.querySelector("svg")).toBeInTheDocument();
      });
    });

    it("should have yellow background on Install button", async () => {
      render(<MobileInstallPrompt />);

      const handler = addEventListenerSpy.mock.calls.find(
        (call) => call[0] === "beforeinstallprompt"
      )?.[1];
      handler?.(mockBeforeInstallPromptEvent);

      jest.advanceTimersByTime(3000);

      await waitFor(() => {
        const installBtn = screen.getByText("Install").closest("button");
        expect(installBtn).toHaveClass("bg-yellow-500");
      });
    });

    it("should have gray background on Not now button", async () => {
      render(<MobileInstallPrompt />);

      const handler = addEventListenerSpy.mock.calls.find(
        (call) => call[0] === "beforeinstallprompt"
      )?.[1];
      handler?.(mockBeforeInstallPromptEvent);

      jest.advanceTimersByTime(3000);

      await waitFor(() => {
        const notNowBtn = screen.getByText("Not now").closest("button");
        expect(notNowBtn).toHaveClass("bg-gray-100");
      });
    });
  });

  describe("iOS Install Flow", () => {
    beforeEach(() => {
      delete (globalThis as any).navigator;
      (globalThis as any).navigator = {
        userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)",
      };
    });

    it("should detect iOS device", async () => {
      render(<MobileInstallPrompt />);

      jest.advanceTimersByTime(5000);

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });
    });

    it("should show iOS instructions", async () => {
      render(<MobileInstallPrompt />);

      jest.advanceTimersByTime(5000);

      await waitFor(() => {
        expect(screen.getByText(/Tap/)).toBeInTheDocument();
        expect(screen.getByText(/Share/)).toBeInTheDocument();
        expect(screen.getByText(/Add to Home Screen/)).toBeInTheDocument();
      });
    });

    it("should render Share icon for iOS", async () => {
      render(<MobileInstallPrompt />);

      jest.advanceTimersByTime(5000);

      await waitFor(() => {
        const dialog = screen.getByRole("dialog");
        const shareIcon = dialog.querySelector(".text-blue-500");
        expect(shareIcon).toBeInTheDocument();
      });
    });

    it("should show prompt after 5s delay on iOS", async () => {
      render(<MobileInstallPrompt />);

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

      jest.advanceTimersByTime(4999);
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

      jest.advanceTimersByTime(1);

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });
    });

    it("should have bg-gray-50 for iOS instructions", async () => {
      render(<MobileInstallPrompt />);

      jest.advanceTimersByTime(5000);

      await waitFor(() => {
        const instructionsBox = screen
          .getByRole("dialog")
          .querySelector(".bg-gray-50");
        expect(instructionsBox).toBeInTheDocument();
      });
    });
  });

  describe("Dismiss Functionality", () => {
    it("should render close button", async () => {
      render(<MobileInstallPrompt />);

      const handler = addEventListenerSpy.mock.calls.find(
        (call) => call[0] === "beforeinstallprompt"
      )?.[1];
      handler?.(mockBeforeInstallPromptEvent);

      jest.advanceTimersByTime(3000);

      await waitFor(() => {
        expect(screen.getByLabelText("Dismiss")).toBeInTheDocument();
      });
    });

    it("should hide prompt when close button is clicked", async () => {
      render(<MobileInstallPrompt />);

      const handler = addEventListenerSpy.mock.calls.find(
        (call) => call[0] === "beforeinstallprompt"
      )?.[1];
      handler?.(mockBeforeInstallPromptEvent);

      jest.advanceTimersByTime(3000);

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByLabelText("Dismiss"));

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("should save dismiss timestamp to localStorage", async () => {
      render(<MobileInstallPrompt />);

      const handler = addEventListenerSpy.mock.calls.find(
        (call) => call[0] === "beforeinstallprompt"
      )?.[1];
      handler?.(mockBeforeInstallPromptEvent);

      jest.advanceTimersByTime(3000);

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });

      const beforeDismiss = Date.now();
      fireEvent.click(screen.getByLabelText("Dismiss"));

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "pwaPromptDismissed",
        expect.stringMatching(/^\d+$/)
      );

      const savedTime = parseInt(localStorageMock.setItem.mock.calls[0][1], 10);
      expect(savedTime).toBeGreaterThanOrEqual(beforeDismiss);
    });

    it("should hide prompt when Not now is clicked", async () => {
      render(<MobileInstallPrompt />);

      const handler = addEventListenerSpy.mock.calls.find(
        (call) => call[0] === "beforeinstallprompt"
      )?.[1];
      handler?.(mockBeforeInstallPromptEvent);

      jest.advanceTimersByTime(3000);

      await waitFor(() => {
        expect(screen.getByText("Not now")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Not now"));

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("should have X icon in close button", async () => {
      render(<MobileInstallPrompt />);

      const handler = addEventListenerSpy.mock.calls.find(
        (call) => call[0] === "beforeinstallprompt"
      )?.[1];
      handler?.(mockBeforeInstallPromptEvent);

      jest.advanceTimersByTime(3000);

      await waitFor(() => {
        const closeBtn = screen.getByLabelText("Dismiss");
        expect(closeBtn.querySelector("svg")).toBeInTheDocument();
      });
    });
  });

  describe("Already Installed Detection", () => {
    it("should not show prompt if already in standalone mode (matchMedia)", () => {
      delete (globalThis as any).matchMedia;
      (globalThis as any).matchMedia = createMatchMediaMock(true);

      render(<MobileInstallPrompt />);

      const handler = addEventListenerSpy.mock.calls.find(
        (call) => call[0] === "beforeinstallprompt"
      )?.[1];
      handler?.(mockBeforeInstallPromptEvent);

      jest.advanceTimersByTime(3000);

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("should not show prompt if navigator.standalone is true", () => {
      delete (globalThis as any).navigator;
      (globalThis as any).navigator = {
        userAgent: "Mozilla/5.0 (iPhone)",
        standalone: true,
      };

      render(<MobileInstallPrompt />);

      jest.advanceTimersByTime(5000);

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  describe("Recently Dismissed Logic", () => {
    it("should not show if dismissed within last 7 days", () => {
      const twoDaysAgo = Date.now() - 2 * 24 * 60 * 60 * 1000;
      localStorageMock.getItem.mockReturnValue(twoDaysAgo.toString());

      render(<MobileInstallPrompt />);

      const handler = addEventListenerSpy.mock.calls.find(
        (call) => call[0] === "beforeinstallprompt"
      )?.[1];
      handler?.(mockBeforeInstallPromptEvent);

      jest.advanceTimersByTime(3000);

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("should show if dismissed more than 7 days ago", async () => {
      const eightDaysAgo = Date.now() - 8 * 24 * 60 * 60 * 1000;
      localStorageMock.getItem.mockReturnValue(eightDaysAgo.toString());

      render(<MobileInstallPrompt />);

      const handler = addEventListenerSpy.mock.calls.find(
        (call) => call[0] === "beforeinstallprompt"
      )?.[1];
      handler?.(mockBeforeInstallPromptEvent);

      jest.advanceTimersByTime(3000);

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });
    });

    it("should check pwaPromptDismissed key in localStorage", () => {
      render(<MobileInstallPrompt />);

      expect(localStorageMock.getItem).toHaveBeenCalledWith(
        "pwaPromptDismissed"
      );
    });
  });

  describe("Accessibility", () => {
    it("should have role=dialog", async () => {
      render(<MobileInstallPrompt />);

      const handler = addEventListenerSpy.mock.calls.find(
        (call) => call[0] === "beforeinstallprompt"
      )?.[1];
      handler?.(mockBeforeInstallPromptEvent);

      jest.advanceTimersByTime(3000);

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });
    });

    it("should have aria-labelledby pointing to title", async () => {
      render(<MobileInstallPrompt />);

      const handler = addEventListenerSpy.mock.calls.find(
        (call) => call[0] === "beforeinstallprompt"
      )?.[1];
      handler?.(mockBeforeInstallPromptEvent);

      jest.advanceTimersByTime(3000);

      await waitFor(() => {
        const dialog = screen.getByRole("dialog");
        expect(dialog).toHaveAttribute(
          "aria-labelledby",
          "install-prompt-title"
        );
      });
    });

    it("should have touch-target class on buttons", async () => {
      render(<MobileInstallPrompt />);

      const handler = addEventListenerSpy.mock.calls.find(
        (call) => call[0] === "beforeinstallprompt"
      )?.[1];
      handler?.(mockBeforeInstallPromptEvent);

      jest.advanceTimersByTime(3000);

      await waitFor(() => {
        const closeBtn = screen.getByLabelText("Dismiss");
        expect(closeBtn).toHaveClass("touch-target");
      });
    });

    it("should have aria-label on close button", async () => {
      render(<MobileInstallPrompt />);

      const handler = addEventListenerSpy.mock.calls.find(
        (call) => call[0] === "beforeinstallprompt"
      )?.[1];
      handler?.(mockBeforeInstallPromptEvent);

      jest.advanceTimersByTime(3000);

      await waitFor(() => {
        expect(screen.getByLabelText("Dismiss")).toBeInTheDocument();
      });
    });
  });

  describe("Styling & Layout", () => {
    it("should have fixed positioning", async () => {
      render(<MobileInstallPrompt />);

      const handler = addEventListenerSpy.mock.calls.find(
        (call) => call[0] === "beforeinstallprompt"
      )?.[1];
      handler?.(mockBeforeInstallPromptEvent);

      jest.advanceTimersByTime(3000);

      await waitFor(() => {
        const dialog = screen.getByRole("dialog");
        expect(dialog).toHaveClass("fixed");
      });
    });

    it("should position at bottom with margins", async () => {
      render(<MobileInstallPrompt />);

      const handler = addEventListenerSpy.mock.calls.find(
        (call) => call[0] === "beforeinstallprompt"
      )?.[1];
      handler?.(mockBeforeInstallPromptEvent);

      jest.advanceTimersByTime(3000);

      await waitFor(() => {
        const dialog = screen.getByRole("dialog");
        expect(dialog).toHaveClass("bottom-20", "left-4", "right-4");
      });
    });

    it("should have high z-index (z-50)", async () => {
      render(<MobileInstallPrompt />);

      const handler = addEventListenerSpy.mock.calls.find(
        (call) => call[0] === "beforeinstallprompt"
      )?.[1];
      handler?.(mockBeforeInstallPromptEvent);

      jest.advanceTimersByTime(3000);

      await waitFor(() => {
        const dialog = screen.getByRole("dialog");
        expect(dialog).toHaveClass("z-50");
      });
    });

    it("should have rounded corners", async () => {
      render(<MobileInstallPrompt />);

      const handler = addEventListenerSpy.mock.calls.find(
        (call) => call[0] === "beforeinstallprompt"
      )?.[1];
      handler?.(mockBeforeInstallPromptEvent);

      jest.advanceTimersByTime(3000);

      await waitFor(() => {
        const dialog = screen.getByRole("dialog");
        expect(dialog).toHaveClass("rounded-xl");
      });
    });

    it("should have white background", async () => {
      render(<MobileInstallPrompt />);

      const handler = addEventListenerSpy.mock.calls.find(
        (call) => call[0] === "beforeinstallprompt"
      )?.[1];
      handler?.(mockBeforeInstallPromptEvent);

      jest.advanceTimersByTime(3000);

      await waitFor(() => {
        const dialog = screen.getByRole("dialog");
        expect(dialog).toHaveClass("bg-white");
      });
    });

    it("should have shadow and border", async () => {
      render(<MobileInstallPrompt />);

      const handler = addEventListenerSpy.mock.calls.find(
        (call) => call[0] === "beforeinstallprompt"
      )?.[1];
      handler?.(mockBeforeInstallPromptEvent);

      jest.advanceTimersByTime(3000);

      await waitFor(() => {
        const dialog = screen.getByRole("dialog");
        expect(dialog).toHaveClass("shadow-xl", "border", "border-gray-200");
      });
    });

    it("should have slide-up animation", async () => {
      render(<MobileInstallPrompt />);

      const handler = addEventListenerSpy.mock.calls.find(
        (call) => call[0] === "beforeinstallprompt"
      )?.[1];
      handler?.(mockBeforeInstallPromptEvent);

      jest.advanceTimersByTime(3000);

      await waitFor(() => {
        const dialog = screen.getByRole("dialog");
        expect(dialog).toHaveClass("animate-slide-up");
      });
    });

    it("should have safe area inset", async () => {
      render(<MobileInstallPrompt />);

      const handler = addEventListenerSpy.mock.calls.find(
        (call) => call[0] === "beforeinstallprompt"
      )?.[1];
      handler?.(mockBeforeInstallPromptEvent);

      jest.advanceTimersByTime(3000);

      await waitFor(() => {
        const dialog = screen.getByRole("dialog");
        expect(dialog).toHaveClass("safe-area-inset-bottom");
      });
    });
  });

  describe("Edge Cases", () => {
    it("should handle missing matchMedia", async () => {
      delete (globalThis as any).matchMedia;
      (globalThis as any).matchMedia = undefined;

      render(<MobileInstallPrompt />);

      const handler = addEventListenerSpy.mock.calls.find(
        (call) => call[0] === "beforeinstallprompt"
      )?.[1];
      handler?.(mockBeforeInstallPromptEvent);

      jest.advanceTimersByTime(3000);

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });
    });

    it("should handle missing addEventListener", () => {
      const originalAddEventListener = globalThis.addEventListener;
      delete (globalThis as any).addEventListener;
      (globalThis as any).addEventListener = undefined;

      expect(() => render(<MobileInstallPrompt />)).not.toThrow();

      (globalThis as any).addEventListener = originalAddEventListener;
    });

    it("should handle user dismissing install dialog", async () => {
      const dismissedEvent = {
        preventDefault: jest.fn(),
        prompt: jest.fn().mockResolvedValue(undefined),
        userChoice: Promise.resolve({ outcome: "dismissed" }),
      };

      render(<MobileInstallPrompt />);

      const handler = addEventListenerSpy.mock.calls.find(
        (call) => call[0] === "beforeinstallprompt"
      )?.[1];
      handler?.(dismissedEvent);

      jest.advanceTimersByTime(3000);

      await waitFor(() => {
        expect(screen.getByText("Install")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Install"));

      // Should still show prompt since user dismissed
      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });
    });

    it("should handle iPad user agent", async () => {
      delete (globalThis as any).navigator;
      (globalThis as any).navigator = {
        userAgent: "Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X)",
      };

      render(<MobileInstallPrompt />);

      jest.advanceTimersByTime(5000);

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
        expect(screen.getByText(/Share/)).toBeInTheDocument();
      });
    });

    it("should handle iPod user agent", async () => {
      delete (globalThis as any).navigator;
      (globalThis as any).navigator = {
        userAgent: "Mozilla/5.0 (iPod touch; CPU iPhone OS 16_0)",
      };

      render(<MobileInstallPrompt />);

      jest.advanceTimersByTime(5000);

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
        expect(screen.getByText(/Share/)).toBeInTheDocument();
      });
    });

    it("should handle exactly 7 days since dismissal", () => {
      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      localStorageMock.getItem.mockReturnValue(sevenDaysAgo.toString());

      render(<MobileInstallPrompt />);

      const handler = addEventListenerSpy.mock.calls.find(
        (call) => call[0] === "beforeinstallprompt"
      )?.[1];
      handler?.(mockBeforeInstallPromptEvent);

      jest.advanceTimersByTime(3000);

      // Should not show at exactly 7 days
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("should render app icon text 'LR'", async () => {
      render(<MobileInstallPrompt />);

      const handler = addEventListenerSpy.mock.calls.find(
        (call) => call[0] === "beforeinstallprompt"
      )?.[1];
      handler?.(mockBeforeInstallPromptEvent);

      jest.advanceTimersByTime(3000);

      await waitFor(() => {
        expect(screen.getByText("LR")).toBeInTheDocument();
      });
    });
  });
});
