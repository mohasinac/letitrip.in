import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SellerPayoutRequestForm } from "../SellerPayoutRequestForm";

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

jest.mock("@/constants", () => ({
  THEME_CONSTANTS: {
    themed: { border: "border", bgPrimary: "bg-primary" },
    spacing: { stack: "space-y-4" },
    typography: {},
    flex: { between: "flex-between" },
  },
}));

jest.mock("@/utils", () => ({
  formatCurrency: (value: number) => `Rs ${value}`,
}));

jest.mock("@/components", () => ({
  Accordion: ({ children }: any) => <div>{children}</div>,
  AccordionItem: ({ title, children }: any) => {
    const [open, setOpen] = React.useState(false);
    return (
      <div>
        <button type="button" onClick={() => setOpen((value) => !value)}>
          {title}
        </button>
        {open ? <div>{children}</div> : null}
      </div>
    );
  },
  Alert: ({ children }: any) => <div>{children}</div>,
  Button: ({ children, onClick, type = "button", disabled }: any) => (
    <button type={type} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
  Card: ({ children }: any) => <div>{children}</div>,
  FormField: ({
    label,
    name,
    value = "",
    onChange,
    type,
    options,
  }: any) =>
    type === "select" ? (
      <label>
        {label || name}
        <select
          aria-label={label || name}
          value={value}
          onChange={(event) => onChange?.(event.target.value)}
        >
          {options?.map((option: any) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    ) : (
      <label>
        {label || name}
        <input
          aria-label={label || name}
          value={value}
          onChange={(event) => onChange?.(event.target.value)}
        />
      </label>
    ),
  FormGroup: ({ children }: any) => <div>{children}</div>,
  Heading: ({ children }: any) => <div>{children}</div>,
  Text: ({ children }: any) => <span>{children}</span>,
}));

describe("SellerPayoutRequestForm", () => {
  it("keeps payout details collapsed until the section is opened", async () => {
    const user = userEvent.setup();

    render(
      <SellerPayoutRequestForm
        summary={{
          availableEarnings: 1200,
          grossEarnings: 1500,
          platformFeeRate: 0.05,
          hasPendingPayout: false,
        }}
        submitting={false}
        onSubmit={jest.fn()}
      />,
    );

    expect(screen.queryByLabelText("bankHolderName")).not.toBeInTheDocument();

    await user.click(screen.getAllByRole("button", { name: "requestPayout" })[0]);

    expect(screen.queryByLabelText("bankHolderName")).not.toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: /paymentMethodBank/i }),
    );

    expect(screen.getByLabelText("bankHolderName")).toBeInTheDocument();
  });
});