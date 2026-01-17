"use client";

/**
 * Utility hooks for common patterns
 */

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * useToggle - Toggle boolean state
 *
 * @param initialValue - Initial boolean value (default: false)
 * @returns [value, toggle, setTrue, setFalse]
 *
 * @example
 * ```tsx
 * const [isOpen, toggle, open, close] = useToggle();
 *
 * return (
 *   <>
 *     <button onClick={toggle}>Toggle</button>
 *     <button onClick={open}>Open</button>
 *     <button onClick={close}>Close</button>
 *     {isOpen && <Modal />}
 *   </>
 * );
 * ```
 */
export function useToggle(
  initialValue: boolean = false
): [boolean, () => void, () => void, () => void] {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback(() => {
    setValue((v) => !v);
  }, []);

  const setTrue = useCallback(() => {
    setValue(true);
  }, []);

  const setFalse = useCallback(() => {
    setValue(false);
  }, []);

  return [value, toggle, setTrue, setFalse];
}

/**
 * usePrevious - Get previous value of a state or prop
 *
 * @param value - Current value
 * @returns Previous value
 *
 * @example
 * ```tsx
 * const [count, setCount] = useState(0);
 * const prevCount = usePrevious(count);
 *
 * return (
 *   <div>
 *     Current: {count}, Previous: {prevCount}
 *   </div>
 * );
 * ```
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}

/**
 * useClipboard - Copy text to clipboard with feedback
 *
 * @param timeout - Reset timeout in milliseconds (default: 2000)
 * @returns { copied, copyToClipboard, error }
 *
 * @example
 * ```tsx
 * const { copied, copyToClipboard, error } = useClipboard();
 *
 * return (
 *   <button onClick={() => copyToClipboard('Hello World')}>
 *     {copied ? 'Copied!' : 'Copy'}
 *   </button>
 * );
 * ```
 */
export function useClipboard(timeout: number = 2000) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const copyToClipboard = useCallback(
    async (text: string) => {
      try {
        // Try modern API first
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setError(null);
        } else {
          // Fallback for older browsers or non-secure contexts
          const textArea = document.createElement("textarea");
          textArea.value = text;
          textArea.style.position = "fixed";
          textArea.style.left = "-999999px";
          textArea.style.top = "-999999px";
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();

          const successful = document.execCommand("copy");
          textArea.remove();

          if (successful) {
            setCopied(true);
            setError(null);
          } else {
            throw new Error("Copy command failed");
          }
        }

        // Reset copied state after timeout
        setTimeout(() => {
          setCopied(false);
        }, timeout);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to copy"));
        setCopied(false);
      }
    },
    [timeout]
  );

  return { copied, copyToClipboard, error };
}

/**
 * useCounter - Counter with increment, decrement, and reset
 *
 * @param initialValue - Initial count (default: 0)
 * @param options - Min, max, and step options
 * @returns { count, increment, decrement, reset, set }
 *
 * @example
 * ```tsx
 * const { count, increment, decrement, reset } = useCounter(0, { min: 0, max: 10 });
 *
 * return (
 *   <div>
 *     Count: {count}
 *     <button onClick={increment}>+</button>
 *     <button onClick={decrement}>-</button>
 *     <button onClick={reset}>Reset</button>
 *   </div>
 * );
 * ```
 */
export function useCounter(
  initialValue: number = 0,
  options: { min?: number; max?: number; step?: number } = {}
) {
  const { min, max, step = 1 } = options;
  const [count, setCount] = useState(initialValue);

  const increment = useCallback(() => {
    setCount((c) => {
      const newCount = c + step;
      if (max !== undefined && newCount > max) return max;
      return newCount;
    });
  }, [max, step]);

  const decrement = useCallback(() => {
    setCount((c) => {
      const newCount = c - step;
      if (min !== undefined && newCount < min) return min;
      return newCount;
    });
  }, [min, step]);

  const reset = useCallback(() => {
    setCount(initialValue);
  }, [initialValue]);

  const set = useCallback(
    (value: number) => {
      setCount(() => {
        let newValue = value;
        if (min !== undefined && newValue < min) newValue = min;
        if (max !== undefined && newValue > max) newValue = max;
        return newValue;
      });
    },
    [min, max]
  );

  return { count, increment, decrement, reset, set };
}

/**
 * useInterval - Declarative interval hook
 *
 * @param callback - Function to call on interval
 * @param delay - Delay in milliseconds (null to pause)
 *
 * @example
 * ```tsx
 * const [count, setCount] = useState(0);
 *
 * useInterval(() => {
 *   setCount(count + 1);
 * }, 1000);
 *
 * return <div>Count: {count}</div>;
 * ```
 */
export function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef(callback);

  // Remember the latest callback
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval
  useEffect(() => {
    if (delay === null) {
      return;
    }

    const id = setInterval(() => savedCallback.current(), delay);
    return () => clearInterval(id);
  }, [delay]);
}

/**
 * useTimeout - Declarative timeout hook
 *
 * @param callback - Function to call after timeout
 * @param delay - Delay in milliseconds (null to cancel)
 *
 * @example
 * ```tsx
 * const [show, setShow] = useState(true);
 *
 * useTimeout(() => {
 *   setShow(false);
 * }, 3000);
 *
 * return show ? <div>This will disappear</div> : null;
 * ```
 */
export function useTimeout(callback: () => void, delay: number | null) {
  const savedCallback = useRef(callback);

  // Remember the latest callback
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the timeout
  useEffect(() => {
    if (delay === null) {
      return;
    }

    const id = setTimeout(() => savedCallback.current(), delay);
    return () => clearTimeout(id);
  }, [delay]);
}
