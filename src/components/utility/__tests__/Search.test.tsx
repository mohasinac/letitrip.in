import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Search from "../Search";

const pushMock = jest.fn();

jest.mock("next-intl", () => ({
  useTranslations: (namespace: string) => {
    const dictionaries: Record<string, Record<string, string>> = {
      search: {
        placeholder: "Search products, sellers...",
        title: "Search",
        closeAriaLabel: "Close search",
        clearAriaLabel: "Clear search",
        quickLinks: "Quick Links",
        searching: "Searching...",
        browseProducts: 'Search "{q}" in products',
      },
      nav: {
        products: "Products",
        auctions: "Auctions",
        categories: "Categories",
        stores: "Stores",
        events: "Events",
        blog: "Blog",
        promotions: "Promotions",
        sellers: "Sellers",
        helpCenter: "Help Center",
      },
      actions: {
        trackMyOrder: "Track my order",
      },
    };

    return (key: string, values?: Record<string, string>) => {
      const template = dictionaries[namespace]?.[key] ?? key;
      if (!values) return template;
      return Object.entries(values).reduce(
        (text, [token, value]) => text.replace(`{${token}}`, value),
        template,
      );
    };
  },
}));

jest.mock("@/i18n/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

jest.mock("@/hooks", () => ({
  useNavSuggestions: jest.fn((query: string) => ({
    suggestions: query
      ? [
          {
            objectID: "faq-1",
            title: "Auction guide",
            subtitle: "How auctions work",
            type: "page",
            url: "/help/auction-guide",
          },
        ]
      : [],
    isLoading: false,
  })),
}));

jest.mock("@/constants", () => ({
  ROUTES: {
    PUBLIC: {
      PRODUCTS: "/products",
      AUCTIONS: "/auctions",
      CATEGORIES: "/categories",
      STORES: "/stores",
      EVENTS: "/events",
      BLOG: "/blog",
      PROMOTIONS: "/promotions",
      SELLERS: "/sellers",
      HELP: "/help",
      TRACK_ORDER: "/track-order",
    },
  },
  THEME_CONSTANTS: {
    input: { base: "input-base" },
    themed: {
      bgInput: "bg-input",
      border: "border-base",
      textPrimary: "text-primary",
      placeholder: "placeholder-base",
      focusRing: "focus-ring",
      bgSecondary: "bg-secondary",
      hover: "hoverable",
    },
    layout: { titleBarBg: "titlebar-bg" },
    zIndex: { search: "z-20" },
    colors: {
      iconButton: { onLight: "icon-button" },
      icon: { titleBar: "icon-titlebar", muted: "icon-muted" },
    },
  },
}));

jest.mock("@/components", () => ({
  Button: ({ children, className, ...props }: any) => (
    <button className={className} {...props}>
      {children}
    </button>
  ),
  Input: React.forwardRef<HTMLInputElement, any>(function MockInput(
    { className, bare: _bare, ...props },
    ref,
  ) {
    return <input ref={ref} className={className} {...props} />;
  }),
  Li: ({ children }: any) => <li>{children}</li>,
  Span: ({ children, className }: any) => (
    <span className={className}>{children}</span>
  ),
  Text: ({ children, className }: any) => (
    <span className={className}>{children}</span>
  ),
  Ul: ({ children }: any) => <ul>{children}</ul>,
}));

describe("Search", () => {
  beforeEach(() => {
    pushMock.mockReset();
  });

  it("submits the typed query when Enter is pressed without an active selection", async () => {
    const user = userEvent.setup();
    const onSearch = jest.fn();

    render(<Search isOpen onSearch={onSearch} onClose={jest.fn()} />);

    const input = screen.getByPlaceholderText("Search products, sellers...");
    await user.type(input, "rare figure{enter}");

    expect(onSearch).toHaveBeenCalledWith("rare figure");
  });

  it("navigates to the highlighted quick link with keyboard controls", async () => {
    const user = userEvent.setup();

    render(<Search isOpen onSearch={jest.fn()} onClose={jest.fn()} />);

    const input = screen.getByPlaceholderText("Search products, sellers...");
    await user.type(input, "auc");
    await user.keyboard("{ArrowDown}{Enter}");

    expect(pushMock).toHaveBeenCalledWith("/auctions");
  });

  it("shows inline quick links and navigates from keyboard selection", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(
      <Search
        value=""
        onChange={onChange}
        placeholder="Search products, sellers..."
      />,
    );

    const input = screen.getByPlaceholderText("Search products, sellers...");
    await user.click(input);
    await user.keyboard("{ArrowDown}{Enter}");

    expect(pushMock).toHaveBeenCalledWith("/products");
  });

  it("submits inline query from the suggestion footer", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(
      <Search
        value=""
        onChange={onChange}
        placeholder="Search products, sellers..."
      />,
    );

    const input = screen.getByPlaceholderText("Search products, sellers...");
    await user.click(input);
    await user.type(input, "figure");
    await user.click(screen.getByRole("button", { name: 'Search "figure" in products' }));

    expect(onChange).toHaveBeenLastCalledWith("figure");
  });
});