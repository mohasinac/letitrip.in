import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { redirect } from "@/i18n/navigation";
import FAQCategoryPage, {
  generateStaticParams,
  generateMetadata,
} from "../page";
import { FAQ_CATEGORIES, ROUTES } from "@/constants";

// Mock @/i18n/navigation redirect
jest.mock("@/i18n/navigation", () => ({
  redirect: jest.fn(),
  notFound: jest.fn(),
  Link: ({ children, href }: { children: React.ReactNode; href: string }) =>
    require("react").createElement("a", { href }, children),
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
  usePathname: () => "/",
}));

// Mock next-intl/server getTranslations
jest.mock("next-intl/server", () => ({
  getTranslations: jest.fn(() =>
    Promise.resolve((key: string, params?: Record<string, string>) => {
      const map: Record<string, string> = {
        metaTitle: "FAQs - LetItRip",
        metaDescription: "Find answers to frequently asked questions.",
        categoryMetaTitle: params?.category
          ? `${params.category} FAQs – LetItRip`
          : "FAQs – LetItRip",
        "category.general": "General",
        "category.shipping": "Shipping & Delivery",
        "category.returns": "Returns & Refunds",
        "categoryDescription.general":
          "About our platform, services, and policies",
        "categoryDescription.shipping":
          "Delivery times, tracking, and shipping options",
      };
      return map[key] ?? key;
    }),
  ),
}));

// Mock the FAQPageContent component
jest.mock("@/features/faq", () => ({
  FAQPageContent: ({ initialCategory }: { initialCategory: string }) => (
    <div data-testid="faq-page-content" data-category={initialCategory}>
      FAQ Page Content
    </div>
  ),
}));

// Resolve params properly for server components
async function renderWithCategory(category: string, locale = "en") {
  const result = FAQCategoryPage({
    params: Promise.resolve({ locale, category }),
  });
  render(await result);
}

describe("FAQCategoryPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders FAQPageContent for a valid category", async () => {
    await renderWithCategory("general");
    expect(screen.getByTestId("faq-page-content")).toBeInTheDocument();
    expect(screen.getByTestId("faq-page-content")).toHaveAttribute(
      "data-category",
      "general",
    );
  });

  it("redirects to /faqs for an invalid category", async () => {
    await renderWithCategory("not-a-real-category");
    expect(redirect).toHaveBeenCalledWith({
      href: ROUTES.PUBLIC.FAQS,
      locale: "en",
    });
  });

  it("does not redirect for valid categories", async () => {
    const firstCategory = Object.keys(FAQ_CATEGORIES)[0];
    await renderWithCategory(firstCategory);
    expect(redirect).not.toHaveBeenCalled();
  });

  it("passes the category to FAQPageContent as initialCategory", async () => {
    await renderWithCategory("shipping");
    const content = screen.getByTestId("faq-page-content");
    expect(content).toHaveAttribute("data-category", "shipping");
  });
});

describe("generateStaticParams", () => {
  it("returns a params object for every FAQ category key", () => {
    const params = generateStaticParams();
    const categoryKeys = Object.keys(FAQ_CATEGORIES);
    expect(params).toHaveLength(categoryKeys.length);
    categoryKeys.forEach((key) => {
      expect(params).toContainEqual({ category: key });
    });
  });

  it("returns at least 5 category entries", () => {
    const params = generateStaticParams();
    expect(params.length).toBeGreaterThanOrEqual(5);
  });
});

describe("generateMetadata", () => {
  it("returns category-specific title and description for a valid category", async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ locale: "en", category: "general" }),
    });
    expect(metadata.title).toBe("General FAQs – LetItRip");
    expect(metadata.description).toBe(
      "About our platform, services, and policies",
    );
  });

  it("returns per-category description for shipping", async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ locale: "en", category: "shipping" }),
    });
    expect(metadata.title).toBe("Shipping & Delivery FAQs – LetItRip");
    expect(metadata.description).toBe(
      "Delivery times, tracking, and shipping options",
    );
  });

  it("falls back to generic meta for an unknown category", async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ locale: "en", category: "unknown-cat" }),
    });
    expect(metadata.title).toBe("FAQs - LetItRip");
    expect(metadata.description).toBe(
      "Find answers to frequently asked questions.",
    );
  });
});
