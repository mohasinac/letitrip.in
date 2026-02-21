/**
 * useClickOutside Tests — Phase 18.5
 *
 * - Calls callback on click outside the ref element (mousedown + touchstart)
 * - Does NOT call callback on click inside
 * - Respects enabled=false option
 * - Supports custom eventType
 * - Cleans up listeners on unmount
 */

import React, { useRef } from "react";
import { render, fireEvent, screen } from "@testing-library/react";
import { useClickOutside } from "../useClickOutside";

function TestComponent({
  callback,
  enabled = true,
  eventType = "mousedown" as const,
}: {
  callback: jest.Mock;
  enabled?: boolean;
  eventType?: "mousedown" | "mouseup" | "click";
}) {
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, callback, { enabled, eventType });
  return (
    <div>
      <div ref={ref} data-testid="inside">
        Inside
      </div>
      <div data-testid="outside">Outside</div>
    </div>
  );
}

describe("useClickOutside", () => {
  it("calls callback when mousedown occurs outside the ref element", () => {
    const callback = jest.fn();
    render(<TestComponent callback={callback} />);
    fireEvent.mouseDown(screen.getByTestId("outside"));
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("does NOT call callback when mousedown occurs inside the ref element", () => {
    const callback = jest.fn();
    render(<TestComponent callback={callback} />);
    fireEvent.mouseDown(screen.getByTestId("inside"));
    expect(callback).not.toHaveBeenCalled();
  });

  it("does NOT call callback when enabled=false", () => {
    const callback = jest.fn();
    render(<TestComponent callback={callback} enabled={false} />);
    fireEvent.mouseDown(screen.getByTestId("outside"));
    expect(callback).not.toHaveBeenCalled();
  });

  it("also triggers callback on touchstart outside", () => {
    const callback = jest.fn();
    render(<TestComponent callback={callback} />);
    fireEvent.touchStart(screen.getByTestId("outside"));
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("uses custom eventType when provided", () => {
    const callback = jest.fn();
    render(<TestComponent callback={callback} eventType="click" />);
    // mousedown should NOT trigger (hook listens for 'click')
    fireEvent.mouseDown(screen.getByTestId("outside"));
    expect(callback).not.toHaveBeenCalled();
    // click event should trigger
    fireEvent.click(screen.getByTestId("outside"));
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("removes event listeners after unmount", () => {
    const callback = jest.fn();
    const { unmount } = render(<TestComponent callback={callback} />);
    unmount();
    // After unmount, events should no longer fire the callback
    fireEvent.mouseDown(document.body);
    expect(callback).not.toHaveBeenCalled();
  });
});
