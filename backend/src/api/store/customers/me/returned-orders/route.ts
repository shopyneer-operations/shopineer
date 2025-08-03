import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

export const GET = async (req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
  const {
    data: [customer],
  } = await query.graph({
    entity: "customer",
    fields: ["orders.*"],
    filters: { id: req.auth_context.actor_id },
  });

  // Filter orders that have returned items
  const returnedOrders = customer.orders.filter((order) => {
    // Check if any line item has returned quantity
    return order.items?.some((item) => {
      // Check if the item detail has return_received_quantity > 0
      return item.detail?.return_received_quantity > 0;
    });
  });

  res.json({ returned_orders: returnedOrders });
};
