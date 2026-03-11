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
    expect(screen.getByRole("combobox")).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });

  it("trigger has a non-empty aria-label", () => {
    render(<LocaleSwitcher />);
    const trigger = screen.getByRole("combobox");
    expect(trigger).toHaveAttribute("aria-label");
    expect(trigger.getAttribute("aria-label")).toBeTruthy();
  });

  it("opens the dropdown on trigger click", () => {
    render(<LocaleSwitcher />);
    fireEvent.click(screen.getByRole("combobox"));
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  });

  it("shows all locales in the dropdown when search is empty", () => {
    render(<LocaleSwitcher />);
    fireEvent.click(screen.getByRole("combobox"));
    // routing.locales → n options all present as option roles
    const options = screen.getAllByRole("option");
    expect(options.length).toBeGreaterThanOrEqual(2);
  });

  it("marks the active locale option as selected", () => {
    render(<LocaleSwitcher />);
    fireEvent.click(screen.getByRole("combobox"));
    const selected = screen.getAllByRole("option", { selected: true });
    expect(selected.length).toBe(1);
  });

  it("calls router.replace when an inactive locale is clicked", () => {
    render(<LocaleSwitcher />);
    fireEvent.click(screen.getByRole("combobox")); // open
    const inactiveOptions = screen.getAllByRole("option", { selected: false });
    expect(inactiveOptions.length).toBeGreaterThan(0);
    const btn = inactiveOptions[0].querySelector("button");
    expect(btn).toBeTruthy();
    fireEvent.click(btn!);
    expect(mockReplace).toHaveBeenCalledTimes(1);
  });

  it("does NOT call router.replace when the active locale is clicked", () => {
    render(<LocaleSwitcher />);
    fireEvent.click(screen.getByRole("combobox")); // open
    const activeOption = screen.getByRole("option", { selected: true });
    const btn = activeOption.querySelector("button");
    expect(btn).toBeTruthy();
    fireEvent.click(btn!);
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("closes the dropdown when Escape is pressed", () => {
    render(<LocaleSwitcher />);
    fireEvent.click(screen.getByRole("combobox")); // open
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("filters locale options based on search input", () => {
    render(<LocaleSwitcher />);
    fireEvent.click(screen.getByRole("combobox")); // open
    const searchInput = screen.getByRole("searchbox");
    // 'english' matches 'English' but not other locales
    fireEvent.change(searchInput, { target: { value: "english" } });
    // Only English option visible
    const options = screen.getAllByRole("option");
    expect(options.length).toBe(1);
  });

  it("shows noResults message when search matches nothing", () => {
    render(<LocaleSwitcher />);
    fireEvent.click(screen.getByRole("combobox")); // open
    const searchInput = screen.getByRole("searchbox");
    fireEvent.change(searchInput, { target: { value: "zzz" } });
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    // No option elements when no results
    expect(screen.queryAllByRole("option").length).toBe(0);
  });
});
