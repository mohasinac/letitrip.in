"use client";

import React, { useState, useEffect } from "react";
import { CreditCard, Plus, Loader2, Check, Shield, Lock } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FormField, FormInput, FormSelect } from "@/components/forms";
import { logError } from "@/lib/firebase-error-logger";
import { useLoadingState } from "@/hooks/useLoadingState";
import {
  VALIDATION_RULES,
  VALIDATION_MESSAGES,
} from "@/constants/validation-messages";

// Payment Method Interface
export interface PaymentMethod {
  id: string;
  type: "card" | "upi" | "netbanking" | "wallet" | "cod";
  displayName: string;
  last4?: string;
  cardBrand?: string;
  upiId?: string;
  bankName?: string;
  walletProvider?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
  createdAt: Date;
}

// Validation Schema
const PaymentMethodSchema = z.object({
  type: z.enum(["card", "upi", "netbanking", "wallet", "cod"]),
  // Card fields
  cardNumber: z.string().optional(),
  cardHolderName: z.string().optional(),
  expiryMonth: z.string().optional(),
  expiryYear: z.string().optional(),
  cvv: z.string().optional(),
  // UPI field
  upiId: z.string().optional(),
  // Netbanking field
  bankName: z.string().optional(),
  // Wallet field
  walletProvider: z.string().optional(),
  isDefault: z.boolean(),
});

type PaymentMethodFormData = z.infer<typeof PaymentMethodSchema>;

export interface PaymentMethodSelectorWithCreateProps {
  value?: string | null;
  onChange: (methodId: string, method: PaymentMethod) => void;
  required?: boolean;
  error?: string;
  label?: string;
  autoSelectDefault?: boolean;
  className?: string;
}

export function PaymentMethodSelectorWithCreate({
  value,
  onChange,
  required = false,
  error,
  label = "Select Payment Method",
  autoSelectDefault = true,
  className = "",
}: PaymentMethodSelectorWithCreateProps) {
  const {
    isLoading: loading,
    data: methods,
    setData: setMethods,
    execute,
  } = useLoadingState<PaymentMethod[]>({
    initialData: [],
    onLoadError: (error) => {
      logError(error as Error, {
        component: "PaymentMethodSelectorWithCreate.loadPaymentMethods",
      });
      toast.error("Failed to load payment methods");
    },
  });
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(value || null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<PaymentMethodFormData>({
    resolver: zodResolver(PaymentMethodSchema),
    defaultValues: {
      type: "card",
      isDefault: false,
    },
  });

  const paymentType = watch("type");

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  useEffect(() => {
    if (autoSelectDefault && (methods || []).length > 0 && !selectedId) {
      const defaultMethod = (methods || []).find((m) => m.isDefault);
      if (defaultMethod) {
        setSelectedId(defaultMethod.id);
        onChange(defaultMethod.id, defaultMethod);
      }
    }
  }, [methods, autoSelectDefault, selectedId, onChange]);

  const loadPaymentMethods = () =>
    execute(async () => {
      // TODO: Implement actual API
      return [];
    });

  const handleMethodSelect = (method: PaymentMethod) => {
    setSelectedId(method.id);
    onChange(method.id, method);
  };

  const onSubmit = async (data: PaymentMethodFormData) => {
    try {
      setSubmitting(true);
      // TODO: Implement actual API
      const newMethod: PaymentMethod = {
        id: `pm_${Date.now()}`,
        type: data.type,
        displayName:
          data.cardHolderName ||
          data.upiId ||
          data.bankName ||
          data.walletProvider ||
          "Cash on Delivery",
        last4: data.cardNumber?.slice(-4),
        isDefault: data.isDefault,
        createdAt: new Date(),
      };

      setMethods([...(methods || []), newMethod]);
      setSelectedId(newMethod.id);
      onChange(newMethod.id, newMethod);
      setShowForm(false);
      toast.success("Payment method added successfully");
    } catch (error) {
      logError(error as Error, {
        component: "PaymentMethodSelectorWithCreate.addPaymentMethod",
      });
      toast.error("Failed to add payment method");
    } finally {
      setSubmitting(false);
    }
  };

  const getMethodIcon = (type: string) => {
    return <CreditCard className="w-5 h-5" />;
  };

  if (loading && (methods || []).length === 0) {
    return (
      <div className={`space-y-2 ${className}`}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="flex items-center justify-center p-8 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="space-y-3">
        {(methods || []).length === 0 ? (
          <div className="text-center p-6 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800">
            <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              No saved payment methods
            </p>
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="btn-primary inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Payment Method
            </button>
          </div>
        ) : (
          <>
            {(methods || []).map((method) => (
              <button
                key={method.id}
                type="button"
                onClick={() => handleMethodSelect(method)}
                className={`
                  w-full text-left p-4 rounded-lg border-2 transition-all
                  ${
                    selectedId === method.id
                      ? "border-primary bg-primary/5 dark:bg-primary/10"
                      : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-primary/50"
                  }
                `}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {selectedId === method.id ? (
                      <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    ) : (
                      <div className="text-gray-400 dark:text-gray-500">
                        {getMethodIcon(method.type)}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {method.displayName}
                      </span>
                      {method.isDefault && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                          Default
                        </span>
                      )}
                    </div>

                    {method.last4 && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        •••• {method.last4}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            ))}

            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="w-full p-4 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-primary hover:bg-primary/5 dark:hover:bg-primary/10 transition-all"
            >
              <div className="flex items-center justify-center gap-2 text-primary">
                <Plus className="w-5 h-5" />
                <span className="font-medium">Add New Payment Method</span>
              </div>
            </button>
          </>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-900 border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Add Payment Method
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
              <FormField label="Payment Type" required>
                <select {...register("type")} className="input w-full">
                  <option value="card">Credit/Debit Card</option>
                  <option value="upi">UPI</option>
                  <option value="netbanking">Net Banking</option>
                  <option value="wallet">Wallet</option>
                  <option value="cod">Cash on Delivery</option>
                </select>
              </FormField>

              {paymentType === "card" && (
                <>
                  <FormField label="Card Number" required>
                    <FormInput
                      {...register("cardNumber")}
                      placeholder="1234 5678 9012 3456"
                    />
                  </FormField>
                  <FormField label="Card Holder Name" required>
                    <FormInput {...register("cardHolderName")} />
                  </FormField>
                  <div className="grid grid-cols-3 gap-4">
                    <FormField label="Expiry Month" required>
                      <FormInput
                        {...register("expiryMonth")}
                        placeholder="MM"
                      />
                    </FormField>
                    <FormField label="Expiry Year" required>
                      <FormInput {...register("expiryYear")} placeholder="YY" />
                    </FormField>
                    <FormField label="CVV" required>
                      <FormInput
                        {...register("cvv")}
                        placeholder="123"
                        type="password"
                      />
                    </FormField>
                  </div>
                </>
              )}

              {paymentType === "upi" && (
                <FormField label="UPI ID" required>
                  <FormInput
                    {...register("upiId")}
                    placeholder="yourname@upi"
                  />
                </FormField>
              )}

              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  <Shield className="w-4 h-4 inline mr-1" />
                  Your payment information is encrypted and secure
                </p>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="btn-secondary flex-1"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Adding...
                    </>
                  ) : (
                    "Add Payment Method"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default PaymentMethodSelectorWithCreate;
