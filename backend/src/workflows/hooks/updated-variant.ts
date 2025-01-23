import { updateProductVariantsWorkflow } from "@medusajs/core-flows";
import { Modules } from "@medusajs/framework/utils";
import { StepResponse } from "@medusajs/framework/workflows-sdk";
import { map } from "lodash";
import { UPDATE } from "src/modules/update";
import UpdateService from "src/modules/update/service";

updateProductVariantsWorkflow.hooks.productVariantsUpdated(async function addPriceUpdate(
  { product_variants },
  { container }
) {
  const logger = container.resolve("logger");
  const query = container.resolve("query");
  const link = container.resolve("remoteLink");
  const UpdateService: UpdateService = container.resolve(UPDATE);

  console.log("1️⃣");

  const result = await Promise.all(
    product_variants.map(async function insertPriceUpdate(variant) {
      const insertResult = await UpdateService.createUpdates({
        prices: variant.price_set,
      });

      console.log("🤯🤯🤯🤯🤯🤯", insertResult);

      const linkResult = await link.create({
        [Modules.PRODUCT]: {
          product_variant_id: variant.id,
        },
        update: {
          update_id: insertResult.id,
        },
      });

      console.log("🤯🤯🤯", linkResult);

      return insertResult;
    })
  );

  return new StepResponse([], []);
});
