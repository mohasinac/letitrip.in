/**
 * Firebase Phone Verification Utilities
 * Handles phone number verification with OTP (6-digit code)
 * Uses Firebase Auth Phone Authentication
 */

import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  linkWithPhoneNumber,
  updatePhoneNumber,
  PhoneAuthProvider,
  type ConfirmationResult,
  type User,
} from 'firebase/auth';
import { auth } from './config';

/**
 * Initialize reCAPTCHA verifier for phone authentication
 * Required before sending OTP
 */
export function initializeRecaptcha(
  containerId: string = 'recaptcha-container'
): RecaptchaVerifier {
  // Check if already initialized
  if ((window as any).recaptchaVerifier) {
    return (window as any).recaptchaVerifier;
  }

  const recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
    size: 'invisible', // Use invisible reCAPTCHA
    callback: () => {
      // reCAPTCHA solved, allow phone auth
      console.log('reCAPTCHA verified');
    },
    'expired-callback': () => {
      // reCAPTCHA expired
      console.warn('reCAPTCHA expired, please try again');
    },
  });

  // Store for reuse
  (window as any).recaptchaVerifier = recaptchaVerifier;
  return recaptchaVerifier;
}

/**
 * Clear reCAPTCHA verifier (call on unmount or error)
 */
export function clearRecaptcha(): void {
  if ((window as any).recaptchaVerifier) {
    (window as any).recaptchaVerifier.clear();
    (window as any).recaptchaVerifier = null;
  }
}

/**
 * Send OTP to phone number for new user sign-in
 * Returns confirmation result for verifying the OTP
 */
export async function sendPhoneOTP(
  phoneNumber: string,
  recaptchaVerifier: RecaptchaVerifier
): Promise<ConfirmationResult> {
  try {
    // Format phone number (must include country code)
    const formattedPhone = phoneNumber.startsWith('+')
      ? phoneNumber
      : `+${phoneNumber}`;

    const confirmationResult = await signInWithPhoneNumber(
      auth,
      formattedPhone,
      recaptchaVerifier
    );

    return confirmationResult;
  } catch (error: any) {
    console.error('Error sending OTP:', error);
    
    // Handle specific errors
    if (error.code === 'auth/invalid-phone-number') {
      throw new Error('Invalid phone number format. Include country code (e.g., +1234567890)');
    } else if (error.code === 'auth/too-many-requests') {
      throw new Error('Too many requests. Please try again later.');
    } else if (error.code === 'auth/quota-exceeded') {
      throw new Error('SMS quota exceeded. Please try again tomorrow.');
    }
    
    throw new Error(error.message || 'Failed to send OTP');
  }
}

/**
 * Verify OTP code sent to phone number
 */
export async function verifyPhoneOTP(
  confirmationResult: ConfirmationResult,
  otpCode: string
): Promise<any> {
  try {
    const result = await confirmationResult.confirm(otpCode);
    return result;
  } catch (error: any) {
    console.error('Error verifying OTP:', error);
    
    if (error.code === 'auth/invalid-verification-code') {
      throw new Error('Invalid OTP code. Please check and try again.');
    } else if (error.code === 'auth/code-expired') {
      throw new Error('OTP code expired. Please request a new one.');
    }
    
    throw new Error(error.message || 'Failed to verify OTP');
  }
}

/**
 * Add phone number to existing authenticated user
 * Sends OTP for verification
 */
export async function addPhoneToUser(
  user: User,
  phoneNumber: string,
  recaptchaVerifier: RecaptchaVerifier
): Promise<ConfirmationResult> {
  try {
    const formattedPhone = phoneNumber.startsWith('+')
      ? phoneNumber
      : `+${phoneNumber}`;

    const confirmationResult = await linkWithPhoneNumber(
      user,
      formattedPhone,
      recaptchaVerifier
    );

    return confirmationResult;
  } catch (error: any) {
    console.error('Error adding phone to user:', error);
    
    if (error.code === 'auth/provider-already-linked') {
      throw new Error('Phone number already linked to this account');
    } else if (error.code === 'auth/credential-already-in-use') {
      throw new Error('Phone number already in use by another account');
    }
    
    throw new Error(error.message || 'Failed to add phone number');
  }
}

/**
 * Update phone number for authenticated user
 * Requires recent authentication
 */
export async function updateUserPhoneNumber(
  user: User,
  phoneNumber: string,
  verificationId: string,
  otpCode: string
): Promise<void> {
  try {
    const credential = PhoneAuthProvider.credential(verificationId, otpCode);
    await updatePhoneNumber(user, credential);
  } catch (error: any) {
    console.error('Error updating phone number:', error);
    
    if (error.code === 'auth/requires-recent-login') {
      throw new Error('Please re-authenticate before updating phone number');
    }
    
    throw new Error(error.message || 'Failed to update phone number');
  }
}

/**
 * Get phone auth provider for credential creation
 */
export function getPhoneAuthProvider(): PhoneAuthProvider {
  return new PhoneAuthProvider(auth);
}

/**
 * Format phone number for display (hides middle digits)
 * Example: +1234567890 → +12****7890
 */
export function formatPhoneNumber(phoneNumber: string): string {
  if (!phoneNumber) return '';
  
  if (phoneNumber.length < 8) return phoneNumber;
  
  const start = phoneNumber.slice(0, 3);
  const end = phoneNumber.slice(-4);
  const masked = '*'.repeat(Math.min(phoneNumber.length - 7, 4));
  
  return `${start}${masked}${end}`;
}

/**
 * Validate phone number format
 */
export function isValidPhoneNumber(phoneNumber: string): boolean {
  // Basic validation: starts with + and has 10-15 digits
  const phoneRegex = /^\+[1-9]\d{9,14}$/;
  return phoneRegex.test(phoneNumber);
}

/**
 * Add country code to phone number if missing
 */
export function addCountryCode(
  phoneNumber: string,
  defaultCountryCode: string = '+1'
): string {
  if (phoneNumber.startsWith('+')) {
    return phoneNumber;
  }
  
  // Remove leading zeros or non-digits
  const cleanNumber = phoneNumber.replace(/^0+/, '').replace(/\D/g, '');
  return `${defaultCountryCode}${cleanNumber}`;
}
