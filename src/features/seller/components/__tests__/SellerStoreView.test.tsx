import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SellerStoreView } from "../SellerStoreView";

const pushMock = jest.fn();
const updateStoreMock = jest.fn();

const mockStore = {
  id: "store-1",
  storeName: "Test Store",
  storeSlug: "test-store",
  status: "active",
  socialLinks: {},
  isVacationMode: false,
  isPublic: true,
};

const mockUseSellerStoreResult = {
  store: mockStore,
  isLoading: false,
  isSaving: false,
  error: null,
  updateStore: updateStoreMock,
};

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

jest.mock("@/i18n/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

jest.mock("@/hooks", () => ({
  useAuth: () => ({ user: { uid: "seller-1" }, loading: false }),
}));

jest.mock("../../hooks", () => ({
  useSellerStore: () => mockUseSellerStoreResult,
}));

jest.mock("@/constants", () => ({
  ROUTES: {
    AUTH: { LOGIN: "/auth/login" },
    SELLER: { ADDRESSES: "/seller/addresses" },
  },
  THEME_CONSTANTS: {
    themed: {
      bgSecondary: "bg-secondary",
      borderColor: "border-color",
    },
    spacing: { stack: "space-y-4" },
    flex: { between: "flex-between", center: "flex-center" },
  },
  SUCCESS_MESSAGES: {
    USER: { STORE_UPDATED: "Store updated" },
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
  Alert: ({ children }: any) => <div>{children}</div>,
  Button: ({ children, onClick, type = "button" }: any) => (
    <button type={type} onClick={onClick}>
      {children}
    </button>
  ),
  Caption: ({ children }: any) => <span>{children}</span>,
  Card: ({ children }: any) => <div>{children}</div>,
  Divider: () => <hr />,
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
  Label: ({ children }: any) => <span>{children}</span>,
  Spinner: () => <div>spinner</div>,
  Span: ({ children }: any) => <span>{children}</span>,
  Text: ({ children }: any) => <span>{children}</span>,
  Toggle: ({ checked, onChange }: any) => (
    <button type="button" onClick={() => onChange(!checked)}>
      {checked ? "on" : "off"}
    </button>
  ),
  useToast: () => ({ showToast: jest.fn() }),
}));

describe("SellerStoreView", () => {
  it("keeps store fields collapsed until section is opened", async () => {
    const user = userEvent.setup();

    render(<SellerStoreView />);

    expect(screen.queryByLabelText("storeName")).not.toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: /sectionStoreDetails/i }),
    );

    expect(screen.getByLabelText("storeName")).toBeInTheDocument();
  });
});