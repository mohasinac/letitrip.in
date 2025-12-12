import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ContactInfoStep, ContactInfoStepProps } from "../ContactInfoStep";

// Mock components
jest.mock("@/components/forms/FormInput", () => ({
  FormInput: ({
    id,
    type,
    label,
    value,
    onChange,
    placeholder,
    helperText,
    required,
    error,
  }: any) => (
    <div data-testid="form-input">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        aria-invalid={!!error}
        data-testid={`input-${id}`}
      />
      {helperText && <span data-testid="helper">{helperText}</span>}
      {error && <span data-testid="error">{error}</span>}
    </div>
  ),
}));

jest.mock("@/components/common/MobileInput", () => ({
  __esModule: true,
  default: ({
    value,
    countryCode,
    onChange,
    onCountryCodeChange,
    label,
    required,
    error,
  }: any) => (
    <div data-testid="mobile-input">
      <label>{label}</label>
      <select
        data-testid="country-code"
        value={countryCode}
        onChange={(e) => onCountryCodeChange?.(e.target.value)}
      >
        <option value="IN">+91</option>
        <option value="US">+1</option>
      </select>
      <input
        data-testid="phone-input"
        type="tel"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        aria-invalid={!!error}
      />
      {error && <span data-testid="phone-error">{error}</span>}
    </div>
  ),
}));

