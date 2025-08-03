import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

export const GET = async (req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

  const {
    data: [customer],
  } = await query.graph({
    entity: "customer",
    fields: ["orders.id"],
    filters: { id: [req.auth_context.actor_id] },
  });

  const { data } = await query.graph({
    entity: "return",
    fields: ["*", "items.*", "items.reason.*"],
    filters: { order_id: customer.orders.map((order) => order.id) },
  });

  res.json({
    returnedOrders: data,
  });
};
