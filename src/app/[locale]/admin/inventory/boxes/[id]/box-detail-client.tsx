"use client";

import { useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  CardBody,
  Div,
  Heading,
  Row,
  Stack,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useToast,
} from "@mohasinac/appkit/client";
import { apiClient } from "@mohasinac/appkit/client";
// 🛑 From `/ui`, not `/client` — the client entry does not re-export it, and
// importing a name a barrel does not have fails only when something compiles
// this file, which no gate in this session does.
import { QuantityStepper } from "@mohasinac/appkit/ui";
import { ADMIN_ENDPOINTS } from "@mohasinac/appkit/constants/api-endpoints";
import { operatorMessage } from "@mohasinac/appkit/features/inventory/components/operator-message";

interface Placement {
  productId: string;
  productTitle: string;
  productSku: string | null;
  quantity: number;
  slot: string | null;
}

interface Movement {
  id: string;
  kind: string;
  quantity: number;
  productTitle: string;
  fromBoxCode: string | null;
  toBoxCode: string | null;
  occurredAt: string;
  reason: string | null;
}

export interface BoxDetailClientProps {
  boxId: string;
  boxCode: string;
  status: string;
  placements: Placement[];
  movements: Movement[];
  placementsFailed: boolean;
  movementsFailed: boolean;
}

/**
 * What is in a box, what has moved, and the one write this page offers: pick.
 *
 * 🛑 PICK IS MANUAL HERE BY DESIGN. It does not fire from checkout, because an
 * automatic decrement would have the ledger assert a movement nobody
 * performed — the stock is sold, but it is still in the box until a person
 * walks over and takes it out. A ledger of intentions cannot find a missing
 * item, which is its only real job.
 */
export function BoxDetailClient({
  boxId,
  boxCode,
  status,
  placements,
  movements,
  placementsFailed,
  movementsFailed,
}: BoxDetailClientProps) {
  const { showToast } = useToast();
  const [picking, setPicking] = useState<string | null>(null);
  const [qty, setQty] = useState<Record<string, number>>({});

  const totalUnits = placements.reduce((n, p) => n + p.quantity, 0);

  async function pick(p: Placement) {
    const n = qty[p.productId] ?? 1;
    setPicking(p.productId);
    try {
      await apiClient.post(ADMIN_ENDPOINTS.INVENTORY_PLACEMENTS, {
        op: "pick",
        boxId,
        productId: p.productId,
        quantity: n,
      });
      showToast(`${n} × ${p.productTitle} picked from ${boxCode}`, "success");
      // A full reload, deliberately: the ledger below and the contents above
      // both changed, and re-deriving them client-side is two more sources of
      // truth for one write.
      window.location.reload();
    } catch (err) {
      // 4xx keeps the server's words ("AC60-03 holds 2, cannot pick 5");
      // anything else terminates in a constant. See operator-message.ts.
      showToast(operatorMessage(err), "error");
    } finally {
      setPicking(null);
    }
  }

  return (
    <Stack gap="comfortable">
      <Row align="center" gap="sm" wrap>
        <Badge variant={status === "active" ? "success" : "warning"}>
          {status}
        </Badge>
        <Text size="sm" color="muted">
          {placements.length} product{placements.length === 1 ? "" : "s"} ·{" "}
          {totalUnits} unit{totalUnits === 1 ? "" : "s"}
        </Text>
      </Row>

      {/*
        🛑 A FAILED READ SAYS SO. An empty box and a broken page look identical
        otherwise, and "nothing in here" about a box holding eight things is
        the worst thing this screen could claim — the same reasoning the
        sticker tracer's `refreshRuns` records for its own history panel.
      */}
      {placementsFailed && (
        <Alert variant="warning">
          Could not load this box&apos;s contents. The list below is not
          empty — it is unknown.
        </Alert>
      )}

      <Card variant="default">
        <CardBody>
          <Heading level={2} size="lg">
            Contents
          </Heading>
          {placements.length === 0 && !placementsFailed ? (
            <Text color="muted">
              Nothing in this box yet. Stock arrives here through a shipment
              receive, or an adjustment.
            </Text>
          ) : (
            <Table>
              <Thead>
                <Tr>
                  <Th>Product</Th>
                  <Th>SKU</Th>
                  <Th>Slot</Th>
                  <Th>Qty</Th>
                  <Th>Pick</Th>
                </Tr>
              </Thead>
              <Tbody>
                {placements.map((p) => (
                  <Tr key={p.productId}>
                    <Td>{p.productTitle}</Td>
                    <Td>{p.productSku ?? "—"}</Td>
                    <Td>{p.slot ?? "—"}</Td>
                    <Td>{p.quantity}</Td>
                    <Td>
                      <Row align="center" gap="xs">
                        <QuantityStepper
                          value={qty[p.productId] ?? 1}
                          onChange={(n) =>
                            setQty((prev) => ({ ...prev, [p.productId]: n }))
                          }
                          min={1}
                          /*
                           * Capped at what the box holds, so the stepper
                           * cannot express a pick the server will refuse with
                           * a 409. A control that can ask for the impossible
                           * is a control that teaches the operator to ignore
                           * errors.
                           */
                          max={p.quantity}
                        />
                        <Button
                          variant="outline"
                          isLoading={picking === p.productId}
                          onClick={() => void pick(p)}
                        >
                          Pick
                        </Button>
                      </Row>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          )}
        </CardBody>
      </Card>

      <Card variant="default">
        <CardBody>
          <Heading level={2} size="lg">
            Movements
          </Heading>
          {movementsFailed && (
            <Alert variant="warning">
              Could not load the movement history for this box.
            </Alert>
          )}
          {movements.length === 0 && !movementsFailed ? (
            <Text color="muted">Nothing has moved in or out of this box.</Text>
          ) : (
            <Stack gap="xs">
              {movements.map((m) => (
                <Div key={m.id}>
                  <Text size="sm">
                    {m.quantity} × {m.productTitle} — {m.kind}
                    {m.fromBoxCode ? ` from ${m.fromBoxCode}` : ""}
                    {m.toBoxCode ? ` to ${m.toBoxCode}` : ""}
                  </Text>
                  <Text size="xs" color="muted">
                    {new Date(m.occurredAt).toLocaleString("en-IN")}
                    {m.reason ? ` · ${m.reason}` : ""}
                  </Text>
                </Div>
              ))}
            </Stack>
          )}
        </CardBody>
      </Card>
    </Stack>
  );
}
