import { model } from "@medusajs/framework/utils";

export const ProductSales = model.define("product_sales", {
  id: model.id().primaryKey(),
  sales: model.number(),
});
