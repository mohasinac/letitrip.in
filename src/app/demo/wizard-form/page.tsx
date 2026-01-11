"use client";

import { useWizardFormState } from "@/hooks/useWizardFormState";
import { z } from "zod";

// Define Zod schemas for each step
const step1Schema = z.object({
  email: z.string().email("Invalid email address"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores"
    ),
});

const step2Schema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  phone: z.string().regex(/^\d{10}$/, "Phone must be exactly 10 digits"),
});

const step3Schema = z.object({
  address: z.string().min(10, "Address must be at least 10 characters"),
  city: z.string().min(2, "City name must be at least 2 characters"),
  zipCode: z.string().regex(/^\d{6}$/, "ZIP code must be exactly 6 digits"),
});

type WizardFormData = {
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  city: string;
  zipCode: string;
};

export default function WizardFormDemoPage() {
  const wizard = useWizardFormState<WizardFormData>({
    steps: ["Account", "Personal", "Address"],
    initialData: {
      email: "",
      username: "",
      firstName: "",
      lastName: "",
      phone: "",
      address: "",
      city: "",
      zipCode: "",
    },
    stepSchemas: [step1Schema, step2Schema, step3Schema],
    validateBeforeNext: true,
    autoMarkComplete: true,
  });

  const handleSubmit = () => {
    wizard.setIsSubmitting(true);

    // Validate all steps before final submit
    const allValid = [0, 1, 2].every((stepIndex) =>
      wizard.validateStep(stepIndex)
    );

    if (allValid) {
      alert("Form submitted successfully! Check console for data.");
      console.log("Submitted data:", wizard.formData);
      wizard.setIsSubmitting(false);
      wizard.reset();
    } else {
      alert("Please complete all steps correctly before submitting.");
      wizard.setIsSubmitting(false);
    }
  };

  const currentStepErrors = wizard.getStepErrors(wizard.currentStep);

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">
        Multi-Step Wizard Form Demo (Zod Validation)
      </h1>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          {wizard.stepStates.map((state, index) => (
            <div key={index} className="flex flex-col items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold mb-1 ${
                  index === wizard.currentStep
                    ? "bg-blue-600 text-white"
                    : state.isComplete
                    ? "bg-green-500 text-white"
                    : state.hasErrors
                    ? "bg-red-500 text-white"
                    : "bg-gray-300 text-gray-600"
                }`}
              >
                {state.isComplete ? "✓" : index + 1}
              </div>
              <span className="text-xs text-gray-600">
                {wizard.steps[index]}
              </span>
              {state.hasErrors && (
                <span className="text-xs text-red-500">
                  {state.errorCount} errors
                </span>
              )}
            </div>
          ))}
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${wizard.stepProgress}%` }}
          />
        </div>
        <p className="text-sm text-gray-600 mt-2 text-center">
          Step {wizard.currentStep + 1} of {wizard.totalSteps} -{" "}
          {wizard.currentStepName}
        </p>
      </div>

      {/* Form Content */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        {/* Step 1: Account */}
        {wizard.currentStep === 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Account Information</h2>

            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="email">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                value={wizard.formData.email || ""}
                onChange={(e) => wizard.updateFormData("email", e.target.value)}
                className={`w-full px-3 py-2 border rounded-md ${
                  currentStepErrors.email ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="user@example.com"
              />
              {currentStepErrors.email && (
                <p className="text-red-500 text-sm mt-1">
                  {currentStepErrors.email}
                </p>
              )}
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-1"
                htmlFor="username"
              >
                Username * (3-20 chars, alphanumeric)
              </label>
              <input
                type="text"
                id="username"
                value={wizard.formData.username || ""}
                onChange={(e) =>
                  wizard.updateFormData("username", e.target.value)
                }
                className={`w-full px-3 py-2 border rounded-md ${
                  currentStepErrors.username
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
                placeholder="john_doe123"
              />
              {currentStepErrors.username && (
                <p className="text-red-500 text-sm mt-1">
                  {currentStepErrors.username}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Personal */}
        {wizard.currentStep === 1 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Personal Information</h2>

            <div>
              <label
                className="block text-sm font-medium mb-1"
                htmlFor="firstName"
              >
                First Name * (min 2 chars)
              </label>
              <input
                type="text"
                id="firstName"
                value={wizard.formData.firstName || ""}
                onChange={(e) =>
                  wizard.updateFormData("firstName", e.target.value)
                }
                className={`w-full px-3 py-2 border rounded-md ${
                  currentStepErrors.firstName
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
                placeholder="John"
              />
              {currentStepErrors.firstName && (
                <p className="text-red-500 text-sm mt-1">
                  {currentStepErrors.firstName}
                </p>
              )}
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-1"
                htmlFor="lastName"
              >
                Last Name * (min 2 chars)
              </label>
              <input
                type="text"
                id="lastName"
                value={wizard.formData.lastName || ""}
                onChange={(e) =>
                  wizard.updateFormData("lastName", e.target.value)
                }
                className={`w-full px-3 py-2 border rounded-md ${
                  currentStepErrors.lastName
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
                placeholder="Doe"
              />
              {currentStepErrors.lastName && (
                <p className="text-red-500 text-sm mt-1">
                  {currentStepErrors.lastName}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="phone">
                Phone Number * (10 digits)
              </label>
              <input
                type="tel"
                id="phone"
                value={wizard.formData.phone || ""}
                onChange={(e) => wizard.updateFormData("phone", e.target.value)}
                className={`w-full px-3 py-2 border rounded-md ${
                  currentStepErrors.phone ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="9876543210"
              />
              {currentStepErrors.phone && (
                <p className="text-red-500 text-sm mt-1">
                  {currentStepErrors.phone}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Address */}
        {wizard.currentStep === 2 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Address Information</h2>

            <div>
              <label
                className="block text-sm font-medium mb-1"
                htmlFor="address"
              >
                Street Address * (min 10 chars)
              </label>
              <input
                type="text"
                id="address"
                value={wizard.formData.address || ""}
                onChange={(e) =>
                  wizard.updateFormData("address", e.target.value)
                }
                className={`w-full px-3 py-2 border rounded-md ${
                  currentStepErrors.address
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
                placeholder="123 Main Street"
              />
              {currentStepErrors.address && (
                <p className="text-red-500 text-sm mt-1">
                  {currentStepErrors.address}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="city">
                City * (min 2 chars)
              </label>
              <input
                type="text"
                id="city"
                value={wizard.formData.city || ""}
                onChange={(e) => wizard.updateFormData("city", e.target.value)}
                className={`w-full px-3 py-2 border rounded-md ${
                  currentStepErrors.city ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Mumbai"
              />
              {currentStepErrors.city && (
                <p className="text-red-500 text-sm mt-1">
                  {currentStepErrors.city}
                </p>
              )}
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-1"
                htmlFor="zipCode"
              >
                ZIP Code * (6 digits)
              </label>
              <input
                type="text"
                id="zipCode"
                value={wizard.formData.zipCode || ""}
                onChange={(e) =>
                  wizard.updateFormData("zipCode", e.target.value)
                }
                className={`w-full px-3 py-2 border rounded-md ${
                  currentStepErrors.zipCode
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
                placeholder="400001"
              />
              {currentStepErrors.zipCode && (
                <p className="text-red-500 text-sm mt-1">
                  {currentStepErrors.zipCode}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center">
        <button
          onClick={wizard.previousStep}
          disabled={wizard.isFirstStep}
          className={`px-6 py-2 rounded-md ${
            wizard.isFirstStep
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-gray-200 text-gray-800 hover:bg-gray-300"
          }`}
        >
          Previous
        </button>

        <div className="flex gap-4">
          <button
            onClick={wizard.reset}
            className="px-6 py-2 bg-red-200 text-red-800 rounded-md hover:bg-red-300"
          >
            Reset
          </button>

          <button
            onClick={() => wizard.validateStep(wizard.currentStep)}
            disabled={wizard.isValidating}
            className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-purple-300"
          >
            {wizard.isValidating ? "Validating..." : "Validate Step"}
          </button>
        </div>

        {!wizard.isLastStep ? (
          <button
            onClick={wizard.nextStep}
            disabled={wizard.isValidating}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
          >
            {wizard.isValidating ? "Validating..." : "Next"}
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={wizard.isSubmitting || !wizard.isAllValid}
            className={`px-6 py-2 rounded-md ${
              wizard.isSubmitting || !wizard.isAllValid
                ? "bg-green-300 text-gray-500 cursor-not-allowed"
                : "bg-green-600 text-white hover:bg-green-700"
            }`}
          >
            {wizard.isSubmitting ? "Submitting..." : "Submit"}
          </button>
        )}
      </div>

      {/* Current Form Data Preview */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Current Form Data</h2>
        <pre className="text-sm bg-white p-4 rounded border overflow-auto">
          {JSON.stringify(wizard.formData, null, 2)}
        </pre>
      </div>

      {/* All Steps Status */}
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Steps Status</h2>
        <div className="space-y-2">
          {wizard.stepStates.map((state, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2 bg-white rounded border"
            >
              <span className="font-medium">
                Step {index + 1}: {wizard.steps[index]}
              </span>
              <div className="flex gap-2 text-sm">
                <span
                  className={
                    state.isComplete ? "text-green-600" : "text-gray-400"
                  }
                >
                  {state.isComplete ? "✓ Complete" : "Incomplete"}
                </span>
                <span
                  className={state.isValid ? "text-green-600" : "text-red-600"}
                >
                  {state.isValid ? "Valid" : `${state.errorCount} errors`}
                </span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-2 text-sm">
          <strong>All Valid:</strong>{" "}
          <span
            className={wizard.isAllValid ? "text-green-600" : "text-red-600"}
          >
            {wizard.isAllValid ? "Yes" : "No"}
          </span>
        </div>
      </div>
    </div>
  );
}
