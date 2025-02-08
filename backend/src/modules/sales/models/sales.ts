import { model } from "@medusajs/framework/utils";

export const Sales = model.define("sales", {
  id: model.id().primaryKey(),
  sales: model.number(),
});
