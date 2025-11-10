/**
 * Auto-Bid Setup Component
 *
 * Allows users to set maximum bid and let system auto-bid for them
 */

"use client";

import { useState } from "react";
import { Zap, X, Check, AlertTriangle } from "lucide-react";
import { formatCurrency } from "@/lib/formatters";

interface AutoBidSetupProps {
  auctionId: string;
  currentBid: number;
  reservePrice?: number;
  minIncrement?: number;
  onSetup: (maxBid: number) => void;
  onCancel: () => void;
  isActive: boolean;
  className?: string;
}

export default function AutoBidSetup({
  auctionId,
  currentBid,
  reservePrice,
  minIncrement = 100,
  onSetup,
  onCancel,
  isActive,
  className = "",
}: AutoBidSetupProps) {
  const [maxBid, setMaxBid] = useState<string>("");
  const [showSetup, setShowSetup] = useState(false);

  const suggestedBids = [
    currentBid + minIncrement * 10,
    currentBid + minIncrement * 20,
    currentBid + minIncrement * 50,
    reservePrice || currentBid + minIncrement * 100,
  ];

  const handleSetup = () => {
    const amount = parseInt(maxBid);
    if (amount > currentBid) {
      onSetup(amount);
      setShowSetup(false);
      setMaxBid("");
    }
  };

  const handleCancel = () => {
    onCancel();
    setShowSetup(false);
    setMaxBid("");
  };

  if (isActive) {
    return (
      <div
        className={`bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border-2 border-yellow-300 p-4 ${className}`}
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
              <Zap className="w-5 h-5 text-yellow-600 animate-pulse" />
            </div>
          </div>

          <div className="flex-1">
            <div className="font-semibold text-gray-900 mb-1">
              Auto-Bid Active
            </div>
            <div className="text-sm text-gray-600 mb-3">
              The system will automatically bid for you up to your maximum bid
              when you're outbid.
            </div>

            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel Auto-Bid
            </button>
          </div>

          <button
            onClick={handleCancel}
            className="flex-shrink-0 p-1 hover:bg-yellow-100 rounded transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>
    );
  }

  if (!showSetup) {
    return (
      <button
        onClick={() => setShowSetup(true)}
        className={`w-full px-4 py-3 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-lg hover:from-yellow-100 hover:to-orange-100 transition-all ${className}`}
      >
        <div className="flex items-center justify-center gap-2">
          <Zap className="w-5 h-5 text-yellow-600" />
          <span className="font-semibold text-gray-900">Set Up Auto-Bid</span>
        </div>
      </button>
    );
  }

  const maxBidAmount = parseInt(maxBid) || 0;
  const isValid = maxBidAmount > currentBid;

  return (
    <div
      className={`bg-white rounded-lg border-2 border-yellow-300 p-4 ${className}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-600" />
          <h3 className="font-semibold text-gray-900">Set Up Auto-Bid</h3>
        </div>
        <button
          onClick={() => setShowSetup(false)}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Maximum Bid Amount
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
              ₹
            </span>
            <input
              type="number"
              value={maxBid}
              onChange={(e) => setMaxBid(e.target.value)}
              placeholder={`Min: ${formatCurrency(currentBid + minIncrement)}`}
              className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            />
          </div>
          {!isValid && maxBid && (
            <p className="mt-1 text-sm text-red-600">
              Maximum bid must be higher than current bid (
              {formatCurrency(currentBid)})
            </p>
          )}
        </div>

        <div>
          <p className="text-sm text-gray-600 mb-2">Quick select:</p>
          <div className="grid grid-cols-2 gap-2">
            {suggestedBids.map((amount, index) => (
              <button
                key={index}
                onClick={() => setMaxBid(amount.toString())}
                className="px-3 py-2 bg-gray-50 hover:bg-yellow-50 border border-gray-200 hover:border-yellow-300 rounded-lg text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
              >
                {formatCurrency(amount)}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-medium mb-1">How Auto-Bid Works:</p>
              <ul className="space-y-1 text-blue-800">
                <li>• System bids on your behalf when you're outbid</li>
                <li>• Bids only the minimum needed to stay ahead</li>
                <li>• Never exceeds your maximum bid</li>
                <li>• You can cancel anytime</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setShowSetup(false)}
            className="flex-1 px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSetup}
            disabled={!isValid}
            className="flex-1 px-4 py-2.5 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" />
            Activate Auto-Bid
          </button>
        </div>
      </div>
    </div>
  );
}
