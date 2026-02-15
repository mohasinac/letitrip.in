import { render } from "@testing-library/react";
import type React from "react";
import { ReviewStars } from "@/components";

describe("ReviewStars", () => {
  it("renders five stars", () => {
    const { container } = render(<ReviewStars rating={3} />);

    const stars = container.querySelectorAll("svg");
    expect(stars.length).toBe(5);
  });
});
