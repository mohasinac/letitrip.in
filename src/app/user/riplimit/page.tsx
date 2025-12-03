"use client";

/**
 * User RipLimit Dashboard Page
 * Epic: E028 - RipLimit Bidding Currency
 *
 * Displays:
 * - Current balance (available + blocked)
 * - Transaction history with filtering
 * - Active bids list
 * - Purchase and refund actions
 */

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  Plus,
  RefreshCw,
  Gavel,
  ExternalLink,
  TrendingUp,
  Lock,
  AlertCircle,
  Check,
  X,
} from "lucide-react";
import {
  FormInput,
  FormTextarea,
  FormLabel,
  FormSelect,
} from "@/components/forms";
import { useAuth } from "@/contexts/AuthContext";
import { ripLimitService } from "@/services/riplimit.service";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Price } from "@/components/common/values";
import {
  RipLimitBalanceFE,
  RipLimitTransactionFE,
} from "@/types/frontend/riplimit.types";

type TransactionFilter =
  | "ALL"
  | "PURCHASE"
  | "BID_BLOCK"
  | "BID_RELEASE"
  | "REFUND";

export default function UserRipLimitPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  // State
  const [balance, setBalance] = useState<RipLimitBalanceFE | null>(null);
  const [transactions, setTransactions] = useState<RipLimitTransactionFE[]>([]);
  const [transactionsTotal, setTransactionsTotal] = useState(0);
  const [loadingBalance, setLoadingBalance] = useState(true);
  const [loadingTransactions, setLoadingTransactions] = useState(true);
  const [transactionFilter, setTransactionFilter] =
    useState<TransactionFilter>("ALL");
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [purchaseAmount, setPurchaseAmount] = useState<number>(1000);
  const [refundAmount, setRefundAmount] = useState<number>(0);
  const [refundReason, setRefundReason] = useState("");
  const [processingPurchase, setProcessingPurchase] = useState(false);
  const [processingRefund, setProcessingRefund] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/user/riplimit");
    }
  }, [user, authLoading, router]);

  // Load balance
  const loadBalance = useCallback(async () => {
    try {
      setLoadingBalance(true);
      const data = await ripLimitService.getBalance();
      setBalance(data);
    } catch (err) {
      console.error("Failed to load balance:", err);
      setError("Failed to load RipLimit balance");
    } finally {
      setLoadingBalance(false);
    }
  }, []);

  // Load transactions
  const loadTransactions = useCallback(async () => {
    try {
      setLoadingTransactions(true);
      const filterType =
        transactionFilter === "ALL" ? undefined : transactionFilter;
      const data = await ripLimitService.getTransactions({
        type: filterType,
        limit: 20,
      });
      setTransactions(data.transactions);
      setTransactionsTotal(data.total);
    } catch (err) {
      console.error("Failed to load transactions:", err);
    } finally {
      setLoadingTransactions(false);
    }
  }, [transactionFilter]);

  // Initial data load
  useEffect(() => {
    if (user) {
      loadBalance();
      loadTransactions();
    }
  }, [user, loadBalance, loadTransactions]);

  // Reload transactions when filter changes
  useEffect(() => {
    if (user) {
      loadTransactions();
    }
  }, [transactionFilter, user, loadTransactions]);

  // Handle purchase initiation
  const handlePurchase = async () => {
    if (purchaseAmount < 100) {
      setError("Minimum purchase amount is ₹100");
      return;
    }

    try {
      setProcessingPurchase(true);
      setError(null);

      const purchaseData =
        await ripLimitService.initiatePurchase(purchaseAmount);

      // Initialize Razorpay
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: purchaseData.amount * 100, // Razorpay expects paise
        currency: purchaseData.currency,
        name: "Letitrip",
        description: `Purchase ${purchaseData.ripLimitAmount} RipLimit`,
        order_id: purchaseData.razorpayOrderId,
        handler: async function (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) {
          try {
            const verifyResult = await ripLimitService.verifyPurchase({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            setSuccessMessage(verifyResult.message);
            setShowPurchaseModal(false);
            loadBalance();
            loadTransactions();
            ripLimitService.invalidateBalanceCache();

            setTimeout(() => setSuccessMessage(null), 5000);
          } catch (err) {
            setError("Payment verification failed. Please contact support.");
          }
        },
        prefill: {
          email: user?.email || "",
          contact: "",
        },
        theme: {
          color: "#3B82F6",
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Purchase failed";
      setError(message);
    } finally {
      setProcessingPurchase(false);
    }
  };

  // Handle refund request
  const handleRefund = async () => {
    if (!balance || refundAmount <= 0) {
      setError("Please enter a valid refund amount");
      return;
    }

    if (refundAmount > balance.availableBalance) {
      setError("Refund amount cannot exceed available balance");
      return;
    }

    try {
      setProcessingRefund(true);
      setError(null);

      const result = await ripLimitService.requestRefund(
        refundAmount,
        refundReason,
      );

      setSuccessMessage(result.message);
      setShowRefundModal(false);
      setRefundAmount(0);
      setRefundReason("");
      loadBalance();
      loadTransactions();
      ripLimitService.invalidateBalanceCache();

      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Refund request failed";
      setError(message);
    } finally {
      setProcessingRefund(false);
    }
  };

  // Get transaction icon
  const getTransactionIcon = (type: string, isCredit: boolean) => {
    if (type === "BID_BLOCK")
      return <Gavel className="w-4 h-4 text-orange-500" />;
    if (type === "BID_RELEASE")
      return <Check className="w-4 h-4 text-green-500" />;
    if (isCredit) return <ArrowDownLeft className="w-4 h-4 text-green-500" />;
    return <ArrowUpRight className="w-4 h-4 text-red-500" />;
  };

  // Quick purchase amounts
  const quickAmounts = [500, 1000, 2000, 5000, 10000];

  if (authLoading || !user) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-gray-200 rounded mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg" />
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main id="user-riplimit-page" className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Wallet className="w-8 h-8 text-blue-600" />
            My RipLimit
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your bidding currency for auctions
          </p>
        </div>
        <div className="flex gap-3 mt-4 md:mt-0">
          <Button
            variant="primary"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setShowPurchaseModal(true)}
          >
            Add RipLimit
          </Button>
          <Button
            variant="outline"
            leftIcon={<RefreshCw className="w-4 h-4" />}
            onClick={() => {
              loadBalance();
              loadTransactions();
            }}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <Check className="w-5 h-5" />
          {successMessage}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
          <button onClick={() => setError(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Total Balance */}
        <Card className="bg-gradient-to-br from-blue-600 to-blue-700 border-0 text-white">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Balance</p>
              {loadingBalance ? (
                <div className="h-8 w-32 bg-blue-500/30 animate-pulse rounded mt-1" />
              ) : (
                <>
                  <p className="text-3xl font-bold mt-1">
                    {balance?.formattedTotal || "0 RL"}
                  </p>
                  <p className="text-blue-100 text-sm mt-1">
                    ≈ {balance?.formattedTotalINR || "₹0"}
                  </p>
                </>
              )}
            </div>
            <div className="p-3 bg-white/20 rounded-full">
              <Wallet className="w-6 h-6" />
            </div>
          </div>
        </Card>

        {/* Available Balance */}
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">
                Available to Bid
              </p>
              {loadingBalance ? (
                <div className="h-8 w-32 bg-gray-200 animate-pulse rounded mt-1" />
              ) : (
                <>
                  <p className="text-3xl font-bold text-green-600 mt-1">
                    {balance?.formattedAvailable || "0 RL"}
                  </p>
                  <p className="text-gray-500 text-sm mt-1">
                    ≈ {balance?.formattedAvailableINR || "₹0"}
                  </p>
                </>
              )}
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
          {balance?.canBid && (
            <p className="text-xs text-green-600 mt-4 flex items-center gap-1">
              <Check className="w-3 h-3" /> Ready to bid
            </p>
          )}
          {balance && !balance.canBid && (
            <p className="text-xs text-red-600 mt-4 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> Cannot bid - add more RipLimit
            </p>
          )}
        </Card>

        {/* Blocked Balance */}
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">
                In Active Bids
              </p>
              {loadingBalance ? (
                <div className="h-8 w-32 bg-gray-200 animate-pulse rounded mt-1" />
              ) : (
                <>
                  <p className="text-3xl font-bold text-orange-600 mt-1">
                    {balance?.formattedBlocked || "0 RL"}
                  </p>
                  <p className="text-gray-500 text-sm mt-1">
                    ≈ {balance?.formattedBlockedINR || "₹0"}
                  </p>
                </>
              )}
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <Lock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          {balance && balance.blockedBids.length > 0 && (
            <p className="text-xs text-orange-600 mt-4">
              {balance.blockedBids.length} active bid(s)
            </p>
          )}
        </Card>
      </div>

      {/* Active Bids Section */}
      {balance && balance.blockedBids.length > 0 && (
        <Card
          title="Active Bids"
          description="RipLimit blocked for your current bids"
          className="mb-8"
        >
          <div className="divide-y divide-gray-100">
            {balance.blockedBids.map((bid) => (
              <div
                key={bid.bidId}
                className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Gavel className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Auction Bid</p>
                    <p className="text-sm text-gray-500">
                      {bid.formattedAmount} blocked
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => router.push(`/auctions/${bid.auctionId}`)}
                  className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm"
                >
                  View Auction
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Transaction History */}
      <Card
        title="Transaction History"
        description={`${transactionsTotal} total transactions`}
        headerAction={
          <div className="flex items-center gap-2">
            <FormSelect
              id="transaction-filter"
              value={transactionFilter}
              onChange={(e) =>
                setTransactionFilter(e.target.value as TransactionFilter)
              }
              options={[
                { value: "ALL", label: "All Types" },
                { value: "PURCHASE", label: "Purchases" },
                { value: "BID_BLOCK", label: "Bid Blocks" },
                { value: "BID_RELEASE", label: "Bid Releases" },
                { value: "REFUND", label: "Refunds" },
              ]}
              compact
            />
          </div>
        }
      >
        {loadingTransactions ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4 animate-pulse">
                <div className="w-10 h-10 bg-gray-200 rounded-full" />
                <div className="flex-1">
                  <div className="h-4 w-32 bg-gray-200 rounded" />
                  <div className="h-3 w-24 bg-gray-100 rounded mt-2" />
                </div>
                <div className="h-5 w-20 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No transactions yet</p>
            <p className="text-gray-400 text-sm mt-1">
              Your transaction history will appear here
            </p>
            <Button
              variant="primary"
              className="mt-4"
              onClick={() => setShowPurchaseModal(true)}
            >
              Purchase RipLimit
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`p-2 rounded-full ${
                      tx.isCredit ? "bg-green-100" : "bg-gray-100"
                    }`}
                  >
                    {getTransactionIcon(tx.type, tx.isCredit)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{tx.typeLabel}</p>
                    <p className="text-sm text-gray-500">{tx.description}</p>
                    <p className="text-xs text-gray-400 mt-1">{tx.timeAgo}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`font-semibold ${
                      tx.isCredit ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {tx.isCredit ? "+" : "-"}
                    {tx.formattedAmount}
                  </p>
                  <p className="text-xs text-gray-400">
                    Balance: {tx.formattedBalanceAfter}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Load More */}
        {transactions.length > 0 && transactions.length < transactionsTotal && (
          <div className="mt-6 text-center">
            <Button
              variant="outline"
              onClick={() => {
                // Load more transactions
                ripLimitService
                  .getTransactions({
                    type:
                      transactionFilter === "ALL"
                        ? undefined
                        : transactionFilter,
                    limit: 20,
                    offset: transactions.length,
                  })
                  .then((data) => {
                    setTransactions([...transactions, ...data.transactions]);
                  });
              }}
            >
              Load More
            </Button>
          </div>
        )}
      </Card>

      {/* Refund Link */}
      {balance && balance.availableBalance > 0 && (
        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setRefundAmount(balance.availableBalance);
              setShowRefundModal(true);
            }}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Request Refund
          </button>
        </div>
      )}

      {/* Purchase Modal */}
      {showPurchaseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Purchase RipLimit
              </h2>
              <button
                onClick={() => setShowPurchaseModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Quick Amounts */}
            <div className="mb-6">
              <FormLabel>Quick Select</FormLabel>
              <div className="grid grid-cols-5 gap-2">
                {quickAmounts.map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setPurchaseAmount(amount)}
                    className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                      purchaseAmount === amount
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <Price amount={amount} />
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Amount */}
            <div className="mb-6">
              <FormInput
                label="Or enter custom amount"
                type="number"
                value={purchaseAmount}
                onChange={(e) => setPurchaseAmount(Number(e.target.value))}
                min={100}
                step={100}
                prefix="₹"
                helperText="Minimum: ₹100"
              />
            </div>

            {/* Summary */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">You will receive</span>
                <span className="text-xl font-bold text-blue-600">
                  {purchaseAmount.toLocaleString("en-IN")} RL
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                1 INR = 1 RipLimit • No expiry • Fully refundable
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                fullWidth
                onClick={() => setShowPurchaseModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                fullWidth
                isLoading={processingPurchase}
                onClick={handlePurchase}
              >
                Pay <Price amount={purchaseAmount} />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Refund Modal */}
      {showRefundModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Request Refund
              </h2>
              <button
                onClick={() => setShowRefundModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Available Balance */}
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-700">Available for refund</p>
              <p className="text-2xl font-bold text-blue-600">
                {balance?.formattedAvailable}
              </p>
            </div>

            {/* Refund Amount */}
            <div className="mb-6">
              <FormInput
                label="Refund Amount (RL)"
                type="number"
                value={refundAmount}
                onChange={(e) => setRefundAmount(Number(e.target.value))}
                max={balance?.availableBalance || 0}
                min={1}
                helperText={`You will receive ₹${refundAmount.toLocaleString(
                  "en-IN",
                )}`}
              />
            </div>

            {/* Reason */}
            <div className="mb-6">
              <FormTextarea
                label="Reason (optional)"
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                placeholder="Why are you requesting a refund?"
                rows={3}
              />
            </div>

            {/* Warning */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> Refunds are processed within 5-7 business
                days. Blocked RipLimit (in active bids) cannot be refunded until
                released.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                fullWidth
                onClick={() => setShowRefundModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                fullWidth
                isLoading={processingRefund}
                onClick={handleRefund}
              >
                Request Refund
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Razorpay Script */}
      <script src="https://checkout.razorpay.com/v1/checkout.js" async />
    </main>
  );
}
