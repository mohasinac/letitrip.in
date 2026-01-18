import { FormInput, MobileInput } from "../../index";

export interface ContactInfoStepProps {
  phone: string;
  email: string;
  countryCode?: string;
  onPhoneChange: (phone: string) => void;
  onEmailChange: (email: string) => void;
  onCountryCodeChange?: (code: string) => void;
  phoneRequired?: boolean;
  emailRequired?: boolean;
  phoneLabel?: string;
  emailLabel?: string;
  phoneHelperText?: string;
  emailHelperText?: string;
  phoneError?: string;
  emailError?: string;
  className?: string;
}

/**
 * ContactInfoStep Component
 *
 * Reusable contact section with MobileInput and email validation.
 * Framework-agnostic wizard step for collecting contact information.
 *
 * Features:
 * - Phone input with country code picker
 * - Email input with validation
 * - Configurable labels and helper text
 * - Error message display
 * - Optional/required field support
 *
 * @example
 * ```tsx
 * <ContactInfoStep
 *   phone={formData.phone}
 *   email={formData.email}
 *   countryCode={formData.countryCode}
 *   onPhoneChange={(phone) => setFormData({ ...formData, phone })}
 *   onEmailChange={(email) => setFormData({ ...formData, email })}
 *   onCountryCodeChange={(code) => setFormData({ ...formData, countryCode: code })}
 *   phoneRequired
 *   emailRequired
 * />
 * ```
 */
export function ContactInfoStep({
  phone,
  email,
  countryCode = "IN",
  onPhoneChange,
  onEmailChange,
  onCountryCodeChange,
  phoneRequired = true,
  emailRequired = true,
  phoneLabel = "Phone Number",
  emailLabel = "Email Address",
  phoneHelperText = "Primary contact number",
  emailHelperText = "Primary email address for notifications",
  phoneError,
  emailError,
  className,
}: ContactInfoStepProps) {
  return (
    <div className={className}>
      <div className="space-y-4">
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Contact Information
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Provide contact details for communication and notifications
          </p>
        </div>

        {/* Phone Input */}
        <MobileInput
          value={phone}
          countryCode={countryCode}
          onChange={onPhoneChange}
          onCountryCodeChange={onCountryCodeChange}
          label={phoneLabel}
          required={phoneRequired}
          error={phoneError}
        />

        {/* Email Input */}
        <FormInput
          id="contact-email"
          type="email"
          label={emailLabel}
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          placeholder="contact@example.com"
          helperText={emailHelperText}
          required={emailRequired}
          error={emailError}
        />
      </div>
    </div>
  );
}
