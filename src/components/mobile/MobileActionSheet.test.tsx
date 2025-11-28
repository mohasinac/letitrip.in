import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MobileActionSheet } from "./MobileActionSheet";
import { Edit, Trash2 } from "lucide-react";

describe("MobileActionSheet", () => {
  const mockOnClose = jest.fn();
  const mockActions = [
    {
      id: "edit",
      label: "Edit",
      icon: <Edit className="w-5 h-5" />,
      onClick: jest.fn(),
    },
    {
      id: "delete",
      label: "Delete",
      icon: <Trash2 className="w-5 h-5" />,
      onClick: jest.fn(),
      variant: "destructive" as const,
    },
  ];

  beforeEach(() => {
    mockOnClose.mockClear();
    mockActions.forEach((action) => action.onClick.mockClear());
  });

  it("renders nothing when closed", () => {
    render(
      <MobileActionSheet
        isOpen={false}
        onClose={mockOnClose}
        actions={mockActions}
      />
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders all actions when open", () => {
    render(
      <MobileActionSheet
        isOpen={true}
        onClose={mockOnClose}
        actions={mockActions}
      />
    );

    expect(screen.getByText("Edit")).toBeInTheDocument();
    expect(screen.getByText("Delete")).toBeInTheDocument();
  });

  it("renders title when provided", () => {
    render(
      <MobileActionSheet
        isOpen={true}
        onClose={mockOnClose}
        actions={mockActions}
        title="Choose Action"
      />
    );

    expect(screen.getByText("Choose Action")).toBeInTheDocument();
  });

  it("calls action onClick and closes when action is clicked", async () => {
    render(
      <MobileActionSheet
        isOpen={true}
        onClose={mockOnClose}
        actions={mockActions}
      />
    );

    await userEvent.click(screen.getByText("Edit"));

    expect(mockActions[0].onClick).toHaveBeenCalledTimes(1);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("shows cancel button by default", () => {
    render(
      <MobileActionSheet
        isOpen={true}
        onClose={mockOnClose}
        actions={mockActions}
      />
    );

    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });

  it("hides cancel button when showCancel is false", () => {
    render(
      <MobileActionSheet
        isOpen={true}
        onClose={mockOnClose}
        actions={mockActions}
        showCancel={false}
      />
    );

    expect(screen.queryByText("Cancel")).not.toBeInTheDocument();
  });

  it("uses custom cancel label", () => {
    render(
      <MobileActionSheet
        isOpen={true}
        onClose={mockOnClose}
        actions={mockActions}
        cancelLabel="Close"
      />
    );

    expect(screen.getByText("Close")).toBeInTheDocument();
    expect(screen.queryByText("Cancel")).not.toBeInTheDocument();
  });

  it("calls onClose when cancel is clicked", async () => {
    render(
      <MobileActionSheet
        isOpen={true}
        onClose={mockOnClose}
        actions={mockActions}
      />
    );

    await userEvent.click(screen.getByText("Cancel"));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("applies destructive styling to destructive actions", () => {
    render(
      <MobileActionSheet
        isOpen={true}
        onClose={mockOnClose}
        actions={mockActions}
      />
    );

    const deleteButton = screen.getByText("Delete").closest("button");
    expect(deleteButton).toHaveClass("text-red-600");
  });

  it("does not call onClick for disabled actions", async () => {
    const disabledAction = {
      id: "disabled",
      label: "Disabled Action",
      onClick: jest.fn(),
      disabled: true,
    };

    render(
      <MobileActionSheet
        isOpen={true}
        onClose={mockOnClose}
        actions={[disabledAction]}
      />
    );

    const button = screen.getByText("Disabled Action").closest("button");
    expect(button).toBeDisabled();
  });
});
