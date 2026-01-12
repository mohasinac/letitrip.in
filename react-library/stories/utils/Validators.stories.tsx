import type { Meta, StoryObj } from "@storybook/react";
import {
  validateEmail,
  validateGST,
  validatePAN,
  validatePassword,
  validatePhone,
  validatePincode,
  validateUrl,
} from "../../src/utils/validators";

const meta = {
  title: "Utils/Validators",
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Validation utilities for common input types including India-specific formats (GST, PAN).",
      },
    },
  },
  tags: ["autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// Helper component to display validation result
const ValidationDisplay = ({
  label,
  value,
  validator,
}: {
  label: string;
  value: string;
  validator: (val: string) => boolean;
}) => {
  const isValid = validator(value);
  return (
    <div
      style={{
        marginBottom: "12px",
        padding: "8px",
        backgroundColor: isValid ? "#d4edda" : "#f8d7da",
        border: `1px solid ${isValid ? "#c3e6cb" : "#f5c6cb"}`,
        borderRadius: "4px",
      }}
    >
      <strong>{label}:</strong> <code>{value}</code>
      <span style={{ marginLeft: "8px" }}>
        {isValid ? "✅ Valid" : "❌ Invalid"}
      </span>
    </div>
  );
};

export const EmailValidation: Story = {
  render: () => (
    <div>
      <h3>Email Validation</h3>
      <ValidationDisplay
        label="Valid Email"
        value="user@example.com"
        validator={validateEmail}
      />
      <ValidationDisplay
        label="Valid Email (subdomain)"
        value="user@mail.example.com"
        validator={validateEmail}
      />
      <ValidationDisplay
        label="Invalid Email"
        value="invalid.email"
        validator={validateEmail}
      />
      <ValidationDisplay
        label="Invalid Email"
        value="@example.com"
        validator={validateEmail}
      />
    </div>
  ),
};

export const PhoneValidation: Story = {
  render: () => (
    <div>
      <h3>Phone Number Validation (Indian)</h3>
      <ValidationDisplay
        label="Valid Indian Mobile"
        value="+919876543210"
        validator={validatePhone}
      />
      <ValidationDisplay
        label="Valid (without +91)"
        value="9876543210"
        validator={validatePhone}
      />
      <ValidationDisplay
        label="Invalid (too short)"
        value="987654321"
        validator={validatePhone}
      />
    </div>
  ),
};

export const PincodeValidation: Story = {
  render: () => (
    <div>
      <h3>Indian Pincode Validation</h3>
      <ValidationDisplay
        label="Valid Pincode"
        value="560001"
        validator={validatePincode}
      />
      <ValidationDisplay
        label="Valid Pincode"
        value="110001"
        validator={validatePincode}
      />
      <ValidationDisplay
        label="Invalid (5 digits)"
        value="56001"
        validator={validatePincode}
      />
    </div>
  ),
};

export const URLValidation: Story = {
  render: () => (
    <div>
      <h3>URL Validation</h3>
      <ValidationDisplay
        label="Valid HTTPS"
        value="https://example.com"
        validator={validateUrl}
      />
      <ValidationDisplay
        label="Valid HTTP"
        value="http://example.com/path"
        validator={validateUrl}
      />
      <ValidationDisplay
        label="Invalid (no protocol)"
        value="example.com"
        validator={validateUrl}
      />
    </div>
  ),
};

export const PasswordStrength: Story = {
  render: () => {
    const PasswordStrengthDisplay = ({ password }: { password: string }) => {
      const result = validatePassword(password);
      return (
        <div
          style={{
            marginBottom: "12px",
            padding: "8px",
            backgroundColor: result.isValid ? "#d4edda" : "#fff3cd",
            border: `1px solid ${result.isValid ? "#c3e6cb" : "#ffeaa7"}`,
            borderRadius: "4px",
          }}
        >
          <div>
            <strong>Password:</strong> <code>{password}</code>
          </div>
          <div style={{ marginTop: "4px" }}>
            <strong>Strength:</strong> {result.strength}
          </div>
          {result.suggestions.length > 0 && (
            <div style={{ marginTop: "4px", fontSize: "12px" }}>
              <strong>Suggestions:</strong>
              <ul style={{ margin: "4px 0", paddingLeft: "20px" }}>
                {result.suggestions.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      );
    };

    return (
      <div>
        <h3>Password Strength Validation</h3>
        <PasswordStrengthDisplay password="weak" />
        <PasswordStrengthDisplay password="Medium123" />
        <PasswordStrengthDisplay password="Strong@Pass123" />
      </div>
    );
  },
};

export const IndianDocuments: Story = {
  render: () => (
    <div>
      <h3>Indian Document Validation</h3>
      <h4>GST Number</h4>
      <ValidationDisplay
        label="Valid GST"
        value="29ABCDE1234F1Z5"
        validator={validateGST}
      />
      <ValidationDisplay
        label="Invalid GST"
        value="29ABCDE1234"
        validator={validateGST}
      />

      <h4>PAN Card</h4>
      <ValidationDisplay
        label="Valid PAN"
        value="ABCDE1234F"
        validator={validatePAN}
      />
      <ValidationDisplay
        label="Invalid PAN"
        value="ABC1234567"
        validator={validatePAN}
      />
    </div>
  ),
};
