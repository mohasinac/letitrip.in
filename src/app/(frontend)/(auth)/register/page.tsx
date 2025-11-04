"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/SessionAuthContext";
import { Eye, EyeOff, Phone, Mail, ArrowLeft, User } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

type RegisterMethod = "email" | "phone" | "google";

export default function RegisterPage() {
  const [registerMethod, setRegisterMethod] = useState<RegisterMethod>("email");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<"method" | "otp">("method");

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [verificationId, setVerificationId] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"user" | "seller" | "admin">(
    "user"
  );

  // Validation states
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
    terms: "",
  });
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    password: false,
    confirmPassword: false,
    phoneNumber: false,
    terms: false,
  });

  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams?.get("redirect");
  const { register } = useAuth();

  // Validation functions
  const validateName = (value: string): string => {
    if (!value.trim()) return "Name is required";
    if (value.trim().length < 2) return "Name must be at least 2 characters";
    if (value.trim().length > 50) return "Name must be less than 50 characters";
    if (!/^[a-zA-Z\s]+$/.test(value.trim()))
      return "Name should only contain letters and spaces";
    return "";
  };

  const validateEmail = (value: string): string => {
    if (!value.trim()) return "Email is required";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return "Please enter a valid email address";
    return "";
  };

  const validatePassword = (value: string): string => {
    if (!value) return "Password is required";
    if (value.length < 6) return "Password must be at least 6 characters";
    if (value.length > 128) return "Password must be less than 128 characters";
    if (!/(?=.*[a-z])/.test(value))
      return "Password must contain at least one lowercase letter";
    if (!/(?=.*[A-Z])/.test(value))
      return "Password must contain at least one uppercase letter";
    if (!/(?=.*\d)/.test(value))
      return "Password must contain at least one number";
    return "";
  };

  const validateConfirmPassword = (
    value: string,
    originalPassword: string
  ): string => {
    if (!value) return "Please confirm your password";
    if (value !== originalPassword) return "Passwords do not match";
    return "";
  };

  const validatePhoneNumber = (value: string): string => {
    if (!value.trim()) return "Phone number is required";
    const phoneRegex = /^(\+\d{1,3}[- ]?)?\d{10}$/;
    if (!phoneRegex.test(value.replace(/\s/g, "")))
      return "Please enter a valid phone number";
    return "";
  };

  const validateTerms = (value: boolean): string => {
    if (!value) return "You must accept the terms and conditions";
    return "";
  };

  // Real-time validation handlers
  const handleNameChange = (value: string) => {
    setName(value);
    if (touched.name) {
      setErrors((prev) => ({ ...prev, name: validateName(value) }));
    }
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (touched.email) {
      setErrors((prev) => ({ ...prev, email: validateEmail(value) }));
    }
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (touched.password) {
      setErrors((prev) => ({ ...prev, password: validatePassword(value) }));
    }
    if (touched.confirmPassword && confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: validateConfirmPassword(confirmPassword, value),
      }));
    }
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    if (touched.confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: validateConfirmPassword(value, password),
      }));
    }
  };

  const handlePhoneNumberChange = (value: string) => {
    setPhoneNumber(value);
    if (touched.phoneNumber) {
      setErrors((prev) => ({
        ...prev,
        phoneNumber: validatePhoneNumber(value),
      }));
    }
  };

  const handleTermsChange = (value: boolean) => {
    setAcceptTerms(value);
    if (touched.terms) {
      setErrors((prev) => ({ ...prev, terms: validateTerms(value) }));
    }
  };

  // Blur handlers to mark fields as touched
  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));

    switch (field) {
      case "name":
        setErrors((prev) => ({ ...prev, name: validateName(name) }));
        break;
      case "email":
        setErrors((prev) => ({ ...prev, email: validateEmail(email) }));
        break;
      case "password":
        setErrors((prev) => ({
          ...prev,
          password: validatePassword(password),
        }));
        break;
      case "confirmPassword":
        setErrors((prev) => ({
          ...prev,
          confirmPassword: validateConfirmPassword(confirmPassword, password),
        }));
        break;
      case "phoneNumber":
        setErrors((prev) => ({
          ...prev,
          phoneNumber: validatePhoneNumber(phoneNumber),
        }));
        break;
    }
  };

  // Form validation check
  const isEmailFormValid = () => {
    const nameError = validateName(name);
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    const confirmPasswordError = validateConfirmPassword(
      confirmPassword,
      password
    );
    const termsError = validateTerms(acceptTerms);

    return (
      !nameError &&
      !emailError &&
      !passwordError &&
      !confirmPasswordError &&
      !termsError
    );
  };

  const isPhoneFormValid = () => {
    const nameError = validateName(name);
    const phoneError = validatePhoneNumber(phoneNumber);
    const termsError = validateTerms(acceptTerms);

    return !nameError && !phoneError && !termsError;
  };

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const nameError = validateName(name);
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    const confirmPasswordError = validateConfirmPassword(
      confirmPassword,
      password
    );
    const termsError = validateTerms(acceptTerms);

    setErrors({
      name: nameError,
      email: emailError,
      password: passwordError,
      confirmPassword: confirmPasswordError,
      phoneNumber: "",
      terms: termsError,
    });

    setTouched({
      name: true,
      email: true,
      password: true,
      confirmPassword: true,
      phoneNumber: false,
      terms: true,
    });

    if (
      nameError ||
      emailError ||
      passwordError ||
      confirmPasswordError ||
      termsError
    ) {
      toast.error("Please fix the errors before submitting");
      return;
    }

    setLoading(true);
    try {
      // Session-based registration - no Firebase client-side auth needed
      await register(name, email, password, selectedRole);
      // Success toast and redirect are handled by the auth context
    } catch (error: any) {
      console.error("Registration error:", error);
      // Error toast is handled by the auth context
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    // Validate terms acceptance
    const termsError = validateTerms(acceptTerms);

    if (termsError) {
      setErrors((prev) => ({ ...prev, terms: termsError }));
      setTouched((prev) => ({ ...prev, terms: true }));
      toast.error("You must accept the terms and conditions");
      return;
    }

    setLoading(true);
    try {
      // TODO: Implement session-based Google OAuth
      // This requires backend OAuth flow, not client-side Firebase
      toast("Google registration coming soon!", { icon: "ℹ️" });
    } catch (error: any) {
      console.error("Google registration error:", error);
      toast.error(error.message || "Google registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const nameError = validateName(name);
    const phoneError = validatePhoneNumber(phoneNumber);
    const termsError = validateTerms(acceptTerms);

    setErrors({
      name: nameError,
      email: "",
      password: "",
      confirmPassword: "",
      phoneNumber: phoneError,
      terms: termsError,
    });

    setTouched({
      name: true,
      email: false,
      password: false,
      confirmPassword: false,
      phoneNumber: true,
      terms: true,
    });

    if (nameError || phoneError || termsError) {
      toast.error("Please fix the errors before submitting");
      return;
    }

    setLoading(true);
    try {
      // TODO: Implement session-based phone OTP
      // This requires backend OTP flow
      toast("Phone registration coming soon!", { icon: "ℹ️" });
    } catch (error: any) {
      console.error("Phone registration error:", error);
      toast.error(error.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleOTPVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || !verificationId) {
      toast.error("Please enter the OTP");
      return;
    }

    setLoading(true);
    try {
      // TODO: Implement session-based OTP verification
      toast("OTP verification coming soon!", { icon: "ℹ️" });
    } catch (error: any) {
      console.error("OTP verification error:", error);
      toast.error(error.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  const goBackToMethod = () => {
    setStep("method");
    setOtp("");
    setVerificationId("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Create Account
          </h1>
          <p className="text-gray-600">Join us today</p>
        </div>

        {step === "method" ? (
          <>
            {/* Google Registration Button - Top */}
            <div className="mb-6">
              <button
                onClick={handleGoogleRegister}
                disabled={loading || !acceptTerms}
                className="w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Sign up with Google
              </button>
            </div>

            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Or with email/phone
                </span>
              </div>
            </div>

            {/* Registration Method Tabs */}
            <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setRegisterMethod("email")}
                className={`flex-1 flex items-center justify-center py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  registerMethod === "email"
                    ? "bg-white text-green-600 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Mail className="w-4 h-4 mr-2" />
                Email
              </button>
              <button
                onClick={() => setRegisterMethod("phone")}
                className={`flex-1 flex items-center justify-center py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  registerMethod === "phone"
                    ? "bg-white text-green-600 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Phone className="w-4 h-4 mr-2" />
                Phone
              </button>
            </div>

            {/* Email Registration Form */}
            {registerMethod === "email" && (
              <form onSubmit={handleEmailRegister} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    onBlur={() => handleBlur("name")}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      errors.name && touched.name
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300"
                    }`}
                    placeholder="Enter your full name"
                    required
                  />
                  {errors.name && touched.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    onBlur={() => handleBlur("email")}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      errors.email && touched.email
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300"
                    }`}
                    placeholder="Enter your email"
                    required
                  />
                  {errors.email && touched.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Your Role
                  </label>
                  <div className="space-y-2">
                    <label
                      className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => setSelectedRole("user")}
                    >
                      <input
                        type="radio"
                        name="role"
                        value="user"
                        checked={selectedRole === "user"}
                        onChange={() => setSelectedRole("user")}
                        className="w-4 h-4 text-green-600"
                      />
                      <span className="ml-3 flex-1">
                        <span className="block font-medium text-gray-900">
                          Customer
                        </span>
                        <span className="text-sm text-gray-600">
                          Browse and purchase products
                        </span>
                      </span>
                    </label>
                    <label
                      className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => setSelectedRole("seller")}
                    >
                      <input
                        type="radio"
                        name="role"
                        value="seller"
                        checked={selectedRole === "seller"}
                        onChange={() => setSelectedRole("seller")}
                        className="w-4 h-4 text-green-600"
                      />
                      <span className="ml-3 flex-1">
                        <span className="block font-medium text-gray-900">
                          Seller
                        </span>
                        <span className="text-sm text-gray-600">
                          Sell products and manage inventory
                        </span>
                      </span>
                    </label>
                    <label
                      className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => setSelectedRole("admin")}
                    >
                      <input
                        type="radio"
                        name="role"
                        value="admin"
                        checked={selectedRole === "admin"}
                        onChange={() => setSelectedRole("admin")}
                        className="w-4 h-4 text-green-600"
                      />
                      <span className="ml-3 flex-1">
                        <span className="block font-medium text-gray-900">
                          Administrator
                        </span>
                        <span className="text-sm text-gray-600">
                          Manage platform and users (dev only)
                        </span>
                      </span>
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => handlePasswordChange(e.target.value)}
                      onBlur={() => handleBlur("password")}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent pr-10 ${
                        errors.password && touched.password
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300"
                      }`}
                      placeholder="Create a password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {errors.password && touched.password && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.password}
                    </p>
                  )}
                  {password && !errors.password && (
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center text-xs">
                        <span
                          className={`mr-2 ${
                            password.length >= 6
                              ? "text-green-600"
                              : "text-gray-400"
                          }`}
                        >
                          {password.length >= 6 ? "✓" : "○"} At least 6
                          characters
                        </span>
                      </div>
                      <div className="flex items-center text-xs">
                        <span
                          className={`mr-2 ${
                            /(?=.*[a-z])/.test(password)
                              ? "text-green-600"
                              : "text-gray-400"
                          }`}
                        >
                          {/(?=.*[a-z])/.test(password) ? "✓" : "○"} One
                          lowercase letter
                        </span>
                      </div>
                      <div className="flex items-center text-xs">
                        <span
                          className={`mr-2 ${
                            /(?=.*[A-Z])/.test(password)
                              ? "text-green-600"
                              : "text-gray-400"
                          }`}
                        >
                          {/(?=.*[A-Z])/.test(password) ? "✓" : "○"} One
                          uppercase letter
                        </span>
                      </div>
                      <div className="flex items-center text-xs">
                        <span
                          className={`mr-2 ${
                            /(?=.*\d)/.test(password)
                              ? "text-green-600"
                              : "text-gray-400"
                          }`}
                        >
                          {/(?=.*\d)/.test(password) ? "✓" : "○"} One number
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) =>
                      handleConfirmPasswordChange(e.target.value)
                    }
                    onBlur={() => handleBlur("confirmPassword")}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      errors.confirmPassword && touched.confirmPassword
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300"
                    }`}
                    placeholder="Confirm your password"
                    required
                  />
                  {errors.confirmPassword && touched.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.confirmPassword}
                    </p>
                  )}
                  {confirmPassword &&
                    !errors.confirmPassword &&
                    confirmPassword === password && (
                      <p className="mt-1 text-sm text-green-600">
                        ✓ Passwords match
                      </p>
                    )}
                </div>

                <button
                  type="submit"
                  disabled={loading || !isEmailFormValid()}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? "Creating Account..." : "Create Account"}
                </button>
              </form>
            )}

            {/* Phone Registration Form */}
            {registerMethod === "phone" && (
              <form onSubmit={handlePhoneRegister} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    onBlur={() => handleBlur("name")}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      errors.name && touched.name
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300"
                    }`}
                    placeholder="Enter your full name"
                    required
                  />
                  {errors.name && touched.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => handlePhoneNumberChange(e.target.value)}
                    onBlur={() => handleBlur("phoneNumber")}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      errors.phoneNumber && touched.phoneNumber
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300"
                    }`}
                    placeholder="+91 9876543210"
                    required
                  />
                  {errors.phoneNumber && touched.phoneNumber && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.phoneNumber}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Enter your phone number with country code
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Your Role
                  </label>
                  <div className="space-y-2">
                    <label
                      className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => setSelectedRole("user")}
                    >
                      <input
                        type="radio"
                        name="role"
                        value="user"
                        checked={selectedRole === "user"}
                        onChange={() => setSelectedRole("user")}
                        className="w-4 h-4 text-green-600"
                      />
                      <span className="ml-3 flex-1">
                        <span className="block font-medium text-gray-900">
                          Customer
                        </span>
                        <span className="text-sm text-gray-600">
                          Browse and purchase products
                        </span>
                      </span>
                    </label>
                    <label
                      className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => setSelectedRole("seller")}
                    >
                      <input
                        type="radio"
                        name="role"
                        value="seller"
                        checked={selectedRole === "seller"}
                        onChange={() => setSelectedRole("seller")}
                        className="w-4 h-4 text-green-600"
                      />
                      <span className="ml-3 flex-1">
                        <span className="block font-medium text-gray-900">
                          Seller
                        </span>
                        <span className="text-sm text-gray-600">
                          Sell products and manage inventory
                        </span>
                      </span>
                    </label>
                    <label
                      className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => setSelectedRole("admin")}
                    >
                      <input
                        type="radio"
                        name="role"
                        value="admin"
                        checked={selectedRole === "admin"}
                        onChange={() => setSelectedRole("admin")}
                        className="w-4 h-4 text-green-600"
                      />
                      <span className="ml-3 flex-1">
                        <span className="block font-medium text-gray-900">
                          Administrator
                        </span>
                        <span className="text-sm text-gray-600">
                          Manage platform and users (dev only)
                        </span>
                      </span>
                    </label>
                  </div>
                </div>
              </form>
            )}

            {/* Single Terms Agreement Checkbox - Outside Forms */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="terms-agreement"
                  checked={acceptTerms}
                  onChange={(e) => handleTermsChange(e.target.checked)}
                  className={`h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded mt-1 flex-shrink-0 ${
                    errors.terms && touched.terms ? "border-red-500" : ""
                  }`}
                />
                <label
                  htmlFor="terms-agreement"
                  className="ml-2 block text-sm text-gray-700"
                >
                  I agree to the{" "}
                  <Link
                    href="/terms"
                    target="_blank"
                    className="text-green-600 hover:text-green-700 underline"
                  >
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/privacy"
                    target="_blank"
                    className="text-green-600 hover:text-green-700 underline"
                  >
                    Privacy Policy
                  </Link>
                </label>
              </div>
              {errors.terms && touched.terms && (
                <p className="text-sm text-red-600 mt-2">{errors.terms}</p>
              )}
            </div>
          </>
        ) : (
          // OTP Verification Form
          <div className="space-y-4">
            <button
              onClick={goBackToMethod}
              className="flex items-center text-green-600 hover:text-green-700 mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to registration methods
            </button>

            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Verify Phone Number
              </h2>
              <p className="text-gray-600">
                Enter the 6-digit code sent to {phoneNumber}
              </p>
            </div>

            <form onSubmit={handleOTPVerification} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Verification Code
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-center text-2xl tracking-widest"
                  placeholder="123456"
                  maxLength={6}
                  required
                />
                <p className="text-xs text-gray-500 mt-1 text-center">
                  For demo, use: 123456
                </p>
              </div>
              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? "Verifying..." : "Verify & Create Account"}
              </button>
            </form>

            <button
              onClick={handlePhoneRegister}
              disabled={loading}
              className="w-full text-green-600 hover:text-green-700 py-2 px-4 text-sm transition-colors"
            >
              Didn't receive code? Resend
            </button>
          </div>
        )}

        {/* Login Link */}
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-green-600 hover:text-green-700 font-medium"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
