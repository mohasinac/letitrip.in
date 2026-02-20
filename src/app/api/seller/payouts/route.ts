/**
 * Seller Payouts API
 *
 * GET  /api/seller/payouts — List authenticated seller's payouts + earnings summary
 * POST /api/seller/payouts — Request a new payout
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/firebase/auth-server";
import { handleApiError } from "@/lib/errors/error-handler";
import { ValidationError } from "@/lib/errors";
import { successResponse, ApiErrors } from "@/lib/api-response";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";
import {
  productRepository,
  orderRepository,
  payoutRepository,
} from "@/repositories";
import { DEFAULT_PLATFORM_FEE_RATE } from "@/db/schema";

// ─── Validation Schemas ────────────────────────────────────────────────────

const bankAccountSchema = z.object({
  accountHolderName: z.string().min(1),
  accountNumberMasked: z.string().min(1),
  ifscCode: z.string().min(1),
  bankName: z.string().min(1),
});

const payoutRequestSchema = z
  .object({
    paymentMethod: z.enum(["bank_transfer", "upi"]),
    bankAccount: bankAccountSchema.optional(),
    upiId: z.string().optional(),
    notes: z.string().optional(),
  })
  .refine(
    (data) =>
      data.paymentMethod === "upi" ? !!data.upiId : !!data.bankAccount,
    {
      message: ERROR_MESSAGES.PAYOUT.INVALID_METHOD,
    },
  );

// ─── Helpers ───────────────────────────────────────────────────────────────

async function computeSellerEarnings(sellerId: string) {
  // 1. Get seller products (cap at 50 for performance)
  const products = await productRepository.findBySeller(sellerId);
  const productIds = products.slice(0, 50).map((p) => p.id);

  // 2. Fetch delivered orders across all seller products
  let deliveredOrders: Awaited<
    ReturnType<typeof orderRepository.findByProduct>
  > = [];
  if (productIds.length > 0) {
    const batches = await Promise.all(
      productIds.map((id) =>
        orderRepository
          .findByProduct(id)
          .catch(() => [] as typeof deliveredOrders),
      ),
    );
    deliveredOrders = batches.flat().filter((o) => o.status === "delivered");
  }

  // 3. Deduplicate order IDs already covered by existing payouts
  const paidOutIds = await payoutRepository.getPaidOutOrderIds(sellerId);

  const eligibleOrders = deliveredOrders.filter((o) => !paidOutIds.has(o.id));

  const grossAmount = eligibleOrders.reduce(
    (sum, o) => sum + (o.totalPrice ?? 0),
    0,
  );

  const platformFee = parseFloat(
    (grossAmount * DEFAULT_PLATFORM_FEE_RATE).toFixed(2),
  );
  const netAmount = parseFloat((grossAmount - platformFee).toFixed(2));

  return {
    eligibleOrders,
    grossAmount,
    platformFee,
    netAmount,
    productCount: products.length,
  };
}

// ─── GET — List payouts + earnings summary ─────────────────────────────────

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    const uid = session.uid;

    const [payouts, earnings] = await Promise.all([
      payoutRepository.findBySeller(uid),
      computeSellerEarnings(uid),
    ]);

    const totalPaidOut = payouts
      .filter((p) => p.status === "completed")
      .reduce((sum, p) => sum + p.amount, 0);

    const pendingAmount = payouts
      .filter((p) => p.status === "pending" || p.status === "processing")
      .reduce((sum, p) => sum + p.amount, 0);

    const hasPendingPayout = payouts.some(
      (p) => p.status === "pending" || p.status === "processing",
    );

    return successResponse({
      payouts,
      summary: {
        availableEarnings: earnings.netAmount,
        grossEarnings: earnings.grossAmount,
        platformFee: earnings.platformFee,
        platformFeeRate: DEFAULT_PLATFORM_FEE_RATE,
        totalPaidOut,
        pendingAmount,
        hasPendingPayout,
        eligibleOrderCount: earnings.eligibleOrders.length,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// ─── POST — Request a new payout ───────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const uid = session.uid;

    // 1. Validate body
    const body = await request.json();
    const validation = payoutRequestSchema.safeParse(body);
    if (!validation.success) {
      return ApiErrors.validationError(validation.error.issues);
    }
    const { paymentMethod, bankAccount, upiId, notes } = validation.data;

    // 2. Check for existing pending/processing payout
    const existing = await payoutRepository.findBySeller(uid);
    const hasPending = existing.some(
      (p) => p.status === "pending" || p.status === "processing",
    );
    if (hasPending) {
      throw new ValidationError(ERROR_MESSAGES.PAYOUT.ALREADY_PENDING);
    }

    // 3. Compute earnings
    const earnings = await computeSellerEarnings(uid);
    if (earnings.netAmount <= 0 || earnings.eligibleOrders.length === 0) {
      throw new ValidationError(ERROR_MESSAGES.PAYOUT.NO_EARNINGS);
    }

    // 4. Resolve seller identity from session
    const sellerName = session.name ?? session.email ?? uid;
    const sellerEmail = session.email ?? "";

    // 5. Create payout
    const payout = await payoutRepository.create({
      sellerId: uid,
      sellerName,
      sellerEmail,
      amount: earnings.netAmount,
      grossAmount: earnings.grossAmount,
      platformFee: earnings.platformFee,
      platformFeeRate: DEFAULT_PLATFORM_FEE_RATE,
      currency: "INR",
      paymentMethod,
      ...(bankAccount && { bankAccount }),
      ...(upiId && { upiId }),
      ...(notes && { notes }),
      orderIds: earnings.eligibleOrders.map((o) => o.id),
    });

    return successResponse(payout, SUCCESS_MESSAGES.PAYOUT.CREATED);
  } catch (error) {
    return handleApiError(error);
  }
}
