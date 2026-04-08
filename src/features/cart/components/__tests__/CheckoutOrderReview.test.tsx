import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  CheckoutOrderReview,
  type CheckoutPaymentMethod,
} from "../CheckoutOrderReview";

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

jest.mock("@/constants", () => ({
  THEME_CONSTANTS: {
    themed: {
      border: "border",
      bgPrimary: "bg-primary",
      bgSecondary: "bg-secondary",
    },
    flex: { between: "flex-between", center: "flex-center" },
    spacing: { stack: "space-y-4" },
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
  Button: ({ children, onClick, type = "button" }: any) => (
    <button type={type} onClick={onClick}>
      {children}
    </button>
  ),
  Caption: ({ children, className }: any) => <div className={className}>{children}</div>,
  Li: ({ children, className }: any) => <li className={className}>{children}</li>,
  MediaImage: ({ alt }: any) => <img alt={alt} />,
  Ol: ({ children, className }: any) => <ol className={className}>{children}</ol>,
  Span: ({ children, className }: any) => <span className={className}>{children}</span>,
  Text: ({ children, className }: any) => <span className={className}>{children}</span>,
  Textarea: ({ value, onChange, placeholder, name }: any) => (
    <textarea
      aria-label={name}
      value={value}
      placeholder={placeholder}
      onChange={onChange}
    />
  ),
}));

describe("CheckoutOrderReview", () => {
  const address = {
    fullName: "A Buyer",
    addressLine1: "123 Main Street",
    addressLine2: "Unit 4",
    city: "Mumbai",
    state: "MH",
    postalCode: "400001",
    phone: "9999999999",
  } as any;

  const items = [
    {
      itemId: "1",
      sellerId: "seller-1",
      sellerName: "Store One",
      productTitle: "Product One",
      productImage: "https://example.com/image.jpg",
      quantity: 2,
      price: 100,
    },
  ] as any;

  function renderComponent(paymentMethod: CheckoutPaymentMethod = "cod") {
    const onChangeAddress = jest.fn();
    const onPaymentMethodChange = jest.fn();
    const onNotesChange = jest.fn();

    render(
      <CheckoutOrderReview
        items={items}
        address={address}
        subtotal={200}
        paymentMethod={paymentMethod}
        onPaymentMethodChange={onPaymentMethodChange}
        onChangeAddress={onChangeAddress}
        shippingFee={20}
        platformFee={10}
        depositAmount={50}
        notes=""
        onNotesChange={onNotesChange}
        upiVpa="seller@upi"
      />,
    );

    return { onChangeAddress, onPaymentMethodChange, onNotesChange };
  }

  it("keeps notes and address actions inside collapsible sections", async () => {
    const user = userEvent.setup();
    const { onChangeAddress } = renderComponent();

    expect(screen.queryByPlaceholderText("sellerNotesPlaceholder")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "changeAddress" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /sellerNotesLabel/i }));

    expect(screen.getByPlaceholderText("sellerNotesPlaceholder")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /shippingTo/i }));
    await user.click(screen.getByRole("button", { name: "changeAddress" }));

    expect(onChangeAddress).toHaveBeenCalledTimes(1);
  });
});