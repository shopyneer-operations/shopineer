import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import _ from "lodash";

export const GET = async (req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

  const {
    data: [customer],
  } = await query.graph({
    entity: "customer",
    fields: ["orders.id", "orders.items.id", "orders.items.title", "orders.items.subtitle", "orders.items.thumbnail"],
    filters: { id: [req.auth_context.actor_id] },
  });

  const { data } = await query.graph({
    entity: "return",
    fields: ["*", "items.*", "items.reason.*"],
    filters: { order_id: customer.orders.map((order) => order.id) },
  });

  // Create a map of order items with their details for easy lookup
  const orderItemsMap = new Map();
  customer.orders.forEach((order) => {
    order.items?.forEach((item) => {
      const key = `${order.id}_${item.id}`;
      orderItemsMap.set(key, {
        title: item.title,
        subtitle: item.subtitle,
        thumbnail: item.thumbnail,
      });
    });
  });

  // Merge the title, subtitle, and thumbnail to returned items
  const enrichedReturns = data.map((returnItem) => {
    const enrichedItems = returnItem.items?.map((item) => {
      const key = `${returnItem.order_id}_${item.item_id}`;
      const orderItemDetails = orderItemsMap.get(key);

      return {
        ...item,
        title: orderItemDetails?.title || null,
        subtitle: orderItemDetails?.subtitle || null,
        thumbnail: orderItemDetails?.thumbnail || null,
      } as any; // Type assertion to allow additional properties
    });

    return {
      ...returnItem,
      items: enrichedItems,
    };
  });

  res.json({
    returnedOrders: enrichedReturns,
  });
};
