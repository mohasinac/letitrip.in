"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useEnhancedAuth } from "@/hooks/useEnhancedAuth";
import { getRoleDisplayName, getRoleBadgeClasses } from "@/lib/auth/roles";

// Force dynamic rendering to prevent static generation
export const dynamic = "force-dynamic";

function RegisterForm() {
  const { register, loading, error, cookieConsentRequired, setStorageItem } =
    useEnhancedAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "user" as "admin" | "seller" | "user",
    acceptTerms: false,
    isOver18: false,
  });
  const [redirectInfo, setRedirectInfo] = useState<string | null>(null);

  const searchParams = useSearchParams();

  useEffect(() => {
    // Check for redirect parameter and store it
    const redirect = searchParams.get("redirect");
    if (redirect) {
      setRedirectInfo(redirect);
      // Store the redirect for after registration
      setStorageItem("auth_redirect_after_login", redirect);
    }
  }, [searchParams, setStorageItem]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (formData.password !== formData.confirmPassword) {
      // You could add a local error state for form validation if needed
      alert("Passwords do not match");
      return;
    }

    if (!formData.acceptTerms) {
      alert("Please accept the terms and conditions");
      return;
    }

    if (!formData.isOver18) {
      alert("You must be 18 or older to create an account");
      return;
    }

    try {
      await register(
        formData.name,
        formData.email,
        formData.password,
        formData.role,
        formData.isOver18
      );
      // Redirect is handled by the register function in AuthContext
    } catch (err) {
      // Error is handled by AuthContext
      console.error("Registration error:", err);
    }
  };

  return (
    <>
      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold">Create your account</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Join our platform as a customer, seller, or administrator
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-medium text-primary hover:underline"
              >
                Sign in here
              </Link>
            </p>
          </div>

          <div className="card p-8">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {redirectInfo && (
                <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded">
                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 mr-2 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <div>
                      <p className="font-medium">
                        You'll be redirected after registration
                      </p>
                      <p className="text-sm text-blue-600">
                        To:{" "}
                        {redirectInfo.length > 50
                          ? `${redirectInfo.substring(0, 50)}...`
                          : redirectInfo}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {cookieConsentRequired && (
                <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded">
                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 mr-2 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <div>
                      <p className="font-medium">Cookie consent required</p>
                      <p className="text-sm text-amber-600">
                        Your browser doesn't support local storage. Please
                        accept cookies to save your registration data.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 mr-2 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>{error}</span>
                  </div>
                </div>
              )}

              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium mb-2"
                >
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  className="input w-full"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium mb-2"
                >
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="input w-full"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label
                  htmlFor="role"
                  className="block text-sm font-medium mb-2"
                >
                  Account Type
                </label>
                <select
                  id="role"
                  name="role"
                  required
                  className="input w-full"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="user">
                    🛒 Customer - Browse and purchase products
                  </option>
                  <option value="seller">
                    🏪 Seller - Sell products and manage inventory
                  </option>
                  <option value="admin">
                    ⚡ Administrator - Full platform access
                  </option>
                </select>
                <div className="mt-2 flex items-center space-x-2">
                  <span className="text-xs text-gray-500">Selected:</span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium border ${getRoleBadgeClasses(
                      formData.role
                    )}`}
                  >
                    {getRoleDisplayName(formData.role)}
                  </span>
                </div>

                {/* Role Information */}
                <div className="mt-3 p-3 bg-gray-50 rounded-lg border">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">
                    Access Permissions:
                  </h4>
                  {formData.role === "user" && (
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>✅ Browse and purchase products</li>
                      <li>✅ Manage account and orders</li>
                      <li>✅ Leave reviews and ratings</li>
                      <li>✅ Participate in auctions</li>
                    </ul>
                  )}
                  {formData.role === "seller" && (
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>✅ All customer features</li>
                      <li>✅ Access to seller dashboard</li>
                      <li>✅ Add and manage products</li>
                      <li>✅ Process orders and inventory</li>
                      <li>✅ View sales analytics</li>
                    </ul>
                  )}
                  {formData.role === "admin" && (
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>✅ All customer and seller features</li>
                      <li>✅ Access to admin dashboard</li>
                      <li>✅ Manage all users and orders</li>
                      <li>✅ Platform-wide analytics</li>
                      <li>✅ System configuration</li>
                    </ul>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium mb-2"
                >
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="input w-full"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  At least 8 characters with letters and numbers
                </p>
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium mb-2"
                >
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="input w-full"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-start">
                  <input
                    id="isOver18"
                    name="isOver18"
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 mt-1"
                    checked={formData.isOver18}
                    onChange={handleChange}
                  />
                  <label
                    htmlFor="isOver18"
                    className="ml-2 block text-sm text-muted-foreground"
                  >
                    I confirm that I am 18 years or older
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                </div>

                <div className="flex items-start">
                  <input
                    id="acceptTerms"
                    name="acceptTerms"
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 mt-1"
                    checked={formData.acceptTerms}
                    onChange={handleChange}
                  />
                  <label
                    htmlFor="acceptTerms"
                    className="ml-2 block text-sm text-muted-foreground"
                  >
                    I agree to the{" "}
                    <Link
                      href="/terms"
                      className="text-primary hover:underline"
                    >
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link
                      href="/privacy"
                      className="text-primary hover:underline"
                    >
                      Privacy Policy
                    </Link>
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn btn-primary py-3 text-base disabled:opacity-50"
              >
                {loading ? "Creating account..." : "Create account"}
              </button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-muted-foreground">
                    Or sign up with
                  </span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <button className="btn btn-outline w-full">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Google
                </button>
                <button className="btn btn-outline w-full">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  Facebook
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <Suspense
        fallback={
          <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
            <div className="max-w-md w-full space-y-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold">Loading...</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Please wait while we prepare the registration form
                </p>
              </div>
            </div>
          </main>
        }
      >
        <RegisterForm />
      </Suspense>
      <Footer />
    </div>
  );
}
