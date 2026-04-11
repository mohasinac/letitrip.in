"use client";

import { Span, Button } from "@mohasinac/appkit/ui";
import { useState, createContext, useContext } from "react";

interface AccordionContextValue {
  type: "single" | "multiple";
  openValues: string[];
  toggle: (value: string) => void;
}

const AccordionContext = createContext<AccordionContextValue>({
  type: "single",
  openValues: [],
  toggle: () => {},
});

export interface AccordionProps {
  type?: "single" | "multiple";
  defaultValue?: string | string[];
  value?: string | string[];
  onChange?: (value: string | string[]) => void;
  className?: string;
  children?: React.ReactNode;
}

export interface AccordionItemProps {
  value: string;
  title: React.ReactNode;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function Accordion({
  type = "single",
  defaultValue,
  value: controlledValue,
  onChange,
  className = "",
  children,
}: AccordionProps) {
  const initOpen =
    controlledValue != null
      ? Array.isArray(controlledValue)
        ? controlledValue
        : [controlledValue]
      : defaultValue != null
        ? Array.isArray(defaultValue)
          ? defaultValue
          : [defaultValue]
        : [];

  const [openValues, setOpenValues] = useState<string[]>(initOpen);

  const active =
    controlledValue != null
      ? Array.isArray(controlledValue)
        ? controlledValue
        : [controlledValue]
      : openValues;

  const toggle = (val: string) => {
    let next: string[];
    if (type === "single") {
      next = active.includes(val) ? [] : [val];
    } else {
      next = active.includes(val)
        ? active.filter((v) => v !== val)
        : [...active, val];
    }
    if (controlledValue == null) setOpenValues(next);
    onChange?.(type === "single" ? (next[0] ?? "") : next);
  };

  return (
    <AccordionContext.Provider value={{ type, openValues: active, toggle }}>
      <div className={className}>{children}</div>
    </AccordionContext.Provider>
  );
}

export function AccordionItem({
  value,
  title,
  disabled,
  className = "",
  children,
}: AccordionItemProps) {
  const { openValues, toggle } = useContext(AccordionContext);
  const isOpen = openValues.includes(value);

  return (
    <div
      className={`border-b border-gray-200 dark:border-gray-700 ${className}`}
    >
      <Button
        type="button"
        disabled={disabled}
        aria-expanded={isOpen}
        onClick={() => toggle(value)}
        className="w-full flex items-center justify-between py-3 px-1 text-left text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Span>{title}</Span>
        <Span
          className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        >
          ▾
        </Span>
      </Button>
      {isOpen && (
        <div className="pb-3 px-1 text-sm text-gray-600 dark:text-gray-400">
          {children}
        </div>
      )}
    </div>
  );
}

export default Accordion;
export type { AccordionProps as AccordionPropsType };
