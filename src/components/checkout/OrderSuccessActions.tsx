import Link from "next/link";
import { THEME_CONSTANTS, UI_LABELS, ROUTES } from "@/constants";

const LABELS = UI_LABELS.ORDER_SUCCESS_PAGE;
const { themed } = THEME_CONSTANTS;

interface OrderSuccessActionsProps {
  orderId: string;
}

export function OrderSuccessActions({ orderId }: OrderSuccessActionsProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <Link
        href={ROUTES.USER.ORDER_DETAIL(orderId)}
        className="flex-1 text-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
      >
        {LABELS.VIEW_ORDER}
      </Link>
      <Link
        href={ROUTES.USER.ORDERS}
        className={`flex-1 text-center px-6 py-3 ${themed.bgSecondary} border ${themed.border} ${themed.textPrimary} rounded-lg font-medium hover:opacity-80 transition-opacity`}
      >
        {UI_LABELS.USER.ORDERS.TITLE}
      </Link>
      <Link
        href={ROUTES.PUBLIC.PRODUCTS}
        className={`flex-1 text-center px-6 py-3 ${themed.bgSecondary} border ${themed.border} ${themed.textPrimary} rounded-lg font-medium hover:opacity-80 transition-opacity`}
      >
        {LABELS.CONTINUE_SHOPPING}
      </Link>
    </div>
  );
}
