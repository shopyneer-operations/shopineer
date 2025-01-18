import { model } from "@medusajs/framework/utils";

export const Supplier = model.define("supplier", {
  id: model.id().primaryKey(),
  name: model.text(),
  contact_person: model.text().nullable(),
  email: model.text().nullable(),
  phone: model.text().nullable(),
});
