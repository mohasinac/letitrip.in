import { render, screen } from "@testing-library/react";
import type React from "react";
import { getFaqTableColumns } from "@/components";
import { UI_LABELS } from "@/constants";
import type { FAQ } from "@/components";

describe("FaqTableColumns", () => {
  const faq: FAQ = {
    id: "faq-1",
    question: UI_LABELS.ACTIONS.SAVE,
    answer: UI_LABELS.ACTIONS.SAVE,
    category: UI_LABELS.ACTIONS.SAVE,
    priority: 1,
    tags: [],
    featured: true,
    viewCount: 0,
    helpfulCount: 1,
    notHelpfulCount: 0,
    order: 1,
    createdAt: "",
    updatedAt: "",
  };

  it("renders featured label", () => {
    const { columns } = getFaqTableColumns(jest.fn(), jest.fn());
    const featuredColumn = columns.find((column) => column.key === "featured");

    render(featuredColumn?.render?.(faq) as React.ReactElement);

    expect(screen.getByText(UI_LABELS.ACTIONS.YES)).toBeInTheDocument();
  });
});
