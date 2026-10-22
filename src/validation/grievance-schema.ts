import { z } from "zod";

/**
 * The grievance intake, shared by `POST /api/grievance` and the public
 * `<GrievanceForm>`.
 *
 * 🛑 ITS OWN MODULE, importing nothing but `zod`.
 *
 * This first went into `src/validation/request-schemas.ts`, which is the
 * obvious home and the wrong one: that file imports
 * `@mohasinac/appkit/server`, so pulling it into a `"use client"` component
 * drags the server entry into the client graph —
 * `audit-client-server-only-leak` caught it immediately. It is the same trap
 * CLAUDE.md Root Cause #18 records, where importing a barrel two hops from a
 * server module instantiated appkit a second time and made every valid
 * session answer 401.
 *
 * A schema shared across the client/server boundary therefore has to be
 * reachable without reaching anything server-only. Keep this file's imports
 * at exactly one.
 *
 * 🛑 It also cannot live in appkit, which is where a shared schema normally
 * belongs (CLAUDE.md W4). The consumer is pinned to the PUBLISHED appkit, so
 * a new appkit export is unreachable from `src/` until a release ships —
 * and on top of that the consumer resolves zod 4.x against appkit's 3.x, so
 * the object would not be assignable to appkit's `ZodTypeAny` anyway. Move
 * this into appkit once appkit is on zod 4.
 */
export const grievanceFormSchema = z
  .object({
    subject: z
      .string()
      .min(5, "Please give your grievance a short subject line (at least 5 characters).")
      .max(200, "Please keep the subject under 200 characters."),
    detail: z
      .string()
      .min(30, "Please describe what happened — at least 30 characters, so it can be investigated.")
      .max(5000, "Please keep the description under 5,000 characters."),
    orderId: z.string().min(1).max(200).optional(),
    disputedAmount: z
      .number()
      .nonnegative("An amount in dispute cannot be negative.")
      .max(10_000_000, "That amount looks too large — please contact support directly.")
      .optional(),
  })
  /*
   * `.strict()` is load-bearing: the route relies on it to REJECT an
   * unexpected key rather than silently dropping it. A grievance is evidence,
   * so a field we quietly discarded is worse than a 400.
   */
  .strict();

export type GrievanceFormValues = z.infer<typeof grievanceFormSchema>;
