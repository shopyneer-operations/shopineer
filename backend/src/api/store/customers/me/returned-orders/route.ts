import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

export const GET = async (req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

  const data = await query.graph({
    entity: "return",
    fields: ["items.*", "items.reason.*"],
    filters: {
      id: [req.auth_context.actor_id],
    },
  });

  res.json({
    returnedOrders: data,
  });
};
