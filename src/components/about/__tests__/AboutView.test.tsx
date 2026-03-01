import { AboutView } from "../AboutView";

jest.mock("next-intl/server", () => ({
  getTranslations: () => async () => (key: string) => key,
}));

jest.mock("@/constants", () => ({
  ROUTES: {
    AUTH: { REGISTER: "/register" },
    PUBLIC: { PRODUCTS: "/products" },
  },
  THEME_CONSTANTS: {
    themed: {
      bgSecondary: "bg-gray-50",
      textPrimary: "text-gray-900",
      textSecondary: "text-gray-600",
      border: "border-gray-200",
    },
    typography: { h2: "text-2xl font-bold", h4: "text-lg font-semibold" },
    spacing: { stack: "space-y-4" },
  },
}));

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => children,
}));

describe("AboutView", () => {
  it("is an async server component function", () => {
    expect(typeof AboutView).toBe("function");
    const result = AboutView();
    expect(result).toBeInstanceOf(Promise);
  });
});
