import { render, screen } from "@testing-library/react";
import type React from "react";
import { getReviewTableColumns } from "@/components";
import { UI_LABELS } from "@/constants";
import type { Review } from "@/components";

describe("ReviewTableColumns", () => {
  const review: Review = {
    id: "review-1",
    productId: "product-1",
    productName: UI_LABELS.ACTIONS.SAVE,
    userId: "user-1",
    userName: UI_LABELS.ACTIONS.SAVE,
    rating: 4,
    comment: UI_LABELS.ACTIONS.SAVE,
    status: "pending",
    verifiedPurchase: true,
    helpfulCount: 1,
    notHelpfulCount: 0,
    createdAt: "",
    updatedAt: "",
  };

  it("renders verified label", () => {
    const columns = getReviewTableColumns();
    const userColumn = columns.find((column) => column.key === "userName");

    render(userColumn?.render?.(review) as React.ReactElement);

    expect(
      screen.getByText((content) =>
        content.includes(UI_LABELS.ADMIN.REVIEWS.VERIFIED),
      ),
    ).toBeInTheDocument();
  });
});
