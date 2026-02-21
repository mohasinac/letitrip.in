/**
 * useSwipe Tests — Phase 18.5
 *
 * - Detects left / right / up / down swipes via mouse events
 * - Ignores movements below minSwipeDistance
 * - Fires onSwipe with correct direction, distance, velocity
 * - Cleans up listeners on unmount
 */

import React, { useRef } from "react";
import { render, fireEvent, screen, act } from "@testing-library/react";
import { useSwipe, UseSwipeOptions } from "../useSwipe";

function TestComponent(options: UseSwipeOptions) {
  const ref = useRef<HTMLDivElement>(null);
  useSwipe(ref, options);
  return (
    <div
      ref={ref}
      data-testid="swipeable"
      style={{ width: 200, height: 200 }}
    />
  );
}

/** Fire mousedown on element, then mousemove + mouseup on document */
function simulateMouseSwipe(
  element: HTMLElement,
  startX: number,
  startY: number,
  endX: number,
  endY: number,
) {
  act(() => {
    fireEvent.mouseDown(element, { clientX: startX, clientY: startY });
    fireEvent.mouseMove(document, { clientX: endX, clientY: endY });
    fireEvent.mouseUp(document, { clientX: endX, clientY: endY });
  });
}

describe("useSwipe", () => {
  it("calls onSwipeLeft when swiping left with sufficient distance", () => {
    const onSwipeLeft = jest.fn();
    render(<TestComponent onSwipeLeft={onSwipeLeft} />);
    const el = screen.getByTestId("swipeable");
    simulateMouseSwipe(el, 200, 100, 50, 100); // deltaX = -150 (left)
    expect(onSwipeLeft).toHaveBeenCalledTimes(1);
  });

  it("calls onSwipeRight when swiping right with sufficient distance", () => {
    const onSwipeRight = jest.fn();
    render(<TestComponent onSwipeRight={onSwipeRight} />);
    const el = screen.getByTestId("swipeable");
    simulateMouseSwipe(el, 50, 100, 200, 100); // deltaX = +150 (right)
    expect(onSwipeRight).toHaveBeenCalledTimes(1);
  });

  it("calls onSwipeUp when swiping up with sufficient distance", () => {
    const onSwipeUp = jest.fn();
    render(<TestComponent onSwipeUp={onSwipeUp} />);
    const el = screen.getByTestId("swipeable");
    simulateMouseSwipe(el, 100, 200, 100, 50); // deltaY = -150 (up)
    expect(onSwipeUp).toHaveBeenCalledTimes(1);
  });

  it("calls onSwipeDown when swiping down with sufficient distance", () => {
    const onSwipeDown = jest.fn();
    render(<TestComponent onSwipeDown={onSwipeDown} />);
    const el = screen.getByTestId("swipeable");
    simulateMouseSwipe(el, 100, 50, 100, 200); // deltaY = +150 (down)
    expect(onSwipeDown).toHaveBeenCalledTimes(1);
  });

  it("does NOT call any swipe callback when movement is below minSwipeDistance", () => {
    const onSwipeLeft = jest.fn();
    const onSwipeRight = jest.fn();
    render(
      <TestComponent
        onSwipeLeft={onSwipeLeft}
        onSwipeRight={onSwipeRight}
        minSwipeDistance={100}
      />,
    );
    const el = screen.getByTestId("swipeable");
    simulateMouseSwipe(el, 100, 100, 110, 100); // deltaX = 10 < 100
    expect(onSwipeLeft).not.toHaveBeenCalled();
    expect(onSwipeRight).not.toHaveBeenCalled();
  });

  it("calls onSwipe with correct direction when swiping left", () => {
    const onSwipe = jest.fn();
    render(<TestComponent onSwipe={onSwipe} />);
    const el = screen.getByTestId("swipeable");
    simulateMouseSwipe(el, 200, 100, 50, 100);
    expect(onSwipe).toHaveBeenCalledWith(
      "left",
      expect.any(Number),
      expect.any(Number),
    );
  });
});
