"use client";

import { FormInput, FormTextarea } from "@/components/forms";
import { Button } from "@/components/ui/Button";
import { X } from "lucide-react";
import { useState } from "react";

interface RipLimitUser {
  userId: string;
  availableBalance: number;
  blockedBalance: number;
  hasUnpaidAuctions: boolean;
  isBlocked: boolean;
  unpaidAuctionIds: string[];
  createdAt: { _seconds: number };
  updatedAt: { _seconds: number };
  user: {
    email: string;
    displayName?: string;
    photoURL?: string;
  } | null;
}

interface AdjustBalanceModalProps {
  user: RipLimitUser;
  isOpen: boolean;
  isProcessing: boolean;
  onClose: () => void;
  onAdjust: (amount: number, reason: string) => Promise<void>;
}

export function AdjustBalanceModal({
  user,
  isOpen,
  isProcessing,
  onClose,
  onAdjust,
}: AdjustBalanceModalProps) {
  const [adjustAmount, setAdjustAmount] = useState<number>(0);
  const [adjustReason, setAdjustReason] = useState("");

  const formatRL = (amount: number) => `${amount.toLocaleString("en-IN")} RL`;

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
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Adjust Balance
          </h2>
          <button
            onClick={onClose}
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
