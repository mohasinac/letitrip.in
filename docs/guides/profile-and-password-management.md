# User Profile & Password Management

This guide covers the user profile management, email verification, and password reset features of the authentication system.

## Features Overview

### 1. User Profile Management
- **View Profile**: Display current user information
- **Update Profile**: Modify display name, phone number, and photo URL
- **Email Verification Status**: Check if email is verified
- **Role Display**: View assigned role (user, admin, moderator)

### 2. Change Password
- **Secure Password Change**: Verify current password before setting new one
- **Password Strength Indicator**: Real-time feedback on password strength
- **OAuth Account Protection**: Password change not available for OAuth-only accounts

### 3. Email Verification
- **Send Verification Email**: Request email verification link
- **Verify Email**: Confirm email ownership via token
- **Automatic Session Update**: Email verified status reflected immediately

### 4. Password Reset Flow
- **Forgot Password**: Request password reset via email
- **Reset Token**: Secure, time-limited reset tokens (1 hour expiration)
- **New Password Setup**: Set new password with strength validation

---

## File Structure

```
src/
├── app/
│   ├── profile/
│   │   └── page.tsx                           # User profile page
│   ├── auth/
│   │   ├── verify-email/
│   │   │   └── page.tsx                       # Email verification page
│   │   ├── forgot-password/
│   │   │   └── page.tsx                       # Forgot password page
│   │   └── reset-password/
│   │       └── page.tsx                       # Reset password page
│   └── api/
│       ├── user/
│       │   ├── profile/
│       │   │   └── route.ts                   # Profile API (GET, PUT)
│       │   └── change-password/
│       │       └── route.ts                   # Change password API
│       └── auth/
│           ├── verify-email/
│           │   └── route.ts                   # Email verification API
│           └── reset-password/
│               └── route.ts                   # Password reset API
```

---

## API Endpoints

### Profile Management

#### GET `/api/user/profile`
Get current user's profile information.

**Authentication**: Required (session)

