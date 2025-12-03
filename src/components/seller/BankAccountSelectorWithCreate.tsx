"use client";

import React, { useState, useEffect } from "react";
import {
  Building2,
  Plus,
  Loader2,
  Check,
  Shield,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FormField, FormInput, FormSelect } from "@/components/forms";
import {
  VALIDATION_RULES,
  VALIDATION_MESSAGES,
  isValidIFSC,
} from "@/constants/validation-messages";

// Bank Account Interface
export interface BankAccount {
  id: string;
  accountHolderName: string;
  accountNumber: string;
  accountType: "savings" | "current";
  ifscCode: string;
  bankName: string;
  branchName: string;
  isDefault: boolean;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Validation Schema
const BankAccountSchema = z
  .object({
    accountHolderName: z
      .string()
      .min(VALIDATION_RULES.NAME.MIN_LENGTH, VALIDATION_MESSAGES.NAME.TOO_SHORT)
      .max(VALIDATION_RULES.NAME.MAX_LENGTH, VALIDATION_MESSAGES.NAME.TOO_LONG),
    accountNumber: z
      .string()
      .min(
        VALIDATION_RULES.BANK_ACCOUNT.MIN_LENGTH,
        "Account number must be at least 9 digits"
      )
      .max(
        VALIDATION_RULES.BANK_ACCOUNT.MAX_LENGTH,
        "Account number must be at most 18 digits"
      )
      .regex(
        VALIDATION_RULES.BANK_ACCOUNT.PATTERN,
        "Account number must contain only digits"
      ),
    confirmAccountNumber: z.string(),
    accountType: z.enum(["savings", "current"]),
    ifscCode: z
      .string()
      .length(VALIDATION_RULES.IFSC.LENGTH, "IFSC code must be 11 characters")
      .refine((val) => isValidIFSC(val), VALIDATION_MESSAGES.BANK.IFSC_INVALID),
    bankName: z.string().min(2, "Bank name is required"),
    branchName: z.string().min(2, "Branch name is required"),
    isDefault: z.boolean(),
  })
  .refine((data) => data.accountNumber === data.confirmAccountNumber, {
    message: "Account numbers do not match",
    path: ["confirmAccountNumber"],
  });

type BankAccountFormData = z.infer<typeof BankAccountSchema>;

export interface BankAccountSelectorWithCreateProps {
  value?: string | null;
  onChange: (accountId: string, account: BankAccount) => void;
  required?: boolean;
  error?: string;
  label?: string;
  autoSelectDefault?: boolean;
  className?: string;
}

export function BankAccountSelectorWithCreate({
  value,
  onChange,
  required = false,
  error,
  label = "Select Bank Account",
  autoSelectDefault = true,
  className = "",
}: BankAccountSelectorWithCreateProps) {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(value || null);
  const [ifscLoading, setIfscLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BankAccountFormData>({
    resolver: zodResolver(BankAccountSchema),
    defaultValues: {
      accountType: "savings",
      isDefault: false,
    },
  });

  const ifscCode = watch("ifscCode");

  // Load bank accounts (mock for now - implement actual API later)
  useEffect(() => {
    loadBankAccounts();
  }, []);

  // Auto-select default account
  useEffect(() => {
    if (autoSelectDefault && accounts.length > 0 && !selectedId) {
      const defaultAccount = accounts.find((acc) => acc.isDefault);
      if (defaultAccount) {
        setSelectedId(defaultAccount.id);
        onChange(defaultAccount.id, defaultAccount);
      }
    }
  }, [accounts, autoSelectDefault, selectedId, onChange]);

  // IFSC lookup
  useEffect(() => {
    if (ifscCode && isValidIFSC(ifscCode)) {
      lookupIFSC(ifscCode);
    }
  }, [ifscCode]);

  const loadBankAccounts = async () => {
    try {
      setLoading(true);
      // TODO: Implement actual API call
      // const data = await bankAccountsService.getAll();
      // setAccounts(data);

      // Mock data for now
      setAccounts([]);
    } catch (error) {
      console.error("Failed to load bank accounts:", error);
      toast.error("Failed to load bank accounts");
    } finally {
      setLoading(false);
    }
  };

  const lookupIFSC = async (ifsc: string) => {
    try {
      setIfscLoading(true);
      // TODO: Implement IFSC lookup API
      // const bankDetails = await ifscService.lookup(ifsc);
      // setValue("bankName", bankDetails.bank);
      // setValue("branchName", bankDetails.branch);

      // Mock data for now
      const mockBanks: Record<string, { bank: string; branch: string }> = {
        SBIN0001234: { bank: "State Bank of India", branch: "Mumbai Main" },
        HDFC0000123: { bank: "HDFC Bank", branch: "Delhi Branch" },
        ICIC0001234: { bank: "ICICI Bank", branch: "Bangalore Branch" },
      };

      const bankDetails = mockBanks[ifsc.toUpperCase()];
      if (bankDetails) {
        setValue("bankName", bankDetails.bank);
        setValue("branchName", bankDetails.branch);
        toast.success("Bank details auto-filled from IFSC");
      }
    } catch (error) {
      console.error("IFSC lookup failed:", error);
    } finally {
      setIfscLoading(false);
    }
  };

  const handleAccountSelect = (account: BankAccount) => {
    setSelectedId(account.id);
    onChange(account.id, account);
  };

  const onSubmit = async (data: BankAccountFormData) => {
    try {
      setLoading(true);

      // TODO: Implement actual API call
      // const newAccount = await bankAccountsService.create(data);

      // Mock data for now
      const newAccount: BankAccount = {
        id: `ba_${Date.now()}`,
        accountHolderName: data.accountHolderName,
        accountNumber: data.accountNumber,
        accountType: data.accountType,
        ifscCode: data.ifscCode,
        bankName: data.bankName,
        branchName: data.branchName,
        isDefault: data.isDefault,
        isVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setAccounts((prev) => [...prev, newAccount]);
      setSelectedId(newAccount.id);
      onChange(newAccount.id, newAccount);
      setShowForm(false);
      toast.success("Bank account added successfully");
    } catch (error) {
      console.error("Failed to add bank account:", error);
      toast.error("Failed to add bank account");
    } finally {
      setLoading(false);
    }
  };

  const getVerificationBadge = (isVerified: boolean) => {
    if (isVerified) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
          <Shield className="w-3 h-3" />
          Verified
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400">
        <AlertCircle className="w-3 h-3" />
        Pending
      </span>
    );
  };

  if (loading && accounts.length === 0) {
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
          <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
            Loading bank accounts...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Account Cards */}
      <div className="space-y-3">
        {accounts.length === 0 ? (
          <div className="text-center p-6 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800">
            <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              No bank accounts found
            </p>
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="btn-primary inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Bank Account
            </button>
          </div>
        ) : (
          <>
            {accounts.map((account) => (
              <button
                key={account.id}
                type="button"
                onClick={() => handleAccountSelect(account)}
                className={`
                  w-full text-left p-4 rounded-lg border-2 transition-all
                  ${
                    selectedId === account.id
                      ? "border-primary bg-primary/5 dark:bg-primary/10"
                      : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-primary/50"
                  }
                `}
              >
                <div className="flex items-start gap-3">
                  {/* Checkmark */}
                  <div className="flex-shrink-0 mt-0.5">
                    {selectedId === account.id ? (
                      <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    ) : (
                      <Building2 className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {account.accountHolderName}
                      </span>
                      {getVerificationBadge(account.isVerified)}
                      {account.isDefault && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                          Primary
                        </span>
                      )}
                    </div>

                    {/* Bank Details */}
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {account.bankName}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {account.branchName}
                    </p>

                    {/* Account Info */}
                    <div className="mt-2 flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500">
                      <span className="font-mono">
                        A/C: ****{account.accountNumber.slice(-4)}
                      </span>
                      <span>IFSC: {account.ifscCode}</span>
                      <span className="capitalize">{account.accountType}</span>
                    </div>
                  </div>
                </div>
              </button>
            ))}

            {/* Add New Button */}
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="w-full p-4 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-primary hover:bg-primary/5 dark:hover:bg-primary/10 transition-all"
            >
              <div className="flex items-center justify-center gap-2 text-primary">
                <Plus className="w-5 h-5" />
                <span className="font-medium">Add New Bank Account</span>
              </div>
            </button>
          </>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      {/* Add Bank Account Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-900 border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Add Bank Account
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
              {/* Account Holder Name */}
              <FormField
                label="Account Holder Name"
                required
                error={errors.accountHolderName?.message}
              >
                <FormInput
                  {...register("accountHolderName")}
                  placeholder="As per bank records"
                />
              </FormField>

              {/* Account Number */}
              <FormField
                label="Account Number"
                required
                error={errors.accountNumber?.message}
              >
                <FormInput
                  {...register("accountNumber")}
                  type="text"
                  placeholder="Enter account number"
                />
              </FormField>

              {/* Confirm Account Number */}
              <FormField
                label="Confirm Account Number"
                required
                error={errors.confirmAccountNumber?.message}
              >
                <FormInput
                  {...register("confirmAccountNumber")}
                  type="text"
                  placeholder="Re-enter account number"
                />
              </FormField>

              {/* Account Type */}
              <FormField
                label="Account Type"
                required
                error={errors.accountType?.message}
              >
                <FormSelect {...register("accountType")}>
                  <option value="savings">Savings</option>
                  <option value="current">Current</option>
                </FormSelect>
              </FormField>

              {/* IFSC Code */}
              <FormField
                label="IFSC Code"
                required
                error={errors.ifscCode?.message}
                hint="Bank details will be auto-filled"
              >
                <div className="relative">
                  <FormInput
                    {...register("ifscCode")}
                    placeholder="e.g., SBIN0001234"
                    maxLength={11}
                    className="uppercase"
                  />
                  {ifscLoading && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary animate-spin" />
                  )}
                </div>
              </FormField>

              {/* Bank Name (auto-filled) */}
              <FormField
                label="Bank Name"
                required
                error={errors.bankName?.message}
              >
                <FormInput
                  {...register("bankName")}
                  placeholder="Auto-filled from IFSC"
                />
              </FormField>

              {/* Branch Name (auto-filled) */}
              <FormField
                label="Branch Name"
                required
                error={errors.branchName?.message}
              >
                <FormInput
                  {...register("branchName")}
                  placeholder="Auto-filled from IFSC"
                />
              </FormField>

              {/* Set as Default */}
              <div className="flex items-center gap-3 py-2">
                <input
                  {...register("isDefault")}
                  type="checkbox"
                  id="isDefault"
                  className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <label
                  htmlFor="isDefault"
                  className="text-sm text-gray-700 dark:text-gray-300"
                >
                  Set as primary bank account
                </label>
              </div>

              {/* Info Box */}
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  <Shield className="w-4 h-4 inline mr-1" />
                  Your bank account will be verified within 1-2 business days.
                  You may need to complete a penny drop verification.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="btn-secondary flex-1"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Adding...
                    </>
                  ) : (
                    "Add Bank Account"
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

export default BankAccountSelectorWithCreate;
