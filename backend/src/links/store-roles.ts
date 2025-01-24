import { defineLink } from "@medusajs/framework/utils";
import StoreModle from "@medusajs/medusa/store";
import RbacModule from "src/modules/rbac";

export default defineLink(StoreModle.linkable.store, {
  linkable: RbacModule.linkable.role,
  isList: true,
});
