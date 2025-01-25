import { defineLink } from "@medusajs/framework/utils";
import StoreModle from "@medusajs/medusa/store";
import RoleModule from "src/modules/role";

export default defineLink(StoreModle.linkable.store, {
  linkable: RoleModule.linkable.role,
  isList: true,
});
