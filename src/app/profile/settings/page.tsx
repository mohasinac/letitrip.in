/**
 * Profile Settings Page
 * Path: /profile/settings
 * 
 * Comprehensive user profile management:
 * - General: Display name, photo, email status
 * - Security: Password change, phone verification
 * - Account: Delete account
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, Typography, FormField, Alert } from '@/components';
import { useAuth } from '@/hooks/useAuth';
import { THEME_CONSTANTS } from '@/constants/theme';
import { ERROR_MESSAGES } from '@/constants/messages';
import { apiClient } from '@/lib/api-client';
import { uploadProfilePhoto } from '@/lib/firebase/storage';
import {
  initializeRecaptcha,
  clearRecaptcha,
  sendPhoneOTP,
  verifyPhoneOTP,
  addPhoneToUser,
  formatPhoneNumber,
  isValidPhoneNumber,
} from '@/lib/firebase/phone-verification';
import type { ConfirmationResult } from 'firebase/auth';

type Tab = 'general' | 'security' | 'account';

export default function ProfileSettingsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { themed } = THEME_CONSTANTS;

  const [activeTab, setActiveTab] = useState<Tab>('general');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // General tab state
  const [displayName, setDisplayName] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Security tab state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  // Account tab state
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
      setPhotoPreview(user.photoURL || null);
      setPhoneNumber(user.phoneNumber || '');
    }
  }, [user]);

  // Initialize reCAPTCHA on mount
  useEffect(() => {
    if (activeTab === 'security') {
      try {
        initializeRecaptcha('recaptcha-container');
      } catch (error) {
        console.error('reCAPTCHA initialization error:', error);
      }
    }

    return () => {
      clearRecaptcha();
    };
  }, [activeTab]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    setMessage(null);

    try {
      let photoURL = user.photoURL;

      // Upload photo if changed
      if (photoFile) {
        photoURL = await uploadProfilePhoto(user.uid, photoFile);
      }

      // Update profile via API
      const response = await apiClient.post('/api/profile/update', {
        displayName,
        photoURL,
      });

      if (response.success) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
      } else {
        throw new Error(response.error || 'Failed to update profile');
      }
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || ERROR_MESSAGES.GENERIC.INTERNAL_ERROR,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const response = await apiClient.post('/api/profile/update-password', {
        currentPassword,
        newPassword,
        confirmPassword,
      });

      if (response.success) {
        setMessage({ type: 'success', text: 'Password changed successfully!' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        throw new Error(response.error || 'Failed to change password');
      }
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || ERROR_MESSAGES.GENERIC.INTERNAL_ERROR,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!isValidPhoneNumber(phoneNumber)) {
      setMessage({
        type: 'error',
        text: 'Invalid phone number. Include country code (e.g., +1234567890)',
      });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      // Validate phone number via API
      const validation = await apiClient.post('/api/profile/add-phone', {
        phoneNumber,
      });

      if (!validation.success) {
        throw new Error(validation.error || 'Phone validation failed');
      }

      // Send OTP via Firebase
      const recaptchaVerifier = initializeRecaptcha('recaptcha-container');
      const confirmation = await addPhoneToUser(
        user as any,
        phoneNumber,
        recaptchaVerifier
      );

      setConfirmationResult(confirmation);
      setShowOtpInput(true);
      setMessage({
        type: 'success',
        text: 'OTP sent! Check your phone for the 6-digit code.',
      });
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Failed to send OTP',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmationResult || !user) return;

    setIsLoading(true);
    setMessage(null);

    try {
      // Verify OTP with Firebase
      await verifyPhoneOTP(confirmationResult, otpCode);

      // Confirm verification with API
      const response = await apiClient.post('/api/profile/verify-phone', {
        phoneNumber,
        verified: true,
      });

      if (response.success) {
        setMessage({
          type: 'success',
          text: 'Phone number verified successfully!',
        });
        setShowOtpInput(false);
        setOtpCode('');
      } else {
        throw new Error(response.error || 'Verification failed');
      }
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Failed to verify OTP',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (deleteConfirmation !== 'DELETE') {
      setMessage({
        type: 'error',
        text: 'Please type DELETE to confirm account deletion',
      });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const response = await apiClient.delete('/api/profile/delete-account', {
        password: deletePassword,
        confirmation: 'DELETE',
      });

      if (response.success) {
        setMessage({
          type: 'success',
          text: 'Account deleted successfully. Redirecting...',
        });

        // Sign out and redirect
        setTimeout(() => {
          router.push('/');
        }, 2000);
      } else {
        throw new Error(response.error || 'Failed to delete account');
      }
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || ERROR_MESSAGES.GENERIC.INTERNAL_ERROR,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className={`min-h-screen ${themed.bgPrimary} flex items-center justify-center`}>
        <Typography variant="primary">Loading...</Typography>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className={`min-h-screen ${themed.bgPrimary} py-8 px-4`}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Typography variant="h1" className="mb-2">
            Profile Settings
          </Typography>
          <Typography variant="secondary" className={themed.textSecondary}>
            Manage your account settings and preferences
          </Typography>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-200 dark:border-gray-700">
          {(['general', 'security', 'account'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 px-1 font-medium capitalize ${
                activeTab === tab
                  ? `border-b-2 border-blue-500 ${themed.textPrimary}`
                  : themed.textSecondary
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Message Alert */}
        {message && (
          <div className="mb-6">
            <Alert type={message.type}>{message.text}</Alert>
          </div>
        )}

        {/* General Tab */}
        {activeTab === 'general' && (
          <Card>
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <Typography variant="h2" className="mb-4">
                General Information
              </Typography>

              {/* Profile Photo */}
              <div>
                <label className={`block mb-2 ${themed.textPrimary}`}>
                  Profile Photo
                </label>
                <div className="flex items-center gap-4">
                  {photoPreview && (
                    <img
                      src={photoPreview}
                      alt="Profile"
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className={themed.textSecondary}
                  />
                </div>
              </div>

              {/* Display Name */}
              <FormField
                label="Display Name"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
              />

              {/* Email (read-only) */}
              <FormField
                label="Email"
                type="email"
                value={user.email || ''}
                disabled
              />

              <Button type="submit" variant="primary" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          </Card>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            {/* Change Password */}
            <Card>
              <form onSubmit={handleChangePassword} className="space-y-6">
                <Typography variant="h2" className="mb-4">
                  Change Password
                </Typography>

                <FormField
                  label="Current Password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />

                <FormField
                  label="New Password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />

                <FormField
                  label="Confirm New Password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />

                <Button type="submit" variant="primary" disabled={isLoading}>
                  {isLoading ? 'Updating...' : 'Update Password'}
                </Button>
              </form>
            </Card>

            {/* Phone Verification */}
            <Card>
              <div className="space-y-6">
                <Typography variant="h2" className="mb-4">
                  Phone Verification
                </Typography>

                {user.phoneNumber ? (
                  <div className={themed.textPrimary}>
                    <Typography variant="secondary" className="mb-2">
                      Current phone number:
                    </Typography>
                    <Typography variant="primary">
                      {formatPhoneNumber(user.phoneNumber)}
                    </Typography>
                  </div>
                ) : (
                  <form onSubmit={handleSendOTP} className="space-y-6">
                    <FormField
                      label="Phone Number"
                      type="tel"
                      placeholder="+1234567890"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      required
                    />

                    <Button type="submit" variant="primary" disabled={isLoading}>
                      {isLoading ? 'Sending...' : 'Send OTP'}
                    </Button>
                  </form>
                )}

                {showOtpInput && (
                  <form onSubmit={handleVerifyOTP} className="space-y-6 mt-4">
                    <FormField
                      label="Enter 6-Digit OTP"
                      type="text"
                      placeholder="123456"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      required
                      maxLength={6}
                    />

                    <Button type="submit" variant="primary" disabled={isLoading}>
                      {isLoading ? 'Verifying...' : 'Verify OTP'}
                    </Button>
                  </form>
                )}

                {/* reCAPTCHA container */}
                <div id="recaptcha-container"></div>
              </div>
            </Card>
          </div>
        )}

        {/* Account Tab */}
        {activeTab === 'account' && (
          <Card>
            <form onSubmit={handleDeleteAccount} className="space-y-6">
              <Typography variant="h2" className="mb-4 text-red-600">
                Delete Account
              </Typography>

              <Alert type="error">
                Warning: This action is permanent and cannot be undone. All your
                data will be deleted.
              </Alert>

              <FormField
                label="Password"
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                required
              />

              <FormField
                label="Type DELETE to confirm"
                type="text"
                placeholder="DELETE"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                required
              />

              <Button
                type="submit"
                variant="primary"
                disabled={isLoading || deleteConfirmation !== 'DELETE'}
                className="bg-red-600 hover:bg-red-700"
              >
                {isLoading ? 'Deleting...' : 'Delete Account Permanently'}
              </Button>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
}
