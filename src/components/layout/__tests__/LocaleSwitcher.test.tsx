/**
 * Tests for the LocaleSwitcher component.
 *
 * Verifies rendering, active-locale highlighting, and ARIA attributes.
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
  it("renders a button for each supported locale", () => {
    render(<LocaleSwitcher />);
    // The routing config has ['en', 'hi'] locales
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBe(2);
  });

  it("marks the active locale button as pressed", () => {
    render(<LocaleSwitcher />);
    // useLocale() returns "en" in tests
    const activeBtn = screen.getByRole("button", { pressed: true });
    expect(activeBtn).toBeTruthy();
  });

  it("marks inactive locale button as not pressed", () => {
    render(<LocaleSwitcher />);
    const notPressed = screen.getAllByRole("button", { pressed: false });
    expect(notPressed.length).toBe(1);
  });

  it("has an accessible group label via aria-label", () => {
    render(<LocaleSwitcher />);
    const group = screen.getByRole("group");
    expect(group).toHaveAttribute("aria-label");
    expect(group.getAttribute("aria-label")).toBeTruthy();
  });

  it("calls router.replace when an inactive locale is clicked", () => {
    render(<LocaleSwitcher />);
    const inactiveBtn = screen.getByRole("button", { pressed: false });
    fireEvent.click(inactiveBtn);
    expect(mockReplace).toHaveBeenCalledTimes(1);
  });

  it("does NOT call router.replace when the active locale is clicked", () => {
    render(<LocaleSwitcher />);
    const activeBtn = screen.getByRole("button", { pressed: true });
    fireEvent.click(activeBtn);
    expect(mockReplace).not.toHaveBeenCalled();
  });
});
