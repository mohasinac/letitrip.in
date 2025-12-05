/**
 * @fileoverview React Component
 * @module src/components/admin/riplimit/AdjustBalanceModal
 * @description This file contains the AdjustBalanceModal component and its related functionality
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

"use client";

import { FormInput } from "@/components/forms/FormInput";
import { FormTextarea } from "@/components/forms/FormTextarea";
import { Button } from "@/components/ui/Button";
import { X } from "lucide-react";
import { useState } from "react";

/**
 * RipLimitUser interface
 * 
 * @interface
 * @description Defines the structure and contract for RipLimitUser
 */
interface RipLimitUser {
  /** User Id */
  userId: string;
  /** Available Balance */
  availableBalance: number;
  /** Blocked Balance */
  blockedBalance: number;
  /** Has Unpaid Auctions */
  hasUnpaidAuctions: boolean;
  /** Is Blocked */
  isBlocked: boolean;
  /** Unpaid Auction Ids */
  unpaidAuctionIds: string[];
  /** Created At */
  createdAt: { _seconds: number };
  /** Updated At */
  updatedAt: { _seconds: number };
  /** User */
  user: {
    /** Email */
    email: string;
    /** Display Name */
    displayName?: string;
    /** Photo U R L */
    photoURL?: string;
  } | null;
}

/**
 * AdjustBalanceModalProps interface
 * 
 * @interface
 * @description Defines the structure and contract for AdjustBalanceModalProps
 */
interface AdjustBalanceModalProps {
  /** User */
  user: RipLimitUser;
  /** Is Open */
  isOpen: boolean;
  /** Is Processing */
  isProcessing: boolean;
  /** On Close */
  onClose: () => void;
  /** On Adjust */
  onAdjust: (amount: number, reason: string) => Promise<void>;
}

/**
 * Function: Adjust Balance Modal
 */
/**
 * Performs adjust balance modal operation
 *
 * @returns {any} The adjustbalancemodal result
 *
 * @example
 * AdjustBalanceModal();
 */

/**
 * Performs adjust balance modal operation
 *
 * @returns {any} The adjustbalancemodal result
 *
 * @example
 * AdjustBalanceModal();
 */

export function AdjustBalanceModal({
  user,
  isOpen,
  isProcessing,
  onClose,
  onAdjust,
}: AdjustBalanceModalProps) {
  const [adjustAmount, setAdjustAmount] = useState<number>(0);
  const [adjustReason, setAdjustReason] = useState("");

  /**
   * Formats r l
   *
   * @param {number} amount - The amount
   *
   * @returns {Promise<any>} Promise resolving to formatrl result
   *
   * @throws {Error} When operation fails or validation errors occur
   */

  /**
   * Formats r l
   *
   * @param {number} amount - The amount
   *
   * @returns {Promise<any>} Promise resolving to formatrl result
   *
   * @throws {Error} When operation fails or validation errors occur
   */

  const formatRL = (amount: number) => `${amount.toLocaleString("en-IN")} RL`;

  /**
   * Performs async operation
   *
   * @returns {Promise<any>} Promise resolving to async  result
   *
   * @throws {Error} When operation fails or validation errors occur
   */

  /**
   * Performs async operation
   *
   * @returns {Promise<any>} Promise resolving to async  result
   *
   * @throws {Error} When operation fails or validation errors occur
   */

  const handleSubmit = async () => {
    if (adjustAmount === 0 || !adjustReason.trim()) return;

    await onAdjust(adjustAmount, adjustReason);

    // Reset form
    setAdjustAmount(0);
    setAdjustReason("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="adjust-balance-modal-title"
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2
            id="adjust-balance-modal-title"
            className="text-xl font-bold text-gray-900 dark:text-white"
          >
            Adjust Balance
          </h2>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* User Info */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <span className="text-blue-600 dark:text-blue-300 font-semibold text-sm">
                {(user.user?.displayName ||
                  user.user?.email ||
                  "U")[0].toUpperCase()}
              </span>
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                {user.user?.displayName || "No name"}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {user.user?.email}
              </p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500 dark:text-gray-400">Available</p>
              <p className="font-semibold text-green-600">
                {formatRL(user.availableBalance)}
              </p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">Blocked</p>
              <p className="font-semibold text-orange-600">
                {formatRL(user.blockedBalance)}
              </p>
            </div>
          </div>
        </div>

        {/* Adjustment Amount */}
        <div className="mb-6">
          <FormInput
            label="Adjustment Amount (RL)"
            type="number"
            value={adjustAmount}
            onChange={(e) => setAdjustAmount(Number(e.target.value))}
            placeholder="Enter positive to add, negative to deduct"
            helperText="Positive values add RipLimit, negative values deduct"
          />
        </div>

        {/* Reason */}
        <div className="mb-6">
          <FormTextarea
            label="Reason"
            required
            value={adjustReason}
            onChange={(e) => setAdjustReason(e.target.value)}
            placeholder="Enter reason for adjustment..."
            rows={3}
          />
        </div>

        {/* Preview */}
        {adjustAmount !== 0 && (
          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              New balance will be:{" "}
              <strong>{formatRL(user.availableBalance + adjustAmount)}</strong>
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="outline" fullWidth onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            fullWidth
            isLoading={isProcessing}
            onClick={handleSubmit}
            disabled={adjustAmount === 0 || !adjustReason.trim()}
          >
            Apply Adjustment
          </Button>
        </div>
      </div>
    </div>
  );
}
