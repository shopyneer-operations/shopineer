import { model } from "@medusajs/framework/utils";

export const Together = model.define("together", {
  id: model.id().primaryKey(),
  product_id_1: model.text(),
  product_id_2: model.text(),
  frequency: model.number(),
});
