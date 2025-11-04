"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/SessionAuthContext";
import { Eye, EyeOff, Phone, Mail, ArrowLeft } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

type LoginMethod = "email" | "phone" | "google";

export default function LoginPage() {
  const [loginMethod, setLoginMethod] = useState<LoginMethod>("email");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<"method" | "otp">("method");

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [verificationId, setVerificationId] = useState("");

  // Validation states
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    phoneNumber: "",
  });
  const [touched, setTouched] = useState({
    email: false,
    password: false,
    phoneNumber: false,
  });

  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams?.get("redirect");
  const { login, user, loading: authLoading } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      const redirectPath =
        redirect ||
        (user.role === "admin"
          ? "/admin"
          : user.role === "seller"
          ? "/seller/dashboard"
          : "/");
      router.push(redirectPath);
    }
  }, [user, authLoading, redirect, router]);

  // Validation functions
  const validateEmail = (value: string): string => {
    if (!value.trim()) return "Email is required";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return "Please enter a valid email address";
    return "";
  };

  const validatePassword = (value: string): string => {
    if (!value) return "Password is required";
    return "";
  };

  const validatePhoneNumber = (value: string): string => {
    if (!value.trim()) return "Phone number is required";
    const phoneRegex = /^(\+\d{1,3}[- ]?)?\d{10}$/;
    if (!phoneRegex.test(value.replace(/\s/g, "")))
      return "Please enter a valid phone number";
    return "";
  };

  // Real-time validation handlers
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

  // Blur handlers
  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));

    switch (field) {
      case "email":
        setErrors((prev) => ({ ...prev, email: validateEmail(email) }));
        break;
      case "password":
        setErrors((prev) => ({
          ...prev,
          password: validatePassword(password),
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

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);

    setErrors({
      email: emailError,
      password: passwordError,
      phoneNumber: "",
    });

    setTouched({
      email: true,
      password: true,
      phoneNumber: false,
    });

    if (emailError || passwordError) {
      toast.error("Please fix the errors before submitting");
      return;
    }

    setLoading(true);
    try {
      // Session-based login - no Firebase client-side auth needed
      await login(email, password);
      // Success toast and redirect are handled by the auth context
    } catch (error: any) {
      console.error("Login error:", error);
      // Error toast is handled by the auth context
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      // TODO: Implement session-based Google OAuth
      // This requires backend OAuth flow, not client-side Firebase
      toast("Google login coming soon!", { icon: "ℹ️" });
    } catch (error: any) {
      console.error("Google login error:", error);
      toast.error(error.message || "Google login failed");
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate phone number
    const phoneError = validatePhoneNumber(phoneNumber);

    setErrors({
      email: "",
      password: "",
      phoneNumber: phoneError,
    });

    setTouched({
      email: false,
      password: false,
      phoneNumber: true,
    });

    if (phoneError) {
      toast.error("Please fix the errors before submitting");
      return;
    }

    setLoading(true);
    try {
      // TODO: Implement session-based phone OTP
      // This requires backend OTP flow
      toast("Phone login coming soon!", { icon: "ℹ️" });
    } catch (error: any) {
      console.error("Phone login error:", error);
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

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome Back
          </h1>
          <p className="text-gray-600">Sign in to your account</p>
        </div>

        {step === "method" ? (
          <>
            {/* Login Method Tabs */}
            <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setLoginMethod("email")}
                className={`flex-1 flex items-center justify-center py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  loginMethod === "email"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Mail className="w-4 h-4 mr-2" />
                Email
              </button>
              <button
                onClick={() => setLoginMethod("phone")}
                className={`flex-1 flex items-center justify-center py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  loginMethod === "phone"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Phone className="w-4 h-4 mr-2" />
                Phone
              </button>
            </div>

            {/* Email Login Form */}
            {loginMethod === "email" && (
              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    onBlur={() => handleBlur("email")}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
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
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => handlePasswordChange(e.target.value)}
                      onBlur={() => handleBlur("password")}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10 ${
                        errors.password && touched.password
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300"
                      }`}
                      placeholder="Enter your password"
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
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? "Signing in..." : "Sign In"}
                </button>
              </form>
            )}

            {/* Phone Login Form */}
            {loginMethod === "phone" && (
              <form onSubmit={handlePhoneLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => handlePhoneNumberChange(e.target.value)}
                    onBlur={() => handleBlur("phoneNumber")}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
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
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? "Sending OTP..." : "Send OTP"}
                </button>
              </form>
            )}

            {/* Google Login */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    Or continue with
                  </span>
                </div>
              </div>
              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full mt-4 bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
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
                Continue with Google
              </button>
            </div>
          </>
        ) : (
          // OTP Verification Form
          <div className="space-y-4">
            <button
              onClick={goBackToMethod}
              className="flex items-center text-blue-600 hover:text-blue-700 mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to login methods
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl tracking-widest"
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
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? "Verifying..." : "Verify Code"}
              </button>
            </form>

            <button
              onClick={handlePhoneLogin}
              disabled={loading}
              className="w-full text-blue-600 hover:text-blue-700 py-2 px-4 text-sm transition-colors"
            >
              Didn't receive code? Resend
            </button>
          </div>
        )}

        {/* Register Link */}
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Don't have an account?{" "}
            <Link
              href="/register"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
