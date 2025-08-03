import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { OrderDTO, HttpTypes } from "@medusajs/framework/types";
import { getOrdersListWorkflow } from "@medusajs/medusa/core-flows";

export const GET = async (req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  const variables = {
    filters: {
      ...req.filterableFields,
      is_draft_order: false,
      customer_id: req.auth_context.actor_id,
    },
    ...req.queryConfig.pagination,
  };

  const workflow = getOrdersListWorkflow(req.scope);
  const { result } = await workflow.run({
    input: {
      fields: req.queryConfig.fields,
      variables,
    },
  });

  const { rows } = result as {
    rows: OrderDTO[];
    metadata: any;
  };

  const returnedOrders = rows.filter((order) => {
    return order.items?.some((item) => {
      return item.detail?.return_received_quantity > 0;
    });
  });

  res.json({
    returnedOrders: returnedOrders as unknown as HttpTypes.StoreOrder[],
    count: returnedOrders.length,
  });
};
