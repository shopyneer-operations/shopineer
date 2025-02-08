import { model } from "@medusajs/framework/utils";

export const ProductSales = model.define("sales", {
  id: model.id().primaryKey(),
  sales: model.number(),
});
