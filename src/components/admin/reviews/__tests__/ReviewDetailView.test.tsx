import { render, screen, fireEvent } from "@testing-library/react";
import type React from "react";
import { ReviewDetailView } from "@/components";
import { UI_LABELS } from "@/constants";
import type { Review } from "@/components";

jest.mock("@/utils", () => ({
  formatDate: () => UI_LABELS.LOADING.DEFAULT,
}));

describe("ReviewDetailView", () => {
  const review: Review = {
    id: "review-1",
    productId: "product-1",
    productName: UI_LABELS.ACTIONS.SAVE,
    userId: "user-1",
    userName: UI_LABELS.ACTIONS.SAVE,
    rating: 4,
    comment: UI_LABELS.ACTIONS.SAVE,
    status: "pending",
    verifiedPurchase: false,
    helpfulCount: 0,
    notHelpfulCount: 0,
    createdAt: "",
    updatedAt: "",
  };

  it("calls action handlers", () => {
    const onBack = jest.fn();
    const onApprove = jest.fn();
    const onReject = jest.fn();
    const onDelete = jest.fn();

    render(
      <ReviewDetailView
        review={review}
        onBack={onBack}
        onApprove={onApprove}
        onReject={onReject}
        onDelete={onDelete}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: UI_LABELS.ADMIN.REVIEWS.BACK_TO_LIST,
      }),
    );
    fireEvent.click(
      screen.getByRole("button", { name: UI_LABELS.ADMIN.REVIEWS.APPROVE }),
    );
    fireEvent.click(
      screen.getByRole("button", { name: UI_LABELS.ADMIN.REVIEWS.REJECT }),
    );
    fireEvent.click(
      screen.getByRole("button", { name: UI_LABELS.ADMIN.REVIEWS.DELETE }),
    );

    expect(onBack).toHaveBeenCalledTimes(1);
    expect(onApprove).toHaveBeenCalledWith(review);
    expect(onReject).toHaveBeenCalledWith(review);
    expect(onDelete).toHaveBeenCalledWith(review);
  });
});
