"use client";

"use client";

import { useState } from 'react';
import { useEnhancedAuth } from '@/hooks/auth/useEnhancedAuth';
import { 
  User, 
  Mail, 
  Phone, 
  Shield, 
  Key, 
  LogIn, 
  UserPlus, 
  LogOut,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function AuthDemoPage() {
  const {
    user,
    loading,
    error,
    login,
    register,
    logout,
    sendOTP,
    verifyOTP,
    loginWithGoogle,
    canAccess,
  } = useEnhancedAuth();

  const isAuthenticated = !!user;

export default function AuthDemoPage() {
  const {
    user,
    loading,
    error,
    isAuthenticated,
    login,
    register,
    logout,
    sendOTP,
    verifyOTP,
    loginWithGoogle,
    hasRole,
    canAccess,
    clearError
  } = useEnhancedAuth();

  // Demo states
  const [activeTab, setActiveTab] = useState<'overview' | 'actions' | 'roles'>('overview');
  const [demoEmail, setDemoEmail] = useState('demo@example.com');
  const [demoPassword, setDemoPassword] = useState('demo123456');
  const [demoPhone, setDemoPhone] = useState('+919876543210');
  const [otpCode, setOtpCode] = useState('');
  const [verificationId, setVerificationId] = useState('');

  const handleDemoLogin = async () => {
    try {
      await login(demoEmail, demoPassword);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDemoRegister = async () => {
    try {
      await register('Demo User', demoEmail, demoPassword, 'user');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleSendOTP = async () => {
    try {
      const result = await sendOTP(demoPhone);
      setVerificationId(result.verificationId);
      toast.success('OTP sent! Use 123456 for demo');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleVerifyOTP = async () => {
    try {
      await verifyOTP({
        phoneNumber: demoPhone,
        otp: otpCode,
        verificationId,
      });
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Authentication System Demo
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Comprehensive Firebase-based authentication with email/password, phone/OTP, 
            Google OAuth, role-based access control, and secure cookie management.
          </p>
        </div>

        {/* Current User Status */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                isAuthenticated ? 'bg-green-100' : 'bg-gray-100'
              }`}>
                {isAuthenticated ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <XCircle className="w-6 h-6 text-gray-400" />
                )}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {isAuthenticated ? `Welcome, ${user?.name || user?.email}` : 'Not Authenticated'}
                </h2>
                <p className="text-gray-600">
                  {isAuthenticated 
                    ? `Role: ${user?.role} | Email: ${user?.email || 'Not provided'}`
                    : 'Please log in to access protected features'
                  }
                </p>
              </div>
            </div>
            {loading && (
              <div className="flex items-center text-blue-600">
                <Clock className="w-4 h-4 mr-2 animate-spin" />
                Loading...
              </div>
            )}
          </div>
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700">{error}</p>
            </div>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Overview', icon: User },
                { id: 'actions', label: 'Actions', icon: Key },
                { id: 'roles', label: 'Role Demo', icon: Shield },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as any)}
                  className={`flex items-center py-4 px-2 border-b-2 font-medium text-sm ${
                    activeTab === id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Authentication Features
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex items-center mb-3">
                        <Mail className="w-6 h-6 text-blue-600 mr-3" />
                        <h4 className="font-medium text-gray-900">Email/Password</h4>
                      </div>
                      <p className="text-sm text-gray-600">
                        Traditional email and password authentication with validation
                      </p>
                    </div>

                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="flex items-center mb-3">
                        <Phone className="w-6 h-6 text-green-600 mr-3" />
                        <h4 className="font-medium text-gray-900">Phone/OTP</h4>
                      </div>
                      <p className="text-sm text-gray-600">
                        Phone number authentication with SMS OTP verification
                      </p>
                    </div>

                    <div className="bg-red-50 rounded-lg p-4">
                      <div className="flex items-center mb-3">
                        <svg className="w-6 h-6 text-red-600 mr-3" viewBox="0 0 24 24">
                          <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        <h4 className="font-medium text-gray-900">Google OAuth</h4>
                      </div>
                      <p className="text-sm text-gray-600">
                        One-click authentication using Google accounts
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Security Features
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900">Secure Cookie Storage</p>
                        <p className="text-sm text-gray-600">Authentication tokens stored in secure, httpOnly cookies</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900">Role-based Access</p>
                        <p className="text-sm text-gray-600">Admin, seller, and user roles with permission system</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900">Route Protection</p>
                        <p className="text-sm text-gray-600">Middleware and component-level route guards</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900">Input Validation</p>
                        <p className="text-sm text-gray-600">Zod schema validation for all user inputs</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="font-medium text-yellow-800">Demo Environment</p>
                      <p className="text-sm text-yellow-700">
                        This is a demo environment. For phone authentication, use OTP: <code className="bg-yellow-100 px-1 rounded">123456</code>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Actions Tab */}
            {activeTab === 'actions' && (
              <div className="space-y-6">
                {!isAuthenticated ? (
                  <>
                    {/* Email/Password Demo */}
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Email/Password Authentication
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                          </label>
                          <input
                            type="email"
                            value={demoEmail}
                            onChange={(e) => setDemoEmail(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Password
                          </label>
                          <input
                            type="password"
                            value={demoPassword}
                            onChange={(e) => setDemoPassword(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                      <div className="flex space-x-3">
                        <button
                          onClick={handleDemoLogin}
                          disabled={loading}
                          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                          <LogIn className="w-4 h-4 mr-2" />
                          Login
                        </button>
                        <button
                          onClick={handleDemoRegister}
                          disabled={loading}
                          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                        >
                          <UserPlus className="w-4 h-4 mr-2" />
                          Register
                        </button>
                      </div>
                    </div>

                    {/* Phone/OTP Demo */}
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Phone/OTP Authentication
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            value={demoPhone}
                            onChange={(e) => setDemoPhone(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="+91 9876543210"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            OTP Code
                          </label>
                          <input
                            type="text"
                            value={otpCode}
                            onChange={(e) => setOtpCode(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="123456"
                            maxLength={6}
                          />
                        </div>
                      </div>
                      <div className="flex space-x-3">
                        <button
                          onClick={handleSendOTP}
                          disabled={loading}
                          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                        >
                          <Phone className="w-4 h-4 mr-2" />
                          Send OTP
                        </button>
                        <button
                          onClick={handleVerifyOTP}
                          disabled={loading || !verificationId}
                          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Verify OTP
                        </button>
                      </div>
                    </div>

                    {/* Google OAuth Demo */}
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Google OAuth Authentication
                      </h3>
                      <button
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        className="flex items-center px-6 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
                      >
                        <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        Continue with Google
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-6 text-center">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      You are logged in!
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-center space-x-4">
                        <Link
                          href="/profile"
                          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          <User className="w-4 h-4 mr-2" />
                          View Profile
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          Logout
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Roles Tab */}
            {activeTab === 'roles' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Role-based Access Control Demo
                  </h3>
                  
                  {isAuthenticated ? (
                    <div className="space-y-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-3">Current User Permissions</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {[
                            { role: 'admin', label: 'Admin Access', resource: 'admin_panel' },
                            { role: 'seller', label: 'Seller Access', resource: 'seller_panel' },
                            { role: 'user', label: 'User Profile', resource: 'user_profile' },
                            { role: 'admin', label: 'Manage Users', resource: 'users_manage' },
                            { role: 'seller', label: 'Manage Products', resource: 'products_manage' },
                            { role: 'admin', label: 'Manage Orders', resource: 'orders_manage' },
                          ].map(({ role, label, resource }) => {
                            const hasAccess = canAccess(resource);
                            return (
                              <div
                                key={resource}
                                className={`flex items-center justify-between p-3 rounded-lg border ${
                                  hasAccess 
                                    ? 'bg-green-50 border-green-200' 
                                    : 'bg-red-50 border-red-200'
                                }`}
                              >
                                <span className="font-medium text-gray-900">{label}</span>
                                <div className="flex items-center space-x-2">
                                  <span className={`text-xs px-2 py-1 rounded-full ${
                                    role === 'admin' 
                                      ? 'bg-red-100 text-red-800'
                                      : role === 'seller'
                                      ? 'bg-blue-100 text-blue-800'
                                      : 'bg-green-100 text-green-800'
                                  }`}>
                                    {role}
                                  </span>
                                  {hasAccess ? (
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                  ) : (
                                    <XCircle className="w-4 h-4 text-red-600" />
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-medium text-blue-900 mb-2">Your Current Role</h4>
                        <div className="flex items-center space-x-2">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            user?.role === 'admin' 
                              ? 'bg-red-100 text-red-800'
                              : user?.role === 'seller'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {user?.role?.toUpperCase()}
                          </span>
                          <span className="text-blue-700">
                            {user?.role === 'admin' && 'Full system access'}
                            {user?.role === 'seller' && 'Can manage products and view orders'}
                            {user?.role === 'user' && 'Basic user access'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-6 text-center">
                      <p className="text-gray-600 mb-4">
                        Please log in to see role-based access control in action.
                      </p>
                      <Link
                        href="/login"
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        <LogIn className="w-4 h-4 mr-2" />
                        Go to Login Page
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Link
              href="/login"
              className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Login Page
            </Link>
            <Link
              href="/register"
              className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Register Page
            </Link>
            <Link
              href="/profile"
              className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <User className="w-4 h-4 mr-2" />
              Profile Page
            </Link>
            <Link
              href="/unauthorized"
              className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Shield className="w-4 h-4 mr-2" />
              Unauthorized
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
