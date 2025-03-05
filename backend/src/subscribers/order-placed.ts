import { Modules } from "@medusajs/framework/utils";
import { INotificationModuleService, IOrderModuleService } from "@medusajs/framework/types";
import { SubscriberArgs, SubscriberConfig } from "@medusajs/medusa";
import { EmailTemplates } from "../modules/email-notifications/templates";
import fp from "lodash/fp";
import TogetherModuleService from "../modules/together/service";
import { TOGETHER_MODULE } from "../modules/together";
import SalesModuleService from "../modules/sales/service";
import { SALES_MODULE } from "../modules/sales";

function getUniquePairs(arr: string[]): [string, string][] {
  if (arr.length < 2) return [];

  const pairs: [string, string][] = [];

  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      pairs.push([arr[i], arr[j]]);
    }
  }

  return pairs;
}

export default async function orderPlacedHandler({ event: { data }, container }: SubscriberArgs<any>) {
  const notificationModuleService: INotificationModuleService = container.resolve(Modules.NOTIFICATION);
  const orderModuleService = container.resolve(Modules.ORDER);

  const order = await orderModuleService.retrieveOrder(data.id, {
    relations: ["items", "summary", "shipping_address"],
  });
  const shippingAddress = await (orderModuleService as any).orderAddressService_.retrieve(order.shipping_address.id);

  try {
    await notificationModuleService.createNotifications({
      to: order.email,
      channel: "email",
      template: EmailTemplates.ORDER_PLACED,
      data: {
        emailOptions: {
          replyTo: "info@example.com",
          subject: "Your order has been placed",
        },
        order,
        shippingAddress,
        preview: "Thank you for your order!",
      },
    });
  } catch (error) {
    console.error("Error sending order confirmation notification:", error);
  }

  // bought toghether
  (async function updateBoughtTogether() {
    const logger = container.resolve("logger");
    const togetherModuleService: TogetherModuleService = container.resolve(TOGETHER_MODULE);
    const idPairs = fp.flow(fp.map("product_id"), fp.uniq, getUniquePairs)(order.items);

    const activityId = logger.activity(
      `🔵 boughtTogether: Updating bought together frequencies based on order ID: ${order.id} with item pairs: ${idPairs}`
    );

    if (idPairs.length == 0) {
      return logger.success(activityId, `🟢 boughtTogether: No bought together pairs found for order ID: ${order.id}`);
    }

    try {
      for (const [id1, id2] of idPairs) {
        const pairFromDB = await (async function find() {
          let result = await togetherModuleService.listTogethers({
            product_id_1: [id1],
            product_id_2: [id2],
          });
          if (result.length > 0) return result[0];

          result = await togetherModuleService.listTogethers({
            product_id_1: [id2],
            product_id_2: [id1],
          });
          if (result.length > 0) return result[0];

          return null;
        })();

        if (pairFromDB) {
          logger.progress(activityId, `🔵 boughtTogether: Found pair: ${id1} and ${id2}. Will increase frequency`);

          const updateResult = await togetherModuleService.updateTogethers({
            id: pairFromDB.id,
            frequency: pairFromDB.frequency + 1,
          });

          logger.success(
            activityId,
            `🟢 boughtTogether: Updated pair: ${id1} and ${id2}. New frequency: ${updateResult.frequency}`
          );
        } else {
          logger.progress(activityId, `🔵 boughtTogether: pair: ${id1} and ${id2} doesn't exist. Will create one`);

          const createResult = await togetherModuleService.createTogethers({
            product_id_1: id1,
            product_id_2: id2,
            frequency: 1,
          });

          logger.success(
            activityId,
            `🟢 boughtTogether: Created pair: ${id1} and ${id2}. ${JSON.stringify(createResult)}`
          );
        }
      }
    } catch (error) {
      logger.failure(activityId, `🔴 boughtTogether: Error: ${error.message}`);
    }
  })();

  // Track product sales
  (async function updateProductSales() {
    const logger = container.resolve("logger");
    const salesModuleService: SalesModuleService = container.resolve(SALES_MODULE);

    const activityId = logger.activity(`🔵 sales: Incrementing product sales for order: ${order.id}`);

    try {
      for (const item of order.items) {
        await salesModuleService.incrementProductSales(item.product_id, item.quantity);
      }

      logger.success(activityId, `🟢 sales: Incremented product sales for order: ${order.id}`);
    } catch (error) {
      logger.failure(
        activityId,
        `🔴 sales: Error incrementing product sales for order: ${order.id}. Error: ${error.message}`
      );
    }
  })();
}

export const config: SubscriberConfig = {
  event: "order.placed",
};
