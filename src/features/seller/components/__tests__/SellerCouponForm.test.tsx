import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SellerCouponForm } from "../SellerCouponForm";

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

jest.mock("@/i18n/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock("@/hooks", () => ({
  useMessage: () => ({ showError: jest.fn(), showSuccess: jest.fn() }),
}));

jest.mock("@/actions", () => ({
  sellerCreateCouponAction: jest.fn(),
}));

jest.mock("@/utils", () => ({
  nowISO: () => "2026-01-01T00:00:00.000Z",
}));

jest.mock("@/constants", () => ({
  ROUTES: { SELLER: { COUPONS: "/seller/coupons" } },
  THEME_CONSTANTS: {
    themed: { border: "border", bgPrimary: "bg-primary", textSecondary: "text-secondary" },
    spacing: { stack: "space-y-4" },
  },
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
  Button: ({ children, type = "button" }: any) => <button type={type}>{children}</button>,
  Card: ({ children }: any) => <div>{children}</div>,
  FormGroup: ({ children }: any) => <div>{children}</div>,
  Heading: ({ children }: any) => <div>{children}</div>,
  Input: React.forwardRef(function Input(props: any, ref: any) {
    return <input ref={ref} {...props} />;
  }),
  Label: ({ children, htmlFor }: any) => <label htmlFor={htmlFor}>{children}</label>,
  Select: React.forwardRef(function Select({ options = [], ...props }: any, ref: any) {
    return (
      <select ref={ref} {...props}>
        {options.map((option: any) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }),
  Span: ({ children, className }: any) => <span className={className}>{children}</span>,
  Text: ({ children, className }: any) => <span className={className}>{children}</span>,
}));

describe("SellerCouponForm", () => {
  it("keeps coupon sections collapsed until opened", async () => {
    const user = userEvent.setup();

    render(<SellerCouponForm />);

    expect(screen.queryByLabelText("fieldSellerCode")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("fieldTotalLimit")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /formSectionBasic/i }));

    expect(screen.getByLabelText("fieldSellerCode")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /formSectionUsage/i }));

    expect(screen.getByLabelText("fieldTotalLimit")).toBeInTheDocument();
  });
});