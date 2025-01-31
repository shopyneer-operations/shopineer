import { values } from "lodash";
import { Permission, PermissionType } from "../types/role";

export enum Resource {
  "orders" = "orders",
  "products" = "products",
  "product-variants" = "product-variants",
  "product-categories" = "product-categories",
  "product-types" = "product-types",
  "product-tags" = "product-tags",
  "variants" = "variants",
  "collections" = "collections",
  "categories" = "categories",
  "inventory" = "inventory",
  "stock-locations" = "stock-locations",
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
  "tax-regions" = "tax-regions",
  "roles" = "roles",
  "notifications" = "notifications",
  "return-reasons" = "return-reasons",
  "claims" = "claims",
  "returns" = "returns",
  "exchanges" = "exchanges",
  "order-edits" = "order-edits",
  "fulfilments" = "fulfilments",
  "invites" = "invites",
  "price-preferences" = "price-preferences",
}

export const permissions: Permission[] = values(Resource).flatMap(function allMethods(resource) {
  return values(PermissionType).map((method) => ({
    name: resource,
    path: `^/${resource}.*`,
    method,
  }));
});

export const uiMethodMapper = {
  [PermissionType.GET]: "View",
  [PermissionType.POST]: "Create",
  [PermissionType.PUT]: "Update",
  [PermissionType.DELETE]: "Delete",
};