describe("ContactInfoStep", () => {
  const defaultProps: ContactInfoStepProps = {
    phone: "",
    email: "",
    onPhoneChange: jest.fn(),
    onEmailChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render with default props", () => {
      render(<ContactInfoStep {...defaultProps} />);

      expect(screen.getByText("Contact Information")).toBeInTheDocument();
      expect(screen.getByTestId("mobile-input")).toBeInTheDocument();
      expect(screen.getByTestId("form-input")).toBeInTheDocument();
    });

    it("should display section heading", () => {
      render(<ContactInfoStep {...defaultProps} />);

      const heading = screen.getByText("Contact Information");
      expect(heading.tagName).toBe("H3");
    });

    it("should display section description", () => {
      render(<ContactInfoStep {...defaultProps} />);

      expect(
        screen.getByText(
          "Provide contact details for communication and notifications"
        )
      ).toBeInTheDocument();
    });

    it("should render phone input", () => {
      render(<ContactInfoStep {...defaultProps} />);

      expect(screen.getByTestId("phone-input")).toBeInTheDocument();
    });

    it("should render email input", () => {
      render(<ContactInfoStep {...defaultProps} />);

      expect(screen.getByTestId("input-contact-email")).toBeInTheDocument();
    });
  });

  describe("Phone Input", () => {
    it("should display phone value", () => {
      render(<ContactInfoStep {...defaultProps} phone="9876543210" />);

      const phoneInput = screen.getByTestId("phone-input");
      expect(phoneInput).toHaveValue("9876543210");
    });

    it("should call onPhoneChange when phone is typed", async () => {
      const onPhoneChange = jest.fn();
      const user = userEvent.setup();

      render(
        <ContactInfoStep {...defaultProps} onPhoneChange={onPhoneChange} />
      );

      const phoneInput = screen.getByTestId("phone-input");
      await user.type(phoneInput, "9876543210");

      expect(onPhoneChange).toHaveBeenCalled();
    });

    it("should display default country code IN", () => {
      render(<ContactInfoStep {...defaultProps} />);

      const countryCode = screen.getByTestId("country-code");
      expect(countryCode).toHaveValue("IN");
    });

    it("should display custom country code", () => {
      render(<ContactInfoStep {...defaultProps} countryCode="US" />);

      const countryCode = screen.getByTestId("country-code");
      expect(countryCode).toHaveValue("US");
    });

    it("should call onCountryCodeChange when country code changes", async () => {
      const onCountryCodeChange = jest.fn();
      const user = userEvent.setup();

      render(
        <ContactInfoStep
          {...defaultProps}
          onCountryCodeChange={onCountryCodeChange}
        />
      );

      const countryCode = screen.getByTestId("country-code");
      await user.selectOptions(countryCode, "US");

      expect(onCountryCodeChange).toHaveBeenCalledWith("US");
    });

    it("should use default phone label", () => {
      render(<ContactInfoStep {...defaultProps} />);

      expect(screen.getByText("Phone Number")).toBeInTheDocument();
    });

    it("should use custom phone label", () => {
      render(<ContactInfoStep {...defaultProps} phoneLabel="Contact Number" />);

      expect(screen.getByText("Contact Number")).toBeInTheDocument();
    });

    it("should display phone error", () => {
      render(
        <ContactInfoStep {...defaultProps} phoneError="Invalid phone number" />
      );

      expect(screen.getByTestId("phone-error")).toHaveTextContent(
        "Invalid phone number"
      );
    });

    it("should mark phone as required by default", () => {
      render(<ContactInfoStep {...defaultProps} />);

      const phoneInput = screen.getByTestId("phone-input");
      expect(phoneInput).toBeRequired();
    });

    it("should mark phone as not required when specified", () => {
      render(<ContactInfoStep {...defaultProps} phoneRequired={false} />);

      const phoneInput = screen.getByTestId("phone-input");
      expect(phoneInput).not.toBeRequired();
    });

    it("should set aria-invalid on phone error", () => {
      render(<ContactInfoStep {...defaultProps} phoneError="Invalid phone" />);

      const phoneInput = screen.getByTestId("phone-input");
      expect(phoneInput).toHaveAttribute("aria-invalid", "true");
    });
  });

  describe("Email Input", () => {
    it("should display email value", () => {
      render(<ContactInfoStep {...defaultProps} email="test@example.com" />);

      const emailInput = screen.getByTestId("input-contact-email");
      expect(emailInput).toHaveValue("test@example.com");
    });

    it("should call onEmailChange when email is typed", async () => {
      const onEmailChange = jest.fn();
      const user = userEvent.setup();

      render(
        <ContactInfoStep {...defaultProps} onEmailChange={onEmailChange} />
      );

      const emailInput = screen.getByTestId("input-contact-email");
      await user.type(emailInput, "test@example.com");

      expect(onEmailChange).toHaveBeenCalled();
    });

    it("should use default email label", () => {
      render(<ContactInfoStep {...defaultProps} />);

      expect(screen.getByText("Email Address")).toBeInTheDocument();
    });

    it("should use custom email label", () => {
      render(<ContactInfoStep {...defaultProps} emailLabel="Business Email" />);

      expect(screen.getByText("Business Email")).toBeInTheDocument();
    });

    it("should display email helper text", () => {
      render(<ContactInfoStep {...defaultProps} />);

      expect(
        screen.getByText("Primary email address for notifications")
      ).toBeInTheDocument();
    });

    it("should use custom email helper text", () => {
      render(
        <ContactInfoStep
          {...defaultProps}
          emailHelperText="Enter your work email"
        />
      );

      expect(screen.getByText("Enter your work email")).toBeInTheDocument();
    });

    it("should display email error", () => {
      render(
        <ContactInfoStep {...defaultProps} emailError="Invalid email format" />
      );

      const errors = screen.getAllByTestId("error");
      const emailError = errors.find(
        (e) => e.textContent === "Invalid email format"
      );
      expect(emailError).toBeInTheDocument();
    });

    it("should mark email as required by default", () => {
      render(<ContactInfoStep {...defaultProps} />);

      const emailInput = screen.getByTestId("input-contact-email");
      expect(emailInput).toBeRequired();
    });

    it("should mark email as not required when specified", () => {
      render(<ContactInfoStep {...defaultProps} emailRequired={false} />);

      const emailInput = screen.getByTestId("input-contact-email");
      expect(emailInput).not.toBeRequired();
    });

    it("should set aria-invalid on email error", () => {
      render(<ContactInfoStep {...defaultProps} emailError="Invalid email" />);

      const emailInput = screen.getByTestId("input-contact-email");
      expect(emailInput).toHaveAttribute("aria-invalid", "true");
    });

    it("should have correct email input type", () => {
      render(<ContactInfoStep {...defaultProps} />);

      const emailInput = screen.getByTestId("input-contact-email");
      expect(emailInput).toHaveAttribute("type", "email");
    });

    it("should have placeholder text", () => {
      render(<ContactInfoStep {...defaultProps} />);

      const emailInput = screen.getByTestId("input-contact-email");
      expect(emailInput).toHaveAttribute("placeholder", "contact@example.com");
    });
  });

  describe("Dark Mode Support", () => {
    it("should have dark mode classes for heading", () => {
      const { container } = render(<ContactInfoStep {...defaultProps} />);

      const heading = screen.getByText("Contact Information").closest("h3");
      expect(heading).toHaveClass("dark:text-gray-300");
    });

    it("should have dark mode classes for description", () => {
      const { container } = render(<ContactInfoStep {...defaultProps} />);

      const description = screen.getByText(
        "Provide contact details for communication and notifications"
      );
      expect(description).toHaveClass("dark:text-gray-400");
    });
  });

  describe("Responsive Design", () => {
    it("should have space-y spacing", () => {
      const { container } = render(<ContactInfoStep {...defaultProps} />);

      const wrapper = container.querySelector(".space-y-4");
      expect(wrapper).toBeInTheDocument();
    });

    it("should have space-y-2 for header section", () => {
      const { container } = render(<ContactInfoStep {...defaultProps} />);

      const headerSection = container.querySelector(".space-y-2");
      expect(headerSection).toBeInTheDocument();
    });

    it("should have responsive text sizes", () => {
      const { container } = render(<ContactInfoStep {...defaultProps} />);

      const heading = screen.getByText("Contact Information").closest("h3");
      expect(heading).toHaveClass("text-sm");

      const description = screen.getByText(
        "Provide contact details for communication and notifications"
      );
      expect(description).toHaveClass("text-xs");
    });
  });

  describe("Accessibility", () => {
    it("should have semantic heading", () => {
      render(<ContactInfoStep {...defaultProps} />);

      const heading = screen.getByText("Contact Information");
      expect(heading.tagName).toBe("H3");
    });

    it("should have descriptive section text", () => {
      render(<ContactInfoStep {...defaultProps} />);

      const description = screen.getByText(
        "Provide contact details for communication and notifications"
      );
      expect(description.tagName).toBe("P");
    });

    it("should have proper label for email input", () => {
      render(<ContactInfoStep {...defaultProps} />);

      const label = screen.getByText("Email Address");
      expect(label.tagName).toBe("LABEL");
    });

    it("should have proper label for phone input", () => {
      render(<ContactInfoStep {...defaultProps} />);

      const label = screen.getByText("Phone Number");
      expect(label.tagName).toBe("LABEL");
    });
  });

  describe("Form Integration", () => {
    it("should integrate with MobileInput component", () => {
      render(<ContactInfoStep {...defaultProps} />);

      expect(screen.getByTestId("mobile-input")).toBeInTheDocument();
    });

    it("should integrate with FormInput component", () => {
      render(<ContactInfoStep {...defaultProps} />);

      expect(screen.getByTestId("form-input")).toBeInTheDocument();
    });

    it("should pass all phone props correctly", () => {
      render(
        <ContactInfoStep
          {...defaultProps}
          phone="9876543210"
          countryCode="IN"
          phoneRequired={true}
          phoneError="Error"
        />
      );

      const phoneInput = screen.getByTestId("phone-input");
      expect(phoneInput).toHaveValue("9876543210");
      expect(phoneInput).toBeRequired();
      expect(phoneInput).toHaveAttribute("aria-invalid", "true");
    });

    it("should pass all email props correctly", () => {
      render(
        <ContactInfoStep
          {...defaultProps}
          email="test@example.com"
          emailRequired={true}
          emailError="Error"
        />
      );

      const emailInput = screen.getByTestId("input-contact-email");
      expect(emailInput).toHaveValue("test@example.com");
      expect(emailInput).toBeRequired();
      expect(emailInput).toHaveAttribute("aria-invalid", "true");
    });
  });

  describe("Props Validation", () => {
    it("should handle all optional props", () => {
      const { container } = render(
        <ContactInfoStep
          {...defaultProps}
          phoneRequired={false}
          emailRequired={false}
          phoneLabel="Phone"
          emailLabel="Email"
          phoneHelperText="Phone help"
          emailHelperText="Email help"
          phoneError="Phone error"
          emailError="Email error"
        />
      );

      expect(container).toBeInTheDocument();
    });

    it("should work without onCountryCodeChange", () => {
      const { container } = render(<ContactInfoStep {...defaultProps} />);

      expect(container).toBeInTheDocument();
    });

    it("should work with all props provided", () => {
      const props: ContactInfoStepProps = {
        phone: "9876543210",
        email: "test@example.com",
        countryCode: "IN",
        onPhoneChange: jest.fn(),
        onEmailChange: jest.fn(),
        onCountryCodeChange: jest.fn(),
        phoneRequired: true,
        emailRequired: true,
        phoneLabel: "Phone",
        emailLabel: "Email",
        phoneHelperText: "Phone help",
        emailHelperText: "Email help",
        phoneError: "Phone error",
        emailError: "Email error",
      };

      const { container } = render(<ContactInfoStep {...props} />);

      expect(container).toBeInTheDocument();
    });
  });
});
