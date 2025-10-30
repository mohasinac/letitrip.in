/**
 * Client-side markdown content utilities
 * Uses API endpoints to fetch parsed markdown content
 */

export interface ParsedMarkdown {
  content: string;
  metadata?: {
    title?: string;
    description?: string;
    date?: string;
    author?: string;
    tags?: string[];
    [key: string]: any;
  };
}

export interface FAQItem {
  question: string;
  answer: string;
  category?: string;
}

export interface CategoryItem {
  title: string;
  description: string;
  highlights: string[];
  image?: string;
  href?: string;
}

export interface ReviewItem {
  rating: number;
  author: string;
  title: string;
  content: string;
  date: string;
  role?: string;
}

/**
 * Fetch and parse a markdown file via API
 */
export async function fetchMarkdownContent(
  filePath: string,
): Promise<ParsedMarkdown> {
  try {
    const response = await fetch(
      `/api/content?file=${encodeURIComponent(filePath)}`,
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch content: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    // Return empty content on error to prevent crashes
    return { content: "", metadata: {} };
  }
}

/**
 * Parse FAQ markdown into structured data
 */
export function parseFAQMarkdown(content: string): FAQItem[] {
  const faqs: FAQItem[] = [];
  const lines = content.split("\n");

  let currentCategory = "";
  let currentQuestion = "";
  let currentAnswer = "";
  let inAnswer = false;

  for (const line of lines) {
    const trimmedLine = line.trim();

    // Check for category (## heading)
    if (trimmedLine.startsWith("## ")) {
      currentCategory = trimmedLine.replace("## ", "");
      continue;
    }

    // Check for question (### heading)
    if (trimmedLine.startsWith("### ")) {
      // Save previous FAQ if exists
      if (currentQuestion && currentAnswer) {
        faqs.push({
          question: currentQuestion,
          answer: currentAnswer.trim(),
          category: currentCategory,
        });
      }

      currentQuestion = trimmedLine.replace("### ", "");
      currentAnswer = "";
      inAnswer = true;
      continue;
    }

    // Collect answer content
    if (inAnswer && trimmedLine) {
      currentAnswer += line + "\n";
    }
  }

  // Add the last FAQ
  if (currentQuestion && currentAnswer) {
    faqs.push({
      question: currentQuestion,
      answer: currentAnswer.trim(),
      category: currentCategory,
    });
  }

  return faqs;
}

/**
 * Parse categories markdown into structured data
 */
export function parseCategoriesMarkdown(content: string): CategoryItem[] {
  const categories: CategoryItem[] = [];
  const sections = content.split("---").filter((section) => section.trim());

  for (const section of sections) {
    const lines = section.trim().split("\n");
    const titleLine = lines.find((line) => line.startsWith("## "));

    if (titleLine) {
      const title = titleLine.replace("## ", "").trim();
      const description = lines[1] || "";

      // Find highlights section
      const highlightsIndex = lines.findIndex((line) =>
        line.includes("**Highlights:**"),
      );
      const highlights: string[] = [];

      if (highlightsIndex > -1) {
        for (let i = highlightsIndex + 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (line.startsWith("- ")) {
            highlights.push(line.replace("- ", ""));
          } else if (line && !line.startsWith("**")) {
            break;
          }
        }
      }

      categories.push({
        title,
        description,
        highlights,
      });
    }
  }

  return categories;
}

/**
 * Parse reviews markdown into structured data
 */
export function parseReviewsMarkdown(content: string): ReviewItem[] {
  const reviews: ReviewItem[] = [];
  const sections = content.split("---").filter((section) => section.trim());

  for (const section of sections) {
    const lines = section
      .trim()
      .split("\n")
      .filter((line) => line.trim());

    if (lines.length > 0) {
      const titleLine = lines[0];

      // Look for star ratings and title
      const starMatch = titleLine.match(/⭐+/);
      const rating = starMatch ? starMatch[0].length : 5;

      // Extract title
      const title = titleLine.replace(/⭐+\s*/, "").trim();

      // Extract author and role
      let author = "";
      let role = "";
      const authorLine = lines.find(
        (line) => line.startsWith("**") && line.includes("**"),
      );
      if (authorLine) {
        const authorMatch = authorLine.match(/\*\*(.*?)\*\*\s*-\s*\*(.*?)\*/);
        if (authorMatch) {
          author = authorMatch[1];
          role = authorMatch[2];
        }
      }

      // Extract content (quote)
      const quoteLine = lines.find((line) => line.startsWith(">"));
      const content = quoteLine
        ? quoteLine.replace("> ", "").replace(/"/g, "")
        : "";

      // Extract date
      const dateLine = lines.find((line) => line.startsWith("*Posted:"));
      const date = dateLine
        ? dateLine.replace("*Posted: ", "").replace("*", "")
        : "";

      if (title && author && content) {
        reviews.push({
          rating,
          author,
          title,
          content,
          date,
          role,
        });
      }
    }
  }

  return reviews;
}

export default {
  fetchMarkdownContent,
  parseFAQMarkdown,
  parseCategoriesMarkdown,
  parseReviewsMarkdown,
};
