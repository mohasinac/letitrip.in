import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { orderRepository } from "@mohasinac/appkit";
import { ROUTES } from "@mohasinac/appkit/client";
import { Section, Container, Row, Text } from "@mohasinac/appkit/client";
import { OrderViewClient } from "./OrderViewClient";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminOrderViewPage({ params }: Props) {
  const { id } = await params;
  const order = await orderRepository.findById(id).catch(() => null);
  if (!order) return notFound();

  return (
    <Section padding="y-xl">
      <Container>
        <Row className="mb-2" gap="sm">
          <Link
            href={String(ROUTES.ADMIN.ORDERS)}
            className="text-[length:var(--appkit-text-sm)] text-[var(--appkit-color-text-muted)] hover:text-[var(--appkit-color-text)]"
          >
            ← Orders
          </Link>
        </Row>
        <Text weight="medium" size="lg" className="mb-4">
          Order {order.id}
        </Text>
        <OrderViewClient
          orderId={order.id}
          orderLabel={`Order ${order.id}`}
          currentStatus={order.status}
          items={(order.items ?? []).map((item) => ({
            productId: item.productId,
            title: item.productTitle,
            image: item.image,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
          }))}
          paymentProofUrl={order.paymentProofUrl}
          paymentTransactionId={order.paymentTransactionId}
          paymentMethod={order.paymentMethod}
          paymentStatus={order.paymentStatus}
          displayedUpiId={order.displayedUpiId}
          buyerReportedUpiId={order.buyerReportedUpiId}
          paymentUpiMismatch={order.paymentUpiMismatch}
          buyerMarkedPaid={order.buyerMarkedPaid}
          buyerFraudAgreementAccepted={order.buyerFraudAgreementAccepted}
        />
      </Container>
    </Section>
  );
}
