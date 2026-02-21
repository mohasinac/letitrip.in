import { render, screen, fireEvent } from "@testing-library/react";
import { AuthSocialButtons } from "../components/AuthSocialButtons";
import { UI_LABELS } from "@/constants";

jest.mock("@/components", () => ({
  Button: ({
    children,
    onClick,
    disabled,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
  }) => (
    <button onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
}));

describe("AuthSocialButtons", () => {
  it("renders Google and Apple buttons", () => {
    render(<AuthSocialButtons onGoogle={jest.fn()} onApple={jest.fn()} />);

    expect(
      screen.getByRole("button", {
        name: new RegExp(UI_LABELS.AUTH.LOGIN.GOOGLE, "i"),
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: new RegExp(UI_LABELS.AUTH.LOGIN.APPLE, "i"),
      }),
    ).toBeInTheDocument();
  });

  it("renders OR divider text", () => {
    render(<AuthSocialButtons onGoogle={jest.fn()} onApple={jest.fn()} />);

    expect(
      screen.getByText(UI_LABELS.AUTH.LOGIN.OR_CONTINUE_WITH),
    ).toBeInTheDocument();
  });

  it("calls onGoogle when Google button is clicked", () => {
    const onGoogle = jest.fn();
    render(<AuthSocialButtons onGoogle={onGoogle} onApple={jest.fn()} />);

    fireEvent.click(
      screen.getByRole("button", {
        name: new RegExp(UI_LABELS.AUTH.LOGIN.GOOGLE, "i"),
      }),
    );

    expect(onGoogle).toHaveBeenCalledTimes(1);
  });

  it("calls onApple when Apple button is clicked", () => {
    const onApple = jest.fn();
    render(<AuthSocialButtons onGoogle={jest.fn()} onApple={onApple} />);

    fireEvent.click(
      screen.getByRole("button", {
        name: new RegExp(UI_LABELS.AUTH.LOGIN.APPLE, "i"),
      }),
    );

    expect(onApple).toHaveBeenCalledTimes(1);
  });

  it("disables both buttons when disabled prop is true", () => {
    render(
      <AuthSocialButtons onGoogle={jest.fn()} onApple={jest.fn()} disabled />,
    );

    const buttons = screen.getAllByRole("button");
    buttons.forEach((btn) => expect(btn).toBeDisabled());
  });
});
