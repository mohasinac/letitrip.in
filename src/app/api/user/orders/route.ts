import { withProviders } from "@/providers.config";
import {
  orderRepository,
  successResponse,
  createRouteHandler,
  getSearchParams,
  getStringParam,
  serverLogger,
  type OrderStatus,
  OrderStatusValues,
  orderDocumentToOrder,
  sortBy,
  ORDER_FIELDS,
} from "@mohasinac/appkit";

const VALID_STATUSES: OrderStatus[] = [
  OrderStatusValues.PENDING,
  OrderStatusValues.CONFIRMED,
  OrderStatusValues.SHIPPED,
  OrderStatusValues.DELIVERED,
  OrderStatusValues.CANCELLED,
  OrderStatusValues.RETURNED,
];

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    handler: async ({ user, request }) => {
      const searchParams = getSearchParams(request);
      const statusParam = getStringParam(searchParams, "status");
      const pageParam = getStringParam(searchParams, "page") ?? "1";
      const perPageParam = getStringParam(searchParams, "perPage") ?? "12";

      const filters =
        statusParam && VALID_STATUSES.includes(statusParam as OrderStatus)
          ? `status==${statusParam}`
          : undefined;

      const result = await orderRepository.listForUser(user!.uid, {
        filters,
        sorts: sortBy(ORDER_FIELDS.ORDER_DATE),
        page: pageParam,
        pageSize: perPageParam,
      });

      serverLogger.info("Orders listed", {
        userId: user!.uid,
        count: result.total,
      });

      return successResponse({
        items: result.items.map(orderDocumentToOrder),
        total: result.total,
        page: result.page,
        perPage: result.pageSize,
        totalPages: result.totalPages,
      });
    },
  }),
);