**Response**:
```json
{
  "success": true,
  "user": {
    "uid": "user123",
    "email": "user@example.com",
    "phoneNumber": "+1234567890",
    "displayName": "John Doe",
    "photoURL": "https://example.com/photo.jpg",
    "role": "user",
    "emailVerified": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### PUT `/api/user/profile`
Update current user's profile.

**Authentication**: Required (session)

**Request Body**:
```json
{
  "displayName": "Jane Doe",
  "phoneNumber": "+1234567890",
  "photoURL": "https://example.com/new-photo.jpg"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": {
    "uid": "user123",
    "displayName": "Jane Doe",
    "phoneNumber": "+1234567890",
    "photoURL": "https://example.com/new-photo.jpg",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Password Management

#### POST `/api/user/change-password`
Change user password (requires current password).

**Authentication**: Required (session)

**Request Body**:
```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "NewSecurePass123"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

**Error Responses**:
- `401`: Current password is incorrect
- `400`: Password change not available for OAuth accounts
- `400`: New password must be different from current password

### Email Verification

#### POST `/api/auth/send-verification`
Send email verification link to current user's email.

**Authentication**: Required (session)

**Response**:
```json
{
  "success": true,
  "message": "Verification email sent successfully",
  "verificationLink": "http://localhost:3000/auth/verify-email?token=abc123..." // Development only
}
```

**Error Responses**:
- `400`: No email address associated with account
- `400`: Email is already verified

#### GET `/api/auth/verify-email?token={token}`
Verify email address using verification token.

**Authentication**: Not required

**Query Parameters**:
- `token`: Verification token (required)

**Response**:
```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

**Error Responses**:
- `400`: Invalid or expired verification token
- `400`: Verification token has expired

### Password Reset

#### POST `/api/auth/reset-password`
Request password reset (send reset link to email).

**Authentication**: Not required

**Request Body**:
```json
{
  "email": "user@example.com"
}
```

**Response**:
```json
{
  "success": true,
  "message": "If an account exists with that email, a password reset link has been sent.",
  "resetLink": "http://localhost:3000/auth/reset-password?token=xyz789..." // Development only
}
```

**Note**: For security, always returns success even if email doesn't exist.

#### PUT `/api/auth/reset-password`
Complete password reset using token.

**Authentication**: Not required

**Request Body**:
```json
{
  "token": "xyz789...",
  "newPassword": "NewSecurePass123"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

**Error Responses**:
- `400`: Invalid or expired reset token
- `400`: Reset token has expired
- `400`: Reset token has already been used

---

## User Flows

### Profile Update Flow

1. User navigates to `/profile`
2. Profile page fetches current user data via `GET /api/user/profile`
3. User modifies display name, phone, or photo URL
4. User submits form
5. `PUT /api/user/profile` updates Firestore
6. Profile page refetches data and updates session
7. Success message displayed

### Change Password Flow

1. User clicks "Change Password" on profile page
2. Password form appears
3. User enters current password and new password
4. Form validates password strength and match
5. `POST /api/user/change-password` verifies current password
6. If valid, new password is hashed and stored
7. Success message displayed, form hidden

### Email Verification Flow

1. User sees "Not verified" status on profile page
2. User clicks "Send Verification Email"
3. `POST /api/auth/send-verification` generates token
4. Verification link sent to user's email (or logged in dev mode)
5. User clicks link in email
6. Browser navigates to `/auth/verify-email?token=...`
7. `GET /api/auth/verify-email` validates token
8. User's `emailVerified` status updated
9. Success page displayed with link to profile

### Password Reset Flow

1. User clicks "Forgot Password?" on login page
2. Browser navigates to `/auth/forgot-password`
3. User enters email address
4. `POST /api/auth/reset-password` generates reset token
5. Reset link sent to email (or logged in dev mode)
6. User clicks link in email
7. Browser navigates to `/auth/reset-password?token=...`
8. User enters new password (with strength indicator)
9. `PUT /api/auth/reset-password` validates token and updates password
10. Success page displayed with link to login

---

## Security Features

### Password Requirements
- Minimum 8 characters
- At least one lowercase letter
- At least one uppercase letter
- At least one number
- Optional: Special characters for stronger passwords

### Password Hashing
- Uses bcrypt with 12 salt rounds
- Industry-standard secure hashing
- One-way encryption (passwords cannot be decrypted)

### Token Security
- **Verification Tokens**: 32-byte random hex, 24-hour expiration
- **Reset Tokens**: 32-byte random hex, 1-hour expiration
- Tokens stored in Firestore collections
- Single-use tokens (marked as used after consumption)
- Automatic cleanup of expired tokens

### Rate Limiting
Consider implementing rate limiting for:
- Password reset requests (e.g., 3 per hour per email)
- Email verification requests (e.g., 5 per hour per user)
- Password change attempts (e.g., 5 per hour per user)

---

## Email Configuration

The system uses placeholder email sending in development. In production, integrate with an email service:

### Option 1: SendGrid

```bash
npm install @sendgrid/mail
```

```typescript
// src/lib/email/sendgrid.ts
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export async function sendEmail(to: string, subject: string, html: string) {
  await sgMail.send({
    to,
    from: process.env.SENDGRID_FROM_EMAIL!,
    subject,
    html,
  });
}
```

### Option 2: AWS SES

```bash
npm install @aws-sdk/client-ses
```

```typescript
// src/lib/email/ses.ts
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

const client = new SESClient({
  region: process.env.AWS_SES_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_SES_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SES_SECRET_ACCESS_KEY!,
  },
});

