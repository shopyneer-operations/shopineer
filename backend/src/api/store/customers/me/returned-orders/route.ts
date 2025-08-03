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

  const { rows, metadata } = result as {
    rows: OrderDTO[];
    metadata: any;
  };

  const returnedOrders = rows.filter((order) => {
    return order.items?.some((item) => {
      return item.detail?.return_received_quantity > 0;
    });
  });

  res.json({
    orders: returnedOrders as unknown as HttpTypes.StoreOrder[],
    count: metadata.count,
    offset: metadata.skip,
    limit: metadata.take,
  });
  //   const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
  //   const {
  //     data: [customer],
  //   } = await query.graph({
  //     entity: "customer",
  //     fields: ["orders.*"],
  //     filters: { id: req.auth_context.actor_id },
  //   });

  //   // Filter orders that have returned items
  //   const returnedOrders = customer.orders.filter((order) => {
  //     // Check if any line item has returned quantity
  //     return order.items?.some((item) => {
  //       // Check if the item detail has return_received_quantity > 0
  //       return item.detail?.return_received_quantity > 0;
  //     });
  //   });

  //   res.json({ returned_orders: returnedOrders });
};
