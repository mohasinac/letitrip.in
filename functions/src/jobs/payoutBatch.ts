/**
 * Job: Payout Batch Sweep
 *
 * Runs daily at 06:00 UTC.
 * Transitions pending payout requests to "processing" and invokes the
 * Razorpay Payouts API for each. On success, the record stays in "processing"
 * (a webhook or a follow-up job will flip it to "completed"). On failure,
 * a `failureCount` field is incremented; after 3 failures the record is
 * marked "failed" so an admin can intervene.
 *
 * NOTE: Razorpay Payouts API keys must be set as Firebase Functions config:
 *   firebase functions:config:set razorpay.key_id="KEY" razorpay.key_secret="SECRET"
 *   razorpay.account_number="ACCOUNT_NO"
 */
import { onSchedule } from "firebase-functions/v2/scheduler";
import { payoutRepository } from "@mohasinac/appkit";
import { type DocumentReference } from "firebase-admin/firestore";
import { logInfo, logError, logWarn } from "../utils/logger";
import { SCHEDULES, REGION } from "../config/constants";
import {
  ConfigurationError,
  ValidationError,
  IntegrationError,
} from "../lib/errors";
import { FN_ERROR_MESSAGES } from "../constants/messages";

const JOB = "payoutBatch";
const MAX_FAILURES = 3;

type PayoutRow = Awaited<ReturnType<typeof payoutRepository.getPending>>[number]["data"];

async function dispatchPayout(entry: {
  ref: DocumentReference;
  data: PayoutRow;
}): Promise<void> {
  const { ref, data: payout } = entry;

  await payoutRepository.markProcessing(ref);

  try {
    // ── Razorpay Payouts API call ─────────────────────────────────────────
    // Env vars are injected at deploy time via Firebase Functions config or
    // Secret Manager. We import them lazily here to avoid crashing the entire
    // module when running locally without credentials.
    const keyId = process.env.RAZORPAY_KEY_ID ?? "";
    const keySecret = process.env.RAZORPAY_KEY_SECRET ?? "";
    const accountNumber = process.env.RAZORPAY_ACCOUNT_NUMBER ?? "";
    const apiBaseUrl =
      process.env.RAZORPAY_API_BASE_URL ?? "https://api.razorpay.com/v1";

    if (!keyId || !keySecret || !accountNumber) {
      throw new ConfigurationError(
        FN_ERROR_MESSAGES.RAZORPAY_CREDENTIALS_MISSING,
      );
    }

    const basicAuth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");

    let fundAccount: Record<string, unknown>;
    if (payout.paymentMethod === "upi" && payout.upiId) {
      fundAccount = {
        account_type: "vpa",
        vpa: { address: payout.upiId },
      };
    } else if (payout.bankAccount) {
      fundAccount = {
        account_type: "bank_account",
        bank_account: {
          name: payout.bankAccount.accountHolderName,
          ifsc: payout.bankAccount.ifscCode,
          // NOTE: full account number must be stored server-side (not masked)
          // retrieve from Secret Manager or a server-only field
          account_number: payout.bankAccount.accountNumberMasked,
        },
      };
    } else {
      throw new ValidationError(FN_ERROR_MESSAGES.RAZORPAY_NO_FUND_ACCOUNT);
    }

    const payload = {
      account_number: accountNumber,
      fund_account: {
        ...fundAccount,
        contact: {
          name: payout.sellerEmail,
          type: "vendor",
          email: payout.sellerEmail,
        },
      },
      amount: Math.round(payout.amount * 100), // Razorpay expects paise
      currency: payout.currency.toUpperCase(),
      mode: payout.paymentMethod === "upi" ? "UPI" : "NEFT",
      purpose: "payout",
      reference_id: payout.id,
      narration: `LetItRip payout for seller ${payout.sellerId}`,
    };

    const response = await fetch(`${apiBaseUrl}/payouts`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${basicAuth}`,
        "Content-Type": "application/json",
        "X-Payout-Idempotency": payout.id, // Razorpay idempotency key
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errBody = await response.text();
      throw new IntegrationError(
        "Razorpay",
        response.status,
        FN_ERROR_MESSAGES.RAZORPAY_API_ERROR(response.status, errBody),
      );
    }

    const result = (await response.json()) as { id: string; status: string };

    await payoutRepository.recordSuccess(ref, result.id, result.status);

    logInfo(JOB, `Payout ${payout.id} dispatched`, {
      razorpayId: result.id,
      razorpayStatus: result.status,
    });
  } catch (error) {
    const failureCount =
      ((payout as PayoutRow & { failureCount?: number }).failureCount ?? 0) + 1;
    const isFinal = failureCount >= MAX_FAILURES;
    const reason = error instanceof Error ? error.message : String(error);

    await payoutRepository.recordFailure(ref, failureCount, reason, isFinal);

    if (isFinal) {
      logError(
        JOB,
        `Payout ${payout.id} permanently failed after ${MAX_FAILURES} attempts`,
        error,
        {
          sellerId: payout.sellerId,
        },
      );
    } else {
      logWarn(JOB, `Payout ${payout.id} failed (attempt ${failureCount})`, {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
}

export const payoutBatch = onSchedule(
  {
    schedule: SCHEDULES.DAILY_0600,
    timeZone: "UTC",
    region: REGION,
    timeoutSeconds: 540,
    // 256 MiB is sufficient: payouts are dispatched sequentially via HTTP;
    // No large in-memory dataset is ever held. Halves GB-seconds vs 512 MiB.
    memory: "256MiB",
    maxInstances: 1,
  },
  async () => {
    logInfo(JOB, "Starting payout batch sweep");

    try {
      const pending = await payoutRepository.getPending();

      if (pending.length === 0) {
        logInfo(JOB, "No pending payouts to process");
        return;
      }

      logInfo(JOB, `Dispatching ${pending.length} payout(s)`);

      const results = await Promise.allSettled(pending.map(dispatchPayout));
      const failed = results.filter((r) => r.status === "rejected");
      logInfo(JOB, "Payout batch complete", {
        total: pending.length,
        succeeded: pending.length - failed.length,
        failed: failed.length,
      });
    } catch (error) {
      logError(JOB, "Fatal error during payout batch", error);
      throw error;
    }
  },
);
