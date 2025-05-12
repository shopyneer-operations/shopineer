import { SubscriberArgs, type SubscriberConfig } from "@medusajs/framework";
import { Modules } from "@medusajs/framework/utils";
import { FACEBOOK_MODULE } from "../modules/facebook";
import FacebookModuleService from "../modules/facebook/service";

export default async function productCreatedHandler({ event: { data }, container }: SubscriberArgs<{ id: string }>) {
  const logger = container.resolve("logger");
  const query = container.resolve("query");
  const facebookService: FacebookModuleService = container.resolve(FACEBOOK_MODULE);
  const storeService = container.resolve(Modules.STORE);

  try {
    const stores = await storeService.listStores();

    if (stores.length == 0 || !stores[0].metadata?.sync_fb_catalog) {
      logger.info(`Product ${data.id} not synced to Facebook catalog because store is not configured`);
      return;
    }

    logger.info(`Syncing product ${data.id} to Facebook catalog...`);

    // Retrieve the product with its details
    const { data: products } = await query.graph({
      entity: "product",
      fields: ["*", "variants.*", "variants.price_set.*", "variants.price_set.prices.*"],
      filters: {
        id: data.id,
      },
    });

    const product = products[0];
    if (!product) {
      throw new Error(`Product with ID ${data.id} not found`);
    }

    // Add the product to Facebook catalog
    const result = await facebookService.addProductToCatalog(product as any);

    logger.info(`Successfully synced product ${data.id} to Facebook catalog`);
    return result;
  } catch (error) {
    logger.error(`Failed to sync product ${data.id} to Facebook catalog: ${error.message}`);
    throw error;
  }
}

export const config: SubscriberConfig = {
  event: "product.created",
};
