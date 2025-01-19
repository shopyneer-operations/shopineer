import { updateProductsWorkflow } from "@medusajs/core-flows";
import { LinkDefinition } from "@medusajs/framework/types";
import { Modules } from "@medusajs/framework/utils";
import { StepResponse } from "@medusajs/framework/workflows-sdk";
import { filter, map } from "lodash";
import { SUPPLIER_MODULE } from "src/modules/supplier";

updateProductsWorkflow.hooks.productsUpdated(
  async function ({ products, additional_data }, { container }) {
    const logger = container.resolve("logger");

    if (!additional_data?.supplier_id) {
      return new StepResponse([], []);
    }

    const activityId = logger.activity(
      `🔵 productsUpdated hook: Creating links for products: ${products.map((p) => p.id)} with supplier: ${
        additional_data.supplier_id
      }`
    );

    // 1. Use query module to retreive the products, each with its supplier
    const query = container.resolve("query");
    const { data } = await query.graph({
      entity: "product",
      fields: ["supplier.*"],
      filters: { id: map(products, "id") },
    });
    const productWithSuppliers = filter(data, "supplier.id");

    // 2. Dismiss existing links between each product and its suppliers
    const link = container.resolve("remoteLink");
    await link.dismiss(
      map(productWithSuppliers, function unlink(product: any) {
        return {
          [Modules.PRODUCT]: {
            product_id: product.id,
          },
          [SUPPLIER_MODULE]: {
            supplier_id: product.supplier.id,
          },
        };
      })
    );

    logger.progress(
      activityId,
      `🔵 productsUpdated hook: Dismissed links for products: ${map(productWithSuppliers, "id")} with supplier: ${map(
        productWithSuppliers,
        "supplier.id"
      )}`
    );

    // 3. Create new links between each product and the new supplier
    const links = await link.create(
      map(products, function link(product) {
        return {
          [Modules.PRODUCT]: {
            product_id: product.id,
          },
          [SUPPLIER_MODULE]: {
            supplier_id: additional_data.supplier_id,
          },
        };
      })
    );

    logger.success(
      activityId,
      `🟢 productsCreated hook: Successfully created links for products: ${products.map((p) => p.id)} with supplier: ${
        additional_data.supplier_id
      }`
    );

    return new StepResponse(links, links);
  },
  async function rollBack(links, { container }) {
    // if (eq(links.length, 0)) return;
    // const link = container.resolve("remoteLink");
    // await link.dismiss(links);
  }
);
