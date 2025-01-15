import { model } from "@medusajs/framework/utils";

export const Supplier = model.define("supplier", {
  id: model.id().primaryKey(),
  name: model.text(),
});
