import { model } from "@medusajs/framework/utils";

export type Permission = {
  name: string;
  path: string;
  method: "POST" | "GET" | "PUT" | "PATCH" | "DELETE";
};

export const Role = model.define("role", {
  id: model.id().primaryKey(),
  name: model.text(),
  permissions: model.json(),
});
