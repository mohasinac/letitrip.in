import { SellersListView } from "../SellersListView";

jest.mock("next-intl/server", () => ({
  getTranslations: () => async () => (key: string) => key,
}));

jest.mock("@/constants", () => ({
  ROUTES: { AUTH: { REGISTER: "/register", LOGIN: "/login" } },
  THEME_CONSTANTS: {
    themed: {
      bgPrimary: "bg-white",
      bgSecondary: "bg-gray-50",
      textPrimary: "text-gray-900",
      textSecondary: "text-gray-600",
      border: "border-gray-200",
    },
    typography: { h2: "text-2xl font-bold", h4: "text-lg font-semibold" },
    spacing: { stack: "space-y-4" },
    button: { ctaPrimary: "btn-primary", ctaOutline: "btn-outline" },
  },
}));

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => children,
}));

describe("SellersListView", () => {
  it("is an async server component function", () => {
    expect(typeof SellersListView).toBe("function");
    const result = SellersListView();
    expect(result).toBeInstanceOf(Promise);
  });
});
