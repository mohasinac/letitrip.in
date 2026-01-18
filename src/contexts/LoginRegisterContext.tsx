/**
 * LoginRegisterContext
 * Manages login/register form state and operations
 *
 * Purpose: Centralize login/register form logic and state
 * Usage: Wrap components with LoginRegisterProvider
 *
 * Encapsulates:
 * - Form field state (email, password, etc.)
 * - Validation logic
 * - Loading state during authentication
 * - Error handling
 */

"use client";

import {
  usePasswordFieldState,
  UsePasswordFieldStateReturn,
} from "@letitrip/react-library";
import {
  useFormState,
  UseFormStateReturn,
  useLoadingState,
} from "@letitrip/react-library";
import React, { createContext, useCallback, useContext } from "react";
import { useAuth } from "./AuthContext";

interface LoginFormData {
  email: string;
  password: string;
}

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface LoginRegisterContextType {
  // Login form
  loginForm: UseFormStateReturn<LoginFormData>;
  loginPassword: UsePasswordFieldStateReturn;
  loginLoading: boolean;
  loginError: string | null;
  handleLoginSubmit: (e: React.FormEvent) => Promise<void>;
  resetLoginForm: () => void;

  // Register form
  registerForm: UseFormStateReturn<RegisterFormData>;
  registerPassword: UsePasswordFieldStateReturn;
  registerLoading: boolean;
  registerError: string | null;
  handleRegisterSubmit: (e: React.FormEvent) => Promise<void>;
  resetRegisterForm: () => void;
}

const LoginRegisterContext = createContext<
  LoginRegisterContextType | undefined
>(undefined);

export function LoginRegisterProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { login, register } = useAuth();

  // Login state
  const loginForm = useFormState<LoginFormData>({
    initialData: { email: "", password: "" },
    onValidate: (data) => {
      const errors: Record<string, string> = {};
      if (!data.email) errors.email = "Email is required";
      if (!data.password) errors.password = "Password is required";
      if (data.email && !data.email.includes("@")) {
        errors.email = "Invalid email format";
      }
      return errors;
    },
  });

  const loginPassword = usePasswordFieldState();

  const {
    isLoading: loginLoading,
    error: loginError,
    execute: executeLogin,
  } = useLoadingState<void>();

  const handleLoginSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!loginForm.validate()) {
        return;
      }

      await executeLogin(async () => {
        await login(loginForm.formData.email, loginForm.formData.password);
      });
    },
    [loginForm, executeLogin, login]
  );

  const resetLoginForm = useCallback(() => {
    loginForm.reset();
    loginPassword.reset();
  }, [loginForm, loginPassword]);

  // Register state
  const registerForm = useFormState<RegisterFormData>({
    initialData: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    onValidate: (data) => {
      const errors: Record<string, string> = {};

      if (!data.name) errors.name = "Name is required";
      if (!data.email) errors.email = "Email is required";
      if (data.email && !data.email.includes("@")) {
        errors.email = "Invalid email format";
      }
      if (!data.password) errors.password = "Password is required";
      if (!data.confirmPassword) {
        errors.confirmPassword = "Please confirm your password";
      }

      if (data.password && data.confirmPassword) {
        const passwordMatch = loginPassword.validatePasswordMatch(
          data.password,
          data.confirmPassword
        );
        if (passwordMatch) {
          errors.confirmPassword = passwordMatch;
        }
      }

      if (data.password) {
        const strengthCheck = loginPassword.validatePasswordStrength(
          data.password
        );
        if (!strengthCheck.valid) {
          errors.password = strengthCheck.errors[0];
        }
      }

      return errors;
    },
  });

  const registerPassword = usePasswordFieldState();

  const {
    isLoading: registerLoading,
    error: registerError,
    execute: executeRegister,
  } = useLoadingState<void>();

  const handleRegisterSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!registerForm.validate()) {
        return;
      }

      await executeRegister(async () => {
        await register({
          email: registerForm.formData.email,
          password: registerForm.formData.password,
          name: registerForm.formData.name,
        });
      });
    },
    [registerForm, executeRegister, register, loginPassword]
  );

  const resetRegisterForm = useCallback(() => {
    registerForm.reset();
    registerPassword.reset();
  }, [registerForm, registerPassword]);

  return (
    <LoginRegisterContext.Provider
      value={{
        loginForm,
        loginPassword,
        loginLoading,
        loginError: loginError?.message || null,
        handleLoginSubmit,
        resetLoginForm,

        registerForm,
        registerPassword,
        registerLoading,
        registerError: registerError?.message || null,
        handleRegisterSubmit,
        resetRegisterForm,
      }}
    >
      {children}
    </LoginRegisterContext.Provider>
  );
}

export function useLoginRegister() {
  const context = useContext(LoginRegisterContext);
  if (!context) {
    throw new Error(
      "useLoginRegister must be used within LoginRegisterProvider"
    );
  }
  return context;
}