export async function sendEmail(to: string, subject: string, html: string) {
  await client.send(new SendEmailCommand({
    Destination: { ToAddresses: [to] },
    Message: {
      Subject: { Data: subject },
      Body: { Html: { Data: html } },
    },
    Source: process.env.AWS_SES_FROM_EMAIL!,
  }));
}
```

### Option 3: Nodemailer (SMTP)

```bash
npm install nodemailer
npm install --save-dev @types/nodemailer
```

```typescript
// src/lib/email/nodemailer.ts
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function sendEmail(to: string, subject: string, html: string) {
  await transporter.sendMail({
    from: process.env.SMTP_FROM_EMAIL,
    to,
    subject,
    html,
  });
}
```

### Email Templates

Create professional email templates:

**Verification Email**:
```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .button { display: inline-block; padding: 12px 24px; background: #4F46E5; color: white; text-decoration: none; border-radius: 5px; }
  </style>
</head>
<body>
  <div class="container">
    <h2>Verify Your Email Address</h2>
    <p>Thank you for creating an account. Please verify your email address by clicking the button below:</p>
    <p><a href="{{verificationLink}}" class="button">Verify Email</a></p>
    <p>Or copy and paste this link into your browser:</p>
    <p>{{verificationLink}}</p>
    <p>This link will expire in 24 hours.</p>
    <p>If you didn't create an account, please ignore this email.</p>
  </div>
</body>
</html>
```

**Password Reset Email**:
```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .button { display: inline-block; padding: 12px 24px; background: #EF4444; color: white; text-decoration: none; border-radius: 5px; }
  </style>
</head>
<body>
  <div class="container">
    <h2>Reset Your Password</h2>
    <p>We received a request to reset your password. Click the button below to set a new password:</p>
    <p><a href="{{resetLink}}" class="button">Reset Password</a></p>
    <p>Or copy and paste this link into your browser:</p>
    <p>{{resetLink}}</p>
    <p>This link will expire in 1 hour for security reasons.</p>
    <p>If you didn't request a password reset, please ignore this email and your password will remain unchanged.</p>
  </div>
</body>
</html>
```

---

## Firestore Collections

### Users Collection
```
users/{userId}
├── email: string
├── phoneNumber: string
├── displayName: string
├── photoURL: string
├── role: string
├── emailVerified: boolean
├── passwordHash: string
├── createdAt: timestamp
└── updatedAt: timestamp
```

### Email Verification Tokens
```
emailVerificationTokens/{token}
├── userId: string
├── email: string
├── token: string
├── expiresAt: timestamp
└── createdAt: timestamp
```

### Password Reset Tokens
```
passwordResetTokens/{token}
├── userId: string
├── email: string
├── token: string
├── expiresAt: timestamp
├── used: boolean
├── createdAt: timestamp
└── usedAt: timestamp (optional)
```

---

## UI Components Usage

### Profile Page
```tsx
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      {/* Profile content */}
    </ProtectedRoute>
  );
}
```

### Email Verification Button
```tsx
const handleSendVerification = async () => {
  const response = await fetch('/api/auth/send-verification', {
    method: 'POST',
  });
  const data = await response.json();
  // Handle response
};
```

### Password Change Form
```tsx
const handleChangePassword = async (currentPassword, newPassword) => {
  const response = await fetch('/api/user/change-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  const data = await response.json();
  // Handle response
};
```

---

## Testing

### Manual Testing Checklist

**Profile Management**:
- [ ] View profile information
- [ ] Update display name
- [ ] Update phone number
- [ ] Update photo URL
- [ ] Verify session updates after profile change

**Change Password**:
- [ ] Change password with correct current password
- [ ] Try to change with incorrect current password (should fail)
- [ ] Try to use same password as current (should fail)
- [ ] Verify password strength indicator works
- [ ] Verify passwords match validation
- [ ] OAuth user cannot change password

**Email Verification**:
- [ ] Send verification email
- [ ] Check email received (or console log in dev)
- [ ] Click verification link
- [ ] Verify email status updates
- [ ] Try expired token (wait 24 hours or modify expiration)
- [ ] Try invalid token

**Password Reset**:
- [ ] Request password reset
- [ ] Check email received (or console log in dev)
- [ ] Click reset link
- [ ] Set new password
- [ ] Login with new password
- [ ] Try expired token (wait 1 hour or modify expiration)
- [ ] Try used token (should fail)
- [ ] Try invalid token

### Development Mode

In development, verification and reset links are logged to the console:

```bash
# Terminal output when sending verification email
Verification link: http://localhost:3000/auth/verify-email?token=abc123...

# Terminal output when requesting password reset
Password reset link: http://localhost:3000/auth/reset-password?token=xyz789...
```

---

## Best Practices

1. **Always use HTTPS in production** for secure token transmission
2. **Implement rate limiting** to prevent abuse
3. **Log security events** (password changes, reset requests, etc.)
4. **Send notification emails** when security-sensitive actions occur
5. **Clear expired tokens** regularly (consider a cron job)
6. **Use professional email templates** for better user experience
7. **Validate all inputs** on both client and server
8. **Never expose sensitive information** in error messages
9. **Test all flows** thoroughly before production deployment
10. **Monitor failed attempts** for suspicious activity

---

## Troubleshooting

### Email verification not working
- Check Firebase Admin SDK credentials
- Verify Firestore security rules allow writes to emailVerificationTokens
- Check token expiration time
- Ensure NEXTAUTH_URL is correct

### Password reset failing
- Verify user has a passwordHash (not OAuth-only)
- Check token hasn't expired (1 hour limit)
- Ensure token hasn't been used already
- Verify bcrypt is installed and working

### Profile update not persisting
- Check session is valid
- Verify Firestore write permissions
- Ensure validation passes
- Check network requests in browser DevTools

### OAuth users can't change password
- This is expected behavior
- OAuth users authenticate through their provider
- Password change is only for email/phone credential users

---

## Next Steps

1. **Integrate Email Service**: Choose and configure SendGrid, AWS SES, or SMTP
2. **Implement Rate Limiting**: Add protection against abuse
3. **Add Notification Emails**: Send confirmations for security events
4. **Create Admin Tools**: Build user management interface
5. **Add Activity Logs**: Track user actions for security auditing
6. **Implement 2FA**: Add two-factor authentication option
7. **Profile Photo Upload**: Add file upload for profile pictures
8. **Account Deletion**: Allow users to delete their accounts
9. **Export User Data**: GDPR compliance for data export
10. **Session Management**: View and revoke active sessions
