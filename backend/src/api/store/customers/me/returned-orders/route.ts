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

  //   const returnedOrders = customer.orders.filter((order) => order.status === "returned");

  res.json({ returned_orders: customer.orders });
};
