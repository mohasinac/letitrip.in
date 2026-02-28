import React from "react";
import { render, screen } from "@testing-library/react";
import { OrderSuccessActions } from "../OrderSuccessActions";

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));
jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

describe("OrderSuccessActions", () => {
  it("renders viewOrder link", () => {
    render(<OrderSuccessActions orderId="o1" />);
    expect(screen.getByText("viewOrder")).toBeInTheDocument();
  });

  it("renders continueShopping link", () => {
    render(<OrderSuccessActions orderId="o1" />);
    expect(screen.getByText("continueShopping")).toBeInTheDocument();
  });

  it("renders my orders link using orders.title key", () => {
    render(<OrderSuccessActions orderId="o1" />);
    expect(screen.getByText("title")).toBeInTheDocument();
  });

  it("renders all three action links", () => {
    render(<OrderSuccessActions orderId="o1" />);
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(3);
  });
});
