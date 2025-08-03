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

  // Filter orders and extract only returned items
  const ordersWithReturnedItems = rows
    .map((order) => {
      // Filter items that have been returned
      const returnedItems =
        order.items?.filter((item) => {
          return item.detail?.return_received_quantity > 0;
        }) || [];

      // Only include orders that have returned items
      if (returnedItems.length === 0) {
        return null;
      }

      // Create a new order object with only returned items
      return {
        id: order.id,
        display_id: order.display_id,
        status: order.status,
        currency_code: order.currency_code,
        created_at: order.created_at,
        updated_at: order.updated_at,
        total: order.total,
        subtotal: order.subtotal,
        tax_total: order.tax_total,
        shipping_total: order.shipping_total,
        discount_total: order.discount_total,
        // Only include returned items
        items: returnedItems,
        // Include order metadata
        metadata: order.metadata,
        // Include addresses if needed
        shipping_address: order.shipping_address,
        billing_address: order.billing_address,
      };
    })
    .filter(Boolean); // Remove null entries (orders with no returned items)

  res.json({
    returnedOrders: ordersWithReturnedItems as unknown as HttpTypes.StoreOrder[],
    count: ordersWithReturnedItems.length,
  });
};
