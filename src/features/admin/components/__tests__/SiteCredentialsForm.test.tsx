import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SiteCredentialsForm } from "../SiteCredentialsForm";

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
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
  Card: ({ children }: any) => <div>{children}</div>,
  FormField: ({ label, name, value = "", onChange, placeholder }: any) => (
    <label>
      {label || name}
      <input
        aria-label={label || name}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange?.(event.target.value)}
      />
    </label>
  ),
  FormFieldSpan: ({ children }: any) => <div>{children}</div>,
  FormGroup: ({ children }: any) => <div>{children}</div>,
  Heading: ({ children }: any) => <div>{children}</div>,
  Text: ({ children }: any) => <span>{children}</span>,
}));

describe("SiteCredentialsForm", () => {
  it("keeps non-primary sections collapsed until opened", async () => {
    const user = userEvent.setup();

    render(
      <SiteCredentialsForm
        maskedCredentials={{
          razorpayKeyId: "rzp_test_1234",
          resendApiKey: "re_test_1234",
          shiprocketEmail: "ops@example.com",
        }}
        whatsappNumber="+911234567890"
        onChange={jest.fn()}
      />,
    );

    expect(screen.queryAllByText("shiprocketEmail")).toHaveLength(0);

    await user.click(
      screen.getByRole("button", { name: /shiprocketSection/i }),
    );

    expect(screen.getAllByText("shiprocketEmail").length).toBeGreaterThan(0);
  });

  it("publishes updated credential values through onChange", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(
      <SiteCredentialsForm maskedCredentials={{}} onChange={onChange} />,
    );

    await user.click(screen.getByRole("button", { name: /razorpaySection/i }));

    const input = screen.getByLabelText("razorpayKeyId");
    await user.type(input, "new-key");

    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ razorpayKeyId: "new-key" }),
    );
  });
});