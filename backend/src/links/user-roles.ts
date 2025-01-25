import { defineLink } from "@medusajs/framework/utils";
import UserModule from "@medusajs/medusa/user";
import RoleModule from "src/modules/role";

export default defineLink({ linkable: UserModule.linkable.user, isList: true }, RoleModule.linkable.role);
