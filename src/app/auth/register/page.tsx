/**
 * Registration Page
 * 
 * Refactored to use API client, hooks, and reusable components
 */

'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button, Alert, Checkbox } from '@/components';
import { FormField } from '@/components/FormField';
import { PasswordStrengthIndicator } from '@/components/PasswordStrengthIndicator';
import { useRegister, useLogin } from '@/hooks/useAuth';
import { ERROR_MESSAGES, SUCCESS_MESSAGES, ROUTES } from '@/constants';

export default function RegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    registrationType: 'email' as 'email' | 'phone',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    displayName: '',
    acceptTerms: false,
  });
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Register mutation
  const { mutate: register, isLoading: isRegistering } = useRegister({
    onSuccess: async () => {
      // Auto-login after registration
      await login({
        emailOrPhone: formData.registrationType === 'email' ? formData.email : formData.phoneNumber,
        password: formData.password,
      });
    },
    onError: (error) => {
      setMessage({ type: 'error', text: error.message || ERROR_MESSAGES.GENERIC.INTERNAL_ERROR });
    },
  });

  // Login mutation (for auto-login after registration)
  const { mutate: login, isLoading: isLoggingIn } = useLogin({
    onSuccess: () => {
      setMessage({ type: 'success', text: SUCCESS_MESSAGES.AUTH.REGISTER_SUCCESS });
      router.push(ROUTES.USER.PROFILE);
    },
    onError: (error) => {
      // Registration succeeded but login failed - still redirect to login page
      setMessage({ type: 'success', text: 'Registration successful! Please login.' });
      setTimeout(() => router.push(ROUTES.AUTH.LOGIN), 2000);
    },
  });

  const isLoading = isRegistering || isLoggingIn;

  const handleBlur = (field: string) => () => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage(null);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }

    if (formData.password.length < 8) {
      setMessage({ type: 'error', text: ERROR_MESSAGES.VALIDATION.PASSWORD_TOO_SHORT });
      return;
    }

    if (!formData.acceptTerms) {
      setMessage({ type: 'error', text: 'You must accept the terms and conditions' });
      return;
    }

    if (formData.registrationType === 'email' && !formData.email) {
      setMessage({ type: 'error', text: ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD });
      return;
    }

    if (formData.registrationType === 'phone' && !formData.phoneNumber) {
      setMessage({ type: 'error', text: ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD });
      return;
    }

    // Register user
    await register({
      email: formData.registrationType === 'email' ? formData.email : undefined,
      phoneNumber: formData.registrationType === 'phone' ? formData.phoneNumber : undefined,
      password: formData.password,
      displayName: formData.displayName || undefined,
      acceptTerms: formData.acceptTerms,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-950">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div>
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white text-2xl font-bold">L</span>
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Or{' '}
            <Link
              href={ROUTES.AUTH.LOGIN}
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              sign in to your account
            </Link>
          </p>
        </div>

        {/* Alert Messages */}
        {message && (
          <Alert variant={message.type} onClose={() => setMessage(null)}>
            {message.text}
          </Alert>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            {/* Registration Type Toggle */}
            <div className="flex gap-2 p-1 bg-gray-200 dark:bg-gray-800 rounded-lg">
              <button
                type="button"
                onClick={() =>
                  setFormData({ ...formData, registrationType: 'email' })
                }
                className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                  formData.registrationType === 'email'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                Email
              </button>
              <button
                type="button"
                onClick={() =>
                  setFormData({ ...formData, registrationType: 'phone' })
                }
                className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                  formData.registrationType === 'phone'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                Phone
              </button>
            </div>

            {/* Display Name */}
            <FormField
              label="Display Name (Optional)"
              name="displayName"
              type="text"
              value={formData.displayName}
              onChange={(value) => setFormData({ ...formData, displayName: value })}
              onBlur={handleBlur('displayName')}
              touched={touched.displayName}
              disabled={isLoading}
              placeholder="John Doe"
            />

            {/* Email or Phone */}
            {formData.registrationType === 'email' ? (
              <FormField
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={(value) => setFormData({ ...formData, email: value })}
                onBlur={handleBlur('email')}
                touched={touched.email}
                disabled={isLoading}
                placeholder="your@email.com"
                required
              />
            ) : (
              <FormField
                label="Phone Number"
                name="phoneNumber"
                type="tel"
                value={formData.phoneNumber}
                onChange={(value) => setFormData({ ...formData, phoneNumber: value })}
                onBlur={handleBlur('phoneNumber')}
                touched={touched.phoneNumber}
                disabled={isLoading}
                placeholder="+1234567890"
                required
              />
            )}

            {/* Password */}
            <FormField
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={(value) => setFormData({ ...formData, password: value })}
              onBlur={handleBlur('password')}
              touched={touched.password}
              disabled={isLoading}
              placeholder="••••••••"
              required
            />

            {formData.password && (
              <PasswordStrengthIndicator password={formData.password} />
            )}

            {/* Confirm Password */}
            <FormField
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={(value) => setFormData({ ...formData, confirmPassword: value })}
              onBlur={handleBlur('confirmPassword')}
              touched={touched.confirmPassword}
              error={
                formData.confirmPassword &&
                formData.password !== formData.confirmPassword
                  ? 'Passwords do not match'
                  : undefined
              }
              disabled={isLoading}
              placeholder="••••••••"
              required
            />

            {/* Terms and Conditions */}
            <div className="flex items-start">
              <Checkbox
                id="acceptTerms"
                checked={formData.acceptTerms}
                onChange={(e) =>
                  setFormData({ ...formData, acceptTerms: e.target.checked })
                }
              />
              <label
                htmlFor="acceptTerms"
                className="ml-2 text-sm text-gray-600 dark:text-gray-400"
              >
                I agree to the{' '}
                <Link href="/terms" className="text-blue-600 hover:text-blue-500">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link
                  href="/privacy"
                  className="text-blue-600 hover:text-blue-500"
                >
                  Privacy Policy
                </Link>
              </label>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            disabled={isLoading || !formData.acceptTerms}
          >
            {isLoading ? 'Creating account...' : 'Create account'}
          </Button>
        </form>
      </div>
    </div>
  );
}
