import { values } from "lodash";
import { Permission, PermissionType } from "../types/permission";

export enum Resource {
  "orders" = "orders",
  "products" = "products",
  "collections" = "collections",
  "categories" = "categories",
  "inventory" = "inventory",
  "reservations" = "reservations",
  "customers" = "customers",
  "customer-groups" = "customer-groups",
  "promotions" = "promotions",
  "campaigns" = "campaigns",
  "price-lists" = "price-lists",
  "brands" = "brands",
  "suppliers" = "suppliers",
  "users" = "users",
  "api-keys" = "api-keys",
  "stores" = "stores",
  "locations" = "locations",
  "regions" = "regions",
  "sales-channels" = "sales-channels",
  "shipping-profiles" = "shipping-profiles",
  "tax-rates" = "tax-rates",
}

export const permissions: Permission[] = values(Resource).flatMap(function allMethods(resource) {
  return values(PermissionType).map((method) => ({
    name: resource,
    path: new RegExp(`/${resource}`).toString(),
    method,
  }));
});
