import { createProductsWorkflow } from "@medusajs/core-flows";
import { LinkDefinition } from "@medusajs/framework/types";
import { Modules } from "@medusajs/framework/utils";
import { StepResponse } from "@medusajs/framework/workflows-sdk";
import { eq, map } from "lodash";
import { SUPPLIER_MODULE } from "src/modules/supplier";

createProductsWorkflow.hooks.productsCreated(
  async function ({ products, additional_data }, { container }) {
    const logger = container.resolve("logger");

    if (!additional_data?.supplier_id) {
      return new StepResponse([], []);
    }

    const activityId = logger.activity(
      `🔵 productsCreated hook: Creating links for products: ${products.map((p) => p.id)} with supplier: ${
        additional_data.supplier_id
      }`
    );

    // const SupplierModuleService: SupplierModuleService = container.resolve(SUPPLIER_MODULE);

    // await SupplierModuleService.retrieveSupplier(additional_data.supplier_id as string);

    const link = container.resolve("remoteLink");
    const links: LinkDefinition[] = map(products, function link(product) {
      return {
        [Modules.PRODUCT]: {
          product_id: product.id,
        },
        [SUPPLIER_MODULE]: {
          supplier_id: additional_data.supplier_id,
        },
      };
    });

    const result = await link.create(links);

    logger.success(
      activityId,
      `🟢 productsCreated hook: Successfully created links for products: ${products.map((p) => p.id)} with supplier: ${
        additional_data.supplier_id
      }`
    );

    return new StepResponse(links, links);
  },
  async function rollBack(links, { container }) {
    if (eq(links.length, 0)) return;

    const link = container.resolve("remoteLink");

    await link.dismiss(links);
  }
);
