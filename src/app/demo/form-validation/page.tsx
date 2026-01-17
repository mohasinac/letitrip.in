"use client";

import { useFormState } from "@letitrip/react-library";
import { useState } from "react";
import { z } from "zod";

// Define a Zod schema for a registration form
const registrationSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(20, "Username must be at most 20 characters")
      .regex(
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain letters, numbers, and underscores"
      ),
    age: z
      .number()
      .min(18, "Must be at least 18 years old")
      .max(120, "Invalid age"),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: "You must accept the terms and conditions",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type RegistrationForm = z.infer<typeof registrationSchema>;

export default function FormValidationDemoPage() {
  const [submittedData, setSubmittedData] = useState<RegistrationForm | null>(
    null
  );
  const [validateMode, setValidateMode] = useState<"blur" | "change" | "none">(
    "blur"
  );

  const {
    formData,
    errors,
    touched,
    handleChange,
    handleBlur,
    setFieldValue,
    validate,
    validateField,
    reset,
    isValid,
    isValidating,
  } = useFormState<RegistrationForm>({
    initialData: {
      email: "",
      password: "",
      confirmPassword: "",
      username: "",
      age: 18,
      acceptTerms: false,
    },
    schema: registrationSchema,
    validateOnChange: validateMode === "change",
    validateOnBlur: validateMode === "blur",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validate()) {
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
      <h1 className="text-3xl font-bold mb-6">
        Form Validation Demo (Zod Schema)
      </h1>

      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Validation Mode</h2>
        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="validateMode"
              value="none"
              checked={validateMode === "none"}
              onChange={(e) => setValidateMode(e.target.value as any)}
            />
            None
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="validateMode"
              value="blur"
              checked={validateMode === "blur"}
              onChange={(e) => setValidateMode(e.target.value as any)}
            />
            On Blur
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="validateMode"
              value="change"
              checked={validateMode === "change"}
              onChange={(e) => setValidateMode(e.target.value as any)}
            />
            On Change
          </label>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          {validateMode === "none" && "Validation only on submit"}
          {validateMode === "blur" && "Validation when field loses focus"}
          {validateMode === "change" && "Real-time validation as you type"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email */}
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="email">
            Email *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`w-full px-3 py-2 border rounded-md ${
              errors.email && touched.email
                ? "border-red-500"
                : "border-gray-300"
            }`}
            placeholder="user@example.com"
          />
          {errors.email && touched.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
          )}
        </div>

        {/* Username */}
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="username">
            Username * (3-20 chars, alphanumeric + underscore)
          </label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`w-full px-3 py-2 border rounded-md ${
              errors.username && touched.username
                ? "border-red-500"
                : "border-gray-300"
            }`}
            placeholder="john_doe123"
          />
          {errors.username && touched.username && (
            <p className="text-red-500 text-sm mt-1">{errors.username}</p>
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

        {/* Age */}
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="age">
            Age * (18-120)
          </label>
          <input
            type="number"
            id="age"
            name="age"
            value={formData.age}
            onChange={(e) =>
              setFieldValue("age", parseInt(e.target.value) || 0)
            }
            onBlur={handleBlur}
            className={`w-full px-3 py-2 border rounded-md ${
              errors.age && touched.age ? "border-red-500" : "border-gray-300"
            }`}
            min="18"
            max="120"
          />
          {errors.age && touched.age && (
            <p className="text-red-500 text-sm mt-1">{errors.age}</p>
          )}
        </div>

        {/* Accept Terms */}
        <div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              id="acceptTerms"
              name="acceptTerms"
              checked={formData.acceptTerms}
              onChange={handleChange}
              onBlur={handleBlur}
              className="w-4 h-4"
            />
            <span className="text-sm">I accept the terms and conditions *</span>
          </label>
          {errors.acceptTerms && touched.acceptTerms && (
            <p className="text-red-500 text-sm mt-1">{errors.acceptTerms}</p>
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
            <span className="text-sm text-gray-600">Validating...</span>
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-4">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Submit
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={() => {
              const isEmailValid = validateField("email");
              console.log("Email valid:", isEmailValid);
            }}
            className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
          >
            Validate Email
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
