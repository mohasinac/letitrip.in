"use client";

import { useFormState } from "@/hooks/useFormState";
import { useState } from "react";
import { z } from "zod";

// Simulated API call to check email availability
const checkEmailExists = async (email: string): Promise<boolean> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Simulate some emails that already exist
  const existingEmails = [
    "admin@example.com",
    "user@example.com",
    "test@example.com",
  ];

  return existingEmails.includes(email.toLowerCase());
};

// Simulated API call to check username availability
const checkUsernameExists = async (username: string): Promise<boolean> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  // Simulate some usernames that already exist
  const existingUsernames = ["admin", "user", "test", "john_doe"];

  return existingUsernames.includes(username.toLowerCase());
};

// Define Zod schema for synchronous validation
const registrationSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(20, "Username must be at most 20 characters")
      .regex(
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain letters, numbers, and underscores"
      ),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type RegistrationForm = z.infer<typeof registrationSchema>;

export default function AsyncValidationDemoPage() {
  const [submittedData, setSubmittedData] = useState<RegistrationForm | null>(
    null
  );
  const [debounceDelay, setDebounceDelay] = useState(500);

  const {
    formData,
    errors,
    touched,
    validatingFields,
    handleChange,
    handleBlur,
    validate,
    reset,
    isValid,
    isValidating,
  } = useFormState<RegistrationForm>({
    initialData: {
      email: "",
      username: "",
      password: "",
      confirmPassword: "",
    },
    schema: registrationSchema,
    asyncValidators: {
      email: async (value) => {
        if (!value || value.length === 0) return null;

        const exists = await checkEmailExists(value);
        return exists ? "Email is already taken" : null;
      },
      username: async (value) => {
        if (!value || value.length === 0) return null;

        const exists = await checkUsernameExists(value);
        return exists ? "Username is already taken" : null;
      },
    },
    debounceMs: debounceDelay,
    validateOnChange: true,
    validateOnBlur: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const isFormValid = await validate();

    if (isFormValid) {
      setSubmittedData(formData);
      alert("Form submitted successfully! Check the console for data.");
      console.log("Submitted data:", formData);
    } else {
      alert("Form has validation errors. Please fix them before submitting.");
    }
  };

  const handleReset = () => {
    reset();
    setSubmittedData(null);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Async Validation Demo</h1>

      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Demo Features</h2>
        <ul className="text-sm space-y-1">
          <li>✅ Synchronous validation with Zod schema</li>
          <li>
            ✅ Asynchronous validation for email and username availability
          </li>
          <li>✅ Debounced async validation (configurable delay)</li>
          <li>✅ Loading indicators during async validation</li>
          <li>✅ Cancellation of previous async validations</li>
        </ul>
        <div className="mt-3">
          <label className="block text-sm font-medium mb-1">
            Debounce Delay: {debounceDelay}ms
          </label>
          <input
            type="range"
            min="0"
            max="2000"
            step="100"
            value={debounceDelay}
            onChange={(e) => setDebounceDelay(parseInt(e.target.value))}
            className="w-full"
          />
        </div>
        <div className="mt-3 text-sm text-gray-700">
          <strong>Test Values:</strong>
          <p>
            Taken emails: admin@example.com, user@example.com, test@example.com
          </p>
          <p>Taken usernames: admin, user, test, john_doe</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email */}
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="email">
            Email * (with async availability check)
          </label>
          <div className="relative">
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full px-3 py-2 border rounded-md pr-10 ${
                errors.email && touched.email
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
              placeholder="user@example.com"
            />
            {validatingFields.email && (
              <div className="absolute right-3 top-2.5">
                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
          {errors.email && touched.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
          )}
          {validatingFields.email && (
            <p className="text-blue-500 text-sm mt-1">
              Checking email availability...
            </p>
          )}
        </div>

        {/* Username */}
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="username">
            Username * (3-20 chars, with async availability check)
          </label>
          <div className="relative">
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full px-3 py-2 border rounded-md pr-10 ${
                errors.username && touched.username
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
              placeholder="john_doe123"
            />
            {validatingFields.username && (
              <div className="absolute right-3 top-2.5">
                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
          {errors.username && touched.username && (
            <p className="text-red-500 text-sm mt-1">{errors.username}</p>
          )}
          {validatingFields.username && (
            <p className="text-blue-500 text-sm mt-1">
              Checking username availability...
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="password">
            Password * (min 8 chars, 1 upper, 1 lower, 1 number)
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`w-full px-3 py-2 border rounded-md ${
              errors.password && touched.password
                ? "border-red-500"
                : "border-gray-300"
            }`}
            placeholder="********"
          />
          {errors.password && touched.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label
            className="block text-sm font-medium mb-1"
            htmlFor="confirmPassword"
          >
            Confirm Password *
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`w-full px-3 py-2 border rounded-md ${
              errors.confirmPassword && touched.confirmPassword
                ? "border-red-500"
                : "border-gray-300"
            }`}
            placeholder="********"
          />
          {errors.confirmPassword && touched.confirmPassword && (
            <p className="text-red-500 text-sm mt-1">
              {errors.confirmPassword}
            </p>
          )}
        </div>

        {/* Form Status */}
        <div className="flex items-center gap-4 py-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Form Valid:</span>
            <span
              className={`px-2 py-1 rounded text-sm ${
                isValid
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {isValid ? "Yes" : "No"}
            </span>
          </div>
          {isValidating && (
            <span className="text-sm text-gray-600">Validating form...</span>
          )}
          {Object.keys(validatingFields).length > 0 && (
            <span className="text-sm text-blue-600">
              Checking {Object.keys(validatingFields).length} field(s)...
            </span>
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isValidating || Object.keys(validatingFields).length > 0}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed"
          >
            {isValidating ? "Validating..." : "Submit"}
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            Reset
          </button>
        </div>
      </form>

      {/* Submitted Data Display */}
      {submittedData && (
        <div className="mt-8 p-4 bg-green-50 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Submitted Data</h2>
          <pre className="text-sm bg-white p-4 rounded border overflow-auto">
            {JSON.stringify(submittedData, null, 2)}
          </pre>
        </div>
      )}

      {/* Current Errors */}
      {Object.keys(errors).length > 0 && (
        <div className="mt-8 p-4 bg-red-50 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Current Errors</h2>
          <ul className="list-disc list-inside text-sm space-y-1">
            {Object.entries(errors).map(([field, error]) => (
              <li key={field}>
                <strong>{field}:</strong> {error}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
