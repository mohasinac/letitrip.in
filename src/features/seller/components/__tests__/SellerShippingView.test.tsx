import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SellerShippingView } from "../SellerShippingView";

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

jest.mock("@/constants", () => ({
  THEME_CONSTANTS: {
    spacing: { stack: "space-y-4" },
    flex: { center: "flex-center", start: "flex-start" },
    themed: { border: "border", bgPrimary: "bg-primary" },
  },
}));

jest.mock("@/features/seller", () => ({
  useSellerShipping: () => ({
    shippingConfig: { method: "custom", customCarrierName: "DTDC", customShippingPrice: 40 },
    isConfigured: true,
    isTokenValid: false,
    isLoading: false,
    isSaving: false,
    isVerifying: false,
    updateShipping: jest.fn(),
    verifyOtp: jest.fn(),
  }),
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
  AdminPageHeader: ({ title }: any) => <div>{title}</div>,
  Alert: ({ children }: any) => <div>{children}</div>,
  Badge: ({ children }: any) => <div>{children}</div>,
  Button: ({ children, onClick, type = "button", isLoading: _isLoading, ...props }: any) => (
    <button type={type} onClick={onClick} {...props}>
      {children}
    </button>
  ),
  Card: ({ children }: any) => <div>{children}</div>,
  FormField: ({ label, name, value = "", onChange }: any) => (
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
  SideDrawer: ({ children }: any) => <div>{children}</div>,
  Spinner: () => <div>spinner</div>,
  Text: ({ children }: any) => <span>{children}</span>,
}));

describe("SellerShippingView", () => {
  it("keeps method buttons collapsed until section is opened", async () => {
    const user = userEvent.setup();

    render(<SellerShippingView />);

    expect(screen.queryByRole("button", { name: "methodCustomTitle" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /methodHeading/i }));

    expect(
      screen.getByRole("button", { name: /methodCustomTitle\s+methodCustomDesc/i }),
    ).toBeInTheDocument();
  });
});