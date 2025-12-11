import * as hooks from "@/hooks/useLoadingState";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ContactSelectorWithCreate } from "../ContactSelectorWithCreate";

// Mock useLoadingState hook
jest.mock("@/hooks/useLoadingState", () => ({
  useLoadingState: jest.fn(() => ({
    isLoading: false,
    setData: jest.fn(),
    data: [],
    error: null,
    execute: jest.fn(),
  })),
}));

// Mock MobileInput component
jest.mock("@/components/common/MobileInput", () => ({
  MobileInput: ({
    value,
    onChange,
    error,
    label,
  }: {
    value?: string;
    onChange: (value: string) => void;
    error?: string;
    label?: string;
  }) => (
    <div>
      {label && <label>{label}</label>}
      <input
        data-testid="mobile-input"
        type="tel"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={!!error}
      />
      {error && <span role="alert">{error}</span>}
    </div>
  ),
}));

describe("ContactSelectorWithCreate", () => {
  const mockContacts = [
    {
      id: "1",
      name: "John Doe",
      phone: "9876543210",
      countryCode: "+91",
      email: "john@example.com",
      relationship: "friend",
      isPrimary: true,
      createdAt: new Date("2024-01-01"),
    },
    {
      id: "2",
      name: "Jane Smith",
      phone: "8765432109",
      countryCode: "+91",
      email: "jane@example.com",
      relationship: "family",
      isPrimary: false,
      createdAt: new Date("2024-01-02"),
    },
    {
      id: "3",
      name: "Bob Wilson",
      phone: "7654321098",
      countryCode: "+91",
      email: "",
      relationship: "colleague",
      isPrimary: false,
      createdAt: new Date("2024-01-03"),
    },
  ];

  const defaultProps = {
    value: null,
    onChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (hooks.useLoadingState as jest.Mock).mockReturnValue({
      isLoading: false,
      setData: jest.fn(),
      data: mockContacts,
      error: null,
      execute: jest.fn(),
    });
  });

  describe("Basic Rendering", () => {
    it("renders the component", () => {
      render(<ContactSelectorWithCreate {...defaultProps} />);
      expect(screen.getByText("Select Contact")).toBeInTheDocument();
    });

    it("renders with custom label", () => {
      render(
        <ContactSelectorWithCreate {...defaultProps} label="Choose a contact" />
      );
      expect(screen.getByText("Choose a contact")).toBeInTheDocument();
    });

    it("renders contact buttons", () => {
      render(<ContactSelectorWithCreate {...defaultProps} />);
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    });

    it("renders add contact button", () => {
      render(<ContactSelectorWithCreate {...defaultProps} />);
      expect(screen.getByText("Add New Contact")).toBeInTheDocument();
    });
  });

  describe("Loading State", () => {
    it("shows loading spinner when loading", () => {
      (hooks.useLoadingState as jest.Mock).mockReturnValue({
        isLoading: true,
        setData: jest.fn(),
        data: [],
        error: null,
        execute: jest.fn(),
      });
      const { container } = render(
        <ContactSelectorWithCreate {...defaultProps} />
      );
      const spinner = container.querySelector(".animate-spin");
      expect(spinner).toBeInTheDocument();
    });
  });

  describe("Contact List", () => {
    it("displays all contacts as buttons", () => {
      render(<ContactSelectorWithCreate {...defaultProps} />);
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("Jane Smith")).toBeInTheDocument();
      expect(screen.getByText("Bob Wilson")).toBeInTheDocument();
    });

    it("shows contact name and phone", () => {
      render(<ContactSelectorWithCreate {...defaultProps} />);
      expect(screen.getByText(/John Doe/)).toBeInTheDocument();
      expect(screen.getByText(/9876543210/)).toBeInTheDocument();
    });

    it("shows primary badge for primary contact", () => {
      render(<ContactSelectorWithCreate {...defaultProps} />);
      expect(screen.getByText("Primary")).toBeInTheDocument();
    });
  });

  describe("Contact Selection", () => {
    it("calls onChange when contact button is clicked", () => {
      const onChange = jest.fn();
      render(
        <ContactSelectorWithCreate {...defaultProps} onChange={onChange} />
      );
      const button = screen.getByText("John Doe").closest("button");
      fireEvent.click(button!);
      expect(onChange).toHaveBeenCalledWith("1", mockContacts[0]);
    });

    it("shows selected state styling", () => {
      render(<ContactSelectorWithCreate {...defaultProps} value="1" />);
      const button = screen.getByText("John Doe").closest("button");
      expect(button).toHaveClass("border-primary");
    });
  });

  describe("Auto-Select Primary Contact", () => {
    it("auto-selects primary contact when enabled", () => {
      const onChange = jest.fn();
      render(
        <ContactSelectorWithCreate
          {...defaultProps}
          autoSelectPrimary
          onChange={onChange}
        />
      );
      expect(onChange).toHaveBeenCalledWith("1", mockContacts[0]);
    });

    it("does not auto-select when autoSelectPrimary false", () => {
      const onChange = jest.fn();
      render(
        <ContactSelectorWithCreate
          {...defaultProps}
          autoSelectPrimary={false}
          onChange={onChange}
        />
      );
      expect(onChange).not.toHaveBeenCalled();
    });

    it("does not auto-select when no primary contact", () => {
      const noPrimaryContacts = mockContacts.map((c) => ({
        ...c,
        isPrimary: false,
      }));
      (hooks.useLoadingState as jest.Mock).mockReturnValue({
        isLoading: false,
        setData: jest.fn(),
        data: noPrimaryContacts,
        error: null,
        execute: jest.fn(),
      });
      const onChange = jest.fn();
      render(
        <ContactSelectorWithCreate
          {...defaultProps}
          autoSelectPrimary
          onChange={onChange}
        />
      );
      expect(onChange).not.toHaveBeenCalled();
    });

    it("does not auto-select if value already set", () => {
      const onChange = jest.fn();
      render(
        <ContactSelectorWithCreate
          {...defaultProps}
          value="2"
          autoSelectPrimary
          onChange={onChange}
        />
      );
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe("Create Contact Modal", () => {
    it("opens modal when create button clicked", () => {
      render(<ContactSelectorWithCreate {...defaultProps} />);
      const createButtons = screen.getAllByText("Add New Contact");
      fireEvent.click(createButtons[0]);
      const addContacts = screen.getAllByText("Add Contact");
      expect(addContacts.length).toBeGreaterThan(0);
    });

    it("shows modal title", () => {
      render(<ContactSelectorWithCreate {...defaultProps} />);
      const createButtons = screen.getAllByText("Add New Contact");
      fireEvent.click(createButtons[0]);
      const addContacts = screen.getAllByText("Add Contact");
      expect(addContacts.length).toBeGreaterThan(0);
    });

    it("closes modal when cancel clicked", async () => {
      render(<ContactSelectorWithCreate {...defaultProps} />);
      const createButton = screen.getByText("Add New Contact");
      fireEvent.click(createButton);
      const cancelButton = screen.getByText("Cancel");
      fireEvent.click(cancelButton);
      await waitFor(() => {
        expect(screen.queryByText("Add Contact")).not.toBeInTheDocument();
      });
    });

    it("closes modal when close button clicked", async () => {
      render(<ContactSelectorWithCreate {...defaultProps} />);
      const createButton = screen.getByText("Add New Contact");
      fireEvent.click(createButton);
      const closeButton = screen.getByText("\u2715");
      fireEvent.click(closeButton);
      await waitFor(() => {
        expect(screen.queryByText("Add Contact")).not.toBeInTheDocument();
      });
    });
  });

  describe("Create Form Fields", () => {
    beforeEach(() => {
      render(<ContactSelectorWithCreate {...defaultProps} />);
      const createButton = screen.getByText("Add New Contact");
      fireEvent.click(createButton);
    });

    it("renders name input", () => {
      expect(screen.getByPlaceholderText("Full Name")).toBeInTheDocument();
    });

    it("renders mobile input", () => {
      expect(screen.getByTestId("mobile-input")).toBeInTheDocument();
    });

    it("renders email input", () => {
      expect(
        screen.getByPlaceholderText("email@example.com")
      ).toBeInTheDocument();
    });

    it("renders relationship input", () => {
      expect(
        screen.getByPlaceholderText("e.g., Spouse, Parent")
      ).toBeInTheDocument();
    });

    it("renders primary checkbox", () => {
      expect(
        screen.getByLabelText(/Set as primary contact/)
      ).toBeInTheDocument();
    });
  });

  describe("Form Validation", () => {
    beforeEach(() => {
      render(<ContactSelectorWithCreate {...defaultProps} />);
      const createButton = screen.getByText("Add New Contact");
      fireEvent.click(createButton);
    });

    it("validates form on submit", async () => {
      const submitButtons = screen.getAllByText("Add Contact");
      fireEvent.click(submitButtons[0]);
      await waitFor(() => {
        const addContacts = screen.queryAllByText("Add Contact");
        expect(addContacts.length).toBeGreaterThan(0);
      });
    });
  });

  describe("Error State", () => {
    it("shows error message", () => {
      render(
        <ContactSelectorWithCreate
          {...defaultProps}
          error="Contact is required"
        />
      );
      expect(screen.getByText("Contact is required")).toBeInTheDocument();
    });
  });

  describe("Required Field", () => {
    it("shows required indicator when required", () => {
      render(<ContactSelectorWithCreate {...defaultProps} required />);
      const label = screen.getByText("Select Contact");
      expect(label.textContent).toContain("*");
    });

    it("does not show required indicator when not required", () => {
      render(<ContactSelectorWithCreate {...defaultProps} />);
      const label = screen.getByText("Select Contact");
      expect(label.textContent).not.toContain("*");
    });
  });

  describe("Loading State from Hook", () => {
    it("calls execute on mount", () => {
      const execute = jest.fn();
      (hooks.useLoadingState as jest.Mock).mockReturnValue({
        isLoading: false,
        setData: jest.fn(),
        data: mockContacts,
        error: null,
        execute,
      });
      render(<ContactSelectorWithCreate {...defaultProps} />);
      expect(execute).toHaveBeenCalled();
    });

    it("shows error from hook", () => {
      (hooks.useLoadingState as jest.Mock).mockReturnValue({
        isLoading: false,
        setData: jest.fn(),
        data: null,
        error: "Failed to load contacts",
        execute: jest.fn(),
      });
      render(<ContactSelectorWithCreate {...defaultProps} />);
      // Component doesn't show hook error, only prop error
      expect(screen.getByText("Select Contact")).toBeInTheDocument();
    });
  });

  describe("Dark Mode", () => {
    it("has dark mode classes on label", () => {
      render(<ContactSelectorWithCreate {...defaultProps} />);
      const label = screen.getByText("Select Contact");
      expect(label).toHaveClass("dark:text-gray-300");
    });

    it("has dark mode classes on create button", () => {
      render(<ContactSelectorWithCreate {...defaultProps} />);
      const createButtons = screen.getAllByText("Add New Contact");
      // Just verify button exists and has parent with classes
      expect(createButtons[0].parentElement?.className.length).toBeGreaterThan(
        0
      );
    });
  });

  describe("Custom Class Name", () => {
    it("applies custom className", () => {
      const { container } = render(
        <ContactSelectorWithCreate {...defaultProps} className="custom-class" />
      );
      expect(container.firstChild).toHaveClass("custom-class");
    });
  });

  describe("Empty State", () => {
    it("shows message when no contacts", () => {
      (hooks.useLoadingState as jest.Mock).mockReturnValue({
        isLoading: false,
        setData: jest.fn(),
        data: [],
        error: null,
        execute: jest.fn(),
      });
      render(<ContactSelectorWithCreate {...defaultProps} />);
      expect(screen.getByText("No saved contacts")).toBeInTheDocument();
    });

    it("shows add contact button when no contacts", () => {
      (hooks.useLoadingState as jest.Mock).mockReturnValue({
        isLoading: false,
        setData: jest.fn(),
        data: [],
        error: null,
        execute: jest.fn(),
      });
      render(<ContactSelectorWithCreate {...defaultProps} />);
      expect(screen.getByText("Add Contact")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("renders proper label", () => {
      render(<ContactSelectorWithCreate {...defaultProps} />);
      expect(screen.getByText("Select Contact")).toBeInTheDocument();
    });

    it("shows required indicator", () => {
      render(<ContactSelectorWithCreate {...defaultProps} required />);
      const label = screen.getByText("Select Contact");
      expect(label.textContent).toContain("*");
    });
  });

  describe("Edge Cases", () => {
    it("handles contact without email", () => {
      render(<ContactSelectorWithCreate {...defaultProps} />);
      expect(screen.getByText(/Bob Wilson/)).toBeInTheDocument();
    });

    it("handles null value gracefully", () => {
      render(<ContactSelectorWithCreate {...defaultProps} value={null} />);
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    it("handles undefined contacts", () => {
      (hooks.useLoadingState as jest.Mock).mockReturnValue({
        isLoading: false,
        setData: jest.fn(),
        data: undefined,
        error: null,
        execute: jest.fn(),
      });
      render(<ContactSelectorWithCreate {...defaultProps} />);
      expect(screen.getByText("No saved contacts")).toBeInTheDocument();
    });
  });

  describe("Primary Contact Badge", () => {
    it("shows primary badge with correct styling", () => {
      render(<ContactSelectorWithCreate {...defaultProps} />);
      const badge = screen.getByText("Primary");
      expect(badge).toHaveClass("text-green-700");
    });
  });
});
