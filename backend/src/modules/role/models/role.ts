import { model } from "@medusajs/framework/utils";

export type Permission = {
  /**
   * e.g. orders
   */
  name: string;

  /**
   * e.g. /^\/orders/
   */
  path: string;

  /**
   * e.g. POST
   */
  method: PermissionType;
};

export enum PermissionType {
  "POST" = "POST",
  "GET" = "GET",
  "PUT" = "PUT",
  "DELETE" = "DELETE",
}

export const Role = model.define("role", {
  id: model.id().primaryKey(),
  name: model.text(),
  permissions: model.json(),
});
