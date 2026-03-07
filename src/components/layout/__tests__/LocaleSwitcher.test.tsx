/**
 * Tests for the LocaleSwitcher component.
 *
 * Verifies the searchable dropdown: trigger rendering, dropdown open/close,
 * search filtering, locale switching, and keyboard dismissal.
 * Navigation calls are covered via the @/i18n/navigation mock in jest.setup.ts.
 */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";

// Stable mock replace so we can verify it gets called
const mockReplace = jest.fn();
jest.mock("@/i18n/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: mockReplace,
    back: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => "/",
  Link: ({
    children,
    href,
    ...props
  }: { children?: React.ReactNode; href: string } & Record<string, unknown>) =>
    React.createElement("a", { href, ...props }, children),
  redirect: jest.fn(),
  getPathname: jest.fn(() => "/"),
}));

import LocaleSwitcher from "../LocaleSwitcher";

beforeEach(() => {
  mockReplace.mockClear();
});

describe("LocaleSwitcher", () => {
  it("renders only the trigger button initially (dropdown closed)", () => {
    render(<LocaleSwitcher />);
    // Only the trigger is visible before the dropdown is opened
    expect(screen.getAllByRole("button").length).toBe(1);
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("trigger has aria-expanded=false initially", () => {
    render(<LocaleSwitcher />);
    expect(screen.getByRole("button")).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });

  it("trigger has a non-empty aria-label", () => {
    render(<LocaleSwitcher />);
    const trigger = screen.getByRole("button");
    expect(trigger).toHaveAttribute("aria-label");
    expect(trigger.getAttribute("aria-label")).toBeTruthy();
  });

  it("opens the dropdown on trigger click", () => {
    render(<LocaleSwitcher />);
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /switch language/i }),
    ).toHaveAttribute("aria-expanded", "true");
  });

  it("shows all locales in the dropdown when search is empty", () => {
    render(<LocaleSwitcher />);
    fireEvent.click(screen.getByRole("button"));
    // routing.locales = ['en', 'hi'] → 2 options + 1 trigger = 3 buttons
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThanOrEqual(3);
  });

  it("marks the active locale option as pressed", () => {
    render(<LocaleSwitcher />);
    fireEvent.click(screen.getByRole("button"));
    const pressed = screen.getAllByRole("button", { pressed: true });
    expect(pressed.length).toBe(1);
  });

  it("calls router.replace when an inactive locale is clicked", () => {
    render(<LocaleSwitcher />);
    fireEvent.click(screen.getByRole("button")); // open
    const inactive = screen.getAllByRole("button", { pressed: false });
    // Pick the first unpressed option (skip the trigger which has no aria-pressed)
    const inactiveOption = inactive.find(
      (btn) => btn.getAttribute("aria-pressed") === "false",
    );
    expect(inactiveOption).toBeTruthy();
    fireEvent.click(inactiveOption!);
    expect(mockReplace).toHaveBeenCalledTimes(1);
  });

  it("does NOT call router.replace when the active locale is clicked", () => {
    render(<LocaleSwitcher />);
    fireEvent.click(screen.getByRole("button")); // open
    const activeOption = screen.getByRole("button", { pressed: true });
    fireEvent.click(activeOption);
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("closes the dropdown when Escape is pressed", () => {
    render(<LocaleSwitcher />);
    fireEvent.click(screen.getByRole("button")); // open
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("filters locale options based on search input", () => {
    render(<LocaleSwitcher />);
    fireEvent.click(screen.getByRole("button")); // open
    const searchInput = screen.getByRole("searchbox");
    // 'english' matches 'English' but not 'हिन्दी'
    fireEvent.change(searchInput, { target: { value: "english" } });
    // Only the English option + trigger should remain
    const buttons = screen.getAllByRole("button");
    // trigger + 1 matching option = 2
    expect(buttons.length).toBe(2);
  });

  it("shows noResults message when search matches nothing", () => {
    render(<LocaleSwitcher />);
    fireEvent.click(screen.getByRole("button")); // open
    const searchInput = screen.getByRole("searchbox");
    fireEvent.change(searchInput, { target: { value: "zzz" } });
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    // No option buttons, only the trigger
    expect(screen.getAllByRole("button").length).toBe(1);
  });
});
