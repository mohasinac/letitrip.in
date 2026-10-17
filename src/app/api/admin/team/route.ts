import { withProviders } from "@/providers.config";
import type { JsonValue } from "@mohasinac/appkit/schemas/types";
import { z } from "zod";
import { sortBy } from "@mohasinac/appkit/constants/sort";
import { getProviders } from "@mohasinac/appkit/contracts/registry";
import { adminUpdateUser } from "@mohasinac/appkit/features/admin/actions/admin-actions";
import { userRepository } from "@mohasinac/appkit/features/auth/repository/user.repository";
import { USER_FIELDS } from "@mohasinac/appkit/features/auth/schemas/firestore";
import { serverLogger } from "@mohasinac/appkit/monitoring/server-logger";
import { successResponse } from "@mohasinac/appkit/next/api/api-response";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { getSearchParams, getNumberParam, getStringParam } from "@mohasinac/appkit/next/request-helpers";
import type { UserAdminUpdateInput } from "@mohasinac/appkit/features/auth/schemas/firestore";
import { ROLES_ADMIN_ONLY, ROLES_TRUST_SAFETY } from "@/constants";

const DEFAULT_SORTS = sortBy(USER_FIELDS.CREATED_AT);

/**
 * The non-negotiable scope of this endpoint. Always present, first.
 *
 * This used to be built by `buildSieveFilters(["role==employee", rawFilters])`,
 * whose entry shape is `[expression, value]` and which therefore CONCATENATED
 * the two rather than joining them: applying any filter chip produced
 * `role==employeestatus==active` — one malformed clause matching nothing, so
 * the team list silently emptied the moment an admin filtered it. It looked
 * correct only because the fallback path (no chip) never exercised the join.
 */
const EMPLOYEE_ONLY = `${USER_FIELDS.ROLE}==employee`;

const inviteSchema = z.object({
  email: z.string().email(),
  permissionGroup: z.string().default("custom"),
  permissions: z.array(z.string()).default([]),
});

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_TRUST_SAFETY],
    permission: "admin:team:read",
    handler: async ({ request }) => {
      const searchParams = getSearchParams(request);
      const page = getNumberParam(searchParams, "page", 1, { min: 1 });
      const pageSize = getNumberParam(searchParams, "pageSize", 25, { min: 1, max: 50 });
      const sorts = getStringParam(searchParams, "sorts") || DEFAULT_SORTS;
      const rawFilters = getStringParam(searchParams, "filters") || "";
      const q = (getStringParam(searchParams, "q") || "").trim().toLowerCase();

      const effectiveFilters =
        [EMPLOYEE_ONLY, rawFilters].filter(Boolean).join(",");

      const result = await userRepository.list({
        filters: effectiveFilters,
        sorts,
        page,
        pageSize,
      });

      type RawUser = (typeof result.items)[number] & {
        permissionGroup?: string;
        permissions?: string[];
        updatedAt?: JsonValue;
      };

      /*
        * REVEALED: an admin managing the team needs a real address to contact
        * a colleague. `userRepository.list` is ciphertext-by-default, so this
        * column rendered `enc:v1:` blobs.
        */
      const serialize = (u: RawUser) => ({
        id: u.id || u.uid,
        uid: u.uid,
        email: userRepository.revealUser(u).email,
        displayName: u.displayName,
        photoURL: u.photoURL,
        role: u.role,
        permissionGroup: u.permissionGroup,
        permissions: u.permissions ?? [],
        disabled: u.disabled,
        [USER_FIELDS.IS_TESTER]: Boolean(u.isTester),
        [USER_FIELDS.CAN_TEST_ADMIN]: Boolean(u.canTestAdmin),
        createdAt:
          u.createdAt instanceof Date
            ? u.createdAt.toISOString()
            : (u.createdAt as { toDate?(): Date })?.toDate?.()?.toISOString() ??
              String(u.createdAt),
        updatedAt:
          u.updatedAt instanceof Date
            ? (u.updatedAt as Date).toISOString()
            : (u.updatedAt as { toDate?(): Date })?.toDate?.()?.toISOString() ??
              null,
      });

      const users = q
        ? result.items
            .map((u) => serialize(u as RawUser))
            /*
             * 🛑 Filters AFTER `serialize`, which is where the reveal happens.
             *
             * This compared `u.email` straight off the document. That field is
             * ciphertext since the PII sweep, so the admin team email search
             * matched NOTHING for every query — zero rows, a 200, and no error
             * anywhere. Serializing first means the comparison sees the same
             * plaintext the response does, so the filter and the rendered list
             * can never disagree.
             */
            .filter(
              (u) =>
                (u.displayName ?? "").toLowerCase().includes(q) ||
                (u.email ?? "").toLowerCase().includes(q),
            )
        : result.items.map((u) => serialize(u as RawUser));

      return successResponse({
        items: users,
        total: q ? users.length : result.total,
        meta: { page: result.page, pageSize: result.pageSize, total: result.total },
      });
    },
  }),
);

export const POST = withProviders(
  createRouteHandler<z.infer<typeof inviteSchema>>({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    permission: "admin:team:write",
    schema: inviteSchema,
    handler: async ({ body, user: adminUser }) => {
      const { email, permissionGroup, permissions } = body!;

      serverLogger.info("Admin inviting employee", {
        adminId: adminUser!.uid,
        permissionGroup,
      });

      const providers = getProviders();
      let uid: string;
      let isNewUser = false;

      // Try to find existing Firestore user by email first
      const existing = await userRepository.findByEmail(email);
      if (existing) {
        uid = existing.uid || existing.id || "";
      } else {
        // Create new Firebase Auth account + Firestore doc
        const tempPassword =
          crypto.randomUUID().replace(/-/g, "").slice(0, 12) + "Aa1!";
        const namePart = email.split("@")[0];
        const created = await providers.auth.createUser({
          email,
          password: tempPassword,
          displayName: namePart,
          emailVerified: false,
        });
        uid = created.uid;
        isNewUser = true;
      }

      const update: UserAdminUpdateInput = {
        role: "employee",
        permissionGroup: permissionGroup as UserAdminUpdateInput["permissionGroup"],
        permissions: permissions as UserAdminUpdateInput["permissions"],
      };

      await adminUpdateUser(adminUser!.uid, uid, update);

      return successResponse(
        { uid, email, permissionGroup, isNewUser },
        "Employee invited",
      );
    },
  }),
);
