import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { redirect } from "next/navigation";
import FAQCategoryPage, { generateStaticParams } from "../page";
import { FAQ_CATEGORIES, ROUTES } from "@/constants";

// Mock next/navigation redirect
jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
  notFound: jest.fn(),
}));

// Mock the FAQPageContent component
jest.mock("@/components/faq", () => ({
  FAQPageContent: ({ initialCategory }: { initialCategory: string }) => (
    <div data-testid="faq-page-content" data-category={initialCategory}>
      FAQ Page Content
    </div>
  ),
}));

// Resolve params properly for server components
async function renderWithCategory(category: string) {
  const result = FAQCategoryPage({
    params: Promise.resolve({ category }),
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
    expect(redirect).toHaveBeenCalledWith(ROUTES.PUBLIC.FAQS);
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
