/**
 * useGesture Tests — Phase 18.5
 *
 * - Single tap (mousedown + mouseup with negligible movement) calls onTap
 * - Two consecutive taps call onDoubleTap
 * - Movement exceeding tapMovementThreshold does NOT fire onTap
 * - Cleans up on unmount
 */

import React, { useRef } from "react";
import { render, fireEvent, screen, act } from "@testing-library/react";
import { useGesture, UseGestureOptions } from "../useGesture";

function TestComponent(options: UseGestureOptions) {
  const ref = useRef<HTMLDivElement>(null);
  useGesture(ref, options);
  return (
    <div
      ref={ref}
      data-testid="gesture-target"
      style={{ width: 200, height: 200 }}
    />
  );
}

/** Simulate a single tap via mousedown + mouseup at the same position */
function simulateTap(element: HTMLElement, x = 50, y = 50) {
  act(() => {
    fireEvent.mouseDown(element, { clientX: x, clientY: y });
    fireEvent.mouseUp(element, { clientX: x, clientY: y });
  });
}

describe("useGesture", () => {
  it("calls onTap on mousedown + mouseup at same position", () => {
    const onTap = jest.fn();
    render(<TestComponent onTap={onTap} />);
    simulateTap(screen.getByTestId("gesture-target"), 50, 50);
    expect(onTap).toHaveBeenCalledWith(50, 50);
  });

  it("calls onDoubleTap on two consecutive quick taps", () => {
    const onDoubleTap = jest.fn();
    const onTap = jest.fn();
    render(<TestComponent onDoubleTap={onDoubleTap} onTap={onTap} />);
    const el = screen.getByTestId("gesture-target");
    // First tap → single tap stored, onTap fires
    simulateTap(el, 50, 50);
    expect(onTap).toHaveBeenCalledTimes(1);
    // Second tap immediately → timeSinceLastTap ≈ 0 < 300 → onDoubleTap fires
    simulateTap(el, 50, 50);
    expect(onDoubleTap).toHaveBeenCalledWith(50, 50);
  });

  it("does NOT call onTap when movement exceeds tapMovementThreshold", () => {
    const onTap = jest.fn();
    render(<TestComponent onTap={onTap} tapMovementThreshold={10} />);
    const el = screen.getByTestId("gesture-target");
    act(() => {
      fireEvent.mouseDown(el, { clientX: 0, clientY: 0 });
      // Move 20px — exceeds threshold of 10
      fireEvent.mouseUp(el, { clientX: 20, clientY: 0 });
    });
    expect(onTap).not.toHaveBeenCalled();
  });

  it("removes event listeners on unmount", () => {
    const onTap = jest.fn();
    const { unmount } = render(<TestComponent onTap={onTap} />);
    unmount();
    act(() => {
      fireEvent.mouseDown(document.body);
      fireEvent.mouseUp(document.body);
    });
    expect(onTap).not.toHaveBeenCalled();
  });

  it("passes coordinates to onTap callback", () => {
    const onTap = jest.fn();
    render(<TestComponent onTap={onTap} />);
    simulateTap(screen.getByTestId("gesture-target"), 75, 120);
    expect(onTap).toHaveBeenCalledWith(75, 120);
  });
});
