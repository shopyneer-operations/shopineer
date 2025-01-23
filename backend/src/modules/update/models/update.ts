import { model } from "@medusajs/framework/utils";

export const Update = model.define("update", {
  id: model.id().primaryKey(),
  prices: model.json(),
});
